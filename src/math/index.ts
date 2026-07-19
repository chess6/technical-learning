export type {
  EigenAnalysis2x2,
  EigenPair,
  Matrix2x2,
  MatrixExample,
  Vector2,
} from "./types";
export { DEFAULT_TOLERANCE } from "./types";

export {
  addVectors,
  subtractVectors,
  scaleVector,
  dotProduct,
  magnitude,
  normalizeVector,
  approximatelyEqualVector,
  areParallel,
  angleBetweenVectors,
  absoluteAngleBetweenVectors,
} from "./vectors";

export {
  IDENTITY_MATRIX,
  UNIT_SQUARE,
  identityMatrix,
  matrixVectorMultiply,
  matrixMatrixMultiply,
  determinant2x2,
  transpose2x2,
  applyMatrixToPoints,
  applyMatrixToUnitSquare,
  approximatelyEqualMatrix,
  matrixTrace,
  verifiesEigenpair,
} from "./matrices";

export {
  clamp,
  lerp,
  lerpVector,
  lerpMatrix,
  lerpIdentityToMatrix,
  easeInOutCubic,
  easeInOutQuad,
  linear,
} from "./interpolation";

export {
  discriminant2x2,
  analyzeEigen2x2,
  realEigenvalues,
} from "./eigen";

export {
  MATRIX_EXAMPLES,
  MATRIX_EXAMPLE_IDS,
  TRANSFORM_PRESETS,
  EIGEN_PRESETS,
  DETERMINANT_PRESETS,
  getMatrixExample,
  requireMatrixExample,
} from "./examples";
