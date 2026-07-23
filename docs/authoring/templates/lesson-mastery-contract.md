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
- **Course profile in force:** `<A computational | B proof/honors | C research-bridge>`
  (+ any per-lesson override, with reason).
- **Approved Insight Contract:** `docs/insights/<topic>.md` — `PASS` confirmed;
  primary-insight sentence **linked, not copied**.
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
  each theorem, one of: `stated + short "why"` (Profile A) · `proof read /
  self-checked` · `proof constructed (both directions where applicable)`
  (Profile B). State *which* and *where each hypothesis is used*.
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

| Outcome (operational) | Dimension | Target level | Evidence item | Must-tier |
| --- | --- | --- | --- | --- |
| `<e.g. Given a consistent system with ∞ solutions, write its complete solution set parametrically and identify the homogeneous direction>` | D2/D4 | E3 | `<exercise id / kind>` | demonstrate |
| … | … | … | … | … |

> **Weak vs strong outcome.**
> *Weak:* "Understand solution sets."
> *Strong:* "Given a consistent system with infinitely many solutions, express
> its complete solution set parametrically, explain why the parameterization
> contains every solution, and identify the associated homogeneous direction."

Record conceptual, computational, proof *(profile-dependent)*, and transfer
outcomes — each with its evidence.

### 1e. Coverage-status classification

For each item in 1c/1d, classify it into exactly one bucket. This is the field
that makes "elegant but incomplete" visible:

- **Taught** — explicitly presented in the lesson body.
- **Practiced** — the learner does it at least once with feedback (E2–E3).
- **Independently demonstrated** — the learner does it unaided on a fresh item
  under commit-before-reveal or exam conditions (E3+).
- **Enrichment / research-bridge** — *(Profile C or optional)* offered as depth,
  **excluded from the exam bar** (D14).

A lesson's *must-demonstrate* set is the union of outcomes marked
"independently demonstrated." Readiness claims (COURSE §6.2) are computed against
this set, never against "taught" or "practiced" alone.

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

## 2. What must be taught vs practiced vs demonstrated vs enriched

