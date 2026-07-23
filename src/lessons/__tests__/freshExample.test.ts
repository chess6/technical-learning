import { describe, expect, it } from "vitest";
import {
  classifyLinearSystem2x2,
  differenceLiesInNullspace,
  generateSolution,
  matrixVectorMultiply,
  particularSolution2x2,
  solutionSet2x2,
  solveLinearSystem2x2,
  type Matrix2x2,
  type Vector2,
} from "../../math";
import { LINEAR_SYSTEM_FRESH } from "../exampleData";

/**
 * Every number in the module's fresh-instance example (`systems-fresh`) verified
 * against the shared `src/math` source of truth — so the L3/L4/L5 fresh drills
 * (Package B) grade against mathematically confirmed answers, not hand-typed ones.
 * The matrices are asymmetric (independent det = -5; a genuinely dependent pair),
 * per the math-visualization-correctness rule.
 */

const EX = LINEAR_SYSTEM_FRESH;
const A_INDEP = EX.a as unknown as Matrix2x2; // columns (1,3),(2,1)
const A_DEP = EX.aDependent as unknown as Matrix2x2; // columns (1,2),(3,6)

const solves = (A: Matrix2x2, x: Vector2, b: Vector2, tol = 1e-9): boolean => {
  const img = matrixVectorMultiply(A, x);
  return Math.abs(img[0] - b[0]) <= tol && Math.abs(img[1] - b[1]) <= tol;
};

describe("systems-fresh — distinct from systems-default", () => {
  it("uses different numbers than the taught running example", () => {
    // Guards against a copy-paste that would reintroduce near-copy drills.
    expect(EX.solution).not.toEqual([2, -1]);
    expect(EX.b).not.toEqual([-1, 5]);
    expect(EX.nullDirection).not.toEqual([2, -1]);
    expect(EX.thirdSolution).not.toEqual([5, -1]);
  });
});

describe("systems-fresh independent system (L3 solve + L4 elimination)", () => {
  it("is genuinely independent (det = -5)", () => {
    expect(classifyLinearSystem2x2(A_INDEP, EX.b as Vector2).determinant).toBeCloseTo(-5, 9);
    expect(classifyLinearSystem2x2(A_INDEP, EX.b as Vector2).independentColumns).toBe(true);
  });

  it("has the unique solution (-2, 3) by Cramer", () => {
    const x = solveLinearSystem2x2(A_INDEP, EX.b as Vector2);
    expect(x).not.toBeNull();
    expect(x![0]).toBeCloseTo(EX.solution[0], 9);
    expect(x![1]).toBeCloseTo(EX.solution[1], 9);
    expect(solves(A_INDEP, EX.solution as Vector2, EX.b as Vector2)).toBe(true);
  });

  it("forward elimination arithmetic is clean (multiplier 3, row (0,-5|-15), y=3, x=-2)", () => {
    // Row form: x + 2y = 4 ; 3x + y = -3. Pivot R1 = (1,2|4); R2 = (3,1|-3).
    const r1 = [1, 2, 4];
    const r2 = [3, 1, -3];
    const multiplier = r2[0]! / r1[0]!; // 3/1
    expect(multiplier).toBe(3);
    const r2New = r2.map((v, i) => v - multiplier * r1[i]!); // (0,-5,-15)
    expect(r2New).toEqual([0, -5, -15]);
    const y = r2New[2]! / r2New[1]!; // -15/-5
    expect(y).toBe(3);
    const x = r1[2]! - r1[1]! * y; // 4 - 2*3
    expect(x).toBe(-2);
  });
});

describe("systems-fresh dependent system (L5 solution sets + construction)", () => {
  it("bInfinite = (4,8) is consistent with a whole line of solutions", () => {
    const cls = classifyLinearSystem2x2(A_DEP, EX.bInfinite as Vector2);
    expect(cls.independentColumns).toBe(false);
    expect(cls.consistent).toBe(true);
    expect(cls.kind).toBe("infinite");
  });

  it("particular (4,0), null direction (3,-1), and third (7,-1) are all solutions", () => {
    const xp = particularSolution2x2(A_DEP, EX.bInfinite as Vector2);
    expect(xp).not.toBeNull();
    expect(solves(A_DEP, EX.particular as Vector2, EX.bInfinite as Vector2)).toBe(true);
    // The null direction is genuinely homogeneous.
    expect(solves(A_DEP, EX.nullDirection as Vector2, [0, 0])).toBe(true);
    // Third = particular + null; a solution made without re-solving.
    const third = generateSolution(EX.particular as Vector2, EX.nullDirection as Vector2, 1);
    expect(third[0]).toBeCloseTo(EX.thirdSolution[0], 9);
    expect(third[1]).toBeCloseTo(EX.thirdSolution[1], 9);
    expect(solves(A_DEP, EX.thirdSolution as Vector2, EX.bInfinite as Vector2)).toBe(true);
    // Difference of two solutions lands in the null space.
    expect(
      differenceLiesInNullspace(A_DEP, EX.thirdSolution as Vector2, EX.particular as Vector2),
    ).toBe(true);
  });

  it("the consistent dependent solution set is an affine line", () => {
    const set = solutionSet2x2(A_DEP, EX.bInfinite as Vector2);
    expect(set.kind).toBe("line");
  });

  it("bNone = (4,9) is off the column line: no solution", () => {
    expect(classifyLinearSystem2x2(A_DEP, EX.bNone as Vector2).kind).toBe("none");
    expect(solutionSet2x2(A_DEP, EX.bNone as Vector2).kind).toBe("empty");
    expect(particularSolution2x2(A_DEP, EX.bNone as Vector2)).toBeNull();
  });
});
