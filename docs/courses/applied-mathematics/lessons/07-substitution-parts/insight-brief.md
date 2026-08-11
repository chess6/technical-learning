# Insight Discovery Brief — Substitution and Parts (spine L7, `substitution-parts`)

**Gate 3 output — DRAFT under ADR-008.** Written 2026-08-10 by the wave-1
planning session. Gate 4 (insight contract with audits) has NOT run; nothing
below is `PASS` yet. Mode C must not begin from this document.

Spine row (M2, `calculus-technique`): after L5 (chain rule) and L6
(optimization), the trunk owes the learner the two rewriting moves that make
integrals computable. Benchmark bar (M2): techniques **derived** from the
chain and product rules; parts recognized as Theme 1's boundary term.

## 1a. Diagnose the cognitive obstacle

Differentiation offers a compact forward rule system for the elementary expressions this course has used. Integration is an inverse-recognition problem: there is no comparably simple differentiation-like rule system guaranteed to produce an elementary antiderivative. More sophisticated symbolic-integration algorithms exist, so the lesson must not claim that integration literally has no forward algorithm. Learners nevertheless meet a real change of task: instead of applying a rule whose shape is visible, they must ask *“which differentiation could have produced this?”* Without that distinction, the techniques feel like an arbitrary bag of tricks, and `u`-substitution degenerates into a symbol-pushing ritual (`du = g'(x)\,dx` treated as fraction cancellation) that works without being understood.

The obstacle, precisely: **the learner does not know what kind of problem
they are solving.** Substitution is not an operation performed ON an
integral; it is the *recognition* that the integrand already IS a chain-rule
output, made explicit. Parts recognizes the integrand as one term in a product-rule output. Solving the integrated product rule for that term produces two distinct pieces: the boundary term \([uv]_a^b\) and the remaining integral. The lesson must keep those roles separate.

Secondary obstacles, recorded for Gate 5's misconception work rather than as
the insight: `+C` as ritual rather than as "antiderivatives form a family";
the belief that every elementary integrand has an elementary antiderivative (`e^{-x^2}` has an antiderivative, but not an elementary one; proving non-elementarity is beyond this lesson); substitution bounds vs. back-substitution confusion on
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
5. **The limit case as first-class content.** For `∫ e^{-x^2} dx`, the taught chain/product-rule recognitions do not produce an elementary formula. The integrand still has antiderivatives; the lesson may state that none is elementary, but it does not attempt the advanced proof. This sets up improper integrals (L8) and the Gaussian’s later special treatment without presenting “method not found” as “antiderivative does not exist.”

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
LIATE is deliberately not taught as an algorithm. “Choose a factor that gets simpler when differentiated” is introduced only as a heuristic, then confronted with a cyclic example such as `∫ e^x sin x dx`, where two integrations by parts return the original integral and algebra closes the cycle. Method selection must include recognizing that recurrence, not merely ranking factors.

## 1d. Ranking (provisional, for Gate 4 to confirm or refute)

Selected insight candidate: **"Integration techniques are not new operations.
Each starts from a differentiation rule read backwards: substitution recognizes a chain-rule output, while parts integrates the product rule and separates a boundary term from a remaining integral. The
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
