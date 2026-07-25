import {
  SEGMENT_OVERRUNS,
  resetSegmentOverruns,
} from "../../guided-scenes/scenes/sceneKit";
import { REPLICA_FPS, toReplicaTime, type BenchmarkManifest } from "../manifests";
import { readProbeEvents, readProbeSamples } from "../probes/probeRegistry";
import { waitForFrame, type LabPlayerHandle } from "../runtime/labPlayer";
import type {
  BenchmarkRun,
  FrameSample,
  SeekDeterminismRecord,
} from "./types";

/**
 * Browser-side sampler: drives a mounted replica frame by frame and collects
 * the semantic record the pure checks run over. Probes are read AFTER each
 * seek's render, so measurements reflect exactly the state that painted the
 * canvas.
 */

/** Cheap, stable hash of the rendered canvas (downsampled to 120x68). */
export function hashCanvas(canvas: HTMLCanvasElement): string {
  const w = 120;
  const h = 68;
  const scratch = document.createElement("canvas");
  scratch.width = w;
  scratch.height = h;
  const ctx = scratch.getContext("2d")!;
  ctx.drawImage(canvas, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  let hash = 0x811c9dc5;
  for (let i = 0; i < data.length; i += 4) {
    hash ^= data[i]!;
    hash = Math.imul(hash, 0x01000193);
    hash ^= data[i + 1]!;
    hash = Math.imul(hash, 0x01000193);
    hash ^= data[i + 2]!;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}

async function seekAndSettle(
  handle: LabPlayerHandle,
  frame: number,
): Promise<void> {
  const clamped = Math.max(0, Math.min(frame, handle.durationFrames() - 1));
  handle.seekToFrame(clamped);
  await waitForFrame(handle, clamped);
  // One macrotask so the render subscription has flushed to the canvas.
  await new Promise((resolve) => setTimeout(resolve, 0));
}

export interface SampleOptions {
  /** Sampling stride in frames (default 3 = 10 Hz at 30 fps). */
  stride?: number;
  onProgress?: (done: number, total: number) => void;
}

export async function sampleBenchmark(
  manifest: BenchmarkManifest,
  handle: LabPlayerHandle,
  options: SampleOptions = {},
): Promise<BenchmarkRun> {
  const stride = options.stride ?? 3;
  resetSegmentOverruns();

  // Ensure duration is known and the generator has run once from zero.
  await seekAndSettle(handle, 0);
  const durationFrames = handle.durationFrames();
  const total = Math.ceil(durationFrames / stride);

  const frames: FrameSample[] = [];
  for (let frame = 0, i = 0; frame < durationFrames; frame += stride, i += 1) {
    await seekAndSettle(handle, frame);
    frames.push({
      frame,
      time: frame / REPLICA_FPS,
      samples: readProbeSamples(manifest.id),
    });
    options.onProgress?.(i + 1, total);
  }
  // Land on the final frame so the event log is complete.
  await seekAndSettle(handle, durationFrames - 1);
  const events = readProbeEvents(manifest.id);
  const overruns = SEGMENT_OVERRUNS.map((o) => ({ ...o }));

  // Beat-end snapshots: the sampled frame nearest each beat's final frame.
  const beatEndSamples: BenchmarkRun["beatEndSamples"] = {};
  for (const beat of manifest.beats) {
    const endTime = toReplicaTime(manifest, beat.refEnd);
    const endFrame = Math.min(
      durationFrames - 1,
      Math.round(endTime * REPLICA_FPS) - 2,
    );
    await seekAndSettle(handle, endFrame);
    beatEndSamples[beat.id] = readProbeSamples(manifest.id);
  }

  // Seek determinism: reach each beat's end frame from both directions.
  const seekRecords: SeekDeterminismRecord[] = [];
  for (const beat of manifest.beats) {
    const endTime = toReplicaTime(manifest, beat.refEnd);
    const frame = Math.min(
      durationFrames - 1,
      Math.round(endTime * REPLICA_FPS) - 2,
    );
    await seekAndSettle(handle, 0);
    await seekAndSettle(handle, frame);
    const hashFromStart = hashCanvas(handle.canvas);
    const samplesFromStart = readProbeSamples(manifest.id);
    await seekAndSettle(handle, durationFrames - 1);
    await seekAndSettle(handle, frame);
    const hashFromEnd = hashCanvas(handle.canvas);
    const samplesFromEnd = readProbeSamples(manifest.id);
    seekRecords.push({
      beatId: beat.id,
      frame,
      hashFromStart,
      hashFromEnd,
      samplesFromStart,
      samplesFromEnd,
    });
  }

  return {
    benchmarkId: manifest.id,
    fps: REPLICA_FPS,
    stride,
    durationFrames,
    frames,
    events,
    beatEndSamples,
    seekRecords,
    overruns,
  };
}
