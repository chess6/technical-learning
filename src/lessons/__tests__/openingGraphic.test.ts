import { describe, expect, it } from "vitest";
import { OPENING_GRAPHIC } from "../openingGraphic";
import { LINEAR_COMBINATION_EXAMPLE } from "../exampleData";
import {
  applyMatrixToPoints,
  assertPointMatchesMatrixTransform,
  matrixVectorMultiply,
  requireMatrixExample,
  type Matrix2x2,
} from "../../math";

/**
 * The shared opening graphic must transform ONLY through the shared math
 * helpers, so Chapter 0 and Lesson 2 can never drift geometrically.
 */
describe("OPENING_GRAPHIC", () => {
  it("is a closed asymmetric outline with valid anchor indices", () => {
    expect(OPENING_GRAPHIC.outline.length).toBeGreaterThanOrEqual(6);
    const { nose, rightFin } = OPENING_GRAPHIC.anchors;
    expect(OPENING_GRAPHIC.outline[nose]).toBeDefined();
    expect(OPENING_GRAPHIC.outline[rightFin]).toBeDefined();
    // Asymmetric: the right fin is not the mirror of any left vertex.
    const [fx] = OPENING_GRAPHIC.outline[rightFin]!;
    expect(fx).toBeGreaterThan(0);
  });

  it("stays on-frame for teaching-range matrices (|coord| <= 1.7)", () => {
    for (const [x, y] of OPENING_GRAPHIC.outline) {
      expect(Math.abs(x)).toBeLessThanOrEqual(1.7);
      expect(Math.abs(y)).toBeLessThanOrEqual(1.7);
    }
  });

  it.each(["identity", "rotation", "reflection-xy", "projection-x", "shear-2-1"])(
    "transforms every vertex via applyMatrixToPoints for %s",
    (id) => {
      const matrix = requireMatrixExample(id).matrix as Matrix2x2;
      const transformed = applyMatrixToPoints(matrix, OPENING_GRAPHIC.outline);
      transformed.forEach((point, i) => {
        assertPointMatchesMatrixTransform(
          matrix,
          OPENING_GRAPHIC.outline[i]!,
          point,
        );
      });
    },
  );

  it("collapses distinct vertices onto a line under projection (info loss)", () => {
    const projection = requireMatrixExample("projection-x").matrix as Matrix2x2;
    const images = applyMatrixToPoints(projection, OPENING_GRAPHIC.outline);
    // Every image has y = 0 (on the x-axis line).
    for (const [, y] of images) expect(y).toBeCloseTo(0, 10);
  });
});

describe("Lesson 1 example data (q, r, basis order)", () => {
  const EX = LINEAR_COMBINATION_EXAMPLE;
  const B: Matrix2x2 = [
    [EX.v[0], EX.wIndependent[0]],
    [EX.v[1], EX.wIndependent[1]],
  ];

  it("q = 2v - w and [q]_B = (2, -1)", () => {
    const q = matrixVectorMultiply(B, EX.coordinatesInBasisQ);
    expect(q).toEqual(EX.q);
  });

  it("basis order swaps the coordinates: [q]_B' = (-1, 2)", () => {
    const [a, b] = EX.coordinatesInBasisQ;
    expect(EX.coordinatesInBasisPrimeQ).toEqual([b, a]);
  });

  it("r = 3v lies inside span(v) with dependent pair (infinitely many)", () => {
    // r = 3v, and wDependent = 2v, so a*v + b*wDependent = r reduces to a+2b=3.
    expect(EX.r).toEqual([3 * EX.v[0], 3 * EX.v[1]]);
    // Two distinct solutions confirm non-uniqueness: (a,b) = (3,0) and (1,1).
    const sol1 = matrixVectorMultiply(
      [
        [EX.v[0], EX.wDependent[0]],
        [EX.v[1], EX.wDependent[1]],
      ],
      [3, 0],
    );
    const sol2 = matrixVectorMultiply(
      [
        [EX.v[0], EX.wDependent[0]],
        [EX.v[1], EX.wDependent[1]],
      ],
      [1, 1],
    );
    expect(sol1).toEqual(EX.r);
    expect(sol2).toEqual(EX.r);
  });
});
