import type { LessonDefinition } from "./types";
import { LINEAR_SYSTEM_EXAMPLE as EX, LINEAR_SYSTEM_FRESH as EX2 } from "./exampleData";
import {
  COMMITTED_PREDICTION_ID,
  CONSTRUCT_IN_EXPLORER_ID,
  EXERCISE_SEQUENCE_ID,
  MATRIX_ENTRY_ID,
  SELF_CHECK_ID,
} from "./capabilities";

/**
 * Lesson: "Linear Systems — Two Pictures of One Equation".
 *
 * The keystone lesson that unifies the interpretations the earlier lessons
 * planted separately. Placed AFTER vectors (linear combinations, span,
 * dependence, unique coordinates) and matrices (the columns rule, Ax as a
 * combination of columns). The NEXT lesson is elimination (L4), which turns
 * solving into a reliable procedure; the determinant (L7) later *detects* the
 * unique-solvability boundary this lesson exposes.
 *
 * Core mental model (one sentence): solving A x = b is one question with two
 * pictures — find the point where the constraint lines meet (rows), or find the
 * recipe that mixes the columns to reach the target (columns).
 *
 * Continuity: the running numbers ARE Lesson 1's. The independent columns are
 * the basis (v, w) = ((1,2), (3,-1)); the dependent columns are (v, 2v); the
 * unique target is Lesson 1's q = (-1, 5) (solution (2, -1) = [q]_B); the
 * infinite target is Lesson 1's r = (3, 6). So this lesson re-reads a
 * computation the learner already did, now as A x = b.
 */
