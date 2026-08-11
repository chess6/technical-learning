# Insight Discovery Brief — Substitution and Parts (spine L7, `substitution-parts`)

**Gate 3 output — DRAFT under ADR-008.** Written 2026-08-10 by the wave-1
planning session. Gate 4 (insight contract with audits) has NOT run; nothing
below is `PASS` yet. Mode C must not begin from this document.

Spine row (M2, `calculus-technique`): after L5 (chain rule) and L6
(optimization), the trunk owes the learner the two rewriting moves that make
integrals computable. Benchmark bar (M2): techniques **derived** from the
chain and product rules; parts recognized as Theme 1's boundary term.

## 1a. Diagnose the cognitive obstacle

Differentiation is an **algorithm**: rules applied forward terminate on every
elementary function. Integration is an **inverse problem**: there is no
forward algorithm, only the question *"which differentiation produced this?"*
Learners arrive expecting the first kind of activity and are handed the
second without anyone saying so — so the techniques feel like an arbitrary
bag of tricks, and `u`-substitution in particular degenerates into a
symbol-pushing ritual (`du = g'(x)\,dx` treated as fraction cancellation)
that works without being understood.

The obstacle, precisely: **the learner does not know what kind of problem
they are solving.** Substitution is not an operation performed ON an
integral; it is the *recognition* that the integrand already IS a chain-rule
output, made explicit. Parts is the recognition that the integrand is half of
a product-rule output, plus the honest accounting of the other half — and
that other half is a **boundary term**, the same object Theme 1 has been
tracking since the FTC.

Secondary obstacles, recorded for Gate 5's misconception work rather than as
the insight: `+C` as ritual rather than as "antiderivatives form a family";
the belief that every elementary integrand has an elementary antiderivative
(it does not — `e^{-x^2}` — and saying so honestly is required by the
no-overclaim floor); substitution bounds vs. back-substitution confusion on
definite integrals.

## 1b. Raw leads

1. **Run the chain rule forward first, then reveal the integral.** Compute
   `d/dx sin(x^2) = 2x cos(x^2)` in plain view; then ask for
   `∫ 2x cos(x^2) dx`. The learner has *just watched* the answer being
   manufactured. Substitution introduced as "un-doing a differentiation you
   witnessed" before any `u` notation appears.
2. **`du` as bookkeeping, not cancellation.** The substitution notation is a
   *ledger* for the chain-rule factor `g'(x)`; the lesson can show the same
   computation twice — once with explicit chain-rule recognition, once with
   `u`/`du` — and prove they are the same argument, so the notation is
   demystified rather than banned.
3. **Parts from the product rule + FTC, two lines:** `(uv)' = u'v + uv'` ⇒
   integrate both sides over `[a,b]` (FTC, L4) ⇒ `[uv]_a^b = ∫u'v + ∫uv'`.
   The `[uv]` term IS Theme 1's boundary effect: what accumulated inside
   shows up as a difference at the edge. This meets the benchmark bar
   verbatim and reuses L4's exact machinery — nothing new is assumed.
4. **Method selection as the graded skill.** Given a fresh integrand, the
   real competence is *choosing*: is this a chain-rule shape (substitute), a
   product of unrelated factors (parts), or neither (leave it — honestly)?
   This is the `methodSelection: true` item shape the repo already grades,
   and M2's bar names it explicitly.
5. **The failure case as first-class content.** `∫ e^{-x^2} dx` — the
   recognition search *fails*, provably, and the lesson says so. Sets up
   improper integrals (L8) and, much later, why the Gaussian needed its own
   theory. Honest-limits principle applied to technique.

## 1c. Conventional vs. alternative presentation

**Conventional:** state the `u`-substitution recipe; drill pattern-matching;
state the parts formula `∫u dv = uv − ∫v du`; drill LIATE. The recipe works
but manufactures exactly the bag-of-tricks belief diagnosed above, and LIATE
in particular substitutes a mnemonic for the method-selection judgment M2's
bar requires the learner to own.

**Alternative (selected direction):** both techniques *derived on screen*
from the differentiation rules the learner has already mastered (L5's chain
rule; the product rule is an entry assumption), with the FTC as the bridge —
so "technique" is reframed as **running a known machine in reverse**, and
the integral table becomes a set of recognitions rather than incantations.
LIATE is deliberately not taught; choosing `u` is taught as "which factor
gets simpler when differentiated," which is the actual content LIATE
approximates.

## 1d. Ranking (provisional, for Gate 4 to confirm or refute)

Selected insight candidate: **"Integration techniques are not new operations.
Each is a differentiation rule read backwards: substitution is the chain rule
recognized in an integrand, and parts is the product rule integrated — its
extra term is the boundary term the FTC has been producing since L4. The
skill being trained is recognition and honest bookkeeping, not a new kind of
calculation."**

Why it survives the obvious attacks: it is falsifiable lesson-by-lesson (every
worked example must actually exhibit the forward rule it reverses); it
determines the media (equation sequences and a recognition-training explorer,
NOT a geometry-first scene — there is no natural geometric object here, and
constitution principle 2 forbids inventing one for coverage); and it gives
the exercises their evidence shape (method-selection items + free-production
antiderivatives, for which the new `math-expression` capability's
value-equivalence grading is exactly right — with its form-sensitivity
boundary respected: "find an antiderivative" is value-gradable [up to the
constant — Gate 5 must resolve how +C is handled by the grader], "rewrite
using substitution u = …" is not).

## 1e. Continuity and scope decisions

- **Reuses:** L5's chain-rule fixtures and its `E_f` error language where
  relevant; L4's FTC statement verbatim for the parts derivation; the
  product rule as a declared entry assumption (it is in §2.1 of the spine).
- **Withholds:** trig-substitution and partial fractions (they are M2
  depth-bar *extensions*, and the benchmark's P1 bar does not require them —
  Gate 4 must confirm against `benchmark-matrix.md` §2 before this is final);
  any claim that recognition always succeeds.
- **Forward edges:** L8 `improper-integrals` (the failure case + parts'
  boundary term at infinity); M7's Laplace derivative rule, which IS
  integration by parts — the spine's §6.2 names this and the lesson should
  plant the pointer without teaching it.
- **Evidence note for Gate 5:** an antiderivative item graded by
  `math-expression` compares VALUES; two antiderivatives differing by a
  constant are value-different. Gate 5 must either grade the derivative of
  the learner's answer against the integrand (the clean fix, and itself a
  pedagogically honest move — "check by differentiating" is the lesson's own
  discipline) or restrict expected forms. Do not resolve this silently.
