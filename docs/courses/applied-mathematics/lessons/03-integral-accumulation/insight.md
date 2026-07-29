# Approved Insight Contract — The integral as accumulation (spine L3)

Stage 2 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md),
selecting from [insight-brief.md](insight-brief.md), with Audits A and B.

Primary insight: **Package P1** — *an integral is the total of a rate.* **P3**
(partition, sum, refine) is its machinery; **P2** (the odometer) is the opening
and the running-total close; **P4** (the shape of every later integral) is a
single forward sentence.

---

## Primary insight (contents 1–11)

### 1. Diagnosed cognitive obstacle
An **over-specific prior model**: "the integral is the area under the curve."
It gives the object the wrong type (geometry rather than totalling), strips its
units, hides why it must be a limit, and fights signed contributions. Compounded
by the **usual curricular ordering**, in which the antiderivative arrives first
and the Fundamental Theorem degenerates into a definition.

### 2. Insight mechanism(s)
**Semantic grounding** (a total accumulated from a rate — an obligation the
learner already holds, via an odometer) and **representational change** (the
rectangle re-read as a *product*, rate × duration, rather than a shape), with
**structural compression** in the closing observation that one construction reads
as distance, charge, energy, or mass depending only on what was plotted.

### 3. Initial mental model
"Integration finds the area under a graph. It is the opposite of differentiation.
The answer is a number of square units."

### 4. Tension / redundancy
The learner accepts two things that do not sit together. First, from L1 and L2,
the speedometer's reading at an instant is a genuine, well-defined number.
Second, everyone knows the odometer's change over a journey is "the area under
the speed graph". But an area is measured in squares of the page, and the
odometer reads in kilometres — the graph could be redrawn at half scale and its
area would quarter while the distance travelled did not change at all. So either
"area" is the wrong word, or the answer depends on how the graph was drawn.

It is the wrong word. What is invariant is not the area of a region on a page but
the **total of a rate**, and that total is the thing the area happens to depict
when the quantity plotted is a rate.

### 5. The model change

If a rate is **constant**, the total is rate × duration — no calculus, and the
learner already agrees. If the rate **varies**, chop the interval into pieces
short enough that the rate is nearly constant on each, take rate × width on each
piece, add, and then refine the chopping without bound. What the sums settle on is
the **definite integral**:

\[
\int_a^b f(x)\,dx \;=\; \lim_{\text{mesh}\to0}\ \sum_i f(x_i^\*)\,\Delta x_i .
\]

Three consequences that the area model does not give:

1. **Units.** Each term is (rate)(width). On the drive trace that is
   \((\mathrm{m/s})(\mathrm{s}) = \mathrm{m}\). The integral of a rate carries the
   units of the *total*, and this is how the learner will check every transform
   integral for the rest of the course.
2. **Sign.** A negative rate contributes a negative amount and walks the running
   total backwards. Nothing about that is an "area".
3. **Generality.** The same construction, applied to current, gives charge; to
   power, energy; to density, mass; and — in M5 — to a product of two functions,
   an inner product. The area picture is what the construction looks like when
   you have drawn the rate; it is a *consequence*, not the definition.

### 6. Full causal chain

| # | Step | Depends on |
| --- | --- | --- |
| C1 | Constant rate: total = rate × duration. Undisputed, and the whole lesson is built on it. | Entry |
| C2 | A varying rate has no single value to multiply by. But on a **short enough** piece it is nearly constant — and "short enough" is exactly what L1's **modulus of continuity** quantifies. | **L1 C9, C10b** |
| C3 | So approximate: chop \([a,b]\) into \(n\) pieces, and on each use one sampled rate times that piece's width. Each term is a **product with units**, not a shape. | C1, C2 |
| C4 | Sum the terms: a **Riemann sum**. Drawn, each term is a rectangle of height = rate and width = duration — so the sum *looks like* an area. | C3 |
| C5 | Refine. Left-sample and right-sample sums **bracket** the answer for a monotone rate, and the bracket closes. So refinement is a squeeze, not a hope. | C3, C4 |
| C6 | The sums settle on one value — L1's forced value, applied to a new quantity. Define \(\int_a^b f\) to be it. | **L1 C5, C6** |
| C7 | Because each term is (rate)(width), the total carries the *product* units. Redrawing the graph at another scale changes the picture's area and not the integral. | C3 |
| C8 | A negative rate gives negative terms, so the total decreases. The integral is **signed**. | C3 |
| C9 | Fixing \(a\) and letting the right endpoint move gives the **running total** \(A(x)=\int_a^x f\) — a function, not a number. On the drive trace, it is the odometer. | C6 |
| C10 | The same construction with a different plotted quantity totals charge, energy, mass. One machine, many meters. | C3, C7 |
| C11 | The construction is a **limit of weighted sums**, which is the shape of every integral in the rest of the course — inner products (L15), Fourier coefficients (L17), the Fourier transform (L18), the Laplace transform (L24), and line and surface integrals (L31, L35). *Shared shape only:* L15 and L17 are genuine orthogonal projections; L24 is not, and the lesson's forward sentence says "the same **kind of integral**", never "the same construction". | C6 |
| C12 | Forward: L4 asks whether \(A(x)\) has a shortcut. **This lesson deliberately does not answer that.** | C9 |

