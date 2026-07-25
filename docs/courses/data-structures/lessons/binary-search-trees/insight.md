# Approved Insight Contract — Binary Search Trees

Stage 2 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md).
Selects one primary insight from the [Stage 1 brief](insight-brief.md), proves its
chain end to end, and runs both audits.

Primary insight selected: **Package A** — a binary search tree *is* the decision
tree of a binary search, materialized in pointers. **B** (all BSTs on a key set
read out the same sorted sequence; shape is the only free variable) and **C**
(legality is an inherited interval, not a parent–child comparison) are recorded as
supporting insights and are taught inside this lesson.

The audit below **corrected the primary insight's statement in one important way**:
the naive form *"a BST is binary search"* is false for an arbitrary tree, since an
arbitrary BST's probes need not be array midpoints. The corrected form — *a BST is
**a** comparison-decision tree over the key set, and which one you get is chosen by
the insertion order* — is both true and strictly more useful, because it is exactly
what makes degeneration predictable.

**Cost convention (fixed for this contract).** Cost is counted in **key
comparisons**, and the **height** of a tree is its number of *edges* on the longest
root→leaf path, so a single node has height 0. A search that ends at depth $d$
performs $d+1$ comparisons. Every claim below uses this one convention.

---

## Primary insight (required contents 1–14)

### 1. Diagnosed cognitive obstacle

**Missing purpose** (primary) and **missing mathematical structure** (secondary):
the conventional presentation asserts a local ordering rule and a descent
procedure, both immediately executable, neither of which says what the object *is*
or why it was built. Shape therefore looks incidental — the seed of the false
belief that all BSTs on the same keys are interchangeable.

### 2. Insight mechanism(s)

**Representational change** (primary — a procedure becomes a structure) and
**structural compression** (one reframing absorbs the invariant, the cost model,
the degeneration case, and the traversal fact). A **semantic/operational bridge**
is used (binary search on a sorted array), so items 12–14 and Audit B's grounding
checks apply.

### 3. Initial mental model

"A BST is a container that keeps its items sorted, with a rule saying smaller
things go left. You search it by comparing and going down. Different-looking trees
holding the same keys are basically the same thing."

### 4. Tension / redundancy

That model cannot explain **why the shape matters**. It predicts that inserting the
same keys in any order gives equivalent structures — and then the learner inserts
`1,2,3,4,5,6,7`, gets a chain, and has no account of what went wrong beyond "it
became unbalanced", which restates the observation. It also cannot say why the
ordering rule is *that* rule: "smaller left" is arbitrary until something explains
what the descent is *for*.

### 5. The model change

A binary search tree is not a sorted container. It is **a comparison-decision
process, stored**.

Binary search on a sorted array repeatedly probes a midpoint and discards half the
remaining interval. Those probes form a tree: each probe has two possible
successors, one per comparison outcome. Lift the probes out of the array, wire each
to its two successors, and the picture you have drawn **is** a binary search tree —
built without anyone stating the ordering rule, which then falls out of the
construction rather than being assumed.

What the learner now believes instead: *the tree is a materialized sequence of
decisions; its shape is the decision procedure; its height is the number of
comparisons that procedure costs; and the insertion order is what selects which
decision procedure you built.*

### 6. Full causal chain (no missing steps)

Let $K = \{k_1 < k_2 < \dots < k_n\}$ be the key set.

- **A search tree is a decision tree over $K$.** Position a node $x$ in a binary
  tree. Reaching $x$ means a specific sequence of "go left"/"go right" answers was
  given. Each answer eliminates a contiguous block of $K$: going left from a node
  with key $v$ eliminates every key $> v$; going right eliminates every key $< v$.
  So the set of keys still reachable at $x$ is an **interval** of $K$ — this is
  supporting insight **C**, and it is forced, not assumed.
