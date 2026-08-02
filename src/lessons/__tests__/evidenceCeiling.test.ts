import { describe, expect, it } from "vitest";
import { MODULE_ITEMS } from "../moduleItems";
import { lessons } from "../registry";
import { gradingCapabilities, resolveCapabilityId } from "../capabilities";
import {
  CAPABILITY_EVIDENCE_CEILING,
  EVIDENCE_ORDER,
  withinCeiling,
  type EvidenceLevel,
} from "../evidence";
import { ITEM_ASSESSMENT_META, evidenceContradictions } from "../assessmentManifest";
import { SUPPORTED_CAPTURE_KINDS } from "../../components/assessment/captureRenderers";

describe("evidence ceilings are necessary upper bounds", () => {
  /**
   * The manifest covers module items PLUS the lesson exercises named by a
   * lesson-owned objective's `itemIds`. It grew beyond `MODULE_ITEMS` when
   * `objectiveCoverage.test.ts` stopped accepting a capability ceiling as
   * evidence: an objective's evidencing item must now carry an explicit claim,
   * and this manifest is the one place claims live. Keeping both kinds here
   * rather than starting a second lesson-side registry is deliberate — two
   * registries drift, and the drift would be silent.
   */
  it("covers exactly MODULE_ITEMS plus objective-referenced lesson exercises", () => {
    const objectiveItemIds = lessons.flatMap((lesson) =>
      (lesson.objectives ?? [])
        .filter((o) => o.evidence === "lesson-owned")
        .flatMap((o) => o.itemIds ?? []),
    );
    const expected = [...new Set([...MODULE_ITEMS.map((i) => i.id), ...objectiveItemIds])].sort();
    expect(Object.keys(ITEM_ASSESSMENT_META).sort()).toEqual(expected);
  });

  it("every registered grading capability declares an evidence ceiling", () => {
    for (const id of Object.keys(gradingCapabilities)) {
      expect(CAPABILITY_EVIDENCE_CEILING[id], `no ceiling for capability "${id}"`).toBeDefined();
    }
  });

  it("every capture-renderable kind declares an evidence ceiling", () => {
    for (const id of SUPPORTED_CAPTURE_KINDS) {
      expect(CAPABILITY_EVIDENCE_CEILING[id], `no ceiling for capture kind "${id}"`).toBeDefined();
    }
  });

  it("no item claims an evidence level above its capability's ceiling", () => {
    for (const item of MODULE_ITEMS) {
      const capId = resolveCapabilityId(item);
      const claim = ITEM_ASSESSMENT_META[item.id]!.evidenceTarget;
      const ceiling = CAPABILITY_EVIDENCE_CEILING[capId]!;
      expect(
        withinCeiling(claim, ceiling),
        `${item.id} claims ${claim} but capability "${capId}" can capture at most ${ceiling}`,
      ).toBe(true);
    }
  });

  it("every produced-evidence item (E3+) is renderable by the module runner", () => {
    for (const item of MODULE_ITEMS) {
      const claim = ITEM_ASSESSMENT_META[item.id]!.evidenceTarget;
      if (EVIDENCE_ORDER[claim] < EVIDENCE_ORDER.E3) continue;
      expect(
        SUPPORTED_CAPTURE_KINDS.includes(resolveCapabilityId(item)),
        `${item.id} claims ${claim} but its capability is not capture-renderable`,
      ).toBe(true);
    }
  });
});

describe("evidenceBasis contradiction filter (rejects impossible claims; does NOT certify)", () => {
  // A high (E4/E5) claim must not be self-contradicted by its own basis. Passing
  // this does NOT certify the claim — it only rules out impossible/contradictory
  // ones; the affirmative warrant is the contract reviewer's judgment.
  it("no E4/E5 claim is contradicted by heavy scaffolding, a reused fixture, a familiar drill, or self-marking", () => {
    const problems: string[] = [];
    for (const item of MODULE_ITEMS) {
      const meta = ITEM_ASSESSMENT_META[item.id]!;
      // Shared with objectiveCoverage — one definition, level-aware.
      const contradictions = evidenceContradictions(meta.evidenceTarget, meta.evidenceBasis);
      if (contradictions.length > 0) {
        problems.push(`${item.id} claims ${meta.evidenceTarget} but basis has: ${contradictions.join(", ")}`);
      }
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });

  it("declares a coherent EvidenceLevel for every item", () => {
    const valid = new Set<EvidenceLevel>(["E1", "E2", "E3", "E4", "E5"]);
    for (const item of MODULE_ITEMS) {
      expect(valid.has(ITEM_ASSESSMENT_META[item.id]!.evidenceTarget), item.id).toBe(true);
    }
  });
});
