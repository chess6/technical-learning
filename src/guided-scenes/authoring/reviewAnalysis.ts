import type {
  NodeSample,
  SceneFrameSample,
  SceneGateRun,
} from "../validation/gateTypes";
import { runSceneHardGates } from "../validation/hardGates";
import type {
  BeatSpec,
  ObservableProperty,
  ResolvedCheckpoint,
  SceneBeatContract,
} from "./beatSpec";

const CHANGE_FLOOR = 0.5;
const STABLE_CEILING = 0.5;

export interface ReviewAssertion {
  beatId: string;
  objectId: string;
  property: ObservableProperty | "required" | "stable";
  expectation: string;
  observed: string;
  measured: number;
  pass: boolean;
}

export interface ReviewTrajectoryPoint {
  frame: number;
  time: number;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  text?: string;
}

export interface ReviewTrajectory {
  beatId: string;
  objectId: string;
  nodeKey: string;
  points: ReviewTrajectoryPoint[];
}

export interface CompactReviewAnalysis {
  sceneId: string;
  fps: number;
  durationFrames: number;
  sampledFrames: number;
  assertions: ReviewAssertion[];
  trajectories: ReviewTrajectory[];
  directSeeks: Array<{
    beatId: string;
    frame: number;
    canvasMatch: boolean;
    unmeasuredFromStart: number;
    unmeasuredFromEnd: number;
  }>;
  hardGateFindings: ReturnType<typeof runSceneHardGates>;
  failures: string[];
}

function matches(selector: string, key: string): boolean {
  return selector.endsWith("*")
    ? key.startsWith(selector.slice(0, -1))
    : key === selector;
}

function selectedNodes(
  frame: SceneFrameSample,
  selector: string,
): NodeSample[] {
  return Object.entries(frame.nodes)
    .filter(([key]) => matches(selector, key))
    .map(([, node]) => node);
}

function geometryDelta(before: NodeSample, after: NodeSample): number {
  let delta =
    Math.hypot(after.x - before.x, after.y - before.y) +
    Math.abs(after.width - before.width) +
    Math.abs(after.height - before.height);
  const count = Math.min(before.points?.length ?? 0, after.points?.length ?? 0);
  for (let index = 0; index < count; index += 1) {
    delta += Math.hypot(
      after.points![index]!.x - before.points![index]!.x,
      after.points![index]!.y - before.points![index]!.y,
    );
  }
  delta += Math.abs((after.drawnStart ?? 0) - (before.drawnStart ?? 0)) * 100;
  delta += Math.abs((after.drawnEnd ?? 0) - (before.drawnEnd ?? 0)) * 100;
  return delta;
}

function propertyDelta(
  property: ObservableProperty | "stable",
  before: NodeSample,
  after: NodeSample,
): number {
  if (property === "geometry" || property === "camera") {
    return geometryDelta(before, after);
  }
  if (property === "opacity")
    return Math.abs(after.opacity - before.opacity) * 10;
  if (property === "text") return after.text === before.text ? 0 : 10;
  if (property === "presence") return 0;
  if (property === "style") return 0;
  if (property === "stable") {
    return geometryDelta(before, after);
  }
  return (
    geometryDelta(before, after) +
    Math.abs(after.opacity - before.opacity) * 10 +
    (after.text === before.text ? 0 : 10)
  );
}

function framesForBeat(run: SceneGateRun, beatId: string): SceneFrameSample[] {
  const segment = run.segments.find(({ id }) => id === beatId);
  if (!segment) return [];
  return run.frames.filter(
    ({ time }) => time >= segment.start && time < segment.end,
  );
}

