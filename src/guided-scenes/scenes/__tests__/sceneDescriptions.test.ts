import { describe, expect, it } from "vitest";
import {
  getSceneDescription,
  listSceneDescriptionIds,
} from "../sceneDescriptions";

describe("scene description loaders (M6 lazy-loading)", () => {
  it("throws synchronously for an unknown id, before any dynamic import", () => {
    expect(() => getSceneDescription("not-a-scene")).toThrow(
      /Unknown guided scene description/,
    );
  });

  it("returns a promise for a known id without throwing synchronously", () => {
    // Deliberately does not await/resolve: this module is the ONLY place
    // production code imports @motion-canvas/2d scene code, and unit tests
    // must not pull that runtime into their module graph (see module doc
    // comment and e2e/motion-canvas-spike.spec.ts, which exercises real
    // rendering in a browser instead).
    const pending = getSceneDescription("vectors-linear-combinations");
    expect(pending).toBeInstanceOf(Promise);
    pending.catch(() => {
      // Swallow: jsdom can't fully execute the 2D runtime; only the
      // synchronous id-validation contract is under test here.
    });
  });

  it("lists every production scene id used by SCENE_META", () => {
    const ids = listSceneDescriptionIds();
    expect(ids).toContain("vectors-linear-combinations");
    expect(ids).toContain("matrix-transformations");
    expect(ids).toContain("determinant-area-scaling");
    expect(ids).toContain("eigenvectors-invariant-directions");
    expect(ids).toContain("transform-spike");
  });
});
