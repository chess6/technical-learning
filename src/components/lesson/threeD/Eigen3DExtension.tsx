import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  EIGEN_3D_EXTENSION_EXAMPLE,
  applyMatrixToUnitCube,
  matrixShift3,
  matrixVectorMultiply3,
  scaleVector3,
  type Vector3,
} from "../../../math";
import { usePrefersReducedMotion } from "../../../hooks/usePrefersReducedMotion";
import type { ClipPosition } from "../clipPosition";
import {
  resolveThreeDStep,
  type ThreeDInterpretation,
} from "../../../guided-scenes/scenes/derivationSteps";
import "./Eigen3DExtension.css";

export type Eigen3DExtensionProps = {
  /** 2D scene id used only to map ClipPosition → nearest 3D interpretation. */
  sceneId: string;
  position: ClipPosition;
  className?: string;
  /** Force WebGL-unavailable fallback (tests). */
  forceUnavailable?: boolean;
};

type SceneState = "invariant-line" | "shift-collapse";

const INITIAL_CAMERA = {
  position: [3.2, 2.4, 3.6] as [number, number, number],
  fov: 42,
};

const COLORS = {
  axis: "#3a4658",
  ordinary: "#7ec5e6",
  ordinaryImage: "#e6b566",
  invariant: "#f0879f",
  eigenV: "#7fd0a0",
  eigenAv: "#ecd484",
  cube: "#9aa6b5",
  cubeCollapsed: "#b9a3ef",
};

function toTuple(v: Vector3): [number, number, number] {
  return [v[0], v[1], v[2]];
}

function Arrow3D({
  from = [0, 0, 0] as [number, number, number],
  to,
  color,
  linewidth = 2,
}: {
  from?: [number, number, number];
  to: [number, number, number];
  color: string;
  linewidth?: number;
}) {
  return (
    <Line
      points={[from, to]}
      color={color}
      lineWidth={linewidth}
      depthTest
    />
  );
}

function Axes() {
  const extent = 2.2;
  return (
    <group>
      <Arrow3D to={[extent, 0, 0]} color={COLORS.axis} linewidth={1} />
      <Arrow3D to={[0, extent, 0]} color={COLORS.axis} linewidth={1} />
      <Arrow3D to={[0, 0, extent]} color={COLORS.axis} linewidth={1} />
    </group>
  );
}

function InvariantLineScene() {
  const example = EIGEN_3D_EXTENSION_EXAMPLE;
  const A = example.matrix;
  const n = example.eigendirection;
  const lineExtent = 2.4;
  const lineFrom = toTuple(scaleVector3(n, -lineExtent));
  const lineTo = toTuple(scaleVector3(n, lineExtent));
  const v = toTuple(scaleVector3(n, 1.1));
  const Av = toTuple(matrixVectorMultiply3(A, scaleVector3(n, 1.1)));

  return (
    <group>
      <Axes />
      {/* Highlighted invariant line through the origin. */}
      <Line
        points={[lineFrom, lineTo]}
        color={COLORS.invariant}
        lineWidth={3}
        dashed={false}
      />
      {/* Ordinary vectors and their single-application images.
          Each rotates 120° about the axis and scales by 1.5 — not a spiral. */}
      {example.ordinaryVectors.map((vec, index) => {
        const image = matrixVectorMultiply3(A, vec);
        return (
          <group key={index}>
            <Arrow3D to={toTuple(vec)} color={COLORS.ordinary} />
            <Arrow3D to={toTuple(image)} color={COLORS.ordinaryImage} />
          </group>
        );
      })}
      {/* v and Av collinear along the eigendirection. */}
      <Arrow3D to={v} color={COLORS.eigenV} linewidth={3} />
      <Arrow3D to={Av} color={COLORS.eigenAv} linewidth={3} />
    </group>
  );
}

