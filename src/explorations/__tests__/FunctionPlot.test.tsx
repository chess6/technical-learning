import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import {
  FunctionPlot,
  curveSegments,
  functionPlotReadouts,
  samplingOverlay,
} from "../FunctionPlot";
import {
  EX_HIDDEN_SPIKE,
  EX_PARABOLA,
  EX_PARABOLA_PUNCTURED,
  HIDDEN_SPIKE_GRID,
} from "../../math";

/**
 * The `function-plot` family. Seven lessons reuse it, so its parameterization
 * and its three honesty rules are tested here rather than re-checked per lesson.
 */

describe("function-plot readouts", () => {
  it("reports the value, and null where the fixture is punctured", () => {
    expect(functionPlotReadouts(EX_PARABOLA, 1.5).value).toBeCloseTo(2.25, 12);
    expect(functionPlotReadouts(EX_PARABOLA_PUNCTURED, 3).value).toBeNull();
    // …but the neighbours are untouched, which is the lesson's whole point.
    expect(functionPlotReadouts(EX_PARABOLA_PUNCTURED, 3.001).value).toBeCloseTo(
      3.001 * 3.001,
      9,
    );
  });

  it("reports the secant slope, and refuses to invent one at h = 0", () => {
    const r = functionPlotReadouts(EX_PARABOLA, 1, { h: 0.5 });
    expect(r.secantSlope).toBeCloseTo(2.5, 9);
    expect(functionPlotReadouts(EX_PARABOLA, 1, { h: 0 }).secantSlope).toBeNull();
    expect(functionPlotReadouts(EX_PARABOLA, 1).secantSlope).toBeNull();
  });

  it("reports the residual and — the load-bearing one — its ratio to the step", () => {
    const a = 1.4;
    const slope = EX_PARABOLA.derivative!(a);
    const r = functionPlotReadouts(EX_PARABOLA, a, { h: 0.1, slope });
    // f(a+h) - (f(a) + f'(a)h) = h^2 exactly, for x^2.
    expect(r.residual).toBeCloseTo(0.01, 9);
    expect(r.residualRatio).toBeCloseTo(0.1, 9);
  });

  it("keeps the residual nonzero however small the step — the curvature is still there", () => {
    const a = 1.4;
    const slope = EX_PARABOLA.derivative!(a);
    for (const h of [0.5, 0.05, 1e-3]) {
      const r = functionPlotReadouts(EX_PARABOLA, a, { h, slope });
      expect(Math.abs(r.residual!)).toBeGreaterThan(0);
    }
  });

  it("reports no residual without both a step and a slope", () => {
    expect(functionPlotReadouts(EX_PARABOLA, 1, { h: 0.1 }).residual).toBeNull();
    expect(functionPlotReadouts(EX_PARABOLA, 1, { slope: 2 }).residual).toBeNull();
  });
});

/**
 * The family's three honesty rules are decided by pure functions, so they are
 * testable here. Mafs measures a zero-width canvas under jsdom and renders no
 * SVG children, which is why every explorer test in this repository asserts on
 * values and controls rather than on strokes — the rules are put where they can
 * be checked rather than left to a rendering nobody can inspect.
 */

describe("honesty rule 1 — the curve is the real fixture, split at holes", () => {
  it("plots one stretch when there is no hole", () => {
    expect(curveSegments(EX_PARABOLA, 0, 2)).toEqual([[0, 2]]);
  });

  it("splits into two stretches around a punctured point", () => {
    const pieces = curveSegments(EX_PARABOLA_PUNCTURED, 2, 4);
    expect(pieces).toHaveLength(2);
    expect(pieces[0]![0]).toBeCloseTo(2, 9);
    expect(pieces[0]![1]).toBeLessThan(3);
    expect(pieces[1]![0]).toBeGreaterThan(3);
    expect(pieces[1]![1]).toBeCloseTo(4, 9);
  });

  it("ignores a hole outside the visible window", () => {
    expect(curveSegments(EX_PARABOLA_PUNCTURED, 4, 5)).toEqual([[4, 5]]);
  });

  it("keeps the fixture's own values at every magnification", () => {
    // There is no substitution path: the component plots `fixture.f`, so a tiny
    // window still carries the curvature and the residual stays real.
    for (const half of [1, 1e-2, 1e-4]) {
      const [a, b] = curveSegments(EX_PARABOLA, 1 - half, 1 + half)[0]!;
      const mid = (a + b) / 2;
      expect(EX_PARABOLA.f(mid)).toBeCloseTo(mid * mid, 12);
    }
  });
});

