# Implementation package — Systems & Elimination module

The **smallest ordered set of implementation work** needed to make the built
`systems-elimination` module (L3 systems, L4 elimination, L5 solution-sets) satisfy
its mastery contracts under the declared **P3 override** (course primary P2 +
research-bridge overlay). Rebuilt from the **corrected evidence-integrity audit** of
every named item against its actual capability in
[`src/lessons/capabilities.ts`](../../../../../src/lessons/capabilities.ts).

> **Status update (lesson-owned remediation implemented, then corrected).** With explicit
> user approval, the lesson-owned Packages B–E were built and then **re-audited under the
> strict canonical evidence rules** (committed-MC = E1 recognition; commit-before-reveal
> ≠ E3; E3 = fresh production of the *complete* outcome; E4 = unfamiliar transfer;
> `self-check` = unscored E6 surface). The corrected result: **each package is complete
> only for the requirements listed as `✅` below**, several lesson-owned outcomes remain
> below their required level, and **Gate 8 is NOT PASSED for all three lessons**. The
> **Mode C boundary still sits before Package F** (module-assessment infrastructure):
> building F onward requires explicit approval per
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
| `sys-solve-confirm-fresh` | **new** fresh sequence: solve by rows **+** confirm by columns | **E3** ✅ |
| `sys-translate-augmented-fresh` | **new** fresh matrix-entry: the whole \([A\mid\mathbf{b}]\) | **E3** ✅ |
| `sys-classify-fresh` | **new** fresh committed classification | **E1** (recognition) |
| `sys-construct-inconsistent` | prediction → **construct-in-explorer**, fresh cols | **E3 construction** (within pattern; not the E4 target) |
| `sys-reason-dependent-count` | committed-prediction → **self-check** (produced reasoning) | **E6 surface, unscored** |
| `sys-counterexample-uniqueness` | committed-prediction (kept) | **E1** (recognition) |
| `sys-prove-consistency`, `sys-prove-trichotomy` | proof `self-check`s; trichotomy now uses a general nonzero null relation | **E6 surface, unscored** |
| `elim-sequence-forward-fresh`, `elim-matrix-after-step-fresh` | fresh elimination run | **E3** ✅ |
| `elim-diagnose-repair-fresh` | **new** fresh diagnosis (MC) + **repair** (numeric) | **E3** repair; identify half E1 |
| `elim-contradiction-row-fresh` | **new** matrix-entry: run elimination → contradiction row | **E3** ✅ (replaces the duplicated construction) |
| `elim-construct-infinite` | **new** construct-in-explorer, distinct cols + ∞ case (keeps the capability) | **E3 construction** (within pattern; not the E4 target) |
| `elim-construct-inconsistent` | **removed** — duplicated L3's columns \((1,2),(3,6)\) | — |
| `elim` illegal-moves prose | self-addition legality **corrected** (\(R_i+R_i=2R_i\), legal) | — |
| `sol-generate-third-fresh` | fresh vector production | **E3** ✅ |
| `sol-produce-parametric-fresh` | committed-MC → **exercise-sequence**: learner **produces** \(\mathbf{x}_p\), a null direction, and an instantiation | **E3** ✅ (replaces the chosen-formula item) |
| `sol-freevars-dimension-fresh` | **new** fresh sequence: produce #free variables + dimension | **E3** ✅ |
| `sol-justify-existence-multiplicity`, `sol-justify-one-direction` | **new** `self-check` produced reasoning | **E6 surface, unscored** |
| `sol-inconsistent-empty` | committed-prediction (kept) | **E1** (recognition) |
| `sol-prove-null-subspace`, `sol-prove-structure` | proof `self-check`s | **E6 surface, unscored** |

