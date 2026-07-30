# Lesson Mastery Contract — The Fundamental Theorem of Calculus (spine L4)

Gate 5 for **`fundamental-theorem`**, after [insight.md](insight.md) reached `PASS`.
This is the **flagship of Package A**.

## 1a. Placement & upstream links
- **Spine:** L4, unit `calculus-foundations`, fourth and closing lesson of Package A.
- **Profile:** P2 primary. **No P3 bar claimed** — the uniformity step in the
  proof is stated with attribution, not proved. That is declared here and in the
  lesson, and is the one place a later P3 override on `accumulation` would attach.
- **Insight contract:** [insight.md](insight.md) — `PASS`.
- **Concepts introduced:** `antiderivative`, `ftc`. **Reused:** `limit`,
  `continuity` (L1); `local-linearity`, `derivative` (L2); `riemann-sum`,
  `definite-integral` (L3).

## 1b. Role, bridge, need
- **Role:** binds the course's two halves and supplies the **argument template**
  reused in L8, L24, and — decisively — L34. This lesson is the reason L2 was
  framed as approximation and L3 was denied the antiderivative.
- **Retrieve:** L3's running total and its unexplained observation; L3's
  summation value \(8/3\); L2's local-linear model with its error term; L1's
  continuity.
- **Bridge from L3:** L3 ended by noting that the running total rises fastest
  where the rate is highest, and refused to say why.
- **Motivating need:** *An integral is a limit of unboundedly many terms. The
  odometer in the car produces the answer without summing anything. How?*

## 1c. Content to teach
- **Definitions (D2):** antiderivative; the two statements of the theorem;
  the notation \(\bigl[F(x)\bigr]_a^b\).
- **Objects:** `ex-drive` (fourth appearance, the two instruments); `ex-parabola`
  on \([0,2]\) for the corroboration; a **deliberately unequal** partition;
  \(e^{-x^2}\) as the standing "no elementary antiderivative" example; a bare
  telescoping sum with no integral, for transfer.
- **Procedures (D3):** evaluate a definite integral via an antiderivative;
  differentiate an integral with a variable upper limit; verify an antiderivative
  by differentiating it; carry out a telescoping cancellation explicitly.
