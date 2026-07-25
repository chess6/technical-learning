import { describe, expect, it } from "vitest";
import { lessons, getLessonById } from "../registry";
import { getLessonNumber, getLessonPosition } from "../courseModel";
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
    // Systems is at position 3 (after transformations); elimination follows at 4.
    expect(getLessonNumber("systems")).toBe(3);
    expect(getLessonNumber("elimination")).toBe(4);
    expect(getLessonNumber("solution-sets")).toBe(5);
    // Numbering is course-relative: Karatsuba is chapter 1 of its OWN course.
    // (Course-boundary behaviour is covered in courseModel.test.ts.)
    expect(getLessonNumber("karatsuba")).toBe(1);
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
      "elimination",
      "solution-sets",
      "matrix-composition",
      "determinants",
      "subspaces-rank",
      "rank-nullity",
      "eigenvectors",
      "karatsuba",
      "binary-search-trees",
      "red-black-trees",
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
    expect((solve as { expected: readonly number[] }).expected).toEqual([2, -1]);
  });
});

describe("Elimination lesson (reversible constraint manipulation)", () => {
  it("sits between systems and solution sets", () => {
    const ids = lessons.map((l) => l.id);
    expect(ids.indexOf("elimination")).toBe(ids.indexOf("systems") + 1);
    expect(ids.indexOf("elimination")).toBe(ids.indexOf("solution-sets") - 1);
  });

  it("wires its own guided scene and synchronized explorer", () => {
    const lesson = getLessonById("elimination")!;
    expect(lesson.guidedSceneId).toBe("elimination");
    expect(lesson.explorationId).toBe("elimination");
    expect(hasGuidedScene("elimination")).toBe(true);
    expect(getSceneMeta("elimination").id).toBe("elimination");
    expect(getExplorer("elimination")).toBeTypeOf("function");
  });

  it("exercises the new platform capabilities via the custom escape hatch", () => {
    const lesson = getLessonById("elimination")!;
    const capabilityIds = lesson
      .exercises!.filter((ex) => ex.type === "custom")
      .map((ex) => (ex as { capabilityId: string }).capabilityId);
    expect(capabilityIds).toContain("committed-prediction");
    expect(capabilityIds).toContain("exercise-sequence");
    expect(capabilityIds).toContain("matrix-entry");
    expect(capabilityIds).toContain("construct-in-explorer");
    expect(capabilityIds).toContain("self-check");
  });

  it("states and proves the solution-set invariance theorem", () => {
    const lesson = getLessonById("elimination")!;
    const invariance = (lesson.formalBlocks ?? []).find((f) => f.id === "thm-invariance");
    expect(invariance?.kind).toBe("theorem");
    // The proof lives in a depth layer (revealed), not the bare statement.
    expect((invariance?.layers ?? []).some((l) => l.kind === "math-note")).toBe(true);
  });
});

describe("Solution Sets & Homogeneous Systems lesson", () => {
  it("sits between elimination and matrix composition", () => {
    const ids = lessons.map((l) => l.id);
    expect(ids.indexOf("solution-sets")).toBe(ids.indexOf("elimination") + 1);
    // L6 now sits between solution sets and determinants, closing the spine gap
    // that let determinants introduce collapse cold.
    expect(ids.indexOf("solution-sets")).toBe(
      ids.indexOf("matrix-composition") - 1,
    );
  });

  it("wires its own guided scene and synchronized explorer", () => {
    const lesson = getLessonById("solution-sets")!;
    expect(lesson.guidedSceneId).toBe("solution-sets");
    expect(lesson.explorationId).toBe("solution-sets");
    expect(hasGuidedScene("solution-sets")).toBe(true);
    expect(getSceneMeta("solution-sets").id).toBe("solution-sets");
    expect(getExplorer("solution-sets")).toBeTypeOf("function");
  });

  it("reuses Lesson 3's shared example for continuity", () => {
    const lesson = getLessonById("solution-sets")!;
    expect(lesson.exampleId).toBe("systems-default");
  });

  it("earns the decomposition theorem and separates existence from multiplicity", () => {
    const lesson = getLessonById("solution-sets")!;
    const formalIds = (lesson.formalBlocks ?? []).map((f) => f.id);
    expect(formalIds).toContain("thm-solution-structure");
    expect(formalIds).toContain("cor-uniqueness");
    // Guided Watch before learner Explore (the one structural ordering rule).
    const route = lesson.route ?? [];
    const watchAt = route.findIndex((b) => b.kind === "visual" || b.kind === "watch");
    const exploreAt = route.findIndex((b) => b.kind === "explore");
    expect(watchAt).toBeGreaterThanOrEqual(0);
    expect(exploreAt).toBeGreaterThan(watchAt);
  });

  it("guards the corrected scope in a misconception callout (one difference ≠ whole set)", () => {
    const lesson = getLessonById("solution-sets")!;
    const ids = new Set((lesson.callouts ?? []).map((c) => c.id));
    expect(ids.has("one-difference-not-whole-set")).toBe(true);
    expect(ids.has("trivial-null-not-reachable")).toBe(true);
  });

  it("covers check, drill, and transfer practice tiers", () => {
    const lesson = getLessonById("solution-sets")!;
    const tiers = new Set(lesson.exercises!.map((ex) => ex.tier).filter(Boolean));
    expect(tiers.has("check")).toBe(true);
    expect(tiers.has("drill")).toBe(true);
    expect(tiers.has("transfer")).toBe(true);
  });
});

