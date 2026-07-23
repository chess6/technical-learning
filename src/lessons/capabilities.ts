/**
 * Exercise capability registry — the PURE (grading + serialization) half.
 *
 * An exercise interaction is a *capability* identified by a single capability
 * id. That capability is bundled but split across layers:
 *  - this file (pure, `src/lessons`) owns grading and JSON-safe answer
 *    serialization, and MUST NOT import React or any UI component;
 *  - the UI half (rendering + typed draft) lives beside `ExercisePanel`, keyed
 *    by the same capability id.
 *
 * Built-in interactions (`multiple-choice`, `numeric`, `vector`, `eigenvalue`,
 * `prediction`) are registered here as capabilities whose id equals the
 * exercise `type`, preserving today's behavior exactly. New interactions arrive
 * through the `custom` escape hatch: an exercise of `type: "custom"` names a
 * `capabilityId` resolved here — no edit to the core union or a central switch.
 */

import {
  approximatelyEqualVector,
  areParallel,
  classifyLinearSystem2x2,
  haveSameSolutionSet,
  magnitude,
  matrixVectorMultiply,
  verifiesEigenpair,
  type AugmentedSystem,
  type LinearSystemKind,
  type Matrix2x2,
  type Vector2,
} from "../math";
import type { JsonObject, JsonValue } from "../platform/json";
import type { ExerciseDefinition, SolutionReveal } from "./types";

// Re-exported for callers that import JsonValue alongside the capability types.
export type { JsonValue } from "../platform/json";

export interface GradeResult {
  correct: boolean;
  /** Explanation shown to the learner — always says *why*. */
  feedback: string;
  /** Optional richer reveal when the exercise defines one. */
  solutionReveal?: SolutionReveal;
}

export type ExerciseAnswer =
  | { kind: "multiple-choice"; choice: number }
  | { kind: "numeric"; value: number }
  | { kind: "vector"; value: Vector2 }
  | { kind: "eigenvalue"; value: number | readonly number[] }
  | { kind: "prediction" }
  | { kind: "custom"; capabilityId: string; value: JsonValue };

/**
 * The pure half of a capability: grade an answer and (de)serialize it to a
 * JSON-safe form for storage. `answerSchemaVersion` lets a future migration
 * reinterpret stored answers if a capability's answer shape evolves.
 */
export interface GradingCapability {
  id: string;
  answerSchemaVersion: number;
  grade(exercise: ExerciseDefinition, answer: ExerciseAnswer): GradeResult;
  serializeAnswer(answer: ExerciseAnswer): JsonValue;
  parseAnswer(raw: JsonValue): ExerciseAnswer;
}

const DEFAULT_NUMERIC_TOLERANCE = 0.01;

function fmtVec(v: Vector2): string {
  return `(${v[0]}, ${v[1]})`;
}

function normalizeExpectedLambdas(expected: number | readonly number[]): number[] {
  return (Array.isArray(expected) ? [...expected] : [expected as number]).sort(
    (a, b) => a - b,
  );
}

function gradeEigenvalues(
  expected: number | readonly number[],
  given: number | readonly number[],
  tolerance: number,
): boolean {
  const want = normalizeExpectedLambdas(expected);
  const got = normalizeExpectedLambdas(given);
  if (want.length !== got.length) return false;
  return want.every((value, index) => Math.abs(value - got[index]!) <= tolerance);
}

/* --------------------------------------------------------------------------
 * Committed prediction (the pilot interaction) — reached via `custom`.
 *
 * Unlike the self-graded `prediction`, the learner commits a choice BEFORE the
 * reveal (the testing-effect commit). If the config names a `correctIndex` the
 * commitment is graded; otherwise it is a reviewed prediction.
 * ------------------------------------------------------------------------ */

export type CommittedPredictionConfig = {
  options: readonly string[];
  correctIndex?: number;
  reveal: string;
};

export type CommittedPredictionAnswer = { committedIndex: number };

export const COMMITTED_PREDICTION_ID = "committed-prediction";

function committedPredictionConfig(
  exercise: ExerciseDefinition,
): CommittedPredictionConfig {
  if (exercise.type !== "custom") {
    throw new Error("committed-prediction requires a custom exercise");
  }
  const config = exercise.config as CommittedPredictionConfig | undefined;
  if (!config || !Array.isArray(config.options) || typeof config.reveal !== "string") {
    throw new Error(
      `committed-prediction exercise "${exercise.id}" needs { options, reveal } config`,
    );
  }
  return config;
}

/* --------------------------------------------------------------------------
 * matrix-entry — the learner types every entry of an (r×c) matrix, graded
 * entry-wise against `expected` with a numeric tolerance. Reached via `custom`.
 * ------------------------------------------------------------------------ */

