# Algorithm & data-structure visual language

A **reusable visual language for algorithm and data-structure lessons**, extending
the linear-algebra visual system this project already ships. Where
[authoring/animation-quality-bar.md](../authoring/animation-quality-bar.md) sets the *authoring and
review* bar for clips and [authoring/lesson-design.md](../authoring/lesson-design.md) sets the lesson
flow, this document defines the **primitives** — the visual roles an algorithm
lesson draws from (values, arrays, pointers, tree nodes, recursion, call stacks,
invariants, comparisons, swaps, rotations, splits/merges, recoloring, cost,
recursion trees, object identity, temporary-vs-persistent state) — and how each
one must behave to be correct, legible, and accessible.

This is a **design/spec doc, not code**. No source, tests, or tokens are changed
by adopting it; the token additions proposed in §2 are *proposals* to add to
`src/styles/tokens.css` when the first algorithm lesson lands.

> **Constraints carried over (do not restate at length).**
> - Semantic `--role-*` tokens, never raw hex in learner-facing visuals
>   ([tokens.css](../src/styles/tokens.css), [lesson-design rule](../.cursor/rules/lesson-design.mdc)).
> - `src/math` is the **only** source of truth for computation; visual layers map
>   math → screen and never reimplement it
>   ([math-visualization-correctness rule](../.cursor/rules/math-visualization-correctness.mdc)).
> - Object-identity continuity, attention choreography, the paused establishing
>   frame at `t=0`, reduced-motion behavior, and KaTeX for learner-facing notation
>   are already required elsewhere; this doc **applies** them per primitive rather
>   than re-deriving them.

---

## 1. Scope and what "extends the linear-algebra system" means

The existing system teaches **continuous geometric** objects: vectors, a deforming
grid, a determinant parallelogram, eigenlines. Its native home is a Mafs coordinate
plane (interactive) and a Motion Canvas stage (narrated).

Algorithms add **discrete, structural** objects: cells, nodes, edges, stack frames,
tokens. These are usually *not* points in a continuous coordinate space — a tree
node has no meaningful `x`-coordinate, only a parent, children, a key, and a color.
So the algorithm layer leans on **React/SVG structured diagrams** (arrays, trees,
call stacks) far more than on Mafs, while **Motion Canvas** still owns the narrated
"watch one change at a time" sequences and **Mafs** stays the right tool whenever an
algorithm genuinely lives in a continuous space (Karatsuba's area rectangles, a cost
curve, the `n^{\log_2 3}` vs `n^2` growth comparison).

The four project layers, and the default algorithm-primitive home for each:

| Layer | Path | Best for (algorithms) |
| --- | --- | --- |
| Pure math | `src/math/` | the algorithm itself: `karatsubaStep`, `recursionTree`, a future `rbInsert` returning a step trace. No React/Mafs/Motion Canvas. |
| Guided (Motion Canvas) | `src/guided-scenes/` | narrated, read-only sequences: one swap, one rotation, one recolor at a time, with captions and holds. |
| Explorations (Mafs) | `src/explorations/` | continuous spaces and learner-driven parameters: area rectangles, cost curves, a digit/`n` slider. |
| Structured diagram (React/SVG) | `src/components/lesson/`, `src/explorations/` | discrete structure: arrays, trees, call stacks, pointer arrows. SVG (as in `KaratsubaTreeDiagram.tsx`) or DOM, not a coordinate plane. |

> **Rule.** Pick the layer from the *object*, not from habit. A tree is structural →
> React/SVG. A "how does cost grow" question is a curve → Mafs. "Watch this one
> pointer move" is narrated → Motion Canvas. The trace that drives all three comes
> from `src/math`.

---

## 2. Per-primitive template

Every primitive below is specified with the **same seven fields** so the doc reads
as a reference:

1. **Pedagogical purpose** — what the learner must see/understand.
2. **Identity tracking** — how one object stays visibly the *same entity* across a
   change (stable position/color/label, layout transition rather than teleport, a
   shared React `key` / scene node). First-class.
3. **Semantic role / token** — the `--role-*` token, existing or proposed.
4. **Appropriate animation** — the motion that communicates the concept truthfully.
5. **Misleading animations** — the tempting-but-wrong motions to avoid.
6. **Accessibility** — text readout, ARIA label, non-color encoding, focus,
   reduced-motion fallback (paused establishing frame).
7. **Primary layer** — with a one-line justification tied to project layering.

### Proposed token additions

Algorithm concepts need a small set of *state* roles the current palette lacks. Add
these to `src/styles/tokens.css` alongside the existing `--role-*` block, tuned for
the dark canvas, and reuse the existing `--role-invariant` / `--role-selected` where
they already fit. Names follow the existing `--role-<concept>` convention.

