import type { LessonDefinition } from "./types";
import { SUBSPACE_FRESH as FRESH } from "./exampleData";
import {
  CONSTRUCT_IN_EXPLORER_ID,
  EXERCISE_SEQUENCE_ID,
  MATRIX_ENTRY_ID,
  SELF_CHECK_ID,
} from "./capabilities";
import {
  columnSpaceBasis,
  nullSpaceBasis,
  rankOf,
  type Matrix,
} from "../math";

/**
 * Lesson: "Subspaces, Column Space, Null Space, Rank" (spine L8).
 *
 * Built on the PASS contract
 * `docs/courses/linear-algebra/lessons/08-subspaces-rank/insight.md`.
 *
 * Primary insight: every question the learner has asked about a matrix since
 * Lesson 3 was a question about one of exactly TWO subspaces, and they live in
 * DIFFERENT spaces — the column space in the output space decides existence, the
 * null space in the input space decides uniqueness. In R^2 those could only be
 * "everything" or "a line", so collapse looked binary; in R^3 it becomes a count
 * (the rank), read off the pivots, with a basis taken from the columns of A
 * itself and not of its reduced form.
 *
 * This lesson is the abstraction return that L6 and L7 both deferred: it is the
 * first to leave R^2, and it states the m×n case so "different spaces" is honest
 * rather than an accident of squareness.
 *
 * Scope: rank + nullity = n is OBSERVED here and PROVED in L9. Row rank = column
 * rank is stated as a reference result, not proved. Orthogonality between the
 * spaces is L12's and is deliberately absent.
 */

const RANK_TWO_FRESH = FRESH.rankTwo as unknown as Matrix;
const RANK_ONE_FRESH = FRESH.rankOne as unknown as Matrix;

const rankTwoFreshRank = rankOf(RANK_TWO_FRESH);
const rankOneFreshRank = rankOf(RANK_ONE_FRESH);
const rankTwoFreshColBasis = columnSpaceBasis(RANK_TWO_FRESH).basis;
const rankOneFreshNullity = nullSpaceBasis(RANK_ONE_FRESH).dimension;

const A_TEX =
  "\\begin{bmatrix} 1 & 0 & 2 \\\\ 0 & 1 & 3 \\\\ 1 & 1 & 5 \\end{bmatrix}";
const FRESH_TWO_TEX =
  "\\begin{bmatrix} 2 & 1 & 0 \\\\ 0 & 3 & 1 \\\\ 4 & -1 & -1 \\end{bmatrix}";
const FRESH_ONE_TEX =
  "\\begin{bmatrix} 1 & -1 & 2 \\\\ 3 & -3 & 6 \\\\ -2 & 2 & -4 \\end{bmatrix}";
const WIDE_TEX = "\\begin{bmatrix} 1 & 2 & 3 \\\\ 0 & 1 & 4 \\end{bmatrix}";

