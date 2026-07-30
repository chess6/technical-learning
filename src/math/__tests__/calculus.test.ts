import { describe, expect, it } from "vitest";
import {
  CALCULUS_FIXTURES,
  EX_ABS,
  EX_CONSTANT_RATE,
  EX_CURRENT,
  EX_DECAY,
  EX_DRIVE,
  EX_GAUSSIAN,
  EX_HIDDEN_SPIKE,
  EX_JUMP,
  EX_NON_MONOTONE,
  EX_PARABOLA,
  EX_PARABOLA_PUNCTURED,
  HIDDEN_SPIKE_GRID,
  accumulatedUnits,
  assertCalculusFixturesAreConsistent,
  boundaryAwareDerivative,
  cancelContributions,
  cancellationReport,
  continuityAt,
  differenceQuotient,
  getCalculusFixture,
  intervalContributions,
  limitFailureAt,
  numericDerivative,
  parabolaRightSum,
  partitionPoints,
  residual,
  residualEndpoints,
  residualRatio,
  riemannSum,
  runningTotal,
  samplingGap,
  largestWindowFound,
  spacingForTolerance,
  telescopingTerms,
  type SignedContribution,
} from "../calculus";

/**
 * Package A's correctness layer. Each block corresponds to an invariant named in
 * a lesson plan's "Mathematical invariants to assert" list, so a failure here
 * points at a specific learner-facing claim.
 */

describe("fixtures", () => {
  it("passes its own render-time consistency guard", () => {
    expect(() => assertCalculusFixturesAreConsistent()).not.toThrow();
  });

  it("throws for an unknown fixture rather than returning a default", () => {
    expect(() => getCalculusFixture("nope")).toThrow(/unknown fixture/);
  });

  it("gives every fixture a non-empty domain and a unique id", () => {
    const ids = CALCULUS_FIXTURES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const f of CALCULUS_FIXTURES) {
      expect(f.domain[1], f.id).toBeGreaterThan(f.domain[0]);
    }
  });
});

