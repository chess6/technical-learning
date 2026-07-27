import type { ThreadGenerator } from "@motion-canvas/core";
import { runSegment } from "../../guided-scenes/scenes/sceneKit";
import { getEliminationCandidate } from "./eliminationCandidates";
import { getEigenCandidate } from "./eigenCandidates";

/**
 * Beat execution for the laboratory's candidate clips.
 *
 * Uses the SAME measured-segment runner the production scenes use, so a body
 * that outgrows its declared beat is recorded as an overrun rather than pushing
 * every later chapter marker out of sync. The beat boundaries come from the
 * candidate registry, which is also what the lab's chapter buttons read — so a
 * chapter button can never seek somewhere the clip is not.
 */

const RESOLVERS: Record<string, (id: string) => { beats: readonly { id: string; at: number }[]; durationSeconds: number }> = {
  elimination: getEliminationCandidate,
  eigen: getEigenCandidate,
};

export function* runCandidateBeats(
  candidateId: string,
  bodies: Record<string, () => ThreadGenerator>,
  experimentId = "elimination",
): ThreadGenerator {
  const resolve = RESOLVERS[experimentId];
  if (!resolve) {
    throw new Error(`Unknown design experiment "${experimentId}"`);
  }
  const candidate = resolve(candidateId);
  const beats = candidate.beats;
  for (const [index, beat] of beats.entries()) {
    const next = beats[index + 1]?.at ?? candidate.durationSeconds;
    const body = bodies[beat.id];
    if (!body) {
      throw new Error(
        `Candidate "${candidateId}" has no body for beat "${beat.id}"`,
      );
    }
    yield* runSegment(next - beat.at, body, `${candidateId}.${beat.id}`);
  }
}
