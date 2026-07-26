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
    expect(sceneModules["matrix-transformations"]).toMatchObject({
      module: "matrixTransformationScene",
      exportName: "matrixTransformationScene",
      lessonId: "transformations",
      authoringContract: true,
    });
  });

  it("marks exactly the matrix pilot plus Batch 1 as contract-backed", () => {
    expect(
      Object.entries(sceneModules)
        .filter(
          ([, scene]) =>
            "authoringContract" in scene && scene.authoringContract,
        )
        .map(([sceneId]) => sceneId)
        .sort(),
    ).toEqual([
      "change-of-basis",
      "determinant-area-scaling",
      "matrix-composition",
      "matrix-transformations",
      "vectors-linear-combinations",
      "why-linear-algebra",
    ]);
  });
});
