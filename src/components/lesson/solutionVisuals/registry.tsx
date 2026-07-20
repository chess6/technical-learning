import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { EigenSolutionDiagramProps } from "./EigenSolutionDiagram";
import { OffAxisEigenSolutionDiagram } from "./OffAxisEigenSolutionDiagram";

/**
 * Registry of reusable solution visualizations for practice/worked-example
 * reveals. Medium-agnostic in spirit: Lesson 4 uses a static Mafs diagram;
 * other lessons may register SVG or equation-only visuals.
 */
export type SolutionVisualProps = EigenSolutionDiagramProps;

type SolutionVisualComponent = ComponentType<SolutionVisualProps>;

const LOADERS: Record<
  string,
  () => Promise<{ default: SolutionVisualComponent }>
> = {
  "eigen-solution": () =>
    import("./EigenSolutionDiagram").then((m) => ({
      default: m.EigenSolutionDiagram,
    })),
  "eigen-solution-off-axis": () =>
    Promise.resolve({ default: OffAxisEigenSolutionDiagram }),
};

const cache = new Map<string, LazyExoticComponent<SolutionVisualComponent>>();

export function getSolutionVisual(
  id: string,
): LazyExoticComponent<SolutionVisualComponent> | null {
  if (!(id in LOADERS)) return null;
  let cached = cache.get(id);
  if (!cached) {
    cached = lazy(LOADERS[id]!);
    cache.set(id, cached);
  }
  return cached;
}

export function hasSolutionVisual(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(LOADERS, id);
}

export function listSolutionVisualIds(): string[] {
  return Object.keys(LOADERS);
}
