/**
 * Targeted grading tests for the systems-elimination lesson-owned remediation.
 *
 * For every NEW or CHANGED exercise (Packages B–E, corrected), this checks:
 *  - the item is present and resolves to the expected capability;
 *  - a CORRECT answer grades `correct: true`;
 *  - an INCORRECT answer grades `correct: false`.
 * It also verifies the fresh inline systems used by the new items against the
 * shared `src/math` helpers (so a wrong literal in a lesson would fail here, not
 * just self-grade against itself).
 */
import { describe, expect, it } from "vitest";
import {
  COMMITTED_PREDICTION_ID,
  CONSTRUCT_IN_EXPLORER_ID,
  EXERCISE_SEQUENCE_ID,
  MATRIX_ENTRY_ID,
  SELF_CHECK_ID,
  resolveCapabilityId,
  type ExerciseAnswer,
} from "../capabilities";
import { gradeExercise } from "../grading";
import { systemsLesson } from "../systems";
import { eliminationLesson } from "../elimination";
import { solutionSetsLesson } from "../solutionSets";
import type { ExerciseDefinition, LessonDefinition } from "../types";
import {
  classifyLinearSystem2x2,
  matrixVectorMultiply,
  type Matrix2x2,
  type Vector2,
} from "../../math";

function ex(lesson: LessonDefinition, id: string): ExerciseDefinition {
  const found = (lesson.exercises ?? []).find((e) => e.id === id);
  if (!found) throw new Error(`exercise ${id} not found in ${lesson.id}`);
  return found;
}

const mc = (choice: number): ExerciseAnswer => ({
  kind: "custom",
  capabilityId: COMMITTED_PREDICTION_ID,
  value: { committedIndex: choice },
});
const matrix = (entries: number[][]): ExerciseAnswer => ({
  kind: "custom",
  capabilityId: MATRIX_ENTRY_ID,
  value: { entries },
});
const vec = (vector: [number, number]): ExerciseAnswer => ({
  kind: "custom",
  capabilityId: CONSTRUCT_IN_EXPLORER_ID,
  value: { vector },
});
const selfCheck = (selfMark: "understood" | "not-yet"): ExerciseAnswer => ({
  kind: "custom",
  capabilityId: SELF_CHECK_ID,
  value: { text: "learner reasoning", selfMark },
});
const seq = (
  responses: ({ kind: "numeric"; value: number } | { kind: "multiple-choice"; choice: number })[],
): ExerciseAnswer => ({
  kind: "custom",
  capabilityId: EXERCISE_SEQUENCE_ID,
  value: { responses },
});

