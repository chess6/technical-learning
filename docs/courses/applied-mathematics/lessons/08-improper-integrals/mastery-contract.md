# Lesson Mastery Contract — Accumulating Forever (L8, `improper-integrals`)

## 1a. Placement and upstream links

- **Spine / package:** L8, `calculus-technique` Package B; P2 demanding
  applied profile. No research-bridge overlay.
- **Approved insight:** [insight.md](insight.md), `Gate result: PASS`,
  fresh-audited 2026-08-11. The exact primary remains owned there.
- **Concept ids:** introduces `improper-integral`; reuses `limit`,
  `definite-integral`, `ftc`, and `antiderivative`.
- **Scope status:** Gate 5 PASS, fresh delta-audited at `dbb8cd6` on
  2026-08-11. Mode C is authorized; nothing here is Gate-8 acceptance.

## 1b. Role, bridge, and need

- **Role:** close the calculus-technique package by separating existence of a
  total from availability of an elementary antiderivative, and supply honest
  convergence notation for later transforms.
- **Retrieve:** L1 threshold/tolerance limits; L3/L4 proper-integral continuity
  and finite-interval hypotheses; L4 accumulation functions and FTC; L7
  substitution, parts, boundary evaluation, and cited Gaussian
  non-elementarity.
- **Bridge:** L7 found a continuous function whose antiderivative is not
  elementary; L8 asks whether its total over an unbounded interval can still
  exist.
- **Need:** the learner's fluent FTC ritual reports a negative value for the
  positive integrand \(x^{-2}\) across its singularity. What license was
  missing, and what does the infinity notation actually claim?

## 1c. Coverage core

### Definitions and objects

- \(\lim_{R\to\infty}A(R)=L\), in threshold/tolerance form.
- Type I improper integral as
  \(\lim_{R\to\infty}\int_a^R f\).
- Type II at a bad left edge, bad right edge, and interior singularity; an
  interior singularity requires two independent one-sided limits.
- \(\int_{-\infty}^{\infty}f\) as two independently convergent one-sided
  integrals, never a privileged symmetric route.
- Converges, diverges-unbounded, and diverges-oscillates as distinct verdicts.
- Tail comparison data: truncation integrability, tail start, inequality
  direction, and the known verdict on the correct comparator.

The lesson's mathematical object is always a finite accumulation \(A(R)\) plus
a declared limit verdict. No production type may model a completed “infinite
integral” object.

### Procedures requiring fluency

1. Replace improper notation by the correct family of finite truncations.
2. Evaluate the \(p\)-family at infinity and at a singular edge, including the
   \(p=1\) knife-edge and the strict logarithm witness.
3. Split at every bad edge and require limits independently.
4. Choose a valid positive tail majorant/minorant, state the inequality in the
   useful direction, and attach the known \(p\)-verdict.
5. Apply parts on \([0,R]\), then check the boundary term's limit.

### Results and justification depth

- **\(p\)-ladder, P2 derivation:** \(\int_1^\infty x^{-p}\) converges iff
  \(p>1\); \(\int_0^1x^{-p}\) converges iff \(p<1\). The octave mechanism and
  finite geometric bound are derived, not assumed.
- **Interval additivity / tail principle, short proof:** union tagged
  partitions, split finite sums, pass to proper-integral limits. It is not
  attributed to L7's integrand linearity.
- **Positive comparison, stated with hypotheses and “why”:** proper
  truncation-integrability and order pass through common tagged partitions;
  the Monotone Accumulation Principle is named supplied completeness
  machinery. Both convergent-majorant and divergent-minorant directions are
  taught. Oscillatory cancellation is excluded.
- **Boundary limit, derivation:** FTC/order twice gives
  \(e^R\ge1+R+R^2/2\), hence \(0\le Re^{-R}\to0\).

### Representations and translations

- Symbolic improper notation ↔ family \(A(R)\) of proper finite integrals.
- Accumulation graph ordinate ↔ exact/numerically corroborated \(A(R)\).
- Octave bar ↔ \(\int_{2^k}^{2^{k+1}}f\), with equal/geometric totals.
- Visual “settling” ↔ the threshold/tolerance sentence; a finite screen is
  never accepted as proof.
- Comparison “trap/race” ↔ a written inequality with all hypotheses and a
  known comparator verdict.

### Examples, nonexamples, and misconception events

- Canonical: \(e^{-x}\), \(1/x\), \(1/x^2\), the two \(p\)-edges,
  \(1/(1+x^2)\), \(e^{-x^2}\), \(xe^{-x}\), \(x^{-2}\) across \(0\), and
  \(x^{-1/2}\) at \(0\).
- Nonexamples: \(\sin x\) (bounded accumulation that never settles);
  \(\int_{-\infty}^{\infty}x\,dx\) (symmetric route is principal value, not
  this integral).
- Elicit → confront → resolve: plug in infinity → scandal → truncation;
  “goes to zero” → \(1/x\) vs \(1/x^2\) → \(p\)-rate; “bounded means
  convergent” → \(\sin x\) → limit must settle; “odd means zero” → route
  dependence → independent one-sided limits.

## 1d. Outcomes paired with evidence

