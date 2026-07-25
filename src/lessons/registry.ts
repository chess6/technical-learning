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

/**
 * The lesson CONTENT registry: every lesson that exists, in authoring order.
 *
 * This list is deliberately *not* a curriculum. Which course a lesson belongs
 * to, its number, its neighbours, and progress all live in
 * [courseModel.ts](./courseModel.ts) and are computed against the active course
 * — an index into this array conflates authoring order with the path a learner
 * walks, which stops being true as soon as there is a second course.
 */
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

const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));

export function getLessonById(id: string): LessonDefinition | undefined {
  return lessonById.get(id);
}
