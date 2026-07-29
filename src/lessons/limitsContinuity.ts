import type { LessonDefinition } from "./types";
import { CONSTRUCT_IN_EXPLORER_ID, EXERCISE_SEQUENCE_ID } from "./capabilities";
import {
  EX_HIDDEN_SPIKE,
  HIDDEN_SPIKE_GRID,
  differenceQuotient,
  samplingGap,
  spacingForTolerance,
} from "../math";

/**
 * Lesson: "What 'approaches' means" — applied mathematics L1, unit
 * `calculus-foundations`, Package A slice A1.
 *
 * Built on the PASS contract
 * `docs/courses/applied-mathematics/lessons/01-limits-continuity/insight.md`.
 *
 * Primary insight: a limit is not a value you arrive at and not the function's
 * value at the point — it is the value the neighbours **force**. Name any
 * tolerance and *some* window delivers it. Because the point is never consulted,
 * a quantity can be perfectly well defined where the defining expression is
 * 0/0, which is the situation of every rate in this course.
 *
 * Continuity is that guarantee holding with f(a) as the target. The lesson is
 * careful about its strength: continuity is **local** and fixes no window width,
 * so it licenses substitution and **not** finite sampling. Turning it into a
 * sampling rule needs a chosen resolution and a modulus of continuity — the
 * object `fundamental-theorem` will cite by name for the uniformity of its error
 * bound. (An earlier draft of the plan claimed continuity means "nothing hides
 * between your samples"; that is false, and refuting it is now the lesson's
 * seventh misconception and two of its graded items.)
 *
 * Scope: no epsilon-delta proof *production*; no limits at infinity
 * (`improper-integrals`); no L'Hopital; no sequences (`sequences-limits`); no
 * proof that continuity on a compact interval is uniform — the modulus is
 * defined and used, its existence there is stated with attribution.
 */

/* ---------------------------------------------------------------- numbers */

/** The scene's own example: the difference quotient of x² at a = 3. */
const PARABOLA_AT = 3;
const PARABOLA_SLOPE = 2 * PARABOLA_AT;

/**
 * The fresh 0/0 quotient the scene never draws: (x² − 25)/(x − 5) at x = 5,
 * which agrees with x + 5 off the point and is therefore forced to 10.
 */
const FRESH_QUOTIENT_AT = 5;
const FRESH_QUOTIENT_LIMIT = 2 * FRESH_QUOTIENT_AT;

/**
 * The modulus used by the spacing item, and the tolerance it must meet.
 *
 * The answer is the **largest** spacing that works, which for a linear modulus
 * is exact: `3 delta <= 0.06` gives `delta <= 0.02`. Deliberately not taken from
 * `spacingForTolerance`, which searches a ladder and returns *a* sufficient
 * spacing — grading against a search's granularity would reject the correct
 * answer, which is exactly what it did on the first attempt here.
 */
const SPACING_SLOPE = 3;
const SPACING_TOLERANCE = 0.06;
const SPACING_ANSWER = SPACING_TOLERANCE / SPACING_SLOPE;

/** The ladder search must at least agree that the exact answer is sufficient. */
if (
  SPACING_ANSWER * SPACING_SLOPE > SPACING_TOLERANCE + 1e-12 ||
  spacingForTolerance({ omega: (d) => SPACING_SLOPE * d, label: "3\\delta" }, SPACING_TOLERANCE) ===
    null
) {
  throw new Error("limitsContinuity: the spacing item's answer is not sufficient.");
}

/** The gap the coarse grid leaves on the spike — computed, never asserted. */
const SPIKE_GAP = samplingGap(
  EX_HIDDEN_SPIKE.f,
  EX_HIDDEN_SPIKE.domain,
  HIDDEN_SPIKE_GRID,
);

/** Sanity: the derived numbers are the ones the prose claims. */
if (Math.abs(differenceQuotient((x) => x * x, PARABOLA_AT, 1e-9) - PARABOLA_SLOPE) > 1e-6) {
  throw new Error("limitsContinuity: the parabola's forced slope is not 6.");
}

