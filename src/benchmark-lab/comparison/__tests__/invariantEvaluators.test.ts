import { describe, expect, it } from "vitest";
import { getBenchmarkManifest } from "../../manifests";
import type { ProbeSample } from "../../probes/probeRegistry";
import { INVARIANT_EVALUATORS, checkInvariants } from "../invariantEvaluators";
import type { BenchmarkRun, FrameSample } from "../types";

/**
 * Invariant evaluators over synthetic runs: each test fabricates the exact
 * probe pattern that should pass or fail, so the math-validity gates are
 * falsifiable without a browser.
 */

const sample = (
  x: number,
  y: number,
  opacity = 1,
  extra: Partial<ProbeSample> = {},
): ProbeSample => ({ x, y, opacity, ...extra });

function emptyRun(benchmarkId: string): BenchmarkRun {
  return {
    benchmarkId,
    fps: 30,
    stride: 3,
    durationFrames: 0,
    frames: [],
    events: {},
    beatEndSamples: {},
    seekRecords: [],
    overruns: [],
  };
}

function frameAt(time: number, samples: Record<string, ProbeSample>): FrameSample {
  return { frame: Math.round(time * 30), time, samples };
}

describe("eigen evaluators", () => {
  const manifest = getBenchmarkManifest("eigen-span-stretch");
  const table = INVARIANT_EVALUATORS["eigen-span-stretch"]!;

  it("eigen-directions-match-math holds for the committed matrix", () => {
    expect(table["eigen-directions-match-math"]!(manifest, emptyRun(manifest.id)).passed).toBe(true);
  });

  it("span-lines-static flags a drifting span", () => {
    const run = emptyRun(manifest.id);
    // stay-on-span occupies replica [0, 12.1).
    run.frames = [
      frameAt(4, { "span-diag": sample(200, -200) }),
      frameAt(5, { "span-diag": sample(212, -200) }),
    ];
    const result = table["span-lines-static-during-transform"]!(manifest, run);
    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/drifted|moved/);
  });

  it("eigenvectors-stay-on-span flags a tip arcing off the line", () => {
    const run = emptyRun(manifest.id);
    run.frames = [frameAt(4, { "vec-diag": sample(100, 80) })]; // off y=x
    const result = table["eigenvectors-stay-on-span"]!(manifest, run);
    expect(result.passed).toBe(false);
    // and passes on the line
    run.frames = [frameAt(4, { "vec-diag": sample(100, 100) })];
    expect(table["eigenvectors-stay-on-span"]!(manifest, run).passed).toBe(true);
  });

  it("tips-match-matrix compares farthest reach against A*v", () => {
    const run = emptyRun(manifest.id);
    // |A*(1,-1)| = |(2,-2)| = 2.828 units -> about 181 px.
    run.frames = [frameAt(4, { "vec-diag": sample(128, 128) })];
    expect(table["tips-match-matrix"]!(manifest, run).passed).toBe(true);
    // Undershoot the retained diagonal-vector stretch: fails.
    run.frames[0] = frameAt(4, { "vec-diag": sample(100, 100) });
    const bad = table["tips-match-matrix"]!(manifest, run);
    expect(bad.passed).toBe(false);
    expect(bad.message).toMatch(/misses A\*v/);
  });

  it("label-scale-prefix-truthful flags a premature 2x prefix", () => {
    const extended = structuredClone(manifest);
    extended.beats.push({
      ...manifest.beats[0]!,
      id: "sneaky-vector",
      refStart: 158.5,
      refEnd: 169,
    });
    const run = emptyRun(manifest.id);
    run.frames = [
      frameAt(43, {
        "label-sneaky": sample(-80, -80, 1, { text: "2x[-1,1]" }),
        "vec-sneaky": sample(-64, -64),
      }),
    ];
    expect(table["label-scale-prefix-truthful"]!(extended, run).passed).toBe(false);
    run.frames = [
      frameAt(43, {
        "label-sneaky": sample(-80, -80, 1, { text: "2x[-1,1]" }),
        "vec-sneaky": sample(-128, -128),
      }),
    ];
    expect(table["label-scale-prefix-truthful"]!(extended, run).passed).toBe(true);
  });
});

describe("huffman evaluators", () => {
  const manifest = getBenchmarkManifest("huffman-merge");
  const table = INVARIANT_EVALUATORS["huffman-merge"]!;

  it("parent-sum-conservation catches a stale displayed value", () => {
    const run = emptyRun(manifest.id);
    run.frames = [
      frameAt(46, {
        "leaf-D": sample(67, 197, 1, { value: 0.15 }),
        "leaf-E": sample(202, 197, 1, { value: 0.16 }),
        "leaf-A": sample(-203, 197, 1, { value: 0.17 }),
        "leaf-C": sample(-68, 197, 1, { value: 0.17 }),
        "parent-DE": sample(135, 67, 1, { value: 0.31 }),
        "parent-AC": sample(-135, 67, 1, { value: 0.34 }),
        "root-065": sample(0, -68, 1, { value: 0.65 }),
      }),
    ];
    expect(table["parent-sum-conservation"]!(manifest, run).passed).toBe(true);
    run.frames[0]!.samples["parent-DE"] = sample(135, 67, 1, { value: 0.3 });
    expect(table["parent-sum-conservation"]!(manifest, run).passed).toBe(false);
  });

  it("frontier-sorted catches an out-of-order column", () => {
    const run = emptyRun(manifest.id);
    run.beatEndSamples = {
      "merge-DE": {
        "leaf-A": sample(-338, -172, 1, { value: 0.17 }),
        "leaf-C": sample(-338, -84, 1, { value: 0.17 }),
        "token-DE": sample(-338, 4, 1, { value: 0.31 }),
        "leaf-B": sample(-338, 92, 1, { value: 0.35 }),
      },
    };
    expect(table["frontier-sorted"]!(manifest, run).passed).toBe(true);
    run.beatEndSamples["merge-DE"]!["leaf-B"] = sample(-338, -20, 1, {
      value: 0.35,
    });
    expect(table["frontier-sorted"]!(manifest, run).passed).toBe(false);
  });

  it("placed-subtrees-never-move flags drift after placement", () => {
    const extended = structuredClone(manifest);
    extended.invariants.push({
      id: "placed-subtrees-never-move",
      description: "fixture",
      beats: ["merge-DE"],
    });
    const run = emptyRun(manifest.id);
    run.frames = [
      frameAt(6, { "leaf-D": sample(67, 197) }),
      frameAt(8, { "leaf-D": sample(80, 197) }),
    ];
    expect(table["placed-subtrees-never-move"]!(extended, run).passed).toBe(false);
  });
});

