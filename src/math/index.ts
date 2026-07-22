export type {
  EigenAnalysis2x2,
  EigenPair,
  Matrix2x2,
  MatrixExample,
  Subspace2D,
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
  matrixColumn,
  matrixMatrixMultiply,
  determinant2x2,
  transpose2x2,
  applyMatrixToPoints,
  applyMatrixToUnitSquare,
  approximatelyEqualMatrix,
  matrixTrace,
  verifiesEigenpair,
  transformedGridSegments,
} from "./matrices";
export type { TransformedGridSegment } from "./matrices";

export {
  assertTransformedBasisMatchesColumns,
  assertGridDirectionMatchesBasis,
  assertPointMatchesMatrixTransform,
  assertUnitSquareAreaMatchesDeterminant,
  assertEigenpair,
  assertTransformedGridInvariants,
  gridFamilyDirection,
} from "./invariants";

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
  characteristicPolynomial2x2,
  characteristicRoots2x2,
  matrixShift,
  nullspaceBasis2x2,
  analyzeEigen2x2,
  realEigenvalues,
  eigenDerivation2x2,
} from "./eigen";
export type {
  CharacteristicPolynomial2x2,
  EigenDerivation2x2,
  EigenDerivationStep2x2,
} from "./eigen";

export {
  classifyLinearSystem2x2,
  solveLinearSystem2x2,
} from "./systems";
export type {
  LinearSystemKind,
  LinearSystem2x2Classification,
} from "./systems";

export {
  classifyDeterminant,
  signedParallelogramArea,
} from "./determinantClassify";
export type {
  AreaScaleEffect,
  DeterminantClassification,
} from "./determinantClassify";

export {
  lineAngleBetweenVectors,
  classifyEigenCandidate,
  summarizeEigenAnalysis,
  stabilizeDirection,
} from "./eigenClassify";
export type {
  EigenCandidateResult,
  EigenAnalysisSummary,
} from "./eigenClassify";

export {
  MATRIX_EXAMPLES,
  MATRIX_EXAMPLE_IDS,
  TRANSFORM_PRESETS,
  EIGEN_PRESETS,
  DETERMINANT_PRESETS,
  DIAGNOSTIC_PRESETS,
  getMatrixExample,
  requireMatrixExample,
} from "./examples";

export type {
  Vector3,
  Matrix3x3,
  CollapseDimension3,
} from "./matrices3";
export {
  IDENTITY_MATRIX_3,
  UNIT_CUBE,
  matrixVectorMultiply3,
  matrixMatrixMultiply3,
  scaleMatrix3,
  addMatrices3,
  determinant3x3,
  matrixShift3,
  magnitude3,
  scaleVector3,
  approximatelyEqualVector3,
  approximatelyEqualMatrix3,
  normalizeVector3,
  rank3x3,
  nullity3x3,
  collapseDimension3,
  applyMatrixToPoints3,
  applyMatrixToUnitCube,
} from "./matrices3";

export {
  verifiesEigenpair3,
  eigenDirectionForEigenvalue3,
} from "./eigen3";

export {
  CYCLIC_PERMUTATION_3,
  EIGEN_3D_EXTENSION_MATRIX,
  EIGEN_3D_EXTENSION_CHAR_POLY,
  EIGEN_3D_EXTENSION_EXAMPLE,
} from "./examples3";
export type {
  CuratedCharPoly3,
  Eigen3DExtensionExample,
} from "./examples3";

export {
  KARATSUBA_EXPONENT,
  assertBranchLeafCount,
  assertMiddleCoefficientIdentity,
  assertRecombinationEqualsProduct,
  assertThreeProductsMatchNaive,
  digitLength,
  foilRegions,
  karatsubaMultiply,
  karatsubaStep,
  leafCount,
  middleCoefficient,
  multiplicationCount,
  naiveMultiply,
  normalizeCoefficients,
  recursionTree,
  splitDecimal,
} from "./karatsuba";
export type {
  CarryStep,
  DigitSplit,
  FoilRegions,
  KaratsubaStep,
  NormalizedCoefficients,
  TreeNode,
} from "./karatsuba";
