import { MotionCanvasEngine } from "./MotionCanvasEngine";
import { SvgFallbackEngine } from "./SvgFallbackEngine";
import type {
  GuidedSceneEngine,
  GuidedSceneEngineOptions,
} from "./types";

export * from "./types";
export { guidedSceneDebug } from "./instrumentation";
export { MotionCanvasEngine } from "./MotionCanvasEngine";
export { SvgFallbackEngine } from "./SvgFallbackEngine";

export type GuidedSceneBackend = "motion-canvas" | "svg-fallback";

/**
 * The active guided-animation backend.
 *
 * Spike result (see docs/motion-canvas-spike.md): Motion Canvas PASSED, so it
 * is the active backend. Switching to "svg-fallback" here is the single change
 * required to fall back, because every consumer depends only on the
 * GuidedSceneEngine interface.
 */
export const ACTIVE_BACKEND: GuidedSceneBackend = "motion-canvas";

export function createGuidedSceneEngine(
  options: GuidedSceneEngineOptions,
  backend: GuidedSceneBackend = ACTIVE_BACKEND,
): GuidedSceneEngine {
  switch (backend) {
    case "svg-fallback":
      return new SvgFallbackEngine(options);
    case "motion-canvas":
    default:
      return new MotionCanvasEngine(options);
  }
}
