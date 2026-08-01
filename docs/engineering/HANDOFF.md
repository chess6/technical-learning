# Handoff

## Active goal
Package A (`calculus-foundations`) is **approved** (repository owner,
2026-07-31), including a narrow E2E waiver. Three things approved together
were **built, independently reviewed, and re-verified**, then **merged to
`master`** (2026-08-01, fast-forward, `feature/l5-chain-rule` deleted): (1)
the Gate 9 assessment for `calculus-foundations` (13 items, built in code,
not administered); (2) Mode B docs for L5 `chain-rule` through
`Gate result: PASS`; (3) L5's Mode C lesson code. What remains: a
domain-owner's sign-off on L5's Gate 8 — the merge itself is not that
sign-off.

## Scope
In scope: Gate 9 code implementation, L5's four Mode B docs, L5 lesson code,
full verification, and a review pass over the new work. Out of scope: any
other package, the L1–L3 stale-checkbox sweep, and Package B's
`implementation-package.md` (only written once all of Package B's lessons
are planned).

**Model-routing note.** AGENTS.md routes Mode B insight-contract authoring and
new-capability design to Opus. This work proceeded on Sonnet 5 per the user's
explicit instruction after switching the session model; the two insight
documents carry an inline note saying so, rather than silently reading as
Opus-authored.

## Verified state
- Package A's approval record: module ledger §6/§7
  (`docs/courses/applied-mathematics/modules/calculus-foundations/implementation-package.md`)
  — not duplicated here.
- Gate 9 (`calculus-foundations`): 13 items built, `BUILT · NOT ADMINISTERED`.
  See `modules/calculus-foundations/assessment-plan.md`.
- L5 `chain-rule`: insight reached `Gate result: PASS`
  (`lessons/05-chain-rule/insight.md`); lesson code built (guided scene,
  explorer, 8 exercises, courseModel/registry wiring). Gate 8 not yet
  attempted as a formal record — see `mastery-contract.md` §6's obligation
  checklist, still unticked pending a reviewer distinct from this agent
  lineage, matching Package A's own self-certification discipline.
- **Independent review, this session:** a code-reviewer agent reviewed the
  full range (`2e78ae4~1..HEAD`) and reported 16 confirmed findings, ranked.
  All 16 fixed, most severe first:
  - **A real gap in the chain-rule derivation itself** (C7 claimed
    "g continuous + E_f(k)/k→0 ⇒ E_f(k(h))/h→0", but that composition alone
    only gives E_f(k(h))/k(h)→0 — the missing factor, k(h)/h→g'(a), needs
    g's *differentiability*, not just continuity; a concrete counterexample
    confirmed the gap was real). Fixed in `insight.md` (C7 and Audit A, which
    had certified the flawed version as "valid"), `chainRule.ts`'s prose, and
    `mastery-contract.md`. This is exactly the class of error
    self-certification cannot catch — recorded honestly in the Review
    signoff.
  - Two rendering bugs (unbalanced `$` delimiters inverting KaTeX rendering
    in two exercise explanations).
  - Stale router docs (AGENTS.md, curriculum-architecture.md,
    benchmark-matrix.md still said Gate 9 unbuilt / Package B not started —
    exactly the collision AGENTS.md's "claim a package" step exists to
    prevent).
  - A spoiled prediction beat (the guided scene revealed f'(2) a full beat
    before asking the learner to predict it) — fixed by deferring the reveal
    to `zoomOuter`.
  - A false "fresh fixture" claim (f(u)=u³ is L2/L4's `ex-cubic-inflection`
    under a different variable name) — corrected the claim rather than
    changing the worked example and cascading through every hand-derived
    number.
  - A missing item for M2 (the lesson's central misconception — "the chain
    rule is memorized, not derived" — had no item requiring the derivation
    *produced*, only applied). Added `chain-derive-fresh` (self-check,
    human-scored, E4) and reconciled exercise-tier counts across every doc
    and the grading-contract test (now 2 check / 3 drill / 3 transfer / 8
    items total, recall capped at two).
  - A weakened cue-lint inverse guard (checked "any of 17 shared patterns,"
    which an unrelated cue word could satisfy without an item naming its own
    method) — added per-item `requiredPostCommitmentCues` to
    `assessmentManifest.ts`.
  - Several smaller doc-overclaims and a dead `exampleId` reference.
  Full details in commit messages on this branch (search `git log` for
  "independent-review" / "finding #").
