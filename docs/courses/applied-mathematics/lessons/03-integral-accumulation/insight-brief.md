# Insight Discovery Brief — The integral as accumulation (Package A, spine L3)

Stage 1 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md)
for `integral-accumulation`.

Spine row: [course-spine §4](../../course-spine.md#4-the-spine-at-a-glance), L3.

---

## 1a. Diagnose the cognitive obstacle

**Primary: an over-specific prior model — "the integral is the area under the
curve."** This is the standard first sentence, and it costs more than it gives:

1. **It types the integral as a geometry tool.** The learner is then bewildered
   when the same symbol computes distance, work, charge, mass, probability, an
   average, an inner product, or a Fourier coefficient. Those are not "areas", and
   a learner who believes integration is about area has to be told, repeatedly,
   that this one is an exception. In this course the integral is *never again*
   used for area after this lesson — it is used for totals, projections, and
   transforms.
2. **It has no units.** "Area under a velocity graph" is a number of squares.
   \(\text{m/s} \times \text{s} = \text{m}\) is a distance. Only the second reading
   tells the learner what they have computed, and only the second survives when
   the axes are current and time, or frequency and amplitude.
3. **It hides why the answer is a limit.** Area feels like something a region
   *has*, already, waiting to be measured. A total accumulated from a varying rate
   is something you must *construct*, and its construction is a limit — which is
   the honest situation.

**Secondary: the antiderivative usually arrives first.** In most treatments
\(\int\) is introduced as "the opposite of \(\frac{d}{dx}\)", and the definite
integral is defined *by* the antiderivative. That ordering is fatal to this
course: it makes the Fundamental Theorem a **definition rather than a theorem**,
so L4 has nothing to prove and the learner never experiences the compression that
the whole course is built on. This lesson must therefore contain **no
antiderivative at all** — a deliberate and slightly uncomfortable omission.

**Tertiary: signed contributions.** "Area" is non-negative; totals are not.
A negative rate must reduce the total, and the area model actively fights this.

**Not the obstacle:** computing Riemann sums. It is arithmetic and the learner
will manage it.

---

## 1b. Raw leads

| # | Lead | Mechanism |
| --- | --- | --- |
| R1 | **Total = rate × time**, then chop until the rate is nearly constant on each piece. | Semantic grounding |
| R2 | **The odometer**, resumed. L1 and L2 read the speedometer; this reads the odometer. The learner already believes the two agree. | Semantic grounding |
| R3 | **Units are the definition's fingerprint.** Each rectangle is (m/s)(s) = m. The total is metres. The picture is area only because we drew the rate. | Semantic grounding |
| R4 | **The rectangle is not a shape, it is a product.** Height = rate, width = duration, area = contribution. | Representational change |
| R5 | **Refinement animation**: rectangles narrowing, the total settling — L1's forced value again, on a new quantity. | Representational change |
| R6 | **Same machine, four meters**: velocity→distance, current→charge, power→energy, density→mass. One construction, four readings. | Structural compression |
| R7 | **Signed totals**: a negative rate walks the running total backwards. | Predictive reorganization |
| R8 | **The running total is a function**, not a number: \(A(x)=\int_a^x f\). | Representational change |
| R9 | **Deliberately withhold the antiderivative** so that L4 is a genuine surprise. | Structural (curricular) |
| R10 | Riemann sums as the **honest definition**; area as the *picture* of that definition. | Structural compression |
| R11 | **Over- and under-estimates bracket the answer**, so refinement is a squeeze, not a hope. | Predictive reorganization |
| R12 | An integral is a **weighted sum in the limit** — the shape L12's inner product and L15's transform both take. | Structural compression |

---

## 1c. Consolidated packages

### P1 — "An integral is the total of a rate" *(R1, R2, R3, R4, R6)*
The definite integral introduced as the construction that answers "I know how fast
it is happening at every instant; how much happened in total?" Rectangles are
*products* (rate × duration), not shapes, and the units prove it. Area is what
this construction looks like when the thing you drew is the rate.
**Delivers:** the correct type for the object, units that survive every later use,
and immunity to the "but this isn't an area" confusion in M4–M6.

### P2 — "The odometer and the speedometer" *(R2, R7, R8)*
Open on the pair of instruments the learner already trusts, and build the running
total as a second trace beneath the rate. Signed contributions arrive naturally
by reversing.
**Delivers:** the motivating need, the running-total function, and the setup that
makes L4's theorem land as a discovery rather than a definition.

### P3 — "Refine and it settles" *(R5, R10, R11)*
The limit machinery: partition, sum, refine; over- and under-estimates bracket the
answer and close on it.
**Delivers:** the honest definition and a second use of L1, on a quantity that is
not a slope.

### P4 — "The shape of every integral to come" *(R12)*
A definite integral is a limit of **weighted sums**, which is exactly the shape of
an inner product (L12), a Fourier coefficient (L14), and a transform (L15).
**Delivers:** the forward edge — but it is a claim about lessons the learner has
not met, so it cannot carry the lesson.

---

## 1d. Ranking

| Rank | Package | Why |
| --- | --- | --- |
| **1** | **P1** | Directly replaces the diagnosed wrong model with a right one that has the correct type and the correct units. Everything else in the lesson is machinery for it. |
| 2 | P3 | The honest definition, and the lesson is not correct without it — but on its own it is a construction, not an insight; it answers "how" and not "of what". Adopted as the primary's machinery. |
| 3 | P2 | The best opening and the source of the running-total function. Adopted as the motivating need and the closing beat. |
| 4 | P4 | True and important, and it is why this lesson is framed as "weighted sum" rather than "area" — but it is a forward promise. Adopted as one closing sentence and a `looking-ahead` layer, not as content. |

**Selected:** **P1 primary**, with **P3** as its machinery, **P2** as the opening
and the running-total close, **P4** as a single forward sentence.

> **Explicit curricular decision (R9).** The antiderivative does not appear in
> this lesson. Not in a footnote, not in an exercise, not in a "you may know…"
> aside. L4's entire value is that the connection is *discovered*; naming it here
> would spend it. This is recorded as a hard scope exclusion in the contract and
> is the single thing most likely to be violated by an implementer working from
> habit.

---

## 1e. Continuity decision recorded here

- **Canonical example:** `ex-drive` — third appearance, and now the *other*
  instrument. L1 read the speedometer at an instant; L2 said what that reading was
  the slope of; L3 accumulates it. In L4 the two traces are finally shown to be
  the same information, which is the payoff the three previous appearances have
  been buying.
- **Second example:** `ex-parabola` — its accumulation over \([0,2]\) is exactly
  \(8/3\), hand-checkable, and used in L4 as the arithmetic check on the FTC.
- **Creates:** `accumulation-strip` (partition, refinement, running total, units
  readout), reused by L4, L7, L8, L15, L29.
- **Reuses:** `function-plot` from L1 for the rate graph.
- **Withheld deliberately:** the antiderivative and all integration technique
  (L7); the FTC (L4); improper limits (L8); \(\int\) applied to area *for its own
  sake*, which this course never needs.
