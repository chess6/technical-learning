import { useCallback, useMemo, useState } from "react";
import { Line, Point, Text, Vector } from "mafs";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { MatrixTeX } from "../components/lesson/ProseWithMath";
import { MafsSceneShell } from "./MafsSceneShell";
import { ParameterControls } from "./ParameterControls";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import { PresetPicker } from "./PresetPicker";
import { BASIS_PRESETS } from "../lessons/exampleData";
import {
  changeOfBasisMatrix,
  clamp,
  coordinatesInBasis,
  fromCoordinatesInBasis,
  inverse2x2,
  isBasis,
  matrixInBasis,
  requireMatrixExample,
  similarityInvariants,
  type Vector2,
} from "../math";
import "./ChangeOfBasisExplorer.css";

/**
 * Lesson 10 explorer — the same point, named twice.
 *
 * The vector `x` and the basis are edited independently, so the learner can hold
 * the point still and change only the basis. That is the lesson's claim made
 * operable: the plotted point does not move when the basis sliders do, while
 * `[x]_B` changes underneath it.
 *
 * Two deliberate choices:
 *  - `A` and `[A]_B` are shown with their determinant and trace side by side, so
 *    "the entries change, the invariants do not" is visible rather than asserted;
 *  - a dependent pair is reported as NOT A BASIS and `P⁻¹` is suppressed, rather
 *    than rendering `Infinity` entries.
 */

const BOUND = 5;
const A = requireMatrixExample("eigen-distinct").matrix; // [[3,1],[0,2]]

const DEFAULT_B1: Vector2 = [1, 2];
const DEFAULT_B2: Vector2 = [3, -1];
const DEFAULT_X: Vector2 = [4, 1];

const ROLE_ORIGINAL = "var(--role-original)";
const ROLE_BASIS_1 = "var(--role-basis-1)";
const ROLE_BASIS_2 = "var(--role-basis-2)";
const ROLE_SELECTED = "var(--role-selected)";
const ROLE_GRID = "var(--role-intermediate)";

function fmt(n: number): string {
  const r = Math.round(n * 1000) / 1000;
  return Object.is(r, -0) ? "0" : String(r);
}

function vecText(v: Vector2): string {
  return `(${fmt(v[0])}, ${fmt(v[1])})`;
}

