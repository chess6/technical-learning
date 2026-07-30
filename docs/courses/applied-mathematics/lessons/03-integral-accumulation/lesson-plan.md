# Lesson Plan — The integral as accumulation (spine L3)

Stage 3. Consumes [insight.md](insight.md) (`PASS`) and
[mastery-contract.md](mastery-contract.md).

## Approved insight (gate)
- [x] `Gate result: PASS`
- Exact primary insight — **verbatim, planning metadata only**:

  > An integral is the **total of a rate**. If the rate were constant the total
  > would be rate × duration; because it varies, chop the interval into pieces
  > short enough that the rate is nearly constant, multiply on each piece, add,
  > and refine without bound. Each term is a **product with units** — (m/s)(s) =
  > m — not a shape, so the total carries the units of the quantity accumulated,
  > it is signed, and it is unchanged if the graph is redrawn at another scale.
  > "Area under the curve" is not what an integral is; it is what totalling a
  > rate looks like when the thing you drew is the rate.

- Learner phrasing: *"It's not an area. It's a total — and the picture is only what a total looks like."*
- Obstacle: an over-specific prior model ("area under the curve") plus the usual ordering that makes the FTC a definition.
- Mechanisms: semantic grounding + representational change, with structural compression at the close.
- Bridge: an odometer, against L1/L2's speedometer.
- Analogy limits to discard: odometers do not run backwards; a real journey is finitely sampled; "read it at both ends" is L4's theorem and is not available.
- Abstraction return: name the units of \(\int i\,dt\) from the axes alone.

## Route / ids
- Route: `/lesson/integral-accumulation`
- `guidedSceneId`: `integral-accumulation`
- `explorationId`: `integral-accumulation`

> **One clip.** The insight is a single construction with one motion
> (refinement). Splitting it would separate the partition from its limit, which
> is the one thing that must be seen as continuous.

## Motivating question
> You have a complete record of how fast the car was going at every instant. The
> odometer was covered up. How far did it go — and what could you possibly
> multiply, when the speed never held still?

## Shared examples
- **Main example id:** `ex-drive` — third appearance. Now the odometer.
  Includes a **reversing segment** so the signed case is in the main example, not
  an afterthought. Used by the scene and the explorer.
- **Hand-checkable:** `ex-parabola` on \([0,2]\); \(S_n = \frac43\cdot\frac{(n+1)(2n+1)}{n^2} \to \frac83\).
- **Collapse case:** a constant rate, where the construction must visibly reduce to rate × duration.
- **Fresh, practice only:** a current-against-time trace (transfer), a power trace, and a table with no graph.

## Supporting concepts
- Partition, mesh, sample point — named once each, used throughout.
- The running total as a *function* (closing beat), so L4 has an object to differentiate.

## Guided-scene outline (Watch) — `integral-accumulation`

One rate trace. Rectangles that are products. A total that builds beneath.

| Step id | Name (learner-facing) | Idea revealed | Notation synced |
| --- | --- | --- | --- |
| `constant` | If it never changed | A flat rate; total = rate × duration, drawn as one rectangle with its units written **inside**: (m/s)(s) = m. | \(\text{rate}\times\text{duration}\) |
| `vary` | But it does change | The real drive trace. There is no single number to multiply by. | — |
| `chop` | Short enough to pretend | Four pieces; on each, one sampled rate × that width. Each rectangle carries its own product label. | \(f(x_i^\*)\Delta x_i\) |
| `sum` | Add the pieces | The four contributions accumulate into a running bar; the sum is displayed. | \(\sum f(x_i^\*)\Delta x_i\) |
| `predict` | **Prediction beat** | *The pieces are about to be halved, then halved again. Will the total rise, fall, or settle?* Nothing moves. | — |
| `refine` | It settles | \(n\) doubles repeatedly; the sum settles. L1's forced value, cited by name. | \(\lim_{\text{mesh}\to0}\) |
| `bracket` | Squeezed, not guessed | On a monotone stretch, left and right sums are drawn as an upper and lower bar closing on the value. **Caption states the monotone restriction.** | left \(\le\) value \(\le\) right |
| `reverse` | Going backwards | The reversing segment: negative rate, negative contributions, the running total falls. | signed contributions |
| `running` | The other instrument | The right endpoint sweeps; \(A(x)\) is plotted beneath the rate. It is the odometer. | \(A(x)=\int_a^x f\) |
| `meters` | One machine, four meters | The axes are relabelled — current/time, power/time, density/length — and the same construction reads charge, energy, mass. | units update live |

