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
  "bst-insertion-order": lazy(() =>
    import("./BstInsertionOrderExplorer").then((m) => ({
      default: m.BstInsertionOrderExplorer,
    })),
  ),
  "red-black-encoding": lazy(() =>
    import("./RedBlackEncodingExplorer").then((m) => ({
      default: m.RedBlackEncodingExplorer,
    })),
  ),
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
  elimination: lazy(() =>
    import("./EliminationExplorer").then((m) => ({
      default: m.EliminationExplorer,
    })),
  ),
  "solution-sets": lazy(() =>
    import("./SolutionSetExplorer").then((m) => ({
      default: m.SolutionSetExplorer,
    })),
  ),
  "matrix-composition": lazy(() =>
    import("./MatrixCompositionExplorer").then((m) => ({
      default: m.MatrixCompositionExplorer,
    })),
  ),
  "subspaces-rank": lazy(() =>
    import("./SubspacesRankExplorer").then((m) => ({
      default: m.SubspacesRankExplorer,
    })),
  ),
  "rank-nullity": lazy(() =>
    import("./RankNullityExplorer").then((m) => ({
      default: m.RankNullityExplorer,
    })),
  ),
  "change-of-basis": lazy(() =>
    import("./ChangeOfBasisExplorer").then((m) => ({
      default: m.ChangeOfBasisExplorer,
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
