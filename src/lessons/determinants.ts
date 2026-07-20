import type { LessonDefinition } from "./types";
import { DETERMINANT_LESSON_EXAMPLE } from "./exampleData";

const A = DETERMINANT_LESSON_EXAMPLE.matrix;

export const determinantsLesson: LessonDefinition = {
  id: "determinants",
  title: "Determinants as Signed Area Scaling",
  subtitle: "How much a transformation stretches area — and which way",
  learningObjectives: [
    "Read the determinant as the signed area scale of the unit square",
    "Recognize det = 0 as dimensional collapse",
    "Connect a negative determinant to orientation reversal",
    "Separate magnitude (how much) from sign (which orientation)",
  ],
  motivatingQuestion:
    "If a transformation stretches in one direction and compresses in another, what happens to area?",
  sections: [
    {
      id: "intro",
      title: "Area under a map",
      body: "The unit square transforms into the parallelogram spanned by $A\\mathbf{e}_1$ and $A\\mathbf{e}_2$. The absolute value $|\\det(A)|$ is that parallelogram's area; the sign of $\\det(A)$ records whether orientation was preserved.",
      equation: `\\det(A)=${A[0][0]}\\cdot${A[1][1]}-${A[0][1]}\\cdot${A[1][0]}=${A[0][0] * A[1][1] - A[0][1] * A[1][0]}`,
      observation:
        "Geometry and algebra stay synchronized: as the shape flattens, the determinant approaches zero.",
    },
    {
      id: "sign",
      title: "Sign and collapse",
      body: "Crossing through $\\det(A)=0$ collapses the parallelogram onto a line. Continuing past zero flips the orientation of the ordered basis — magnitude still measures area; sign measures handedness.",
    },
  ],
  guidedSceneId: "determinant-area-scaling",
  explorationId: "determinant-area-scaling",
  exampleId: "shear-2-1",
  checkpoint: {
    prompt: "If $\\det(A)=0$, what has happened geometrically?",
    answer:
      "The unit square has collapsed onto a line (or a point): the columns of $A$ are linearly dependent, so the parallelogram has zero area. The map is singular — it loses a dimension.",
  },
  exercises: [
    {
      id: "det-compute",
      type: "numeric",
      prompt:
        "Compute $\\det\\begin{bmatrix} 2 & 1 \\\\ 0 & 1 \\end{bmatrix}$. Enter the number.",
      expected: 2,
      tolerance: 1e-9,
      explanation:
        "det = $2\\cdot 1 - 1\\cdot 0 = 2$. The parallelogram spanned by $(2,0)$ and $(1,1)$ has area $2$.",
    },
    {
      id: "det-geometry",
      type: "multiple-choice",
      prompt: "Geometrically, $|\\det(A)|$ measures…",
      choices: [
        "the angle between the basis vectors only",
        "how much the transformation scales area",
        "whether $A$ has real eigenvalues",
        "the length of $A\\mathbf{e}_1$ alone",
      ],
      correctChoice: 1,
      explanation:
        "The absolute value of the determinant is the area of the image of the unit square — the area scale factor.",
    },
    {
      id: "det-zero",
      type: "numeric",
      prompt:
        "What is $\\det\\begin{bmatrix} 2 & 4 \\\\ 1 & 2 \\end{bmatrix}$? Adjust the explorer until you see why the answer matters geometrically.",
      expected: 0,
      tolerance: 1e-9,
      explanation:
        "The columns are parallel, so the parallelogram has zero area and the map collapses onto a line.",
    },
    {
      id: "orientation",
      type: "multiple-choice",
      prompt: "A transformation with $\\det(A) < 0$ does which of the following?",
      choices: [
        "Preserves orientation and expands area",
        "Reverses orientation",
        "Always collapses onto a point",
        "Leaves every vector unchanged",
      ],
      correctChoice: 1,
      explanation:
        "Negative determinant means the ordered basis flipped handedness. Area is still $|\\det(A)|$; the sign records orientation.",
    },
  ],
  keyTakeaway:
    "The determinant tells how a linear transformation scales oriented area: its magnitude gives the area factor, zero means collapse, and its sign records orientation.",
};
