# Lesson Plan — Subspaces, Column Space, Null Space, Rank (L8)

Stage 3, from [templates/lesson-plan.md](../../../../authoring/templates/lesson-plan.md).
Consumes [insight.md](insight.md) (`PASS`) and [mastery-contract.md](mastery-contract.md).

## Approved insight (gate)

- [x] `Gate result: PASS` confirmed — [insight.md](insight.md)
- Exact primary insight — **verbatim, planning metadata only**:

  > *(Amended 2026-07-25 — see [insight.md](insight.md) amendment note: the
  > original "exactly two subspaces" was rescoped to the two that govern
  > solvability.)*
  >
  > Every question you have asked about a matrix since Lesson 3 was a question
  > about one of the two subspaces that govern solvability, and they live in
  > different spaces: the **column space** inside the output space is everything
  > the map can produce, so it decides *existence*; the **null space** inside the
  > input space is everything the map crushes to zero, so it decides *uniqueness*.
  > In the plane those spaces could only be "everything" or "a line", so collapse
  > looked binary; in three dimensions it becomes a count — the **rank**, the
  > number of dimensions that survive, readable off the pivots, with a basis taken
  > from the columns of \(A\) itself and not of its reduced form. Invertibility and
  > \(\det\ne0\) are then just the extreme case: rank is as large as it can be.

- Learner-facing phrasing: *"Two of a map's spaces settle solvability: what it can
  reach, and what it destroys. Rank counts what survived."*
- Obstacle: missing purpose + missing structure.
- Mechanisms: predictive reorganization + structural compression + representational change.
- Grounded (representational/operational, no story) — bridge, limits and
  abstraction return in [insight.md §12–14](insight.md).

## Route / ids
- Route: `/lesson/subspaces-rank`
- `guidedSceneId`: `subspaces-rank`
- `explorationId`: `subspaces-rank`

## Motivating question
> Since Lesson 3 you have asked exactly two questions of every system — can it be
> solved, and is the answer unique. Why always those two, and never a third?

## Shared examples
- **Main (new, 3×3):** `rank-two-3d` \(= \begin{bmatrix}1&0&2\\0&1&3\\1&1&5\end{bmatrix}\)
  — row 3 = row 1 + row 2, so rank 2: the cube flattens onto a plane and one line
  of inputs dies. (Already used by the L7 determinant property tests, so the two
  lessons share a number.)
- **Rank-1 contrast:** `rank-one-3d` \(=\begin{bmatrix}1&2&3\\2&4&6\\3&6&9\end{bmatrix}\)
  — image is a line, null space is a plane.
- **Continuity (2D):** `singular-collapse` — the degenerate corner the learner
  already knows from L2/L6/L7.
- **Fresh (practice only):** a different rank-2 and a different rank-1 \(3\times3\),
  plus a \(2\times3\) map so "different spaces" is exercised, not just stated.

## Guided-scene outline (Watch) — `subspaces-rank`

Two labelled panels, side by side, drawn under a **stated isometric projection**.
Left = input space \(\mathbb{R}^3\); right = output space \(\mathbb{R}^3\).
Persistent objects: the unit cube (left), its image (right), the null line (left),
the image plane (right). Created once; only ever moved or revealed.

| Step id | Name | Idea revealed |
| --- | --- | --- |
| `two-panels` | Two spaces, not one | inputs live on the left, outputs on the right; the map is the arrow between panels |
| `reach` | What the map can reach | sweep inputs; the outputs sweep out a plane, not the whole space |
| `colspace` | Name it: the column space | the swept plane is the span of the columns — everything reachable |
| `crush` | What the map destroys | one input line collapses to the single point \(\mathbf{0}\) on the right |
| `nullspace` | Name it: the null space | that line is \(\operatorname{Null}(A)\), and it lives on the **left** |
| `count` | Rank counts what survived | 3 in, 2 out: rank 2 |
| `rank-one` | Take away one more | switch to the rank-1 map — image becomes a line, null space becomes a plane |

- **Dimming plan:** at `colspace`, the left panel dims so the swept plane reads;
  at `nullspace`, the right panel dims and the crushed line brightens.
- **Honest labelling:** the projection is named on-canvas ("isometric view"); the
  null line is *not* drawn perpendicular to the image plane (it is not, in general).
- **Snap-then-hold** at every focus beat, so scrubbing lands on a readable frame.

## Checkpoints
1. **Default** (after `nullspace`): *A map sends some nonzero vector to zero. Which
   of the two questions does that answer, and which does it leave open?*
