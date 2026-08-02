import type { LessonDefinition } from "./types";
import { EXERCISE_SEQUENCE_ID, SELF_CHECK_ID } from "./capabilities";
import {
  OPT_CUBIC_SURVIVOR,
  OPT_DECAY,
  OPT_MAIN_CUBIC,
  OPT_NEG_QUARTIC,
  OPT_QUARTIC,
  classifyStationaryPoint,
  globalExtrema,
  linearize,
  trustRadius,
} from "../math";

/**
 * Lesson: "Deciding with the Derivative" — applied mathematics L6, unit
 * `calculus-technique`, Package B slice B2. Second lesson of Package B,
 * following `chain-rule` in the spine but NOT depending on it (the chain rule
 * appears nowhere in this lesson's argument — see insight.md's prerequisites).
 *
 * Built on the PASS contract
 * `docs/courses/applied-mathematics/lessons/06-optimization-approximation/insight.md`,
 * approved by the repository owner across two independent Mode B review
 * rounds (2026-08-01), with both Mode A amendments resolved: the
 * `fundamental-theorem -> optimization-approximation` hard edge is approved,
 * so the second-derivative test and the linearization error bound below are
 * DERIVED from the FTC, not cited.
 *
 * Primary insight: at an interior point where f is differentiable, f'(a) != 0
 * REFUTES a local extremum — the local model hands you a step that provably
 * improves — while f'(a) = 0 merely SURVIVES that one-point test rather than
 * passing it. Interiority and differentiability are the argument's two
 * hypotheses; "a survivor need not win" is the failure of its converse.
 * Certifying a survivor takes a further argument (the second-derivative
 * test), which is why that test exists at all.
 *
 * Evidence discipline, applied before any code was written (the L1-L5
 * preflight, and the corrected form of it — see mastery-contract.md §1d):
 * `multiple-choice` capped at E2, `numeric`/`exercise-sequence` at E3.
 * `opt-derive-escape` uses `self-check` and is LEARNER-SELF-MARKED, not
 * human-scored — `/review` reads module `AttemptSet`s, never a lesson's own
 * exercises — so it claims NO evidence level and covers NO objective. That is
 * checked explicitly in `optimizationApproximationGradingContract.test.ts`,
 * not left implicit.
 */

/* ---------------------------------------------------------------- numbers */

const MAIN = globalExtrema(OPT_MAIN_CUBIC);
if (
  !MAIN.max ||
  !MAIN.min ||
  Math.abs(MAIN.max.value - 18) > 1e-9 ||
  Math.abs(MAIN.min.value - -2) > 1e-9
) {
  throw new Error("optimizationApproximation: main cubic's global extrema disagree with the prose.");
}

/** `opt-candidate-set`: h(x) = x^4 - 4x^2 + 2 on [-3, 2] — a fresh closed interval. */
const CAND_H = (x: number) => x * x * x * x - 4 * x * x + 2;
const CAND_DOMAIN: readonly [number, number] = [-3, 2];
const CAND_STATIONARY = [-Math.sqrt(2), 0, Math.sqrt(2)];
const CAND_COUNT = CAND_STATIONARY.length + 2; // + both endpoints
const CAND_MAX = CAND_H(CAND_DOMAIN[0]); // 47, at the endpoint x = -3
if (Math.abs(CAND_MAX - 47) > 1e-9) {
  throw new Error("optimizationApproximation: opt-candidate-set's fresh fixture disagrees with the prose.");
}

/** `opt-endpoint-fresh`: k(x) = 2x^3 - 3x^2 - 12x + 5 on [-2, 4] — fresh, distinct coefficients from the main case. */
const ENDPOINT_K = (x: number) => 2 * x * x * x - 3 * x * x - 12 * x + 5;
const ENDPOINT_DOMAIN: readonly [number, number] = [-2, 4];
const ENDPOINT_LOCAL_MAX = ENDPOINT_K(-1); // 12
const ENDPOINT_GLOBAL_MAX = ENDPOINT_K(4); // 37
if (Math.abs(ENDPOINT_LOCAL_MAX - 12) > 1e-9 || Math.abs(ENDPOINT_GLOBAL_MAX - 37) > 1e-9) {
  throw new Error("optimizationApproximation: opt-endpoint-fresh's fixture disagrees with the prose.");
}

/** `opt-which-hypothesis`: n(x) = |x-1| + (x-1)^2 on [-1, 3] — a fresh, non-picturable minimum at the corner x = 1. */
const HYP_N = (x: number) => Math.abs(x - 1) + (x - 1) * (x - 1);
const HYP_MIN = HYP_N(1); // 0
if (Math.abs(HYP_MIN) > 1e-9) {
  throw new Error("optimizationApproximation: opt-which-hypothesis's fixture disagrees with the prose.");
}

/** `opt-select-route`: q(x) = x^2 - 8x + 20 on [0, 10] — completes the square cleanly, q(x) = (x-4)^2 + 4. */
const SELECT_Q = (x: number) => x * x - 8 * x + 20;
const SELECT_MIN = SELECT_Q(4); // 4
if (Math.abs(SELECT_MIN - 4) > 1e-9) {
  throw new Error("optimizationApproximation: opt-select-route's fixture disagrees with the prose.");
}

/** `opt-derive-steps`: g(x) = x^2 - 4x + 1 at a = 0 — fresh, used only here. */
const STEPS_G = (x: number) => x * x - 4 * x + 1;
const STEPS_A = 0;
const STEPS_M = -4; // g'(0)
const STEPS_H = -0.2; // the improving direction, since m < 0
const STEPS_VALUE = STEPS_G(STEPS_A + STEPS_H); // 1.84
if (Math.abs(STEPS_VALUE - 1.84) > 1e-9) {
  throw new Error("optimizationApproximation: opt-derive-steps's fixture disagrees with the prose.");
}

