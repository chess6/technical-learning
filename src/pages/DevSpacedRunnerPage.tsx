import { useParams } from "react-router-dom";
import { ModuleRunner } from "../components/assessment/ModuleRunner";
import { useLearnerState } from "../platform/useLearnerState";

/**
 * Development-only host for a single SPACED occurrence (Package H). Reached only
 * via the due-review list. Guards (independently of the list): an unknown
 * occurrence renders not-found, and a NOT-YET-DUE occurrence renders "not yet due"
 * and mounts NO runner — so a learner cannot preview / complete the 30-day URL by
 * hand before it comes due.
 */
export function DevSpacedRunnerPage() {
  const { scheduledReviewId } = useParams<{ scheduledReviewId: string }>();
  const { state, phase } = useLearnerState();
  if (!scheduledReviewId) return null;
  if (phase === "loading") {
    return <p className="module-runner__status">Loading…</p>;
  }

  const occ = state.spacedReviews[scheduledReviewId];
  if (!occ) {
    return (
      <section className="module-runner" aria-label="Spaced review">
        <p className="module-runner__error" role="alert" data-testid="spaced-not-found">
          No such spaced review. Open the spaced-review list to see what’s due.
        </p>
      </section>
    );
  }

  // Once an attempt exists for this occurrence, the runner OWNS the view (capture,
  // then its own released review after submit) — the entry guards below apply only
  // to a fresh visit with no local attempt, so completing an item doesn't yank the
  // learner's graded feedback out from under them.
  const hasLocalAttempt = Object.values(state.attemptSets).some(
    (a) => a.scheduledReviewId === occ.id,
  );
  if (!hasLocalAttempt) {
    if (occ.status === "completed") {
      return (
        <section className="module-runner" aria-label="Spaced review">
          <p className="module-runner__status" data-testid="spaced-already-done">
            You’ve already completed this spaced review.
          </p>
        </section>
      );
    }
    if (Date.parse(occ.dueAt) > Date.now()) {
      return (
        <section className="module-runner" aria-label="Spaced review">
          <p className="module-runner__status" data-testid="spaced-not-due">
            Not yet due — this review comes due on{" "}
            {new Date(occ.dueAt).toLocaleDateString()}.
          </p>
        </section>
      );
    }
  }

  return <ModuleRunner setId={occ.setId} scheduledReviewId={occ.id} />;
}