describe("Matrix Composition & Inverses lesson (spine L6)", () => {
  it("closes the spine gap between solution sets and determinants", () => {
    const ids = lessons.map((l) => l.id);
    expect(ids.indexOf("matrix-composition")).toBe(
      ids.indexOf("solution-sets") + 1,
    );
    expect(ids.indexOf("matrix-composition")).toBe(
      ids.indexOf("determinants") - 1,
    );
  });

  it("wires its own guided scene and synchronized explorer", () => {
    const lesson = getLessonById("matrix-composition")!;
    expect(lesson.guidedSceneId).toBe("matrix-composition");
    expect(lesson.explorationId).toBe("matrix-composition");
    expect(hasGuidedScene("matrix-composition")).toBe(true);
    expect(getSceneMeta("matrix-composition").id).toBe("matrix-composition");
    expect(getExplorer("matrix-composition")).toBeTypeOf("function");
  });

  it("reuses Lesson 2's map so Lesson 7 measures the SAME A", () => {
    const lesson = getLessonById("matrix-composition")!;
    expect(lesson.exampleId).toBe("shear-2-1");
    expect(getMatrixExample(lesson.exampleId!)).toBeDefined();
    expect(getLessonById("determinants")!.exampleId).toBe("shear-2-1");
  });

  it("derives the product rather than asserting the entry recipe", () => {
    const lesson = getLessonById("matrix-composition")!;
    const def = (lesson.formalBlocks ?? []).find((f) => f.id === "def-product")!;
    expect(def.kind).toBe("definition");
    // The definition must be the COLUMNS one; the entry recipe is a consequence.
    expect(def.statement).toMatch(/\\operatorname\{col\}_j\(AB\)/);
    const derivation = lesson.sections.find((s) => s.id === "recipe")!;
    expect(derivation.body.toLowerCase()).toMatch(/expand|derived|not a rule/);
  });

  it("states the invertibility criterion with a justification layer", () => {
    const lesson = getLessonById("matrix-composition")!;
    const thm = (lesson.formalBlocks ?? []).find(
      (f) => f.id === "thm-invertibility",
    )!;
    expect(thm.kind).toBe("theorem");
    const notes = (thm.layers ?? []).filter((l) => l.kind === "math-note");
    expect(notes.length).toBeGreaterThanOrEqual(1);
    // P2 owes a derivation that says WHERE each hypothesis is used.
    expect(notes[0]!.body).toMatch(/ad ?- ?bc|ad-bc/);
    expect(notes[0]!.body.toLowerCase()).toMatch(/independen/);
  });

  it("scopes ad − bc to invertibility and defers its meaning to Lesson 7", () => {
    const lesson = getLessonById("matrix-composition")!;
    const ahead = lesson.sections
      .flatMap((s) => s.layers ?? [])
      .filter((l) => l.kind === "looking-ahead");
    expect(ahead.length).toBeGreaterThanOrEqual(1);
    const text = ahead.map((l) => `${l.title} ${l.body}`).join(" ");
    expect(text.toLowerCase()).toMatch(/determinant/);
    expect(text.toLowerCase()).toMatch(/area/);
  });

  it("stages the four scalar-arithmetic misconceptions as callouts", () => {
    const lesson = getLessonById("matrix-composition")!;
    const ids = (lesson.callouts ?? []).map((c) => c.id);
    expect(ids).toEqual([
      "not-entrywise",
      "apply-b-first",
      "nonzero-means-invertible",
      "inverse-of-product",
    ]);
  });

  it("poses two checkpoints, including the no-function-can-undo argument", () => {
    const lesson = getLessonById("matrix-composition")!;
    expect(lesson.checkpoint).toBeDefined();
    const second = (lesson.checkpoints ?? []).find(
      (c) => c.id === "undo-impossible",
    );
    expect(second).toBeDefined();
    // The point is that NO function can undo it, not merely no matrix.
    expect(second!.answer.toLowerCase()).toMatch(/no function/);
  });

  it("keeps Watch before Explore and covers all three practice tiers", () => {
    const lesson = getLessonById("matrix-composition")!;
    const route = lesson.route ?? [];
    const watchAt = route.findIndex(
      (b) => b.kind === "visual" || b.kind === "watch",
    );
    const exploreAt = route.findIndex((b) => b.kind === "explore");
    expect(watchAt).toBeGreaterThanOrEqual(0);
    expect(exploreAt).toBeGreaterThan(watchAt);

    const tiers = new Set(lesson.exercises!.map((ex) => ex.tier).filter(Boolean));
    expect(tiers.has("check")).toBe(true);
    expect(tiers.has("drill")).toBe(true);
    expect(tiers.has("transfer")).toBe(true);
  });

  it("grades production, not recognition, on fresh matrices", () => {
    const lesson = getLessonById("matrix-composition")!;
    const ids = new Set(lesson.exercises!.map((ex) => ex.id));
    for (const id of [
      "comp-column-fresh",
      "comp-product-entries-fresh",
      "comp-build-inverse-fresh",
      "comp-singular-witness",
      "comp-reversal",
    ]) {
      expect(ids.has(id)).toBe(true);
    }
    // Recall is capped: at most two recognition items, both in the check tier.
    const recallish = lesson.exercises!.filter(
      (ex) => ex.tier === "check" && ex.type === "multiple-choice",
    );
    expect(recallish.length).toBeLessThanOrEqual(2);
  });

  it("connects back to Lesson 3/4 by re-solving their system with the inverse", () => {
    const lesson = getLessonById("matrix-composition")!;
    const solve = lesson.exercises!.find(
      (ex) => ex.id === "comp-solve-with-inverse",
    );
    expect(solve).toBeDefined();
    // Must land on the SAME (2, -1) elimination produced in Lesson 4.
    expect((solve as { expected: readonly number[] }).expected).toEqual([2, -1]);
  });

  it("tours the scene beats that carry the derivation", () => {
    const meta = getSceneMeta("matrix-composition");
    const ids = meta.majorSteps.map((s) => s.id);
    expect(ids).toEqual([
      "apply-b",
      "apply-a",
      "one-map",
      "columns",
      "order",
      "undo",
      "no-undo",
    ]);
  });
});

