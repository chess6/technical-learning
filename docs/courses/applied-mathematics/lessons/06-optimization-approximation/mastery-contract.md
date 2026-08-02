# Lesson Mastery Contract — Deciding with the Derivative (spine L6)

Gate 5 for **`optimization-approximation`**, after [insight.md](insight.md)
reached `PASS`. Second lesson of Package B (`calculus-technique`).

## 1a. Placement & upstream links
- **Spine:** L6, unit `calculus-technique` (Package B), following L5
  `chain-rule` in sequence — but **not** dependent on it (see §1b).
- **Profile:** P2 primary, no per-lesson override. **No P3 bar claimed** — the
  Extreme Value Theorem is *used and named as unproved* (insight C10); proving
  it needs completeness/compactness, which is P3 territory and is declared here
  and in the lesson.
- **Research-bridge overlay:** no.
- **Insight contract:** [insight.md](insight.md) — `PASS`. Primary-insight
  sentence linked, not copied.
- **Concepts introduced:** `optimization-approximation` (the curriculum id).
  Within it the lesson names *stationary point*, *singular point*, *critical
  point*, *local vs global extremum*, and *linearization* — the last is the
  object L11 will read as a truncated series.
  **Reused:** `local-linearity`, `derivative` (L2); `limit`, `continuity` (L1);
  `definite-integral`, `ftc` (L3/L4 — see the amendment below).

