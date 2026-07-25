/**
 * Test-oriented mathematical invariants for visualizations.
 * Pure math only — no Mafs / Motion Canvas / DOM types.
 */
import { DEFAULT_TOLERANCE, type Matrix2x2, type Vector2 } from "./types";
import {
  approximatelyEqualVector,
  areParallel,
  magnitude,
} from "./vectors";
import {
  blackHeight as rbBlackHeight,
  decode as rbDecode,
  encode as rbEncode,
  flipColours as rbFlipColours,
  heightRB as rbHeight,
  inOrderRB as rbInOrder,
  insertAllRB as rbInsertAll,
  insertRB as rbInsert,
  isLegalRB as rbIsLegal,
  rotateOnlyAt as rbRotateOnlyAt,
  type RBNode as RBTreeNode,
} from "./redBlackTrees";
import {
  binarySearchProbes as bstBinarySearchProbes,
  buildBalanced as bstBuildBalanced,
  height as bstHeight,
  heightBounds as bstHeightBounds,
  inOrder as bstInOrder,
  insertAll as bstInsertAll,
  isValidBST as bstIsValid,
  passesLocalChildChecks as bstPassesLocalChildChecks,
  searchTrace as bstSearchTrace,
  type BSTNode as BSTTreeNode,
} from "./binarySearchTrees";
import {
  applyMatrixToUnitSquare,
  determinant2x2,
  matrixColumn,
  matrixVectorMultiply,
  transformedGridSegments,
  type TransformedGridSegment,
  verifiesEigenpair,
} from "./matrices";

function fail(message: string): never {
  throw new Error(message);
}

function formatVec(v: Vector2): string {
  return `(${v[0]}, ${v[1]})`;
}

/** A e₁ / A e₂ must equal the matrix columns. */
export function assertTransformedBasisMatchesColumns(
  matrix: Matrix2x2,
  tolerance = DEFAULT_TOLERANCE,
): void {
  const ae1 = matrixVectorMultiply(matrix, [1, 0]);
  const ae2 = matrixVectorMultiply(matrix, [0, 1]);
  const c1 = matrixColumn(matrix, 0);
  const c2 = matrixColumn(matrix, 1);
  if (!approximatelyEqualVector(ae1, c1, tolerance)) {
    fail(`A e1 ${formatVec(ae1)} !== column1 ${formatVec(c1)}`);
  }
  if (!approximatelyEqualVector(ae2, c2, tolerance)) {
    fail(`A e2 ${formatVec(ae2)} !== column2 ${formatVec(c2)}`);
  }
}

/**
 * Identity-space x=k lines ("vertical" kind) → parallel to A e₂.
 * Identity-space y=k lines ("horizontal" kind) → parallel to A e₁.
 */
export function assertGridDirectionMatchesBasis(
  matrix: Matrix2x2,
  gridSegments: readonly TransformedGridSegment[],
  tolerance = DEFAULT_TOLERANCE,
): void {
  const e1 = matrixColumn(matrix, 0);
  const e2 = matrixColumn(matrix, 1);

  for (const seg of gridSegments) {
    const dir: Vector2 = [
      seg.point2[0] - seg.point1[0],
      seg.point2[1] - seg.point1[1],
    ];
    if (magnitude(dir) <= tolerance) {
      // Degenerate segment (e.g. total collapse) — skip direction check.
      continue;
    }
    const expected = seg.kind === "vertical" ? e2 : e1;
    if (magnitude(expected) <= tolerance) {
      // Basis collapsed; segment should also be near-zero (handled above) or
      // share that collapse — still require parallelism with the (near-)zero
      // column via cross product ≈ 0, which areParallel allows with zero.
    }
    if (!areParallel(dir, expected, tolerance)) {
      fail(
        `grid ${seg.kind} k=${seg.index} direction ${formatVec(dir)} ` +
          `is not parallel to ${seg.kind === "vertical" ? "A e2" : "A e1"} ` +
          `${formatVec(expected)}`,
      );
    }
  }
}

export function assertPointMatchesMatrixTransform(
  matrix: Matrix2x2,
  original: Vector2,
  transformed: Vector2,
  tolerance = DEFAULT_TOLERANCE,
): void {
  const expected = matrixVectorMultiply(matrix, original);
  if (!approximatelyEqualVector(transformed, expected, tolerance)) {
    fail(
      `transform of ${formatVec(original)}: got ${formatVec(transformed)}, ` +
        `expected ${formatVec(expected)}`,
    );
  }
}

