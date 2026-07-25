import { describe, expect, it } from "vitest";
import {
  formatAreaFactor,
  formatLedgerTally,
  formatSceneNumber,
  formatSignedArea,
  orientationSweep,
  orientationWord,
  worstCaseComparisons,
} from "../sceneReadouts";
import {
  determinant2x2,
  requireMatrixExample,
  type Matrix2x2,
} from "../../../math";

/**
 * Readouts a scene DISPLAYS, checked against the mathematics they claim to
 * report.
 *
 * These exist because of two July 2026 audit findings: the determinant headline
 * lagged the geometry through the collapse and flip beats (it was stamped on
 * before and after each morph), and the rank–nullity total was a third literal
 * typed beside the two counts it was meant to be the sum of. Both are now
 * functions, and a function can be held to the mathematics.
 */

const IDENTITY: Matrix2x2 = [
  [1, 0],
  [0, 1],
];

describe("formatLedgerTally", () => {
  it("always reports the total as the sum of the two counts", () => {
    for (const [rank, nullity] of [
      [2, 1],
      [1, 2],
      [0, 3],
      [3, 0],
    ] as const) {
      expect(formatLedgerTally(rank, nullity)).toMatch(
        new RegExp(`=\\s+${rank + nullity}$`),
      );
    }
  });

  it("cannot be made to print an unbalanced ledger", () => {
    // There is no parameter for the total, which is the point: the only way to
    // change it is to change one of the counts the tokens are drawn from.
    expect(formatLedgerTally(2, 1)).toBe("2 survived  +  1 crushed  =  3");
  });
});

describe("determinant readouts", () => {
  it("reports |det| as the area factor", () => {
    expect(formatAreaFactor(6)).toBe("area factor ≈ 6");
    expect(formatAreaFactor(-6)).toBe("area factor ≈ 6");
  });

  it("reports the signed determinant with the orientation it implies", () => {
    expect(formatSignedArea(6)).toContain("orientation kept");
    expect(formatSignedArea(-6)).toContain("orientation reversed");
    expect(formatSignedArea(0)).toContain("flattened");
  });

  it("never prints a negative zero", () => {
    expect(formatSceneNumber(-0)).toBe("0");
    expect(formatSignedArea(-0.0001)).toContain("det(A) ≈ 0");
  });

  it("tracks the live matrix, so the headline cannot lag the geometry", () => {
    // Sampling the interpolation the scene actually animates: the readout is a
    // function of the matrix, so every intermediate frame gets its own value.
    const target = requireMatrixExample("singular-collapse").matrix as Matrix2x2;
    const values = [0, 0.25, 0.5, 0.75, 1].map((t) => {
      const m: Matrix2x2 = [
        [1 + (target[0][0] - 1) * t, target[0][1] * t],
        [target[1][0] * t, 1 + (target[1][1] - 1) * t],
      ];
      return determinant2x2(m);
    });
    expect(new Set(values.map((v) => formatAreaFactor(v))).size).toBe(
      values.length,
    );
    expect(values.at(-1)).toBeCloseTo(0, 9);
  });
});

describe("orientationSweep", () => {
  it("has the sign of the determinant, which is what makes it an orientation cue", () => {
    const cases: Matrix2x2[] = [
      IDENTITY,
      requireMatrixExample("shear-2-1").matrix as Matrix2x2,
      requireMatrixExample("rotation").matrix as Matrix2x2,
      requireMatrixExample("reflection").matrix as Matrix2x2,
      requireMatrixExample("determinant-negative").matrix as Matrix2x2,
      requireMatrixExample("uniform-scale").matrix as Matrix2x2,
    ];
    for (const matrix of cases) {
      const sweep = orientationSweep(matrix);
      const det = determinant2x2(matrix);
      expect(sweep, JSON.stringify(matrix)).not.toBeNull();
      expect(Math.sign(sweep!), JSON.stringify(matrix)).toBe(Math.sign(det));
    }
  });

  it("reverses when the determinant crosses zero", () => {
    const before = orientationSweep([
      [1, 0],
      [0, 1],
    ])!;
    const after = orientationSweep([
      [1, 0],
      [0, -1],
    ])!;
    expect(before).toBeGreaterThan(0);
    expect(after).toBeLessThan(0);
  });

  it("collapses to nothing exactly when the columns are parallel", () => {
    const singular = requireMatrixExample("singular-collapse").matrix as Matrix2x2;
    expect(determinant2x2(singular)).toBeCloseTo(0, 9);
    expect(orientationSweep(singular)).toBeCloseTo(0, 9);
  });

  it("returns null for a degenerate column rather than an arbitrary angle", () => {
    expect(
      orientationSweep([
        [0, 1],
        [0, 1],
      ]),
    ).toBeNull();
  });

  it("always takes the shorter way round", () => {
    for (const matrix of [
      IDENTITY,
      requireMatrixExample("rotation").matrix as Matrix2x2,
      requireMatrixExample("shear-2-1").matrix as Matrix2x2,
    ]) {
      const sweep = orientationSweep(matrix)!;
      expect(Math.abs(sweep)).toBeLessThanOrEqual(Math.PI + 1e-9);
    }
  });
});

describe("orientationWord", () => {
  it("names the flattened case rather than calling near-zero 'kept'", () => {
    expect(orientationWord(0)).toBe("flattened");
    expect(orientationWord(1e-4)).toBe("flattened");
    expect(orientationWord(1)).toBe("orientation kept");
    expect(orientationWord(-1)).toBe("orientation reversed");
  });
});

describe("worstCaseComparisons", () => {
  it("is one comparison per level", () => {
    expect(worstCaseComparisons(2)).toBe(3);
    expect(worstCaseComparisons(6)).toBe(7);
    expect(worstCaseComparisons(0)).toBe(1);
  });
});
