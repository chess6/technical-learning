import { describe, expect, it } from "vitest";
import {
  isHoldBeat,
  isNested,
  motionBudgetOf,
  overlapArea,
  type NodeSample,
  type SceneFrameSample,
  type SceneGateRun,
} from "../gateTypes";
import {
  DISCRETE_CHANGE_PX,
  MOTION_FLOOR_PX,
  TELEPORT_PX_PER_FRAME,
  checkClaimedMotion,
  checkNoEmptyFrames,
  checkNoFlicker,
  checkNoOverruns,
  checkNoTeleports,
  checkRunSampledScene,
  checkSeekDeterminism,
  checkTextOverlap,
  checkTextWithinStage,
  runSceneHardGates,
} from "../hardGates";

/**
 * Every production hard gate, exercised against synthetic runs built to trip
 * exactly one defect. A gate that cannot be made to fire is not a gate.
 */

function node(
  key: string,
  overrides: Partial<NodeSample> = {},
): NodeSample {
  return {
    key,
    type: "Line",
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    opacity: 1,
    ancestors: [],
    ...overrides,
  };
}

function text(key: string, value: string, overrides: Partial<NodeSample> = {}) {
  return node(key, {
    type: "Txt",
    text: value,
    width: 200,
    height: 40,
    fontSize: 28,
    ...overrides,
  });
}

/** The same nodes held for `count` samples — text gates require persistence. */
function heldFrames(nodes: NodeSample[], count = 6): SceneFrameSample[] {
  return Array.from({ length: count }, (_, i) => frame(i, nodes));
}

function frame(
  index: number,
  nodes: NodeSample[],
  fps = 30,
  stride = 3,
): SceneFrameSample {
  return {
    frame: index * stride,
    time: (index * stride) / fps,
    nodes: Object.fromEntries(nodes.map((n) => [n.key, n])),
  };
}

function run(overrides: Partial<SceneGateRun> = {}): SceneGateRun {
  return {
    sceneId: "test-scene",
    fps: 30,
    stride: 3,
    durationFrames: 300,
    frames: [frame(0, [node("a")]), frame(1, [node("a")])],
    segments: [],
    seekRecords: [],
    overruns: [],
    ...overrides,
  };
}

describe("gate helpers", () => {
  it("classifies hold beats but not motion beats", () => {
    expect(isHoldBeat("hold")).toBe(true);
    expect(isHoldBeat("hold2")).toBe(true);
    expect(isHoldBeat("think")).toBe(true);
    expect(isHoldBeat("ask")).toBe(true);
    expect(isHoldBeat("morph")).toBe(false);
    expect(isHoldBeat("slide")).toBe(false);
    expect(isHoldBeat("holdout")).toBe(false);
  });

  it("counts only non-hold beats toward the motion budget", () => {
    expect(motionBudgetOf({ hold: 2.9, originUp: 0.4, originDown: 0.4 })).toBeCloseTo(0.8);
    expect(motionBudgetOf({ hold: 3, hold2: 2 })).toBe(0);
    expect(motionBudgetOf({})).toBe(0);
  });

  it("measures box overlap and skips nested pairs", () => {
    const a = text("a", "one", { x: 0, y: 0, width: 100, height: 40 });
    const b = text("b", "two", { x: 50, y: 0, width: 100, height: 40 });
    expect(overlapArea(a, b)).toBeCloseTo(50 * 40);
    const apart = text("c", "far", { x: 500, y: 0, width: 100, height: 40 });
    expect(overlapArea(a, apart)).toBe(0);
    expect(isNested(a, text("d", "child", { ancestors: ["a"] }))).toBe(true);
    expect(isNested(a, b)).toBe(false);
  });
});

