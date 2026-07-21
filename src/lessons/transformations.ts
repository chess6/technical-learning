import type { LessonDefinition } from "./types";
import { MATRIX_LESSON_EXAMPLE as EX } from "./exampleData";

const A = EX.matrix;

export const transformationsLesson: LessonDefinition = {
  id: "transformations",
  title: "Matrices as Linear Transformations",
  subtitle: "How a 2×2 matrix moves the plane",
  learningObjectives: [
    "Interpret a matrix as a transformation, not only a table of numbers",
    "Recall that $\\mathbf{e}_1, \\mathbf{e}_2$ are the standard basis and every vector has unique coordinates $x, y$",
    "Derive why the two columns are the images of the basis vectors and therefore determine the whole map",
    "Recognize scale, shear, rotation, reflection, and singular collapse",
  ],
  motivatingQuestion:
    "A matrix takes every arrow in the plane and moves it somewhere new. If you only knew where the two arrows $(1,0)$ and $(0,1)$ landed, could you predict where every other arrow goes?",
  sections: [
    {
      id: "intro",
      title: "From table to map",
      body: "Recall from Lesson 1 that $\\mathbf{e}_1 = (1, 0)$ and $\\mathbf{e}_2 = (0, 1)$ are the standard basis, so every vector has unique coordinates: $\\mathbf{v} = x\\,\\mathbf{e}_1 + y\\,\\mathbf{e}_2$. A $2\\times 2$ matrix tells every vector where to go, and the cleanest way to read it is by columns: the first column is where $\\mathbf{e}_1$ lands, the second where $\\mathbf{e}_2$ lands.",
      equation: `A = \\begin{bmatrix} ${A[0][0]} & ${A[0][1]} \\\\ ${A[1][0]} & ${A[1][1]} \\end{bmatrix}`,
      observation:
        "Once you know where $\\mathbf{e}_1$ and $\\mathbf{e}_2$ go, every other vector follows by linearity.",
    },
    {
      id: "grid",
      title: "Linearity carries the grid",
      body: "Because $\\mathbf{v} = x\\,\\mathbf{e}_1 + y\\,\\mathbf{e}_2$ uniquely, linearity forces $A\\mathbf{v} = x\\,(A\\mathbf{e}_1) + y\\,(A\\mathbf{e}_2)$. So the two columns $A\\mathbf{e}_1, A\\mathbf{e}_2$ decide where every vector goes — the columns rule is a consequence of unique coordinates, not a separate fact. The whole grid deforms into a scaled, sheared lattice while lines stay straight and evenly spaced.",
      equation: "A(x\\,\\mathbf{e}_1 + y\\,\\mathbf{e}_2) = x\\,A\\mathbf{e}_1 + y\\,A\\mathbf{e}_2",
      observation:
        "The identity-to-$A$ frames you scrub are an educational visual transition, not a matrix factorization.",
      layers: [
        {
          kind: "connection",
          title: "This is Lesson 1's basis idea in action",
          body: "Lesson 1 showed every vector is a unique combination of basis vectors. Here the matrix reads those coordinates and rebuilds the output from the transformed basis. Later, change of basis lets you choose which basis to read coordinates in.",
        },
      ],
    },
  ],
  guidedSceneId: "matrix-transformations",
  explorationId: "matrix-transformation",
  exampleId: "shear-2-1",
  checkpoint: {
    prompt:
      "The matrix $A = \\begin{bmatrix} 2 & 1 \\\\ 0 & 1 \\end{bmatrix}$ has first column $(2, 0)$. Where does $\\mathbf{e}_1 = (1, 0)$ land, and why?",
    answer:
      "At $(2, 0)$: the first column of a matrix is by definition the image of $\\mathbf{e}_1$. Multiplying $A$ by $(1, 0)$ selects exactly that column.",
  },
  exercises: [
    {
      id: "e1-predict",
      type: "vector",
      prompt: `For $A = \\begin{bmatrix} ${A[0][0]} & ${A[0][1]} \\\\ ${A[1][0]} & ${A[1][1]} \\end{bmatrix}$, where does $\\mathbf{e}_1 = (1, 0)$ land? Enter the coordinates.`,
      expected: [A[0][0], A[1][0]],
      tolerance: 0.01,
      explanation:
        "$\\mathbf{e}_1$ maps to the first column of $A$. Reading the first column top-to-bottom gives its landing point.",
    },
    {
      id: "match-transform",
      type: "multiple-choice",
      prompt:
        "Which matrix sends $\\mathbf{e}_1$ to $(0, 1)$ and $\\mathbf{e}_2$ to $(-1, 0)$ — a $90^\\circ$ counterclockwise rotation?",
      choices: [
        "$\\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}$",
        "$\\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}$",
        "$\\begin{bmatrix} 2 & 0 \\\\ 0 & 2 \\end{bmatrix}$",
        "$\\begin{bmatrix} 1 & 1 \\\\ 0 & 1 \\end{bmatrix}$",
      ],
      correctChoice: 0,
      explanation:
        "Columns are the images of the basis: the first column must be $(0, 1)$ and the second $(-1, 0)$. Stacked as columns that is $\\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}$.",
    },
  ],
  keyTakeaway:
    "A matrix is a linear map fully determined by where it sends the basis vectors. Its columns are the transformed $\\mathbf{e}_1$ and $\\mathbf{e}_2$, and linearity carries every other vector along.",
};
