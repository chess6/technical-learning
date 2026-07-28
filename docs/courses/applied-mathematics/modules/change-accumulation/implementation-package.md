# Implementation package A — Change and accumulation

The **single ordered work list** for the applied-mathematics course's first
package. It is written so that an implementation model can execute it **without
reopening any curriculum decision**: every "what" and "why" is settled in the
Mode A and Mode B artifacts linked below, and this document is the "in what order,
and what counts as done".

> **Status: PLANNED — awaiting approval.** Mode B is complete for all four
> lessons. Per the [course-authoring workflow](../../../../authoring/course-authoring-workflow.md)
> and `.cursor/rules/course-authoring.mdc`, **no lesson code may be written until
> this package is approved.** Approval of this ledger is approval of all four
> lessons as a batch.

## 0. Scope

| Order | Spine | Lesson id | Artifacts |
| --- | --- | --- | --- |
| 1 | L1 | `limits-continuity` | [brief](../../lessons/01-limits-continuity/insight-brief.md) · [insight `PASS`](../../lessons/01-limits-continuity/insight.md) · [contract](../../lessons/01-limits-continuity/mastery-contract.md) · [plan](../../lessons/01-limits-continuity/lesson-plan.md) |
| 2 | L2 | `derivative-local-linearity` | [brief](../../lessons/02-derivative-local-linearity/insight-brief.md) · [insight `PASS`](../../lessons/02-derivative-local-linearity/insight.md) · [contract](../../lessons/02-derivative-local-linearity/mastery-contract.md) · [plan](../../lessons/02-derivative-local-linearity/lesson-plan.md) |
| 3 | L5 | `integral-accumulation` | [brief](../../lessons/03-integral-accumulation/insight-brief.md) · [insight `PASS`](../../lessons/03-integral-accumulation/insight.md) · [contract](../../lessons/03-integral-accumulation/mastery-contract.md) · [plan](../../lessons/03-integral-accumulation/lesson-plan.md) |
| 4 | L6 | `fundamental-theorem` | [brief](../../lessons/04-fundamental-theorem/insight-brief.md) · [insight `PASS`](../../lessons/04-fundamental-theorem/insight.md) · [contract](../../lessons/04-fundamental-theorem/mastery-contract.md) · [plan](../../lessons/04-fundamental-theorem/lesson-plan.md) |

