import {
  LINEAR_COMBINATION_EXAMPLE,
  MATRIX_LESSON_EXAMPLE,
} from "../../lessons/exampleData";
import { SCALE } from "../scenes/safeFrame";

export interface GridGeometryContract {
  kind: "grid";
  id: string;
  prefix: string;
  xHalfExtent: number;
  yHalfExtent: number;
  /** Present for an ordinary Cartesian grid; absent for a transformed grid. */
  coordinateScalePx?: number;
}

export interface VectorReadoutGeometryContract {
  kind: "vector-readout";
  id: string;
  segmentIds: readonly string[];
  vectorKey: string;
  readoutKey: string;
  expectedMathPoint: readonly [number, number];
  coordinateScalePx: number;
}

export interface MatrixGridGeometryContract {
  kind: "matrix-grid";
  id: string;
  prefix: string;
  matrixReadoutKey: string;
  columnKeys: readonly [string, string];
  xHalfExtent: number;
  yHalfExtent: number;
  coordinateScalePx: number;
  expectedFinalMatrix: readonly [
    readonly [number, number],
    readonly [number, number],
  ];
}

export interface LineIntersectionGeometryContract {
  kind: "line-intersection";
  id: string;
  movingLineKey: string;
  fixedPointKey: string;
  segmentIds: readonly string[];
}

export interface FullPlaneGeometryContract {
  kind: "full-plane";
  id: string;
  segmentIds: readonly string[];
  nodeKey: string;
  minWidth: number;
  minHeight: number;
}

export type SceneGeometryContract =
  | GridGeometryContract
  | MatrixGridGeometryContract
  | LineIntersectionGeometryContract
  | VectorReadoutGeometryContract
  | FullPlaneGeometryContract;

const STATIC_GRID: GridGeometryContract = {
  kind: "grid",
  id: "standard-grid",
  prefix: "semantic:grid:static",
  xHalfExtent: 2.5,
  yHalfExtent: 2.5,
  coordinateScalePx: SCALE,
};

const TRANSFORMED_GRID: GridGeometryContract = {
  kind: "grid",
  id: "transformed-grid",
  prefix: "semantic:grid:transformed",
  xHalfExtent: 2.5,
  yHalfExtent: 2.5,
};

const STATIC_GRID_SCENES = new Set([
  "why-linear-algebra",
  "columns-rule-graphic",
  "matrix-transformations",
  "matrix-composition",
  "determinant-area-scaling",
  "eigenvectors-invariant-directions",
  "eigenvectors-derivation",
]);

const TRANSFORMED_GRID_SCENES = new Set([
  "why-linear-algebra",
  "columns-rule-graphic",
  "vectors-linear-combinations",
  "matrix-transformations",
  "eigenvectors-invariant-directions",
]);

/**
 * Mathematical geometry that production scenes explicitly promise.
 *
 * The registry is deliberately small and semantic: generic craft/continuity
 * gates still cover every scene, while these contracts cover the diagrams
 * whose correctness depends on axes, lattice intersections, coordinates, or
 * an unbounded-span claim.
 */
export function geometryContractsForScene(
  sceneId: string,
): readonly SceneGeometryContract[] {
  const contracts: SceneGeometryContract[] = [];
  if (STATIC_GRID_SCENES.has(sceneId)) contracts.push(STATIC_GRID);
  if (TRANSFORMED_GRID_SCENES.has(sceneId)) contracts.push(TRANSFORMED_GRID);

  if (sceneId === "matrix-transformations") {
    contracts.push({
      kind: "matrix-grid",
      id: "matrix-grid-live-state",
      prefix: "semantic:grid:transformed",
      matrixReadoutKey: "semantic:matrix:ledger:row:matrix:value",
      columnKeys: ["semantic:matrix:column-1", "semantic:matrix:column-2"],
      xHalfExtent: 2.5,
      yHalfExtent: 2.5,
      coordinateScalePx: SCALE,
      expectedFinalMatrix: MATRIX_LESSON_EXAMPLE.matrix,
    });
  }

  if (sceneId === "elimination") {
    contracts.push({
      kind: "line-intersection",
      id: "row-operation-fixed-intersection",
      movingLineKey: "semantic:elimination:row-2-line",
      fixedPointKey: "semantic:elimination:solution",
      segmentIds: ["operation"],
    });
  }

  if (sceneId === "vectors-linear-combinations") {
    contracts.push(
      {
        ...STATIC_GRID,
        xHalfExtent: 4.25,
      },
      {
        kind: "vector-readout",
        id: "point-p-standard",
        segmentIds: ["read-standard"],
        vectorKey: "semantic:vector:p",
        readoutKey: "semantic:readout:p-standard",
        expectedMathPoint: LINEAR_COMBINATION_EXAMPLE.target,
        coordinateScalePx: SCALE,
      },
      {
        kind: "full-plane",
        id: "independent-span",
        segmentIds: ["span-plane"],
        nodeKey: "semantic:span:whole-plane",
        minWidth: 960,
        minHeight: 540,
      },
    );
  }

  if (sceneId === "change-of-basis") {
    contracts.push(
      {
        ...STATIC_GRID,
        xHalfExtent: 4.25,
      },
      {
        kind: "vector-readout",
        id: "point-p-standard",
        segmentIds: ["one-arrow"],
        vectorKey: "semantic:vector:p",
        readoutKey: "semantic:readout:p-standard",
        expectedMathPoint: LINEAR_COMBINATION_EXAMPLE.target,
        coordinateScalePx: SCALE,
      },
    );
  }

  return contracts;
}
