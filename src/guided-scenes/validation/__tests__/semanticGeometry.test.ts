import { describe, expect, it } from "vitest";
import { checkSemanticGeometry } from "../hardGates";
import type { NodeSample, SceneFrameSample, SceneGateRun } from "../gateTypes";
import type { SceneGeometryContract } from "../semanticGeometryContracts";

const SCALE = 64;

function node(key: string, overrides: Partial<NodeSample> = {}): NodeSample {
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

function line(
  key: string,
  points: readonly { x: number; y: number }[],
): NodeSample {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return node(key, {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
    width: maxX - minX,
    height: maxY - minY,
    points: [...points],
  });
}

function frame(nodes: NodeSample[]): SceneFrameSample {
  return {
    frame: 30,
    time: 1,
    nodes: Object.fromEntries(nodes.map((sample) => [sample.key, sample])),
    unmeasured: [],
  };
}

function run(nodes: NodeSample[], segmentId = "math"): SceneGateRun {
  return {
    sceneId: "semantic-fixture",
    fps: 30,
    stride: 3,
    durationFrames: 60,
    frames: [frame(nodes)],
    segments: [{ id: segmentId, start: 0, end: 2, beats: [] }],
    seekRecords: [],
    overruns: [],
  };
}

function staticGridLines(
  prefix: string,
  coordinates: readonly number[],
  xHalfExtent = 2.5,
  yHalfExtent = 2.5,
): NodeSample[] {
  const nodes: NodeSample[] = [];
  for (const coordinate of coordinates) {
    nodes.push(
      line(`${prefix}:x:${coordinate}`, [
        { x: coordinate * SCALE, y: yHalfExtent * SCALE },
        { x: coordinate * SCALE, y: -yHalfExtent * SCALE },
      ]),
      line(`${prefix}:y:${coordinate}`, [
        { x: -xHalfExtent * SCALE, y: -coordinate * SCALE },
        { x: xHalfExtent * SCALE, y: -coordinate * SCALE },
      ]),
    );
  }
  return nodes;
}

const staticGridContract: SceneGeometryContract = {
  kind: "grid",
  id: "standard-grid",
  prefix: "semantic:grid:static",
  xHalfExtent: 2.5,
  yHalfExtent: 2.5,
  coordinateScalePx: SCALE,
};

describe("semantic grid contracts", () => {
  it("passes an origin-centred integer lattice", () => {
    const nodes = staticGridLines(staticGridContract.prefix, [-2, -1, 0, 1, 2]);
    expect(checkSemanticGeometry(run(nodes), [staticGridContract])).toEqual([]);
  });

  it("recreates and rejects the original half-shifted grid", () => {
    const nodes = staticGridLines(
      staticGridContract.prefix,
      [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5],
    );
    const findings = checkSemanticGeometry(run(nodes), [staticGridContract]);
    expect(findings.some((finding) => finding.message.includes("x-axis"))).toBe(
      true,
    );
    expect(
      findings.some((finding) => finding.message.includes("integer lattice")),
    ).toBe(true);
  });

  it("rejects a missing integer-lattice family line", () => {
    const nodes = staticGridLines(
      staticGridContract.prefix,
      [-2, -1, 0, 1, 2],
    ).filter((sample) => sample.key !== `${staticGridContract.prefix}:x:1`);
    const findings = checkSemanticGeometry(run(nodes), [staticGridContract]);
    expect(
      findings.some((finding) => finding.message.includes("line is missing")),
    ).toBe(true);
  });

  it("rejects a transformed family that no longer shares lattice intersections", () => {
    const prefix = "semantic:grid:transformed";
    const xHalfExtent = 2;
    const yHalfExtent = 2;
    const basis1 = { x: 96, y: -24 };
    const basis2 = { x: 32, y: -80 };
    const add = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
      x: a.x + b.x,
      y: a.y + b.y,
    });
    const scale = (a: { x: number; y: number }, amount: number) => ({
      x: a.x * amount,
      y: a.y * amount,
    });
    const nodes: NodeSample[] = [];
    for (const coordinate of [-2, -1, 0, 1, 2]) {
      const xOffset = scale(basis1, coordinate);
      const yOffset = scale(basis2, coordinate);
      nodes.push(
        line(`${prefix}:x:${coordinate}`, [
          add(xOffset, scale(basis2, -yHalfExtent)),
          add(xOffset, scale(basis2, yHalfExtent)),
        ]),
        line(`${prefix}:y:${coordinate}`, [
          add(yOffset, scale(basis1, -xHalfExtent)),
          add(yOffset, scale(basis1, xHalfExtent)),
        ]),
      );
    }
    nodes.find((sample) => sample.key === `${prefix}:x:1`)!.points![0]!.x += 18;

    const findings = checkSemanticGeometry(run(nodes), [
      {
        kind: "grid",
        id: "moving-grid",
        prefix,
        xHalfExtent,
        yHalfExtent,
      },
    ]);
    expect(
      findings.some((finding) => finding.message.includes("lattice geometry")),
    ).toBe(true);
  });
});

