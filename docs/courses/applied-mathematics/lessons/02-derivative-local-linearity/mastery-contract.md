# Lesson Mastery Contract — The derivative as local linearity (L2)

Gate 5 for **L2 `derivative-local-linearity`**, after [insight.md](insight.md)
reached `PASS`.

## 1a. Placement & upstream links
- **Spine:** L2, unit `calculus-foundations`, second lesson of Package A.
- **Profile:** P2 primary. No P3 bar claimed: differentiability is *characterized*
  and *used*, not proved from an \(\varepsilon\)–\(\delta\) argument.
- **Insight contract:** [insight.md](insight.md) — `PASS`.
- **Concepts introduced:** `local-linearity`, `derivative`. **Reused:** `limit`,
  `continuity` (L1).
- **Cross-course:** LA `transformations` (built) — cited once for C9, as a
  connection. Not re-taught, not a hard gate.

## 1b. Role, bridge, need
- **Role:** supplies the object the whole course differentiates, and — more
  importantly — supplies **C5**, the first-order approximation with an error that
  vanishes faster than the step. L4's telescoping argument consumes C5 directly;
  without it the FTC cannot be derived, only asserted.
- **Retrieve:** L1's forced value and the irrelevance of the point (the difference
  quotient is \(0/0\) at \(h=0\) and always will be).
- **Bridge from L1:** L1 established that the instantaneous rate is a well-defined
  number. L2 asks the obvious next question — *a number measuring what?*
- **Motivating need:** *Everyone says the speedometer reading is the slope of a
  line. A rate is metres per second; a slope is a ratio of two lengths on a page.
  Why should those be the same number?*

## 1c. Content to teach
- **Definitions (D2):** the derivative at a point (limit of difference quotients);
  local linearity; the tangent line **by error decay**, not by contact;
  differentiability; the derivative as a function.
