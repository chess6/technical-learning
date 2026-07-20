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
import "./GuidedScenePlayer.css";

type GuidedSceneFactory = (options: GuidedSceneEngineOptions) => GuidedSceneEngine;

type GuidedScenePlayerProps = {
  sceneId: string;
  /** Stable engine factory; identity change triggers dispose + recreate. */
  createEngine: GuidedSceneFactory;
  title?: string;
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

    void Promise.resolve(engine.mount(container)).then(() => {
      if (engineRef.current === engine) {
        setMounted(true);
        if (reducedMotion && engine.steps.length > 0) {
          // First meaningful discrete state under reduced motion.
          const first = majorSteps[0] ?? engine.steps[0];
          if (first) engine.seek(first.at);
        }
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

  // Autoplay once when substantially visible.
  useEffect(() => {
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
  }, [mounted, substantiallyVisible, reducedMotion, autoplay]);

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

  const handlePlay = (): void => engineRef.current?.play();
  const handlePause = (): void => engineRef.current?.pause();
  const handleReplay = (): void => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.reset();
    if (!reducedMotion) {
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
