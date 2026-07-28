# Lesson Mastery Contract — What "approaches" means (L1)

Gate 5 for **L1 `limits-continuity`**, after [insight.md](insight.md) reached `PASS`.

## 1a. Placement & upstream links
- **Spine:** L1, unit `change`, first lesson of Package A and of the course proper.
- **Profile:** P2 primary. **No P3 bar claimed** — \(\varepsilon\)–\(\delta\) proof
  *production* is explicitly out of scope; the learner reads and applies the
  guarantee, and does not write quantified proofs.
- **Insight contract:** [insight.md](insight.md) — `PASS`.
- **Concepts introduced:** `limit`, `continuity`. **Reused:** none from this
  course; entry assumptions only.
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
  symbols; one-sided limits (as the jump diagnostic only); continuity at a point.
- **Objects:** `ex-drive` (velocity trace); `ex-parabola` \(f(x)=x^2\) at \(x=3\);
  a punctured version of `ex-parabola`; a jump function; \(\sin(1/x)\) near 0;
  \(1/x^2\) near 0.
- **Procedures (D3):** decide from a graph whether a limit exists and name the
  failure mode; evaluate a \(0/0\) limit by exhibiting an expression agreeing off
  the point; check continuity at a point as a three-part test (value exists, limit
  exists, they agree).
- **Results (D5):** the value at the point never affects the limit; a limit may
  exist where the function is undefined; continuity licenses substitution.
  **Explicitly denied:** that a limit's existence implies continuity, and that
  "drawable without lifting the pen" is a definition.
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
| Decide from an unfamiliar graph whether a limit exists at a marked point, and name the failure mode when it does not | D3/D4 | lesson | E3 | `lim-diagnose-graph` (`exercise-sequence`, four fresh graphs, typed failure mode — not multiple choice) | independently demonstrated |
| State that altering or deleting the value at the point leaves the limit unchanged, and use it | D5/D13 | lesson | E3 | `lim-point-value-irrelevant` (`text`, produced) | independently demonstrated |
| Evaluate a fresh \(0/0\) limit by exhibiting an agreeing expression | D3 | lesson | E3 | `lim-zero-over-zero-fresh` (`numeric`, a quotient the scene never shows) | independently demonstrated |
| Apply the three-part continuity test at a point of a fresh piecewise function | D3/D2 | lesson | E3 | `lim-continuity-test` (`exercise-sequence`) | independently demonstrated |
| Reject "a limit exists ⇒ continuous" with a counterexample of their own | D7/D13 | lesson | E4 | `lim-limit-not-continuity` (`construct`, predicate-graded: any function with a removable discontinuity at the named point) | independently demonstrated |
| Decide whether changing one point could repair the limit, continuity, both, or neither | D9 | lesson | E4 | `lim-repair-transfer` (unfamiliar piecewise function) | independently demonstrated |
| Justify a substitution by citing continuity rather than habit | D4/D13 | lesson | E3 | `lim-why-substitution-works` (`text`) | independently demonstrated |
| Recognise the symbolic \(\varepsilon\)–\(\delta\) statement as the guarantee just used | D2 | lesson | E1 | `lim-symbolic-recognition` (`multiple-choice`) | **recognition only — recorded as E1, not claimed higher** |
| Retain "the point value is irrelevant" under delayed retrieval | D12 | **module** | E3 | `mod-change-retain-point-value` (module `change`, Gate 9) | **not built** — Gate 9 open |
| Integrate limits with the derivative on a later mixed item | D10 | **module** | E5 | `mod-change-limit-in-derivative` (module `change`, Gate 9) | **not built** — Gate 9 open |

**Transfer:** two D9/E4 outcomes (`lim-limit-not-continuity`, `lim-repair-transfer`).

## 1e. Coverage status
Taught: all of §1c. Practiced: every lesson-owned outcome. Independently
demonstrated: all lesson-owned outcomes except `lim-symbolic-recognition`, which
is honestly recorded as **E1 recognition** — the lesson does not claim the learner
can produce the quantified statement.

## 1f. Connections, assessment, retention
- **Cumulative (D10):** none backwards — this is the first lesson. Forwards it is
  cited by name in L2 (the derivative's limit), L5 (the Riemann limit), L6 (both),
  and L8 (limits at infinity).
- **Assessment:** 2 check, 4 drill, 2 transfer; **recall capped at one item**
  (`lim-symbolic-recognition`). Every graded item uses a function the guided scene
  does not animate, except the continuity test, whose point is that it is the
  scene's punctured parabola.
- **Retention (D12):** the irrelevance of the point value — the fact most likely
  to decay and the one L2 depends on.
- **Forward:** L2 (`derivative-local-linearity`), L5 (`integral-accumulation`),
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
  infinity (L8); L'Hôpital; sequences; uniform continuity; the intermediate and
  extreme value theorems (stated nowhere, needed nowhere in Package A).
- **Abstraction return:** §14 of the insight contract; the closing exercise
  requires citing continuity, with no reference to the speedometer.

## 6. Acceptance record (Gate 8)
- [ ] Insight contract linked and `PASS` — **linked; PASS recorded.**
- [ ] All §1 fields filled.
- [ ] Outcomes operational, owner-marked, evidence-paired.
- [ ] Lesson-owned core outcomes independently demonstrated, with the recorded
      exception (`lim-symbolic-recognition`, E1).
- [ ] Module-owned outcomes recorded as Gate-9 obligations.
- [ ] Assessment matches §1f; recall capped at one.
- [ ] Forward edges recorded.
- [ ] Retention hook recorded.
- [ ] Correctness gate passed (`src/math/__tests__/calculus.test.ts`).
- [ ] Grading contract + `ITEM_ASSESSMENT_META` registered for every auto-graded item.

*(Unchecked: Gate 8 is an implementation gate. Nothing here is built.)*
