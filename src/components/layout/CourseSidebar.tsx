import { useEffect, useId } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  activeCourse,
  courseUnits,
  getLessonIndex,
  getLessonNumber,
} from "../../lessons/courseModel";
import { getLessonById } from "../../lessons/registry";
import { getModuleSet } from "../../lessons/moduleSets";
import {
  flattenLessonToc,
  getLessonTocTree,
  type LessonTocItem,
} from "../../lessons/toc";
import "./CourseSidebar.css";

type CourseSidebarProps = {
  open: boolean;
  onClose: () => void;
};

function SidebarSublist({ items }: { items: readonly LessonTocItem[] }) {
  return (
    <ol className="course-sidebar__sublist">
      {items.map((item) => (
        <li key={item.id} className="course-sidebar__subitem">
          <a className="course-sidebar__sublink" href={`#${item.id}`}>
            {item.label}
          </a>
          {item.children && item.children.length > 0 ? (
            <SidebarSublist items={item.children} />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/**
 * Table of contents for the course the learner is currently in.
 *
 * Course identity and spine are read from the curriculum, not hardcoded: the
 * active course is derived from which course contains the current lesson, so
 * Karatsuba shows the Algorithms & Complexity spine rather than the linear
 * algebra one. Off a lesson (the home catalog, a dev route) the default course
 * is shown. Collapses to a drawer on narrow viewports; the current lesson
 * expands to show that lesson's on-page TOC as a nested sublist.
 */
export function CourseSidebar({ open, onClose }: CourseSidebarProps) {
  const location = useLocation();
  const titleId = useId();
  const currentLessonId = location.pathname.startsWith("/lesson/")
    ? location.pathname.slice("/lesson/".length).split("/")[0]
    : undefined;
  const course = activeCourse(currentLessonId);
  const currentIndex =
    currentLessonId !== undefined ? getLessonIndex(currentLessonId) : -1;
  const currentLesson =
    currentLessonId !== undefined ? getLessonById(currentLessonId) : undefined;
  const currentToc =
    currentLesson !== undefined ? getLessonTocTree(currentLesson) : [];
  const showCurrentSublist = flattenLessonToc(currentToc).length >= 3;

  // Close drawer on route change (narrow layouts).
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  return (
    <aside
      className="course-sidebar"
      data-open={open ? "true" : "false"}
      data-course={course.id}
      aria-labelledby={titleId}
    >
      <div className="course-sidebar__inner">
        <p className="course-sidebar__course" id={titleId}>
          <span className="course-sidebar__course-main">{course.title}</span>
          {course.subtitle ? (
            <span className="course-sidebar__course-sub">{course.subtitle}</span>
          ) : null}
        </p>

        <nav className="course-sidebar__nav" aria-label={`${course.title} contents`}>
          {courseUnits(course).map((unit) => (
            <div key={unit.id} className="course-sidebar__section">
              <p className="course-sidebar__section-title">{unit.title}</p>
              <ul className="course-sidebar__list">
                {unit.items.map((item) => {
                  if (item.kind === "future") {
                    return (
                      <li key={item.id} className="course-sidebar__item">
                        <span
                          className="course-sidebar__future"
                          title="Coming in a later milestone"
                        >
                          <span className="course-sidebar__future-text">
                            <span className="course-sidebar__future-title">
                              {item.title}
                            </span>
                            {item.subtitle ? (
                              <span className="course-sidebar__future-sub">
                                {item.subtitle}
                              </span>
                            ) : null}
                          </span>
                        </span>
                      </li>
                    );
                  }

                  if (item.kind === "workshop" || item.kind === "assessment") {
                    const set = getModuleSet(item.setId);
                    if (!set) return null;
                    return (
                      <li key={item.setId} className="course-sidebar__item">
                        <NavLink
                          to={`/set/${item.setId}`}
                          className="course-sidebar__link"
                        >
                          <span
                            className="course-sidebar__kind-badge"
                            data-kind={item.kind}
                            aria-hidden="true"
                          >
                            {item.kind === "workshop" ? "W" : "A"}
                          </span>
                          <span className="course-sidebar__link-text">
                            {set.title}
                            <span className="course-sidebar__beta-tag">
                              {" "}
                              (beta)
                            </span>
                          </span>
                        </NavLink>
                      </li>
                    );
                  }

                  const lesson = getLessonById(item.lessonId);
                  if (!lesson) return null;
                  // Numbering and prior/current/upcoming are relative to THIS
                  // course's path, so each course counts from its own start.
                  const index = getLessonIndex(lesson.id);
                  const badge = String(getLessonNumber(lesson.id));
                  const state =
                    index < 0 || currentIndex < 0
                      ? "upcoming"
                      : index < currentIndex
                        ? "prior"
                        : index === currentIndex
                          ? "current"
                          : "upcoming";

                  return (
                    <li key={lesson.id} className="course-sidebar__item">
                      <NavLink
                        to={`/lesson/${lesson.id}`}
                        className="course-sidebar__link"
                        data-state={state}
                        aria-current={
                          state === "current" ? "page" : undefined
                        }
                      >
                        <span className="course-sidebar__num" aria-hidden="true">
                          {badge}
                        </span>
                        <span className="course-sidebar__link-text">
                          {lesson.title}
                        </span>
                      </NavLink>
                      {state === "current" && showCurrentSublist ? (
                        <SidebarSublist items={currentToc} />
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
