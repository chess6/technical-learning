import { Link, Outlet } from "react-router-dom";
import { lessons } from "../../lessons/registry";
import "./AppShell.css";

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <Link to="/" className="app-shell__brand">
          Linear Algebra
          <span className="app-shell__brand-sub">Visual Learning</span>
        </Link>
        <nav className="app-shell__nav" aria-label="Lessons">
          {lessons.map((lesson, index) => (
            <Link
              key={lesson.id}
              to={`/lesson/${lesson.id}`}
              className="app-shell__nav-link"
            >
              <span className="app-shell__nav-index">{index + 1}</span>
              {lesson.title}
            </Link>
          ))}
        </nav>
      </header>
      <main className="app-shell__main">
        <Outlet />
      </main>
    </div>
  );
}
