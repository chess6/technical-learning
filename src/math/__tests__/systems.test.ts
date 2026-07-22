import { describe, expect, it } from "vitest";
import {
  classifyLinearSystem2x2,
  classifyRowConstraint,
  solveLinearSystem2x2,
  matrixVectorMultiply,
  type Matrix2x2,
  type Vector2,
} from "../index";

/**
 * The running example shared with Lesson "Linear Systems": independent columns
 * are Lesson 1's basis (v, w); the dependent columns are Lesson 1's dependent
 * pair (v, 2v). Targets reuse Lesson 1's q and r so the trichotomy is exercised
 * against the exact numbers the earlier lesson planted.
 */
// Columns v = (1, 2) and w = (3, -1) → independent, det = -7.
const A_INDEP: Matrix2x2 = [
  [1, 3],
  [2, -1],
];
// Columns (1, 2) and (2, 4) = 2·(1, 2) → dependent, det = 0.
const A_DEP: Matrix2x2 = [
  [1, 2],
  [2, 4],
];

describe("solveLinearSystem2x2", () => {
  it("solves an independent system and the solution satisfies A x = b", () => {
    const b: Vector2 = [-1, 5];
    const x = solveLinearSystem2x2(A_INDEP, b);
    expect(x).not.toBeNull();
    expect(x![0]).toBeCloseTo(2, 9);
    expect(x![1]).toBeCloseTo(-1, 9);
    const check = matrixVectorMultiply(A_INDEP, x!);
    expect(check[0]).toBeCloseTo(b[0], 9);
    expect(check[1]).toBeCloseTo(b[1], 9);
  });

  it("returns null for a singular matrix (no unique solution)", () => {
    expect(solveLinearSystem2x2(A_DEP, [3, 6])).toBeNull();
    expect(solveLinearSystem2x2(A_DEP, [3, 5])).toBeNull();
  });
});

describe("classifyLinearSystem2x2", () => {
  it("independent columns → exactly one solution for any target", () => {
    const c = classifyLinearSystem2x2(A_INDEP, [-1, 5]);
    expect(c.kind).toBe("unique");
    expect(c.independentColumns).toBe(true);
    expect(c.consistent).toBe(true);
    expect(c.determinant).toBeCloseTo(-7, 9);
    expect(c.solution![0]).toBeCloseTo(2, 9);
    expect(c.solution![1]).toBeCloseTo(-1, 9);
  });

  it("dependent columns, b on the column line → infinitely many", () => {
    // b = (3, 6) = 3·(1, 2) lies on the span of the dependent columns.
    const c = classifyLinearSystem2x2(A_DEP, [3, 6]);
    expect(c.kind).toBe("infinite");
    expect(c.independentColumns).toBe(false);
    expect(c.consistent).toBe(true);
    expect(c.solution).toBeNull();
    expect(c.determinant).toBeCloseTo(0, 9);
  });

  it("dependent columns, b off the column line → no solution", () => {
    // b = (3, 5) is not a multiple of (1, 2): parallel lines / unreachable.
    const c = classifyLinearSystem2x2(A_DEP, [3, 5]);
    expect(c.kind).toBe("none");
    expect(c.consistent).toBe(false);
    expect(c.solution).toBeNull();
  });

  it("zero matrix: consistent only when b = 0", () => {
    const zero: Matrix2x2 = [
      [0, 0],
      [0, 0],
    ];
    expect(classifyLinearSystem2x2(zero, [0, 0]).kind).toBe("infinite");
    expect(classifyLinearSystem2x2(zero, [0, 1]).kind).toBe("none");
  });

  it("A = [[0,0],[1,0]], b = 0: infinitely many (a zero row must not become a false line)", () => {
    // Row 1 is 0·x + 0·y = 0 (all-space); row 2 is x = 0 (a line). The solution
    // set is the whole line x = 0 — this is the regression case where a renderer
    // that assumes every row is a line would draw a false x-axis and imply a
    // single intersection.
    const A: Matrix2x2 = [
      [0, 0],
      [1, 0],
    ];
    const c = classifyLinearSystem2x2(A, [0, 0]);
    expect(c.kind).toBe("infinite");
    expect(c.consistent).toBe(true);
  });

  it("agrees with a direct A x = b check on a grid of independent targets", () => {
    for (let bx = -4; bx <= 4; bx += 1) {
      for (let by = -4; by <= 4; by += 1) {
        const c = classifyLinearSystem2x2(A_INDEP, [bx, by]);
        expect(c.kind).toBe("unique");
        const back = matrixVectorMultiply(A_INDEP, c.solution!);
        expect(back[0]).toBeCloseTo(bx, 9);
        expect(back[1]).toBeCloseTo(by, 9);
      }
    }
  });
});

describe("classifyRowConstraint", () => {
  it("a or b nonzero → a line with two distinct points that satisfy it", () => {
    const rc = classifyRowConstraint(1, 3, -1); // x + 3y = -1
    expect(rc.kind).toBe("line");
    if (rc.kind === "line") {
      for (const p of [rc.point1, rc.point2]) {
        expect(1 * p[0] + 3 * p[1]).toBeCloseTo(-1, 9);
      }
      // Distinct points so a line can be drawn.
      expect(rc.point1).not.toEqual(rc.point2);
    }
  });

  it("vertical line b = 0, a ≠ 0 → x = c/a with two distinct points", () => {
    const rc = classifyRowConstraint(2, 0, 6); // 2x = 6 → x = 3
    expect(rc.kind).toBe("line");
    if (rc.kind === "line") {
      expect(rc.point1[0]).toBeCloseTo(3, 9);
      expect(rc.point2[0]).toBeCloseTo(3, 9);
      expect(rc.point1[1]).not.toBeCloseTo(rc.point2[1], 9);
    }
  });

  it("0 = 0 (a = b = c = 0) → all points, not a line", () => {
    expect(classifyRowConstraint(0, 0, 0).kind).toBe("all");
  });

  it("0 = c with c ≠ 0 → empty (impossible), not a line", () => {
    expect(classifyRowConstraint(0, 0, 5).kind).toBe("empty");
    expect(classifyRowConstraint(0, 0, -2).kind).toBe("empty");
  });
});
