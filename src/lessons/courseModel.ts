/**
 * Course contract — the multi-course container model (secondary representation).
 *
 * This is the future-correct shape: `Subject -> Course -> Unit -> Lesson refs`,
 * with Karatsuba modeled as its own algorithms course rather than a section
 * inside Linear Algebra. It references lesson ids; the registry
 * ([src/lessons/registry.ts](./registry.ts)) remains the single source of truth
 * for lesson *content*.
 *
 * IMPORTANT (coexistence): during this scaffold the existing navigation data
 * ([src/lessons/curriculum.ts](./curriculum.ts) `COURSE_SECTIONS`) and the flat
 * `lessons[]` registry remain AUTHORITATIVE. The UI still reads them. This model
 * is validated against them via the compatibility adapter below and is not yet
 * wired into rendering — so visible order, numbering, Prev/Next, and Karatsuba's
 * placement are unchanged.
 */

import {
  asCourseId,
  asLessonId,
  asUnitId,
  assertUniqueIds,
  isExperimentalId,
  resolveId,
} from "../platform/identity";
import type { CourseNavItem, CourseSection } from "./curriculum";
import { getLessonById } from "./registry";

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
        // Units mirror the authoritative LA spine in curriculum.ts. Lesson refs
        // are built lessons; future nodes are spine positions not yet authored.
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
              {
                kind: "future",
                id: "elimination",
                title: "Elimination as Reversible Constraint Manipulation",
                subtitle:
                  "Replace a system with an easier one having the same solutions",
              },
              {
                kind: "future",
                id: "solution-sets",
                title: "Solution Sets & Homogeneous Systems",
                subtitle: "Particular solution + null directions; affine vs linear",
              },
            ],
          },
          {
            id: "maps-inverses-determinants",
            title: "Composition, inverses & determinants",
            items: [
              {
                kind: "future",
                id: "matrix-composition",
                title: "Matrix Composition & Inverses",
                subtitle: "Apply B then A; why order matters; undoing a map",
              },
              { kind: "lesson", lessonId: "determinants" },
            ],
          },
          {
            id: "structure",
            title: "Structure of linear maps",
            items: [
              {
                kind: "future",
                id: "subspaces-rank",
                title: "Subspaces, Column Space, Null Space, Rank",
                subtitle:
                  "Column space controls outputs; null space controls uniqueness",
              },
              {
                kind: "future",
                id: "rank-nullity",
                title: "Dimension & Rank–Nullity",
                subtitle:
                  "Input dimensions either survive or collapse into the null space",
              },
              {
                kind: "future",
                id: "change-of-basis",
                title: "Change of Basis",
                subtitle: "Same vector, different coordinates — the early payoff",
              },
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
        // Karatsuba now lives in its own course, not as a section of Linear Algebra.
        units: [
          {
            id: "algorithms",
            title: "Algorithms & complexity",
            items: [{ kind: "lesson", lessonId: "karatsuba" }],
          },
        ],
      },
    ],
  },
];

/**
 * Legacy projection order: how the model's units map onto today's flat sidebar
 * section order. This is the compatibility shim that lets the future-correct
 * model (Karatsuba as its own course) reproduce the current visible ordering
 * (algorithms section last) without the UI having to change.
 */
export const LEGACY_SECTION_ORDER: readonly string[] = [
  "foundations",
  "systems-elimination",
  "maps-inverses-determinants",
  "structure",
  "spectra-geometry-data",
  "algorithms",
];

/* --------------------------------------------------------------------------
 * Adapter helpers
 * ------------------------------------------------------------------------ */

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

/**
 * Compatibility adapter: project the model onto the legacy `CourseSection[]`
 * shape the current sidebar consumes, in today's visible order. Used to PROVE
 * equivalence; the live UI does not read this yet.
 */
export function curriculumToCourseSections(
  curriculum: readonly Subject[] = CURRICULUM,
): CourseSection[] {
  const unitsById = new Map(allUnits(curriculum).map((u) => [u.id, u]));
  const sections: CourseSection[] = [];
  for (const unitId of LEGACY_SECTION_ORDER) {
    const unit = unitsById.get(unitId);
    if (!unit) continue;
    sections.push({
      id: unit.id,
      title: unit.title,
      items: unit.items.map((item): CourseNavItem => {
        if (item.kind === "lesson") {
          return { kind: "lesson", lessonId: item.lessonId };
        }
        return item.subtitle === undefined
          ? { kind: "future", id: item.id, title: item.title }
          : { kind: "future", id: item.id, title: item.title, subtitle: item.subtitle };
      }),
    });
  }
  return sections;
}

/** The subject a lesson belongs to in the model (for future course-identity use). */
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
