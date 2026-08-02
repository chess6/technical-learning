import type { LessonDefinition } from "./types";
import { EXERCISE_SEQUENCE_ID, SELF_CHECK_ID } from "./capabilities";
import { numericDerivative } from "../math";

/**
 * Lesson: "The Chain Rule: Rates Compose" — applied mathematics L5, unit
 * `calculus-technique`, Package B slice B1. First lesson of Package B,
 * immediately following Package A's complete arc.
 *
 * Built on the PASS contract
 * `docs/courses/applied-mathematics/lessons/05-chain-rule/insight.md`.
 *
 * Primary insight: the chain rule is what happens when you substitute one
 * local-linear model into another (L2's own C5), and doing that honestly —
 * with error terms, never difference quotients — is what repairs the gap in
 * the popular "cancel the du's" heuristic: that step silently divides by
 * Delta-u, which the honest substitution never needs to do at all, which is
 * exactly why the rule keeps working at g'(a) = 0.
 *
 * Evidence discipline, applied before any code was written (the same
 * preflight A2-A4 applied): `multiple-choice` is capped at E2 and
 * `exercise-sequence`/`numeric` at E3. One item, `chain-derive-fresh`, uses
 * `self-check` and asks for a written reproduction of the substitution
 * derivation on a fresh pair — the only item that requires PRODUCING the
 * argument, not applying its conclusion, which is what M2 ("the chain rule
 * is an independent fact to memorize") actually needs.
 *
 * Correction (2026-08-01, found during independent review of L6
 * `optimization-approximation`'s Mode B artifacts, which had copied the
 * same error): this item is **learner-self-marked in the lesson, not
 * human-scored, and claims no evidence level**. `SelfCheckBody`
 * (`ExercisePanel.tsx`) has the learner reveal a model answer and mark
 * their own work; `/review` reads module `AttemptSet`s, not lesson
 * exercises, so nothing here is ever reviewed by another person. Per
 * ADR-004, a self-marked judgment is not independently certified mastery.
 * The item stays as a practice event with a real model answer and a
 * versioned rubric (see `chainRuleGradingContract.test.ts`) — worthwhile
 * practice, and a live regression guard on the mathematics, but not
 * evidence toward any objective.
 */

/* ---------------------------------------------------------------- numbers */

/** `chain-differentiate-fresh`: (2x+3)^2, a fresh composite. */
const FRESH_G = (x: number) => 2 * x + 3;
const FRESH_G_PRIME = 2;
const FRESH_F_PRIME = (u: number) => 2 * u;
const FRESH_A = 2;
const FRESH_B = FRESH_G(FRESH_A); // 7
const FRESH_ANSWER = FRESH_F_PRIME(FRESH_B) * FRESH_G_PRIME; // 28
const FRESH_COMPOSITE = (x: number) => FRESH_G(x) * FRESH_G(x);

/** `chain-zero-predict`: g(x) = (x-3)^2 + 1, g'(3) = 0, for ANY differentiable f. */
const ZERO_G = (x: number) => (x - 3) * (x - 3) + 1;
const ZERO_A = 3;

/** `chain-corroborate`: g(x) = x + 2, f(u) = u^3, a = 0. */
const CORROBORATE_G = (x: number) => x + 2;
const CORROBORATE_G_PRIME = 1;
const CORROBORATE_F_PRIME = (u: number) => 3 * u * u;
const CORROBORATE_A = 0;
const CORROBORATE_B = CORROBORATE_G(CORROBORATE_A); // 2
const CORROBORATE_CHAIN = CORROBORATE_F_PRIME(CORROBORATE_B) * CORROBORATE_G_PRIME; // 12
const CORROBORATE_COMPOSITE = (x: number) =>
  CORROBORATE_G(x) * CORROBORATE_G(x) * CORROBORATE_G(x);

/** `chain-compound-zoom`: two given slopes multiply. */
const COMPOUND_G_PRIME = 5;
const COMPOUND_F_PRIME = -3;
const COMPOUND_ANSWER = COMPOUND_G_PRIME * COMPOUND_F_PRIME; // -15

