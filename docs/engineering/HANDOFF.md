# Active handoff

Updated 2026-08-10 on `fix/usage-efficiency-protocol`, based on `master` at
`0edbad4`. This file is current-state routing, not project history. The previous
snapshot is archived at
[`docs/archive/handoffs/HANDOFF-2026-08-10-pre-efficiency.md`](../archive/handoffs/HANDOFF-2026-08-10-pre-efficiency.md).

## Current package

The authoritative status is the
[Applied Mathematics package ledger](../courses/applied-mathematics/curriculum-architecture.md#61-package-status-ledger):

- Package A is approved and shipped; its Gate-9 assessment is built, not administered.
- Package B is active. L5 `chain-rule` and L6 `optimization-approximation` are
  built, Gate-8 accepted, and on `master`.
- L7 `substitution-parts` is **BUILT** on `feature/l7-substitution-parts`.
  The Gate-4 audit ran (fresh lineage): 2 blocking findings (product rule
  falsely cited as an entry assumption — no built surface ever stated it, so
  the lesson now DERIVES it from L2's local model; decreasing-order bounds
  convention had no owner — the lesson now defines it), 4 repairs (P2 bar
  misquote, the dropped cyclic-parts case — now taught and graded, endpoint
  overclaim in (a), unowned integral additivity — now introduced at the
  Riemann-sum level), 2 notes. All repaired; PASS recorded in insight.md
  with the full audit record. Lesson + ledger explorer + 15 items + 77
  contract tests + 5-test e2e spec green; full suite 159 files / 2694.
- The `math-expression` capability completed BOTH review halves: 18 math
  findings fixed (`dd65900`) and the rendered-page pass (3 more findings —
  duplicate palette keys, the field-sizing rule silently widening size-less
  fields, and a parse-failure path that LEAKED the solution via the
  explanation — all fixed with pins).
- L8 `improper-integrals`: judged Gate-3 brief written
  (`insight-brief.md`, synthesized from the two draft directions). Gate 4
  not run.
- **Next session: the fresh package reviewer** (ADR-008 §4) — one context,
  adversarial math + rendered page across L7 + the capability, verdict per
  lesson; then merge to `master`; then L8 Gates 4–5 + Mode C completes
  Package B.

Before touching a package, reconcile the ledger with `git status`, `git branch
-a`, and `git worktree list`. Actual repository state wins.

## Active workflow correction

This branch:

- reconciles ADR-008 standing authorization with the canonical rules;
- changes the default from per-lesson parallel cold starts to one package builder
  plus one fresh package reviewer;
- corrects Package B status, L7 Gate-3 mathematics, and M12’s M8 dependency;
- makes pull-request CI a pre-merge full-unit/browser gate with cancellation and
  complete Playwright artifacts;
- adds `npm run context:task`; and
- moves historical handoff/checklist records out of the active route.

The stale remote `feature/l6-optimization-approximation` branch was deleted after its tip was verified as an ancestor of `master`. GitHub branch protection now strictly requires `full-unit` and `e2e`; reviews/restrictions remain unset, and force-push/deletion remain disabled.

## Next bounded command

After this correction is merged, resume with:

```bash
npm run context:task -- --mode B --lesson substitution-parts
```

Then run Gate 4 against the corrected brief. Do not implement L7 from Gate 3.

## Verification

`./check.sh --quick src/tooling/taskContext.test.ts` passed on 2026-08-10: lint completed with pre-existing warnings; typecheck passed; permanent grading/conformance 73 files / 1,699 tests passed; targeted generator 1 file / 4 tests passed. `git diff --check` passed.
