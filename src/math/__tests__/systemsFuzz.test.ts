import { describe, expect, it } from "vitest";
import {
  classifyLinearSystem2x2,
  determinant2x2,
  magnitude,
  matrixColumn,
  matrixVectorMultiply,
  subtractVectors,
  type LinearSystemKind,
  type Matrix2x2,
  type Vector2,
} from "../index";

/**
 * Math-level fuzz for the 2×2 system classifier. Instead of a fixed table, we
 * throw MANY random matrices and targets at `classifyLinearSystem2x2` and assert
 * only its *contract* — no NaN/Infinity, a valid kind, and internal consistency
 * between kind, determinant, consistency, and the returned solution.
 *
 * This is exactly the class of test that would have caught the historical
 * "zero-row" systems bug (a row/column of zeros mis-handled as an ordinary
 * line), so the corpus deliberately includes zero rows, zero columns, the
 * zero matrix, and `A = [[0,0],[1,0]]`.
 *
 * Deterministic mulberry32 PRNG ⇒ every failure reproduces.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 0xf0022b;
const TOL = 1e-9;

const isFiniteNumber = (n: number): boolean => Number.isFinite(n);
const vecFinite = (v: Vector2): boolean => isFiniteNumber(v[0]) && isFiniteNumber(v[1]);

/**
 * The full contract check for one (A, b). Split out so both the random corpus
 * and the curated corpus assert exactly the same invariants.
 */
function assertClassificationContract(A: Matrix2x2, b: Vector2, label: string): void {
  const result = classifyLinearSystem2x2(A, b);
  const det = determinant2x2(A);

  // 1. Nothing degenerates into NaN / Infinity.
  expect(isFiniteNumber(result.determinant), `${label}: determinant finite`).toBe(true);
  if (result.solution !== null) {
    expect(vecFinite(result.solution), `${label}: solution finite`).toBe(true);
  }

  // 2. A valid trichotomy kind.
  expect(["unique", "infinite", "none"], `${label}: valid kind`).toContain(
    result.kind as LinearSystemKind,
  );

  // 3. determinant / independence agree with the shared determinant helper.
  expect(result.determinant, `${label}: determinant matches helper`).toBe(det);
  expect(result.independentColumns, `${label}: independence ⇔ det≠0`).toBe(
    Math.abs(det) > TOL,
  );

  // 4. unique ⇒ det ≠ 0, a solution exists, and it satisfies A x = b.
  if (result.kind === "unique") {
    expect(Math.abs(det) > TOL, `${label}: unique ⇒ det≠0`).toBe(true);
    expect(result.consistent, `${label}: unique ⇒ consistent`).toBe(true);
    expect(result.solution, `${label}: unique ⇒ solution present`).not.toBeNull();
    const residual = magnitude(
      subtractVectors(matrixVectorMultiply(A, result.solution!), b),
    );
    const scale = Math.max(
      Math.abs(A[0][0]),
      Math.abs(A[0][1]),
      Math.abs(A[1][0]),
      Math.abs(A[1][1]),
    );
    const tol = 1e-6 * (1 + magnitude(b) + magnitude(result.solution!) * (1 + scale));
    expect(residual, `${label}: unique solution satisfies A x = b`).toBeLessThanOrEqual(tol);
  }

  // 5. infinite / none ⇒ det ≈ 0 (dependent columns) and no unique solution.
  if (result.kind === "infinite" || result.kind === "none") {
    expect(Math.abs(det) <= TOL, `${label}: non-unique ⇒ det≈0`).toBe(true);
    expect(result.independentColumns, `${label}: non-unique ⇒ dependent`).toBe(false);
    expect(result.solution, `${label}: non-unique ⇒ no single solution`).toBeNull();
  }

  // 6. Consistency lines up with the kind.
  expect(result.consistent, `${label}: infinite ⇔ consistent-dependent`).toBe(
    result.kind !== "none",
  );

  // 7. When the system is consistent AND independent, the reported solution
  //    genuinely lies on both columns' combination (already covered above), and
  //    when dependent-consistent, b must be parallel to the spanning column.
  if (result.kind === "infinite") {
    const col1 = matrixColumn(A, 0);
    const col2 = matrixColumn(A, 1);
    const spanning = magnitude(col1) > TOL ? col1 : col2;
    if (magnitude(spanning) > TOL) {
      const cross = spanning[0] * b[1] - spanning[1] * b[0];
      expect(Math.abs(cross), `${label}: infinite ⇒ b on column line`).toBeLessThanOrEqual(
        1e-6 * (1 + magnitude(spanning) * magnitude(b)),
      );
    }
  }
}

