# Lesson Mastery Contract — The integral as accumulation (spine L3)

Gate 5 for **`integral-accumulation`**, after [insight.md](insight.md) reached `PASS`.

## 1a. Placement & upstream links
- **Spine:** L3, unit `calculus-foundations`, third lesson of Package A.
- **Profile:** P2 primary. No P3 bar: integrability is restricted to continuous
  integrands on closed bounded intervals, declared rather than proved.
- **Insight contract:** [insight.md](insight.md) — `PASS`.
- **Concepts introduced:** `riemann-sum`, `definite-integral`. **Reused:**
  `limit`, `continuity` (L1).
- **Deliberate non-dependency:** this lesson does **not** use `derivative`. L2
  precedes it in the spine for L4's sake, not because L3 needs it.

## 1b. Role, bridge, need
- **Role:** supplies the second of the two objects L4 will connect, and supplies
  it in a form (limit of weighted sums, with units) that M4–M7 reuse unchanged for
  inner products, Fourier coefficients, transforms, and line integrals.
- **Retrieve:** L1's forced value; L1's continuity as the guarantee that a short
  enough piece has a nearly constant rate.
- **Bridge from L2:** L2 read the speedometer. This lesson reads the odometer.
- **Motivating need:** *You know how fast it was going at every instant. How far
  did it go?*

## 1c. Content to teach
- **Definitions (D2):** partition and mesh; Riemann sum; the definite integral as
  the limit; the running total \(A(x)=\int_a^x f\).
- **Objects:** `ex-drive` (speed → distance, including a reversing segment);
  `ex-parabola` on \([0,2]\), total exactly \(8/3\); a constant rate (the collapse
  case); a current-against-time trace for transfer.
- **Procedures (D3):** partition and estimate from a graph or a table; decide
  whether an estimate is high or low **and say why**; compute \(\int_0^2 x^2\)
  from the sum identity; read a running-total graph against its rate graph.
- **Results (D5):** the integral of a rate carries the product units; the integral
  is signed; the value is independent of the graph's drawing scale; left and right
  sums bracket the answer **for a monotone integrand**. **Explicitly denied:** that
  integrals are areas in square units; that they are non-negative; that left/right
  sums bracket in general.
- **Proof depth (D6):** §7's sum, limit, and \(1/n\) bracket are **derived on
  screen** for `ex-parabola`. No general integrability proof.
- **Representations (D4):** partitioned rate graph with per-rectangle unit labels
  (visual); a sum table against \(n\) (numeric); \(\lim\sum f(x_i^\*)\Delta x_i\)
  (symbolic); "the total of a rate" (verbal); the odometer (applied).
- **Translations:** rectangle ↔ (rate)(width) product; running total ↔ odometer;
  negative rate ↔ falling total; refinement ↔ L1's forced value.
- **Edge/degenerate cases (D7):** negative rate; a rate changing sign so the total
  can end below its own maximum; a constant rate, where the construction must
  visibly collapse to rate × time; a coarse partition giving a poor estimate;
  a non-monotone rate, where bracketing fails.
