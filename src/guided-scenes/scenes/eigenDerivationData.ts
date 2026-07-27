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
 * Motion-Canvas-free data for the two eigen derivation clips.
 *
 * Scene modules import `@motion-canvas/2d` and cannot be resolved in jsdom, so
 * everything either clip DISPLAYS lives here, where it can be held to the
 * mathematics. Nothing writes an eigenvalue, a shifted matrix or an
 * eigendirection down: they all come from `eigenDerivation2x2`.
 *
 * Two clips read this:
 *
 *  - `eigenvectors-derivation` — the worked calculation, step by step.
 *  - `eigenvectors-characteristic-equation` — the short bridge that shows WHY
 *    the eigenvalues are the roots of `det(A − λI)`.
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
   * the eigenspace.
   */
  direction: MathVector2;
  /**
   * The IMAGE's direction — the line the whole plane collapses onto, which is
   * a DIFFERENT line from the kernel.
   *
   * At λ = 2 the shifted map is `(x, y) ↦ (x + y, 0)`: the kernel is `y = −x`
   * and the image is `y = 0`. At λ = 3 the two swap over. A clip that draws
   * both without naming which is which reads as contradicting itself, so the
   * distinction is data rather than a caption.
   */
  imageDirection: MathVector2;
}

export const STEPS: readonly EigenStep[] = LAMBDAS.map((lambda) => {
  const step = DERIVATION.steps.find(
    (candidate) => Math.abs(candidate.lambda - lambda) < 1e-9,
  );
  if (!step || step.eigenspace.kind !== "line") {
    throw new Error(`eigenDerivationData: λ = ${lambda} has no eigenline.`);
  }
  const unit = normalizeVector(step.eigenspace.basis);
  if (!unit) {
    throw new Error(`eigenDerivationData: λ = ${lambda} has a degenerate basis.`);
  }
  const shifted = matrixShift(A, lambda);
  const image = columnSpaceBasis(shifted as unknown as number[][]).basis;
  if (image.length !== 1) {
    throw new Error(
      `eigenDerivationData: A − ${lambda}I should have a 1-dimensional image.`,
    );
  }
  const imageUnit = normalizeVector([image[0]![0]!, image[0]![1]!]);
  if (!imageUnit) {
    throw new Error(`eigenDerivationData: λ = ${lambda} has a degenerate image.`);
  }
  return {
    lambda,
    shifted,
    direction: stabilizeDirection(unit),
    imageDirection: stabilizeDirection(imageUnit),
  };
});

/** `λ² − (tr A)λ + det A` — the polynomial both clips end on. */
export const CHAR_POLY = DERIVATION.charPoly;

/** `det(A − λI)` as a function of λ — the curve the bridge clip traces. */
export function detAtLambda(lambda: number): number {
  return determinant2x2(matrixShift(A, lambda));
}

/** `A − λI` at any λ, for a live matrix readout. */
export function shiftedAt(lambda: number): Matrix2x2 {
  return matrixShift(A, lambda);
}

/**
 * Interpolation from the identity to `m`, for deforming the whole plane
 * continuously. An educational transition, never a claimed factorization.
 */
export function lerpIdentityTo(m: Matrix2x2, t: number): Matrix2x2 {
  return [
    [1 + (m[0][0] - 1) * t, m[0][1] * t],
    [m[1][0] * t, 1 + (m[1][1] - 1) * t],
  ];
}

/** The λ range the bridge sweeps, bracketing both roots with room either side. */
export const LAMBDA_RANGE: readonly [number, number] = [0, 4];

/** Where the det curve is sampled for drawing. */
export function detCurveSamples(
  count = 96,
): readonly (readonly [number, number])[] {
  const [low, high] = LAMBDA_RANGE;
  return Array.from({ length: count + 1 }, (_, index) => {
    const lambda = low + ((high - low) * index) / count;
    return [lambda, detAtLambda(lambda)] as const;
  });
}

