import { OPENING_GRAPHIC } from "../lessons/openingGraphic";
import { applyMatrixToPoints, type Matrix2x2, type Vector2 } from "../math";

/**
 * Transform the named craft anchors (nose / fin) through the shared math, for
 * before/after correspondence markers. Kept out of the component module so
 * fast-refresh only sees component exports there.
 */
export function anchorImages(matrix: Matrix2x2): {
  noseOriginal: Vector2;
  finOriginal: Vector2;
  noseImage: Vector2;
  finImage: Vector2;
} {
  const nose = OPENING_GRAPHIC.outline[OPENING_GRAPHIC.anchors.nose]!;
  const fin = OPENING_GRAPHIC.outline[OPENING_GRAPHIC.anchors.fin]!;
  const [noseImage, finImage] = applyMatrixToPoints(matrix, [nose, fin]);
  return {
    noseOriginal: nose,
    finOriginal: fin,
    noseImage: noseImage!,
    finImage: finImage!,
  };
}
