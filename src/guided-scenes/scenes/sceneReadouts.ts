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
 * A coordinate pair as a scene reads it: `(1, 2)`, `(3, −1)`.
 *
 * The minus is the typographic U+2212, matching `formatRowEquation`: the two
 * appear one line apart on the linear-systems card, and a hyphen beside a
 * proper minus reads as two different symbols for the same thing.
 */
export function formatCoordinatePair(x: number, y: number): string {
  const entry = (value: number) => formatSceneNumber(value).replace("-", "−");
  return `(${entry(x)}, ${entry(y)})`;
}

/**
 * One row of a 2-variable system as the equation a learner would write:
 * `(1, 3, -1)` → `x + 3y = −1`.
 *
 * Why this is a function and not a caption string: the linear-systems scene
 * MORPHS its matrix and target through the trichotomy, and the equations used
 * to be typed once, so from the moment the lines slid onto each other the
 * algebra on screen described a system that was no longer being drawn. Deriving
 * the equation from the same four signals the geometry reads makes the two
 * views incapable of disagreeing.
 *
 * A zero coefficient drops its term (`0x + 1y = 2` reads `y = 2`); an all-zero
 * left-hand side keeps a literal `0` so `0 = 3` — the contradiction that IS the
 * no-solution case — still reads as an equation.
 */
export function formatRowEquation(a: number, b: number, c: number): string {
  const terms: string[] = [];
  const coefficient = (value: number, symbol: string): string => {
    const magnitude = Math.abs(value);
    const digits = formatSceneNumber(magnitude);
    return digits === "1" ? symbol : `${digits}${symbol}`;
  };
  const push = (value: number, symbol: string): void => {
    if (Math.abs(value) < 5e-3) return;
    const sign = value < 0 ? "−" : "+";
    const term = coefficient(value, symbol);
    terms.push(terms.length === 0 && sign === "+" ? term : `${sign} ${term}`);
  };
  push(a, "x");
  push(b, "y");
  const left = terms.length === 0 ? "0" : terms.join(" ");
  // The leading term keeps its minus glued on: "−x + 3y", not "− x + 3y".
  return `${left.replace(/^− /, "−")} = ${formatSceneNumber(c).replace("-", "−")}`;
}

/**
 * A direction named by the simplest integer pair on the SAME ray, e.g. the
 * drawn unit vector `(0.707, −0.707)` reads `(1, −1)`.
 *
 * Sign is preserved deliberately. The eigenvector-derivation scene drew its
 * λ = 2 direction pointing down-right and labelled it `(−1,1)` — the opposite
 * ray. Both are eigenvectors, but the label named a vector that was not the one
 * on screen, and it disagreed with the lesson prose, which orients that
 * eigenvector as `(1,−1)`. Deriving the label from the drawn direction makes
 * that disagreement impossible.
 *
 * Falls back to rounded components when no small integer pair fits (the drawn
 * direction always comes from a shared eigen/nullspace helper, so this is the
 * unusual case, not the normal one).
 */
export function formatDirectionRatio(
  direction: readonly [number, number],
  epsilon = 1e-6,
): string {
  const [x, y] = direction;
  const magnitudes = [Math.abs(x), Math.abs(y)].filter((m) => m > epsilon);
  if (magnitudes.length === 0) return formatCoordinatePair(0, 0);
  const smallest = Math.min(...magnitudes);
  const scaled: [number, number] = [x / smallest, y / smallest];
  const rounded: [number, number] = [
    Math.round(scaled[0]),
    Math.round(scaled[1]),
  ];
  const isIntegral =
    Math.abs(scaled[0] - rounded[0]) < 1e-6 &&
    Math.abs(scaled[1] - rounded[1]) < 1e-6 &&
    Math.max(Math.abs(rounded[0]), Math.abs(rounded[1])) <= 20;
  return isIntegral
    ? formatCoordinatePair(rounded[0], rounded[1])
    : formatCoordinatePair(x, y);
}

/**
 * The solution count in words, for a verdict driven by the shared
 * `classifyLinearSystem2x2`. Taking the classification kind (rather than a
 * string the scene chooses per beat) is the point: the words on screen are the
 * classifier's answer about the numbers currently drawn.
 *
 * Deliberately terse — it sits under its own "solution count" label in a side
 * panel, and the full sentences ("infinitely many solutions") ran past the
 * stage edge, which the text-clipping hard gate catches.
 */
export function formatSolutionCount(
  kind: "unique" | "infinite" | "none",
): string {
  switch (kind) {
    case "unique":
      return "exactly one";
    case "infinite":
      return "infinitely many";
    case "none":
      return "none";
  }
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
 * The signed determinant headline: the signed value plus the word for what
 * its sign currently means, so a paused frame is self-describing.
 *
 * It deliberately does NOT also print `|det| ≈ …`. That term restated the
 * digits already on screen, and it pushed the reversed-orientation reading
 * ("det(A) ≈ -0.01 · |det| ≈ 0.01 · orientation reversed") past the overlay
 * band's width, wrapping the headline to two lines and clipping the first one
 * off the top of the stage — found by the text-clipping hard gate.
 */
export function formatSignedArea(determinant: number): string {
  const signed = formatSceneNumber(determinant);
  return `det(A) ≈ ${signed} · ${orientationWord(determinant)}`;
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