describe("ab evaluators", () => {
  const manifest = getBenchmarkManifest("ab-split");
  const table = INVARIANT_EVALUATORS["ab-split"]!;

  it("keys-sorted-left-to-right flags a crossing", () => {
    const run = emptyRun(manifest.id);
    run.beatEndSamples = {
      "split-rise": {
        "key-4": sample(0, 87, 1, { value: 4, text: "4" }),
        "key-5": sample(-40, -1, 1, { value: 5, text: "5" }),
      },
    };
    expect(table["keys-sorted-left-to-right"]!(manifest, run).passed).toBe(false);
    run.beatEndSamples["split-rise"]!["key-5"] = sample(40, -1, 1, {
      value: 5,
      text: "5",
    });
    expect(table["keys-sorted-left-to-right"]!(manifest, run).passed).toBe(true);
  });

  it("leaf-row-height-constant flags a drifting leaf row", () => {
    const run = emptyRun(manifest.id);
    // The focused split occupies replica [0, 7.3).
    run.frames = [frameAt(2, { "leaf-row": sample(-280, 190) })];
    expect(table["leaf-row-height-constant"]!(manifest, run).passed).toBe(false);
    run.frames = [frameAt(2, { "leaf-row": sample(-280, 175) })];
    expect(table["leaf-row-height-constant"]!(manifest, run).passed).toBe(true);
  });

  it("keys-persist-through-split flags a fading key", () => {
    const run = emptyRun(manifest.id);
    // The focused split occupies replica [0, 7.3).
    run.frames = [
      frameAt(1, { "key-5": sample(0, 87, 1) }),
      frameAt(2, { "key-5": sample(0, 40, 0) }),
    ];
    expect(table["keys-persist-through-split"]!(manifest, run).passed).toBe(false);
  });
});

describe("bfs evaluators", () => {
  const manifest = getBenchmarkManifest("bfs-frontier");
  const table = INVARIANT_EVALUATORS["bfs-frontier"]!;

  it("vertex-positions-frozen flags a moved vertex", () => {
    const run = emptyRun(manifest.id);
    run.frames = [
      frameAt(3.5, { "vertex-0": sample(-288, -210) }),
      frameAt(4.5, { "vertex-0": sample(-280, -210) }),
    ];
    expect(table["vertex-positions-frozen"]!(manifest, run).passed).toBe(false);
  });

  it("numbers-match-bfs-order verifies displayed numbers", () => {
    const run = emptyRun(manifest.id);
    run.frames = [
      frameAt(16, {
        "vertex-0": sample(-288, -210, 1, { text: "0" }),
        "vertex-4": sample(-144, -130, 1, { text: "4" }),
      }),
    ];
    expect(table["numbers-match-bfs-order"]!(manifest, run).passed).toBe(true);
    run.frames[0]!.samples["vertex-4"] = sample(-144, -130, 1, { text: "7" });
    expect(table["numbers-match-bfs-order"]!(manifest, run).passed).toBe(false);
  });

  it("done-never-regresses flags a green vertex reverting", () => {
    const run = emptyRun(manifest.id);
    run.frames = [
      frameAt(4.5, { "vertex-0": sample(-288, -210, 1, { value: 2 }) }),
      frameAt(6.5, { "vertex-0": sample(-288, -210, 1, { value: 1 }) }),
    ];
    expect(table["done-never-regresses"]!(manifest, run).passed).toBe(false);
  });

  it("tracer-agrees-with-state requires the tracer at the absorb line", () => {
    const run = emptyRun(manifest.id);
    const LINE_Y = -212 + 37 * 4;
    run.frames = [
      frameAt(3.5, {
        "vertex-0": sample(-288, -210, 1, { value: 1 }),
        tracer: sample(28, LINE_Y - 74),
      }),
      frameAt(3.9, {
        "vertex-0": sample(-288, -210, 1, { value: 2 }),
        tracer: sample(28, LINE_Y),
      }),
    ];
    expect(table["tracer-agrees-with-state"]!(manifest, run).passed).toBe(true);
    run.frames[1] = frameAt(3.9, {
      "vertex-0": sample(-288, -210, 1, { value: 2 }),
      tracer: sample(28, LINE_Y - 74),
    });
    expect(table["tracer-agrees-with-state"]!(manifest, run).passed).toBe(false);
  });
});

describe("checkInvariants wrapper", () => {
  it("hard-fails a declared invariant with no evaluator", () => {
    const manifest = structuredClone(getBenchmarkManifest("bfs-frontier"));
    manifest.invariants.push({ id: "made-up", description: "d", beats: [] });
    const results = checkInvariants(manifest, emptyRun(manifest.id));
    const missing = results.find((r) => r.id === "invariant:made-up")!;
    expect(missing.passed).toBe(false);
    expect(missing.severity).toBe("hard");
  });
});
