# Approved Insight Contract — What "approaches" means (L1)

Stage 2 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md),
selecting from [insight-brief.md](insight-brief.md), with Audits A and B.

Primary insight: **Package P1** — *a limit is a value the neighbours force.*
**P2** (the speedometer paradox) is the motivating need; **P3** (continuity as a
sampling guarantee) is the consequence and the forward edge. **P4** (zoom) is
deliberately withheld for L2.

---

## Primary insight (contents 1–11)

### 1. Diagnosed cognitive obstacle
An **incorrect prior model** — "a limit is what substitution gives, after
cancelling whatever breaks" — plus **notation with no operational content**.
Together they make \(0/0\) look like a trick, make "approaches" sound like
motion, and leave the learner believing the function's value *at* the point is
part of the question.

### 2. Insight mechanism(s)
**Operational grounding** (the limit as a challenge–response guarantee),
**representational change** (the tolerance band and the input window; the
punctured point), and **predictive/causal reorganization** (\(0/0\) re-read as
"which zero wins", and the value at the point re-read as irrelevant).

### 3. Initial mental model
"To find a limit, plug in. If that gives \(0/0\), do algebra until it doesn't,
then plug in. The answer is the function's value at the point, more or less."

### 4. Tension / redundancy
A car has a speed at every instant — the learner has watched a speedometer needle
sit at 50 while the car passes a single point. But *speed* is defined as distance
over time, and at an instant both are zero. So either the needle is showing
something undefined, or speed at an instant is determined by something other than
evaluation at that instant. The learner believes both halves and has never been
asked to reconcile them.

### 5. The model change
A limit is **not** a value you arrive at, and **not** the function's value at the
point. It is the value the function's *nearby outputs force*:

> \(\lim_{x\to a} f(x)=L\) means: **name any tolerance you like on the output,
> and I can name a window around \(a\) — not containing \(a\) itself — inside
> which every output is within that tolerance of \(L\).**

Three consequences, in order of how much they change the model:

1. **The value at \(a\) is never consulted.** Delete it and nothing changes. So a
   quantity can be pinned down at a point where the defining expression has no
   value at all — which is exactly the situation of every rate in this course.
2. **"Approaches" describes a guarantee, not a journey.** Nothing moves; there is
   no question of "getting there".
3. **\(0/0\) is a question, not an answer.** It says two quantities are both
   shrinking and asks which shrinks faster. Sometimes the answer exists;
   sometimes it does not; the tolerance game is what decides.

**Continuity** is then the *special* case in which the forced value happens to
equal the actual value: \(\lim_{x\to a}f(x)=f(a)\). Read forwards, that is a
promise — **nothing can hide between your samples**.

### 6. Full causal chain

| # | Step | Depends on |
| --- | --- | --- |
| C1 | Average speed over an interval is well defined: \(\Delta s/\Delta t\). | Entry algebra |
| C2 | At a single instant \(\Delta t = 0\) and \(\Delta s = 0\); the formula gives \(0/0\) and is undefined. | C1 |
| C3 | Yet the speedometer reads a definite number. So the number is determined by something other than evaluation at the instant. | C2, `ex-drive` |
| C4 | Compute \(\Delta s/\Delta t\) over a sequence of shrinking intervals containing the instant. The values **settle**. | C1 |
| C5 | "Settle" made precise: for **any** tolerance \(\varepsilon\) there is a window \(\delta\) such that every average from an interval inside the window is within \(\varepsilon\) of \(L\). | C4 |
| C6 | That guarantee **is** the definition of the limit. It consults only \(0<|x-a|<\delta\), never \(x=a\). | C5 |
| C7 | Therefore the value at \(a\) is irrelevant: puncture the graph and the limit is unchanged. | C6 |
| C8 | Therefore \(0/0\) is not a dead end. It is the *normal* form of a rate, and the tolerance game decides whether a rate exists. | C6, C2 |
| C9 | **Continuity** is the case \(\lim_{x\to a}f(x)=f(a)\): the forced value and the actual value agree. | C6 |
| C10 | Consequence: for a continuous function, sampling and interpolating is honest — nothing hides between samples. For a discontinuous one it is not. | C9 |
| C11 | The game can be lost in exactly four visible ways: **jump** (two different forced values), **removable** (a forced value the function disagrees with or omits), **oscillation** (no forced value), **blow-up** (outputs leave every band). | C6 |
| C12 | Forward: the derivative (L2) and the definite integral (L5) are both limits of expressions that are undefined at the limit. C7 is what licenses them. | C7, C8 |

