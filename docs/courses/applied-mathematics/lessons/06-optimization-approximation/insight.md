# Approved Insight Contract — Deciding with the Derivative (spine L6)

Stage 2 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md),
selecting from [insight-brief.md](insight-brief.md), with Audits A and B.

Primary insight: **Package P1** — *at an interior point where \(f\) is
differentiable, \(f'(a)\neq0\) **refutes** a local extremum; \(f'(a)=0\) merely
**survives** that test. Interiorness and differentiability are the argument's two
hypotheses, and "a survivor need not win" is the failure of its converse — and
those three facts are what the three memorized warnings are really about.*
**P2** (existence, location, decision) is the architecture the refutation slots
into and the reason comparing candidates is valid at all; **P3** (a flat model
is silent, so the next rung must speak) carries the approximation half and the
bridge to L11; **P4** is the error-honesty guardrail on it.

---

## Primary insight (contents 1–11)

### 1. Diagnosed cognitive obstacle
**An incorrect prior mental model, held with high confidence** — "solving
\(f'(x)=0\) finds the maximum" — which is the **converse** of the theorem that is
actually true, patched with three warnings held as unrelated exceptions
(*check endpoints*, *check corners*, *a critical point may be neither*).
Secondarily, **missing purpose**: the learner cannot say what service the
derivative performs here, nor which step of the method would break on an open
interval.

### 2. Insight mechanism(s)
**Structural compression** (four memorized rules collapse into one argument's two
hypotheses plus the failure of its converse; the second-derivative test and
Taylor's next term become one object) driven by **predictive/causal reorganization** (a nonzero slope is not a
description but an *action* — a step that provably improves), with a light
**semantic grounding** (standing somewhere and stepping) whose own false
intuition is the misconception being broken.

### 3. Initial mental model
"To find the maximum, differentiate, set \(f'(x)=0\), and solve. The solutions
are the maxima and minima. Also — remember to check the endpoints, and watch out
for corners, and sometimes a critical point turns out to be neither."

### 4. Tension / redundancy
Three warnings, no reasons. A learner who believes \(f'(a)=0\) *detects* extrema
has no account of why endpoints need separate treatment, why \(\lvert x\rvert\)
has a minimum the method never proposes, or why \(x^3\) is proposed and rejected.
Worse, L2 already established what a derivative *is* — the best local linear
model, with a residual that decays faster than the step (L2 C5). If that is
really what it is, then what it can tell you about "is this the best point?"
ought to be answerable from that definition alone, and the answer ought to say
what it can and cannot decide. Instead the rule arrives as an equation to solve.

### 5. The model change

**A nonzero slope is an escape route, so the derivative's job here is
elimination.** By L2 C5, \(f(a+h)=f(a)+f'(a)h+E(h)\) with \(E(h)/h\to0\). If
\(m=f'(a)\neq0\), then once \(h\) is small enough the linear term **dominates**
the residual, so the sign of \(f(a+h)-f(a)\) is the sign of \(mh\) — and the
learner controls the sign of \(h\). Stepping one way strictly increases \(f\);
stepping the other way strictly decreases it. So \(a\) is neither a local
maximum nor a local minimum.

Run that everywhere and it **eliminates** points. What survives is a *candidate
list*, and the learner's belief changes from

> "\(f'(a)=0\) means \(a\) is a maximum or a minimum"

to

> "\(f'(a)\neq0\) means \(a\) is **not** one. \(f'(a)=0\) means only that this
> test had nothing to say. Surviving is not winning."

**Scope of the claim, stated precisely.** What refutes-only is *this test* — the
first-derivative condition evaluated at a single point. It is emphatically **not**
true that derivative information can never certify an extremum: a sign change of
\(f'\) across \(a\) certifies one, and this lesson's own C13 certifies one from
\(f''(a)\). The insight is that the *step from \(f'(a)=0\) to "extremum"* is
unlicensed — certifying takes a further argument, and the lesson supplies one.

The three warnings then stop being warnings, but they are not three of a kind.
Two are the argument's **hypotheses** — **both directions available** (fails at
an endpoint) and **a local model to argue with** (fails at a corner) — and the
third is the **failure of the converse**: nothing in a refutation endorses a
survivor (fails at \(x^3\)). Collapsing all three into "hypotheses" would be the
same imprecision, in the other direction.

### 6. Full causal chain

| # | Step | Depends on |
| --- | --- | --- |
| C1 | \(a\) is a **local maximum** of \(f\) on domain \(D\) if some window \(W\) around \(a\) has \(f(x)\le f(a)\) for every \(x\in D\cap W\); local minimum symmetric. A global extremum is in particular a local one. No derivatives yet. | Definition |
| C2 | \(f\) differentiable at \(a\): \(f(a+h)=f(a)+f'(a)h+E(h)\), \(E(h)/h\to0\). | **L2 C5** |
| C3 | **Escape-route lemma.** Let \(m=f'(a)\neq0\). Because \(E(h)/h\to0\), there is \(\delta>0\) with \(\lvert E(h)\rvert\le\tfrac{\lvert m\rvert\lvert h\rvert}{2}=\tfrac{\lvert mh\rvert}{2}\) for all \(0<\lvert h\rvert<\delta\). Then \(f(a+h)-f(a)=mh+E(h)\) and \(\lvert E(h)\rvert<\lvert mh\rvert\), so **the difference has the sign of \(mh\)**, and in magnitude at least \(\lvert mh\rvert/2\). | C2, **L1 C7** |
| C4 | **Refutation.** If \(a\) is *interior* to \(D\), both \(a+h\) and \(a-h\) are in \(D\) for all small \(h>0\). Choose the sign of \(h\) making \(mh>0\): \(f\) strictly increases, so \(a\) is no local max. Choose the other: \(f\) strictly decreases, so \(a\) is no local min. \(a\) is refuted. | C1, C3 |
| C5 | **Fermat's condition** (the contrapositive of C4). If \(a\) is an interior local extremum and \(f'(a)\) exists, then \(f'(a)=0\). Derived from C2 alone — no new machinery. | C4 |
| C6 | **The converse of C5 is false — this test refutes only.** C3–C5 say nothing whatever about a point with \(m=0\); C5 is one-way. Witness: \(f(x)=x^3\) at \(a=0\) has \(f'(0)=0\), yet every window contains points where \(f>0\) and points where \(f<0\), so \(0\) is neither. **This is a limitation of the one-point first-derivative condition, not of derivatives** — C13 certifies an extremum from \(f''(a)\), and a sign change of \(f'\) across \(a\) would certify one too. What is unlicensed is the *inference* \(f'(a)=0\Rightarrow\) extremum, not the use of derivative information to decide. | C5, `ex-cubic-inflection` |
| C7 | **Hypothesis 1 — interior.** At a boundary point only one sign of \(h\) exists, so C4 runs half. At the left endpoint of \([a,b]\) with one-sided \(f'(a)>0\): \(f\) strictly increases, refuting "maximum" — and nothing refutes "minimum", which it is. Endpoint-checking **is** the missing direction. | C3, C4 |
| C8 | **Hypothesis 2 — a local model exists.** If \(f'(a)\) does not exist, C2 fails, C3 never runs, and the point stands unrefuted by default. \(\lvert x\rvert\) on \([-2,2]\): the minimum is exactly there. | C2, `ex-abs` |
| C9 | **The candidate set.** For \(f\) on \(D=[a,b]\), every point is (i) interior with \(f'\) existing and nonzero — refuted by C4; (ii) interior with \(f'=0\) (*stationary*); (iii) interior with \(f'\) undefined (*singular*); or (iv) an endpoint. So **every extremum lies in (ii) ∪ (iii) ∪ (iv)**. This is a reduction, not automatically a *finite* list — a constant function makes (ii) the whole interval — but for every function this lesson uses it is a handful of points. | C4, C7, C8 |
| C10 | **Existence — the Extreme Value Theorem, cited not proved.** A continuous \(f\) on a **closed, bounded** interval attains a maximum and a minimum. Proving it needs completeness/compactness, which this course does not build; it is named on screen as an assumed ingredient, the same register as L1's modulus and L4's uniformity step. | Cited (P3 territory) |
| C11 | **The method, complete, in three separable jobs.** *Existence* (C10) says the maximum is attained somewhere; *location* (C9) says it is not anywhere outside the candidate set; *decision* compares the values over that set — which is a **terminating** comparison exactly when the candidate set is finite, a property of the function in hand and not of the method (C9). Each link is needed: on \((0,1)\), \(f(x)=x\) has an **empty** candidate set and no maximum — C9 still holds, C10 fails, and the method's honest output is "no interior extremum, and no existence guarantee", not a wrong answer. | C9, C10 |
| C12 | **The linear model is silent at a survivor.** When \(f'(a)=0\) the local model is \(h\mapsto f(a)\), a **constant**. Whatever distinguishes a max from a min lives in the residual the linear model discards. Classification is therefore *forced* to a finer model — this is the structural reason a second-derivative test exists at all. | C5, C2 |
| C13 | **The next rung, derived.** Assume \(f''\) continuous near \(a\). By **L4 C9** twice, \(f(a+h)-f(a)-f'(a)h=\int_a^{a+h}\!\bigl(f'(t)-f'(a)\bigr)dt=\int_a^{a+h}\!\!\int_a^{t}f''(s)\,ds\,dt\). If \(f'(a)=0\) and \(f''(a)>0\), continuity gives \(f''\ge c>0\) on a window, so the inner integral has the sign of \(t-a\) and magnitude \(\ge c\lvert t-a\rvert\); the outer integral is then \(\ge ch^2/2>0\) **for both signs of \(h\)**. So \(f(a+h)>f(a)\): a strict local minimum. \(f''(a)<0\) is symmetric. | C12, **L4 C9**, L1 (continuity) |
| C14 | **The next rung refuses too.** \(f''(a)=0\) leaves C13 with nothing: \(x^4\) (minimum), \(-x^4\) (maximum) and \(x^3\) (neither) all have \(f'(0)=f''(0)=0\). The test is **silent, not negative** — C6's structure one rung up. | C13 |
| C15 | **The same identity is the error bound.** If \(\lvert f''\rvert\le M\) between \(a\) and \(a+h\), the double integral of C13 gives \(\bigl\lvert f(a+h)-f(a)-f'(a)h\bigr\rvert\le \tfrac{M h^2}{2}\). So "\(\approx\)" acquires a number: to hold the error under \(\varepsilon\), take \(\lvert h\rvert\le\sqrt{2\varepsilon/M}\). This is L1's move repeated — a *local, qualitative* guarantee (\(E(h)/h\to0\)) upgraded to a *quantitative* one by a uniform bound. | C13 |
| C16 | **The compression, and the lesson's thesis stated safely.** One method, two questions: replace \(f\) near \(a\) by its local model, then ask *where the model is flat* (optimization — producing candidates, C9) or *what value the model gives* (approximation — with C15's error). Both licensed by the same residual control; neither claims more than the model carries. | C11, C15 |
| C17 | **Forward.** L11: the rungs continue, and \(\tfrac12 f''(a)\) is literally the next Taylor coefficient — "linearization is the first two terms" is this lesson's model read as the start of a series (**exact**). L28: C3–C5 run with every direction available instead of two, so \(\nabla f=\mathbf 0\) is the same refutation; saddle points are C6's survivors-not-certified with more room to fail (the *argument* transfers exactly; saddle behaviour is new content). L22–L23, L27: equilibria and stability read off derivative signs are C3's domination argument again. | C5, C13, C15 |

### 7. Minimal formal derivation

**Optimization.** \(f(x)=x^3-3x\) on \([-2,3]\).

\(f'(x)=3x^2-3=3(x-1)(x+1)\), so the stationary points are \(x=\pm1\); \(f\) is a
polynomial, so there are no singular points; the endpoints are \(-2\) and \(3\).
The candidate set is \(\{-2,-1,1,3\}\) — four points out of uncountably many, and
C4 has refuted **everything else**.

\[
f(-2)=-2,\qquad f(-1)=2,\qquad f(1)=-2,\qquad f(3)=18.
\]

By C10 the maximum is attained; by C9 it is in the list; so it is
\(\mathbf{18}\), at the **endpoint** \(x=3\) — *not* at the interior local
maximum \(x=-1\), which C13 does certify as a local max (\(f''(-1)=-6<0\)) and
which is nonetheless not the answer. The minimum is \(-2\), attained at **both**
\(x=1\) and \(x=-2\): the extreme *value* is unique, the points achieving it need
not be.

**Corroboration, with no calculus at all.** \(f(x)+2=x^3-3x+2=(x-1)^2(x+2)\),
which is \(\ge0\) for every \(x\ge-2\). Hence \(f(x)\ge-2\) on \([-2,3]\), with
equality exactly at \(x=1\) and \(x=-2\). This confirms the minimum — and it does
something the derivative never did: it **certifies**. The algebraic identity
supplies the endorsement C6 says the derivative cannot give.

**Approximation.** `ex-decay`, \(f(t)=e^{-t/\tau}\) with \(\tau=1.5\)
(`TAU_DECAY` in `src/math/calculus.ts`). \(f(0)=1\), \(f'(0)=-1/\tau=-2/3\), so
the local model is \(1-\tfrac{2}{3}t\). Since \(f''(t)=e^{-t/\tau}/\tau^2\), on
\(t\ge0\) we may take \(M=1/\tau^2=4/9\), and C15 gives error \(\le\tfrac29t^2\).
For error below \(10^{-2}\): \(t\le\sqrt{2\cdot10^{-2}/(4/9)}=0.2121\ldots\)

Check at \(t=0.2121\): \(e^{-0.14142}=0.86816\), model \(=0.85858\), error
\(=0.00958<10^{-2}\). ✓ The bound is honest and not vacuous — it is within about
5% of the actual error here.

### 8. Equivalence to the original object
C5 is Fermat's theorem exactly as textbooks state it, with exactly its
hypotheses; C9–C11 is the standard closed-interval method; C13 is the standard
second-derivative test; C15 is the standard first-order Taylor remainder bound
specialized to \(n=1\). Nothing is weakened or replaced. What changes is the
**direction the learner reads C5 in** and the fact that C7, C8, C14 are derived
consequences of the same argument rather than appended rules.

### 9. Cost / model change
The learner gives up \(f'(a)=0\) as a detector and accepts a two-step method
(eliminate, then decide) plus an existence hypothesis they previously never
noticed. That costs one extra idea — *necessary is not sufficient* — and buys:
all three warnings for free (C7, C8, C6), an honest answer on domains where no
maximum exists (C11), and the reason the second-derivative test exists rather
than its statement (C12). It also fixes which inferences are licensed:
\(f'(a)\neq0\Rightarrow\) not an extremum is **valid**;
\(f'(a)=0\Rightarrow\) extremum is **not**; \(f'(a)=0\) and \(f''(a)>0\)
\(\Rightarrow\) strict local min is **valid**; \(f''(a)=0\Rightarrow\) not an
extremum is **not**.

### 10. What the learner can predict or do afterward
- Given a **fresh** function and closed interval, say *before computing* which
  points can possibly survive and what must still be checked afterward — and
  refuse to name the answer from \(f'=0\) alone.
- Predict that a global maximum sits at an endpoint even though an interior
  local maximum exists, and justify it by C9 + C10 rather than by inspection.
- Shown an unfamiliar failing case, name **which hypothesis** of C3–C5 fails
  (interior / differentiable / refutation-only) instead of recalling which
  example it resembles.
- Predict that the method returns *nothing* on an open interval, and say that
  this is correct rather than broken.
- Predict that the second-derivative test is silent when \(f''(a)=0\) and supply
  two functions that fall on opposite sides of the silence.
- State an interval on which a linearization is accurate to a given tolerance,
  from a curvature bound — and say why \(E(h)/h\to0\) alone could not have.

### 11. Transfer assessment
Given a function built from ingredients not used in the lesson (say a
quotient or a product with an interior corner) on a stated closed interval:
produce the candidate set, name the hypothesis that admits each non-stationary
candidate, decide the global extremes, and state which conclusion would change
if the interval were opened at one end. Then, for a *different* function, choose
between the calculus route and an algebraic certificate (as in §7) and say why —
that is D8 method selection folded in, and it depends on judging whether a
certificate is available, which cannot be recalled.

The generalization to L28 is **exact for the argument** (C3–C5 with every
direction available) and **new content for the classification** (saddle points);
the L11 connection is **exact** (\(\tfrac12f''(a)\) is the second Taylor
coefficient, the same number). Neither is claimed as more than it is.

---

## 12. Bridge *(grounded insight)*
**One light bridge: standing somewhere and taking a step.** "Can this be the
best spot?" is answered by *trying* — and the local model predicts, before the
step, which direction improves. The bridge supplies the **goal** (get higher)
and makes the inference natural (if the ground is sloped, you are not at the
top). It supplies none of the argument's content: C3 is an inequality about
\(E(h)\), not about walking.

## 13. Preserved correspondences & analogy limits

| Bridge element | Mathematical counterpart | Preserved? |
| --- | --- | --- |
| Standing at a spot and stepping by \(h\) | Evaluating \(f(a+h)-f(a)\) | Yes |
| Sloped ground ⇒ you can go higher | \(m\neq0\Rightarrow\) some sign of \(h\) increases \(f\) (C3, C4) | Yes |
| The step must be *small* to trust the slope | \(0<\lvert h\rvert<\delta\), where \(\delta\) comes from \(E(h)/h\to0\) | Yes |
| A cliff edge: only one way to step | An endpoint — half of C4 unavailable (C7) | Yes |
| **"Flat ground means you're at the summit"** | **False.** \(x^3\) at \(0\) is a level ledge on a slope (C6) | **No — named limit, and it is exactly misconception M1** |
| Walking takes time and effort; you can see the whole landscape | Nothing. \(f\) has no time, and the argument is strictly local — no global view is ever assumed | **No — named limit, discarded** |
| Hills are surfaces, so "a step" is a direction | One dimension has exactly two directions; that is why C4 needs only two checks. L28 is where "every direction" arrives | **No — named limit; the honest version is deferred, not imported** |

The bridge's own false intuition (flat = summit) is the misconception the lesson
exists to break, so it is introduced *and then broken on purpose*, not smuggled.

## 14. Abstraction return
1. **Grounded:** step-and-check at a sloped point; the model predicts the
   improving direction.
2. **Correspondence:** the escape-route inequality on screen —
   \(f(a+h)-f(a)=mh+E(h)\) with \(\lvert E(h)\rvert<\lvert mh\rvert\) — with the
   threshold \(\delta\) located by the learner, not asserted.
3. **Unfamiliar:** a function with no walkable reading (a piecewise or
   symbolically-specified \(f\)) on a stated interval, plus the empty-candidate
   case on an open interval, where stepping intuition offers nothing.
4. **Symbolic:** C5 with its two hypotheses, used to state what does and does not
   follow from \(f'(a)=0\).

**Evidence the return happened:** the learner names *which hypothesis fails* in a
case they have not seen, with no reference to stepping, and correctly declines to
conclude an extremum from \(f'(a)=0\). A learner who can only re-run the
step-and-check demonstration, or who answers by matching to \(x^3\)/\(\lvert
x\rvert\) by shape, has acquired the demonstration and not the argument — the
graded items must separate these (see
[mastery-contract.md](mastery-contract.md)).

---

## Prerequisites, limitations, likely misconceptions

**Prerequisites.**
- **L2 `derivative-local-linearity` — hard**, specifically C5 (the residual
  definition, which C3 is an inequality about) and C11.
- **L1 `limits-continuity` — hard**, for C3's "there is a \(\delta\)" step and
  for the continuity hypothesis in C13.
- **L4 `fundamental-theorem` — hard.** C13 and C15 are derived from L4 C9
  applied twice, under an explicit **continuous \(f''\)** hypothesis that must
  be stated wherever they are used. The edge was **approved by the repository
  owner on 2026-08-01** and is now in
  [architecture §2.2](../../curriculum-architecture.md#22-within-course-edges)
  and the DAG.
- **Not** L5: the chain rule is used nowhere in C1–C17. L5 precedes L6 in the
  spine but is not a dependency, and the lesson must not imply otherwise.

> **Two Mode A amendments — both resolved by the repository owner, 2026-08-01.**
>
> 1. **`fundamental-theorem → optimization-approximation`, hard — APPROVED.**
>    C13/C15 derive the second-derivative test and the error bound from the FTC
>    (twice), under the stated hypothesis that \(f''\) is continuous, which the
>    owner required be kept explicit. The alternatives were compared and
>    rejected: the **Mean Value Theorem** would also work but L2 and L4 both
>    explicitly withhold it, and adopting it adds a fifth theorem to this lesson;
>    **citing** the bound instead of deriving it conflicts with the M2 P2 bar.
>    The FTC route adds no new theorem, reuses the course's own keystone, and
>    earns "\(f'>0\) on an interval \(\Rightarrow\) increasing" the same way
>    (\(f(q)-f(p)=\int_p^q f'>0\)) — the fact
>    `CalculusFixture.monotoneIntervals` currently **declares** rather than
>    derives.
> 2. **The M2 depth bar — AMENDED**, in
>    [benchmark-matrix §2](../../benchmark-matrix.md#2-per-module-depth-bars).
>    Its P1/P2 rows previously covered substitution, parts, and improper
>    integrals only, so L6 had no depth target. The owner amended it **before
>    Mode C rather than before Gate 10**, on the grounds that Gate 5 is supposed
>    to consume a calibrated bar, not merely be checked against one later. The P2
>    obligations now named are the ones this contract carries: stationarity as a
>    necessary filter; existence/location/decision; endpoint, singular, and
>    degenerate cases; the second-derivative test and \(Mh^2/2\) bound derived
>    from the FTC; and method selection.

**Limitations / scope.** Only one variable, on an interval. Explicitly **not**
developed: constrained optimization and Lagrange multipliers (declared off every
path); Newton's method and its convergence (descoped in the brief); higher-order
Taylor polynomials, remainder in Lagrange form, and radius of convergence (L11
owns them — L6 states only that the ladder continues and that \(\tfrac12f''(a)\)
is its next coefficient); l'Hôpital's rule; curve sketching as a genre;
inflection points beyond the single use of \(x^3\) as C6's witness; the
multivariable statement and saddle points (L28). The Extreme Value Theorem is
**used and named as unproved** (C10). The word "critical point" is used for
(ii) ∪ (iii) of C9, and the lesson must say so, because textbooks differ.

**Likely misconceptions, each explicitly targeted:**

| # | Misconception | Where it is broken |
| --- | --- | --- |
| M1 | \(f'(a)=0\) means \(a\) is a maximum or a minimum. | C6 with \(x^3\); graded by requiring the learner to *decline* to conclude, not merely to recall the counterexample. |
| M2 | The derivative test finds every extremum. | C8 with \(\lvert x\rvert\); graded by naming the failed hypothesis on an unfamiliar function. |
| M3 | Checking endpoints is a separate rule you must remember. | C7 — one of C4's two steps is unavailable; graded by asking *which* conclusion survives at an endpoint and which does not. |
| M4 | A local maximum is the maximum. | §7's worked case: the global max is at an endpoint while an interior local max exists; graded predict-before-compute. |
| M5 | \(f''(a)=0\) means \(a\) is not an extremum (or "it's an inflection"). | C14 — silent, not negative; graded by supplying two functions on opposite sides of the silence. |
| M6 | There is always a maximum. | C11 on \((0,1)\); graded by asking what the method returns and whether that is a failure. |
| M7 | "\(\approx\)" is a claim about accuracy. | C15; graded by requiring an interval for a stated tolerance, which \(E(h)/h\to0\) alone cannot produce. |

---

## Mathematical audit (Audit A)

1. **Does the conclusion follow from the derivation?** Yes, step by step, with
   two ingredients explicitly **cited rather than proved** and named as such on
   screen: the Extreme Value Theorem (C10) and — only if the Mode A edge above is
   refused — C15's bound. Everything else is derived. C3's inequality is written
   with its explicit \(\lvert m\rvert/2\) tolerance choice rather than waved at:
   \(\lvert E(h)\rvert\le\lvert mh\rvert/2<\lvert mh\rvert\) is what forces the
   sign, and \(h\neq0\) is what makes \(\lvert mh\rvert>0\).
2. **Necessary vs sufficient** (this gate's sufficiency-vs-lower-bound check, in
   its form for this topic — and the lesson's own subject). Each direction is
   stated explicitly: **C5 is necessary only**, and §9 lists the four inferences
   with which are valid. **C13 is a genuine sufficient condition** and is proved
   as one. **C14 is neither** — the failure of a sufficient condition is not a
   refutation. Two overclaims were caught and corrected here rather than left:
   - An earlier draft of C9 claimed the search "becomes a finite list". False in
     general — a constant function makes every point stationary. C9 now claims a
     **reduction to the critical set plus eligible boundary points**, with
     finiteness a property of the functions used here, not of the method.
   - An earlier draft of the **primary insight sentence** said the derivative
     "never finds the best point" and "only ever refutes". That overcorrects the
     spine's imprecision into a second falsehood: a sign change of \(f'\)
     certifies an extremum, and **C13 in this very contract certifies one from
     \(f''\)**. The claim is now scoped to *the one-point first-derivative
     condition*, which is what actually refutes-only. The same draft called the
     three warnings "three hypotheses"; there are **two hypotheses** (interior,
     differentiable) and **one failure of the converse**.
3. **Structure-preserving analogy.** The step-and-check bridge preserves the
   operation exactly (§13). Its one dangerous import — "flat means summit" — is
   named, is misconception M1, and is broken on purpose rather than left to
   decay. Two further imports (time/effort, and "a step is a direction") are
   named and discarded; the second is honest about deferring, not denying.
4. **Hidden normalization?** None. The one place something could hide is C13's
   sign handling for \(h<0\): the double integral is checked in both directions
   rather than asserted symmetric — for \(h<0\) the inner integral is negative on
   \([a+h,a]\) and the outer orientation flips again, so the product of the two
   sign reversals leaves \(\ge ch^2/2>0\). Stated, not glossed.
5. **Nature of the broader connections.** C17 marks each: L11 is **exact** (same
   number, \(\tfrac12f''(a)\)); L28 is **exact for the argument and new for the
   classification** (saddle points are not derivable here); L22/L23/L27 are
   **architectural** (the same domination reasoning, different objects). None is
   claimed as more.
6. **Notation level.** No \(o\)/\(O\) notation, no Peano or Lagrange remainder
   forms, no compactness vocabulary. C13/C15 are written as an explicit iterated
   integral with an explicit bound — expressible with exactly what L3 and L4
   built. "Critical point" is defined in-lesson because textbooks disagree about
   whether it includes singular points.

**More illuminating than a strong conventional explanation?** Yes. A strong
conventional presentation states Fermat, notes it is necessary-not-sufficient,
and lists the counterexamples. What it does not do is show that the three
counterexamples are the argument's own two hypotheses plus the failure of its
converse, that the argument is
L2 C5 doing work, or that the linear model's *silence* is what creates the
second-derivative test. That is the compression this gate is for.

## Grounding & model-change audit (Audit B)

1. **Model change or clearer wording?** Model change, and it is directly
   observable: the learner's answer to "does \(f'(a)=0\) tell you \(a\) is an
   extremum?" reverses.
2. **New prediction, without being told?** Yes — §10's first, third and fourth
   items in particular: naming the failed hypothesis on an unseen case, and
   predicting that the method correctly returns nothing on an open interval.
   Neither is answerable from the procedure.
3. **Compression / purpose exposed?** Both. Four memorized rules → one
   argument's two hypotheses plus the failure of its converse; second-derivative test + Taylor's next term → one
   object; optimization + approximation → one method with two questions (C16).
   Purpose: the derivative's service here is elimination (C9), not detection.
4. **Genuine isomorphism (grounding).** The step-and-check operation *is*
   evaluating \(f(a+h)-f(a)\); the truth conditions coincide. What stays fixed:
   sloped ⇒ improvable, small steps only.
5. **Named pragmatic additions.** Three, in §13: "flat = summit" (**discarded**,
   and it is M1); time/effort and a global view (**discarded** — the argument is
   strictly local); "a step is a direction" (**named as deferred** to L28, not
   denied). The bridge adds no property that enters the mathematics.
6. **Abstraction return present?** Yes — §14, with the discriminating evidence
   stated: naming the failed hypothesis on an unfamiliar case versus re-running
   the demonstration or shape-matching to \(x^3\)/\(\lvert x\rvert\).
7. **Theme-removal test.** Strip the walking entirely and C1–C17 stand unchanged
   — which is the correct outcome and also a constraint: the bridge is **light**,
   supplies the goal only, and must be used lightly. It is not load-bearing
   decoration because it is not load-bearing at all.

---

## Review signoff

- **Contract author:** this agent (Opus 5), 2026-08-01.
- **Mathematical reviewer:** same agent lineage — **self-review, not
  independent**. C3, C13 and C15 were each re-derived and the C13 sign analysis
  checked for \(h<0\) separately; §7's numbers are hand-checkable and the
  `ex-decay` bound was verified numerically against the true error. That is
  arithmetic verification, not independent review.
- **Pedagogical reviewer:** same agent lineage — **self-review, not
  independent**.
- **Owner review round 1 — 2026-08-01.** The repository owner reviewed this
  contract and the plan, **resolved both Mode A amendments** (above), and
  returned findings that were **not** caught by the self-audits. The two that
  changed this document:
  - the primary-insight sentence **overcorrected the spine into a second
    falsehood** ("never finds", "only ever refutes") and mislabelled the three
    warnings as three hypotheses — both corrected, and recorded in Audit A #2 so
    the error is visible rather than quietly overwritten;
  - the finite-list overclaim, repaired in C9, **survived in C11 and in the
    brief** (R5, P2, the discovery sequence) — corrected in all of them.

  This is the outcome the signoff block exists to make possible: an audit that
  passed its own checks and was still wrong in a way only an outside reader
  found. Recording it here matters more than the fact that it was fixed.
- **User / domain-owner approval of the contract as a whole:** **not given.**
  Round 1 resolved the amendments and returned corrections; it was not an
  approval to implement, and Mode C remains an open approval boundary.
- **Outstanding concerns:**
  1. **Self-certification.** L5's contract was self-certified and an independent
     review later found a real mathematical gap in exactly the step Audit A had
     passed. Round 1 confirmed the pattern again, on the thesis rather than the
     mathematics. C3's \(\delta\) choice and C13's two-sided sign argument were
     both checked in round 1 and found **sound**; the defects were in what the
     document *claimed around* them, which is where a further reviewer should
     look.
  2. The spine's own sentence for L6 is imprecise (see
     [insight-brief §1d](insight-brief.md#1d-ranking)); the spine row is worth
     repairing to match — a Mode A edit, **not** made here.

## Gate result

**Gate result: PASS**

**Primary insight (exact sentence, kept verbatim in the plan's metadata):**
*At an interior point where \(f\) is differentiable, \(f'(a)\neq0\) **refutes** a
local extremum — the local model hands you a step that provably improves — while
\(f'(a)=0\) merely **survives** that test rather than passing it. Interiorness
and differentiability are the argument's two hypotheses; "a survivor need not
win" is the failure of its converse; and those three facts are what the three
memorized warnings are really about. Certifying a survivor takes a further
argument, which is why the second-derivative test exists.*
