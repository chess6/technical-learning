# Lesson Plan — Change of Basis (L10)

Stage 3. Consumes [insight.md](insight.md) (`PASS`) and
[mastery-contract.md](mastery-contract.md).

## Approved insight (gate)
- [x] `Gate result: PASS`
- Exact primary insight — **verbatim, planning metadata only**:

  > A matrix was never the map, and a coordinate list was never the vector: both are
  > **descriptions relative to a basis**, and since Lesson 2 that basis has silently
  > been the standard one. Name the choice and everything follows — the
  > change-of-basis matrix \(P\), whose columns are the new basis vectors written in
  > standard coordinates, converts B-coordinates *into* standard ones (so
  > \([\mathbf{x}]_B = P^{-1}\mathbf{x}\)), and a map's matrix in the new basis is the
  > readable three-step sentence \([A]_B = P^{-1}AP\): translate, act, translate back.
  > The object never moves; only its name changes. So some bases describe a map more
  > simply than others — and in a basis of directions the map merely scales, the
  > description becomes diagonal.

- Learner phrasing: *"The arrow never moves. Only its name changes."*
- Obstacle: misleading notation + an incorrect prior model.
- Mechanisms: predictive reorganization + representational change + operational grounding.

## Route / ids
- Route: `/lesson/change-of-basis`
- `guidedSceneId`: `change-of-basis`
- `explorationId`: `change-of-basis`

## Motivating question
> Lesson 1 said coordinates are a choice. Every matrix since has been written
> without saying which choice was made. Which one was it — and what changes if
> you pick another?

## Shared examples
- **Basis (from L1, unchanged):** \(B = ((1,2),(3,-1))\), so
  \(P = \begin{bmatrix}1&3\\2&-1\end{bmatrix}\).
- **Vectors (from L1):** \(\mathbf{p} = (4,1)\) with \([\mathbf{p}]_B = (1,1)\);
  \(\mathbf{q} = (-1,5)\) with \([\mathbf{q}]_B = (2,-1)\). Reused so the
  arithmetic is familiar and only the *interpretation* is new.