/**
 * A declarative, JSON-safe predicate over the learner's entered augmented matrix
 * — used when the correct answer is NOT a single fixed matrix. `row-equivalent-
 * usable-pivot` accepts *any* augmented `[A|b]` the learner reaches by a legal
 * (reversible) elementary row operation on `original` **that also** places a
 * nonzero entry in the `pivot` position. This lets a prompt ask the learner to
 * *choose and apply* an operation (method selection) without naming it: every
 * valid choice passes, and the operation stays undisclosed until commitment.
 * Row-equivalence is decided by the shared `haveSameSolutionSet` (src/math), so
 * no linear algebra is reimplemented here.
 */
export type MatrixCheck = {
  kind: "row-equivalent-usable-pivot";
  /** The augmented `[A|b]` (2×3) the learner starts from. */
  original: readonly (readonly number[])[];
  /** Pivot position `[row, col]` (0-indexed) that must be nonzero afterwards. */
  pivot: readonly [number, number];
};

export type MatrixEntryConfig = {
  /** Row count of the matrix to enter. */
  rows: number;
  /** Column count of the matrix to enter. */
  cols: number;
  /**
   * Expected entries as a rows×cols array of numbers, graded entry-wise. Omit
   * only when a `check` predicate grades the matrix instead (open-ended answer).
   */
  expected?: readonly (readonly number[])[];
  /**
   * A declarative predicate that grades the entered matrix when the correct
   * answer is not a single fixed matrix (e.g. "apply *some* legal operation").
   * Exactly one of `expected` / `check` must be present.
   */
  check?: MatrixCheck;
  /** Per-entry absolute tolerance (defaults to the numeric tolerance). */
  tolerance?: number;
  /** Shown after grading (always explains *why*). */
  explanation: string;
  /** Optional KaTeX name for the entered matrix in the UI (e.g. "A"). */
  matrixName?: string;
};

export type MatrixEntryAnswer = { entries: readonly (readonly number[])[] };

export const MATRIX_ENTRY_ID = "matrix-entry";

function matrixEntryConfig(exercise: ExerciseDefinition): MatrixEntryConfig {
  if (exercise.type !== "custom") {
    throw new Error("matrix-entry requires a custom exercise");
  }
  const config = exercise.config as MatrixEntryConfig | undefined;
  if (
    !config ||
    typeof config.rows !== "number" ||
    typeof config.cols !== "number" ||
    (!Array.isArray(config.expected) && !config.check)
  ) {
    throw new Error(
      `matrix-entry exercise "${exercise.id}" needs { rows, cols, explanation } and one of { expected, check }`,
    );
  }
  return config;
}

/** Build a 2×3 augmented system `{ rows: [[a,b,c],[d,e,f]] }` from a number grid. */
function toAugmented2x3(entries: readonly (readonly number[])[]): AugmentedSystem {
  return {
    rows: [
      [entries[0]![0]!, entries[0]![1]!, entries[0]![2]!],
      [entries[1]![0]!, entries[1]![1]!, entries[1]![2]!],
    ],
  };
}

/** Pure evaluation of a matrix-entry predicate against the learner's entered grid. */
function evaluateMatrixCheck(
  check: MatrixCheck,
  entries: readonly (readonly number[])[],
  tolerance: number,
): { correct: boolean; because: string } {
  switch (check.kind) {
    case "row-equivalent-usable-pivot": {
      const [pr, pc] = check.pivot;
      const pivotValue = entries[pr]?.[pc] ?? 0;
      const pivotOk = Math.abs(pivotValue) > tolerance;
      const sameSolutions = haveSameSolutionSet(
        toAugmented2x3(entries),
        toAugmented2x3(check.original),
      );
      const correct = pivotOk && sameSolutions;
      return {
        correct,
        because: !sameSolutions
          ? "that changes the solution set — only a reversible row operation is allowed"
          : !pivotOk
            ? "the pivot position is still 0 — choose an operation that brings a nonzero entry there"
            : "you produced an equivalent system with a usable pivot",
      };
    }
  }
}

/** Render an r×c number grid as a KaTeX bmatrix body (for learner-facing feedback). */
function bmatrixTex(entries: readonly (readonly number[])[]): string {
  const rows = entries.map((row) => row.map((n) => String(n)).join("&")).join("\\\\");
  return `\\begin{bmatrix}${rows}\\end{bmatrix}`;
}

/* --------------------------------------------------------------------------
 * construct-in-explorer — the learner commits a small numeric construction
 * (currently a 2D vector) that must satisfy a config-declared predicate. The
 * predicate is enumerated + JSON-safe so grading stays pure; it is evaluated
 * with the shared `src/math` helpers (no ad-hoc linear algebra here). Live Mafs
 * wiring is Wave 2 — the assessable input is the committed vector.
 * ------------------------------------------------------------------------ */

/**
 * A declarative, JSON-safe predicate over the learner's committed vector. Each
 * kind names a shared `src/math` check:
 *  - `system-classification`: `A x = b` (learner supplies `b`) classifies to
 *    `expect` (`"none"` ⇒ off the columns' line ⇒ inconsistent);
 *  - `solves-system`: the learner supplies `x` and it must satisfy `A x = rhs`
 *    (any valid solution passes — used to predicate-grade a learner-chosen
 *    particular solution / point on the solution set). An optional `exclude`
 *    vector rejects a specific solution the learner was asked to differ from
 *    (e.g. "produce a *second*, distinct solution");
 *  - `vector-off-line` / `vector-on-line`: the (nonzero) vector must be
 *    non-parallel / parallel to `spanning`;
 *  - `eigenvector`: the (nonzero) vector must satisfy `A v = λ v`.
 */
