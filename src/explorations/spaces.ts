/**
 * Math-space descriptors (advisory).
 *
 * The mathematical-space contract standardizes how we *name* the space a panel
 * or axis lives in, so a learner is never left guessing whether two pictures
 * share a frame. See `docs/MATH_SPACE_CONVENTIONS.md`.
 *
 * IMPORTANT: these labels describe SEMANTIC ROLES, not vector-space identity.
 * Distinct labels do not always imply distinct underlying vector spaces — the
 * systems lesson's "coefficient space (x, y)" and "output space" are both R^2.
 * The convention governs clarity for the learner, not a claim about which
 * vector spaces are equal or different.
 *
 * This module is advisory and opt-in: explorers may import a descriptor to
 * single-source a visible label/gloss, but nothing here forces a layout,
 * animation, or component structure.
 */

export type MathSpaceRole =
  | "input"
  | "coefficient"
  | "output"
  | "transformed"
  | "coordinate-relative"
  | "graph-of-constraints";

export interface MathSpaceDescriptor {
  role: MathSpaceRole;
  /** Learner-facing primary label for a panel heading or axis frame. */
  label: string;
  /** Short clause describing what a point/line means in this space. */
  gloss: string;
}

/**
 * The two spaces the linear-systems explorer puts side by side. Both are R^2;
 * the labels distinguish the ROLE each plane plays (where the unknowns live vs.
 * where the target b lives), which is the whole pedagogical point of showing
 * the row and column pictures together.
 */
export const COEFFICIENT_SPACE: MathSpaceDescriptor = {
  role: "coefficient",
  label: "Coefficient space (x, y)",
  gloss: "each equation is a line; a solution is a point on both",
};

export const OUTPUT_SPACE: MathSpaceDescriptor = {
  role: "output",
  label: "Output space",
  gloss: "blend col₁, col₂ to reach b",
};

/** Lookup of the shared descriptors by role (advisory registry). */
export const MATH_SPACES: Partial<Record<MathSpaceRole, MathSpaceDescriptor>> = {
  coefficient: COEFFICIENT_SPACE,
  output: OUTPUT_SPACE,
};
