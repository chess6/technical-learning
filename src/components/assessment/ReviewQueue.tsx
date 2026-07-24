/**
 * ReviewQueue (Package F3) — the human-scoring surface (dev-gated).
 *
 * Lists every PENDING review across attempt sets and lets a local reviewer score
 * it against the SNAPSHOTTED rubric (id + version + text + model answer captured
 * at release). Scoring writes a `ReviewRecord` (state → scored) via the provider
 * — automatic (`AutoResult`) and human (`ReviewRecord`) results stay separate.
 * No auth / multi-user (single local origin, shared with the runner).
 */

import { useState } from "react";
import { useLearnerState } from "../../platform/useLearnerState";
import type { AttemptItemSnapshot, AttemptSet, ReviewRecord } from "../../platform/learnerState";
import { pendingReviews } from "../../lessons/reviewStatus";
import { definitionFromSnapshot } from "../../lessons/attemptSnapshot";
import type { JsonValue } from "../../platform/json";
import { ProseWithMath } from "../lesson/ProseWithMath";
import "./ModuleRunner.css";

function learnerText(set: AttemptSet | undefined, exerciseId: string): string {
  const answer = set?.responses.find((r) => r.exerciseId === exerciseId)?.answer;
  if (answer && typeof answer === "object" && !Array.isArray(answer)) {
    const text = (answer as Record<string, JsonValue>).text;
    if (typeof text === "string") return text;
  }
  return "";
}

export function ReviewQueue() {
  const { state, upsertReview } = useLearnerState();
  const pending = pendingReviews(state);

  if (pending.length === 0) {
    return (
      <section className="module-runner" aria-label="Review queue">
        <h1 className="module-runner__title">Review queue</h1>
        <p className="module-runner__status" data-testid="review-queue-empty">
          No responses awaiting review.
        </p>
      </section>
    );
  }

  return (
    <section className="module-runner" aria-label="Review queue">
      <h1 className="module-runner__title">Review queue</h1>
      <p className="module-runner__mode">
        {pending.length} response{pending.length === 1 ? "" : "s"} awaiting a score.
      </p>
      <ol className="module-runner__items">
        {pending.map((review) => {
          const set = state.attemptSets[review.attemptSetId];
          const item = set?.items.find((i) => i.exerciseId === review.exerciseId);
          return (
            <li key={review.id} className="module-runner__item">
              <ReviewItem
                review={review}
                set={set}
                item={item}
                onScore={(scored) => upsertReview(scored)}
              />
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function ReviewItem({
  review,
  set,
  item,
  onScore,
}: {
  review: ReviewRecord;
  set: AttemptSet | undefined;
  item: AttemptItemSnapshot | undefined;
  onScore: (review: ReviewRecord) => void;
}) {
  const [passed, setPassed] = useState<boolean | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [reviewer, setReviewer] = useState("");

  const prompt = item ? definitionFromSnapshot(item).prompt : review.exerciseId;
  const text = learnerText(set, review.exerciseId);

  // Defense in depth: a blank learner response is never passable (the runner
  // already records blanks as omissions before they reach this queue).
  const blank = text.trim() === "";
  const parsedScore = Number(score);
  const scoreValid = score.trim() !== "" && Number.isFinite(parsedScore);
  const scoreMalformed = score.trim() !== "" && !Number.isFinite(parsedScore);
  const canSave = !blank && passed !== null && scoreValid;

  const save = () => {
    if (!canSave) return;
    const scored: ReviewRecord = {
      ...review,
      state: "scored",
      passed,
      // A finite score is REQUIRED by the contract — captured on every scoring.
      score: parsedScore,
      scoredAt: new Date().toISOString(),
    };
    if (feedback.trim() !== "") scored.feedback = feedback.trim();
    if (reviewer.trim() !== "") scored.reviewer = reviewer.trim();
    onScore(scored);
  };

  return (
    <div className="module-runner__capture" data-review-id={review.id} data-exercise={review.exerciseId}>
      <p className="module-runner__prompt">
        <ProseWithMath text={prompt} />
      </p>

      <p className="module-runner__answer-label">Rubric ({review.rubricId} v{review.rubricVersion})</p>
      <p className="module-runner__answer-text">
        {item?.rubric?.rubricText ? (
          <ProseWithMath text={item.rubric.rubricText} />
        ) : (
          "(no rubric text captured)"
        )}
      </p>
      {item?.rubric?.modelAnswer && (
        <>
          <p className="module-runner__answer-label">Model answer</p>
          <p className="module-runner__answer-text">
            <ProseWithMath text={item.rubric.modelAnswer} />
          </p>
        </>
      )}

      <p className="module-runner__answer-label">Learner response</p>
      <p className="module-runner__answer-text" data-testid="review-learner-text">
        {text || "(left blank)"}
      </p>
      {blank && (
        <p className="module-runner__feedback" data-state="incorrect" data-testid="review-blank-note">
          Left blank — this response cannot be passed.
        </p>
      )}

      <div className="module-runner__field" role="group" aria-label="Verdict">
        <button
          type="button"
          className="btn"
          aria-pressed={passed === true}
          data-testid="review-pass"
          disabled={blank}
          onClick={() => setPassed(true)}
        >
          Pass
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          aria-pressed={passed === false}
          data-testid="review-fail"
          disabled={blank}
          onClick={() => setPassed(false)}
        >
          Not yet
        </button>
      </div>

      <label className="module-runner__field">
        <span className="sr-only">Score</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="Score (required)"
          aria-label="Score"
          data-testid="review-score"
          value={score}
          onChange={(event) => setScore(event.target.value)}
        />
      </label>
      {scoreMalformed && (
        <p className="module-runner__feedback" data-state="incorrect" data-testid="review-score-error">
          Enter a finite numeric score.
        </p>
      )}
      <label className="module-runner__field">
        <span className="sr-only">Feedback</span>
        <textarea
          className="module-runner__textarea"
          rows={3}
          placeholder="Feedback (optional)"
          aria-label="Feedback"
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
        />
      </label>
      <label className="module-runner__field">
        <span className="sr-only">Reviewer</span>
        <input
          type="text"
          placeholder="Reviewer (optional)"
          aria-label="Reviewer"
          value={reviewer}
          onChange={(event) => setReviewer(event.target.value)}
        />
      </label>

      <button
        type="button"
        className="btn btn--primary"
        data-testid="review-save"
        disabled={!canSave}
        onClick={save}
      >
        Save score
      </button>
    </div>
  );
}
