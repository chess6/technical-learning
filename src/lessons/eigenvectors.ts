import type { LessonDefinition } from "./types";

export const eigenvectorsLesson: LessonDefinition = {
  id: "eigenvectors",
  title: "Eigenvectors and Eigenvalues",
  subtitle: "Directions that refuse to leave their line",
  learningObjectives: [
    "Observe that most vectors change direction under a linear map",
    "Identify eigenvectors as nonzero directions that stay on the same line",
    "Read eigenvalues as stretch, shrink, reverse, or collapse factors",
    "Distinguish scalar, defective, and no-real-eigenvector cases honestly",
  ],
  motivatingQuestion:
    "Are there any directions a transformation can stretch without turning?",
  sections: [
    {
      id: "intro",
      title: "Special directions",
      body: "Apply a matrix to a fan of vectors. Most tips swing off their original rays. A few stay on the same line — those are eigenvectors, scaled by an eigenvalue $\\lambda$ via $A\\mathbf{v}=\\lambda\\mathbf{v}$. The zero vector is never an eigenvector.",
      equation: "A\\mathbf{v} = \\lambda\\mathbf{v}",
      observation:
        "An eigenvalue of $-1$ reverses the arrow while keeping it on the same line.",
    },
    {
      id: "edge",
      title: "Edge cases worth naming",
      body: "A scalar matrix $A=\\lambda I$ makes every nonzero direction an eigenvector. A defective matrix can have a repeated $\\lambda$ with only one eigendirection — do not invent a second. A pure rotation has no real eigenvectors (complex eigenvalues may still exist).",
    },
  ],
  guidedSceneId: "eigenvectors-invariant-directions",
  explorationId: "eigenvectors-invariant-directions",
  exampleId: "eigen-distinct",
  checkpoint: {
    prompt:
      "If $A\\mathbf{v}$ points in the opposite direction from $\\mathbf{v}$ but stays on the same line, can $\\mathbf{v}$ still be an eigenvector?",
    answer:
      "Yes — provided $\\mathbf{v}\\neq\\mathbf{0}$. Then $A\\mathbf{v}=\\lambda\\mathbf{v}$ with $\\lambda<0$: the eigenvalue reverses direction while preserving the line.",
  },
  exercises: [
    {
      id: "eigen-identify",
      type: "multiple-choice",
      prompt:
        "For $A=\\begin{bmatrix} 3 & 1 \\\\ 0 & 2 \\end{bmatrix}$, which nonzero vector lies on an eigendirection?",
      choices: [
        "$(1, 1)$",
        "$(1, 0)$",
        "$(0, 0)$",
        "$(1, 1)$ and $(0,0)$ equally",
      ],
      correctChoice: 1,
      explanation:
        "$A(1,0)=(3,0)=3(1,0)$, so $(1,0)$ is an eigenvector with $\\lambda=3$. The zero vector is never an eigenvector.",
    },
    {
      id: "eigen-scale",
      type: "multiple-choice",
      prompt: "If $A\\mathbf{v}=(-2)\\mathbf{v}$ for a nonzero $\\mathbf{v}$, the eigenvalue…",
      choices: [
        "stretches $\\mathbf{v}$ without reversing it",
        "shrinks $\\mathbf{v}$ toward the origin without reversing",
        "reverses $\\mathbf{v}$ and stretches it by a factor of $2$",
        "means $A$ has no real eigenvectors",
      ],
      correctChoice: 2,
      explanation:
        "$\\lambda=-2$ flips direction and multiplies length by $2$.",
    },
    {
      id: "eigen-drag",
      type: "prediction",
      prompt:
        "In the explorer, drag a candidate until $A\\mathbf{v}$ lies on the same line through the origin. What have you found?",
      reveal:
        "An eigendirection — the transformed vector is a scalar multiple of the original ($A\\mathbf{v}=\\lambda\\mathbf{v}$ for some real $\\lambda$).",
    },
  ],
  keyTakeaway:
    "An eigenvector is a nonzero direction preserved by the transformation, and its eigenvalue records the signed scaling along that direction.",
};
