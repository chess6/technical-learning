/**
 * Pure binary-search-tree helpers for the Binary Search Trees lesson.
 *
 * Everything the guided scene, the explorer, and the exercises display is
 * computed here — no tree, count, or height is ever recomputed in a scene or an
 * explorer (MATH_CORRECTNESS rule).
 *
 * **Conventions fixed once** (they match the lesson's insight contract, and every
 * function below assumes them):
 *
 * - **Height is measured in EDGES.** A single node has height 0; the empty tree
 *   has height −1, so that `height(root) + 1` is the number of levels and the
 *   bound `n ≤ 2^(h+1) − 1` holds unmodified.
 * - **Cost is counted in KEY COMPARISONS.** A search that reaches depth `d`
 *   performs `d + 1` comparisons, because every node on the path costs exactly
 *   one comparison. This is why the lesson can say cost *is* shape rather than
 *   merely correlating with it.
 * - **Duplicates are rejected, not overwritten or re-inserted.** A key already
 *   present leaves the tree unchanged. Stating this matters: silently allowing
 *   duplicates would break the in-order-equals-sorted invariant that the whole
 *   lesson rests on.
 *
 * Trees are built with **insert-at-leaf**: a new key goes exactly where its own
 * search terminates. That single rule is what makes the insertion order select
 * the shape, which is the lesson's central prediction.
 */

/** A node of a binary search tree. Immutable by convention — inserts rebuild the path. */
export interface BSTNode {
  readonly key: number;
  readonly left: BSTNode | null;
  readonly right: BSTNode | null;
}

/**
 * The open range of keys a position may legally hold, inherited from the whole
 * path above it. `null` means unbounded on that side. Legality is this interval,
 * **not** a parent–child comparison — a tree can satisfy every parent–child pair
 * and still be invalid, which is the lesson's sharpest misconception.
 */
export interface KeyInterval {
  readonly lo: number | null;
  readonly hi: number | null;
}

/** The record of one search: the graded intermediate, not just found/not-found. */
export interface SearchTrace {
  /** Keys compared against, in the order they were compared. */
  readonly comparisons: readonly number[];
  readonly found: boolean;
  /** Depth reached (edges from the root). −1 when the tree is empty. */
  readonly depth: number;
}

export interface HeightBounds {
  /** ⌈log₂(n+1)⌉ − 1, attained by `buildBalanced`. */
  readonly min: number;
  /** n − 1, attained by inserting in sorted (or reverse-sorted) order. */
  readonly max: number;
}

export interface ValidityResult {
  readonly valid: boolean;
  /** The first key (in a root-first walk) that falls outside its inherited interval. */
  readonly offendingKey?: number;
  /** The interval that key was required to lie in. */
  readonly interval?: KeyInterval;
}

const UNBOUNDED: KeyInterval = { lo: null, hi: null };

function within(key: number, interval: KeyInterval): boolean {
  if (interval.lo !== null && key <= interval.lo) return false;
  if (interval.hi !== null && key >= interval.hi) return false;
  return true;
}

/* -------------------------------------------------------------------------- */
/* Construction                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Insert one key at the leaf its own search reaches. A duplicate is rejected —
 * the tree is returned unchanged — so `inOrder` can never repeat a key.
 */
export function insert(root: BSTNode | null, key: number): BSTNode {
  if (root === null) return { key, left: null, right: null };
  if (key === root.key) return root; // duplicate: unchanged
  if (key < root.key) {
    return { key: root.key, left: insert(root.left, key), right: root.right };
  }
  return { key: root.key, left: root.left, right: insert(root.right, key) };
}

/** Build a tree by inserting `keys` in the given order — the order IS the shape. */
export function insertAll(keys: readonly number[]): BSTNode | null {
  let root: BSTNode | null = null;
  for (const key of keys) root = insert(root, key);
  return root;
}

/**
 * The balanced member of the family: recursively take the median of the sorted
 * keys as the root. This is the tree whose probes coincide with binary search's
 * on the same array — the one place the array↔tree identity is exact.
 */
export function buildBalanced(sortedKeys: readonly number[]): BSTNode | null {
  if (sortedKeys.length === 0) return null;
  const mid = Math.floor(sortedKeys.length / 2);
  return {
    key: sortedKeys[mid]!,
    left: buildBalanced(sortedKeys.slice(0, mid)),
    right: buildBalanced(sortedKeys.slice(mid + 1)),
  };
}

/**
 * An insertion order that reproduces `buildBalanced` under insert-at-leaf:
 * the median first, then each half's median, breadth-first down the recursion.
 * Used by the explorer's "Median-first" preset and by outcome O6.
 */
