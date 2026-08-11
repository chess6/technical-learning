import {resolve} from "node:path";
import {describe, expect, it} from "vitest";
import {buildTaskContext, parseTaskArgs} from "../../scripts/task-context.mjs";

const root = resolve(import.meta.dirname, "../..");

describe("task context generator", () => {
  it("parses the bounded CLI contract", () => {
    expect(parseTaskArgs(["--mode", "c", "--lesson", "substitution-parts"])).toEqual({
      mode: "C",
      lesson: "substitution-parts",
      course: undefined,
    });
    expect(() => parseTaskArgs(["--mode", "C"])).toThrow("--lesson is required");
    expect(() => parseTaskArgs(["--mode", "E", "--lesson", "x"])).toThrow(
      "--mode must be A, B, C, or D",
    );
  });

  it("fails closed when Mode C gates are incomplete", () => {
    const output = buildTaskContext({root, mode: "C", lesson: "substitution-parts"});

    expect(output).toContain("BLOCKED for Mode C");
    expect(output).toContain("insight.md with Gate result: PASS");
    expect(output).toContain("mastery-contract.md");
    expect(output).toContain("lesson-plan.md");
  });

  it("includes the requested bounded task surfaces", () => {
    const output = buildTaskContext({root, mode: "C", lesson: "substitution-parts"});

    expect(output).toContain("Package ledger");
    expect(output).toContain("chain-rule");
    expect(output).toContain("first-order-odes");
    expect(output).toContain("Likely affected files");
    expect(output).toContain("Applicable known-failure modes");
    expect(output).toContain("Branch and diff");
    expect(output).toContain("Exact verification");
  });

  it("stays below the 3,000-word cold-context ceiling", () => {
    const output = buildTaskContext({root, mode: "C", lesson: "substitution-parts"});
    expect(output.trim().split(/\s+/).length).toBeLessThanOrEqual(3000);
  });
});
