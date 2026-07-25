import { Link } from "react-router-dom";
import {
  COURSES,
  courseLessonIds,
  getLessonNumber,
  type Course,
} from "../lessons/courseModel";
import { getLessonById } from "../lessons/registry";
import { plainTocLabel } from "../lessons/toc";
import { PRODUCT_NAME, PRODUCT_TAGLINE } from "../platform/product";
import { LessonPreviewIcon } from "./LessonPreviewIcon";
import "./LessonPreviewIcon.css";
import "./HomePage.css";

const FLOW_STEPS = [
  {
    title: "Watch",
    body: "A short guided animation builds the idea one step at a time.",
  },
  {
    title: "Explore",
    body: "Take the controls yourself, starting from the same example.",
  },
  {
    title: "Read & practice",
    body: "Definitions and results are stated plainly, then checked with a few exercises.",
  },
];

/** An intro chapter is named; otherwise the course itself is the invitation. */
function entryLabel(lessonId: string): string {
  const lesson = getLessonById(lessonId);
  return lesson?.kind === "intro" ? "Start with Chapter 0" : "Start the course";
}

function CourseCard({ course }: { course: Course }) {
  const lessonIds = courseLessonIds(course);
  const entryId = lessonIds[0];

  return (
    <section className="home-page__course" aria-labelledby={`course-${course.id}`}>
      <header className="home-page__course-head">
        <h3 className="home-page__course-title" id={`course-${course.id}`}>
          {course.title}
        </h3>
        {course.subtitle ? (
          <p className="home-page__course-sub">{course.subtitle}</p>
        ) : null}
        <p className="home-page__course-count">
          {lessonIds.length} {lessonIds.length === 1 ? "chapter" : "chapters"} built
        </p>
        {entryId ? (
          <p className="home-page__cta">
            <Link to={`/lesson/${entryId}`} className="btn btn--primary">
              {entryLabel(entryId)}
            </Link>
          </p>
        ) : null}
      </header>

      <ol
        className="home-page__list"
        aria-label={`${course.title} chapters, in recommended order`}
      >
        {lessonIds.map((lessonId) => {
          const lesson = getLessonById(lessonId);
          if (!lesson) return null;
          return (
            <li key={lesson.id} className="home-page__item">
              <Link to={`/lesson/${lesson.id}`} className="home-page__link">
                <span className="home-page__index" aria-hidden="true">
                  {getLessonNumber(lesson.id)}
                </span>
                {/* Fixed slot: lessons without a motif keep the titles aligned
                    down the spine instead of sliding left. */}
                <span className="home-page__motif" aria-hidden="true">
                  <LessonPreviewIcon lessonId={lesson.id} />
                </span>
                <span className="home-page__link-text">
                  <span className="home-page__lesson-title">{lesson.title}</span>
                  <span className="home-page__lesson-sub">
                    {plainTocLabel(lesson.subtitle)}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/**
 * The catalog: what this textbook currently teaches, one card per course.
 *
 * Courses come from the curriculum, so adding one is a data change — the page
 * has no linear-algebra branch in it. Chapter numbering inside each card is
 * course-relative, which is why Karatsuba reads as chapter 1 of Algorithmic
 * Thinking rather than as the ninth linear-algebra lesson.
 */
export function HomePage() {
  return (
    <div className="home-page">
      <header className="home-page__hero">
        {/* Decorative aurora field — the page is lit from where the mathematics is. */}
        <div className="home-page__aurora" aria-hidden="true" />
        <p className="home-page__eyebrow">
          {COURSES.length} {COURSES.length === 1 ? "course" : "courses"} · visual,
          interactive, checkable
        </p>
        <h1 className="home-page__title">{PRODUCT_NAME}</h1>
        <p className="home-page__lede">
          {PRODUCT_TAGLINE} Every idea is built geometrically before it is written
          symbolically, and every animation hands the controls back to you.
        </p>
        <p className="home-page__cta">
          <a className="home-page__cta-secondary" href="#courses">
            Browse the courses
          </a>
        </p>
      </header>

      <ol className="home-page__flow" aria-label="How most lessons work">
        {FLOW_STEPS.map((step, index) => (
          <li key={step.title} className="home-page__flow-step">
            <span className="home-page__flow-index" aria-hidden="true">
              {index + 1}
            </span>
            <span className="home-page__flow-title">{step.title}</span>
            <span className="home-page__flow-body">{step.body}</span>
          </li>
        ))}
      </ol>

      <h2 className="home-page__list-heading" id="courses">
        Courses
      </h2>
      <div className="home-page__catalog">
        {COURSES.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {import.meta.env.DEV && (
        <p className="home-page__dev-link">
          <Link to="/dev/mafs-demo">Dev: Mafs technical demo</Link>
          {" · "}
          <Link to="/dev/transform-spike">Dev: transform spike</Link>
        </p>
      )}
    </div>
  );
}
