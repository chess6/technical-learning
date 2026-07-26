import { describe, expect, it } from "vitest";
import type { BenchmarkManifest } from "../../manifests";
import type { ProbeSample } from "../../probes/probeRegistry";
import {
  checkBeatVisibility,
  checkCamera,
  checkContinuity,
  checkDuration,
  checkEventTimes,
  checkHoldDurations,
  checkLandmarks,
  checkOpacityReplacement,
  checkOverruns,
  checkSeekDeterminism,
  checkStageClipping,
  checkTextOcclusion,
} from "../checks";
import { buildMeasurementReport } from "../report";
import { summarize, type BenchmarkRun, type FrameSample } from "../types";

/**
 * Synthetic-fixture tests for every comparison calculation. The fixture
 * uses the current focused bfs-frontier source window and declares two beats,
 * one tracked vector, and one label. Fixture frame times are replica-relative.
 */

function fixtureManifest(): BenchmarkManifest {
  return {
    id: "bfs-frontier",
    title: "fixture",
    packDir: ".reference-sources/packs/mVzsz8Actrc",
    source: {
      repoSlug: "manim-js",
      repoUrl: "x",
      inspectedCommit: "c",
      videoId: "mVzsz8Actrc",
      videoTitle: "t",
      channel: "ch",
      sceneSources: [],
      license: "none",
    },
    pedagogicalPurpose: "fixture",
    beats: [
      {
        id: "b1",
        title: "one",
        refStart: 21.5,
        refEnd: 31.5,
        purpose: "p",
        visibleObjects: ["vec"],
        text: { kind: "none" },
        camera: { mode: "static" },
      },
      {
        id: "b2",
        title: "two",
        refStart: 31.5,
        refEnd: 38.5,
        purpose: "p",
        visibleObjects: ["vec", "note"],
        text: { kind: "temporary-annotation" },
        camera: { mode: "zoom-in", target: { x: 100, y: -50, scale: 1.5 } },
      },
    ],
    objects: [
      {
        id: "vec",
        kind: "vector",
        description: "d",
        persistsAcross: ["b1", "b2"],
        maxStepPx: 10,
      },
      {
        id: "note",
        kind: "label",
        description: "d",
        persistsAcross: ["b2"],
      },
    ],
    events: [
      { id: "e1", refTime: 23.5, description: "d", anchor: "transcript" },
      { id: "e2", refTime: 29.5, description: "d", anchor: "transcript" },
    ],
    landmarks: [
      {
        id: "vec-at-rest",
        objectId: "vec",
        beatId: "b1",
        x: 100,
        y: 0,
        evidence: { kind: "reference-frame", refTime: 29.5 },
      },
    ],
    invariants: [],
    transitions: [
      { refTime: 31.5, kind: "cut", objects: ["vec"] },
    ],
    tolerances: {
      eventTimeSec: 0.5,
      holdSec: 0.75,
      landmarkPx: 24,
      landmarkScaleRatio: 0.15,
      visibleOpacity: 0.05,
    },
    knownDeviations: [],
  };
}

const sample = (
  x: number,
  y: number,
  opacity = 1,
  extra: Partial<ProbeSample> = {},
): ProbeSample => ({ x, y, opacity, ...extra });

function frameAt(
  time: number,
  samples: Record<string, ProbeSample>,
): FrameSample {
  return { frame: Math.round(time * 30), time, samples };
}

function fixtureRun(overrides: Partial<BenchmarkRun> = {}): BenchmarkRun {
  const frames = [
    frameAt(0, { vec: sample(100, 0) }),
    frameAt(0.5, { vec: sample(101, 0) }),
    frameAt(9.9, { vec: sample(102, 0) }),
    frameAt(10.5, { vec: sample(160, 0), note: sample(300, 100) }),
    frameAt(16, { vec: sample(160, 0), note: sample(300, 100) }),
  ];
  return {
    benchmarkId: "bfs-frontier",
    fps: 30,
    stride: 3,
    durationFrames: 510,
    frames,
    events: { e1: 2.1, e2: 8.2 },
    beatEndSamples: {
      b1: { vec: sample(102, 0) },
      b2: {
        vec: sample(160, 0),
        note: sample(300, 100),
        "camera-rig": sample(100, -50, 1, { scale: 1.5 }),
      },
    },
    seekRecords: [
      {
        beatId: "b1",
        frame: 298,
        hashFromStart: "abc",
        hashFromEnd: "abc",
        samplesFromStart: { vec: sample(102, 0) },
        samplesFromEnd: { vec: sample(102, 0) },
      },
    ],
    overruns: [],
    ...overrides,
  };
}