### 7. Minimal formal derivation

For \(f(x)=x^2\) on \([0,2]\) with \(n\) equal pieces of width \(2/n\), sampling at
right endpoints \(x_i = 2i/n\):

\[
S_n=\sum_{i=1}^{n}\left(\frac{2i}{n}\right)^2\frac{2}{n}
=\frac{8}{n^3}\sum_{i=1}^{n} i^2
=\frac{8}{n^3}\cdot\frac{n(n+1)(2n+1)}{6}
=\frac{4}{3}\cdot\frac{(n+1)(2n+1)}{n^2}.
\]

As \(n\to\infty\) this tends to \(\tfrac{8}{3}\). The left-endpoint sum is
\(S_n - \frac{8}{n}\), which tends to the same value from below, so the two
bracket \(\tfrac{8}{3}\) and the bracket closes at rate \(1/n\) — C5, exhibited
rather than asserted.

Every number here is elementary and checkable by hand, and no antiderivative
appears anywhere in the derivation. That is the point.

### 8. Equivalence to the original object
This is the standard Riemann integral, restricted to continuous integrands on
closed bounded intervals — which is every integrand in Package A. The definition
via a general mesh and arbitrary sample points is stated; the demonstrations use
equal widths. Nothing is weakened, and the restriction is declared rather than
hidden.

### 9. Cost / model change
The learner gives up a comfortable one-line answer to "what is an integral?" and
takes on a construction with three moving parts. They must also tolerate the
lesson **not** telling them how to compute integrals in general — the only tools
here are a formula for \(\sum i^2\) and geometry for simple shapes. That is
uncomfortable and is the price of L4 being a theorem. In exchange they get an
object with units, a sign, and a type that survives every later use in the course.

### 10. What the learner can predict or do afterward
- Say what an integral computes in an unfamiliar applied setting, **with units**, before computing anything.
- Estimate an integral from a graph or a table by partitioning, and say whether the estimate is high or low.
- Predict the sign of an integral from the sign of the rate.
- Read a running-total graph against a rate graph: where the total rises, falls, is flat, is steepest.
- Say why the answer does not depend on the graph's drawing scale.

### 11. Transfer assessment
Given a **current-against-time** trace they have not seen — with the current going
negative partway through — state what \(\int i\,dt\) computes and in what units,
predict from the graph alone whether the final total is larger or smaller than the
maximum reached, and justify. This is E4: the negative-rate reasoning (C8) is
shown once on the drive trace and never drilled, and "the total can be less than
its own maximum" is exactly the prediction the area model gets wrong.

---

## 12. Bridge *(grounded insight)*
**An odometer and a speedometer.** Third appearance of `ex-drive`. L1 asked what
the speedometer's instantaneous reading could mean; L2 said what it was the slope
of; this lesson turns the reading into the *other* instrument's number. The bridge
carries real weight: the learner already knows both instruments agree, and that
belief is precisely what L4 will convert into a theorem.

## 13. Preserved correspondences & analogy limits

| Bridge element | Mathematical counterpart | Preserved? |
| --- | --- | --- |
| Speedometer trace | The integrand \(f\) | Yes |
| Odometer reading | The running total \(A(x)\) | Yes |
| A short stretch at nearly constant speed | One partition piece | Yes |
| Reversing the car | Negative rate, decreasing total | Yes |
| An odometer that only counts up | The integral is **signed** | **No — named limit**: real odometers do not run backwards, and the lesson says so explicitly at the reversing beat |
| Reading the odometer at the start and end | *That shortcut is L4's theorem, not available yet* | **No — deliberately withheld** |
| A real journey's finite sampling | The definition refines without bound | **No — named limit** |

## 14. Abstraction return
1. **Grounded:** speed and distance on `ex-drive`.
2. **Correspondence:** the partition drawn on the speed trace, each rectangle
   labelled with its (m/s)(s) = m product, and the running total plotted beneath.
3. **Unfamiliar:** the same construction on `ex-parabola`, which has no physical
   reading, with the sum computed symbolically (§7).
