import {
  DETERMINANT_LESSON_EXAMPLE,
  LINEAR_COMBINATION_EXAMPLE,
} from "../../lessons/exampleData";
import {
  coordinatesInBasis,
  matrixInBasis,
  matrixMatrixMultiply,
  requireMatrixExample,
  type Matrix2x2,
  type Vector2,
} from "../../math";
import {
  CHAPTER0_SEGMENTS,
  CHANGE_OF_BASIS_SEGMENTS,
  DETERMINANT_SEGMENTS,
  LINEAR_COMBINATION_SEGMENTS,
  MATRIX_COMPOSITION_SEGMENTS,
  type SceneSegment,
} from "../scenes/sceneTimings";
import type {
  BeatSpec,
  SceneBeatContract,
  SceneMathDatum,
  SemanticChangeSpec,
  SemanticObjectId,
} from "./beatSpec";

interface BeatDraft {
  id: string;
  intent: BeatSpec["intent"];
  focalObjects: readonly SemanticObjectId[];
  invariant: string;
  landingPhase: string;
  expectedChanges?: readonly SemanticChangeSpec[];
  expectedStableObjects?: readonly SemanticObjectId[];
  prediction?: BeatSpec["prediction"];
}

function geometry(...objectIds: SemanticObjectId[]): SemanticChangeSpec[] {
  return objectIds.map((objectId) => ({
    objectId,
    property: "geometry",
    expectation: "change",
    continuous: true,
  }));
}

function opacity(
  objectId: SemanticObjectId,
  expectation: "change" | "appear" | "disappear" = "change",
): SemanticChangeSpec {
  return { objectId, property: "opacity", expectation };
}

function makeContract(
  sceneId: string,
  segments: readonly SceneSegment[],
  semanticObjects: readonly SemanticObjectId[],
  mathData: Readonly<Record<string, SceneMathDatum>>,
  drafts: readonly BeatDraft[],
): SceneBeatContract {
  const segmentById = new Map(segments.map((segment) => [segment.id, segment]));
  return {
    sceneId,
    semanticObjects,
    mathData,
    beats: drafts.map((draft) => {
      const segment = segmentById.get(draft.id);
      if (!segment) throw new Error(`Unknown ${sceneId} segment ${draft.id}`);
      const requiredObjects = ["semantic:grid:static"] as const;
      return {
        id: draft.id,
        purpose: segment.summary ?? segment.title,
        intent: draft.intent,
        focalObjects: draft.focalObjects,
        timingEvent: `${sceneId}.${draft.id}`,
        chapter: {
          id: draft.id,
          title: segment.title,
          summary: segment.summary,
          seek: { kind: "segment-opening" },
        },
        invariant: draft.invariant,
        ...(draft.prediction ? { prediction: draft.prediction } : {}),
        checkpoints: [
          {
            id: "opening",
            anchor: { kind: "segment", position: "opening" },
            requiredObjects,
          },
          {
            id: "midpoint",
            anchor: { kind: "segment", position: "midpoint" },
            requiredObjects,
          },
          {
            id: "landing",
            anchor: {
              kind: "phase",
              phaseId: draft.landingPhase,
              position: "end",
            },
            requiredObjects,
          },
          {
            id: "final",
            anchor: { kind: "segment", position: "final" },
            requiredObjects,
          },
        ],
        expectedChanges: draft.expectedChanges ?? [],
        expectedStableObjects: draft.expectedStableObjects ?? [
          "semantic:grid:static",
        ],
      };
    }),
  };
}

const WHY = {
  grid: "semantic:grid:static",
  transformedGrid: "semantic:grid:transformed*",
  craft: "semantic:why:craft*",
  basis1: "semantic:why:basis-1",
  basis2: "semantic:why:basis-2",
  origin: "semantic:why:origin-anchor",
  translation: "semantic:why:translation-ghost",
  matrix: "semantic:why:matrix-readout",
} as const satisfies Record<string, SemanticObjectId>;