/** `chain-select-method`: f(u) = u^5, g(x) = 3x - 1, a = 1 — expanding is painful. */
const SELECT_G = (x: number) => 3 * x - 1;
const SELECT_G_PRIME = 3;
const SELECT_F_PRIME = (u: number) => 5 * u * u * u * u;
const SELECT_A = 1;
const SELECT_B = SELECT_G(SELECT_A); // 2
const SELECT_ANSWER = SELECT_F_PRIME(SELECT_B) * SELECT_G_PRIME; // 240

/** `chain-derive-fresh`: g(x) = x^2+3, f(u) = u^2+1, a = 1 — a fresh pair, distinct from every other exercise. */
const DERIVE_G = (x: number) => x * x + 3;
const DERIVE_G_PRIME = (x: number) => 2 * x;
const DERIVE_F_PRIME = (u: number) => 2 * u;
const DERIVE_A = 1;
const DERIVE_B = DERIVE_G(DERIVE_A); // 4
const DERIVE_ANSWER = DERIVE_F_PRIME(DERIVE_B) * DERIVE_G_PRIME(DERIVE_A); // 16
const DERIVE_COMPOSITE = (x: number) => {
  const u = DERIVE_G(x);
  return u * u + 1;
};

/** Sanity: the prose's numbers are the code's numbers. */
if (Math.abs(numericDerivative(FRESH_COMPOSITE, FRESH_A) - FRESH_ANSWER) > 1e-4) {
  throw new Error("chainRule: the fresh composite's chain-rule value disagrees with its direct derivative.");
}
if (Math.abs(FRESH_ANSWER - 28) > 1e-9) {
  throw new Error("chainRule: (2x+3)^2 differentiated at a=2 should give 28.");
}
if (
  Math.abs(numericDerivative(CORROBORATE_COMPOSITE, CORROBORATE_A) - CORROBORATE_CHAIN) >
  1e-4
) {
  throw new Error("chainRule: the corroboration composite's two routes disagree.");
}
if (Math.abs(SELECT_ANSWER - 240) > 1e-9) {
  throw new Error("chainRule: (3x-1)^5 differentiated at a=1 should give 240.");
}
if (Math.abs(numericDerivative(DERIVE_COMPOSITE, DERIVE_A) - DERIVE_ANSWER) > 1e-4) {
  throw new Error("chainRule: chain-derive-fresh's chain-rule value disagrees with its direct derivative.");
}
if (Math.abs(numericDerivative(ZERO_G, ZERO_A)) > 1e-4) {
  throw new Error("chainRule: g'(3) should be 0 for the zero-predict fixture.");
}

