# Insight Discovery Brief — The derivative as local linearity (L2)

Stage 1 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md)
for `derivative-local-linearity`.

Spine row: [course-spine §4](../../course-spine.md#4-the-spine-at-a-glance), L2.

---

## 1a. Diagnose the cognitive obstacle

**Primary: fragmentation.** The derivative is routinely delivered as three
descriptions plus a rulebook:

- "the instantaneous rate of change",
- "the slope of the tangent line",
- "the best linear approximation",

and then a table of \(x^n \mapsto nx^{n-1}\). Learners hold the three descriptions
as **three separate facts about one symbol** — recited in the order they were
taught, never used interchangeably. The observable symptom: a learner who can
differentiate a polynomial cannot say why a *rate* should be a *slope*, and does
not reach for linearization when a problem calls for it.

This matters far past L2. The entire course rests on the derivative being usable
in whichever of its three costumes a situation offers:

| Later lesson | Costume it needs |
| --- | --- |
| L6 FTC | rate (accumulating a rate; \(A'(x)=f(x)\)) |
| L6 telescoping | approximation (\(F(x_{i+1})-F(x_i)\approx f(x_i)\Delta x\)) |
| L4, L19 | approximation (linearization; small-oscillation arguments) |
| L18 ODEs | rate (an equation *about* the rate) |
| L22 gradient | slope, in each of several directions |

A learner holding three unrelated facts will be blocked at least twice.

**Secondary: a false and load-bearing definition of "tangent".** School geometry
supplies "a tangent touches the curve at one point and does not cross it" — true
for circles, false for graphs. It fails at every inflection point, and it makes
the tangent a *global* object when the derivative is irreducibly **local**.

**Tertiary: the rulebook arrives before the meaning**, so differentiation becomes
a symbol game and the learner has no way to tell a plausible answer from a wrong
one.

**Not the obstacle:** computing derivatives. That is easy and the learner will get
it. The obstacle is knowing what has been computed.

---

## 1b. Raw leads

| # | Lead | Mechanism |
| --- | --- | --- |
| R1 | **Zoom until it's a line.** Magnify the graph at a point; a smooth curve becomes visually straight. The derivative is that line's slope. | Representational change |
| R2 | The three descriptions are **one object**: the zoom produces a line, a line has a slope, a slope is a rate, and the line is the approximation. | Structural compression |
| R3 | **The Earth is flat locally.** Curvature is invisible at human scale — a familiar, physically true instance of the same fact. | Semantic grounding |
| R4 | **Error, not agreement, is the criterion.** The tangent is not "the line that touches"; it is the line whose error shrinks *faster than* the step. Every other line's error is proportional to the step. | Predictive reorganization |
| R5 | The derivative is the **1×1 matrix** of the best linear map — the columns rule (LA L2) with one column of one entry. | Structural compression |
| R6 | **Secants converging**: the classic animation, secant → tangent as \(h\to0\). | Representational change |
| R7 | **Where the zoom fails, the derivative fails.** \(\lvert x\rvert\) at 0 never becomes a line however far you magnify — visible non-differentiability. | Predictive reorganization |
| R8 | **The speedometer, resumed.** L1 established the number exists; L2 says what it is the slope of. | Semantic grounding |
| R9 | A derivative is **a function, not a number** — the slope read at every point, plotted. | Representational change |
| R10 | **Units are the disambiguator.** m/s is a rate; rise/run is a slope; they are the same reading of the same graph. | Semantic grounding |
| R11 | The rulebook **derived from the zoom** rather than asserted: \(x^2\)'s slope at \(x\) is \(2x\) because that is the line the zoom produces. | Structural compression |
| R12 | Differentiability implies continuity — the zoom cannot flatten a break. | Predictive reorganization |

---

## 1c. Consolidated packages

### P1 — "Zoom far enough and it *is* a line" *(R1, R3, R7, R12)*
Local linearity as the definition of what a derivative is *about*: the derivative
is the slope of the line a smooth curve becomes under magnification, and where no
line appears there is no derivative.
**Delivers:** the meaning, the visible failure mode, and a genuine reason the
tangent is local.

### P2 — "Three names, one object" *(R2, R5, R9, R10)*
Rate, slope, and best linear approximation collapse into one thing: the zoom
produces a line; the line has a slope; the slope is the rate; the line is the
approximation. Includes the linear-algebra reading (a \(1\times1\) matrix) and the
units argument.
**Delivers:** the fix for the actual diagnosed obstacle.

### P3 — "The tangent is the line whose error decays faster" *(R4)*
Replaces "touches at one point" with a criterion that is true, checkable, and
survives inflection points: every line through the point has error \(O(h)\); the
tangent alone has error \(o(h)\).
**Delivers:** correctness, and the exact fact L6's telescoping step needs.

### P4 — "The derivative is a function" *(R9, R11)*
The slope read at every point and plotted; the rules derived rather than asserted.
**Delivers:** the object L5/L6 will accumulate — but it is a consequence, not a
reframe.

---

## 1d. Ranking

| Rank | Package | Why |
| --- | --- | --- |
| **1** | **P2** | It targets the diagnosed obstacle exactly. Fragmentation is the problem; compression into one object is the cure. Nothing else on the list changes what the learner can *do* as much. |
| 2 | P1 | The **mechanism** that makes P2 true and visible — without the zoom, "three names, one object" is another thing to be told. Adopted as the primary's engine and its opening beat. |
| 3 | P3 | The correctness backbone, and the single fact L6 will consume. Adopted as an obligation *inside* the primary rather than as a separate package, because on its own it reads as a technicality. |
| 4 | P4 | True and necessary, but a consequence. Adopted as the closing beat and the hand-off to L5/L6. |

**Selected:** **P2 primary**, with **P1** as its mechanism and opening, **P3** as a
required obligation in the causal chain, **P4** as the close.

> **Anti-decoration check on R3 (the flat Earth).** Kept, because it is not a
> re-skin: it is a *true instance* of the same mathematics that the learner
> already believes, and it makes "locally straight" a claim about the world
> rather than about graphs. Its limits are named in the contract (the Earth is a
> sphere with known curvature; a graph's curvature varies point to point).

---

## 1e. Continuity decision recorded here

- **Canonical examples:** `ex-drive` continues from L1 — L1 established that the
  instantaneous speed exists; L2 says what it is the slope *of*. `ex-parabola`
  continues too, and its L1 arithmetic (\(6+h \to 6\)) is now re-read as the
  slope of a line.
- **Reuses:** `function-plot` from L1, with a secant/tangent overlay added.
- **Creates:** `local-linearity-zoom`, reused by L3 (two linked panels) and L22.
- **Cross-course hand-off:** the derivative as the \(1\times1\) matrix of the best
  linear map cites LA `transformations` (built) and prepares L22's Jacobian.
  Stated as a connection, **not** re-taught.
- **Withheld deliberately:** the full differentiation rulebook (product and
  quotient rules are stated for use, derived nowhere in Package A; the chain rule
  is L3's whole subject); implicit differentiation; higher derivatives beyond
  naming \(f''\) once.