export const systemsLesson: LessonDefinition = {
  id: "systems",
  title: "Linear Systems: Two Pictures of One Equation",
  subtitle: "Rows meet in a point; columns combine to a target — one equation, two views",
  learningObjectives: [
    "Read $A\\mathbf{x} = \\mathbf{b}$ four ways: scalar equations, intersecting lines, a vector equation, and a combination of the columns",
    "Contrast the row question (which point satisfies every constraint?) with the column question (which recipe reaches the target?)",
    "Classify a system as having no, one, or infinitely many solutions from both pictures",
    "Connect consistency to $\\mathbf{b}$ lying in the span of the columns, and uniqueness to column independence",
    "See why 'exactly one solution for every $\\mathbf{b}$' is the same statement as invertibility — the transformation $\\mathbf{x} \\mapsto A\\mathbf{x}$ can be reversed",
  ],
  motivatingQuestion:
    "Here are two equations in two unknowns. You could hunt for the single point $(x, y)$ that satisfies both at once — or you could ask which blend of two fixed arrows reaches a target $\\mathbf{b}$. Are those the same question, and does the answer always exist and stay unique?",
  route: [
    { kind: "motivate" },
    { kind: "section", sectionId: "one-system" },
    // Watch: the guided scene builds the row picture, regroups into the column
    // picture, then walks the three cases — one conceptual change at a time.
    { kind: "visual" },
    { kind: "section", sectionId: "row-picture" },
    { kind: "section", sectionId: "column-picture" },
    { kind: "formal", formalId: "def-matrix-equation" },
    { kind: "formal", formalId: "thm-consistency" },
    // Three worked cases (unique / infinite / none) + misconception callouts.
    { kind: "worked" },
    { kind: "formal", formalId: "prop-trichotomy" },
    { kind: "check" },
    { kind: "explore" },
    { kind: "section", sectionId: "why-it-matters" },
    { kind: "practice" },
    { kind: "summary" },
  ],
  formalBlocks: [
    {
      id: "def-matrix-equation",
      kind: "definition",
      label: "The matrix equation and its pictures",
      statement:
        "For a matrix $A = \\begin{bmatrix} \\mathbf{a}_1 & \\mathbf{a}_2 \\end{bmatrix}$ with columns $\\mathbf{a}_1, \\mathbf{a}_2$ and a target $\\mathbf{b}$, the equation $A\\mathbf{x} = \\mathbf{b}$ is one object with several equivalent readings: the two scalar equations (its **rows**); two **lines** whose intersection is the solution set; and — by the columns rule — the **vector equation** $x\\,\\mathbf{a}_1 + y\\,\\mathbf{a}_2 = \\mathbf{b}$.",
      interpretation:
        "The row viewpoint asks: *which $(x, y)$ satisfy every constraint at once?* The column viewpoint asks: *which coefficients combine the columns to reach $\\mathbf{b}$?* They are not rival explanations — they are the same equation, and they always agree on the solutions.",
      visibility: "visible",
      layers: [
        {
          kind: "connection",
          title: "The column reading is Lesson 2's columns rule",
          body: "Lesson 2 derived $A\\mathbf{x} = x\\,(\\text{column }1) + y\\,(\\text{column }2)$. So $A\\mathbf{x} = \\mathbf{b}$ *is* the question 'which $x, y$ make that combination equal $\\mathbf{b}$?' The column picture is not a new fact — it is the columns rule read backwards.",
        },
      ],
    },
    {
      id: "thm-consistency",
      kind: "theorem",
      label: "Consistency ⇔ b is in the column space",
      statement:
        "$A\\mathbf{x} = \\mathbf{b}$ has at least one solution (it is **consistent**) **if and only if** $\\mathbf{b}$ lies in the span of the columns of $A$ — the **column space** of $A$.",
      interpretation:
        "Existence is a *reachability* question, exactly Lesson 1's span idea: can the columns, blended, get to $\\mathbf{b}$ at all? If $\\mathbf{b}$ is off everything the columns can reach, no amount of cleverness solves the system.",
      visibility: "revealed",
      layers: [
        {
          kind: "math-note",
          title: "Why this is almost immediate",
          body: "By the column reading, a solution is a pair $(x, y)$ with $x\\,\\mathbf{a}_1 + y\\,\\mathbf{a}_2 = \\mathbf{b}$. Such a pair exists exactly when $\\mathbf{b}$ can be written as a combination of $\\mathbf{a}_1, \\mathbf{a}_2$ — that is, when $\\mathbf{b} \\in \\operatorname{span}\\{\\mathbf{a}_1, \\mathbf{a}_2\\}$. The theorem is really the *definition* of span, viewed from the solving side.",
        },
      ],
    },
    {
      id: "prop-trichotomy",
      kind: "proposition",
      label: "No, one, or infinitely many — never exactly two",
      statement:
        "For a $2\\times 2$ system: if the columns are **independent**, then $A\\mathbf{x} = \\mathbf{b}$ has **exactly one** solution for *every* $\\mathbf{b}$. If the columns are **dependent**, then for a given $\\mathbf{b}$ there are **either none or infinitely many** — never exactly one.",
      interpretation:
        "Independence controls *uniqueness*; the target controls *existence*. 'Exactly one solution for every $\\mathbf{b}$' is precisely what it means for $A$ to be **invertible** — the map $\\mathbf{x} \\mapsto A\\mathbf{x}$ can be undone. Elimination — the next lesson — makes actually finding those solutions a reliable procedure. The determinant, which detects this boundary at a glance, arrives later, in Lesson 7.",
      visibility: "revealed",
      layers: [
        {
          kind: "connection",
          title: "This is Lesson 1's basis theorem, resurfacing",
          body: "Independent columns span the plane and give *unique* coordinates (Lesson 1's basis ⇔ unique representation). Reading those coordinates as the solution of $A\\mathbf{x} = \\mathbf{b}$ turns 'unique coordinates' into 'unique solution for every target'. Dependent columns collapse to a line: a target off the line is unreachable (none); a target on it is reachable in infinitely many ways (the coordinates are no longer unique).",
        },
        {
          kind: "looking-ahead",
          title: "Where the determinant fits (Lesson 7)",
          body: "The whole trichotomy pivots on one yes/no question: are the columns independent? The **next** lesson, elimination, gives a reliable procedure for solving and for exposing dependence (a row collapses to $0 = 0$ or $0 = c$). Later, in **Lesson 7**, a single number — $\\det A$ — answers the independence question at a glance: nonzero means independent (unique solving, invertible), zero means the columns are dependent and the plane collapses to a line.",
        },
      ],
    },
  ],
  sections: [
    {
      id: "one-system",
      title: "One system, two questions",
      body: "Take the system $x + 3y = -1$ and $2x - y = 5$. In matrix form it is $A\\mathbf{x} = \\mathbf{b}$ with the columns $\\mathbf{a}_1 = (1, 2)$ and $\\mathbf{a}_2 = (3, -1)$ — the very pair you used as a basis in Lesson 1. You can attack it two ways. Read across the **rows**: each equation is a line, and you want the point on *both*. Read down the **columns**: you want coefficients $x, y$ so that $x\\,\\mathbf{a}_1 + y\\,\\mathbf{a}_2$ lands on $\\mathbf{b} = (-1, 5)$.",
      equation:
        "\\underbrace{\\begin{bmatrix} 1 & 3 \\\\ 2 & -1 \\end{bmatrix}}_{A} \\begin{bmatrix} x \\\\ y \\end{bmatrix} = \\begin{bmatrix} -1 \\\\ 5 \\end{bmatrix} = \\mathbf{b}",
      observation:
        "Same four numbers, same target. The two questions must return the same $(x, y)$ — watch that happen next.",
    },
    {
      id: "row-picture",
      title: "The row picture: where constraints meet",
      body: "Each equation constrains $(x, y)$ to a line. A solution has to satisfy *both*, so it lives at their intersection. Two lines in the plane do exactly one of three things: cross once (one solution), lie on top of each other (infinitely many), or run parallel and never touch (no solution). The row picture makes the solution *count* a matter of how the lines sit.",
      equation:
        "\\begin{cases} x + 3y = -1 \\\\ 2x - y = 5 \\end{cases} \\;\\longrightarrow\\; \\text{two lines, one crossing at } (2, -1)",
      observation:
        "The row question: which single point obeys every constraint at once?",
    },
    {
      id: "column-picture",
      title: "The column picture: reaching the target",
      body: "Now regroup the *same* numbers by column. The columns rule says $A\\mathbf{x} = x\\,\\mathbf{a}_1 + y\\,\\mathbf{a}_2$, so solving $A\\mathbf{x} = \\mathbf{b}$ means finding the blend of the two column arrows that reaches $\\mathbf{b}$. Here $2\\,\\mathbf{a}_1 - 1\\,\\mathbf{a}_2 = (-1, 5) = \\mathbf{b}$ — the same $(2, -1)$ the lines gave. Existence becomes a reachability question (is $\\mathbf{b}$ in the columns' span?); uniqueness becomes a question of whether the columns are independent.",
      equation:
        "x\\begin{bmatrix} 1 \\\\ 2 \\end{bmatrix} + y\\begin{bmatrix} 3 \\\\ -1 \\end{bmatrix} = \\begin{bmatrix} -1 \\\\ 5 \\end{bmatrix} \\;\\Rightarrow\\; (x, y) = (2, -1)",
      observation:
        "The column question: which recipe of the columns reaches the target? Same answer, different lens.",
      layers: [
        {
          kind: "connection",
          title: "You have already solved this exact system",
          body: "In Lesson 1 you found $[\\mathbf{q}]_B = (2, -1)$ for $\\mathbf{q} = (-1, 5)$ in the basis $B = (\\mathbf{v}, \\mathbf{w})$. That was $A\\mathbf{x} = \\mathbf{b}$ all along: 'coordinates of $\\mathbf{b}$ in the basis of columns' and 'solution of the system' are the same numbers.",
        },
      ],
    },
    {
      id: "why-it-matters",
      title: "Where this leads: a procedure, then a number",
      body: "Everything above turned on one yes/no question: are the columns independent? When they are, the system solves uniquely for *every* target, and the map $\\mathbf{x} \\mapsto A\\mathbf{x}$ is reversible — you can always recover the input from the output. When they are dependent, the plane collapses onto a line, and solving breaks into the none/infinitely-many split. **Elimination**, the next lesson, turns this solvability question into a reliable procedure for actually finding solutions and exposing dependence. Later, **Lesson 7** introduces a single number, $\\det A$, whose whole job is to detect that collapse — letting you answer 'is this system uniquely solvable?' at a glance.",
      observation:
        "Invertibility, column space, independence, and the solution count are one cluster of ideas seen from different sides.",
    },
  ],
  guidedSceneId: "linear-systems",
  explorationId: "linear-systems",
  workedExamples: [
    {
      id: "sys-unique",
      title: "One solution — independent columns",
      prompt:
        "Solve $A\\mathbf{x} = \\mathbf{b}$ with columns $\\mathbf{a}_1 = (1,2)$, $\\mathbf{a}_2 = (3,-1)$ and $\\mathbf{b} = (-1, 5)$. Do it once by rows and once by columns and check the answers agree.",
      equations: [
        "A = \\begin{bmatrix} 1 & 3 \\\\ 2 & -1 \\end{bmatrix}, \\quad \\mathbf{b} = \\begin{bmatrix} -1 \\\\ 5 \\end{bmatrix}",
        "\\text{Rows:}\\quad \\begin{cases} x + 3y = -1 \\\\ 2x - y = 5 \\end{cases}",
        "y = 2x - 5 \\;\\Rightarrow\\; x + 3(2x - 5) = -1 \\;\\Rightarrow\\; 7x = 14",
        "x = 2, \\quad y = -1",
        "\\text{Columns:}\\quad 2\\begin{bmatrix} 1 \\\\ 2 \\end{bmatrix} - 1\\begin{bmatrix} 3 \\\\ -1 \\end{bmatrix} = \\begin{bmatrix} -1 \\\\ 5 \\end{bmatrix} \\checkmark",
        "\\mathbf{a}_1, \\mathbf{a}_2 \\text{ point in different directions (independent)} \\;\\Rightarrow\\; \\text{one solution for every } \\mathbf{b}",
      ],
      equationsAriaLabel:
        "Solving the independent system by rows to get x equals two and y equals minus one, confirming by the column combination two a-one minus a-two equals b, and noting the columns are independent so the solution is unique for every target.",
      layers: [
        {
          kind: "connection",
          title: "Same numbers as Lesson 1's coordinate challenge",
          body: "This is $[\\mathbf{q}]_B = (2, -1)$ from Lesson 1, now read as the solution of a system. Coordinates-in-a-basis and solving $A\\mathbf{x} = \\mathbf{b}$ are the same act.",
        },
      ],
    },
    {
      id: "sys-infinite",
      title: "Infinitely many — dependent columns, target on the line",
      prompt:
        "Now the columns are $\\mathbf{a}_1 = (1,2)$ and $\\mathbf{a}_2 = (2,4) = 2\\,\\mathbf{a}_1$, with $\\mathbf{b} = (3, 6)$.",
      equations: [
        "\\begin{cases} x + 2y = 3 \\\\ 2x + 4y = 6 \\end{cases}",
        "\\text{Row 2} = 2 \\times \\text{Row 1} \\;\\Rightarrow\\; \\text{really one equation: } x + 2y = 3",
        "\\mathbf{a}_2 = 2\\,\\mathbf{a}_1 \\;\\Rightarrow\\; \\text{columns dependent (they span only one line)}",
        "\\mathbf{b} = \\begin{bmatrix} 3 \\\\ 6 \\end{bmatrix} = 3\\begin{bmatrix} 1 \\\\ 2 \\end{bmatrix} \\in \\operatorname{span}\\{\\mathbf{a}_1\\} \\;\\Rightarrow\\; \\text{consistent}",
        "\\{(x, y) : x = 3 - 2y\\} \\;\\Rightarrow\\; \\text{infinitely many solutions}",
      ],
      equationsAriaLabel:
        "With dependent columns, the two equations collapse to one, the second column is twice the first so they span only one line, the target lies on that span, and the solution set is the whole line x equals three minus two y — infinitely many solutions.",
    },
    {
      id: "sys-none",
      title: "No solution — dependent columns, target off the line",
      prompt:
        "Keep the dependent columns but move the target to $\\mathbf{b} = (3, 5)$, just off their line.",
      equations: [
        "\\begin{cases} x + 2y = 3 \\\\ 2x + 4y = 5 \\end{cases}",
        "2 \\times \\text{Row 1} \\;\\Rightarrow\\; 2x + 4y = 6 \\neq 5 \\quad (\\text{contradiction})",
        "\\mathbf{b} = \\begin{bmatrix} 3 \\\\ 5 \\end{bmatrix} \\notin \\operatorname{span}\\left\\{\\begin{bmatrix} 1 \\\\ 2 \\end{bmatrix}\\right\\} \\;\\Rightarrow\\; \\text{inconsistent}",
        "\\text{no solution}",
      ],
      equationsAriaLabel:
        "The same dependent columns with target three, five give two contradictory equations because the target is off the span of the columns, so there is no solution.",
      layers: [
        {
          kind: "trap",
          title: "No solution is an answer, not a mistake",
          body: "An inconsistent system is not an arithmetic error to hunt down. It is a genuine, informative outcome: the target simply is not reachable by these columns. In the row picture the lines are parallel; in the column picture $\\mathbf{b}$ sits off the column line.",
        },
      ],
    },
  ],
  callouts: [
    {
      id: "two-pictures-one-problem",
      title: "\u201cThe row picture and the column picture are different problems\u201d",
      belief:
        "Drawing lines and intersecting them feels like a totally different task from combining vectors to hit a target.",
      confront:
        "But both use the same four numbers and the same $\\mathbf{b}$, and both return the same pair $(2, -1)$: it is the crossing point of the two lines *and* the coefficients that combine the columns to reach $\\mathbf{b}$.",
      resolve:
        "They are two pictures of the one equation $A\\mathbf{x} = \\mathbf{b}$. Rows ask 'which point satisfies every constraint?'; columns ask 'which recipe reaches the target?' — same solution set, different lens.",
    },
    {
      id: "count-vs-independence",
      title: "\u201cTwo equations always pin two unknowns to one answer\u201d",
      belief:
        "It seems that as long as you have as many equations as unknowns, there must be exactly one solution.",
      confront:
        "Yet $x + 2y = 3$ with $2x + 4y = 6$ has infinitely many solutions (the second equation is just twice the first — really one constraint), while $x + 2y = 3$ with $2x + 4y = 5$ has none.",
      resolve:
        "What controls uniqueness is whether the constraints are *independent* — equivalently, whether the columns point in genuinely different directions — not how many equations you wrote.",
    },
  ],
  checkpoint: {
    prompt:
      "With independent columns you drag the target $\\mathbf{b}$ all over the plane. How many solutions does $A\\mathbf{x} = \\mathbf{b}$ have, and why doesn't the answer depend on where $\\mathbf{b}$ is?",
    answer:
      "Exactly one, for every $\\mathbf{b}$. Independent columns span the whole plane, so every target is reachable (existence) and reachable in only one way (uniqueness) — the same reason a basis gives unique coordinates. Only when the columns are dependent does the count depend on $\\mathbf{b}$: none if $\\mathbf{b}$ is off their line, infinitely many if it is on it.",
  },
  // Evidence-honest problem set (canonical levels from mastery-standard §5):
  //  - multiple-choice AND committed multiple-choice are **E1 recognition**
  //    (commit-before-reveal makes an item valid evidence, it does NOT make it E3);
  //  - **E3** requires fresh, unaided production of the COMPLETE outcome
  //    (`sys-classify-produce-fresh` = produce the none/one/∞ witness by working it;
  //    `sys-solve-confirm-fresh` = solve by rows + confirm BOTH column coordinates;
  //    `sys-translate-augmented-fresh` = the whole [A|b]);
  //  - **E4** is unfamiliar transfer/construction (`sys-construct-inconsistent`
  //    graded construction; `sys-characterize-parameter-fresh` = characterize the
  //    dependency/consistency boundary on a symbolic parameter — a novel task);
  //  - `self-check` is an **unscored E6 surface** (reasoning + proofs).
  // The reasoning/proof surfaces stay UNSCORED (self-mark ≠ credit), so Gate 8 stays
  // NOT PASSED until human scoring (module Package F) — see the mastery contract.
  exercises: [
    {
      id: "sys-count-infinite",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "Classify: how many solutions does $\\begin{cases} x + 2y = 3 \\\\ 2x + 4y = 6 \\end{cases}$ have?",
      choices: [
        "Exactly one",
        "None — the equations contradict each other",
        "Infinitely many — the second equation is twice the first",
        "Exactly two",
      ],
      correctChoice: 2,
      explanation:
        "The second equation is $2\\times$ the first, so there is really one constraint, $x + 2y = 3$. Every point on that line solves the system — infinitely many. In the column picture, $\\mathbf{b} = (3,6)$ lies on the dependent columns' line.",
    },
    {
      id: "sys-count-none",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "Classify: how many solutions does $\\begin{cases} x + 2y = 3 \\\\ 2x + 4y = 5 \\end{cases}$ have?",
      choices: [
        "Infinitely many",
        "None — doubling the first equation gives $2x + 4y = 6 \\neq 5$",
        "Exactly one",
        "It depends on $x$",
      ],
      correctChoice: 1,
      explanation:
        "Doubling row 1 forces $2x + 4y = 6$, contradicting $2x + 4y = 5$: the lines are parallel and never meet. In the column picture, $\\mathbf{b} = (3,5)$ lies off the columns' line, so it is unreachable — no solution.",
    },
    {
      // Fresh, unaided classification (a DIFFERENT system than the two above).
      // Honest level: E1 recognition — a three-way choice is recognition even when
      // fresh and committed. It is valid evidence of the classify outcome, but it
      // does not reach the E3 the outcome requires.
      id: "sys-classify-fresh",
      type: "custom",
      capabilityId: COMMITTED_PREDICTION_ID,
      tier: "check",
      prompt:
        "Commit first. How many solutions does $\\begin{cases} 2x + 4y = 5 \\\\ x + 2y = 3 \\end{cases}$ have?",
      config: {
        options: [
          "Exactly one",
          "Infinitely many",
          "None — the two equations contradict each other",
        ],
        correctIndex: 2,
        reveal:
          "The columns $(2, 1)$ and $(4, 2)$ are dependent (the second is twice the first), so the column space is the line $\\{s\\,(2,1)\\}$. Doubling row 2 gives $2x + 4y = 6 \\ne 5$: $\\mathbf{b} = (5, 3)$ lies off that line, so there is no solution.",
      },
    },
    {
      // Fresh PRODUCED classification (E3): instead of picking none/one/∞ from a
      // list, the learner works three fresh systems and PRODUCES the witness that
      // certifies each class — the forced solution (one), a second distinct solution
      // (infinitely many), and the elimination contradiction value (none). The class
      // is the output of computation the learner performed, not a guess.
      id: "sys-classify-produce-fresh",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "Classify by producing the evidence, not by guessing. Three fresh systems — work each and let the numbers decide the count.",
      config: {
        steps: [
          {
            kind: "numeric",
            prompt:
              "System A: $\\begin{cases} 2x + y = 5 \\\\ x - y = 1 \\end{cases}$. Solve it — enter $x$.",
            expected: 2,
            explanation:
              "Adding the equations gives $3x = 6$, so $x = 2$. The columns $(2,1)$ and $(1,-1)$ are independent.",
          },
          {
            kind: "numeric",
            prompt: "…and $y$ for System A.",
            expected: 1,
            explanation:
              "$x - y = 1$ with $x = 2$ gives $y = 1$. A single forced $(x, y) = (2, 1)$ — independent columns, so **exactly one** solution. You produced uniqueness by finding the one point.",
          },
          {
            kind: "numeric",
            prompt:
              "System B: $\\begin{cases} x + y = 3 \\\\ 2x + 2y = 6 \\end{cases}$. One solution is $(0, 3)$. Find a DIFFERENT one: set $x = 1$ and enter $y$.",
            expected: 2,
            explanation:
              "Row 2 is twice row 1, so both reduce to $x + y = 3$; with $x = 1$, $y = 2$. Now $(0,3)$ and $(1,2)$ both solve it — two distinct solutions force **infinitely many** (dependent columns). You produced non-uniqueness by exhibiting a second solution.",
          },
          {
            kind: "numeric",
            prompt:
              "System C: $\\begin{cases} x + y = 2 \\\\ 2x + 2y = 5 \\end{cases}$. Double equation 1: what value does that force the left side $2x + 2y$ of equation 2 to equal?",
            expected: 4,
            explanation:
              "Doubling $x + y = 2$ gives $2x + 2y = 4$, but equation 2 says $2x + 2y = 5$. Since $4 \\ne 5$, no $(x, y)$ can satisfy both — **no solution**. You produced the contradiction that certifies inconsistency.",
          },
        ],
      },
    },
    {
      id: "sys-solve-unique",
      type: "vector",
      tier: "drill",
      prompt:
        "Solve $\\begin{cases} x + 3y = -1 \\\\ 2x - y = 5 \\end{cases}$. Enter $(x, y)$.",
      expected: [EX.solution[0], EX.solution[1]],
      tolerance: 0.01,
      explanation:
        "From row 2, $y = 2x - 5$; substituting gives $7x = 14$, so $x = 2$, $y = -1$. Equivalently $2\\,\\mathbf{a}_1 - \\mathbf{a}_2 = (-1, 5)$ in the column picture. The columns point in different directions (independent), so this is the only solution.",
    },
    {
      // Fresh-instance production (E3) of the COMPLETE outcome: solve by rows AND
      // confirm by columns. A different system than the worked one, so it cannot be
      // recalled. No determinant argument (the determinant is L7); the forward
      // bridge points to elimination (L4), the actual next lesson.
      id: "sys-solve-confirm-fresh",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "A different system: $\\begin{cases} x + 2y = 4 \\\\ 3x + y = -3 \\end{cases}$. Solve it by rows, then confirm the answer by combining the columns.",
      config: {
        steps: [
          {
            kind: "numeric",
            prompt: "Solve by rows: what is $x$?",
            expected: EX2.solution[0],
            explanation:
              "From row 1, $x = 4 - 2y$; substituting into row 2 gives $12 - 5y = -3$, so $y = 3$ and $x = -2$.",
          },
          {
            kind: "numeric",
            prompt: "And what is $y$?",
            expected: EX2.solution[1],
            explanation: "$-5y = -15$, so $y = 3$.",
          },
          {
            kind: "numeric",
            prompt:
              "Confirm by columns: compute the FIRST entry of $x\\,\\mathbf{a}_1 + y\\,\\mathbf{a}_2 = x(1,3) + y(2,1)$, i.e. $x\\cdot 1 + y\\cdot 2$.",
            expected: EX2.b[0],
            explanation:
              "$(-2)(1) + (3)(2) = 4$, the first entry of $\\mathbf{b} = (4, -3)$.",
          },
          {
            kind: "numeric",
            prompt:
              "Now the SECOND entry of the same combination, $x\\cdot 3 + y\\cdot 1$. (The confirmation is only complete when the whole vector equals $\\mathbf{b}$.)",
            expected: EX2.b[1],
            explanation:
              "$(-2)(3) + (3)(1) = -3$, the second entry of $\\mathbf{b} = (4, -3)$. Both coordinates match, so $x\\,\\mathbf{a}_1 + y\\,\\mathbf{a}_2 = \\mathbf{b}$ exactly — the columns really do combine to reach $\\mathbf{b}$, and (being independent) in only one way. Next up is **elimination** (Lesson 4), which automates this row-solve; the determinant that certifies independence at a glance comes later, in Lesson 7.",
          },
        ],
      },
    },
    {
      id: "sys-translate-columns",
      type: "vector",
      tier: "transfer",
      prompt:
        "Translate the system $\\begin{cases} x + 3y = -1 \\\\ 2x - y = 5 \\end{cases}$ into the matrix equation $A\\mathbf{x} = \\mathbf{b}$. Enter the **first column** $\\mathbf{a}_1$ of $A$ (the coefficients that multiply $x$).",
      expected: [1, 2],
      tolerance: 0.01,
      explanation:
        "Reading *down* the $x$-coefficients gives $\\mathbf{a}_1 = (1, 2)$; the $y$-coefficients give $\\mathbf{a}_2 = (3, -1)$; the right-hand sides give $\\mathbf{b} = (-1, 5)$. Rows read across (equations); columns read down (the arrows you blend). Same nine numbers, regrouped.",
    },
    {
      // Fresh-instance production (E3) of the COMPLETE translation: the whole
      // augmented matrix [A | b], not just one column. Entry-graded against src/math
      // numbers.
      id: "sys-translate-augmented-fresh",
      type: "custom",
      capabilityId: MATRIX_ENTRY_ID,
      tier: "transfer",
      prompt:
        "A different system: translate $\\begin{cases} x + 2y = 4 \\\\ 3x + y = -3 \\end{cases}$ into the augmented matrix $[A \\mid \\mathbf{b}]$. Enter all six entries.",
      config: {
        rows: 2,
        cols: 3,
        expected: [
          [EX2.a[0][0], EX2.a[0][1], EX2.b[0]],
          [EX2.a[1][0], EX2.a[1][1], EX2.b[1]],
        ],
        explanation:
          "Read each equation across for a row: $(1, 2 \\mid 4)$ and $(3, 1 \\mid -3)$. Reading *down* instead gives the columns $\\mathbf{a}_1 = (1, 3)$, $\\mathbf{a}_2 = (2, 1)$ and the target $\\mathbf{b} = (4, -3)$.",
        matrixName: "[A\\,|\\,b]",
      },
    },
    {
      id: "sys-column-reading",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "Which statement is the *column-picture* reading of $A\\mathbf{x} = \\mathbf{b}$?",
      choices: [
        "Find the point that lies on both rows' lines simultaneously",
        "Find coefficients $x, y$ with $x\\,\\mathbf{a}_1 + y\\,\\mathbf{a}_2 = \\mathbf{b}$",
        "Find the matrix whose columns are $\\mathbf{a}_1$ and $\\mathbf{a}_2$",
        "Rewrite the system with the rows swapped",
      ],
      correctChoice: 1,
      explanation:
        "The column reading treats $A\\mathbf{x}$ as $x\\,\\mathbf{a}_1 + y\\,\\mathbf{a}_2$ (the columns rule) and asks for the blend that reaches $\\mathbf{b}$. The first choice is the row reading; both describe the same solution set.",
    },
    {
      // Package D — genuine graded construction (E4) on FRESH dependent columns.
      // The learner commits a target and the shared system classifier checks it
      // is truly inconsistent; no reveal-only self-grading.
      id: "sys-construct-inconsistent",
      type: "custom",
      capabilityId: CONSTRUCT_IN_EXPLORER_ID,
      tier: "transfer",
      prompt:
        "Construct: take the dependent columns $\\mathbf{a}_1 = (1, 2)$ and $\\mathbf{a}_2 = (3, 6)$. Commit a target $\\mathbf{b}$ for which $A\\mathbf{x} = \\mathbf{b}$ has **no solution**.",
      config: {
        target: "vector2",
        check: {
          kind: "system-classification",
          matrix: [
            [1, 3],
            [2, 6],
          ],
          expect: "none",
        },
        reveal:
          "The columns span only the line $\\{s\\,(1, 2)\\}$, so $A\\mathbf{x} = \\mathbf{b}$ is inconsistent exactly when $\\mathbf{b}$ lies **off** that line ($\\mathbf{b} \\notin \\operatorname{span}\\{\\mathbf{a}_1\\}$) — for example $(1, 0)$ or $(0, 1)$. A target on the line, like $(2, 4)$, would instead give infinitely many solutions.",
      },
    },
    {
      id: "sys-generalize-inconsistent",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "Generalize: for the dependent columns $\\mathbf{a}_1 = (1, 2)$, $\\mathbf{a}_2 = (2, 4)$, the targets $\\mathbf{b}$ for which $A\\mathbf{x} = \\mathbf{b}$ has **no solution** are exactly those…",
      choices: [
        "on the line through the origin and $(1, 2)$",
        "off the line through the origin and $(1, 2)$",
        "with $\\mathbf{b} = \\mathbf{0}$",
        "with at least one negative entry",
      ],
      correctChoice: 1,
      explanation:
        "The reachable set (column space) is the whole line $\\{s\\,(1,2)\\}$. A target on that line is reachable (infinitely many recipes); a target off it is unreachable — no solution. So the inconsistent targets are precisely the points off the line.",
    },
    {
      // Package D (in-lesson E4) — unfamiliar-transfer CHARACTERIZATION. Every
      // earlier item used concrete numbers; here the learner transfers "dependent ⇔
      // columns proportional" and "consistent ⇔ b on the column line" to a SYMBOLIC
      // parameter h and then characterizes the solvable/unsolvable boundary — a task
      // never walked through. Produced numerically (find h, find the on-line target
      // coordinate, produce a witnessing solution), graded step-by-step.
      id: "sys-characterize-parameter-fresh",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt:
        "Characterize the boundary. Let $A$ have columns $\\mathbf{a}_1 = (1, 2)$ and $\\mathbf{a}_2 = (3, h)$, with $h$ a parameter you get to pin down.",
      config: {
        steps: [
          {
            kind: "numeric",
            prompt:
              "For which value of $h$ are the columns **dependent** (so $A$ is not invertible)?",
            expected: 6,
            explanation:
              "Dependence means $\\mathbf{a}_2$ is a multiple of $\\mathbf{a}_1$. Matching first entries, $3 = 3\\cdot 1$, forces the multiple $3$, so $\\mathbf{a}_2 = 3\\,\\mathbf{a}_1 = (3, 6)$: $h = 6$.",
          },
          {
            kind: "numeric",
            prompt:
              "Fix $h = 6$. The columns now span the line $\\{s\\,(1,2)\\}$. For a target $\\mathbf{b} = (2, k)$, which $k$ makes the system **consistent** (i.e. $\\mathbf{b}$ on that line)?",
            expected: 4,
            explanation:
              "On the line, $\\mathbf{b} = s\\,(1,2)$; first entry $2$ forces $s = 2$, so $k = 2\\cdot 2 = 4$. Consistent exactly when $k = 4$; **every other $k$ gives no solution** — that is the full characterization.",
          },
          {
            kind: "numeric",
            prompt:
              "At $h = 6$, $\\mathbf{b} = (2, 4)$: produce a solution with $y = 0$ — enter $x$.",
            expected: 2,
            explanation:
              "$x\\,(1,2) + 0\\,(3,6) = (2,4)$ needs $x = 2$. And since the columns are dependent there are **infinitely many** solutions on this consistent target (e.g. $(-1, 1)$ also works). So for $h = 6$: consistent $\\Rightarrow$ infinitely many, off the line $\\Rightarrow$ none — never exactly one.",
          },
        ],
      },
    },
    {
      // Package C — was a reveal-only `prediction`; now a commit-before-reveal
      // choice on the *mechanism*, with fresh counterexamples in the reveal.
      id: "sys-counterexample-uniqueness",
      type: "custom",
      capabilityId: COMMITTED_PREDICTION_ID,
      tier: "transfer",
      prompt:
        "Commit before revealing. The claim \u201ctwo equations in two unknowns always have exactly one solution\u201d is false. What exactly makes it fail?",
      config: {
        options: [
          "It fails only when one equation contains an arithmetic mistake",
          "It fails exactly when the two constraints are not independent (dependent columns) — then the system has none or infinitely many",
          "It fails only when both right-hand sides are zero",
        ],
        correctIndex: 1,
        reveal:
          "Independence, not the count of equations, controls uniqueness. Two fresh counterexamples with dependent columns: infinitely many — $\\begin{cases} x + 3y = 4 \\\\ 2x + 6y = 8 \\end{cases}$ (row 2 is twice row 1, one real constraint); none — $\\begin{cases} x + 3y = 4 \\\\ 2x + 6y = 9 \\end{cases}$ (doubling row 1 forces $2x + 6y = 8 \\ne 9$).",
      },
    },
    {
      // Genuine reasoning evidence (produced, not chosen) for the dependent-count
      // mechanism. Self-check captures the learner's written argument; it is an
      // UNSCORED E6 surface (the self-mark is not proof credit). A committed-MC
      // version of this would only be E1 recognition, so the outcome is evidenced
      // in writing here.
      id: "sys-reason-dependent-count",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt:
        "Explain in your own words: why can a system with **dependent** columns never have *exactly one* solution — only none or infinitely many? Write your reasoning, then compare with the model answer.",
      config: {
        modelAnswer:
          "Dependence means there is a **nonzero** pair $(\\alpha, \\beta) \\ne (0,0)$ with $\\alpha\\,\\mathbf{a}_1 + \\beta\\,\\mathbf{a}_2 = \\mathbf{0}$, so $\\mathbf{n} = (\\alpha, \\beta)$ is a nonzero solution of $A\\mathbf{x} = \\mathbf{0}$. (This relation always exists: if some column is nonzero the two columns lie on one line, one a multiple of the other — e.g. a zero first column $\\mathbf{a}_1 = \\mathbf{0}$ gives the relation $(1, 0)$; and if $A = \\mathbf{0}$ any nonzero $(\\alpha, \\beta)$ works.) Now split on $\\mathbf{b}$ using the reachable set $\\operatorname{Col}(A)$ — a line, or $\\{\\mathbf{0}\\}$ when $A = \\mathbf{0}$: if $\\mathbf{b} \\notin \\operatorname{Col}(A)$ it is unreachable, so **none**. If $\\mathbf{b} \\in \\operatorname{Col}(A)$, some solution $\\mathbf{x}_p$ exists, and then $\\mathbf{x}_p + t\\,\\mathbf{n}$ is a solution for every $t$ (it changes $(x,y)$ but not $x\\,\\mathbf{a}_1 + y\\,\\mathbf{a}_2$): **infinitely many**. Exactly one is impossible because that nonzero homogeneous $\\mathbf{n}$ always shifts one solution to another. Independence is exactly what forces $\\mathbf{n} = \\mathbf{0}$ and restores the unique case.",
        rubric:
          "A strong answer uses a **nonzero** homogeneous solution from a relation $\\alpha\\,\\mathbf{a}_1 + \\beta\\,\\mathbf{a}_2 = \\mathbf{0}$ (covering a zero column and the zero matrix, not just $\\mathbf{a}_2 = c\\,\\mathbf{a}_1$), separates existence (is $\\mathbf{b}$ in the column space?) from multiplicity (that null vector shifts solutions), and concludes exactly-one is impossible whenever the columns are dependent.",
      },
    },
    {
      id: "sys-invertibility-link",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "$A\\mathbf{x} = \\mathbf{b}$ has exactly one solution for *every* $\\mathbf{b}$ precisely when…",
      choices: [
        "$\\mathbf{b} = \\mathbf{0}$",
        "the columns of $A$ are independent",
        "$A$ is symmetric",
        "the entries of $A$ are large",
      ],
      correctChoice: 1,
      explanation:
        "Independent columns span the plane (existence for every $\\mathbf{b}$) and give unique combinations (uniqueness). That is exactly invertibility — the map $\\mathbf{x} \\mapsto A\\mathbf{x}$ can be reversed. **Lesson 7** later introduces the single number (the determinant) that certifies independence at a glance.",
    },
    {
      // Package E — proof-construction surface (E6). Self-check captures the
      // learner's written proof and shows a model answer + rubric; full proof
      // credit is awarded by human scoring in the module assessment, not the
      // in-app self-mark.
      id: "sys-prove-consistency",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt:
        "Prove it: show that $A\\mathbf{x} = \\mathbf{b}$ has a solution **if and only if** $\\mathbf{b}$ lies in the span of the columns of $A$. Write your proof, then compare with the model answer.",
      config: {
        modelAnswer:
          "By the columns rule, $A\\mathbf{x} = x\\,\\mathbf{a}_1 + y\\,\\mathbf{a}_2$ where $\\mathbf{x} = (x, y)$. ($\\Rightarrow$) If some $\\mathbf{x}$ solves $A\\mathbf{x} = \\mathbf{b}$, then $\\mathbf{b} = x\\,\\mathbf{a}_1 + y\\,\\mathbf{a}_2$ is by definition a linear combination of the columns, so $\\mathbf{b} \\in \\operatorname{span}\\{\\mathbf{a}_1, \\mathbf{a}_2\\}$. ($\\Leftarrow$) If $\\mathbf{b} \\in \\operatorname{span}\\{\\mathbf{a}_1, \\mathbf{a}_2\\}$, then $\\mathbf{b} = x\\,\\mathbf{a}_1 + y\\,\\mathbf{a}_2$ for some scalars $x, y$; that pair $(x, y)$ satisfies $A\\mathbf{x} = \\mathbf{b}$. So a solution exists exactly when $\\mathbf{b}$ is in the column span.",
        rubric:
          "A strong answer uses the columns rule to turn 'a solution exists' into '$\\mathbf{b}$ is a combination of the columns', and proves both directions (a solution gives membership; membership gives a solution).",
      },
    },
    {
      // Package E — the L3 trichotomy proved from independence/basis, NOT the
      // (not-yet-defined) determinant.
      id: "sys-prove-trichotomy",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt:
        "Prove it: for a $2\\times 2$ matrix, show that if the columns are **independent** then $A\\mathbf{x} = \\mathbf{b}$ has exactly one solution for every $\\mathbf{b}$, and if they are **dependent** then every $\\mathbf{b}$ gives either none or infinitely many. Do **not** use the determinant.",
      config: {
        modelAnswer:
          "Independent case: two independent vectors in the plane form a basis, so every $\\mathbf{b}$ is a linear combination of them (existence) and the combination is unique (uniqueness) — if $x\\,\\mathbf{a}_1 + y\\,\\mathbf{a}_2 = x'\\,\\mathbf{a}_1 + y'\\,\\mathbf{a}_2$ then $(x - x')\\,\\mathbf{a}_1 + (y - y')\\,\\mathbf{a}_2 = \\mathbf{0}$, and independence forces $x = x'$, $y = y'$. So there is exactly one $(x, y)$ with $A\\mathbf{x} = \\mathbf{b}$, for every $\\mathbf{b}$. Dependent case (general): dependence means there is a **nonzero** pair $(\\alpha, \\beta) \\ne (0,0)$ with $\\alpha\\,\\mathbf{a}_1 + \\beta\\,\\mathbf{a}_2 = \\mathbf{0}$; then $\\mathbf{n} = (\\alpha, \\beta)$ is a nonzero solution of $A\\mathbf{x} = \\mathbf{0}$. Such a relation always exists: if some column is nonzero the two columns lie on one line $L$ (one is a scalar multiple of the other, giving $(\\alpha,\\beta)$ — e.g. a zero first column $\\mathbf{a}_1 = \\mathbf{0}$ gives the relation $(1, 0)$); and if $A = 0$ then $L = \\{\\mathbf{0}\\}$ and any nonzero $(\\alpha,\\beta)$ works. Now split on $\\mathbf{b}$: the reachable set is the columns' span $L$ (a line, or $\\{\\mathbf{0}\\}$ when $A=0$). If $\\mathbf{b} \\notin L$, no solution. If $\\mathbf{b} \\in L$, at least one solution $\\mathbf{x}_p$ exists, and $\\mathbf{x}_p + t\\,\\mathbf{n}$ solves it for every $t$ — infinitely many. Never exactly one in the dependent case.",
        rubric:
          "A strong answer derives uniqueness from independence (a basis gives unique coordinates) and existence from spanning; in the dependent case it exhibits a **nonzero** homogeneous solution from a relation $\\alpha\\,\\mathbf{a}_1 + \\beta\\,\\mathbf{a}_2 = \\mathbf{0}$ (covering a zero column and the zero matrix, not just $\\mathbf{a}_2 = c\\,\\mathbf{a}_1$) to get the none/infinitely-many split. It must not invoke the determinant.",
      },
    },
  ],
  keyTakeaway:
    "$A\\mathbf{x} = \\mathbf{b}$ is one equation with two pictures: rows are lines whose intersection is the solution, columns are arrows you blend to reach $\\mathbf{b}$. A solution exists exactly when $\\mathbf{b}$ is in the span of the columns; it is unique exactly when the columns are independent. Independent ⇒ one solution for every $\\mathbf{b}$ (invertible); dependent ⇒ none or infinitely many, depending on $\\mathbf{b}$. Next comes **elimination**, a reliable procedure for finding those solutions; later, in Lesson 7, one number — the determinant — will detect independence at a glance.",
};
