# Lesson Plan — The derivative as local linearity (L2)

Stage 3. Consumes [insight.md](insight.md) (`PASS`) and
[mastery-contract.md](mastery-contract.md).

## Approved insight (gate)
- [x] `Gate result: PASS`
- Exact primary insight — **verbatim, planning metadata only**:

  > Zoom far enough into a smooth curve and it **is** a line. That line is the
  > best local approximation, its slope is the number the line is described by,
  > and that slope in the graph's own units is the rate — so "rate of change",
  > "slope of the tangent", and "best linear approximation" are not three facts
  > about the derivative but one object read three ways. The tangent is therefore
  > not the line that touches once but the line whose error shrinks faster than
  > the step; and where no line appears under magnification, there is no
  > derivative.

- Learner phrasing: *"Zoom in far enough and every smooth curve is a line. The derivative is that line."*
- Obstacle: fragmentation (three unrelated descriptions) + a false school definition of "tangent".
- Mechanisms: structural compression, driven by representational change, with predictive reorganization in the tangent criterion.
- Bridges: the speedometer (resumed from L1); the locally flat Earth.
- Analogy limits to discard: the Earth's single radius of curvature; the graph as a real surface; "flat means curvature can be ignored".
- Abstraction return: refute "a tangent touches once" with an inflection point, no bridge mentioned.

