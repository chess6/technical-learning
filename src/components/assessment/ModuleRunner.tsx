/**
 * ModuleRunner (Package F2–F4) — deferred-feedback module set runner.
 *
 * Exam mode CAPTURES answers with no correctness or solution reveal, freezes on
 * submit, then RELEASES feedback: auto items are graded against their snapshot
 * and human-scored items become pending reviews. Review mode renders read-only
 * from the snapshots (stored answer + AutoResult + persisted solutionReveal).
 * The scheduler hook is dispatched at-most-once on release (claim persisted
 * before invoke).
 *
 * The shared, phase-correct renderer (`captureRenderers`) is used rather than the
 * lesson `ExercisePanel` bodies so exam capture cannot leak correctness by
 * construction; the load-bearing reuse is the PURE capability layer
 * (serialize/parse/grade via the snapshot).
 *
 * Blank required written responses are recorded conservatively as OMISSIONS: a
 * blank proof is auto-scored `passed:false` (omitted) and never enters the human
 * queue, so `reviewStatus` can never reach `REVIEW_COMPLETE` from a blank answer.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  makeAttemptItemResponse,
  makeAttemptSet,
  makeReview,
  type AttemptItemResponse,
  type AttemptItemSnapshot,
  type AttemptSet,
  type ReviewRecord,
} from "../../platform/learnerState";
import { useLearnerState, type SpacedReleaseOutcome } from "../../platform/useLearnerState";
import type { JsonValue } from "../../platform/json";
import { getScheduler, type AttemptReleaseSummary } from "../../platform/scheduler";
import { isPrimarySetId } from "../../platform/spacedConfig";
import {
  ModuleSetResolutionError,
  resolveModuleSet,
} from "../../lessons/moduleSets";
import { snapshotItem, definitionFromSnapshot, gradeSnapshot } from "../../lessons/attemptSnapshot";
import { formatRemaining, isExpired, remainingSec } from "../../lessons/timeBox";
import { reviewStatus } from "../../lessons/reviewStatus";
import { ProseWithMath } from "../lesson/ProseWithMath";
import { CaptureField, ReviewAnswer, readField } from "./captureRenderers";
import "./ModuleRunner.css";

/** Whether a captured written answer has substantive (non-blank) text. */
function hasSubstantiveText(serialized: JsonValue | null): boolean {
  const text = readField(serialized ?? undefined, "text");
  return typeof text === "string" && text.trim() !== "";
}

