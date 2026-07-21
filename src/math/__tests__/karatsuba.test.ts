import { describe, expect, it } from "vitest";
import {
  assertBranchLeafCount,
  assertMiddleCoefficientIdentity,
  assertRecombinationEqualsProduct,
  assertThreeProductsMatchNaive,
  foilRegions,
  karatsubaMultiply,
  karatsubaStep,
  KARATSUBA_EXPONENT,
  leafCount,
  middleCoefficient,
  multiplicationCount,
  naiveMultiply,
  normalizeCoefficients,
  recursionTree,
} from "../karatsuba";

describe("middleCoefficient identity", () => {
  it("holds across a digit grid including overflow sums", () => {
    for (let a = 0; a <= 12; a += 1) {
      for (let b = 0; b <= 12; b += 1) {
        for (let c = 0; c <= 9; c += 1) {
          for (let d = 0; d <= 9; d += 1) {
            assertMiddleCoefficientIdentity(a, b, c, d);
            expect(middleCoefficient(a, b, c, d)).toBe(a * d + b * c);
          }
        }
      }
    }
  });
});

describe("karatsubaStep shared examples", () => {
  it("matches the clean example 12×13", () => {
    const step = karatsubaStep(12, 13, 1);
    expect(step.a).toBe(1);
    expect(step.b).toBe(2);
    expect(step.c).toBe(1);
    expect(step.d).toBe(3);
    expect(step.regions).toEqual(foilRegions(1, 2, 1, 3));
    expect(step.regions).toEqual({ ac: 1, ad: 3, bc: 2, bd: 6 });
    expect(step.sumProduct).toBe(12);
    expect(step.z2).toBe(1);
    expect(step.z1).toBe(5);
    expect(step.z0).toBe(6);
    expect(step.product).toBe(156);
    expect(step.coefficientOverflow).toBe(false);
    expect(step.operandWidthGrowth).toBe(false);
    expect(step.normalized.steps).toHaveLength(0);
    expect(step.normalized.blocks).toEqual([6, 5, 1]);
  });

  it("matches the boundary example 78×56", () => {
    const step = karatsubaStep(78, 56, 1);
    expect(step.a).toBe(7);
    expect(step.b).toBe(8);
    expect(step.c).toBe(5);
    expect(step.d).toBe(6);
    expect(step.regions).toEqual({ ac: 35, ad: 42, bc: 40, bd: 48 });
    expect(step.sumProduct).toBe(165);
    expect(step.z2).toBe(35);
    expect(step.z1).toBe(82);
    expect(step.z0).toBe(48);
    expect(step.product).toBe(4368);
    expect(step.coefficientOverflow).toBe(true);
    expect(step.operandWidthGrowth).toBe(true);
    expect(step.normalized.blocks).toEqual([8, 6, 43]);
    expect(step.normalized.steps).toHaveLength(2);
    expect(step.normalized.steps[0]).toEqual({
      level: 0,
      valueBefore: 48,
      digitAfter: 8,
      carryOut: 4,
    });
    expect(step.normalized.steps[1]).toEqual({
      level: 1,
      valueBefore: 86,
      digitAfter: 6,
      carryOut: 8,
    });
  });

  it("matches the recursive top-level split 1234×5678", () => {
    const step = karatsubaStep(1234, 5678, 2);
    expect(step.a).toBe(12);
    expect(step.b).toBe(34);
    expect(step.c).toBe(56);
    expect(step.d).toBe(78);
    expect(step.sumProduct).toBe(46 * 134);
    expect(step.z1).toBe(step.sumProduct - step.z2 - step.z0);
    expect(step.product).toBe(7_006_652);
    expect(step.operandWidthGrowth).toBe(true);
  });
});

describe("normalizeCoefficients", () => {
  it("records the boundary carry sequence", () => {
    const result = normalizeCoefficients(35, 82, 48, 10);
    expect(result.blocks).toEqual([8, 6, 43]);
    expect(result.steps).toHaveLength(2);
  });

  it("records no carries for the clean coefficients", () => {
    const result = normalizeCoefficients(1, 5, 6, 10);
    expect(result.blocks).toEqual([6, 5, 1]);
    expect(result.steps).toHaveLength(0);
  });
});

describe("karatsubaMultiply", () => {
  it("matches naive on the lesson examples", () => {
    expect(karatsubaMultiply(12, 13)).toBe(156);
    expect(karatsubaMultiply(78, 56)).toBe(4368);
    expect(karatsubaMultiply(1234, 5678)).toBe(7_006_652);
    expect(karatsubaMultiply(123, 45)).toBe(123 * 45);
  });

  it("matches naive across random pairs including odd widths", () => {
    for (let i = 0; i < 80; i += 1) {
      const x = Math.floor(Math.random() * 50_000);
      const y = Math.floor(Math.random() * 50_000);
      assertThreeProductsMatchNaive(x, y);
      assertRecombinationEqualsProduct(
        x,
        y,
        Math.max(1, Math.floor(Math.max(String(x).length, String(y).length) / 2)),
      );
    }
  });

  it("returns 0 when either operand is 0", () => {
    expect(karatsubaMultiply(0, 99)).toBe(0);
    expect(karatsubaMultiply(42, 0)).toBe(0);
  });

  it("hits the base case for single-digit operands", () => {
    expect(karatsubaMultiply(7, 8)).toBe(56);
    expect(karatsubaMultiply(9, 123)).toBe(1107);
  });

  it("throws RangeError on negative or non-safe-integer inputs", () => {
    expect(() => karatsubaMultiply(-1, 2)).toThrow(RangeError);
    expect(() => karatsubaMultiply(2, -3)).toThrow(RangeError);
    expect(() => karatsubaMultiply(1.5, 2)).toThrow(RangeError);
    expect(() => karatsubaMultiply(2, Number.MAX_SAFE_INTEGER + 2)).toThrow(
      RangeError,
    );
    expect(() => naiveMultiply(-1, 1)).toThrow(RangeError);
  });
});

describe("complexity helpers", () => {
  it("counts leaves and multiplications", () => {
    expect(leafCount(3, 4)).toBe(81);
    expect(leafCount(4, 3)).toBe(64);
    expect(multiplicationCount(8, 4)).toBe(64);
    expect(multiplicationCount(8, 3)).toBe(27);
    assertBranchLeafCount(1);
    assertBranchLeafCount(2);
    assertBranchLeafCount(4);
    assertBranchLeafCount(8);
    expect(KARATSUBA_EXPONENT).toBeCloseTo(Math.log2(3), 12);
  });

  it("builds a conceptual recursion tree", () => {
    const tree = recursionTree(3, 2);
    expect(tree.branch).toBe(3);
    expect(tree.children).toHaveLength(3);
    expect(tree.children[0]!.children).toHaveLength(3);
  });
});
