import { describe, expect, it } from "vitest";
import { SUBSPACE_FRESH, SUBSPACE_PRESETS } from "../exampleData";
import {
  columnSpaceBasis,
  imageShape,
  nullSpaceBasis,
  rankNullityCount,
  rankOf,
  type Matrix,
} from "../../math";

/**
 * The rank labels in `exampleData` are claims. This test holds them: every
 * preset's declared rank is recomputed from `src/math`, so a typo in the literal
 * fails here rather than shipping a preset labelled "Rank 2" that is not.
 *
 * It also pins the freshness requirement — the practice matrices must differ
 * from every preset the scene and explorer show.
 */

describe("L8/L9 3×3 presets declare their true rank", () => {
  it("recomputes every preset's rank and image shape", () => {
    for (const preset of SUBSPACE_PRESETS) {
      const matrix = preset.matrix as unknown as Matrix;
      expect(rankOf(matrix), preset.id).toBe(preset.rank);
      expect(columnSpaceBasis(matrix).dimension, preset.id).toBe(preset.rank);
      expect(nullSpaceBasis(matrix).dimension, preset.id).toBe(3 - preset.rank);
    }
  });

  it("covers every image shape from solid down to a point", () => {
    const shapes = SUBSPACE_PRESETS.map((p) => imageShape(p.rank));
    expect(shapes).toEqual(["solid", "plane", "line", "point"]);
  });

  it("shows rank and nullity moving in opposite directions across the presets", () => {
    const counts = SUBSPACE_PRESETS.map((p) =>
      rankNullityCount(p.matrix as unknown as Matrix),
    );
    expect(counts.map((c) => c.rank)).toEqual([3, 2, 1, 0]);
    expect(counts.map((c) => c.nullity)).toEqual([0, 1, 2, 3]);
    for (const count of counts) expect(count.balances).toBe(true);
  });
});

describe("L8/L9 practice matrices are fresh and have the ranks the prompts assume", () => {
  it("has the declared ranks", () => {
    expect(rankOf(SUBSPACE_FRESH.rankTwo as unknown as Matrix)).toBe(2);
    expect(rankOf(SUBSPACE_FRESH.rankOne as unknown as Matrix)).toBe(1);
    expect(rankOf(SUBSPACE_FRESH.wide as unknown as Matrix)).toBe(2);
  });

  it("puts the wide map's two spaces in different ambient spaces", () => {
    const wide = SUBSPACE_FRESH.wide as unknown as Matrix;
    expect(columnSpaceBasis(wide).ambientDimension).toBe(2);
    expect(nullSpaceBasis(wide).ambientDimension).toBe(3);
    expect(nullSpaceBasis(wide).dimension).toBe(1);
  });

  it("gives the rank-1 fresh map a PLANE of null vectors", () => {
    const rankOne = SUBSPACE_FRESH.rankOne as unknown as Matrix;
    expect(nullSpaceBasis(rankOne).dimension).toBe(2);
    expect(columnSpaceBasis(rankOne).dimension).toBe(1);
  });

  it("stays FRESH: no practice matrix equals a preset the scene shows", () => {
    const presets = SUBSPACE_PRESETS.map((p) => JSON.stringify(p.matrix));
    for (const fresh of [SUBSPACE_FRESH.rankTwo, SUBSPACE_FRESH.rankOne]) {
      expect(presets).not.toContain(JSON.stringify(fresh));
    }
  });

  it("takes the fresh column-space bases from the original columns", () => {
    for (const fresh of [SUBSPACE_FRESH.rankTwo, SUBSPACE_FRESH.rankOne]) {
      const matrix = fresh as unknown as Matrix;
      const columns = (matrix[0] ?? []).map((_, j) => matrix.map((row) => row[j]!));
      for (const vector of columnSpaceBasis(matrix).basis) {
        expect(
          columns.some((column) =>
            column.every((entry, i) => Math.abs(entry - vector[i]!) < 1e-12),
          ),
        ).toBe(true);
      }
    }
  });
});
