import { describe, expect, it } from "vitest";
import {
  differenceLiesInNullspace,
  generateSolution,
  matrixVectorMultiply,
  particularSolution2x2,
  solutionSet2x2,
  type Matrix2x2,
  type Vector2,
} from "../index";
import { LINEAR_SYSTEM_EXAMPLE } from "../../lessons/exampleData";

/**
 * Solution-set structure for `A x = b`, exercised against the SAME shared numbers
 * the earlier lessons use (`systems-default`). The winning insight
 * (docs/courses/linear-algebra/lessons/05-solution-sets/insight.md) is: Sol(A, b) = x_p + Null(A) when consistent,
 * ∅ otherwise — with the corrected scope that a single difference gives at least a
 * line, never the whole set when the null space is 2-dimensional.
 */

const EX = LINEAR_SYSTEM_EXAMPLE;
const A_INDEP = EX.a as unknown as Matrix2x2; // [[1,3],[2,-1]] — det ≠ 0
const A_DEP = EX.aDependent as unknown as Matrix2x2; // [[1,2],[2,4]] — det = 0
const ZERO: Matrix2x2 = [
  [0, 0],
  [0, 0],
];

const solves = (A: Matrix2x2, x: Vector2, b: Vector2, tol = 1e-9): boolean => {
  const img = matrixVectorMultiply(A, x);
  return Math.abs(img[0] - b[0]) <= tol && Math.abs(img[1] - b[1]) <= tol;
};

describe("particularSolution2x2", () => {
  it("returns the unique solution for independent columns", () => {
    const xp = particularSolution2x2(A_INDEP, EX.b as Vector2);
    expect(xp).not.toBeNull();
    expect(xp![0]).toBeCloseTo(2, 9);
    expect(xp![1]).toBeCloseTo(-1, 9);
    expect(solves(A_INDEP, xp!, EX.b as Vector2)).toBe(true);
  });

  it("returns a genuine particular solution for a dependent consistent system", () => {
    const xp = particularSolution2x2(A_DEP, EX.bInfinite as Vector2);
    expect(xp).not.toBeNull();
    // Weight on the nonzero column: (3, 0) with 3·(1,2) = (3,6) = b.
    expect(xp![0]).toBeCloseTo(3, 9);
    expect(xp![1]).toBeCloseTo(0, 9);
    expect(solves(A_DEP, xp!, EX.bInfinite as Vector2)).toBe(true);
  });

  it("returns null for an inconsistent system", () => {
    expect(particularSolution2x2(A_DEP, EX.bNone as Vector2)).toBeNull();
  });

  it("returns the origin for A = 0 with b = 0, and null for A = 0 with b ≠ 0", () => {
    expect(particularSolution2x2(ZERO, [0, 0])).toEqual([0, 0]);
    expect(particularSolution2x2(ZERO, [1, 0])).toBeNull();
  });
});

describe("solutionSet2x2 — the trichotomy × null space", () => {
  it("independent columns ⇒ a single point (for any b — reachability holds)", () => {
    for (const b of [[-1, 5], [0, 0], [7, -3], [2, 2]] as Vector2[]) {
      const set = solutionSet2x2(A_INDEP, b);
      expect(set.kind).toBe("point");
      if (set.kind === "point") expect(solves(A_INDEP, set.particular, b)).toBe(true);
    }
  });

  it("dependent consistent ⇒ an affine line x_p + t·direction", () => {
    const set = solutionSet2x2(A_DEP, EX.bInfinite as Vector2);
    expect(set.kind).toBe("line");
    if (set.kind === "line") {
      expect(solves(A_DEP, set.particular, EX.bInfinite as Vector2)).toBe(true);
      // The direction is a homogeneous solution: A·direction = 0.
      const img = matrixVectorMultiply(A_DEP, set.direction);
      expect(Math.hypot(img[0], img[1])).toBeCloseTo(0, 9);
      // Direction is parallel to (2, -1).
      expect(set.direction[0] * -1 - set.direction[1] * 2).toBeCloseTo(0, 9);
    }
  });

  it("dependent inconsistent ⇒ empty (no particular solution exists)", () => {
    expect(solutionSet2x2(A_DEP, EX.bNone as Vector2).kind).toBe("empty");
  });

  it("homogeneous dependent system ⇒ a line through the origin", () => {
    const set = solutionSet2x2(A_DEP, [0, 0]);
    expect(set.kind).toBe("line");
    if (set.kind === "line") {
      expect(set.particular[0]).toBeCloseTo(0, 9);
      expect(set.particular[1]).toBeCloseTo(0, 9);
    }
  });

  it("A = 0, b = 0 ⇒ the whole plane (nullity 2 — the single-difference caveat)", () => {
    const set = solutionSet2x2(ZERO, [0, 0]);
    expect(set.kind).toBe("plane");
  });
});

describe("difference-of-solutions engine and generativity (lesson invariants)", () => {
  it("any two solutions of a consistent system differ by a null vector", () => {
    const x1: Vector2 = [3, 0];
    const x2: Vector2 = [1, 1];
    expect(solves(A_DEP, x1, EX.bInfinite as Vector2)).toBe(true);
    expect(solves(A_DEP, x2, EX.bInfinite as Vector2)).toBe(true);
    expect(differenceLiesInNullspace(A_DEP, x1, x2)).toBe(true);
  });

  it("generating x_p + t·v stays a solution for every t (adding null vectors)", () => {
    const set = solutionSet2x2(A_DEP, EX.bInfinite as Vector2);
    expect(set.kind).toBe("line");
    if (set.kind !== "line") return;
    for (const t of [-3, -1, 0, 0.5, 2, 4]) {
      const x = generateSolution(set.particular, set.direction, t);
      expect(solves(A_DEP, x, EX.bInfinite as Vector2, 1e-9)).toBe(true);
    }
  });

  it("a third solution follows from two without re-solving", () => {
    const x1: Vector2 = [3, 0];
    const x2: Vector2 = [1, 1];
    const d: Vector2 = [x1[0] - x2[0], x1[1] - x2[1]]; // (2, -1) ∈ Null(A)
    const x3 = generateSolution(x1, d, 1); // (5, -1)
    expect(x3[0]).toBeCloseTo(5, 9);
    expect(x3[1]).toBeCloseTo(-1, 9);
    expect(solves(A_DEP, x3, EX.bInfinite as Vector2)).toBe(true);
  });

  it("a difference of unrelated points is NOT a null vector (guards the engine)", () => {
    expect(differenceLiesInNullspace(A_DEP, [1, 0], [0, 1])).toBe(false);
  });
});
