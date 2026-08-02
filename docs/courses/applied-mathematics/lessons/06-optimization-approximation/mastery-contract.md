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

| Outcome (operational) | Dim | Owner | Level | Evidence item | Attainment |
| --- | --- | --- | --- | --- | --- |
| Given a fresh \(f\) on a fresh closed interval, construct the complete candidate set and state why each non-stationary member is in it | D2/D3 | lesson | E3 | `opt-candidate-set` (`exercise-sequence`: the candidate points (`numeric`, count then values) → the reason for the non-stationary one (`multiple-choice`) → the global maximum (`numeric`)) | planned |
| Predict, before computing, that the global maximum sits at an endpoint although an interior local maximum exists | D1/D9 | lesson | E3 | `opt-endpoint-fresh` (`exercise-sequence` on a **fresh** function and interval: where the max sits (`multiple-choice`) → its value (`numeric`)) | planned |
| Decline to conclude an extremum from \(f'(a)=0\), and state what *does* follow | D13 | lesson | E2 | `opt-flat-not-extremum` (`multiple-choice`; distractors are rival diagnoses, incl. one **true but not the conclusion**) | planned |
| On an unfamiliar function, name **which hypothesis** of the refutation argument fails at a given point | D9/D13 | lesson | E3 | `opt-which-hypothesis` (`exercise-sequence`: the unexamined extremum's location (`numeric`) → which hypothesis failed (`multiple-choice`)) | planned |
| Say what the method returns on an open interval, and why that is correct rather than broken | D13/D5 | lesson | E2 | `opt-open-interval` (`multiple-choice`) | planned |
| Classify a survivor with the second-derivative test, and return "silent" when \(f''(a)=0\) | D3/D7 | lesson | E3 | `opt-second-test-silent` (`exercise-sequence`: classify where \(f''\neq0\) (`multiple-choice`) → verdict where \(f''=0\) (`multiple-choice`) → pick the pair of functions separating the cases (`multiple-choice`)) | planned |
| From a curvature bound, produce an interval on which a linearization meets a stated tolerance | D3/D4 | lesson | E3 | `opt-linearize-tolerance` (`numeric`, graded on \(\lvert h\rvert\le\sqrt{2\varepsilon/M}\)) | planned |
| Choose, unprompted, between the calculus route and an algebraic certificate, and justify the choice | D8/D9 | lesson | E3 | `opt-select-route` (`exercise-sequence` on a **fresh** pair of functions, not the worked example: which route (`multiple-choice`, prompt names neither) → **why that route works here** (`multiple-choice`, rival justifications — the *justification is captured*, not left to feedback) → the extremum (`numeric`)) | planned |
| Identify the load-bearing steps of the escape-route argument and what each hypothesis does — on a fresh sloped point | D6 | lesson | E3 | `opt-derive-steps` (`exercise-sequence` on \(g(x)=x^2-4x+1\) at \(a=0\), a fresh pair used nowhere else: **(A)** which property of \(g\) licenses treating \(E(h)\) as smaller than \(\lvert mh\rvert\) for small \(h\) — differentiability, not mere continuity or boundedness (`multiple-choice`); **(B)** stepping with only \(h>0\), which single claim (max or min) that alone refutes (`multiple-choice`); **(C)** what property of \(a=0\) is what makes \(h<0\) *also* available, so the *other* claim gets refuted too — interiority, not differentiability again (`multiple-choice`); **(D)** the value at the step that actually improves (`numeric`)) | planned |
| Write the escape-route argument out in full | D6 | **none — see note** | — | `opt-derive-escape` (`self-check`) — a **practice event, not evidence** | n/a |
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
Taught: all of §1c. Practiced: every lesson-owned outcome (planned). Nothing is
yet independently demonstrated — the lesson does not exist. This section is
completed at Gate 8.

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
  `opt-derive-steps`. To be pinned by a tier-mix test at build, matching
  `chainRuleGradingContract.test.ts` — and the test must count the two
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

**Not yet applicable — the lesson does not exist.** L6 is a `future` spine node;
this contract is Mode B output only, and building it is an
[approval boundary](../../../../authoring/course-authoring-workflow.md#step-5--approval-boundaries-hard-stops)
that has not been crossed. The checklist below is carried unticked, to be
completed at Gate 8 after implementation.

- [ ] Insight contract linked and `PASS` — [insight.md](insight.md) ✅ (this box
      is the only one already satisfiable, and is left unticked with the rest so
      the record is filled in one pass at acceptance).
- [ ] All §1 fields filled and reconciled against the built lesson.
- [ ] Outcomes operational, owner-marked, evidence-paired.
- [ ] Every lesson-owned core outcome independently demonstrated with real
      in-lesson evidence.
- [ ] No lesson-owned outcome accepted on planned module evidence.
- [ ] Assessment set matches §1f, pinned by a tier-mix test; recall cap
      respected.
- [ ] Module-owned outcomes carried forward as Gate-9 obligations for
      `calculus-technique`.
- [ ] Backward bridges (L1/L2/L4) + forward
      edges (L11/L28) recorded, including as `requires` edges in
      `src/curriculum/edges.ts`.
- [ ] Retention hook recorded.
- [ ] Correctness gate passed, including all six property tests in §1g.
- [x] Both Mode A amendments in §1a resolved by the owner (2026-08-01).
- [ ] No lesson-owned objective is covered by an item whose `evidenceBasis` is
      `self-marked` (`assessmentManifest.ts` enforces this; `opt-derive-escape`
      is registered with **no objective coverage** for exactly that reason).
- [ ] Profile-dependent items match P2; no stage inflation (EVT stays a cited
      ingredient and no P3 bar is claimed).
