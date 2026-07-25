import { describe, expect, it } from "vitest";
import { redBlackTreesLesson } from "../redBlackTrees";
import { describeGradingContract, type NamedAnswer } from "./gradingContract";
import { resolveCapabilityId } from "../capabilities";
import type { ExerciseDefinition } from "../types";

/**
 * Grading contracts for the Red–Black Trees lesson's auto-graded items.
 *
 * Every reject below is a wrong answer a learner would plausibly *produce*, not
 * noise: the arity read after insertion rather than before, "has room ⇒ nothing
 * to do" (which misses the orientation half), the black count read from the node
 * exclusive rather than externally, and — twice — the misconception that a
 * red-red pair is a five-key node.
 */

function byId(id: string): ExerciseDefinition {
  const found = redBlackTreesLesson.exercises?.find((ex) => ex.id === id);
  if (!found) throw new Error(`no red-black exercise "${id}"`);
  return found;
}

const num = (value: number) => ({ kind: "numeric", value });
const text = (value: string) => ({ kind: "text", value });
const choice = (index: number) => ({ kind: "multiple-choice", choice: index });
const responses = (...items: unknown[]): NamedAnswer["answer"] =>
  ({ responses: items } as NamedAnswer["answer"]);

describeGradingContract(byId("rbt-encode-decode"), {
  mustAccept: [
    { name: "3-node root, 4-node right, four nodes, bh 2", answer: responses(num(2), num(3), num(4), num(2)) },
  ],
  mustReject: [
    { name: "all blank", answer: { responses: [] } },
    { name: "zero-filled", answer: responses(num(0), num(0), num(0), num(0)) },
    {
      name: "counts red children as separate nodes, not as keys",
      answer: responses(num(1), num(1), num(7), num(2)),
    },
    {
      name: "black height read as the tree's height in edges",
      answer: responses(num(2), num(3), num(4), num(3)),
    },
    {
      name: "reads the 4-node as a 5-node — the lesson's misconception",
      answer: responses(num(2), num(5), num(4), num(2)),
    },
  ],
});

describeGradingContract(byId("rbt-classify-repair"), {
  mustAccept: [
    { name: "node {11,14}, arity 3, rotation", answer: responses(text("11, 14"), num(3), choice(0)) },
    { name: "same, unspaced", answer: responses(text("11,14"), num(3), choice(0)) },
  ],
  mustReject: [
    { name: "all blank", answer: { responses: [] } },
    {
      name: "arity read AFTER insertion, not before",
      answer: responses(text("11, 14"), num(4), choice(0)),
    },
    {
      name: "“it has room, so nothing to do” — misses the orientation half",
      answer: responses(text("11, 14"), num(3), choice(1)),
    },
    {
      name: "assumes a split because reds are involved",
      answer: responses(text("11, 14"), num(3), choice(2)),
    },
    {
      name: "descends into the wrong subtree",
      answer: responses(text("4, 6"), num(3), choice(0)),
    },
  ],
});

describeGradingContract(byId("rbt-bare-rotation-diagnose"), {
  mustAccept: [
    { name: "order unchanged, path to 10, count 3, paired recolour", answer: responses(choice(0), num(10), num(3), choice(0)) },
  ],
  mustReject: [
    { name: "all blank", answer: { responses: [] } },
    {
      name: "believes the rotation damaged the ordering",
      answer: responses(choice(1), num(10), num(3), choice(0)),
    },
    {
      name: "names a path that did not change",
      answer: responses(choice(0), num(70), num(3), choice(0)),
    },
    {
      name: "reports the count the other paths still have",
      answer: responses(choice(0), num(10), num(2), choice(0)),
    },
    {
      name: "reaches for a second rotation instead of the recolour",
      answer: responses(choice(0), num(10), num(3), choice(1)),
    },
    {
      name: "expects the tree to fix itself later",
      answer: responses(choice(0), num(10), num(3), choice(3)),
    },
  ],
});

describeGradingContract(byId("rbt-root-split"), {
  mustAccept: [
    { name: "40 raises it, final bh 2, external-height reason", answer: responses(num(40), num(2), choice(0)) },
  ],
  mustReject: [
    { name: "all blank", answer: { responses: [] } },
    { name: "zero-filled", answer: responses(num(0), num(0), choice(0)) },
    {
      name: "names the first key, assuming every split raises it",
      answer: responses(num(10), num(2), choice(0)),
    },
    {
      name: "reports the tree's height instead of its black height",
      answer: responses(num(40), num(3), choice(0)),
    },
    {
      name: "right numbers, wrong reason (only the root may be black)",
      answer: responses(num(40), num(2), choice(1)),
    },
  ],
});

describeGradingContract(byId("rbt-btree-transfer"), {
  mustAccept: [{ name: "promote 14, two keys per half", answer: responses(num(14), num(2)) }],
  mustReject: [
    { name: "all blank", answer: { responses: [] } },
    { name: "zero-filled", answer: responses(num(0), num(0)) },
    {
      name: "promotes the smallest key",
      answer: responses(num(5), num(2)),
    },
    {
      name: "promotes the middle but miscounts the halves",
      answer: responses(num(14), num(3)),
    },
    {
      name: "applies the 2–3–4 answer verbatim rather than re-deriving it",
      answer: responses(num(9), num(2)),
    },
  ],
});

describeGradingContract(byId("rbt-colour-recall"), {
  mustAccept: [{ name: "membership marker", answer: { choice: 0 } }],
  mustReject: [
    { name: "recency", answer: { choice: 1 } },
    { name: "which side it hangs off", answer: { choice: 2 } },
    { name: "depth", answer: { choice: 3 } },
  ],
});

describe("the red-black assessment set matches the mastery contract", () => {
  const exercises = redBlackTreesLesson.exercises ?? [];

  it("caps pure recall at one item", () => {
    const recall = exercises.filter((ex) => ex.tier === "check");
    expect(recall).toHaveLength(1);
    expect(recall[0]!.id).toBe("rbt-colour-recall");
  });

  it("carries the two human-scored proof items, and only those", () => {
    const selfChecks = exercises.filter(
      (ex) => ex.type === "custom" && resolveCapabilityId(ex) === "self-check",
    );
    expect(selfChecks.map((ex) => ex.id).sort()).toEqual([
      "rbt-external-bh-explain",
      "rbt-height-induction-step",
    ]);
  });

  it("owns a genuine transfer item at an unseen branching order", () => {
    const transfer = exercises.find((ex) => ex.id === "rbt-btree-transfer")!;
    expect(transfer.tier).toBe("transfer");
    // The lesson only ever draws 2–3–4 nodes; the item must not.
    expect("prompt" in transfer ? transfer.prompt : "").toMatch(/five/i);
  });

  it("confronts each named misconception somewhere assessable", () => {
    const calloutIds = new Set((redBlackTreesLesson.callouts ?? []).map((c) => c.id));
    for (const id of [
      "red-red-is-not-a-five-node",
      "bare-rotation-is-safe",
      "violation-token-is-conserved",
      "recolour-raises-the-tree",
    ]) {
      expect(calloutIds.has(id), `missing callout "${id}"`).toBe(true);
    }
    // …and the two sharpest are also graded, not just narrated.
    expect(exercises.some((ex) => ex.id === "rbt-bare-rotation-diagnose")).toBe(true);
    expect(exercises.some((ex) => ex.id === "rbt-root-split")).toBe(true);
  });
});
