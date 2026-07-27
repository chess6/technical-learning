import { describe, expect, it } from "vitest";
import {
  A,
  CHAR_POLY,
  FAN_DIRECTIONS,
  LAMBDA_RANGE,
  LAMBDAS,
  STEPS,
  assertEigenDataIsConsistent,
  detAtLambda,
  detCurveSamples,
  lerpIdentityTo,
  shiftedAt,
  staysOnItsLine,
} from "../eigenExperimentData";
import { EIGEN_CANDIDATES, getEigenCandidate } from "../eigenCandidates";
import {
  DESIGN_EXPERIMENTS,
  getDesignExperiment,
} from "../designExperiments";
import { matrixVectorMultiply, type Vector2 as MathVector2 } from "../../../math";

/**
 * The eigenvector-derivation design experiment.
 *
 * Scope: the mathematics both candidate clips display, and the registry that
 * drives candidate selection and the chapter buttons. The clips themselves
 * import `@motion-canvas/2d` and are only ever exercised in a browser.
 */

describe("eigen experiment data", () => {
  it("is self-consistent (the guard both candidate scenes run first)", () => {
    expect(() => assertEigenDataIsConsistent()).not.toThrow();
  });

  it("uses the lesson's matrix and its two distinct eigenvalues", () => {
    expect(A).toEqual([
      [3, 1],
      [0, 2],
    ]);
    expect([...LAMBDAS]).toEqual([3, 2]);
  });

  it("ties each λ to the shifted matrix and the direction it kills", () => {
    for (const step of STEPS) {
      expect(shiftedAt(step.lambda)).toEqual(step.shifted);
      const killed = matrixVectorMultiply(step.shifted, step.direction);
      expect(Math.hypot(killed[0], killed[1]), `λ=${step.lambda}`).toBeLessThan(1e-9);
    }
  });

  it("scales each eigendirection by exactly its own λ under A", () => {
    for (const step of STEPS) {
      const image = matrixVectorMultiply(A, step.direction);
      expect(image[0]).toBeCloseTo(step.lambda * step.direction[0], 12);
      expect(image[1]).toBeCloseTo(step.lambda * step.direction[1], 12);
    }
  });

  it("keeps the two eigendirections on genuinely different lines", () => {
    const [first, second] = STEPS;
    const cross =
      first!.direction[0] * second!.direction[1] -
      first!.direction[1] * second!.direction[0];
    expect(Math.abs(cross)).toBeGreaterThan(0.1);
  });

  it("keeps one eigendirection off the axes, so they are not read as axes", () => {
    const offAxis = STEPS.filter(
      (step) => Math.abs(step.direction[0]) > 1e-9 && Math.abs(step.direction[1]) > 1e-9,
    );
    expect(offAxis.length).toBeGreaterThan(0);
  });
});

describe("the determinant curve the knob candidate traces", () => {
  it("is zero exactly at the eigenvalues", () => {
    for (const step of STEPS) {
      expect(detAtLambda(step.lambda), `λ=${step.lambda}`).toBeCloseTo(0, 12);
    }
    // …and nowhere else in the swept range.
    for (const lambda of [0, 0.5, 1, 1.5, 2.5, 3.5, 4]) {
      expect(Math.abs(detAtLambda(lambda)), `λ=${lambda}`).toBeGreaterThan(0.1);
    }
  });

  it("agrees with the characteristic polynomial the clip writes at the end", () => {
    // det(A − λI) = λ² − (tr A)λ + det A, so the closing line is not a separate
    // claim — it is the same function the curve was drawn from.
    for (const lambda of [-1, 0, 1.25, 2, 3, 4.5]) {
      const fromPolynomial =
        lambda * lambda - CHAR_POLY.trace * lambda + CHAR_POLY.determinant;
      expect(detAtLambda(lambda), `λ=${lambda}`).toBeCloseTo(fromPolynomial, 12);
    }
  });

  it("brackets both roots inside the swept range", () => {
    for (const step of STEPS) {
      expect(step.lambda).toBeGreaterThan(LAMBDA_RANGE[0]);
      expect(step.lambda).toBeLessThan(LAMBDA_RANGE[1]);
    }
  });

  it("samples the curve densely enough to draw both crossings", () => {
    const samples = detCurveSamples();
    expect(samples.length).toBeGreaterThan(50);
    expect(samples[0]![0]).toBe(LAMBDA_RANGE[0]);
    expect(samples.at(-1)![0]).toBeCloseTo(LAMBDA_RANGE[1], 9);
    // A sign change on each side of each root, or the curve would not be seen
    // to cross.
    for (const step of STEPS) {
      expect(detAtLambda(step.lambda - 0.3) * detAtLambda(step.lambda + 0.3)).toBeLessThan(0);
    }
  });
});