export type ConstructCheck =
  | { kind: "system-classification"; matrix: readonly (readonly number[])[]; expect: LinearSystemKind }
  | {
      kind: "solves-system";
      matrix: readonly (readonly number[])[];
      rhs: readonly [number, number];
      exclude?: readonly [number, number];
    }
  | { kind: "vector-off-line"; spanning: readonly [number, number] }
  | { kind: "vector-on-line"; spanning: readonly [number, number] }
  | { kind: "eigenvector"; matrix: readonly (readonly number[])[]; eigenvalue: number };

export type ConstructInExplorerConfig = {
  /** What the learner constructs. Only a single 2D vector for now. */
  target: "vector2";
  check: ConstructCheck;
  /** Absolute tolerance for the predicate (defaults to a loose 1e-6). */
  tolerance?: number;
  /** Shown when the construction satisfies the predicate. */
  reveal: string;
  /** Shown when it does not (why it fails); falls back to a generated reason. */
  hint?: string;
};

export type ConstructInExplorerAnswer = { vector: readonly [number, number] };

export const CONSTRUCT_IN_EXPLORER_ID = "construct-in-explorer";

const CONSTRUCT_TOLERANCE = 1e-6;

function constructInExplorerConfig(
  exercise: ExerciseDefinition,
): ConstructInExplorerConfig {
  if (exercise.type !== "custom") {
    throw new Error("construct-in-explorer requires a custom exercise");
  }
  const config = exercise.config as ConstructInExplorerConfig | undefined;
  if (!config || config.target !== "vector2" || !config.check || typeof config.reveal !== "string") {
    throw new Error(
      `construct-in-explorer exercise "${exercise.id}" needs { target:"vector2", check, reveal } config`,
    );
  }
  return config;
}

function toMatrix2x2(m: readonly (readonly number[])[]): Matrix2x2 {
  return [
    [m[0]![0]!, m[0]![1]!],
    [m[1]![0]!, m[1]![1]!],
  ];
}

/** Pure evaluation of a construct predicate against a committed vector. */
export function evaluateConstructCheck(
  check: ConstructCheck,
  vector: Vector2,
  tolerance = CONSTRUCT_TOLERANCE,
): { pass: boolean; because: string } {
  const nonzero = magnitude(vector) > tolerance;
  switch (check.kind) {
    case "system-classification": {
      const classification = classifyLinearSystem2x2(toMatrix2x2(check.matrix), vector, tolerance);
      const pass = classification.kind === check.expect;
      const label: Record<LinearSystemKind, string> = {
        unique: "one solution",
        infinite: "infinitely many solutions",
        none: "no solution",
      };
      return {
        pass,
        because: pass
          ? `that vector gives ${label[check.expect]}`
          : `that vector gives ${label[classification.kind]}, not ${label[check.expect]}`,
      };
    }
    case "solves-system": {
      const product = matrixVectorMultiply(toMatrix2x2(check.matrix), vector);
      const rhs: Vector2 = [check.rhs[0], check.rhs[1]];
      const solves = approximatelyEqualVector(product, rhs, tolerance);
      const excluded = check.exclude
        ? approximatelyEqualVector(vector, [check.exclude[0], check.exclude[1]], tolerance)
        : false;
      const pass = solves && !excluded;
      return {
        pass,
        because: !solves
          ? `that gives $A\\mathbf{x} = ${fmtVec(product)}$, not $${fmtVec(rhs)}$`
          : excluded
            ? "that is the solution you were asked to differ from — find a different one"
            : "it solves the system",
      };
    }
    case "vector-off-line": {
      const pass = nonzero && !areParallel(vector, check.spanning, tolerance);
      return {
        pass,
        because: pass
          ? "it points off the line"
          : nonzero
            ? "it still lies on the line"
            : "the zero vector has no direction",
      };
    }
    case "vector-on-line": {
      const pass = nonzero && areParallel(vector, check.spanning, tolerance);
      return {
        pass,
        because: pass
          ? "it lies on the line"
          : nonzero
            ? "it points off the line"
            : "the zero vector has no direction",
      };
    }
    case "eigenvector": {
      const pass =
        nonzero && verifiesEigenpair(toMatrix2x2(check.matrix), check.eigenvalue, vector, tolerance);
      return {
        pass,
        because: pass
          ? "it stays on its own line under A"
          : nonzero
            ? "A knocks it off its own line"
            : "the zero vector is never an eigenvector",
      };
    }
  }
}