export const subspacesRankLesson: LessonDefinition = {
  id: "subspaces-rank",
  title: "Subspaces, Column Space, Null Space, and Rank",
  subtitle:
    "A map carries two spaces — what it can reach, and what it destroys — and rank counts what survived",
  learningObjectives: [
    "Name which of the two subspaces decides existence and which decides uniqueness",
    "Say which $\\mathbb{R}^k$ each space lives in, and why they need not be the same",
    "Read $\\operatorname{Col}(A)$ as the span of the columns — everything the map can produce",
    "Read $\\operatorname{Null}(A)$ as a property of the map, not of one homogeneous system",
    "Produce $\\operatorname{rank}A$ from a row reduction, and a basis of $\\operatorname{Col}(A)$ from $A$'s own columns",
    "Predict the shape of the image (solid, plane, line, point) from the pivot count",
    "Show that shrinking the image grows the null space by exactly as much",
    "Restate invertibility and $\\det \\ne 0$ as the single statement that rank is maximal",
  ],
  motivatingQuestion:
    "Since Lesson 3 you have asked exactly two questions of every system — can it be solved, and is the answer unique. Why always those two, and never a third?",
  route: [
    { kind: "motivate" },
    { kind: "section", sectionId: "two-questions" },
    { kind: "visual" },
    { kind: "section", sectionId: "reach" },
    { kind: "formal", formalId: "def-subspace" },
    { kind: "formal", formalId: "def-two-spaces" },
    { kind: "section", sectionId: "crush" },
    { kind: "check" },
    { kind: "formal", formalId: "prop-both-subspaces" },
    { kind: "formal", formalId: "thm-existence-uniqueness" },
    { kind: "section", sectionId: "count" },
    { kind: "check", checkpointId: "shape-from-rank" },
    { kind: "formal", formalId: "prop-pivot-basis" },
    { kind: "worked", workedId: "wex-both-bases" },
    { kind: "explore", tocLabel: "Make a map lose a dimension" },
    { kind: "section", sectionId: "opposite" },
    { kind: "formal", formalId: "thm-rank-criterion" },
    { kind: "formal", formalId: "ref-row-rank" },
    { kind: "practice" },
    {
      kind: "summary",
      heading: "Two spaces, and a number that counts what survived",
    },
  ],
  sections: [
    {
      id: "two-questions",
      title: "Why always those two questions?",
      body: "Look back at what you have actually been doing. Lesson 3 asked whether $\\mathbf{b}$ was reachable, and how many recipes reached it. Lesson 4 answered both by eliminating. Lesson 5 split the answer into a particular solution plus null directions. Lessons 6 and 7 asked whether the map could be undone. Four lessons, four procedures — and underneath, **the same two questions every time**: does a solution exist, and is it unique. That is not a coincidence about the exercises. It is a fact about linear maps: each one carries exactly two subspaces, and those two questions are questions about them.",
      observation:
        "One space lives among the outputs and answers existence. The other lives among the inputs and answers uniqueness. Because they sit in different places, they are never in competition — and they can be very different sizes.",
    },
    {
      id: "reach",
      title: "Everything the map can reach",
      body: "Feed every possible input through $A$ and collect the outputs. Since $A\\mathbf{x}$ is the combination of $A$'s columns with weights $x_1, x_2, \\ldots$ (Lesson 3's column picture), the set of outputs is exactly the **span of the columns**. Call it the **column space** $\\operatorname{Col}(A)$. In the animation it is a plane inside a three-dimensional output space: the map simply cannot produce anything off that plane, no matter what you feed it. So Lesson 3's reachability question has a one-line answer now: $A\\mathbf{x}=\\mathbf{b}$ is solvable exactly when $\\mathbf{b}$ lies in $\\operatorname{Col}(A)$.",
      equation:
        "\\operatorname{Col}(A) = \\{A\\mathbf{x} : \\mathbf{x} \\in \\mathbb{R}^n\\} = \\operatorname{span}\\{\\text{columns of } A\\}",
      layers: [
        {
          kind: "connection",
          title: "This is Lesson 3's column picture, named",
          body: "“Which recipe of the columns reaches $\\mathbf{b}$?” already treated the reachable set as an object. Naming it lets you ask about it directly — its dimension, a basis for it — instead of re-deciding reachability one $\\mathbf{b}$ at a time.",
        },
      ],
    },
    {
      id: "crush",
      title: "Everything the map destroys",
      body: "Now switch panels and look at the inputs. Some nonzero vectors are sent to $\\mathbf{0}$ — and every vector on that whole line is. You met this set in Lesson 5 as $\\operatorname{Null}(A)$, the solution set of the homogeneous system. Read it now as a property of the **map**: it is everything the map destroys. Two inputs differing by a null vector are indistinguishable afterwards, which is exactly why solutions stop being unique. Notice where it is drawn: in the *input* panel. $\\operatorname{Col}(A)$ is built from outputs; $\\operatorname{Null}(A)$ is built from inputs. For an $m\\times n$ matrix they are not even in the same $\\mathbb{R}^k$.",
      equation:
        "\\operatorname{Null}(A) = \\{\\mathbf{x} \\in \\mathbb{R}^n : A\\mathbf{x} = \\mathbf{0}\\} \\subseteq \\mathbb{R}^n, \\qquad \\operatorname{Col}(A) \\subseteq \\mathbb{R}^m",
      observation:
        "Existence is a question about the output space. Uniqueness is a question about the input space. Keeping them in separate pictures is not a presentational choice — it is where they live.",
      layers: [
        {
          kind: "trap",
          title: "They are not complements, and not perpendicular",
          body: "The animation draws them in two panels, and the drawing is isometric — angles are not to scale. Do not read the null line as perpendicular to the image plane; in general it is not, and for a non-square map the two are not even in the same space. Relationships between subspaces at right angles are Lesson 12's subject.",
        },
      ],
    },
    {
      id: "count",
      title: "Collapse has degrees",
      body: "In the plane, Lessons 6 and 7 could only ever say *collapsed* or *not*: a column space in $\\mathbb{R}^2$ is the whole plane, a line, or the origin, and two of those are degenerate. Move to $\\mathbb{R}^3$ and the binary becomes a **count**. The unit cube can land as a solid, a plane, a line, or a point — three, two, one, or zero surviving dimensions. That number is the **rank**: $\\operatorname{rank}A = \\dim\\operatorname{Col}(A)$. And you have been computing it since Lesson 4 without interpreting it, because it is exactly the number of pivots.",
      equation:
        "\\operatorname{rank}A = \\dim \\operatorname{Col}(A) = \\#\\text{pivots}",
      observation:
        "“The plane collapsed” was never the whole story — it was the two-dimensional shadow of a count.",
    },
    {
      id: "opposite",
      title: "The two spaces move in opposite directions",
      body: "Watch the last beat of the animation again. Going from the rank-2 map to the rank-1 map, the image shrinks from a plane to a line — and the null space *grows* from a line to a plane. That is not a coincidence of these two examples. Every column that fails to be a pivot column contributes one free variable, and each free variable contributes one basis vector to $\\operatorname{Null}(A)$ (Lessons 4 and 5). So the columns split cleanly into pivots and non-pivots, and the two counts must add to $n$. Here that is an **observation** with a reason; the next lesson turns it into a law and proves it.",
      equation:
        "\\operatorname{rank}A + \\dim\\operatorname{Null}(A) = n \\quad \\text{(observed here; proved next lesson)}",
      layers: [
        {
          kind: "looking-ahead",
          title: "Why this deserves its own lesson",
          body: "Stated as arithmetic it looks obvious. Read as conservation — *every input dimension either survives into the output or disappears into the null space, and none go missing* — it becomes the accounting law that explains why you can never gain reachability by giving up uniqueness. That reading is the next lesson.",
        },
        {
          kind: "looking-ahead",
          title: "And why eigenvectors will need it",
          body: "An eigenspace is $\\operatorname{Null}(A - \\lambda I)$ — an actual subspace, with a dimension. Whether a repeated eigenvalue gives one eigendirection or a whole plane of them is a question about *that* null space's dimension, and you now have the vocabulary to ask it.",
        },
      ],
    },
  ],
  formalBlocks: [
    {
      id: "def-subspace",
      kind: "definition",
      label: "Subspace",
      statement:
        "A set $S \\subseteq \\mathbb{R}^k$ is a **subspace** if $\\mathbf{0} \\in S$, and $S$ is closed under addition and scalar multiplication: $\\mathbf{u}, \\mathbf{v} \\in S \\Rightarrow \\mathbf{u}+\\mathbf{v} \\in S$, and $c\\,\\mathbf{u} \\in S$ for every scalar $c$.",
      interpretation:
        "Geometrically the three conditions force exactly one thing: $S$ is a **flat through the origin** — a point, a line, a plane, and so on. Nothing curved, and nothing offset. That is why Lesson 5's affine solution set is *not* a subspace unless $\\mathbf{b} = \\mathbf{0}$.",
      visibility: "visible",
      layers: [
        {
          kind: "why",
          title: "Why the origin cannot be optional",
          body: "Closure under scaling includes $c = 0$, and $0\\,\\mathbf{u} = \\mathbf{0}$. So any nonempty set closed under scaling already contains $\\mathbf{0}$ — the condition is less an extra axiom than a reminder that an offset flat cannot qualify.",
        },
      ],
    },
    {
      id: "def-two-spaces",
      kind: "definition",
      label: "The two spaces of a map",
      statement:
        "For an $m \\times n$ matrix $A$: the **column space** is $\\operatorname{Col}(A) = \\operatorname{span}\\{\\text{columns of }A\\} \\subseteq \\mathbb{R}^m$, and the **null space** is $\\operatorname{Null}(A) = \\{\\mathbf{x} : A\\mathbf{x} = \\mathbf{0}\\} \\subseteq \\mathbb{R}^n$. The **rank** is $\\operatorname{rank}A = \\dim\\operatorname{Col}(A)$.",
      interpretation:
        "Note the ambient spaces carefully: outputs live in $\\mathbb{R}^m$, inputs in $\\mathbb{R}^n$. When $A$ is square these coincide, which is precisely why the square case makes the distinction easy to lose.",
      visibility: "visible",
    },
    {
      id: "prop-both-subspaces",
      kind: "proposition",
      label: "Both really are subspaces",
      statement:
        "$\\operatorname{Col}(A)$ is a subspace of $\\mathbb{R}^m$, and $\\operatorname{Null}(A)$ is a subspace of $\\mathbb{R}^n$.",
      interpretation:
        "Both proofs are one line of linearity each — which is the point: these are not exotic sets that happen to satisfy some axioms, they are subspaces *because* $A$ is linear.",
      visibility: "revealed",
      layers: [
        {
          kind: "math-note",
          title: "Both proofs, in full",
          body: "**Column space.** $A\\mathbf{0} = \\mathbf{0}$, so $\\mathbf{0} \\in \\operatorname{Col}(A)$. If $\\mathbf{p} = A\\mathbf{x}$ and $\\mathbf{q} = A\\mathbf{y}$ are reachable, then $\\mathbf{p} + \\mathbf{q} = A(\\mathbf{x}+\\mathbf{y})$ and $c\\,\\mathbf{p} = A(c\\,\\mathbf{x})$ are reachable too. **Null space.** $A\\mathbf{0} = \\mathbf{0}$; and if $A\\mathbf{u} = A\\mathbf{v} = \\mathbf{0}$ then $A(\\mathbf{u}+\\mathbf{v}) = \\mathbf{0}$ and $A(c\\,\\mathbf{u}) = \\mathbf{0}$. Each closure property is just linearity read in one direction.",
        },
      ],
    },
    {
      id: "thm-existence-uniqueness",
      kind: "theorem",
      label: "The two questions, answered by the two spaces",
      statement:
        "$A\\mathbf{x} = \\mathbf{b}$ is **consistent** if and only if $\\mathbf{b} \\in \\operatorname{Col}(A)$. When it is consistent, its solution is **unique** if and only if $\\operatorname{Null}(A) = \\{\\mathbf{0}\\}$.",
      interpretation:
        "Existence is decided entirely in the output space; uniqueness entirely in the input space. Neither answer constrains the other — which is why a system can be solvable-but-not-unique, unique-when-solvable-but-often-unsolvable, or both, or neither.",
      visibility: "visible",
      layers: [
        {
          kind: "math-note",
          title: "Where each half comes from",
          body: "The first half is the definition of $\\operatorname{Col}(A)$ unwound: $\\mathbf{b}$ is an output of the map exactly when some input produces it. The second half is Lesson 5's corollary: two solutions differ by a null vector, so a trivial null space forbids a second solution, and a nontrivial one manufactures infinitely many.",
        },
      ],
    },
    {
      id: "prop-pivot-basis",
      kind: "proposition",
      label: "One row reduction, read three ways",
      statement:
        "Row-reduce $A$. Then (i) $\\operatorname{rank}A$ is the number of pivots; (ii) the columns of **$A$ itself** in the pivot positions form a basis of $\\operatorname{Col}(A)$; (iii) setting one free variable to $1$ and the rest to $0$ produces one basis vector of $\\operatorname{Null}(A)$ per free variable.",
      interpretation:
        "A single elimination answers everything this lesson asks. The one thing you must not do is read the column-space basis off the *reduced* matrix.",
      visibility: "revealed",
      layers: [
        {
          kind: "trap",
          title: "Row operations change the column space",
          body: "Elimination preserves the row space and the null space, but **not** the column space — it recombines rows, which moves the columns. For $A = " + A_TEX + "$ the reduced form's pivot columns are $\\mathbf{e}_1$ and $\\mathbf{e}_2$, spanning the $xy$-plane; but the true column space contains $(2,3,5)$, which is not in that plane. The *positions* transfer; the *vectors* must be taken from $A$.",
        },
      ],
    },
    {
      id: "thm-rank-criterion",
      kind: "theorem",
      label: "Everything you already knew, restated once",
      statement:
        "For an $n \\times n$ matrix $A$, the following are equivalent: $A$ is invertible; $\\det(A) \\ne 0$; the columns are independent; $\\operatorname{Null}(A) = \\{\\mathbf{0}\\}$; $A\\mathbf{x}=\\mathbf{b}$ has exactly one solution for every $\\mathbf{b}$; $\\operatorname{Col}(A) = \\mathbb{R}^n$; and $\\operatorname{rank}A = n$.",
      interpretation:
        "Lessons 5, 6 and 7 each added an item to this list without being able to say what united them. The unifying statement is the last one: **the rank is as large as it can be**. Invertibility is not a separate property; it is the top value of a count.",
      visibility: "visible",
      layers: [
        {
          kind: "connection",
          title: "The binary was the extreme case all along",
          body: "“Collapsed or not” is the question “is $\\operatorname{rank}A = n$?” asked in a space too small to show any other answer. In $\\mathbb{R}^3$ the same map might have rank 2 — collapsed, but only by one.",
        },
      ],
    },
    {
      id: "ref-row-rank",
      kind: "proposition",
      label: "Row rank equals column rank",
      statement:
        "$\\operatorname{rank}A = \\operatorname{rank}A^{\\mathsf{T}}$: the number of independent columns equals the number of independent rows.",
      interpretation:
        "Stated for completeness because it is surprising and because you will meet it again — the rows and the columns of a matrix are different objects living in different spaces, yet they contain exactly as many independent directions as each other. **Its proof is not given here**; it belongs with the deeper structural results.",
      visibility: "reference",
    },
  ],
  guidedSceneId: "subspaces-rank",
  explorationId: "subspaces-rank",
  workedExamples: [
    {
      id: "wex-both-bases",
      title: "One elimination, both bases",
      prompt:
        "For $A = " + A_TEX + "$, find $\\operatorname{rank}A$, a basis of $\\operatorname{Col}(A)$, and a basis of $\\operatorname{Null}(A)$.",
      equations: [
        "A = " + A_TEX + " \\;\\xrightarrow{\\;R_3 \\to R_3 - R_1 - R_2\\;}\\; \\begin{bmatrix} 1 & 0 & 2 \\\\ 0 & 1 & 3 \\\\ 0 & 0 & 0 \\end{bmatrix}",
        "\\text{Pivots in columns } 1, 2 \\;\\Rightarrow\\; \\operatorname{rank}A = 2",
        "\\operatorname{Col}(A) = \\operatorname{span}\\left\\{ \\begin{bmatrix} 1 \\\\ 0 \\\\ 1 \\end{bmatrix}, \\begin{bmatrix} 0 \\\\ 1 \\\\ 1 \\end{bmatrix} \\right\\} \\quad \\text{— columns 1 and 2 of } A",
        "x_3 \\text{ free}: \\; x_3 = 1 \\Rightarrow x_1 = -2,\\; x_2 = -3",
        "\\operatorname{Null}(A) = \\operatorname{span}\\left\\{ \\begin{bmatrix} -2 \\\\ -3 \\\\ 1 \\end{bmatrix} \\right\\}, \\quad A\\begin{bmatrix} -2 \\\\ -3 \\\\ 1 \\end{bmatrix} = \\mathbf{0} \\;\\checkmark",
        "\\operatorname{rank}A + \\dim\\operatorname{Null}(A) = 2 + 1 = 3 = n",
      ],
      equationsAriaLabel:
        "Eliminating the third row leaves pivots in columns one and two, so the rank is two. The column space basis is columns one and two of A, namely (1,0,1) and (0,1,1). The third variable is free, giving the null vector (-2,-3,1), which A sends to zero. Rank two plus nullity one equals three.",
      layers: [
        {
          kind: "trap",
          title: "Read the basis off $A$, not off the reduced form",
          body: "The reduced matrix's pivot columns are $(1,0,0)$ and $(0,1,0)$ — they span the $xy$-plane, which is **not** $\\operatorname{Col}(A)$: the true column space contains $(2,3,5)$. Take the pivot *positions* from the reduction and the *vectors* from $A$.",
        },
      ],
    },
  ],
  callouts: [
    {
      id: "same-space",
      title: "“The column space and the null space live in the same place”",
      belief:
        "Both are subspaces attached to $A$, so they sit in the same $\\mathbb{R}^k$ and can be compared directly — maybe they even partition it.",
      confront:
        "Take $A = " + WIDE_TEX + "$, a $2 \\times 3$ matrix. Its outputs are vectors in $\\mathbb{R}^2$, so $\\operatorname{Col}(A) \\subseteq \\mathbb{R}^2$. Its inputs are vectors in $\\mathbb{R}^3$, so $\\operatorname{Null}(A) \\subseteq \\mathbb{R}^3$. They are not merely different sets — they are subsets of different spaces, and asking whether one contains the other is not even a well-formed question.",
      resolve:
        "$\\operatorname{Col}(A)$ is made of **outputs** and lives in $\\mathbb{R}^m$; $\\operatorname{Null}(A)$ is made of **inputs** and lives in $\\mathbb{R}^n$. For a square matrix they share an ambient space, which is exactly why the square case is the easy place to lose the distinction.",
    },
    {
      id: "basis-from-reduced",
      title: "“The column space is spanned by the reduced matrix's columns”",
      belief:
        "Elimination is solution-preserving, so the reduced matrix should have the same column space too.",
      confront:
        "For $A = " + A_TEX + "$ the reduced form is $\\begin{bmatrix} 1 & 0 & 2 \\\\ 0 & 1 & 3 \\\\ 0 & 0 & 0 \\end{bmatrix}$, whose columns all have third entry $0$ — they span the $xy$-plane. But $A$'s own third column is $(2,3,5)$, which is in $\\operatorname{Col}(A)$ and is nowhere in that plane.",
      resolve:
        "Row operations preserve the **row** space and the **null** space, not the column space — they recombine rows, which moves every column. Use the reduction to find *which* columns are pivot columns, then take those columns from $A$.",
    },
    {
      id: "flat-is-subspace",
      title: "“Any flat set is a subspace”",
      belief:
        "A line is a line; if it is straight, it should be a subspace.",
      confront:
        "Lesson 5's solution set $\\mathbf{x}_p + \\operatorname{Null}(A)$ is perfectly straight, yet doubling one of its points generally leaves it, and it misses the origin entirely when $\\mathbf{b} \\ne \\mathbf{0}$.",
      resolve:
        "Closure under scaling forces $\\mathbf{0}$ to belong. A subspace is a flat **through the origin**; an offset flat is an *affine* set. Only the homogeneous case coincides.",
    },
    {
      id: "both-grow-together",
      title: "“A big null space means a big column space”",
      belief:
        "Both are subspaces of the same matrix, so a matrix that is ‘big’ in one should be big in the other.",
      confront:
        "The rank-1 map $" + FRESH_ONE_TEX + "$ has a one-dimensional column space and a **two**-dimensional null space. The identity has a three-dimensional column space and a null space of dimension $0$.",
      resolve:
        "They move in **opposite** directions. Every column is either a pivot column (contributing to the rank) or a free column (contributing to the nullity), so the two counts trade off against each other and add to $n$.",
    },
  ],
  checkpoint: {
    prompt:
      "A map sends some nonzero vector to $\\mathbf{0}$. Which of the two questions does that settle, and which does it leave completely open?",
    answer:
      "It settles **uniqueness**: $\\operatorname{Null}(A) \\ne \\{\\mathbf{0}\\}$, so no system with this $A$ can have exactly one solution — any solution can be shifted along the null space to make another. It says **nothing about existence**: whether a particular $\\mathbf{b}$ is reachable is a question about $\\operatorname{Col}(A)$, in the other space entirely. So the system has either no solutions or infinitely many, and which one depends on $\\mathbf{b}$.",
  },
  checkpoints: [
    {
      id: "shape-from-rank",
      prompt:
        "A $3 \\times 3$ map has exactly 2 pivots. What shape is the image of the unit cube, and how big is the null space?",
      answer:
        "Two pivots means $\\operatorname{rank}A = 2$: the image is a **plane** through the origin — the cube is flattened. One column is free, so $\\operatorname{Null}(A)$ is a **line**: one dimension was crushed. Two survived, one died, and $2 + 1 = 3$ accounts for every input dimension.",
    },
  ],
  exercises: [
    {
      id: "rank-which-space",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "Which space decides whether $A\\mathbf{x} = \\mathbf{b}$ has **any** solution at all?",
      choices: [
        "$\\operatorname{Null}(A)$ — if it is trivial, a solution exists",
        "$\\operatorname{Col}(A)$ — a solution exists exactly when $\\mathbf{b}$ lies in it",
        "Both equally; existence needs the two together",
        "Neither; existence depends only on the size of $A$",
      ],
      correctChoice: 1,
      explanation:
        "$\\operatorname{Col}(A)$ is the set of everything the map can output, so $\\mathbf{b}$ is reachable exactly when $\\mathbf{b} \\in \\operatorname{Col}(A)$. $\\operatorname{Null}(A)$ answers the *other* question — whether the solution, if one exists, is the only one.",
    },
    {
      id: "rank-where-it-lives",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "For $A = " + WIDE_TEX + "$ (2 rows, 3 columns), where do the two spaces live?",
      choices: [
        "Both in $\\mathbb{R}^3$",
        "Both in $\\mathbb{R}^2$",
        "$\\operatorname{Col}(A) \\subseteq \\mathbb{R}^2$ and $\\operatorname{Null}(A) \\subseteq \\mathbb{R}^3$",
        "$\\operatorname{Col}(A) \\subseteq \\mathbb{R}^3$ and $\\operatorname{Null}(A) \\subseteq \\mathbb{R}^2$",
      ],
      correctChoice: 2,
      explanation:
        "Outputs of a $2\\times3$ map are vectors with $2$ entries, so $\\operatorname{Col}(A) \\subseteq \\mathbb{R}^2$; inputs have $3$ entries, so $\\operatorname{Null}(A) \\subseteq \\mathbb{R}^3$. They are subsets of different spaces — which is why comparing or intersecting them is not even a well-formed question here.",
    },
    {
      id: "rank-count-fresh",
      type: "numeric",
      tier: "drill",
      prompt:
        "Compute $\\operatorname{rank}$ of the fresh map $" + FRESH_TWO_TEX + "$. (Row 3 is a combination of rows 1 and 2 — find it.)",
      expected: rankTwoFreshRank,
      tolerance: 1e-9,
      explanation:
        "$R_3 = 2R_1 - R_2$, so elimination kills the third row and leaves two pivots: $\\operatorname{rank} = 2$. The image of the unit cube is a plane, and one dimension was crushed.",
    },
    {
      id: "rank-colspace-basis-fresh",
      type: "custom",
      capabilityId: MATRIX_ENTRY_ID,
      tier: "drill",
      prompt:
        "For that same fresh map $" + FRESH_TWO_TEX + "$, enter a basis of $\\operatorname{Col}(A)$ as a $3\\times2$ matrix — the two basis vectors as its columns. Remember where the vectors must come from.",
      config: {
        rows: 3,
        cols: 2,
        matrixName: "\\text{basis of } \\operatorname{Col}(A)",
        expected: [
          [rankTwoFreshColBasis[0]![0]!, rankTwoFreshColBasis[1]![0]!],
          [rankTwoFreshColBasis[0]![1]!, rankTwoFreshColBasis[1]![1]!],
          [rankTwoFreshColBasis[0]![2]!, rankTwoFreshColBasis[1]![2]!],
        ],
        explanation:
          "The pivots are in columns 1 and 2, so the basis is columns 1 and 2 **of $A$ itself**: $(2, 0, 4)$ and $(1, 3, -1)$. Taking them from the *reduced* matrix would have given $(1,0,0)$ and $(0,1,0)$ — a different plane, and the wrong answer.",
      },
    },
    {
      id: "rank-image-shape",
      type: "multiple-choice",
      tier: "drill",
      prompt:
        "A $3\\times3$ map row-reduces to a form with exactly one pivot. What is the image of the unit cube, and what is $\\dim\\operatorname{Null}(A)$?",
      choices: [
        "A plane; nullity 1",
        "A line; nullity 2",
        "A line; nullity 1",
        "A point; nullity 3",
      ],
      correctChoice: 1,
      explanation:
        "One pivot means $\\operatorname{rank} = 1$, so the image is a **line** — only one direction survived. The other two columns are free, so $\\dim\\operatorname{Null}(A) = 2$: a whole plane of inputs is crushed. Note $1 + 2 = 3$.",
    },
    {
      id: "rank-null-witness",
      type: "custom",
      capabilityId: CONSTRUCT_IN_EXPLORER_ID,
      tier: "drill",
      prompt:
        "Back in the plane for a moment. For $A = \\begin{bmatrix} 2 & 4 \\\\ 1 & 2 \\end{bmatrix}$ — the collapsing map from Lesson 2 — commit **any nonzero** vector in $\\operatorname{Null}(A)$.",
      config: {
        target: "vector2",
        check: { kind: "vector-on-line", spanning: [2, -1] },
        reveal:
          "Any nonzero multiple of $(2, -1)$ works. Since $\\operatorname{Null}(A)$ is a line rather than $\\{\\mathbf{0}\\}$, this map has $\\operatorname{rank} 1$ in $\\mathbb{R}^2$: its column space is the line through $(2,1)$, and $1 + 1 = 2$ accounts for both input dimensions.",
        hint:
          "You need $2x + 4y = 0$ and $x + 2y = 0$ — the same condition twice, since the rows are proportional.",
      },
    },
    {
      id: "rank-opposite-directions",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt:
        "A fresh rank-1 map: $" + FRESH_ONE_TEX + "$. Every row is a multiple of $(1,-1,2)$. Work out what happened to both spaces.",
      config: {
        steps: [
          {
            kind: "numeric",
            prompt: "What is $\\operatorname{rank}A$?",
            expected: rankOneFreshRank,
            explanation:
              "All three rows are multiples of one another, so elimination leaves a single pivot: rank 1. The image is a line.",
          },
          {
            kind: "numeric",
            prompt: "So what is $\\dim\\operatorname{Null}(A)$?",
            expected: rankOneFreshNullity,
            explanation:
              "Two of the three columns are free, so the null space has dimension 2 — a whole **plane** of inputs is crushed to the origin.",
          },
          {
            kind: "multiple-choice",
            prompt:
              "Compare with the rank-2 map from earlier (rank 2, nullity 1). What is the pattern?",
            choices: [
              "Both spaces shrank",
              "The image shrank by one dimension and the null space grew by one",
              "Both spaces grew",
              "The null space is unchanged; only the image varies",
            ],
            correctChoice: 1,
            explanation:
              "Rank fell $2 \\to 1$ while nullity rose $1 \\to 2$. Every column is either a pivot column or a free column, so a dimension leaving the image must arrive in the null space. The total is always $n = 3$ — the next lesson's conservation law.",
          },
        ],
      },
    },
    {
      id: "rank-basis-trap",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "You reduce $A = " + A_TEX + "$ to $\\begin{bmatrix} 1 & 0 & 2 \\\\ 0 & 1 & 3 \\\\ 0 & 0 & 0 \\end{bmatrix}$. Which pair is a correct basis of $\\operatorname{Col}(A)$?",
      choices: [
        "$(1,0,0)$ and $(0,1,0)$ — the reduced matrix's pivot columns",
        "$(1,0,1)$ and $(0,1,1)$ — columns 1 and 2 of the original $A$",
        "$(1,0,2)$ and $(0,1,3)$ — the reduced matrix's rows",
        "$(2,3,5)$ alone — the non-pivot column",
      ],
      correctChoice: 1,
      explanation:
        "Row operations preserve the row space and the null space but **change the column space**. The reduction tells you *which positions* are pivots (columns 1 and 2); the basis vectors themselves must be taken from $A$. Checking: $A$'s third column $(2,3,5) = 2(1,0,1) + 3(0,1,1)$, so it adds nothing — but it is *not* in the span of $(1,0,0)$ and $(0,1,0)$, which is how you can see option 1 is wrong.",
    },
    {
      id: "rank-restate-invertibility",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "Which single statement about an $n\\times n$ matrix implies all of: invertible, $\\det \\ne 0$, independent columns, trivial null space, and exactly one solution for every $\\mathbf{b}$?",
      choices: [
        "$\\operatorname{rank}A = n$",
        "$\\operatorname{rank}A \\ge 1$",
        "$\\dim\\operatorname{Null}(A) = n$",
        "$\\operatorname{Col}(A)$ is a subspace",
      ],
      correctChoice: 0,
      explanation:
        "All five are the same condition seen from different sides, and rank names it: **every** input dimension survives. Lessons 5, 6 and 7 each added an item to that list; the unifying statement is that the count is at its maximum. (Option 4 is always true and says nothing — every column space is a subspace.)",
    },
    {
      id: "rank-prove-subspace",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt:
        "Prove it: show that $\\operatorname{Col}(A)$ is a subspace of $\\mathbb{R}^m$ — it contains $\\mathbf{0}$ and is closed under addition and scalar multiplication. Write your proof, then compare with the model answer.",
      config: {
        modelAnswer:
          "Contains $\\mathbf{0}$: $A\\mathbf{0} = \\mathbf{0}$, so $\\mathbf{0}$ is reachable and lies in $\\operatorname{Col}(A)$. Closed under addition: let $\\mathbf{p}, \\mathbf{q} \\in \\operatorname{Col}(A)$, so $\\mathbf{p} = A\\mathbf{x}$ and $\\mathbf{q} = A\\mathbf{y}$ for some inputs $\\mathbf{x}, \\mathbf{y}$. Then $\\mathbf{p} + \\mathbf{q} = A\\mathbf{x} + A\\mathbf{y} = A(\\mathbf{x} + \\mathbf{y})$ by linearity, so $\\mathbf{p} + \\mathbf{q}$ is itself reachable — it is the image of $\\mathbf{x} + \\mathbf{y}$. Closed under scaling: for any scalar $c$, $c\\,\\mathbf{p} = c\\,A\\mathbf{x} = A(c\\,\\mathbf{x})$, again an output of the map. All three conditions hold, so $\\operatorname{Col}(A)$ is a subspace of $\\mathbb{R}^m$. Note what did the work: every step used only the linearity of $A$, which is why the result holds for *every* matrix and is not a property of any particular one.",
        rubric:
          "A strong answer checks all three conditions and, crucially, exhibits a *witness input* for each closure step — showing $\\mathbf{p}+\\mathbf{q}$ is reachable by naming $\\mathbf{x}+\\mathbf{y}$ as the input that reaches it, rather than asserting closure. It should note that only linearity of $A$ was used.",
      },
    },
  ],
  keyTakeaway:
    "A linear map carries two subspaces, and they answer the two questions you have been asking since Lesson 3. $\\operatorname{Col}(A)$ lives among the outputs and decides **existence**: $A\\mathbf{x}=\\mathbf{b}$ is solvable exactly when $\\mathbf{b}$ is in it. $\\operatorname{Null}(A)$ lives among the inputs and decides **uniqueness**. Rank counts the dimensions that survive into the output, and it is the number of pivots — with a basis of $\\operatorname{Col}(A)$ taken from $A$'s own columns, never from its reduced form. Invertibility and $\\det \\ne 0$ are simply rank at its maximum, and as the rank falls the null space grows by exactly as much.",
  structuredSummary: {
    coreMentalModel:
      "A map has an output side and an input side: what it can reach, and what it destroys. Rank counts what survived.",
    definitionsIntroduced: [
      "Subspace — a flat through the origin (closed under addition and scaling)",
      "$\\operatorname{Col}(A) \\subseteq \\mathbb{R}^m$, $\\operatorname{Null}(A) \\subseteq \\mathbb{R}^n$, and $\\operatorname{rank}A = \\dim\\operatorname{Col}(A)$",
    ],
    mainResult:
      "Consistent $\\iff \\mathbf{b} \\in \\operatorname{Col}(A)$; unique $\\iff \\operatorname{Null}(A)=\\{\\mathbf{0}\\}$; and for square $A$, invertible $\\iff \\operatorname{rank}A = n$.",
    representationsConnected:
      "The flattened image (picture) ↔ the pivot count (procedure) ↔ $\\dim\\operatorname{Col}(A)$ (symbol).",
    commonMistake:
      "Putting the two spaces in the same $\\mathbb{R}^k$, or reading the column-space basis off the reduced matrix instead of off $A$.",
    canonicalExample:
      "$A = " + A_TEX + "$: rank 2, $\\operatorname{Col}(A)$ spanned by $(1,0,1)$ and $(0,1,1)$, $\\operatorname{Null}(A)$ spanned by $(-2,-3,1)$.",
    oneProblemWorthRemembering:
      "From one row reduction, produce the rank, a basis of $\\operatorname{Col}(A)$ from $A$'s columns, and a basis of $\\operatorname{Null}(A)$.",
    whatThisUnlocksNext:
      "Why $\\operatorname{rank} + \\operatorname{nullity} = n$ is a conservation law — and, later, that an eigenspace is $\\operatorname{Null}(A - \\lambda I)$.",
  },
};
