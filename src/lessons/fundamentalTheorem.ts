import type { LessonDefinition } from "./types";
import { EXERCISE_SEQUENCE_ID } from "./capabilities";
import { EX_GAUSSIAN, EX_PARABOLA, riemannSum } from "../math";

/**
 * Lesson: "The Fundamental Theorem of Calculus" — applied mathematics L4, unit
 * `calculus-foundations`, Package A slice A4. **Flagship of Package A**, and its
 * closing lesson.
 *
 * Built on the PASS contract
 * `docs/courses/applied-mathematics/lessons/04-fundamental-theorem/insight.md`.
 *
 * Primary insight: differentiating and accumulating are inverse processes, and
 * the reason the infinite sum collapses is telescoping — write the total change
 * as a sum of small changes over each piece (an identity with no calculus in
 * it), and every interior evaluation appears once positively and once
 * negatively and cancels. Put calculus in exactly one place — L2's local
 * linear model for each small change — and the total change **is** the
 * integral.
 *
 * **Two clips, on purpose.** Clip 1 (`ftc-accumulate-then-measure`) accumulates
 * and then measures: it closes L3's loose end by showing `A' = f`. Clip 2
 * (`ftc-telescoping`, placed) measures and then accumulates: it is the
 * telescoping mechanism, placed immediately after the identity is stated
 * formally.
 *
 * Evidence discipline, applied before any code was written (the same
 * preflight A2 and A3 applied): `multiple-choice` is capped at **E2** and
 * `exercise-sequence` at **E3**; this lesson builds no `construct-in-explorer`
 * item, so **no claim exceeds E3** — see the mastery contract's evidence-
 * ceiling reconciliation for the four claims that were downgraded from an
 * aspirational E4.
 */

/* ---------------------------------------------------------------- numbers */

/** `ftc-evaluate-fresh`: a fresh integrand, never shown in either clip. */
const FRESH_F = (x: number) => 3 * x * x + 2;
const FRESH_ANTIDERIVATIVE = (x: number) => x * x * x + 2 * x;
const FRESH_A = 1;
const FRESH_B = 3;
const FRESH_FPRIME_AT_A = FRESH_F(FRESH_A);
const FRESH_INTEGRAL = FRESH_ANTIDERIVATIVE(FRESH_B) - FRESH_ANTIDERIVATIVE(FRESH_A);

/** `ftc-differentiate-integral`: a fresh rate, integrated from 0. */
const RATE_G = (t: number) => 2 * t + 1;
const DIFFERENTIATE_AT = 3;
const DIFFERENTIATE_EXPECTED = RATE_G(DIFFERENTIATE_AT);

/** `ftc-telescope-transfer`: the calculus-free telescoping sum. */
const TRANSFER_N = 10;
const TRANSFER_SUM = 1 - 1 / (TRANSFER_N + 1);

/** `ftc-corroborate`: L3's own case, computed by both independent routes. */
const CORROBORATE_SUM = riemannSum(EX_PARABOLA.f, 0, 2, 20000, "mid");
const CORROBORATE_BRACKET =
  EX_PARABOLA.antiderivative!(2) - EX_PARABOLA.antiderivative!(0);

/** Sanity: the prose's numbers are the code's numbers. */
if (Math.abs(FRESH_FPRIME_AT_A - 5) > 1e-9) {
  throw new Error("fundamentalTheorem: FRESH_F(1) should be 5.");
}
if (Math.abs(FRESH_INTEGRAL - 30) > 1e-9) {
  throw new Error("fundamentalTheorem: the fresh integral should evaluate to 30.");
}
if (Math.abs(DIFFERENTIATE_EXPECTED - 7) > 1e-9) {
  throw new Error("fundamentalTheorem: A'(3) should be 7.");
}
if (Math.abs(CORROBORATE_SUM - CORROBORATE_BRACKET) > 1e-3) {
  throw new Error(
    "fundamentalTheorem: the two independent routes to 8/3 disagree.",
  );
}
if (EX_GAUSSIAN.antiderivative !== undefined) {
  throw new Error(
    "fundamentalTheorem: EX_GAUSSIAN must declare no antiderivative, or not-a-recipe is false.",
  );
}

