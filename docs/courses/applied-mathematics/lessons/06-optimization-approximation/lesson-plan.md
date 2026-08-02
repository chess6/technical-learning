# Lesson Plan — Deciding with the Derivative (spine L6)

Stage 3. Consumes [insight.md](insight.md) (`PASS`) and
[mastery-contract.md](mastery-contract.md). **Second lesson of Package B.**

> **This plan is not authorization to build.** L6 is a `future` spine node;
> writing its lesson code crosses an
> [approval boundary](../../../../authoring/course-authoring-workflow.md#step-5--approval-boundaries-hard-stops).
> Two **Mode A amendments** ([contract §1a](mastery-contract.md#1a-placement--upstream-links))
> are also unresolved, and the first of them decides whether the
> second-derivative test and the error bound are *derived* or *cited* — so it
> must be settled before Mode C, not during it.

## Approved insight (gate)
- Insight Contract: [insight.md](insight.md)
- [x] `Gate result: PASS` confirmed
- Exact primary insight — **verbatim, planning metadata only**:

  > The derivative never finds the best point — it **refutes** every point that
  > is not, because a nonzero slope hands you a step that provably improves;
  > \(f'(a)=0\) is what survives refutation, not what wins, and the three things
  > that argument needs (two directions, a local model, and the fact that
  > refuting is not endorsing) are exactly the three exceptions learners
  > memorize.

- **Learner phrasing:** *"A slope is a way out. The derivative can only tell you
  where you are not — what's left over still has to be checked."*
- **Obstacle:** an incorrect prior model held with high confidence — \(f'(a)=0\)
  is believed to *detect* extrema (the converse of the true theorem), patched
  with three warnings held as unrelated exceptions.
- **Mechanisms:** structural compression, driven by predictive/causal
  reorganization, with a light semantic grounding.
- **Bridge:** standing somewhere and taking a step — "if the ground under your
  feet is sloped, you are not at the top."
- **Analogy limits to discard:** *flat means summit* (**false**, and it is
  misconception M1 — the bridge is broken on purpose); *time, effort, and a view
  of the whole landscape* (the argument is strictly local); *a step is a
  direction* (one dimension has exactly two — "every direction" is deferred to
  L28, not denied).
- **Abstraction return:** on an unfamiliar, non-picturable \(f\), name **which
  hypothesis** of the refutation argument fails — with no reference to stepping,
  and not reachable by shape-matching the lesson's own examples.

## Lesson title
**Deciding with the derivative**
*(Visible page headings are content-specific per
[semantic-page-grammar §1](../../../../product/semantic-page-grammar.md); the
generic block names below are internal metadata only.)*

## Route / ids
- Route: `/lesson/optimization-approximation`
- `guidedSceneId`: `optimization-approximation`
- `explorationId`: `optimization-approximation`
- **Medium justification.** The guided clip is justified because the lesson's
  central object *changes over time in a way a static figure cannot show*: a
  refutation **sweeping** across an interval and points going out. The explorer
  is justified because the escape-route guarantee is **local**, and the only way
  to stop that from being a slogan is to let the learner enlarge \(h\) until the
  guarantee fails and read the threshold off the panel — an interaction that
  produces a fact, not a demonstration. Both reuse existing families
  (`function-plot` from L1, `local-linearity-zoom` from L2) with new data:
  **no new visual family**, per L6's
  [Supporting tier](../../curriculum-architecture.md#51-visual-budget-flagship-vs-supporting).

### Authored `route`
`motivate` → `watch` → `section` → `formal` (Fermat) → `proof` → `callout` (M1)
→ `check` → `section` (three hypotheses) → `worked` (the main case) →
`formal` (EVT, flagged unproved) → `callout` (M6) → `explore` → `section` (the
silent model) → `formal` + `worked` (second-derivative test and its silence) →
`section` + `worked` (how far a straight line can be trusted) → `practice` →
`summarize`.

Two deliberate choices:
- A **`proof` block**, not a collapsed justification. The lesson's subject *is*
  the argument, so the learner follows it as the main line
  (lesson-design "Proof"; vision §0 principle 9). This is the second lesson in
  the repository to use the block, after `rank-nullity`.
- **No `handoff`.** Its natural targets (L7, L11) are `future`, and pointing at
  unbuilt content is the exact honesty failure R2 avoided in `karatsuba`. The
  lesson ends on `summarize` — the spine's own sentence, repaired.
- No `callout` is the first content-bearing block (the `h3`-under-`h1` heading
  trap in lesson-design).

## Motivating question
> Find the largest value of \(f\) on \([a,b]\). You cannot check every point —
> there are uncountably many. What, exactly, lets you stop checking?

## Objectives (with evidence)

The mastery contract's outcomes, unchanged. See
[contract §1d](mastery-contract.md#1d-outcomes-with-evidence) for dimensions and
levels.

| # | Objective | Evidence owner | Level | Discharged by |
| --- | --- | --- | --- | --- |
| 1 | Construct the complete candidate set on a fresh closed interval and justify each non-stationary member | lesson-owned | E3 | `opt-candidate-set` |
| 2 | Predict, before computing, a global max at an endpoint despite an interior local max | lesson-owned | E3 | `opt-endpoint-predict` |
| 3 | Decline to conclude an extremum from \(f'(a)=0\); state what does follow | lesson-owned | E2 | `opt-flat-not-extremum` |
| 4 | On an unfamiliar \(f\), name which hypothesis of the argument fails | lesson-owned | E3 | `opt-which-hypothesis` |
| 5 | Say what the method returns on an open interval, and why that is correct | lesson-owned | E2 | `opt-open-interval` |
| 6 | Classify a survivor, and return *silent* when \(f''(a)=0\) | lesson-owned | E3 | `opt-second-test-silent` |
| 7 | From a curvature bound, produce an interval meeting a stated tolerance | lesson-owned | E3 | `opt-linearize-tolerance` |
| 8 | Choose unprompted between the calculus route and an algebraic certificate | lesson-owned | E3 | `opt-select-route` |
| 9 | Reproduce the escape-route argument at a fresh sloped point | lesson-owned | E4 | `opt-derive-escape` |
| 10 | Retain "necessary is not sufficient" under delayed retrieval | **module-owned** | E3 | `mod-calctech-retain-necessary-not-sufficient` (Gate 9) |
| 11 | Optimize a composite (chain rule + this method on one item) | **module-owned** | E5 | `mod-calctech-mixed-optimize-composite` (Gate 9) |

## Shared examples
- **Main example:** \(f(x)=x^3-3x\) on \([-2,3]\) — **fresh**, and chosen because
  its global maximum is at the **endpoint** \(x=3\) while an interior local
  maximum sits at \(x=-1\), and its minimum \(-2\) is attained **twice**
  (\(x=1\) and \(x=-2\)). Used by both the guided scene and the explorer.
- **Certificate corroboration (same example):** \(f(x)+2=(x-1)^2(x+2)\ge0\) on
  \([-2,3]\), proving \(f\ge-2\) with equality exactly at \(x=1,-2\) —
  **with no calculus**. It supplies the endorsement the derivative cannot
  (insight C6), and it is the second half of `opt-select-route`.
- **`ex-cubic-inflection`** (\(x^3\)) — reused from L2/L4 in an **inverted
  role**: there a counterexample about what a *tangent* is, here the survivor
  that is not an extremum.
- **`ex-abs`** (\(\lvert x\rvert\) on \([-2,2]\)) — likewise inverted: L2's
  non-differentiable point, here the minimum the sweep cannot examine.
- **`ex-decay`** (\(e^{-t/1.5}\)) — the linearization \(1-\tfrac23t\) with
  \(M=4/9\) and trust radius \(0.2121\ldots\) for \(\varepsilon=10^{-2}\)
  (insight §7, verified numerically there).
- **`ex-drive`** — its two declared `turningPoints` make "when was the car going
  fastest?" an optimization question with a reading the learner already has.
  Explorer preset only.
- **Degenerate presets:** a constant function (every point stationary);
  \(f(x)=x\) on an open interval (empty candidate set); \(x^4\) and \(-x^4\)
  (the second-derivative test's silence).
- **Fresh, practice only:** functions the scene and explorer never show.

## Supporting concepts
- *Stationary*, *singular*, and *critical* point — defined explicitly, because
  textbooks disagree about whether "critical" includes singular points.
- Local vs global extremum, with the **window** made explicit — the entire
  argument is local, and M4 lives in exactly that gap.
- Linearization \(L(h)=f(a)+f'(a)h\), named as an object so L11 can later read
  it as a truncated series.

## Guided-scene outline (Watch) — `optimization-approximation`

| Step id | Name (learner-facing) | Idea revealed | Notation synced |
| --- | --- | --- | --- |
| `theSearch` | An impossible amount of checking | \(f(x)=x^3-3x\) on \([-2,3]\); sampled values appear. The largest sample is not an answer, and the scene says so. | — |
| `standSloped` | Standing where the ground is sloped | One point \(a\); L2's local model drawn over it, slope \(m=f'(a)\neq0\). | \(f(a+h)=f(a)+f'(a)h+E(h)\) |
| `predictStep` | **Prediction beat** | *Which way would you step to get higher?* True hold — nothing moves, and the stepped value is **not** on screen. | \(m\) shown; \(f(a+h)\) withheld |
| `stepAndCheck` | The step pays off | Take the step. \(mh\) and \(E(h)\) are drawn as **separately labelled quantities** (L2's discipline), and \(mh\) visibly dominates. | \(f(a+h)-f(a)=mh+E(h)\) |
| `tooBig` | The promise is only local | Enlarge \(h\) until \(E(h)\) overtakes \(mh\) and improvement fails; the threshold \(\delta\) is marked where the sign flips. | \(\lvert E(h)\rvert<\lvert mh\rvert\) for \(0<\lvert h\rvert<\delta\) |
| `sweep` | Ruling points out | The refutation runs across the interval; every point with a nonzero slope greys out. **Points leave; none is ever selected.** | — |
| `survivors` | What is left over | Four points remain: \(-1\), \(1\), and the two ends. The scene calls them *candidates*, never *answers*. | candidate set \(\{-2,-1,1,3\}\) |
| `survivorFails` | A survivor that is not an answer | \(x^3\) at \(0\) is dropped in: it survives the sweep and is neither a max nor a min. True hold before the reveal. | \(f'(0)=0\) |
| `unexamined` | A winner the sweep never looked at | \(\lvert x\rvert\) on \([-2,2]\): the minimum sits where no local model exists, so the sweep skipped it. | \(f'(0)\) undefined |
| `oneDirection` | Only one way to step | At the left end, one of the two arrows is gone. "Not a maximum" still follows; "not a minimum" does not. | one-sided \(h>0\) |

- **Pauses / dimming.** `predictStep` and `survivorFails` are **true holds**:
  nothing moves, and in each case the answer is genuinely not on screen when the
  question is asked (the stepped value in the first, the verdict in the second).
  `tooBig` pauses at the sign flip.
- **Honest labelling.** \(E(h)\) is drawn as a visible, labelled quantity at
  every step it appears — never absorbed into an "\(\approx\)". The sweep's
  greying is labelled **"refuted"**, never "not a maximum candidate", because
  the whole point is that the operation is elimination.
- **Interpolation honesty.** The sweep is discrete (a sampled grid); the scene
  must say so and must not imply every real point was tested. What is proven is
  the *lemma*, not the animation — a distinction the scene states rather than
  glosses.
- **Visual family.** Reuses `function-plot` (L1's family) with new data;
  `local-linearity-zoom` (L2's) is reused in the approximation section. No new
  family.

## Checkpoint (Check understanding)
- **Prompt:** \(f(x)=x^3-3x\) on \([-2,3]\) has an interior local maximum at
  \(x=-1\). *Before computing anything:* where is the largest value of \(f\) on
  this interval, and what would you have to compare to be sure?
- **Type:** `committed-prediction` (commit before reveal), then a `numeric`
  answer.
- **Reveal:** \(f(-1)=2\) but \(f(3)=18\). The interior local maximum is a local
  claim; the global one is decided by comparison over the whole candidate set,
  which is what the Extreme Value Theorem licenses.
- **Item:** `opt-endpoint-predict` (objective 2, M4).

## Interactive controls (Explore) — `optimization-approximation`
Initialized from the main example, so the explorer opens on the scene's closing
state (guided-to-interactive continuity).

- **Primary controls:** drag the point \(a\); step size \(h\) (signed slider);
  interval ends \(p,q\); **Run sweep**; function preset.
- **Primary readouts:** \(f'(a)\); \(mh\); \(E(h)\); \(f(a+h)-f(a)\); a
  **sign-agreement indicator** (do \(f(a+h)-f(a)\) and \(mh\) agree?); the
  threshold \(\delta\) where agreement fails; the candidate set as a list, each
  member tagged *stationary* / *singular* / *endpoint*; the comparison table over
  the candidate set.
- **Progressive disclosure (Display options):** the approximation panel — \(M\),
  the band \(\pm Mh^2/2\), the true error, and the trust radius
  \(\sqrt{2\varepsilon/M}\) for a chosen \(\varepsilon\); sweep grid resolution;
  the "open this endpoint" toggles.
- **Clamps:** \(h\) clamped to the interval; \(\varepsilon\) to a range where the
  radius is drawable; sweep resolution bounded so the discrete-sampling caveat
  stays honest at every setting.
- **Reset:** returns to \(f(x)=x^3-3x\) on \([-2,3]\) with \(a\) at the scene's
  final position and the approximation panel collapsed.
- **Woven Explore obligations** ([contract §1f](mastery-contract.md#1f-connections-assessment-retention)):
  (i) predict which points survive on a chosen interval, then verify against the
  candidate list; (ii) enlarge \(h\) until the sign-agreement indicator fails and
  read \(\delta\) — the interaction that makes C3's locality a measured fact.
  Opening an endpoint must make the candidate list **shrink** and the existence
  guarantee **withdraw**, visibly.

## Exercises (Practice)

| # | Obj | Item | Type | Deterministic answer | Feedback (why) |
| --- | --- | --- | --- | --- | --- |
| 1 | 1 | `opt-candidate-set` | `exercise-sequence` | candidate count → values → the non-stationary member's reason → global max | Names *which* rule admitted each member; a right max from a wrong set is marked wrong. |
| 2 | 3 | `opt-flat-not-extremum` | `multiple-choice` | "Nothing follows about an extremum; only that no step is guaranteed to improve" | Distractors are rival diagnoses, incl. one **true but not the conclusion** (that \(f\) is continuous at \(a\)). |
| 3 | 6 | `opt-second-test-silent` | `exercise-sequence` | classify → *silent* → the separating pair | The test's failure is not a verdict; \(x^4\) and \(x^3\) both have \(f''(0)=0\) and land differently. |
| 4 | 7 | `opt-linearize-tolerance` | `numeric` | \(\lvert h\rvert\le\sqrt{2\varepsilon/M}\) | Graded on the radius, not the approximation's value — the point is the bound. |
| 5 | 5 | `opt-open-interval` | `multiple-choice` | "An empty candidate set and no existence guarantee — a correct output" | Separates "the method broke" from "no maximum exists". |
| 6 | 4 | `opt-which-hypothesis` | `exercise-sequence` | the unexamined point → the failed hypothesis | **Abstraction return.** Set on an \(f\) not shape-matchable to the lesson's examples. |
| 7 | 8 | `opt-select-route` | `exercise-sequence` | route → value | Prompt names neither route; the certificate is available on one function and not the other. |
| 8 | 9 | `opt-derive-escape` | `self-check` (human-scored) | rubric: residual bound, choice of \(\delta\), both signs of \(h\), conclusion phrased as a refutation | The only item requiring the argument to be **produced**. |

Plus the checkpoint (`opt-endpoint-predict`). Declared mix: **1 check + 5 drill +
3 transfer**, to be pinned by a tier-mix test at build.

## Insight traceability (required)

| Contract obligation | Learner-facing location | Evidence of understanding |
| --- | --- | --- |
| **C1** local vs global extremum, with the window explicit | `section` after Watch; definition list | Learner distinguishes the interior local max from the global one in the checkpoint |
| **C2** L2's local model retrieved | Watch `standSloped` | Learner reads \(m\) and \(E(h)\) off the panel as separate quantities |
| **C3** escape-route lemma, with its \(\delta\) | Watch `stepAndCheck` + `tooBig`; `proof` block; Explore (ii) | Learner locates \(\delta\) by enlarging \(h\) until the sign indicator fails; reproduces the bound in `opt-derive-escape` |
| **C4** refutation needs both directions | Watch `sweep`; `proof` block | Learner states the conclusion as elimination, not selection (`opt-derive-escape` rubric) |
| **C5** Fermat's condition | `formal` block | Learner states hypotheses and conclusion, and the direction |
| **C6** the argument only refutes | Watch `survivorFails`; `callout` M1 | `opt-flat-not-extremum` — learner declines to conclude |
| **C7** hypothesis 1, interior | Watch `oneDirection`; `section` "three hypotheses" | `opt-which-hypothesis`; the checkpoint's endpoint reasoning |
| **C8** hypothesis 2, a local model exists | Watch `unexamined`; same `section` | `opt-which-hypothesis` on an unfamiliar \(f\) |
| **C9** the candidate set (and that it is a *reduction*, finite only for these functions) | `section`; Explore candidate list; constant-function preset | `opt-candidate-set` grades the set and each member's reason; the constant preset shows the list refuse to be finite |
| **C10** EVT, **cited not proved** | `formal` block, flagged on screen | `opt-open-interval` — learner names which hypothesis is missing |
| **C11** three jobs; the honest empty output | `callout` M6; Explore "open this endpoint" | `opt-open-interval`; the candidate list visibly withdrawing |
| **C12** the linear model is silent at a survivor | `section` "when the model has no opinion" | Learner explains *why* another rung is needed, before the test is stated |
| **C13** the second-derivative test, derived | `formal` + `worked` | `opt-second-test-silent` step 1 |
| **C14** the test refuses too | `worked` (the \(x^4\)/\(-x^4\)/\(x^3\) battery) | `opt-second-test-silent` steps 2–3 |
| **C15** the same identity is the error bound | `section` + `worked` on `ex-decay` | `opt-linearize-tolerance` |
| **C16** one method, two questions | `summarize` | Learner states the repaired spine sentence in their own words |
| **C17** forward (L11 exact; L28 exact-for-argument) | `section` closing lines | Not graded in-lesson — recorded as a **stated connection**, not a claimed outcome |
| **Bridge** — stand and step | Watch `standSloped`/`predictStep`; `callout` M1 | Learner predicts the improving direction before stepping |
| **Limit** — *flat means summit* is false | `callout` M1 (`moves`: belief → \(x^3\) → repair) | `opt-flat-not-extremum` |
| **Limit** — no time, effort, or global view | `section`, one sentence | Learner treats the guarantee as local (Explore (ii)) |
| **Limit** — "a step is a direction" is one-dimensional | `section` closing lines, deferred to L28 | Not graded; stated as deferred, not denied |
| **Abstraction return** | `opt-which-hypothesis` | Names the failed hypothesis on a non-picturable \(f\), with no reference to stepping and not reachable by shape-matching |

Two obligations are deliberately **stated, not graded** (C17 and the third
analogy limit). Both are forward-looking connections to `future` lessons;
recording them here as ungraded is the honest alternative to claiming evidence
that does not exist — the same treatment L5 gave its own M4.

## Key takeaway (Summarize)
> The derivative cannot tell you where the best point is. It tells you where the
> best point **is not** — and everything it fails to rule out still has to be
> compared.

*(This is the spine's own sentence, repaired: see
[insight-brief §1d](insight-brief.md#1d-ranking) for why the spine's wording
installs the misconception if used unaltered.)*

## Notation
- \(a\) the point under test; \(h\) the step; \(m=f'(a)\); \(E(h)\) the residual
  (**L2's symbol, unchanged**); \(\delta\) the threshold; \(L(h)=f(a)+f'(a)h\);
  \(M\) a bound on \(\lvert f''\rvert\); \(\varepsilon\) the tolerance.
- Key KaTeX:
  `f(a+h)=f(a)+f'(a)h+E(h)`,
  `|E(h)|\le\tfrac{|mh|}{2}<|mh|`,
  `f(a+h)-f(a)-f'(a)h=\int_a^{a+h}\!\!\int_a^{t}f''(s)\,ds\,dt`,
  `\bigl|f(a+h)-L(h)\bigr|\le\tfrac{Mh^2}{2}`,
  `|h|\le\sqrt{2\varepsilon/M}`.
- **Prose constraint** (`known-failure-modes.md`): no `$$…$$` in prose strings —
  `ProseWithMath` parses `$…$` only. The double-integral identity is long and
  must go in a `worked` block or an `EquationSequence`, never inline.

## Edge cases
- **Constant function** — every point stationary; the candidate list must report
  *not a finite reduction*, not an arbitrary list.
- **Open / unbounded interval** — empty candidate set, existence guarantee
  withdrawn.
- \(\lvert x\rvert\) at \(0\) — a candidate admitted by *singularity*, and the
  actual minimum.
- \(x^3\) at \(0\) — a survivor that is neither.
- \(x^4\), \(-x^4\) — the second-derivative test silent, landing differently.
- **Minimum attained twice** (\(x=1\) and \(x=-2\) in the main example) — the
  extreme *value* is unique; the argmin need not be. The comparison table must
  not silently pick one.
- \(h\) of both signs at every step of C13's argument — the sign analysis is
  two-sided and must be tested as such.

## Mathematical invariants to assert
The generic matrix invariants do not apply. Lesson-specific, and each is one of
[contract §1g](mastery-contract.md#1g-correctness--scope)'s required property
tests:
- [ ] the reported \(\delta\) really works: \(\operatorname{sign}(f(a+h)-f(a))=\operatorname{sign}(f'(a)h)\) for all sampled \(0<\lvert h\rvert<\delta\)
- [ ] the candidate set contains a dense scan's argmax and argmin, within tolerance
- [ ] \(\lvert f(a+h)-L(h)\rvert\le Mh^2/2\) holds on a dense grid **and** is not vacuous (within an order of magnitude at the trust radius)
- [ ] the silence battery (\(x^4\), \(-x^4\), \(x^3\)) all return *silent*
- [ ] the constant function reports a non-finite reduction rather than a list
- [ ] the open interval returns an empty set and withdraws the existence guarantee
- [ ] every displayed quantity originates in `src/math`, none in a scene or explorer

## Required tests
- [ ] Unit tests for the new `src/math` helpers (candidate set, threshold, bound)
- [ ] The seven invariant tests above
- [ ] Component tests: explorer readouts, the sign-agreement indicator, sweep, reset, endpoint-opening
- [ ] Grading contract (`describeGradingContract`) for every auto-graded item, with the adversarial reject battery; `opt-derive-escape` routed to human scoring with a versioned rubric
- [ ] Tier-mix test pinning 1 check + 5 drill + 3 transfer
- [ ] Browser test: learner-visible readouts, no console errors, KaTeX clean
- [ ] `proseEmphasis` guards (no `$$`, no odd `$`, no doc-internal artifact vocabulary such as "C5" or "Package B" in learner prose)

## Acceptance checklist
- [ ] Insight Contract linked and `PASS`; exact sentence verbatim above; learner wording preserves meaning and causal chain
- [ ] Insight traceability table complete, with the two ungraded obligations declared rather than hidden
- [ ] Intentional `route` composed from the palette; the `proof` block and the absent `handoff` both justified above
- [ ] Every objective names owner and level; every lesson-owned objective resolves to an item
- [ ] Medium justification present for both media used
- [ ] Content-specific headings and ToC entries
- [ ] Guided-to-interactive continuity (same example, notation, roles)
- [ ] Progressive disclosure applied (approximation panel collapsed by default)
- [ ] KaTeX notation consistent with L2's \(E(h)\)
- [ ] Accessibility: labels, focus, readouts, reduced motion
- [ ] Diagrams labelled, unclipped, safe frame intact
- [ ] Viewport/zoom checks
- [ ] [lesson-correctness-checklist](../../../../quality/lesson-correctness-checklist.md) completed
- [ ] **Both Mode A amendments resolved** ([contract §1a](mastery-contract.md#1a-placement--upstream-links)) — the L4 edge decides whether C13/C15 are derived or cited
- [ ] All tests pass
