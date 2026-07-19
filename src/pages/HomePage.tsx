import { Link } from "react-router-dom";
import { lessons } from "../lessons/registry";
import "./HomePage.css";

export function HomePage() {
  return (
    <div className="home-page">
      <header className="home-page__hero">
        <h1 className="home-page__title">Linear Algebra</h1>
        <p className="home-page__lede">
          A visual proof of concept: geometric intuition first, symbols second.
          Four short lessons with guided animations and interactive exploration.
        </p>
      </header>

      <ol className="home-page__list">
        {lessons.map((lesson, index) => (
          <li key={lesson.id} className="home-page__item">
            <Link to={`/lesson/${lesson.id}`} className="home-page__link">
              <span className="home-page__index">{index + 1}</span>
              <span className="home-page__link-text">
                <span className="home-page__lesson-title">{lesson.title}</span>
                <span className="home-page__lesson-sub">{lesson.subtitle}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <p className="home-page__dev-link">
        <Link to="/dev/mafs-demo">Mafs technical demo (M3)</Link>
      </p>
    </div>
  );
}