| Proposed token | Meaning | Notes |
| --- | --- | --- |
| `--role-active` | the element currently being executed on (the frame on top of the stack, the node under repair) | pairs with a "focus ring", not color alone |
| `--role-pending` | scheduled/queued but not yet executed (subproblem waiting) | must read as *dimmer/idle*, not as done |
| `--role-done` | finished/settled (returned subproblem, sorted region) | reuse of `--color-success` hue, canvas-tuned |
| `--role-compare` | the pair currently being compared | transient; retire after the beat |
| `--role-token` | a mobile defect/marker (double-red, double-black, carry) | reuse `--role-invariant` pink if a new hue is unwanted |
| `--role-temp` | a temporary/scratch value that will be discarded | visibly distinct from persistent objects (dashed/ghost) |

Reuse, don't duplicate: `--role-invariant` for a *conserved quantity* readout,
`--role-selected` for a learner-chosen highlight, `--role-intermediate` for helper
lines. The proposed tokens cover only genuinely new algorithm states.

---

## 3. Primitives

### 3.1 Values and variables

- **Pedagogical purpose.** A named scalar (a digit `A`, a key `k`, an accumulator)
  has a value that may change while the *name* persists. The learner must separate
  "the box" (variable) from "what's in it" (value).
- **Identity tracking.** The variable keeps a **fixed on-screen slot and label**;
  only the rendered value updates. Never relabel a slot to a different variable
  mid-beat. When a value flows from one variable to another, animate a copy leaving
  the source (see 3.16), not the label jumping.
- **Semantic role / token.** Neutral `--color-canvas-text` for the label; the value
  takes a role only when it *plays* one (an `--role-active` value under focus).
- **Appropriate animation.** Count-up/cross-fade of the value in place; a brief
  highlight pulse when it changes.
- **Misleading animations.** Sliding the whole variable box when only its value
  changed (implies the variable moved/reallocated). Reusing one slot for two
  different variables in sequence.
- **Accessibility.** Readout line `A = 1`; `aria-label` on the slot; change announced
  via an `aria-live="polite"` region; reduced motion → value swaps instantly, no
  count-up.
- **Primary layer.** React/SVG (a DOM/`SceneReadout` field). It is a labeled datum,
  not a point in space; Motion Canvas only when a value is a character in a narrated
  beat.

### 3.2 Arrays and indexed cells

- **Pedagogical purpose.** A contiguous, index-addressable sequence; index `i` is a
  position, not a value. The learner must see cells as *stable positions* with
  changing contents.
- **Identity tracking.** Each cell has a **fixed grid slot keyed by index**; contents
  move between cells, cells do not move. When the array logically grows/shrinks,
  transition layout (cells slide to new evenly-spaced positions) rather than
  teleporting; keep the same React `key` per element identity when tracking *elements*
  rather than *positions* (the two are different — be explicit which you animate).
- **Semantic role / token.** Cell frame neutral; `--role-active` for the current
  index, `--role-compare` for a compared pair, `--role-done` for a settled region
  (e.g. sorted prefix), `--role-pending` for the unprocessed remainder.
- **Appropriate animation.** An index pointer (3.3) glides along fixed cells; a value
  moving between cells animates as a copy/move with a visible source and destination.
- **Misleading animations.** Animating *cells* sliding when it is the *index* that
  advances (implies the data physically shifts). A swap rendered as both values
  fading to the same color (loses which came from where — see 3.10).
- **Accessibility.** `role="list"` / labeled cells `cell 3 = 7`; the active index in a
  readout `i = 3`; non-color state via a border style or a small caret, not fill hue
  alone; reduced motion → discrete step highlighting.
- **Primary layer.** React/SVG. A discrete indexed structure, exactly the
  `KaratsubaTreeDiagram`-style SVG/DOM idiom, not a coordinate plane.

### 3.3 Pointers and references

- **Pedagogical purpose.** A pointer *names* another object without owning it; several
  pointers can name the same object; a pointer can be reassigned without changing what
  it used to point at.
- **Identity tracking.** Render a pointer as an **arrow from a fixed source anchor to
  the target's stable position**. Reassignment animates the *arrowhead* traveling to
  the new target; the previously-referenced object stays put (only the arrow moved).
  Two pointers to one node are two arrows into the same node, never two copies of the
  node.
- **Semantic role / token.** `--role-intermediate` for structural/helper pointers
  (parent/child links), `--role-active` for the pointer the algorithm is currently
  following (`current`, `x`).
- **Appropriate animation.** Arrowhead re-targets along a short path; a brief pulse on
  the newly-referenced node.
- **Misleading animations.** Moving the *node* toward the pointer (a reference is not a
  container). Duplicating the node when a second pointer is added (implies a copy, not
  aliasing). Dropping the old arrow instantly with no trace of reassignment.
