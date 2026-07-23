import { chapter0Lesson } from "./chapter0";
import { determinantsLesson } from "./determinants";
import { eigenvectorsLesson } from "./eigenvectors";
import { eliminationLesson } from "./elimination";
import { karatsubaLesson } from "./karatsuba";
import { solutionSetsLesson } from "./solutionSets";
import { systemsLesson } from "./systems";
import { transformationsLesson } from "./transformations";
import type { LessonDefinition } from "./types";
import { vectorsLesson } from "./vectors";

/** Ordered curriculum — routing and Prev/Next derive from this list. */
export const lessons: LessonDefinition[] = [
  chapter0Lesson,
  vectorsLesson,
  transformationsLesson,
  systemsLesson,
  eliminationLesson,
  solutionSetsLesson,
  determinantsLesson,
  eigenvectorsLesson,
  karatsubaLesson,
];

/** Numbered content lessons (excludes intro chapters like Chapter 0). */
const contentLessons = lessons.filter((lesson) => lesson.kind !== "intro");

const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));

export function getLessonById(id: string): LessonDefinition | undefined {
  return lessonById.get(id);
}

export function getLessonIndex(id: string): number {
  return lessons.findIndex((lesson) => lesson.id === id);
}

export function getAdjacentLessons(id: string): {
  previous: LessonDefinition | null;
  next: LessonDefinition | null;
} {
  const index = getLessonIndex(id);
  if (index < 0) {
    return { previous: null, next: null };
  }
  return {
    previous: index > 0 ? lessons[index - 1]! : null,
    next: index < lessons.length - 1 ? lessons[index + 1]! : null,
  };
}

/**
 * Course-relative number for a lesson: `0` for an intro chapter (Chapter 0),
 * otherwise its 1-based position among the numbered content lessons.
 */
export function getLessonNumber(id: string): number {
  const lesson = lessonById.get(id);
  if (!lesson || lesson.kind === "intro") return 0;
  return contentLessons.findIndex((l) => l.id === id) + 1;
}

export function getLessonPosition(id: string): {
  current: number;
  total: number;
} {
  return {
    current: getLessonNumber(id),
    total: contentLessons.length,
  };
}
