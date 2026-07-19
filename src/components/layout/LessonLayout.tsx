import type { ReactNode } from "react";
import type { LessonDefinition } from "../../lessons/types";
import { getAdjacentLessons, getLessonPosition } from "../../lessons/registry";
import { LessonHeader } from "../lesson/LessonHeader";
import { LessonNavigation } from "./LessonNavigation";
import "./LessonLayout.css";

type LessonLayoutProps = {
  lesson: LessonDefinition;
  explanation: ReactNode;
  visualization: ReactNode;
  exploration?: ReactNode;
  exercises?: ReactNode;
  summary?: ReactNode;
  onReset?: () => void;
};

export function LessonLayout({
  lesson,
  explanation,
  visualization,
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

      <section className="lesson-layout__row" aria-label="Explanation and guided animation">
        <div className="lesson-layout__explain">{explanation}</div>
        <div className="lesson-layout__viz">{visualization}</div>
      </section>

      {(exploration || exercises) && (
        <section
          className="lesson-layout__row"
          aria-label="Exploration and exercises"
        >
          <div className="lesson-layout__explain">{exercises}</div>
          <div className="lesson-layout__viz">{exploration}</div>
        </section>
      )}

      {summary}

      <LessonNavigation previous={previous} next={next} onReset={onReset} />
    </article>
  );
}