2. **`shape-from-rank`** (after `count`): *A \(3\times3\) map has 2 pivots. What
   shape is the image of the unit cube, and how big is the null space?*

## Interactive controls (Explore) — `subspaces-rank`
- **Controls:** a preset picker over rank 3 / 2 / 1 / 0 maps, plus editable third
  row so the learner can *make* a matrix singular themselves.
- **Readouts:** rank; the pivot column indices; a basis of \(\operatorname{Col}(A)\)
  **printed from \(A\)'s columns**; a basis of \(\operatorname{Null}(A)\); the image
  shape in words; and the count `rank + nullity = 3` displayed as an identity
  (foreshadowing L9 without proving it).
- **Progressive disclosure:** the two bases are behind "Show the bases".
- **Reset:** back to the rank-2 main example.

## Exercises (Practice)
| # | Id | Tier | Type | Point |
| --- | --- | --- | --- | --- |
| 1 | `rank-which-space` | check | MC | which space decides existence |
| 2 | `rank-where-it-lives` | check | MC | for a \(2\times3\) map, which \(\mathbb{R}^k\) holds each space |
| 3 | `rank-count-fresh` | drill | numeric | rank of a fresh \(3\times3\) |
| 4 | `rank-colspace-basis-fresh` | drill | `matrix-entry` | the basis **from \(A\)**, entered as a \(3\times2\) |
| 5 | `rank-image-shape` | drill | MC | pivot count → image shape |
| 6 | `rank-null-witness` | drill | `construct-in-explorer` | any nonzero null vector (2D, predicate-graded) |
| 7 | `rank-opposite-directions` | transfer | `exercise-sequence` | rank ↓ ⇒ nullity ↑ on a fresh rank-1 map |
| 8 | `rank-basis-trap` | transfer | MC | the reduced matrix's columns are **not** a basis of \(\operatorname{Col}(A)\) |
| 9 | `rank-restate-invertibility` | transfer | MC | invertible ⟺ \(\det\ne0\) ⟺ rank maximal |
| 10 | `rank-prove-subspace` | transfer | `self-check` | construct the subspace proof (unscored) |

## Insight traceability

| Contract obligation | Location | Evidence |
| --- | --- | --- |
| §6a Col(A) = reachable outputs = span of columns | section `reach`, scene `reach`/`colspace` | `rank-which-space` |
| §6b Null(A) as a property of the map | section `crush`, scene `crush`/`nullspace` | `rank-null-witness` |
| §6c both are subspaces; flat through the origin | formal `def-subspace`, `prop-both-subspaces` | `rank-prove-subspace` |
| §6d they live in different spaces | section `two-spaces`, scene `two-panels`, callout `same-space` | `rank-where-it-lives` |
| §6e collapse has degrees | scene `count`/`rank-one`, section `count` | `rank-image-shape` |
| §6f rank = pivot count; basis from \(A\) | formal `prop-pivot-basis`, worked `wex-both-bases`, callout `basis-from-reduced` | `rank-colspace-basis-fresh`, `rank-basis-trap` |
| §6g free variables count the null space | worked `wex-both-bases` | `rank-opposite-directions` |
| §6h old results as special cases | formal `thm-rank-criterion` | `rank-restate-invertibility` |
| §6i forward edge to eigenspaces | `looking-ahead` layer | — (L11 discharges) |

## Key takeaway
> Two of a map's subspaces settle solvability: the column space, in the output
> space, holding everything it can reach (existence); and the null space, in the
> input space, holding everything it crushes (uniqueness). Rank counts the
> surviving dimensions, and invertibility is just rank at its maximum.

## Edge cases
rank 3 / 2 / 1 / 0; the \(2\times3\) non-square case; the \(\mathbb{R}^2\)
degenerate corner; a matrix whose *reduced* columns differ from a valid
column-space basis (the trap).

## Mathematical invariants to assert
- [x] every column-space basis vector is literally a column of \(A\)
- [x] the column-space basis is independent and has size = rank
- [x] every null-basis vector satisfies \(A\mathbf v = \mathbf 0\), and the basis is independent
- [x] rank + nullity = n across the battery (observed here; proved in L9)
- [x] rank is unchanged by row operations, while the column space itself **is** changed
- [x] asymmetric and non-square matrices covered

## Required tests
- [x] `src/math/__tests__/subspaces.test.ts` (the invariants above)
- [x] lesson wiring + content validation
- [x] explorer component test (readouts, presets, bases, reset)
- [x] e2e (`e2e/lesson-subspaces-rank.spec.ts`) at desktop and narrow viewport
