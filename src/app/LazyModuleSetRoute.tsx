import { lazy, Suspense } from "react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { LessonLoading } from "../components/lesson/LessonLoading";

const ModuleSetPage = lazy(() =>
  import("../pages/ModuleSetPage").then((m) => ({ default: m.ModuleSetPage })),
);

/**
 * Production host for `/set/:setId` (ADR-004, package R3) — the workshop /
 * assessment curriculum node. Mirrors `LazyLessonRoute`: the module-set
 * runner code is fetched only when a learner opens one, never as part of the
 * home-page bundle. Reuses `LessonLoading` for the fallback rather than a new
 * loading component — this surface doesn't yet warrant its own.
 */
export function LazyModuleSetRoute() {
  return (
    <ErrorBoundary
      title="This assessment couldn't load"
      message="Check your connection and try again."
    >
      <Suspense fallback={<LessonLoading />}>
        <ModuleSetPage />
      </Suspense>
    </ErrorBoundary>
  );
}
