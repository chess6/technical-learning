import type { FormalBlock, LessonDefinition, RouteBlock } from "./types";

/**
 * One entry in a lesson's per-page table of contents. Children are nested
 * sublists (sections, formal statements, and per-id worked examples under the
 * preceding primary phase).
 */
export type LessonTocItem = {
  id: string;
  label: string;
  children?: LessonTocItem[];
};

/** Fallback used only when a lesson declares no `route` (mirrors LessonLayout). */
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
 * The only two default labels left.
 *
 * Generic phase names ("Think about it", "Watch the idea", "Quick check", "Try
 * it yourself", "Remember this") are internal block kinds and must never appear
 * in a table of contents — a ToC entry reads "When does a system have no
 * solution?", not "Check" (product/semantic-page-grammar.md §1.1). What remains
 * are the two conventional textbook labels that genuinely orient a reader
 * (grammar §5.2 furniture). Everything else comes from authored, content-specific
 * text: section titles, formal-block labels, worked-example titles, or a block's
 * own `heading` / `tocLabel`.
 */
const CONVENTIONAL_LABEL: Record<string, string> = {
  worked: "Worked examples",
  practice: "Practice",
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
export const plainTocLabel = (text: string): string =>
  text.replace(/\$/g, "").trim();



function formalById(lesson: LessonDefinition): Map<string, FormalBlock> {
  return new Map((lesson.formalBlocks ?? []).map((block) => [block.id, block]));
}

function sectionTitleById(lesson: LessonDefinition): Map<string, string> {
  return new Map(lesson.sections.map((section) => [section.id, section.title]));
}

function workedTitleById(lesson: LessonDefinition): Map<string, string> {
  return new Map(
    (lesson.workedExamples ?? []).map((example) => [example.id, example.title]),
  );
}

function calloutTitleById(lesson: LessonDefinition): Map<string, string> {
  return new Map(
    (lesson.callouts ?? []).map((callout) => [callout.id, callout.title]),
  );
}

/**
 * Stable anchor id for a route block — must match `LessonLayout` so in-page
 * links and the course-sidebar sublist land on the same elements.
 */
export function getBlockAnchorId(block: RouteBlock, index: number): string {
  switch (block.kind) {
    case "formal":
      return `formal-${block.formalId}`;
    case "handoff":
      return `handoff-${index}`;
    case "section":
      return `section-${block.sectionId}`;
    case "worked":
      return block.workedId ? `worked-${block.workedId}` : `worked-${index}`;
    case "check":
      return block.checkpointId
        ? `check-${block.checkpointId}`
        : `check-${index}`;
    case "practice":
      return `practice-${index}`;
    case "visual":
      // A lesson may place more than one clip, so the scene names the anchor
      // when there is one; the lesson's own visual keeps the positional id.
      return block.sceneId ? `visual-${block.sceneId}` : `visual-${index}`;
    case "explore":
      // Mirrors "visual": a named explorationId gets its own stable anchor.
      return block.explorationId
        ? `explore-${block.explorationId}`
        : `explore-${index}`;
    case "callout":
      return `callout-${block.calloutId}`;
    case "proof":
      return `proof-${block.formalId}`;
    case "composed":
      return `composed-${block.componentId}-${index}`;
    default:
      return `${block.kind}-${index}`;
  }
}

/** The lesson's own words for this block, if it authored any. */
function authored(block: RouteBlock): string | undefined {
  if ("tocLabel" in block && block.tocLabel) return block.tocLabel;
  if ("heading" in block && block.heading) return block.heading;
  return undefined;
}

/** Authored label or nothing — a block with no authored words gets no ToC row. */
function authoredLabel(block: RouteBlock): string | null {
  const label = authored(block);
  return label ? plainTocLabel(label) : null;
}

/**
 * Learner-facing TOC label for a route block, or `null` when the block should
 * not appear in the TOC (no authored label, missing content, or a handoff).
 */
export function getBlockTocLabel(
  lesson: LessonDefinition,
  block: RouteBlock,
): string | null {
  const formals = formalById(lesson);
  const sections = sectionTitleById(lesson);
  const worked = workedTitleById(lesson);
  const callouts = calloutTitleById(lesson);

  switch (block.kind) {
    case "handoff":
      return null;
    case "formal": {
      const formal = formals.get(block.formalId);
      if (!formal) return null;
      return plainTocLabel(
        formal.label ?? FORMAL_KIND_LABEL[formal.kind] ?? "Statement",
      );
    }
    case "section": {
      if (!sections.has(block.sectionId)) return null;
      return plainTocLabel(sections.get(block.sectionId) ?? "Section");
    }
    case "worked": {
      if (block.workedId) {
        if (!worked.has(block.workedId)) return null;
        // A placed worked example is named by its own title.
        return plainTocLabel(
          authored(block) ?? worked.get(block.workedId) ?? "Worked example",
        );
      }
      if ((lesson.workedExamples?.length ?? 0) === 0) return null;
      return plainTocLabel(authored(block) ?? CONVENTIONAL_LABEL.worked!);
    }
    case "check": {
      if (block.checkpointId) {
        const found = (lesson.checkpoints ?? []).some(
          (cp) => cp.id === block.checkpointId,
        );
        if (!found) return null;
      } else if (!lesson.checkpoint) {
        return null;
      }
      // A checkpoint prompt speaks for itself; it earns a row only when the
      // lesson gave it a content-specific label.
      return authoredLabel(block);
    }
    case "practice": {
      const all = lesson.exercises ?? [];
      const subset = block.exerciseIds
        ? all.filter((ex) => block.exerciseIds!.includes(ex.id))
        : all;
      if (subset.length === 0) return null;
      return plainTocLabel(authored(block) ?? CONVENTIONAL_LABEL.practice!);
    }
    case "motivate":
      return lesson.motivatingQuestion ? authoredLabel(block) : null;
    case "watch":
    case "visual":
      // A named sceneId (block.sceneId on "visual") resolves independently of
      // the lesson's own guidedSceneId; the combined "watch"/default "visual"
      // needs the lesson's own scene to exist.
      if (block.kind === "visual" && block.sceneId) return authoredLabel(block);
      return lesson.guidedSceneId ? authoredLabel(block) : null;
    case "explore":
      // A named explorationId resolves independently of the lesson's own
      // explorationId; the combined explore slot needs the lesson's own
      // explorer to exist — otherwise the row would point at content
      // LessonLayout never renders (no exploration prop reaches it).
      if (block.explorationId) return authoredLabel(block);
      return lesson.explorationId ? authoredLabel(block) : null;
    case "callout": {
      const title = callouts.get(block.calloutId);
      return title ? plainTocLabel(title) : null;
    }
    case "proof": {
      const formal = formals.get(block.formalId);
      if (!formal || !formal.proof) return null;
      const name = formal.label ?? FORMAL_KIND_LABEL[formal.kind] ?? "Statement";
      return plainTocLabel(`Proof — ${name}`);
    }
    case "composed":
      return authoredLabel(block);
    case "summary":
      return lesson.keyTakeaway || lesson.structuredSummary
        ? authoredLabel(block)
        : null;
    default:
      return null;
  }
}

/**
 * Formal statements and individually placed worked examples are *detail* under
 * the heading that introduced them; everything else that earned a label is a
 * top-level entry. With the generic phase rail gone, section titles are what
 * usually carry the top level.
 */
function isPrimaryBlock(block: RouteBlock): boolean {
  if (block.kind === "formal") return false;
  return !(block.kind === "worked" && block.workedId);
}

/**
 * Nested TOC for a lesson, derived from its authored `route`. Every entry is
 * content-specific — a generic phase name never appears here. Formal statements
 * and individually placed worked examples nest under the preceding entry.
 */
export function getLessonTocTree(lesson: LessonDefinition): LessonTocItem[] {
  const route = lesson.route ?? FALLBACK_ROUTE;
  const roots: LessonTocItem[] = [];
  let currentPrimary: LessonTocItem | null = null;

  route.forEach((block, index) => {
    const label = getBlockTocLabel(lesson, block);
    if (label === null) return;

    const item: LessonTocItem = {
      id: getBlockAnchorId(block, index),
      label,
    };

    if (isPrimaryBlock(block)) {
      item.children = [];
      roots.push(item);
      currentPrimary = item;
      return;
    }

    if (currentPrimary) {
      currentPrimary.children = currentPrimary.children ?? [];
      currentPrimary.children.push(item);
      return;
    }

    roots.push(item);
  });

  // Drop empty children arrays so leaf nodes stay compact.
  const prune = (items: LessonTocItem[]): LessonTocItem[] =>
    items.map((item) => {
      if (!item.children || item.children.length === 0) {
        const { children: _c, ...rest } = item;
        return rest;
      }
      return { ...item, children: prune(item.children) };
    });

  return prune(roots);
}

/** Flatten a TOC tree (depth-first) — useful for tests and simple counts. */
export function flattenLessonToc(
  items: readonly LessonTocItem[],
): LessonTocItem[] {
  const out: LessonTocItem[] = [];
  for (const item of items) {
    out.push({ id: item.id, label: item.label });
    if (item.children) out.push(...flattenLessonToc(item.children));
  }
  return out;
}
