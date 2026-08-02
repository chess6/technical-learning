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

import { EVIDENCE_ORDER, type EvidenceLevel } from "./evidence";

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
  /**
   * Required for every `methodSelection: true` item. Names (from
   * `cueLint.test.ts`'s `METHOD_CUE_PATTERNS`) that the item's post-commitment
   * text (`modelAnswer`/`rubricText`) must name. Deliberately per-item, not
   * "any pattern in the shared list" — a loose "any" check lets an unrelated
   * cue word (e.g. a calculus item's post-commitment text tripping a
   * linear-algebra pattern by coincidence) silently satisfy the guard without
   * the item ever naming ITS OWN candidate method, which defeats the guard's
   * purpose of closing the loop on which method was efficient.
   */
  requiredPostCommitmentCues?: readonly string[];
  /** The affirmative grounds for the claim. */
  evidenceBasis: EvidenceBasis;
};

/**
 * Grounds on which a claim at `level` is self-contradicted by its own basis.
 *
 * **Level-aware by design.** A reused fixture and a familiar drill are exactly
 * what E2/E3 recognition and fluency items are *supposed* to be — flagging them
 * everywhere would reject the whole drill tier. They only contradict a claim of
 * TRANSFER (E4+), where the point is a fresh instance in an unfamiliar context.
 *
 * Passing this does NOT certify a claim; it only rules out impossible ones. The
 * affirmative warrant is the contract reviewer's judgment (see `EvidenceBasis`).
 *
 * This is the SINGLE definition, shared by module-item validation
 * (`evidenceCeiling.test.ts`) and lesson-objective coverage
 * (`objectiveCoverage.test.ts`). They previously carried separate copies, and
 * the lesson-side copy had drifted to only two of the four grounds — so an E4
 * objective backed by a reused, familiar item was accepted.
 */
export function evidenceContradictions(
  level: EvidenceLevel,
  basis: EvidenceBasis,
): string[] {
  if (EVIDENCE_ORDER[level] < EVIDENCE_ORDER.E4) return [];
  const found: string[] = [];
  if (basis.scaffolding === "heavy") found.push("heavy scaffolding");
  if (basis.freshness === "reused-fixture") found.push("reused fixture");
  if (basis.unfamiliarity === "familiar-drill") found.push("familiar drill");
  if (basis.scoringAuthority === "self-marked") found.push("self-marked");
  return found;
}

