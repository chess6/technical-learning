/**
 * Timed-mock helpers (Package I) — pure date math, no ambient clock.
 *
 * The deadline is DERIVED from the attempt's persisted `startedAt` plus the set's
 * `timeLimitSec`; nothing stores an absolute deadline the client could cheaply
 * tamper with, and elapsed/remaining time is reconstructable after a reload from
 * `startedAt` alone. All functions take `now` explicitly so they are trivially
 * testable and deterministic.
 */

/** Deadline (ms since epoch) for a timed attempt, or null if `startedAt` is unparseable. */
export function deadlineMs(startedAt: string, timeLimitSec: number): number | null {
  const started = Date.parse(startedAt);
  if (!Number.isFinite(started)) return null;
  return started + timeLimitSec * 1000;
}

/** Whole seconds remaining (clamped at 0), or null if `startedAt` is unparseable. */
export function remainingSec(startedAt: string, timeLimitSec: number, now: Date): number | null {
  const deadline = deadlineMs(startedAt, timeLimitSec);
  if (deadline === null) return null;
  return Math.max(0, Math.ceil((deadline - now.getTime()) / 1000));
}

/** Whether the time limit has elapsed. A bad `startedAt` is treated as NOT expired. */
export function isExpired(startedAt: string, timeLimitSec: number, now: Date): boolean {
  const deadline = deadlineMs(startedAt, timeLimitSec);
  if (deadline === null) return false;
  return now.getTime() >= deadline;
}

/** `mm:ss` for a remaining-seconds count (for the countdown display). */
export function formatRemaining(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
