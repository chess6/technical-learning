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
  /**
   * `math-expression`: the learner types a complete symbolic expression into
   * an empty field, graded by a predicate (agreement as a function) rather
   * than against one spelling. Nothing is offered to select from and the
   * answer space is unbounded, which is the same shape as
   * `construct-in-explorer` above — open construction, predicate-graded — and
   * why it lands at the same level.
   *
   * Not E5: what is captured is the produced OBJECT alone. No reasoning, no
   * derivation, and no complete solution set accompanies it, which is what
   * separates this from `solution-set` and `elimination-solution`.
   *
   * A ceiling is a necessary bound, never a licence. Grading here compares
   * VALUE, not form, so an item whose prompt is about the form (factor this,
   * write it in vertex form) can be answered by restating the question — see
   * `mathExpressionGradingContract.test.ts`, which pins that boundary. Such an
   * item earns nothing regardless of this ceiling.
   */
  "math-expression": "E4",
  "solution-set": "E5", // complete produced solution set
  "elimination-solution": "E5", // full produced elimination evidence
  "self-check": "E5", // written production, human-scored
};

/** True iff `claim` is at or below `ceiling` (the necessary-bound check). */
export function withinCeiling(claim: EvidenceLevel, ceiling: EvidenceLevel): boolean {
  return EVIDENCE_ORDER[claim] <= EVIDENCE_ORDER[ceiling];
}
