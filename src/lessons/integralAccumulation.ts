import type { LessonDefinition } from "./types";
import { CONSTRUCT_IN_EXPLORER_ID, EXERCISE_SEQUENCE_ID } from "./capabilities";
import { EX_DRIVE, parabolaRightSum, riemannSum } from "../math";

/**
 * Lesson: "The integral as accumulation" — applied mathematics L3, unit
 * `calculus-foundations`, Package A slice A3.
 *
 * Built on the PASS contract
 * `docs/courses/applied-mathematics/lessons/03-integral-accumulation/insight.md`.
 *
 * Primary insight: an integral is the **total of a rate**. If the rate were
 * constant the total would be rate × duration; because it varies, chop the
 * interval into pieces short enough that the rate is nearly constant, multiply on
 * each piece, add, and refine without bound. Each term is a **product with
 * units** — (m/s)(s) = m — not a shape, so the total carries the units of the
 * quantity accumulated, it is signed, and it is unchanged if the graph is redrawn
 * at another scale.
 *
 * **The hard scope exclusion (package ledger check P1): no antiderivative.**
 * Not in prose, not in a caption, not in an explorer readout, not in a feedback
 * string. L4's entire value is that the connection between the two operations is
 * *discovered*; naming it here spends the package's central payoff for nothing.
 * `noAntiderivative.test.ts` enforces this over everything a learner can read.
 *
 * Evidence discipline, carried forward from L1's review and applied before any
 * code was written: `exercise-sequence` is capped at **E3** and `multiple-choice`
 * at **E2**, so the lesson's single E4 claim rests on its one genuinely open
 * construction (`int-signed-transfer`, on `construct-in-explorer`). The contract's
 * three E4 claims were reconciled to that ceiling rather than the ceiling being
 * bent to the contract.
 *
 * Deliberate non-dependency: this lesson does **not** use the derivative. L2
 * precedes it in the spine for L4's sake, not because L3 needs it.
 */

/* ---------------------------------------------------------------- numbers */

/** The hand-checkable case, computed rather than asserted. */
const S_4 = parabolaRightSum(4);
const S_100 = parabolaRightSum(100);
const LIMIT = 8 / 3;

/**
 * The fresh table item's rate: a flow measured every 2 minutes, decreasing
 * throughout, so the right-endpoint estimate must come in **low** — and the
 * learner can say why without being told.
 */
const TABLE_RATES = [12, 9, 7, 6, 5.5] as const;
const TABLE_STEP = 2;
const TABLE_RIGHT_SUM =
  TABLE_STEP * TABLE_RATES.slice(1).reduce((s, r) => s + r, 0);
const TABLE_LEFT_SUM =
  TABLE_STEP * TABLE_RATES.slice(0, -1).reduce((s, r) => s + r, 0);

/**
 * The clip's drive trace, described by measurement rather than by assertion.
 *
 * Every number below comes from the **summation** route — `riemannSum`, at a fine
 * partition. `EX_DRIVE` declares a closed-form antiderivative and this module
 * never reads it (P1/P4); the prose would otherwise be quoting the very shortcut
 * the lesson exists to withhold.
 */
const scan = (from: number, to: number, pick: (t: number) => number): number => {
  let best = from;
  for (let i = 0; i <= 2000; i += 1) {
    const t = from + ((to - from) * i) / 2000;
    if (pick(t) > pick(best)) best = t;
  }
  return best;
};
const DRIVE_END = EX_DRIVE.domain[1];
/** Where the rate peaks — and so where the total climbs fastest. */
const RATE_PEAK_T = scan(0, DRIVE_END, EX_DRIVE.f);
/** Where the rate crosses zero — and so where the total peaks. */
const TOTAL_PEAK_T = scan(0, DRIVE_END, (t) => riemannSum(EX_DRIVE.f, 0, t, 400, "mid"));
const TOTAL_PEAK = riemannSum(EX_DRIVE.f, 0, TOTAL_PEAK_T, 2000, "mid");
const TOTAL_FINAL = riemannSum(EX_DRIVE.f, 0, DRIVE_END, 2000, "mid");
const round1 = (x: number) => Number(x.toFixed(1));