export function ModuleRunner({
  setId,
  scheduledReviewId,
}: {
  setId: string;
  /** Present for a one-item SPACED attempt: keys the attempt to its exact occurrence. */
  scheduledReviewId?: string;
}) {
  const {
    state,
    phase,
    readOnly,
    saveHealthy,
    startAttemptSet,
    putItemResponse,
    submitAttemptSet,
    releasePrimaryAttempt,
    releaseSpacedAttempt,
  } = useLearnerState();

  const resolved = useMemo(() => {
    try {
      return { ok: true as const, ...resolveModuleSet(setId) };
    } catch (error) {
      return {
        ok: false as const,
        message:
          error instanceof ModuleSetResolutionError
            ? error.message
            : "Could not load this set.",
      };
    }
  }, [setId]);

  // A spaced attempt is keyed to its OCCURRENCE (scheduledReviewId), so a 7-day and
  // a 30-day attempt on the same one-item set never resume each other.
  const attempt = useMemo<AttemptSet | undefined>(() => {
    const all = Object.values(state.attemptSets).filter((a) =>
      scheduledReviewId ? a.scheduledReviewId === scheduledReviewId : a.setId === setId && !a.scheduledReviewId,
    );
    return all.sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))[0];
  }, [state.attemptSets, setId, scheduledReviewId]);

  const createdRef = useRef<string | null>(null);
  useEffect(() => {
    if (phase === "loading" || !resolved.ok || attempt) return;
    const key = scheduledReviewId ?? setId;
    if (createdRef.current === key) return;
    createdRef.current = key;
    const snapshots: AttemptItemSnapshot[] = resolved.items.map(snapshotItem);
    startAttemptSet(
      makeAttemptSet({
        setId: resolved.set.id,
        setVersion: resolved.set.version,
        moduleId: resolved.set.moduleId,
        mode: resolved.set.mode,
        items: snapshots,
        ...(scheduledReviewId ? { scheduledReviewId } : {}),
      }),
    );
  }, [phase, resolved, attempt, setId, scheduledReviewId, startAttemptSet]);

  // ── Timed mock (Package I) ────────────────────────────────────────────────
  // A 1 Hz clock drives the countdown and auto-submit. The deadline is derived
  // from the attempt's persisted `startedAt` + the set's `timeLimitSec`, so a
  // reload past the deadline auto-submits immediately (elapsed time is honest).
  const timeLimitSec = resolved.ok ? resolved.set.timeLimitSec : undefined;
  const timedActive =
    timeLimitSec !== undefined && attempt !== undefined && attempt.status !== "released";
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    if (!timedActive) return;
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timedActive]);

  // Auto-submit once when the deadline passes (or immediately on a past-deadline
  // reload). `submitRef` holds the latest `submit`, which is defined after the
  // early returns below.
  const submitRef = useRef<(auto: boolean) => void>(() => {});
  const autoSubmittedRef = useRef(false);
  useEffect(() => {
    if (!timedActive || attempt === undefined || timeLimitSec === undefined) return;
    if (autoSubmittedRef.current) return;
    if (isExpired(attempt.startedAt, timeLimitSec, new Date(nowMs))) {
      autoSubmittedRef.current = true;
      submitRef.current(true);
    }
  }, [timedActive, attempt, timeLimitSec, nowMs]);

  if (!resolved.ok) {
    return (
      <section className="module-runner" aria-label="Module assessment">
        <p className="module-runner__error" role="alert">
          {resolved.message}
        </p>
      </section>
    );
  }

  if (!attempt) {
    return (
      <section className="module-runner" aria-label="Module assessment">
        <p className="module-runner__status">Preparing the review set…</p>
      </section>
    );
  }

  const released = attempt.status === "released";
  const isSpaced = attempt.scheduledReviewId !== undefined;
  const cohort = state.spacedCohorts[attempt.moduleId];
  // Failed-cohort notice (primary sets only) after release.
  const cohortFailed =
    released && !isSpaced && isPrimarySetId(attempt.setId) && cohort?.status === "failed";
  // Mismatch notice (spaced sets only): released but the occurrence was NOT completed
  // by this attempt (e.g. not yet due / already consumed / mapping mismatch).
  const spacedMismatch =
    released &&
    isSpaced &&
    !!attempt.scheduledReviewId &&
    state.spacedReviews[attempt.scheduledReviewId]?.completedInAttemptSetId !== attempt.id;

  const submit = (autoSubmitted = false) => {
    // ONE canonical release timestamp for the attempt, the cohort anchor, the
    // scheduler summary, and every computed dueAt (reviewer-mandated alignment).
    const releasedAt = new Date().toISOString();
    submitAttemptSet(attempt.id);
    const reviews: ReviewRecord[] = [];
    const responses: AttemptItemResponse[] = attempt.items.map((item) => {
      const captured = attempt.responses.find((r) => r.exerciseId === item.exerciseId);
      const serialized: JsonValue | null = captured ? captured.answer : null;
      if (item.requiresReview) {
        const base = makeReview({
          attemptSetId: attempt.id,
          exerciseId: item.exerciseId,
          rubricId: item.rubric?.rubricId ?? item.exerciseId,
          rubricVersion: item.rubric?.rubricVersion ?? 1,
        });
        // A blank required response is a system-recorded omission — auto-scored
        // failed, NOT queued for a human. It can never become passable evidence.
        const review: ReviewRecord = hasSubstantiveText(serialized)
          ? base
          : {
              ...base,
              state: "scored",
              passed: false,
              omitted: true,
              feedback: "No response submitted.",
              scoredAt: releasedAt,
            };
        reviews.push(review);
        return makeAttemptItemResponse({
          exerciseId: item.exerciseId,
          answer: serialized ?? { text: "", selfMark: "not-yet" },
          reviewId: review.id,
        });
      }
      return makeAttemptItemResponse({
        exerciseId: item.exerciseId,
        answer: serialized ?? null,
        auto: gradeSnapshot(item, serialized),
      });
    });

    if (isSpaced) {
      // Release + complete the exact occurrence atomically (derive-and-validate).
      releaseSpacedAttempt(attempt.id, releasedAt, { responses, reviews });
      return;
    }

    // Primary (or other non-spaced) set: compute the spacing schedule PURELY off
    // the canonical timestamp, then release + establish the cohort atomically. The
    // module-wide gate means the scheduler is invoked ONLY when no cohort exists.
    let outcome: SpacedReleaseOutcome = { kind: "none" };
    if (isPrimarySetId(attempt.setId) && !state.spacedCohorts[attempt.moduleId]) {
      const summary: AttemptReleaseSummary = {
        attemptSetId: attempt.id,
        setId: attempt.setId,
        moduleId: attempt.moduleId,
        releasedAt,
        outcomes: responses.map((r) => ({
          exerciseId: r.exerciseId,
          kind: r.reviewId ? "review" : "auto",
          ...(r.auto?.kind === "graded" ? { correct: r.auto.correct } : {}),
        })),
      };
      try {
        const { scheduled, hint } = getScheduler().onAttemptReleased(summary);
        if (scheduled && scheduled.length > 0) outcome = { kind: "seeded", occurrences: scheduled, hint };
      } catch (err) {
        // Isolated: recorded as a visible, module-wide, terminal FAILED cohort
        // (never an auto-retry) inside the atomic release.
        outcome = { kind: "failed", error: err instanceof Error ? err.message : "scheduler error" };
      }
    }
    releasePrimaryAttempt(
      attempt.id,
      attempt.moduleId,
      releasedAt,
      { responses, reviews },
      outcome,
      autoSubmitted ? releasedAt : undefined,
    );
  };
  submitRef.current = submit;

  // Countdown value for a live timed set (null when untimed).
  const remaining =
    timeLimitSec !== undefined ? remainingSec(attempt.startedAt, timeLimitSec, new Date(nowMs)) : null;

  return (
    <section className="module-runner" aria-label="Module assessment" data-status={attempt.status}>
      <header className="module-runner__head">
        <h1 className="module-runner__title">{resolved.set.title}</h1>
        <p className="module-runner__mode" data-mode={attempt.mode}>
          Exam mode · feedback after submit
        </p>
        {timeLimitSec !== undefined && !released && remaining !== null && (
          <p
            className="module-runner__timer"
            role="timer"
            data-testid="mock-countdown"
            data-expired={remaining === 0}
          >
            {remaining === 0 ? "Time's up — submitting…" : `Time remaining: ${formatRemaining(remaining)}`}
          </p>
        )}
        {readOnly && (
          <p className="module-runner__notice" role="status">
            Progress can’t be saved in this session (storage is read-only). Your
            work stays for now but won’t persist on reload.
          </p>
        )}
        {!readOnly && !saveHealthy && (
          <p className="module-runner__notice" role="alert" data-testid="save-warning">
            A save just failed (storage may be full or disabled). Your work is
            kept in memory only — export a copy from the recovery page before
            reloading.
          </p>
        )}
        {cohortFailed && (
          <p className="module-runner__notice" role="alert" data-testid="cohort-failed-warning">
            Spaced-review scheduling could not be set up for this module
            {cohort?.error ? ` (${cohort.error})` : ""}. It will not retry
            automatically — reset or re-import learner state from the recovery page.
          </p>
        )}
        {spacedMismatch && (
          <p className="module-runner__notice" role="status" data-testid="spaced-mismatch-warning">
            This spaced review was not marked complete — it may not be due yet or
            may already have been answered.
          </p>
        )}
      </header>

      {released ? (
        <ReviewView attempt={attempt} state={state} />
      ) : (
        <>
          <ol className="module-runner__items">
            {attempt.items.map((item, index) => {
              const exercise = definitionFromSnapshot(item);
              return (
                <li key={item.exerciseId} className="module-runner__item">
                  <div className="module-runner__capture" data-exercise={item.exerciseId}>
                    <p className="module-runner__prompt">
                      <span className="module-runner__index">Q{index + 1}.</span>{" "}
                      <ProseWithMath text={exercise.prompt} />
                    </p>
                    <CaptureField
                      item={item}
                      answer={attempt.responses.find((r) => r.exerciseId === item.exerciseId)?.answer}
                      onAnswer={(answer) => {
                        if (answer === null) return;
                        putItemResponse(
                          attempt.id,
                          makeAttemptItemResponse({ exerciseId: item.exerciseId, answer }),
                        );
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="module-runner__actions">
            <button
              type="button"
              className="btn btn--primary"
              data-testid="module-submit"
              onClick={() => submit(false)}
            >
              Submit attempt
            </button>
          </div>
        </>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Review (after release) — read-only from snapshots; auto vs human separate.  */
/* -------------------------------------------------------------------------- */

function ReviewView({
  attempt,
  state,
}: {
  attempt: AttemptSet;
  state: ReturnType<typeof useLearnerState>["state"];
}) {
  const status = reviewStatus(state, attempt);
  return (
    <div className="module-runner__review">
      {attempt.autoSubmittedAt && (
        <p className="module-runner__notice" role="status" data-testid="mock-auto-submitted">
          Submitted automatically at the time limit.
        </p>
      )}
      <p className="module-runner__review-status" data-testid="review-status" data-status={status}>
        {status === "REVIEW_COMPLETE"
          ? "All written responses have been scored."
          : status === "REVIEW_FAILED"
            ? "Scored — one or more written responses did not pass."
            : "Submitted. Written responses are awaiting review."}
      </p>
      <ol className="module-runner__items">
        {attempt.items.map((item, index) => {
          const response = attempt.responses.find((r) => r.exerciseId === item.exerciseId);
          const exercise = definitionFromSnapshot(item);
          const review = response?.reviewId ? state.reviews[response.reviewId] : undefined;
          return (
            <li key={item.exerciseId} className="module-runner__item" data-exercise={item.exerciseId}>
              <p className="module-runner__prompt">
                <span className="module-runner__index">Q{index + 1}.</span>{" "}
                <ProseWithMath text={exercise.prompt} />
              </p>
              {item.requiresReview ? (
                <div className="module-runner__reviewed" data-review-state={review?.state ?? "pending"}>
                  <p className="module-runner__answer-label">Your response</p>
                  <p className="module-runner__answer-text">
                    {typeof readField(response?.answer, "text") === "string"
                      ? (readField(response?.answer, "text") as string) || "(left blank)"
                      : "(left blank)"}
                  </p>
                  {review?.state === "scored" ? (
                    <p
                      className="module-runner__feedback"
                      data-state={review.passed ? "correct" : "incorrect"}
                    >
                      {review.omitted
                        ? "Not scored — left blank"
                        : review.passed
                          ? "Passed"
                          : "Not yet"}
                      {typeof review.score === "number" ? ` · score ${review.score}` : ""}
                      {review.feedback ? ` — ${review.feedback}` : ""}
                    </p>
                  ) : (
                    <p className="module-runner__feedback" data-state="pending">
                      Awaiting review.
                    </p>
                  )}
                </div>
              ) : (
                <ReviewAnswer item={item} response={response} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