describe("honesty rule 3 — no guaranteed band without a declared modulus", () => {
  it("returns null for a continuous fixture that declares no modulus", () => {
    expect(EX_HIDDEN_SPIKE.modulus).toBeUndefined();
    const overlay = samplingOverlay(
      EX_HIDDEN_SPIKE,
      ...EX_HIDDEN_SPIKE.domain,
      HIDDEN_SPIKE_GRID,
    );
    expect(overlay.guaranteedBand).toBeNull();
  });

  it("returns the modulus's own bound when one is declared", () => {
    const overlay = samplingOverlay(EX_PARABOLA, 0, 2, 0.5);
    expect(overlay.guaranteedBand).toBeCloseTo(EX_PARABOLA.modulus!.omega(0.5), 12);
  });

  it("reports a worst gap that exposes the hidden spike, and closes on refinement", () => {
    const coarse = samplingOverlay(
      EX_HIDDEN_SPIKE,
      ...EX_HIDDEN_SPIKE.domain,
      HIDDEN_SPIKE_GRID,
    );
    const fine = samplingOverlay(EX_HIDDEN_SPIKE, ...EX_HIDDEN_SPIKE.domain, 0.02);
    expect(coarse.worstGap).toBeGreaterThan(0.9);
    expect(fine.worstGap).toBeLessThan(0.1);
  });

  it("samples the grid it was asked for, when the spacing divides the span", () => {
    const overlay = samplingOverlay(EX_PARABOLA, 0, 2, 0.5);
    expect(overlay.samples).toHaveLength(5);
    expect(overlay.actualSpacing).toBeCloseTo(0.5, 12);
    expect(overlay.samples[0]).toEqual([0, 0]);
    expect(overlay.samples[4]![0]).toBeCloseTo(2, 12);
  });

  it("never uses a COARSER grid than requested, and bands the grid it drew", () => {
    // The defect: rounding the interval count to nearest could produce a grid
    // coarser than the request while the guarantee was still computed from the
    // finer requested value — a band narrower than the mathematics supports.
    // 0.62 on [0, 2] is the witness: to-nearest gives 3 intervals of 0.667.
    const overlay = samplingOverlay(EX_PARABOLA, 0, 2, 0.62);
    expect(overlay.samples).toHaveLength(5); // ceil(2 / 0.62) = 4 intervals
    expect(overlay.actualSpacing).toBeCloseTo(0.5, 12);
    expect(overlay.actualSpacing).toBeLessThanOrEqual(0.62);
    // The band must describe the grid on screen, not the request.
    expect(overlay.guaranteedBand).toBeCloseTo(
      EX_PARABOLA.modulus!.omega(overlay.actualSpacing),
      12,
    );
    expect(overlay.guaranteedBand).not.toBeCloseTo(
      EX_PARABOLA.modulus!.omega(0.62),
      6,
    );
  });

  it("keeps the band and the measured gap on the same grid, for every spacing", () => {
    for (const requested of [0.62, 0.3, 0.17, 0.9, 1.3, 2.5]) {
      const o = samplingOverlay(EX_PARABOLA, 0, 2, requested);
      expect(o.actualSpacing, `requested ${requested}`).toBeLessThanOrEqual(
        requested + 1e-12,
      );
      // Samples really are that far apart.
      for (let i = 1; i < o.samples.length; i += 1) {
        expect(o.samples[i]![0] - o.samples[i - 1]![0]).toBeCloseTo(
          o.actualSpacing,
          10,
        );
      }
      // And the guarantee genuinely bounds what the grid misses.
      expect(o.guaranteedBand).not.toBeNull();
      expect(o.worstGap).toBeLessThanOrEqual(o.guaranteedBand! + 1e-9);
    }
  });

  it("rejects a non-positive spacing rather than dividing by zero", () => {
    expect(() => samplingOverlay(EX_PARABOLA, 0, 2, 0)).toThrow(/must be positive/);
  });
});

describe("function-plot mounts", () => {
  it("renders with an accessible name", () => {
    const { container } = render(
      <FunctionPlot fixture={EX_PARABOLA} ariaLabel="A parabola with its tangent" />,
    );
    expect(
      container.querySelector('[role="img"]')?.getAttribute("aria-label"),
    ).toBe("A parabola with its tangent");
  });

  it("mounts every overlay combination without throwing", () => {
    expect(() =>
      render(
        <FunctionPlot
          fixture={EX_PARABOLA}
          ariaLabel="dressed"
          at={1}
          band={{ target: 1, epsilon: 0.3 }}
          window={{ delta: 0.2 }}
          secant={{ h: 0.5 }}
          tangent={{ slope: 2, compare: 2.7 }}
          sampling={{ spacing: 0.5 }}
        />,
      ),
    ).not.toThrow();
    expect(() =>
      render(
        <FunctionPlot
          fixture={EX_PARABOLA_PUNCTURED}
          ariaLabel="punctured"
          viewBox={{ x: [2, 4] }}
          at={3.5}
        />,
      ),
    ).not.toThrow();
  });
});
