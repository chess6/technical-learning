import { describe, expect, it } from "vitest";
import { describeGradingContract } from "./gradingContract";
import { gradeExercise } from "../grading";
import { MATH_EXPRESSION_ID } from "../capabilities";
import type { ExerciseDefinition } from "../types";

/**
 * The `math-expression` capability's grading contract.
 *
 * This is written against the CAPABILITY rather than a shipped lesson item,
 * because no lesson has adopted it yet — adopting it changes a lesson's
 * evidence surface, which is a mastery-contract decision. The reject battery
 * is still the real one: the defect classes the conformance kit exists to stop
 * (blank credited, a related-but-wrong answer credited, a near-miss credited)
 * do not become optional just because the consumer is a demo route.
 *
 * The reject list deliberately includes **the question restated as its own
 * answer**. Value-equivalence grading cannot tell `(x+1)(x+2)` from
 * `x^2+3x+2`, and must not be asked to: the entry below pins that this item's
 * prompt is a legitimate use (either form genuinely answers "expand this"),
 * while the FORM-sensitive prompt in the last block is pinned as a use this
 * capability must not be put to.
 */

const EXPAND: ExerciseDefinition = {
  id: "math-expression-contract-expand",
  type: "custom",
  capabilityId: MATH_EXPRESSION_ID,
  tier: "drill",
  prompt: "Expand $(x+1)(x+2)$.",
  config: {
    expected: "x^2 + 3x + 2",
    variables: ["x"],
    explanation: "$(x+1)(x+2) = x^2+3x+2$.",
  },
};

const answer = (source: string) => ({ source });

describeGradingContract(EXPAND, {
  mustAccept: [
    { name: "the expanded form", answer: answer("x^2 + 3x + 2") },
    { name: "reordered terms", answer: answer("2 + 3x + x^2") },
    { name: "the factored form (value-equivalent)", answer: answer("(x+1)(x+2)") },
    { name: "explicit multiplication signs", answer: answer("x^2 + 3*x + 2") },
    { name: "extra whitespace", answer: answer("  x^2+3x+2  ") },
    { name: "a redundant but equivalent rewrite", answer: answer("x*x + x + 2x + 2") },
  ],
  mustReject: [
    // Blank and whitespace: the recurring blank-as-something defect.
    { name: "an empty answer", answer: answer("") },
    { name: "whitespace only", answer: answer("   ") },
    // Near-misses a learner actually produces.
    { name: "wrong constant term", answer: answer("x^2 + 3x + 1") },
    { name: "wrong linear coefficient", answer: answer("x^2 + 2x + 2") },
    { name: "sign error", answer: answer("x^2 - 3x + 2") },
    { name: "forgot the cross terms", answer: answer("x^2 + 2") },
    { name: "the derivative instead of the expansion", answer: answer("2x + 3") },
    // Related-but-wrong: right shape, wrong function.
    { name: "a different quadratic entirely", answer: answer("x^2 + 4x + 3") },
    // Wrong variable — a wrong answer, not a malformed one.
    { name: "the right shape in the wrong variable", answer: answer("y^2 + 3y + 2") },
    // Malformed input must never be credited.
    { name: "an unclosed parenthesis", answer: answer("(x+1)(x+2") },
    { name: "prose instead of an expression", answer: answer("the expanded form") },
    { name: "LaTeX with a control sequence", answer: answer("x^2+3x+2 \\cdot 1") },
    { name: "a stray backslash", answer: answer("\\frac{x}{1}") },
  ],
});

describe("math-expression: forgiving where forgiveness is harmless", () => {
  it("accepts brace grouping, so a learner who types LaTeX-ish braces is not punished", () => {
    // `{` and `}` lex as ordinary grouping, which makes `x^{2}` read as
    // `x^(2)` — exactly what someone typing it meant. This is deliberate: the
    // input never ASKS for LaTeX, but refusing a habit that happens to be
    // unambiguous would be gratuitous. (Real LaTeX is still rejected the
    // moment a backslash appears — see the reject battery above.)
    const result = gradeExercise(EXPAND, {
      kind: "custom",
      capabilityId: MATH_EXPRESSION_ID,
      value: { source: "x^{2}+3x+2" },
    });
    expect(result.correct).toBe(true);
  });
});

describe("math-expression: what the capability refuses to pretend", () => {
  it("says why, on every verdict — correct and incorrect alike", () => {
    for (const source of ["x^2+3x+2", "x^2+3x+1", "", "(x+1)(x+2"]) {
      const result = gradeExercise(EXPAND, {
        kind: "custom",
        capabilityId: MATH_EXPRESSION_ID,
        value: { source },
      });
      expect(result.feedback, `"${source}" produced no explanation`).toContain(
        "(x+1)(x+2)",
      );
    }
  });

  it("distinguishes a malformed answer from a wrong one, in the message", () => {
    const malformed = gradeExercise(EXPAND, {
      kind: "custom",
      capabilityId: MATH_EXPRESSION_ID,
      value: { source: "(x+1)(x+2" },
    });
    const wrong = gradeExercise(EXPAND, {
      kind: "custom",
      capabilityId: MATH_EXPRESSION_ID,
      value: { source: "x^2+3x+1" },
    });
    expect(malformed.feedback).toMatch(/isn't a complete expression/i);
    expect(wrong.feedback).toMatch(/not equivalent/i);
    expect(malformed.correct).toBe(false);
    expect(wrong.correct).toBe(false);
  });

  it("names the variable when the answer is in the wrong one", () => {
    const result = gradeExercise(EXPAND, {
      kind: "custom",
      capabilityId: MATH_EXPRESSION_ID,
      value: { source: "y^2 + 3y + 2" },
    });
    expect(result.correct).toBe(false);
    expect(result.feedback).toMatch(/uses y/);
  });

  it("rejects an authored item whose expected answer does not parse, at grade time", () => {
    const broken: ExerciseDefinition = {
      ...EXPAND,
      id: "math-expression-broken-expected",
      config: { expected: "x^2 +", variables: ["x"], explanation: "…" },
    };
    expect(() =>
      gradeExercise(broken, {
        kind: "custom",
        capabilityId: MATH_EXPRESSION_ID,
        value: { source: "x" },
      }),
    ).toThrow(/unparseable expected answer/);
  });

  it("is graded by VALUE, which is why a form-sensitive prompt must not use it", () => {
    // Recorded as a test rather than a warning comment: on a "factor this"
    // prompt, restating the question scores full marks. That is not a bug in
    // the grader — it is the boundary of what value-equivalence can assess,
    // and an item whose prompt is about the form needs a form check this
    // capability deliberately does not provide.
    const factorPrompt: ExerciseDefinition = {
      ...EXPAND,
      id: "math-expression-form-hazard",
      prompt: "Factor $x^2+3x+2$.",
      config: {
        expected: "(x+1)(x+2)",
        variables: ["x"],
        explanation: "…",
      },
    };
    const restatedQuestion = gradeExercise(factorPrompt, {
      kind: "custom",
      capabilityId: MATH_EXPRESSION_ID,
      value: { source: "x^2+3x+2" },
    });
    expect(
      restatedQuestion.correct,
      "if this ever fails, a form check was added and the capability's docs must be updated",
    ).toBe(true);
  });
});
