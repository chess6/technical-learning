import { describe, expect, it } from "vitest";
import {
  resolveBeatCheckpoints,
  validateBeatContract,
  type SceneBeatContract,
} from "../beatSpec";
import { CONTINUOUS_SPACE_BEAT_CONTRACTS } from "../continuousSpaceBeatSpecs";
import { MATRIX_TRANSFORMATION_BEAT_CONTRACT } from "../matrixTransformationBeatSpec";

function clonePilot(): SceneBeatContract {
  return structuredClone(MATRIX_TRANSFORMATION_BEAT_CONTRACT);
}

describe("matrix-transformations BeatSpec", () => {
  it("covers the production chapters with a valid typed contract", () => {
    expect(validateBeatContract(MATRIX_TRANSFORMATION_BEAT_CONTRACT)).toEqual(
      [],
    );
    expect(
      MATRIX_TRANSFORMATION_BEAT_CONTRACT.beats.map(({ id }) => id),
    ).toEqual([
      "identity",
      "col1",
      "col2",
      "sample",
      "predict-sample",
      "transform-sample",
      "grid",
      "compare",
      "presets",
      "summary",
    ]);
  });

  it("resolves direct-seek frames deterministically from production timing", () => {
    const first = resolveBeatCheckpoints(
      MATRIX_TRANSFORMATION_BEAT_CONTRACT,
      30,
    );
    const second = resolveBeatCheckpoints(
      MATRIX_TRANSFORMATION_BEAT_CONTRACT,
      30,
    );
    expect(second).toEqual(first);
    expect(first).toHaveLength(40);
    expect(
      first
        .filter(({ checkpointId }) => checkpointId === "opening")
        .map(({ frame }) => frame),
    ).toEqual([0, 105, 240, 375, 510, 675, 870, 1035, 1125, 1515]);
    expect(
      first.find(
        ({ beatId, checkpointId }) =>
          beatId === "col1" && checkpointId === "landing",
      )?.frame,
    ).toBe(167);
  });

  it("does not infer motion from a suggestive field name", () => {
    const fixture = clonePilot();
    const identity = fixture.beats[0]!;
    fixture.beats = [
      {
        ...identity,
        id: "pause",
        chapter: { ...identity.chapter, id: "pause" },
        timingEvent: `${fixture.sceneId}.pause`,
        intent: "hold",
      },
      ...fixture.beats.slice(1),
    ];
    expect(validateBeatContract(fixture)).toContain(
      "matrix-transformations.pause: hold cannot declare changes",
    );
  });

  it("does not let text or emphasis satisfy a geometry claim", () => {
    const fixture = clonePilot();
    const identity = fixture.beats[0]!;
    fixture.beats = [
      {
        ...identity,
        expectedChanges: [
          {
            objectId: "semantic:matrix:ledger:row:relation:value",
            property: "text",
            expectation: "change",
          },
        ],
      },
      ...fixture.beats.slice(1),
    ];
    expect(validateBeatContract(fixture)).toContain(
      "matrix-transformations.identity: geometry needs geometry change",
    );
  });

  it("fails required objects that are not registered", () => {
    const fixture = clonePilot();
    const identity = fixture.beats[0]!;
    const opening = identity.checkpoints[0]!;
    fixture.beats = [
      {
        ...identity,
        checkpoints: [
          {
            ...opening,
            requiredObjects: ["semantic:matrix:missing"],
          },
          ...identity.checkpoints.slice(1),
        ],
      },
      ...fixture.beats.slice(1),
    ];
    expect(validateBeatContract(fixture)).toContain(
      "matrix-transformations.identity: unregistered object semantic:matrix:missing",
    );
  });

  it("keeps a changed object out of the invariant set", () => {
    const fixture = clonePilot();
    const identity = fixture.beats[0]!;
    fixture.beats = [
      { ...identity, expectedStableObjects: ["semantic:matrix:column-1"] },
      ...fixture.beats.slice(1),
    ];
    expect(validateBeatContract(fixture)).toContain(
      "matrix-transformations.identity: semantic:matrix:column-1 is both changed and stable",
    );
  });
});

describe("continuous-space BeatSpecs", () => {
  it("covers all five production timelines with explicit valid contracts", () => {
    expect(Object.keys(CONTINUOUS_SPACE_BEAT_CONTRACTS)).toEqual([
      "why-linear-algebra",
      "vectors-linear-combinations",
      "matrix-composition",
      "determinant-area-scaling",
      "change-of-basis",
    ]);
    for (const contract of Object.values(CONTINUOUS_SPACE_BEAT_CONTRACTS)) {
      expect(validateBeatContract(contract), contract.sceneId).toEqual([]);
      expect(Object.keys(contract.mathData).length).toBeGreaterThan(0);
      expect(
        contract.beats.every(
          (beat) => beat.chapter.seek.kind === "segment-opening",
        ),
      ).toBe(true);
      expect(contract.beats.every((beat) => beat.invariant.length > 0)).toBe(
        true,
      );
      expect(resolveBeatCheckpoints(contract, 30)).toHaveLength(
        contract.beats.length * 4,
      );
    }
  });
});
