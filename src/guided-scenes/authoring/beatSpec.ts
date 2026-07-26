import type { BeatIntent } from "../scenes/beatIntents";
import { SCENE_BEATS, SCENE_SEGMENTS } from "../scenes/sceneTimings";

export type SemanticObjectId = `semantic:${string}` | `presentation:${string}`;
export type ObservableProperty =
  "geometry" | "camera" | "text" | "opacity" | "presence" | "style";

export interface SemanticChangeSpec {
  objectId: SemanticObjectId;
  property: ObservableProperty;
  expectation: "change" | "appear" | "disappear";
  /** Geometry/camera claims must be continuous, not a one-frame replacement. */
  continuous?: boolean;
}

export type CheckpointAnchor =
  | { kind: "segment"; position: "opening" | "midpoint" | "final" }
  | {
      kind: "phase";
      phaseId: string;
      position: "start" | "midpoint" | "end";
    };

export interface CheckpointSpec {
  id: "opening" | "midpoint" | "landing" | "final" | string;
  anchor: CheckpointAnchor;
  requiredObjects?: readonly SemanticObjectId[];
}

export interface BeatSpec {
  id: string;
  purpose: string;
  intent: BeatIntent;
  focalObjects: readonly SemanticObjectId[];
  /** Stable authoring event name; durations continue to live in sceneTimings. */
  timingEvent: string;
  chapter: {
    id: string;
    title: string;
    summary?: string;
    seek: { kind: "segment-opening" };
  };
  invariant: string;
  prediction?: { question: string; revealBeat: string };
  checkpoints: readonly CheckpointSpec[];
  expectedChanges: readonly SemanticChangeSpec[];
  expectedStableObjects: readonly SemanticObjectId[];
}

export type SceneMathDatum =
  | string
  | number
  | boolean
  | readonly number[]
  | readonly (readonly number[])[];

export interface SceneBeatContract {
  sceneId: string;
  semanticObjects: readonly SemanticObjectId[];
  mathData: Readonly<Record<string, SceneMathDatum>>;
  beats: readonly BeatSpec[];
}

export interface ResolvedCheckpoint {
  sceneId: string;
  beatId: string;
  checkpointId: string;
  time: number;
  frame: number;
  requiredObjects: readonly SemanticObjectId[];
}

function segmentStart(sceneId: string, segmentId: string): number {
  const segments = SCENE_SEGMENTS[sceneId] ?? [];
  let cursor = 0;
  for (const segment of segments) {
    if (segment.id === segmentId) return cursor;
    cursor += segment.duration;
  }
  throw new Error(`Unknown segment ${sceneId}.${segmentId}`);
}

function phaseBounds(
  sceneId: string,
  segmentId: string,
  phaseId: string,
): { start: number; end: number } {
  const phases = SCENE_BEATS[sceneId]?.[segmentId];
  if (!phases) throw new Error(`No phases for ${sceneId}.${segmentId}`);
  let cursor = segmentStart(sceneId, segmentId);
  for (const [id, duration] of Object.entries(phases)) {
    const start = cursor;
    cursor += duration;
    if (id === phaseId) return { start, end: cursor };
  }
  throw new Error(`Unknown phase ${sceneId}.${segmentId}.${phaseId}`);
}

function checkpointTime(
  contract: SceneBeatContract,
  beat: BeatSpec,
  checkpoint: CheckpointSpec,
  fps: number,
): number {
  const segment = SCENE_SEGMENTS[contract.sceneId]!.find(
    ({ id }) => id === beat.id,
  )!;
  const start = segmentStart(contract.sceneId, beat.id);
  const lastFrameInside = Math.max(start, start + segment.duration - 1 / fps);
  if (checkpoint.anchor.kind === "segment") {
    if (checkpoint.anchor.position === "opening") return start;
    if (checkpoint.anchor.position === "midpoint") {
      return start + segment.duration / 2;
    }
    return lastFrameInside;
  }
  const phase = phaseBounds(
    contract.sceneId,
    beat.id,
    checkpoint.anchor.phaseId,
  );
  if (checkpoint.anchor.position === "start") return phase.start;
  if (checkpoint.anchor.position === "midpoint") {
    return phase.start + (phase.end - phase.start) / 2;
  }
  return Math.min(lastFrameInside, phase.end);
}

/** Resolve authored anchors against production timing data for direct seeking. */
export function resolveBeatCheckpoints(
  contract: SceneBeatContract,
  fps = 30,
): ResolvedCheckpoint[] {
  if (!Number.isInteger(fps) || fps <= 0) {
    throw new Error("fps must be a positive integer");
  }
  return contract.beats.flatMap((beat) =>
    beat.checkpoints.map((checkpoint) => {
      const time = checkpointTime(contract, beat, checkpoint, fps);
      return {
        sceneId: contract.sceneId,
        beatId: beat.id,
        checkpointId: checkpoint.id,
        time,
        frame: Math.round(time * fps),
        requiredObjects: checkpoint.requiredObjects ?? [],
      };
    }),
  );
}