- **Map (L11's matrix):** `eigen-distinct` \(A = \begin{bmatrix}3&1\\0&2\end{bmatrix}\);
  eigenbasis \(((1,0),(-1,1))\) gives \([A]_B = \operatorname{diag}(3,2)\).
- **Denied converse:** \(\begin{bmatrix}1&0\\0&1\end{bmatrix}\) and
  \(\begin{bmatrix}1&1\\0&1\end{bmatrix}\) — equal determinant *and* trace, not similar.
- **Fresh (practice only):** a different basis and a different map.

## Guided-scene outline (Watch) — `change-of-basis`

One arrow, drawn once and **never moved**. The grid beneath it is swapped.

| Step id | Name | Idea revealed |
| --- | --- | --- |
| `one-arrow` | One arrow, one grid | \(\mathbf{p}\) on the standard grid, readout \((4,1)\) |
| `swap-grid` | Swap the grid, not the arrow | the B-grid fades in over the same arrow; the arrow does not move |
| `new-readout` | A different name for the same point | readout becomes \((1,1)\); both are shown together |
| `hidden-subscript` | The subscript that was always there | the old readout is relabelled \([\mathbf{p}]_E\) |
| `map-standard` | A map, described in \(E\) | the plane deforms under \(A\); its matrix shown |
| `map-eigenbasis` | The same deformation, described in \(B\) | identical motion, matrix now diagonal |

- **Persistent objects:** the arrow and the deforming outline are created once.
  The arrow's position signal is *never* written after setup — a scene-level
  guarantee that "the vector does not move" is shown, not merely claimed.
- **Snap-then-hold** at each grid swap.
- **Honest labelling:** the B-grid is drawn non-orthogonal and non-unit on
  purpose, and a caption says so, so orthonormality is never implied.

## Checkpoints
1. **Default** (after `new-readout`): *The readout changed from \((4,1)\) to
   \((1,1)\). What moved?*
2. **`which-direction`** (after `map-standard`): *\(P\)'s columns are the new
   basis vectors written in standard coordinates. So does \(P\) convert B-coords
   to standard, or standard to B-coords? Derive it, don't recall it.*

## Interactive controls (Explore) — `change-of-basis`
- **Controls:** drag/edit the two basis vectors; edit the vector \(\mathbf{x}\);
  preset bases (standard, L1's basis, the eigenbasis, a near-dependent basis).
- **Readouts:** \(P\); \(P^{-1}\); \([\mathbf{x}]_B\); the reconstruction check
  \(P[\mathbf{x}]_B\); \([A]_B\); and the invariants (\(\det\), rank, trace) shown
  side by side for \(A\) and \([A]_B\) so their equality is visible.
- **Degenerate guard:** if the two chosen vectors are dependent they are **not a
  basis** — the explorer says so and suppresses \(P^{-1}\) rather than showing
  `Infinity`.
- **Reset:** back to L1's basis.

## Exercises
| # | Id | Tier | Type | Point |
| --- | --- | --- | --- | --- |
| 1 | `cob-vector-unmoved` | check | MC | what changed when the readout changed |
| 2 | `cob-direction` | check | MC | which way `P` converts, from its columns |
| 3 | `cob-coordinates-fresh` | drill | `exercise-sequence` | `[x]_B` on a fresh basis, then rebuild `x` |
| 4 | `cob-matrix-in-basis-fresh` | drill | `matrix-entry` | `[A]_B = P⁻¹AP` on a fresh basis |
| 5 | `cob-diagonalizes` | drill | `exercise-sequence` | the eigenbasis makes L11's matrix diagonal |
| 6 | `cob-identity-basis` | drill | MC | `B = E` gives `P = I` and changes nothing |
| 7 | `cob-invariants` | transfer | MC | what survives a change of basis |
| 8 | `cob-converse-false` | transfer | MC | equal det **and** trace, yet not similar |
| 9 | `cob-not-orthonormal` | transfer | MC | the basis need not be orthogonal or unit |
| 10 | `cob-derive-similarity` | transfer | `self-check` | derive `[A]_B = P⁻¹AP` (unscored) |

## Insight traceability
| Obligation | Location | Evidence |
| --- | --- | --- |
| §6a coordinates are a solve | section `hidden-choice`, formal `def-coordinates` | `cob-coordinates-fresh` |
| §6b `P`'s direction from its columns | section `direction`, formal `prop-conversion` | `cob-direction` |
| §6c worked on L1's numbers | worked `wex-l1-revisited` | `cob-coordinates-fresh` |
| §6d the similarity derivation | formal `thm-similarity` + `math-note` | `cob-derive-similarity` |
| §6e the sandwich as a sentence | section `sentence` | `cob-matrix-in-basis-fresh` |
| §6f diagonal in the right basis | section `shorter`, scene `map-eigenbasis`, worked `wex-diagonal` | `cob-diagonalizes` |
| §6g what survives | formal `prop-invariants`, callout `equal-det-not-similar` | `cob-invariants`, `cob-converse-false` |
| §6h forward edge | `looking-ahead` layer | L11 discharges |
| §13 limits | callouts `vector-does-not-move`, `wrong-direction`, `must-be-orthonormal` | items 1, 2, 9 |

## Key takeaway
> A matrix is a map's description in a basis, and a coordinate list is a vector's
> name in one. `P`'s columns are the new basis vectors in standard coordinates, so
> `P` converts B-coordinates *to* standard and `[x]_B = P⁻¹x`; a map's matrix
> becomes `[A]_B = P⁻¹AP` — translate, act, translate back. The object never moves.

## Edge cases
`B = E`; a non-orthogonal, non-unit basis (the default); the eigenbasis; a
dependent pair that is not a basis at all; equal-determinant non-similar matrices.

## Mathematical invariants to assert
- [x] `P [x]_B = x` round-trips for random `x` and bases
- [x] `[A]_B [x]_B = [A x]_B` for random `x`
- [x] `det`, rank, nullity and trace invariant under similarity
- [x] the eigenbasis diagonalizes `eigen-distinct`, giving `diag(3, 2)`
- [x] a non-similar pair with equal determinant AND trace exists (converse denied)
- [x] `B = E` ⇒ `P = I` and `[A]_E = A`
- [x] a dependent pair is rejected, not silently inverted

## Required tests
- [x] `src/math/__tests__/changeOfBasis.test.ts`
- [x] lesson wiring + content validation
- [x] explorer component test (both readouts, invariants, degenerate guard, reset)
- [x] e2e at desktop and narrow viewport
