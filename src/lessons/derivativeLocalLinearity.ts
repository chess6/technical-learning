import type { LessonDefinition } from "./types";
import { CONSTRUCT_IN_EXPLORER_ID, EXERCISE_SEQUENCE_ID } from "./capabilities";
import { EX_PARABOLA, differenceQuotient, residual } from "../math";

/**
 * Lesson: "The derivative as local linearity" — applied mathematics L2, unit
 * `calculus-foundations`, Package A slice A2.
 *
 * Built on the PASS contract
 * `docs/courses/applied-mathematics/lessons/02-derivative-local-linearity/insight.md`.
 *
 * Primary insight: zoom far enough into a smooth curve and it **is** a line.
 * That line is the best local approximation, its slope is the number the line is
 * described by, and that slope in the graph's own units is the rate — so "rate
 * of change", "slope of the tangent", and "best linear approximation" are one
 * object read three ways, not three facts. The tangent is therefore the line
 * whose error shrinks *faster than the step*, not the line that touches once;
 * and where no line appears under magnification there is no derivative.
 *
 * The diagnosed obstacle is FRAGMENTATION, so the lesson's work is compression.
 * L4 consumes C5 (the error term) verbatim in its telescoping step, which is why
 * this lesson is framed as approximation rather than as slope.
 *
 * Evidence discipline, applied from L1's review: `exercise-sequence` is capped at
 * **E3**, so the lesson's single E4 claim rests on the one genuinely open
 * construction (`der-corner-slopes`, on `construct-in-explorer`). No item claims
 * to present a figure that its capability cannot render.
 *
 * Scope: the differentiation rulebook beyond x^n and sums is stated, not derived;
 * the chain rule is L5's subject; no implicit differentiation, no higher-order
 * Taylor, no mean value theorem.
 */

/* ---------------------------------------------------------------- numbers */

const A = 1.4;
const SLOPE_AT_A = EX_PARABOLA.derivative!(A);

/** The fresh cubic the clips never draw. */
const FRESH_AT = 2;
const freshCubic = (x: number) => x * x * x;
const FRESH_SLOPE = 3 * FRESH_AT * FRESH_AT;

/** The linearization item's numbers, computed rather than asserted. */
const EST_AT = 1;
const EST_H = 0.2;
const EST_SLOPE = 3 * EST_AT * EST_AT;
const EST_VALUE = freshCubic(EST_AT) + EST_SLOPE * EST_H;
const EST_TRUE = freshCubic(EST_AT + EST_H);

/** The residual at the running example, for the "what remains" item. */
const RESIDUAL_AT_A = residual(EX_PARABOLA.f, A, SLOPE_AT_A, 0.1);

/** Sanity: the prose's numbers are the code's numbers. */
if (Math.abs(differenceQuotient(EX_PARABOLA.f, A, 1e-9) - SLOPE_AT_A) > 1e-6) {
  throw new Error("derivativeLocalLinearity: the running slope is not 2a.");
}
if (!(EST_TRUE > EST_VALUE)) {
  throw new Error(
    "derivativeLocalLinearity: the transfer item assumes the estimate UNDERshoots on a convex arc.",
  );
}

