import { lazy, Suspense, type ComponentType, type ReactElement } from "react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { ExplorerLoading } from "../components/lesson/ExplorerLoading";

/**
 * Maps a lesson's explorationId to its interactive Mafs exploration. LessonPage
 * looks up the explorer here instead of branching on lesson identity.
 *
 * Each explorer is a separate lazy chunk: Mafs (and the explorer's own module
 * graph) is fetched only when a learner opens a lesson that uses it — never
 * as part of the home page, and never for explorers belonging to lessons the
 * learner hasn't opened.
 */
const LAZY_EXPLORERS: Record<string, ComponentType> = {
  "linear-combination": lazy(() =>
    import("./LinearCombinationExplorer").then((m) => ({
      default: m.LinearCombinationExplorer,
    })),
  ),
  "matrix-transformation": lazy(() =>
    import("./MatrixTransformationExplorer").then((m) => ({
      default: m.MatrixTransformationExplorer,
    })),
  ),
  "linear-systems": lazy(() =>
    import("./SystemsExplorer").then((m) => ({
      default: m.SystemsExplorer,
    })),
  ),
  "graphic-transformation": lazy(() =>
    import("./GraphicTransformationExplorer").then((m) => ({
      default: m.GraphicTransformationExplorer,
    })),
  ),
  "determinant-area-scaling": lazy(() =>
    import("./DeterminantExplorer").then((m) => ({
      default: m.DeterminantExplorer,
    })),
  ),
  "eigenvectors-invariant-directions": lazy(() =>
    import("./EigenvectorExplorer").then((m) => ({
      default: m.EigenvectorExplorer,
    })),
  ),
  "karatsuba-cross-terms": lazy(() =>
    import("./KaratsubaExplorer").then((m) => ({
      default: m.KaratsubaExplorer,
    })),
  ),
};

export function getExplorer(
  explorationId: string,
): (() => ReactElement) | undefined {
  const LazyExplorer = LAZY_EXPLORERS[explorationId];
  if (!LazyExplorer) return undefined;
  return () => (
    <ErrorBoundary
      title="This exploration couldn't load"
      message="Reload or try again — the rest of the lesson is unaffected."
    >
      <Suspense fallback={<ExplorerLoading />}>
        <LazyExplorer />
      </Suspense>
    </ErrorBoundary>
  );
}

export function hasExplorer(explorationId: string): boolean {
  return explorationId in LAZY_EXPLORERS;
}