4. **Symbolic:** \(\int_a^b f(x)\,dx=\lim\sum f(x_i^\*)\Delta x_i\), used to state
   what a *current* integral computes without any journey in sight.

Evidence the return happened: on the transfer item the learner names the units of
\(\int i\,dt\) from the axes alone.

---

## Prerequisites, limitations, likely misconceptions

**Prerequisites:** L1 (`limits-continuity`) — hard, for C2 (continuity and its
modulus) and C6 (the forced value). **Not** L2:
this lesson deliberately does not use the derivative, so that L4's connection is
unspoiled. (L2 nonetheless precedes it in the spine, for the FTC's sake.)

**Limitations / scope — the exclusions are load-bearing:**

- **No antiderivative.** Not named, not hinted, not in an exercise. Hard exclusion.
- **No Fundamental Theorem.** L4 owns it.
- **No integration techniques.** L7 owns them.
- **No improper integrals.** L8 owns them.
- No general integrability theory; continuous integrands on closed bounded
  intervals only, declared.
- No area-for-its-own-sake applications. This course never needs them.

**Likely misconceptions, each explicitly targeted:**

| # | Misconception | Where it is broken |
| --- | --- | --- |
| M1 | An integral is an area, so its answer is in square units. | C7 + the units readout on every rectangle; graded by requiring units on an unfamiliar integrand. |
| M2 | Integrals are non-negative. | C8 + the reversing beat; graded on the transfer item. |
| M3 | The rectangles are an approximation to a "real" area that exists independently. | C6: the value is *defined* by the refinement, and the drawing scale argument in C7 shows the area was never the invariant. |
| M4 | Refining might not converge / is a leap of faith. | C5's bracketing, exhibited numerically in §7. |
| M5 | The integral is a number, so the running total is not a thing. | C9 + the second plotted trace. |
| M6 | "It's the opposite of differentiation" — imported from prior schooling. | Not refuted (it is true), but **firmly deferred**: the lesson states that the relationship, if any, has not been established here and is the next lesson's question. |

---

## Mathematical audit (Audit A)

- **Correct as stated?** Yes. §7's sum, its limit, and the \(1/n\) bracket width are exact.
- **Any false simplification?** The bracketing claim in C5 holds **for monotone integrands**; on a non-monotone rate the left and right sums do not bracket. The lesson states the restriction at the moment it makes the claim and uses a monotone piece to demonstrate it. This is the audit's principal finding and is carried into the contract's correctness checks.
- **Degenerate cases handled?** Negative rate; a rate that changes sign; a constant rate (where the construction collapses to C1 and must visibly do so); a partition so coarse the estimate is poor.
- **Does the insight survive generalization?** Yes, and it is chosen for that: "limit of weighted sums" is exactly the form reused for inner products, Fourier coefficients, transforms, and — in M7 — line integrals over a path. "Area under a curve" generalizes to none of them.
- **Anything asserted but not derived?** \(\sum i^2 = n(n+1)(2n+1)/6\) is stated as a known finite-sum identity (entry algebra), used only to make §7 hand-checkable.

## Grounding & model-change audit (Audit B)

- **Does the bridge change the intelligible goal?** Yes. "Find the area" becomes "how far did it go?", which the learner already wants to answer.
- **Is the bridge decorative?** No — and it is doing structural work across four lessons, since the learner's existing belief that the two instruments agree is the raw material for L4's theorem.
- **Are analogy limits named?** Yes, three, including the one that matters: real odometers do not run backwards, and the integral does.
- **Does the learner return to the abstraction?** Yes — §14 step 4 and the transfer item, both of which require the units to be read from the axes with no journey available.
- **Is the model change observable?** Yes: before, the learner answers "area"; after, they answer with a quantity **and its units**, and they correctly predict a negative contribution.

---

## Review signoff

- [x] One primary insight selected; role of each supporting package recorded.
- [x] Causal chain complete, with the L1 dependency cited at C2/C6 and the deliberate non-dependency on L2 recorded.
- [x] Minimal formal derivation present, exact, hand-checkable, and **antiderivative-free**.
- [x] Equivalence to the standard Riemann integral stated, with its declared restriction.
- [x] Cost stated honestly, including the discomfort of withholding the computational shortcut.
- [x] Transfer item specified, unfamiliar, and genuinely E4.
- [x] Bridge, correspondences, discarded elements, abstraction return recorded.
- [x] Audit A and Audit B complete; the monotone-bracketing restriction found and carried forward.
- [x] Misconception list targeted, including the deferral (not refutation) of M6.

## Gate result

**Gate result: PASS**