/* --------------------------------------------------------------------------
 * self-check — a free-text explanation the learner writes, then reveals a model
 * answer and self-marks understood / not-yet. Not auto-graded for correctness
 * (that needs a human): the self-mark drives the summary state.
 * ------------------------------------------------------------------------ */

export type SelfCheckConfig = {
  /** The model answer revealed after the learner writes their own (KaTeX-in-prose). */
  modelAnswer: string;
  /** Optional note on what a strong answer contains. */
  rubric?: string;
};

export type SelfMark = "understood" | "not-yet";
export type SelfCheckAnswer = { text: string; selfMark: SelfMark };

export const SELF_CHECK_ID = "self-check";

function selfCheckConfig(exercise: ExerciseDefinition): SelfCheckConfig {
  if (exercise.type !== "custom") {
    throw new Error("self-check requires a custom exercise");
  }
  const config = exercise.config as SelfCheckConfig | undefined;
  if (!config || typeof config.modelAnswer !== "string") {
    throw new Error(`self-check exercise "${exercise.id}" needs { modelAnswer } config`);
  }
  return config;
}

/* --------------------------------------------------------------------------
 * exercise-sequence — a scaffolded chain of graded sub-steps inside one
 * exercise. Each step gates the reveal of the next; the aggregate is correct
 * only when every step is. Steps + responses are JSON-safe.
 * ------------------------------------------------------------------------ */

export type SequenceStep =
  | {
      kind: "numeric";
      prompt: string;
      expected: number;
      tolerance?: number;
      explanation: string;
    }
  | {
      kind: "multiple-choice";
      prompt: string;
      choices: readonly string[];
      correctChoice: number;
      explanation: string;
    }
  | {
      // The learner enters BOTH coordinates of a 2D vector, graded exactly
      // against `expected` with a tolerance. Use when a specific vector must be
      // produced in full (no coordinate handed over).
      kind: "vector";
      prompt: string;
      expected: readonly [number, number];
      tolerance?: number;
      explanation: string;
    }
  | {
      // The learner enters BOTH coordinates of a 2D vector graded by a
      // declarative predicate (`ConstructCheck`), so ANY valid vector passes —
      // predicate-grading a learner-chosen construction rather than one canonical
      // answer.
      kind: "construct";
      prompt: string;
      check: ConstructCheck;
      tolerance?: number;
      explanation: string;
    }
  | {
      // The learner TYPES a short answer (no choices shown), graded by matching
      // the normalized text against `accept` (case/whitespace/trailing-punctuation
      // insensitive). Use to elicit a *produced* categorical answer — e.g. a
      // solution-count classification — without a multiple-choice picker that
      // would turn recall into recognition. List every acceptable spelling in
      // `accept` (e.g. ["none", "0", "no solution"]).
      kind: "text";
      prompt: string;
      accept: readonly string[];
      explanation: string;
    };

export type SequenceResponse =
  | { kind: "numeric"; value: number }
  | { kind: "multiple-choice"; choice: number }
  | { kind: "vector"; value: readonly [number, number] }
  | { kind: "construct"; value: readonly [number, number] }
  | { kind: "text"; value: string };

/**
 * Normalize a typed free-text answer for tolerant comparison: trim, lowercase,
 * collapse internal whitespace, and drop trailing sentence punctuation. So
 * "None.", " none ", and "NONE" all normalize to "none".
 */
export function normalizeAnswerText(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.!]+$/, "")
    .trim();
}

export type ExerciseSequenceConfig = { steps: readonly SequenceStep[] };

export type ExerciseSequenceAnswer = { responses: readonly SequenceResponse[] };

export const EXERCISE_SEQUENCE_ID = "exercise-sequence";

function exerciseSequenceConfig(exercise: ExerciseDefinition): ExerciseSequenceConfig {
  if (exercise.type !== "custom") {
    throw new Error("exercise-sequence requires a custom exercise");
  }
  const config = exercise.config as ExerciseSequenceConfig | undefined;
  if (!config || !Array.isArray(config.steps) || config.steps.length === 0) {
    throw new Error(
      `exercise-sequence exercise "${exercise.id}" needs a non-empty { steps } config`,
    );
  }
  return config;
}

