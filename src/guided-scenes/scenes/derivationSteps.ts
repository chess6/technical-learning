/**
 * Derivation-step sidebar data for Lesson 4 eigen clips.
 *
 * Step ids align with majorSteps in sceneMeta / sceneTimings.
 * The 3D extension maps only steps with a meaningful spatial interpretation;
 * other steps fall back to the nearest labeled 3D state.
 */

export type ThreeDInterpretation =
  | "invariant-line"
  | "shift-collapse"
  | "nearest";

export type DerivationStep = {
  readonly id: string;
  /** KaTeX body without surrounding $...$ (rendered by EquationBlock / ProseWithMath). */
  readonly equation: string;
  readonly label: string;
  readonly caption: string;
  /** How the 3D extension should interpret this step. */
  readonly threeD: ThreeDInterpretation;
};

const DERIVATION_SCENE_STEPS: readonly DerivationStep[] = [
  {
    id: "recap",
    equation: "A\\mathbf{v}=\\lambda\\mathbf{v}",
    label: "Av = λv",
    caption: "An eigendirection stays on its line; λ is the signed scale.",
    threeD: "invariant-line",
  },
  {
    id: "shift",
    equation: "(A-\\lambda I)\\mathbf{v}=\\mathbf{0}",
    label: "(A − λI)v = 0",
    caption:
      "Under the auxiliary map A − λI, a nonzero direction is sent to zero.",
    threeD: "shift-collapse",
  },
  {
    id: "charpoly",
    equation: "\\det(A-\\lambda I)=0",
    label: "det(A − λI) = 0",
    caption:
      "The transformed unit cube has zero volume, so the determinant is zero.",
    threeD: "shift-collapse",
  },
  {
    id: "solveLambda",
    equation: "\\lambda^2-(\\mathrm{tr}\\,A)\\lambda+\\det A=0",
    label: "Solve for λ",
    caption: "Solve the characteristic equation for eigenvalues.",
    threeD: "nearest",
  },
  {
    id: "solveV",
    equation: "(A-\\lambda I)\\mathbf{v}=\\mathbf{0}",
    label: "Solve the eigenspaces",
    caption: "For each λ, find the nullspace of A − λI.",
    threeD: "nearest",
  },
  {
    id: "interpret",
    equation: "A\\mathbf{v}=\\lambda\\mathbf{v}",
    label: "Interpret geometrically",
    caption: "Read each eigenpair as stretch, flip, or collapse along a line.",
    threeD: "invariant-line",
  },
];

/** Conceptual Watch scene — fewer algebraic steps; still semantic ids. */
const INVARIANT_SCENE_STEPS: readonly DerivationStep[] = [
  {
    id: "fan",
    equation: "\\{\\mathbf{v}_i\\}",
    label: "A fan of directions",
    caption: "Start with many directions in the plane.",
    threeD: "nearest",
  },
  {
    id: "apply",
    equation: "A\\mathbf{v}",
    label: "Most directions turn",
    caption: "Most tips leave their original rays.",
    threeD: "nearest",
  },
  {
    id: "highlight",
    equation: "A\\mathbf{v}\\parallel\\mathbf{v}",
    label: "Some stay on their line",
    caption: "A few directions remain on the same line through the origin.",
    threeD: "invariant-line",
  },
  {
    id: "equation",
    equation: "A\\mathbf{v}=\\lambda\\mathbf{v}",
    label: "Av = λv",
    caption: "Those directions are eigenvectors; λ is the eigenvalue.",
    threeD: "invariant-line",
  },
  {
    id: "lambdas",
    equation: "\\lambda>1,\\;\\lambda<0,\\;\\lambda=0",
    label: "Stretch, reverse, collapse",
    caption: "Different λ values stretch, flip, or collapse along the line.",
    threeD: "invariant-line",
  },
  {
    id: "scalar",
    equation: "A=\\lambda I",
    label: "Scalar: every direction",
    caption: "When A = λI every nonzero direction is an eigenvector.",
    threeD: "nearest",
  },
  {
    id: "defective",
    equation: "\\dim E_\\lambda=1",
    label: "Defective: only one line",
    caption: "A repeated λ need not give two independent eigenvectors.",
    threeD: "nearest",
  },
  {
    id: "rotation",
    equation: "\\text{no real }\\mathbf{v}",
    label: "No real eigenvectors",
    caption: "Some matrices have no real eigendirection.",
    threeD: "nearest",
  },
  {
    id: "summary",
    equation: "A\\mathbf{v}=\\lambda\\mathbf{v}",
    label: "Invariant directions",
    caption: "Eigenvectors are the directions that map onto themselves.",
    threeD: "invariant-line",
  },
];

const BY_SCENE: Record<string, readonly DerivationStep[]> = {
  "eigenvectors-derivation": DERIVATION_SCENE_STEPS,
  "eigenvectors-invariant-directions": INVARIANT_SCENE_STEPS,
};

export function getDerivationSteps(
  sceneId: string,
): readonly DerivationStep[] | null {
  return BY_SCENE[sceneId] ?? null;
}

export function getDerivationStep(
  sceneId: string,
  stepId: string,
): DerivationStep | null {
  const steps = getDerivationSteps(sceneId);
  return steps?.find((step) => step.id === stepId) ?? null;
}

/**
 * Map a 2D major step to the nearest meaningful 3D extension state.
 * Returns the step that should drive the 3D view (may differ from the 2D id).
 */
export function resolveThreeDStep(
  sceneId: string,
  majorStepId: string,
): DerivationStep | null {
  const steps = getDerivationSteps(sceneId);
  if (!steps || steps.length === 0) return null;

  const exact = steps.find((step) => step.id === majorStepId);
  if (exact && exact.threeD !== "nearest") return exact;

  // Walk backward to the nearest step with a concrete 3D interpretation.
  const index = exact
    ? steps.findIndex((step) => step.id === majorStepId)
    : steps.findIndex((step) => step.id === majorStepId);
  const start = index >= 0 ? index : steps.length - 1;
  for (let i = start; i >= 0; i -= 1) {
    const step = steps[i]!;
    if (step.threeD !== "nearest") return step;
  }
  // Fall forward if nothing earlier qualifies.
  for (const step of steps) {
    if (step.threeD !== "nearest") return step;
  }
  return steps[0] ?? null;
}
