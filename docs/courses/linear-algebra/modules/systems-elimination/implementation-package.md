# Implementation package — Systems & Elimination module

The **smallest ordered set of implementation work** needed to make the built
`systems-elimination` module (L3 systems, L4 elimination, L5 solution-sets) satisfy
its mastery contracts under the declared **P3 override** (course primary P2 +
research-bridge overlay). This is the audit output required when applying the mastery
workflow retrospectively.

> **Planning only — STOP at the approval boundary.** This document identifies and
> orders work. It **does not** implement it. Building any item below (lesson code or
> the assessment system) is **Mode C** and requires explicit approval per
> [course-authoring-workflow](../../../../authoring/course-authoring-workflow.md) /
> `.cursor/rules/course-authoring.mdc`. No lesson or application code was changed by
> this task.

## Audit summary — built vs required (under P3)

| Capability | L3 systems | L4 elimination | L5 solution-sets |
| --- | --- | --- | --- |
| Definitions (D2) | ✅ | ✅ | ✅ |
| Theorems stated (D5) | ✅ | ✅ | ✅ |
| **Proof constructed by learner (D6, P3)** | ❌ presented only | ✅ `elim-explain-invariance` | ❌ presented only |
| Procedure graded on intermediates (D3) | ⚠️ final-answer drills | ✅ sequence + matrix entry | ⚠️ mostly final-answer |
| **Fresh-instance drill (not worked numbers)** | ❌ reuses running system | ❌ reuses running system | ❌ reuses running system |
| Prediction / committed prediction (D1/D13) | ✅ | ✅ committed-prediction | ✅ |
| Error diagnosis (D13) | ⚠️ via explain items | ✅ `elim-diagnose-illegal` | ⚠️ via traps |
| Edge/degenerate case (D7) | ✅ dependent/inconsistent | ✅ contradiction row | ✅ nullity-2, ∅ |
| Method selection (D8) | ❌ module-owned | ❌ module-owned | ❌ module-owned |
| Unfamiliar transfer (D9) | ⚠️ within-topic only | — | ⚠️ within-topic only |
| Cumulative / spaced / timed (D10/D12/D11) | ❌ no surface | ❌ no surface | ❌ no surface |
| Abstraction return to ℝⁿ | n/a | n/a | ⚠️ deferred (owner: structure module) |

**Headline:** the *lessons* are strong on insight, definitions, representations, and
edge cases. The gaps are (1) **learner-constructed proofs** for L3/L5 (P3), (2)
**fresh-instance drills** everywhere (all practice reuses the running numbers), and
(3) an entire **module-level assessment surface** (cumulative, method-selection,
spaced, timed/exam-mode) that does not exist yet. L4 already meets P3.

## Ordered implementation package

Ordered by dependency and leverage: cheap **lesson-owned** fixes first (they unblock
Gate 8 for the three lessons using capabilities that already exist), then the
**module assessment surface** (the keystone that unblocks every module-owned
outcome), then the module item sets that sit on it.

### Package B — Learner proof-construction items (L3, L5) · lesson-owned · P3
*Closes:* L3 & L5 rejection #5/#8 (asserted theorem / proof outcome stuck at
"taught"). *Depends on:* nothing new — reuses the existing `self-check` capability
(`SELF_CHECK_ID`) that L4 already uses.
- L3: two `self-check` items — prove *consistency ⇔ \(\mathbf{b}\in\operatorname{Col}(A)\)* and the *trichotomy* (independence ⇒ unique ∀\(\mathbf{b}\); dependent ⇒ none/∞).
- L5: two `self-check` items — prove *solution-set structure* (both inclusions, using consistency) and *null-space closure*.
- Add each theorem's proof as a graded outcome; keep model answer + rubric.
*Size:* small (content only, existing capability). Highest priority — smallest change,
biggest correctness gain.

### Package C — Fresh-instance procedural drills (L3, L4, L5) · lesson-owned · D3
*Closes:* rejection #3 (near-copy practice) in all three lessons.
- Add a **second** canonical example (distinct numbers) to
  `src/lessons/exampleData.ts` so drills do not reuse `systems-default`.
- L3: fresh row-solve + column-check. L4: fresh forward-elimination sequence
  (grade multiplier + triangular row). L5: fresh generate-third + parametric write.
*Size:* small–medium (one shared example + a few exercises; new regression tests for
the fresh example's math). Do alongside B.

### Package D — Module assessment surface (deferred-feedback + set runner) · infrastructure
*Closes:* prerequisite for **all** module-owned outcomes (D8/D9/D10/D11/D12/D13).
*Depends on:* B/C not required, but this is the larger build.
- A **cumulative/interleaved set runner** that presents mixed items across L3–L5.
- An **exam-mode / deferred-feedback** attempt flow (no per-item reveal until submit)
  — new support per [mastery-standard §6](../../../../authoring/mastery-standard.md#6-assessment-architecture)
  (the current player reveals immediately).
- A **spacing/scheduling** hook so outcomes can resurface after ~1 week / ~1 month.
*Size:* large (new platform capability + UI + state). The keystone; nothing in E–G
can be *demonstrated* without it.

### Package E — Module item set: selection · cumulative · transfer · error-diagnosis
*Closes:* D8, D9, D10, D13 module-owned rows in the
[assessment plan](assessment-plan.md). *Depends on:* D.
- Author `mod-select-method`, `mod-cumulative-elim-solset`, `mod-transfer-classify`,
  `mod-transfer-solset-fresh`, `mod-error-diagnose`, `mod-proof-hyp`.
*Size:* medium (content on top of D).

### Package F — Delayed/spaced retrieval set · D12
*Closes:* D12 for the persistent outcomes (trichotomy, uniqueness-≠-reachability,
row-op legality). *Depends on:* D (scheduling).
- Author `mod-spaced-trichotomy`, `mod-spaced-uniqueness`, `mod-spaced-rowops`; wire
  them as L7/L8/L9 prerequisite checks too.
*Size:* small–medium.

### Package G — Timed mock / exam-mode set · D11 · S3
*Closes:* D11 timed performance; enables the S3 readiness claim. *Depends on:* D
(deferred feedback).
- Author `mod-timed-mock` (computation + one proof + one classification, time-boxed).
*Size:* small (content) once D exists.

### Out of scope for this module (cross-referenced, not built here)
- **Full \(\mathbb{R}^n\) null-space / rank–nullity abstraction return** — owned by
  the future **structure module** (L8 subspaces & rank, L9 rank–nullity), per the L5
  contract's [accountable deferral](../../lessons/05-solution-sets/mastery-contract.md#1g-correctness--scope).
  This module discharges only the fresh-system, free-variable-count level.
- **ODE/recurrence transfer** (`mod-enrich-ode`) is **research-bridge enrichment
  (D14)** — offered, never on the exam bar.

## Recommended sequencing

1. **B + C** (lesson-owned, existing capabilities) → the three lessons reach Gate 8
   acceptance under P3 for their lesson-owned outcomes.
2. **D** (assessment surface) → the keystone infrastructure.
3. **E, F, G** (module sets on top of D) → discharge module-owned outcomes at Gate 9.
4. Run the [assessment plan](assessment-plan.md); record real results; then create
   `validation.md` (Gate 10) and update the
   [benchmark gap summary](../../benchmark-matrix.md#3-course-level-gaps-summary).

Only after real Gate 9 results may any "module mastered / exam-ready / proof-ready"
claim be made (COURSE §6.2).

---

**Approval boundary.** Proceeding to build **B** onward is Mode C. Await explicit
approval before writing lesson or assessment-system code.
