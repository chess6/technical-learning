/**
 * Package G — Class-A module-owned assessment items for the systems–elimination
 * module. These are NOT lesson exercises: they are module-owned cumulative /
 * selection / transfer / diagnosis / concrete-applied items authored to produce
 * genuine E3–E5 evidence when administered through the Package F module runner.
 *
 * Evidence-integrity rules honored here:
 * - Multiple choice is never used as the decisive object (it is E1 only).
 * - Every mathematical object (classification, particular solution, null
 *   directions, parameterization) is PRODUCED and captured in full.
 * - Auto items are predicate-graded against `src/math` (the source of truth);
 *   the raw systems are re-verified independently in `moduleItems.test.ts`.
 * - Written reasoning / proofs route to Package F human scoring with a
 *   snapshotted, versioned rubric.
 * - Systems use FRESH numbers, not copied from lesson examples.
 *
 * Scope is deliberately concrete (R², R³, small rectangular systems). No general
 * ℝⁿ null-space theory or rank–nullity is claimed — that remains owned by the
 * future L8/L9 module.
 */

import type { SolutionSetConfig } from "./capabilities";
import { ELIMINATION_ID, SELF_CHECK_ID, SOLUTION_SET_ID } from "./capabilities";
import type { ExerciseDefinition } from "./types";

/* -------------------------------------------------------------------------- */
/* Canonical fresh systems (re-verified independently in the math test).       */
/* -------------------------------------------------------------------------- */

/** 2×3 consistent, one free variable — a line in R³. */
export const SYS_SOLSET_FRESH = {
  matrix: [
    [1, 2, -1],
    [2, 4, 1],
  ],
  rhs: [4, 5],
} as const;

/** 3×3 consistent, one free variable — requires elimination (spans L4 + L5). */
export const SYS_CUMULATIVE = {
  matrix: [
    [1, 1, 1],
    [1, 2, 3],
    [2, 3, 4],
  ],
  rhs: [6, 14, 20],
} as const;

/** 3×3 consistent, one free variable — the concrete applied 3-variable slice. */
export const SYS_APPLIED_3X3 = {
  matrix: [
    [2, 1, -1],
    [4, 1, 1],
    [2, 0, 2],
  ],
  rhs: [1, 5, 4],
} as const;

/** 3×2 rectangular, INCONSISTENT — elimination reaches a contradiction row (∅). */
export const SYS_APPLIED_RECT = {
  matrix: [
    [1, 1],
    [1, -1],
    [2, 1],
  ],
  rhs: [3, 1, 7],
} as const;

/** 2×2 inconsistent — fresh classification transfer (columns dependent, b off the line). */
export const SYS_CLASSIFY_FRESH = {
  matrix: [
    [1, 3],
    [2, 6],
  ],
  rhs: [4, 9],
} as const;

/** Method-selection pair: P is settled by reachability, Q needs elimination. */
export const SYS_METHOD_REACHABILITY = {
  matrix: [
    [1, 2],
    [2, 4],
  ],
  rhs: [3, 6],
} as const;
export const SYS_METHOD_ELIMINATION = {
  matrix: [
    [2, 1],
    [1, 3],
  ],
  rhs: [5, 10],
} as const;

/** Diagnosis fixture: the faulty step and its correct repair. */
export const SYS_DIAGNOSE = {
  matrix: [
    [1, 2],
    [3, 4],
  ],
  rhs: [5, 6],
} as const;

function solutionSetConfigOf(
  system: { matrix: readonly (readonly number[])[]; rhs: readonly number[] },
  explanation: string,
): SolutionSetConfig {
  return {
    matrix: system.matrix.map((row) => [...row]),
    rhs: [...system.rhs],
    variables: system.matrix[0]!.length,
    explanation,
  };
}

/** Elimination config shares the SolutionSetConfig shape (matrix, rhs, explanation). */
const eliminationConfigOf = solutionSetConfigOf;

/* -------------------------------------------------------------------------- */
/* The eight Package G items.                                                   */
/* -------------------------------------------------------------------------- */

/**
 * 1. Method selection (E3, human-scored). Two interleaved systems — one settled
 * fastest by column/reachability reasoning, one that genuinely needs
 * elimination. The learner names the efficient method for EACH, justifies it,
 * and carries out the decisive step. Method is not cued before commitment; a
 * recognition MC would only be E1, so this is produced written work.
 */