/** Grade a single sub-step response — exported so the UI can gate step-by-step. */
export function gradeSequenceStep(
  step: SequenceStep,
  response: SequenceResponse,
): GradeResult {
  switch (step.kind) {
    case "numeric": {
      if (response.kind !== "numeric") {
        throw new Error("Expected a numeric response for a numeric step");
      }
      const tolerance = step.tolerance ?? DEFAULT_NUMERIC_TOLERANCE;
      const correct = Math.abs(response.value - step.expected) <= tolerance;
      return {
        correct,
        feedback: correct
          ? `Correct. ${step.explanation}`
          : `Not quite — expected ${step.expected}. ${step.explanation}`,
      };
    }
    case "multiple-choice": {
      if (response.kind !== "multiple-choice") {
        throw new Error("Expected a multiple-choice response for a multiple-choice step");
      }
      const correct = response.choice === step.correctChoice;
      return {
        correct,
        feedback: correct ? `Correct. ${step.explanation}` : `Not quite. ${step.explanation}`,
      };
    }
    case "vector": {
      if (response.kind !== "vector") {
        throw new Error("Expected a vector response for a vector step");
      }
      const tolerance = step.tolerance ?? DEFAULT_NUMERIC_TOLERANCE;
      const value: Vector2 = [response.value[0], response.value[1]];
      const expected: Vector2 = [step.expected[0], step.expected[1]];
      const correct = approximatelyEqualVector(value, expected, tolerance);
      return {
        correct,
        feedback: correct
          ? `Correct. ${step.explanation}`
          : `Not quite — the vector is $${fmtVec(expected)}$. ${step.explanation}`,
      };
    }
    case "construct": {
      if (response.kind !== "construct") {
        throw new Error("Expected a construct response for a construct step");
      }
      const value: Vector2 = [response.value[0], response.value[1]];
      const { pass, because } = evaluateConstructCheck(
        step.check,
        value,
        step.tolerance ?? CONSTRUCT_TOLERANCE,
      );
      return {
        correct: pass,
        feedback: pass ? `Correct. ${step.explanation}` : `Not quite — ${because}. ${step.explanation}`,
      };
    }
    case "text": {
      if (response.kind !== "text") {
        throw new Error("Expected a text response for a text step");
      }
      const got = normalizeAnswerText(response.value);
      const correct =
        got.length > 0 && step.accept.some((a) => normalizeAnswerText(a) === got);
      return {
        correct,
        feedback: correct ? `Correct. ${step.explanation}` : `Not quite. ${step.explanation}`,
      };
    }
  }
}

/* --------------------------------------------------------------------------
 * Validated answer decoding
 *
 * Persisted/generic answers arrive as opaque `JsonValue`. Instead of trusting a
 * blind `as` cast (which can smuggle a self-check-shaped answer into the
 * matrix-entry grader, or a malformed blob out of storage), each capability
 * decodes its answer through these guards and raises a controlled
 * `AnswerDecodeError` on any shape mismatch.
 * ------------------------------------------------------------------------ */

export class AnswerDecodeError extends Error {
  constructor(capabilityId: string, detail: string) {
    super(`Cannot decode "${capabilityId}" answer: ${detail}`);
    this.name = "AnswerDecodeError";
  }
}

/**
 * Assert the answer is a `custom` answer produced FOR this capability, then
 * return its JSON value. Guarantees `answer.capabilityId === capabilityId`, so a
 * capability never grades or serializes an answer authored for another one.
 */
function customValue(answer: ExerciseAnswer, capabilityId: string): JsonValue {
  if (answer.kind !== "custom") {
    throw new Error(`Expected a custom answer for "${capabilityId}"`);
  }
  if (answer.capabilityId !== capabilityId) {
    throw new Error(
      `Answer capability "${answer.capabilityId}" does not match ` +
        `exercise capability "${capabilityId}"`,
    );
  }
  return answer.value;
}

function decodeObject(
  raw: JsonValue | undefined,
  cap: string,
): JsonObject {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new AnswerDecodeError(cap, "expected a JSON object");
  }
  // `Array.isArray` is typed as `arg is any[]`, so the false branch does not
  // exclude `readonly JsonValue[]` from the JsonValue union — assert the object arm.
  return raw as JsonObject;
}

function decodeFiniteNumber(raw: JsonValue | undefined, cap: string, field: string): number {
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    throw new AnswerDecodeError(cap, `"${field}" must be a finite number`);
  }
  return raw;
}

function decodeString(raw: JsonValue | undefined, cap: string, field: string): string {
  if (typeof raw !== "string") {
    throw new AnswerDecodeError(cap, `"${field}" must be a string`);
  }
  return raw;
}

function decodeArray(
  raw: JsonValue | undefined,
  cap: string,
  field: string,
): readonly JsonValue[] {
  if (!Array.isArray(raw)) {
    throw new AnswerDecodeError(cap, `"${field}" must be an array`);
  }
  return raw;
}

function decodeVector2(raw: JsonValue | undefined, cap: string): [number, number] {
  const arr = decodeArray(raw, cap, "vector");
  if (arr.length !== 2) {
    throw new AnswerDecodeError(cap, "vector must have exactly 2 components");
  }
  return [
    decodeFiniteNumber(arr[0], cap, "vector[0]"),
    decodeFiniteNumber(arr[1], cap, "vector[1]"),
  ];
}

function decodeNumberArray(raw: JsonValue | undefined, cap: string, field: string): number[] {
  return decodeArray(raw, cap, field).map((n, i) =>
    decodeFiniteNumber(n, cap, `${field}[${i}]`),
  );
}

function decodeCommittedPredictionAnswer(raw: JsonValue | undefined): CommittedPredictionAnswer {
  const o = decodeObject(raw, COMMITTED_PREDICTION_ID);
  return {
    committedIndex: decodeFiniteNumber(o.committedIndex, COMMITTED_PREDICTION_ID, "committedIndex"),
  };
}

