# Lesson Plan — Matrix Composition & Inverses (L6)

Stage 3 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md),
filled from [templates/lesson-plan.md](../../../../authoring/templates/lesson-plan.md).
Consumes [insight.md](insight.md) (`PASS`) and [mastery-contract.md](mastery-contract.md);
does not restate them.

## Approved insight (gate)

- Insight Contract: [insight.md](insight.md)
- [x] `Gate result: PASS` confirmed
- Exact primary insight — **verbatim, planning metadata only**:

  > A matrix is nothing but a record of where the basis lands, so "do \(B\), then
  > \(A\)" needs no new definition — only the same question asked once more: column
  > \(j\) of \(AB\) is \(A\) applied to column \(j\) of \(B\). The entry recipe,
  > the failure of \(AB=BA\) in general, and associativity are all consequences of
  > that one identity. Run the question backwards — *which* input lands on
  > \(\mathbf{e}_j\)? — and you get \(A^{-1}\), whose columns are the solutions of
  > \(A\mathbf{x}=\mathbf{e}_j\); those solutions exist and are unique exactly when
  > \(A\)'s columns are independent, i.e. when the map collapsed nothing, which for a
  > \(2\times2\) matrix is the condition \(ad-bc\ne 0\). Because composition is
  > composition of functions, undoing a sequence runs backwards:
  > \((AB)^{-1}=B^{-1}A^{-1}\).

- Learner-facing phrasing: *"A matrix records where the basis lands. So to compose
  two maps, just follow the basis twice — and to undo a map, ask which input landed
  on the basis."*
- Diagnosed cognitive obstacle: missing structure / procedural overload, plus an
  incorrect scalar-arithmetic prior.
- Insight mechanism(s): structural compression + operational grounding +
  representational change.
- Grounded? Yes (operational/representational, no real-world story). Bridge,
  analogy limits, and abstraction return are in [insight.md §12–14](insight.md).

---

## Lesson title
**Matrix Composition & Inverses**

## Route / ids
- Route: `/lesson/matrix-composition`
- `guidedSceneId`: `matrix-composition`
- `explorationId`: `matrix-composition`

## Motivating question
> You shear the plane, then rotate it. Is the result something a single matrix
> could have done — and if so, which four numbers?

## Learning objectives
The mastery contract's [§1d outcomes](mastery-contract.md#1d-outcomes-each-paired-with-evidence)
verbatim in operational form; the lesson's `learningObjectives` array is that list
compressed to one line each.

## Shared examples
- Main example id: `shear-2-1` — \(A=\begin{bmatrix}2&1\\0&1\end{bmatrix}\)
  (used by the guided scene **and** the explorer; the same map L2 sheared and L7
  will measure).
- Supporting: `rotation` \(R=\begin{bmatrix}0&-1\\1&0\end{bmatrix}\) (order
  counterexample); `singular-collapse` \(\begin{bmatrix}2&4\\1&2\end{bmatrix}\)
  (non-invertible); `systems-default` (re-solved with \(A^{-1}\));
  `near-singular` (conditioning caution); `diagnostic-asymmetric` (**tests only**).

Products used, all verified in `src/math/__tests__`:
\(AR=\begin{bmatrix}1&-2\\1&0\end{bmatrix}\), \(RA=\begin{bmatrix}0&-1\\2&1\end{bmatrix}\),
\(A^{-1}=\begin{bmatrix}0.5&-0.5\\0&1\end{bmatrix}\).

## Supporting concepts
- Identity matrix \(I\) as the composition identity (introduced at the "undo" beat,
  because that is where it earns its keep).
- "Singular" as the name for not-invertible.

## Guided-scene outline (Watch) — `matrix-composition`

The tracked objects that persist across the entire scene: the two basis arrows
\(\mathbf{e}_1,\mathbf{e}_2\) (never re-created, only moved) and the shared
opening graphic's outline.

| Step id | Name (learner-facing) | Idea revealed | Notation synced |
| --- | --- | --- | --- |
| `apply-b` | Apply the first map | \(R\) moves the basis and the shape | \(R\mathbf{e}_1,R\mathbf{e}_2\) labelled |
| `apply-a` | Then apply the second | \(A\) moves them again; two-stage path drawn | \(A(R\mathbf{e}_j)\) |
| `one-map` | One map does both | reset, then apply the single matrix \(AR\); it lands identically | \(AR\) matrix appears |
| `columns` | Column \(j\) is where \(\mathbf{e}_j\) ended | the product's columns are the path endpoints | \(\operatorname{col}_j(AR)=A\operatorname{col}_j(R)\) |
| `order` | Swap the order | \(RA\) built the same way; the final shape differs | \(AR\ne RA\) side by side |
| `undo` | Undo it | \(A^{-1}\) applied to the \(A\)-image returns the original outline exactly | \(A^{-1}A=I\) |
| `no-undo` | When there is nothing to undo | singular map: two marked points merge into one; the return is ambiguous | \(\operatorname{Null}(A)\ne\{\mathbf{0}\}\) |

