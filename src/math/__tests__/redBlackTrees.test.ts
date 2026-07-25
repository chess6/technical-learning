import { describe, expect, it } from "vitest";
import {
  blackHeight,
  blackHeightsPerPath,
  classifyRepair,
  decode,
  encode,
  height234,
  heightRB,
  inOrderRB,
  insertAllRB,
  insertRB,
  isLegalRB,
  rotateOnlyAt,
  sizeRB,
  type Node234,
} from "../redBlackTrees";

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

describe("insertion keeps every invariant, for every order", () => {
  it("stays legal after every single insertion", () => {
    const rng = makeRng(31337);
    for (let trial = 0; trial < 120; trial += 1) {
      const order = shuffled(SEVEN, rng);
      let tree = null as ReturnType<typeof insertAllRB>;
      for (const key of order) {
        tree = insertRB(tree, key).tree;
        const result = isLegalRB(tree);
        expect(
          result.legal,
          `after inserting ${key} of [${order.join(",")}]: ${result.violations.join("; ")}`,
        ).toBe(true);
      }
    }
  });

  it("reads out the sorted keys whatever the order", () => {
    const rng = makeRng(4242);
    for (let trial = 0; trial < 120; trial += 1) {
      const order = shuffled(SEVEN, rng);
      expect(inOrderRB(insertAllRB(order))).toEqual([...SEVEN]);
    }
  });

  it("rejects a duplicate rather than growing", () => {
    const once = insertAllRB([30, 10, 50]);
    const twice = insertRB(once, 10).tree;
    expect(inOrderRB(twice)).toEqual([10, 30, 50]);
    expect(sizeRB(twice)).toBe(3);
  });

  it("equalises black height across every root-to-nil path", () => {
    const rng = makeRng(909);
    for (let trial = 0; trial < 80; trial += 1) {
      const paths = blackHeightsPerPath(insertAllRB(shuffled(SEVEN, rng)));
      expect(new Set(paths).size, `paths: ${paths.join(",")}`).toBe(1);
    }
  });
});

describe("the height bound the invariants force", () => {
  it("keeps height <= 2 log2(n+1), even on sorted input", () => {
    for (let n = 1; n <= 64; n += 1) {
      const keys = Array.from({ length: n }, (_, i) => (i + 1) * 5);
      // Sorted input — the very order that destroys a plain BST.
      const tree = insertAllRB(keys);
      const h = heightRB(tree);
      expect(h, `n=${n}`).toBeLessThanOrEqual(2 * Math.log2(n + 1));
      expect(isLegalRB(tree).legal).toBe(true);
    }
  });

  it("keeps n >= 2^bh - 1", () => {
    const rng = makeRng(5150);
    for (let n = 1; n <= 40; n += 1) {
      const keys = Array.from({ length: n }, (_, i) => (i + 1) * 5);
      const tree = insertAllRB(shuffled(keys, rng));
      expect(n).toBeGreaterThanOrEqual(2 ** blackHeight(tree) - 1);
    }
  });

  it("counts black height by the fixed convention", () => {
    // One black node: the path to a nil holds exactly one black node (the nil).
    const single = insertAllRB([10]);
    expect(blackHeight(single)).toBe(1);
    expect(insertAllRB([])).toBeNull();
    expect(blackHeight(null)).toBe(0);
  });
});

describe("only a root split raises the total black height", () => {
  it("raises it exactly when the root had to be re-blackened", () => {
    let tree = null as ReturnType<typeof insertAllRB>;
    let previous = 0;
    for (const key of SEVEN) {
      const before = blackHeight(tree);
      const result = insertRB(tree, key);
      tree = result.tree;
      const after = blackHeight(tree);
      if (result.rootSplit) {
        expect(after, `inserting ${key}`).toBe(before + 1);
      } else {
        expect(after, `inserting ${key}`).toBe(before);
      }
      previous = after;
    }
    expect(previous).toBe(blackHeight(tree));
  });

  it("raises it UNIFORMLY — every path gains the level at once", () => {
    let tree = null as ReturnType<typeof insertAllRB>;
    for (const key of SEVEN) {
      const before = blackHeightsPerPath(tree);
      const result = insertRB(tree, key);
      tree = result.tree;
      if (result.rootSplit && before.length > 1) {
        const after = blackHeightsPerPath(tree);
        // Not "some paths got taller" — all of them, by the same one level.
        expect(new Set(after).size).toBe(1);
        expect(after[0]).toBe(before[0]! + 1);
      }
    }
  });
});

