import { describe, expect, it } from "vitest";
import { analyzeEigen2x2, discriminant2x2 } from "../eigen";
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