describe("L3 systems — corrected remediation items", () => {
  it("sys-classify-fresh: committed-MC (E1), correct vs incorrect", () => {
    const e = ex(systemsLesson, "sys-classify-fresh");
    expect(resolveCapabilityId(e)).toBe(COMMITTED_PREDICTION_ID);
    expect(gradeExercise(e, mc(2)).correct).toBe(true);
    expect(gradeExercise(e, mc(0)).correct).toBe(false);
  });

  it("sys-solve-confirm-fresh: sequence produces x, y, and the column confirmation", () => {
    const e = ex(systemsLesson, "sys-solve-confirm-fresh");
    expect(resolveCapabilityId(e)).toBe(EXERCISE_SEQUENCE_ID);
    expect(
      gradeExercise(
        e,
        seq([
          { kind: "numeric", value: -2 },
          { kind: "numeric", value: 3 },
          { kind: "numeric", value: 4 },
        ]),
      ).correct,
    ).toBe(true);
    // wrong column-confirmation step
    expect(
      gradeExercise(
        e,
        seq([
          { kind: "numeric", value: -2 },
          { kind: "numeric", value: 3 },
          { kind: "numeric", value: 0 },
        ]),
      ).correct,
    ).toBe(false);
  });

  it("sys-translate-augmented-fresh: complete [A|b] matrix entry", () => {
    const e = ex(systemsLesson, "sys-translate-augmented-fresh");
    expect(resolveCapabilityId(e)).toBe(MATRIX_ENTRY_ID);
    expect(
      gradeExercise(e, matrix([
        [1, 2, 4],
        [3, 1, -3],
      ])).correct,
    ).toBe(true);
    expect(
      gradeExercise(e, matrix([
        [1, 2, 4],
        [3, 1, 3], // wrong sign on b
      ])).correct,
    ).toBe(false);
  });

  it("sys-construct-inconsistent: a b OFF the columns' line passes; ON the line fails", () => {
    const e = ex(systemsLesson, "sys-construct-inconsistent");
    expect(resolveCapabilityId(e)).toBe(CONSTRUCT_IN_EXPLORER_ID);
    expect(gradeExercise(e, vec([1, 0])).correct).toBe(true); // off span{(1,2)} → none
    expect(gradeExercise(e, vec([2, 4])).correct).toBe(false); // on the line → infinite
  });

  it("sys-reason-dependent-count / proofs: self-check surfaces mirror the self-mark", () => {
    for (const id of ["sys-reason-dependent-count", "sys-prove-consistency", "sys-prove-trichotomy"]) {
      const e = ex(systemsLesson, id);
      expect(resolveCapabilityId(e)).toBe(SELF_CHECK_ID);
      expect(gradeExercise(e, selfCheck("understood")).correct).toBe(true);
      expect(gradeExercise(e, selfCheck("not-yet")).correct).toBe(false);
    }
  });

  it("sys-prove-trichotomy model answer uses a general nonzero null relation (no determinant)", () => {
    const e = ex(systemsLesson, "sys-prove-trichotomy") as Extract<
      ExerciseDefinition,
      { type: "custom" }
    >;
    const model = (e.config as { modelAnswer: string }).modelAnswer;
    expect(model).toMatch(/alpha|\\alpha/);
    expect(model.toLowerCase()).not.toContain("determinant");
  });

  it("sys-solve-confirm-fresh model text mentions elimination-next and determinant-L7, not det here", () => {
    const e = ex(systemsLesson, "sys-solve-confirm-fresh") as Extract<
      ExerciseDefinition,
      { type: "custom" }
    >;
    const steps = (e.config as { steps: { explanation: string }[] }).steps;
    const joined = steps.map((s) => s.explanation).join(" ");
    expect(joined).toContain("elimination");
    expect(joined).toContain("Lesson 7");
    // The determinant may be named as a forward pointer (to L7), but the
    // determinant *argument* (det = … ≠ 0) must not be used to justify the answer.
    expect(joined).not.toContain("det =");
    expect(joined).not.toContain("det $=$");
    expect(joined).not.toContain("\\ne 0");
  });
});

describe("L4 elimination — corrected remediation items", () => {
  it("no exercise duplicates L3's construction (removed elim-construct-inconsistent)", () => {
    expect((eliminationLesson.exercises ?? []).some((e) => e.id === "elim-construct-inconsistent")).toBe(
      false,
    );
  });

  it("elim-diagnose-repair-fresh: identify the wrong op then produce the repaired row", () => {
    const e = ex(eliminationLesson, "elim-diagnose-repair-fresh");
    expect(resolveCapabilityId(e)).toBe(EXERCISE_SEQUENCE_ID);
    expect(
      gradeExercise(
        e,
        seq([
          { kind: "multiple-choice", choice: 1 },
          { kind: "numeric", value: -5 },
          { kind: "numeric", value: -15 },
        ]),
      ).correct,
    ).toBe(true);
    expect(
      gradeExercise(
        e,
        seq([
          { kind: "multiple-choice", choice: 0 },
          { kind: "numeric", value: -5 },
          { kind: "numeric", value: -15 },
        ]),
      ).correct,
    ).toBe(false);
  });

  it("elim-contradiction-row-fresh: elimination result with the 0=2 contradiction row", () => {
    const e = ex(eliminationLesson, "elim-contradiction-row-fresh");
    expect(resolveCapabilityId(e)).toBe(MATRIX_ENTRY_ID);
    expect(
      gradeExercise(e, matrix([
        [1, 2, 1],
        [0, 0, 2],
      ])).correct,
    ).toBe(true);
    expect(
      gradeExercise(e, matrix([
        [1, 2, 1],
        [0, 0, 0], // wrong: would be 0=0
      ])).correct,
    ).toBe(false);
  });

  it("elim-construct-infinite: a b ON the columns' line gives infinitely many", () => {
    const e = ex(eliminationLesson, "elim-construct-infinite");
    expect(resolveCapabilityId(e)).toBe(CONSTRUCT_IN_EXPLORER_ID);
    expect(gradeExercise(e, vec([1, 3])).correct).toBe(true); // on span{(1,3)} → infinite
    expect(gradeExercise(e, vec([1, 0])).correct).toBe(false); // off the line → none
  });
});

