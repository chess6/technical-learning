# Lesson Mastery Contract — Substitution and Parts (spine L7, `substitution-parts`)

**Gate 5 artifact — DRAFT.** Consumes [insight.md](insight.md), whose Gate
result is **NOT YET PASS** (its adversarial audit is in flight; the owner's
speed directive of 2026-08-10 authorized building concurrently with the audit
— a *documented* sequencing deviation, recorded again in §6). If the audit
returns blocking findings, this contract and the built lesson are repaired
before any acceptance language appears anywhere.

## 1. Objectives (evidence-typed) and their items

Every lesson-owned objective names its item(s); `objectiveCoverage.test.ts`
enforces the mapping mechanically. Evidence levels respect
`CAPABILITY_EVIDENCE_CEILING` (`evidence.ts`); the `math-expression`
capability's ceiling is E4 (predicate-graded open construction).

| Objective | Level | Item(s) | Notes |
| --- | --- | --- | --- |
| Recognize an integrand as a witnessed differentiation's output before any notation | E1 | `sp-witness-predict` (committed-prediction) | commit-before-reveal is recognition; E1 is the ceiling |
| Produce an antiderivative for a fresh chain-shape integrand | E4 | `sp-substitute-basic` (math-expression, antiderivative-of) | +C-invariant grading via check-by-differentiating |
| State what `du` records (bookkeeping, not cancellation) | E2 | `sp-du-ledger` (multiple-choice) | |
| Handle the constant-adjustment ledger honestly | E4 | `sp-half-constant` (math-expression, antiderivative-of) | `x·e^{x²}` needs the ½ |
| Transform bounds under substitution and evaluate | E3 | `sp-bounds` (exercise-sequence: choice + numeric) | bounds 0→1 under u = x²; value sin 1 |
| Produce a parts antiderivative on the canonical trade | E4 | `sp-parts-xexp` (math-expression, antiderivative-of) | |
| Identify `[uv]` as the FTC's boundary evaluation | E2 | `sp-boundary-meaning` (multiple-choice) | Theme 1's boundary term |
| Choose which factor to differentiate, with the reason | E3 | `sp-choose-u` (exercise-sequence, methodSelection) | LIATE never taught; the judgment is |
| Execute parts on a fresh integrand | E4 | `sp-parts-fresh` (math-expression, antiderivative-of) | `x·cos x` |
| Execute the hidden-`v'` transfer | E4 | `sp-ln-parts` (math-expression, antiderivative-of) | `∫ln x dx` |
| Classify a fresh integrand chain/product/neither | E3 | `sp-classify` (exercise-sequence, methodSelection) | includes the honest `neither` |
| Distinguish existence from elementarity | E2 | `sp-exists-elementary` (multiple-choice) | Liouville cited, not proved |

**Practice event, no evidence claim:** `sp-derive-parts` (self-check) —
reproduce the parts derivation from the product rule + FTC. Self-marked;
ADR-004 bars E4+ claims on self-marked scoring; deliberately absent from the
assessment manifest (a conformance test holds the absence).

**No E5/E6 anywhere.** The strongest captured object is a produced
antiderivative with no reasoning beside it (E4). Unaided-reconstruction
evidence remains unobtainable in this repository (L6 precedent).

## 2. Correctness obligations (all implemented and tested before this draft)

`src/math/integrationTechniques.ts` + its 20-test suite: integrands derived
from declared structure, never re-typed; every display string parsed and
pinned to its closure; `g` monotone on every ledger window (declared +
corroborated); the parts identity numerically corroborated; the grader
(`differentiatesToTarget`) interval-scoped, +C-invariant, with `undecided`
never a pass. The capability's `antiderivative-of` mode carries its own
authoring guards (model answer must pass its own integrand; exactly one
variable) and a full accept/reject battery
(`mathExpressionGradingContract.test.ts`, 42 tests).

## 3. Media decision

Equation-first: two `proof`-bearing formal blocks (substitution, parts — each
a two-line derivation from an owned rule) and equation-sequence worked
examples. **No guided scene** — the content is symbolic recognition; nothing
changes over time (constitution principle 7), and no scene surfaces are
registered. One explorer: the **substitution ledger** (two panels, exact
image-strip tiling from `stripCorrespondence`), whose picture is restricted
to monotone-`g` fixtures so it never claims more than the identity it
illustrates.

## 4. Freshness rule

Every graded item's integrand is distinct from every taught example's; the
worked examples use `SUB_MAIN_COS`/`PARTS_X_EXP`, the graded production items
use the constant-adjustment, definite, `x·cos x`, and `ln x` cases, and the
classification battery is disjoint from both.

## 5. Retention hook

The parts boundary term is re-encountered at M7's Laplace derivative rule
(edge recorded in `edges.ts`); the `e^{-x²}` thread hands off to L8
explicitly in the closing section.

## 6. Acceptance record (Gate 8)

**NOT ACCEPTED — nothing below is sign-off.** State as of 2026-08-10:

- Insight contract: drafted, **audit in flight**, NOT YET PASS.
- This contract: drafted concurrently with that audit under the owner's
  explicit speed directive — the deviation is recorded here and in the
  header, not silently taken.
- Mode C: built by this session (the implementation session under the
  usage-aware ADR-008 §4). Mechanical verification recorded in the package
  ledger commit messages.
- Owed before any acceptance: the Gate-4 audit's findings resolved; the
  **fresh package reviewer's** adversarial-math + rendered-page pass over the
  whole package; CI green.