describe("text-clipping gate", () => {
  it("passes text inside the stage", () => {
    expect(
      checkTextWithinStage(
        run({ frames: [frame(0, [text("t", "safe", { x: 0, y: -200 })])] }),
      ),
    ).toEqual([]);
  });

  it("fails text running off the stage edge", () => {
    const findings = checkTextWithinStage(
      run({ frames: [frame(0, [text("t", "a very long caption", { x: -420, width: 300 })])] }),
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]!.gate).toBe("text-clipping");
    expect(findings[0]!.message).toMatch(/clipped/);
  });

  it("ignores invisible and empty text", () => {
    expect(
      checkTextWithinStage(
        run({
          frames: [
            frame(0, [
              text("hidden", "off stage", { x: -600, opacity: 0 }),
              text("blank", "   ", { x: -600 }),
            ]),
          ],
        }),
      ),
    ).toEqual([]);
  });

  it("is strict sideways but tolerant of text leading vertically", () => {
    // Horizontal ink is measured accurately, so a few px over the side edge
    // is a real clip…
    const sideways = checkTextWithinStage(
      run({
        frames: [frame(0, [text("t", "caption", { x: 400, width: 200, height: 40 })])],
      }),
    );
    expect(sideways).toHaveLength(1);
    expect(sideways[0]!.message).toMatch(/side stage edge/);

    // …but a text box includes leading below the last line, so a caption
    // sitting on LABEL_BOTTOM_Y whose BOX pokes out is not clipped ink.
    expect(
      checkTextWithinStage(
        run({
          frames: [frame(0, [text("t", "caption", { x: 0, y: 222, width: 800, height: 136 })])],
        }),
      ),
    ).toEqual([]);

    // A caption that genuinely loses a line is off by a full line height.
    const vertical = checkTextWithinStage(
      run({
        frames: [frame(0, [text("t", "caption", { x: 0, y: 260, width: 800, height: 136 })])],
      }),
    );
    expect(vertical).toHaveLength(1);
    expect(vertical[0]!.message).toMatch(/top\/bottom stage edge/);
  });

  it("reports each offending node once, at its worst frame", () => {
    const findings = checkTextWithinStage(
      run({
        frames: [
          frame(0, [text("t", "caption", { x: -420, width: 200 })]),
          frame(1, [text("t", "caption", { x: -460, width: 200 })]),
        ],
      }),
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]!.frame).toBe(3);
  });
});

describe("text-overlap gate", () => {
  it("fails two captions sitting on each other", () => {
    const findings = checkTextOverlap(
      run({
        frames: heldFrames([
          text("a", "first caption", { x: 0, y: 0, width: 200, height: 40 }),
          text("b", "second caption", { x: 20, y: 0, width: 200, height: 40 }),
        ]),
      }),
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]!.gate).toBe("text-overlap");
  });

  it("allows one label crossing another during an authored merge", () => {
    // elimination slides a scratch row onto R2; they read as one for a beat.
    const collided = [
      text("a", "[ −2 −6 | 2 ]", { x: 0, y: 0 }),
      text("b", "[ 0.16 −6.53 | 6.84 ]", { x: 0, y: 0 }),
    ];
    const apart = [
      text("a", "[ −2 −6 | 2 ]", { x: 0, y: -120 }),
      text("b", "[ 0.16 −6.53 | 6.84 ]", { x: 0, y: 0 }),
    ];
    expect(
      checkTextOverlap(
        run({
          frames: [frame(0, apart), frame(1, collided), frame(2, apart)],
        }),
      ),
    ).toEqual([]);
  });

  it("allows a stacked title and subtitle whose boxes graze", () => {
    // Verified against a rendered frame of subspaces-rank: adjacent lines,
    // not a collision. Boxes touch only because text boxes carry leading.
    // Real measured geometry: boxes carry so much leading that they intersect
    // by 87% even though the glyph bands are 15px apart.
    expect(
      checkTextOverlap(
        run({
          frames: heldFrames([
            text("title", "Two spaces, not one", {
              x: 0, y: -229, width: 397, height: 119, fontSize: 34,
            }),
            text("sub", "isometric view — angles are not to scale", {
              x: 0, y: -194, width: 399, height: 68, fontSize: 20,
            }),
          ]),
        }),
      ),
    ).toEqual([]);
  });

  it("fails a small label printed on top of a caption", () => {
    // Verified against a rendered frame of linear-systems: the vector label
    // "b" lands on the subtitle.
    const findings = checkTextOverlap(
      run({
        frames: heldFrames([
          text("caption", "coefficient space (x, y)", {
            x: 0, y: -190, width: 460, height: 60, fontSize: 22,
          }),
          text("b", "b", { x: -8, y: -186, width: 18, height: 34, fontSize: 24 }),
        ]),
      }),
    );
    expect(findings).toHaveLength(1);
  });

  it("allows stacked labels whose em boxes merely graze", () => {
    // Real measured geometry from vectors-linear-combinations: "v" and "w"
    // sit 48px apart and are plainly legible; their em boxes touch by 0.4px.
    expect(
      checkTextOverlap(
        run({
          frames: heldFrames([
            text("v", "v", { x: 83, y: -146, width: 40, height: 60, fontSize: 44 }),
            text("w", "w", { x: 80, y: -98, width: 44, height: 60, fontSize: 44 }),
          ]),
        }),
      ),
    ).toEqual([]);
  });

  it("allows adjacent labels that merely touch", () => {
    expect(
      checkTextOverlap(
        run({
          frames: heldFrames([
            text("a", "left", { x: -100, width: 100, height: 40 }),
            text("b", "right", { x: 5, width: 100, height: 40 }),
          ]),
        }),
      ),
    ).toEqual([]);
  });

  it("never reports a Txt against its own spawned glyphs", () => {
    expect(
      checkTextOverlap(
        run({
          frames: heldFrames([
            text("parent", "caption", { x: 0, width: 200, height: 40 }),
            text("leaf", "caption", { x: 0, width: 200, height: 40, ancestors: ["parent"] }),
          ]),
        }),
      ),
    ).toEqual([]);
  });
});

