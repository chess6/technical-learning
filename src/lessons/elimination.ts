import type { LessonDefinition } from "./types";
import {
  COMMITTED_PREDICTION_ID,
  CONSTRUCT_IN_EXPLORER_ID,
  EXERCISE_SEQUENCE_ID,
  MATRIX_ENTRY_ID,
  SELF_CHECK_ID,
} from "./capabilities";

/**
 * Lesson: "Elimination — Rewriting a System Without Changing Its Answer".
 *
 * Sits AFTER "Linear Systems" (which reveals the row / column pictures and the
 * no / one / infinitely-many trichotomy) and BEFORE determinants. It reuses
 * Lesson 3's exact running system A = [[1,3],[2,-1]], b = (−1,5), solution
 * (2, −1), so the learner watches a computation they have already solved get
 * *rewritten* rather than re-solved.
 *
 * Core mental model (one sentence): elimination is not a bag of arithmetic
 * tricks — each row operation replaces the current constraints with different
 * constraints that describe exactly the same solution set.
 *
 * The whole lesson is organized around one visual fact: when R2 → R2 − 2·R1,
 * the added multiple of R1 vanishes at the solution, so the second line pivots
 * about the fixed crossing point. The point does not move — which is *why* the
 * rewrite is legitimate. This lesson exercises the new platform capabilities
 * (committed prediction, exercise sequences, construction, error diagnosis via
 * multiple choice, and a self-checked proof) against that single idea.
 */
