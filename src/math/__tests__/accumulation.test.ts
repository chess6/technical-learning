import { describe, expect, it } from "vitest";
import {
  EX_CONSTANT_RATE,
  EX_CURRENT,
  EX_DRIVE,
  EX_NON_MONOTONE,
  EX_ABS,
  EX_PARABOLA,
  EX_POWER,
  accumulatedUnits,
  bracketReport,
  looksMonotoneOn,
  numericDerivative,
  slopeAt,
  parabolaRightSum,
  partitionPoints,
  refinementTable,
  riemannSum,
  runningTotal,
} from "../index";

/**
 * The mathematical invariants `integral-accumulation` (spine L3) rests on.
 *
 * Every one of these is a claim the lesson makes to a learner, so each is
 * asserted rather than trusted. The important one is the **required-to-fail**
 * bracket test: left/right bracketing is a consequence of monotonicity, and a
 * suite that only ever checked it on monotone fixtures would let the lesson
 * quietly overstate it — which is the misconception the lesson's recognition
 * item exists to catch.
 */

const INT_X2_ON_0_2 = 8 / 3;

describe("Riemann sums", () => {
  it("matches the closed form for x² on [0, 2] at every n", () => {
    for (const n of [1, 2, 3, 4, 7, 16, 64, 257]) {
      expect(riemannSum(EX_PARABOLA.f, 0, 2, n, "right"), `n = ${n}`).toBeCloseTo(
        parabolaRightSum(n),
        10,
      );
    }
  });

  it("brackets 8/3, with left and right differing by exactly 8/n", () => {
    for (const n of [1, 2, 4, 10, 100, 1000]) {
      const left = riemannSum(EX_PARABOLA.f, 0, 2, n, "left");
      const right = riemannSum(EX_PARABOLA.f, 0, 2, n, "right");
      expect(right - left, `n = ${n}`).toBeCloseTo(8 / n, 9);
      expect(left).toBeLessThan(INT_X2_ON_0_2);
      expect(right).toBeGreaterThan(INT_X2_ON_0_2);
    }
  });

  it("converges to 8/3 from any sample rule", () => {
    for (const rule of ["left", "right", "mid"] as const) {
      expect(riemannSum(EX_PARABOLA.f, 0, 2, 20000, rule), rule).toBeCloseTo(
        INT_X2_ON_0_2,
        3,
      );
    }
  });

  it("collapses to rate × duration on a constant rate, for EVERY n", () => {
    const [a, b] = EX_CONSTANT_RATE.domain;
    const exact = EX_CONSTANT_RATE.f(0) * (b - a);
    for (const n of [1, 2, 3, 5, 8, 13, 64, 511]) {
      for (const rule of ["left", "right", "mid"] as const) {
        expect(
          riemannSum(EX_CONSTANT_RATE.f, a, b, n, rule),
          `n = ${n}, ${rule}`,
        ).toBeCloseTo(exact, 10);
      }
      // And on an unequal partition too — the construction never needed equal
      // pieces, and a lesson that only ever showed equal ones would imply it did.
      expect(
        riemannSum(EX_CONSTANT_RATE.f, a, b, n, "mid", "unequal"),
        `unequal n = ${n}`,
      ).toBeCloseTo(exact, 10);
    }
  });

  it("is signed: a rate that goes negative pulls the total down", () => {
    const [a, b] = EX_CURRENT.domain;
    const whole = riemannSum(EX_CURRENT.f, a, b, 4096, "mid");
    const upToPeak = riemannSum(EX_CURRENT.f, a, 3, 4096, "mid");
    expect(upToPeak).toBeGreaterThan(0);
    expect(whole).toBeLessThan(upToPeak);
  });
});

