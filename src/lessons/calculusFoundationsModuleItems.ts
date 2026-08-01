/**
 * Class-A module-owned assessment items for the **`calculus-foundations`**
 * module (L1 limits-continuity, L2 derivative-local-linearity, L3
 * integral-accumulation, L4 fundamental-theorem) — the Gate 9 content for
 * `docs/courses/applied-mathematics/modules/calculus-foundations/assessment-plan.md`.
 *
 * These are NOT lesson exercises. Each discharges an obligation the four
 * lessons' mastery contracts explicitly deferred to the module (the seven
 * `mod-calcfound-*` D10/D12 rows), plus three dimensions no lesson owns at
 * all — D8 (method selection), D9 (transfer), D13 (error diagnosis) — and a
 * D11 timed set, added here because Gate 9's own rejection conditions name
 * "no method-selection items" and mastery-standard §4 makes D9/D13
 * module-mandatory.
 *
 * Evidence-integrity rules honored here (same as `structureModuleItems.ts`):
 * - multiple choice is never the decisive object — it appears only on the
 *   four D12 retention items, where recognition after a delay is exactly
 *   the measurement (E1, honestly, against contracts that request E3 — see
 *   the assessment plan's level notes; this is a deliberate downgrade, not
 *   an oversight);
 * - every mathematical object is PRODUCED and captured in full where the
 *   capability allows it;
 * - auto items are predicate- or exact-value-graded against hand-verified
 *   arithmetic, independently re-derived in `calculusFoundationsModuleItems.test.ts`
 *   via `src/math/calculus.ts`'s own `riemannSum`/`boundaryAwareDerivative`;
 * - written reasoning routes to human scoring with a versioned rubric — only
 *   ONE item here claims E5 (`mod-calcfound-mixed-ftc`), because nothing
 *   auto-graded reaches E5's capability ceiling for calculus-shaped content
 *   (`solution-set`/`elimination-solution` are linear-algebra-shaped);
 * - **fresh instances only**: no fixture below appears in L1–L4 (asserted by
 *   test). All five polynomial fixtures below are new.
 *
 * Scope guard: every fixture and answer is exact rational arithmetic (no
 * transcendental fixture), so a fresh-instance answer can be pinned exactly
 * rather than only to a numeric tolerance.
 */

import { CONSTRUCT_IN_EXPLORER_ID, MATRIX_ENTRY_ID, SELF_CHECK_ID } from "./capabilities";
import type { ExerciseDefinition } from "./types";

/* -------------------------------------------------------------------------- */
/* Canonical fresh fixtures (re-verified independently in the math test).      */
/* All polynomial rates, so every antiderivative and turn is exact.            */
/* -------------------------------------------------------------------------- */

/** r(t) = 3t² − 12t + 9 on [0,5]. Turn (min) at t = 2, r(2) = −3. */
export const MOD_EX_COOLANT = {
  f: (t: number) => 3 * t * t - 12 * t + 9,
  antiderivative: (t: number) => t * t * t - 6 * t * t + 9 * t,
  domain: [0, 5] as const,
  turningPoints: [2] as const,
};

/** h(t) = 3t² − 18t + 24 on [0,6]. Zeros at t = 2, 4 (sign changes there). */
export const MOD_EX_FURNACE = {
  f: (t: number) => 3 * t * t - 18 * t + 24,
  antiderivative: (t: number) => t * t * t - 9 * t * t + 24 * t,
  domain: [0, 6] as const,
};

/** w(t) = t² − 6t + 5 = (t−1)(t−5) on [0,6]. Turn (min) at t = 3, w(3) = −4. */
export const MOD_EX_TURBINE = {
  f: (t: number) => t * t - 6 * t + 5,
  antiderivative: (t: number) => (t * t * t) / 3 - 3 * t * t + 5 * t,
  domain: [0, 6] as const,
  turningPoints: [3] as const,
};

