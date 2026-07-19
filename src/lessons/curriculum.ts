/**
 * Course structure for the sidebar table of contents.
 * Lesson ids resolve through the existing lesson registry — no branching.
 */

export type CourseNavItem =
  | {
      kind: "lesson";
      lessonId: string;
    }
  | {
      kind: "future";
      id: string;
      title: string;
    };

export type CourseSection = {
  id: string;
  title: string;
  items: readonly CourseNavItem[];
};

export const COURSE_SECTIONS: readonly CourseSection[] = [
  {
    id: "foundations",
    title: "Foundations",
    items: [{ kind: "lesson", lessonId: "vectors" }],
  },
  {
    id: "transformations",
    title: "Transformations",
    items: [
      { kind: "lesson", lessonId: "transformations" },
      { kind: "lesson", lessonId: "determinants" },
      { kind: "lesson", lessonId: "eigenvectors" },
    ],
  },
  {
    id: "later",
    title: "Later topics",
    items: [
      { kind: "future", id: "change-of-basis", title: "Change of Basis" },
      { kind: "future", id: "svd", title: "Singular Value Decomposition" },
    ],
  },
];
