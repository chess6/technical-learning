import { describe, expect, it } from "vitest";
import { binarySearchTreesLesson } from "../binarySearchTrees";
import { describeGradingContract, type NamedAnswer } from "./gradingContract";
import { resolveCapabilityId } from "../capabilities";
import type { ExerciseDefinition } from "../types";

/**
 * Grading contracts for the Binary Search Trees lesson's auto-graded items.
 *
 * The repo's mandatory contract harness is scoped to MODULE_ITEMS, so these are
 * not owed — but every item below is a chain of numeric sub-steps, which is
 * exactly the shape the recurring defect classes bite: a blank coerced to 0, a
 * zero-filled answer credited, or a mathematically-*related* wrong value slipping
 * through. Each `mustReject` entry pins one of those.
 */

function byId(id: string): ExerciseDefinition {
  const found = binarySearchTreesLesson.exercises?.find((ex) => ex.id === id);
  if (!found) throw new Error(`no BST exercise "${id}"`);
  return found;
}

const seq = (...responses: Array<number | string>): NamedAnswer["answer"] => ({
  responses: responses.map((value) =>
    typeof value === "number"
      ? { kind: "numeric", value }
      : { kind: "text", value },
  ),
});

/** A multiple-choice sub-step response. */
const choice = (index: number) => ({ kind: "multiple-choice", choice: index });

describeGradingContract(byId("bst-search-trace"), {
  mustAccept: [{ name: "the real comparison sequence 31, 12, 20 (cost 3)", answer: seq(31, 12, 20, 3) }],
  mustReject: [
    // The defect classes, one per row.
    { name: "all blank", answer: { responses: [] } },
    { name: "zero-filled", answer: seq(0, 0, 0, 0) },
    {
      name: "right keys, wrong order (the path is the point)",
      answer: seq(12, 31, 20, 3),
    },
    {
      name: "correct path but cost counted as depth, not depth + 1",
      answer: seq(31, 12, 20, 2),
    },
    {
      name: "sorted-order keys rather than the insertion order's root",
      answer: seq(7, 12, 20, 3),
    },
  ],
});

describeGradingContract(byId("bst-order-predicts-shape"), {
  mustAccept: [
    { name: "balanced 3, chain 7, same readout", answer: seq(3, 7, "yes") },
  ],
  mustReject: [
    { name: "all blank", answer: { responses: [] } },
    { name: "zero-filled", answer: seq(0, 0, "no") },
    {
      name: "heights instead of comparison counts (off by one, both)",
      answer: seq(2, 6, "yes"),
    },
    {
      name: "log2(7) rounded — the O(log n) reflex, on a chain",
      answer: seq(3, 3, "yes"),
    },
    {
      name: "correct costs but claims the readouts differ",
      answer: seq(3, 7, "no"),
    },
  ],
});

describeGradingContract(byId("bst-invalid-local-check"), {
  mustAccept: [
    {
      name: "key 20, interval (25, 30), ancestor reason",
      answer: {
        responses: [
          { kind: "numeric", value: 20 },
          { kind: "numeric", value: 25 },
          { kind: "numeric", value: 30 },
          choice(0),
        ],
      },
    },
  ],
  mustReject: [
    { name: "all blank", answer: { responses: [] } },
    {
      name: "zero-filled interval (blank is not 0 — and 0 is a legal key value)",
      answer: {
        responses: [
          { kind: "numeric", value: 20 },
          { kind: "numeric", value: 0 },
          { kind: "numeric", value: 0 },
          choice(0),
        ],
      },
    },
    {
      name: "blames the parent 30 rather than the misplaced key",
      answer: {
        responses: [
          { kind: "numeric", value: 30 },
          { kind: "numeric", value: 25 },
          { kind: "numeric", value: 30 },
          choice(0),
        ],
      },
    },
    {
      name: "interval taken from the parent alone — the misconception itself",
      answer: {
        responses: [
          { kind: "numeric", value: 20 },
          { kind: "numeric", value: 10 },
          { kind: "numeric", value: 30 },
          choice(0),
        ],
      },
    },
    {
      name: "right numbers, wrong reason (balance)",
      answer: {
        responses: [
          { kind: "numeric", value: 20 },
          { kind: "numeric", value: 25 },
          { kind: "numeric", value: 30 },
          choice(2),
        ],
      },
    },
  ],
});