describe("bracketReport", () => {
  it("brackets on a monotone rate", () => {
    const value = riemannSum(EX_PARABOLA.f, 0, 2, 8192, "mid");
    for (const n of [2, 5, 40]) {
      const report = bracketReport(EX_PARABOLA, 0, 2, n, value);
      expect(report.straddles, `n = ${n}`).toBe(true);
      expect(report.guaranteed, `n = ${n}`).toBe(true);
      expect(report.width).toBeGreaterThan(0);
    }
  });

  it("narrows as the partition refines", () => {
    const value = riemannSum(EX_PARABOLA.f, 0, 2, 8192, "mid");
    const widths = [2, 8, 32, 128].map(
      (n) => bracketReport(EX_PARABOLA, 0, 2, n, value).width,
    );
    for (let i = 1; i < widths.length; i += 1) {
      expect(widths[i]!).toBeLessThan(widths[i - 1]!);
    }
  });

  it("REQUIRED TO FAIL on a non-monotone rate", () => {
    // sin on [0, π] rises and falls symmetrically, so the left and right sums are
    // equal to each other and both fall short of the true value: the pair lands
    // on the same side and guarantees nothing. If this ever passes, the lesson's
    // monotone restriction has stopped being true and the recognition item is wrong.
    const [a, b] = EX_NON_MONOTONE.domain;
    const value = riemannSum(EX_NON_MONOTONE.f, a, b, 8192, "mid");
    for (const n of [2, 4, 8, 32]) {
      const report = bracketReport(EX_NON_MONOTONE, a, b, n, value);
      expect(report.straddles, `n = ${n}`).toBe(false);
      expect(report.guaranteed, `n = ${n}`).toBe(false);
    }
  });

  it("separates a LUCKY straddle from a guarantee", () => {
    // The drive trace rises and then falls, so no guarantee applies anywhere on
    // its full domain — and yet at a coarse partition the two sums do land
    // either side of the answer. Reporting that as a bracket is exactly the
    // over-generalization the lesson's recognition item exists to catch, so the
    // two facts are reported separately and this test pins the case where they
    // disagree. If it ever stops disagreeing, the distinction is untested.
    const [a, b] = EX_DRIVE.domain;
    const value = riemannSum(EX_DRIVE.f, a, b, 8192, "mid");
    const report = bracketReport(EX_DRIVE, a, b, 4, value);
    expect(report.straddles).toBe(true);
    expect(report.guaranteed).toBe(false);
  });

  it("grants the guarantee on a monotone STRETCH of a turning rate", () => {
    // The same trace, restricted to where it only rises.
    const value = riemannSum(EX_DRIVE.f, 0, 2.5, 8192, "mid");
    const report = bracketReport(EX_DRIVE, 0, 2.5, 6, value);
    expect(report.guaranteed).toBe(true);
    expect(report.straddles).toBe(true);
  });
});

describe("the running total", () => {
  it("agrees with the partial sums at every partition point", () => {
    const [a, b] = EX_DRIVE.domain;
    const n = 12;
    const totals = runningTotal(EX_DRIVE.f, a, b, n, "mid");
    const points = partitionPoints(a, b, n);
    expect(totals).toHaveLength(points.length);
    for (let i = 0; i < points.length; i += 1) {
      expect(totals[i]!.x, `point ${i}`).toBeCloseTo(points[i]!, 12);
      // Each entry must be the sum of the contributions up to that point,
      // computed independently here rather than read back from the function.
      let acc = 0;
      for (let k = 0; k < i; k += 1) {
        const lo = points[k]!;
        const hi = points[k + 1]!;
        acc += EX_DRIVE.f((lo + hi) / 2) * (hi - lo);
      }
      expect(totals[i]!.total, `total ${i}`).toBeCloseTo(acc, 12);
    }
  });

  it("ends below its own maximum on the drive trace", () => {
    const [a, b] = EX_DRIVE.domain;
    const totals = runningTotal(EX_DRIVE.f, a, b, 512, "mid");
    const peak = Math.max(...totals.map((t) => t.total));
    const final = totals[totals.length - 1]!.total;
    expect(peak).toBeGreaterThan(0);
    expect(final).toBeLessThan(0);
    expect(final).toBeLessThan(peak);
  });

  it("never consults a declared antiderivative", () => {
    // `EX_DRIVE` declares one, and it agrees — which is exactly why the two
    // routes must stay separate. L4's corroboration is only evidence if L3's
    // number was produced without it.
    const [a, b] = EX_DRIVE.domain;
    const summed = riemannSum(EX_DRIVE.f, a, b, 40000, "mid");
    const shortcut = EX_DRIVE.antiderivative!(b) - EX_DRIVE.antiderivative!(a);
    expect(summed).toBeCloseTo(shortcut, 3);
  });
});

describe("units", () => {
  it("derives the accumulated unit from the declared axes", () => {
    expect(accumulatedUnits(EX_DRIVE)).toBe("m");
    expect(accumulatedUnits(EX_CURRENT)).toBe("C");
    expect(accumulatedUnits(EX_POWER)).toBe("J");
  });

  it("refuses to invent a unit for a fixture that declares none", () => {
    expect(() => accumulatedUnits(EX_PARABOLA)).toThrow(/declares no axis units/);
  });

  it("changes when the declared axes change", () => {
    const relabelled = { ...EX_DRIVE, units: { input: "s", output: "A", accumulated: "C" } };
    expect(accumulatedUnits(relabelled)).toBe("C");
    expect(accumulatedUnits(relabelled)).not.toBe(accumulatedUnits(EX_DRIVE));
  });
});

describe("refinementTable", () => {
  it("settles: successive changes shrink towards zero", () => {
    const rows = refinementTable(EX_PARABOLA.f, 0, 2, [1, 2, 4, 8, 16, 32, 64], "right");
    const steps = rows.slice(1).map((row, i) => Math.abs(row.sum - rows[i]!.sum));
    for (let i = 1; i < steps.length; i += 1) {
      expect(steps[i]!, `step ${i}`).toBeLessThan(steps[i - 1]!);
    }
    // Exactly, not approximately. Expanding the closed form,
    // S_n = (4/3)(2 + 3/n + 1/n²), so the overshoot above 8/3 is 4/n + 4/(3n²).
    for (const row of rows) {
      expect(row.sum - INT_X2_ON_0_2, `n = ${row.n}`).toBeCloseTo(
        4 / row.n + 4 / (3 * row.n * row.n),
        9,
      );
    }
  });
});

