# Course Authoring Workflow

**The single entry point for any course or lesson authoring request.** Read this
first, classify the request into a mode, then follow that mode's ordered gates.
This document *routes*; it does not restate the standards it points to. Each gate
lives in one canonical document — go there for its details.

> **Why this exists.** The project has many strong standards (insight gate,
> mastery standard, lesson design, correctness, benchmark, page grammar). Without
> a router, an agent given a short prompt like *"build the next lesson"* tends to
> jump straight to code and skip the gates. This file is the map from a request to
> the right sequence, plus the **approval boundaries** where an agent must stop.

The canonical gate sequence and each gate's purpose/input/output/rejection are
defined once in
[authoring/mastery-standard.md §9](mastery-standard.md#9-workflow-integration).
This document is the *practical dispatcher* over that sequence.

---

## Step 0 — Classify the request into a mode

| If the request is about… | Mode | Gates |
| --- | --- | --- |
| The course as a whole — profiles, topics, order, prerequisites, benchmarks, a new course/subject | **A. Course architecture** | 1–2 (+10 for validation) |
| Designing *one* lesson end-to-end **without writing code** — the insight, then the full mastery plan | **B. Pre-implementation lesson planning** | 3–5 |
| Turning an *approved plan* into a working lesson | **C. Implementation** | 6–8 |
| Certifying learning across a module/course after lessons exist | **D. Assessment & validation** | 9–10 |

If a short prompt is ambiguous, resolve it from repository context
([Step 6](#step-6--handling-short-prompts-from-repo-context)) and, if still
ambiguous or if it crosses an approval boundary, **ask** before proceeding.

A request may span modes (e.g. "plan and build solution sets"). Run the modes in
order (B then C), and **stop at the approval boundary between them**
([Step 5](#step-5--approval-boundaries-hard-stops)).

---

## Step 1 — Mode A: Course architecture

Designing or changing course structure, profiles, sequence, prerequisites, or the
benchmark. **First resolve the subject** — Mode A always operates on *that
subject's own* spine and benchmark, never the linear-algebra files by default:

- **Existing subject** (e.g. linear algebra) → use its files under
  `docs/courses/<subject>/` (for LA: [course-spine.md](../courses/linear-algebra/course-spine.md),
  [curriculum-architecture.md](../courses/linear-algebra/curriculum-architecture.md),
  [benchmark-matrix.md](../courses/linear-algebra/benchmark-matrix.md)).
- **New subject** → create the sibling set under `docs/courses/<subject>/`
  (`course-spine.md`, `curriculum-architecture.md`, `benchmark-matrix.md`) with its
  **own** external calibration. The subject-agnostic standards (mastery standard,
  lesson contract, page grammar, workflow) are **reused unchanged** — do not copy
  the linear-algebra particulars into them, and do not point a new course at the
  LA files.

Then read/produce in this order:

1. **Profile + target outcomes** (Gate 1) — declare the subject's
   [core profile](mastery-standard.md#3-course-profiles) (P1/P2/P3, plus an
   optional research-bridge overlay) and which S1–S5 stages the course targets.
   Calibrate against **that subject's** benchmark matrix.
2. **Spine + dependency map** (Gate 2) — update **that subject's** course spine and
   the prerequisite DAG / concept ids in its curriculum-architecture. Platform
   structure (subjects → courses → modules) lives in
   [courses/multi-domain-architecture.md](../courses/multi-domain-architecture.md).

**Output:** updated (or newly created) spine/architecture/benchmark docs for the
resolved subject. **No lesson code.** **Boundary:** do not promote a `future` node
to "build now" here — that is an
[approval boundary](#step-5--approval-boundaries-hard-stops).

---

## Step 2 — Mode B: Pre-implementation lesson planning

Designing one lesson fully, **before any code**. This is the heart of the process.

All Mode B artifacts live **together under the lesson's own directory**,
`docs/courses/<course>/lessons/<lesson>/`, using the fixed filenames below — never
a loose `docs/insight-*.md` at the docs root (see
[docs/README.md](../README.md#course-artifacts)).

1. **Insight Discovery Brief** (Gate 3) — [authoring/insight-discovery-gate.md](insight-discovery-gate.md)
   Stage 1 → `docs/courses/<course>/lessons/<lesson>/insight-brief.md`.
2. **Approved Insight Contract** (Gate 4) — Stage 2 →
   `docs/courses/<course>/lessons/<lesson>/insight.md`, ending in
   `Gate result: PASS`. **A `PASS` is a hard gate**: no planning proceeds without it.
3. **Lesson Mastery Contract** (Gate 5) — fill [authoring/templates/lesson-mastery-contract.md](templates/lesson-mastery-contract.md)
   → `docs/courses/<course>/lessons/<lesson>/mastery-contract.md`. Fixes coverage,
   rigor, outcomes-with-evidence, exercise ecology, cumulative connections,
   assessment, and retention around the insight. Presentation intent follows
   [product/semantic-page-grammar.md](../product/semantic-page-grammar.md).
4. **Lesson plan** — fill [authoring/templates/lesson-plan.md](templates/lesson-plan.md) (Stage 3)
   → `docs/courses/<course>/lessons/<lesson>/lesson-plan.md`, consuming the insight
   contract + mastery contract (do not restate them).

Mode D artifacts are **module-scoped**, not per-lesson: they live under
`docs/courses/<course>/modules/<module>/` (see [Step 4](#step-4--mode-d-assessment--validation)).

**Output:** brief + contract (PASS) + mastery contract + lesson plan, all under the
lesson directory. **No lesson code.** **Boundary:** stop here for approval before
Mode C.

---

## Step 3 — Mode C: Implementation

Turning an approved plan into a working lesson. Requires a completed Mode B.

1. **Author** (Gate 6) — build the typed `LessonDefinition`, guided scene,
   explorer, worked examples, and exercises per
   [authoring/lesson-design.md](lesson-design.md) (block palette, `route`, continuity,
   accessibility) and [product/semantic-page-grammar.md](../product/semantic-page-grammar.md)
   (content-specific headings, orient-before-visual, representation fit). Keep the
   layering in [project-core](../../.cursor/rules/project-core.mdc); math only in
   `src/math`.
2. **Mathematical correctness review** (Gate 7) —
   [engineering/math-correctness.md](../engineering/math-correctness.md), [quality/known-failure-modes.md](../quality/known-failure-modes.md),
   and complete [quality/lesson-correctness-checklist.md](../quality/lesson-correctness-checklist.md).
3. **Lesson acceptance** (Gate 8) — verify against the Lesson Mastery Contract's
   [acceptance record](templates/lesson-mastery-contract.md#6-acceptance-record-gate-8):
   every outcome evidenced, every core outcome independently demonstrated, no
   rejection condition, no anti-over-reaction tripped. Run `npm run lint`,
   `npm run test`, and e2e when touching player/layout/lesson flow.

**Output:** a built, tested, accepted lesson; spine status `future → built`.

---

## Step 4 — Mode D: Assessment & validation

After lessons exist. Do not skip once a module is complete. Both artifacts are
**module-scoped**, under `docs/courses/<course>/modules/<module>/` (module id = the
`curriculum.ts` section id, e.g. `systems-elimination`).

1. **Cumulative module assessment** (Gate 9) — a cumulative, interleaved, spaced
   set per [authoring/mastery-standard.md §6](mastery-standard.md#6-assessment-architecture),
   filling [authoring/templates/module-assessment-plan.md](templates/module-assessment-plan.md)
   → `modules/<module>/assessment-plan.md`. This is where a lesson's **module-owned**
   outcomes and any **module-owned abstraction-return deferrals** are discharged
   with real evidence. Reusable patterns:
   [authoring/assessment-patterns.md](assessment-patterns.md).
2. **Benchmark validation** (Gate 10) — fill
   [authoring/templates/module-validation.md](templates/module-validation.md)
   → `modules/<module>/validation.md` (module scope), then roll modules up into the
   course report; report covered / missing / deferred against the subject
   [benchmark matrix](../courses/linear-algebra/benchmark-matrix.md) and the
   [declared target](../courses/linear-algebra/course-spine.md#0-declared-course-target-gate-1);
   never claim a profile the assessments do not support.
3. **Learner-validation pilot** (post-ship, optional) —
   [authoring/insight-validation-protocol.md](insight-validation-protocol.md).

---

## Step 5 — Approval boundaries (hard stops)

Stop and get explicit user approval before crossing any of these. Do not
self-authorize.

- **Building or promoting a `future` lesson (Mode C).** The built surface is fixed
  (see [project-core](../../.cursor/rules/project-core.mdc) Scope). Writing lesson
  code for, or promoting (`future → built`), a `future` spine node requires an
  explicit user go-ahead. *(Producing a Mode B **plan** for the uniquely resolved
  next node is not promotion — see [Step 6](#step-6--handling-short-prompts-from-repo-context).)*
- **Gate 5 without a `PASS` insight contract.** The **Lesson Mastery Contract
  (Gate 5)** and everything after it require a `Gate result: PASS` insight
  contract. Gates 3–4 (the insight brief and the contract itself) are how that
  `PASS` is *produced*, so **beginning Gate 3 does not require a prior `PASS`** — a
  uniquely resolved short prompt may open Mode B at Gate 3. Do not skip ahead to
  Gate 5 while the insight contract is still unresolved.
- **Planning → implementation.** Never write lesson code (Mode C) from a plan the
  user has not approved. Finish Mode B, present the plan, wait.
- **Changing a standard.** If a request conflicts with a standard, propose the
  standard change and get approval — do not silently deviate (see
  [lesson-design](../../.cursor/rules/lesson-design.mdc) "When in doubt").
- **Mathematical correctness conflict.** Stop and report rather than shipping a
  visually plausible but unverified result (MATH_CORRECTNESS rule).
- **Profile inflation.** Do not claim a profile/stage the course does not assess
  (e.g. "research ready", "proof-ready" without E6 evidence).

---

## Step 6 — Handling short prompts from repo context

Short prompts rely on repository state. Resolve before acting:

| Prompt shape | Resolve via |
| --- | --- |
| "**Plan the next lesson**" | Resolve the next node from the subject's curriculum-architecture next-lesson recommendation + spine status (LA: [§6](../courses/linear-algebra/curriculum-architecture.md)). **If it resolves to exactly one unique next unbuilt spine node, treat the prompt as authorization to run Mode B (planning only) for that node** — **name the node first** ("Planning L6 `matrix-composition`…"), then produce the brief → insight contract → mastery contract → plan. Do **not** write code or promote the node. |
| "**Build the next lesson**" | Same resolution, but *building* crosses the [Mode C boundary](#step-5--approval-boundaries-hard-stops): resolve + name the node, run Mode B if not already planned, then **stop for explicit approval** before implementation. |
| "Plan/build **`<topic>`**" | Map topic → spine node + concept ids; check the lesson directory `docs/courses/<course>/lessons/<lesson>/` for an existing `insight-brief.md` / `insight.md` / `mastery-contract.md` / `lesson-plan.md` and resume from the furthest completed gate. Planning is authorized; building stops at the Mode C boundary. |
| "Fix / improve **`<lesson>`**" | Usually Mode C polish under correctness + design rules; if it changes coverage/assessment, re-open its Lesson Mastery Contract. |
| "Add a **course/subject**" | Mode A; **resolve or create that subject's** spine + benchmark matrix (Step 1); reuse the subject-agnostic standards unchanged. |
| **Ambiguous resolution** | If "the next lesson" does **not** resolve to a unique node (branch point in the DAG, multiple `future` nodes equally ready, or unclear subject), **ask** which node before planning. Otherwise state the assumed mode + gate you are entering. |

**Rule of thumb:** a short prompt authorizes **planning** (Mode B) for a uniquely
resolved node once you name it; it never authorizes **implementation** (Mode C),
which is always a hard stop. Always name the mode and gate you are starting in, so
the user can redirect early.
