import type { LessonDefinition } from "./types";
import { EXERCISE_SEQUENCE_ID, MATH_EXPRESSION_ID, SELF_CHECK_ID } from "./capabilities";
import {
  GAUSS_NON_ELEMENTARY,
  PARTS_LN,
  PARTS_X_COS,
  PARTS_X_EXP,
  SUB_HALF_EXP,
  differentiatesToTarget,
  partsBoundaryTerm,
} from "../math";

/**
 * L7 `substitution-parts` — "Reading the Rules Backwards" (Package B,
 * `calculus-technique`). Contract: `docs/courses/applied-mathematics/lessons/
 * 07-substitution-parts/` (insight.md, mastery-contract.md).
 *
 * The insight in one line: antidifferentiation is RECOGNITION — substitution
 * is the chain rule (L5) read backwards, parts is the product rule
 * integrated via the FTC (L4), and the `[uv]` term is Theme 1's boundary
 * term, not new algebra.
 *
 * **No guided scene, deliberately** (constitution principle 7): this is
 * symbolic recognition; nothing changes over time. The two derivations are
 * `proof` route blocks — the main line, not ornament (principle 9) — and the
 * one picture (the substitution ledger explorer) is the exact area
 * reparametrization, restricted to monotone-g fixtures so it never claims
 * more than the identity it illustrates.
 *
 * **Every number below is computed from `src/math/integrationTechniques.ts`
 * fixtures, never re-typed** — the same discipline whose absence cost L6 two
 * review rounds. Load-time checks pin each exercise constant to the math
 * layer.
 */

/* -------------------------------------------------- computed exercise data */

// sp-bounds: ∫₀¹ 2x·cos(x²) dx = sin(1) − sin(0), via u = x², u-bounds 0 → 1.
const BOUNDS_LO = 0;
const BOUNDS_HI = 1;
const BOUNDS_VALUE = Math.sin(BOUNDS_HI * BOUNDS_HI) - Math.sin(BOUNDS_LO * BOUNDS_LO);
if (Math.abs(BOUNDS_VALUE - Math.sin(1)) > 1e-12) {
  throw new Error("substitutionParts: sp-bounds' value drifted from sin(1).");
}

// The parts boundary term the meaning item reads: [x·eˣ]₀² = 2e².
const XEXP_BOUNDARY = partsBoundaryTerm(PARTS_X_EXP);
if (Math.abs(XEXP_BOUNDARY - 2 * Math.E * Math.E) > 1e-9) {
  throw new Error("substitutionParts: the x·eˣ boundary term drifted from 2e².");
}

// Every antiderivative item's model answer must pass its own grader — the
// capability re-checks this at grade time; failing FAST here keeps a broken
// edit from shipping a page that only errors when a learner submits.
// The two first-production drills grade FRESH integrands, distinct from every
// taught example (mastery-contract.md §4). Freshness keeps the drill honest;
// it does not promote a near, technique-cued item to transfer evidence.
const FRESH_SUB = {
  integrand: "3x^2 cos(x^3)",
  expected: "sin(x^3)",
  domain: [0.2, 1.5] as const,
};
const FRESH_PARTS = {
  integrand: "x exp(2x)",
  expected: "x exp(2x)/2 - exp(2x)/4",
  domain: [0, 1.5] as const,
};

const ANTIDERIVATIVE_ITEMS: ReadonlyArray<{
  readonly source: string;
  readonly integrand: string;
  readonly domain: readonly [number, number];
}> = [
  { source: FRESH_SUB.expected, integrand: FRESH_SUB.integrand, domain: FRESH_SUB.domain },
  { source: FRESH_PARTS.expected, integrand: FRESH_PARTS.integrand, domain: FRESH_PARTS.domain },
  { source: SUB_HALF_EXP.antiderivativeSource, integrand: SUB_HALF_EXP.integrandSource, domain: SUB_HALF_EXP.domain },
  { source: PARTS_X_COS.antiderivativeSource, integrand: PARTS_X_COS.integrandSource, domain: PARTS_X_COS.domain },
  { source: PARTS_LN.antiderivativeSource, integrand: PARTS_LN.integrandSource, domain: PARTS_LN.domain },
  { source: "exp(x)(sin(x) - cos(x))/2", integrand: "exp(x) sin(x)", domain: [0, 2] },
];
for (const item of ANTIDERIVATIVE_ITEMS) {
  const verdict = differentiatesToTarget(item.source, item.integrand, { domain: item.domain });
  if (verdict.kind !== "antiderivative") {
    throw new Error(
      `substitutionParts: model answer "${item.source}" fails its own integrand "${item.integrand}" (${verdict.kind}).`,
    );
  }
}

