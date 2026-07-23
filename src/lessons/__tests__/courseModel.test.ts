import { describe, expect, it } from "vitest";
import { COURSE_SECTIONS } from "../curriculum";
import {
  CURRICULUM,
  curriculumLessonIds,
  curriculumToCourseSections,
  courseUnits,
  subjectForLesson,
  validateCurriculum,
  type Course,
} from "../courseModel";
import { getLessonById, lessons } from "../registry";

describe("curriculum model validity", () => {
  it("passes syntax, uniqueness, and referential-integrity validation", () => {
    expect(() => validateCurriculum()).not.toThrow();
  });

  it("resolves every referenced published lesson id to real content", () => {
    for (const id of curriculumLessonIds()) {
      expect(getLessonById(id), `lesson ${id} resolves`).toBeDefined();
    }
  });
});

describe("compatibility adapter reproduces current navigation (semantic equivalence)", () => {
  it("flattened lesson order equals the authoritative registry order", () => {
    // This is the ordering that governs numbering, Prev/Next, and the home list.
    expect(curriculumLessonIds()).toEqual(lessons.map((l) => l.id));
  });

  it("projects onto the legacy CourseSection[] shape identically to COURSE_SECTIONS", () => {
    // Semantic equivalence asserted structurally: same sections, titles, and items.
    expect(curriculumToCourseSections()).toEqual(COURSE_SECTIONS);
  });

  it("covers exactly the same set of lessons as the current sidebar", () => {
    const fromSections = new Set(
      COURSE_SECTIONS.flatMap((s) =>
        s.items.filter((i) => i.kind === "lesson").map((i) => i.lessonId),
      ),
    );
    expect(new Set(curriculumLessonIds())).toEqual(fromSections);
  });
});

describe("linear-algebra course spine (Chapter 0 + Lessons 1–14)", () => {
  // Authoritative sequence — see docs/courses/linear-algebra/course-spine.md. Locks the
  // full spine (built lessons + ordered `future` nodes) so a stray edit cannot
  // silently drop or reorder a spine position.
  const SPINE: readonly (
    | { built: string }
    | { future: string }
  )[] = [
    { built: "why-linear-algebra" }, // Ch 0
    { built: "vectors" }, // L1
    { built: "transformations" }, // L2
    { built: "systems" }, // L3
    { built: "elimination" }, // L4
    { built: "solution-sets" }, // L5
    { future: "matrix-composition" }, // L6
    { built: "determinants" }, // L7
    { future: "subspaces-rank" }, // L8
    { future: "rank-nullity" }, // L9
    { future: "change-of-basis" }, // L10
    { built: "eigenvectors" }, // L11
    { future: "orthogonality" }, // L12
    { future: "least-squares" }, // L13
    { future: "svd" }, // L14
  ];

  it("declares the full spine in order across the linear-algebra course", () => {
    const laCourse = CURRICULUM.find((s) => s.id === "mathematics")!.courses.find(
      (c) => c.id === "linear-algebra",
    )!;
    const items = courseUnits(laCourse).flatMap((u) => u.items);
    const actual = items.map((item) =>
      item.kind === "lesson" ? { built: item.lessonId } : { future: item.id },
    );
    expect(actual).toEqual(SPINE);
  });

  it("keeps every future spine node a valid, unbuilt id", () => {
    for (const node of SPINE) {
      if ("future" in node) {
        // A future node must not accidentally shadow a built lesson id.
        expect(getLessonById(node.future)).toBeUndefined();
      }
    }
  });
});

describe("Karatsuba is modeled as its own algorithms course", () => {
  it("belongs to the algorithms subject, not the linear-algebra course", () => {
    const subject = subjectForLesson("karatsuba");
    expect(subject?.id).toBe("algorithms");
    const laSubject = subjectForLesson("vectors");
    expect(laSubject?.id).toBe("mathematics");
    // The whole point: Karatsuba is no longer nested inside Linear Algebra.
    expect(subject?.id).not.toBe(laSubject?.id);
  });
});

describe("unitless-course convenience", () => {
  it("treats a course's direct lessons as a single implicit default unit", () => {
    const course: Course = {
      id: "mini-course",
      title: "Mini Course",
      lessons: [{ kind: "lesson", lessonId: "vectors" }],
    };
    const units = courseUnits(course);
    expect(units).toHaveLength(1);
    expect(units[0]!.id).toBe("mini-course");
    expect(units[0]!.items).toEqual([{ kind: "lesson", lessonId: "vectors" }]);
  });
});

describe("curriculum stays a reference, not a content owner", () => {
  it("does not duplicate lesson content — only ids", () => {
    // Every lesson item is a bare id reference; no LessonDefinition fields leak in.
    for (const subject of CURRICULUM) {
      for (const course of subject.courses) {
        for (const unit of courseUnits(course)) {
          for (const item of unit.items) {
            if (item.kind === "lesson") {
              expect(Object.keys(item).sort()).toEqual(["kind", "lessonId"]);
            }
          }
        }
      }
    }
  });
});
