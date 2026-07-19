import { describe, expect, it } from "vitest";
import {
  DETERMINANT_PRESETS,
  EIGEN_PRESETS,
  MATRIX_EXAMPLES,
  MATRIX_EXAMPLE_IDS,
  TRANSFORM_PRESETS,
  getMatrixExample,
  requireMatrixExample,
} from "../examples";

const REQUIRED_IDS = [
  "identity",
  "uniform-scale",
  "non-uniform-scale",
  "shear",
  "rotation",
  "reflection",
  "singular-collapse",
  "determinant-negative",
  "shear-2-1",
  "eigen-distinct",
  "eigen-repeated-diagonalizable",
  "eigen-repeated-defective",
  "eigen-no-real",
] as const;

describe("shared matrix example registry", () => {
  it("has unique ids", () => {
    const ids = MATRIX_EXAMPLES.map((example) => example.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(MATRIX_EXAMPLE_IDS).toEqual(ids);
  });

  it("contains every required example", () => {
    for (const id of REQUIRED_IDS) {
      expect(getMatrixExample(id), `missing ${id}`).toBeDefined();
    }
  });

  it("looks up examples by id and throws on unknown ids", () => {
    const example = requireMatrixExample("shear-2-1");
    expect(example.matrix).toEqual([
      [2, 1],
      [0, 1],
    ]);
    expect(() => requireMatrixExample("does-not-exist")).toThrow(/Unknown matrix example/);
  });

  it("exposes ordered preset lists that reference known ids", () => {
    for (const id of [...TRANSFORM_PRESETS, ...EIGEN_PRESETS, ...DETERMINANT_PRESETS]) {
      expect(getMatrixExample(id)).toBeDefined();
    }
  });

  it("keeps definitions immutable enough that lookups share the same object", () => {
    expect(getMatrixExample("identity")).toBe(requireMatrixExample("identity"));
  });
});
