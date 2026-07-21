import { describe, expect, it } from "vitest";
import { KARATSUBA_CLEAN, KARATSUBA_BOUNDARY } from "../../../lessons/karatsubaData";
import { karatsubaStep, leafCount, recursionTree } from "../../../math";
import { getSceneMeta } from "../sceneMeta";

/**
 * The Karatsuba Watch scene draws to a canvas, so its beats cannot be asserted
 * through the DOM in unit tests. Instead we pin the shared math/data each beat
 * renders (karatsubaData + karatsuba helpers), so a regression in those numbers
 * — which would silently corrupt the on-canvas labels, carry order, or trees —
 * fails here. The live rendering is exercised by the Playwright e2e.
 */
describe("Karatsuba scene beat data (drives on-canvas labels)", () => {
  const clean = karatsubaStep(
    KARATSUBA_CLEAN.x,
    KARATSUBA_CLEAN.y,
    KARATSUBA_CLEAN.m,
  );
  const boundary = karatsubaStep(
    KARATSUBA_BOUNDARY.x,
    KARATSUBA_BOUNDARY.y,
    KARATSUBA_BOUNDARY.m,
  );

  it("weighted-rectangle labels: 100·AC, 10·AD, 10·BC, BD for 12×13", () => {
    // The four in-rectangle labels combine each region name with its weight.
    expect(clean.regions).toEqual({ ac: 1, ad: 3, bc: 2, bd: 6 });
    // AD and BC share weight 10 and collapse into 10(AD+BC) = z₁.
    expect(clean.z1).toBe(clean.regions.ad + clean.regions.bc);
    expect(clean.z1).toBe(5);
    expect(clean.z2).toBe(clean.regions.ac);
    expect(clean.z0).toBe(clean.regions.bd);
    expect(clean.product).toBe(156);
  });

  it("auxiliary rectangle: (A+B)(C+D)=3×4=12 with peelable corners", () => {
    expect(clean.a + clean.b).toBe(3);
    expect(clean.c + clean.d).toBe(4);
    expect(clean.sumProduct).toBe(12);
    // z₁ recovered by peeling the two known corners AC and BD.
    expect(clean.sumProduct - clean.regions.ac - clean.regions.bd).toBe(clean.z1);
  });

  it("carry-vs-width beat renders the 78×56 carry order (35,82,48)→(43,6,8)", () => {
    expect(boundary.z2).toBe(35);
    expect(boundary.z1).toBe(82);
    expect(boundary.z0).toBe(48);
    // Carry step order the beat animates, driven by normalized.steps.
    expect(boundary.normalized.steps).toEqual([
      { level: 0, valueBefore: 48, digitAfter: 8, carryOut: 4 },
      { level: 1, valueBefore: 86, digitAfter: 6, carryOut: 8 },
    ]);
    // Final settled digits (least-significant-first array).
    expect(boundary.normalized.blocks).toEqual([8, 6, 43]);
    expect(boundary.product).toBe(4368);
  });

  it("recursion-tree beat: branch-4 → 64 leaves, branch-3 → 27 leaves (depth 3)", () => {
    expect(leafCount(4, 3)).toBe(64);
    expect(leafCount(3, 3)).toBe(27);
    // The drawn trees come from recursionTree; count their leaves to match.
    const countLeaves = (node: {
      children: readonly { children: readonly unknown[] }[];
    }): number =>
      node.children.length === 0
        ? 1
        : node.children.reduce(
            (sum, child) =>
              sum + countLeaves(child as Parameters<typeof countLeaves>[0]),
            0,
          );
    expect(countLeaves(recursionTree(4, 3))).toBe(64);
    expect(countLeaves(recursionTree(3, 3))).toBe(27);
  });

  it("scene ariaLabel describes both rectangles and the recurrence trees", () => {
    const meta = getSceneMeta("karatsuba-cross-terms");
    expect(meta.ariaLabel).toMatch(/rectangle/i);
    expect(meta.ariaLabel).toMatch(/auxiliary/i);
    expect(meta.ariaLabel).toMatch(/tree/i);
  });
});
