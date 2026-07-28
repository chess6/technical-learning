# Lesson Mastery Contract — The Fundamental Theorem of Calculus (spine L6)

Gate 5 for **`fundamental-theorem`**, after [insight.md](insight.md) reached `PASS`.
This is the **flagship of Package A**.

## 1a. Placement & upstream links
- **Spine:** L6, unit `accumulation`, fourth and closing lesson of Package A.
- **Profile:** P2 primary. **No P3 bar claimed** — the uniformity step in the
  proof is stated with attribution, not proved. That is declared here and in the
  lesson, and is the one place a later P3 override on `accumulation` would attach.
- **Insight contract:** [insight.md](insight.md) — `PASS`.
- **Concepts introduced:** `antiderivative`, `ftc`. **Reused:** `limit`,
  `continuity` (L1); `local-linearity`, `derivative` (L2); `riemann-sum`,
  `definite-integral` (L5).

## 1b. Role, bridge, need
- **Role:** binds the course's two halves and supplies the **argument template**
  reused in L8, L20, and — decisively — L27. This lesson is the reason L2 was
  framed as approximation and L5 was denied the antiderivative.
- **Retrieve:** L5's running total and its unexplained observation; L5's
  summation value \(8/3\); L2's local-linear model with its error term; L1's
  continuity.
- **Bridge from L5:** L5 ended by noting that the running total rises fastest
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
| Say what changes if the **lower limit** of \(A\) is moved | D5/D13 | lesson | E4 | `ftc-lower-limit-shift` (`multiple-choice` over four \(A\) plots — correct = vertically shifted, same slope) | **recognition — recorded as E2** |
| State what the theorem does **not** promise, with a counterexample | D5/D13 | lesson | E4 | `ftc-no-elementary-antiderivative` (`text`, must name a specific integrand) | independently demonstrated |
| Predict what would be observably wrong if the theorem were false | D9 | lesson | E4 | `ftc-falsify` (`text`, produced) | independently demonstrated |
| Recognise the telescoping mechanism in an unfamiliar, calculus-free setting | D9 | lesson | E4 | `ftc-telescope-transfer` (\(\sum(1/k - 1/(k+1))\); evaluate, then identify which step of the argument it is and what plays \(F\)) | independently demonstrated |
| Reconcile the two computations of \(\int_0^2 x^2\) | D10 | lesson | E3 | `ftc-corroborate` (`numeric` + `text`: both values, and why agreement is evidence) | independently demonstrated |
| Retain "the theorem gives existence, not a formula" under delayed retrieval | D12 | **module** | E3 | `mod-accum-retain-existence` (module `accumulation`, Gate 9) | **not built** — Gate 9 open |
| Integrate the FTC with the derivative and the Riemann sum on one mixed item | D10 | **module** | E5 | `mod-accum-mixed-ftc` (module `accumulation`, Gate 9) | **not built** — Gate 9 open |

**Transfer:** four D9/E4 outcomes (`ftc-lower-limit-shift`,
`ftc-no-elementary-antiderivative`, `ftc-falsify`, `ftc-telescope-transfer`).

## 1e. Coverage status
Taught: all of §1c. Practiced: every lesson-owned outcome. Independently
demonstrated: all lesson-owned outcomes except `ftc-lower-limit-shift`, honestly
recorded as **recognition (E2)** — the learner selects among plotted candidates
rather than producing a plot.

## 1f. Connections, assessment, retention
- **Cumulative (D10):** the strongest in Package A. L5's `8/3` recomputed and
  compared (`ftc-corroborate`); L2's error term used **verbatim** at C8; L1's
  continuity used in the squeeze; `ex-drive`'s four-lesson arc closed.
- **Assessment:** 2 check, 4 drill, 4 transfer; **recall capped at one**
  (`ftc-lower-limit-shift`). Every graded item uses an integrand the clips do not
  animate, except `ftc-corroborate`, whose entire point is that it is L5's.
- **Retention (D12):** existence-not-a-formula — the claim most likely to erode
  into "every integral can be done".
- **Forward:** L7 (finding \(F\)), L8 (an endpoint to infinity), L20 (the
  derivative rule via parts), **L27 (the same argument over a region)**.

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
  endpoints, because L27 re-runs it with shared interior edges of a subdivided
  region. A test asserts the family accepts a non-interval pairing. *This is the
  single most important implementation constraint in Package A*, and skipping it
  would silently cost the course its capstone.
- **Declared unproved step:** the uniformity of the \(E_i\) bound. It must be
  visible in the lesson as a named assumption, not glossed.
- **Scope exclusions:** integration techniques (L7); improper integrals (L8);
  substitution in definite integrals (L7); the mean value theorem for integrals as
  a named result; general integrability.
- **Abstraction return:** insight §14; evidenced by `ftc-telescope-transfer`,
  which contains no integral.

## 6. Acceptance record (Gate 8)
- [ ] Insight contract linked and `PASS` — **linked; PASS recorded.**
- [ ] All §1 fields filled.
- [ ] Outcomes operational, owner-marked, evidence-paired.
- [ ] Lesson-owned core outcomes independently demonstrated, with the recorded exception.
- [ ] Module-owned outcomes recorded as Gate-9 obligations.
- [ ] Assessment matches §1f; recall capped at one; four transfer items.
- [ ] Backward bridges (L1/L2/L5) + forward edges (L7/L8/L20/L27) recorded.
- [ ] Retention hook recorded.
- [ ] Correctness gate passed, **including the exact telescoping identity on unequal partitions**.
- [ ] **`telescoping-cancellation` is parameterized over cancelling pairs**, with the test that proves it.
- [ ] The unproved uniformity step is visible in the lesson as a named assumption.
- [ ] Grading contract + `ITEM_ASSESSMENT_META` registered for every auto-graded item.

*(Unchecked: Gate 8 is an implementation gate. Nothing here is built.)*