describe("L5 solution-sets — corrected remediation items", () => {
  it("sol-produce-parametric-fresh: learner produces x_p, null direction, and an instantiation", () => {
    const e = ex(solutionSetsLesson, "sol-produce-parametric-fresh");
    expect(resolveCapabilityId(e)).toBe(EXERCISE_SEQUENCE_ID);
    expect(
      gradeExercise(
        e,
        seq([
          { kind: "numeric", value: 4 }, // x_p x with y=0
          { kind: "numeric", value: 3 }, // null direction x with y=-1
          { kind: "numeric", value: 10 }, // x at t=2
        ]),
      ).correct,
    ).toBe(true);
    expect(
      gradeExercise(
        e,
        seq([
          { kind: "numeric", value: 4 },
          { kind: "numeric", value: 3 },
          { kind: "numeric", value: 7 }, // wrong instantiation
        ]),
      ).correct,
    ).toBe(false);
  });

  it("sol-freevars-dimension-fresh: produces #free variables and dimension", () => {
    const e = ex(solutionSetsLesson, "sol-freevars-dimension-fresh");
    expect(resolveCapabilityId(e)).toBe(EXERCISE_SEQUENCE_ID);
    expect(
      gradeExercise(
        e,
        seq([
          { kind: "numeric", value: 1 },
          { kind: "numeric", value: 1 },
        ]),
      ).correct,
    ).toBe(true);
    expect(
      gradeExercise(
        e,
        seq([
          { kind: "numeric", value: 2 },
          { kind: "numeric", value: 1 },
        ]),
      ).correct,
    ).toBe(false);
  });

  it("justification self-checks mirror the self-mark", () => {
    for (const id of [
      "sol-justify-existence-multiplicity",
      "sol-justify-one-direction",
      "sol-prove-null-subspace",
      "sol-prove-structure",
    ]) {
      const e = ex(solutionSetsLesson, id);
      expect(resolveCapabilityId(e)).toBe(SELF_CHECK_ID);
      expect(gradeExercise(e, selfCheck("understood")).correct).toBe(true);
      expect(gradeExercise(e, selfCheck("not-yet")).correct).toBe(false);
    }
  });
});

describe("fresh inline systems verified against src/math", () => {
  it("L3 classification system 2x+4y=5, x+2y=3 is inconsistent (none)", () => {
    const A: Matrix2x2 = [
      [2, 4],
      [1, 2],
    ];
    expect(classifyLinearSystem2x2(A, [5, 3] as Vector2).kind).toBe("none");
  });

  it("L4 fresh inconsistent system 1x+2y=1, 4x+8y=6 is 'none' and eliminates to (0,0,2)", () => {
    const A: Matrix2x2 = [
      [1, 2],
      [4, 8],
    ];
    expect(classifyLinearSystem2x2(A, [1, 6] as Vector2).kind).toBe("none");
    // R2 -> R2 - 4 R1 on augmented rows
    const r1 = [1, 2, 1];
    const r2 = [4, 8, 6];
    const newR2 = r2.map((v, i) => v - 4 * r1[i]!);
    expect(newR2).toEqual([0, 0, 2]);
  });

  it("L5 fresh parametric system 1x+3y=4, 2x+6y=8: x_p=(4,0), null=(3,-1), t=2 → (10,-2)", () => {
    const A: Matrix2x2 = [
      [1, 3],
      [2, 6],
    ];
    expect(matrixVectorMultiply(A, [4, 0] as Vector2)).toEqual([4, 8]); // A x_p = b
    expect(matrixVectorMultiply(A, [3, -1] as Vector2)).toEqual([0, 0]); // null vector
    expect(matrixVectorMultiply(A, [10, -2] as Vector2)).toEqual([4, 8]); // point at t=2 solves it
  });

  it("L5 free-variable system 3x+y=0, 6x+2y=0 is dependent (nullity 1)", () => {
    const A: Matrix2x2 = [
      [3, 1],
      [6, 2],
    ];
    const c = classifyLinearSystem2x2(A, [0, 0] as Vector2);
    expect(c.determinant).toBeCloseTo(0, 9);
    expect(c.kind).toBe("infinite"); // homogeneous + dependent → a line of solutions
  });
});
