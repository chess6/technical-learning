import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { integralAccumulationLesson } from "../integralAccumulation";
import { IntegralAccumulationExplorer } from "../../explorations/IntegralAccumulationExplorer";
import { SCENE_META } from "../../guided-scenes/scenes/sceneMeta";
import { SCENE_SEGMENTS } from "../../guided-scenes/scenes/sceneTimings";

/**
 * Package A ledger check **P1**: no antiderivative anywhere in
 * `integral-accumulation`.
 *
 * L4's whole value is that the connection between the two operations is
 * *discovered*. Naming it in L3 — in prose, a caption, an explorer readout, or a
 * feedback string — spends the package's central payoff for nothing, and it is
 * the single thing an implementer working from habit is most likely to do. The
 * ledger asks for a grep over the built lesson rather than an inspection, so
 * here it is.
 *
 * The check runs over everything a **learner can read**: every string in the
 * lesson definition, the scene's chapter titles and summaries, the scene's
 * accessible description, and the explorer's rendered text. Source comments are
 * deliberately out of scope — this file's own header names the forbidden term,
 * and so does the scene module's, to explain why they must not appear on screen.
 */

/**
 * Terms that would give the game away. `\int f = F(b) - F(a)` is included in
 * spirit by the `F(b)` pattern: the evaluation notation is the theorem's
 * statement even when the word is absent.
 */
const FORBIDDEN: readonly { pattern: RegExp; why: string }[] = [
  { pattern: /anti-?derivative/i, why: "names the antiderivative" },
  { pattern: /\bindefinite integral\b/i, why: "names the indefinite integral" },
  { pattern: /fundamental theorem/i, why: "names the Fundamental Theorem" },
  {
    pattern: /F\s*\(\s*b\s*\)\s*[-−]\s*F\s*\(\s*a\s*\)/,
    why: "writes the evaluation shortcut F(b) − F(a)",
  },
  {
    // `[F(x)]_a^b`, in KaTeX or in plain text.
    pattern: /\\Big\]|\\right\]_\{?[a-z]\}?\^/,
    why: "writes the evaluation bracket notation",
  },
];

function offences(label: string, text: string): string[] {
  return FORBIDDEN.filter((rule) => rule.pattern.test(text)).map(
    (rule) => `${label} ${rule.why}`,
  );
}

describe("P1 — integral-accumulation names no antiderivative", () => {
  it("keeps it out of every string in the lesson definition", () => {
    // JSON.stringify walks prose, captions, layer bodies, exercise prompts,
    // accepted answers, explanations, hints, reveals, and the summary alike.
    const serialized = JSON.stringify(integralAccumulationLesson);
    expect(offences("the lesson definition", serialized)).toEqual([]);
  });

  it("keeps it out of the guided scene's chapters and description", () => {
    const segments = SCENE_SEGMENTS["integral-accumulation"];
    expect(segments, "the scene must be registered").toBeDefined();
    const chapters = JSON.stringify(segments);
    expect(offences("the scene's chapters", chapters)).toEqual([]);

    const meta = SCENE_META["integral-accumulation"];
    expect(meta, "the scene must have metadata").toBeDefined();
    expect(offences("the scene's accessible description", meta!.ariaLabel)).toEqual([]);
  });

  it("keeps it out of everything the explorer renders", () => {
    const { container } = render(<IntegralAccumulationExplorer />);
    const text = container.textContent ?? "";
    expect(text.length, "the explorer rendered nothing to check").toBeGreaterThan(50);
    expect(offences("the explorer", text)).toEqual([]);
  });

  it("catches the term when it IS present, so the check is not vacuous", () => {
    // A guard on the guard. A regex that matched nothing would pass every test
    // above while enforcing nothing at all.
    expect(offences("a probe", "use the antiderivative F(b) - F(a)")).toHaveLength(2);
    expect(offences("a probe", "the Fundamental Theorem of Calculus")).toHaveLength(1);
  });
});