/** Transformed unit-square parallelogram area equals |det(A)|. */
export function assertUnitSquareAreaMatchesDeterminant(
  matrix: Matrix2x2,
  tolerance = DEFAULT_TOLERANCE,
): void {
  const corners = applyMatrixToUnitSquare(matrix);
  // Origin → e1 → e1+e2 → e2 (UNIT_SQUARE order).
  const e1 = corners[1];
  const e1PlusE2 = corners[2];
  const e2 = corners[3];
  const sum: Vector2 = [e1[0] + e2[0], e1[1] + e2[1]];
  if (!approximatelyEqualVector(e1PlusE2, sum, tolerance)) {
    fail(
      `unit-square image is not a parallelogram: e1+e2=${formatVec(sum)} ` +
        `but corner=${formatVec(e1PlusE2)}`,
    );
  }
  const area = Math.abs(e1[0] * e2[1] - e1[1] * e2[0]);
  const expected = Math.abs(determinant2x2(matrix));
  if (Math.abs(area - expected) > tolerance) {
    fail(`unit-square area ${area} !== |det| ${expected}`);
  }
}

export function assertEigenpair(
  matrix: Matrix2x2,
  eigenvalue: number,
  eigenvector: Vector2,
  tolerance = 1e-6,
): void {
  if (magnitude(eigenvector) <= DEFAULT_TOLERANCE) {
    fail("zero vector is never an eigenvector");
  }
  if (!verifiesEigenpair(matrix, eigenvalue, eigenvector, tolerance)) {
    const Av = matrixVectorMultiply(matrix, eigenvector);
    fail(
      `A v ≉ λ v: Av=${formatVec(Av)}, λv=${formatVec([
        eigenvalue * eigenvector[0],
        eigenvalue * eigenvector[1],
      ])}`,
    );
  }
}

/** Convenience: build segments and run basis + grid direction invariants. */
export function assertTransformedGridInvariants(
  matrix: Matrix2x2,
  halfExtent = 3,
  tolerance = DEFAULT_TOLERANCE,
): void {
  assertTransformedBasisMatchesColumns(matrix, tolerance);
  const segments = transformedGridSegments(matrix, halfExtent);
  assertGridDirectionMatchesBasis(matrix, segments, tolerance);
  for (const seg of segments) {
    const original1: Vector2 =
      seg.kind === "vertical"
        ? [seg.index, -halfExtent]
        : [-halfExtent, seg.index];
    const original2: Vector2 =
      seg.kind === "vertical"
        ? [seg.index, halfExtent]
        : [halfExtent, seg.index];
    assertPointMatchesMatrixTransform(matrix, original1, seg.point1, tolerance);
    assertPointMatchesMatrixTransform(matrix, original2, seg.point2, tolerance);
  }
  assertUnitSquareAreaMatchesDeterminant(matrix, tolerance);
}

/** Direction of a grid family (from first non-degenerate segment of that kind). */
export function gridFamilyDirection(
  segments: readonly TransformedGridSegment[],
  kind: "vertical" | "horizontal",
  tolerance = DEFAULT_TOLERANCE,
): Vector2 | null {
  for (const seg of segments) {
    if (seg.kind !== kind) continue;
    const dir: Vector2 = [
      seg.point2[0] - seg.point1[0],
      seg.point2[1] - seg.point1[1],
    ];
    if (magnitude(dir) > tolerance) return dir;
  }
  return null;
}

/* --------------------------------------------------------------------------
 * Binary search trees
 *
 * The seven checks the Binary Search Trees lesson owes (mastery-contract §1g).
 * They are stated as assertions rather than booleans so a failure names the
 * offending tree, and they are used by both the unit suite and any scene or
 * explorer regression that wants to prove what it is drawing.
 * ------------------------------------------------------------------------ */

/** (1) In-order traversal returns the sorted keys — for EVERY insertion order. */
export function assertInOrderIsSorted(order: readonly number[]): void {
  const expected = [...order].sort((a, b) => a - b);
  const actual = bstInOrder(bstInsertAll(order));
  if (actual.length !== expected.length) {
    fail(
      `in-order length ${actual.length} !== ${expected.length} for order [${order.join(", ")}]`,
    );
  }
  for (let i = 0; i < expected.length; i += 1) {
    if (actual[i] !== expected[i]) {
      fail(
        `in-order [${actual.join(", ")}] !== sorted [${expected.join(", ")}] ` +
          `for order [${order.join(", ")}]`,
      );
    }
  }
}

