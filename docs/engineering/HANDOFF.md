# Handoff

Two independent work streams landed on `master` on 2026-08-01. Neither is
fully signed off; each has a *different* open obligation. Package status is
not duplicated here — follow the links.

---

## Stream 1 — Package A / L5 `chain-rule` (applied mathematics)

**State.** Package A (`calculus-foundations`) approved by the repository owner
2026-07-31 under a narrow E2E waiver. Three approved items were built,
independently reviewed, re-verified, and merged (`feature/l5-chain-rule`,
fast-forward, branch and worktree since deleted): the Gate 9 assessment for
`calculus-foundations` (13 items, **built, not administered**), L5's Mode B
docs through `Gate result: PASS`, and L5's Mode C lesson code.

**Independent review ran** and reported 16 confirmed findings, all fixed —
most seriously **a real gap in the chain-rule derivation** (C7 claimed
`g` continuous + `E_f(k)/k→0 ⇒ E_f(k(h))/h→0`, but that composition alone
gives only `E_f(k(h))/k(h)→0`; the missing factor `k(h)/h→g'(a)` needs `g`'s
*differentiability*. A counterexample confirmed it). Fixed in `insight.md`
(including Audit A, which had certified the flawed version), `chainRule.ts`,
and `mastery-contract.md`. Details in the commit messages
(`git log`, search "finding #").

**Open:** a domain-owner's sign-off on L5's **Gate 8**. The merge is not that
sign-off, and the independent review — while real — is a different thing.
Gate 9 items remain unadministered.

**References:** module ledger §6–§8
(`docs/courses/applied-mathematics/modules/calculus-foundations/implementation-package.md`)
· `modules/calculus-foundations/assessment-plan.md` ·
`lessons/05-chain-rule/`

---

## Stream 2 — Experience architecture, slice R0–R3

**State.** The first vertical slice of the pedagogical & product-architecture
redesign, merged from `feature/experience-architecture`:

- **R0** — Pedagogical constitution as doctrine amendments (`vision.md` §0,
  extended block palette in `lesson-design.md`, ADR-004/005/006). Docs only.
- **R1** — The experience model: `guidedSceneId`/`explorationId` **optional**
  (the mechanism that had forced every concept through the same media pair);
  evidence-typed `LessonObjective`; three route blocks — `callout`, `proof`,
  `composed` — plus a `blockComponents.tsx` lazy registry. All 19 then-existing
  lessons verified byte-identical, e2e unchanged.
- **R2** — Karatsuba rebuilt as the historical-breakthrough archetype: the
  field's O(n²) belief and its 1960 break are `callout` blocks *in the
  argument*; a `composed` block makes the approved "three evaluations"
  connection concrete; the lesson ends on an open question, not a summary.
- **R3** — `workshop`/`assessment` `UnitItem` kinds over existing module sets
  (zero new items); production route `/set/:setId` (beta-labeled); one
  theorem (`rank-nullity`) retrofitted to a `proof` route block.

**A self-review pass found four more real defects**, all fixed — full write-up
in `docs/quality/lesson-correctness-checklist.md` § "Slice review pass":
`objectives` had shipped with **no consumer** (its validator asserted nothing,
and R1's own acceptance criterion was unmet); ADR-006 claimed an
`ITEM_ASSESSMENT_META` extension that never happened; the `proof` render — R3's
headline — was **asserted nowhere**; and there was no global anchor-uniqueness
check. Both new validators were **proven to bite** (deliberately broken,
observed to fail, reverted), not merely observed to pass.

**Open:**

- [ ] **Independent semantic review of R0–R3.** A *self*-review has run and
      found four real defects; that does not discharge the self-certification
      gap ADR-002 names. This is the same class of obligation as Stream 1's,
      and Stream 1's experience — an independent reviewer catching a genuine
      mathematical gap that self-review had certified as valid — is the
      argument for taking it seriously.
- [ ] Two in-session deviations from the plan text, reasoned through and
      recorded in code comments/ADRs but never separately confirmed:
      `review` as a `UnitItem` kind is **deferred to R6** (no per-module
      scheduler data exists to back it); Karatsuba ends on an
      **open-question section**, not a `handoff` (no built lesson to point at).
- [ ] Recorded, deliberately unfixed: the named `explore`/`explorationId`
      path has no render test; the ToC/layout divergence for unresolvable
      named targets is mirrored from `visual` rather than repaired. Neither is
      triggered by any current lesson.
- [ ] Five **pre-existing** `**bold**`-straddling-math occurrences in
      unrelated lessons (`determinants`, `matrixComposition`, `redBlackTrees`,
      `structureModuleItems`, `subspacesRank`) — see `known-failure-modes.md`.
      Each is its own narrow-correction commit.

**Not started:** R4 (curriculum graph as data), R5 (course split + `/map`),
R6 (mastery derivation), R7+ (content expansion). Per the plan, none should
begin before the review gate above passes.
**Plan:** `/home/thomas/.claude/plans/plan-a-major-pedagogical-linked-pinwheel.md`

---

## Test state

Run live rather than trusting any summary older than the newest commit.

At the merge of the two streams, `./check.sh --e2e` is green apart from the
**two known, documented, waived** failures — `solution-sets` text-clipping
(intermittent, webfont-metric dependent) and `ftc-accumulate-then-measure`
`seek-determinism` (the Package A waiver, ledger §7). Both are recorded in
`docs/quality/known-failure-modes.md` and were reproduced identically against
pre-change baselines by both streams independently.

## Repository state

`master` now contains both streams and has been pushed to `origin`.
`feature/l5-chain-rule` and its worktree are deleted;
`feature/experience-architecture` is merged.

`CLAUDE.md` carries a pre-existing "Session continuation" diff from an earlier
session (origin unknown) — still undecided: commit, keep editing, or discard.