export function medianFirstOrder(sortedKeys: readonly number[]): number[] {
  const out: number[] = [];
  const walk = (slice: readonly number[]): void => {
    if (slice.length === 0) return;
    const mid = Math.floor(slice.length / 2);
    out.push(slice[mid]!);
    walk(slice.slice(0, mid));
    walk(slice.slice(mid + 1));
  };
  walk(sortedKeys);
  return out;
}

/* -------------------------------------------------------------------------- */
/* Reading a tree                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Search, recording the comparison sequence. This — not the boolean — is what an
 * assessment grades: a learner who reports the right answer via the wrong path
 * has not understood the descent.
 */
export function searchTrace(root: BSTNode | null, key: number): SearchTrace {
  const comparisons: number[] = [];
  let node = root;
  let depth = -1;
  while (node !== null) {
    depth += 1;
    comparisons.push(node.key);
    if (key === node.key) return { comparisons, found: true, depth };
    node = key < node.key ? node.left : node.right;
  }
  return { comparisons, found: false, depth };
}

/** Left subtree → node → right subtree. Sorted for EVERY legal shape (T2). */
export function inOrder(root: BSTNode | null): number[] {
  if (root === null) return [];
  return [...inOrder(root.left), root.key, ...inOrder(root.right)];
}

/** Height in edges: a single node is 0, the empty tree is −1. */
export function height(root: BSTNode | null): number {
  if (root === null) return -1;
  return 1 + Math.max(height(root.left), height(root.right));
}

export function size(root: BSTNode | null): number {
  if (root === null) return 0;
  return 1 + size(root.left) + size(root.right);
}

/** Worst-case comparisons for a successful search: `height + 1`. Empty tree: 0. */
export function worstCaseComparisons(root: BSTNode | null): number {
  return root === null ? 0 : height(root) + 1;
}

/**
 * The achievable height range for `n` keys, both ends attained:
 * `⌈log₂(n+1)⌉ − 1` (balanced) up to `n − 1` (a chain).
 */
export function heightBounds(n: number): HeightBounds {
  if (n <= 0) return { min: -1, max: -1 };
  return { min: Math.ceil(Math.log2(n + 1)) - 1, max: n - 1 };
}

/** The inherited interval at the position holding `key`, or `null` if absent. */
export function intervalAt(
  root: BSTNode | null,
  key: number,
): KeyInterval | null {
  let node = root;
  let interval: KeyInterval = UNBOUNDED;
  while (node !== null) {
    if (key === node.key) return interval;
    if (key < node.key) {
      interval = { lo: interval.lo, hi: node.key };
      node = node.left;
    } else {
      interval = { lo: node.key, hi: interval.hi };
      node = node.right;
    }
  }
  return null;
}

/**
 * Validity by **inherited interval**, which is the real condition. Deliberately
 * not implemented as a parent–child comparison: that weaker check accepts trees
 * this one correctly rejects, and the lesson's outcome O5 is precisely about the
 * difference.
 */
export function isValidBST(root: BSTNode | null): ValidityResult {
  const check = (node: BSTNode | null, interval: KeyInterval): ValidityResult => {
    if (node === null) return { valid: true };
    if (!within(node.key, interval)) {
      return { valid: false, offendingKey: node.key, interval };
    }
    const left = check(node.left, { lo: interval.lo, hi: node.key });
    if (!left.valid) return left;
    return check(node.right, { lo: node.key, hi: interval.hi });
  };
  return check(root, UNBOUNDED);
}

/**
 * The weaker check the lesson confronts: every node compared only against its
 * immediate children. Exported so the misconception can be *demonstrated* rather
 * than asserted — `isValidBST` and this function disagree on the lesson's
 * counterexample, and a test pins that disagreement.
 */
export function passesLocalChildChecks(root: BSTNode | null): boolean {
  if (root === null) return true;
  if (root.left !== null && root.left.key >= root.key) return false;
  if (root.right !== null && root.right.key <= root.key) return false;
  return passesLocalChildChecks(root.left) && passesLocalChildChecks(root.right);
}

/* -------------------------------------------------------------------------- */
/* The bridge: binary search on the sorted array                               */
/* -------------------------------------------------------------------------- */

/**
 * The midpoints binary search probes, in order. Used to assert the one exact
 * identity the insight contract claims: the probe sequence equals the root→leaf
 * path of the **balanced** tree — and only of the balanced tree.
 */
export function binarySearchProbes(
  sortedKeys: readonly number[],
  target: number,
): number[] {
  const probes: number[] = [];
  let lo = 0;
  let hi = sortedKeys.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo + 1) / 2);
    const key = sortedKeys[mid]!;
    probes.push(key);
    if (target === key) return probes;
    if (target < key) hi = mid - 1;
    else lo = mid + 1;
  }
  return probes;
}
