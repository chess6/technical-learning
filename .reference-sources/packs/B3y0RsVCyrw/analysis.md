# Analysis: Huffman Codes — An Information Theory Perspective (Reducible, B3y0RsVCyrw)

Reference-only notes. Source: `reducible/2021/Huffman/huffman.py` @ 88f4f8f (vendored manimlib, no license).

## Starting mental model and central insight

The video assumes a learner who thinks of encodings as arbitrary lookup tables: symbols map to
bit strings, and "compression" means picking shorter strings. Two model changes are engineered:

1. **Prefix-free codes ARE full binary trees** [17:47-18:17]. Once decoding is animated as
   tree traversal, code design becomes tree-shape design, and "average bits per symbol" becomes
   a depth-weighted sum over leaves — a geometric quantity you can reason about.
2. **Optimality comes from bottom-up greedy merging** [20:22-24:25]. The reformulation
   L = sum of internal-node probabilities turns "merge the two least likely" into a recursion:
   cost = p1 + p2 + (cost of the same problem with the pair fused). Shannon-Fano's top-down
   splitting vs Huffman's bottom-up merging is the explicit punchline [27:33-28:20].

A secondary model change: information is a measurable quantity (axioms -> self-information ->
entropy), so "how far can we compress" has a definite answer, L >= H(X) [12:03-12:45].

## Explanatory beat sequence (timestamps <-> scene classes)

1. [0:00-2:09] Origin story, problem statement — `IntroStory`, `Transition`
2. [2:09-5:08] Communication network; three constraints shown by mutating one encoding table
   through valid/lossy/ambiguous variants — `ProblemFormulation`
3. [5:08-5:47] Compression as a balancing act on a bit-length number line — `BalancingAct`
4. [5:47-8:56] Four axioms force I(x) = -log2 p(x) — `IntroSelfInformation`
5. [8:56-10:59] Entropy as weighted average; biased-coin sweep; naming story — `IntroEntropy`, `NamingEntropy`
6. [10:59-14:38] Average length per symbol; source coding theorem; receiver's yes/no
   question game builds a tree whose edges become bits — `EntropyCompression`, `EntropyExample`
7. [14:38-16:44] Dyadic distribution: recursive equal-probability splits achieve L = H(X) — `EntropyExample`
8. [16:44-19:18] Shannon-Fano algorithm; prefix-free property; decoding walk; the 2.31 vs 2.30
   suboptimality counterexample — `ShannonFano`
9. [19:18-21:18] L via depths; the two least likely symbols must be deepest — `ShannonFano.motivate_huffman`
10. [21:18-24:10] L via internal-node sums; recursive cost; greedy merge justified —
    `ShannonFano.show_generalized_motivation_of_huffman`
11. [24:10-25:58] Full Huffman build on a probability distribution, then on real text —
    `HuffmanCodesProbDist`, `HuffmanCodes`
12. [25:58-27:07] Node class + heapq implementation beside a PIP replay — `HuffmanImplementation`
13. [27:07-29:10] Bottom-up vs top-down retrospective — `HuffmanConclusion`

## Persistent objects and identity during tree building

The `Node` class (huffman.py:6) fuses algorithm state and visuals: it holds `freq`, `key`,
`left/right` pointers, plus `self.mob` (its canvas representation) and `self.heap_mob` (its
stand-in inside the sorted frontier column). `generate_mob` renders leaves as a yellow
frequency box stacked on a blue key box, and internal nodes as yellow circles containing the
merged frequency — so leaves and internal nodes are visually distinct types, and a leaf never
"becomes" a subtree; it becomes a *child* of a newly grown parent.

The merge choreography (`make_huffman_tree` -> `animate_huffman_step`):
- Leaf mobs **persist and move**: `left.mob.move_to(position_map[key])` slides the same object
  from the frontier column into its final tree slot. Positions are hard-coded per key in
  `get_position_map_balanced` — layout is precomputed, not solved at runtime.
- Edges are `Line` mobs created fresh (`get_edge_mob`, trimmed by node radius) and drawn with
  `ShowCreation` while the parent circle appears via `GrowFromCenter` — parents are *born at*
  the merge, never transformed from children.
- The parent then re-enters the frontier as a **copy**: `transform_heap` rebuilds the sorted
  column and plays `TransformFromCopy(parent.mob, heap_group[...])`, assigning the copy to
  `parent.heap_mob`. So each internal node exists twice: once fixed in the tree, once as a
  queue token. When that token is later consumed, it slides to its tree position, fades
  (`heap_mob.fade, 0.9`) and is removed — the tree copy was already there, so identity reads
  as continuous even though the object is disposable.
- Character-to-leaf identity in `HuffmanCodes.group_text`: each character of the input string
  is individually flown into its frequency group with `TransformFromCopy`, then the group is
  `ReplacementTransform`ed into one leaf — conservation of symbols is shown, not asserted.

Shannon-Fano (top-down) uses the opposite scheme: node *groups* are deep-copied and
`TransformFromCopy`'d downward at each dashed-line split (`split_nodes`, `show_transform`),
and only at the end does `make_splits_into_nodes` collapse each group into a single circle
while its dashed line fades — the tree crystallizes out of the partition diagram.

