import { lazy, Suspense, type ComponentType, type ReactElement } from "react";

/**
 * Registry of inline lesson figures referenceable from a `LessonSection.visualId`.
 * Keeps sections composable (a section can carry a figure) without any
 * per-lesson branch in the page shell, and keeps Mafs-heavy figures in their own
 * lazy chunk so they load only when a section that uses them renders.
 */
const LAZY_VISUALS: Record<string, ComponentType> = {
  "linearity-comparison": lazy(() =>
    import("./LinearityComparison").then((m) => ({
      default: m.LinearityComparison,
    })),
  ),
  "matrix-origin-fixed": lazy(() =>
    import("./InlineMotionFigure").then((m) => ({
      default: m.MatrixOriginMotionFigure,
    })),
  ),
  "elimination-fixed-intersection": lazy(() =>
    import("./InlineMotionFigure").then((m) => ({
      default: m.EliminationIntersectionMotionFigure,
    })),
  ),
  "red-black-split-recolour": lazy(() =>
    import("./InlineMotionFigure").then((m) => ({
      default: m.RedBlackRepairMotionFigure,
    })),
  ),
};

const INLINE_MOTION_VISUALS = new Set([
  "matrix-origin-fixed",
  "elimination-fixed-intersection",
  "red-black-split-recolour",
]);

export function isInlineMotionVisual(visualId: string | undefined): boolean {
  return visualId !== undefined && INLINE_MOTION_VISUALS.has(visualId);
}

export function getLessonVisual(visualId: string): ReactElement | null {
  const Visual = LAZY_VISUALS[visualId];
  if (!Visual) return null;
  return (
    <Suspense fallback={null}>
      <Visual />
    </Suspense>
  );
}
