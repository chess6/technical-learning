# Lesson Mastery Contract — The Chain Rule: Rates Compose (spine L5)

Gate 5 for **`chain-rule`**, after [insight.md](insight.md) reached `PASS`.
First lesson of Package B (`calculus-technique`).

## 1a. Placement & upstream links
- **Spine:** L5, unit `calculus-technique` (Package B), first lesson of the
  package, immediately following Package A's complete arc.
- **Profile:** P2 primary. **No P3 bar claimed** — the composition-of-limits
  step in C7 is stated conceptually, at the same level of formality L2 uses
  for its own error term, not spelled out with full \(\varepsilon\)-\(\delta\)
  bookkeeping. That is declared here and in the lesson.
- **Insight contract:** [insight.md](insight.md) — `PASS`.
- **Concepts introduced:** `chain-rule`. **Reused:** `derivative`,
  `local-linearity` (L2); `limit`, `continuity` (L1); `matrix-composition`
  (LA L6, cross-course).

## 1b. Role, bridge, need
- **Role:** the first technique lesson, and the one that shows a technique
  can be *derived* from L2's own definition rather than handed down as a new
  rule. Sets the pattern Package B's later lessons (substitution, parts,
  improper integrals) follow: a computational tool, earned.
- **Retrieve:** L2's local-linear model and its error term (C5); L2's
  \(1\times1\)-matrix reading of the derivative (C9); L1's continuity.
- **Bridge from Package A:** Package A closed with a complete arc — a rate,
  its meaning, its total, and the theorem binding them. Package B opens by
  asking the next question that arc leaves open: *the four lessons
  differentiated single functions built from one formula; what happens when
  a function is built by feeding one function's output into another?*
- **Motivating need:** *You already know \(d(x^2)/dx\) and you already know
  \(d(u^3)/du\). What is \(d\bigl((x^2+1)^3\bigr)/dx\), and why isn't the
  answer just "multiply the two rules you know"?*

