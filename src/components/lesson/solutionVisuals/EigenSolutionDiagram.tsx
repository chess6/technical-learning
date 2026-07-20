import { Fragment } from "react";
import { Line, Text, Vector } from "mafs";
import {
  eigenDerivation2x2,
  matrixVectorMultiply,
  requireMatrixExample,
  scaleVector,
  stabilizeDirection,
  type Matrix2x2,
  type Vector2,
} from "../../../math";
import { MafsSceneShell } from "../../../explorations/MafsSceneShell";
import "./EigenSolutionDiagram.css";

const ROLE_V = "var(--role-original)";
const ROLE_AV = "var(--role-transformed)";
const ROLE_EIGEN_1 = "var(--role-invariant)";
const ROLE_EIGEN_2 = "var(--role-selected)";

export type EigenSolutionDiagramProps = {
  /** Matrix example id from src/math/examples (default: lesson matrix). */
  exampleId?: string;
  /** Which λ step to emphasize (optional). */
  highlightLambda?: number;
  /** Compact height for practice reveals. */
  height?: number;
  ariaLabel?: string;
};

function fmt(n: number): string {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? "0" : String(r);
}

function fmtVec(v: Vector2): string {
  return `(${fmt(v[0])}, ${fmt(v[1])})`;
}

/**
 * Static (near-motionless) Mafs diagram for practice/worked-example reveals.
 * Driven entirely by eigenDerivation2x2 — no local linear algebra.
 */
export function EigenSolutionDiagram({
  exampleId = "eigen-distinct",
  highlightLambda,
  height = 240,
  ariaLabel = "Eigenvector solution diagram",
}: EigenSolutionDiagramProps) {
  const matrix = requireMatrixExample(exampleId).matrix as Matrix2x2;
  const derivation = eigenDerivation2x2(matrix);

  const lineSteps = derivation.steps.filter(
    (step) => step.eigenspace.kind === "line",
  );

  // Prefer highlighting the off-axis λ=2 direction when present.
  const primary =
    lineSteps.find((s) =>
      highlightLambda !== undefined
        ? Math.abs(s.lambda - highlightLambda) < 1e-8
        : Math.abs(s.lambda - 2) < 1e-8,
    ) ?? lineSteps[0];

  const demoDir: Vector2 =
    primary?.eigenspace.kind === "line"
      ? stabilizeDirection(primary.eigenspace.basis)
      : [1, 0];
  const demoLambda = primary?.lambda ?? 0;
  const v = scaleVector(demoDir, 1.4);
  const Av = matrixVectorMultiply(matrix, v);

  const lambdaPlain = derivation.lambdas.map(fmt).join(", ");
  const dirsPlain = lineSteps
    .map((step) => {
      if (step.eigenspace.kind !== "line") return "";
      return `λ=${fmt(step.lambda)} ${fmtVec(step.eigenspace.basis)}`;
    })
    .filter(Boolean)
    .join("; ");

  return (
    <div className="eigen-solution-diagram">
      <MafsSceneShell
        height={height}
        viewBox={{ x: [-3, 3], y: [-2.5, 2.5], padding: 0.3 }}
        ariaLabel={ariaLabel}
      >
        {lineSteps.map((step, index) => {
          if (step.eigenspace.kind !== "line") return null;
          const dir = stabilizeDirection(step.eigenspace.basis);
          const color = index === 0 ? ROLE_EIGEN_1 : ROLE_EIGEN_2;
          const extent = 2.4;
          return (
            <Fragment key={`line-${step.lambda}`}>
              <Line.Segment
                point1={scaleVector(dir, -extent) as [number, number]}
                point2={scaleVector(dir, extent) as [number, number]}
                color={color}
                style="dashed"
                weight={2}
              />
              <Vector
                tip={scaleVector(dir, 1.6) as [number, number]}
                color={color}
                weight={3}
              />
            </Fragment>
          );
        })}
        <Vector tip={v as [number, number]} color={ROLE_V} weight={3.5} />
        <Vector tip={Av as [number, number]} color={ROLE_AV} weight={3.5} />
        <Text
          x={v[0] + 0.15}
          y={v[1] + 0.2}
          color={ROLE_V}
          size={14}
          attach="e"
        >
          {`v · λ≈${fmt(demoLambda)}`}
        </Text>
        <Text
          x={Av[0] + 0.15}
          y={Av[1] - 0.25}
          color={ROLE_AV}
          size={14}
          attach="e"
        >
          Av
        </Text>
      </MafsSceneShell>
      <dl className="eigen-solution-diagram__readout">
        <div>
          <dt>λ</dt>
          <dd data-testid="eigen-solution-lambdas" data-plain={lambdaPlain}>
            {lambdaPlain || "(none real)"}
          </dd>
        </div>
        <div>
          <dt>directions</dt>
          <dd data-testid="eigen-solution-dirs" data-plain={dirsPlain}>
            {dirsPlain || "—"}
          </dd>
        </div>
        <div>
          <dt>kind</dt>
          <dd data-testid="eigen-solution-kind" data-plain={derivation.kind}>
            {derivation.kind}
          </dd>
        </div>
      </dl>
    </div>
  );
}