describe("Determinants lesson, deepened to the instructional standard", () => {
  it("keeps its existing guided scene and explorer (the visualization was preserved)", () => {
    const lesson = getLessonById("determinants")!;
    expect(lesson.guidedSceneId).toBe("determinant-area-scaling");
    expect(lesson.explorationId).toBe("determinant-area-scaling");
    expect(lesson.exampleId).toBe("shear-2-1");
    expect(hasGuidedScene("determinant-area-scaling")).toBe(true);
    expect(getExplorer("determinant-area-scaling")).toBeTypeOf("function");
  });

  it("DERIVES ad − bc instead of stating it", () => {
    const lesson = getLessonById("determinants")!;
    const derive = lesson.sections.find((s) => s.id === "derive");
    expect(derive, "a derivation section must exist").toBeDefined();
    // The bounding-box dissection is the derivation the lesson claims to give.
    expect(derive!.equation).toMatch(/\(a\+b\)\(c\+d\)/);
    expect(derive!.body.toLowerCase()).toMatch(/rectangle/);
    const worked = (lesson.workedExamples ?? []).map((w) => w.id);
    expect(worked).toContain("wex-derive-area");
  });

  it("carries the formal results a P2 lesson owes", () => {
    const lesson = getLessonById("determinants")!;
    const formals = new Map(
      (lesson.formalBlocks ?? []).map((f) => [f.id, f] as const),
    );
    expect(formals.has("def-determinant")).toBe(true);
    expect(formals.get("thm-invertibility")!.kind).toBe("theorem");
    expect(formals.get("thm-multiplicative")!.kind).toBe("theorem");
    expect(formals.get("prop-row-ops")!.kind).toBe("proposition");
    // Each theorem must carry its justification, not just its statement.
    for (const id of ["thm-multiplicative", "prop-row-ops"]) {
      const layers = formals.get(id)!.layers ?? [];
      expect(
        layers.some((l) => l.kind === "math-note"),
        `${id} needs a justification layer`,
      ).toBe(true);
    }
  });

  it("connects det = 0 to invertibility AND to the solution count", () => {
    const lesson = getLessonById("determinants")!;
    const thm = (lesson.formalBlocks ?? []).find(
      (f) => f.id === "thm-invertibility",
    )!;
    const statement = thm.statement.toLowerCase();
    expect(statement).toMatch(/invertible/);
    expect(statement).toMatch(/independen/);
    expect(statement).toMatch(/null/);
    expect(statement).toMatch(/exactly one solution/);
    // The checkpoint must reach the same conclusion, not stop at "collapses".
    expect(lesson.checkpoint!.answer.toLowerCase()).toMatch(/infinitely many/);
  });

  it("teaches determinant behaviour under composition and row operations", () => {
    const lesson = getLessonById("determinants")!;
    const sectionIds = lesson.sections.map((s) => s.id);
    expect(sectionIds).toContain("multiplicative");
    expect(sectionIds).toContain("row-ops");
    const multiplicative = lesson.sections.find(
      (s) => s.id === "multiplicative",
    )!;
    expect(multiplicative.equation).toMatch(/\\det\(AB\)/);
    // The three row-operation effects must all be present.
    const rowOps = (lesson.formalBlocks ?? []).find(
      (f) => f.id === "prop-row-ops",
    )!;
    const text = rowOps.statement.toLowerCase();
    expect(text).toMatch(/adding a multiple/);
    expect(text).toMatch(/swap/);
    expect(text).toMatch(/scal/);
  });

  it("confronts 'negative determinant means negative area' as an elicited misconception", () => {
    const lesson = getLessonById("determinants")!;
    const callout = (lesson.callouts ?? []).find((c) => c.id === "negative-area");
    expect(callout, "the negative-area misconception must be staged").toBeDefined();
    // elicit -> confront -> resolve, all three present.
    expect(callout!.belief).toBeTruthy();
    expect(callout!.confront).toBeTruthy();
    expect(callout!.resolve).toBeTruthy();
    expect(callout!.resolve!.toLowerCase()).toMatch(/orientation/);
    // And it is checked by MEASUREMENT, not only by restating the rule.
    const measured = lesson.exercises!.find(
      (ex) => ex.id === "det-negative-area-measure",
    );
    expect(measured).toBeDefined();
    expect((measured as { expected: number }).expected).toBe(1);
  });

  it("stages the other two determinant misconceptions", () => {
    const lesson = getLessonById("determinants")!;
    const ids = (lesson.callouts ?? []).map((c) => c.id);
    expect(ids).toContain("zero-det-nonzero-matrix");
    expect(ids).toContain("det-not-additive");
  });

  it("leaves 2×2 at least once (the abstraction return to volume)", () => {
    const lesson = getLessonById("determinants")!;
    const beyond = lesson.sections.find((s) => s.id === "beyond-2d");
    expect(beyond, "the lesson must not stay entirely in 2D").toBeDefined();
    expect(beyond!.body.toLowerCase()).toMatch(/volume/);
    // The deferral of the general n×n case is recorded, not silently skipped.
    const ahead = (beyond!.layers ?? []).filter(
      (l) => l.kind === "looking-ahead",
    );
    expect(ahead.length).toBeGreaterThanOrEqual(1);
    const volume = lesson.exercises!.find((ex) => ex.id === "det-volume-3d");
    expect((volume as { expected: number }).expected).toBe(24);
  });

  it("has a practice ecology across all three tiers, not four look-alike items", () => {
    const lesson = getLessonById("determinants")!;
    const exercises = lesson.exercises!;
    expect(exercises.length).toBeGreaterThanOrEqual(10);
    const tiers = new Set(exercises.map((ex) => ex.tier).filter(Boolean));
    expect(tiers.has("check")).toBe(true);
    expect(tiers.has("drill")).toBe(true);
    expect(tiers.has("transfer")).toBe(true);
    // Every item is tiered — an untiered item is an unplaced item.
    expect(exercises.every((ex) => ex.tier !== undefined)).toBe(true);
    // Fresh instances exist (not just the worked example's numbers).
    const ids = new Set(exercises.map((ex) => ex.id));
    expect(ids.has("det-product-fresh")).toBe(true);
    expect(ids.has("det-by-elimination-fresh")).toBe(true);
    expect(ids.has("det-region-area")).toBe(true);
    expect(ids.has("det-tiny-not-singular")).toBe(true);
  });

  it("poses a second checkpoint that predicts a composite before computing", () => {
    const lesson = getLessonById("determinants")!;
    const predict = (lesson.checkpoints ?? []).find(
      (c) => c.id === "predict-composite",
    );
    expect(predict).toBeDefined();
    expect(predict!.prompt.toLowerCase()).toMatch(/without computing/);
  });

  it("names its backward connections to Lessons 3–6", () => {
    const lesson = getLessonById("determinants")!;
    const connectionText = [
      ...lesson.sections.flatMap((s) => s.layers ?? []),
      ...(lesson.formalBlocks ?? []).flatMap((f) => f.layers ?? []),
      ...(lesson.workedExamples ?? []).flatMap((w) => w.layers ?? []),
    ]
      .map((l) => `${l.title} ${l.body}`)
      .join(" ")
      .toLowerCase();
    // The spine's requirement: determinants must reference L6's
    // non-invertibility motivation rather than introducing collapse cold.
    expect(connectionText).toMatch(/lesson 6/);
    expect(connectionText).toMatch(/lesson 4|lesson 3/);
    expect(lesson.motivatingQuestion!.toLowerCase()).toMatch(/lesson 6/);
  });

  it("has a structured summary naming the compression", () => {
    const lesson = getLessonById("determinants")!;
    expect(lesson.structuredSummary).toBeDefined();
    expect(lesson.structuredSummary!.mainResult).toMatch(/\\det\(AB\)/);
    expect(lesson.structuredSummary!.commonMistake!.toLowerCase()).toMatch(
      /negative area/,
    );
  });
});

