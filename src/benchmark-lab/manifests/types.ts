/**
 * Benchmark manifest format for the animation benchmark laboratory.
 *
 * A benchmark pairs a short excerpt of an expert reference animation (a
 * curated pack under .reference-sources/packs/) with an ORIGINAL Motion Canvas
 * reconstruction written from observation. The manifest is the structured
 * contract between the two: it pins the source, describes the excerpt's
 * conceptual beats, names the objects that must persist, declares measurable
 * invariants/landmarks/events with tolerances, and records the text and camera
 * treatment the reference actually uses.
 *
 * Everything here is pure data (no Motion Canvas imports) so the comparison
 * engine, the laboratory UI, and jsdom unit tests can all consume it.
 *
 * Adding a benchmark = one manifest + one replica scene + one entry in
 * referenceWindows.json (+ locally fetched frames). No laboratory changes.
 */

import referenceWindows from "./referenceWindows.json";

/** Logical stage every replica draws on (matches the guided-scene safe frame). */
export const LAB_STAGE = { width: 960, height: 540 } as const;

/** Frames per second replicas are authored/rendered at. */
export const REPLICA_FPS = 30;

export interface ReferenceWindow {
  benchmarkId: string;
  videoId: string;
  /** Excerpt bounds, seconds in the source video. */
  start: number;
  end: number;
  /** Extraction rate of the local reference frame sequence. */
  frameFps: number;
}

export interface BenchmarkSource {
  /** Slug of the reference repository in .reference-sources/manifest.json. */
  repoSlug: string;
  repoUrl: string;
  /** Commit the pack analysis (and this manifest) was written against. */
  inspectedCommit: string;
  /** YouTube video id; also the pack directory name. */
  videoId: string;
  videoTitle: string;
  channel: string;
  /** Scene classes/functions observed for this excerpt (identification only). */
  sceneSources: string[];
  license: string;
}

/**
 * One conceptual beat of the excerpt. Beat times are ABSOLUTE seconds in the
 * source video; the replica timeline is the window shifted to zero, so a
 * beat's replica interval is [refStart - window.start, refEnd - window.start].
 * Beats must tile the window contiguously.
 */
export interface BenchmarkBeat {
  id: string;
  title: string;
  refStart: number;
  refEnd: number;
  /** What this beat is FOR pedagogically (paraphrased, never quoted). */
  purpose: string;
  /** Object ids that must be visible (opacity > threshold) during this beat. */
  visibleObjects: string[];
  /** Text treatment in force during this beat. */
  text: TextTreatment;
  /** Camera state during this beat. */
  camera: CameraState;
}

/** How the reference uses text during a beat — the composition-grammar datum. */
export type TextTreatmentKind =
  | "none"
  | "object-label"
  | "persistent-equation"
  | "temporary-annotation"
  | "intertitle"
  | "pseudocode-panel"
  | "value-readout";

export interface TextTreatment {
  kind: TextTreatmentKind;
  /** Paraphrased description of what the text shows (never a transcript quote). */
  note?: string;
}

export type CameraMode = "static" | "zoom-in" | "zoom-out" | "pan" | "group-rescale";

export interface CameraState {
  mode: CameraMode;
  /**
   * For non-static modes: the stage-space rect or point of interest the
   * camera (or faked group move) ends on.
   */
  target?: { x: number; y: number; scale?: number };
  note?: string;
}

/** Kinds of tracked objects, for reporting and probe classification. */
export type TrackedObjectKind =
  | "vector"
  | "line"
  | "grid"
  | "shape"
  | "token"
  | "node"
  | "edge"
  | "label"
  | "equation"
  | "readout"
  | "panel"
  | "marker";

/**
 * A persistent object identity. The replica registers a probe under the same
 * id; continuity checks then verify the object never teleports and is never
 * replaced by an opacity crossfade while it is supposed to persist.
 */
export interface TrackedObjectSpec {
  id: string;
  kind: TrackedObjectKind;
  /** What this object is, in observation terms. */
  description: string;
  /** Beat ids across which this identity must persist (order irrelevant). */
  persistsAcross: string[];
  /**
   * Max stage-px the object's anchor may move between adjacent sampled frames
   * while visible (teleport threshold). Omit for objects allowed to jump
   * (e.g. re-parented tokens at an intentional cut).
   */
  maxStepPx?: number;
  /**
   * True for objects that deliberately extend past the frame edge (span
   * lines, full-screen grids — the reference bleeds them off-frame on
   * purpose). Exempts the object from the stage-clipping hard gate.
   */
  fullBleed?: boolean;
}

