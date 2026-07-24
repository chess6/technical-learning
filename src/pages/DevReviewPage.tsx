import { ReviewQueue } from "../components/assessment/ReviewQueue";

/**
 * Development-only host for the Package F human-scoring queue. Shares the SAME
 * local origin (and therefore the same localStorage learner state) as the
 * runner, so a submitted attempt's proofs are scorable here.
 */
export function DevReviewPage() {
  return <ReviewQueue />;
}
