# Lesson Plan — The Fundamental Theorem of Calculus (spine L4)

Stage 3. Consumes [insight.md](insight.md) (`PASS`) and
[mastery-contract.md](mastery-contract.md). **Flagship of Package A.**

## Approved insight (gate)
- [x] `Gate result: PASS`
- Exact primary insight — **verbatim, planning metadata only**:

  > Differentiating and accumulating are inverse processes, and the reason the
  > infinite sum collapses is **telescoping**: write the total change as a sum of
  > the small changes over each piece — an identity containing no calculus — and
  > every interior evaluation appears once positively and once negatively and
  > cancels. \(n\) contributions, \(n-1\) cancellations, two survivors, and the
  > survivors are the two ends. Put calculus in exactly one place, L2's local
  > linear model for each small change, and the total change **is** the integral.
  > The other half is the same statement read backwards. The interior never
  > mattered — which is the sentence that will be re-run over a region when
  > Green's theorem arrives.

- Learner phrasing: *"Everything in the middle cancels. Only the two ends survive."*
- Obstacle: the theorem usually restates a definition, so nothing is surprising and no argument is acquired to generalize.
- Mechanisms: structural compression, via representational change and predictive reorganization.
- Bridges: the odometer and speedometer (resolved); a staircase.
- Analogy limits to discard: a staircase has finitely many steps (**turned into content** — so does the identity); steps need not be flat or equal; the odometer does not "know" anything.
- Abstraction return: identify the telescoping mechanism in a sum with no integral in it.

## Route / ids
- Route: `/lesson/fundamental-theorem`
- `guidedSceneId`: `ftc-accumulate-then-measure` *(clip 1, top of page)*
- **Second placed clip:** `ftc-telescoping` *(clip 2)*, positioned by a
  `{ kind: "visual", sceneId: "ftc-telescoping" }` route block immediately after
  the telescoping identity is stated formally.
- `explorationId`: `fundamental-theorem`

> **Two clips, on purpose.** The lesson has two directions and they must not be
> blurred: clip 1 accumulates and then measures (the plausible half, which closes
> L3's loose end); clip 2 measures and then accumulates (the astonishing half,
> whose mechanism is the cancellation). Running them on one timeline would let the
> learner read the second as a continuation of the first rather than as its
> mirror.

## Motivating question
> An integral is a limit of sums with no end to the number of terms. The odometer
> in the car produced the same answer without adding up anything at all. What did
> it know that we don't?

## Shared examples
- **Main example id:** `ex-drive` — fourth and final appearance. Both instruments
  on screen; the agreement they have enjoyed since L1 becomes a theorem.
- **Corroboration:** `ex-parabola` on \([0,2]\). L3 obtained \(8/3\) from
  \(\frac43\cdot\frac{(n+1)(2n+1)}{n^2}\) with no antiderivative; this lesson
  obtains \(8/3\) from \(\bigl[x^3/3\bigr]_0^2\). **Both computations must appear
  on screen together.** This is only possible because L3 refused the shortcut.
- **Unequal partition:** a deliberately irregular chopping, used for the
  cancellation so that "the pieces must be equal" is never suggested.
- **Standing counterexample:** \(e^{-x^2}\).
- **Fresh, practice only:** integrands and a calculus-free telescoping sum the
  clips never show.

## Supporting concepts
- The evaluation bracket \(\bigl[F(x)\bigr]_a^b\), introduced once.
- Antiderivatives by inspection for \(x^n\), \(\sin\), \(\cos\), \(e^x\) — each
  **verified by differentiating it on screen**, never asserted. No technique.

## Guided-scene outline (Watch) — clip 1, `ftc-accumulate-then-measure`

Picks up L3's loose end and answers it.

