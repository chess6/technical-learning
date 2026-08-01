import { describe, expect, it } from "vitest";
import { chapter0Lesson } from "../chapter0";
import { vectorsLesson } from "../vectors";
import { lessons } from "../registry";
import { flattenLessonToc, getLessonTocTree, getBlockTocLabel } from "../toc";
import type { LessonDefinition } from "../types";

/**
 * The internal block names. A lesson's `route` still uses them, and they still
 * drive `data-block-kind`, styling variants, and accessible region descriptions
 * — but a learner must never meet them, in a heading or in a table of contents
 * (product/semantic-page-grammar.md §1.1).
 */
const GENERIC_PHASE_LABELS = [
  "Think about it",
  "Watch the idea",
  "Quick check",
  "Try it yourself",
  "Remember this",
];

describe("getLessonTocTree", () => {
  it("uses content-specific headings, not phase names", () => {
    const tree = getLessonTocTree(chapter0Lesson);
    expect(tree.map((item) => item.label)).toEqual([
      // The motivating question and the mystery scene speak for themselves and
      // claim no row; the chapter's own words carry the contents.
      "Four numbers move a whole graphic",
      "Move the whole craft with four numbers",
      "The same idea, everywhere",
      "One move four numbers can't make",
    ]);
    // The open question nests under the section that raises it.
    expect(tree.at(-1)!.children?.map((c) => c.label)).toEqual([
      "The question this course opens with",
    ]);
  });

  it("keeps flattened anchors unique and stable", () => {
    const flat = flattenLessonToc(getLessonTocTree(chapter0Lesson));
    const ids = flat.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("section-mystery");
    expect(ids).toContain("explore-3");
    expect(ids).toContain("formal-ch0-open-question");
  });

  it("builds a nested TOC for a content lesson with interleaved sections", () => {
    const tree = getLessonTocTree(vectorsLesson);
    expect(flattenLessonToc(tree).length).toBeGreaterThanOrEqual(3);
    // At least one entry should carry nested detail (a formal statement).
    expect(tree.some((item) => (item.children?.length ?? 0) > 0)).toBe(true);
  });
});

describe("no lesson surfaces a generic phase name", () => {
  it.each(lessons.map((lesson) => [lesson.id, lesson] as const))(
    "%s has a content-specific table of contents",
    (_id, lesson) => {
      const labels = flattenLessonToc(getLessonTocTree(lesson)).map((i) => i.label);
      for (const generic of GENERIC_PHASE_LABELS) {
        expect(labels, `"${generic}" must not appear in the contents`).not.toContain(
          generic,
        );
      }
      // Whatever survives must be real, non-empty authored text.
      for (const label of labels) expect(label.trim().length).toBeGreaterThan(0);
    },
  );

  it("still lists something worth navigating in every lesson", () => {
    for (const lesson of lessons) {
      const labels = flattenLessonToc(getLessonTocTree(lesson)).map((i) => i.label);
      expect(labels.length, `${lesson.id} has an empty table of contents`).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps the two conventional textbook labels where they orient a reader", () => {
    // "Practice" and "Worked examples" are furniture, not a phase rail
    // (semantic-page-grammar §5.2): they name a *kind* of block the way a
    // textbook does, and only appear where such a block exists.
    const labels = flattenLessonToc(getLessonTocTree(vectorsLesson)).map((i) => i.label);
    expect(labels).toContain("Worked examples");
    expect(labels).toContain("Practice");
  });
});

describe("callout / proof / composed / named-explore ToC labels (ADR-004)", () => {
  const base: LessonDefinition = {
    id: "toc-fixture",
    title: "Fixture",
    subtitle: "Fixture",
    learningObjectives: ["x"],
    sections: [],
  };

  it("names a callout block by the callout's own title", () => {
    const lesson: LessonDefinition = {
      ...base,
      callouts: [{ id: "belief", title: "A field's plausible belief" }],
      route: [{ kind: "callout", calloutId: "belief" }],
    };
    expect(getBlockTocLabel(lesson, lesson.route![0]!)).toBe(
      "A field's plausible belief",
    );
  });

  it("returns null for a callout block whose calloutId does not resolve", () => {
    const lesson: LessonDefinition = {
      ...base,
      route: [{ kind: "callout", calloutId: "missing" }],
    };
    expect(getBlockTocLabel(lesson, lesson.route![0]!)).toBeNull();
  });

  it("names a proof block 'Proof — <formal label>', only when the formal has a proof", () => {
    const lesson: LessonDefinition = {
      ...base,
      formalBlocks: [
        {
          id: "thm",
          kind: "theorem",
          label: "Rank-nullity",
          statement: "s",
          interpretation: "i",
          visibility: "visible",
          proof: "p",
        },
      ],
      route: [{ kind: "proof", formalId: "thm" }],
    };
    expect(getBlockTocLabel(lesson, lesson.route![0]!)).toBe("Proof — Rank-nullity");
  });

  it("returns null for a proof block whose formal has no proof field", () => {
    const lesson: LessonDefinition = {
      ...base,
      formalBlocks: [
        {
          id: "thm",
          kind: "theorem",
          statement: "s",
          interpretation: "i",
          visibility: "visible",
        },
      ],
      route: [{ kind: "proof", formalId: "thm" }],
    };
    expect(getBlockTocLabel(lesson, lesson.route![0]!)).toBeNull();
  });

  it("names a composed block only when it authors a heading", () => {
    const lesson: LessonDefinition = {
      ...base,
      route: [{ kind: "composed", componentId: "some-lab", heading: "A computational lab" }],
    };
    expect(getBlockTocLabel(lesson, lesson.route![0]!)).toBe("A computational lab");

    const unlabeled: LessonDefinition = {
      ...base,
      route: [{ kind: "composed", componentId: "some-lab" }],
    };
    expect(getBlockTocLabel(unlabeled, unlabeled.route![0]!)).toBeNull();
  });

  it("labels a named-explorationId block independently of the lesson's own explorationId", () => {
    const lesson: LessonDefinition = {
      ...base,
      // No lesson-level explorationId — only a placed, named explore block.
      route: [{ kind: "explore", explorationId: "second-explorer", heading: "A second explorer" }],
    };
    expect(getBlockTocLabel(lesson, lesson.route![0]!)).toBe("A second explorer");
  });

  it("suppresses the combined explore block's label when the lesson has no explorationId", () => {
    const lesson: LessonDefinition = {
      ...base,
      route: [{ kind: "explore", heading: "Try it yourself (never shown)" }],
    };
    expect(getBlockTocLabel(lesson, lesson.route![0]!)).toBeNull();
  });
});