export const WHY_LINEAR_ALGEBRA_BEAT_CONTRACT = makeContract(
  "why-linear-algebra",
  CHAPTER0_SEGMENTS,
  Object.values(WHY),
  {
    identity: [
      [1, 0],
      [0, 1],
    ],
    scale: requireMatrixExample("uniform-scale").matrix,
    rotation: requireMatrixExample("rotation").matrix,
    reflection: requireMatrixExample("reflection").matrix,
    shear: requireMatrixExample("shear-2-1").matrix,
    projection: requireMatrixExample("projection-x").matrix,
    attemptedTranslation: [1.5, 0.2],
  },
  [
    {
      id: "establish",
      intent: "emphasis",
      focalObjects: [WHY.origin, WHY.craft],
      invariant:
        "The craft and origin are established before any transformation.",
      landingPhase: "originDown",
    },
    {
      id: "reveal",
      intent: "transition",
      focalObjects: [WHY.basis1, WHY.basis2, WHY.origin],
      invariant: "e₁ and e₂ are basis vectors; the grid lines are the axes.",
      landingPhase: "vertexIn",
      expectedChanges: [
        opacity(WHY.basis1, "appear"),
        opacity(WHY.basis2, "appear"),
      ],
    },
    ...["scale", "rotation", "reflection", "shear", "projection"].map((id) => {
      const movingBasis =
        id === "reflection" || id === "projection"
          ? [WHY.basis2]
          : [WHY.basis1, WHY.basis2];
      return {
        id,
        intent: "geometry" as const,
        focalObjects: [WHY.craft, ...movingBasis, WHY.transformedGrid],
        invariant:
          "The origin remains fixed while every displayed point follows the same live matrix.",
        landingPhase: "deform",
        expectedChanges: geometry(
          WHY.craft,
          ...movingBasis,
          WHY.transformedGrid,
        ),
        expectedStableObjects: [WHY.origin, WHY.grid],
      };
    }),
    {
      id: "predict-translation",
      intent: "emphasis",
      focalObjects: [WHY.origin, WHY.craft],
      invariant: "No mathematical object moves during the prediction hold.",
      landingPhase: "ask",
      prediction: {
        question: "Can a 2×2 matrix slide the craft off the origin?",
        revealBeat: "translation",
      },
      expectedStableObjects: [WHY.grid],
    },
    {
      id: "translation",
      intent: "geometry",
      focalObjects: [WHY.translation, WHY.origin],
      invariant:
        "The attempted translation moves continuously while the origin marker stays fixed.",
      landingPhase: "slide",
      expectedChanges: geometry(WHY.translation),
      expectedStableObjects: [WHY.origin, WHY.grid],
    },
    {
      id: "mystery",
      intent: "geometry",
      focalObjects: [WHY.craft, WHY.transformedGrid, WHY.matrix],
      invariant: "One live matrix drives the craft, grid, and matrix readout.",
      landingPhase: "deform",
      expectedChanges: geometry(WHY.craft, WHY.transformedGrid),
      expectedStableObjects: [WHY.origin, WHY.grid],
    },
  ],
);

const VECTOR = {
  grid: "semantic:grid:static",
  basisGrid: "semantic:grid:transformed*",
  v: "semantic:vectors:v",
  w: "semantic:vectors:w",
  sum: "semantic:vectors:sum",
  p: "semantic:vector:p",
  component1: "semantic:vectors:component-1",
  component2: "semantic:vectors:component-2",
  spanPlane: "semantic:span:whole-plane",
  spanLine: "semantic:vectors:span-line",
  dependentWalk: "semantic:vectors:dependent-walk",
  readout: "semantic:readout:p-standard",
} as const satisfies Record<string, SemanticObjectId>;