describe("the deforming plane", () => {
  it("starts at the identity, so swapping which matrix drives it is invisible", () => {
    expect(lerpIdentityTo(A, 0)).toEqual([
      [1, 0],
      [0, 1],
    ]);
    expect(lerpIdentityTo(STEPS[0]!.shifted, 0)).toEqual([
      [1, 0],
      [0, 1],
    ]);
  });

  it("reaches the target matrix exactly", () => {
    expect(lerpIdentityTo(A, 1)).toEqual(A);
  });

  it("has a fan where most directions leave their ray and exactly two do not", () => {
    const staying = FAN_DIRECTIONS.filter(staysOnItsLine);
    expect(staying.length).toBe(2);
    expect(FAN_DIRECTIONS.length - staying.length).toBeGreaterThanOrEqual(3);
    // The two that stay are the eigendirections, not an accident of the fan.
    for (const direction of staying) {
      const matched = STEPS.some((step) => {
        const cross =
          direction[0] * step.direction[1] - direction[1] * step.direction[0];
        return Math.abs(cross) < 1e-9;
      });
      expect(matched, JSON.stringify(direction)).toBe(true);
    }
  });

  it("sends each root's eigendirection to the origin under its own shift only", () => {
    // The correction this experiment had to make: A − 2I kills exactly ONE of
    // the two lines, so a clip may not draw both while one root is the subject.
    const [three, two] = STEPS;
    const survives = (m: typeof A, direction: MathVector2) =>
      Math.hypot(...matrixVectorMultiply(m, direction)) > 1e-6;
    expect(survives(two!.shifted, three!.direction)).toBe(true);
    expect(survives(three!.shifted, two!.direction)).toBe(true);
  });
});

describe("eigen candidate registry", () => {
  it("offers two candidates and declares no winner", () => {
    expect(EIGEN_CANDIDATES.map((c) => c.id)).toEqual(["knob", "chain"]);
    for (const candidate of EIGEN_CANDIDATES) {
      expect(candidate.obstacle.length).toBeGreaterThan(60);
      expect(candidate.distinctBecause.length).toBeGreaterThan(60);
      expect(JSON.stringify(candidate)).not.toMatch(/recommended|winner|best/i);
    }
  });

  it("throws for an unknown candidate rather than falling back silently", () => {
    expect(() => getEigenCandidate("nope")).toThrow(/Unknown eigen candidate/);
  });

  it("gives every candidate ordered beats inside its duration", () => {
    for (const candidate of EIGEN_CANDIDATES) {
      expect(candidate.beats.length, candidate.id).toBeGreaterThanOrEqual(6);
      expect(candidate.beats[0]!.at, candidate.id).toBe(0);
      for (let i = 1; i < candidate.beats.length; i += 1) {
        expect(
          candidate.beats[i]!.at,
          `${candidate.id}.${candidate.beats[i]!.id}`,
        ).toBeGreaterThan(candidate.beats[i - 1]!.at);
      }
      expect(candidate.beats.at(-1)!.at).toBeLessThan(candidate.durationSeconds);
      const ids = candidate.beats.map((b) => b.id);
      expect(new Set(ids).size, candidate.id).toBe(ids.length);
    }
  });
});

describe("design experiment registry", () => {
  it("carries both experiments, each with its own resolver and loader", () => {
    expect(DESIGN_EXPERIMENTS.map((e) => e.id)).toEqual(["elimination", "eigen"]);
    for (const experiment of DESIGN_EXPERIMENTS) {
      expect(experiment.candidates.length).toBeGreaterThanOrEqual(2);
      expect(experiment.question.length).toBeGreaterThan(40);
      for (const candidate of experiment.candidates) {
        expect(experiment.resolve(candidate.id).id).toBe(candidate.id);
      }
    }
  });

  it("throws for an unknown experiment", () => {
    expect(() => getDesignExperiment("nope")).toThrow(/Unknown design experiment/);
  });

  it("keeps candidate ids unique within each experiment", () => {
    for (const experiment of DESIGN_EXPERIMENTS) {
      const ids = experiment.candidates.map((c) => c.id);
      expect(new Set(ids).size, experiment.id).toBe(ids.length);
    }
  });
});
