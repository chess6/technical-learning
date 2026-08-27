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

  it("recognizes L7's audited PASS without reopening the now-built lesson", () => {
    const output = buildTaskContext({root, mode: "C", lesson: "substitution-parts"});

    expect(output).toContain("insight.md`: PASS");
    expect(output).toContain("Lifecycle: `built`");
    expect(output).toContain("ALREADY BUILT");
    expect(output).not.toContain("READY for Mode C");
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

  it("maps every implementation contract by section and line number", () => {
    const output = buildTaskContext({
      root,
      mode: "C",
      lesson: "optimization-approximation",
      course: "applied-mathematics",
    });
    // Each artifact is navigable: the pack names it, sizes it, and lists its
    // headings with line numbers so a reader opens two sections, not the file.
    for (const artifact of ["insight-brief.md", "insight.md", "mastery-contract.md", "lesson-plan.md"]) {
      expect(output).toContain(`**\`${artifact}\`**`);
    }
    expect(output).toMatch(/- L\d+: /);
    // The decisions of record are quoted verbatim rather than pointed at.
    expect(output).toContain("Verbatim from `insight.md`");
    expect(output).toContain("Gate result");
    expect(output).toContain("Verbatim from `mastery-contract.md`");
    expect(output).toContain("Verbatim from `lesson-plan.md`");
  });

  it("resolves lifecycle from the numbered directory name, not only the spine id", () => {
    const prefixed = buildTaskContext({root, mode: "C", lesson: "07-substitution-parts"});
    const bare = buildTaskContext({root, mode: "C", lesson: "substitution-parts"});
    // A caller who pastes the directory name must get the same readiness verdict;
    // reporting "not listed"/READY for a built lesson invites a duplicate build.
    expect(prefixed).toContain("Lifecycle: `built`");
    expect(prefixed).toContain("ALREADY BUILT");
    expect(prefixed).toBe(bare);
  });

  it("stays below the 3,000-word cold-context ceiling", () => {
    const output = buildTaskContext({root, mode: "C", lesson: "substitution-parts"});
    expect(output.trim().split(/\s+/).length).toBeLessThanOrEqual(3000);
  });
});