const vectorExample = LINEAR_COMBINATION_EXAMPLE;
export const VECTORS_LINEAR_COMBINATIONS_BEAT_CONTRACT = makeContract(
  "vectors-linear-combinations",
  LINEAR_COMBINATION_SEGMENTS,
  Object.values(VECTOR),
  {
    v: vectorExample.v,
    independentW: vectorExample.wIndependent,
    dependentW: vectorExample.wDependent,
    point: vectorExample.target,
    pointCoordinatesInBasis: vectorExample.coordinatesInBasis,
  },
  [
    {
      id: "plane",
      intent: "transition",
      focalObjects: [VECTOR.grid],
      invariant:
        "The origin and coordinate lattice establish the reference frame.",
      landingPhase: "settle",
      expectedChanges: [opacity(VECTOR.grid)],
      expectedStableObjects: [],
    },
    {
      id: "vector-v",
      intent: "geometry",
      focalObjects: [VECTOR.v],
      invariant:
        "v starts at the origin and ends at its shared example coordinates.",
      landingPhase: "grow",
      expectedChanges: geometry(VECTOR.v),
    },
    {
      id: "components",
      intent: "transition",
      focalObjects: [VECTOR.component1, VECTOR.component2, VECTOR.v],
      invariant: "The two component steps terminate exactly at v.",
      landingPhase: "compV",
      expectedChanges: [
        opacity(VECTOR.component1, "appear"),
        opacity(VECTOR.component2, "appear"),
      ],
      expectedStableObjects: [VECTOR.v, VECTOR.grid],
    },
    {
      id: "vector-w",
      intent: "geometry",
      focalObjects: [VECTOR.w],
      invariant: "w is a second persistent arrow from the origin.",
      landingPhase: "grow",
      expectedChanges: geometry(VECTOR.w),
    },
    {
      id: "addition",
      intent: "geometry",
      focalObjects: [VECTOR.w, VECTOR.sum],
      invariant:
        "The same w translates head-to-tail without changing its magnitude or direction.",
      landingPhase: "slide",
      expectedChanges: geometry(VECTOR.w),
      expectedStableObjects: [VECTOR.v, VECTOR.grid],
    },
    {
      id: "scaling",
      intent: "geometry",
      focalObjects: [VECTOR.sum, VECTOR.v],
      invariant: "Only the coefficient changes; the direction v remains fixed.",
      landingPhase: "aNeg",
      expectedChanges: geometry(VECTOR.sum),
      expectedStableObjects: [VECTOR.v, VECTOR.grid],
    },
    {
      id: "combination",
      intent: "geometry",
      focalObjects: [VECTOR.sum, VECTOR.v, VECTOR.w],
      invariant:
        "The endpoint is derived from the live coefficients and the same v and w.",
      landingPhase: "move3",
      expectedChanges: geometry(VECTOR.sum),
      expectedStableObjects: [VECTOR.v, VECTOR.w, VECTOR.grid],
    },
    {
      id: "span-plane",
      intent: "transition",
      focalObjects: [VECTOR.spanPlane, VECTOR.v, VECTOR.w],
      invariant:
        "The independent directions remain visible while the whole-plane region appears.",
      landingPhase: "fill",
      expectedChanges: [opacity(VECTOR.spanPlane, "appear")],
      expectedStableObjects: [VECTOR.v, VECTOR.w, VECTOR.grid],
    },
    {
      id: "dependent",
      intent: "geometry",
      focalObjects: [VECTOR.w, VECTOR.spanLine],
      invariant:
        "As w becomes dependent, the reachable set collapses to the same line.",
      landingPhase: "collapse",
      expectedChanges: geometry(VECTOR.w),
      expectedStableObjects: [VECTOR.v, VECTOR.grid],
    },
    {
      id: "dependent-inside",
      intent: "geometry",
      focalObjects: [VECTOR.dependentWalk, VECTOR.sum, VECTOR.spanLine],
      invariant: "Different coefficient pairs keep the endpoint fixed on r.",
      landingPhase: "move2",
      expectedChanges: geometry(VECTOR.dependentWalk),
      expectedStableObjects: [VECTOR.sum, VECTOR.spanLine, VECTOR.grid],
    },
    {
      id: "basis",
      intent: "transition",
      focalObjects: [VECTOR.v, VECTOR.w, VECTOR.spanPlane],
      invariant: "The independent pair is restored before it is named a basis.",
      landingPhase: "focus",
      expectedChanges: [opacity(VECTOR.spanPlane)],
    },
    {
      id: "read-standard",
      intent: "geometry",
      focalObjects: [VECTOR.p, VECTOR.basisGrid, VECTOR.readout],
      invariant:
        "p is constructed once and does not move when the grid changes.",
      landingPhase: "pIn",
      expectedChanges: geometry(VECTOR.p),
      expectedStableObjects: [VECTOR.grid],
    },
    {
      id: "predict-coordinates",
      intent: "emphasis",
      focalObjects: [VECTOR.p, VECTOR.v, VECTOR.w],
      invariant:
        "p and both basis directions remain fixed during the prediction.",
      landingPhase: "ask",
      prediction: {
        question: "How many steps along v and w reach p?",
        revealBeat: "coordinates",
      },
      expectedStableObjects: [VECTOR.p, VECTOR.v, VECTOR.w],
    },
    {
      id: "coordinates",
      intent: "geometry",
      focalObjects: [VECTOR.w, VECTOR.p, VECTOR.readout],
      invariant: "The head-to-tail walk ends exactly at the fixed p.",
      landingPhase: "walk2",
      expectedChanges: geometry(VECTOR.w),
      expectedStableObjects: [VECTOR.p, VECTOR.v, VECTOR.grid],
    },
  ],
);

