# Module assessment plan (Gate 9) — Calculus Technique

The cumulative assessment for Package B: L5 `chain-rule`, L6
`optimization-approximation`, L7 `substitution-parts`, and L8
`improper-integrals`. It consumes the four lesson mastery contracts and does
not replace their Gate-8 evidence.

> **Status: BUILT, NOT ADMINISTERED — Gate 9 NOT PASSED.** Eleven items are
> registered in three disjoint exam-mode sets and are machinery-verified.
> Synthetic grading tests are not learner evidence. Results remain 0/11, no
> delayed-retention success exists, and no module-mastery or exam-readiness
> claim is licensed.

## Outcomes and ownership

| Outcome | Source | Dim. | Target / built level | Item | Result |
| --- | --- | --- | --- | --- | --- |
| Chain rule as scalar Jacobian and 1×1 matrix composition | L5 | D10 | E5 / E5 human | `mod-calctech-mixed-chain-matrix` | built · not administered |
| Optimize a composite using the chain rule and complete candidate method | L6 | D10 | E5 / E5 human | `mod-calctech-mixed-optimize-composite` | built · not administered |
| Select among direct truncation, the p-ladder, and comparison | L8 | D8/D10 | E5 / E5 human | `mod-calctech-method-mix` | built · not administered |
| Diagnose “integrand tends to zero, therefore the integral converges” | module | D13 | E4 / E4 human | `mod-calctech-diagnose-limit` | built · not administered |
| Retain “du cancellation is notation, not proof” | L5 | D12 | E3 / **E1** recognition | `mod-calctech-retain-du-not-proof` | built · not administered · partial level |
| Retain “stationary is necessary, not sufficient” | L6 | D12 | E3 / **E1** recognition | `mod-calctech-retain-necessary-not-sufficient` | built · not administered · partial level |
| Retain interval-valid antiderivative checking and the +C family | L7 | D12 | E1 | `mod-calctech-retain-antiderivative-check` | built · not administered |
| Retain convergence as a limit of finite accumulations | L8 | D12 | E1 now; Package C E5 remains deferred | `mod-calctech-retain-convergence-limit` | built · not administered · Package C obligation open |
| Perform fresh chain/optimization/improper calculations under time | module | D11 | E3 | `mod-calctech-mock-*` | built · not administered |

The two lesson contracts requesting E3 delayed retention are only partially
discharged: multiple choice measures recognition after a delay and is claimed
at E1. L8's stronger E5 delayed convergence-reasoning obligation remains
explicitly owned by Package C; this module does not silently downgrade or
declare it complete.

## Assessment sets

### `calculus-technique-review` — cumulative and interleaved

Four fresh, human-scored productions:

1. `mod-calctech-mixed-chain-matrix` — decompose a three-map composite,
   produce scalar and 1×1 matrix products, and justify factor order.
2. `mod-calctech-mixed-optimize-composite` — differentiate a positive-inner
   composite, build the complete candidate set, compare values, and separate
   Fermat's necessary condition from EVT existence.
3. `mod-calctech-method-mix` — unprompted route selection across a p-tail,
   an oscillatory tail, and a comparison tail; all decisive hypotheses are
   required. Cue-lint protects the prompt and pins all three methods in the
   post-commitment rubric.
4. `mod-calctech-diagnose-limit` — preserve a valid substitution while
   locating the first invalid convergence inference, repair it with A(R), and
   classify unbounded divergence.

### `calculus-technique-retention` — delayed retrieval

Four recognition items, one per lesson. The platform scheduler remains scoped
to `systems-elimination`, so this set must be administered manually at roughly
+7 and +30 days. Reusing the same form at both delays is an acknowledged limit.

### `calculus-technique-mock` — timed reliability

Three fresh auto-graded items under a 600-second authored limit: a chain-rule
value, an absolute-extrema pair with endpoint checking, and a p-tail value.
The time limit is an uncalibrated design value until real attempts exist.

## Correctness and safeguards

- Every auto item is registered in the central `describeGradingContract`
  harness with one valid answer and adversarial rejects.
- Every item has `ITEM_ASSESSMENT_META`; E5 surfaces are fresh, unscaffolded,
  rubric-versioned, and human-scored.
- Set membership is exact and disjoint; the mock contains no human-scored item.
- Global evidence-ceiling, cue-lint, snapshot, capability, and referential-
  integrity suites govern the module through `MODULE_ITEMS` and `MODULE_SETS`.

## Results and readiness

- Real attempts: **0 / 11**.
- Module-owned outcomes discharged with learner evidence: **0**.
- Delayed retrieval verified: **no**.
- Timed performance verified: **no**.
- Gate 9: **NOT PASSED**.
- Readiness claim: **none**. “Module mastered” requires E3–E5 cumulative
  results plus delayed retrieval; “exam ready” additionally requires real
  timed performance.
