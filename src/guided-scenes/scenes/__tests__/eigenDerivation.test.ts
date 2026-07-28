import { describe, expect, it } from "vitest";
import {
  A,
  CHAR_POLY,
  LAMBDAS,
  LAMBDA_RANGE,
  STEPS,
  assertEigenDerivationDataIsConsistent,
  detAtLambda,
  detCurveSamples,
  integerDirection,
  lerpIdentityTo,
  shiftedAt,
  texNumber,
} from "../eigenDerivationData";
import {
  BRIDGE_BEATS,
  CANCELLATION_TERMS,
  CHAIN_SCRIPT,
  bridgeBeat,
  chainLinesFor,
  collapseWitnessIndex,
  determinantLineIndex,
  resolveCancellationTerm,
} from "../eigenDerivationScript";
import { EIGEN_CHARACTERISTIC_SEGMENTS, EIGEN_DERIVATION_SEGMENTS, SCENE_BEATS } from "../sceneTimings";
import { determinant2x2, matrixVectorMultiply } from "../../../math";

/**
 * The two eigen clips' data and script, held to the mathematics.
 *
 * Scene modules import `@motion-canvas/2d` and cannot be resolved in jsdom, so
 * everything either clip DISPLAYS lives in these two Motion-Canvas-free modules
 * and is checked here. The point of the arrangement is that the tables are
 * **consumed** rather than merely documented — the scenes write
 * `CHAIN_SCRIPT[i].tex`, dispatch on `CHAIN_SCRIPT[i].witness`, draw whatever
 * `resolveCancellationTerm` returns, and set kernel/image visibility from
 * `bridgeBeat`. So a property asserted below is a property of the frames, and a
 * scene that drifted from it would have to edit a table and fail a test here.
 */

const cross = (
  u: readonly [number, number],
  v: readonly [number, number],
): number => u[0] * v[1] - u[1] * v[0];

describe("eigen derivation data", () => {
  it("passes its own render-time consistency guard", () => {
    expect(() => assertEigenDerivationDataIsConsistent()).not.toThrow();
  });

  it("orders the eigenvalues largest first, as both clips present them", () => {
    expect(LAMBDAS).toEqual([...LAMBDAS].sort((a, b) => b - a));
    expect(STEPS.map((step) => step.lambda)).toEqual([...LAMBDAS]);
  });

  it("puts det(A − λI) at zero exactly at the eigenvalues", () => {
    for (const step of STEPS) {
      expect(Math.abs(detAtLambda(step.lambda))).toBeLessThan(1e-9);
    }
    // …and nowhere else in the swept range, which is what makes the bridge's
    // "keep turning, it comes back up" beat true rather than decorative.
    for (const [lambda, det] of detCurveSamples(200)) {
      const isRoot = STEPS.some((step) => Math.abs(step.lambda - lambda) < 1e-6);
      if (!isRoot) expect(Math.abs(det), `λ = ${lambda}`).toBeGreaterThan(1e-9);
    }
  });

  it("crosses the axis at each root rather than touching it", () => {
    // Both roots of (3 − λ)(2 − λ) are SIMPLE, so the determinant changes sign
    // at each of them and is negative in between. "Touches zero" is the
    // language for a repeated root; using it here would claim a tangency the
    // traced curve does not have, and would make the bridge's "keep turning,
    // it comes back up" beat describe the wrong picture.
    const [high, low] = [STEPS[0]!.lambda, STEPS[1]!.lambda];
    expect(high).toBeGreaterThan(low);
    for (let t = 0.05; t < 1; t += 0.05) {
      const lambda = low + (high - low) * t;
      expect(detAtLambda(lambda), `λ = ${lambda}`).toBeLessThan(0);
    }
    // …and positive on the far side of each root, which is what a crossing is.
    expect(detAtLambda(low - 0.1)).toBeGreaterThan(0);
    expect(detAtLambda(high + 0.1)).toBeGreaterThan(0);
  });

  it("keeps the kernel and the image apart at every root", () => {
    // The correction this clip family exists downstream of: at λ = 2 the
    // shifted map is (x, y) ↦ (x + y, 0), so the kernel is y = −x and the
    // image is y = 0. They are different lines and must never be conflated.
    for (const step of STEPS) {
      expect(
        Math.abs(cross(step.direction, step.imageDirection)),
        `λ = ${step.lambda}`,
      ).toBeGreaterThan(1e-9);
      // The kernel really dies…
      const killed = matrixVectorMultiply(step.shifted, step.direction);
      expect(Math.hypot(killed[0], killed[1])).toBeLessThan(1e-9);
      // …and everything that survives lands on the image line.
      for (const probe of [[1, 0], [0, 1]] as const) {
        const landed = matrixVectorMultiply(step.shifted, probe);
        if (Math.hypot(landed[0], landed[1]) < 1e-9) continue;
        expect(Math.abs(cross(landed, step.imageDirection))).toBeLessThan(1e-9);
      }
    }
  });

  it("swaps kernel and image between the two roots", () => {
    // The bridge says so out loud, so it had better be true: the line that is
    // the kernel at one root is the image at the other.
    const [three, two] = STEPS;
    expect(Math.abs(cross(three!.direction, two!.imageDirection))).toBeLessThan(1e-9);
    expect(Math.abs(cross(two!.direction, three!.imageDirection))).toBeLessThan(1e-9);
  });

  it("shifts only the diagonal, and by exactly λ", () => {
    for (const lambda of [0, 1.5, 2, 3]) {
      const m = shiftedAt(lambda);
      expect(m[0][0]).toBeCloseTo(A[0][0] - lambda, 12);
      expect(m[1][1]).toBeCloseTo(A[1][1] - lambda, 12);
      expect(m[0][1]).toBe(A[0][1]);
      expect(m[1][0]).toBe(A[1][0]);
    }
  });

  it("interpolates from the identity, so the plane starts where it is", () => {
    expect(lerpIdentityTo(A, 0)).toEqual([
      [1, 0],
      [0, 1],
    ]);
    expect(lerpIdentityTo(A, 1)).toEqual(A);
  });

  it("brackets both roots with room either side of the swept range", () => {
    for (const step of STEPS) {
      expect(step.lambda).toBeGreaterThan(LAMBDA_RANGE[0]);
      expect(step.lambda).toBeLessThan(LAMBDA_RANGE[1]);
    }
  });

  it("derives the characteristic polynomial rather than restating it", () => {
    expect(CHAR_POLY.trace).toBeCloseTo(A[0][0] + A[1][1], 12);
    expect(CHAR_POLY.determinant).toBeCloseTo(determinant2x2(A), 12);
  });

  it("reduces an eigendirection to the simplest integer pair, without a −0", () => {
    for (const step of STEPS) {
      const pair = integerDirection(step.direction);
      expect(Math.abs(cross(pair, step.direction))).toBeLessThan(1e-9);
      for (const value of pair) expect(Object.is(value, -0)).toBe(false);
    }
    expect(texNumber(-0)).toBe("0");
  });
});