const COMPOSITION = {
  grid: "semantic:grid:static",
  craft: "semantic:composition:craft*",
  basis1: "semantic:composition:basis-1",
  basis2: "semantic:composition:basis-2",
  path1: "semantic:composition:path-1",
  path2: "semantic:composition:path-2",
  endpoint2: "semantic:composition:endpoint-2",
  comparison: "semantic:composition:other-order*",
  pointU: "semantic:composition:point-u",
  pointV: "semantic:composition:point-v",
} as const satisfies Record<string, SemanticObjectId>;
const compositionA = requireMatrixExample("shear-2-1").matrix as Matrix2x2;
const compositionR = requireMatrixExample("rotation").matrix as Matrix2x2;
export const MATRIX_COMPOSITION_BEAT_CONTRACT = makeContract(
  "matrix-composition",
  MATRIX_COMPOSITION_SEGMENTS,
  Object.values(COMPOSITION),
  {
    firstMap: compositionR,
    secondMap: compositionA,
    composite: matrixMatrixMultiply(compositionA, compositionR),
    otherOrder: matrixMatrixMultiply(compositionR, compositionA),
    singularMap: requireMatrixExample("singular-collapse").matrix,
  },
  [
    {
      id: "apply-b",
      intent: "geometry",
      focalObjects: [COMPOSITION.craft, COMPOSITION.basis1, COMPOSITION.basis2],
      invariant: "The first map R acts on the identity state.",
      landingPhase: "morph",
      expectedChanges: geometry(
        COMPOSITION.craft,
        COMPOSITION.basis1,
        COMPOSITION.basis2,
      ),
    },
    {
      id: "apply-a",
      intent: "geometry",
      focalObjects: [COMPOSITION.craft, COMPOSITION.basis1, COMPOSITION.basis2],
      invariant: "A acts on the persistent R-image; no object is replaced.",
      landingPhase: "morph",
      expectedChanges: geometry(
        COMPOSITION.craft,
        COMPOSITION.basis1,
        COMPOSITION.basis2,
      ),
    },
    {
      id: "one-map",
      intent: "geometry",
      focalObjects: [COMPOSITION.craft, COMPOSITION.basis1, COMPOSITION.basis2],
      invariant: "The single product map lands on the same AR state.",
      landingPhase: "morph",
      expectedChanges: geometry(
        COMPOSITION.craft,
        COMPOSITION.basis1,
        COMPOSITION.basis2,
      ),
    },
    {
      id: "columns",
      intent: "transition",
      focalObjects: [
        COMPOSITION.path1,
        COMPOSITION.path2,
        COMPOSITION.endpoint2,
        COMPOSITION.basis1,
        COMPOSITION.basis2,
      ],
      invariant:
        "Each persistent basis endpoint is the corresponding product column.",
      landingPhase: "end2",
      expectedChanges: [opacity(COMPOSITION.endpoint2, "appear")],
      expectedStableObjects: [
        COMPOSITION.basis1,
        COMPOSITION.basis2,
        COMPOSITION.grid,
      ],
    },
    {
      id: "predict-order",
      intent: "emphasis",
      focalObjects: [COMPOSITION.comparison, COMPOSITION.craft],
      invariant:
        "The AR landing outline remains fixed while the alternate order is predicted.",
      landingPhase: "ask",
      prediction: {
        question: "Does A-then-R land on the R-then-A outline?",
        revealBeat: "order",
      },
      expectedStableObjects: [COMPOSITION.comparison, COMPOSITION.grid],
    },
    {
      id: "order",
      intent: "geometry",
      focalObjects: [COMPOSITION.craft, COMPOSITION.comparison],
      invariant:
        "The AR comparison outline stays fixed while RA is constructed.",
      landingPhase: "morph",
      expectedChanges: geometry(COMPOSITION.craft),
      expectedStableObjects: [COMPOSITION.comparison, COMPOSITION.grid],
    },
    {
      id: "undo",
      intent: "geometry",
      focalObjects: [COMPOSITION.craft, COMPOSITION.basis1, COMPOSITION.basis2],
      invariant: "A⁻¹ returns the same persistent plane from A to identity.",
      landingPhase: "undo",
      expectedChanges: geometry(
        COMPOSITION.craft,
        COMPOSITION.basis1,
        COMPOSITION.basis2,
      ),
    },
    {
      id: "no-undo",
      intent: "geometry",
      focalObjects: [COMPOSITION.pointU, COMPOSITION.pointV],
      invariant:
        "Two distinct persistent inputs merge to one output under the singular map.",
      landingPhase: "morph",
      expectedChanges: geometry(COMPOSITION.pointU, COMPOSITION.pointV),
    },
  ],
);