describe("Subspaces & Rank lesson (spine L8)", () => {
  it("sits between determinants and eigenvectors, opening the structure module", () => {
    const ids = lessons.map((l) => l.id);
    expect(ids.indexOf("subspaces-rank")).toBe(ids.indexOf("determinants") + 1);
    expect(ids.indexOf("subspaces-rank")).toBe(ids.indexOf("rank-nullity") - 1);
  });

  it("wires its own guided scene and explorer", () => {
    const lesson = getLessonById("subspaces-rank")!;
    expect(lesson.guidedSceneId).toBe("subspaces-rank");
    expect(lesson.explorationId).toBe("subspaces-rank");
    expect(hasGuidedScene("subspaces-rank")).toBe(true);
    expect(getExplorer("subspaces-rank")).toBeTypeOf("function");
  });

  it("keeps the two spaces in DIFFERENT ambient spaces throughout", () => {
    const lesson = getLessonById("subspaces-rank")!;
    const def = (lesson.formalBlocks ?? []).find((f) => f.id === "def-two-spaces")!;
    // The ambient spaces must be stated, not left implicit.
    expect(def.statement).toMatch(/\\mathbb\{R\}\^m/);
    expect(def.statement).toMatch(/\\mathbb\{R\}\^n/);
    // And the misconception is staged with a NON-SQUARE counterexample, since a
    // square matrix is exactly where the distinction is invisible.
    const callout = (lesson.callouts ?? []).find((c) => c.id === "same-space")!;
    expect(callout.confront).toMatch(/2 \\times 3|2\\times3/);
  });

  it("stages the reduced-matrix basis trap in prose, a layer, and a graded item", () => {
    const lesson = getLessonById("subspaces-rank")!;
    expect((lesson.callouts ?? []).some((c) => c.id === "basis-from-reduced")).toBe(true);
    const prop = (lesson.formalBlocks ?? []).find((f) => f.id === "prop-pivot-basis")!;
    expect((prop.layers ?? []).some((l) => l.kind === "trap")).toBe(true);
    const trap = lesson.exercises!.find((ex) => ex.id === "rank-basis-trap");
    expect(trap).toBeDefined();
  });

  it("observes rank + nullity = n without claiming to prove it", () => {
    const lesson = getLessonById("subspaces-rank")!;
    const section = lesson.sections.find((s) => s.id === "opposite")!;
    expect(section.equation).toMatch(/observed here; proved next lesson/);
    // The proof must NOT be asserted anywhere in this lesson's formal blocks.
    const formalText = (lesson.formalBlocks ?? [])
      .map((f) => `${f.statement} ${f.interpretation}`)
      .join(" ");
    expect(formalText).not.toMatch(/rank.*\+.*nullity.*=.*n/i);
  });

  it("states row rank = column rank as a reference result, unproved", () => {
    const lesson = getLessonById("subspaces-rank")!;
    const ref = (lesson.formalBlocks ?? []).find((f) => f.id === "ref-row-rank")!;
    expect(ref.visibility).toBe("reference");
    expect(ref.interpretation.toLowerCase()).toMatch(/not given here|proof is not/);
  });

  it("restates the L5/L6/L7 criteria as one statement about rank", () => {
    const lesson = getLessonById("subspaces-rank")!;
    const thm = (lesson.formalBlocks ?? []).find((f) => f.id === "thm-rank-criterion")!;
    const statement = thm.statement.toLowerCase();
    for (const phrase of ["invertible", "\\det", "independent", "null", "rank"]) {
      expect(statement).toContain(phrase.toLowerCase());
    }
  });

  it("opens the forward edge eigenvectors needs (eigenspace as a null space)", () => {
    const lesson = getLessonById("subspaces-rank")!;
    const ahead = lesson.sections
      .flatMap((s) => s.layers ?? [])
      .filter((l) => l.kind === "looking-ahead")
      .map((l) => `${l.title} ${l.body}`)
      .join(" ");
    expect(ahead).toMatch(/A - \\lambda I/);
    expect(ahead.toLowerCase()).toMatch(/eigen/);
  });

  it("covers all three practice tiers on fresh matrices", () => {
    const lesson = getLessonById("subspaces-rank")!;
    const tiers = new Set(lesson.exercises!.map((ex) => ex.tier).filter(Boolean));
    expect(tiers.has("check")).toBe(true);
    expect(tiers.has("drill")).toBe(true);
    expect(tiers.has("transfer")).toBe(true);
    expect(lesson.exercises!.length).toBeGreaterThanOrEqual(10);
  });

  it("tours the scene beats that separate the two spaces", () => {
    const meta = getSceneMeta("subspaces-rank");
    expect(meta.majorSteps.map((s) => s.id)).toEqual([
      "two-panels",
      "reach",
      "colspace",
      "crush",
      "nullspace",
      "count",
      "rank-one",
    ]);
  });
});