describeGradingContract(byId("bst-construct-minimum-height"), {
  mustAccept: [
    {
      name: "median root 16, height 2, counting bound",
      answer: {
        responses: [
          { kind: "numeric", value: 16 },
          { kind: "numeric", value: 2 },
          choice(0),
        ],
      },
    },
  ],
  mustReject: [
    { name: "all blank", answer: { responses: [] } },
    {
      name: "zero-filled",
      answer: {
        responses: [
          { kind: "numeric", value: 0 },
          { kind: "numeric", value: 0 },
          choice(0),
        ],
      },
    },
    {
      name: "the first key of the sorted array, not the median",
      answer: {
        responses: [
          { kind: "numeric", value: 4 },
          { kind: "numeric", value: 2 },
          choice(0),
        ],
      },
    },
    {
      name: "median root, but height counted in levels rather than edges",
      answer: {
        responses: [
          { kind: "numeric", value: 16 },
          { kind: "numeric", value: 3 },
          choice(0),
        ],
      },
    },
    {
      name: "right answer, circular justification",
      answer: {
        responses: [
          { kind: "numeric", value: 16 },
          { kind: "numeric", value: 2 },
          choice(1),
        ],
      },
    },
  ],
});

describeGradingContract(byId("bst-choose-structure"), {
  mustAccept: [{ name: "sorted array, because sorted input degenerates the tree", answer: { choice: 0 } }],
  mustReject: [
    { name: "tree, assuming logarithmic search", answer: { choice: 1 } },
    { name: "tree, for a true but irrelevant reason", answer: { choice: 2 } },
    { name: "either — the misconception this lesson breaks", answer: { choice: 3 } },
  ],
});

describeGradingContract(byId("bst-invariant-recall"), {
  mustAccept: [{ name: "the correctness condition of a decision procedure", answer: { choice: 0 } }],
  mustReject: [
    { name: "memory layout", answer: { choice: 1 } },
    { name: "implies balance", answer: { choice: 2 } },
    { name: "arbitrary convention", answer: { choice: 3 } },
  ],
});

describe("BST assessment set matches what the mastery contract promised", () => {
  const exercises = binarySearchTreesLesson.exercises ?? [];

  it("caps pure recall at one item", () => {
    const recall = exercises.filter((ex) => ex.tier === "check");
    expect(recall).toHaveLength(1);
    expect(recall[0]!.id).toBe("bst-invariant-recall");
  });

  it("covers check, drill, and transfer tiers", () => {
    const tiers = new Set(exercises.map((ex) => ex.tier));
    expect(tiers.has("check")).toBe(true);
    expect(tiers.has("drill")).toBe(true);
    expect(tiers.has("transfer")).toBe(true);
  });

  it("carries the two human-scored proof items, and only those", () => {
    const selfChecks = exercises.filter(
      (ex) => ex.type === "custom" && resolveCapabilityId(ex) === "self-check",
    );
    expect(selfChecks.map((ex) => ex.id).sort()).toEqual([
      "bst-height-induction-step",
      "bst-inorder-why",
    ]);
  });

  it("keeps every graded item off the scene's key set", () => {
    // The Watch scene lifts 4, 8, 15, 16, 23, 42, 50 and searches 23. An item
    // reusing that exact instance would measure recall of the animation.
    const sceneTrace = "4, 8, 15, 16, 23, 42, 50";
    for (const ex of exercises) {
      if (ex.id === "bst-construct-minimum-height") continue; // deliberately the same keys, a different task
      expect(
        "prompt" in ex ? ex.prompt : "",
        `${ex.id} reuses the scene's instance`,
      ).not.toContain(sceneTrace);
    }
  });
});
