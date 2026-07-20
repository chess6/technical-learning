import { describe, expect, it } from "vitest";
import {
  EIGEN_3D_EXTENSION_CHAR_POLY,
  EIGEN_3D_EXTENSION_EXAMPLE,
  EIGEN_3D_EXTENSION_MATRIX,
} from "../examples3";
import {
  eigenDirectionForEigenvalue3,
  verifiesEigenpair3,
} from "../eigen3";
import {
  addMatrices3,
  applyMatrixToUnitCube,
  approximatelyEqualMatrix3,
  approximatelyEqualVector3,
  collapseDimension3,
  determinant3x3,
  IDENTITY_MATRIX_3,
  magnitude3,
  matrixMatrixMultiply3,
  matrixShift3,
  matrixVectorMultiply3,
  nullity3x3,
  rank3x3,
  scaleMatrix3,
  scaleVector3,
  type Matrix3x3,
} from "../matrices3";

describe("3×3 curated eigen extension example", () => {
  const example = EIGEN_3D_EXTENSION_EXAMPLE;
  const A = example.matrix;
  const lambda = example.eigenvalue;
  const v = example.eigendirection;

  it("satisfies Av ≈ λv for the declared eigenpair", () => {
    expect(verifiesEigenpair3(A, lambda, v, 1e-9)).toBe(true);
    const Av = matrixVectorMultiply3(A, v);
    expect(approximatelyEqualVector3(Av, scaleVector3(v, lambda), 1e-9)).toBe(
      true,
    );
  });

  it("has det(A − λI) ≈ 0", () => {
    const shifted = matrixShift3(A, lambda);
    expect(Math.abs(determinant3x3(shifted))).toBeLessThan(1e-9);
  });

  it("exposes a nonzero, safely normalized eigendirection", () => {
    expect(magnitude3(v)).toBeGreaterThan(0.99);
    expect(Math.abs(magnitude3(v) - 1)).toBeLessThan(1e-9);
    const fromNullspace = eigenDirectionForEigenvalue3(A, lambda);
    expect(fromNullspace).not.toBeNull();
    // Same line (parallel or antiparallel).
    const aligned =
      approximatelyEqualVector3(fromNullspace!, v, 1e-6) ||
      approximatelyEqualVector3(fromNullspace!, scaleVector3(v, -1), 1e-6);
    expect(aligned).toBe(true);
  });

  it("claims collapse to a plane matching rank(A − λI) = 2", () => {
    const shifted = matrixShift3(A, lambda);
    expect(rank3x3(shifted)).toBe(2);
    expect(nullity3x3(shifted)).toBe(1);
    expect(collapseDimension3(shifted)).toBe("plane");
    expect(example.collapseUnderShift).toBe("plane");
  });

  it("has exactly one real eigenvalue via the curated characteristic polynomial", () => {
    const { realRoot, quadratic } = EIGEN_3D_EXTENSION_CHAR_POLY;
    expect(realRoot).toBe(1.5);
    expect(quadratic.b).toBe(1.5);
    expect(quadratic.c).toBe(2.25);

    // Quadratic discriminant: b² − 4c = 2.25 − 9 = −6.75 < 0.
    const disc = quadratic.b * quadratic.b - 4 * quadratic.c;
    expect(disc).toBeCloseTo(-6.75, 12);
    expect(disc).toBeLessThan(0);

    // Cayley–Hamilton / factorization check:
    // χ_A(A) = (A − 1.5 I)(A² + 1.5 A + 2.25 I) ≈ 0.
    const A2 = matrixMatrixMultiply3(A, A);
    const quad: Matrix3x3 = addMatrices3(
      addMatrices3(A2, scaleMatrix3(A, quadratic.b)),
      scaleMatrix3(IDENTITY_MATRIX_3, quadratic.c),
    );
    const factor = matrixMatrixMultiply3(matrixShift3(A, realRoot), quad);
    expect(approximatelyEqualMatrix3(factor, scaleMatrix3(IDENTITY_MATRIX_3, 0), 1e-9)).toBe(
      true,
    );

    // Sample χ_A(t) = det(A − t I) against the declared factorization at a few t.
    const chi = (t: number): number =>
      (t - realRoot) * (t * t + quadratic.b * t + quadratic.c);
    for (const t of [-2, -0.5, 0, 0.75, 1.5, 2, 3]) {
      const detShift = determinant3x3(matrixShift3(A, t));
      // det(A − t I) = (−1)³ det(t I − A) = −χ_A(t) with monic χ_A(t)=det(tI−A).
      // Our det(A − t I) = det(−(t I − A)) = (−1)³ det(t I − A) = −χ_A(t).
      expect(detShift).toBeCloseTo(-chi(t), 9);
    }
  });

  it("does not invent a second real eigendirection for a non-eigenvalue", () => {
    // A probe at an unrelated real number must not yield a fabricated direction
    // that accidentally verifies as an eigenpair.
    const bogus = eigenDirectionForEigenvalue3(A, 0);
    if (bogus) {
      expect(verifiesEigenpair3(A, 0, bogus, 1e-4)).toBe(false);
    }
  });

  it("matches the authored 1.5·P matrix entries", () => {
    expect(EIGEN_3D_EXTENSION_MATRIX).toEqual([
      [0, 0, 1.5],
      [1.5, 0, 0],
      [0, 1.5, 0],
    ]);
  });

  // The 3D extension scene claims: a single application of A turns each
  // ordinary vector (it is NOT parallel to its image) while scaling its length
  // by exactly 1.5. These regression tests keep the rendered arrows honest.
  describe("single-application behaviour shown in the 3D scene", () => {
    const cross = (a: typeof v, b: typeof v): typeof v => [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];

    it("scales every ordinary vector's length by exactly 1.5 (P is orthogonal)", () => {
      for (const vec of example.ordinaryVectors) {
        const image = matrixVectorMultiply3(A, vec);
        expect(magnitude3(image)).toBeCloseTo(1.5 * magnitude3(vec), 9);
      }
    });

    it("turns ordinary vectors off their ray (single application is not a scale)", () => {
      for (const vec of example.ordinaryVectors) {
        const image = matrixVectorMultiply3(A, vec);
        // Non-parallel ⇒ nonzero cross product. Confirms a genuine 120° turn,
        // not the outward spiral that only appears under repeated application.
        expect(magnitude3(cross(vec, image))).toBeGreaterThan(1e-6);
      }
    });

    it("keeps v and Av collinear along the eigendirection", () => {
      const vAlong = scaleVector3(v, 1.15);
      const image = matrixVectorMultiply3(A, vAlong);
      expect(magnitude3(cross(vAlong, image))).toBeLessThan(1e-9);
    });
  });

  // The 3D "shift-collapse" scene renders the image of A − λI as a flat plane
  // whose normal is the eigendirection (1,1,1): every column of A − λI has a
  // zero coordinate-sum, so the whole image lies in { x + y + z = 0 }.
  it("collapses the unit cube into the plane x + y + z = 0", () => {
    const shifted = matrixShift3(A, lambda);
    for (const corner of applyMatrixToUnitCube(shifted)) {
      expect(corner[0] + corner[1] + corner[2]).toBeCloseTo(0, 9);
    }
  });
});

describe("matrixVectorMultiply3 / determinant3x3 basics", () => {
  it("multiplies identity correctly", () => {
    expect(
      matrixVectorMultiply3(IDENTITY_MATRIX_3, [2, -3, 4]),
    ).toEqual([2, -3, 4]);
  });

  it("computes det(I) = 1 and det of a singular shift ≈ 0", () => {
    expect(determinant3x3(IDENTITY_MATRIX_3)).toBeCloseTo(1, 12);
    expect(
      Math.abs(
        determinant3x3(matrixShift3(EIGEN_3D_EXTENSION_MATRIX, 1.5)),
      ),
    ).toBeLessThan(1e-9);
  });
});
