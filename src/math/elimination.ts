import { DEFAULT_TOLERANCE, type Matrix2x2, type Vector2 } from "./types";
import { classifyLinearSystem2x2 } from "./systems";

/**
 * Gaussian elimination on a 2×2 system, treated as **reversible constraint
 * manipulation**. The central fact this module is the single source of truth
 * for: an *elementary row operation* replaces the current equations with
 * different equations that describe **exactly the same solution set**.
 *
 * A system is carried as an **augmented** pair of rows `[a, b, c]` meaning the
 * scalar equation `a·x + b·y = c`. The three elementary operations are:
 *
 * - **swap** — reorder the two equations;
 * - **scale** — multiply one equation by a *nonzero* factor;
 * - **add** — replace one equation with itself plus a multiple of the *other*.
 *
 * Each of these is a bijection on the augmented rows, so it neither gains nor
 * loses solutions. The two illegal moves the lesson diagnoses are scaling by 0
 * (which erases a constraint — irreversible) and "adding a row to itself"
 * (not an elementary operation). All classification flows through the shared
 * `classifyLinearSystem2x2` — this module never reimplements the trichotomy.
 */

/** One augmented equation `a·x + b·y = c`, stored as `[a, b, c]`. */
export type AugmentedRow = readonly [number, number, number];

/** A 2×2 system in augmented form: two rows `[a, b, c]`. */
export type AugmentedSystem = {
  readonly rows: readonly [AugmentedRow, AugmentedRow];
};

export type RowIndex = 0 | 1;

/**
 * A declarative, JSON-safe elementary row operation. Kept as plain data so the
 * guided scene, the explorer, and grading can all share (and serialize) the
 * exact same operation without reimplementing its arithmetic.
 */
export type RowOperation =
  | { kind: "swap" }
  | { kind: "scale"; row: RowIndex; factor: number }
  | { kind: "add"; source: RowIndex; target: RowIndex; factor: number };

/** Build the augmented system for `A x = b`. */
export function augmentedFromSystem(A: Matrix2x2, b: Vector2): AugmentedSystem {
  return {
    rows: [
      [A[0][0], A[0][1], b[0]],
      [A[1][0], A[1][1], b[1]],
    ],
  };
}

/** The coefficient matrix `A` of an augmented system (drops the RHS column). */
export function systemMatrix(system: AugmentedSystem): Matrix2x2 {
  const [r0, r1] = system.rows;
  return [
    [r0[0], r0[1]],
    [r1[0], r1[1]],
  ];
}

/** The right-hand side `b` of an augmented system. */
export function systemRhs(system: AugmentedSystem): Vector2 {
  return [system.rows[0][2], system.rows[1][2]];
}

function scaleRow(row: AugmentedRow, factor: number): AugmentedRow {
  return [row[0] * factor, row[1] * factor, row[2] * factor];
}