- **Results (D5):** \(A'(x)=f(x)\); \(\int_a^b f = F(b)-F(a)\); \(+C\) cancels;
  the lower limit shifts \(A\) without changing its slope. **Explicitly denied:**
  that every continuous function has an elementary antiderivative; that the
  partition must be equal; that Riemann sums are now obsolete.
- **Proof depth (D6):** **both parts derived on screen** — part 1 by the
  min/max squeeze, part 2 by telescoping plus L2's error term. The uniformity of
  that error bound is **stated with attribution and flagged as the one unproved
  step**.
- **Representations (D4):** the cancellation picture (visual); the two independent
  computations of \(8/3\) (numeric); the identity and the two statements
  (symbolic); "the interior never mattered" (verbal); the two instruments
  (applied); the staircase (structural).
- **Translations:** landing ↔ interior evaluation; step height ↔ \(F(x_{i+1})-F(x_i)\);
  thin sliver ↔ \(f(x)h\); slope of \(A\) ↔ height of \(f\).
- **Edge/degenerate cases (D7):** unequal partition; \(F\) shifted by a constant;
  lower limit changed; \(f\) negative on part of the interval; \(a=b\);
  \(e^{-x^2}\), where the theorem applies and no formula exists.
- **Misconceptions (D13):** M1–M7 of [insight §Prerequisites](insight.md#prerequisites-limitations-likely-misconceptions).

## 1d. Outcomes with evidence

| Outcome | Dim | Owner | Level | Evidence | Attainment |
| --- | --- | --- | --- | --- | --- |
| Evaluate a fresh definite integral via an antiderivative, verifying the antiderivative by differentiating it | D3 | lesson | E3 | `ftc-evaluate-fresh` (`exercise-sequence`: propose \(F\) → verify \(F'=f\) → evaluate) | independently demonstrated |
| Differentiate an integral with a variable upper limit | D3 | lesson | E3 | `ftc-differentiate-integral` (`numeric`/expression, fresh integrand) | independently demonstrated |
| Carry out the telescoping cancellation on an **unequal** partition and state how many survive | D6/D7 | lesson | E3 | `ftc-telescope-count` (`exercise-sequence`: which terms cancel → how many remain → which) | independently demonstrated |
| Explain, without notation, why unboundedly many contributions collapse to two evaluations | D6/D13 | lesson | E3 | `ftc-why-collapse` (`text`, produced) | independently demonstrated |
| Say what changes if \(F\) is replaced by \(F+C\), and why | D5/D13 | lesson | E3 | `ftc-constant-cancels` (`text`) | independently demonstrated |
| Say what changes if the **lower limit** of \(A\) is moved | D5/D13 | lesson | **E2** | `ftc-lower-limit-shift` (`multiple-choice` over four \(A\) plots — correct = vertically shifted, same slope) | **recognition — recorded as E2** |
| State what the theorem does **not** promise, with a counterexample | D5/D13 | lesson | **E3** | `ftc-no-elementary-antiderivative` (`text`, must name a specific integrand) | independently demonstrated |
| Predict what would be observably wrong if the theorem were false | D9 | lesson | **E3** | `ftc-falsify` (`text`, produced) | independently demonstrated |
| Recognise the telescoping mechanism in an unfamiliar, calculus-free setting | D9 | lesson | **E3** | `ftc-telescope-transfer` (\(\sum(1/k - 1/(k+1))\); evaluate, then identify which step of the argument it is and what plays \(F\)) | independently demonstrated |
| Reconcile the two computations of \(\int_0^2 x^2\) | D10 | lesson | E3 | `ftc-corroborate` (`numeric` + `text`: both values, and why agreement is evidence) | independently demonstrated |
| Retain "the theorem gives existence, not a formula" under delayed retrieval | D12 | **module** | E3 | `mod-calcfound-retain-existence` (module `calculus-foundations`, Gate 9) | **not built** — Gate 9 open |
| Integrate the FTC with the derivative and the Riemann sum on one mixed item | D10 | **module** | E5 | `mod-calcfound-mixed-ftc` (module `calculus-foundations`, Gate 9) | **not built** — Gate 9 open |

**Transfer:** four transfer-*tier* items (`ftc-no-elementary-antiderivative`,
`ftc-falsify`, `ftc-telescope-transfer`, `ftc-corroborate`); the first three are
this lesson's D9 outcomes, reconciled to **E3** below; the fourth is D10
(cumulative). `ftc-lower-limit-shift` is **not** a transfer-tier item — it is the
one recall-capped `check`-tier item (D5/D13, recognition, E2) — and was wrongly
grouped with the D9 outcomes in an earlier draft of this table.

### Evidence-ceiling reconciliation *(applied at build, 2026-07-29)*

The contract as drafted at Gate 5 claimed E4 four times, on capabilities whose
capture interfaces cannot record it. `CAPABILITY_EVIDENCE_CEILING` caps
`multiple-choice` at **E2** and `exercise-sequence`/produced-`text` items at
**E3**; this lesson builds no `construct-in-explorer` item, so **E3 is the
honest ceiling for every lesson-owned outcome here**. This is the same
preflight L2 and L3 applied before coding, applied here before coding too:

| Item | Claimed | Now | How |
| --- | --- | --- | --- |
| `ftc-lower-limit-shift` | E4 in the Level column, E2 in the Attainment column | **E2** | the Level column was simply wrong; the Attainment column already said E2 and the item was already built as a four-plot `multiple-choice` picker |
| `ftc-no-elementary-antiderivative` | E4 on produced text | **E3** | recorded at the ceiling of the capability that actually captures it (`exercise-sequence`, a `text` step) |
| `ftc-falsify` | E4 on produced text | **E3** | same — `exercise-sequence`/`text` ceiling |
| `ftc-telescope-transfer` | E4 on `exercise-sequence` | **E3** | ceiling, not capability, was the error — the same correction A2 made for its transfer-tier exercise-sequence chains |

No item was rebuilt as `construct-in-explorer` to preserve an E4 label: none of
these four outcomes is an open construction a predicate can grade — they are
explanations, a counterexample name, and a symbolic-transfer identification —
and inventing a construction task to fit the capability would cue the answer or
misrepresent what the item actually asks. The mathematical task in each item is
unchanged; only the claimed evidence level moved to match what the capability
can prove. `ftcGradingContract.test.ts` asserts the resulting shape: no claim
above its capability's ceiling, and the tier mix (2 check, 4 drill, 4 transfer)
holds with `ftc-lower-limit-shift` and `ftc-differentiate-integral` as the two
`check`-tier items.

## 1e. Coverage status
Taught: all of §1c. Practiced: every lesson-owned outcome. Independently
demonstrated: all lesson-owned outcomes except `ftc-lower-limit-shift`, honestly
recorded as **recognition (E2)** — the learner selects among plotted candidates
rather than producing a plot.

## 1f. Connections, assessment, retention
- **Cumulative (D10):** the strongest in Package A. L3's `8/3` recomputed and
  compared (`ftc-corroborate`); L2's error term used **verbatim** at C8; L1's
  continuity used in the squeeze; `ex-drive`'s four-lesson arc closed.
- **Assessment:** 2 check, 4 drill, 4 transfer; **recall capped at one**
  (`ftc-lower-limit-shift`). Every graded item uses an integrand the clips do not
  animate, except `ftc-corroborate`, whose entire point is that it is L3's.
- **Retention (D12):** existence-not-a-formula — the claim most likely to erode
  into "every integral can be done".
- **Forward:** L7 (finding \(F\)), L8 (an endpoint to infinity), L24 (the
  derivative rule via parts), **L34 (the same argument over a region)**.

## 1g. Correctness & scope
- **Correctness checks:** all values from `src/math/calculus.ts`. Property tests:
  \(F(b)-F(a)\) equals the refined Riemann sum within tolerance on every fixture;
  the telescoping identity holds **exactly** for random unequal partitions (a
  pure-arithmetic test with no calculus in it); \(A'\) computed numerically matches
  \(f\) on every fixture; shifting \(F\) by a constant leaves the definite integral
  unchanged; shifting the lower limit shifts \(A\) by a constant and leaves \(A'\)
  unchanged; the two independent computations of \(\int_0^2 x^2\) agree to
  machine tolerance.
- **Generalization requirement (structural):** `telescoping-cancellation` must be
  built **parameterized over the cancelling pairs**, not hard-coded to interval
  endpoints, because L34 re-runs it with shared interior edges of a subdivided
  region. A test asserts the family accepts a non-interval pairing. *This is the
  single most important implementation constraint in Package A*, and skipping it
  would silently cost the course its capstone.
- **Declared unproved step:** the uniformity of the \(E_i\) bound. It is now
  citable rather than hand-waved: L1 introduces `modulus-of-continuity`, and this
  lesson names it as the object supplying uniformity on a closed bounded
  interval. **The existence of a modulus there is stated with attribution, not
  proved** — that is the one analytic gap in Package A, and it must be visible in
  the lesson as a named assumption.
- **Scope exclusions:** integration techniques (L7); improper integrals (L8);
  substitution in definite integrals (L7); the mean value theorem for integrals as
  a named result; general integrability.
- **Abstraction return:** insight §14; evidenced by `ftc-telescope-transfer`,
  which contains no integral.

## 6. Acceptance record (Gate 8)

> **Gate 8 is scoped to this lesson's own outcomes.** Per
> [mastery-standard §9](../../../../authoring/mastery-standard.md#9-workflow-integration),
> Gate 8 confirms that every **lesson-owned** core outcome is independently
> demonstrated with real in-lesson evidence, and that module-owned outcomes are
> **carried forward as planned Gate-9 obligations**. The presence of open
> Gate-9 obligations is the normal state of an accepted lesson and does **not**
> block Gate 8. Gate 8 would be blocked only by a *lesson-owned* outcome with no
> real evidencing item, or by accepting a lesson-owned outcome on planned module
> evidence — neither of which this contract does.

**Gate 8, built (2026-07-30):** every lesson-owned outcome in §1d has a real,
in-lesson, auto-graded evidencing item at its reconciled level, and the one
recorded recognition-level outcome is declared as such rather than claimed as
a demonstration.

- [x] Insight contract linked and `PASS` — linked; PASS recorded.
- [x] All §1 fields filled.
- [x] Outcomes operational, owner-marked, evidence-paired.
- [x] **Every lesson-owned** core outcome independently demonstrated, with the
      recorded recognition-level exception (`ftc-lower-limit-shift`, E2)
      declared as such.
- [x] No lesson-owned outcome accepted on planned module evidence.
- [x] Assessment set matches §1f (2 check, 4 drill, 4 transfer); recall capped
      at one; transfer items present —
      `src/lessons/__tests__/fundamentalTheoremGradingContract.test.ts` pins the
      tier tally.
- [x] Module-owned outcomes carried forward as Gate-9 obligations *(open by
      design; not a Gate 8 blocker)*.
- [x] Backward bridges (L1/L2/L3) + forward edges (L7/L8/L24/L34) recorded.
- [x] Retention hook recorded.
- [x] Correctness gate passed, **including the exact telescoping identity on
      unequal partitions** — `calculus.test.ts`'s "the Fundamental Theorem (L4)"
      and "generic cancellation" suites.
- [x] **`telescoping-cancellation` is parameterized over cancelling pairs**, with
      the test that proves it — `TelescopingCancellation.test.tsx` and
      `calculus.test.ts` each feed the engine a non-interval pairing (P2).
- [x] The unproved uniformity step is visible in the lesson as a named
      assumption — clip 2's `refine` beat names `EX_PARABOLA`'s own declared
      modulus label on screen, and §1c/§1g state the attribution explicitly.
- [x] Grading contract registered for every auto-graded item
      (`describeGradingContract`, all 10 items, adversarial reject batteries
      included). **`ITEM_ASSESSMENT_META`** is the module-item (Gate 9) evidence
      manifest, keyed to `MODULE_ITEMS`; it does not cover lesson-owned items,
      matching A2's and A3's own precedent — none of A1–A3's lesson items are
      registered there either.

### Corrections, 2026-07-29–30 (A4 build)

- **A3's guarantee-state defect, corrected first.** `bracket.guaranteed ===
  false` was worded as "the rate turns here" unconditionally, which
  `ex-non-monotone` could not honour for a narrowed interval (its
  `monotoneIntervals` was empty). Fixed before any A4 code was written: exact
  critical-point expressions, complete certified stretches either side of every
  turn, a `turningPoints` field, and wording that only names a turn when one is
  actually declared inside the selected interval.
- **Evidence-ceiling reconciliation, applied before code.** Four aspirational
  E4 claims reconciled to E2/E3 — see the table above.
- **One known, disclosed limitation:** `ftc-accumulate-then-measure` fails the
  hard gates' `seek-determinism` check for a diagnosed `@motion-canvas/2d`
  `Latex` limitation (its glyph auto-keys are not stable across a scene reset
  under mixed cache states), not for any defect in this lesson's mathematics or
  visuals — the gate's own report confirms the canvas pixels match in every
  case. Recorded in
  [known-failure-modes.md](../../../../quality/known-failure-modes.md#latex-glyph-identities-are-not-stable-across-a-scene-reset-and-can-fail-seek-determinism)
  rather than left undiagnosed. Every other hard gate, for both A4 scenes,
  passes.
