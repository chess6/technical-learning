import {
  ELIMINATION_CANDIDATES,
  getCandidateSceneDescription as getEliminationScene,
  getEliminationCandidate,
  type DesignCandidate,
} from "./eliminationCandidates";
import {
  EIGEN_CANDIDATES,
  getEigenCandidate,
  getEigenSceneDescription,
} from "./eigenCandidates";

/**
 * The laboratory's design experiments.
 *
 * A design experiment is several complete, playable candidate clips for ONE
 * lesson, compared against each other rather than against a reference. Each
 * owns its candidate list, its scene loaders, and its resolver — the resolver
 * exists because a candidate may derive its chapters from a production timing
 * registry rather than hard-coding them.
 *
 * Adding an experiment means a module beside this one and an entry here; the
 * lab page needs no changes.
 */
export interface DesignExperiment {
  id: string;
  title: string;
  /** One line: the question this set of candidates is exploring. */
  question: string;
  candidates: readonly DesignCandidate[];
  resolve(candidateId: string): DesignCandidate;
  loadScene(candidateId: string): Promise<unknown>;
}

export const DESIGN_EXPERIMENTS: readonly DesignExperiment[] = [
  {
    id: "elimination",
    title: "Elimination",
    question:
      "How should one elementary row operation be taught — as arithmetic, as geometry, or as a choice among legal moves?",
    candidates: ELIMINATION_CANDIDATES,
    resolve: getEliminationCandidate,
    loadScene: getEliminationScene,
  },
  {
    id: "eigen",
    title: "Eigenvector derivation",
    question:
      "How should Av = λv → (A − λI)v = 0 → det(A − λI) = 0 → eigenvalues and eigenspaces be made into one argument a learner can follow?",
    candidates: EIGEN_CANDIDATES,
    resolve: getEigenCandidate,
    loadScene: getEigenSceneDescription,
  },
];

export function getDesignExperiment(id: string): DesignExperiment {
  const experiment = DESIGN_EXPERIMENTS.find((entry) => entry.id === id);
  if (!experiment) {
    throw new Error(`Unknown design experiment: "${id}"`);
  }
  return experiment;
}