/**
 * A named reference event: the moment something starts/finishes in the source.
 * The replica logs the same event id when it enacts it; the comparison engine
 * reports the delta. Times are absolute video seconds.
 */
export interface ReferenceEvent {
  id: string;
  refTime: number;
  /** Paraphrased description of what happens. */
  description: string;
  /**
   * Anchor quality: narration-derived times are accurate to the transcript
   * segment; scene-map times are beat-boundary accurate; estimated times were
   * read off the video by observation.
   */
  anchor: "transcript" | "scene-map" | "estimated";
}

/** A named composition landmark the replica must reproduce. */
export interface CompositionLandmark {
  id: string;
  /** Probe id whose position realizes this landmark. */
  objectId: string;
  /** Beat at whose END the landmark is measured. */
  beatId: string;
  /** Expected stage-space position (center-origin, y down, 960x540). */
  x: number;
  y: number;
  /** Optional expected scale factor of the object (1 = authored size). */
  scale?: number;
  note?: string;
}

/**
 * Declared mathematical/diagram invariant. The evaluator with the same id
 * (registered in the comparison engine) computes it from probe samples; the
 * manifest declares that it must hold and during which beats.
 */
export interface InvariantSpec {
  id: string;
  description: string;
  /** Beats during which the invariant is checked. Empty = every beat. */
  beats: string[];
}

/** An expected transition or intentional hard cut. */
export interface TransitionSpec {
  /** Absolute video seconds at which it occurs. */
  refTime: number;
  kind: "continuous-morph" | "travel" | "grow" | "fade" | "cut";
  /** Object ids involved. */
  objects: string[];
  note?: string;
}

export interface BenchmarkTolerances {
  /** Allowed |replica - reference| for event times, seconds. */
  eventTimeSec: number;
  /** Allowed |replica - reference| for hold durations, seconds. */
  holdSec: number;
  /** Allowed landmark position error, stage px. */
  landmarkPx: number;
  /** Allowed relative scale error for landmarks with expected scale. */
  landmarkScaleRatio: number;
  /** Opacity above which an object counts as visible. */
  visibleOpacity: number;
}

export interface BenchmarkManifest {
  id: string;
  title: string;
  /** Which curated reference pack this benchmark represents. */
  packDir: string;
  source: BenchmarkSource;
  /** What this excerpt was chosen to test (laboratory dimension coverage). */
  pedagogicalPurpose: string;
  beats: BenchmarkBeat[];
  objects: TrackedObjectSpec[];
  events: ReferenceEvent[];
  landmarks: CompositionLandmark[];
  invariants: InvariantSpec[];
  transitions: TransitionSpec[];
  tolerances: BenchmarkTolerances;
  /**
   * Where exact matching was impossible and why — kept in the manifest so the
   * comparison report can show intentional deviations beside measured ones.
   */
  knownDeviations: { id: string; note: string }[];
}

/** The window record for a benchmark (from referenceWindows.json). */
export function getReferenceWindow(benchmarkId: string): ReferenceWindow {
  const window = (referenceWindows.windows as ReferenceWindow[]).find(
    (w) => w.benchmarkId === benchmarkId,
  );
  if (!window) {
    throw new Error(
      `No reference window for benchmark "${benchmarkId}" in referenceWindows.json`,
    );
  }
  return window;
}

/** Excerpt duration in seconds (also the replica's authored duration). */
export function benchmarkDuration(manifest: BenchmarkManifest): number {
  const window = getReferenceWindow(manifest.id);
  return window.end - window.start;
}

/** Map an absolute source-video time onto the replica timeline (seconds). */
export function toReplicaTime(manifest: BenchmarkManifest, refTime: number): number {
  const window = getReferenceWindow(manifest.id);
  return refTime - window.start;
}

/** Dev-server URL of the local reference frame directory (git-ignored media). */
export function referenceFramesUrl(benchmarkId: string): string {
  return `/benchmark-media/frames/${benchmarkId}`;
}

