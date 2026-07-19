import type { LessonDefinition } from "./types";
import { LINEAR_COMBINATION_EXAMPLE as EX } from "./exampleData";

export const vectorsLesson: LessonDefinition = {
  id: "vectors",
  title: "Vectors and Linear Combinations",
  subtitle: "Arrows, coordinates, and the span of two directions",
  learningObjectives: [
    "See a vector as a geometric object with magnitude and direction",
    "Read coordinates as horizontal and vertical movement",
    "Add vectors and scale them by real coefficients",
    "Form linear combinations and recognize span",
    "Distinguish linearly independent and dependent pairs",
  ],
  motivatingQuestion:
    "You have two arrows pointing in different directions. By stretching and adding them, which points of the plane can you reach — a few, a line, or everywhere?",
  sections: [
    {
      id: "intro",
      title: "Vectors as arrows",
      body: "A vector is an arrow from the origin. Its tip encodes both length and direction, and its coordinates are simply the horizontal and vertical movement needed to reach that tip.",
      equation: "\\mathbf{v} = \\begin{bmatrix} v_1 \\\\ v_2 \\end{bmatrix}",
      observation:
        "Coordinates are not a separate idea from geometry — they describe the same arrow.",
    },
    {
      id: "combinations",
      title: "Scaling, adding, combining",
      body: "Scaling multiplies an arrow's length (a negative scalar flips it); adding places arrows head-to-tail. Do both at once and you get a linear combination $a\\mathbf{v} + b\\mathbf{w}$. Every point reachable this way is the span of the two vectors.",
      equation: "a\\mathbf{v} + b\\mathbf{w}",
      observation:
        "Independent vectors point in genuinely different directions and sweep out the whole plane. Dependent vectors share a line, so their span collapses onto that line.",
    },
  ],
  guidedSceneId: "vectors-linear-combinations",
  explorationId: "linear-combination",
  exampleId: "vectors-default",
  checkpoint: {
    prompt:
      "If $\\mathbf{w}$ points along the very same line as $\\mathbf{v}$, how much of the plane can $a\\mathbf{v} + b\\mathbf{w}$ reach?",
    answer:
      "Only that single line. Both terms stay on the shared direction, so no combination can ever step off it. Two independent directions are required to reach the whole plane.",
  },
  exercises: [
    {
      id: "vec-add-compute",
      type: "vector",
      prompt:
        "With $\\mathbf{v} = (1, 2)$ and $\\mathbf{w} = (3, -1)$, compute the linear combination $1\\cdot\\mathbf{v} + 1\\cdot\\mathbf{w}$. Enter the resulting coordinates.",
      expected: [EX.v[0] + EX.wIndependent[0], EX.v[1] + EX.wIndependent[1]],
      tolerance: 0.01,
      explanation:
        "Add componentwise: $(1+3,\\, 2+(-1)) = (4, 1)$. Vector addition adds the horizontal parts and the vertical parts independently.",
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
        "Scalar multiples point along one shared line, so every combination $a\\mathbf{v} + b\\mathbf{w}$ stays on that line — the span is a line, not the plane.",
    },
    {
      id: "vec-independent-predict",
      type: "prediction",
      prompt:
        "Predict: are $\\mathbf{v} = (1, 2)$ and $\\mathbf{w} = (3, -1)$ independent, and what does that mean for their span?",
      reveal:
        "They are independent — neither is a scalar multiple of the other (the cross term $1\\cdot(-1) - 2\\cdot 3 = -7 \\neq 0$). Independent directions span the whole plane, so $a\\mathbf{v} + b\\mathbf{w}$ can reach every point.",
    },
  ],
  keyTakeaway:
    "A linear combination scales and adds vectors. The directions you have available decide the reachable region: a line for dependent vectors, the whole plane for independent ones.",
};
