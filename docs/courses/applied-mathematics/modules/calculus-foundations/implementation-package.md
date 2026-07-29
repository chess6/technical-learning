# Implementation package A — `calculus-foundations`

The **single ordered work list** for the applied-mathematics course's first
package, and the module artifact for the `calculus-foundations` unit. Written so
that an implementation model can execute it **without reopening any curriculum
decision**: every "what" and "why" is settled in the Mode A and Mode B artifacts
linked below.

> **Status: PLANNED — awaiting approval.** Mode B is complete for all four
> lessons. Per the [course-authoring workflow](../../../../authoring/course-authoring-workflow.md)
> and `.cursor/rules/course-authoring.mdc`, **no lesson code may be written until
> this package is approved.** Approval of this ledger approves all four lessons
> as one batch.

**One unit = one module directory = one package.** This directory's name is the
planned `courseModel.ts` unit id, `calculus-foundations`, and the package's four
lessons are exactly that unit's four lessons. Shipping Package A completes the
unit rather than leaving a half-built section in the sidebar.

## 0. Scope

| Order | Spine | Lesson id | Artifacts |
| --- | --- | --- | --- |
| 1 | L1 | `limits-continuity` | [brief](../../lessons/01-limits-continuity/insight-brief.md) · [insight `PASS`](../../lessons/01-limits-continuity/insight.md) · [contract](../../lessons/01-limits-continuity/mastery-contract.md) · [plan](../../lessons/01-limits-continuity/lesson-plan.md) |
| 2 | L2 | `derivative-local-linearity` | [brief](../../lessons/02-derivative-local-linearity/insight-brief.md) · [insight `PASS`](../../lessons/02-derivative-local-linearity/insight.md) · [contract](../../lessons/02-derivative-local-linearity/mastery-contract.md) · [plan](../../lessons/02-derivative-local-linearity/lesson-plan.md) |
| 3 | L3 | `integral-accumulation` | [brief](../../lessons/03-integral-accumulation/insight-brief.md) · [insight `PASS`](../../lessons/03-integral-accumulation/insight.md) · [contract](../../lessons/03-integral-accumulation/mastery-contract.md) · [plan](../../lessons/03-integral-accumulation/lesson-plan.md) |
| 4 | L4 | `fundamental-theorem` | [brief](../../lessons/04-fundamental-theorem/insight-brief.md) · [insight `PASS`](../../lessons/04-fundamental-theorem/insight.md) · [contract](../../lessons/04-fundamental-theorem/mastery-contract.md) · [plan](../../lessons/04-fundamental-theorem/lesson-plan.md) |

