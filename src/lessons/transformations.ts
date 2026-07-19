import type { LessonDefinition } from "./types";

export const transformationsLesson: LessonDefinition = {
  id: "transformations",
  title: "Matrices as Linear Transformations",
  subtitle: "How a 2×2 matrix moves the plane",
  learningObjectives: [
    "Interpret a matrix as a transformation, not only a table of numbers",
    "Read matrix columns as the images of the basis vectors",
    "See how the transformed basis determines the whole grid",
    "Track an arbitrary vector under the same map",
  ],
  sections: [
    {
      id: "intro",
      title: "From table to map",
      body: "A 2×2 matrix tells every vector where to go. The cleanest way to read it is through its columns: they are the landing places of the standard basis vectors.",
      equation:
        "A = \\begin{bmatrix} 2 & 1 \\\\ 0 & 1 \\end{bmatrix}",
      observation:
        "Once you know where e₁ and e₂ go, every other vector follows by linearity.",
    },
    {
      id: "grid",
      title: "The transformed grid",
      body: "As the basis vectors move, the coordinate grid deforms with them into a sheared and scaled lattice. Sample vectors ride along the same transformation.",
      observation:
        "The intermediate frames you will scrub are educational interpolations, not a special matrix factorization.",
    },
  ],
  guidedSceneId: "matrix-transformation",
  explorationId: "matrix-transformation",
  exampleId: "shear-2-1",
  exercises: [
    {
      id: "e1-predict",
      type: "vector",
      prompt:
        "For A = [[2, 1], [0, 1]], where does e₁ = (1, 0) land?",
      expected: [2, 0],
      tolerance: 0.01,
      explanation: "The first column of A is the image of e₁.",
    },
    {
      id: "match-transform",
      type: "multiple-choice",
      prompt:
        "Which matrix sends e₁ to (0, 1) and e₂ to (−1, 0)?",
      choices: [
        "[[0, −1], [1, 0]]",
        "[[1, 0], [0, 1]]",
        "[[2, 0], [0, 2]]",
        "[[1, 1], [0, 1]]",
      ],
      correctChoice: 0,
      explanation:
        "Columns are the images of the basis: first column (0, 1), second (−1, 0).",
    },
  ],
  keyTakeaway:
    "A matrix is a linear map. Its columns are the transformed basis, and those images determine every other vector.",
};
