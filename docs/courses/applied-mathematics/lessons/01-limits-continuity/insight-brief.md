# Insight Discovery Brief — What "approaches" means (L1)

Stage 1 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md)
for `limits-continuity`, the first lesson of the applied-mathematics course after
the entry bridges.

Spine row: [course-spine §4](../../course-spine.md#4-the-spine-at-a-glance), L1.

---

## 1a. Diagnose the cognitive obstacle

**Primary: an incorrect prior model, reinforced by the procedure the learner was
taught.** Almost every learner arrives with:

> *"A limit is what you get when you substitute. If substituting breaks, cancel
> something first and then substitute."*

That model is not stupid — it works on every exercise a first course sets. But it
makes the limit a **repair procedure for broken algebra**, and it has three
consequences this course cannot survive:

1. **\(0/0\) reads as a dead end or a trick.** The derivative is going to be
   exactly \(0/0\), permanently and unavoidably. A learner who thinks \(0/0\)
   means "cancel first" will treat the derivative as an algebraic accident rather
   than a well-defined quantity.
2. **"Approaches" is read as motion.** The learner pictures \(x\) *travelling*
   toward \(a\) and asks "does it ever get there?" — a question the definition
   does not contain, and one that makes the strict inequality \(0<|x-a|\) look
   arbitrary.
3. **The value at the point feels relevant.** It is not. This is the single fact
   the whole lesson exists to install, because the derivative and the integral
   are both values *forced by the neighbourhood* of a point where the defining
   expression has no value at all.

**Secondary: notation with no operational content.** \(\lim_{x\to a}f(x)=L\) is
five symbols that describe no action. A learner who cannot say what would have to
be *checked* to confirm it cannot tell a true limit claim from a false one, and
so cannot detect their own error later.

**Not the obstacle:** epsilon–delta proof writing. This is a P2 applied course.
The learner needs the *content* of the guarantee, not the quantifier discipline.

---

## 1b. Raw leads

| # | Lead | Mechanism |
| --- | --- | --- |
| R1 | A limit is a **challenge–response game**: you name a tolerance on the output, I name a window on the input. The limit exists iff I can always answer. | Operational grounding |
| R2 | The **speedometer paradox**: average speed needs an interval; an instant has no interval; yet the needle reads a number. What determines it? | Semantic grounding |
| R3 | **Puncture the graph.** Delete the point. The limit is unchanged. Therefore the value at the point was never part of the question. | Representational change |
| R4 | **Zoom**: a limit is what you see as you magnify toward \(a\). Directly foreshadows L2. | Representational change |
| R5 | **Two bands**: a horizontal band of half-height \(\varepsilon\) around the candidate \(L\), and a vertical window of half-width \(\delta\) around \(a\). The claim is "the graph inside the window stays inside the band." | Representational change |
| R6 | **Continuity as a sampling guarantee**: if a function is continuous you may sample it and interpolate; if not, something can hide between your samples. | Predictive reorganization |
| R7 | **The failure catalogue is the definition.** Jump, removable, oscillation, blow-up — four ways to lose the game, each diagnosable from the picture. | Predictive reorganization |
| R8 | Limits as the operation that **manufactures new quantities** (speed, density, slope) that no finite measurement gives you. | Semantic grounding |
| R9 | Left and right limits as **two separate games**; the limit exists iff both are winnable with the same answer. | Structural compression |
| R10 | \(0/0\) is not an answer but a **question in disguise**: "which of the two zeros wins the race?" | Predictive reorganization |
| R11 | A limit is a **prediction from the neighbours**, like reading a gauge whose needle is hidden behind a pin. | Semantic grounding |
| R12 | Continuity as "**the graph can be drawn without lifting the pen**" — the familiar slogan, kept only to be *refuted* as a definition (it is a theorem-ish consequence for nice functions and false as a criterion). | Anti-decoration control |

---

## 1c. Consolidated packages

### P1 — "A limit is a value the neighbours *force*" *(R1, R3, R5, R10, R11)*
The limit is defined by a **guarantee**: name any tolerance and a window exists
within which the guarantee holds. Because only the neighbourhood is consulted,
the value at the point is irrelevant — and so a quantity can be perfectly
well-defined at a point where the defining expression is \(0/0\).
**Delivers:** the operational content, the irrelevance of the point value, and
the reinterpretation of \(0/0\).

### P2 — "The speedometer has a reading and the formula does not" *(R2, R8)*
Open on a genuine contradiction the learner already believes both halves of: a
car has a speed at an instant, and the speed formula needs an interval. Resolve
it with P1's machinery.
**Delivers:** motivation and an application anchor that runs through L2, L5, L6.

### P3 — "Continuity is the promise that nothing hides between samples" *(R6, R7, R12)*
Continuity reframed from "no pen lift" to a **usable guarantee**: sampling and
interpolating is honest exactly when the forced value equals the actual value.
**Delivers:** the payoff, and the property L2/L5/L6 will silently rely on.

### P4 — "Zoom is the limit you can see" *(R4)*
Magnification as the visual form of the limit process.
**Delivers:** continuity with L2 — but on its own it teaches a picture, not a
definition, and it *anticipates* L2's insight rather than owning one.

---

## 1d. Ranking

| Rank | Package | Why |
| --- | --- | --- |
| **1** | **P1** | The only candidate that changes what the learner *checks*. It converts "substitute and hope" into "can the guarantee be met?", which is the model every later lesson needs. Directly disarms the \(0/0\) obstacle. |
| 2 | P2 | The best *opening* but not a self-standing insight — it poses the question P1 answers. **Adopted as the motivating need, not the primary insight.** |
| 3 | P3 | The correct *closing* move and a genuine reframe, but it is downstream of P1 (continuity is defined using the limit). **Adopted as the lesson's consequence and its forward hook.** |
| 4 | P4 | Real, but it is L2's insight. Using it here would spend L2's payoff a lesson early and leave L1 without one. **Deliberately withheld** — L1 shrinks the *interval*, L2 magnifies the *picture*. |

**Selected:** **P1 primary**, opened by **P2**, closed by **P3**. P4 explicitly
deferred to L2.

---

## 1e. Continuity decision recorded here

- **Canonical example:** `ex-drive` (a velocity trace with its matching position
  trace) supplies P2's opening and will recur in L2, L5, and L6. Introducing it
  here means the course's central FTC demonstration is set up four lessons in
  advance on an object the learner already trusts.
- **Second example:** `ex-parabola` (\(f(x)=x^2\)) for the hand-checkable
  arithmetic, also recurring through L6.
- **Visualization family:** this lesson **creates** `function-plot` (see
  [architecture §5](../../curriculum-architecture.md#5-reusable-visualization-families)),
  which six later lessons reuse. Its cost is family construction, not a bespoke
  scene, and the family must be built parameterized from the start.
- **Withheld deliberately:** \(\varepsilon\)–\(\delta\) *proof writing*; limits at
  infinity (L8 owns them, where they are load-bearing); L'Hôpital (needs the
  derivative, and would re-teach \(0/0\) as a trick).