**Net Gate 8 effect: NOT PASSED for L3, L4, and L5.** The remediation genuinely lifted a
set of computational/procedural outcomes to **fresh E3 production** (row-solve+confirm,
complete translation, elimination run, contradiction row, generate-a-third, produced
parametric set, produced free-variable/dimension counts) and turned several reveal/choose
items into *produced* reasoning surfaces. But Gate 8 is a **single gate** and cannot PASS
while lesson-owned outcomes remain below their required level: classification stays **E1**,
the inconsistency-refusal stays **E1**, the two "characterization/degenerate construction"
outcomes are genuine **E3** but below their required **E4 unfamiliar-transfer**, and every
reasoning/proof surface is **unscored** (`self-check`). `elim-predict-fixed-point`
intentionally stays a taught-instance pre-Watch prediction (a learning event, not
evidence). Verified: `npm run lint` clean; unit tests green (incl. the new grading tests).

<a id="remaining-lesson-owned-gaps-precise"></a>
### Remaining lesson-owned gaps (precise)

These are **lesson-owned** (they can be closed with in-lesson items or, for scoring,
Package F), and they are exactly why Gate 8 is NOT PASSED:

- **L3 — classify none/one/∞ at E3:** every classification item is a 3-way choice (E1).
  Needs a *produced* classification of a fresh system (e.g. an exercise-sequence that
  makes the learner determine the count from work, not pick it).
- **L3 — characterization at E4:** `sys-construct-inconsistent` is a genuine E3
  construction but within the taught pattern; a genuinely unfamiliar-transfer variant is
  still owed (candidate for the module set, Package G).
- **L3 — dependent-count reasoning scoring:** `sys-reason-dependent-count` is produced
  but unscored (→ F).
- **L4 — diagnosis at E4:** `elim-diagnose-repair-fresh` produces the *repair* (E3) but
  the *explanation* is recognition; a produced diagnosis+explanation at transfer level is
  still owed.
- **L4 — degenerate construction at E4:** `elim-construct-infinite` is E3 within pattern.
- **L5 — inconsistency-refusal at E4:** `sol-inconsistent-empty` is committed-MC (E1);
  needs a produced/constructed form.
- **L5 — one-difference-vs-whole-null-space at E4** and **existence-vs-multiplicity
  scored E3:** now produced reasoning surfaces, but unscored (→ F).
- **All three — proof E6 credit:** every proof `self-check` is an unscored surface;
  human scoring is Package F.

## Ordered implementation package

**Package A is the completed retrospective audit; Packages B–E are now BUILT** (this
task); the remaining buildable work begins at **F**.

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

### Package C — De-inflate the Checks (reveal-only + recognition-only) · lesson-owned · 🟡 PARTIAL
*Closes:* the reveal-only defect (rejection #7). **Does not by itself close the E1
recognition ceiling** — the strict re-audit shows committed-MC is still E1.
- **Built:** the reveal-only `prediction` items became graded commit-before-reveal or
  were replaced by production; `sol-produce-parametric-fresh` replaced the choose-a-formula
  `sol-whole-set`; the dependent-count and both L5 distinctions became **produced**
  `self-check` reasoning surfaces (not chosen).
- **Still open (lesson-owned):** classification (`sys-classify-fresh`,
  `sys-count-*`) and the inconsistency-refusal (`sol-inconsistent-empty`) remain **E1**
  (a committed choice is recognition). Lifting them needs a *produced* form, not a
  re-skinned MC. Retained committed-MC items (`sys-counterexample-uniqueness`) are honest
  E1 support.
*Size:* small (content; existing capabilities).

### Package D — Genuine transfer / construction (E4) on fresh instances · lesson-owned · D9/D7 · 🟡 PARTIAL
*Closes:* part of the missing E4 transfer evidence; **the E4 unfamiliar-transfer bar is
not yet met in-lesson**.
- **Built (E3 construction / production):** L3 `sys-construct-inconsistent`
  (`construct-in-explorer`, fresh cols); L4 `elim-contradiction-row-fresh` (run
  elimination → contradiction row) **replacing** the removed duplicate
  `elim-construct-inconsistent`, plus `elim-construct-infinite` (distinct cols, ∞ case,
  keeps the `construct-in-explorer` capability); L4 `elim-diagnose-repair-fresh` (fresh
  diagnosis + produced repair).
- **Still open (lesson-owned):** each of the above is a genuine construction/production
  but **within the taught pattern** → E3, not the required **E4 unfamiliar transfer**. A
  genuinely unfamiliar-transfer variant is owed (best placed in the module set,
  Package G).
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
  `sol-justify-existence-multiplicity`, `sol-justify-one-direction`).