describe("teleport gate", () => {
  it("passes continuous motion", () => {
    expect(
      checkNoTeleports(
        run({
          frames: [
            frame(0, [node("a", { x: 0 }), node("b", { x: 100 })]),
            frame(1, [node("a", { x: 20 }), node("b", { x: 100 })]),
          ],
        }),
      ),
    ).toEqual([]);
  });

  it("fails one object jumping while the frame is otherwise still", () => {
    const jump = TELEPORT_PX_PER_FRAME * 3 + 50;
    const findings = checkNoTeleports(
      run({
        frames: [
          frame(0, [node("a", { x: 0 }), node("b"), node("c"), node("d"), node("e")]),
          frame(1, [node("a", { x: jump }), node("b"), node("c"), node("d"), node("e")]),
        ],
      }),
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]!.nodeKey).toBe("a");
    expect(findings[0]!.message).toMatch(/loses its identity/);
  });

  it("exempts an authored scene-wide cut", () => {
    const jump = TELEPORT_PX_PER_FRAME * 3 + 50;
    const before = ["a", "b", "c", "d"].map((k) => node(k, { x: 0 }));
    const after = ["a", "b", "c", "d"].map((k) => node(k, { x: jump }));
    expect(
      checkNoTeleports(run({ frames: [frame(0, before), frame(1, after)] })),
    ).toEqual([]);
  });

  it("ignores nodes that were not visible in the previous frame", () => {
    expect(
      checkNoTeleports(
        run({
          frames: [
            frame(0, [node("a", { x: 0, opacity: 0 }), node("b"), node("c"), node("d")]),
            frame(1, [node("a", { x: 900 }), node("b"), node("c"), node("d")]),
          ],
        }),
      ),
    ).toEqual([]);
  });
});

