/**
 * Pure LaTeX string formatting for the elimination design experiment.
 *
 * Motion-Canvas-free on purpose, exactly like `sceneReadouts.ts` in the
 * production scenes: `mathType.ts` imports `@motion-canvas/2d` and therefore
 * cannot be resolved in jsdom, so anything a candidate clip DISPLAYS as text
 * lives here where it can be checked against the mathematics.
 */

/** Upright roman prose, typeset in the same face as the mathematics. */
export function texRoman(text: string): string {
  return `\\text{${text}}`;
}

/** Signed number in LaTeX, with a real minus sign and no `-0`. */
export function texNumber(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  const safe = Object.is(rounded, -0) ? 0 : rounded;
  return String(safe);
}

/** `+ 3` / `- 3`, for building an equation term by term. */
export function texSignedTerm(value: number, symbol: string): string {
  const magnitude = Math.abs(value);
  const body = magnitude === 1 && symbol ? symbol : `${texNumber(magnitude)}${symbol}`;
  return `${value < 0 ? "-" : "+"} ${body}`;
}

/**
 * A row of an augmented system as a displayed equation, e.g. `x + 3y = -1`.
 * Leading `+` is dropped and a unit coefficient loses its `1`, so the result
 * reads the way a person writes it.
 */
export function texEquation(row: readonly [number, number, number]): string {
  const parts: string[] = [];
  const push = (value: number, symbol: string) => {
    if (Math.abs(value) < 1e-9) return;
    const magnitude = Math.abs(value);
    const body = magnitude === 1 ? symbol : `${texNumber(magnitude)}${symbol}`;
    if (parts.length === 0) parts.push(`${value < 0 ? "-" : ""}${body}`);
    else parts.push(`${value < 0 ? "-" : "+"} ${body}`);
  };
  push(row[0], "x");
  push(row[1], "y");
  const left = parts.length > 0 ? parts.join(" ") : "0";
  return `${left} = ${texNumber(row[2])}`;
}