- **Full verification, this session, run on `feature/l5-chain-rule` before
  merge, re-run after the review-fix pass:** `./check.sh` — 2241/2241 tests,
  lint and typecheck clean. `./check.sh --e2e` — 200 passed; 5 failures, **all
  pre-existing and unrelated to this branch's changes**: three in
  `benchmark-lab.spec.ts` (zero diff between this branch and the pre-session
  state — confirmed via `git diff`), `ftc-accumulate-then-measure`'s
  `seek-determinism` gate (the exact, already-waived Package A failure — see
  ledger §7), and `solution-sets` (the other known, intermittent failure).
  `chain-rule` itself is clean, including its hard gates, re-verified directly
  after the predict-beat fix. The merge to `master` was a clean fast-forward
  (no new commits on `master` since the branch point), so these results carry
  over unchanged; not re-run again post-merge.
- Manual browser verification (Playwright MCP, dev server): the guided scene
  renders both panels, labels, the connector, tangent lines, and every
  equation correctly across several chapters; the explorer's chain-rule value
  and direct-derivative readouts agree (24/24) on the worked example, read
  "no single slope" + "sufficient, not necessary" on the corner preset, and
  the cancel-du/repair toggle switches correctly. One apparent anomaly
  (stale canvas content when jumping directly to a chapter mid-scene) was
  checked against an already-shipped L2 scene and found to be a systemic
  player characteristic (chapter-jump seeks to segment start, before that
  segment's own beats run), not a defect introduced here.

## Canonical references
- Package ledger and acceptance checklist:
  `docs/courses/applied-mathematics/modules/calculus-foundations/implementation-package.md`
  §6–§8
- Gate 9 assessment plan:
  `docs/courses/applied-mathematics/modules/calculus-foundations/assessment-plan.md`
- L5 Mode B artifacts and Gate 8 obligations:
  `docs/courses/applied-mathematics/lessons/05-chain-rule/`
- Approved plan for this work: `/home/thomas/.claude/plans/velvety-spinning-clarke.md`
- Task routing: `AGENTS.md`

## Branch / worktree
Merged to `master` (2026-08-01, fast-forward from `feature/l5-chain-rule`
at `888c0a0..12d959e`); the branch and its worktree
(`/home/thomas/Dev/technical-learning-l5-chain-rule`) have been deleted. Local
`master` is not yet pushed to `origin` (10 commits ahead, including this
work) — pushing is a separate decision. `CLAUDE.md` still has a pre-existing
"Session continuation" diff from an earlier session (origin unknown) — still
undecided: commit, keep editing, or discard.

**Note for future sessions:** the primary checkout
(`/home/thomas/Dev/technical-learning`) may be on a different branch doing
unrelated work — as of 2026-08-01 it was on `feature/experience-architecture`
(another agent's in-progress work, unrelated to this module). Check
`git branch --show-current` and `git worktree list` before assuming the
primary checkout reflects this module's state; use a scratch worktree for
`master`-only operations rather than disturbing another branch's checkout.

## Next actions
1. Get an independent reviewer or the user to formally accept L5's Gate 8 and
   sign off the insight contract's `PASS` — not self-certifiable from this
   agent lineage (same ADR-002 constraint as Package A's own semantic
   review). One independent review has already run and is reflected in the
   fixes above; a domain-owner's sign-off is the remaining, different thing.
   Merging to `master` was the user's explicit instruction but is not itself
   that sign-off.
2. Decide whether/when to push `master` to `origin`.
3. The Gate 9 items remain unadministered (tracked in the assessment plan,
   not a blocker to merging); Package B's remaining lessons (L6–L8, currently
   `future` stubs in `courseModel.ts`) are the next Mode B work once L5 is
   accepted.

## Test results
See "Verified state" above — this section intentionally does not duplicate
it.