function decodeMatrixEntryAnswer(raw: JsonValue | undefined): MatrixEntryAnswer {
  const o = decodeObject(raw, MATRIX_ENTRY_ID);
  const rows = decodeArray(o.entries, MATRIX_ENTRY_ID, "entries");
  return {
    entries: rows.map((row, i) => decodeNumberArray(row, MATRIX_ENTRY_ID, `entries[${i}]`)),
  };
}

function decodeConstructAnswer(raw: JsonValue | undefined): ConstructInExplorerAnswer {
  const o = decodeObject(raw, CONSTRUCT_IN_EXPLORER_ID);
  return { vector: decodeVector2(o.vector, CONSTRUCT_IN_EXPLORER_ID) };
}

function decodeSelfCheckAnswer(raw: JsonValue | undefined): SelfCheckAnswer {
  const o = decodeObject(raw, SELF_CHECK_ID);
  const text = decodeString(o.text, SELF_CHECK_ID, "text");
  const selfMark = decodeString(o.selfMark, SELF_CHECK_ID, "selfMark");
  if (selfMark !== "understood" && selfMark !== "not-yet") {
    throw new AnswerDecodeError(SELF_CHECK_ID, `"selfMark" must be "understood" or "not-yet"`);
  }
  return { text, selfMark };
}

function decodeSequenceAnswer(raw: JsonValue | undefined): ExerciseSequenceAnswer {
  const o = decodeObject(raw, EXERCISE_SEQUENCE_ID);
  const responses = decodeArray(o.responses, EXERCISE_SEQUENCE_ID, "responses").map(
    (item): SequenceResponse => {
      const r = decodeObject(item, EXERCISE_SEQUENCE_ID);
      const kind = decodeString(r.kind, EXERCISE_SEQUENCE_ID, "kind");
      if (kind === "numeric") {
        return { kind: "numeric", value: decodeFiniteNumber(r.value, EXERCISE_SEQUENCE_ID, "value") };
      }
      if (kind === "multiple-choice") {
        return {
          kind: "multiple-choice",
          choice: decodeFiniteNumber(r.choice, EXERCISE_SEQUENCE_ID, "choice"),
        };
      }
      if (kind === "vector") {
        return { kind: "vector", value: decodeVector2(r.value, EXERCISE_SEQUENCE_ID) };
      }
      if (kind === "construct") {
        return { kind: "construct", value: decodeVector2(r.value, EXERCISE_SEQUENCE_ID) };
      }
      if (kind === "text") {
        return { kind: "text", value: decodeString(r.value, EXERCISE_SEQUENCE_ID, "value") };
      }
      throw new AnswerDecodeError(EXERCISE_SEQUENCE_ID, `unknown response kind "${kind}"`);
    },
  );
  return { responses };
}

/* --------------------------------------------------------------------------
 * Registry
 * ------------------------------------------------------------------------ */

