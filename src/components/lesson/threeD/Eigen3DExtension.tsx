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
import { OrbitControls, Line, Html } from "@react-three/drei";
import { Quaternion, Vector3 as ThreeVector3 } from "three";
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

/**
 * Camera deliberately looks from a direction roughly perpendicular to the
 * invariant axis (1,1,1) so the eigen-line reads as a genuinely spatial line
 * (long and oblique) rather than a dot pointing at the viewer. x+y+z ≈ 0 keeps
 * the view off the axis.
 */
const INITIAL_CAMERA = {
  position: [3.4, 2.6, -6.0] as [number, number, number],
  fov: 42,
};

/**
 * Colours mirror the semantic role tokens used on the 2D canvas
 * (src/guided-scenes/scenes/sceneKit.ts ROLE) so input/image/eigen roles stay
 * consistent across the 2D derivation and the 3D extension.
 * WebGL cannot read CSS custom properties per-vertex, so the hex values are
 * kept in sync with --role-* by hand.
 */
const COLORS = {
  axis: "#3a4556", // ROLE.axis — coordinate frame
  input: "#7eb8d4", // ROLE.original — an input vector
  image: "#d4a574", // ROLE.transformed — its image under A
  invariant: "#e8d48a", // ROLE.selected — the eigen-direction line (matches 2D)
  null: "#e87a9a", // ROLE.result — direction A − λI sends to zero
  cube: "#9aa6b5", // unit cube (identity)
  collapsed: "#b89ad4", // ROLE.basis2 — collapsed image / plane
} as const;

const UP = new ThreeVector3(0, 1, 0);

function toTuple(v: Vector3): [number, number, number] {
  return [v[0], v[1], v[2]];
}

/** Small billboard label anchored to a 3D point; never intercepts orbit drags. */
function VecLabel({
  at,
  text,
  color,
}: {
  at: [number, number, number];
  text: string;
  color: string;
}) {
  return (
    <Html
      position={at}
      center
      style={{ pointerEvents: "none" }}
      zIndexRange={[10, 0]}
    >
      <span
        className="eigen-3d-extension__label"
        style={{ color }}
        aria-hidden="true"
      >
        {text}
      </span>
    </Html>
  );
}

/**
 * A line segment with a real cone arrowhead at the tip. Direction/orientation
 * is pure render geometry (no linear algebra is reimplemented here — the
 * endpoints are supplied by callers from src/math).
 */
