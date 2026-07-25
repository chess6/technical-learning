import type { ProbeSample } from "../probes/probeRegistry";
import {
  LAB_STAGE,
  getReferenceWindow,
  toReplicaTime,
  type BenchmarkBeat,
  type BenchmarkManifest,
} from "../manifests";
import type { BenchmarkRun, CheckResult } from "./types";

/**
 * The measurable comparison checks. All pure: (manifest, run) -> results, so
 * every check is unit-testable against synthetic runs. Severity policy:
 *
 *  HARD  — objective defects: an expected object invisible at its beat, a
 *          tracked object teleporting or blink-swapping, content clipping the
 *          stage, text covering a mathematical object, nondeterministic
 *          seeking, a declared event that never happens, a segment overrun,
 *          a claimed camera move that does not occur.
 *  CRAFT — measured differences from the reference: event-time and hold
 *          deltas within/over tolerance, landmark deltas, camera framing
 *          differences. Recorded as evidence, never auto-failed hard.
 */

function beatInterval(
  manifest: BenchmarkManifest,
  beat: BenchmarkBeat,
): { start: number; end: number } {
  return {
    start: toReplicaTime(manifest, beat.refStart),
    end: toReplicaTime(manifest, beat.refEnd),
  };
}

function framesIn(
  manifest: BenchmarkManifest,
  run: BenchmarkRun,
  beatId: string,
): typeof run.frames {
  const beat = manifest.beats.find((b) => b.id === beatId);
  if (!beat) return [];
  const { start, end } = beatInterval(manifest, beat);
  return run.frames.filter((f) => f.time >= start - 1e-6 && f.time < end - 1e-6);
}

const visible = (sample: ProbeSample | undefined, threshold: number): boolean =>
  !!sample && sample.opacity > threshold;

/** Required objects visible at the END of every beat that lists them. */
export function checkBeatVisibility(
  manifest: BenchmarkManifest,
  run: BenchmarkRun,
): CheckResult[] {
  const results: CheckResult[] = [];
  for (const beat of manifest.beats) {
    const samples = run.beatEndSamples[beat.id];
    for (const objectId of beat.visibleObjects) {
      const sample = samples?.[objectId];
      const ok = visible(sample, manifest.tolerances.visibleOpacity);
      results.push({
        id: `beat-visibility:${beat.id}:${objectId}`,
        dimension: "reveal-structure",
        severity: "hard",
        passed: ok,
        beatId: beat.id,
        objectId,
        measured: sample?.opacity ?? 0,
        expected: 1,
        tolerance: manifest.tolerances.visibleOpacity,
        message: ok
          ? `${objectId} visible at end of ${beat.id}`
          : `${objectId} should be visible at the end of beat "${beat.id}" but has opacity ${(sample?.opacity ?? 0).toFixed(2)}`,
      });
    }
  }
  return results;
}

/**
 * Frame-to-frame discontinuity: while visible, a tracked object may move at
 * most maxStepPx per authored frame (scaled by the sampling stride), except
 * across a declared cut.
 */
export function checkContinuity(
  manifest: BenchmarkManifest,
  run: BenchmarkRun,
): CheckResult[] {
  const results: CheckResult[] = [];
  const cutTimes = manifest.transitions
    .filter((t) => t.kind === "cut")
    .map((t) => toReplicaTime(manifest, t.refTime));
  const strideSeconds = run.stride / run.fps;

  for (const object of manifest.objects) {
    if (object.maxStepPx === undefined) continue;
    const allowed = object.maxStepPx * run.stride + 1;
    let worst = 0;
    let worstFrame: number | undefined;
    for (let i = 1; i < run.frames.length; i += 1) {
      const prev = run.frames[i - 1]!;
      const curr = run.frames[i]!;
      const a = prev.samples[object.id];
      const b = curr.samples[object.id];
      if (
        !visible(a, manifest.tolerances.visibleOpacity) ||
        !visible(b, manifest.tolerances.visibleOpacity)
      ) {
        continue;
      }
      // Skip pairs that straddle a declared cut.
      const straddlesCut = cutTimes.some(
        (t) => t >= prev.time - strideSeconds && t <= curr.time + strideSeconds,
      );
      if (straddlesCut) continue;
      const step = Math.hypot(b!.x - a!.x, b!.y - a!.y);
      if (step > worst) {
        worst = step;
        worstFrame = curr.frame;
      }
    }
    const ok = worst <= allowed;
    results.push({
      id: `continuity:${object.id}`,
      dimension: "identity-continuity",
      severity: "hard",
      passed: ok,
      objectId: object.id,
      measured: Math.round(worst * 10) / 10,
      tolerance: allowed,
      frame: ok ? undefined : worstFrame,
      message: ok
        ? `${object.id} moves continuously (worst step ${worst.toFixed(1)}px <= ${allowed}px)`
        : `${object.id} jumps ${worst.toFixed(1)}px between sampled frames (allowed ${allowed}px) near frame ${worstFrame} — teleport or unintended cut`,
    });
  }
  return results;
}

