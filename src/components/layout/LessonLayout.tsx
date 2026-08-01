import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type {
  FormalBlock,
  LessonDefinition,
  RouteBlock,
} from "../../lessons/types";
import {
  getAdjacentLessons,
  getLessonPosition,
} from "../../lessons/courseModel";
import {
  flattenLessonToc,
  getBlockAnchorId,
  getLessonTocTree,
} from "../../lessons/toc";
import { LessonHeader } from "../lesson/LessonHeader";
import { FormalStatement } from "../lesson/FormalStatement";
import { LessonTableOfContents } from "../lesson/LessonTableOfContents";
import { renderBlockComponent } from "../lesson/blockComponents";
import { CurriculumConnections } from "../lesson/CurriculumConnections";
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
  /**
   * Additional guided clips a route may place by scene id, for a lesson whose
   * mathematics genuinely needs a second one somewhere other than the top.
   * Optional: a lesson with a single clip supplies nothing here.
   */
  visualsBySceneId?: Map<string, ReactNode>;
  /** The lesson's default checkpoint (used by a `check` block with no id). */
  checkpoint?: ReactNode;
  /** Extra checkpoints by id (used by `check` blocks that name a `checkpointId`). */
  checkpointsById?: Map<string, ReactNode>;
  /** Combined worked examples + callouts (used by a `worked` block with no id). */
  workedExamples?: ReactNode;
  /** Individual worked examples by id (used by `worked` blocks with a workedId). */
  workedById?: Map<string, ReactNode>;
  /** The lesson's single/combined exploration (used by an `explore` block with no id). */
  exploration?: ReactNode;
  /**
   * Explorers a route places by explorationId, mirroring `visualsBySceneId` —
   * for a lesson whose mathematics genuinely needs more than one explorer.
   */
  explorationsById?: Map<string, ReactNode>;
  /** Callouts placed explicitly by a `callout` route block, keyed by id. */
  calloutsById?: Map<string, ReactNode>;
  /**
   * Renders a Practice panel. Called with no arguments for the full exercise set,
   * or with a subset of exercise ids when a lesson splits practice into more
   * than one placed block. Returns null when empty.
   */
  renderExercises?: (exerciseIds?: string[]) => ReactNode;
  summary?: ReactNode;
  onReset?: () => void;
};

type PhaseProps = {
  id: string;
  /** Internal block kind — analytics/telemetry hook, never a heading. */
  kind: string;
  /** Authored, content-specific heading. Omitted for most blocks by default. */
  heading?: string;
  /** Screen-reader description of the block's function (supplements, never
   *  replaces, whatever visible label the content carries). */
  regionLabel: string;
  variant: string;
  children: ReactNode;
};

/**
 * One block of a lesson.
 *
 * **A block has no visible heading unless the lesson authored one.** The block
 * kind stays available as route metadata, as `data-block-kind` / `data-phase`
 * hooks, as the styling variant, and as the accessible region description — but
 * it is never surfaced as an `h2`. A reader infers a block's role from its
 * content and typography, not from a generic phase label
 * (product/semantic-page-grammar.md §1); the repeated rail was what made every
 * lesson read as the same template.
 *
 * Blocks are not numbered either — the route can repeat and reorder them, so a
 * fixed "1, 2, 3…" rail would lie.
 */
