import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type {
  FormalBlock,
  LessonDefinition,
  RouteBlock,
} from "../../lessons/types";
import { getAdjacentLessons, getLessonPosition } from "../../lessons/registry";
import { LessonHeader } from "../lesson/LessonHeader";
import { FormalStatement } from "../lesson/FormalStatement";
import { LessonNavigation } from "./LessonNavigation";
import "./LessonLayout.css";

type LessonLayoutProps = {
  lesson: LessonDefinition;
  motivation?: ReactNode;
  /** All sections rendered together (used by the legacy `watch` slot). */
  explanation: ReactNode;
  /** Individual sections by id (used by `section` route blocks). */
  sectionsById?: Map<string, ReactNode>;
  visualization?: ReactNode;
  checkpoint?: ReactNode;
  /** Worked computation (derivation scene + notebook) — after Check, before Explore. */
  workedExamples?: ReactNode;
  /** Individual worked examples by id (used by `worked` blocks with a workedId). */
  workedById?: Map<string, ReactNode>;
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

/** The seven fixed phases, in canonical order (used when no route is declared). */
const DEFAULT_ROUTE: RouteBlock[] = [
  { kind: "motivate" },
  { kind: "watch" },
  { kind: "check" },
  { kind: "worked" },
  { kind: "explore" },
  { kind: "practice" },
  { kind: "summary" },
];

type PhaseSlot = {
  title: string;
  variant: string;
  content: ReactNode;
};

export function LessonLayout({
  lesson,
  motivation,
  explanation,
  sectionsById,
  visualization,
  checkpoint,
  workedExamples,
  workedById,
  exploration,
  exercises,
  summary,
  onReset,
}: LessonLayoutProps) {
  const { previous, next } = getAdjacentLessons(lesson.id);
  const { current, total } = getLessonPosition(lesson.id);

  const phaseSlots: Partial<Record<RouteBlock["kind"], PhaseSlot>> = {
    motivate: { title: "Think about it", variant: "think", content: motivation },
    watch: {
      title: "Watch the idea",
      variant: "watch",
      content: visualization ? (
        <div className="lesson-layout__watch">
          <div className="lesson-layout__explain">{explanation}</div>
          <div className="lesson-layout__viz">{visualization}</div>
        </div>
      ) : (
        <div className="lesson-layout__explain">{explanation}</div>
      ),
    },
    visual: {
      title: "Watch the idea",
      variant: "watch",
      content: visualization ? (
        <div className="lesson-layout__viz lesson-layout__viz--standalone">
          {visualization}
        </div>
      ) : null,
    },
    check: { title: "Quick check", variant: "check", content: checkpoint },
    worked: {
      title: "Worked computation",
      variant: "worked",
      content: workedExamples && (
        <>
          <p className="phase__lede">
            Watch the derivation and the notebook reasoning together — the
            animation and the algebra are one object.
          </p>
          <div className="lesson-layout__worked">{workedExamples}</div>
        </>
      ),
    },
    explore: {
      title: "Try it yourself",
      variant: "explore",
      content: exploration && (
        <>
          <p className="phase__lede">
            Now take control of the same example you just watched — drag the
            arrows or nudge the numbers and see what changes.
          </p>
          <div className="lesson-layout__explore">{exploration}</div>
        </>
      ),
    },
    practice: {
      title: "Practice",
      variant: "practice",
      content: exercises && (
        <div className="lesson-layout__practice">{exercises}</div>
      ),
    },
    summary: { title: "Remember this", variant: "remember", content: summary },
  };

  const formalById = new Map<string, FormalBlock>(
    (lesson.formalBlocks ?? []).map((block) => [block.id, block]),
  );
  const route = lesson.route ?? DEFAULT_ROUTE;

  // Number phases dynamically so optional slots don't leave gaps; formal blocks
  // and the handoff are interludes and are not numbered.
  let step = 0;

  return (
    <article className="lesson-layout">
      <LessonHeader
        title={lesson.title}
        subtitle={lesson.subtitle}
        current={current}
        total={total}
      />

      {route.map((block, index) => {
        if (block.kind === "formal") {
          const formal = formalById.get(block.formalId);
          return formal ? (
            <FormalStatement key={`formal:${block.formalId}`} block={formal} />
          ) : null;
        }
        if (block.kind === "handoff") {
          return (
            <div className="lesson-layout__handoff" key={`handoff:${index}`}>
              <Link className="lesson-layout__handoff-cta" to={block.to}>
                {block.label}
              </Link>
            </div>
          );
        }
        if (block.kind === "section") {
          const content = sectionsById?.get(block.sectionId);
          return content ? (
            <div
              className="lesson-layout__section"
              key={`section:${block.sectionId}`}
            >
              {content}
            </div>
          ) : null;
        }
        if (block.kind === "worked" && block.workedId) {
          const content = workedById?.get(block.workedId);
          if (!content) return null;
          step += 1;
          return (
            <Phase
              key={`worked:${block.workedId}`}
              step={step}
              title="Worked computation"
              ariaLabel="Worked computation"
              variant="worked"
            >
              <div className="lesson-layout__worked">{content}</div>
            </Phase>
          );
        }
        const slot = phaseSlots[block.kind];
        if (!slot || !slot.content) return null;
        step += 1;
        return (
          <Phase
            key={`phase:${block.kind}:${index}`}
            step={step}
            title={slot.title}
            ariaLabel={slot.title}
            variant={slot.variant}
          >
            {slot.content}
          </Phase>
        );
      })}

      <LessonNavigation previous={previous} next={next} onReset={onReset} />
    </article>
  );
}
