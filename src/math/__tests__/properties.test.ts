import { describe, expect, it } from "vitest";
import {
  addVectors,
  analyzeEigen2x2,
  areParallel,
  assertEigenpair,
  assertUnitSquareAreaMatchesDeterminant,
  determinant2x2,
  matrixColumn,
  matrixVectorMultiply,
  magnitude,
  requireMatrixExample,
  scaleVector,
  signedParallelogramArea,
  solveLinearSystem2x2,
  subtractVectors,
  type Matrix2x2,
  type Vector2,
} from "../index";

/**
 * Property-style tests: instead of pinning a handful of hand-picked inputs, we
 * assert *laws* that must hold for MANY randomized-but-deterministic inputs, and
 * then bolt on an explicit battery of hard edge cases (zero, singular,
 * near-singular, negative, extreme magnitude, reflection). Everything imports
 * from `src/math` — no linear algebra is reimplemented here.
 *
 * Randomness is a seeded `mulberry32` PRNG so a failure always reproduces. Bump
 * SEED only to explore; leave it fixed for CI.
 */

// ---------------------------------------------------------------------------
// Deterministic RNG (mulberry32) — reproducible across machines and runs.
// ---------------------------------------------------------------------------
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

const SEED = 0x51a1e5;
const ITERATIONS = 400;

function makeRng(offset: number): () => number {
  return mulberry32(SEED + offset);
}

function inRange(rng: () => number, min: number, max: number): number {
  return min + (max - min) * rng();
}

function randMatrix(rng: () => number, mag = 6): Matrix2x2 {
  return [
    [inRange(rng, -mag, mag), inRange(rng, -mag, mag)],
    [inRange(rng, -mag, mag), inRange(rng, -mag, mag)],
  ];
}

function randVector(rng: () => number, mag = 6): Vector2 {
  return [inRange(rng, -mag, mag), inRange(rng, -mag, mag)];
}

function randIntMatrix(rng: () => number, mag = 4): Matrix2x2 {
  const r = () => Math.round(inRange(rng, -mag, mag));
  return [
    [r(), r()],
    [r(), r()],
  ];
}

function maxEntryMagnitude(m: Matrix2x2): number {
  return Math.max(
    Math.abs(m[0][0]),
    Math.abs(m[0][1]),
    Math.abs(m[1][0]),
    Math.abs(m[1][1]),
  );
}

/**
 * Relative residual tolerance for reconstruction (`A x ≈ b`). Scales with the
 * magnitudes involved so a legitimately huge (ill-conditioned) solution is not
 * flagged for ordinary floating-point drift, while a small well-conditioned
 * solution is still held to a tight bound.
 */
function residualTolerance(scale: number, b: Vector2, x: Vector2): number {
  return 1e-6 * (1 + magnitude(b) + magnitude(x) * (1 + scale));
}

// ---------------------------------------------------------------------------
// Explicit edge cases — the ones identity/scaling-only tests would miss.
// ---------------------------------------------------------------------------
const ZERO_MATRIX: Matrix2x2 = [
  [0, 0],
  [0, 0],
];

const EDGE_MATRICES: readonly { label: string; m: Matrix2x2 }[] = [
  { label: "zero matrix", m: ZERO_MATRIX },
  { label: "identity", m: requireMatrixExample("identity").matrix },
  { label: "singular-collapse", m: requireMatrixExample("singular-collapse").matrix },
  { label: "projection-x (rank 1)", m: requireMatrixExample("projection-x").matrix },
  { label: "near-singular", m: requireMatrixExample("near-singular").matrix },
  { label: "reflection", m: requireMatrixExample("reflection").matrix },
  { label: "determinant-negative", m: requireMatrixExample("determinant-negative").matrix },
  { label: "diagnostic-asymmetric", m: requireMatrixExample("diagnostic-asymmetric").matrix },
  { label: "grid-bug-repro", m: requireMatrixExample("grid-bug-repro").matrix },
  { label: "eigen-zero", m: requireMatrixExample("eigen-zero").matrix },
  { label: "all-negative", m: [[-2, -3], [-1, -4]] as Matrix2x2 },
  { label: "extreme dynamic range (det=1)", m: [[1e6, 0], [0, 1e-6]] as Matrix2x2 },
  { label: "extreme large", m: [[1e5, 2e5], [3e5, 4e5]] as Matrix2x2 },
  { label: "extreme tiny", m: [[1e-3, 4e-3], [2e-3, 9e-3]] as Matrix2x2 },
];