export const fundamentalTheoremLesson: LessonDefinition = {
  id: "fundamental-theorem",
  title: "The Fundamental Theorem of Calculus",
  subtitle: "Everything in the middle cancels; only the two ends survive",
  learningObjectives: [
    "Evaluate a fresh definite integral via an antiderivative, verifying the antiderivative by differentiating it",
    "Differentiate an integral with a variable upper limit",
    "Carry out the telescoping cancellation on an unequal partition and state how many survive",
    "Explain, without notation, why unboundedly many contributions collapse to two evaluations",
    "Say what changes if F is replaced by F+C, and if the lower limit of the running total moves",
    "State what the theorem does not promise, with a counterexample",
    "Recognise the telescoping mechanism in an unfamiliar, calculus-free setting",
  ],
  motivatingQuestion:
    "An integral is a limit of sums with no end to the number of terms. The odometer in the car produced the same answer without adding up anything at all. What did it know that we don't?",

  guidedSceneId: "ftc-accumulate-then-measure",
  explorationId: "fundamental-theorem",

  route: [
    { kind: "motivate" },
    { kind: "visual", heading: "The loose end, answered" },
    { kind: "section", sectionId: "loose-end-explained" },
    { kind: "formal", formalId: "thm-ftc-part1" },
    { kind: "section", sectionId: "telescoping-setup" },
    { kind: "formal", formalId: "identity-telescoping" },
    // The second clip is placed here, immediately after the telescoping
    // identity is stated formally — the identity it makes visible.
    {
      kind: "visual",
      sceneId: "ftc-telescoping",
      heading: "Everything in the middle cancels",
    },
    { kind: "formal", formalId: "def-antiderivative" },
    { kind: "formal", formalId: "thm-ftc-part2" },
    { kind: "section", sectionId: "calculus-once" },
    { kind: "section", sectionId: "not-a-recipe" },
    { kind: "check", checkpointId: "falsify-ftc" },
    { kind: "explore", tocLabel: "Check the sum against the bracket" },
    { kind: "practice" },
    { kind: "summary" },
  ],

  sections: [
    {
      id: "loose-end-explained",
      title: "Why the total climbed fastest where the rate was highest",
      body: "Lesson 3 ended on an observation it refused to explain: the running total $A(x) = \\int_a^x f$ rises fastest exactly where $f$ is highest, is flat where $f$ is zero, and falls where $f$ is negative. Advance the right end by a small step $h$ and $A$ gains one thin sliver, $A(x+h) - A(x)$. That sliver is trapped: on the step, $f$ never exceeds its largest value there or falls below its smallest, so the sliver sits between $m_h h$ and $M_h h$, where $m_h$ and $M_h$ are the smallest and largest values $f$ takes on $[x, x+h]$.\n\nShrink $h$. Continuity — Lesson 1's result, spent again here — forces $m_h$ and $M_h$ both onto $f(x)$, so the ratio $\\frac{A(x+h)-A(x)}{h}$ is squeezed onto $f(x)$ too. That is the definition of a derivative: $A'(x) = f(x)$. The running total's slope *is* the rate. It rose fastest where the rate was highest because the rate **is** its rate of rising.",
      equation: "A'(x) = f(x)",
      observation:
        "Moving the lower limit $a$ shifts $A$ by a constant — a different total, starting count — and changes nothing about its slope, because a constant contributes nothing to a difference quotient.",
      layers: [
        {
          kind: "recap",
          title: "The squeeze, not a shortcut",
          body: "Nothing here consulted a formula for $A$. The argument works for *any* continuous rate, produced from nothing but the definition of the running total and the squeeze — which is why it is a theorem and not a computation.",
        },
      ],
    },
    {
      id: "telescoping-setup",
      title: "The other half, and where it comes from",
      body: "The first half explains a *derivative*. The theorem's other half is about an *integral*, and it starts somewhere that looks like it has nothing to do with calculus: a staircase. Climb one, and the total rise is (top of the last step) minus (bottom of the first) — obviously, because every landing in between is the top of one step and the bottom of the next, and those two readings of the same height cancel.\n\nWrite that as an identity for any function $F$ and any partition of $[a,b]$, equal or not: chop $[a,b]$ into pieces at $a = x_0 < x_1 < \\cdots < x_n = b$, and $F(b) - F(a)$ decomposes into a sum of the small changes across each piece. This identity uses no calculus at all — it is true for *any* $F$, continuous or not, differentiable or not.",
      observation:
        "The partition below is deliberately unequal. The identity never asked for equal pieces, and a picture drawn only on equal ones would suggest it needs them.",
    },
    {
      id: "calculus-once",
      title: "Calculus enters exactly once",
      body: "The identity above is pure bookkeeping. Calculus enters at a single, identified place: replace each small change $F(x_{i+1}) - F(x_i)$ by Lesson 2's local linear model, $f(x_i)\\,\\Delta x_i$, with its error $E_i$ drawn honestly — the same symbol as Lesson 2's, because it is the same quantity, and it is not zero. Once every term is replaced, the sum on the right is exactly Lesson 3's Riemann sum.\n\nRefine the mesh and the errors shrink. *Why* they shrink uniformly — not just at one point, but everywhere on $[a,b]$ at once — is Lesson 1's declared modulus of continuity, cited by name here rather than re-derived: a continuous function on a closed bounded interval has one, and its existence is asserted with attribution, not proved in this course. With that assumption, the identity's right side tends to $\\int_a^b f$, and its left side never changed. The two are equal.",
      equation:
        "F(x_{i+1}) - F(x_i) = f(x_i)\\,\\Delta x_i + E_i \\qquad\\Longrightarrow\\qquad \\int_a^b f = F(b) - F(a)",
      observation:
        "Lesson 3 computed $\\int_0^2 x^2\\,dx = 8/3$ from the sum alone, with no antiderivative in reach. This lesson computes the same $8/3$ from $\\bigl[x^3/3\\bigr]_0^2$. The two numbers were produced by routes that never call each other, so their agreement is evidence, not circularity.",
      layers: [
        {
          kind: "math-note",
          title: "The evaluation bracket",
          body: "$\\bigl[F(x)\\bigr]_a^b$ is notation for $F(b) - F(a)$ — nothing more. It is introduced once, here, because the theorem is the first place it is needed.",
        },
      ],
    },
    {
      id: "not-a-recipe",
      title: "What the theorem does not promise",
      body: "The theorem says an antiderivative $F$ turns a definite integral into two evaluations — *if* $F$ exists in a usable form. It does not say every continuous function has one written in elementary terms. $e^{-x^2}$ is continuous everywhere, so $\\int_0^x e^{-t^2}\\,dt$ exists and is a perfectly good function of $x$; it simply is not any finite combination of the functions this course names. The theorem still applies — $A'(x) = e^{-x^2}$ regardless — and numerical accumulation, exactly as in Lesson 3, remains the only way to get a number out of it.\n\nAlso not promised: that the partition must be equal (it never was), that $F$ is unique (add any constant $C$ and the *difference* $F(b)-F(a)$ is unchanged, because $C$ appears once with each sign and cancels — a telescoping cancellation of its own), or that Riemann sums are now obsolete (they are the only method left when no elementary $F$ exists).",
      observation:
        "Existence of an antiderivative and possession of a formula for one are different claims. This course conflates them nowhere else, and this is the lesson that keeps them apart.",
      layers: [
        {
          kind: "looking-ahead",
          title: "The interior never mattered",
          body: "Keep this argument. \"Chop into pieces, replace each with a local model, let the interior evaluations cancel\" is about to be re-run over a two-dimensional region instead of a one-dimensional interval — shared edges between adjacent pieces cancel exactly the way shared endpoints did here — and when it is, it will be called Green's theorem.",
        },
      ],
    },
  ],

  formalBlocks: [
    {
      id: "thm-ftc-part1",
      kind: "theorem",
      label: "Fundamental Theorem of Calculus, part 1",
      statement:
        "If $f$ is continuous on $[a,b]$ and $A(x) = \\int_a^x f(t)\\,dt$, then $A$ is differentiable on $[a,b]$ and $A'(x) = f(x)$.",
      interpretation:
        "The running total's derivative is the rate that produced it — proved by squeezing the sliver $A(x+h)-A(x)$ between $f$'s smallest and largest values on the step.",
      visibility: "visible",
    },
    {
      id: "identity-telescoping",
      kind: "proposition",
      label: "The telescoping identity",
      statement:
        "For any function $F$ and any partition $a = x_0 < x_1 < \\cdots < x_n = b$ (equal or not), $F(b) - F(a) = \\sum_{i=0}^{n-1} \\bigl[F(x_{i+1}) - F(x_i)\\bigr]$.",
      interpretation:
        "Pure arithmetic: each interior $F(x_i)$ is written once with a $+$ sign and once with a $-$ sign, so it cancels regardless of what $F$ is. No calculus, no continuity, no equal pieces required.",
      visibility: "visible",
    },
    {
      id: "def-antiderivative",
      kind: "definition",
      label: "Antiderivative",
      statement:
        "$F$ is an antiderivative of $f$ on an interval if $F'(x) = f(x)$ there.",
      interpretation:
        "Every antiderivative of a given $f$ differs from every other by a constant — which is why $+C$ never survives a definite integral's subtraction.",
      visibility: "visible",
    },
    {
      id: "thm-ftc-part2",
      kind: "theorem",
      label: "Fundamental Theorem of Calculus, part 2",
      statement:
        "If $f$ is continuous on $[a,b]$ and $F$ is any antiderivative of $f$ there, then $\\int_a^b f(x)\\,dx = F(b) - F(a) = \\bigl[F(x)\\bigr]_a^b$.",
      interpretation:
        "Replace the telescoping identity's small changes with Lesson 2's local linear model; the sum becomes a Riemann sum with a vanishing error, and refining the mesh turns the identity into this theorem.",
      visibility: "visible",
    },
  ],

  checkpoint: {
    prompt:
      "Suppose the Fundamental Theorem were false — the accumulated speedometer and the odometer's change came out different. What would you conclude?",
    answer:
      "That one of the two instruments is not measuring what we said it was. They are two readings of a single journey; the theorem is the statement that the readings are consistent. That is why the theorem feels obvious in the car and is not obvious at all in symbols.",
  },
  checkpoints: [
    {
      id: "falsify-ftc",
      prompt:
        "Suppose the Fundamental Theorem were false — the accumulated speedometer and the odometer's change came out different. What would you conclude?",
      answer:
        "That one of the two instruments is not measuring what we said it was. They are two readings of a single journey; the theorem is the statement that the readings are consistent. That is why the theorem feels obvious in the car and is not obvious at all in symbols.",
    },
  ],

  exercises: [
    /* ---- check ---------------------------------------------------------- */
    {
      id: "ftc-differentiate-integral",
      type: "numeric",
      tier: "check",
      prompt: `Let $g(t) = 2t + 1$ and $A(x) = \\int_0^x g(t)\\,dt$. What is $A'(${DIFFERENTIATE_AT})$?`,
      expected: DIFFERENTIATE_EXPECTED,
      tolerance: 1e-9,
      explanation: `$A'(x) = g(x)$ by the theorem's first half — no need to find $A$ itself. $A'(${DIFFERENTIATE_AT}) = g(${DIFFERENTIATE_AT}) = ${DIFFERENTIATE_EXPECTED}$.`,
    },
    {
      id: "ftc-lower-limit-shift",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "The running total $A_0(x) = \\int_0^x f$ is compared with $A_3(x) = \\int_3^x f$, the same rate accumulated from a different lower limit. How does the plot of $A_3$ compare to the plot of $A_0$?",
      choices: [
        "Vertically shifted, with the same slope everywhere",
        "Horizontally shifted, with the same slope everywhere",
        "Scaled by a constant factor",
        "Shifted vertically, but with a different slope",
      ],
      correctChoice: 0,
      explanation:
        "$A_3(x) = A_0(x) - A_0(3)$ — a constant subtracted, which shifts the graph down without touching its shape. The slope of a shifted graph is the same everywhere, and it is $f(x)$ regardless of which lower limit produced the total.",
    },

    /* ---- drill ------------------------------------------------------------ */
    {
      id: "ftc-evaluate-fresh",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt: `Evaluate $\\displaystyle\\int_${FRESH_A}^${FRESH_B} (3x^2 + 2)\\,dx$. Take $F(x) = x^3 + 2x$ as your candidate antiderivative.`,
      config: {
        steps: [
          {
            kind: "numeric",
            prompt: `First, verify the candidate: what is $F'(${FRESH_A})$?`,
            expected: FRESH_FPRIME_AT_A,
            tolerance: 1e-9,
            explanation: `$F'(x) = 3x^2 + 2$, so $F'(${FRESH_A}) = ${FRESH_FPRIME_AT_A}$ — matching $f(${FRESH_A})$, which is what a real antiderivative must do.`,
          },
          {
            kind: "text",
            prompt: "Does F'(x) match f(x) at that one point only, or identically, for every x?",
            accept: ["identically", "exactly", "for every x", "everywhere", "for all x", "identically for every x"],
            explanation:
              "Identically — $F'(x) = 3x^2 + 2 = f(x)$ for every $x$, not by coincidence at one point. That is what makes $F$ a genuine antiderivative rather than a lucky guess.",
          },
          {
            kind: "numeric",
            prompt: `Now evaluate the integral: $F(${FRESH_B}) - F(${FRESH_A})$.`,
            expected: FRESH_INTEGRAL,
            tolerance: 1e-6,
            explanation: `$F(${FRESH_B}) - F(${FRESH_A}) = ${FRESH_ANTIDERIVATIVE(FRESH_B)} - ${FRESH_ANTIDERIVATIVE(FRESH_A)} = ${FRESH_INTEGRAL}$.`,
          },
        ],
      },
    },
    {
      id: "ftc-telescope-count",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "A function $F$ is evaluated at the five points of a deliberately unequal partition: $x_0 = 0$, $x_1 = 0.3$, $x_2 = 1.1$, $x_3 = 1.4$, $x_4 = 2$. Write $F(b) - F(a)$ as the telescoping sum of the four pieces.",
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt: "How do the interior evaluations $F(x_1), F(x_2), F(x_3)$ cancel?",
            choices: [
              "In pairs — each appears once with a + sign and once with a − sign",
              "They don't cancel; they add up",
              "Only because the pieces happen to be equal width",
              "Randomly, depending on the order the pieces are listed",
            ],
            correctChoice: 0,
            explanation:
              "Each interior point is the top of one piece and the bottom of the next, so it is added once and subtracted once — for ANY partition, equal-width or not.",
          },
          {
            kind: "numeric",
            prompt: "How many of the 5 evaluations survive the cancellation?",
            expected: 2,
            tolerance: 0,
            explanation: "Two — the two ends of the interval, $F(x_0)$ and $F(x_4)$. Every interior one cancels.",
          },
          {
            kind: "multiple-choice",
            prompt: "Which two survive?",
            choices: [
              "F(x_0) and F(x_4)",
              "F(x_1) and F(x_3)",
              "F(x_0) and F(x_2)",
              "F(x_2) and F(x_4)",
            ],
            correctChoice: 0,
            explanation: "The two ends: $F(x_0)$, never subtracted, and $F(x_4)$, never added away — the whole partition in between never mattered.",
          },
        ],
      },
    },
    {
      id: "ftc-why-collapse",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "In one phrase, with no symbols: why does a sum with no bound on the number of terms collapse to just two numbers?",
      config: {
        steps: [
          {
            kind: "text",
            prompt: "Why does it collapse?",
            accept: [
              "interior terms cancel",
              "the interior cancels",
              "interior values cancel in pairs",
              "interior terms cancel in pairs",
              "everything in the middle cancels",
              "the middle cancels",
              "every interior evaluation cancels",
            ],
            explanation:
              "Every interior evaluation is counted once positively and once negatively, so it contributes nothing to the total — leaving only the two ends. \"Because integration is the opposite of differentiation\" names the conclusion, not this reason, and is not accepted here.",
          },
        ],
      },
    },
    {
      id: "ftc-constant-cancels",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt: "F is replaced by F + C for some constant C.",
      config: {
        steps: [
          {
            kind: "text",
            prompt: "What happens to the value of $\\int_a^b f\\,dx = [F(x)+C]_a^b$?",
            accept: ["nothing", "it stays the same", "unchanged", "no change", "it doesn't change", "it is unchanged"],
            explanation: "Nothing changes — the definite integral is unaffected by which antiderivative you pick.",
          },
          {
            kind: "text",
            prompt: "Why, in one phrase?",
            accept: [
              "c appears twice with opposite signs",
              "c cancels",
              "added once and subtracted once",
              "opposite signs cancel",
              "c is added then subtracted",
            ],
            explanation:
              "$(F(b)+C) - (F(a)+C)$: $C$ is added once and subtracted once — a telescoping cancellation of its own, on a partition with exactly one piece.",
          },
        ],
      },
    },

    /* ---- transfer ----------------------------------------------------- */
    {
      id: "ftc-no-elementary-antiderivative",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt: "What does the Fundamental Theorem NOT promise about a continuous function?",
      config: {
        steps: [
          {
            kind: "text",
            prompt: "What is not guaranteed?",
            accept: [
              "an elementary antiderivative",
              "a formula",
              "a closed form",
              "an elementary formula",
              "a formula for f",
            ],
            explanation:
              "Existence of an antiderivative, not a usable formula for one — the two are different claims.",
          },
          {
            kind: "text",
            prompt: "Name a specific integrand with no elementary antiderivative.",
            accept: [
              "e^-x^2", "e^(-x^2)", "e^{-x^2}", "exp(-x^2)", "exp(-x^2)",
              "sin(x)/x", "sinx/x", "sin(x^2)", "cos(x^2)", "1/ln(x)", "1/lnx",
            ],
            explanation:
              "$e^{-x^2}$ is the course's standing example: continuous everywhere, with an antiderivative that exists but is not any finite combination of elementary functions.",
          },
        ],
      },
    },
    {
      id: "ftc-falsify",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt: "Predict what would be observably wrong in the car if the Fundamental Theorem were false.",
      config: {
        steps: [
          {
            kind: "text",
            prompt: "What would be observably wrong?",
            accept: [
              "the two instruments would disagree",
              "the odometer and speedometer would disagree",
              "the sum and the antiderivative would give different numbers",
              "they would not agree",
              "the accumulated speed would not match the distance",
            ],
            explanation:
              "The accumulated speedometer reading and the odometer's actual change would come apart — two readings of the same journey giving different numbers.",
          },
        ],
      },
    },
    {
      id: "ftc-telescope-transfer",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt: `Consider $\\displaystyle\\sum_{k=1}^{${TRANSFER_N}} \\left(\\frac{1}{k} - \\frac{1}{k+1}\\right)$. There is no integral here, and no calculus.`,
      config: {
        steps: [
          {
            kind: "numeric",
            prompt: "Evaluate the sum.",
            expected: TRANSFER_SUM,
            tolerance: 1e-6,
            explanation: `$1 - \\frac{1}{${TRANSFER_N + 1}} = ${TRANSFER_SUM.toFixed(4)}$.`,
          },
          {
            kind: "multiple-choice",
            prompt: "Which step of the Fundamental Theorem's argument is this an instance of?",
            choices: [
              "The telescoping identity and its cancellation",
              "The squeeze that produces A' = f",
              "Refining the mesh so the errors vanish",
              "Corroborating two independent computations",
            ],
            correctChoice: 0,
            explanation:
              "Exactly the identity step, with no calculus attached: each interior term appears once positively and once negatively.",
          },
          {
            kind: "text",
            prompt: "What plays the role of F(k) here?",
            accept: ["-1/k", "f(k)=-1/k", "f(k) = -1/k", "minus 1 over k", "-(1/k)"],
            explanation:
              "$F(k) = -1/k$: then $F(k+1) - F(k) = -\\frac1{k+1} + \\frac1k = \\frac1k - \\frac1{k+1}$, exactly the summand — the identity, spotted where no integral suggests it.",
          },
        ],
      },
    },
    {
      id: "ftc-corroborate",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt: `Compute $\\displaystyle\\int_0^2 x^2\\,dx$ two independent ways, as Lesson 3 and this lesson each did.`,
      config: {
        steps: [
          {
            kind: "numeric",
            prompt: "First, the value from summing (Lesson 3's route — no antiderivative).",
            expected: CORROBORATE_SUM,
            tolerance: 1e-2,
            explanation: `$\\approx ${CORROBORATE_SUM.toFixed(4)}$, converging on $8/3$.`,
          },
          {
            kind: "numeric",
            prompt: "Now the value from the bracket, $[x^3/3]_0^2$.",
            expected: CORROBORATE_BRACKET,
            tolerance: 1e-9,
            explanation: `$\\bigl[x^3/3\\bigr]_0^2 = 8/3 \\approx ${CORROBORATE_BRACKET.toFixed(4)}$.`,
          },
          {
            kind: "text",
            prompt: "Why does their agreement count as evidence, rather than being circular?",
            accept: [
              "the sum never used the antiderivative",
              "the two routes are independent",
              "neither method used the other",
              "the summation route didn't use f",
              "the summation route didn't use the antiderivative",
            ],
            explanation:
              "The summation route never consulted $F$, and the bracket route never summed anything — two independent computations that happen to agree is exactly what evidence looks like.",
          },
        ],
      },
    },
  ],

  keyTakeaway:
    "Chop the change into pieces and every interior value is added once and subtracted once. Only the two ends survive — which is why a sum with no end to its terms can be replaced by two evaluations. Keep this argument: it is going to be re-run over a region, and then it will be called Green's theorem.",

  structuredSummary: {
    coreMentalModel:
      "Differentiating and accumulating are inverse processes because a telescoping sum collapses to its two ends.",
    definitionsIntroduced: [
      "Antiderivative",
      "The evaluation bracket $[F(x)]_a^b$",
      "The telescoping identity",
    ],
    mainResult:
      "$A'(x) = f(x)$, and $\\int_a^b f = F(b) - F(a)$ for any antiderivative $F$ of $f$.",
    representationsConnected: [
      "The sliver squeezed between two rectangles",
      "The staircase and its landings",
      "The identity, written out symbolically",
      "Two independently computed numbers, agreeing",
    ],
    commonMistake:
      "Treating the theorem as a restatement of a definition rather than a genuine claim — the identity holds for any $F$, and calculus enters only once, at the local linear model.",
    canonicalExample: `\\int_0^2 x^2\\,dx = 8/3$, from L3's sum and from $[x^3/3]_0^2$ — the same number, two ways.`,
    oneProblemWorthRemembering: `$e^{-x^2}$: the theorem applies, and no elementary $F$ exists.`,
    whatThisUnlocksNext:
      "The same telescoping argument, re-run over a region instead of an interval — Green's theorem.",
  },

  exampleId: "ex-drive",
};