export const gradingCapabilities: Record<string, GradingCapability> = {
  "multiple-choice": {
    id: "multiple-choice",
    answerSchemaVersion: 1,
    grade(exercise, answer) {
      if (exercise.type !== "multiple-choice") {
        throw new Error("Expected a multiple-choice exercise");
      }
      if (answer.kind !== "multiple-choice") {
        throw new Error("Expected a multiple-choice answer");
      }
      const correct = answer.choice === exercise.correctChoice;
      const correctText = exercise.choices[exercise.correctChoice];
      return {
        correct,
        feedback: correct
          ? `Correct. ${exercise.explanation}`
          : `Not quite — the answer is “${correctText}”. ${exercise.explanation}`,
      };
    },
    serializeAnswer(answer) {
      if (answer.kind !== "multiple-choice") throw new Error("wrong answer kind");
      return { choice: answer.choice };
    },
    parseAnswer(raw) {
      const o = decodeObject(raw, "multiple-choice");
      return {
        kind: "multiple-choice",
        choice: decodeFiniteNumber(o.choice, "multiple-choice", "choice"),
      };
    },
  },

  numeric: {
    id: "numeric",
    answerSchemaVersion: 1,
    grade(exercise, answer) {
      if (exercise.type !== "numeric") throw new Error("Expected a numeric exercise");
      if (answer.kind !== "numeric") throw new Error("Expected a numeric answer");
      const tolerance = exercise.tolerance ?? DEFAULT_NUMERIC_TOLERANCE;
      const correct = Math.abs(answer.value - exercise.expected) <= tolerance;
      return {
        correct,
        feedback: correct
          ? `Correct. ${exercise.explanation}`
          : `Not quite — the value is ${exercise.expected}. ${exercise.explanation}`,
      };
    },
    serializeAnswer(answer) {
      if (answer.kind !== "numeric") throw new Error("wrong answer kind");
      return { value: answer.value };
    },
    parseAnswer(raw) {
      const o = decodeObject(raw, "numeric");
      return { kind: "numeric", value: decodeFiniteNumber(o.value, "numeric", "value") };
    },
  },

  vector: {
    id: "vector",
    answerSchemaVersion: 1,
    grade(exercise, answer) {
      if (exercise.type !== "vector") throw new Error("Expected a vector exercise");
      if (answer.kind !== "vector") throw new Error("Expected a vector answer");
      const tolerance = exercise.tolerance ?? DEFAULT_NUMERIC_TOLERANCE;
      const correct = approximatelyEqualVector(
        answer.value,
        exercise.expected,
        tolerance,
      );
      return {
        correct,
        feedback: correct
          ? `Correct. ${exercise.explanation}`
          : `Not quite — it lands at ${fmtVec(exercise.expected)}. ${exercise.explanation}`,
      };
    },
    serializeAnswer(answer) {
      if (answer.kind !== "vector") throw new Error("wrong answer kind");
      return [answer.value[0], answer.value[1]];
    },
    parseAnswer(raw) {
      return { kind: "vector", value: decodeVector2(raw, "vector") };
    },
  },

  eigenvalue: {
    id: "eigenvalue",
    answerSchemaVersion: 1,
    grade(exercise, answer) {
      if (exercise.type !== "eigenvalue") {
        throw new Error("Expected an eigenvalue exercise");
      }
      if (answer.kind !== "eigenvalue") {
        throw new Error("Expected an eigenvalue answer");
      }
      const tolerance = exercise.tolerance ?? DEFAULT_NUMERIC_TOLERANCE;
      const correct = gradeEigenvalues(exercise.expected, answer.value, tolerance);
      const expectedList = normalizeExpectedLambdas(exercise.expected).join(", ");
      return {
        correct,
        feedback: correct
          ? `Correct. ${exercise.explanation}`
          : `Not quite — the eigenvalue(s) are ${expectedList}. ${exercise.explanation}`,
      };
    },
    serializeAnswer(answer) {
      if (answer.kind !== "eigenvalue") throw new Error("wrong answer kind");
      return Array.isArray(answer.value) ? [...answer.value] : [answer.value as number];
    },
    parseAnswer(raw) {
      const values = decodeNumberArray(raw, "eigenvalue", "value");
      return { kind: "eigenvalue", value: values.length === 1 ? values[0]! : values };
    },
  },

  prediction: {
    id: "prediction",
    answerSchemaVersion: 1,
    grade(exercise) {
      if (exercise.type !== "prediction") {
        throw new Error("Expected a prediction exercise");
      }
      return { correct: true, feedback: exercise.reveal };
    },
    serializeAnswer() {
      return { revealed: true };
    },
    parseAnswer() {
      return { kind: "prediction" };
    },
  },

  [COMMITTED_PREDICTION_ID]: {
    id: COMMITTED_PREDICTION_ID,
    answerSchemaVersion: 1,
    grade(exercise, answer) {
      const config = committedPredictionConfig(exercise);
      const value = decodeCommittedPredictionAnswer(
        customValue(answer, COMMITTED_PREDICTION_ID),
      );
      if (typeof config.correctIndex === "number") {
        const correct = value.committedIndex === config.correctIndex;
        return {
          correct,
          feedback: correct ? `Correct. ${config.reveal}` : `Not quite. ${config.reveal}`,
        };
      }
      // No correct answer configured: a reviewed prediction (commit, then reveal).
      return { correct: true, feedback: config.reveal };
    },
    serializeAnswer(answer) {
      const value = decodeCommittedPredictionAnswer(
        customValue(answer, COMMITTED_PREDICTION_ID),
      );
      return { committedIndex: value.committedIndex };
    },
    parseAnswer(raw) {
      return {
        kind: "custom",
        capabilityId: COMMITTED_PREDICTION_ID,
        value: decodeCommittedPredictionAnswer(raw),
      };
    },
  },

  [MATRIX_ENTRY_ID]: {
    id: MATRIX_ENTRY_ID,
    answerSchemaVersion: 1,
    grade(exercise, answer) {
      const config = matrixEntryConfig(exercise);
      const value = decodeMatrixEntryAnswer(customValue(answer, MATRIX_ENTRY_ID));
      const tolerance = config.tolerance ?? DEFAULT_NUMERIC_TOLERANCE;
      const dimsMatch =
        value.entries.length === config.rows &&
        value.entries.every((row) => row.length === config.cols);
      // Predicate-graded: any equivalent matrix satisfying the check passes.
      if (config.check) {
        if (!dimsMatch) {
          return { correct: false, feedback: `Fill in every entry to check. ${config.explanation}` };
        }
        const { correct, because } = evaluateMatrixCheck(config.check, value.entries, tolerance);
        return {
          correct,
          feedback: correct
            ? `Correct. ${config.explanation}`
            : `Not quite — ${because}. ${config.explanation}`,
        };
      }
      const expected = config.expected!;
      const correct =
        dimsMatch &&
        expected.every((row, r) =>
          row.every((want, c) => Math.abs(value.entries[r]![c]! - want) <= tolerance),
        );
      const expectedTex = `$${bmatrixTex(expected)}$`;
      return {
        correct,
        feedback: correct
          ? `Correct. ${config.explanation}`
          : `Not quite — the matrix is ${expectedTex}. ${config.explanation}`,
      };
    },
    serializeAnswer(answer) {
      const value = decodeMatrixEntryAnswer(customValue(answer, MATRIX_ENTRY_ID));
      return { entries: value.entries.map((row) => [...row]) };
    },
    parseAnswer(raw) {
      return {
        kind: "custom",
        capabilityId: MATRIX_ENTRY_ID,
        value: decodeMatrixEntryAnswer(raw),
      };
    },
  },

  [CONSTRUCT_IN_EXPLORER_ID]: {
    id: CONSTRUCT_IN_EXPLORER_ID,
    answerSchemaVersion: 1,
    grade(exercise, answer) {
      const config = constructInExplorerConfig(exercise);
      const value = decodeConstructAnswer(customValue(answer, CONSTRUCT_IN_EXPLORER_ID));
      const vector: Vector2 = [value.vector[0], value.vector[1]];
      const { pass, because } = evaluateConstructCheck(
        config.check,
        vector,
        config.tolerance ?? CONSTRUCT_TOLERANCE,
      );
      return {
        correct: pass,
        feedback: pass ? config.reveal : (config.hint ?? `Not quite — ${because}.`),
      };
    },
    serializeAnswer(answer) {
      const value = decodeConstructAnswer(customValue(answer, CONSTRUCT_IN_EXPLORER_ID));
      return { vector: [value.vector[0], value.vector[1]] };
    },
    parseAnswer(raw) {
      return {
        kind: "custom",
        capabilityId: CONSTRUCT_IN_EXPLORER_ID,
        value: decodeConstructAnswer(raw),
      };
    },
  },

  [SELF_CHECK_ID]: {
    id: SELF_CHECK_ID,
    answerSchemaVersion: 1,
    grade(exercise, answer) {
      const config = selfCheckConfig(exercise);
      const value = decodeSelfCheckAnswer(customValue(answer, SELF_CHECK_ID));
      const understood = value.selfMark === "understood";
      return {
        // Self-marked, not machine-graded: "correct" mirrors the learner's mark.
        correct: understood,
        feedback: understood
          ? `You marked this understood. Model answer: ${config.modelAnswer}`
          : `Worth another pass. Model answer: ${config.modelAnswer}`,
      };
    },
    serializeAnswer(answer) {
      const value = decodeSelfCheckAnswer(customValue(answer, SELF_CHECK_ID));
      return { text: value.text, selfMark: value.selfMark };
    },
    parseAnswer(raw) {
      return {
        kind: "custom",
        capabilityId: SELF_CHECK_ID,
        value: decodeSelfCheckAnswer(raw),
      };
    },
  },

  [EXERCISE_SEQUENCE_ID]: {
    id: EXERCISE_SEQUENCE_ID,
    answerSchemaVersion: 1,
    grade(exercise, answer) {
      const config = exerciseSequenceConfig(exercise);
      const value = decodeSequenceAnswer(customValue(answer, EXERCISE_SEQUENCE_ID));
      const results = config.steps.map((step, index) => {
        const response = value.responses[index];
        if (!response) return { correct: false, feedback: "Not yet answered." };
        return gradeSequenceStep(step, response);
      });
      const correctCount = results.filter((r) => r.correct).length;
      const total = config.steps.length;
      const allCorrect = correctCount === total;
      return {
        correct: allCorrect,
        feedback: allCorrect
          ? `All ${total} steps correct.`
          : `${correctCount} of ${total} steps correct so far.`,
      };
    },
    serializeAnswer(answer) {
      const value = decodeSequenceAnswer(customValue(answer, EXERCISE_SEQUENCE_ID));
      return {
        responses: value.responses.map((response): JsonValue => {
          switch (response.kind) {
            case "numeric":
              return { kind: "numeric", value: response.value };
            case "multiple-choice":
              return { kind: "multiple-choice", choice: response.choice };
            case "vector":
              return { kind: "vector", value: [response.value[0], response.value[1]] };
            case "construct":
              return { kind: "construct", value: [response.value[0], response.value[1]] };
            case "text":
              return { kind: "text", value: response.value };
          }
        }),
      };
    },
    parseAnswer(raw) {
      return {
        kind: "custom",
        capabilityId: EXERCISE_SEQUENCE_ID,
        value: decodeSequenceAnswer(raw),
      };
    },
  },
};

/** The single capability id an exercise resolves to (its type, or its custom id). */
export function resolveCapabilityId(exercise: ExerciseDefinition): string {
  return exercise.type === "custom" ? exercise.capabilityId : exercise.type;
}

export function getGradingCapability(
  exercise: ExerciseDefinition,
): GradingCapability {
  const id = resolveCapabilityId(exercise);
  const capability = gradingCapabilities[id];
  if (!capability) {
    throw new Error(
      `No grading capability registered for "${id}" (exercise "${exercise.id}").`,
    );
  }
  return capability;
}