### 7. Minimal formal derivation

For \(f(x) = x^2\) at \(a = 3\), the difference quotient over \([3, 3+h]\) is

\[
\frac{(3+h)^2 - 3^2}{h} = \frac{6h + h^2}{h} = 6 + h \quad (h \neq 0).
\]

At \(h=0\) the **left** expression is \(0/0\) and the **right** expression is
\(6\). They are equal for every \(h \neq 0\) and only there — which is precisely
the region the limit consults. Given \(\varepsilon>0\), take \(\delta=\varepsilon\):
then \(0<|h|<\delta \Rightarrow |(6+h)-6| = |h| < \varepsilon\). The guarantee is
met, so the limit is \(6\).

The cancellation is therefore **not** "fixing" the expression. It is exhibiting a
second expression that agrees with the first everywhere the limit looks, and
whose forced value is readable. That distinction is the lesson.

### 8. Equivalence to the original object
The definition above is the standard \(\varepsilon\)–\(\delta\) definition with
the quantifiers spoken rather than symbolised: "for every \(\varepsilon>0\) there
exists \(\delta>0\) such that \(0<|x-a|<\delta \Rightarrow |f(x)-L|<\varepsilon\)."
Nothing is weakened. The lesson states the symbolic form once, for recognition,
and does not require the learner to produce quantified proofs (a P3 obligation
this course does not claim).

### 9. Cost / model change
The learner must give up "substitute and hope" as the *definition* (it survives
as a valid shortcut **for continuous functions**, which is exactly what C9 says)
and must accept a definition that quantifies over all tolerances. In exchange
they get a criterion they can actually check, a reading of \(0/0\) that does not
treat the derivative as an accident, and the sampling guarantee that makes every
numerical method in the course legitimate.

### 10. What the learner can predict or do afterward
- Decide whether a limit exists **from a graph**, and name the failure mode.
- Say what changes if the function's value at the point is altered or deleted — and answer *nothing*.
- Compute a limit of the form \(0/0\) by exhibiting an expression that agrees off the point.
- Say why substitution is legitimate for a continuous function and illegitimate in general.
- Predict which of two shrinking quantities wins in a simple race.

### 11. Transfer assessment
Given an unfamiliar piecewise function they have not seen, decide at a specified
point whether the limit exists, whether the function is continuous there, and
whether **changing the value at that one point** could repair either. (Answer:
it can repair continuity; it can never create or destroy the limit — which is C7
applied in an unfamiliar setting.)

---

## 12. Bridge *(grounded insight)*
**A speedometer.** The learner already accepts that a car has a speed at an
instant and already knows the speed formula needs two times. The bridge is not a
decoration: it supplies the *contradiction* that motivates the definition, and the
same object (`ex-drive`) is the demonstration vehicle in L2, L5, and L6.

## 13. Preserved correspondences & analogy limits

| Bridge element | Mathematical counterpart | Preserved? |
| --- | --- | --- |
| Shrinking measurement interval | \(0<|x-a|<\delta\) | Yes |
| The needle settling | Values entering and staying in the \(\varepsilon\) band | Yes |
| Instrument precision | The tolerance \(\varepsilon\) | Yes — but see limits |
| "The needle gets there" | *Nothing gets anywhere.* | **No — discard** |
| A real speedometer's lag/averaging | Nothing; a physical artefact | **No — discard** |
| Finite measurement precision | The definition quantifies over **all** \(\varepsilon\), including ones no instrument could realise | **Named limit** — the mathematics is stronger than the instrument, and the lesson says so explicitly |