describe("limits and continuity (L1)", () => {
  it("refuses the difference quotient at h = 0 — that 0/0 is the lesson", () => {
    expect(() => differenceQuotient(EX_PARABOLA.f, 3, 0)).toThrow(/0\/0/);
  });

  it("gives exactly 2a + h for the parabola, for every h ≠ 0", () => {
    for (const a of [0.5, 1, 3]) {
      for (const h of [1, 0.5, 0.125, -0.25]) {
        expect(differenceQuotient(EX_PARABOLA.f, a, h)).toBeCloseTo(2 * a + h, 9);
      }
      // At a tiny step the identity is still exact in the reals, but the
      // floating subtraction f(a+h) - f(a) loses digits. The explorer's log
      // slider stops at 1e-4 for exactly this reason; the looser bound here
      // records the numerical fact rather than hiding it.
      expect(differenceQuotient(EX_PARABOLA.f, a, 1e-6)).toBeCloseTo(
        2 * a + 1e-6,
        6,
      );
    }
  });

  it("leaves the limit unchanged when the point is punctured", () => {
    // The whole of C7: the punctured and unpunctured fixtures agree off the point.
    for (let x = 1; x <= 5; x += 0.25) {
      if (Math.abs(x - 3) < 1e-9) continue;
      expect(EX_PARABOLA_PUNCTURED.f(x)).toBeCloseTo(x * x, 12);
    }
    // …and the limit still exists there, which is what makes it removable.
    expect(limitFailureAt(EX_PARABOLA_PUNCTURED, 3)).toBeNull();
    expect(continuityAt(EX_PARABOLA_PUNCTURED, 3).continuous).toBe(false);
  });

  it("answers a tolerance with a window where the limit exists", () => {
    for (const epsilon of [0.5, 0.1, 0.01]) {
      const search = largestWindowFound(EX_PARABOLA.f, 1, 1, epsilon);
      expect(search.kind, `epsilon = ${epsilon}`).toBe("found");
      // The reported window must genuinely work.
      const delta = search.kind === "found" ? search.delta : 0;
      for (let i = 1; i <= 32; i += 1) {
        const off = (delta * i) / 32;
        expect(Math.abs(EX_PARABOLA.f(1 + off) - 1)).toBeLessThan(epsilon);
        expect(Math.abs(EX_PARABOLA.f(1 - off) - 1)).toBeLessThan(epsilon);
      }
    }
  });

  it("finds no window where the limit fails", () => {
    // Oscillation: no candidate value can be defended.
    expect(
      largestWindowFound(getCalculusFixture("ex-oscillate").f, 0, 0, 0.2).kind,
    ).toBe("not-found");
    // Blow-up: the outputs leave every band.
    expect(
      largestWindowFound(getCalculusFixture("ex-blowup").f, 0, 0, 0.5).kind,
    ).toBe("not-found");
  });

  it("reports a failed SEARCH, not a failed limit, when the ladder runs out", () => {
    // The defect this discriminated result exists to prevent: `ex-hidden-spike`
    // is continuous at 4.4, so a window genuinely exists for every tolerance —
    // but a finite ladder can still fail to find one. "not-found" must therefore
    // never be read as "no limit exists".
    const spike = getCalculusFixture("ex-hidden-spike");
    expect(continuityAt(spike, 4.4).continuous).toBe(true);
    expect(limitFailureAt(spike, 4.4)).toBeNull();
    const tight = largestWindowFound(spike.f, 4.4, spike.f(4.4), 1e-3, {
      maxDelta: 1,
      steps: 6,
    });
    expect(tight.kind).toBe("not-found");
    // With enough ladder depth the same point does find one, which is exactly
    // why exhausting a short ladder proves nothing.
    const deeper = largestWindowFound(spike.f, 4.4, spike.f(4.4), 1e-3, {
      maxDelta: 1,
      steps: 200,
    });
    expect(deeper.kind).toBe("found");
  });

  it("returns the LARGEST tested window, not the smallest", () => {
    // A smallest working window is not a meaningful object: any smaller one also
    // works. The readout that called this "smallest" was describing the wrong
    // quantity.
    const loose = largestWindowFound(EX_PARABOLA.f, 1, 1, 0.5, { maxDelta: 1 });
    const tight = largestWindowFound(EX_PARABOLA.f, 1, 1, 0.05, { maxDelta: 1 });
    expect(loose.kind).toBe("found");
    expect(tight.kind).toBe("found");
    if (loose.kind === "found" && tight.kind === "found") {
      expect(loose.delta).toBeGreaterThan(tight.delta);
    }
  });

  it("distinguishes the four failure modes as the fixtures declare them", () => {
    expect(limitFailureAt(EX_JUMP, 1)).toBe("jump");
    expect(limitFailureAt(getCalculusFixture("ex-oscillate"), 0)).toBe("oscillation");
    expect(limitFailureAt(getCalculusFixture("ex-blowup"), 0)).toBe("blow-up");
    expect(limitFailureAt(EX_PARABOLA, 1)).toBeNull();
  });

  it("runs the three-part continuity test as three separable parts", () => {
    const good = continuityAt(EX_PARABOLA, 1);
    expect(good).toEqual({
      valueExists: true,
      limitExists: true,
      agree: true,
      continuous: true,
    });
    const punctured = continuityAt(EX_PARABOLA_PUNCTURED, 3);
    expect(punctured.valueExists).toBe(false);
    expect(punctured.limitExists).toBe(true); // removable: the limit survives
    expect(punctured.continuous).toBe(false);
  });
});

describe("continuity is local — the sampling correction (L1)", () => {
  it("hides a full-height spike between two adjacent samples of a continuous function", () => {
    // The fixture must actually demonstrate the failure, not merely be asserted
    // to. Every integer sample is zero; the maximum on the interval is 1.
    for (let x = 0; x <= 10; x += HIDDEN_SPIKE_GRID) {
      expect(EX_HIDDEN_SPIKE.f(x), `sample at ${x}`).toBeCloseTo(0, 12);
    }
    let max = 0;
    for (let x = 0; x <= 10; x += 0.001) max = Math.max(max, EX_HIDDEN_SPIKE.f(x));
    expect(max).toBeCloseTo(1, 3);

    // So the sampled polyline says nothing about what lies between.
    expect(samplingGap(EX_HIDDEN_SPIKE.f, EX_HIDDEN_SPIKE.domain, HIDDEN_SPIKE_GRID))
      .toBeGreaterThan(0.9);
  });

  it("is continuous everywhere on its domain, which is the point", () => {
    // No jump: consecutive dense samples never differ by much.
    let worstStep = 0;
    for (let x = 0; x < 10; x += 0.0005) {
      worstStep = Math.max(
        worstStep,
        Math.abs(EX_HIDDEN_SPIKE.f(x + 0.0005) - EX_HIDDEN_SPIKE.f(x)),
      );
    }
    expect(worstStep).toBeLessThan(0.01);
  });

  it("declares no modulus for the spike — a sampling claim would need one", () => {
    expect(EX_HIDDEN_SPIKE.modulus).toBeUndefined();
  });

  it("closes the gap once the grid is refined", () => {
    const fine = samplingGap(EX_HIDDEN_SPIKE.f, EX_HIDDEN_SPIKE.domain, 0.02);
    expect(fine).toBeLessThan(0.1);
  });

  it("turns a modulus and a tolerance into a usable spacing", () => {
    const omega = { omega: (d: number) => 3 * d, label: "3\\delta" };
    const spacing = spacingForTolerance(omega, 0.06);
    expect(spacing).not.toBeNull();
    expect(spacing!).toBeLessThanOrEqual(0.02 + 1e-9);
    expect(omega.omega(spacing!)).toBeLessThanOrEqual(0.06 + 1e-12);
  });

  it("reports no spacing when the modulus cannot meet the tolerance", () => {
    expect(spacingForTolerance({ omega: () => 5, label: "5" }, 1)).toBeNull();
  });

  it("bounds the variation of every fixture that declares a modulus", () => {
    for (const f of CALCULUS_FIXTURES) {
      if (!f.modulus) continue;
      const [lo, hi] = f.domain;
      for (let i = 0; i < 400; i += 1) {
        const x = lo + ((hi - lo) * (i % 20)) / 20;
        const y = lo + ((hi - lo) * ((i * 13) % 20)) / 20;
        expect(
          Math.abs(f.f(x) - f.f(y)),
          `${f.id}: |f(${x}) - f(${y})|`,
        ).toBeLessThanOrEqual(f.modulus.omega(Math.abs(x - y)) + 1e-9);
      }
    }
  });
});

