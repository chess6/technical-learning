import { describe, expect, it } from "vitest";
import { analyzeEigen2x2, matrixVectorMultiply, scaleVector } from "../../../math";
import {
  COLLAPSE,
  DEFECTIVE,
  DEMO_MAX_UNITS,
  MAIN,
  MAIN_FIRST,
  MAIN_PAIRS,
  NEGATIVE,
  REVERSE,
  ROTATION,
  SCALAR,
  STRETCH,
  ZERO_EIG,
  demoBaseFor,
  eigenDirections,
  eigenpairs,
  requireEigenpair,
} from "../eigenSceneData";

/**
 * The Lesson 4 Watch scene states three λ values on canvas and draws an arrow
 * whose tip is `base · λ`. Both come from this module, so these tests are the
 * guard the audit asked for: the numbers are checked against `analyzeEigen2x2`
 * rather than against themselves.
 *
 * (The scene module itself imports `@motion-canvas/2d` and so can never be
 * loaded in jsdom — which is exactly why the derivation lives out here.)
 */

/** |x| for a 2-vector. */
const norm = (v: readonly [number, number]): number => Math.hypot(v[0], v[1]);

describe("eigen scene data — every λ is derived, not asserted", () => {
  it("resolves each λ demo to the case its beat teaches", () => {
    expect(STRETCH.lambda).toBeGreaterThan(1);
    expect(REVERSE.lambda).toBeLessThan(0);
    expect(COLLAPSE.lambda).toBeCloseTo(0, 12);
  });

  it("gives each demo a genuine eigenpair: A·dir = λ·dir", () => {
    const cases: Array<[string, typeof STRETCH, typeof NEGATIVE]> = [
      ["stretch", STRETCH, NEGATIVE],
      ["reverse", REVERSE, NEGATIVE],
      ["collapse", COLLAPSE, ZERO_EIG],
      ["highlight", MAIN_FIRST, MAIN],
    ];
    for (const [name, pair, matrix] of cases) {
      const image = matrixVectorMultiply(matrix, pair.dir);
      const expected = scaleVector(pair.dir, pair.lambda);
      expect(image[0], `${name} x`).toBeCloseTo(expected[0], 10);
      expect(image[1], `${name} y`).toBeCloseTo(expected[1], 10);
      // Unit directions, so the scene's `base · λ` reasoning about lengths holds.
      expect(norm(pair.dir), `${name} |dir|`).toBeCloseTo(1, 10);
    }
  });

  it("keeps the λ arc on one persistent pair of lines", () => {
    // stretch/predict/reverse run on NEGATIVE and collapse on ZERO_EIG; the
    // scene places the eigenlines once and never moves them, which is only
    // honest if both matrices really share the same two eigendirections.
    const axesOf = (m: typeof NEGATIVE) =>
      eigenpairs(m)
        .map((p) => `${p.dir[0].toFixed(6)},${p.dir[1].toFixed(6)}`)
        .sort();
    expect(axesOf(ZERO_EIG)).toEqual(axesOf(NEGATIVE));
  });

  it("keeps every demo arrow inside the overlay-clear teaching band", () => {
    for (const pair of [STRETCH, REVERSE, COLLAPSE, MAIN_FIRST]) {
      const base = demoBaseFor(pair.lambda);
      expect(base).toBeGreaterThan(0);
      // Both the ghost (at `base`) and the result (at `base · λ`) must fit.
      expect(base).toBeLessThanOrEqual(DEMO_MAX_UNITS + 1e-9);
      expect(Math.abs(base * pair.lambda)).toBeLessThanOrEqual(
        DEMO_MAX_UNITS + 1e-9,
      );
    }
  });

  it("reports the eigenline count each case beat draws", () => {
    // `showEigenGraphics` fades in exactly this many lines, so these counts are
    // what makes "only one line survives" and "no line is left in place" true.
    expect(eigenDirections(MAIN)).toHaveLength(2);
    expect(eigenDirections(SCALAR)).toHaveLength(2);
    expect(eigenDirections(DEFECTIVE)).toHaveLength(1);
    expect(eigenDirections(ROTATION)).toHaveLength(0);
    expect(analyzeEigen2x2(ROTATION).kind).toBe("complex");
  });

  it("lists A's eigenvalues for the equation beat", () => {
    expect(MAIN_PAIRS).toHaveLength(2);
    expect(MAIN_PAIRS[0]).toEqual(MAIN_FIRST);
  });

  it("fails loudly when a matrix no longer has the case a beat teaches", () => {
    // The regression this whole module exists to prevent: a hand-written label
    // would have kept animating "λ = 2" over a matrix that no longer has it.
    expect(() =>
      requireEigenpair(ROTATION, "λ > 1", (p) => p.lambda > 1),
    ).toThrow(/no λ > 1 eigenpair/);
    expect(() =>
      requireEigenpair(SCALAR, "λ < 0", (p) => p.lambda < 0),
    ).toThrow(/no λ < 0 eigenpair/);
  });
});