const modSelectMethod: ExerciseDefinition = {
  id: "mod-select-method",
  type: "custom",
  capabilityId: SELF_CHECK_ID,
  tier: "transfer",
  prompt:
    "Two systems. **System P:** $\\begin{cases} x_1 + 2x_2 = 3 \\\\ 2x_1 + 4x_2 = 6 \\end{cases}$  " +
    "**System Q:** $\\begin{cases} 2x_1 + x_2 = 5 \\\\ x_1 + 3x_2 = 10 \\end{cases}$  " +
    "For EACH system, choose the most efficient way to settle how many solutions it has. Name the " +
    "method you chose, justify in one sentence why it is the efficient choice here, and carry out " +
    "the decisive work to state the number of solutions. Do not just name a method — show the work " +
    "that justifies your choice.",
  config: {
    modelAnswer:
      "System P: the second equation is exactly twice the first, so both describe the same line — " +
      "column/reachability reasoning settles it immediately: the columns are dependent and $\\mathbf{b}$ " +
      "lies on their line, so there are infinitely many solutions. System Q: the columns are " +
      "independent (not multiples), so elimination is the efficient route: $R_2 \\to R_2 - \\tfrac12 R_1$ " +
      "gives $\\tfrac52 x_2 = \\tfrac{15}{2}$, so $x_2 = 3, x_1 = 1$ — exactly one solution.",
    rubricId: "mod-select-method",
    rubricVersion: 1,
    rubricText:
      "PASS requires, for BOTH systems: (a) the efficient method named correctly (P → " +
      "column/reachability; Q → elimination), (b) a correct one-sentence justification tied to " +
      "column dependence/independence and reachability of b, and (c) produced work reaching the " +
      "right solution count (P infinite, Q unique x=(1,3)). Naming methods without produced " +
      "justifying work is NOT a pass (that is recognition only).",
  },
};

/**
 * 2. Unfamiliar classification (E4, human-scored). A genuinely fresh system;
 * classify none/one/infinite AND justify via reachability + independence.
 * Classification is not revealed before commitment; the written justification is
 * routed to Package F human scoring with a versioned rubric snapshot.
 */
const modTransferClassify: ExerciseDefinition = {
  id: "mod-transfer-classify",
  type: "custom",
  capabilityId: SELF_CHECK_ID,
  tier: "transfer",
  prompt:
    "A fresh system: $\\begin{cases} x_1 + 3x_2 = 4 \\\\ 2x_1 + 6x_2 = 9 \\end{cases}$  " +
    "Classify its solution set as **none**, **exactly one**, or **infinitely many**, then justify " +
    "your classification using (i) whether the columns are independent and (ii) whether " +
    "$\\mathbf{b}$ is reachable from the columns. State your one-word classification first, then the reasoning.",
  config: {
    modelAnswer:
      "None. The two columns $\\begin{bmatrix}1\\\\2\\end{bmatrix}$ and $\\begin{bmatrix}3\\\\6\\end{bmatrix}$ " +
      "are dependent (the second is $3\\times$ the first), so the column span is a single line " +
      "$\\{t(1,2)\\}$. The target $\\mathbf{b} = (4,9)$ is not on that line ($9 \\neq 2\\cdot 4$), so " +
      "$\\mathbf{b}$ is unreachable — the system is inconsistent, with no solutions.",
    rubricId: "mod-transfer-classify",
    rubricVersion: 1,
    rubricText:
      "PASS requires: classification = none (inconsistent); AND justification that names column " +
      "dependence (span is one line) AND that b is not reachable (off the line, 9≠8). A correct " +
      "classification with no reachability/independence reasoning is NOT a pass.",
  },
};

/**
 * 3. Fresh solution-set transfer (E4, auto). Produce the complete solution set
 * for a fresh consistent system: free-variable count, a particular solution, and
 * every nonzero null direction. Predicate-graded — any valid parameterization
 * passes; nothing about the expected shape is revealed before commitment.
 */
