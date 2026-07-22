import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type {
  FormalBlock,
  LessonDefinition,
  RouteBlock,
} from "../../lessons/types";
import { getAdjacentLessons, getLessonPosition } from "../../lessons/registry";
import { LessonHeader } from "../lesson/LessonHeader";
import { FormalStatement } from "../lesson/FormalStatement";
import {
  LessonTableOfContents,
  type LessonTocItem,
} from "../lesson/LessonTableOfContents";
import { LessonNavigation } from "./LessonNavigation";
import "./LessonLayout.css";

type LessonLayoutProps = {
  lesson: LessonDefinition;
  motivation?: ReactNode;
  /** All sections rendered together (used by the combined `watch` block). */
  explanation: ReactNode;
  /** Individual sections by id (used by `section` route blocks). */
  sectionsById?: Map<string, ReactNode>;
  visualization?: ReactNode;
  /** The lesson's default checkpoint (used by a `check` block with no id). */
  checkpoint?: ReactNode;
  /** Extra checkpoints by id (used by `check` blocks that name a `checkpointId`). */
  checkpointsById?: Map<string, ReactNode>;
  /** Combined worked examples + callouts (used by a `worked` block with no id). */
  workedExamples?: ReactNode;
  /** Individual worked examples by id (used by `worked` blocks with a workedId). */
  workedById?: Map<string, ReactNode>;
  exploration?: ReactNode;
  /**
   * Renders a Practice panel. Called with no arguments for the full exercise set,
   * or with a subset of exercise ids (and an optional heading) when a lesson
   * splits practice into more than one placed block. Returns null when empty.
   */
  renderExercises?: (exerciseIds?: string[], title?: string) => ReactNode;
  summary?: ReactNode;
  onReset?: () => void;
};

type PhaseProps = {
  id: string;
  title: string;
  ariaLabel: string;
  variant: string;
  children: ReactNode;
};

/** One lesson block with a conversational title. Blocks are not numbered — the
 * route can repeat and reorder them, so a fixed "1, 2, 3…" rail would lie. */
function Phase({ id, title, ariaLabel, variant, children }: PhaseProps) {
  return (
    <section
      id={id}
      className={`phase phase--${variant}`}
      aria-label={ariaLabel}
      data-phase={variant}
      tabIndex={-1}
    >
      <div className="phase__head">
        <h2 className="phase__title">{title}</h2>
      </div>
      <div className="phase__body">{children}</div>
    </section>
  );
}

/**
 * A plain linear fallback used only when a lesson declares no `route`, so the
 * page still renders. It is not a canonical order — every production lesson
 * should author its own `route` from the block palette (see LESSON_DESIGN.md).
 */
const FALLBACK_ROUTE: RouteBlock[] = [
  { kind: "motivate" },
  { kind: "watch" },
  { kind: "check" },
  { kind: "worked" },
  { kind: "explore" },
  { kind: "practice" },
  { kind: "summary" },
];

const PHASE_PRESENTATION: Record<string, { title: string; variant: string }> = {
  motivate: { title: "Think about it", variant: "think" },
  watch: { title: "Watch the idea", variant: "watch" },
  visual: { title: "Watch the idea", variant: "watch" },
  check: { title: "Quick check", variant: "check" },
  worked: { title: "Worked examples", variant: "worked" },
  explore: { title: "Try it yourself", variant: "explore" },
  practice: { title: "Practice", variant: "practice" },
  summary: { title: "Remember this", variant: "remember" },
};

const FORMAL_KIND_LABEL: Record<string, string> = {
  definition: "Definition",
  proposition: "Proposition",
  theorem: "Theorem",
  corollary: "Corollary",
  conjecture: "Conjecture",
  lemma: "Lemma",
  axiom: "Axiom",
};

/** Strip inline-KaTeX delimiters so TOC labels stay readable plain text. */
const plainLabel = (text: string): string => text.replace(/\$/g, "").trim();