- **Built:** the L4 lesson-prose correction (self-addition legality: \(R_i+R_i=2R_i\) is
  a legal scaling; \(i\ne j\) is only the definitional boundary of *replacement*).
- **Still open (→ Package F):** every `self-check` self-marks, so **E6 (and the scored
  E3 reasoning) credit** needs the **human-scored** capture (rubric + reviewer mark).
  This scoring is module-owned infrastructure, not more lesson content.
*Size:* content DONE; the scoring mechanism is folded into F.

> Packages **B–E are complete only for the `✅` requirements above.** Gate 8 is **NOT
> PASSED** for all three lessons (single gate; lesson-owned outcomes still below level or
> unscored — see [remaining lesson-owned gaps](#remaining-lesson-owned-gaps-precise)).
> The module's Class-B reassessment therefore stays blocked
> ([assessment-plan Class B](assessment-plan.md#class-b--cumulative-reassessment--retention-of-lesson-owned-outcomes-ownership-stays-with-the-lesson)).

### Package F — Module assessment surface (infrastructure)
*Closes:* prerequisite for **all** Class-A module-owned outcomes and Class-B module
reassessment (D8/D9/D10/D11/D12/D13).
- A **cumulative / interleaved set runner** across L3–L5.
- An **exam-mode / deferred-feedback** attempt flow (no per-item reveal until submit)
  — new support per [mastery-standard §6.1](../../../../authoring/mastery-standard.md#61-the-assessment-layers).
- **Human-scoring capture** for proofs (shared with E) and a **spacing/scheduler** hook.
*Size:* large (new platform capability + UI + state). The keystone.

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

1. ✅ **B** (fresh E3 production) — **done**: fresh unaided production now exists for the
   computational/procedural outcomes.
2. 🟡 **C, D** (de-inflate Checks / construction) — **partially done**. Reveal-only items
   removed and constructions/reasoning are now *produced*, but classification and the
   inconsistency-refusal remain **E1**, and the constructions are E3 within-pattern, not
   the required **E4 unfamiliar transfer**. The remaining lesson-owned slices are listed
   in [remaining lesson-owned gaps](#remaining-lesson-owned-gaps-precise); the genuinely
   unfamiliar E4 transfer is best authored with the module set (**G**).
3. 🟡 **E** (proof + reasoning surfaces) — proof/justification *surfaces* built for every
   P3 theorem + the L4 prose fix + the corrected general trichotomy proof. **Scoring**
   (the E6 / scored-E3 credit) is deferred into **F**.
4. **F** (assessment surface, incl. the human-scoring capture) — the keystone
   infrastructure; **required before any lesson-owned proof/reasoning outcome can be
   scored** and before Class-B reassessment.
5. **G, H, I** (Class-A sets — including the unfamiliar E4 transfer variants — spacing,
   timed) on F — discharge module-owned outcomes and enable Class-B reassessment at Gate 9.
6. Run [assessment-plan.md](assessment-plan.md); record real results; create
   `validation.md` (Gate 10); update the
   [benchmark gap summary](../../benchmark-matrix.md#3-course-level-gaps-summary).

Gate 8 for L3/L4/L5 remains **NOT PASSED** until the enumerated lesson-owned gaps are
closed (some in-lesson, scoring via F). Only after real Gate 9 results may any "module
mastered / exam-ready / proof-ready" claim be made (COURSE §6.2).

---

**Approval boundary.** The lesson-owned remediation (B–E, to the extent implemented
above) was built with explicit approval. Proceeding to build **F onward**
(module-assessment infrastructure, including human-scored proof capture) is Mode C and
requires explicit approval before writing that code.