function Phase({
  id,
  kind,
  heading,
  regionLabel,
  variant,
  children,
}: PhaseProps) {
  return (
    <section
      id={id}
      className={`phase phase--${variant}`}
      aria-label={regionLabel}
      data-block-kind={kind}
      data-phase={variant}
      tabIndex={-1}
    >
      {heading && (
        <div className="phase__head">
          <h2 className="phase__title">{heading}</h2>
        </div>
      )}
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

/**
 * Per-kind presentation: the styling variant, and the accessible name of the
 * region. `region` is a screen-reader functional description
 * (semantic-page-grammar §1.1, layer 4) — it announces what a block *is for* to
 * assistive tech; it is deliberately NOT rendered as a visible heading.
 *
 * `defaultHeading` exists only for the two conventional textbook labels that
 * genuinely orient a reader — "Practice" and "Worked examples" (grammar §5.2's
 * furniture). Every other kind renders headless unless a lesson authors one.
 */
const BLOCK_PRESENTATION: Record<
  string,
  { region: string; variant: string; defaultHeading?: string }
> = {
  // Each region name is deliberately distinct from the name its CHILD region
  // carries (the guided-scene figure, the worked-example panel, the explorer,
  // the exercise panel), so assistive tech — and any locator — never sees two
  // nested regions announcing the same thing.
  motivate: { region: "Motivating question", variant: "think" },
  watch: { region: "Guided explanation", variant: "watch" },
  visual: { region: "Guided walkthrough", variant: "watch" },
  check: { region: "Checkpoint", variant: "check" },
  worked: {
    region: "Worked computations",
    variant: "worked",
    defaultHeading: "Worked examples",
  },
  explore: { region: "Exploration", variant: "explore" },
  practice: { region: "Practice", variant: "practice", defaultHeading: "Practice" },
  summary: { region: "Summary", variant: "remember" },
  callout: { region: "Aside", variant: "callout" },
  proof: { region: "Proof", variant: "proof" },
  composed: { region: "Interactive", variant: "composed" },
};

export function LessonLayout({
  lesson,
  motivation,
  explanation,
  sectionsById,
  visualization,
  visualsBySceneId,
  checkpoint,
  checkpointsById,
  workedExamples,
  workedById,
  exploration,
  explorationsById,
  calloutsById,
  renderExercises,
  summary,
  onReset,
}: LessonLayoutProps) {
  const { previous, next } = getAdjacentLessons(lesson.id);
  const { current, total } = getLessonPosition(lesson.id);

  const formalById = new Map<string, FormalBlock>(
    (lesson.formalBlocks ?? []).map((block) => [block.id, block]),
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

  // No lede on either: the worked examples and the explorer both carry their own
  // titles, so a stock sentence above them is template filler, not orientation.
  const workedCombinedContent = workedExamples ? (
    <div className="lesson-layout__worked">{workedExamples}</div>
  ) : null;

  const exploreContent = exploration ? (
    <div className="lesson-layout__explore">{exploration}</div>
  ) : null;

  // Resolve every route block once: its stable anchor id and rendered node.
  // A null node means the block has no content to show. TOC labels live in
  // `getLessonTocTree` so the course sidebar can share the same structure.
  type Resolved = {
    key: string;
    anchorId: string;
    node: ReactNode;
  };

  const resolveBlock = (block: RouteBlock, index: number): Resolved | null => {
    const anchorId = getBlockAnchorId(block, index);
    switch (block.kind) {
      case "formal": {
        const formal = formalById.get(block.formalId);
        if (!formal) return null;
        return {
          key: anchorId,
          anchorId,
          node: (
            <div id={anchorId} className="lesson-layout__formal" tabIndex={-1}>
              <FormalStatement block={formal} />
            </div>
          ),
        };
      }
      case "proof": {
        const formal = formalById.get(block.formalId);
        if (!formal || !formal.proof) return null;
        return {
          key: anchorId,
          anchorId,
          node: (
            <div id={anchorId} className="lesson-layout__proof" tabIndex={-1}>
              <FormalStatement block={formal} variant="proof" />
            </div>
          ),
        };
      }
      case "callout": {
        const content = calloutsById?.get(block.calloutId);
        if (!content) return null;
        return {
          key: anchorId,
          anchorId,
          node: (
            <div id={anchorId} className="lesson-layout__callout" tabIndex={-1}>
              {content}
            </div>
          ),
        };
      }
      case "composed": {
        const content = renderBlockComponent(block.componentId, block.config);
        if (!content) return null;
        return {
          key: anchorId,
          anchorId,
          node: (
            <Phase
              id={anchorId}
              kind="composed"
              heading={block.heading}
              regionLabel={block.heading ?? BLOCK_PRESENTATION.composed!.region}
              variant="composed"
            >
              {content}
            </Phase>
          ),
        };
      }
      case "handoff": {
        return {
          key: anchorId,
          anchorId,
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
        return {
          key: anchorId,
          anchorId,
          node: (
            <div id={anchorId} className="lesson-layout__section" tabIndex={-1}>
              {content}
            </div>
          ),
        };
      }
      case "worked": {
        // A per-id worked example already renders its own title as the block's
        // heading, so the outer block stays headless; the combined block keeps
        // the conventional "Worked examples" label over a set of them.
        const content = block.workedId
          ? workedById?.get(block.workedId)
          : workedCombinedContent;
        if (!content) return null;
        return {
          key: anchorId,
          anchorId,
          node: (
            <Phase
              id={anchorId}
              kind="worked"
              heading={
                block.heading ??
                (block.workedId
                  ? undefined
                  : BLOCK_PRESENTATION.worked!.defaultHeading)
              }
              regionLabel={block.heading ?? BLOCK_PRESENTATION.worked!.region}
              variant="worked"
            >
              {block.workedId ? (
                <div className="lesson-layout__worked">{content}</div>
              ) : (
                content
              )}
            </Phase>
          ),
        };
      }
      case "practice": {
        const content = renderExercises?.(block.exerciseIds);
        if (!content) return null;
        const present = BLOCK_PRESENTATION.practice!;
        const heading = block.heading ?? present.defaultHeading!;
        return {
          key: anchorId,
          anchorId,
          node: (
            <Phase
              id={anchorId}
              kind="practice"
              heading={heading}
              regionLabel={heading}
              variant="practice"
            >
              <div className="lesson-layout__practice">{content}</div>
            </Phase>
          ),
        };
      }
      default: {
        // motivate | watch | visual | check | explore | summary — all headless
        // unless the lesson authored a content-specific heading.
        // A `visual` block naming a scene renders THAT scene or nothing —
        // never the lesson's own clip. Falling back would quietly put the wrong
        // animation where the route asked for a specific one.
        const placedVisual =
          block.kind === "visual" && block.sceneId
            ? visualsBySceneId?.get(block.sceneId) ?? null
            : visualContent;
        // A named `explorationId` renders THAT explorer or nothing — never the
        // lesson's combined one — mirroring `visual`'s named-`sceneId` rule.
        const placedExploration =
          block.kind === "explore" && block.explorationId
            ? explorationsById?.get(block.explorationId) ?? null
            : exploreContent;
        const contentByKind: Partial<Record<RouteBlock["kind"], ReactNode>> = {
          motivate: motivation,
          watch: watchContent,
          visual:
            block.kind === "visual" && block.sceneId && placedVisual ? (
              <div className="lesson-layout__viz lesson-layout__viz--standalone">
                {placedVisual}
              </div>
            ) : (
              placedVisual
            ),
          check: block.kind === "check" && block.checkpointId
            ? checkpointsById?.get(block.checkpointId)
            : checkpoint,
          explore:
            block.kind === "explore" && block.explorationId && placedExploration ? (
              <div className="lesson-layout__explore lesson-layout__explore--standalone">
                {placedExploration}
              </div>
            ) : (
              placedExploration
            ),
          summary,
        };
        const content = contentByKind[block.kind];
        const present = BLOCK_PRESENTATION[block.kind];
        if (!content || !present) return null;
        return {
          key: anchorId,
          anchorId,
          node: (
            <Phase
              id={anchorId}
              kind={block.kind}
              heading={block.heading}
              regionLabel={block.heading ?? present.region}
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

  const tocItems = getLessonTocTree(lesson);
  const tocCount = flattenLessonToc(tocItems).length;

  return (
    <article className="lesson-layout">
      <LessonHeader
        title={lesson.title}
        subtitle={lesson.subtitle}
        current={current}
        total={total}
      />

      {tocCount >= 3 && <LessonTableOfContents items={tocItems} />}

      {resolved.map((entry) => (
        <Fragment key={entry.key}>{entry.node}</Fragment>
      ))}

      <CurriculumConnections lessonId={lesson.id} />

      <LessonNavigation previous={previous} next={next} onReset={onReset} />
    </article>
  );
}
