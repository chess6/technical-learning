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

  it("method-selection items declare which method(s) their post-commitment text must name", () => {
    // Every methodSelection item must declare requiredPostCommitmentCues,
    // naming real patterns above — no silent fallback to "any pattern in the
    // shared list", which would let an unrelated cue word (e.g. a calculus
    // item's rubric tripping a linear-algebra pattern by coincidence) satisfy
    // the guard without the item ever naming ITS OWN candidate method.
    const names = new Set(METHOD_CUE_PATTERNS.map((p) => p.name));
    for (const item of MODULE_ITEMS) {
      const meta = ITEM_ASSESSMENT_META[item.id];
      if (!meta?.methodSelection) continue;
      const required = meta.requiredPostCommitmentCues ?? [];
      expect(required.length, `${item.id} must declare requiredPostCommitmentCues`).toBeGreaterThan(0);
      for (const name of required) {
        expect(names.has(name), `${item.id}: unknown cue name "${name}"`).toBe(true);
      }
    }
  });

  it("method-selection items name every one of their required methods post-commitment", () => {
    // Inverse guard: the reveal/rubric MUST name each declared candidate
    // method (so the item still closes the loop on which method was
    // efficient). Generalized from a hard-coded `/eliminat/` check, which
    // would have hard-FAILED any non-linear-algebra item (a calculus item's
    // rubric never contains "eliminat") — replaced with a per-item required
    // list rather than "any pattern in the shared list", which would have
    // been strictly weaker: it could be satisfied by an unrelated cue word
    // without the item ever naming its own method.
    for (const item of MODULE_ITEMS) {
      const meta = ITEM_ASSESSMENT_META[item.id];
      if (!meta?.methodSelection) continue;
      const required = meta.requiredPostCommitmentCues ?? [];
      const cfg =
        item.type === "custom"
          ? (item.config as { modelAnswer?: string; rubricText?: string } | undefined)
          : undefined;
      const post = `${cfg?.modelAnswer ?? ""}${cfg?.rubricText ?? ""}`;
      for (const name of required) {
        const pattern = METHOD_CUE_PATTERNS.find((p) => p.name === name);
        if (!pattern) continue; // caught by the previous test
        expect(
          pattern.re.test(post),
          `${item.id} post-commitment text should name "${name}"`,
        ).toBe(true);
      }
    }
  });
});
