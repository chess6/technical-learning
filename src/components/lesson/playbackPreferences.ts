import { PLAYBACK_SPEEDS, type PlaybackSpeed } from "../../guided-scenes/engine/types";

/**
 * Session-scoped playback preferences shared by every GuidedScenePlayer mount.
 *
 * The player remounts freely (navigation, expand modal, deliberate seeks via
 * key changes), so speed must live outside component state to survive. It is
 * deliberately NOT persisted to storage: a fresh session starts at 1×.
 */
let preferredSpeed: PlaybackSpeed = 1;

export function getPreferredPlaybackSpeed(): PlaybackSpeed {
  return preferredSpeed;
}

export function setPreferredPlaybackSpeed(speed: PlaybackSpeed): void {
  if ((PLAYBACK_SPEEDS as readonly number[]).includes(speed)) {
    preferredSpeed = speed;
  }
}

/** Test-only: return to the default 1× between test cases. */
export function resetPlaybackPreferences(): void {
  preferredSpeed = 1;
}
