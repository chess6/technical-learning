import { Link } from "react-router-dom";
import { lessons, getLessonNumber } from "../lessons/registry";
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

export function HomePage() {
  return (
    <div className="home-page">
      <header className="home-page__hero">
        <h1 className="home-page__title">Linear Algebra</h1>
        <p className="home-page__lede">
          A visual proof of concept: geometric intuition first, symbols second.
          It opens with Chapter 0's mystery — how four numbers move a whole
          graphic — then builds the coordinate language and transformations that
          resolve it. Most lessons move from a guided animation to hands-on
          exploration to a quick check.
        </p>
        <p className="home-page__cta">
          <Link to={`/lesson/${lessons[0]!.id}`} className="btn btn--primary">
            Start with Chapter 0
          </Link>
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

      <ol className="home-page__list" aria-label="Lessons, in recommended order">
        {lessons.map((lesson) => (
          <li key={lesson.id} className="home-page__item">
            <Link to={`/lesson/${lesson.id}`} className="home-page__link">
              <span className="home-page__index" aria-hidden="true">
                {getLessonNumber(lesson.id)}
              </span>
              <LessonPreviewIcon lessonId={lesson.id} />
              <span className="home-page__link-text">
                <span className="home-page__lesson-title">{lesson.title}</span>
                <span className="home-page__lesson-sub">{lesson.subtitle}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

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
