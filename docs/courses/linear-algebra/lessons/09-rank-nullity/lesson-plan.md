# Lesson Plan — Dimension & Rank–Nullity (L9)

Stage 3. Consumes [insight.md](insight.md) (`PASS`) and
[mastery-contract.md](mastery-contract.md).

## Approved insight (gate)
- [x] `Gate result: PASS`
- Exact primary insight — **verbatim, planning metadata only**:

  > The input dimension \(n\) is a budget, and a linear map spends all of it: each
  > input dimension has exactly one fate — it survives into the image, or it
  > collapses into the null space — so \(\operatorname{rank}A+\operatorname{nullity}A=n\)
  > is a conservation law rather than column bookkeeping, and the proof is a
  > one-to-one matching between a basis extension of the null space and a basis of
  > the image. Because the total is fixed, rank and nullity are not two independent
  > measurements but one: fixing either determines the other, which is why the law
  > **forbids** whole classes of maps — nothing from a bigger space to a smaller one
  > is one-to-one, nothing from a smaller space to a bigger one is onto, and only
  > for square maps are one-to-one and onto the same condition.

- Learner phrasing: *"Every input dimension has exactly one fate. The books must balance."*
- Obstacle: missing purpose (the result looks too obvious) + inability to predict.
- Mechanisms: semantic/operational grounding + predictive reorganization + compression.

## Route / ids
- Route: `/lesson/rank-nullity`
- `guidedSceneId`: `rank-nullity`
- `explorationId`: `rank-nullity`

## Motivating question
> Can a map from \(\mathbb{R}^3\) to \(\mathbb{R}^2\) be one-to-one? Answer it
> without trying a single example.

## Shared examples
- **Main:** the L8 rank-2 map \(\begin{bmatrix}1&0&2\\0&1&3\\1&1&5\end{bmatrix}\)
  — deliberate continuity: the learner already watched this one collapse.
