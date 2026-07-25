import {
  useTime as readTimelineTime,
  type ThreadGenerator,
} from "@motion-canvas/core";
import type { BenchmarkManifest } from "../manifests";
import { getReferenceWindow } from "../manifests";
import { runSegment } from "../../guided-scenes/scenes/sceneKit";
import { logProbeEvent } from "../probes/probeRegistry";

/**
 * Shared plumbing for benchmark replica scenes: beat-by-beat execution on the
 * SAME measured-segment infrastructure production scenes use (runSegment), so
 * a replica body that outgrows its manifest beat is recorded as an overrun —
 * plus event logging against the manifest's reference event ids.
 */

export interface ReplicaBeat {
  id: string;
  duration: number;
}

/** Beat list with replica-timeline durations derived from the manifest. */
export function replicaBeats(manifest: BenchmarkManifest): ReplicaBeat[] {
  return manifest.beats.map((beat) => ({
    id: beat.id,
    duration: beat.refEnd - beat.refStart,
  }));
}

/** Total replica duration (sum of beats = excerpt window length). */
export function replicaDuration(manifest: BenchmarkManifest): number {
  const window = getReferenceWindow(manifest.id);
  return window.end - window.start;
}

/**
 * Run every beat body in manifest order, each padded/measured to exactly its
 * beat duration. Missing bodies hold the frame (an explicit hold is still a
 * choreography decision — but it must be declared by passing a no-op).
 */
export function* runReplicaBeats(
  manifest: BenchmarkManifest,
  bodies: Record<string, () => ThreadGenerator>,
): ThreadGenerator {
  for (const beat of replicaBeats(manifest)) {
    const body = bodies[beat.id];
    if (!body) {
      throw new Error(
        `Replica for "${manifest.id}" has no body for beat "${beat.id}"`,
      );
    }
    yield* runSegment(beat.duration, body, `${manifest.id}.${beat.id}`);
  }
}

/**
 * Event logger bound to a benchmark: call at the exact yield where the
 * manifest event is enacted; records the CURRENT timeline time.
 */
export function makeEventLogger(
  manifest: BenchmarkManifest,
): (eventId: string) => void {
  const known = new Set(manifest.events.map((e) => e.id));
  return (eventId: string) => {
    if (!known.has(eventId)) {
      throw new Error(
        `Replica for "${manifest.id}" logged undeclared event "${eventId}"`,
      );
    }
    logProbeEvent(manifest.id, eventId, readTimelineTime());
  };
}
