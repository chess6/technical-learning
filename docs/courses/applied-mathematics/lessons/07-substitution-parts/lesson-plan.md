# Lesson Plan — Substitution and Parts (spine L7, `substitution-parts`)

Consumes [insight.md](insight.md) (Gate result: **PASS**, 2026-08-10, after
the seven audited repairs recorded there) and
[mastery-contract.md](mastery-contract.md). Built the same day under the
owner's speed directive; the concurrent-with-audit sequencing deviation is
recorded in both documents.

## Route (as built — `src/lessons/substitutionParts.ts`)

motivate → witnessed-manufacture → thm-substitution (+ **proof**) → ledger
section → **explore** (`substitution-ledger`) → def-reversed-bounds (audit
item 2: this lesson owns the convention) → bounds section → worked
(substitution) → parts section → **lemma-product-rule (+ proof)** (audit
item 1: derived from L2's local model, since no built surface ever stated
it) → thm-parts (+ **proof**, with additivity introduced at the Riemann-sum
level — audit item 6) → choosing-u (incl. the cyclic recurrence — audit
item 4) → worked (parts) → du callout → honest-failure section →
exists-vs-elementary callout → practice (15 items) → summary.

**No guided scene** (constitution principle 7; media decision in the
mastery contract §3). No scene surfaces registered.

## Verification (all run at build, 2026-08-10)

- `src/math/__tests__/integrationTechniques.test.ts` — 20 tests (identities,
  exact strip tiling, the +C-invariant grader, guard).
- `mathExpressionGradingContract.test.ts` — 55 incl. the `antiderivative-of`
  battery and the parse-failure no-leak pin (rendered-review finding).
- `substitutionPartsGradingContract.test.ts` — 77: a battery per auto-graded
  item, tier-mix pin (1 check + 6 drill + 7 transfer evidence + 1 practice
  event), manifest-coverage and freshness-disjointness pins.
- Full unit suite 159 files / 2694 green · `tsc -b` clean · oxlint 0 errors.
- `e2e/lesson-substitution-parts.spec.ts` — 5 real-browser tests (proof
  blocks render; ledger panels + paired strip selection; typed antiderivative
  grades correct including a +C member; wrong answer gets the witness
  message; mid-typing parse failure leaks no solution) plus both
  cross-lesson sweeps (22 tests).

## Owed before acceptance

The fresh package reviewer's pass over Package B (adversarial math +
rendered page, per ADR-008 §4), then the mastery contract's §6.