| Operational outcome | Dim. | Owner | Level | Evidence item | Required attainment |
| --- | --- | --- | --- | --- | --- |
| Commit to whether the blind \(-2\) calculation is licensed before the violated hypothesis is revealed | D1/D13 | lesson | E1 | `imp-scandal-predict`, committed prediction | practiced learning event |
| Translate Type I, all Type-II edge cases, and two-sided notation into the required finite-limit families | D2/D4 | lesson | E3 | `imp-definition-edges`, exercise sequence | independently demonstrated |
| Classify both \(p\)-edges and justify the knife-edge using accumulation formulas/octave behavior | D3/D5 | lesson | E3 | `imp-p-ladder`, exercise sequence | independently demonstrated |
| Distinguish convergence, unbounded divergence, and oscillatory divergence without relying on plots | D2/D7 | lesson | E3 | `imp-verdict-classify`, exercise sequence | independently demonstrated |
| Apply both positive comparison directions: construct a convergent \(C/x^p\) majorant and a divergent \(C/x^p\) minorant, state the finite-truncation integrability hypotheses, and inherit the corresponding verdict | D3/D5 | lesson | E3 | `imp-comparison-produce`, `imp-comparison-diverge`, `tail-comparison` | independently demonstrated |
| Refuse a symmetric-only two-sided value and require both one-sided limits | D5/D13 | lesson | E3 | `imp-route-refusal`, exercise sequence | independently demonstrated |
| Check an infinite-edge parts boundary as a limit on fresh \(xe^{-2x}\), after the lesson derives \(xe^{-x}\) | D3/D10 | lesson | E3 | `imp-boundary-limit`, produced vector/text/numeric sequence | independently demonstrated |
| Select among direct truncation, \(p\)-ladder, and comparison on a mixed fresh set | D8/D10 | module | E5 | `mod-calctech-method-mix` | built · not administered in Gate 9 |
| Retrieve convergence reasoning after a delay in the series/transform arc | D12 | module | E5 | Package C spaced item | planned |

No lesson-owned outcome claims E4. The new comparison capture is scaffolded
construction and receives an E3 ceiling; accepting a continuum of answers does
not automatically make the context unfamiliar transfer.

## 1e–1f. Attainment, assessment, and retention

- **Check:** one committed scandal prediction (E1, no mastery claim).
- **Explore:** predict then move \(R\); read \(A(R)\); translate the graph back
  to a threshold statement. Explorer actions are learning events, not evidence.
- **Practice:** seven evidence items above, including fresh finite-limit
  translation, two-edge \(p\)-classification, divergence-mode discrimination,
  both comparison directions, route refusal, and boundary-limit completion.
  The four evidence-honesty repairs are pinned: finite families are typed, the
  three verdict formulas are not the taught \(\ln R\)/\(1-\cos R\) pair, route
  refusal uses \(x^3\) with a produced one-sided coefficient, and the boundary
  item uses fresh \(xe^{-2x}\) with a produced finite identity and squeeze.
- **Module obligations:** mixed L5–L8 method selection, delayed retention, and
  timed surfaces are built in Gate 9 but unadministered; this lesson does not
  borrow those claims. The stronger Package C delayed-reasoning row remains open.
- **Forward retention:** L10 partial sums reuse limit-of-finite-objects; L24
  must re-check transform convergence hypotheses; M7 parts retrieves the
  boundary-limit discipline.

Every auto-graded item must register a `describeGradingContract` battery
and `ITEM_ASSESSMENT_META` entry. Batteries reject blank/partial
objects, correct verdict with wrong limit family, “decays so converges,”
“bounded so converges,” symmetric-so-zero, inverted comparison, a convergent
minorant used to prove convergence, and a divergent majorant used to prove
divergence.

## 1g. Correctness and scope

- Exact closed forms own learner-facing values; Riemann sums only corroborate.
- A Gaussian fixture records convergence by comparison but **no exact value**.
- `singularAccumulation` must preserve orientation at left and right bad
  endpoints and reject epsilon at or beyond the opposite finite endpoint;
  permanent equality/overrun tests cover both orientations.
- `tailInequalityHolds` may return a certain counterexample witness from
  evaluation, but “holds” for learner grading requires an analytic certificate
  over the entire declared tail. Finite samples never pass an answer.
- For the convergence target \(f(x)=1/(x^3+x)\) on \(x\ge1\), the comparison
  capability accepts \(f(x)\le C/x^p\) exactly when \(1<p\le3\) and
  \(C\ge C_{\min}(p)\), where \(C_{\min}=1/2\) for \(1<p\le2\),
  \(C_{\min}=\frac{3-p}{2}(\frac{p-1}{3-p})^{(p-1)/2}\) for
  \(2<p<3\), and \(C_{\min}=1\) for \(p=3\). No finite \(C\) works for
  \(p>3\), and \(p\le1\) does not supply a convergent comparator.
- For the divergence target \(f(x)=x^{-1/2}\) on \(x\ge1\), the capability
  accepts \(C/x^p\le f(x)\) exactly when \(1/2\le p\le1\) and
  \(0<C\le1\).
- Each comparison answer must also state that target and comparator are
  integrable on every finite truncation, identify the comparator's known
  verdict, and draw the directionally valid conclusion. All numeric entries
  must be finite. Open and closed boundary comparisons use the entered
  IEEE-754 values exactly, with no favourable tolerance. A displayed decimal
  below the analytic minimum is rejected with feedback to increase \(C\).
- The capability accepts every valid comparator in those declared \(C/x^p\)
  ranges; valid mathematics outside the declared family is labelled
  unsupported, never wrong.
- Withheld: conditional convergence, limit comparison as a named test,
  principal-value technique, Gamma, integral test for series, and the unowned
  Gaussian value \(\sqrt{\pi}/2\).

**Gate-5 rejection test:** reject the implementation if it creates an
“improper integral” value object, claims a Gaussian value from comparison,
uses sampling for positive grading, handles only one Type-II orientation, or
lets the graph replace the symbolic abstraction return.
