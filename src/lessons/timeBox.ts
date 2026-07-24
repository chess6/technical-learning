/**
 * Timed-mock helpers (Package I) — pure date math, no ambient clock.
 *
 * The deadline is DERIVED from the attempt's persisted `startedAt` plus the time
 * limit SNAPSHOTTED on the attempt; nothing stores an absolute deadline the client
 * could cheaply tamper with, and elapsed/remaining time is reconstructable after a
 * reload from `startedAt` alone. All functions take `now` explicitly so they are
 * trivially testable and deterministic.
 *
 * **Fail closed.** An unparseable `startedAt` means the deadline cannot be
 * computed — the attempt is then treated as EXPIRED (0 remaining), never as
 * indefinitely untimed. The persistence normalizer already rejects such records
 * (`normalizeAttemptSet`); this is the second line of defence for an attempt built
 * in memory, so a malformed timed attempt can never buy unlimited time.
 */

/** Deadline (ms since epoch) for a timed attempt, or null if `startedAt` is unparseable. */
export function deadlineMs(startedAt: string, timeLimitSec: number): number | null {
  const started = Date.parse(startedAt);
  if (!Number.isFinite(started)) return null;
  return started + timeLimitSec * 1000;
}

/** Whole seconds remaining, clamped at 0. Fails closed (0) on an unparseable `startedAt`. */
export function remainingSec(startedAt: string, timeLimitSec: number, now: Date): number {
  const deadline = deadlineMs(startedAt, timeLimitSec);
  if (deadline === null) return 0;
  return Math.max(0, Math.ceil((deadline - now.getTime()) / 1000));
}

/** Whether the time limit has elapsed. Fails closed (expired) on an unparseable `startedAt`. */
export function isExpired(startedAt: string, timeLimitSec: number, now: Date): boolean {
  const deadline = deadlineMs(startedAt, timeLimitSec);
  if (deadline === null) return true;
  return now.getTime() >= deadline;
}

/**
 * The time limit that GOVERNS a live attempt.
 *
 * The attempt's own `timeLimitSec` — snapshotted from the registry when the attempt
 * was created — always wins, so a later edit to `ModuleSet.timeLimitSec` can never
 * lengthen or shorten an attempt that is already running.
 *
 * `registry` is a NARROW compatibility fallback with exactly one legitimate reader:
 * an attempt persisted before the snapshot field existed (Package I's first cut, and
 * only for the `systems-elimination-mock` dev set). Such an attempt has no recorded
 * limit at all, so the current registry value is the only limit available — it is
 * strictly better than treating the attempt as untimed. Every attempt created by
 * `ModuleRunner` from now on carries its own snapshot and never reaches the fallback.
 *
 * Returns `undefined` only when neither source has a limit, i.e. a genuinely untimed
 * set (the F/G/H behavior).
 */
export function governingTimeLimitSec(
  snapshotted: number | undefined,
  registry: number | undefined,
): number | undefined {
  return snapshotted ?? registry;
}

/** `mm:ss` for a remaining-seconds count (for the countdown display). */
export function formatRemaining(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
