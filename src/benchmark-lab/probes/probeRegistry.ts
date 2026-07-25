/**
 * Probe registry: the semantic instrumentation channel between a benchmark
 * replica scene and the comparison engine.
 *
 * A replica registers, per tracked object id from its manifest, a READER that
 * reports the object's current state (position, opacity, optional value/text)
 * straight from the live Motion Canvas signals. The sampler seeks the player
 * to a frame, renders, then reads all probes — so measurements come from the
 * same reactive state that painted the canvas, not from a parallel model.
 *
 * Replicas also log EVENTS (the moment a manifest event is enacted) with the
 * timeline time at which the generator reached them. Because Motion Canvas
 * re-runs generators from zero on reset/backward seek, a run must begin with
 * beginProbeRun() and event times are "first time reached this run".
 *
 * Pure data structure — no Motion Canvas imports — so the comparison engine
 * and jsdom tests can use it directly.
 */

export interface ProbeSample {
  /** Stage-space position of the object's anchor (center origin, y down). */
  x: number;
  y: number;
  /** Effective opacity (0..1). */
  opacity: number;
  /** Optional uniform scale factor (1 = authored size). */
  scale?: number;
  /** Optional bounding size in stage px, for occlusion/clipping checks. */
  width?: number;
  height?: number;
  /** Optional displayed numeric value (readouts, node sums). */
  value?: number;
  /** Optional displayed text. */
  text?: string;
}

export type ProbeReader = () => ProbeSample;

interface BenchmarkProbeState {
  readers: Map<string, ProbeReader>;
  events: Map<string, number>;
}

const registries = new Map<string, BenchmarkProbeState>();

function stateFor(benchmarkId: string): BenchmarkProbeState {
  let state = registries.get(benchmarkId);
  if (!state) {
    state = { readers: new Map(), events: new Map() };
    registries.set(benchmarkId, state);
  }
  return state;
}

/** Call at the top of the replica generator: clears readers and event log. */
export function beginProbeRun(benchmarkId: string): void {
  const state = stateFor(benchmarkId);
  state.readers.clear();
  state.events.clear();
}

export function registerProbe(
  benchmarkId: string,
  objectId: string,
  reader: ProbeReader,
): void {
  stateFor(benchmarkId).readers.set(objectId, reader);
}

/**
 * Record that the replica reached manifest event `eventId` at `timelineTime`
 * seconds. First call this run wins (re-yields must not move the event).
 */
export function logProbeEvent(
  benchmarkId: string,
  eventId: string,
  timelineTime: number,
): void {
  const events = stateFor(benchmarkId).events;
  if (!events.has(eventId)) {
    events.set(eventId, timelineTime);
  }
}

/** Snapshot every registered probe at the current signal state. */
export function readProbeSamples(benchmarkId: string): Record<string, ProbeSample> {
  const samples: Record<string, ProbeSample> = {};
  for (const [id, reader] of stateFor(benchmarkId).readers) {
    samples[id] = reader();
  }
  return samples;
}

/** Event id -> replica timeline seconds, for events reached so far this run. */
export function readProbeEvents(benchmarkId: string): Record<string, number> {
  return Object.fromEntries(stateFor(benchmarkId).events);
}

export function registeredProbeIds(benchmarkId: string): string[] {
  return [...stateFor(benchmarkId).readers.keys()];
}
