import { describe, expect, it } from "vitest";
import { ledgerGeometry, splitScreenOrigins } from "../scenePresentationLayout";

describe("scene presentation layout", () => {
  it("creates two symmetric, distinct local origins", () => {
    const origins = splitScreenOrigins(800, 48);
    expect(origins.left.x).toBeLessThan(0);
    expect(origins.right.x).toBeGreaterThan(0);
    expect(origins.left.x).toBe(-origins.right.x);
  });

  it("gives every ledger row a stable independent baseline", () => {
    const layout = ledgerGeometry(3, 38);
    expect(layout.height).toBe(138);
    expect(layout.rowY).toHaveLength(3);
    expect(layout.rowY[1]! - layout.rowY[0]!).toBe(38);
    expect(layout.rowY[2]! - layout.rowY[1]!).toBe(38);
  });
});
