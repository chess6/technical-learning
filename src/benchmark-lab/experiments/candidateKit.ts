import type { ThreadGenerator } from "@motion-canvas/core";
import { runSegment } from "../../guided-scenes/scenes/sceneKit";
import { getEliminationCandidate } from "./eliminationCandidates";

/**
 * Beat execution for the experiment's candidate clips.
 *
 * Uses the SAME measured-segment runner the production scenes use, so a body
 * that outgrows its declared beat is recorded as an overrun rather than pushing
 * every later chapter marker out of sync. The beat boundaries come from the
 * registry, which is also what the lab's chapter buttons read — so a chapter
 * button can never seek somewhere the clip is not.
 */
export function* runCandidateBeats(
  candidateId: string,
  bodies: Record<string, () => ThreadGenerator>,
): ThreadGenerator {
  const candidate = getEliminationCandidate(candidateId);
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