describe("vector/readout geometry contracts", () => {
  const contract: SceneGeometryContract = {
    kind: "vector-readout",
    id: "point-p-standard",
    segmentIds: ["read-standard"],
    vectorKey: "semantic:vector:p",
    readoutKey: "semantic:readout:p-standard",
    expectedMathPoint: [4, 1],
    coordinateScalePx: SCALE,
  };

  it("passes when the displayed coordinates and arrow tip agree", () => {
    const nodes = [
      line("semantic:vector:p", [
        { x: 0, y: 0 },
        { x: 4 * SCALE, y: -SCALE },
      ]),
      node("semantic:readout:p-standard", {
        type: "Txt",
        text: "p in standard basis = (4, 1)",
      }),
    ];
    expect(
      checkSemanticGeometry(run(nodes, "read-standard"), [contract]),
    ).toEqual([]);
  });

  it("fails when the readout claims a point the arrow does not reach", () => {
    const nodes = [
      line("semantic:vector:p", [
        { x: 0, y: 0 },
        { x: 2.5 * SCALE, y: -SCALE },
      ]),
      node("semantic:readout:p-standard", {
        type: "Txt",
        text: "p in standard basis = (4, 1)",
      }),
    ];
    const findings = checkSemanticGeometry(run(nodes, "read-standard"), [
      contract,
    ]);
    expect(
      findings.some((finding) => finding.message.includes("arrow tip")),
    ).toBe(true);
  });
});

describe("whole-plane geometry contract", () => {
  const contract: SceneGeometryContract = {
    kind: "full-plane",
    id: "independent-span",
    segmentIds: ["span-plane"],
    nodeKey: "semantic:span:whole-plane",
    minWidth: 960,
    minHeight: 540,
  };

  it("rejects a bounded parallelogram labelled as the whole plane", () => {
    const findings = checkSemanticGeometry(
      run(
        [
          node("semantic:span:whole-plane", {
            type: "Line",
            width: 320,
            height: 220,
          }),
        ],
        "span-plane",
      ),
      [contract],
    );
    expect(
      findings.some((finding) => finding.message.includes("full stage")),
    ).toBe(true);
  });

  it("passes a full-bleed plane cue with no visible finite boundary", () => {
    expect(
      checkSemanticGeometry(
        run(
          [
            node("semantic:span:whole-plane", {
              type: "Rect",
              width: 1200,
              height: 800,
            }),
          ],
          "span-plane",
        ),
        [contract],
      ),
    ).toEqual([]);
  });
});