- **Accessibility.** `current → node(7)` readout; `aria-label` naming source and
  target; distinguish pointer arrows from tree edges by dash pattern + label, not color
  only; reduced motion → arrow snaps to new target.
- **Primary layer.** React/SVG overlay on the structure it references. Pointers are
  relationships between discrete objects.

### 3.4 Tree nodes and edges

- **Pedagogical purpose.** A node holds a key (and metadata such as color); edges
  encode parent/child and the BST order (left < node < right). Structure and order are
  distinct facts.
- **Identity tracking.** A node is **one persistent element with a stable React `key`
  = node identity (not position)**. When the tree reshapes (insert, rotation), the node
  keeps its key and *animates from its old position to its new one*; it is never
  destroyed and recreated. This is the single most important rule for trees: identity
  survives layout.
- **Semantic role / token.** Key/label neutral; node *state* via `--role-active`
  (under inspection), `--role-selected` (learner-chosen); for RB trees the red/black
  bit is intrinsic data — encode it with fill **plus** a `R`/`B` glyph or border
  (non-color-only, see 3.13).
- **Appropriate animation.** Layout transitions: nodes ease to recomputed positions;
  edges follow their endpoints continuously.
- **Misleading animations.** Recomputing the whole layout so every node jumps (destroys
  identity). Fading a node out and a differently-placed node in to represent "the same
  node moved" (reads as replacement).
- **Accessibility.** A parallel textual tree / in-order key list; `aria-label` per node
  `key 8, black, left child of 12`; reduced motion → positions update between discrete
  steps with no tween; focusable nodes for keyboard inspection.
- **Primary layer.** React/SVG. Trees are the canonical discrete structural diagram
  (`KaratsubaTreeDiagram.tsx` already draws SVG nodes/edges from a `src/math`
  `TreeNode`).

### 3.5 Recursive calls

- **Pedagogical purpose.** A problem is solved by solving smaller instances of *the
  same* problem; each call is a self-similar copy at reduced size.
- **Identity tracking.** A child call is a **visibly smaller, same-shaped** instance of
  the parent view, spawned *from* the parent region (grows out of it) so the
  self-similarity is seen, not asserted. The parent remains visible (dimmed) while the
  child runs, so "we are inside a subproblem" is legible.
- **Semantic role / token.** `--role-active` for the call in progress, `--role-pending`
  for spawned-but-not-started children, `--role-done` for returned children.
- **Appropriate animation.** Child call scales/emerges from the parent; on return it
  collapses back into the slot it filled in the parent.
- **Misleading animations.** Presenting all recursive calls **simultaneously** as if
  breadth-first, when execution is **depth-first** (the classic recursion-tree lie —
  see 3.14). Detaching the child so far from the parent that the "same problem, smaller"
  relationship is lost.
- **Accessibility.** Readout `karatsuba(12,13) → calls karatsuba(1,1), karatsuba(2,3),
  karatsuba(3,4)`; depth announced; reduced motion → step through calls discretely.
- **Primary layer.** Motion Canvas for the narrated descent (one call at a time);
  React/SVG for the static recursion-tree summary. Split by purpose: *process* vs
  *structure*.

### 3.6 Pending / active / completed subproblems

- **Pedagogical purpose.** At any instant, work is partitioned into not-yet-started,
  in-progress, and finished. This is the state that makes depth-first order and cost
  accumulation legible.
- **Identity tracking.** A subproblem is **one element that changes state, not three
  different objects**. It moves pending → active → done in place (same node/slot, same
  key), so the learner tracks a single thing through its lifecycle.
- **Semantic role / token.** `--role-pending`, `--role-active`, `--role-done` — the
  core new triad. Each must be distinguishable by shape/pattern too (idle outline /
  focus ring / check glyph).
- **Appropriate animation.** State transition = a fill/pattern change with a short
  pulse; the element does not move merely because its state changed.
- **Misleading animations.** Color-only state change (fails accessibility and reads as
  a different object if paired with a move). Marking children "done" left-to-right in a
  way that implies breadth-first completion when a depth-first walk finished a whole
  left subtree first.
- **Accessibility.** A legend mapping state→meaning with glyphs; per-element
  `aria-label` `subproblem (2×3): done`; live region announces transitions; reduced
  motion → instant state change.
- **Primary layer.** React/SVG (state overlaid on the array/tree/recursion diagram);
  Motion Canvas mirrors it during narration.

### 3.7 Call stacks and return values

- **Pedagogical purpose.** Recursion's control flow is a LIFO stack; a call suspends
  waiting for its child, and a **return value flows back up** to the caller that was
  waiting.
- **Identity tracking.** Each frame is a **persistent labeled card**; pushing adds a
  card on top, popping removes the top card, and the returned value **travels visibly
  from the popped frame into the waiting slot of the frame beneath it**. The waiting
  frame stays in place the whole time.