describe("the derivative as local linearity (L2)", () => {
  it("makes the residual vanish faster than the step, for the true slope", () => {
    const a = 1.4;
    const slope = EX_PARABOLA.derivative!(a);
    let previous = Infinity;
    for (const h of [0.4, 0.2, 0.1, 0.05, 0.025]) {
      const ratio = Math.abs(residualRatio(EX_PARABOLA.f, a, slope, h));
      expect(ratio).toBeLessThan(previous);
      previous = ratio;
    }
    expect(Math.abs(residualRatio(EX_PARABOLA.f, a, slope, 1e-6))).toBeLessThan(1e-5);
  });

  it("leaves a nonzero limiting ratio for any other slope — that is why the tangent is unique", () => {
    // For f(x) = x^2 the ratio is exactly (f'(a) - m) + h, so it tends to a
    // NONZERO constant rather than to 0. That contrast with the true slope is
    // the whole content of the tangent's definition by error decay.
    const a = 1.4;
    const wrong = EX_PARABOLA.derivative!(a) + 0.7;
    for (const h of [0.1, 0.01, 0.001]) {
      expect(residualRatio(EX_PARABOLA.f, a, wrong, h)).toBeCloseTo(-0.7 + h, 9);
    }
    expect(residualRatio(EX_PARABOLA.f, a, wrong, 1e-7)).toBeCloseTo(-0.7, 6);
  });

  it("keeps the residual nonzero at every magnification of a curved fixture", () => {
    // The rendering obligation: a zoom must never show zero residual, because
    // the curvature has not gone away.
    const a = 1.4;
    const slope = EX_PARABOLA.derivative!(a);
    for (const h of [0.5, 0.1, 0.01, 1e-4]) {
      expect(Math.abs(residual(EX_PARABOLA.f, a, slope, h))).toBeGreaterThan(0);
    }
  });

  it("gives |x| different one-sided quotients at 0 — no single line, no derivative", () => {
    expect(differenceQuotient(EX_ABS.f, 0, 0.001)).toBeCloseTo(1, 9);
    expect(differenceQuotient(EX_ABS.f, 0, -0.001)).toBeCloseTo(-1, 9);
    expect(EX_ABS.nonDifferentiable).toContain(0);
  });

  it("matches every declared derivative against a numeric one", () => {
    for (const f of CALCULUS_FIXTURES) {
      if (!f.derivative) continue;
      const [lo, hi] = f.domain;
      for (let i = 1; i < 10; i += 1) {
        const x = lo + ((hi - lo) * i) / 10;
        if ((f.nonDifferentiable ?? []).some((p) => Math.abs(p - x) < 0.2)) continue;
        expect(f.derivative(x), `${f.id} at ${x}`).toBeCloseTo(
          numericDerivative(f.f, x),
          4,
        );
      }
    }
  });
});

