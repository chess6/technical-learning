/**
 * Product-level identity — the name of the application itself, as distinct from
 * any course inside it.
 *
 * The platform holds several courses across several subjects (see
 * [src/lessons/courseModel.ts](../lessons/courseModel.ts)), so the app-level
 * brand must not name one of them. "Interactive Textbook" is the provisional
 * label, taken from the canonical product document
 * (`docs/product/vision.md` — "Interactive Textbook Vision"); a course's own
 * title and subtitle are rendered contextually instead, wherever a course frame
 * is on screen.
 */

export const PRODUCT_NAME = "Interactive Textbook";

/** One line, in the product's own voice (vision.md §1's north star, compressed). */
export const PRODUCT_TAGLINE =
  "Watch an idea form, take the controls, then check yourself.";