function framesForAssertions(
  run: SceneGateRun,
  beat: BeatSpec,
): SceneFrameSample[] {
  const segment = run.segments.find(({ id }) => id === beat.id);
  const landing = beat.checkpoints.find(({ id }) => id === "landing");
  if (!segment || landing?.anchor.kind !== "phase") {
    return framesForBeat(run, beat.id);
  }
  const phaseId = landing.anchor.phaseId;
  const phase = segment.beats.find(({ id }) => id === phaseId);
  if (!phase) return framesForBeat(run, beat.id);
  return run.frames.filter(
    ({ time }) => time >= phase.start && time < phase.end,
  );
}

function selectorDeltas(
  frames: readonly SceneFrameSample[],
  selector: string,
  property: ObservableProperty | "stable",
): number[] {
  const values: number[] = [];
  for (let index = 1; index < frames.length; index += 1) {
    const before = frames[index - 1]!;
    const after = frames[index]!;
    const keys = new Set([
      ...Object.keys(before.nodes).filter((key) => matches(selector, key)),
      ...Object.keys(after.nodes).filter((key) => matches(selector, key)),
    ]);
    let delta = 0;
    for (const key of keys) {
      const a = before.nodes[key];
      const b = after.nodes[key];
      if (!a || !b) {
        delta += property === "presence" || property === "stable" ? 10 : 0;
      } else {
        delta += propertyDelta(property, a, b);
      }
    }
    values.push(delta);
  }
  return values;
}

function observedPresence(
  frames: readonly SceneFrameSample[],
  selector: string,
): number[] {
  return frames.map(
    (frame) =>
      selectedNodes(frame, selector).filter(({ opacity }) => opacity > 0.06)
        .length,
  );
}

function assertionForChange(
  beat: BeatSpec,
  frames: readonly SceneFrameSample[],
  change: NonNullable<BeatSpec["expectedChanges"]>[number],
): ReviewAssertion {
  const presence = observedPresence(frames, change.objectId);
  const deltas = selectorDeltas(frames, change.objectId, change.property);
  const total = deltas.reduce((sum, value) => sum + value, 0);
  const changingPairs = deltas.filter((value) => value > CHANGE_FLOOR).length;
  const first = presence[0] ?? 0;
  const last = presence.at(-1) ?? 0;
  let pass = total > CHANGE_FLOOR;
  let observed = `delta ${total.toFixed(2)} across ${changingPairs} sampled transitions`;
  if (change.expectation === "appear") {
    pass = Math.max(...presence, 0) > first;
    observed = `visible count ${first} → ${Math.max(...presence, 0)}`;
  } else if (change.expectation === "disappear") {
    pass = first > Math.min(...presence, first);
    observed = `visible count ${first} → minimum ${Math.min(...presence, first)}`;
  } else if (change.continuous) {
    pass = pass && changingPairs >= Math.min(2, deltas.length);
  }
  return {
    beatId: beat.id,
    objectId: change.objectId,
    property: change.property,
    expectation: `${change.expectation}${change.continuous ? ", continuous" : ""}`,
    observed,
    measured: change.expectation === "change" ? total : last - first,
    pass,
  };
}

function assertionForStable(
  beat: BeatSpec,
  frames: readonly SceneFrameSample[],
  objectId: string,
): ReviewAssertion {
  const deltas = selectorDeltas(frames, objectId, "stable");
  const maximum = Math.max(...deltas, 0);
  return {
    beatId: beat.id,
    objectId,
    property: "stable",
    expectation: `no observable change above ${STABLE_CEILING}`,
    observed: `maximum adjacent delta ${maximum.toFixed(2)}`,
    measured: maximum,
    pass: maximum <= STABLE_CEILING,
  };
}

function nearestFrame(
  run: SceneGateRun,
  frame: number,
): SceneFrameSample | undefined {
  return run.frames.reduce<SceneFrameSample | undefined>(
    (nearest, candidate) =>
      !nearest ||
      Math.abs(candidate.frame - frame) < Math.abs(nearest.frame - frame)
        ? candidate
        : nearest,
    undefined,
  );
}

