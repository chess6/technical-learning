# Lesson Mastery Contract — Binary Search Trees

Gate 5 of the [course authoring workflow](../../../../authoring/course-authoring-workflow.md),
completed after [insight.md](insight.md) reached `Gate result: PASS`.
Filled from [the template](../../../../authoring/templates/lesson-mastery-contract.md);
upstream artifacts are **linked, never restated**.

## 1a. Placement & upstream links

- **Lesson / spine position:** `binary-search-trees`, unit `data-structures` of
  **Algorithmic Thinking**; **chapter 2** of that course, between `karatsuba` and
  `red-black-trees`. It exists because
  [red-black-trees](../red-black-trees/mastery-contract.md) requires it — a
  scheduling fact that the [Stage 1 brief](insight-brief.md) explicitly refused to
  let anchor the insight search.
- **Core course profile in force:** **P2 — demanding applied**, declared per-lesson
  and provisionally (the subject has no Mode A artifacts; accepted as a known gap,
  to be opened later). **Per-lesson D6 note:** one statement is *proved* — the
  height lower bound — by a short induction on depth. Everything else is
  derivation depth. No proof-ready claim is made.
- **Research-bridge overlay?** No.
- **Approved Insight Contract:** [insight.md](insight.md) — `PASS` confirmed.
  Primary insight linked, not copied. The **cost convention** fixed there
  (comparisons counted; height in *edges*; a search ending at depth $d$ costs
  $d+1$) governs every claim below.
- **Saved as:** `docs/courses/data-structures/lessons/binary-search-trees/mastery-contract.md`.
- **Concept ids introduced / reused:** *(proposed, pending Mode A)* introduced —
  `binary-search-tree`, `in-order-traversal`, `tree-height`, `decision-tree`,
  `insertion-order`, `bst-validity-interval`; reused — `binary-search`,
  `asymptotic-cost`, `representation-change` (the edge back to `karatsuba`).

## 1b. Role, bridge, and need

- **Lesson role in the course:** supplies the object the next lesson balances, and
  — more importantly — supplies the *reason* balancing is worth doing. It is the
  course's third instance of one thesis: **change the representation and the
  algorithm's structure becomes visible.**
- **Prerequisite knowledge to retrieve:** binary search on a sorted array (the
  bridge); total ordering; $\log_2$ and elementary big-O; induction on depth (used
  once). All are genuinely prior knowledge for this audience — unlike the
  red-black lesson, this one has no unmet in-course prerequisite.
- **Bridge from the previous lesson:** *"Karatsuba re-decomposed a product so
  redundant work disappeared. Here we re-decompose a **search**: the midpoints
  binary search keeps recomputing get stored, and the structure that results turns
  out to have a name."*
- **Motivating problem / mathematical need:** binary search is fast but its array
  is rigid — one insertion shifts everything. *Can we keep the search and lose the
  shifting?* The learner is asked to try, and the tree is what they build.

## 1c. Content to teach (the coverage core)

