import { describe, expect, it } from "vitest";
import {
  binarySearchProbes,
  buildBalanced,
  height,
  heightBounds,
  inOrder,
  insert,
  insertAll,
  intervalAt,
  isValidBST,
  medianFirstOrder,
  passesLocalChildChecks,
  searchTrace,
  size,
  worstCaseComparisons,
  type BSTNode,
} from "../binarySearchTrees";

const SEVEN = [4, 8, 15, 16, 23, 42, 50] as const;

/** Deterministic PRNG so the property sweeps are reproducible on failure. */
function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function shuffled(keys: readonly number[], rng: () => number): number[] {
  const out = [...keys];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

describe("construction (insert-at-leaf)", () => {
  it("places each key where its own search terminates", () => {
    const tree = insertAll([15, 8, 42, 4, 16, 23, 50]);
    expect(tree?.key).toBe(15);
    expect(tree?.left?.key).toBe(8);
    expect(tree?.right?.key).toBe(42);
    expect(tree?.left?.left?.key).toBe(4);
    expect(tree?.right?.left?.key).toBe(16);
  });

  it("rejects a duplicate rather than overwriting or re-inserting it", () => {
    const once = insertAll([15, 8, 42]);
    const twice = insert(once, 8);
    expect(inOrder(twice)).toEqual([8, 15, 42]);
    expect(size(twice)).toBe(3);
  });

  it("handles the empty tree and a single key", () => {
    expect(insertAll([])).toBeNull();
    expect(height(null)).toBe(-1);
    expect(worstCaseComparisons(null)).toBe(0);
    const one = insertAll([7]);
    expect(height(one)).toBe(0);
    expect(worstCaseComparisons(one)).toBe(1);
  });
});

describe("the ordering invariant is shape-independent (T2)", () => {
  it("reads the same sorted sequence out of every insertion order", () => {
    const rng = makeRng(20260724);
    for (let trial = 0; trial < 200; trial += 1) {
      const order = shuffled(SEVEN, rng);
      expect(inOrder(insertAll(order)), `order ${order.join(",")}`).toEqual([
        ...SEVEN,
      ]);
    }
  });

  it("reads the same sequence from the two extreme shapes", () => {
    const chain = insertAll([...SEVEN]);
    const balanced = buildBalanced([...SEVEN]);
    expect(inOrder(chain)).toEqual(inOrder(balanced));
    // …but not at the same price. This is the whole lesson.
    expect(height(chain)).not.toBe(height(balanced));
  });
});

describe("cost is depth (T3)", () => {
  it("records the comparison sequence, not just the result", () => {
    const tree = insertAll([15, 8, 42, 4, 16, 23, 50]);
    const trace = searchTrace(tree, 23);
    expect(trace.comparisons).toEqual([15, 42, 16, 23]);
    expect(trace.found).toBe(true);
    expect(trace.depth).toBe(3);
    // The identity the lesson asserts: comparisons = depth + 1.
    expect(trace.comparisons).toHaveLength(trace.depth + 1);
  });

  it("traces an absent key to the null child it falls off", () => {
    const tree = insertAll([15, 8, 42]);
    const trace = searchTrace(tree, 9);
    expect(trace.found).toBe(false);
    expect(trace.comparisons).toEqual([15, 8]);
  });

  it("costs height + 1 in the worst case", () => {
    const tree = insertAll([...SEVEN]); // sorted ⇒ a chain
    expect(worstCaseComparisons(tree)).toBe(height(tree) + 1);
    expect(worstCaseComparisons(tree)).toBe(SEVEN.length);
  });
});

describe("insertion order selects the shape (T4 attainment)", () => {
  it("degenerates to a chain of height n-1 on increasing order", () => {
    expect(height(insertAll([...SEVEN]))).toBe(SEVEN.length - 1);
  });

  it("degenerates the other way on decreasing order", () => {
    expect(height(insertAll([...SEVEN].reverse()))).toBe(SEVEN.length - 1);
  });

  it("attains the minimum height on median-first order", () => {
    const order = medianFirstOrder([...SEVEN]);
    const tree = insertAll(order);
    expect(height(tree)).toBe(heightBounds(SEVEN.length).min);
  });

  it("median-first insertion reproduces the balanced tree exactly", () => {
    const viaOrder = insertAll(medianFirstOrder([...SEVEN]));
    const direct = buildBalanced([...SEVEN]);
    expect(viaOrder).toEqual(direct);
  });

  it("bounds every shape, for every order and size (T4)", () => {
    const rng = makeRng(97531);
    for (let n = 1; n <= 12; n += 1) {
      const keys = Array.from({ length: n }, (_, i) => (i + 1) * 3);
      const { min, max } = heightBounds(n);
      for (let trial = 0; trial < 40; trial += 1) {
        const h = height(insertAll(shuffled(keys, rng)));
        expect(h, `n=${n}`).toBeGreaterThanOrEqual(min);
        expect(h, `n=${n}`).toBeLessThanOrEqual(max);
      }
    }
  });

  it("matches the closed form n <= 2^(h+1) - 1", () => {
    for (let n = 1; n <= 64; n += 1) {
      const { min } = heightBounds(n);
      expect(n).toBeLessThanOrEqual(2 ** (min + 1) - 1);
      // …and min is tight: one level fewer could not hold n keys.
      expect(n).toBeGreaterThan(2 ** min - 1);
    }
  });
});

describe("legality is an inherited interval (T1), not a local comparison", () => {
  it("reports the interval a position inherits from the whole path", () => {
    const tree = insertAll([15, 8, 42, 4, 16, 23, 50]);
    expect(intervalAt(tree, 15)).toEqual({ lo: null, hi: null });
    expect(intervalAt(tree, 8)).toEqual({ lo: null, hi: 15 });
    expect(intervalAt(tree, 23)).toEqual({ lo: 16, hi: 42 });
    expect(intervalAt(tree, 999)).toBeNull();
  });

  it("accepts every tree built by insert-at-leaf", () => {
    const rng = makeRng(13579);
    for (let trial = 0; trial < 200; trial += 1) {
      expect(isValidBST(insertAll(shuffled(SEVEN, rng))).valid).toBe(true);
    }
  });

  it("REJECTS a tree that passes every parent-child check", () => {
    // 20 is smaller than its parent 30 (so the local check is happy) but it sits
    // in the right subtree of 25, where only keys > 25 may live. This fixture is
    // the lesson's counterexample; if `isValidBST` ever regresses to the local
    // check, this test is what fails.
    const invalid: BSTNode = {
      key: 25,
      left: { key: 10, left: null, right: null },
      right: {
        key: 30,
        left: { key: 20, left: null, right: null },
        right: null,
      },
    };
    expect(passesLocalChildChecks(invalid)).toBe(true);
    const result = isValidBST(invalid);
    expect(result.valid).toBe(false);
    expect(result.offendingKey).toBe(20);
    expect(result.interval).toEqual({ lo: 25, hi: 30 });
  });
});

describe("the bridge: binary search on the sorted array", () => {
  it("probes exactly the balanced tree's root-to-node path", () => {
    // The one exact identity the insight contract claims — and it is claimed
    // ONLY for the balanced member of the family.
    const balanced = buildBalanced([...SEVEN]);
    for (const target of SEVEN) {
      expect(
        binarySearchProbes(SEVEN, target),
        `target ${target}`,
      ).toEqual(searchTrace(balanced, target).comparisons);
    }
  });

  it("does NOT match an arbitrary tree — the restriction is real", () => {
    const chain = insertAll([...SEVEN]);
    expect(binarySearchProbes(SEVEN, 50)).not.toEqual(
      searchTrace(chain, 50).comparisons,
    );
  });

  it("agrees with the balanced tree at even sizes too", () => {
    const six = [2, 5, 9, 11, 14, 18];
    const balanced = buildBalanced(six);
    for (const target of six) {
      expect(binarySearchProbes(six, target)).toEqual(
        searchTrace(balanced, target).comparisons,
      );
    }
  });
});