describe("the integral as accumulation (L3)", () => {
  it("matches the closed form for the parabola's right sum", () => {
    for (const n of [1, 2, 5, 40, 1000]) {
      expect(riemannSum(EX_PARABOLA.f, 0, 2, n, "right")).toBeCloseTo(
        parabolaRightSum(n),
        9,
      );
    }
  });

  it("brackets 8/3 with left and right sums, closing at rate 1/n", () => {
    for (const n of [4, 16, 64]) {
      const left = riemannSum(EX_PARABOLA.f, 0, 2, n, "left");
      const right = riemannSum(EX_PARABOLA.f, 0, 2, n, "right");
      expect(left).toBeLessThan(8 / 3);
      expect(right).toBeGreaterThan(8 / 3);
      expect(right - left).toBeCloseTo(8 / n, 9);
    }
  });

  it("does NOT bracket on a non-monotone rate — the restriction is real", () => {
    // A test that requires the failure: the caption claims bracketing only for
    // monotone integrands, and this is what makes that caption necessary.
    const exact = 2; // \int_0^\pi sin = 2
    const left = riemannSum(EX_NON_MONOTONE.f, 0, Math.PI, 8, "left");
    const right = riemannSum(EX_NON_MONOTONE.f, 0, Math.PI, 8, "right");
    expect(left).toBeCloseTo(right, 9); // symmetric: both on the same side
    expect(Math.min(left, right)).toBeLessThan(exact);
    expect(Math.max(left, right)).toBeLessThan(exact);
    expect(EX_NON_MONOTONE.monotone).toBe(false);
  });

  it("collapses to rate × duration on a constant rate, for every n", () => {
    for (const n of [1, 3, 17, 256]) {
      for (const sample of ["left", "right", "mid"] as const) {
        expect(riemannSum(EX_CONSTANT_RATE.f, 0, 4, n, sample)).toBeCloseTo(12, 9);
      }
    }
  });

  it("signs the total: a negative rate walks it backwards", () => {
    const totals = runningTotal(EX_CURRENT.f, 0, 8, 400);
    const peak = Math.max(...totals.map((t) => t.total));
    const final = totals[totals.length - 1]!.total;
    // The transfer item's claim: the final total can end BELOW its own maximum.
    expect(final).toBeLessThan(peak);
  });

  it("plots a running total equal to the partial sums", () => {
    const totals = runningTotal(EX_PARABOLA.f, 0, 2, 8, "mid");
    expect(totals[0]!.total).toBe(0);
    for (let i = 1; i < totals.length; i += 1) {
      expect(totals[i]!.total).toBeCloseTo(
        riemannSum(EX_PARABOLA.f, 0, totals[i]!.x, i, "mid"),
        6,
      );
    }
  });

  it("derives accumulated units from the fixture rather than hard-coding them", () => {
    expect(accumulatedUnits(EX_DRIVE)).toBe("m");
    expect(accumulatedUnits(EX_CURRENT)).toBe("C");
    expect(() => accumulatedUnits(EX_PARABOLA)).toThrow(/declares no axis units/);
  });

  it("rejects a non-positive or fractional partition count", () => {
    expect(() => partitionPoints(0, 1, 0)).toThrow(/positive integer/);
    expect(() => partitionPoints(0, 1, 2.5)).toThrow(/positive integer/);
    expect(() => parabolaRightSum(0)).toThrow(/positive integer/);
  });
});