- **Semantic role / token.** `--role-active` for the top (executing) frame,
  `--role-pending` for suspended frames below, `--role-done` + a moving `--role-temp`
  chip for the return value in transit.
- **Appropriate animation.** Push: card slides in on top. Return: a value chip rises
  from the popped frame and lands in the caller's `result` field; then the frame
  collapses.
- **Misleading animations.** Popping a frame and having the value simply *appear* in the
  caller (breaks the "returns to whoever called" causal link). Showing the stack growing
  downward while narration says "up," or animating frames reordering (a stack is LIFO,
  not a sortable list).
- **Accessibility.** Textual stack `[main → karatsuba(12,13) → karatsuba(2,3)]`; return
  announced `karatsuba(2,3) returned 6`; reduced motion → discrete push/pop; frames
  focusable top-to-bottom.
- **Primary layer.** React/SVG (a DOM column of frame cards) or Motion Canvas for a
  narrated trace. It is discrete structured state, not a coordinate space.

### 3.8 Invariants

- **Pedagogical purpose.** A property that **stays true across every step** (black
  height equal on all paths; the sorted prefix stays sorted; `z_2·B² + z_1·B + z_0`
  always equals the true product). The learner must see it *hold* through change — that
  is what makes an invariant load-bearing.
- **Identity tracking.** Render the invariant as a **persistent readout/annotation that
  is never removed**, updating its displayed measurement each step while its *truth*
  visibly does not change (e.g. a per-path black-height badge that stays equal across
  paths through every rotation).
- **Semantic role / token.** `--role-invariant` (existing) for the conserved-quantity
  annotation; keep it visually distinct from transient highlights.
- **Appropriate animation.** The invariant annotation stays pinned; when a step *could*
  have broken it, briefly flash the check that it still holds ("still equal: 2, 2, 2").
- **Misleading animations.** Hiding the invariant during the messy middle of an
  operation and only re-showing it at the end (the learner never sees it *survive* the
  danger). Animating it as if it changes and then "snaps back" (implies it was violated).
- **Accessibility.** Explicit text `Black height = 2 on all paths (unchanged)`;
  `aria-live` confirmation after risky steps; encode "holds/at-risk" with a glyph, not
  color; reduced motion → static per-step confirmations.
- **Primary layer.** React/SVG annotation layer over the structure, with a Motion Canvas
  restatement during the Watch beat. The invariant is a claim *about* the diagram.

### 3.9 Comparisons

- **Pedagogical purpose.** Many algorithms are driven by pairwise key comparisons; the
  learner must see *which two* elements are compared and *what the outcome directs*.
- **Identity tracking.** Both compared elements keep their positions/keys; the
  comparison is a **transient link/highlight over them**, retired immediately after the
  outcome is used (temporary scaffolding).
- **Semantic role / token.** `--role-compare` for the pair; the outcome may promote one
  element to `--role-active`.
- **Appropriate animation.** A brief connecting bracket or co-highlight, an outcome glyph
  (`<`, `=`, `>`), then fade the comparison mark.
- **Misleading animations.** Leaving stale comparison highlights so several "current"
  pairs pile up (attention scatter). Moving elements *during* the comparison (a compare
  is a read, not a write).
- **Accessibility.** Readout `compare key 7 vs 12 → 7 < 12, go left`; announce outcome;
  glyph carries the result independent of color; reduced motion → static compare card.
- **Primary layer.** React/SVG overlay (comparisons annotate discrete elements); Motion
  Canvas during narrated Watch.

### 3.10 Swaps

- **Pedagogical purpose.** Two elements exchange positions; **both** move and the total
  multiset of values is unchanged (no value is created or lost).
- **Identity tracking.** Each element keeps its identity/label and **travels along a
  visible arc to the other's slot**; the two paths are simultaneous and symmetric so the
  learner sees an exchange, not an overwrite. Keys follow the elements.
- **Semantic role / token.** `--role-compare`/`--role-active` on the swapping pair during
  the move; return to neutral after.
- **Appropriate animation.** Two curved, concurrent trajectories crossing; a short hold
  on the settled result.
- **Misleading animations.** **A swap that looks like a copy** — one value overwriting
  the other, or a single value flying while the other just changes in place (implies
  assignment `a = b`, losing a value). Both elements sliding straight *through* each
  other with no arc so it reads as one pass-through motion.
- **Accessibility.** `swap cell 2 (7) and cell 5 (3)`; announce post-state; elements
  labeled so the exchange is legible without color; reduced motion → instant positional
  exchange with labels intact.
- **Primary layer.** Motion Canvas (the *motion* is the concept) or React/SVG with a
  layout transition; not Mafs.

### 3.11 Rotations

- **Pedagogical purpose.** A BST rotation locally re-roots two nodes to rebalance while
  **preserving in-order order** (the search sequence is unchanged; only shape changes).