- **Wide (the lesson's real content):** \(\begin{bmatrix}1&2&3\\0&1&4\end{bmatrix}\)
  — \(2\times3\): budget 3, ceiling 2, so nullity \(\ge1\) is forced.
- **Tall:** \(\begin{bmatrix}1&2\\3&4\\5&6\end{bmatrix}\) — \(3\times2\): rank
  \(\le2<3\), so it cannot be onto.
- **Defective (forward edge):** \(\begin{bmatrix}3&1\\0&3\end{bmatrix}\) —
  algebraic multiplicity 2, geometric multiplicity \(2-\operatorname{rank}(A-3I)=1\).
- **Fresh (practice only):** a different wide map, a different square rank-1 map.

## Guided-scene outline (Watch) — `rank-nullity`
A **ledger**, not geometry: L8 owned the geometric picture, and repeating it would
teach nothing new. Three input dimensions enter on the left; each is posted to
*survived* or *crushed*; the running total is always \(n\).

| Step id | Name | Idea revealed |
| --- | --- | --- |
| `budget` | Three dimensions go in | \(n\) is a budget, drawn as three tokens |
| `post` | Each one has a fate | tokens move, one at a time, into *survived* / *crushed* |
| `balance` | The books balance | totals shown: 2 + 1 = 3 |
| `degrade` | Spend it differently | the map degenerates; a token moves *across*, total unchanged |
| `ceiling` | A different shape of map | wide \(2\times3\): the *survived* column has only two slots, so at least one token must be crushed |
| `forbidden` | What cannot happen | therefore no \(\mathbb{R}^3\to\mathbb{R}^2\) map is one-to-one — shown as a slot that cannot exist |

- **Persistent objects:** the three tokens, the two columns, the running total.
  Tokens are created once and only ever moved between columns — the conservation
  is *visible as motion*, never as a redraw.
- **Snap-then-hold** at each posting so scrubbing lands on a readable ledger.
- **Honest labelling:** the ledger is a counting device; a caption states that the
  tokens are dimensions, not vectors, and that no *particular* input direction is
  identified as the one that dies.

## Checkpoints
1. **Default** (after `balance`): *A \(4\times4\) map has a 3-dimensional image.
   How many dimensions were crushed, and how do you know without seeing the matrix?*
2. **`ceiling-vs-budget`** (after `ceiling`): *For a \(2\times3\) map, which number
   is the running total of the ledger — 2 or 3? Which one is a ceiling on the
   surviving column?*

## Interactive controls (Explore) — `rank-nullity`
Deliberately built on **non-square** maps, since the square case cannot show the
law's content.
- **Controls:** choose the shape (\(2\times3\), \(3\times2\), \(3\times3\)) and a
  preset within it; edit one row to degrade the map.
- **Readouts:** the ledger (budget \(n\), survived = rank, crushed = nullity,
  total), \(\min(m,n)\) as the ceiling, and two verdicts — *one-to-one?* and
  *onto?* — each with the reason drawn from the counts.
- **Progressive disclosure:** "Why not?" reveals the inequality behind a verdict.
- **Reset:** back to the wide map.

## Exercises
| # | Id | Tier | Type | Point |
| --- | --- | --- | --- | --- |
| 1 | `rn-which-total` | check | MC | the total is \(n\), not \(m\) |
| 2 | `rn-wide-ledger` | check | MC | read the ledger of a \(2\times3\) map |
| 3 | `rn-complete-ledger-fresh` | drill | `exercise-sequence` | nullity from rank on fresh square **and** wide maps |
| 4 | `rn-rank-ceiling` | drill | numeric | max possible rank of a \(3\times5\) map |
| 5 | `rn-eigen-multiplicity` | drill | `exercise-sequence` | geometric multiplicity via \(n-\operatorname{rank}(A-\lambda I)\) |
| 6 | `rn-zero-map-ledger` | drill | numeric | the degenerate extreme |
| 7 | `rn-impossible-map` | transfer | MC | which described map cannot exist |
| 8 | `rn-square-only` | transfer | MC | one-to-one ⟺ onto holds only for square |
| 9 | `rn-not-a-decomposition` | transfer | MC | the two spaces do not decompose \(\mathbb{R}^n\) |
| 10 | `rn-prove-theorem` | transfer | `self-check` | construct the proof (unscored) |

## Insight traceability
| Obligation | Location | Evidence |
| --- | --- | --- |
| §6a dimension well defined | formal `ref-dimension` | — (reference) |
| §6b–e the proof | formal `thm-rank-nullity` + `proof` route block (package R3: moved from a collapsed `math-note` layer to the main line — same argument), worked `wex-proof-walkthrough` | `rn-prove-theorem` |
| §6f pivot/free is the same thing | section `bookkeeping` | `rn-complete-ledger-fresh` |
| §6g what it forbids | section `forbids`, formal `cor-consequences`, scene `ceiling`/`forbidden` | `rn-impossible-map`, `rn-rank-ceiling` |
| §6h trichotomy explained | `connection` layer | `rn-square-only` |
| §6i geometric multiplicity | section `forward`, `looking-ahead` layer | `rn-eigen-multiplicity` |
| §13 limits | callouts `total-is-n`, `onto-iff-one-to-one`, `not-a-decomposition` | `rn-which-total`, `rn-square-only`, `rn-not-a-decomposition` |

## Key takeaway
> \(n\) is a budget and the map spends all of it: every input dimension either
> survives into the image or collapses into the null space, so
> \(\operatorname{rank}+\operatorname{nullity}=n\). The total is the **input**
> dimension — never the output — which is why nothing from a bigger space to a
> smaller one can be one-to-one.

## Edge cases
wide, tall, square; zero map; invertible map; a square map that is neither
one-to-one nor onto; a defective matrix where geometric < algebraic multiplicity.

## Mathematical invariants to assert
- [x] the identity across wide/tall/square/zero/full-rank
- [x] \(\operatorname{rank} \le \min(m,n)\)
- [x] injective ⟺ nullity 0; surjective ⟺ rank = m — agreeing with the counts
- [x] one-to-one ⟺ onto **only** when \(m=n\) (a counterexample asserted for \(m\ne n\))
- [x] geometric multiplicity \(= n - \operatorname{rank}(A-\lambda I)\), and \(<\) algebraic for the defective example

## Required tests
- [x] `src/math/__tests__/rankNullity.test.ts`
- [x] lesson wiring + content validation
- [x] explorer component test (ledger, verdicts, shape switching, reset)
- [x] e2e at desktop and narrow viewport