## Change vs invariant at each beat

- Network beat: encoding table and bitstring mutate; the five-box diagram and arrows never move.
- Balancing act: only the marker and encodings change; the scale with redundancy/loss arrows persists.
- Entropy sweep: a dot moves on the curve while an `add_updater` re-renders the bar chart to
  match — distribution and entropy are held consistent by construction.
- Shannon-Fano: probability-sum labels persist through splits; every symbol remains a leaf
  with a unique colored root path (prefix property visibly maintained during decoding).
- Huffman build: the frontier column is re-sorted after every merge (sorted-frontier
  invariant); each parent circle displays exactly the sum of its children (frequency
  conservation); already-placed subtrees never move again.

## Style: color, camera, framing, emphasis, pauses

Color is semantic and sparse: yellow = node geometry/emphasis, blue = symbol keys,
GREEN_SCREEN/BRIGHT_RED = bit values and valid/invalid states, gray = edges and plumbing,
Monokai palette for hand-typeset code (each token colored by index — extremely brittle).
The camera is fixed; "camera moves" are faked by `Transform`ing whole `VGroup`s (tree_group
scaled 0.7 and shifted left to make room for the decoding panel). Emphasis tools:
`SurroundingRectangle` to bind a formula term to a tree region (orange/blue paired rectangles
in the recursion beat), `Indicate` on the leaf reached during decoding, `Cross` over
"obvious", `ApplyWave` on the two nodes about to merge. Pacing is `self.wait()` after nearly
every `play`, with long holds (`self.wait(8)`) where narration carries the load.

## Narration <-> motion synchronization

Sync is entirely manual: scenes are rendered with generous waits and narration is recorded/cut
to fit; there is no timing data in the code. The effective technique is *one clause, one
transform* — each sentence of narration corresponds to exactly one `self.play` group, and
formulas are never restated verbally without the matching `TransformFromCopy` pulling the
numbers out of the picture (e.g., leaf frequencies flying into the L summation [21:31-22:25]).

## Passive spectacle vs learner reasoning

Mostly a guided watch, but with genuine reasoning hooks: the viewer is asked to find a better
encoding before the dyadic split is revealed ("take a second..." [14:38]); the question game
[13:04-14:06] frames encoding as a strategy the viewer could invent; "what does this
formulation immediately imply?" [20:22] precedes the two-least-likely lemma. The merges
themselves, however, are never predicted by the viewer — the frontier is sorted *for* you, and
no beat pauses on "which two nodes merge next?", which is exactly the question an interactive
version should ask.

## What suits our interactive textbook

- **Question-game exploration**: play 20-questions against a distribution; the tree the user
  builds *is* their code. Perfect standalone exploration with a graded checkpoint on average
  question count vs entropy.
- **Guided scene "merge two, push one" (~45s)**: named beats = sort frontier -> pop two -> grow
  parent -> re-insert -> repeat; mirrors our BST "lift from sorted array" scene, but bottom-up.
  Keep the double-identity trick (tree node + queue token) — it is the clearest part.
- **Predict-the-merge checkpoint**: show a frontier, ask which pair merges and what the parent
  value is; grade the prefix property and frequency-sum invariant explicitly.
- **Shannon-Fano vs Huffman comparison explorer**: same distribution, top-down splits vs
  bottom-up merges, live L readout — the 2.31 vs 2.30 moment as an interaction, not a reveal.
- The entropy dot-sweep with a linked bar chart is a natural slider interaction.

## What NOT to copy

- **No code reuse**: repo has no declared license; treat as read-only prior art.
- **manimlib idioms**: `TextMobject` with per-glyph-index coloring, `CONFIG` dicts,
  `ApplyMethod`-style `self.play(mob.move_to, ...)`, `GraphScene` — none map to Motion Canvas.
- **Hard-coded position maps and transform orders** (`get_position_map_balanced`,
  `transform_order = ['DE','DEA',...]`): compute layout from the tree instead.
- **20+ minute single-arc pacing and wait-based sync**: our scenes are 30-60s with named
  beats; put the information-theory ramp in prose/checkpoints, not one long animation.
- The fused Node (model + mobject) couples algorithm and view; keep our model/scene split.

## Patterns worth stealing (as patterns, not code)

1. Decode-by-walking: prove the prefix property by animating traversal, coloring consumed bits
   to match edges.
2. Double identity for queue-and-tree: a node lives in the structure and as a token in the
   frontier; the token is a copy that fades into the already-placed original.
3. Sorted frontier as a persistent, visibly re-sorted column — the greedy invariant is a place
   on screen, not a caption.
4. Numbers travel: derive formulas by flying copies of on-screen values into the equation
   (TransformFromCopy as visual proof of "where did this term come from").
5. Mutate one fixture: keep the diagram fixed and swap only the encoding table to contrast
   valid/lossy/ambiguous schemes.
6. Paired highlight rectangles binding formula terms to picture regions.
7. Linked representations via updaters (slider on curve <-> bar chart).
8. Conservation shown by transport: every input character visibly lands in exactly one leaf.
9. Contrast punchline: same distribution run through both algorithms, one metric on screen.
10. Ask before reveal: pose "can you beat this encoding?" and pause before showing the trick.
