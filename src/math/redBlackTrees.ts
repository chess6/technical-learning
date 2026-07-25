/**
 * Pure red-black / 2–3–4 helpers for the Red–Black Trees lesson.
 *
 * The lesson's insight is that a red-black tree **is** a binary encoding of a
 * 2–3–4 tree, so this module keeps both objects and the maps between them, and
 * every repair the UI animates is produced here — never re-derived in a scene.
 *
 * **Conventions fixed once** (they match the lesson's insight contract):
 *
 * - **Black height** `bh(x)` counts black nodes on a path from `x` *exclusive*
 *   down to a `nil` leaf *inclusive* (CLRS). A leaf therefore has `bh = 1`, and
 *   `bh(null) = 0` because nothing lies below a `nil`.
 * - **Duplicates are rejected**, leaving the tree unchanged, so the in-order
 *   sequence can never repeat a key.
 *
 * **Two decisions this module makes deliberately, and why.**
 *
 * 1. **Splitting is pre-emptive (top-down).** A full 4-node is split *on the way
 *    down*, before the new key is placed. This is what makes the contract's own
 *    sentence — "the middle key is promoted into the parent, leaving two
 *    2-nodes" — literally true: a 4-node holds *three* keys, so promoting the
 *    middle leaves exactly two 2-nodes. Waiting until a fourth key has already
 *    arrived would leave a 2-node and a 3-node, which is not what the lesson
 *    animates or claims. (Recorded as a Gate-7 correction.)
 * 2. **3-nodes are kept left-leaning (the LLRB normalization).** The insight
 *    contract names this as a legal, explicitly-separate normalization: fixing
 *    the orientation "collapses mirror-image cases but does not change T". Doing
 *    so here makes `encode`/`decode` an exact bijection rather than one "up to
 *    orientation", which is what lets the round-trip be a test instead of a
 *    caveat. The mirror freedom still exists in general — it is a property of
 *    the unnormalized variant, not of the encoding.
 */

export type Colour = "red" | "black";

/** A node of a red-black tree. Immutable by convention; operations rebuild. */
export interface RBNode {
  readonly key: number;
  readonly colour: Colour;
  readonly left: RBNode | null;
  readonly right: RBNode | null;
}

/** A node of a 2–3–4 tree: 1–3 keys, and either 0 or `keys.length + 1` children. */
export interface Node234 {
  readonly keys: readonly number[];
  readonly children: readonly Node234[];
}

/** What a single insertion repair actually is, in 2–3–4 terms. */
export type RepairKind =
  /** The node had room and the reds were already drawn canonically. */
  | "none"
  /** A legal node drawn illegally: a rotation restores the canonical drawing. */
  | "rotate"
  /** A full 4-node split: the colour flip that promotes the middle key. */
  | "recolour-and-promote";

export interface RepairStep {
  readonly kind: RepairKind;
  /** The key of the node the repair acted on. */
  readonly at: number;
  /** For a split, the key promoted into the parent's 2–3–4 node. */
  readonly promoted?: number;
  /** Which rotation redrew the cluster, when `kind` is `"rotate"`. */
  readonly rotation?: "left" | "right";
}

export interface InsertResult {
  readonly tree: RBNode;
  /** Every repair the insertion performed, in the order it performed them. */
  readonly steps: readonly RepairStep[];
  /** True when the final forced re-blackening of the root raised the total bh. */
  readonly rootSplit: boolean;
}

export interface RepairClassification {
  /** Keys of the 2–3–4 node that receives the new key, before insertion. */
  readonly nodeKeys: readonly number[];
  /** Its arity before insertion: a 2-, 3-, or 4-node. */
  readonly arityBefore: 2 | 3 | 4;
  readonly kind: RepairKind;
}

export interface LegalityResult {
  readonly legal: boolean;
  readonly violations: readonly string[];
}

const isRed = (node: RBNode | null): boolean => node?.colour === "red";