## Route / ids
- Route: `/lesson/derivative-local-linearity`
- `guidedSceneId`: `derivative-local-linearity` *(clip 1 — the zoom, top of page)*
- **Second placed clip:** `derivative-three-names` *(clip 2)*, positioned by a
  `{ kind: "visual", sceneId: "derivative-three-names" }` route block immediately
  after the formal statement of \(f(a+h)=f(a)+f'(a)h+E(h)\).
- `explorationId`: `derivative-local-linearity`

> **Two clips, on purpose.** The insight has a before and an after: *the curve
> becomes a line* (clip 1) and *that one line is all three descriptions*
> (clip 2). A single timeline would blur the compression, which is the actual
> insight, into the zoom, which is only its mechanism. This uses the placed-scene
> route block; it does **not** imply any per-lesson animation quota
> ([architecture §5.1](../../curriculum-architecture.md#51-visual-budget-flagship-vs-supporting)).

## Motivating question
> Everyone says the speedometer's reading is the slope of a line on a graph. But
> a rate is metres per second and a slope is one length divided by another. Why
> should those be the same number?

## Shared examples
- **Main example id:** `ex-parabola` — \(f(x)=x^2\) at \(a=3\). L1 already forced
  the value \(6\); this lesson re-reads that same arithmetic as a slope, so
  nothing numerical is new and only the meaning changes. Used by both clips and
  the explorer.
- **Rate costume:** `ex-drive`, continuing from L1.
- **Failure:** `ex-abs` (\(\lvert x\rvert\) at 0).
- **Crossing tangent:** `ex-cubic-inflection` (\(x^3\) at 0).
- **Introduced here, reused later:** `ex-decay` (\(e^{-t/\tau}\)) — L4, L8, L18, L24.
- **Fresh, practice only:** a cubic and an applied volume curve the clips never draw.

## Supporting concepts
- \(f'\) as a function (the closing beat), so L3/L4 have an object to accumulate.
- Notation: \(f'\), \(\frac{df}{dx}\), and \(\dot s\) all introduced once and
  declared equivalent — the course uses \(f'\) and \(\frac{df}{dx}\) and reserves
  the dot for time in M6.

## Guided-scene outline (Watch) — clip 1, `derivative-local-linearity`

The zoom. One curve, one point, one magnification signal.

| Step id | Name (learner-facing) | Idea revealed | Notation synced |
| --- | --- | --- | --- |
| `secant` | An average over an interval | Secant through \((a,f(a))\) and \((a+h,f(a+h))\); its slope is the average rate. | \(\frac{f(a+h)-f(a)}{h}\), live |
| `shrink` | Shrinking the interval | \(h\) shrinks; the secant settles. L1's forced value, cited by name. | Quotient simplifies to \(2a+h\) |
| `predict` | **Prediction beat** | *The picture is about to be magnified 100×. What will the curve look like?* Nothing moves. | — |
| `zoom` | It becomes a line | Successive magnifications about \((a,f(a))\). The curve straightens. **The residual gap is drawn and labelled at every stage.** | \(E(h)\) labelled on the gap |
| `same` | The same line | The settled secant and the magnified line are shown to coincide. | \(f'(a)=6\) |
| `corner` | Where it fails | `ex-abs` at 0: magnify and the two sides stay different lines. No single line, no derivative. | "no derivative at 0" |

- **Pauses / dimming:** the `predict` beat is a true hold. The `corner` beat holds
  after both magnified branches are on screen.
- **Honest labelling:** the magnified window always renders the **real sampled
  function**, never a substituted straight line, and the residual is always a
  visible labelled quantity. This is the lesson's single most important
  correctness obligation.

## Guided-scene outline (Watch) — clip 2, `derivative-three-names`

The compression. One number, three readings, driven by one signal.

| Step id | Name (learner-facing) | Idea revealed | Notation synced |
| --- | --- | --- | --- |
| `one-line` | One line, from clip 1 | The tangent at \(a\), with its slope displayed once. | \(f'(a)\) |
| `as-rate` | Read it as a rate | Axes relabelled to the drive trace; the same number reads in m/s. | units shown on both axes |
| `as-slope` | Read it as a slope | Rise and run drawn on the same line; the ratio is the same number. | \(\Delta y/\Delta x\) |
| `as-approx` | Read it as a prediction | \(f(a)+f'(a)h\) evaluated a step ahead; the true value and the estimate drawn with the gap between them. | \(f(a{+}h)\approx f(a)+f'(a)h\) |
| `wrong-slope` | Why *this* line | A line of a nearby wrong slope is drawn; its gap shrinks only in proportion to \(h\) while the tangent's shrinks faster. | \(E(h)/h\to0\) vs \(\to 2a-m\) |
| `crosses` | The school definition is false | `ex-cubic-inflection`: the tangent crosses the curve. | — |
| `derivative-fn` | A slope at every point | The point sweeps; \(f'\) is plotted beneath. | \(f'(x)=2x\) |

- **Honest labelling:** `wrong-slope` must show both gaps *measured*, not merely
  asserted — the comparison is the content.

## Checkpoint (Check understanding)
- Prompt: *A curve is magnified about a point until it appears perfectly straight.
  Has the curvature gone away?*
- Type: produced short answer.
- Reveal: no — the residual \(E(h)\) is still nonzero and is drawn; what has
  happened is that it has become small **compared to \(h\)**. This is exactly M4,
  the misconception the zoom itself creates.

## Interactive controls (Explore) — `derivative-local-linearity`
> Initialized from `ex-parabola` at \(a=3\) — the clips' own example.
- **Primary controls:** function picker; the point \(a\); the step \(h\); the
  magnification.
- **Primary readouts:** secant slope; \(f'(a)\); the linear estimate
  \(f(a)+f'(a)h\); the true \(f(a+h)\); the residual \(E(h)\) **and the ratio
  \(E(h)/h\)** — the ratio is the readout that carries C5.
- **Progressive disclosure:** "Compare against a line of slope \(m\)" (reveals a
  second slider and a second residual); "Show \(f'\) as a function".
- **Clamp ranges:** \(h\) on a log slider down to \(10^{-4}\); magnification capped
  where the sampled function's resolution would start lying, with the cap stated
  on screen rather than silently applied.
- **Reset:** `ex-parabola`, \(a=3\), \(h=0.5\), magnification 1.

## Exercises (Practice)

| # | Objective | Type | Deterministic answer | Feedback (why) |
| --- | --- | --- | --- | --- |
| 1 | `der-from-definition-fresh` — derivative of a fresh cubic from the definition | `exercise-sequence` (quotient → simplified → limit) | per-step | Rejects a jump to the rule; shows where the cancellation is legal and why (L1 C7). |
| 2 | `der-linearize-estimate` — estimate a nearby value | `numeric` | \(f(a)+f'(a)h\) | Shows the true value and the residual, and names the direction of the error. |
| 3 | `der-three-names` — rate asked, slope answered; slope asked, rate answered | `exercise-sequence`, units required | both readings | Rejects a unitless number; the units are the argument. |
| 4 | `der-tangent-crosses` — on \(y=x^3\), where does the tangent cross **at the point of tangency**, and where does the tangent at \(a=1\) meet the curve again? | `exercise-sequence` (numeric, numeric) | \(0\); \(-2\) | Contact was never the criterion. The second part shows the tangent meeting the curve again is *ordinary*, not a defect. |
| 5 | `der-differentiable-definition` — decide differentiability at a point for three fresh functions, **from their definitions** | `exercise-sequence`, all three steps multiple-choice (E2; converted from typed reason 2026-07-30) | per-function verdict | Names what the magnified picture would do. *(Graph reading is practised in clip 1 and the explorer; no graded item captures it — see the contract's §1e.)* |
| 6 | `der-corner-slopes` — supply a corner at \(x=2\) as the pair (left slope, right slope) | **`construct-in-explorer`**, predicate `corner-slopes` (ceiling E4) | any two finite slopes that differ | Equal slopes describe a *differentiable* point; that is the whole content of a corner. **The lesson's only E4 claim.** |
| 7 | `der-identify-derivative` — identify \(f'\) for a given \(f\) | `multiple-choice` (4 **expressions**) | the correct \(f'\) | **Recorded as E2 recognition.** Distractors: sign-flipped, off-by-a-power, and \(f\) itself. |
| 8 | `der-residual-remains` — what is left after zooming? | `exercise-sequence`, both steps multiple-choice (E2; converted from typed 2026-07-30) | the residual / error, nonzero | Re-shows the labelled gap; refutes "the curve is straight there". |
| 9 | `der-applied-transfer` — a tank's volume against time (unfamiliar) | `exercise-sequence` (units → meaning of the tangent → estimate → **sign of the error**); units, meaning, and sign are now multiple-choice, only the estimate is numeric (converted 2026-07-30) | per-part | The final part requires reading \(E(h)\)'s sign from the bending; taught once, drilled never. Transfer tier, **E2 level** (corrected 2026-07-30 — the interpretive content is now recognition; see the contract's §1d). |

## Insight traceability

| Contract obligation | Learner-facing location | Evidence of understanding |
| --- | --- | --- |
| C1 secant = average rate = slope | clip 1 `secant` | Ex. 3 |
| C2 the limit is licensed by L1 | clip 1 `shrink` | Ex. 1's cancellation step |
| C3 magnification straightens | clip 1 `zoom`; explorer magnification | Checkpoint; Ex. 5 |
| C4 secant line = zoom line | clip 1 `same` | Ex. 1 vs Ex. 5 consistency |
| C5 error vanishes faster than the step | clip 2 `as-approx`; explorer \(E(h)/h\) readout | Ex. 2, Ex. 8 |
| C6 tangent by error decay | clip 2 `wrong-slope` | Ex. 4 |
| C7 school definition refuted | clip 2 `crosses` | Ex. 4 |
| C8 **the compression — one object** | clip 2 `as-rate`/`as-slope`/`as-approx` | Ex. 3 |
| C9 the \(1\times1\) matrix | a `connection` depth layer, one paragraph | — *(connection, not assessed)* |
| C10 visible failure | clip 1 `corner` | Ex. 5, Ex. 6 |
| C6 tangent by error decay | clip 2 `wrong-slope`; explorer comparison slope | Ex. 4 |
| C11 differentiable ⇒ continuous | depth layer + retention item | module retention item |
| C12 \(f'\) as a function | clip 2 `derivative-fn` | Ex. 7 |
| C13 forward to L4 | Key takeaway | — *(carried by L4's opening)* |
| **Bridge** flat Earth / speedometer | Motivating question; clip 1 `zoom` | Learner restates why a rate is a slope |
| **Analogy limit** curvature varies | Checkpoint reveal | Learner answers "no, it is still curved" |
| **Abstraction return** | Ex. 4 | Curve + point produced, no bridge referenced |

## Key takeaway (Summarize)
> Zoom in far enough and a smooth curve is a line. The derivative is that line —
> which is why a rate, a slope, and a prediction are one number and not three.

## Notation
- \(f'(a)\) and \(\frac{df}{dx}\Big|_{a}\) — both used, declared equivalent once.
- \(h\) for the step, always; never \(\Delta x\) in this lesson, so that
  \(\Delta x\) can mean a *partition width* in L3 without collision.
- \(E(h)\) for the residual, carried unchanged into L4's telescoping step.
- Tangent drawn solid; secants dashed; wrong-slope comparison dotted. Fixed course-wide.

## Edge cases
- Corner: one-sided quotients differ; no derivative.
- Vertical tangent (\(x^{1/3}\) at 0): shown once, named, not developed.
- Inflection: the tangent crosses — the graded refutation.
- \(h<0\): the secant from the left must be available; the definition is two-sided.
- Magnification limit: the explorer caps zoom where sampling resolution would lie,
  **and says so on screen**.

## Mathematical invariants to assert
- [ ] difference quotient of `ex-parabola` equals \(2a+h\) exactly for \(h\neq0\)
- [ ] \(E(h)/h \to 0\) for the tangent on a shrinking sample; \(\to (f'(a)-m)\neq0\) for a wrong slope
- [ ] the magnified window renders sampled \(f\), never a substituted line (asserted structurally: the renderer takes the fixture, not a slope)
- [ ] the residual is nonzero and rendered at every magnification for a curved fixture
- [ ] one-sided quotients of `ex-abs` at 0 differ
- [ ] plotted \(f'\) matches a numeric derivative of \(f\) within tolerance on every fixture
- [ ] the tangent at an inflection point crosses the curve (asserted on `ex-cubic-inflection`)

## Required tests
- [ ] Unit tests for the new `src/math/calculus.ts` derivative helpers
- [ ] Invariant tests (the list above, especially the render-the-real-function one)
- [ ] Component tests: explorer readouts including \(E(h)/h\), the wrong-slope comparison, magnification cap message, reset
- [ ] Grading contracts + `ITEM_ASSESSMENT_META` for all nine items, with the adversarial reject battery on both `construct` items
- [ ] Guided-scene hard gates and chapter seek for **both** clips
- [ ] Route test: the placed `visual` block renders `derivative-three-names`, not the lesson's own clip
- [ ] Browser test: readouts correct, no console errors

## Acceptance checklist

**Built and accepted 2026-07-28.** Gate 8 record:
[mastery-contract §6](mastery-contract.md#6-acceptance-record-gate-8).

- [x] Approved Insight Contract linked and `PASS`; insight verbatim in metadata
- [x] Insight traceability table complete
- [x] Route intentional; the second clip's placement justified in-plan
- [x] Headings content-specific
- [x] Guided-to-interactive continuity across both clips and the explorer
- [x] Progressive disclosure applied
- [x] KaTeX notation consistent, including the \(h\) vs \(\Delta x\) reservation
- [x] Accessibility: labels, focus, readouts, reduced-motion frames for both clips
- [x] Diagrams labelled, unclipped, safe frame intact
- [x] `docs/quality/lesson-correctness-checklist.md` completed
- [x] All tests pass — 12 zoom-family assertions, 75 grading assertions, hard
      gates for both clips, chapter seeks, and four browser tests
