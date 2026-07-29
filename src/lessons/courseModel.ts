/**
 * The curriculum — `Subject -> Course -> Unit -> Lesson refs`, and the
 * course-relative navigation derived from it.
 *
 * This is the **minimal near-term schema** from
 * `docs/courses/multi-domain-architecture.md` §2, and it is now AUTHORITATIVE:
 * the sidebar, the home catalog, lesson numbering, progress, and Prev/Next all
 * read it. Deliberately NOT built (§2 "deliberately deferred", §6): prerequisite
 * edges, cross-domain connections, learning paths, per-learner progress,
 * namespaced routing, or any backend.
 *
 * The tree holds **references**, never content: the registry
 * ([src/lessons/registry.ts](./registry.ts)) remains the single source of truth
 * for what a lesson *is*, and no lesson file knows which course contains it.
 * Because leaves are references, one lesson id may appear in more than one
 * module — that is how shared lessons become possible later, for free.
 *
 * Why this replaced a single flat `lessons[]` index: with a second course, an
 * array index conflates authoring order, the path a learner walks, and global
 * progress. "Lesson 9 of 9" and "Next → Karatsuba after Eigenvectors" are both
 * wrong the moment Karatsuba is not the sequel to eigenvectors. Everything
 * below is therefore computed against the ACTIVE COURSE, not the registry.
 */

import {
  asCourseId,
  asLessonId,
  asUnitId,
  assertUniqueIds,
  isExperimentalId,
  resolveId,
} from "../platform/identity";
import { getLessonById } from "./registry";
import type { LessonDefinition } from "./types";

/* --------------------------------------------------------------------------
 * Model types
 * ------------------------------------------------------------------------ */

export type LessonRef = { kind: "lesson"; lessonId: string };

/** A not-yet-built lesson: a first-class node, not a bare string stub. */
export type FutureLessonRef = {
  kind: "future";
  id: string;
  title: string;
  subtitle?: string;
};

export type UnitItem = LessonRef | FutureLessonRef;

export type Unit = {
  id: string;
  title: string;
  items: readonly UnitItem[];
};

export type Course = {
  id: string;
  title: string;
  subtitle?: string;
  /** Ordered units. Optional: see `lessons` for the unitless-course convenience. */
  units?: readonly Unit[];
  /**
   * Unitless-course convenience: a course may list lessons directly, with no
   * explicit unit. The adapter treats these as a single implicit default unit
   * whose id/title default to the course's. Units are optional structure.
   */
  lessons?: readonly UnitItem[];
};

export type Subject = {
  id: string;
  title: string;
  courses: readonly Course[];
};

/* --------------------------------------------------------------------------
 * The curriculum (secondary representation)
 * ------------------------------------------------------------------------ */