describe("flicker gate", () => {
  it("fails an object cut out and cut straight back", () => {
    const findings = checkNoFlicker(
      run({
        frames: [
          frame(0, [node("a")]),
          frame(1, [node("a", { opacity: 0 })]),
          frame(2, [node("a")]),
        ],
      }),
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]!.gate).toBe("flicker");
  });

  it("allows an animated crossfade through the visibility threshold", () => {
    // Real measured trace from eigenvectors-invariant-directions retiring its
    // fan, and from linear-systems swapping a caption's text: both ramp down
    // and back up, dipping below the threshold on the way.
    const trace = [0.9, 0.717, 0.063, 0.001, 0.087, 0.479, 0.832, 0.9];
    expect(
      checkNoFlicker(
        run({
          frames: trace.map((opacity, i) => frame(i, [node("a", { opacity })])),
        }),
      ),
    ).toEqual([]);
  });

  it("allows a retire-and-recall across a chapter", () => {
    const frames: SceneFrameSample[] = [frame(0, [node("a")])];
    for (let i = 1; i <= 12; i += 1) frames.push(frame(i, [node("a", { opacity: 0 })]));
    frames.push(frame(13, [node("a")]));
    expect(checkNoFlicker(run({ frames }))).toEqual([]);
  });
});

describe("claimed-motion gate", () => {
  const segments = [{ id: "morph", start: 0, end: 1, motionBudget: 2 }];

  it("fails a motion segment whose frames never change", () => {
    const findings = checkClaimedMotion(
      run({
        segments,
        frames: [frame(0, [node("a")]), frame(1, [node("a")])],
      }),
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]!.gate).toBe("missing-claimed-motion");
    expect(findings[0]!.segmentId).toBe("morph");
  });

  it("passes when something actually moves", () => {
    expect(
      checkClaimedMotion(
        run({
          segments,
          frames: [frame(0, [node("a", { x: 0 })]), frame(1, [node("a", { x: 40 })])],
        }),
      ),
    ).toEqual([]);
  });

  it("accepts fades, resizes, and text changes as motion", () => {
    for (const changed of [
      node("a", { opacity: 0.4 }),
      node("a", { width: 60 }),
      { ...node("a"), type: "Txt", text: "new" } as NodeSample,
    ]) {
      const before =
        changed.type === "Txt"
          ? ({ ...node("a"), type: "Txt", text: "old" } as NodeSample)
          : node("a");
      expect(
        checkClaimedMotion(
          run({ segments, frames: [frame(0, [before]), frame(1, [changed])] }),
        ),
      ).toEqual([]);
    }
  });

  it("does not gate segments that only budget holds", () => {
    expect(
      checkClaimedMotion(
        run({
          segments: [{ id: "hold-only", start: 0, end: 1, motionBudget: 0 }],
          frames: [frame(0, [node("a")]), frame(1, [node("a")])],
        }),
      ),
    ).toEqual([]);
  });

  it("counts an object appearing as motion", () => {
    expect(
      checkClaimedMotion(
        run({
          segments,
          frames: [frame(0, [node("a")]), frame(1, [node("a"), node("b")])],
        }),
      ),
    ).toEqual([]);
  });

  it("keeps one discrete change clear of the nothing-moved threshold", () => {
    expect(DISCRETE_CHANGE_PX).toBeGreaterThan(MOTION_FLOOR_PX);
  });
});

describe("seek-determinism gate", () => {
  const base = {
    segmentId: "s1",
    frame: 60,
    nodesFromStart: { a: node("a", { x: 10 }) },
    nodesFromEnd: { a: node("a", { x: 10 }) },
  };

  it("passes when both directions agree", () => {
    expect(
      checkSeekDeterminism(
        run({ seekRecords: [{ ...base, hashFromStart: "aa", hashFromEnd: "aa" }] }),
      ),
    ).toEqual([]);
  });

  it("fails a canvas mismatch", () => {
    const findings = checkSeekDeterminism(
      run({ seekRecords: [{ ...base, hashFromStart: "aa", hashFromEnd: "bb" }] }),
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]!.message).toMatch(/DIFFERS/);
  });

  it("fails a node disagreement even when the canvas hash collides", () => {
    const findings = checkSeekDeterminism(
      run({
        seekRecords: [
          {
            ...base,
            hashFromStart: "aa",
            hashFromEnd: "aa",
            nodesFromEnd: { a: node("a", { x: 90 }) },
          },
        ],
      }),
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]!.nodeKey).toBe("a");
  });

  it("catches an opacity-only divergence", () => {
    const findings = checkSeekDeterminism(
      run({
        seekRecords: [
          {
            ...base,
            hashFromStart: "aa",
            hashFromEnd: "aa",
            nodesFromEnd: { a: node("a", { x: 10, opacity: 0.2 }) },
          },
        ],
      }),
    );
    expect(findings).toHaveLength(1);
  });
});

