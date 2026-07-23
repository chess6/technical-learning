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
| Code architecture / contracts | [docs/engineering/architecture.md](docs/engineering/architecture.md) |
| A per-lesson artifact (brief/contract/plan) | under `docs/courses/<course>/lessons/<lesson>/` — never a loose `docs/insight-*.md` |
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

## Verify

After meaningful changes: `npm run lint`, `npm run test`, and `npm run test:e2e`
when touching player/layout/lesson flow.
