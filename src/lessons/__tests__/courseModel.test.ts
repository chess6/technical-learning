import { describe, expect, it } from "vitest";
import {
  CURRICULUM,
  COURSES,
  activeCourse,
  courseForLesson,
  courseLessonIds,
  courseUnits,
  curriculumLessonIds,
  getAdjacentLessons,
  getLessonNumber,
  getLessonPosition,
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

describe("the curriculum covers the registry", () => {
  it("places every built lesson in exactly one course", () => {
    const placed = curriculumLessonIds();
    expect(new Set(placed)).toEqual(new Set(lessons.map((l) => l.id)));
    expect(placed).toHaveLength(lessons.length);
  });
});

describe("navigation is course-relative, not registry-positional", () => {
  const LINEAR_ALGEBRA = COURSES.find((c) => c.id === "linear-algebra")!;
  const ALGORITHMS = COURSES.find((c) => c.id === "algorithmic-thinking")!;

  it("derives the active course from lesson membership", () => {
    expect(activeCourse("vectors").id).toBe("linear-algebra");
    expect(activeCourse("karatsuba").id).toBe("algorithmic-thinking");
    // Off a lesson (the home catalog, a dev route) the default course is shown.
    expect(activeCourse().id).toBe(COURSES[0]!.id);
    expect(activeCourse("not-a-lesson").id).toBe(COURSES[0]!.id);
    expect(courseForLesson("not-a-lesson")).toBeUndefined();
  });

  it("restarts numbering in each course", () => {
    // Chapter 0 is an intro chapter and is excluded from the numbered count.
    expect(getLessonNumber("why-linear-algebra")).toBe(0);
    expect(getLessonNumber("vectors")).toBe(1);
    expect(getLessonNumber("eigenvectors")).toBe(7);
    // Karatsuba is chapter 1 of ITS course, not the ninth linear-algebra lesson.
    expect(getLessonNumber("karatsuba")).toBe(1);
  });

  it("reports progress against the active course, not the whole registry", () => {
    const laTotal = courseLessonIds(LINEAR_ALGEBRA).filter(
      (id) => getLessonById(id)!.kind !== "intro",
    ).length;
    expect(getLessonPosition("vectors")).toEqual({ current: 1, total: laTotal });
    expect(getLessonPosition("karatsuba")).toEqual({ current: 1, total: 1 });
    expect(getLessonPosition("karatsuba").total).toBeLessThan(lessons.length);
  });

  it("never links across a course boundary", () => {
    // The regression this whole model exists to prevent: Karatsuba is not the
    // sequel to eigenvectors, it just used to be next in one global array.
    const last = courseLessonIds(LINEAR_ALGEBRA).at(-1)!;
    expect(last).toBe("eigenvectors");
    expect(getAdjacentLessons("eigenvectors").next).toBeNull();
    expect(getAdjacentLessons("eigenvectors").previous?.id).toBe("determinants");

    expect(courseLessonIds(ALGORITHMS)).toEqual(["karatsuba"]);
    expect(getAdjacentLessons("karatsuba")).toEqual({
      previous: null,
      next: null,
    });
  });

  it("walks a course path in declared unit order", () => {
    expect(courseLessonIds(LINEAR_ALGEBRA)).toEqual([
      "why-linear-algebra",
      "vectors",
      "transformations",
      "systems",
      "elimination",
      "solution-sets",
      "determinants",
      "eigenvectors",
    ]);
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
