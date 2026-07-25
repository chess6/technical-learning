/**
 * Class-A module-owned assessment items for the **`structure`** module
 * (L8 subspaces & rank, L9 rank–nullity, L10 change of basis) — the Gate 9
 * content for `docs/courses/linear-algebra/modules/structure/assessment-plan.md`.
 *
 * These are NOT lesson exercises. Each discharges an obligation the three
 * lessons' mastery contracts explicitly deferred to the module:
 *  - the D10/E5 cumulative-integration rows of L8, L9 and L10;
 *  - the D12 delayed-retention rows of all three;
 *  - the **P3 override** proof credit each lesson left "practiced, unscored"
 *    (subspace reasoning, rank–nullity, the similarity derivation).
 *
 * Evidence-integrity rules honored here (same as the systems–elimination items):
 * - multiple choice is never the decisive object — it appears only on the E1
 *   retention items, where recognition after a delay is exactly the measurement;
 * - every mathematical object (reduced matrix, pivot columns, nullity, bases,
 *   coordinate matrix) is PRODUCED and captured in full;
 * - auto items are predicate-graded against `src/math`, and every matrix here is
 *   re-verified independently in `structureModuleItems.test.ts`;
 * - written reasoning / proofs route to human scoring with a versioned rubric;
 * - **fresh instances only**: no matrix below appears in L8, L9, L10 or in the
 *   systems–elimination item corpus (asserted by test).
 *
 * Scope guard: the module works in concrete \\R^n with n up to 4. It does not
 * claim abstract vector spaces, general fields, orthogonality (L12), or the
 * row/left-null space — L8 deliberately scopes to the two spaces that govern
 * solvability, and nothing here widens that.
 */

import type { SolutionSetConfig } from "./capabilities";
import { ELIMINATION_ID, MATRIX_ENTRY_ID, SELF_CHECK_ID } from "./capabilities";
import type { ExerciseDefinition } from "./types";

/* -------------------------------------------------------------------------- */
/* Canonical fresh fixtures (re-verified independently in the math test).      */
/* -------------------------------------------------------------------------- */

/**
 * 3×4, consistent, rank 2 / nullity 2 — a genuinely non-square map where
 * Col(A) ⊆ R³ and Null(A) ⊆ R⁴ are not even in the same space, and where the
 * conservation law is read against n = 4 (the INPUT dimension), not m = 3.
 * Row 3 = row 2 − row 1, which is what costs the third pivot.
 */
export const STRUCT_LEDGER = {
  matrix: [
    [1, 2, 0, 3],
    [2, 4, 1, 7],
    [1, 2, 1, 4],
  ],
  rhs: [1, 3, 2],
} as const;

/**
 * The shifted matrix A − I for A = [[2,1,1],[1,2,1],[1,1,2]], whose eigenvalue
 * λ = 1 is a double root. A − I is the all-ones matrix: rank 1, so the eigenspace
 * has dimension 3 − 1 = 2 — geometric multiplicity 2, equal to the algebraic one.
 * Homogeneous, so the produced "particular solution" is forced to be **0**, which
 * makes the blank ≠ 0 battery unusually sharp here (the true values ARE zeros).
 */
export const STRUCT_EIGEN_SHIFT = {
  matrix: [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ],
  rhs: [0, 0, 0],
} as const;

/** The matrix whose description in the basis B below is asked for. */
export const STRUCT_COB_A = [
  [3, -2],
  [4, 1],
] as const;
/** B = {(1,1), (1,2)} as the columns of P. det P = 1, so P⁻¹ is integral. */
export const STRUCT_COB_P = [
  [1, 1],
  [1, 2],
] as const;
/** [A]_B = P⁻¹AP. Deliberately NOT diagonal: A has no real eigenvalues at all. */
export const STRUCT_COB_IN_BASIS = [
  [-3, -8],
  [4, 7],
] as const;

/** The map whose null space Question Q of the method-selection item asks about. */
export const STRUCT_SELECT_Q = [
  [1, 2, 1],
  [2, 4, 3],
  [3, 6, 4],
] as const;

/** The diagnosis fixture: reducing it moves the column space (the L8 trap). */
export const STRUCT_DIAGNOSE = [
  [1, 3, 2],
  [2, 6, 5],
  [1, 3, 4],
] as const;

