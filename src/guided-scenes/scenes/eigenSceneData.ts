import {
  analyzeEigen2x2,
  normalizeVector,
  requireMatrixExample,
  scaleVector,
  stabilizeDirection,
  type Matrix2x2,
  type Vector2 as MathV,
} from "../../math";
import { EIGEN_LESSON_EXAMPLE } from "../../lessons/exampleData";

/**
 * Motion-Canvas-free data for the Lesson 4 Watch scene
 * (`eigenvectorsInvariantDirectionsScene`).
 *
 * Why this is a separate module: the scene file imports `@motion-canvas/2d`, so
 * unit tests cannot import it (see `sceneDescriptions.test.ts` — scene modules
 * are only ever dynamically imported, never resolved, in jsdom). Every λ and
 * eigendirection the scene states therefore lives here, where
 * `eigenSceneData.test.ts` can assert it against `analyzeEigen2x2` directly.
 *
 * The July 2026 guided-animation audit found the λ demos hand-acting their
 * numbers (`demoLambda.text("λ = 2")` beside a hand-chosen direction) — honest
 * for today's matrices, silently wrong the moment one is edited. Resolving each
 * demo by the PROPERTY its beat teaches ("the negative one") means a matrix
 * that no longer has that case fails a test instead of animating a false label.
 */

export const MAIN = EIGEN_LESSON_EXAMPLE.matrix as Matrix2x2;
export const SCALAR = requireMatrixExample("eigen-repeated-diagonalizable")
  .matrix as Matrix2x2;
export const DEFECTIVE = requireMatrixExample("eigen-repeated-defective")
  .matrix as Matrix2x2;
export const ROTATION = requireMatrixExample("eigen-no-real").matrix as Matrix2x2;
export const NEGATIVE = requireMatrixExample("eigen-negative").matrix as Matrix2x2;
export const ZERO_EIG = requireMatrixExample("eigen-zero").matrix as Matrix2x2;

export type Eigenpair = { lambda: number; dir: MathV };

/**
 * Every real eigenpair of `m` as (λ, stabilized unit direction), straight from
 * the analyzer. The scene never writes an eigenvalue or direction down itself.
 */
export function eigenpairs(m: Matrix2x2): Eigenpair[] {
  const analysis = analyzeEigen2x2(m);
  if (analysis.kind === "complex") return [];
  if (analysis.kind === "distinct-real") {
    return analysis.pairs.flatMap((pair) => {
      const unit = normalizeVector(pair.eigenvector);
      return unit
        ? [{ lambda: pair.eigenvalue, dir: stabilizeDirection(unit) }]
        : [];
    });
  }
  return analysis.eigenspaceBasis.flatMap((vector) => {
    const unit = normalizeVector(vector);
    return unit
      ? [{ lambda: analysis.eigenvalue, dir: stabilizeDirection(unit) }]
      : [];
  });
}

/** The eigenpair a beat is about, or a hard failure naming what is missing. */
export function requireEigenpair(
  m: Matrix2x2,
  described: string,
  matches: (pair: Eigenpair) => boolean,
): Eigenpair {
  const found = eigenpairs(m).find(matches);
  if (!found) {
    throw new Error(
      `eigenvectors-invariant-directions: no ${described} eigenpair in ${JSON.stringify(m)}`,
    );
  }
  return found;
}

/** The three λ demos, each resolved by the property its beat teaches. */
export const STRETCH = requireEigenpair(NEGATIVE, "λ > 1", (p) => p.lambda > 1);
export const REVERSE = requireEigenpair(NEGATIVE, "λ < 0", (p) => p.lambda < 0);
export const COLLAPSE = requireEigenpair(
  ZERO_EIG,
  "λ = 0",
  (p) => Math.abs(p.lambda) < 1e-9,
);

/** A's own eigenpairs, for the `highlight` readout and the `equation` list. */
export const MAIN_PAIRS = eigenpairs(MAIN);
export const MAIN_FIRST = requireEigenpair(MAIN, "real", () => true);

/** Longest arrow the overlay-clear teaching band tolerates (±2.5 units, with
 * room for the λ label to sit outside the arrow). */
export const DEMO_MAX_UNITS = 2.2;

/**
 * Ghost length for a demo, chosen so the RESULT — which lands at `base · λ`,
 * not at some separately chosen length — still fits inside the frame.
 */
export function demoBaseFor(lambda: number): number {
  return Math.min(1.5, DEMO_MAX_UNITS / Math.max(1, Math.abs(lambda)));
}

/** Full-line eigendirections for `m`, at the length the scene draws them. */
export function eigenDirections(m: Matrix2x2): MathV[] {
  return eigenpairs(m).map((pair) => scaleVector(pair.dir, 1.6));
}
