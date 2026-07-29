# Lesson Mastery Contract — What "approaches" means (L1)

Gate 5 for **L1 `limits-continuity`**, after [insight.md](insight.md) reached `PASS`.

## 1a. Placement & upstream links
- **Spine:** L1, unit `calculus-foundations`, first lesson of Package A and of the course proper.
- **Profile:** P2 primary. **No P3 bar claimed** — \(\varepsilon\)–\(\delta\) proof
  *production* is explicitly out of scope; the learner reads and applies the
  guarantee, and does not write quantified proofs.
- **Insight contract:** [insight.md](insight.md) — `PASS`.
- **Concepts introduced:** `limit`, `continuity`, `modulus-of-continuity`.
  **Reused:** none from this course; entry assumptions only.
- **Upstream:** `functions-graphs-bridge` (conditional). No cross-course
  prerequisite.

## 1b. Role, bridge, need
- **Role:** supplies the one machine both halves of calculus are built from. Every
  later definition in Package A is a limit of something undefined at the limit,
  and this lesson is what makes that legitimate rather than a manoeuvre.
- **Retrieve:** function notation, graph reading, absolute value as distance,
  algebraic cancellation.
- **Motivating need:** *A car passing a single point has a speed — the needle says
  so. But speed is distance over time, and at an instant both are zero. What is
  the needle showing?*

## 1c. Content to teach
- **Definitions (D2):** the limit, stated as the tolerance guarantee and once in
  symbols; one-sided limits (as the jump diagnostic only); continuity at a point
  — explicitly a **local** claim; the **modulus of continuity** as the
  quantitative upgrade that a sampling argument needs.
- **Objects:** `ex-drive` (velocity trace); `ex-parabola` \(f(x)=x^2\) at \(x=3\);
  a punctured version of `ex-parabola`; a jump function; \(\sin(1/x)\) near 0;
  \(1/x^2\) near 0.
- **Procedures (D3):** decide from a graph whether a limit exists and name the
  failure mode; evaluate a \(0/0\) limit by exhibiting an expression agreeing off
  the point; check continuity at a point as a three-part test (value exists, limit
  exists, they agree).
- **Results (D5):** the value at the point never affects the limit; a limit may
  exist where the function is undefined; continuity licenses **substitution**.
  **Explicitly denied:** that a limit's existence implies continuity; that
  "drawable without lifting the pen" is a definition; and — the correction this
  contract carries — that **continuity alone licenses finite sampling**. It does
  not: it fixes no window width. A sampling argument additionally needs a chosen
  resolution and a modulus of continuity. (A continuous function on a closed
  bounded interval has one; that fact is **stated with attribution**, not proved.)
- **Proof depth (D6):** the \(\delta=\varepsilon\) verification for
  `ex-parabola` is **derived on screen**. Learner proof production: none required.
- **Representations (D4):** graph with tolerance band and input window (visual);
  a table of shrinking-interval values (numeric); the two-expression algebra
  (symbolic); the guarantee spoken as a challenge–response (verbal); the
  speedometer (applied).
- **Translations:** band ↔ tolerance; window ↔ \(\delta\); punctured point ↔ "not
  consulted"; settling table ↔ forced value.
- **Edge/degenerate cases (D7):** removable discontinuity; jump; oscillation with
  no forced value; blow-up; a function continuous at a point but wild elsewhere
  (continuity is a *local* claim).
