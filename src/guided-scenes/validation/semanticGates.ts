import { gridLineCoordinates } from "../scenes/kitLayout";
import {
  VISIBLE_OPACITY,
  isVisible,
  type NodeSample,
  type SceneFrameSample,
  type SceneGateFinding,
  type SceneGateRun,
  type UnmeasuredNodeSample,
} from "./gateTypes";
import {
  geometryContractsForScene,
  type GridGeometryContract,
  type SceneGeometryContract,
} from "./semanticGeometryContracts";

const GEOMETRY_TOLERANCE_PX = 2;

type Point = { x: number; y: number };

function add(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

function scale(point: Point, amount: number): Point {
  return { x: point.x * amount, y: point.y * amount };
}

function midpoint(points: readonly Point[]): Point | undefined {
  if (points.length < 2) return undefined;
  return {
    x: (points[0]!.x + points[points.length - 1]!.x) / 2,
    y: (points[0]!.y + points[points.length - 1]!.y) / 2,
  };
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function endpointError(
  actual: readonly Point[] | undefined,
  expectedA: Point,
  expectedB: Point,
): number {
  if (!actual || actual.length < 2) return Number.POSITIVE_INFINITY;
  const actualA = actual[0]!;
  const actualB = actual[actual.length - 1]!;
  return Math.min(
    Math.max(distance(actualA, expectedA), distance(actualB, expectedB)),
    Math.max(distance(actualA, expectedB), distance(actualB, expectedA)),
  );
}

function matchingGridLines(
  frame: SceneFrameSample,
  contract: GridGeometryContract,
): NodeSample[] {
  const prefix = `${contract.prefix}:`;
  return Object.values(frame.nodes).filter(
    (sample) =>
      isVisible(sample) &&
      sample.type === "Line" &&
      sample.key.startsWith(prefix),
  );
}

function representativeGridFrame(
  run: SceneGateRun,
  contract: GridGeometryContract,
): SceneFrameSample | undefined {
  return run.frames.reduce<SceneFrameSample | undefined>((best, frame) => {
    if (!best) return frame;
    return matchingGridLines(frame, contract).length >
      matchingGridLines(best, contract).length
      ? frame
      : best;
  }, undefined);
}

function gridFinding(
  run: SceneGateRun,
  contract: GridGeometryContract,
  frame: SceneFrameSample | undefined,
  message: string,
  nodeKey?: string,
  measured?: number,
): SceneGateFinding {
  return {
    gate: "semantic-geometry",
    sceneId: run.sceneId,
    segmentId: contract.id,
    frame: frame?.frame,
    nodeKey,
    measured,
    limit: GEOMETRY_TOLERANCE_PX,
    message: `${contract.id}: ${message}`,
  };
}

function checkGridContract(
  run: SceneGateRun,
  contract: GridGeometryContract,
): SceneGateFinding[] {
  const frame = representativeGridFrame(run, contract);
  const lines = frame ? matchingGridLines(frame, contract) : [];
  if (!frame || lines.length === 0) {
    return [
      gridFinding(
        run,
        contract,
        frame,
        "no measurable grid lines were visible",
      ),
    ];
  }

  const byKey = new Map(lines.map((line) => [line.key, line]));
  const xAxisKey = `${contract.prefix}:y:0`;
  const yAxisKey = `${contract.prefix}:x:0`;
  const xAxis = byKey.get(xAxisKey);
  const yAxis = byKey.get(yAxisKey);
  const findings: SceneGateFinding[] = [];
  if (!xAxis) {
    findings.push(
      gridFinding(
        run,
        contract,
        frame,
        "x-axis at coordinate 0 is missing",
        xAxisKey,
      ),
    );
  }
  if (!yAxis) {
    findings.push(
      gridFinding(
        run,
        contract,
        frame,
        "y-axis at coordinate 0 is missing",
        yAxisKey,
      ),
    );
  }

  const nonInteger = lines.find((line) => {
    const coordinate = Number(line.key.slice(line.key.lastIndexOf(":") + 1));
    return !Number.isInteger(coordinate);
  });
  if (nonInteger) {
    findings.push(
      gridFinding(
        run,
        contract,
        frame,
        "grid lines do not occupy the declared integer lattice",
        nonInteger.key,
      ),
    );
  }

  if (!xAxis?.points || !yAxis?.points) return findings;
  const xOrigin = midpoint(xAxis.points);
  const yOrigin = midpoint(yAxis.points);
  if (!xOrigin || !yOrigin) return findings;
  const originError = distance(xOrigin, yOrigin);
  if (originError > GEOMETRY_TOLERANCE_PX) {
    findings.push(
      gridFinding(
        run,
        contract,
        frame,
        "axes do not share an origin",
        xAxis.key,
        originError,
      ),
    );
  }
  const origin = {
    x: (xOrigin.x + yOrigin.x) / 2,
    y: (xOrigin.y + yOrigin.y) / 2,
  };

  const basis1 = contract.coordinateScalePx
    ? { x: contract.coordinateScalePx, y: 0 }
    : scale(
        {
          x: xAxis.points[xAxis.points.length - 1]!.x - xAxis.points[0]!.x,
          y: xAxis.points[xAxis.points.length - 1]!.y - xAxis.points[0]!.y,
        },
        1 / (2 * contract.xHalfExtent),
      );
  const basis2 = contract.coordinateScalePx
    ? { x: 0, y: -contract.coordinateScalePx }
    : scale(
        {
          x: yAxis.points[yAxis.points.length - 1]!.x - yAxis.points[0]!.x,
          y: yAxis.points[yAxis.points.length - 1]!.y - yAxis.points[0]!.y,
        },
        1 / (2 * contract.yHalfExtent),
      );

  for (const coordinate of gridLineCoordinates(contract.xHalfExtent)) {
    const vertical = byKey.get(`${contract.prefix}:x:${coordinate}`);
    if (!vertical) {
      findings.push(
        gridFinding(
          run,
          contract,
          frame,
          "an expected vertical integer-lattice line is missing",
          `${contract.prefix}:x:${coordinate}`,
        ),
      );
      continue;
    }
    const offset = add(origin, scale(basis1, coordinate));
    const error = endpointError(
      vertical.points,
      add(offset, scale(basis2, -contract.yHalfExtent)),
      add(offset, scale(basis2, contract.yHalfExtent)),
    );
    if (error > GEOMETRY_TOLERANCE_PX) {
      findings.push(
        gridFinding(
          run,
          contract,
          frame,
          "a vertical family line breaks the shared lattice geometry",
          vertical.key,
          error,
        ),
      );
    }
  }
  for (const coordinate of gridLineCoordinates(contract.yHalfExtent)) {
    const horizontal = byKey.get(`${contract.prefix}:y:${coordinate}`);
    if (!horizontal) {
      findings.push(
        gridFinding(
          run,
          contract,
          frame,
          "an expected horizontal integer-lattice line is missing",
          `${contract.prefix}:y:${coordinate}`,
        ),
      );
      continue;
    }
    const offset = add(origin, scale(basis2, coordinate));
    const error = endpointError(
      horizontal.points,
      add(offset, scale(basis1, -contract.xHalfExtent)),
      add(offset, scale(basis1, contract.xHalfExtent)),
    );
    if (error > GEOMETRY_TOLERANCE_PX) {
      findings.push(
        gridFinding(
          run,
          contract,
          frame,
          "a horizontal family line breaks the shared lattice geometry",
          horizontal.key,
          error,
        ),
      );
    }
  }
  return findings;
}

function framesInSegments(
  run: SceneGateRun,
  segmentIds: readonly string[],
): SceneFrameSample[] {
  const windows = run.segments.filter((segment) =>
    segmentIds.includes(segment.id),
  );
  return run.frames.filter((frame) =>
    windows.some(
      (segment) =>
        frame.time >= segment.start - 1e-6 && frame.time < segment.end + 1e-6,
    ),
  );
}

function parseDisplayedPair(
  text: string | undefined,
): readonly [number, number] | undefined {
  const match = text?.match(
    /\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/,
  );
  if (!match) return undefined;
  return [Number(match[1]), Number(match[2])];
}

/** Validate axes/lattices and explicit displayed-value/geometry promises. */
export function checkSemanticGeometry(
  run: SceneGateRun,
  contracts: readonly SceneGeometryContract[] = geometryContractsForScene(
    run.sceneId,
  ),
): SceneGateFinding[] {
  const findings: SceneGateFinding[] = [];
  for (const contract of contracts) {
    if (contract.kind === "grid") {
      findings.push(...checkGridContract(run, contract));
      continue;
    }

    const frames = framesInSegments(run, contract.segmentIds);
    if (contract.kind === "vector-readout") {
      const frame = [...frames]
        .reverse()
        .find(
          (candidate) =>
            isVisible(candidate.nodes[contract.vectorKey]) &&
            isVisible(candidate.nodes[contract.readoutKey]),
        );
      const arrow = frame?.nodes[contract.vectorKey];
      const readout = frame?.nodes[contract.readoutKey];
      if (!frame || !arrow?.points || !readout) {
        findings.push({
          gate: "semantic-geometry",
          sceneId: run.sceneId,
          segmentId: contract.id,
          message:
            `${contract.id}: the promised vector and coordinate readout were ` +
            "not both measurable and visible",
        });
        continue;
      }
      const expectedTip = {
        x: contract.expectedMathPoint[0] * contract.coordinateScalePx,
        y: -contract.expectedMathPoint[1] * contract.coordinateScalePx,
      };
      const tip = arrow.points[arrow.points.length - 1]!;
      const start = arrow.points[0]!;
      const tipError = distance(tip, expectedTip);
      const startError = distance(start, { x: 0, y: 0 });
      if (
        tipError > GEOMETRY_TOLERANCE_PX ||
        startError > GEOMETRY_TOLERANCE_PX
      ) {
        findings.push({
          gate: "semantic-geometry",
          sceneId: run.sceneId,
          segmentId: contract.id,
          nodeKey: arrow.key,
          frame: frame.frame,
          measured: Math.max(tipError, startError),
          limit: GEOMETRY_TOLERANCE_PX,
          message: `${contract.id}: arrow tip does not reach the displayed mathematical point`,
        });
      }
      const displayed = parseDisplayedPair(readout.text);
      if (
        !displayed ||
        displayed[0] !== contract.expectedMathPoint[0] ||
        displayed[1] !== contract.expectedMathPoint[1]
      ) {
        findings.push({
          gate: "semantic-geometry",
          sceneId: run.sceneId,
          segmentId: contract.id,
          nodeKey: readout.key,
          frame: frame.frame,
          message:
            `${contract.id}: displayed coordinates do not agree with the ` +
            "contracted mathematical point",
        });
      }
      continue;
    }

    const sample = [...frames]
      .reverse()
      .map((frame) => frame.nodes[contract.nodeKey])
      .find(isVisible);
    if (
      !sample ||
      sample.type !== "Rect" ||
      sample.width < contract.minWidth ||
      sample.height < contract.minHeight
    ) {
      findings.push({
        gate: "semantic-geometry",
        sceneId: run.sceneId,
        segmentId: contract.id,
        nodeKey: contract.nodeKey,
        measured: sample ? Math.min(sample.width, sample.height) : 0,
        message:
          `${contract.id}: a claim about the whole plane needs a full stage ` +
          "cue with no visible finite boundary",
      });
    }
  }
  return findings;
}

function visibleUnmeasured(sample: UnmeasuredNodeSample): boolean {
  return sample.opacity === undefined || sample.opacity > VISIBLE_OPACITY;
}

/** Fail closed when a visible scene node cannot be measured. */
export function checkNoUnmeasuredGeometry(
  run: SceneGateRun,
): SceneGateFinding[] {
  const firstByKey = new Map<
    string,
    { sample: UnmeasuredNodeSample; frame?: number; context: string }
  >();
  for (const frame of run.frames) {
    for (const sample of frame.unmeasured) {
      if (!visibleUnmeasured(sample) || firstByKey.has(sample.key)) continue;
      firstByKey.set(sample.key, {
        sample,
        frame: frame.frame,
        context: `frame ${frame.frame}`,
      });
    }
  }
  for (const record of run.seekRecords) {
    for (const [direction, samples] of [
      ["from start", record.unmeasuredFromStart ?? []],
      ["from end", record.unmeasuredFromEnd ?? []],
    ] as const) {
      for (const sample of samples) {
        if (!visibleUnmeasured(sample) || firstByKey.has(sample.key)) continue;
        firstByKey.set(sample.key, {
          sample,
          frame: record.frame,
          context: `seek ${direction} to ${record.segmentId}`,
        });
      }
    }
  }

  return [...firstByKey.values()].map(({ sample, frame, context }) => ({
    gate: "unmeasured-geometry",
    sceneId: run.sceneId,
    nodeKey: sample.key,
    frame,
    message:
      `${sample.type} "${sample.key}" was visible but unmeasurable at ${context}: ` +
      sample.reason,
  }));
}