/** f(t) = 3t² − 24t + 36 = 3(t−2)(t−6) on [0,7]. Turn (min) at t = 4, f(4) = −12. */
export const MOD_EX_DIALYSIS = {
  f: (t: number) => 3 * t * t - 24 * t + 36,
  antiderivative: (t: number) => t * t * t - 12 * t * t + 36 * t,
  domain: [0, 7] as const,
  turningPoints: [4] as const,
};

/** c(t) = 8 − 2t on [0,6]. Zero (and only turn of A) at t = 4. */
export const MOD_EX_REACTOR = {
  f: (t: number) => 8 - 2 * t,
  antiderivative: (t: number) => 8 * t - t * t,
  domain: [0, 6] as const,
};

/* -------------------------------------------------------------------------- */
/* D10 cumulative integration — produced, auto-graded.                         */
/* Two of these carry an inherited E5 request but land at E3, their           */
/* capability's ceiling — see the assessment plan's level notes.               */
/* -------------------------------------------------------------------------- */

/**
 * 1. Limit repair feeding a derivative (E3, auto). L1's "patch the hole, then
 * the limit exists" and L2's "the derivative is a limit" used together: the
 * value forced at x = 3 IS the number differentiated next.
 */
const modCalcfoundLimitInDerivative: ExerciseDefinition = {
  id: "mod-calcfound-limit-in-derivative",
  type: "vector",
  tier: "transfer",
  prompt:
    "$h(x) = \\dfrac{x^3 - 27}{x - 3}$ for $x \\neq 3$, undefined at $x = 3$. " +
    "First: what single value must be assigned at $x = 3$ to make $h$ continuous " +
    "there? Second: once that value is assigned, what is $h'(3)$? Enter " +
    "(the continuity value, the derivative) as a pair.",
  expected: [27, 9],
  tolerance: 0.001,
  explanation:
    "Off $x = 3$, $x^3 - 27 = (x-3)(x^2+3x+9)$, so $h(x) = x^2 + 3x + 9$ for " +
    "$x \\neq 3$ — that expression's value at $x = 3$ is $9 + 9 + 9 = 27$, the " +
    "only value making $h$ continuous there. With the hole patched, $h$ IS " +
    "$x^2 + 3x + 9$ everywhere on a neighborhood of $3$, so $h'(x) = 2x + 3$ and " +
    "$h'(3) = 9$. The derivative could not even be asked for until the limit " +
    "repaired the function first.",
};

/**
 * 2. The running total's shape, read off a fresh rate (E3, auto — a matrix-entry
 * "row of answers"). L2 (rate vs. slope) used inside an L3 question (where the
 * total is largest, when it falls fastest) — the rate's OWN turn, at t = 4,
 * is where the total falls fastest, distinct from t = 2 where the total peaks.
 */
const modCalcfoundMixedRateTotal: ExerciseDefinition = {
  id: "mod-calcfound-mixed-rate-total",
  type: "custom",
  capabilityId: MATRIX_ENTRY_ID,
  tier: "transfer",
  prompt:
    "A dialysis machine's net fluid-removal rate is $f(t) = 3t^2 - 24t + 36$ " +
    "mL/min on $t \\in [0, 7]$, and the reservoir starts at $V(0) = 50$ mL. " +
    "Enter four answers, in order: (1) the net change in $V$ over $[0,6]$; " +
    "(2) the time at which $V$ is LARGEST; (3) that largest value of $V$; " +
    "(4) the time at which $V$ is falling FASTEST.",
  config: {
    rows: 1,
    cols: 4,
    matrixName: "\\text{answers}",
    tolerance: 0.01,
    expected: [[0, 2, 82, 4]],
    explanation:
      "$F(t) = t^3 - 12t^2 + 36t$ is an antiderivative of $f$, with $F(0) = 0$ " +
      "and $F(6) = 0$: the net change over $[0,6]$ is $0$. $f$ factors as " +
      "$3(t-2)(t-6)$: positive before $t=2$, negative on $(2,6)$, positive " +
      "after — so $V$ rises to a local max at $t = 2$ ($V(2) = 50 + F(2) = 82$), " +
      "falls to $V(6) = 50$, then rises again to $V(7) = 57$; the overall max on " +
      "$[0,7]$ is at $t = 2$. Falling fastest is a DIFFERENT question — it asks " +
      "where the RATE itself is most negative, i.e. where $f'(t) = 6t - 24 = 0$, " +
      "at $t = 4$ ($f(4) = -12$, the rate's own minimum).",
  },
};

