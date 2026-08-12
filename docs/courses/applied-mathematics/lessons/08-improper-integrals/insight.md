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
is already owned: L3 guarantees the proper Riemann integral for a
**continuous integrand on a closed bounded interval**, and L4's FTC
evaluation uses that same continuity hypothesis. The two improper cases break
different clauses: an infinite endpoint is not a finite closed interval,
while \(x^{-2}\) is not continuous (or proper-integrable) across \(0\), even
though \([-1,1]\) itself is closed and bounded. L4 shipped the accumulation
function \(A(R)\), and L1 supplied the tolerance grammar for "the values
settle". What is missing is the honest definition: an improper integral is a
claim about limits of proper finite integrals.

### 5. The model change

**In this course's improper-Riemann setting, the infinity notation names no
completed infinite object** — it abbreviates a claim that proper finite
accumulations settle as their intervals exhaust the domain. That claim lives
in the tail. For the nonnegative tails compared with the \(p\)-family, decay
rate decides the verdict: \(1/x\) and \(1/x^2\) both die, but only one dies
fast enough. Comparison can inherit that verdict even when no elementary
antiderivative can be written. This supplies the notation later transform
integrals use; each transform still owes its own convergence hypotheses.

### 6. Full causal chain

L3/L4's proper-integral guarantee has load-bearing continuity and finite-
interval hypotheses → \(\infty\) violates the interval hypothesis while a
singularity violates the integrand hypothesis → so \(\int_a^\infty f\) must be *defined*, and
the only honest definition is a limit of the already-owned objects → a limit
can fail, so convergence/divergence are real outcomes with L1's grammar →
the head \(\int_a^c\) is proper and irrelevant, so the claim lives in the
tail → on the accumulation graph the claim is visible (settling vs. creeping)
→ the \(p\)-family calibrates *how fast* is fast enough (octave rents: equal
forever vs. geometrically shrinking) → order passes through finite sums to
limits, so a tail trapped under a convergent tail settles too (comparison) —
convergence decided **without the antiderivative** → which redeems
\(e^{-x^2}\): L7 cited Liouville's non-elementarity result; the total exists
anyway.

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

**(c) Type II definition.** If the left endpoint is bad but \(f\) is
integrable on every \([a+\varepsilon,b]\), define
\(\int_a^b f := \lim_{\varepsilon\to 0^+}\int_{a+\varepsilon}^b f\), when
the limit exists. A bad right endpoint uses \(\lim_{\varepsilon\to0^+}
\int_a^{b-\varepsilon}f\). An interior bad point \(c\) requires the two
one-sided improper integrals to converge independently before they may be
added. Both improper types are one move: exhaust each bad edge and ask
whether the values settle.

**(d) The scandal dissected.** L4's FTC evaluation requires the integrand
continuous on the closed interval; \(x^{-2}\) is unbounded near \(0\), so on
\([-1,1]\) the theorem never applied — the \(-2\) was never the value of
anything. Honest repair: split at the singularity into two Type II claims;
\(\int_\varepsilon^1 x^{-2}dx = 1/\varepsilon - 1 \to \infty\), so each half
diverges, so the whole diverges.

**(e) The \(p\)-ladder, both edges, with its mechanism.** For \(p \neq 1\):
\(\int_1^R x^{-p}dx = \frac{R^{1-p}-1}{1-p} \to \frac{1}{p-1}\) iff
\(p > 1\); at \(p = 1\), \(\ln R\) exceeds every bound (name \(M\); \(R =
e^{M+1}\) gives \(\ln R=M+1>M\)). Mirrored at the singular edge: \(\int_\varepsilon^1
x^{-p}dx \to \frac{1}{1-p}\) iff \(p < 1\). The mechanism: one L7
substitution (\(u = x/2^k\)) shows \(\int_{2^k}^{2^{k+1}}\frac{dx}{x} =
\ln 2\) — **equal rent forever** — while for \(p>1\) the octave payments are
\(C_p2^{k(1-p)}\), where \(C_p=\int_1^2u^{-p}du>0\), with ratio
\(q=2^{1-p}<1\). Derive the needed finite bound here:
\(S_n=1+q+\cdots+q^n\) satisfies \((1-q)S_n=1-q^{n+1}\), hence
\(S_n\le1/(1-q)\). Every finite octave accumulation is therefore bounded by
\(C_p/(1-q)\). That is *why* \(p=1\) is the knife-edge.

**(f) Interval additivity and the tail principle — introduced here.** If
\(f\) is Riemann integrable on \([a,R]\) and \(a<c<R\), take tagged
partitions of \([a,c]\) and \([c,R]\); their union is a partition of
\([a,R]\), and its finite sum splits exactly into the two subinterval sums.
Passing each refinement to its proper-integral limit gives
\(\int_a^R f = \int_a^c f + \int_c^R f\). This is interval additivity, not
L7's linearity in the integrand. The first term is a fixed proper integral, so
\(\lim_R \int_a^R f\) exists iff \(\lim_R \int_c^R f\) does. Convergence is
a property of the tail.