- **Objects:** `ex-parabola` at \(a=3\) (continuing L1's arithmetic);
  `ex-drive` (rate costume); `ex-abs` (\(\lvert x\rvert\) at 0, the visible
  failure); `ex-cubic-inflection` (\(x^3\) at 0 — tangent crosses); `ex-decay`
  (\(e^{-t/\tau}\), introduced here for the first time and reused in L4, L8, L18).
- **Procedures (D3):** compute a derivative from the definition on a fresh
  polynomial; produce the linear approximation at a point and use it to estimate;
  read \(f'\) from a graph of \(f\) and sketch it; decide differentiability from a
  graph.
- **Results (D5):** \(f(a+h)=f(a)+f'(a)h+E(h)\) with \(E(h)/h\to0\); the tangent is
  unique; differentiable ⇒ continuous. **Explicitly denied:** the converse; and
  "the tangent touches at one point".
- **Proof depth (D6):** C5's characterization **derived** for `ex-parabola` with an
  exact error term (contract §7), including the comparison against a wrong slope.
  The general \(x^n\) rule is derived for \(n=2,3\) and generalized by statement.
  Product/quotient rules **stated as stated**.
- **Representations (D4):** magnified graph (visual); secant table (numeric);
  \(f(a)+f'(a)h+E(h)\) (symbolic); "the line the curve becomes" (verbal);
  m/s on the drive trace (applied); the \(1\times1\) matrix (structural, one line).
- **Translations:** zoom picture ↔ approximation formula; secant slope ↔ average
  rate; \(f'\) graph ↔ slopes read off \(f\); units of the axes ↔ units of \(f'\).
- **Edge/degenerate cases (D7):** corner; vertical tangent (stated with a picture,
  not developed); inflection with a crossing tangent; a function continuous but
  not differentiable; the residual \(E(h)\) never being zero for a genuinely
  curved graph.
- **Misconceptions (D13):** M1–M6 of [insight §Prerequisites](insight.md#prerequisites-limitations-likely-misconceptions).

## 1d. Outcomes with evidence

| Outcome | Dim | Owner | Level | Evidence | Attainment |
| --- | --- | --- | --- | --- | --- |
| Compute \(f'(a)\) from the definition on a fresh polynomial, showing the cancelled quotient | D3 | lesson | E3 | `der-from-definition-fresh` (`exercise-sequence`: quotient, simplified form, limit) | independently demonstrated |
| Produce the linear approximation at a point and use it to estimate a nearby value | D3/D4 | lesson | E3 | `der-linearize-estimate` (`numeric`, fresh function) | independently demonstrated |
| Answer a **rate** question with a slope and a **slope** question with a rate, on one graph | D4/D13 | lesson | E3 | `der-three-names` (`exercise-sequence`, both directions, units required) | independently demonstrated |
| Refute "a tangent touches at one point and does not cross" with a specific curve and point | D7/D13 | lesson | E4 | `der-tangent-crosses` (`construct`, predicate-graded: any inflection point of a supplied family) | independently demonstrated |
| Decide differentiability from an unfamiliar graph and justify by the zoom | D3/D7 | lesson | E3 | `der-differentiable-graph` (`exercise-sequence`, typed reason) | independently demonstrated |
| Supply a function continuous at a point but not differentiable there | D7/D13 | lesson | E4 | `der-continuous-not-differentiable` (`construct`, predicate-graded) | independently demonstrated |
| Sketch/identify \(f'\) from a graph of \(f\) | D4 | lesson | E3 | `der-sketch-derivative` (`multiple-choice` over four plotted candidates, distractors = sign error, shift, and \(f\) itself) | **recognition — recorded as E1–E2, not claimed E3** |
| State what remains after zooming, in symbols | D5/D13 | lesson | E3 | `der-residual-remains` (`text`, produced) | independently demonstrated |
| Interpret a derivative in an unfamiliar applied setting, including the **sign** of the linearization error | D9 | lesson | E4 | `der-applied-transfer` (tank volume; three parts) | independently demonstrated |
| Retain "differentiable ⇒ continuous, not conversely" under delayed retrieval | D12 | **module** | E3 | `mod-calcfound-retain-diff-cont` (module `calculus-foundations`, Gate 9) | **not built** — Gate 9 open |
| Integrate the derivative with limits and with accumulation on a mixed item | D10 | **module** | E5 | `mod-calcfound-mixed-rate-total` (module `calculus-foundations`, Gate 9) | **not built** — Gate 9 open |

**Transfer:** three D9/E4 outcomes (`der-tangent-crosses`,
`der-continuous-not-differentiable`, `der-applied-transfer`).

## 1e. Coverage status
Taught: all of §1c. Practiced: every lesson-owned outcome. Independently
demonstrated: all lesson-owned outcomes except `der-sketch-derivative`, honestly
recorded as **recognition** — producing a sketch is not machine-gradable with the
current capability set, and the lesson does not claim it.

## 1f. Connections, assessment, retention
- **Cumulative (D10):** L1's `ex-parabola` arithmetic reused *unchanged*, so the
  only new thing is the interpretation; L1's forced value cited at C2 by name; LA
  `transformations` cited once at C9.
- **Assessment:** 2 check, 4 drill, 3 transfer; **recall capped at one**
  (`der-sketch-derivative`). Every graded item uses a function the guided scenes
  do not animate, except `der-three-names`, whose point is that it is the scene's
  own drive trace read two ways.
- **Retention (D12):** differentiable ⇒ continuous but not conversely — the fact
  most likely to invert on recall.
- **Forward:** L3 (composition of these lines), L4 (linearization as a tool),
  **L4 (C5 is the telescoping step)**, L22 (equations about \(f'\)), L28 (the
  zoom in several directions).

## 1g. Correctness & scope
- **Correctness checks:** every displayed slope, secant, tangent, and residual
  comes from `src/math/calculus.ts`. Property tests: the difference quotient of
  `ex-parabola` equals \(2a+h\) exactly for \(h\neq0\); the residual for the
  tangent satisfies \(E(h)/h\to0\) on a shrinking sample while a wrong-slope line's
  ratio tends to a nonzero constant (this is C6, asserted numerically); the zoomed
  window really is the function's own values, never a redrawn straight line;
  `ex-abs` has different one-sided quotients at 0; the plotted \(f'\) equals the
  numerically differentiated \(f\) within tolerance on every fixture.
- **Visualization honesty:** at every magnification the scene displays the residual
  \(E(h)\) as a **labelled nonzero gap**. The clip must never show a window in
  which the curve has been replaced by a straight line — the curve is always the
  real sampled function, and the "straightness" must be genuine at that scale.
  This is the lesson's principal known-failure-mode risk and its principal
  invariant.
- **Scope exclusions:** the differentiation rulebook beyond \(x^n\) small \(n\),
  constants and sums; the chain rule (L3); implicit differentiation; higher-order
  Taylor (L4 states first order only); the mean value theorem; nowhere-
  differentiable functions beyond a one-sentence existence remark.
- **Abstraction return:** insight §14; evidenced by `der-tangent-crosses`, which
  requires a curve and a point with no reference to the Earth or the car.

## 6. Acceptance record (Gate 8)

> **Gate 8 is scoped to this lesson's own outcomes.** Per
> [mastery-standard §9](../../../../authoring/mastery-standard.md#9-workflow-integration),
> it confirms that every **lesson-owned** core outcome is independently
> demonstrated with real in-lesson evidence, and that module-owned outcomes are
> carried forward as planned Gate-9 obligations. Open Gate-9 obligations are the
> normal state of an accepted lesson and do **not** block Gate 8.

**Status: PASSED** for `derivative-local-linearity`, on the built lesson
(`src/lessons/derivativeLocalLinearity.ts`), 2026-07-28.

- [x] Insight contract linked and `Gate result: PASS`.
- [x] All §1 fields filled.
- [x] Outcomes operational, owner-marked, evidence-paired.
- [x] **Every claimed lesson-owned outcome is independently demonstrated** by a
      real, auto-graded, in-lesson item. The two that are not claimed are
      recorded in §1e as recognition (`der-identify-derivative`, E2) and as
      practised-only (deciding differentiability from a graph).
- [x] No lesson-owned outcome accepted on planned module evidence.
- [x] **No claim exceeds its capability ceiling.** One E4 claim, on
      `construct-in-explorer` (ceiling E4); every `exercise-sequence` item is
      claimed at E3 or below. Asserted by
      `src/lessons/__tests__/derivativeLocalLinearityGradingContract.test.ts`,
      which reads `CAPABILITY_EVIDENCE_CEILING` rather than trusting the prose.
- [x] **Every claimed evidencing item captures what the outcome says.** No item
      claims to present a figure its capability cannot render — the correction
      carried forward from L1's review, applied here *before* the lesson was
      built rather than after.
- [x] Assessment set matches §1f; recall capped at one; two transfer-tier items.
- [x] Module-owned outcomes carried forward as Gate-9 obligations.
- [x] Forward edges recorded (L4 consumes C5 verbatim).
- [x] Retention hook recorded.
- [x] Correctness gate passed (`calculus.test.ts`; `LocalLinearityZoom.test.tsx`,
      12 assertions pinning the zoom family's honesty rule).
- [x] Grading contracts registered for all nine items (75 assertions).
- [x] **Ledger check P3 verified by test, not inspection**: `zoomReadouts` keeps
      the residual nonzero at every magnification, and
      `e2e/lesson-derivative-local-linearity.spec.ts` drives the explorer to the
      magnification ceiling and asserts the residual is still nonzero while the
      ratio goes to zero.
- [x] Guided-scene hard gates pass for **both** clips; chapter seeking covered;
      the placed second clip has a route test.

**Not in scope of this gate, and open:** Gate 9 for `calculus-foundations`.

### Defects found while building, and fixed

- **A module-scope signal.** `halfWidth` was declared outside the scene
  generator, so the Player's second pass began with the previous pass's
  fully-zoomed window — every earlier beat drew the wrong picture and the reset
  registered as the whole panel teleporting. Seek determinism depended on it.
- **A window sized by the wrong function.** The vertical extent used the running
  example's slope for every fixture, so the corner appeared as a shallow dent
  rather than a V: |x| rises at ±1 and the window was scaled for a slope of 6.
- **A sign slip** in the corner's left half-line, which visibly failed to lie on
  the curve it was drawn to trace.
- **A comparison that opened by contradicting itself.** At the initial step the
  *wrong* line's error ratio was the smaller of the two; the step is now brought
  inside the range where the tangent is already better before the prediction is
  posed.
- **An off-panel marker.** The secant dot's position is `a + h` in world units,
  so a fixed `h` in a window shrinking 100× sent it a thousand pixels away. It is
  parked on the point before the zoom; fading it was not enough, because the
  teleport gate measures position rather than visibility — correctly.