/**
 * 3. Two independent routes, corroborated on a fresh rate — and a bracket
 * that straddles by luck (E5, human-scored self-check; the module's ONE E5
 * item, since nothing auto-graded reaches this capability ceiling for
 * calculus-shaped content). All four parts of L4's theorem in one item.
 */
const modCalcfoundMixedFtc: ExerciseDefinition = {
  id: "mod-calcfound-mixed-ftc",
  type: "custom",
  capabilityId: SELF_CHECK_ID,
  tier: "transfer",
  prompt:
    "A rate $r(t) = 3t^2 - 12t + 9$ (some units) is given on $[0, 5]$. " +
    "**(a)** Produce $\\int_0^5 r$ from an antiderivative — state the " +
    "antiderivative, VERIFY it by differentiating (don't just assert it), and " +
    "evaluate. **(b)** Corroborate independently: compute the left-endpoint " +
    "sum and the right-endpoint sum, each with 5 unit-width pieces. **(c)** " +
    "Does the pair from (b) bracket your answer from (a)? If so, does that " +
    "prove anything? Justify from the rate's own behavior on $[0,5]$. " +
    "**(d)** Without computing $A(x) = \\int_0^x r$ at all, state $A'(4)$, and " +
    "explain why (a) and (b) agreeing is real corroboration rather than " +
    "circular reasoning.",
  config: {
    modelAnswer:
      "**(a)** $R(t) = t^3 - 6t^2 + 9t$ is an antiderivative: " +
      "$R'(t) = 3t^2 - 12t + 9 = r(t)$, confirmed. $\\int_0^5 r = R(5) - R(0) = " +
      "20 - 0 = 20$. **(b)** Left sum: $r(0)+r(1)+r(2)+r(3)+r(4) = " +
      "9+0-3+0+9 = 15$. Right sum: $r(1)+r(2)+r(3)+r(4)+r(5) = " +
      "0-3+0+9+24 = 30$. **(c)** $15 \\le 20 \\le 30$, so the pair DOES " +
      "straddle $20$ — but that proves NOTHING: $r'(t) = 6t - 12 = 0$ at " +
      "$t = 2$, strictly inside $(0,5)$, so $r$ decreases then increases and " +
      "$[0,5]$ is not a certified monotone stretch. Left/right bracketing is a " +
      "consequence of monotonicity, not of being a Riemann sum; the straddle " +
      "here is luck, not a guarantee. **(d)** By the Fundamental Theorem's first " +
      "half, $A'(x) = r(x)$ directly — no need to compute $A$ at all: " +
      "$A'(4) = r(4) = 48 - 48 + 9 = 9$. And (a)/(b) agreeing is real evidence " +
      "because the sum in (b) never consulted $R$ — it only ever called $r$ — so " +
      "the two routes are independent; agreement is corroboration, not a " +
      "tautology.",
    rubricId: "mod-calcfound-mixed-ftc",
    rubricVersion: 1,
    rubricText:
      "PASS requires all four parts: (a) the antiderivative stated AND verified " +
      "by differentiating it (not merely asserted), evaluating to 20; (b) both " +
      "sums correctly computed (left 15, right 30); (c) the straddle correctly " +
      "identified as NOT a guarantee, with the reason tied to the turn at t=2 " +
      "lying inside the interval (monotonicity, not merely 'it happened to " +
      "work', licenses bracketing) — 'the sums bracket it, so it's confirmed' " +
      "is explicitly NOT a pass; (d) A'(4) = 9 obtained WITHOUT computing A, via " +
      "the theorem's first half, plus an explanation that (a)/(b) agreement is " +
      "non-circular because the sum never reads R. Getting 20 alone, or (c) " +
      "answered by appeal to the straddle rather than to monotonicity, is NOT " +
      "a pass.",
  },
};

