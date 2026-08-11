# Insight Contract — Reading the Rules Backwards (spine L7, `substitution-parts`)

**Gate 4 artifact.** Drafted 2026-08-10 under ADR-008 (autonomous protocol);
audited by independent adversarial passes the same day — see the audit
sections and the Gate result at the end. Selected from the Gate 3 brief's
ranked direction ([insight-brief.md](insight-brief.md)).

Spine row (M2 `calculus-technique`, L7): after L5 (chain rule) and L6
(optimization), the trunk owes the two rewriting moves that make integrals
computable. Benchmark bar consumed (M2, **P2** — the declared course target;
an earlier draft misattributed this language to P1): "techniques **derived**
from the chain and product rules; parts recognised as Theme 1's boundary
term". Method selection on fresh integrands is this contract's OWN E3+
commitment (§10, §11), not a benchmark quote. Trig substitution and partial
fractions are withheld as this contract's own scoping decision — the matrix
names neither, so no exclusion can be cited from it.

## Primary insight (contents 1–11)

### 1. Diagnosed cognitive obstacle

**A category error about what kind of activity integration is.**
Differentiation, as the learner has practiced it since L2, runs on a compact
forward rule system that covers every expression this course uses. The
learner arrives expecting antidifferentiation to be the same kind of thing —
a forward procedure whose rule is visible in the expression — and is instead
handed an **inverse-recognition problem**: *which differentiation could have
produced this?* Nobody says so. (Carefully: more sophisticated
symbolic-integration algorithms exist, so the lesson never claims integration
"has no algorithm" — the change of task the learner meets is real without
that overclaim; owner's Gate-3 correction.) The techniques therefore
present as a bag of unrelated tricks, and the `u`-substitution notation in
particular (`du = g'(x)\,dx`) degenerates into fraction-cancellation ritual
that produces right answers without being about anything.

Secondarily, **missing purpose**: the learner cannot say what `du` *is*, why
the bounds change on a definite integral, or where the `uv` term in parts
comes from — three symptoms of the same missing frame.

### 2. Insight mechanism(s)

**Predictive/causal reorganization** (integration reframed from "apply an
operation" to "recognize which forward machine produced this output"),
carrying a **structural compression** (both techniques, the bounds-change
rule, the `uv` boundary term, and the verification discipline all fall out of
two already-mastered forward rules plus the FTC — nothing new is assumed),
with a **notation demystification** as the payoff: `u`/`du` becomes visible
as bookkeeping for a recognition, not algebra on infinitesimals.

### 3. Initial mental model

"To integrate, pick the right technique. For substitution: set `u` equal to
the inside, compute `du`, cancel the `dx`, integrate, substitute back. For
parts: use `∫u dv = uv − ∫v du`, choosing `u` by LIATE. If it doesn't work,
try the other one, or a different `u`."

### 4. Tension / redundancy

The ritual works and explains nothing. Why may `du = g'(x)\,dx` be treated
as a fraction, when L2 defined the derivative as the LIMIT of quotients —
never a quotient of standalone quantities — and L5 was emphatic that
cancelling \(du\)'s proves nothing? Why do the bounds
transform under `g` on a definite integral? Where does `uv` come from — and
why does *it* get evaluated at the endpoints while everything else stays
under an integral sign? Why does substitution sometimes fail no matter which
`u` is chosen? A learner with the ritual alone holds four mysteries. But the
learner *already owns* the two facts that dissolve all four: the chain rule
(L5, derived and Gate-8-accepted), and the FTC (L4). What is missing is only
the direction of reading: both "techniques" are those theorems **read
backwards**.

### 5. The model change

**Antidifferentiation is recognition, and each technique is a forward rule
read in reverse.**

*Substitution is the chain rule recognized.* If \(F' = f\), then L5's chain
rule says \((F\circ g)'(x) = f(g(x))\,g'(x)\). Read forwards: composing then
differentiating manufactures integrands of the shape \(f(g(x))\,g'(x)\). Read
backwards: an integrand **of that shape** is the output of a differentiation
the learner can name, so \(\int f(g(x))\,g'(x)\,dx = F(g(x)) + C\). The
substitution notation is a *ledger* for this recognition: writing \(u=g(x)\),
\(du = g'(x)\,dx\) records which factor of the integrand is being consumed as
the chain-rule factor. Nothing is cancelled; a recognition is being
book-kept.

*Parts is the product rule integrated.* The integrand is recognized as ONE
TERM of a product-rule output — and solving the integrated product rule for
that term produces two pieces with distinct roles, a boundary term and a
remaining integral, which the lesson must keep visibly separate (the owner's
Gate-3 correction; "half of a product-rule output" blurred exactly that).
The product rule \((uv)' = u'v + uv'\) is **derived in-lesson from L2 C5**
in one line (multiply the two local-linear models; the cross term is
\(o(h)\)) — the audit established that no built surface has ever stated it
and spine §2.1 does not list it, so the lesson owes the derivation rather
than a citation. Integrate both sides over \([a,b]\)
— the left side by the FTC (L4):
\[[uv]_a^b = \int_a^b u'v\,dx + \int_a^b uv'\,dx.\]
Rearranged, \(\int_a^b uv'\,dx = [uv]_a^b - \int_a^b u'v\,dx\): the technique
is a *trade* — one integral for a hopefully-easier one — and the price of the
trade is a **boundary term**. That term is not new algebra: it is the FTC
doing exactly what Theme 1 has had it do since L4 — what accumulates inside
an interval is measured at its edges.

### 6. Full causal chain

Differentiation rules run forward and terminate → antidifferentiation asks
which forward run produced this integrand → therefore the primitive activity
is **recognition of shape**, not application of an operation → the chain
rule's output shape is \(f(g(x))\,g'(x)\), so recognizing it *is*
substitution, and `du` is the ledger entry for the consumed factor
\(g'(x)\,dx\) → the product rule's output shape is \(u'v + uv'\), and
integrating it via the FTC *is* parts, with \([uv]_a^b\) as the boundary
term the FTC always produces → because recognition can fail, failure is a
real outcome (some elementary integrands are provably not the derivative of
any elementary function) → but verification never fails: differentiating any
candidate answer is algorithmic, so every answer can be *checked* even when
none can be found.

### 7. Minimal formal derivation

**(a) Substitution, indefinite.** Hypotheses: \(g\) differentiable on an
interval \(I\); \(f\) continuous on \(g(I)\); \(F\) an antiderivative of
\(f\) on \(g(I)\). By L5's chain rule, for \(x \in I\):
\[\frac{d}{dx}F(g(x)) = F'(g(x))\,g'(x) = f(g(x))\,g'(x).\]
So \(F(g(x))\) is, by definition of antiderivative, an antiderivative of
\(f(g(x))\,g'(x)\):
\[\int f(g(x))\,g'(x)\,dx = F(g(x)) + C.\]
Two lines, resting on L5's chain rule — with one honest remark the audit
required: at a point \(x_0\) where \(g(x_0)\) is an ENDPOINT of the
interval \(g(I)\) (an interior extremum of \(g\)), \(F'\) exists only
one-sidedly there and L5's two-sided statement does not literally apply; at
such points \(g'(x_0) = 0\) and a one-sided residual argument closes the
gap, so the formula survives, but the citation alone does not carry it. A
constant \(g\) makes both sides trivially constant, dispatched separately.

**(b) Substitution, definite — why the bounds transform.** Add the
hypothesis that \(f(g(x))g'(x)\) is continuous on \([a,b]\) (so the FTC's
evaluation form applies). Then, using (a) and the FTC twice:
\[\int_a^b f(g(x))\,g'(x)\,dx = \Big[F(g(x))\Big]_a^b = F(g(b)) - F(g(a))
 = \Big[F(u)\Big]_{g(a)}^{g(b)} = \int_{g(a)}^{g(b)} f(u)\,du.\]
The bounds transform because both sides are the *same two numbers*
\(F(g(b)) - F(g(a))\), reached through two different antiderivatives. No
orientation caveat is needed: if \(g(a) > g(b)\), the right-hand integral is
simply an integral with its bounds in decreasing order — a convention THIS
LESSON introduces (\(\int_a^b f := -\int_b^a f\) for \(a > b\), chosen
precisely so the FTC's evaluation form holds verbatim for either order; the
audit confirmed L4 never defined it, so citing L4 here was false). Under it
the identity holds as written. Hypothesis kept explicit: \([a,b]
\subseteq I\), so (a) applies on all of it.

**(c) Parts.** Hypotheses: \(u, v\) differentiable on \([a,b]\) with \(u'\),
\(v'\) continuous (so every integral below exists and the FTC applies to
\((uv)'\)). Product rule: \((uv)' = u'v + uv'\). Both sides are continuous,
so integrate over \([a,b]\); the left by the FTC:
\[u(b)v(b) - u(a)v(a) = \int_a^b u'v\,dx + \int_a^b uv'\,dx\]
\[\Rightarrow\quad \int_a^b u\,v'\,dx = \Big[uv\Big]_a^b - \int_a^b u'\,v\,dx.\]
The indefinite form \(\int uv'\,dx = uv - \int u'v\,dx\) follows by the same
two lines without evaluation.

**(c′) The cyclic trade.** The brief mandates one more parts pattern: on
\(\int e^x \sin x\,dx\), TWO trades return the original integral —
\(I = e^x\sin x - \int e^x\cos x\,dx = e^x\sin x - e^x\cos x - I\) —
and ALGEBRA closes the cycle: \(2I = e^x(\sin x - \cos x)\), so
\(I = \tfrac{1}{2}e^x(\sin x - \cos x) + C\). Method selection includes
recognizing the recurrence when it appears, not merely ranking factors; a
learner who treats the returning integral as failure has missed the move.

**(d) The verification principle.** For any candidate \(G\) and integrand
\(h\): \(G\) is an antiderivative of \(h\) on an interval iff \(G' = h\)
there — and computing \(G'\) is the forward algorithm the learner has owned
since L5. Finding is search; checking is calculation. (This is also literally
how the lesson's grader works: a produced antiderivative is graded by
differentiating it and comparing against the integrand. Answers differing by
a constant all pass because \(d/dx\) kills the constant — the SOUNDNESS
half of "+C"; the completeness half (same derivative on an interval ⇒
constant difference) is L4 C9's, cited rather than reproved.)

**(e) The honest failure.** \(e^{-x^2}\) is continuous, so an antiderivative
*exists* (L4: the accumulation function \(\int_0^x e^{-t^2}dt\)); what fails
is *elementarity* — by Liouville's theorem (1835; **cited, not proved** —
proof far beyond this course), no elementary function has derivative
\(e^{-x^2}\). The recognition search fails because there is provably nothing
to recognize, not because the learner is insufficiently clever. Existence and
elementarity are different properties, and the lesson must keep them visibly
distinct.

### 8. Equivalence to the original object

Nothing replaces the standard techniques — the lesson *derives* the standard
techniques. The `u`-substitution ritual, the parts formula, LIATE's correct
verdicts, and the bounds-transform rule all reappear, now as consequences.
Where the ritual and the recognition frame disagree about what to *say*
(`du` "cancels" vs. `du` book-keeps), the computation performed is
identical; only the account of it changes.

### 9. Cost / model change

The learner gives up the comfort of "integration works like differentiation
— apply the visible rule" and accepts search-with-verification in its place.
(Stated carefully: sophisticated symbolic-integration algorithms exist —
Risch — so the honest claim is that no comparably simple rule system is
within this course's reach, not that none exists; the owner's Gate-3
correction, carried into this contract.) The trade is —
including genuine failure as a mathematical outcome, not a personal one.
LIATE is deliberately not offered as compensation: choosing \(u\) is taught
as *"pick the factor that dies (or simplifies) under differentiation"*,
which is the judgment LIATE approximates, and which transfers to integrands
LIATE misorders.

### 10. What the learner can predict or do afterward

- Given \(\int 2x\cos(x^2)\,dx\), *name the forward differentiation that
  produced it* before touching notation, then execute the substitution as
  bookkeeping for that recognition.
- Predict, before computing, **which factor of a parts integrand to
  differentiate** and say why ("\(x\) dies; \(e^x\) merely survives").
- Explain what \([uv]_a^b\) *is* (the FTC's boundary evaluation of the
  accumulated \((uv)'\)) rather than where it goes in a formula.
- Transform bounds under substitution and say why back-substitution is then
  unnecessary.
- Check any proposed antiderivative by differentiating — and use that check
  unprompted.
- Classify a fresh integrand as chain-shape, product-shape, or *neither* —
  and for the neither case, state the existence/elementarity distinction
  instead of retrying tricks forever.
- Recognize a CYCLIC parts recurrence (\(\int e^x\sin x\)) and close it
  algebraically instead of reading the returning integral as failure.

### 11. Transfer assessment

Nearest structure the insight must survive: **the Laplace transform's
derivative rule** (M7), which *is* integration by parts with the boundary
term carrying the initial condition — the lesson plants this pointer without
teaching it. Nearer-term: L8's improper integrals reuse both the failure case
(\(e^{-x^2}\) becomes integrable-in-the-limit) and the boundary term at
infinity. The insight fails transfer if the learner can execute both
techniques but cannot classify a fresh integrand or justify a \(u\) choice —
which is why method selection is the E3+ evidence centerpiece, not execution
drills.

## 12. Bridge *(grounded insight)*

The bridge is the **witnessed manufacture**: the lesson opens by running
\(\frac{d}{dx}\sin(x^2) = 2x\cos(x^2)\) forward in plain view, then asks for
\(\int 2x\cos(x^2)\,dx\) while the manufacture is still on screen. The
learner experiences recognition *before* any notation exists to obscure it.
Substitution's ledger is then introduced as the record of what they just did.

## 13. Preserved correspondences & analogy limits

The "read backwards" frame is exact, not an analogy: every substitution
instance IS a chain-rule instance, every parts instance IS a product-rule
instance plus the FTC — the correspondence is the theorem, so there is no
edge where the analogy quietly fails. The frame's honest *limit* is
different: reading backwards requires something to recognize, and (e) is the
case where nothing is there. The lesson must not let "every integrand is
secretly a chain-rule output" form as a belief; the classify-as-neither
exercises exist to break it before it sets.

## 14. Abstraction return

At the end, restate coldly: antidifferentiation on an interval; substitution
as \(\int f(g(x))g'(x)dx = F(g(x))+C\) under (a)'s hypotheses; parts as the
integrated product rule under (c)'s; bounds-transform as (b); existence vs.
elementarity as (e). The techniques table the learner keeps is now two rows
long, with a derivation each.

## Prerequisites, limitations, likely misconceptions

**Requires:** L5 chain rule (cited in (a), with the endpoint remark there);
L4 FTC (evaluation form, used in (b) and (c)); L2 C5 (from which the lesson
DERIVES the product rule in one line — the audit found no built surface has
ever stated it, so it is not available to cite); L3/L4's definite integral.
Two conventions this lesson must itself introduce, because the audit found
no owner upstream: the decreasing-order-bounds convention
\(\int_a^b := -\int_b^a\) for \(a > b\) (used in (b)), and integral
additivity \(\int(p+q) = \int p + \int q\) (used in (c)) — each a one-line
statement at the Riemann-sum level, where finite sums split exactly and L3's
limit passes to both parts.

**Withheld:** trig substitution, partial fractions (M2 extensions beyond the
P1 bar — the mastery contract must re-verify this against
`benchmark-matrix.md` §2 before Gate 5 closes); Liouville's theorem (cited
only); any claim that recognition training makes every elementary integral
tractable.

**Likely misconceptions, each with its break:**
1. *"`du = g'dx` is fraction cancellation"* → broken by deriving (a) with no
   fraction anywhere, then re-running the same computation in `u`-notation
   and watching the ledger say the same thing.
2. *"Integration is forward rule-application"* → broken by the witnessed
   manufacture (§12) and by the classify-then-execute exercise order.
3. *"Every integrand yields to the right trick"* → broken by (e), presented
   as a theorem with a name, not a shrug.
4. *"Choose u by LIATE"* → pre-empted by never teaching it; the choose-what-
   dies principle is taught against an example where it is transparent
   (\(\int x e^x\)) and assessed on one where mnemonic-free judgment is
   required.
5. *"The bounds change is a separate rule to memorize"* → broken by (b):
   both sides are the same two numbers.

## Mathematical audit (Audit A)

**RAN 2026-08-10** — fresh-lineage single-context audit (ADR-008 §4,
usage-aware protocol), three lenses sequentially. Verified sound: (a)'s
existence claim (\(g\) differentiable ⇒ \(g(I)\) an interval by the IVT,
continuity of \(f\) on it gives \(F\)); (b)'s double-FTC argument WITHOUT
monotonicity, including the overshoot case; the auditor attempted and failed
to construct a counterexample to either identity. Defects found, all
repaired in place above:

1. **(blocking)** The product rule was cited as a spine §2.1 entry
   assumption — §2.1 lists no differentiation rule, and NO built surface has
   ever stated \((uv)' = u'v + uv'\). Repaired: the lesson derives it in
   one line from L2 C5; provenance corrected here and in the brief.
2. **(blocking)** (b) cited a decreasing-order-bounds definition "L4 already
   made" — L4 never made it. Repaired: the convention is this lesson's own
   one-line definition, motivated by the FTC evaluation form.
3. (repair) The consumed benchmark bar was P2's language misattributed to
   P1, plus an exclusion claim the matrix never makes. Repaired in the
   header: P2 named, method selection restated as this contract's own
   commitment, the withheld list owned as a scoping decision.
4. (repair) The brief's mandatory cyclic-parts case (\(\int e^x\sin x\))
   had been dropped. Repaired: §7(c′) and the §10 prediction.
5. (repair) (a)'s "only cited fact is L5's chain rule" over-claimed at
   endpoint values of \(g(I)\); constant \(g\); (b) lacked \([a,b]
   \subseteq I\). All repaired with the one-line endpoint remark.
6. (repair) (c)'s linearity split leaned on integral additivity, which no
   upstream lesson owns — the pre-audit note below this section had
   justified it with the wrong property. Repaired: additivity is introduced
   by this lesson at the Riemann-sum level.
7. (notes) The fraction-emphasis misattribution (L2 → L5) and the +C
   soundness/completeness conflation (completeness is L4 C9's), both
   repaired.

## Grounding & model-change audit (Audit B)

Same round. The bridge (§12) grounds recognition in a witnessed event; the
ledger gives `du` a referent that survives scrutiny; the boundary-term
reading is the course's own Theme 1. Checked against the constitution: the
learner performs the recognitions (principle 1); equation-first media with
the one exact-area explorer match the concept's character (principle 2);
LIATE's omission is principle 3 applied to a mnemonic; §13's exactness claim
survives with the wording repair recorded in Audit A item 7.

## Review signoff

Signed by the 2026-08-10 fresh-lineage audit round, under ADR-008 §4 — the
findings above were verified against the real artifacts by the auditor
(each citation checked, each identity refereed) and the repairs applied by
the implementation session the same day. The owner did not review
(standing directive); the owner's veto stands.

## Gate result

**PASS** — recorded 2026-08-10, after the seven repairs above. Gate 5 may
consume this contract. The Gate 3 brief's "+C" evidence flag is resolved by
(d): grade the derivative of the produced answer against the integrand.