export const chainRuleLesson: LessonDefinition = {
  id: "chain-rule",
  title: "The Chain Rule: Rates Compose",
  subtitle: "Substitute one local-linear model into the other — never divide by $\\Delta u$ to get there",
  learningObjectives: [
    "Decompose a fresh composite and differentiate it via the chain rule",
    "Predict $(f\\circ g)'(a)$ at a point where $g'(a) = 0$, without full computation",
    "Identify exactly what fails in \"cancel the du's\" when $\\Delta u = 0$",
    "Verify a chain-rule result by an independent direct-expansion route",
    "Select the efficient route — chain rule or direct expansion — on a fresh composite",
    "State what does and does not follow when the inner function has a corner",
  ],
  motivatingQuestion:
    "You already know $\\frac{d(x^2)}{dx}$ and you already know $\\frac{d(u^3)}{du}$. What is $\\frac{d\\bigl((x^2+1)^3\\bigr)}{dx}$ — and why isn't the answer just \"multiply the two rules you already know\"?",

  guidedSceneId: "chain-rule",
  explorationId: "chain-rule",

  route: [
    { kind: "motivate" },
    { kind: "visual", heading: "Two zooms, linked" },
    { kind: "section", sectionId: "two-local-models" },
    { kind: "formal", formalId: "def-composition" },
    { kind: "section", sectionId: "the-repair" },
    { kind: "worked", workedId: "chain-derivation" },
    { kind: "formal", formalId: "thm-chain-rule" },
    { kind: "section", sectionId: "matrix-reading" },
    { kind: "section", sectionId: "edge-cases" },
    { kind: "check", checkpointId: "predict-zero" },
    { kind: "explore", tocLabel: "Zoom both panels; try g'(a) = 0 and a corner" },
    { kind: "practice" },
    { kind: "summary" },
  ],

  sections: [
    {
      id: "two-local-models",
      title: "Two rates, one feeding the other",
      body: "Lesson 2 gave every differentiable function a local-linear model: near a point, the function IS the line $f(a) + f'(a)h$, up to an error that vanishes faster than the step. Take two such functions, $g$ and $f$, and feed $g$'s output into $f$ — the composite $f\\circ g$. Near $x = a$, $g$ has its own local model; near $u = g(a)$, $f$ has its own. The question this lesson answers: what is the local-linear model of the composite, and where does it come from?\n\nThe fluent answer — \"multiply the two derivatives\" — is correct. The usual argument for it is not: \"cancel the $du$'s\" in $\\frac{dy}{dx} = \\frac{dy}{du}\\cdot\\frac{du}{dx}$ silently regroups a limit as a product of two ratios, which needs $\\Delta u \\neq 0$ to even divide. That gap is this lesson's real subject.",
      equation: "(f\\circ g)(x) = f(g(x))",
      observation:
        "Zoom into g at a; the window narrows to a line. Zoom into f at g(a) — the FIRST zoom's output — and it narrows to a line too. Two magnifications, compounding.",
    },
    {
      id: "the-repair",
      title: "Deriving the rule by substitution",
      body: "The previous section left a gap: \"cancel the $du$'s\" has to form $\\Delta y/\\Delta u$, which needs $\\Delta u \\neq 0$ — and $\\Delta u$ can be zero at points arbitrarily close to $a$, even for a perfectly smooth $g$. What follows is an argument with no such requirement, so there is no case it has to exclude.\n\nOne idea carries it. Lesson 2's local-linear model says the error $E_f(k)$ shrinks *faster* than $k$ — that is what differentiability means. So write the error as a **multiple** of $k$ rather than a fraction over it: let $\\varepsilon_f(k) = E_f(k)/k$ when $k \\neq 0$, and set $\\varepsilon_f(0) = 0$. Read $\\varepsilon_f$ as the *error per unit step*.\n\nTwo facts come free. First, $E_f(k) = \\varepsilon_f(k)\\,k$ for **every** $k$ — including $k = 0$, where both sides are zero. Second, $\\varepsilon_f(k) \\to 0$ as $k \\to 0$, which is just \"the error shrinks faster than $k$\" said again. From here on the error appears only multiplied by $k$, never divided by it.",
      equation: "E_f(k) = \\varepsilon_f(k)\\,k \\quad \\text{for every } k, \\qquad \\varepsilon_f(k) \\to 0 \\ \\text{ as } k \\to 0",
      observation:
        "That is also why $g'(a) = 0$ needs no special case: no step below divides by $g'(a)$ or by $\\Delta u$.",
      layers: [
        {
          kind: "why",
          title: "Why this counts as a repair, not a restatement",
          body: "The naive argument and this one reach the same formula, but only one of them is defined at every step. \"Cancel the $du$'s\" asks $\\frac{\\Delta y}{\\Delta u}$ to exist, which fails wherever $\\Delta u = 0$ — a real possibility even when $g$ is perfectly smooth. The substitution above never forms that ratio at all: replacing $E_f(k)$ by $\\varepsilon_f(k)\\,k$ turns the one place a quotient could appear into a product, and $\\varepsilon_f$ is *defined* at $0$ rather than divided around it.",
        },
      ],
    },
    {
      id: "matrix-reading",
      title: "Rates multiply because 1×1 matrices compose",
      body: "Lesson 2 read $f'(a)$ as the $1\\times1$ matrix of the linear map $h \\mapsto f'(a)h$. Composing two linear maps composes their matrices — in one dimension, that is exactly multiplying the two numbers. This is the same fact linear algebra's `matrix-composition` lesson teaches; here it is the same statement one dimension down.",
      observation:
        "This is also the forward bridge: with more than one input or output, f'(g(a)) and g'(a) become genuine matrices — Jacobians — and this same substitution argument, unchanged, is the multivariable chain rule.",
    },
    {
      id: "edge-cases",
      title: "What the theorem needs, and what it does not",
      body: "The derivation above needs both $g$ differentiable at $a$ and $f$ differentiable at $g(a)$. Neither is optional for the CHAIN RULE to apply — but that is a statement about this route to an answer, not about whether the composite has a derivative at all. Take $g(x) = |x|$, which has a corner at $0$, and $f(u) = u^2$: the composite is $f(g(x)) = |x|^2 = x^2$, smooth everywhere, with derivative $0$ at $x=0$ — even though $g$ itself has no single slope there. The chain rule's hypothesis is sufficient for its conclusion; it is not necessary for the composite to be differentiable.",
      layers: [
        {
          kind: "trap",
          title: "Don't conclude the composite fails just because g does",
          body: "\"g is not differentiable at a, so f∘g cannot be\" is not a valid inference — it only says the chain-rule ROUTE is unavailable. Whether the composite is actually differentiable there is a separate question, answered directly if at all.",
        },
      ],
    },
  ],

  workedExamples: [
    {
      id: "chain-derivation",
      title: "The derivation, line by line",
      prompt:
        "Each line is defined for every $h$ — including any $h$ where the inner step $k(h)$ happens to be zero. Nothing is ever divided by $k(h)$.",
      equations: [
        "g(a+h) = g(a) + g'(a)h + E_g(h), \\qquad E_g(h)/h \\to 0",
        "f(b+k) = f(b) + f'(b)k + E_f(k), \\qquad b = g(a)",
        "k(h) = g(a+h) - g(a) = g'(a)h + E_g(h)",
        "E_f(k) = \\varepsilon_f(k)\\,k \\quad\\text{with}\\quad \\varepsilon_f(k) \\to 0",
        "f(g(a+h)) = f(g(a)) + f'(g(a))\\,k(h) + \\varepsilon_f(k(h))\\,k(h)",
        "\\frac{f(g(a+h)) - f(g(a))}{h} = f'(g(a))\\,\\frac{k(h)}{h} + \\varepsilon_f(k(h))\\,\\frac{k(h)}{h}",
        "\\frac{k(h)}{h} \\to g'(a) \\qquad\\text{and}\\qquad \\varepsilon_f(k(h)) \\to 0",
        "(f \\circ g)'(a) = f'(g(a))\\,g'(a) + 0 \\cdot g'(a) = f'(g(a))\\,g'(a)",
      ],
      equationsAriaLabel: "Deriving the chain rule by substituting local-linear models",
    },
  ],

  formalBlocks: [
    {
      id: "def-composition",
      kind: "definition",
      label: "Composition",
      statement: "$(f\\circ g)(x) = f(g(x))$ — apply $g$, then apply $f$ to the result.",
      interpretation:
        "Nothing about derivatives yet: composition is defined for any two functions whose domains and ranges line up, differentiable or not.",
      visibility: "visible",
    },
    {
      id: "thm-chain-rule",
      kind: "theorem",
      label: "The chain rule",
      statement:
        "If $g$ is differentiable at $a$ and $f$ is differentiable at $g(a)$, then $f\\circ g$ is differentiable at $a$ and $(f\\circ g)'(a) = f'(g(a))\\,g'(a)$.",
      interpretation:
        "Derived by substituting $g$'s local-linear model into $f$'s — never by dividing by $\\Delta u$. That substitution is what makes the $g'(a) = 0$ case fall out with no special handling.",
      visibility: "visible",
    },
  ],

  checkpoint: {
    prompt:
      "A composite $f(g(x))$ has $g'(3) = 0$. Without computing anything else, what is $(f\\circ g)'(3)$ — and why doesn't \"cancel the du's\" make this obvious?",
    answer:
      "$(f\\circ g)'(3) = f'(g(3))\\cdot 0 = 0$ directly from the rule; the cancellation story cannot approach this case because it would need to divide by $\\Delta u$, which need not even be nonzero near $x = 3$.",
  },
  checkpoints: [
    {
      id: "predict-zero",
      prompt:
        "A composite $f(g(x))$ has $g'(3) = 0$. Without computing anything else, what is $(f\\circ g)'(3)$ — and why doesn't \"cancel the du's\" make this obvious?",
      answer:
        "$(f\\circ g)'(3) = f'(g(3))\\cdot 0 = 0$ directly from the rule; the cancellation story cannot approach this case because it would need to divide by $\\Delta u$, which need not even be nonzero near $x = 3$.",
    },
  ],

  exercises: [
    /* ---- check ---------------------------------------------------------- */
    {
      id: "chain-du-cancel-fails",
      type: "multiple-choice",
      tier: "check",
      prompt: "What exactly fails in \"cancel the du's\" as a proof of the chain rule?",
      choices: [
        "It forms $\\Delta y/\\Delta u$, and $\\Delta u$ can be $0$ arbitrarily near $a$",
        "It needs $g$ continuous, so that $\\Delta u \\to 0$ whenever $\\Delta x \\to 0$",
        "It divides by $\\Delta x$, which is itself $0$ at the point in question",
        "It assumes the composite is differentiable — the very thing to be shown",
      ],
      correctChoice: 0,
      explanation:
        "The step $\\frac{\\Delta y}{\\Delta x} = \\frac{\\Delta y}{\\Delta u}\\cdot\\frac{\\Delta u}{\\Delta x}$ cannot form its first ratio when $\\Delta u = 0$, and $\\Delta u$ may be $0$ at points arbitrarily close to $a$ — even for a perfectly smooth $g$. Note that $g$'s continuity really is needed too, but that is a *hypothesis the argument gets*, not the step that breaks; the break is the division. The substitution derivation never forms the ratio, so it has nothing to exclude.",
    },
    {
      id: "chain-corner-not-necessary",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "g(x) = |x| has a corner at x = 0. What follows about f(g(x)) at x = 0, for a smooth f?",
      choices: [
        "It may still be differentiable; the corner alone does not settle it",
        "It cannot be differentiable, because $g$ is not differentiable there",
        "It is differentiable only if $f$ is constant near $g(0)$",
        "Nothing at all follows here until $f$ is specified explicitly",
      ],
      correctChoice: 0,
      explanation:
        "For $f(u) = u^2$, $f(g(x)) = |x|^2 = x^2$ — differentiable everywhere, despite $g$'s corner. The chain rule's hypothesis is *sufficient*, not necessary: it licenses the conclusion when it holds, and says nothing when it fails. Sharper, for this $g$: $f(|x|)$ is differentiable at $0$ exactly when $f'(0) = 0$, since the one-sided slopes are $f'(0)$ and $-f'(0)$.",
    },

    /* ---- drill ------------------------------------------------------------ */
    {
      id: "chain-differentiate-fresh",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt: `Let $h(x) = (2x+3)^2$. Differentiate it at $x = ${FRESH_A}$.`,
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt: "Which decomposition is h = f∘g?",
            choices: [
              "f(u) = u², g(x) = 2x + 3",
              "f(u) = 2u + 3, g(x) = u²",
              "f(u) = 2x + 3, g(x) = u²",
              "There is no way to decompose this composite",
            ],
            correctChoice: 0,
            explanation:
              "The outer operation (applied last) is squaring; the inner is 2x + 3. Reading it the other way around asks for g's input to already be a squared quantity, which it is not.",
          },
          {
            kind: "numeric",
            prompt: `Now compute h'(${FRESH_A}).`,
            expected: FRESH_ANSWER,
            tolerance: 1e-6,
            explanation: `g'(x) = 2, g(${FRESH_A}) = ${FRESH_B}, f'(u) = 2u so f'(${FRESH_B}) = ${FRESH_F_PRIME(FRESH_B)}. Product: ${FRESH_F_PRIME(FRESH_B)} × 2 = ${FRESH_ANSWER}.`,
          },
        ],
      },
    },
    {
      id: "chain-compound-zoom",
      type: "numeric",
      tier: "drill",
      prompt: `At a point a, g'(a) = ${COMPOUND_G_PRIME} and f'(g(a)) = ${COMPOUND_F_PRIME}. What is (f∘g)'(a)?`,
      expected: COMPOUND_ANSWER,
      tolerance: 1e-9,
      explanation: `The compound magnification is a product: ${COMPOUND_F_PRIME} × ${COMPOUND_G_PRIME} = ${COMPOUND_ANSWER} — never a sum of the two slopes.`,
    },
    {
      id: "chain-corroborate",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt: `Let $g(x) = x + 2$ and $f(u) = u^3$, so $h(x) = (x+2)^3$. Compute $h'(${CORROBORATE_A})$ two independent ways.`,
      config: {
        steps: [
          {
            kind: "numeric",
            prompt: "First, via the chain rule.",
            expected: CORROBORATE_CHAIN,
            tolerance: 1e-9,
            explanation: `g'(x) = 1, g(${CORROBORATE_A}) = ${CORROBORATE_B}, f'(u) = 3u² so f'(${CORROBORATE_B}) = ${CORROBORATE_F_PRIME(CORROBORATE_B)}. Product: ${CORROBORATE_CHAIN}.`,
          },
          {
            kind: "numeric",
            prompt: "Now expand h(x) = (x+2)³ directly and differentiate it, then evaluate at the same point.",
            expected: CORROBORATE_CHAIN,
            tolerance: 1e-6,
            explanation: `$(x+2)^3 = x^3+6x^2+12x+8$, so $h'(x) = 3x^2+12x+12$, and $h'(${CORROBORATE_A}) = ${CORROBORATE_CHAIN}$ — the same number, reached without composing anything.`,
          },
          {
            kind: "multiple-choice",
            prompt: "Why does their agreement count as evidence, rather than being circular?",
            choices: [
              "The expansion route never consulted the chain rule",
              "Both routes used the same formula, just written differently",
              "Small numbers always agree by coincidence",
              "The chain-rule route secretly used the expansion's result",
            ],
            correctChoice: 0,
            explanation:
              "The expansion route differentiates a plain polynomial — it never calls g' or f'. Two independent computations agreeing is exactly what evidence looks like.",
          },
        ],
      },
    },

    /* ---- transfer ----------------------------------------------------- */
    {
      id: "chain-zero-predict",
      type: "numeric",
      tier: "transfer",
      prompt: `$g(x) = (x-${ZERO_A})^2 + 1$, so $g'(${ZERO_A}) = 0$. For ANY differentiable $f$, what is $(f\\circ g)'(${ZERO_A})$ — without knowing $f$ at all?`,
      expected: 0,
      tolerance: 1e-9,
      explanation: `$(f\\circ g)'(${ZERO_A}) = f'(g(${ZERO_A}))\\cdot g'(${ZERO_A}) = f'(g(${ZERO_A}))\\cdot0 = 0$, regardless of what $f$ is — the product of ANY finite number with 0 is 0.`,
    },
    {
      id: "chain-select-method",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt: `Let $h(x) = (3x-1)^5$. Find $h'(${SELECT_A})$.`,
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt: "Which route is more efficient here?",
            choices: [
              "Differentiate the two pieces separately and multiply",
              "Expand (3x − 1)⁵ fully, then differentiate the polynomial",
              "Either route takes about the same effort",
              "Neither route works on this composite",
            ],
            correctChoice: 0,
            explanation:
              "Expanding a fifth power is a lot of arithmetic for no benefit; treating it as a composite needs only g'(x) = 3 and f'(u) = 5u⁴.",
          },
          {
            kind: "numeric",
            prompt: `Now compute h'(${SELECT_A}).`,
            expected: SELECT_ANSWER,
            tolerance: 1e-6,
            explanation: `g'(x) = 3, g(${SELECT_A}) = ${SELECT_B}, f'(u) = 5u⁴ so f'(${SELECT_B}) = ${SELECT_F_PRIME(SELECT_B)}. Product: ${SELECT_F_PRIME(SELECT_B)} × 3 = ${SELECT_ANSWER}.`,
          },
        ],
      },
    },
    {
      id: "chain-derive-fresh",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt: `Let $g(x) = x^2+3$ and $f(u) = u^2+1$, so $h(x) = (x^2+3)^2+1$. Reproduce the SUBSTITUTION derivation of $h'(${DERIVE_A})$ — not just the answer: state both local-linear models with their error terms, form $k(h)=g(${DERIVE_A}+h)-g(${DERIVE_A})$, substitute it into $f$'s identity, and say explicitly why no division by $\\Delta u$ was needed anywhere.`,
      config: {
        modelAnswer: `$b=g(${DERIVE_A})=${DERIVE_B}$. By Lesson 2's local-linear model: $g(${DERIVE_A}+h) = ${DERIVE_B} + ${DERIVE_G_PRIME(DERIVE_A)}h + E_g(h)$ with $E_g(h)/h\\to0$, and $f(${DERIVE_B}+k) = ${DERIVE_B * DERIVE_B + 1} + ${DERIVE_F_PRIME(DERIVE_B)}k + E_f(k)$ with $E_f(k)/k\\to0$. Write the outer error as a factor of its own step: $E_f(k) = k\\,\\varepsilon_f(k)$ with $\\varepsilon_f(k)\\to0$, and set $\\varepsilon_f(0)=0$ so that identity holds at $k=0$ as well. Now $k(h)=g(${DERIVE_A}+h)-g(${DERIVE_A}) = ${DERIVE_G_PRIME(DERIVE_A)}h+E_g(h)$, and substituting gives $f(g(${DERIVE_A}+h)) = ${DERIVE_B * DERIVE_B + 1} + ${DERIVE_F_PRIME(DERIVE_B)}[${DERIVE_G_PRIME(DERIVE_A)}h+E_g(h)] + \\varepsilon_f(k(h))\\,k(h)$ — an identity holding for every $h$, including any $h$ where $k(h)=0$. Divide by $h$ and let $h\\to0$: the leading term is $${DERIVE_F_PRIME(DERIVE_B)}\\times${DERIVE_G_PRIME(DERIVE_A)} = ${DERIVE_ANSWER}$, the $E_g(h)/h$ term vanishes, and the error term is the **product** $\\varepsilon_f(k(h))\\cdot k(h)/h \\to 0\\cdot${DERIVE_G_PRIME(DERIVE_A)} = 0$ — a product, never a quotient by $k(h)$. So $h'(${DERIVE_A}) = ${DERIVE_ANSWER}$, and no step divided by $\\Delta u = k(h)$.`,
        rubricId: "chain-derive-fresh",
        rubricVersion: 2,
        rubricText: `PASS requires the SUBSTITUTION argument reproduced, not just the product ${DERIVE_ANSWER} stated: (a) both local-linear models written with their error terms ($E_g(h)$, $E_f(k)$); (b) the outer error written as a factor of its own step — $E_f(k)=k\\,\\varepsilon_f(k)$ with $\\varepsilon_f(k)\\to0$ and $\\varepsilon_f(0)=0$ — or an equivalent device that keeps the identity valid at $k=0$; (c) $k(h)$ formed as $g(${DERIVE_A}+h)-g(${DERIVE_A})$ and SUBSTITUTED into $f$'s identity, never divided by; (d) the division-by-$h$ step reaching $${DERIVE_ANSWER}$, with the error term handled as the PRODUCT $\\varepsilon_f(k(h))\\cdot k(h)/h$; (e) an explicit statement that no step divided by $\\Delta u = k(h)$. A response that factors the error as $[E_f(k(h))/k(h)]\\cdot[k(h)/h]$ FAILS (b) and (e): that quotient is undefined exactly where $k(h)=0$, which is the case the whole argument exists to handle. Stating "$h'(${DERIVE_A}) = ${DERIVE_ANSWER}$ because you multiply the two derivatives" with no substitution argument shown is NOT a pass — that is the misconception this item exists to catch.`,
      },
    },
  ],

  keyTakeaway:
    "Feed one local-linear model's output into the other, and their slopes compound — never divide by $\\Delta u$ to get there, only substitute it. That is why the rule keeps working exactly where \"cancel the du's\" would need to divide by zero. Keep the substitution move: the next techniques you meet — substitution and integration by parts — are this same move, read forwards and backwards.",

  structuredSummary: {
    coreMentalModel:
      "The chain rule substitutes one local-linear model into the other — composing error terms, never dividing by $\\Delta u$.",
    definitionsIntroduced: ["Composition f∘g", "The chain rule"],
    mainResult: "(f∘g)'(a) = f'(g(a))·g'(a), derived by substitution, valid even where g'(a) = 0.",
    representationsConnected: [
      "Two linked zoom panels, magnifications compounding",
      "The substituted-model identity, with E_f(0) = 0",
      "The 1×1-matrix reading, composing to real matrix multiplication",
    ],
    commonMistake:
      "Treating \"cancel the du's\" as a proof rather than a mnemonic — it silently divides by Δu, which the honest substitution argument never needs to do.",
    canonicalExample: "(x²+1)³ at x = 1: two zooms, slopes 2 and 12, compounding to 24.",
    oneProblemWorthRemembering: "g(x) = |x|, f(u) = u²: the composite x² is smooth despite g's corner.",
    whatThisUnlocksNext:
      "The same substitution argument, unchanged, is the multivariable chain rule once f'(g(a)) and g'(a) become real matrices.",
  },

  // No `exampleId`: the guided scene and explorer each hardcode their own
  // fixtures (g and f are not single-function `CalculusFixture`s the way
  // L1-L4's shared example is), so there is no single id to point at —
  // matching karatsuba's precedent of omitting the field rather than
  // inventing one nothing would resolve.
};
