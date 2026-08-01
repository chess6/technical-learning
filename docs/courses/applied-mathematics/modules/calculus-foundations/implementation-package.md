# Implementation package A — `calculus-foundations`

The **single ordered work list** for the applied-mathematics course's first
package, and the module artifact for the `calculus-foundations` unit. Written so
that an implementation model can execute it **without reopening any curriculum
decision**: every "what" and "why" is settled in the Mode A and Mode B artifacts
linked below.

> **Status: APPROVED. A0 + A1 + A2 + A3 + A4 complete, all four on `master`.**
> **The package-level semantic review ran three times (2026-07-29, -30, -31),
> found defects each time, and every defect is corrected and re-verified
> (`./check.sh --e2e` under a narrow, formally approved waiver; typecheck,
> lint, build all green — §7). The repository owner approved the package and
> the waiver on 2026-07-31 — see §7 for the exact approval record and the
> waiver's scope.**
>
> Package A was explicitly approved for implementation on 2026-07-28, resolving
> the boundary question review had raised about A0/A1. All four slices — A0
> (shared foundations), A1 (`limits-continuity`), A2
> (`derivative-local-linearity`), A3 (`integral-accumulation`), and A4
> (`fundamental-theorem`) — are built and merged to `master`
> (`feature/a4-fundamental-theorem` merged 2026-07-30 and deleted). Each of
> A1–A4 passes Gate 8 on its lesson-owned outcomes. The module-owned
> `mod-calcfound-*` outcomes remain open Gate-9 obligations, by design (§4).
>
> **2026-07-30 correction pass.** The package-level review found: 15 items
> across A1–A4 whose mastery-contract Level column had drifted above what
> their actual (post-MCQ-conversion) steps support; two code defects in A4
> unrelated to evidence (`ftc-telescoping`'s `E_i` visualization drew a rate
> difference instead of the labelled residual; the running total's numerical
> derivative was wrong at the domain's lower endpoint); five learner-facing
> strings in A4's explorer overclaiming "no antiderivative" for \(e^{-x^2}\)
> where only an elementary formula is missing; and a generic-cancellation
> helper (shared by A3/A4 and planned for L34 reuse) that didn't check
> magnitude before treating two contributions as cancelling. All are fixed,
> with regressions; see §1's per-slice notes and §7.
>
> **2026-07-31 re-review.** A further independent pass found three more
> defects, all fixed with regressions: A4's explorer still implied its
> telescoping identity and local-linear error didn't exist rather than merely
> lacking a closed-form computation; the ledger's own e2e exception wording
> claimed a scene "outside this package" when the scene itself was in-package
> and only the failure's root cause was external (a defect this ledger has
> now stopped repeating); and a regression-test title mis-described a
> centered difference as one-sided. See §7.

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

### A1 — `limits-continuity` *(shipped)*
Creates `function-plot`. One guided clip (11 chapters), one explorer, **ten
items**, all auto-graded and contracted.

Two defects found by watching it and fixed in the same slice, both worth
recording because the next three lessons reuse the same apparatus:

- **Clipped-panel offsets.** A Motion Canvas `Rect` with `clip: true` positions
  its children relative to *its own centre*, while the scene's pixel helpers
  return stage coordinates. The main panel compensated with an inner node; the
  sampling and failure panels did not, so their contents rendered 150px off. Every
  clipped panel now carries the compensating node.
- **A band the function could break.** The `modulus` beat first drew a narrow
  guaranteed band around the coarse samples — which the spike visibly escaped,
  making a true modulus look false. At that spacing the fixture's real Lipschitz
  bound spans the whole panel, so no honest narrow band exists. The beat now shows
  what a modulus is *for*: a grid chosen against a tolerance, tracking the truth.

### A2 — `derivative-local-linearity` *(shipped)*
Creates `local-linearity-zoom`. **Two clips** — `derivative-local-linearity` and
the placed `derivative-three-names`, positioned by a
`{ kind: "visual", sceneId }` route block. Nine items.