function requiredAssertions(
  checkpoints: readonly ResolvedCheckpoint[],
  run: SceneGateRun,
): ReviewAssertion[] {
  return checkpoints.flatMap((checkpoint) => {
    const frame = nearestFrame(run, checkpoint.frame);
    return checkpoint.requiredObjects.map((objectId) => {
      const count = frame ? selectedNodes(frame, objectId).length : 0;
      return {
        beatId: checkpoint.beatId,
        objectId,
        property: "required" as const,
        expectation: `measurable at ${checkpoint.checkpointId}`,
        observed: `${count} matching nodes near frame ${checkpoint.frame}`,
        measured: count,
        pass: count > 0,
      };
    });
  });
}

function trajectories(
  contract: SceneBeatContract,
  run: SceneGateRun,
): ReviewTrajectory[] {
  return contract.beats.flatMap((beat) => {
    const frames = framesForBeat(run, beat.id);
    if (frames.length === 0) return [];
    const selected = [
      frames[0]!,
      frames[Math.floor(frames.length / 2)]!,
      frames.at(-1)!,
    ];
    return beat.focalObjects.flatMap((objectId) => {
      const keys = new Set(
        selected.flatMap((frame) =>
          Object.keys(frame.nodes).filter((key) => matches(objectId, key)),
        ),
      );
      return [...keys].map((nodeKey) => ({
        beatId: beat.id,
        objectId,
        nodeKey,
        points: selected.flatMap((frame) => {
          const node = frame.nodes[nodeKey];
          return node
            ? [
                {
                  frame: frame.frame,
                  time: frame.time,
                  x: node.x,
                  y: node.y,
                  width: node.width,
                  height: node.height,
                  opacity: node.opacity,
                  ...(node.text === undefined ? {} : { text: node.text }),
                },
              ]
            : [];
        }),
      }));
    });
  });
}

/** Reduce a production gate run to stable, reviewable semantic evidence. */
export function analyzeReviewRun(
  contract: SceneBeatContract,
  checkpoints: readonly ResolvedCheckpoint[],
  run: SceneGateRun,
): CompactReviewAnalysis {
  const assertions = [
    ...contract.beats.flatMap((beat) => {
      const landingFrames = framesForAssertions(run, beat);
      const fullBeatFrames = framesForBeat(run, beat.id);
      return [
        ...beat.expectedChanges.map((change) =>
          assertionForChange(
            beat,
            change.property === "geometry" || change.property === "camera"
              ? landingFrames
              : fullBeatFrames,
            change,
          ),
        ),
        ...beat.expectedStableObjects.map((objectId) =>
          assertionForStable(beat, fullBeatFrames, objectId),
        ),
      ];
    }),
    ...requiredAssertions(checkpoints, run),
  ];
  const hardGateFindings = runSceneHardGates(run);
  const directSeeks = run.seekRecords.map((record) => ({
    beatId: record.segmentId,
    frame: record.frame,
    canvasMatch: record.hashFromStart === record.hashFromEnd,
    unmeasuredFromStart: record.unmeasuredFromStart?.length ?? 0,
    unmeasuredFromEnd: record.unmeasuredFromEnd?.length ?? 0,
  }));
  const failures = [
    ...assertions
      .filter(({ pass }) => !pass)
      .map(
        ({ beatId, objectId, expectation, observed }) =>
          `${beatId}: ${objectId} expected ${expectation}; observed ${observed}`,
      ),
    ...hardGateFindings.map(({ message }) => message),
    ...directSeeks
      .filter(({ canvasMatch }) => !canvasMatch)
      .map(
        ({ beatId }) =>
          `${beatId}: direct seek produced direction-dependent canvas`,
      ),
  ];
  return {
    sceneId: run.sceneId,
    fps: run.fps,
    durationFrames: run.durationFrames,
    sampledFrames: run.frames.length,
    assertions,
    trajectories: trajectories(contract, run),
    directSeeks,
    hardGateFindings,
    failures,
  };
}
