/**
 * Playback beats for the Lesson 4 eigen clips.
 *
 * This is **playback metadata**, not a teaching schema. Each beat carries only
 * what the player, the 2D/3D mapping, and accessibility actually need:
 *   - `id`       — semantic majorStepId (seeking, modal state, 2D/3D sync)
 *   - `equation` — the KaTeX shown in the modal step list
 *   - `label`    — a short plain-text name for the accessible button
 *   - `threeD`   — how the 3D extension should interpret this beat
 *
 * Deliberately no captions / prose here: the scene owns its brief visual
 * captions, and the lesson page owns the conceptual explanation. Do not grow
 * this back into a per-step explanatory template.
 */

export type ThreeDInterpretation =
  | "invariant-line"
  | "shift-collapse"
  | "nearest";

export type PlaybackBeat = {
  readonly id: string;
  /** KaTeX body without surrounding $...$ (rendered by ProseWithMath). */
  readonly equation: string;
  /** Short plain-text name for the accessible step button. */
  readonly label: string;
  /** How the 3D extension should interpret this beat. */
  readonly threeD: ThreeDInterpretation;
};

const DERIVATION_SCENE_BEATS: readonly PlaybackBeat[] = [
  {
    id: "recap",
    equation: "A\\mathbf{v}=\\lambda\\mathbf{v}",
    label: "Av = λv",
    threeD: "invariant-line",
  },
  {
    id: "shift",
    equation: "(A-\\lambda I)\\mathbf{v}=\\mathbf{0}",
    label: "(A − λI)v = 0",
    threeD: "shift-collapse",
  },
  {
    id: "charpoly",
    equation: "\\det(A-\\lambda I)=0",
    label: "det(A − λI) = 0",
    threeD: "shift-collapse",
  },
  {
    id: "solveLambda",
    equation: "\\lambda^2-(\\mathrm{tr}\\,A)\\lambda+\\det A=0",
    label: "Solve for λ",
    threeD: "nearest",
  },
  {
    id: "solveV",
    equation: "(A-\\lambda I)\\mathbf{v}=\\mathbf{0}",
    label: "Solve the eigenspaces",
    threeD: "nearest",
  },
  {
    id: "interpret",
    equation: "A\\mathbf{v}=\\lambda\\mathbf{v}",
    label: "Interpret geometrically",
    threeD: "invariant-line",
  },
];

/** Conceptual Watch scene — fewer beats; still semantic ids. */
const INVARIANT_SCENE_BEATS: readonly PlaybackBeat[] = [
  {
    id: "fan",
    equation: "\\{\\mathbf{v}_i\\}",
    label: "A fan of directions",
    threeD: "nearest",
  },
  {
    id: "apply",
    equation: "A\\mathbf{v}",
    label: "Most directions turn",
    threeD: "nearest",
  },
  {
    id: "highlight",
    equation: "A\\mathbf{v}\\parallel\\mathbf{v}",
    label: "Some stay on their line",
    threeD: "invariant-line",
  },
  {
    id: "equation",
    equation: "A\\mathbf{v}=\\lambda\\mathbf{v}",
    label: "Av = λv",
    threeD: "invariant-line",
  },
  {
    id: "lambdas",
    equation: "\\lambda>1,\\;\\lambda<0,\\;\\lambda=0",
    label: "Stretch, reverse, collapse",
    threeD: "invariant-line",
  },
  {
    id: "scalar",
    equation: "A=\\lambda I",
    label: "Scalar: every direction",
    threeD: "nearest",
  },
  {
    id: "defective",
    equation: "\\dim E_\\lambda=1",
    label: "Defective: only one line",
    threeD: "nearest",
  },
  {
    id: "rotation",
    equation: "\\text{no real }\\mathbf{v}",
    label: "No real eigenvectors",
    threeD: "nearest",
  },
  {
    id: "summary",
    equation: "A\\mathbf{v}=\\lambda\\mathbf{v}",
    label: "Invariant directions",
    threeD: "invariant-line",
  },
];

const BY_SCENE: Record<string, readonly PlaybackBeat[]> = {
  "eigenvectors-derivation": DERIVATION_SCENE_BEATS,
  "eigenvectors-invariant-directions": INVARIANT_SCENE_BEATS,
};

export function getPlaybackBeats(
  sceneId: string,
): readonly PlaybackBeat[] | null {
  return BY_SCENE[sceneId] ?? null;
}

export function getPlaybackBeat(
  sceneId: string,
  beatId: string,
): PlaybackBeat | null {
  const beats = getPlaybackBeats(sceneId);
  return beats?.find((beat) => beat.id === beatId) ?? null;
}

/**
 * Map a 2D major step to the nearest meaningful 3D extension state.
 * Returns the beat that should drive the 3D view (may differ from the 2D id).
 */
export function resolveThreeDStep(
  sceneId: string,
  majorStepId: string,
): PlaybackBeat | null {
  const beats = getPlaybackBeats(sceneId);
  if (!beats || beats.length === 0) return null;

  const exact = beats.find((beat) => beat.id === majorStepId);
  if (exact && exact.threeD !== "nearest") return exact;

  // Walk backward to the nearest beat with a concrete 3D interpretation.
  const index = beats.findIndex((beat) => beat.id === majorStepId);
  const start = index >= 0 ? index : beats.length - 1;
  for (let i = start; i >= 0; i -= 1) {
    const beat = beats[i]!;
    if (beat.threeD !== "nearest") return beat;
  }
  // Fall forward if nothing earlier qualifies.
  for (const beat of beats) {
    if (beat.threeD !== "nearest") return beat;
  }
  return beats[0] ?? null;
}