/** The signed construction's piece length, in seconds. */
const SIGNED_HALF = 3;

/** The "same machine" item: a constant 5 A for 4 s, then a constant 60 W for 4 s. */
const CHARGE = 5 * 4;
const ENERGY = 60 * 4;

/** Sanity: the prose's numbers are the code's numbers. */
if (Math.abs(riemannSum((x) => x * x, 0, 2, 4, "right") - S_4) > 1e-9) {
  throw new Error(
    "integralAccumulation: the closed form and the summation route disagree at n = 4.",
  );
}
if (!(S_100 > LIMIT && S_4 > S_100)) {
  throw new Error(
    "integralAccumulation: the right sums must decrease towards 8/3 on a rising rate.",
  );
}
if (!(TOTAL_PEAK > 0 && TOTAL_FINAL < 0 && TOTAL_FINAL < TOTAL_PEAK)) {
  throw new Error(
    "integralAccumulation: the drive trace must climb and then end below its own maximum.",
  );
}
if (!(RATE_PEAK_T < TOTAL_PEAK_T)) {
  throw new Error(
    "integralAccumulation: the rate must peak before the total does, or the running-total item is wrong.",
  );
}
if (!(TABLE_RIGHT_SUM < TABLE_LEFT_SUM)) {
  throw new Error(
    "integralAccumulation: the table item assumes a DECREASING rate, so that the right sum is the low estimate.",
  );
}

