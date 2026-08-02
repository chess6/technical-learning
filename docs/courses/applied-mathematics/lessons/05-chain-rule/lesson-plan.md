# Lesson Plan — The Chain Rule: Rates Compose (spine L5)

Stage 3. Consumes [insight.md](insight.md) (`PASS`) and
[mastery-contract.md](mastery-contract.md). **First lesson of Package B.**

## Approved insight (gate)
- [x] `Gate result: PASS`
- Exact primary insight — **verbatim, planning metadata only**:

  > The chain rule is what happens when you substitute one local-linear model
  > into another, and doing that honestly (with error terms, not difference
  > quotients) is what repairs the gap in "cancel the du's." Composing \(g\)'s
  > approximation into \(f\)'s never needs to divide by \(\Delta u\) — it only
  > ever substitutes it — which is exactly why the rule keeps working at
  > \(g'(a)=0\), a case the naive cancellation story cannot even approach.

- Learner phrasing: *"Feed one approximation's output into the other, and the
  slopes compound."*
- Obstacle: an incorrect prior model held with high confidence — "cancel the
  \(du\)'s" is treated as the proof, when it silently requires
  \(\Delta u\neq0\).
- Mechanisms: structural compression, via representational change (composing
  two zooms) and predictive/causal reorganization (repairing the
  cancel-\(du\) gap).
- Bridges: two zooms in sequence, resumed from L2's own zoom.
- Analogy limits to discard: the second zoom's window is not literally a
  sub-window of the first (different axis — \(u\) vs. \(x\)); zooming twice is
  **multiplicative**, not additive, compounding.
- Abstraction return: predict \((f\circ g)'(a)=0\) at \(g'(a)=0\) before
  computing, with no reference to zooming.

## Route / ids
- Route: `/lesson/chain-rule`
- `guidedSceneId`: `chain-rule`
- `explorationId`: `chain-rule`

## Motivating question
> You already know \(\frac{d}{dx}x^2\) and you already know
> \(\frac{d}{du}u^3\). What is \(\frac{d}{dx}(x^2+1)^3\) — and why isn't
> the answer just "multiply the two rules you already know"?

## Shared examples
- **Main example id:** the composite \(f(u)=u^3\), \(g(x)=x^2+1\), evaluated
  at \(a=1\) (insight §7's worked derivation). \(g\) is fresh; \(f(u)=u^3\)
  coincides with L2/L4's `ex-cubic-inflection`, reused here in a new role
  (composed, not displayed alone) — a reuse, honestly, not a fresh function;
  the composite as an object is still new.
- **Corroboration:** the same composite, expanded directly to
  \(x^6+3x^4+3x^2+1\) and differentiated termwise — both routes must appear
  on screen together, agreeing at \(24\).
- **Prediction example:** the guided scene's own `predict` beat, on the main
  worked composite — \(f'(2)\) is withheld from f's panel until `zoomOuter`,
  so "what decides f's slope" has a real, undisplayed answer when asked. (A
  trigonometric-of-polynomial composite was planned here at Gate 3/4 but
  descoped at build time; `chain-differentiate-fresh` carries the
  recognize-and-differentiate outcome instead, on a polynomial composite.)
- **Corner example:** `ex-abs` (L2's corner), reused as the **inner**
  function — a new role for a carried fixture, not a repeated one.
- **Fresh, practice only:** composites the guided scene never shows.

## Supporting concepts
- Composition of functions, \(f\circ g\), stated once and connected
  immediately to L2's own notation.
- The \(1\times1\)-matrix reading of a derivative (L2 C9), reused, not
  re-derived.

## Guided-scene outline (Watch) — `chain-rule`

| Step id | Name (learner-facing) | Idea revealed | Notation synced |
| --- | --- | --- | --- |
| `twoRates` | Two rates you already know | \(g(x)=x^2+1\) and \(f(u)=u^3\), each shown as its own local-linear model (L2, recalled). | \(g'(a)\), \(f'(b)\) |
| `feedThrough` | One feeds the other | \(f\circ g\): \(g\)'s output becomes \(f\)'s input. Composition, no derivative yet. | \(b=g(a)\) |
| `zoomInner` | Zoom into \(g\) | Magnify \(g\) at \(a\); the window narrows to a line of slope \(g'(a)\). | \(g(a+h)\approx g(a)+g'(a)h\) |
| `predict` | **Prediction beat** | *f's panel is about to be magnified too — what decides its slope?* Nothing moves; \(f'(2)\) is not yet on screen. | — |
| `zoomOuter` | Zoom into \(f\), using the first zoom's output | The first window's content, near \(b=g(a)\), is exactly what a second zoom (into \(f\)) magnifies. | \(f(b+k)\approx f(b)+f'(b)k\) |
| `compound` | Two magnifications, one number | The compound magnification is a **product**, not a sum — displayed live as the two factors multiply. | \(f'(b)\cdot g'(a)\) |
| `duCancelFails` | The popular proof, examined | "Cancel the \(du\)'s" regroups \(\Delta y/\Delta x\) as \((\Delta y/\Delta u)(\Delta u/\Delta x)\) — which silently needs \(\Delta u\neq0\). Flagged, not dismissed. | \(\Delta u = g(a+h)-g(a)\) |
| `residualCompose` | The honest repair | Substitute \(g\)'s model as \(f\)'s input in the **identity** \(f(b+k)=f(b)+f'(b)k+E_f(k)\) — never a division, and \(E_f(0)=0\) automatically. | \(E_f(k(h))\), \(k(h)=g(a+h)-g(a)\) |
| `result` | The rule, earned | \((f\circ g)'(a)=f'(g(a))g'(a)\). Checked live at \(g'(a)=0\): the result is \(0\), directly, no special case. | \((f\circ g)'(a)=f'(g(a))g'(a)\) |

- **Pauses / dimming:** `predict` is a true hold — nothing moves while the
  question stands, and \(f'(2)\) is not revealed until `zoomOuter`, so the
  question has a real, undisplayed answer at the moment it is asked.
  `duCancelFails` is also a true hold — the scene shows the regrouping step
  and waits before revealing what it silently assumes.
- **Honest labelling:** `residualCompose` draws \(E_f(k(h))\) as a **visible
  labelled quantity**, the same discipline L2 used for \(E(h)\), never hidden
  inside an "approximately equals."
- **Visual family:** this scene **reuses** `local-linearity-zoom` as **two
  linked panels** (the reuse `LocalLinearityZoom.tsx`'s own module docstring
  already anticipates), with no new family created — Supporting tier
  ([architecture §5.1](../../curriculum-architecture.md#51-visual-budget-flagship-vs-supporting)).

## Checkpoint (Check understanding)
- Prompt: *A composite \(f(g(x))\) has \(g'(3)=0\). Without computing
  anything else, what is \((f\circ g)'(3)\) — and why doesn't "cancel the
  \(du\)'s" make this obvious?*
- Type: produced short answer.
- Reveal: \((f\circ g)'(3)=f'(g(3))\cdot0=0\) directly from the rule; the
  cancellation story cannot approach this case because it would need to
  divide by \(\Delta u\), which need not even be nonzero near \(x=3\).

## Interactive controls (Explore) — `chain-rule`
> Initialized from \(f(u)=u^3\), \(g(x)=x^2+1\), \(a=1\) — the lesson's own
> worked example.
- **Primary controls:** preset picker over \((f,g)\) pairs (including one with
  \(g'(a)=0\) and one with \(g=|x|\) as the inner function); the evaluation
  point \(a\); a **toggle** "show the cancel-\(du\) attempt" vs. "show the
  residual-composition derivation".
- **Primary readouts:** \(g'(a)\), \(f'(g(a))\), and their product; the two
  linked magnification factors and their compound; the direct-expansion
  cross-check value, where the composite is expandable.
- **Progressive disclosure:** "Show \(E_f(k(h))\) and \(E_g(h)\) on each
  panel"; "Show where cancel-\(du\) divides by \(\Delta u\)".
- **Clamp ranges:** \(a\) inside both fixtures' domains; magnification factors
  bounded to keep both zoom windows legible.
- **Reset:** the lesson's own worked example, \(a=1\).

## Exercises (Practice)

Tiers and evidence levels below are recorded at their capability's ceiling
from the start (mastery-contract §1d's preflight) — `check` (2), `drill`
(3), `transfer` (2 evidence-bearing). One item, `chain-derive-fresh`, uses
`self-check` and is the only item requiring the substitution argument to be
PRODUCED rather than applied, which M2 (the lesson's central misconception)
needs — but it is **learner-self-marked in the lesson, not human-scored, and
claims no evidence level** (corrected 2026-08-01; see mastery-contract.md
§1d). It stays in the exercise set as practice; every other item stays at its
capability's E2/E3 ceiling and does carry a claim.

| # | Objective | Type | Tier / evidence | Deterministic answer | Feedback (why) |
| --- | --- | --- | --- | --- | --- |
| 1 | `chain-differentiate-fresh` — decompose and differentiate a fresh composite | `exercise-sequence` (decomposition, `multiple-choice` → \((f\circ g)'(a)\), `numeric`) | drill / E3 | the correct outer/inner pair; the numeric value | The decomposition step catches a learner who differentiates the wrong "outer" function. |
| 2 | `chain-zero-predict` — predict \((f\circ g)'(a)\) where \(g'(a)=0\) | `numeric` | transfer / E3 | \(0\) | Rewards C12 directly: no computation of \(f'(g(a))\) is even needed to know the product is \(0\). |
| 3 | `chain-du-cancel-fails` — what exactly fails in "cancel the \(du\)'s"? | `multiple-choice`, four candidate diagnoses | check / E2 | it silently requires \(\Delta u\neq0\) to regroup the limit as a product | Rejects "it's just not rigorous enough" (true but not the specific mechanism) and "it works but is inelegant" (false — it can fail to even be defined). |
| 4 | `chain-corroborate` — cross-check a chain-rule value against direct expansion | `exercise-sequence` (chain-rule value, `numeric` → expanded value, `numeric` → why it's evidence, `multiple-choice`) | drill / E3 | both values equal; agreement counts because expansion never used the chain rule | Mirrors L4's corroboration item — independence of the two routes is the point. |
| 5 | `chain-compound-zoom` — compute a compound magnification | `numeric` | drill / E3 | the product of the two given factors | Targets M5: compounding is multiplicative, not additive. |
| 6 | `chain-select-method` — choose the efficient route on a fresh composite | `exercise-sequence` (route, `multiple-choice`, names neither route → the answer, `numeric`) | transfer / E3 | efficient route depends on whether the composite is expandable; the numeric value | The prompt never says "chain rule" or "expand" — the learner must judge which applies. |
| 7 | `chain-derive-fresh` — reproduce the substitution derivation on a fresh pair | `self-check`, **learner-self-marked** | practice / **no evidence claim** | both local-linear models, the substitution, the \(k(h)=0\) case, the final division-by-\(h\) step | Targets M2 directly: stating the product with no substitution argument shown is NOT a pass. A real model answer and rubric guard the mathematics even though no one but the learner scores the attempt. |
| 8 | `chain-corner-not-necessary` — what follows when the inner function has a corner? | `multiple-choice` | check / E2 | the composite MAY still be differentiable there — the hypothesis is sufficient, not necessary | Rejects "the composite cannot be differentiable" — refuted by \(f(u)=u^2\), \(g(x)=|x|\), whose composite is \(x^2\). |

## Insight traceability

| Contract obligation | Learner-facing location | Evidence of understanding |
| --- | --- | --- |
| C1 composition, no derivatives yet | `feedThrough` | Ex. 1 |
| C2 \(g\)'s local-linear model (cites L2 C5) | `zoomInner` | Ex. 1, Ex. 7 |
| C3 \(f\)'s local-linear model, \(E_f(0)=0\) forced | `zoomOuter` | Ex. 1, Ex. 7 |
| C4 \(k(h)=\Delta u\) as a term, not a divisor | `duCancelFails` (the contrast) | Ex. 3, Ex. 7 |
| C5 the substitution identity | `residualCompose` | Ex. 1, Ex. 4, Ex. 7 |
| C6 dividing by \(h\), separating three terms | `residualCompose` (continued) | Ex. 4, Ex. 7 |
| C7 the composed-limits step (cites L1, L2 C11); the level-of-formality disclosure itself | `residualCompose` caption; the "the-repair" section's closing sentence | — *(named, not separately graded)* |
| C8 the result | `result` | Ex. 1, Ex. 2 |
| C9 the compression — L2's model substituted into itself | `zoomInner`/`zoomOuter` combined | Ex. 4, **Ex. 7 (the direct evidence — reproduces the substitution, not just its result)** |
| C10 \(1\times1\)-matrix reading (cites L2 C9, LA `matrix-composition`) | Explorer readout (the two factors and their product) | — *(stated; forward connection, not graded here — M4)* |
| C11 two zooms compound to one | `compound` | Ex. 5 |
| C12 \(g'(a)=0\) needs no special case | `predict` (asked) → `result` (checked live) | Ex. 2, Checkpoint |
| C13 forward to L7/`partial-derivatives-gradient`/`vector-fields-line-integrals` | a `looking-ahead` layer, one paragraph | — *(promise, not assessed)* |
| **Bridge** two zooms, resumed from L2 | `zoomInner`, `zoomOuter` | Ex. 5 |
| **Analogy limit** compounding is multiplicative, not additive | `compound` caption | Ex. 5 |
| **Abstraction return** | Checkpoint | Predicts \(0\) at \(g'(a)=0\) with no reference to zooming |

## Key takeaway (Summarize)
> Feed one local-linear model's output into the other, and their slopes
> compound — never divide by \(\Delta u\) to get there, only substitute it.
> That is why the rule keeps working exactly where "cancel the \(du\)'s"
> would need to divide by zero.
>
> *Keep the substitution move. Package B's next techniques — substitution,
> parts — are this same move, read forwards and backwards.*

## Notation
- \(f\circ g\) for the composite; \(b=g(a)\) for the inner function's output,
  carried as the outer function's evaluation point.
- \(k(h)=g(a+h)-g(a)\) for what "\(\Delta u\)" really is — a term in an
  identity, never written as a divisor.
- \(E_f\), \(E_g\) for the two residuals, carried unchanged from L2 — the
  same symbol, deliberately, because they are the same kind of quantity.

## Edge cases
- \(g'(a)=0\) — the result is \(0\) directly (C12), no special handling.
- \(g=|x|\) as the inner function — the composite may still be differentiable
  (the hypothesis is sufficient, not necessary).
- \(f\) or \(g\) not differentiable at the relevant point — no chain rule
  applies; named, not worked in full.
- The composite is not expandable in closed form — the chain rule is the
  only route (no corroboration cross-check available), named explicitly so
  Ex. 4/6 do not imply expansion is always possible.

## Mathematical invariants to assert
- [ ] the chain-rule value agrees with the direct-expansion derivative, to
      machine tolerance, on every composite where both are computable
- [ ] \((f\circ g)'(a)=0\) exactly when \(g'(a)=0\), across a battery of
      fixtures — the corroboration for C12
- [ ] the corner-composite fixture (\(g=|x|\), \(f(u)=u^2\)) is
      differentiable at the corner with derivative \(0\), confirmed
      numerically against the closed form \(x^2\)
- [ ] a second corner-composite fixture where non-differentiability of \(g\)
      genuinely propagates (e.g. \(f\) linear, non-constant) is confirmed
      NOT differentiable there, so Ex. 7 is not vacuously "always fine"
- [ ] every displayed derivative in the guided scene and explorer traces to
      `src/math`, never to a value computed only in presentation code

## Required tests
- [ ] Unit tests for any new chain-rule helpers in `src/math` (a Mode C
      implementation decision on exact shape — direct composition of
      existing derivative helpers, or a small new `chainRule`-style export)
- [ ] Invariant tests (the list above)
- [ ] Component tests: explorer readouts (the two factors, their product,
      the compound magnification), preset switching, the cancel-\(du\)/
      residual-composition toggle
- [ ] Grading contracts for all seven auto-graded lesson-owned items (the
      eighth, `chain-derive-fresh`, is **learner-self-marked and exempt for
      that reason** — not because a human reviewer scores it; `/review`
      reads module `AttemptSet`s, and a lesson's `ExercisePanel` never routes
      a `self-check` item there), with the adversarial reject battery (a
      wrong decomposition; the two derivative values swapped; the compound
      magnification computed additively instead of multiplicatively; the
      corner-composite item's distractor answers)
- [ ] Route test: the placed `visual`/`watch` block renders `chain-rule`
- [ ] Browser test: readouts correct, no console errors —
      `e2e/lesson-chain-rule.spec.ts`

## Acceptance checklist
- [ ] Approved Insight Contract linked and `PASS`; insight verbatim in
      metadata
- [ ] Insight traceability table complete
- [ ] Route intentional
- [ ] Headings content-specific
- [ ] Guided-to-interactive continuity across the clip and the explorer
- [ ] Progressive disclosure applied
- [ ] KaTeX notation consistent; \(E\)-notation carried from L2 unchanged
- [ ] Accessibility: labels, focus, readouts, reduced-motion frames
- [ ] Diagrams labelled, unclipped, safe frame intact
- [ ] The composition-of-limits scoping choice (C7) is named on screen,
      citing L2's own level of formality
- [ ] `docs/quality/lesson-correctness-checklist.md` completed
- [ ] All tests pass — `./check.sh` green
