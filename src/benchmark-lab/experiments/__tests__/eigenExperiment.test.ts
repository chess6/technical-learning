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
import {
  CANCELLATION_TERMS,
  CHAIN_SCRIPT,
  KNOB_BEATS,
  collapseWitnessIndex,
  determinantLineIndex,
  knobBeat,
} from "../eigenSceneScript";
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

/**
 * Scene-state regressions.
 *
 * Both clips drive their visibility from `eigenSceneScript`, so these are not
 * checks on a description of the scenes — they are checks on the tables the
 * scenes read. Each one protects a correction that had to be made after
 * watching the clips back.
 */
describe("knob scene state: kernel versus image", () => {
  it("declares a state for every beat of the knob candidate, and nothing else", () => {
    const beatIds = getEigenCandidate("knob").beats.map((beat) => beat.id);
    expect(KNOB_BEATS.map((state) => state.id)).toEqual(beatIds);
    for (const id of beatIds) expect(knobBeat(id).id).toBe(id);
    expect(() => knobBeat("nope")).toThrow(/unknown knob beat/);
  });

  it("never draws two kernels at once", () => {
    // A − λI kills exactly ONE of the two eigenlines. Two kernels on screen
    // would say the shifted map kills both, which is false.
    for (const state of KNOB_BEATS) {
      expect(state.kernelOf === null || Number.isInteger(state.kernelOf)).toBe(true);
      if (state.kernelOf !== null) {
        expect(state.kernelOf, state.id).toBeGreaterThanOrEqual(0);
        expect(state.kernelOf, state.id).toBeLessThan(STEPS.length);
      }
    }
  });

  it("only shows a kernel while the plane is shifted, never under A", () => {
    for (const state of KNOB_BEATS) {
      if (state.kernelOf !== null) {
        expect(state.underA, `${state.id} draws a kernel under A itself`).toBe(false);
      }
    }
  });

  it("only names an image line where the map is actually singular", () => {
    // At λ = 2.6 the determinant is −0.24 and the plane is still
    // two-dimensional; an "image" line there would claim a collapse that has
    // not happened. So an image may only be named in a beat that also fixes λ
    // at that step's eigenvalue.
    for (const state of KNOB_BEATS) {
      if (state.imageOf === null) continue;
      const step = STEPS[state.imageOf]!;
      expect(detAtLambda(step.lambda), state.id).toBeCloseTo(0, 12);
      expect(state.underA, `${state.id} names an image under A`).toBe(false);
    }
  });

  it("pairs each kernel beat with the image of the SAME shifted matrix", () => {
    for (const state of KNOB_BEATS) {
      if (state.kernelOf === null) continue;
      expect(state.imageOf, `${state.id}`).toBe(state.kernelOf);
    }
  });

  it("keeps kernel and image on different lines at every λ it draws", () => {
    // The correction: at λ = 2 the map is (x, y) ↦ (x + y, 0), so the kernel is
    // y = −x and the image is y = 0. Naming them apart is only necessary
    // because they genuinely differ — this asserts they do.
    for (const step of STEPS) {
      const cross =
        step.direction[0] * step.imageDirection[1] -
        step.direction[1] * step.imageDirection[0];
      expect(Math.abs(cross), `λ=${step.lambda}`).toBeGreaterThan(0.5);
    }
  });

  it("gives λ = 2 the kernel y = −x and the image y = 0", () => {
    // The concrete case the correction named, checked as drawn rather than as
    // described: a clip that flipped these would put the image on x = 0.
    const two = STEPS.find((step) => step.lambda === 2)!;
    expect(two.shifted).toEqual([
      [1, 1],
      [0, 0],
    ]);
    // kernel ∥ (1, −1)
    expect(two.direction[0] + two.direction[1]).toBeCloseTo(0, 12);
    // image ∥ (1, 0) — horizontal, NOT vertical.
    expect(Math.abs(two.imageDirection[1]), "image is not horizontal").toBeCloseTo(0, 12);
    expect(Math.abs(two.imageDirection[0])).toBeGreaterThan(0.5);
  });

  it("gives λ = 3 the swapped pair, which is why both must be named", () => {
    const three = STEPS.find((step) => step.lambda === 3)!;
    // kernel ∥ (1, 0), image ∥ (1, −1) — the exact opposite of λ = 2.
    expect(Math.abs(three.direction[1])).toBeCloseTo(0, 12);
    expect(three.imageDirection[0] + three.imageDirection[1]).toBeCloseTo(0, 12);
  });

  it("only lets both eigendirections share a frame under A", () => {
    const both = KNOB_BEATS.filter((state) => state.underA && state.kernelOf === null);
    expect(both.length).toBeGreaterThan(0);
    for (const state of both) {
      expect(state.imageOf, `${state.id}`).toBeNull();
    }
  });
});

