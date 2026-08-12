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
  areLinearlyIndependent,
  areParallel,
  areRowEquivalent,
  augmentedMatrix,
  classifyLinearSystem2x2,
  hasContradictionRow,
  inNullSpace,
  isRowEchelonForm,
  magnitude,
  magnitudeN,
  matrixVectorMultiply,
  singleRowOperationBetween,
  solveLinearSystem,
  solves,
  verifiesEigenpair,
  type AugmentedSystem,
  type LinearSystemKind,
  differentiatesToTarget,
  expressionsAgree,
  freeVariables,
  tryParseExpression,
  type Matrix2x2,
  type Vector2,
  tailInequalityHolds,
  type ComparisonDirection,
  type ComparisonTarget,
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
 * usable-pivot` accepts an augmented `[A|b]` iff it is reachable from `original`
 * by **exactly one** legal (reversible) elementary row operation **that also**
 * places a nonzero entry in the `pivot` position. This lets a prompt ask the
 * learner to *choose and apply* one operation (method selection) without naming
 * it: every valid single-operation choice passes, and the operation stays
 * undisclosed until commitment.
 *
 * The single-operation test is the shared `singleRowOperationBetween` (src/math),
 * which reuses the row-operation arithmetic and rejects anything needing more
 * than one move — a full RREF, a multi-step reduction, or an unrelated system
 * that merely shares the same solution set. "Same solution set" is deliberately
 * **not** treated as "one operation"; no linear algebra is reimplemented here.
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
      // Exactly ONE legal elementary operation from the original — NOT merely the
      // same solution set (which a full reduction or an unrelated system can share).
      const op = singleRowOperationBetween(
        toAugmented2x3(check.original),
        toAugmented2x3(entries),
        tolerance,
      );
      const oneLegalOp = op !== null;
      const correct = pivotOk && oneLegalOp;
      return {
        correct,
        because: !pivotOk
          ? "the pivot position is still 0 — choose an operation that brings a nonzero entry there"
          : !oneLegalOp
            ? "that is not the result of a single legal row operation on the original — use one elementary operation (a swap, or add a multiple of one row to the other)"
            : "you produced the original after one legal operation, with a usable pivot",
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
 *  - `eigenvector`: the (nonzero) vector must satisfy `A v = λ v`;
 *  - `corner-slopes`: the learner supplies the PAIR of one-sided slopes at a
 *    point, and it passes iff both are finite and **differ** — which is exactly
 *    what makes a continuous point non-differentiable. Any such pair passes, and
 *    equal slopes are rejected as describing a differentiable point;
 *  - `removable-discontinuity`: the learner supplies the PAIR
 *    `(limit, value)` describing a function at a point, and it passes iff both
 *    are finite and **differ** — which is exactly what it means for a limit to
 *    exist where the function is not continuous. Any such pair passes, so the
 *    learner constructs rather than recalls, and the two ways to be wrong
 *    (making them equal ⇒ continuous; using a function with no limit) are
 *    rejected with distinct reasons.
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
  | { kind: "eigenvector"; matrix: readonly (readonly number[])[]; eigenvalue: number }
  | { kind: "removable-discontinuity" }
  | { kind: "corner-slopes" }
  | {
      /**
       * A two-piece rate whose running total **ends below its own maximum**.
       *
       * The learner supplies the two rates; each piece lasts `halfDuration`. The
       * area model predicts this is impossible ("area cannot be negative"); the
       * total model predicts it easily. Infinitely many pairs work, which is why
       * this is a construction rather than a lookup.
       */
      kind: "signed-total";
      halfDuration: number;
    }
  | {
      /**
       * An interval `[a, b]` (the learner's committed vector, read as endpoints)
       * on which the left/right-sum bracketing guarantee provably does NOT
       * apply: narrow (`b - a <= maxWidth`) and straddling a declared turn.
       *
       * Infinitely many intervals work, which is what makes this a construction
       * (the learner must locate the turn from the rate's formula) rather than a
       * lookup. Passes iff `a < b`, `[a, b]` sits inside `domain`, the width is
       * at most `maxWidth`, and some `turningPoints` entry lies STRICTLY inside
       * `(a, b)` — a turn sitting exactly at an endpoint is where two certified
       * monotone stretches meet, not an interval the guarantee fails on.
       */
      kind: "interval-without-bracket-guarantee";
      domain: readonly [number, number];
      turningPoints: readonly number[];
      maxWidth: number;
    };

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
    case "corner-slopes": {
      // The pair is (left slope, right slope). As with `removable-discontinuity`
      // the zero-vector guard does not apply: (0, 1) is a perfectly good corner.
      const [left, right] = vector;
      const finite = Number.isFinite(left) && Number.isFinite(right);
      const differ = Math.abs(left - right) > tolerance;
      return {
        pass: finite && differ,
        because:
          finite && differ
            ? "the two one-sided slopes disagree, so no single line fits"
            : !finite
              ? "a one-sided slope that is not a finite number is not a slope"
              : "the slopes agree, so that point is differentiable",
      };
    }
    case "signed-total": {
      // The pair is (first rate, second rate), each held for `halfDuration`.
      // Two conditions, and both are needed: the total must actually RISE first
      // (otherwise its maximum is the starting zero and "below its maximum" is
      // vacuous), and it must END below that maximum.
      const [first, second] = vector;
      const t = check.halfDuration;
      const finite = Number.isFinite(first) && Number.isFinite(second);
      const peak = first * t;
      const final = peak + second * t;
      const rises = peak > tolerance;
      const ends = final < peak - tolerance;
      return {
        pass: finite && rises && ends,
        because:
          finite && rises && ends
            ? `the total climbs to ${peak.toFixed(2)} and falls back to ${final.toFixed(2)} — below its own maximum`
            : !finite
              ? "a rate that is not a finite number is not a rate"
              : !rises
                ? "the total never rises, so it has no maximum to end below"
                : "the total never comes back down",
      };
    }
    case "removable-discontinuity": {
      // The pair is (limit, value). The zero-vector guard above does NOT apply:
      // (0, 2) is a perfectly good answer, so this check reads the coordinates
      // directly rather than requiring a nonzero vector.
      const [limit, value] = vector;
      const finite = Number.isFinite(limit) && Number.isFinite(value);
      const differ = Math.abs(limit - value) > tolerance;
      return {
        pass: finite && differ,
        because:
          finite && differ
            ? "the limit exists and the function disagrees with it there"
            : !finite
              ? "a limit that is not a finite number is not a limit"
              : "the limit and the value agree, so that point is continuous",
      };
    }
    case "interval-without-bracket-guarantee": {
      // The pair is (a, b): the committed interval's endpoints. The zero-vector
      // guard does not apply — a genuine interval can straddle zero.
      const [a, b] = vector;
      const [lo, hi] = check.domain;
      const finite = Number.isFinite(a) && Number.isFinite(b);
      const ordered = finite && a < b;
      const inDomain = ordered && a >= lo - tolerance && b <= hi + tolerance;
      const width = b - a;
      const withinWidth = ordered && width <= check.maxWidth + tolerance;
      const turnsInside =
        ordered && check.turningPoints.some((t) => t > a + tolerance && t < b - tolerance);
      const pass = finite && ordered && inDomain && withinWidth && turnsInside;
      return {
        pass,
        because: !finite
          ? "both endpoints must be finite numbers"
          : !ordered
            ? "the first number must be strictly less than the second"
            : !inDomain
              ? `the interval must lie inside [${lo}, ${hi}]`
              : !withinWidth
                ? `the interval must be no wider than ${check.maxWidth}`
                : !turnsInside
                  ? "no declared turn lies strictly inside that interval, so the guarantee actually holds there"
                  : "a turn lies strictly inside an interval this narrow, so no bracketing guarantee applies",
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
  /**
   * Human-scoring rubric identity (Package F). Defaults to the exercise id /
   * version 1 when unset. `rubricText` is the scoring guidance shown to the
   * reviewer; it falls back to `rubric` when omitted. These are SNAPSHOTTED into
   * a released attempt so an old attempt is scored against the version it was
   * administered with.
   */
  rubricId?: string;
  rubricVersion?: number;
  rubricText?: string;
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
 * solution-set — the learner PRODUCES a complete solution set for a concrete
 * (m×n) system: consistency (∅ or not), the free-variable count, a particular
 * solution, and one nonzero null direction per free variable. Predicate-graded
 * against the general `src/math` solver so ANY valid parameterization passes
 * (particular solves; each direction is nonzero and in Null(A); the directions
 * are independent and number the free variables). No fixed "the" answer is
 * required, and nothing about the expected shape is revealed by the config.
 *
 * Reached via `custom`. Reused for R², R³, and rectangular systems (Package G's
 * concrete P2 slice) — deliberately NOT a general ℝⁿ rank–nullity surface.
 * ------------------------------------------------------------------------ */

export type SolutionSetConfig = {
  /** Coefficient matrix A (m×n). */
  matrix: readonly (readonly number[])[];
  /** Right-hand side b (length m). */
  rhs: readonly number[];
  /** Variable count n (defaults to the matrix column count). */
  variables?: number;
  /** Absolute tolerance for solving/verification (defaults to 1e-6). */
  tolerance?: number;
  /** Shown after grading (always explains *why*). */
  explanation: string;
};

export type SolutionSetAnswer = {
  /** The learner's consistency verdict (false ⇒ ∅). */
  consistent: boolean;
  /** Declared number of free variables (consistent case); `null` = blank draft. */
  freeCount?: number | null;
  /** A particular solution (length n) (consistent case); `null` cells = blank. */
  particular?: readonly (number | null)[];
  /** One nonzero null direction per free variable; `null` cells = blank draft. */
  nullDirections?: readonly (readonly (number | null)[])[];
};

export const SOLUTION_SET_ID = "solution-set";

const SOLUTION_SET_TOLERANCE = 1e-6;

function solutionSetConfig(exercise: ExerciseDefinition): SolutionSetConfig {
  if (exercise.type !== "custom") {
    throw new Error("solution-set requires a custom exercise");
  }
  const config = exercise.config as SolutionSetConfig | undefined;
  if (
    !config ||
    !Array.isArray(config.matrix) ||
    !Array.isArray(config.rhs) ||
    typeof config.explanation !== "string"
  ) {
    throw new Error(
      `solution-set exercise "${exercise.id}" needs { matrix, rhs, explanation } config`,
    );
  }
  return config;
}

function decodeSolutionSetAnswer(raw: JsonValue | undefined): SolutionSetAnswer {
  const o = decodeObject(raw, SOLUTION_SET_ID);
  if (typeof o.consistent !== "boolean") {
    throw new AnswerDecodeError(SOLUTION_SET_ID, `"consistent" must be a boolean`);
  }
  if (!o.consistent) return { consistent: false };
  const particular = decodeNullableNumberArray(o.particular ?? [], SOLUTION_SET_ID, "particular");
  const dirsRaw = decodeArray(o.nullDirections ?? [], SOLUTION_SET_ID, "nullDirections");
  const nullDirections = dirsRaw.map((d, i) =>
    decodeNullableNumberArray(d, SOLUTION_SET_ID, `nullDirections[${i}]`),
  );
  return {
    consistent: true,
    freeCount: decodeNullableNumber(o.freeCount, SOLUTION_SET_ID, "freeCount"),
    particular,
    nullDirections,
  };
}

/* --------------------------------------------------------------------------
 * elimination-solution — the learner PRODUCES concrete elimination evidence for
 * a system: a row-equivalent echelon augmented matrix, the pivot / free-variable
 * identification, the free-variable count, and (consistent) a particular solution
 * + null directions, or (inconsistent) a contradiction row plus a TYPED
 * none/inconsistent classification. A bare "no solution" button is NOT accepted —
 * the learner must produce the contradiction-row witness and type the verdict.
 *
 * Predicate-graded against the general `src/math` solver: ANY valid reduction is
 * accepted (row-equivalent + echelon), pivot columns are the RREF-invariant true
 * pivots, and the particular/null objects are checked structurally. Blank cells
 * are `null` (a preserved draft), never coerced to 0.
 * ------------------------------------------------------------------------ */

export type EliminationConfig = SolutionSetConfig;

export type EliminationAnswer = {
  /** The learner's row-reduced augmented matrix `[R | d]` (m×(n+1)); `null` = blank. */
  reduced: (number | null)[][];
  /** Consistency verdict; `null` = not yet chosen. */
  consistent: boolean | null;
  /** Typed classification (inconsistent case) — a bare toggle does not suffice. */
  classification?: string;
  /** Identified pivot coefficient-columns (consistent case). */
  pivotColumns?: number[];
  /** Free-variable count (consistent case); `null` = blank draft. */
  freeCount?: number | null;
  /** A particular solution (consistent case); `null` cells = blank draft. */
  particular?: (number | null)[];
  /** One nonzero null direction per free variable; `null` cells = blank draft. */
  nullDirections?: (number | null)[][];
};

export const ELIMINATION_ID = "elimination-solution";

function eliminationConfig(exercise: ExerciseDefinition): EliminationConfig {
  if (exercise.type !== "custom") {
    throw new Error("elimination-solution requires a custom exercise");
  }
  const config = exercise.config as EliminationConfig | undefined;
  if (
    !config ||
    !Array.isArray(config.matrix) ||
    !Array.isArray(config.rhs) ||
    typeof config.explanation !== "string"
  ) {
    throw new Error(
      `elimination-solution exercise "${exercise.id}" needs { matrix, rhs, explanation } config`,
    );
  }
  return config;
}

const ACCEPTED_INCONSISTENT_CLASSIFICATIONS = new Set([
  "none",
  "no solution",
  "no solutions",
  "inconsistent",
  "empty",
  "empty set",
  "∅",
  "∅ (empty)",
]);

function isInconsistentClassification(text: string | undefined): boolean {
  if (!text) return false;
  const t = text.trim().toLowerCase();
  if (t === "") return false;
  return ACCEPTED_INCONSISTENT_CLASSIFICATIONS.has(t);
}

function sameIntSet(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((v, i) => v === sb[i]);
}

function decodeEliminationAnswer(raw: JsonValue | undefined): EliminationAnswer {
  const o = decodeObject(raw, ELIMINATION_ID);
  const reducedRows = decodeArray(o.reduced ?? [], ELIMINATION_ID, "reduced");
  const reduced = reducedRows.map((row, i) =>
    decodeNullableNumberArray(row, ELIMINATION_ID, `reduced[${i}]`),
  );
  const consistent = typeof o.consistent === "boolean" ? o.consistent : null;
  const result: EliminationAnswer = { reduced, consistent };
  if (typeof o.classification === "string") result.classification = o.classification;
  if (o.pivotColumns !== undefined) {
    result.pivotColumns = decodeNumberArray(o.pivotColumns, ELIMINATION_ID, "pivotColumns");
  }
  if (o.freeCount !== undefined) {
    result.freeCount = decodeNullableNumber(o.freeCount, ELIMINATION_ID, "freeCount");
  }
  if (o.particular !== undefined) {
    result.particular = decodeNullableNumberArray(o.particular, ELIMINATION_ID, "particular");
  }
  if (o.nullDirections !== undefined) {
    result.nullDirections = decodeArray(o.nullDirections, ELIMINATION_ID, "nullDirections").map(
      (d, i) => decodeNullableNumberArray(d, ELIMINATION_ID, `nullDirections[${i}]`),
    );
  }
  return result;
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
      accept?: readonly string[];
      semanticCheck?: SequenceTextSemanticCheck;
      explanation: string;
    };

export type SequenceTextSemanticCheck =
  | "type-one-2-infinity"
  | "left-singular-a-b"
  | "right-singular-a-b"
  | "independent-one-sided"
  | "two-sided-split"
  | "exp-minus-two-squeeze";

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

function normalizeMathProduction(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\\(?:left|right|big|displaystyle)/g, "")
    .replace(/\\(?:infty|infinity)|∞|infinity/g, "inf")
    .replace(/\\to|→/g, "->")
    .replace(/\\int|integral/g, "int")
    .replace(/\\exp/g, "exp")
    .replace(/\\,|\\!|\\;/g, "")
    .replace(/f\s*\(\s*x\s*\)/g, "f")
    .replace(/d\s*[xtr]/g, "")
    .replace(/[{}$]/g, "")
    .replace(/\s+/g, "")
    .replace(/limit/g, "lim");
}

function passesSequenceTextSemanticCheck(
  check: SequenceTextSemanticCheck,
  raw: string,
): boolean {
  const prose = normalizeAnswerText(raw);
  const math = normalizeMathProduction(raw);
  const negated = /\b(?:do|does|did|must|need|is|are|was|were)?\s*not\b|\bneither\b|\bdon't\b|\bdoesn't\b|\bfail(?:s|ed)?\b/.test(prose);
  switch (check) {
    case "type-one-2-infinity":
      return /lim(?:_|\()?r->inf/.test(math) && /int(?:_|\()?2(?:\^|to)?r/.test(math) && math.includes("f");
    case "left-singular-a-b":
      return /lim(?:_|\()?t->a\+/.test(math) && /int(?:_|\()?t(?:\^|to)?b/.test(math) && math.includes("f");
    case "right-singular-a-b":
      return /lim(?:_|\()?t->b-/.test(math) && /int(?:_|\()?a(?:\^|to)?t/.test(math) && math.includes("f");
    case "independent-one-sided":
      return !negated && /both/.test(prose) && /one-sided|one sided/.test(prose) &&
        /limit|integral/.test(prose) && /converg|exist|independent/.test(prose);
    case "two-sided-split":
      return !negated && /split/.test(prose) && /finite| at c|point c/.test(prose) &&
        /both/.test(prose) && /one-sided|one sided|sides/.test(prose) &&
        /converg|exist|require/.test(prose);
    case "exp-minus-two-squeeze": {
      const canonical = math
        .replace(/e\^\(-?2r\)/g, "exp(-2r)")
        .replace(/rexp/g, "r*exp")
        .replace(/[.,;]+$/, "");
      return canonical === "r*exp(-2r)<=1/(2r)" ||
        canonical === "0<=r*exp(-2r)<=1/(2r)";
    }
  }
}

/* --------------------------------------------------------------------------
 * math-expression — the learner types an algebraic expression in ordinary
 * infix notation (`x^2 + 3x + 7`) and it is graded by VALUE against `expected`.
 * Reached via `custom`.
 * ------------------------------------------------------------------------ */

/**
 * How a math-expression item decides correctness.
 *
 * `value-equivalent` (the default): the answer must agree with `expected` as
 * a function — right for "what is the derivative", wrong for form-sensitive
 * prompts (see the boundary pinned in mathExpressionGradingContract.test.ts).
 *
 * `antiderivative-of`: the answer is graded by DIFFERENTIATING it on the
 * item's own interval and comparing against `integrand` — the lesson's
 * check-by-differentiating discipline (L7 insight.md §7d) executed by the
 * machine. `+C` invariance is automatic (differentiation kills constants),
 * which is why `expected` alone cannot grade these items: `expected + 7` is
 * exactly as correct as `expected`.
 */
export type MathExpressionCheck =
  | { kind: "value-equivalent" }
  | {
      kind: "antiderivative-of";
      /** Friendly-infix integrand source (never LaTeX). */
      integrand: string;
      /** The interval the antiderivative claim is graded on. */
      domain: readonly [number, number];
    };

export type MathExpressionConfig = {
  /**
   * The model answer, written in the same friendly infix notation the
   * learner types — NOT LaTeX. Under `value-equivalent` (default), any
   * expression that agrees with it as a function is accepted; under
   * `antiderivative-of` it is shown as the model answer and sanity-checked
   * against the integrand at config time, while grading runs against the
   * integrand itself.
   */
  expected: string;
  check?: MathExpressionCheck;
  /**
   * The variables the answer is a function of. Required rather than inferred:
   * inferring them from `expected` would silently accept an answer in the
   * wrong variable whenever the two happened to agree on the sampled points,
   * and would make a typo'd variable name look like a domain problem instead
   * of a wrong answer.
   */
  variables: readonly string[];
  /** Shown after grading, correct or not — the same "always say why" bar every other capability meets. */
  explanation: string;
  /** Optional palette hint: extra symbols worth offering for THIS item. */
  palette?: readonly string[];
  /** Optional placeholder shown in the empty field. */
  placeholder?: string;
};

export type MathExpressionAnswer = { source: string };

export const MATH_EXPRESSION_ID = "math-expression";

export const TAIL_COMPARISON_ID = "tail-comparison";

export type TailComparisonConfig = {
  target: ComparisonTarget;
  explanation: string;
};

export type TailComparisonAnswer = {
  C: number;
  p: number;
  direction: ComparisonDirection;
  targetFiniteIntegrable: boolean;
  comparatorFiniteIntegrable: boolean;
  comparatorVerdict: "converges" | "diverges";
  conclusion: "target-converges" | "target-diverges";
};

function tailComparisonConfig(exercise: ExerciseDefinition): TailComparisonConfig {
  if (exercise.type !== "custom") throw new Error("tail-comparison requires a custom exercise");
  const config = exercise.config as TailComparisonConfig | undefined;
  if (
    !config ||
    (config.target !== "cubic-convergent-majorant" &&
      config.target !== "sqrt-divergent-minorant") ||
    typeof config.explanation !== "string"
  ) {
    throw new Error("tail-comparison needs a declared target and explanation");
  }
  return config;
}

function gradeTailComparison(
  config: TailComparisonConfig,
  answer: TailComparisonAnswer,
): GradeResult {
  const inequality = tailInequalityHolds(
    config.target, answer.C, answer.p, answer.direction,
  );
  if (inequality.kind !== "holds") {
    return { correct: false, feedback: inequality.reason };
  }
  if (!answer.targetFiniteIntegrable || !answer.comparatorFiniteIntegrable) {
    return {
      correct: false,
      feedback: "State that both functions are integrable on every finite truncation.",
    };
  }
  const convergence = config.target === "cubic-convergent-majorant";
  const verdictCorrect = answer.comparatorVerdict ===
    (convergence ? "converges" : "diverges");
  const conclusionCorrect = answer.conclusion ===
    (convergence ? "target-converges" : "target-diverges");
  if (!verdictCorrect) {
    return { correct: false, feedback: "Use the known verdict of the p-comparator." };
  }
  if (!conclusionCorrect) {
    return { correct: false, feedback: "The inequality direction does not support that conclusion." };
  }
  return { correct: true, feedback: "Certified on the whole tail. " + config.explanation };
}

function mathExpressionConfig(exercise: ExerciseDefinition): MathExpressionConfig {
  if (exercise.type !== "custom") {
    throw new Error("math-expression requires a custom exercise");
  }
  const config = exercise.config as MathExpressionConfig | undefined;
  if (
    !config ||
    typeof config.expected !== "string" ||
    !Array.isArray(config.variables) ||
    typeof config.explanation !== "string"
  ) {
    throw new Error(
      `math-expression exercise "${exercise.id}" needs { expected, variables, explanation } config`,
    );
  }
  const expected = tryParseExpression(config.expected);
  if (!expected.ok) {
    throw new Error(
      `math-expression exercise "${exercise.id}" has an unparseable expected answer "${config.expected}": ${expected.message}`,
    );
  }
  // Authoring guards, both from review findings where a one-character author
  // typo produced an item NO input could answer — including the authored
  // answer typed verbatim:
  //  1. every free variable of `expected` must be declared (expected "3x^2"
  //     with variables ["y"] silently rejected the correct "3y^2");
  //  2. `expected` must agree with ITSELF under the declared variables — the
  //     cheapest possible probe that the sampler can actually compare
  //     answers for this item (expected "sqrt(x-100)" was undefined at every
  //     sample point, so even a verbatim echo of the answer graded wrong).
  const declared = new Set(config.variables);
  const allowsArbitraryConstant = config.check?.kind === "antiderivative-of";
  const strayInExpected = freeVariables(expected.node).filter(
    (name) => !declared.has(name) && !(allowsArbitraryConstant && name === "C"),
  );
  if (strayInExpected.length > 0) {
    throw new Error(
      `math-expression exercise "${exercise.id}": expected answer uses undeclared variable(s) ${strayInExpected.join(", ")} — declare them in \`variables\` or fix the expected answer.`,
    );
  }
  const selfCheck = expressionsAgree(config.expected, config.expected, {
    variables: config.variables,
  });
  if (selfCheck.kind !== "equivalent" && config.check?.kind !== "antiderivative-of") {
    throw new Error(
      `math-expression exercise "${exercise.id}": the expected answer cannot be compared with itself under the declared variables (${selfCheck.kind}${"reason" in selfCheck ? `: ${selfCheck.reason}` : ""}) — no learner answer could ever grade correct.`,
    );
  }
  if (config.check?.kind === "antiderivative-of") {
    if (config.variables.length !== 1) {
      throw new Error(
        `math-expression exercise "${exercise.id}": antiderivative-of grading needs exactly one variable, got [${config.variables.join(", ")}].`,
      );
    }
    // The authored model answer must itself pass the check it advertises —
    // the same class of authoring guard as the self-comparison above.
    const modelVerdict = differentiatesToTarget(config.expected, config.check.integrand, {
      domain: config.check.domain,
      variable: config.variables[0]!,
    });
    if (modelVerdict.kind !== "antiderivative") {
      throw new Error(
        `math-expression exercise "${exercise.id}": the model answer "${config.expected}" does not differentiate to the integrand "${config.check.integrand}" on [${config.check.domain.join(", ")}] (${modelVerdict.kind}) — the item is unanswerable as authored.`,
      );
    }
  }
  return config;
}

