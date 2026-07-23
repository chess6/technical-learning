# Docs map

This is the map of the documentation tree: **what to read for each task, and
where each kind of document lives.** Start here; do not add a new top-level
standard without an owner (see [The lasting rule](#the-lasting-rule)).

For the *authoring process* (how a course/lesson request flows through gates),
the router is [authoring/course-authoring-workflow.md](authoring/course-authoring-workflow.md).

## Read this for…

| Your task | Read |
| --- | --- |
| Understand why the product exists | [product/vision.md](product/vision.md) |
| Make a page read like mathematics, not a template | [product/semantic-page-grammar.md](product/semantic-page-grammar.md) |
| Visual direction (colors/motion intent; code owns token values) | [product/visual-language.md](product/visual-language.md) |
| Build or change a lesson | [authoring/lesson-design.md](authoring/lesson-design.md) (the authoring orchestrator) |
| Route any course/lesson request to the right gates | [authoring/course-authoring-workflow.md](authoring/course-authoring-workflow.md) |
| Know what "mastery" requires as evidence | [authoring/mastery-standard.md](authoring/mastery-standard.md) |
| Run the Stage 1–2 insight workflow | [authoring/insight-discovery-gate.md](authoring/insight-discovery-gate.md) |
| Design exercises/assessments | [authoring/assessment-patterns.md](authoring/assessment-patterns.md) |
| Hit the animation quality bar | [authoring/animation-quality-bar.md](authoring/animation-quality-bar.md) |
| Plan a lesson (fill-in templates) | [authoring/templates/](authoring/templates/) |
| Work on the linear-algebra course | [courses/linear-algebra/](courses/linear-algebra/) |
| Understand the multi-subject platform model | [courses/multi-domain-architecture.md](courses/multi-domain-architecture.md) |
| Change math or a visualization | [engineering/math-correctness.md](engineering/math-correctness.md) + [quality/known-failure-modes.md](quality/known-failure-modes.md) |
| Understand the code architecture / contracts | [engineering/architecture.md](engineering/architecture.md), [engineering/platform-contracts.md](engineering/platform-contracts.md) |
| Ship a lesson/visualization change | complete [quality/lesson-correctness-checklist.md](quality/lesson-correctness-checklist.md) |
| Understand a past decision | [engineering/decisions/](engineering/decisions/) |
| Find historical milestones/experiments | [archive/](archive/) |

## Tree

```
docs/
  product/       durable "what/why": vision, page grammar, visual language
  authoring/     how to build lessons; standards, gates, templates
  courses/       per-course spine/architecture/benchmark + per-lesson artifacts
  engineering/   architecture, math correctness, decision records (ADRs)
  quality/       correctness checklist + curated known failure modes
  archive/       milestones, experiments, superseded plans (historical)
```

## Where a document belongs

| Type | Examples | Rule |
| --- | --- | --- |
| Canonical standard | vision, mastery, lesson design, math correctness | Stays current; no historical narration |
| Reusable tool | templates, assessment patterns, checklist | Used repeatedly; concise and actionable |
| Course artifact | spine, insight brief, mastery contract, lesson plan | Lives under `courses/<course>/…` (per lesson under `lessons/<lesson>/`) |
| Decision / experiment | Motion Canvas runtime, architecture choice | Preserve rationale as an ADR; don't present as active instruction |
| Historical record | milestone write-ups, old implementation plans | Archive (or delete once its lasting decisions are absorbed) |

## Course artifacts

Per-lesson planning artifacts live under the lesson they belong to, e.g.
`courses/linear-algebra/lessons/05-solution-sets/`:

- `insight-brief.md` — Stage 1 Insight Discovery Brief
- `insight.md` — Stage 2 Approved Insight Contract (must end `Gate result: PASS`)
- `mastery-contract.md` — the per-lesson Lesson Mastery Contract
- `lesson-plan.md` — Stage 3 implementation-ready plan

**Module** (Gate 9–10) artifacts live under the module (= `curriculum.ts` section
id), e.g. `courses/linear-algebra/modules/systems-elimination/`:

- `assessment-plan.md` — Gate 9 cumulative module assessment (discharges
  module-owned outcomes); template [authoring/templates/module-assessment-plan.md](authoring/templates/module-assessment-plan.md)
- `validation.md` — Gate 10 covered/missing/deferred vs the benchmark + declared
  target; template [authoring/templates/module-validation.md](authoring/templates/module-validation.md)

**Never create a new loose `docs/insight-*.md`.** New briefs, contracts, plans go
under `courses/<course>/lessons/<lesson>/`; module assessment/validation go under
`courses/<course>/modules/<module>/`.

## The lasting rule

A new document is justified **only when it answers a question that no existing
canonical document owns.** Otherwise add a section to the owning standard, a
course artifact under the relevant lesson, or an ADR under
`engineering/decisions/` — not another standalone spec.
