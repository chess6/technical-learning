import { describe, expect, it } from "vitest";
import { setNodeKind } from "../../../lessons/courseModel";
import { MODULE_SETS } from "../../../lessons/moduleSets";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

/**
 * Workshop and assessment nodes run through the SAME `ModuleRunner` with the
 * same deferred-feedback capture — there is no separate practice engine
 * (ADR-004, "Accepted target vs. implemented subset"). Two things follow, and
 * both are pinned here:
 *
 *  1. No surface may label a run with a mode the product does not have. The
 *     runner previously printed "Exam mode · feedback after submit" for BOTH
 *     kinds, telling a learner on a low-stakes workshop they were sitting an
 *     exam.
 *  2. Framing may say what a node is *for*; it must not imply the two are
 *     graded differently.
 */
const dirname = path.dirname(fileURLToPath(import.meta.url));
const runnerSource = readFileSync(
  path.resolve(dirname, "../ModuleRunner.tsx"),
  "utf8",
);

/** The JSX the learner reads, with comments stripped so guidance isn't matched. */
const runnerRendered = runnerSource
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

describe("the runner does not claim a mode the product does not have", () => {
  it("does not label a run 'Exam mode'", () => {
    expect(runnerRendered).not.toMatch(/Exam mode/);
  });

  it("describes the actual behavior instead — capture now, feedback after submit", () => {
    expect(runnerRendered).toMatch(/Answers are recorded as you go/);
    expect(runnerRendered).toMatch(/feedback after you submit/);
  });

  it("still exposes the underlying attempt mode to tests and telemetry", () => {
    // Behavior-accurate copy must not cost the machine-readable signal.
    expect(runnerRendered).toMatch(/data-mode=\{attempt\.mode\}/);
  });
});

describe("workshop / assessment framing matches actual behavior", () => {
  it("resolves each curriculum node's kind", () => {
    expect(setNodeKind("systems-elimination-transfer")).toBe("workshop");
    expect(setNodeKind("systems-elimination-mock")).toBe("assessment");
    expect(setNodeKind("not-a-placed-set")).toBeUndefined();
  });

  it("every registered set still declares the only implemented mode", () => {
    // `ModuleSet.mode: "practice"` is deferred (ADR-004). If a set ever
    // declares it, the runner's copy and this contract must be revisited
    // together rather than one drifting ahead of the other.
    for (const set of MODULE_SETS) {
      expect(set.mode, `set "${set.id}" declares an unimplemented mode`).toBe("exam");
    }
  });

  it("no `review` UnitItem kind exists yet, matching ADR-004's deferral", () => {
    // A `review` node would need per-module spaced scheduling, which does not
    // exist. Guarding the absence keeps the ADR and the runtime in step.
    const courseModelSource = readFileSync(
      path.resolve(dirname, "../../../lessons/courseModel.ts"),
      "utf8",
    );
    expect(courseModelSource).not.toMatch(/kind:\s*"review"/);
  });
});