/**
 * Blink detection: an object declared persistent across a beat must not go
 * visible -> invisible -> visible within that beat (the opacity-replacement
 * smell — identity faked by a crossfade).
 */
export function checkOpacityReplacement(
  manifest: BenchmarkManifest,
  run: BenchmarkRun,
): CheckResult[] {
  const results: CheckResult[] = [];
  for (const object of manifest.objects) {
    for (const beatId of object.persistsAcross) {
      const frames = framesIn(manifest, run, beatId);
      let seenVisible = false;
      let wentInvisibleAt: number | null = null;
      let blinkFrame: number | undefined;
      for (const frame of frames) {
        const sample = frame.samples[object.id];
        const isVisible = visible(sample, manifest.tolerances.visibleOpacity);
        if (isVisible) {
          if (seenVisible && wentInvisibleAt !== null) {
            blinkFrame = frame.frame;
            break;
          }
          seenVisible = true;
        } else if (seenVisible && wentInvisibleAt === null) {
          wentInvisibleAt = frame.frame;
        }
      }
      const ok = blinkFrame === undefined;
      results.push({
        id: `opacity-replacement:${object.id}:${beatId}`,
        dimension: "identity-continuity",
        severity: "hard",
        passed: ok,
        beatId,
        objectId: object.id,
        frame: blinkFrame,
        message: ok
          ? `${object.id} holds its identity through ${beatId}`
          : `${object.id} blinks out and back within beat "${beatId}" (frame ${blinkFrame}) — identity replaced by opacity swap`,
      });
    }
  }
  return results;
}

/** Landmark position (and scale) deltas at beat ends. Craft evidence. */
export function checkLandmarks(
  manifest: BenchmarkManifest,
  run: BenchmarkRun,
): CheckResult[] {
  const results: CheckResult[] = [];
  for (const landmark of manifest.landmarks) {
    const sample = run.beatEndSamples[landmark.beatId]?.[landmark.objectId];
    if (!visible(sample, manifest.tolerances.visibleOpacity)) {
      results.push({
        id: `landmark:${landmark.id}`,
        dimension: "composition",
        severity: "hard",
        passed: false,
        beatId: landmark.beatId,
        objectId: landmark.objectId,
        message: `landmark "${landmark.id}": ${landmark.objectId} is not visible at the end of ${landmark.beatId}`,
      });
      continue;
    }
    const delta = Math.hypot(sample!.x - landmark.x, sample!.y - landmark.y);
    const ok = delta <= manifest.tolerances.landmarkPx;
    results.push({
      id: `landmark:${landmark.id}`,
      dimension: "composition",
      severity: "craft",
      passed: ok,
      beatId: landmark.beatId,
      objectId: landmark.objectId,
      measured: Math.round(delta * 10) / 10,
      expected: 0,
      tolerance: manifest.tolerances.landmarkPx,
      message: `landmark "${landmark.id}" delta ${delta.toFixed(1)}px (tolerance ${manifest.tolerances.landmarkPx}px)`,
    });
    if (landmark.scale !== undefined && sample!.scale !== undefined) {
      const ratio = Math.abs(sample!.scale - landmark.scale) / landmark.scale;
      results.push({
        id: `landmark-scale:${landmark.id}`,
        dimension: "composition",
        severity: "craft",
        passed: ratio <= manifest.tolerances.landmarkScaleRatio,
        beatId: landmark.beatId,
        objectId: landmark.objectId,
        measured: sample!.scale,
        expected: landmark.scale,
        tolerance: manifest.tolerances.landmarkScaleRatio,
        message: `landmark "${landmark.id}" scale ${sample!.scale.toFixed(2)} vs ${landmark.scale}`,
      });
    }
  }
  return results;
}

