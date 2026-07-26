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
  type LineIntersectionGeometryContract,
  type MatrixGridGeometryContract,
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

function checkGridFrame(
  run: SceneGateRun,
  contract: GridGeometryContract,
  frame: SceneFrameSample,
): SceneGateFinding[] {
  const lines = matchingGridLines(frame, contract);
  if (lines.length === 0) return [];

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

  // Infer the displayed lattice basis from its axes. This keeps the contract
  // valid under an authored viewport reframe while still checking every family
  // line, integer coordinate, and shared origin in world space.
  const basis1 = scale(
    {
      x: xAxis.points[xAxis.points.length - 1]!.x - xAxis.points[0]!.x,
      y: xAxis.points[xAxis.points.length - 1]!.y - xAxis.points[0]!.y,
    },
    1 / (2 * contract.xHalfExtent),
  );
  const basis2 = scale(
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

function checkGridContract(
  run: SceneGateRun,
  contract: GridGeometryContract,
): SceneGateFinding[] {
  const seekFrames: SceneFrameSample[] = run.seekRecords.flatMap((record) => [
    {
      frame: record.frame,
      time: 0,
      nodes: record.nodesFromStart,
      unmeasured: record.unmeasuredFromStart ?? [],
    },
    {
      frame: record.frame,
      time: 0,
      nodes: record.nodesFromEnd,
      unmeasured: record.unmeasuredFromEnd ?? [],
    },
  ]);
  const frames = [...run.frames, ...seekFrames].filter(
    (frame) => matchingGridLines(frame, contract).length > 0,
  );
  if (frames.length === 0) {
    return [
      gridFinding(
        run,
        contract,
        undefined,
        "no measurable grid lines were visible",
      ),
    ];
  }
  const firstFinding = new Map<string, SceneGateFinding>();
  for (const frame of frames) {
    for (const finding of checkGridFrame(run, contract, frame)) {
      const identity = `${finding.nodeKey ?? "scene"}\0${finding.message}`;
      if (!firstFinding.has(identity)) firstFinding.set(identity, finding);
    }
  }
  return [...firstFinding.values()];
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

function parseDisplayedMatrix(
  text: string | undefined,
): readonly [readonly [number, number], readonly [number, number]] | undefined {
  const normalized = text?.replaceAll("−", "-");
  const match = normalized?.match(
    /\[\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]\s*,\s*\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]\]/,
  );
  if (!match) return undefined;
  return [
    [Number(match[1]), Number(match[2])],
    [Number(match[3]), Number(match[4])],
  ];
}

function vectorBetween(
  points: readonly Point[] | undefined,
): Point | undefined {
  if (!points || points.length < 2) return undefined;
  return {
    x: points[points.length - 1]!.x - points[0]!.x,
    y: points[points.length - 1]!.y - points[0]!.y,
  };
}

function contractFinding(
  run: SceneGateRun,
  id: string,
  message: string,
  frame?: SceneFrameSample,
  nodeKey?: string,
  measured?: number,
): SceneGateFinding {
  return {
    gate: "semantic-geometry",
    sceneId: run.sceneId,
    segmentId: id,
    frame: frame?.frame,
    nodeKey,
    measured,
    limit: GEOMETRY_TOLERANCE_PX,
    message: `${id}: ${message}`,
  };
}

function checkMatrixGridContract(
  run: SceneGateRun,
  contract: MatrixGridGeometryContract,
): SceneGateFinding[] {
  const frames = run.frames.filter((frame) => {
    const readout = frame.nodes[contract.matrixReadoutKey];
    return (
      isVisible(readout) &&
      Object.values(frame.nodes).some(
        (node) => isVisible(node) && node.key.startsWith(`${contract.prefix}:`),
      )
    );
  });
  if (frames.length === 0) {
    return [
      contractFinding(
        run,
        contract.id,
        "no frame exposed both the live matrix readout and transformed grid",
      ),
    ];
  }

  const findings: SceneGateFinding[] = [];
  const states = new Set<string>();
  for (const frame of frames) {
    const readout = frame.nodes[contract.matrixReadoutKey];
    const matrix = parseDisplayedMatrix(readout?.text);
    if (!matrix) {
      findings.push(
        contractFinding(
          run,
          contract.id,
          "live matrix readout could not be parsed",
          frame,
          contract.matrixReadoutKey,
        ),
      );
      continue;
    }
    states.add(
      matrix
        .flat()
        .map((n) => n.toFixed(2))
        .join(","),
    );
    const xAxis = frame.nodes[`${contract.prefix}:y:0`];
    const yAxis = frame.nodes[`${contract.prefix}:x:0`];
    const xVector = vectorBetween(xAxis?.points);
    const yVector = vectorBetween(yAxis?.points);
    const xOrigin = xAxis?.points ? midpoint(xAxis.points) : undefined;
    const yOrigin = yAxis?.points ? midpoint(yAxis.points) : undefined;
    if (!xVector || !yVector || !xOrigin || !yOrigin) {
      findings.push(
        contractFinding(
          run,
          contract.id,
          "transformed axes were not measurable",
          frame,
        ),
      );
      continue;
    }
    const originError = distance(xOrigin, yOrigin);
    if (originError > GEOMETRY_TOLERANCE_PX) {
      findings.push(
        contractFinding(
          run,
          contract.id,
          "transformed axes do not share the live origin",
          frame,
          xAxis.key,
          originError,
        ),
      );
    }
    const observed = [
      scale(xVector, 1 / (2 * contract.xHalfExtent)),
      scale(yVector, 1 / (2 * contract.yHalfExtent)),
    ] as const;
    const expected = [
      {
        x: matrix[0][0] * contract.coordinateScalePx,
        y: -matrix[1][0] * contract.coordinateScalePx,
      },
      {
        x: matrix[0][1] * contract.coordinateScalePx,
        y: -matrix[1][1] * contract.coordinateScalePx,
      },
    ] as const;
    const denominator = expected.reduce(
      (sum, vector) => sum + vector.x ** 2 + vector.y ** 2,
      0,
    );
    const viewportScale =
      denominator > 1e-9
        ? expected.reduce(
            (sum, vector, index) =>
              sum +
              vector.x * observed[index]!.x +
              vector.y * observed[index]!.y,
            0,
          ) / denominator
        : 1;
    expected.forEach((vector, index) => {
      const error = distance(observed[index]!, scale(vector, viewportScale));
      if (error > GEOMETRY_TOLERANCE_PX) {
        findings.push(
          contractFinding(
            run,
            contract.id,
            `grid basis ${index + 1} disagrees with the displayed matrix column`,
            frame,
            index === 0 ? xAxis.key : yAxis.key,
            error,
          ),
        );
      }
      const column = frame.nodes[contract.columnKeys[index]!];
      const columnVector = vectorBetween(column?.points);
      if (!columnVector) {
        findings.push(
          contractFinding(
            run,
            contract.id,
            `matrix column object ${index + 1} was not measurable`,
            frame,
            contract.columnKeys[index],
          ),
        );
      } else {
        const columnError = distance(columnVector, observed[index]!);
        if (columnError > GEOMETRY_TOLERANCE_PX) {
          findings.push(
            contractFinding(
              run,
              contract.id,
              `matrix column ${index + 1} disagrees with the transformed lattice`,
              frame,
              contract.columnKeys[index],
              columnError,
            ),
          );
        }
      }
    });

    const determinant =
      matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    const cross = Math.abs(
      observed[0].x * observed[1].y - observed[0].y * observed[1].x,
    );
    const maxBasisLength = Math.max(
      Math.hypot(observed[0].x, observed[0].y),
      Math.hypot(observed[1].x, observed[1].y),
      1,
    );
    const normalizedArea = cross / maxBasisLength ** 2;
    // The on-canvas readout is rounded while the underlying matrix is live.
    // A displayed zero may therefore represent <0.05 during a tween; require
    // collapse within that display precision, then enforce exact rank at holds.
    if (Math.abs(determinant) < 1e-6 && normalizedArea > 0.06) {
      findings.push(
        contractFinding(
          run,
          contract.id,
          "singular matrix did not collapse the lattice to lower dimension",
          frame,
          contract.prefix,
          normalizedArea,
        ),
      );
    }
  }

  if (states.size < 3) {
    findings.push(
      contractFinding(
        run,
        contract.id,
        "fewer than three distinct live transformation states were validated",
      ),
    );
  }
  const lastReadout = [...run.frames]
    .reverse()
    .map((frame) => frame.nodes[contract.matrixReadoutKey])
    .find(isVisible);
  const finalMatrix = parseDisplayedMatrix(lastReadout?.text);
  if (
    !finalMatrix ||
    finalMatrix.some((row, i) =>
      row.some((value, j) => value !== contract.expectedFinalMatrix[i]![j]),
    )
  ) {
    findings.push(
      contractFinding(
        run,
        contract.id,
        "final displayed matrix does not match shared lesson data",
        undefined,
        contract.matrixReadoutKey,
      ),
    );
  }
  const firstByIdentity = new Map<string, SceneGateFinding>();
  for (const finding of findings) {
    const identity = `${finding.nodeKey ?? "scene"}\0${finding.message}`;
    if (!firstByIdentity.has(identity)) firstByIdentity.set(identity, finding);
  }
  return [...firstByIdentity.values()];
}

function distanceToInfiniteLine(point: Point, line: readonly Point[]): number {
  if (line.length < 2) return Number.POSITIVE_INFINITY;
  const a = line[0]!;
  const b = line[line.length - 1]!;
  const length = distance(a, b);
  if (length < 1e-9) return distance(point, a);
  return (
    Math.abs((b.x - a.x) * (a.y - point.y) - (a.x - point.x) * (b.y - a.y)) /
    length
  );
}

function checkLineIntersectionContract(
  run: SceneGateRun,
  contract: LineIntersectionGeometryContract,
): SceneGateFinding[] {
  const frames = framesInSegments(run, contract.segmentIds).filter(
    (frame) =>
      isVisible(frame.nodes[contract.movingLineKey]) &&
      isVisible(frame.nodes[contract.fixedPointKey]),
  );
  if (frames.length < 2) {
    return [
      contractFinding(
        run,
        contract.id,
        "moving constraint and fixed solution were not jointly measurable",
      ),
    ];
  }
  const failing = frames.find((frame) => {
    const line = frame.nodes[contract.movingLineKey]!;
    const point = frame.nodes[contract.fixedPointKey]!;
    return (
      !line.points ||
      distanceToInfiniteLine({ x: point.x, y: point.y }, line.points) >
        GEOMETRY_TOLERANCE_PX
    );
  });
  if (!failing) return [];
  const line = failing.nodes[contract.movingLineKey]!;
  const point = failing.nodes[contract.fixedPointKey]!;
  return [
    contractFinding(
      run,
      contract.id,
      "row-operation line left the claimed fixed solution",
      failing,
      contract.movingLineKey,
      line.points
        ? distanceToInfiniteLine({ x: point.x, y: point.y }, line.points)
        : Number.POSITIVE_INFINITY,
    ),
  ];
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
    if (contract.kind === "matrix-grid") {
      findings.push(...checkMatrixGridContract(run, contract));
      continue;
    }
    if (contract.kind === "line-intersection") {
      findings.push(...checkLineIntersectionContract(run, contract));
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
