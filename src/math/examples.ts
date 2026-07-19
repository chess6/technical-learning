import type { MatrixExample } from "./types";

/**
 * Immutable shared matrix/vector examples consumed by guided scenes and Mafs
 * explorations. Do not duplicate these constants in lesson or animation files —
 * look them up by id instead.
 */
export const MATRIX_EXAMPLES = [
  {
    id: "identity",
    title: "Identity",
    description: "Leaves every vector unchanged.",
    matrix: [
      [1, 0],
      [0, 1],
    ],
    inputVector: [1.5, 0.5],
  },
  {
    id: "uniform-scale",
    title: "Uniform scale",
    description: "Stretches the plane by the same factor in every direction.",
    matrix: [
      [2, 0],
      [0, 2],
    ],
    inputVector: [1, 0.5],
  },
  {
    id: "non-uniform-scale",
    title: "Non-uniform scale",
    description: "Stretches x and y by different amounts.",
    matrix: [
      [2, 0],
      [0, 0.5],
    ],
    inputVector: [1, 1],
  },
  {
    id: "shear",
    title: "Horizontal shear",
    description: "Slides horizontal lines while keeping vertical lines fixed.",
    matrix: [
      [1, 1],
      [0, 1],
    ],
    inputVector: [1, 1],
  },
  {
    id: "rotation",
    title: "Rotation (90°)",
    description: "Rotates the plane counterclockwise by 90°. No real eigenvectors.",
    matrix: [
      [0, -1],
      [1, 0],
    ],
    inputVector: [1.5, 0],
  },
  {
    id: "reflection",
    title: "Reflection across x-axis",
    description: "Flips the sign of the y-coordinate; determinant is −1.",
    matrix: [
      [1, 0],
      [0, -1],
    ],
    inputVector: [1, 1],
  },
  {
    id: "singular-collapse",
    title: "Singular collapse",
    description: "Columns are parallel, so the plane collapses onto a line.",
    matrix: [
      [2, 4],
      [1, 2],
    ],
    inputVector: [1, 0],
  },
  {
    id: "determinant-negative",
    title: "Negative determinant",
    description: "Reverses orientation while stretching area.",
    matrix: [
      [1, 1],
      [0, -1],
    ],
    inputVector: [1, 0.5],
  },
  {
    id: "shear-2-1",
    title: "Lesson transformation",
    description:
      "The matrices-as-transformations lesson example: A = [[2, 1], [0, 1]].",
    matrix: [
      [2, 1],
      [0, 1],
    ],
    inputVector: [1.5, 0.5],
  },
  {
    id: "eigen-distinct",
    title: "Distinct real eigenvalues",
    description: "Two independent eigendirections with different stretch factors.",
    matrix: [
      [3, 1],
      [0, 2],
    ],
    inputVector: [1, 1],
  },
  {
    id: "eigen-repeated-diagonalizable",
    title: "Repeated eigenvalue (scalar)",
    description: "A = 2I. Every direction is an eigendirection.",
    matrix: [
      [2, 0],
      [0, 2],
    ],
    inputVector: [1, 0.5],
  },
  {
    id: "eigen-repeated-defective",
    title: "Defective repeated eigenvalue",
    description:
      "Repeated eigenvalue with only one independent eigenvector — do not invent a second.",
    matrix: [
      [1, 1],
      [0, 1],
    ],
    inputVector: [1, 0],
  },
  {
    id: "eigen-no-real",
    title: "No real eigenvectors",
    description: "A pure rotation: every nonzero vector changes direction.",
    matrix: [
      [0, -1],
      [1, 0],
    ],
    inputVector: [1, 0],
  },
  {
    id: "diagnostic-asymmetric",
    title: "Diagnostic (asymmetric)",
    description:
      "Dev/test only: rows ≠ columns so transpose packing bugs are obvious. A = [[1, 2], [3, 4]].",
    matrix: [
      [1, 2],
      [3, 4],
    ],
    inputVector: [1, 1],
  },
  {
    id: "grid-bug-repro",
    title: "Grid orientation repro",
    description:
      "Regression matrix from ERROR_LOG: A e₂ = (0, 2.2) must keep one grid family vertical.",
    matrix: [
      [1.8, 0],
      [1.8, 2.2],
    ],
    inputVector: [1, 1],
  },
] as const satisfies readonly MatrixExample[];

export type MatrixExampleId = (typeof MATRIX_EXAMPLES)[number]["id"];

export const MATRIX_EXAMPLE_IDS: readonly MatrixExampleId[] =
  MATRIX_EXAMPLES.map((example) => example.id);

const byId = new Map<string, MatrixExample>(
  MATRIX_EXAMPLES.map((example) => [example.id, example]),
);

export function getMatrixExample(id: string): MatrixExample | undefined {
  return byId.get(id);
}

export function requireMatrixExample(id: string): MatrixExample {
  const example = byId.get(id);
  if (!example) {
    throw new Error(`Unknown matrix example id: "${id}"`);
  }
  return example;
}

/** Presets useful for the matrices-as-transformations exploration. */
export const TRANSFORM_PRESETS: readonly MatrixExampleId[] = [
  "identity",
  "uniform-scale",
  "shear",
  "rotation",
  "reflection",
  "singular-collapse",
  "shear-2-1",
];

/** Presets useful for the eigenvector exploration. */
export const EIGEN_PRESETS: readonly MatrixExampleId[] = [
  "eigen-distinct",
  "eigen-repeated-diagonalizable",
  "eigen-repeated-defective",
  "eigen-no-real",
  "reflection",
  "shear-2-1",
];

/** Presets useful for the determinant exploration. */
export const DETERMINANT_PRESETS: readonly MatrixExampleId[] = [
  "identity",
  "uniform-scale",
  "shear-2-1",
  "singular-collapse",
  "determinant-negative",
  "reflection",
];

/**
 * Not shown in the default learner preset list. Use for tests and `?debug=1`
 * explorer tooling — rows and columns are visually distinct.
 */
export const DIAGNOSTIC_PRESETS: readonly MatrixExampleId[] = [
  "diagnostic-asymmetric",
  "grid-bug-repro",
];
