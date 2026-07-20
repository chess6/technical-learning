import { lazy, Suspense } from "react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { LessonLoading } from "../components/lesson/LessonLoading";

const LessonPage = lazy(() =>
  import("../pages/LessonPage").then((m) => ({ default: m.LessonPage })),
);

/**
 * Lesson content, guided-scene engines, and Mafs explorers are fetched only
 * once a learner opens a lesson (see LessonPage, sceneDescriptions.ts,
 * explorations/registry.tsx) — never as part of the home-page bundle.
 */
export function LazyLessonRoute() {
  return (
    <ErrorBoundary
      title="This lesson couldn't load"
      message="Check your connection and try again."
    >
      <Suspense fallback={<LessonLoading />}>
        <LessonPage />
      </Suspense>
    </ErrorBoundary>
  );
}
