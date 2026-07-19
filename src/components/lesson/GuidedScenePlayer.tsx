import "./GuidedScenePlayer.css";

type GuidedScenePlayerProps = {
  sceneId: string;
  title?: string;
};

/**
 * Placeholder player for M1.
 * M2 will mount a GuidedSceneEngine here, keyed by sceneId/lessonId so
 * navigation recreates the engine even if the route component is reused.
 */
export function GuidedScenePlayer({ sceneId, title }: GuidedScenePlayerProps) {
  return (
    <div
      className="guided-scene-player"
      data-scene-id={sceneId}
      role="region"
      aria-label={title ?? "Guided animation"}
    >
      <div className="guided-scene-player__canvas">
        <p className="guided-scene-player__placeholder">
          Guided animation
          <span className="guided-scene-player__scene-id">{sceneId}</span>
        </p>
      </div>
      <div className="guided-scene-player__controls" aria-label="Playback controls">
        <button type="button" className="btn" disabled>
          Play
        </button>
        <button type="button" className="btn" disabled>
          Pause
        </button>
        <button type="button" className="btn" disabled>
          Restart
        </button>
      </div>
    </div>
  );
}
