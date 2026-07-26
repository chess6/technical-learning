import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {describe, expect, it} from "vitest";
import type {SceneBeatContract, ResolvedCheckpoint} from "../beatSpec";
import {MATRIX_TRANSFORMATION_BEAT_CONTRACT} from "../matrixTransformationBeatSpec";
import {analyzeReviewRun} from "../reviewAnalysis";
import {resolveBeatCheckpoints} from "../beatSpec";
import type {NodeSample, SceneGateRun} from "../../validation/gateTypes";

function node(key: string, x: number, text?: string): NodeSample {
  return {
    key,
    type: text ? "Txt" : "Rect",
    x,
    y: 0,
    width: 10,
    height: 10,
    opacity: 1,
    ...(text ? {text, fontSize: 20} : {}),
    ancestors: [],
  };
}

const contract: SceneBeatContract = {
  sceneId: "fixture",
  semanticObjects: ["semantic:moving", "semantic:stable", "semantic:missing"],
  beats: [
    {
      id: "beat",
      purpose: "Prove the reducer reads geometry rather than labels.",
      intent: "geometry",
      focalObjects: ["semantic:moving"],
      timingEvent: "fixture.beat",
      chapter: {id: "beat", title: "Beat"},
      checkpoints: [],
      expectedChanges: [
        {
          objectId: "semantic:moving",
          property: "geometry",
          expectation: "change",
          continuous: true,
        },
      ],
      expectedStableObjects: ["semantic:stable"],
    },
  ],
};

const checkpoint: ResolvedCheckpoint = {
  sceneId: "fixture",
  beatId: "beat",
  checkpointId: "landing",
  time: 0.1,
  frame: 3,
  requiredObjects: ["semantic:moving"],
};

function run(moving: NodeSample[]): SceneGateRun {
  return {
    sceneId: "fixture",
    fps: 30,
    stride: 3,
    durationFrames: 7,
    frames: [0, 3, 6].map((frame, index) => ({
      frame,
      time: frame / 30,
      nodes: {
        "semantic:moving": moving[index]!,
        "semantic:stable": node("semantic:stable", 8),
      },
      unmeasured: [],
    })),
    segments: [{id: "beat", start: 0, end: 1, beats: []}],
    seekRecords: [
      {
        segmentId: "beat",
        frame: 3,
        hashFromStart: "same",
        hashFromEnd: "same",
        nodesFromStart: {},
        nodesFromEnd: {},
        unmeasuredFromStart: [],
        unmeasuredFromEnd: [],
      },
    ],
    overruns: [],
  };
}

describe("animation review analysis", () => {
  it("records continuous geometry, invariants, required objects, and trajectories", () => {
    const result = analyzeReviewRun(
      contract,
      [checkpoint],
      run([
        node("semantic:moving", 0),
        node("semantic:moving", 2),
        node("semantic:moving", 4),
      ]),
    );
    expect(result.assertions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          objectId: "semantic:moving",
          property: "geometry",
          pass: true,
        }),
        expect.objectContaining({
          objectId: "semantic:stable",
          property: "stable",
          pass: true,
        }),
        expect.objectContaining({
          property: "required",
          pass: true,
        }),
      ]),
    );
    expect(result.trajectories[0]?.points.map(({x}) => x)).toEqual([0, 2, 4]);
    expect(result.directSeeks[0]).toEqual(
      expect.objectContaining({canvasMatch: true, unmeasuredFromStart: 0}),
    );
  });

  it("does not let changing text satisfy a geometry expectation", () => {
    const result = analyzeReviewRun(
      contract,
      [checkpoint],
      run([
        node("semantic:moving", 0, "before"),
        node("semantic:moving", 0, "during"),
        node("semantic:moving", 0, "after"),
      ]),
    );
    expect(result.assertions).toContainEqual(
      expect.objectContaining({
        objectId: "semantic:moving",
        property: "geometry",
        pass: false,
      }),
    );
    expect(result.failures).toContainEqual(
      expect.stringContaining("semantic:moving expected change, continuous"),
    );
  });

  it("turns missing required geometry and unmeasured seeks into visible evidence", () => {
    const fixture = run([
      node("semantic:moving", 0),
      node("semantic:moving", 2),
      node("semantic:moving", 4),
    ]);
    fixture.seekRecords[0]!.unmeasuredFromStart = [
      {key: "semantic:bad-line", type: "Line", reason: "non-finite point"},
    ];
    const result = analyzeReviewRun(
      contract,
      [{...checkpoint, requiredObjects: ["semantic:missing"]}],
      fixture,
    );
    expect(result.assertions).toContainEqual(
      expect.objectContaining({property: "required", pass: false}),
    );
    expect(result.directSeeks[0]?.unmeasuredFromStart).toBe(1);
  });

  it("keeps all pilot artifact checkpoints stable and unique", () => {
    const first = resolveBeatCheckpoints(MATRIX_TRANSFORMATION_BEAT_CONTRACT, 30);
    const second = resolveBeatCheckpoints(MATRIX_TRANSFORMATION_BEAT_CONTRACT, 30);
    const keys = first.map(({beatId, checkpointId, frame}) =>
      `${beatId}--${checkpointId}--${frame}`,
    );
    expect(first).toEqual(second);
    expect(new Set(keys).size).toBe(40);
  });

  it("keeps the production sampler free of arbitrary frame-settle delays", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/guided-scenes/validation/sceneGateRunner.ts"),
      "utf8",
    );
    expect(source).toContain("waitForRenderedFrame");
    expect(source).not.toContain("nextTask");
    expect(source).not.toContain("setTimeout(resolve, 0)");
  });
});
