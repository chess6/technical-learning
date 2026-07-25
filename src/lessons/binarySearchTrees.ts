import { EXERCISE_SEQUENCE_ID, SELF_CHECK_ID } from "./capabilities";
import { BST_FRESH_TRACE, BST_ORDERS_PAIR, BST_SEVEN } from "./exampleData";
import type { LessonDefinition } from "./types";

/**
 * Binary Search Trees — Algorithmic Thinking, unit `data-structures`.
 *
 * Built from `docs/courses/data-structures/lessons/binary-search-trees/`
 * (insight contract `PASS` → mastery contract → lesson plan). The central
 * insight: a BST is a comparison-decision procedure over the key set,
 * materialized in pointers — so the shape *is* the cost, and the insertion order
 * is what chooses it.
 *
 * Every number below comes from `exampleData.ts` / `src/math/binarySearchTrees`;
 * nothing about a tree is computed in this file.
 */
export const binarySearchTreesLesson: LessonDefinition = {
  id: "binary-search-trees",
  title: "Binary Search Trees: keeping the midpoints",
  subtitle: "Why the shape of the tree is the cost of the search",
  learningObjectives: [
    "Given an unfamiliar tree and a key, write the comparison sequence the search performs, and the cost it pays.",
    "Given a key set and two insertion orders, predict which gives the cheaper worst-case search, and state the comparison count — before building either.",
    "Explain why in-order traversal returns the sorted keys for every legal shape.",
    "Complete the induction showing a binary tree of height $h$ holds at most $2^{h+1}-1$ nodes, and derive the height bound from it.",
    "Given a tree that satisfies every parent–child comparison but is not a BST, name the offending key and the interval it violates.",
    "Construct an insertion order attaining the minimum height, and say why no order does better.",
    "Choose between a sorted array and a binary search tree for a stated workload.",
  ],
  motivatingQuestion:
    "Binary search is fast, but the array underneath it is rigid: insert one key and everything after it shifts. The comparisons were never the expensive part — the *recomputing* is. So what if we simply kept the midpoints?",

  guidedSceneId: "bst-lift-from-array",
  explorationId: "bst-insertion-order",
  exampleId: BST_SEVEN.id,

  route: [
    { kind: "motivate" },
    // No section title precedes the scene, so it names itself.
    { kind: "visual", heading: "Where do the midpoints go?" },
    { kind: "section", sectionId: "the-lift" },
    { kind: "formal", formalId: "def-bst" },
    { kind: "formal", formalId: "thm-interval" },
    { kind: "section", sectionId: "legality-is-an-interval" },
    { kind: "check" },
    { kind: "formal", formalId: "thm-inorder" },
    { kind: "worked", workedId: "wex-inorder-why" },
    { kind: "section", sectionId: "depth-is-the-cost" },
    { kind: "explore", tocLabel: "Choose the insertion order, choose the cost" },
    { kind: "formal", formalId: "thm-height-bounds" },
    { kind: "worked", workedId: "wex-height-induction" },
    { kind: "section", sectionId: "array-or-tree" },
    { kind: "practice" },
    { kind: "summary", heading: "The insertion order chose the cost" },
  ],

  sections: [
    {
      id: "the-lift",
      title: "The probes were a tree all along",
      body: "Binary search on a sorted array probes a midpoint, throws away half the keys, and repeats. Search a second key and the first probe is *identical* — the same midpoint, recomputed from scratch. So keep it. Pull each probed key out of the array and connect it to the two probes it can lead to, and a shape appears: every node is a comparison you already made, and every edge is one of its two outcomes. Nobody stated a rule about smaller-on-the-left; it fell out of the construction, because a comparison that sent you left has to have discarded everything larger.",
      observation:
        "The tree is not a container that happens to be sorted. It is the decision procedure itself, stored — which is why the next three facts are about *shape*, not about contents.",
      layers: [
        {
          kind: "history",
          title: "Where the name comes from",
          body: "The structure is named after the procedure, not the other way round: *binary search* tree. Reading the name as \"a tree you can binary-search\" gets the dependency backwards — the tree is what you get when you stop throwing the search away.",
        },
      ],
    },
    {
      id: "legality-is-an-interval",
      title: "A tree can pass every local check and still be wrong",
      body: "Reaching a node means a specific run of comparison outcomes was given, and each one discarded a contiguous block of keys. So the keys that may legally live at a position form an **interval**, inherited from the entire path above it — not from the parent alone. That distinction has teeth: a tree in which every node is larger than its left child and smaller than its right child can still be an invalid search tree, because a key can satisfy its parent and still sit in a subtree whose whole range excludes it. A search for that key would descend the other way and never find it.",
      equation: "\\text{legal at a position} \\iff lo < \\text{key} < hi",
      layers: [
        {
          kind: "trap",
          title: "Why the local check is so tempting",
          body: "It is local, it is one line, and it is correct on every small example you are likely to draw by hand. It fails only when a key is out of range with respect to an *ancestor* rather than a parent — which is exactly the case a picture makes hard to see and an interval makes trivial.",
        },
      ],
    },
    {
      id: "depth-is-the-cost",
      title: "Cost is not related to the shape — it is the shape",
      body: "Every node on a search path costs exactly one key comparison, so a search that ends at depth $d$ costs $d+1$ comparisons. There is no constant hiding in that sentence and no average being taken: it is an identity. The worst case for a whole tree is therefore $h+1$, where $h$ is its height. And since insert-at-leaf puts each new key exactly where its own search terminates, the order the keys arrive in is what decides $h$ — insert them in increasing order and every key is larger than everything before it, so each one walks to the rightmost leaf and the tree is a chain.",
      observation:
        "Same keys, same rule, same sorted readout — and, for seven keys, either three comparisons or seven. Nothing about the data changed; only the order it arrived in.",
    },
    {
      id: "array-or-tree",
      title: "What you actually bought",
      body: "The sorted array searches in $\\Theta(\\log n)$ **guaranteed**, and pays $\\Theta(n)$ per insertion because everything after the new key shifts. The tree inserts in $\\Theta(h)$ and searches in $\\Theta(h)$ — better on insertion, and *unguaranteed* on search. That is a trade, not a victory: we moved the cost rather than removing it, and we handed control of the search cost to whoever chooses the insertion order. Which is the problem the next lesson exists to solve.",
      layers: [
        {
          kind: "math-note",
          title: "The average case, and its assumption",
          body: "Over insertion orders drawn uniformly at random, the expected height is $\\Theta(\\log n)$. That is a real theorem and it is worth knowing — but its assumption is that the *order* is random, which is precisely the thing an adversary, a sorted import, or a monotonically increasing id will not give you. It is offered here as depth, and it is never what this lesson claims.",
        },
        {
          kind: "looking-ahead",
          title: "Forcing the shape",
          body: "If the cost is the height, and the height is chosen by data you do not control, the obvious move is to stop letting the data choose. That is what a red–black tree does: it accepts a slightly taller tree than the perfectly balanced one in exchange for a *guarantee*, by repairing the shape as keys arrive.",
        },
      ],
    },
  ],

  formalBlocks: [
    {
      id: "def-bst",
      kind: "definition",
      label: "Binary search tree",
      statement:
        "A binary tree over an ordered key set is a **binary search tree** when, for every node, every key in its left subtree is smaller than the node's key and every key in its right subtree is larger.",
      interpretation:
        "Read this as the *correctness condition of a decision procedure*, not as a filing rule: it says exactly that descending on a comparison never discards the block containing the key you are looking for.",
      visibility: "visible",
    },
    {
      id: "thm-interval",
      kind: "theorem",
      label: "Legality is an inherited interval",
      statement:
        "The keys reachable at a node form an interval $(lo, hi)$ determined by the whole path from the root. A binary tree is a binary search tree if and only if every node's key lies strictly inside its inherited interval.",
      interpretation:
        "Going left from a node with key $v$ sets $hi = v$; going right sets $lo = v$. Checking a node against its parent alone is a strictly weaker test, and it accepts trees this one rejects.",
      visibility: "visible",
    },
    {
      id: "thm-inorder",
      kind: "theorem",
      label: "In-order traversal is shape-independent",
      statement:
        "For every binary search tree over a key set $K$, the in-order traversal (left subtree, then node, then right subtree) emits $K$ in increasing order.",
      interpretation:
        "Every legal shape reads out the same sequence. So the shape carries no information about *what* is stored — only about what it costs to find it.",
      visibility: "visible",
    },
    {
      id: "thm-height-bounds",
      kind: "theorem",
      label: "How short and how tall",
      statement:
        "A binary tree with $n \\ge 1$ nodes has height $h$ satisfying $\\lceil \\log_2(n+1) \\rceil - 1 \\le h \\le n-1$, and **both** bounds are attained — the lower by inserting the median first and recursing, the upper by inserting in sorted order.",
      interpretation:
        "The lower bound is a genuine limit on every binary tree, from counting: at most $2^d$ nodes sit at depth $d$, so $n \\le 2^{h+1}-1$. The upper bound is not a pathology to be waved away — it is what sorted input actually produces.",
      visibility: "visible",
      layers: [
        {
          kind: "why",
          title: "Why the ceiling, and why the −1",
          body: "Height is counted in **edges** here, so a single node has height 0 and a tree with $h$ edges on its longest path has $h+1$ levels. Solving $n \\le 2^{h+1}-1$ for $h$ gives $h \\ge \\log_2(n+1) - 1$, and since $h$ is an integer it rounds up.",
        },
      ],
    },
  ],

  checkpoint: {
    prompt:
      "Same seven keys $\\{2,5,9,11,14,18,25\\}$, two insertion orders. Order A: $11, 5, 2, 9, 18, 14, 25$. Order B: $2, 5, 9, 11, 14, 18, 25$. Before you build either — which one makes the worst-case search cheaper, and roughly how many comparisons does each one cost?",
    answer:
      "Order A inserts the median first, then each half's median, so it builds the balanced tree: height 2, and a worst-case search of **3 comparisons**. Order B is sorted, so every key is larger than all its predecessors and walks to the rightmost leaf: a seven-node chain of height 6, and a worst-case search of **7 comparisons**. Same keys, same rule, and the same sorted in-order readout from both — but more than twice the cost.",
  },

  workedExamples: [
    {
      id: "wex-inorder-why",
      title: "Why in-order sorts, for every shape",
      prompt:
        "The claim is not about a particular tree, so the argument cannot be about a particular picture. Take any node and its inherited interval, and induct on subtree size.",
      equations: [
        "\\text{keys}(x) \\;=\\; \\text{keys}(x.\\text{left}) \\;\\cup\\; \\{x.\\text{key}\\} \\;\\cup\\; \\text{keys}(x.\\text{right})",
        "\\text{keys}(x.\\text{left}) \\subset (lo,\\; x.\\text{key}) \\qquad \\text{keys}(x.\\text{right}) \\subset (x.\\text{key},\\; hi)",
        "\\text{inorder}(x) \\;=\\; \\text{inorder}(x.\\text{left}) \\,\\Vert\\, [\\,x.\\text{key}\\,] \\,\\Vert\\, \\text{inorder}(x.\\text{right})",
        "\\text{sorted} \\;\\Vert\\; [\\,x.\\text{key}\\,] \\;\\Vert\\; \\text{sorted} \\;=\\; \\text{sorted}",
      ],
      layers: [
        {
          kind: "math-note",
          title: "Where the hypothesis is used",
          body: "The last line is only valid because of the second: everything on the left is *strictly below* $x.\\text{key}$ and everything on the right is *strictly above* it. Concatenating two sorted lists around a separator sorts only when the separator lies between them — which is precisely the search-tree condition, and precisely what the invalid tree in the previous section breaks.",
        },
      ],
    },
    {
      id: "wex-height-induction",
      title: "How many nodes fit in a tree of height h",
      prompt:
        "Count the widest a binary tree can be, level by level; the height bound is what falls out.",
      equations: [
        "\\text{nodes at depth } d \\;\\le\\; 2^{d}",
        "n \\;\\le\\; \\sum_{d=0}^{h} 2^{d} \\;=\\; 2^{h+1} - 1",
        "2^{h+1} \\;\\ge\\; n + 1",
        "h \\;\\ge\\; \\log_2(n+1) - 1 \\;\\;\\Longrightarrow\\;\\; h \\;\\ge\\; \\lceil \\log_2(n+1) \\rceil - 1",
      ],
      layers: [
        {
          kind: "why",
          title: "The induction, in one line",
          body: "Depth 0 holds exactly one node. If depth $d$ holds at most $2^{d}$ nodes and each has at most two children, depth $d+1$ holds at most $2^{d+1}$. That is the whole step — the geometric sum then does the rest.",
        },
        {
          kind: "connection",
          title: "The same counting argument, elsewhere",
          body: "Bounding a *decision* tree by its number of leaves is how the $\\Omega(n \\log n)$ comparison-sorting bound is proved. Same counting, different question — an architectural connection rather than an exact one.",
        },
      ],
    },
  ],

  callouts: [
    {
      id: "logn-is-not-guaranteed",
      title: "“Binary search tree search is $O(\\log n)$”",
      belief:
        "The structure is called a *binary search* tree, and binary search is logarithmic, so searching one must be logarithmic too.",
      confront:
        "Insert $4, 8, 15, 16, 23, 42, 50$ in that order. Every key is larger than everything already in the tree, so every insertion walks to the rightmost leaf. The result is a seven-node chain, and finding 50 takes **seven** comparisons — the same as scanning a list.",
      resolve:
        "Search costs $\\Theta(h)$, not $\\Theta(\\log n)$. It is logarithmic only under a balance assumption, and nothing in this lesson provides one. Saying “$O(\\log n)$” without that qualifier is not a shorthand; it is the claim the chain disproves.",
    },
    {
      id: "descending-does-not-halve",
      title: "“Going down a level halves the problem”",
      belief:
        "Binary search halves the interval at every probe, and the tree is binary search — so a level of the tree must halve the remaining keys.",
      confront:
        "In the chain above, descending one level removes exactly **one** key, not half of them. The interval does narrow at every step, as the theorem says — but narrowing is not halving.",
      resolve:
        "Halving is a property of the *balanced* member of the family, where each node's key really is the median of its subtree. It is inherited from the array bridge, and it is the intuition that has to be dropped when the bridge is put away.",
    },
    {
      id: "same-keys-same-tree",
      title: "“All trees on the same keys are basically the same”",
      belief:
        "They store the same keys and read out in the same order, so any difference is cosmetic.",
      confront:
        "They do read out identically — the in-order sequence is invariant, and the explorer's readout never changes no matter how you reorder the insertions. The height readout beside it does.",
      resolve:
        "The sequence is shared; the cost is not. Shape carries no information about *what* is stored and all of the information about what it costs to reach it.",
    },
  ],

  checkpoints: [],

  exercises: [
    {
      id: "bst-invariant-recall",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "What is the binary-search-tree ordering condition actually *for*?",
      choices: [
        "It guarantees that descending on a comparison never discards the block containing the key you are looking for.",
        "It keeps the nodes physically sorted in memory, so a traversal is fast.",
        "It makes the tree balanced, so searches take $O(\\log n)$ time.",
        "It is a convention, so that different implementations agree on which child is which.",
      ],
      correctChoice: 0,
      explanation:
        "The condition is the *correctness condition of a decision procedure*. It is not about memory layout (nodes can sit anywhere), it does not imply balance (a sorted insertion order satisfies it and still produces a chain), and it is not arbitrary — reverse it and search stops working.",
    },
    {
      id: "bst-search-trace",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt: `Keys ${BST_FRESH_TRACE.order!.join(", ")} are inserted in that order, then you search for ${BST_FRESH_TRACE.target}. Give the comparisons the search actually performs, in order.`,
      config: {
        steps: [
          {
            kind: "numeric",
            prompt: "Which key is compared first?",
            expected: 31,
            explanation:
              "The first insertion becomes the root, and every search starts there.",
          },
          {
            kind: "numeric",
            prompt: "Second comparison?",
            expected: 12,
            explanation: "20 < 31, so the search goes left, to 12.",
          },
          {
            kind: "numeric",
            prompt: "Third comparison?",
            expected: 20,
            explanation:
              "20 > 12, so the search goes right — and 20 was inserted there, so it is found.",
          },
          {
            kind: "numeric",
            prompt: "How many comparisons did the search cost in total?",
            expected: 3,
            explanation:
              "The key sits at depth 2, and cost is depth + 1. Every node on the path costs exactly one comparison — that is the identity, not an estimate.",
          },
        ],
      },
    },
    {
      id: "bst-order-predicts-shape",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt: `A different key set: ${BST_ORDERS_PAIR.sorted.join(", ")}. Order A inserts ${BST_ORDERS_PAIR.medianFirst.join(", ")}; order B inserts them in increasing order. Work out what each order costs — before building either tree.`,
      config: {
        steps: [
          {
            kind: "numeric",
            prompt: "Worst-case comparisons for a search in the tree built by order A?",
            expected: 3,
            explanation:
              "Order A is median-first, so it builds the balanced tree: height 2, and cost = height + 1 = 3.",
          },
          {
            kind: "numeric",
            prompt: "Worst-case comparisons for the tree built by order B?",
            expected: 7,
            explanation:
              "Sorted input sends every key to the rightmost leaf, so the tree is a seven-node chain of height 6, costing 7.",
          },
          {
            kind: "text",
            prompt:
              "Do the two trees read out the same sorted sequence under in-order traversal? Answer yes or no.",
            accept: ["yes", "y", "they do", "same"],
            explanation:
              "Yes — in-order traversal is shape-independent. The sequence is shared; only the cost differs.",
          },
        ],
      },
    },
    {
      id: "bst-invalid-local-check",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt:
        "This tree has root 25, with 10 as its left child and 30 as its right child; 30 in turn has 20 as *its* left child. Every node is larger than its left child and smaller than its right child — yet it is not a binary search tree. Find the problem.",
      config: {
        steps: [
          {
            kind: "numeric",
            prompt: "Which key is in the wrong place?",
            expected: 20,
            explanation:
              "20 is the only key that violates an inherited interval; 10 and 30 are both fine.",
          },
          {
            kind: "numeric",
            prompt: "What is the LOWER bound of the interval that position inherits?",
            expected: 25,
            explanation:
              "Reaching that position means going right at the root (25), which sets $lo = 25$: only keys above 25 may live anywhere in that subtree.",
          },
          {
            kind: "numeric",
            prompt: "And the UPPER bound?",
            expected: 30,
            explanation:
              "Then going left at 30 sets $hi = 30$. The position's legal range is $(25, 30)$, and 20 is not in it.",
          },
          {
            kind: "multiple-choice",
            prompt: "Why does the parent–child check miss this?",
            choices: [
              "It only compares a node with its immediate children, so a key that is out of range with respect to an *ancestor* passes unnoticed.",
              "It compares the wrong way round — it should check that the left child is larger.",
              "It works, but only if the tree is balanced.",
              "It misses it because the tree contains an even number of nodes.",
            ],
            correctChoice: 0,
            explanation:
              "20 < 30 satisfies its parent perfectly. The constraint it breaks comes from 25, two levels up — which is exactly what an inherited interval records and a local comparison forgets. A search for 20 would go left at 25 and never look here.",
          },
        ],
      },
    },
    {
      id: "bst-construct-minimum-height",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt: `Build a tree on ${BST_SEVEN.sorted.join(", ")} with the smallest possible height, by choosing the insertion order yourself.`,
      config: {
        steps: [
          {
            kind: "numeric",
            prompt:
              "Which key must you insert FIRST? (Only one choice reaches the minimum.)",
            expected: 16,
            explanation:
              "16 is the median. The root splits the keys into the two subtrees, so any other root leaves more than three keys on one side — and three keys need two more levels, not one.",
          },
          {
            kind: "numeric",
            prompt: "What is the minimum height (in edges) for these seven keys?",
            expected: 2,
            explanation:
              "$\\lceil \\log_2 8 \\rceil - 1 = 2$: three levels holding 1, 2 and 4 keys.",
          },
          {
            kind: "multiple-choice",
            prompt: "Why can no insertion order do better?",
            choices: [
              "At most $2^d$ nodes fit at depth $d$, so a tree of height 1 holds at most 3 keys — fewer than 7.",
              "Because insert-at-leaf always produces a balanced tree when you start from the median.",
              "Because seven is odd, and odd key counts always give height 2.",
              "Because in-order traversal has to return the keys in sorted order.",
            ],
            correctChoice: 0,
            explanation:
              "It is a counting bound, and it applies to every binary tree however it was built — not just to the ones insert-at-leaf can produce.",
          },
        ],
      },
    },
    {
      id: "bst-choose-structure",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "You are storing a set of integer ids that arrives incrementally, and you must support lookups throughout. The ids happen to arrive in increasing order. Which of these does the job best, and why?",
      choices: [
        "A sorted array — the tree would degenerate to a chain on this input, and the array's search guarantee survives.",
        "A binary search tree — insertion is cheaper than shifting an array, and searches will be logarithmic.",
        "A binary search tree — in-order traversal keeps the ids sorted for free.",
        "Either one; on the same keys they behave the same way.",
      ],
      correctChoice: 0,
      explanation:
        "The workload names the trap: increasing arrival order is exactly what makes insert-at-leaf build a chain, so the tree gives up its search cost precisely on this input. The array keeps its $\\Theta(\\log n)$ guarantee, and its $\\Theta(n)$ insert is a *shift* — cheap per element and, for append-at-the-end input, the best case. Option 3 is true but irrelevant to the cost question; option 4 is the misconception this lesson exists to break.",
    },
    {
      id: "bst-inorder-why",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt:
        "Prove it: show that in-order traversal of **any** binary search tree emits its keys in increasing order. Your argument must work for every shape, so it cannot appeal to a picture.",
      config: {
        modelAnswer:
          "Induct on subtree size. A subtree of size 0 emits the empty sequence, which is sorted. For a node $x$ with inherited interval $(lo, hi)$: by the search-tree condition every key in $x.\\text{left}$ is strictly less than $x.\\text{key}$, and every key in $x.\\text{right}$ is strictly greater. By the inductive hypothesis $\\text{inorder}(x.\\text{left})$ and $\\text{inorder}(x.\\text{right})$ are each sorted. In-order emits $\\text{inorder}(x.\\text{left})$, then $x.\\text{key}$, then $\\text{inorder}(x.\\text{right})$ — a sorted block entirely below $x.\\text{key}$, then $x.\\text{key}$, then a sorted block entirely above it. Concatenating two sorted sequences around a separator that lies strictly between them yields a sorted sequence, so the result is sorted. Nothing in the argument mentions the shape, which is why it holds for every legal one.",
        rubric:
          "A strong answer inducts on subtree size (or height), uses the search-tree condition to place the left block strictly below and the right block strictly above the node's key, and states why concatenation preserves sortedness. It must not assume balance, a particular shape, or a drawing. Noting that the argument never mentions shape — and that this is why the sequence is shape-independent — is the point.",
      },
    },
    {
      id: "bst-height-induction-step",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt:
        "Complete the argument: show that a binary tree of height $h$ has at most $2^{h+1}-1$ nodes, then derive the height lower bound $h \\ge \\lceil\\log_2(n+1)\\rceil - 1$. Say where each step is used.",
      config: {
        modelAnswer:
          "First, at most $2^{d}$ nodes sit at depth $d$, by induction on $d$: depth 0 holds exactly the root, one node $= 2^0$; and if depth $d$ holds at most $2^{d}$ nodes, then since each node has at most two children, depth $d+1$ holds at most $2 \\cdot 2^{d} = 2^{d+1}$. A tree of height $h$ has depths $0$ through $h$ only, so $n \\le \\sum_{d=0}^{h} 2^{d} = 2^{h+1}-1$ (geometric sum). Rearranging, $2^{h+1} \\ge n+1$, so $h+1 \\ge \\log_2(n+1)$, i.e. $h \\ge \\log_2(n+1) - 1$; and because $h$ is an integer, $h \\ge \\lceil \\log_2(n+1) \\rceil - 1$. The 'at most two children' fact is what makes the induction step work; the integrality of $h$ is what licenses the ceiling; and the bound is a statement about *every* binary tree, so it is a genuine lower bound rather than a property of one construction.",
        rubric:
          "A strong answer proves the per-depth bound by induction (naming the two-children hypothesis in the step), sums the geometric series over depths 0..h, rearranges correctly, and justifies the ceiling by integrality. It should also distinguish this lower bound — true of every binary tree — from the balanced *construction* that attains it.",
      },
    },
  ],

  keyTakeaway:
    "A binary search tree is binary search with the midpoints kept: every node is a comparison you already made, so the path you walk *is* the search and the depth *is* the cost. Every legal shape reads out the same sorted keys — but not for the same price, and it is the insertion order that picks the price.",

  structuredSummary: {
    coreMentalModel:
      "A binary search tree is a comparison-decision procedure over the keys, materialized in pointers — so its shape is not a property of the data, it is the algorithm you stored.",
    definitionsIntroduced: [
      "Binary search tree, as the correctness condition of a decision procedure",
      "Depth, height (in edges), and search cost $= \\text{depth} + 1$",
      "The inherited legal interval $(lo, hi)$ at a position",
    ],
    mainResult:
      "$\\lceil\\log_2(n+1)\\rceil - 1 \\le h \\le n-1$, with both ends attained — median-first insertion reaches the floor, sorted insertion reaches the ceiling — and worst-case search costs exactly $h+1$ comparisons.",
    representationsConnected:
      "Binary search's probe sequence on a sorted array is the root-to-node path of the *balanced* tree; the array and the tree are two members of one family of decision trees.",
    commonMistake:
      "Calling BST search $O(\\log n)$. It is $\\Theta(h)$, and sorted input makes $h = n-1$; “descending a level halves the problem” is an intuition borrowed from the array that only survives when the tree is balanced.",
    canonicalExample:
      "Seven keys $4, 8, 15, 16, 23, 42, 50$: median-first gives height 2 and a 3-comparison worst case; sorted order gives a chain of height 6 and a 7-comparison worst case.",
    oneProblemWorthRemembering:
      "The tree with root 25, right child 30, and 20 hanging off 30's left — every parent–child comparison passes, and it is still not a search tree.",
    whatThisUnlocksNext:
      "If cost is height and height is chosen by data you do not control, the next move is to take that choice away: a structure that repairs its own shape as keys arrive.",
  },
};