- **The ordering invariant is the condition that the decision tree is *correct*.**
  A descent is a valid search procedure exactly when, for every node, every key in
  its left subtree is smaller and every key in its right subtree is larger — because
  otherwise a comparison would discard a block containing the sought key. The
  "left < node < right" rule is therefore not a definition imposed on a container;
  it is the **correctness condition of the decision procedure**.
- **In-order traversal reads the intervals left to right.** Each node's interval is
  split by its key into the left child's interval, the key itself, and the right
  child's interval. Reading left subtree → node → right subtree therefore emits
  $K$ in increasing order, for **every** legal shape. Hence supporting insight
  **B**: all BSTs over $K$ have the same in-order sequence, and shape is the only
  free variable.
- **Cost is depth, exactly.** A search for a key at depth $d$ performs $d+1$
  comparisons (convention above), because each node on the path contributes exactly
  one comparison. Worst-case search cost is therefore $h+1$ where $h$ is the
  height. **Cost is not correlated with shape; it *is* shape.**
- **Insertion order selects the shape.** Insert-at-leaf places each new key at the
  position its own search reaches. Inserting $K$ in **increasing** order therefore
  makes every key larger than all its predecessors, so every insertion descends to
  the rightmost leaf: the result is a right chain of height $n-1$ — precisely the
  decision tree of **linear** search. Inserting the median first, then the medians
  of each half, and so on, produces the balanced decision tree of **binary** search.
  *Same keys, same invariant, different procedure stored.*
- **The achievable range of heights is bounded on both sides.** A binary tree with
  $n$ nodes has at most $2^{d}$ nodes at depth $d$, so
  $n \le 2^{h+1}-1$, giving $h \ge \lceil \log_2(n+1)\rceil - 1$; and a chain
  achieves $h = n-1$. Hence for every $n$ the height ranges over
  $\lceil \log_2(n+1)\rceil - 1 \le h \le n-1$, and **both ends are attained** —
  the lower by the balanced construction above, the upper by sorted insertion.
- **Therefore the next question is forced.** Search cost is $h+1$; $h$ is chosen by
  an insertion order the data, not the programmer, controls. Either accept the
  worst case, or **force the shape** — which is the sequel
  ([red-black-trees](../red-black-trees/insight.md)).

No step is asserted: the interval structure forces the invariant, the invariant
forces the traversal fact, the path length forces the cost, and the insert rule
forces the degeneration.

### 7. Minimal formal derivation

**Claim (height lower bound).** A binary tree with $n \ge 1$ nodes has height
$h \ge \lceil \log_2(n+1) \rceil - 1$.

*Proof.* At depth $d$ a binary tree has at most $2^{d}$ nodes (induction on $d$:
depth 0 has one node; each node at depth $d$ has at most two children at depth
$d+1$). Summing over the depths present,
$$n \;\le\; \sum_{d=0}^{h} 2^{d} \;=\; 2^{h+1} - 1 .$$
Hence $2^{h+1} \ge n+1$, so $h+1 \ge \log_2(n+1)$ and, as $h$ is an integer,
$h \ge \lceil \log_2(n+1)\rceil - 1$. ∎

**Corollary (cost).** Worst-case search cost is $h+1 \ge \lceil\log_2(n+1)\rceil$
comparisons, attained by the balanced construction; and $h+1 = n$ for the chain
produced by sorted insertion. The gap between the two is the entire motivation for
balancing.

### 8. Equivalence to the original object

The "original object" is the **binary search procedure** on the sorted sequence.

- **Same answers.** For any key, the search that descends the tree and the binary
  search that probes the array return the same result — both are correct decision
  procedures over the same ordered $K$, and correctness is exactly the ordering
  invariant (chain, step 2).
- **Same comparison sequence — but only for the balanced tree, and this is the
  normalization that is *not* hidden.** A general BST's probes are the midpoints of
  *its own* subtrees, which coincide with the array's midpoints **only when the
  tree is the balanced one**. The honest statement is: the array's binary search is
  **one** member of the family of comparison-decision trees over $K$; a BST is
  **another** member; the tree stores whichever member its insertion order built.
  Nothing is smuggled — the general claim is about the *family*, and the
  probe-for-probe identity is claimed only for the balanced member.
