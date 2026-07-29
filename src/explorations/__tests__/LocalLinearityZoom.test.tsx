import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import {
  LocalLinearityZoom,
  magnificationCeiling,
  zoomReadouts,
  zoomWindow,
} from "../LocalLinearityZoom";
import { EX_ABS, EX_DECAY, EX_PARABOLA, type SlopeAt } from "../../math";

/** The slope, asserted to exist. `SlopeAt` is a union precisely so a corner
 *  cannot silently supply a number, so a test that wants one must say so. */
function theSlope(s: SlopeAt): number {
  if (s.kind !== "differentiable") {
    throw new Error(`expected a slope, got a corner (${s.left}, ${s.right})`);
  }
  return s.slope;
}

/**
 * The `local-linearity-zoom` family. Its honesty rule — the curve is never
 * replaced by a straight line, at any magnification — is the package ledger's
 * check P3, so it is pinned here rather than left to review.
 */

describe("the zoom window", () => {
  it("halves its half-width on each doubling of magnification", () => {
    const one = zoomWindow(EX_PARABOLA, 1, 1);
    const four = zoomWindow(EX_PARABOLA, 1, 4);
    expect(one.halfWidth).toBeCloseTo(1, 12);
    expect(four.halfWidth).toBeCloseTo(0.25, 12);
    expect(four.x[0]).toBeCloseTo(0.75, 12);
    expect(four.x[1]).toBeCloseTo(1.25, 12);
  });

  it("stays centred on the point at every magnification", () => {
    for (const m of [1, 2, 16, 1024]) {
      const w = zoomWindow(EX_PARABOLA, 1.4, m);
      expect((w.x[0] + w.x[1]) / 2).toBeCloseTo(1.4, 10);
      expect((w.y[0] + w.y[1]) / 2).toBeCloseTo(EX_PARABOLA.f(1.4), 10);
    }
  });

  it("scales its height by the fixture's own slope, so a steep curve stays steep", () => {
    // A window with a fixed vertical extent would flatten every function as it
    // narrowed — which is precisely the lie the zoom must not tell.
    const shallow = zoomWindow(EX_PARABOLA, 0.1, 8);
    const steep = zoomWindow(EX_PARABOLA, 1.9, 8);
    const height = (w: { y: readonly [number, number] }) => w.y[1] - w.y[0];
    expect(height(steep)).toBeGreaterThan(height(shallow));
  });

  it("rejects a magnification below 1 rather than inverting the window", () => {
    expect(() => zoomWindow(EX_PARABOLA, 1, 0.5)).toThrow(/must be >= 1/);
  });

  it("names a ceiling a caller can display instead of silently clamping", () => {
    expect(magnificationCeiling(1, 1e-4)).toBe(1e4);
  });
});

describe("the zoom readouts", () => {
  it("keeps the residual nonzero at every magnification of a curved fixture", () => {
    // P3, stated as a number: the curvature does not go away, it becomes small
    // COMPARED TO the step. Any frame reporting exactly zero would be lying.
    for (const h of [0.5, 0.05, 1e-3, 1e-5]) {
      const r = zoomReadouts(EX_PARABOLA, 1.4, h);
      expect(Math.abs(r.residual!), `h = ${h}`).toBeGreaterThan(0);
    }
  });

  it("drives the ratio to zero for the true slope and to a constant for a wrong one", () => {
    const ratios = [0.1, 0.01, 0.001].map(
      (h) => zoomReadouts(EX_PARABOLA, 1.4, h, EX_PARABOLA.derivative!(1.4) + 0.7),
    );
    for (const r of ratios) {
      expect(Math.abs(r.residualRatio!)).toBeLessThan(0.11);
      // The comparison slope's ratio tends to (f'(a) - m) = -0.7, not to 0.
      expect(r.comparisonResidualRatio!).toBeLessThan(-0.59);
    }
    expect(Math.abs(ratios[2]!.residualRatio!)).toBeLessThan(
      Math.abs(ratios[0]!.residualRatio!),
    );
  });

  it("reports the three readings the lesson says are one object", () => {
    const r = zoomReadouts(EX_PARABOLA, 1, 0.25);
    expect(theSlope(r.slope)).toBeCloseTo(2, 12); // the rate, and the tangent's slope
    expect(r.secantSlope).toBeCloseTo(2.25, 12); // the average over the step
    expect(r.estimate).toBeCloseTo(1 + 2 * 0.25, 12); // the prediction
    expect(r.actual).toBeCloseTo(1.5625, 12);
    expect(r.residual).toBeCloseTo(r.actual! - r.estimate!, 12);
  });

  it("falls back to a numeric slope for a fixture with no declared derivative", () => {
    const r = zoomReadouts(EX_ABS, 1, 0.1);
    expect(theSlope(r.slope)).toBeCloseTo(1, 4);
  });

  it("refuses to invent one at that fixture's declared corner", () => {
    // Away from zero |x| has a slope and the fallback supplies it; AT zero the
    // symmetric quotient would supply 0, and there is no slope to supply.
    expect(zoomReadouts(EX_ABS, 0, 0.1).slope.kind).toBe("corner");
  });

  it("reports nothing step-dependent when the step is zero", () => {
    const r = zoomReadouts(EX_DECAY, 2, 0);
    expect(r.secantSlope).toBeNull();
    expect(r.residual).toBeNull();
    expect(r.residualRatio).toBeNull();
    expect(theSlope(r.slope)).toBeCloseTo(EX_DECAY.derivative!(2), 10);
  });
});

describe("mounting", () => {
  it("mounts at extreme magnification without throwing", () => {
    expect(() =>
      render(
        <LocalLinearityZoom
          fixture={EX_PARABOLA}
          at={1}
          magnification={4096}
          h={1e-4}
          comparisonSlope={2.7}
          showSecant
          ariaLabel="magnified"
        />,
      ),
    ).not.toThrow();
  });

  it("mounts on the corner fixture, where no tangent exists", () => {
    expect(() =>
      render(
        <LocalLinearityZoom
          fixture={EX_ABS}
          at={0}
          magnification={64}
          ariaLabel="corner"
        />,
      ),
    ).not.toThrow();
  });
});
