import {join} from "node:path";

export function safeArtifactStem(value) {
  return value.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
}

export function checkpointArtifactPath(packetDir, beatIndex, checkpoint) {
  return join(
    packetDir,
    "frames",
    `${String(beatIndex + 1).padStart(2, "0")}-${safeArtifactStem(checkpoint.beatId)}--` +
      `${safeArtifactStem(checkpoint.checkpointId)}-f${String(checkpoint.frame).padStart(6, "0")}.png`,
  );
}

export function planCheckpointArtifacts(packetDir, beats, checkpoints) {
  const beatIndex = new Map(beats.map((beat, index) => [beat.id, index]));
  return checkpoints.map((checkpoint) => ({
    ...checkpoint,
    path: checkpointArtifactPath(
      packetDir,
      beatIndex.get(checkpoint.beatId) ?? beats.length,
      checkpoint,
    ),
  }));
}

/** Required captures fail closed: absence becomes a diagnostic, never omission. */
export function missingCaptureFailures(records, artifactExists) {
  return records
    .filter(({path}) => !artifactExists(path))
    .map(
      ({beatId, checkpointId, frame}) =>
        `${beatId}.${checkpointId} at frame ${frame}`,
    );
}

/** The smallest inclusive Renderer range containing every selected checkpoint. */
export function selectedRenderRange(checkpoints, fps) {
  if (checkpoints.length === 0) {
    throw new Error("cannot render an empty checkpoint selection");
  }
  if (!Number.isFinite(fps) || fps <= 0) {
    throw new Error("fps must be positive");
  }
  const frames = checkpoints.map(({frame}) => frame);
  const startFrame = Math.min(...frames);
  const endFrame = Math.max(...frames);
  return {
    startFrame,
    endFrame,
    startTime: startFrame / fps,
    endTime: endFrame / fps,
    expectedFrames: endFrame - startFrame + 1,
  };
}

export function unsupportedReferenceDisposition(sceneId, comparisons) {
  return comparisons.length > 0
    ? {requested: true, disposition: "supported", reason: null}
    : {
        requested: true,
        disposition: "unsupported",
        reason: `scene "${sceneId}" has no supported benchmark comparison`,
      };
}

export function reducedMotionEvidenceFailures(records, expectedCount) {
  const failures = [];
  if (records.length !== expectedCount) {
    failures.push(`expected ${expectedCount} reduced-motion captures, received ${records.length}`);
  }
  for (const record of records) {
    if (record.captureSource !== "learner-player") {
      failures.push(`${record.beatId}: capture source must be learner-player`);
    }
    if (record.browserMedia?.query !== "(prefers-reduced-motion: reduce)" || !record.browserMedia.matches) {
      failures.push(`${record.beatId}: browser did not match prefers-reduced-motion: reduce`);
    }
    if (record.runId === "production-renderer") {
      failures.push(`${record.beatId}: reduced-motion evidence reused the production render run`);
    }
  }
  return failures;
}
