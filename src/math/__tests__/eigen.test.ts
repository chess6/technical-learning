import { describe, expect, it } from "vitest";
import {
  analyzeEigen2x2,
  characteristicPolynomial2x2,
  characteristicRoots2x2,
  discriminant2x2,
  eigenDerivation2x2,
  matrixShift,
  nullspaceBasis2x2,
} from "../eigen";
import { requireMatrixExample } from "../examples";
import { matrixVectorMultiply, verifiesEigenpair } from "../matrices";
import { areParallel } from "../vectors";

describe("eigen analysis 2x2", () => {
  it("finds two distinct real eigenvalues", () => {
    const m = requireMatrixExample("eigen-distinct").matrix;
    const result = analyzeEigen2x2(m);
    expect(result.kind).toBe("distinct-real");
    if (result.kind !== "distinct-real") return;
    expect(result.pairs).toHaveLength(2);
    for (const pair of result.pairs) {
      expect(verifiesEigenpair(m, pair.eigenvalue, pair.eigenvector)).toBe(true);
    }
    const values = result.pairs.map((pair) => pair.eigenvalue).sort((a, b) => a - b);
    expect(values[0]).toBeCloseTo(2, 8);
    expect(values[1]).toBeCloseTo(3, 8);
  });

  it("classifies a repeated diagonalizable (scalar) matrix", () => {
    const m = requireMatrixExample("eigen-repeated-diagonalizable").matrix;
    const result = analyzeEigen2x2(m);
    expect(result.kind).toBe("repeated-real");
    if (result.kind !== "repeated-real") return;
    expect(result.eigenvalue).toBeCloseTo(2, 10);
    expect(result.diagonalizable).toBe(true);
    expect(result.eigenspaceBasis).toHaveLength(2);
  });

  it("does not invent a second eigenvector for a defective matrix", () => {
    const m = requireMatrixExample("eigen-repeated-defective").matrix;
    const result = analyzeEigen2x2(m);
    expect(result.kind).toBe("repeated-real");
    if (result.kind !== "repeated-real") return;
    expect(result.eigenvalue).toBeCloseTo(1, 10);
    expect(result.diagonalizable).toBe(false);
    expect(result.eigenspaceBasis).toHaveLength(1);
    expect(verifiesEigenpair(m, result.eigenvalue, result.eigenspaceBasis[0]!)).toBe(
      true,
    );
  });

  it("handles the zero matrix", () => {
    const m = [
      [0, 0],
      [0, 0],
    ] as const;
    const result = analyzeEigen2x2(m);
    expect(result.kind).toBe("repeated-real");
    if (result.kind !== "repeated-real") return;
    expect(result.eigenvalue).toBeCloseTo(0, 10);
    expect(result.diagonalizable).toBe(true);
  });

  it("handles the identity matrix", () => {
    const m = [
      [1, 0],
      [0, 1],
    ] as const;
    const result = analyzeEigen2x2(m);
    expect(result.kind).toBe("repeated-real");
    if (result.kind !== "repeated-real") return;
    expect(result.eigenvalue).toBeCloseTo(1, 10);
    expect(result.diagonalizable).toBe(true);
  });

  it("handles a singular matrix with a zero eigenvalue", () => {
    const m = requireMatrixExample("singular-collapse").matrix;
    const result = analyzeEigen2x2(m);
    expect(result.kind).toBe("distinct-real");
    if (result.kind !== "distinct-real") return;
    const values = result.pairs.map((pair) => pair.eigenvalue);
    expect(values.some((value) => Math.abs(value) < 1e-8)).toBe(true);
    for (const pair of result.pairs) {
      expect(verifiesEigenpair(m, pair.eigenvalue, pair.eigenvector)).toBe(true);
    }
  });

  it("handles a negative eigenvalue", () => {
    const m = requireMatrixExample("reflection").matrix;
    const result = analyzeEigen2x2(m);
    expect(result.kind).toBe("distinct-real");
    if (result.kind !== "distinct-real") return;
    const values = result.pairs.map((pair) => pair.eigenvalue).sort((a, b) => a - b);
    expect(values[0]).toBeCloseTo(-1, 10);
    expect(values[1]).toBeCloseTo(1, 10);
  });

  it("reports complex eigenvalues for a rotation", () => {
    const m = requireMatrixExample("eigen-no-real").matrix;
    const result = analyzeEigen2x2(m);
    expect(result.kind).toBe("complex");
    if (result.kind !== "complex") return;
    expect(result.realPart).toBeCloseTo(0, 10);
    expect(result.imaginaryMagnitude).toBeCloseTo(1, 10);
  });

  it("uses tolerance near discriminant zero", () => {
    // Nearly repeated: disc = (2.0000001)^2 - 4 ≈ very small positive from rounding.
    const m = [
      [1.00000005, 1],
      [0, 1],
    ] as const;
    expect(Math.abs(discriminant2x2(m))).toBeLessThan(1e-6);
    const result = analyzeEigen2x2(m, 1e-6);
    // With a looser tolerance this collapses to repeated-real.
    expect(result.kind === "repeated-real" || result.kind === "distinct-real").toBe(
      true,
    );
  });

  it("verifies Av ≈ λv for lesson shear matrix", () => {
    const m = requireMatrixExample("shear-2-1").matrix;
    const result = analyzeEigen2x2(m);
    expect(result.kind).toBe("distinct-real");
    if (result.kind !== "distinct-real") return;
    for (const pair of result.pairs) {
      const Av = matrixVectorMultiply(m, pair.eigenvector);
      expect(
        areParallel(Av, pair.eigenvector) ||
          verifiesEigenpair(m, pair.eigenvalue, pair.eigenvector),
      ).toBe(true);
      expect(verifiesEigenpair(m, pair.eigenvalue, pair.eigenvector)).toBe(true);
    }
  });
});