/**
 * Event-time deltas vs the reference. A never-logged event is HARD (claimed
 * motion missing); a logged-but-late one is CRAFT with the measured delta.
 */
export function checkEventTimes(
  manifest: BenchmarkManifest,
  run: BenchmarkRun,
): CheckResult[] {
  const results: CheckResult[] = [];
  for (const event of manifest.events) {
    const expected = toReplicaTime(manifest, event.refTime);
    const measured = run.events[event.id];
    if (measured === undefined) {
      results.push({
        id: `event:${event.id}`,
        dimension: "synchronization",
        severity: "hard",
        passed: false,
        expected: Math.round(expected * 100) / 100,
        message: `event "${event.id}" was never enacted by the replica (expected at ${expected.toFixed(2)}s)`,
      });
      continue;
    }
    const delta = Math.abs(measured - expected);
    const ok = delta <= manifest.tolerances.eventTimeSec;
    results.push({
      id: `event:${event.id}`,
      dimension: "timing",
      severity: "craft",
      passed: ok,
      measured: Math.round(measured * 100) / 100,
      expected: Math.round(expected * 100) / 100,
      tolerance: manifest.tolerances.eventTimeSec,
      message: `event "${event.id}" at ${measured.toFixed(2)}s vs reference ${expected.toFixed(2)}s (delta ${delta.toFixed(2)}s)`,
    });
  }
  return results;
}

/** Hold-duration deltas: gaps between consecutive reference events. */
export function checkHoldDurations(
  manifest: BenchmarkManifest,
  run: BenchmarkRun,
): CheckResult[] {
  const results: CheckResult[] = [];
  const ordered = [...manifest.events].sort((a, b) => a.refTime - b.refTime);
  for (let i = 1; i < ordered.length; i += 1) {
    const prev = ordered[i - 1]!;
    const curr = ordered[i]!;
    const measuredPrev = run.events[prev.id];
    const measuredCurr = run.events[curr.id];
    if (measuredPrev === undefined || measuredCurr === undefined) continue;
    const expectedHold = curr.refTime - prev.refTime;
    const measuredHold = measuredCurr - measuredPrev;
    const delta = Math.abs(measuredHold - expectedHold);
    const ok = delta <= manifest.tolerances.holdSec;
    results.push({
      id: `hold:${prev.id}->${curr.id}`,
      dimension: "timing",
      severity: "craft",
      passed: ok,
      measured: Math.round(measuredHold * 100) / 100,
      expected: Math.round(expectedHold * 100) / 100,
      tolerance: manifest.tolerances.holdSec,
      message: `hold ${prev.id} -> ${curr.id}: ${measuredHold.toFixed(2)}s vs ${expectedHold.toFixed(2)}s`,
    });
  }
  return results;
}

