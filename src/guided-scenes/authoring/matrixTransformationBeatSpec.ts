import { MATRIX_TRANSFORMATION_SEGMENTS } from "../scenes/sceneTimings";
import type {
  BeatSpec,
  CheckpointSpec,
  SceneBeatContract,
  SemanticChangeSpec,
  SemanticObjectId,
} from "./beatSpec";

const SCENE_ID = "matrix-transformations";

export const MATRIX_TRANSFORMATION_OBJECTS = {
  viewport: "presentation:viewport-world",
  staticGrid: "semantic:grid:static*",
  transformedGrid: "semantic:grid:transformed*",
  origin: "semantic:matrix:origin",
  column1: "semantic:matrix:column-1",
  column2: "semantic:matrix:column-2",
  sample: "semantic:matrix:sample",
  component1: "semantic:matrix:component-1",
  component2: "semantic:matrix:component-2",
  probeImage: "semantic:matrix:probe-image",
  matrixReadout: "semantic:matrix:ledger:row:matrix:value",
  relationReadout: "semantic:matrix:ledger:row:relation:value",
  prediction: "presentation:matrix:prediction",
} as const satisfies Record<string, SemanticObjectId>;

const O = MATRIX_TRANSFORMATION_OBJECTS;

function checkpoints(
  landingPhase: string,
  requiredObjects: readonly SemanticObjectId[],
): readonly CheckpointSpec[] {
  return [
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
      anchor: { kind: "phase", phaseId: landingPhase, position: "end" },
      requiredObjects,
    },
    {
      id: "final",
      anchor: { kind: "segment", position: "final" },
      requiredObjects,
    },
  ];
}

function geometry(...objects: SemanticObjectId[]): SemanticChangeSpec[] {
  return objects.map((objectId) => ({
    objectId,
    property: "geometry",
    expectation: "change",
    continuous: true,
  }));
}

function beat(
  id: string,
  config: Omit<BeatSpec, "id" | "purpose" | "timingEvent" | "chapter">,
): BeatSpec {
  const segment = MATRIX_TRANSFORMATION_SEGMENTS.find((item) => item.id === id);
  if (!segment) throw new Error(`Unknown matrix-transformations segment ${id}`);
  return {
    id,
    purpose: segment.summary ?? segment.title,
    timingEvent: `${SCENE_ID}.${id}`,
    chapter: {
      id,
      title: segment.title,
      summary: segment.summary,
      seek: { kind: "segment-opening" },
    },
    ...config,
  };
}

export const MATRIX_TRANSFORMATION_BEAT_CONTRACT: SceneBeatContract = {
  sceneId: SCENE_ID,
  semanticObjects: Object.values(MATRIX_TRANSFORMATION_OBJECTS),
  mathData: {
    matrix: [
      [2, 1],
      [0, 1],
    ],
    sampleVector: [1.5, 0.5],
  },
  beats: [
    beat("identity", {
      intent: "geometry",
      focalObjects: [O.column1, O.column2],
      invariant: "The grid and both basis vectors begin at the identity.",
      checkpoints: checkpoints("establish", [O.column1, O.column2]),
      expectedChanges: geometry(O.column1, O.column2),
      expectedStableObjects: [O.staticGrid],
    }),
    beat("col1", {
      intent: "geometry",
      focalObjects: [O.column1, O.transformedGrid],
      invariant: "The second column remains e₂ while the first column moves.",
      checkpoints: checkpoints("columnMove", [
        O.column1,
        O.column2,
        O.transformedGrid,
      ]),
      expectedChanges: geometry(O.column1, O.transformedGrid),
      expectedStableObjects: [O.column2, O.staticGrid],
    }),
    beat("col2", {
      intent: "geometry",
      focalObjects: [O.column2, O.transformedGrid],
      invariant: "The first column remains Ae₁ while the second column moves.",
      checkpoints: checkpoints("columnMove", [
        O.column1,
        O.column2,
        O.transformedGrid,
      ]),
      expectedChanges: geometry(O.column2, O.transformedGrid),
      expectedStableObjects: [O.column1, O.staticGrid],
    }),
    beat("sample", {
      intent: "geometry",
      focalObjects: [O.sample, O.component1, O.component2],
      invariant: "The sample is still x; its coefficients are unchanged.",
      checkpoints: checkpoints("draw", [O.sample, O.column1, O.column2]),
      expectedChanges: geometry(O.sample),
      expectedStableObjects: [O.column1, O.column2, O.transformedGrid],
    }),
    beat("predict-sample", {
      intent: "emphasis",
      focalObjects: [O.prediction, O.column1, O.column2, O.sample],
      invariant: "No mathematical object moves while the learner predicts Ax.",
      prediction: {
        question: "Both columns are known. Where does x land?",
        revealBeat: "transform-sample",
      },
      checkpoints: checkpoints("evidenceIn", [
        O.prediction,
        O.column1,
        O.column2,
        O.sample,
      ]),
      expectedChanges: [
        { objectId: O.prediction, property: "opacity", expectation: "appear" },
      ],
      expectedStableObjects: [
        O.column1,
        O.column2,
        O.sample,
        O.transformedGrid,
      ],
    }),
    beat("transform-sample", {
      intent: "geometry",
      focalObjects: [O.sample, O.component1, O.component2],
      invariant: "The coefficients 1.5 and 0.5 remain unchanged during x → Ax.",
      checkpoints: checkpoints("carry", [O.sample, O.column1, O.column2]),
      expectedChanges: geometry(O.sample, O.component1, O.component2),
      expectedStableObjects: [O.column1, O.column2, O.transformedGrid],
    }),
    beat("grid", {
      intent: "geometry",
      focalObjects: [O.probeImage, O.transformedGrid],
      invariant:
        "The origin remains fixed and the line image remains straight.",
      checkpoints: checkpoints("trace", [O.probeImage, O.transformedGrid]),
      expectedChanges: geometry(O.probeImage),
      expectedStableObjects: [O.column1, O.column2, O.transformedGrid],
    }),
    beat("compare", {
      intent: "transition",
      focalObjects: [O.staticGrid, O.transformedGrid],
      invariant: "The transformation itself does not change during comparison.",
      checkpoints: checkpoints("ghostsIn", [O.staticGrid, O.transformedGrid]),
      expectedChanges: [],
      expectedStableObjects: [O.column1, O.column2, O.transformedGrid],
    }),
    beat("presets", {
      intent: "geometry",
      focalObjects: [O.column1, O.column2, O.transformedGrid],
      invariant: "Each preset starts from identity; the origin stays fixed.",
      checkpoints: checkpoints("tour", [
        O.column1,
        O.column2,
        O.transformedGrid,
      ]),
      expectedChanges: geometry(O.column1, O.column2, O.transformedGrid),
      expectedStableObjects: [O.staticGrid],
    }),
    beat("summary", {
      intent: "geometry",
      focalObjects: [O.column1, O.column2, O.transformedGrid],
      invariant:
        "The final columns and grid agree with the shared lesson matrix A.",
      checkpoints: checkpoints("restore", [
        O.column1,
        O.column2,
        O.transformedGrid,
      ]),
      expectedChanges: geometry(O.column1, O.column2, O.transformedGrid),
      expectedStableObjects: [O.staticGrid],
    }),
  ],
};
