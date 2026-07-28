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
  > value and the actual value agree, which is the promise that nothing hides
  > between your samples.

- Learner phrasing: *"The neighbours decide. The point itself never gets a vote."*
- Obstacle: an incorrect prior model ("substitute, cancelling if it breaks") plus notation with no operational content.
- Mechanisms: operational grounding + representational change + predictive reorganization.
- Bridge: a speedometer reading at an instant.
- Analogy limits to discard: the needle "arriving"; instrument lag; finite precision.
- Abstraction return: justify a substitution by citing continuity, with no reference to the car.

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
  trace. Used by the guided scene **and** the explorer. Recurs in L2, L5, L6.
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
- Prompt: *The graph below has a hole at \(x=2\) and a solid dot at \(x=2\)
  sitting well above the hole. What is \(\lim_{x\to2}f(x)\), and what is \(f(2)\)?*
- Type: produced numeric pair (not multiple choice).
- Reveal: the limit reads the hole; \(f(2)\) reads the dot; they differ, so \(f\)
  is not continuous at 2 — and the limit did not care.

## Interactive controls (Explore) — `limits-continuity`
> Initialized from `ex-parabola` at \(a=3\), the scene's own example.
- **Primary controls:** function picker (the six fixtures above); the point \(a\);
  the tolerance \(\varepsilon\).
- **Primary readouts:** the candidate forced value; the smallest \(\delta\) that
  answers the current \(\varepsilon\) (computed, not guessed); a verdict —
  *guarantee met* / *cannot be met*; the three-part continuity test with each part
  ticked or crossed.
- **Progressive disclosure:** "Show the shrinking-interval table"; "Show the
  symbolic statement".
- **Clamp ranges:** \(\varepsilon \in [10^{-3}, 2]\) on a log slider; \(a\) clamped
  to the fixture's domain.
- **Reset:** returns to `ex-parabola`, \(a=3\), \(\varepsilon=0.5\).

## Exercises (Practice)

| # | Objective | Type | Deterministic answer | Feedback (why) |
| --- | --- | --- | --- | --- |
| 1 | `lim-diagnose-graph` — decide existence and name the failure on four fresh graphs | `exercise-sequence`, typed failure mode | exists / jump / oscillation / blow-up | Points at which band cannot be answered, and why one-sided limits settle the jump case. |
| 2 | `lim-point-value-irrelevant` — say what changes if \(f(a)\) is altered | `text`, produced | "nothing" (normalized: none/no change/unchanged) | Re-shows the puncture beat: the definition consults \(0<\lvert x-a\rvert\). |
| 3 | `lim-zero-over-zero-fresh` — a \(0/0\) quotient the scene never shows | `numeric` | the forced value | Shows the agreeing expression and stresses that cancelling exhibits a *second* function, not a repair. |
| 4 | `lim-continuity-test` — three-part test on a fresh piecewise function | `exercise-sequence` | per-part verdicts + overall | Names which part failed. |
| 5 | `lim-limit-not-continuity` — construct a function with a limit but no continuity at \(x=1\) | `construct`, predicate-graded | any removable discontinuity at 1 | Rejects continuous answers and answers with a jump; explains why removability is exactly the gap. |
| 6 | `lim-repair-transfer` — can changing one point repair the limit, continuity, both, neither? | `exercise-sequence` on an unfamiliar function | continuity only | The limit is fixed by the neighbours and cannot be edited at a point. |
| 7 | `lim-why-substitution-works` — justify substituting into a polynomial | `text` | cites continuity | Rejects "because it's easy"; requires the property to be named. |
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
| C10 sampling guarantee | `continuity` beat closing line | Ex. 7 |
| C11 four failures | `fail` beat | Ex. 1 |
| C12 forward to L2/L5 | Key takeaway | — (carried by L2's opening) |
| **Bridge** speedometer | Motivating question, `paradox` | Learner restates the contradiction |
| **Analogy limit** "the needle arrives" | `window` beat caption | Learner does not describe motion in Ex. 2's answer |
| **Abstraction return** | Ex. 7 | Learner cites continuity, not the car |

## Key takeaway (Summarize)
> A limit is what the neighbours force. The point itself never gets a vote — which
> is why a rate can exist exactly where its formula does not.

## Notation
- \(\lim_{x\to a} f(x) = L\); \(\varepsilon\) for the output tolerance, \(\delta\)
  for the input window; \(0<\lvert x-a\rvert<\delta\) always written with the
  strict left inequality, since that is the point of the lesson.
- \(f(a^-)\), \(f(a^+)\) for one-sided limits, used only in the jump case.
- Open circle = value not taken; solid dot = value taken. Fixed for the course.

## Edge cases
- Removable discontinuity where \(f(a)\) exists but differs (not only where it is missing).
- A jump where one-sided limits exist and differ.
- \(\sin(1/x)\): the band can never be answered; labelled "no forced value", never "0".
- \(1/x^2\): outputs leave every band; distinguished from oscillation.
- Continuity is **local**: a function continuous at one point may be wild elsewhere.

## Mathematical invariants to assert
- [ ] difference quotient of `ex-parabola` equals \(6+h\) for every \(h \neq 0\) tested
- [ ] the punctured and unpunctured fixtures agree at every sampled \(x \neq a\)
- [ ] the reported smallest \(\delta\) genuinely answers the reported \(\varepsilon\) on a dense sample
- [ ] one-sided limits of `ex-jump` differ; of `ex-parabola` agree
- [ ] the continuity predicate agrees with the three-part test on every fixture
- [ ] `ex-oscillate` leaves any candidate band within every tested window (sampled witness, labelled as a witness rather than a proof)

## Required tests
- [ ] Unit tests for `src/math/calculus.ts` (quotients, tables, fixtures, continuity predicate)
- [ ] Invariant tests (the list above)
- [ ] Component tests for the `function-plot` family: bands, window, punctured rendering, readouts, reset
- [ ] Grading-contract specs + `ITEM_ASSESSMENT_META` for all eight items
- [ ] Guided-scene hard gates + chapter seek spec
- [ ] Browser test: readouts correct, no console errors

## Acceptance checklist
- [ ] Approved Insight Contract linked and `PASS`; insight verbatim in metadata
- [ ] Insight traceability table complete
- [ ] Route composed intentionally from the block palette; Watch precedes Explore
- [ ] Headings content-specific, not generic phase names
- [ ] Guided-to-interactive continuity (same fixtures, same notation, same roles)
- [ ] Progressive disclosure applied
- [ ] KaTeX notation consistent with §Notation
- [ ] Accessibility: labels, focus, readouts, reduced-motion frame
- [ ] Diagrams labelled, unclipped, safe frame intact
- [ ] `docs/quality/lesson-correctness-checklist.md` completed
- [ ] All tests pass
