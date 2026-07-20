import { useMemo } from "react";
import { GuidedScenePlayer } from "../components/lesson/GuidedScenePlayer";
import { getGuidedSceneFactory } from "../guided-scenes/registry";
import "./DevMafsDemoPage.css";

/**
 * Explicit development route for the Motion Canvas transform-spike scene.
 * Production lessons must never fall back to this scene for unknown ids.
 */
export function DevTransformSpikePage() {
  const createEngine = useMemo(
    () => getGuidedSceneFactory("transform-spike"),
    [],
  );

  return (
    <div className="dev-mafs-demo">
      <header className="dev-mafs-demo__header">
        <h1>Transform spike (dev)</h1>
        <p>
          Explicit Motion Canvas development scene. Not used as a silent
          fallback for unfinished lessons.
        </p>
      </header>
      <GuidedScenePlayer
        sceneId="transform-spike"
        createEngine={createEngine}
        title="Transform spike"
      />
    </div>
  );
}