/* -------------------------------------------------------------------------- */
/* D8 method selection and D13 error diagnosis — human-scored.                 */
/* -------------------------------------------------------------------------- */

/**
 * 4. Method selection (E3, human-scored). Question P is settled by symmetry
 * alone, with NO formula available at all; Question Q genuinely requires
 * computing. The prompt names neither route (cue-lint enforces this).
 */
const modCalcfoundSelectMethod: ExerciseDefinition = {
  id: "mod-calcfound-select-method",
  type: "custom",
  capabilityId: SELF_CHECK_ID,
  tier: "transfer",
  prompt:
    "Two questions. **Question P:** a continuous rate $p$ on $[-3, 3]$ " +
    "satisfies $p(-t) = -p(t)$ for every $t$ — no formula for $p$ is given, " +
    "and none is needed. What is $\\int_{-3}^{3} p(t)\\,dt$? **Question Q:** " +
    "$q(t) = 4t - t^2$ on $[0, 3]$. What is $\\int_0^3 q\\,dt$? For EACH " +
    "question, choose the most efficient way to settle it, justify in one " +
    "sentence why that is the efficient choice HERE, and carry out the " +
    "decisive work.",
  config: {
    modelAnswer:
      "**Question P** needs no computation and no formula for $p$ at all: " +
      "pair each contribution at $t$ with the one at $-t$. Since $p(-t) = " +
      "-p(t)$, every such pair cancels in the sum that builds the integral, so " +
      "$\\int_{-3}^{3} p = 0$ regardless of what $p$ actually is. Trying to look " +
      "up or guess a formula for $p$ is not even possible here — the structure " +
      "alone decides it. **Question Q** is different: the answer depends on the " +
      "actual function, so an antiderivative is the efficient route. " +
      "$Q(t) = 2t^2 - t^3/3$ satisfies $Q' = 4t - t^2 = q$; " +
      "$\\int_0^3 q = Q(3) - Q(0) = (18 - 9) - 0 = 9$.",
    rubricId: "mod-calcfound-select-method",
    rubricVersion: 1,
    rubricText:
      "PASS requires, for BOTH questions: (a) the efficient method correctly " +
      "identified — P by an odd-symmetry pairing argument with no formula " +
      "needed, Q by finding and evaluating an antiderivative; (b) a correct " +
      "one-sentence justification tied to WHY (P is settled by the symmetry " +
      "alone and no formula is even available; Q depends on the actual " +
      "function); and (c) produced work reaching the right answer — P: 0, by " +
      "the pairing argument; Q: 9. Claiming P 'by symmetry' without the " +
      "pairing argument (why symmetric pairs cancel), or computing P as if a " +
      "formula existed, is NOT a pass.",
  },
};

/**
 * 5. Error diagnosis (E4, human-scored). The student's antiderivative,
 * split point choice, and all three piece evaluations are correct — only the
 * FINAL step (treating the negative piece as positive) is wrong, staged so
 * the learner must pinpoint exactly where the error is, not distrust the
 * whole calculation.
 */
