/**
 * Evidence model (ADR-002 safeguard) — capability CEILINGS as necessary upper
 * bounds, NOT certifications.
 *
 * `CAPABILITY_EVIDENCE_CEILING` records the maximum evidence level a capability's
 * CAPTURE INTERFACE could ever support — a multiple-choice picker cannot record
 * more than recognition (E2) no matter how it is authored; a prediction records
 * no answer at all (E1). This is a *necessary* bound: an item may never claim
 * above its capability's ceiling. It is emphatically NOT *sufficient* — a
 * solution-set item does not become E5 evidence just because the interface could
 * capture E5. The affirmative warrant for an E4/E5 claim lives in the item's
 * `evidenceBasis` (see assessmentManifest.ts) and, ultimately, contract review.
 *
 * Ceiling values are grounded in the module's own corrected evidence audit
 * (docs/courses/linear-algebra/modules/systems-elimination/implementation-package.md).
 */

export type EvidenceLevel = "E1" | "E2" | "E3" | "E4" | "E5";

export const EVIDENCE_ORDER: Record<EvidenceLevel, number> = {
  E1: 1,
  E2: 2,
  E3: 3,
  E4: 4,
  E5: 5,
};

/**
 * Max evidence level each registered grading capability's capture interface can
 * record. Keyed by capability id (must cover every entry in `gradingCapabilities`
 * — enforced by evidenceCeiling.test.ts).
 */
export const CAPABILITY_EVIDENCE_CEILING: Record<string, EvidenceLevel> = {
  // Recognition / no produced answer.
  prediction: "E1", // records only { revealed: true } — captures NO answer
  "committed-prediction": "E1", // commit-before-reveal is still recognition
  "multiple-choice": "E2", // recognition; a fresh instance reaches at most E2
  // Produced scalars / vectors / matrices / scaffolded chains.
  numeric: "E3",
  vector: "E3",
  eigenvalue: "E3",
  "matrix-entry": "E3",
  "exercise-sequence": "E3", // scaffolded production; progressive reveal caps transfer
  // Open construction / complete produced mathematical objects.
  "construct-in-explorer": "E4", // predicate-graded open construction
  "solution-set": "E5", // complete produced solution set
  "elimination-solution": "E5", // full produced elimination evidence
  "self-check": "E5", // written production, human-scored
};

/** True iff `claim` is at or below `ceiling` (the necessary-bound check). */
export function withinCeiling(claim: EvidenceLevel, ceiling: EvidenceLevel): boolean {
  return EVIDENCE_ORDER[claim] <= EVIDENCE_ORDER[ceiling];
}