export const limitsContinuityLesson: LessonDefinition = {
  id: "limits-continuity",
  title: "What \u201Capproaches\u201D Means",
  subtitle: "A limit is a value the neighbours force \u2014 the point never votes",
  learningObjectives: [
    "Decide from a graph whether a limit exists, and name which of the four ways it failed",
    "Say what changes if the function's value at the point is altered or deleted \u2014 and answer: nothing",
    "Evaluate a $0/0$ limit by exhibiting a second expression that agrees off the point",
    "Apply the three-part continuity test, and justify a substitution by naming continuity",
    "Say what continuity does not give: it fixes no window width, so it licenses no sampling grid",
    "Use a modulus of continuity and a chosen tolerance to pick a grid spacing",
  ],
  motivatingQuestion:
    "A car passes a single point on the road. The speedometer says 50. But speed is distance divided by time, and at a single instant the car covers no distance in no time. What is the needle showing?",

  guidedSceneId: "limits-continuity",
  explorationId: "limits-continuity",

  route: [
    { kind: "motivate" },
    { kind: "visual", heading: "A number with no formula" },
    { kind: "section", sectionId: "paradox" },
    { kind: "formal", formalId: "def-limit" },
    { kind: "section", sectionId: "point-never-votes" },
    { kind: "check", checkpointId: "sampled-and-small" },
    { kind: "section", sectionId: "four-failures" },
    { kind: "formal", formalId: "def-continuity" },
    { kind: "section", sectionId: "local-only" },
    { kind: "formal", formalId: "def-modulus" },
    { kind: "explore", tocLabel: "Answer a tolerance with a window" },
    { kind: "practice" },
    { kind: "summary" },
  ],

  sections: [
    {
      id: "paradox",
      title: "The needle reads a number the formula cannot produce",
      body: "Average speed over an interval is easy: distance divided by time. Shrink the interval and the arithmetic still works \u2014 right up to the instant itself, where the car covers no distance in no time and the formula reads $0/0$. Yet the needle is showing 50, and it is not guessing. So the number is fixed by something other than evaluating the formula at that instant.\n\nCompute the average over a run of shrinking intervals and watch what happens: the values **settle**. That settling is the whole idea, and making it precise is what a limit is.",
      equation: "\\frac{\\Delta s}{\\Delta t} \\quad\\text{at an instant}\\quad \\frac{0}{0}",
      observation:
        "Nothing here is a repair. The formula is genuinely undefined at the instant, and the number is genuinely determined. Both are true at once.",
      layers: [
        {
          kind: "why",
          title: "Why not just take a very short interval?",
          body: "Because \u201Cvery short\u201D is not a number. Any particular short interval gives an average, not the instantaneous value, and a different short interval gives a different average. The limit is what those averages are forced toward \u2014 a single value, defined without ever picking one interval.",
        },
      ],
    },
    {
      id: "point-never-votes",
      title: "The point itself never gets a vote",
      body: "Read the definition again and notice what it consults: the values at inputs **near** $a$, and never the value **at** $a$. The strict inequality $0<\\lvert x-a\\rvert$ is doing that work, and it is not a technicality.\n\nSo delete the point. Punch a hole in the graph at $x=a$ and the limit is unchanged \u2014 there was nothing there for it to read. Move the value somewhere else entirely and it is still unchanged. A limit is a claim about a neighbourhood, and a single point is not a neighbourhood.\n\nThat is what licenses the whole of the rest of this course. Every rate you will meet is a quotient that reads $0/0$ at the very point you want it at, and the limit is how it is defined anyway.",
      equation:
        "\\lim_{x\\to a} f(x) = L \\iff \\forall \\varepsilon>0\\ \\exists \\delta>0:\\ 0<\\lvert x-a\\rvert<\\delta \\Rightarrow \\lvert f(x)-L\\rvert<\\varepsilon",
      layers: [
        {
          kind: "trap",
          title: "\u201CCancelling\u201D does not repair the expression",
          body: "For $f(x)=x^2$ at $a=3$, the quotient $\\frac{(3+h)^2-9}{h}$ simplifies to $6+h$ \u2014 but only for $h\\neq0$. At $h=0$ the first expression is $0/0$ and the second is $6$; they are not the same function. What cancelling does is exhibit a **second** expression that agrees with the first everywhere the limit looks, and whose forced value can be read off. Nothing was fixed.",
        },
        {
          kind: "math-note",
          title: "\u201CApproaches\u201D is not motion",
          body: "Nothing travels anywhere in the definition. There is no moment at which $x$ arrives, and the question \u201Cdoes it get there?\u201D has no counterpart in the symbols. The definition is a challenge and a response: you name a tolerance, and a window answers it.",
        },
      ],
    },
    {
      id: "four-failures",
      title: "Four ways to lose the game",
      body: "A limit exists when every tolerance can be answered. It fails when one cannot, and from a graph you can see which:\n\n- **Jump** \u2014 the approach from the left and the approach from the right settle on *different* values, so no single target can be defended.\n- **Removable** \u2014 the neighbours force a value perfectly well; the function simply disagrees with it, or is not defined there at all. The limit exists.\n- **Oscillation** \u2014 the values keep crossing any candidate band however narrow the window; nothing is forced.\n- **Blow-up** \u2014 the outputs leave every band and keep going.\n\nOnly the second of these has a limit, which is exactly why it is the interesting one.",
      layers: [
        {
          kind: "math-note",
          title: "One-sided limits, used once",
          body: "The jump case is the one where it helps to ask the two approaches separately. Elsewhere in this course the two-sided limit is what is wanted, and one-sided limits are not developed further.",
        },
      ],
    },
    {
      id: "local-only",
      title: "Continuity is a local promise, not a sampling licence",
      body: "It is tempting to read continuity as \u201Cnothing surprising can happen between two nearby points\u201D. That is **false**, and the difference matters as soon as you compute anything.\n\nContinuity at $a$ says: for each tolerance, *some* window achieves it, near *this* point. It does not say how wide that window is, and it does not say that one width works everywhere. So take a continuous function, sample it on a grid, and read off the values \u2014 you have learned nothing about what happens in between. A tall narrow spike can sit entirely inside one grid cell while every sample reads zero.\n\nTo say anything about the gaps you need two more things, and you must choose them:\n\n1. a **resolution** \u2014 how fine a grid you will pay for, and what tolerance you will accept;\n2. **quantitative control** \u2014 a bound on how far the function can move over one step of that size.\n\nThe second is a *modulus of continuity*, and it is what converts \u201Csome window exists\u201D into \u201C**this** window suffices, anywhere on the interval\u201D.",
      observation:
        "Continuity buys you substitution. Sampling has to be bought separately.",
      layers: [
        {
          kind: "looking-ahead",
          title: "Where this is spent",
          body: "The Fundamental Theorem of Calculus needs its error terms to shrink **uniformly** across a whole interval, not just point by point. The modulus is the object that says so, and that lesson names it rather than waving at it. A continuous function on a closed bounded interval always has one \u2014 stated here on authority, proved nowhere in this course.",
        },
      ],
    },
  ],

  formalBlocks: [
    {
      id: "def-limit",
      kind: "definition",
      label: "The limit, as a guarantee",
      statement:
        "$\\lim_{x\\to a} f(x) = L$ means: for every tolerance $\\varepsilon>0$ there is a window $\\delta>0$ such that $0<\\lvert x-a\\rvert<\\delta$ implies $\\lvert f(x)-L\\rvert<\\varepsilon$.",
      interpretation:
        "Name how close you want the output to stay; a window on the input delivers it. The condition $0<\\lvert x-a\\rvert$ excludes the point itself, so $f(a)$ is never consulted \u2014 it may be any value, or none.",
      visibility: "visible",
    },
    {
      id: "def-continuity",
      kind: "definition",
      label: "Continuity at a point",
      statement:
        "$f$ is continuous at $a$ when $f(a)$ exists, $\\lim_{x\\to a}f(x)$ exists, and the two are equal.",
      interpretation:
        "Three separate conditions, and any one of them can fail on its own. When all three hold, substitution is legitimate \u2014 that is precisely what continuity buys, and it is a claim about the single point $a$.",
      visibility: "visible",
    },
    {
      id: "def-modulus",
      kind: "definition",
      label: "Modulus of continuity",
      statement:
        "A modulus for $f$ on an interval is a function $\\omega$ with $\\omega(\\delta)\\to0$ and $\\lvert f(x)-f(y)\\rvert \\le \\omega(\\lvert x-y\\rvert)$ for all $x,y$ in that interval.",
      interpretation:
        "The quantitative form of the guarantee: one bound that works everywhere, rather than a different unknown window at each point. Given a tolerance, it names a grid spacing that meets it. A continuous function on a closed bounded interval has one \u2014 stated here, not proved.",
      visibility: "revealed",
      layers: [
        {
          kind: "math-note",
          title: "Why \u201Cworks everywhere\u201D is the operative phrase",
          body: "Continuity gives you a window at each point, and those windows may shrink without bound as you move along the interval. A modulus rules that out: one width serves the whole interval. On a closed bounded interval that is always possible, and this course uses the fact without proving it.",
        },
      ],
    },
  ],

  checkpoint: {
    prompt:
      "This function is continuous everywhere. Here are its values at $x=0,1,2,\\dots,10$, and every one of them is zero. May you conclude that $f$ stays near zero on $[0,10]$?",
    answer:
      "No. Continuity is a promise about each point's own neighbourhood, and it fixes no window width \u2014 so a spike can sit entirely between two samples while every sample reads zero. To conclude anything you need a chosen resolution **and** a modulus of continuity bounding how far $f$ can move over one grid step. On the very function in this lesson's explorer, the true values reach about " +
      SPIKE_GAP.toFixed(2) +
      " away from the sampled polyline.",
  },
  checkpoints: [
    {
      id: "sampled-and-small",
      prompt:
        "This function is continuous everywhere. Here are its values at $x=0,1,2,\\dots,10$, and every one of them is zero. May you conclude that $f$ stays near zero on $[0,10]$?",
      answer:
        "No. Continuity is a promise about each point's own neighbourhood, and it fixes no window width \u2014 so a spike can sit entirely between two samples while every sample reads zero. To conclude anything you need a chosen resolution **and** a modulus of continuity bounding how far $f$ can move over one grid step. On the very function in this lesson's explorer, the true values reach about " +
        SPIKE_GAP.toFixed(2) +
        " away from the sampled polyline.",
    },
  ],

  exercises: [
    /* ---- check ------------------------------------------------------- */
    {
      id: "lim-point-value-irrelevant",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "check",
      prompt:
        "A function has $\\lim_{x\\to2}f(x)=7$. Someone now changes $f(2)$ from $7$ to $-100$, and then deletes it entirely.",
      config: {
        steps: [
          {
            kind: "text",
            prompt: "After the change, what is $\\lim_{x\\to2}f(x)$? (A number, or \u201Cno limit\u201D.)",
            accept: ["7", "seven", "still 7", "7, unchanged", "unchanged"],
            explanation:
              "Still 7. The definition consults $0<\\lvert x-2\\rvert$ only, so it never read $f(2)$ in the first place.",
          },
          {
            kind: "text",
            prompt: "After $f(2)$ is deleted, what is $\\lim_{x\\to2}f(x)$?",
            accept: ["7", "seven", "still 7", "unchanged", "7, unchanged"],
            explanation:
              "Still 7 \u2014 and this is the case that matters, because every derivative in this course is a quotient with no value at the point.",
          },
        ],
      },
    },
    {
      id: "lim-symbolic-recognition",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "Which statement says the same thing as \u201Cname any tolerance and some window delivers it\u201D?",
      choices: [
        "$\\forall \\varepsilon>0\\ \\exists \\delta>0:\\ 0<\\lvert x-a\\rvert<\\delta \\Rightarrow \\lvert f(x)-L\\rvert<\\varepsilon$",
        "$\\exists \\varepsilon>0\\ \\forall \\delta>0:\\ 0<\\lvert x-a\\rvert<\\delta \\Rightarrow \\lvert f(x)-L\\rvert<\\varepsilon$",
        "$\\forall \\varepsilon>0\\ \\exists \\delta>0:\\ \\lvert x-a\\rvert<\\delta \\Rightarrow \\lvert f(x)-L\\rvert<\\varepsilon$",
        "$\\forall \\delta>0\\ \\exists \\varepsilon>0:\\ 0<\\lvert x-a\\rvert<\\delta \\Rightarrow \\lvert f(x)-L\\rvert<\\varepsilon$",
      ],
      correctChoice: 0,
      explanation:
        "The tolerance is named first and the window answers it, so $\\varepsilon$ is quantified before $\\delta$. The second option reverses that. The third drops $0<\\lvert x-a\\rvert$, which would force the limit to read $f(a)$ \u2014 that is continuity, not a limit. The fourth lets the window be named first, which is a different (and much weaker) claim.",
    },

    /* ---- drill ------------------------------------------------------- */
    {
      // Named for what it is: the learner is given each function's DEFINITION,
      // not its graph. Graph-reading is practised in the explorer and shown in
      // the scene; it is not what this item captures, and the mastery contract
      // no longer claims it does.
      id: "lim-diagnose-definition",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "Four functions, each defined below and examined at the marked point. From the definition alone, name what happens to the limit. Type one of: **exists**, **jump**, **oscillation**, **blow-up**.",
      config: {
        steps: [
          {
            kind: "text",
            prompt:
              "$g(x)=\\dfrac{x^2-9}{x-3}$ at $x=3$ (the function is undefined there).",
            accept: ["exists", "it exists", "limit exists", "removable"],
            explanation:
              "The limit exists and equals 6: $g$ agrees with $x+3$ everywhere the limit looks. The function being undefined at 3 is irrelevant \u2014 that is a removable discontinuity, not a missing limit.",
          },
          {
            kind: "text",
            prompt: "$h(x)=0$ for $x<1$ and $h(x)=2$ for $x\\ge1$, at $x=1$.",
            accept: ["jump"],
            explanation:
              "The two approaches settle on 0 and 2. No single target can be defended, so no tolerance narrower than 2 can be answered.",
          },
          {
            kind: "text",
            prompt: "$k(x)=\\sin(1/x)$ at $x=0$.",
            accept: ["oscillation", "oscillates", "oscillating"],
            explanation:
              "However narrow the window, the values still sweep the whole of $[-1,1]$. Nothing is forced, so there is no limit \u2014 and in particular the answer is not 0.",
          },
          {
            kind: "text",
            prompt: "$m(x)=1/x^2$ at $x=0$.",
            accept: ["blow-up", "blow up", "blowup", "blows up"],
            explanation:
              "The outputs leave every band and keep going. Distinct from oscillation: here they do not come back.",
          },
        ],
      },
    },
    {
      // Two steps, because the claimed outcome is that the learner EXHIBITS an
      // agreeing expression. A bare number would have evidenced only the answer,
      // and the expression is the part that carries the insight.
      id: "lim-zero-over-zero-fresh",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "Evaluate $\\displaystyle\\lim_{x\\to5}\\frac{x^2-25}{x-5}$. At $x=5$ the expression reads $0/0$, so substitution is not available.",
      config: {
        steps: [
          {
            kind: "text",
            prompt:
              "First, give a simpler expression that agrees with this one at every $x\\neq5$.",
            accept: ["x+5", "x + 5", "5+x", "5 + x", "y=x+5", "y = x + 5"],
            explanation:
              "$\\frac{x^2-25}{x-5} = \\frac{(x-5)(x+5)}{x-5} = x+5$ whenever $x\\neq5$ \u2014 and that is exactly the region the limit consults.",
          },
          {
            kind: "numeric",
            prompt: "Now read the forced value off that expression.",
            expected: FRESH_QUOTIENT_LIMIT,
            tolerance: 1e-9,
            explanation:
              "$5+5=10$. Note what happened: the cancellation exhibited a **second** function agreeing with the first off the point. It did not repair the first, which is still $0/0$ at $x=5$.",
          },
        ],
      },
    },
    {
      id: "lim-continuity-test",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "Let $p(x)=\\dfrac{x^2-4}{x-2}$ for $x\\neq2$, and $p(2)=1$. Run the three-part test at $x=2$.",
      config: {
        steps: [
          {
            kind: "text",
            prompt: "Does $p(2)$ exist? (yes / no)",
            accept: ["yes", "y", "it exists", "exists"],
            explanation: "Yes \u2014 it was defined to be 1.",
          },
          {
            kind: "numeric",
            prompt: "What is $\\lim_{x\\to2}p(x)$?",
            expected: 4,
            tolerance: 1e-9,
            explanation:
              "Off the point $p$ agrees with $x+2$, so the neighbours force 4.",
          },
          {
            kind: "text",
            prompt: "Is $p$ continuous at $x=2$? (yes / no)",
            accept: ["no", "n", "not continuous", "discontinuous"],
            explanation:
              "No. Both parts exist, but they disagree \u2014 $4\\neq1$. This is exactly the removable case: redefining the single value $p(2)=4$ would repair the continuity, and would not change the limit at all.",
          },
        ],
      },
    },
    {
      id: "lim-why-substitution-works",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "To evaluate $\\lim_{x\\to4}(x^3-2x)$ you would substitute $x=4$ and get $56$. Name the property that makes that legitimate.",
      config: {
        steps: [
          {
            kind: "text",
            prompt: "One word.",
            accept: [
              "continuity",
              "continuous",
              "it is continuous",
              "polynomials are continuous",
              "continuity of polynomials",
            ],
            explanation:
              "Continuity \u2014 and it has to be named, because substitution is not what a limit *is*. It is a shortcut available exactly when the forced value happens to equal the actual value, which for a polynomial it always does.",
          },
        ],
      },
    },
    {
      id: "lim-choose-spacing",
      type: "numeric",
      tier: "drill",
      prompt:
        "A function on $[0,1]$ has modulus of continuity $\\omega(\\delta)=3\\delta$. You will sample it on an evenly spaced grid and you need the true values to stay within $" +
        SPACING_TOLERANCE +
        "$ of your samples. What is the largest grid spacing that guarantees it?",
      expected: SPACING_ANSWER,
      tolerance: 1e-6,
      explanation:
        "Solve $3\\delta \\le " +
        SPACING_TOLERANCE +
        "$, giving $\\delta \\le " +
        SPACING_ANSWER.toFixed(3) +
        "$. Notice what did the work: the modulus, not the continuity. Continuity alone would have told you a window exists at each point and left you with no number to use.",
    },

    /* ---- transfer ---------------------------------------------------- */
    {
      // `construct-in-explorer`, not a one-step `exercise-sequence`: this is an
      // open predicate-graded construction and its capability ceiling (E4) is
      // what the mastery contract's transfer claim rests on. Wrapping it in a
      // scaffolded chain would have capped the honest claim at E3.
      id: "lim-limit-not-continuity",
      type: "custom",
      capabilityId: CONSTRUCT_IN_EXPLORER_ID,
      tier: "transfer",
      prompt:
        "Describe a function that **has a limit** at $x=1$ but is **not continuous** there, by giving the pair $(\\text{limit},\\ f(1))$. Any pair that does the job is accepted.",
      config: {
        target: "vector2",
        check: { kind: "removable-discontinuity" },
        tolerance: 1e-9,
        reveal:
          "Any pair of finite numbers that **differ** works \u2014 the neighbours force one value and the function insists on another. That is precisely a removable discontinuity: the limit exists, and continuity fails only because the value disagrees with it.",
        hint: "Equal coordinates describe a *continuous* point. And no pair at all describes the jump, oscillation, or blow-up cases \u2014 in those there is no limit to give.",
      },
    },
    {
      id: "lim-continuity-not-enough",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt:
        "A colleague samples a **continuous** function at $x=0,1,2,\\dots,10$, finds every value is zero, and concludes it is near zero throughout.",
      config: {
        steps: [
          {
            kind: "text",
            prompt: "Is the conclusion justified? (yes / no)",
            accept: ["no", "n", "not justified", "unjustified"],
            explanation:
              "No. Continuity is local: it promises a window at each point but fixes no width, so it says nothing about the gaps between chosen samples.",
          },
          {
            kind: "multiple-choice",
            prompt: "What would have to be added to justify it?",
            choices: [
              "A chosen resolution and a modulus of continuity bounding the variation over one grid step",
              "Nothing \u2014 continuity already rules out surprises between samples",
              "More samples, with no further assumption",
              "Differentiability of the function",
            ],
            correctChoice: 0,
            explanation:
              "Both are needed, and both are choices. More samples alone is no argument \u2014 without a bound you never know when to stop. Differentiability is neither necessary nor sufficient on its own; a differentiable function can still have a very steep spike.",
          },
        ],
      },
    },
    {
      id: "lim-repair-transfer",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt:
        "Let $q(x)=\\dfrac{\\lvert x-3\\rvert}{x-3}$ for $x\\neq3$, and $q(3)=0$. You are allowed to redefine $q$ at the single point $x=3$, and nowhere else.",
      config: {
        steps: [
          {
            kind: "text",
            prompt: "Can you make the limit at $x=3$ exist? (yes / no)",
            accept: ["no", "n", "cannot", "can't", "impossible"],
            explanation:
              "No. The limit is fixed by the neighbours, and they are $-1$ on the left and $+1$ on the right. Editing one point changes nothing the limit reads \u2014 it is a jump, and jumps are not repairable from a single value.",
          },
          {
            kind: "text",
            prompt:
              "Now take $r(x)=\\dfrac{x^2-9}{x-3}$ with $r(3)=0$. Can you make **that** continuous at 3 by redefining $r(3)$? (yes / no)",
            accept: ["yes", "y", "can", "possible"],
            explanation:
              "Yes \u2014 set $r(3)=6$. Here the limit already exists; only the value disagreed with it, and the value is the one thing you are allowed to move.",
          },
          {
            kind: "multiple-choice",
            prompt: "What, in general, can redefining a single point repair?",
            choices: [
              "Continuity, never the limit",
              "The limit, never continuity",
              "Both",
              "Neither",
            ],
            correctChoice: 0,
            explanation:
              "The limit is a property of the neighbourhood and is untouchable from one point. Continuity is the agreement between that limit and the value \u2014 and the value is exactly what you can move.",
          },
        ],
      },
    },
  ],

  keyTakeaway:
    "A limit is what the neighbours force. The point itself never gets a vote \u2014 which is why a rate can exist exactly where its formula does not. Continuity is that guarantee holding with the function's own value as the target: a promise about each point's neighbourhood, not about the gaps between your samples.",

  structuredSummary: {
    coreMentalModel:
      "Name a tolerance; a window answers it. The value at the point is never consulted.",
    definitionsIntroduced: [
      "Limit at a point (the tolerance guarantee)",
      "Continuity at a point (three separable conditions)",
      "Modulus of continuity (the quantitative form)",
    ],
    mainResult:
      "A limit may exist where the function is undefined, and altering or deleting $f(a)$ never changes it.",
    representationsConnected: [
      "Tolerance band and input window on a graph",
      "A table of shrinking-interval values",
      "The two-expression algebra behind a $0/0$ cancellation",
    ],
    commonMistake:
      "Reading continuity as \u201Cnothing can hide between two samples\u201D. It fixes no window width; sampling needs a resolution and a modulus.",
    canonicalExample:
      "$\\frac{(3+h)^2-9}{h}=6+h$ for $h\\neq0$, forced to $6$.",
    oneProblemWorthRemembering:
      "Continuous, every integer sample zero \u2014 and a full-height spike between two of them.",
    whatThisUnlocksNext:
      "The derivative and the definite integral, both limits of expressions undefined at the limit itself.",
  },

  exampleId: "ex-parabola",
};