- **Pauses / dimming:** `predict` is a true hold. `bracket` holds after both bars are drawn.
- **Honest labelling:** the `bracket` beat must state that bracketing is being
  shown on a **monotone** stretch; the rectangles are always drawn from the real
  sampled fixture; the refinement counter shows the actual \(n\).
- **Hard exclusion:** no antiderivative appears in any beat, caption, or layer.
- **Visual family:** this scene **creates** `accumulation-strip` (partition,
  refinement, running total, per-rectangle unit labels), reused by L4, L7, L8,
  L12, L23. It ships parameterized and tested.

## Checkpoint (Check understanding)
- Prompt: *The same journey is plotted again with the time axis stretched to twice
  the width. The shaded region on the page is now twice as large. Did the car
  travel twice as far?*
- Type: produced short answer.
- Reveal: no. Each rectangle's *width* now represents the same duration drawn
  wider; the product (rate)(duration) is unchanged. The area on the page was never
  the invariant — the total was. (This is M1 and M3 in one question.)

## Interactive controls (Explore) — `integral-accumulation`
> Initialized from `ex-drive`, the scene's own trace.
- **Primary controls:** rate fixture; the interval \([a,b]\); the number of pieces
  \(n\); the sample point (left / right / midpoint).
- **Primary readouts:** the Riemann sum; **its units, derived from the axes**; the
  left/right pair with the bracket width; the running total \(A(x)\) at the
  current right endpoint.
- **Progressive disclosure:** "Show the sum table against \(n\)"; "Show the
  symbolic definition"; "Relabel the axes" (the four-meters control).
- **Clamp ranges:** \(n \in [1, 512]\), log-stepped; \([a,b]\) inside the fixture's domain.
- **Reset:** `ex-drive`, full interval, \(n=4\), right sample.

## Exercises (Practice)

| # | Objective | Type | Deterministic answer | Feedback (why) |
| --- | --- | --- | --- | --- |
| 1 | `int-units-fresh` — what does this integral compute, in what units? | `exercise-sequence`, both steps multiple-choice (E2; converted from typed text 2026-07-30) | the quantity + units | Rejects "area"; re-derives the units from the product. |
| 2 | `int-estimate-table` — estimate from a fresh table; high or low, and why | `exercise-sequence`: sum (`numeric`) → verdict, reason (multiple-choice since 2026-07-30) | sum, verdict, reason | Names monotonicity as the reason the verdict is knowable. |
| 3 | `int-parabola-from-sum` — \(\int_0^2 x^2\) from the sum | `exercise-sequence` (\(S_n\) → limit) | \(8/3\) | Shows the closed form and the \(1/n\) bracket; **no antiderivative in the feedback**. |
| 4 | `int-signed-transfer` — a current trace going negative | `exercise-sequence` (units → sign → "can the final total be below the maximum?") | charge in coulombs; yes | The area model predicts "no"; the total model predicts "yes". |
| 5 | `int-read-running-total` — read \(A\) against \(f\) at four marked points | `exercise-sequence`, all four steps multiple-choice (E2; converted from typed judgments 2026-07-30) | rising / flat / falling / steepest | Ties the slope of \(A\) to the height of \(f\) **without naming the FTC** — the observation is left standing for L4. |
| 6 | `int-scale-invariance` — why redrawing does not change the answer | `exercise-sequence`, both steps multiple-choice (E2; converted from typed text 2026-07-30) | the product is unchanged | The checkpoint made general. |
| 7 | `int-same-machine` — current → charge and power → energy | `exercise-sequence`; naming the quantity is multiple-choice (since 2026-07-30), both amounts are `numeric` | per-setting | One construction, different meters. |
| 8 | `int-bracket-fails` — which rate graph breaks left/right bracketing? | `multiple-choice` (4 graphs) | the non-monotone one | **Recorded as recognition.** Distractors are monotone increasing, decreasing, and constant. |

> **Note on Ex. 5.** It deliberately walks the learner to the edge of the FTC —
> "the total rises fastest where the rate is highest" — and stops. The observation
> is recorded, not explained. L4 opens by picking it up.

## Insight traceability

