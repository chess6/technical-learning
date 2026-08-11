import { ExercisePanel } from "../components/lesson/ExercisePanel";
import { MATH_EXPRESSION_ID } from "../lessons/capabilities";
import type { ExerciseDefinition } from "../lessons/types";
import "./DevExpressionInputPage.css";

/**
 * Development-only route for the `math-expression` answer field.
 *
 * It exists so the capability has a REAL consumer from the day it ships — the
 * repository's standing rule against decoration (a field, registry entry, or
 * type with nothing reading it) applies to capabilities too, and "a lesson
 * will use it later" is exactly the promise that rule exists to distrust. The
 * items below run through the ordinary `ExercisePanel`, the ordinary registry
 * lookup, and the ordinary grader, so this page exercises the real path rather
 * than a mock of it.
 *
 * It is deliberately NOT a lesson: adopting this capability inside one changes
 * that lesson's evidence surface, which is a mastery-contract decision, not an
 * implementation one.
 */

const DEMO_EXERCISES: ExerciseDefinition[] = [
  {
    id: "dev-expr-quadratic",
    type: "custom",
    capabilityId: MATH_EXPRESSION_ID,
    tier: "drill",
    prompt:
      "Expand $(x+1)(x+2)$ and enter the result. Any equivalent form is accepted — the grader compares values, not spelling.",
    config: {
      expected: "x^2 + 3x + 2",
      variables: ["x"],
      explanation:
        "$(x+1)(x+2) = x^2 + 3x + 2$. Entering it factored, expanded, or reordered all pass: the two expressions agree as functions.",
      placeholder: "e.g. x^2 + 3x + 2",
    },
  },
  {
    id: "dev-expr-derivative",
    type: "custom",
    capabilityId: MATH_EXPRESSION_ID,
    tier: "drill",
    prompt: "What is the derivative of $f(x) = x^3 - 3x$?",
    config: {
      expected: "3x^2 - 3",
      variables: ["x"],
      explanation: "Term by term: $\\tfrac{d}{dx}x^3 = 3x^2$ and $\\tfrac{d}{dx}(-3x) = -3$.",
      placeholder: "e.g. 3x^2 - 3",
    },
  },
  {
    id: "dev-expr-trig",
    type: "custom",
    capabilityId: MATH_EXPRESSION_ID,
    tier: "transfer",
    prompt:
      "Write an expression equal to $\\sin(2\\theta)$ using only $\\sin(\\theta)$ and $\\cos(\\theta)$.",
    config: {
      expected: "2sin(theta)cos(theta)",
      variables: ["theta"],
      explanation: "The double-angle identity: $\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta$.",
      palette: ["theta"],
      placeholder: "e.g. 2sin(theta)cos(theta)",
    },
  },
];

export function DevExpressionInputPage() {
  return (
    <div className="dev-expression">
      <header className="dev-expression__header">
        <p className="dev-expression__eyebrow">Capability demo</p>
        <h1 className="dev-expression__title">Typing mathematics without LaTeX</h1>
        <p className="dev-expression__lede">
          Type an answer the ordinary way — <code>x^2 + 3x + 7</code>,{" "}
          <code>(x+1)/2</code>, <code>sqrt(x)</code> — and watch it set itself as
          mathematics underneath. The preview shows the <em>parse</em>, not the
          text, so an ambiguous input like <code>1/2x</code> reveals which
          reading it got before you submit. The <code>√x</code> button opens a
          palette of the symbols each question actually needs.
        </p>
      </header>
      <ExercisePanel exercises={DEMO_EXERCISES} />
    </div>
  );
}
