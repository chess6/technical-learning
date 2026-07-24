/**
 * Assessment manifest (ADR-002 safeguard) — per-item metadata that carries the
 * judgment a capability id cannot: the CLAIMED evidence level, the affirmative
 * `evidenceBasis` that warrants an E4/E5 claim, and whether the item's point is
 * method SELECTION (so its prompt must not name the candidate methods).
 *
 * This is a MANIFEST, deliberately separate from `ExerciseDefinition`, so the
 * lesson/authoring types stay untouched and the metadata that safeguards review
 * lives in one reviewable table. `evidenceCeiling.test.ts` asserts this covers
 * exactly `MODULE_ITEMS`, that no claim exceeds its capability ceiling, and that
 * an E4/E5 claim is not self-contradicted by its basis. `cueLint.test.ts` uses
 * `methodSelection` + `cueAllowlist`.
 */

import type { EvidenceLevel } from "./evidence";

/**
 * The affirmative grounds for an item's evidence claim. The evidence-ceiling test
 * rejects an E4/E5 claim whose basis CONTRADICTS it (heavy scaffolding, a reused
 * fixture, a familiar drill, or self-marked scoring). Passing that filter does
 * NOT certify E4/E5 — it only rules out impossible/contradictory claims; the
 * affirmative warrant is the contract reviewer's judgment.
 */
export type EvidenceBasis = {
  /** Is the problem instance novel to the learner, or a reused lesson fixture? */
  freshness: "fresh-instance" | "reused-fixture";
  /** Distance of the context from the taught surface. */
  unfamiliarity: "transfer" | "near" | "familiar-drill";
  /** Does it integrate multiple lesson outcomes, or exercise one in isolation? */
  integration: "integrated" | "single-outcome";
  /** How much cueing / step support is present. */
  scaffolding: "none" | "partial" | "heavy";
  /** Who certifies correctness. */
  scoringAuthority: "auto" | "human-scored" | "self-marked";
};

export type ItemAssessmentMeta = {
  /** The evidence level this item CLAIMS to produce (≤ its capability ceiling). */
  evidenceTarget: EvidenceLevel;
  /** True ⇒ the prompt must not name candidate methods (cue-lint). */
  methodSelection: boolean;
  /** Cue terms permitted in this item's prompt despite protection (escape hatch). */
  cueAllowlist?: readonly string[];
  /** The affirmative grounds for the claim. */
  evidenceBasis: EvidenceBasis;
};

export const ITEM_ASSESSMENT_META: Record<string, ItemAssessmentMeta> = {
  // Package G — produced / human-scored items.
  "mod-select-method": {
    evidenceTarget: "E3",
    methodSelection: true,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "transfer",
      integration: "integrated",
      scaffolding: "none",
      scoringAuthority: "human-scored",
    },
  },
  "mod-transfer-classify": {
    evidenceTarget: "E4",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "transfer",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "human-scored",
    },
  },
  "mod-transfer-solset-fresh": {
    evidenceTarget: "E4",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "transfer",
      integration: "integrated",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  "mod-cumulative-elim-solset": {
    evidenceTarget: "E5",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "transfer",
      integration: "integrated",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  "mod-error-diagnose": {
    evidenceTarget: "E4",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "transfer",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "human-scored",
    },
  },
  "mod-proof-hyp": {
    evidenceTarget: "E5",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "transfer",
      integration: "integrated",
      scaffolding: "none",
      scoringAuthority: "human-scored",
    },
  },
  "mod-p2-applied-3x3": {
    evidenceTarget: "E4",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "transfer",
      integration: "integrated",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  "mod-p2-applied-rect": {
    evidenceTarget: "E4",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "transfer",
      integration: "integrated",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  // Package H — spaced retrieval (recognition; retention signal, not new evidence).
  "mod-spaced-trichotomy": {
    evidenceTarget: "E1",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "near",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  "mod-spaced-uniqueness": {
    evidenceTarget: "E1",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "near",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  "mod-spaced-rowops": {
    evidenceTarget: "E1",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "near",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
};
