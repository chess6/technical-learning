import { describe, expect, it } from "vitest";
import {
  lessons,
  getLessonById,
  getLessonNumber,
  getLessonPosition,
} from "../registry";
import { getSceneMeta, SCENE_META, hasGuidedScene } from "../../guided-scenes/scenes/sceneMeta";
import { getExplorer } from "../../explorations/registry";
import { getMatrixExample } from "../../math";
import { requireKaratsubaExample } from "../karatsubaData";

describe("lesson wiring for all registered lessons", () => {
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

  it("every content lesson exposes at least two exercises and a checkpoint", () => {
    for (const lesson of lessons) {
      if (lesson.kind === "intro") continue; // intro chapters have no Practice
      expect((lesson.exercises ?? []).length).toBeGreaterThanOrEqual(2);
      if (lesson.id === "determinants" || lesson.id === "eigenvectors") {
        expect((lesson.exercises ?? []).length).toBeGreaterThanOrEqual(3);
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

  it("Lesson 4 worked computation is a clean ordered equation sequence", () => {
    const lesson = getLessonById("eigenvectors")!;
    const primary = lesson.workedExamples![0]!;
    // Authored as plain equations — no per-step explanatory template.
    expect(Array.isArray(primary.equations)).toBe(true);
    expect((primary as unknown as { steps?: unknown }).steps).toBeUndefined();
    expect(primary.equations).toEqual([
      "A\\mathbf{v} = \\lambda\\mathbf{v}",
      "(A - \\lambda I)\\mathbf{v} = \\mathbf{0}",
      "\\det(A - \\lambda I) = 0",
      "\\det\\begin{bmatrix} 3-\\lambda & 1 \\\\ 0 & 2-\\lambda \\end{bmatrix} = 0",
      "(3-\\lambda)(2-\\lambda) = 0",
      "\\lambda = 3,\\; 2",
      "\\lambda = 3:\\quad \\mathbf{v} \\parallel \\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix}",
      "\\lambda = 2:\\quad \\mathbf{v} \\parallel \\begin{bmatrix} -1 \\\\ 1 \\end{bmatrix}",
    ]);
  });

  it("high-value eigen insights live in layers/callouts, not per-equation", () => {
    const lesson = getLessonById("eigenvectors")!;
    const primary = lesson.workedExamples![0]!;
    const layerText = (primary.layers ?? [])
      .map((l) => `${l.title} ${l.body}`)
      .join(" ");
    // A − λI (not A) sends v to zero; det(A−λI)=0 reuses Lesson 3 collapse.
    expect(layerText).toMatch(/A-\\lambda I/);
    expect(layerText.toLowerCase()).toMatch(/collapse|singular/);
    // Off-axis + negative-eigenvalue insights are covered by callouts.
    const calloutIds = new Set((lesson.callouts ?? []).map((c) => c.id));
    expect(calloutIds.has("not-always-axes")).toBe(true);
    expect(calloutIds.has("same-line-not-direction")).toBe(true);
  });

  it("eigenvectors practice covers check, drill, and transfer tiers", () => {
    const lesson = getLessonById("eigenvectors")!;
    const tiers = new Set(lesson.exercises!.map((ex) => ex.tier).filter(Boolean));
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

describe("Chapter 0 opening slice (walking skeleton)", () => {
  it("is registered first as an intro chapter with the mystery scene", () => {
    expect(lessons[0]!.id).toBe("why-linear-algebra");
    const chapter0 = getLessonById("why-linear-algebra")!;
    expect(chapter0.kind).toBe("intro");
    expect(chapter0.guidedSceneId).toBe("why-linear-algebra");
    expect(hasGuidedScene(chapter0.guidedSceneId)).toBe(true);
    expect(getSceneMeta(chapter0.guidedSceneId).id).toBe("why-linear-algebra");
    // Reuses the existing matrix explorer for the bounded interaction.
    expect(getExplorer(chapter0.explorationId)).toBeTypeOf("function");
  });

  it("has no Practice or Summary, and asks the central mystery question", () => {
    const chapter0 = getLessonById("why-linear-algebra")!;
    expect(chapter0.exercises).toBeUndefined();
    expect(chapter0.keyTakeaway).toBeUndefined();
    expect(chapter0.motivatingQuestion).toMatch(/four numbers/i);
  });

  it("is numbered Chapter 0 and does not shift Lesson 1", () => {
    expect(getLessonNumber("why-linear-algebra")).toBe(0);
    expect(getLessonNumber("vectors")).toBe(1);
    expect(getLessonPosition("vectors").current).toBe(1);
    // Systems is inserted at position 3 (after transformations); Karatsuba
    // shifts to 6 (intro chapter still excluded from the count).
    expect(getLessonNumber("systems")).toBe(3);
    expect(getLessonNumber("karatsuba")).toBe(6);
  });

  it("tours scale, rotation, reflection, shear, and projection", () => {
    const meta = getSceneMeta("why-linear-algebra");
    const ids = meta.majorSteps.map((s) => s.id);
    for (const id of [
      "establish",
      "scale",
      "rotation",
      "reflection",
      "shear",
      "projection",
      "mystery",
    ]) {
      expect(ids).toContain(id);
    }
  });
});

describe("lessons compose an explicit route from the block palette", () => {
  it("every registered lesson declares its own route (no reliance on a fixed default)", () => {
    for (const lesson of lessons) {
      expect(Array.isArray(lesson.route)).toBe(true);
      expect(lesson.route!.length).toBeGreaterThan(0);
    }
  });

  it("every route reference resolves (section / formal / worked / check ids)", () => {
    for (const lesson of lessons) {
      const sectionIds = new Set(lesson.sections.map((s) => s.id));
      const formalIds = new Set((lesson.formalBlocks ?? []).map((f) => f.id));
      const workedIds = new Set((lesson.workedExamples ?? []).map((w) => w.id));
      const checkpointIds = new Set(
        (lesson.checkpoints ?? []).map((c) => c.id),
      );
      const exerciseIds = new Set((lesson.exercises ?? []).map((e) => e.id));
      for (const block of lesson.route ?? []) {
        if (block.kind === "section") {
          expect(sectionIds.has(block.sectionId)).toBe(true);
        } else if (block.kind === "formal") {
          expect(formalIds.has(block.formalId)).toBe(true);
        } else if (block.kind === "worked" && block.workedId) {
          expect(workedIds.has(block.workedId)).toBe(true);
        } else if (block.kind === "check" && block.checkpointId) {
          expect(checkpointIds.has(block.checkpointId)).toBe(true);
        } else if (block.kind === "practice" && block.exerciseIds) {
          for (const id of block.exerciseIds) {
            expect(exerciseIds.has(id)).toBe(true);
          }
        }
      }
    }
  });

  it("a block may re-appear with different content: vectors poses two distinct checks", () => {
    const lesson = getLessonById("vectors")!;
    const checkBlocks = (lesson.route ?? []).filter((b) => b.kind === "check");
    expect(checkBlocks.length).toBe(2);
    // One references an extra checkpoint by id; the other uses the default.
    const referenced = checkBlocks
      .map((b) => (b.kind === "check" ? b.checkpointId : undefined))
      .filter(Boolean);
    expect(referenced).toContain("span-reachability");
    expect(
      (lesson.checkpoints ?? []).some((c) => c.id === "span-reachability"),
    ).toBe(true);
    expect(lesson.checkpoint).toBeDefined();
  });
});

describe("Lesson 1 expanded to vectors, linear combinations, and basis", () => {
  it("is organized into exactly three sections through basis and coordinates", () => {
    const lesson = getLessonById("vectors")!;
    expect(lesson.title).toBe("Vectors, Linear Combinations, and Basis");
    expect(lesson.sections.map((s) => s.id)).toEqual([
      "vectors",
      "combinations",
      "basis",
    ]);
  });

  it("teaches basis and coordinates in its objectives and takeaway", () => {
    const lesson = getLessonById("vectors")!;
    const objectives = lesson.learningObjectives.join(" ").toLowerCase();
    expect(objectives).toMatch(/basis/);
    expect(objectives).toMatch(/coordinates/);
    expect(lesson.keyTakeaway!.toLowerCase()).toMatch(/basis/);
    // 2D qualification: "in the plane".
    expect(lesson.keyTakeaway!.toLowerCase()).toMatch(/in the plane/);
  });

  it("carries the uniqueness argument (existence vs uniqueness)", () => {
    const lesson = getLessonById("vectors")!;
    const basis = lesson.sections.find((s) => s.id === "basis")!;
    const layerText = (basis.layers ?? []).map((l) => `${l.title} ${l.body}`).join(" ");
    expect(layerText).toMatch(/a - a'|a-a'/);
    expect(layerText.toLowerCase()).toMatch(/unique/);
    expect(layerText.toLowerCase()).toMatch(/exist/);
  });

  it("has an equation-first worked example for [p]_E vs [p]_B", () => {
    const lesson = getLessonById("vectors")!;
    const worked = lesson.workedExamples![0]!;
    expect(Array.isArray(worked.equations)).toBe(true);
    const eqs = worked.equations.join(" ");
    expect(eqs).toMatch(/\[\\mathbf\{p\}\]_E/);
    expect(eqs).toMatch(/\[\\mathbf\{p\}\]_B/);
    // No embedded second Watch scene — the main scene teaches it once.
    expect(worked.guidedSceneId).toBeUndefined();
  });

  it("uses exactly two misconception callouts", () => {
    const lesson = getLessonById("vectors")!;
    const ids = (lesson.callouts ?? []).map((c) => c.id);
    expect(ids).toEqual([
      "basis-not-perpendicular",
      "coordinates-are-not-the-vector",
    ]);
  });

  it("repurposes the checkpoint to coordinates-in-a-basis", () => {
    const lesson = getLessonById("vectors")!;
    expect(lesson.checkpoint?.prompt.toLowerCase()).toMatch(/did .*move|move/);
    expect(lesson.checkpoint?.answer.toLowerCase()).toMatch(/did not move|not move/);
  });

  it("covers check, drill, and transfer practice tiers", () => {
    const lesson = getLessonById("vectors")!;
    const tiers = new Set(lesson.exercises!.map((ex) => ex.tier).filter(Boolean));
    expect(tiers.has("check")).toBe(true);
    expect(tiers.has("drill")).toBe(true);
    expect(tiers.has("transfer")).toBe(true);
  });

  it("keeps the single guided scene but adds basis + coordinates beats", () => {
    const lesson = getLessonById("vectors")!;
    expect(lesson.guidedSceneId).toBe("vectors-linear-combinations");
    const meta = getSceneMeta(lesson.guidedSceneId);
    const stepIds = meta.steps.map((s) => s.id);
    expect(stepIds).toContain("basis");
    expect(stepIds).toContain("coordinates");
    const majorIds = meta.majorSteps.map((s) => s.id);
    expect(majorIds).toContain("basis");
    expect(majorIds).toContain("coordinates");
  });
});

describe("Lesson 2 recalls the basis and derives the columns rule", () => {
  it("references the standard basis and unique coordinates, with a connection layer", () => {
    const lesson = getLessonById("transformations")!;
    const intro = lesson.sections.find((s) => s.id === "intro")!;
    expect(intro.body).toMatch(/standard basis/);
    const grid = lesson.sections.find((s) => s.id === "grid")!;
    expect(grid.body.toLowerCase()).toMatch(/consequence/);
    const layerKinds = (grid.layers ?? []).map((l) => l.kind);
    expect(layerKinds).toContain("connection");
  });
});

describe("Linear systems lesson (row vs column picture)", () => {
  it("sits between transformations and determinants", () => {
    const ids = lessons.map((l) => l.id);
    expect(ids).toEqual([
      "why-linear-algebra",
      "vectors",
      "transformations",
      "systems",
      "determinants",
      "eigenvectors",
      "karatsuba",
    ]);
  });

  it("wires its own guided scene and synchronized explorer", () => {
    const lesson = getLessonById("systems")!;
    expect(lesson.guidedSceneId).toBe("linear-systems");
    expect(lesson.explorationId).toBe("linear-systems");
    expect(hasGuidedScene("linear-systems")).toBe(true);
    expect(getSceneMeta("linear-systems").id).toBe("linear-systems");
    expect(getExplorer("linear-systems")).toBeTypeOf("function");
  });

  it("teaches both the row and column pictures and the trichotomy", () => {
    const lesson = getLessonById("systems")!;
    const sectionIds = lesson.sections.map((s) => s.id);
    expect(sectionIds).toContain("row-picture");
    expect(sectionIds).toContain("column-picture");
    const workedIds = (lesson.workedExamples ?? []).map((w) => w.id);
    expect(workedIds).toEqual(["sys-unique", "sys-infinite", "sys-none"]);
    const formalIds = (lesson.formalBlocks ?? []).map((f) => f.id);
    expect(formalIds).toContain("thm-consistency");
    expect(formalIds).toContain("prop-trichotomy");
  });

  it("covers check, drill, and transfer practice tiers", () => {
    const lesson = getLessonById("systems")!;
    const tiers = new Set(lesson.exercises!.map((ex) => ex.tier).filter(Boolean));
    expect(tiers.has("check")).toBe(true);
    expect(tiers.has("drill")).toBe(true);
    expect(tiers.has("transfer")).toBe(true);
  });

  it("reuses Lesson 1's numbers for continuity", () => {
    const lesson = getLessonById("systems")!;
    const solve = lesson.exercises!.find((ex) => ex.id === "sys-solve-unique");
    expect(solve).toBeDefined();
    // Solution (2, -1) is Lesson 1's [q]_B — same computation, read as A x = b.
    expect((solve as { expected: number[] }).expected).toEqual([2, -1]);
  });
});

describe("Karatsuba lesson wiring", () => {
  it("resolves scene, explorer, and shared examples without a matrix exampleId", () => {
    const lesson = getLessonById("karatsuba")!;
    expect(lesson.guidedSceneId).toBe("karatsuba-cross-terms");
    expect(lesson.explorationId).toBe("karatsuba-cross-terms");
    expect(hasGuidedScene(lesson.guidedSceneId)).toBe(true);
    expect(getExplorer(lesson.explorationId)).toBeTypeOf("function");
    expect(lesson.exampleId).toBeUndefined();
    expect(requireKaratsubaExample("karatsuba-clean").x).toBe(12);
    expect(requireKaratsubaExample("karatsuba-boundary").y).toBe(56);
    expect(requireKaratsubaExample("karatsuba-recursive").x).toBe(1234);
  });

  it("has no deeper beat on the primary timeline; major steps cover the elementary chain", () => {
    const meta = getSceneMeta("karatsuba-cross-terms");
    const stepIds = meta.steps.map((s) => s.id);
    expect(stepIds).not.toContain("deeper");
    expect(stepIds).toEqual([
      "setup",
      "foil",
      "weights",
      "share",
      "aux-rect",
      "subtract",
      "reassemble",
      "carry-vs-width",
      "branch",
      "exponent",
    ]);
    const majorIds = meta.majorSteps.map((s) => s.id);
    expect(majorIds).toEqual([
      "foil",
      "share",
      "aux-rect",
      "subtract",
      "reassemble",
      "carry-vs-width",
      "branch",
      "exponent",
    ]);
  });

  it("exercises cover reconstruction, complexity, transfer, and carry-vs-width", () => {
    const lesson = getLessonById("karatsuba")!;
    expect(lesson.exercises!.length).toBeGreaterThanOrEqual(6);
    expect(lesson.checkpoint).toBeDefined();
    const ids = lesson.exercises!.map((ex) => ex.id);
    expect(ids).toContain("karatsuba-z1");
    expect(ids).toContain("karatsuba-exponent");
    expect(ids).toContain("karatsuba-strassen-transfer");
    expect(ids).toContain("karatsuba-width-vs-carry");
    expect(ids).toContain("karatsuba-output-carry");
  });
});
