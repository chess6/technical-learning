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
};

export function getLessonVisual(visualId: string): ReactElement | null {
  const Visual = LAZY_VISUALS[visualId];
  if (!Visual) return null;
  return (
    <Suspense fallback={null}>
      <Visual />
    </Suspense>
  );
}
