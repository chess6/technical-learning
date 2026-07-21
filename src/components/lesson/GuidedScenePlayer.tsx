import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import {
  useAutoplayOnceGuard,
  useShowGuidedDebug,
  useSubstantialVisibility,
} from "../../hooks/useGuidedPlayback";
import {
  createInitialState,
  type GuidedSceneEngine,
  type GuidedSceneEngineOptions,
  type GuidedSceneState,
  type GuidedSceneStep,
} from "../../guided-scenes/engine/types";
import { guidedSceneDebug } from "../../guided-scenes/engine/instrumentation";
import { getSceneMeta } from "../../guided-scenes/scenes/sceneMeta";
import { SCENE_ASPECT } from "../../guided-scenes/scenes/safeFrame";
import type { ClipPosition } from "./clipPosition";
import "./GuidedScenePlayer.css";

type GuidedSceneFactory = (options: GuidedSceneEngineOptions) => GuidedSceneEngine;

type GuidedScenePlayerProps = {
  sceneId: string;
  /** Stable engine factory; identity change triggers dispose + recreate. */
  createEngine: GuidedSceneFactory;
  title?: string;
  /**
   * Optional semantic seed. When set, seek to this major step after mount
   * (instead of t=0 / reduced-motion first stage). Backward compatible.
   */
  initialPosition?: ClipPosition;
  /** Fires when the active major step id changes. Backward compatible. */
  onClipPositionChange?: (position: ClipPosition) => void;
  /**
   * When false, skip autoplay-once (e.g. deliberately paused remounts).
   * Defaults to true — including expand-modal remounts, which should resume
   * autoplay once the canvas is substantially visible.
   */
  autoplayEnabled?: boolean;
};

/**
 * Autoplay rule (documented):
 * - Autoplay once when the canvas is substantially visible (≥55%) and
 *   prefers-reduced-motion is off.
 * - Navigating away disposes the engine; returning remounts and may autoplay
 *   once again (restart-on-remount).
 * - Reduced motion: seek to the first major stage (or final frame if none),
 *   no continuous playback; use Prev/Next idea.
 * - Page/tab hide pauses playback.
 */

