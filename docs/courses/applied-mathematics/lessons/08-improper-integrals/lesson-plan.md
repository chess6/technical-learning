# Lesson Plan — Accumulating Forever (L8, `improper-integrals`)

**Gate 5: PASS (2026-08-11).** A fresh delta audit of immutable commit
`dbb8cd6` cleared Type-I/Type-II/two-sided coverage, both comparison directions
and their finite-truncation hypotheses, and the exact analytic grading regions.
Mode C is authorized; Gate 8 remains open.

## Approved insight

- Contract: [insight.md](insight.md) — `Gate result: PASS` confirmed
  2026-08-11.
- Exact primary insight: “In this course's improper-Riemann setting, the
  infinity notation names no completed infinite object; it abbreviates a claim
  that proper finite accumulations settle as their intervals exhaust the
  domain. That claim lives in the tail. For nonnegative tails compared with
  the \(p\)-family, decay rate decides the verdict, and comparison can inherit
  it even when no elementary antiderivative can be written. This supplies the
  notation later transform integrals use; each transform still owes its own
  convergence hypotheses.”
- Learner phrasing: infinity is not an endpoint to plug in; keep every
  accumulation finite and ask whether those values eventually settle.
- Mechanisms: demotion + structural compression + representational shift.
- Bridge limits: the graph ordinate is exact \(A(R)\), but a finite screen
  proves neither a limit nor a rate; “rent/race” adds agency and is discarded.
- Abstraction return: grounded graph → exact correspondence → fresh
  graph-free comparison → full symbolic definitions/hypotheses.

## Title, route, and medium

- **Title:** Accumulating Forever
- **Runtime route:** `/lesson/improper-integrals`
- **Explorer:** `improper-truncation`. A range slider for \(R\) drives the
  accumulation graph and finite integral readout for \(e^{-x}\), \(1/x\),
  \(1/x^2\), and \(\sin x\); preset switch and reset are keyboard-operable.
  This reuses the function/accumulation visual family with new data.
- **No guided scene:** the mathematics is a user-controlled family of finite
  truncations plus symbolic derivations; a fixed animation adds no truthful
  state the slider does not expose.
- **Motivating question:** how can a positive integrand produce \(-2\), and
  what exactly failed?

## Route / block ids

`motivate` scandal → `check` `imp-scandal-predict` →
`hypothesis-repair` → `formal` `def-improper-integral` →
`accumulation-family` → `explore` `improper-truncation` →
`worked` `exp-settles` → `p-confrontation` →
`formal` `thm-p-ladder` (proof) → `octave-mechanism` →
`tail-principle` → `formal` `thm-positive-comparison`
(proof with supplied completeness hinge) → `worked`
`gaussian-redemption` → `type-ii-and-refusal` →
`formal` `def-all-bad-edges` → `oscillatory-failure` →
`boundary-at-infinity` → `worked` `parts-boundary` →
`practice` → `symbolic-return` → `summary`.

Definitions precede every theorem that consumes them. The Gaussian block says
only “converges”; it displays no \(\sqrt{\pi}/2\).

## Objectives and items

