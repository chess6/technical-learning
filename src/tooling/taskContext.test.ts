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

  it("recognizes the audited bold PASS verdict for L7", () => {
    const output = buildTaskContext({root, mode: "C", lesson: "substitution-parts"});

    expect(output).toContain("insight.md`: PASS");
    expect(output).toContain("READY for Mode C");
    expect(output).not.toContain("BLOCKED for Mode C");
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

  it("does not reopen an already-built lesson for Mode C", () => {
    const output = buildTaskContext({
      root,
      mode: "C",
      lesson: "optimization-approximation",
      course: "applied-mathematics",
    });
    expect(output).toContain("Lifecycle: `built`");
    expect(output).toContain("ALREADY BUILT");
    expect(output).not.toContain("READY for Mode C");
  });

  it("initializes Mode B for a future lesson with no existing directory", () => {
    const output = buildTaskContext({
      root,
      mode: "B",
      lesson: "sequences-limits",
      course: "applied-mathematics",
    });
    expect(output).toContain("READY to initialize Mode B at Gate 3");
    expect(output).toContain(
      "docs/courses/applied-mathematics/lessons/09-sequences-limits/insight-brief.md",
    );
    expect(output).not.toContain("docs/courses/applied-mathematics/lessons/sequences-limits/");
  });

  it("balances signals across all four implementation contracts", () => {
    const output = buildTaskContext({
      root,
      mode: "C",
      lesson: "optimization-approximation",
      course: "applied-mathematics",
    });
    expect(output).toContain("- mastery-contract.md:");
    expect(output).toContain("- lesson-plan.md:");
    expect(output).toContain("lesson-plan.md: ## Route");
  });

  it("stays below the 3,000-word cold-context ceiling", () => {
    const output = buildTaskContext({root, mode: "C", lesson: "substitution-parts"});
    expect(output.trim().split(/\s+/).length).toBeLessThanOrEqual(3000);
  });
});
