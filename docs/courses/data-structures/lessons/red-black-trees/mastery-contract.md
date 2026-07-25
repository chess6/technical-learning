# Lesson Mastery Contract — Red–Black Trees

Gate 5 of the [course authoring workflow](../../../../authoring/course-authoring-workflow.md).
Completed **after** the [Approved Insight Contract](insight.md) reached
`Gate result: PASS` and **before** any implementation.

Filled from [authoring/templates/lesson-mastery-contract.md](../../../../authoring/templates/lesson-mastery-contract.md).
Upstream artifacts are **linked, never restated**.

> **Both open questions are now resolved by the repository owner** (2026-07-24);
> see [§5](#5-resolved-decisions). The subject keeps a **per-lesson P2**
> declaration for now, and the missing prerequisite is met by building a
> **[Binary Search Trees](../binary-search-trees/mastery-contract.md) lesson
> first** — so this lesson *retrieves* BSTs rather than teaching them, and the
> in-lesson prerequisite beat planned for it is dropped.

---

## 1a. Placement & upstream links

- **Lesson / spine position:** `red-black-trees`, unit `data-structures` of the
  **Algorithmic Thinking** course (subject *Algorithms & Complexity*), currently a
  `future` node in [src/lessons/courseModel.ts](../../../../../src/lessons/courseModel.ts).
  It becomes **chapter 3** of that course, after `karatsuba` and the newly-inserted
  [`binary-search-trees`](../binary-search-trees/mastery-contract.md).
  *No `course-spine.md` exists for this subject* — see [§5](#5-resolved-decisions).
- **Core course profile in force:** **P2 — demanding applied**, declared
  **per-lesson and provisionally**, because the subject has declared none.
  Rationale: the lesson's centre of gravity is algorithmic (cost, cases, an
  operational repair procedure), and the insight contract's chain requires one
  genuine induction proof — which is P2's "derivation + the occasional short
  proof", not P3's two-direction proof program.
  **Per-lesson override:** D6 is raised for **one** statement only — the height
  bound (T5) is *proved*, not merely derived. No other statement carries a P3
  obligation, and no P3/"proof-ready" claim is made for the course.
- **Research-bridge overlay?** No.
- **Approved Insight Contract:** [insight.md](insight.md) — `PASS` confirmed
  (Stage 1 brief: [insight-brief.md](insight-brief.md)). Primary insight **linked,
  not copied**; the black-height convention fixed there (CLRS: count black nodes
  from a node *exclusive* down to a `nil` leaf *inclusive*) governs every claim
  below without restatement.
- **Saved as:** `docs/courses/data-structures/lessons/red-black-trees/mastery-contract.md`.
- **Concept ids introduced / reused:** **proposed, pending Mode A ratification** —
  introduced: `two-three-four-tree`, `rb-encoding`, `black-height`, `rotation`,
  `recolor`, `overflow-split`, `log-height-bound`; reused: `binary-search-tree`,
  `in-order-traversal`, `asymptotic-cost`, `representation-change` (the last one
  is the edge back to `karatsuba`).

## 1b. Role, bridge, and need

- **Lesson role in the course:** the course's first *data structure*, and its
  second instance of Algorithmic Thinking's actual thesis — **change the
  representation and the algorithm's cases fall out of it**. Karatsuba made a
  redundant *computation* disappear; this lesson makes a redundant *case list*
  disappear.
- **Prerequisite knowledge to retrieve:** binary-search-tree search/insert; that
  in-order traversal reads a BST's keys in sorted order; big-O; induction on tree
  height. **All are supplied by the preceding
  [Binary Search Trees](../binary-search-trees/mastery-contract.md) lesson**, whose
  own outcomes O1–O6 cover exactly this ground. This lesson therefore *retrieves*
  them (a backward-bridge event) and teaches none of them.
- **Bridge from the previous lesson:** *"Binary search trees ended on a problem:
  the cost is the height, and the insertion order — which you do not control —
  picks the height. Red–black trees are the answer, and they arrive looking like
  five arbitrary colour rules and seven repair cases. They are neither."*
  (The Karatsuba edge is still fired, one step further back: all three lessons
  re-decompose or re-encode so that structure becomes visible.)
- **Motivating problem / mathematical need:** the learner is **shown the finished
  artefact first** — the five colour properties and the insert case table — and
  asked the honest question: *where does this list come from, and why exactly
  these cases?* The lesson's job is to produce the generator, not the list.

## 1c. Content to teach (the coverage core)

- **Approved central insight:** *(link only)* [insight.md §Gate result](insight.md#gate-result).
- **Required definitions & notation (D2):**
  | Term | Stated as |
  | --- | --- |
  | 2–3–4 tree | a search tree whose internal nodes hold 1–3 keys (2-/3-/4-node) with all leaves at equal depth |
  | Encoding \(E\) | one 2–3–4 node ↦ one **black representative** plus 0–2 **red** children |
  | Colour bit | red = "an extra key glued into my parent's 2–3–4 node"; black = "I start a new level" |
  | Canonical drawing | every extra key is a red child *of a black representative* |
  | \(bh(x)\) | black height, under the contract's fixed convention (linked, not restated) |
  | R1–R5 | the five red-black properties, stated once and thereafter *derived from* \(E\) |
  | Rotation | an order-preserving reshape; **not** black-height-preserving on its own |
  | Recolour | the binary image of a 2–3–4 **split**: promote the middle key |
  | Overflow / split / promotion | the 2–3–4 events the repair cases are images of |
  Notation is fixed here and used identically in prose, scene, explorer, and
  exercises: \(T\) for the 2–3–4 tree, \(E(T)\) for its encoding, \(g/p/u\) for
  the black representative and its two red children, \(bh(\cdot)\).
- **Required mathematical objects:** a 2–3–4 tree; its encoding; a legal
  red-black tree; a **mis-drawn cluster** (red child of a red — a legal node drawn
  illegally); a **5-node** (genuine overflow). The learner must be able to
  construct and recognise each, and to tell the last two apart — that distinction
  is the lesson's sharpest discrimination.
- **Procedures requiring fluency (D3):** each with the **method-specific
  intermediate** an assessment grades, so a lucky final picture cannot pass:
  | Procedure | Graded intermediate (not the final answer) |
  | --- | --- |
  | Encode \(T \to E(T)\) and decode back | the **cluster boundaries** — which black node owns which reds |
  | 2–3–4 insert with overflow → split | the **promoted middle key**, named before the redraw |
  | Compute \(bh(x)\) | the **counted path**, including the `nil` leaf |
  | Classify an insertion repair | the **2–3–4 node that receives the key and its arity *before* insertion** |
- **Theorems / propositions / invariants (D5):**
  - **T1 (Encoding lemma).** \(E\) preserves the in-order key sequence, and
    \(bh(E(T)) = \operatorname{height}(T)\).
  - **T2 (Invariant equivalence).** R2 ("no two reds") ⇔ the canonical drawing is
    respected; R3 ("equal black height") ⇔ all 2–3–4 leaves lie at equal depth.
  - **T3 (Recolour lemma).** A split-recolour preserves the subtree's **external**
    black height and moves the violation **up exactly one level**.
  - **T4 (Root lemma).** Only a split reaching the root changes the **total** black
    height, and it raises it by exactly one, **uniformly on every path**.
  - **T5 (Height bound).** A subtree of black height \(bh\) has at least
    \(2^{bh}-1\) internal nodes; hence \(bh \le \log_2(n+1)\) and
    \(\operatorname{height} \le 2\,bh \le 2\log_2(n+1)\).
- **Expected proof / justification depth (D6) — P2 with one raised statement:**
  | Statement | Depth | Where each hypothesis is used |
  | --- | --- | --- |
  | T1 | derivation + short "why" | order-preservation needs *reds hang below their representative*; \(bh = \text{height}\) needs *reds add no level* |
  | T2 | derivation, both directions stated informally | needs *all 2–3–4 leaves at equal depth* |
  | T3 | **full path-count argument** | needs the path to enter the cluster **from outside through \(g\)** — the qualifier that makes "external" true and "total" false |
  | T4 | derivation | needs R1 (root is black) to force the final recolour |
  | T5 | **full proof by induction on height** *(the raised statement)* | base case uses *`nil` is black and \(bh=0\)*; step uses *only a black child decrements \(bh\)*; the \(\le 2bh\) half uses **R2** |
- **Required representations (D4):** visual (the synchronized split-screen),
  symbolic (\(n \ge 2^{bh}-1\); \(\operatorname{height} \le 2\log_2(n+1)\)),
  verbal (the one-sentence encoding rule), operational (the repair procedure as a
  decision the learner executes).
- **Translations learners must perform (D4):**
  2–3–4 node ↔ black cluster · overflow-split ↔ recolour · mis-oriented reds ↔
  rotation-plus-recolour · black count on a path ↔ 2–3–4 depth · "the tree got
  taller" ↔ "the root split".
- **Examples, nonexamples, edge & degenerate cases (D7):**
  - Examples: the three encodings (2-node; 3-node **left-leaning**; 3-node
    **right-leaning**; 4-node) — the two 3-node drawings shown as *the same node*.
  - Nonexample: a red-red pair labelled **"a legal node drawn illegally"**, set
    beside a genuine 5-node so the two are never conflated.
  - Edge cases the visualization must handle honestly: empty tree; single key;
    insertion into a **full root 4-node** (the only height-raising event);
    both mirror orientations of the mis-drawn case; a **bare rotation shown
    breaking R3** (a deliberate counterexample, not an accident); `nil` leaves
    drawn and counted as black, since the convention depends on them.
- **Misconceptions & likely errors (D13), each staged elicit → confront → resolve
  where it arises** (sourced from [insight.md §11](insight.md), not restated):
  | # | Elicited belief | Confronted by | Resolved as |
  | --- | --- | --- | --- |
  | M1 | "a bare rotation preserves black height" | the learner applies one in the explorer and watches a path's black count change | rotation restores *order*; the paired recolour restores *R3* — two distinct jobs |
  | M2 | "two reds in a row means a 5-node" | side-by-side with a real 5-node | a mis-drawn 3-/4-node; a rotation redraws it, no key count changes |
  | M3 | "the violation marker is a conserved thing" | the marker is *consumed* by a rotation, not moved | it is a repair-**state** indicator |
  | M4 | "a recolour raises the tree's black height" | count blacks on an external path before/after | external \(bh\) preserved; only a **root** split raises the total, uniformly |
  | M5 | "the five properties are arbitrary axioms" | derive R2 and R3 from \(E\) | they are the encoding's canonical-drawing rules |
  | M6 | "amortized \(O(1)\) restructuring is universal" | stated scope note beside the cost claim | variant-specific (standard bottom-up insertion; LLRB and deletion differ) |

## 1d. Outcomes, each paired with evidence

| # | Outcome (operational) | Dim. | Owner | Target level | Evidence item | Highest attainment required |
| --- | --- | --- | --- | --- | --- | --- |
| **O1** | Given a 2–3–4 tree of ≤ 7 keys, produce its red-black encoding with cluster boundaries marked, and given a legal red-black tree, recover the 2–3–4 tree it encodes | D4/D2 | lesson | E3 | `rbt-encode-decode` (construct-in-explorer, fresh tree) | independently demonstrated |
| **O2** | Given a red-black tree and a key to insert, name the 2–3–4 node that receives it **and its arity before insertion**, then state whether the repair is *none*, *rotation + recolour*, or *recolour and promote* — **with no case table on screen** | D3/D8 | lesson | E3 | `rbt-classify-repair` (custom capability; fresh instance; method not named) | independently demonstrated |
| **O3** | Explain why a split-recolour preserves the subtree's **external** black height, by counting black nodes on a path entering the cluster from outside | D5/D6 | lesson | E6 | `rbt-external-bh-explain` (proof completion; the path-count step is the gap) | independently demonstrated |
| **O4** | Complete the induction step of "a subtree of black height \(bh\) has at least \(2^{bh}-1\) internal nodes", and say where R2 is used in deriving \(\operatorname{height} \le 2\,bh\) | D6 | lesson | E6 | `rbt-height-induction-step` (proof completion) | independently demonstrated |
| **O5** | Shown a **bare rotation** applied to a legal red-black tree, identify the root→leaf path whose black count changed and supply the recolour that restores R3 | D13 | lesson | E4 | `rbt-bare-rotation-diagnose` (error diagnosis: which step + why + repair) | independently demonstrated |
| **O6** | Construct an insertion sequence that raises the tree's **total** black height, and explain why no other event can | D7/D3 | lesson | E4 | `rbt-construct-root-split` (construct-in-explorer against a predicate) | independently demonstrated |
| **O7** | Given a **B-tree of order 5** (2–5 keys per node) mid-overflow — a branching factor never shown in the lesson — predict the split and name the promoted key, technique unnamed | D9 | lesson | E4 | `rbt-btree-transfer` | independently demonstrated |
| **O8** | On a mixed item spanning both course lessons, identify in each algorithm the *representation change* that removed the redundancy or the case list | D10 | **module** | E5 | `algorithmic-thinking-review` module set (Gate 9) | independently demonstrated **at Gate 9** |
| **O9** | ≥ 2 weeks later, re-derive the insert repair classification on a fresh tree without the encoding on screen | D12 | **module** | E3 | spaced-retrieval occurrence seeded from `rbt-classify-repair` | independently demonstrated **at Gate 9** |

**Weak-outcome check.** No outcome reads "understand red-black trees". Each names
the input, the action, and what must be produced. O2 deliberately withholds the
case table — that is the whole point of the lesson, so an item that supplies it
would measure E1.

## 1e. Coverage-status classification

| Item | Required attainment | Reached (filled at Gate 8) |
| --- | --- | --- |
| Definitions D2 (encoding, colour bit, \(bh\), rotation/recolour) | independently demonstrated (via O1, O2) | — |
| Procedure: encode/decode | independently demonstrated (O1) | — |
| Procedure: classify repair | independently demonstrated (O2) | — |
| Procedure: compute \(bh\) | practiced (woven into Explore readouts + O6) | — |
| T1, T2 | taught + practiced (used inside O1/O2) | — |
| T3 | independently demonstrated (O3) | — |
| T5 | independently demonstrated (O4) | — |
| M1 confrontation | independently demonstrated (O5) | — |
| M2–M6 confrontations | practiced (inline elicit→confront→resolve + Check) | — |
| Transfer to higher branching order | independently demonstrated (O7) | — |
| Cumulative link to Karatsuba | **module-owned**, planned (O8) | — |
| Delayed retention | **module-owned**, planned (O9) | — |
| Deletion by duality | **enrichment track** — offered, never on the bar | — |
| Amortized cost figures | **enrichment track** — offered with its variant caveat | — |

The **must-demonstrate set** is {O1…O7} (lesson-owned) plus {O8, O9} carried
forward as Gate-9 obligations. No readiness claim may cite O8/O9 before Gate 9.

## 1f. Connections, assessment, retention

- **Cumulative connections (D10):** fires **Karatsuba** in a new context — both
  lessons are the same move (*re-decompose / re-encode so the work or the cases
  collapse*), which is exactly the "representation change as a technique"
  *architectural* transfer the insight contract names. Also fires big-O, now used
  to *bound a structure's height* rather than count a recursion's leaves.
  Exercised by O8 at module level, and previewed in-lesson by the opening bridge.
- **Assessment evidence (summary):** 1 Check (committed prediction, O2's
  discrimination in miniature) · woven Explore verification (black-height readout
  + the bare-rotation counterexample) · 4 Practice items (O1, O2, O5, O6) · 1
  transfer (O7) · 2 proof-completion items (O3, O4). **None re-runs the
  instructional interaction**: the Watch scene demonstrates encode-and-split on a
  fixed tree; every graded item uses a **fresh tree with different arities**, and
  O2/O7 withhold the method name. Recall is capped at **one** pure-recall item
  (the encoding rule, MC).
- **Delayed-retention requirement (D12):** O2 (repair classification) and O5
  (bare-rotation diagnosis) must reappear in the Algorithmic Thinking module's
  spaced/interleaved retrieval at roughly **14 days**, seeded as occurrences.
- **Connection to later lessons (forward edge):** B-trees / B+-trees — *exact*
  structural transfer (a 2–3–4 tree is a B-tree of order 4), opened by O7; and
  **deletion by duality** (overflow ↔ deficit, split ↔ merge, promote ↔ borrow),
  named as a `looking-ahead` layer, **not taught here**.

## 1g. Correctness & scope

- **Mathematical correctness checks.** Every tree, colour, count, and height shown
  by the scene or the explorer is computed by a new pure module
  `src/math/redBlackTrees.ts` and **never** reimplemented in a scene or explorer
  (MATH_CORRECTNESS rule). Invariants to assert in `src/math/invariants.ts`, each
  with a regression test and a property/fuzz test over random key sequences:
  1. `decode(encode(T))` equals \(T\) (up to 3-node orientation);
  2. in-order key sequence is preserved by **every** rotation and recolour;
  3. a legal tree has **no red-red edge** and **equal black height on every path**;
  4. a split-recolour **preserves external black height** (T3) — asserted on the
     subtree, not the whole tree;
  5. total black height changes **only** on a root split, and then by exactly 1 (T4);
  6. \(bh \le \log_2(n+1)\) and \(\operatorname{height} \le 2\log_2(n+1)\) hold
     after every insertion in a randomized sequence (T5);
  7. the **bare-rotation counterexample** is asserted to *fail* invariant 3 — the
     one place the code must prove a negative, so M1's confrontation cannot rot.
  Degenerate cases with their own tests: empty tree, single key, root-4-node
  overflow, both mirror orientations, and `nil`-leaf counting at the boundary.
- **Lesson-specific exclusions / scope boundaries** (anti-scope-creep):
  - **Deletion is not taught** — named as the dual, with an accountable deferral
    (owner: a future `red-black-deletion` or the B-trees node; destination: the
    merge/borrow cases; evidence: that node's own contract). Recorded here so
    rejection #4 cannot fire silently.
  - **LLRB** appears only as the remark that fixing 3-node orientation collapses
    mirror cases — not as a second variant to learn.
  - **No amortized potential proof.** The \(O(1)\)-amortized recolouring figure is
    stated **with its variant caveat** (M6) as an enrichment layer, never assessed.
  - **No optimality claim.** The lesson proves *sufficiency* — a construction with
    a logarithmic upper bound — not that red-black balance is minimal.
  - **Not a BST tutorial.** Prerequisite BST material is *retrieved*, not taught
    (subject to [§5](#5-resolved-decisions)).

### Abstraction return (rejection #4 guard)

The lesson teaches on trees of ≤ 7 keys drawn on screen. It returns to the general
case **in-lesson**, twice, with evidence:

| Return | Destination | Evidence |
| --- | --- | --- |
| Arbitrary \(n\) | the height bound for all \(n\), not for the drawn tree | **O4** — the learner completes the induction step |
| Arbitrary branching order | B-tree of order 5, never drawn in the lesson | **O7** — the learner predicts a split at an unseen order |

No deferral is needed for the return itself; only *deletion* is deferred, with an
owner named above.

---

## 2. Where evidence lives (Gate 8 vs Gate 9)

- **Lesson-owned (Gate 8, real in-lesson evidence required):** O1–O7.
- **Module-owned (Gate 9 obligations, may not be claimed mastered before):** O8
  (cumulative integration with Karatsuba), O9 (delayed retention).

Gate 8 may accept this lesson on O1–O7 alone. It may **not** claim the course
"covers balanced search trees" until Gate 9 discharges O8/O9 with real results.

## 3. Assessment set against the §3c minimum

| §3c requirement | This lesson |
| --- | --- |
| 1 Check (commit-before-reveal) | Given a 4-node about to receive a key, **commit** to *recolour* vs *rotation + recolour* before the reveal |
| Woven Explore (≥1 prediction + invariant verification) | Predict the black-height readout after a split; verify R2/R3 from the shading; the **bare-rotation** toggle as the M1 confrontation |
| ≥1 fresh procedural item grading a method-specific intermediate | **O2** — grades the receiving node *and its arity*, not the final picture |
| ≥1 boundary/degenerate item | **O6** — root-4-node overflow, the only height-raising event |
| ≥1 genuine transfer item (lesson owns a D9 outcome) | **O7** — order-5 B-tree, technique unnamed |
| Proof item (P2, proof in scope for T5/T3) | **O3** and **O4** — proof completion |
| Recall cap | exactly **one** pure-recall MC (the encoding rule) |
| Deferred to module/pilot | full unaided reconstruction of the case list; untelegraphed transfer; timed mixed items — **not** stacked into Practice |

**Anti-repetition check.** The Watch scene splits a specific 4-node on a fixed
tree. No graded item reuses that tree, those keys, or that arity pattern.

## 4. Rejection-condition self-check (pre-implementation)

| # | Condition | Status |
| --- | --- | --- |
| 1 | Insight without definitions | **Clear** — D2 table in §1c fixes every term and the notation |
| 2 | Follow-along without selection | **Clear** — O2 and O7 withhold the method; D8 is in scope |
| 3 | Near-copy practice only | **Clear** — every graded item uses a fresh tree; §3 anti-repetition check |
| 4 | Trapped in the convenient representation | **Clear** — in-lesson return via O4 (all \(n\)) and O7 (all orders); only deletion deferred, with an owner |
| 5 | Asserted theorem in a proof profile | **Clear** — T5 proved, T3 argued in full, hypothesis use tabulated |
| 6 | No connection | **Clear** — backward edge to Karatsuba (O8), forward edge to B-trees (O7) |
| 7 | Assessment repeats instruction | **Clear** — see §3 |
| 8 | Lesson-owned core outcome not demonstrated | **Clear by design** — O1–O7 each have a concrete item; re-verified at Gate 8 |
| 9 | Vague outcomes | **Clear** — every outcome names input, action, product |
| 10 | Missing retention hook | **Clear** — O9 at ~14 days |

**Anti-over-reaction check.** The gate is *not* being asked for: a full
two-direction proof program (P2, one raised statement only); a real-world
application that adds nothing; dimensions outside scope (no D11 speed obligation
in-lesson); or a non-visual treatment where the split-screen is plainly the right
representation.

---

## 5. Resolved decisions

Both questions below were put to the repository owner and answered on
2026-07-24. The resolutions are recorded here; the original framing is kept so the
reasoning stays auditable.

**Resolution 1 — profile:** *accept the per-lesson P2 declaration; open Mode A for
the algorithms subject later.* This contract's §1a declaration stands, and the
subject-level spine / curriculum-architecture / benchmark matrix remain **owed**.

**Resolution 2 — placement and prerequisite:** *option (b)* — add a
**Binary Search Trees** lesson before this one in the same `data-structures` unit
of Algorithmic Thinking, and build it first. Consequences already applied: this
contract's §1b now retrieves rather than teaches BSTs; the lesson plan's
prerequisite beat (`rbt-prereq-bst`) and its practice item are **deleted**; the
`binary-search-trees` node is added to the curriculum ahead of this one. The doc
directory `docs/courses/data-structures/` is kept for both lessons (it now holds a
coherent pair) — the naming inconsistency with `docs/courses/algorithms/karatsuba`
is left for Mode A to settle rather than churned now.

### 5.1 The algorithms subject has no Mode A artifacts

`docs/courses/algorithms/` contains only `lessons/`. There is no
`course-spine.md`, `curriculum-architecture.md`, or `benchmark-matrix.md`, so this
contract had to **declare a per-lesson profile (P2) and propose concept ids**
rather than inherit them. Karatsuba shipped the same way. Options:

- **(a)** Accept the per-lesson P2 declaration for now; open Mode A later.
  ← **chosen**
- **(b)** Run Mode A for the algorithms subject first (profile + spine + benchmark),
  then ratify this contract against it.

### 5.2 Placement, and the missing BST prerequisite

Two coupled issues:

- **Doc location is inconsistent.** These artifacts live under
  `docs/courses/data-structures/lessons/red-black-trees/` while Karatsuba's live
  under `docs/courses/algorithms/lessons/karatsuba/`, and the actual course
  containing both is `algorithmic-thinking`. Nothing is broken; the naming is just
  not one thing.
- **The prerequisite is not taught.** The insight contract requires BSTs and
  in-order traversal, and the course has neither.

Options:

- **(a)** Keep Red–Black Trees as a unit of **Algorithmic Thinking** and open the
  lesson with a compact **BST retrieval beat** (gated by a prerequisite-check
  item). Smallest change; the lesson carries a little prerequisite weight.
- **(b)** Add a `binary-search-trees` node **before it** in the same unit, and have
  this lesson retrieve rather than re-teach. ← **chosen**
- **(c)** Promote **Data Structures to its own course** (matching the existing doc
  directory), with BSTs then Red–Black Trees. Best long-term shape; changes the
  catalog, the sidebar, and numbering.

---

## 6. Acceptance record (Gate 8)

Filled at implementation (2026-07-24).

### Two Gate-7 corrections to the insight contract

1. **Splitting is pre-emptive (top-down), and the contract needed this to be
   consistent.** Its case-3 narration says a *fourth key arrives* at a full
   4-node ("a 5-node") and then that the split leaves **two 2-nodes**. Those two
   sentences cannot both hold: a 4-node holds three keys, so promoting the
   middle of *four* keys leaves a 2-node and a 3-node. Splitting a full node on
   the way *down*, before the key is placed, makes the contract's own sentence
   literally true and is what the lesson animates. Recorded in the header of
   `src/math/redBlackTrees.ts`.
2. **3-nodes are kept left-leaning.** The contract already names this as a legal,
   explicitly-separate normalization ("fixing it collapses mirror-image cases but
   does not change $T$"). Adopting it makes `encode`/`decode` an **exact**
   bijection instead of one "up to orientation" — so the round-trip is a passing
   test rather than a caveat. The mirror freedom is stated to the learner as a
   depth layer, so nothing is hidden.

### A third correction, found by writing the invariant

Invariant (4) — "a split preserves **external** black height" — was first
implemented with the *exclusive* black-height count, and it failed: the 4-node
cluster reads 1 before and 2 after. The claim is only true measured on a path
entering **through** the representative, so its own colour counts (black 1 +
reds 0 before; red 0 + black child 1 after). That qualifier is precisely what
misconception **M4** drops, and had the test been written to match the code the
lesson would have shipped asserting the wrong quantity. The reasoning now lives
in the assertion's comment.

### Checklist

- [x] Insight Contract linked and `PASS`; primary insight preserved in meaning,
      with the two corrections above recorded rather than absorbed silently.
- [x] Every field in §1 filled; upstream artifacts linked, not restated.
- [x] Every outcome operational, owner-marked, paired with an evidence item.
- [x] Lesson-owned core outcomes evidenced in-lesson (`rbt-encode-decode`,
      `rbt-classify-repair`, `rbt-external-bh-explain`,
      `rbt-height-induction-step`, `rbt-bare-rotation-diagnose`,
      `rbt-root-split`, `rbt-btree-transfer`).
- [x] O8, O9 recorded as Gate-9 obligations and **not** claimed mastered.
- [x] Assessment set matches §3c; recall capped at one; a genuine transfer item
      is present at a branching order the lesson never draws.
- [x] Backward bridge (Binary Search Trees: "the cost is the height, and the
      insertion order picks it") + forward edge (B-trees, deletion by duality).
- [x] Delayed-retention hook recorded for O2/O5, to be seeded at Gate 9.
- [x] Correctness gate passed — the seven invariants, including the **negative**
      one (a bare rotation must break the tree) and its guard-on-the-guard.
- [x] No rejection condition holds; no anti-over-reaction guardrail tripped.
- [x] Profile-dependent items match P2 + the single raised statement.

### Deviations from the plan

1. **No new grading capabilities.** The plan named three; the existing
   `exercise-sequence` and `self-check` capabilities carry all eight items.
2. **O1 and O6 are guided rather than free constructions.** The plan wanted
   `construct-in-explorer` with predicate grading; the available `construct` step
   grades a 2-D vector, not a tree or a key sequence. O1 ships as a counting
   sequence over the canonical tree's clusters, O6 as "identify the insertion
   that raises the total black height, and why nothing else can". Both are
   partially scaffolded, so their honest evidence level is **E3, not E4** —
   recorded here rather than claimed upward. Predicate-graded construction over a
   structure remains a real future capability, and it is the one thing that would
   raise these two outcomes.
3. **The scene animates one cluster, not a whole tree.** The insight is about
   what a single node *is*; at 960×540 a full tree would make the colour change —
   the actual subject — the smallest thing on screen. The whole-tree view is the
   explorer's job, and it has it.
