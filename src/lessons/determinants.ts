import type { LessonDefinition } from "./types";

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
  sections: [
    {
      id: "intro",
      title: "Area under a map",
      body: "The unit square transforms into a parallelogram. The absolute value of the determinant is the area of that parallelogram; the sign records whether orientation was preserved.",
      equation: "\\det(A) = ad - bc",
      observation:
        "Geometry and algebra stay synchronized: as the shape flattens, the determinant approaches zero.",
    },
    {
      id: "sign",
      title: "Sign and collapse",
      body: "Crossing through det = 0 collapses the parallelogram onto a line. Continuing past zero flips the orientation of the basis.",
    },
  ],
  guidedSceneId: "determinant",
  explorationId: "determinant",
  exampleId: "det-positive",
  exercises: [
    {
      id: "det-zero",
      type: "numeric",
      prompt:
        "What is det([[2, 4], [1, 2]])? Adjust until you see why the answer matters geometrically.",
      expected: 0,
      tolerance: 1e-9,
      explanation:
        "The columns are parallel, so the parallelogram has zero area and the map collapses onto a line.",
    },
    {
      id: "orientation",
      type: "multiple-choice",
      prompt:
        "A transformation with det(A) < 0 does which of the following?",
      choices: [
        "Preserves orientation and expands area",
        "Reverses orientation",
        "Always collapses onto a point",
        "Leaves every vector unchanged",
      ],
      correctChoice: 1,
      explanation:
        "Negative determinant means the ordered basis flipped handedness.",
    },
  ],
  keyTakeaway:
    "The determinant is signed area scale: magnitude measures stretch, sign measures orientation, and zero means collapse.",
};