describe("the derivation chain script", () => {
  it("writes concrete LaTeX for every line — no unresolved placeholders", () => {
    for (const line of CHAIN_SCRIPT) {
      expect(line.tex.length).toBeGreaterThan(0);
      expect(line.tex, line.beat).not.toMatch(/^@/);
      expect(line.tex, line.beat).not.toMatch(/undefined|NaN/);
    }
  });

  it("produces each morphed line from fragments the previous line already has", () => {
    /**
     * Fragments, without a regex: `\mathbf{v}}}` makes a lazy `\{\{(.*?)\}\}`
     * stop in the wrong place, so split on the boundary between fragments
     * instead. A tex of `{{a}}{{b}}` is stripped of its outer braces and cut on
     * `}}{{`.
     */
    const fragments = (tex: string): string[] => {
      if (!tex.startsWith("{{") || !tex.endsWith("}}")) return [];
      return tex.slice(2, -2).split("}}{{");
    };

    // A morph is only a persistent-symbol transformation if the symbols
    // literally persist: Motion Canvas matches `{{ }}` fragments by their text.
    // Without a shared one the step would cross-fade one complete equation into
    // another, which teaches substitution rather than algebra.
    for (const [index, line] of CHAIN_SCRIPT.entries()) {
      if (!line.morphsFromPrevious) continue;
      const before = fragments(CHAIN_SCRIPT[index - 1]!.tex);
      const after = fragments(line.tex);
      expect(before.length, `line ${index - 1}`).toBeGreaterThan(1);
      expect(after.length, `line ${index}`).toBeGreaterThan(1);
      const shared = after.filter((fragment) => before.includes(fragment));
      expect(shared.length, `line ${index}`).toBeGreaterThan(0);
    }
  });

  it("never demonstrates the collapse before the line that states it", () => {
    // The whole point of attaching the witness to a line rather than to a beat.
    expect(collapseWitnessIndex()).toBe(determinantLineIndex());
  });

  it("writes every line inside a declared segment, in script order", () => {
    const segmentIds = EIGEN_DERIVATION_SEGMENTS.map((segment) => segment.id);
    for (const line of CHAIN_SCRIPT) {
      expect(segmentIds, line.beat).toContain(line.beat);
    }
    // Lines belonging to one beat are contiguous, so `chainLinesFor` returns
    // them in the order the page is written down.
    const beatsInOrder = CHAIN_SCRIPT.map((line) => line.beat);
    expect(beatsInOrder).toEqual(
      [...new Set(beatsInOrder)].flatMap((beat) =>
        chainLinesFor(beat).map(() => beat),
      ),
    );
  });

  it("budgets a write/witness window for every line a beat writes", () => {
    // The scene resolves `write`, `witness`, `write2`, `witness2`… by ordinal
    // and throws when one is missing. Checking it here means adding a line to
    // the script without budgeting for it fails in CI rather than silently
    // spending the next beat's declared hold.
    const beats = SCENE_BEATS["eigenvectors-derivation"]!;
    for (const beat of new Set(CHAIN_SCRIPT.map((line) => line.beat))) {
      const lines = chainLinesFor(beat);
      for (const [ordinal] of lines.entries()) {
        const suffix = ordinal === 0 ? "" : String(ordinal + 1);
        for (const name of [`write${suffix}`, `witness${suffix}`]) {
          expect(beats[beat]?.[name], `${beat}.${name}`).toBeGreaterThan(0);
        }
      }
      expect(beats[beat]?.hold, `${beat}.hold`).toBeGreaterThan(0);
    }
  });
});

