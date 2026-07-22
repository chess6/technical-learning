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

const PHASE_TITLE: Record<string, string> = {
  motivate: "Think about it",
  watch: "Watch the idea",
  visual: "Watch the idea",
  check: "Quick check",
  worked: "Worked examples",
  explore: "Try it yourself",
  practice: "Practice",
  summary: "Remember this",
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

/** Kinds that start a new top-level TOC entry (children nest under them). */
const PRIMARY_KINDS = new Set([
  "motivate",
  "watch",
  "visual",
  "explore",
  "check",
  "practice",
  "summary",
]);

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
    default:
      return `${block.kind}-${index}`;
  }
}

/**
 * Learner-facing TOC label for a route block, or `null` when the block should
 * not appear in the TOC (missing content, or handoff).
 */
export function getBlockTocLabel(
  lesson: LessonDefinition,
  block: RouteBlock,
): string | null {
  const formals = formalById(lesson);
  const sections = sectionTitleById(lesson);
  const worked = workedTitleById(lesson);

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
        return plainTocLabel(worked.get(block.workedId) ?? "Worked example");
      }
      if ((lesson.workedExamples?.length ?? 0) === 0) return null;
      return PHASE_TITLE.worked!;
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
      return PHASE_TITLE.check!;
    }
    case "practice": {
      const all = lesson.exercises ?? [];
      const subset = block.exerciseIds
        ? all.filter((ex) => block.exerciseIds!.includes(ex.id))
        : all;
      if (subset.length === 0) return null;
      return plainTocLabel(block.title ?? PHASE_TITLE.practice!);
    }
    case "motivate":
      return lesson.motivatingQuestion ? PHASE_TITLE.motivate! : null;
    case "watch":
    case "visual":
      return lesson.guidedSceneId ? PHASE_TITLE[block.kind]! : null;
    case "explore":
      // LessonLayout always renders an explore slot (live explorer or placeholder).
      return PHASE_TITLE.explore!;
    case "summary":
      return lesson.keyTakeaway || lesson.structuredSummary
        ? PHASE_TITLE.summary!
        : null;
    default:
      return null;
  }
}

function isPrimaryBlock(block: RouteBlock): boolean {
  if (PRIMARY_KINDS.has(block.kind)) return true;
  // Combined worked examples are a phase; per-id worked examples nest as detail.
  return block.kind === "worked" && !block.workedId;
}

/**
 * Nested TOC for a lesson, derived from its authored `route`. Primary phases
 * are top-level; sections, formal statements, and per-id worked examples nest
 * under the preceding primary phase.
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
