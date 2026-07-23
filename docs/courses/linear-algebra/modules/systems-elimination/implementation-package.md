# Implementation package — Systems & Elimination module

The **smallest ordered set of implementation work** needed to make the built
`systems-elimination` module (L3 systems, L4 elimination, L5 solution-sets) satisfy
its mastery contracts under the declared **P3 override** (course primary P2 +
research-bridge overlay). Rebuilt from the **corrected evidence-integrity audit** of
every named item against its actual capability in
[`src/lessons/capabilities.ts`](../../../../../src/lessons/capabilities.ts).

> **Status update (lesson-owned remediation completed — evidence-integrity pass).** With
> explicit user approval, the lesson-owned Packages B–E were built, **re-audited under the
> strict canonical evidence rules** (committed-MC = E1 recognition; commit-before-reveal ≠
> E3; E3 = fresh production of the *complete* outcome; E4 = unfamiliar transfer;
> `self-check` = unscored E6 surface), and then **hardened** across two follow-up passes
> that closed every *non-scoring* lesson-owned interaction gap. Now built: L3 **produced
> classification with a *typed* count** per system — a free-text `text` step (no
> multiple-choice), accepting normalized spellings such as `none`/`0`, `one`/`1`,
> `infinite`/`infinity`, with no class displayed or named before the response —
> and an **E4 characterization of the *general* boundary** \(v = 2u\) (construct a target
> on each side); a **full two-coordinate** column confirmation (L3); a **produced**
> diagnosis + repair on an **unfamiliar** system and an **E4 degenerate zero-pivot** transfer
> where the learner **chooses an unnamed legal operation** and enters the resulting
> matrix, **predicate-graded** (shared `singleRowOperationBetween`) so a matrix passes iff it
> is reachable by **exactly one** legal operation giving a nonzero \(a_{11}\) — the swap or
> \(R_1\to R_1+k\,R_2\) — rejecting a full RREF/multi-step result, a solution-changing
> matrix, or an unrelated same-solution system (L4); a **complete parametric set that
> predicate-grades a learner-chosen** \(\mathbf{x}_p\) and null direction (both coords each),
> a **produced difference-of-solutions** verification, a **produced** ∅-refusal, and a
> **scored E4** null-direction construction (L5). To support the learner-chosen complete
> vectors and the produced classification/pivot-repair, the `exercise-sequence` capability
> gained **`vector`, predicate-graded `construct`, and `text` step kinds** and a
> **`solves-system`** construct predicate, and `matrix-entry` gained a **`row-equivalent-
> usable-pivot`** predicate (pure, in `capabilities.ts`; UI in `ExercisePanel.tsx`) —
> lesson-interaction infrastructure, not the module runner. The **only** remaining lesson-owned obligations are **scoring** the
> reasoning/proof `self-check` surfaces — which is exactly what **Package F** (human-scoring
> capture) provides. So **Gate 8 stays NOT PASSED for all three lessons** solely on that
> scoring, and **Package F is now the next package**. The **Mode C boundary still sits
> before Package F**: building F onward requires explicit approval per
> [course-authoring-workflow](../../../../authoring/course-authoring-workflow.md) /
> `.cursor/rules/course-authoring.mdc`. The audit below is preserved as the
> **as-found baseline**; the post-remediation section records the new state and the
> [remaining lesson-owned gaps](#remaining-lesson-owned-gaps-precise).

## Corrected evidence audit — what the built items actually are

Runtime facts (from `capabilities.ts`) that drive every level below:

- **`prediction`** — `grade()` returns `{ correct: true }` and stores only
  `{ revealed: true }`. It captures **no answer**: pure reveal/exposure → **E1**, never
  demonstration.
- **`committed-prediction`** — genuine commit-before-reveal, but per
  [mastery-standard §5](../../../../authoring/mastery-standard.md#5-evidence-levels) it
  counts as evidence **only on a fresh (non-lesson) instance**. Same-example ⇒ **E1**.
- **`multiple-choice`** — really graded, but **recognition**; same-example ⇒ **E1**.
- **`vector` / `numeric` / `matrix-entry` / `exercise-sequence`** — really graded
  production; on the worked numbers it is **near-copy ⇒ E2**; only a **fresh** instance
  reaches **E3**.
- **`construct-in-explorer`** — genuinely graded against an `src/math` predicate; a
  real construction, but a supplied `hint` + reused example scaffolds it down.
- **`self-check`** — `correct` mirrors the learner's own `selfMark`; **never machine-
  or human-scored in-app**. It **cannot** supply proof (E6) evidence.

### Per-item verdict

| Lesson | Item | Capability | Honest level | Verdict |
| --- | --- | --- | --- | --- |
| L3 | `sys-count-infinite`, `sys-count-none` | multiple-choice | E1 | recognition on the lesson's own systems |
| L3 | `sys-column-reading`, `sys-invertibility-link`, `sys-generalize-inconsistent` | multiple-choice | E1–E2 | recognition |
| L3 | `sys-solve-unique`, `sys-translate-columns` | vector | E2 | near-copy (worked numbers) |
| L3 | `sys-construct-inconsistent`, `sys-counterexample-uniqueness`, `sys-explain-dependent` | **prediction** | E1 | **reveal-only** (no answer captured) |
| L4 | `elim-predict-fixed-point` | committed-prediction | E1 | commit-before-reveal **but taught instance** |
| L4 | `elim-sequence-forward`, `elim-matrix-after-step` | exercise-sequence / matrix-entry | E2 | near-copy (worked numbers) |
| L4 | `elim-diagnose-illegal` | multiple-choice | E1–E2 | recognition |
| L4 | `elim-construct-inconsistent` | construct-in-explorer | E2 (borderline E3) | graded construction, but hinted + same columns |
| L4 | `elim-explain-invariance` | **self-check** | E1 | **self-marked**, not proof evidence |
| L5 | `sol-difference-homogeneous`, `sol-existence-vs-multiplicity`, `sol-nullity-caveat`, `sol-free-variables-dimension` | multiple-choice | E1–E2 | recognition |
| L5 | `sol-generate-third` | vector | E2 | near-copy (null vector handed over) |
| L5 | `sol-whole-set`, `sol-inconsistent-empty` | **prediction** | E1 | **reveal-only** |

**Headline (as-found baseline, before remediation):** the honest ceiling across all
three lessons was **E2** — no fresh unaided E3, no genuine E4 transfer, no valid E6
proof — so the pre-remediation Gate 8 verdict was **NOT PASSED** (exposure/reproduction
only). The gaps were broader than "proofs + fresh arithmetic": reveal-only Checks,
recognition-only MC, and a self-marked "proof" all needed upgrading. The
[post-remediation state](#post-remediation-state-b-e-built) records how Packages B–E
closed the lesson-owned gaps.

### Enumerated upgrade list (every item, by defect)

- **Reveal-only `prediction` → graded commit-before-reveal / production on a FRESH
  instance:** `sys-construct-inconsistent`, `sys-counterexample-uniqueness`,
  `sys-explain-dependent`, `sol-whole-set`, `sol-inconsistent-empty`.
- **Same-example recognition MC → fresh instance (or replace with production):**
  `sys-count-infinite`, `sys-count-none`, `sys-column-reading`,
  `sys-generalize-inconsistent`, `sys-invertibility-link`, `elim-diagnose-illegal`,
  `sol-difference-homogeneous`, `sol-nullity-caveat`, `sol-existence-vs-multiplicity`,
  `sol-free-variables-dimension`.
- **Near-copy production → add a fresh-instance E3 twin:** `sys-solve-unique`,
  `sys-translate-columns`, `elim-sequence-forward`, `elim-matrix-after-step`,
  `sol-generate-third`.
- **Commit-before-reveal on the taught instance → fresh instance:**
  `elim-predict-fixed-point`.
- **Hinted/same-example construction → de-hint + fresh instance:**
  `elim-construct-inconsistent`.
- **Self-marked "proof" → human-scored proof:** `elim-explain-invariance` (and the
  new L3/L5 proof items).
- **Lesson prose correction (copy, not runtime):** L4 `elimination.ts` "illegal moves"
  section calls "adding a row to itself" a disallowed move; correct it — \(R_i\to
  R_i+R_i=2R_i\) is a legal nonzero scaling; the \(i\neq j\) restriction is only the
  definitional boundary of the *replacement* type (see the L4 insight contract).

<a id="post-remediation-state-b-e-built"></a>
## Post-remediation state (B–E built)

The lesson-owned packages were implemented against the existing capabilities plus one
new **fresh** shared example (`systems-fresh` in `src/lessons/exampleData.ts`, every
number verified in
[`freshExample.test.ts`](../../../../../src/lessons/__tests__/freshExample.test.ts)); each
new item's correct/incorrect grading path is verified in
[`remediationExercises.test.ts`](../../../../../src/lessons/__tests__/remediationExercises.test.ts).
New/changed items and their **honest** level under the strict rules
(see each lesson's mastery-contract §1d):

| Item | Change | Honest level |
| --- | --- | --- |
| `sys-classify-produce-fresh` | exercise-sequence: for each fresh system, PRODUCE a witness (a solution / a *second* solution / the \(0=c\) contradiction value) **then TYPE the solution count** in a free-text `text` step (no multiple-choice; normalized spellings `none`/`0`, `one`/`1`, `infinite`/`infinity`) — no class displayed or named before the response | **E3** ✅ (produce-then-classify, typed) |
| `sys-solve-confirm-fresh` | fresh sequence: solve by rows **+** confirm **both column coordinates** (2nd-pass fix: was one coordinate) | **E3** ✅ |
| `sys-translate-augmented-fresh` | fresh matrix-entry: the whole \([A\mid\mathbf{b}]\) | **E3** ✅ |
| `sys-characterize-parameter-fresh` | exercise-sequence: find the parameter for column dependence, produce the **general** consistency condition for \(\mathbf{b}=(u,v)\), then **construct** an inconsistent target and a consistent nonzero target (each predicate-graded off/on the line) | **E4** ✅ (unfamiliar transfer, general boundary) |
| `sys-classify-fresh` | fresh committed classification (E1 recognition backup) | **E1** (support) |
| `sys-construct-inconsistent` | prediction → **construct-in-explorer**, fresh cols | **E3 construction** (beneath the E4 characterization) |
| `sys-reason-dependent-count` | **self-check**; model now uses a **general nonzero relation** (zero column, zero matrix) | **E6 surface, unscored** → F |
| `sys-counterexample-uniqueness` | committed-prediction (kept) | **E1** (support) |
| `sys-prove-consistency`, `sys-prove-trichotomy` | proof `self-check`s; trichotomy uses a general nonzero null relation | **E6 surface, unscored** → F |
| `sys` determinant-sequencing prose | **corrected (2nd pass)**: elimination is next; determinant is Lesson 7; no "determinant is next" claim | — |
| `elim-sequence-forward-fresh`, `elim-matrix-after-step-fresh` | fresh elimination run | **E3** ✅ |
| `elim-diagnose-repair-fresh` | **rewritten (2nd pass)**: **produced** diagnosis (erroneous coefficient) + **produced** repair on an **unfamiliar** system (no MC identify step) | **E4** ✅ |
| `elim-diagnose-explain-fresh` | **new (2nd pass)** self-check: produced written explanation of the error | **E6 surface, unscored** → F |
| `elim-degenerate-pivot-transfer` | **predicate-graded matrix-entry**: degenerate zero pivot; prompt asks the learner to **choose and apply one legal elementary operation** that creates a usable pivot (**operation not named**) and enter the resulting matrix — graded by `row-equivalent-usable-pivot` (shared `singleRowOperationBetween`): passes iff reachable by **exactly one** legal op giving a nonzero \(a_{11}\) (swap or \(R_1\to R_1+k\,R_2\)); rejects RREF/multi-step, solution-changing, and unrelated same-solution matrices — so the method **selection** is the transfer; routine back-substitution is *not* graded | **E4** ✅ (unfamiliar transfer, method selection) |
| `elim-contradiction-row-fresh` | matrix-entry: run elimination → contradiction row | **E3** ✅ |
| `elim-construct-infinite` | construct-in-explorer, distinct cols + ∞ case | **E3 construction** (beneath the E4 degenerate transfer) |
| `elim-construct-inconsistent` | **removed** — duplicated L3's columns \((1,2),(3,6)\) | — |
| `elim` illegal-moves prose | self-addition legality **corrected** (\(R_i+R_i=2R_i\), legal) | — |
| `sol-generate-third-fresh` | fresh vector production | **E3** ✅ |
| `sol-difference-produce-fresh` | exercise-sequence: produce **both coordinates** of the difference of two solutions, then verify **both** homogeneous rows vanish (maps the difference-of-solutions outcome to produced E3 evidence) | **E3** ✅ |
| `sol-produce-parametric-fresh` | exercise-sequence: **predicate-grades a learner-CHOSEN** particular solution (any valid \(\mathbf{x}_p\), both coords) and **nonzero null direction** (both coords), plus the dimension and a **complete instantiated point** — no coordinate handed over, **no formula shown before commitment** | **E3** ✅ (complete set, learner-chosen) |
| `sol-freevars-dimension-fresh` | fresh sequence: produce #free variables + dimension | **E3** ✅ |
| `sol-construct-second-null-direction` | **new (2nd pass)** construct-in-explorer: build a null vector off the single-difference line on \(A=\mathbf{0}\) | **E4** ✅ (scored construction) |
| `sol-refuse-inconsistent-fresh` | **new (2nd pass)** exercise-sequence: produce the \(0=c\) witness + the count 0 (replaces committed-MC `sol-inconsistent-empty`) | **E3 produced** |
| `sol-justify-inconsistent-refusal` | **new (2nd pass)** self-check: why ∅, not \(\operatorname{Null}(A)\) | **E6 surface, unscored** → F |
| `sol-justify-existence-multiplicity`, `sol-justify-one-direction` | `self-check` produced reasoning | **E6 surface, unscored** → F |
| `sol-inconsistent-empty` | **removed** — committed-MC replaced by the produced forms above | — |
| `sol-prove-null-subspace`, `sol-prove-structure` | proof `self-check`s | **E6 surface, unscored** → F |

**Net Gate 8 effect: NOT PASSED for L3, L4, and L5 — now solely on scoring.** The
follow-up passes closed every *non-scoring* lesson-owned interaction gap: classification is
now **produced with a *typed* count** per system (E3, a free-text step — no multiple-choice —
with no class displayed or named before the response),
the column confirmation checks **both coordinates**, the L3 characterization assesses the
**general** boundary and both L4 diagnosis/degenerate outcomes reach **E4** (the degenerate
one a **learner-chosen unnamed operation, predicate-graded as exactly one legal row
operation on the original**), the
L5 difference-of-solutions is **produced** (E3),
the parametric set is **complete and predicate-grades learner-chosen vectors**, the
inconsistency refusal is **produced**, and the L5 one-difference distinction reaches
**scored E4**. Gate 8 is a **single gate** and still cannot PASS because the reasoning/proof
`self-check` surfaces (dependent-count reasoning; diagnosis explanation;
existence-vs-multiplicity; refusal justification; and the four theorem proofs) are
**unscored** — the self-mark is not credit. That scoring is exactly what **Package F**
provides. `elim-predict-fixed-point` intentionally stays a taught-instance pre-Watch
prediction (a learning event whose justification is owned by the invariance proof, not
evidence). Verified: `tsc --noEmit` clean; `npm run lint` clean; unit tests green (incl. the
strengthened per-field mutation grading tests).

<a id="remaining-lesson-owned-gaps-precise"></a>
### Remaining lesson-owned gaps (precise)

After the second pass, **all non-scoring lesson-owned interaction gaps are closed**. Every
remaining lesson-owned obligation is a **scoring** obligation — a produced reasoning/proof
`self-check` surface whose credit needs the **human-scoring capture in Package F**. These
are exactly why Gate 8 is still NOT PASSED, and **only Package F can resolve them**:

- **L3 — dependent-count reasoning (scored E3):** `sys-reason-dependent-count` is produced
  (general nonzero-relation model, covering a zero column and the zero matrix) but unscored.
- **L3 — proofs (E6):** `sys-prove-consistency`, `sys-prove-trichotomy` are produced but
  unscored.
- **L4 — diagnosis explanation (scored):** `elim-diagnose-explain-fresh` is produced but
  unscored (the diagnosis + repair *actions* already reach E4 via
  `elim-diagnose-repair-fresh`).
- **L4 — invariance proof (E6):** `elim-explain-invariance` is produced but unscored.
- **L5 — existence-vs-multiplicity (scored E3)** and the **inconsistency-refusal
  justification (scored E4)**: `sol-justify-existence-multiplicity`,
  `sol-justify-inconsistent-refusal` are produced but unscored (the produced ∅-witness
  `sol-refuse-inconsistent-fresh` already reaches E3; the one-difference distinction
  already reaches **scored E4** via `sol-construct-second-null-direction`).
- **L5 — proofs (E6):** `sol-prove-null-subspace`, `sol-prove-structure` are produced but
  unscored.

**No missing lesson interactions remain.** The produced classification, full column
confirmation, symbolic-parameter characterization (L3); produced diagnosis + degenerate
transfer (L4); complete parametric set, produced refusal, and scored E4 null-direction
construction (L5) are all built. What is left is human scoring — Package F.

## Ordered implementation package

**Package A is the completed retrospective audit; Packages B, C, D are BUILT and Package
E's surfaces are built (scoring only, → F)**; every non-scoring lesson-owned interaction
gap is closed, so the remaining work begins at **F**.

### Package A — Retrospective mastery audit *(COMPLETE — docs only, this task)*
The corrected Approved Insight Contracts (L3 trichotomy derived without the
determinant; L4 self-addition legality clarified; owner sign-off marked *pending
review*), the three Lesson Mastery Contracts with runtime-checked evidence audits and
corrected **Gate 8 = NOT PASSED** verdicts, the two-ownership-class Gate 9
[assessment plan](assessment-plan.md), and this package. **No code changed.**

### Package B — Fresh, unaided E3 production drills · lesson-owned · D3 · ✅ BUILT
*Closes:* the near-copy gap (rejection #3) for all three lessons; lifts D3 from E2→E3.
*Depends on:* a **second** canonical example (`systems-fresh`) added to
`src/lessons/exampleData.ts` so drills do not reuse `systems-default`. Reuses existing
`vector` / `matrix-entry` / `exercise-sequence` capabilities.
- **Built (E3):** L3 `sys-solve-confirm-fresh` (rows **+** column confirmation),
  `sys-translate-augmented-fresh` (complete \([A\mid\mathbf{b}]\)); L4
  `elim-sequence-forward-fresh`, `elim-matrix-after-step-fresh`; L5
  `sol-generate-third-fresh`, `sol-produce-parametric-fresh` (**produced** set),
  `sol-freevars-dimension-fresh` (**produced** counts). These fresh production drills are
  the genuine E3 evidence the module now relies on.

### Package C — De-inflate the Checks (reveal-only + recognition-only) · lesson-owned · ✅ BUILT
*Closes:* the reveal-only defect (rejection #7) **and** the recognition ceiling for the
classification and inconsistency-refusal outcomes (2nd pass).
- **Built:** the reveal-only `prediction` items became graded commit-before-reveal or
  were replaced by production; **classification is now produced with a *typed* count** at E3
  (`sys-classify-produce-fresh`: free-text count steps, no multiple-choice; the MC
  `sys-classify-fresh`/`sys-count-*` remain E1 backups); the **inconsistency refusal is now
  produced** (`sol-refuse-inconsistent-fresh`
  ∅-witness + `sol-justify-inconsistent-refusal`), replacing the committed-MC
  `sol-inconsistent-empty`; the **difference-of-solutions** outcome is now **produced** at
  E3 (`sol-difference-produce-fresh`: compute the difference, verify both homogeneous rows
  vanish), replacing the recognition-only `sol-difference-homogeneous` (kept as an E1
  backup); the column confirmation now checks **both coordinates**; the dependent-count and
  both L5 distinctions are **produced** reasoning surfaces.
- **Scoring only (→ F):** the produced reasoning surfaces (dependent-count,
  existence-multiplicity, refusal justification) remain unscored `self-check`s.
*Size:* small (content; existing capabilities).

### Package D — Genuine transfer / construction (E4) on fresh instances · lesson-owned · D9/D7 · ✅ BUILT
*Closes:* the in-lesson E4 unfamiliar-transfer evidence (2nd pass).
- **Built (E4 unfamiliar transfer):** L3 `sys-characterize-parameter-fresh` (characterize
  the dependency/consistency boundary on a **symbolic parameter**); L4
  `elim-diagnose-repair-fresh` (**produced** diagnosis + repair on an **unfamiliar**
  system) and `elim-degenerate-pivot-transfer` (**degenerate zero pivot**: the learner
  **chooses an unnamed legal operation** that creates a usable pivot and enters the
  resulting matrix, predicate-graded — the method **selection** is the transfer); L5
  `sol-construct-second-null-direction` (**scored** construction of a null
  vector off the single-difference line on \(A=\mathbf{0}\)).
- **Built (E3 beneath, kept):** `sys-construct-inconsistent`; `elim-contradiction-row-fresh`
  (replacing the removed duplicate `elim-construct-inconsistent`); `elim-construct-infinite`.
- **Note:** the general **ℝⁿ / unfamiliar-operator** transfer stays a legitimate
  *module-owned* abstraction return (structure module / Gate 9), not a lesson-owned gap.
*Size:* small–medium.

### Package E — Proof + reasoning surfaces + prose fix · lesson-owned · D6 (P3) · 🟡 SURFACES BUILT (scoring → F)
*Closes:* the lesson-owned *authoring* half of the P3 proof obligation — the learner now
**constructs** each proof/justification against a model answer + rubric.
- **Built:** proof `self-check` items for every P3 theorem — trichotomy **without the
  determinant, using a general nonzero null relation** \(\alpha\mathbf{a}_1+\beta\mathbf{a}_2=\mathbf{0}\)
  (handling a zero first column and the zero matrix) (L3 `sys-prove-trichotomy`),
  consistency ⇔ column-span (L3 `sys-prove-consistency`), row-op invariance (L4
  `elim-explain-invariance`), solution-set structure both inclusions (L5
  `sol-prove-structure`), null-space closure (L5 `sol-prove-null-subspace`); plus
  **produced reasoning** surfaces (`sys-reason-dependent-count`,
  `elim-diagnose-explain-fresh`, `sol-justify-existence-multiplicity`,
  `sol-justify-one-direction`, `sol-justify-inconsistent-refusal`).
- **Built:** the L4 lesson-prose correction (self-addition legality: \(R_i+R_i=2R_i\) is
  a legal scaling; \(i\ne j\) is only the definitional boundary of *replacement*); and
  (2nd pass) the L3 determinant-sequencing correction (elimination is next, determinant is
  Lesson 7).
- **Still open (→ Package F):** every `self-check` self-marks, so **E6 (and the scored
  E3 reasoning) credit** needs the **human-scored** capture (rubric + reviewer mark).
  This scoring is module-owned infrastructure, not more lesson content.
*Size:* content DONE; the scoring mechanism is folded into F.

> Packages **B, C, D are complete; Package E's surfaces are complete but unscored.** Every
> non-scoring lesson-owned interaction gap is now built. Gate 8 is **NOT PASSED** for all
> three lessons (single gate) **solely because** the Package E reasoning/proof surfaces are
> unscored (human scoring → Package F) — see
> [remaining lesson-owned gaps](#remaining-lesson-owned-gaps-precise). The module's Class-B
> reassessment therefore stays blocked
> ([assessment-plan Class B](assessment-plan.md#class-b--cumulative-reassessment--retention-of-lesson-owned-outcomes-ownership-stays-with-the-lesson)),
> and **Package F is now the next package.**

### Package F — Module assessment surface (infrastructure)
*Closes:* prerequisite for **all** Class-A module-owned outcomes and Class-B module
reassessment (D8/D9/D10/D11/D12/D13), and the sole remaining lesson-owned obligation
(human-scoring the Package E proof/reasoning surfaces).
- A **cumulative / interleaved set runner** across L3–L5.
- An **exam-mode / deferred-feedback** attempt flow (no per-item reveal until submit)
  — new support per [mastery-standard §6.1](../../../../authoring/mastery-standard.md#61-the-assessment-layers).
- **Human-scoring capture** for proofs (shared with E) and a **spacing/scheduler** hook.
- Introduces the **first real persistence** (local, single-user) — supersedes the
  `platform-contracts.md` "no persistence layer" non-goal for the assessment surface.
*Size:* large (new platform capability + UI + state). The keystone.

> **Implementation-ready plan:** the full F1–F4 slice plan (files, data flow / state
> transitions, migration & backward-compat, acceptance criteria, tests, and failure /
> recovery for each slice) lives in **[package-f-plan.md](package-f-plan.md)**. Slices:
> **F1** attempt/set domain model + persistence · **F2** module runner +
> deferred-feedback flow · **F3** human-review & scoring workflow + Gate-8 selector ·
> **F4** scheduler extension point + integration + full verification. Packages **G–I
> and all assessment content stay out of scope**; building any slice is Mode C and
> needs explicit approval.

### Package G — Class-A module item sets (on F) · module-owned
*Closes:* D8, D9, D10, D13, **and the executable P2 applied slice**.
- Author `mod-select-method`, `mod-transfer-classify`, `mod-transfer-solset-fresh`,
  `mod-cumulative-elim-solset`, `mod-error-diagnose`, `mod-proof-hyp`, and the **fresh
  3×3 / rectangular** `mod-p2-applied-3x3` + `mod-p2-applied-rect` (elimination →
  pivots/free variables → complete parametric set, plus an inconsistent variant).
*Size:* medium (content on F).

### Package H — Delayed / spaced retrieval (D12) · module-owned
*Closes:* D12. `mod-spaced-trichotomy`, `mod-spaced-uniqueness`, `mod-spaced-rowops`
scheduled at ~1 week / ~1 month; also wired as L7/L8/L9 prerequisite checks.
*Depends on:* F (scheduler). *Size:* small–medium.

### Package I — Timed mock / exam-mode set (D11 · S3) · module-owned
*Closes:* D11 timed performance; enables the S3 readiness claim. `mod-timed-mock`
(computation + one proof + one classification, time-boxed, deferred feedback).
*Depends on:* F (deferred feedback). *Size:* small (content) once F exists.

### Out of scope for this module (cross-referenced, not built here)
- **General \(\mathbb{R}^n\) null-space / rank–nullity** — owned by the future
  **structure module (L8/L9)** per the L5 contract's
  [deferral](../../lessons/05-solution-sets/mastery-contract.md#1g-correctness--scope).
  Package G's 3×3/rectangular items are a *concrete* P2 slice, **not** general ℝⁿ.
- **ODE/recurrence transfer** (`mod-enrich-ode`) — D14 research-bridge enrichment;
  offered, never on the exam bar.

## Recommended order

1. ✅ **B** (fresh E3 production) — **done**: fresh unaided production exists for the
   computational/procedural outcomes.
2. ✅ **C, D** (de-inflate Checks / transfer + construction) — **done** (2nd pass).
   Classification is now **produced** (E3), the inconsistency refusal is **produced**, the
   column confirmation checks **both coordinates**, and the in-lesson **E4** transfers are
   built (L3 symbolic-parameter characterization; L4 produced diagnosis + degenerate
   zero-pivot swap; L5 scored null-direction construction). The general ℝⁿ transfer stays
   a legitimate module-owned abstraction return (not a lesson-owned gap).
3. 🟡 **E** (proof + reasoning surfaces) — proof/justification *surfaces* built for every
   P3 theorem + the L4 prose fix + the L3 determinant-sequencing fix + the general
   trichotomy/dependent-count relations. **Scoring** (the E6 / scored-E3 credit) is the
   only piece left, deferred into **F**.
4. **F** (assessment surface, incl. the human-scoring capture) — the keystone
   infrastructure; **now the next package**; **required before any lesson-owned
   proof/reasoning outcome can be scored** and before Class-B reassessment.
5. **G, H, I** (Class-A module-owned sets — method selection, cumulative/transfer, the
   ℝⁿ/3×3 P2 slice — spacing, timed) on F — discharge module-owned outcomes and enable
   Class-B reassessment at Gate 9.
6. Run [assessment-plan.md](assessment-plan.md); record real results; create
   `validation.md` (Gate 10); update the
   [benchmark gap summary](../../benchmark-matrix.md#3-course-level-gaps-summary).

Gate 8 for L3/L4/L5 remains **NOT PASSED** only until the produced reasoning/proof
surfaces are **human-scored** (Package F); no missing lesson interactions remain. Only
after real Gate 9 results may any "module mastered / exam-ready / proof-ready" claim be
made (COURSE §6.2).

---

**Approval boundary.** The lesson-owned remediation is complete: Packages B, C, D are
built and Package E's surfaces are built (scoring only). All non-scoring lesson-owned
interaction gaps are closed. **Package F is now the authorized next planning target**, and
its implementation-ready plan is recorded in
[package-f-plan.md](package-f-plan.md) (F1–F4). That plan is **documentation only** —
proceeding to build **F onward** (module-assessment infrastructure, including the
human-scored proof/reasoning capture that is the sole remaining lesson-owned obligation)
is **Mode C** and requires explicit approval before writing that code. Gate 8 stays
**NOT PASSED** until the human-scored obligations are actually scored (F3).
