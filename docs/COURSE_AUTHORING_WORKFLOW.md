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
[COURSE_MASTERY_STANDARD.md §9](./COURSE_MASTERY_STANDARD.md#9-workflow-integration).
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
benchmark. Read/produce in this order:

1. **Profile + target outcomes** (Gate 1) — declare the
   [course profile(s)](./COURSE_MASTERY_STANDARD.md#3-course-profiles) and which
   S1–S5 stages the course targets. Calibrate against
   [LINEAR_ALGEBRA_BENCHMARK_MATRIX.md](./LINEAR_ALGEBRA_BENCHMARK_MATRIX.md) (or
   write a sibling `<SUBJECT>_BENCHMARK_MATRIX.md` for a new subject).
2. **Spine + dependency map** (Gate 2) — update
   [LINEAR_ALGEBRA_COURSE_SPINE.md](./LINEAR_ALGEBRA_COURSE_SPINE.md) and the
   prerequisite DAG / concept ids in
   [CURRICULUM_ARCHITECTURE.md](./CURRICULUM_ARCHITECTURE.md). Platform structure
   (subjects → courses → modules) lives in
   [MULTI_DOMAIN_CURRICULUM_ARCHITECTURE.md](./MULTI_DOMAIN_CURRICULUM_ARCHITECTURE.md).

**Output:** updated spine/architecture/benchmark docs. **No lesson code.**
**Boundary:** do not promote a `future` node to "build now" here — that is an
[approval boundary](#step-5--approval-boundaries-hard-stops).

---

## Step 2 — Mode B: Pre-implementation lesson planning

Designing one lesson fully, **before any code**. This is the heart of the process.

1. **Insight Discovery Brief** (Gate 3) — [INSIGHT_DISCOVERY_GATE.md](./INSIGHT_DISCOVERY_GATE.md)
   Stage 1 → `docs/insight-brief-<topic>.md`.
2. **Approved Insight Contract** (Gate 4) — Stage 2 → `docs/insights/<topic>.md`,
   ending in `Gate result: PASS`. **A `PASS` is a hard gate**: no planning
   proceeds without it.
3. **Lesson Mastery Contract** (Gate 5) — [LESSON_MASTERY_CONTRACT.md](./LESSON_MASTERY_CONTRACT.md).
   Fixes coverage, rigor, outcomes-with-evidence, exercise ecology, cumulative
   connections, assessment, and retention around the insight. Presentation intent
   follows [SEMANTIC_PAGE_GRAMMAR.md](./SEMANTIC_PAGE_GRAMMAR.md).
4. **Lesson plan** — fill [LESSON_TEMPLATE.md](./LESSON_TEMPLATE.md) (Stage 3),
   consuming the insight contract + mastery contract (do not restate them).

**Output:** brief + contract (PASS) + mastery contract + lesson plan.
**No lesson code.** **Boundary:** stop here for approval before Mode C.

---

## Step 3 — Mode C: Implementation

Turning an approved plan into a working lesson. Requires a completed Mode B.

1. **Author** (Gate 6) — build the typed `LessonDefinition`, guided scene,
   explorer, worked examples, and exercises per
   [LESSON_DESIGN.md](./LESSON_DESIGN.md) (block palette, `route`, continuity,
   accessibility) and [SEMANTIC_PAGE_GRAMMAR.md](./SEMANTIC_PAGE_GRAMMAR.md)
   (content-specific headings, orient-before-visual, representation fit). Keep the
   layering in [project-core](../.cursor/rules/project-core.mdc); math only in
   `src/math`.
2. **Mathematical correctness review** (Gate 7) —
   [MATH_CORRECTNESS.md](./MATH_CORRECTNESS.md), [ERROR_LOG.md](./ERROR_LOG.md),
   and complete [LESSON_CORRECTNESS_CHECKLIST.md](./LESSON_CORRECTNESS_CHECKLIST.md).
3. **Lesson acceptance** (Gate 8) — verify against the Lesson Mastery Contract's
   [acceptance record](./LESSON_MASTERY_CONTRACT.md#6-acceptance-record-gate-8):
   every outcome evidenced, every core outcome independently demonstrated, no
   rejection condition, no anti-over-reaction tripped. Run `npm run lint`,
   `npm run test`, and e2e when touching player/layout/lesson flow.

**Output:** a built, tested, accepted lesson; spine status `future → built`.

---

## Step 4 — Mode D: Assessment & validation

After lessons exist. Do not skip once a module is complete.

1. **Cumulative module assessment** (Gate 9) — a cumulative, interleaved, spaced
   set per [COURSE_MASTERY_STANDARD.md §6](./COURSE_MASTERY_STANDARD.md#6-assessment-architecture).
   Reusable patterns: [ASSESSMENT_PATTERNS.md](./ASSESSMENT_PATTERNS.md).
2. **Course benchmark validation** (Gate 10) — report covered / missing /
   deferred against [the benchmark matrix](./LINEAR_ALGEBRA_BENCHMARK_MATRIX.md);
   never claim a profile the assessments do not support.
3. **Learner-validation pilot** (post-ship, optional) —
   [INSIGHT_VALIDATION_PROTOCOL.md](./INSIGHT_VALIDATION_PROTOCOL.md).

---

## Step 5 — Approval boundaries (hard stops)

Stop and get explicit user approval before crossing any of these. Do not
self-authorize.

- **Reopening a `future` lesson.** The built surface is fixed (see
  [project-core](../.cursor/rules/project-core.mdc) Scope). Building or promoting
  a `future` spine node requires an explicit user go-ahead.
- **Insight contract not `PASS`.** Never begin lesson planning (Gate 5+) without a
  `Gate result: PASS` insight contract — this is out of process.
- **Planning → implementation.** Never write lesson code (Mode C) from a plan the
  user has not approved. Finish Mode B, present the plan, wait.
- **Changing a standard.** If a request conflicts with a standard, propose the
  standard change and get approval — do not silently deviate (see
  [lesson-design](../.cursor/rules/lesson-design.mdc) "When in doubt").
- **Mathematical correctness conflict.** Stop and report rather than shipping a
  visually plausible but unverified result (MATH_CORRECTNESS rule).
- **Profile inflation.** Do not claim a profile/stage the course does not assess
  (e.g. "research ready", "proof-ready" without E6 evidence).

---

## Step 6 — Handling short prompts from repo context

Short prompts rely on repository state. Resolve before acting:

| Prompt shape | Resolve via |
| --- | --- |
| "Build/plan **the next lesson**" | [CURRICULUM_ARCHITECTURE.md §6](./CURRICULUM_ARCHITECTURE.md) next-lesson recommendation + spine status; confirm it is not a still-closed `future` node (approval boundary). |
| "Plan/build **`<topic>`**" | Map topic → spine node + concept ids; check for an existing `docs/insight-brief-<topic>.md` / `docs/insights/<topic>.md` and resume from the furthest completed gate. |
| "Fix / improve **`<lesson>`**" | Usually Mode C polish under correctness + design rules; if it changes coverage/assessment, re-open its Lesson Mastery Contract. |
| "Add a **course/subject**" | Mode A; new benchmark matrix + spine; reuse the subject-agnostic standards unchanged. |
| Ambiguous scope | State the assumed mode + gate you are entering; if it crosses an approval boundary, ask first. |

Always name the mode and the gate you are starting in, so the user can redirect
early.