describe("chain scene state: the written argument", () => {
  it("states the determinant condition before anything demonstrates it", () => {
    // The correction: the unit square used to flatten in the beat BEFORE the
    // line claiming det(A − λI) = 0, showing the consequence ahead of the claim.
    expect(collapseWitnessIndex()).toBeGreaterThanOrEqual(determinantLineIndex());
  });

  it("keeps the collapse witness on the line that states the condition", () => {
    expect(CHAIN_SCRIPT[determinantLineIndex()]!.witness).toBe("collapse");
    // …and nowhere else.
    expect(CHAIN_SCRIPT.filter((line) => line.witness === "collapse")).toHaveLength(1);
  });

  it("does not let the singular line pre-empt the demonstration", () => {
    const singular = CHAIN_SCRIPT.find((line) => line.beat === "singular")!;
    expect(singular.witness).not.toBe("collapse");
  });

  it("compares Av with λv, not v with λv", () => {
    // v − λv is (1 − λ)v and is not zero. The witness has to subtract the two
    // quantities the LINE names.
    expect(CANCELLATION_TERMS.minuend).toBe("Av");
    expect(CANCELLATION_TERMS.subtrahend).toBe("lambda-v");
    expect(CANCELLATION_TERMS.difference).toBe("zero");
    const gather = CHAIN_SCRIPT.find((line) => line.beat === "gather")!;
    expect(gather.tex).toContain("A\\mathbf{v}");
    expect(gather.tex).toContain("\\lambda\\mathbf{v}");
    expect(gather.witness).toBe("cancel");
  });

  it("really does make that difference zero for the running eigenpair", () => {
    // The witness draws Av − λv reaching the origin; that is only honest if it
    // does, and only interesting because v − λv would NOT.
    for (const step of STEPS) {
      const v = step.direction;
      const av = matrixVectorMultiply(A, v);
      const lv: MathVector2 = [step.lambda * v[0], step.lambda * v[1]];
      expect(Math.hypot(av[0] - lv[0], av[1] - lv[1]), `λ=${step.lambda}`).toBeLessThan(1e-12);
      expect(Math.hypot(v[0] - lv[0], v[1] - lv[1]), `λ=${step.lambda}`).toBeGreaterThan(0.5);
    }
  });

  it("produces the factored line by transforming the one above it", () => {
    // Not by fading in an unrelated complete equation: the shared fragments are
    // what make it a symbol move rather than a substitution.
    const [defining, gather, factor] = CHAIN_SCRIPT;
    expect(gather!.morphsFromPrevious).toBe(true);
    expect(factor!.morphsFromPrevious).toBe(true);

    // Fragments are matched by Motion Canvas on their literal text, so a shared
    // fragment is a substring both states carry. (`\mathbf{v}}}` defeats a
    // non-greedy `{{…}}` regex, so compare the raw strings.)
    const carries = (tex: string, fragment: string) => tex.includes(fragment);

    // Av and λv both survive the move across the equals sign: the two TERMS
    // stay put while `=` becomes `−` and `= 0` arrives.
    for (const fragment of ["{{A\\mathbf{v}}}", "{{\\lambda\\mathbf{v}}}"]) {
      expect(carries(defining!.tex, fragment), fragment).toBe(true);
      expect(carries(gather!.tex, fragment), fragment).toBe(true);
    }
    // …and the minus and the `= 0` survive the factorization, so the new line
    // is that line rearranged rather than a fresh equation.
    for (const fragment of ["{{ - }}", "{{ = \\mathbf{0}}}"]) {
      expect(carries(gather!.tex, fragment), fragment).toBe(true);
      expect(carries(factor!.tex, fragment), fragment).toBe(true);
    }
    // The factored line is genuinely fragmented, not one opaque blob.
    expect(factor!.tex.split("{{").length - 1).toBeGreaterThanOrEqual(3);
  });

  it("shows one eigendirection per root while that root is being solved", () => {
    const witnesses = CHAIN_SCRIPT.filter((line) => line.beat === "eigenspaces").map(
      (line) => line.witness,
    );
    expect(witnesses).toEqual(["eigenspace-0", "eigenspace-1"]);
    // "both" is never a witness while a single shifted matrix is the subject.
    const singleRootBeats = CHAIN_SCRIPT.filter((line) =>
      line.witness.startsWith("eigenspace-"),
    );
    expect(singleRootBeats.every((line) => line.witness !== "both")).toBe(true);
  });

  it("writes every line the chain promises to keep on screen", () => {
    const beatIds = getEigenCandidate("chain").beats.map((beat) => beat.id);
    for (const line of CHAIN_SCRIPT) {
      expect(beatIds, `line for missing beat ${line.beat}`).toContain(line.beat);
    }
    // Eleven lines, none cleared — the finished frame is the whole derivation.
    expect(CHAIN_SCRIPT.length).toBe(11);
  });
});
