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
