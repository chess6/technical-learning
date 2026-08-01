# Insight Discovery Brief — The Chain Rule: Rates Compose (spine L5)

Stage 1 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md)
for `chain-rule`. First lesson of Package B (`calculus-technique`), and the
first lesson after Package A's complete arc.

Spine row: [course-spine §4](../../course-spine.md#4-the-spine-at-a-glance), L5.

> **Model-routing note.** AGENTS.md routes Mode B insight-contract authoring
> to Opus. This brief and its companion [insight.md](insight.md) were
> authored on Sonnet 5, per the user's explicit instruction after switching
> the session model. Flagged here rather than left silent; the mathematical
> content is independently checkable regardless of which model produced it
> (see insight.md's Audit A), and both documents should still get the
> independent review a Gate 4 `PASS` is meant to invite.

---

## 1a. Diagnose the cognitive obstacle

**Primary: an incorrect prior mental model — "cancel the du's" *is* the proof.**
Almost every learner arrives already able to *state* the chain rule
(\(dy/dx = (dy/du)(du/dx)\)) and to *apply* it fluently, because the Leibniz
notation makes it look like ordinary fraction cancellation. That fluency is the
trap: the cancellation story is a mnemonic that happens to give the right
answer, not an argument, and it silently assumes something that can fail —
that \(\Delta u \neq 0\) for every small \(\Delta x \neq 0\) near the point, so
that \(\Delta y/\Delta x = (\Delta y/\Delta u)(\Delta u/\Delta x)\) can be
regrouped at all. A learner who has only ever cancelled du's has no way to
answer *why* the rule still gives the right (and unsurprising: zero) answer at
a point where the inner rate is itself zero, because the "proof" they hold
breaks down exactly there. The observable symptom: a learner who computes
\(\frac{d}{dx}\sin(x^3)\) instantly and cannot say what would need to be true
for "cancel the du" to be a legitimate step, or what actually goes wrong when
it isn't.

**Secondary: missing structure — composition of RATES looks like a new fact,
not a consequence of composing FUNCTIONS.** The chain rule is presented as a
rule about derivatives, disconnected from the plain fact that
\(f\circ g\) is itself a function built by composing two others. Learners do
not see that "the derivative of a composition" ought to be answerable from
"what a derivative *is*" (L2's own compression) plus "what composition does" —
so the rule arrives as an additional fact to memorize rather than a
consequence already implied by L2.

**Tertiary: inability to predict where the rule comes from before being told
it.** Nothing in the standard presentation lets a learner *derive*, from L2's
own local-linear model, what composing two rates should do — the rule is
simply asserted and then practiced.

**Not the obstacle:** identifying "outer" and "inner" functions, or the
mechanical multiplication once the rule is accepted. Both are easy and most
learners already do them correctly. The obstacle is that the rule is held as
an isolated fact backed by an argument (cancel the du's) that does not
actually justify it in general — so nothing about it can be *derived*,
*trusted at an edge case*, or *transferred* to the multivariable setting where
the naive cancellation story does not even typecheck (there is no single
\(du\) to cancel).

| Later | Costs paid if this obstacle is not repaired |
| --- | --- |
| L7 `substitution-parts` | Substitution *is* the chain rule read backwards; a learner who never saw the rule as composing functions cannot see the reversal. |
| `partial-derivatives-gradient` | The multivariable chain rule is literal matrix multiplication (Jacobians composing) — invisible to a learner whose only model is "cancel the du," which has no multivariable analogue at all. |
| `vector-fields-line-integrals` | A line integral is evaluated by parameterizing the path and differentiating the composition — the same composed-rate structure, in a context with no single scalar "rate" to fall back on. |

---

## 1b. Raw leads

| # | Lead | Mechanism |
| --- | --- | --- |
| R1 | Composing two linear maps composes their matrices; in one dimension, \(f'(a)\) and \(g'(a)\) are the \(1\times1\) matrices, so composing the derivatives is composing the maps. | Structural compression |
| R2 | The "du cancels" step in Leibniz notation is not fraction algebra; it is regrouping a limit as a product of two limits, which silently requires \(\Delta u\neq0\) nearby to even divide. | Semantic grounding |
| R3 | Zooming into \(g\) at \(a\), then zooming the *result* into \(f\) at \(g(a)\), is the same picture as one zoom with a compounded magnification factor. | Operational grounding |
| R4 | Rates multiply the way conversion factors multiply: miles/gal \(\times\) gal/hr = miles/hr — an everyday grounding for why composing rates should multiply rather than add. | Semantic grounding |
| R5 | If \(g\) is continuous at \(a\) (L1), a small step in \(x\) forces a genuinely small step in \(u=g(x)\); the outer rate then turns *that* small step into an even smaller one, at a rate set by \(f'(g(a))\). | Predictive/causal reorganization |
| R6 | Substitute one local-linear model into the other algebraically: \(g(a+h)\approx g(a)+g'(a)h\), then \(f\) of that is \(\approx f(g(a)) + f'(g(a))\cdot[g'(a)h]\) — the chain rule falls out of composing L2's own approximations, not from a new principle. | Structural compression + representational change |
| R7 | A factory's revenue-per-input-unit is (price per widget) \(\times\) (widgets per input unit) — a second, independent "compounding conversion factors" grounding. | Operational/semantic grounding |
| R8 | The naive "cancel du" derivation genuinely breaks when \(\Delta u = g(a+h)-g(a)\) is zero for some sequence of \(h\to0\) (possible even when \(g\) is well-behaved) — yet the theorem is still true. Repairing the derivation means composing L2's residual terms \(E(h)\), not difference quotients: the same honesty move L2 made replacing "touches once" with "error decays faster." | Predictive/causal reorganization |
| R9 | New prediction unlocked: instantly differentiate a composite like \(\sin(3x^2+1)\) by *recognizing the decomposition* — before the insight, a learner can only pattern-match against a memorized template; after, they see "identify two local-linear models, then compose them." | Predictive/causal reorganization |
| R10 | Adjacent transfer: once \(f'(a)\) is read as a \(1\times1\) matrix (L2 C9), the multivariable chain rule is literally matrix multiplication of Jacobians — the exact promotion LA's `matrix-composition` (L6) already teaches, one dimension up. | Structural compression (forward) |
| R11 | The chain rule is a second instance of this course's recurring move: a fluent, popular heuristic ("cancel the du's," like L2's "touches once" or L4's "no antiderivative means no value") gets the right answer for the wrong reason, and repairing it reveals what is actually being asserted. | Semantic grounding (meta) |
| R12 | Two independent routes to the same derivative, corroborated: differentiate a composite via the chain rule, and — where the composite can be expanded algebraically first — differentiate the expansion termwise, and confirm they agree. | Structural compression (verification) |

**Anti-anchoring note.** The spine's own stated insight for this lesson —
*"composing functions composes their local linear models, so rates multiply;
this is matrix composition (LA L6) in one dimension"* — is R1/R10 above. It is
treated here as an **inherited hypothesis**, not a preferred answer, and
competes against the other eleven leads on equal footing in 1d.

---

## 1c. Consolidated packages

### P1 — "Compose the models, not just the numbers" *(R6, R8, R2, R11)*
The chain rule is what happens when you substitute one local-linear
approximation into another. \(g\)'s approximation near \(a\) feeds the input
to \(f\)'s approximation near \(g(a)\); multiplying the two slopes is a
byproduct of that substitution, not the content of it. The genuine payoff is
R8: the popular "cancel the \(du\)" story silently divides by \(\Delta u\),
which can be zero for a sequence of steps even when \(g\) is perfectly
well-behaved — the same kind of quiet gap L2 closed when it replaced "touches
once" with "error decays faster than the step." Repairing it means composing
**error terms** (L2's own \(E(h)\)), not difference quotients: substitute
\(k=g(a+h)-g(a)\) into \(f(g(a)+k)=f(g(a))+f'(g(a))k+E_f(k)\) — an identity
that holds even when \(k=0\), since \(E_f(0)=0\) by construction, so no
division by \(\Delta u\) is ever needed.
**Delivers:** the actual derivation (§7), and the honest resolution of R8's
tension.

### P2 — "Rates multiply because they're \(1\times1\) matrices composing" *(R1, R4, R7, R10)*
The spine's inherited hypothesis. Once P1 establishes *why* the rule works,
this names *what* the answer looks like and *where it goes next*: \(f'(a)\)
is the \(1\times1\) matrix of the linear map \(h\mapsto f'(a)h\) (L2 C9), so
composing the two derivatives is exactly composing the two maps — the same
fact LA's `matrix-composition` teaches, promoted forward to real matrix
multiplication once the domain grows past one dimension (Jacobians).
**Delivers:** the compact multiplication statement, and the two forward
bridges (LA `matrix-composition`; the multivariable chain rule).

### P3 — "Two zooms, one zoom" *(R3, R9)*
Operationalizes P1 for the explorer. Zoom into \(g\) at \(a\); the window that
results is itself the input to a second zoom, into \(f\) at \(g(a)\).
Composing two magnifications is a single compound magnification — visually,
two linked local-linearity-zoom panels, reusing L2's own family with no new
one needed.
**Delivers:** the interactive mechanism and the new-prediction beat (R9):
recognizing a composite's decomposition unlocks instant differentiation.

### P4 — "Rates multiply because units multiply" *(R4, R7, alone)*
The everyday grounding: miles/gal \(\times\) gal/hr = miles/hr, or price/widget
\(\times\) widgets/input = price/input. Appealing, concrete, and immediately
available without any of L2's machinery.
**Delivers:** a friendly first-contact framing, but no derivation and no
account of *why* the rule holds when one factor is zero, or why it generalizes
to matrices rather than staying scalar.

### P5 — "The template" *(R12)*
A corroboration beat matching L4's ethos: verify a composite's derivative two
independent ways (chain rule; direct expansion, where possible) and confirm
agreement.
**Delivers:** a practice-tier cross-check, not a source of the insight itself.

---

## 1d. Ranking

| Rank | Package | Why |
| --- | --- | --- |
| 1 | P1 | Highest surprise (most learners believe "cancel the du" *is* the proof; discovering it silently assumes \(\Delta u\neq0\), and that the real derivation composes error terms, is genuinely illuminating) and the strongest explanatory compression: it extends the *exact* model L2 already built (rate = slope = local-linear model) rather than introducing a new frame. Prerequisite fit is minimal (L2 alone). Mathematically correct with nothing hidden — the derivation in §7 handles \(\Delta u=0\) honestly instead of assuming it away. |
| 2 | P3 | The interactive mechanism P1 needs to be *shown*, not just stated — two linked zoom panels make "substitute one approximation into another" visible and operational, and it delivers R9's new-prediction payoff (recognize the decomposition, differentiate instantly). Zero new visual family required (Supporting tier). |
| 3 | P2 | Real transfer value (the LA bridge, the multivariable/Jacobian forward connection) and mathematically correct, but **lower surprise as a lead**: "rates multiply" is the standard textbook framing learners already half-expect, so alone it restates the conclusion in new language rather than explaining why it is licensed. Demoted from primary for exactly that reason — see the blockquote below. |
| 4 | P4 | Concrete and low-prerequisite, but it is **the same kind of heuristic as "cancel the du"** dressed in different clothing: units multiplying gets the right answer without exposing why, and offers nothing for the \(g'(a)=0\) case or for why matrices (not just numbers) are what is really composing. Kept as a first-contact hook, not a leading package. |
| 5 | P5 | Genuine and useful, but a verification technique for practice, not a source of insight — the same role L4's dual-computation beat plays for the FTC, reused here rather than re-derived. |

**Selected: P1 primary** (the derivation and its honest resolution of the
cancel-\(du\) gap), **P2 secondary** (the compact statement + forward
bridges), **P3 tertiary** (the interactive/operational mechanism, delivering
P1 live).

> **Why not lead with P2** (the more common choice, and the spine's own
> inherited hypothesis)? Because "rates multiply, and that's matrix
> composition in one dimension" is the *answer* dressed as an *insight* — it
> is correct and valuable as a destination, but on its own it does not touch
> why the multiplication is licensed, and a learner who accepts it without
> P1's derivation is in exactly the same position as one who only ever
> cancelled the du's: fluent, but unable to say what would go wrong at
> \(g'(a)=0\) or why the naive proof needs repair there. P1 is what makes P2
> *earned* rather than *asserted* — the same relationship L4's telescoping
> argument has to "the two parts of the theorem," and the same discipline
> this course applies everywhere: state what is actually being claimed, then
> derive it, rather than lead with the memorable conclusion.

**Evidence that would have flipped this ranking:** if L2's residual
formalism (\(E(h)/h\to0\)) had not already been built and graded — i.e. if
this were the learner's first encounter with an honest error-term
argument — P1's derivation would be introducing two new ideas at once
(composition *and* residual algebra) rather than one, and P2/P3 alone
(state the multiplication rule, show it operationally via two zooms, defer
the residual-composition proof to a "why" layer) would have been the
better-scoped primary. Since L2 already carries C5 by name, P1 costs nothing
new prerequisite-wise and is worth leading with.

---

## 1e. Continuity decision recorded here

- **Canonical examples:** a polynomial-inside-polynomial composite for the
  main worked derivation — \(g(x)=x^2+1\) is fresh; its outer function,
  \(f(u)=u^3\), coincides with L2/L4's `ex-cubic-inflection`, reused here in a
  new role (as an *outer* function being composed, not displayed on its own),
  which is honestly a reuse, not a fresh function — the composite
  \((x^2+1)^3\) as an object is still new; \(|x|\) composed inside/outside a
  smooth function for the corner edge case (L2's `ex-abs` already carries the
  corner — reused as the *inner* function here, a genuinely new role for it,
  not a repeated example).
  **Descoped at build time:** a trigonometric composite for R9's
  "recognize the decomposition, differentiate instantly" prediction was
  planned here but not shipped — the guided scene's actual `predict` beat
  asks a different, genuine question instead (what decides \(f'(g(a))\),
  with \(f'(2)\) withheld from the panel until `zoomOuter` reveals it), and
  R9's underlying payoff (recognize a decomposition and differentiate on
  sight) is discharged instead by `chain-differentiate-fresh`
  (a polynomial composite, not a trig one).
- **Reuses:** `local-linearity-zoom` (L2's family), as **two linked panels** —
  exactly the reuse `LocalLinearityZoom.tsx`'s own module docstring already
  anticipates. `function-plot` (L1's family) for the composite's graph, with
  new data.
- **Creates:** no new visual family. L5 is **Supporting tier**
  ([architecture §5.1](../../curriculum-architecture.md#51-visual-budget-flagship-vs-supporting)):
  an explorer where the interaction (linking the two zoom panels) earns its
  place, no bespoke guided-scene clip budgeted.
- **Withheld deliberately:** the multivariable chain rule and Jacobians
  (deferred to `partial-derivatives-gradient`); substitution as the chain
  rule read backwards (deferred to L7 `substitution-parts`, which names this
  lesson as its own prerequisite for exactly that reversal); a full
  \(\varepsilon\)-\(\delta\) proof of the residual-composition squeeze step
  in §7 — the key gap (why \(E_f(\Delta u)/h\to0\)) is named and its resolution
  sketched via L1's continuity of \(g\), in the same "unproved step, named on
  screen" register L1's modulus and L4's uniform continuity already use, not
  re-derived from scratch.
