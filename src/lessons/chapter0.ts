import type { LessonDefinition } from "./types";

/**
 * Chapter 0 — "Why Linear Algebra?" (walking skeleton).
 *
 * Gated by the joint opening-slice Insight Contract
 * (docs/insights/linear-algebra-opening.md, PASS). This first slice only makes
 * the mystery reachable and visible: the guided scene carries the shared
 * graphic through canonical transformations, and the learner can then take the
 * controls of the same live 2×2 matrix. Real-world application callouts, the
 * full narrative, and the target-matching activity are deferred to later slices.
 */
export const chapter0Lesson: LessonDefinition = {
  id: "why-linear-algebra",
  kind: "intro",
  title: "Why Linear Algebra?",
  subtitle: "Chapter 0 · a first look before the mechanics",
  learningObjectives: [
    "See that a single 2×2 matrix can move an entire graphic at once.",
    "Notice that a linear transformation keeps the origin fixed.",
    "Carry one motivating question into Lessons 1 and 2.",
  ],
  motivatingQuestion:
    "How can four numbers determine where every vertex goes under one linear transformation?",
  sections: [
    {
      id: "mystery",
      title: "Four numbers move a whole graphic",
      body:
        "Watch a small craft ride a live 2×2 matrix. Scaling, rotation, reflection, and shear each relocate every vertex at once — and a projection collapses the whole plane onto a line. Through all of it the origin never moves. The craft is described by the coordinates of its vertices, and the matrix acts on those coordinates.",
      observation:
        "Only four numbers changed, yet every vertex found a new home. Hold onto the question of how that is possible — Lesson 1 supplies the coordinate language and Lesson 2 resolves it.",
    },
  ],
  guidedSceneId: "why-linear-algebra",
  explorationId: "matrix-transformation",
};