describe("checkBeatVisibility", () => {
  it("passes when expected objects are visible at beat ends", () => {
    const results = checkBeatVisibility(fixtureManifest(), fixtureRun());
    expect(results.every((r) => r.passed)).toBe(true);
  });
  it("hard-fails an invisible expected object", () => {
    const run = fixtureRun();
    run.beatEndSamples.b2!.note = sample(300, 100, 0);
    const bad = checkBeatVisibility(fixtureManifest(), run).find(
      (r) => r.id === "beat-visibility:b2:note",
    )!;
    expect(bad.passed).toBe(false);
    expect(bad.severity).toBe("hard");
  });
});

describe("checkContinuity", () => {
  it("passes smooth motion and tolerates declared cuts", () => {
    const results = checkContinuity(fixtureManifest(), fixtureRun());
    expect(results.find((r) => r.id === "continuity:vec")!.passed).toBe(true);
  });
  it("flags a teleport not covered by a cut", () => {
    const run = fixtureRun();
    run.frames = [
      frameAt(1, { vec: sample(0, 0) }),
      frameAt(1.1, { vec: sample(400, 0) }),
    ];
    const result = checkContinuity(fixtureManifest(), run).find(
      (r) => r.id === "continuity:vec",
    )!;
    expect(result.passed).toBe(false);
    expect(result.severity).toBe("hard");
    expect(result.message).toMatch(/teleport/);
  });
  it("ignores steps while the object is invisible", () => {
    const run = fixtureRun();
    run.frames = [
      frameAt(1, { vec: sample(0, 0, 0) }),
      frameAt(1.1, { vec: sample(400, 0) }),
    ];
    expect(
      checkContinuity(fixtureManifest(), run).find((r) => r.id === "continuity:vec")!
        .passed,
    ).toBe(true);
  });
});

describe("checkOpacityReplacement", () => {
  it("flags visible -> invisible -> visible inside a persistence beat", () => {
    const run = fixtureRun();
    run.frames = [
      frameAt(1, { vec: sample(0, 0, 1) }),
      frameAt(2, { vec: sample(0, 0, 0) }),
      frameAt(3, { vec: sample(0, 0, 1) }),
    ];
    const result = checkOpacityReplacement(fixtureManifest(), run).find(
      (r) => r.id === "opacity-replacement:vec:b1",
    )!;
    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/opacity swap/);
  });
  it("allows fading out for good at a beat's end", () => {
    const run = fixtureRun();
    run.frames = [
      frameAt(1, { vec: sample(0, 0, 1) }),
      frameAt(9, { vec: sample(0, 0, 0) }),
    ];
    expect(
      checkOpacityReplacement(fixtureManifest(), run).find(
        (r) => r.id === "opacity-replacement:vec:b1",
      )!.passed,
    ).toBe(true);
  });
});

describe("checkLandmarks", () => {
  it("reports the position delta as craft", () => {
    const result = checkLandmarks(fixtureManifest(), fixtureRun())[0]!;
    expect(result.passed).toBe(true);
    expect(result.severity).toBe("craft");
    expect(result.measured).toBeCloseTo(2);
  });
  it("hard-fails when the landmark object is invisible", () => {
    const run = fixtureRun();
    run.beatEndSamples.b1!.vec = sample(102, 0, 0);
    const result = checkLandmarks(fixtureManifest(), run)[0]!;
    expect(result.passed).toBe(false);
    expect(result.severity).toBe("hard");
  });
});

describe("checkEventTimes / checkHoldDurations", () => {
  it("reports deltas within tolerance as passing craft results", () => {
    const events = checkEventTimes(fixtureManifest(), fixtureRun());
    expect(events.every((r) => r.passed)).toBe(true);
    const holds = checkHoldDurations(fixtureManifest(), fixtureRun());
    expect(holds).toHaveLength(1);
    expect(holds[0]!.measured).toBeCloseTo(6.1);
  });
  it("hard-fails an event that never happened", () => {
    const run = fixtureRun({ events: { e1: 2.1 } });
    const missing = checkEventTimes(fixtureManifest(), run).find(
      (r) => r.id === "event:e2",
    )!;
    expect(missing.passed).toBe(false);
    expect(missing.severity).toBe("hard");
  });
  it("flags a late event as craft", () => {
    const run = fixtureRun({ events: { e1: 2.1, e2: 9.5 } });
    const late = checkEventTimes(fixtureManifest(), run).find(
      (r) => r.id === "event:e2",
    )!;
    expect(late.passed).toBe(false);
    expect(late.severity).toBe("craft");
  });
});