/** (2) Every insert-at-leaf tree is valid by the inherited-interval test. */
export function assertInsertAtLeafIsValid(order: readonly number[]): void {
  const result = bstIsValid(bstInsertAll(order));
  if (!result.valid) {
    fail(
      `insert-at-leaf produced an invalid tree for order [${order.join(", ")}]: ` +
        `key ${result.offendingKey} outside its interval`,
    );
  }
}

/**
 * (2, negative half) A tree that satisfies every parent–child comparison but
 * violates an inherited interval MUST be rejected. This is the lesson's
 * counterexample; if validity ever regresses to the local check, this fails.
 */
export function assertLocallyValidTreeIsRejected(root: BSTTreeNode | null): void {
  if (!bstPassesLocalChildChecks(root)) {
    fail("fixture is not locally valid — it cannot demonstrate the misconception");
  }
  if (bstIsValid(root).valid) {
    fail("a locally-valid but globally-invalid tree was accepted as a BST");
  }
}

/** (3) A search's comparison count is exactly the depth it reached, plus one. */
export function assertSearchCostIsDepthPlusOne(
  root: BSTTreeNode | null,
  key: number,
): void {
  const trace = bstSearchTrace(root, key);
  if (trace.comparisons.length !== trace.depth + 1) {
    fail(
      `search for ${key} made ${trace.comparisons.length} comparisons at depth ${trace.depth}`,
    );
  }
}

/** (4) Sorted insertion degenerates to a chain of height n − 1. */
export function assertSortedInsertionDegenerates(keys: readonly number[]): void {
  const sorted = [...keys].sort((a, b) => a - b);
  const h = bstHeight(bstInsertAll(sorted));
  if (h !== sorted.length - 1) {
    fail(`sorted insertion gave height ${h}, expected ${sorted.length - 1}`);
  }
}

/** (5) The balanced build attains the minimum height ⌈log₂(n+1)⌉ − 1. */
export function assertBalancedAttainsMinimumHeight(
  sortedKeys: readonly number[],
): void {
  const h = bstHeight(bstBuildBalanced(sortedKeys));
  const { min } = bstHeightBounds(sortedKeys.length);
  if (h !== min) {
    fail(`balanced build gave height ${h}, expected the minimum ${min}`);
  }
}

/** (6) Every order lands inside ⌈log₂(n+1)⌉ − 1 ≤ h ≤ n − 1. */
export function assertHeightWithinBounds(order: readonly number[]): void {
  const h = bstHeight(bstInsertAll(order));
  const { min, max } = bstHeightBounds(order.length);
  if (h < min || h > max) {
    fail(
      `height ${h} outside [${min}, ${max}] for order [${order.join(", ")}]`,
    );
  }
}

/**
 * (7) The balanced tree's root→node path is exactly binary search's probe
 * sequence on the same sorted array — the one identity claimed only for the
 * balanced member of the family.
 */
export function assertBalancedTreeMatchesBinarySearch(
  sortedKeys: readonly number[],
  target: number,
): void {
  const probes = bstBinarySearchProbes(sortedKeys, target);
  const path = bstSearchTrace(bstBuildBalanced(sortedKeys), target).comparisons;
  if (probes.length !== path.length || probes.some((p, i) => p !== path[i])) {
    fail(
      `binary-search probes [${probes.join(", ")}] !== balanced path [${path.join(", ")}] ` +
        `for target ${target}`,
    );
  }
}

/* --------------------------------------------------------------------------
 * Red-black trees
 *
 * The seven checks the Red–Black Trees lesson owes (mastery-contract §1g).
 * Invariant 7 is a NEGATIVE assertion: the bare-rotation fixture must FAIL
 * legality, so the lesson's sharpest misconception is confronted by a
 * demonstration that cannot silently stop demonstrating anything.
 * ------------------------------------------------------------------------ */

/** (1) decode ∘ encode is the identity (under the left-leaning normalization). */
export function assertEncodingRoundTrips(order: readonly number[]): void {
  const tree = rbInsertAll(order);
  const back = rbEncode(rbDecode(tree));
  if (JSON.stringify(back) !== JSON.stringify(tree)) {
    fail(`encode(decode(T)) !== T for order [${order.join(", ")}]`);
  }
}

