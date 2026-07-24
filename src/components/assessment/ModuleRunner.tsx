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

import { useEffect, useMemo, useRef } from "react";
import {
  makeAttemptItemResponse,
  makeAttemptSet,
  makeReview,
  type AttemptItemResponse,
  type AttemptItemSnapshot,
  type AttemptSet,
  type ReviewRecord,
} from "../../platform/learnerState";
import { useLearnerState } from "../../platform/useLearnerState";
import type { JsonValue } from "../../platform/json";
import { getScheduler, type AttemptReleaseSummary } from "../../platform/scheduler";
import {
  ModuleSetResolutionError,
  resolveModuleSet,
} from "../../lessons/moduleSets";
import { snapshotItem, definitionFromSnapshot, gradeSnapshot } from "../../lessons/attemptSnapshot";
import { reviewStatus } from "../../lessons/reviewStatus";
import { ProseWithMath } from "../lesson/ProseWithMath";
import { CaptureField, ReviewAnswer, readField } from "./captureRenderers";
import "./ModuleRunner.css";

/** Whether a captured written answer has substantive (non-blank) text. */
function hasSubstantiveText(serialized: JsonValue | null): boolean {
  const text = readField(serialized ?? undefined, "text");
  return typeof text === "string" && text.trim() !== "";
}

export function ModuleRunner({ setId }: { setId: string }) {
  const {
    state,
    phase,
    readOnly,
    saveHealthy,
    startAttemptSet,
    putItemResponse,
    submitAttemptSet,
    releaseAttemptSet,
    claimSchedulerEmission,
    setSchedulerHint,
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

  const attempt = useMemo<AttemptSet | undefined>(() => {
    const all = Object.values(state.attemptSets).filter((a) => a.setId === setId);
    return all.sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))[0];
  }, [state.attemptSets, setId]);

  const createdRef = useRef<string | null>(null);
  useEffect(() => {
    if (phase === "loading" || !resolved.ok || attempt) return;
    if (createdRef.current === setId) return;
    createdRef.current = setId;
    const snapshots: AttemptItemSnapshot[] = resolved.items.map(snapshotItem);
    startAttemptSet(
      makeAttemptSet({
        setId: resolved.set.id,
        setVersion: resolved.set.version,
        moduleId: resolved.set.moduleId,
        mode: resolved.set.mode,
        items: snapshots,
      }),
    );
  }, [phase, resolved, attempt, setId, startAttemptSet]);

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

  const submit = () => {
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
              scoredAt: new Date().toISOString(),
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
    releaseAttemptSet(attempt.id, { responses, reviews });

    // At-most-once scheduler dispatch: claim (persisted) BEFORE invoking; never
    // auto-retry a throwing hook.
    if (claimSchedulerEmission(attempt.id)) {
      try {
        const summary: AttemptReleaseSummary = {
          attemptSetId: attempt.id,
          setId: attempt.setId,
          moduleId: attempt.moduleId,
          releasedAt: new Date().toISOString(),
          outcomes: responses.map((r) => ({
            exerciseId: r.exerciseId,
            kind: r.reviewId ? "review" : "auto",
            ...(r.auto?.kind === "graded" ? { correct: r.auto.correct } : {}),
          })),
        };
        const { hint } = getScheduler().onAttemptReleased(summary);
        if (hint !== undefined) setSchedulerHint(attempt.id, hint);
      } catch {
        // Isolated: release already persisted; the emission marker is claimed so
        // a rerender/reload will not dispatch again.
      }
    }
  };

  return (
    <section className="module-runner" aria-label="Module assessment" data-status={attempt.status}>
      <header className="module-runner__head">
        <h1 className="module-runner__title">{resolved.set.title}</h1>
        <p className="module-runner__mode" data-mode={attempt.mode}>
          Exam mode · feedback after submit
        </p>
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
              onClick={submit}
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