export function GuidedScenePlayer({
  sceneId,
  createEngine,
  title,
  initialPosition,
  onClipPositionChange,
  autoplayEnabled = true,
}: GuidedScenePlayerProps) {
  const reducedMotion = usePrefersReducedMotion();
  const showDebug = useShowGuidedDebug();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const engineRef = useRef<GuidedSceneEngine | null>(null);
  const [state, setState] = useState<GuidedSceneState>(() =>
    createInitialState(true),
  );
  const [mounted, setMounted] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const autoplay = useAutoplayOnceGuard();
  const substantiallyVisible = useSubstantialVisibility(containerEl, 0.55);
  const lastReportedStepId = useRef<string | null>(null);
  /**
   * Seed/seek target (0..1) queued until the engine reports a non-zero
   * duration. Seeking immediately after mount can race the duration event and
   * silently land on frame 0 (the modal step-nav "stuck on recap" bug).
   */
  const pendingSeekRef = useRef<number | null>(null);
  const onClipPositionChangeRef = useRef(onClipPositionChange);
  onClipPositionChangeRef.current = onClipPositionChange;

  const meta = getSceneMeta(sceneId);
  const majorSteps =
    meta.majorSteps.length > 0 ? meta.majorSteps : meta.steps;

  const bindContainer = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    setContainerEl(node);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const engine = createEngine({ reducedMotion });
    engineRef.current = engine;
    const unsubscribe = engine.subscribe(setState);
    setMounted(false);
    autoplay.reset();
    lastReportedStepId.current = null;
    pendingSeekRef.current = null;

    void Promise.resolve(engine.mount(container)).then(() => {
      if (engineRef.current !== engine) return;
      setMounted(true);

      const seeded = initialPosition
        ? majorSteps.find((step) => step.id === initialPosition.majorStepId)
        : undefined;
      const target =
        seeded?.at ??
        (reducedMotion && engine.steps.length > 0
          ? (majorSteps[0] ?? engine.steps[0])?.at ?? null
          : null);
      if (target == null) return;
      if (target <= 0) {
        engine.seek(target);
        return;
      }
      // Queue; applied once the engine reports a real duration (see below).
      pendingSeekRef.current = target;
      if ((engine.getState().duration ?? 0) > 0) {
        engine.seek(target);
        pendingSeekRef.current = null;
      }
    });

    return () => {
      unsubscribe();
      engine.dispose();
      if (engineRef.current === engine) {
        engineRef.current = null;
      }
      setMounted(false);
    };
    // majorSteps is stable per sceneId; include sceneId via createEngine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createEngine, reducedMotion, retryToken]);

  // Flush a queued seed-seek once the engine reports a real duration. This
  // makes modal step-nav / scrubber seeking deterministic instead of racing
  // the duration event.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const target = pendingSeekRef.current;
    if (target == null) return;
    if ((state.duration ?? 0) <= 0) return;
    engine.seek(target);
    pendingSeekRef.current = null;
  }, [state.duration, mounted]);

  // Autoplay once when substantially visible.
  useEffect(() => {
    if (!autoplayEnabled) return;
    if (!mounted || reducedMotion) return;
    if (!substantiallyVisible) return;
    if (autoplay.hasFired()) return;
    const engine = engineRef.current;
    if (!engine) return;
    const status = engine.getState().status;
    if (status === "playing" || status === "complete") {
      autoplay.markFired();
      return;
    }
    autoplay.markFired();
    engine.play();
  }, [
    mounted,
    substantiallyVisible,
    reducedMotion,
    autoplay,
    autoplayEnabled,
  ]);

  // Pause when the page/tab is hidden or the scene scrolls out of view.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const onVisibility = (): void => {
      if (document.hidden) engine.pause();
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (!substantiallyVisible && engine.getState().status === "playing") {
      engine.pause();
    }

    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [substantiallyVisible, mounted]);

  const currentMajorIndex = majorStepIndex(majorSteps, state.progress);
  const currentMajorStepId =
    currentMajorIndex !== null
      ? majorSteps[currentMajorIndex]?.id
      : majorSteps[0]?.id;

  // Report semantic position changes (majorStepId primary).
  useEffect(() => {
    if (!currentMajorStepId) return;
    if (lastReportedStepId.current === currentMajorStepId) return;
    lastReportedStepId.current = currentMajorStepId;
    onClipPositionChangeRef.current?.({
      majorStepId: currentMajorStepId,
    });
  }, [currentMajorStepId]);

  const handlePlay = (): void => engineRef.current?.play();
  const handlePause = (): void => engineRef.current?.pause();
  const handleReplay = (): void => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.reset();
    if (!reducedMotion && autoplayEnabled) {
      // Allow a deliberate replay after reset.
      autoplay.markFired();
      engine.play();
    }
  };
  const handleSeek = (value: number): void => engineRef.current?.seek(value);

  const goPrevIdea = (): void => {
    if (currentMajorIndex === null || currentMajorIndex <= 0) {
      handleSeek(majorSteps[0]?.at ?? 0);
      return;
    }
    handleSeek(majorSteps[currentMajorIndex - 1]!.at);
  };

  const goNextIdea = (): void => {
    if (currentMajorIndex === null) {
      handleSeek(majorSteps[0]?.at ?? 0);
      return;
    }
    const next = Math.min(currentMajorIndex + 1, majorSteps.length - 1);
    handleSeek(majorSteps[next]!.at);
  };

  const stageTitle =
    currentMajorIndex !== null
      ? majorSteps[currentMajorIndex]?.title
      : majorSteps[0]?.title;

  const isPlaying = state.status === "playing";

  const majorCount = majorSteps.length;

  return (
    <figure
      className="guided-scene-player"
      data-scene-id={sceneId}
      data-major-step={currentMajorStepId ?? undefined}
      role="region"
      aria-label={title ?? "Guided animation"}
    >
      <div className="guided-scene-player__frame">
        <div
          className="guided-scene-player__canvas"
          ref={bindContainer}
          style={{ aspectRatio: String(SCENE_ASPECT) }}
          data-testid="guided-canvas-frame"
        />
      </div>

      <figcaption className="guided-scene-player__stage" aria-live="polite">
        <span className="guided-scene-player__stage-eyebrow">Watching now</span>
        <span className="guided-scene-player__stage-title">
          {stageTitle ?? "Ready to play"}
        </span>
      </figcaption>

      {reducedMotion && (
        <p className="guided-scene-player__reduced-note">
          Reduced motion is on. Use Previous / Next idea to move through the
          sequence.
        </p>
      )}

      <div className="guided-scene-player__toolbar">
        <div
          className="guided-scene-player__controls"
          aria-label="Playback controls"
        >
          {isPlaying ? (
            <button
              type="button"
              className="btn btn--primary"
              onClick={handlePause}
            >
              Pause
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary"
              onClick={handlePlay}
              disabled={state.status === "error"}
            >
              Play
            </button>
          )}
          <button type="button" className="btn" onClick={handleReplay}>
            Replay
          </button>
          <span className="guided-scene-player__spacer" aria-hidden="true" />
          <button
            type="button"
            className="btn btn--ghost"
            onClick={goPrevIdea}
            disabled={majorCount === 0}
          >
            Previous idea
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={goNextIdea}
            disabled={majorCount === 0}
          >
            Next idea
          </button>
        </div>

        {majorCount > 0 && (
          <div
            className="guided-scene-player__ideas"
            role="group"
            aria-label="Jump to idea"
          >
            {majorSteps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                className="guided-scene-player__idea-dot"
                aria-label={`Idea ${index + 1}: ${step.title}`}
                aria-current={currentMajorIndex === index ? "step" : undefined}
                data-active={currentMajorIndex === index}
                title={step.title}
                onClick={() => handleSeek(step.at)}
              />
            ))}
          </div>
        )}
      </div>

      {state.canSeek && (
        <label className="guided-scene-player__scrubber">
          <span className="sr-only">Timeline scrubber</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={state.progress}
            onChange={(event) => handleSeek(Number(event.target.value))}
            aria-label="Animation timeline"
            aria-valuetext={`${Math.round(state.progress * 100)}%`}
          />
        </label>
      )}

      {state.error && (
        <div className="guided-scene-player__error" role="alert">
          <p>This animation couldn't load. {state.error}</p>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setRetryToken((token) => token + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {showDebug && <DebugReadout />}
    </figure>
  );
}