describe("the Fundamental Theorem (L4)", () => {
  it("holds the telescoping identity EXACTLY on unequal partitions", () => {
    // Pure arithmetic: no calculus in this claim at all, which is the point of
    // the identity step and why the argument generalizes.
    for (const n of [2, 3, 7, 25]) {
      const points = partitionPoints(0, 2, n, "unequal");
      const terms = telescopingTerms(EX_PARABOLA.antiderivative!, points);
      const summed = terms.reduce((s, t) => s + t.change, 0);
      const direct =
        EX_PARABOLA.antiderivative!(2) - EX_PARABOLA.antiderivative!(0);
      expect(summed).toBeCloseTo(direct, 12);
    }
  });

  it("produces strictly increasing, genuinely unequal partitions", () => {
    const points = partitionPoints(0, 2, 6, "unequal");
    expect(points[0]).toBeCloseTo(0, 12);
    expect(points[points.length - 1]).toBeCloseTo(2, 12);
    const widths = points.slice(1).map((p, i) => p - points[i]!);
    for (const w of widths) expect(w).toBeGreaterThan(0);
    expect(Math.max(...widths) - Math.min(...widths)).toBeGreaterThan(0.05);
  });

  it("counts the survivors: n terms, n-1 cancellations, two ends", () => {
    for (const n of [2, 5, 40]) {
      const report = cancellationReport(partitionPoints(0, 2, n));
      expect(report.termCount).toBe(n);
      expect(report.cancellingCount).toBe(n - 1);
      expect(report.survivors).toHaveLength(2);
      expect(report.survivors[0]).toBeCloseTo(0, 12);
      expect(report.survivors[1]).toBeCloseTo(2, 12);
    }
  });

  it("accepts any point list, not just an interval partition", () => {
    // The generalization requirement: `greens-theorem`, `stokes-theorem`, and
    // `divergence-theorem` re-run this with shared interior edges and faces.
    const arbitrary = [-3, 0.5, 0.75, 9];
    const terms = telescopingTerms((x) => x * x, arbitrary);
    expect(terms).toHaveLength(3);
    expect(terms.reduce((s, t) => s + t.change, 0)).toBeCloseTo(81 - 9, 12);
    expect(cancellationReport(arbitrary).survivors).toEqual([-3, 9]);
  });

  it("rejects a degenerate point list rather than reporting a vacuous identity", () => {
    expect(() => telescopingTerms((x) => x, [1])).toThrow(/at least two/);
    expect(() => cancellationReport([])).toThrow(/at least two/);
  });

  it("agrees with the refined Riemann sum on every fixture with an antiderivative", () => {
    for (const f of CALCULUS_FIXTURES) {
      if (!f.antiderivative || f.discontinuities?.length) continue;
      const [lo, hi] = f.domain;
      const byFTC = f.antiderivative(hi) - f.antiderivative(lo);
      const bySum = riemannSum(f.f, lo, hi, 20000, "mid");
      expect(bySum, f.id).toBeCloseTo(byFTC, 4);
    }
  });

  it("corroborates 8/3 by two independent routes", () => {
    const bySum = riemannSum(EX_PARABOLA.f, 0, 2, 200000, "mid");
    const byFTC = EX_PARABOLA.antiderivative!(2) - EX_PARABOLA.antiderivative!(0);
    expect(bySum).toBeCloseTo(8 / 3, 8);
    expect(byFTC).toBeCloseTo(8 / 3, 12);
  });

  it("leaves the definite integral unchanged when F is shifted by a constant", () => {
    const shifted = (x: number) => EX_PARABOLA.antiderivative!(x) + 17.25;
    expect(shifted(2) - shifted(0)).toBeCloseTo(
      EX_PARABOLA.antiderivative!(2) - EX_PARABOLA.antiderivative!(0),
      12,
    );
  });

  it("shifts the running total when the lower limit moves, without changing its slope", () => {
    const fromZero = runningTotal(EX_PARABOLA.f, 0, 2, 2000, "mid");
    const fromHalf = runningTotal(EX_PARABOLA.f, 0.5, 2, 2000, "mid");
    const offset = riemannSum(EX_PARABOLA.f, 0, 0.5, 2000, "mid");
    const atOne = (rows: typeof fromZero) =>
      rows.reduce((best, r) => (Math.abs(r.x - 1) < Math.abs(best.x - 1) ? r : best));
    expect(atOne(fromZero).total - atOne(fromHalf).total).toBeCloseTo(offset, 3);
    // A' = f is unaffected by the lower limit.
    expect(numericDerivative(EX_PARABOLA.antiderivative!, 1)).toBeCloseTo(
      EX_PARABOLA.f(1),
      6,
    );
  });

  it("gives A' = f numerically on the drive trace", () => {
    for (const t of [1, 3, 5, 7, 9]) {
      expect(numericDerivative(EX_DRIVE.antiderivative!, t)).toBeCloseTo(
        EX_DRIVE.f(t),
        5,
      );
    }
  });

  it("keeps the one-step error visibly nonzero on every piece of an unequal partition (ledger check P3)", () => {
    // Clip 2's `one-step` beat and the explorer's error table both draw
    // E_i = [F(x_{i+1}) - F(x_i)] - f(x_i) * dx_i on this exact partition
    // shape. F(x) = x^3/3 is genuinely curved, so no piece may show E_i = 0 --
    // a zero would silently teach that the local-linear model is exact.
    const points = partitionPoints(0, 2, 5, "unequal");
    const F = EX_PARABOLA.antiderivative!;
    for (let i = 0; i < points.length - 1; i += 1) {
      const x0 = points[i]!;
      const dx = points[i + 1]! - x0;
      const e = residual(F, x0, EX_PARABOLA.f(x0), dx);
      expect(Math.abs(e), `piece ${i}`).toBeGreaterThan(0);
    }
  });

  describe("residualEndpoints — the two points a residual VISUALIZATION must compare", () => {
    // `ftc-telescoping`'s `one-step` beat draws E_i as the gap between these
    // two exact values (both read on the F/accumulation axis). A prior
    // version instead drew a segment between f(x_i) and f(x_{i+1}) — a RATE
    // difference, different units, not this quantity. These regressions pin
    // the endpoints themselves, not just the scalar residual.

    it("its difference equals residual() exactly, for every piece of an unequal partition", () => {
      const points = partitionPoints(0, 2, 5, "unequal");
      const F = EX_PARABOLA.antiderivative!;
      for (let i = 0; i < points.length - 1; i += 1) {
        const x0 = points[i]!;
        const dx = points[i + 1]! - x0;
        const { predicted, actual } = residualEndpoints(F, x0, EX_PARABOLA.f(x0), dx);
        expect(actual - predicted).toBeCloseTo(residual(F, x0, EX_PARABOLA.f(x0), dx), 12);
      }
    });

    it("REQUIRED: the two endpoints are visibly distinct (a nonzero residual) on every unequal piece", () => {
      const points = partitionPoints(0, 2, 5, "unequal");
      const F = EX_PARABOLA.antiderivative!;
      for (let i = 0; i < points.length - 1; i += 1) {
        const x0 = points[i]!;
        const dx = points[i + 1]! - x0;
        const { predicted, actual } = residualEndpoints(F, x0, EX_PARABOLA.f(x0), dx);
        expect(Math.abs(actual - predicted), `piece ${i}`).toBeGreaterThan(0);
      }
    });

    it("`actual` is F(x_{i+1}) itself, not a rate value — same axis the caption/equation describe", () => {
      const F = EX_PARABOLA.antiderivative!;
      const x0 = 0.3;
      const dx = 0.5;
      const { actual } = residualEndpoints(F, x0, EX_PARABOLA.f(x0), dx);
      expect(actual).toBeCloseTo(F(x0 + dx), 12);
      expect(actual).not.toBeCloseTo(EX_PARABOLA.f(x0 + dx), 2);
    });

    it("`predicted` is the local-linear model's F-value, not f(x_0)", () => {
      const F = EX_PARABOLA.antiderivative!;
      const x0 = 0.3;
      const dx = 0.5;
      const slope = EX_PARABOLA.f(x0);
      const { predicted } = residualEndpoints(F, x0, slope, dx);
      expect(predicted).toBeCloseTo(F(x0) + slope * dx, 12);
    });
  });

  it("applies to e^(-x^2): the theorem holds numerically with no elementary antiderivative", () => {
    // The standing counterexample (`not-a-recipe`, clip 2). No `antiderivative`
    // is declared — none exists in closed form — so the only route to a number
    // is the same numerical accumulation every other fixture uses.
    expect(EX_GAUSSIAN.antiderivative).toBeUndefined();
    const [lo, hi] = EX_GAUSSIAN.domain;
    // A'(x) = f(x): the theorem's first half does not need a formula for A.
    const A = (x: number) => riemannSum(EX_GAUSSIAN.f, lo, x, 4000, "mid");
    // Interior points: the ordinary symmetric difference is fine here.
    for (const x of [0.4, 1, 1.6]) {
      expect(numericDerivative(A, x)).toBeCloseTo(EX_GAUSSIAN.f(x), 3);
    }
    // Both domain ends need the boundary-aware one-sided difference — the
    // symmetric difference is provably wrong right at an end (see the
    // `boundaryAwareDerivative` describe block below for the endpoint bug
    // this guards against).
    expect(boundaryAwareDerivative(A, lo, EX_GAUSSIAN.domain)).toBeCloseTo(EX_GAUSSIAN.f(lo), 3);
    expect(boundaryAwareDerivative(A, hi, EX_GAUSSIAN.domain)).toBeCloseTo(EX_GAUSSIAN.f(hi), 3);
    // The sum still converges, and it is bracketed on the certified stretch.
    const coarse = riemannSum(EX_GAUSSIAN.f, lo, hi, 8, "mid");
    const fine = riemannSum(EX_GAUSSIAN.f, lo, hi, 20000, "mid");
    expect(Math.abs(coarse - fine)).toBeLessThan(0.05);
  });
});