export const eliminationLesson: LessonDefinition = {
  id: "elimination",
  title: "Elimination: Rewriting a System Without Changing Its Answer",
  subtitle:
    "Each row operation swaps the constraints for different ones with exactly the same solution set",
  learningObjectives: [
    "Rewrite a system with **elementary row operations** into an equivalent, easier system — without changing its solution set",
    "Name the three elementary operations (swap, scale by a nonzero factor, add a multiple of one row to another) and see why each is reversible",
    "Run forward elimination on a $2\\times 2$ system to **triangular** form, then back-substitute",
    "Diagnose an illegal move — scaling a row by $0$ — that destroys a constraint and changes the solution set",
    "Explain **why** a row operation preserves the solution set: each new equation is a combination of the old ones, and the move can be undone",
  ],
  motivatingQuestion:
    "You already know how to solve $\\begin{cases} x + 3y = -1 \\\\ 2x - y = 5 \\end{cases}$. Instead of re-solving it, what if you rewrote it into a system so simple you could read the answer off? If you change the equations, how can you be sure you have not changed the answer?",
  route: [
    { kind: "motivate" },
    { kind: "section", sectionId: "why-rewrite" },
    // Committed prediction FIRST — before the operation is ever shown — so it is
    // a genuine prediction (testing effect), not recall after the reveal.
    {
      kind: "practice",
      exerciseIds: ["elim-predict-fixed-point"],
      title: "Predict first",
    },
    // Watch: R2 → R2 − 2·R1 pivots the second line about the fixed crossing,
    // in three synchronized views (equations, augmented matrix, lines).
    { kind: "visual" },
    { kind: "section", sectionId: "three-operations" },
    { kind: "formal", formalId: "def-row-operation" },
    { kind: "formal", formalId: "thm-invariance" },
    // One full pass of forward elimination + back-substitution.
    { kind: "worked" },
    { kind: "check" },
    { kind: "section", sectionId: "illegal-moves" },
    { kind: "explore" },
    // The remaining practice (drill → transfer) lands after Explore; the
    // committed prediction has already been made above, before the reveal.
    {
      kind: "practice",
      exerciseIds: [
        "elim-sequence-forward",
        "elim-matrix-after-step",
        "elim-diagnose-illegal",
        "elim-construct-inconsistent",
        "elim-explain-invariance",
      ],
    },
    { kind: "summary" },
  ],
  sections: [
    {
      id: "why-rewrite",
      title: "Rewrite, don't re-solve",
      body: "Solving a system twice is wasted effort; the smarter move is to **replace** it with an easier system that has the *same* solutions. The tool is the **elementary row operation**. To keep the bookkeeping tight, stack the coefficients and the right-hand side into one **augmented matrix** $[A \\mid \\mathbf{b}]$ — every operation acts on a whole row (coefficients *and* right-hand side) at once. The goal of forward elimination is to reach a **triangular** system, where the last equation involves a single unknown and the rest fall out by back-substitution.",
      equation:
        "\\begin{cases} x + 3y = -1 \\\\ 2x - y = 5 \\end{cases} \\quad\\longleftrightarrow\\quad \\left[\\begin{array}{cc|c} 1 & 3 & -1 \\\\ 2 & -1 & 5 \\end{array}\\right]",
      observation:
        "The bracket on the right is the same system as the braces on the left — just packed so a row operation is one clean move.",
    },
    {
      id: "three-operations",
      title: "Three moves, all reversible",
      body: "There are exactly three **elementary row operations**, and the thing they share is the whole point: each one can be **undone**. Swapping two rows is undone by swapping back. Multiplying a row by a nonzero $k$ is undone by dividing by $k$. Replacing a row with itself plus a multiple of another is undone by subtracting that same multiple. Because every move is reversible, no solution can be created or lost — the new system is **equivalent** to the old one.",
      equation:
        "R_i \\leftrightarrow R_j \\qquad R_i \\to k\\,R_i\\ (k \\neq 0) \\qquad R_i \\to R_i + k\\,R_j",
      observation:
        "Reversibility is the license. A move you can undo cannot have thrown away or invented a solution.",
    },
    {
      id: "illegal-moves",
      title: "The move that is not allowed",
      body: "The nonzero condition on scaling is not fussiness — it is the whole safety guarantee. Multiplying a row by $0$ turns it into $0 = 0$, which every point satisfies: the constraint is **gone**, and you can never divide back to recover it. A system with one solution can suddenly appear to have a whole line of them. (Likewise, 'adding a row to itself' is really a disguised scaling, not an elementary move.) Diagnosing an illegal step is a real skill: if a manipulation is not reversible, the solution set is no longer guaranteed to be the one you started with.",
      observation:
        "Legal row operations are exactly the reversible ones. Scaling by $0$ is irreversible — so it is off-limits.",
    },
  ],
  formalBlocks: [
    {
      id: "def-row-operation",
      kind: "definition",
      label: "Elementary row operations and equivalent systems",
      statement:
        "An **elementary row operation** on the augmented matrix $[A \\mid \\mathbf{b}]$ is one of: (1) **swap** two rows $R_i \\leftrightarrow R_j$; (2) **scale** a row by a nonzero constant $R_i \\to k\\,R_i$, $k \\neq 0$; (3) **replace** a row by itself plus a multiple of another, $R_i \\to R_i + k\\,R_j$ ($i \\neq j$). Two systems are **equivalent** when they have exactly the same solution set.",
      interpretation:
        "Each operation acts on an entire equation — coefficients and right-hand side together. The definition is engineered so every operation is invertible; that invertibility is what the next result turns into a guarantee about solutions.",
      visibility: "visible",
    },
    {
      id: "thm-invariance",
      kind: "theorem",
      label: "Row operations preserve the solution set",
      statement:
        "If a system is obtained from another by a single elementary row operation, the two systems are **equivalent**: they have exactly the same solution set.",
      interpretation:
        "This is the theorem that makes elimination trustworthy. Rewriting the equations — even dramatically, into triangular form — never moves, adds, or deletes a single solution. The crossing point you watched stay fixed is this theorem in one picture.",
      visibility: "revealed",
      layers: [
        {
          kind: "math-note",
          title: "Proof (the replacement move; the others are easier)",
          body: "Take $R_2 \\to R_2 + k\\,R_1$. **No solution is lost:** if $(x, y)$ satisfies the old $R_1$ and $R_2$, then it satisfies any sum of them, so it satisfies the new $R_2 = R_2 + k\\,R_1$ (and $R_1$ is unchanged) — the new system holds. **No solution is gained:** the operation is reversible by $R_2 \\to R_2 - k\\,R_1$, so by the same argument every solution of the new system solves the old one. The two solution sets contain each other, hence are equal. Swapping rows reorders equations (same set), and scaling by $k \\neq 0$ is reversible by $\\tfrac{1}{k}$ — the identical containment argument applies. $\\blacksquare$",
        },
        {
          kind: "connection",
          title: "Why the crossing point cannot move",
          body: "Geometrically: the solution $(2, -1)$ satisfies $R_1$, so $2\\,R_1$ evaluated there is a true equation. Adding $-2\\,R_1$ to $R_2$ changes $R_2$ by something that is $0 = 0$ at the solution — so the new line still passes through $(2, -1)$. The line pivots *about* the fixed point. That is the theorem, drawn.",
        },
      ],
    },
  ],
  guidedSceneId: "elimination",
  explorationId: "elimination",
  workedExamples: [
    {
      id: "elim-forward",
      title: "Forward elimination, then back-substitution",
      prompt:
        "Solve $\\begin{cases} x + 3y = -1 \\\\ 2x - y = 5 \\end{cases}$ by elimination. Use $R_1$ as the pivot to clear $x$ from $R_2$, reach a triangular system, then back-substitute.",
      exampleId: "systems-default",
      equations: [
        "\\left[\\begin{array}{cc|c} 1 & 3 & -1 \\\\ 2 & -1 & 5 \\end{array}\\right]",
        "R_2 \\to R_2 - 2\\,R_1 \\quad (\\text{the multiplier is } 2/1 = 2)",
        "R_2:\\ (2,\\,-1,\\,5) - 2\\,(1,\\,3,\\,-1) = (0,\\,-7,\\,7)",
        "\\left[\\begin{array}{cc|c} 1 & 3 & -1 \\\\ 0 & -7 & 7 \\end{array}\\right] \\quad\\Longleftrightarrow\\quad \\begin{cases} x + 3y = -1 \\\\ -7y = 7 \\end{cases}",
        "-7y = 7 \\;\\Rightarrow\\; y = -1",
        "x + 3(-1) = -1 \\;\\Rightarrow\\; x = 2",
        "(x, y) = (2, -1) \\quad \\checkmark \\ \\text{— the same solution Lesson 3 found}",
      ],
      equationsAriaLabel:
        "Starting from the augmented matrix, replace row two with row two minus twice row one, giving the row zero, minus seven, seven; the triangular system has minus seven y equals seven so y equals minus one, and back-substitution into row one gives x equals two, the solution two, minus one.",
      layers: [
        {
          kind: "trap",
          title: "The multiplier's sign",
          body: "To clear a positive $2$ below the pivot you **subtract** $2\\,R_1$ (equivalently add $-2\\,R_1$). A common slip is adding $+2\\,R_1$, which doubles the $x$-term instead of cancelling it. The rule: the multiplier is $-(\\text{entry below pivot}) / (\\text{pivot})$.",
        },
      ],
    },
  ],
  callouts: [
    {
      id: "elim-not-tricks",
      title: "\u201cElimination is a bag of arithmetic tricks\u201d",
      belief:
        "The row operations feel like memorized manipulations you apply until the numbers work out.",
      confront:
        "But every step is one reversible move on a whole equation, and the theorem says each keeps the solution set identical — the triangular system at the end is not an approximation or a shortcut, it is the *same* system.",
      resolve:
        "Elimination replaces constraints with equivalent constraints. The arithmetic is just how you carry out a move whose correctness is already guaranteed.",
    },
  ],
  checkpoint: {
    prompt:
      "You are about to apply $R_2 \\to R_2 - 2\\,R_1$ to the system whose solution is $(2, -1)$. Predict what happens to that solution point, and say why.",
    answer:
      "It stays exactly at $(2, -1)$. The change added to $R_2$ is $-2\\,R_1$, and $R_1$ is a true equation at $(2, -1)$, so the added part contributes $0 = 0$ there — the new $R_2$ still passes through the point. More generally the move is reversible ($R_2 \\to R_2 + 2\\,R_1$ undoes it), so it cannot move, add, or delete any solution.",
  },
  // Practice derives the idea rather than quizzing it: predict the effect of an
  // operation → step through one elimination → record the result as a matrix →
  // diagnose an illegal move → construct the inconsistent case elimination
  // exposes → explain the invariance in your own words. These use the platform
  // capabilities (committed prediction, sequence, matrix entry, construction,
  // self-check) reached through the `custom` escape hatch. The committed
  // prediction (`elim-predict-fixed-point`) is placed FIRST in the route, before
  // the Watch visual, so it is a real prediction; the rest follow after Explore.
  exercises: [
    {
      id: "elim-predict-fixed-point",
      type: "custom",
      capabilityId: COMMITTED_PREDICTION_ID,
      tier: "check",
      prompt:
        "Commit a prediction before computing. You apply $R_2 \\to R_2 - 2\\,R_1$ to $\\begin{cases} x + 3y = -1 \\\\ 2x - y = 5 \\end{cases}$, whose solution is $(2, -1)$. What happens to the solution?",
      config: {
        options: [
          "It moves to a new crossing point",
          "It stays at $(2, -1)$ — the new $R_2$ still passes through it",
          "The system loses all solutions",
        ],
        correctIndex: 1,
        reveal:
          "It stays at $(2, -1)$. The added part $-2\\,R_1$ evaluates to $0 = 0$ at the solution (because $R_1$ holds there), so the new line pivots about the fixed point. That is exactly why the rewrite is legal.",
      },
    },
    {
      id: "elim-sequence-forward",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "Step through forward elimination on $\\begin{cases} x + 3y = -1 \\\\ 2x - y = 5 \\end{cases}$.",
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt:
              "Which operation clears $x$ from $R_2$, using $R_1$ as the pivot?",
            choices: [
              "$R_2 \\to R_2 - 2\\,R_1$",
              "$R_1 \\leftrightarrow R_2$",
              "$R_1 \\to 2\\,R_1$",
              "$R_2 \\to R_2 + 2\\,R_1$",
            ],
            correctChoice: 0,
            explanation:
              "The entry below the pivot is $2$ and the pivot is $1$, so the multiplier is $-2/1 = -2$: subtract $2\\,R_1$ from $R_2$.",
          },
          {
            kind: "numeric",
            prompt:
              "After $R_2 \\to R_2 - 2\\,R_1$, what is the new coefficient of $y$ in $R_2$?",
            expected: -7,
            explanation:
              "The $y$-coefficient becomes $-1 - 2\\cdot 3 = -7$.",
          },
          {
            kind: "numeric",
            prompt: "The new $R_2$ reads $-7y = 7$. What is $y$?",
            expected: -1,
            explanation: "$y = 7 / (-7) = -1$.",
          },
          {
            kind: "numeric",
            prompt:
              "Back-substitute into $R_1$ ($x + 3y = -1$). What is $x$?",
            expected: 2,
            explanation: "$x = -1 - 3(-1) = 2$, so $(x, y) = (2, -1)$.",
          },
        ],
      },
    },
    {
      id: "elim-matrix-after-step",
      type: "custom",
      capabilityId: MATRIX_ENTRY_ID,
      tier: "drill",
      prompt:
        "Enter the augmented matrix $[A \\mid \\mathbf{b}]$ that results from applying $R_2 \\to R_2 - 2\\,R_1$ to $\\left[\\begin{array}{cc|c} 1 & 3 & -1 \\\\ 2 & -1 & 5 \\end{array}\\right]$.",
      config: {
        rows: 2,
        cols: 3,
        expected: [
          [1, 3, -1],
          [0, -7, 7],
        ],
        explanation:
          "$R_1$ is unchanged. $R_2$ becomes $(2, -1, 5) - 2(1, 3, -1) = (0, -7, 7)$ — the triangular system $x + 3y = -1$, $-7y = 7$.",
        matrixName: "[A\\,|\\,b]",
      },
    },
    {
      id: "elim-diagnose-illegal",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "Error diagnosis: which of these is **not** a legal row operation — i.e. it can change the solution set?",
      choices: [
        "$R_1 \\leftrightarrow R_2$ (swap the two rows)",
        "$R_2 \\to 3\\,R_2$ (scale by $3$)",
        "$R_2 \\to 0\\cdot R_2$ (scale by $0$)",
        "$R_2 \\to R_2 + 2\\,R_1$ (add a multiple of $R_1$)",
      ],
      correctChoice: 2,
      explanation:
        "Scaling by $0$ turns $R_2$ into $0 = 0$, erasing its constraint. It is irreversible (you cannot divide back by $0$), so solutions that violated the old $R_2$ can appear — the solution set can grow. The other three are reversible and safe.",
    },
    {
      id: "elim-construct-inconsistent",
      type: "custom",
      capabilityId: CONSTRUCT_IN_EXPLORER_ID,
      tier: "transfer",
      prompt:
        "Elimination exposes an unsolvable system as a contradiction row $0 = (\\text{nonzero})$. Take the dependent coefficients whose columns are $(1, 2)$ and $(2, 4)$. Commit a target $\\mathbf{b}$ for which $A\\mathbf{x} = \\mathbf{b}$ has **no solution**.",
      config: {
        target: "vector2",
        check: {
          kind: "system-classification",
          matrix: [
            [1, 2],
            [2, 4],
          ],
          expect: "none",
        },
        reveal:
          "Any $\\mathbf{b}$ off the line spanned by $(1, 2)$ works — e.g. $(1, 0)$. Eliminating $x$ then leaves a row $0 = c$ with $c \\neq 0$: the impossible equation that certifies 'no solution'.",
        hint:
          "Pick a $\\mathbf{b}$ that is not a multiple of $(1, 2)$ — say $(1, 0)$ — so it lies off the columns' line.",
      },
    },
    {
      id: "elim-explain-invariance",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt:
        "In your own words: why can replacing $R_2$ with $R_2 + k\\,R_1$ never change the solution set? Write your explanation, then compare with the model answer.",
      config: {
        modelAnswer:
          "No solution is lost: any $(x, y)$ satisfying both old equations also satisfies any combination of them, so it satisfies the new $R_2 = R_2 + k\\,R_1$ (and $R_1$ is untouched). No solution is gained: the move is reversible by $R_2 \\to R_2 - k\\,R_1$, so every solution of the new system solves the old one too. Each solution set contains the other, so they are equal.",
        rubric:
          "A strong answer names both directions (nothing lost, nothing gained) and points to reversibility as the reason nothing is gained.",
      },
    },
  ],
  keyTakeaway:
    "Elimination rewrites a system with **elementary row operations** — swap, scale by a nonzero factor, add a multiple of one row to another — each of which is **reversible** and therefore leaves the solution set exactly unchanged. Forward elimination drives the system to triangular form ($x + 3y = -1$, $-7y = 7$) so you can read $y = -1$ and back-substitute to $x = 2$. The one illegal move is scaling by $0$: it erases a constraint and cannot be undone. The reason the crossing point never moves is a one-line proof — the change you add is a combination that is $0 = 0$ at the solution — and the reason it is the *right* answer is the same theorem the determinant will soon detect at a glance.",
  structuredSummary: {
    coreMentalModel:
      "A row operation replaces the constraints with different constraints that describe exactly the same solution set.",
    definitionsIntroduced: [
      "Elementary row operation (swap, scale by $k \\neq 0$, add a multiple of another row)",
      "Augmented matrix $[A \\mid \\mathbf{b}]$; equivalent systems; triangular form",
    ],
    mainResult:
      "Every elementary row operation is reversible, so it preserves the solution set — elimination never changes the answer.",
    representationsConnected:
      "Written equations $\\leftrightarrow$ augmented matrix $\\leftrightarrow$ two constraint lines: one row operation changes all three while the crossing point stays fixed.",
    commonMistake:
      "Treating elimination as arithmetic tricks — or scaling a row by $0$, which erases a constraint and is irreversible.",
    canonicalExample:
      "$R_2 \\to R_2 - 2\\,R_1$ on $[[1,3\\mid-1],[2,-1\\mid5]]$ gives $[[1,3\\mid-1],[0,-7\\mid7]]$, so $y = -1$, $x = 2$.",
    oneProblemWorthRemembering:
      "Why does the new $R_2$ still pass through $(2, -1)$? Because the part you added, $-2\\,R_1$, is $0 = 0$ at the solution.",
    whatThisUnlocksNext:
      "Triangular form makes uniqueness a question about the pivots — the boundary the determinant will measure with a single number.",
  },
  exampleId: "systems-default",
};