export const derivativeLocalLinearityLesson: LessonDefinition = {
  id: "derivative-local-linearity",
  title: "The Derivative as Local Linearity",
  subtitle:
    "Zoom far enough and a smooth curve is a line — the derivative is that line",
  learningObjectives: [
    "Compute a derivative from the definition, showing the cancelled quotient",
    "Produce the linear approximation at a point and use it to estimate a nearby value",
    "Answer a rate question with a slope and a slope question with a rate, in units",
    "Say why the tangent is the line whose error decays faster — not the line that touches once",
    "Decide differentiability at a point, and say what the magnified picture would do",
    "Say what remains after zooming: a residual that is small compared to the step, not zero",
  ],
  motivatingQuestion:
    "Everyone says the speedometer's reading is the slope of a line on a graph. But a rate is metres per second and a slope is one length divided by another. Why should those be the same number?",

  guidedSceneId: "derivative-local-linearity",
  explorationId: "derivative-local-linearity",

  route: [
    { kind: "motivate" },
    { kind: "visual", heading: "Zoom in far enough" },
    { kind: "section", sectionId: "rate-or-slope" },
    { kind: "formal", formalId: "def-derivative" },
    { kind: "section", sectionId: "zoom" },
    { kind: "formal", formalId: "def-local-linearity" },
    // The second clip is placed here, immediately after the approximation form
    // is stated, because that statement is what it compresses.
    {
      kind: "visual",
      sceneId: "derivative-three-names",
      heading: "One number, three readings",
    },
    { kind: "section", sectionId: "three-names" },
    { kind: "check", checkpointId: "did-curvature-go" },
    { kind: "section", sectionId: "tangent-honestly" },
    { kind: "formal", formalId: "def-tangent" },
    { kind: "explore", tocLabel: "Zoom until it is a line" },
    { kind: "practice" },
    { kind: "summary" },
  ],

  sections: [
    {
      id: "rate-or-slope",
      title: "A rate and a slope are not obviously the same kind of thing",
      body: "Lesson 1 settled that the instantaneous reading is a real number: the neighbours force it, even though the formula at the instant is $0/0$. But everyone then says that number is the **slope** of a line drawn on a graph — and a rate is metres per second while a slope is one length divided by another. Nothing so far has said why one should be the other.\n\nA third description is usually added without connecting it to either: the derivative is the **best linear approximation** near the point. Three names is one too many for one object. Either they are different things, or something has been repeating itself.\n\nIt has been repeating itself, and the reason is visible if you magnify the picture.",
      equation:
        "\\frac{f(a+h)-f(a)}{h} \\;\\xrightarrow[h\\to0]{}\\; f'(a)",
      observation:
        "The secant's slope is already both readings at once: rise over run, and change in output per change in input. Only the units differ.",
    },
    {
      id: "zoom",
      title: "Magnify a smooth curve and it becomes a line",
      body: "Not “looks a bit like” — within the resolution of the picture, it **is** a line. That is what smoothness means, and it is the same fact as the flatness of the ground under your feet: the Earth's curvature has not gone anywhere, it is invisible at your scale.\n\nSo the derivative has something to be the slope *of*. Magnify about $(a, f(a))$, and at high enough magnification there is a straight line in the window. Its slope is the number the shrinking secants settled on, and the two are the same line.\n\nWhere no line appears, there is no derivative — and you can *see* that rather than test for it. Magnify $\\lvert x\\rvert$ at the origin and the two sides stay stubbornly different lines, however far you go.",
      layers: [
        {
          kind: "trap",
          title: "The curvature is still there",
          body: "It is tempting to conclude that a zoomed-in curve *is* straight. It is not. The residual — the gap between the curve and the line — is still nonzero at every magnification, which is why the explorer keeps displaying it. What has happened is subtler and more useful: the residual has become small **compared to the step**. That is the property the next lesson but one will spend.",
        },
        {
          kind: "connection",
          title: "The $1\\times1$ matrix",
          body: "$h \\mapsto f'(a)\\,h$ is a linear map from $\\mathbb{R}$ to $\\mathbb{R}$, and $f'(a)$ is its matrix — one column, one entry, “where the basis lands”. That is the columns rule from the linear-algebra course, in one dimension. It is also why this framing generalizes later: *best linear approximation* survives into several variables, while *slope of the tangent* does not.",
        },
      ],
    },
    {
      id: "three-names",
      title: "One object, read three ways",
      body: "Once there is a line in the window, the three descriptions collapse:\n\n- the **line** is what the curve becomes locally — the approximation;\n- the line's **slope** is the number describing it — the slope;\n- that slope, in the graph's own units, is output per input — the rate.\n\nOne zoom, one line, one number. Asked for a rate, give the slope; asked for a slope, give the rate; asked to predict a nearby value, use the line. They are not three facts to keep straight.",
      equation: "f(a+h) \\;=\\; f(a) + f'(a)\\,h + E(h), \\qquad \\frac{E(h)}{h}\\to0",
    },
    {
      id: "tangent-honestly",
      title: "What actually singles the tangent out",
      body: "School geometry says a tangent touches the curve at one point and does not cross it. That is true for circles and **false** for graphs: at an inflection point the tangent crosses the curve at the very point of tangency. On $y=x^3$ at the origin, the tangent is the $x$-axis, and the curve passes straight through it.\n\nSo contact is not the criterion. **Error decay** is. Draw any line through $(a, f(a))$ with slope $m$: its error a step $h$ away is about $(f'(a)-m)h$, which is proportional to $h$. The tangent alone — the one with $m = f'(a)$ — has an error that vanishes *faster* than $h$. That is what makes it the best linear approximation, and it is a property you can measure rather than a picture you have to trust.",
      observation:
        "Every other line's error shrinks in proportion to the step. The tangent's shrinks compared to the step. That gap in behaviour is the definition.",
      layers: [
        {
          kind: "math-note",
          title: "Differentiable ⇒ continuous, and not conversely",
          body: "If $f(a+h)=f(a)+f'(a)h+E(h)$ with $E(h)/h\\to0$, then $f(a+h)\\to f(a)$: differentiability forces continuity. The converse fails, and $\\lvert x\\rvert$ at the origin is the standing counterexample — continuous, with a corner. A continuous function can even fail to be differentiable *anywhere*; that exists, and this course does not develop it.",
        },
      ],
    },
  ],

  formalBlocks: [
    {
      id: "def-derivative",
      kind: "definition",
      label: "The derivative at a point",
      statement:
        "$f'(a) = \\displaystyle\\lim_{h\\to0}\\frac{f(a+h)-f(a)}{h}$, when that limit exists.",
      interpretation:
        "The quotient is $0/0$ at $h=0$ and is never evaluated there — Lesson 1's whole point. What is defined is the value the neighbouring quotients force.",
      visibility: "visible",
    },
    {
      id: "def-local-linearity",
      kind: "definition",
      label: "Local linearity",
      statement:
        "$f$ is differentiable at $a$ exactly when $f(a+h) = f(a) + f'(a)h + E(h)$ with $\\dfrac{E(h)}{h}\\to0$ as $h\\to0$.",
      interpretation:
        "The same fact as the limit above, written so the **approximation** is the object and the error is named. This is the form the Fundamental Theorem will consume: it is what lets a small change in $F$ be replaced by $f(x_i)\\,\\Delta x_i$ with an error that vanishes under refinement.",
      visibility: "visible",
    },
    {
      id: "def-tangent",
      kind: "definition",
      label: "The tangent line, by error decay",
      statement:
        "The tangent at $a$ is the unique line through $(a,f(a))$ whose error satisfies $E(h)/h\\to0$. For any other slope $m$, the error is $\\approx (f'(a)-m)h$.",
      interpretation:
        "Not “touches at one point” — that is false at every inflection point. Uniqueness comes free: two different slopes cannot both have errors vanishing faster than $h$, since their difference is exactly $(m_1-m_2)h$.",
      visibility: "revealed",
    },
  ],

  checkpoint: {
    prompt:
      "A curve is magnified about a point until it appears perfectly straight. Has the curvature gone away?",
    answer:
      "No. The residual $E(h)$ is still nonzero — the explorer keeps displaying it, and on $f(x)=x^2$ at $a=" +
      A +
      "$ with $h=0.1$ it is exactly $" +
      RESIDUAL_AT_A.toFixed(2) +
      "$. What has changed is the **comparison**: $E(h)$ has become small relative to $h$, and $E(h)/h\\to0$. “Straight at this magnification” and “straight” are different claims.",
  },
  checkpoints: [
    {
      id: "did-curvature-go",
      prompt:
        "A curve is magnified about a point until it appears perfectly straight. Has the curvature gone away?",
      answer:
        "No. The residual $E(h)$ is still nonzero — the explorer keeps displaying it, and on $f(x)=x^2$ at $a=" +
        A +
        "$ with $h=0.1$ it is exactly $" +
        RESIDUAL_AT_A.toFixed(2) +
        "$. What has changed is the **comparison**: $E(h)$ has become small relative to $h$, and $E(h)/h\\to0$. “Straight at this magnification” and “straight” are different claims.",
    },
  ],

  exercises: [
    /* ---- check ------------------------------------------------------- */
    {
      id: "der-residual-remains",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "check",
      prompt:
        "You magnify a curved graph about a point until the curve looks perfectly straight in the window.",
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt:
              "Is the gap between the curve and the tangent now zero?",
            choices: [
              "Yes — it has reached zero",
              "No — it is still nonzero",
              "It was never nonzero to begin with",
              "Cannot be determined without a formula",
            ],
            correctChoice: 1,
            explanation:
              "No. The residual $E(h)$ is nonzero at every magnification for a genuinely curved function.",
          },
          {
            kind: "multiple-choice",
            prompt: "So what has changed as the window narrowed?",
            choices: [
              "$E(h)$ has become small **compared to** $h$ — the ratio $E(h)/h$ tends to 0",
              "$E(h)$ has reached zero, so the curve is straight there",
              "$E(h)$ is unchanged; only the drawing looks different",
              "$h$ has reached zero",
            ],
            correctChoice: 0,
            explanation:
              "The residual shrinks, but what matters is that it shrinks **faster** than the step. That comparison is the whole definition of differentiability.",
          },
        ],
      },
    },
    {
      id: "der-identify-derivative",
      type: "multiple-choice",
      tier: "check",
      prompt: "For $f(x) = x^3 - 4x$, which expression is $f'(x)$?",
      choices: [
        "$3x^2 - 4$",
        "$3x^2 - 4x$",
        "$x^2 - 4$",
        "$\\tfrac{1}{4}x^4 - 2x^2$",
      ],
      correctChoice: 0,
      explanation:
        "Each power drops by one and brings its exponent down; the linear term contributes its own coefficient. The second choice forgets to differentiate the linear term, the third loses the coefficient on $x^2$, and the fourth is an *anti*derivative — differentiation run backwards.",
    },

    /* ---- drill ------------------------------------------------------- */
    {
      id: "der-from-definition-fresh",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "Compute $f'(2)$ for $f(x)=x^3$ **from the definition** — not from a rule.",
      config: {
        steps: [
          {
            kind: "text",
            prompt:
              "Expand and simplify $\\dfrac{(2+h)^3 - 8}{h}$ for $h\\neq0$. (Write it as a polynomial in $h$.)",
            accept: [
              "12+6h+h^2",
              "12 + 6h + h^2",
              "h^2+6h+12",
              "h^2 + 6h + 12",
              "12+6h+h2",
            ],
            explanation:
              "$(2+h)^3 = 8 + 12h + 6h^2 + h^3$, so the quotient is $12 + 6h + h^2$ — valid for every $h\\neq0$, which is exactly the region the limit consults.",
          },
          {
            kind: "numeric",
            prompt: "Now read off the forced value as $h\\to0$.",
            expected: FRESH_SLOPE,
            tolerance: 1e-9,
            explanation:
              "$12$. Note that the simplified expression is a *second* function agreeing with the first off $h=0$; the original is still $0/0$ there.",
          },
        ],
      },
    },
    {
      id: "der-linearize-estimate",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "Use the linear approximation to $f(x)=x^3$ at $a=1$ to estimate $f(1.2)$.",
      config: {
        steps: [
          {
            kind: "numeric",
            prompt: "First: what is $f'(1)$?",
            expected: EST_SLOPE,
            tolerance: 1e-9,
            explanation: "$3\\cdot1^2 = 3$.",
          },
          {
            kind: "numeric",
            prompt: "Now the estimate $f(1) + f'(1)\\cdot 0.2$.",
            expected: EST_VALUE,
            tolerance: 1e-6,
            explanation:
              "$1 + 3(0.2) = " +
              EST_VALUE.toFixed(1) +
              "$. The true value is $" +
              EST_TRUE.toFixed(3) +
              "$, so the estimate is low — which is what a curve bending upwards away from its tangent must do.",
          },
        ],
      },
    },
    {
      id: "der-three-names",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "A tank's depth is $d(t)$ metres after $t$ seconds, and $d'(30) = 0.4$.",
      config: {
        steps: [
          {
            kind: "text",
            prompt: "Asked for a **rate**: how fast is the depth rising at $t=30$? Give the units.",
            accept: [
              "0.4 m/s",
              "0.4 metres per second",
              "0.4 meters per second",
              "0.4m/s",
              "0.4 m per second",
            ],
            explanation:
              "$0.4$ metres per second — output units per input unit, read straight off the derivative.",
          },
          {
            kind: "text",
            prompt:
              "Asked for a **slope**: what is the slope of the tangent to the graph of $d$ at $t=30$?",
            accept: ["0.4", "0.4 m/s", ".4"],
            explanation:
              "The same number. Rise over run on that graph *is* metres per second, because that is what the axes are.",
          },
          {
            kind: "numeric",
            prompt:
              "Asked for a **prediction**: estimate the depth at $t=32$ if $d(30)=1.5$.",
            expected: 1.5 + 0.4 * 2,
            tolerance: 1e-9,
            explanation:
              "$1.5 + 0.4(2) = 2.3$ metres. One number, three questions.",
          },
        ],
      },
    },
    {
      id: "der-tangent-crosses",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "On $y = x^3$, the school rule “a tangent touches at one point and does not cross” fails.",
      config: {
        steps: [
          {
            kind: "numeric",
            prompt:
              "At which $x$ does the tangent cross the curve **at the point of tangency itself**?",
            expected: 0,
            tolerance: 1e-9,
            explanation:
              "At the inflection point $x=0$. The tangent there is the $x$-axis, and $x^3$ passes straight through it.",
          },
          {
            kind: "numeric",
            prompt:
              "The tangent at $x=1$ meets the curve again somewhere else. Where?",
            expected: -2,
            tolerance: 1e-9,
            explanation:
              "$x^3 - 3x + 2 = (x-1)^2(x+2)$, so it meets again at $x=-2$. A tangent meeting the curve elsewhere is *ordinary*, not a defect — tangency is a local condition.",
          },
        ],
      },
    },
    {
      id: "der-differentiable-definition",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "For each function, decide whether it is differentiable at the marked point. Type **yes** or **no**.",
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt: "$f(x) = \\lvert x - 3\\rvert$ at $x=3$.",
            choices: [
              "Yes — differentiable there",
              "No — a corner, with two different one-sided slopes",
              "No — the function isn't even continuous there",
              "Cannot be determined without a formula",
            ],
            correctChoice: 1,
            explanation:
              "No — a corner. Magnify and the two sides stay lines of slope $-1$ and $+1$; no single line appears.",
          },
          {
            kind: "multiple-choice",
            prompt: "$g(x) = x\\lvert x\\rvert$ at $x=0$.",
            choices: [
              "Yes — both one-sided slopes tend to the same value",
              "No — any absolute value creates a corner",
              "No — the two pieces disagree at $x=0$",
              "Cannot be determined without a formula",
            ],
            correctChoice: 0,
            explanation:
              "Yes, and it is worth the surprise: $g(x)=x^2$ for $x\\ge0$ and $-x^2$ for $x<0$, so both one-sided quotients tend to $0$. An absolute value inside an expression does not automatically make a corner.",
          },
          {
            kind: "multiple-choice",
            prompt:
              "$p(x) = x^2$ for $x<1$ and $p(x)=2x-1$ for $x\\ge1$, at $x=1$.",
            choices: [
              "Yes — the values and the one-sided slopes both agree",
              "No — any piecewise definition breaks differentiability",
              "Yes, but only because the values happen to agree",
              "No — the one-sided slopes disagree",
            ],
            correctChoice: 0,
            explanation:
              "Yes. The values agree at $1$ (both give $1$) and so do the one-sided slopes (both give $2$) — the pieces join smoothly, so the magnified picture is one line.",
          },
        ],
      },
    },

    /* ---- transfer ---------------------------------------------------- */
    {
      // The lesson's only E4 claim: an open, predicate-graded construction on
      // `construct-in-explorer`, whose ceiling is E4. Any two distinct finite
      // slopes describe a corner.
      id: "der-corner-slopes",
      type: "custom",
      capabilityId: CONSTRUCT_IN_EXPLORER_ID,
      tier: "transfer",
      prompt:
        "Describe a function that is **continuous** at $x=2$ but **not differentiable** there, by giving its two one-sided slopes at that point. Any pair that does the job is accepted.",
      config: {
        target: "vector2",
        check: { kind: "corner-slopes" },
        tolerance: 1e-9,
        reveal:
          "Any two finite slopes that **differ** works. Continuity only asks that the two pieces meet; differentiability asks that they leave at the same rate, and a corner is exactly the case where they do not — so no single line survives the magnification.",
        hint: "Equal slopes describe a point that *is* differentiable — the two pieces join smoothly there. And a slope that is not a finite number is not a one-sided slope at all.",
      },
    },
    {
      id: "der-applied-transfer",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt:
        "A tank is filling. $V(t)$ is its volume in litres after $t$ minutes, and the graph of $V$ **bends upward** — the filling is speeding up. At $t=10$, $V=80$ and $V'=6$.",
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt: "What are the units of $V'(10)$?",
            choices: [
              "Litres per minute",
              "Minutes per litre",
              "Litres",
              "Litres per minute squared",
            ],
            correctChoice: 0,
            explanation: "Output units per input unit: litres per minute.",
          },
          {
            kind: "multiple-choice",
            prompt:
              "What does the tangent line at $t=10$ mean physically?",
            choices: [
              "The tank filling at a constant rate, forever",
              "The tank's actual volume at every later time",
              "The fastest the tank could possibly fill",
              "A rate that itself keeps speeding up",
            ],
            correctChoice: 0,
            explanation:
              "It is the tank filling at a *constant* 6 litres per minute — the volume the tank would reach if the rate stopped changing at that instant.",
          },
          {
            kind: "numeric",
            prompt: "Estimate $V(12)$ using that line.",
            expected: 80 + 6 * 2,
            tolerance: 1e-9,
            explanation: "$80 + 6(2) = 92$ litres.",
          },
          {
            kind: "multiple-choice",
            prompt:
              "The graph bends upward. Is your estimate too high, too low, or exact?",
            choices: [
              "Too low — the curve pulls away above the tangent",
              "Too high — the curve falls below the tangent",
              "Exact — the tangent passes through the curve",
              "Cannot be decided without more information",
            ],
            correctChoice: 0,
            explanation:
              "Bending upward means the rate is still increasing, so the true volume outruns the constant-rate line: the estimate is **low**. The residual $E(h)$ has a sign, and the curvature is what fixes it — shown once in this lesson, never drilled.",
          },
        ],
      },
    },
  ],

  keyTakeaway:
    "Zoom in far enough and a smooth curve is a line. The derivative is that line — which is why a rate, a slope, and a prediction are one number and not three. And the tangent is singled out not by touching the curve once, but by having an error that shrinks faster than the step.",

  structuredSummary: {
    coreMentalModel:
      "Magnify a smooth curve and it becomes a line; the derivative is that line's slope.",
    definitionsIntroduced: [
      "The derivative at a point (limit of difference quotients)",
      "Local linearity ($f(a+h)=f(a)+f'(a)h+E(h)$ with $E(h)/h\\to0$)",
      "The tangent line, by error decay rather than by contact",
    ],
    mainResult:
      "Rate, slope, and best linear approximation are one object read three ways.",
    representationsConnected: [
      "A magnified graph, with the residual drawn",
      "The secant table settling on one slope",
      "$f(a+h)=f(a)+f'(a)h+E(h)$",
    ],
    commonMistake:
      "Believing a zoomed-in curve *is* straight, or that a tangent must touch at one point and not cross.",
    canonicalExample: "$\\frac{(2+h)^3-8}{h} = 12+6h+h^2$ for $h\\neq0$, forced to $12$.",
    oneProblemWorthRemembering:
      "$y=x^3$ at the origin: the tangent crosses at the point of tangency.",
    whatThisUnlocksNext:
      "The Fundamental Theorem, which spends $E(h)/h\\to0$ in its telescoping step.",
  },

  exampleId: "ex-parabola",
};