export function ChangeOfBasisExplorer() {
  const [b1, setB1] = useState<Vector2>(DEFAULT_B1);
  const [b2, setB2] = useState<Vector2>(DEFAULT_B2);
  const [x, setX] = useState<Vector2>(DEFAULT_X);

  const basis = isBasis(b1, b2);
  const P = useMemo(() => changeOfBasisMatrix(b1, b2), [b1, b2]);
  const Pinv = useMemo(() => inverse2x2(P), [P]);
  const coords = useMemo(() => coordinatesInBasis(b1, b2, x), [b1, b2, x]);
  const rebuilt = useMemo(
    () => (coords ? fromCoordinatesInBasis(b1, b2, coords) : null),
    [b1, b2, coords],
  );
  const aInBasis = useMemo(() => matrixInBasis(A, b1, b2), [b1, b2]);

  const originalInvariants = similarityInvariants(A);
  const describedInvariants = aInBasis ? similarityInvariants(aInBasis) : null;

  const setComponent = useCallback(
    (which: "b1" | "b2" | "x", index: 0 | 1, value: number) => {
      const clamped = clamp(value, -BOUND, BOUND);
      const update = (prev: Vector2): Vector2 =>
        index === 0 ? [clamped, prev[1]] : [prev[0], clamped];
      if (which === "b1") setB1(update);
      else if (which === "b2") setB2(update);
      else setX(update);
    },
    [],
  );

  const applyPreset = useCallback((presetId: string) => {
    const preset = BASIS_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setB1([preset.first[0], preset.first[1]]);
    setB2([preset.second[0], preset.second[1]]);
  }, []);

  const handleReset = useCallback(() => {
    setB1(DEFAULT_B1);
    setB2(DEFAULT_B2);
    setX(DEFAULT_X);
  }, []);

  const summary = basis
    ? `The point stays at ${vecText(x)} in standard coordinates. In this basis the same point is named ${vecText(coords!)} — the arrow did not move.`
    : "These two vectors are dependent, so they are not a basis: they span only a line, and most points have no coordinates at all in them.";

  return (
    <ExplorationPanel
      explorationId="change-of-basis"
      title="The same point, named twice"
      description="Move the basis vectors and watch the point's coordinates change while the point itself stays put. Then compare the map's two descriptions: the entries differ, the determinant and trace do not."
      toolbar={
        <>
          <PresetPicker
            label="Basis"
            presets={BASIS_PRESETS.map((p) => ({
              id: p.id,
              label: p.label,
              onSelect: () => applyPreset(p.id),
            }))}
          />
          <ResetButton onReset={handleReset} />
        </>
      }
      summary={summary}
      controls={
        <>
          <ParameterControls
            title="Basis vector b₁"
            controls={[
              { id: "cob-b1x", label: "x", value: b1[0], min: -BOUND, max: BOUND, onChange: (v) => setComponent("b1", 0, v) },
              { id: "cob-b1y", label: "y", value: b1[1], min: -BOUND, max: BOUND, onChange: (v) => setComponent("b1", 1, v) },
            ]}
          />
          <ParameterControls
            title="Basis vector b₂"
            controls={[
              { id: "cob-b2x", label: "x", value: b2[0], min: -BOUND, max: BOUND, onChange: (v) => setComponent("b2", 0, v) },
              { id: "cob-b2y", label: "y", value: b2[1], min: -BOUND, max: BOUND, onChange: (v) => setComponent("b2", 1, v) },
            ]}
          />
          <ParameterControls
            title="The point x (standard coordinates)"
            controls={[
              { id: "cob-xx", label: "x", value: x[0], min: -BOUND, max: BOUND, onChange: (v) => setComponent("x", 0, v) },
              { id: "cob-xy", label: "y", value: x[1], min: -BOUND, max: BOUND, onChange: (v) => setComponent("x", 1, v) },
            ]}
          />
          <details className="exploration-details">
            <summary>Compare the two descriptions of the map</summary>
            <div className="exploration-details__body">
              <dl className="cob-explorer__compare">
                <dt>
                  det — same for both? <strong data-testid="cob-det-match">
                    {describedInvariants
                      ? Math.abs(
                          describedInvariants.determinant -
                            originalInvariants.determinant,
                        ) < 1e-9
                        ? "yes"
                        : "no"
                      : "—"}
                  </strong>
                </dt>
                <dd data-testid="cob-dets">
                  {fmt(originalInvariants.determinant)} vs{" "}
                  {describedInvariants ? fmt(describedInvariants.determinant) : "—"}
                </dd>
                <dt>
                  trace — same for both? <strong data-testid="cob-trace-match">
                    {describedInvariants
                      ? Math.abs(
                          describedInvariants.trace - originalInvariants.trace,
                        ) < 1e-9
                        ? "yes"
                        : "no"
                      : "—"}
                  </strong>
                </dt>
                <dd data-testid="cob-traces">
                  {fmt(originalInvariants.trace)} vs{" "}
                  {describedInvariants ? fmt(describedInvariants.trace) : "—"}
                </dd>
              </dl>
            </div>
          </details>
        </>
      }
      readout={
        <SceneReadout
          title="Readout"
          items={[
            {
              id: "basis-ok",
              label: "Is it a basis?",
              value: (
                <span data-testid="cob-is-basis">
                  {basis ? "Yes — independent" : "No — dependent, they span only a line"}
                </span>
              ),
            },
            {
              id: "coords",
              label: "[x]_B",
              value: (
                <span data-testid="cob-coords">
                  {coords ? vecText(coords) : "undefined — not a basis"}
                </span>
              ),
            },
            {
              id: "rebuild",
              label: "P [x]_B (should be x)",
              value: (
                <span data-testid="cob-rebuild">
                  {rebuilt ? vecText(rebuilt) : "—"}
                </span>
              ),
            },
            {
              id: "p",
              label: "P",
              value: (
                <span data-testid="cob-p" data-plain={`[[${fmt(P[0][0])}, ${fmt(P[0][1])}], [${fmt(P[1][0])}, ${fmt(P[1][1])}]]`}>
                  <MatrixTeX a={P[0][0]} b={P[0][1]} c={P[1][0]} d={P[1][1]} />
                </span>
              ),
            },
            {
              id: "pinv",
              label: "P⁻¹",
              value: Pinv ? (
                <span data-testid="cob-pinv">
                  <MatrixTeX a={Pinv[0][0]} b={Pinv[0][1]} c={Pinv[1][0]} d={Pinv[1][1]} />
                </span>
              ) : (
                <span data-testid="cob-pinv">no inverse — not a basis</span>
              ),
            },
            {
              id: "a-in-basis",
              label: "[A]_B = P⁻¹AP",
              value: aInBasis ? (
                <span
                  data-testid="cob-a-in-basis"
                  data-plain={`[[${fmt(aInBasis[0][0])}, ${fmt(aInBasis[0][1])}], [${fmt(aInBasis[1][0])}, ${fmt(aInBasis[1][1])}]]`}
                >
                  <MatrixTeX
                    a={aInBasis[0][0]}
                    b={aInBasis[0][1]}
                    c={aInBasis[1][0]}
                    d={aInBasis[1][1]}
                  />
                </span>
              ) : (
                <span data-testid="cob-a-in-basis" data-plain="none">
                  undefined — not a basis
                </span>
              ),
            },
          ]}
        />
      }
    >
      <div className="cob-explorer__scene">
        <MafsSceneShell
          ariaLabel="A point shown against the standard axes and the chosen basis, with the basis vectors drawn"
          viewBox={{ x: [-5.5, 5.5], y: [-4, 4], padding: 0.35 }}
          height={400}
        >
          <Line.Segment point1={[-5, 0]} point2={[5, 0]} color={ROLE_GRID} weight={1} opacity={0.35} />
          <Line.Segment point1={[0, -3.5]} point2={[0, 3.5]} color={ROLE_GRID} weight={1} opacity={0.35} />
          {/* The basis lines through the origin — the "grid" of the chosen basis. */}
          <Line.Segment
            point1={[-3 * b1[0], -3 * b1[1]]}
            point2={[3 * b1[0], 3 * b1[1]]}
            color={ROLE_BASIS_1}
            weight={1}
            opacity={0.4}
          />
          <Line.Segment
            point1={[-3 * b2[0], -3 * b2[1]]}
            point2={[3 * b2[0], 3 * b2[1]]}
            color={ROLE_BASIS_2}
            weight={1}
            opacity={0.4}
          />
          <Vector tip={b1 as [number, number]} color={ROLE_BASIS_1} weight={3.5} />
          <Vector tip={b2 as [number, number]} color={ROLE_BASIS_2} weight={3.5} />
          <Text x={b1[0]} y={b1[1]} attach="ne" attachDistance={12} color={ROLE_BASIS_1} size={16}>
            b₁
          </Text>
          <Text x={b2[0]} y={b2[1]} attach="ne" attachDistance={12} color={ROLE_BASIS_2} size={16}>
            b₂
          </Text>
          <Vector tip={x as [number, number]} color={ROLE_SELECTED} weight={4} />
          <Point x={x[0]} y={x[1]} color={ROLE_SELECTED} />
          <Text x={x[0]} y={x[1]} attach="se" attachDistance={16} color={ROLE_ORIGINAL} size={16}>
            x
          </Text>
        </MafsSceneShell>
      </div>
    </ExplorationPanel>
  );
}
