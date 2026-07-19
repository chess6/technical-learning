import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import {
  createInitialState,
  type GuidedSceneEngine,
  type GuidedSceneEngineOptions,
  type GuidedSceneState,
} from "../../guided-scenes/engine/types";
import { guidedSceneDebug } from "../../guided-scenes/engine/instrumentation";
import "./GuidedScenePlayer.css";

type GuidedSceneFactory = (options: GuidedSceneEngineOptions) => GuidedSceneEngine;

type GuidedScenePlayerProps = {
  sceneId: string;
  /** Stable engine factory; identity change triggers dispose + recreate. */
  createEngine: GuidedSceneFactory;
  title?: string;
};

const STATUS_LABEL: Record<GuidedSceneState["status"], string> = {
  idle: "Ready",
  playing: "Playing",
  paused: "Paused",
  complete: "Complete",
  error: "Error",
};

const isDev = typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV);

export function GuidedScenePlayer({
  sceneId,
  createEngine,
  title,
}: GuidedScenePlayerProps) {
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GuidedSceneEngine | null>(null);
  const [state, setState] = useState<GuidedSceneState>(() =>
    createInitialState(true),
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const engine = createEngine({ reducedMotion });
    engineRef.current = engine;
    const unsubscribe = engine.subscribe(setState);
    void engine.mount(container);

    return () => {
      unsubscribe();
      engine.dispose();
      if (engineRef.current === engine) {
        engineRef.current = null;
      }
    };
  }, [createEngine, reducedMotion]);

  const percent = Math.round(state.progress * 100);
  const stepTitle =
    state.currentStep !== null
      ? (engineRef.current?.steps[state.currentStep]?.title ?? null)
      : null;

  const handlePlay = (): void => engineRef.current?.play();
  const handlePause = (): void => engineRef.current?.pause();
  const handleReset = (): void => engineRef.current?.reset();
  const handleSeek = (value: number): void => engineRef.current?.seek(value);

  const steps = engineRef.current?.steps ?? [];

  return (
    <div
      className="guided-scene-player"
      data-scene-id={sceneId}
      role="region"
      aria-label={title ?? "Guided animation"}
    >
      <div className="guided-scene-player__canvas" ref={containerRef} />

      <div className="guided-scene-player__status" aria-live="polite">
        <span className="guided-scene-player__badge" data-status={state.status}>
          {STATUS_LABEL[state.status]}
        </span>
        {stepTitle && (
          <span className="guided-scene-player__step-label">{stepTitle}</span>
        )}
        <span className="guided-scene-player__percent">{percent}%</span>
        {state.error && (
          <span className="guided-scene-player__error">{state.error}</span>
        )}
      </div>

      {reducedMotion && (
        <p className="guided-scene-player__reduced-note">
          Reduced motion is on. Use the step buttons to move through the sequence.
        </p>
      )}

      <div className="guided-scene-player__controls" aria-label="Playback controls">
        <button
          type="button"
          className="btn btn--primary"
          onClick={handlePlay}
          disabled={state.status === "playing"}
        >
          Play
        </button>
        <button
          type="button"
          className="btn"
          onClick={handlePause}
          disabled={state.status !== "playing"}
        >
          Pause
        </button>
        <button type="button" className="btn" onClick={handleReset}>
          Restart
        </button>
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
            aria-valuetext={`${percent}%`}
          />
        </label>
      )}

      {steps.length > 0 && (
        <div className="guided-scene-player__steps" aria-label="Animation steps">
          {steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              className="guided-scene-player__step"
              aria-current={state.currentStep === index ? "step" : undefined}
              data-active={state.currentStep === index}
              onClick={() => handleSeek(step.at)}
            >
              {index + 1}. {step.title}
            </button>
          ))}
        </div>
      )}

      {isDev && <DebugReadout />}
    </div>
  );
}

export type { GuidedSceneFactory };

/** Dev-only lifecycle instrumentation readout. */
function DebugReadout() {
  const [snapshot, setSnapshot] = useState(() => guidedSceneDebug.snapshot());
  useEffect(() => {
    const id = window.setInterval(() => {
      setSnapshot(guidedSceneDebug.snapshot());
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <dl className="guided-scene-player__debug" aria-hidden="true">
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