export const integralAccumulationLesson: LessonDefinition = {
  id: "integral-accumulation",
  title: "The Integral as Accumulation",
  subtitle: "Not an area — the total of a rate, with the units to prove it",
  learningObjectives: [
    "Say what an integral computes in an unfamiliar setting, with units, before computing anything",
    "Estimate a total from a partition, and say whether the estimate is high or low and why",
    "Compute an integral from the Riemann sum alone",
    "Predict the sign of a total, and explain a total that ends below its own maximum",
    "Read a running-total graph against the rate graph that produced it",
    "Say why redrawing the graph at another scale does not change the answer",
  ],
  motivatingQuestion:
    "You have a complete record of how fast the car was going at every instant. The odometer was covered up. How far did it go — and what could you possibly multiply, when the speed never held still?",

  guidedSceneId: "integral-accumulation",
  explorationId: "integral-accumulation",

  route: [
    { kind: "motivate" },
    { kind: "visual", heading: "Chop, multiply, add, refine" },
    { kind: "section", sectionId: "total-not-area" },
    { kind: "formal", formalId: "def-riemann-sum" },
    { kind: "section", sectionId: "refine" },
    { kind: "formal", formalId: "def-definite-integral" },
    { kind: "check", checkpointId: "stretched-axis" },
    { kind: "section", sectionId: "signed" },
    { kind: "section", sectionId: "running-total" },
    { kind: "formal", formalId: "def-running-total" },
    { kind: "explore", tocLabel: "Chop it yourself" },
    { kind: "practice" },
    { kind: "summary" },
  ],

  sections: [
    {
      id: "total-not-area",
      title: "If the rate held still, you would just multiply",
      body: "A car at a steady $20$ m/s for $30$ s goes $600$ m. Nobody calls that an area. It is a **product**: $(20\\ \\text{m/s})(30\\ \\text{s}) = 600\\ \\text{m}$, and the units do the bookkeeping — the seconds cancel and metres come out.\n\nThe rate does not hold still. But Lesson 1 gave us the one thing needed: a continuous rate, over a **short enough** piece, is nearly constant. So chop the interval into pieces, treat the rate as constant on each, multiply, and add.\n\nEvery term in that sum is a product with units. $f(x_i^*)$ is a rate; $\\Delta x_i$ is a duration; their product is an amount of the accumulated quantity. Nothing in that sentence mentions a shape.",
      equation:
        "\\sum_{i=1}^{n} f(x_i^*)\\,\\Delta x_i \\qquad \\text{(rate)}\\times\\text{(duration)} = \\text{amount}",
      observation:
        "Draw it and you get rectangles, and the rectangles have areas. That is a *consequence* of drawing it, not what the sum is.",
      layers: [
        {
          kind: "trap",
          title: "“Area under the curve” is a picture, not a definition",
          body: "The phrase is not wrong so much as over-specific, and it costs three things immediately. Areas are non-negative, and totals are not. Areas are in square units, and totals are in the units of the accumulated quantity — metres, coulombs, joules. And an area on a page changes when you redraw the axes at another scale, while the total does not. Every one of those is a place the picture and the mathematics come apart, and all three appear in this lesson's exercises.",
        },
      ],
    },
    {
      id: "refine",
      title: "Chopping finer, without bound",
      body: "Any single partition gives an estimate, not an answer. A coarse one can be badly wrong — try $n = 1$ in the explorer and see how wrong.\n\nSo refine. Double the number of pieces, and double again. The sums settle, and what they settle on is *forced* in exactly the sense Lesson 1 established: the value the neighbours leave no room for. That forced value is the integral.\n\nOn a **monotone** stretch you get more than a settling: the left-endpoint sum and the right-endpoint sum sit on opposite sides of the answer, so the pair **brackets** it. Refining narrows the bracket, and you know the answer to within a width you can measure. Note the restriction — on a rate that rises and then falls, left and right sums can both land on the same side, and the bracket is worthless.",
      equation:
        "\\int_a^b f(x)\\,dx \\;=\\; \\lim_{\\text{mesh}\\to0}\\ \\sum_{i=1}^{n} f(x_i^*)\\,\\Delta x_i",
      observation:
        "For $f(x)=x^2$ on $[0,2]$ the right sums are $\\tfrac43\\cdot\\tfrac{(n+1)(2n+1)}{n^2}$, and the left and right sums differ by exactly $8/n$. The answer is inside a window you can shrink at will.",
      layers: [
        {
          kind: "math-note",
          title: "Which sample point?",
          body: "$x_i^*$ can be the left end, the right end, the midpoint, or anywhere in the piece — the limit is the same for a continuous integrand, which is what makes the notation legitimate. The choice only changes how fast you get there. It is also why “the mesh goes to zero” rather than “$n\\to\\infty$”: the pieces need not be equal, and a partition with one stubbornly wide piece does not refine no matter how many others you add.",
        },
      ],
    },
    {
      id: "signed",
      title: "The total is signed, and it can end below its own maximum",
      body:
        `Reverse the car, and the rate goes negative. A negative rate times a positive duration is a negative contribution, and the total comes down. The odometer analogy breaks here — a real odometer only counts up — and it is worth noticing exactly where an analogy stops being true.\n\nThis is why the picture misleads. An area model says the shaded region below the axis is still area, so the total keeps growing. The product model says the contribution is negative, so the total falls. The second is right, and it is right for a physical reason: you went backwards.\n\nOne consequence is worth holding on to, because it is impossible under the area model: **a total can end below its own maximum.** The drive in the clip climbs to about $${round1(TOTAL_PEAK)}$ m and finishes at about $${round1(TOTAL_FINAL)}$ m.`,
      observation:
        "Displacement, not distance travelled. Charge delivered, not charge moved. The sign is information, and discarding it discards a physical fact.",
    },
    {
      id: "running-total",
      title: "The total as a function: the second instrument",
      body: "So far the interval was fixed and the answer was one number. Let the right-hand end move instead, and the total becomes a **function** of where you stopped:\n\nThat is the odometer to the speedometer's rate. Watch the two together in the clip and something is hard not to notice: the total climbs fastest exactly where the rate is highest, it is flat where the rate is zero, and it falls where the rate is negative.\n\nRecord the observation. Do not explain it yet — the explanation is the next lesson, and it is worth arriving at rather than being handed.",
      equation: "A(x) \\;=\\; \\int_a^x f(t)\\,dt",
      layers: [
        {
          kind: "connection",
          title: "The same integral, four meters",
          body: "Nothing in the construction knows what the axes mean. Put current against time on them and the sum reads **charge** in coulombs. Put power against time and it reads **energy** in joules. Put linear density against length and it reads **mass**. One machine; the axes decide what you computed, and the units are how you check that you computed the right thing. That reuse is why this construction reappears in Fourier coefficients, in transforms, and in line integrals later in the course — the same kind of integral, over different things.",
        },
      ],
    },
  ],

  formalBlocks: [
    {
      id: "def-riemann-sum",
      kind: "definition",
      label: "Partition, mesh, and the Riemann sum",
      statement:
        "A **partition** of $[a,b]$ is points $a=x_0<x_1<\\dots<x_n=b$; its **mesh** is the widest piece, $\\max_i \\Delta x_i$. Choosing a **sample point** $x_i^*$ in each piece gives the Riemann sum $\\sum_{i=1}^n f(x_i^*)\\,\\Delta x_i$.",
      interpretation:
        "The pieces need not be equal. The mesh, not $n$, is what has to go to zero — adding a thousand tiny pieces beside one wide one refines nothing.",
      visibility: "visible",
    },
    {
      id: "def-definite-integral",
      kind: "definition",
      label: "The definite integral",
      statement:
        "$\\displaystyle\\int_a^b f(x)\\,dx$ is the value the Riemann sums are forced to as the mesh tends to $0$, when every choice of partition and sample point gives the same value.",
      interpretation:
        "For a continuous $f$ on a closed bounded interval that value always exists — declared here, not proved. The units are those of $f$ multiplied by those of $x$, which is the only reliable way to know what you have computed.",
      visibility: "visible",
    },
    {
      id: "def-running-total",
      kind: "definition",
      label: "The running total",
      statement:
        "$A(x) = \\displaystyle\\int_a^x f(t)\\,dt$ — the total accumulated from $a$ up to $x$. The dummy variable $t$ is renamed because $x$ is already spoken for as the endpoint.",
      interpretation:
        "A function built out of an integral, with the same units as the integral itself. It is the object the next lesson differentiates.",
      visibility: "revealed",
    },
  ],

  checkpoint: {
    prompt:
      "The same journey is plotted again with the time axis stretched to twice the width. The shaded region on the page is now twice as large. Did the car travel twice as far?",
    answer:
      "No. Each rectangle's **width** now represents the same duration drawn wider, so the number of seconds it stands for has not changed — and the product (rate)(duration) is unchanged. The area on the page was never the invariant; the total was. This is exactly why the units matter: $(\\text{m/s})(\\text{s})$ gives metres whatever the drawing looks like, while “square centimetres of ink” is a fact about the page.",
  },
  checkpoints: [
    {
      id: "stretched-axis",
      prompt:
        "The same journey is plotted again with the time axis stretched to twice the width. The shaded region on the page is now twice as large. Did the car travel twice as far?",
      answer:
        "No. Each rectangle's **width** now represents the same duration drawn wider, so the number of seconds it stands for has not changed — and the product (rate)(duration) is unchanged. The area on the page was never the invariant; the total was. This is exactly why the units matter: $(\\text{m/s})(\\text{s})$ gives metres whatever the drawing looks like, while “square centimetres of ink” is a fact about the page.",
    },
  ],

  exercises: [
    /* ---- check ------------------------------------------------------- */
    {
      // The abstraction return: axes and nothing else. No journey, no story.
      id: "int-units-fresh",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "check",
      prompt:
        "A graph has **hours** on the horizontal axis and **millimetres per hour** on the vertical axis. Nothing else is given.",
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt:
              "What quantity does the integral of this graph compute?",
            choices: [
              "Total rainfall",
              "The rainfall rate at the end",
              "The area under the curve, in square millimetres",
              "The average rate over the interval",
            ],
            correctChoice: 0,
            explanation:
              "The accumulated quantity — how much rain fell in total. The vertical axis is a rate of rainfall, so its total is rainfall.",
          },
          {
            kind: "multiple-choice",
            prompt: "In what units?",
            choices: ["mm", "mm/h", "mm²", "h"],
            correctChoice: 0,
            explanation:
              "$(\\text{mm/h})(\\text{h}) = \\text{mm}$. The hours cancel. Read the units off the axes and the product tells you what you computed — no story required, and no square units anywhere.",
          },
        ],
      },
    },
    {
      id: "int-bracket-fails",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "For which of these rate graphs on $[0, 4]$ do the left-endpoint and right-endpoint sums **fail** to sit on opposite sides of the true total?",
      choices: [
        "A rate that climbs to a peak in the middle and falls back",
        "A rate that increases steadily throughout",
        "A rate that decreases steadily throughout",
        "A constant rate",
      ],
      correctChoice: 0,
      explanation:
        "Bracketing needs the rate to be **monotone**. When it rises and then falls, some pieces have their left end higher and others their right end higher, so both sums can land on the same side of the answer and the pair guarantees nothing. On the other three the rate never turns: increasing puts left below and right above, decreasing does the reverse, and a constant rate makes them equal — a degenerate but perfectly valid bracket of width zero.",
    },

    /* ---- drill ------------------------------------------------------- */
    {
      id: "int-estimate-table",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "A tank drains and the flow is measured every 2 minutes, in litres per minute:\n\n| $t$ (min) | 0 | 2 | 4 | 6 | 8 |\n| --- | --- | --- | --- | --- | --- |\n| flow (L/min) | 12 | 9 | 7 | 6 | 5.5 |\n\nThere is no graph — only these readings.",
      config: {
        steps: [
          {
            kind: "numeric",
            prompt:
              "Estimate the total volume drained over the 8 minutes using the **right-hand** reading on each 2-minute piece. Give litres.",
            expected: TABLE_RIGHT_SUM,
            tolerance: 1e-9,
            explanation:
              `$2(9 + 7 + 6 + 5.5) = ${TABLE_RIGHT_SUM}$ litres. Each term is (L/min)(min) = L — four products, added.`,
          },
          {
            kind: "multiple-choice",
            prompt: "Is that estimate too high or too low?",
            choices: ["Too low", "Too high", "Exact", "Cannot be determined"],
            correctChoice: 0,
            explanation:
              `Too low. The left-hand estimate is $2(12 + 9 + 7 + 6) = ${TABLE_LEFT_SUM}$ litres, and the answer is between the two.`,
          },
          {
            kind: "multiple-choice",
            prompt:
              "Why can you be sure which way it errs, without knowing the true value?",
            choices: [
              "The flow only ever decreases over the interval",
              "The flow only ever increases over the interval",
              "The pieces are all the same width",
              "It cannot be known without the true value",
            ],
            correctChoice: 0,
            explanation:
              "Because the flow only ever **decreases**. On each piece the right-hand reading is the smallest value there, so every rectangle sits under the true contribution. Monotonicity is what makes the direction of the error knowable; on a flow that rose and then fell you could not say.",
          },
        ],
      },
    },
    {
      id: "int-parabola-from-sum",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "Compute $\\displaystyle\\int_0^2 x^2\\,dx$ from the sum alone. Cutting $[0,2]$ into $n$ equal pieces and sampling at the right-hand end gives $S_n = \\dfrac{4}{3}\\cdot\\dfrac{(n+1)(2n+1)}{n^2}$.",
      config: {
        steps: [
          {
            kind: "numeric",
            prompt: "First, evaluate $S_4$.",
            expected: S_4,
            tolerance: 1e-6,
            explanation:
              `$\\frac43\\cdot\\frac{5\\cdot9}{16} = ${S_4}$. Four rectangles, and already not a bad estimate.`,
          },
          {
            kind: "numeric",
            prompt: "Now $S_{100}$, to three decimal places.",
            expected: S_100,
            tolerance: 5e-3,
            explanation:
              `$\\frac43\\cdot\\frac{101\\cdot201}{10\\,000} = ${S_100.toFixed(4)}$. It is coming down, and the left sums are coming up to meet it — the two differ by exactly $8/n$.`,
          },
          {
            kind: "numeric",
            prompt:
              "What value are the sums forced to as $n$ grows without bound? (Three decimal places is enough.)",
            expected: LIMIT,
            // Loose enough to accept a learner who rounds 8/3, tight enough to
            // reject S_100 — the near-miss the previous step just produced.
            tolerance: 5e-3,
            explanation:
              "$\\frac43\\cdot\\frac{(n+1)(2n+1)}{n^2} = \\frac43\\left(2 + \\frac{3}{n} + \\frac{1}{n^2}\\right) \\to \\frac83$. The bracket has width $8/n$, which you can make as small as you like, so no other value survives.",
          },
        ],
      },
    },
    {
      id: "int-read-running-total",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        `The clip's drive trace runs for ${DRIVE_END} s. Its speed starts at $0$, climbs to a maximum at about $t = ${round1(RATE_PEAK_T)}$ s, falls back through zero at about $t = ${round1(TOTAL_PEAK_T)}$ s, and is negative afterwards. Answer about the **running total** $A(t)$, the distance covered so far.`,
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt: "At $t = 1$ s, is $A$ rising, flat, or falling?",
            choices: ["Rising", "Flat", "Falling"],
            correctChoice: 0,
            explanation: "The rate is positive there, so the total is still being added to.",
          },
          {
            kind: "multiple-choice",
            prompt: `At $t = ${round1(TOTAL_PEAK_T)}$ s, is $A$ rising, flat, or falling?`,
            choices: ["Rising", "Flat — this is where $A$ peaks", "Falling"],
            correctChoice: 1,
            explanation:
              "The rate is zero there, so nothing is being added. This is where $A$ reaches its maximum.",
          },
          {
            kind: "multiple-choice",
            prompt: "At $t = 9$ s, is $A$ rising, flat, or falling?",
            choices: ["Rising", "Flat", "Falling"],
            correctChoice: 2,
            explanation:
              "The rate is negative, so each piece contributes a negative amount and the total comes down — which is how it ends below its own maximum.",
          },
          {
            kind: "multiple-choice",
            prompt:
              "At roughly what time is $A$ climbing **fastest**?",
            choices: [
              `About ${round1(RATE_PEAK_T)} s — where the rate itself peaks`,
              "$t = 0$ s — the very start",
              `About ${round1(TOTAL_PEAK_T)} s — where the total peaks`,
              `${DRIVE_END} s — the very end`,
            ],
            correctChoice: 0,
            explanation:
              "At about $t = 2.7$ s — exactly where the *rate* is at its maximum. Record that: the total climbs fastest where the rate is highest. It is not a coincidence, and it is not explained here.",
          },
        ],
      },
    },

    /* ---- transfer ---------------------------------------------------- */
    {
      /**
       * The lesson's only E4 claim: an open, predicate-graded construction on
       * `construct-in-explorer`, whose ceiling is E4. Infinitely many pairs work,
       * and the area model predicts that none does.
       */
      id: "int-signed-transfer",
      type: "custom",
      capabilityId: CONSTRUCT_IN_EXPLORER_ID,
      tier: "transfer",
      prompt:
        `Current flows into a capacitor at one constant rate for ${SIGNED_HALF} s, then at a different constant rate for the next ${SIGNED_HALF} s. Choose the two currents, in amps, so that the **charge at the end is below the largest charge the capacitor ever held**. Any pair that does it is accepted.`,
      config: {
        target: "vector2",
        check: { kind: "signed-total", halfDuration: SIGNED_HALF },
        tolerance: 1e-9,
        reveal:
          "Any positive first current with a second current negative enough to more than undo it. The total must climb — otherwise there is no maximum to end below — and then come down, which needs the rate to change sign. An area model says this is impossible, because area does not subtract; the product model gets it immediately, because a negative rate times a positive duration is a negative amount.",
        hint: "Two things have to happen and both are needed: the charge must first go **up**, and it must then end **lower** than it got. A pair that only ever adds cannot do the second; a pair that never adds has no maximum to fall below.",
      },
    },
    {
      id: "int-scale-invariance",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt:
        "The same rate graph is redrawn with the horizontal axis stretched to three times its width. The shaded region on the page is three times bigger.",
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt: "What happens to the value of the integral?",
            choices: [
              "Nothing — it is unchanged",
              "It is three times larger",
              "It is a third of what it was",
              "It cannot be determined from the information given",
            ],
            correctChoice: 0,
            explanation:
              "Unchanged. Redrawing changes the page, not the journey.",
          },
          {
            kind: "multiple-choice",
            prompt:
              "Which quantity in each term $f(x_i^*)\\,\\Delta x_i$ is unchanged by the redrawing — the rate, or the width?",
            choices: [
              "Both — neither is a length on the page",
              "Only the rate",
              "Only the width",
              "Neither — both scale with the redrawing",
            ],
            correctChoice: 0,
            explanation:
              "**Both.** $\\Delta x_i$ is a number of seconds, not a number of centimetres of paper; drawing it wider does not make it more seconds. The rate at each sample point is likewise a physical value. Every term is unchanged, so the sum is, so the limit is. The ink on the page is the only thing that scaled — which is precisely why an area on the page was never the right invariant to name.",
          },
        ],
      },
    },
    {
      id: "int-same-machine",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt:
        "The same construction, read on two different instruments. Give units where they are asked for.",
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt:
              "A current of a steady $5$ A flows for $4$ s. Integrating current against time gives what quantity, in what units?",
            choices: [
              "Charge, in coulombs",
              "Charge, in amps",
              "Power, in watts",
              "Energy, in joules",
            ],
            correctChoice: 0,
            explanation: "$(\\text{A})(\\text{s}) = \\text{C}$: charge, in coulombs.",
          },
          {
            kind: "numeric",
            prompt: "How much of it?",
            expected: CHARGE,
            tolerance: 1e-9,
            explanation: `$(5\\ \\text{A})(4\\ \\text{s}) = ${CHARGE}\\ \\text{C}$ — a constant rate, so one rectangle does it.`,
          },
          {
            kind: "multiple-choice",
            prompt:
              "A device draws a steady $60$ W for $4$ s. Integrating power against time gives what quantity, in what units?",
            choices: [
              "Energy, in joules",
              "Power, in watts",
              "Charge, in coulombs",
              "Energy, in watt-hours",
            ],
            correctChoice: 0,
            explanation: "$(\\text{W})(\\text{s}) = \\text{J}$: energy, in joules.",
          },
          {
            kind: "numeric",
            prompt: "How much of it?",
            expected: ENERGY,
            tolerance: 1e-9,
            explanation:
              `$(60\\ \\text{W})(4\\ \\text{s}) = ${ENERGY}\\ \\text{J}$. Identical arithmetic, identical construction — the axes are the only thing that changed, and they are what named the answer.`,
          },
        ],
      },
    },
  ],

  keyTakeaway:
    "An integral is a total, not an area. Chop, multiply, add, refine — and the units tell you what you have computed. One thing is left unexplained: the running total climbs fastest exactly where the rate is highest. That is not a coincidence, and it is the next lesson.",

  structuredSummary: {
    coreMentalModel:
      "An integral is the total of a rate: chop, multiply on each piece, add, refine.",
    definitionsIntroduced: [
      "Partition, mesh, and sample point",
      "The Riemann sum $\\sum f(x_i^*)\\,\\Delta x_i$",
      "The definite integral as the limit as the mesh tends to zero",
      "The running total $A(x)=\\int_a^x f$",
    ],
    mainResult:
      "Every term is a product with units, so the total is signed, carries the units of the accumulated quantity, and does not change when the graph is redrawn.",
    representationsConnected: [
      "A partitioned rate graph with per-rectangle product labels",
      "A table of sums against $n$",
      "$\\lim \\sum f(x_i^*)\\,\\Delta x_i$",
      "The odometer against the speedometer",
    ],
    commonMistake:
      "Treating “area under the curve” as the definition — which makes the total non-negative, puts it in square units, and makes it depend on how the axes were drawn.",
    canonicalExample:
      "$\\int_0^2 x^2 = \\tfrac83$, from $S_n = \\tfrac43\\cdot\\tfrac{(n+1)(2n+1)}{n^2}$ with a bracket of width $8/n$.",
    oneProblemWorthRemembering:
      `A drive that reverses: the total climbs to about $${round1(TOTAL_PEAK)}$ m and ends at about $${round1(TOTAL_FINAL)}$ m — below its own maximum.`,
    whatThisUnlocksNext:
      "Why the running total climbs fastest where the rate is highest.",
  },

  exampleId: "ex-drive",
};
