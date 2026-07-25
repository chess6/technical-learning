# Insight Discovery Brief — Binary Search Trees

Stage 1 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md).
Breadth then triage: generate widely, cluster, rank three, and hand the winner to
Stage 2. Deliberately lean — Stage 1 should cost less than the insight quality
justifies.

**Anti-anchoring note.** This lesson exists because
[red-black-trees](../red-black-trees/insight.md) needs it as a prerequisite. That
is a *scheduling* fact, not an insight hypothesis. The red-black lesson's own
insight (the 2–3–4 encoding) is therefore treated here as an **inherited
hypothesis about what matters**, and is not allowed to preselect this lesson's
winner — candidates that serve a different purpose (validity, deletion, sorting
lower bounds) were generated and ranked on equal terms, and one of them (B)
placed second on merit rather than on convenience to the sequel.

---

## 1a. Cognitive obstacle

Binary search trees are not *hard to follow* — they are hard to find a **purpose**
for. The conventional presentation states a local rule ("left subtree smaller,
right subtree larger") and a procedure ("compare and descend"), both of which a
learner can execute immediately and neither of which says what the tree *is* or
why anyone built one.

**Named obstacles:** **missing purpose** (primary) and **missing mathematical
structure** (secondary — the learner has no object of which the tree is a
representation, so shape looks incidental). A distant third is an **incorrect
prior mental model**: "a BST is a sorted container", which predicts that all BSTs
on the same keys are interchangeable and that shape is cosmetic.

Because the difficulty is one of *purpose and representation* rather than
technical complexity, [Stage 1c](#1c-conventional-vs-alternative-presentation) is
triggered.

---

## 1b. Raw leads (before → after · new capability · mechanism)

| # | Before → after model change | New predicted capability | Mechanism |
| --- | --- | --- | --- |
| L1 | "A tree that happens to be sorted" → "the decision tree of binary search, stored in pointers" | Predict the comparison count from the picture, without tracing | representational change |
| L2 | "Insertion order is a detail" → "insertion order *chooses which* decision tree you get" | Predict that sorted input degenerates to a list | predictive/causal reorganization |
| L3 | "Height is a property of the tree" → "height *is* the cost, in comparisons" | Read cost off shape; say why balance is worth paying for | structural compression |
| L4 | "Different BSTs on the same keys are different objects" → "same sorted sequence, different bracketing" | Predict that in-order traversal is invariant under reshaping | structural compression |
| L5 | "Rotations rearrange the data" → "rotations change the bracketing, never the sequence" | Predict that a rotation is safe before knowing its rule | operational grounding |
| L6 | "left < node < right is a local rule" → "each position carries an inherited open interval $(lo,hi)$" | Correctly reject a tree that satisfies every parent–child pair but is invalid | semantic grounding |
| L7 | "Search skips nodes arbitrarily" → "each comparison halves an interval of *keys*, not of *positions*" | Explain why an unbalanced tree halves badly | representational change |
| L8 | "Deletion's two-child case needs a rule" → "the in-order successor is the only key that can take the slot" | Derive the deletion case instead of recalling it | structural compression |
| L9 | "A sorted array is simpler, so why a tree?" → "the array wins on search and loses on insert; the tree stores the *midpoints* so it need not shift" | Choose the structure from the workload | contrast |
| L10 | "Trees are recursive because code is" → "the tree *is* the recursion; each subtree is the same problem on a sub-interval" | Write search/insert recursively without a template | structural compression |
| L11 | "Traversal orders are three arbitrary variants" → "in-order is the one that respects the invariant; the others ignore it" | Say which traversal answers which question | counterexample/contrast |
| L12 | "Comparison counting is bookkeeping" → "a comparison tree with $n$ leaves has height $\ge \log_2 n$ — the same argument that bounds sorting" | Recognise the same bound in a new setting | mathematical reorganization |

---

## Candidate clustering

Twelve leads, four genuinely distinct central model changes. Supporting material
(L3, L7, L10, L12) legitimately serves more than one package and is **not** forced
into a disjoint partition.

- **Package A — "The tree is binary search, materialized."** Leads L1, L2, L3, L7,
  L9, L10, L12. Core model change: the BST is not a container that happens to be
  ordered; it is the **decision process of binary search frozen into pointers**, so
  the midpoints are stored instead of recomputed.
- **Package B — "Shape is free; the sequence is fixed."** Leads L4, L5, L11. Core
  model change: every BST on a key set reads out the **same** sorted sequence; the
  shape is the only free variable, which is exactly what a reshaping operation may
  change.
- **Package C — "Legality is an inherited interval, not a local comparison."**
  Leads L6, L11. Core model change: a node's legal key range is dictated by the
  whole path above it, not by its parent alone.
- **Package D — "Deletion is forced by the ordering."** Lead L8. Core model change:
  the two-child case has exactly one legal replacement, so the rule is derivable.

Only A, B, and C are genuine rivals — D is a consequence of the ordering invariant
rather than a competing model of what a BST *is*, and is recorded as a supporting
result rather than promoted to a fourth package.

---

## 1c. Conventional vs alternative presentation

| | Conventional | Alternative (Package A) |
| --- | --- | --- |
| Opens with | "A BST is a binary tree such that for every node, all left keys < key < all right keys." | Binary search running on a **sorted array**, with the midpoints it probes circled. |
| Then | search / insert / delete procedures | those circled midpoints are **lifted out and wired together** — the picture that appears *is* the tree |
| Shape is | a property you observe afterwards | the thing you were building all along |
| Cost is | asserted as $O(\log n)$ "if balanced" | read off the picture: one comparison per level |

**Mathematical relations preserved.** Identical: the ordering invariant, the
comparison sequence for any given key, and the search cost as the number of
levels descended. The alternative changes the *order of discovery*, not the
mathematics — it derives the invariant from the construction instead of asserting
it first.

**What becomes easier to infer.** Why the shape determines the cost; why sorted
insertion order is catastrophic (you rebuild the *linear* search's decision tree);
why in-order traversal returns sorted keys (it walks the intervals left to right);
why the next lesson wants to *force* the shape.

**Meaningful background introduced.** Binary search on a sorted array — a
procedure the learner already trusts. No manufactured real-world analogy: the
bridge is a piece of mathematics the learner already owns, not a themed story.

**Transfer likelihood.** High. "Materialize a computation as a structure so its
intermediate results need not be recomputed" is the same move as memoization,
tries, and — immediately next — red-black trees.

---

## 1d. Ranked packages

Criteria: (1) surprise/inevitability, (2) compression, (3) transfer, (4)
correctness *(gate)*, (5) interactive teachability, (6) prerequisite fit, (7)
semantic/cognitive leverage, (8) abstraction return.

### #1 — Package A: the tree is binary search, materialized

- **(1)** Genuine: the tree is *constructed* in front of the learner out of a
  procedure they already know, so its existence stops being arbitrary.
- **(2)** High. One idea absorbs: why the invariant holds, why height is the cost,
  why insertion order matters, why in-order traversal sorts, and why balancing is
  the obvious sequel.
- **(3)** High. Exact to AVL / red-black / B-trees; architectural to memoization
  and tries.
- **(4)** Exact. The correspondence is a real one: for a *balanced* tree, search's
  comparison sequence coincides with binary search's. **Guardrail:** the
  correspondence is with the *decision tree of a binary search*, not with any one
  fixed array — an arbitrary BST's probes need not be array midpoints. Stage 2 must
  state this or the analogy overclaims.
- **(5)** High: the split-screen array→tree lift is a natural guided scene, and the
  degeneration demo (insert sorted keys) is one control.
- **(6)** Excellent — requires only arrays, ordering, and binary search.
- **(7)** High: supplies the missing *purpose*, which 1a named as the obstacle.
- **(8)** Strong: return via the height/comparison bound for arbitrary $n$ (L12).

**What could have made it lose.** If the guardrail in (4) could not be stated
cleanly — i.e. if "the tree is binary search" were only true for balanced trees and
misleading otherwise — the package would have failed criterion 4 and B would have
taken #1. It survives because the honest statement ("the tree is *a* binary
search's decision tree; which one depends on insertion order") is *more* useful
than the sloppy one: it is exactly what makes L2 predictable.

### #2 — Package B: shape is free, the sequence is fixed

- Strong compression (L4/L5) and the cleanest possible bridge to rotations, hence
  to the red-black lesson. Correctness exact.
- Loses on **(1)** and **(7)**: it answers *"what may I change?"* before the
  learner has a reason to want to change anything. It presupposes the purpose that
  A supplies. Ranked as the **primary supporting insight**, taught inside this
  lesson and reactivated by the sequel.

### #3 — Package C: legality is an inherited interval

- Best-in-class misconception killer (the classic "validate a BST" bug) and
  exactly right for **(4)**.
- Narrower on **(2)** and **(3)**: it sharpens the invariant rather than explaining
  why the object exists. Ranked as the **second supporting insight**, staged as an
  elicit→confront→resolve event rather than as the lesson's spine.

---

## Discovery sequence for Package A (discover, don't tell)

1. Run binary search on a sorted 7-element array; circle each probed midpoint.
2. Search a **second** key; circle those probes. Notice the first probe repeats.
3. Lift the circled midpoints out of the array and connect each probe to the two
   it can lead to. *The learner has drawn a BST without being told what one is.*
4. Read the local rule off the drawing — it was not assumed, it fell out.
5. Insert keys in **sorted** order into an empty tree. Watch the same construction
   produce a chain, and count comparisons.
6. **Exit test (predict, not recall):** given an unfamiliar key set and two
   insertion orders, predict *which* order gives the shorter search and *how many
   comparisons* the worst case takes — before running either.

---

## Rejected as non-insights

- "A BST is like a family tree / an org chart" — a themed relabel with no
  preserved mathematical relation. Semantic leverage **0**.
- "Recursion is elegant here" — an aesthetic claim, not a model change.
- "Trees are used in databases" — motivation by assertion; teaches nothing about
  the object.
- "Left is smaller, right is bigger" — the definition, restated. The baseline to
  beat, not a candidate.

---

## Stage 1 result

**PASS — advance to Stage 2** with **Package A** as the primary candidate, and
**B** and **C** recorded as supporting insights. A is a genuine model-changing
insight, correctly stateable with its guardrail, teachable from arrays + binary
search alone, ranked #1 with a discovery sequence ending in a predict-not-recall
exit test, and it carries a credible abstraction return.