## 14. Abstraction return
1. **Grounded:** the speedometer contradiction and its resolution by shrinking intervals.
2. **Correspondence:** the two bands drawn on a graph — window \(\delta\), tolerance \(\varepsilon\) — named against the physical story.
3. **Unfamiliar:** the same bands on a function with no physical story, including one whose limit fails (oscillation), where no speedometer intuition helps.
4. **Symbolic:** \(\lim_{x\to a}f(x)=L\) stated, read aloud as the guarantee, and used to justify a substitution *by citing continuity*.

Evidence the return happened: the learner justifies a substitution by naming
continuity, not by naming the car.

---

## Prerequisites, limitations, likely misconceptions

**Prerequisites:** function notation, graph reading, inequalities and absolute
value as distance, algebraic simplification. (`functions-graphs-bridge` covers
these if the diagnostic flags them.)

**Limitations / scope:** no \(\varepsilon\)–\(\delta\) proof production; no limits
at infinity (L8); no L'Hôpital (needs L2, and would re-teach \(0/0\) as a rule);
no formal treatment of one-sided limits beyond "two games, one answer required";
no sequences.

**Likely misconceptions, each explicitly targeted:**

| # | Misconception | Where it is broken |
| --- | --- | --- |
| M1 | The limit is the value at the point. | C7 + the punctured-graph demonstration; graded. |
| M2 | \(x\) moves toward \(a\) and the question is whether it arrives. | C6's phrasing; the definition never mentions motion. |
| M3 | \(0/0\) means "no answer" or "cancel and it's fine". | C8 + §7's two-expressions argument; graded. |
| M4 | A limit exists whenever the graph looks smooth-ish. | C11's failure catalogue, including \(\sin(1/x)\). |
| M5 | Continuity means "drawable without lifting the pen". | Refuted directly: it is neither the definition nor a usable criterion; C9 replaces it. |
| M6 | If a limit exists the function is continuous there. | Removable-discontinuity case; graded. |

---

## Mathematical audit (Audit A)

- **Correct as stated?** Yes. §5's definition is the standard one; §7's \(\delta=\varepsilon\) works.
- **Any false simplification?** The phrase "the neighbours force the value" is informal but not false: it names exactly the quantifier structure. The lesson pairs it with the symbolic statement so the informality is never the only form on the page.
- **Degenerate cases handled?** Jump, removable, oscillatory, and blow-up are all shown, not just mentioned. One-sided limits are introduced only as the diagnostic for the jump case.
- **Does the insight survive generalization?** Yes — the same definition is used unchanged for \(h\to0\) in L2, for mesh \(\to 0\) in L5, and for \(b\to\infty\) in L8. It is not a special-case story.
- **Is anything asserted that the lesson does not derive?** The four-failure catalogue is presented as exhaustive *for the cases drawn*, not as a classification theorem — and the lesson says so.

## Grounding & model-change audit (Audit B)

- **Does the bridge change the intelligible goal?** Yes. Without it, "find the limit" is a school task. With it, the question is "what number is the needle showing, and what determines it?"
- **Is the bridge decorative?** No. It is the source of the contradiction in §4, and it is reused three more times in the course.
- **Are analogy limits named?** Yes — §13 names three, including the important one (real instruments have finite precision; the definition does not).
- **Does the learner return to the abstraction?** Yes — §14 step 4 requires justifying a substitution by citing continuity, with no reference to the bridge.
- **Is the model change observable?** Yes: before, the learner evaluates; after, the learner asks what the neighbours force, and answers M1/M3/M6 correctly.

---

## Review signoff

- [x] One primary insight selected, with its role for each supporting package recorded.
- [x] Causal chain complete: every step has its dependency, and the chain ends at the two lessons that consume it.
- [x] Minimal formal derivation present and checkable by hand.
- [x] Equivalence to the standard object stated, with the P3 obligation explicitly not claimed.
- [x] Cost to the learner stated honestly.
- [x] Transfer item specified and genuinely unfamiliar.
- [x] Bridge, correspondences, discarded elements, and abstraction return all recorded.
- [x] Audit A and Audit B complete.
- [x] Misconception list targeted, with the grading obligations marked.

## Gate result

**Gate result: PASS**
