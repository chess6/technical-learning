# Insight Contract — Accumulating Forever (spine L8, `improper-integrals`)

**Gate 4 artifact.** Drafted 2026-08-10 under ADR-008 from the judged Gate-3
brief ([insight-brief.md](insight-brief.md)); audit status at the end.

Spine row (M2 `calculus-technique`, L8 — the module's last lesson).
Benchmark bar consumed (M2, **P2**, quoted): "improper convergence judged by
decay rate"; P1 supplies "standard improper integrals". Comparison **proved**
sits in the P3 enrichment column — used honestly here, its hinge *named*, not
proved.

## Primary insight (contents 1–11)

### 1. Diagnosed cognitive obstacle

**An incorrect prior model installed by notation.** \(\int_a^\infty f\) is
typographically the object L3/L4 defined, so it reads as "the same thing on a
bigger interval" — already meaningful, already "the area", with \(\infty\) as
an endpoint to plug in. Symptom: \([F(x)]_1^\infty\) written fluently. Sharp
failure: the blind FTC ritual across a singularity,
\(\int_{-1}^{1} x^{-2}dx = [-1/x]_{-1}^1 = -2\) — a **negative area for a
positive integrand**, produced without alarm. Entangled second half: *"the
integrand goes to 0, so the total is finite"* — height confused with
accumulated area, assigning \(1/x\) and \(1/x^2\) the same fate. A learner
holding the first half cannot even say what "fails to exist" would mean; in
their model the symbol is an object, not a claim.

### 2. Insight mechanism(s)

**Demotion** (the improper integral is not a new object but a *claim* about
the family of honest L3/L4 integrals — that their values settle), carrying a
**structural compression** (both improper types, the bounds shorthand, the
mandatory split of \(\int_{-\infty}^\infty\), and the plug-in rule's domain
of validity all fall out of one sentence about L3/L4's contract), with a
**representational shift** (convergence becomes *visible* on the
accumulation graph as leveling-off, where the area picture shows nothing).

### 3. Initial mental model

"\(\int_1^\infty \frac{dx}{x^2}\) is the area out to infinity: antidifferentiate,
plug in \(\infty\) and the lower bound, subtract. If the integrand dies out,
the area is finite. \(\int_{-1}^1 x^{-2}dx\) works the same way: \(-1/x\)
evaluated at both ends gives \(-2\)."

### 4. Tension / redundancy

The ritual computes \(-2\) for a positive integrand and nothing in the
learner's model objects. Meanwhile every piece needed for the honest account
is already owned: L3/L4 defined \(\int_a^b\) for **bounded integrands on
closed bounded intervals** — both hypotheses load-bearing, both violated
above — L4 shipped the accumulation function \(A(R)\) as a first-class
object, and L1 supplied the tolerance grammar for "the values settle". What
is missing is only the honest sentence: there is no infinite integral — only
finite ones, and a claim about their limit.

### 5. The model change

**There is no such thing as an infinite integral** — only honest finite
accumulations on closed bounded intervals, and the *claim* that their values
settle as the intervals exhaust the domain. That claim lives entirely in the
tail. Among the decaying integrands this course runs on, the decay **rate**
decides it — \(1/x\) and \(1/x^2\) both die, but only the one that dies fast
enough leaves a finite total — and comparison against the \(p\)-family
inherits the verdict even when no antiderivative can be written, which is
what licenses every transform integral in the course.

### 6. Full causal chain

L3/L4's integral has two load-bearing hypotheses → \(\infty\) (or a
singularity) violates one → so \(\int_a^\infty f\) must be *defined*, and
the only honest definition is a limit of the already-owned objects → a limit
can fail, so convergence/divergence are real outcomes with L1's grammar →
the head \(\int_a^c\) is proper and irrelevant, so the claim lives in the
tail → on the accumulation graph the claim is visible (settling vs. creeping)
→ the \(p\)-family calibrates *how fast* is fast enough (octave rents: equal
forever vs. geometrically shrinking) → order passes through finite sums to
limits, so a tail trapped under a convergent tail settles too (comparison) —
convergence decided **without the antiderivative** → which redeems
\(e^{-x^2}\): L7 proved no elementary antiderivative exists; the total
exists anyway.

### 7. Minimal formal derivation

**(a) The limit at infinity — new, declared.** \(\lim_{R\to\infty}A(R) = L\)
means: for every tolerance \(\varepsilon > 0\) there is a threshold \(M\)
with \(|A(R) - L| < \varepsilon\) for all \(R > M\) — L1's guarantee with
the window replaced by a threshold. This is the course's first limit at
infinity; L9 inherits it. L6's discipline carries over verbatim: the limit
supplies *some* threshold, never a rate.

**(b) Type I definition.** For \(f\) integrable on every \([a,R]\):
\(\int_a^\infty f := \lim_{R\to\infty}\int_a^R f\) when that limit exists;
otherwise the integral **diverges** — the claim fails. "\([F(x)]_a^\infty\)"
is legitimate shorthand exactly when \(\lim_{R\to\infty}F(R)\) exists, and
means that limit.

**(c) Type II definition.** For \(f\) integrable on every \([a+\varepsilon,b]\)
but unbounded near \(a\): \(\int_a^b f := \lim_{\varepsilon\to 0^+}
\int_{a+\varepsilon}^b f\), when it exists. Both types are one move: exhaust
the bad edge, ask whether the values settle.

**(d) The scandal dissected.** L4's FTC evaluation requires the integrand
continuous on the closed interval; \(x^{-2}\) is unbounded near \(0\), so on
\([-1,1]\) the theorem never applied — the \(-2\) was never the value of
anything. Honest repair: split at the singularity into two Type II claims;
\(\int_\varepsilon^1 x^{-2}dx = 1/\varepsilon - 1 \to \infty\), so each half
diverges, so the whole diverges.

**(e) The \(p\)-ladder, both edges, with its mechanism.** For \(p \neq 1\):
\(\int_1^R x^{-p}dx = \frac{R^{1-p}-1}{1-p} \to \frac{1}{p-1}\) iff
\(p > 1\); at \(p = 1\), \(\ln R\) exceeds every bound (name \(M\); \(R =
e^M\) defeats it). Mirrored at the singular edge: \(\int_\varepsilon^1
x^{-p}dx \to \frac{1}{1-p}\) iff \(p < 1\). The mechanism: one L7
substitution (\(u = x/2^k\)) shows \(\int_{2^k}^{2^{k+1}}\frac{dx}{x} =
\ln 2\) — **equal rent forever** — while for \(p>1\) the octave payments
form a geometric sequence with ratio \(2^{1-p} < 1\), trapped under the
finite geometric bound (algebra entry assumption). That is *why* \(p=1\) is
the knife-edge.

**(f) The tail principle.** \(\int_a^R f = \int_a^c f + \int_c^R f\) (L7's
additivity); the first term is a fixed proper integral, so
\(\lim_R \int_a^R f\) exists iff \(\lim_R \int_c^R f\) does. Convergence is
a property of the tail.

**(g) Comparison — with its hinge named.** Suppose \(0 \le f \le g\) on
\([c,\infty)\) and \(\int_c^\infty g\) converges. Two facts: (i) **order
passes through finite sums to the limit** — every Riemann sum for \(f\) is
\(\le\) the corresponding sum for \(g\), so \(\int_c^R f \le \int_c^R g \le
\int_c^\infty g\) — stated by this lesson at the sum level, like L7 stated
additivity; (ii) \(A(R) = \int_c^R f\) is nondecreasing in \(R\) (since
\(f \ge 0\)) and bounded above, and a **bounded nondecreasing accumulation
settles** — the *Monotone Accumulation Principle*, named here as the
supplied completeness hypothesis exactly as L6 named the EVT; its proof is
the P3 enrichment column's, not this lesson's. Hence \(\int_c^\infty f\)
converges. No antiderivative of \(f\) was consulted.

**(h) The refusal.** \(\int_{-\infty}^{\infty} f := \int_{-\infty}^c f +
\int_c^\infty f\), **each required to converge independently** (the value
independent of \(c\) by (f)). For \(f(x) = x\): symmetric windows report
\(0\) forever, offset windows run away, and \(\int_0^R x\,dx = R^2/2\)
diverges — so the whole diverges. An "answer" that depends on the route is
no answer; the definition exists to refuse route-dependent values.
(Symmetric truncation is not wrong arithmetic — it is the principal value, a
different, well-defined object that is simply not this definition; one
sentence, no development.)

**(i) Divergence without infinity.** \(\int_0^R \sin x\,dx = 1 - \cos R\)
oscillates in \([0,2]\) forever: bounded, never settling. "Diverges" means
*the limit fails*, not "the area is infinite" — the two are graded as
distinct claims.

**(j) The redemption, and the boundary term at infinity.** On
\([1,\infty)\), \(x^2 \ge x\), so \(e^{-x^2} \le e^{-x}\), and
\(\int_1^\infty e^{-x}dx = e^{-1}\); by (g), \(\int_1^\infty e^{-x^2}dx\)
converges, and with the proper head \(\int_0^1\), the total exists — a
definite value for the integral of a function whose antiderivative L7 proved
non-elementary (the value, \(\sqrt{\pi}/2\), is planted as a much later
derivation and **not claimed here**). And parts on \([0,R]\):
\(\int_0^R xe^{-x}dx = [-xe^{-x}]_0^R + \int_0^R e^{-x}dx = -Re^{-R} +
(1 - e^{-R})\). The boundary entry at \(\infty\) is *itself a limit that
must converge, checked and never plugged*: \(Re^{-R} \to 0\) because — FTC
twice, fully owned — \(e^R = 1 + \int_0^R e^t dt \ge 1 + R\), and iterating,
\(e^R \ge 1 + R + R^2/2\), so \(0 \le Re^{-R} \le \frac{R}{1 + R + R^2/2}
\to 0\). Total: \(1\). This is Theme 1's boundary term one level up, and the
exact shape of the Laplace derivative rule.

### 8. Equivalence to the original object

Nothing replaces the standard material: both definitions, the \(p\)-test,
comparison with hypotheses, and every worked value appear — now as
consequences of one sentence about L3/L4's contract. The plug-in shorthand
survives with its domain of validity attached: legitimate exactly when the
limit it abbreviates exists (\(1/(1+x^2)\): \(\arctan\) exists, ruler and
ritual agree).

### 9. Cost / model change

The learner gives up the completed infinite object and accepts a claim that
can fail — including failure without anything blowing up (i). "Goes to 0"
is demoted from certificate to survivor's condition, in L6's filter grammar
verbatim: it survives the filter the way \(f'(a) = 0\) survived L6's, and
certifies nothing.

### 10. What the learner can predict or do afterward

- Given a fresh symbolic integrand and no plot, classify
  **converges / diverges / insufficient information**, citing a ladder rung
  or a tail comparison with its inequality direction and hypotheses.
- Produce a valid comparator for a fresh tail (any valid one — the grading
  checks the tail inequality, not one blessed witness).
- Dissect the scandal: name the violated hypothesis, split at the
  singularity, run the honest limit.
- Refuse \(\int_{-\infty}^\infty x\,dx = 0\), and say what the symmetric
  answer actually is (a different object, not this definition).
- State what "converges" alone says about how far to integrate for
  \(10^{-3}\) accuracy — *nothing*; the rate does — and what \(f \to 0\)
  alone settles — *nothing*.
- Check a boundary term at \(\infty\) as a limit rather than plugging.

### 11. Transfer assessment

Nearest structure: **L10's series** — the identical demotion ("an infinite
sum is the limit of its partial sums"), where the necessity contrast
sharpens (\(a_n \to 0\) IS necessary for series; decay is NOT necessary for
integral convergence — this lesson must not poison that contrast, so the
non-necessity guardrail stays in the contract's limitation list rather than
learner prose). Then L11/L24: radius and region of convergence as "which
parameter values win the race"; M5–M7: every transform integral is licensed
here — the keystone claim; M7's Laplace derivative rule is (j)'s boundary
term with an initial condition in it.

## 12. Bridge *(grounded insight)*

The scandal, run live: the learner executes their own fluent L4 ritual on
\(\int_{-1}^1 x^{-2}dx\), gets \(-2\), and is asked to find the violated
clause — the definition then arrives as the *restoration of a revoked
license*, not as pedantry.

## 13. Preserved correspondences & analogy limits

The demotion is exact: every improper integral IS a limit of L3/L4 objects,
by definition — there is no edge where the reading fails. The honest limits
are recorded instead as guardrails: the race/rent vocabulary adds agents and
completion (misconception (i) re-armed), so the lesson's graded return is
symbolic — comparison chains written as inequalities with hypotheses — and
never a pointed-at leveling curve; decay-to-0 is *not* claimed necessary
(false for integrals: spike trains — contract limitation list only);
oscillatory cancellation (\(\sin x / x\)) is a different mechanism and decay
rate is never claimed to cover it.

## 14. Abstraction return

Cold restatement at the end: both definitions; the \(p\)-test with both
edges; comparison with hypotheses (\(0 \le f \le g\) on a tail, \(\int g\)
convergent) and its named hinge; the split rule for two-sided domains; the
shorthand's validity condition. The exit test is symbolic classification
with cited reasons — a learner reciting "p-test, comparison test" fails the
three probes in §10.

## Prerequisites, limitations, likely misconceptions

**Requires:** L1's tolerance grammar (mirrored for the threshold game);
L3/L4's integral with its two hypotheses explicit, and L4's accumulation
function as a first-class object; the FTC for every ladder rung; L7's
substitution (octave equality), parts (the boundary term), additivity (used
in (f)), and the \(e^{-x^2}\) non-elementarity theorem cited verbatim; the
finite geometric bound (algebra entry assumption, spine §2.1).

**New machinery, declared:** the limit at infinity (a); order-through-limits
at the Riemann-sum level (g)(i); the Monotone Accumulation Principle (g)(ii)
— named, proof deferred to the P3 column, parallel to L6's EVT.

**Withheld:** conditional convergence and \(\int_0^\infty \frac{\sin x}{x}\);
limit-comparison as a named test; the value \(\sqrt{\pi}/2\); principal
value beyond one honest sentence; the Gamma function; the integral test
(L10 owns it — the octave bars are its picture, planted silently).

**Likely misconceptions, each with its break:** (1) plug-in-\(\infty\) as an
operation → broken by the scandal + (b)'s shorthand rule; (2) "goes to 0 ⇒
converges" → broken by the \(1/x\) confrontation and the challenge game;
(3) blind FTC across a singularity → broken by (d); (4) "diverges =
infinite" → broken by (i); (5) "symmetric so zero" → broken by (h).

## Mathematical audit (Audit A)

**PENDING.** Adversarial audit launched 2026-08-10 (fresh lineage, ADR-008
§4); this section is filled from its actual findings, never before. Author's
pre-audit notes for the auditors to attack: (g)'s two named facts are
deliberately *supplied*, not proved — check the naming discipline against
L6's EVT precedent rather than demanding proofs the P3 column owns; (j)'s
\(Re^{-R} \to 0\) argument claims to be fully owned via FTC-twice — check
each step's provenance; (e)'s Type II mirror and the exact octave-substitution
computation deserve independent verification.

## Grounding & model-change audit (Audit B)

**PENDING** — same round. Flagged for special care (the brief's own
instruction): the race/rent vocabulary must be named and discarded in the
abstraction return, and the assessment must detect a learner who acquired
the picture but not the concept.

## Review signoff

Not yet signed.

## Gate result

**NOT YET PASS.** Gate 5 must not consume this contract until the audit
returns and this line is updated from its real findings.
