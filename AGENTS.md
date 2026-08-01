# AGENTS.md

Short router for agents working in this repo. It does **not** restate the
standards — it points you to the document that owns each task, and names the
boundaries you must not cross.

Read [docs/README.md](docs/README.md) first: it is the doc map.

## Which doc for which task

| Task | Start here |
| --- | --- |
| Any course/lesson request (plan or build) | [docs/authoring/course-authoring-workflow.md](docs/authoring/course-authoring-workflow.md) — classify the mode, follow its gates |
| Build or change a lesson | [docs/authoring/lesson-design.md](docs/authoring/lesson-design.md) (orchestrator; it routes onward) |
| Make a page read like mathematics | [docs/product/semantic-page-grammar.md](docs/product/semantic-page-grammar.md) |
| Insight Stage 1–2 | [docs/authoring/insight-discovery-gate.md](docs/authoring/insight-discovery-gate.md) |
| Mastery bar / evidence | [docs/authoring/mastery-standard.md](docs/authoring/mastery-standard.md) |
| Change math or a visualization | [docs/engineering/math-correctness.md](docs/engineering/math-correctness.md) + [docs/quality/known-failure-modes.md](docs/quality/known-failure-modes.md) |
| Change a guided scene's motion or labels | the hard gates still run (`e2e/guided-scene-hard-gates.spec.ts`) — [docs/quality/benchmark-lab/README.md](docs/quality/benchmark-lab/README.md). Review packets, MP4 evidence, and BeatSpec migration are **deferred**: [audit § Deferred until product maturity](docs/quality/guided-animation-audit-2026-07.md#deferred-until-product-maturity) |
| Code architecture / contracts | [docs/engineering/architecture.md](docs/engineering/architecture.md) |
| A per-lesson artifact (brief/contract/plan) | under `docs/courses/<course>/lessons/<lesson>/` — never a loose `docs/insight-*.md` |
| Which course a request is about | `docs/courses/<course>/` — **linear-algebra** (built through L11) or **applied-mathematics** (the doc directory; since R5 its *runtime* course id is `calculus`, because "Applied Mathematics" was never a course — it is the `applied-stem` pathway in `src/curriculum/pathways.ts`, and the later spine units become their own courses when their packages have content. Planning artifacts stay under this directory). The spine remains one arc: calculus, series, complex oscillation, Fourier, ODEs and Laplace, and vector calculus through the boundary theorems — 39 lessons in 12 packages; Package A approved (L1–L4, `calculus-foundations`), on `master`, under a narrow formally-approved E2E waiver — see the module ledger §7; its Gate 9 assessment is [built in code](docs/courses/applied-mathematics/modules/calculus-foundations/assessment-plan.md), not administered; Package B (`calculus-technique`) in progress on `master` — L5 `chain-rule` built, merged, and **Gate 8 accepted 2026-08-01** by the repository owner; L6–L8 remain `future`). Mode A always operates on that course's own spine and benchmark |
| Layering / scope / commit rules | `.cursor/rules/` (project-core, lesson-design, math-visualization-correctness, course-authoring, auto-commit) |

## Do not create a new standard doc

**A new top-level document is justified only when it answers a question that no
existing canonical document owns.** Otherwise:

- add a **section** to the owning standard;
- add a **course artifact** under the relevant `docs/courses/.../lessons/<lesson>/`;
- record a decision as an **ADR** under `docs/engineering/decisions/`.

Do **not** introduce a parallel spec that overlaps an existing standard, and do
**not** create loose planning docs at the `docs/` root. If you believe a genuinely
new owner is needed, say so and get agreement first.

## Approval boundaries (stop and ask)

These are defined in the rules and workflow — do not self-authorize:

- **Building or promoting** a `future` spine node — writing its lesson code or
  `future → built` (the built surface is fixed). A uniquely resolved short prompt
  may still run **docs-only Mode B planning** (Gates 3–5) for the next node.
- Beginning **Gate 5 (Lesson Mastery Contract)** without a `Gate result: PASS`
  insight contract — Gates 3–4 are how that `PASS` is produced.
- Writing lesson code before an approved Mode B plan.
- Deviating from a standard, or shipping unverified math/visualization results.

## Claim a package before implementing it (no duplicate builds)

Two agents once implemented the same package in parallel off the same plan,
producing a hard-to-merge collision. Before starting **Mode C implementation** of
a package/slice:

1. **Check it isn't already built or in progress.** Look at the default branch
   (`git log master --oneline | grep -i "<package>"`), every branch and worktree
   (`git branch -a`, `git worktree list`), and the module **package status
   ledger** in the relevant `implementation-package.md`. If a package is already
   `BUILT`/`SHIPPED` or a branch/worktree is implementing it, **do not
   reimplement it** — build on it or coordinate.
2. **One package, one branch/worktree.** Do the work on a single, named branch;
   don't fan the same package out across sessions. Announce the branch you're
   using so a parallel session can see it.
3. **Mark it in-progress in the ledger** as your first implementation commit, so
   the next agent's step 1 finds it.

If step 1 turns up an existing implementation that differs from what you were
about to build, **stop and surface the conflict** rather than merging or
overwriting — which one wins is the user's call.

## Verify

Pick the tier that matches the change — do not run a heavier tier out of caution:

| Tier | When | Command |
| --- | --- | --- |
| Edit-time | inner loop while coding | `npm run typecheck` + `npx vitest run <touched paths>` |
| Narrow-correction commit | single-defect fix, no new surface | `./check.sh --quick` |
| Package commit | new items / capabilities / renderers / persistence | `./check.sh`; add `--e2e` only when touching runner, player, layout, or persistence |
| Package approval / review handoff | before requesting semantic review | `./check.sh --e2e` |

`./check.sh --quick` always runs the permanent grading/conformance suite and
additionally runs any paths you pass; targeted paths never replace it. A
schema-version bump or a new persisted field is always package-commit tier.

Every new **auto-graded** module item must, in the same commit, register a
`describeGradingContract` spec (`src/lessons/__tests__/gradingContract.test.ts`,
with an accepted answer + the adversarial reject battery) and an
`ITEM_ASSESSMENT_META` entry (`src/lessons/assessmentManifest.ts` — evidence
target, `evidenceBasis`, method-selection flag). The conformance kit,
evidence-ceiling, and cue-lint suites then hold the recurring defect classes
(blank-as-zero, incomplete-object credit, related-but-wrong, prompt cueing,
evidence overclaims) so reviews never re-litigate them.

## Model routing

- **Opus**: Mode B plan + grading-semantics contract review, the single
  package-level semantic review, new capability or persistence-schema/migration
  design, anything that changes what "correct" means.
- **Faster model**: mechanical implementation of an approved contract, narrow
  corrections that start from a failing test, doc sync against the module status,
  and test/manifest registration.
- Hand a narrow correction to the faster model WITH the failing test. If no test
  can express the defect, it is a contract amendment — route it to Opus.
