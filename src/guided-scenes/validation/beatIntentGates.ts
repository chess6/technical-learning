import type {
  NodeSample,
  SceneBeatWindow,
  SceneFrameSample,
  SceneGateFinding,
  SceneGateRun,
} from "./gateTypes";

const CHANGE_FLOOR = 0.5;
const BOUNDARY_EPSILON = 1e-4;

function geometryDelta(before: NodeSample, after: NodeSample): number {
  let delta =
    Math.hypot(after.x - before.x, after.y - before.y) +
    Math.abs(after.width - before.width) +
    Math.abs(after.height - before.height);
  if (before.points && after.points) {
    const count = Math.min(before.points.length, after.points.length);
    for (let index = 0; index < count; index += 1) {
      delta += Math.hypot(
        after.points[index]!.x - before.points[index]!.x,
        after.points[index]!.y - before.points[index]!.y,
      );
    }
  }
  if (before.drawnStart !== undefined && after.drawnStart !== undefined) {
    delta += Math.abs(after.drawnStart - before.drawnStart) * 100;
  }
  if (before.drawnEnd !== undefined && after.drawnEnd !== undefined) {
    delta += Math.abs(after.drawnEnd - before.drawnEnd) * 100;
  }
  return delta;
}

function observableDelta(before: NodeSample, after: NodeSample): number {
  return (
    geometryDelta(before, after) +
    Math.abs(after.opacity - before.opacity) * 10 +
    (after.text === before.text ? 0 : 10)
  );
}

function framesInside(
  run: SceneGateRun,
  beat: SceneBeatWindow,
): SceneFrameSample[] {
  return run.frames.filter(
    (frame) =>
      frame.time > beat.start + BOUNDARY_EPSILON &&
      frame.time < beat.end - BOUNDARY_EPSILON,
  );
}

function keysForSelector(
  frames: readonly SceneFrameSample[],
  selector: string,
): string[] {
  const prefix = selector.endsWith("*") ? selector.slice(0, -1) : undefined;
  const keys = new Set<string>();
  for (const frame of frames) {
    for (const key of Object.keys(frame.nodes)) {
      if (prefix ? key.startsWith(prefix) : key === selector) keys.add(key);
    }
  }
  return [...keys];
}

function pairDeltas(
  frames: readonly SceneFrameSample[],
  keys: readonly string[],
  readDelta: (before: NodeSample, after: NodeSample) => number,
): number[] {
  const deltas: number[] = [];
  for (let index = 1; index < frames.length; index += 1) {
    const before = frames[index - 1]!;
    const after = frames[index]!;
    let delta = 0;
    for (const key of keys) {
      const a = before.nodes[key];
      const b = after.nodes[key];
      // Appearing, disappearing, or opacity-only replacement cannot prove a
      // continuous mathematical operation on a persistent object.
      if (!a || !b) continue;
      delta += readDelta(a, b);
    }
    deltas.push(delta);
  }
  return deltas;
}

function finding(
  run: SceneGateRun,
  segmentId: string,
  beat: SceneBeatWindow,
  message: string,
  measured?: number,
): SceneGateFinding {
  return {
    gate: "beat-intent",
    sceneId: run.sceneId,
    segmentId,
    measured,
    limit: CHANGE_FLOOR,
    message: `${segmentId}.${beat.id} (${beat.intent}): ${message}`,
  };
}

/**
 * Enforce authored beat semantics.
 *
 * Names are deliberately ignored. Holds must actually hold. Geometry/camera
 * beats must name persistent targets and move those targets continuously;
 * captions, pulses, opacity swaps, and unrelated insertions never satisfy
 * that claim. Text, emphasis, and transition beats are allowed choreography
 * but make no mathematical-motion claim.
 */
export function checkBeatIntents(run: SceneGateRun): SceneGateFinding[] {
  const findings: SceneGateFinding[] = [];
  for (const segment of run.segments) {
    for (const beat of segment.beats) {
      const frames = framesInside(run, beat);
      if (frames.length < 2) continue;

      if (beat.intent === "hold") {
        const keys = [
          ...new Set(frames.flatMap((frame) => Object.keys(frame.nodes))),
        ];
        const deltas = pairDeltas(frames, keys, observableDelta);
        const total = deltas.reduce((sum, delta) => sum + delta, 0);
        if (total > CHANGE_FLOOR) {
          findings.push(
            finding(
              run,
              segment.id,
              beat,
              "a declared hold contains a rendered tween or state change",
              total,
            ),
          );
        }
        continue;
      }

      if (beat.intent !== "geometry" && beat.intent !== "camera") continue;
      if (beat.targets.length === 0) {
        findings.push(
          finding(
            run,
            segment.id,
            beat,
            "the operation names no mathematical target",
          ),
        );
        continue;
      }

      for (const selector of beat.targets) {
        const keys = keysForSelector(frames, selector);
        if (keys.length === 0) {
          findings.push(
            finding(
              run,
              segment.id,
              beat,
              `named target "${selector}" was never measurable`,
            ),
          );
          continue;
        }
        const deltas = pairDeltas(frames, keys, geometryDelta);
        const changingPairs = deltas.filter(
          (delta) => delta > CHANGE_FLOOR,
        ).length;
        const total = deltas.reduce((sum, delta) => sum + delta, 0);
        if (total <= CHANGE_FLOOR) {
          findings.push(
            finding(
              run,
              segment.id,
              beat,
              `named target "${selector}" did not change geometry`,
              total,
            ),
          );
          continue;
        }
        const requiredPairs = Math.min(2, deltas.length);
        if (changingPairs < requiredPairs) {
          findings.push(
            finding(
              run,
              segment.id,
              beat,
              `named target "${selector}" changed only as a snap, not continuously`,
              changingPairs,
            ),
          );
        }
      }
    }
  }
  return findings;
}
