import {
  EigenSolutionDiagram,
  type EigenSolutionDiagramProps,
} from "./EigenSolutionDiagram";

/** Convenience wrapper emphasizing the λ=2 off-axis eigendirection. */
export function OffAxisEigenSolutionDiagram(props: EigenSolutionDiagramProps) {
  return <EigenSolutionDiagram {...props} highlightLambda={2} />;
}