The four coverage buckets ([§1e](#1e-coverage-status-classification)) exist so a
lesson cannot quietly downgrade a core capability into "we showed it once." The
distinction is the heart of the mastery gate:

| Bucket | Minimum evidence | Counts toward "ready/mastered"? |
| --- | --- | --- |
| **Taught** | Present in the body; the learner *could* recognize it (E1). | No. |
| **Practiced** | ≥1 guided attempt with feedback (E2–E3). | Partially (current performance). |
| **Independently demonstrated** | Unaided, fresh-instance, commit-before-reveal / exam-mode success (E3+). | **Yes** — this is the must-demonstrate set. |
| **Enrichment / research-bridge** | Offered; never required. | No — and never part of the exam bar. |

Rule: **every core outcome must reach "independently demonstrated" somewhere in
the lesson or its module.** A core outcome that stalls at "taught" or "practiced"
is a coverage gap the contract must flag.

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
does **not** owe every family (that would be the "quiz" anti-failure).

| Family | Primary dimension | Typical level | Notes / platform format |
| --- | --- | --- | --- |
| Prerequisite retrieval | D10/D12 | E1–E3 | Gates *readiness*; reuses a prior lesson's item. |
| Definition recall & recognition | D2 | E1 | **Cap at one** pure-recall item per lesson (ASSESSMENT_PATTERNS). |
| Examples & nonexamples | D7 | E1–E3 | "Which of these *is* / *is not* a …, and why?" |
| Short computational drill | D3 | E2 | Fresh inputs, not the worked example's numbers. |
| Multi-step computation | D3 | E2–E3 | `exercise-sequence` grading intermediates. |
| Method selection | D8 | E3 | Problem does **not** name the method — case #5 guard. |
| Representation translation | D4 | E3–E4 | Read a result obtained in one representation in another. |
| Prediction before calculation | D1/D13 | E1–E3 | `committed-prediction`, commit-before-reveal. |
| Interpretation after calculation | D1/D4 | E3 | Read the number/vector back as meaning. |
| Error diagnosis | D13 | E3–E4 | Bundle "which step + why" (ASSESSMENT_PATTERNS). |
| Proof completion | D6 | E6 | *(Profile B)* fill a gap in a supplied argument. |
| Proof construction | D6 | E6 | *(Profile B)* build the argument; `self-check` + model answer (human-scored in the pilot). |
| Counterexample construction | D7 | E4/E6 | Selection in-app; construction in the pilot. |
| Missing-assumption question | D5/D6 | E6 | "Which hypothesis makes this true?" |
| Reverse / construction problem | D3/D7 | E3–E4 | `construct-in-explorer` (build an object meeting a predicate). |
| Unfamiliar transfer | D9 | E4 | **Exactly one** guided transfer in Practice; unaided transfer in the pilot. |
| Mixed cumulative problem | D10 | E5 | Module-level; interleaves prior topics. |
| Timed exam-style problem | D11 | E3–E5 | Mock exam / exam mode (deferred feedback). |
| Open investigation | D14 | E7 | *(Profile C)* enrichment; never on the exam bar. |

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
  method-specific intermediate; ≥1 boundary/degenerate item; **exactly one**
  genuine transfer item; *(Profile B)* ≥1 proof-completion or construction item.
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
2. **Follow-along without selection.** Learners can follow a worked example but no
   item requires them to *select* the method unprompted (D8). *(Case 3, 5.)*
3. **Near-copy practice only.** Every exercise reuses the worked example's shape/
   numbers; no fresh-instance E3+ item exists. *(Case 2, 3.)*
4. **Trapped in the convenient representation.** The lesson stays in \(\mathbb{R}^2\)
   (or another easy special case) while teaching a general concept and never
   returns to the general case (SEMANTIC_PAGE_GRAMMAR §4). *(Case 4.)*
5. **Asserted theorem in a proof profile.** A theorem is stated without the
   required justification for the profile in force (D6, Profile B). *(Case 6.)*
6. **No connection.** The lesson has no meaningful backward or forward link to
   other lessons (D10 / coherence). *(Case 8.)*
7. **Assessment repeats instruction.** The graded items merely re-run the
   interaction used during teaching, measuring E1–E2 and supporting no readiness
   claim. *(Case 10.)*
8. **Core outcome not demonstrated.** A core outcome never reaches "independently
   demonstrated" ([§2](#2-what-must-be-taught-vs-practiced-vs-demonstrated-vs-enriched)).
9. **Vague outcomes.** An outcome is not operational or has no paired evidence
   item ([§1d](#1d-outcomes-each-paired-with-evidence)).
10. **Missing retention hook.** No outcome is scheduled into later delayed/
    interleaved retrieval (D12), for a lesson whose material the course expects to
    persist. *(Contributes to case 9 at module level.)*

### Anti-over-reaction guardrails (the gate must also *not* fire wrongly)

The gate must **not** reject a lesson for any of these — doing so is itself a
failure ([COURSE §8, opposite failures](../mastery-standard.md#8-calibration-cases)):

- lacking a proof, when the profile is A and a short "why" suffices;
- lacking a real-world application that adds no value;
- not exercising a dimension outside its lesson-level scope ([COURSE §4](../mastery-standard.md#4-mastery-dimensions));
- being exploratory/visual where that is the right representation (grammar §5);
- omitting Practice/Summary for a genuine intro chapter.

---

## 6. Acceptance record (Gate 8)

A lesson is accepted when this is true and recorded:

- [ ] Insight Contract linked and `PASS`; primary insight preserved in meaning.
- [ ] Every field in [§1](#1-the-contract-fields) filled; upstream artifacts
      linked, not restated.
- [ ] Every outcome ([§1d](#1d-outcomes-each-paired-with-evidence)) is
      operational and paired with an evidence item at a stated level.
- [ ] Every core outcome reaches **independently demonstrated** in the lesson or
      its module ([§2](#2-what-must-be-taught-vs-practiced-vs-demonstrated-vs-enriched)).
- [ ] Assessment set matches [§3c](#3c-minimum-viable-assessment-set-per-lesson);
      it does **not** repeat the instructional interaction; recall is capped;
      exactly one guided transfer item.
- [ ] Backward bridge + forward edge present; ≥1 cumulative connection (D10).
- [ ] Delayed-retention hook (D12) recorded for the persistent outcomes.
- [ ] Correctness gate passed ([§4](#4-correctness-within-the-contract)).
- [ ] No [rejection condition](#5-rejection-conditions-the-mastery-gate) holds;
      no anti-over-reaction guardrail tripped.
- [ ] Profile-dependent items (D6 proof depth, D11 speed, D14 enrichment) match
      the declared profile — no silent stage inflation.

An accepted lesson feeds the [cumulative module assessment](../mastery-standard.md#9-workflow-integration)
(Gate 9); its must-demonstrate set and retention hooks become that module's
inputs.
