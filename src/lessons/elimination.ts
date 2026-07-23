import type { LessonDefinition } from "./types";
import { LINEAR_SYSTEM_FRESH as EX2 } from "./exampleData";
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
 * rewrite is legitimate. This lesson exercises the platform capabilities
 * (committed prediction, exercise sequences, matrix entry, construction, a fresh
 * error diagnosis + repair, and a self-checked proof) against that single idea.
 *
 * Evidence honesty (mastery-standard §5): multiple-choice and committed-MC are E1
 * recognition; E3 requires fresh unaided production of the complete outcome; E4 is
 * unfamiliar transfer/construction; self-check is an unscored E6 surface. The
 * diagnosis (produced on an unfamiliar erroneous elimination) and the degenerate
 * zero-pivot swap are the in-lesson E4 transfers; the invariance proof and the
 * diagnosis explanation stay unscored E6 surfaces, so Gate 8 is NOT PASSED until
 * human scoring (module Package F) — see the mastery contract.
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
        // Fresh-instance production (E3) on a different system.
        "elim-sequence-forward-fresh",
        "elim-matrix-after-step-fresh",
        // Recognition check (E1) kept, plus a FRESH, unfamiliar diagnosis where the
        // learner PRODUCES the erroneous coefficient + repair (E4 transfer) and then
        // writes the explanation, then an elimination-to-contradiction-row production.
        "elim-diagnose-illegal",
        "elim-diagnose-repair-fresh",
        "elim-diagnose-explain-fresh",
        "elim-contradiction-row-fresh",
        // A non-duplicative construction (distinct columns + the infinite case) —
        // the previous construct duplicated the L3 item and is removed.
        "elim-construct-infinite",
        // In-lesson E4 unfamiliar-transfer: a zero-pivot configuration that forces a
        // row swap (never walked through in the worked example or drills).
        "elim-degenerate-pivot-transfer",
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
      body: "The nonzero condition on scaling is not fussiness — it is the whole safety guarantee. Multiplying a row by $0$ turns it into $0 = 0$, which every point satisfies: the constraint is **gone**, and you can never divide back to recover it. A system with one solution can suddenly appear to have a whole line of them. (Adding a row *to itself*, $R_i \\to R_i + R_i$, is perfectly legal — it is just the nonzero scaling $R_i \\to 2R_i$ in disguise, and it is reversible. The replacement operation is *defined* with $i \\ne j$ only so it names a genuinely different move; the $i = j$ case is not illegal, merely a scaling.) Diagnosing an illegal step is a real skill: if a manipulation is not reversible, the solution set is no longer guaranteed to be the one you started with.",
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
  // repeat both on a FRESH system (the `*-fresh` E3 production drills, on
  // `systems-fresh`, so the answer cannot be recalled) → diagnose an illegal move
  // → PRODUCE the diagnosis + repair on an UNFAMILIAR erroneous elimination and
  // explain it → run elimination to a contradiction row → construct the infinite
  // case → transfer to a DEGENERATE zero-pivot system that forces a swap (E4) →
  // explain the invariance in your own words. These use the platform capabilities
  // (committed prediction, sequence, matrix entry, construction, self-check)
  // reached through the `custom` escape hatch. The committed prediction
  // (`elim-predict-fixed-point`) is placed FIRST in the route, before the Watch
  // visual, so it is a real prediction; the rest follow after Explore. The
  // self-checked proof and the diagnosis explanation are E6 *surfaces*: full credit
  // is awarded by human scoring in the module assessment, not the in-app self-mark.
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
      // Package B — fresh-instance elimination (E3): a DIFFERENT system, so the
      // multiplier, pivot arithmetic, and result cannot be recalled from the
      // worked example. System: x + 2y = 4 ; 3x + y = -3, solution (-2, 3).
      id: "elim-sequence-forward-fresh",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "A different system: step through forward elimination on $\\begin{cases} x + 2y = 4 \\\\ 3x + y = -3 \\end{cases}$.",
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt:
              "Which operation clears $x$ from $R_2$, using $R_1$ as the pivot?",
            choices: [
              "$R_2 \\to R_2 - 3\\,R_1$",
              "$R_2 \\to R_2 - 2\\,R_1$",
              "$R_1 \\leftrightarrow R_2$",
              "$R_2 \\to R_2 + 3\\,R_1$",
            ],
            correctChoice: 0,
            explanation:
              "The entry below the pivot is $3$ and the pivot is $1$, so the multiplier is $-3/1 = -3$: subtract $3\\,R_1$ from $R_2$.",
          },
          {
            kind: "numeric",
            prompt:
              "After $R_2 \\to R_2 - 3\\,R_1$, what is the new coefficient of $y$ in $R_2$?",
            expected: -5,
            explanation: "The $y$-coefficient becomes $1 - 3\\cdot 2 = -5$.",
          },
          {
            kind: "numeric",
            prompt: "The new $R_2$ reads $-5y = -15$. What is $y$?",
            expected: EX2.solution[1],
            explanation: "$y = -15 / (-5) = 3$.",
          },
          {
            kind: "numeric",
            prompt: "Back-substitute into $R_1$ ($x + 2y = 4$). What is $x$?",
            expected: EX2.solution[0],
            explanation: "$x = 4 - 2(3) = -2$, so $(x, y) = (-2, 3)$.",
          },
        ],
      },
    },
    {
      // Package B — fresh-instance matrix production (E3).
      id: "elim-matrix-after-step-fresh",
      type: "custom",
      capabilityId: MATRIX_ENTRY_ID,
      tier: "drill",
      prompt:
        "Enter the augmented matrix $[A \\mid \\mathbf{b}]$ that results from applying $R_2 \\to R_2 - 3\\,R_1$ to $\\left[\\begin{array}{cc|c} 1 & 2 & 4 \\\\ 3 & 1 & -3 \\end{array}\\right]$.",
      config: {
        rows: 2,
        cols: 3,
        expected: [
          [1, 2, 4],
          [0, -5, -15],
        ],
        explanation:
          "$R_1$ is unchanged. $R_2$ becomes $(3, 1, -3) - 3(1, 2, 4) = (0, -5, -15)$ — the triangular system $x + 2y = 4$, $-5y = -15$.",
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
      // In-lesson E4 unfamiliar transfer: a wrong-sign multiplier on a system used
      // NOWHERE else in the module. The learner PRODUCES the diagnosis (computes the
      // erroneous x-coefficient the bad move yields, which should have been 0) and
      // then PRODUCES the repaired row — no multiple-choice recognition step.
      id: "elim-diagnose-repair-fresh",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt:
        "A classmate tried to clear $x$ from $R_2$ of $\\begin{cases} x + 4y = 9 \\\\ 2x + 3y = 8 \\end{cases}$ and wrote $R_2 \\to R_2 + 2\\,R_1$. Produce the diagnosis, then repair it.",
      config: {
        steps: [
          {
            kind: "numeric",
            prompt:
              "Diagnose by computing: after the classmate's $R_2 \\to R_2 + 2\\,R_1$, what is the new $x$-coefficient in $R_2$? (Clearing $x$ should make it $0$.)",
            expected: 4,
            explanation:
              "$2 + 2\\cdot 1 = 4$ — not $0$. Adding $2\\,R_1$ pushes the $x$-coefficient to $4$ instead of cancelling it: the multiplier has the wrong sign.",
          },
          {
            kind: "numeric",
            prompt:
              "Repair it: with the correct $R_2 \\to R_2 - 2\\,R_1$, what is the new $y$-coefficient in $R_2$?",
            expected: -5,
            explanation: "$3 - 2\\cdot 4 = -5$.",
          },
          {
            kind: "numeric",
            prompt: "And the new right-hand side of $R_2$?",
            expected: -10,
            explanation:
              "$8 - 2\\cdot 9 = -10$, giving the triangular row $-5y = -10$ (so $y = 2$, then $x = 1$). The repaired move is reversible; the classmate's $+2\\,R_1$ was not a clearing step at all.",
          },
        ],
      },
    },
    {
      // The produced EXPLANATION half of the diagnosis (the reviewer's "produced
      // diagnosis/explanation"): the learner writes WHY adding fails and what rule
      // fixes it. An unscored E6 surface — the self-mark is not credit; human scoring
      // is module Package F.
      id: "elim-diagnose-explain-fresh",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt:
        "In your own words: explain why the classmate's $R_2 \\to R_2 + 2\\,R_1$ fails to clear $x$, and state the rule that gives the correct multiplier. Write your explanation, then compare with the model answer.",
      config: {
        modelAnswer:
          "To clear $x$ from $R_2$ you must cancel the entry $2$ below the pivot $1$. The replacement $R_2 \\to R_2 + m\\,R_1$ changes the $x$-coefficient to $2 + m\\cdot 1$, which is $0$ only when $m = -2$. Adding ($m = +2$) drives it to $4$ — the wrong direction. The rule: the multiplier is $m = -(\\text{entry below the pivot}) / (\\text{pivot}) = -2/1 = -2$, i.e. **subtract** $2\\,R_1$. That move is reversible (undo with $R_2 \\to R_2 + 2\\,R_1$), so it preserves the solution set; the classmate's was simply not the clearing operation.",
        rubric:
          "A strong answer states that clearing needs the $x$-coefficient $2 + m$ to be $0$, so $m = -2$ (subtract), identifies the multiplier rule $m = -(\\text{below})/(\\text{pivot})$, and notes the correct move is reversible.",
      },
    },
    {
      // Replaces the former construct that DUPLICATED the L3 columns (1,2),(3,6).
      // Here the learner actually RUNS elimination on a fresh inconsistent system
      // and produces the resulting contradiction row (E3 production).
      id: "elim-contradiction-row-fresh",
      type: "custom",
      capabilityId: MATRIX_ENTRY_ID,
      tier: "transfer",
      prompt:
        "Run one elimination step on the fresh system $\\left[\\begin{array}{cc|c} 1 & 2 & 1 \\\\ 4 & 8 & 6 \\end{array}\\right]$: apply $R_2 \\to R_2 - 4\\,R_1$ and enter the resulting augmented matrix.",
      config: {
        rows: 2,
        cols: 3,
        expected: [
          [1, 2, 1],
          [0, 0, 2],
        ],
        explanation:
          "$R_2$ becomes $(4, 8, 6) - 4(1, 2, 1) = (0, 0, 2)$ — the contradiction row $0 = 2$. The coefficients vanished but the right-hand side did not, so the system is inconsistent (no solution). This is how elimination *certifies* 'no solution': a row $0 = (\\text{nonzero})$.",
        matrixName: "[A\\,|\\,b]",
      },
    },
    {
      // Genuine graded construction (E4) — distinct columns from L3 AND the other
      // classification (infinitely many), so it is not a duplicate. Keeps the
      // construct-in-explorer capability exercised in this lesson.
      id: "elim-construct-infinite",
      type: "custom",
      capabilityId: CONSTRUCT_IN_EXPLORER_ID,
      tier: "transfer",
      prompt:
        "The other degenerate outcome: take the dependent coefficients whose columns are $(1, 3)$ and $(2, 6)$. Commit a target $\\mathbf{b}$ for which elimination collapses $R_2$ to $0 = 0$ — i.e. $A\\mathbf{x} = \\mathbf{b}$ has **infinitely many** solutions.",
      config: {
        target: "vector2",
        check: {
          kind: "system-classification",
          matrix: [
            [1, 2],
            [3, 6],
          ],
          expect: "infinite",
        },
        reveal:
          "Any $\\mathbf{b}$ **on** the line spanned by $(1, 3)$ works — for instance $(1, 3)$ or $(2, 6)$. Eliminating $x$ then leaves $0 = 0$: a true-but-empty row that drops one constraint, so the surviving line's worth of points all solve the system. A $\\mathbf{b}$ off the line would instead give $0 = (\\text{nonzero})$ and no solution.",
      },
    },
    {
      // In-lesson E4 unfamiliar transfer: a DEGENERATE zero-pivot configuration. The
      // worked example and every drill had a nonzero pivot in place; here $a_{11}=0$,
      // so $R_1$ cannot clear $x$ and the learner must transfer the (so-far unused)
      // swap operation, then produce the solution by the non-standard route.
      id: "elim-degenerate-pivot-transfer",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt:
        "A degenerate case you have not seen: $\\left[\\begin{array}{cc|c} 0 & 1 & 4 \\\\ 2 & 3 & 10 \\end{array}\\right]$. The pivot position $a_{11}$ is $0$.",
      config: {
        steps: [
          {
            kind: "multiple-choice",
            prompt:
              "Since $a_{11} = 0$, $R_1$ cannot be used to clear $x$ from $R_2$. Which legal operation lets elimination proceed?",
            choices: [
              "Swap $R_1 \\leftrightarrow R_2$",
              "Scale $R_1$ by $0$",
              "$R_2 \\to R_2 + R_1$",
              "Multiply $R_2$ by $0$",
            ],
            correctChoice: 0,
            explanation:
              "Swapping brings the nonzero pivot ($2$) into the top-left. Scaling by $0$ is illegal (irreversible), and adding $R_1$ leaves $a_{11} = 0$ untouched.",
          },
          {
            kind: "numeric",
            prompt:
              "After $R_1 \\leftrightarrow R_2$ the system is $\\left[\\begin{array}{cc|c} 2 & 3 & 10 \\\\ 0 & 1 & 4 \\end{array}\\right]$ — already triangular. Read off $y$ from the new $R_2$.",
            expected: 4,
            explanation: "The new $R_2$ is $y = 4$.",
          },
          {
            kind: "numeric",
            prompt: "Back-substitute into $2x + 3y = 10$. Enter $x$.",
            expected: -1,
            explanation:
              "$2x + 3(4) = 10 \\Rightarrow 2x = -2 \\Rightarrow x = -1$, so $(x, y) = (-1, 4)$. A row swap is one of the three legal operations, so it preserves the solution set — you just needed to transfer it to a case the drills never forced.",
          },
        ],
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