| Contract obligation | Learner-facing location | Evidence of understanding |
| --- | --- | --- |
| C1 constant rate | `constant` beat | Ex. 7 |
| C2 short pieces, nearly constant (cites L1) | `chop` beat caption | Ex. 2's reason |
| C3 rectangles are products with units | `chop`, `constant` unit labels; explorer units readout | Ex. 1 |
| C4 the Riemann sum | `sum` beat | Ex. 2, Ex. 3 |
| C5 bracketing (monotone) | `bracket` beat | Ex. 2, Ex. 8 |
| C6 the limit defines the integral | `predict` + `refine` beats | Ex. 3 |
| C7 units and scale invariance | `constant` labels; checkpoint | Ex. 1, Ex. 6 |
| C8 signed | `reverse` beat | Ex. 4 |
| C9 the running total is a function | `running` beat | Ex. 5 |
| C10 one machine, many meters | `meters` beat | Ex. 7 |
| C11 the shape of later integrals | a `looking-ahead` layer, one paragraph — **"the same kind of integral", not "the same construction"** | — *(forward promise, not assessed)* |
| C12 the open question | Key takeaway's final line | — *(L4 opens on it)* |
| **Bridge** odometer | Motivating question; `running` beat | Ex. 5 |
| **Analogy limit** odometers don't run backwards | `reverse` beat caption | Ex. 4 |
| **Abstraction return** | Ex. 1 | Units named from axes with no story |

## Key takeaway (Summarize)
> An integral is a total, not an area. Chop, multiply, add, refine — and the units
> tell you what you have computed.
>
> *One thing is left unexplained: the running total rises fastest exactly where
> the rate is highest. That is not a coincidence, and it is the next lesson.*

## Notation
- \(\int_a^b f(x)\,dx\); \(\Delta x_i\) for a partition width (**reserved** — L2
  used \(h\) for a step precisely so this symbol was free); \(x_i^\*\) for a sample
  point; \(A(x)\) for the running total, reused verbatim in L4.
- Rectangles drawn with a visible product label; positive contributions above the
  axis, negative below, in the `result` and `violation` semantic roles respectively.

## Edge cases
- Constant rate: the construction must **visibly** collapse to one rectangle for every \(n\).
- Sign change: the total can end below its own maximum.
- Non-monotone rate: bracketing fails; shown as a graded item, not hidden.
- \(n=1\): a legal, terrible estimate — kept available so the learner can see it.
- A fixture with a jump discontinuity: **excluded** from this lesson; integrands
  are continuous, as declared.

## Mathematical invariants to assert
- [ ] \(S_n\) for `ex-parabola` equals \(\frac43\cdot\frac{(n+1)(2n+1)}{n^2}\) exactly
- [ ] left and right sums for `ex-parabola` differ by \(8/n\) and bracket \(8/3\)
- [ ] on the non-monotone fixture the bracketing assertion **fails** (a test that requires failure)
- [ ] the constant-rate fixture returns rate × duration for every \(n\)
- [ ] the plotted running total equals the partial sums at every partition point
- [ ] the signed total decreases across the reversing segment
- [ ] the displayed units are derived from the fixture's declared axis units (changing them changes the readout)

## Required tests
- [ ] Unit tests for the Riemann-sum helpers in `src/math/calculus.ts`
- [ ] Invariant tests (the list above, including the required-to-fail bracket test)
- [ ] Component tests: `accumulation-strip` family — partition, refinement, units, running total, reset
- [ ] Grading contracts + `ITEM_ASSESSMENT_META` for all eight items
- [ ] Guided-scene hard gates + chapter seek
- [ ] **Antiderivative-absence check** over the built lesson definition, scene, and explorer
- [ ] Browser test: readouts correct, no console errors

## Acceptance checklist
- [ ] Approved Insight Contract linked and `PASS`; insight verbatim in metadata
- [ ] Insight traceability table complete
- [ ] Route intentional; Watch precedes Explore
- [ ] Headings content-specific
- [ ] Guided-to-interactive continuity
- [ ] Progressive disclosure applied
- [ ] KaTeX notation consistent, including the \(\Delta x\) reservation from L2
- [ ] Accessibility: labels, focus, readouts, reduced-motion frame
- [ ] Diagrams labelled, unclipped, safe frame intact
- [ ] `docs/quality/lesson-correctness-checklist.md` completed
- [ ] **No antiderivative anywhere in the lesson**
- [ ] All tests pass
