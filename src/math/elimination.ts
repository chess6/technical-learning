import { DEFAULT_TOLERANCE, type Matrix2x2, type Vector2 } from "./types";
import { classifyLinearSystem2x2, classifyRowConstraint } from "./systems";

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
 * loses solutions. The one genuinely illegal move the lesson diagnoses is
 * scaling by 0 (which erases a constraint — irreversible). "Adding a row to
 * itself", `R_i ← R_i + k·R_i`, is NOT a fourth kind of move: it is exactly the
 * scaling `R_i ← (1 + k)·R_i`, so it is a perfectly valid, solution-preserving
 * operation whenever `1 + k ≠ 0`, and destroys the row only in the single case
 * `k = -1` (scaling by 0). It simply is not the *canonical third* elementary
 * operation, which combines two *different* rows. We therefore canonicalize a
 * self-add to its equivalent scaling rather than rejecting it outright.
 *
 * A separate notion — **numerical stability** — is kept distinct from
 * mathematical validity: scaling by any nonzero factor is exactly reversible in
 * real arithmetic, but a factor with tiny magnitude is fragile in floating
 * point. That is a *warning*, not an illegality (see `numericalStabilityWarning`).
 *
 * All classification flows through the shared `classifyLinearSystem2x2` — this
 * module never reimplements the trichotomy.
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
 * Rewrite a self-add `R_i ← R_i + k·R_i` as its equivalent scaling
 * `R_i ← (1 + k)·R_i`, so every code path treats it uniformly (a self-add is a
 * disguised scaling, never a distinct fourth operation). All other operations —
 * swap, scale, and the canonical *distinct-row* add — pass through unchanged.
 */
export function canonicalizeRowOperation(op: RowOperation): RowOperation {
  if (op.kind === "add" && op.source === op.target) {
    return { kind: "scale", row: op.source, factor: 1 + op.factor };
  }
  return op;
}

/**
 * Apply an elementary row operation, returning a NEW augmented system (the
 * input is never mutated). This is pure arithmetic: it will faithfully carry
 * out a solution-changing move too (e.g. scale by 0), so a renderer can show
 * what actually happens; use `isSolutionPreserving` / `classifyRowOperation`
 * to decide whether the move was legitimate. A self-add is canonicalized to the
 * equivalent scaling first, so it is total (never throws).
 */
export function applyRowOperation(
  system: AugmentedSystem,
  op: RowOperation,
): AugmentedSystem {
  const canonical = canonicalizeRowOperation(op);
  const [r0, r1] = system.rows;
  switch (canonical.kind) {
    case "swap":
      return { rows: [r1, r0] };
    case "scale": {
      const scaled = scaleRow(system.rows[canonical.row], canonical.factor);
      return { rows: canonical.row === 0 ? [scaled, r1] : [r0, scaled] };
    }
    case "add": {
      // Canonicalization guarantees source ≠ target here.
      const combined = addRow(
        system.rows[canonical.target],
        scaleRow(system.rows[canonical.source], canonical.factor),
      );
      return { rows: canonical.target === 0 ? [combined, r1] : [r0, combined] };
    }
  }
}

/**
 * Whether an operation preserves the solution set — a statement of *exact*
 * mathematical validity, independent of floating-point tolerance:
 *
 * - **swap** always preserves;
 * - **scale** preserves iff the factor is exactly nonzero (any nonzero factor
 *   is reversible by its reciprocal — even a tiny one; tininess is a numerical
 *   concern surfaced separately by {@link numericalStabilityWarning}, not an
 *   illegality);
 * - **add** of two *distinct* rows always preserves; a **self-add** preserves
 *   iff its equivalent scaling `1 + k` is nonzero (it fails only for `k = -1`).
 */
export function isSolutionPreserving(op: RowOperation): boolean {
  const canonical = canonicalizeRowOperation(op);
  switch (canonical.kind) {
    case "swap":
      return true;
    case "scale":
      return canonical.factor !== 0;
    case "add":
      return true;
  }
}

/**
 * A numerical-stability warning for an otherwise mathematically valid move, or
 * `null` when there is nothing to warn about. Scaling (or a self-add reduced to
 * scaling) by a nonzero factor whose magnitude is below `tolerance` is exactly
 * reversible in real arithmetic but fragile in floating point — a caution, not
 * an illegal move. Kept deliberately separate from {@link isSolutionPreserving}
 * so validity and stability are never conflated.
 */
export function numericalStabilityWarning(
  op: RowOperation,
  tolerance = DEFAULT_TOLERANCE,
): string | null {
  const canonical = canonicalizeRowOperation(op);
  if (canonical.kind !== "scale") return null;
  const { factor } = canonical;
  if (factor !== 0 && Math.abs(factor) < tolerance) {
    return `Scaling by a factor this close to 0 (${factor}) is reversible in exact arithmetic, but numerically fragile — the inverse divides by a near-zero number.`;
  }
  return null;
}

export type RowOperationValidity = {
  /** Whether the operation is invertible (⇔ solution-set preserving). */
  reversible: boolean;
  /** A learner-facing reason, always explaining *why*. */
  reason: string;
};