describe("empty-frame and overrun gates", () => {
  it("fails a blank frame", () => {
    const findings = checkNoEmptyFrames(
      run({ frames: [frame(0, [node("a", { opacity: 0 })])] }),
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]!.gate).toBe("empty-frame");
  });

  it("turns a recorded overrun into a finding", () => {
    const findings = checkNoOverruns(
      run({ overruns: [{ label: "scene.seg", declared: 3, measured: 4.2 }] }),
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]!.gate).toBe("segment-overrun");
  });
});

describe("gate-coverage gate", () => {
  it("fails a run that sampled no frames", () => {
    const findings = checkRunSampledScene(run({ frames: [] }));
    expect(findings.some((f) => f.message.includes("no frames were sampled"))).toBe(true);
  });

  it("fails a run whose frames contain no nodes", () => {
    const findings = checkRunSampledScene(
      run({ frames: [{ frame: 0, time: 0, nodes: {} }] }),
    );
    expect(findings.some((f) => f.message.includes("zero nodes"))).toBe(true);
  });

  it("fails a run with no duration", () => {
    const findings = checkRunSampledScene(run({ durationFrames: 0, frames: [] }));
    expect(findings.some((f) => f.message.includes("no duration"))).toBe(true);
  });

  it("fails a segmented scene with no seek records", () => {
    const findings = checkRunSampledScene(
      run({ segments: [{ id: "s", start: 0, end: 1, motionBudget: 0 }] }),
    );
    expect(findings.some((f) => f.message.includes("seek-determinism"))).toBe(true);
  });

  it("passes a real run", () => {
    expect(
      checkRunSampledScene(
        run({
          segments: [{ id: "s", start: 0, end: 1, motionBudget: 0 }],
          seekRecords: [
            {
              segmentId: "s",
              frame: 10,
              hashFromStart: "a",
              hashFromEnd: "a",
              nodesFromStart: {},
              nodesFromEnd: {},
            },
          ],
        }),
      ),
    ).toEqual([]);
  });

  it("makes an empty run fail the whole gate set, never pass it", () => {
    // The regression this encodes: the first runner sampled zero frames and
    // every other gate reported "clean".
    expect(runSceneHardGates(run({ frames: [], durationFrames: 0 })).length).toBeGreaterThan(0);
  });
});

describe("runSceneHardGates", () => {
  it("returns nothing for a clean run", () => {
    expect(
      runSceneHardGates(
        run({
          frames: [
            frame(0, [node("a", { x: 0 }), text("t", "caption", { y: -200 })]),
            frame(1, [node("a", { x: 20 }), text("t", "caption", { y: -200 })]),
          ],
          segments: [{ id: "s", start: 0, end: 1, motionBudget: 1 }],
          seekRecords: [
            {
              segmentId: "s",
              frame: 15,
              hashFromStart: "a1",
              hashFromEnd: "a1",
              nodesFromStart: { a: node("a", { x: 10 }) },
              nodesFromEnd: { a: node("a", { x: 10 }) },
            },
          ],
        }),
      ),
    ).toEqual([]);
  });

  it("aggregates findings across gates", () => {
    const findings = runSceneHardGates(
      run({
        frames: [
          frame(0, [text("t", "clipped caption", { x: -430, width: 300 })]),
        ],
        overruns: [{ label: "scene.seg", declared: 3, measured: 4 }],
      }),
    );
    expect(findings.map((f) => f.gate).sort()).toEqual([
      "segment-overrun",
      "text-clipping",
    ]);
  });
});