const recolour = (node: RBNode, colour: Colour): RBNode => ({ ...node, colour });

/* -------------------------------------------------------------------------- */
/* Rotations and the colour flip                                              */
/* -------------------------------------------------------------------------- */

/**
 * Rotate left: the right child becomes the subtree root and inherits the old
 * root's colour; the old root becomes red. **Order-preserving, and paired with
 * its recolour** — see `rotateOnlyAt` for the bare version the lesson uses as a
 * counterexample.
 */
export function rotateLeft(node: RBNode): RBNode {
  const right = node.right;
  if (right === null) return node;
  return {
    key: right.key,
    colour: node.colour,
    left: { key: node.key, colour: "red", left: node.left, right: right.left },
    right: right.right,
  };
}

/** Rotate right, mirror of `rotateLeft`. */
export function rotateRight(node: RBNode): RBNode {
  const left = node.left;
  if (left === null) return node;
  return {
    key: left.key,
    colour: node.colour,
    left: left.left,
    right: { key: node.key, colour: "red", left: left.right, right: node.right },
  };
}

/**
 * The split, in binary: flip a black node's two red children to black and the
 * node itself to red. The two reds become their own 2–3–4 levels; the node
 * becomes the promoted middle key, now an extra key in its parent's node.
 */
export function flipColours(node: RBNode): RBNode {
  if (node.left === null || node.right === null) return node;
  return {
    key: node.key,
    colour: node.colour === "red" ? "black" : "red",
    left: recolour(node.left, node.left.colour === "red" ? "black" : "red"),
    right: recolour(node.right, node.right.colour === "red" ? "black" : "red"),
  };
}

/* -------------------------------------------------------------------------- */
/* Insertion                                                                   */
/* -------------------------------------------------------------------------- */

function insertRec(
  node: RBNode | null,
  key: number,
  steps: RepairStep[],
): RBNode {
  if (node === null) {
    // A new key is always red: it adds a key to its parent's 2–3–4 node without
    // adding a black level, so it cannot break the equal-black-height rule.
    return { key, colour: "red", left: null, right: null };
  }

  let current = node;

  // Pre-emptive split: a full 4-node met on the way down is split before the
  // new key is placed, so the key always lands in a node with room.
  if (isRed(current.left) && isRed(current.right)) {
    steps.push({
      kind: "recolour-and-promote",
      at: current.key,
      promoted: current.key,
    });
    current = flipColours(current);
  }

  if (key === current.key) return current; // duplicate: unchanged
  if (key < current.key) {
    current = { ...current, left: insertRec(current.left, key, steps) };
  } else {
    current = { ...current, right: insertRec(current.right, key, steps) };
  }

  // A red leaning right is a legal node drawn illegally — rotate to redraw it.
  if (isRed(current.right) && !isRed(current.left)) {
    steps.push({ kind: "rotate", at: current.key, rotation: "left" });
    current = rotateLeft(current);
  }
  // Two reds in a row on the left: the same illegal drawing, one level deeper.
  if (isRed(current.left) && isRed(current.left!.left)) {
    steps.push({ kind: "rotate", at: current.key, rotation: "right" });
    current = rotateRight(current);
  }

  return current;
}

/** Insert one key, recording every repair. Duplicates leave the tree unchanged. */
export function insertRB(root: RBNode | null, key: number): InsertResult {
  const steps: RepairStep[] = [];
  const grown = insertRec(root, key, steps);
  // (R1) The root is always black. Re-blackening a red root is the ONLY event
  // that raises the tree's total black height, and it does so on every path at
  // once — the 2–3–4 tree just grew one level taller.
  const rootSplit = grown.colour === "red";
  return {
    tree: rootSplit ? recolour(grown, "black") : grown,
    steps: steps.length === 0 ? [{ kind: "none", at: key }] : steps,
    rootSplit,
  };
}