export function LessonLayout({
  lesson,
  motivation,
  explanation,
  sectionsById,
  visualization,
  checkpoint,
  checkpointsById,
  workedExamples,
  workedById,
  exploration,
  renderExercises,
  summary,
  onReset,
}: LessonLayoutProps) {
  const { previous, next } = getAdjacentLessons(lesson.id);
  const { current, total } = getLessonPosition(lesson.id);

  const formalById = new Map<string, FormalBlock>(
    (lesson.formalBlocks ?? []).map((block) => [block.id, block]),
  );
  const sectionTitleById = new Map<string, string>(
    lesson.sections.map((section) => [section.id, section.title]),
  );
  const workedTitleById = new Map<string, string>(
    (lesson.workedExamples ?? []).map((example) => [example.id, example.title]),
  );

  const route = lesson.route ?? FALLBACK_ROUTE;

  const watchContent = visualization ? (
    <div className="lesson-layout__watch">
      <div className="lesson-layout__explain">{explanation}</div>
      <div className="lesson-layout__viz">{visualization}</div>
    </div>
  ) : (
    <div className="lesson-layout__explain">{explanation}</div>
  );

  const visualContent = visualization ? (
    <div className="lesson-layout__viz lesson-layout__viz--standalone">
      {visualization}
    </div>
  ) : null;

  const workedCombinedContent = workedExamples ? (
    <>
      <p className="phase__lede">
        Watch the derivation and the notebook reasoning together — the animation
        and the algebra are one object.
      </p>
      <div className="lesson-layout__worked">{workedExamples}</div>
    </>
  ) : null;

  const exploreContent = exploration ? (
    <>
      <p className="phase__lede">
        Now take control of the same example you just watched — drag the arrows or
        nudge the numbers and see what changes.
      </p>
      <div className="lesson-layout__explore">{exploration}</div>
    </>
  ) : null;

  // Resolve every route block once: its stable anchor id, an optional TOC label,
  // and its rendered node. A null node means the block has no content to show.
  type Resolved = {
    key: string;
    anchorId: string;
    tocLabel: string | null;
    node: ReactNode;
  };

  const resolveBlock = (block: RouteBlock, index: number): Resolved | null => {
    switch (block.kind) {
      case "formal": {
        const formal = formalById.get(block.formalId);
        if (!formal) return null;
        const anchorId = `formal-${block.formalId}`;
        return {
          key: anchorId,
          anchorId,
          tocLabel: plainLabel(
            formal.label ?? FORMAL_KIND_LABEL[formal.kind] ?? "Statement",
          ),
          node: (
            <div id={anchorId} className="lesson-layout__formal" tabIndex={-1}>
              <FormalStatement block={formal} />
            </div>
          ),
        };
      }
      case "handoff": {
        const anchorId = `handoff-${index}`;
        return {
          key: anchorId,
          anchorId,
          tocLabel: null,
          node: (
            <div className="lesson-layout__handoff" id={anchorId}>
              <Link className="lesson-layout__handoff-cta" to={block.to}>
                {block.label}
              </Link>
            </div>
          ),
        };
      }
      case "section": {
        const content = sectionsById?.get(block.sectionId);
        if (!content) return null;
        const anchorId = `section-${block.sectionId}`;
        return {
          key: anchorId,
          anchorId,
          tocLabel: plainLabel(
            sectionTitleById.get(block.sectionId) ?? "Section",
          ),
          node: (
            <div id={anchorId} className="lesson-layout__section" tabIndex={-1}>
              {content}
            </div>
          ),
        };
      }
      case "worked": {
        if (block.workedId) {
          const content = workedById?.get(block.workedId);
          if (!content) return null;
          const anchorId = `worked-${block.workedId}`;
          return {
            key: anchorId,
            anchorId,
            tocLabel: plainLabel(
              workedTitleById.get(block.workedId) ?? "Worked example",
            ),
            node: (
              <Phase
                id={anchorId}
                title="Worked examples"
                ariaLabel="Worked example"
                variant="worked"
              >
                <div className="lesson-layout__worked">{content}</div>
              </Phase>
            ),
          };
        }
        if (!workedCombinedContent) return null;
        const anchorId = `worked-${index}`;
        return {
          key: anchorId,
          anchorId,
          tocLabel: "Worked examples",
          node: (
            <Phase
              id={anchorId}
              title="Worked examples"
              ariaLabel="Worked examples"
              variant="worked"
            >
              {workedCombinedContent}
            </Phase>
          ),
        };
      }
      case "check": {
        const content = block.checkpointId
          ? checkpointsById?.get(block.checkpointId)
          : checkpoint;
        if (!content) return null;
        const anchorId = block.checkpointId
          ? `check-${block.checkpointId}`
          : `check-${index}`;
        const present = PHASE_PRESENTATION.check!;
        return {
          key: anchorId,
          anchorId,
          tocLabel: present.title,
          node: (
            <Phase
              id={anchorId}
              title={present.title}
              ariaLabel={present.title}
              variant={present.variant}
            >
              {content}
            </Phase>
          ),
        };
      }
      case "practice": {
        const content = renderExercises?.(block.exerciseIds, block.title);
        if (!content) return null;
        const anchorId = `practice-${index}`;
        const label = block.title ?? PHASE_PRESENTATION.practice!.title;
        return {
          key: anchorId,
          anchorId,
          tocLabel: plainLabel(label),
          node: (
            <Phase
              id={anchorId}
              title={label}
              ariaLabel={label}
              variant="practice"
            >
              <div className="lesson-layout__practice">{content}</div>
            </Phase>
          ),
        };
      }
      default: {
        // motivate | watch | visual | explore | summary
        const contentByKind: Partial<Record<RouteBlock["kind"], ReactNode>> = {
          motivate: motivation,
          watch: watchContent,
          visual: visualContent,
          explore: exploreContent,
          summary,
        };
        const content = contentByKind[block.kind];
        const present = PHASE_PRESENTATION[block.kind];
        if (!content || !present) return null;
        const anchorId = `${block.kind}-${index}`;
        return {
          key: anchorId,
          anchorId,
          tocLabel: present.title,
          node: (
            <Phase
              id={anchorId}
              title={present.title}
              ariaLabel={present.title}
              variant={present.variant}
            >
              {content}
            </Phase>
          ),
        };
      }
    }
  };

  const resolved = route
    .map((block, index) => resolveBlock(block, index))
    .filter((entry): entry is Resolved => entry !== null);

  const tocItems: LessonTocItem[] = resolved
    .filter((entry) => entry.tocLabel !== null)
    .map((entry) => ({ id: entry.anchorId, label: entry.tocLabel! }));

  return (
    <article className="lesson-layout">
      <LessonHeader
        title={lesson.title}
        subtitle={lesson.subtitle}
        current={current}
        total={total}
      />

      {tocItems.length >= 3 && <LessonTableOfContents items={tocItems} />}

      {resolved.map((entry) => (
        <Fragment key={entry.key}>{entry.node}</Fragment>
      ))}

      <LessonNavigation previous={previous} next={next} onReset={onReset} />
    </article>
  );
}
