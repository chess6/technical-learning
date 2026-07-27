import type { DesignCandidate } from "./eliminationCandidates";
import {
  EIGEN_DERIVATION_SEGMENTS,
} from "../../guided-scenes/scenes/sceneTimings";

/**
 * The eigenvector-derivation design experiment.
 *
 * Two complete, playable clips for the same chain — Av = λv → (A − λI)v = 0 →
 * det(A − λI) = 0 → eigenvalues and eigenspaces — taking deliberately opposite
 * routes through it, and deliberately opposite visual languages.
 *
 * The production scene this is measured against sits at roughly 7/10: honest,
 * but it explains on one flat plane with arrows, states the characteristic
 * polynomial as a caption rather than deriving it from the matrix on screen,
 * and never lets λ be a quantity the learner can watch move. Both candidates
 * attack a different one of those.
 *
 * Both must also fix the ambiguity the production clip has while solving
 * (A − 2I): only the λ = 2 null direction may be on screen there. Showing both
 * eigenlines during one root's solve implies the shifted matrix kills both,
 * which is false — A − 2I kills exactly one of them. Both directions come back
 * only once the plane has returned to A.
 */

export const EIGEN_CANDIDATES: readonly DesignCandidate[] = [
  {
    id: "shipped",
    title: "Shipped · Chain",
    strapline:
      "The promoted worked-example clip: the derivation written out, line by line, with a witness beside it.",
    obstacle:
      "A learner who has watched the geometry still cannot reproduce the argument on paper. The shipped clip teaches the reproducible symbolic procedure and assumes the phenomenon is already understood.",
    leadRepresentation:
      "Algebra leads and stays; a small witness panel shows the one geometric fact licensing the line being written.",
    persistent:
      "Every line of the chain, and the matrix A pinned beside it. Nothing is cleared, so the closing frame is the whole derivation.",
    attention:
      "The newest line is the only one at full strength; earlier lines step back but stay legible.",
    distinctBecause:
      "This is the production clip, not a hypothesis — it is registered here so it can be compared against the candidates it came from in the same viewport.",
    durationSeconds: 0,
    beats: [],
  },
  {
    id: "knob",
    title: "A · Knob",
    strapline:
      "λ as a dial: sweep it and watch det(A − λI) cross zero while the plane collapses.",
    obstacle:
      "Eigenvalues arrive as the output of a formula the learner is handed. Nothing shows that λ is a quantity you can VARY, that A − λI is a whole family of maps, or that the characteristic equation is asking one question — for which λ does this family stop being invertible?",
    leadRepresentation:
      "Geometry leads, on the whole plane: the grid itself deforms under A − λI. A second co-equal view — the graph of det(A − λI) against λ — is traced by the same dial, so the algebraic condition and the geometric collapse are two readouts of one motion.",
    persistent:
      "The dial and the curve, which are never cleared: by the end the curve carries both crossings, and the two λ values are places on it rather than results of a computation.",
    attention:
      "One quantity moves at a time. During the sweep only λ changes, and everything the frame shows is a function of it.",
    distinctBecause:
      "It is the only candidate with a function graph, and the only one where λ is continuous. Its argument runs backwards from the usual one: the collapse is found first, and the polynomial is named afterwards as the equation that predicts where it happens.",
    durationSeconds: 54,
    beats: [
      { id: "fan", title: "Most directions turn", at: 0 },
      { id: "eigenlines", title: "Two do not", at: 6 },
      { id: "shift", title: "Subtract λ from the diagonal", at: 12 },
      { id: "sweep", title: "Turn the dial", at: 18 },
      // Each collapse beat names the IMAGE — the line the plane lands on —
      // before the kernel beat names the inputs that died. They are different
      // lines, and the clip says which is which.
      { id: "firstZero", title: "λ = 2: the plane collapses", at: 25 },
      { id: "kernel1", title: "What died at λ = 2", at: 30.5 },
      { id: "secondZero", title: "λ = 3: it collapses again", at: 36 },
      { id: "kernel2", title: "What died at λ = 3", at: 42 },
      { id: "polynomial", title: "The equation that predicts the zeros", at: 47 },
    ],
  },
  {
    id: "chain",
    title: "B · Chain",
    strapline:
      "The derivation written out as a chain of equivalences, each line with a witness.",
    obstacle:
      "A learner who has watched the geometry still cannot reproduce the argument on paper. Each step — moving λv across, factoring out v, requiring v ≠ 0, concluding the determinant vanishes — is a separate inference, and a clip that keeps them implicit teaches a result rather than a method.",
    leadRepresentation:
      "Algebra leads and stays. The chain builds downward and every line remains readable; a small witness panel to its right shows the one geometric fact that licenses the line currently being written.",
    persistent:
      "Every line of the chain, from the first to the last. Nothing is cleared, so the finished frame is the whole proof, and the matrix A stays pinned beside it.",
    attention:
      "The newest line is the only one at full strength; earlier lines step back but stay legible, so the argument reads as a stack rather than a sequence of slides.",
    distinctBecause:
      "It is the only candidate on a light ground — a page rather than a void — and the only one where the finished frame is a written derivation the learner could copy. Its factoring step is a real symbol move: the v is pulled out of two terms into one.",
    durationSeconds: 54,
    beats: [
      { id: "defining", title: "Av = λv", at: 0 },
      { id: "gather", title: "Move λv across", at: 6 },
      { id: "factor", title: "Factor out v", at: 12 },
      { id: "nonzero", title: "v is not zero", at: 18.5 },
      { id: "singular", title: "So A − λI must be singular", at: 24 },
      { id: "determinant", title: "det(A − λI) = 0", at: 30 },
      { id: "expand", title: "Compute it from the entries", at: 35.5 },
      { id: "roots", title: "Two eigenvalues", at: 41 },
      { id: "eigenspaces", title: "Substitute each back", at: 45 },
    ],
  },
];

export function getEigenCandidate(id: string): DesignCandidate {
  const candidate = EIGEN_CANDIDATES.find((entry) => entry.id === id);
  if (!candidate) {
    throw new Error(`Unknown eigen candidate: "${id}"`);
  }
  if (candidate.beats.length > 0) return candidate;
  // The shipped clip reads its chapters from the production timing registry, so
  // the lab's beat buttons cannot drift from the learner-facing scene.
  let at = 0;
  const beats = EIGEN_DERIVATION_SEGMENTS.map((segment) => {
    const beat = { id: segment.id, title: segment.title, at };
    at += segment.duration;
    return beat;
  });
  return { ...candidate, beats, durationSeconds: at };
}

const SCENE_LOADERS: Record<string, () => Promise<unknown>> = {
  // The PRODUCTION scene module, not a copy of it: a lab entry that drifted
  // from what learners see would be worse than no entry.
  shipped: () =>
    import("../../guided-scenes/scenes/eigenvectorsDerivationScene").then(
      (m) => m.eigenvectorsDerivationScene,
    ),
  knob: () => import("./scenes/eigenKnobScene").then((m) => m.eigenKnobScene),
  chain: () => import("./scenes/eigenChainScene").then((m) => m.eigenChainScene),
};

export function getEigenSceneDescription(id: string): Promise<unknown> {
  const loader = SCENE_LOADERS[id];
  if (!loader) {
    throw new Error(`No scene registered for eigen candidate "${id}".`);
  }
  return loader();
}
