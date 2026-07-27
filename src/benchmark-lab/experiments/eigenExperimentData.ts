import {
  columnSpaceBasis,
  determinant2x2,
  eigenDerivation2x2,
  matrixShift,
  matrixVectorMultiply,
  normalizeVector,
  stabilizeDirection,
  type Matrix2x2,
  type Vector2 as MathVector2,
} from "../../math";
import { EIGEN_LESSON_EXAMPLE } from "../../lessons/exampleData";

/**
 * Motion-Canvas-free data for the eigenvector-derivation design experiment.
 *
 * Both candidates teach the SAME derivation on the SAME matrix, so they can be
 * compared as pedagogy rather than as arithmetic. Every number either of them
 * displays is derived here, from `eigenDerivation2x2` — the clips never write
 * an eigenvalue, a shifted matrix, or an eigendirection down.
 *
 * The chain both candidates must make legible, in this order:
 *
 *   A v = λ v  →  (A − λI) v = 0  →  det(A − λI) = 0  →  λ, then each eigenspace
 */

export const A: Matrix2x2 = EIGEN_LESSON_EXAMPLE.matrix as Matrix2x2;

const DERIVATION = eigenDerivation2x2(A);

/** Eigenvalues, largest first — the order both clips present them in. */
export const LAMBDAS: readonly number[] = [...DERIVATION.lambdas].sort(
  (a, b) => b - a,
);

export interface EigenStep {
  lambda: number;
  /** `A − λI`, from the shared helper. */
  shifted: Matrix2x2;
  /**
   * The KERNEL's direction — the inputs `A − λI` sends to the origin, which is
   * the eigenspace. Stabilized so the drawn arrow has one sign.
   */
  direction: MathVector2;
  /**
   * The IMAGE's direction — the line the whole plane collapses onto.
   *
   * A different line from the kernel, and the distinction is the correction
   * this experiment had to make. At λ = 2 the shifted map is
   * `(x, y) ↦ (x + y, 0)`: the kernel is `y = −x` and the image is `y = 0`. A
   * clip that draws both without naming which is which shows two unrelated
   * lines and looks like it is contradicting itself.
   */
  imageDirection: MathVector2;
}

export const STEPS: readonly EigenStep[] = LAMBDAS.map((lambda) => {
  const step = DERIVATION.steps.find(
    (candidate) => Math.abs(candidate.lambda - lambda) < 1e-9,
  );
  if (!step || step.eigenspace.kind !== "line") {
    throw new Error(`eigenExperimentData: λ = ${lambda} has no eigenline.`);
  }
  const unit = normalizeVector(step.eigenspace.basis);
  if (!unit) {
    throw new Error(`eigenExperimentData: λ = ${lambda} has a degenerate basis.`);
  }
  const shifted = matrixShift(A, lambda);
  const image = columnSpaceBasis(shifted as unknown as number[][]).basis;
  if (image.length !== 1) {
    throw new Error(
      `eigenExperimentData: A − ${lambda}I should have a 1-dimensional image.`,
    );
  }
  const imageUnit = normalizeVector([image[0]![0]!, image[0]![1]!]);
  if (!imageUnit) {
    throw new Error(`eigenExperimentData: λ = ${lambda} has a degenerate image.`);
  }
  return {
    lambda,
    shifted,
    direction: stabilizeDirection(unit),
    imageDirection: stabilizeDirection(imageUnit),
  };
});

/** `λ² − (tr A)λ + det A`, the coefficients the algebra candidate writes out. */
export const CHAR_POLY = DERIVATION.charPoly;

/** `det(A − λI)` as a function of λ — the curve the knob candidate traces. */
export function detAtLambda(lambda: number): number {
  return determinant2x2(matrixShift(A, lambda));
}

/** `A − λI` at any λ, for a live matrix readout. */
export function shiftedAt(lambda: number): Matrix2x2 {
  return matrixShift(A, lambda);
}

/**
 * Interpolation from the identity to `m`. Used to deform the whole plane
 * continuously; an educational transition, never a claimed factorization.
 */
export function lerpIdentityTo(m: Matrix2x2, t: number): Matrix2x2 {
  return [
    [1 + (m[0][0] - 1) * t, m[0][1] * t],
    [m[1][0] * t, 1 + (m[1][1] - 1) * t],
  ];
}