- **Pauses / dimming plan:** at `columns`, everything dims except one basis arrow
  and its path; at `no-undo`, the two pre-images stay lit while their shared image
  pulses, so "which one do I go back to?" is *visible*.
- **Honest labelling of any interpolation:** the \(I\to M\) morphs are labelled as
  a continuous deformation for readability; the mathematics is only ever the
  endpoints. The `no-undo` beat never draws a "reverse" arrow, because there isn't one.
- **Object persistence rule:** the basis arrows and the outline are created once at
  \(t=0\) and only ever moved/recoloured — never removed and re-added — so identity
  is unambiguous under scrubbing.

## Checkpoint (Check understanding)
- **Default checkpoint** (placed after `order`): *Before computing — you shear then
  rotate, and separately rotate then shear. Must the two results agree?*
  Type: prediction/interpretation. Reveal: no, and here is the pair of matrices.
- **Second checkpoint** `undo-impossible` (placed after the singular section):
  *Two different inputs land on the same output. What would an "undo" have to do?*
  Reveal: choose between them — so no function, matrix or otherwise, can exist.

## Interactive controls (Explore) — `matrix-composition`
Initialized from `shear-2-1` and `rotation`.
- **Primary controls:** entries of \(A\) and of \(B\) (four each, clamped
  \([-3,3]\), step \(0.5\)); an **order toggle** \(AB \leftrightarrow BA\); preset
  picker (`shear-2-1`, `rotation`, `reflection`, `singular-collapse`, `near-singular`).
- **Primary readouts:** the product matrix; its two columns highlighted as
  \(A\,\operatorname{col}_j(B)\); an **invertible / singular** badge with the
  \(ad-bc\) value of the *product*; and — when invertible — the inverse matrix.
- **Progressive disclosure:** "Show the other order" and "Show the inverse" are
  toggles, closed by default.
- **Clamp ranges:** entries \([-3,3]\); the singular badge uses a \(10^{-9}\)
  threshold on \(ad-bc\), and the inverse readout is suppressed (not `Infinity`)
  when singular.
- **Reset behavior:** returns to \(A=\)`shear-2-1`, \(B=\)`rotation`, order \(AB\).

## Exercises (Practice)
The contract's [§1d evidence items](mastery-contract.md#1d-outcomes-each-paired-with-evidence),
in route order. All use **fresh** matrices except `comp-solve-with-inverse`.

| # | Id | Tier | Objective | Type | Answer |
| --- | --- | --- | --- | --- | --- |
| 1 | `comp-order-first` | check | which map is applied first | MC | "\(B\), the right-hand one" |
| 2 | `comp-column-meaning` | check | what column \(j\) of \(AB\) *is* | MC | \(A\) applied to \(B\)'s column \(j\) |
| 3 | `comp-column-fresh` | drill | produce \(\operatorname{col}_1(AB)\) | vector | computed in `src/math` |
| 4 | `comp-product-entries-fresh` | drill | produce all four entries of \(AB\) | `matrix-entry` | computed in `src/math` |
| 5 | `comp-build-inverse-fresh` | drill | build \(A^{-1}\) column by column, then verify | `exercise-sequence` | two vectors + verification entry |
| 6 | `comp-solve-with-inverse` | drill | solve L3's system as \(A^{-1}\mathbf{b}\) | vector | \((2,-1)\) — L3's answer |
| 7 | `comp-singular-parameter` | drill | make a matrix singular | numeric | the parameter value |
| 8 | `comp-noncommute-and-commute` | transfer | counterexample **and** a commuting matrix | `exercise-sequence` | entries + predicate |
| 9 | `comp-singular-witness` | transfer | exhibit a nonzero null vector of a singular map | `construct-in-explorer` (`vector-on-line`) | any nonzero multiple |
| 10 | `comp-reversal` | transfer | invert a composite in the right order | MC | \(B^{-1}A^{-1}\) |
| 11 | `comp-justify-collapse` | transfer | why no function can undo a collapse | `self-check` | model answer + rubric (unscored) |

## Insight traceability (required)

