import rawTuning from "./matrixTransformationTuning.json";

export const MATRIX_TUNING_KEYS = [
  "cameraZoom",
  "ledgerX",
  "ledgerY",
  "ledgerWidth",
  "labelOffsetX",
  "labelOffsetY",
  "motionDurationScale",
] as const;

export type MatrixTransformationTuningKey =
  (typeof MATRIX_TUNING_KEYS)[number];

export type MatrixTransformationTuning = Record<
  MatrixTransformationTuningKey,
  number
>;

export interface TuningConstraint {
  label: string;
  min: number;
  max: number;
  step: number;
  category: "composition" | "pacing";
}

/** Presentation-only values. Mathematical inputs are deliberately absent. */
export const MATRIX_TRANSFORMATION_TUNING_CONSTRAINTS: Record<
  MatrixTransformationTuningKey,
  TuningConstraint
> = {
  cameraZoom: {
    label: "Camera zoom",
    min: 1,
    max: 1.35,
    step: 0.01,
    category: "composition",
  },
  ledgerX: {
    label: "Equation panel x",
    min: -360,
    max: 0,
    step: 1,
    category: "composition",
  },
  ledgerY: {
    label: "Equation panel y",
    min: -220,
    max: 180,
    step: 1,
    category: "composition",
  },
  ledgerWidth: {
    label: "Equation panel width",
    min: 300,
    max: 440,
    step: 2,
    category: "composition",
  },
  labelOffsetX: {
    label: "Label offset x",
    min: -80,
    max: 80,
    step: 1,
    category: "composition",
  },
  labelOffsetY: {
    label: "Label offset y",
    min: -80,
    max: 80,
    step: 1,
    category: "composition",
  },
  motionDurationScale: {
    label: "Motion duration",
    min: 0.5,
    max: 1,
    step: 0.05,
    category: "pacing",
  },
};

export function validateMatrixTransformationTuning(
  candidate: unknown,
): string[] {
  if (!candidate || typeof candidate !== "object") {
    return ["tuning must be an object"];
  }
  const values = candidate as Record<string, unknown>;
  const problems: string[] = [];
  const unknown = Object.keys(values).filter(
    (key) => !MATRIX_TUNING_KEYS.includes(key as MatrixTransformationTuningKey),
  );
  if (unknown.length > 0) problems.push(`unknown tuning keys: ${unknown.join(", ")}`);
  for (const key of MATRIX_TUNING_KEYS) {
    const value = values[key];
    const constraint = MATRIX_TRANSFORMATION_TUNING_CONSTRAINTS[key];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      problems.push(`${key} must be a finite number`);
    } else if (value < constraint.min || value > constraint.max) {
      problems.push(`${key} must be ${constraint.min}–${constraint.max}`);
    }
  }
  return problems;
}

const tuningProblems = validateMatrixTransformationTuning(rawTuning);
if (tuningProblems.length > 0) {
  throw new Error(`Invalid matrix transformation tuning: ${tuningProblems.join("; ")}`);
}

export const MATRIX_TRANSFORMATION_TUNING =
  rawTuning as MatrixTransformationTuning;

export const MATRIX_TRANSFORMATION_PROJECT_VARIABLES = Object.fromEntries(
  MATRIX_TUNING_KEYS.map((key) => [
    `authoring.matrix-transformations.${key}`,
    MATRIX_TRANSFORMATION_TUNING[key],
  ]),
);