/**
 * Explain whether an operation is a legitimate (reversible) elimination move.
 * Validity is exact (nonzero scale factors), matching {@link isSolutionPreserving};
 * numerical fragility of tiny factors is a separate warning, not an illegality.
 */
export function classifyRowOperation(op: RowOperation): RowOperationValidity {
  // A self-add is a disguised scaling; explain it as such rather than pretending
  // it is a distinct (and always-illegal) move.
  if (op.kind === "add" && op.source === op.target) {
    const scaled = 1 + op.factor;
    return scaled !== 0
      ? {
          reversible: true,
          reason:
            `Adding ${op.factor}·R${op.source + 1} to itself is really scaling R${op.source + 1} by ${scaled} — a nonzero scale, hence reversible (divide back by ${scaled}), so the solution set is unchanged. (It is not the canonical third operation, which combines two different rows.)`,
        }
      : {
          reversible: false,
          reason:
            `Adding −1·R${op.source + 1} to itself scales the row by 0, turning it into 0 = 0 and destroying its constraint. You can never divide back by 0, so this is illegal.`,
        };
  }

  switch (op.kind) {
    case "swap":
      return {
        reversible: true,
        reason:
          "Swapping two equations only reorders them — every point satisfying both still does, so the solution set is untouched.",
      };
    case "scale":
      return op.factor !== 0
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
      // Canonical distinct-row add: always reversible.
      return {
        reversible: true,
        reason:
          "Adding a multiple of one equation to another is reversible (subtract the same multiple back), so no solution is created or lost.",
      };
  }
}

/**
 * The operation that undoes `op` (so applying `op` then its inverse returns the
 * original system). Throws only for a genuinely non-invertible move — a scale
 * by 0, or the self-add `k = -1` that reduces to it. A self-add is inverted
 * through its equivalent scaling.
 */
export function inverseRowOperation(op: RowOperation): RowOperation {
  const canonical = canonicalizeRowOperation(op);
  switch (canonical.kind) {
    case "swap":
      return { kind: "swap" };
    case "scale":
      if (canonical.factor === 0) {
        throw new Error("A scale-by-zero row operation has no inverse.");
      }
      return { kind: "scale", row: canonical.row, factor: 1 / canonical.factor };
    case "add":
      return {
        kind: "add",
        source: canonical.source,
        target: canonical.target,
        factor: -canonical.factor,
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
  if (!isSolutionPreserving(op)) {
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

/**
 * Canonical `(a, b, c)` representation of the line `a x + b y = c`, normalized
 * so two descriptions of the *same* line compare equal: unit `(a, b)` with a
 * fixed sign convention (first nonzero of `(a, b)` positive). Returns `null`
 * when the row is not a genuine line (`0 = 0` or `0 = c ≠ 0`).
 */
function canonicalLine(
  row: AugmentedRow,
  tolerance: number,
): [number, number, number] | null {
  const [a, b, c] = row;
  if (classifyRowConstraint(a, b, c, tolerance).kind !== "line") return null;
  const norm = Math.hypot(a, b);
  const sign = Math.abs(a) > tolerance ? Math.sign(a) : Math.sign(b);
  const s = (sign || 1) / norm;
  return [a * s, b * s, c * s];
}

/** The line a *consistent* system's rows describe (both rows agree on it), or
 * `null` if neither row is a genuine line. */
function solutionLine(
  system: AugmentedSystem,
  tolerance: number,
): [number, number, number] | null {
  return (
    canonicalLine(system.rows[0], tolerance) ??
    canonicalLine(system.rows[1], tolerance)
  );
}

/**
 * Whether two systems have the *identical* solution set — the honest,
 * case-specific comparison a UI needs rather than "the kind stayed the same":
 *
 * - **unique**: the single solution points coincide;
 * - **infinite**: the solution *lines* coincide (compared as normalized lines,
 *   so "still infinite" is not mistaken for "same line");
 * - **none**: both solution sets are empty (empty equals empty).
 *
 * Differing trichotomy kinds are never equal. All classification flows through
 * the shared `classifyLinearSystem2x2`.
 */
export function haveSameSolutionSet(
  a: AugmentedSystem,
  b: AugmentedSystem,
  tolerance = DEFAULT_TOLERANCE,
): boolean {
  const ca = classifyLinearSystem2x2(systemMatrix(a), systemRhs(a), tolerance);
  const cb = classifyLinearSystem2x2(systemMatrix(b), systemRhs(b), tolerance);
  if (ca.kind !== cb.kind) return false;
  switch (ca.kind) {
    case "unique": {
      if (!ca.solution || !cb.solution) return false;
      return (
        Math.hypot(
          ca.solution[0] - cb.solution[0],
          ca.solution[1] - cb.solution[1],
        ) <= 1e-6
      );
    }
    case "none":
      return true; // both empty
    case "infinite": {
      const la = solutionLine(a, tolerance);
      const lb = solutionLine(b, tolerance);
      if (!la || !lb) return false;
      return (
        Math.abs(la[0] - lb[0]) <= 1e-6 &&
        Math.abs(la[1] - lb[1]) <= 1e-6 &&
        Math.abs(la[2] - lb[2]) <= 1e-6
      );
    }
  }
}
