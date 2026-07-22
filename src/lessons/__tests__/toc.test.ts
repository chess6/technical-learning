import { describe, expect, it } from "vitest";
import { chapter0Lesson } from "../chapter0";
import { vectorsLesson } from "../vectors";
import {
  flattenLessonToc,
  getLessonTocTree,
} from "../toc";

describe("getLessonTocTree", () => {
  it("nests Chapter 0 sections under the preceding primary phases", () => {
    const tree = getLessonTocTree(chapter0Lesson);
    expect(tree.map((item) => item.label)).toEqual([
      "Think about it",
      "Watch the idea",
      "Try it yourself",
    ]);
    expect(tree[1]!.children?.map((c) => c.label)).toEqual([
      "Four numbers move a whole graphic",
    ]);
    expect(tree[2]!.children?.map((c) => c.label)).toEqual([
      "The same idea, everywhere",
      "One move four numbers can't make",
      "The question this course opens with",
    ]);
  });

  it("keeps flattened anchors unique and stable", () => {
    const flat = flattenLessonToc(getLessonTocTree(chapter0Lesson));
    const ids = flat.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("motivate-0");
    expect(ids).toContain("section-mystery");
    expect(ids).toContain("formal-ch0-open-question");
  });

  it("builds a nested TOC for a content lesson with interleaved sections", () => {
    const tree = getLessonTocTree(vectorsLesson);
    expect(flattenLessonToc(tree).length).toBeGreaterThanOrEqual(3);
    // At least one primary phase should carry nested children.
    expect(tree.some((item) => (item.children?.length ?? 0) > 0)).toBe(true);
  });
});
