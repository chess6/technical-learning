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
| Execute parts after selecting which factor to differentiate | E2 | `sp-parts-fresh` (math-expression, antiderivative-of) | Follows the `x·cos x` setup immediately; reproduction, not transfer |
| Execute the hidden-`v'` case | E2 | `sp-ln-parts` (math-expression, antiderivative-of) | The complete `∫ln x dx` solution appeared earlier |
| Recognize a cyclic parts recurrence, close it algebraically, and reproduce the antiderivative | E2 | `sp-cyclic` + `sp-cyclic-produce` | The complete recurrence and solution appeared earlier; both items reproduce that taught structure |
| Classify a mixed set chain/product/neither | E2 | `sp-classify` (exercise-sequence, methodSelection) | All three structures were taught or revealed; includes the honest `neither` |
| Distinguish existence from elementarity | E2 | `sp-exists-elementary` (multiple-choice) | Liouville cited, not proved |

**Practice event, no evidence claim:** `sp-derive-parts` (self-check) —
reproduce the parts derivation from the product rule + FTC. Self-marked;
ADR-004 bars E4+ claims on self-marked scoring; deliberately absent from the
assessment manifest (a conformance test holds the absence).

**No E4/E5/E6 anywhere.** The strongest captured evidence is E3 scaffolded
method selection. A produced expression field can support E4 in principle,
but these production prompts repeat or immediately follow their taught cases.

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

## 4. Freshness accounting

Only `sp-substitute-basic`, `sp-parts-xexp`, and the `sp-choose-u` product are
fresh instances. The first two remain near E2 drills; only `sp-choose-u`
captures E3 scaffolded method selection. `sp-parts-fresh`, `sp-ln-parts`,
`sp-du-ledger`, `sp-half-constant`, `sp-bounds`, `sp-boundary-meaning`,
`sp-classify`, `sp-cyclic`, `sp-cyclic-produce`, and
`sp-exists-elementary` reuse or immediately reveal taught structures; their
manifest metadata, tiers, and evidence targets say so explicitly. The
committed prediction `sp-witness-predict` deliberately uses the witnessed
opening fixture and is reused too.

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