- **Misconceptions (D13):** M1–M6 of [insight §Prerequisites](insight.md#prerequisites-limitations-likely-misconceptions).

## 1d. Outcomes with evidence

| Outcome | Dim | Owner | Level | Evidence | Attainment |
| --- | --- | --- | --- | --- | --- |
| State what an integral computes in an unfamiliar applied setting, **with units**, before computing | D4/D13 | lesson | E3 | `int-units-fresh` (`text`, produced; axes given, no journey) | independently demonstrated |
| Estimate an integral from a fresh table by partitioning, and say whether the estimate is high or low with a reason | D3 | lesson | E3 | `int-estimate-table` (`exercise-sequence`: sum → verdict → typed reason) | independently demonstrated |
| Compute \(\int_0^2 x^2\) from the Riemann sum, with no antiderivative available | D3/D6 | lesson | E3 | `int-parabola-from-sum` (`exercise-sequence`: \(S_n\) → limit) | independently demonstrated |
| Predict the sign of an integral from the rate, and explain a total ending below its own maximum | D5/D9 | lesson | E4 | `int-signed-transfer` (current trace going negative) | independently demonstrated |
| Read a running-total graph against its rate graph: rising, falling, flat, steepest | D4 | lesson | E3 | `int-read-running-total` (`exercise-sequence` over four marked points) | independently demonstrated |
| Explain why redrawing the graph at another scale does not change the integral | D5/D13 | lesson | E4 | `int-scale-invariance` (`text`, produced) | independently demonstrated |
| Recognise the construction in a different meter (current → charge, power → energy) | D4/D10 | lesson | E3 | `int-same-machine` (`exercise-sequence`, units in both settings) | independently demonstrated |
| Identify where left/right bracketing **fails** | D7 | lesson | E4 | `int-bracket-fails` (`multiple-choice` over four rate graphs; correct = the non-monotone one) | **recognition — recorded as E2, not claimed E3** |
| Retain "the integral is signed" under delayed retrieval | D12 | **module** | E3 | `mod-calcfound-retain-signed` (module `calculus-foundations`, Gate 9) | **not built** — Gate 9 open |
| Integrate accumulation with the derivative on a mixed item | D10 | **module** | E5 | `mod-calcfound-mixed-rate-total` (module `calculus-foundations`, Gate 9) | **not built** — Gate 9 open |

**Transfer:** three D9/E4 outcomes (`int-signed-transfer`, `int-scale-invariance`,
`int-bracket-fails`).

## 1e. Coverage status
Taught: all of §1c. Practiced: every lesson-owned outcome. Independently
demonstrated: all lesson-owned outcomes except `int-bracket-fails`, honestly
recorded as **recognition (E2)** — the learner selects the failing graph rather
than constructing a counterexample, which would need machinery this lesson does
not have.

## 1f. Connections, assessment, retention
- **Cumulative (D10):** L1's forced value cited by name at the refinement beat;
  `ex-drive` in its third role; `ex-parabola` reused so the arithmetic is familiar.
  **No L2 connection is drawn** — deliberately, so L4 can draw it.
- **Assessment:** 2 check, 3 drill, 3 transfer; **recall capped at one**
  (`int-bracket-fails`). Every graded item uses a rate the guided scene does not
  animate, except `int-read-running-total`, whose point is that it is the scene's
  own drive trace.
- **Retention (D12):** the signedness of the integral.
- **Forward:** **L4** (the running total's shortcut — the question this lesson
  deliberately leaves open), L7, L8, L15, L17, L18, L29, L31.

## 1g. Correctness & scope
- **Correctness checks:** every sum, estimate, and running total comes from
  `src/math/calculus.ts`. Property tests: \(S_n\) for `ex-parabola` matches
  \(\frac43\cdot\frac{(n+1)(2n+1)}{n^2}\) exactly; left and right sums differ by
  \(8/n\) and bracket \(8/3\); on a **non-monotone** fixture the bracketing
  assertion is required to *fail*, so the restriction is tested rather than
  trusted; the constant-rate fixture returns rate × duration for **every** \(n\);
  the running total's plotted values equal the partial sums; sign is preserved
  through the reversing segment.
- **Units invariant:** every rendered rectangle carries its product units, and the
  displayed total's units are derived from the axes rather than hard-coded. A test
  asserts that changing the fixture's declared axis units changes the readout.
- **Scope exclusions (hard):** the **antiderivative** — absent from prose, scene,
  explorer, exercises, and depth layers; the Fundamental Theorem (L4); integration
  techniques (L7); improper integrals (L8); general integrability; area for its
  own sake. An implementer working from habit is most likely to violate the first
  of these, so it is also listed in the package ledger's review checklist.
- **Abstraction return:** insight §14; evidenced by `int-units-fresh`, which
  supplies axes and no story.

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

**Gate 8 readiness (assessed at planning time):** every lesson-owned outcome in
§1d has a real, in-lesson, auto-graded evidencing item, and each recorded
recognition-level outcome is declared at their honest level rather than being
claimed as demonstrations. **No structural obstacle to Gate 8 exists.** The
checkboxes below are unticked because the lesson is not built, not because
anything is missing from the plan.

- [ ] Insight contract linked and `PASS` — **linked; PASS recorded.**
- [ ] All §1 fields filled.
- [ ] Outcomes operational, owner-marked, evidence-paired.
- [ ] **Every lesson-owned** core outcome independently demonstrated, with the
      recorded recognition-level exceptions declared as such.
- [ ] No lesson-owned outcome accepted on planned module evidence.
- [ ] Assessment set matches §1f; recall capped; transfer items present.
- [ ] Module-owned outcomes carried forward as Gate-9 obligations *(open by
      design; not a Gate 8 blocker)*.
- [ ] Forward edges recorded; **the L4 question left open on purpose**.
- [ ] Retention hook recorded.
- [ ] Correctness gate passed, including the failing-bracket test and the units invariant.
- [ ] **Antiderivative-absence check**: grep the built lesson for antiderivative /
- [ ] Grading contract + `ITEM_ASSESSMENT_META` registered for every auto-graded item.

*(Unticked because nothing is built. Gate 8 is an implementation gate; this
contract is Gate 5.)*
