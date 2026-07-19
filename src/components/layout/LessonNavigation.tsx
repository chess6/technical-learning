import { Link } from "react-router-dom";
import type { LessonDefinition } from "../../lessons/types";
import "./LessonNavigation.css";

type LessonNavigationProps = {
  previous: LessonDefinition | null;
  next: LessonDefinition | null;
  onReset?: () => void;
};

export function LessonNavigation({
  previous,
  next,
  onReset,
}: LessonNavigationProps) {
  return (
    <nav className="lesson-nav" aria-label="Lesson navigation">
      {previous ? (
        <Link
          to={`/lesson/${previous.id}`}
          className="btn btn--ghost lesson-nav__link"
        >
          ← Previous
          <span className="lesson-nav__title">{previous.title}</span>
        </Link>
      ) : (
        <span className="lesson-nav__spacer" />
      )}

      <button
        type="button"
        className="btn"
        onClick={onReset}
        disabled={!onReset}
      >
        Reset
      </button>

      {next ? (
        <Link
          to={`/lesson/${next.id}`}
          className="btn btn--primary lesson-nav__link lesson-nav__link--next"
        >
          Next →
          <span className="lesson-nav__title">{next.title}</span>
        </Link>
      ) : (
        <span className="lesson-nav__spacer" />
      )}
    </nav>
  );
}