/** The λ range the knob sweeps, chosen to bracket both roots with room either side. */
export const LAMBDA_RANGE: readonly [number, number] = [0, 4];

/** Where the det curve is sampled for drawing. */
export function detCurveSamples(count = 96): readonly (readonly [number, number])[] {
  const [low, high] = LAMBDA_RANGE;
  return Array.from({ length: count + 1 }, (_, index) => {
    const lambda = low + ((high - low) * index) / count;
    return [lambda, detAtLambda(lambda)] as const;
  });
}

/**
 * Directions for a fan that visibly separates eigenvectors from everything
 * else: two of them lie on eigenlines, the rest visibly leave their ray.
 */
export const FAN_DIRECTIONS: readonly MathVector2[] = [
  [1, 0],
  [3, 1],
  [1, 1],
  [1, 2],
  [-1, 2],
  [-1, 1],
];

/** Whether `A` sends this direction back onto its own line. */
export function staysOnItsLine(direction: MathVector2): boolean {
  const image = matrixVectorMultiply(A, direction);
  return Math.abs(direction[0] * image[1] - direction[1] * image[0]) < 1e-9;
}

/**
 * Correctness guard both candidate scenes run before a frame renders. Never
 * fires for the shared example; it protects the clips if the example changes.
 */
export function assertEigenDataIsConsistent(): void {
  if (STEPS.length !== 2) {
    throw new Error("eigenExperimentData: expected two distinct eigenvalues.");
  }
  for (const step of STEPS) {
    // det(A − λI) really is zero at each eigenvalue…
    if (Math.abs(detAtLambda(step.lambda)) > 1e-9) {
      throw new Error(
        `eigenExperimentData: det(A − ${step.lambda}I) is not zero.`,
      );
    }
    // …and the shifted map really does kill the direction the clip draws.
    const killed = matrixVectorMultiply(step.shifted, step.direction);
    if (Math.hypot(killed[0], killed[1]) > 1e-9) {
      throw new Error(
        `eigenExperimentData: (A − ${step.lambda}I) does not kill its direction.`,
      );
    }
    // …and A scales that direction by exactly λ.
    const image = matrixVectorMultiply(A, step.direction);
    const expected: MathVector2 = [
      step.lambda * step.direction[0],
      step.lambda * step.direction[1],
    ];
    if (Math.hypot(image[0] - expected[0], image[1] - expected[1]) > 1e-9) {
      throw new Error(`eigenExperimentData: A does not scale by ${step.lambda}.`);
    }
  }
  for (const step of STEPS) {
    // The image really is what the plane lands on: every basis vector's image
    // must lie along it.
    for (const probe of [[1, 0], [0, 1]] as const) {
      const image = matrixVectorMultiply(step.shifted, probe);
      if (Math.hypot(image[0], image[1]) > 1e-9) {
        const cross =
          image[0] * step.imageDirection[1] - image[1] * step.imageDirection[0];
        if (Math.abs(cross) > 1e-9) {
          throw new Error(
            `eigenExperimentData: an image of A − ${step.lambda}I leaves its image line.`,
          );
        }
      }
    }
    // …and it is NOT the kernel. If it were, a clip could draw one line and be
    // right by accident; because it is not, the two must be named apart.
    const kernelVsImage =
      step.direction[0] * step.imageDirection[1] -
      step.direction[1] * step.imageDirection[0];
    if (Math.abs(kernelVsImage) < 1e-9) {
      throw new Error(
        `eigenExperimentData: kernel and image coincide at λ = ${step.lambda}.`,
      );
    }
  }
  // The two eigendirections must be genuinely different lines, and one of them
  // must be off-axis, or the clips would teach that eigenvectors are axes.
  const [first, second] = STEPS;
  const cross =
    first!.direction[0] * second!.direction[1] -
    first!.direction[1] * second!.direction[0];
  if (Math.abs(cross) < 1e-9) {
    throw new Error("eigenExperimentData: the eigenlines coincide.");
  }
  if (STEPS.every((step) => step.direction[0] === 0 || step.direction[1] === 0)) {
    throw new Error("eigenExperimentData: every eigendirection is an axis.");
  }
  // The fan must contain directions that visibly LEAVE their ray.
  if (!FAN_DIRECTIONS.some((direction) => !staysOnItsLine(direction))) {
    throw new Error("eigenExperimentData: no fan direction leaves its line.");
  }
}
