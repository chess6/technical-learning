import rawBeatIntents from "./sceneBeatIntents.json";
import type {SceneBeats, SceneSegment} from "./sceneTimings";

export type BeatIntent =
  | "hold"
  | "text"
  | "emphasis"
  | "geometry"
  | "camera"
  | "transition";

export type BeatIntentSpec =
  | Exclude<BeatIntent, "geometry" | "camera">
  | {
      intent: "geometry" | "camera";
      /** Stable scene-graph keys; a trailing `*` means a key prefix. */
      targets: readonly string[];
    };

export interface BeatIntentWindow {
  id: string;
  intent: BeatIntent;
  start: number;
  end: number;
  targets: readonly string[];
}

type BeatIntentRegistry = Record<
  string,
  Record<string, Record<string, BeatIntentSpec>>
>;

export const SCENE_BEAT_INTENTS =
  rawBeatIntents as unknown as BeatIntentRegistry;

function normalizeIntent(spec: BeatIntentSpec): {
  intent: BeatIntent;
  targets: readonly string[];
} {
  return typeof spec === "string"
    ? {intent: spec, targets: []}
    : {intent: spec.intent, targets: spec.targets};
}

export function intentWindowsForSegment(
  sceneId: string,
  segment: SceneSegment,
  segmentStart: number,
  beats: Record<string, number>,
): BeatIntentWindow[] {
  const declared = SCENE_BEAT_INTENTS[sceneId]?.[segment.id];
  if (!declared) {
    throw new Error(`No explicit beat intents for ${sceneId}.${segment.id}`);
  }
  let cursor = segmentStart;
  return Object.entries(beats).map(([id, duration]) => {
    const spec = declared[id];
    if (!spec) {
      throw new Error(`No explicit intent for ${sceneId}.${segment.id}.${id}`);
    }
    const {intent, targets} = normalizeIntent(spec);
    const window = {id, intent, targets, start: cursor, end: cursor + duration};
    cursor += duration;
    return window;
  });
}

/** Pure conformance audit: names never decide intent and no beat is unclassified. */
export function validateBeatIntentRegistry(
  sceneBeats: Record<string, SceneBeats>,
): string[] {
  const problems: string[] = [];
  for (const [sceneId, segments] of Object.entries(sceneBeats)) {
    for (const [segmentId, beats] of Object.entries(segments)) {
      const intents = SCENE_BEAT_INTENTS[sceneId]?.[segmentId];
      if (!intents) {
        problems.push(`${sceneId}.${segmentId}: missing intent map`);
        continue;
      }
      const beatIds = Object.keys(beats).sort();
      const intentIds = Object.keys(intents).sort();
      if (beatIds.join("\0") !== intentIds.join("\0")) {
        problems.push(
          `${sceneId}.${segmentId}: beat keys ${beatIds.join(", ")} != intent keys ${intentIds.join(", ")}`,
        );
      }
      for (const [beatId, spec] of Object.entries(intents)) {
        const {intent, targets} = normalizeIntent(spec);
        if (
          (intent === "geometry" || intent === "camera") &&
          targets.length === 0
        ) {
          problems.push(
            `${sceneId}.${segmentId}.${beatId}: ${intent} intent needs named targets`,
          );
        }
      }
    }
  }
  for (const sceneId of Object.keys(SCENE_BEAT_INTENTS)) {
    if (!sceneBeats[sceneId]) {
      problems.push(`${sceneId}: intent map has no timing registry`);
    }
  }
  return problems;
}
