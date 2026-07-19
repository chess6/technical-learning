import {
  createGuidedSceneEngine,
  type GuidedSceneBackend,
  type GuidedSceneEngine,
  type GuidedSceneEngineOptions,
} from "./engine";

/**
 * Maps a lesson's guidedSceneId to an engine factory.
 *
 * M2 scope: every lesson resolves to the single minimal transform spike scene.
 * Later milestones will register per-lesson scenes here without touching the
 * player or engine layers.
 */
export type GuidedSceneFactory = (
  options: GuidedSceneEngineOptions,
) => GuidedSceneEngine;

export function getGuidedSceneFactory(
  _sceneId: string,
  backend?: GuidedSceneBackend,
): GuidedSceneFactory {
  return (options) => createGuidedSceneEngine(options, backend);
}
