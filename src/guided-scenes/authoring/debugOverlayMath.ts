import {SCENE_SEGMENTS} from "../scenes/sceneTimings";
import type {SceneBeatContract, SemanticObjectId} from "./beatSpec";

export interface OverlayPoint {
  x: number;
  y: number;
}

export interface AffineTransform {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

export interface OriginLatticeDiagnostic {
  id: "grid.origin-on-lattice";
  pass: boolean;
  origin: OverlayPoint;
  nearest: OverlayPoint;
  delta: number;
  message: string;
}

export function worldToScreen(
  point: OverlayPoint,
  matrix: AffineTransform,
): OverlayPoint {
  return {
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f,
  };
}

export function diagnoseOriginOnLattice(
  origin: OverlayPoint,
  latticeOrigin: OverlayPoint,
  unitSpacing: number,
  tolerance = 0.5,
): OriginLatticeDiagnostic {
  if (!Number.isFinite(unitSpacing) || unitSpacing <= 0) {
    throw new Error("unit spacing must be positive");
  }
  const nearest = {
    x:
      latticeOrigin.x +
      Math.round((origin.x - latticeOrigin.x) / unitSpacing) * unitSpacing,
    y:
      latticeOrigin.y +
      Math.round((origin.y - latticeOrigin.y) / unitSpacing) * unitSpacing,
  };
  const delta = Math.hypot(origin.x - nearest.x, origin.y - nearest.y);
  const pass = delta <= tolerance;
  return {
    id: "grid.origin-on-lattice",
    pass,
    origin,
    nearest,
    delta,
    message: [
      `grid.origin-on-lattice: ${pass ? "PASS" : "FAIL"}`,
      `origin: (${origin.x}, ${origin.y})`,
      `nearest lattice intersection: (${nearest.x}, ${nearest.y})`,
      `delta: ${Number(delta.toFixed(2))} px`,
    ].join("\n"),
  };
}

export function selectorMatches(
  selector: SemanticObjectId,
  objectId: string,
): boolean {
  return selector.endsWith("*")
    ? objectId.startsWith(selector.slice(0, -1))
    : selector === objectId;
}

export function beatAtFrame(
  contract: SceneBeatContract,
  frame: number,
  fps: number,
) {
  const segments = SCENE_SEGMENTS[contract.sceneId] ?? [];
  const time = frame / fps;
  let cursor = 0;
  for (const segment of segments) {
    const end = cursor + segment.duration;
    if (time < end || segment === segments.at(-1)) {
      return contract.beats.find(({id}) => id === segment.id);
    }
    cursor = end;
  }
  return undefined;
}

export function stableIdentityColor(objectId: string): string {
  let hash = 2166136261;
  for (let index = 0; index < objectId.length; index += 1) {
    hash ^= objectId.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `hsl(${(hash >>> 0) % 360} 82% 62%)`;
}
