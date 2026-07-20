/**
 * Semantic playback position for Lesson 4 eigen clips.
 *
 * Synchronize by majorStepId across inline/modal and 2D/3D — never by raw
 * timeline percentage between different scenes/examples.
 */
export type ClipPosition = {
  readonly majorStepId: string;
  /** Optional within-step progress in [0, 1]; not transferable across scenes. */
  readonly localProgress?: number;
};

export type ClipMode = "derivation" | "extension";