/** Content must never extend past the stage bounds while visible. */
export function checkStageClipping(
  manifest: BenchmarkManifest,
  run: BenchmarkRun,
): CheckResult[] {
  const results: CheckResult[] = [];
  const halfW = LAB_STAGE.width / 2;
  const halfH = LAB_STAGE.height / 2;
  for (const object of manifest.objects) {
    let worst = 0;
    let worstFrame: number | undefined;
    for (const frame of run.frames) {
      const sample = frame.samples[object.id];
      if (!visible(sample, manifest.tolerances.visibleOpacity)) continue;
      const w = (sample!.width ?? 0) / 2;
      const h = (sample!.height ?? 0) / 2;
      const overflow = Math.max(
        Math.abs(sample!.x) + w - halfW,
        Math.abs(sample!.y) + h - halfH,
      );
      if (overflow > worst) {
        worst = overflow;
        worstFrame = frame.frame;
      }
    }
    const ok = worst <= 0;
    results.push({
      id: `clipping:${object.id}`,
      dimension: "composition",
      severity: "hard",
      passed: ok,
      objectId: object.id,
      measured: Math.round(worst * 10) / 10,
      frame: ok ? undefined : worstFrame,
      message: ok
        ? `${object.id} stays on stage`
        : `${object.id} extends ${worst.toFixed(0)}px past the stage edge at frame ${worstFrame} — clipped content`,
    });
  }
  return results;
}

/**
 * Text occlusion: a visible text-kind probe whose box covers the ANCHOR of a
 * visible mathematical object hides the thing being taught.
 */
export function checkTextOcclusion(
  manifest: BenchmarkManifest,
  run: BenchmarkRun,
): CheckResult[] {
  const textKinds = new Set(["label", "equation", "readout"]);
  const mathKinds = new Set(["vector", "line", "shape", "node", "token", "edge", "marker"]);
  const textObjects = manifest.objects.filter((o) => textKinds.has(o.kind));
  const mathObjects = manifest.objects.filter((o) => mathKinds.has(o.kind));
  const results: CheckResult[] = [];
  for (const text of textObjects) {
    let hit: { frame: number; over: string } | null = null;
    for (const frame of run.frames) {
      const t = frame.samples[text.id];
      if (!visible(t, manifest.tolerances.visibleOpacity)) continue;
      if (!t!.width || !t!.height) continue;
      for (const math of mathObjects) {
        const m = frame.samples[math.id];
        if (!visible(m, manifest.tolerances.visibleOpacity)) continue;
        if (
          Math.abs(m!.x - t!.x) < t!.width / 2 &&
          Math.abs(m!.y - t!.y) < t!.height / 2
        ) {
          hit = { frame: frame.frame, over: math.id };
          break;
        }
      }
      if (hit) break;
    }
    results.push({
      id: `occlusion:${text.id}`,
      dimension: "text-treatment",
      severity: "hard",
      passed: !hit,
      objectId: text.id,
      frame: hit?.frame,
      message: hit
        ? `${text.id} covers ${hit.over}'s anchor at frame ${hit.frame} — text obscures the mathematics`
        : `${text.id} never obscures a tracked mathematical object`,
    });
  }
  return results;
}

/** Deterministic states after seeking straight to a beat. */
export function checkSeekDeterminism(
  _manifest: BenchmarkManifest,
  run: BenchmarkRun,
): CheckResult[] {
  return run.seekRecords.map((record) => {
    const hashesMatch = record.hashFromStart === record.hashFromEnd;
    // Probe agreement within a pixel guards against hash false-positives.
    let worstProbeDelta = 0;
    for (const [id, a] of Object.entries(record.samplesFromStart)) {
      const b = record.samplesFromEnd[id];
      if (!b) continue;
      worstProbeDelta = Math.max(
        worstProbeDelta,
        Math.hypot(a.x - b.x, a.y - b.y),
        Math.abs(a.opacity - b.opacity) * 10,
      );
    }
    const ok = hashesMatch && worstProbeDelta <= 1;
    return {
      id: `seek:${record.beatId}`,
      dimension: "accessibility",
      severity: "hard",
      passed: ok,
      beatId: record.beatId,
      frame: record.frame,
      measured: Math.round(worstProbeDelta * 100) / 100,
      message: ok
        ? `seeking directly to "${record.beatId}" is deterministic`
        : `seeking to "${record.beatId}" from different origins produces different states (hash ${hashesMatch ? "ok" : "MISMATCH"}, probe delta ${worstProbeDelta.toFixed(2)})`,
    } satisfies CheckResult;
  });
}