export const ITEM_ASSESSMENT_META: Record<string, ItemAssessmentMeta> = {
  // Package G — produced / human-scored items.
  "mod-select-method": {
    evidenceTarget: "E3",
    methodSelection: true,
    requiredPostCommitmentCues: ["elimination"],
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
  // Package I — timed mock (fresh instances under a time limit).
  "mod-mock-compute": {
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
  "mod-mock-classify": {
    evidenceTarget: "E4",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "transfer",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  "mod-mock-proof": {
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

  /* ---------------------------------------------------------------------- */
  /* `structure` module (L8/L9/L10) — Gate 9.                                */
  /* ---------------------------------------------------------------------- */

  // One reduction answering existence (L8), rank (L8) and nullity (L9) at once,
  // on a non-square shape where n ≠ m — integrated by construction.
  "mod-struct-rank-nullity-ledger": {
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
  // The learner forms A − λI themselves; the free count they produce IS the
  // geometric multiplicity. Spans L7 (det = 0), L8 (null space), L9 (dimension).
  "mod-struct-eigen-shift": {
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
  // A produced coordinate matrix on a fresh, non-adapted basis. E3, not higher:
  // `matrix-entry`'s ceiling, and it exercises one outcome rather than joining
  // several.
  "mod-struct-cob-matrix-fresh": {
    evidenceTarget: "E3",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "near",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  "mod-struct-select-method": {
    evidenceTarget: "E3",
    methodSelection: true,
    requiredPostCommitmentCues: ["elimination"],
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "transfer",
      integration: "integrated",
      scaffolding: "none",
      scoringAuthority: "human-scored",
    },
  },
  "mod-struct-diagnose-colspace": {
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
  // The three P3 proof surfaces. E5 is the manifest's ceiling for a claim; the
  // E6 (justification) reading these target is recorded in the module's
  // assessment plan and is contingent on real human scoring.
  "mod-struct-prove-subspace-inclusion": {
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
  "mod-struct-prove-rank-nullity": {
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
  "mod-struct-derive-similarity": {
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
  // Delayed retention: recognition is the measurement, so E1 is the claim — not
  // a shortfall. These carry produced evidence elsewhere (in-lesson).
  "mod-struct-retain-two-spaces": {
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
  "mod-struct-retain-total-n": {
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
  "mod-struct-retain-p-direction": {
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

  /* ---------------------------------------------------------------------- */
  /* `calculus-foundations` module (L1-L4) — Gate 9.                          */
  /* ---------------------------------------------------------------------- */

  // Inherited D10 request was E5; `vector`'s ceiling is E3 — partially
  // discharged (see the module's assessment plan for the honest level note).
  "mod-calcfound-limit-in-derivative": {
    evidenceTarget: "E3",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "near",
      integration: "integrated",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  // Inherited D10 request was E5; `matrix-entry`'s ceiling is E3 — partially
  // discharged.
  "mod-calcfound-mixed-rate-total": {
    evidenceTarget: "E3",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "transfer",
      integration: "integrated",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  // The module's ONE E5 item: nothing auto-graded reaches self-check's
  // ceiling for calculus-shaped content (solution-set/elimination-solution
  // are linear-algebra-shaped). Human-scored, so the E5 claim is contingent
  // on real scoring against the snapshotted rubric, not on this test suite.
  "mod-calcfound-mixed-ftc": {
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
  "mod-calcfound-select-method": {
    evidenceTarget: "E3",
    methodSelection: true,
    requiredPostCommitmentCues: ["antiderivative"],
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "transfer",
      integration: "integrated",
      scaffolding: "none",
      scoringAuthority: "human-scored",
    },
  },
  "mod-calcfound-diagnose-signed-split": {
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
  // D9 transfer, produced: the learner locates the fixture's turn (an L2
  // computation) and constructs a narrow interval (an L3 restriction) —
  // raised from L3's own recognition-only (E2) item to E4, produced.
  "mod-calcfound-transfer-bracket-window": {
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
  // Delayed retention: recognition is the measurement, so E1 is the claim
  // against contracts that request E3 — partially discharged, not a
  // shortfall in what recognition can honestly measure.
  "mod-calcfound-retain-point-value": {
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
  "mod-calcfound-retain-diff-cont": {
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
  "mod-calcfound-retain-signed": {
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
  "mod-calcfound-retain-existence": {
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
  // D11 timed mock — fresh instances under a time limit, all auto-graded (a
  // deferred-feedback timed set with a human in the loop returns nothing in
  // time to be a mock).
  "mod-calcfound-mock-limit": {
    evidenceTarget: "E3",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "near",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  "mod-calcfound-mock-total": {
    evidenceTarget: "E3",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "near",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  "mod-calcfound-mock-slope-of-total": {
    evidenceTarget: "E3",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "near",
      integration: "integrated",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },

  /* ----------------------------------------------------------------------
   * LESSON-owned exercises named by a lesson's `objectives[].itemIds`.
   *
   * Originally this manifest covered `MODULE_ITEMS` only, and
   * `objectiveCoverage.test.ts` fell back to the capability CEILING to decide
   * whether an item evidenced an objective. That is the exact inversion
   * `evidence.ts` warns against: the ceiling is a NECESSARY bound, never a
   * sufficient warrant. An item does not become E3 evidence because a numeric
   * field could in principle capture E3.
   *
   * So the manifest is the single source of truth for BOTH kinds of item, and
   * a lesson-owned objective is now covered only by an item with an explicit
   * entry here. Adding an exercise to an objective's `itemIds` without adding
   * it here fails `objectiveCoverage.test.ts` rather than silently passing on
   * its capability.
   * -------------------------------------------------------------------- */

  // Recover the middle coefficient from the three products — the construction
  // itself, computed on the lesson's running example.
  "karatsuba-z1": {
    evidenceTarget: "E3",
    methodSelection: false,
    evidenceBasis: {
      freshness: "reused-fixture",
      unfamiliarity: "familiar-drill",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  // Reassemble the product from the three coefficients, including carrying.
  "karatsuba-product-carry": {
    evidenceTarget: "E3",
    methodSelection: false,
    evidenceBasis: {
      freshness: "reused-fixture",
      unfamiliarity: "familiar-drill",
      integration: "integrated",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  // Recognition items: multiple-choice caps at E2, and each claims exactly E2.
  "karatsuba-width-vs-carry": {
    evidenceTarget: "E2",
    methodSelection: false,
    evidenceBasis: {
      freshness: "reused-fixture",
      unfamiliarity: "familiar-drill",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  "karatsuba-output-carry": {
    evidenceTarget: "E2",
    methodSelection: false,
    evidenceBasis: {
      freshness: "reused-fixture",
      unfamiliarity: "familiar-drill",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  "karatsuba-exponent": {
    evidenceTarget: "E2",
    methodSelection: false,
    evidenceBasis: {
      freshness: "reused-fixture",
      unfamiliarity: "familiar-drill",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  // Transfer-tier in the lesson's own tiering, but still recognition capture:
  // the claim stays E2, which is what multiple-choice can actually support.
  "karatsuba-strassen-transfer": {
    evidenceTarget: "E2",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "transfer",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },

  // Package B — `calculus-technique` — `optimization-approximation` (spine
  // L6). The FIRST applied-mathematics lesson registered here: L1-L5's
  // lesson-owned items were never entered into this manifest, on a claim in
  // L5's mastery contract ("ITEM_ASSESSMENT_META does not cover lesson-owned
  // items, matching every prior lesson's precedent") that review found FALSE
  // — karatsuba's items above are the actual precedent. L6 follows karatsuba,
  // not the mistaken claim. Every item below runs on a function the lesson
  // never displays (mastery-contract.md §1d's freshness rule), so
  // `freshness: "fresh-instance"` throughout; drill-tier items are "near"
  // (same skill, a fresh instance), transfer-tier are "transfer" (a genuine
  // conceptual leap — an unfamiliar shape, a captured method choice, or the
  // abstraction-return item). No claim here reaches E4, so
  // `evidenceContradictions` never actually scrutinizes these bases (it is a
  // no-op below E4) — they are still filled in honestly, not left blank.
  "opt-candidate-set": {
    evidenceTarget: "E3",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "near",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  "opt-flat-not-extremum": {
    evidenceTarget: "E2",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "near",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  "opt-second-test-silent": {
    evidenceTarget: "E3",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "near",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  "opt-linearize-tolerance": {
    evidenceTarget: "E3",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "near",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  "opt-open-interval": {
    evidenceTarget: "E2",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "near",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  "opt-endpoint-fresh": {
    evidenceTarget: "E3",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "transfer",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  "opt-which-hypothesis": {
    // The abstraction-return item (insight.md §14) — set on a function with
    // no walkable reading, deliberately not shape-matchable to the lesson's
    // own |x|/x^3 examples.
    evidenceTarget: "E3",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "transfer",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  "opt-select-route": {
    // A genuine method-selection item — TWO fresh functions, one with an
    // algebraic certificate and one without, and the learner must recognize
    // which is which. `methodSelection: true` is set honestly (a second
    // review round flagged an earlier version of this entry recording
    // `false` while its own comment admitted the item WAS method-selection —
    // metadata that is technically unenforced is not thereby licensed to be
    // false). `requiredPostCommitmentCues` is left unset: cue-lint
    // (`cueLint.test.ts`) only walks `MODULE_ITEMS`, not lesson exercises, so
    // no enforcement currently reaches this item either way, and its shared
    // cue-pattern list has no entry for "complete the square" to name.
    evidenceTarget: "E3",
    methodSelection: true,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "transfer",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  "opt-derive-steps": {
    evidenceTarget: "E3",
    methodSelection: false,
    evidenceBasis: {
      freshness: "fresh-instance",
      unfamiliarity: "transfer",
      integration: "single-outcome",
      scaffolding: "none",
      scoringAuthority: "auto",
    },
  },
  // opt-derive-escape is deliberately ABSENT from this manifest: it is a
  // self-marked practice event with no evidence claim (mastery-contract.md
  // §1d), covers no objective, and objectiveCoverage.test.ts / a dedicated
  // check in optimizationApproximationGradingContract.test.ts both hold that
  // absence, so a future edit cannot silently promote it into evidence.
};
