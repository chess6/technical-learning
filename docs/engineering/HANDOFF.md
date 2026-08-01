# Handoff

## Active goal
Package A (`calculus-foundations`) is **approved** (repository owner,
2026-07-31), including a narrow E2E waiver. Three things approved together
are now **built and verified** on this branch: (1) the Gate 9 assessment for
`calculus-foundations` (specified and built in code, not administered); (2)
Mode B docs for L5 `chain-rule` through `Gate result: PASS`; (3) L5's Mode C
lesson code. What remains: a review pass over this new work, then merging
this branch.

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
  explorer, 7 exercises, courseModel/registry wiring). Gate 8 not yet
  attempted as a formal record — see `mastery-contract.md` §6's obligation
  checklist, still unticked pending a reviewer distinct from this agent
  lineage, matching Package A's own self-certification discipline.
- **Full verification, this session, on `feature/l5-chain-rule`:**
  `./check.sh` — 2239/2239 tests, lint and typecheck clean.
  `./check.sh --e2e` — 201 passed; 4 failures, **all pre-existing and
  unrelated to this branch's changes**: three in `benchmark-lab.spec.ts`
  (zero diff between this branch and the pre-session state in
  `src/benchmark-lab/` or that spec — confirmed via `git diff`) and
  `ftc-accumulate-then-measure`'s `seek-determinism` gate (the exact,
  already-waived Package A failure — see ledger §7). `solution-sets`
  (the other known, intermittent failure) did not trigger this run.
  One real defect was found and fixed during this pass: the `chain-rule`
  scene's `feedThrough.connect`/`zoomInner.reveal`/`zoomOuter.reveal` beats
  were misclassified as `"geometry"` in `sceneBeatIntents.json` when they are
  opacity-only reveals (`"transition"`) — caught by the hard-gates spec,
  fixed, re-verified.
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
`feature/l5-chain-rule`, checked out at
`/home/thomas/Dev/technical-learning-l5-chain-rule`. `master` is at `888c0a0`
(the pre-session state) — every commit from this session lives only on this
branch until reviewed and merged. Per AGENTS.md's package/branch discipline,
continue work here, not on `master`; announce this branch if picking work
back up in a new session. `CLAUDE.md` still has a pre-existing "Session
continuation" diff from an earlier session (origin unknown) — still
undecided: commit, keep editing, or discard.

## Next actions
1. Run a review pass over this branch's new work (Gate 9 code + L5) and fix
   what it finds — the next step in this session.
2. Get an independent reviewer or the user to formally accept L5's Gate 8 —
   not self-certifiable from this agent lineage (same ADR-002 constraint as
   Package A's semantic review).
3. Decide whether/when to merge `feature/l5-chain-rule` into `master`.
4. After that: the Gate 9 items remain unadministered (tracked in the
   assessment plan, not a blocker to merging); Package B's remaining lessons
   (L6–L8, currently `future` stubs in `courseModel.ts`) are the next Mode B
   work once L5 is accepted.

## Test results
See "Verified state" above — this section intentionally does not duplicate
it.
