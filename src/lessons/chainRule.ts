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
 * `self-check` (ceiling E5) and claims E4 — human-scored, produced written
 * reproduction of the substitution derivation on a fresh pair, the only real
 * evidence for M2 ("the chain rule is an independent fact to memorize"),
 * which no numeric/MC item can test since it requires PRODUCING the
 * argument, not applying its conclusion.
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
  subtitle: "Substitute one local-linear model into the other — never divide by Δu to get there",
  learningObjectives: [
    "Decompose a fresh composite and differentiate it via the chain rule",
    "Predict (f∘g)'(a) at a point where g'(a) = 0, without full computation",
    "Identify exactly what fails in \"cancel the du's\" when Δu = 0",
    "Verify a chain-rule result by an independent direct-expansion route",
    "Select the efficient route — chain rule or direct expansion — on a fresh composite",
    "State what does and does not follow when the inner function has a corner",
  ],
  motivatingQuestion:
    "You already know d(x²)/dx and you already know d(u³)/du. What is d((x²+1)³)/dx — and why isn't the answer just \"multiply the two rules you already know\"?",

  guidedSceneId: "chain-rule",
  explorationId: "chain-rule",

  route: [
    { kind: "motivate" },
    { kind: "visual", heading: "Two zooms, linked" },
    { kind: "section", sectionId: "two-local-models" },
    { kind: "formal", formalId: "def-composition" },
    { kind: "section", sectionId: "the-repair" },
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
      title: "The honest repair",
      body: "Write $b = g(a)$. By Lesson 2's C5, $g(a+h) = g(a) + g'(a)h + E_g(h)$ with $E_g(h)/h \\to 0$, and $f(b+k) = f(b) + f'(b)k + E_f(k)$ with $E_f(k)/k \\to 0$. Crucially, $E_f(0) = 0$ automatically — it is forced by $E_f$'s own definition, not assumed.\n\nSubstitute $g$'s approximation as $f$'s input: set $k(h) = g(a+h) - g(a)$, and\n$$f(g(a+h)) = f(g(a)) + f'(g(a))\\bigl[g'(a)h + E_g(h)\\bigr] + E_f(k(h)).$$\nThis identity holds for **every** $h$ — including any $h$ where $k(h) = 0$, because then the last term is $E_f(0) = 0$ automatically. Nothing was ever divided by $\\Delta u$; it was only ever substituted. Divide the whole identity by $h$ and let $h \\to 0$: the middle term's $E_g(h)/h \\to 0$, and the last term's ratio $E_f(k(h))/h$ splits into $\\bigl[E_f(k(h))/k(h)\\bigr]\\cdot\\bigl[k(h)/h\\bigr]$ — a factor that vanishes ($k(h) \\to 0$ since $g$ is continuous — Lesson 1 — composed with $E_f(k)/k \\to 0$) times a factor that stays bounded ($k(h)/h \\to g'(a)$, from $g$'s differentiability, not merely its continuity). What remains is $f'(g(a))\\,g'(a)$. (This last step is stated here at the same level of formality Lesson 2 uses for its own error term, not spelled out with full quantifiers.)",
      equation: "(f\\circ g)'(a) = f'(g(a))\\,g'(a)",
      observation:
        "That is also why g'(a) = 0 needs no special case: the identity above never divided by g'(a) or by Δu to reach the answer.",
      layers: [
        {
          kind: "why",
          title: "Why this counts as a repair, not a restatement",
          body: "The naive argument and this one reach the same formula, but only one of them is defined at every step. \"Cancel the $du$'s\" asks $\\frac{\\Delta y}{\\Delta u}$ to exist, which fails wherever $\\Delta u = 0$ — a real possibility even when $g$ is perfectly smooth. The substitution above never forms that ratio at all.",
        },
      ],
    },
    {
      id: "matrix-reading",
      title: "Rates multiply because 1×1 matrices compose",
      body: "Lesson 2's C9 read $f'(a)$ as the $1\\times1$ matrix of the linear map $h \\mapsto f'(a)h$. Composing two linear maps composes their matrices — in one dimension, that is exactly multiplying the two numbers. This is the same fact linear algebra's `matrix-composition` lesson teaches; here it is the same statement one dimension down.",
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
        "Derived by substituting g's local-linear model into f's — never by dividing by Δu. That substitution is what makes the g'(a) = 0 case fall out with no special handling.",
      visibility: "visible",
    },
  ],

  checkpoint: {
    prompt:
      "A composite f(g(x)) has g'(3) = 0. Without computing anything else, what is (f∘g)'(3) — and why doesn't \"cancel the du's\" make this obvious?",
    answer:
      "(f∘g)'(3) = f'(g(3))·0 = 0 directly from the rule; the cancellation story cannot approach this case because it would need to divide by Δu, which need not even be nonzero near x = 3.",
  },
  checkpoints: [
    {
      id: "predict-zero",
      prompt:
        "A composite f(g(x)) has g'(3) = 0. Without computing anything else, what is (f∘g)'(3) — and why doesn't \"cancel the du's\" make this obvious?",
      answer:
        "(f∘g)'(3) = f'(g(3))·0 = 0 directly from the rule; the cancellation story cannot approach this case because it would need to divide by Δu, which need not even be nonzero near x = 3.",
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
        "It silently regroups the limit as a product, which requires Δu ≠ 0 to even divide",
        "It is correct, but considered inelegant by mathematicians",
        "It only works when f and g are polynomials",
        "It works, but gives the wrong sign in some cases",
      ],
      correctChoice: 0,
      explanation:
        "The step $\\frac{\\Delta y}{\\Delta x} = \\frac{\\Delta y}{\\Delta u}\\cdot\\frac{\\Delta u}{\\Delta x}$ needs $\\Delta u \\neq 0$ to form the first ratio — a real gap, not a matter of taste, and one the honest substitution argument never opens.",
    },
    {
      id: "chain-corner-not-necessary",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "g(x) = |x| has a corner at x = 0. What follows about f(g(x)) at x = 0, for a smooth f?",
      choices: [
        "The composite MAY still be differentiable there — the chain rule's hypothesis is sufficient, not necessary",
        "The composite cannot possibly be differentiable at x = 0",
        "The composite is always differentiable there, for any f",
        "Nothing can be said without knowing f explicitly, in every case",
      ],
      correctChoice: 0,
      explanation:
        "For f(u) = u², f(g(x)) = |x|² = x² — differentiable everywhere, despite g's corner. The chain rule's hypothesis licenses its conclusion; it is not required for the composite itself to be differentiable.",
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
      prompt: `g(x) = (x-${ZERO_A})² + 1, so g'(${ZERO_A}) = 0. For ANY differentiable f, what is (f∘g)'(${ZERO_A}) — without knowing f at all?`,
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
        modelAnswer: `$b=g(${DERIVE_A})=${DERIVE_B}$. By L2 C5: $g(${DERIVE_A}+h) = ${DERIVE_B} + ${DERIVE_G_PRIME(DERIVE_A)}h + E_g(h)$ with $E_g(h)/h\\to0$, and $f(${DERIVE_B}+k) = ${DERIVE_B * DERIVE_B + 1} + ${DERIVE_F_PRIME(DERIVE_B)}k + E_f(k)$ with $E_f(k)/k\\to0$ (and $E_f(0)=0$ automatically). Setting $k(h)=g(${DERIVE_A}+h)-g(${DERIVE_A})$, substituting gives $f(g(${DERIVE_A}+h)) = ${DERIVE_B * DERIVE_B + 1} + ${DERIVE_F_PRIME(DERIVE_B)}[${DERIVE_G_PRIME(DERIVE_A)}h+E_g(h)] + E_f(k(h))$ — an identity holding for every $h$, including where $k(h)=0$, since $E_f(0)=0$ needs no division to reach. Dividing by $h$ and letting $h\\to0$: the constant term is $${DERIVE_F_PRIME(DERIVE_B)}\\times${DERIVE_G_PRIME(DERIVE_A)} = ${DERIVE_ANSWER}$, the $E_g(h)/h$ term vanishes, and $E_f(k(h))/h$ vanishes because it factors into $[E_f(k(h))/k(h)]\\cdot[k(h)/h]$, a vanishing factor times a bounded one. So $h'(${DERIVE_A}) = ${DERIVE_ANSWER}$. No division by $\\Delta u$ occurred anywhere — the argument only ever substituted $k(h)$, never divided by it.`,
        rubricId: "chain-derive-fresh",
        rubricVersion: 1,
        rubricText: `PASS requires the SUBSTITUTION argument reproduced, not just the product ${DERIVE_ANSWER} stated: (a) both local-linear models written with their error terms (E_g(h), E_f(k)); (b) k(h) formed as g(${DERIVE_A}+h)-g(${DERIVE_A}) and substituted into f's identity, not divided; (c) the identity's validity at k(h)=0 (via E_f(0)=0) stated explicitly; (d) the final division-by-h step reaching ${DERIVE_ANSWER}; (e) an explicit statement that no division by Delta-u occurred anywhere in the argument. Stating "h'(${DERIVE_A}) = ${DERIVE_ANSWER} because you multiply the two derivatives" with no substitution argument shown is NOT a pass — that is exactly M2, the misconception this item exists to catch.`,
      },
    },
  ],

  keyTakeaway:
    "Feed one local-linear model's output into the other, and their slopes compound — never divide by Δu to get there, only substitute it. That is why the rule keeps working exactly where \"cancel the du's\" would need to divide by zero. Keep the substitution move: Package B's next techniques — substitution, parts — are this same move, read forwards and backwards.",

  structuredSummary: {
    coreMentalModel:
      "The chain rule substitutes one local-linear model into the other — composing error terms, never dividing by Δu.",
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