## 1c. Content to teach
- **Definitions (D2):** composition of functions, \(f\circ g\); the chain
  rule statement \((f\circ g)'(a)=f'(g(a))g'(a)\).
- **Objects:** a polynomial-inside-polynomial composite (main worked example)
  — \(g(x)=x^2+1\) is fresh; its outer function \(f(u)=u^3\) coincides with
  L2/L4's `ex-cubic-inflection`, reused in a new role (composed, not
  displayed alone), honestly a reuse rather than a fresh function, while the
  composite \((x^2+1)^3\) is still a new object; `ex-abs` (L2's corner) reused
  as an **inner** function, a new role for it. A trigonometric-of-polynomial
  composite was planned for the "recognize and differentiate on sight"
  prediction beat but descoped at build time — the guided scene's `predict`
  beat instead withholds \(f'(2)\) until `zoomOuter`, and
  `chain-differentiate-fresh` discharges the recognize-and-differentiate
  outcome on the polynomial composite instead.
- **Procedures (D3):** decompose a composite into outer/inner functions;
  differentiate a composite via the chain rule; verify a chain-rule result by
  an independent direct-expansion computation where one is available.
- **Results (D5):** \((f\circ g)'(a)=f'(g(a))g'(a)\), derived by substituting
  local-linear models (C1–C8); the \(1\times1\)-matrix reading (C10).
  **Explicitly denied:** that "cancel the \(du\)'s" is a proof; that
  \(g'(a)=0\) is a special case requiring separate handling; that
  \(g\) failing to be differentiable at \(a\) always forces \(f\circ g\) to
  fail too (§1c edge cases).
- **Proof depth (D6):** **fully derived on screen** (C1–C8) via substitution
  of local-linear models, with the \(\Delta u=0\) case handled by the
  identity itself (never a division) rather than assumed away. The
  composition-of-limits step (C7) is stated conceptually — **no P3 bar
  claimed**, flagged in §1a.
- **Representations (D4):** the two-linked-zoom picture (visual); the
  substituted-model algebra (symbolic); "feed one approximation's output into
  the other" (verbal); the \(1\times1\)-matrix composition (structural); a
  compounding-conversion-factor reading, e.g. miles/gal \(\times\) gal/hr
  (applied, first-contact only — flagged in the insight as insufficient
  alone, §1d P4).
- **Translations:** magnification factor ↔ derivative value; compound
  magnification ↔ product of two slopes; window collapsing to a point ↔
  \(g'(a)=0\).
- **Edge/degenerate cases (D7):** \(g'(a)=0\) (C12 — falls out directly, no
  special handling); \(g=|x|\) composed as the inner function, where the
  chain rule's hypothesis (both pieces differentiable) turns out to be
  **sufficient, not necessary** — a composite can still be differentiable at
  a point where the inner function is not.
- **Misconceptions (D13):** M1–M5 of
  [insight §Prerequisites](insight.md#prerequisites-limitations-likely-misconceptions).

## 1d. Outcomes with evidence

| Outcome | Dim | Owner | Level | Evidence | Attainment |
| --- | --- | --- | --- | --- | --- |
| Decompose a fresh composite and differentiate it via the chain rule | D3 | lesson | E3 | `chain-differentiate-fresh` (`exercise-sequence`: identify the decomposition (`multiple-choice`) → compute \((f\circ g)'(a)\) (`numeric`)) | planned |
| Predict \((f\circ g)'(a)\) at a point where \(g'(a)=0\), without full computation | D9 | lesson | E3 | `chain-zero-predict` (`numeric`) | planned |
| Identify exactly what fails in "cancel the \(du\)'s" when \(\Delta u=0\) | D13 | lesson | E2 | `chain-du-cancel-fails` (`multiple-choice`, four candidate diagnoses) | planned |
| Verify a chain-rule result by an independent direct-expansion route, and say why agreement counts as evidence | D10 | lesson | E3 | `chain-corroborate` (`exercise-sequence`: chain-rule value (`numeric`) → expanded-and-differentiated value (`numeric`) → why it's evidence (`multiple-choice`)) | planned |
| Compute a compound magnification from two zoom factors | D6 | lesson | E3 | `chain-compound-zoom` (`numeric`) | planned |
| Select the efficient route (direct expansion vs. chain rule) on a fresh composite, unprompted | D8/D9 | lesson | E3 | `chain-select-method` (`exercise-sequence`: efficient route (`multiple-choice`, prompt does not name either route) → the answer (`numeric`)) | planned |
| Reproduce the substitution derivation on a fresh pair — not just apply the rule | D6 | lesson | E4 | `chain-derive-fresh` (`self-check`, human-scored: both local-linear models, the substitution, the \(k(h)=0\) case, and the final division-by-\(h\) step) | planned |
| State what can and cannot be concluded when the inner function has a corner | D7 | lesson | E2 | `chain-corner-not-necessary` (`multiple-choice`) | planned |
| Retain "cancel the \(du\)" is not sufficient justification, under delayed retrieval | D12 | **module** | E3 | `mod-calctech-retain-du-not-proof` (module `calculus-technique`, Gate 9) | **not built** — Gate 9 open, module not yet entered |
| Integrate the chain rule with the \(1\times1\)-matrix reading and LA matrix composition on one mixed item | D10 | **module** | E5 | `mod-calctech-mixed-chain-matrix` (module `calculus-technique`, Gate 9) | **not built** — Gate 9 open, module not yet entered |

**Transfer:** three transfer-tier items. `chain-zero-predict` (predict before
computing — D9) and `chain-select-method` (method selection folded into
transfer — D8+D9, per [insight §11](insight.md#11-transfer-assessment)) are
**E3**: `numeric` and `exercise-sequence` cap there, and both keep a genuine
produced numeric answer as the outcome's substance. `chain-derive-fresh` is
**E4**, human-scored `self-check` — the only item that requires PRODUCING the
substitution argument rather than applying its conclusion, which is what M2
(the lesson's central misconception) actually needs. Recall is capped at two
bare `multiple-choice` checks (`chain-du-cancel-fails`, `chain-corner-not-necessary`).

**Evidence-ceiling preflight (applied before coding, per A2–A4's own
precedent).** Every level above is already recorded at its capability's
ceiling — `multiple-choice`→E2, `numeric`/`exercise-sequence`→E3,
`self-check`→E5 (claimed at E4, one item) — so no reconciliation is
anticipated at build time. If a build-time defect is found (a claim exceeding
its capability, or a step converted to `multiple-choice` that changes an
item's honest level), it is corrected in this table with a dated note,
matching L1–L4's own practice, not silently.

## 1e. Coverage status
Taught: all of §1c. Practiced: every lesson-owned outcome (planned). Not yet
built, so nothing is yet independently demonstrated — this section will be
completed at Gate 8, once the lesson exists.

## 1f. Connections, assessment, retention
- **Cumulative (D10):** L2's error term (C5) reused verbatim in the
  derivation (C1–C8); L2's \(1\times1\)-matrix reading (C9) extended to
  composition (C10); L1's continuity used in C7. The strongest connection of
  any lesson so far to a **cross-course** result: LA `matrix-composition`
  (C10, C13).
- **Assessment:** 5 check/drill, 3 transfer (planned); recall capped at two
  (`chain-du-cancel-fails`, `chain-corner-not-necessary`). Every graded item
  uses a composite distinct from the guided scene's own worked example,
  except `chain-corroborate`, whose entire point is cross-checking the
  lesson's own main example.
- **Retention (D12):** "cancel the \(du\)" is not sufficient justification —
  the claim most likely to erode back into treating the mnemonic as the
  proof.
- **Forward:** L7 `substitution-parts` (this rule read backwards),
  `partial-derivatives-gradient` (C10 promoted to real matrix multiplication
  of Jacobians), `vector-fields-line-integrals` (the same C1–C8 structure,
  parameterizing a path).

## 1g. Correctness & scope
- **Correctness checks:** every displayed derivative, magnification, and
  corroboration value must come from `src/math` (a `chainRule`-style
  composition of the existing derivative/residual helpers, or plain
  composed closed-form derivatives — a Mode C implementation decision, not
  fixed here). Property tests required at build: the chain-rule value agrees
  with a direct-expansion derivative wherever both are computable, to machine
  tolerance; \((f\circ g)'(a)=0\) exactly when \(g'(a)=0\), for a battery of
  fixtures; the corner-composite example (\(g=|x|\)) is checked both ways —
  a case where the composite IS differentiable at 0 despite \(g\) not being,
  and (if included) a case where it is not.
- **Generalization requirement (structural):** none — this lesson's
  machinery does not feed a later lesson's generic engine the way
  `telescoping-cancellation` does. The one forward *conceptual* requirement
  is that C10's \(1\times1\)-matrix framing must be stated in a form that
  literally generalizes (a linear map's matrix), not as a numerical
  coincidence, so `partial-derivatives-gradient` can promote it without
  re-deriving it.
- **Declared unproved step:** within C7's argument for \(E_f(k(h))/h\to0\),
  the *composition-of-limits* half (\(k(h)\to0\) composed with
  \(E_f(k)/k\to0\), giving \(E_f(k(h))/k(h)\to0\)) is stated conceptually, at
  L2's own level of formality, not with full \(\varepsilon\)-\(\delta\)
  bookkeeping. Named as a scoping choice in
  [insight.md's Audit A](insight.md#mathematical-audit-audit-a), not a
  genuine gap — but it must be visible in the lesson as a stated choice, the
  way L1's modulus and L4's uniform continuity are named. The OTHER half of
  C7 (that \(k(h)/h\) stays bounded) is not a scoping choice — it is full
  algebra, from \(g\)'s differentiability, and must not be silently dropped
  the way an earlier draft of C7 dropped it.
- **Scope exclusions:** implicit differentiation and related rates (stated as
  applications, not developed); the multivariable chain rule / Jacobians
  (named as a forward destination only); triple compositions beyond one
  remark that the rule iterates; product and quotient rules (L2's scope, not
  repeated here).
- **Abstraction return:** insight §14; to be evidenced by
  `chain-zero-predict`, which requires predicting the answer at \(g'(a)=0\)
  from C12 directly, with no reference to zooming.

## 6. Acceptance record (Gate 8)

> **Gate 8 is scoped to this lesson's own outcomes.** Per
> [mastery-standard §9](../../../../authoring/mastery-standard.md#9-workflow-integration),
> Gate 8 confirms that every **lesson-owned** core outcome is independently
> demonstrated with real in-lesson evidence, and that module-owned outcomes
> are **carried forward as planned Gate-9 obligations**. The presence of open
> Gate-9 obligations is the normal state of an accepted lesson and does
> **not** block Gate 8. Gate 8 would be blocked only by a *lesson-owned*
> outcome with no real evidencing item, or by accepting a lesson-owned
> outcome on planned module evidence — neither of which this contract does.

**Gate 8: ACCEPTED — 2026-08-01, by the repository owner** (the domain owner,
reviewing the built lesson at `/lesson/chain-rule`). This is the sign-off the
package ledger recorded as outstanding: an acceptance from outside the
implementing/reviewing agent lineage.

- [x] Insight contract linked and `PASS` — [insight.md](insight.md), "Gate
      result: **PASS**".
- [x] All §1 fields filled — done at Gate 5, reconciled at build.
- [x] Outcomes operational, owner-marked, evidence-paired.
- [x] **Every lesson-owned** core outcome independently demonstrated, with
      recognition-level outcomes declared as such (`chain-du-cancel-fails`,
      `chain-corner-not-necessary` — both **E2** by design). Both were
      **rewritten at acceptance** (see "Changes made at Gate 8" below); they
      remain E2 recognition items, now with distractors that are real rival
      diagnoses rather than obviously-wrong foils.
- [x] No lesson-owned outcome accepted on planned module evidence.
- [x] Assessment set matches §1f — **pinned by test**: 2 check + 3 drill +
      3 transfer (`chainRuleGradingContract.test.ts`, "keeps the declared tier
      mix"), matching the `fundamentalTheoremGradingContract.test.ts`
      precedent.
- [x] Module-owned outcomes carried forward as Gate-9 obligations for
      `calculus-technique` *(open by design; not a Gate 8 blocker)*.
- [x] Backward bridges (L1/L2/LA `matrix-composition`) + forward edges
      (L7/`partial-derivatives-gradient`/`vector-fields-line-integrals`)
      recorded — now also as `requires` edges in `src/curriculum/edges.ts`.
- [x] Retention hook recorded.
- [x] Correctness gate passed, including the chain-rule/direct-expansion
      cross-check and the \(g'(a)=0\)/corner-composite fixture battery
      (module-load assertions in `chainRule.ts`).
- [x] The composition-of-limits scoping choice (C7) — **superseded at
      acceptance.** The derivation no longer needs a scoping caveat; see below.
- [x] Grading contract registered for every auto-graded item
      (`chainRuleGradingContract.test.ts`, 40 tests, adversarial reject
      batteries included; `chain-derive-fresh` routed to human scoring with a
      versioned rubric). `ITEM_ASSESSMENT_META` is the module-item (Gate 9)
      manifest and does not cover these lesson-owned items, matching every
      prior lesson's precedent.

### Changes made at Gate 8 (2026-08-01)

Acceptance review surfaced one **mathematical defect** and one **assessment
weakness**. Both were fixed before acceptance; the lesson as accepted is the
fixed one.

1. **The derivation contradicted the lesson's own thesis.** The lesson claims
   throughout — in the subtitle, the observation, the theorem's
   interpretation, and a depth layer asserting "the substitution above never
   forms that ratio at all" — that it *never divides by \(\Delta u\)*. But the
   final step split \(E_f(k(h))/h\) into
   \(\bigl[E_f(k(h))/k(h)\bigr]\cdot\bigl[k(h)/h\bigr]\), which divides by
   \(k(h)\) — i.e. by \(\Delta u\) — and is undefined at exactly the
   \(k(h)=0\) case the lesson makes a virtue of handling. The independent
   review had caught a *different* gap here (differentiability vs continuity);
   this one survived it.

   **Repaired by the standard Carathéodory move**: define
   \(\varepsilon_f(k) = E_f(k)/k\) for \(k \neq 0\) and \(\varepsilon_f(0)=0\).
   Then \(E_f(k) = \varepsilon_f(k)\,k\) for *every* \(k\) (at \(k=0\) both
   sides vanish), and \(\varepsilon_f(k)\to 0=\varepsilon_f(0)\) is precisely
   \(E_f(k)/k \to 0\) restated — i.e. \(\varepsilon_f\) is continuous at zero.
   The error term is then the **product**
   \(\varepsilon_f(k(h))\cdot k(h)/h\), never a quotient by \(k(h)\). The
   lesson now *delivers* the claim it makes rather than asserting it.

2. **C7's scoping caveat is no longer needed and was removed.** It hedged the
   final limit step as "stated at the same level of formality Lesson 2 uses,
   not spelled out with full quantifiers." With \(\varepsilon_f\) continuous
   at zero, the composition \(\varepsilon_f(k(h)) \to 0\) is licensed by
   continuity at the outer point — the exact hazard the naive argument trips
   on — so the step is complete as written. The checklist item's intent
   (nothing silently assumed rigorous) is satisfied more strongly by proving
   it than by flagging it.

3. **Both E2 recognition items had unusable distractors.** In each, the
   correct choice was conspicuously the longest and most technical, and the
   three foils were transparently wrong ("considered inelegant by
   mathematicians", "only works for polynomials", "gives the wrong sign"),
   so the item was answerable by test-taking instinct alone. Rewritten with
   length-balanced choices and rival diagnoses a learner could actually hold —
   including, for `chain-du-cancel-fails`, a distractor that is **true but is
   not the failure** (\(g\)'s continuity is genuinely needed, but it is a
   hypothesis the argument receives, not the step that breaks). The
   `chain-corner-not-necessary` explanation also now gives the sharper fact
   that \(f(|x|)\) is differentiable at \(0\) exactly when \(f'(0)=0\).
   Reject-battery names in the grading contract were updated to match; the
   accepted answer index is unchanged, and all 40 contract tests pass.

4. **Presentation defects, reported by the owner on the page.** The derivation
   cited `C5` and `C9` — row numbers from *these* authoring artifacts, which a
   learner cannot resolve because they name lines in a document they never
   see — and the key takeaway cited "Package B". All replaced with references
   to the *lesson* ("Lesson 2's local-linear model"). A repo-wide guard now
   fails on this whole class (`proseEmphasis.test.ts`, "doc-internal artifact
   vocabulary never reaches learner prose"), proven to bite.

   The derivation itself was one dense paragraph. It is now a section that
   states *what is being repaired and why* in plain terms, followed by an
   eight-line `EquationSequence` — the same structural slot every other worked
   calculation uses. The \(\varepsilon_f\) device is kept, because the
   lesson's thesis depends on it (without it the argument either divides by
   \(\Delta u\) or hand-waves), but it is now introduced in words as *the
   error per unit step* before it appears in symbols. The section title
   "The honest repair" — which never said what was repaired — is now
   "Deriving the rule by substitution".

**Verification at acceptance:** `./check.sh` green (146 files, 2300 tests);
`/lesson/chain-rule` confirmed in-browser to render 40 KaTeX spans in the
repaired section with zero KaTeX errors and no stray `$` or `*`.

**Not independent, and recorded as such:** the agent that made changes 1–3 also
proposed them. The owner's acceptance is of the rendered lesson; the
mathematical argument in change 1 is standard (Carathéodory) and checkable
against any analysis text, which is the intended safeguard against that
non-independence.
