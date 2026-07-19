import type { LessonDefinition } from "./types";

export const eigenvectorsLesson: LessonDefinition = {
  id: "eigenvectors",
  title: "Eigenvectors and Eigenvalues",
  subtitle: "Directions that refuse to leave their line",
  learningObjectives: [
    "Observe that most vectors change direction under a linear map",
    "Identify eigenvectors as directions that stay on the same line",
    "Read eigenvalues as stretch, shrink, or reverse factors",
    "Accept that some real matrices have no real eigenvectors",
  ],
  sections: [
    {
      id: "intro",
      title: "Special directions",
      body: "Apply a matrix to a fan of vectors. Most tips swing off their original rays. A few stay on the same line — those are eigenvectors, scaled by an eigenvalue.",
      equation: "A\\mathbf{v} = \\lambda\\mathbf{v}",
      observation:
        "An eigenvalue of −1 reverses the arrow while keeping it on the same line.",
    },
    {
      id: "complex",
      title: "When nothing stays put",
      body: "A pure rotation in the plane has no real eigenvector: every nonzero vector changes direction. Numerical routines report complex eigenvalues in that case.",
    },
  ],
  guidedSceneId: "eigenvector",
  explorationId: "eigenvector",
  exampleId: "eigen-stretch",
  exercises: [
    {
      id: "eigen-drag",
      type: "prediction",
      prompt:
        "Drag a candidate vector until its image lies on the same line through the origin. What have you found?",
      reveal:
        "An eigendirection — the transformed vector is a scalar multiple of the original.",
    },
    {
      id: "eigen-scale",
      type: "multiple-choice",
      prompt: "If A v = (−2) v for a nonzero v, the eigenvalue…",
      choices: [
        "stretches v without reversing it",
        "shrinks v toward the origin without reversing",
        "reverses v and stretches it by a factor of 2",
        "means A has no real eigenvectors",
      ],
      correctChoice: 2,
      explanation:
        "λ = −2 flips direction and multiplies length by 2.",
    },
  ],
  keyTakeaway:
    "Eigenvectors are invariant directions; eigenvalues say how those directions stretch, shrink, or reverse — and some maps have none that are real.",
};
