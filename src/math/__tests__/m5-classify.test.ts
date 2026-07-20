import { describe, expect, it } from "vitest";
import {
  assertEigenpair,
  assertUnitSquareAreaMatchesDeterminant,
  classifyDeterminant,
  classifyEigenCandidate,
  lineAngleBetweenVectors,
  requireMatrixExample,
  summarizeEigenAnalysis,
} from "../index";

describe("classifyDeterminant", () => {
  it("classifies expansion, collapse, and orientation reversal", () => {
    expect(classifyDeterminant(requireMatrixExample("uniform-scale").matrix).areaEffect).toBe(
      "expands",
    );
    expect(classifyDeterminant(requireMatrixExample("contraction").matrix).areaEffect).toBe(
      "contracts",
    );
    expect(classifyDeterminant(requireMatrixExample("identity").matrix).areaEffect).toBe(
      "preserves",
    );
    const singular = classifyDeterminant(
      requireMatrixExample("singular-collapse").matrix,
    );
    expect(singular.areaEffect).toBe("collapses");
    expect(Math.abs(singular.det)).toBeLessThan(1e-9);

    const negative = classifyDeterminant(
      requireMatrixExample("determinant-negative").matrix,
    );
    expect(negative.reversesOrientation).toBe(true);
    expect(negative.absDet).toBeGreaterThan(0);
  });

  it("matches unit-square area invariants for asymmetric and singular matrices", () => {
    assertUnitSquareAreaMatchesDeterminant(
      requireMatrixExample("diagnostic-asymmetric").matrix,
    );
    assertUnitSquareAreaMatchesDeterminant(
      requireMatrixExample("singular-collapse").matrix,
    );
    assertUnitSquareAreaMatchesDeterminant(
      requireMatrixExample("near-singular").matrix,
      1e-6,
    );
  });
});

describe("classifyEigenCandidate / summarizeEigenAnalysis", () => {
  const distinct = requireMatrixExample("eigen-distinct").matrix;

  it("rejects the zero vector", () => {
    const result = classifyEigenCandidate(distinct, [0, 0]);
    expect(result.kind).toBe("zero-vector");
  });

  it("detects an eigendirection along e1 for the distinct example", () => {
    const result = classifyEigenCandidate(distinct, [1, 0]);
    expect(result.kind).toBe("eigen-direction");
    if (result.kind === "eigen-direction") {
      expect(result.lambda).toBeCloseTo(3, 5);
    }
  });

  it("reports not-eigen when the candidate leaves its line", () => {
    const result = classifyEigenCandidate(distinct, [1, 1]);
    expect(result.kind).toBe("not-eigen");
  });

  it("summarizes scalar, defective, and complex cases", () => {
    expect(
      summarizeEigenAnalysis(requireMatrixExample("eigen-repeated-diagonalizable").matrix)
        .kind,
    ).toBe("scalar-repeated");
    const defective = summarizeEigenAnalysis(
      requireMatrixExample("eigen-repeated-defective").matrix,
    );
    expect(defective.kind).toBe("defective-repeated");
    expect(defective.directions).toHaveLength(1);
    expect(
      summarizeEigenAnalysis(requireMatrixExample("eigen-no-real").matrix).kind,
    ).toBe("complex");
    expect(
      summarizeEigenAnalysis(requireMatrixExample("eigen-no-real").matrix).directions,
    ).toHaveLength(0);
  });

  it("verifies displayed eigenpairs for the main lesson matrix", () => {
    const summary = summarizeEigenAnalysis(distinct);
    expect(summary.kind).toBe("distinct-real");
    summary.directions.forEach((dir, i) => {
      assertEigenpair(distinct, summary.lambdas[i]!, dir);
    });
  });

  it("treats parallel and antiparallel as zero line angle", () => {
    expect(lineAngleBetweenVectors([1, 0], [2, 0])).toBeCloseTo(0, 9);
    expect(lineAngleBetweenVectors([1, 0], [-3, 0])).toBeCloseTo(0, 9);
  });
});
