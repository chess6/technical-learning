import type { Matrix2x2 } from "../../math";

/**
 * Pure, Motion-Canvas-free readout formatters shared by guided scenes.
 *
 * Why a separate module: scene files import `@motion-canvas/2d`, so unit tests
 * cannot resolve them in jsdom (see `sceneDescriptions.test.ts`). Anything a
 * scene DISPLAYS as a number or a sentence therefore lives here, where
 * `sceneReadouts.test.ts` can check it against the mathematics directly.
 *
 * This is the "derive displayed values from shared data" rule with teeth: the
 * July 2026 audit found the determinant headline set imperatively before and
 * after each morph (so it lagged the geometry through the two beats where the
 * number mattered most) and the rank–nullity total typed as a third literal
 * beside the two counts it was supposed to be the sum of. Both now go through
 * functions that are called every frame and are covered by tests.
 */

/** Compact numeric formatting for on-canvas labels (avoids "-0"). */
export function formatSceneNumber(n: number, digits = 2): string {
  const factor = 10 ** digits;
  const r = Math.round(n * factor) / factor;
  return Object.is(r, -0) ? "0" : String(r);
}

/**
 * The rank–nullity ledger line. The total is the SUM of the two counts, never a
 * separately supplied number, so the ledger cannot be drawn out of balance.
 */
export function formatLedgerTally(rank: number, nullity: number): string {
  return `${rank} survived  +  ${nullity} crushed  =  ${rank + nullity}`;
}

/** The unsigned area factor headline: |det| is what "area scale" means. */
export function formatAreaFactor(determinant: number): string {
  return `area factor ≈ ${formatSceneNumber(Math.abs(determinant))}`;
}

/**
 * The signed determinant headline: magnitude AND sign, plus the word for what
 * the sign currently means, so a paused frame is self-describing.
 */
export function formatSignedArea(determinant: number): string {
  const magnitude = formatSceneNumber(Math.abs(determinant));
  const signed = formatSceneNumber(determinant);
  return `det(A) ≈ ${signed} · |det| ≈ ${magnitude} · ${orientationWord(determinant)}`;
}

/** What the sign of the determinant says about orientation. */
export function orientationWord(determinant: number, epsilon = 5e-3): string {
  if (Math.abs(determinant) <= epsilon) return "flattened";
  return determinant > 0 ? "orientation kept" : "orientation reversed";
}

/**
 * Worst-case comparisons for a search in a tree of the given height: one
 * comparison per level, so height + 1. Shared by the BST scene's cost readouts
 * so the caption and the label cannot disagree about what "cost" means.
 */
export function worstCaseComparisons(height: number): number {
  return height + 1;
}

/**
 * The SIGNED angle you sweep going from the first column to the second, taking
 * the shorter way round; `null` when a column is degenerate.
 *
 * This is what "orientation" means for a 2×2 map, and its sign is the sign of
 * the determinant — which is exactly why it can be drawn as an arc that
 * reverses when the determinant crosses zero. The determinant scene used to
 * indicate orientation with an arrow lying along Ae₁ alone, which carries no
 * handedness information at all.
 */
export function orientationSweep(matrix: Matrix2x2): number | null {
  const first: [number, number] = [matrix[0][0], matrix[1][0]];
  const second: [number, number] = [matrix[0][1], matrix[1][1]];
  if (Math.hypot(...first) < 1e-9 || Math.hypot(...second) < 1e-9) return null;
  let sweep = Math.atan2(second[1], second[0]) - Math.atan2(first[1], first[0]);
  while (sweep > Math.PI) sweep -= 2 * Math.PI;
  while (sweep <= -Math.PI) sweep += 2 * Math.PI;
  return sweep;
}