const modCalcfoundDiagnoseSignedSplit: ExerciseDefinition = {
  id: "mod-calcfound-diagnose-signed-split",
  type: "custom",
  capabilityId: SELF_CHECK_ID,
  tier: "transfer",
  prompt:
    "A student computes the net heat transferred by $h(t) = 3t^2 - 18t + 24$ " +
    "kW over $[0, 6]$ (seconds). Their work: (1) \"$H(t) = t^3 - 9t^2 + 24t$ is " +
    "an antiderivative of $h$.\" (2) \"$h = 3(t-2)(t-4)$ is zero at $t=2$ and " +
    "$t=4$, so I split $\\int_0^2 + \\int_2^4 + \\int_4^6$.\" (3) " +
    "\"$\\int_0^2 = H(2)-H(0) = 20$; $\\int_2^4 = H(4)-H(2) = -4$; " +
    "$\\int_4^6 = H(6)-H(4) = 20$.\" (4) \"**Total $= 20 + 4 + 20 = 44$ kJ**, " +
    "because energy transferred can't be negative.\" Identify the EXACT step " +
    "that is wrong, explain why it is invalid, give the correct net total, and " +
    "produce a computation that shows $44$ cannot be right. Finally, say what " +
    "$44$ DOES correctly measure.",
  config: {
    modelAnswer:
      "Steps 1–3 are all correct — the antiderivative, the split at $h$'s " +
      "zeros, and every piece evaluation. The error is entirely in step 4: " +
      "flipping the middle piece's sign because 'energy can't be negative'. " +
      "The rate $h$ genuinely IS negative on $(2,4)$ (heat is flowing the " +
      "other way there), so that piece's contribution to the NET total really " +
      "is $-4$, not $+4$. The correct net is $20 + (-4) + 20 = 36$ kJ — and this " +
      "can be checked without any splitting at all: $H(6) - H(0) = 36 - 0 = " +
      "36$, one number the Fundamental Theorem gives directly, which proves " +
      "$44$ is wrong without even discussing signs. What $44$ DOES correctly " +
      "measure is a different, real quantity: the TOTAL energy moved in either " +
      "direction, $\\int_0^6 |h| = 20 + 4 + 20 = 44$ kJ — treating every piece " +
      "as positive answers 'how much energy moved', not 'what is the net " +
      "change'.",
    rubricId: "mod-calcfound-diagnose-signed-split",
    rubricVersion: 1,
    rubricText:
      "PASS requires: (a) pinpointing that ONLY step 4 is wrong (not the " +
      "antiderivative, not the split point choice, not the three piece " +
      "evaluations); (b) explaining that the middle piece is genuinely " +
      "negative because the rate is negative there, and net total must keep " +
      "that sign; (c) the correct net, 36; (d) a produced witness that 44 is " +
      "impossible — H(6) - H(0) = 36 computed with no splitting; (e) correctly " +
      "identifying what 44 DOES measure: the total energy moved either " +
      "direction, ∫|h|. Giving 36 with no diagnosis, or vaguely saying 'they " +
      "made an arithmetic mistake', is NOT a pass.",
  },
};

/* -------------------------------------------------------------------------- */
/* D9 transfer — produced, auto-graded via `construct-in-explorer`.            */
/* -------------------------------------------------------------------------- */

/**
 * 6. Transfer of the bracketing restriction (E4, auto). L3's
 * recognition-only item ("does bracketing fail here?", multiple choice)
 * PRODUCED on a fresh rate: the learner must locate the turn themselves
 * (an L2 computation) and construct a narrow interval straddling it.
 */
const modCalcfoundTransferBracketWindow: ExerciseDefinition = {
  id: "mod-calcfound-transfer-bracket-window",
  type: "custom",
  capabilityId: CONSTRUCT_IN_EXPLORER_ID,
  tier: "transfer",
  prompt:
    "A rate $w(t) = t^2 - 6t + 5$ is given on $[0, 6]$. Construct an interval " +
    "$[a, b] \\subseteq [0, 6]$, of width at most $1$, on which the " +
    "left-endpoint and right-endpoint sums carry NO GUARANTEE about " +
    "$\\int_a^b w$ — they may still land close to it, but nothing certifies " +
    "that they bracket it. Enter $(a, b)$.",
  config: {
    target: "vector2",
    check: {
      kind: "interval-without-bracket-guarantee",
      domain: [0, 6],
      turningPoints: [3],
      maxWidth: 1,
    },
    tolerance: 1e-6,
    reveal:
      "A turn of $w$ strictly inside a narrow interval is exactly what kills " +
      "the bracketing guarantee — the interval is too short to certify " +
      "monotone, so a straddle at that width would be luck, not a promise.",
    hint:
      "Find where $w' = 2t - 6 = 0$ first (at $t = 3$), then build a narrow " +
      "interval straddling it.",
  },
};

/* -------------------------------------------------------------------------- */
/* D12 delayed retention — recognition after a delay (E1).                     */
/*                                                                             */
/* Low-stakes recognition on outcomes that already carry produced evidence      */
/* in-lesson. Fresh numbers/functions, distinct from every lesson fixture.      */
/*                                                                             */
/* NOTE: the platform's spacing scheduler is hard-scoped to a single            */
/* SPACED_MODULE_ID (`src/platform/spacedConfig.ts`), so these are NOT spaced   */
/* sets in the platform sense and are not auto-scheduled. Administered          */
/* manually after a delay — see the module's assessment plan.                   */
/* -------------------------------------------------------------------------- */

