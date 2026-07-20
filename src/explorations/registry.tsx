import type { ReactElement } from "react";
import { LinearCombinationExplorer } from "./LinearCombinationExplorer";
import { MatrixTransformationExplorer } from "./MatrixTransformationExplorer";
import { DeterminantExplorer } from "./DeterminantExplorer";
import { EigenvectorExplorer } from "./EigenvectorExplorer";

/**
 * Maps a lesson's explorationId to its interactive Mafs exploration. LessonPage
 * looks up the explorer here instead of branching on lesson identity.
 */
const EXPLORERS: Record<string, () => ReactElement> = {
  "linear-combination": () => <LinearCombinationExplorer />,
  "matrix-transformation": () => <MatrixTransformationExplorer />,
  "determinant-area-scaling": () => <DeterminantExplorer />,
  "eigenvectors-invariant-directions": () => <EigenvectorExplorer />,
};

export function getExplorer(
  explorationId: string,
): (() => ReactElement) | undefined {
  return EXPLORERS[explorationId];
}

export function hasExplorer(explorationId: string): boolean {
  return explorationId in EXPLORERS;
}
