/**
 * Safe-frame convention for all guided Motion Canvas scenes.
 *
 * Logical stage is SCENE_WIDTH × SCENE_HEIGHT. All geometry, labels, and
 * arrows must stay inside the inset SAFE_MARGIN so CSS scaling (object-fit
 * contain) never clips educational content at any target viewport or zoom.
 *
 * Overlay equation/caption text is center-anchored at LABEL_CENTER_X — never
 * place long Txt nodes at LABEL_LEFT_X (default Txt origin is the center, so
 * left-edge placement clips half the string).
 */

export const SCENE_WIDTH = 960;
export const SCENE_HEIGHT = 540;
/** Aspect ratio used by the React canvas wrapper. */
export const SCENE_ASPECT = SCENE_WIDTH / SCENE_HEIGHT;

/** Inset from each edge of the logical stage (pixels). */
export const SAFE_MARGIN = 80;

/** Usable drawing area inside the safe frame. */
export const SAFE_WIDTH = SCENE_WIDTH - SAFE_MARGIN * 2;
export const SAFE_HEIGHT = SCENE_HEIGHT - SAFE_MARGIN * 2;

/**
 * Pixels per math unit. Sized so geometry and labels read at roughly body-text
 * scale when the 960×540 stage is CSS-scaled into the Watch panel.
 * Keep a ±4-unit teaching grid well inside the safe frame (4 * 64 = 256).
 */
export const SCALE = 64;

/** Default half-extent for decorative grids (math units). */
export const GRID_HALF_EXTENT = 4;

/** Horizontal anchor for overlay captions (center of the stage). */
export const LABEL_CENTER_X = 0;

/**
 * Overlay caption bands live in the stage margins — outside the teaching
 * geometry — so titles/captions never sit on vectors, tips, or the working
 * parallelogram. Txt is center-anchored on these points.
 *
 * Vertical budget (540 stage, ±270 from center):
 *   top band ≈ y ∈ [-270, -185], bottom band ≈ y ∈ [185, 270]
 * Teaching geometry should stay within roughly ±2.6 math units (±166 px)
 * so it clears both bands with a small gap.
 */
export const LABEL_TOP_Y = -(SCENE_HEIGHT / 2 - 40);
export const LABEL_BOTTOM_Y = SCENE_HEIGHT / 2 - 48;

/**
 * Preferred half-extent for decorative grids when overlays are present.
 * Keeps grid lines from running through the caption bands.
 */
export const OVERLAY_CLEAR_HALF_EXTENT = 2.5;

/**
 * @deprecated Prefer LABEL_CENTER_X with a center-aligned overlay label.
 * Kept only for short tip annotations that are offset from a vector tip.
 */
export const LABEL_LEFT_X = -(SCENE_WIDTH / 2 - SAFE_MARGIN);

export const SCENE_SIZE = {
  width: SCENE_WIDTH,
  height: SCENE_HEIGHT,
} as const;
