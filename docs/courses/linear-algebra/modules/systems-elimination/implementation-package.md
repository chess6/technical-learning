# Implementation package — Systems & Elimination module

The **smallest ordered set of implementation work** needed to make the built
`systems-elimination` module (L3 systems, L4 elimination, L5 solution-sets) satisfy
its mastery contracts under the declared **P3 override** (course primary P2 +
research-bridge overlay). Rebuilt from the **corrected evidence-integrity audit** of
every named item against its actual capability in
[`src/lessons/capabilities.ts`](../../../../../src/lessons/capabilities.ts).

> **Status update (lesson-owned remediation implemented).** With explicit user
> approval, the **lesson-owned Packages B, C, D, and E** were built (see
> [§ Post-remediation state](#post-remediation-state-b-e-built)). The **Mode C boundary
> now sits before Package F** (module-assessment infrastructure): building F onward still
> requires explicit approval per
> [course-authoring-workflow](../../../../authoring/course-authoring-workflow.md) /
> `.cursor/rules/course-authoring.mdc`. The audit below is preserved as the
> **as-found baseline**; the post-remediation section records the new state.

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
[`freshExample.test.ts`](../../../../../src/lessons/__tests__/freshExample.test.ts)).
New/changed levels (see each lesson's mastery-contract §1d):

| Item | Change | New level |
| --- | --- | --- |
| `sys-solve-unique-fresh`, `sys-translate-columns-fresh` | **new** fresh vector production | E3 |
| `sys-construct-inconsistent` | prediction → **construct-in-explorer**, fresh cols \((1,2),(3,6)\) | E4 |
| `sys-counterexample-uniqueness`, `sys-explain-dependent` | prediction → **committed-prediction**, fresh | E3 |
| `sys-prove-consistency`, `sys-prove-trichotomy` | **new** `self-check` proof surfaces | E6 surface (credit → F) |
| `elim-sequence-forward-fresh`, `elim-matrix-after-step-fresh` | **new** fresh elimination run | E3 |
| `elim-construct-inconsistent` | **de-hinted** + fresh cols \((1,2),(3,6)\) | E4 |
| `elim` illegal-moves prose | self-addition legality **corrected** (\(R_i+R_i=2R_i\), legal) | — |
| `sol-generate-third-fresh` | **new** fresh vector production | E3 |
| `sol-whole-set`, `sol-inconsistent-empty` | prediction → **committed-prediction**, fresh | E3 |
| `sol-prove-null-subspace`, `sol-prove-structure` | **new** `self-check` proof surfaces | E6 surface (credit → F) |

**Net Gate 8 effect:** L3/L4/L5 now **PASS Gate 8 for their lesson-owned P1/P2
(computational, characterization, generativity) outcomes at E3/E4**. The **P3 proof
obligation (D6) is CONDITIONAL** in all three: genuine learner proof *surfaces* exist,
but `self-check` self-marks, so **E6 credit is blocked on human scoring (Package F)**.
No reveal-only `prediction` or answer-giving hint remains in the module. `elim-predict-
fixed-point` intentionally stays a taught-instance pre-Watch prediction (a learning
event, not evidence). Verified: `npm run lint` clean; 202 unit tests green.

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
*Depends on:* a **second** canonical example (distinct numbers) added to
`src/lessons/exampleData.ts` so drills do not reuse `systems-default`. Reuses existing
`vector` / `matrix-entry` / `exercise-sequence` capabilities.
- L3: fresh row-solve + translate-to-\(A\). L4: fresh forward-elimination run (grade
  multiplier + triangular row). L5: fresh generate-solution + parametric write +
  dimension-from-free-variables. *Upgrades:* the five near-copy items above.
*Size:* small–medium (one shared example + items + regression tests).

### Package C — De-inflate the Checks (reveal-only + recognition-only) · lesson-owned · ✅ BUILT
*Closes:* rejection #7 (graded items re-run instruction / are reveal-only) and the
E1 recognition ceiling.
- Convert the five **reveal-only `prediction`** items to graded `committed-prediction`
  (commit-before-reveal) on **fresh** instances.
- Make `elim-predict-fixed-point` draw a **fresh** system.
- Reissue the same-example recognition MC on fresh instances (or fold into B's
  production items). *Upgrades:* all reveal-only + same-example items enumerated above.
*Size:* small (content; existing capabilities).

### Package D — Genuine transfer / construction (E4) on fresh instances · lesson-owned · D9/D7 · ✅ BUILT (lesson slice)
*Closes:* the missing E4 transfer evidence.
- L3: rebuild "characterize which \(\mathbf{b}\) are inconsistent" as a real graded
  `construct-in-explorer` (currently a reveal-only `prediction`).
- L4: **de-hint** `elim-construct-inconsistent` and set a fresh instance.
- L5: a fresh, graded solution-set description (replacing the reveal-only
  `sol-whole-set`). *Size:* small–medium (existing `construct-in-explorer`; new checks).

### Package E — Proof-construction surfaces + prose fix · lesson-owned · D6 (P3) · 🟡 SURFACES BUILT (scoring → F)
*Closes:* the lesson-owned half of the P3 proof obligation — the learner now
**constructs** each proof against a model answer + rubric.
- **Built:** proof `self-check` items for every P3 theorem — trichotomy without the
  determinant (L3 `sys-prove-trichotomy`), consistency ⇔ column-span (L3
  `sys-prove-consistency`), row-op invariance (L4 `elim-explain-invariance`, pre-existing),
  solution-set structure both inclusions (L5 `sol-prove-structure`), null-space closure
  (L5 `sol-prove-null-subspace`).
- **Built:** the L4 lesson-prose correction (self-addition legality: \(R_i+R_i=2R_i\) is
  a legal scaling; \(i\ne j\) is only the definitional boundary of *replacement*).
- **Still open (→ Package F):** `self-check` self-marks, so **E6 credit** needs the
  **human-scored** capture (rubric + reviewer mark), or routing proofs through the
  [insight-validation-protocol](../../../../authoring/insight-validation-protocol.md)
  pilot. **This scoring is the only remaining blocker on a full P3 Gate 8 pass** and is
  module-owned infrastructure, not more lesson content.
*Size:* content DONE; the scoring mechanism is folded into F.

> Packages **B–E (lesson-owned) are built.** Each lesson now **passes Gate 8 for its
> P1/P2 outcomes at E3/E4**; the **P3 proof line remains conditional** on the human
> scoring in **F**. The module's Class-B reassessment therefore stays blocked until F
> exists ([assessment-plan Class B](assessment-plan.md#class-b--cumulative-reassessment--retention-of-lesson-owned-outcomes-ownership-stays-with-the-lesson)).

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

1. ✅ **B, C, D** (lesson-owned) — reveal-only / recognition-only / near-copy inflation
   removed; fresh E3/E4 evidence now exists. **Done.**
2. 🟡 **E** (proof construction) — proof *surfaces* built for every P3 theorem + the L4
   prose fix. **Human scoring** (the E6 credit) is deferred into **F**.
3. **F** (assessment surface, incl. the human-scoring capture) — the keystone
   infrastructure and the **only remaining blocker on a full P3 Gate 8 pass**.
4. **G, H, I** (Class-A sets, spacing, timed) on F — discharge module-owned outcomes
   and enable Class-B reassessment at Gate 9.
5. Run [assessment-plan.md](assessment-plan.md); record real results; create
   `validation.md` (Gate 10); update the
   [benchmark gap summary](../../benchmark-matrix.md#3-course-level-gaps-summary).

Only after real Gate 9 results may any "module mastered / exam-ready / proof-ready"
claim be made (COURSE §6.2).

---

**Approval boundary.** Lesson-owned **B–E were built with explicit approval.** Proceeding
to build **F onward** (module-assessment infrastructure, including human-scored proof
capture) is Mode C and requires explicit approval before writing that code.