/**
 * `opt-derive-escape` (practice, no evidence claim): r(x) = x^2 + 2x - 3 on
 * [-2, 4], at a = 1 — fresh, distinct from opt-derive-steps. The domain is
 * declared explicitly (review found the model answer asserting "a = 1 is
 * interior to any reasonable domain" with no domain given at all — a real
 * gap, since interiority is exactly one of the two hypotheses this argument
 * is supposed to name) and chosen wide enough that h = ±0.3 both stay inside.
 */
const ESCAPE_R = (x: number) => x * x + 2 * x - 3;
const ESCAPE_DOMAIN: readonly [number, number] = [-2, 4];
const ESCAPE_A = 1;
const ESCAPE_M = 4; // r'(1)
const ESCAPE_H = 0.3; // the improving direction, since m > 0
// E(h) = h^2 exactly for a quadratic, so the sign-agreement threshold is
// exact too: h^2 < |m h| = 4|h| (for h != 0) iff |h| < 4. Not the general
// C3-style conservative bound (|E(h)| <= |m||h|/2, giving |h| < 2) — the
// exact one, since this residual has no higher-order terms to bound away.
const ESCAPE_THRESHOLD = ESCAPE_M;
const ESCAPE_VALUE = ESCAPE_R(ESCAPE_A + ESCAPE_H);
const ESCAPE_VALUE_NEG = ESCAPE_R(ESCAPE_A - ESCAPE_H);
if (Math.abs(ESCAPE_VALUE - (ESCAPE_R(ESCAPE_A) + ESCAPE_M * ESCAPE_H + ESCAPE_H * ESCAPE_H)) > 1e-9) {
  throw new Error("optimizationApproximation: opt-derive-escape's fixture disagrees with the prose.");
}
if (!(Math.abs(ESCAPE_H) < ESCAPE_THRESHOLD)) {
  throw new Error("optimizationApproximation: opt-derive-escape's step exceeds its own claimed exact threshold.");
}
if (ESCAPE_A - ESCAPE_H <= ESCAPE_DOMAIN[0] || ESCAPE_A + ESCAPE_H >= ESCAPE_DOMAIN[1]) {
  throw new Error("optimizationApproximation: opt-derive-escape's step leaves the declared domain.");
}

/** `opt-linearize-tolerance`: |f''| <= 8, epsilon = 0.002 -> |h| <= sqrt(2*0.002/8). */
const TOLERANCE_M = 8;
const TOLERANCE_EPS = 0.002;
const TOLERANCE_ANSWER = Math.sqrt((2 * TOLERANCE_EPS) / TOLERANCE_M);

/** The decay linearization, verified against the math layer, not hand-typed. */
const DECAY_LIN = linearize(OPT_DECAY, 0, trustRadius(OPT_DECAY, 0, 0.01));
if (DECAY_LIN.trueError > 0.01 + 1e-9) {
  throw new Error("optimizationApproximation: decay linearization exceeds its own trust radius's tolerance.");
}

/** Sanity: the second-derivative test's silence battery, as displayed. */
if (
  classifyStationaryPoint(OPT_QUARTIC, 0) !== "silent" ||
  classifyStationaryPoint(OPT_NEG_QUARTIC, 0) !== "silent" ||
  classifyStationaryPoint(OPT_CUBIC_SURVIVOR, 0) !== "silent"
) {
  throw new Error("optimizationApproximation: the silence battery disagrees with the classifier.");
}

/** `opt-second-test-silent` step 1: u(x) = x^2 - 6x + 5 at x = 3 — fresh, a genuine local min. */
const SILENT_U = (x: number) => x * x - 6 * x + 5;
const SILENT_U_VALUE = SILENT_U(3); // -4
if (Math.abs(SILENT_U_VALUE - -4) > 1e-9) {
  throw new Error("optimizationApproximation: opt-second-test-silent's warm-up fixture disagrees with the prose.");
}