function eliminationConfigOf(
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

/* -------------------------------------------------------------------------- */
/* Cumulative integration (D10) — produced, auto-graded.                       */
/* -------------------------------------------------------------------------- */

/**
 * 1. The rank–nullity ledger on a non-square map (E5, auto). One reduction has
 * to answer four questions at once: is b in Col(A) (L8 existence), how many
 * pivots (rank), how many free variables (nullity), and what spans Null(A). The
 * shape is 3×4 so that n ≠ m and the law cannot be satisfied by reading the
 * wrong total — the failure mode L9's contract names.
 */
const modStructRankNullityLedger: ExerciseDefinition = {
  id: "mod-struct-rank-nullity-ledger",
  type: "custom",
  capabilityId: ELIMINATION_ID,
  tier: "transfer",
  prompt:
    "A map from $\\mathbb{R}^4$ to $\\mathbb{R}^3$, with a target: " +
    "$A = \\begin{bmatrix} 1 & 2 & 0 & 3 \\\\ 2 & 4 & 1 & 7 \\\\ 1 & 2 & 1 & 4 \\end{bmatrix}$, " +
    "$\\mathbf{b} = \\begin{bmatrix} 1 \\\\ 3 \\\\ 2 \\end{bmatrix}$.  " +
    "Settle it with one reduction: give a row-equivalent echelon form of the augmented matrix, " +
    "say whether $\\mathbf{b}$ is reachable, mark the pivot columns, and give the number of free " +
    "variables, a particular solution, and every null direction. Your pivot count is " +
    "$\\operatorname{rank}A$ and your free count is $\\dim\\operatorname{Null}(A)$ — check for " +
    "yourself which total they add to.",
  config: {
    ...eliminationConfigOf(
      STRUCT_LEDGER,
      "Row 3 is row 2 minus row 1, so the third equation adds nothing: two pivots (columns 1 and 3) " +
        "and two free variables. $\\operatorname{rank}A = 2$ and $\\dim\\operatorname{Null}(A) = 2$, " +
        "and they add to $n = 4$ — the **input** dimension, not $m = 3$. $\\mathbf{b}$ is reachable, " +
        "i.e. $\\mathbf{b} \\in \\operatorname{Col}(A) \\subseteq \\mathbb{R}^3$, while " +
        "$\\operatorname{Null}(A) \\subseteq \\mathbb{R}^4$: here the two spaces are not even in the " +
        "same $\\mathbb{R}^k$. A particular solution is $(1,0,1,0)$, and " +
        "$(-2,1,0,0)$ and $(-3,0,-1,1)$ span the null space.",
    ),
  },
};

/**
 * 2. The eigenspace as a null space (E5, auto). L9's contract owes an item that
 * integrates rank–nullity with determinants and eigen-multiplicity; this is it.
 * The learner forms the shifted matrix themselves, and the free-variable count
 * they produce IS the geometric multiplicity. Chosen so geometric = algebraic
 * (a whole plane of eigendirections), the case a defective example would hide.
 */
const modStructEigenShift: ExerciseDefinition = {
  id: "mod-struct-eigen-shift",
  type: "custom",
  capabilityId: ELIMINATION_ID,
  tier: "transfer",
  prompt:
    "For $A = \\begin{bmatrix} 2 & 1 & 1 \\\\ 1 & 2 & 1 \\\\ 1 & 1 & 2 \\end{bmatrix}$, the value " +
    "$\\lambda = 1$ is a root of $\\det(A - \\lambda I) = 0$ **twice**. That settles nothing on its " +
    "own. Form the shifted matrix $A - I$ yourself and solve $(A - I)\\mathbf{x} = \\mathbf{0}$ " +
    "completely: enter a row-equivalent echelon form of the augmented matrix, mark the pivot " +
    "columns, and give the free-variable count, a solution, and every null direction. The number " +
    "of free variables you report is the geometric multiplicity of $\\lambda = 1$. " +
    "(The system is homogeneous, so one of these answers is forced — enter it anyway.)",
  config: {
    ...eliminationConfigOf(
      STRUCT_EIGEN_SHIFT,
      "$A - I$ is the all-ones matrix, so its three identical rows collapse to one: " +
        "$\\operatorname{rank}(A - I) = 1$, and the eigenspace has dimension $3 - 1 = 2$. The " +
        "geometric multiplicity is therefore $2$ — equal to the algebraic multiplicity, so this " +
        "eigenvalue supplies a whole **plane** of eigendirections, not a line. A basis: " +
        "$(-1,1,0)$ and $(-1,0,1)$. The particular solution of a homogeneous system is " +
        "$\\mathbf{0}$, which is why the eigenspace is a subspace and not an offset flat. Note " +
        "what did the work: $\\det = 0$ (Lesson 7) said $\\lambda$ qualifies, the null space " +
        "(Lesson 8) held the directions, and a rank (Lesson 9) counted them.",
    ),
  },
};

/**
 * 3. A map's description in a fresh basis (E3, auto). L10's produced object, on
 * a basis deliberately NOT adapted to the map — and on a matrix with no real
 * eigenvalues, so no basis could make it diagonal. The invariants (trace 4,
 * det 11) are the learner's own check.
 */
const modStructCobMatrixFresh: ExerciseDefinition = {
  id: "mod-struct-cob-matrix-fresh",
  type: "custom",
  capabilityId: MATRIX_ENTRY_ID,
  tier: "transfer",
  prompt:
    "Take $A = \\begin{bmatrix} 3 & -2 \\\\ 4 & 1 \\end{bmatrix}$ and the basis " +
    "$B = \\{\\mathbf{b}_1 = (1,1),\\ \\mathbf{b}_2 = (1,2)\\}$, so " +
    "$P = \\begin{bmatrix} 1 & 1 \\\\ 1 & 2 \\end{bmatrix}$. Enter $[A]_B = P^{-1}AP$ — all four " +
    "entries. Before you submit, check your answer against the two quantities a change of basis " +
    "cannot alter.",
  config: {
    rows: 2,
    cols: 2,
    matrixName: "[A]_B",
    tolerance: 0.01,
    expected: [
      [STRUCT_COB_IN_BASIS[0][0], STRUCT_COB_IN_BASIS[0][1]],
      [STRUCT_COB_IN_BASIS[1][0], STRUCT_COB_IN_BASIS[1][1]],
    ],
    explanation:
      "Work right to left. $A\\mathbf{b}_1 = (1,5)$ and $A\\mathbf{b}_2 = (-1,6)$, so " +
      "$AP = \\begin{bmatrix} 1 & -1 \\\\ 5 & 6 \\end{bmatrix}$. Since $\\det P = 1$, " +
      "$P^{-1} = \\begin{bmatrix} 2 & -1 \\\\ -1 & 1 \\end{bmatrix}$, and " +
      "$P^{-1}(AP) = \\begin{bmatrix} -3 & -8 \\\\ 4 & 7 \\end{bmatrix}$. The checks: trace $4$ and " +
      "determinant $11$, exactly $A$'s. This basis is not adapted to $A$ — and none could be: " +
      "$\\lambda^2 - 4\\lambda + 11$ has no real root, so over $\\mathbb{R}$ this map has no " +
      "invariant line at all.",
  },
};

/* -------------------------------------------------------------------------- */
/* Method selection (D8) and error diagnosis (D13) — human-scored.             */
/* -------------------------------------------------------------------------- */

/**
 * 4. Method selection (E3, human-scored). One question is settled by a counting
 * argument with no computation at all; the other genuinely requires computing.
 * The prompt names neither method (cue-lint enforces this), and a recognition MC
 * would only be E1 — so the decisive answer is produced written work.
 */
const modStructSelectMethod: ExerciseDefinition = {
  id: "mod-struct-select-method",
  type: "custom",
  capabilityId: SELF_CHECK_ID,
  tier: "transfer",
  prompt:
    "Two questions. **Question P:** a linear map sends $\\mathbb{R}^4$ to $\\mathbb{R}^2$ — can it " +
    "be one-to-one? **Question Q:** for " +
    "$M = \\begin{bmatrix} 1 & 2 & 1 \\\\ 2 & 4 & 3 \\\\ 3 & 6 & 4 \\end{bmatrix}$, is " +
    "$\\operatorname{Null}(M) = \\{\\mathbf{0}\\}$?  " +
    "For EACH question, choose the most efficient way to settle it, justify in one sentence why " +
    "that is the efficient choice **here**, and carry out the decisive work to state the answer. " +
    "One of these needs no arithmetic at all; the other cannot be answered without it. Do not " +
    "merely name an approach — show the work that justifies your choice.",
  config: {
    modelAnswer:
      "**Question P** needs no computation. The image lies in $\\mathbb{R}^2$, so " +
      "$\\operatorname{rank} \\le 2$; by rank–nullity with $n = 4$, " +
      "$\\dim\\operatorname{Null} \\ge 4 - 2 = 2 > 0$. A nonzero null vector $\\mathbf{v}$ gives " +
      "$A(\\mathbf{x}+\\mathbf{v}) = A\\mathbf{x}$ — two different inputs with the same output — so " +
      "**no such map is one-to-one**. The shape alone decides it. " +
      "**Question Q** is different: the answer depends on the entries, so elimination is the " +
      "efficient route. Subtracting $2R_1$ from $R_2$ and $3R_1$ from $R_3$ leaves $(0,0,1)$ twice, " +
      "so there are two pivots and one free variable: $\\dim\\operatorname{Null}(M) = 3 - 2 = 1$, " +
      "and $\\operatorname{Null}(M) = \\operatorname{span}\\{(-2,1,0)\\}$ — **not** " +
      "$\\{\\mathbf{0}\\}$. (Verify: $M(-2,1,0) = \\mathbf{0}$.)",
    rubricId: "mod-struct-select-method",
    rubricVersion: 1,
    rubricText:
      "PASS requires, for BOTH questions: (a) the efficient method correctly identified — P by a " +
      "dimension/counting argument with no arithmetic, Q by elimination; (b) a correct one-sentence " +
      "justification tied to WHY (P is settled by the shape alone; Q depends on the actual entries); " +
      "and (c) produced work reaching the right answer — P: not one-to-one because nullity ≥ 2; " +
      "Q: Null(M) is the line spanned by (-2,1,0), so not trivial. Computing P by elimination and " +
      "getting the right answer is NOT a pass for P: the point is recognizing that no computation " +
      "was needed. Naming methods without the justifying work is NOT a pass.",
  },
};

/**
 * 5. Error diagnosis (E4, human-scored). The exact L8 trap, staged so the
 * student's REDUCTION is correct and only the extraction is wrong — the learner
 * must locate the error precisely rather than distrusting the whole calculation,
 * and must produce the witness showing the wrong answer is wrong.
 */
const modStructDiagnoseColspace: ExerciseDefinition = {
  id: "mod-struct-diagnose-colspace",
  type: "custom",
  capabilityId: SELF_CHECK_ID,
  tier: "transfer",
  prompt:
    "A student is asked for a basis of $\\operatorname{Col}(A)$ where " +
    "$A = \\begin{bmatrix} 1 & 3 & 2 \\\\ 2 & 6 & 5 \\\\ 1 & 3 & 4 \\end{bmatrix}$. They reduce it " +
    "to $\\begin{bmatrix} 1 & 3 & 2 \\\\ 0 & 0 & 1 \\\\ 0 & 0 & 0 \\end{bmatrix}$, observe that the " +
    "pivots sit in columns 1 and 3, and answer: \"a basis is $(1,0,0)$ and $(0,0,1)$\". " +
    "**Their reduction is correct.** Identify the exact step at which the answer goes wrong, " +
    "explain precisely why that step is invalid, give the correct basis, and produce a computation " +
    "that shows the student's answer cannot be right.",
  config: {
    modelAnswer:
      "The reduction is right and so are the pivot **positions** — columns 1 and 3. The error is in " +
      "the last step: reading the basis vectors **off the reduced matrix**. Row operations preserve " +
      "the row space and the null space, but they recombine rows, which moves the columns — so " +
      "$\\operatorname{Col}$ of the reduced matrix is generally a different subspace from " +
      "$\\operatorname{Col}(A)$. The pivot *positions* transfer; the *vectors* must be taken from " +
      "$A$ itself. The correct basis is columns 1 and 3 of $A$: $(1,2,1)$ and $(2,5,4)$. " +
      "Witness that the student's answer is wrong: if $(1,0,0)$ were in $\\operatorname{Col}(A)$ " +
      "we would need $a(1,2,1) + b(2,5,4) = (1,0,0)$; the third coordinate gives $a = -4b$, and " +
      "then the second gives $-8b + 5b = -3b = 0$, so $a = b = 0$ and the combination is " +
      "$\\mathbf{0} \\ne (1,0,0)$. So $(1,0,0) \\notin \\operatorname{Col}(A)$ at all.",
    rubricId: "mod-struct-diagnose-colspace",
    rubricVersion: 1,
    rubricText:
      "PASS requires: (a) pinpointing that the error is taking the basis vectors from the REDUCED " +
      "matrix rather than from A (and NOT claiming the reduction or the pivot positions are wrong); " +
      "(b) explaining WHY — row operations change the column space, so only the pivot positions " +
      "transfer; (c) the correct basis {(1,2,1), (2,5,4)}; and (d) a produced computation showing " +
      "(1,0,0) is not in Col(A). Answers that give the right basis with no diagnosis, or that " +
      "vaguely say 'they made a mistake reducing', are NOT a pass.",
  },
};

/* -------------------------------------------------------------------------- */
/* P3 override — proof surfaces (human-scored). Each is a FRESH statement, not  */
/* a re-run of the proof its lesson already displays.                          */
/* -------------------------------------------------------------------------- */

/**
 * 6. Subspace reasoning on a fresh statement (E5 claim, human-scored; E6 target).
 * Discharges L8's deferred P3 credit. Deliberately NOT "prove Col(A) is a
 * subspace" — the lesson already displays that proof, so reproducing it would be
 * recall. This asks for the same competence (membership witnesses + closure) on
 * a statement the learner has not seen, and adds the counterexample half the
 * proof-ready bar requires.
 */
const modStructProveSubspaceInclusion: ExerciseDefinition = {
  id: "mod-struct-prove-subspace-inclusion",
  type: "custom",
  capabilityId: SELF_CHECK_ID,
  tier: "transfer",
  prompt:
    "Let $A$ be $m \\times n$ and $B$ be $n \\times p$. " +
    "**(a)** Prove that $\\operatorname{Col}(AB) \\subseteq \\operatorname{Col}(A)$, working " +
    "directly from what it means for a vector to belong to a column space. Name the input that " +
    "witnesses each membership. " +
    "**(b)** Show the inclusion can be **strict** by exhibiting explicit $A$ and $B$ where it is. " +
    "**(c)** State what (a) and (b) together tell you about $\\operatorname{rank}(AB)$ and " +
    "$\\operatorname{rank}(A)$, and say why (b) matters to that statement.",
  config: {
    modelAnswer:
      "**(a)** Let $\\mathbf{y} \\in \\operatorname{Col}(AB)$. By definition that means " +
      "$\\mathbf{y} = (AB)\\mathbf{x}$ for some $\\mathbf{x} \\in \\mathbb{R}^p$. By associativity " +
      "(Lesson 6), $\\mathbf{y} = A(B\\mathbf{x})$, and $B\\mathbf{x}$ is a vector in " +
      "$\\mathbb{R}^n$ — so $\\mathbf{y}$ is an output of $A$, witnessed by the input " +
      "$B\\mathbf{x}$, i.e. $\\mathbf{y} \\in \\operatorname{Col}(A)$. " +
      "**(b)** Take $A = I_2$ and $B = \\begin{bmatrix} 1 & 0 \\\\ 0 & 0 \\end{bmatrix}$. Then " +
      "$\\operatorname{Col}(A) = \\mathbb{R}^2$ but $AB = B$, whose column space is the line " +
      "spanned by $(1,0)$ — a proper subset. " +
      "**(c)** $\\operatorname{Col}(AB)$ is a subspace sitting inside the subspace " +
      "$\\operatorname{Col}(A)$, so its dimension cannot be larger: " +
      "$\\operatorname{rank}(AB) \\le \\operatorname{rank}(A)$. Part (b) is what stops this being " +
      "an equality — composing with $B$ can genuinely destroy directions, and often does.",
    rubricId: "mod-struct-prove-subspace-inclusion",
    rubricVersion: 1,
    rubricText:
      "PASS requires: (a) a real proof — start from an arbitrary y in Col(AB), unwind the " +
      "definition to y = (AB)x, use associativity, and EXHIBIT Bx as the witnessing input for " +
      "membership in Col(A); (b) an explicit numeric pair A, B with the inclusion strict, with the " +
      "two column spaces identified; (c) the inequality rank(AB) ≤ rank(A) justified by " +
      "'a subspace of a subspace has no larger dimension', plus the observation that (b) rules out " +
      "equality in general. Asserting the inequality as a known fact, or proving (a) by picking a " +
      "particular A and B, is NOT a pass.",
  },
};

/**
 * 7. Rank–nullity, the load-bearing step (E5 claim, human-scored; E6 target).
 * Discharges L9's deferred P3 credit. The lesson displays the whole proof, so
 * asking for it back is recall; this asks for the one step a learner typically
 * cannot reconstruct (independence of the images) WITH the hypothesis-use
 * requirement, and then for a use of the theorem plus the boundary where the
 * argument stops working.
 */
const modStructProveRankNullity: ExerciseDefinition = {
  id: "mod-struct-prove-rank-nullity",
  type: "custom",
  capabilityId: SELF_CHECK_ID,
  tier: "transfer",
  prompt:
    "**(a)** In the proof of $\\operatorname{rank}A + \\dim\\operatorname{Null}(A) = n$ one takes a " +
    "basis $\\mathbf{v}_1,\\dots,\\mathbf{v}_k$ of $\\operatorname{Null}(A)$, extends it to a basis " +
    "$\\mathbf{v}_1,\\dots,\\mathbf{v}_k,\\mathbf{w}_1,\\dots,\\mathbf{w}_r$ of $\\mathbb{R}^n$, and " +
    "claims $A\\mathbf{w}_1,\\dots,A\\mathbf{w}_r$ is a basis of $\\operatorname{Col}(A)$. Prove the " +
    "harder half — that these images are **linearly independent** — and state exactly where your " +
    "argument uses the fact that the $\\mathbf{v}_i$ are a basis of the *null space*. " +
    "**(b)** Use the theorem to prove that no linear map $\\mathbb{R}^5 \\to \\mathbb{R}^3$ is " +
    "one-to-one. Then say which step of your argument fails if you try to run it for " +
    "$\\mathbb{R}^3 \\to \\mathbb{R}^5$.",
  config: {
    modelAnswer:
      "**(a)** Suppose $\\sum_j c_j A\\mathbf{w}_j = \\mathbf{0}$. By linearity " +
      "$A\\left(\\sum_j c_j \\mathbf{w}_j\\right) = \\mathbf{0}$, so " +
      "$\\sum_j c_j \\mathbf{w}_j \\in \\operatorname{Null}(A)$. **Here is where the hypothesis " +
      "enters:** because the $\\mathbf{v}_i$ are a *basis* of the null space, that vector can be " +
      "written $\\sum_i d_i \\mathbf{v}_i$ for some scalars $d_i$. Rearranging, " +
      "$\\sum_j c_j \\mathbf{w}_j - \\sum_i d_i \\mathbf{v}_i = \\mathbf{0}$; but the $\\mathbf{v}$s " +
      "and $\\mathbf{w}$s together form a basis of $\\mathbb{R}^n$ and are therefore independent, " +
      "so every coefficient vanishes — in particular every $c_j = 0$. Hence the " +
      "$A\\mathbf{w}_j$ are independent. " +
      "**(b)** The image of a map $\\mathbb{R}^5 \\to \\mathbb{R}^3$ is a subspace of " +
      "$\\mathbb{R}^3$, so $\\operatorname{rank} \\le 3$. By the theorem with $n = 5$, " +
      "$\\dim\\operatorname{Null} = 5 - \\operatorname{rank} \\ge 2 > 0$, so some nonzero " +
      "$\\mathbf{v}$ has $A\\mathbf{v} = \\mathbf{0}$; then $A(\\mathbf{x}+\\mathbf{v}) = A\\mathbf{x}$ " +
      "for every $\\mathbf{x}$, two distinct inputs with one image, so the map is not one-to-one. " +
      "For $\\mathbb{R}^3 \\to \\mathbb{R}^5$ the failing step is the inequality: there $n = 3$ and " +
      "$\\operatorname{rank} \\le 3$, which permits $\\dim\\operatorname{Null} = 0$ — the argument " +
      "yields nothing, and indeed such maps can be one-to-one.",
    rubricId: "mod-struct-prove-rank-nullity",
    rubricVersion: 1,
    rubricText:
      "PASS requires: (a) the independence argument carried out — assume a vanishing combination of " +
      "the A w_j, pull the scalars inside by linearity, conclude the combination of w's lies in " +
      "Null(A), expand it in the v's, and use independence of the FULL basis to kill the c_j — AND " +
      "an explicit statement that expanding in the v's is where 'basis of the null space' is used; " +
      "(b) the impossibility argument via rank ≤ 3 ⇒ nullity ≥ 2 ⇒ a nonzero null vector ⇒ two " +
      "inputs with one image, AND identification of the rank inequality as the step that fails in " +
      "the reversed shape. Restating the theorem, or asserting independence without the argument, " +
      "is NOT a pass.",
  },
};

/**
 * 8. Similarity invariance, derived (E5 claim, human-scored; E6 target).
 * Discharges L10's deferred P3 credit. L10 states that rank and nullity survive
 * a change of basis; here the learner must DERIVE it from invertibility alone,
 * and then supply the counterexample that kills the converse.
 */
const modStructDeriveSimilarity: ExerciseDefinition = {
  id: "mod-struct-derive-similarity",
  type: "custom",
  capabilityId: SELF_CHECK_ID,
  tier: "transfer",
  prompt:
    "Let $P$ be the change-of-basis matrix for a basis $B$ of $\\mathbb{R}^n$, so " +
    "$[A]_B = P^{-1}AP$. " +
    "**(a)** Derive that $\\dim\\operatorname{Null}([A]_B) = \\dim\\operatorname{Null}(A)$ and hence " +
    "that $\\operatorname{rank}([A]_B) = \\operatorname{rank}(A)$, using only that $P$ is " +
    "invertible. Do not appeal to a formula you have not justified. " +
    "**(b)** Determinant, trace and rank are all invariant — yet they do **not** characterize " +
    "similarity. Give two $2\\times2$ matrices with the same determinant, the same trace and the " +
    "same rank that are nevertheless **not** similar, and prove that they are not.",
  config: {
    modelAnswer:
      "**(a)** $\\mathbf{x} \\in \\operatorname{Null}(P^{-1}AP)$ means " +
      "$P^{-1}AP\\mathbf{x} = \\mathbf{0}$. Multiplying by the invertible $P$ (which cannot " +
      "introduce or destroy a zero) this holds exactly when $AP\\mathbf{x} = \\mathbf{0}$, i.e. " +
      "exactly when $P\\mathbf{x} \\in \\operatorname{Null}(A)$. So $\\mathbf{x} \\mapsto P\\mathbf{x}$ " +
      "maps $\\operatorname{Null}([A]_B)$ onto $\\operatorname{Null}(A)$, and it is linear and " +
      "invertible — so it carries a basis to a basis and the two null spaces have the same " +
      "dimension. Both matrices act on $\\mathbb{R}^n$, so rank–nullity with the same $n$ forces " +
      "equal ranks too. " +
      "**(b)** Take $I = \\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}$ and " +
      "$N = \\begin{bmatrix} 1 & 1 \\\\ 0 & 1 \\end{bmatrix}$: both have determinant $1$, trace $2$ " +
      "and rank $2$. They are not similar, and the proof is one line: for **every** invertible $P$, " +
      "$P^{-1}IP = P^{-1}P = I$, so the only matrix similar to $I$ is $I$ itself — and $N \\ne I$.",
    rubricId: "mod-struct-derive-similarity",
    rubricVersion: 1,
    rubricText:
      "PASS requires: (a) an argument that uses invertibility of P to turn 'x kills [A]_B' into " +
      "'Px kills A', identifies x ↦ Px as a linear bijection between the two null spaces, and " +
      "concludes equal dimension — then gets rank equality from rank–nullity with the same n. " +
      "Asserting 'similar matrices have the same rank' is NOT a pass. (b) requires an explicit pair " +
      "with all three invariants matching AND a proof of non-similarity — the I-is-similar-only-to-" +
      "itself argument, or any equally complete one (e.g. via eigenspace dimension). A pair whose " +
      "invariants differ, or an unproved assertion that they are not similar, is NOT a pass.",
  },
};

/* -------------------------------------------------------------------------- */
/* D12 delayed retention — recognition after a delay (E1).                     */
/*                                                                             */
/* Low-stakes recognition on outcomes that already carry produced evidence      */
/* in-lesson. Multiple choice is the right form HERE and only here: the         */
/* measurement is whether the distinction survives a delay, not whether it can  */
/* be produced. Fresh dimensions/numbers, distinct from every lesson fixture.   */
/*                                                                             */
/* NOTE: the platform's spacing scheduler is hard-scoped to a single            */
/* SPACED_MODULE_ID (`src/platform/spacedConfig.ts`), so these are NOT spaced   */
/* sets in the platform sense and are not auto-scheduled. Until that is         */
/* generalized they must be administered manually after a delay — recorded as a */
/* tracked gap in the module's assessment plan, not silently ignored.           */
/* -------------------------------------------------------------------------- */

/** L8 retention: the two spaces sit in different ambient spaces. */
const modStructRetainTwoSpaces: ExerciseDefinition = {
  id: "mod-struct-retain-two-spaces",
  type: "multiple-choice",
  tier: "check",
  prompt:
    "Retrieval: for a $2 \\times 5$ matrix $A$, where do $\\operatorname{Col}(A)$ and " +
    "$\\operatorname{Null}(A)$ live?",
  choices: [
    "Both in $\\mathbb{R}^5$",
    "Both in $\\mathbb{R}^2$",
    "$\\operatorname{Col}(A) \\subseteq \\mathbb{R}^2$ and $\\operatorname{Null}(A) \\subseteq \\mathbb{R}^5$",
    "$\\operatorname{Col}(A) \\subseteq \\mathbb{R}^5$ and $\\operatorname{Null}(A) \\subseteq \\mathbb{R}^2$",
  ],
  correctChoice: 2,
  explanation:
    "Outputs of a $2\\times5$ map have $2$ entries, so $\\operatorname{Col}(A) \\subseteq \\mathbb{R}^2$; " +
    "inputs have $5$, so $\\operatorname{Null}(A) \\subseteq \\mathbb{R}^5$. Existence is decided in " +
    "the output space, uniqueness in the input space — and here they are not even subsets of the " +
    "same $\\mathbb{R}^k$, so comparing them is not a well-formed question.",
};

/** L9 retention: the total is n, the INPUT dimension. */
const modStructRetainTotalN: ExerciseDefinition = {
  id: "mod-struct-retain-total-n",
  type: "multiple-choice",
  tier: "check",
  prompt:
    "Retrieval: a linear map $\\mathbb{R}^6 \\to \\mathbb{R}^4$ has $\\operatorname{rank} 3$. What " +
    "is $\\dim\\operatorname{Null}(A)$?",
  choices: ["$1$", "$2$", "$3$", "$4$"],
  correctChoice: 2,
  explanation:
    "The budget being spent is the **input** dimension: $\\operatorname{rank} + \\text{nullity} = n = 6$, " +
    "so the nullity is $6 - 3 = 3$. Answering $1$ means using $m = 4$, the output dimension — the " +
    "one substitution the law does not survive.",
};

/** L10 retention: which of P, P⁻¹ converts in which direction. */
const modStructRetainPDirection: ExerciseDefinition = {
  id: "mod-struct-retain-p-direction",
  type: "multiple-choice",
  tier: "check",
  prompt:
    "Retrieval: $P$'s columns are the vectors of a basis $B$, written in standard coordinates. " +
    "Which matrix turns a $B$-coordinate list $[\\mathbf{x}]_B$ into standard coordinates?",
  choices: [
    "$P$",
    "$P^{-1}$",
    "$P^{\\mathsf{T}}$",
    "Either — the direction is a convention you may choose",
  ],
  correctChoice: 0,
  explanation:
    "Read it off $P$'s columns rather than recalling it: $P\\mathbf{e}_1$ is $P$'s first column, " +
    "which is $\\mathbf{b}_1$ in standard coordinates — and $\\mathbf{e}_1$ is exactly " +
    "$[\\mathbf{b}_1]_B$. So $P$ consumes $B$-coordinates and returns standard ones, and " +
    "$\\mathbf{x} = P[\\mathbf{x}]_B$. Going the other way needs $P^{-1}$. ($P^{\\mathsf{T}}$ would " +
    "do only for an orthonormal basis, which is a later lesson's luxury.)",
};

/** All `structure` module items, in a stable authored order. */
export const STRUCTURE_MODULE_ITEMS: readonly ExerciseDefinition[] = [
  modStructRankNullityLedger,
  modStructEigenShift,
  modStructCobMatrixFresh,
  modStructSelectMethod,
  modStructDiagnoseColspace,
  modStructProveSubspaceInclusion,
  modStructProveRankNullity,
  modStructDeriveSimilarity,
  modStructRetainTwoSpaces,
  modStructRetainTotalN,
  modStructRetainPDirection,
];