describe("boundaryAwareDerivative — no symmetric difference reaching past a domain end", () => {
  it("matches the symmetric difference at an interior point", () => {
    const domain: [number, number] = [0, 2];
    const f = (x: number) => x * x * x;
    const x = 1;
    expect(boundaryAwareDerivative(f, x, domain)).toBeCloseTo(numericDerivative(f, x), 8);
  });

  it("REQUIRED: reports the true derivative at a=0 for the running total of e^(-x^2), not half of it", () => {
    // The exact reported bug: clamping A's argument up by an epsilon before a
    // symmetric difference gave A(a-h) ≈ 0 instead of the true negative
    // extension, halving the reported slope at x = a (≈0.5 instead of ≈1).
    const [lo] = EX_GAUSSIAN.domain;
    const A = (x: number) => riemannSum(EX_GAUSSIAN.f, lo, x, 4000, "mid");
    const slopeAtLower = boundaryAwareDerivative(A, lo, EX_GAUSSIAN.domain);
    expect(slopeAtLower).toBeCloseTo(EX_GAUSSIAN.f(lo), 3); // f(0) = 1
    expect(slopeAtLower).not.toBeCloseTo(EX_GAUSSIAN.f(lo) / 2, 1);
  });

  it("is correct at both ends of a fixture whose f is nonzero at both, and at an interior point", () => {
    // EX_DECAY: f(t) = e^(-t/1.5) on [0, 8] — nonzero at both ends, unlike a
    // fixture that happens to vanish at its boundary and could mask a bug.
    const [lo, hi] = EX_DECAY.domain;
    const A = (x: number) => riemannSum(EX_DECAY.f, lo, x, 4000, "mid");
    expect(boundaryAwareDerivative(A, lo, EX_DECAY.domain)).toBeCloseTo(EX_DECAY.f(lo), 3);
    expect(boundaryAwareDerivative(A, hi, EX_DECAY.domain)).toBeCloseTo(EX_DECAY.f(hi), 3);
    const mid = (lo + hi) / 2;
    expect(boundaryAwareDerivative(A, mid, EX_DECAY.domain)).toBeCloseTo(EX_DECAY.f(mid), 3);
  });

  it("rejects a domain narrower than the step size", () => {
    expect(() => boundaryAwareDerivative((x) => x, 0, [0, 1e-7], 1e-5)).toThrow(/narrower/);
  });

  it("rejects an x outside the domain", () => {
    expect(() => boundaryAwareDerivative((x) => x, 5, [0, 2])).toThrow(/outside domain/);
  });
});