const modTransferSolsetFresh: ExerciseDefinition = {
  id: "mod-transfer-solset-fresh",
  type: "custom",
  capabilityId: SOLUTION_SET_ID,
  tier: "transfer",
  prompt:
    "A fresh system: $\\begin{cases} x_1 + 2x_2 - x_3 = 4 \\\\ 2x_1 + 4x_2 + x_3 = 5 \\end{cases}$  " +
    "Give the COMPLETE solution set: state the number of free variables, one particular solution " +
    "$\\mathbf{x}_p$, and every nonzero null direction needed to parameterize all solutions.",
  config: {
    ...solutionSetConfigOf(
      SYS_SOLSET_FRESH,
      "Eliminating gives $x_3 = -1$ and $x_1 + 2x_2 = 3$, so $x_2$ is free (1 free variable). " +
        "A particular solution is $\\mathbf{x}_p = (3, 0, -1)$, and the null direction is " +
        "$(-2, 1, 0)$: every solution is $(3,0,-1) + t(-2,1,0)$.",
    ),
  },
};

/**
 * 4. Cumulative integration (E5, auto). One unfamiliar 3×3 problem that requires
 * elimination (L4) AND the complete parametric solution set (L5): pivots, free
 * variable, a particular solution, and the null direction. The inconsistent
 * contradiction-row (∅) case is delivered by `mod-p2-applied-rect` in the same
 * cumulative set.
 */
const modCumulativeElimSolset: ExerciseDefinition = {
  id: "mod-cumulative-elim-solset",
  type: "custom",
  capabilityId: ELIMINATION_ID,
  tier: "transfer",
  prompt:
    "Solve completely: $\\begin{cases} x_1 + x_2 + x_3 = 6 \\\\ x_1 + 2x_2 + 3x_3 = 14 \\\\ 2x_1 + 3x_2 + 4x_3 = 20 \\end{cases}$  " +
    "Row-reduce the augmented matrix to echelon form, mark the pivot columns, and give the number " +
    "of free variables, a particular solution, and every null direction of the complete solution set.",
  config: {
    ...eliminationConfigOf(
      SYS_CUMULATIVE,
      "Elimination collapses the last two equations to $x_2 + 2x_3 = 8$, so there are two pivots " +
        "($x_1, x_2$) and one free variable ($x_3$). A particular solution is " +
        "$\\mathbf{x}_p = (-2, 8, 0)$ and the null direction is $(1, -2, 1)$: all solutions are " +
        "$(-2,8,0) + t(1,-2,1)$.",
    ),
  },
};

/**
 * 5. Error diagnosis (E4, human-scored). A fresh faulty elimination; the learner
 * must identify the EXACT wrong step, explain why it is invalid, and repair it.
 * Not reducible to recognition-only MC — the decisive diagnosis is written.
 */
const modErrorDiagnose: ExerciseDefinition = {
  id: "mod-error-diagnose",
  type: "custom",
  capabilityId: SELF_CHECK_ID,
  tier: "transfer",
  prompt:
    "A student solves $\\begin{cases} x_1 + 2x_2 = 5 \\\\ 3x_1 + 4x_2 = 6 \\end{cases}$ by applying " +
    "$R_2 \\to R_2 - 3R_1$ and writes the new second row as $-2x_2 = 6$. Identify the exact step " +
    "that is wrong, explain precisely why it is invalid, and write the corrected row.",
  config: {
    modelAnswer:
      "The error is in updating the right-hand side of $R_2$. The operation $R_2 - 3R_1$ must be " +
      "applied to EVERY entry, including the constant: $6 - 3\\cdot 5 = -9$, not $6$. Subtracting " +
      "$3R_1$ from only the left-hand side changes the system's solution set, which is illegal. " +
      "The corrected row is $-2x_2 = -9$ (so $x_2 = 4.5$).",
    rubricId: "mod-error-diagnose",
    rubricVersion: 1,
    rubricText:
      "PASS requires: (a) pinpointing that the RHS constant was not updated (kept 6 instead of " +
      "$6-3\\cdot5=-9$); (b) explaining WHY that is invalid (a row operation must act on the whole " +
      "row or it changes the solution set); and (c) the correct repaired row $-2x_2 = -9$. " +
      "Vague 'there's an arithmetic mistake' without the exact step and repair is NOT a pass.",
  },
};

/**
 * 6. Proof hypothesis (E5-adjacent, human-scored). State and explain the
 * consistency hypothesis needed for $\\mathrm{Sol}(A\\mathbf{x}=\\mathbf{b}) =
 * \\mathbf{x}_p + \\mathrm{Null}(A)$. Human-scored against a versioned rubric.
 */