| Step id | Name (learner-facing) | Idea revealed | Notation synced |
| --- | --- | --- | --- |
| `loose-end` | The thing left unexplained | L3's two traces, replayed: \(A\) rises fastest where \(f\) is highest. | \(A(x)=\int_a^x f\) |
| `sliver` | One more step | The right endpoint advances by \(h\); \(A\) gains one thin sliver. | \(A(x+h)-A(x)\) |
| `squeeze` | Trapped between two rectangles | The sliver is bounded by \(m_h h\) and \(M_h h\); both bars are drawn. | \(m_h \le \frac{A(x+h)-A(x)}{h}\le M_h\) |
| `predict` | **Prediction beat** | *As the step shrinks, the two bars close on something. On what?* Nothing moves. | — |
| `close` | They close on \(f(x)\) | Continuity (L1) drives \(m_h,M_h \to f(x)\). So \(A' = f\). | \(A'(x)=f(x)\) |
| `answer` | The loose end, explained | \(f\) *is* \(A\)'s slope — which is why \(A\) rose fastest where \(f\) was highest. | — |
| `lower-limit` | Moving the start | \(a\) is changed; \(A\) shifts vertically; its slope does not change. | \(A_a\) vs \(A_{a'}\) |

## Guided-scene outline (Watch) — clip 2, `ftc-telescoping`

The mechanism. **This clip's family is re-run in L34.**

| Step id | Name (learner-facing) | Idea revealed | Notation synced |
| --- | --- | --- | --- |
| `staircase` | Total rise, with no calculus | A staircase; every landing is the top of one step and the bottom of the next; total rise = top − bottom. | \(\sum(\text{step heights})\) |
| `identity` | The same thing, written out | \(F(b)-F(a)=\sum(F(x_{i+1})-F(x_i))\) on an **unequal** partition. Each interior \(F(x_i)\) is written twice, in opposite signs. | the identity, in full |
| `cancel` | Everything in the middle goes | Paired interior terms annihilate one by one; the survivor count is displayed: \(n\) terms, \(n-1\) cancellations, **2** left. | live counters |
| `one-step` | Calculus enters, once | Each small change is replaced by L2's local model \(f(x_i)\Delta x_i\), with its error drawn. | \(F(x_{i+1})-F(x_i)=f(x_i)\Delta x_i+E_i\) |
| `riemann` | That is a Riemann sum | The replaced terms are exactly L3's rectangles; the strip is re-drawn beneath. | \(\sum f(x_i)\Delta x_i\) |
| `refine` | Refine, and it is exact | Mesh shrinks, errors vanish, the identity becomes the theorem. **L1's modulus is named on screen as the assumption doing the "uniformly".** | \(\int_a^b f = F(b)-F(a)\); \(\omega(\delta)\) |
| `corroborate` | Two computations, one number | L3's summation value and \(\bigl[x^3/3\bigr]_0^2\) side by side. Both \(8/3\). | both shown |
| `not-a-recipe` | What it does not promise | \(e^{-x^2}\): the theorem applies, no elementary \(F\) exists, numerical accumulation stays the method. | — |

- **Pauses / dimming:** `predict` in clip 1 is a true hold; `cancel` holds after
  the counters settle.
- **Honest labelling:** the `one-step` beat draws \(E_i\) as a **visible nonzero
  quantity** (as L2 did); the unproved uniformity assumption is named on screen at `refine`, **as L1's
  modulus of continuity** rather than as an unattributed hand-wave; `corroborate` shows two independently computed numbers, not one number
  twice.
- **Visual family:** this scene **creates** `telescoping-cancellation`, and it
  **must be parameterized over which contributions cancel against which** — L34
  re-runs it with shared interior edges of a subdivided region instead of shared
  endpoints. Hard-coding it to an interval is the one implementation shortcut that
  would quietly cost the course its capstone.

## Checkpoint (Check understanding)
- Prompt: *Suppose the Fundamental Theorem were false — the accumulated
  speedometer and the odometer's change came out different. What would you
  conclude?*
- Type: produced short answer.
- Reveal: that one of the two instruments is not measuring what we said it was.
  They are two readings of a single journey; the theorem is the statement that
  the readings are consistent. That is why the theorem *feels* obvious in the car
  and is not obvious at all in symbols.

## Interactive controls (Explore) — `fundamental-theorem`
> Initialized from `ex-parabola` on \([0,2]\) — L3's own corroboration case.
- **Primary controls:** integrand fixture; the interval; the number of pieces;
  a toggle **equal / unequal partition**; a constant \(C\) added to \(F\); the
  lower limit \(a\) of the running total.
- **Primary readouts:** \(F(b)-F(a)\); the refined Riemann sum; **their
  difference** (the readout that carries the theorem); the survivor count from the
  cancellation; \(A(x)\) and its numerically computed slope beside \(f(x)\).
- **Progressive disclosure:** "Show the cancellation term by term"; "Show the
  error \(E_i\) on each piece"; "Show the two computations side by side".
- **Clamp ranges:** pieces \(\in [2, 256]\); \(C \in [-5,5]\); \(a\) inside the domain.
- **Reset:** `ex-parabola`, \([0,2]\), 8 unequal pieces, \(C=0\).

## Exercises (Practice)

Tiers and evidence levels below are the **reconciled** values (mastery-contract
§1d and its evidence-ceiling reconciliation) — `check` (2), `drill` (4),
`transfer` (4); no item exceeds its capability's ceiling, so this lesson claims
no E4.

| # | Objective | Type | Tier / evidence | Deterministic answer | Feedback (why) |
| --- | --- | --- | --- | --- | --- |
| 1 | `ftc-evaluate-fresh` — evaluate a fresh definite integral | `exercise-sequence` (verify \(F'=f\), `numeric` → does it match at one point or identically, `multiple-choice` since 2026-07-30 → evaluate, `numeric`) | drill / E3 | per step | The verification step is graded, so an \(F\) that is guessed and wrong fails at the right place. E3 rests on the two produced numeric steps. |
| 2 | `ftc-differentiate-integral` — \(\frac{d}{dx}\int_a^x f\) at a given point | `numeric`, fresh integrand | check / E3 | \(f(x_0)\) | Re-shows the sliver argument. |
| 3 | `ftc-telescope-count` — on an unequal partition, which terms cancel and how many survive? | `exercise-sequence` | drill / E3 | pairs; \(2\); the two ends | Rejects "the pieces must be equal"; the identity never used equality. |
| 4 | `ftc-why-collapse` — explain the collapse without notation | `multiple-choice` (converted from `text` 2026-07-30) | drill / **E2** | interior terms cancel in pairs | Rejects "because integration is the opposite of differentiation" as a choice that names the conclusion rather than the reason. |
| 5 | `ftc-constant-cancels` — what changes if \(F \to F+C\)? | `exercise-sequence`, both steps `multiple-choice` (converted from `text` 2026-07-30) | drill / **E2** | nothing | It is a difference; \(C\) appears twice with opposite signs — a telescoping cancellation of its own. |
| 6 | `ftc-lower-limit-shift` — which statement describes \(A\) with a different lower limit? | `multiple-choice` (4 prose statements) | check / **E2** | vertically shifted, same slope | **Recorded as recognition** — a picker cannot exceed E2. Distractors: horizontally shifted, scaled, and slope-changed. |
| 7 | `ftc-no-elementary-antiderivative` — what does the theorem not promise? | `exercise-sequence`, both steps `multiple-choice` (converted from `text` 2026-07-30 — the second now selects among four listed integrands) | transfer / **E2** | existence ≠ formula; \(e^{-x^2}\) (or another accepted non-elementary integrand) | Rejects a choice naming a function that DOES have an elementary antiderivative. **Corrected 2026-07-30** — the first E3 reconciliation rested on a `text` step the MCQ-conversion pass later converted. |
| 8 | `ftc-falsify` — what would be wrong with the world if it were false? | `multiple-choice` (converted from `text` 2026-07-30) | transfer / **E2** | two instruments would disagree | The checkpoint, made a graded item. **Corrected 2026-07-30**, same reason as #7. |
| 9 | `ftc-telescope-transfer` — \(\sum_{k=1}^{n}(1/k - 1/(k+1))\), then: which step is this, and what plays \(F\)? | `exercise-sequence`: evaluate (`numeric`) → which step (`multiple-choice`) → what plays \(F\) (`text`, produced; unaffected by the MCQ-conversion pass) | transfer / **E3** | \(1 - \frac1{n+1}\); the identity step; \(F(k)=-1/k\) | **The transfer item.** No integral, no calculus — it is answerable only by a learner who took the mechanism. **Reconciled from an aspirational E4** — `exercise-sequence` is capped at E3 regardless of step count, the same correction A2 applied to its transfer chains. |
| 10 | `ftc-corroborate` — both computations of \(\int_0^2 x^2\), and why agreement is evidence | `exercise-sequence` (`numeric` ×2 + one step converted from `text` to `multiple-choice` 2026-07-30) | transfer / E3 | \(8/3\), \(8/3\) | Because the summation route never used an antiderivative, agreement is independent corroboration rather than circularity. The E3 claim rests on the two produced values, which are the corroboration itself. |

## Insight traceability

| Contract obligation | Learner-facing location | Evidence of understanding |
| --- | --- | --- |
| C1 the running total (from L3) | clip 1 `loose-end` | Ex. 2 |
| C2–C3 the sliver, bounded (cites L1) | clip 1 `sliver`, `squeeze` | Ex. 2 |
| C4 \(A'=f\) | clip 1 `predict`, `close` | Ex. 2 |
| C5 L3's loose end explained | clip 1 `answer` | Ex. 4's reasoning |
| C6 the identity, no calculus | clip 2 `staircase`, `identity` | Ex. 3, Ex. 9 |
| C7 the cancellation and the count | clip 2 `cancel`; explorer survivor count | Ex. 3, Ex. 4 |
| C8 calculus enters once (cites L2 C5) | clip 2 `one-step` | Ex. 1 |
| C9 the theorem | clip 2 `riemann`, `refine` | Ex. 1 |
| C10 \(+C\) cancels | explorer \(C\) control | Ex. 5 |
| C11 existence, not a recipe | clip 2 `not-a-recipe` | Ex. 7 |
| C12 falsification | Checkpoint | Ex. 8 |
| C13 the two computations agree | clip 2 `corroborate` | Ex. 10 |
| C14 forward to L34 | a `looking-ahead` layer, one paragraph | — *(promise, not assessed)* |
| **Bridge** two instruments / staircase | Motivating question; clip 2 `staircase` | Ex. 8 |
| **Analogy limit** finitely many steps | clip 2 `identity` caption | Ex. 3 |
| **Abstraction return** | Ex. 9 | Mechanism named with no integral present |

## Key takeaway (Summarize)
> Chop the change into pieces and every interior value is added once and
> subtracted once. Only the two ends survive — which is why a sum with no end to
> its terms can be replaced by two evaluations.
>
> *Keep this argument. It is going to be re-run over a region, and then it will be
> called Green's theorem.*

## Notation
- \(F\) for an antiderivative; \(A(x)=\int_a^x f\) for the running total, carried
  unchanged from L3; \(\bigl[F(x)\bigr]_a^b\) introduced once.
- \(E_i\) for the per-piece error, carried unchanged from L2 — the same symbol
  deliberately, because it is the same quantity.
- Cancelling pairs drawn in the `original`/`transformed` semantic roles and struck
  through; survivors in `selected`.

## Edge cases
- **Unequal partition** — the default in clip 2, so equality is never implied.
- \(F+C\) — the definite integral unchanged.
- Lower limit moved — \(A\) shifts, slope does not.
- \(f<0\) on part of the interval — \(F\) decreasing there.
- \(a=b\) — both sides zero, the degenerate identity.
- \(e^{-x^2}\) — the theorem applies and no elementary \(F\) exists.

## Mathematical invariants to assert
- [ ] the telescoping identity holds **exactly** for randomly generated unequal partitions (pure arithmetic, no calculus)
- [ ] \(F(b)-F(a)\) equals the refined Riemann sum within tolerance on every fixture
- [ ] numerically differentiated \(A\) equals \(f\) on every fixture
- [ ] adding \(C\) to \(F\) leaves the definite integral bit-identical
- [ ] moving the lower limit shifts \(A\) by a constant and leaves \(A'\) unchanged
- [ ] the two independent computations of \(\int_0^2 x^2\) agree to machine tolerance
- [ ] every antiderivative used by inspection satisfies \(F'=f\) on a dense sample
- [ ] **`telescoping-cancellation` accepts a non-interval pairing** (the L34 generalization test)

## Required tests
- [ ] Unit tests for the FTC helpers in `src/math/calculus.ts`
- [ ] Invariant tests (the list above, including the parameterization test)
- [ ] Component tests: explorer difference readout, survivor count, equal/unequal toggle, \(C\) control, reset
- [ ] Grading contracts + `ITEM_ASSESSMENT_META` for all ten items
- [ ] Guided-scene hard gates + chapter seek for **both** clips
- [ ] Route test: the placed `visual` block renders `ftc-telescoping`
- [ ] Browser test: readouts correct, no console errors

## Acceptance checklist
- [ ] Approved Insight Contract linked and `PASS`; insight verbatim in metadata
- [ ] Insight traceability table complete
- [ ] Route intentional; the second clip's placement justified in-plan
- [ ] Headings content-specific
- [ ] Guided-to-interactive continuity across both clips and the explorer
- [ ] Progressive disclosure applied
- [ ] KaTeX notation consistent; \(A\), \(E_i\) carried from L3/L2 unchanged
- [ ] Accessibility: labels, focus, readouts, reduced-motion frames for both clips
- [ ] Diagrams labelled, unclipped, safe frame intact
- [ ] The unproved uniformity step is named on screen, citing L1's modulus of continuity
- [ ] `telescoping-cancellation` parameterized, with its test
- [ ] `docs/quality/lesson-correctness-checklist.md` completed
- [ ] All tests pass
