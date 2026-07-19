import { describe, expect, it } from "vitest";
import { create, all } from "mathjs";
import { analyzeEigen2x2 } from "../eigen";
import { determinant2x2, matrixVectorMultiply } from "../matrices";
import { requireMatrixExample } from "../examples";

const math = create(all, {});

/** math.js is used only for cross-validation — core ops stay explicit and typed. */
describe("math.js cross-validation", () => {
  it("agrees on determinants for shared examples", () => {
    for (const id of ["shear-2-1", "singular-collapse", "reflection", "rotation"] as const) {
      const matrix = requireMatrixExample(id).matrix;
      const ours = determinant2x2(matrix);
      const theirs = Number(math.det([
        [matrix[0][0], matrix[0][1]],
        [matrix[1][0], matrix[1][1]],
      ]));
      expect(ours).toBeCloseTo(theirs, 10);
    }
  });

  it("agrees on real eigenvalues when they exist", () => {
    const matrix = requireMatrixExample("eigen-distinct").matrix;
    const analysis = analyzeEigen2x2(matrix);
    expect(analysis.kind).toBe("distinct-real");
    if (analysis.kind !== "distinct-real") return;

    const eigs = math.eigs([
      [matrix[0][0], matrix[0][1]],
      [matrix[1][0], matrix[1][1]],
    ]);
    const values = (eigs.values as unknown as number[])
      .map(Number)
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b);
    const ours = analysis.pairs
      .map((pair) => pair.eigenvalue)
      .sort((a, b) => a - b);
    expect(ours[0]).toBeCloseTo(values[0]!, 6);
    expect(ours[1]).toBeCloseTo(values[1]!, 6);

    for (const pair of analysis.pairs) {
      const Av = matrixVectorMultiply(matrix, pair.eigenvector);
      expect(Av[0]).toBeCloseTo(pair.eigenvalue * pair.eigenvector[0], 6);
      expect(Av[1]).toBeCloseTo(pair.eigenvalue * pair.eigenvector[1], 6);
    }
  });
});
