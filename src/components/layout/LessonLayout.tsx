import type { ReactNode } from "react";
import type { LessonDefinition } from "../../lessons/types";
import { getAdjacentLessons, getLessonPosition } from "../../lessons/registry";
import { LessonHeader } from "../lesson/LessonHeader";
import { LessonNavigation } from "./LessonNavigation";
import "./LessonLayout.css";

type LessonLayoutProps = {
  lesson: LessonDefinition;
  motivation?: ReactNode;
  explanation: ReactNode;
  visualization: ReactNode;
  checkpoint?: ReactNode;
  exploration?: ReactNode;
  exercises?: ReactNode;
  summary?: ReactNode;
  onReset?: () => void;
};

export function LessonLayout({
  lesson,
  motivation,
  explanation,
  visualization,
  checkpoint,
  exploration,
  exercises,
  summary,
  onReset,
}: LessonLayoutProps) {
  const { previous, next } = getAdjacentLessons(lesson.id);
  const { current, total } = getLessonPosition(lesson.id);

  return (
    <article className="lesson-layout">
      <LessonHeader
        title={lesson.title}
        subtitle={lesson.subtitle}
        current={current}
        total={total}
      />

      {motivation && (
        <section className="lesson-phase" aria-label="Motivate">
          <p className="lesson-phase__label">1 · Motivate</p>
          {motivation}
        </section>
      )}

      <section className="lesson-phase" aria-label="Watch the guided explanation">
        <p className="lesson-phase__label">2 · Watch</p>
        <div className="lesson-layout__watch">
          <div className="lesson-layout__explain">{explanation}</div>
          <div className="lesson-layout__viz">{visualization}</div>
        </div>
      </section>

      {checkpoint && (
        <section className="lesson-phase lesson-phase--light" aria-label="Check understanding">
          <p className="lesson-phase__label">3 · Check</p>
          {checkpoint}
        </section>
      )}

      {exploration && (
        <section className="lesson-phase" aria-label="Try it yourself">
          <p className="lesson-phase__label">4 · Explore</p>
          <h2 className="lesson-phase__heading">Try it yourself</h2>
          <p className="lesson-phase__lede">
            Now change the same example you just watched.
          </p>
          <div className="lesson-layout__explore">{exploration}</div>
        </section>
      )}

      {exercises && (
        <section className="lesson-phase" aria-label="Practice">
          <p className="lesson-phase__label">5 · Practice</p>
          <div className="lesson-layout__practice">{exercises}</div>
        </section>
      )}

      {summary && (
        <section className="lesson-phase lesson-phase--recap" aria-label="Summarize">
          <p className="lesson-phase__label">6 · Summarize</p>
          {summary}
        </section>
      )}

      <LessonNavigation previous={previous} next={next} onReset={onReset} />
    </article>
  );
}
