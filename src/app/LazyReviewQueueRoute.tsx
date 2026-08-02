import { lazy, Suspense } from "react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { LessonLoading } from "../components/lesson/LessonLoading";

const ReviewQueuePage = lazy(() =>
  import("../pages/ReviewQueuePage").then((m) => ({ default: m.ReviewQueuePage })),
);

/**
 * Production host for `/review` — the local human-scoring queue.
 *
 * Lazy for the same reason as the module-set route: nothing about the review
 * surface belongs in the home-page bundle. Its existence in the PRODUCTION
 * route tree is the point — the runner promises a written response will be
 * reviewed, and before this route that promise had no reachable fulfilment
 * outside a dev build.
 */
export function LazyReviewQueueRoute() {
  return (
    <ErrorBoundary
      title="The review queue couldn't load"
      message="Reload the page and try again."
    >
      <Suspense fallback={<LessonLoading />}>
        <ReviewQueuePage />
      </Suspense>
    </ErrorBoundary>
  );
}
