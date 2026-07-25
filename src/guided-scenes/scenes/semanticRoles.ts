/**
 * Semantic colour grammar for every guided scene.
 *
 * A role names a MEANING, not a decoration. The July 2026 audit's "cross-scene
 * colour drift" finding was that one hue carried several unrelated meanings —
 * most damagingly `selected` marked both the target `b` and the solution point in
 * linear-systems, the two objects that scene exists to keep apart. The rules:
 *
 * | role          | meaning                                                   |
 * | ------------- | --------------------------------------------------------- |
 * | `original`    | the object BEFORE a transformation (ghosts, inputs)        |
 * | `transformed` | the same object AFTER it (images, outputs)                 |
 * | `basis1`/`basis2` | a CO-EQUAL pair (e₁/e₂, R1/R2, two eigendirections)    |
 * | `selected`    | the object currently under discussion / held invariant     |
 * | `result`      | a value DERIVED from the others (a combination, a sum)      |
 * | `target`      | the thing being aimed at (b, a search key, a destination)  |
 * | `violation`   | a rule broken, or a move that cannot be made               |
 * | `dim`         | retired / out of focus                                     |
 *
 * Two rules follow, and are enforced by `semanticPalette.test.ts`:
 *
 *  1. Within one comparison, mathematically different objects never share a
 *     hue. (`target` exists precisely so `b` and the solution point differ.)
 *  2. Colour is never the ONLY cue: keep labels, dashes, shapes, or legends.
 */
export const ROLE = {
  background: "#0e1116",
  grid: "#1e2633",
  gridTransformed: "#2f3a4d",
  axis: "#3a4556",
  text: "#e8edf4",
  textMuted: "#9aa6b5",
  original: "#7eb8d4",
  transformed: "#d4a574",
  basis1: "#7dba8a",
  basis2: "#b89ad4",
  selected: "#e8d48a",
  result: "#e87a9a",
  /** What the construction is aiming at — never also the thing that reaches it. */
  target: "#2fc7b8",
  /** A broken rule, or a move the mathematics forbids. Never plain data. */
  violation: "#f26e5c",
  dim: "#3a4453",
} as const;

/**
 * Roles introduced by this pass to break a real collision. They are held to a
 * stricter separation than the legacy palette (≥22° of hue from EVERY other
 * role) because they exist precisely to be told apart from their neighbours.
 */
export const RESOLVING_SEMANTIC_ROLES = ["target", "violation"] as const;

/** Roles whose hues must stay mutually distinguishable (rule 1 above). */
export const DISTINCT_SEMANTIC_ROLES = [
  "original",
  "transformed",
  "basis1",
  "basis2",
  "selected",
  "result",
  "target",
  "violation",
] as const satisfies readonly (keyof typeof ROLE)[];
