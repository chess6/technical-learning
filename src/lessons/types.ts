import type { Vector2 } from "../math/types";

export type { Matrix2x2, MatrixExample, Vector2 } from "../math/types";

/** Optional depth layers — main line must read complete with all closed. */
export type DepthLayerKind =
  | "why"
  | "trap"
  | "math-note"
  | "history"
  | "looking-ahead"
  | "connection"
  | "recap";

export type DepthLayer = {
  kind: DepthLayerKind;
  title: string;
  body: string;
};

/**
 * Richer practice reveal. Presentation only — numbers come from src/math.
 * `solutionVisualId` resolves through the solution-visuals registry.
 */
export type SolutionReveal = {
  prose: string;
  solutionVisualId?: string;
  derivation?: string;
  interpretation?: string;
  connection?: string;
};

export type ExerciseTier = "check" | "drill" | "transfer";

type ExerciseCommon = {
  tier?: ExerciseTier;
  hints?: string[];
  /** Optional side-by-side visual reveal after grading. */
  solutionReveal?: SolutionReveal;
  layers?: DepthLayer[];
};

export type ExerciseDefinition =
  | (ExerciseCommon & {
      id: string;
      type: "multiple-choice";
      prompt: string;
      choices: string[];
      correctChoice: number;
      explanation: string;
    })
  | (ExerciseCommon & {
      id: string;
      type: "numeric";
      prompt: string;
      expected: number;
      tolerance?: number;
      explanation: string;
    })
  | (ExerciseCommon & {
      id: string;
      type: "vector";
      prompt: string;
      expected: Vector2;
      tolerance?: number;
      explanation: string;
    })
  | (ExerciseCommon & {
      id: string;
      type: "prediction";
      prompt: string;
      reveal: string;
    })
  | (ExerciseCommon & {
      id: string;
      type: "eigenvalue";
      prompt: string;
      /** One or more expected eigenvalues (order-insensitive). */
      expected: number | readonly number[];
      tolerance?: number;
      explanation: string;
    });

/**
 * A worked computation is authored as a plain, ordered list of mathematical
 * expressions (KaTeX) — nothing more by default.
 *
 * There is deliberately **no** per-step explanatory schema (no object /
 * invariant / picture / why-next / learned). If a step needs a subtle
 * connection, a misconception repair, or a non-obvious transition explained,
 * put that in a `layer` (depth layer) or an `AuthoredCallout` beside the
 * calculation — not on every equation. Equation-only is the normal case.
 */
export type WorkedExample = {
  id: string;
  title: string;
  prompt?: string;
  /**
   * Optional embedded derivation scene — the visual core of this worked
   * computation. Prefer this over a separate second Watch block.
   */
  guidedSceneId?: string;
  /** Shared matrix/example id for continuity with guided + explorer. */
  exampleId?: string;
  /** The calculation itself: an ordered list of KaTeX expressions. */
  equations: readonly string[];
  /** Optional accessible label for the equation sequence region. */
  equationsAriaLabel?: string;
  /** Optional depth layers for genuinely high-value asides (never per-step). */
  layers?: DepthLayer[];
};

/**
 * Flexible authored callout (misconception, aside, etc.).
 * Not a rigid DSL — slots are optional; authors compose what they need.
 */
export type AuthoredCallout = {
  id: string;
  title: string;
  belief?: string;
  confront?: string;
  resolve?: string;
  solutionVisualId?: string;
  exampleId?: string;
  highlightLambda?: number;
};

export type LessonSection = {
  id: string;
  title: string;
  body: string;
  equation?: string;
  observation?: string;
  layers?: DepthLayer[];
};

/** A short conceptual check-in shown between the guided scene and exploration. */
export type LessonCheckpoint = {
  prompt: string;
  answer: string;
  solutionReveal?: SolutionReveal;
};

export type LessonDefinition = {
  id: string;
  title: string;
  subtitle: string;
  /**
   * "intro" marks a course-opening chapter (e.g. Chapter 0). Intro pages are
   * numbered "Chapter 0" and are excluded from the "Lesson N" count. Defaults to
   * an ordinary numbered lesson.
   */
  kind?: "intro" | "lesson";
  learningObjectives: string[];
  /** A prediction/motivating question shown before the explanation. */
  motivatingQuestion?: string;
  sections: LessonSection[];
  guidedSceneId: string;
  explorationId: string;
  checkpoint?: LessonCheckpoint;
  /**
   * Notebook-style worked examples. A derivation scene, when present, lives
   * on `WorkedExample.guidedSceneId` (taught once, embedded in the example).
   */
  workedExamples?: WorkedExample[];
  /**
   * Optional authored callouts (misconceptions, asides). Flexible slots —
   * not every callout needs every field.
   */
  callouts?: AuthoredCallout[];
  /** Optional so an intro chapter can omit Practice entirely. */
  exercises?: ExerciseDefinition[];
  /** Optional so an intro chapter can omit a "Remember this" summary. */
  keyTakeaway?: string;
  /** Shared example id used by both guided scene and exploration. */
  exampleId?: string;
};