function objectIsRegistered(
  objectId: SemanticObjectId,
  registered: readonly SemanticObjectId[],
): boolean {
  if (registered.includes(objectId)) return true;
  const prefix = objectId.endsWith("*") ? objectId.slice(0, -1) : undefined;
  return (
    !!prefix && registered.some((candidate) => candidate.startsWith(prefix))
  );
}

/** Pure authoring-contract audit; production rendering remains the final judge. */
export function validateBeatContract(contract: SceneBeatContract): string[] {
  const problems: string[] = [];
  const segments = SCENE_SEGMENTS[contract.sceneId];
  if (!segments) {
    return [`${contract.sceneId}: no production timing registry`];
  }
  if (Object.keys(contract.mathData).length === 0) {
    problems.push(`${contract.sceneId}: math data is empty`);
  }

  const productionIds = segments.map(({ id }) => id);
  const beatIds = contract.beats.map(({ id }) => id);
  if (new Set(beatIds).size !== beatIds.length) {
    problems.push(`${contract.sceneId}: duplicate beat ids`);
  }
  if (productionIds.join("\0") !== beatIds.join("\0")) {
    problems.push(
      `${contract.sceneId}: BeatSpec ids must match production segment order`,
    );
  }

  const visitObject = (beatId: string, objectId: SemanticObjectId) => {
    if (!objectIsRegistered(objectId, contract.semanticObjects)) {
      problems.push(
        `${contract.sceneId}.${beatId}: unregistered object ${objectId}`,
      );
    }
  };

  for (const beat of contract.beats) {
    if (!beat.purpose.trim()) {
      problems.push(`${contract.sceneId}.${beat.id}: purpose is empty`);
    }
    if (!beat.invariant.trim()) {
      problems.push(`${contract.sceneId}.${beat.id}: invariant is empty`);
    }
    if (beat.chapter.id !== beat.id) {
      problems.push(
        `${contract.sceneId}.${beat.id}: chapter id must match beat id`,
      );
    }
    if (beat.chapter.seek.kind !== "segment-opening") {
      problems.push(
        `${contract.sceneId}.${beat.id}: chapter seek must use segment opening`,
      );
    }
    if (beat.timingEvent !== `${contract.sceneId}.${beat.id}`) {
      problems.push(`${contract.sceneId}.${beat.id}: unstable timing event`);
    }

    const checkpointIds = new Set(beat.checkpoints.map(({ id }) => id));
    for (const required of ["opening", "midpoint", "landing", "final"]) {
      if (!checkpointIds.has(required)) {
        problems.push(
          `${contract.sceneId}.${beat.id}: missing ${required} checkpoint`,
        );
      }
    }
    const phases = SCENE_BEATS[contract.sceneId]?.[beat.id] ?? {};
    for (const checkpoint of beat.checkpoints) {
      if (
        checkpoint.anchor.kind === "phase" &&
        !(checkpoint.anchor.phaseId in phases)
      ) {
        problems.push(
          `${contract.sceneId}.${beat.id}.${checkpoint.id}: unknown phase ${checkpoint.anchor.phaseId}`,
        );
      }
      for (const objectId of checkpoint.requiredObjects ?? [])
        visitObject(beat.id, objectId);
    }

    for (const objectId of beat.focalObjects) visitObject(beat.id, objectId);
    for (const objectId of beat.expectedStableObjects ?? [])
      visitObject(beat.id, objectId);
    for (const change of beat.expectedChanges ?? [])
      visitObject(beat.id, change.objectId);

    const changes = beat.expectedChanges ?? [];
    if (beat.intent === "hold" && changes.length > 0) {
      problems.push(
        `${contract.sceneId}.${beat.id}: hold cannot declare changes`,
      );
    }
    if (beat.intent === "geometry") {
      if (!changes.some(({ property }) => property === "geometry")) {
        problems.push(
          `${contract.sceneId}.${beat.id}: geometry needs geometry change`,
        );
      }
    } else if (changes.some(({ property }) => property === "geometry")) {
      problems.push(
        `${contract.sceneId}.${beat.id}: ${beat.intent} cannot satisfy geometry`,
      );
    }
    if (beat.intent === "camera") {
      if (!changes.some(({ property }) => property === "camera")) {
        problems.push(
          `${contract.sceneId}.${beat.id}: camera needs camera change`,
        );
      }
    } else if (changes.some(({ property }) => property === "camera")) {
      problems.push(
        `${contract.sceneId}.${beat.id}: ${beat.intent} cannot satisfy camera`,
      );
    }
    for (const change of changes) {
      if (
        (change.property === "geometry" || change.property === "camera") &&
        change.continuous !== true
      ) {
        problems.push(
          `${contract.sceneId}.${beat.id}: ${change.objectId} ${change.property} must be continuous`,
        );
      }
      if (beat.expectedStableObjects?.includes(change.objectId)) {
        problems.push(
          `${contract.sceneId}.${beat.id}: ${change.objectId} is both changed and stable`,
        );
      }
    }

    if (beat.prediction && !beatIds.includes(beat.prediction.revealBeat)) {
      problems.push(
        `${contract.sceneId}.${beat.id}: reveal beat ${beat.prediction.revealBeat} is missing`,
      );
    }
  }
  return problems;
}