export type { GuidedSceneFactory };

function majorStepIndex(
  steps: readonly GuidedSceneStep[],
  progress: number,
): number | null {
  if (steps.length === 0) return null;
  let index = 0;
  for (let i = 0; i < steps.length; i += 1) {
    if (progress + 1e-6 >= steps[i]!.at) index = i;
  }
  return index;
}

/** Opt-in via ?debug=1 or localStorage guidedSceneDebug=1. */
function DebugReadout() {
  const [snapshot, setSnapshot] = useState(() => guidedSceneDebug.snapshot());
  useEffect(() => {
    const id = window.setInterval(() => {
      setSnapshot(guidedSceneDebug.snapshot());
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <dl
      className="guided-scene-player__debug"
      data-testid="guided-debug"
      aria-hidden="true"
    >
      <div>
        <dt>active engines</dt>
        <dd>{snapshot.activeEngines}</dd>
      </div>
      <div>
        <dt>loops</dt>
        <dd>{snapshot.activeLoops}</dd>
      </div>
      <div>
        <dt>resources</dt>
        <dd>{snapshot.activeResources}</dd>
      </div>
      <div>
        <dt>subscribers</dt>
        <dd>{snapshot.activeSubscribers}</dd>
      </div>
      <div>
        <dt>mounts / disposals</dt>
        <dd>
          {snapshot.mounts} / {snapshot.disposals}
        </dd>
      </div>
    </dl>
  );
}
