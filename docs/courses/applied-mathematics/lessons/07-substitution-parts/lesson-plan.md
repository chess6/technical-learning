# Lesson Plan — Substitution and Parts (spine L7, `substitution-parts`)

Consumes [insight.md](insight.md) (Gate result: **PASS**, 2026-08-10, after
the seven audited repairs recorded there) and
[mastery-contract.md](mastery-contract.md). Built the same day under the
owner's speed directive; the concurrent-with-audit sequencing deviation is
recorded in both documents.

## Route (as built — `src/lessons/substitutionParts.ts`)

motivate → witnessed-manufacture → def-reversed-bounds (audit item 2: this
lesson owns the convention, placed before the theorem that needs it) →
thm-substitution (+ **proof**) → ledger section → **explore**
(`substitution-ledger`) → bounds section → worked
(substitution) → parts section → **lemma-product-rule (+ proof)** (audit
item 1: derived from L2's local model, since no built surface ever stated
it) → thm-parts (+ **proof**, with additivity introduced at the Riemann-sum
level — audit item 6) → choosing-u (incl. the cyclic recurrence — audit
item 4) → worked (parts) → du callout → honest-failure section →
exists-vs-elementary callout → practice (15 items) → summary.

**No guided scene** (constitution principle 7; media decision in the
mastery contract §3). No scene surfaces registered.

## Verification (all run at build, 2026-08-10)

- `src/math/__tests__/integrationTechniques.test.ts` — identities, exact strip
  tiling, exact-symbolic +C-invariant grading, and the hidden-ramp regression.
- `mathExpressionGradingContract.test.ts` — 55 incl. the `antiderivative-of`
  battery and the parse-failure no-leak pin (rendered-review finding).
- `substitutionPartsGradingContract.test.ts` — a battery per auto-graded item,
  hidden-ramp rejection, evidence-level pins, audited theorem ordering and
  provenance, tier mix, manifest coverage, and freshness disjointness.
- Full unit suite 159 files / 2705 green · `tsc -b` clean · oxlint has only pre-existing warnings.
- `e2e/lesson-substitution-parts.spec.ts` — 6 real-browser tests (proof
  blocks render; mouse + keyboard paired-strip selection; typed antiderivative
  grades correct including a +C member; wrong answer gets the witness
  message; mid-typing parse failure leaks no solution) plus both
  cross-lesson sweeps (22 tests).

## Review correction status (2026-08-11)

The fresh package review (adversarial math + rendered page, ADR-008 §4)
returned **REVISE**. Its correction delta adds whole-interval domain
certification before exact grading, accepts interval-valid `ln(abs(x))`,
registers real adversarial batteries for every sequence item, aligns reused
fixtures to E2/drill, restores the substitution proof's endpoint caveat, and
makes the ledger a two-stop roving-tabindex control with working arrow focus.
The focused typecheck and 186 grading/evidence tests are green. The same
reviewer must verify this delta, and the browser correction plus quick tier
must pass, before the mastery contract's §6 can record acceptance.