export const substitutionPartsLesson: LessonDefinition = {
  id: "substitution-parts",
  title: "Reading the Rules Backwards",
  subtitle: "Substitution and integration by parts, derived — not memorized",

  learningObjectives: [
    "Recognize an integrand as the output of a differentiation you can name, before touching any notation",
    "Execute substitution as bookkeeping for that recognition — including the constant-adjustment ledger and transformed bounds",
    "Derive integration by parts from the product rule and the FTC, and read [uv] as the boundary term it is",
    "Choose which factor to differentiate by what simplifies — and classify an integrand as chain-shape, product-shape, or honestly neither",
    "Check any candidate antiderivative by differentiating it — the verification that is always available even when finding fails",
  ],

  objectives: [
    {
      id: "sp-obj-witness",
      text: "Recognize an integrand as a witnessed differentiation's output before any u-notation appears",
      evidence: "lesson-owned",
      evidenceLevel: "E1",
      itemIds: ["sp-witness-predict"],
    },
    {
      id: "sp-obj-substitute",
      text: "Produce an antiderivative for a fresh chain-shape integrand",
      evidence: "lesson-owned",
      evidenceLevel: "E2",
      itemIds: ["sp-substitute-basic"],
    },
    {
      id: "sp-obj-du-ledger",
      text: "State what du = g'(x)dx records — bookkeeping for the consumed factor, not fraction cancellation",
      evidence: "lesson-owned",
      evidenceLevel: "E2",
      itemIds: ["sp-du-ledger"],
    },
    {
      id: "sp-obj-half-constant",
      text: "Carry the constant-adjustment ledger honestly when the manufacturing factor is off by a constant",
      evidence: "lesson-owned",
      evidenceLevel: "E2",
      itemIds: ["sp-half-constant"],
    },
    {
      id: "sp-obj-bounds",
      text: "Transform bounds under substitution and evaluate the definite integral without back-substituting",
      evidence: "lesson-owned",
      evidenceLevel: "E2",
      itemIds: ["sp-bounds"],
    },
    {
      id: "sp-obj-parts-execute",
      text: "Produce a parts antiderivative on a fresh first trade",
      evidence: "lesson-owned",
      evidenceLevel: "E2",
      itemIds: ["sp-parts-xexp"],
    },
    {
      id: "sp-obj-boundary",
      text: "Identify [uv] as the FTC's boundary evaluation of the accumulated (uv)'",
      evidence: "lesson-owned",
      evidenceLevel: "E2",
      itemIds: ["sp-boundary-meaning"],
    },
    {
      id: "sp-obj-choose-u",
      text: "Choose which factor to differentiate on a fresh product, and name the reason",
      evidence: "lesson-owned",
      evidenceLevel: "E3",
      itemIds: ["sp-choose-u"],
    },
    {
      id: "sp-obj-parts-fresh",
      text: "Execute the parts trade after selecting which factor to differentiate",
      evidence: "lesson-owned",
      evidenceLevel: "E2",
      itemIds: ["sp-parts-fresh"],
    },
    {
      id: "sp-obj-ln-transfer",
      text: "Apply parts where the second factor is the invisible v' = 1",
      evidence: "lesson-owned",
      evidenceLevel: "E2",
      itemIds: ["sp-ln-parts"],
    },
    {
      id: "sp-obj-cyclic",
      text: "Recognize a cyclic parts recurrence and close it algebraically, then produce the antiderivative",
      evidence: "lesson-owned",
      evidenceLevel: "E2",
      itemIds: ["sp-cyclic-produce", "sp-cyclic"],
    },
    {
      id: "sp-obj-classify",
      text: "Classify a mixed set as chain-shape, product-shape, or neither — including the honest neither",
      evidence: "lesson-owned",
      evidenceLevel: "E2",
      itemIds: ["sp-classify"],
    },
    {
      id: "sp-obj-exists-elementary",
      text: "Distinguish an antiderivative existing from an antiderivative being elementary",
      evidence: "lesson-owned",
      evidenceLevel: "E2",
      itemIds: ["sp-exists-elementary"],
    },
  ],

  motivatingQuestion:
    "You just watched d/dx sin(x²) produce 2x·cos(x²). Now someone hands you ∫2x·cos(x²)dx — with the manufacture still on screen. What kind of problem is this, really?",

  sections: [
    {
      id: "witnessed-manufacture",
      title: "Watch the answer being manufactured",
      body:
        "Run the chain rule forward, in plain view: $\\frac{d}{dx}\\sin(x^2) = \\cos(x^2)\\cdot 2x$. Nothing new — this is Lesson 5's rule doing what it always does. Now read the board again, backwards: the expression $2x\\cos(x^2)$ *is the output of a differentiation you just performed*. So $\\int 2x\\cos(x^2)\\,dx$ is not asking you to do something new to $2x\\cos(x^2)$. It is asking: **which differentiation produced this?** — and this time you were in the room when it happened.",
      equation: "\\frac{d}{dx}\\sin(x^2) = 2x\\cos(x^2) \\quad\\Longleftrightarrow\\quad \\int 2x\\cos(x^2)\\,dx = \\sin(x^2) + C",
      observation:
        "Differentiation runs forward on visible rules. Antidifferentiation asks which forward run produced this — a recognition problem, and recognitions can be trained.",
    },
    {
      id: "the-ledger",
      title: "The u-notation is a ledger, not algebra",
      body:
        "The classical ritual writes $u = x^2$, $du = 2x\\,dx$, and 'cancels'. Nothing cancels. The line $du = 2x\\,dx$ is a **ledger entry**: it records which factor of the integrand — here $2x$ — is being consumed as the chain rule's manufacturing factor. The recognition and the ritual are the same computation; the ledger just keeps the books when the integrand is too tangled to recognize at sight. When the manufacturing factor is off by a constant — $\\int x e^{x^2} dx$ offers $x$ where the chain rule wants $2x$ — the ledger carries the honest $\\tfrac{1}{2}$: $x\\,dx = \\tfrac{1}{2}\\,du$.",
      equation: "\\int x e^{x^2}\\,dx \\;=\\; \\tfrac{1}{2}\\int e^{u}\\,du \\;=\\; \\tfrac{1}{2}e^{x^2} + C",
    },
    {
      id: "bounds-transform",
      title: "Definite integrals: the bounds ride along",
      body:
        "For a definite integral the ledger has one more line: the bounds transform under $g$, and then **no back-substitution is ever needed**. Why: both routes compute the same two numbers. By the FTC, $\\int_0^1 2x\\cos(x^2)dx = \\big[\\sin(x^2)\\big]_0^1 = \\sin(1) - \\sin(0)$; and $\\big[\\sin(u)\\big]_0^1$ — the u-integral with bounds $g(0)=0$ to $g(1)=1$ — is *the same subtraction*. The bounds-change rule is not a separate fact to memorize; it is the FTC applied twice.",
      equation: "\\int_a^b f(g(x))g'(x)\\,dx \\;=\\; \\int_{g(a)}^{g(b)} f(u)\\,du",
    },
    {
      id: "parts-trade",
      title: "Parts is a trade, and the price is a boundary term",
      body:
        "The second recognition: an integrand that is **one term of a product-rule output**. You cannot integrate $x e^x$ by recognizing a chain shape — there is no inner function whose manufacturing factor stands beside it. But $(x e^x)' = e^x + x e^x$ puts $x e^x$ *inside* a product rule's output, and integrating that identity over $[a,b]$ — the left side by the FTC — produces the trade: $\\int u\\,v' = [uv] - \\int u'\\,v$. Read each piece for what it is. $[uv]_a^b$ is the FTC's boundary evaluation — what the accumulated $(uv)'$ amounts to at the edges, Theme 1's oldest move. The remaining integral is the *price*: you have swapped your integral for a different one, and the whole craft is choosing the swap so the new one is easier.",
      equation: "\\int_a^b u\\,v'\\,dx \\;=\\; \\big[uv\\big]_a^b \\;-\\; \\int_a^b u'\\,v\\,dx",
    },
    {
      id: "choosing-u",
      title: "Choosing u: differentiate what dies",
      body:
        "In $\\int x e^x dx$, differentiating $x$ turns it into $1$ — it *dies* — while $e^x$ merely survives integration unchanged. So take $u = x$: the traded integral is $\\int e^x dx$, which is elementary. Choose the other way and the trade goes backwards: $u = e^x$ leaves $\\int \\tfrac{x^2}{2} e^x dx$, strictly worse. That is the whole principle: **differentiate the factor that simplifies; integrate the factor that can take it.** No mnemonic is needed, and none is offered — a mnemonic would replace the judgment this lesson exists to train. One more pattern the trade produces: on $\\int e^x\\sin x\\,dx$, two trades RETURN the original integral — $I = e^x\\sin x - e^x\\cos x - I$ — and the move is to recognize the recurrence and let algebra close it: $2I = e^x(\\sin x - \\cos x)$. A returning integral is not failure; it is the answer knocking. The surprising transfer: $\\int \\ln x\\,dx$ *is* a product — $\\ln x \\cdot 1$ — with the invisible $v' = 1$. Differentiating $\\ln x$ gives $1/x$ (it simplifies), integrating $1$ gives $x$, and the trade yields $x\\ln x - \\int 1\\,dx = x\\ln x - x + C$.",
    },
    {
      id: "honest-failure",
      title: "When recognition fails — and what that does and does not mean",
      body:
        "Try $\\int e^{-x^2} dx$. The chain shape wants the manufacturing factor $-2x$ beside $e^{-x^2}$; it is not there. No parts trade simplifies it. This is not a failure of cleverness: **by Liouville's theorem (1835), no elementary function has derivative** $e^{-x^2}$ — cited here, not proved; the proof is far beyond this course. But keep two properties separate. The antiderivative *exists*: $e^{-x^2}$ is continuous, so Lesson 4's accumulation function $\\int_0^x e^{-t^2}dt$ is one — a perfectly good function with a graph and values. It is simply not *elementary*: not expressible in the finite vocabulary of powers, exponentials, logs and trig. 'The search failed' and 'there is nothing to find' are different claims, and only the second is true here — about elementarity, and not about existence. Lesson 8 picks this exact function up again.",
      observation:
        "Verification never fails even when finding does: differentiating any candidate is mechanical. Check by differentiating — that habit is the method.",
    },
  ],

  route: [
    { kind: "motivate" },
    { kind: "section", sectionId: "witnessed-manufacture" },
    { kind: "formal", formalId: "def-reversed-bounds" },
    { kind: "formal", formalId: "thm-substitution" },
    { kind: "proof", formalId: "thm-substitution" },
    { kind: "section", sectionId: "the-ledger" },
    { kind: "explore" },
    { kind: "section", sectionId: "bounds-transform" },
    { kind: "worked", workedId: "worked-substitution" },
    { kind: "section", sectionId: "parts-trade" },
    { kind: "formal", formalId: "lemma-product-rule" },
    { kind: "proof", formalId: "lemma-product-rule" },
    { kind: "formal", formalId: "thm-parts" },
    { kind: "proof", formalId: "thm-parts" },
    { kind: "section", sectionId: "choosing-u" },
    { kind: "worked", workedId: "worked-parts" },
    { kind: "callout", calloutId: "du-is-not-a-fraction" },
    { kind: "section", sectionId: "honest-failure" },
    { kind: "callout", calloutId: "exists-vs-elementary" },
    { kind: "practice" },
    { kind: "summary" },
  ],

  formalBlocks: [
    {
      id: "def-reversed-bounds",
      kind: "definition",
      label: "Bounds in decreasing order",
      statement:
        "For $a > b$, define $\\int_a^b f(x)\\,dx := -\\int_b^a f(x)\\,dx$.",
      interpretation:
        "A convention, chosen so the FTC's evaluation form $[F(x)]_a^b = F(b) - F(a)$ holds verbatim whichever way the bounds run. Lessons 3–4 defined the integral only for increasing bounds; the Gate-4 audit found no owner for this convention upstream, so this lesson states it — substitution's transformed bounds can arrive in either order.",
      visibility: "visible",
    },
    {
      id: "lemma-product-rule",
      kind: "lemma",
      label: "The product rule — one line from L2's local model",
      statement:
        "If $u, v$ are differentiable at $a$, then $(uv)'(a) = u'(a)v(a) + u(a)v'(a)$.",
      interpretation:
        "Derived here, not assumed: the Gate-4 audit established that no built lesson has ever stated this rule, so parts cannot cite it — but it falls straight out of Lesson 2's local-linear model.",
      visibility: "visible",
      proof:
        "By Lesson 2's local model, $u(a+h) = u(a) + u'(a)h + E_u(h)$ and $v(a+h) = v(a) + v'(a)h + E_v(h)$, each residual decaying faster than $h$. Multiply: $u(a+h)v(a+h) = u(a)v(a) + \\big[u'(a)v(a) + u(a)v'(a)\\big]h + (\\text{cross terms})$, and every cross term — $u'(a)v'(a)h^2$, anything with a residual factor — decays faster than $h$. So the product's best linear model at $a$ has slope $u'(a)v(a) + u(a)v'(a)$, which by L2's definition IS its derivative.",
    },
    {
      id: "thm-substitution",
      kind: "proposition",
      label: "Substitution — the chain rule read backwards",
      statement:
        "Let $g$ be differentiable on an interval $I$, let $f$ be continuous on $g(I)$, and let $F$ be an antiderivative of $f$ there. Then $\\int f(g(x))\\,g'(x)\\,dx = F(g(x)) + C$ on $I$; and if $f(g(x))g'(x)$ is continuous on $[a,b] \\subseteq I$, then $\\int_a^b f(g(x))g'(x)\\,dx = \\int_{g(a)}^{g(b)} f(u)\\,du$.",
      interpretation:
        "An integrand of the shape f(g(x))·g'(x) is the output of a differentiation you can name — so naming it IS integrating it, and the bounds ride along because both sides are the same two numbers.",
      visibility: "visible",
      proof:
        "At points where $g(x)$ lies in the interior of $g(I)$, Lesson 5's chain rule gives $\\frac{d}{dx}F(g(x)) = F'(g(x))\\,g'(x) = f(g(x))\\,g'(x)$. If $g(x_0)$ is an endpoint of $g(I)$ attained at an interior extremum, then $g'(x_0)=0$ and the same result follows from the one-sided residuals of $F$ composed with $g$; if $g$ is constant, both sides are identically zero. Thus $F(g(x))$ is an antiderivative on all of $I$. For the definite statement, apply the FTC twice: $\\int_a^b f(g(x))g'(x)\\,dx = F(g(b)) - F(g(a)) = \\big[F(u)\\big]_{g(a)}^{g(b)} = \\int_{g(a)}^{g(b)} f(u)\\,du$. If $g(a) > g(b)$, the right side uses the decreasing-bounds convention defined immediately above. No monotonicity of $g$ is assumed.",
    },
    {
      id: "thm-parts",
      kind: "theorem",
      label: "Integration by parts — the product rule integrated",
      statement:
        "Let $u, v$ be differentiable on $[a,b]$ with $u', v'$ continuous. Then $\\int_a^b u\\,v'\\,dx = \\big[uv\\big]_a^b - \\int_a^b u'\\,v\\,dx$, and indefinitely $\\int u\\,v'\\,dx = uv - \\int u'\\,v\\,dx$.",
      interpretation:
        "A trade: one integral for a hopefully-easier one. The price is [uv] — the FTC's boundary evaluation, Theme 1's boundary term, not a new object.",
      visibility: "visible",
      proof:
        "The product rule (the lemma above — derived, not assumed): $(uv)' = u'v + uv'$. Both sides are continuous on $[a,b]$, so integrate: the left side by the FTC gives $u(b)v(b) - u(a)v(a)$; the right side splits into $\\int_a^b u'v\\,dx + \\int_a^b uv'\\,dx$ by **additivity of the integral** — at the Riemann-sum level every finite sum splits exactly, $\\sum (p + q)\\Delta x = \\sum p\\,\\Delta x + \\sum q\\,\\Delta x$, and Lesson 3's limit passes to both parts (stated here because no earlier lesson stated it; each integral exists separately since each integrand is continuous). Rearranged: $\\int_a^b uv'\\,dx = [uv]_a^b - \\int_a^b u'v\\,dx$. The indefinite form needs no FTC at all: $(uv)' = u'v + uv'$ says $uv$ is an antiderivative of $u'v + uv'$, and rearranging antiderivatives gives $\\int uv'\\,dx = uv - \\int u'v\\,dx$.",
    },
  ],

  explorationId: "substitution-ledger",

  workedExamples: [
    {
      id: "worked-substitution",
      title: "The ledger, kept honestly: ∫x·e^{x²} dx",
      prompt:
        "The chain rule wants the factor 2x; the integrand offers x. Keep the books.",
      equations: [
        "u = x^2 \\qquad du = 2x\\,dx \\qquad\\text{so}\\qquad x\\,dx = \\tfrac{1}{2}\\,du",
        "\\int x e^{x^2}\\,dx = \\tfrac{1}{2}\\int e^{u}\\,du = \\tfrac{1}{2}e^{u} + C = \\tfrac{1}{2}e^{x^2} + C",
        "\\textbf{Check by differentiating: } \\frac{d}{dx}\\Big(\\tfrac{1}{2}e^{x^2}\\Big) = \\tfrac{1}{2}e^{x^2}\\cdot 2x = x e^{x^2}\\;\\checkmark",
      ],
      equationsAriaLabel: "Substitution with the half constant, then verification by differentiating",
    },
    {
      id: "worked-parts",
      title: "The trade, executed: ∫x·eˣ dx",
      prompt: "x dies under differentiation; eˣ can absorb the integration.",
      equations: [
        "u = x,\\; v' = e^x \\qquad\\Rightarrow\\qquad u' = 1,\\; v = e^x",
        "\\int x e^x\\,dx = x e^x - \\int 1\\cdot e^x\\,dx = x e^x - e^x + C = (x-1)e^x + C",
        "\\textbf{Check: } \\frac{d}{dx}\\big[(x-1)e^x\\big] = e^x + (x-1)e^x = x e^x\\;\\checkmark",
      ],
      equationsAriaLabel: "Integration by parts on x times e to the x, then verification",
    },
  ],

  callouts: [
    {
      id: "du-is-not-a-fraction",
      title: "\"You just cancel the dx\"",
      moves: [
        {
          label: "Tempting belief",
          body: "$du = 2x\\,dx$ works like a fraction: the $dx$'s cancel, so the ritual is ordinary algebra on small quantities.",
        },
        {
          label: "But watch",
          body: "Lesson 5 was emphatic that the chain-rule notation does not justify cancelling $du$ and $dx$ as standalone quantities (building on Lesson 2's limit definition of a derivative). If the cancellation were really algebra, those standalone objects would have to exist. Nothing here cancels: run the computation without any $u$ at all — recognize $2x\\cos(x^2)$ as $\\frac{d}{dx}\\sin(x^2)$ directly — and you get the same answer with no fraction in sight.",
        },
        {
          label: "Repair",
          body: "$du = g'(x)\\,dx$ is a **ledger entry**: it records which factor of the integrand is being consumed as the chain rule's manufacturing factor. The notation is bookkeeping for a recognition — safe to use precisely because it is not doing any algebra.",
        },
      ],
    },
    {
      id: "exists-vs-elementary",
      title: "\"There's no antiderivative of e^{−x²}\"",
      moves: [
        {
          label: "Tempting belief",
          body: "Since no technique produces $\\int e^{-x^2}dx$, the antiderivative must not exist.",
        },
        {
          label: "But watch",
          body: "$e^{-x^2}$ is continuous, and Lesson 4 built an antiderivative for every continuous function: the accumulation function $A(x) = \\int_0^x e^{-t^2}dt$. It exists; you can plot it; $A'(x) = e^{-x^2}$ exactly. What Liouville proved (1835 — cited, not proved here) is that no *elementary* function — no finite formula in powers, exponentials, logs, trig — has this derivative.",
        },
        {
          label: "Repair",
          body: "Two different properties: **existing** and **being elementary**. The techniques search the elementary vocabulary; when they fail on $e^{-x^2}$, that is a true statement about the vocabulary, not about existence. Statistics will hand this exact function a name (the error function) and Lesson 8 gives its improper integral a value.",
        },
      ],
    },
  ],

  exercises: [
    /* ---- check ---------------------------------------------------------- */
    {
      id: "sp-witness-predict",
      type: "custom",
      capabilityId: "committed-prediction",
      tier: "check",
      prompt:
        "Commit first. You watched $\\frac{d}{dx}\\sin(x^2) = 2x\\cos(x^2)$ a moment ago. Before any $u$-notation: what is $\\int 2x\\cos(x^2)\\,dx$?",
      config: {
        options: [
          "$\\sin(x^2) + C$ — the function whose differentiation was just witnessed",
          "$x^2\\cos(x^2) + C$",
          "$2\\sin(x^2) + C$",
          "It cannot be determined from what was shown",
        ],
        correctIndex: 0,
        reveal:
          "The manufacture was on screen: differentiating $\\sin(x^2)$ produced exactly this integrand. Antidifferentiation asks which differentiation produced this — and this time you were in the room.",
      },
    },

    /* ---- drills --------------------------------------------------------- */
    {
      id: "sp-substitute-basic",
      type: "custom",
      capabilityId: MATH_EXPRESSION_ID,
      tier: "drill",
      prompt:
        "A fresh one: find an antiderivative of $3x^2\\cos(x^3)$. Type it as an expression — any correct member of the $+C$ family is accepted, and your answer is checked by differentiating it.",
      config: {
        expected: FRESH_SUB.expected,
        variables: ["x"],
        explanation:
          "The same recognition on a new instance: $\\cos(x^3)$ with its manufacturing factor $3x^2$ standing beside it — the output of $\\frac{d}{dx}\\sin(x^3)$.",
        check: {
          kind: "antiderivative-of",
          integrand: FRESH_SUB.integrand,
          domain: FRESH_SUB.domain,
        },
        placeholder: "e.g. sin( ... )",
      },
    },
    {
      id: "sp-du-ledger",
      type: "multiple-choice",
      tier: "drill",
      prompt: "In the substitution $u = x^2$, what does the line $du = 2x\\,dx$ actually record?",
      choices: [
        "Which factor of the integrand is being consumed as the chain rule's manufacturing factor",
        "That the infinitesimals du and dx cancel like a fraction",
        "That u and x are interchangeable variable names",
        "The derivative of the answer, for the final check",
      ],
      correctChoice: 0,
      explanation:
        "It is a ledger entry for the recognition — the factor $2x\\,dx$ is what the chain rule's output must contain, and the ledger marks it consumed. Nothing cancels; Lesson 5 already ruled out treating $du$ and $dx$ as cancellable standalone quantities.",
    },
    {
      id: "sp-half-constant",
      type: "custom",
      capabilityId: MATH_EXPRESSION_ID,
      tier: "drill",
      prompt:
        "Find an antiderivative of $x\\,e^{x^2}$. The chain rule wants $2x$; the integrand offers $x$ — keep the ledger honest.",
      config: {
        expected: SUB_HALF_EXP.antiderivativeSource,
        variables: ["x"],
        explanation:
          "$x\\,dx = \\tfrac{1}{2}du$ under $u = x^2$, so the answer carries the $\\tfrac{1}{2}$: $\\tfrac{1}{2}e^{x^2} + C$.",
        check: {
          kind: "antiderivative-of",
          integrand: SUB_HALF_EXP.integrandSource,
          domain: SUB_HALF_EXP.domain,
        },
        placeholder: "e.g. exp(x^2)/2",
      },
    },
    {
      id: "sp-bounds",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt: `Evaluate $\\int_0^1 2x\\cos(x^2)\\,dx$ by substitution, transforming the bounds.`,
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt: "Under $u = x^2$, what do the bounds $x = 0$ and $x = 1$ become?",
            choices: [
              "$u = 0$ to $u = 1$ — apply $g(x) = x^2$ to each bound",
              "$u = 0$ to $u = 2$ — apply $g'(x) = 2x$ to the top bound",
              "They stay $0$ to $1$ — bounds never change",
              "They cannot be determined without back-substituting",
            ],
            correctChoice: 0,
            explanation:
              "The bounds ride through $g$ itself: $g(0) = 0$, $g(1) = 1$. (Here they happen to look unchanged — the POINT is that you computed them, not assumed them.)",
          },
          {
            kind: "numeric",
            prompt: "Evaluate the integral. (Give a decimal.)",
            expected: BOUNDS_VALUE,
            tolerance: 1e-3,
            explanation: `$\\int_0^1 \\cos(u)\\,du = \\sin(1) - \\sin(0) \\approx ${BOUNDS_VALUE.toFixed(4)}$ — and no back-substitution was ever needed, because both routes compute the same two numbers.`,
          },
        ],
      },
    },
    {
      id: "sp-parts-xexp",
      type: "custom",
      capabilityId: MATH_EXPRESSION_ID,
      tier: "drill",
      prompt:
        "A fresh trade: find an antiderivative of $x\\,e^{2x}$. Checked by differentiating — any $+C$ representative passes.",
      config: {
        expected: FRESH_PARTS.expected,
        variables: ["x"],
        explanation:
          "$u = x$ dies; $v' = e^{2x}$ integrates to $\\tfrac{1}{2}e^{2x}$. The trade: $\\tfrac{x}{2}e^{2x} - \\int \\tfrac{1}{2}e^{2x}dx = \\big(\\tfrac{x}{2} - \\tfrac{1}{4}\\big)e^{2x} + C$.",
        check: {
          kind: "antiderivative-of",
          integrand: FRESH_PARTS.integrand,
          domain: FRESH_PARTS.domain,
        },
        placeholder: "e.g. x exp(2x)/2 - exp(2x)/4",
      },
    },
    {
      id: "sp-boundary-meaning",
      type: "multiple-choice",
      tier: "drill",
      prompt: "In $\\int_a^b u\\,v'\\,dx = [uv]_a^b - \\int_a^b u'\\,v\\,dx$, what IS the term $[uv]_a^b$?",
      choices: [
        "The FTC's boundary evaluation of the accumulated $(uv)'$ — what the product-rule integral amounts to at the edges",
        "A correction constant chosen to make the two sides equal",
        "The average of $uv$ over the interval",
        "An error term that vanishes as the interval shrinks",
      ],
      correctChoice: 0,
      explanation:
        "Integrating $(uv)' = u'v + uv'$ over $[a,b]$ turns the left side, via the FTC, into $u(b)v(b) - u(a)v(a)$ — the same boundary reading Theme 1 has used since Lesson 4. It is inherited, not invented.",
    },

    /* ---- transfer ------------------------------------------------------- */
    {
      id: "sp-choose-u",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt: "For $\\int x\\cos(x)\\,dx$ — a fresh product — set up the trade.",
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt: "Which factor should be $u$ (the one you differentiate)?",
            choices: [
              "$u = x$ — it dies under differentiation, and $\\cos x$ can absorb the integration",
              "$u = \\cos(x)$ — trig functions should always be differentiated",
              "$u = x\\cos(x)$ — take the whole integrand",
              "Either choice works equally well",
            ],
            correctChoice: 0,
            explanation:
              "Differentiate what simplifies: $x \\to 1$ (dies); $\\cos x$ only rotates through $\\pm\\sin, \\pm\\cos$ (survives). Choosing $u = \\cos x$ trades UP to $\\int \\tfrac{x^2}{2}\\sin x\\,dx$ — strictly worse.",
          },
          {
            kind: "multiple-choice",
            prompt: "After the trade, which integral is left to pay?",
            choices: [
              "$\\int \\sin(x)\\,dx$ — elementary",
              "$\\int x\\sin(x)\\,dx$ — the same difficulty again",
              "$\\int \\cos(x)\\,dx$ — the other factor",
              "None; the boundary term is the whole answer",
            ],
            correctChoice: 0,
            explanation:
              "$u = x, v = \\sin x$: the traded integral is $\\int u'v = \\int 1\\cdot\\sin(x)\\,dx$ — the trade's whole point is that this one is easy.",
          },
        ],
      },
    },
    {
      id: "sp-parts-fresh",
      type: "custom",
      capabilityId: MATH_EXPRESSION_ID,
      tier: "drill",
      prompt: "Now execute it: find an antiderivative of $x\\cos(x)$.",
      config: {
        expected: PARTS_X_COS.antiderivativeSource,
        variables: ["x"],
        explanation:
          "$x\\sin(x) - \\int \\sin(x)dx = x\\sin(x) + \\cos(x) + C$. Check by differentiating: $\\sin x + x\\cos x - \\sin x = x\\cos x$ ✓.",
        check: {
          kind: "antiderivative-of",
          integrand: PARTS_X_COS.integrandSource,
          domain: PARTS_X_COS.domain,
        },
        placeholder: "e.g. x sin(x) + cos(x)",
      },
    },
    {
      id: "sp-ln-parts",
      type: "custom",
      capabilityId: MATH_EXPRESSION_ID,
      tier: "drill",
      prompt:
        "Find an antiderivative of $\\ln(x)$ on $[0.5, 3]$. Hint withheld on purpose: what is the product here?",
      config: {
        expected: PARTS_LN.antiderivativeSource,
        variables: ["x"],
        explanation:
          "$\\ln x = \\ln x \\cdot 1$ — the invisible $v' = 1$. Differentiate $\\ln x$ (it simplifies to $1/x$), integrate $1$: $x\\ln x - \\int x\\cdot\\tfrac{1}{x}dx = x\\ln x - x + C$.",
        check: {
          kind: "antiderivative-of",
          integrand: PARTS_LN.integrandSource,
          domain: PARTS_LN.domain,
        },
        placeholder: "e.g. x ln(x) - x",
      },
    },
    {
      id: "sp-classify",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "Three integrands. For each: chain-shape (substitute), product-shape (parts), or neither. The honest 'neither' is a real answer, not a trick.",
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt: "$\\int \\cos(x)\\,e^{\\sin(x)}\\,dx$",
            choices: [
              "Chain-shape: $e^{\\sin x}$ with its manufacturing factor $\\cos x$ beside it",
              "Product-shape: trade $\\cos x$ against $e^{\\sin x}$",
              "Neither",
              "Both, equally naturally",
            ],
            correctChoice: 0,
            explanation:
              "$\\frac{d}{dx}e^{\\sin x} = \\cos(x)e^{\\sin x}$ — the integrand is that output, verbatim: $e^{\\sin x} + C$.",
          },
          {
            kind: "multiple-choice",
            prompt: "$\\int x\\ln(x)\\,dx$",
            choices: [
              "Product-shape: $\\ln x$ simplifies under differentiation, $x$ integrates cleanly",
              "Chain-shape: $u = \\ln x$ with manufacturing factor $x$",
              "Neither",
              "Chain-shape: $u = x^2$",
            ],
            correctChoice: 0,
            explanation:
              "No inner function's derivative stands beside a composition ($u = \\ln x$ would need the factor $1/x$, not $x$). But the parts conditions hold: differentiate $\\ln x$, integrate $x$.",
          },
          {
            kind: "multiple-choice",
            prompt: "$\\int e^{-x^2}\\,dx$",
            choices: [
              "Neither — the manufacturing factor $-2x$ is absent, no trade simplifies it, and by Liouville's theorem no elementary antiderivative exists",
              "Chain-shape: $u = -x^2$",
              "Product-shape: $u = e^{-x^2}$, $v' = 1$",
              "Chain-shape after multiplying by $\\tfrac{-2x}{-2x}$",
            ],
            correctChoice: 0,
            explanation:
              "$u = -x^2$ needs $-2x\\,dx$ in the integrand — it is not there, and a variable factor cannot be smuggled in through the constant-adjustment ledger (only constants can). This is the honest 'neither': the antiderivative exists (Lesson 4's accumulation function) but is provably not elementary.",
          },
        ],
      },
    },
    {
      id: "sp-cyclic",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt: "For $\\int e^x \\sin(x)\\,dx$, run the trade and watch what comes back.",
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt: "After integrating by parts TWICE (differentiating the trig factor each time), what is left to pay?",
            choices: [
              "The original integral itself, with a sign — the trade cycles",
              "An elementary integral of a polynomial",
              "A strictly harder integral each time — parts fails here",
              "Nothing; the boundary terms are the whole answer",
            ],
            correctChoice: 0,
            explanation:
              "$I = e^x\\sin x - \\int e^x\\cos x\\,dx = e^x\\sin x - e^x\\cos x - I$. The integral RETURNS. That is not failure — it is an equation in $I$.",
          },
          {
            kind: "multiple-choice",
            prompt: "What closes the cycle?",
            choices: [
              "Algebra: solve $I = e^x(\\sin x - \\cos x) - I$ for $I$",
              "A third integration by parts",
              "Substitution with $u = \\sin x$",
              "The cycle cannot be closed — a table is required",
            ],
            correctChoice: 0,
            explanation:
              "$2I = e^x(\\sin x - \\cos x)$, so $I = \\tfrac{1}{2}e^x(\\sin x - \\cos x) + C$. Recognizing the recurrence — not merely ranking factors — is part of choosing the method.",
          },
        ],
      },
    },
    {
      id: "sp-cyclic-produce",
      type: "custom",
      capabilityId: MATH_EXPRESSION_ID,
      tier: "drill",
      prompt: "Close it yourself: find an antiderivative of $e^x\\sin(x)$.",
      config: {
        expected: "exp(x)(sin(x) - cos(x))/2",
        variables: ["x"],
        explanation:
          "Two trades return the original integral; algebra closes the cycle: $I = \\tfrac{1}{2}e^x(\\sin x - \\cos x) + C$. As always: check by differentiating.",
        check: {
          kind: "antiderivative-of",
          integrand: "exp(x) sin(x)",
          domain: [0, 2],
        },
        placeholder: "e.g. exp(x)(sin(x) - cos(x))/2",
      },
    },
    {
      id: "sp-exists-elementary",
      type: "multiple-choice",
      tier: "drill",
      prompt: "For $f(x) = e^{-x^2}$, which statement is exactly right?",
      choices: [
        "An antiderivative exists (the accumulation function $\\int_0^x e^{-t^2}dt$), but no elementary formula equals it",
        "No antiderivative exists, which is why the techniques fail",
        "An elementary antiderivative exists, but is too complicated for this course",
        "The antiderivative exists only on intervals where $f$ is increasing",
      ],
      correctChoice: 0,
      explanation:
        "Existence comes from continuity + Lesson 4's construction. Elementarity is a separate property, and Liouville's theorem (cited, not proved) rules it out. The techniques search the elementary vocabulary; their failure here is a fact about the vocabulary.",
    },

    /* ---- practice event, NOT evidence (see mastery-contract.md §1) ------- */
    {
      id: "sp-derive-parts",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt:
        "Reproduce the parts derivation from scratch: start from the product rule, integrate both sides over $[a,b]$, name the theorem that evaluates the left side, and state which hypothesis makes the right side split into two integrals.",
      config: {
        modelAnswer:
          "Product rule: $(uv)' = u'v + uv'$, valid since $u, v$ are differentiable. Both sides are continuous on $[a,b]$ (hypothesis: $u', v'$ continuous), so both sides may be integrated over $[a,b]$. The left side is the integral of a derivative, so the FTC evaluates it: $\\int_a^b (uv)'\\,dx = u(b)v(b) - u(a)v(a) = [uv]_a^b$. The right side splits by linearity of the integral into $\\int_a^b u'v\\,dx + \\int_a^b uv'\\,dx$ — legitimate because each integrand is continuous, hence each integral exists separately. Rearranging: $\\int_a^b uv'\\,dx = [uv]_a^b - \\int_a^b u'v\\,dx$. The boundary term is the FTC's evaluation — the same boundary reading as every accumulation since Lesson 4.",
        rubricId: "sp-derive-parts",
        rubricVersion: 1,
        rubricText:
          "PASS requires: (a) the product rule stated and integrated over the interval — not the parts formula asserted and rearranged backwards; (b) the FTC NAMED as what turns the left side into $[uv]_a^b$; (c) the linearity split justified by both integrands existing separately (continuity named); (d) the final rearrangement. A response that writes the parts formula from memory and verifies it by differentiating is a different (valid) exercise but NOT this derivation — it must not pass.",
      },
    },
  ],

  keyTakeaway:
    "Substitution is the chain rule read backwards; parts is the product rule integrated, and its [uv] is the FTC's boundary term. The activity is recognition — and every candidate answer can be checked by differentiating, even when no candidate can be found.",

  structuredSummary: {
    coreMentalModel:
      "Antidifferentiation asks which differentiation produced this. Each technique is a forward rule read in reverse: substitution recognizes the chain rule's output shape $f(g(x))\\,g'(x)$; parts recognizes one term of a product rule's output and trades it.",
    definitionsIntroduced: [
      "Antiderivative on an interval (recalled from L4, now the object of search)",
      "The substitution ledger: $u = g(x)$, $du = g'(x)\\,dx$",
      "The parts trade and its boundary term $[uv]_a^b$",
      "Elementary function (informally): a finite formula in powers, exponentials, logs, trig",
    ],
    mainResult:
      "$\\int f(g(x))g'(x)dx = F(g(x)) + C$ and $\\int_a^b uv'dx = [uv]_a^b - \\int_a^b u'v\\,dx$ — each derived in two lines from an already-owned rule plus the FTC.",
    representationsConnected: [
      "The witnessed manufacture (forward differentiation on screen, then read backwards)",
      "The ledger notation, demystified as bookkeeping",
      "The area reparametrization (the explorer's two panels with equal totals)",
      "The boundary term as Theme 1's edge-reading of an accumulated derivative",
    ],
    commonMistake:
      "Treating $du = g'(x)dx$ as fraction cancellation — and, downstream, concluding from a failed search that no antiderivative exists. The ledger is bookkeeping; existence and elementarity are different properties.",
    canonicalExample:
      "$\\int 2x\\cos(x^2)dx = \\sin(x^2) + C$, recognized from the witnessed $\\frac{d}{dx}\\sin(x^2)$; and $\\int xe^x dx = (x-1)e^x + C$, the canonical trade.",
    oneProblemWorthRemembering:
      "$\\int \\ln(x)\\,dx$ — a product with an invisible factor $v' = 1$, solved by differentiating the $\\ln$.",
    whatThisUnlocksNext:
      "L8 gives $e^{-x^2}$'s improper integral a value the antiderivative search could not. Much later, in the differential-equations unit, the Laplace transform's derivative rule IS this lesson's parts identity, with the boundary term carrying the initial conditions.",
  },

  // No single exampleId: this lesson deliberately uses several representations
  // and worked structures, so no one fixture covers both taught and graded
  // surfaces — the same reasoning as L6's omission.
};

// Referenced by the classify item's honest-neither explanation; asserting it
// here keeps the citation string and the fixture from drifting apart.
if (!GAUSS_NON_ELEMENTARY.citation.includes("Liouville")) {
  throw new Error("substitutionParts: the non-elementary citation lost its attribution.");
}