Its evidence claims were made ceiling-legal and figure-free **before** any code
was written, applying L1's review findings rather than repeating them: three E4
claims on `exercise-sequence` (ceiling E3) became one E4 claim on
`construct-in-explorer`, and two items that claimed to present graphs were
reworded to what they capture. The defects found while building it are listed in
its [Gate 8 record](../../lessons/02-derivative-local-linearity/mastery-contract.md#6-acceptance-record-gate-8);
the one worth carrying forward to A3/A4 is that a **signal declared at module
scope survives between scene runs**, which silently breaks seek determinism.
A 2026-07-30 package-level re-review found this contract had also drifted from
the shipped code independent of any MCQ conversion — stale ids
(`der-sketch-derivative`, `der-continuous-not-differentiable`), a tier-mix
count that didn't match the built items (2/4/3 vs. the actual 2/5/2), and
`der-tangent-crosses` claimed as an open E4 `construct` when it ships as two
fixed-answer numeric questions at **drill**, not transfer, tier. Corrected in
its [contract's 2026-07-30 section](../../lessons/02-derivative-local-linearity/mastery-contract.md#correction-2026-07-30-package-level-semantic-re-review).

### A3 — `integral-accumulation` *(shipped)*
Creates `accumulation-strip`. One clip (ten beats), one explorer, eight items.

Its evidence claims were made ceiling-legal **before** any code was written, as
A2's were: three E4 claims became one E4 claim on `construct-in-explorer`
(`int-signed-transfer`, a constructed two-piece current whose charge ends below
its maximum), with the other two recorded at E3 and E2. The reconciliation table
is in its [contract §1d](../../lessons/03-integral-accumulation/mastery-contract.md#evidence-ceiling-reconciliation-applied-at-build-2026-07-28).
A 2026-07-30 package-level re-review found three further items (`int-units-fresh`,
`int-read-running-total`, `int-scale-invariance`) had kept an E3 claim solely
because a later MCQ-conversion pass left their enclosing `exercise-sequence`
capability unchanged, even though every one of their steps became
`multiple-choice`; corrected to E2 in the contract's
[second reconciliation](../../lessons/03-integral-accumulation/mastery-contract.md#second-reconciliation-2026-07-30-post-mcq-conversion-package-level-re-review).

The defect worth carrying forward to A4 is recorded in its
[Gate 8 record](../../lessons/03-integral-accumulation/mastery-contract.md#6-acceptance-record-gate-8):
**a conditional result reported as an unconditional one.** The explorer's
bracket readout was a single boolean computed by checking whether the two sums
*happened* to straddle the value — and on a rate that plainly turns they
sometimes do, so the panel asserted a guarantee it had not earned. Observation
and guarantee are now separate fields (`straddles`, `guaranteed`), with a test
pinning a case where they disagree. A4 has the same shape of risk: the
telescoping identity holds for **any** partition, and a picture drawn only on
equal ones would imply it needs them.

### A4 — `fundamental-theorem` *(shipped)*
Creates `telescoping-cancellation`. **Two clips** — `ftc-accumulate-then-measure`
and the placed `ftc-telescoping`. One explorer, ten items.

Its evidence claims were made ceiling-legal **before** any code was written, as
A2's and A3's were: the contract's four aspirational E4 claims
(`ftc-lower-limit-shift`'s Level column, and three D9 outcomes built on
`exercise-sequence`/text) were reconciled to E2/E3 — no `construct-in-explorer`
item exists in this lesson, so E3 is the honest ceiling throughout. The
reconciliation table is in its [contract's evidence-ceiling
reconciliation](../../lessons/04-fundamental-theorem/mastery-contract.md#evidence-ceiling-reconciliation-applied-at-build-2026-07-29).
A 2026-07-30 package-level re-review found four items
(`ftc-why-collapse`, `ftc-constant-cancels`, `ftc-no-elementary-antiderivative`,
`ftc-falsify`) had kept their reconciled E3 claim solely because a later
MCQ-conversion pass left their `exercise-sequence` capability unchanged, even
though the `text` step each E3 claim rested on became `multiple-choice`;
corrected to E2 in the contract's [second
reconciliation](../../lessons/04-fundamental-theorem/mastery-contract.md#corrections-2026-07-30-package-level-semantic-re-review-second-pass).
The same re-review also found and fixed three code defects unrelated to
evidence: `ftc-telescoping`'s `E_i` visualization compared a rate difference
instead of the labelled accumulation residual, five explorer strings overclaimed
"no antiderivative" for \(e^{-x^2}\) instead of naming the missing elementary
formula, and the running total's numeric derivative was wrong at the domain's
lower endpoint (an epsilon clamp halved it). All three are detailed in the same
section of the contract.

Before any A4 code was written, the guarantee-state defect A3 left recorded
(§ above) was corrected: `EX_NON_MONOTONE` and the other turning fixtures now
carry exact critical-point expressions and complete certified monotone
stretches either side of the turn, a `turningPoints` field distinguishes
"known to turn" from merely "not certified", and the explorer's wording only
ever claims what the certification state proves.

The defect worth carrying forward from A4 is recorded in its [Gate 8
record](../../lessons/04-fundamental-theorem/mastery-contract.md#6-acceptance-record-gate-8)
and in
[known-failure-modes.md](../../../../quality/known-failure-modes.md#latex-glyph-identities-are-not-stable-across-a-scene-reset-and-can-fail-seek-determinism):
`ftc-accumulate-then-measure` fails the hard gates' `seek-determinism` check
for reasons traced to `@motion-canvas/2d`'s own `Latex` component (a
process-lifetime glyph cache racing against a per-scene auto-key counter),
not to this lesson's content — the gate's own report confirms the canvas
pixels match in every case. Three fix attempts (explicit keys, signal-backed
text, one static node per string) each removed a real, separate defect
without resolving this one; it is left as a known, disclosed limitation
rather than further guessed at.

## 2. Package-specific review checks

Ordinary gates apply unchanged. These five are **package-specific, and are the
ones most likely to be lost by an implementer working from habit**:

| # | Check | Slice | Why it matters |
| --- | --- | --- | --- |
| **P1** ✅ *(A3)* | **No antiderivative anywhere in `integral-accumulation`** — prose, captions, explorer, exercises, layers, feedback strings. | A3 | L4's value is that the connection is *discovered*. Naming it in L3 spends the course's central payoff. **Satisfied:** `src/lessons/__tests__/noAntiderivative.test.tsx` greps the built lesson definition, the scene's chapters and accessible description, and the explorer's rendered text, and carries a guard asserting the pattern set is not vacuous; `e2e/lesson-integral-accumulation.spec.ts` repeats it over the rendered article. Scoped to the lesson, not the page: the course sidebar names L4 by title, and should — and once A4 shipped as a real lesson, the in-article Prev/Next footer started naming it too, for the identical reason; the e2e check now excludes both. |
| **P2** ✅ *(A4)* | **`telescoping-cancellation` is parameterized over the cancelling pairs**, not hard-coded to interval endpoints, with a test that feeds it a non-interval pairing. | A4 | Packages I–K re-run this family with shared interior **edges** (L34) and **faces** (L36, L37). Hard-coding it costs the course Theme 1's capstone. **Satisfied:** `cancelContributions`/`intervalContributions` (`src/math/calculus.ts`) and the `TelescopingCancellation` explorer component group purely by an id + sign pair, with no notion of order or adjacency; `calculus.test.ts` and `TelescopingCancellation.test.tsx` each feed a non-interval pairing (three cells sharing two interior edges) and assert the correct survivors. |
| **P3** ✅ *(A2, A4)* | **The residual is visible, and the geometry drawn for it is the quantity it's labelled as.** Every zoom frame in L2 and every `one-step` frame in L4 renders the error as a labelled nonzero quantity, on the same axis/units as the label, and the magnified window renders the **real sampled fixture**, never a substituted straight line. | A2, A4 | The package's principal known-failure-mode risk: a zoom that fakes straightness teaches that the curve *is* straight (L2's M4); a close second is a residual drawn as the wrong quantity, which looks plausible but has different units. **A4 satisfied:** `calculus.test.ts` pins a nonzero `residual` on every piece of the unequal partition clip 2 and the explorer both use, and (added 2026-07-30) pins that the two geometry endpoints `ftc-telescoping` actually draws (`residualEndpoints`) differ by exactly that residual — a 2026-07-30 review found the drawn segment had been comparing \(f(x_i)\) and \(f(x_{i+1})\), a rate difference in different units, not the labelled \(F\)-based residual; the explorer's own "Show the error" table is asserted nonzero in `FundamentalTheoremExplorer.test.tsx` and `e2e/lesson-fundamental-theorem.spec.ts`. |
| **P4** ✅ *(A3, A4)* | **The two computations of \(\int_0^2 x^2\) are independent** — L3's summation route must not call any FTC helper, and L4's corroboration must display two separately computed numbers. | A3, A4 | Otherwise the corroboration is circular and the strongest evidence in the package is worthless. **A3: satisfied.** `riemannSum`, `refinementTable` and the scene's own prefix sums evaluate only the rate; several offered fixtures declare a closed-form antiderivative and no lesson code path reads one. `accumulation.test.ts` checks the summed and shortcut values agree *in the test*, which is where that comparison belongs. **A4: satisfied.** Clip 2's `SUMMED_VALUE` (`riemannSum` alone) and `FTC_VALUE` (`EX_PARABOLA.antiderivative` alone), the explorer's `fineSum`/`bracketValue`, and the lesson's own `ftc-corroborate` item are each independently computed; `calculus.test.ts` pins their agreement. |
| **P5** ✅ *(A1, A4)* | **Continuity is not oversold.** L1 must ship the `local-only` and `modulus` beats and the `ex-hidden-spike` fixture; L4 must name the modulus at its `refine` beat. | A1 ✅, A4 ✅ | Continuity does **not** mean "nothing hides between samples" — it fixes no window width. Dropping this content re-introduces a false claim *and* leaves L4's uniformity step hand-waving. **A1: satisfied** — both beats ship, and `e2e/lesson-limits-continuity.spec.ts` asserts the explorer reports *no guaranteed band* for a continuous fixture with no modulus. **A4: satisfied** — the `refine` beat names `EX_PARABOLA`'s own declared modulus label on screen; `e2e/lesson-fundamental-theorem.spec.ts` seeks to that chapter and asserts the chapter summary names "modulus of continuity". |

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
| A0 shared foundations | **SHIPPED** | `master` |
| A1 `limits-continuity` | **SHIPPED** | `master` |
| A2 `derivative-local-linearity` | **SHIPPED** | `master` |
| A3 `integral-accumulation` | **SHIPPED** | `master` |
| A4 `fundamental-theorem` | **SHIPPED** | `master` (merged from `feature/a4-fundamental-theorem`, 2026-07-30; branch deleted) |

**Package approved:** repository owner (user), 2026-07-31, including a narrow
E2E waiver scoped to `ftc-accumulate-then-measure`'s `seek-determinism` check
only (see §7).

## 7. Acceptance for the package

- [x] All four lessons built, each meeting its own lesson-plan acceptance checklist.
- [x] **Each lesson passes Gate 8 on its lesson-owned outcomes**, with module-owned
      outcomes recorded as open Gate-9 obligations.
- [x] P1–P5 verified, each by a test rather than by inspection.
- [x] `./check.sh --e2e` — green under a **narrow, formally approved waiver**.
      **Approval record:** approved by the repository owner (user), 2026-07-31.
      Two known, pre-existing exceptions, both already recorded in
      [known-failure-modes.md](../../../../quality/known-failure-modes.md):
      `ftc-accumulate-then-measure` — an A4 scene, inside this package — fails
      the hard gates' `seek-determinism` check for a diagnosed `@motion-canvas/2d`
      `Latex` limitation; the failure's *root cause* is external to this
      package's code (unrelated to this lesson's content — confirmed unrelated
      to any 2026-07-30 code change, since that scene calls none of the
      functions this pass touched), but the scene itself is not. **The waiver
      covers exactly this one test, for exactly this diagnosed cause** — a
      disclosed library limitation, not a mathematics or content defect, and it
      does not extend to any future failure of the same test arising from a
      different cause. `solution-sets` (a linear-algebra scene) genuinely is
      outside this package and is not this waiver's to grant — it is noted here
      only as not blocking this package's own acceptance. Every other check,
      including every other hard gate for both A4 scenes, is green —
      `npm run typecheck`, `npm run lint`, and `npm run build` all pass clean.
- [x] Package-level semantic review (Opus) requested and passed. **Approval
      record:** approved by the repository owner (user), 2026-07-31. The review
      ran twice — once at the original scope (2026-07-29, found the defects
      this ledger's per-slice notes describe) and once narrower (2026-07-30,
      the MCQ-conversion evidence audit plus four code defects:
      `ftc-telescoping`'s `E_i` visualization, the Gaussian-wording overclaims,
      the `A'(x)` endpoint bug, and `cancelContributions`'s magnitude check) —
      plus a third, independent re-review pass (2026-07-31) that found three
      further defects (the Gaussian explorer's residual wording, the same
      "outside this package" e2e overclaim this item itself used to make, and
      an inaccurate regression-test title), all corrected. Every finding from
      all three passes is corrected, with regressions, and re-verified
      (`./check.sh --quick`, typecheck, lint). The correcting agent could not
      self-certify this box (ADR-002's self-certification gap); it is ticked
      here on the user's own sign-off, not the correcting agent's.
- [x] Spine and architecture updated: four rows `future → built`, status ledgers
      updated, next-package recommendation re-stated.
- [x] A Gate 9 assessment plan for `calculus-foundations` opened as the next Mode D
      item, so the module-owned outcomes are not silently dropped. See
      [assessment-plan.md](assessment-plan.md).

## 8. After Package A

The roadmap does **not** stop at this package, nor at Fourier or Laplace. The
next package to enter Mode B is **B (`calculus-technique`)**, and the full
sequence through the vector-calculus capstone is in
[architecture §6](../../curriculum-architecture.md#6-implementation-packages--the-complete-roadmap).
