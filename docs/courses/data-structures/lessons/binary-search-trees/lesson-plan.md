# Lesson plan — Binary Search Trees

Stage 3 of Mode B. Implements [mastery-contract.md](mastery-contract.md) (Gate 5),
which implements [insight.md](insight.md) (Gate 4, `PASS`). Neither is restated.

## Gate prerequisite

- Insight Contract: [insight.md](insight.md) — [x] `Gate result: PASS` confirmed
- Mastery Contract: [mastery-contract.md](mastery-contract.md) — complete

## Approved insight (gate)

- **Exact primary insight — verbatim, planning metadata only:** see
  [insight.md § Gate result](insight.md#gate-result) (the closing blockquote).
- **Learner-facing phrasing:** *"A binary search tree is binary search with the
  midpoints kept. Each node is a comparison you already made; the path you walk is
  the search; so the depth **is** the cost — and whoever chose the insertion order
  chose the cost."*
- **Diagnosed cognitive obstacle:** missing purpose (and, behind it, missing
  structure) — the learner can execute the descent but has no object it is a
  representation *of*, so shape looks incidental.
- **Insight mechanism(s):** representational change (primary) + structural
  compression.
- **Grounded-insight obligations** (a bridge *is* used, so these are traceability
  duties, discharged in the table below):
  - **Bridge:** binary search on a sorted array.
  - **Named analogy limits to discard:** fixed array layout · exact midpoints ·
    static key set · **guaranteed halving** (the load-bearing discard).
  - **Abstraction return:** grounded array → the lift (explicit correspondence) →
    an unbalanced tree whose root is not the median → the height bound for
    arbitrary $n$.

---

## Lesson title

**"Binary Search Trees: keeping the midpoints"**
Subtitle: *Why the shape of the tree is the cost of the search*

## Route / ids

- Route: `/lesson/binary-search-trees`
- `guidedSceneId`: `bst-lift-from-array`
- `explorationId`: `bst-insertion-order`
- `exampleId`: `bst-seven` (shared by scene and explorer)

### Authored `route` (page grammar §1 — no generic phase names)

| # | Block | Authored `heading` / `tocLabel` |
| --- | --- | --- |
| 1 | `motivate` | *(none — the question speaks for itself)* |
| 2 | `visual` | `heading: "Where do the midpoints go?"` |
| 3 | `section: the-lift` | "The probes were a tree all along" |
| 4 | `formal: def-bst` | *Definition* |
| 5 | `formal: thm-interval` | *Theorem* (T1) |
| 6 | `section: legality-is-an-interval` | "A tree can pass every local check and still be wrong" |
| 7 | `check` | *(none — the prompt speaks for itself)* |
| 8 | `formal: thm-inorder` | *Theorem* (T2) |
| 9 | `worked: wex-inorder-why` | *(none)* |
| 10 | `section: depth-is-the-cost` | "Cost is not related to the shape — it is the shape" |
| 11 | `explore` | `tocLabel: "Choose the insertion order, choose the cost"` |
| 12 | `formal: thm-height-bounds` | *Theorem* (T4) |
| 13 | `worked: wex-height-induction` | *(none)* |
| 14 | `section: array-or-tree` | "What you actually bought" |
| 15 | `practice` | *(default "Practice")* |
| 16 | `summary` | `heading: "The insertion order chose the cost"` |

Watch (2) precedes Explore (11). The scene is introduced by an authored heading
because no section title precedes it.

## Motivating question

> Binary search is fast, but the array underneath it is rigid: insert one key and
> everything after it shifts. The comparisons themselves were cheap — it is the
> *recomputing* that hurts. What if we just kept the midpoints?

## Shared examples (exact values)

In `src/lessons/exampleData.ts`, referenced everywhere; never re-typed.

| Id | Content | Used by |
| --- | --- | --- |
| `bst-seven` | sorted array `[4, 8, 15, 16, 23, 42, 50]` | scene + explorer initial state |
| `bst-degenerate` | the same keys inserted in increasing order | scene `degenerate` step, M1/M2 |
| `bst-fresh-trace` | keys `[31, 12, 47, 7, 20, 39, 55]`, search `20` | **O1** (fresh — not the scene's set) |
| `bst-invalid-local` | a tree passing every parent–child check, invalid at one node | **O5**, and the negative invariant test |
| `bst-orders-pair` | key set `[2,5,9,11,14,18,25]` with two candidate orders | Check, **O2** |

## Guided-scene outline (Watch) — `bst-lift-from-array`

Read-only Motion Canvas. Split-screen: the sorted array above, the emerging tree
below. One conceptual change per major step.

| Step id | Name (learner-facing) | Idea revealed | Notation synced |
| --- | --- | --- | --- |
| `establish` | A sorted array, and a key to find | the array; the target; nothing else | $K$, target |
| `probe-first` | The first comparison, and half the array goes dark | probing the midpoint; the discarded half dims | $(lo,hi)$ |
| `probe-rest` | Two more probes finish the search | the live interval narrows twice | $(lo,hi)$ shrinking |
| `second-search` | A different key repeats the first probe | the redundancy: the same midpoint, recomputed | — |
| `lift` | Pull the probes out and wire them up | probes → nodes, outcomes → edges; **the tree appears** | — |
| `read-the-rule` | The rule was not assumed — it fell out | left-smaller/right-larger read *off* the drawing | BST invariant |
| `interval-stays` | Every position carries an inherited range | T1 made visible on the picture | $(lo,hi)$ |
| `cost-is-depth` | One comparison per level | search cost $=d+1$ traced on a path | $d+1$ |
| `degenerate` | Insert the same keys in order — and get a stick | the chain; comparisons counted against the balanced tree | $h=n-1$ |
| `the-gap` | Two shapes, same keys, very different cost | the two heights side by side; the sequel named | $\lceil\log_2(n+1)\rceil-1$ vs $n-1$ |

- **Pauses / dimming plan:** establishing frame paused at $t=0$; the discarded
  half of the array dims to `--role-intermediate` at each probe and never
  brightens again; during `lift` everything except the probed cells dims, so the
  tree is what remains.
- **Honest labelling of any interpolation:** the `lift` step *moves* cells into
  node positions — captioned **"same probes, redrawn"**, never implying a
  computation happened. The `degenerate` step is captioned as a *different
  insertion order*, not a different algorithm.

## Checkpoint (Check understanding)

- **Prompt:** "Same seven keys, two insertion orders: `[14,5,25,2,9,18,...]` and
  `[2,5,9,11,14,18,25]`. Before you build either: which one makes the worst-case
  search cheaper, and roughly how many comparisons does each cost?"
- **Type:** committed prediction (commit-before-reveal).
- **Reveal:** the first is median-first and gives height 2 → 3 comparisons; the
  second is sorted and gives a 7-node chain → 7 comparisons. Same keys, same rule,
  same in-order readout — a factor of two-plus in cost.

## Interactive controls (Explore) — `bst-insertion-order`

Initialized from `bst-seven`, so the learner takes over the scene's own key set.

- **Primary controls:** *insertion order* — drag to reorder the key chips, plus
  one-click **Sorted** / **Reverse** / **Median-first** / **Shuffle** presets ·
  *search for a key* (highlights the path and counts comparisons) · *Reset*.
- **Primary readouts:** current **height**; **worst-case comparisons** $=h+1$;
  the **bound band** $\lceil\log_2(n+1)\rceil-1 \le h \le n-1$ with the current $h$
  marked inside it; the **in-order readout**, which visibly never changes (T2, and
  the standing refutation of M3).
- **Progressive disclosure ("Display options"):** show inherited intervals
  $(lo,hi)$ on each node (**off** by default — turning it on is the O5 support) ·
  show comparison counts per node · show the balanced tree ghosted behind the
  current one.
- **Clamp ranges:** 3–12 keys, integers 1–99; duplicates rejected with a stated
  message.
- **Reset behavior:** back to `bst-seven` in its original order; wired to the
  lesson `Reset`.

## Exercises (Practice)

| # | Id | Outcome | Type | Deterministic answer | Feedback (why) |
| --- | --- | --- | --- | --- | --- |
| 1 | `bst-invariant-recall` | D2 (**the one recall item**) | multiple-choice | the invariant as a *correctness condition* | distractors are the three usual misreadings, incl. "parent-child comparison" |
| 2 | `bst-search-trace` | O1 | `custom` (`bst-comparison-sequence`) | the ordered comparison sequence on `bst-fresh-trace` | grades the **sequence**; a right found/not-found with a wrong path fails |
| 3 | `bst-order-predicts-shape` | O2 | `custom` (committed prediction + numeric) | which order, and the worst-case count | commit-before-reveal; the reveal replays both builds |
| 4 | `bst-invalid-local-check` | O5 | `custom` (error diagnosis) | offending node **and** the interval it violates | node alone is not accepted — the interval is the point |
| 5 | `bst-construct-balanced` | O6 | `custom` (`construct-in-explorer`) | any order attaining minimum height | predicate-verified, so many orders pass |
| 6 | `bst-choose-structure` | O7 | multiple-choice | BST for insert-heavy; array for search-only-static | **method selection**: the prompt names no criterion (`methodSelection: true`) |
| 7 | `bst-inorder-why` | O3 | `custom` (proof completion, human-scored) | the interval-split step | model answer + self-check |
| 8 | `bst-height-induction-step` | O4 | `custom` (proof completion, human-scored) | the inductive step, then the ceiling | model answer + self-check |

Auto-graded items (2–6) each owe, **in the same commit**, a
`describeGradingContract` spec (accepted answer + the adversarial reject battery:
all-blank, blank-where-true-value-is-0, zero-filled, related-but-wrong) and an
`ITEM_ASSESSMENT_META` entry — per [AGENTS.md](../../../../../AGENTS.md).

## Misconception handling (`callouts`)

M1 and M2 at the `degenerate` scene step and the explorer's **Sorted** preset ·
M3 standing refutation via the never-changing in-order readout · M4 as the
`legality-is-an-interval` section plus O5 · M5 beside `lift` · M6 in
`array-or-tree`.

## Progressive-disclosure depth layers

- *Mathematical note* — average height over uniformly random insertion orders is
  $\Theta(\log n)$, **with the assumption stated**. Enrichment; never assessed.
- *Looking ahead* — red-black trees: force the shape so the data cannot choose it.
- *Connection* — the same counting argument bounds comparison-sorting decision
  trees (architectural, named not derived).
- *Why do we care* — ordered maps and database indexes want both operations.

## Pure math module — `src/math/binarySearchTrees.ts`

No React, no Mafs, no Motion Canvas. Everything displayed comes from here.

```ts
type BSTNode = { key: number; left: BSTNode | null; right: BSTNode | null };
type Interval = { lo: number | null; hi: number | null };   // null = unbounded
type SearchTrace = { comparisons: number[]; found: boolean; depth: number };

insert(root: BSTNode | null, key: number): BSTNode | null;   // at-leaf; duplicates rejected
insertAll(keys: readonly number[]): BSTNode | null;
searchTrace(root: BSTNode | null, key: number): SearchTrace; // the graded intermediate
inOrder(root: BSTNode | null): number[];
height(root: BSTNode | null): number;                        // edges; single node = 0
worstCaseComparisons(root: BSTNode | null): number;          // height + 1
heightBounds(n: number): { min: number; max: number };
buildBalanced(sortedKeys: readonly number[]): BSTNode | null;
medianFirstOrder(sortedKeys: readonly number[]): number[];
intervalAt(root: BSTNode | null, key: number): Interval;
isValidBST(root: BSTNode | null): { valid: boolean; offendingKey?: number; interval?: Interval };
binarySearchProbes(sortedKeys: readonly number[], target: number): number[]; // for invariant #7
```

## Insight traceability (required)

| Contract obligation | Learner-facing location | Evidence of understanding |
| --- | --- | --- |
| A search tree is a decision tree over $K$ | Watch `lift`, `read-the-rule`; §*the-lift* | **O1** — writes the comparison sequence, not just the result |
| Reachable keys form an interval | Watch `interval-stays`; T1 | **O5** — names the violated interval |
| The invariant is the *correctness condition* | §*the-lift* close; `def-bst` | recall item 1's distractors separate "rule" from "correctness condition" |
| In-order reads the intervals left to right | T2; `wex-inorder-why`; explorer readout | **O3** — completes the interval-split step |
| Cost is depth $+1$, exactly | Watch `cost-is-depth`; §*depth-is-the-cost* | **O2** — states the count, not just the winner |
| Insertion order selects the shape | Watch `degenerate`; explorer presets | **O2**, **O6** |
| Height bounds, both ends attained | T4; `wex-height-induction`; explorer bound band | **O4** (bound) and **O6** (attainment) |
| The sequel is forced | Watch `the-gap`; `looking-ahead` layer | summary states the open problem in the learner's own terms |
| **Bridge**: binary search on an array | Watch `establish`…`probe-rest` (array alone, before any tree) | learner runs the probes before a tree exists |
| **Limit**: fixed array layout | caption at `lift` | — |
| **Limit**: exact midpoints / "root is the median" | M5 callout beside `lift` | **O2** — a non-median root still predicted correctly |
| **Limit**: static key set | §*array-or-tree* | **O7** — chooses by workload |
| **Limit**: guaranteed halving *(load-bearing)* | Watch `degenerate`; M1/M2 callouts | **O2** — predicts the chain's cost, not "$\log n$" |
| **Return**: unfamiliar case | explorer with a non-median root | **O6** on a fresh order |
| **Return**: symbolic case | T4 for arbitrary $n$ | **O4** |
| Cost claim is $\Theta(h)$, not $O(\log n)$ | §*depth-is-the-cost*; M1 | no item accepts "$\log n$" unqualified |

## Key takeaway (Summarize)

> A binary search tree is binary search with the midpoints kept, so the path you
> walk *is* the search and the depth *is* the cost. Every legal shape reads out the
> same sorted keys — but not for the same price, and it is the insertion order that
> picks the price.

## Notation

$K$ · $n=|K|$ · $h$ (edges) · $d$ (depth) · $(lo,hi)$ · cost $=d+1$. KaTeX for
$n \le 2^{h+1}-1$ and $\lceil\log_2(n+1)\rceil - 1 \le h \le n-1$.

## Edge cases

Empty tree · $n=1$ (height 0, cost 1) · increasing and decreasing orders ·
duplicate key (rejected, policy stated) · search for an absent key (trace ends at
a `null` child) · 12-key cap.

## Mathematical invariants to assert

The seven checks in [mastery-contract §1g](mastery-contract.md#1g-correctness--scope),
added to `src/math/invariants.ts` — including **#2's negative half**, that the
locally-valid/globally-invalid fixture is *rejected*. Property/fuzz tests run
randomized key sets and orders.

## Required tests

- [ ] Unit — `src/math/__tests__/binarySearchTrees.test.ts`
- [ ] Property/fuzz — random key sets × random orders: in-order always sorted;
      validity; bounds hold; trace length = depth + 1
- [ ] Invariant — the seven checks, including the negative validity fixture
- [ ] Grading contracts — items 2–6 with the adversarial reject battery
- [ ] Assessment manifest — `ITEM_ASSESSMENT_META` for every auto-graded item;
      `evidenceCeiling` + `cueLint` pass (O7 is `methodSelection`)
- [ ] Component — explorer readouts, order presets, interval toggle, reset
- [ ] Browser — `e2e/lesson-binary-search-trees.spec.ts`: scene establishes and
      steps; explorer reorders and updates height/cost; no console errors; no
      horizontal overflow at 1440 px and 390 px in **both themes**
- [ ] Page-grammar sweep — add the id to `LESSON_IDS` in
      `e2e/course-context-and-grammar.spec.ts`

## File-by-file implementation work

| File | Work |
| --- | --- |
| `src/math/binarySearchTrees.ts` | **new** — the API above |
| `src/math/invariants.ts` | +7 invariants (one negative) |
| `src/math/index.ts` | re-export |
| `src/lessons/exampleData.ts` | the five shared example ids |
| `src/lessons/binarySearchTrees.ts` | **new** — `LessonDefinition` + the route above |
| `src/lessons/registry.ts` | register |
| `src/lessons/courseModel.ts` | `future` node → built lesson **(the promotion — Mode C)** |
| `src/lessons/capabilities.ts` | grading capabilities: comparison-sequence, error-diagnosis, construct-in-explorer, proof-completion |
| `ExercisePanel` UI half | renderers for those capabilities |
| `src/lessons/assessmentManifest.ts` | `ITEM_ASSESSMENT_META` entries |
| `src/guided-scenes/scenes/bstLiftScene.ts` | **new** scene |
| `sceneTimings.ts` / `sceneMeta.ts` / `sceneDescriptions.ts` | segments, meta, description |
| `src/explorations/BstInsertionOrderExplorer.tsx/.css` | **new** explorer |
| `src/explorations/registry.tsx` | lazy entry |
| `src/pages/LessonPreviewIcon.tsx/.css` | catalog motif |
| `src/lessons/glossary.ts` | BST, height, depth, in-order traversal, decision tree |
| `e2e/` | new spec + `LESSON_IDS` |
| `docs/quality/lesson-correctness-checklist.md` | Gate 7 entry |
| `mastery-contract.md` §5 | Gate 8 acceptance record |

## Implementation order

1. `src/math/binarySearchTrees.ts` + unit/property tests — **nothing visual until
   the math is green**.
2. Invariants, including the negative validity fixture.
3. `LessonDefinition` with sections, formal blocks, worked examples — the page must
   read correctly as prose before any animation exists.
4. Guided scene, driven entirely by the math module.
5. Explorer, sharing `bst-seven` with the scene.
6. Exercises + capabilities + grading contracts + manifest.
7. Promotion, glossary, preview icon, e2e.
8. Gate 7 checklist, then the Gate 8 acceptance record.

## Acceptance criteria

- [ ] Insight Contract linked and `PASS`; meaning and causal chain preserved
- [ ] Insight traceability table complete — every obligation, every named limit,
      both returns, each with a location **and** evidence
- [ ] Intentional `route`; Watch precedes Explore
- [ ] Headings and both ToCs content-specific; no generic phase names
- [ ] Guided-to-interactive continuity (`bst-seven` in both)
- [ ] Progressive disclosure applied; intervals **off** by default
- [ ] KaTeX notation consistent across prose, scene, explorer, exercises
- [ ] Accessibility preserved (labels, focus, readouts, reduced-motion)
- [ ] Tree legible and unclipped at 1366 px; stacks below 900 px
- [ ] `docs/quality/lesson-correctness-checklist.md` completed
- [ ] `./check.sh --e2e` green
