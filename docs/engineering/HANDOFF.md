# Active handoff

Updated 2026-08-11 on `feature/l7-substitution-parts`. This file is
current-state routing, not project history. The previous
snapshot is archived at
[`docs/archive/handoffs/HANDOFF-2026-08-10-pre-efficiency.md`](../archive/handoffs/HANDOFF-2026-08-10-pre-efficiency.md).

## Current package

The authoritative status is the
[Applied Mathematics package ledger](../courses/applied-mathematics/curriculum-architecture.md#61-package-status-ledger):

- Package A is approved and shipped; its Gate-9 assessment is built, not administered.
- Package B is active. L5 `chain-rule` and L6 `optimization-approximation` are
  built, Gate-8 accepted, and on `master`.
- L7 `substitution-parts` is **BUILT but NOT Gate-8 accepted** on
  `feature/l7-substitution-parts`.
  The Gate-4 audit ran (fresh lineage): 2 blocking findings (product rule
  falsely cited as an entry assumption — no built surface ever stated it, so
  the lesson now DERIVES it from L2's local model; decreasing-order bounds
  convention had no owner — the lesson now defines it), 4 repairs (P2 bar
  misquote, the dropped cyclic-parts case — now taught and graded, endpoint
  overclaim in (a), unowned integral additivity — now introduced at the
  Riemann-sum level), 2 notes. All repaired; PASS recorded in insight.md
  with the full audit record.
- The owner's 2026-08-11 review found blocking grader, evidence, theorem
  provenance/order, contract-sync, and keyboard-accessibility defects. They are
  corrected: acceptance is exact-symbolic (finite probes only diagnose rejects),
  literal `+ C` passes, the ramp attack fails, near/cued drills are E2, the
  missing cyclic objective is restored, and strips are keyboard-operable.
- The `math-expression` capability completed BOTH review halves: 18 math
  findings fixed (`dd65900`) and the rendered-page pass (3 more findings —
  duplicate palette keys, the field-sizing rule silently widening size-less
  fields, and a parse-failure path that LEAKED the solution via the
  explanation — all fixed with pins).
- L8 `improper-integrals`: judged Gate-3 brief plus a Gate-4 draft whose
  audits remain PENDING and verdict is NOT YET PASS. The unauthorized math
  layer, tests, exports, Gaussian exact-value owner, and singular-orientation
  bug were removed together; the raw 8,869-word draft moved to
  `docs/archive/lesson-drafts/`. Do not begin Gate 5 or Mode C.
- **Next:** review the corrected L7 package; L8 may resume only by completing
  Gate-4 audits and recording a real verdict.

Before touching a package, reconcile the ledger with `git status`, `git branch
-a`, and `git worktree list`. Actual repository state wins.

## Next bounded command

Review L7 without reopening planning or L8:

```bash
npm run context:task -- --mode C --lesson substitution-parts
```

## Verification

Focused unit regressions: 7 files / 186 tests passed. L7 Playwright: 6/6
passed. Package-tier `./check.sh` passed: lint (pre-existing warnings only),
typecheck, 159 unit files / 2,705 tests, and 6 transcript tests.
