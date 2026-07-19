import { useCallback, useMemo, useState } from "react";
import { Vector, useMovablePoint } from "mafs";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { MafsSceneShell } from "./MafsSceneShell";
import { ParameterControls } from "./ParameterControls";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import {
  clamp,
  determinant2x2,
  matrixVectorMultiply,
  requireMatrixExample,
  type Matrix2x2,
  type Vector2,
} from "../math";
import "./MatrixTransformDemo.css";

const DEMO_EXAMPLE = requireMatrixExample("shear-2-1");
const INITIAL_VECTOR = (DEMO_EXAMPLE.inputVector ?? [1.5, 0.5]) as Vector2;
const ENTRY_MIN = -3;
const ENTRY_MAX = 3;
const VECTOR_MIN = -3;
const VECTOR_MAX = 3;

const ROLE_ORIGINAL = "var(--role-original)";
const ROLE_TRANSFORMED = "var(--role-transformed)";

type MatrixEntries = {
  a: number;
  b: number;
  c: number;
  d: number;
};

function matrixFromEntries(entries: MatrixEntries): Matrix2x2 {
  return [
    [entries.a, entries.b],
    [entries.c, entries.d],
  ];
}

function entriesFromMatrix(matrix: Matrix2x2): MatrixEntries {
  return {
    a: matrix[0][0],
    b: matrix[0][1],
    c: matrix[1][0],
    d: matrix[1][1],
  };
}

function clampVector(point: Vector2): Vector2 {
  return [
    clamp(point[0], VECTOR_MIN, VECTOR_MAX),
    clamp(point[1], VECTOR_MIN, VECTOR_MAX),
  ];
}

function formatVector(v: Vector2): string {
  return `(${formatNum(v[0])}, ${formatNum(v[1])})`;
}

function formatNum(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

function formatMatrix(m: Matrix2x2): string {
  return `[[${formatNum(m[0][0])}, ${formatNum(m[0][1])}], [${formatNum(m[1][0])}, ${formatNum(m[1][1])}]]`;
}

/**
 * M3 technical demonstration — not a full lesson.
 *
 * Proves: shared example data, draggable vector, matrix entry sliders,
 * pure-math transformed output, determinant readout, reset, responsive Mafs.
 */
export function MatrixTransformDemo() {
  const initialEntries = entriesFromMatrix(DEMO_EXAMPLE.matrix);

  const [entries, setEntries] = useState<MatrixEntries>(initialEntries);

  const matrix = useMemo(() => matrixFromEntries(entries), [entries]);

  const inputPoint = useMovablePoint(INITIAL_VECTOR as [number, number], {
    color: ROLE_ORIGINAL,
    constrain: (point) => clampVector(point as Vector2) as [number, number],
  });
  const { x, y, element: inputElement, setPoint } = inputPoint;

  const inputVector: Vector2 = [x, y];
  const transformed = matrixVectorMultiply(matrix, inputVector);
  const det = determinant2x2(matrix);

  const setEntry = useCallback((key: keyof MatrixEntries, value: number) => {
    setEntries((current) => ({
      ...current,
      [key]: clamp(value, ENTRY_MIN, ENTRY_MAX),
    }));
  }, []);

  const handleReset = useCallback(() => {
    setEntries(entriesFromMatrix(DEMO_EXAMPLE.matrix));
    setPoint(INITIAL_VECTOR as [number, number]);
  }, [setPoint]);

  return (
    <ExplorationPanel
      explorationId="matrix-transform-demo"
      title="Mafs technical demo"
      description={`Shared example “${DEMO_EXAMPLE.title}”: drag the input vector or adjust matrix entries. The output is computed by the shared pure math layer.`}
      toolbar={<ResetButton onReset={handleReset} />}
      controls={
        <ParameterControls
          title="Matrix entries"
          controls={[
            {
              id: "matrix-a",
              label: "a₁₁",
              value: entries.a,
              min: ENTRY_MIN,
              max: ENTRY_MAX,
              onChange: (value) => setEntry("a", value),
            },
            {
              id: "matrix-b",
              label: "a₁₂",
              value: entries.b,
              min: ENTRY_MIN,
              max: ENTRY_MAX,
              onChange: (value) => setEntry("b", value),
            },
            {
              id: "matrix-c",
              label: "a₂₁",
              value: entries.c,
              min: ENTRY_MIN,
              max: ENTRY_MAX,
              onChange: (value) => setEntry("c", value),
            },
            {
              id: "matrix-d",
              label: "a₂₂",
              value: entries.d,
              min: ENTRY_MIN,
              max: ENTRY_MAX,
              onChange: (value) => setEntry("d", value),
            },
          ]}
        />
      }
      readout={
        <SceneReadout
          title="Computed values"
          items={[
            { id: "matrix", label: "Matrix A", value: formatMatrix(matrix) },
            {
              id: "input",
              label: "Input v",
              value: (
                <span data-testid="input-vector">{formatVector(inputVector)}</span>
              ),
            },
            {
              id: "output",
              label: "A v",
              value: (
                <span data-testid="transformed-vector">
                  {formatVector(transformed)}
                </span>
              ),
            },
            {
              id: "det",
              label: "det(A)",
              value: <span data-testid="determinant">{formatNum(det)}</span>,
            },
          ]}
        />
      }
    >
      <div className="matrix-transform-demo__scene">
        <MafsSceneShell ariaLabel="Input vector and its matrix-transformed image">
          <Vector
            tip={inputVector as [number, number]}
            color={ROLE_ORIGINAL}
            weight={3}
            style="solid"
          />
          <Vector
            tip={transformed as [number, number]}
            color={ROLE_TRANSFORMED}
            weight={3}
            style="dashed"
          />
          {inputElement}
        </MafsSceneShell>
      </div>
      <ul className="matrix-transform-demo__legend" aria-label="Vector legend">
        <li>
          <span className="matrix-transform-demo__swatch matrix-transform-demo__swatch--original" />
          Original vector (solid)
        </li>
        <li>
          <span className="matrix-transform-demo__swatch matrix-transform-demo__swatch--transformed" />
          Transformed vector (dashed)
        </li>
      </ul>
    </ExplorationPanel>
  );
}
