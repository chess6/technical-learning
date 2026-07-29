# Insight Discovery Brief — The Fundamental Theorem of Calculus (spine L4)

Stage 1 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md)
for `fundamental-theorem`. This is the **flagship lesson of Package A** and the
lesson the whole course's architecture rests on.

Spine row: [course-spine §4](../../course-spine.md#4-the-spine-at-a-glance), L4.

---

## 1a. Diagnose the cognitive obstacle

**Primary: there is nothing left to be surprised by.** In the standard ordering
the antiderivative is introduced *as* the meaning of \(\int\), so by the time the
Fundamental Theorem is stated it is a restatement of a definition. Learners
therefore acquire the theorem as **two labelled statements to keep straight**
("part 1 is the one with the derivative on the outside") and never register that
anything was claimed. The observable symptom: a learner who can apply
\(\int_a^b f = F(b)-F(a)\) fluently and cannot say what would be surprising about
it, or what would go wrong if it were false.

This course cannot afford that, because the FTC is not a computational
convenience here — it is the **template** the course reuses three more times:

| Later | Reuses |
| --- | --- |
| L8 improper integrals | evaluate at endpoints, then take a limit in one of them |
| L7 → L18, L24 | **Theme 2**: integration by parts is C9 plus a product, and its *boundary term* is what turns \(d/dt\) into multiplication in both transforms — and in Laplace, what carries the initial conditions |
| **L34 Green's theorem** | **Theme 1**: the identical cancellation argument, one dimension up |
| **L36 Stokes, L37 divergence** | **Theme 1**, on a surface and on a solid |

A learner who received the FTC as a definition has no argument to generalize when
Green's theorem arrives, and Green's theorem then becomes a fourth thing to
memorize — which is exactly the failure this course exists to avoid.

**Secondary: the collapse itself is not felt.** Even where the theorem is proved,
the *astonishing* part is passed over: an integral is a limit of sums with
unboundedly many terms, and the theorem replaces it with **two evaluations**.
Learners rarely register that infinitely many contributions have gone somewhere.

**Tertiary: two parts, no relationship.** The two halves are usually presented as
a numbered pair. Their actual relationship — one says accumulation then
measurement returns the original, the other says measurement then accumulation
returns the change — is a symmetry that makes them a single idea.

**Not the obstacle:** applying the theorem. That is easy, and a learner who has
been taught nothing else will still pass a computational exam. The obstacle is
that they will be unable to do anything with it in M6 or M7.

---

## 1b. Raw leads

| # | Lead | Mechanism |
| --- | --- | --- |
| R1 | **Telescoping.** Write the total change as a sum of small changes; interior endpoints appear twice with opposite signs and cancel; only the ends survive. | Structural compression |
| R2 | **Pick up L3's loose end.** L3 observed that the running total rises fastest where the rate is highest and stopped. This lesson explains it. | Predictive reorganization |
| R3 | **The two instruments finally agree** — and now it is a theorem, not a belief. Three lessons of `ex-drive` were the setup. | Semantic grounding |
| R4 | **A(x) grows by f(x)·h.** Over a short step, the running total gains one thin rectangle; divide by \(h\) and it *is* the rate. | Representational change |
| R5 | **Infinitely many terms, two survivors** — dramatize the count: \(n\) contributions, \(n-1\) cancellations, 2 evaluations. | Structural compression |
| R6 | **The two parts are one symmetry**: accumulate-then-measure, measure-then-accumulate. | Structural compression |
| R7 | **The constant does not matter** because the difference kills it — and this is *why* \(+C\) is harmless. | Predictive reorganization |
| R8 | **Existence without a formula.** \(A(x)\) exists for every continuous \(f\), even when no elementary antiderivative does (\(e^{-x^2}\)). The theorem is about existence, not about a recipe. | Predictive reorganization |
| R9 | **The template for Green's.** Say out loud that this argument will be re-run over a region, with loops instead of intervals. | Structural compression |
| R10 | **Local linearity is the engine.** \(F(x_{i+1})-F(x_i)\approx F'(x_i)\Delta x\) is L2's C5, used verbatim. | Structural compression |
| R11 | **Falsification**: what would the world look like if the theorem were false? The odometer and the speedometer would disagree. | Predictive reorganization |
| R12 | **A staircase**: total rise = sum of step heights = top minus bottom. The theorem, with no calculus at all. | Semantic grounding |

---

## 1c. Consulted packages

### P1 — "Interior contributions telescope; only the boundary survives" *(R1, R5, R10, R12)*
The theorem's **mechanism**, made visible: chop, write the total change as a sum
of small changes (an identity, with no calculus in it), approximate each small
change by L2's local-linear model, and watch every interior evaluation cancel
against its neighbour. What is left is two numbers.
**Delivers:** the reason the collapse happens, the compression that makes it feel
astonishing, and — decisively — an argument that is **re-runnable in two
dimensions**, which is what L34 needs.

### P2 — "Accumulate, then measure, and you get back what you started with" *(R2, R4, R6)*
The other half: define \(A(x)=\int_a^x f\), ask how fast it grows, find it grows
by one thin rectangle per step, so \(A'=f\). Then observe that the two halves are
one symmetry rather than a numbered pair.
**Delivers:** the first part of the theorem, the resolution of L3's deliberate
loose end, and the unification of the pair.

### P3 — "The two instruments were never going to disagree" *(R3, R11)*
The applied reading: the odometer's change equals the accumulated speedometer.
Falsify it — imagine they disagreed — and see that something impossible would
follow.
**Delivers:** the motivation, the payoff of three lessons of setup, and a
falsification the learner can reason about.

### P4 — "Existence, not a recipe" *(R7, R8)*
\(A(x)\) exists for every continuous \(f\); \(+C\) cancels in the difference;
\(e^{-x^2}\) has an antiderivative that no elementary formula names.
**Delivers:** correctness and a guard against the misconception that the theorem
is a computing rule — but it is a set of caveats, not a reframe.

### P5 — "The template" *(R9)*
Name, at the close, that this argument will be re-run over a region, a surface,
and a solid — **Theme 1** of the course's two structural themes.
**Delivers:** half the course's architecture — but it is a promise about lessons
30 nodes away.

---

## 1d. Ranking

| Rank | Package | Why |
| --- | --- | --- |
| **1** | **P1** | It is the only candidate that supplies a **transferable argument**. The diagnosed obstacle is that learners get a statement instead of a mechanism, and the cost is paid in L34. Telescoping is the mechanism, it is visual, it is exactly reusable, and it makes the collapse feel like something happened. |
| 2 | P2 | Indispensable — it is half the theorem and it closes L3's open question. But on its own it explains the *first* part and leaves the computational miracle unexplained. Adopted as the first half of the causal chain and the first clip. |
| 3 | P3 | The best opening, and the payoff of a three-lesson setup. Adopted as the motivating need and the falsification checkpoint. |
| 4 | P4 | Required for honesty; adopted as obligations inside the chain (C10, C11) and one graded item. Not a reframe. |
| 5 | P5 | Adopted as one closing sentence and a `looking-ahead` layer. Deliberately **not** developed — a promise the learner cannot yet evaluate should not be sold as an insight. The second structural theme (representation change) is **not** previewed here at all: it has no instance the learner has met. |

**Selected:** **P1 primary**, with **P2** as the chain's first half and first clip,
**P3** as the opening and the falsification, **P4** as correctness obligations,
**P5** as one sentence.

> **Why not lead with P2** (the more common choice)? Because \(A'=f\) is the part
> that feels *plausible* — the running total obviously grows faster when the rate
> is higher — and the part that feels **impossible** is that a limit of unbounded
> sums equals a two-point difference. Leading with the plausible half spends the
> lesson's surprise before it is earned, and, decisively, \(A'=f\) does not
> generalize to Green's theorem while telescoping does.

---

## 1e. Continuity decision recorded here

- **Canonical examples:** `ex-drive` in its **fourth and final** appearance — the
  two instruments, now proved to agree. `ex-parabola` supplies the arithmetic
  check: L3 computed \(\int_0^2 x^2 = 8/3\) from the sum with no antiderivative;
  this lesson recomputes it as \(F(2)-F(0)\) and the two must be *seen* to match.
  That agreement is the strongest possible evidence, and it exists only because
  L3 refused the shortcut.
- **Reuses:** `accumulation-strip` (L3) and `function-plot` (L1).
- **Creates:** `telescoping-cancellation`, whose entire purpose is to be re-run in
  L34. It must therefore be built parameterized over "what cancels against what",
  not hard-coded to intervals.
- **Withheld deliberately:** integration technique (L7 — this lesson finds
  antiderivatives only for \(x^n\) by inspection); improper limits (L8);
  substitution in definite integrals (L7).
- **Package A closes here.** The four lessons form a complete arc — a rate, its
  meaning, its total, and the theorem that binds them — and a learner who stops
  after Package A has learned something whole.
