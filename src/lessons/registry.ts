import { determinantsLesson } from "./determinants";
import { eigenvectorsLesson } from "./eigenvectors";
import { karatsubaLesson } from "./karatsuba";
import { transformationsLesson } from "./transformations";
import type { LessonDefinition } from "./types";
import { vectorsLesson } from "./vectors";

/** Ordered curriculum — routing and Prev/Next derive from this list. */
export const lessons: LessonDefinition[] = [
  vectorsLesson,
  transformationsLesson,
  determinantsLesson,
  eigenvectorsLesson,
  karatsubaLesson,
];

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

export function getLessonPosition(id: string): {
  current: number;
  total: number;
} {
  const index = getLessonIndex(id);
  return {
    current: index >= 0 ? index + 1 : 0,
    total: lessons.length,
  };
}
