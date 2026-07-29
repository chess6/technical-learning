# Lesson Plan — What "approaches" means (L1)

Stage 3. Consumes [insight.md](insight.md) (`PASS`) and
[mastery-contract.md](mastery-contract.md). Does not restate them.

## Approved insight (gate)
- [x] `Gate result: PASS`
- Exact primary insight — **verbatim, planning metadata only**:

  > A limit is not a value you arrive at, and not the function's value at the
  > point. It is the value the function's nearby outputs **force**: name any
  > tolerance on the output and a window around the input exists — not containing
  > the point itself — inside which the guarantee holds. Because the point is
  > never consulted, a quantity can be perfectly well defined where the defining
  > expression is \(0/0\); and continuity is the special case where the forced
  > value and the actual value agree — a **local** guarantee, which licenses
  > substitution but does **not** on its own bound how much the function moves
  > between two samples. Turning it into a sampling rule needs a chosen
  > resolution and a **modulus of continuity**.

- Learner phrasing: *"The neighbours decide. The point itself never gets a vote."*
- Obstacle: an incorrect prior model ("substitute, cancelling if it breaks") plus notation with no operational content.
- Mechanisms: operational grounding + representational change + predictive reorganization.
- Bridge: a speedometer reading at an instant.
- Analogy limits to discard: the needle "arriving"; instrument lag; finite precision.
- Abstraction return: justify a substitution by citing continuity, with no reference to the car.
- **Correction carried:** an earlier draft said continuity means "nothing hides between your samples". That is false; see [insight §5](insight.md#5-the-model-change) and misconception M5b.

## Route / ids
- Route: `/lesson/limits-continuity`
- `guidedSceneId`: `limits-continuity`
- `explorationId`: `limits-continuity`

## Motivating question
> A car passes a single point on the road. The speedometer says 50. But speed is
> distance divided by time, and at a single instant the car covers no distance in
> no time. What is the needle showing?

## Shared examples
> All constants live in the new `src/math/calculus.ts`; nothing is duplicated in
> the lesson definition.
- **Main example id:** `ex-drive` — a velocity trace with its matching position
  trace. Used by the guided scene **and** the explorer. Recurs in L2, L3, L4.
- **Second:** `ex-parabola` — \(f(x)=x^2\), difference quotient at \(x=3\), which
  simplifies to \(6+h\) and is checkable by hand.
- **Failure cases:** `ex-jump` (a step at \(x=1\)); `ex-oscillate`
  (\(\sin(1/x)\) near 0); `ex-blowup` (\(1/x^2\) near 0); `ex-parabola-punctured`
  (`ex-parabola` with \(x=3\) deleted).
- **Fresh, practice only:** a quotient and a piecewise function the scene never
  draws.

## Supporting concepts
- One-sided limits — introduced **only** as the diagnostic that distinguishes a
  jump from the other failures. Not developed.
- The three-part continuity test (value, limit, agreement) — the operational form
  of `continuity`.
- **Modulus of continuity** \(\omega\), introduced by name at the closing beat as
  the *quantitative* form of the guarantee. Defined and used; **not** proved to
  exist on a compact interval (stated with attribution). `fundamental-theorem`
  cites it by name at its uniformity step, so it must be introduced here.

## Guided-scene outline (Watch) — `limits-continuity`

One graph, one candidate value, two bands. The bands are the whole scene.

| Step id | Name (learner-facing) | Idea revealed | Notation synced |
| --- | --- | --- | --- |
| `paradox` | A number with no formula | Average speed over shrinking intervals is computable; at the instant the formula is \(0/0\). | \(\Delta s/\Delta t\) written, then struck through at \(\Delta t=0\) |
| `shrink` | The averages settle | A table of shrinking intervals; the values stop changing in the leading digits. | Numeric column, live |
| `band` | Name a tolerance | A horizontal band of half-height \(\varepsilon\) is drawn around the candidate. | \(\varepsilon\) labelled on the band |
| `window` | Answer with a window | A vertical window of half-width \(\delta\) narrows until the graph inside it stays inside the band. | \(\delta\) labelled; \(0<\lvert x-a\rvert<\delta\) |
| `predict` | **Prediction beat** | *The band is about to be made ten times narrower. Can the window still be answered?* Nothing moves. | — |
| `tighter` | It can be answered again | \(\varepsilon\) shrinks; \(\delta\) shrinks in response; the guarantee holds. | Both labels update |
| `puncture` | The point never voted | The point at \(x=a\) is deleted. Bands, window, and forced value are unchanged. | Open circle drawn |
| `fail` | Four ways to lose | Jump, removable, oscillation, blow-up — each shown with the band that cannot be answered. | Failure named on screen |
| `continuity` | When the forced value is the real one | The punctured point is filled back in *at the forced value*; substitution becomes legal. | \(\lim_{x\to a}f(x)=f(a)\) |
| `local-only` | But it is only a local promise | A **continuous** function, sampled on a coarse grid, with a tall narrow spike hidden entirely between two adjacent samples. Continuity did not prevent it. | samples drawn; the spike between them |
| `modulus` | What sampling actually needs | A resolution is chosen and a modulus \(\omega\) supplied; the guaranteed variation over one grid step is drawn as a band around the sampled polyline. | \(\lvert f(x)-f(y)\rvert\le\omega(\lvert x-y\rvert)\) |

- **Pauses / dimming:** the `predict` beat holds with no motion at all; the four
  failure cases each hold after their band is drawn.
- **Honest labelling:** the shrinking-interval table shows *computed* values, never
  interpolated ones. The oscillation case is labelled "no forced value" rather
  than "the limit is 0".
- **Visual family:** this scene **creates** `function-plot` — a parameterized
  plot with a movable point, a value band, an input window, and optional
  punctured points. Six later lessons reuse it, so it ships parameterized and
  tested, not inlined.

## Checkpoint (Check understanding)
- Prompt: *This function is continuous everywhere. Here are its values at
  \(x=0,1,2,\dots,10\), and they are all close to zero. Can you conclude that
  \(f\) stays close to zero on \([0,10]\)?*
- Type: produced short answer.
- Reveal: **no.** Continuity is a promise about each point's own neighbourhood; it
  fixes no window width, so a continuous spike can sit entirely between two
  samples. To conclude anything you need a resolution *and* a modulus of
  continuity bounding the variation over one grid step. (This is M5b — the
  misconception the word "continuous" creates all by itself.)

## Interactive controls (Explore) — `limits-continuity`
> Initialized from `ex-parabola` at \(a=3\), the scene's own example.
- **Primary controls:** function picker (the six fixtures above, plus
  `ex-hidden-spike`); the point \(a\); the tolerance \(\varepsilon\); a **grid
  spacing** for the sampling panel.
- **Primary readouts:** the candidate forced value; the smallest \(\delta\) that
  answers the current \(\varepsilon\) (computed, not guessed); a verdict —
  *guarantee met* / *cannot be met*; the three-part continuity test with each part
  ticked or crossed.
- **Progressive disclosure:** "Show the shrinking-interval table"; "Show the
  symbolic statement"; **"Sample it"** — overlays the grid, the sampled polyline,
  and, when a modulus is supplied for the fixture, the guaranteed band around it.
  On `ex-hidden-spike` the true curve leaves the polyline's neighbourhood
  entirely until the spacing is reduced.
- **Clamp ranges:** \(\varepsilon \in [10^{-3}, 2]\) on a log slider; \(a\) clamped
  to the fixture's domain.
- **Reset:** returns to `ex-parabola`, \(a=3\), \(\varepsilon=0.5\).

## Exercises (Practice)

| # | Objective | Type | Deterministic answer | Feedback (why) |
| --- | --- | --- | --- | --- |
| 1 | `lim-diagnose-definition` — decide existence and name the failure on four fresh functions, **from their definitions** | `exercise-sequence`, typed failure mode | exists / jump / oscillation / blow-up | Points at which band cannot be answered, and why one-sided limits settle the jump case. *(Graph reading is practised in the explorer; no graded item captures it — see the contract's §1e.)* |
| 2 | `lim-point-value-irrelevant` — say what changes if \(f(a)\) is altered | `text`, produced | "nothing" (normalized: none/no change/unchanged) | Re-shows the puncture beat: the definition consults \(0<\lvert x-a\rvert\). |
| 3 | `lim-zero-over-zero-fresh` — a \(0/0\) quotient the scene never shows | `exercise-sequence`: the agreeing expression (typed), then its value | `x+5`, then 10 | The expression is elicited **before** the number, because exhibiting it is the outcome; cancelling produces a *second* function, not a repair. |
| 4 | `lim-continuity-test` — three-part test on a fresh piecewise function | `exercise-sequence` | per-part verdicts + overall | Names which part failed. |
| 5 | `lim-limit-not-continuity` — construct a function with a limit but no continuity at \(x=1\), as the pair (limit, value) | **`construct-in-explorer`**, predicate-graded (ceiling E4) | any finite pair that differs | Rejects equal coordinates (a continuous point) and explains why removability is exactly the gap. **The lesson's only E4 claim.** |
| 6 | `lim-repair-transfer` — can changing one point repair the limit, continuity, both, neither? | `exercise-sequence` on an unfamiliar function | continuity only | The limit is fixed by the neighbours and cannot be edited at a point. |
| 7 | `lim-why-substitution-works` — justify substituting into a polynomial | `text` | cites continuity | Rejects "because it's easy"; requires the property to be named. |
| 7b | `lim-continuity-not-enough` — the samples are all near zero; may you conclude the function is? | `exercise-sequence` (verdict → what would have to be added) | no; a resolution **and** a modulus | Shows `ex-hidden-spike`; names the two missing ingredients. |
| 7c | `lim-choose-spacing` — given \(\omega(\delta)=3\delta\) and a tolerance of \(0.06\), choose a grid spacing | `numeric` | \(\delta \le 0.02\) | The modulus used as a working tool, not a definition to recite. |
| 8 | `lim-symbolic-recognition` — pick the statement matching the guarantee | `multiple-choice` | the \(\varepsilon\)–\(\delta\) form | **Recorded as E1 recognition.** Distractors reverse the quantifiers and drop \(0<\lvert x-a\rvert\). |

## Insight traceability

| Contract obligation | Learner-facing location | Evidence of understanding |
| --- | --- | --- |
| C1–C3 the speedometer contradiction | `paradox` beat; motivating question | Learner states why the instant formula fails yet a number exists |
| C4 averages settle | `shrink` beat; explorer table | Learner reads the settling value from the table |
| C5–C6 the guarantee is the definition | `band`, `window`, `predict`, `tighter` beats | Learner answers the prediction: a narrower band still has a window |
| C7 the point never voted | `puncture` beat | Ex. 2 (`lim-point-value-irrelevant`), Ex. 6 |
| C8 \(0/0\) is a question | `paradox` + §7 of the contract, shown as two expressions | Ex. 3 |
| C9 continuity | `continuity` beat; explorer three-part test | Ex. 4, Ex. 7 |
| C10 continuity licenses substitution and no more | `local-only` beat | Ex. 7, Ex. 7b |
| C10b resolution + modulus | `modulus` beat; explorer "Sample it" | Ex. 7b, Ex. 7c |
| C11 four failures | `fail` beat | Ex. 1 |
| C12 forward to L2/L3 | Key takeaway | — (carried by L2's opening) |
| **Bridge** speedometer | Motivating question, `paradox` | Learner restates the contradiction |
| **Analogy limit** "the needle arrives" | `window` beat caption | Learner does not describe motion in Ex. 2's answer |
| **Abstraction return** | Ex. 7 | Learner cites continuity, not the car |

## Key takeaway (Summarize)
> A limit is what the neighbours force. The point itself never gets a vote — which
> is why a rate can exist exactly where its formula does not.
>
> Continuity is that guarantee holding with the function's own value as the
> target. It is a promise about each point's neighbourhood, not about the gaps
> between your samples — closing those needs a resolution and a modulus.

## Notation
- \(\lim_{x\to a} f(x) = L\); \(\varepsilon\) for the output tolerance, \(\delta\)
  for the input window; \(0<\lvert x-a\rvert<\delta\) always written with the
  strict left inequality, since that is the point of the lesson.
- \(f(a^-)\), \(f(a^+)\) for one-sided limits, used only in the jump case.
- \(\omega(\delta)\) for the modulus of continuity, carried unchanged into
  `fundamental-theorem`'s uniformity step.
- Open circle = value not taken; solid dot = value taken. Fixed for the course.

## Edge cases
- Removable discontinuity where \(f(a)\) exists but differs (not only where it is missing).
- A jump where one-sided limits exist and differ.
- \(\sin(1/x)\): the band can never be answered; labelled "no forced value", never "0".
- \(1/x^2\): outputs leave every band; distinguished from oscillation.
- Continuity is **local**: a function continuous at one point may be wild elsewhere.
- `ex-hidden-spike`: continuous everywhere, yet a tall narrow spike sits entirely
  between two adjacent samples of a coarse grid. The lesson's proof that
  continuity alone is not a sampling licence.

## Mathematical invariants to assert
- [ ] difference quotient of `ex-parabola` equals \(6+h\) for every \(h \neq 0\) tested
- [ ] the punctured and unpunctured fixtures agree at every sampled \(x \neq a\)
- [ ] the reported smallest \(\delta\) genuinely answers the reported \(\varepsilon\) on a dense sample
- [ ] one-sided limits of `ex-jump` differ; of `ex-parabola` agree
- [ ] the continuity predicate agrees with the three-part test on every fixture
- [ ] `ex-oscillate` leaves any candidate band within every tested window (sampled witness, labelled as a witness rather than a proof)
- [ ] `ex-hidden-spike` is continuous on its interval **and** its maximum exceeds every sampled value on the declared coarse grid by a stated margin — the fixture must actually demonstrate the failure, not merely be asserted to
- [ ] a supplied modulus really bounds the fixture: \(\lvert f(x)-f(y)\rvert\le\omega(\lvert x-y\rvert)\) on a dense random pair sample

## Required tests
- [ ] Unit tests for `src/math/calculus.ts` (quotients, tables, fixtures, continuity predicate)
- [ ] Invariant tests (the list above)
- [ ] Component tests for the `function-plot` family: bands, window, punctured rendering, readouts, reset
- [ ] Grading-contract specs + `ITEM_ASSESSMENT_META` for all eight items
- [ ] Guided-scene hard gates + chapter seek spec
- [ ] Browser test: readouts correct, no console errors

## Acceptance checklist

**Built and accepted 2026-07-28.** Gate 8 record:
[mastery-contract §6](mastery-contract.md#6-acceptance-record-gate-8).

- [x] Approved Insight Contract linked and `PASS`; insight verbatim in metadata
- [x] Insight traceability table complete
- [x] Route composed intentionally from the block palette; Watch precedes Explore
- [x] Headings content-specific, not generic phase names
- [x] Guided-to-interactive continuity (same fixtures, same notation, same roles)
- [x] Progressive disclosure applied
- [x] KaTeX notation consistent with §Notation
- [x] Accessibility: labels, focus, readouts, reduced-motion frame
- [x] Diagrams labelled, unclipped, safe frame intact — verified by the
      text-clipping hard gate and by watching all eleven chapters at 1×
- [x] `docs/quality/lesson-correctness-checklist.md` completed
- [x] All tests pass — 40 math assertions, 94 explorer assertions, 85 grading
      assertions, 20/20 scene hard gates, chapter seeks, and
      `e2e/lesson-limits-continuity.spec.ts`
