/* Scratch review probes — ADR-008 fresh package review. DELETE before finishing. */
import { describe, expect, it } from "vitest";
import { gradeExercise } from "../grading";
import { getGradingCapability } from "../capabilities";
import { substitutionPartsLesson } from "../substitutionParts";
import { differentiatesToTarget } from "../../math";
import type { ExerciseDefinition } from "../types";

const byId = new Map(substitutionPartsLesson.exercises!.map((e) => [e.id, e]));
const item = (id: string): ExerciseDefinition => byId.get(id)!;

function grade(id: string, source: string) {
  const exercise = item(id);
  const cap = getGradingCapability(exercise);
  const parsed = cap.parseAnswer({ source });
  return gradeExercise(exercise, parsed);
}

/** Reproduce the sampler exactly to locate gaps. */
function samplePoints(lo: number, hi: number, count = 40, margin = 4e-5): number[] {
  const points: number[] = [];
  const innerLo = lo + margin;
  const innerHi = hi - margin;
  let state = 48271 >>> 0;
  for (let i = 0; i < count; i += 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    points.push(innerLo + (innerHi - innerLo) * (state / 0x100000000));
  }
  return points.sort((a, b) => a - b);
}

describe("probe: sampler gaps on each item domain", () => {
  it("prints the largest inter-sample gaps", () => {
    const domains: Array<[string, number, number]> = [
      ["sub fresh", 0.2, 1.5],
      ["parts fresh", 0, 1.5],
      ["half const", 0.1, 1.2],
      ["x cos x", 0, 3],
      ["ln", 0.5, 3],
      ["cyclic", 0, 2],
    ];
    for (const [name, lo, hi] of domains) {
      const pts = samplePoints(lo, hi);
      let best = { gapLo: lo, gapHi: pts[0]!, width: pts[0]! - lo };
      for (let i = 0; i + 1 < pts.length; i += 1) {
        const w = pts[i + 1]! - pts[i]!;
        if (w > best.width) best = { gapLo: pts[i]!, gapHi: pts[i + 1]!, width: w };
      }
      const endGap = hi - pts[pts.length - 1]!;
      if (endGap > best.width) best = { gapLo: pts[pts.length - 1]!, gapHi: hi, width: endGap };
      console.log(name, "largest gap", best.gapLo.toFixed(5), "→", best.gapHi.toFixed(5), "width", best.width.toFixed(5));
    }
    expect(true).toBe(true);
  });
});

describe("probe: plausible learner answers not in any battery", () => {
  const cases: Array<[string, string, string]> = [
    // canonical +C habit — the prompt says "any correct member of the +C family is accepted"
    ["sp-substitute-basic", "sin(x^3) + C", "literal +C"],
    ["sp-ln-parts", "x ln(x) - x + C", "literal +C on ln item"],
    // absolute-value antiderivative habit
    ["sp-ln-parts", "x ln(abs(x)) - x", "ln(abs())"],
    ["sp-ln-parts", "x*ln|x| - x", "pipe absolute value"],
    // identity rewrites of correct answers
    ["sp-ln-parts", "ln(x^x) - x", "log-power rewrite"],
    ["sp-cyclic-produce", "exp(x) sin(x - pi/4) / sqrt(2)", "phase-shift trig rewrite"],
    ["sp-cyclic-produce", "e^x (sin(x) - cos(x))/2", "e^x spelling"],
    ["sp-parts-fresh", "x sin(x) + 1 - 2 sin(x/2)^2", "half-angle rewrite of cos"],
  ];
  for (const [id, source, label] of cases) {
    it(`${id}: ${label} → ?`, () => {
      const result = grade(id, source);
      console.log(`[${id}] ${label} :: "${source}" → correct=${result.correct} :: ${result.feedback.slice(0, 160)}`);
      expect(true).toBe(true);
    });
  }
});

describe("attack: differentiatesToTarget false accepts", () => {
  it("tolerance floor: slope-5e-5 linear term added to a correct answer", () => {
    const v = differentiatesToTarget("sin(x^3) + x/20000", "3x^2 cos(x^3)", { domain: [0.2, 1.5] });
    console.log("linear-slip verdict:", v.kind);
  });

  it("ramp hidden in a sampler gap grades as an antiderivative", () => {
    // domain [0,3] (sp-parts-fresh). Build ramp confined to the largest gap:
    const pts = samplePoints(0, 3);
    let gapLo = 0;
    let gapHi = pts[0]!;
    let width = pts[0]! - 0;
    for (let i = 0; i + 1 < pts.length; i += 1) {
      const w = pts[i + 1]! - pts[i]!;
      if (w > width) {
        width = w;
        gapLo = pts[i]!;
        gapHi = pts[i + 1]!;
      }
    }
    const c1 = gapLo + width * 0.25;
    const c2 = gapLo + width * 0.75;
    const ramp = `50*((abs(x - ${c1.toFixed(6)}) + (x - ${c1.toFixed(6)}))/2 - (abs(x - ${c2.toFixed(6)}) + (x - ${c2.toFixed(6)}))/2)`;
    const candidate = `x sin(x) + cos(x) + ${ramp}`;
    console.log("gap:", gapLo.toFixed(5), "→", gapHi.toFixed(5), "kinks at", c1.toFixed(5), c2.toFixed(5));
    const v = differentiatesToTarget(candidate, "x cos(x)", { domain: [0, 3] });
    console.log("ramp verdict:", JSON.stringify(v));
    // and through the real item grader:
    const result = grade("sp-parts-fresh", candidate);
    console.log("real grader on ramp candidate: correct =", result.correct);
  });
});

describe("attack: false rejects of correct answers", () => {
  const cases: Array<[string, string]> = [
    ["sp-half-constant", "exp(x^2)/2 + 0"],
    ["sp-cyclic-produce", "(exp(x)/2)(sin(x) - cos(x))"],
    ["sp-parts-xexp", "exp(2x)(2x - 1)/4"],
  ];
  for (const [id, source] of cases) {
    it(`${id}: "${source}"`, () => {
      const result = grade(id, source);
      console.log(`[${id}] "${source}" → correct=${result.correct} :: ${result.feedback.slice(0, 120)}`);
      expect(true).toBe(true);
    });
  }
});