/** (2) Every rotation and recolour preserves the in-order key sequence. */
export function assertRepairPreservesOrder(order: readonly number[]): void {
  const inserted: number[] = [];
  let tree: RBTreeNode | null = null;
  for (const key of order) {
    tree = rbInsert(tree, key).tree;
    if (!inserted.includes(key)) inserted.push(key);
    // Compare against the sorted keys inserted SO FAR — not a prefix of the
    // final sorted array, which is a different set part-way through.
    const expected = [...inserted].sort((a, b) => a - b);
    const seq = rbInOrder(tree);
    if (seq.join(",") !== expected.join(",")) {
      fail(
        `in-order [${seq.join(", ")}] !== [${expected.join(", ")}] ` +
          `after inserting ${key} of [${order.join(", ")}]`,
      );
    }
  }
}

/** (3) A legal tree has no red-red edge and one black height on every path. */
export function assertLegalRedBlack(order: readonly number[]): void {
  const result = rbIsLegal(rbInsertAll(order));
  if (!result.legal) {
    fail(
      `illegal red-black tree for order [${order.join(", ")}]: ${result.violations.join("; ")}`,
    );
  }
}

/**
 * (4) A split-recolour preserves the subtree's **EXTERNAL** black height.
 *
 * "External" is load-bearing, and it is exactly the qualifier the lesson's
 * misconception M4 drops. The count must be taken on a path *entering the
 * cluster from outside*, which means the representative's own colour counts —
 * before the split it is black and contributes 1 while its red children
 * contribute 0; after the split it is red and contributes 0 while whichever
 * child the path takes contributes 1. `blackHeight` measures from a node
 * *exclusive*, so the node's own contribution has to be added back here. Using
 * the exclusive count instead would measure a different quantity, and it is not
 * preserved.
 */
export function assertSplitPreservesExternalBlackHeight(node: RBTreeNode): void {
  if (node.left === null || node.right === null) {
    fail("the fixture is not a 4-node cluster — it cannot demonstrate the split");
  }
  const external = (n: RBTreeNode): number =>
    (n.colour === "black" ? 1 : 0) + rbBlackHeight(n);
  const before = external(node);
  const after = external(rbFlipColours(node));
  if (before !== after) {
    fail(
      `split changed external black height ${before} → ${after} at node ${node.key}`,
    );
  }
}

/** (5) Only a root split raises the TOTAL black height, and by exactly one. */
export function assertOnlyRootSplitRaisesBlackHeight(
  order: readonly number[],
): void {
  let tree: RBTreeNode | null = null;
  for (const key of order) {
    const before = rbBlackHeight(tree);
    const result = rbInsert(tree, key);
    tree = result.tree;
    const after = rbBlackHeight(tree);
    const expected = result.rootSplit ? before + 1 : before;
    if (after !== expected) {
      fail(
        `black height went ${before} → ${after} on inserting ${key} (rootSplit=${result.rootSplit})`,
      );
    }
  }
}

/** (6) height ≤ 2·log₂(n+1) after every insertion, sorted input included. */
export function assertRedBlackHeightBound(order: readonly number[]): void {
  let tree: RBTreeNode | null = null;
  let n = 0;
  for (const key of order) {
    tree = rbInsert(tree, key).tree;
    n += 1;
    const h = rbHeight(tree);
    const bound = 2 * Math.log2(n + 1);
    if (h > bound) {
      fail(`height ${h} exceeds 2·log2(${n}+1) = ${bound.toFixed(2)}`);
    }
  }
}

/**
 * (7, NEGATIVE) A **bare** rotation — one with no accompanying recolour — must
 * break legality somewhere. If this ever stops failing, the lesson's
 * "a rotation alone does not preserve black height" confrontation has quietly
 * become a claim about nothing.
 */
export function assertBareRotationBreaksTheTree(order: readonly number[]): void {
  const tree = rbInsertAll(order);
  if (!rbIsLegal(tree).legal) {
    fail("the starting tree is already illegal — the counterexample proves nothing");
  }
  const broke = order.some((key) =>
    (["left", "right"] as const).some(
      (direction) => !rbIsLegal(rbRotateOnlyAt(tree, key, direction)).legal,
    ),
  );
  if (!broke) {
    fail(
      `no bare rotation broke the tree built from [${order.join(", ")}] — ` +
        "the misconception is no longer being demonstrated",
    );
  }
}
