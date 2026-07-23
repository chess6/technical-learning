/**
 * Targeted grading tests for the systems-elimination lesson-owned remediation.
 *
 * For every NEW or CHANGED exercise, this checks:
 *  - the item is present and resolves to the expected capability;
 *  - a CORRECT answer grades `correct: true`;
 *  - an INCORRECT answer grades `correct: false`, including a wrong value in EACH
 *    component the item claims to capture (both coordinates of a column
 *    confirmation; every component of a produced parametric set);
 *  - the fresh inline systems used by the new items are verified against the
 *    shared `src/math` helpers (so a wrong literal in a lesson fails here, not just
 *    self-grades against itself).
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
  type ExerciseSequenceConfig,
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

function stepsOf(e: ExerciseDefinition) {
  if (e.type !== "custom") throw new Error(`exercise ${e.id} is not a custom exercise`);
  return (e.config as ExerciseSequenceConfig).steps;
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
type SeqResponse =
  | { kind: "numeric"; value: number }
  | { kind: "multiple-choice"; choice: number }
  | { kind: "vector"; value: [number, number] }
  | { kind: "construct"; value: [number, number] }
  | { kind: "text"; value: string };
const seq = (responses: SeqResponse[]): ExerciseAnswer => ({
  kind: "custom",
  capabilityId: EXERCISE_SEQUENCE_ID,
  value: { responses },
});
const nums = (values: number[]): ExerciseAnswer =>
  seq(values.map((value) => ({ kind: "numeric", value })));
const num = (value: number): SeqResponse => ({ kind: "numeric", value });
const svec = (x: number, y: number): SeqResponse => ({ kind: "vector", value: [x, y] });
const scons = (x: number, y: number): SeqResponse => ({ kind: "construct", value: [x, y] });
const stext = (value: string): SeqResponse => ({ kind: "text", value });

describe("L3 systems — corrected remediation items", () => {
  it("sys-classify-fresh: committed-MC (E1) recognition backup, correct vs incorrect", () => {
    const e = ex(systemsLesson, "sys-classify-fresh");
    expect(resolveCapabilityId(e)).toBe(COMMITTED_PREDICTION_ID);
    expect(gradeExercise(e, mc(2)).correct).toBe(true);
    expect(gradeExercise(e, mc(0)).correct).toBe(false);
  });

  it("sys-classify-produce-fresh: PRODUCE witness + TYPE count per system (E3); no MC, no early class reveal", () => {
    const e = ex(systemsLesson, "sys-classify-produce-fresh");
    expect(resolveCapabilityId(e)).toBe(EXERCISE_SEQUENCE_ID);
    const steps = stepsOf(e);
    // 6 steps: [construct A sol, TEXT count=one, construct B other sol, TEXT count=∞,
    //           numeric C contradiction, TEXT count=none]. The count steps are TYPED
    // (`text`), NOT multiple-choice — classification is produced, not recognized.
    expect(steps).toHaveLength(6);
    expect(steps.map((s) => s.kind)).toEqual([
      "construct",
      "text",
      "construct",
      "text",
      "numeric",
      "text",
    ]);
    // No count step is a multiple choice (no classifications displayed as choices).
    expect(steps.some((s) => s.kind === "multiple-choice")).toBe(false);
    // The witness (construct/numeric) steps must NOT name the classification.
    for (const i of [0, 2, 4]) {
      const explanation = (steps[i] as { explanation: string }).explanation.toLowerCase();
      expect(explanation).not.toContain("no solution");
      expect(explanation).not.toContain("exactly one");
      expect(explanation).not.toContain("infinitely many");
    }
    // Fully correct: A=(2,1) → "one"; B second sol (3,0)≠(0,3) → "infinitely many";
    // C contradiction 4 → "none".
    expect(
      gradeExercise(
        e,
        seq([scons(2, 1), stext("one"), scons(3, 0), stext("infinitely many"), num(4), stext("none")]),
      ).correct,
    ).toBe(true);
    // Accepted spellings normalize: numeric "1"/"0" and "infinity"/"∞", plus case
    // and trailing punctuation.
    expect(
      gradeExercise(
        e,
        seq([scons(2, 1), stext("1"), scons(3, 0), stext("infinity"), num(4), stext("0")]),
      ).correct,
    ).toBe(true);
    expect(
      gradeExercise(
        e,
        seq([scons(2, 1), stext("Exactly one."), scons(3, 0), stext("∞"), num(4), stext("No solution")]),
      ).correct,
    ).toBe(true);
    // A different valid A-solution still passes (predicate-graded), so does a
    // different valid distinct B-solution.
    expect(
      gradeExercise(
        e,
        seq([scons(2, 1), stext("one"), scons(1, 2), stext("infinitely many"), num(4), stext("none")]),
      ).correct,
    ).toBe(true);
    // Each field independently mutated must fail:
    expect(
      gradeExercise(
        e,
        seq([scons(3, 3), stext("one"), scons(3, 0), stext("infinitely many"), num(4), stext("none")]),
      ).correct,
    ).toBe(false); // A witness not a solution
    // A CORRECT witness with a WRONG typed classification still fails (the count
    // is genuinely graded, not a rubber stamp on the witness).
    expect(
      gradeExercise(
        e,
        seq([scons(2, 1), stext("none"), scons(3, 0), stext("infinitely many"), num(4), stext("none")]),
      ).correct,
    ).toBe(false); // A count wrong (typed "none")
    expect(
      gradeExercise(
        e,
        seq([scons(2, 1), stext("one"), scons(0, 3), stext("infinitely many"), num(4), stext("none")]),
      ).correct,
    ).toBe(false); // B "different" solution is the excluded given one
    expect(
      gradeExercise(
        e,
        seq([scons(2, 1), stext("one"), scons(3, 0), stext("one"), num(4), stext("none")]),
      ).correct,
    ).toBe(false); // B count wrong (typed "one")
    expect(
      gradeExercise(
        e,
        seq([scons(2, 1), stext("one"), scons(3, 0), stext("infinitely many"), num(5), stext("none")]),
      ).correct,
    ).toBe(false); // C contradiction value wrong
    expect(
      gradeExercise(
        e,
        seq([scons(2, 1), stext("one"), scons(3, 0), stext("infinitely many"), num(4), stext("infinitely many")]),
      ).correct,
    ).toBe(false); // C count wrong (typed "infinitely many")
    // Empty / unrecognized text fails.
    expect(
      gradeExercise(
        e,
        seq([scons(2, 1), stext("  "), scons(3, 0), stext("infinitely many"), num(4), stext("none")]),
      ).correct,
    ).toBe(false);
    expect(
      gradeExercise(
        e,
        seq([scons(2, 1), stext("two"), scons(3, 0), stext("infinitely many"), num(4), stext("none")]),
      ).correct,
    ).toBe(false);
  });

  it("sys-solve-confirm-fresh: FULL two-coordinate column confirmation (both entries checked)", () => {
    const e = ex(systemsLesson, "sys-solve-confirm-fresh");
    expect(resolveCapabilityId(e)).toBe(EXERCISE_SEQUENCE_ID);
    // x, y, first column entry (4), second column entry (-3)
    expect(stepsOf(e)).toHaveLength(4);
    expect(gradeExercise(e, nums([-2, 3, 4, -3])).correct).toBe(true);
    // wrong FIRST column coordinate fails
    expect(gradeExercise(e, nums([-2, 3, 0, -3])).correct).toBe(false);
    // wrong SECOND column coordinate fails (the entire vector must equal b)
    expect(gradeExercise(e, nums([-2, 3, 4, 0])).correct).toBe(false);
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

  it("sys-characterize-parameter-fresh: E4 GENERAL boundary v=2u (find h, slope c, construct both sides)", () => {
    const e = ex(systemsLesson, "sys-characterize-parameter-fresh");
    expect(resolveCapabilityId(e)).toBe(EXERCISE_SEQUENCE_ID);
    const steps = stepsOf(e);
    // 4 steps: numeric h, numeric slope c, construct inconsistent b, construct consistent b
    expect(steps).toHaveLength(4);
    expect(steps.map((s) => s.kind)).toEqual(["numeric", "numeric", "construct", "construct"]);
    // h=6, c=2, an off-line (inconsistent) target, an on-line (consistent) target.
    expect(gradeExercise(e, seq([num(6), num(2), scons(1, 0), scons(1, 2)])).correct).toBe(true);
    // A DIFFERENT valid consistent/inconsistent pair still passes (predicate-graded).
    expect(gradeExercise(e, seq([num(6), num(2), scons(0, 3), scons(2, 4)])).correct).toBe(true);
    // Each field independently mutated fails:
    expect(gradeExercise(e, seq([num(4), num(2), scons(1, 0), scons(1, 2)])).correct).toBe(false); // wrong h
    expect(gradeExercise(e, seq([num(6), num(3), scons(1, 0), scons(1, 2)])).correct).toBe(false); // wrong slope c
    expect(gradeExercise(e, seq([num(6), num(2), scons(1, 2), scons(1, 2)])).correct).toBe(false); // "inconsistent" is on the line
    expect(gradeExercise(e, seq([num(6), num(2), scons(1, 0), scons(1, 0)])).correct).toBe(false); // "consistent" is off the line
    expect(gradeExercise(e, seq([num(6), num(2), scons(1, 0), scons(0, 0)])).correct).toBe(false); // zero vector rejected (vector-on-line requires nonzero)
  });

  it("sys-reason-dependent-count / proofs: self-check surfaces mirror the self-mark", () => {
    for (const id of ["sys-reason-dependent-count", "sys-prove-consistency", "sys-prove-trichotomy"]) {
      const e = ex(systemsLesson, id);
      expect(resolveCapabilityId(e)).toBe(SELF_CHECK_ID);
      expect(gradeExercise(e, selfCheck("understood")).correct).toBe(true);
      expect(gradeExercise(e, selfCheck("not-yet")).correct).toBe(false);
    }
  });

  it("sys-reason-dependent-count model uses a general nonzero relation (zero column & zero matrix)", () => {
    const e = ex(systemsLesson, "sys-reason-dependent-count") as Extract<
      ExerciseDefinition,
      { type: "custom" }
    >;
    const model = (e.config as { modelAnswer: string }).modelAnswer;
    expect(model).toMatch(/alpha|\\alpha/);
    // must cover the degenerate cases, not just a2 = c a1
    expect(model.toLowerCase()).toContain("zero first column");
    expect(model).toContain("A = \\mathbf{0}");
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

  it("no learner-facing 'determinant is next' claim survives in L3", () => {
    const haystacks: string[] = [];
    for (const s of systemsLesson.sections) haystacks.push(s.title, s.body);
    for (const f of systemsLesson.formalBlocks ?? []) {
      haystacks.push(f.interpretation ?? "");
      for (const l of f.layers ?? []) haystacks.push(l.title, l.body);
    }
    haystacks.push(systemsLesson.keyTakeaway ?? "");
    const text = haystacks.join(" ").toLowerCase();
    // The determinant must never be presented as the *next* lesson; it is L7.
    expect(text).not.toContain("why the determinant is next");
    expect(text).not.toContain("the determinant is next");
    expect(text).not.toContain("next lesson introduces a single number");
    // ...and "the next lesson" must not introduce the determinant within a sentence.
    expect(text).not.toMatch(/the next lesson[^.]*\bdeterminant\b/);
    expect(text).not.toMatch(/the next lesson[^.]*single number/);
    // Elimination is named as the next lesson somewhere.
    expect(text).toContain("elimination");
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

  it("elim-diagnose-repair-fresh: PRODUCED diagnosis (numeric) + repair on an unfamiliar system", () => {
    const e = ex(eliminationLesson, "elim-diagnose-repair-fresh");
    expect(resolveCapabilityId(e)).toBe(EXERCISE_SEQUENCE_ID);
    // diagnosis is now produced, not multiple-choice
    expect(stepsOf(e)[0]!.kind).toBe("numeric");
    // erroneous x-coefficient (4), repaired y-coeff (-5), repaired RHS (-10)
    expect(gradeExercise(e, nums([4, -5, -10])).correct).toBe(true);
    expect(gradeExercise(e, nums([0, -5, -10])).correct).toBe(false); // wrong diagnosis
    expect(gradeExercise(e, nums([4, -5, -15])).correct).toBe(false); // wrong repair
  });

  it("elim-diagnose-explain-fresh: produced explanation is a self-check surface", () => {
    const e = ex(eliminationLesson, "elim-diagnose-explain-fresh");
    expect(resolveCapabilityId(e)).toBe(SELF_CHECK_ID);
    expect(gradeExercise(e, selfCheck("understood")).correct).toBe(true);
    expect(gradeExercise(e, selfCheck("not-yet")).correct).toBe(false);
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

  it("elim-degenerate-pivot-transfer: E4 zero-pivot repair PRODUCED as a matrix; operation not disclosed pre-commit", () => {
    const e = ex(eliminationLesson, "elim-degenerate-pivot-transfer") as Extract<
      ExerciseDefinition,
      { type: "custom" }
    >;
    // Produced matrix entry (not a multiple-choice row-swap decision).
    expect(resolveCapabilityId(e)).toBe(MATRIX_ENTRY_ID);
    // The PROMPT must NOT disclose the operation before commitment.
    expect(e.prompt.toLowerCase()).not.toContain("row swap");
    expect(e.prompt.toLowerCase()).not.toContain("swap");
    expect(e.prompt).not.toContain("\\leftrightarrow");
    // Predicate-graded: only a SINGLE legal op giving a nonzero a11 passes —
    // the swap...
    expect(
      gradeExercise(e, matrix([
        [2, 3, 10],
        [0, 1, 4],
      ])).correct,
    ).toBe(true);
    // ...and R1 -> R1 + k·R2 for any nonzero k (here k = 1 and k = 2), each one
    // operation with a nonzero a11. This is why a single fixed answer must NOT be leaked.
    expect(
      gradeExercise(e, matrix([
        [2, 4, 14],
        [2, 3, 10],
      ])).correct,
    ).toBe(true);
    expect(
      gradeExercise(e, matrix([
        [4, 7, 24],
        [2, 3, 10],
      ])).correct,
    ).toBe(true);
    // The unchanged original (a11 = 0) fails — the pivot is still unusable.
    expect(
      gradeExercise(e, matrix([
        [0, 1, 4],
        [2, 3, 10],
      ])).correct,
    ).toBe(false);
    // A matrix that changes the solution set fails even with a nonzero a11.
    expect(
      gradeExercise(e, matrix([
        [2, 3, 11],
        [0, 1, 4],
      ])).correct,
    ).toBe(false);
    // The full RREF shares the solution but needs MULTIPLE operations → rejected.
    expect(
      gradeExercise(e, matrix([
        [1, 0, -1],
        [0, 1, 4],
      ])).correct,
    ).toBe(false);
    // An UNRELATED system with the same unique solution (-1, 4) but not one op
    // from the original → rejected (same solution ≠ one operation).
    expect(
      gradeExercise(e, matrix([
        [5, 1, -1],
        [1, 1, 3],
      ])).correct,
    ).toBe(false);
  });
});

describe("L5 solution-sets — corrected remediation items", () => {
  it("sol-produce-parametric-fresh: COMPLETE, predicate-graded, learner-chosen parametric set", () => {
    const e = ex(solutionSetsLesson, "sol-produce-parametric-fresh");
    expect(resolveCapabilityId(e)).toBe(EXERCISE_SEQUENCE_ID);
    const steps = stepsOf(e);
    // 4 steps: construct x_p, construct null dir, numeric dimension, vector point.
    expect(steps).toHaveLength(4);
    expect(steps.map((s) => s.kind)).toEqual(["construct", "construct", "numeric", "vector"]);
    // Canonical choices.
    expect(gradeExercise(e, seq([scons(4, 0), scons(3, -1), num(1), svec(10, -2)])).correct).toBe(
      true,
    );
    // DIFFERENT valid learner choices pass too: another particular solution and a
    // different nonzero null multiple.
    expect(gradeExercise(e, seq([scons(1, 1), scons(-3, 1), num(1), svec(10, -2)])).correct).toBe(
      true,
    );
    expect(gradeExercise(e, seq([scons(7, -1), scons(6, -2), num(1), svec(10, -2)])).correct).toBe(
      true,
    );
    // Each entered field independently mutated must fail:
    expect(gradeExercise(e, seq([scons(5, 0), scons(3, -1), num(1), svec(10, -2)])).correct).toBe(
      false,
    ); // x_p not a solution
    expect(gradeExercise(e, seq([scons(4, 0), scons(1, 1), num(1), svec(10, -2)])).correct).toBe(
      false,
    ); // null dir off the null line
    expect(gradeExercise(e, seq([scons(4, 0), scons(0, 0), num(1), svec(10, -2)])).correct).toBe(
      false,
    ); // zero "null direction" rejected
    expect(gradeExercise(e, seq([scons(4, 0), scons(3, -1), num(2), svec(10, -2)])).correct).toBe(
      false,
    ); // wrong dimension
    expect(gradeExercise(e, seq([scons(4, 0), scons(3, -1), num(1), svec(7, -2)])).correct).toBe(
      false,
    ); // point.x wrong
    expect(gradeExercise(e, seq([scons(4, 0), scons(3, -1), num(1), svec(10, 0)])).correct).toBe(
      false,
    ); // point.y wrong
  });

  it("sol-difference-produce-fresh: PRODUCED difference of two solutions is a null vector (both rows)", () => {
    const e = ex(solutionSetsLesson, "sol-difference-produce-fresh");
    expect(resolveCapabilityId(e)).toBe(EXERCISE_SEQUENCE_ID);
    const steps = stepsOf(e);
    expect(steps).toHaveLength(3);
    expect(steps.map((s) => s.kind)).toEqual(["vector", "numeric", "numeric"]);
    expect(gradeExercise(e, seq([svec(3, -1), num(0), num(0)])).correct).toBe(true);
    // each field mutated fails
    expect(gradeExercise(e, seq([svec(3, 1), num(0), num(0)])).correct).toBe(false); // wrong difference y
    expect(gradeExercise(e, seq([svec(4, -1), num(0), num(0)])).correct).toBe(false); // wrong difference x
    expect(gradeExercise(e, seq([svec(3, -1), num(1), num(0)])).correct).toBe(false); // row 1 not 0
    expect(gradeExercise(e, seq([svec(3, -1), num(0), num(1)])).correct).toBe(false); // row 2 not 0
  });

  it("sol-freevars-dimension-fresh: produces #free variables and dimension", () => {
    const e = ex(solutionSetsLesson, "sol-freevars-dimension-fresh");
    expect(resolveCapabilityId(e)).toBe(EXERCISE_SEQUENCE_ID);
    expect(gradeExercise(e, nums([1, 1])).correct).toBe(true);
    expect(gradeExercise(e, nums([2, 1])).correct).toBe(false);
  });

  it("sol-refuse-inconsistent-fresh: PRODUCED refusal (contradiction RHS + count 0)", () => {
    const e = ex(solutionSetsLesson, "sol-refuse-inconsistent-fresh");
    expect(resolveCapabilityId(e)).toBe(EXERCISE_SEQUENCE_ID);
    expect(stepsOf(e)).toHaveLength(2);
    expect(gradeExercise(e, nums([5, 0])).correct).toBe(true);
    expect(gradeExercise(e, nums([4, 0])).correct).toBe(false); // wrong contradiction RHS
    expect(gradeExercise(e, nums([5, 1])).correct).toBe(false); // wrong count
  });

  it("sol-construct-second-null-direction: E4 null vector OFF the x-axis passes; on-axis / zero fail", () => {
    const e = ex(solutionSetsLesson, "sol-construct-second-null-direction");
    expect(resolveCapabilityId(e)).toBe(CONSTRUCT_IN_EXPLORER_ID);
    expect(gradeExercise(e, vec([0, 1])).correct).toBe(true); // off span{(1,0)}
    expect(gradeExercise(e, vec([1, 1])).correct).toBe(true); // off the x-axis
    expect(gradeExercise(e, vec([2, 0])).correct).toBe(false); // on the x-axis
    expect(gradeExercise(e, vec([0, 0])).correct).toBe(false); // zero vector
  });

  it("justification / proof self-checks mirror the self-mark", () => {
    for (const id of [
      "sol-justify-existence-multiplicity",
      "sol-justify-one-direction",
      "sol-justify-inconsistent-refusal",
      "sol-prove-null-subspace",
      "sol-prove-structure",
    ]) {
      const e = ex(solutionSetsLesson, id);
      expect(resolveCapabilityId(e)).toBe(SELF_CHECK_ID);
      expect(gradeExercise(e, selfCheck("understood")).correct).toBe(true);
      expect(gradeExercise(e, selfCheck("not-yet")).correct).toBe(false);
    }
  });

  it("the committed-MC inconsistency refusal is gone (replaced by produced forms)", () => {
    expect((solutionSetsLesson.exercises ?? []).some((e) => e.id === "sol-inconsistent-empty")).toBe(
      false,
    );
  });
});

describe("fresh inline systems verified against src/math", () => {
  it("L3 produced-classification systems classify as one / infinite / none", () => {
    // A: columns (2,1),(1,-1) — independent → unique
    expect(classifyLinearSystem2x2([[2, 1], [1, -1]] as Matrix2x2, [5, 1] as Vector2).kind).toBe(
      "unique",
    );
    // B: rows x+y=3, 2x+2y=6 — dependent, on line → infinite
    expect(classifyLinearSystem2x2([[1, 1], [2, 2]] as Matrix2x2, [3, 6] as Vector2).kind).toBe(
      "infinite",
    );
    // C: rows x+y=2, 2x+2y=5 — dependent, off line → none
    expect(classifyLinearSystem2x2([[1, 1], [2, 2]] as Matrix2x2, [2, 5] as Vector2).kind).toBe(
      "none",
    );
  });

  it("L3 characterization: columns (1,2),(3,6) dependent, b=(2,4) on line → infinite; (2,0) solves it", () => {
    const A: Matrix2x2 = [
      [1, 3],
      [2, 6],
    ];
    expect(classifyLinearSystem2x2(A, [2, 4] as Vector2).kind).toBe("infinite");
    expect(matrixVectorMultiply(A, [2, 0] as Vector2)).toEqual([2, 4]);
  });

  it("L3 classify-fresh recognition system 2x+4y=5, x+2y=3 is inconsistent (none)", () => {
    expect(classifyLinearSystem2x2([[2, 4], [1, 2]] as Matrix2x2, [5, 3] as Vector2).kind).toBe(
      "none",
    );
  });

  it("L4 diagnose-repair system 1x+4y=9, 2x+3y=8: unique solution (1,2)", () => {
    const A: Matrix2x2 = [
      [1, 4],
      [2, 3],
    ];
    expect(classifyLinearSystem2x2(A, [9, 8] as Vector2).kind).toBe("unique");
    expect(matrixVectorMultiply(A, [1, 2] as Vector2)).toEqual([9, 8]);
    // classmate's R2 -> R2 + 2 R1 sends the x-coefficient to 4 (not 0); correct is -2 R1
    expect(2 + 2 * 1).toBe(4);
    expect([3 - 2 * 4, 8 - 2 * 9]).toEqual([-5, -10]);
  });

  it("L4 degenerate zero-pivot system 0x+y=4, 2x+3y=10: swap → unique solution (-1,4)", () => {
    const A: Matrix2x2 = [
      [0, 1],
      [2, 3],
    ];
    expect(classifyLinearSystem2x2(A, [4, 10] as Vector2).kind).toBe("unique");
    expect(matrixVectorMultiply(A, [-1, 4] as Vector2)).toEqual([4, 10]);
  });

  it("L4 fresh inconsistent system 1x+2y=1, 4x+8y=6 is 'none' and eliminates to (0,0,2)", () => {
    const A: Matrix2x2 = [
      [1, 2],
      [4, 8],
    ];
    expect(classifyLinearSystem2x2(A, [1, 6] as Vector2).kind).toBe("none");
    const r1 = [1, 2, 1];
    const r2 = [4, 8, 6];
    const newR2 = r2.map((v, i) => v - 4 * r1[i]!);
    expect(newR2).toEqual([0, 0, 2]);
  });

  it("L5 parametric system 1x+3y=4, 2x+6y=8: x_p=(4,0), null=(3,-1), t=2 → (10,-2)", () => {
    const A: Matrix2x2 = [
      [1, 3],
      [2, 6],
    ];
    expect(matrixVectorMultiply(A, [4, 0] as Vector2)).toEqual([4, 8]); // A x_p = b
    expect(matrixVectorMultiply(A, [3, -1] as Vector2)).toEqual([0, 0]); // null vector
    expect(matrixVectorMultiply(A, [10, -2] as Vector2)).toEqual([4, 8]); // point at t=2 solves it
  });

  it("L5 refuse-inconsistent system 1x+2y=5, 3x+6y=20 is 'none' and eliminates to (0,0,5)", () => {
    const A: Matrix2x2 = [
      [1, 2],
      [3, 6],
    ];
    expect(classifyLinearSystem2x2(A, [5, 20] as Vector2).kind).toBe("none");
    const r1 = [1, 2, 5];
    const r2 = [3, 6, 20];
    const newR2 = r2.map((v, i) => v - 3 * r1[i]!);
    expect(newR2).toEqual([0, 0, 5]);
  });

  it("L5 free-variable system 3x+y=0, 6x+2y=0 is dependent (nullity 1)", () => {
    const A: Matrix2x2 = [
      [3, 1],
      [6, 2],
    ];
    const c = classifyLinearSystem2x2(A, [0, 0] as Vector2);
    expect(c.determinant).toBeCloseTo(0, 9);
    expect(c.kind).toBe("infinite");
  });
});
