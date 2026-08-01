import { describe, expect, it } from "vitest";
import { MODULE_ITEMS } from "../moduleItems";
import { ITEM_ASSESSMENT_META } from "../assessmentManifest";

/**
 * Method-name cue terms. An item whose POINT is choosing the method
 * (`methodSelection: true`) must not name any of these in learner-facing,
 * pre-commitment text (prompt + hints). Post-commitment surfaces (modelAnswer,
 * rubricText, explanation) are exempt — they SHOULD name the methods.
 * Supersedes the ad-hoc `/reachability|elimination/` check formerly in
 * moduleItems.test.ts.
 */
const METHOD_CUE_PATTERNS: readonly { name: string; re: RegExp }[] = [
  { name: "elimination", re: /eliminat/i },
  { name: "row operation", re: /row[\s-]*operation/i },
  { name: "row reduce", re: /row[\s-]*reduc/i },
  { name: "pivot", re: /pivot/i },
  { name: "echelon", re: /echelon/i },
  { name: "reachability", re: /reachab/i },
  { name: "back substitution", re: /back[\s-]*substitut/i },
  { name: "column span", re: /column[\s-]*span/i },
  // calculus-foundations (Gate 9) — added alongside mod-calcfound-select-method.
  { name: "antiderivative", re: /antideriv/i },
  { name: "Riemann sum", re: /riemann/i },
  { name: "Fundamental Theorem / FTC", re: /fundamental theorem|\bFTC\b/i },
  { name: "telescoping", re: /telescop/i },
  { name: "difference quotient", re: /difference quotient/i },
  { name: "symmetry/odd function", re: /symmetr|\bodd function/i },
  { name: "partition", re: /partition/i },
  { name: "bracket", re: /bracket/i },
  { name: "substitution", re: /substitut/i },
];

describe("cue-lint — method-selection prompts must not name the method", () => {
  it("no method-selection item cues a candidate method in learner-facing text", () => {
    const problems: string[] = [];
    for (const item of MODULE_ITEMS) {
      const meta = ITEM_ASSESSMENT_META[item.id];
      if (!meta?.methodSelection) continue;
      const allow = new Set(meta.cueAllowlist ?? []);
      const learnerFacing = [item.prompt, ...(item.hints ?? [])].join("\n");
      for (const { name, re } of METHOD_CUE_PATTERNS) {
        if (allow.has(name)) continue;
        if (re.test(learnerFacing)) {
          problems.push(
            `${item.id}: prompt/hints cue the method "${name}" ` +
              `(add to cueAllowlist only with a review-visible reason)`,
          );
        }
      }
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });

  it("method-selection items still teach the method names post-commitment", () => {
    // Inverse guard: the reveal/rubric MUST name at least one candidate method
    // (so the item still closes the loop on which method was efficient).
    // Generalized from a hard-coded `/eliminat/` check, which vacuously passed
    // any non-linear-algebra item — this now tests against the SAME pattern
    // list the forward check protects the prompt from, so a new module's
    // method-selection item is covered the moment its cues are added above.
    for (const item of MODULE_ITEMS) {
      if (!ITEM_ASSESSMENT_META[item.id]?.methodSelection) continue;
      const cfg =
        item.type === "custom"
          ? (item.config as { modelAnswer?: string; rubricText?: string } | undefined)
          : undefined;
      const post = `${cfg?.modelAnswer ?? ""}${cfg?.rubricText ?? ""}`;
      const namesAMethod = METHOD_CUE_PATTERNS.some(({ re }) => re.test(post));
      expect(namesAMethod, `${item.id} post-commitment text should name at least one candidate method`).toBe(
        true,
      );
    }
  });
});