const DET = {
  grid: "semantic:grid:static",
  region: "semantic:determinant:region",
  basis1: "semantic:determinant:basis-1",
  basis2: "semantic:determinant:basis-2",
  orientation: "semantic:determinant:orientation",
  readout: "semantic:determinant:readout",
} as const satisfies Record<string, SemanticObjectId>;
export const DETERMINANT_AREA_SCALING_BEAT_CONTRACT = makeContract(
  "determinant-area-scaling",
  DETERMINANT_SEGMENTS,
  Object.values(DET),
  {
    mainMatrix: DETERMINANT_LESSON_EXAMPLE.matrix,
    expansion: requireMatrixExample("uniform-scale").matrix,
    collapse: requireMatrixExample("singular-collapse").matrix,
    negative: requireMatrixExample("determinant-negative").matrix,
  },
  [
    {
      id: "identity",
      intent: "geometry",
      focalObjects: [DET.region, DET.basis1, DET.basis2],
      invariant: "The unit square begins with area 1 and standard basis edges.",
      landingPhase: "in",
      expectedChanges: geometry(DET.basis1, DET.basis2),
    },
    {
      id: "basis",
      intent: "geometry",
      focalObjects: [DET.region, DET.basis1, DET.basis2, DET.readout],
      invariant:
        "The same live matrix drives the columns, region, and readout.",
      landingPhase: "morph",
      expectedChanges: geometry(DET.region, DET.basis1, DET.basis2),
    },
    {
      id: "parallelogram",
      intent: "transition",
      focalObjects: [DET.region],
      invariant: "The deformed unit square remains the same tracked region.",
      landingPhase: "ghost",
      expectedChanges: [opacity(DET.region)],
    },
    {
      id: "area",
      intent: "emphasis",
      focalObjects: [DET.region, DET.readout],
      invariant:
        "The readout is derived from the same live matrix as the region.",
      landingPhase: "focus",
      expectedStableObjects: [DET.region, DET.grid],
    },
    {
      id: "expand",
      intent: "geometry",
      focalObjects: [DET.region, DET.readout],
      invariant:
        "Each diagonal stretch and the displayed area share one live state.",
      landingPhase: "y",
      expectedChanges: geometry(DET.region),
    },
    {
      id: "collapse",
      intent: "geometry",
      focalObjects: [DET.region, DET.readout],
      invariant:
        "Area magnitude reaches zero exactly when the region becomes a line.",
      landingPhase: "morph",
      expectedChanges: geometry(DET.region),
    },
    {
      id: "predict-negative",
      intent: "emphasis",
      focalObjects: [DET.orientation, DET.readout],
      invariant:
        "The collapsed state remains fixed during the sign prediction.",
      landingPhase: "ask",
      prediction: {
        question: "What does a negative signed area factor mean?",
        revealBeat: "negative",
      },
      expectedStableObjects: [DET.region, DET.grid],
    },
    {
      id: "negative",
      intent: "geometry",
      focalObjects: [DET.region, DET.orientation, DET.readout],
      invariant:
        "Magnitude, sign, and orientation are derived from the same live transform.",
      landingPhase: "morph",
      expectedChanges: geometry(DET.region, DET.orientation),
    },
    {
      id: "sign",
      intent: "emphasis",
      focalObjects: [DET.region, DET.orientation, DET.readout],
      invariant:
        "Area magnitude and orientation sign are shown as distinct quantities.",
      landingPhase: "focus",
      expectedStableObjects: [DET.region, DET.grid],
    },
    {
      id: "summary",
      intent: "geometry",
      focalObjects: [DET.region, DET.orientation, DET.readout],
      invariant:
        "The final signed-area readout agrees with the restored main matrix.",
      landingPhase: "morph",
      expectedChanges: geometry(DET.region, DET.orientation),
    },
  ],
);

