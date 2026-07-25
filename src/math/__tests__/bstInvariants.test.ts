import { describe, expect, it } from "vitest";
import {
  assertBalancedAttainsMinimumHeight,
  assertBalancedTreeMatchesBinarySearch,
  assertHeightWithinBounds,
  assertInOrderIsSorted,
  assertInsertAtLeafIsValid,
  assertLocallyValidTreeIsRejected,
  assertSearchCostIsDepthPlusOne,
  assertSortedInsertionDegenerates,
} from "../invariants";
import { insertAll, type BSTNode } from "../binarySearchTrees";

const SEVEN = [4, 8, 15, 16, 23, 42, 50];

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

/**
 * The lesson's counterexample: 20 is smaller than its parent 30, so every
 * parent–child comparison passes, but 20 sits in 25's right subtree where only
 * keys above 25 may live.
 */
const LOCALLY_VALID_BUT_INVALID: BSTNode = {
  key: 25,
  left: { key: 10, left: null, right: null },
  right: { key: 30, left: { key: 20, left: null, right: null }, right: null },
};

describe("BST invariants hold across randomized orders", () => {
  const rng = makeRng(2718281);
  const orders = Array.from({ length: 150 }, () => shuffled(SEVEN, rng));

  it("(1) in-order is the sorted key sequence for every order", () => {
    for (const order of orders) {
      expect(() => assertInOrderIsSorted(order)).not.toThrow();
    }
  });

  it("(2) every insert-at-leaf tree is valid", () => {
    for (const order of orders) {
      expect(() => assertInsertAtLeafIsValid(order)).not.toThrow();
    }
  });

  it("(3) search cost is depth + 1, present or absent", () => {
    for (const order of orders.slice(0, 40)) {
      const tree = insertAll(order);
      for (const key of [...SEVEN, 1, 99]) {
        expect(() => assertSearchCostIsDepthPlusOne(tree, key)).not.toThrow();
      }
    }
  });

  it("(6) every order lands inside the height bounds", () => {
    for (const order of orders) {
      expect(() => assertHeightWithinBounds(order)).not.toThrow();
    }
  });
});

describe("BST invariants pin the two extremes", () => {
  it("(4) sorted insertion degenerates to a chain", () => {
    for (let n = 1; n <= 12; n += 1) {
      const keys = Array.from({ length: n }, (_, i) => (i + 1) * 7);
      expect(() => assertSortedInsertionDegenerates(keys)).not.toThrow();
    }
  });

  it("(5) the balanced build attains the minimum height", () => {
    for (let n = 1; n <= 32; n += 1) {
      const keys = Array.from({ length: n }, (_, i) => (i + 1) * 7);
      expect(() => assertBalancedAttainsMinimumHeight(keys)).not.toThrow();
    }
  });

  it("(7) the balanced path is binary search's probe sequence", () => {
    for (let n = 1; n <= 20; n += 1) {
      const keys = Array.from({ length: n }, (_, i) => (i + 1) * 7);
      for (const target of keys) {
        expect(() =>
          assertBalancedTreeMatchesBinarySearch(keys, target),
        ).not.toThrow();
      }
    }
  });
});

describe("the negative invariant — the misconception cannot rot", () => {
  it("(2, negative) rejects a locally-valid but globally-invalid tree", () => {
    expect(() =>
      assertLocallyValidTreeIsRejected(LOCALLY_VALID_BUT_INVALID),
    ).not.toThrow();
  });

  it("refuses a fixture that is not actually locally valid", () => {
    // Guard on the guard: a fixture that fails the LOCAL check proves nothing
    // about the difference between the two tests, so the assertion must reject it.
    const notLocallyValid: BSTNode = {
      key: 25,
      left: { key: 30, left: null, right: null },
      right: null,
    };
    expect(() => assertLocallyValidTreeIsRejected(notLocallyValid)).toThrow(
      /not locally valid/,
    );
  });

  it("fails loudly if validity ever regresses to the local check", () => {
    // A genuinely valid tree must NOT satisfy "locally valid but rejected".
    expect(() =>
      assertLocallyValidTreeIsRejected(insertAll([25, 10, 30])),
    ).toThrow(/accepted as a BST/);
  });
});
