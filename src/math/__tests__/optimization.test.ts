import { describe, expect, it } from "vitest";
import {
  NO_DISAGREEMENT_IN_DOMAIN,
  OPTIMIZATION_FIXTURES,
  OPT_ABS,
  OPT_CONSTANT,
  OPT_CUBIC_SURVIVOR,
  OPT_DECAY,
  OPT_DRIVE,
  OPT_LINEAR,
  OPT_MAIN_CUBIC,
  OPT_NEG_QUARTIC,
  OPT_OPEN_INTERVAL,
  OPT_QUARTIC,
  assertOptimizationFixturesAreConsistent,
  candidateSet,
  certifiedRadius,
  classifyStationaryPoint,
  denseScanExtremes,
  existenceGuaranteed,
  firstSampledDisagreement,
  globalExtrema,
  linearize,
  linearizationErrorBound,
  trustRadius,
} from "../optimization";

/**
 * `optimization-approximation`'s correctness layer (spine L6). Each block
 * corresponds to one of the seven required property tests in
 * `docs/courses/applied-mathematics/lessons/06-optimization-approximation/mastery-contract.md`
 * §1g and the lesson plan's "Mathematical invariants to assert" — a failure
 * here points at a specific learner-facing claim.
 */

describe("fixtures", () => {
  it("passes its own render-time consistency guard", () => {
    expect(() => assertOptimizationFixturesAreConsistent()).not.toThrow();
  });

  it("has a unique id per fixture", () => {
    const ids = OPTIMIZATION_FIXTURES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("candidate set — reduction, never a claimed finite list in general", () => {
  it("reduces the main cubic to exactly its two stationary points plus both endpoints", () => {
    const result = candidateSet(OPT_MAIN_CUBIC);
    expect(result.kind).toBe("finite");
    if (result.kind !== "finite") throw new Error("unreachable");
    const xs = result.points.map((p) => p.x).sort((a, b) => a - b);
    expect(xs).toEqual([-2, -1, 1, 3]);
    const kinds = new Map(result.points.map((p) => [p.x, p.kind]));
    expect(kinds.get(-2)).toBe("endpoint");
    expect(kinds.get(-1)).toBe("stationary");
    expect(kinds.get(1)).toBe("stationary");
    expect(kinds.get(3)).toBe("endpoint");
  });

  it("admits |x|'s minimum as a SINGULAR candidate, not a stationary one", () => {
    const result = candidateSet(OPT_ABS);
    expect(result.kind).toBe("finite");
    if (result.kind !== "finite") throw new Error("unreachable");
    const zero = result.points.find((p) => p.x === 0);
    expect(zero?.kind).toBe("singular");
  });

  it("reports a constant function as NOT a finite reduction — the degenerate case must not be papered over", () => {
    const result = candidateSet(OPT_CONSTANT);
    expect(result.kind).toBe("not-finite");
  });

  it("reports an empty candidate set on the open interval — no eligible endpoint, no stationary point", () => {
    const result = candidateSet(OPT_OPEN_INTERVAL);
    expect(result.kind).toBe("finite");
    if (result.kind !== "finite") throw new Error("unreachable");
    expect(result.points).toHaveLength(0);
  });
});

describe("existence guarantee — EVT's hypothesis, checked honestly", () => {
  it("is true for every closed-domain fixture", () => {
    expect(existenceGuaranteed(OPT_MAIN_CUBIC)).toBe(true);
    expect(existenceGuaranteed(OPT_ABS)).toBe(true);
  });

  it("is false for the open-interval fixture", () => {
    expect(existenceGuaranteed(OPT_OPEN_INTERVAL)).toBe(false);
  });
});

describe("global extrema — the three jobs run together, honestly on failure", () => {
  it("finds the main cubic's global max at the ENDPOINT despite an interior local max, and a tied minimum", () => {
    const result = globalExtrema(OPT_MAIN_CUBIC);
    expect(result.existenceGuaranteed).toBe(true);
    expect(result.max?.value).toBeCloseTo(18, 9);
    expect(result.max?.at).toEqual([3]);
    expect(result.min?.value).toBeCloseTo(-2, 9);
    expect(new Set(result.min?.at)).toEqual(new Set([-2, 1]));
  });

  it("reports no conclusion for the open interval — no existence guarantee, empty candidates", () => {
    const result = globalExtrema(OPT_OPEN_INTERVAL);
    expect(result.existenceGuaranteed).toBe(false);
    expect(result.max).toBeUndefined();
    expect(result.min).toBeUndefined();
  });

  it("reports no conclusion for the constant function — candidates are not finite", () => {
    const result = globalExtrema(OPT_CONSTANT);
    expect(result.candidates.kind).toBe("not-finite");
    expect(result.max).toBeUndefined();
  });

  it("puts the decay fixture's extremes entirely at the endpoints — monotone decreasing", () => {
    const result = globalExtrema(OPT_DECAY);
    expect(result.max?.at).toEqual([0]);
    expect(result.min?.at).toEqual([8]);
  });
});

describe("dense scanning is corroboration ONLY, never the completeness oracle", () => {
  it("a dense scan's argmax/argmin lies within tolerance of a declared candidate, for every fixture with a finite candidate set", () => {
    for (const fixture of OPTIMIZATION_FIXTURES) {
      const candidates = candidateSet(fixture);
      if (candidates.kind !== "finite" || candidates.points.length === 0) continue;
      if (!existenceGuaranteed(fixture)) continue;
      const scan = denseScanExtremes(fixture);
      const declaredValues = candidates.points.map((p) => p.value);
      const maxDeclared = Math.max(...declaredValues);
      const minDeclared = Math.min(...declaredValues);
      expect(
        Math.abs(fixture.f(scan.argmax) - maxDeclared),
        `${fixture.id}: scan argmax value disagrees with declared candidate max`,
      ).toBeLessThan(1e-2);
      expect(
        Math.abs(fixture.f(scan.argmin) - minDeclared),
        `${fixture.id}: scan argmin value disagrees with declared candidate min`,
      ).toBeLessThan(1e-2);
    }
  });
});

describe("second-derivative classification, including its own silence", () => {
  it("classifies the main cubic's two stationary points correctly", () => {
    expect(classifyStationaryPoint(OPT_MAIN_CUBIC, -1)).toBe("local-max");
    expect(classifyStationaryPoint(OPT_MAIN_CUBIC, 1)).toBe("local-min");
  });

  it("returns silent for x⁴, −x⁴, and x³ at their common stationary point — the test's own honest failure", () => {
    expect(classifyStationaryPoint(OPT_QUARTIC, 0)).toBe("silent");
    expect(classifyStationaryPoint(OPT_NEG_QUARTIC, 0)).toBe("silent");
    expect(classifyStationaryPoint(OPT_CUBIC_SURVIVOR, 0)).toBe("silent");
  });

  it("never guesses a verdict when derivative2 is unavailable", () => {
    expect(classifyStationaryPoint(OPT_ABS, 0)).toBe("silent");
  });
});

describe("certified radius — sufficient, never claimed maximal", () => {
  it("is genuinely sufficient: the sign of the change matches the sign of f'(a)h for every sampled 0 < |h| < delta", () => {
    for (const fixture of OPTIMIZATION_FIXTURES) {
      if (fixture.allPointsStationary) continue;
      const candidates = candidateSet(fixture);
      const stationary = new Set(
        candidates.kind === "finite"
          ? candidates.points.filter((p) => p.kind === "stationary").map((p) => p.x)
          : [],
      );
      const [lo, hi] = fixture.domain;
      for (let i = 1; i < 10; i += 1) {
        const a = lo + ((hi - lo) * i) / 10;
        if (!fixture.secondDerivativeBound) continue;
        if (Math.abs(fixture.derivative(a)) < 1e-6) continue;
        if ([...stationary].some((s) => Math.abs(s - a) < 1e-6)) continue;
        const delta = certifiedRadius(fixture, a);
        const m = fixture.derivative(a);
        const samples = 30;
        for (let k = 1; k <= samples; k += 1) {
          const h = Number.isFinite(delta) ? (delta * k) / (samples + 1) : (0.5 * k) / samples;
          for (const signedH of [h, -h]) {
            if (a + signedH < lo || a + signedH > hi) continue;
            const change = fixture.f(a + signedH) - fixture.f(a);
            const predicted = Math.sign(m * signedH);
            const actual = Math.sign(change);
            if (actual === 0) continue;
            expect(
              actual,
              `${fixture.id} at a=${a}, h=${signedH}: certified radius ${delta} violated`,
            ).toBe(predicted);
          }
        }
      }
    }
  });

  it("does NOT imply maximality — the escape-route sign can also agree well beyond the certified radius", () => {
    // Not a contradiction to prove; a demonstration that the radius is not
    // being silently treated as an equality anywhere in this module. Pick a
    // point on the main cubic where the certified radius is modest, and show
    // agreement persists at a larger step too.
    const a = -2;
    const delta = certifiedRadius(OPT_MAIN_CUBIC, a);
    const beyond = delta * 3;
    if (a + beyond <= OPT_MAIN_CUBIC.domain[1]) {
      const m = OPT_MAIN_CUBIC.derivative(a);
      const change = OPT_MAIN_CUBIC.f(a + beyond) - OPT_MAIN_CUBIC.f(a);
      expect(Math.sign(change)).toBe(Math.sign(m * beyond));
    }
  });

  it("is Infinity for a linear fixture — the residual is identically zero, so nothing ever disagrees", () => {
    expect(certifiedRadius(OPT_LINEAR, 1)).toBe(Infinity);
  });

  it("throws rather than fabricating a radius at a stationary point", () => {
    expect(() => certifiedRadius(OPT_MAIN_CUBIC, -1)).toThrow();
  });
});

describe("first sampled disagreement — a distinct, purely observational report", () => {
  it("finds a real disagreement on the main cubic near a = 0 (a nonlinear fixture with real curvature)", () => {
    const result = firstSampledDisagreement(OPT_MAIN_CUBIC, 0, { maxRadius: 1.9 });
    expect(result.kind).toBe("found");
  });

  it("reports NO_DISAGREEMENT_IN_DOMAIN for a linear fixture — never a fabricated observation", () => {
    const result = firstSampledDisagreement(OPT_LINEAR, 1);
    expect(result.kind).toBe(NO_DISAGREEMENT_IN_DOMAIN);
  });

  it("is a genuinely separate report from the certified radius — the two may disagree", () => {
    const a = 0;
    const delta = certifiedRadius(OPT_MAIN_CUBIC, a);
    const observed = firstSampledDisagreement(OPT_MAIN_CUBIC, a, { maxRadius: 1.9 });
    expect(observed.kind).toBe("found");
    if (observed.kind === "found") {
      // The certified radius is provably sufficient and therefore must be no
      // larger than where agreement is actually observed to fail — the two
      // numbers are computed by entirely different routes and are not
      // required to (and in general will not) coincide.
      expect(delta).toBeLessThanOrEqual(Math.abs(observed.h) + 1e-9);
    }
  });
});

describe("linearization error bound — not violated, and not vacuous", () => {
  it("the true error never exceeds the declared bound, on a dense sample of h", () => {
    for (const fixture of OPTIMIZATION_FIXTURES) {
      if (!fixture.secondDerivativeBound) continue;
      const [lo, hi] = fixture.domain;
      const a = lo + (hi - lo) * 0.4;
      for (let i = 1; i <= 20; i += 1) {
        const h = ((hi - lo) * 0.3 * i) / 20;
        if (a + h > hi || a - h < lo) continue;
        for (const signedH of [h, -h]) {
          const { trueError, bound } = linearize(fixture, a, signedH);
          expect(
            trueError,
            `${fixture.id} at a=${a}, h=${signedH}: true error exceeds declared bound`,
          ).toBeLessThanOrEqual(bound + 1e-9);
        }
      }
    }
  });

  it("is not vacuous on the decay fixture — matches the hand-derived bound in insight.md §7", () => {
    // f(t) = e^{-t/1.5}, a = 0: M = 1/1.5^2 = 4/9, trust radius for epsilon =
    // 1e-2 is sqrt(2*0.01/(4/9)) ≈ 0.2121 — the exact number insight.md's
    // worked derivation reaches and verifies numerically.
    const radius = trustRadius(OPT_DECAY, 0, 1e-2);
    expect(radius).toBeCloseTo(0.21213, 4);
    const { trueError, bound } = linearize(OPT_DECAY, 0, radius);
    expect(trueError).toBeLessThanOrEqual(1e-2 + 1e-9);
    expect(bound).toBeLessThanOrEqual(1e-2 + 1e-9);
    // Not vacuous: the bound is within an order of magnitude of the true error.
    expect(bound / Math.max(trueError, 1e-12)).toBeLessThan(10);
  });

  it("linearizationErrorBound matches insight.md's hand-checked bound at t = 0.2121 for the decay fixture", () => {
    const bound = linearizationErrorBound(OPT_DECAY, 0, 0.2121);
    // (4/9)/2 * 0.2121^2 ≈ 0.010001
    expect(bound).toBeCloseTo((4 / 9 / 2) * 0.2121 * 0.2121, 6);
  });

  it("trustRadius(OPT_QUARTIC, 0, 0.01) matches the hand-solved 6r^4 = epsilon regression, not the ~10^19-error value the earlier fixed-point iteration returned", () => {
    // f(x) = x^4, secondDerivativeBound(0, r) = 12r^2 (a = 0 exactly, so
    // |center|=0). errorBoundAt(r) = (12r^2/2) r^2 = 6 r^4. Solving
    // 6 r^4 = 0.01 gives r = (0.01/6)^(1/4).
    const expected = Math.pow(0.01 / 6, 1 / 4);
    const radius = trustRadius(OPT_QUARTIC, 0, 0.01);
    expect(radius).toBeCloseTo(expected, 6);
    expect(radius).toBeCloseTo(0.20205, 4);
    const bound = linearizationErrorBound(OPT_QUARTIC, 0, radius);
    expect(bound).toBeLessThanOrEqual(0.01 + 1e-9);
    // Not vacuous: at a flat point (f''(0) = 0), the returned radius must be
    // the genuine root of the quartic error growth, not an artifact of the
    // broken iteration — which returned a radius whose own declared bound
    // was on the order of 10^19.
    expect(bound).toBeGreaterThan(0.001);
  });

  it("trustRadius stays within epsilon and is not vacuously small, across every fixture and several points", () => {
    for (const fixture of OPTIMIZATION_FIXTURES) {
      if (!fixture.secondDerivativeBound) continue;
      const [lo, hi] = fixture.domain;
      for (const frac of [0.15, 0.4, 0.5, 0.65, 0.85]) {
        const a = lo + (hi - lo) * frac;
        const epsilon = 0.01;
        const radius = trustRadius(fixture, a, epsilon);
        if (!Number.isFinite(radius)) {
          // Only licensed when the curvature bound is genuinely zero
          // everywhere reachable (linear/constant fixtures).
          expect(fixture.secondDerivativeBound(a, 1e6)).toBeCloseTo(0, 9);
          continue;
        }
        expect(radius, `${fixture.id} at a=${a}`).toBeGreaterThan(0);
        const bound = linearizationErrorBound(fixture, a, radius);
        expect(
          bound,
          `${fixture.id} at a=${a}: trustRadius's own declared error bound exceeds epsilon`,
        ).toBeLessThanOrEqual(epsilon + 1e-9);
        // Not vacuous: bisection converged near the true boundary, not to a
        // radius orders of magnitude smaller than necessary.
        expect(
          bound,
          `${fixture.id} at a=${a}: bound is suspiciously far below epsilon — bisection may not have converged`,
        ).toBeGreaterThan(epsilon * 0.9);
      }
    }
  });
});

describe("the silence battery", () => {
  it("x⁴, −x⁴, and x³ all return silent at their shared stationary point, x = 0", () => {
    expect(classifyStationaryPoint(OPT_QUARTIC, 0)).toBe("silent");
    expect(classifyStationaryPoint(OPT_NEG_QUARTIC, 0)).toBe("silent");
    expect(classifyStationaryPoint(OPT_CUBIC_SURVIVOR, 0)).toBe("silent");
  });

  it("but they are not the same case underneath — x⁴ has a genuine min, −x⁴ a genuine max, x³ neither", () => {
    const dense = 0.01;
    expect(OPT_QUARTIC.f(dense)).toBeGreaterThan(OPT_QUARTIC.f(0));
    expect(OPT_QUARTIC.f(-dense)).toBeGreaterThan(OPT_QUARTIC.f(0));
    expect(OPT_NEG_QUARTIC.f(dense)).toBeLessThan(OPT_NEG_QUARTIC.f(0));
    expect(OPT_NEG_QUARTIC.f(-dense)).toBeLessThan(OPT_NEG_QUARTIC.f(0));
    expect(OPT_CUBIC_SURVIVOR.f(dense)).toBeGreaterThan(OPT_CUBIC_SURVIVOR.f(0));
    expect(OPT_CUBIC_SURVIVOR.f(-dense)).toBeLessThan(OPT_CUBIC_SURVIVOR.f(0));
  });
});

describe("constant and open-interval cases stay honest end to end", () => {
  it("the constant fixture never produces a fabricated finite candidate set anywhere in the pipeline", () => {
    expect(candidateSet(OPT_CONSTANT).kind).toBe("not-finite");
    expect(globalExtrema(OPT_CONSTANT).max).toBeUndefined();
  });

  it("the open-interval fixture withdraws the existence guarantee and returns no extrema", () => {
    expect(existenceGuaranteed(OPT_OPEN_INTERVAL)).toBe(false);
    const result = globalExtrema(OPT_OPEN_INTERVAL);
    expect(result.max).toBeUndefined();
    expect(result.min).toBeUndefined();
  });
});

describe("ex-drive reuse stays in sync with calculus.ts's own EX_DRIVE", () => {
  it("declares the same two turning points EX_DRIVE certifies", () => {
    const result = candidateSet(OPT_DRIVE);
    expect(result.kind).toBe("finite");
    if (result.kind !== "finite") throw new Error("unreachable");
    const stationary = result.points.filter((p) => p.kind === "stationary").map((p) => p.x);
    expect(stationary).toHaveLength(2);
    expect(stationary[0]).toBeCloseTo(Math.acos(0.35 / 3.3) / 0.55, 9);
    expect(stationary[1]).toBeCloseTo((2 * Math.PI - Math.acos(0.35 / 3.3)) / 0.55, 9);
  });
});