const modProofHyp: ExerciseDefinition = {
  id: "mod-proof-hyp",
  type: "custom",
  capabilityId: SELF_CHECK_ID,
  tier: "transfer",
  prompt:
    "The solution set of $A\\mathbf{x}=\\mathbf{b}$ can be written as " +
    "$\\mathbf{x}_p + \\mathrm{Null}(A)$ (a particular solution plus the null space). State the " +
    "hypothesis on $\\mathbf{b}$ that this description requires, and explain why the description " +
    "fails without it.",
  config: {
    modelAnswer:
      "The hypothesis is that the system is CONSISTENT: $\\mathbf{b} \\in \\mathrm{Col}(A)$, so at " +
      "least one particular solution $\\mathbf{x}_p$ exists. If $\\mathbf{b}$ is unreachable the " +
      "solution set is empty, but $\\mathbf{x}_p + \\mathrm{Null}(A)$ is never empty (it always " +
      "contains $\\mathbf{x}_p$), so the equation $\\mathrm{Sol} = \\mathbf{x}_p + \\mathrm{Null}(A)$ " +
      "cannot hold. Consistency is exactly what lets you pick the $\\mathbf{x}_p$ the description names.",
    rubricId: "mod-proof-hyp",
    rubricVersion: 1,
    rubricText:
      "PASS requires: (a) naming consistency / $\\mathbf{b}\\in\\mathrm{Col}(A)$ as the hypothesis; " +
      "(b) explaining that it guarantees a particular solution exists; and (c) noting the failure " +
      "mode — an inconsistent system has empty solution set while $x_p+\\mathrm{Null}(A)$ is " +
      "nonempty. Merely restating the formula is NOT a pass.",
  },
};

/**
 * 7a. Concrete P2 applied — fresh three-variable elimination to a complete
 * solution description (E4/E5, auto). Consistent, one free variable.
 */
const modP2Applied3x3: ExerciseDefinition = {
  id: "mod-p2-applied-3x3",
  type: "custom",
  capabilityId: ELIMINATION_ID,
  tier: "transfer",
  prompt:
    "A three-variable system: $\\begin{cases} 2x_1 + x_2 - x_3 = 1 \\\\ 4x_1 + x_2 + x_3 = 5 \\\\ 2x_1 + 2x_3 = 4 \\end{cases}$  " +
    "Row-reduce the augmented matrix to echelon form, mark the pivot columns, and give the number " +
    "of free variables, a particular solution, and every null direction of the complete solution set.",
  config: {
    ...eliminationConfigOf(
      SYS_APPLIED_3X3,
      "Elimination leaves two pivots and one free variable ($x_3$). A particular solution is " +
        "$\\mathbf{x}_p = (2, -3, 0)$ and the null direction is $(-1, 3, 1)$: all solutions are " +
        "$(2,-3,0) + t(-1,3,1)$.",
    ),
  },
};

/**
 * 7b. Concrete P2 applied — fresh rectangular system (E4, auto). Here the
 * rectangular (over-determined) system is INCONSISTENT: elimination reaches a
 * contradiction row, so the complete solution description is ∅. This supplies the
 * inconsistent contradiction-row case for the applied slice and the cumulative set.
 */
const modP2AppliedRect: ExerciseDefinition = {
  id: "mod-p2-applied-rect",
  type: "custom",
  capabilityId: ELIMINATION_ID,
  tier: "transfer",
  prompt:
    "A rectangular system: $\\begin{cases} x_1 + x_2 = 3 \\\\ x_1 - x_2 = 1 \\\\ 2x_1 + x_2 = 7 \\end{cases}$  " +
    "Row-reduce the augmented matrix to echelon form. If it is consistent, mark the pivots and give " +
    "the free-variable count, a particular solution, and every null direction. If not, your reduced " +
    "matrix must contain the contradiction row and you must TYPE the classification (e.g. \"none\" / " +
    "\"inconsistent\") — a bare button does not count.",
  config: {
    ...eliminationConfigOf(
      SYS_APPLIED_RECT,
      "The first two equations force $x_1 = 2, x_2 = 1$, but the third then demands " +
        "$2\\cdot 2 + 1 = 5 \\neq 7$. Elimination produces a contradiction row $0 = 2$, so the " +
        "system is inconsistent and the solution set is empty (∅).",
    ),
  },
};

/** All Package G module items, in a stable authored order. */
export const MODULE_ITEMS: readonly ExerciseDefinition[] = [
  modSelectMethod,
  modTransferClassify,
  modTransferSolsetFresh,
  modCumulativeElimSolset,
  modErrorDiagnose,
  modProofHyp,
  modP2Applied3x3,
  modP2AppliedRect,
];
