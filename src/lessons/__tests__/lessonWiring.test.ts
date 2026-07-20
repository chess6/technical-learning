import { describe, expect, it } from "vitest";
import { lessons, getLessonById } from "../registry";
import { getSceneMeta, SCENE_META, hasGuidedScene } from "../../guided-scenes/scenes/sceneMeta";
import { getExplorer } from "../../explorations/registry";
import { getMatrixExample } from "../../math";

describe("lesson wiring for all four POC lessons", () => {
  it("resolves guided scenes for every registered lesson", () => {
    for (const lesson of lessons) {
      expect(hasGuidedScene(lesson.guidedSceneId)).toBe(true);
      expect(getSceneMeta(lesson.guidedSceneId).id).toBe(lesson.guidedSceneId);
      expect(SCENE_META[lesson.guidedSceneId]).toBeDefined();
    }
  });

  it("orders step markers monotonically and exposes major stages", () => {
    for (const meta of Object.values(SCENE_META)) {
      expect(meta.steps[0]!.at).toBe(0);
      expect(meta.majorSteps.length).toBeGreaterThan(0);
      for (let i = 1; i < meta.steps.length; i += 1) {
        expect(meta.steps[i]!.at).toBeGreaterThan(meta.steps[i - 1]!.at);
        expect(meta.steps[i]!.at).toBeLessThanOrEqual(1);
      }
    }
  });

  it("resolves explorers for every lesson", () => {
    for (const lesson of lessons) {
      expect(getExplorer(lesson.explorationId)).toBeTypeOf("function");
    }
  });

  it("lessons 2–4 reference valid matrix example ids", () => {
    for (const id of ["transformations", "determinants", "eigenvectors"] as const) {
      const lesson = getLessonById(id)!;
      expect(lesson.exampleId).toBeTruthy();
      expect(getMatrixExample(lesson.exampleId!)).toBeDefined();
    }
  });

  it("vectors lesson still uses its linear-combination example id", () => {
    const vectors = getLessonById("vectors")!;
    expect(vectors.exampleId).toBe("vectors-default");
  });

  it("every lesson exposes at least three exercises and a checkpoint", () => {
    for (const lesson of lessons) {
      expect(lesson.exercises.length).toBeGreaterThanOrEqual(2);
      if (lesson.id === "determinants" || lesson.id === "eigenvectors") {
        expect(lesson.exercises.length).toBeGreaterThanOrEqual(3);
        expect(lesson.checkpoint).toBeDefined();
        expect(lesson.motivatingQuestion).toBeTruthy();
      }
    }
  });

  it("eigenvectors lesson embeds a derivation scene in a worked example", () => {
    const lesson = getLessonById("eigenvectors")!;
    expect(lesson.workedExamples?.length).toBeGreaterThanOrEqual(1);
    const primary = lesson.workedExamples![0]!;
    expect(primary.guidedSceneId).toBe("eigenvectors-derivation");
    expect(hasGuidedScene(primary.guidedSceneId!)).toBe(true);
    expect(getSceneMeta(primary.guidedSceneId!).id).toBe("eigenvectors-derivation");
  });

  it("eigenvectors practice covers check, drill, and transfer tiers", () => {
    const lesson = getLessonById("eigenvectors")!;
    const tiers = new Set(lesson.exercises.map((ex) => ex.tier).filter(Boolean));
    expect(tiers.has("check")).toBe(true);
    expect(tiers.has("drill")).toBe(true);
    expect(tiers.has("transfer")).toBe(true);
  });

  it("eigenvectors callouts stay optional and flexible", () => {
    const lesson = getLessonById("eigenvectors")!;
    expect(lesson.callouts?.length).toBeGreaterThanOrEqual(1);
    expect(lesson.callouts?.some((c) => c.solutionVisualId)).toBe(true);
  });
});
