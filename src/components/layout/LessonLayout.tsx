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
  /** Worked computation (derivation scene + notebook) — after Check, before Explore. */
  workedExamples?: ReactNode;
  exploration?: ReactNode;
  exercises?: ReactNode;
  summary?: ReactNode;
  onReset?: () => void;
};

type PhaseProps = {
  step: number;
  title: string;
  ariaLabel: string;
  variant: string;
  children: ReactNode;
};

/** One lesson phase with a numbered rail cue and conversational title. */
function Phase({ step, title, ariaLabel, variant, children }: PhaseProps) {
  return (
    <section
      className={`phase phase--${variant}`}
      aria-label={ariaLabel}
      data-phase={variant}
    >
      <div className="phase__head">
        <span className="phase__step" aria-hidden="true">
          {step}
        </span>
        <h2 className="phase__title">{title}</h2>
      </div>
      <div className="phase__body">{children}</div>
    </section>
  );
}

export function LessonLayout({
  lesson,
  motivation,
  explanation,
  visualization,
  checkpoint,
  workedExamples,
  exploration,
  exercises,
  summary,
  onReset,
}: LessonLayoutProps) {
  const { previous, next } = getAdjacentLessons(lesson.id);
  const { current, total } = getLessonPosition(lesson.id);

  // Number phases dynamically so optional slots don't leave gaps.
  let step = 0;
  const nextStep = () => {
    step += 1;
    return step;
  };

  return (
    <article className="lesson-layout">
      <LessonHeader
        title={lesson.title}
        subtitle={lesson.subtitle}
        current={current}
        total={total}
      />

      {motivation && (
        <Phase
          step={nextStep()}
          title="Think about it"
          ariaLabel="Think about it"
          variant="think"
        >
          {motivation}
        </Phase>
      )}

      <Phase
        step={nextStep()}
        title="Watch the idea"
        ariaLabel="Watch the idea"
        variant="watch"
      >
        <div className="lesson-layout__watch">
          <div className="lesson-layout__explain">{explanation}</div>
          <div className="lesson-layout__viz">{visualization}</div>
        </div>
      </Phase>

      {checkpoint && (
        <Phase
          step={nextStep()}
          title="Quick check"
          ariaLabel="Quick check"
          variant="check"
        >
          {checkpoint}
        </Phase>
      )}

      {workedExamples && (
        <Phase
          step={nextStep()}
          title="Worked computation"
          ariaLabel="Worked computation"
          variant="worked"
        >
          <p className="phase__lede">
            Watch the derivation and the notebook reasoning together — the
            animation and the algebra are one object.
          </p>
          <div className="lesson-layout__worked">{workedExamples}</div>
        </Phase>
      )}

      {exploration && (
        <Phase
          step={nextStep()}
          title="Try it yourself"
          ariaLabel="Try it yourself"
          variant="explore"
        >
          <p className="phase__lede">
            Now take control of the same example you just watched — drag the
            arrows or nudge the numbers and see what changes.
          </p>
          <div className="lesson-layout__explore">{exploration}</div>
        </Phase>
      )}

      {exercises && (
        <Phase
          step={nextStep()}
          title="Practice"
          ariaLabel="Practice"
          variant="practice"
        >
          <div className="lesson-layout__practice">{exercises}</div>
        </Phase>
      )}

      {summary && (
        <Phase
          step={nextStep()}
          title="Remember this"
          ariaLabel="Remember this"
          variant="remember"
        >
          {summary}
        </Phase>
      )}

      <LessonNavigation previous={previous} next={next} onReset={onReset} />
    </article>
  );
}
