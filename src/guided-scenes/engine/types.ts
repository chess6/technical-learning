/**
 * Framework-independent guided-animation engine contract.
 *
 * Both the Motion Canvas engine and the SVG fallback implement this identical
 * interface, so lesson content and the React player never depend on which
 * animation backend is active.
 */

export type GuidedSceneStatus =
  | "idle"
  | "playing"
  | "paused"
  | "complete"
  | "error";

export interface GuidedSceneStep {
  id: string;
  title: string;
  /** Normalized timeline position (0..1) at which this step begins. */
  at: number;
}

export interface GuidedSceneState {
  status: GuidedSceneStatus;
  /** Normalized playback position in the range 0..1. */
  progress: number;
  /** Total duration in seconds, or null when unknown. */
  duration: number | null;
  /** Index into {@link GuidedSceneEngine.steps}, or null when not applicable. */
  currentStep: number | null;
  /** Whether reliable seeking/scrubbing is supported. */
  canSeek: boolean;
  /** Human-readable error message when status is "error". */
  error: string | null;
}

export type GuidedSceneListener = (state: GuidedSceneState) => void;

export interface GuidedSceneEngine {
  /** Attach the engine to a DOM container and prepare the first frame. */
  mount(container: HTMLElement): void | Promise<void>;
  play(): void;
  pause(): void;
  /** Return to the initial frame and pause. */
  reset(): void;
  /** Seek to a normalized position (0..1). No-op when canSeek is false. */
  seek(progress: number): void;
  /** Re-fit the rendering surface to its container. */
  resize(): void;
  /** Tear down all resources. Must be idempotent. */
  dispose(): void;
  getState(): GuidedSceneState;
  /** Subscribe to discrete state changes. Returns an unsubscribe function. */
  subscribe(listener: GuidedSceneListener): () => void;
  /** Ordered steps for step controls and reduced-motion presentation. */
  readonly steps: GuidedSceneStep[];
}

export interface GuidedSceneEngineOptions {
  /** Which registered scene to build. Falls back when unknown. */
  sceneId?: string;
  /** When true, avoid continuous motion; present discrete end/step states. */
  reducedMotion?: boolean;
}

export type GuidedSceneEngineFactory = (
  options: GuidedSceneEngineOptions,
) => GuidedSceneEngine;

export function createInitialState(canSeek: boolean): GuidedSceneState {
  return {
    status: "idle",
    progress: 0,
    duration: null,
    currentStep: null,
    canSeek,
    error: null,
  };
}