export function insertAllRB(keys: readonly number[]): RBNode | null {
  let root: RBNode | null = null;
  for (const key of keys) root = insertRB(root, key).tree;
  return root;
}

/* -------------------------------------------------------------------------- */
/* Reading a red-black tree                                                    */
/* -------------------------------------------------------------------------- */

export function inOrderRB(root: RBNode | null): number[] {
  if (root === null) return [];
  return [...inOrderRB(root.left), root.key, ...inOrderRB(root.right)];
}

/** Black nodes from `node` (exclusive) down to a `nil` (inclusive). */
export function blackHeight(node: RBNode | null): number {
  if (node === null) return 0;
  const child = node.left;
  return (child === null ? 1 : (child.colour === "black" ? 1 : 0) + blackHeight(child));
}

/** The black count of every root→`nil` path — all equal in a legal tree. */
export function blackHeightsPerPath(root: RBNode | null): number[] {
  const out: number[] = [];
  const walk = (node: RBNode | null, count: number): void => {
    if (node === null) {
      out.push(count + 1); // the nil leaf itself is black
      return;
    }
    const next = count + (node.colour === "black" ? 1 : 0);
    walk(node.left, next);
    walk(node.right, next);
  };
  if (root === null) return [0];
  // The root's own colour is not counted (bh is measured from a node exclusive).
  walk(root.left, 0);
  walk(root.right, 0);
  return out;
}

export function heightRB(root: RBNode | null): number {
  if (root === null) return -1;
  return 1 + Math.max(heightRB(root.left), heightRB(root.right));
}

export function sizeRB(root: RBNode | null): number {
  if (root === null) return 0;
  return 1 + sizeRB(root.left) + sizeRB(root.right);
}

/** Every invariant the lesson derives from the encoding, checked by name. */
export function isLegalRB(root: RBNode | null): LegalityResult {
  const violations: string[] = [];
  if (root !== null && root.colour === "red") {
    violations.push(`root ${root.key} is red`);
  }
  const walk = (node: RBNode | null): void => {
    if (node === null) return;
    for (const child of [node.left, node.right]) {
      if (isRed(node) && isRed(child)) {
        violations.push(`red ${node.key} has red child ${child!.key}`);
      }
      walk(child);
    }
  };
  walk(root);
  const paths = blackHeightsPerPath(root);
  const first = paths[0]!;
  if (paths.some((count) => count !== first)) {
    violations.push(
      `unequal black heights on root→nil paths: ${[...new Set(paths)].sort().join(", ")}`,
    );
  }
  return { legal: violations.length === 0, violations };
}

/* -------------------------------------------------------------------------- */
/* The encoding: 2–3–4 ↔ red-black                                             */
/* -------------------------------------------------------------------------- */

/** One 2–3–4 node ↦ a black representative plus 0–2 red children. */
export function encode(node: Node234 | null): RBNode | null {
  if (node === null || node.keys.length === 0) return null;
  const kids = node.children.map((child) => encode(child));
  const [a, b, c] = node.keys;
  if (node.keys.length === 1) {
    return {
      key: a!,
      colour: "black",
      left: kids[0] ?? null,
      right: kids[1] ?? null,
    };
  }
  if (node.keys.length === 2) {
    // Left-leaning: the smaller key is the red child of the black representative.
    return {
      key: b!,
      colour: "black",
      left: {
        key: a!,
        colour: "red",
        left: kids[0] ?? null,
        right: kids[1] ?? null,
      },
      right: kids[2] ?? null,
    };
  }
  return {
    key: b!,
    colour: "black",
    left: { key: a!, colour: "red", left: kids[0] ?? null, right: kids[1] ?? null },
    right: { key: c!, colour: "red", left: kids[2] ?? null, right: kids[3] ?? null },
  };
}

/**
 * The inverse: a black node together with its red children is one 2–3–4 node.
 * This is the operation the lesson asks the learner to perform by eye.
 */