/** L1 retention: the declared value at the point never moves the limit. */
const modCalcfoundRetainPointValue: ExerciseDefinition = {
  id: "mod-calcfound-retain-point-value",
  type: "multiple-choice",
  tier: "check",
  prompt:
    "Retrieval: $u(x) = \\dfrac{x^2 - x - 12}{x - 4}$ for $x \\neq 4$, and " +
    "$u(4) = 100$ (declared separately). What is $\\lim_{x \\to 4} u(x)$?",
  choices: ["$7$", "$100$", "The limit does not exist — the two disagree", "$0$"],
  correctChoice: 0,
  explanation:
    "$x^2 - x - 12 = (x-4)(x+3)$, so $u(x) = x + 3$ off the point, giving a " +
    "limit of $7$. The declared value $100$ never enters the limit at all — it " +
    "could be any number and the limit would still be $7$. A disagreement " +
    "between the limit and the value is exactly what makes a point removable, " +
    "not a reason the limit fails to exist.",
};

/** L2 retention: a corner is continuous but not differentiable — no averaging. */
const modCalcfoundRetainDiffCont: ExerciseDefinition = {
  id: "mod-calcfound-retain-diff-cont",
  type: "multiple-choice",
  tier: "check",
  prompt:
    "Retrieval: $s$ is continuous at $t = 7$, and its two one-sided slopes " +
    "there are $2$ and $-5$. Which is true?",
  choices: [
    "$s$ is not differentiable at $7$, though it is continuous there",
    "$s$ is differentiable at $7$, with slope $-1.5$ (the average of the two)",
    "$s$ cannot be continuous at $7$ either, since the slopes disagree",
    "The two conditions are the same, so both must fail together",
  ],
  correctChoice: 0,
  explanation:
    "Differentiability needs the two one-sided slopes to AGREE to a single " +
    "number; $2 \\neq -5$ means no single tangent line fits, so $s$ has a " +
    "corner at $t = 7$ — continuous, not differentiable. Averaging the two " +
    "slopes invents a number that no line through the point actually has as " +
    "its slope. Continuity and differentiability are different conditions: " +
    "one can hold without the other.",
};

/** L3 retention: signed accumulation, not the area model. */
const modCalcfoundRetainSigned: ExerciseDefinition = {
  id: "mod-calcfound-retain-signed",
  type: "multiple-choice",
  tier: "check",
  prompt:
    "Retrieval: a pump moves water into a tank at $+6$ L/min for 3 minutes, " +
    "then out at $-4$ L/min for the next 6 minutes. What is the NET change in " +
    "the tank's volume over the 9 minutes?",
  choices: ["$-6$ L", "$+42$ L", "$+18$ L", "$0$ L"],
  correctChoice: 0,
  explanation:
    "Net change is the signed total: $(+6)(3) + (-4)(6) = 18 - 24 = -6$ L. " +
    "$+42$ adds the two MAGNITUDES ($18 + 24$) as if flow direction didn't " +
    "matter — that answers a different question (how much water moved through " +
    "the pump, not the net change in the tank). $+18$ ignores the outflow " +
    "entirely.",
};