/**
 * Grades a typed expression against the authored one.
 *
 * **This grades VALUE, not FORM.** `x^2+3x+7`, `7+3x+x^2` and
 * `(x+1)(x+2)+(x+5)` are all the same answer here, which is right for "what is
 * the derivative" and wrong for "factor this" or "write this in vertex form" —
 * there, restating the question would score. An item whose prompt is about the
 * FORM must not use this capability without a form check, and
 * `describeGradingContract`'s reject battery is where that would be proven.
 *
 * Three failures are kept distinct because they need different messages:
 * an input that does not parse (say what is wrong with it), an input using a
 * variable the item never declared (a wrong answer, not a malformed one), and
 * an input that parses but disagrees.
 */
function gradeMathExpression(
  config: MathExpressionConfig,
  source: string,
): GradeResult {
  const parsed = tryParseExpression(source);
  if (!parsed.ok) {
    // Deliberately WITHOUT config.explanation: the rendered-page review
    // caught the explanation (which contains the correct answer) riding
    // along on a mid-typing parse failure — pressing Enter on "2(x+1"
    // revealed the full solution. A malformed draft gets the parse message
    // and nothing else; explanations are for genuine attempts.
    return {
      correct: false,
      feedback: `That isn't a complete expression yet — ${parsed.message}`,
    };
  }
  const declared = new Set(config.variables);
  const allowsArbitraryConstant = config.check?.kind === "antiderivative-of";
  const stray = freeVariables(parsed.node).filter(
    (name) => !declared.has(name) && !(allowsArbitraryConstant && name === "C"),
  );
  if (stray.length > 0) {
    const list = stray.join(", ");
    return {
      correct: false,
      feedback: `This answer uses ${list}, but the question is about ${config.variables.join(", ") || "a constant"}. ${config.explanation}`,
    };
  }
  if (config.check?.kind === "antiderivative-of") {
    const verdict = differentiatesToTarget(source, config.check.integrand, {
      domain: config.check.domain,
      variable: config.variables[0]!,
    });
    if (verdict.kind === "antiderivative") {
      return { correct: true, feedback: `Correct — its derivative is the integrand. ${config.explanation}` };
    }
    if (verdict.kind === "not-antiderivative") {
      return {
        correct: false,
        feedback: `Differentiating your answer does not give the integrand back (near x = ${verdict.witnessX.toFixed(2)}, its derivative is ${verdict.derivativeThere.toFixed(3)} but the integrand is ${verdict.integrandThere.toFixed(3)}). Check by differentiating — that check is the method. ${config.explanation}`,
      };
    }
    return {
      correct: false,
      feedback: `I couldn't check that answer by differentiating it (${verdict.reason}). ${config.explanation}`,
    };
  }
  const verdict = expressionsAgree(source, config.expected, {
    variables: config.variables,
  });
  if (verdict.kind === "equivalent") {
    return { correct: true, feedback: `Correct. ${config.explanation}` };
  }
  if (verdict.kind === "undecided") {
    // Never a pass. Sampling could not compare the two (disjoint real
    // domains, for instance), so no agreement was established — and an
    // unestablished agreement is not a correct answer.
    return {
      correct: false,
      feedback: `I couldn't compare that with the expected answer (${verdict.reason}). ${config.explanation}`,
    };
  }
  return { correct: false, feedback: `Not equivalent. ${config.explanation}` };
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
      const exact = step.accept?.some((a) => normalizeAnswerText(a) === got) ?? false;
      const semantic = step.semanticCheck
        ? passesSequenceTextSemanticCheck(step.semanticCheck, response.value)
        : false;
      const correct = got.length > 0 && (exact || semantic);
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

/**
 * Decode an array whose entries may each be a finite number OR JSON `null` — a
 * blank cell in a partially-completed draft. `null` is preserved (never coerced
 * to 0) so incomplete drafts round-trip and grade as incomplete.
 */
function decodeNullableNumberArray(
  raw: JsonValue | undefined,
  cap: string,
  field: string,
): (number | null)[] {
  return decodeArray(raw, cap, field).map((n, i) => {
    if (n === null) return null;
    if (typeof n === "number" && Number.isFinite(n)) return n;
    throw new AnswerDecodeError(cap, `"${field}[${i}]" must be a number or null`);
  });
}

/** A blank-aware finite number: a finite number, or `null` for a blank draft field. */
function decodeNullableNumber(raw: JsonValue | undefined, cap: string, field: string): number | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  throw new AnswerDecodeError(cap, `"${field}" must be a number or null`);
}

