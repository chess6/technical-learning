import { Link } from "react-router-dom";
import { useLearnerState } from "../platform/useLearnerState";
import { dueSpacedReviews } from "../lessons/dueReviews";

/**
 * Development-only spaced-review due list (Package H). Lists only occurrences that
 * are due NOW, each linking to its occurrence route (`/dev/spaced/:id`) — never the
 * generic set route, so a spaced item is unreachable before it is due.
 */
export function DevSpacedReviewPage() {
  const { state, phase } = useLearnerState();
  if (phase === "loading") return <p>Loading…</p>;
  const due = dueSpacedReviews(state, new Date());

  return (
    <div className="dev-spaced-review" style={{ maxWidth: "52rem", margin: "0 auto" }}>
      <h1>Spaced review — due now (dev)</h1>
      {due.length === 0 ? (
        <p data-testid="spaced-due-empty">Nothing due right now.</p>
      ) : (
        <ul data-testid="spaced-due-list">
          {due.map((r) => (
            <li key={r.id}>
              <Link to={`/dev/spaced/${r.id}`} data-review-id={r.id}>
                {r.exerciseId}
              </Link>{" "}
              <span style={{ color: "#667" }}>
                (due {new Date(r.dueAt).toLocaleDateString()} · ~{r.delayDays}d)
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
