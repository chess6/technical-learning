import {describe, expect, it} from "vitest";
import {
  beatAtFrame,
  diagnoseOriginOnLattice,
  selectorMatches,
  stableIdentityColor,
  worldToScreen,
} from "../debugOverlayMath";
import {MATRIX_TRANSFORMATION_BEAT_CONTRACT} from "../matrixTransformationBeatSpec";
import {
  MATRIX_TRANSFORMATION_PROJECT_VARIABLES,
  MATRIX_TRANSFORMATION_TUNING,
  MATRIX_TUNING_KEYS,
  validateMatrixTransformationTuning,
} from "../matrixTransformationTuning";

describe("animation authoring debug overlay math", () => {
  it("reports a specific origin-to-lattice mismatch", () => {
    expect(
      diagnoseOriginOnLattice(
        {x: 480, y: 270},
        {x: 432, y: 270},
        100,
      ),
    ).toEqual({
      id: "grid.origin-on-lattice",
      pass: false,
      origin: {x: 480, y: 270},
      nearest: {x: 432, y: 270},
      delta: 48,
      message: [
        "grid.origin-on-lattice: FAIL",
        "origin: (480, 270)",
        "nearest lattice intersection: (432, 270)",
        "delta: 48 px",
      ].join("\n"),
    });
  });

  it("maps world coordinates with the preview affine transform", () => {
    expect(
      worldToScreen(
        {x: 4, y: -2},
        {a: 2, b: 0, c: 0, d: 2, e: 480, f: 270},
      ),
    ).toEqual({x: 488, y: 266});
  });

  it("matches semantic prefix selectors and keeps identity colours stable", () => {
    expect(
      selectorMatches(
        "semantic:grid:transformed*",
        "semantic:grid:transformed:x:1",
      ),
    ).toBe(true);
    expect(stableIdentityColor("semantic:matrix:column-1")).toBe(
      stableIdentityColor("semantic:matrix:column-1"),
    );
  });

  it("identifies the active chapter directly from a frame", () => {
    expect(
      beatAtFrame(MATRIX_TRANSFORMATION_BEAT_CONTRACT, 675, 30)?.id,
    ).toBe("transform-sample");
  });
});

describe("matrix presentation tuning", () => {
  it("accepts the persisted defaults and exports namespaced project variables", () => {
    expect(validateMatrixTransformationTuning(MATRIX_TRANSFORMATION_TUNING)).toEqual([]);
    expect(Object.keys(MATRIX_TRANSFORMATION_PROJECT_VARIABLES)).toEqual(
      MATRIX_TUNING_KEYS.map(
        (key) => `authoring.matrix-transformations.${key}`,
      ),
    );
  });

  it("contains no editable mathematical truth", () => {
    expect(MATRIX_TUNING_KEYS.join(" ")).not.toMatch(
      /matrix|coordinate|determinant|vector|sample|solution/i,
    );
  });

  it("rejects unknown, missing, and out-of-range tuning values", () => {
    expect(
      validateMatrixTransformationTuning({cameraZoom: 99, matrix: [[1, 0]]}),
    ).toEqual(
      expect.arrayContaining([
        "unknown tuning keys: matrix",
        "cameraZoom must be 1–1.35",
        "ledgerX must be a finite number",
      ]),
    );
  });
});
