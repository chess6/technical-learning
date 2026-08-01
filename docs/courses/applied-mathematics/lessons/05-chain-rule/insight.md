# Approved Insight Contract — The Chain Rule: Rates Compose (spine L5)

Stage 2 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md),
selecting from [insight-brief.md](insight-brief.md), with Audits A and B.

Primary insight: **Package P1** — *the chain rule is what happens when you
substitute one local-linear model into another, and doing that honestly (with
error terms, not difference quotients) is what repairs the gap in "cancel the
du's."* **P3** (two zooms compound to one zoom) is its operational mechanism
and opening; **P2** (rates multiply because \(1\times1\) matrices are
composing) is the compact statement the derivation earns, and the forward
bridge to the multivariable case.

> **Model-routing note.** AGENTS.md routes Mode B insight-contract authoring
> to Opus; this contract was authored on Sonnet 5 per the user's explicit
> instruction (see [insight-brief.md](insight-brief.md)'s note). The `PASS`
> below was originally certified by this same agent lineage's own Audit A/B —
> not an independent reviewer's — and an independent review subsequently
> found a real gap in exactly the step Audit A had certified clean (C7; see
> Audit A below and the review-fix note in
> [HANDOFF.md](../../../../engineering/HANDOFF.md)), which is precisely the
> failure mode self-certification cannot catch. The gap is now fixed and
> re-verified, but the `PASS` still reflects one round of independent review,
> not a domain-owner's sign-off — see the Review signoff section below.

---

## Primary insight (contents 1–11)

### 1. Diagnosed cognitive obstacle
**An incorrect prior mental model, held with high confidence.** Nearly every
learner can already state and apply \(dy/dx=(dy/du)(du/dx)\) fluently,
because Leibniz notation makes "cancel the du" look like ordinary fraction
algebra. That fluency is the obstacle: the cancellation is not a proof, and
it silently requires \(\Delta u=g(a+h)-g(a)\neq0\) for the regrouping
\(\Delta y/\Delta x=(\Delta y/\Delta u)(\Delta u/\Delta x)\) to even be
defined. A learner with only this story cannot say what licenses the
regrouping, and has no account of the case \(g'(a)=0\), where the rule's
answer (zero) is obviously right but the cancellation "proof" offers nothing.

### 2. Insight mechanism(s)
**Structural compression** (the chain rule is a consequence of L2's own local-
linear model, not a new fact) driven by **representational change**
(composing two zooms), with **predictive/causal reorganization** in the
honest repair of the cancel-\(du\) gap: composing L2's residual terms, not
difference quotients.

### 3. Initial mental model
"The chain rule says multiply the two derivatives — the inner one and the
outer one, evaluated at the right points. It works because the \(du\)'s
cancel, like fractions."

### 4. Tension / redundancy
L2 already gave a complete, honest account of what a derivative *is*:
\(f(a+h)=f(a)+f'(a)h+E(h)\) with \(E(h)/h\to0\) (L2 C5) — the best local
linear model, with a labelled, nonzero error. If that is really what a
derivative means, then the derivative of \(f\circ g\) ought to be answerable
from that definition alone, by substituting \(g\)'s local model into \(f\)'s.
Instead, the chain rule usually arrives as an independent rule, backed by an
argument ("cancel the \(du\)'s") that is not the C5 argument at all and that
quietly needs \(\Delta u\neq0\) to work. Either the derivative is the local-
linear object L2 built, and the chain rule follows from it — or L2's
definition was incomplete after all.

It was complete. The chain rule follows.

### 5. The model change

**Substitute one local-linear model into the other, and let the error terms
compose — not the difference quotients.** Write \(b=g(a)\). By L2 C5,

\[
g(a+h) = g(a) + g'(a)h + E_g(h), \qquad E_g(h)/h\to0,
\]
\[
f(b+k) = f(b) + f'(b)k + E_f(k), \qquad E_f(k)/k\to0.
\]

Set \(k=k(h)=g(a+h)-g(a)\) — genuinely the same object as \(\Delta u\), but
now it is a term in an *identity*, never a divisor. Substituting \(g\)'s
approximation as \(f\)'s input:

\[
f(g(a+h)) = f(b) + f'(b)\,k(h) + E_f(k(h))
= f(g(a)) + f'(g(a))\bigl[g'(a)h+E_g(h)\bigr] + E_f(k(h)).
\]

This identity holds for **every** \(h\), including any \(h\) where
\(k(h)=0\) — because \(E_f(0)=f(b)-f(b)-f'(b)\cdot0=0\) automatically, by
\(E_f\)'s own definition, not by convention. That is exactly the fix: the
"cancel the \(du\)" argument breaks at \(\Delta u=0\) because it tries to
*divide* by \(\Delta u\); this argument never divides by it at all — it only
ever *substitutes* it. The old mental model asked the wrong question
("how do the ratios cancel?"); the right one is "how do the two
approximations, and their two errors, compose?"

### 6. Full causal chain

| # | Step | Depends on |
| --- | --- | --- |
| C1 | \(f\circ g\), evaluated near \(a\): \(g\) sends \(a+h\) near \(b=g(a)\); \(f\) sends that near \(f(b)\). Composition of two functions, nothing about derivatives yet. | — |
| C2 | \(g\) is differentiable at \(a\): \(g(a+h)=g(a)+g'(a)h+E_g(h)\), \(E_g(h)/h\to0\). | **L2 C5** |
| C3 | \(f\) is differentiable at \(b=g(a)\): \(f(b+k)=f(b)+f'(b)k+E_f(k)\), \(E_f(k)/k\to0\), and \(E_f(0)=0\) forced by the definition of \(E_f\). | **L2 C5** |
| C4 | Set \(k(h)=g(a+h)-g(a)=g'(a)h+E_g(h)\) — this is \(\Delta u\), now a term in an identity rather than a divisor. | C2 |
| C5 | Substitute: \(f(g(a+h)) = f(g(a)) + f'(g(a))\bigl[g'(a)h+E_g(h)\bigr] + E_f(k(h))\). Holds for every \(h\), including where \(k(h)=0\) (C3). | C1, C3, C4 |
| C6 | Divide by \(h\) and separate three terms: \(f'(g(a))g'(a)\) (constant), \(f'(g(a))\cdot E_g(h)/h\to0\) (C2), and \(E_f(k(h))/h\). | C5 |
| C7 | For \(h\) with \(k(h)\neq0\), write \(E_f(k(h))/h = \bigl[E_f(k(h))/k(h)\bigr]\cdot\bigl[k(h)/h\bigr]\). The first factor \(\to0\): \(g\) differentiable at \(a\) \(\Rightarrow\) continuous there (**L2 C11**), so \(k(h)\to0\) as \(h\to0\), and composing that with \(E_f(k)/k\to0\) as \(k\to0\) (C3) gives \(E_f(k(h))/k(h)\to0\). The second factor is **bounded**, in fact convergent: \(k(h)/h = g'(a)+E_g(h)/h \to g'(a)\) — this is C2/C4, differentiability of \(g\), not merely its continuity. A vanishing factor times a bounded one vanishes, so \(E_f(k(h))/h\to0\). Where \(k(h)=0\), no factoring is needed at all: \(E_f(0)=0\) makes the term identically \(0/h=0\). | C2, C3, C4, L2 C11 |
| C8 | **The result.** \((f\circ g)'(a) = f'(g(a))\,g'(a)\) — every term in C6 accounted for, with the \(\Delta u=0\) case never requiring a division. | C6, C7 |
| C9 | **The compression.** This is L2's own local-linear model, substituted into itself: \(f\circ g\)'s best local line at \(a\) is \(f\)'s best local line at \(b=g(a)\), fed \(g\)'s best local line at \(a\) as input. Nothing new was assumed beyond C5. | C5, L2 C8 |
| C10 | **Rates multiply because \(1\times1\) matrices compose.** \(f'(g(a))\) and \(g'(a)\) are the \(1\times1\) matrices of the linear maps \(k\mapsto f'(g(a))k\) and \(h\mapsto g'(a)h\) (L2 C9); composing the maps composes the matrices, i.e. multiplies the numbers — the same fact LA `matrix-composition` teaches, here in dimension 1. | C8, **L2 C9**, LA `matrix-composition` |
| C11 | **Operational picture.** Zooming into \(g\) at \(a\) produces a window whose own content — near \(b=g(a)\) — is exactly what a second zoom, into \(f\), magnifies again. Two magnifications compound into one: the composed local-linear model's slope is the product. | C9, L2 C3 |
| C12 | \(g'(a)=0\) is not a special case requiring separate treatment: C8 gives \((f\circ g)'(a)=f'(g(a))\cdot0=0\) directly, and C5–C7 never divided by \(g'(a)\) or by \(k(h)\) to get there. | C8 |
| C13 | Forward: L7 reads substitution as this rule run backwards; `partial-derivatives-gradient` promotes C10 to genuine matrix multiplication of Jacobians (more than one input, more than one output); `vector-fields-line-integrals` differentiates a parameterized path composed with a field, the same C1–C8 structure with no single scalar "rate" available. | C8, C10 |

### 7. Minimal formal derivation

Let \(g(x)=x^2+1\) and \(f(u)=u^3\), so \((f\circ g)(x)=(x^2+1)^3\), and take
\(a=1\): \(b=g(1)=2\).

By C2 (L2 C5) applied to \(g\) at \(a=1\): \(g'(x)=2x\Rightarrow g'(1)=2\), so
\[
g(1+h) = 2 + 2h + \underbrace{h^2}_{E_g(h)}, \qquad E_g(h)/h = h\to0.
\]

By C3 applied to \(f\) at \(b=2\): \(f'(u)=3u^2\Rightarrow f'(2)=12\), so
\[
f(2+k) = 8 + 12k + \underbrace{3\cdot2\,k^2+k^3}_{E_f(k)}, \qquad E_f(k)/k = 6k+k^2\to0.
\]

Substituting \(k(h)=2h+h^2\) (C5):
\[
f(g(1+h)) = 8 + 12(2h+h^2) + E_f(2h+h^2) = 8 + 24h + 12h^2 + E_f(2h+h^2).
\]
Dividing by \(h\), the constant term is \(12\cdot2=24=f'(2)g'(1)\); the
\(12h^2/h=12h\to0\); and \(E_f(2h+h^2)/h = (6(2h+h^2)+(2h+h^2)^2)\cdot\frac{2h+h^2}{h}\to0\cdot2=0\).
So \((f\circ g)'(1)=24\).

**Corroboration, independent of the chain rule:** expand directly,
\((x^2+1)^3=x^6+3x^4+3x^2+1\), so \(\frac{d}{dx}(x^2+1)^3=6x^5+12x^3+6x\), and
at \(x=1\) this is \(6+12+6=24\) — the same number, reached without composing
anything.

### 8. Equivalence to the original object
\((f\circ g)'(a)=f'(g(a))g'(a)\) is the standard chain rule, and C5–C8 is
the standard proof structure (the "\(E_f(0)=0\)" device that avoids dividing
by a possibly-zero \(\Delta u\) is the usual repair of the naive argument,
stated here rather than glossed over). Nothing is weakened; the lesson states
the rule symbolically and uses C5–C9 as its meaning.

### 9. Cost / model change
The learner gives up "cancel the \(du\)'s" as *the reason* the rule works
(they may keep it as a mnemonic for *what* the rule says) and accepts that
the real argument works with error terms, not ratios. This costs one extra
layer of algebra (C5's substitution) beyond what "multiply two numbers" would
suggest — discharged by C7's payoff: the \(g'(a)=0\) case, which the
cancellation story cannot even approach, falls out for free (C12).

### 10. What the learner can predict or do afterward
- Predict, before computing, that \((f\circ g)'(a)=0\) whenever \(g'(a)=0\) —
  and say why the "cancel the \(du\)" argument could not have told them that.
- Decompose an unfamiliar composite into outer/inner functions and
  differentiate it on sight, without a memorized template.
- Explain what goes wrong in "cancel the \(du\)'s" as a proof, precisely (not
  "it's not rigorous" — *which step* fails and *why* it doesn't matter here).
- Verify a chain-rule computation by a second, independent route (direct
  expansion) when one is available.
- State the chain rule as a statement about composing \(1\times1\) matrices,
  and say what changes (nothing conceptually; genuinely matrix multiplication)
  when the maps go from \(\mathbb{R}\to\mathbb{R}\) to \(\mathbb{R}^n\to\mathbb{R}^m\).

### 11. Transfer assessment
Given a fresh composite built from functions not used in the lesson's
examples (e.g. a rational function inside a trigonometric one), differentiate
it, state what \(g'(a)\) being zero would predict about the answer *before*
computing, and say — without being asked to name "the chain rule" — which
route (direct expansion vs. composing derivatives) is more efficient here and
why. This is D8 (method selection) folded into a transfer item: efficient
route selection depends on whether the composite is *expandable*, which the
learner must judge, not recall.

---

## 12. Bridge *(grounded insight)*
**One bridge, a true instance rather than an analogy — reused, not new.**
Two zooms in sequence, resumed from L2. Zooming into \(g\) at \(a\) produces
a window; that window's own content, near \(b=g(a)\), is exactly what a
second zoom (into \(f\)) magnifies further. This is not a metaphor for
composing local-linear models; it *is* composing them, using the same
operational move L2 already grounded (successive magnification), applied
twice.

## 13. Preserved correspondences & analogy limits

| Bridge element | Mathematical counterpart | Preserved? |
| --- | --- | --- |
| The first zoom's output window | \(g\)'s local-linear model near \(a\) | Yes |
| Feeding that window into a second zoom | Substituting \(g\)'s approximation as \(f\)'s input (C5) | Yes |
| Two magnifications compounding | The two slopes multiplying (C10) | Yes |
| Each zoom individually can fail (a corner) | If \(g\) is not differentiable at \(a\), or \(f\) not at \(g(a)\), the composed zoom has nothing to compound | Yes |
| "The second zoom just sees a smaller version of the first's window" | The second zoom's *domain* is \(u\)-values near \(b\), not literally a sub-window of the \(x\)-axis picture — a genuinely different axis | **No — named limit** |
| "Zooming twice is like zooming once, only more" | The compound magnification is a **product**, not a sum — two zooms of factor 10 give factor 100, not 20 | **No — named limit, and graded** |

## 14. Abstraction return
1. **Grounded:** the two-zoom picture, resumed from L2's own zoom.
2. **Correspondence:** the composed local-linear model
   \(f(g(a))+f'(g(a))g'(a)h\), with both component slopes and the product
   labelled on screen.
3. **Unfamiliar:** a composite built from two functions with no shared
   physical reading (e.g. a purely symbolic \(f,g\)), and the \(g'(a)=0\)
   case, where the second zoom's window has collapsed to a point.
4. **Symbolic:** \((f\circ g)'(a)=f'(g(a))g'(a)\), used to predict the answer
   at \(g'(a)=0\) before computing, and to justify (not just apply) a fresh
   composite's derivative.

Evidence the return happened: the learner predicts \((f\circ g)'(a)=0\) at a
point where \(g'(a)=0\) *before* computing, and explains why using C8, with
no reference to zooming.

---

## Prerequisites, limitations, likely misconceptions

**Prerequisites:** L2 (`derivative-local-linearity`) — hard, specifically C5
(the residual definition) and C9 (the \(1\times1\)-matrix reading). LA
`matrix-composition` (built) — hard, for C10, as the destination of the
forward bridge, not as an ingredient of the proof itself. L1
(`limits-continuity`) — for C7's continuity step. **Not** L3 or L4: no
accumulation or FTC machinery is used; both are forward connections only (L7
reverses this rule via substitution, which needs the FTC to evaluate what
results).

**Limitations / scope:** only the two-function composition
\((f\circ g)'(a)=f'(g(a))g'(a)\) is derived. Implicit differentiation and
related-rates problems (chain-rule applications) are **stated as
applications, not developed** — flagged as such. The multivariable chain
rule (Jacobians) is named as a forward destination (C10, C13) and not
derived. No triple compositions worked symbolically beyond one remark that
the rule iterates.

**Likely misconceptions, each explicitly targeted:**

| # | Misconception | Where it is broken |
| --- | --- | --- |
| M1 | "Cancel the \(du\)'s" is a valid proof. | C4–C7: the identity in C5 never divides by \(\Delta u\); graded by asking what specifically fails in the cancellation argument (`chain-du-cancel-fails`) — the general mechanism, not the \(g'(a)=0\) case, which M3 owns separately. |
| M2 | The chain rule is a new, independent fact to memorize. | C9: the derivation is L2's own model substituted into itself; graded by requiring the derivation reproduced for a fresh pair \(f,g\), not just applied. |
| M3 | \(g'(a)=0\) is a special/exceptional case needing separate handling. | C12: it falls out of C8 directly; graded by a predict-before-compute item. |
| M4 | The rule only concerns numbers multiplying; there is no deeper structure. | C10: the \(1\times1\)-matrix reading, connected forward to real matrix multiplication. |
| M5 | Zooming twice is "the same as" zooming once, only stronger. | §13's named limit: the compound magnification is a **product**, graded by a numeric magnification-factor item. |

---

## Mathematical audit (Audit A)

- **Correct as stated?** Yes. C1–C8 is a complete, standard proof of the
  chain rule that correctly handles \(\Delta u=0\) by substitution rather
  than division — checked independently: the \(k(h)=0\) case makes the last
  term of C6 identically \(0/h=0\) (since \(E_f(0)=0\) by \(E_f\)'s own
  definition, not an added convention), so no case is silently assumed away.
- **Any false simplification?** An earlier draft of C7 asserted
  "\(k(h)\to0\), and \(E_f(k)/k\to0\), therefore \(E_f(k(h))/h\to0\)" — composing
  those two limits alone only gives \(E_f(k(h))/k(h)\to0\), a genuinely
  different (and weaker) statement than what C8 needs; a vanishing-numerator
  argument with no matching factor of \(h\) does not by itself bound
  \(E_f(k(h))/h\). (Concretely: take \(E_f(k)=k^{1.5}\) and \(k(h)=|h|^{0.5}\) —
  both cited hypotheses hold, yet \(E_f(k(h))/h = |h|^{0.75}/h\to\infty\).)
  C7 as written here closes that gap with the missing factor: \(k(h)/h\)
  is **bounded**, in fact convergent to \(g'(a)\), by C2/C4 — differentiability
  of \(g\), not merely its continuity — and a vanishing factor
  (\(E_f(k(h))/k(h)\)) times a bounded one vanishes. The composition-of-limits
  step that remains (\(k(h)\to0\) composed with \(E_f(k)/k\to0\)) is stated
  conceptually rather than with full \(\varepsilon\)-\(\delta\) bookkeeping, at
  the same level of formality L2 itself uses for \(E(h)/h\to0\) — that
  narrower step is the genuine scoping choice; the algebraic factor is not
  optional and is not omitted.
- **Degenerate cases handled?** \(g'(a)=0\) (C12, falls out directly);
  \(g\) non-differentiable at \(a\) (no C2, so no chain rule — named, not
  worked); \(f\) non-differentiable at \(g(a)\) (symmetric, named).
- **Does the insight survive generalization?** Yes, and it is the reason C10
  is included: the exact same substitution argument (C5), run with
  matrix-valued \(f'(g(a))\) and \(g'(a)\), *is* the multivariable chain
  rule — nothing about C1–C9 is specific to one dimension except the
  \(1\times1\) matrix shape.
- **Anything asserted but not derived?** Implicit differentiation and
  related rates are named as applications and explicitly flagged as not
  derived — they are direct uses of C8, not new content.

## Grounding & model-change audit (Audit B)

- **Does the bridge change the intelligible goal?** Yes. "Apply the chain
  rule" becomes "substitute one local-linear model into the other and see
  what compounds."
- **Is the bridge decorative?** No — the two-zoom picture is the operational
  content of C5's substitution, not an illustration added after the fact; it
  reuses L2's own grounded zoom rather than introducing a new one.
- **Are the analogy limits named?** Yes, two, including the important one:
  compounding magnification is multiplicative, not additive — the exact
  point M5 targets.
- **Does the learner return to the abstraction?** Yes — §14 step 4, evidenced
  by the predict-before-compute item at \(g'(a)=0\).
- **Is the model change observable?** Yes: before, a learner can only apply a
  memorized rule and cannot say what licenses it; after, they can derive the
  rule for a fresh pair \(f,g\) and predict its value at \(g'(a)=0\) without
  computing.

---

## Review signoff

- [x] One primary insight selected; role of each supporting package recorded.
- [x] Causal chain complete, with the L1 and L2 dependencies cited at the
      exact steps that need them (C2, C3, C7).
- [x] Minimal formal derivation present, exact, and hand-checkable —
      corroborated by an independent direct-expansion computation.
- [x] Equivalence to the standard definition stated.
- [x] Cost stated honestly; the composition-of-limits step's level of
      formality named explicitly rather than silently assumed rigorous.
- [x] Transfer item specified, unfamiliar, and folds in method selection (D8).
- [x] Bridge, correspondences, discarded elements, abstraction return
      recorded.
- [x] Audit A and Audit B complete; the one genuine scoping choice (level of
      formality for the composed-limits step) named rather than hidden.
- [x] Misconception list targeted. M1, M2, M3, M5 each carry a grading
      obligation; M4 (the \(1\times1\)-matrix reading) is addressed by C10 as
      a stated forward connection, not by a dedicated graded item — recorded
      as such in [lesson-plan.md](lesson-plan.md#insight-traceability)
      rather than claimed as graded.
- [x] Spine's inherited hypothesis (P2, "rates multiply / matrix
      composition") treated as competing, not assumed — see
      [insight-brief.md §1d](insight-brief.md#1d-ranking) for why it placed
      third rather than first.
- [x] **Reviewer independence, recorded honestly.** Author and the two audits
      below: same agent lineage — self-review, not independent. One
      independent review has since run and found a real gap in C7 that the
      self-certified Audit A had missed and certified clean; the fix is
      reflected above. That review is not a substitute for a domain-owner's
      sign-off, which remains outstanding.

## Gate result

**Gate result: PASS**