**Why this package first:** it is on the critical path to *every* branch of the
course ([architecture §2.4](../../curriculum-architecture.md#24-critical-path-length)),
nothing can precede it, and its four lessons form a complete arc — a rate, its
meaning, its total, and the theorem binding them — so a learner who stops here has
still learned something whole.

**Order is a hard dependency chain, not a preference.** L2 needs L1's forced
value; L5 needs L1's continuity; L6 needs all three, and consumes L2's error term
and L5's un-shortcut `8/3` **by name**.

## 1. Slices, in order

### A0 — Shared foundations *(no lesson ships)*
1. `src/math/calculus.ts` — pure, Motion-Canvas-free, fully tested:
   difference quotients; shrinking-interval tables; Riemann sums (left/right/mid,
   equal and unequal partitions); running totals; numeric differentiation; the
   telescoping identity as an arithmetic function; the fixtures (`ex-drive`,
   `ex-parabola`, `ex-abs`, `ex-cubic-inflection`, `ex-decay`, `ex-jump`,
   `ex-oscillate`, `ex-blowup`, a constant rate, a non-monotone rate, a
   current trace, a power trace).
2. `courseModel.ts` — the `applied-mathematics` course under the existing
   `mathematics` subject, with units `change` and `accumulation` and four
   `future` nodes. **Promote a node to a `lesson` ref only as that lesson ships.**
3. The `function-plot` explorer family — parameterized from the start
   (fixture, movable point, value band, input window, punctured points,
   secant/tangent overlay, optional \(f'\) panel). Six later lessons reuse it.

> **Do not inline the families.** `function-plot`, `accumulation-strip`, and
> `telescoping-cancellation` each serve five or more lessons across the course.
> A copy-pasted scene here is a debt the Fourier and fields branches pay twice.

### A1 — `limits-continuity`
Creates nothing new beyond `function-plot`'s bands. One guided clip, one explorer,
eight items.

### A2 — `derivative-local-linearity`
Creates `local-linearity-zoom`. **Two clips** — `derivative-local-linearity` and
the placed `derivative-three-names` — the second positioned by a
`{ kind: "visual", sceneId }` route block. Nine items.

### A3 — `integral-accumulation`
Creates `accumulation-strip`. One clip, one explorer, eight items.

### A4 — `fundamental-theorem`
Creates `telescoping-cancellation`. **Two clips** — `ftc-accumulate-then-measure`
and the placed `ftc-telescoping`. One explorer, ten items.

## 2. Review checklist specific to this package

Ordinary gates (`lesson-correctness-checklist.md`, hard gates, grading contracts)
apply unchanged. These four are **package-specific and are the ones most likely to
be lost by an implementer working from habit**:

| # | Check | Owner | Why it matters |
| --- | --- | --- | --- |
| **P1** | **No antiderivative anywhere in `integral-accumulation`** — prose, scene captions, explorer, exercises, depth layers, feedback strings. | A3 | L6's entire value is that the connection is *discovered*. Naming it in L5 spends the course's central payoff. Enforce with a grep over the built lesson, listed in the L5 plan's test list. |
| **P2** | **`telescoping-cancellation` is parameterized over the cancelling pairs**, not hard-coded to interval endpoints, with a test that feeds it a non-interval pairing. | A4 | L27 (Green's theorem) re-runs this exact family with shared interior *edges*. Hard-coding it silently costs the course its capstone. |
| **P3** | **The residual is visible.** Every zoom frame in L2 and every `one-step` frame in L6 renders the error as a labelled nonzero quantity, and the magnified window renders the **real sampled fixture** — never a substituted straight line. | A2, A4 | This is the package's principal known-failure-mode risk: a zoom that fakes straightness teaches that the curve *is* straight, which is misconception M4. |
| **P4** | **The two computations of \(\int_0^2 x^2\) are independent** — L5's summation route must not call any FTC helper, and L6's corroboration must display two separately computed numbers. | A3, A4 | Otherwise the corroboration is circular and the strongest evidence in the package is worthless. |

Also required, from the ordinary standards:

- Every auto-graded item registers a `describeGradingContract` spec **and** an
  `ITEM_ASSESSMENT_META` entry in the same commit (`AGENTS.md`).
- Both `construct` items in L1/L2 carry the adversarial reject battery.
- Reduced-motion frames for all six clips.
- Guided-scene hard gates and chapter-seek coverage for all six clips.
- Route tests for both placed `visual` blocks.

## 3. Verification tier

Package-commit tier per `AGENTS.md`: `./check.sh` on each lesson commit;
`./check.sh --e2e` before requesting the package semantic review. The `--e2e`
addition is required here regardless of the usual trigger list, because this
package introduces a **new course into `courseModel.ts`** and two placed-scene
route blocks.

## 4. What this package does **not** do

- No lesson from any other package. `chain-rule`, `optimization-approximation`,
  `substitution-parts`, and `improper-integrals` are Package C.
- No entry diagnostic and no bridges. Package A assumes the declared entry
  assumptions hold; the diagnostic is a Mode D artifact and the bridges are
  Package B.
- No module assessment. Every `mod-change-*` / `mod-accum-*` item named in the
  contracts is a **Gate 9 obligation, recorded and not built**. Gate 8 therefore
  stays NOT PASSED for all four lessons until Gate 9 runs — as it does for the
  linear-algebra modules, and for the same reason.
- **No platform work.** The gaps in
  [architecture §7](../../curriculum-architecture.md#7-platform-gaps-recorded-not-scheduled)
  are recorded, not scheduled. G1 (a calculus math layer) and G2 (a function-plot
  component) are discharged *as ordinary lesson work* inside slice A0; the rest
  are untouched.

## 5. Package status ledger

Mark in-progress **as the first implementation commit**, per `AGENTS.md`.

| Slice | Status | Branch / worktree | Notes |
| --- | --- | --- | --- |
| A0 shared foundations | NOT STARTED | — | |
| A1 `limits-continuity` | NOT STARTED | — | |
| A2 `derivative-local-linearity` | NOT STARTED | — | |
| A3 `integral-accumulation` | NOT STARTED | — | |
| A4 `fundamental-theorem` | NOT STARTED | — | |

## 6. Acceptance for the package

- [ ] All four lessons built, each meeting its own lesson-plan acceptance checklist.
- [ ] P1–P4 above verified, each by a test rather than by inspection.
- [ ] `./check.sh --e2e` green.
- [ ] Package-level semantic review (Opus) requested and passed.
- [ ] Course spine and architecture updated: four rows `future → built`, the
      status ledger updated, and the next package recommendation re-stated.
- [ ] Gate 9 obligations for units `change` and `accumulation` carried forward as
      an open module-assessment plan, not silently dropped.