describe("systems classifier fuzz — contract holds for random inputs", () => {
  it("never produces NaN/Infinity or an inconsistent classification", () => {
    const rng = mulberry32(SEED);
    const pick = (mag: number) => (rng() * 2 - 1) * mag;
    for (let i = 0; i < 2000; i += 1) {
      // Mix magnitudes and occasionally snap to integers so exact-singular and
      // exact-dependent matrices actually occur (a purely continuous sample
      // almost never lands on det === 0).
      const mag = i % 3 === 0 ? 1 : i % 3 === 1 ? 6 : 40;
      const snap = i % 4 === 0 ? (n: number) => Math.round(n) : (n: number) => n;
      let A: Matrix2x2;
      if (i % 5 === 0) {
        // Force dependent columns: col2 = k · col1.
        const c1: Vector2 = [snap(pick(mag)), snap(pick(mag))];
        const k = snap(pick(3));
        A = [
          [c1[0], k * c1[0]],
          [c1[1], k * c1[1]],
        ];
      } else {
        A = [
          [snap(pick(mag)), snap(pick(mag))],
          [snap(pick(mag)), snap(pick(mag))],
        ];
      }
      const b: Vector2 = [snap(pick(mag)), snap(pick(mag))];
      assertClassificationContract(A, b, `random#${i}`);
    }
  });
});

describe("systems classifier fuzz — the zero-row / zero-column bug class", () => {
  // These are the shapes the historical zero-row bug mishandled. Each pairs a
  // pathological A with several targets (on- and off-span) so both the
  // consistent and inconsistent branches of the degenerate path are exercised.
  const PATHOLOGICAL: readonly { label: string; A: Matrix2x2 }[] = [
    { label: "zero matrix", A: [[0, 0], [0, 0]] },
    { label: "A=[[0,0],[1,0]] (zero first row)", A: [[0, 0], [1, 0]] },
    { label: "zero first row, nonzero second", A: [[0, 0], [3, 4]] },
    { label: "zero second row", A: [[3, 4], [0, 0]] },
    { label: "zero first column", A: [[0, 2], [0, 5]] },
    { label: "zero second column", A: [[2, 0], [5, 0]] },
    { label: "dependent columns (1,2),(2,4)", A: [[1, 2], [2, 4]] },
    { label: "single nonzero entry", A: [[0, 0], [0, 7]] },
  ];

  const TARGETS: readonly Vector2[] = [
    [0, 0],
    [1, 0],
    [0, 1],
    [3, 5],
    [3, 6],
    [-2, -4],
    [7, 14],
  ];

  it("classifies every pathological A against many targets without contract violations", () => {
    for (const { label, A } of PATHOLOGICAL) {
      for (const b of TARGETS) {
        assertClassificationContract(A, b, `${label} b=(${b[0]},${b[1]})`);
      }
    }
  });

  it("A=[[0,0],[1,0]] is dependent, and consistency depends only on b's first entry", () => {
    // col1 = (0,1), col2 = (0,0): column space is the y-axis line {(0, s)}.
    // So b is reachable iff its FIRST entry is 0.
    const A: Matrix2x2 = [
      [0, 0],
      [1, 0],
    ];
    expect(classifyLinearSystem2x2(A, [0, 5]).kind).toBe("infinite");
    expect(classifyLinearSystem2x2(A, [3, 5]).kind).toBe("none");
    // Never "unique", never a non-null solution — this is the exact class of
    // outcome the zero-row bug got wrong.
    for (const b of TARGETS) {
      const r = classifyLinearSystem2x2(A, b);
      expect(r.kind).not.toBe("unique");
      expect(r.solution).toBeNull();
    }
  });

  it("the zero matrix is consistent only for b = 0", () => {
    const Z: Matrix2x2 = [
      [0, 0],
      [0, 0],
    ];
    expect(classifyLinearSystem2x2(Z, [0, 0]).kind).toBe("infinite");
    expect(classifyLinearSystem2x2(Z, [1, 0]).kind).toBe("none");
    expect(classifyLinearSystem2x2(Z, [0, 1]).kind).toBe("none");
  });
});
