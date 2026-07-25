import { describe, expect, it } from "vitest";
import {
  assertBareRotationBreaksTheTree,
  assertEncodingRoundTrips,
  assertLegalRedBlack,
  assertOnlyRootSplitRaisesBlackHeight,
  assertRedBlackHeightBound,
  assertRepairPreservesOrder,
  assertSplitPreservesExternalBlackHeight,
} from "../invariants";
import { encode234, insertAllRB } from "../index";

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

const SEVEN = [10, 20, 30, 40, 50, 60, 70];

describe("red-black invariants hold across randomized orders", () => {
  const rng = makeRng(60221408);
  const orders = Array.from({ length: 120 }, () => shuffled(SEVEN, rng));

  it("(1) the encoding round-trips", () => {
    for (const order of orders) {
      expect(() => assertEncodingRoundTrips(order)).not.toThrow();
    }
  });

  it("(2) every repair preserves the key order", () => {
    for (const order of orders) {
      expect(() => assertRepairPreservesOrder(order)).not.toThrow();
    }
  });

  it("(3) the tree stays legal", () => {
    for (const order of orders) {
      expect(() => assertLegalRedBlack(order)).not.toThrow();
    }
  });

  it("(5) only a root split raises the total black height", () => {
    for (const order of orders) {
      expect(() => assertOnlyRootSplitRaisesBlackHeight(order)).not.toThrow();
    }
  });

  it("(6) the height bound holds after every insertion", () => {
    for (const order of orders) {
      expect(() => assertRedBlackHeightBound(order)).not.toThrow();
    }
    // …including the order that destroys a plain binary search tree.
    const sorted = Array.from({ length: 64 }, (_, i) => (i + 1) * 5);
    expect(() => assertRedBlackHeightBound(sorted)).not.toThrow();
  });
});

describe("(4) a split preserves the subtree's EXTERNAL black height", () => {
  it("holds for a 4-node cluster", () => {
    const fourNode = encode234({ keys: [10, 30, 50], children: [] })!;
    expect(() => assertSplitPreservesExternalBlackHeight(fourNode)).not.toThrow();
  });

  it("refuses a fixture that is not a cluster", () => {
    // Guard on the guard: a lone node cannot demonstrate anything about splits.
    const lone = insertAllRB([30])!;
    expect(() => assertSplitPreservesExternalBlackHeight(lone)).toThrow(
      /not a 4-node cluster/,
    );
  });
});

describe("(7, negative) the bare-rotation confrontation cannot go quiet", () => {
  it("a rotation without its recolour breaks the tree", () => {
    expect(() => assertBareRotationBreaksTheTree(SEVEN)).not.toThrow();
  });

  it("holds for many shapes, not just one lucky tree", () => {
    const rng = makeRng(1618033);
    for (let trial = 0; trial < 40; trial += 1) {
      const order = shuffled(SEVEN, rng);
      expect(() => assertBareRotationBreaksTheTree(order)).not.toThrow();
    }
  });
});
