import { useCallback, useMemo, useState } from "react";
import { Line, Point, Text } from "mafs";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { MatrixTeX, VectorTeX } from "../components/lesson/ProseWithMath";
import { MafsSceneShell } from "./MafsSceneShell";
import { ParameterControls } from "./ParameterControls";
import { PresetPicker } from "./PresetPicker";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import { GraphicShape } from "./GraphicShape";
import { anchorImages } from "./graphicAnchors";
import {
  lerpIdentityToMatrix,
  requireMatrixExample,
  type Matrix2x2,
} from "../math";
import "./GraphicTransformationExplorer.css";

/**
 * Chapter 0's BOUNDED explorer. It shows only the shared craft, an
 * original/transformed comparison, the five canonical presets, a live matrix
 * display, a transition scrubber (identity → A), the selected-vertex
 * correspondence, and a reset.
 *
 * It deliberately exposes NONE of Lesson 2/3's machinery — no determinant, no
 * column space, no different-basis matrices, no arbitrary input vector, and no
 * column-building task. Those belong to the later lessons, after the coordinate
 * language and the columns rule are developed.
 */

const ROLE_ORIGINAL = "var(--role-original)";
const ROLE_SELECTED = "var(--role-selected)";

/** The five canonical presets, in the same order as the Chapter 0 animation. */
const PRESETS: readonly { id: string; label: string; exampleId: string }[] = [
  { id: "scale", label: "Scaling", exampleId: "uniform-scale" },
  { id: "rotation", label: "Rotation", exampleId: "rotation" },
  { id: "reflection", label: "Reflection", exampleId: "reflection" },
  { id: "shear", label: "Shear", exampleId: "shear-2-1" },
  { id: "projection", label: "Projection", exampleId: "projection-x" },
];

const DEFAULT_PRESET = "scale";

function fmt(n: number): string {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? "0" : String(r);
}

function fmtPlainMatrix(m: Matrix2x2): string {
  return `[[${fmt(m[0][0])}, ${fmt(m[0][1])}], [${fmt(m[1][0])}, ${fmt(m[1][1])}]]`;
}

export function GraphicTransformationExplorer() {
  const [presetId, setPresetId] = useState<string>(DEFAULT_PRESET);
  const [t, setT] = useState(1);

  const target = useMemo(() => {
    const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]!;
    return requireMatrixExample(preset.exampleId).matrix as Matrix2x2;
  }, [presetId]);
  const current = useMemo(() => lerpIdentityToMatrix(target, t), [target, t]);

  const { noseOriginal, noseImage } = anchorImages(current);

  const applyPreset = useCallback((id: string) => {
    setPresetId(id);
    setT(1);
  }, []);

  const handleReset = useCallback(() => {
    setPresetId(DEFAULT_PRESET);
    setT(1);
  }, []);

  return (
    <ExplorationPanel
      explorationId="graphic-transformation"
      title="Move the whole craft with four numbers"
      description="Pick a transformation, then scrub the identity → A transition. Every part of the craft — and the marked nose vertex — follows the same 2×2 matrix."
      toolbar={
        <>
          <PresetPicker
            label="Transformation"
            activeId={presetId}
            presets={PRESETS.map((p) => ({
              id: p.id,
              label: p.label,
              onSelect: () => applyPreset(p.id),
            }))}
          />
          <ResetButton onReset={handleReset} />
        </>
      }
      controls={
        <ParameterControls
          title="Identity → A"
          controls={[
            {
              id: "progress",
              label: "Transition",
              value: t,
              min: 0,
              max: 1,
              step: 0.01,
              onChange: setT,
            },
          ]}
        />
      }
      readout={
        <SceneReadout
          title="What the matrix does"
          items={[
            {
              id: "matrix",
              label: "Matrix A",
              value: (
                <span data-testid="graphic-matrix-readout" data-plain={fmtPlainMatrix(current)}>
                  <MatrixTeX
                    a={current[0][0]}
                    b={current[0][1]}
                    c={current[1][0]}
                    d={current[1][1]}
                  />
                </span>
              ),
            },
            {
              id: "vertex",
              label: "Selected vertex x (nose)",
              value: (
                <span data-testid="graphic-vertex-readout" data-plain={`(${fmt(noseOriginal[0])}, ${fmt(noseOriginal[1])})`}>
                  <VectorTeX x={noseOriginal[0]} y={noseOriginal[1]} name="x" />
                </span>
              ),
            },
            {
              id: "vertex-image",
              label: "Its image Ax",
              value: (
                <span data-testid="graphic-vertex-image-readout" data-plain={`(${fmt(noseImage[0])}, ${fmt(noseImage[1])})`}>
                  <VectorTeX x={noseImage[0]} y={noseImage[1]} name="Ax" />
                </span>
              ),
            },
          ]}
        />
      }
    >
      <div className="graphic-explorer__scene">
        <MafsSceneShell
          ariaLabel="The shared craft and its image under the selected matrix, with the original shown faint and one marked vertex tracked to its image."
          viewBox={{ x: [-4, 4], y: [-3, 4], padding: 0.4 }}
          height={380}
        >
          {/* Original craft (faint ghost) for before/after comparison. */}
          <GraphicShape matrix={[[1, 0], [0, 1]]} variant="ghost" />
          {/* Transformed craft (every part via the shared matrix). */}
          <GraphicShape matrix={current} variant="solid" />

          {/* Selected-vertex correspondence: original → image. */}
          <Line.Segment
            point1={noseOriginal as [number, number]}
            point2={noseImage as [number, number]}
            color={ROLE_SELECTED}
            weight={1.5}
            style="dashed"
            opacity={0.7}
          />
          <Point x={noseOriginal[0]} y={noseOriginal[1]} color={ROLE_ORIGINAL} />
          <Point x={noseImage[0]} y={noseImage[1]} color={ROLE_SELECTED} />
          <Text x={noseOriginal[0]} y={noseOriginal[1]} attach="s" attachDistance={16} color={ROLE_ORIGINAL} size={13}>
            x
          </Text>
          <Text x={noseImage[0]} y={noseImage[1]} attach="n" attachDistance={16} color={ROLE_SELECTED} size={13}>
            Ax
          </Text>
        </MafsSceneShell>
      </div>
      <ul className="graphic-explorer__legend" aria-label="Legend">
        <li><span className="swatch swatch--original" /> Original craft (faint)</li>
        <li><span className="swatch swatch--transformed" /> Transformed craft</li>
        <li><span className="swatch swatch--selected" /> Marked vertex x → Ax</li>
      </ul>
    </ExplorationPanel>
  );
}