/** L4 retention: existence, not a formula — on a fresh removable-point example. */
const modCalcfoundRetainExistence: ExerciseDefinition = {
  id: "mod-calcfound-retain-existence",
  type: "multiple-choice",
  tier: "check",
  prompt:
    "Retrieval: $g(x) = \\sin(x)/x$ for $x \\neq 0$, with $g(0) = 1$ declared " +
    "so that $g$ is continuous on $[0, 1]$. What does the Fundamental Theorem " +
    "entitle you to conclude about $A(x) = \\int_0^x g$?",
  choices: [
    "$A' = g$, so an antiderivative of $g$ exists — but the theorem supplies no elementary FORMULA for it",
    "An elementary formula for $A$ exists, and enough algebra would find it",
    "Nothing — the theorem does not apply to a piecewise-defined function",
    "$\\int_0^1 g$ cannot be computed at all, since no formula is available",
  ],
  correctChoice: 0,
  explanation:
    "The theorem guarantees $A' = g$ from continuity alone — existence, not a " +
    "recipe. $\\int_0^1 g$ is perfectly computable numerically (it is close to " +
    "$0.946$), which is exactly what separates 'no elementary formula' from " +
    "'no value': the number exists and is computable; only a closed-form " +
    "expression for it does not.",
};

/* -------------------------------------------------------------------------- */
/* D11 timed set — fresh instances under a time limit, all auto-graded.        */
/* A deferred-feedback timed set with a human in the loop returns nothing in   */
/* time to be a mock, so every item here is auto-graded.                       */
/* -------------------------------------------------------------------------- */

/** Mock 1: a reciprocal's derivative from the limit definition. */
const modCalcfoundMockLimit: ExerciseDefinition = {
  id: "mod-calcfound-mock-limit",
  type: "numeric",
  tier: "transfer",
  prompt: "$\\lim_{h \\to 0} \\dfrac{(1+h)^{-1} - 1}{h}$ — evaluate.",
  expected: -1,
  tolerance: 0.001,
  explanation:
    "This is the difference quotient for $f(x) = 1/x$ at $x = 1$: " +
    "$f'(1) = -1/1^2 = -1$. Reading the $0/0$ as $0$ loses the sign entirely; " +
    "the limit is genuinely negative because $1/x$ is decreasing at $x=1$.",
};

/** Mock 2: net accumulation on a fresh linear rate. */
const modCalcfoundMockTotal: ExerciseDefinition = {
  id: "mod-calcfound-mock-total",
  type: "numeric",
  tier: "transfer",
  prompt: "$c(t) = 8 - 2t$ mg/s on $[0, 6]$. What is $\\int_0^6 c\\,dt$?",
  expected: 12,
  tolerance: 0.01,
  explanation:
    "$C(t) = 8t - t^2$ is an antiderivative; $C(6) - C(0) = 12$. Reading it as " +
    "$16 + 4 = 20$ treats the second half's negative contribution as positive " +
    "— the same area-model error `mod-calcfound-retain-signed` names, here on " +
    "a rate given by formula instead of in words.",
};

/** Mock 3: the running total's value and slope at a fresh rate's own zero. */
const modCalcfoundMockSlopeOfTotal: ExerciseDefinition = {
  id: "mod-calcfound-mock-slope-of-total",
  type: "vector",
  tier: "transfer",
  prompt:
    "For $c(t) = 8 - 2t$ mg/s and $A(x) = \\int_0^x c$, enter the pair " +
    "$(A(4), A'(4))$.",
  expected: [16, 0],
  tolerance: 0.01,
  explanation:
    "$A(4) = C(4) - C(0) = (32 - 16) - 0 = 16$. By the theorem's first half, " +
    "$A'(4) = c(4) = 8 - 8 = 0$ directly — no need to differentiate a computed " +
    "$A$. $c(4) = 0$ is exactly why $A$ is momentarily flat there: $t = 4$ is " +
    "$A$'s maximum on $[0,6]$.",
};

/** All `calculus-foundations` module items, in a stable authored order. */
export const CALCULUS_FOUNDATIONS_MODULE_ITEMS: readonly ExerciseDefinition[] = [
  modCalcfoundLimitInDerivative,
  modCalcfoundMixedRateTotal,
  modCalcfoundMixedFtc,
  modCalcfoundSelectMethod,
  modCalcfoundDiagnoseSignedSplit,
  modCalcfoundTransferBracketWindow,
  modCalcfoundRetainPointValue,
  modCalcfoundRetainDiffCont,
  modCalcfoundRetainSigned,
  modCalcfoundRetainExistence,
  modCalcfoundMockLimit,
  modCalcfoundMockTotal,
  modCalcfoundMockSlopeOfTotal,
];