describe("checkStageClipping", () => {
  it("flags content extending past the stage edge", () => {
    const run = fixtureRun();
    run.frames.push(
      frameAt(16, { note: sample(460, 0, 1, { width: 100, height: 20 }) }),
    );
    const result = checkStageClipping(fixtureManifest(), run).find(
      (r) => r.id === "clipping:note",
    )!;
    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/clipped/);
  });
});

describe("checkTextOcclusion", () => {
  it("flags a label box covering a math object's anchor", () => {
    const run = fixtureRun();
    run.frames.push(
      frameAt(16, {
        note: sample(200, 0, 1, { width: 120, height: 40 }),
        vec: sample(210, 5, 1),
      }),
    );
    const result = checkTextOcclusion(fixtureManifest(), run).find(
      (r) => r.id === "occlusion:note",
    )!;
    expect(result.passed).toBe(false);
    expect(result.severity).toBe("hard");
  });
});

describe("checkSeekDeterminism", () => {
  it("passes matching hashes and probes", () => {
    expect(
      checkSeekDeterminism(fixtureManifest(), fixtureRun())[0]!.passed,
    ).toBe(true);
  });
  it("fails on hash mismatch", () => {
    const run = fixtureRun();
    run.seekRecords[0]!.hashFromEnd = "zzz";
    const result = checkSeekDeterminism(fixtureManifest(), run)[0]!;
    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/MISMATCH/);
  });
  it("fails on probe disagreement even when hashes collide", () => {
    const run = fixtureRun();
    run.seekRecords[0]!.samplesFromEnd = { vec: sample(140, 0) };
    expect(checkSeekDeterminism(fixtureManifest(), run)[0]!.passed).toBe(false);
  });
});

describe("checkCamera", () => {
  it("passes a reached zoom target and flags a missing move as hard", () => {
    const good = checkCamera(fixtureManifest(), fixtureRun()).find(
      (r) => r.id === "camera:b2",
    )!;
    expect(good.passed).toBe(true);
    const run = fixtureRun();
    run.beatEndSamples.b2!["camera-rig"] = sample(0, 0, 1, { scale: 1 });
    const missing = checkCamera(fixtureManifest(), run).find(
      (r) => r.id === "camera:b2",
    )!;
    expect(missing.passed).toBe(false);
    expect(missing.severity).toBe("hard");
  });
  it("flags a zoom during a declared-static beat", () => {
    const run = fixtureRun();
    run.beatEndSamples.b1!["camera-rig"] = sample(10, 0, 1, { scale: 1.4 });
    const result = checkCamera(fixtureManifest(), run).find(
      (r) => r.id === "camera:b1",
    )!;
    expect(result.passed).toBe(false);
  });
});

describe("checkOverruns / checkDuration / summarize", () => {
  it("turns segment overruns into hard failures", () => {
    const run = fixtureRun({
      overruns: [{ label: "x.b1", declared: 10, measured: 11 }],
    });
    const result = checkOverruns(run)[0]!;
    expect(result.passed).toBe(false);
    expect(result.severity).toBe("hard");
  });
  it("checks total duration against the excerpt window", () => {
    expect(checkDuration(fixtureManifest(), fixtureRun())[0]!.passed).toBe(true);
    const short = fixtureRun({ durationFrames: 300 });
    expect(checkDuration(fixtureManifest(), short)[0]!.passed).toBe(false);
  });
  it("summarize splits hard failures from craft findings by dimension", () => {
    const report = summarize("bfs-frontier", [
      {
        id: "a",
        dimension: "timing",
        severity: "craft",
        passed: false,
        message: "m",
      },
      {
        id: "b",
        dimension: "identity-continuity",
        severity: "hard",
        passed: false,
        message: "m",
      },
      {
        id: "c",
        dimension: "timing",
        severity: "hard",
        passed: true,
        message: "m",
      },
    ]);
    expect(report.hardFailures).toHaveLength(1);
    expect(report.craftFindings).toHaveLength(1);
    const timing = report.summaries.find((s) => s.dimension === "timing")!;
    expect(timing.total).toBe(2);
    expect(timing.passed).toBe(1);
  });
  it("reports declared differences with their explicit classifications", () => {
    const manifest = fixtureManifest();
    manifest.knownDeviations = [
      {
        id: "typography",
        classification: "intentionally different for product semantics",
        note: "A deliberate typeface difference.",
      },
    ];
    const measurement = buildMeasurementReport(
      manifest,
      fixtureRun(),
      summarize(manifest.id, []),
    ) as {
      deviations?: { id: string; classification: string; note: string }[];
      knownDeviations?: unknown;
      craftFindings: string[];
    };

    expect(measurement.craftFindings).toEqual([]);
    expect(measurement.deviations).toEqual(manifest.knownDeviations);
    expect(measurement).not.toHaveProperty("knownDeviations");
  });
});
