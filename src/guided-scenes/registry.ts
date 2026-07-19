import {
  createGuidedSceneEngine,
  type GuidedSceneBackend,
  type GuidedSceneEngine,
  type GuidedSceneEngineOptions,
} from "./engine";

/**
 * Maps a lesson's guidedSceneId to an engine factory.
 *
 * The sceneId is threaded into the engine options so the engine can build the
 * matching registered scene. Lesson definitions and the React player never see
 * Motion Canvas details — only this string id and the GuidedSceneEngine
 * interface. Unregistered ids resolve to a fallback scene (see sceneMeta).
 */
export type GuidedSceneFactory = (
  options: GuidedSceneEngineOptions,
) => GuidedSceneEngine;

export function getGuidedSceneFactory(
  sceneId: string,
  backend?: GuidedSceneBackend,
): GuidedSceneFactory {
  return (options) =>
    createGuidedSceneEngine({ ...options, sceneId }, backend);
}