- **Identity tracking.** The pivot pair and their three subtrees are **persistent
  elements that re-link and glide to new positions**; each subtree `A, B, C` keeps its
  identity and its left-to-right order. A node that becomes the new local root is the
  *same* node, moved — not a new node.
- **Semantic role / token.** `--role-active` on the pivot pair mid-rotation;
  `--role-intermediate` on the re-linking edges; the invariant readout (3.8) stays
  pinned to show order/black-height survive.
- **Appropriate animation.** Continuous re-parenting: the pivot rises, its child
  descends, the middle subtree `B` re-attaches to the other side, all as one coordinated
  layout transition; pin the in-order key ruler so it visibly never moves.
- **Misleading animations.** **A rotation that looks like nodes teleporting** — nodes
  disappearing and reappearing in new slots. Reordering keys (any animation implying the
  in-order sequence changed is mathematically false). Rotating the *whole subtree as a
  rigid picture* (it is a re-link, not a rigid spin).
- **Accessibility.** `right-rotate at 12: 8 becomes parent of 12; in-order 5,8,10,12,15
  unchanged`; announce that order is preserved; reduced motion → before/after frames with
  the in-order ruler shown in both.
- **Primary layer.** React/SVG (structural re-link with layout transition) with Motion
  Canvas narration; the "in-order ruler never moves" is a structured-diagram device.

### 3.12 Splits and merges

- **Pedagogical purpose.** In the 2–3–4 lens, an overflowing node **splits** (promoting
  its middle key up) and an under-full node **merges** with a sibling. RB recolor/rotation
  *is* a split/merge seen through the binary encoding.
- **Identity tracking.** On a split, the **middle key rises as a persistent element** to
  the parent and the remaining keys stay as the two resulting nodes — keys are relocated,
  not recreated. On a merge, two nodes' keys coalesce into one node whose identity is
  traceable to its parts. Pair with the 2–3–4 ↔ RB split-screen so each side keeps
  matching identities.
- **Semantic role / token.** `--role-active` on the splitting/merging node;
  `--role-token` on the promoted middle key in transit (it behaves like the violation
  token, 3.6/below).
- **Appropriate animation.** Split: the node widens, the middle key detaches and travels
  up to the parent, two child nodes settle; the parallel RB view flips colors / rotates in
  lockstep. Merge: the mirror.
- **Misleading animations.** A split that dissolves the node and draws three fresh nodes
  (destroys identity). Promoting the middle key by fading it out here and in there
  (breaks the "same key moved up" link). Desynchronizing the 2–3–4 and RB views so they
  disagree about which key went where.
- **Accessibility.** `4-node {6,8,10} splits: 8 promoted to parent, {6} and {10} become
  children`; announce the promotion; reduced motion → discrete before/after with the
  promoted key labeled in both.
- **Primary layer.** React/SVG (two synchronized structural diagrams); Motion Canvas for
  the narrated single split.

### 3.13 Recoloring

- **Pedagogical purpose.** Flipping a node's color changes its *2–3–4 membership*, not
  the node itself; a recolor is a split expressed in the color bit. The node stays; its
  role changes.
- **Identity tracking.** The node **keeps its position, key, and element identity**; only
  the color bit and its `R`/`B` glyph change. This is the crux: recoloring must read as
  "same node, new tag," never "new node."
- **Semantic role / token.** Red/black are intrinsic data encoded with fill **plus** a
  `R`/`B` glyph/border (non-color-only, mandatory here); a `--role-active` ring marks the
  node being recolored.
- **Appropriate animation.** In-place fill cross-fade with the glyph swapping and a short
  pulse; the node does not move.
- **Misleading animations.** **Recoloring that looks like node replacement** — fading the
  old-colored node out and a new-colored node in, or the node briefly leaving its slot.
  Changing color *and* position in the same beat so the two effects are confounded (do
  color and structure in separate beats).
- **Accessibility.** `recolor node 8: red → black`; the `R`/`B` glyph makes the state
  legible to color-blind learners and screen readers; `aria-live` announcement; reduced
  motion → instant swap.
- **Primary layer.** React/SVG (a property change on a persistent node); Motion Canvas
  narration for the Watch beat.

### 3.14 Cost accumulation

- **Pedagogical purpose.** Total cost is built up from per-step costs (one multiplication
  per leaf; one compare per node visited); the learner must see the *running total* grow
  and connect it to the asymptotic result (`n^{\log_2 3}` vs `n^2`).
- **Identity tracking.** A **persistent running counter/meter** accumulates; each counted
  event visibly *contributes* to it (a chip flies from the event into the tally), so cost
  is tied to concrete operations rather than asserted at the end.
