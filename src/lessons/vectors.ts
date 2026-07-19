import type { LessonDefinition } from "./types";

export const vectorsLesson: LessonDefinition = {
  id: "vectors",
  title: "Vectors and Linear Combinations",
  subtitle: "Arrows, coordinates, and the span of two directions",
  learningObjectives: [
    "See a vector as a geometric object with magnitude and direction",
    "Add vectors and scale them by real coefficients",
    "Form linear combinations and recognize span",
    "Distinguish linearly independent and dependent pairs",
  ],
  sections: [
    {
      id: "intro",
      title: "Vectors as arrows",
      body: "A vector is an arrow from the origin. Its tip encodes both length and direction, and its coordinates are the horizontal and vertical components of that tip.",
      equation: "\\mathbf{v} = \\begin{bmatrix} v_1 \\\\ v_2 \\end{bmatrix}",
      observation:
        "Coordinates are not a separate idea from geometry — they are a description of the same arrow.",
    },
    {
      id: "combinations",
      title: "Linear combinations",
      body: "Scaling two vectors and adding the results produces a linear combination. Every point you can reach this way belongs to the span of those vectors.",
      equation: "a\\mathbf{v} + b\\mathbf{w}",
      observation:
        "Independent vectors span the plane. Dependent vectors collapse onto a single line.",
    },
  ],
  guidedSceneId: "linear-combinations",
  explorationId: "linear-combination",
  exampleId: "vectors-default",
  exercises: [
    {
      id: "vec-add-predict",
      type: "prediction",
      prompt:
        "If you place the tip of (1, 0) at the tail of (0, 2), where does the resulting arrow end?",
      reveal: "At (1, 2) — vector addition stacks arrows head-to-tail.",
    },
    {
      id: "vec-span",
      type: "multiple-choice",
      prompt: "Two vectors that are scalar multiples of each other span…",
      choices: [
        "the entire plane",
        "a single line through the origin",
        "only the origin",
        "a circle of fixed radius",
      ],
      correctChoice: 1,
      explanation:
        "Dependent vectors point along the same line, so every linear combination stays on that line.",
    },
  ],
  keyTakeaway:
    "Linear combinations turn two directions into a reachable set — a line if they are dependent, the whole plane if they are independent.",
};