function ShiftCollapseScene() {
  const example = EIGEN_3D_EXTENSION_EXAMPLE;
  const shifted = matrixShift3(example.matrix, example.eigenvalue);
  const collapsed = applyMatrixToUnitCube(shifted);
  // Unit cube wireframe edges (identity).
  const cubeEdges: Array<[Vector3, Vector3]> = [
    [[0, 0, 0], [1, 0, 0]],
    [[0, 0, 0], [0, 1, 0]],
    [[0, 0, 0], [0, 0, 1]],
    [[1, 0, 0], [1, 1, 0]],
    [[1, 0, 0], [1, 0, 1]],
    [[0, 1, 0], [1, 1, 0]],
    [[0, 1, 0], [0, 1, 1]],
    [[0, 0, 1], [1, 0, 1]],
    [[0, 0, 1], [0, 1, 1]],
    [[1, 1, 0], [1, 1, 1]],
    [[1, 0, 1], [1, 1, 1]],
    [[0, 1, 1], [1, 1, 1]],
  ];
  // Offset cube so it sits near the origin for readability.
  const offset: Vector3 = [-0.5, -0.5, -0.5];
  const offsetPoint = (p: Vector3): Vector3 => [
    p[0] + offset[0],
    p[1] + offset[1],
    p[2] + offset[2],
  ];

  const n = example.eigendirection;
  const lineFrom = toTuple(scaleVector3(n, -2));
  const lineTo = toTuple(scaleVector3(n, 2));

  return (
    <group>
      <Axes />
      <Line points={[lineFrom, lineTo]} color={COLORS.invariant} lineWidth={2} />
      {cubeEdges.map(([a, b], index) => (
        <Line
          key={`id-${index}`}
          points={[toTuple(offsetPoint(a)), toTuple(offsetPoint(b))]}
          color={COLORS.cube}
          lineWidth={1}
          opacity={0.45}
          transparent
        />
      ))}
      {cubeEdges.map(([a, b], index) => {
        const ia = matrixVectorMultiply3(shifted, a);
        const ib = matrixVectorMultiply3(shifted, b);
        return (
          <Line
            key={`im-${index}`}
            points={[toTuple(offsetPoint(ia)), toTuple(offsetPoint(ib))]}
            color={COLORS.cubeCollapsed}
            lineWidth={2}
          />
        );
      })}
      {/* Keep collapsed corners available for potential debug; silence unused. */}
      <group visible={false}>
        {collapsed.map((p, i) => (
          <mesh key={i} position={toTuple(offsetPoint(p))}>
            <sphereGeometry args={[0.02, 8, 8]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function SceneContent({ state }: { state: SceneState }) {
  return state === "shift-collapse" ? (
    <ShiftCollapseScene />
  ) : (
    <InvariantLineScene />
  );
}

function interpretationToState(
  interpretation: ThreeDInterpretation | undefined,
): SceneState {
  return interpretation === "shift-collapse"
    ? "shift-collapse"
    : "invariant-line";
}

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

/**
 * Lesson 4 3D extension — conceptual generalization beyond the plane.
 * Uses a *different* curated 3×3 example than the 2D derivation.
 *
 * Primary objective: in three dimensions, an eigendirection is still a line
 * that maps onto itself.
 */
export function Eigen3DExtension({
  sceneId,
  position,
  className,
  forceUnavailable = false,
}: Eigen3DExtensionProps) {
  const reducedMotion = usePrefersReducedMotion();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [glOk, setGlOk] = useState(() => !forceUnavailable && webglAvailable());

  useEffect(() => {
    if (forceUnavailable) {
      setGlOk(false);
      return;
    }
    setGlOk(webglAvailable());
  }, [forceUnavailable, retryToken]);

  const resolved = resolveThreeDStep(sceneId, position.majorStepId);
  const sceneState = interpretationToState(resolved?.threeD);
  const nearestLabel =
    resolved && resolved.id !== position.majorStepId
      ? `Showing nearest 3D view for “${resolved.label}”`
      : null;

  const caption = useMemo(() => {
    if (sceneState === "shift-collapse") {
      return (
        "Under the auxiliary transformation A − λI, at least one nonzero " +
        "direction is sent to zero. The transformed unit cube therefore has " +
        "zero volume (here it collapses to a plane), so det(A − λI) = 0."
      );
    }
    return (
      "In three dimensions, an eigendirection is still a line that maps onto " +
      "itself. Ordinary vectors rotate 120° about that axis and scale by 1.5 " +
      "under a single application of A; v and Av stay collinear."
    );
  }, [sceneState]);

  const handleResetView = useCallback(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.reset();
  }, []);

  const handleRetry = (): void => {
    setRetryToken((token) => token + 1);
  };

  if (!glOk || forceUnavailable) {
    return (
      <div
        className={`eigen-3d-extension eigen-3d-extension--fallback ${className ?? ""}`}
        data-testid="eigen-3d-fallback"
        role="status"
      >
        <p>
          3D view needs WebGL, which isn’t available in this browser. Stay with
          the 2D derivation, or retry if you recently enabled hardware
          acceleration.
        </p>
        <button type="button" className="btn" onClick={handleRetry}>
          Retry 3D
        </button>
      </div>
    );
  }

  return (
    <div
      className={`eigen-3d-extension ${className ?? ""}`}
      data-testid="eigen-3d-extension"
      data-scene-state={sceneState}
      data-major-step={position.majorStepId}
      data-resolved-step={resolved?.id}
    >
      <p className="eigen-3d-extension__eyebrow">3D extension</p>
      <p className="eigen-3d-extension__caption" aria-live="polite">
        {caption}
      </p>
      {nearestLabel && (
        <p className="eigen-3d-extension__nearest">{nearestLabel}</p>
      )}

      <div className="eigen-3d-extension__canvas-wrap">
        <Canvas
          key={retryToken}
          camera={INITIAL_CAMERA}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl }) => {
            gl.setClearColor("#0e1420");
          }}
          fallback={<LoadingOverlay />}
        >
          <ambientLight intensity={0.85} />
          <directionalLight position={[4, 6, 3]} intensity={0.65} />
          <Suspense fallback={null}>
            <SceneContent state={sceneState} />
          </Suspense>
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableDamping={!reducedMotion}
            dampingFactor={0.12}
            minDistance={2.2}
            maxDistance={8}
            maxPolarAngle={Math.PI * 0.85}
            minPolarAngle={Math.PI * 0.12}
            target={[0, 0, 0]}
            autoRotate={false}
            makeDefault
          />
        </Canvas>
      </div>

      <div className="eigen-3d-extension__toolbar">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={handleResetView}
          data-testid="eigen-3d-reset-view"
        >
          Reset view
        </button>
        <span className="eigen-3d-extension__hint">
          Drag to rotate — pan is disabled. Confirm the pink line is spatial.
        </span>
      </div>
    </div>
  );
}

function LoadingOverlay(): ReactNode {
  return (
    <div className="eigen-3d-extension__loading" role="status">
      Loading 3D extension…
    </div>
  );
}

export default Eigen3DExtension;