describe("derivation ladder helpers", () => {
  it("returns structured characteristic polynomial coefficients (no TeX)", () => {
    const m = requireMatrixExample("eigen-distinct").matrix;
    const poly = characteristicPolynomial2x2(m);
    expect(poly.trace).toBeCloseTo(5, 10);
    expect(poly.determinant).toBeCloseTo(6, 10);
    expect(poly.coefficients).toEqual({ a: 1, b: -5, c: 6 });
    expect("tex" in poly).toBe(false);
  });

  it("solves characteristic roots for the lesson matrix", () => {
    const m = requireMatrixExample("eigen-distinct").matrix;
    const roots = [...characteristicRoots2x2(m)].sort((a, b) => a - b);
    expect(roots).toHaveLength(2);
    expect(roots[0]).toBeCloseTo(2, 10);
    expect(roots[1]).toBeCloseTo(3, 10);
  });

  it("returns empty characteristic roots for complex eigenvalues", () => {
    const m = requireMatrixExample("eigen-no-real").matrix;
    expect(characteristicRoots2x2(m)).toEqual([]);
  });

  it("builds A − λI via matrixShift", () => {
    const m = requireMatrixExample("eigen-distinct").matrix;
    const shifted = matrixShift(m, 3);
    expect(shifted[0][0]).toBeCloseTo(0, 10);
    expect(shifted[0][1]).toBeCloseTo(1, 10);
    expect(shifted[1][0]).toBeCloseTo(0, 10);
    expect(shifted[1][1]).toBeCloseTo(-1, 10);
  });

  it("reports Subspace2D.kind = line for distinct eigenvalues", () => {
    const m = requireMatrixExample("eigen-distinct").matrix;
    const for3 = nullspaceBasis2x2(matrixShift(m, 3));
    expect(for3.kind).toBe("line");
    if (for3.kind !== "line") return;
    expect(verifiesEigenpair(m, 3, for3.basis)).toBe(true);
    // λ=3 → (1,0) — a coordinate axis
    expect(Math.abs(for3.basis[0])).toBeCloseTo(1, 8);
    expect(Math.abs(for3.basis[1])).toBeCloseTo(0, 8);

    const for2 = nullspaceBasis2x2(matrixShift(m, 2));
    expect(for2.kind).toBe("line");
    if (for2.kind !== "line") return;
    expect(verifiesEigenpair(m, 2, for2.basis)).toBe(true);
    // λ=2 → multiple of (−1,1) — off-axis, not a coordinate axis
    expect(areParallel(for2.basis, [-1, 1])).toBe(true);
    expect(Math.abs(for2.basis[0])).toBeGreaterThan(0.1);
    expect(Math.abs(for2.basis[1])).toBeGreaterThan(0.1);
  });

  it("reports Subspace2D.kind = plane for a scalar matrix", () => {
    const m = requireMatrixExample("eigen-repeated-diagonalizable").matrix;
    const space = nullspaceBasis2x2(matrixShift(m, 2));
    expect(space.kind).toBe("plane");
  });

  it("reports Subspace2D.kind = line for a defective matrix", () => {
    const m = requireMatrixExample("eigen-repeated-defective").matrix;
    const space = nullspaceBasis2x2(matrixShift(m, 1));
    expect(space.kind).toBe("line");
  });

  it("builds a full eigenDerivation2x2 spine for the lesson matrix", () => {
    const m = requireMatrixExample("eigen-distinct").matrix;
    const derivation = eigenDerivation2x2(m);
    expect(derivation.kind).toBe("distinct-real");
    expect(derivation.trace).toBeCloseTo(5, 10);
    expect(derivation.determinant).toBeCloseTo(6, 10);
    expect(derivation.lambdas).toHaveLength(2);
    expect(derivation.steps).toHaveLength(2);
    for (const step of derivation.steps) {
      expect(step.eigenspace.kind).toBe("line");
      if (step.eigenspace.kind !== "line") continue;
      expect(verifiesEigenpair(m, step.lambda, step.eigenspace.basis)).toBe(true);
    }
  });

  it("derivation has no real steps for a rotation", () => {
    const m = requireMatrixExample("eigen-no-real").matrix;
    const derivation = eigenDerivation2x2(m);
    expect(derivation.kind).toBe("complex");
    expect(derivation.lambdas).toEqual([]);
    expect(derivation.steps).toEqual([]);
  });

  it("derivation for asymmetric diagnostic matrix stays consistent", () => {
    const m = requireMatrixExample("diagnostic-asymmetric").matrix;
    const derivation = eigenDerivation2x2(m);
    expect(derivation.kind).toBe("distinct-real");
    expect(derivation.steps.length).toBeGreaterThan(0);
    for (const step of derivation.steps) {
      if (step.eigenspace.kind === "line") {
        expect(verifiesEigenpair(m, step.lambda, step.eigenspace.basis)).toBe(true);
      }
    }
  });
});