/** Camera behaviour per beat: claimed moves must happen; framing is craft. */
export function checkCamera(
  manifest: BenchmarkManifest,
  run: BenchmarkRun,
): CheckResult[] {
  const results: CheckResult[] = [];
  for (const beat of manifest.beats) {
    const rig = run.beatEndSamples[beat.id]?.["camera-rig"];
    if (beat.camera.mode === "static") {
      if (rig && Math.abs((rig.scale ?? 1) - 1) > 0.01) {
        results.push({
          id: `camera:${beat.id}`,
          dimension: "camera",
          severity: "hard",
          passed: false,
          beatId: beat.id,
          measured: rig.scale,
          expected: 1,
          message: `beat "${beat.id}" is declared static but the rig is at scale ${(rig.scale ?? 1).toFixed(2)}`,
        });
      }
      continue;
    }
    if (!beat.camera.target) continue;
    if (!rig) {
      results.push({
        id: `camera:${beat.id}`,
        dimension: "camera",
        severity: "hard",
        passed: false,
        beatId: beat.id,
        message: `beat "${beat.id}" declares a camera move but the replica exposes no camera-rig probe`,
      });
      continue;
    }
    const moved = Math.abs((rig.scale ?? 1) - 1) > 0.05 || Math.hypot(rig.x, rig.y) > 8;
    if (!moved) {
      results.push({
        id: `camera:${beat.id}`,
        dimension: "camera",
        severity: "hard",
        passed: false,
        beatId: beat.id,
        message: `beat "${beat.id}" claims a ${beat.camera.mode} but the camera never moved — missing claimed motion`,
      });
      continue;
    }
    const delta = Math.hypot(
      rig.x - beat.camera.target.x,
      rig.y - beat.camera.target.y,
    );
    const scaleTarget = beat.camera.target.scale ?? 1;
    const scaleRatio = Math.abs((rig.scale ?? 1) - scaleTarget) / scaleTarget;
    const ok =
      delta <= manifest.tolerances.landmarkPx &&
      scaleRatio <= manifest.tolerances.landmarkScaleRatio;
    results.push({
      id: `camera:${beat.id}`,
      dimension: "camera",
      severity: "craft",
      passed: ok,
      beatId: beat.id,
      measured: Math.round(delta * 10) / 10,
      tolerance: manifest.tolerances.landmarkPx,
      message: `camera at (${rig.x.toFixed(0)}, ${rig.y.toFixed(0)}) x${(rig.scale ?? 1).toFixed(2)} vs target (${beat.camera.target.x}, ${beat.camera.target.y}) x${scaleTarget}`,
    });
  }
  return results;
}

/** Segment overruns: a beat body outgrowing its declared duration is hard. */
export function checkOverruns(run: BenchmarkRun): CheckResult[] {
  if (run.overruns.length === 0) {
    return [
      {
        id: "overruns:none",
        dimension: "timing",
        severity: "hard",
        passed: true,
        message: "every beat body fits its declared duration",
      },
    ];
  }
  return run.overruns.map((overrun) => ({
    id: `overrun:${overrun.label}`,
    dimension: "timing",
    severity: "hard",
    passed: false,
    measured: overrun.measured,
    expected: overrun.declared,
    message: `segment ${overrun.label} ran ${overrun.measured.toFixed(2)}s of a declared ${overrun.declared}s`,
  }));
}

/** Sanity: the replica's total duration matches the excerpt window. */
export function checkDuration(
  manifest: BenchmarkManifest,
  run: BenchmarkRun,
): CheckResult[] {
  const window = getReferenceWindow(manifest.id);
  const expected = window.end - window.start;
  const measured = run.durationFrames / run.fps;
  const delta = Math.abs(measured - expected);
  const ok = delta <= 0.2;
  return [
    {
      id: "duration:total",
      dimension: "timing",
      severity: "hard",
      passed: ok,
      measured: Math.round(measured * 100) / 100,
      expected,
      tolerance: 0.2,
      message: `replica runs ${measured.toFixed(2)}s vs excerpt ${expected.toFixed(2)}s`,
    },
  ];
}