describe("Rank–Nullity lesson (spine L9)", () => {
  it("follows Subspaces & Rank and precedes Eigenvectors", () => {
    const ids = lessons.map((l) => l.id);
    expect(ids.indexOf("rank-nullity")).toBe(ids.indexOf("subspaces-rank") + 1);
    expect(ids.indexOf("rank-nullity")).toBe(ids.indexOf("eigenvectors") - 1);
  });

  it("wires its own scene and explorer", () => {
    const lesson = getLessonById("rank-nullity")!;
    expect(lesson.guidedSceneId).toBe("rank-nullity");
    expect(lesson.explorationId).toBe("rank-nullity");
    expect(hasGuidedScene("rank-nullity")).toBe(true);
    expect(getExplorer("rank-nullity")).toBeTypeOf("function");
  });

  it("names the diagnosed obstacle instead of restating L8's observation", () => {
    const lesson = getLessonById("rank-nullity")!;
    const opening = lesson.sections.find((s) => s.id === "too-obvious")!;
    // The lesson must confront "this looks too obvious to need a name" head-on.
    expect(opening.body.toLowerCase()).toMatch(/bookkeeping/);
    expect(opening.body).toMatch(/\\mathbb\{R\}\^3.*\\mathbb\{R\}\^2/);
  });

  it("proves the theorem, showing BOTH spanning and independence", () => {
    const lesson = getLessonById("rank-nullity")!;
    const thm = (lesson.formalBlocks ?? []).find((f) => f.id === "thm-rank-nullity")!;
    expect(thm.kind).toBe("theorem");
    const proof = (thm.layers ?? []).find((l) => l.kind === "math-note")!;
    // Both halves must be present: a proof that only shows the images span has
    // not established the count.
    expect(proof.body.toLowerCase()).toContain("span");
    expect(proof.body.toLowerCase()).toContain("independent");
    // The basis extension must be flagged as a CHOICE, not a decomposition.
    expect((thm.layers ?? []).some((l) => l.kind === "trap")).toBe(true);
  });

  it("keeps the total at n and says so where it matters", () => {
    const lesson = getLessonById("rank-nullity")!;
    const thm = (lesson.formalBlocks ?? []).find((f) => f.id === "thm-rank-nullity")!;
    expect(thm.interpretation).toMatch(/input/);
    expect(thm.interpretation.toLowerCase()).toMatch(/never appears|never/);
    // The staged misconception exists and is confronted with a NON-SQUARE map.
    const callout = (lesson.callouts ?? []).find((c) => c.id === "total-is-n")!;
    expect(callout.confront).toMatch(/m = 2|m=2/);
  });

  it("states the impossibility results the law licenses", () => {
    const lesson = getLessonById("rank-nullity")!;
    const cor = (lesson.formalBlocks ?? []).find((f) => f.id === "cor-consequences")!;
    const text = cor.statement.toLowerCase();
    expect(text).toMatch(/not \*\*one-to-one\*\*|not one-to-one/);
    expect(text).toMatch(/not \*\*onto\*\*|not onto/);
    expect(text).toMatch(/min\(m, n\)|\\min\(m, n\)/);
  });

  it("scopes one-to-one ⟺ onto to square maps, with a counterexample", () => {
    const lesson = getLessonById("rank-nullity")!;
    const callout = (lesson.callouts ?? []).find(
      (c) => c.id === "onto-iff-one-to-one",
    )!;
    expect(callout.resolve).toMatch(/m = n|m=n/);
    // Both directions of counterexample must be present (onto-not-1-1 and 1-1-not-onto).
    const confront = callout.confront ?? "";
    expect(confront.toLowerCase()).toMatch(/onto/);
    expect(confront.toLowerCase()).toMatch(/one-to-one/);
  });

  it("carries the eigen forward edge as a computable item, not a promise", () => {
    const lesson = getLessonById("rank-nullity")!;
    const forward = lesson.sections.find((s) => s.id === "forward")!;
    expect(forward.equation).toMatch(/A - \\lambda I/);
    const item = lesson.exercises!.find((ex) => ex.id === "rn-eigen-multiplicity");
    expect(item, "geometric multiplicity must be GRADED, not merely mentioned").toBeDefined();
  });

  it("grades non-square maps, since the square case cannot show the law's content", () => {
    const lesson = getLessonById("rank-nullity")!;
    // Inspect the authored text directly rather than a JSON dump, whose extra
    // escaping makes any regex here a test of the serializer, not the content.
    const graded = lesson
      .exercises!.map((ex) => {
        const prompt = "prompt" in ex ? ex.prompt : "";
        const choices = "choices" in ex ? ex.choices.join(" ") : "";
        return `${prompt} ${choices}`;
      })
      .join(" ");
    expect(graded).toContain("2 \\times 3");
    expect(graded).toContain("\\mathbb{R}^5 \\to \\mathbb{R}^2");
    const tiers = new Set(lesson.exercises!.map((ex) => ex.tier).filter(Boolean));
    expect(tiers.has("check")).toBe(true);
    expect(tiers.has("drill")).toBe(true);
    expect(tiers.has("transfer")).toBe(true);
  });

  it("uses the ledger beats, not a repeat of L8's geometry", () => {
    const meta = getSceneMeta("rank-nullity");
    expect(meta.majorSteps.map((s) => s.id)).toEqual([
      "budget",
      "post",
      "balance",
      "degrade",
      "ceiling",
      "forbidden",
    ]);
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
