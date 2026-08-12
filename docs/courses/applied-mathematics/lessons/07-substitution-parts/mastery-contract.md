# Lesson Mastery Contract — Substitution and Parts (spine L7, `substitution-parts`)

**Gate 5 artifact.** Consumes [insight.md](insight.md), whose audits ran and
whose Gate result is **PASS** (2026-08-10). This contract remains unaccepted
at Gate 8; the owner's blocking package-review findings have been corrected
and await re-review. Planning status and acceptance status are kept separate.

## 1. Objectives (evidence-typed) and their items

Every lesson-owned objective names its item(s); `objectiveCoverage.test.ts`
enforces the mapping mechanically. Evidence levels respect
`CAPABILITY_EVIDENCE_CEILING` (`evidence.ts`); the `math-expression`
capability's ceiling is E4 (predicate-graded open construction).

| Objective | Level | Item(s) | Notes |
| --- | --- | --- | --- |
| Recognize an integrand as a witnessed differentiation's output before any notation | E1 | `sp-witness-predict` (committed-prediction) | commit-before-reveal is recognition; E1 is the ceiling |
| Produce an antiderivative for a fresh chain-shape integrand | E2 | `sp-substitute-basic` (math-expression, antiderivative-of) | Near drill; +C-invariant grading via exact symbolic differentiation |
| State what `du` records (bookkeeping, not cancellation) | E2 | `sp-du-ledger` (multiple-choice) | |
| Handle the constant-adjustment ledger honestly | E2 | `sp-half-constant` (math-expression, antiderivative-of) | Near drill; `x·e^{x²}` needs the ½ |
| Transform bounds under substitution and evaluate | E2 | `sp-bounds` (exercise-sequence: choice + numeric) | Technique named and steps supplied; not unprompted selection |
| Produce a parts antiderivative on the canonical trade | E2 | `sp-parts-xexp` (math-expression, antiderivative-of) | Near drill whose prompt names the trade |
| Identify `[uv]` as the FTC's boundary evaluation | E2 | `sp-boundary-meaning` (multiple-choice) | Theme 1's boundary term |
| Choose which factor to differentiate, with the reason | E3 | `sp-choose-u` (exercise-sequence, methodSelection) | LIATE never taught; the judgment is |
| Execute parts on a fresh integrand | E4 | `sp-parts-fresh` (math-expression, antiderivative-of) | `x·cos x` |
| Execute the hidden-`v'` transfer | E4 | `sp-ln-parts` (math-expression, antiderivative-of) | `∫ln x dx` |
| Recognize a cyclic parts recurrence, close it algebraically, and produce the antiderivative | E4 | `sp-cyclic` + `sp-cyclic-produce` | E3 method selection plus E4 uncued production |
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

`src/math/integrationTechniques.ts` + its regression suite: integrands derived
from declared structure, never re-typed; every display string parsed and
pinned to its closure; `g` monotone on every ledger window (declared +
corroborated); the parts identity numerically corroborated; the grader
(`differentiatesToTarget`) exact-symbolic for acceptance, +C-invariant, with
finite interval probes used only for reject witnesses and `undecided` never
a pass. The capability's `antiderivative-of` mode carries its own
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

**NOT ACCEPTED — nothing below is sign-off.** State as of 2026-08-11:

- Insight contract: audits complete, **Gate result: PASS**.
- This contract: synchronized to the audited insight, including the cyclic
  objective and evidence levels corrected to the actual familiarity/cueing.
- Mode C: built by this session (the implementation session under the
  usage-aware ADR-008 §4). Mechanical verification recorded in the package
  ledger commit messages.
- Owed before any acceptance: all 2026-08-11 blocking package-review findings
  resolved, the corrected package re-reviewed, and CI green.