- **Semantic role / token.** `--role-active` on the event being counted; `--role-done` on
  the accumulated tally; a growth curve uses existing chart tokens.
- **Appropriate animation.** Increment-on-event with a brief highlight linking event →
  counter; optionally a Mafs cost curve where `n` drives `3^{levels}` vs `4^{levels}`.
- **Misleading animations.** Showing the final count with no per-event contribution (cost
  looks magical). Implying every node costs the same when only *leaves* multiply (label
  what is counted). A "25% faster" framing — it is an **exponent change**, not a constant
  factor (already flagged in the Karatsuba scene).
- **Accessibility.** Readout `multiplications so far: 6`; final `3 (Karatsuba) vs 4
  (naive)`; the curve has a text takeaway (per the Mafs "conclusion in text" rule);
  reduced motion → counter updates per discrete step.
- **Primary layer.** React/SVG for the counter over a structure; **Mafs** for the cost
  *curve* (a genuine continuous coordinate space — the right use of Mafs for algorithms).

### 3.15 Recursion trees

- **Pedagogical purpose.** The shape of the recursion (branching factor, depth) determines
  total leaf work; branch-4 → `n²` leaves, branch-3 → `n^{\log_2 3}`. The tree is a
  *summary of structure*, not a literal execution timeline.
- **Identity tracking.** Nodes are laid out by `recursionTree(branch, depth)` from
  `src/math`; each subtree keeps a stable position keyed by its path (`r-0-1`), so
  toggling depth/`n` transitions layout rather than reshuffling. Leaf-count readouts trace
  to the same math (`leafCount`, `multiplicationCount`).
- **Semantic role / token.** Distinguish the two branch factors by pattern + label
  (branch-4 vs branch-3), not color alone (as `KaratsubaTreeDiagram` does with an edge
  modifier class); `--role-active` if animating a depth-first walk over it.
- **Appropriate animation.** Mostly **static** — a recursion tree is often clearer as a
  still diagram (per the animation-quality-bar "still image if clearer" gate). If
  animated, walk it **depth-first** to match execution.