**(g) Comparison — with its hinge named.** Suppose \(f\) and \(g\) are
Riemann integrable on every \([c,R]\), \(0 \le f \le g\) on
\([c,\infty)\), and \(\int_c^\infty g\) converges. Two facts: (i) **order
passes through finite sums to the proper-integral limit** — on each common
tagged partition, corresponding sample points give every sum for \(f\) at
most the sum for \(g\); passing both nets of sums to their proper-integral
limits gives \(\int_c^R f \le \int_c^R g \le \int_c^\infty g\); (ii)
\(A(R) = \int_c^R f\) is nondecreasing in \(R\) (since
\(f \ge 0\)) and bounded above, and a **bounded nondecreasing accumulation
settles** — the *Monotone Accumulation Principle*, named here as the
supplied completeness hypothesis exactly as L6 named the EVT; its proof is
the P3 enrichment column's, not this lesson's. Hence \(\int_c^\infty f\)
converges. No antiderivative of \(f\) was consulted. The positive divergence
direction is separate: if \(f,g\) are proper-integrable on every truncation,
\(0\le g\le f\), and \(\int_c^R g\to+\infty\), then
\(\int_c^R f\ge\int_c^R g\), so \(\int_c^\infty f\) diverges to \(+\infty\).
Neither statement covers oscillatory cancellation.

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
definite value for the integral of a function whose antiderivative L7 stated
as non-elementary with Liouville attribution (the value \(\sqrt{\pi}/2\) has
no assigned owner in the current spine and is **not claimed here**). And parts on \([0,R]\):
\(\int_0^R xe^{-x}dx = [-xe^{-x}]_0^R + \int_0^R e^{-x}dx = -Re^{-R} +
(1 - e^{-R})\). The boundary entry at \(\infty\) is *itself a limit that
must converge, checked and never plugged*: for \(R\ge0\), \(e^t\ge1\), so
FTC plus integral order gives
\(e^R=1+\int_0^R e^t dt\ge1+\int_0^R1\,dt=1+R\). Apply this bound with the
running variable \(t\): \(e^t\ge1+t\); integrate again to obtain
\(e^R=1+\int_0^Re^t dt\ge1+\int_0^R(1+t)dt=1+R+R^2/2\). Therefore
\(0 \le Re^{-R} \le \frac{R}{1 + R + R^2/2}
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
  or a tail comparison with its inequality direction, truncation-integrability
  hypotheses, and the known convergence/divergence fact on the correct side.
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

- **L10 series — exact structural correspondence in the definition shape:**
  an infinite sum is defined as a limit of finite partial sums. The objects
  are different, and the necessity contrast sharpens: \(a_n\to0\) is
  necessary for a series, while pointwise decay is not necessary for an
  improper integral.
- **L11 radius and L24 region of convergence — architectural transfer:** a
  parameter indexes a family of convergence claims. The race language is not
  a theorem about those regions.
- **M5–M7 transform integrals — architectural/notation licensing:** L8 makes
  their improper notation meaningful; it does not prove that every transform
  converges. Each later lesson must verify its own hypotheses.
- **M7 Laplace derivative rule — exact formal pattern when its hypotheses
  hold:** integration by parts produces the same checked boundary term, with
  the initial condition at the finite edge.

## 12. Bridge *(grounded insight)*

The scandal, run live: the learner executes their own fluent L4 ritual on
\(\int_{-1}^1 x^{-2}dx\), gets \(-2\), and is asked to find the violated
clause — the definition then arrives as the *restoration of a revoked
license*, not as pedantry.

## 13. Preserved correspondences & analogy limits

| Exact mathematical correspondence | Pragmatic addition to discard |
| --- | --- |
| The graph's ordinate at \(R\) is exactly the proper accumulation \(A(R)=\int_a^R f\). | A finite screen that looks level does not prove a limit or supply a convergence rate. |
| "Settles" means the threshold form of the limit: after some \(M\), every later \(A(R)\) stays within every requested tolerance. | There is no completed infinite act waiting at the finish line. |
| One octave bar is exactly \(\int_{2^k}^{2^{k+1}} f\); equal or geometric bar totals are computed facts. | "Rent" adds payments, obligation, and an agent paying them; none transfers to the integral. |
| A comparison "race" is exactly a pointwise tail inequality plus a known verdict on the appropriate comparator. | Functions do not compete, choose, win, or move through time; the metaphor adds agency and causality. |

The demotion itself is exact by definition. Decay-to-zero is not claimed
necessary (spike trains remain a limitation-list counterexample), and
oscillatory cancellation such as \(\sin x/x\) is a different mechanism not
covered by the positive comparison scale.

## 14. Abstraction return

The return runs all four required stages:

1. **Grounded case:** manipulate the accumulation graph and octave bars; run
   the scandal and the comparison race.
2. **Explicit correspondence:** name \(A(R)=\int_a^R f\), write each octave
   bar as its definite integral, and translate "trapped" into the full
   pointwise inequality with hypotheses.
3. **Unfamiliar case:** classify a new tail with no graph and produce either a
   convergent majorant or divergent minorant with the inequality facing the
   correct way.
4. **Symbolic case:** restate both definitions, both \(p\)-edges, comparison,
   the two-sided split, and the shorthand's validity condition.

The discriminator is the exit set: a learner who only points to leveling or
says "wins the race" fails unless they write the symbolic inequality, name
which comparator verdict is known, and state the truncation-integrability
hypotheses. The three probes in §10 separately catch memorized test names.

## Prerequisites, limitations, likely misconceptions

**Requires:** L1's tolerance grammar (mirrored for the threshold game);
L3/L4's proper-integral continuity and finite-interval hypotheses, and L4's
accumulation function; the FTC for every ladder rung; L7's substitution
(octave scaling), parts (the boundary term), and Liouville-attributed
non-elementarity statement for \(e^{-x^2}\). L7's additivity is linearity in
the integrand and is not used as interval additivity.

**New machinery, declared or derived here:** the limit at infinity (a);
left/right/interior Type-II definitions (c); the finite geometric bound and
its octave connection (e); interval additivity (f); order on corresponding
Riemann sums and both positive comparison directions (g); the Monotone
Accumulation Principle (g)(ii) — named, proof deferred to the P3 column,
parallel to L6's EVT.

**Withheld:** conditional convergence and \(\int_0^\infty \frac{\sin x}{x}\);
limit-comparison as a named test; the unassigned value \(\sqrt{\pi}/2\); principal
value beyond one honest sentence; the Gamma function; the integral test
(L10 owns it — the octave bars are its picture, planted silently).

**Likely misconceptions, each with its break:** (1) plug-in-\(\infty\) as an
operation → broken by the scandal + (b)'s shorthand rule; (2) "goes to 0 ⇒
converges" → broken by the \(1/x\) confrontation and the challenge game;
(3) blind FTC across a singularity → broken by (d); (4) "diverges =
infinite" → broken by (i); (5) "symmetric so zero" → broken by (h).

## Mathematical audit (Audit A)

**RAN 2026-08-11 — REVISE.** Fresh-lineage ADR-008 audit found seven
mathematical blockers: false L3/L4 hypotheses; false L7 interval-additivity
provenance; an unowned geometric bound and incorrect \(R=e^M\) witness;
missing comparison hypotheses/direction; a skipped FTC-order step in
\(Re^{-R}\to0\); "proved" rather than cited Gaussian provenance; and a
left-edge-only Type-II definition. Sections 4–7 and the prerequisites now
resolve each finding. The Monotone Accumulation Principle was accepted as
openly supplied P3 completeness machinery. A fresh delta audit is still
required before PASS.

## Grounding & model-change audit (Audit B)

**RAN 2026-08-11 — REVISE.** The same fresh context found the primary sentence
globally overbroad, the correspondence/analogy-limit account not in the
required explicit form, the four-stage abstraction return incomplete, and
all broader transfers unclassified. Sections 5 and 11–14 now scope the
improper-Riemann claim, separate exact correspondences from added agency,
spell out the four-stage return plus discriminator, and classify every
transfer. Fresh delta review remains owed.

## Review signoff

- **Contract author:** implementation context under ADR-008.
- **Mathematical reviewer:** fresh-lineage Gate-4 auditor, 2026-08-11 — REVISE.
- **Pedagogical/redundancy reviewer:** same fresh context, sequential lenses — REVISE.
- **User/domain owner:** standing authorization and veto under ADR-008; no
  per-lesson signoff claimed.
- **Outstanding concern:** corrected delta requires fresh re-audit.

## Gate result

Gate result: REVISE

Proposed primary insight (not approved): “In this course's improper-Riemann
setting, the infinity notation names no completed infinite object; it
abbreviates a claim that proper finite accumulations settle as their intervals
exhaust the domain. That claim lives in the tail. For nonnegative tails
compared with the \(p\)-family, decay rate decides the verdict, and comparison
can inherit it even when no elementary antiderivative can be written. This
supplies the notation later transform integrals use; each transform still owes
its own convergence hypotheses.”

Gate 5 must not begin. A fresh Gate-4 delta audit is required.