describe("the encoding is a bijection (under the left-leaning normalization)", () => {
  const TWO_NODE: Node234 = { keys: [30], children: [] };
  const THREE_NODE: Node234 = { keys: [30, 50], children: [] };
  const FOUR_NODE: Node234 = { keys: [30, 50, 70], children: [] };

  it("encodes a 2-node as one black node", () => {
    const rb = encode(TWO_NODE)!;
    expect(rb.colour).toBe("black");
    expect(rb.left).toBeNull();
    expect(rb.right).toBeNull();
  });

  it("encodes a 3-node as a black representative with one red child", () => {
    const rb = encode(THREE_NODE)!;
    expect(rb.key).toBe(50);
    expect(rb.colour).toBe("black");
    expect(rb.left?.colour).toBe("red");
    expect(rb.left?.key).toBe(30);
    expect(rb.right).toBeNull();
  });

  it("encodes a 4-node as a black representative with two red children", () => {
    const rb = encode(FOUR_NODE)!;
    expect(rb.key).toBe(50);
    expect(rb.colour).toBe("black");
    expect(rb.left?.colour).toBe("red");
    expect(rb.right?.colour).toBe("red");
    expect([rb.left?.key, rb.right?.key]).toEqual([30, 70]);
  });

  it("round-trips decode(encode(T)) = T", () => {
    for (const node of [TWO_NODE, THREE_NODE, FOUR_NODE]) {
      expect(decode(encode(node))).toEqual(node);
    }
  });

  it("round-trips encode(decode(R)) = R for real trees", () => {
    const rng = makeRng(1123);
    for (let trial = 0; trial < 60; trial += 1) {
      const tree = insertAllRB(shuffled(SEVEN, rng));
      expect(encode(decode(tree))).toEqual(tree);
    }
  });

  it("makes black height equal the 2–3–4 tree's height", () => {
    const rng = makeRng(2358);
    for (let trial = 0; trial < 60; trial += 1) {
      const tree = insertAllRB(shuffled(SEVEN, rng));
      expect(blackHeight(tree)).toBe(height234(decode(tree)));
    }
  });

  it("preserves the key sequence through the encoding", () => {
    const flatten = (node: Node234 | null): number[] => {
      if (node === null) return [];
      if (node.children.length === 0) return [...node.keys];
      const out: number[] = [];
      node.keys.forEach((key, i) => {
        out.push(...flatten(node.children[i] ?? null), key);
      });
      out.push(...flatten(node.children[node.keys.length] ?? null));
      return out;
    };
    const tree = insertAllRB(SEVEN);
    expect(flatten(decode(tree))).toEqual(inOrderRB(tree));
  });
});

describe("repair classification — the graded intermediate", () => {
  it("reports the receiving node, its arity before, and the repair", () => {
    // A single black 30: a 2-node with room. Adding a smaller key just enlarges it.
    const twoNode = insertAllRB([30]);
    const intoTwo = classifyRepair(twoNode, 10);
    expect(intoTwo.nodeKeys).toEqual([30]);
    expect(intoTwo.arityBefore).toBe(2);
    expect(intoTwo.kind).toBe("none");

    // 30 with a red 10 below it is a 3-node. A key ABOVE 30 becomes the second
    // red child — a legal 4-node, drawn canonically, so nothing needs redrawing.
    const threeNode = insertAllRB([30, 10]);
    const above = classifyRepair(threeNode, 50);
    expect(above.nodeKeys.slice().sort((a, b) => a - b)).toEqual([10, 30]);
    expect(above.arityBefore).toBe(3);
    expect(above.kind).toBe("none");

    // A key BETWEEN them lands under the red 10, making a red child of a red —
    // the same 4-node, drawn illegally. A rotation redraws it; no key count
    // changes, and it is emphatically not a 5-node.
    const between = classifyRepair(threeNode, 20);
    expect(between.arityBefore).toBe(3);
    expect(between.kind).toBe("rotate");
  });

  it("classifies a full 4-node as the split", () => {
    // 30 with reds 10 and 50 is a 4-node; the next key into it forces a split.
    const fourNode = encode({ keys: [10, 30, 50], children: [] });
    const result = classifyRepair(fourNode, 70);
    expect(result.arityBefore).toBe(4);
    expect(result.kind).toBe("recolour-and-promote");
  });

  it("never disagrees with the insertion it describes", () => {
    const rng = makeRng(8675309);
    for (let trial = 0; trial < 60; trial += 1) {
      const order = shuffled(SEVEN, rng);
      const tree = insertAllRB(order.slice(0, 4));
      for (const key of order.slice(4)) {
        const classified = classifyRepair(tree, key);
        const steps = insertRB(tree, key).steps;
        const fromSteps = steps.some((s) => s.kind === "recolour-and-promote")
          ? "recolour-and-promote"
          : steps.some((s) => s.kind === "rotate")
            ? "rotate"
            : "none";
        expect(classified.kind).toBe(fromSteps);
      }
    }
  });
});

describe("a BARE rotation does not preserve black height", () => {
  it("breaks a legal tree — the misconception, demonstrated", () => {
    // The whole point: rotation restores ORDER; only the paired recolour
    // restores R3. If this ever stops failing, the confrontation is dead.
    const tree = insertAllRB(SEVEN);
    expect(isLegalRB(tree).legal).toBe(true);

    let brokenSomewhere = false;
    for (const key of SEVEN) {
      for (const direction of ["left", "right"] as const) {
        const rotated = rotateOnlyAt(tree, key, direction);
        // Order is never damaged by a rotation…
        expect(inOrderRB(rotated)).toEqual([...SEVEN]);
        // …but the invariants can be, and for at least one node they are.
        if (!isLegalRB(rotated).legal) brokenSomewhere = true;
      }
    }
    expect(
      brokenSomewhere,
      "no bare rotation broke the tree — the counterexample would be vacuous",
    ).toBe(true);
  });

  it("names the violation it caused", () => {
    const tree = insertAllRB(SEVEN);
    // Find a bare rotation that actually breaks something, and check the report
    // says WHAT broke — the lesson quotes that sentence back to the learner.
    const broken = SEVEN.flatMap((key) =>
      (["left", "right"] as const).map((d) => isLegalRB(rotateOnlyAt(tree, key, d))),
    ).find((result) => !result.legal);
    expect(broken, "no bare rotation broke the tree").toBeDefined();
    expect(broken!.violations.join(" ")).toMatch(/black height|red/);
  });
});
