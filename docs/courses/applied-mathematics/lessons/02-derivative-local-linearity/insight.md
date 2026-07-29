# Approved Insight Contract — The derivative as local linearity (L2)

Stage 2 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md),
selecting from [insight-brief.md](insight-brief.md), with Audits A and B.

Primary insight: **Package P2** — *rate, slope, and best linear approximation are
one object, not three facts.* **P1** (the zoom) is its mechanism and opening;
**P3** (the tangent as the line whose error decays faster) is a required
obligation in the chain; **P4** (the derivative as a function) is the close.

---

## Primary insight (contents 1–11)

### 1. Diagnosed cognitive obstacle
**Fragmentation**: three descriptions of the derivative held as three unrelated
facts, so the learner cannot move between them and cannot reach for the one a
problem offers. Compounded by a **false prior definition** of "tangent" ("touches
at one point, does not cross"), which is untrue for graphs and makes a local
object look global.

### 2. Insight mechanism(s)
**Structural compression** (three descriptions collapse to one object) driven by
**representational change** (the zoom), with **predictive/causal reorganization**
in the tangent criterion (error decay, not touching) and in the visible failure of
the zoom at a corner.

### 3. Initial mental model
"The derivative is a thing you compute with rules. It is also, separately, the
slope of the tangent, and also, separately, a rate of change. The tangent is the
line that just touches the curve."

### 4. Tension / redundancy
Two facts the learner already accepts sit unreconciled. First, L1 established that
the speedometer's instantaneous reading is a well-defined **number** — a rate, in
metres per second. Second, everybody says that number is the **slope** of a line
drawn on a graph — a ratio of two lengths. Rates and slopes are not obviously the
same kind of thing, and nothing so far has said why one should be the other. A
third description, "best linear approximation", is then added without being
connected to either. Three names is one too many for one object; either they are
different things or the course has been repeating itself.

It has been repeating itself.

### 5. The model change

**Zoom far enough into a smooth curve and it *is* a line.** Not "looks like",
within the resolution of the picture: that is what smoothness means. Once that is
seen, the three descriptions are one object read three ways:

- the **line** is what the curve becomes locally — the *approximation*;
- the line's **slope** is the number that line is described by — the *slope*;
- that slope, in the graph's own units, is output-per-input — the *rate*.

One zoom, one line, one number. And the tangent is redefined honestly: **not** the
line that touches once, but **the line whose error shrinks faster than the step
does**. Every other line through the point has error proportional to \(h\); the
tangent alone has error that vanishes compared to \(h\).

Where no line appears under magnification — a corner — there is no derivative,
and the learner can *see* that rather than being told it.

### 6. Full causal chain

| # | Step | Depends on |
| --- | --- | --- |
| C1 | Over an interval, average rate \(= \dfrac{f(a+h)-f(a)}{h}\) — the slope of the **secant**. Rate and slope are already the same reading here; only the units differ. | L1 C1 |
| C2 | As \(h\to0\) that quotient is \(0/0\), but L1 licenses the limit: the neighbours force a value. Call it \(f'(a)\). | **L1 C7, C8** |
| C3 | Independently: magnify the graph about \((a,f(a))\). For a smooth \(f\), successive magnifications look progressively straighter, and beyond some magnification the picture is a line. | Observation, formalized in C5 |
| C4 | The secants of C1 and the line of C3 are the same line: the secant through \((a,f(a))\) and a point inside the magnified window has slope within any tolerance of \(f'(a)\). | C1, C2, C3 |
| C5 | Formally: \(f(a+h) = f(a) + f'(a)h + E(h)\) with \(E(h)/h \to 0\). The error vanishes **faster than the step**. | C2 |
| C6 | **Tangent, honestly defined:** the unique line through \((a,f(a))\) whose error satisfies C5. For any other slope \(m\), the error is \(\approx (f'(a)-m)h\) — proportional to \(h\), not smaller. | C5 |
| C7 | Therefore "touches at one point and does not cross" is false: at an inflection the tangent crosses. The criterion is error decay, not contact. | C6 |
| C8 | **The compression.** The line (C3) is the approximation (C5); its slope (C1) is the rate (C1); so rate = slope = best local linear model. One object. | C1–C6 |
| C9 | Linear-algebra reading: \(h \mapsto f'(a)h\) is a linear map \(\mathbb{R}\to\mathbb{R}\), and \(f'(a)\) is its \(1\times1\) matrix — "where the basis lands", exactly the columns rule. | LA `transformations` |
| C10 | **Failure is visible.** \(\lvert x\rvert\) at 0 never straightens: the left and right magnified pictures are different lines, so no single line satisfies C5 and \(f'(0)\) does not exist. | C3, C5 |
| C11 | Differentiability implies continuity: C5 forces \(f(a+h)\to f(a)\). The converse fails (C10). | C5, L1 C9 |
| C12 | Reading the slope at **every** point gives a new function \(f'\). For `ex-parabola`, \(f'(x)=2x\) — derived from C2, not recalled. | C2 |
| C13 | Forward: L3 composes these lines; L4 uses C5 as a computational tool; **L4 uses C5 as the approximation step in the telescoping argument**; L22 writes equations about \(f'\); L28 runs C3 in several directions at once. | C5, C12 |

### 7. Minimal formal derivation

For \(f(x)=x^2\) at \(x=a\):

\[
\frac{(a+h)^2 - a^2}{h} = \frac{2ah + h^2}{h} = 2a + h \quad (h\neq0),
\]

so \(f'(a) = 2a\) by L1's argument. Writing it in the C5 form:

\[
f(a+h) = a^2 + 2a\,h + \underbrace{h^2}_{E(h)}, \qquad \frac{E(h)}{h} = h \to 0 .
\]

The error is *exactly* \(h^2\). Compare the line of slope \(m \neq 2a\): its error
is \(h^2 + (2a-m)h\), whose ratio to \(h\) tends to \(2a-m \neq 0\). So the
tangent is singled out by C6 with nothing left implicit, and at \(a=3\) the
number is \(6\) — the value L1 already forced.

### 8. Equivalence to the original object
\(f'(a) = \lim_{h\to0}\frac{f(a+h)-f(a)}{h}\) is the standard definition, and C5
is the standard "differentiable ⇒ first-order Taylor with \(o(h)\) remainder".
Neither is weakened. The lesson states the limit definition symbolically and uses
the zoom as its meaning, not as a replacement.

### 9. Cost / model change
The learner gives up "tangent = touches once" (a definition they have held since
school geometry and which is comfortable) and gives up treating the three
descriptions as separate things to recall. They must accept that a *picture at a
magnification* is evidence about a limit — which the lesson discharges by pairing
every zoom with C5's algebra, never leaving the picture as the only argument. In
exchange they can move between rate, slope, and approximation at will, and they
can see non-differentiability instead of testing for it.

### 10. What the learner can predict or do afterward
- Predict what a smooth graph will look like under high magnification, and what a corner will look like.
- Produce the linear approximation \(f(a)+f'(a)h\) and use it to estimate a value, with a sense of when the estimate degrades.
- Say why a rate and a slope are the same number, in units.
- Give a curve that crosses its own tangent, refuting the school definition.
- Decide differentiability from a graph, and give a function continuous but not differentiable at a point.
- Read \(f'\) as a function and sketch it from \(f\).

### 11. Transfer assessment
Given an unfamiliar physical rate they have not met in the course (e.g. a tank's
volume against time, or a population against time), state what the derivative is
**in that setting's units**, what the tangent line means physically, and use the
linear approximation to predict a value a short step ahead — then say which
direction the estimate errs if the graph is bending. The last part is E4: it
requires reading C5's error term as having a *sign*, which the lesson shows once
and never drills.

---

## 12. Bridge *(grounded insight)*
**Two bridges, both true instances rather than analogies.**
1. **The speedometer, resumed from L1** — the rate costume.
2. **The locally flat Earth** — the zoom. A person standing on a sphere sees a
   plane; the curvature has not gone away, it is invisible *at that scale*. This
   is not a metaphor for local linearity; it *is* local linearity, on an object
   the learner already believes.

## 13. Preserved correspondences & analogy limits

| Bridge element | Mathematical counterpart | Preserved? |
| --- | --- | --- |
| Standing on the ground, seeing a plane | \(f(a+h)\approx f(a)+f'(a)h\) | Yes |
| Curvature still present, just invisible | \(E(h)\neq0\) but \(E(h)/h\to0\) | Yes |
| Walking further, the flat model failing | The approximation degrades as \(\lvert h\rvert\) grows | Yes |
| Speedometer reading in m/s | Slope in output-units per input-unit | Yes |
| The Earth has **one** radius of curvature everywhere | A graph's curvature **varies with \(x\)**; the flat window is not one fixed size | **No — named limit** |
| The Earth is a real surface you could survey | A graph is a plot; the zoom is about a function, not a place | **No — discard** |
| "Flat means you can ignore the curvature" | Ignoring \(E(h)\) is only valid to *first order*; L4 and L4 both care about it | **No — named limit** |

## 14. Abstraction return
1. **Grounded:** the flat-Earth zoom and the speedometer.
2. **Correspondence:** the magnified graph annotated with \(f(a)+f'(a)h\) and the
   residual \(E(h)\) drawn as a labelled gap.
3. **Unfamiliar:** the zoom applied to a function with no physical reading, and to
   \(\lvert x\rvert\) at 0 where it fails.
4. **Symbolic:** \(f'(a)=\lim_{h\to0}\frac{f(a+h)-f(a)}{h}\) and
   \(f(a+h)=f(a)+f'(a)h+o(h)\), used to justify an estimate and to argue that a
   corner has no derivative.

Evidence the return happened: the learner refutes "tangent touches once" using an
inflection point, with no reference to the Earth.

---

## Prerequisites, limitations, likely misconceptions

**Prerequisites:** L1 (`limits-continuity`) — hard. LA `transformations` (built)
for C9, as a connection only. Entry algebra for the binomial expansion in §7.

**Limitations / scope:** the differentiation rulebook is not derived — only
\(x^n\) for small \(n\) (from §7's argument) and the constant/sum rules. Product
and quotient rules are **stated for use** and flagged as stated. The chain rule is
L3's entire subject and is not previewed. No implicit differentiation, no
higher-order Taylor, no mean value theorem, no \(f''\) beyond one naming.

**Likely misconceptions, each explicitly targeted:**

| # | Misconception | Where it is broken |
| --- | --- | --- |
| M1 | A tangent touches at one point and does not cross. | C7 + a graded inflection-point counterexample. |
| M2 | Rate, slope, and approximation are three different things. | C8; graded by requiring one to be used where another was given. |
| M3 | The derivative is a number, not a function. | C12 + the \(f'\) panel; graded by sketching \(f'\) from \(f\). |
| M4 | "Zoomed in it looks straight" means the curve **is** straight there. | C5's residual is drawn as a nonzero labelled gap at every magnification; graded by asking what remains. |
| M5 | Continuous ⇒ differentiable. | C10, C11 + a graded counterexample the learner supplies. |
| M6 | The linear approximation is exact, or its error is unpredictable. | C5 and the \(h^2\) term in §7; graded by the sign-of-error transfer item. |

---

## Mathematical audit (Audit A)

- **Correct as stated?** Yes. C5 is the standard differentiability characterization; §7's error term is exact, not asymptotic hand-waving.
- **Any false simplification?** The risk is the zoom being taken as *proof* that a limit exists (M4). Mitigated structurally: every zoom beat displays the residual \(E(h)\) as a nonzero quantity, and the formal statement is derived algebraically in §7 for the canonical example rather than inferred from a picture.
- **Degenerate cases handled?** Corner (\(\lvert x\rvert\)), vertical tangent (\(x^{1/3}\), stated), inflection with a crossing tangent, and continuity-without-differentiability are all shown. A nowhere-differentiable continuous function is mentioned once as an existence remark and explicitly not developed.
- **Does the insight survive generalization?** Yes, and it is the reason the lesson is framed this way: C5 is exactly the definition that generalizes to L28's gradient and to the multivariable derivative as a linear map. "Slope of the tangent" does not generalize; "best linear approximation" does.
- **Anything asserted but not derived?** The product and quotient rules — flagged as stated in the scope note above and never used as if derived.

## Grounding & model-change audit (Audit B)

- **Does the bridge change the intelligible goal?** Yes. "Differentiate this" becomes "find the line this curve becomes here."
- **Is the bridge decorative?** No — it is a true instance, and the flat-Earth reading is precisely what C3 asserts. It also does real work later: L28's tangent plane is the same picture with one more dimension.
- **Are the analogy limits named?** Yes, three, including the important one: the Earth's curvature is constant and a graph's is not, so there is no single "flat enough" window size.
- **Does the learner return to the abstraction?** Yes — §14 step 4, evidenced by the inflection-point refutation.
- **Is the model change observable?** Yes: before, the learner recites three descriptions; after, they answer a rate question with a slope and an approximation question with the same number, and they can produce a counterexample to the school tangent definition.

---

## Review signoff

- [x] One primary insight selected; role of each supporting package recorded.
- [x] Causal chain complete, with the L1 dependency cited at the exact step that needs it (C2).
- [x] Minimal formal derivation present, exact, and hand-checkable.
- [x] Equivalence to the standard definition stated.
- [x] Cost stated honestly, including the epistemic cost of arguing from a picture and how it is discharged.
- [x] Transfer item specified, unfamiliar, and genuinely E4.
- [x] Bridge, correspondences, discarded elements, abstraction return recorded.
- [x] Audit A and Audit B complete; the picture-as-proof risk named with its structural mitigation.
- [x] Misconception list targeted, each with a grading obligation.

## Gate result

**Gate result: PASS**