| Contract obligation | Learner-facing location | Evidence of understanding |
| --- | --- | --- |
| §6a a map is its basis images | section `two-maps` (backward bridge) + scene `apply-b` | learner names \(\operatorname{col}_j\) as \(M\mathbf{e}_j\) (`comp-column-meaning`) |
| §6b–c the composite has a matrix, found by following the basis | scene `apply-a`, `one-map`, `columns`; section `where-basis-lands` | learner produces \(\operatorname{col}_1(AB)\) on a fresh pair (`comp-column-fresh`) |
| §6d the entry recipe is derived | section `recipe` + formal `def-product` | learner produces all four entries unaided (`comp-product-entries-fresh`) |
| §6e order matters, **in general** | scene `order`, section `order`, checkpoint 1, callout `apply-b-first` | learner supplies a counterexample **and** a commuting matrix (`comp-noncommute-and-commute`) |
| §6f–g associativity and \(I\) | formal `prop-algebra` (revealed derivation) | used inside the reversal proof; MC (`comp-reversal`) |
| §6h inverse = preimages of the basis | section `undo`, scene `undo`, worked `wex-inverse` | learner builds \(A^{-1}\) column by column (`comp-build-inverse-fresh`) |
| §6i invertible ⟺ nothing collapsed | section `when-undo-fails`, scene `no-undo`, checkpoint 2, formal `thm-invertibility` | learner exhibits a null vector (`comp-singular-witness`) and finds the singular parameter (`comp-singular-parameter`) |
| §6j \(ad-bc\) as the detector, deferred meaning | formal `thm-invertibility` + `looking-ahead` layer | `comp-singular-parameter`; the layer explicitly withholds area/orientation |
| §6k reversal | formal `prop-reversal` (two-line proof), callout `inverse-of-product` | `comp-reversal` |
| §6l purpose + honesty caveat | section `undo` + `trap` layer | `comp-solve-with-inverse` reconciles with L4 and the caveat is stated in its explanation |
| §14 abstraction return | worked `wex-inverse` ends in symbols; explorer readouts are symbolic | learner verifies \(AA^{-1}=I\) symbolically after the picture |

## Key takeaway (Summarize)
> Composition is the columns rule applied twice — column \(j\) of \(AB\) is \(A\)
> applied to \(B\)'s column \(j\) — so \(AB\) means "do \(B\) first", order matters
> in general, and \(A^{-1}\) is the map that sends the basis back, which exists
> exactly when \(A\) collapsed nothing.

## Notation
- \(\operatorname{col}_j(M)=M\mathbf{e}_j\); \(I\); \(A^{-1}\); \(\operatorname{Null}(A)\).
- \(AB\) = apply \(B\) first. Stated in prose, in the scene caption, and in a callout.
- KaTeX for the main statements: `\operatorname{col}_j(AB) = A\,\operatorname{col}_j(B)`,
  `A^{-1} = \frac{1}{ad-bc}\begin{bmatrix} d & -b \\ -c & a\end{bmatrix}`,
  `(AB)^{-1} = B^{-1}A^{-1}`.

## Edge cases
- \(ad-bc=0\) → no inverse; explorer suppresses the readout rather than showing `Infinity`.
- \(A=\mathbf{0}\) → singular; covered by the criterion's converse and by tests.
- near-singular → invertible with large entries; named as a caution.
- commuting pairs → the "order matters" claim is scoped, not overgeneralized.

## Mathematical invariants to assert
- [x] \((AB)\mathbf{x} = A(B\mathbf{x})\) for random \(A,B,\mathbf{x}\)
- [x] \(\operatorname{col}_j(AB) = A\,\operatorname{col}_j(B)\)
- [x] \(AA^{-1} = A^{-1}A = I\) when invertible
- [x] `inverse2x2` returns `null` exactly when \(ad-bc = 0\)
- [x] closed-form inverse agrees with the solve-two-systems construction
- [x] \((AB)^{-1} = B^{-1}A^{-1}\)
- [x] asymmetric matrix covered (packing/transpose guard)
- [x] scene-drawn composite equals `matrixMatrixMultiply(A, B)` (scene build-time assert)

## Required tests
- [x] Unit tests for `inverse2x2` / composition helpers (`src/math/__tests__/matrixComposition.test.ts`)
- [x] Invariant/property tests (list above)
- [x] Lesson wiring + content validation (registry, scene, explorer, route ids)
- [x] Explorer component test (readouts, order toggle, singular badge, reset)
- [x] Browser/e2e test (`e2e/lesson-matrix-composition.spec.ts`)
- [x] Asymmetric + singular matrices included

## Acceptance checklist
- [x] Approved Insight Contract linked and `PASS`; exact insight verbatim above
- [x] Insight traceability table complete
- [x] Intentional `route` composed from the palette; Watch precedes Explore
- [x] Headings + ToC content-specific, never generic phase names
- [x] Guided-to-interactive continuity (same \(A\), \(R\), notation, roles)
- [x] Progressive disclosure applied in the explorer
- [x] KaTeX + \(\mathbf{e}_1,\mathbf{e}_2\) notation consistent
- [x] Accessibility preserved (labels, focus, readouts, reduced-motion)
- [x] Diagrams labelled, unclipped, safe frame intact
- [x] [lesson-correctness-checklist](../../../../quality/lesson-correctness-checklist.md) completed
- [x] All tests pass