/** Whether a nullable vector is fully entered with the expected length. */
function isCompleteVector(arr: readonly (number | null)[], length: number): arr is number[] {
  return arr.length === length && arr.every((x) => typeof x === "number");
}

function decodeCommittedPredictionAnswer(raw: JsonValue | undefined): CommittedPredictionAnswer {
  const o = decodeObject(raw, COMMITTED_PREDICTION_ID);
  return {
    committedIndex: decodeFiniteNumber(o.committedIndex, COMMITTED_PREDICTION_ID, "committedIndex"),
  };
}

function decodeMathExpressionAnswer(raw: JsonValue | undefined): MathExpressionAnswer {
  const o = decodeObject(raw, MATH_EXPRESSION_ID);
  return { source: decodeString(o.source, MATH_EXPRESSION_ID, "source") };
}

function decodeTailComparisonAnswer(raw: JsonValue | undefined): TailComparisonAnswer {
  const o = decodeObject(raw, TAIL_COMPARISON_ID);
  const direction = decodeString(o.direction, TAIL_COMPARISON_ID, "direction");
  const comparatorVerdict = decodeString(
    o.comparatorVerdict, TAIL_COMPARISON_ID, "comparatorVerdict",
  );
  const conclusion = decodeString(o.conclusion, TAIL_COMPARISON_ID, "conclusion");
  const targetFiniteIntegrable = o.targetFiniteIntegrable;
  const comparatorFiniteIntegrable = o.comparatorFiniteIntegrable;
  if (
    direction !== "target-lte-comparator" &&
    direction !== "comparator-lte-target"
  ) throw new AnswerDecodeError(TAIL_COMPARISON_ID, "invalid direction");
  if (comparatorVerdict !== "converges" && comparatorVerdict !== "diverges") {
    throw new AnswerDecodeError(TAIL_COMPARISON_ID, "invalid comparator verdict");
  }
  if (conclusion !== "target-converges" && conclusion !== "target-diverges") {
    throw new AnswerDecodeError(TAIL_COMPARISON_ID, "invalid conclusion");
  }
  if (
    typeof targetFiniteIntegrable !== "boolean" ||
    typeof comparatorFiniteIntegrable !== "boolean"
  ) throw new AnswerDecodeError(TAIL_COMPARISON_ID, "finite-truncation claims must be boolean");
  return {
    C: decodeFiniteNumber(o.C, TAIL_COMPARISON_ID, "C"),
    p: decodeFiniteNumber(o.p, TAIL_COMPARISON_ID, "p"),
    direction,
    targetFiniteIntegrable,
    comparatorFiniteIntegrable,
    comparatorVerdict,
    conclusion,
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

  [MATH_EXPRESSION_ID]: {
    id: MATH_EXPRESSION_ID,
    answerSchemaVersion: 1,
    grade(exercise, answer) {
      const config = mathExpressionConfig(exercise);
      const value = decodeMathExpressionAnswer(customValue(answer, MATH_EXPRESSION_ID));
      return gradeMathExpression(config, value.source);
    },
    serializeAnswer(answer) {
      // The learner's own SOURCE text is what is stored, not a normalized or
      // re-rendered form: a later review needs to see what they actually
      // typed, and a stored canonical form would quietly discard the
      // difference between `1/2x` and `1/(2x)` that this input exists to make
      // visible.
      const value = decodeMathExpressionAnswer(customValue(answer, MATH_EXPRESSION_ID));
      return { source: value.source };
    },
    parseAnswer(raw) {
      return {
        kind: "custom",
        capabilityId: MATH_EXPRESSION_ID,
        value: decodeMathExpressionAnswer(raw),
      };
    },
  },

  [TAIL_COMPARISON_ID]: {
    id: TAIL_COMPARISON_ID,
    answerSchemaVersion: 1,
    grade(exercise, answer) {
      const config = tailComparisonConfig(exercise);
      return gradeTailComparison(
        config,
        decodeTailComparisonAnswer(customValue(answer, TAIL_COMPARISON_ID)),
      );
    },
    serializeAnswer(answer) {
      return decodeTailComparisonAnswer(customValue(answer, TAIL_COMPARISON_ID));
    },
    parseAnswer(raw) {
      return {
        kind: "custom",
        capabilityId: TAIL_COMPARISON_ID,
        value: decodeTailComparisonAnswer(raw),
      };
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

  [SOLUTION_SET_ID]: {
    id: SOLUTION_SET_ID,
    answerSchemaVersion: 1,
    grade(exercise, answer) {
      const config = solutionSetConfig(exercise);
      const value = decodeSolutionSetAnswer(customValue(answer, SOLUTION_SET_ID));
      const tol = config.tolerance ?? SOLUTION_SET_TOLERANCE;
      const A = config.matrix;
      const b = config.rhs;
      const n = config.variables ?? (A[0]?.length ?? 0);
      const expected = solveLinearSystem(A, b, tol);

      if (value.consistent !== expected.consistent) {
        return {
          correct: false,
          feedback: expected.consistent
            ? `Not quite — this system IS consistent (it has solutions). ${config.explanation}`
            : `Not quite — this system is inconsistent: elimination reaches a contradiction row, so the solution set is ∅. ${config.explanation}`,
        };
      }
      // Both agree it is inconsistent → a produced ∅ is the complete answer.
      if (!expected.consistent) {
        return { correct: true, feedback: `Correct — the system is inconsistent (∅). ${config.explanation}` };
      }

      const rawParticular = value.particular ?? [];
      const rawDirs = value.nullDirections ?? [];
      const freeCount = expected.freeCount;

      // Completeness gate FIRST — a blank cell is incomplete, never treated as 0,
      // so every expected component (including expected zeros) must be entered.
      const incomplete = `Not quite — fill in every field before submitting (blanks are not treated as zero). ${config.explanation}`;
      if (typeof value.freeCount !== "number") return { correct: false, feedback: incomplete };
      if (!isCompleteVector(rawParticular, n)) return { correct: false, feedback: incomplete };
      for (const dir of rawDirs) {
        if (!isCompleteVector(dir, n)) return { correct: false, feedback: incomplete };
      }
      const particular = rawParticular as number[];
      const dirs = rawDirs as number[][];

      if (value.freeCount !== freeCount) {
        return {
          correct: false,
          feedback: `Not quite — count the free variables again (columns without a pivot). ${config.explanation}`,
        };
      }
      if (!solves(A, b, particular, tol)) {
        return {
          correct: false,
          feedback: `Not quite — your particular solution must satisfy $A\\mathbf{x}=\\mathbf{b}$ in every equation. ${config.explanation}`,
        };
      }
      if (dirs.length !== freeCount) {
        return {
          correct: false,
          feedback: `Not quite — a complete parameterization needs exactly ${freeCount} independent null direction(s). ${config.explanation}`,
        };
      }
      for (const dir of dirs) {
        if (magnitudeN(dir) <= tol) {
          return {
            correct: false,
            feedback: `Not quite — each null direction must be a nonzero vector with ${n} components. ${config.explanation}`,
          };
        }
        if (!inNullSpace(A, dir, tol)) {
          return {
            correct: false,
            feedback: `Not quite — each null direction must satisfy $A\\mathbf{v}=\\mathbf{0}$. ${config.explanation}`,
          };
        }
      }
      if (freeCount > 0 && !areLinearlyIndependent(dirs, tol)) {
        return {
          correct: false,
          feedback: `Not quite — your null directions are dependent; they must be independent to span the null space. ${config.explanation}`,
        };
      }
      return { correct: true, feedback: `Correct. ${config.explanation}` };
    },
    serializeAnswer(answer): JsonValue {
      const value = decodeSolutionSetAnswer(customValue(answer, SOLUTION_SET_ID));
      if (!value.consistent) return { consistent: false };
      return {
        consistent: true,
        freeCount: value.freeCount ?? null,
        particular: [...(value.particular ?? [])],
        nullDirections: (value.nullDirections ?? []).map((d) => [...d]),
      };
    },
    parseAnswer(raw) {
      return {
        kind: "custom",
        capabilityId: SOLUTION_SET_ID,
        value: decodeSolutionSetAnswer(raw),
      };
    },
  },

  [ELIMINATION_ID]: {
    id: ELIMINATION_ID,
    answerSchemaVersion: 1,
    grade(exercise, answer) {
      const config = eliminationConfig(exercise);
      const value = decodeEliminationAnswer(customValue(answer, ELIMINATION_ID));
      const tol = config.tolerance ?? SOLUTION_SET_TOLERANCE;
      const A = config.matrix;
      const b = config.rhs;
      const n = config.variables ?? (A[0]?.length ?? 0);
      const m = A.length;
      const expected = solveLinearSystem(A, b, tol);
      const aug = augmentedMatrix(A, b);
      const incomplete = (msg: string) => ({ correct: false, feedback: `${msg} ${config.explanation}` });

      // Reduced augmented matrix must be fully entered (m rows × n+1 cols, no blanks).
      if (value.reduced.length !== m) {
        return incomplete("Enter your row-reduced augmented matrix — one row per equation.");
      }
      const reduced: number[][] = [];
      for (const row of value.reduced) {
        if (!isCompleteVector(row, n + 1)) {
          return incomplete("Fill in every entry of your reduced matrix (blanks are not zero).");
        }
        reduced.push(row);
      }
      if (value.consistent === null) {
        return incomplete("State whether the system has solutions.");
      }
      // Any mathematically valid reduction is accepted (row-equivalent + echelon).
      if (!areRowEquivalent(reduced, aug, tol)) {
        return {
          correct: false,
          feedback: `Not quite — your matrix must be row-equivalent to the original system (only legal row operations). ${config.explanation}`,
        };
      }
      if (!isRowEchelonForm(reduced, tol)) {
        return {
          correct: false,
          feedback: `Not quite — reduce to echelon form: each leading entry strictly right of the one above, zero rows at the bottom. ${config.explanation}`,
        };
      }

      if (!expected.consistent) {
        if (value.consistent !== false) {
          return {
            correct: false,
            feedback: `Not quite — elimination reaches a contradiction row, so this system has NO solution. ${config.explanation}`,
          };
        }
        if (!isInconsistentClassification(value.classification)) {
          return incomplete('Type the classification (e.g. "none" or "inconsistent").');
        }
        if (!hasContradictionRow(reduced, n, tol)) {
          return {
            correct: false,
            feedback: `Not quite — your reduced matrix must contain the contradiction row $[0\\ \\cdots\\ 0 \\mid c]$ with $c \\neq 0$. ${config.explanation}`,
          };
        }
        return {
          correct: true,
          feedback: `Correct — the contradiction row proves the system is inconsistent (∅). ${config.explanation}`,
        };
      }

      // Consistent path.
      if (value.consistent !== true) {
        return { correct: false, feedback: `Not quite — this system IS consistent. ${config.explanation}` };
      }
      if (value.pivotColumns === undefined) {
        return incomplete("Mark which columns are pivot columns.");
      }
      if (!sameIntSet(value.pivotColumns, expected.pivotColumns)) {
        return {
          correct: false,
          feedback: `Not quite — check which columns actually contain a pivot. ${config.explanation}`,
        };
      }
      if (typeof value.freeCount !== "number") {
        return incomplete("Enter the number of free variables.");
      }
      if (value.freeCount !== expected.freeCount) {
        return {
          correct: false,
          feedback: `Not quite — the free-variable count is (variables) − (pivots). ${config.explanation}`,
        };
      }
      const particular = value.particular ?? [];
      if (!isCompleteVector(particular, n)) {
        return incomplete("Enter every component of a particular solution.");
      }
      if (!solves(A, b, particular, tol)) {
        return {
          correct: false,
          feedback: `Not quite — your particular solution must satisfy every equation. ${config.explanation}`,
        };
      }
      const rawDirs = value.nullDirections ?? [];
      for (const dir of rawDirs) {
        if (!isCompleteVector(dir, n)) {
          return incomplete("Enter every component of each null direction.");
        }
      }
      const dirs = rawDirs as number[][];
      if (dirs.length !== expected.freeCount) {
        return {
          correct: false,
          feedback: `Not quite — a complete parameterization needs exactly ${expected.freeCount} independent null direction(s). ${config.explanation}`,
        };
      }
      for (const dir of dirs) {
        if (magnitudeN(dir) <= tol) {
          return {
            correct: false,
            feedback: `Not quite — each null direction must be a nonzero vector. ${config.explanation}`,
          };
        }
        if (!inNullSpace(A, dir, tol)) {
          return {
            correct: false,
            feedback: `Not quite — each null direction must satisfy $A\\mathbf{v}=\\mathbf{0}$. ${config.explanation}`,
          };
        }
      }
      if (expected.freeCount > 0 && !areLinearlyIndependent(dirs, tol)) {
        return {
          correct: false,
          feedback: `Not quite — your null directions must be independent. ${config.explanation}`,
        };
      }
      return { correct: true, feedback: `Correct. ${config.explanation}` };
    },
    serializeAnswer(answer): JsonValue {
      const v = decodeEliminationAnswer(customValue(answer, ELIMINATION_ID));
      const out: Record<string, JsonValue> = {
        reduced: v.reduced.map((row) => [...row]),
        consistent: v.consistent,
      };
      if (v.classification !== undefined) out.classification = v.classification;
      if (v.pivotColumns !== undefined) out.pivotColumns = [...v.pivotColumns];
      if (v.freeCount !== undefined) out.freeCount = v.freeCount;
      if (v.particular !== undefined) out.particular = [...v.particular];
      if (v.nullDirections !== undefined) {
        out.nullDirections = v.nullDirections.map((d) => [...d]);
      }
      return out;
    },
    parseAnswer(raw) {
      return {
        kind: "custom",
        capabilityId: ELIMINATION_ID,
        value: decodeEliminationAnswer(raw),
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

/**
 * Whether an exercise's evidence needs HUMAN scoring rather than auto-grading.
 * Today that is exactly the `self-check` surface (written reasoning / proofs):
 * its "grade" only mirrors the learner's self-mark, so a module attempt must
 * route it to a reviewer instead of trusting an auto result (Package F3).
 */
export function requiresHumanScore(exercise: ExerciseDefinition): boolean {
  return resolveCapabilityId(exercise) === SELF_CHECK_ID;
}

/** Rubric snapshot for a human-scored exercise, or `undefined` if none applies. */
export function rubricSnapshotOf(exercise: ExerciseDefinition):
  | { rubricId: string; rubricVersion: number; rubricText: string; modelAnswer?: string }
  | undefined {
  if (exercise.type !== "custom" || resolveCapabilityId(exercise) !== SELF_CHECK_ID) {
    return undefined;
  }
  const config = exercise.config as SelfCheckConfig | undefined;
  if (!config) return undefined;
  const snapshot: { rubricId: string; rubricVersion: number; rubricText: string; modelAnswer?: string } = {
    rubricId: config.rubricId ?? exercise.id,
    rubricVersion: config.rubricVersion ?? 1,
    rubricText: config.rubricText ?? config.rubric ?? "",
  };
  if (config.modelAnswer) snapshot.modelAnswer = config.modelAnswer;
  return snapshot;
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