describe("generic cancellation (parameterized over cancelling pairs, not intervals)", () => {
  // Package-ledger check P2: `telescoping-cancellation` must not be hard-coded
  // to interval endpoints, because L34 (Green's theorem) re-runs the same
  // mechanism over interior EDGES shared by adjacent cells — a graph of
  // cancelling pairs, not a single ordered chain with exactly two ends.

  it("cancels a simple interval chain exactly like `cancellationReport`", () => {
    const points = partitionPoints(0, 2, 5, "unequal");
    const contributions = intervalContributions(EX_PARABOLA.antiderivative!, points);
    const report = cancelContributions(contributions);
    // Two raw contributions per piece (once as a term's "to", once as the next
    // term's "from"), so termCount is 2*(pieces), not the piece count itself.
    expect(report.termCount).toBe(2 * (points.length - 1));
    expect(report.cancellingCount).toBe(points.length - 2); // interior points
    expect(report.survivors).toHaveLength(2);
    const survivorValues = report.survivors.map((s) => s.value).sort((a, b) => a - b);
    expect(survivorValues[0]).toBeCloseTo(EX_PARABOLA.antiderivative!(points[0]!), 10);
    expect(survivorValues[1]).toBeCloseTo(
      EX_PARABOLA.antiderivative!(points[points.length - 1]!),
      10,
    );
  });

  it("REQUIRED: cancels a non-interval pairing — shared interior edges, not a chain", () => {
    // Three cells sharing two interior edges, the way three adjacent regions in
    // a subdivided area would share boundaries in Green's theorem. There is no
    // 1D order here at all — "AB" and "BC" are edge names, not coordinates —
    // and each interior edge is walked once by each of its two neighbouring
    // cells, in opposite orientation, exactly like an interior partition point
    // is evaluated once positively and once negatively above.
    const contributions: SignedContribution[] = [
      // Cell 1's boundary: outer edge "out1", plus shared edge "AB" (its side).
      { id: "out1", sign: 1, value: 4, label: "outer edge 1" },
      { id: "AB", sign: 1, value: 10, label: "edge AB (cell 1 side)" },
      // Cell 2's boundary: shares "AB" (opposite orientation) and "BC".
      { id: "AB", sign: -1, value: 10, label: "edge AB (cell 2 side)" },
      { id: "BC", sign: 1, value: -3, label: "edge BC (cell 2 side)" },
      // Cell 3's boundary: shares "BC" (opposite orientation), plus an outer edge.
      { id: "BC", sign: -1, value: -3, label: "edge BC (cell 3 side)" },
      { id: "out3", sign: 1, value: 7, label: "outer edge 3" },
    ];
    const report = cancelContributions(contributions);
    expect(report.termCount).toBe(6);
    expect(report.cancellingCount).toBe(2); // AB and BC, the shared interior edges
    expect(report.survivors.map((s) => s.id).sort()).toEqual(["out1", "out3"]);
    // The surviving contributions sum to the total boundary circulation of the
    // whole subdivided region — the interior never mattered, whatever shape it is.
    const total = contributions.reduce((s, c) => s + c.sign * c.value, 0);
    const survivorTotal = report.survivors.reduce((s, c) => s + c.sign * c.value, 0);
    expect(survivorTotal).toBeCloseTo(total, 12);
  });

  it("does not silently cancel an id that appears with the same sign twice, or three times", () => {
    const sameSign: SignedContribution[] = [
      { id: "x", sign: 1, value: 1, label: "a" },
      { id: "x", sign: 1, value: 1, label: "b" },
    ];
    expect(cancelContributions(sameSign).cancellingCount).toBe(0);
    expect(cancelContributions(sameSign).survivors).toHaveLength(2);

    const triple: SignedContribution[] = [
      { id: "y", sign: 1, value: 1, label: "a" },
      { id: "y", sign: -1, value: 1, label: "b" },
      { id: "y", sign: 1, value: 1, label: "c" },
    ];
    expect(cancelContributions(triple).cancellingCount).toBe(0);
    expect(cancelContributions(triple).survivors).toHaveLength(3);
  });

  it("rejects an empty contribution list rather than reporting a vacuous identity", () => {
    expect(() => cancelContributions([])).toThrow(/at least one/);
    expect(() => intervalContributions((x) => x, [1])).toThrow(/at least two/);
  });

  describe("magnitude validation — required for a future shared-edge (Green's theorem) reuse", () => {
    // A shared edge cancels only when both sides agree on the edge's value.
    // Opposite sign alone is not enough: two independently-computed sides
    // that disagree are a real inconsistency, not a telescoping identity, and
    // must stay visible rather than vanish.

    it("cancels equal-magnitude, opposite-sign contributions", () => {
      const equal: SignedContribution[] = [
        { id: "AB", sign: 1, value: 5, label: "edge AB (cell 1 side)" },
        { id: "AB", sign: -1, value: 5, label: "edge AB (cell 2 side)" },
      ];
      const report = cancelContributions(equal);
      expect(report.cancellingCount).toBe(1);
      expect(report.survivors).toHaveLength(0);
    });

    it("does NOT cancel opposite-sign contributions with unequal magnitude", () => {
      const unequal: SignedContribution[] = [
        { id: "AB", sign: 1, value: 5, label: "edge AB (cell 1 side)" },
        { id: "AB", sign: -1, value: 5.4, label: "edge AB (cell 2 side)" },
      ];
      const report = cancelContributions(unequal);
      expect(report.cancellingCount).toBe(0);
      expect(report.survivors).toHaveLength(2);
      expect(report.survivors.map((s) => s.value).sort()).toEqual([5, 5.4]);
    });

    it("cancels within the default tolerance — floating-point drift from two independent computations", () => {
      const withinTolerance: SignedContribution[] = [
        { id: "AB", sign: 1, value: 5, label: "edge AB (cell 1 side)" },
        { id: "AB", sign: -1, value: 5 + 1e-10, label: "edge AB (cell 2 side)" },
      ];
      expect(cancelContributions(withinTolerance).cancellingCount).toBe(1);
    });

    it("does not cancel just outside a caller-supplied tolerance", () => {
      const justOutside: SignedContribution[] = [
        { id: "AB", sign: 1, value: 5, label: "edge AB (cell 1 side)" },
        { id: "AB", sign: -1, value: 5.01, label: "edge AB (cell 2 side)" },
      ];
      expect(cancelContributions(justOutside, 1e-3).cancellingCount).toBe(0);
      expect(cancelContributions(justOutside, 1e-1).cancellingCount).toBe(1);
    });

    it("still cancels the existing interval and shared-edge fixtures under magnitude validation", () => {
      // Regression guard: the two tests above this describe block must keep
      // passing now that magnitude is checked, since every real contribution
      // in this codebase is built from the same value evaluated twice.
      const points = partitionPoints(0, 2, 5, "unequal");
      const contributions = intervalContributions(EX_PARABOLA.antiderivative!, points);
      expect(cancelContributions(contributions).cancellingCount).toBe(points.length - 2);
    });

    it("a mismatched pair keeps BOTH sides visible in survivors, not just one", () => {
      const contributions: SignedContribution[] = [
        { id: "out1", sign: 1, value: 4, label: "outer edge 1" },
        { id: "AB", sign: 1, value: 10, label: "edge AB (cell 1 side)" },
        { id: "AB", sign: -1, value: 9.5, label: "edge AB (cell 2 side, inconsistent)" },
        { id: "out3", sign: 1, value: 7, label: "outer edge 3" },
      ];
      const report = cancelContributions(contributions);
      expect(report.cancellingCount).toBe(0);
      expect(report.survivors.map((s) => s.id).sort()).toEqual(["AB", "AB", "out1", "out3"]);
    });
  });
});