**Why first:** on the critical path to *every* branch
([architecture §2.4](../../curriculum-architecture.md#24-critical-path-lengths)),
nothing can precede it, and the four lessons form a complete arc — a rate, its
meaning, its total, and the theorem binding them. It also delivers **Theme 1 in
one dimension**, which Packages I–K generalize three times.

**Order is a hard dependency chain.** L2 needs L1's forced value; L3 needs L1's
continuity *and its modulus*; L4 needs all three, and consumes L2's error term
and L3's un-shortcut \(8/3\) **by name**.

## 1. Slices, in order

### A0 — Shared foundations *(no lesson ships)*

1. **`src/math/calculus.ts`** — pure, Motion-Canvas-free, fully tested:
   difference quotients; shrinking-interval tables; Riemann sums (left/right/mid,
   equal and unequal partitions); running totals; numeric differentiation; the
   telescoping identity as an arithmetic function; moduli of continuity for the
   fixtures that declare one; and the fixtures — `ex-drive`, `ex-parabola`,
   `ex-abs`, `ex-cubic-inflection`, `ex-decay`, `ex-jump`, `ex-oscillate`,
   `ex-blowup`, **`ex-hidden-spike`**, a constant rate, a non-monotone rate, a
   current trace, a power trace.
2. **`courseModel.ts`** — the `applied-mathematics` course under the existing
   `mathematics` subject, with unit `calculus-foundations` and four `future`
   nodes. Promote a node to a `lesson` ref only as that lesson ships.
3. **The `function-plot` explorer family** — parameterized from the start
   (fixture, movable point, tolerance band, input window, punctured points,
   secant/tangent overlay, optional \(f'\) panel, **sampling grid overlay with a
   modulus band**). Seven later lessons reuse it.

> **Do not inline the families.** `function-plot`, `accumulation-strip`, and
> `telescoping-cancellation` each serve five or more lessons across the course. A
> copy-pasted scene here is a debt the Fourier and fields branches pay twice.

### A1 — `limits-continuity`
Creates `function-plot`. One guided clip, one explorer, **ten items**.

### A2 — `derivative-local-linearity`
Creates `local-linearity-zoom`. **Two clips** — `derivative-local-linearity` and
the placed `derivative-three-names`, positioned by a
`{ kind: "visual", sceneId }` route block. Nine items.

### A3 — `integral-accumulation`
Creates `accumulation-strip`. One clip, one explorer, eight items.

### A4 — `fundamental-theorem`
Creates `telescoping-cancellation`. **Two clips** — `ftc-accumulate-then-measure`
and the placed `ftc-telescoping`. One explorer, ten items.

## 2. Package-specific review checks

Ordinary gates apply unchanged. These five are **package-specific, and are the
ones most likely to be lost by an implementer working from habit**:

| # | Check | Slice | Why it matters |
| --- | --- | --- | --- |
| **P1** | **No antiderivative anywhere in `integral-accumulation`** — prose, captions, explorer, exercises, layers, feedback strings. | A3 | L4's value is that the connection is *discovered*. Naming it in L3 spends the course's central payoff. Enforce with a grep over the built lesson. |
| **P2** | **`telescoping-cancellation` is parameterized over the cancelling pairs**, not hard-coded to interval endpoints, with a test that feeds it a non-interval pairing. | A4 | Packages I–K re-run this family with shared interior **edges** (L34) and **faces** (L36, L37). Hard-coding it costs the course Theme 1's capstone. |
| **P3** | **The residual is visible.** Every zoom frame in L2 and every `one-step` frame in L4 renders the error as a labelled nonzero quantity, and the magnified window renders the **real sampled fixture**, never a substituted straight line. | A2, A4 | The package's principal known-failure-mode risk: a zoom that fakes straightness teaches that the curve *is* straight (L2's M4). |
| **P4** | **The two computations of \(\int_0^2 x^2\) are independent** — L3's summation route must not call any FTC helper, and L4's corroboration must display two separately computed numbers. | A3, A4 | Otherwise the corroboration is circular and the strongest evidence in the package is worthless. |
| **P5** | **Continuity is not oversold.** L1 must ship the `local-only` and `modulus` beats and the `ex-hidden-spike` fixture; L4 must name the modulus at its `refine` beat. | A1, A4 | Continuity does **not** mean "nothing hides between samples" — it fixes no window width. Dropping this content re-introduces a false claim *and* leaves L4's uniformity step hand-waving. |

Also required, from the ordinary standards:

- Every auto-graded item registers a `describeGradingContract` spec **and** an
  `ITEM_ASSESSMENT_META` entry in the same commit (`AGENTS.md`).
- Every `construct` item carries the adversarial reject battery.
- Reduced-motion frames and hard-gate + chapter-seek coverage for all six clips.
- Route tests for both placed `visual` blocks.

## 3. Verification tier

Package-commit tier per `AGENTS.md`: `./check.sh` on each lesson commit;
`./check.sh --e2e` before requesting the package semantic review. The `--e2e`
addition is required here regardless of the usual trigger list, because this
package introduces a **new course into `courseModel.ts`** and two placed-scene
route blocks.

## 4. Gate posture

**Gate 8 is a per-lesson gate, scoped to lesson-owned outcomes**
([mastery-standard §9](../../../../authoring/mastery-standard.md#9-workflow-integration)).
All four contracts record that every lesson-owned outcome has a real, in-lesson,
auto-graded evidencing item, so **each lesson can pass Gate 8 on build**. The
module-owned `mod-calcfound-*` items are **Gate 9 obligations, carried forward**;
open Gate-9 obligations are the normal state of an accepted lesson and are
**not** a Gate 8 blocker.

**Gate 9 for `calculus-foundations`** is a separate, later Mode D pass. It is
open by design and outside this package's scope.

## 5. What this package does not do

- No lesson from any other package.
- No entry diagnostic and no bridges (Package B0).
- No module assessment (Gate 9).
- **No platform work.** [Architecture §7](../../curriculum-architecture.md#7-platform-gaps-recorded-not-scheduled)
  gaps G1 and G2 are discharged *as ordinary lesson work* inside slice A0; the
  rest are untouched.

## 6. Package status ledger

Mark in-progress **as the first implementation commit** (`AGENTS.md`).

| Slice | Status | Branch / worktree |
| --- | --- | --- |
| A0 shared foundations | NOT STARTED | — |
| A1 `limits-continuity` | NOT STARTED | — |
| A2 `derivative-local-linearity` | NOT STARTED | — |
| A3 `integral-accumulation` | NOT STARTED | — |
| A4 `fundamental-theorem` | NOT STARTED | — |

## 7. Acceptance for the package

- [ ] All four lessons built, each meeting its own lesson-plan acceptance checklist.
- [ ] **Each lesson passes Gate 8 on its lesson-owned outcomes**, with module-owned
      outcomes recorded as open Gate-9 obligations.
- [ ] P1–P5 verified, each by a test rather than by inspection.
- [ ] `./check.sh --e2e` green.
- [ ] Package-level semantic review (Opus) requested and passed.
- [ ] Spine and architecture updated: four rows `future → built`, status ledgers
      updated, next-package recommendation re-stated.
- [ ] A Gate 9 assessment plan for `calculus-foundations` opened as the next Mode D
      item, so the module-owned outcomes are not silently dropped.

## 8. After Package A

The roadmap does **not** stop at this package, nor at Fourier or Laplace. The
next package to enter Mode B is **B (`calculus-technique`)**, and the full
sequence through the vector-calculus capstone is in
[architecture §6](../../curriculum-architecture.md#6-implementation-packages--the-complete-roadmap).