describe("the bracketing guarantee comes from certified data, not sampling", () => {
  it("licenses the guarantee only inside a declared monotone interval", () => {
    // The drive turns twice: up to t ≈ 2.663, down to t ≈ 8.761, up again after.
    // Inside any one declared interval the guarantee holds; across either turn it
    // does not, at any n. The second turn is the one that was missed on first
    // writing, so [3, 9] is here specifically because it looks safe and is not.
    const value = (lo: number, hi: number) =>
      riemannSum(EX_DRIVE.f, lo, hi, 8192, "mid");
    expect(bracketReport(EX_DRIVE, 0, 2.5, 8, value(0, 2.5)).guaranteed).toBe(true);
    expect(bracketReport(EX_DRIVE, 3, 8, 8, value(3, 8)).guaranteed).toBe(true);
    expect(bracketReport(EX_DRIVE, 9, 10, 8, value(9, 10)).guaranteed).toBe(true);
    expect(bracketReport(EX_DRIVE, 0, 10, 8, value(0, 10)).guaranteed).toBe(false);
    expect(bracketReport(EX_DRIVE, 2, 4, 8, value(2, 4)).guaranteed).toBe(false);
    expect(bracketReport(EX_DRIVE, 3, 9, 8, value(3, 9)).guaranteed).toBe(false);
  });

  it("refuses the guarantee for a fixture that certifies nothing", () => {
    // `ex-non-monotone` declares an EMPTY interval list, which is a claim; a
    // fixture with no list at all is merely uncertified. Both must come back
    // false, and for the same reason: nothing licenses the bracket.
    const [a, b] = EX_NON_MONOTONE.domain;
    const v = riemannSum(EX_NON_MONOTONE.f, a, b, 4096, "mid");
    expect(bracketReport(EX_NON_MONOTONE, a, b, 8, v).guaranteed).toBe(false);

    const uncertified = { ...EX_PARABOLA, monotoneIntervals: undefined };
    expect(bracketReport(uncertified, 0, 2, 8, 8 / 3).guaranteed).toBe(false);
    // …even though the same interval IS certified on the real fixture.
    expect(bracketReport(EX_PARABOLA, 0, 2, 8, 8 / 3).guaranteed).toBe(true);
  });

  it("does not let a sampled observation stand in for the guarantee", () => {
    // A fixture with a turn narrower than the sampling spacing. `looksMonotoneOn`
    // is fooled — which is the point, and why it may not license anything. The
    // guarantee is unaffected, because it never consults the samples.
    // The centre is deliberately off every coarse grid line — 0.5001 is not, and
    // a 16-sample sweep landed on it, which would have made this test pass for
    // the wrong reason.
    const spike = (x: number) => (Math.abs(x - 0.53137) < 1e-5 ? -5 : x);
    expect(looksMonotoneOn(spike, 0, 1, 16)).toBe(true);
    expect(looksMonotoneOn(spike, 0, 1, 400000)).toBe(false);

    const fixture = {
      ...EX_PARABOLA,
      id: "test-spike",
      f: spike,
      domain: [0, 1] as const,
      monotoneIntervals: undefined,
    };
    expect(bracketReport(fixture, 0, 1, 8, 0.5).guaranteed).toBe(false);
  });
});

describe("slopeAt", () => {
  it("reports the two one-sided slopes at a declared corner, never a number", () => {
    // The defect this exists to make unrepresentable: the symmetric difference
    // quotient reports 0 at |x|'s vertex, and that 0 was drawn as a tangent.
    expect(numericDerivative(EX_ABS.f, 0)).toBeCloseTo(0, 9);

    const here = slopeAt(EX_ABS, 0);
    expect(here.kind).toBe("corner");
    if (here.kind !== "corner") throw new Error("unreachable");
    expect(here.left).toBeCloseTo(-1, 3);
    expect(here.right).toBeCloseTo(1, 3);
  });

  it("reports a slope away from the corner, on both sides", () => {
    for (const [x, expected] of [
      [-1, -1],
      [-0.5, -1],
      [0.5, 1],
      [1.5, 1],
    ] as const) {
      const here = slopeAt(EX_ABS, x);
      expect(here.kind, `x = ${x}`).toBe("differentiable");
      if (here.kind !== "differentiable") throw new Error("unreachable");
      expect(here.slope, `x = ${x}`).toBeCloseTo(expected, 3);
    }
  });

  it("prefers the fixture's declared derivative where there is one", () => {
    const here = slopeAt(EX_PARABOLA, 1.4);
    expect(here.kind).toBe("differentiable");
    if (here.kind !== "differentiable") throw new Error("unreachable");
    expect(here.slope).toBe(EX_PARABOLA.derivative!(1.4));
  });
});
