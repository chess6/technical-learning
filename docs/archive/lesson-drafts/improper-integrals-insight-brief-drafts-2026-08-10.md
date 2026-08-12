# L8 `improper-integrals` — RAW Gate-3 draft material (not a brief)

**Two independent draft directions produced 2026-08-10 by parallel drafting
agents; the judging/synthesis pass was cut short by a session limit and NEVER
RAN.** Neither draft below is Gate 3 output. The next Mode B session for L8
must judge, synthesize, and write the real `insight-brief.md` — these are
preserved only so the drafting work is not paid for twice.

---

## Draft A — misconception-first direction

# Insight Discovery Brief — Accumulating Forever (spine L8, `improper-integrals`)

**Gate 3 output — DRAFT under ADR-008.** Written 2026-08-10 by the planning
session. Gate 4 (insight contract with audits) has NOT run; nothing below is
`PASS` yet. Mode C must not begin from this document.

Spine row (M2 `calculus-technique`, L8 — the module's last lesson): after L7
derives the two rewriting techniques, the trunk owes the definition that
licenses every transform integral in the course —
[spine §10](../../course-spine.md#10-per-module-notes): *"L8 is the quiet
keystone: without improper integrals every transform in M5–M7 is unlicensed
notation."* Benchmark bar ([benchmark-matrix §2](../../benchmark-matrix.md),
M2 row): **standard improper integrals** computed at P1; **improper
convergence judged by decay rate** at P2. *Comparison and limit-comparison
proved; conditional convergence* sit in the **P3 enrichment column** — used
honestly here, proved there.

---

## 1a. Diagnose the cognitive obstacle

**Primary: misleading notation installing an incorrect prior model — the
symbol looks like something the learner already owns, so no definitional act
is ever registered.** \(\int_a^{\infty} f(x)\,dx\) is typographically the
object L3 defined — so it reads as *"the same thing, with a bigger interval":
already meaningful, already "the area," already obeying the old rules.* It is
none of these. L3's definition requires a **closed bounded interval** and a
**bounded integrand**, and both requirements are load-bearing: remove either
and the Riemann machinery does not run. The symbol, as the learner meets it,
is a **debt** — marks on paper with no referent — and the conventional
presentation pays the debt in one hurried line ("define it as
\(\lim_{b\to\infty}\int_a^b\)") before the learner ever felt it was owed.
A learner who never saw the definitional act cannot say what the definition
was *for*, what it rules out, or why any alternative was refused — so the two
folk priors arrive intact: *"the region is infinite, so the area is
infinite"* and its mirror *"the integrand goes to zero, so the area is
fine,"* plus the silent assumption that symmetric cancellation on
\((-\infty,\infty)\) is legitimate.

**Secondary: missing structure — "convergence" presents as a new topic with
tests to memorize.** In the conventional order (definition, examples, p-test,
comparison test, drill) each test is one more item in the bag L7 just worked
to empty. In fact there is **one question** — does the accumulation function
\(A(b)=\int_a^b f\) have a limit? — asked about **one location** — the tail,
because every finite head is a proper integral the learner already owns, and
the whole apparatus (p-ladder, comparison) is that single question answered
by ordering tails.

**Tertiary: the first limit at infinity.** L1's guarantee is local — any
tolerance around \(L\) is delivered by *some window around \(a\)*. The limit
\(b\to\infty\) is formally new: any tolerance is delivered *beyond some
threshold*. The extension is cheap but must be made honestly, because it is
the exact form L9 inherits for sequences (spine L9: *"L1's guarantee with the
window replaced by 'far enough along'"*) — L8 is where the course first pays
for it. And L6's delta-discipline transfers verbatim: **convergence supplies
SOME threshold, never a rate.** Knowing \(\int_1^\infty f\) converges tells
you nothing about how far you must integrate to be within \(10^{-3}\);
that quantitative question is answered by the decay rate, not by the
convergence claim — the same qualitative/quantitative split L6 drew between
\(E(h)/h\to 0\) and the \(Mh^2/2\) bound.

**Semantic/representational flag (triggers 1c).** The obstacle is
notational/representational at its core — the symbol misleads, and the area
*picture* actively fails (it cannot distinguish \(1/x\) from \(1/x^{1.01}\))
— so [1c](#1c-conventional-vs-alternative-presentation) is required.

**Not the obstacle:** computing \(\int_1^b x^{-p}\,dx\) by the FTC, or
taking elementary limits of the results. The learner owns those. The obstacle
is what question that computation is answering, and why it is the only honest
question available.

| Later | Costs paid if this obstacle is not repaired |
| --- | --- |
| L10 `series-convergence` | The tail/comparison architecture is built **here first**, in the continuous setting; a learner who holds L8 as a test-bag re-memorizes the same architecture as a second test-bag, and the spine's "convergence is a property of the tail" lands as a slogan. |
| L17–L18 (Fourier) | \(\int_{-\infty}^{\infty}\) under every transform is **unlicensed notation** — and the two-independent-limits definition is exactly what makes "does this signal have a transform?" a real question with a real answer. |
| L24 `laplace-transform` | The region of convergence *is* L8: the set of \(s\) for which \(e^{-st}f(t)\) decays fast enough for the tail to converge and the boundary term at infinity to die. A learner without L8 reads the ROC as bureaucracy. |
| L11 `power-taylor-series` | The radius of convergence is the same kind of object as the ROC (spine §10 M3) — a boundary in parameter space between convergence and divergence, unintelligible without a prior model of what convergence *is*. |

---

## 1b. Raw leads

| # | Lead | Mechanism |
| --- | --- | --- |
| R1 | **The debt made visible.** Before defining anything, ask what L3's definition says \(\int_1^\infty x^{-2}\,dx\) means — and watch it say *nothing*: no closed bounded interval, no Riemann sums, no referent. The symbol is a promissory note. The honest repayment is **the limit of the thing you already own**: proper integrals \(\int_1^b\), then \(b\to\infty\). The learner should *propose* this definition, not receive it. | Predictive/causal reorganization; purpose exposed |
| R2 | **Plot the accumulation, not the area.** \(A(b)=\int_a^b f\) is L4's accumulation function, already built and graded. Convergence is visible as \(A\) **leveling off** — a horizontal asymptote — where the area picture shows nothing. On the \(A\)-graph, \(1/x^2\) levels at \(1\) while \(1/x\) creeps up \(\ln b\) forever: the decisive difference the region picture hides. | Representational change |
| R3 | **Decay is not enough; rate decides.** \(1/x\to 0\), yet \(A(b)=\ln b\to\infty\). The whole p-ladder — \(\int_1^\infty x^{-p}\) converges iff \(p>1\) — is **derived by the learner** from one FTC computation plus one limit; \(p=1\) is the boundary rung. Infinitely many convergence facts compress to one exponent comparison. | Structural compression |
| R4 | **Convergence lives in the tail.** \(\int_a^\infty f=\int_a^c f+\int_c^\infty f\): the head is a proper integral — finite, owned, irrelevant to convergence. Any finite blemish can be ignored; all risk is at the far end. "Does it converge?" becomes "what does the tail do?" | Structural compression |
| R5 | **Comparison is trapped accumulation.** If \(0\le f\le g\) on the tail, then \(A_f\) and \(A_g\) are both nondecreasing and \(A_f\le A_g\) (+ a finite head). If \(A_g\) levels off, \(A_f\) is rising and trapped below a ceiling — so it levels off too. Ordering of integrands \(\Rightarrow\) ordering of tails \(\Rightarrow\) **inheritance of convergence** (and, contrapositively, of divergence upward). The one non-owned ingredient: *a bounded nondecreasing accumulation converges* — completeness, to be **named as the supplied existence hypothesis** exactly as L6 named the EVT, with its proof living in the P3 enrichment column. | Operational grounding + structural compression |
| R6 | **The \(e^{-x^2}\) resolution.** L7 proved (Liouville, cited) that no elementary antiderivative exists — the FTC route to a value is *provably closed*. Yet for \(x\ge 1\), \(e^{-x^2}\le e^{-x}\), and \(\int_1^\infty e^{-x}\,dx\) is computable by hand. So \(\int_0^\infty e^{-x^2}dx\) **converges** — a certified finite value for an integral the learner provably cannot antidifferentiate. Judgment decouples from computation: comparison answers what the FTC cannot touch. L7's honest failure becomes L8's flagship success. | Predictive/causal reorganization |
| R7 | **The route-dependence trap.** \(\int_{-\infty}^{\infty} x\,dx\): symmetric truncations \([-b,b]\) give \(0\) forever; offset truncations \([-b,\,b+c]\) give \((2bc+c^2)/2\to\infty\). An "answer" that depends on how you approach is no answer. The two-independent-limits definition is not pedantry — it is the **minimal honesty condition**: the definition exists to *refuse* route-dependent values. | Counterexample; purpose exposed |
| R8 | **Divergence without infinity.** \(\int_0^\infty \sin x\,dx\): \(A(b)=1-\cos b\) oscillates in \([0,2]\) forever — bounded, never settling. "Diverges" means *the limit fails to exist*, not "the area is infinite." Sharpens what the definition actually asks for. | Counterexample |
| R9 | **Same template, other edge.** \(\int_0^1 x^{-1/2}dx\): unbounded *integrand*, same definitional debt (L3 needs bounded \(f\)), same repayment — \(\lim_{\varepsilon\to 0^+}\int_\varepsilon^1\). The mirrored ladder (\(\int_0^1 x^{-p}\) converges iff \(p<1\)) shows mild blow-up at \(0\) is affordable while mild decay at \(\infty\) is not — and L7's own substitution \(u=1/x\) maps one ladder onto the other. One definitional move covers every edge. | Structural compression; L7 reuse |
| R10 | **The boundary term at infinity.** Parts on \([0,b]\) produces \([uv]_0^b\); letting \(b\to\infty\) turns \(u(b)v(b)\) into a **limit claim requiring decay**. This is what \(e^{-st}\) is *for* in M7: it manufactures decay so the boundary term dies and the tail converges, and the ROC is where the manufacturing succeeds — with the initial condition surviving as the \(t=0\) end of Theme 1's boundary term. Planted as a pointer, not taught. | Forward transfer (Theme 1 → Theme 2) |
| R11 | **"Converges" is qualitative; the rate is the quantitative upgrade.** The limit supplies *some* threshold, never a speed (L6's discipline, verbatim). A tail bound like \(\int_b^\infty x^{-2}dx = 1/b\) is the modulus-style upgrade — the thing numerical truncation of a transform integral will actually need. | Predictive/causal reorganization |
| R12 | **The picture cannot decide.** \(1/x\) vs \(1/x^{1.01}\): indistinguishable regions, opposite verdicts. \(1/\sqrt{x}\) on \((0,1]\): an infinitely tall region with finite area. Distrust of the area picture is *earned by counterexample*, motivating R2's accumulation graph as the representation that does decide. | Representational (negative) |

**Anti-anchoring note.** Two inherited hypotheses compete here and are made
to earn their place: the spine's own sentence (*"a limit of finite
accumulations; convergence is a question about decay rate"*) and the
planning directive's definition-as-honesty direction. Neither is treated as
pre-selected. One finding already: the spine sentence is **slightly
overbroad** — convergence is not literally a question about decay rate,
because integrands exist (narrowing spike trains) whose improper integrals
converge with no decay at all, and \(f\to 0\) is **not** a necessary
condition for convergence of \(\int^\infty f\) (unlike the series case L10
will meet, where \(a_n\to 0\) *is* necessary — a genuine asymmetry that must
not be blurred). The honest repair: **convergence is a question about
tails**; *among the comparison scale of decaying integrands, rate is what
decides*; and comparison is how tails are ordered. As with L6, repairing the
spine's wording is itself part of the lesson's content. See
[1d](#1d-ranking).

---

## 1c. Conventional vs alternative presentation

Triggered by 1a's flag. Both present the **same definitions and the same
theorems**; only the discovery order and the working representation change.

| | Conventional | Alternative (debt → repayment → tails) |
| --- | --- | --- |
| **Opening** | "Definition: \(\int_a^\infty f\,dx = \lim_{b\to\infty}\int_a^b f\,dx\), provided the limit exists." | Ask what \(\int_1^\infty x^{-2}dx\) *means* under L3's definition. It doesn't. Feel the debt; then propose the only honest repayment: the limit of what you already own. |
| **Working object** | The shaded unbounded region. | The accumulation graph \(A(b)\) — where "converges" is *visible* as leveling off, and \(1/x\) vs \(1/x^2\) actually differ. |
| **p-test** | Stated as a test to memorize. | Derived by the learner: one FTC computation, one limit, the whole ladder — with \(p=1\) discovered as the boundary. |
| **Comparison** | Stated; hypotheses listed. | Discovered as trapped accumulation: ordered integrands give ordered rising graphs; a ceiling on the upper one traps the lower. The completeness fact is *named* as the supplied hypothesis (EVT-style). |
| **\(\int_{-\infty}^{\infty}\)** | "Split at any \(c\); both must converge." A rule. | The route-dependence trap run live: symmetric windows say \(0\), offset windows say \(\infty\); the two-limit definition is *why* an answer exists at all. |
| **What "diverges" means** | Often left as "= ∞". | \(\sin x\): bounded, oscillating, no limit — divergence is *failure of the limit*, infinity is just one way to fail. |

- **Preserved:** every definition, every convergence verdict, the p-ladder,
  the comparison theorem and its hypotheses — identical in both.
- **Easier to infer:** why the definition has the shape it has; why the
  bounds of legitimacy (two independent limits, tails only) are not
  bureaucracy; which of two look-alike integrals converges and *why*.
- **Background introduced:** none beyond built material — L4's accumulation
  function, the FTC, L7's techniques, plus the limit-at-infinity extension of
  L1's guarantee (flagged as new, owed honestly).
- **Likely to transfer:** yes — L10 replays the entire architecture with
  \(\sum\) in place of \(\int\), and L24's ROC is this lesson run with a
  parameter in the exponent.

---

## Consolidated packages

### P1 — "The symbol is a debt; the definition is the limit of what you own — and every question it raises is a tail question" *(R1, R2, R4, R7, R8, R9)*
Central model change: from *"\(\int_a^\infty\) is the area, already
meaningful"* to *"\(\int_a^\infty\) means nothing until defined; the honest
definition is the limit of proper integrals; 'converges' means the
accumulation graph levels off; 'diverges' means the limit fails (infinity
optional); route-dependent candidates like symmetric truncation are exactly
what the definition exists to refuse; and the verdict lives entirely in the
tail."* One definitional template covers both edges (unbounded interval,
unbounded integrand).
**Delivers:** the definitional act as experience rather than fine print; the
representation on which everything else is visible; the two-limit
\((-\infty,\infty)\) discipline every transform integral needs.
**Does not deliver:** the quantitative verdicts (P2) or the tool that
decides without an antiderivative (P3).

### P2 — "Rate, not decay, decides" *(R3, R11, R12)*
Central model change: from *"goes to zero ⇒ finite area"* to *"the boundary
between convergent and divergent on the standard scale is a decay-rate
threshold at \(p=1\), derived by my own FTC computation — and decay itself
decides nothing."* Carries L6's discipline forward: convergence is a
some-threshold guarantee; the rate is the quantitative upgrade.
**Delivers:** the p-ladder (both edges), the benchmark's "judged by decay
rate" bar, the destruction of both folk priors.
**Does not deliver:** verdicts off the scale — for that it needs P3's
ordering.

### P3 — "Comparison: convergence is inherited through the ordering of tails" *(R5, R6, R4)*
Central model change: from *"to judge an integral, compute it"* to *"to
judge, trap it: order the tails, and convergence flows down the order while
divergence flows up."* The one new ingredient — a bounded nondecreasing
accumulation converges — is **named** as the supplied existence hypothesis
(completeness), mirroring L6's handling of the EVT; its proof is P3-column
enrichment, honestly labeled. Payoff: \(\int_0^\infty e^{-x^2}dx\) converges
by comparison with \(e^{-x}\) — **a computable fact about an uncomputable
antiderivative**, resolving L7's honest failure: L7 proved the recognition
search must fail; L8 shows the question that still has an answer, and how to
get it without any antiderivative at all.
**Delivers:** the honest tool, the L7 thread's resolution, the method by
which every transform's existence will ever be checked.
**Does not deliver:** the definitional frame that makes "trapped accumulation"
meaningful — it presupposes P1.

### P4 — "The boundary term at infinity" *(R10)*
Parts' \([uv]_a^b\) under \(b\to\infty\) becomes a limit claim requiring
decay — the exact mechanism by which Laplace will carry initial conditions
and the exact reason the ROC exists.
**Delivers:** the forward pointer M7 is owed, and the meeting point of
Theme 1's boundary term with Theme 2's operator move.
**Does not deliver:** a model change *in this lesson* — it is a transfer
obligation riding on P1+P3, not a rival central model.

**Shared engines, not rival packages.** The accumulation graph (R2) is the
working representation for P1, P2, and P3 alike. The counterexample set
(\(1/x\), \(\sin x\), \(\int x\,dx\) over \(\mathbb{R}\), \(1/\sqrt{x}\),
\(e^{-x^2}\)) serves all three. Per the gate, they are not counted as
separate competing insights.

---

## 1d. Ranking

| Rank | Package | Why |
| --- | --- | --- |
| 1 | **P1** | The definitional act is the model change everything else stands on: without it, the p-ladder is another memorized table, comparison another trick, and the two-limit rule bureaucracy. With it, each is a *consequence* the learner can re-derive — the ladder is "FTC then the limit I defined," comparison is "my accumulation graphs, ordered," the two-limit rule is "the refusal I watched become necessary." Highest compression (one definitional template covers both improper types, both ladders, and the meaning of divergence) and exact throughout — correctness is a gate and P1 passes with no caveats. Surprise-before/inevitability-after is strong: the learner does not expect a familiar-looking symbol to be *meaningless*, and after the trap (R7) the definition's shape feels forced rather than stipulated. |
| 2 | **P2** | The benchmark bar names it ("judged by decay rate") and R3 is the lesson's sharpest single surprise (\(1/x\) decays and diverges). Ranked below P1 because without the definitional frame its verdicts are answers to an unasked question — and because, stated alone, it inherits the spine sentence's overbreadth (decay rate is decisive *on the comparison scale*, not a definition of convergence). P1 is what makes P2 sayable honestly. |
| 3 | **P3** | The honest tool and the L7 resolution — the emotional and mathematical payoff of the lesson. Ranked third only because it consumes P1 (trapped *accumulation* presupposes the accumulation-limit definition) and P2 (something must sit on the far side of the comparison; the ladder is the scale). Its completeness hypothesis is handled by naming, the same move L6 made with the EVT, so it adds no unproved-claim risk. |
| 4 | **P4** | Real and owed (the spine's §6.2 says parts *is* the Laplace derivative rule), but it repairs nothing in 1a — it is the forward edge P1+P3 make possible. Kept as a planted pointer with one concrete instance (\(e^{-x}x\) or similar, boundary term dying visibly), never developed. |

**Selected: P1 primary** (the definition as honesty: debt, repayment,
refusal of route-dependence, tails), **P2 secondary** (rate as the decisive
quantity, the ladder derived not stated), **P3 tertiary** (comparison as
inheritance through ordered tails; the \(e^{-x^2}\) resolution as flagship),
**P4 as a named forward pointer.** This composes into the repaired spine
sentence the lesson can end on: *an improper integral is the limit of finite
accumulations; its convergence is a property of its tail; among decaying
integrands the decay rate decides; and comparison is how one tail's verdict
is inherited by another.*

> **Why not lead with the spine's own sentence (P2-first)?** Because as
> worded — *"convergence is a question about decay rate"* — it is not quite
> true (non-decaying convergent integrands exist; decay to zero is neither
> sufficient, by \(1/x\), nor necessary, by spike trains), and because
> rate-talk before the definitional act reproduces the conventional
> presentation's central failure: verdicts about an object the learner never
> saw get defined. P1 makes the spine's sentence safe to say, and the
> repaired sentence is what the lesson ends on — the same repair-shape the
> L6 brief applied to its spine row. Criterion (4) is a gate, not a score.

**Evidence that would have flipped this ranking.**

1. **If L4 had not built the accumulation function as a first-class graded
   object.** P1's working representation (watch \(A(b)\) level off or creep)
   would cost a new prerequisite, and P2 — which can run on FTC computations
   alone — would be the cheaper primary. L4 ships \(A(x)=\int_a^x f\) by
   name, so P1 costs nothing new.
2. **If this were the learner's second exposure** (a remediation audience
   that already "knows" the p-test as a rule), the highest-value model change
   would be P3's judgment-decouples-from-computation, with P1 compressed to a
   reminder — the definitional surprise spends best on first contact.
   The course's declared position is first exposure on a P2 bar, so P1
   stands.
3. **If the benchmark's P2 bar had demanded proved comparison/limit-comparison.**
   The completeness discussion would move from "named hypothesis" to real
   proof obligation, the lesson would grow a rigor beat that crowds the
   definitional arc, and splitting the insight differently (P3-first) would
   deserve reconsideration. The bar places proofs in the P3 enrichment
   column, so naming suffices.

**Discovery sequence for P1** (discover, not tell; exit is
predict-not-recall):

1. **Feel the debt.** Show \(\int_1^\infty x^{-2}dx\) and ask L3's
   definition to parse it. It cannot — no bounded interval. Establish: right
   now, this symbol *means nothing*. *(R1: the definitional gap experienced,
   not announced.)*
2. **Propose the repayment.** The learner computes \(\int_1^b x^{-2}dx
   = 1-1/b\) (FTC, owned) and watches \(A(b)\) level off. Invite the
   definition: *the limit of the thing you already own.* Name what "exists"
   requires — L1's tolerance guarantee with the window replaced by a
   threshold. *(R2; the tertiary obstacle paid on the spot.)*
3. **Predict, then break a prior.** \(1/x\) also decays to zero; its region
   looks the same. Predict whether its accumulation levels off — then watch
   \(\ln b\) creep without ceiling. Decay was never the question. *(R3.)*
4. **Find the boundary.** Sweep \(p\) and watch the accumulation graphs;
   locate the threshold, then *derive* the whole ladder from one FTC
   computation. The p-test is now the learner's own theorem. *(R3, P2
   delivered inside P1's frame.)*
5. **Divergence without infinity.** \(\sin x\): the accumulation oscillates
   in \([0,2]\) forever. Predict what the definition says — the limit fails,
   so it diverges, while nothing blows up. *(R8.)*
6. **The refusal.** \(\int_{-\infty}^\infty x\,dx\) in a truncation
   explorer: symmetric windows report \(0\) forever; drag the offset and the
   report runs away. Ask what value the integral "should" have — and let the
   route-dependence force the two-independent-limits definition as the only
   honest option. *(R7: definition-as-honesty, experienced.)*
7. **Tails.** Split \(\int_1^\infty\) at \(c=10\): the head is a proper
   integral — finite, owned, irrelevant. Move \(c\); nothing about
   convergence changes. Convergence is a property of the tail. *(R4.)*
8. **Trapped accumulation.** Two ordered integrands, two ordered rising
   accumulation graphs; the upper levels off, so the lower is rising under a
   ceiling. Name the supplied fact (bounded + monotone ⇒ converges;
   completeness, the EVT-move from L6) and state comparison as inheritance
   through ordering. *(R5.)*
9. **The resolution.** \(\int_0^\infty e^{-x^2}dx\). Recall L7's theorem:
   no elementary antiderivative — the FTC route is *provably closed*. Compare
   with \(e^{-x}\) on \([1,\infty)\): converges. The learner has certified a
   finite value for an integral no one can antidifferentiate — judgment
   decoupled from computation. Plant, without computing, that the exact value
   \(\sqrt{\pi}/2\) is claimable only with more mathematics (L29's job).
   *(R6.)*
10. **Exit test (predict, not recall).** Fresh integrands, symbolic only, no
    plots: classify each as *converges / diverges / need more information*,
    citing a tail comparison or a ladder rung — before any computation. Then
    two honesty probes: state why \(\int_{-\infty}^\infty\) of an odd
    function is **not** automatically \(0\), and state what "\(\int_1^\infty
    f\) converges" does and does not tell you about how far to integrate for
    three decimal places. *(A learner reciting "p-test, comparison test"
    fails the probes; neither can be answered from the test-bag.)*

**Abstraction return** (required — P1 leans on the accumulation-graph
representation): the sequence must end away from the graphs. Step 10 is
supplied symbolically, and the graded return is a comparison inequality or a
ladder citation *written, not pointed at* — a learner who can classify only
by looking at a leveling curve has acquired the picture, not the concept.
The Gate 4 contract must specify how the assessment detects this.

---

## 1e. Continuity and scope decisions

- **Reuses.** L4's accumulation function \(A(x)=\int_a^x f\) — the same
  object, now asked a new question ("do you level off?"); the FTC evaluation
  form for every ladder rung; L7's substitution (optionally, \(u=1/x\)
  mapping the \(\infty\)-ladder onto the \(0\)-ladder — a scope decision for
  Gate 5, kept only if it earns its minute); L7's \(e^{-x^2}\)
  existence-vs-elementarity theorem, cited verbatim as the setup for step 9;
  L6's some-threshold-never-a-rate discipline, restated for \(b\to\infty\);
  L1's tolerance guarantee as the template the new limit type extends.
  Canonical-example reconciliation against the architecture's register is
  Gate 5 work; the expected fixture needs are the \(x^{-p}\) family,
  \(\sin x\), \(e^{-x}\), \(e^{-x^2}\), the odd-function trap, and
  \(x^{-1/2}\) on \((0,1]\).
- **New machinery, declared honestly.** (1) The limit at infinity — L8
  introduces it, L9 inherits it; the contract must decide whether it gets its
  own graded beat or lives inside step 2. (2) The
  bounded-monotone-convergence fact — **named** as the supplied existence
  hypothesis, proof deferred to the P3 enrichment column, exactly parallel
  to L6's EVT handling. Neither may be smuggled.
- **Visual reuse.** The accumulation graph is L4's family with new data; the
  truncation explorer (symmetric/offset windows, step 6) is the one
  candidate for new interaction surface and must be justified against the
  visual budget at Gate 5 — L8 has no claim to flagship tier.
- **Guardrails recorded for Gate 4.** (1) Never assert "\(f\to 0\) is
  necessary for convergence" — false for integrals (spike trains), true for
  series terms; L10 will need the contrast stated cleanly, so L8 must not
  poison it. Whether the spike counterexample appears in the lesson or only
  in the contract's limitation list is a Gate 4 decision. (2) "Diverges"
  and "\(=\infty\)" must be graded as distinct claims. (3) The symmetric
  truncation of step 6 must not be taught as *wrong arithmetic* — it is a
  well-defined object (the principal value) that is simply **not this
  definition**; one honest sentence, no development.
- **Withheld deliberately.** Absolute vs conditional convergence and
  \(\int \sin(x)/x\) (M2's P3 column and M3's business); limit-comparison as
  a named test (P3 column — comparison alone meets the P2 bar; Gate 4 may
  admit it as an unproved convenience only with justification); the integral
  test for series (L10 owns the bridge); the Gamma function; evaluation of
  \(\int_0^\infty e^{-x^2}dx = \sqrt{\pi}/2\) (requires L29's machinery —
  pointer planted, value not claimed); Cauchy principal value as a
  technique; any convergence theory for oscillatory integrals beyond the
  \(\sin x\) divergence example.
- **Forward edges.** L9/L10 (the tail/comparison architecture, rebuilt for
  sums — L8 should end by saying the next module replays this lesson with
  \(\sum\) for \(\int\)); L24 (ROC; boundary term at infinity carrying the
  initial condition — P4's pointer); L17–L18 (transform integrals licensed);
  L11 (radius of convergence as the same kind of boundary object).
- **Evidence note for Gate 5.** The natural item shape is three-way
  classification (*converges / diverges / insufficient information*) with a
  cited reason — which is a method-selection shape
  (`methodSelection: true`) and needs an adversarial reject battery for the
  two folk priors ("decays so converges", "symmetric so zero") and for
  "bounded so converges" (\(\sin x\)). Free-response comparison items must
  accept any valid dominating/dominated pair, not one blessed witness —
  the grader compares the *inequality on the tail*, not the specific
  \(g\) chosen. Do not resolve this silently.

---

## Draft B — definition-as-honesty direction

# Insight Discovery Brief — Accumulating Forever (spine L8, `improper-integrals`)

**Gate 3 output — DRAFT.** Written 2026-08-10 by the planning session for the
last lesson of Package B. Gate 4 (insight contract with audits) has NOT run;
nothing below is `PASS` yet. Mode C must not begin from this document.

Spine row (M2 `calculus-technique`, L8): *"An integral over an infinite
interval is a **limit of finite accumulations**; convergence is a question
about **decay rate**. Licenses every transform integral in the course."*
Benchmark bar (M2): P1 — standard improper integrals; P2 — *"improper
convergence judged by decay rate"*; P3 (research-bridge enrichment) —
comparison and limit-comparison *proved*, conditional convergence. The spine's
module note calls L8 "the quiet keystone: without improper integrals every
transform in M5–M7 is unlicensed notation."

---

## 1a. Diagnose the cognitive obstacle

**Primary: an incorrect prior mental model, in two entangled halves.**

**(i) "\(\int_a^\infty\) is adding up forever."** The learner treats the
improper integral as a *completed infinite act* — a new object of the same
kind as L3/L4's integral, with \(\infty\) as just another endpoint. The
observable symptoms: writing \([F(x)]_1^\infty\) and "plugging in" \(\infty\)
as if \(F(\infty)\) were a value; and — the sharp failure — running the FTC
ritual straight across a singularity, e.g.
\(\int_{-1}^{1} x^{-2}\,dx = [-1/x]_{-1}^{1} = -2\): a **negative area for a
positive integrand**, produced fluently and without alarm. The learner cannot
say what would make \(\int_1^\infty f\) "fail to exist," because in their
model it is an object, not a claim.

**(ii) "The function goes to 0, so the total is finite."** Height is confused
with accumulated area. A learner holding this belief assigns \(1/x\) and
\(1/x^2\) the same fate on \([1,\infty)\) — both positive, both decreasing,
both vanishing — and is wrong about one of them. Worse, the belief survives
computation: shown that \(\ln R\) "grows slower and slower," the learner reads
slowing growth as approaching a ceiling.

**Secondary: misleading notation** (triggers 1c). \(\int_a^\infty\) and
\([F]_a^\infty\) are *shorthands for limits* that look exactly like the
endpoint notation of L3/L4, so the notation itself teaches misconception (i).
The definition the lesson must install is what the notation was always
abbreviating.

**Not the obstacle:** computing antiderivatives (L7 built that), evaluating
\(\lim_{R\to\infty} F(R)\) for explicit \(F\) (L1's machinery), or the
arithmetic of any single example. Learners do these correctly; the failure is
in what kind of *claim* the improper integral is, and in what decides it.

| Later | Costs paid if this obstacle is not repaired |
| --- | --- |
| L9/L10 `series` | "An infinite sum is the limit of its partial sums" is the same demotion move; a learner who never made it for integrals re-memorizes it for series, and the harmonic series is 1/x's confrontation re-run without the benefit of having seen it. |
| L17–L18 (Fourier) | Every coefficient and transform integral is improper; a learner who "plugs in \(\infty\)" has no way to hear what \(L^2\) convergence or Plancherel are even about. |
| L24 (Laplace) | The region of convergence *is* "which \(s\) make the race winnable" — unintelligible if convergence was never a real question with a real deciding quantity. The derivative rule's boundary term at infinity is a limit that must converge, not a symbol. |

---

## 1b. Raw leads

| # | Lead | Mechanism |
| --- | --- | --- |
| R1 | **The demotion.** \(\int_a^\infty f\) is not a new object; it is a *statement about the family of honest L3/L4 integrals* \(\int_a^R f\) — that their values settle as \(R\) grows. "Improper integral" names a limit taken, not an integral performed. Both improper types are the same move: exhaust the bad edge (\(\infty\), or a singularity) by closed bounded intervals where the L3/L4 contract holds, and ask whether the values settle. | Predictive/causal reorganization + structural compression |
| R2 | **The scandal as motivator.** \(\int_{-1}^{1} x^{-2}\,dx = -2\) by blind FTC — the punishment for treating impropriety as notation. Nothing in the arithmetic is wrong; the *license* was missing: L3/L4 defined the integral, and the FTC's evaluation form, only for suitable integrands on closed bounded intervals. The limit definition arrives as the restoration of a revoked license, not as pedantry. | Counterexample + predictive |
| R3 | **\(F(\infty)\) is a shorthand.** \([\arctan x]_0^\infty = \pi/2\) works because \(\lim_{R\to\infty}\arctan R\) exists; the ritual is *correct exactly when the limit is*, and the notation hides the claim. Demystification in L7's style: the ledger behind the symbol. | Notation demystification |
| R4 | **The confrontation.** \(1/x\) vs \(1/x^2\) on \([1,\infty)\): indistinguishable to belief (ii) — both die — yet \(\int_1^R x^{-2}dx = 1 - 1/R \to 1\) while \(\int_1^R x^{-1}dx = \ln R\) passes every bound. Convergence is a property of the *accumulation*, not of the height. | Contrast/counterexample |
| R5 | **Slowing is not settling.** \(\ln R\) grows ever more slowly *and* exceeds every ceiling. Divergence made honest as a challenge game — name any ceiling \(M\); \(R = e^M\) defeats it — the exact mirror of L1's tolerance game (convergence: any tolerance is eventually delivered; divergence to \(\infty\): any ceiling is eventually exceeded). | Predictive + interactive |
| R6 | **The octave reveal.** \(1/x\) pays *equal rent forever*: \(\int_{2^k}^{2^{k+1}} dx/x = \ln 2\) for every \(k\) — provable by one L7 substitution (\(u = x/2\)), because \(1/x\) is the scale-invariant density (stretch \(x\) by \(\lambda\), height shrinks by \(\lambda\), area preserved). \(1/x^2\)'s octave payments halve each time, so the running total is trapped under a finite geometric bound (finite geometric sum — algebra entry assumption). This is *why* \(p=1\) is the knife-edge, not just where it is. | Structural compression + representational |
| R7 | **The ruler.** The \(p\)-family \(\int_1^\infty x^{-p}dx\): converges iff \(p>1\), with the boundary \(p=1\) belonging to the divergent side. One calibrated family the learner can hold up against anything. Type II mirror at a singularity: \(\int_0^1 x^{-p}dx\) converges iff \(p<1\) — the same sweep, flipped. | Structural |
| R8 | **Comparison as the honest tool.** If \(0 \le f \le g\) and \(\int_a^\infty g\) settles, then \(\int_a^R f\) is a nondecreasing accumulation trapped under a ceiling, so it settles too — convergence decided **without the antiderivative**. The hinge fact ("increasing and bounded above ⇒ converges") is a completeness principle the course has not built; see 1e. | Operational + structural |
| R9 | **The redemption of \(e^{-x^2}\).** L7 proved the recognition search fails: no elementary antiderivative exists. L8 proves the *total exists anyway*: \(e^{-x^2} \le e^{-x}\) on \([1,\infty)\), so \(\int_0^\infty e^{-x^2}dx\) converges by comparison. L7's existence-vs-elementarity distinction, one level up: existence of the total vs computability of the total. (The value \(\sqrt\pi/2\) has a name and a later derivation — stated honestly, not computed.) | Predictive + continuity |
| R10 | **"Goes to 0" is a survivor's condition.** For the decreasing positive integrands this module runs on, decay to 0 is *necessary* (if \(f \downarrow L > 0\), the accumulation grows at least linearly) — and certifies **nothing**. This is L6's central grammar verbatim: a necessary condition filters candidates; it never certifies a winner. "It goes to 0" survives the filter the way \(f'(a)=0\) survived L6's. | Structural compression (cross-lesson) |
| R11 | **The boundary term goes to the boundary at infinity.** Parts on \([0,R]\), then \(R\to\infty\): \(\int_0^\infty x e^{-x}dx = [-xe^{-x}]_0^R + \int_0^R e^{-x}dx \to 0 + 1\). The \([uv]\) entry at \(\infty\) is *itself a limit that must converge* — checked, never plugged. Theme 1's boundary term, and the exact shape of the Laplace derivative rule (M7). | Structural (Theme 1 continuation) |
| R12 | **The cancellation trap.** \(\int_{-\infty}^{\infty} x\,dx\): "it cancels by symmetry, so 0." The definition requires each half to settle *separately*; symmetric simultaneous limits (principal value) are a different, weaker notion, and conflating them is exactly the kind of overclaim the transforms punish later. Same trap in Type II: \(\int_{-1}^1 dx/x\). | Counterexample + definition discipline |

**Anti-anchoring note.** The spine's own sentence — *"a limit of finite
accumulations; convergence is a question about decay rate"* — is treated as an
**inherited hypothesis**: it is the union of two candidate models (the
demotion, R1–R3; the race, R4–R7) and, read as universal, the second half
mildly **overclaims**. Decay rate decides convergence *for the positive
integrands this course needs, via comparison*; oscillatory cancellation
(\(\sin x/x\)) and spike-train integrands converge or diverge by different
mechanisms, all withheld here (see 1e). The brief's finding: the spine
sentence is correct in scope but silent about *order* — and the order is the
pedagogy. See 1d.

---

## 1c. Conventional vs alternative presentation

Triggered by 1a's misleading-notation flag. Both present the **same
definitions and the same tests**; only the discovery order and the reading of
the notation change.

| | Conventional | Alternative (misconception-first) |
| --- | --- | --- |
| **Opening** | Define \(\int_a^\infty f = \lim_{R\to\infty}\int_a^R f\); state the Type II analogue; proceed to examples. | Run the learner's own ritual off a cliff: \(\int_{-1}^1 x^{-2}dx = -2\), a negative area for a positive function. Ask what license was violated. |
| **The definition** | A formality on line one, immediately re-abbreviated to "plug in \(\infty\)." | The *restoration of the revoked license*: only closed bounded intervals are honest, so the improper integral can only be a claim about their trend — L1's guarantee with the window at infinity. |
| **Convergence tests** | The \(p\)-test and comparison stated, then drilled; "check that the integrand \(\to 0\)" often taught as a first step. | Discovered against the confrontation: \(1/x\) vs \(1/x^2\) breaks "goes to 0 suffices," the octave reveal explains *why* \(p=1\) is the knife-edge, comparison arrives as trap-under-a-ceiling on the redeemed \(e^{-x^2}\). |
| **What "\(=\)" means** | \(\int_0^\infty e^{-x}dx = 1\) reads like L4 evaluation. | It reads as a *settled trend*: name a tolerance, some threshold delivers the tail within it — with divergence as the mirrored challenge game. |

- **Preserved:** the definitions (both types), the \(p\)-test, the comparison
  test, every worked value. Nothing is nonstandard; only the order and the
  account change.
- **Easier to infer:** why the definition has the shape it has; when the
  plug-in shorthand is legitimate; why "the integrand vanishes" decides
  nothing; why splitting \(\int_{-\infty}^\infty\) is mandatory, not stylistic.
- **Background introduced:** none beyond L1's limit grammar, L3/L4's
  hypotheses (now load-bearing), L7's substitution and parts, and the finite
  geometric sum (algebra entry assumption).
- **Likely to transfer:** yes — L10 re-runs the identical demotion for series
  (partial sums as the honest finite objects), and L24's region of convergence
  is the race with a parameter in it.

---

## Consolidated packages

### P1 — "There is no infinite integral — only finite ones, and the question of whether they settle" *(R1, R2, R3, R12)*
The central demotion: \(\int_a^\infty f\) (and \(\int_0^1\) of an unbounded
integrand) is **not an object but a claim** about the honest L3/L4 integrals
that exhaust the domain — the claim that their values settle. \(\infty\) is
not an endpoint; \(F(\infty)\) is shorthand for a limit; the FTC applies to
every \([a,R]\) and never to the improper symbol directly; both "types" are
one move; \(\int_{-\infty}^\infty\) requires each half to settle separately.
**Delivers:** the definition as inevitable (the \(-2\) scandal makes it a
repair, not a formality); the notation demystified in L7's ledger style; the
cancellation trap.
**Does not deliver:** any way to *judge* whether a given accumulation settles
— on its own it poses the question this lesson must also answer.

### P2 — "Convergence is a race decided by decay rate; 'goes to 0' names the direction, not the speed" *(R4, R5, R6, R7, R10)*
The repair of belief (ii): the accumulated area depends on *how fast* the
integrand dies, and the \(p\)-family is the calibrated ruler. \(1/x\) is the
knife-edge because it is the scale-invariant density — equal rent per octave,
forever — while \(p>1\) shrinks its octave payments geometrically. Decay to 0
is the survivor's condition: necessary for the monotone case, certifying
nothing — L6's filter grammar, re-instantiated.
**Delivers:** the confrontation, the challenge game (slowing ≠ settling), the
octave mechanism, the \(p\)-ruler with its Type II mirror, and the benchmark
bar's exact phrase.
**Does not deliver:** the demotion (a learner can run the race and still plug
in \(\infty\) across a singularity), or any verdict on integrands outside the
\(p\)-family's reach.

### P3 — "Comparison: convergence is knowable without the antiderivative" *(R8, R9)*
From "to settle \(\int_a^\infty f\) I need \(F\)" to "an increasing
accumulation trapped under a ceiling must settle — so trapping \(f\) under a
known convergent majorant decides the question with no formula for the
answer." The flagship is \(e^{-x^2}\): L7 proved nothing elementary to
recognize; L8 proves the total exists anyway. Existence and computability of
the total are different properties — L7's central distinction, promoted.
**Delivers:** the honest tool the spine names, the redemption arc, and the
license for every transform integral whose antiderivative nobody will ever
write.
**Does not deliver:** the race intuition (comparison says nothing until you
have a family of known verdicts to compare *against* — P2 is its ammunition),
and its hinge borrows a completeness principle (see 1e, open decision 1).

### P4 — "The boundary term goes to the boundary at infinity" *(R11)*
Parts on \([0,R]\), then the limit; the \([uv]\) entry at \(\infty\) is a
limit that must itself converge. Continues L7's Theme 1 thread and plants the
Laplace derivative rule.
**Delivers:** the forward edge M7 needs, and one more case of "checked, never
plugged."
**Does not deliver:** a model change on its own — it is P1's discipline
applied inside a computation, a *component* of the lesson, not its spine.

**Shared engines, not rival packages.** The accumulation-curve picture
(\(F(R)\) plotted with a sliding right edge — L3's accumulation function with
a moving frontier) serves P1, P2, and P3 alike. The counterexample set (the
\(-2\) scandal, \(1/x\), \(\int_{-\infty}^\infty x\,dx\)) serves P1 and P2.

---

## 1d. Ranking

| Rank | Package | Why |
| --- | --- | --- |
| 1 | **P1** | The load-bearing model change: without the demotion, "does it converge?" is not even a well-posed question — the learner has no account of what failure *would be*, which is why belief (ii) can persist alongside correct computations. Highest surprise available in the topic (the \(-2\) scandal is a fluent ritual producing an impossible answer), and the strongest compression: both improper types, the bounds shorthand, the split requirement, and the plug-in rule's exact domain of validity all fall out of one sentence about L3/L4's contract. Mathematically exact, built from L1 + L3/L4 with nothing new. |
| 2 | **P2** | The mandated confrontation and the benchmark bar's own phrase. Ranked second not for weakness but for *dependency*: the race is only runnable once the runner is \(F(R)\) — a learner who has not made P1's demotion reads "1/x diverges" as a fact about a symbol, not a trend, and keeps belief (i) intact. P2 is where the lesson spends most of its screen time; P1 is what makes that time mean something. |
| 3 | **P3** | The honest tool, and the course-level payoff (the "licenses every transform" claim runs through comparison, not through the \(p\)-ruler alone). Ranked third because it consumes both P1 (settling as the question) and P2 (the ruler as ammunition), and because its hinge fact is a scope decision Gate 4 must settle before it can be *derived* rather than declared. |
| 4 | **P4** | Necessary content with a real forward edge, but a component: it is P1's discipline exercised during a parts computation. Kept as a named beat, not a rival model. |

**Selected insight candidate** (P1 primary, P2 secondary, P3 tertiary, P4 as
a named component):

> **"There is no such thing as an infinite integral — only honest finite ones
> on closed bounded intervals, and the question of whether their values settle
> as the intervals exhaust the domain. Whether they settle is decided by decay
> *rate*, not by decay: \(1/x\) and \(1/x^2\) both die, but only the one that
> dies fast enough leaves a finite total — and comparison against the
> \(p\)-family decides the race even when no antiderivative can be written,
> which is what licenses every transform integral in the course."**

> **Why not lead with the spine's own sentence?** It is the union of P1 and P2
> stated in P2's vocabulary, and read cold it *underspecifies the order*: a
> lesson that opens with "convergence is about decay rate" hands the learner a
> test to run while belief (i) — \(\infty\) as an endpoint — is still
> standing, and belief (i) is the one that produces silent wrong answers
> (the \(-2\) scandal, the split violation). It also mildly overclaims: decay
> rate decides the *positive* case via comparison; oscillation is a different
> mechanism this course defers. P1 first makes the spine's sentence safe to
> say — and the sentence, so ordered and so scoped, is what the lesson ends
> on. Correctness is a gate, not a tradeable score; this ordering is not a
> preference.

**Evidence that would have flipped this ranking.**

1. **If M3 were built before L8.** With geometric series and the \(n\)th-term
   test in hand, P2 could anchor to series machinery and plausibly lead — the
   race would already be a familiar game. The spine places L8 before M3
   precisely so the transforms are licensed early, so P2 must stand on the
   finite geometric sum (algebra) and cannot carry the opening.
2. **If the \(-2\) scandal were not available** — i.e., if L3/L4 had defined
   the integral without making the closed-bounded-interval hypothesis explicit
   and graded — P1's opening would be an assertion ("this notation is
   shorthand") rather than a discovered repair, and P2's confrontation would
   be the stronger opening. L3/L4 ship those hypotheses by name, so the
   scandal is a two-line computation away.
3. **If the course targeted P1 (standard computational) rather than P2.** The
   plug-in shorthand plus a memorized test list *is* the P1-profile bar; the
   demotion would be over-scoped, and P2's ruler with drill would rank first.
   The declared target is P2-demanding-applied, whose bar says "judged by
   decay rate" and whose ethos (honest limits, L1 onward) is the demotion.

**Discovery sequence** (discover, not tell; exit is predict-not-recall):

1. **The scandal.** Compute \(\int_{-1}^{1} x^{-2}dx\) by the L4 ritual in
   plain view: \(-2\). The integrand is positive everywhere it is defined.
   Something licensed is being done somewhere unlicensed — find the clause.
   *(L3/L4's hypotheses, re-read as load-bearing. P1 begins as a repair.)*
2. **Rebuild honestly.** On \([1,R]\) everything is licensed. Slide \(R\) and
   watch \(F(R)=\int_1^R e^{-x}dx\) settle toward 1. Define: the improper
   integral is the settled value when there is one — name any tolerance, some
   threshold delivers the tail within it. *(L1's guarantee, window at
   infinity; L6's discipline holds — the limit supplies SOME threshold,
   never a rate.)*
3. **The confrontation.** \(1/x\) and \(1/x^2\), same picture, both dying.
   Predict before sliding: do both \(F(R)\) curves level off? One approaches
   1; the other crosses every line you draw. *(Belief (ii) breaks on screen.)*
4. **Slowing is not settling.** The challenge game: name any ceiling \(M\);
   the explorer answers \(R = e^M\) with \(\int_1^R dx/x > M\). Ever-slower
   growth and unbounded growth coexist. *(Divergence as an honest, checkable
   claim — the tolerance game mirrored.)*
5. **Why \(1/x\) exactly.** Octave bars: \([1,2], [2,4], [4,8]\) each hold
   area \(\ln 2\) — one L7 substitution proves it — equal rent forever.
   \(1/x^2\) halves its payment each octave; the finite geometric sum caps the
   total. Sweep \(p\): the verdict flips at \(p=1\), and the knife-edge
   belongs to the losers. *(P2's mechanism, not just its table; the Type II
   mirror runs the same sweep at 0.)*
6. **A total with no formula.** \(e^{-x^2}\) — L7 proved there is nothing to
   recognize. Doomed? Trap it under \(e^{-x}\) on \([1,\infty)\): the
   accumulation is increasing and under a ceiling, so it settles. The total
   *exists*, provably, and no one will ever write it as an elementary
   antiderivative. *(P3; existence vs computability, promoted from L7.)*
7. **The boundary term at infinity.** \(\int_0^\infty x e^{-x}dx\) by parts
   on \([0,R]\), then \(R \to \infty\): the \([uv]\) entry at \(\infty\) is a
   limit, checked like any other. *(P4; the Laplace pointer planted, not
   taught.)*
8. **The trap.** \(\int_{-\infty}^{\infty} x\,dx\): "it cancels." Under the
   definition, each half must settle separately, and neither does. Symmetric
   simultaneous limits are a different claim with a different name. *(P1's
   discipline, applied where intuition is loudest.)*
9. **Exit test (predict, not recall).** Fresh integrands, symbolically given,
   no antiderivative computed: (a) classify \(\int_1^\infty\) convergence by
   comparison and *name the \(p\)-family member (or exponential) that did the
   deciding, with the inequality's direction*; (b) shown a blind-FTC
   computation across an interior singularity, name the violated hypothesis
   and state the honest verdict for each half; (c) for a decreasing positive
   integrand with \(f(x)\to 0\), say what — if anything — that fact alone
   settles, and why. *(A learner reciting "check if it goes to 0, then apply
   a test" fails (c); it cannot be answered from the procedure.)*

**Abstraction return** (the race/rent grounding is light but real): the
sequence must end away from the game. Steps 1–8 may speak of races, rent, and
ceilings; step 9 is symbolic, and the graded return is the comparison chain
stated as inequalities between integrals with hypotheses attached. The
grounding's pragmatic additions — races *finish*, rent involves an *agent*,
"forever" suggests a *completed act* — are precisely misconception (i)
re-armed, so the bridge language must be named and discarded in Gate 4's
Audit B5 with unusual care: this is a lesson whose grounding vocabulary can
reinstall the disease it treats.

---

## 1e. Continuity and scope decisions

- **Reuses.** L1's tolerance-game grammar, re-run with the window at infinity
  and mirrored for divergence (the challenge game). L3/L4's definite integral
  *with its hypotheses now load-bearing* — the scandal is those hypotheses
  read aloud. L7's substitution (proves the octave equality), parts (P4), and
  \(e^{-x^2}\) — the same fixture in a genuinely new role, from "the
  recognition search fails" to "the total exists anyway." L6's filter grammar:
  "goes to 0" is to convergence what \(f'(a)=0\) was to extrema — a necessary
  condition that certifies nothing — and the lesson should say so in exactly
  those words, because the learner already owns them.
- **Canonical examples.** \(1/x\) and \(1/x^2\) (the confrontation);
  the \(p\)-family sweep, both edges; \(e^{-x}\) (the friendly opener and the
  standard majorant); \(e^{-x^2}\) (redemption); \(x e^{-x}\) (boundary term);
  \(1/(1+x^2)\) (the shorthand-done-right beat: \(\arctan\) exists, the ritual
  is legitimate, and the decay is \(p=2\)-comparable — ruler and shorthand
  agree); \(\int_{-1}^1 x^{-2}dx\) (the scandal); \(\int_{-\infty}^\infty x\,dx\)
  and \(\int_{-1}^1 dx/x\) (the traps); \(1/\sqrt{x}\) on \((0,1]\) (Type II
  convergent). No fresh fixture is obviously needed; if the mastery contract
  wants one integrand outside the \(p\)-family for the exit classification,
  justify it there, not by default.
- **Visual reuse.** The accumulation-function picture from L3 with a sliding
  right edge (the \(F(R)\) explorer), plus octave bars as an overlay on the
  standard `function-plot` family. **No new visual family**; supporting tier —
  the interaction (slide \(R\), the challenge game, the \(p\)-sweep) earns its
  place; no bespoke guided-scene clip.
- **Open scoping decision 1 — the completeness hinge.** Comparison's proof
  runs through *"a nondecreasing accumulation bounded above converges."* L1
  built limits as guarantees; the course has never stated a monotone
  convergence principle. Options: (a) **name and declare it** as an honest
  assumption with a forward pointer to M3, matching the repo's existing
  pattern of declared-not-derived facts (`monotoneIntervals`); (b) derive it
  from completeness — out of scope and a recursion risk. Recommendation for
  Gate 4: (a), stated once, prominently, as the single borrowed brick — the
  benchmark places *proved* comparison in P3 enrichment, so P2's bar is
  "used, with its hinge named," which (a) delivers.
- **Open scoping decision 2 — limit comparison.** The P3 bar lists it as
  research-bridge material. Recommendation: teach direct comparison at full
  strength; mention limit comparison as labeled enrichment at most. Gate 4
  confirms against `benchmark-matrix.md` §2.
- **Withheld deliberately.** Computing \(\int_0^\infty e^{-x^2}dx = \sqrt\pi/2\)
  (needs L29–L30 machinery; the lesson says the value has a name and a later
  derivation — the honest-limits move). Conditional convergence and
  \(\int_0^\infty \sin x/x\,dx\) (P3-bar territory; oscillatory cancellation is
  a different mechanism, and pretending decay rate covers it would be the
  overclaim flagged in 1b). Principal value as a *technique* (named only as
  the trap's other reading). The Gamma function as a topic (only the
  \(xe^{-x}\) instance appears). The spike-train counterexample showing
  \(f \to 0\) is not even necessary for non-monotone \(f\) — real, but its
  natural home is L10's contrast with the \(n\)th-term test; Gate 4 decides
  whether it earns a one-line guardrail here or waits. The integral test for
  series (L10 owns it; L8's octave bars *are* its picture, and the lesson
  should plant that pointer without teaching it).
- **Forward edges.** L9/L10: the identical demotion (partial sums as the
  honest finite objects) plus the sharpened contrast — for series
  \(a_n \to 0\) *is* necessary; the octave bars are the bridge. L11/L24:
  radius and region of convergence as "which parameter values win the race."
  M5–M7: every transform integral is an improper integral this lesson
  licenses — the spine row's claim, and the reason the module note calls L8
  the keystone. M7 specifically: the Laplace derivative rule is P4's boundary
  term with an initial condition in it.
- **Evidence note for Gate 5.** The natural graded shapes are
  method-selection-like: *classify + produce the comparator + state the
  inequality's direction and which side is known* — an answer with structure,
  not a keyword; flag for `ITEM_ASSESSMENT_META` and the grading-contract
  battery (the adversarial rejects should include: correct verdict with
  inverted inequality, comparison against a divergent majorant, "it goes to 0
  so it converges" as a distractor justification, and a plug-in-\(\infty\)
  computation that happens to get the right value for the wrong reason). The
  challenge game is numerically gradable (given \(M\), produce any valid
  \(R\)). A "state the definition" recall item is *not* the evidence; step 9
  is.