> **Two Mode A amendments — both resolved by the repository owner, 2026-08-01**
> (detail in [insight.md](insight.md#prerequisites-limitations-likely-misconceptions)):
> (1) the `fundamental-theorem → optimization-approximation` **hard edge is
> approved** and now in the DAG, with the **continuous \(f''\)** hypothesis
> required to stay explicit wherever C13/C15 are used — so those two results are
> **derived**, not cited, and the fallback is withdrawn;
> (2) the **M2 depth bar is amended**, before Mode C rather than before Gate 10,
> so that this contract is calibrated against a real target rather than checked
> against one afterwards. §1c and §1d below are what discharge it.

## 1b. Role, bridge, need
- **Role:** the lesson where the derivative stops being a thing you *compute*
  and becomes a thing you *argue with*. It is also the course's first sustained
  encounter with **necessary vs sufficient** — the logical discipline L8's
  convergence tests, L20's sampling condition, and L27's stability criteria all
  reuse.
- **Retrieve:** L2 C5 (the local-linear model and its residual — insight C3 is
  an inequality about exactly that residual); L1's tolerance reasoning (the
  \(\delta\) in C3); L4 C9 (the evaluation half of the FTC).
- **Bridge from the previous lesson:** L5 showed a derivative can be *derived*
  rather than handed down. L6 asks what a derivative is *for*: **"You can now
  compute \(f'\) for anything. What question does knowing \(f'\) actually
  answer?"** — and the honest first answer is a negative one.
  **L5 is not a prerequisite** (the chain rule appears nowhere in C1–C17); the
  bridge is narrative continuity, and the lesson must not imply a dependency
  the DAG does not have.
- **Motivating need:** *Find the largest value of \(f\) on \([a,b]\). You cannot
  check every point — there are uncountably many. What, exactly, lets you stop
  checking?*

## 1c. Content to teach
- **Definitions (D2):** local maximum/minimum on a domain (insight C1 — with the
  window made explicit, since the whole argument is local); global extremum;
  **stationary point** (\(f'=0\)), **singular point** (\(f'\) undefined), and
  **critical point** as their union — stated explicitly *because textbooks
  disagree*; the **candidate set** (critical points ∪ endpoints);
  **linearization** \(L(h)=f(a)+f'(a)h\).
- **Objects:** the escape-route inequality \(\lvert E(h)\rvert<\lvert mh\rvert\)
  and a **certified radius** \(\delta\) on which it holds; the candidate set as
  a constructed object; the error band \(\pm Mh^2/2\) around a linearization.
  **\(\delta\) is a sufficient radius, never "the threshold".** C3 supplies
  *some* radius that works; it does not supply a largest one, agreement can fail
  and later return, and for a linear \(f\) (where \(E\equiv0\)) it never fails
  at all. Anything in the lesson that presents \(\delta\) as a canonical
  observable boundary is a defect — see §1g.
- **Procedures requiring fluency (D3), each with the graded intermediate:**
  1. *Build the candidate set* — graded on **the set itself and the reason each
     member is in it** (stationary / singular / endpoint), not on the final
     extremum value, which a lucky sample could also produce.
  2. *Decide the global extremes* — graded on the comparison table, and on
     citing existence (C10) as what licenses comparing.
  3. *Classify a survivor* — graded on the **sign of \(f''\)** and on the
     verdict "silent" when \(f''(a)=0\), not on a max/min guess.
  4. *Size a linearization* — graded on the **curvature bound \(M\) and the
     resulting \(\lvert h\rvert\le\sqrt{2\varepsilon/M}\)**, not on the
     approximation's value.
- **Theorems (D5):** Fermat's condition (C5) — hypotheses *interior* and
  *differentiable at \(a\)*, conclusion \(f'(a)=0\), **necessary only**; the
  Extreme Value Theorem (C10) — hypotheses *continuous*, *closed*, *bounded*,
  **cited, not proved**; the second-derivative test (C13) — hypotheses
  \(f'(a)=0\), \(f''\) continuous near \(a\), \(f''(a)\neq0\), **sufficient**;
  the first-order error bound (C15).
  **Explicitly denied:** that \(f'(a)=0\) implies an extremum; that the method
  finds every extremum without the singular and endpoint cases; that
  \(f''(a)=0\) implies *not* an extremum; that a local maximum is the maximum.
- **Proof depth (D6):** **derived on screen** — C3→C5 (Fermat, from L2 C5
  alone), C7/C8 (the two hypotheses, each by removing it), C13 and C15 (the
  double integral, both signs of \(h\) handled). **Cited, named on screen as
  unproved:** the Extreme Value Theorem, in the same register L1 uses for its
  modulus and L4 for uniform continuity. P2 bar: derivation, not proof — met.
- **Representations (D4):** the sweep with refuted points greyed out (visual);
  the escape-route inequality (symbolic); "if the ground is sloped you are not
  at the top" (verbal/grounded, used lightly — insight §12); the comparison
  table over the candidate set (numerical); the error band around a
  linearization (visual + numerical).
- **Translations learners must perform (D4):** slope sign ↔ which direction
  improves; "greyed out on the sweep" ↔ "refuted by C4"; "survived the sweep" ↔
  "the derivative has no opinion"; curvature bound ↔ trustworthy step size;
  \(f''(a)\) ↔ the next Taylor coefficient (stated, L11's to develop).
- **Examples, nonexamples, edge & degenerate cases (D7):**
  \(x^3-3x\) on \([-2,3]\) (main worked case — global max at an **endpoint**
  while an interior local max exists; minimum attained at **two** points);
  `ex-cubic-inflection` \(x^3\) at \(0\) (survivor, not an extremum);
  `ex-abs` on \([-2,2]\) (minimum the sweep cannot examine);
  \(x^4\), \(-x^4\), \(x^3\) at \(0\) (the second-derivative test's silence);
  \(f(x)=x\) on \((0,1)\) (**empty candidate set, no maximum** — the method
  correctly returns nothing);
  a **constant function** (every point stationary — the reduction is still valid
  but is *not* to a finite list; this is the degenerate case the correctness
  work must not paper over, §1g);
  a **linear** \(f\) (the escape-route guarantee never fails anywhere in the
  domain — the case that stops \(\delta\) being read as an observable
  threshold);
  `ex-decay` \(e^{-t/1.5}\) (the linearization, and an optimization whose answer
  is entirely at the endpoints);
  `ex-drive` (two declared `turningPoints` — "when was the car fastest?" with a
  physical reading the learner already has).
- **Misconceptions (D13):** M1–M7 of
  [insight §Prerequisites](insight.md#prerequisites-limitations-likely-misconceptions),
  each staged elicit→confront→resolve at the point it arises — M1 at the first
  survivor, M3 at the first endpoint, M6 when the interval is opened. The
  grounded bridge's own false intuition ("flat means summit") **is** M1, so the
  confront beat is the bridge breaking, not a separate aside.

## 1d. Outcomes with evidence

> **Attainment column, read literally.** "Built" means the item exists, is
> registered in `assessmentManifest.ts`, and its grading is proven correct by
> `describeGradingContract`'s mustAccept/mustReject batteries
> (`optimizationApproximationGradingContract.test.ts`). It is **not**
> independent review, and it is not a live learner's success — see §6.

| Outcome (operational) | Dim | Owner | Level | Evidence item | Attainment |
| --- | --- | --- | --- | --- | --- |
| Given a fresh \(f\) on a fresh closed interval, construct the complete candidate set and state why each non-stationary member is in it | D2/D3 | lesson | E3 | `opt-candidate-set` (`exercise-sequence`, 6 steps: the count of interior stationary points → each of the three constructed individually, in increasing order → why BOTH endpoints belong (`multiple-choice`, the one shared reason) → the global maximum (`numeric`)) | built |
| Predict, before computing, that the global maximum sits at an endpoint although an interior local maximum exists | D1/D9 | lesson | E3 | `opt-endpoint-fresh` (`exercise-sequence` on a **fresh** function and interval: where the max sits (`multiple-choice`) → its value (`numeric`)) | built |
| Decline to conclude an extremum from \(f'(a)=0\), and state what *does* follow | D13 | lesson | E2 | `opt-flat-not-extremum` (`multiple-choice`; distractors are rival diagnoses, incl. one **true but not the conclusion**) | built |
| On an unfamiliar function, name **which hypothesis** of the refutation argument fails at a given point | D9/D13 | lesson | E3 | `opt-which-hypothesis` (`exercise-sequence` on \(n(x)=\sqrt[3]{(x-2)^2}+1\) — no absolute-value notation, not shape-matchable to the lesson's own \(\lvert x\rvert\) example: the minimum's location and value (`numeric`) → which hypothesis failed (`multiple-choice`)) | built |
| Say what the method returns on an open interval, and why that is correct rather than broken | D13/D5 | lesson | E2 | `opt-open-interval` (`multiple-choice`) | built |
| Classify a survivor with the second-derivative test, and return "silent" when \(f''(a)=0\) | D3/D7 | lesson | E3 | `opt-second-test-silent` (`exercise-sequence`: classify where \(f''\neq0\) (`multiple-choice`) → verdict where \(f''=0\) (`multiple-choice`) → pick the pair of functions separating the cases (`multiple-choice`)) | built |
| From a curvature bound, produce an interval on which a linearization meets a stated tolerance | D3/D4 | lesson | E3 | `opt-linearize-tolerance` (`numeric`, graded on \(\lvert h\rvert\le\sqrt{2\varepsilon/M}\)) | built |
| Select between the presented calculus and algebraic-certificate routes on fresh functions, and justify the selection | D8/D9 | lesson | E3 | `opt-select-route` (`exercise-sequence` on a **genuine fresh pair**, \(p(x)=x^2+6x+11\) and \(q(x)=x^3-6x^2+9x+1\): which has an algebraic certificate (`multiple-choice`, choices name only the structural reason, never the completed identity or the answer) → \(p\)'s certified minimum (`numeric`) → why \(q\) has no such shortcut (`multiple-choice`, the captured justification) → \(q\)'s minimum via the full calculus route (`numeric`, landing at an ENDPOINT, not either interior stationary point)) | built |
| Identify the load-bearing steps of the escape-route argument and what each hypothesis does — on a fresh sloped point | D6 | lesson | E3 | `opt-derive-steps` (`exercise-sequence` on \(g(x)=x^2-4x+1\) at \(a=0\), a fresh pair used nowhere else: **(A)** which property of \(g\) licenses treating \(E(h)\) as smaller than \(\lvert mh\rvert\) for small \(h\) — differentiability, not mere continuity or boundedness (`multiple-choice`); **(B)** stepping with only \(h>0\), which single claim (max or min) that alone refutes (`multiple-choice`); **(C)** what property of \(a=0\) is what makes \(h<0\) *also* available, so the *other* claim gets refuted too — interiority, not differentiability again (`multiple-choice`); **(D)** the value at the step that actually improves (`numeric`)) | built |
| Write the escape-route argument out in full | D6 | **none — see note** | — | `opt-derive-escape` (`self-check`) — a **practice event, not evidence** | built (no evidence claim) |
| Retain "necessary is not sufficient" under delayed retrieval | D12 | **module** | E3 | `mod-calctech-retain-necessary-not-sufficient` (module `calculus-technique`, Gate 9) | **not built** — Gate 9 open |
| Optimize a **composite** on an interval, requiring L5's chain rule to differentiate and L6's method to decide | D10 | **module** | E5 | `mod-calctech-mixed-optimize-composite` (module `calculus-technique`, Gate 9) | **not built** — Gate 9 open |

**Transfer.** Four transfer-tier items. `opt-which-hypothesis` is the
**abstraction-return** item (insight §14): it is set on a function with no
walkable reading and is scored on naming what fails, not on recognizing the
shape — a learner who answers by matching to \(x^3\)/\(\lvert x\rvert\) must
fail it, which constrains the fixture choice at build time. `opt-endpoint-fresh`,
`opt-select-route` and `opt-derive-steps` all run on **functions the lesson never
shows**. `opt-derive-steps` is designed so its four steps cannot be passed by
conflating the two hypotheses: (A) isolates **differentiability** as the
property that controls \(E(h)\) (a learner who picks "continuity" or
"boundedness" fails it, even though continuity is a real, separate hypothesis
the argument also uses via C7); (B)+(C) isolate **interiority** as the property
that supplies the *second* sign of \(h\), and require recognizing that one
sign only refutes one of {max, min} — checking both signs is what refutes
*both* possibilities, not an arbitrary completeness gesture.

**Freshness rule, and two items that are deliberately not evidence.** Every item
carrying an evidence claim runs on inputs the guided scene and explorer never
display. Two items carry no claim at all, and both are declared here rather than
quietly counted:

1. **`opt-endpoint-predict`** — the checkpoint, on the lesson's own worked
   example. `committed-prediction` has ceiling **E1**
   (`CAPABILITY_EVIDENCE_CEILING`, `src/lessons/evidence.ts`: "commit-before-reveal
   is still recognition"), and it reuses a shown function, so it could not carry
   an E3 claim on either count. Objective 2's evidence is `opt-endpoint-fresh`.
2. **`opt-derive-escape`** — the free-response derivation. **The runtime cannot
   produce the evidence an earlier draft claimed from it**, on two independent
   grounds, both checked against the code:
   - An in-lesson `self-check` is **learner-self-marked**, not human-scored.
     `SelfCheckBody` (`src/components/lesson/ExercisePanel.tsx`) has the learner
     write, reveal a model answer, and mark understood / not-yet; its own
     docstring says "Not machine-graded." Human review applies to a `self-check`
     inside a **module attempt set** — `/review` reads `AttemptSet`s, not lesson
     exercises — so calling a lesson item "human-scored" was simply wrong.
   - Even in the module path, [ADR-004](../../../../engineering/decisions/004-experience-node-ontology.md)
     is explicit that the local reviewer is unauthenticated and single-device, so
     "a pass recorded this way is a self-administered judgment, not independently
     certified mastery". `assessmentManifest.ts` enforces the matching half in
     code: an **E4+ claim on `scoringAuthority: "self-marked"` fails**.

   So the item stays — writing the argument out is worth doing — but as a
   **practice event with no evidence claim**, and objective 9 is re-scoped to
   `opt-derive-steps`, which captures the argument's load-bearing choices at a
   level the runtime can actually record (E3) — including, after a second
   owner review pass, an explicit test that differentiability and interiority
   are not interchangeable: one step can only be passed by naming
   differentiability as the source of residual control, and another only by
   naming interiority as what supplies the second sign of \(h\), so a learner
   who conflates "the function is well-behaved here" with "both directions are
   available" fails one half or the other.

   **What this costs, stated plainly: this lesson produces no E6 justification
   evidence, and none is obtainable in this repository today** — not in-lesson,
   and not via the module queue either, per ADR-004. The genuine "reproduce the
   argument unaided" obligation is therefore deferred to the
   [validation pilot](../../../../authoring/insight-validation-protocol.md),
   where a real human scores a real learner. No proof-ready or E6 claim may rest
   on anything in this lesson.

**Evidence-ceiling preflight** (applied before coding, per A2–A4 and L5's
precedent), read off `src/lessons/evidence.ts` rather than assumed:

| Capability | Ceiling | Claimed here |
| --- | --- | --- |
| `committed-prediction` | **E1** | E1 — checkpoint only, not evidence |
| `multiple-choice` | E2 | E2 |
| `numeric`, `exercise-sequence` | E3 | E3 |
| `self-check` | E5, **but E4+ is barred on `self-marked` scoring** | **no claim** |

Three corrections were made here after owner review, and are recorded rather than
silently applied:

1. An earlier draft claimed **E3 for `committed-prediction`**; its ceiling is
   **E1**. It also specified one item combining a committed-prediction step with
   a numeric step — **not implementable**: `SequenceStep`
   (`src/lessons/capabilities.ts`) admits `numeric`, `multiple-choice`, `vector`,
   `construct`, and short-text steps, and has no committed-prediction kind.
2. `opt-derive-escape` was claimed first at **E4**, then at **E5 "human-scored"**.
   Both were wrong, for the reasons above. The second was worse than the first:
   it named a scoring authority the lesson surface does not have.
3. `opt-select-route`'s outcome required a **justification** that its planned
   capture never recorded (route → value, with the reason left to feedback text).
   Feedback the learner reads is not evidence the learner produced; a
   justification step is now captured.

**Recall cap.** Several `multiple-choice` items and steps appear, but **none is
definition recall** — each is a diagnosis with rival answers. The D2 recall
budget (one item) is therefore **unspent**; if a bare definition item is added at
build time it is the only one permitted.

## 1e. Coverage status
Taught: all of §1c, built in `src/lessons/optimizationApproximation.ts`.
Practiced: every lesson-owned outcome has a built, tested item (§1d). What
"independently demonstrated" can mean before any learner has used the lesson
is the mechanical form: each item's grading is proven correct against a
mustAccept/mustReject battery, not merely capable in principle — see the
attainment-column note above §1d. That is not a substitute for a domain-owner
reading the rendered page or a learner actually succeeding on it; both remain
open, and Gate 8 (§6) records that distinction rather than closing over it.

## 1f. Connections, assessment, retention
- **Cumulative (D10):** L2 C5 is not merely recalled, it is the **premise of the
  lesson's central argument** — the strongest such reuse in the course so far.
  L1's tolerance reasoning supplies C3's \(\delta\). L4 C9 supplies C13/C15
  (approved 2026-08-01). `ex-cubic-inflection` and `ex-abs` return in
  **inverted roles**: in L2 they were counterexamples about what a *tangent* is;
  here they are counterexamples about what \(f'=0\) *means*.
- **Assessment:** **1 check + 5 drill + 4 transfer** = 10 items, plus the
  non-evidencing `opt-derive-escape` practice event. Drill:
  `opt-candidate-set`, `opt-flat-not-extremum`, `opt-second-test-silent`,
  `opt-linearize-tolerance`, `opt-open-interval`. Transfer:
  `opt-endpoint-fresh`, `opt-which-hypothesis`, `opt-select-route`,
  `opt-derive-steps`. Pinned by a tier-mix test in
  `optimizationApproximationGradingContract.test.ts`, matching
  `chainRuleGradingContract.test.ts`'s pattern — the test counts the two
  non-evidencing events separately, so a later edit cannot quietly promote one
  into the evidence set. **Every evidence-bearing item uses a function the
  lesson never displays**, without exception.
- **Woven Explore:** the sweep explorer owes ≥1 prediction (which points survive
  on a chosen interval) verified against its own readouts, and ≥1 verification
  that the escape-route guarantee is **local** — the learner enlarges \(h\) until
  improvement fails and reads **the first step at which this grid sees agreement
  break** off the panel — an observation, explicitly distinct from the fixture's
  certified sufficient radius, and absent entirely on the linear preset. That
  second interaction is what stops C3 from being a slogan; calling what it finds
  "the threshold" is the failure mode §1c names.
- **Retention (D12):** "\(f'(a)=0\) is necessary, not sufficient" — the claim
  most likely to erode back into the procedure, and the one L8/L20/L27 all reuse
  the discipline of.
- **Forward:** L11 `power-taylor-series` (the rungs continue; \(\tfrac12f''(a)\)
  is literally the next coefficient — **exact**); L28
  `partial-derivatives-gradient` (the same refutation with every direction
  available; saddle points are the survivors-not-certified case — **exact for
  the argument, new content for the classification**); L22/L23/L27 (equilibria
  and stability — **architectural**).

## 1g. Correctness & scope
- **Math layer.** Every candidate set, extremum value, classification verdict,
  and error bound must come from `src/math` — as an `optimization.ts` module or
  additions to `calculus.ts` (a Mode C decision, not fixed here). No scene or
  explorer may compute them.
- **Required property tests** (each is a real check, not a smoke test):
  1. **The certified radius really is sufficient.** For each fixture and each
     sampled \(a\) with \(f'(a)\neq0\), the **declared** radius \(\delta\) must
     satisfy
     \(\operatorname{sign}\bigl(f(a+h)-f(a)\bigr)=\operatorname{sign}\bigl(f'(a)h\bigr)\)
     for every sampled \(0<\lvert h\rvert<\delta\). This makes C3 machine-checked.
     It does **not** establish that \(\delta\) is maximal, and no code or copy
     may say it is. Three distinct things must be kept apart in the API and in
     the UI copy: **(a)** the certified sufficient radius (declared per fixture
     from its own analysis, the same declared-not-inferred contract
     `monotoneIntervals` uses); **(b)** the *first sampled disagreement* on one
     explicitly selected fixture — an observation of a sampling grid, labelled
     as such, and not necessarily the boundary of any interval on which the
     guarantee holds, since agreement may fail and later return; **(c)** the case
     where **no disagreement exists in the domain at all** (any linear \(f\)),
     which must render as "none in this domain", never as a missing or
     zero threshold.
  2. **The candidate set is exact, and dense scanning is not the oracle.** Every
     fixed fixture carries **analytically declared** stationary and singular
     points and an **exact expected candidate set**, checked against the
     fixture's declared derivative — the same contract
     `CalculusFixture.monotoneIntervals` already states ("declared by the course
     from the derivative's sign, not inferred by sampling"), and for the same
     reason: a narrow extremum between two samples is invisible to a scan, so a
     scan can support an *observation* and can never license a *completeness
     guarantee*. A dense scan's argmax/argmin agreeing with the declared set
     stays in the suite as **corroboration**, and a disagreement is a real
     failure — but the correctness claim rests on the declaration, not the scan.
  3. **The error bound is neither violated nor vacuous.** On a dense grid,
     \(\lvert f(a+h)-L(h)\rvert\le Mh^2/2\) must hold, **and** the bound must be
     within an order of magnitude of the true error at the tolerance radius —
     a bound that is correct but 10⁶× loose teaches the wrong thing.
  4. **The silence battery.** \(x^4\), \(-x^4\), \(x^3\) at \(0\) must all
     produce the verdict *silent*, and the classifier must never guess.
  5. **The degenerate case is reported, not papered over.** A constant function
     makes every point stationary. The helper must report the reduction as
     **not finite** rather than returning an arbitrary finite list — the same
     honesty `CalculusFixture.monotoneIntervals` already uses when it says
     "not certified" instead of "not monotone".
  6. **The empty case.** \(f(x)=x\) on an open interval must yield an empty
     candidate set and an explicit *no existence guarantee*, not a silent
     endpoint value.
- **Declared unproved step:** the **Extreme Value Theorem** (C10), named on
  screen as assumed. With the Mode A edge approved it is the lesson's **only**
  cited ingredient — C13 and C15 are derived.
- **Scope exclusions:** constrained optimization and Lagrange multipliers
  (declared off every path in the benchmark matrix); Newton's method and its
  convergence; higher-order Taylor polynomials, Lagrange remainder, radius of
  convergence (L11); l'Hôpital's rule; curve sketching as a genre; inflection
  points beyond \(x^3\) as C6's witness; the Mean Value Theorem (compared and
  rejected as a route — see the insight's amendment note); the multivariable
  statement and saddle points (L28).
- **Abstraction return:** insight §14, evidenced by `opt-which-hypothesis`,
  which must be set on a function whose answer cannot be reached by shape-
  matching to the lesson's own examples.

## 6. Acceptance record (Gate 8)

**Gate 8: READY FOR INDEPENDENT REVIEW — not yet accepted.** Mode C
implementation is complete on `feature/l6-optimization-approximation`
(2026-08-01 – 2026-08-02), per the repository owner's explicit authorization
to cross the Mode B → Mode C boundary. Every checklist item below reflects
what the **implementing agent** has verified mechanically (tests, typecheck,
lint, a live e2e pass) — it is **not** the domain-owner sign-off Gate 8
requires.

**A first independent review of this implementation already ran, and found
real defects self-verification had missed** — the same pattern the Mode B
docs went through twice before this. Confirmed and fixed: `trustRadius`'s
fixed-point iteration was genuinely broken (a ~10-order-of-magnitude wrong
error bound on the quartic preset, hidden by the one hand-checked case
happening to have a locally constant bound); the guided scene and explorer
had silently dropped roughly half the approved plan's teaching beats and
controls (`tooBig`, `oneDirection`, the signed-h slider, mh/E(h), the
sign-agreement indicator, the sweep interaction, interval bounds); three
exercises overclaimed what they captured or leaked their own answers
(`opt-candidate-set` counted rather than constructed; `opt-select-route`'s
correct choice spelled out the full identity; `opt-which-hypothesis`'s
function was directly shape-matchable to the shown `|x|` example); the
`opt-derive-escape` model answer contained a genuine arithmetic
self-contradiction and an unjustified domain claim; and the checkpoint used
a plain reveal toggle that records no commitment at all, contradicting its
own documented description. All are fixed, with regression tests for each
(see the implementation report for the exact commits). **This round of
review is not a substitute for a second one** — L5's own Gate 8 needed an
independent pass AFTER its self-review had already found and fixed real
defects, and the same discipline applies here: passing one outside review
is evidence the harness works, not evidence the second pass would find
nothing. No box below should be read as "accepted."

**A second independent review (2026-08-02) found the first round's own fix
incomplete, plus new defects the first round never touched.** `trustRadius`'s
bisection replacement had itself started from an UNVERIFIED `lo = hi/2`
(feasible only by assumption) rather than the always-valid `lo = 0` —
infeasible for a small enough epsilon (regression: `OPT_QUARTIC`, `a=0`,
`epsilon=1e-30`) — and never reconciled its answer with the fixture's own
declared domain, returning literal `Infinity` for a zero-curvature fixture
with a bounded domain. Both fixed: `lo=0` needs no assumption (the error
bound at `r=0` is exactly `0`), and the radius now never exceeds what the
fixture's domain allows from `a` (one-sided at a domain edge, symmetric
otherwise), with a domain-reconciliation regression and a logarithmic
epsilon sweep added. Separately: the |x|/x³/x⁴/−x⁴ explorer presets opened
on a point OTHER than the case they advertised, requiring a drag before the
silent/singular verdict the preset's own label promised was visible — fixed
by defaulting each to the case itself, with component tests pinning the
initial (no-drag) readout of all four. `opt-select-route`'s outcome claimed
"choose, unprompted" when the exercise presents both named routes and asks
the learner to select between them — corrected everywhere (learner-facing
objectives, the mastery-contract outcomes table, the lesson plan) to "select
between the presented ... routes ... and justify the selection"; the E3
evidence claim survives this correction (the `exercise-sequence` ceiling
does not depend on whether the route choice itself was cued, and the item
still captures genuine multi-step production beyond the one cued pick). And
the guided scene and explorer had each independently re-derived the escape
step's `mh`/`E(h)`/sign-agreement split and the candidate-set values shown
in `decideGlobally` — real, if easy to miss, violations of the "every
displayed quantity originates in `src/math`" contract. Both now read ONE new
shared helper, `stepDecomposition` (`src/math/optimization.ts`), and the
candidate table is built from `candidateSet`/`globalExtrema`'s own computed
points rather than a hand-typed, separately-checked string. **This round is
not a substitute for a further one either** — the same discipline stated
above still applies. No box below should be read as "accepted."

- [x] Insight contract linked and `PASS` — [insight.md](insight.md).
- [x] All §1 fields filled and reconciled against the built lesson
      (`src/lessons/optimizationApproximation.ts`).
- [x] Outcomes operational, owner-marked, evidence-paired — the `objectives`
      field, cross-checked by `objectiveCoverage.test.ts`.
- [x] Every lesson-owned outcome's item exists, is registered in
      `assessmentManifest.ts` with an explicit claim, and its grading is
      proven correct by `describeGradingContract`'s mustAccept/mustReject
      batteries (`optimizationApproximationGradingContract.test.ts`, 63
      tests, including the redesigned `opt-candidate-set`/`opt-select-route`/
      `opt-which-hypothesis` contracts and the `opt-endpoint-predict`
      committed-prediction contract added by the second independent-review
      round) — the mechanical form of "independently demonstrated" available
      to an authored curriculum with no live learner pilot yet.
- [x] No lesson-owned outcome accepted on planned module evidence — verified
      by `objectiveCoverage.test.ts`.
- [x] Assessment set matches §1f, pinned by a tier-mix test (1 real
      committed-prediction check + 5 drill + 4 transfer evidence-bearing + 1
      self-marked practice event); recall cap respected (zero bare-recall
      items).
- [x] Module-owned outcomes carried forward as Gate-9 obligations for
      `calculus-technique` (no `itemIds`, matching karatsuba's course-owned
      precedent).
- [x] Backward bridges (L1/L2/L4) + forward edges (L11/L28) recorded as
      `requires` edges in `src/curriculum/edges.ts`, including the newly
      landed `fundamental-theorem → optimization-approximation` edge.
- [x] Retention hook recorded (§1f).
- [x] Correctness gate passed: all six property tests in §1g implemented and
      green in `src/math/__tests__/optimization.test.ts` (40 tests, including
      the `trustRadius` bisection regression and per-fixture error-bound sweep
      added by the second review round, and the `lo=0` bisection-invariant
      regression, domain-reconciliation regression, logarithmic epsilon
      sweep, and `stepDecomposition` tests added by the third), plus a
      load-time consistency guard (`assertOptimizationFixturesAreConsistent`)
      that caught and fixed one real defect before it shipped (`OPT_DRIVE`'s
      stationary points were hand-typed guesses that didn't match its own
      formula).
- [x] Both Mode A amendments in §1a resolved by the owner (2026-08-01).
- [x] No lesson-owned objective is covered by an item whose `evidenceBasis` is
      `self-marked` — `assessmentManifest.ts` enforces this, and a dedicated
      test proves `opt-derive-escape` covers no objective by construction.
- [x] Profile-dependent items match P2; no stage inflation (EVT stays a cited
      ingredient and no P3 bar is claimed).

**Browser-level verification, run after the checklist above.** A dedicated
`e2e/lesson-optimization-approximation.spec.ts` (12 tests: page load and
console-error-free clip playback; all ten guided-scene major steps
reachable via Previous/Next — including the `tooBig` and `oneDirection`
beats restored by the second independent-review round, each confirmed
independently reachable and correctly named; the `predictStep` hold
genuinely holding; reduced-motion; the main cubic's endpoint maximum in the
rendered explorer; the certified-radius and first-sampled-disagreement
readouts rendering as separate, distinctly labelled items; the linear
preset's "none in this domain"; the h slider driving live mh/E(h) readouts
with Run sweep coloring the strip by the real candidate set; live grading of
the practice set's first question; and `opt-endpoint-predict` genuinely
recording a commitment — no feedback visible before Commit, scored correct
after — proving it is not the plain reveal-toggle Checkpoint component) —
all passing. The two existing cross-lesson specs
(`course-context-and-grammar.spec.ts`, `lesson-callouts-render.spec.ts`, 21
tests) also exercise this lesson and pass, including the heading-hierarchy
check (confirms no `callout` block sits first) and a dedicated "renders all
2 of its misconception callouts" check for this lesson by name. One real bug
was found and fixed by this pass: the practice-grading e2e test assumed the
first rendered question would be a multiple-choice item (matching
`chain-rule`'s exercise ordering); L6's practice UI is paginated one
question at a time, and the actual first question is `opt-candidate-set`'s
numeric step — the test was wrong, not the lesson, and was corrected to
match the real UI.

**The full `./check.sh --e2e` suite (39 spec files, 224 Playwright tests) was
run for the third review round's repair** (2026-08-02), not just this
lesson's own spec — `tsc -b` clean, `oxlint` clean, `vitest run` green (153
files, 2463 tests), and every spec covering this lesson (its own 12 tests,
the `guided-scene-hard-gates` check for `optimization-approximation`, and
both cross-lesson sweeps above) passed with zero failures. Three failures
elsewhere in the full suite are pre-existing and documented in
`docs/quality/known-failure-modes.md`, not caused by this repair:
`solution-sets` and `ftc-accumulate-then-measure` hard-gate failures (the two
waivers already recorded in the module ledger §7) and a `benchmark-lab.spec.ts`
"eigen" candidate clock-starvation timeout matching that doc's documented
"media-heavy specs that fail only inside the full `--e2e` sweep" contention
class — none touch any file this repair changed.

**What has NOT happened:** independent review of the Mode C implementation
(two rounds of review covered the Mode B docs only, before any code
existed); a domain-owner's read of the rendered lesson (L5's acceptance
review found a real presentation defect — doc-internal citations reaching
learner prose — that no automated test catches); and the remaining 37 e2e
spec files outside this lesson's own and the two cross-lesson sweeps above.