/**
 * Validate a manifest's internal consistency. Returns human-readable problems;
 * empty array = valid. Pure so unit tests cover the format itself.
 */
export function validateBenchmarkManifest(manifest: BenchmarkManifest): string[] {
  const problems: string[] = [];
  const window = (referenceWindows.windows as ReferenceWindow[]).find(
    (w) => w.benchmarkId === manifest.id,
  );
  if (!window) {
    problems.push(`no reference window declared for "${manifest.id}"`);
    return problems;
  }
  if (window.videoId !== manifest.source.videoId) {
    problems.push(
      `window videoId ${window.videoId} != source.videoId ${manifest.source.videoId}`,
    );
  }

  // Beats must tile [window.start, window.end] contiguously and in order.
  if (manifest.beats.length === 0) problems.push("no beats");
  const epsilon = 1e-6;
  let cursor = window.start;
  for (const beat of manifest.beats) {
    if (Math.abs(beat.refStart - cursor) > epsilon) {
      problems.push(
        `beat "${beat.id}" starts at ${beat.refStart}, expected ${cursor} (beats must tile the window)`,
      );
    }
    if (beat.refEnd <= beat.refStart) {
      problems.push(`beat "${beat.id}" has non-positive duration`);
    }
    cursor = beat.refEnd;
  }
  if (Math.abs(cursor - window.end) > epsilon) {
    problems.push(`beats end at ${cursor}, window ends at ${window.end}`);
  }

  const beatIds = new Set(manifest.beats.map((b) => b.id));
  if (beatIds.size !== manifest.beats.length) problems.push("duplicate beat ids");
  const objectIds = new Set(manifest.objects.map((o) => o.id));
  if (objectIds.size !== manifest.objects.length) problems.push("duplicate object ids");

  for (const beat of manifest.beats) {
    for (const id of beat.visibleObjects) {
      if (!objectIds.has(id)) {
        problems.push(`beat "${beat.id}" expects unknown object "${id}"`);
      }
    }
  }
  for (const object of manifest.objects) {
    for (const id of object.persistsAcross) {
      if (!beatIds.has(id)) {
        problems.push(`object "${object.id}" persists across unknown beat "${id}"`);
      }
    }
    if (object.persistsAcross.length === 0) {
      problems.push(`object "${object.id}" persists across no beats`);
    }
  }
  for (const event of manifest.events) {
    if (event.refTime < window.start - epsilon || event.refTime > window.end + epsilon) {
      problems.push(`event "${event.id}" at ${event.refTime} is outside the window`);
    }
  }
  const eventIds = new Set(manifest.events.map((e) => e.id));
  if (eventIds.size !== manifest.events.length) problems.push("duplicate event ids");

  for (const landmark of manifest.landmarks) {
    if (!objectIds.has(landmark.objectId)) {
      problems.push(`landmark "${landmark.id}" references unknown object "${landmark.objectId}"`);
    }
    if (!beatIds.has(landmark.beatId)) {
      problems.push(`landmark "${landmark.id}" references unknown beat "${landmark.beatId}"`);
    }
    if (
      Math.abs(landmark.x) > LAB_STAGE.width / 2 ||
      Math.abs(landmark.y) > LAB_STAGE.height / 2
    ) {
      problems.push(`landmark "${landmark.id}" lies off-stage`);
    }
  }
  for (const invariant of manifest.invariants) {
    for (const id of invariant.beats) {
      if (!beatIds.has(id)) {
        problems.push(`invariant "${invariant.id}" checks unknown beat "${id}"`);
      }
    }
  }
  for (const transition of manifest.transitions) {
    if (
      transition.refTime < window.start - epsilon ||
      transition.refTime > window.end + epsilon
    ) {
      problems.push(`transition at ${transition.refTime} is outside the window`);
    }
    for (const id of transition.objects) {
      if (!objectIds.has(id)) {
        problems.push(`transition at ${transition.refTime} references unknown object "${id}"`);
      }
    }
  }

  const t = manifest.tolerances;
  if (t.eventTimeSec <= 0 || t.holdSec <= 0 || t.landmarkPx <= 0) {
    problems.push("tolerances must be positive");
  }
  if (t.visibleOpacity <= 0 || t.visibleOpacity >= 1) {
    problems.push("visibleOpacity must be in (0, 1)");
  }
  return problems;
}