export function decode(root: RBNode | null): Node234 | null {
  if (root === null) return null;
  const keys: number[] = [];
  const childRoots: (RBNode | null)[] = [];

  const redLeft = isRed(root.left) ? root.left! : null;
  const redRight = isRed(root.right) ? root.right! : null;

  if (redLeft) {
    keys.push(redLeft.key);
    childRoots.push(redLeft.left, redLeft.right);
  } else {
    childRoots.push(root.left);
  }
  keys.push(root.key);
  if (redRight) {
    keys.push(redRight.key);
    childRoots.push(redRight.left, redRight.right);
  } else {
    childRoots.push(root.right);
  }
  keys.sort((x, y) => x - y);

  const children = childRoots
    .map((child) => decode(child))
    .filter((child): child is Node234 => child !== null);
  return { keys, children };
}

/** Depth of the 2–3–4 tree an encoding represents — equal to its black height. */
export function height234(node: Node234 | null): number {
  if (node === null) return 0;
  if (node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map((child) => height234(child)));
}

/* -------------------------------------------------------------------------- */
/* Classification — the outcome the lesson grades                              */
/* -------------------------------------------------------------------------- */

/**
 * Which 2–3–4 node receives `key`, its arity **before** the insertion, and what
 * the repair therefore is. The arity is the graded intermediate: it is what a
 * learner who understood the encoding can state, and what a learner reciting a
 * case table cannot.
 *
 * Derived from the real insertion, so the classification and the animation can
 * never disagree.
 */
export function classifyRepair(
  root: RBNode | null,
  key: number,
): RepairClassification {
  const tree234 = decode(root);
  // Walk the 2–3–4 tree to the leaf node that would receive the key.
  let node = tree234;
  while (node !== null && node.children.length > 0) {
    let index = node.keys.findIndex((k) => key < k);
    if (index < 0) index = node.keys.length;
    node = node.children[index] ?? null;
  }
  const nodeKeys = node?.keys ?? [];
  const arityBefore = (nodeKeys.length + 1) as 2 | 3 | 4;

  const steps = insertRB(root, key).steps;
  const kind: RepairKind = steps.some((s) => s.kind === "recolour-and-promote")
    ? "recolour-and-promote"
    : steps.some((s) => s.kind === "rotate")
      ? "rotate"
      : "none";

  return { nodeKeys, arityBefore, kind };
}

/**
 * A **bare** rotation — no accompanying recolour. Exported precisely because it
 * is wrong: the lesson uses it to show that a rotation alone does not preserve
 * black height, so that misconception is confronted by a demonstration rather
 * than a warning. Never call this to maintain a tree.
 */
export function rotateOnlyAt(
  root: RBNode | null,
  key: number,
  direction: "left" | "right",
): RBNode | null {
  if (root === null) return null;
  if (root.key === key) return bareRotate(root, direction);
  if (key < root.key) {
    return { ...root, left: rotateOnlyAt(root.left, key, direction) };
  }
  return { ...root, right: rotateOnlyAt(root.right, key, direction) };
}

/**
 * A purely structural rotation: the shape changes and **every node keeps its own
 * colour**. That is what "a rotation on its own" means, and it is exactly why it
 * can move a black node off one root→nil path and onto another, changing that
 * path's black count. `rotateLeft`/`rotateRight` above differ precisely by the
 * recolour that repairs this.
 */
function bareRotate(node: RBNode, direction: "left" | "right"): RBNode {
  if (direction === "right") {
    const left = node.left;
    if (left === null) return node;
    return {
      key: left.key,
      colour: left.colour,
      left: left.left,
      right: { key: node.key, colour: node.colour, left: left.right, right: node.right },
    };
  }
  const right = node.right;
  if (right === null) return node;
  return {
    key: right.key,
    colour: right.colour,
    left: { key: node.key, colour: node.colour, left: node.left, right: right.left },
    right: right.right,
  };
}