function Arrow3D({
  from = [0, 0, 0] as [number, number, number],
  to,
  color,
  linewidth = 2,
  head = 0.16,
}: {
  from?: [number, number, number];
  to: [number, number, number];
  color: string;
  linewidth?: number;
  head?: number;
}) {
  const dir = new ThreeVector3(
    to[0] - from[0],
    to[1] - from[1],
    to[2] - from[2],
  );
  const length = dir.length();
  if (length < 1e-6) {
    return <Line points={[from, to]} color={color} lineWidth={linewidth} />;
  }
  const unit = dir.clone().normalize();
  const quaternion = new Quaternion().setFromUnitVectors(UP, unit);
  const headLength = Math.min(head, length * 0.6);
  // Shaft stops short of the tip so the cone sits cleanly at the end.
  const shaftEnd: [number, number, number] = [
    to[0] - unit.x * headLength,
    to[1] - unit.y * headLength,
    to[2] - unit.z * headLength,
  ];
  // Cone geometry is centred; place its centre half a head below the tip.
  const coneCentre: [number, number, number] = [
    to[0] - unit.x * (headLength / 2),
    to[1] - unit.y * (headLength / 2),
    to[2] - unit.z * (headLength / 2),
  ];
  return (
    <group>
      <Line points={[from, shaftEnd]} color={color} lineWidth={linewidth} />
      <mesh position={coneCentre} quaternion={quaternion}>
        <coneGeometry args={[headLength * 0.42, headLength, 18]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function Axes() {
  const extent = 2.2;
  return (
    <group>
      <Arrow3D to={[extent, 0, 0]} color={COLORS.axis} linewidth={1} head={0.12} />
      <Arrow3D to={[0, extent, 0]} color={COLORS.axis} linewidth={1} head={0.12} />
      <Arrow3D to={[0, 0, extent]} color={COLORS.axis} linewidth={1} head={0.12} />
      <VecLabel at={[extent + 0.15, 0, 0]} text="x" color={COLORS.axis} />
      <VecLabel at={[0, extent + 0.15, 0]} text="y" color={COLORS.axis} />
      <VecLabel at={[0, 0, extent + 0.15]} text="z" color={COLORS.axis} />
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
  const vMath = scaleVector3(n, 1.15);
  const v = toTuple(vMath);
  const AvMath = matrixVectorMultiply3(A, vMath);
  const Av = toTuple(AvMath);
  const axisLabelAt = toTuple(scaleVector3(n, lineExtent + 0.25));

  return (
    <group>
      <Axes />
      {/* The invariant line through the origin — same line maps onto itself. */}
      <Line
        points={[lineFrom, lineTo]}
        color={COLORS.invariant}
        lineWidth={3}
        dashed={false}
      />
      <VecLabel at={axisLabelAt} text="eigenline (1,1,1)" color={COLORS.invariant} />

      {/* Ordinary vectors and their single-application images. Each rotates
          120° about the axis and scales by 1.5 — this is one application of A,
          not a spiral (a spiral needs repeated application). */}
      {example.ordinaryVectors.map((vec, index) => {
        const image = matrixVectorMultiply3(A, vec);
        return (
          <group key={index}>
            <Arrow3D to={toTuple(vec)} color={COLORS.input} linewidth={2} />
            <Arrow3D to={toTuple(image)} color={COLORS.image} linewidth={2} />
          </group>
        );
      })}

      {/* v and Av: collinear along the eigendirection, Av = 1.5 v. */}
      <Arrow3D to={v} color={COLORS.input} linewidth={4} />
      <Arrow3D to={Av} color={COLORS.image} linewidth={4} />
      <VecLabel at={v} text="v" color={COLORS.input} />
      <VecLabel at={Av} text="Av = 1.5 v" color={COLORS.image} />
    </group>
  );
}

/** Unit-cube wireframe edges as index pairs into UNIT-cube corners. */
const CUBE_EDGES: ReadonlyArray<readonly [Vector3, Vector3]> = [
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

function ShiftCollapseScene() {
  const example = EIGEN_3D_EXTENSION_EXAMPLE;
  const shifted = matrixShift3(example.matrix, example.eigenvalue);
  const n = example.eigendirection;

  // Centre the cube on the origin for readability.
  const offset: Vector3 = [-0.5, -0.5, -0.5];
  const offsetPoint = (p: Vector3): Vector3 => [
    p[0] + offset[0],
    p[1] + offset[1],
    p[2] + offset[2],
  ];

  // The image of A − λI is the plane through the origin with normal n:
  // every column of A − λI has zero coordinate-sum, so the image lies in
  // {x : x·(1,1,1) = 0}. Orient a plane mesh so its +z normal points along n.
  const planeQuat = new Quaternion().setFromUnitVectors(
    new ThreeVector3(0, 0, 1),
    new ThreeVector3(n[0], n[1], n[2]).normalize(),
  );

  const lineFrom = toTuple(scaleVector3(n, -1.9));
  const lineTo = toTuple(scaleVector3(n, 1.9));

  // Touch the shared collapse computation so the claim stays tied to math.
  const collapsed = applyMatrixToUnitCube(shifted);
  const collapsedInPlane = collapsed.every(
    (p) => Math.abs(p[0] + p[1] + p[2]) < 1e-9,
  );

  return (
    <group>
      <Axes />

      {/* Translucent image plane: this is what the cube collapses onto. */}
      <mesh quaternion={planeQuat} renderOrder={-1}>
        <planeGeometry args={[3.4, 3.4]} />
        <meshBasicMaterial
          color={COLORS.collapsed}
          transparent
          opacity={collapsedInPlane ? 0.18 : 0.04}
          depthWrite={false}
        />
      </mesh>

      {/* The eigendirection is exactly the direction A − λI sends to zero. */}
      <Line points={[lineFrom, lineTo]} color={COLORS.null} lineWidth={2} />
      <VecLabel
        at={toTuple(scaleVector3(n, 2.1))}
        text="→ 0 under A − λI"
        color={COLORS.null}
      />

      {/* Identity unit cube (faint). */}
      {CUBE_EDGES.map(([a, b], index) => (
        <Line
          key={`id-${index}`}
          points={[toTuple(offsetPoint(a)), toTuple(offsetPoint(b))]}
          color={COLORS.cube}
          lineWidth={1}
          opacity={0.4}
          transparent
        />
      ))}

      {/* Image cube — flattened into the plane (zero volume). */}
      {CUBE_EDGES.map(([a, b], index) => {
        const ia = matrixVectorMultiply3(shifted, a);
        const ib = matrixVectorMultiply3(shifted, b);
        return (
          <Line
            key={`im-${index}`}
            points={[toTuple(offsetPoint(ia)), toTuple(offsetPoint(ib))]}
            color={COLORS.collapsed}
            lineWidth={2}
          />
        );
      })}
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

type LegendItem = { swatch: string; shape: "line" | "arrow" | "plane"; label: string };

function legendFor(state: SceneState): LegendItem[] {
  if (state === "shift-collapse") {
    return [
      { swatch: COLORS.cube, shape: "line", label: "unit cube" },
      { swatch: COLORS.collapsed, shape: "plane", label: "image of A − λI: a flat plane (zero volume)" },
      { swatch: COLORS.null, shape: "line", label: "eigendirection — sent to zero by A − λI" },
    ];
  }
  return [
    { swatch: COLORS.input, shape: "arrow", label: "input vector" },
    { swatch: COLORS.image, shape: "arrow", label: "its image under A (turned + scaled 1.5)" },
    { swatch: COLORS.invariant, shape: "line", label: "eigenline — the one direction A keeps" },
  ];
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

  const legend = useMemo(() => legendFor(sceneState), [sceneState]);

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

      <ul className="eigen-3d-extension__legend" aria-label="Legend">
        {legend.map((item) => (
          <li key={item.label} className="eigen-3d-extension__legend-item">
            <span
              className={`eigen-3d-extension__legend-swatch eigen-3d-extension__legend-swatch--${item.shape}`}
              style={{ backgroundColor: item.swatch, color: item.swatch }}
              aria-hidden="true"
            />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>

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
          Drag to rotate — pan is disabled. Rotate to confirm the highlighted
          eigenline is a genuine line in space.
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