describe("the cancellation witness", () => {
  const step = STEPS[1]!;
  const v = [step.direction[0], step.direction[1]] as const;
  const context = {
    v,
    av: matrixVectorMultiply(A, [v[0], v[1]]) as readonly [number, number],
    lambda: step.lambda,
  };

  it("compares Av with λv — not v with λv", () => {
    const minuend = resolveCancellationTerm(CANCELLATION_TERMS.minuend, context);
    const subtrahend = resolveCancellationTerm(
      CANCELLATION_TERMS.subtrahend,
      context,
    );
    expect(minuend).toEqual(context.av);
    // The mistake the correction was made for: v − λv is (1 − λ)v, and is not
    // zero, so a witness comparing those two would walk to the wrong place.
    expect(Math.hypot(minuend[0] - v[0], minuend[1] - v[1])).toBeGreaterThan(1e-9);
    expect(
      Math.hypot(minuend[0] - subtrahend[0], minuend[1] - subtrahend[1]),
    ).toBeLessThan(1e-9);
  });

  it("makes the difference exactly zero, which is why the arrow reaches the origin", () => {
    const difference = resolveCancellationTerm(
      CANCELLATION_TERMS.difference,
      context,
    );
    expect(difference).toEqual([0, 0]);
  });

  it("throws for an unknown term rather than falling back to v", () => {
    expect(() =>
      resolveCancellationTerm(
        "v" as unknown as typeof CANCELLATION_TERMS.minuend,
        context,
      ),
    ).toThrow(/unknown cancellation term/);
  });
});

describe("the characteristic-equation bridge script", () => {
  it("declares a state for every segment of the bridge clip, and no others", () => {
    const segmentIds = EIGEN_CHARACTERISTIC_SEGMENTS.map(
      (segment) => segment.id,
    ).filter((id) => id !== "predict");
    expect(BRIDGE_BEATS.map((beat) => beat.id)).toEqual(segmentIds);
  });

  it("draws at most one kernel at a time", () => {
    // A − 2I kills exactly ONE of the two eigenlines. Two kernels on screen
    // while one root is the subject would say it kills both.
    for (const beat of BRIDGE_BEATS) {
      if (beat.underA) continue;
      expect(
        beat.kernelOf === null || STEPS[beat.kernelOf] !== undefined,
        beat.id,
      ).toBe(true);
    }
  });

  it("names an image line only where the map is actually singular", () => {
    for (const beat of BRIDGE_BEATS) {
      if (beat.imageOf === null) continue;
      // An image line drawn where det ≠ 0 would claim a collapse that has not
      // happened — the defect the "land before naming it" correction fixed.
      expect(Math.abs(detAtLambda(STEPS[beat.imageOf]!.lambda)), beat.id).toBeLessThan(1e-9);
      // Whenever the image is on screen, its own kernel is too, so the two are
      // always named against each other rather than one appearing alone.
      expect(beat.kernelOf, beat.id).toBe(beat.imageOf);
    }
  });

  it("lets both eigendirections share the frame only under A itself", () => {
    const shared = BRIDGE_BEATS.filter((beat) => beat.underA);
    expect(shared.length).toBeGreaterThan(0);
    for (const beat of shared) {
      // Under A nothing collapses, so there is no image line to draw.
      expect(beat.imageOf, beat.id).toBeNull();
      expect(beat.kernelOf, beat.id).toBeNull();
    }
    // …and it is the closing state, not an early one.
    expect(BRIDGE_BEATS.at(-1)!.underA).toBe(true);
  });

  it("throws for an unknown bridge beat rather than staging nothing", () => {
    expect(() => bridgeBeat("nope")).toThrow(/unknown bridge beat/);
  });
});
