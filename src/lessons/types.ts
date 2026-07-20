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

export type WorkedStep = {
  id: string;
  /** KaTeX for the symbolic line (presentation layer). */
  symbolic?: string;
  object?: string;
  invariant?: string;
  picture?: string;
  whyNext?: string;
  learned?: string;
  solutionVisualId?: string;
  /** When true, hide behind a self-explanation reveal (faded guidance). */
  faded?: boolean;
};

export type WorkedExample = {
  id: string;
  title: string;
  prompt: string;
  /**
   * Optional embedded derivation scene — the visual core of this worked
   * example. Prefer this over a separate second Watch block.
   */
  guidedSceneId?: string;
  /** Shared matrix/example id for continuity with guided + explorer. */
  exampleId?: string;
  steps: WorkedStep[];
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
  exercises: ExerciseDefinition[];
  keyTakeaway: string;
  /** Shared example id used by both guided scene and exploration. */
  exampleId?: string;
};