/**
 * Directions for a fan that visibly separates eigenvectors from everything
 * else: two lie on eigenlines, the rest visibly leave their ray.
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

/** The simplest integer pair on the same ray: `(0.707, −0.707)` → `(1, −1)`. */
export function integerDirection(
  direction: MathVector2,
): readonly [number, number] {
  const magnitudes = [Math.abs(direction[0]), Math.abs(direction[1])].filter(
    (value) => value > 1e-9,
  );
  const smallest = Math.min(...magnitudes);
  const scaled: [number, number] = [
    direction[0] / smallest,
    direction[1] / smallest,
  ];
  // `Math.round(-0)` is `-0`, and a stabilized axis direction really does carry
  // one: `(1, 0)` arrives as `(1, -0)`. Every caller formats through
  // `texNumber`, which guards it — but a helper whose whole job is "the
  // simplest integer pair" should not hand back a negative zero.
  const rounded: [number, number] = [
    Math.round(scaled[0]) + 0,
    Math.round(scaled[1]) + 0,
  ];
  const integral =
    Math.abs(scaled[0] - rounded[0]) < 1e-6 &&
    Math.abs(scaled[1] - rounded[1]) < 1e-6;
  return integral ? rounded : [direction[0], direction[1]];
}

/** A number as a frame shows it: never `-0`. */
export function texNumber(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

/**
 * Correctness guard both clips run before a frame renders. Never fires for the
 * shared example; it protects them if the example changes.
 */
export function assertEigenDerivationDataIsConsistent(): void {
  if (STEPS.length !== 2) {
    throw new Error("eigenDerivationData: expected two distinct eigenvalues.");
  }
  for (const step of STEPS) {
    if (Math.abs(detAtLambda(step.lambda)) > 1e-9) {
      throw new Error(
        `eigenDerivationData: det(A − ${step.lambda}I) is not zero.`,
      );
    }
    const killed = matrixVectorMultiply(step.shifted, step.direction);
    if (Math.hypot(killed[0], killed[1]) > 1e-9) {
      throw new Error(
        `eigenDerivationData: (A − ${step.lambda}I) does not kill its direction.`,
      );
    }
    const image = matrixVectorMultiply(A, step.direction);
    if (
      Math.hypot(
        image[0] - step.lambda * step.direction[0],
        image[1] - step.lambda * step.direction[1],
      ) > 1e-9
    ) {
      throw new Error(
        `eigenDerivationData: A does not scale by ${step.lambda}.`,
      );
    }
    // The image really is what the plane lands on…
    for (const probe of [[1, 0], [0, 1]] as const) {
      const landed = matrixVectorMultiply(step.shifted, probe);
      if (Math.hypot(landed[0], landed[1]) > 1e-9) {
        const cross =
          landed[0] * step.imageDirection[1] -
          landed[1] * step.imageDirection[0];
        if (Math.abs(cross) > 1e-9) {
          throw new Error(
            `eigenDerivationData: an image of A − ${step.lambda}I leaves its image line.`,
          );
        }
      }
    }
    // …and it is NOT the kernel, which is why they must be named apart.
    const kernelVsImage =
      step.direction[0] * step.imageDirection[1] -
      step.direction[1] * step.imageDirection[0];
    if (Math.abs(kernelVsImage) < 1e-9) {
      throw new Error(
        `eigenDerivationData: kernel and image coincide at λ = ${step.lambda}.`,
      );
    }
  }
  const [first, second] = STEPS;
  const cross =
    first!.direction[0] * second!.direction[1] -
    first!.direction[1] * second!.direction[0];
  if (Math.abs(cross) < 1e-9) {
    throw new Error("eigenDerivationData: the eigenlines coincide.");
  }
  if (STEPS.every((step) => step.direction[0] === 0 || step.direction[1] === 0)) {
    throw new Error("eigenDerivationData: every eigendirection is an axis.");
  }
  if (!FAN_DIRECTIONS.some((direction) => !staysOnItsLine(direction))) {
    throw new Error("eigenDerivationData: no fan direction leaves its line.");
  }
}
