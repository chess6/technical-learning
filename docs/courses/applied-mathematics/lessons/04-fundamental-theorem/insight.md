# Approved Insight Contract — The Fundamental Theorem of Calculus (spine L4)

Stage 2 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md),
selecting from [insight-brief.md](insight-brief.md), with Audits A and B.

Primary insight: **Package P1** — *interior contributions telescope; only the
boundary survives.* **P2** (accumulate then measure) is the chain's first half;
**P3** (the two instruments) is the opening and the falsification; **P4** is a set
of correctness obligations; **P5** is one closing sentence.

---

## Primary insight (contents 1–11)

### 1. Diagnosed cognitive obstacle
**Nothing is left to be surprised by** — the usual ordering defines \(\int\) via
the antiderivative, so the theorem restates a definition and is stored as two
labelled statements. The learner acquires a computational rule and **no
argument**, and therefore has nothing to generalize when the same argument is
needed in two dimensions (L34). Secondary: the collapse from unboundedly many
terms to two evaluations is not registered as remarkable. Tertiary: the two parts
are held as a numbered pair rather than as one symmetry.

### 2. Insight mechanism(s)
**Structural compression** — an unbounded sum collapses to two numbers, and the
reason is a cancellation the learner can watch — supported by **representational
change** (every interior evaluation drawn twice, with opposite signs, annihilating)
and **predictive/causal reorganization** (the theorem re-read as "the interior was
never going to matter").

### 3. Initial mental model
"Integration is the opposite of differentiation; that's basically the definition.
The Fundamental Theorem is the rule \(\int_a^b f = F(b) - F(a)\), plus another
one about derivatives of integrals that I keep confusing with it."

*(In this course the learner arrives without even that, because L3 refused to
name the antiderivative. Their model is: "an integral is a limit of sums, and I
can only compute it when the sum has a closed form." That is a **better** starting
point and is exactly what makes the theorem land.)*

### 4. Tension / redundancy
Two things are now unreconciled, and both were planted deliberately.

1. **L3's loose end.** The running total \(A(x)\) rises fastest exactly where the
   rate \(f(x)\) is highest. L3 showed it and refused to explain it.
2. **The computational wall.** L3 computed \(\int_0^2 x^2\) only because
   \(\sum i^2\) happens to have a closed form. For almost any other rate the sum
   has none, and the learner is stuck — yet the odometer in the car manages it
   without summing anything.

And beneath both, the belief the learner has held since L1 without ever being
asked to defend it: **the speedometer and the odometer never disagree**. If the
integral is genuinely a limit of unboundedly many terms, why should any pair of
instruments be able to shortcut it?

### 5. The model change

Differentiating and accumulating are **inverse processes**, and the reason the
infinite sum collapses is **telescoping**.

Take any \(F\) with \(F' = f\). Chop \([a,b]\) at \(a=x_0<x_1<\dots<x_n=b\). Then

\[
F(b)-F(a) \;=\; \sum_{i=0}^{n-1}\bigl(F(x_{i+1})-F(x_i)\bigr).
\]

**This step contains no calculus.** It is an identity: add and subtract every
interior value. Written out, \(F(x_1)\) appears once positively and once
negatively, and so does every other interior evaluation. \(n\) contributions,
\(n-1\) cancellations, **two survivors** — and the survivors are exactly the two
ends.

Now put calculus in exactly one place. By L2's local linearity,
\(F(x_{i+1})-F(x_i) \approx F'(x_i)\Delta x_i = f(x_i)\Delta x_i\) — one term of a
Riemann sum. So the total change equals a Riemann sum for \(\int_a^b f\), up to
errors that L2 guarantees vanish faster than the step. Refine, and

\[
F(b)-F(a) \;=\; \int_a^b f .
\]

The other half is the same statement read backwards: define
\(A(x)=\int_a^x f\); over a short step it gains one thin rectangle, so
\(A'(x)=f(x)\). Accumulate then measure, and you are back where you started;
measure then accumulate, and you get the change. **One symmetry, not two rules.**

The interior never mattered. That is the whole theorem, and it is the sentence
that will be re-run over a region in L34.

### 6. Full causal chain

| # | Step | Depends on |
| --- | --- | --- |
| C1 | Define \(A(x)=\int_a^x f\) — L3's running total, unchanged. | **L3 C9** |
| C2 | Over a step \(h\), \(A(x+h)-A(x)\) is the accumulation over \([x,x+h]\): one thin sliver. | L3 C6 |
| C3 | \(f\) is continuous, so on a short enough sliver it is nearly constant (L1) and the sliver is \(\approx f(x)h\). | **L1 C9** |
| C4 | Hence \(\dfrac{A(x+h)-A(x)}{h}\to f(x)\): **\(A'(x)=f(x)\)**. Accumulating then measuring returns the original rate. | C2, C3, **L2 C2** |
| C5 | This explains L3's loose end: \(A\) rises fastest where \(f\) is largest, because \(f\) *is* \(A\)'s slope. | C4 |
| C6 | Now the other direction. Take any \(F\) with \(F'=f\). Chop \([a,b]\) and write \(F(b)-F(a)=\sum(F(x_{i+1})-F(x_i))\). **This is an identity — no calculus.** | Entry algebra |
| C7 | Every interior \(F(x_i)\) occurs twice with opposite signs and cancels. \(n\) terms, \(n-1\) cancellations, **2 survivors**. | C6 |
| C8 | By L2's local linearity \(F(x_{i+1})-F(x_i)=f(x_i)\Delta x_i + E_i\) with \(\sum E_i \to 0\) under refinement. | **L2 C5** |
| C9 | So \(F(b)-F(a)\) equals a Riemann sum plus vanishing error; refine and \(F(b)-F(a)=\int_a^b f\). | C6–C8, **L3 C6** |
| C10 | \(+C\) is harmless: adding a constant to \(F\) changes nothing in a **difference**. | C9 |
| C11 | The theorem is about **existence**, not a recipe. C4 shows \(A\) exists for every continuous \(f\); it does **not** promise an elementary formula. \(e^{-x^2}\) is the standing counterexample. | C4 |
| C12 | Falsification: if the theorem failed, the odometer's change and the accumulated speedometer would differ — two instruments measuring one journey, disagreeing. | C9, `ex-drive` |
| C13 | Check: \(\int_0^2 x^2\) was \(8/3\) by summation in L3 and is \(\frac{2^3}{3}-0=8/3\) by C9. **The two computations must be seen to agree.** | C9, L3 §7 |
| C14 | Forward, and along **both** of the course's structural themes. *Theme 1 (local accumulation and boundary effects):* **L34, L36, and L37 re-run C6–C9 over a region, a surface, and a solid, with shared interior edges and faces cancelling in pairs instead of shared endpoints.** *Theme 2 (representation change):* L7's integration by parts is C9 plus a product, and its **boundary term** is what turns \(d/dt\) into multiplication in L18 and L24 — and, in L24, what carries the initial conditions. L8 lets an endpoint run to infinity. | C9 |

### 7. Minimal formal derivation

**Part 1 (C4).** For continuous \(f\) and \(h>0\),
\(A(x+h)-A(x)=\int_x^{x+h} f\). Since \(f\) is continuous on \([x,x+h]\), it
attains a minimum \(m_h\) and a maximum \(M_h\) there, so
\(m_h h \le A(x+h)-A(x) \le M_h h\), hence

\[
m_h \;\le\; \frac{A(x+h)-A(x)}{h} \;\le\; M_h .
\]

Continuity forces \(m_h, M_h \to f(x)\) as \(h\to0\), so the quotient is squeezed
to \(f(x)\). (The same argument with \(h<0\) gives the left-hand limit.)

**Part 2 (C9).** With \(F'=f\) and any partition,

\[
F(b)-F(a)=\sum_{i=0}^{n-1}\bigl(F(x_{i+1})-F(x_i)\bigr)
=\sum_{i=0}^{n-1}\bigl(f(x_i)\Delta x_i + E_i\bigr),
\]

where \(E_i/\Delta x_i \to 0\) **uniformly** as the mesh shrinks (L2 C5, together
with L1's `modulus-of-continuity` for \(f\) on a closed bounded interval — the
object that makes "uniformly" mean something here rather than being asserted). The first sum is a Riemann sum
converging to \(\int_a^b f\); the second is bounded by
\((b-a)\max_i \lvert E_i/\Delta x_i\rvert \to 0\). Hence \(F(b)-F(a)=\int_a^b f\).

**Arithmetic check (C13).** \(F(x)=x^3/3\) has \(F'=x^2\), so
\(\int_0^2 x^2 = 8/3 - 0 = 8/3\) — the number L3 obtained from
\(\frac43\cdot\frac{(n+1)(2n+1)}{n^2}\) with no antiderivative in sight.

### 8. Equivalence to the original object
These are the two standard statements of the Fundamental Theorem for continuous
integrands. Part 1's proof is the usual squeeze; part 2's is the usual telescoping
argument. The uniformity of the \(E_i\) bound is the one analytic point the course does not
prove. It follows from the existence of a **modulus of continuity** on a compact
interval — the object L1 introduces — and that existence is **stated and
attributed, not derived** (a P3 obligation this course does not claim). The gap
is declared in the contract and named on screen in the lesson.

### 9. Cost / model change
The learner must accept that a picture of cancelling terms is an argument (it is —
C6 is an algebraic identity, and the drawing is faithful to it), and must hold two
directions at once. They also give up the hope that the theorem is a recipe: C11
says plainly that most rates have no elementary antiderivative, so the sum-based
methods of L3 are not obsolete. In exchange they get the computational shortcut,
the resolution of L3's loose end, and — the real prize — **an argument they will
recognise again in two dimensions**.

### 10. What the learner can predict or do afterward
- Evaluate a definite integral by finding an antiderivative, and say why \(+C\) may be discarded.
- Differentiate an integral with a variable upper limit.
- Explain, without notation, why unboundedly many contributions collapse to two evaluations.
- Say what the theorem does **not** promise (an elementary formula) and give the standing counterexample.
- Predict what would be observably wrong in the world if the theorem were false.
- Recognise a telescoping argument in an unfamiliar setting.

### 11. Transfer assessment
An unfamiliar telescoping identity with no integral in it — for example, evaluate
\(\sum_{k=1}^{n}\left(\frac1k - \frac1{k+1}\right)\) — followed by the question:
*which step of the Fundamental Theorem's argument is this, and what plays the role
of \(F\)?* This is E4: it requires the learner to have taken the **mechanism**
rather than the statement, which is precisely the diagnosed obstacle, and it can
be answered only by someone who saw C6 as an identity rather than as calculus.

---

## 12. Bridge *(grounded insight)*
**The odometer and the speedometer, resolved.** Fourth and final appearance of
`ex-drive`. Three lessons have used the pair without ever asking why they agree;
this lesson makes the agreement a theorem. The bridge is load-bearing rather than
illustrative: the learner's pre-existing certainty that the instruments agree is
the *evidence* that the theorem must be true, and C12 turns that certainty into a
falsification test.

Secondary bridge for the mechanism: **a staircase**. The total rise from bottom to
top is the sum of the step heights, and every intermediate landing is both the top
of one step and the bottom of the next. That is C6, with no calculus in it at all.

## 13. Preserved correspondences & analogy limits

| Bridge element | Mathematical counterpart | Preserved? |
| --- | --- | --- |
| Odometer change over a journey | \(F(b)-F(a)\) | Yes |
| Accumulated speedometer | \(\int_a^b f\) | Yes |
| Every landing is a top and a bottom | Every interior \(F(x_i)\) appears with both signs | Yes |
| Total rise = top − bottom | The telescoping identity | Yes |
| A staircase has **finitely many** steps | The identity is exact for any finite partition; the calculus enters only at C8 | **Named limit — and it is the point**: the identity needs no limit, which is why the argument is robust enough to re-run in 2-D |
| Steps are flat and equal | Neither is required; \(\Delta x_i\) may vary and \(F\) may bend within a step | **No — named limit**, discharged by C8's error term |
| The odometer "knows" the answer | It has been accumulating all along; nothing is shortcut physically. The shortcut is available to *us* because \(F\) exists. | **No — discard**, and the lesson says so |

## 14. Abstraction return
1. **Grounded:** the two instruments, and the staircase.
2. **Correspondence:** the partition drawn with each \(F(x_i)\) written twice, in
   opposite signs, and struck out in pairs — the staircase's landings and the
   algebra side by side.
3. **Unfamiliar:** the same cancellation on a partition of a rate with no physical
   reading, then on a bare telescoping sum with no integral at all.
4. **Symbolic:** \(\int_a^b f = F(b)-F(a)\) and \(\frac{d}{dx}\int_a^x f = f(x)\),
   used to evaluate and to differentiate, with \(+C\) discarded by C10.

Evidence the return happened: the transfer item, which is a telescoping sum with
no calculus in it, and which the learner must name as C6.

---

## Prerequisites, limitations, likely misconceptions

**Prerequisites:** L1 (`limits-continuity`) for C3 and the squeeze; **L2**
(`derivative-local-linearity`) for C4 and C8 — this is the lesson that consumes
L2's C5 and is the reason L2 was framed as approximation rather than as slope;
**L3** (`integral-accumulation`) for C1 and C9.

**Limitations / scope:**
- Continuous integrands on closed bounded intervals only, declared.
- The uniformity of the error bound in §7 is **stated, not proved** (it needs
  uniform continuity on a compact interval). Declared in the lesson.
- Integration techniques are L7's; antiderivatives here are found by inspection
  for \(x^n\), \(\sin\), \(\cos\), \(e^x\) only.
- No improper integrals (L8); no substitution in definite integrals (L7); no mean
  value theorem for integrals as a named result (its content is used inside §7's
  squeeze without being christened).

**Likely misconceptions, each explicitly targeted:**

| # | Misconception | Where it is broken |
| --- | --- | --- |
| M1 | The theorem is a definition, so there is nothing to prove. | The whole lesson: L3 refused the antiderivative, so C13's two independent computations of \(8/3\) are genuine corroboration. |
| M2 | Part 1 and part 2 are two unrelated rules. | C4 and C9 presented as one symmetry, with the same picture read in both directions. |
| M3 | Every function has an antiderivative you can write down. | C11 + the \(e^{-x^2}\) counterexample; graded. |
| M4 | \(+C\) matters / is a ritual. | C10 — it cancels in the difference; graded by asking what changes if \(F\) is shifted. |
| M5 | The theorem means Riemann sums were pointless. | C11: most rates have no elementary \(F\), and numerical accumulation stays the working method. |
| M6 | The cancellation needs the pieces to be equal or the function to be nice. | C6 is an identity for **any** partition; the lesson demonstrates it on a deliberately unequal one. |
| M7 | \(\frac{d}{dx}\int_a^x f = f(x)\) depends on the lower limit \(a\). | Shown by changing \(a\) and watching \(A\) shift vertically while its slope does not change. |

---

## Mathematical audit (Audit A)

- **Correct as stated?** Yes. §7 part 1 is the standard squeeze via extreme values on a compact interval; part 2 is the standard telescoping argument.
- **Any false simplification?** One real gap, declared: the passage from "each \(E_i\) is \(o(\Delta x_i)\)" to "\(\sum E_i \to 0\)" needs **uniformity**. The named object is L1's `modulus-of-continuity`; that a continuous function on a closed bounded interval has one is **stated with attribution, not proved**. This is the audit's principal finding and the single analytic gap in Package A. It is visible in the lesson rather than glossed.
- **A second, easily-missed point:** part 1 requires \(f\) continuous **at \(x\)**, not merely integrable; the lesson's hypotheses are stated as continuity on the closed interval throughout, which is sufficient and is what every Package A integrand satisfies.
- **Degenerate cases handled?** Unequal partitions (M6, demonstrated); a shifted \(F\) (M4); a shifted lower limit (M7); \(f\) negative on part of the interval (the total decreasing); \(a=b\) (both sides zero).
- **Does the insight survive generalization?** Yes — and this is the reason for the selection. C6–C9 is exactly the argument re-run in L34 with oriented boundary edges instead of endpoints, and the cancellation of shared interior edges instead of shared endpoints. The `telescoping-cancellation` visual family is therefore required to be parameterized over "what cancels against what" rather than hard-coded to an interval.
- **Anything asserted but not derived?** The antiderivatives used by inspection (\(x^n\), \(\sin\), \(\cos\), \(e^x\)) are verified by differentiating them on screen, not asserted.

## Grounding & model-change audit (Audit B)

- **Does the bridge change the intelligible goal?** Yes — from "apply the rule" to "why can two instruments possibly agree, when one of them is summing unboundedly many things?"
- **Is the bridge decorative?** No. It has been accumulating meaning across four lessons, and the staircase bridge is a *literal instance* of C6 rather than an analogy for it.
- **Are analogy limits named?** Yes, three, and one of them is turned into content: a staircase has finitely many steps, and so does the identity — the limit enters only at C8, which is exactly why the argument is robust enough to generalize.
- **Does the learner return to the abstraction?** Yes — §14 step 4, and decisively the transfer item, which strips away both the integral and the story.
- **Is the model change observable?** Yes: before, the learner states the rule; after, they can say what cancels, why the interior never mattered, what the theorem does not promise, and can recognise the same argument with no calculus in it.

---

## Review signoff

- [x] One primary insight selected, with the reason for **not** leading with the more common choice recorded.
- [x] Causal chain complete, with each upstream dependency cited at the exact step (L1 C9 at C3; L2 C2 at C4; L2 C5 at C8; L3 C6/C9 at C1/C9).
- [x] Minimal formal derivation present for **both** parts, plus the arithmetic corroboration that L3's refusal made possible.
- [x] Equivalence to the standard statements recorded, with the uniformity gap declared rather than hidden.
- [x] Cost stated honestly, including what the theorem does not buy.
- [x] Transfer item specified: unfamiliar, calculus-free, and diagnostic of the actual obstacle.
- [x] Bridge, correspondences, discarded elements, abstraction return recorded.
- [x] Audit A and Audit B complete; the uniformity finding and the generalization requirement both carried into the contract.
- [x] Misconception list targeted; seven items, each with a grading or demonstration obligation.

## Gate result

**Gate result: PASS**