- **Misconceptions (D13):** M1–M6 of [insight §Prerequisites](insight.md#prerequisites-limitations-likely-misconceptions).

## 1d. Outcomes with evidence

| Outcome | Dim | Owner | Level | Evidence | Attainment |
| --- | --- | --- | --- | --- | --- |
| Decide, from a function's **definition**, whether a limit exists at a marked point, and name the failure mode when it does not | D3 | lesson | E3 | `lim-diagnose-definition` (`exercise-sequence`, four fresh functions, typed failure mode — not multiple choice) | independently demonstrated |
| Decide the same **from a graph** | D4 | lesson | — | *(no graded item: `exercise-sequence` cannot present a figure)* | **practised only** — the scene shows all four failures and the explorer reports the verdict per fixture, but nothing captures the learner's own reading. Not claimed. |
| State that altering or deleting the value at the point leaves the limit unchanged, and use it | D5/D13 | lesson | E3 | `lim-point-value-irrelevant` (`text`, produced) | independently demonstrated |
| Evaluate a fresh \(0/0\) limit **by exhibiting an agreeing expression**, then reading the value off it | D3 | lesson | E3 | `lim-zero-over-zero-fresh` (`exercise-sequence`: the expression as typed text, then the value; a quotient the scene never shows) | independently demonstrated |
| Apply the three-part continuity test at a point of a fresh piecewise function | D3/D2 | lesson | E3 | `lim-continuity-test` (`exercise-sequence`) | independently demonstrated |
| Reject "a limit exists ⇒ continuous" with a counterexample of their own | D7/D13 | lesson | **E4** | `lim-limit-not-continuity` (**`construct-in-explorer`**, ceiling E4; predicate-graded on the pair (limit, value) — any finite pair that differs passes) | independently demonstrated |
| Decide whether changing one point could repair the limit, continuity, both, or neither | D9 | lesson | **E3** | `lim-repair-transfer` (`exercise-sequence`, unfamiliar piecewise functions) | independently demonstrated — **transfer *tier*, E3 *level***: the chain is scaffolded, and `exercise-sequence` is capped at E3 |
| Justify a substitution by citing continuity rather than habit | D4/D13 | lesson | E3 | `lim-why-substitution-works` (`text`) | independently demonstrated |
| Reject "the samples are all small, so the function is", and name what would have to be added | D5/D13 | lesson | **E3** | `lim-continuity-not-enough` (`exercise-sequence` on `ex-hidden-spike`: verdict → the two missing ingredients) | independently demonstrated — transfer tier, E3 level (see above) |
| Use a supplied modulus of continuity to choose a grid spacing for a stated tolerance | D3 | lesson | E3 | `lim-choose-spacing` (`numeric`) | independently demonstrated |
| Recognise the symbolic \(\varepsilon\)–\(\delta\) statement as the guarantee just used | D2 | lesson | E1 | `lim-symbolic-recognition` (`multiple-choice`) | **recognition only — recorded as E1, not claimed higher** |
| Retain "the point value is irrelevant" under delayed retrieval | D12 | **module** | E3 | `mod-calcfound-retain-point-value` (module `calculus-foundations`, Gate 9) | **not built** — Gate 9 open |
| Integrate limits with the derivative on a later mixed item | D10 | **module** | E5 | `mod-calcfound-limit-in-derivative` (module `calculus-foundations`, Gate 9) | **not built** — Gate 9 open |

**Transfer:** three transfer-tier items. **Exactly one is claimed at E4** —
`lim-limit-not-continuity`, an open predicate-graded construction on
`construct-in-explorer` (ceiling E4). The other two are scaffolded chains on
`exercise-sequence`, whose ceiling is **E3**
([`evidence.ts`](../../../../../src/lessons/evidence.ts)), and are claimed there.
An earlier draft of this contract claimed E4 for all three; that exceeded the
capability ceiling and is corrected.

## 1e. Coverage status
Taught: all of §1c. Practised: every lesson-owned outcome. Independently
demonstrated: all lesson-owned outcomes except two, both recorded honestly rather
than claimed:

- `lim-symbolic-recognition` — **E1 recognition**. The lesson does not claim the
  learner can produce the quantified statement.
- **Deciding a limit's fate from a graph** — **practised, not demonstrated**. The
  `exercise-sequence` capability cannot present a figure, so no graded item
  captures the learner's own graph reading; the graded item works from the
  definition instead. Adding it would need either a new capability or a
  figure-bearing item type, and neither is in this package's scope.

## 1f. Connections, assessment, retention
- **Cumulative (D10):** none backwards — this is the first lesson. Forwards it is
  cited by name in L2 (the derivative's limit), L3 (the Riemann limit), L4 (both),
  and `improper-integrals` (limits at infinity).
- **Assessment:** 2 check, 5 drill, 3 transfer; **recall capped at one item**
  (`lim-symbolic-recognition`). Every graded item uses a function the guided scene
  does not animate, except the continuity test, whose point is that it is the
  scene's punctured parabola.
- **Retention (D12):** the irrelevance of the point value — the fact most likely
  to decay and the one L2 depends on.
- **Forward obligation:** `fundamental-theorem` cites `modulus-of-continuity` **by
  name** at its uniformity step, so this lesson must introduce it. Dropping the
  modulus content here would leave L4's proof hand-waving.
- **Forward:** L2 (`derivative-local-linearity`), L3 (`integral-accumulation`),
  L8 (`improper-integrals`).

## 1g. Correctness & scope
- **Correctness checks:** every displayed value comes from a pure helper in the
  new `src/math/calculus.ts` — difference quotients, shrinking-interval tables,
  and the piecewise sample functions. Property tests: the tabulated quotients for
  `ex-parabola` converge to \(6\) and match \(6+h\) exactly for \(h\neq0\); the
  punctured function and the original agree off the point; the jump function's
  one-sided limits differ; \(\sin(1/x)\) leaves any candidate band infinitely
  often within every window (asserted on a sampled witness, not claimed as a
  proof); the continuity predicate agrees with the three-part test on every
  fixture.
- **Scope exclusions:** \(\varepsilon\)–\(\delta\) proof production; limits at
  infinity (`improper-integrals`); L'Hôpital; sequences (`sequences-limits`); a
  **proof** that continuity on a compact interval is uniform — the modulus is
  defined and used, its existence there is stated with attribution; the
  intermediate and extreme value theorems (the extreme-value fact is used inside
  `fundamental-theorem`'s squeeze without being christened).
- **Abstraction return:** §14 of the insight contract; the closing exercise
  requires citing continuity, with no reference to the speedometer.

## 6. Acceptance record (Gate 8)

> **Gate 8 is scoped to this lesson's own outcomes.** Per
> [mastery-standard §9](../../../../authoring/mastery-standard.md#9-workflow-integration),
> it confirms that every **lesson-owned** core outcome is independently
> demonstrated with real in-lesson evidence, and that module-owned outcomes are
> carried forward as planned Gate-9 obligations. Open Gate-9 obligations are the
> normal state of an accepted lesson and do **not** block Gate 8.

**Status: PASSED** for `limits-continuity`, on the built lesson
(`src/lessons/limitsContinuity.ts`), 2026-07-28.

- [x] Insight contract linked and `Gate result: PASS`.
- [x] All §1 fields filled.
- [x] Outcomes operational, owner-marked, evidence-paired.
- [x] **Every lesson-owned outcome that is *claimed* is independently
      demonstrated by a real, auto-graded, in-lesson item.** The two outcomes
      that are *not* independently demonstrated are recorded in §1e as
      recognition (`lim-symbolic-recognition`, E1) and as practised-only
      (graph reading) rather than being claimed.
- [x] No lesson-owned outcome accepted on planned module evidence.
- [x] **No claim exceeds its capability ceiling.** One E4 claim, on
      `construct-in-explorer` (ceiling E4). Every `exercise-sequence` item is
      claimed at E3 or below. Asserted by
      `src/lessons/__tests__/limitsContinuityGradingContract.test.ts`.
- [x] **Every claimed evidencing item captures what the outcome says.** The two
      that did not are fixed: `lim-diagnose-definition` no longer claims graph
      reading, and `lim-zero-over-zero-fresh` now elicits the agreeing
      expression before its value.
- [x] Assessment set matches §1f; recall capped at one; three transfer-tier items.
- [x] Module-owned outcomes carried forward as Gate-9 obligations *(open by
      design; not a Gate 8 blocker)*.
- [x] Forward edges recorded.
- [x] Retention hook recorded.
- [x] Correctness gate passed (`src/math/__tests__/calculus.test.ts`, 40 assertions).
- [x] Grading contracts registered for all ten items
      (`limitsContinuityGradingContract.test.ts`, 85 assertions), each
      `mustReject` pinning one regression class.
- [x] Guided-scene hard gates pass; chapter seeking covered.
- [x] Browser spec passes (`e2e/lesson-limits-continuity.spec.ts`).

**Not in scope of this gate, and open:** Gate 9 for the `calculus-foundations`
module. The `mod-calcfound-*` items in §1d are unbuilt by design.

### Correction history

An earlier version of this record was left unticked with the note "nothing is
built" **after** the lesson had shipped, and claimed E4 for three
`exercise-sequence` items whose ceiling is E3. Both were review findings, and
both are corrected above rather than argued.
