# Approved Insight Contract — Red-Black Trees

Stage 2 of the [Insight Discovery Gate](../INSIGHT_DISCOVERY_GATE.md). Selects one
primary breakthrough from the Stage 1 brief
([insight-brief-red-black-trees.md](../insight-brief-red-black-trees.md)) and verifies
its complete mathematical and pedagogical chain, then runs the mathematical audit.

Primary insight selected: **C1** — a red-black tree *is* a binary encoding of a
2–3–4 tree, so every recolor and rotation is a 2–3–4 node split/reshape seen through
that encoding. The audit (below) corrected several supporting claims (bare rotation,
external black height, red-red chains, the violation "token", the amortized figures,
and the height-bound convention) but did **not** surface a stronger elementary
insight, so C1 remains primary. **C2** (black height as the invariant repair
preserves/raises) and **C4** (repair as an upward-moving violation *state*) are
recorded as the strongest supporting insights.

**Black-height convention (fixed for this whole contract; CLRS).** For a node $x$,
$bh(x)$ is the number of **black** nodes on any path from $x$ down to a `nil` leaf,
**counting the `nil` leaf (which is black) but not $x$ itself**. The black height of
the tree is $bh(\text{root})$. Every "black height" claim below uses this one
convention; the height bounds are exact under it.

---

## Primary insight (required contents 1–11)

### 1. Initial mental model
"Red-black trees are balanced BSTs kept balanced by five color rules and a table of
rotation/recolor 'cases' you memorize." The five properties look unmotivated and the
insert cases look like an arbitrary list.

### 2. Tension / redundancy
Why *these* rules and not others? Why exactly these rotations and recolorings, in
exactly these cases? The color rules never mention height, yet they force logarithmic
height; the repair "cases" have no evident source. The learner's model has no
generator for the rules — only a list to memorize.

### 3. Structural reveal
Group each **black** node with the red children it has. That cluster is exactly one
node of a **2–3–4 tree** (a search tree whose nodes hold 1–3 keys, all leaves at the
same depth). The red-black tree is just that 2–3–4 tree written in binary with one
color bit: **red means "I am an extra key glued into my parent's 2–3–4 node," black
means "I start a new level."** The color bit records node membership; it is not
decoration. The five properties and every repair case then follow from this one
correspondence.

The encoding (2–3–4 node → binary):

| 2–3–4 node | keys | binary encoding |
| --- | --- | --- |
| 2-node | 1 | one **black** node |
| 3-node | 2 | **black** rep + **one red** child (leans left *or* right) |
| 4-node | 3 | **black** rep + **two red** children |

**Canonical encoding rule:** every extra key is a red child *of a black
representative*. This is the legal local drawing; a red child of a *red* node is an
illegal drawing of the same node, repaired by a rotation (below), **not** a fifth
key.

### 4. Full causal chain (no missing steps)

Let the "original object" be a 2–3–4 tree $T$; the red-black tree is its binary
encoding $E(T)$.

- **Encoding is well-defined and order-preserving.** Each 2–3–4 node maps to a black
  representative plus 0–2 red children (a 3-node has two mirror-image drawings). The
  in-order key sequence of $E(T)$ equals that of $T$, so $E(T)$ is a valid BST on the
  same keys.
- **The two invariants are *forced* by the encoding.**
  - **"No two reds" (R2)** ⇔ the canonical encoding is respected: every extra key
    hangs off a black representative. A red child of a red node is a *mis-drawn*
    2–3–4 node, not a new key.
  - **"Equal black height" (R3)** ⇔ all 2–3–4 leaves are at the same depth. Each
    black node marks one 2–3–4 level; reds add keys *within* a level without adding a
    level, so counting black nodes on a root→leaf path counts 2–3–4 levels — which is
    identical on every path because $T$ is perfectly level. Hence $bh(E(T)) =
    \text{height}(T)$.
- **Insertion = 2–3–4 insert, then possible overflow → split.** A new key is added to
  a leaf 2–3–4 node. Encoded, the new node is colored **red** (adds a key without
  adding a black level, so it cannot break R3; it may break R2 locally). Three
  outcomes, all read off the 2–3–4 side:
  1. **Leaf was a 2-node or 3-node with room (reds correctly oriented).** The new red
     just enlarges the node to a 3-node/4-node. No violation, or a one-shot local
     fix. Done.
  2. **Reds mis-oriented (red child of a red, but only three keys total).** This is a
     legal 3-/4-node *drawn illegally*. A **rotation together with its recolor**
     re-roots the cluster so the middle key becomes the black representative — the
     canonical drawing. No key count changes; this is *not* a 5-node.
  3. **Overflow: the leaf was a full 4-node and a fourth key arrives (a 5-node).** The
     2–3–4 rule **splits** it: the middle key is promoted into the parent, leaving two
     2-nodes. Encoded, this split **is a recolor** — flip the black representative's
     two red children to black (they become their own 2-node levels) and color the
     representative red (it is the promoted key, now an extra key in the parent's
     node).