export const CURRICULUM: readonly Subject[] = [
  {
    id: "mathematics",
    title: "Mathematics",
    courses: [
      {
        id: "linear-algebra",
        title: "Linear Algebra",
        subtitle: "Visual Learning",
        // Units mirror the authoritative LA spine in
        // docs/courses/linear-algebra/course-spine.md. Lesson refs are built
        // lessons; future nodes are spine positions not yet authored.
        units: [
          {
            id: "foundations",
            title: "Foundations",
            items: [
              { kind: "lesson", lessonId: "why-linear-algebra" },
              { kind: "lesson", lessonId: "vectors" },
              { kind: "lesson", lessonId: "transformations" },
            ],
          },
          {
            id: "systems-elimination",
            title: "Systems & elimination",
            items: [
              { kind: "lesson", lessonId: "systems" },
              { kind: "lesson", lessonId: "elimination" },
              { kind: "lesson", lessonId: "solution-sets" },
            ],
          },
          {
            id: "maps-inverses-determinants",
            title: "Composition, inverses & determinants",
            items: [
              { kind: "lesson", lessonId: "matrix-composition" },
              { kind: "lesson", lessonId: "determinants" },
            ],
          },
          {
            id: "structure",
            title: "Structure of linear maps",
            items: [
              { kind: "lesson", lessonId: "subspaces-rank" },
              { kind: "lesson", lessonId: "rank-nullity" },
              { kind: "lesson", lessonId: "change-of-basis" },
            ],
          },
          {
            id: "spectra-geometry-data",
            title: "Spectra, geometry & data",
            items: [
              { kind: "lesson", lessonId: "eigenvectors" },
              {
                kind: "future",
                id: "orthogonality",
                title: "Orthogonality & Projections",
                subtitle: "Dot product, complements, projection, Gram–Schmidt",
              },
              {
                kind: "future",
                id: "least-squares",
                title: "Least Squares",
                subtitle: "Best fit when the system has no exact solution",
              },
              {
                kind: "future",
                id: "svd",
                title: "Singular Value Decomposition",
                subtitle:
                  "Rotate, scale, rotate — rank, geometry, and data compression",
              },
            ],
          },
        ],
      },
      {
        id: "applied-mathematics",
        title: "Applied Mathematics",
        subtitle: "Change, fields, and transforms",
        // Units mirror the authoritative spine in
        // docs/courses/applied-mathematics/course-spine.md, where **one unit =
        // one module directory = one implementation package**. Only
        // `calculus-foundations` (Package A) is planned in Mode B; the later
        // units are added as their packages enter Mode B, so this list grows
        // with the roadmap rather than declaring 39 stubs up front.
        units: [
          {
            id: "calculus-foundations",
            title: "The two operations, and the theorem that binds them",
            items: [
              {
                kind: "future",
                id: "limits-continuity",
                title: "What \u201Capproaches\u201D Means",
                subtitle:
                  "A limit is a value the neighbours force \u2014 the point never votes",
              },
              {
                kind: "future",
                id: "derivative-local-linearity",
                title: "The Derivative as Local Linearity",
                subtitle:
                  "Zoom far enough and a smooth curve is a line; the derivative is that line",
              },
              {
                kind: "future",
                id: "integral-accumulation",
                title: "The Integral as Accumulation",
                subtitle:
                  "Not an area \u2014 the total of a rate, with the units to prove it",
              },
              {
                kind: "future",
                id: "fundamental-theorem",
                title: "The Fundamental Theorem of Calculus",
                subtitle:
                  "Everything in the middle cancels; only the two ends survive",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "algorithms",
    title: "Algorithms & Complexity",
    courses: [
      {
        id: "algorithmic-thinking",
        title: "Algorithmic Thinking",
        subtitle: "Divide, conquer, analyze",
        // Karatsuba lives in its own course, not as a section of Linear Algebra.
        units: [
          {
            id: "divide-and-conquer",
            title: "Divide & conquer",
            items: [{ kind: "lesson", lessonId: "karatsuba" }],
          },
          {
            id: "data-structures",
            title: "Data structures",
            items: [
              { kind: "lesson", lessonId: "binary-search-trees" },
              { kind: "lesson", lessonId: "red-black-trees" },
            ],
          },
        ],
      },
    ],
  },
];

/* --------------------------------------------------------------------------
 * Reading the tree
 * ------------------------------------------------------------------------ */

/** Every course, in declaration order. The home catalog renders exactly this. */
export const COURSES: readonly Course[] = CURRICULUM.flatMap(
  (subject) => subject.courses,
);

/** The course shown when no lesson names one (the home page, a dev route). */
export const DEFAULT_COURSE: Course = COURSES[0]!;

/** Normalize a course to its units, honoring the unitless-course convenience. */
export function courseUnits(course: Course): readonly Unit[] {
  if (course.units && course.units.length > 0) return course.units;
  if (course.lessons && course.lessons.length > 0) {
    return [{ id: course.id, title: course.title, items: course.lessons }];
  }
  return [];
}

function allUnits(curriculum: readonly Subject[]): Unit[] {
  return curriculum.flatMap((subject) =>
    subject.courses.flatMap((course) => courseUnits(course)),
  );
}

/**
 * Ordered published lesson ids in curriculum declaration order. This is the
 * ordering that governs lesson numbering, Prev/Next, and the home-page list — it
 * must equal the registry's `lessons` order for coexistence to be invisible.
 */
export function curriculumLessonIds(
  curriculum: readonly Subject[] = CURRICULUM,
): string[] {
  return allUnits(curriculum)
    .flatMap((unit) => unit.items)
    .filter((item): item is LessonRef => item.kind === "lesson")
    .map((item) => item.lessonId);
}

/* --------------------------------------------------------------------------
 * Course-relative navigation
 *
 * Every helper here answers its question about the ACTIVE COURSE — the course
 * that contains the lesson being read. Nothing is positional against the global
 * registry, so a second course cannot make "lesson N of M", Prev/Next, or the
 * sidebar's prior/current/upcoming states lie.
 * ------------------------------------------------------------------------ */

/** Ordered built-lesson ids of a course: the path a learner actually walks. */
export function courseLessonIds(course: Course): string[] {
  return courseUnits(course)
    .flatMap((unit) => unit.items)
    .filter((item): item is LessonRef => item.kind === "lesson")
    .map((item) => item.lessonId);
}

/** The course a lesson belongs to, or `undefined` for an unplaced lesson id. */
export function courseForLesson(
  lessonId: string,
  curriculum: readonly Subject[] = CURRICULUM,
): Course | undefined {
  for (const subject of curriculum) {
    for (const course of subject.courses) {
      if (courseLessonIds(course).includes(lessonId)) return course;
    }
  }
  return undefined;
}

/**
 * The course whose frame the UI should show. Derived from lesson membership —
 * routes stay `/lesson/:lessonId`, so a lesson carries its own context and no
 * URL change is needed (multi-domain-architecture §2, "determining the active
 * course near-term").
 */
export function activeCourse(lessonId?: string): Course {
  if (lessonId === undefined) return DEFAULT_COURSE;
  return courseForLesson(lessonId) ?? DEFAULT_COURSE;
}

/** Position of a lesson within its own course path, or -1 when unplaced. */
export function getLessonIndex(lessonId: string): number {
  const course = courseForLesson(lessonId);
  if (!course) return -1;
  return courseLessonIds(course).indexOf(lessonId);
}

/** Built lessons of a course that carry a number (intro chapters do not). */
function contentLessonIds(course: Course): string[] {
  return courseLessonIds(course).filter(
    (id) => getLessonById(id)?.kind !== "intro",
  );
}

/**
 * Course-relative number: `0` for an intro chapter (Chapter 0), otherwise the
 * 1-based position among that course's numbered lessons. Numbering restarts per
 * course — Karatsuba is lesson 1 of Algorithmic Thinking, not lesson 9 of
 * everything.
 */
export function getLessonNumber(lessonId: string): number {
  const lesson = getLessonById(lessonId);
  if (!lesson || lesson.kind === "intro") return 0;
  const course = courseForLesson(lessonId);
  if (!course) return 0;
  return contentLessonIds(course).indexOf(lessonId) + 1;
}

/** Progress within the active course, never against the whole registry. */
export function getLessonPosition(lessonId: string): {
  current: number;
  total: number;
} {
  const course = courseForLesson(lessonId);
  return {
    current: getLessonNumber(lessonId),
    total: course ? contentLessonIds(course).length : 0,
  };
}

/**
 * Prev/Next within the active course. A course's last lesson has no `next` —
 * the next course is a different subject, not the sequel to this one.
 */
export function getAdjacentLessons(lessonId: string): {
  previous: LessonDefinition | null;
  next: LessonDefinition | null;
} {
  const course = courseForLesson(lessonId);
  if (!course) return { previous: null, next: null };
  const path = courseLessonIds(course);
  const index = path.indexOf(lessonId);
  const at = (i: number) =>
    i >= 0 && i < path.length ? (getLessonById(path[i]!) ?? null) : null;
  return { previous: at(index - 1), next: at(index + 1) };
}

/** The subject a lesson belongs to in the model. */
export function subjectForLesson(
  lessonId: string,
  curriculum: readonly Subject[] = CURRICULUM,
): Subject | undefined {
  return curriculum.find((subject) =>
    subject.courses.some((course) =>
      courseUnits(course).some((unit) =>
        unit.items.some(
          (item) => item.kind === "lesson" && item.lessonId === lessonId,
        ),
      ),
    ),
  );
}

/* --------------------------------------------------------------------------
 * Validation (syntax, uniqueness, referential integrity, alias resolution)
 *
 * Throws on the first violation. Called by tests; safe to call at startup.
 * ------------------------------------------------------------------------ */

export function validateCurriculum(
  curriculum: readonly Subject[] = CURRICULUM,
): void {
  const courseIds: string[] = [];
  const unitIds: string[] = [];
  const lessonRefs: string[] = [];

  for (const subject of curriculum) {
    asCourseId(subject.id); // subjects share the id-syntax rule
    for (const course of subject.courses) {
      courseIds.push(asCourseId(course.id));
      for (const unit of courseUnits(course)) {
        unitIds.push(asUnitId(unit.id));
        for (const item of unit.items) {
          if (item.kind === "lesson") {
            // Syntax check + canonicalization via alias map.
            const canonical = resolveId("lesson", asLessonId(item.lessonId));
            lessonRefs.push(canonical);
            // Referential integrity: non-experimental refs must resolve to real content.
            if (!isExperimentalId(canonical) && !getLessonById(canonical)) {
              throw new Error(
                `Curriculum references unknown lesson id "${item.lessonId}".`,
              );
            }
          } else {
            asLessonId(item.id); // future nodes still get a valid id
          }
        }
      }
    }
  }

  assertUniqueIds("course", courseIds);
  assertUniqueIds("unit", unitIds);
  assertUniqueIds("lesson", lessonRefs);
}
