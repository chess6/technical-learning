# Lesson Mastery Contract

The per-lesson **mastery gate**. It is completed **after** the
[Approved Insight Contract](../insight-discovery-gate.md) reaches `Gate result:
PASS` and **before** detailed lesson implementation (Gate 5 in the
[workflow](../mastery-standard.md#9-workflow-integration)).

Where the Insight Contract guarantees the lesson is built on one real
breakthrough, this contract guarantees that everything *around* that breakthrough
— definitions, procedures, representations, theorems, proofs, misconceptions,
practice, transfer, cumulative connections, assessment, and retention — is
present and evidenced. It is the artifact that stops a **conceptually elegant but
incomplete** lesson from shipping.

> **Design intent.** Concise enough to fill in per lesson (target: one page of
> real content plus the tables), rigorous enough to fail a lesson that skips
> coverage. It **references** upstream artifacts (Insight Contract, spine row,
> profile, concept ids) and never restates them — copying is a smell
> ([workflow relationship rule](../mastery-standard.md#9-workflow-integration)).

Read alongside:

- [authoring/mastery-standard.md](../mastery-standard.md) — profiles, mastery
  dimensions (D1–D14), evidence levels (E1–E7), assessment architecture.
- [authoring/templates/lesson-plan.md](lesson-plan.md) — the *implementation* planning
  template (Stage 3). This contract precedes and feeds it; the template's
  learning objectives become this contract's outcomes-with-evidence.
- [authoring/assessment-patterns.md](../assessment-patterns.md) — the pattern library the
  [exercise standard](#3-exercise-and-assessment-standard) below draws on.
- [product/semantic-page-grammar.md](../../product/semantic-page-grammar.md) — how the taught content
  is presented and where the abstraction path returns to the general case.

---

## 1. The contract fields

Copy this section per lesson. Keep entries terse; link rather than restate.
Every field is required unless marked *(optional)* or *(profile-dependent)*.

### 1a. Placement & upstream links

- **Lesson / spine position:** `<e.g. L5 solution-sets>` (link
  [spine](../../courses/linear-algebra/course-spine.md) row).
- **Core course profile in force:** `<P1 standard computational | P2 demanding applied | P3 proof/honors>`
  (+ any per-lesson override, with reason).
- **Research-bridge overlay?** `<no | yes>` — if yes, its enrichment is labeled and
  **excluded from the must-demonstrate / exam bar** (D14, never a core outcome).
- **Approved Insight Contract:** `docs/courses/<course>/lessons/<lesson>/insight.md`
  — `PASS` confirmed; primary-insight sentence **linked, not copied**.
- **Saved as:** `docs/courses/<course>/lessons/<lesson>/mastery-contract.md`.
- **Concept ids introduced / reused:** `<from CURRICULUM_ARCHITECTURE §3>`.

### 1b. Role, bridge, and need

- **Lesson role in the course:** what job this lesson does in the arc (one line).
- **Prerequisite knowledge to retrieve:** the specific prior ideas the learner
  must reactivate (not "assume known") — each becomes a backward-bridge event
  and, where the profile needs it, a prerequisite check.
- **Bridge from the previous lesson:** the concrete sentence connecting the last
  lesson's close to this lesson's opening.
- **Motivating problem / mathematical need:** the genuine question the lesson
  opens on (Vision §5.3; grammar §5 opening).

### 1c. Content to teach (the coverage core)

- **Approved central insight:** *(link only)* the `PASS` contract's insight.
- **Required definitions & notation (D2):** every object named precisely, with
  the notation used consistently downstream. *A visual insight with definitions
  missing here is an automatic reject — case #1.*
- **Required mathematical objects:** the objects the learner must be able to
  construct/recognize.
- **Procedures requiring fluency (D3):** each procedure the learner must execute,
  with the *method-specific intermediate* an assessment will grade (not just a
  final number a naive method could also produce).
- **Theorems / propositions / corollaries / invariants (D5):** each statement,
  with hypotheses and conclusion explicit.
- **Expected proof / justification depth (D6):** *(profile-dependent)* — for
  each theorem, one of: `stated + short "why"` (P1) · `derivation / "why it
  works" + occasional proof` (P2) · `proof constructed (both directions where
  applicable)` (P3). State *which* and *where each hypothesis is used*.
- **Required representations (D4):** which of symbolic / numerical / visual /
  verbal / applied this object lives in.
- **Translations learners must perform (D4):** the specific representation→
  representation moves (e.g. "read the null-space dimension off the free-variable
  count and off the picture").
- **Examples, nonexamples, edge & degenerate cases (D7):** the concrete cases,
  including the boundary/degenerate ones the visualization must handle honestly.
- **Misconceptions & likely errors (D13 seed):** each staged as an
  elicit→confront→resolve event (Vision §12), placed where it arises.

### 1d. Outcomes, each paired with evidence

Every outcome is a capability the learner should hold **after** the lesson,
written **operationally** and paired with an assessment item that could
demonstrate it at a stated [evidence level](../mastery-standard.md#5-evidence-levels).
Vague outcomes are rejected.

Each outcome is either **lesson-owned** (this lesson must evidence it directly) or
**module-owned** (its evidence legitimately lives in the module assessment, Gate
9 — e.g. cumulative integration, delayed retention, timed/mixed problems). This
ownership column decides what Gate 8 can accept (see [§2](#2-attainment-levels-and-where-evidence-lives-gate-8-vs-gate-9)):

| Outcome (operational) | Dimension | Owner (lesson / module) | Target level | Evidence item | Highest attainment required |
| --- | --- | --- | --- | --- | --- |
| `<e.g. Given a consistent system with ∞ solutions, write its complete solution set parametrically and identify the homogeneous direction>` | D2/D4 | lesson | E3 | `<exercise id / kind>` | independently demonstrated |
| `<e.g. Combine solution sets with elimination on a mixed cumulative item>` | D10 | module | E5 | `<module-set id>` | independently demonstrated (Gate 9) |
| … | … | … | … | … | … |

> **Weak vs strong outcome.**
> *Weak:* "Understand solution sets."
> *Strong:* "Given a consistent system with infinitely many solutions, express
> its complete solution set parametrically, explain why the parameterization
> contains every solution, and identify the associated homogeneous direction."

Record conceptual, computational, proof *(profile-dependent)*, and transfer
outcomes — each with its evidence.

### 1e. Coverage-status classification

Taught → practiced → independently demonstrated are **cumulative attainment
levels on one ladder**, not three separate buckets: reaching "independently
demonstrated" *presupposes* the outcome was taught and practiced. For each item
in 1c/1d record two things — the **attainment level required** (the obligation)
and, at acceptance, the **attainment level actually reached** — so "elegant but
incomplete" is visible as a gap between the two:

- **Taught** (level 1) — explicitly presented in the lesson body (E1 possible).
- **Practiced** (level 2) — the learner does it ≥once with feedback (E2–E3);
  *includes* taught.
- **Independently demonstrated** (level 3) — the learner does it unaided on a
  fresh item under commit-before-reveal or exam conditions (E3+); *includes*
  taught + practiced. **This is the required level for every core outcome.**

Enrichment is a **separate track, not a rung**: an **Enrichment /
research-bridge** item *(research-bridge overlay or optional)* is offered as depth
and **excluded from the must-demonstrate / exam bar** (D14).

A lesson's *must-demonstrate* set is the outcomes whose required level is
"independently demonstrated." Readiness claims (COURSE §6.2) are computed against
this set, never against "taught" or "practiced" alone. Whether a given
must-demonstrate outcome is discharged **in this lesson** or **in its module**
depends on its owner ([§1d](#1d-outcomes-each-paired-with-evidence)) and governs
Gate 8 vs Gate 9 ([§2](#2-attainment-levels-and-where-evidence-lives-gate-8-vs-gate-9)).

### 1f. Connections, assessment, retention

- **Cumulative connections to earlier material (D10):** which prior concept(s)
  this lesson fires in a new context (a strengthened edge, Vision §14) — and the
  cumulative item that exercises it.
- **Assessment evidence (summary):** the lesson's assessment set, by family and
  tier (see [§3](#3-exercise-and-assessment-standard)); confirm it does **not**
  merely repeat the instructional interaction.
- **Delayed-retention requirement (D12):** which of this lesson's outcomes must
  reappear in a later module's spaced/interleaved retrieval, and roughly when.
- **Connection to later lessons:** the forward edge this lesson opens
  (`looking-ahead`).

### 1g. Correctness & scope

- **Mathematical correctness checks:** the invariants/regressions this lesson's
  math must satisfy (link [engineering/math-correctness.md](../../engineering/math-correctness.md) /
  [quality/lesson-correctness-checklist.md](../../quality/lesson-correctness-checklist.md)); note any
  asymmetric/singular/degenerate case that must be tested.
- **Lesson-specific exclusions / scope boundaries:** what this lesson
  deliberately does **not** cover (e.g. "det not taught here; framed via
  reversibility") — the anti-scope-creep field, and the guard against forcing
  unrelated dimensions.

---

## 2. Attainment levels and where evidence lives (Gate 8 vs Gate 9)

The attainment ladder ([§1e](#1e-coverage-status-classification)) is **cumulative**
— each level includes the ones below it — so a lesson cannot quietly downgrade a
core capability into "we showed it once":

| Level (cumulative) | Minimum evidence | Counts toward "ready/mastered"? |
| --- | --- | --- |
| **Taught** | Present in the body; the learner *could* recognize it (E1). | No. |
| **Practiced** (⊇ taught) | ≥1 guided attempt with feedback (E2–E3). | Partially (current performance). |
| **Independently demonstrated** (⊇ practiced) | Unaided, fresh-instance, commit-before-reveal / exam-mode success (E3+). | **Yes** — this is the must-demonstrate set. |
| **Enrichment / research-bridge** *(separate track)* | Offered; never required. | No — and never part of the exam bar. |

Rule: **every core outcome must reach "independently demonstrated"** — but *where*
that evidence lives depends on the outcome's owner:

- **Lesson-owned outcomes** must be independently demonstrated **by actual, real
  evidence in this lesson**. Gate 8 (lesson acceptance) may accept the lesson **on
  the strength of lesson-owned outcomes only**, each with a concrete passing
  evidence item — never on a promise.
- **Module-owned outcomes** (cumulative integration D10, delayed retention D12,
  timed/mixed problems D11, method selection across lessons D8) are recorded here
  as **planned** obligations. **Planned module evidence does not license any
  mastery/readiness claim at Gate 8.** It is discharged only when **Gate 9**
  (cumulative module assessment) verifies it with real results.

So a lesson can be **accepted at Gate 8** while some of its outcomes are still
"module-owned / planned" — but the course may not claim those outcomes mastered
until Gate 9 turns the plan into evidence. A **lesson-owned** core outcome that
stalls at "taught" or "practiced" is a coverage gap the contract must flag
(rejection [#8](#5-rejection-conditions-the-mastery-gate)).

---

## 3. Exercise and assessment standard

A lesson's practice must be an **ecology organized by pedagogical function**, not
a handful of look-alike questions and not a taxonomy of UI input types. This
section defines the families and the intra-concept progression; the reusable
per-pattern guidance (strong vs weak version, false positives, formats) lives in
[authoring/assessment-patterns.md](../assessment-patterns.md), and the course-level layering
(diagnostic, module, mock exams, exam mode) lives in
[authoring/mastery-standard.md §6](../mastery-standard.md#6-assessment-architecture).

### 3a. Exercise families (by function)

Author from this palette; a lesson selects the families its outcomes need — it
does **not** owe every family (that would be the "quiz" anti-failure). A family is
**required only when the lesson's assigned dimensions / outcomes call for it**:
method selection only when D8 is in the lesson's scope, proof families only when
D6 is in scope for the profile, a transfer item only when the lesson owns a D9
transfer outcome, and procedural drill only when the lesson has a D3 procedure.
Do not add a family a lesson's outcomes do not require.

| Family | Primary dimension | Typical level | Notes / platform format |
| --- | --- | --- | --- |
| Prerequisite retrieval | D10/D12 | E1–E3 | Gates *readiness*; reuses a prior lesson's item. |
| Definition recall & recognition | D2 | E1 | **Cap at one** pure-recall item per lesson (ASSESSMENT_PATTERNS). |
| Examples & nonexamples | D7 | E1–E3 | "Which of these *is* / *is not* a …, and why?" |
| Short computational drill | D3 | E2 | Fresh inputs, not the worked example's numbers. |
| Multi-step computation | D3 | E2–E3 | `exercise-sequence` grading intermediates. |
| Method selection | D8 | E3 | *(only when D8 is in scope)* problem does **not** name the method — case #5 guard. |
| Representation translation | D4 | E3–E4 | Read a result obtained in one representation in another. |
| Prediction before calculation | D1/D13 | E1–E3 | `committed-prediction`, commit-before-reveal. |
| Interpretation after calculation | D1/D4 | E3 | Read the number/vector back as meaning. |
| Error diagnosis | D13 | E3–E4 | Bundle "which step + why" (ASSESSMENT_PATTERNS). |
| Proof completion | D6 | E6 | *(P3; or P2 where a proof is in scope)* fill a gap in a supplied argument. |
| Proof construction | D6 | E6 | *(P3)* build the argument; `self-check` + model answer (human-scored in the pilot). |
| Counterexample construction | D7 | E4/E6 | Selection in-app; construction in the pilot. |
| Missing-assumption question | D5/D6 | E6 | "Which hypothesis makes this true?" |
| Reverse / construction problem | D3/D7 | E3–E4 | `construct-in-explorer` (build an object meeting a predicate). |
| Unfamiliar transfer | D9 | E4 | *(only where the lesson owns a D9 transfer outcome)* ≥1 guided transfer in Practice; unaided transfer in the module/pilot. |
| Mixed cumulative problem | D10 | E5 | Module-level; interleaves prior topics. |
| Timed exam-style problem | D11 | E3–E5 | Mock exam / exam mode (deferred feedback). |
| Open investigation | D14 | E7 | *(research-bridge overlay)* enrichment; never on the exam bar. |

### 3b. Progression within a concept (internal, not visible stages)

Each concept should be *designed* to move a learner along this ladder. This is an
**internal authoring progression**, not a mandatory visible sequence of headings
(SEMANTIC_PAGE_GRAMMAR §1 — do not announce phases):

```
guided example (E1)
  → partially scaffolded problem (E2)
    → independent standard problem (E3)
      → varied representation (E3–E4)
        → unfamiliar transfer (E4)
          → cumulative integration (E5)
            → timed / proof-based assessment (E3–E6)
```

A given concept need not visit every rung inside a single lesson — the later
rungs (cumulative, timed, proof) legitimately live at module/course level. What
the contract checks is that **no concept jumps straight from a guided example to
a claim of mastery** with nothing in between.

### 3c. Minimum viable assessment set (per lesson)

Consistent with [authoring/assessment-patterns.md](../assessment-patterns.md#choosing-a-small-assessment-set)
(keep it light — a lesson teaches and lets you self-check; it is not an exam):

- **1 Check** — one commit-before-reveal prediction/interpretation.
- **Woven Explore** — ≥1 prediction + invariant/representation verification using
  the explorer's readouts.
- **2–4 Practice** — ≥1 fresh procedural/reconstruction item grading a
  method-specific intermediate (where the lesson has a D3 procedure); ≥1
  boundary/degenerate item; **≥1 genuine transfer item where the lesson owns a D9
  transfer outcome** (keep it light — one is usually enough in-lesson, and none is
  correct when the lesson owns no transfer outcome); *(P3, or P2 where in scope)*
  ≥1 proof-completion or construction item.
- **Deferred to the module/pilot** — full unaided reconstruction, counterexample
  *construction*, untelegraphed transfer, timed mixed problems.

The heavy, false-positive-prone probes belong **off the in-lesson surface** (the
module assessment and the [validation pilot](../insight-validation-protocol.md)),
not stacked into Practice.

---

## 4. Correctness within the contract

The mastery gate does not replace the correctness gate — it requires it. Before
lesson-level acceptance (Gate 8):

- every mathematical quantity shown is derived from `src/math` (MATH_CORRECTNESS
  rule), never reimplemented in a scene/explorer;
- the contract's edge/degenerate cases each have a regression test;
- an asymmetric matrix is covered where a transform/packing bug could hide;
- [quality/lesson-correctness-checklist.md](../../quality/lesson-correctness-checklist.md) is
  completed and any fixed bug is logged in [quality/known-failure-modes.md](../../quality/known-failure-modes.md).

A mathematically incorrect visualization fails the gate regardless of how
complete its coverage is.

---

## 5. Rejection conditions (the mastery gate)

A lesson **fails** the mastery gate — and does not proceed to acceptance — if any
of the following holds. Each maps to a
[calibration case](../mastery-standard.md#8-calibration-cases).

1. **Insight without definitions.** The visual/insight is strong but a required
   definition or precise statement (D2) is absent. *(Case 1.)*
2. **Follow-along without selection.** *(Only when D8 is in the lesson's scope.)*
   Learners can follow a worked example but no item requires them to *select* the
   method unprompted (D8). *(Case 3, 5.)*
3. **Near-copy practice only.** Every exercise reuses the worked example's shape/
   numbers; no fresh-instance E3+ item exists. *(Case 2, 3.)*
4. **Trapped in the convenient representation.** The lesson stays in \(\mathbb{R}^2\)
   (or another easy special case) while teaching a general concept and neither
   returns to the general case **nor** records an accountable deferral of that
   return — an owner (a named later lesson/module), a destination, and the
   assessment evidence, logged in **this contract or the owning module-assessment
   plan** (SEMANTIC_PAGE_GRAMMAR §4.3). *(Case 4.)*
5. **Asserted theorem in a proof profile.** A theorem is stated without the
   required justification for the profile in force (D6; P3, or P2 where a proof is
   in scope). *(Case 6.)*
6. **No connection.** The lesson has no meaningful backward or forward link to
   other lessons (D10 / coherence). *(Case 8.)*
7. **Assessment repeats instruction.** The graded items merely re-run the
   interaction used during teaching, measuring E1–E2 and supporting no readiness
   claim. *(Case 10.)*
8. **Lesson-owned core outcome not demonstrated.** A **lesson-owned** core outcome
   never reaches "independently demonstrated" **with real evidence in this lesson**
   ([§2](#2-attainment-levels-and-where-evidence-lives-gate-8-vs-gate-9)).
   (A *module-owned* outcome left as a planned Gate-9 obligation is **not** a
   rejection — but it also may not be claimed mastered until Gate 9.)
9. **Vague outcomes.** An outcome is not operational or has no paired evidence
   item ([§1d](#1d-outcomes-each-paired-with-evidence)).
10. **Missing retention hook.** No outcome is scheduled into later delayed/
    interleaved retrieval (D12), for a lesson whose material the course expects to
    persist. *(Contributes to case 9 at module level.)*

### Anti-over-reaction guardrails (the gate must also *not* fire wrongly)

The gate must **not** reject a lesson for any of these — doing so is itself a
failure ([COURSE §8, opposite failures](../mastery-standard.md#8-calibration-cases)):

- lacking a full proof, when the profile is P1 (short "why" suffices) or P2 (a
  derivation suffices unless a proof is explicitly in scope);
- lacking a real-world application that adds no value;
- not exercising a dimension outside its lesson-level scope ([COURSE §4](../mastery-standard.md#4-mastery-dimensions))
  — including not owing a transfer/selection/proof item the lesson's outcomes do
  not require;
- being exploratory/visual where that is the right representation (grammar §5);
- omitting Practice/Summary, a transfer item, or the must-demonstrate bar for a
  **genuine intro chapter** (`kind: "intro"`) — see the intro exemption in
  [§6](#6-acceptance-record-gate-8).

---

## 6. Acceptance record (Gate 8)

Gate 8 certifies **this lesson**, on the strength of its **lesson-owned** outcomes
only. Module-owned outcomes are carried forward as planned obligations for Gate 9
and are **not** counted as satisfied here. A lesson is accepted when this is true
and recorded:

- [ ] Insight Contract linked and `PASS`; primary insight preserved in meaning.
- [ ] Every field in [§1](#1-the-contract-fields) filled; upstream artifacts
      linked, not restated.
- [ ] Every outcome ([§1d](#1d-outcomes-each-paired-with-evidence)) is
      operational, marked **lesson-owned or module-owned**, and paired with an
      evidence item at a stated level.
- [ ] Every **lesson-owned** core outcome reaches **independently demonstrated
      with real in-lesson evidence**
      ([§2](#2-attainment-levels-and-where-evidence-lives-gate-8-vs-gate-9)); no
      lesson-owned outcome is accepted on planned/module evidence.
- [ ] Every **module-owned** core outcome is recorded as a Gate-9 obligation
      (owner + planned evidence) and is **not** claimed mastered yet.
- [ ] Assessment set matches [§3c](#3c-minimum-viable-assessment-set-per-lesson);
      it does **not** repeat the instructional interaction; recall is capped; a
      transfer item is present **iff** the lesson owns a D9 transfer outcome.
- [ ] Backward bridge + forward edge present; ≥1 cumulative connection (D10).
- [ ] Delayed-retention hook (D12) recorded for the persistent outcomes.
- [ ] Correctness gate passed ([§4](#4-correctness-within-the-contract)).
- [ ] No [rejection condition](#5-rejection-conditions-the-mastery-gate) holds;
      no anti-over-reaction guardrail tripped.
- [ ] Profile-dependent items (D6 proof depth, D11 speed, D14 overlay enrichment)
      match the declared core profile — no silent stage inflation.

> **Intro-chapter exemption.** For a **genuine intro chapter** (`kind: "intro"`,
> e.g. Chapter 0), the boxes requiring a must-demonstrate bar — independently
> demonstrated core outcomes, the §3c Practice set, and the transfer item — are
> **waived** (consistent with the anti-over-reaction guardrail in
> [§5](#5-rejection-conditions-the-mastery-gate) and COURSE §8). An intro chapter
> still owes the insight link, correctness, and a backward/forward bridge. Record
> the exemption explicitly rather than leaving the boxes falsely checked.

An accepted lesson feeds the [cumulative module assessment](../mastery-standard.md#9-workflow-integration)
(Gate 9); its must-demonstrate set (lesson-owned, discharged) and its module-owned
obligations and retention hooks become that module's inputs.
