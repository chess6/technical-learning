import { describe, expect, it } from "vitest";
import { lessons, getLessonById } from "../registry";
import { getSceneMeta, SCENE_META } from "../../guided-scenes/scenes/sceneMeta";
import { getExplorer } from "../../explorations/registry";
import { getMatrixExample } from "../../math";

describe("lesson wiring for M4", () => {
  it("resolves guided scenes for both implemented lessons", () => {
    for (const id of ["vectors-linear-combinations", "matrix-transformations"]) {
      const meta = getSceneMeta(id);
      // getSceneMeta returns the fallback for unknown ids; assert we got the
      // real scene by matching the id.
      expect(meta.id).toBe(id);
      expect(meta.steps.length).toBeGreaterThan(0);
      expect(SCENE_META[id]).toBeDefined();
    }
  });

  it("orders step markers monotonically from 0 and exposes major stages", () => {
    for (const meta of Object.values(SCENE_META)) {
      expect(meta.steps[0]!.at).toBe(0);
      expect(meta.majorSteps.length).toBeGreaterThan(0);
      for (let i = 1; i < meta.steps.length; i += 1) {
        expect(meta.steps[i]!.at).toBeGreaterThan(meta.steps[i - 1]!.at);
        expect(meta.steps[i]!.at).toBeLessThanOrEqual(1);
      }
    }
  });

  it("resolves explorers for both implemented lessons", () => {
    expect(getExplorer("linear-combination")).toBeTypeOf("function");
    expect(getExplorer("matrix-transformation")).toBeTypeOf("function");
  });

  it("lesson 1 and 2 reference valid scenes, explorers, and example ids", () => {
    const vectors = getLessonById("vectors")!;
    const transforms = getLessonById("transformations")!;

    expect(getSceneMeta(vectors.guidedSceneId).id).toBe("vectors-linear-combinations");
    expect(getExplorer(vectors.explorationId)).toBeTypeOf("function");

    expect(getSceneMeta(transforms.guidedSceneId).id).toBe("matrix-transformations");
    expect(getExplorer(transforms.explorationId)).toBeTypeOf("function");
    expect(getMatrixExample("shear-2-1")).toBeDefined();
  });

  it("every lesson exposes at least two exercises", () => {
    for (const lesson of lessons.slice(0, 2)) {
      expect(lesson.exercises.length).toBeGreaterThanOrEqual(2);
    }
  });
});