describe("live matrix-grid contracts", () => {
  const contract: SceneGeometryContract = {
    kind: "matrix-grid",
    id: "matrix-grid-live-state",
    prefix: "semantic:grid:transformed",
    matrixReadoutKey: "semantic:matrix:ledger:row:matrix:value",
    columnKeys: ["semantic:matrix:column-1", "semantic:matrix:column-2"],
    xHalfExtent: 2,
    yHalfExtent: 2,
    coordinateScalePx: SCALE,
    expectedFinalMatrix: [
      [2, 1],
      [0, 1],
    ],
  };

  function stateNodes(
    matrix: readonly [readonly [number, number], readonly [number, number]],
    observed = matrix,
  ): NodeSample[] {
    const prefix = "semantic:grid:transformed";
    const basis1 = { x: observed[0][0] * SCALE, y: -observed[1][0] * SCALE };
    const basis2 = { x: observed[0][1] * SCALE, y: -observed[1][1] * SCALE };
    const plus = (
      a: { x: number; y: number },
      b: { x: number; y: number },
    ) => ({
      x: a.x + b.x,
      y: a.y + b.y,
    });
    const times = (a: { x: number; y: number }, amount: number) => ({
      x: a.x * amount,
      y: a.y * amount,
    });
    const nodes: NodeSample[] = [];
    for (const coordinate of [-2, -1, 0, 1, 2]) {
      const verticalOffset = times(basis1, coordinate);
      const horizontalOffset = times(basis2, coordinate);
      nodes.push(
        line(`${prefix}:x:${coordinate}`, [
          plus(verticalOffset, times(basis2, -2)),
          plus(verticalOffset, times(basis2, 2)),
        ]),
        line(`${prefix}:y:${coordinate}`, [
          plus(horizontalOffset, times(basis1, -2)),
          plus(horizontalOffset, times(basis1, 2)),
        ]),
      );
    }
    nodes.push(
      line("semantic:matrix:column-1", [{ x: 0, y: 0 }, basis1]),
      line("semantic:matrix:column-2", [{ x: 0, y: 0 }, basis2]),
      node("semantic:matrix:ledger:row:matrix:value", {
        type: "Txt",
        text: `A = [[${matrix[0][0]}, ${matrix[0][1]}], [${matrix[1][0]}, ${matrix[1][1]}]]`,
      }),
    );
    return nodes;
  }

  function matrixRun(states: NodeSample[][]): SceneGateRun {
    return {
      ...run([]),
      frames: states.map((nodes, index) => ({
        ...frame(nodes),
        frame: index * 15,
        time: index * 0.5,
      })),
    };
  }

  it("checks establishing, intermediate, singular, and landing states against the live readout", () => {
    const fixture = matrixRun([
      stateNodes([
        [1, 0],
        [0, 1],
      ]),
      stateNodes([
        [1.5, 0.5],
        [0, 1],
      ]),
      stateNodes([
        [1, 0],
        [0, 0],
      ]),
      stateNodes([
        [2, 1],
        [0, 1],
      ]),
    ]);
    expect(checkSemanticGeometry(fixture, [contract])).toEqual([]);
  });

  it("rejects geometry that disagrees with a displayed matrix", () => {
    const fixture = matrixRun([
      stateNodes([
        [1, 0],
        [0, 1],
      ]),
      stateNodes(
        [
          [2, 1],
          [0, 1],
        ],
        [
          [1, 0],
          [0, 1],
        ],
      ),
      stateNodes([
        [1, 0],
        [0, 0],
      ]),
      stateNodes([
        [2, 1],
        [0, 1],
      ]),
    ]);
    expect(
      checkSemanticGeometry(fixture, [contract]).some((finding) =>
        finding.message.includes("displayed matrix column"),
      ),
    ).toBe(true);
  });

  it("rejects a singular readout whose lattice remains two-dimensional", () => {
    const fixture = matrixRun([
      stateNodes([
        [1, 0],
        [0, 1],
      ]),
      stateNodes(
        [
          [1, 0],
          [0, 0],
        ],
        [
          [1, 0],
          [0, 0.5],
        ],
      ),
      stateNodes([
        [1.5, 0.5],
        [0, 1],
      ]),
      stateNodes([
        [2, 1],
        [0, 1],
      ]),
    ]);
    expect(
      checkSemanticGeometry(fixture, [contract]).some((finding) =>
        finding.message.includes("collapse"),
      ),
    ).toBe(true);
  });
});

describe("fixed-intersection contracts", () => {
  const contract: SceneGeometryContract = {
    kind: "line-intersection",
    id: "row-operation-fixed-intersection",
    movingLineKey: "semantic:elimination:row-2-line",
    fixedPointKey: "semantic:elimination:solution",
    segmentIds: ["operation"],
  };

  it("accepts a constraint pivoting continuously through the fixed solution", () => {
    const frames = [
      line("semantic:elimination:row-2-line", [
        { x: -40, y: 0 },
        { x: 40, y: 0 },
      ]),
      line("semantic:elimination:row-2-line", [
        { x: -40, y: -40 },
        { x: 40, y: 40 },
      ]),
    ].map((moving, index) => ({
      ...frame([
        moving,
        node("semantic:elimination:solution", { type: "Circle", x: 0, y: 0 }),
      ]),
      frame: index * 15,
      time: index * 0.5,
    }));
    const fixture = { ...run([], "operation"), frames };
    expect(checkSemanticGeometry(fixture, [contract])).toEqual([]);
  });

  it("rejects a moving constraint that leaves the claimed solution", () => {
    const frames = [
      line("semantic:elimination:row-2-line", [
        { x: -40, y: 0 },
        { x: 40, y: 0 },
      ]),
      line("semantic:elimination:row-2-line", [
        { x: -40, y: 15 },
        { x: 40, y: 15 },
      ]),
    ].map((moving, index) => ({
      ...frame([
        moving,
        node("semantic:elimination:solution", { type: "Circle", x: 0, y: 0 }),
      ]),
      frame: index * 15,
      time: index * 0.5,
    }));
    const fixture = { ...run([], "operation"), frames };
    expect(
      checkSemanticGeometry(fixture, [contract]).some((finding) =>
        finding.message.includes("left the claimed fixed solution"),
      ),
    ).toBe(true);
  });
});
