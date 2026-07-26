import { describe, expect, it } from "vitest";
import sceneModules from "../../../../scripts/animation-authoring-scenes.json";
import { SCENE_META } from "../../scenes/sceneMeta";

describe("native authoring scene registry", () => {
  it("covers every production scene and excludes development-only scenes", () => {
    const productionIds = Object.keys(SCENE_META)
      .filter((id) => id !== "transform-spike")
      .sort();
    expect(Object.keys(sceneModules).sort()).toEqual(productionIds);
    expect(sceneModules).not.toHaveProperty("transform-spike");
  });

  it("maps matrix-transformations to its production module and export", () => {
    expect(sceneModules["matrix-transformations"]).toEqual({
      module: "matrixTransformationScene",
      exportName: "matrixTransformationScene",
    });
  });
});