- **Misleading animations.** **A recursion tree that implies breadth-first timing when
  execution is depth-first** — lighting up an entire level at once suggests all siblings
  run together. Presenting the conceptual asymptotic tree as the *literal* call tree of a
  specific input (the code explicitly captions "models asymptotic branching — not the
  literal call tree"; preserve that honesty).
- **Accessibility.** Per-figure caption and `aria-label` (`Branch-3 conceptual tree`);
  leaf counts in text (`leaves at depth 3: 27`); reduced motion → static tree; controls
  (depth, `n`) are labeled selects.
- **Primary layer.** React/SVG. Discrete, structural, already implemented this way in
  `KaratsubaTreeDiagram.tsx`.

### 3.16 Object identity through structural changes

- **Pedagogical purpose.** Across rotations, splits, recolors, and reparenting, a given
  node/value **remains the same entity**; understanding "what happened" depends on
  tracking it. This is the algorithm-side of the linear-algebra object-continuity rule.
- **Identity tracking.** Use a **stable identity key that is independent of position**
  (node id, element id) as the React `key` / Motion Canvas node handle; drive every
  structural change through **layout transitions** so the element eases from old to new
  position. Never key by array index or screen slot when the thing that persists is the
  *element*.
- **Semantic role / token.** Identity is carried by **stable label + stable color/role**,
  not by position; keep an element's role token constant unless its *meaning* genuinely
  changes.
- **Appropriate animation.** Continuous position/parent transitions; a "same object"
  highlight can trace one element through a multi-step operation.
- **Misleading animations.** Destroy-and-recreate on every structural step (the universal
  identity killer). Reusing a slot/key for a different element between steps (the learner
  thinks it is the same object when it is not).
- **Accessibility.** Consistent naming in readouts (`node 8` stays `node 8` throughout);
  announce moves as moves (`node 8 moved up`), not as new nodes; reduced motion still
  preserves identity via consistent labels across discrete frames.
- **Primary layer.** Cross-cutting; enforced wherever a structure changes (React/SVG keys,
  Motion Canvas node reuse). Not a layer of its own — a discipline applied in all of them.

### 3.17 Temporary values versus persistent objects

- **Pedagogical purpose.** Distinguish scratch/intermediate values (a carry, a `temp` in a
  swap, an un-normalized coefficient `z_1`) from durable objects (a stored key, a settled
  digit). Temporaries appear, do a job, and are discarded.
- **Identity tracking.** A temporary is **visibly marked as transient** (dashed outline /
  ghost fill, `--role-temp`) and is **explicitly removed** once consumed — it never
  silently becomes a persistent object. When a temporary *is promoted* to persistent
  (carry lands as a real digit; `z_1` normalizes into a block), animate a clear
  transition from temp styling to persistent styling so the promotion is seen.
- **Semantic role / token.** `--role-temp` (proposed) for scratch values, styled ghost/
  dashed (consistent with the existing "ghost/fade copies as scaffolding" convention);
  persistent objects use their normal role.
- **Appropriate animation.** Temp fades in as ghost, does its job, fades out; a promoted
  temp morphs from ghost to solid in place.
- **Misleading animations.** A temporary rendered identically to persistent state (learner
  can't tell what survives). A carry that "teleports" into the next place with no visible
  temp→persistent transition (this is exactly the Karatsuba normalization
  `(35,82,48)→(35,86,8)→(43,6,8)` — each carry must read as a temporary overflow becoming a
  settled digit).
- **Accessibility.** Label temporaries as such (`carry (temp) = 1`); announce
  creation/consumption; distinguish temp via pattern + label, not color; reduced motion →
  discrete temp appears/consumed steps.
- **Primary layer.** React/SVG or Motion Canvas depending on whether it is a static readout
  or a narrated flow; both must use the temp styling convention.

---

## 4. Worked example A — Karatsuba multiplication

Which primitives the Karatsuba lesson draws from, mapped to existing code
(`karatsuba.ts`, `karatsubaCrossTermsScene.ts`, `KaratsubaExplorer.tsx`,
`KaratsubaTreeDiagram.tsx`):

| Primitive | Use in Karatsuba |
| --- | --- |
| **Values/variables (3.1)** | digits `A, B, C, D`; coefficients `z_2, z_1, z_0`; each a labeled readout field (`karatsuba-coeffs`). |
| **Area/geometry (lesson-specific, see §6)** | the two rectangles — weighted multiplication rectangle (`10A+B` × `10C+D`) and auxiliary coefficient rectangle (`A+B` × `C+D`); FOIL subrectangles `AC, AD, BC, BD`. Continuous → Mafs (`RegionRect`) and Motion Canvas `Line` regions. |
| **Splits (3.12, as digit split)** | splitting each operand at place `m` into high/low; the vertical/horizontal cuts of the rectangle. |
| **Cost accumulation (3.14)** | three products vs four; the `n^{\log_2 3}` vs `n²` growth; explicitly an *exponent* change, not "25% faster." |
| **Recursion trees (3.15)** | branch-3 vs branch-4 conceptual trees from `recursionTree`; leaf counts from `leafCount`/`multiplicationCount`; captioned as asymptotic, not a literal trace. |
| **Recursive calls (3.5)** | each multiplication spawns three half-size multiplications; narrated depth-first if animated. |
| **Pending/active/done (3.6)** | the three subproblems `AC`, `BD`, `(A+B)(C+D)` as they are computed and returned. |
| **Temporary→persistent (3.17)** | carrying: `z_i` may overflow a block; the normalization pass `(35,82,48)→(35,86,8)→(43,6,8)` turns temporary overflow into settled digits — kept distinct from operand-width growth (padding, *not* a fourth multiply). |
| **Call stacks / return values (3.7)** | the recursive descent returning products up to the caller (for a "trace the recursion" beat). |
| **Invariant (3.8)** | `100·z_2 + 10·z_1 + z_0` equals the true product at every stage — the reconstruction identity holds throughout. |

The Karatsuba lesson is unusual in leaning on **Mafs/geometry** because the insight is
genuinely an *area* argument; most algorithm lessons will lean structural (§5).

---

## 5. Worked example B — red-black-tree insertion

Which primitives the RB-insertion lesson draws from (grounded in
[courses/data-structures/lessons/red-black-trees/insight-brief.md](../courses/data-structures/lessons/red-black-trees/insight-brief.md), primary insight
C1: RB = binary-encoded 2–3–4 tree):

| Primitive | Use in RB insertion |
| --- | --- |
| **Tree nodes/edges (3.4)** | the BST/RB structure; nodes carry a key + color bit encoded with fill **and** an `R`/`B` glyph. |
| **Pointers/references (3.3)** | `current`, `parent`, `uncle`, `grandparent` as re-targeting arrows during repair. |
| **Recoloring (3.13)** | flip parent/uncle/grandparent colors = a 2–3–4 split expressed in the color bit; must read as "same node, new tag." |
| **Rotations (3.11)** | the terminal reshape when reds are mis-oriented; preserves in-order order (pin the in-order ruler). |
| **Splits/merges (3.12)** | the 2–3–4 lens: an overflowing 4-node splits, promoting its middle key; shown in a 2–3–4 ↔ RB split-screen. |
| **Invariant (3.8)** | **black height** equal on all paths, conserved by every rotation and raised uniformly by a root split — the pinned conserved-quantity readout. |
| **Violation token (3.6 / `--role-token`)** | the "double red" rendered as a glowing token that a recolor **slides one level up** toward the root and a rotation "cashes in." |
| **Object identity (3.16)** | a node keeps its identity through a rotation — it becomes the new local root but is the *same* node, moved, never recreated. |
| **Comparisons (3.9)** | the BST descent to the insertion point (`key < node`, go left). |
| **Cost accumulation (3.14)** | `O(1)` rotations vs `O(log n)` recolorings per insert (a rotations-vs-recolorings counter). |

The RB lesson is the **structural archetype**: almost everything lives in React/SVG
synchronized diagrams, with Motion Canvas narrating a single repair and Mafs only if a
cost/height curve is shown.

---

## 6. Reusable vs lesson-specific primitives

The point of this doc is a **shared** language. Some primitives genuinely recur across
unrelated algorithms; others are specific to a problem family and should *not* be forced
elsewhere.

### Reusable across both worked examples (and beyond)

| Primitive | Why it generalizes |
| --- | --- |
| **Recursion trees (3.15)** | any divide-and-conquer: the branching-factor→exponent story is identical for Karatsuba, RB (2–3–4 depth), mergesort, FFT. |
| **Cost accumulation (3.14)** | every algorithm has a cost model; the "events contribute to a running total, connect to asymptotics" device is universal. |
| **Nodes/edges (3.4)** | trees, graphs, and any linked structure share the persistent-node + layout-transition idiom. |
| **Invariants (3.8)** | conserved quantities (black height, reconstruction identity, sorted prefix, loop invariants) are a cross-cutting reasoning tool. |
| **Object identity (3.16)** | required by *every* structural mutation; the single most transferable discipline. |
| **Pending/active/done (3.6)** | the state triad applies to any staged/worklist/recursive process. |
| **Temporary vs persistent (3.17)** | carries, `temp` swaps, scratch accumulators appear everywhere; the "mark transient, show promotion" rule is general. |
| **Values/variables (3.1), pointers (3.3), comparisons (3.9), swaps (3.10), call stack (3.7)** | the primitive vocabulary of imperative/recursive algorithms generally. |

Reasoning: these are tied to *computation itself* (recursion, cost, mutation, state,
invariants), not to any one problem's mathematics, so building them once (shared React/SVG
components + `src/math` traces) pays off across the whole algorithms track.

### Keep lesson-specific (do not generalize)

| Primitive | Belongs to | Why not shared |
| --- | --- | --- |
| **Area / FOIL rectangles** | Karatsuba / geometry & positional arithmetic | the two-rectangle argument is an *area* model of place value; it has no meaning for tree balancing or sorting. Reusing it elsewhere would be a false metaphor. |
| **Digit-carry normalization (3.17 instance)** | positional arithmetic (Karatsuba, big-int add/mul) | carrying is specific to base-`B` place value; the *general* temp→persistent primitive is shared, but the digit-carry *visualization* is not. |
| **Recoloring & rotations (3.11, 3.13)** | RB / BST / balanced-tree family | color bits and in-order-preserving re-links are specific to the BST-rotation family (AVL, splay, treaps share rotations; only RB-like trees share recoloring). Meaningless for arithmetic. |
| **2–3–4 split-screen encoding (3.12 instance)** | RB trees (and B-tree family) | the specific "encode a fat node in binary with a tag bit" pairing is an RB/B-tree device, not a general split/merge. |

Reasoning: these encode the *specific mathematics* of one problem family. Sharing them
would either mislead (an area rectangle implies geometry where there is none) or add
machinery a lesson can't honestly use. The rule mirrors the animation-quality-bar's
"reusable vs topic-specific" split (e.g. the deforming grid is reusable *within* linear
algebra but is not a general algorithm primitive).

> **Boundary test for "is this reusable?"** A primitive is reusable if its *pedagogical
> job* (track identity, accumulate cost, hold an invariant) is stated without reference to
> a specific problem's math. If describing it requires "digits," "place value," "color
> bit," or "in-order," it is lesson-specific — expose it only in that lesson's components,
> not the shared kit.

---

## 7. Adoption notes (non-binding)

- Add the proposed `--role-*` state tokens (§2) to `src/styles/tokens.css` when the first
  algorithm lesson lands; tune them on the dark canvas like the existing math roles.
- Put shared structural components (array, tree, call-stack, cost-counter) in
  `src/components/lesson/` or `src/explorations/`, driven by `src/math` step traces —
  never reimplementing the algorithm in the view (per the math-correctness rule).
- Every corrected algorithm-visualization bug still gets a regression test and an
  `quality/known-failure-modes.md` entry, exactly as for the linear-algebra visuals.
- Score algorithm clips with the existing [clip-quality rubric](../authoring/animation-quality-bar.md#12-clip-quality-rubric);
  "object continuity" and "mathematical honesty" remain correctness-critical (a swap that
  reads as a copy, or a breadth-first recursion tree, fails honesty).