The objective/evidence table is exactly
[mastery-contract §1d](mastery-contract.md#1d-outcomes-paired-with-evidence).
Lesson-owned runtime mappings:

| Objective id | Level | Item(s) |
| --- | --- | --- |
| `imp-obj-definition-edges` | E3 | `imp-definition-edges` |
| `imp-obj-p-ladder` | E3 | `imp-p-ladder` |
| `imp-obj-verdicts` | E3 | `imp-verdict-classify` |
| `imp-obj-comparison` | E3 | `imp-comparison-produce`, `imp-comparison-diverge` |
| `imp-obj-refusal` | E3 | `imp-route-refusal` |
| `imp-obj-boundary` | E3 | `imp-boundary-limit` |

`imp-scandal-predict` is an E1 learning event and may support an
objective at E1, never an independent mastery claim.

## Explorer contract

- Presets share `TailFixture` ids with lesson prose and tests.
- Slider: \(R\in[a,R_{\max}]\), native range input with labelled current value;
  Arrow keys work without custom focus trapping.
- Readouts: exact \(A(R)\) when a declared antiderivative owns it; otherwise
  explicitly “numerical corroboration,” never an exact total.
- Plot: finite \(R\) only; no line or point drawn “at infinity.”
- The preset's analytic verdict is displayed only after the learner commits a
  prediction. A graph that appears level at finite \(R\) is captioned as
  evidence to investigate, not proof.
- Reset restores \(R\), preset, and prediction state. Small/mobile viewport
  stacks controls above graph without clipping.

## Practice contract

1. `imp-definition-edges` — sequence: type the finite family (no choices)
   for Type I, bad left edge, bad right edge, interior singularity, and a
   two-sided infinite interval. Use the corresponding one-sided limit at each
   bad endpoint; require both one-sided accumulations for interior and
   two-sided cases. A principal-value answer is an explicit reject.
2. `imp-p-ladder` — sequence: classify fresh \(p\) values at infinity
   and zero, then identify why \(p=1\) is the knife edge.
3. `imp-verdict-classify` — sequence: classify three fresh formula-only
   accumulations as converges / unbounded / oscillates; “bounded” alone fails.
4. `imp-comparison-produce` — `tail-comparison`: for
   \(f(x)=1/(x^3+x)\) on \([1,\infty)\), enter finite \(C,p\), choose
   \(f(x)\le C/x^p\), mark both functions integrable on every finite
   truncation, identify comparator convergence, and conclude target
   convergence. Accept exactly \(1<p\le3\) and \(C\ge C_{\min}(p)\), with
   \(C_{\min}=1/2\) for \(1<p\le2\),
   \(C_{\min}=\frac{3-p}{2}(\frac{p-1}{3-p})^{(p-1)/2}\) for
   \(2<p<3\), and \(C_{\min}=1\) for \(p=3\). No finite \(C\) works for
   \(p>3\).
5. `imp-comparison-diverge` — `tail-comparison`: for
   \(f(x)=x^{-1/2}\) on \([1,\infty)\), enter finite \(C,p\), choose
   \(C/x^p\le f(x)\), mark both functions integrable on every finite
   truncation, identify comparator divergence, and conclude target divergence.
   Accept exactly \(1/2\le p\le1\) and \(0<C\le1\).

   Both comparison graders use exact open/closed tests on the entered IEEE-754
   values with no favourable tolerance. Sampling may return a certain reject
   witness but never a positive certificate. Feedback names the failed
   condition without revealing a valid pair before commitment.
6. `imp-route-refusal` — sequence on the fresh fixture
   \(\int_{-\infty}^{\infty}x^3\,dx\): type “principal value,” produce the
   one-sided coefficient \(1/4\), and classify the unbounded failure.
7. `imp-boundary-limit` — sequence on fresh \(xe^{-2x}\): produce the two
   coefficients in the finite parts boundary, type the FTC/order squeeze, and
   produce total \(1/4\).

Every sequence battery rejects blank, omitted, swapped-kind, and
related-but-wrong partial answers. The new capability registers:

- config validation and renderer;
- exact answer shape and no persistence-schema change;
- `CAPABILITY_EVIDENCE_CEILING["tail-comparison"] = "E3"`;
- grading-contract acceptance of multiple valid exponents/scales;
- adversarial rejection and `undecided`-never-pass tests;
- lesson-prose traversal and assessment-manifest coverage.

## Insight traceability

| Contract obligation | Learner-facing location | Observable evidence |
| --- | --- | --- |
| Scandal / violated proper-integral hypothesis | opening + repair | committed prediction, then `imp-definition-edges` |
| Improper notation demoted to finite accumulations | definition + explorer | translates every edge to a finite-limit family |
| Settling vs creeping | explorer + \(1/x\)/\(1/x^2\) confrontation | classifies formula-only accumulations |
| \(p\)-ladder and geometric mechanism | theorem + octave blocks | fresh two-edge \(p\) sequence |
| Tail principle / interval additivity | proof block | chooses tail-equivalent split in feedback |
| Positive comparison with hypotheses | theorem + Gaussian | produced certified comparator and direction |
| Route refusal / independent sides | definition + counterexample | refuses symmetric-only answer |
| Divergence without infinity | \(\sin x\) block | distinguishes oscillates from unbounded |
| Checked boundary term | parts block | `imp-boundary-limit` |
| Metaphor limits + symbolic return | final no-graph set | inequality and hypotheses required |
| Transform transfer is architectural only | looking-ahead | copy says each transform owes convergence |

## Pure math and fixture plan

Create `src/math/improperIntegrals.ts` and tests:

- `accumulation`, `singularAccumulation` with left/right orientation and strict
  rejection when epsilon equals or overruns the finite interval;
- `pLadderVerdict`, `octaveContribution`, finite geometric bound;
- verdict union distinguishes `unbounded` and `oscillates`;
- convergent fixture values are optional; Gaussian has no value and is owned by
  comparison only;
- `tailInequalityHolds` separates analytic certificates from
  counterexample witnesses and never returns a positive grade from samples;
- display strings parse and agree with closures; declared antiderivatives
  differentiate to integrands on their domains; all analytic fixture claims
  receive exact regression tests; the curved comparison boundary is swept and
  the next representable coefficient below every sampled threshold is rejected.

## Required verification

- Edit time: `npm run typecheck` plus focused math, capability,
  grading-contract, manifest, and explorer tests.
- Browser: lesson console clean; committed scandal; slider/mouse/keyboard;
  finite-\(R\) readouts; comparison accepts three distinct convergent
  majorants and two divergent minorants (including boundary cases), rejects
  inverted direction and missing hypotheses; no Gaussian value displayed.
- Package commit: `./check.sh` (layout/explorer touched, so include the
  targeted browser spec); package approval handoff uses `./check.sh --e2e`.

## Acceptance checklist

- [x] Approved insight linked; exact sentence preserved above.
- [x] Every Gate-4 causal, provenance, analogy-limit, and abstraction-return
  obligation mapped.
- [x] Every lesson-owned outcome has a real E3 item; module claims stay Gate 9.
- [x] New comparison semantics specify multiple valid accepts and adversarial
  rejects before implementation.
- [x] No guided scene; explorer medium and accessibility contract fixed.
- [x] Gaussian value, sampling ceiling, Type-II orientation, and two-sided
  refusal are explicit rejection conditions.
- [x] Mode C implementation and package verification (`./check.sh`; targeted
  Chromium 6/6 after review corrections).
- [x] Fresh package review and Gate 8 — PASS at `d0b604b`; accepted under
  ADR-008, owner retains standing veto (2026-08-11).
