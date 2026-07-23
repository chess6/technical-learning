import type { LessonDefinition } from "./types";

/**
 * Chapter 0 — "Why Linear Algebra?"
 *
 * Gated by the joint opening-slice Insight Contract
 * (docs/courses/linear-algebra/lessons/00-opening-slice/insight.md, PASS). Chapter 0 opens the mystery
 * — a single 2×2 matrix relocating every vertex of a graphic at once — through a
 * guided scene and a bounded interaction, connects it to real applications,
 * exposes translation as a productive limitation, and hands off to Lesson 1.
 * It carries no artificial Check/Practice/Summary: its declared route ends at
 * the open question and the handoff.
 */
export const chapter0Lesson: LessonDefinition = {
  id: "why-linear-algebra",
  kind: "intro",
  title: "Why Linear Algebra?",
  subtitle: "A first look before the mechanics",
  learningObjectives: [
    "See that a single 2×2 matrix can move an entire graphic at once.",
    "Notice that a linear transformation always keeps the origin fixed.",
    "Recognize the same idea behind graphics, robotics, and data.",
    "Carry one precise question into Lessons 1 and 2.",
  ],
  motivatingQuestion:
    "A little craft is drawn from a handful of corner points. Change four numbers and the whole craft stretches, spins, or flattens — every corner at once. How can four numbers control all of that?",
  sections: [
    {
      id: "mystery",
      title: "Four numbers move a whole graphic",
      body: "Watch a small craft ride a live $2\\times 2$ matrix. Scaling, rotation, reflection, and shear each relocate every vertex at once — and a projection collapses the whole plane onto a line. Through all of it the origin never moves. The craft is stored as the coordinates of its vertices (its corner points), and the matrix acts on those coordinates. This is exactly how a game or graphics engine moves an object: it transforms the object's vertices, not its pixels.",
      observation:
        "Only four numbers changed, yet every vertex found a new home. That is the mystery this course opens with.",
    },
    {
      id: "where-you-see-this",
      title: "The same idea, everywhere",
      body: "Once you can move every vertex with four numbers, the same machinery shows up far beyond a toy craft:",
      observation:
        "In each case a matrix transforms the coordinates of points — vertices, frames, or feature vectors — never pixels directly.",
      layers: [
        {
          kind: "connection",
          title: "Three places this exact idea appears",
          body: "**Computer graphics & animation.** Every rotate, scale, shear, or flip of a sprite or 3-D model is a matrix acting on its vertices; animation smoothly interpolates between such transforms. **Robotics & physics.** A robot arm or rigid body's change of orientation is a linear map on coordinates, and \u201cwhere the axes land\u201d places its frame. **Data & machine learning.** A linear layer transforms whole coordinate vectors at once — again, \u201cwhat happens to the axes\u201d tells you everything.",
        },
      ],
    },
    {
      id: "translation-limit",
      title: "One move four numbers can't make",
      body: "Try to *slide* the whole craft sideways — a translation — using only the four matrix numbers. You can't. A linear transformation always sends the origin to the origin, so a $2\\times 2$ matrix can never shift the plane off its anchor. Sliding is genuinely useful, so this is a real limitation, not a bug.",
      observation:
        "The fix — affine or homogeneous coordinates — is named here only; we return to it much later. For now, notice what four numbers can and cannot do.",
      layers: [
        {
          kind: "looking-ahead",
          title: "How translation is handled (named only)",
          body: "Graphics engines recover translation with **homogeneous coordinates**: they embed the plane in 3-D and use a $3\\times 3$ matrix, so a shift becomes linear one dimension up. That machinery is deferred — this slice stays with ordinary $2\\times 2$ linear maps.",
        },
      ],
    },
  ],
  formalBlocks: [
    {
      id: "ch0-open-question",
      kind: "conjecture",
      label: "The question this course opens with",
      statement:
        "How can four numbers determine where **every** vertex goes under one linear transformation?",
      interpretation:
        "This is an honest open question, not a claim — four matrix entries cannot produce *any* picture you like, only the images of $\\mathbf{e}_1$ and $\\mathbf{e}_2$ under one linear map. Lesson 1 supplies the coordinate language that makes the question precise; Lesson 2 answers it.",
      visibility: "visible",
    },
  ],
  route: [
    { kind: "motivate" },
    // Visual mystery first — the recognizable craft moving under one matrix —
    // before any explanatory detail.
    { kind: "visual" },
    { kind: "section", sectionId: "mystery" },
    { kind: "explore" },
    { kind: "section", sectionId: "where-you-see-this" },
    { kind: "section", sectionId: "translation-limit" },
    { kind: "formal", formalId: "ch0-open-question" },
    { kind: "handoff", to: "/lesson/vectors", label: "Begin Lesson 1: Vectors & Coordinates" },
  ],
  guidedSceneId: "why-linear-algebra",
  // Chapter 0's OWN bounded explorer — craft + presets + scrubber + one vertex.
  // No determinant / column space / basis change / column-building task here.
  explorationId: "graphic-transformation",
};