const BASIS = {
  grid: "semantic:grid:static",
  basisGrid: "semantic:change-basis:grid",
  eigenGrid: "semantic:change-basis:eigen-grid",
  p: "semantic:vector:p",
  basis1: "semantic:change-basis:basis-1",
  basis2: "semantic:change-basis:basis-2",
  walk1: "semantic:change-basis:walk-1",
  walk2: "semantic:change-basis:walk-2",
  outline: "semantic:change-basis:outline",
  eigen1: "semantic:change-basis:eigen-1",
  eigen2: "semantic:change-basis:eigen-2",
  standardReadout: "semantic:readout:p-standard",
  basisReadout: "semantic:change-basis:basis-readout",
} as const satisfies Record<string, SemanticObjectId>;
const changeB1 = LINEAR_COMBINATION_EXAMPLE.v as Vector2;
const changeB2 = LINEAR_COMBINATION_EXAMPLE.wIndependent as Vector2;
const changePoint = LINEAR_COMBINATION_EXAMPLE.target as Vector2;
const changeMatrix = requireMatrixExample("eigen-distinct").matrix as Matrix2x2;
const changeEigen1: Vector2 = [1, 0];
const changeEigen2: Vector2 = [-1, 1];
export const CHANGE_OF_BASIS_BEAT_CONTRACT = makeContract(
  "change-of-basis",
  CHANGE_OF_BASIS_SEGMENTS,
  Object.values(BASIS),
  {
    basis1: changeB1,
    basis2: changeB2,
    point: changePoint,
    pointCoordinates: coordinatesInBasis(changeB1, changeB2, changePoint)!,
    matrix: changeMatrix,
    matrixInEigenbasis: matrixInBasis(
      changeMatrix,
      changeEigen1,
      changeEigen2,
    )!,
  },
  [
    {
      id: "one-arrow",
      intent: "transition",
      focalObjects: [BASIS.p, BASIS.standardReadout],
      invariant: "p is constructed once at its fixed geometric position.",
      landingPhase: "readoutReveal",
      expectedChanges: [opacity(BASIS.standardReadout, "appear")],
      expectedStableObjects: [BASIS.p, BASIS.grid],
    },
    {
      id: "swap-grid",
      intent: "transition",
      focalObjects: [BASIS.p, BASIS.basisGrid, BASIS.basis1, BASIS.basis2],
      invariant: "Only the grid and basis apparatus change; p stays fixed.",
      landingPhase: "grid",
      expectedChanges: [opacity(BASIS.basisGrid, "appear")],
      expectedStableObjects: [BASIS.p],
    },
    {
      id: "predict-readout",
      intent: "emphasis",
      focalObjects: [BASIS.p, BASIS.basis1, BASIS.basis2],
      invariant: "p and both basis directions stay fixed during prediction.",
      landingPhase: "ask",
      prediction: {
        question: "What coordinates name p in basis B?",
        revealBeat: "new-readout",
      },
      expectedStableObjects: [BASIS.p, BASIS.basis1, BASIS.basis2],
    },
    {
      id: "new-readout",
      intent: "geometry",
      focalObjects: [BASIS.walk1, BASIS.walk2, BASIS.p, BASIS.basisReadout],
      invariant: "The continuous basis walk ends exactly at the fixed p.",
      landingPhase: "walk2",
      expectedChanges: geometry(BASIS.walk2),
      expectedStableObjects: [BASIS.p, BASIS.basis1, BASIS.basis2],
    },
    {
      id: "hidden-subscript",
      intent: "text",
      focalObjects: [BASIS.standardReadout, BASIS.basisReadout, BASIS.p],
      invariant: "Two readouts name the same fixed geometric vector.",
      landingPhase: "hold",
      expectedStableObjects: [BASIS.p],
    },
    {
      id: "map-standard",
      intent: "geometry",
      focalObjects: [BASIS.outline, BASIS.grid],
      invariant:
        "The standard-coordinate matrix and outline describe one live deformation.",
      landingPhase: "morph",
      expectedChanges: geometry(BASIS.outline),
      expectedStableObjects: [BASIS.grid],
    },
    {
      id: "map-eigenbasis",
      intent: "geometry",
      focalObjects: [
        BASIS.outline,
        BASIS.eigenGrid,
        BASIS.eigen1,
        BASIS.eigen2,
      ],
      invariant:
        "The same deformation is replayed; eigenbasis directions only scale and never turn.",
      landingPhase: "replay",
      expectedChanges: geometry(BASIS.outline, BASIS.eigen1, BASIS.eigen2),
    },
  ],
);

export const CONTINUOUS_SPACE_BEAT_CONTRACTS = {
  "why-linear-algebra": WHY_LINEAR_ALGEBRA_BEAT_CONTRACT,
  "vectors-linear-combinations": VECTORS_LINEAR_COMBINATIONS_BEAT_CONTRACT,
  "matrix-composition": MATRIX_COMPOSITION_BEAT_CONTRACT,
  "determinant-area-scaling": DETERMINANT_AREA_SCALING_BEAT_CONTRACT,
  "change-of-basis": CHANGE_OF_BASIS_BEAT_CONTRACT,
} as const;