- **What the tree buys.** The array must shift $O(n)$ elements to insert; the tree
  stores the midpoints as pointers, so an insertion re-uses the existing decisions
  and adds one leaf. That is the actual trade, and it is a trade, not a free win
  (see item 9).

### 9. Cost / model change (stated precisely)

- **Proven here (sufficiency + a real lower bound).** Search cost is exactly $h+1$
  comparisons; $h \ge \lceil\log_2(n+1)\rceil - 1$ for *every* binary tree
  (item 7 — a genuine lower bound on height, not a construction); and $h = n-1$ is
  attained. So the *unqualified* claim "BST search is $O(\log n)$" is **false**, and
  the lesson says so: it is $O(\log n)$ **only** under a balance assumption this
  lesson does not provide.
- **The trade against a sorted array.** Array: search $\Theta(\log n)$, insert
  $\Theta(n)$ (shifting). BST: search $\Theta(h)$, insert $\Theta(h)$ — better on
  insert, worse and *unguaranteed* on search. The tree is not strictly better; it
  moves the cost.
- **Not claimed.** That BSTs are optimal; any average-case result over random
  insertion orders (true, but a different argument — noted as enrichment only);
  anything about deletion's effect on shape.

### 10. What the learner can predict afterward

- **Predict the shape from the insertion order, and the cost from the shape** —
  given an unfamiliar key set and two orders, say which yields the shorter
  worst-case search and how many comparisons it takes, *before* building either.
- **Predict that in-order traversal is invariant** under any reshaping that
  preserves the invariant — hence that a "rotation" is safe before its rule is
  given (supporting insight B; the direct hand-off to the sequel).
- **Reject an invalid tree that passes every parent–child check**, by carrying the
  inherited interval down (supporting insight C).
- **Say why the sequel exists**: cost is height, height is chosen by data, so a
  structure that *forces* height is the next thing to want.

### 11. Transfer assessment

- **Red–black / AVL / B-trees** — *exact*: same decision-tree object, with a policy
  that constrains the shape. This lesson supplies their entire motivation.
- **Binary search on a sorted array** — *exact*, in the reverse direction: the array
  procedure is the balanced member of the same family.
- **Memoization / tries / DP tables** — *architectural*: materialize a computation's
  intermediate decisions so they need not be recomputed. Same move, different
  structure.
- **Comparison-sorting lower bound** — *architectural*: the same "a binary tree of
  height $h$ has at most $2^{h+1}-1$ nodes" counting argument bounds decision trees
  in a different setting. Named as a connection, **not** derived here.

### 12. Semantic / operational bridge

**The bridge is binary search on a sorted array** — a procedure the learner already
owns and already trusts.

Why it makes the inference natural: it supplies the *goal* the conventional
presentation omits. The learner is not asked "here is a rule, obey it"; they are
asked "you already do this — where do the midpoints go so you don't recompute
them?" The ordering invariant then arrives as the answer to a question they are
holding, and shape arrives as the thing they built rather than a property they
observe.

