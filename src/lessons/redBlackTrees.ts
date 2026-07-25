import { EXERCISE_SEQUENCE_ID, SELF_CHECK_ID } from "./capabilities";
import {
  RBT_BARE_ROTATION,
  RBT_BTREE_WIDE,
  RBT_CANONICAL,
  RBT_FOUR_NODE,
  RBT_FRESH_CLASSIFY,
} from "./exampleData";
import type { LessonDefinition } from "./types";

/**
 * Red–Black Trees — Algorithmic Thinking, unit `data-structures`.
 *
 * Built from `docs/courses/data-structures/lessons/red-black-trees/` (insight
 * contract `PASS` → mastery contract → lesson plan). The central insight: a
 * red-black tree *is* a binary encoding of a 2–3–4 tree, so the five colour
 * properties and the repair cases are consequences of one drawing rule rather
 * than a list to memorize.
 *
 * Two model decisions are inherited from `src/math/redBlackTrees` and stated to
 * the learner rather than hidden: splitting is **pre-emptive** (a full 4-node is
 * split on the way down, so promoting the middle really does leave two 2-nodes),
 * and 3-nodes are kept **left-leaning**, which the insight contract names as a
 * legal normalization that collapses the mirror cases.
 */
export const redBlackTreesLesson: LessonDefinition = {
  id: "red-black-trees",
  title: "Red–Black Trees: a 2–3–4 tree in disguise",
  subtitle: "Where the colour rules and the repair cases actually come from",
  learningObjectives: [
    "Given a 2–3–4 tree, produce its red-black encoding with the cluster boundaries marked — and read a red-black tree back as the 2–3–4 tree it encodes.",
    "Given a tree and a key, name the 2–3–4 node that receives it and its arity before insertion, then say whether the repair is nothing, a rotation, or a split — without a case table.",
    "Explain why a split preserves the subtree's external black height while moving the violation up one level.",
    "Complete the induction bounding a subtree of black height $bh$ below by $2^{bh}-1$ nodes, and derive the logarithmic height bound.",
    "Shown a rotation applied without its recolour, identify the path whose black count changed and supply the repair.",
    "Identify the only event that raises the tree's total black height, and say why it raises it on every path at once.",
    "Given a B-tree node of a branching order you have not seen, predict the split and name the promoted key.",
  ],
  motivatingQuestion:
    "Here are the five red–black properties and the insertion repair cases, exactly as a textbook prints them. Nothing in the list says why *these* rules, or why *these* cases. Where does it all come from — and could you have derived it yourself?",

  guidedSceneId: "red-black-encoding",
  explorationId: "red-black-encoding",
  exampleId: RBT_CANONICAL.id,

  route: [
    { kind: "motivate" },
    { kind: "section", sectionId: "rules-without-a-source" },
    { kind: "visual", heading: "One node, drawn two ways" },
    { kind: "section", sectionId: "the-encoding" },
    { kind: "formal", formalId: "def-encoding" },
    { kind: "formal", formalId: "thm-invariants-forced" },
    { kind: "section", sectionId: "split-is-a-recolour" },
    { kind: "check" },
    { kind: "formal", formalId: "thm-recolour" },
    { kind: "worked", workedId: "wex-split" },
    { kind: "section", sectionId: "bare-rotation-breaks-it" },
    { kind: "explore", tocLabel: "Insert on both sides at once" },
    { kind: "formal", formalId: "thm-height-bound" },
    { kind: "worked", workedId: "wex-height-induction" },
    { kind: "practice" },
    { kind: "summary", heading: "The colour bit records node membership" },
  ],

  sections: [
    {
      id: "rules-without-a-source",
      title: "Five rules and a case list, from nowhere",
      body: "Every node is red or black; the root is black; a red node has no red child; every root-to-leaf path passes the same number of black nodes; and the `nil` leaves count as black. Then a table of insertion cases: recolour here, rotate there, rotate twice in this configuration. Each rule is checkable and each case is followable, and none of it says where any of it came from. That is the actual problem — not difficulty, but a missing generator. A list you cannot re-derive is a list you have to hold in memory under exam conditions, and forget by Thursday.",
      observation:
        "The previous lesson ended on a problem: the cost is the height, and the insertion order — which you do not control — picks the height. This is the answer to that problem. It just arrives disguised as arbitrary bookkeeping.",
    },
    {
      id: "the-encoding",
      title: "A black node and its red children are one node",
      body: "Take a black node together with the red children hanging directly off it, and draw a ring around the cluster. That ring is one node of a **2–3–4 tree** — a search tree whose nodes hold one, two, or three keys, and whose leaves all sit at the same depth. A lone black node is a 2-node. A black node with one red child is a 3-node: two keys. A black node with two red children is a 4-node: three keys. Red does not mean *special* or *recently inserted*. It means: **I am an extra key glued into my parent's node.** The colour bit is a membership marker, and once you read it that way the five properties stop being axioms.",
      equation:
        "\\text{2-node} \\mapsto \\bullet \\qquad \\text{3-node} \\mapsto \\bullet\\!\\!-\\!\\!\\circ \\qquad \\text{4-node} \\mapsto \\circ\\!\\!-\\!\\!\\bullet\\!\\!-\\!\\!\\circ",
      layers: [
        {
          kind: "math-note",
          title: "Why we draw 3-nodes leaning one way",
          body: "A 3-node has two legal drawings — the extra key can hang left or right — and both encode the *same* node. Fixing the choice (here, always left) is a normalization: it collapses every mirror-image repair case into one, and it changes nothing about the 2–3–4 tree underneath. It is worth knowing that the freedom exists, and worth giving it up while learning the cases.",
        },
      ],
    },
    {
      id: "split-is-a-recolour",
      title: "Overflow, split, promote — in binary",
      body: "A 2–3–4 tree has exactly one event: a node overflows, so it **splits**, promoting its middle key into its parent and leaving two smaller nodes behind. Watch that happen on the encoded side and it is not a rearrangement at all — it is a **colour flip**. The two red children turn black, becoming their own 2-nodes, one level down; the black representative turns red, because it is now the promoted key, an extra key in its parent's node. No pointer moves. The split *is* the recolour. And because a red node adds a key without adding a black level, the new key can always be inserted red without breaking the equal-black-height rule — it can only ever break the no-two-reds rule, which is a drawing problem, not a structural one.",
      observation:
        "This is why a red-red pair is not a five-key node. It is a legal node drawn illegally — and a rotation redraws it, without changing how many keys it holds.",
      layers: [
        {
          kind: "why",
          title: "Why we split on the way down",
          body: "If you split a full node the moment you meet it, before placing the new key, the node has three keys: promote the middle and exactly two 2-nodes remain. Waiting until a fourth key has already arrived leaves a 2-node and a 3-node instead, and the parent may itself be full. Splitting pre-emptively means the key always lands somewhere with room, and every repair is local.",
        },
      ],
    },
    {
      id: "bare-rotation-breaks-it",
      title: "What a rotation alone does not do",
      body: "A rotation reshapes a subtree while preserving the in-order sequence — that is its whole job, and it is the reason it is safe to use at all. It is tempting to conclude that rotations are therefore harmless. They are not: a rotation moves a node from one side of the subtree to the other, and if that node is **black**, it moves a black node off some root-to-leaf paths and onto others. The counts stop matching. What makes a rotation safe is the **recolour it is always paired with** — the new subtree root inherits the old root's colour, and the old root becomes red. Order-preservation and black-height-preservation are two different jobs, done by two different halves of one operation.",
      layers: [
        {
          kind: "trap",
          title: "Try it, rather than believe it",
          body: "The explorer below has a **Rotate only (break it)** control for exactly this. Use it, then read the per-path black counts: one path will have gained a black node while the others did not. Then read the in-order row underneath, which will not have moved at all.",
        },
        {
          kind: "looking-ahead",
          title: "Deletion, by duality",
          body: "Everything here has a mirror. Insertion overflows and splits, promoting a key upward; deletion runs a **deficit** and either **merges** two nodes or **borrows** a key from a sibling, pulling a key downward. The 'double black' of deletion is the exact dual of insertion's 'double red'. That is a lesson of its own, and it is not this one.",
        },
      ],
    },
  ],

  formalBlocks: [
    {
      id: "def-encoding",
      kind: "definition",
      label: "The encoding",
      statement:
        "A 2–3–4 node maps to one **black representative** together with its extra keys as **red children**: a 2-node is a lone black node, a 3-node is a black node with one red child, and a 4-node is a black node with two red children.",
      interpretation:
        "Red means *an extra key inside my parent's node*; black means *I start a new level*. The colour bit records node membership, not importance and not recency.",
      visibility: "visible",
    },
    {
      id: "thm-invariants-forced",
      kind: "theorem",
      label: "The properties are the drawing rules",
      statement:
        "Under the encoding: **no red node has a red child** exactly when every extra key hangs off a black representative (the canonical drawing), and **every root-to-leaf path has the same number of black nodes** exactly when every 2–3–4 leaf sits at the same depth. Consequently the black height of the encoding equals the height of the 2–3–4 tree it encodes.",
      interpretation:
        "Neither property is an axiom about colours. Each is a restatement of something the 2–3–4 tree already guaranteed — one about how a node is drawn, one about the tree being level.",
      visibility: "visible",
    },
    {
      id: "thm-recolour",
      kind: "theorem",
      label: "A split preserves external black height",
      statement:
        "Flipping a black representative with two red children — the two reds to black, the representative to red — leaves the number of black nodes unchanged on every path that enters the cluster **from outside**, while making the representative red and so possibly creating a violation one level up.",
      interpretation:
        "Count from outside and the arithmetic is trivial: before, the representative contributes 1 and the reds contribute 0; after, the representative contributes 0 and whichever red the path takes contributes 1. The word *external* is doing real work — it is what makes the claim true.",
      visibility: "visible",
      layers: [
        {
          kind: "trap",
          title: "So a recolour does not make the tree taller",
          body: "It does not. It preserves the subtree's external black height and pushes the problem up one level, exactly as the promoted key arrives in the parent's node. The **total** black height changes on one occasion only: when the promotion reaches the root, the root is recoloured red and then forced black again — which adds one black node to the top of every path at once.",
        },
      ],
    },
    {
      id: "thm-height-bound",
      kind: "theorem",
      label: "Logarithmic height",
      statement:
        "A subtree of black height $bh$ contains at least $2^{bh}-1$ internal nodes. Hence $bh \\le \\log_2(n+1)$, and since no path may contain two reds in a row, $\\operatorname{height} \\le 2\\,bh \\le 2\\log_2(n+1)$.",
      interpretation:
        "The invariants do not merely describe a balanced tree — they *force* one. The factor of two is the price of the encoding: a path may alternate black and red, so it can be twice as long as the 2–3–4 tree is deep, and no longer.",
      visibility: "visible",
      layers: [
        {
          kind: "connection",
          title: "What this buys, against the previous lesson",
          body: "A plain binary search tree on sorted input degenerates to a chain of height $n-1$. The same input here stays within $2\\log_2(n+1)$ — because the structure repairs its own shape as the keys arrive, instead of letting them choose it.",
        },
        {
          kind: "math-note",
          title: "How much repair work, and for which variant",
          body: "Per insertion: $O(1)$ rotations, and $O(\\log n)$ recolourings in the worst case with $O(1)$ amortized over a sequence. That amortized figure is **variant-specific** — it is stated for standard bottom-up insertion. Deletion has its own analysis, and the left-leaning variant has a different case profile. It is not a universal law about red-black trees.",
        },
      ],
    },
  ],

  checkpoint: {
    prompt: `A node already holds three keys — $\\{${RBT_FOUR_NODE.keys.join(", ")}\\}$ — and the key $${RBT_FOUR_NODE.arriving}$ is arriving. Before you look: does the repair recolour, or does it need a rotation first? Say which, and what tells you.`,
    answer: `It recolours. Three keys means a **4-node**, drawn as a black representative with two red children — which is the canonical drawing, so nothing needs redrawing. A full node has no room, so it splits: the middle key $${RBT_FOUR_NODE.promoted}$ is promoted into the parent and the two reds become black, each its own 2-node. In binary that split *is* the colour flip. A rotation is needed only when the reds are mis-oriented — a red hanging off a red — which is a legal node drawn illegally, and has nothing to do with being full.`,
  },

  workedExamples: [
    {
      id: "wex-split",
      title: "The split, counted from outside",
      prompt:
        "Take a black representative $g$ with red children $p$ and $u$, and count black nodes on a path entering the cluster from above.",
      equations: [
        "\\text{before:}\\quad g\\,(\\text{black}) = 1,\\quad p \\text{ or } u\\,(\\text{red}) = 0 \\;\\;\\Rightarrow\\;\\; 1",
        "\\text{after:}\\quad g\\,(\\text{red}) = 0,\\quad p \\text{ or } u\\,(\\text{black}) = 1 \\;\\;\\Rightarrow\\;\\; 1",
        "\\text{external } bh \\text{ unchanged}",
        "g \\text{ is now red} \\;\\Rightarrow\\; \\text{a violation may appear one level up}",
      ],
      layers: [
        {
          kind: "math-note",
          title: "Where the hypothesis is used",
          body: "The path must enter **through $g$**, from outside the cluster. Count from $g$ downward instead — excluding $g$ itself — and the two numbers are 1 and 2, and the claim is false. The qualifier is not decoration; it is the theorem.",
        },
      ],
    },
    {
      id: "wex-height-induction",
      title: "Why the invariants force a logarithmic height",
      prompt:
        "Bound the number of nodes below a given black height, then invert the bound.",
      equations: [
        "\\text{a subtree of black height } bh \\text{ has} \\ge 2^{bh} - 1 \\text{ internal nodes}",
        "n \\;\\ge\\; 2^{bh} - 1 \\;\\;\\Longrightarrow\\;\\; bh \\;\\le\\; \\log_2(n+1)",
        "\\text{no two reds in a row} \\;\\Longrightarrow\\; \\text{path length} \\le 2\\,bh",
        "\\operatorname{height} \\;\\le\\; 2\\,bh \\;\\le\\; 2\\log_2(n+1)",
      ],
      layers: [
        {
          kind: "why",
          title: "The induction, in one line",
          body: "A `nil` leaf has $bh = 0$ and $0 = 2^0 - 1$ internal nodes. Otherwise each child has black height at least $bh - 1$ (only a *black* child decrements the count), so by hypothesis each child subtree holds at least $2^{bh-1}-1$ nodes, and $2(2^{bh-1}-1) + 1 = 2^{bh}-1$.",
        },
      ],
    },
  ],

  callouts: [
    {
      id: "red-red-is-not-a-five-node",
      title: "“Two reds in a row means five keys”",
      belief:
        "A black node with two red children is a 4-node, so a red hanging off a red must be the next size up — a 5-node, which is why it has to be broken apart.",
      confront:
        "Count the keys. A red child of a red child of a black node is still three keys in that cluster: the same 4-node. Nothing was added — it was drawn in the non-canonical orientation. A rotation redraws it, and the key count is identical before and after.",
      resolve:
        "A genuine overflow is a *full* node receiving another key, and it is repaired by a split (a recolour), not by a rotation. Red-red is a drawing problem; overflow is a capacity problem. Confusing them is what makes the case table look arbitrary.",
    },
    {
      id: "bare-rotation-is-safe",
      title: "“A rotation preserves black height”",
      belief:
        "Rotations preserve the in-order sequence, and the tree's invariants are about order — so a rotation cannot break anything.",
      confront:
        "Use **Rotate only (break it)** in the explorer. The in-order row does not move, exactly as expected. The per-path black counts do: one path gains a black node while the rest stay put, and the tree is no longer legal.",
      resolve:
        "The rotation restores *order*; the recolour it is paired with restores the *black-height* rule. They are two jobs. A rotation on its own does only the first.",
    },
    {
      id: "violation-token-is-conserved",
      title: "“The violation moves around like an object”",
      belief:
        "The marker slides up the tree with each recolour, so it must be a thing being carried — conserved until it is finally discharged.",
      confront:
        "A rotation does not move it anywhere; it consumes it. And a split at the root does not pass it on either — the root is simply recoloured black, and the whole tree gains a level.",
      resolve:
        "It is a *repair state*, not a token: a marker for where the invariant is currently broken. Useful for tracking the process, misleading if taken literally.",
    },
    {
      id: "recolour-raises-the-tree",
      title: "“A recolour makes the tree taller”",
      belief:
        "A recolour turns black nodes red and red nodes black, so it must change how many black nodes a path crosses.",
      confront:
        "Count from outside the cluster: one black before, one black after. The subtree's external black height is unchanged — that is the theorem.",
      resolve:
        "Only a split that reaches the **root** changes the total, and it changes it uniformly: the root is forced black again, adding one black node to the top of every path at once. Equivalently, the 2–3–4 tree grew one level.",
    },
  ],

  exercises: [
    {
      id: "rbt-colour-recall",
      type: "multiple-choice",
      tier: "check",
      prompt: "What does the colour bit on a node actually record?",
      choices: [
        "Whether the node is an extra key inside its parent's 2–3–4 node (red), or starts a new level (black).",
        "How recently the node was inserted — new nodes are red and settle to black over time.",
        "Which side of its parent the node hangs off, so the rotation cases can be told apart.",
        "How deep the node is, so the tree can check its own balance in constant time.",
      ],
      correctChoice: 0,
      explanation:
        "It is a membership marker. Reading it as recency or as position is what makes the properties look arbitrary — and neither reading survives the encoding, in which red children are precisely the extra keys of their parent's node.",
    },
    {
      id: "rbt-encode-decode",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "A red-black tree has black 40 at the root; 40's left child is a **red** 20, whose children are black 10 and black 30; 40's right child is a black 60, whose children are **red** 50 and **red** 70. Ring the clusters and read off the 2–3–4 tree.",
      config: {
        steps: [
          {
            kind: "numeric",
            prompt: "How many keys are in the 2–3–4 node at the root?",
            expected: 2,
            explanation:
              "Black 40 with its red child 20 is one cluster: the 3-node {20, 40}. The reds hanging off 40 are part of 40's node, not children of it.",
          },
          {
            kind: "numeric",
            prompt: "How many keys are in the 2–3–4 node containing 60?",
            expected: 3,
            explanation:
              "Black 60 with two red children is a 4-node: {50, 60, 70}.",
          },
          {
            kind: "numeric",
            prompt: "How many 2–3–4 nodes does the whole tree decode to?",
            expected: 4,
            explanation:
              "The root {20, 40}, then {10}, {30}, and {50, 60, 70}. Seven keys in four nodes — and every leaf at the same depth, which is what the equal-black-height rule was saying all along.",
          },
          {
            kind: "numeric",
            prompt:
              "What is the black height of the red-black tree (nil leaves counted, the root itself not)?",
            expected: 2,
            explanation:
              "Two, matching the 2–3–4 tree's height. Reds add keys within a level; only blacks start new ones.",
          },
        ],
      },
    },
    {
      id: "rbt-classify-repair",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt: `A different tree: keys ${RBT_FRESH_CLASSIFY.order.join(", ")} were inserted in that order, and it decodes to the 2–3–4 tree with root {3, 8}, children {1}, {4, 6} and {11, 14}. The key $${RBT_FRESH_CLASSIFY.arriving}$ now arrives.`,
      config: {
        steps: [
          {
            kind: "text",
            prompt:
              "Which 2–3–4 node receives it? Give its keys, smallest first, separated by a comma.",
            accept: ["11, 14", "11,14", "{11, 14}", "{11,14}"],
            explanation:
              "13 is larger than 8, so it goes right, into the node holding 11 and 14 — and 13 falls between them.",
          },
          {
            kind: "numeric",
            prompt: "What is that node's arity BEFORE the insertion?",
            expected: 3,
            explanation:
              "Two keys means a 3-node. This is the number that decides everything else: a 3-node has room, so nothing splits.",
          },
          {
            kind: "multiple-choice",
            prompt: "So what does the repair do?",
            choices: [
              "Rotates, because the new red lands under a red — a legal node drawn illegally.",
              "Nothing at all: the node had room, so the drawing is already canonical.",
              "Splits, promoting the middle key into the parent.",
              "Splits, and then rotates, because the parent is also full.",
            ],
            correctChoice: 0,
            explanation:
              "The node has room, so no split — but 13 lands between 11 and 14, which puts the new red beneath the existing red. That is the same 4-node, drawn illegally, and a rotation redraws it. Reading only 'has room ⇒ nothing to do' misses the orientation half.",
          },
        ],
      },
    },
    {
      id: "rbt-bare-rotation-diagnose",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt: `Start from the tree in the first exercise (black 40; red 20 over black 10 and black 30; black 60 over red 50 and red 70) — every root-to-nil path crosses 2 black nodes. Now apply a **bare** rotation at ${RBT_BARE_ROTATION.at}: rotate it ${RBT_BARE_ROTATION.direction}, and do **not** recolour anything. The result has black 30 in 20's old place, with red 20 beneath it and black 10 beneath that.`,
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt: "First: did the in-order sequence change?",
            choices: [
              "No — a rotation always preserves the in-order sequence.",
              "Yes — 20 and 30 swapped places, so the keys now read out in a different order.",
              "Only for the subtree that was rotated.",
              "It depends on the colours of the nodes involved.",
            ],
            correctChoice: 0,
            explanation:
              "Order-preservation is exactly what a rotation is for, and it does that job perfectly. Which is why the damage is easy to miss.",
          },
          {
            kind: "numeric",
            prompt: `Which leaf's root-to-nil path now crosses a different number of black nodes? Give the key.`,
            expected: RBT_BARE_ROTATION.brokenPathLeaf,
            explanation:
              "The path to 10 now goes 40 (black) → 30 (black) → 20 (red) → 10 (black) → nil, so it crosses one more black node than before. Black 30 moved onto that path and off the others.",
          },
          {
            kind: "numeric",
            prompt: "How many black nodes does that path cross now?",
            expected: 3,
            explanation:
              "Three, against two on every other path. The equal-black-height property is broken — by a rotation, which supposedly could not break anything.",
          },
          {
            kind: "multiple-choice",
            prompt: "What is the missing half of the operation?",
            choices: [
              "The recolour: the new subtree root takes the old root's colour, and the old root becomes red.",
              "A second rotation in the opposite direction, which restores the shape.",
              "A split of the affected node, which promotes its middle key.",
              "Nothing — the tree self-corrects on the next insertion.",
            ],
            correctChoice: 0,
            explanation:
              "The paired recolour is what restores the black-height rule. Rotation does order; recolour does black height. Treating the rotation as the whole operation is what makes 'rotations are safe' feel true right up until it isn't.",
          },
        ],
      },
    },
    {
      id: "rbt-root-split",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt: `Insert ${RBT_CANONICAL.order.join(", ")} into an empty red-black tree, in that order, watching the tree's TOTAL black height.`,
      config: {
        steps: [
          {
            kind: "numeric",
            prompt:
              "After inserting which key does the total black height first reach 2?",
            expected: 40,
            explanation:
              "Inserting 40 causes a split that reaches the root; the root is recoloured red and then forced black again, which adds a black node to the top of every path.",
          },
          {
            kind: "numeric",
            prompt: "What is the total black height after all seven keys?",
            expected: 2,
            explanation:
              "Still 2 — the later splits are not root splits, so they preserve external black height and change no total.",
          },
          {
            kind: "multiple-choice",
            prompt:
              "Why is a root split the only event that can change the total?",
            choices: [
              "Every other repair preserves external black height; only re-blackening the root adds a black node to every path at once.",
              "Because the root is the only node that is allowed to be black.",
              "Because rotations near the root move more nodes than rotations near the leaves.",
              "Because the root is the only node whose colour is ever changed.",
            ],
            correctChoice: 0,
            explanation:
              "A local split trades the representative's black for a child's, leaving external counts alone and moving the violation up. Only at the root is there no parent to move it to — so it is absorbed by growing every path by one.",
          },
        ],
      },
    },
    {
      id: "rbt-btree-transfer",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt: `A search tree of a different shape entirely: each node holds up to **five** keys, and all leaves sit at the same depth. One node currently holds $\\{${RBT_BTREE_WIDE.keys.join(", ")}\\}$ and is full when another key arrives.`,
      config: {
        steps: [
          {
            kind: "numeric",
            prompt: "Which key is promoted into the parent?",
            expected: RBT_BTREE_WIDE.promoted,
            explanation:
              "The middle one. Nothing about that depended on the number four — it is what splitting a full node means at any branching order.",
          },
          {
            kind: "numeric",
            prompt: "How many keys does each half keep?",
            expected: RBT_BTREE_WIDE.keysPerHalf,
            explanation:
              "Five keys, one promoted, two on each side. A 2–3–4 tree is simply this at order four, which is why its splits looked the way they did.",
          },
        ],
      },
    },
    {
      id: "rbt-external-bh-explain",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt:
        "Explain why a split preserves the subtree's **external** black height, by counting black nodes on a path that enters the cluster from outside. Then say what would go wrong if the word *external* were dropped.",
      config: {
        modelAnswer:
          "Let $g$ be the black representative with red children $p$ and $u$, and take any path that reaches the subtree from above — so it enters through $g$. Before the split, $g$ is black and contributes 1, and whichever of $p, u$ the path continues through is red and contributes 0: total 1 from the cluster. After the split, $g$ is red and contributes 0, and whichever of $p, u$ the path takes is now black and contributes 1: total 1 again. Every path through the subtree crosses the same number of black nodes as before, so the subtree's external black height is unchanged and the equal-black-height property still holds below. What has changed is that $g$ is now red, so if $g$'s parent is red there is a violation one level up — which is exactly the promoted key arriving in the parent's node. Drop 'external' and the claim is false: measured from $g$ downward, excluding $g$ itself, the count goes from 1 to 2, because the child that used to be red is now black. The theorem is about paths entering through $g$, not about paths starting at it.",
        rubric:
          "A strong answer counts black nodes on a path entering **through $g$** (so $g$'s own colour is included), gets 1 before and 1 after, and concludes external black height is preserved. It must then note that $g$ turning red is what can create a violation one level up — the split does not fix the problem, it relocates it. Full credit needs the final part: measuring from $g$ exclusive gives 1 and 2, so the qualifier 'external' is load-bearing rather than decorative.",
      },
    },
    {
      id: "rbt-height-induction-step",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt:
        "Prove that a subtree of black height $bh$ contains at least $2^{bh}-1$ internal nodes, then derive $\\operatorname{height} \\le 2\\log_2(n+1)$. Say where each property is used.",
      config: {
        modelAnswer:
          "Induct on the height of the subtree rooted at $x$. If $x$ is a `nil` leaf then $bh(x) = 0$ and it has $0 = 2^0 - 1$ internal nodes. Otherwise $x$ has two children, and each child $c$ satisfies $bh(c) \\ge bh(x) - 1$: only a *black* child decrements the count, so a red child has the same black height as $x$ and a black child has one less. By the inductive hypothesis each child's subtree has at least $2^{bh(x)-1}-1$ internal nodes, so $x$'s subtree has at least $2(2^{bh(x)-1}-1) + 1 = 2^{bh(x)}-1$. Applying this at the root, $n \\ge 2^{bh}-1$, hence $bh \\le \\log_2(n+1)$. Separately, the no-two-reds property means red nodes on any root-to-leaf path are non-adjacent, so at least half the nodes on the path are black and the path has at most $2\\,bh$ nodes. Combining: $\\operatorname{height} \\le 2\\,bh \\le 2\\log_2(n+1)$. The equal-black-height property is what makes '$bh$' well defined at all — without it there is no single number to bound — and the no-two-reds property is what converts a bound on black nodes into a bound on all nodes.",
        rubric:
          "A strong answer inducts correctly, justifies $bh(c) \\ge bh(x)-1$ by noting only black children decrement, and combines the two child subtrees plus $x$. It must then use **no-two-reds** to get $\\operatorname{height} \\le 2\\,bh$ — a bound on black nodes alone says nothing about path length — and should note that **equal black height** is what makes $bh$ a single well-defined quantity. Stating the result as a construction rather than a bound on every legal tree is a miss.",
      },
    },
  ],

  keyTakeaway:
    "A red-black tree is a 2–3–4 tree written in binary with one extra bit: red means “I am an extra key in my parent's node.” The five properties are that encoding's drawing rules, every repair case is an overflow-and-split seen through it, and the resulting height is at most $2\\log_2(n+1)$ — which is why the insertion order can no longer choose your search cost.",

  structuredSummary: {
    coreMentalModel:
      "A black node together with its red children is one node of a 2–3–4 tree; the colour bit records membership, not importance.",
    definitionsIntroduced: [
      "The encoding: 2-node, 3-node, 4-node as black representative plus red children",
      "Black height $bh$, counted from a node exclusive down to a `nil` leaf inclusive",
      "Split and promotion, and their binary image — the colour flip",
    ],
    mainResult:
      "The invariants are forced by the encoding, and they force $\\operatorname{height} \\le 2\\,bh \\le 2\\log_2(n+1)$.",
    representationsConnected:
      "2–3–4 node ↔ black cluster; overflow-and-split ↔ recolour; mis-oriented reds ↔ rotation-plus-recolour; black count on a path ↔ 2–3–4 depth.",
    commonMistake:
      "Reading a red-red pair as a five-key node (it is a legal node drawn illegally), and believing a bare rotation preserves black height (only the rotation *with* its recolour does).",
    canonicalExample:
      "Black 40, red 20 over black 10 and 30, black 60 over red 50 and 70 — which decodes to the 2–3–4 tree with root {20, 40} and children {10}, {30}, {50, 60, 70}.",
    oneProblemWorthRemembering:
      "A full node receiving another key: the middle is promoted, the two halves become 2-nodes, and in binary nothing moved — the colours flipped.",
    whatThisUnlocksNext:
      "B-trees are the same overflow-and-split at higher branching order, and deletion is the exact dual: deficit, merge, borrow.",
  },
};
