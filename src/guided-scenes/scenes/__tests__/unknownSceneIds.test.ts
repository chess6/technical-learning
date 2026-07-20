import { describe, expect, it } from "vitest";
import { getSceneMeta, hasGuidedScene } from "../sceneMeta";

describe("unknown guided scene ids", () => {
  it("does not silently resolve unknown production ids to the spike", () => {
    expect(hasGuidedScene("determinant")).toBe(false);
    expect(hasGuidedScene("eigenvector")).toBe(false);
    expect(hasGuidedScene("not-a-scene")).toBe(false);
    expect(() => getSceneMeta("not-a-scene")).toThrow(/Unknown guided scene/);
  });

  it("keeps the transform-spike available by explicit id", () => {
    expect(hasGuidedScene("transform-spike")).toBe(true);
    expect(getSceneMeta("transform-spike").id).toBe("transform-spike");
  });
});