function addRow(a: AugmentedRow, b: AugmentedRow): AugmentedRow {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

/**
 * Apply an elementary row operation, returning a NEW augmented system (the
 * input is never mutated). This is pure arithmetic: it will faithfully carry
 * out a solution-changing move too (e.g. scale by 0), so a renderer can show
 * what actually happens; use `isSolutionPreserving` / `classifyRowOperation`
 * to decide whether the move was legitimate.
 */
export function applyRowOperation(
  system: AugmentedSystem,
  op: RowOperation,
): AugmentedSystem {
  const [r0, r1] = system.rows;
  switch (op.kind) {
    case "swap":
      return { rows: [r1, r0] };
    case "scale": {
      const scaled = scaleRow(system.rows[op.row], op.factor);
      return { rows: op.row === 0 ? [scaled, r1] : [r0, scaled] };
    }
    case "add": {
      if (op.source === op.target) {
        throw new Error(
          "An 'add' row operation must combine two different rows (source ≠ target).",
        );
      }
      const combined = addRow(
        system.rows[op.target],
        scaleRow(system.rows[op.source], op.factor),
      );
      return { rows: op.target === 0 ? [combined, r1] : [r0, combined] };
    }
  }
}

/**
 * Whether an operation preserves the solution set: swap always does; scaling
 * does iff the factor is nonzero; adding does iff it combines two distinct
 * rows. (These are exactly the invertible elementary operations.)
 */
export function isSolutionPreserving(
  op: RowOperation,
  tolerance = DEFAULT_TOLERANCE,
): boolean {
  switch (op.kind) {
    case "swap":
      return true;
    case "scale":
      return Math.abs(op.factor) > tolerance;
    case "add":
      return op.source !== op.target;
  }
}

export type RowOperationValidity = {
  /** Whether the operation is invertible (⇔ solution-set preserving). */
  reversible: boolean;
  /** A learner-facing reason, always explaining *why*. */
  reason: string;
};

/** Explain whether an operation is a legitimate (reversible) elimination move. */
export function classifyRowOperation(
  op: RowOperation,
  tolerance = DEFAULT_TOLERANCE,
): RowOperationValidity {
  switch (op.kind) {
    case "swap":
      return {
        reversible: true,
        reason:
          "Swapping two equations only reorders them — every point satisfying both still does, so the solution set is untouched.",
      };
    case "scale":
      return Math.abs(op.factor) > tolerance
        ? {
            reversible: true,
            reason:
              "Multiplying an equation by a nonzero number is reversible (divide back by the same number), so the same points satisfy it.",
          }
        : {
            reversible: false,
            reason:
              "Multiplying a row by 0 turns it into 0 = 0 and destroys its constraint. You can never divide back, so the solution set can only grow — this move is illegal.",
          };
    case "add":
      return op.source !== op.target
        ? {
            reversible: true,
            reason:
              "Adding a multiple of one equation to another is reversible (subtract the same multiple back), so no solution is created or lost.",
          }
        : {
            reversible: false,
            reason:
              "Adding a row to itself is not an elementary operation — it silently rescales the row and can zero it out, so it is not allowed.",
          };
  }
}

/**
 * The operation that undoes `op` (so applying `op` then its inverse returns the
 * original system). Throws for a non-invertible scale (factor 0).
 */
export function inverseRowOperation(op: RowOperation): RowOperation {
  switch (op.kind) {
    case "swap":
      return { kind: "swap" };
    case "scale":
      if (op.factor === 0) {
        throw new Error("A scale-by-zero row operation has no inverse.");
      }
      return { kind: "scale", row: op.row, factor: 1 / op.factor };
    case "add":
      return {
        kind: "add",
        source: op.source,
        target: op.target,
        factor: -op.factor,
      };
  }
}

/**
 * The reversible `add` operation that clears the pivot variable `x` from the
 * second row, using row 0 as the pivot row. Returns `null` when row 0 cannot
 * be a pivot for `x` (its `x`-coefficient is ~0) — the honest "no pivot here"
 * outcome, never a fabricated step.
 */
export function eliminationStepToClearX(
  system: AugmentedSystem,
  tolerance = DEFAULT_TOLERANCE,
): RowOperation | null {
  const pivot = system.rows[0][0];
  if (Math.abs(pivot) <= tolerance) return null;
  const factor = -system.rows[1][0] / pivot;
  return { kind: "add", source: 0, target: 1, factor };
}

/** Whether a point `(x, y)` satisfies every equation of the system. */
export function satisfiesSystem(
  system: AugmentedSystem,
  point: Vector2,
  tolerance = DEFAULT_TOLERANCE,
): boolean {
  return system.rows.every(
    ([a, b, c]) => Math.abs(a * point[0] + b * point[1] - c) <= tolerance,
  );
}

function rowName(index: RowIndex): string {
  return `R${index + 1}`;
}

/**
 * A short, plain-text summary of an operation (e.g. "R2 → R2 − 2·R1"). Shared
 * so the scene, explorer, and tests all name an operation the same way.
 * Learner-facing KaTeX formatting stays in the UI; this is a stable label.
 */
export function rowOperationSummary(op: RowOperation): string {
  switch (op.kind) {
    case "swap":
      return "Swap R1 and R2";
    case "scale":
      return `Multiply ${rowName(op.row)} by ${op.factor}`;
    case "add": {
      const sign = op.factor < 0 ? "−" : "+";
      const magnitude = Math.abs(op.factor);
      const coefficient = magnitude === 1 ? "" : `${magnitude}·`;
      return `${rowName(op.target)} → ${rowName(op.target)} ${sign} ${coefficient}${rowName(op.source)}`;
    }
  }
}

/**
 * Assert (for tests and as a runtime guard) that `op` genuinely preserves the
 * solution set of `system`:
 *
 * 1. it must be a solution-preserving (invertible) operation;
 * 2. the trichotomy kind must be unchanged;
 * 3. a `unique` system must keep the *same* single solution;
 * 4. applying `op` then its inverse must restore the original system — the
 *    computational witness that the operation is a bijection on the equations,
 *    which is exactly why the solution set cannot change.
 *
 * Throws with a descriptive message on any violation.
 */
export function assertRowOperationPreservesSolutions(
  system: AugmentedSystem,
  op: RowOperation,
  tolerance = 1e-9,
): void {
  if (!isSolutionPreserving(op, tolerance)) {
    throw new Error(
      `Row operation "${rowOperationSummary(op)}" is not solution-preserving.`,
    );
  }

  const before = classifyLinearSystem2x2(systemMatrix(system), systemRhs(system), tolerance);
  const after = applyRowOperation(system, op);
  const afterClass = classifyLinearSystem2x2(
    systemMatrix(after),
    systemRhs(after),
    tolerance,
  );

  if (before.kind !== afterClass.kind) {
    throw new Error(
      `Row operation changed the solution kind from "${before.kind}" to "${afterClass.kind}".`,
    );
  }

  if (before.kind === "unique" && before.solution && afterClass.solution) {
    const dx = before.solution[0] - afterClass.solution[0];
    const dy = before.solution[1] - afterClass.solution[1];
    if (Math.hypot(dx, dy) > 1e-6) {
      throw new Error("Row operation moved the unique solution point.");
    }
  }

  const restored = applyRowOperation(after, inverseRowOperation(op));
  for (const i of [0, 1] as const) {
    for (const j of [0, 1, 2] as const) {
      if (Math.abs(restored.rows[i][j] - system.rows[i][j]) > 1e-6) {
        throw new Error(
          "Inverse row operation did not restore the original system.",
        );
      }
    }
  }
}