const SINGULAR_TOL = 1e-9;
const isInvertible = (m: Matrix2x2): boolean =>
  Math.abs(determinant2x2(m)) > SINGULAR_TOL;

// ---------------------------------------------------------------------------
// Property 1: solving an independent system reproduces b (A x = b).
// ---------------------------------------------------------------------------
describe("solved x satisfies A x = b for independent systems", () => {
  it("holds for many random invertible matrices and targets", () => {
    const rng = makeRng(1);
    let tested = 0;
    for (let i = 0; i < ITERATIONS; i += 1) {
      const A = randMatrix(rng);
      const b = randVector(rng);
      if (!isInvertible(A)) continue;
      const x = solveLinearSystem2x2(A, b);
      expect(x).not.toBeNull();
      const reconstructed = matrixVectorMultiply(A, x!);
      const residual = magnitude(subtractVectors(reconstructed, b));
      expect(residual).toBeLessThanOrEqual(
        residualTolerance(maxEntryMagnitude(A), b, x!),
      );
      tested += 1;
    }
    expect(tested).toBeGreaterThan(100);
  });

  it("holds for the explicit invertible edge cases (incl. near-singular & extreme)", () => {
    const rng = makeRng(2);
    for (const { label, m } of EDGE_MATRICES) {
      if (!isInvertible(m)) continue;
      for (let i = 0; i < 10; i += 1) {
        const b = randVector(rng);
        const x = solveLinearSystem2x2(m, b);
        expect(x, label).not.toBeNull();
        const residual = magnitude(subtractVectors(matrixVectorMultiply(m, x!), b));
        expect(residual, label).toBeLessThanOrEqual(
          residualTolerance(maxEntryMagnitude(m), b, x!),
        );
      }
    }
  });

  it("returns null (no unique solution) for every singular edge case", () => {
    for (const { label, m } of EDGE_MATRICES) {
      if (isInvertible(m)) continue;
      const x = solveLinearSystem2x2(m, randVector(makeRng(3)));
      expect(x, label).toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// Property 2: det == 0 agrees with column dependence.
// ---------------------------------------------------------------------------
describe("det ≈ 0 agrees with linear dependence of the columns", () => {
  it("agrees for random and deliberately-dependent matrices", () => {
    const rng = makeRng(4);
    for (let i = 0; i < ITERATIONS; i += 1) {
      // Half the time force dependent columns (col2 = k · col1) to guarantee
      // singular samples, not just generic full-rank ones.
      let A: Matrix2x2;
      if (i % 2 === 0) {
        const col1 = randVector(rng);
        const k = inRange(rng, -3, 3);
        A = [
          [col1[0], k * col1[0]],
          [col1[1], k * col1[1]],
        ];
      } else {
        A = randMatrix(rng);
      }
      const det = determinant2x2(A);
      const col1 = matrixColumn(A, 0);
      const col2 = matrixColumn(A, 1);
      const dependent = areParallel(col1, col2, SINGULAR_TOL);
      expect(Math.abs(det) <= SINGULAR_TOL).toBe(dependent);
    }
  });

  it("all singular edge cases have parallel columns and vice versa", () => {
    for (const { label, m } of EDGE_MATRICES) {
      const dependent = areParallel(matrixColumn(m, 0), matrixColumn(m, 1), SINGULAR_TOL);
      expect(Math.abs(determinant2x2(m)) <= SINGULAR_TOL, label).toBe(dependent);
    }
  });
});

// ---------------------------------------------------------------------------
// Property 3: a matrix acts as a LINEAR map (additivity + homogeneity).
// ---------------------------------------------------------------------------
describe("a matrix–vector product is a linear map", () => {
  it("preserves vector addition: A(u + v) = A u + A v", () => {
    const rng = makeRng(5);
    for (let i = 0; i < ITERATIONS; i += 1) {
      const A = randMatrix(rng);
      const u = randVector(rng);
      const v = randVector(rng);
      const lhs = matrixVectorMultiply(A, addVectors(u, v));
      const rhs = addVectors(matrixVectorMultiply(A, u), matrixVectorMultiply(A, v));
      const scale = maxEntryMagnitude(A);
      expect(magnitude(subtractVectors(lhs, rhs))).toBeLessThanOrEqual(
        1e-9 * (1 + scale) * (1 + magnitude(u) + magnitude(v)),
      );
    }
  });

  it("preserves scalar multiplication: A(c·v) = c·(A v)", () => {
    const rng = makeRng(6);
    for (let i = 0; i < ITERATIONS; i += 1) {
      const A = randMatrix(rng);
      const v = randVector(rng);
      const c = inRange(rng, -8, 8);
      const lhs = matrixVectorMultiply(A, scaleVector(v, c));
      const rhs = scaleVector(matrixVectorMultiply(A, v), c);
      const scale = maxEntryMagnitude(A);
      expect(magnitude(subtractVectors(lhs, rhs))).toBeLessThanOrEqual(
        1e-9 * (1 + scale) * (1 + Math.abs(c)) * (1 + magnitude(v)),
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Property 4: |det| equals the signed area of the transformed unit square.
// ---------------------------------------------------------------------------
describe("|det| equals the (signed) area of the transformed unit square", () => {
  it("holds for many random matrices", () => {
    const rng = makeRng(7);
    for (let i = 0; i < ITERATIONS; i += 1) {
      const A = randMatrix(rng);
      const scale = maxEntryMagnitude(A);
      // assertUnitSquareAreaMatchesDeterminant throws on mismatch; a tolerance
      // that scales with area magnitude keeps extreme cases honest.
      expect(() =>
        assertUnitSquareAreaMatchesDeterminant(A, Math.max(1e-9, 1e-9 * scale * scale)),
      ).not.toThrow();
      // signedParallelogramArea is the signed version — it must equal det.
      expect(signedParallelogramArea(A)).toBe(determinant2x2(A));
    }
  });

  it("holds for every edge case, and sign encodes orientation", () => {
    for (const { label, m } of EDGE_MATRICES) {
      const scale = maxEntryMagnitude(m);
      expect(
        () => assertUnitSquareAreaMatchesDeterminant(m, Math.max(1e-9, 1e-9 * scale * scale)),
        label,
      ).not.toThrow();
    }
    // Reflection reverses orientation (det < 0); identity preserves it.
    expect(determinant2x2(requireMatrixExample("reflection").matrix)).toBeLessThan(0);
    expect(determinant2x2(requireMatrixExample("identity").matrix)).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Property 5: reported eigenpairs satisfy A v = λ v (via assertEigenpair).
// ---------------------------------------------------------------------------
describe("every reported eigenpair satisfies A v = λ v", () => {
  it("holds for random symmetric matrices (guaranteed real eigenvalues)", () => {
    const rng = makeRng(8);
    let checkedPairs = 0;
    for (let i = 0; i < ITERATIONS; i += 1) {
      // Symmetric integer matrices: real spectrum, and integers avoid the
      // near-degenerate flakiness a continuous sample could create.
      const p = Math.round(inRange(rng, -4, 4));
      const q = Math.round(inRange(rng, -4, 4));
      const r = Math.round(inRange(rng, -4, 4));
      const A: Matrix2x2 = [
        [p, q],
        [q, r],
      ];
      const analysis = analyzeEigen2x2(A);
      if (analysis.kind === "distinct-real") {
        for (const pair of analysis.pairs) {
          expect(() => assertEigenpair(A, pair.eigenvalue, pair.eigenvector)).not.toThrow();
          checkedPairs += 1;
        }
      } else if (analysis.kind === "repeated-real") {
        for (const v of analysis.eigenspaceBasis) {
          expect(() => assertEigenpair(A, analysis.eigenvalue, v)).not.toThrow();
          checkedPairs += 1;
        }
      }
    }
    expect(checkedPairs).toBeGreaterThan(100);
  });

  it("holds for the curated eigen examples (distinct, negative, zero, scalar, defective)", () => {
    const ids = [
      "eigen-distinct",
      "eigen-negative",
      "eigen-zero",
      "eigen-repeated-diagonalizable",
      "eigen-repeated-defective",
      "non-uniform-scale",
      "shear-2-1",
    ] as const;
    for (const id of ids) {
      const A = requireMatrixExample(id).matrix;
      const analysis = analyzeEigen2x2(A);
      if (analysis.kind === "distinct-real") {
        for (const pair of analysis.pairs) {
          expect(() => assertEigenpair(A, pair.eigenvalue, pair.eigenvector), id).not.toThrow();
        }
      } else if (analysis.kind === "repeated-real") {
        for (const v of analysis.eigenspaceBasis) {
          expect(() => assertEigenpair(A, analysis.eigenvalue, v), id).not.toThrow();
        }
      }
    }
  });

  it("never fabricates a real eigenvector for a rotation (complex spectrum)", () => {
    const analysis = analyzeEigen2x2(requireMatrixExample("eigen-no-real").matrix);
    expect(analysis.kind).toBe("complex");
  });
});

// ---------------------------------------------------------------------------
// Property 6: inverse ∘ forward is the identity (solve(A, A v) = v).
// ---------------------------------------------------------------------------
describe("inverse ∘ forward returns the original vector", () => {
  it("round-trips many random vectors through invertible matrices", () => {
    const rng = makeRng(9);
    let tested = 0;
    for (let i = 0; i < ITERATIONS; i += 1) {
      const A = randMatrix(rng);
      if (!isInvertible(A)) continue;
      const v = randVector(rng);
      const forward = matrixVectorMultiply(A, v); // A v
      const back = solveLinearSystem2x2(A, forward); // A^{-1} (A v)
      expect(back).not.toBeNull();
      const residual = magnitude(subtractVectors(back!, v));
      expect(residual).toBeLessThanOrEqual(
        residualTolerance(maxEntryMagnitude(A), v, back!),
      );
      tested += 1;
    }
    expect(tested).toBeGreaterThan(100);
  });

  it("round-trips through invertible edge cases (incl. extreme magnitude)", () => {
    const rng = makeRng(10);
    for (const { label, m } of EDGE_MATRICES) {
      if (!isInvertible(m)) continue;
      const v = randVector(rng);
      const back = solveLinearSystem2x2(m, matrixVectorMultiply(m, v));
      expect(back, label).not.toBeNull();
      const residual = magnitude(subtractVectors(back!, v));
      expect(residual, label).toBeLessThanOrEqual(
        residualTolerance(maxEntryMagnitude(m), v, back!),
      );
    }
  });
});

// A tiny guard so `randIntMatrix` participates (used by the fuzz sibling file
// conceptually); keeps the helper honest and avoids an unused-symbol lint.
describe("integer-matrix generator sanity", () => {
  it("produces matrices whose determinant is an integer", () => {
    const rng = makeRng(11);
    for (let i = 0; i < 50; i += 1) {
      const A = randIntMatrix(rng);
      const det = determinant2x2(A);
      expect(Number.isInteger(det)).toBe(true);
    }
  });
});