This clears the [semantic-leverage criterion](../../../../authoring/insight-discovery-gate.md#semantic-leverage-criterion)
on two counts: it reveals **why the concept exists**, and it makes the **relevant
reasoning available** (cost = depth) rather than merely renaming vocabulary.

### 13. Preserved correspondences & analogy limits

| Maps **exactly** | The bridge **adds** — named, then discarded |
| --- | --- |
| The ordering invariant ⇔ correctness of the decision procedure | **A fixed array layout.** An array has positions and contiguous memory; a BST has neither. Discard any intuition about "the middle element" being physically central. |
| One comparison per level; search cost = depth + 1 | **Exact midpoints.** Binary search always probes the *median* of the live interval; a BST probes whatever its insertion order put there. Discard "the root is the median" — it is true only of the balanced member. |
| The live candidate set is always an interval of $K$ | **A static key set.** The array procedure assumes $K$ is fixed; the tree exists precisely to let $K$ change. Discard "the structure is decided in advance". |
| Halving the interval ⇔ descending one level | **Guaranteed halving.** The array halves by construction; the tree halves only if balanced. Discard "descending a level halves the problem" — this is the single most important discard, and it is exactly what makes degeneration predictable rather than surprising. |

The lesson names each addition at the moment it could mislead, and the fourth is
staged as an explicit misconception confrontation.

### 14. Abstraction return

| Step | Where | How a learner who only learned the story is detected |
| --- | --- | --- |
| **Grounded case** | Binary search probes circled on a 7-element array | — |
| **Explicit structural correspondence** | The lift: probes → nodes, outcomes → edges; the invariant read *off* the drawing | Asked *why* left-smaller is required, they must cite discarding the wrong block, not "that's the rule" |
| **Unfamiliar case** | An unbalanced tree whose root is **not** the median, and an insertion order that degenerates it | A story-only learner predicts $\log n$ regardless, because "trees halve"; the discard in item 13 is what they failed to make |
| **Symbolic case** | The height bound $h \ge \lceil\log_2(n+1)\rceil - 1$ for arbitrary $n$, and the cost statement $h+1$ | A story-only learner cannot state the bound for general $n$, only recite "$\log n$" |

The exit test is deliberately the **unfamiliar + symbolic** pair, not the familiar
array: predict the worst-case comparison count for a given insertion order on an
unseen key set.

### Prerequisites, limitations, likely misconceptions

- **Prerequisites:** arrays and total ordering; binary search on a sorted array;
  $\log_2$ and elementary big-O; simple induction (used once, in item 7).
- **Limitations:** the lesson proves the height *lower* bound and the exact cost
  model, and demonstrates both extremes — it does **not** provide any mechanism to
  guarantee balance (that is the sequel), does not treat deletion's effect on
  shape, and states the average-case-over-random-orders result only as enrichment.
- **Likely misconceptions**, each corrected in the chain:
  - **"BST search is $O(\log n)$."** Not in general — it is $\Theta(h)$, and $h$ can
    be $n-1$. This is the headline correction.
  - **"Descending a level halves the problem."** Only if balanced (item 13, row 4).
  - **"All BSTs on the same keys are interchangeable."** They share an in-order
    sequence, not a cost.
  - **"Checking `left.key < key < right.key` at every node validates a BST."**
    No — legality is the inherited interval (supporting insight C); a tree can pass
    every local check and be invalid.
  - **"The root is the median."** True only of the balanced member.
  - **"A tree is better than a sorted array."** It trades insert cost for search
    guarantee; it does not dominate.

---

## Audit A — Mathematical

| Check | Result |
| --- | --- |
| 1. Conclusion follows from derivation | **PASS** — the interval structure forces the invariant, the invariant forces the traversal fact, path length forces the cost, and the insert rule forces degeneration; item 7 proves the height bound by induction on depth. No repair step is asserted. |
| 2. Sufficiency vs lower bound | **PASS** — item 7 is a genuine **lower** bound on height for every binary tree, explicitly distinguished from the balanced **construction** that attains it; item 9 refuses the unqualified "$O(\log n)$" claim outright. |
| 3. Structure-preserving analogy | **PASS** — the array↔tree correspondence is stated as membership in one *family* of comparison-decision trees, with probe-for-probe identity claimed **only** for the balanced member (item 8). |
| 4. Hidden carrying / normalization | **PASS** — the one normalization (midpoint = median) is named in item 8 and tabulated as a discard in item 13, rather than folded into an "equivalence". |
| 5. Nature of broader connections | **PASS** — balanced trees and array binary search labelled *exact*; memoization/tries and the sorting lower bound labelled *architectural* and not derived here. |
| 6. Notation level | **PASS** — arrays, ordering, $\log_2$, big-O, one induction. No expert machinery; the average-case analysis is excluded rather than assumed. |

## Audit B — Grounding & model-change

| Check | Result |
| --- | --- |
| B1. Model change vs clearer wording (universal) | **PASS** — the learner stops holding "sorted container" and starts holding "stored decision procedure". That changes what they can predict, not merely how it is phrased. |
| B2. New prediction (universal) | **PASS** — predict the shape from the insertion order and the worst-case comparison count from the shape, unprompted (item 10). |
| B3. Compression / purpose exposed (universal) | **PASS** — one reframing absorbs the invariant's origin, the cost model, the in-order fact, the degeneration case, and the motivation for the sequel. |
| B4. Genuine isomorphism (grounding) | **PASS with the stated restriction** — exact for the balanced member; for the general case the preserved relations are the invariant, one-comparison-per-level, and the interval structure (item 13, left column). |
| B5. Named pragmatic additions (grounding) | **PASS** — four additions named and discarded: fixed array layout, exact midpoints, static key set, guaranteed halving. The fourth is staged as an explicit confrontation. |
| B6. Abstraction return present (grounding) | **PASS** — four-step return (item 14), with the exit test set at the unfamiliar + symbolic pair, and a stated detector for a story-only learner. |
| B7. Theme-removal test (grounding) | **PASS** — the bridge is not a theme. It is mathematics the learner already holds; stripping it would remove the derivation, not decoration. |

**Closing question — is this more illuminating than a strong conventional
explanation?** Yes. A strong conventional explanation states the invariant and
proves $O(h)$ cost. It does not explain where the invariant comes from, why shape
is the cost rather than a correlate of it, why insertion order is the culprit, or
why balanced trees must exist. This contract derives all four from one construction.

---

## Review signoff

| Role | Filled by | Status |
| --- | --- | --- |
| Contract author | Claude Code (AI) | Complete |
| Mathematical reviewer | Claude Code (AI) — **not independent** | Self-review; Audit A answered; the height bound, the cost convention, and the family/member restriction checked |
| Pedagogical reviewer | Claude Code (AI) — **not independent** | Self-review; items 1–14 present; causal chain gap-free; Audit B answered |
| User / domain-owner approval | Repository owner | **Pending** independent sign-off |
| Outstanding concerns | — | None blocking. Reviews are self-performed, so independent human review remains advisable. Average-case height over random insertion orders is deliberately excluded, not proved. |

---

## Gate result

`Gate result: PASS`

The pedagogical chain (items 1–14) is complete with a gap-free causal chain; Audit
A is clean with the one overreach from Stage 1 corrected (the naive "a BST *is*
binary search" narrowed to membership in a family, with probe identity restricted
to the balanced member); Audit B is clean with all four pragmatic additions named
and discarded and a four-step abstraction return in place.

**Exact primary insight** (preserved verbatim in the Stage 3 plan's metadata;
learner-facing prose may reword while preserving meaning and causal chain):

> A binary search tree is not a container that happens to be sorted — it is a
> **comparison-decision procedure over the key set, materialized in pointers**.
> Reaching any node means a sequence of comparison outcomes was given, each of
> which discarded a contiguous block of keys, so the keys still reachable at a node
> form an **interval**; the "left smaller, right larger" rule is precisely the
> condition that this decision procedure is *correct*, and in-order traversal reads
> those intervals left to right, which is why **every** legal shape yields the same
> sorted sequence. Because each node on a search path costs exactly one comparison,
> the cost of a search is its depth plus one — cost does not merely correlate with
> shape, it **is** shape. Insert-at-leaf therefore means the **insertion order
> chooses which decision procedure you built**: increasing order rebuilds *linear*
> search as a chain of height $n-1$, while median-first rebuilds *binary* search at
> height $\lceil\log_2(n+1)\rceil - 1$, and no binary tree can do better because
> $n \le 2^{h+1}-1$. The array's binary search is one member of this family and the
> tree is another — the tree stores midpoints as pointers so an insertion need not
> shift, but it guarantees no balance, which is exactly why a structure that
> *forces* the shape has to exist.
