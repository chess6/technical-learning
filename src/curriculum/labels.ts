/**
 * Display-name resolution for curriculum edge endpoints.
 *
 * Deliberately conservative: a lesson id only resolves to a title if it is
 * either a built lesson (`registry.ts`) or an explicitly-authored `future`
 * node (`courseModel.ts`) — matching `FutureLessonRef`'s existing convention
 * that a future title is authored, never guessed from the id. An id that
 * resolves to neither returns `undefined`, and every consumer of this module
 * omits that edge rather than fabricating a label.
 */

import { getFutureLessonById } from "../lessons/courseModel";
import { getLessonById } from "../lessons/registry";
import { getConcept } from "./concepts";

export type LessonLabel = { title: string; href?: string };

/** A lesson's display title and, if built, its route — or `undefined` if unscheduled. */
export function lessonLabel(id: string): LessonLabel | undefined {
  const built = getLessonById(id);
  if (built) return { title: built.title, href: `/lesson/${built.id}` };
  const future = getFutureLessonById(id);
  if (future) return { title: future.title };
  return undefined;
}

/** A concept's display title, or `undefined` if the id isn't in the catalog. */
export function conceptLabel(id: string): string | undefined {
  return getConcept(id)?.title;
}