- **Approved central insight:** *(link only)* [insight.md § Gate result](insight.md#gate-result).
- **Required definitions & notation (D2):**
  | Term | Stated as |
  | --- | --- |
  | Binary search tree | a binary tree over an ordered key set in which, at every node, all left-subtree keys are smaller and all right-subtree keys larger |
  | Decision tree (comparison) | a binary tree whose nodes are comparisons and whose edges are outcomes |
  | Depth / height | depth of a node = edges from the root; height of a tree = max depth (a single node has height 0) |
  | Search cost | number of key comparisons = depth reached $+\,1$ |
  | In-order traversal | left subtree → node → right subtree |
  | Legal interval $(lo, hi)$ | the open range of keys a position may legally hold, inherited from the whole path above it |
  | Insert-at-leaf | place a new key where its own search terminates |
  Notation fixed once and used identically in prose, scene, explorer, and
  exercises: $K$ (key set), $n=|K|$, $h$ (height), $(lo,hi)$ (inherited interval).
- **Required mathematical objects:** a sorted array with its probe sequence; a
  BST; the **same** key set built two ways (balanced vs chain); an **invalid** tree
  that passes every parent–child comparison.
- **Procedures requiring fluency (D3):** each with the graded **method-specific
  intermediate**, so a lucky final answer cannot pass:
  | Procedure | Graded intermediate |
  | --- | --- |
  | Search for a key | the **comparison sequence** (keys compared, in order), not just found/not-found |
  | Insert-at-leaf a sequence of keys | the **shape after each insertion**, not only the final tree |
  | Compute height and worst-case cost | the **longest root→leaf path**, not a recalled formula |
  | Decide validity | the **inherited interval** at the offending node, not the parent–child pair |
- **Theorems / propositions / invariants (D5):**
  - **T1 (Interval lemma).** The keys reachable at a node form an interval of $K$;
    a tree is a BST iff every node's key lies in its inherited $(lo,hi)$.
  - **T2 (In-order invariance).** Every BST over $K$ has the same in-order
    sequence, namely $K$ sorted.
  - **T3 (Cost identity).** A search reaching depth $d$ costs exactly $d+1$
    comparisons; worst-case cost is $h+1$.
  - **T4 (Height bounds).** For $n \ge 1$,
    $\lceil\log_2(n+1)\rceil - 1 \le h \le n-1$, and **both ends are attained** —
    the upper by increasing-order insertion, the lower by median-first insertion.
- **Expected proof / justification depth (D6):**
  | Statement | Depth | Where each hypothesis is used |
  | --- | --- | --- |
  | T1 | derivation, both directions stated | needs *each comparison discards a contiguous block* |
  | T2 | derivation | needs T1's interval split at the node's key |
  | T3 | short "why" | needs *one comparison per node on the path* |
  | T4 lower bound | **full proof by induction on depth** *(the raised statement)* | base: depth 0 holds one node; step: each node has ≤ 2 children; the ceiling uses integrality of $h$ |
  | T4 attainment | construction, both ends exhibited | needs insert-at-leaf's definition |
- **Required representations (D4):** visual (array probes → tree), symbolic
  ($n \le 2^{h+1}-1$), numerical (comparison counts), verbal (the invariant as a
  correctness condition), operational (the learner drives insertion order).
- **Translations learners must perform (D4):** probe sequence ↔ root→leaf path ·
  insertion order ↔ resulting shape · shape ↔ worst-case comparison count ·
  in-order walk ↔ sorted output · inherited interval ↔ validity.
- **Examples, nonexamples, edge & degenerate cases (D7):** balanced 7-key tree ·
  the right chain from increasing insertion · a left chain from decreasing
  insertion · **an invalid tree passing every local check** (the nonexample that
  carries insight C) · $n=1$ (height 0, cost 1) · empty tree · duplicate key
  (rejected, with the policy stated rather than left ambiguous).
- **Misconceptions & likely errors (D13)**, each staged elicit → confront →
  resolve where it arises, sourced from [insight.md](insight.md) and not restated:
  | # | Elicited belief | Confronted by | Resolved as |
  | --- | --- | --- | --- |
  | M1 | "BST search is $O(\log n)$" | the learner inserts sorted keys and counts comparisons | it is $\Theta(h)$, and $h$ can reach $n-1$ |
  | M2 | "descending a level halves the problem" | the chain, where a level removes one key | halving needs balance, which nothing here provides |
  | M3 | "all BSTs on the same keys are interchangeable" | two shapes, same in-order readout, different cost | the sequence is shared; the cost is not |
  | M4 | "checking each parent against its children validates a BST" | the invalid tree that passes every local check | legality is the **inherited interval** |
  | M5 | "the root is the median" | any insertion order but median-first | true only of the balanced member |
  | M6 | "a tree beats a sorted array" | the insert/search trade table | it moves the cost, it does not dominate |

## 1d. Outcomes, each paired with evidence

| # | Outcome (operational) | Dim. | Owner | Target | Evidence item | Required attainment |
| --- | --- | --- | --- | --- | --- | --- |
| **O1** | Given an unfamiliar key set and a search key, write the **comparison sequence** a BST search performs and the resulting cost | D3/D4 | lesson | E3 | `bst-search-trace` (fresh tree, sequence graded — not found/not-found) | independently demonstrated |
| **O2** | Given a key set and **two insertion orders**, predict which yields the smaller worst-case comparison count **and state the count**, before building either | D1/D3 | lesson | E3 | `bst-order-predicts-shape` (committed prediction, then verified in the explorer) | independently demonstrated |
| **O3** | Explain why in-order traversal returns sorted keys for **every** legal shape, citing the interval split | D5/D6 | lesson | E6 | `bst-inorder-why` (proof completion; the interval-split step is the gap) | independently demonstrated |
| **O4** | Complete the induction step of "a binary tree of height $h$ has at most $2^{h+1}-1$ nodes", and derive the height lower bound from it | D6 | lesson | E6 | `bst-height-induction-step` (proof completion) | independently demonstrated |
| **O5** | Shown a tree that satisfies every parent–child comparison but is **not** a BST, identify the offending node and state the interval it violates | D13/D7 | lesson | E4 | `bst-invalid-local-check` (error diagnosis: which node + which interval) | independently demonstrated |
| **O6** | Construct an insertion order that attains the **minimum** height for a given key set, and say why no order does better | D7/D3 | lesson | E4 | `bst-construct-balanced` (construct-in-explorer, predicate-verified) | independently demonstrated |
| **O7** | Choose between a sorted array and a BST for a stated workload, **without being told which criteria matter** | D8 | lesson | E3 | `bst-choose-structure` (method selection; prompt names no criterion) | independently demonstrated |
| **O8** | On a mixed item spanning the course, name the representation change each lesson makes and what it buys | D10 | **module** | E5 | `algorithmic-thinking-review` (Gate 9) | **at Gate 9** |
| **O9** | ≥ 2 weeks later, predict a shape and its cost from an insertion order on a fresh key set | D12 | **module** | E3 | spaced-retrieval occurrence seeded from `bst-order-predicts-shape` | **at Gate 9** |

The **must-demonstrate set** is {O1…O7} lesson-owned, with {O8, O9} carried to
Gate 9. No readiness claim may cite O8/O9 before then.

## 1e. Coverage-status classification

| Item | Required attainment | Reached (Gate 8) |
| --- | --- | --- |
| Definitions D2 (BST, depth/height, cost, interval) | independently demonstrated (O1, O5) | — |
| Search trace | independently demonstrated (O1) | — |
| Insert-at-leaf → shape | independently demonstrated (O2, O6) | — |
| Height / worst-case cost | independently demonstrated (O2, O4) | — |
| Validity by interval | independently demonstrated (O5) | — |
| T1, T3 | taught + practiced (used inside O1/O5) | — |
| T2 | independently demonstrated (O3) | — |
| T4 lower bound | independently demonstrated (O4) | — |
| T4 attainment (both ends) | independently demonstrated (O6) | — |
| Structure choice vs sorted array | independently demonstrated (O7) | — |
| M1–M6 confrontations | practiced (inline elicit→confront→resolve + Check) | — |
| Average-case over random orders | **enrichment** — offered, never assessed | — |
| Deletion | **out of scope** — see §1g | — |

## 1f. Connections, assessment, retention

- **Cumulative connections (D10):** fires **Karatsuba** — both lessons re-decompose
  to expose structure; exercised by O8 at module level and previewed by the opening
  bridge. Also fires big-O, now bounding a *structure's* height rather than
  counting a recursion's leaves.
- **Assessment evidence (summary):** 1 Check (committed prediction: which order
  searches faster) · woven Explore (predict the comparison count, then verify
  against the readout; the sorted-insertion degeneration is the M1/M2
  confrontation) · 5 Practice (O1, O2, O5, O6, O7) · 2 proof-completion (O3, O4).
  **Nothing repeats the instructional interaction**: the Watch scene lifts a fixed
  7-element array; every graded item uses a different key set, and O7's prompt
  names no selection criterion.
  Recall is capped at **one** pure-recall item (the invariant, MC).
- **Delayed-retention (D12):** O2 and O5 re-appear in the module's spaced /
  interleaved retrieval at roughly **14 days**.
- **Connection to later lessons (forward edge):** **red-black trees** — this
  lesson ends on "the height is chosen by the data", which is exactly the problem
  the sequel solves. Recorded as a `looking-ahead` layer.

## 1g. Correctness & scope

- **Mathematical correctness checks.** Every tree, count, and height shown comes
  from `src/math/binarySearchTrees.ts`; nothing is recomputed in a scene or
  explorer. Invariants added to `src/math/invariants.ts`, each with a regression
  test **and** a property/fuzz test over random key sequences:
  1. `inOrder(insertAll(K, order))` equals `K` sorted, **for every order**;
  2. `isValidBST` accepts exactly the trees built by `insertAll` (and the negative
     fixture — the locally-valid, globally-invalid tree — must be **rejected**);
  3. `searchTrace(key)` visits a strictly nested chain of intervals, and its length
     equals the found node's depth $+\,1$;
  4. `height(insertAll(K, increasing))` equals $|K|-1$;
  5. `height(buildBalanced(K))` equals $\lceil\log_2(|K|+1)\rceil - 1$;
  6. for **every** random order, $\lceil\log_2(n+1)\rceil-1 \le h \le n-1$;
  7. `buildBalanced` reproduces the probe sequence of binary search on the sorted
     array — the item-8 identity, asserted only for the balanced member.
  Degenerate cases with their own tests: empty tree, $n=1$, increasing and
  decreasing orders, and a duplicate key.
- **Lesson-specific exclusions / scope boundaries:**
  - **No balancing mechanism.** The lesson establishes the *problem*; the sequel
    owns the solution. Stated to the learner, so "unbalanced" does not read as an
    unfinished lesson.
  - **No deletion.** Named in a `looking-ahead` layer only.
  - **No average-case analysis.** The $O(\log n)$-for-random-orders result is
    offered as an enrichment layer with its assumption stated, and is never assessed.
  - **No self-balancing variants**, no threaded trees, no persistence.

### Abstraction return (rejection #4 guard)

The lesson teaches on a 7-key set drawn on screen. It returns to the general case
**in-lesson**, with evidence:

| Return | Destination | Evidence |
| --- | --- | --- |
| Arbitrary $n$ | the height bound for all $n$, not for the drawn tree | **O4** — completes the induction |
| Arbitrary key set / order | an unseen key set and unseen orders | **O2, O6** — predicts and constructs on fresh input |

No deferral is required for the return; only *balancing* and *deletion* are
deferred, each with a named owner.

---

## 2. Where evidence lives (Gate 8 vs Gate 9)

**Lesson-owned (Gate 8, real in-lesson evidence):** O1–O7.
**Module-owned (Gate 9 obligations, not claimable before):** O8, O9.

## 3. Assessment set against the §3c minimum

| §3c requirement | This lesson |
| --- | --- |
| 1 Check (commit-before-reveal) | Two insertion orders shown; **commit** to which searches faster, and by how much, before the reveal |
| Woven Explore | Predict the comparison count for a key, then verify against the explorer's readout; drive the sorted-order degeneration yourself |
| ≥1 fresh procedural item grading a method-specific intermediate | **O1** — grades the comparison **sequence** |
| ≥1 boundary/degenerate item | **O6** (minimum height) and the $n=1$ / empty cases inside O1's battery |
| ≥1 genuine transfer item | **O7** — structure selection under an unnamed criterion (the lesson owns D8; a D9 unfamiliar-context transfer is *not* owed and is not manufactured) |
| Proof item (D6 in scope for T2/T4) | **O3**, **O4** |
| Recall cap | exactly **one** pure-recall MC |
| Deferred to module/pilot | timed mixed items, unaided reconstruction, cross-lesson integration |

## 4. Rejection-condition self-check

| # | Condition | Status |
| --- | --- | --- |
| 1 | Insight without definitions | **Clear** — D2 table fixes every term and the cost convention |
| 2 | Follow-along without selection | **Clear** — O7 is a genuine D8 selection item with no criterion named |
| 3 | Near-copy practice only | **Clear** — the scene's array is used by no graded item |
| 4 | Trapped in the convenient representation | **Clear** — in-lesson return via O4 (all $n$) and O2/O6 (fresh sets) |
| 5 | Asserted theorem in a proof profile | **Clear** — T4 proved, T1/T2 derived, hypothesis use tabulated |
| 6 | No connection | **Clear** — backward to Karatsuba (O8), forward to red-black trees |
| 7 | Assessment repeats instruction | **Clear** — see §3 |
| 8 | Lesson-owned core outcome not demonstrated | **Clear by design**; re-verified at Gate 8 |
| 9 | Vague outcomes | **Clear** — each names input, action, product |
| 10 | Missing retention hook | **Clear** — O9 at ~14 days |

**Anti-over-reaction check.** Not owed and not manufactured: a full proof program
(P2, one raised statement); a D9 unfamiliar-transfer item (the lesson owns D8, not
D9); a real-world application; a D11 speed obligation in-lesson.

---

## 5. Acceptance record (Gate 8)

Filled after implementation. Deliberately unchecked.

- [ ] Insight Contract linked and `PASS`; primary insight preserved in meaning.
- [ ] Every §1 field filled; upstream artifacts linked, not restated.
- [ ] Every outcome operational, owner-marked, paired with an evidence item.
- [ ] O1–O7 independently demonstrated with real in-lesson evidence.
- [ ] O8, O9 recorded as Gate-9 obligations, not claimed mastered.
- [ ] Assessment set matches §3c; no instruction repeated; recall capped at one;
      **no transfer item manufactured** (the lesson owns D8, not D9).
- [ ] Backward bridge (Karatsuba) + forward edge (red-black trees) present.
- [ ] Delayed-retention hook recorded.
- [ ] Correctness gate passed — all seven invariants tested, including the
      negative locally-valid/globally-invalid fixture.
- [ ] No rejection condition holds; no anti-over-reaction guardrail tripped.
- [ ] Profile-dependent items match P2 + the single raised statement.
