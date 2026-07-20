import { useEffect, useId } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { COURSE_SECTIONS } from "../../lessons/curriculum";
import { getLessonById, getLessonIndex } from "../../lessons/registry";
import "./CourseSidebar.css";

type CourseSidebarProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Persistent course table of contents. Registry-driven — no per-lesson
 * branching. Collapses to a drawer on narrow viewports.
 */
export function CourseSidebar({ open, onClose }: CourseSidebarProps) {
  const location = useLocation();
  const titleId = useId();
  const currentLessonId = location.pathname.startsWith("/lesson/")
    ? location.pathname.slice("/lesson/".length).split("/")[0]
    : undefined;
  const currentIndex =
    currentLessonId !== undefined ? getLessonIndex(currentLessonId) : -1;

  // Close drawer on route change (narrow layouts).
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  return (
    <aside
      className="course-sidebar"
      data-open={open ? "true" : "false"}
      aria-labelledby={titleId}
    >
      <div className="course-sidebar__inner">
        <p className="course-sidebar__course" id={titleId}>
          <span className="course-sidebar__course-main">Linear Algebra</span>
          <span className="course-sidebar__course-sub">Visual Learning</span>
        </p>

        <nav className="course-sidebar__nav" aria-label="Course contents">
          {COURSE_SECTIONS.map((section) => (
            <div key={section.id} className="course-sidebar__section">
              <p className="course-sidebar__section-title">{section.title}</p>
              <ul className="course-sidebar__list">
                {section.items.map((item) => {
                  if (item.kind === "future") {
                    return (
                      <li key={item.id} className="course-sidebar__item">
                        <span
                          className="course-sidebar__future"
                          title="Coming in a later milestone"
                        >
                          {item.title}
                        </span>
                      </li>
                    );
                  }

                  const lesson = getLessonById(item.lessonId);
                  if (!lesson) return null;
                  const index = getLessonIndex(lesson.id);
                  const state =
                    index < 0
                      ? "upcoming"
                      : currentIndex < 0
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
                          {index + 1}
                        </span>
                        <span className="course-sidebar__link-text">
                          {lesson.title}
                        </span>
                      </NavLink>
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
