# Lesson Plan — Deciding with the Derivative (spine L6)

Stage 3. Consumes [insight.md](insight.md) (`PASS`) and
[mastery-contract.md](mastery-contract.md). **Second lesson of Package B.**

> **This plan is not authorization to build.** L6 is a `future` spine node;
> writing its lesson code crosses an
> [approval boundary](../../../../authoring/course-authoring-workflow.md#step-5--approval-boundaries-hard-stops).
> The two **Mode A amendments** it depended on were **resolved by the owner on
> 2026-08-01** ([contract §1a](mastery-contract.md#1a-placement--upstream-links)):
> the FTC edge is approved, so C13/C15 are **derived** under an explicit
> continuous-\(f''\) hypothesis, and the M2 depth bar is amended. That resolves
> the planning blockers; it is **not** approval to implement.

## Approved insight (gate)
- Insight Contract: [insight.md](insight.md)
- [x] `Gate result: PASS` confirmed
- Exact primary insight — **verbatim, planning metadata only**:

  > At an interior point where \(f\) is differentiable, \(f'(a)\neq0\)
  > **refutes** a local extremum — the local model hands you a step that provably
  > improves — while \(f'(a)=0\) merely **survives** that test rather than
  > passing it. Interiorness and differentiability are the argument's two
  > hypotheses; "a survivor need not win" is the failure of its converse; and
  > those three facts are what the three memorized warnings are really about.
  > Certifying a survivor takes a further argument, which is why the
  > second-derivative test exists.

- **Learner phrasing:** *"A slope is a way out. Where the slope is zero, this
  test simply has nothing to say — deciding takes a further argument."*
  **Do not** shorten this to "the derivative can only tell you where you are
  not": \(f''\) certifies, later in this same lesson, and that wording would
  install a fresh misconception while removing the spine's.
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
  to stop that from being a slogan is to let the learner enlarge \(h\) on a
  fixture where agreement does break and watch it break — an interaction that
  produces a fact, not a demonstration. What it produces is *an observed
  disagreement on a sampling grid*, not a canonical threshold (see the readouts
  below). Both reuse existing families
  (`function-plot` from L1, `local-linearity-zoom` from L2) with new data:
  **no new visual family**, per L6's
  [Supporting tier](../../curriculum-architecture.md#51-visual-budget-flagship-vs-supporting).

### Authored `route`
`motivate` → `watch` → `section` → `formal` (definition of local/global
extremum — inserted at build time, ahead of Fermat's, so "extremum" is
defined before the theorem uses it) → `formal` (Fermat) → `proof` →
`callout` (M1) → `check` → `section` (two hypotheses and a converse) →
`worked` (the main case) → `formal` (EVT, flagged unproved) → `callout` (M6)
→ `explore` → `section` (the silent model) → `formal` + `worked`
(second-derivative test and its silence) → `section` + `worked` (how far a
straight line can be trusted) → `practice` → `summarize`.

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
| 2 | Predict, before computing, a global max at an endpoint despite an interior local max | lesson-owned | E3 | `opt-endpoint-fresh` (**not** the checkpoint — see contract §1d) |
| 3 | Decline to conclude an extremum from \(f'(a)=0\); state what does follow | lesson-owned | E2 | `opt-flat-not-extremum` |
| 4 | On an unfamiliar \(f\), name which hypothesis of the argument fails | lesson-owned | E3 | `opt-which-hypothesis` |
| 5 | Say what the method returns on an open interval, and why that is correct | lesson-owned | E2 | `opt-open-interval` |
| 6 | Classify a survivor, and return *silent* when \(f''(a)=0\) | lesson-owned | E3 | `opt-second-test-silent` |
| 7 | From a curvature bound, produce an interval meeting a stated tolerance | lesson-owned | E3 | `opt-linearize-tolerance` |
| 8 | Choose unprompted between the calculus route and an algebraic certificate, **and justify the choice** | lesson-owned | E3 | `opt-select-route` (fresh pair; the justification is a captured step) |
| 9 | Identify the escape-route argument's load-bearing steps and what each hypothesis does | lesson-owned | E3 | `opt-derive-steps` (\(g(x)=x^2-4x+1\) at \(a=0\), fresh) |
| — | Write the argument out in full | **no evidence claim** — the runtime cannot record one (contract §1d) | — | `opt-derive-escape`, a practice event |
| 10 | Retain "necessary is not sufficient" under delayed retrieval | **module-owned** | E3 | `mod-calctech-retain-necessary-not-sufficient` (Gate 9) |
| 11 | Optimize a composite (chain rule + this method on one item) | **module-owned** | E5 | `mod-calctech-mixed-optimize-composite` (Gate 9) |

## Shared examples
- **Main example:** \(f(x)=x^3-3x\) on \([-2,3]\) — **fresh**, and chosen because
  its global maximum is at the **endpoint** \(x=3\) while an interior local
  maximum sits at \(x=-1\), and its minimum \(-2\) is attained **twice**
  (\(x=1\) and \(x=-2\)). Used by both the guided scene and the explorer.
- **Certificate corroboration (same example):** \(f(x)+2=(x-1)^2(x+2)\ge0\) on
  \([-2,3]\), proving \(f\ge-2\) with equality exactly at \(x=1,-2\) —
  **with no calculus**. It supplies the endorsement the *first-derivative
  condition* cannot (insight C6). It is shown in the lesson as corroboration;
  `opt-select-route` runs on a **different, unshown** pair of functions.
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
| `tooBig` | The promise is only local | On the main example, enlarge \(h\) until \(E(h)\) overtakes \(mh\) and improvement fails. The scene shows **a radius that works**, and says in words that it is *a* sufficient radius, not the largest one. | \(\lvert E(h)\rvert<\lvert mh\rvert\) for \(0<\lvert h\rvert<\delta\) |
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
- **\(\delta\) honesty (a named failure mode for this lesson).** C3 supplies
  *some* radius on which the sign agrees, not a canonical largest one. Agreement
  can fail and later return, and on a linear \(f\) it never fails at all. So
  `tooBig` runs on an explicitly chosen fixture where a disagreement does occur,
  labels what it found as **the first disagreement this grid saw**, and never
  labels it "the threshold". Copy that says "the point where the guarantee runs
  out" is a defect.
- **Visual family.** Reuses `function-plot` (L1's family) with new data;
  `local-linearity-zoom` (L2's) is reused in the approximation section. No new
  family.

## Checkpoint (Check understanding)
- **Prompt:** \(f(x)=x^3-3x\) on \([-2,3]\) has an interior local maximum at
  \(x=-1\). *Before computing anything:* where is the largest value of \(f\) on
  this interval, and what would you have to compare to be sure?
- **Type:** `committed-prediction` (commit before reveal). **One capability, one
  item** — a committed-prediction step cannot be chained with a numeric step
  inside an `exercise-sequence`; `SequenceStep` has no such kind.
- **Reveal:** \(f(-1)=2\) but \(f(3)=18\). The interior local maximum is a local
  claim; the global one is decided by comparison over the whole candidate set,
  which is what the Extreme Value Theorem licenses.
- **Item:** `opt-endpoint-predict`. **This is a learning event, not evidence**:
  its capability ceiling is E1, and it runs on the lesson's own worked example.
  Objective 2's E3 evidence is `opt-endpoint-fresh`, on a function the lesson
  never shows.

## Interactive controls (Explore) — `optimization-approximation`
Initialized from the main example, so the explorer opens on the scene's closing
state (guided-to-interactive continuity).

- **Primary controls:** drag the point \(a\); step size \(h\) (signed slider);
  interval ends \(p,q\); **Run sweep**; function preset.
- **Primary readouts:** \(f'(a)\); \(mh\); \(E(h)\); \(f(a+h)-f(a)\); a
  **sign-agreement indicator** (do \(f(a+h)-f(a)\) and \(mh\) agree?); the
  candidate set as a list, each member tagged *stationary* / *singular* /
  *endpoint*; the comparison table over the candidate set. Two **separate,
  separately-labelled** radius readouts, which must never be merged into one
  number: **"certified radius"** (declared per fixture, a radius on which
  agreement provably holds) and **"first disagreement on this grid"** (an
  observation, which reads **"none in this domain"** on a linear preset and may
  legitimately be followed by agreement returning at larger \(h\)).
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
  read **the first disagreement this grid saw** — the interaction that makes
  C3's locality a measured fact. It must be labelled as an observation, shown
  beside (never merged with) the certified radius, and it reads *none in this
  domain* on the linear preset.
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
| 6 | 2 | `opt-endpoint-fresh` | `exercise-sequence` | where the max sits → its value | **Fresh function and interval.** Carries objective 2's E3 evidence, which the checkpoint cannot. |
| 7 | 4 | `opt-which-hypothesis` | `exercise-sequence` | the unexamined point → the failed hypothesis | **Abstraction return.** Set on an \(f\) not shape-matchable to the lesson's examples. |
| 8 | 8 | `opt-select-route` | `exercise-sequence` | route → **why that route works here** → value | **Fresh pair**, not the worked example. Prompt names neither route; a certificate exists for one function and not the other. The justification is a captured step, not feedback text. |
| 9 | 9 | `opt-derive-steps` | `exercise-sequence` | (A) which property of \(g\) licenses the sign inequality — differentiability, not continuity or boundedness → (B) what stepping with one sign of \(h\) alone refutes — one of {max, min}, not both → (C) what property of \(a=0\) supplies the *other* sign of \(h\), completing the refutation of the other one — interiority, not differentiability again → (D) the value at the improving step | Explicitly separates the two hypotheses: (A) tests differentiability as the source of residual control, (C) tests interiority as the source of the second sign, and a learner who conflates them fails one step or the other. |
| — | — | `opt-derive-escape` | `self-check` (**learner-self-marked**) | model answer: residual bound, a sufficient \(\delta\) (not "the" \(\delta\)), both signs of \(h\), conclusion phrased as a refutation | **Practice event, no evidence claim.** Registered with no objective coverage — `assessmentManifest.ts` bars an E4+ claim on self-marked scoring, and `/review` reads `AttemptSet`s, not lesson exercises. |

Declared mix: **1 check + 5 drill + 4 transfer** = 10 items. Drill: items 1–5.
Transfer: items 6–9. Check: `opt-endpoint-predict`. Plus **one non-evidencing
practice event**, `opt-derive-escape`.

Two items carry **no evidence claim** and the tier-mix test must count them
separately, so a later edit cannot quietly promote either into the evidence set:
the checkpoint (ceiling E1, and on a shown function) and `opt-derive-escape`
(self-marked scoring — see [contract §1d](mastery-contract.md#1d-outcomes-with-evidence)
for the two independent runtime grounds). **No evidence-bearing item runs on a
function the lesson displays.**

## Insight traceability (required)

| Contract obligation | Learner-facing location | Evidence of understanding |
| --- | --- | --- |
| **C1** local vs global extremum, with the window explicit | `section` after Watch; definition list | Learner distinguishes the interior local max from the global one in the checkpoint |
| **C2** L2's local model retrieved | Watch `standSloped` | Learner reads \(m\) and \(E(h)\) off the panel as separate quantities |
| **C3** escape-route lemma, with a sufficient \(\delta\) | Watch `stepAndCheck` + `tooBig`; `proof` block; Explore (ii) | Learner observes agreement break on a chosen fixture and distinguishes that observation from the certified radius; `opt-derive-steps` step (A) isolates differentiability, specifically, as what licenses the sign inequality |
| **C4** refutation needs both directions | Watch `sweep`; `proof` block | `opt-derive-steps` steps (B)+(C) — one sign of \(h\) refutes only one of {max, min} (B), and interiority is what supplies the second sign that refutes the other (C); a learner holding "one direction is enough," or conflating interiority with differentiability, fails one of the two |
| **C5** Fermat's condition | `formal` block | Learner states hypotheses and conclusion, and the direction |
| **C6** the converse fails — this test refutes only, while \(f''\) still certifies | Watch `survivorFails`; `callout` M1; and the later second-derivative section, which is where the scope of C6 is made explicit | `opt-flat-not-extremum` — learner declines to conclude, and does **not** generalize to "derivatives cannot certify" (a distractor tests exactly that) |
| **C7** hypothesis 1, interior | Watch `oneDirection`; `section` "two hypotheses and a converse" | `opt-which-hypothesis`; the checkpoint's endpoint reasoning |
| **C8** hypothesis 2, a local model exists | Watch `unexamined`; same `section` | `opt-which-hypothesis` on an unfamiliar \(f\) |
| **C9** the candidate set — a *reduction* to the critical set plus eligible boundary points, finite only for these functions | `section`; Explore candidate list; constant-function preset | `opt-candidate-set` grades the set and each member's reason; the constant preset visibly fails to reduce to a list |
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
> A nonzero slope rules a point out. A zero slope rules nothing **in** — what
> survives still has to be decided, which is what the second derivative and the
> comparison are for.

*(This is the spine's own sentence, repaired: see
[insight-brief §1d](insight-brief.md#1d-ranking) for why the spine's wording
installs the misconception if used unaltered.)*

## Notation
- \(a\) the point under test; \(h\) the step; \(m=f'(a)\); \(E(h)\) the residual
  (**L2's symbol, unchanged**); \(\delta\) **a sufficient radius** — never "the
  threshold", and never rendered as one; \(L(h)=f(a)+f'(a)h\);
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
- **Linear \(f\)** — \(E\equiv0\), so sign agreement **never** fails anywhere in
  the domain. The explorer must read "none in this domain" rather than reporting
  a spurious threshold, and the guided scene must not run `tooBig` here.
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
- [ ] the **declared certified radius** really works: \(\operatorname{sign}(f(a+h)-f(a))=\operatorname{sign}(f'(a)h)\) for all sampled \(0<\lvert h\rvert<\delta\) — and nothing claims it is maximal
- [ ] the "first disagreement on this grid" readout is distinct from the certified radius, and reads *none in this domain* on a linear preset
- [ ] each fixture's **analytically declared** stationary/singular points and exact expected candidate set agree with its declared derivative; a dense scan corroborates but is **not** the completeness oracle
- [ ] \(\lvert f(a+h)-L(h)\rvert\le Mh^2/2\) holds on a dense grid **and** is not vacuous (within an order of magnitude at the trust radius)
- [ ] the silence battery (\(x^4\), \(-x^4\), \(x^3\)) all return *silent*
- [ ] the constant function reports a non-finite reduction rather than a list
- [ ] the open interval returns an empty set and withdraws the existence guarantee
- [ ] every displayed quantity originates in `src/math`, none in a scene or explorer

## Required tests
- [ ] Unit tests for the new `src/math` helpers (candidate set, **certified
      sufficient radius**, first-sampled-disagreement, bound) — the second and
      third are separate functions with separate names, not one "threshold" helper
- [ ] The seven invariant tests above
- [ ] Component tests: explorer readouts, the sign-agreement indicator, sweep, reset, endpoint-opening
- [ ] Grading contract (`describeGradingContract`) for every auto-graded item, with the adversarial reject battery. `opt-derive-escape` is **not** auto-graded and is **not** routed to review — it is a self-marked practice event registered with no objective coverage, and a test must assert that it covers none
- [ ] Tier-mix test pinning 1 check + 5 drill + 4 transfer
- [ ] Browser test: learner-visible readouts, no console errors, KaTeX clean
- [ ] `proseEmphasis` guards (no `$$`, no odd `$`, no doc-internal artifact vocabulary such as "C5" or "Package B" in learner prose)

## Acceptance checklist

> Ticked items reflect what the implementing agent verified mechanically
> (tests, typecheck, lint, static review) on 2026-08-01. None of this is
> independent review or a domain-owner's read of the rendered page — see
> mastery-contract.md §6 for the full status and what remains open.

- [x] Insight Contract linked and `PASS`; exact sentence verbatim above; learner wording preserves meaning and causal chain
- [x] Insight traceability table complete, with the two ungraded obligations declared rather than hidden
- [x] Intentional `route` composed from the palette; the `proof` block and the absent `handoff` both justified above (the built route additionally inserts a `def-extremum` formal block before Fermat's, a refinement over this plan's original sequencing, noted here for consistency)
- [x] Every objective names owner and level; every lesson-owned objective resolves to an item (`objectiveCoverage.test.ts` green)
- [x] Medium justification present for both media used
- [x] Content-specific headings and ToC entries (route blocks carry no generic phase-name headings)
- [x] Guided-to-interactive continuity (same main fixture `OPT_MAIN_CUBIC`, same notation, same roles)
- [x] Progressive disclosure applied (approximation panel collapsed by default, gated behind a toggle)
- [x] KaTeX notation consistent with L2's \(E(h)\)
- [ ] Accessibility: labels, focus, readouts, reduced motion — ariaLabel props present on both the scene and the explorer's `FunctionPlot`; **not confirmed with a screen reader or a real browser**
- [ ] Diagrams labelled, unclipped, safe frame intact — **needs a browser pass**, see lesson-correctness-checklist.md
- [ ] Viewport/zoom checks — **needs a browser pass**
- [x] [lesson-correctness-checklist](../../../../quality/lesson-correctness-checklist.md) completed, with the browser-only items explicitly left open there rather than falsely ticked
- [x] **Both Mode A amendments resolved** by the owner, 2026-08-01 — the L4 edge is approved, so C13/C15 are derived under an explicit continuous-\(f''\) hypothesis; the M2 bar is amended
- [x] All automated tests pass: full `vitest run` (153 files, 2435 tests), `tsc -b` clean, `oxlint` clean. **`./check.sh --e2e` has not been run** — no Playwright/browser confirmation yet.
