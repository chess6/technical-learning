import type { LessonDefinition } from "./types";
import { LINEAR_SYSTEM_EXAMPLE as EX } from "./exampleData";

/**
 * Lesson: "Linear Systems — Two Pictures of One Equation".
 *
 * The keystone lesson that unifies the interpretations the earlier lessons
 * planted separately. Placed AFTER vectors (linear combinations, span,
 * dependence, unique coordinates) and matrices (the columns rule, Ax as a
 * combination of columns), and BEFORE determinants (which then *detects* the
 * unique-solvability boundary this lesson exposes).
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
        "Independence controls *uniqueness*; the target controls *existence*. 'Exactly one solution for every $\\mathbf{b}$' is precisely what it means for $A$ to be **invertible** — the map $\\mathbf{x} \\mapsto A\\mathbf{x}$ can be undone — and that is the boundary the next lesson learns to detect with a single number.",
      visibility: "revealed",
      layers: [
        {
          kind: "connection",
          title: "This is Lesson 1's basis theorem, resurfacing",
          body: "Independent columns span the plane and give *unique* coordinates (Lesson 1's basis ⇔ unique representation). Reading those coordinates as the solution of $A\\mathbf{x} = \\mathbf{b}$ turns 'unique coordinates' into 'unique solution for every target'. Dependent columns collapse to a line: a target off the line is unreachable (none); a target on it is reachable in infinitely many ways (the coordinates are no longer unique).",
        },
        {
          kind: "looking-ahead",
          title: "Why the determinant is next",
          body: "The whole trichotomy pivots on one yes/no question: are the columns independent? $\\det A$ is the single number that answers it — nonzero means independent (unique solving, invertible), zero means the columns are dependent and the plane collapses to a line. The next lesson makes that number geometric.",
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
      title: "Why this sits before determinants",
      body: "Everything above turned on one yes/no question: are the columns independent? When they are, the system solves uniquely for *every* target, and the map $\\mathbf{x} \\mapsto A\\mathbf{x}$ is reversible — you can always recover the input from the output. When they are dependent, the plane collapses onto a line, and solving breaks into the none/infinitely-many split. The next lesson introduces a single number, $\\det A$, whose whole job is to detect that collapse — and it will let you answer 'is this system uniquely solvable?' at a glance.",
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
  // The problem set is built to *derive* the trichotomy, not just quiz it:
  // classify → translate a system into A, b → construct an inconsistent system →
  // generalize where inconsistency lives → produce counterexamples → explain the
  // mechanism. Construct / counterexample / explain are `prediction` items: the
  // learner commits their own answer, then a worked reveal confirms it.
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
      id: "sys-construct-inconsistent",
      type: "prediction",
      tier: "transfer",
      prompt:
        "Construct: open the explorer with the dependent columns $\\mathbf{a}_1 = (1, 2)$, $\\mathbf{a}_2 = (2, 4)$. Drag the target $\\mathbf{b}$ until the system has **no solution**. Write down one $\\mathbf{b}$ that works, and state the rule for exactly which $\\mathbf{b}$ make it inconsistent.",
      reveal:
        "Any $\\mathbf{b}$ that is *not* a multiple of $(1, 2)$ works — e.g. $\\mathbf{b} = (1, 0)$, $(0, 1)$, or $(3, 5)$. The columns span only the line $\\{s\\,(1,2)\\}$, so $A\\mathbf{x} = \\mathbf{b}$ is inconsistent exactly when $\\mathbf{b}$ lies **off that line** ($\\mathbf{b} \\notin \\operatorname{span}\\{\\mathbf{a}_1\\}$). In the explorer you will see the recipe endpoint slide along the columns' line but never touch a $\\mathbf{b}$ you dragged off it.",
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
      id: "sys-counterexample-uniqueness",
      type: "prediction",
      tier: "transfer",
      prompt:
        "Counterexample: disprove the claim \u201ctwo equations in two unknowns always have exactly one solution.\u201d Give one system that fails by having *no* solution and one that fails by having *infinitely many*.",
      reveal:
        "The claim is false whenever the two constraints are not independent. Infinitely many: $\\begin{cases} x + 2y = 3 \\\\ 2x + 4y = 6 \\end{cases}$ (row 2 is twice row 1 — one real constraint). None: $\\begin{cases} x + 2y = 3 \\\\ 2x + 4y = 5 \\end{cases}$ (doubling row 1 gives $2x+4y=6 \\neq 5$). 'Exactly one solution' holds only when the columns are independent; counting equations is not enough.",
    },
    {
      id: "sys-explain-dependent",
      type: "prediction",
      tier: "transfer",
      prompt:
        "Explain: why can a system with **dependent** columns never have *exactly one* solution — only none or infinitely many?",
      reveal:
        "Dependent columns span only a line (their column space collapses from the plane to a line). If $\\mathbf{b}$ lies off that line it is unreachable — **no** solution. If $\\mathbf{b}$ lies on it, then because one column is a multiple of the other you can always trade between the coefficients along that relation ($x\\,\\mathbf{a}_1 + y\\,\\mathbf{a}_2$ is unchanged if you shift $(x, y)$ by any multiple of the dependency), producing **infinitely many** recipes. Either way, exactly one is impossible — that middle case is exactly what independence would rule out.",
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
        "Independent columns span the plane (existence for every $\\mathbf{b}$) and give unique combinations (uniqueness). That is exactly invertibility — the map $\\mathbf{x} \\mapsto A\\mathbf{x}$ can be reversed. The next lesson meets the single number that certifies independence at a glance.",
    },
  ],
  keyTakeaway:
    "$A\\mathbf{x} = \\mathbf{b}$ is one equation with two pictures: rows are lines whose intersection is the solution, columns are arrows you blend to reach $\\mathbf{b}$. A solution exists exactly when $\\mathbf{b}$ is in the span of the columns; it is unique exactly when the columns are independent. Independent ⇒ one solution for every $\\mathbf{b}$ (invertible); dependent ⇒ none or infinitely many, depending on $\\mathbf{b}$. The next lesson introduces one number — the determinant — that detects independence at a glance.",
};