export const optimizationApproximationLesson: LessonDefinition = {
  id: "optimization-approximation",
  title: "Deciding with the Derivative",
  subtitle: "A nonzero slope refutes; a zero slope only survives — deciding what survived takes a further argument",
  learningObjectives: [
    "Given a fresh function on a fresh closed interval, construct the complete candidate set and justify each non-stationary member",
    "Predict a global maximum at an endpoint despite an interior local maximum",
    "Decline to conclude an extremum from $f'(a) = 0$, and state what does follow",
    "On an unfamiliar function, name which hypothesis of the refutation argument fails",
    "Say what the method returns on an open interval, and why that is correct rather than broken",
    "Classify a survivor with the second-derivative test, including its own honest silence",
    "From a curvature bound, produce an interval on which a linearization meets a stated tolerance",
    "Choose, unprompted, between the calculus route and an algebraic certificate, and justify the choice",
  ],
  objectives: [
    {
      id: "opt-obj-candidate-set",
      text: "Given a fresh f on a fresh closed interval, construct the complete candidate set and state why each non-stationary member is in it",
      evidence: "lesson-owned",
      evidenceLevel: "E3",
      itemIds: ["opt-candidate-set"],
    },
    {
      id: "opt-obj-endpoint",
      text: "Predict a global maximum at an endpoint despite an interior local maximum",
      evidence: "lesson-owned",
      evidenceLevel: "E3",
      itemIds: ["opt-endpoint-fresh"],
    },
    {
      id: "opt-obj-flat-not-extremum",
      text: "Decline to conclude an extremum from f'(a) = 0, and state what does follow",
      evidence: "lesson-owned",
      evidenceLevel: "E2",
      itemIds: ["opt-flat-not-extremum"],
    },
    {
      id: "opt-obj-which-hypothesis",
      text: "On an unfamiliar function, name which hypothesis of the refutation argument fails",
      evidence: "lesson-owned",
      evidenceLevel: "E3",
      itemIds: ["opt-which-hypothesis"],
    },
    {
      id: "opt-obj-open-interval",
      text: "Say what the method returns on an open interval, and why that is correct rather than broken",
      evidence: "lesson-owned",
      evidenceLevel: "E2",
      itemIds: ["opt-open-interval"],
    },
    {
      id: "opt-obj-second-test",
      text: "Classify a survivor with the second-derivative test, and return silent when f''(a) = 0",
      evidence: "lesson-owned",
      evidenceLevel: "E3",
      itemIds: ["opt-second-test-silent"],
    },
    {
      id: "opt-obj-linearize",
      text: "From a curvature bound, produce an interval on which a linearization meets a stated tolerance",
      evidence: "lesson-owned",
      evidenceLevel: "E3",
      itemIds: ["opt-linearize-tolerance"],
    },
    {
      id: "opt-obj-select-route",
      text: "Choose, unprompted, between the calculus route and an algebraic certificate, and justify the choice",
      evidence: "lesson-owned",
      evidenceLevel: "E3",
      itemIds: ["opt-select-route"],
    },
    {
      id: "opt-obj-derive-steps",
      text: "Identify the escape-route argument's load-bearing steps and what each hypothesis does, on a fresh sloped point",
      evidence: "lesson-owned",
      evidenceLevel: "E3",
      itemIds: ["opt-derive-steps"],
    },
    {
      id: "opt-obj-retain",
      text: "Retain \"necessary is not sufficient\" under delayed retrieval",
      evidence: "module-owned",
      evidenceLevel: "E3",
    },
    {
      id: "opt-obj-mixed-composite",
      text: "Optimize a composite on an interval, requiring the chain rule to differentiate and this method to decide",
      evidence: "module-owned",
      evidenceLevel: "E5",
    },
  ],
  motivatingQuestion:
    "Find the largest value of $f$ on $[a,b]$. You cannot check every point — there are uncountably many. What, exactly, lets you stop checking?",

  guidedSceneId: "optimization-approximation",
  explorationId: "optimization-approximation",

  route: [
    { kind: "motivate" },
    { kind: "watch" },
    { kind: "section", sectionId: "the-escape-route" },
    { kind: "formal", formalId: "def-extremum" },
    { kind: "formal", formalId: "thm-fermat" },
    { kind: "proof", formalId: "thm-fermat" },
    { kind: "callout", calloutId: "flat-means-summit" },
    { kind: "check", checkpointId: "predict-endpoint" },
    { kind: "section", sectionId: "two-hypotheses-and-a-converse" },
    { kind: "worked", workedId: "main-case" },
    { kind: "formal", formalId: "thm-evt" },
    { kind: "callout", calloutId: "always-a-maximum" },
    { kind: "explore" },
    { kind: "section", sectionId: "the-silent-model" },
    { kind: "formal", formalId: "thm-second-derivative" },
    { kind: "worked", workedId: "second-derivative-derivation" },
    { kind: "section", sectionId: "how-far-to-trust" },
    { kind: "worked", workedId: "decay-linearization" },
    { kind: "practice" },
    { kind: "summary" },
  ],

  sections: [
    {
      id: "the-escape-route",
      title: "A slope is a way out",
      body: "Lesson 2 gave every differentiable function a local-linear model: $f(a+h) = f(a) + f'(a)h + E(h)$, with $E(h)/h \\to 0$. That is not just a description — it is an instruction. If $f'(a) \\neq 0$, then once $h$ is small enough the linear term $f'(a)h$ DOMINATES the error $E(h)$, so the sign of $f(a+h)-f(a)$ is the sign of $f'(a)h$. You control the sign of $h$. Stepping one way strictly increases $f$; stepping the other way strictly decreases it. Either way, $a$ was not the best point.\n\nRun that everywhere on a domain, and it does not find the best point — it ELIMINATES every point where it can be run. What is left over is a candidate set, not an answer.",
      equation: "f(a+h) - f(a) = f'(a)h + E(h), \\qquad |E(h)| < |f'(a)h| \\ \\text{ for small enough } h",
      observation: "This is L2's own model, doing work: nothing new is assumed beyond E(h)/h → 0.",
    },
    {
      id: "two-hypotheses-and-a-converse",
      title: "The three warnings, and what they actually are",
      body: "The refutation above needs exactly two things: $a$ must be INTERIOR to the domain, so both $a+h$ and $a-h$ stay in it for small $h$ — at an endpoint, only one direction is available, and the refutation runs half. And $f$ must be DIFFERENTIABLE at $a$, so the local model exists at all — where it does not (a corner), nothing here can be run, and the point stands unrefuted by default.\n\nThose are the argument's two hypotheses. There is a third fact, and it is not a hypothesis: the argument only ever REFUTES. $f'(a) = 0$ survives — it is what is left when elimination has nowhere left to run — but survival is not victory. A survivor can still fail to be an extremum, which is the failure of the CONVERSE, not a missing assumption.",
      observation: "Interior + differentiable are the argument's hypotheses. \"A survivor need not win\" is a logical fact about the converse, not a third condition to check.",
    },
    {
      id: "the-silent-model",
      title: "When the local model has nothing left to say",
      body: "At a survivor, $f'(a) = 0$, so the local model collapses to a constant: $h \\mapsto f(a)$. It has no opinion about whether $a$ is a max, a min, or neither — the information that would decide it lives in the term the linear model discards entirely. That is not a gap in the method; it is the exact reason a next rung exists at all.",
      observation: "The second-derivative test is not a separate rule bolted on afterward — it answers the question the linear model was structurally unable to ask.",
    },
    {
      id: "how-far-to-trust",
      title: "\"Approximately\" is not yet a number",
      body: "$E(h)/h \\to 0$ is a statement about a limit — it says nothing about the particular $h$ you actually use. To say a linearization is accurate to within some stated tolerance needs a bound on curvature, not just its existence. That is the same upgrade Lesson 1 made from a local continuity guarantee to a modulus: a QUANTITATIVE control where before there was only a qualitative one.",
      observation: "The identity that proves the second-derivative test also bounds the linearization error — one piece of machinery, two jobs.",
    },
  ],

  formalBlocks: [
    {
      id: "def-extremum",
      kind: "definition",
      label: "Local and global extrema",
      statement:
        "$a$ is a **local maximum** of $f$ on a domain $D$ if some window $W$ around $a$ has $f(x) \\le f(a)$ for every $x \\in D \\cap W$ — local minimum symmetric. A **global** extremum is a local one that wins the comparison over the whole domain.",
      interpretation:
        "Every extremum this lesson finds is local first; \"global\" is a separate, later comparison over the whole candidate set — never assumed for free.",
      visibility: "visible",
    },
    {
      id: "thm-fermat",
      kind: "theorem",
      label: "Fermat's condition",
      statement:
        "If $a$ is an interior local extremum of $f$ and $f'(a)$ exists, then $f'(a) = 0$.",
      interpretation:
        "Necessary, not sufficient — the escape-route argument only ever refutes. \"Interior\" and \"$f'(a)$ exists\" are both doing real work: each has a counterexample when it is dropped.",
      visibility: "visible",
      proof:
        "Let $m = f'(a) \\neq 0$. Because $E(h)/h \\to 0$, there is $\\delta > 0$ with $|E(h)| \\le \\tfrac{|m||h|}{2}$ for every $0 < |h| < \\delta$. Then $f(a+h) - f(a) = mh + E(h)$ has the sign of $mh$, in magnitude at least $|mh|/2$.\n\nSince $a$ is interior, both $a+h$ and $a-h$ lie in the domain for small $h > 0$. Choose the sign of $h$ making $mh > 0$: $f$ strictly increases, so $a$ is not a local maximum. Choose the other sign: $f$ strictly decreases, so $a$ is not a local minimum. Both possibilities are refuted, so if $a$ really is a local extremum, $m$ cannot be nonzero — $f'(a) = 0$.",
    },
    {
      id: "thm-evt",
      kind: "theorem",
      label: "The Extreme Value Theorem",
      statement:
        "A continuous function on a closed, bounded interval attains a maximum and a minimum.",
      interpretation:
        "Cited, not proved — the argument needs completeness/compactness, which this course does not build (the same register Lesson 1's modulus and Lesson 4's uniform continuity are named in). This is the EXISTENCE half of the method: without it, a finite candidate set says where an extremum WOULD be, not that one exists.",
      visibility: "visible",
    },
    {
      id: "thm-second-derivative",
      kind: "theorem",
      label: "The second-derivative test",
      statement:
        "Suppose $f'(a) = 0$ and $f''$ is continuous near $a$. If $f''(a) > 0$, $a$ is a strict local minimum; if $f''(a) < 0$, a strict local maximum. If $f''(a) = 0$, the test decides nothing.",
      interpretation:
        "A genuine SUFFICIENT condition, derived (not cited) from the Fundamental Theorem applied twice — see the derivation below. Its silence when $f''(a) = 0$ is not a negative result; it is the same structure one rung up: a failed sufficient condition is not a refutation.",
      visibility: "visible",
    },
  ],

  workedExamples: [
    {
      id: "main-case",
      title: "The full method, on one function",
      exampleId: "opt-main-cubic",
      prompt:
        "$f(x) = x^3 - 3x$ on $[-2, 3]$. Every point outside the candidate set has already been refuted by the escape-route argument above.",
      equations: [
        "f'(x) = 3x^2 - 3 = 0 \\ \\Rightarrow\\ x = \\pm1 \\quad \\text{(stationary points, interior)}",
        "\\text{no points where } f' \\text{ is undefined — no singular points}",
        "\\text{candidate set} = \\{-2,\\ -1,\\ 1,\\ 3\\} \\quad \\text{(two stationary, two endpoints)}",
        "f(-2) = -2, \\quad f(-1) = 2, \\quad f(1) = -2, \\quad f(3) = 18",
        "\\text{by the Extreme Value Theorem, the max and min are attained — and both are in this list}",
        "\\text{global max} = 18 \\text{ at } x=3 \\ \\text{(the ENDPOINT — not the interior local max } f(-1)=2\\text{)}",
        "\\text{global min} = -2, \\text{ attained TWICE: at } x=1 \\text{ and at } x=-2",
      ],
      equationsAriaLabel: "Building and deciding the candidate set for x cubed minus 3x on the interval from -2 to 3",
      layers: [
        {
          kind: "why",
          title: "A certificate, with no calculus at all",
          body: "$f(x) + 2 = x^3 - 3x + 2 = (x-1)^2(x+2)$, which is $\\ge 0$ for every $x \\ge -2$ — so $f(x) \\ge -2$ on the whole interval, with equality exactly at $x=1$ and $x=-2$. This CONFIRMS the minimum by certifying it algebraically — something the one-point first-derivative condition alone cannot do, since it only ever refutes.",
        },
      ],
    },
    {
      id: "second-derivative-derivation",
      title: "Deriving the next rung from the Fundamental Theorem",
      prompt:
        "Assume $f''$ is continuous near $a$ and $f'(a) = 0$. Apply the Fundamental Theorem twice.",
      equations: [
        "f(a+h) - f(a) - f'(a)h = \\int_a^{a+h}\\bigl(f'(t) - f'(a)\\bigr)\\,dt = \\int_a^{a+h}\\!\\int_a^{t} f''(s)\\,ds\\,dt",
        "\\text{if } f''(a) > 0, \\text{ continuity gives } f'' \\ge c > 0 \\text{ on a window around } a",
        "\\text{the inner integral then has the sign of } (t-a), \\text{ magnitude} \\ge c|t-a|",
        "\\text{the outer integral is} \\ge \\tfrac{c}{2}h^2 > 0 \\ \\text{for BOTH signs of } h",
        "\\Rightarrow\\ f(a+h) > f(a) \\ \\text{— a strict local minimum. (}f''(a)<0\\text{ is symmetric.)}",
        "\\text{if } |f''| \\le M \\text{ near } a,\\ \\bigl|f(a+h)-f(a)-f'(a)h\\bigr| \\le \\tfrac{M}{2}h^2 \\ \\text{— the SAME identity is the error bound}",
      ],
      equationsAriaLabel: "Deriving the second-derivative test and the linearization error bound from the Fundamental Theorem",
    },
    {
      id: "decay-linearization",
      title: "How far can a linearization be trusted?",
      exampleId: "opt-decay",
      prompt: `$f(t) = e^{-t/1.5}$, linearized at $a = 0$: $f(0)=1$, $f'(0)=-2/3$.`,
      equations: [
        "L(h) = 1 - \\tfrac{2}{3}h",
        "f''(t) = \\tfrac{1}{1.5^2}e^{-t/1.5}, \\quad \\text{decreasing for } t \\ge 0, \\text{ so } M = f''(0) = \\tfrac{4}{9} \\text{ bounds it on } [0,h]",
        `|f(h) - L(h)| \\le \\tfrac{M}{2}h^2, \\quad |h| \\le \\sqrt{2\\varepsilon/M}`,
        `\\varepsilon = 0.01 \\ \\Rightarrow\\ |h| \\le \\sqrt{2(0.01)/(4/9)} \\approx ${trustRadius(OPT_DECAY, 0, 0.01).toFixed(4)}`,
      ],
      equationsAriaLabel: "Sizing a trust radius for the exponential decay fixture's linearization",
    },
  ],

  callouts: [
    {
      id: "flat-means-summit",
      title: "\"Flat ground means you're at the top\"",
      moves: [
        {
          label: "Belief",
          body: "On a real hill, if the ground under your feet is flat, you have reached the summit — flat means arrived.",
        },
        {
          label: "Confront",
          body: "$f(x) = x^3$ at $a = 0$: $f'(0) = 0$, the local model is flat. But every window around $0$ contains points where $f > 0$ AND points where $f < 0$. Flat here is a ledge on a slope, not a summit.",
        },
        {
          label: "Repair",
          body: "The escape-route argument only ever refutes; a survivor of it has passed no test that would certify it. \"Flat\" means only that this one-point condition found nothing to eliminate — deciding what survived is a separate, further argument (the second-derivative test, later in this lesson).",
        },
      ],
    },
    {
      id: "always-a-maximum",
      title: "\"There's always a maximum somewhere\"",
      moves: [
        {
          body: "$f(x) = x$ on the OPEN interval $(0,1)$ has no stationary point, no singular point, and no eligible endpoint — its candidate set is empty, and the Extreme Value Theorem's hypothesis (closed, bounded) fails. The method's honest output is that there is no conclusion, not a wrong answer. As $x \\to 1$, $f(x)$ gets arbitrarily close to $1$ without ever reaching it — there is no largest value to find.",
        },
      ],
    },
  ],

  checkpoint: {
    prompt:
      "$f(x) = x^3 - 3x$ on $[-2,3]$ has an interior local maximum at $x=-1$. Before computing anything: where is the largest value of $f$ on this interval, and what would you have to compare to be sure?",
    answer:
      "$f(-1)=2$, but $f(3)=18$ — the global maximum sits at the ENDPOINT, not the interior local maximum. An interior local maximum is a purely local claim; deciding the global one needs comparing every member of the whole candidate set, which is what the Extreme Value Theorem licenses.",
  },
  checkpoints: [
    {
      id: "predict-endpoint",
      prompt:
        "$f(x) = x^3 - 3x$ on $[-2,3]$ has an interior local maximum at $x=-1$. Before computing anything: where is the largest value of $f$ on this interval, and what would you have to compare to be sure?",
      answer:
        "$f(-1)=2$, but $f(3)=18$ — the global maximum sits at the ENDPOINT, not the interior local maximum. An interior local maximum is a purely local claim; deciding the global one needs comparing every member of the whole candidate set, which is what the Extreme Value Theorem licenses.",
    },
  ],

  exercises: [
    /* ---- drill ------------------------------------------------------------ */
    {
      id: "opt-candidate-set",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt: `Let $h(x) = x^4 - 4x^2 + 2$ on $[${CAND_DOMAIN[0]}, ${CAND_DOMAIN[1]}]$.`,
      config: {
        steps: [
          {
            kind: "numeric",
            prompt: "How many points are in the complete candidate set?",
            expected: CAND_COUNT,
            tolerance: 0,
            explanation: `$h'(x) = 4x^3 - 8x = 4x(x^2-2)$ has three interior zeros ($x=0,\\pm\\sqrt2$), plus both endpoints: ${CAND_COUNT} candidates total.`,
          },
          {
            kind: "multiple-choice",
            prompt: `The endpoint $x = ${CAND_DOMAIN[0]}$ is in the candidate set even though it is not stationary. Why?`,
            choices: [
              "It is an endpoint of the domain — one of the two hypotheses this method's argument needs is unavailable there",
              "h'(-3) happens to equal 0, so it is secretly stationary too",
              "It is where h is largest, and large values are always candidates",
              "Endpoints are only included when the interior has no stationary points",
            ],
            correctChoice: 0,
            explanation: "An endpoint is a candidate because only ONE direction is available there — the escape-route argument cannot run its full refutation, regardless of the derivative's value. It is not because h'(-3) = 0 (it does not).",
          },
          {
            kind: "numeric",
            prompt: "What is h's largest value on this interval?",
            expected: CAND_MAX,
            tolerance: 1e-6,
            explanation: `$h(-3) = ${CAND_MAX}$, larger than every stationary value ($h(0)=2$, $h(\\pm\\sqrt2)=-2$) — the maximum sits at the endpoint the sweep's refutation could never rule out.`,
          },
        ],
      },
    },
    {
      id: "opt-flat-not-extremum",
      type: "multiple-choice",
      tier: "drill",
      prompt: "At a point $a$, $f'(a) = 0$. What follows about $a$?",
      choices: [
        "Nothing about whether $a$ is an extremum — only that this one-point test found nothing to refute",
        "$a$ must be a local maximum or a local minimum",
        "$a$ is definitely not an extremum",
        "$f$ is continuous at $a$",
      ],
      correctChoice: 0,
      explanation:
        "The escape-route argument only ever refutes; $f'(a)=0$ is what is left when it has nowhere to run, not a certificate. Option 4 is TRUE — a differentiable function is continuous — but it is not what follows from THIS fact, and continuity was never in question.",
    },
    {
      id: "opt-second-test-silent",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt: "Three related questions about the second-derivative test.",
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt: "For $u(x) = x^2 - 6x + 5$, $u'(3) = 0$ and $u''(3) = 2$. Classify $x=3$.",
            choices: ["Local minimum", "Local maximum", "Silent — the test gives no verdict", "Cannot be determined without more information"],
            correctChoice: 0,
            explanation: "u''(3) = 2 > 0, so the test's sufficient condition applies directly: x = 3 is a strict local minimum.",
          },
          {
            kind: "multiple-choice",
            prompt: "For $s(x) = (x-2)^4 + 1$, $s'(2) = 0$ and $s''(2) = 0$. What does the second-derivative test say about $x=2$?",
            choices: ["Silent — the test's hypothesis (f''(a) ≠ 0) fails, so it decides nothing", "Local minimum, since even powers always produce minima", "Local maximum", "The test proves x=2 is not an extremum"],
            correctChoice: 0,
            explanation: "f''(2) = 0 fails the test's own hypothesis. (In fact x=2 IS a local — and global — minimum here, but the second-derivative test is not what shows it; a failed sufficient condition is not a refutation either.)",
          },
          {
            kind: "multiple-choice",
            prompt: "Which pair of functions shows that the test's silence at $f''(a)=0$ can cover genuinely different truths?",
            choices: [
              "$x^6$ (a true minimum at 0) and $-x^6$ (a true maximum at 0) — both silent, opposite verdicts",
              "$x^2$ and $-x^2$ — neither is silent, so this pair proves nothing about the silent case",
              "$x^3$ and $x^4$ — both silent, and both happen to be minima",
              "Any two functions with $f''(a)=0$ must behave identically near $a$",
            ],
            correctChoice: 0,
            explanation: "x^6 and −x^6 both have zero second derivative at 0, yet one is a genuine minimum and the other a genuine maximum — silence is not a shared verdict, it is the absence of one. (x^3 is neither a min nor a max, so the third option is doubly wrong.)",
          },
        ],
      },
    },
    {
      id: "opt-linearize-tolerance",
      type: "numeric",
      tier: "drill",
      prompt: `Near a point where $|f''| \\le ${TOLERANCE_M}$ throughout a neighborhood, how large can $|h|$ be so the linearization error stays below ${TOLERANCE_EPS}?`,
      expected: TOLERANCE_ANSWER,
      tolerance: 1e-4,
      explanation: `The bound is $|f(a+h)-L(h)| \\le \\tfrac{M}{2}h^2$. Solving $\\tfrac{${TOLERANCE_M}}{2}h^2 = ${TOLERANCE_EPS}$ gives $|h| \\le \\sqrt{2(${TOLERANCE_EPS})/${TOLERANCE_M}} \\approx ${TOLERANCE_ANSWER.toFixed(5)}$.`,
    },
    {
      id: "opt-open-interval",
      type: "multiple-choice",
      tier: "drill",
      prompt:
        "A continuous function is optimized over the OPEN interval $(0,1)$, with no stationary points and no eligible endpoints. What does the method correctly return?",
      choices: [
        "No conclusion: no existence guarantee, and an empty candidate set — a correct output, not a failure",
        "The method has failed here and must be discarded",
        "The supremum of the function, treated as if it were attained",
        "Check the midpoint of the interval instead",
      ],
      correctChoice: 0,
      explanation:
        "An open interval fails the Extreme Value Theorem's closed-and-bounded hypothesis, and an empty candidate set means the location step found nothing to propose. \"No conclusion\" is the honest, correct output — not evidence the method broke.",
    },

    /* ---- transfer ----------------------------------------------------- */
    {
      id: "opt-endpoint-fresh",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt: `Let $k(x) = 2x^3 - 3x^2 - 12x + 5$ on $[${ENDPOINT_DOMAIN[0]}, ${ENDPOINT_DOMAIN[1]}]$. It has an interior local maximum at $x=-1$, where $k(-1) = ${ENDPOINT_LOCAL_MAX}$.`,
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt: "Before computing the candidate set fully, where must you check to find the GLOBAL maximum?",
            choices: [
              "Every member of the candidate set — stationary points AND both endpoints, not just the interior local max",
              "Only the interior local maximum, since it is the only stationary point that classifies as a max",
              "Only the endpoints, since interior points never win on a wide interval",
              "Wherever k' is largest in magnitude",
            ],
            correctChoice: 0,
            explanation: "The Extreme Value Theorem's guarantee is over the WHOLE candidate set — the global maximum could be the interior local max, or it could be at an endpoint. Only comparing all of them decides it.",
          },
          {
            kind: "numeric",
            prompt: "What is k's actual global maximum value on this interval?",
            expected: ENDPOINT_GLOBAL_MAX,
            tolerance: 1e-6,
            explanation: `$k(4) = ${ENDPOINT_GLOBAL_MAX}$, which exceeds the interior local maximum $k(-1) = ${ENDPOINT_LOCAL_MAX}$ — the global maximum sits at the endpoint the interior stationary point never competed with.`,
          },
        ],
      },
    },
    {
      id: "opt-which-hypothesis",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt: `Let $n(x) = |x-1| + (x-1)^2$ on $[-1, 3]$. The escape-route refutation never examines $x=1$.`,
      config: {
        steps: [
          {
            kind: "numeric",
            prompt: "What is n's actual minimum value on this interval?",
            expected: HYP_MIN,
            tolerance: 1e-6,
            explanation: `Both $|x-1|$ and $(x-1)^2$ are minimized (at $0$) exactly at $x=1$, and both are $\\ge0$ everywhere, so $n(1)=0$ is the global minimum.`,
          },
          {
            kind: "multiple-choice",
            prompt: "Which hypothesis of the refutation argument fails at $x=1$?",
            choices: [
              "n is not differentiable there — no local model exists to argue with",
              "x=1 is not interior to the domain",
              "The Extreme Value Theorem does not apply on this domain",
              "n is not continuous at x=1",
            ],
            correctChoice: 0,
            explanation: "x=1 IS interior, and n IS continuous there (the absolute-value term has a corner, not a jump) — the domain is closed and bounded, so EVT applies fine. What fails is differentiability: |x-1| has no single slope at x=1, so the escape-route argument has no local model to run at all, and the point stands unrefuted.",
          },
        ],
      },
    },
    {
      id: "opt-select-route",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt: `Let $q(x) = x^2 - 8x + 20$ on $[0, 10]$. Find its minimum.`,
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt: "Which route is more efficient here?",
            choices: [
              "Complete the square: $q(x) = (x-4)^2 + 4 \\ge 4$ directly, with equality at $x=4$",
              "Differentiate, build the full candidate set, and compare all the values",
              "Both routes take about the same effort",
              "Neither route determines the minimum",
            ],
            correctChoice: 0,
            explanation: "q is exactly a perfect square plus a constant — completing the square reads off the minimum in one line, with no derivative or candidate-set machinery needed at all.",
          },
          {
            kind: "multiple-choice",
            prompt: "Why does completing the square work here but not for every function?",
            choices: [
              "q happens to BE a sum of a square and a constant — most functions have no such closed form available",
              "q is continuous everywhere",
              "q is defined on a closed interval",
              "q has a positive leading coefficient",
            ],
            correctChoice: 0,
            explanation: "The certificate is available because of q's specific algebraic SHAPE, not because of continuity, domain type, or the sign of a coefficient (all true here, but none is why the trick works) — a cubic or a transcendental function will not offer this shortcut in general.",
          },
          {
            kind: "numeric",
            prompt: "What is q's minimum value?",
            expected: SELECT_MIN,
            tolerance: 1e-6,
            explanation: `$q(4) = ${SELECT_MIN}$, matching both routes.`,
          },
        ],
      },
    },
    {
      id: "opt-derive-steps",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt: `Let $g(x) = x^2 - 4x + 1$ at $a = ${STEPS_A}$, so $g(a+h) - g(a) = ${STEPS_M}h + E(h)$ with $E(h) = h^2$.`,
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt: `Which property of g licenses treating $E(h) = h^2$ as smaller than $|${STEPS_M}h|$ for small enough $h$?`,
            choices: [
              "g is differentiable at a — that is exactly what E(h)/h → 0 means",
              "g is continuous at a",
              "g is bounded on some interval around a",
              "g is a polynomial, so no bound is needed",
            ],
            correctChoice: 0,
            explanation: "Differentiability (E(h)/h → 0) is precisely the statement that makes |E(h)| eventually beaten by |mh|. Continuity is real but weaker — it only gives g(a+h) → g(a), not the needed rate.",
          },
          {
            kind: "multiple-choice",
            prompt: `Stepping only with $h > 0$, which single claim about $a=${STEPS_A}$ does that alone refute?`,
            choices: [
              "That a is a local MINIMUM",
              "That a is a local MAXIMUM",
              "Both that a is a local minimum and a local maximum",
              "Nothing — a single direction never refutes anything",
            ],
            correctChoice: 0,
            explanation: `m = ${STEPS_M} < 0, so h>0 makes g DECREASE: g(a+h) < g(a). A point that can be beaten by decreasing is not a local minimum — but this alone says nothing about whether it could still be a local maximum.`,
          },
          {
            kind: "multiple-choice",
            prompt: "What property of $a=0$ is what makes $h<0$ ALSO available, completing the refutation of the other claim?",
            choices: [
              "a is interior to the domain, so a negative step stays in the domain too",
              "g is differentiable at a — the same property as step 1",
              "g is continuous at a",
              "g'(a) is negative",
            ],
            correctChoice: 0,
            explanation: "Interiority — not differentiability again — is what supplies the SECOND sign of h. At an endpoint, only one direction would be available, and only one of the two claims (max, min) could ever be refuted.",
          },
          {
            kind: "numeric",
            prompt: `Take the step that actually improves g from $a=${STEPS_A}$ ($h=${STEPS_H}$). What is $g(${STEPS_A}+${STEPS_H})$?`,
            expected: STEPS_VALUE,
            tolerance: 1e-6,
            explanation: `$g(${STEPS_A + STEPS_H}) = ${STEPS_VALUE}$, greater than $g(${STEPS_A})=1$ — the direction the escape-route argument predicted.`,
          },
        ],
      },
    },

    /* ---- practice event, NOT evidence (see mastery-contract.md §1d) ---- */
    {
      id: "opt-derive-escape",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt: `Let $r(x) = x^2 + 2x - 3$ on $[${ESCAPE_DOMAIN[0]}, ${ESCAPE_DOMAIN[1]}]$, at $a = ${ESCAPE_A}$. Reproduce the escape-route argument in full: state the residual bound, choose a step that improves $r$, run the argument for BOTH signs of $h$, and say explicitly which of the two hypotheses (interior, differentiable) each half of the argument used.`,
      config: {
        modelAnswer: `$r'(${ESCAPE_A}) = ${ESCAPE_M}$, so $m=${ESCAPE_M} \\neq 0$. By differentiability, $r(${ESCAPE_A}+h) - r(${ESCAPE_A}) = ${ESCAPE_M}h + E(h)$ with $E(h)=h^2$ — exact here, since $r$ is a quadratic and the residual has no higher-order terms to bound away. $E(h)/h = h \\to 0$ as $h\\to0$: this is what licenses treating $E(h)$ as smaller than $|${ESCAPE_M}h|$ once $|h|$ is small enough. Concretely: $h^2 < ${ESCAPE_M}|h|$ for every $h\\neq0$ with $|h|<${ESCAPE_THRESHOLD}$ (divide both sides by $|h|$), so any step inside that radius has a change whose sign matches $\\operatorname{sign}(${ESCAPE_M}h)$. Since $m>0$, choosing $h=${ESCAPE_H}>0$ increases $r$: $r(${ESCAPE_A}+${ESCAPE_H}) = ${ESCAPE_VALUE.toFixed(2)} > r(${ESCAPE_A})=0$ — this refutes "$a=${ESCAPE_A}$ is a local maximum". Because $a=${ESCAPE_A}$ is INTERIOR to the declared domain $[${ESCAPE_DOMAIN[0]}, ${ESCAPE_DOMAIN[1]}]$ (both $${ESCAPE_A} - ${ESCAPE_H}$ and $${ESCAPE_A} + ${ESCAPE_H}$ lie inside it), $h=-${ESCAPE_H}$ is also available: $r(${ESCAPE_A}-${ESCAPE_H}) = ${ESCAPE_VALUE_NEG.toFixed(2)} < r(${ESCAPE_A})=0$, refuting "$a=${ESCAPE_A}$ is a local minimum". Differentiability supplied the residual control that makes each individual step's sign trustworthy; interiority supplied the SECOND sign of $h$, without which only one of the two refutations could have been completed. Both possibilities for a local extremum are now refuted, so $a=${ESCAPE_A}$ is not a local extremum — that conclusion is licensed here only because BOTH signs were actually run; stating it without running both is the shortcut this item is designed to catch.`,
        rubricId: "opt-derive-escape",
        rubricVersion: 2,
        rubricText: `PASS requires: (a) the residual identity $r(a+h)-r(a)=mh+E(h)$ stated with $E(h)/h\\to0$ named as differentiability, not merely asserted; (b) BOTH signs of $h$ actually run, each with its own sign conclusion (not just one direction generalized), inside a domain the response itself states (interiority is not verifiable without a stated domain); (c) each half of the argument explicitly tied to the hypothesis it uses — differentiability for the residual bound, interiority for the availability of the second sign; (d) the two individual refutations (not a local max; not a local min) stated explicitly BEFORE any combined conclusion. A response may then correctly conclude "therefore $a$ is not a local extremum" — refuting both disjuncts of "local max or local min" really does establish that conjunction's negation — but ONLY as the conclusion of running both signs, never as a shortcut asserted from $f'(a)\\neq0$ alone with no residual argument shown. A response that states only "the derivative is 4 so it's not an extremum" with no residual argument, or that runs only one sign of h and still claims the full conclusion, is NOT a pass — reproducing the ARGUMENT is the point, not citing its conclusion.`,
      },
    },
  ],

  keyTakeaway:
    "A nonzero slope rules a point out. A zero slope rules nothing in — what survives still has to be decided, which is what the second derivative and the comparison are for.",

  structuredSummary: {
    coreMentalModel:
      "At an interior differentiable point, $f'(a) \\neq 0$ refutes an extremum; $f'(a)=0$ only survives that one-point test.",
    definitionsIntroduced: [
      "Local vs. global extremum",
      "Stationary point, singular point, critical point",
      "Candidate set",
      "Linearization",
    ],
    mainResult:
      "The method reduces an infinite search to the candidate set (stationary + singular points, plus eligible endpoints), then decides among them by comparison, licensed by the Extreme Value Theorem.",
    representationsConnected: [
      "The sweep, refuting points and leaving a candidate set",
      "The escape-route inequality, with its certified radius",
      "The second-derivative test, derived from the Fundamental Theorem",
      "The linearization error band",
    ],
    commonMistake:
      "Treating $f'(a)=0$ as detecting an extremum, rather than as merely surviving a test that only ever refutes.",
    canonicalExample: "$x^3-3x$ on $[-2,3]$: global max 18 at the endpoint $x=3$, not the interior local max $f(-1)=2$.",
    oneProblemWorthRemembering: "$x^3$ at $0$: $f'(0)=0$, and it is neither a maximum nor a minimum.",
    whatThisUnlocksNext:
      "$\\tfrac12f''(a)$ is literally the next Taylor coefficient (Lesson 11); the same refutation argument, run with every direction available, is the multivariable statement (saddle points included).",
  },

  // No single `exampleId`: the guided scene and explorer share the main
  // fixture `opt-main-cubic`, but the exercises deliberately use a distinct
  // fresh function each — the freshness rule the mastery contract requires
  // (mastery-contract.md §1d) — so there is no single id that would cover
  // both the taught example and the evidence surface, matching chain-rule's
  // precedent of omitting the field rather than inventing one nothing would
  // resolve.
};
