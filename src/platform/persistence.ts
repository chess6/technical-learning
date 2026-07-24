/**
 * Learner-state persistence (Package F1) — the FIRST real storage wiring.
 *
 * Local, single-user, one `localStorage` key. No network, no auth, no
 * multi-user sync. Load is CLASSIFIED into a `LoadOutcome` so the provider can
 * refuse to overwrite data it could not safely parse or migrate:
 * - `empty`        — no stored blob → start fresh, saving enabled;
 * - `loaded`       — parsed + migrated to the current schema, saving enabled;
 * - `incompatible` — a NEWER or unmigratable schema → read-only, raw preserved;
 * - `corrupt`      — present but unparseable → read-only, raw preserved.
 *
 * A blank state is NEVER returned for an unreadable-but-present blob; that is the
 * whole point of the classification (correction: "never overwrite a newer
 * unsupported schema with empty state").
 */

import { SCHEMA_VERSION } from "./identity";
import { migrateLearnerState, type LearnerState } from "./learnerState";

export const STORAGE_KEY = "technical-learning/learner-state/v1";

export type LoadOutcome =
  | { kind: "empty" }
  | { kind: "loaded"; state: LearnerState }
  | { kind: "incompatible"; reason: "newer-schema" | "unmigratable"; raw: string }
  | { kind: "corrupt"; raw: string };

/** Read the raw stored string, guarding against unavailable/blocked storage. */
export function readRaw(): string | null {
  try {
    return globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
  } catch {
    // Storage disabled (e.g. privacy mode). Treat as absent.
    return null;
  }
}

/**
 * Classify a raw JSON string into a `LoadOutcome`. Exposed so the same logic
 * serves both boot (`loadLearnerState`) and `importRaw`.
 */
export function classifyRaw(raw: string): LoadOutcome {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { kind: "corrupt", raw };
  }
  // Refuse to touch a blob whose schema is newer than this app understands —
  // migrating/overwriting it could destroy progress written by a later build.
  const version =
    parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as { schemaVersion?: unknown }).schemaVersion
      : undefined;
  if (typeof version === "number" && version > SCHEMA_VERSION) {
    return { kind: "incompatible", reason: "newer-schema", raw };
  }
  try {
    return { kind: "loaded", state: migrateLearnerState(parsed) };
  } catch {
    return { kind: "incompatible", reason: "unmigratable", raw };
  }
}

/** Load + classify the persisted learner state. Never throws. */
export function loadLearnerState(): LoadOutcome {
  const raw = readRaw();
  if (raw === null) return { kind: "empty" };
  return classifyRaw(raw);
}

/**
 * Persist the learner state synchronously. Returns `true` on success, `false`
 * on any storage failure (quota exceeded, storage disabled) so the caller can
 * keep working in memory and warn without throwing to the UI.
 */
export function saveLearnerState(state: LearnerState): boolean {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** Remove the stored blob (the ONLY sanctioned overwrite of unreadable bytes). */
export function clearLearnerState(): void {
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    // ignore — nothing else we can do locally
  }
}

/** The untouched raw bytes currently in storage (for Export / recovery). */
export function exportRaw(): string | null {
  return readRaw();
}

/** Serialize an in-memory state for download/Export. */
export function serializeState(state: LearnerState): string {
  return JSON.stringify(state, null, 2);
}

/** Parse + classify an uploaded JSON string (Import). Does not write storage. */
export function importRaw(raw: string): LoadOutcome {
  return classifyRaw(raw);
}
