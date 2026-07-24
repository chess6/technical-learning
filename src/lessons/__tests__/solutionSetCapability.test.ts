import { describe, expect, it } from "vitest";
import { SOLUTION_SET_ID, getGradingCapability, type ExerciseAnswer } from "../capabilities";
import { gradeExercise } from "../grading";
import { MODULE_ITEMS } from "../moduleItems";
import type { ExerciseDefinition } from "../types";

function item(id: string): ExerciseDefinition {
  const found = MODULE_ITEMS.find((e) => e.id === id);
  if (!found) throw new Error(`missing item ${id}`);
  return found;
}

function answer(value: unknown): ExerciseAnswer {
  return { kind: "custom", capabilityId: SOLUTION_SET_ID, value: value as never };
}

const solsetFresh = item("mod-transfer-solset-fresh");
const cumulative = item("mod-cumulative-elim-solset");
const rect = item("mod-p2-applied-rect");

describe("solution-set grading — consistent transfer item", () => {
  it("accepts the canonical parameterization", () => {
    const result = gradeExercise(
      solsetFresh,
      answer({ consistent: true, freeCount: 1, particular: [3, 0, -1], nullDirections: [[-2, 1, 0]] }),
    );
    expect(result.correct).toBe(true);
  });

  it("accepts ANY valid parameterization (different particular + scaled direction)", () => {
    // (1,1,-1) also solves; (-4,2,0) is a nonzero multiple of the null direction.
    const result = gradeExercise(
      solsetFresh,
      answer({ consistent: true, freeCount: 1, particular: [1, 1, -1], nullDirections: [[-4, 2, 0]] }),
    );
    expect(result.correct).toBe(true);
  });

  it("rejects a particular solution that does not solve Ax=b", () => {
    const result = gradeExercise(
      solsetFresh,
      answer({ consistent: true, freeCount: 1, particular: [0, 0, 0], nullDirections: [[-2, 1, 0]] }),
    );
    expect(result.correct).toBe(false);
    expect(result.feedback).toMatch(/particular/i);
  });

  it("rejects the wrong free-variable count", () => {
    const result = gradeExercise(
      solsetFresh,
      answer({ consistent: true, freeCount: 2, particular: [3, 0, -1], nullDirections: [[-2, 1, 0]] }),
    );
    expect(result.correct).toBe(false);
    expect(result.feedback).toMatch(/free variable/i);
  });

  it("rejects a null direction that is not in Null(A)", () => {
    const result = gradeExercise(
      solsetFresh,
      answer({ consistent: true, freeCount: 1, particular: [3, 0, -1], nullDirections: [[1, 0, 0]] }),
    );
    expect(result.correct).toBe(false);
  });

  it("rejects a zero null direction (must be nonzero)", () => {
    const result = gradeExercise(
      solsetFresh,
      answer({ consistent: true, freeCount: 1, particular: [3, 0, -1], nullDirections: [[0, 0, 0]] }),
    );
    expect(result.correct).toBe(false);
    expect(result.feedback).toMatch(/nonzero/i);
  });

  it("rejects too few directions for the free-variable count", () => {
    const result = gradeExercise(
      solsetFresh,
      answer({ consistent: true, freeCount: 1, particular: [3, 0, -1], nullDirections: [] }),
    );
    expect(result.correct).toBe(false);
  });
});

describe("solution-set grading — field-mutation regression (complete object captured)", () => {
  it("flips to incorrect when a single particular component is mutated", () => {
    const good = gradeExercise(
      cumulative,
      answer({ consistent: true, freeCount: 1, particular: [-2, 8, 0], nullDirections: [[1, -2, 1]] }),
    );
    expect(good.correct).toBe(true);
    const mutated = gradeExercise(
      cumulative,
      answer({ consistent: true, freeCount: 1, particular: [-2, 8, 1], nullDirections: [[1, -2, 1]] }),
    );
    expect(mutated.correct).toBe(false);
  });

  it("flips to incorrect when a single null-direction component is mutated", () => {
    const mutated = gradeExercise(
      cumulative,
      answer({ consistent: true, freeCount: 1, particular: [-2, 8, 0], nullDirections: [[1, -2, 2]] }),
    );
    expect(mutated.correct).toBe(false);
  });
});

describe("solution-set grading — inconsistent (∅) item", () => {
  it("accepts a produced ∅ verdict for the inconsistent rectangular system", () => {
    const result = gradeExercise(rect, answer({ consistent: false }));
    expect(result.correct).toBe(true);
    expect(result.feedback).toMatch(/inconsistent/i);
  });

  it("rejects claiming the inconsistent system has solutions", () => {
    const result = gradeExercise(
      rect,
      answer({ consistent: true, freeCount: 0, particular: [2, 1], nullDirections: [] }),
    );
    expect(result.correct).toBe(false);
  });

  it("rejects claiming a consistent system is ∅", () => {
    const result = gradeExercise(cumulative, answer({ consistent: false }));
    expect(result.correct).toBe(false);
  });
});

describe("solution-set grading — independence path (two free variables)", () => {
  // 2 equations, 4 unknowns ⇒ 2 free variables; a synthetic fixture to exercise
  // the linear-independence check (none of the authored items have 2 free vars).
  const twoFree: ExerciseDefinition = {
    id: "test-two-free",
    type: "custom",
    capabilityId: SOLUTION_SET_ID,
    prompt: "?",
    config: {
      matrix: [
        [1, 0, 1, 0],
        [0, 1, 0, 1],
      ],
      rhs: [2, 3],
      explanation: "",
    },
  };

  it("accepts two independent null directions", () => {
    const result = gradeExercise(
      twoFree,
      answer({
        consistent: true,
        freeCount: 2,
        particular: [2, 3, 0, 0],
        nullDirections: [
          [-1, 0, 1, 0],
          [0, -1, 0, 1],
        ],
      }),
    );
    expect(result.correct).toBe(true);
  });

  it("rejects two dependent null directions even though both lie in Null(A)", () => {
    const result = gradeExercise(
      twoFree,
      answer({
        consistent: true,
        freeCount: 2,
        particular: [2, 3, 0, 0],
        nullDirections: [
          [-1, 0, 1, 0],
          [-2, 0, 2, 0],
        ],
      }),
    );
    expect(result.correct).toBe(false);
    expect(result.feedback).toMatch(/dependent|independent/i);
  });
});

describe("solution-set capability plumbing", () => {
  it("round-trips a consistent answer through serialize/parse", () => {
    const cap = getGradingCapability(solsetFresh);
    const parsed = cap.parseAnswer({
      consistent: true,
      freeCount: 1,
      particular: [3, 0, -1],
      nullDirections: [[-2, 1, 0]],
    });
    const serialized = cap.serializeAnswer(parsed);
    expect(serialized).toEqual({
      consistent: true,
      freeCount: 1,
      particular: [3, 0, -1],
      nullDirections: [[-2, 1, 0]],
    });
  });

  it("is auto-graded (does not require human scoring)", () => {
    const cap = getGradingCapability(rect);
    expect(cap.id).toBe(SOLUTION_SET_ID);
  });
});