- **A recolor preserves *external* black height while pushing the violation up.**
  Take the split/recolor of a 4-node whose black representative $g$ has red children
  $p, u$: flip $p, u$ to black and $g$ to red. Count black nodes on any path entering
  the cluster from *outside* (through $g$) down to the leaves below: before, $g$
  contributes 1 black and $p/u$ contribute 0; after, $g$ contributes 0 and whichever
  of $p/u$ the path takes contributes 1. The external black count is unchanged — the
  subtree's **external black height is preserved.** But $g$ is now red and may sit
  under a red parent: the violation has moved **up one level** (the promoted key
  arriving in the parent's node). Recurse.
- **A root split raises total black height uniformly.** If the promotion reaches the
  root, the root is recolored red by the step above, then forced back to **black**
  by (R1). Recoloring the root black adds exactly one black node to the top of
  *every* root→leaf path at once, so the **total** black height increases by one
  **uniformly** — the only event that changes the total. (Equivalently: the 2–3–4
  tree grew one level taller by splitting its root.)
- **Termination and correctness.** Each step either terminates (cases 1–2, or a
  non-root split with no new violation) or moves the violation strictly up one level;
  the number of levels is the black height $bh = O(\log n)$, so repair halts with a
  legal $E(T')$ for the updated 2–3–4 tree $T'$.
- **Height bound (logarithmic).** Under the fixed convention: a subtree of black
  height $bh$ has at least $2^{bh}-1$ internal nodes (derivation §5), so $n \ge
  2^{bh}-1$, i.e. $bh \le \log_2(n+1)$. By (R2) no root→leaf path has two reds in a
  row, so its length is at most $2\,bh$; hence $\text{height} \le 2\,bh \le
  2\log_2(n+1)$ — logarithmic.

No step is asserted without derivation: the encoding forces the invariants; the
invariants + convention force the bound; the 2–3–4 split rule forces each repair case.

### 5. Minimal formal derivation

**Height bound under the fixed convention.**

*Claim.* A subtree rooted at $x$ with black height $bh(x)$ contains at least
$2^{bh(x)} - 1$ internal nodes.

*Proof (induction on the height of $x$).* If $x$ is a `nil` leaf, $bh(x)=0$ and it
has $0 = 2^0 - 1$ internal nodes. Otherwise $x$ has two children; each child $c$ has
$bh(c) \ge bh(x) - 1$ (equality iff $c$ is black, since only a black child decrements
the count). By the inductive hypothesis each child subtree has $\ge 2^{bh(x)-1} - 1$
internal nodes, so $x$'s subtree has at least
$$2\left(2^{bh(x)-1} - 1\right) + 1 = 2^{bh(x)} - 1$$
internal nodes. ∎

Applying the claim at the root: $n \ge 2^{bh} - 1$, hence $bh \le \log_2(n+1)$.

By (R2), on any root→leaf path the red nodes are non-adjacent, so at least half the
nodes on the path are black; the path therefore has at most $2\,bh$ nodes. Combining,
$$\text{height} \le 2\,bh \le 2\log_2(n+1) = O(\log n).$$

### 6. Equivalence to the original object
The "original object" is the 2–3–4 tree $T$; the red-black tree is its binary
encoding $E(T)$. The equivalence has two separate, explicit parts (nothing hidden):

- **Same keys, same order.** $E$ preserves the in-order key sequence, so $E(T)$ is a
  BST on exactly the keys of $T$ and answers identical searches.
- **Same balanced structure, bijective up to orientation.** $E$ is a bijection
  between 2–3–4 trees and legal red-black trees **up to the two drawings of a
  3-node** (lean-left / lean-right). $bh(E(T)) = \text{height}(T)$, and every 2–3–4
  operation (insert, split, and by extension merge/borrow for delete) corresponds to
  a red-black recolor/rotation and vice versa. Two normalization facts are kept
  *separate* and are not folded into the bijection:
  - **3-node orientation is a free choice** (mirror drawings); fixing it (e.g.
    left-leaning red-black trees) collapses mirror-image cases but does not change
    $T$.
  - **A rotation alone does not preserve black height** — only the rotation *paired
    with* its recolor restores R3. Order preservation (rotation) and black-height
    restoration (recolor) are distinct steps and are stated as such.

### 7. Cost change (stated precisely)
- **Sufficiency (what is proven).** The encoding *constructs* a balanced BST: the
  invariants it forces yield $\text{height} \le 2\log_2(n+1)$, so search/insert/delete
  each walk $O(\log n)$ nodes. This is a construction giving an upper bound on height,
  not a claim that red-black trees are the *optimal* balanced BST.
- **Repair cost (standard bottom-up insertion variant).** Per insert: $O(1)$
  rotations (repair terminates at the first rotation) and $O(\log n)$ recolorings
  worst case, with **$O(1)$ amortized** recolorings over a sequence of inserts. **This
  amortized figure is variant-specific** — it is stated for standard bottom-up
  insertion; deletion has its own analysis, and left-leaning red-black trees (LLRB)
  have a different case/operation profile. It is **not** claimed as universal.
- **Not claimed here.** That red-black balance is uniquely minimal, or that the
  $2\times$ height gap is tight for all $n$ — those are separate results, outside the
  elementary chain.

### 8. Visual / interactive discovery mechanism
A **synchronized split-screen**: the 2–3–4 tree on the left, its binary red-black
encoding $E(T)$ on the right, kept in lockstep.

- The learner inserts a key. The 2–3–4 side inserts into a leaf; if it overflows, it
  **splits** and promotes the middle key. The red-black side performs the matching
  **recolor** (and, where the reds are mis-oriented, the **rotation-plus-recolor**) in
  the same animation frame — so the split is *seen to be* the color flip.
- A **"lean the 3-node left / right"** toggle surfaces exactly the configurations
  where a rotation (not just a recolor) is needed to draw the node canonically.
- A **violation-state marker** (a glowing token on the offending edge) tracks *where*
  the invariant is temporarily broken; each recolor slides it up one level, a
  rotation-plus-recolor "cashes it in," and a root split shows the whole tree gain one
  uniform black level. The marker is presented as a **repair-state indicator**, not a
  conserved physical object.
- A **count-only-black shading** mode prints the black height on each path so the
  learner watches it stay equal across paths and jump by one (globally) on a root
  split.

Discovery order (discover, don't tell): overflow a 2–3–4 node and split it → learn
the binary encoding → redraw one tree both ways → insert on both sides and watch
split = recolor → find where mis-oriented reds force a rotation → read (R2)/(R3) off
the picture → predict the full insert case list before seeing any reference table.

### 9. What the learner can predict afterward
- **Derive, not recall, the insert repair cases.** Given a red-black tree and a key,
  the learner can state which 2–3–4 node overflows, predict whether the repair is a
  pure recolor or needs a rotation, and justify it from the encoding — without a case
  table.
- Predict that a recolor *preserves external black height* and only a root split
  raises the total (uniformly).
- Predict the height bound $\le 2\log_2(n+1)$ and why weakening either invariant
  (allow red chains, or unequal black heights) destroys it.
- Predict deletion's cases by duality (overflow ↔ deficit, split ↔ merge, promote ↔
  borrow) as the mirror of insertion.

### 10. Transfer assessment
- **B-trees / B+-trees** — *exact* structural transfer: the same overflow-and-split
  (and merge/borrow) at higher branching order; a 2–3–4 tree is a B-tree of order 4.
- **Representation change as a technique** — *architectural* transfer: encode a "fat"
  structure in a "thin" one with a tag bit to make an algorithm's cases fall out.
  Same move as many normalization/canonical-form arguments; the mechanism differs per
  structure.
- **Invariant/potential reasoning** (supporting insight C2/C4) — *architectural*: a
  well-chosen conserved-ish quantity (black height) plus a defect-pushing repair
  state makes a messy process analyzable; appears in carry propagation, heap
  bubbling, union-find.
- **AVL / splay / treaps** (rotations preserve order, C3) — *exact* for the
  order-safety fact; the balance policy differs.

### 11. Prerequisites, limitations, likely misconceptions
- **Prerequisites:** binary search trees and in-order traversal; basic big-O and a
  simple induction; 2–3–4 trees (introduced in-lesson before the encoding).
- **Limitations:** the elementary chain proves *sufficiency* and the logarithmic
  height bound, not optimality of red-black balance; amortized repair figures are
  stated for the standard bottom-up insertion variant only; deletion is developed as
  the dual, not proved here in full.
- **Likely misconceptions (each corrected in the chain):**
  - "A bare rotation preserves black height." **No** — a rotation alone can change
    the black count on some paths; the rotation *with* its recolor restores R3.
  - "Two reds in a row = a 5-node." **No** — it is a broken canonical encoding (a
    mis-drawn 3-/4-node); a rotation restores the legal drawing. A genuine 5-node is a
    black representative acquiring a *third* red key, which forces a split.
  - "The violation token is a conserved physical quantity." **No** — it is a
    pedagogical repair-*state* model for tracking where the invariant is temporarily
    broken.
  - "A recolor raises the whole tree's black height." **No** — a local recolor
    preserves *external* black height and pushes the violation up; only a **root**
    split raises the total, uniformly.
  - "The five properties are arbitrary axioms." **No** — the 2–3–4 encoding motivates
    and derives *why* they take their form; they remain the operative invariants.
  - "Amortized $O(1)$ restructuring is universal." **No** — it is variant-specific
    (standard bottom-up insertion; LLRB and deletion differ).

---

## Mathematical audit

| Check | Result |
| --- | --- |
| 1. Conclusion follows from derivation | PASS — §4 forces the invariants from the encoding and the bound from the invariants; §5 proves $n \ge 2^{bh}-1$ and $\text{height} \le 2\,bh$ by induction. No asserted repair step. |
| 2. Sufficiency vs lower bound | PASS — §7 proves the height/cost as a *construction* (upper bound) and explicitly disclaims optimality of red-black balance as a lower bound. |
| 3. Structure-preserving analogy | PASS — the 2–3–4 ↔ RB correspondence is stated as a bijection *up to 3-node orientation*; a "black node + its red children = one 2–3–4 node" preserves keys and order; a red-red chain is named a mis-drawn node, not a 5-node. |
| 4. Hidden carrying/normalization | PASS — three normalizations kept explicit and separate: (a) bare rotation ≠ black-height-preserving vs rotation+recolor; (b) local recolor preserves *external* black height while a root split raises the *total* uniformly; (c) 3-node orientation is a free choice, not part of the bijection. |
| 5. Nature of broader connections | PASS — B-trees labeled *exact*; representation-change and invariant/potential reasoning labeled *architectural*; AVL/splay labeled exact only for the order-safety fact. |
| 6. Notation level | PASS — only BST, big-O, induction, and 2–3–4 trees are required; no expert-only machinery is placed in the elementary chain. Amortized potential argument is labeled variant-specific and optional. |

Black-height convention: fixed once at the top (CLRS: count black nodes from $x$
exclusive down to a `nil` leaf inclusive), so $n \ge 2^{bh}-1$ and $\text{height} \le
2\,bh$ are unambiguous.

---

## Review signoff

Roles may be temporarily filled by one person or model, but the artifact must not
silently self-certify. Current honest status:

| Role | Filled by | Status |
| --- | --- | --- |
| Contract author | Cursor agent (AI) | Complete |
| Mathematical reviewer | Cursor agent (AI) — **not independent** | Self-review; audit table passed; height bound and encoding claims checked under the fixed convention |
| Pedagogical reviewer | Cursor agent (AI) — **not independent** | Self-review; chain items 1–11 present, causal chain gap-free |
| User / domain-owner approval | Repository owner | **Pending** independent sign-off |
| Outstanding concerns | — | None blocking. Math/pedagogical reviews are self-performed, so independent human review is advisable before a lesson is authored. Deletion (double-black) is included by duality only, not fully proved. |

---

## Gate result

`Gate result: PASS`

Both conditions hold: the pedagogical chain (items 1–11) is complete with a
gap-free causal chain, and the mathematical audit is clean with every overreach from
the Stage 1 brief corrected (bare rotation, external black height, red-red chains,
the violation-state model, the amortized-variant qualifier, and the fixed
black-height convention).

**Exact primary insight (preserved verbatim in the Stage 3 plan's metadata for
traceability; the learner-facing lesson must preserve its mathematical meaning and
causal chain but may use shorter, clearer wording):**

> A red-black tree is a binary encoding of a 2–3–4 tree: a black node together with
> its (at most two) red children encodes exactly one 2–3–4 node — a 2-node is a lone
> black node, a 3-node is a black representative with one red child, a 4-node a black
> representative with two red children. This encoding *forces* the operative
> invariants: "no two reds" is the canonical rule that every extra key hangs off a
> black representative, and "equal black height" is that all 2–3–4 leaves lie at the
> same depth (so $bh$ equals the 2–3–4 height). Each insertion repair is the binary
> image of a 2–3–4 overflow-and-split: a split appears as a recolor that promotes the
> middle key and preserves the subtree's *external* black height while pushing any
> new violation up one level, and when the reds are mis-oriented a rotation-plus-recolor
> redraws the node in canonical form (a bare rotation alone does **not** preserve
> black height); a split that reaches the root raises the *total* black height by one
> uniformly. Under the convention $bh$ = black nodes from a node (exclusive) down to a
> `nil` leaf (inclusive), a subtree of black height $bh$ has $n \ge 2^{bh}-1$ internal
> nodes and height $\le 2\,bh$, so $\text{height} \le 2\log_2(n+1)$ — logarithmic.
