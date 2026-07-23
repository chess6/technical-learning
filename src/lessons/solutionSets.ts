import type { LessonDefinition } from "./types";
import { LINEAR_SYSTEM_FRESH as EX2 } from "./exampleData";
import {
  CONSTRUCT_IN_EXPLORER_ID,
  EXERCISE_SEQUENCE_ID,
  SELF_CHECK_ID,
} from "./capabilities";

/**
 * Lesson: "Solution Sets & Homogeneous Systems".
 *
 * Stage 3 of the Insight Discovery Gate for this topic. Built on the PASS
 * contract `docs/courses/linear-algebra/lessons/05-solution-sets/insight.md` and the plan
 * `docs/courses/linear-algebra/lessons/05-solution-sets/lesson-plan.md`.
 *
 * Primary insight (preserved from Stage 1/2): any two solutions of a consistent
 * `A x = b` differ by a solution of `A x = 0`, so once one solution exists the
 * whole set is `x_p + Null(A)` — the null space carried off the origin — and it
 * is empty when no solution exists. Corrected scope is enforced throughout: two
 * solutions give at least an affine line (the full shape needs all of Null(A));
 * a trivial null space means uniqueness, not reachability.
 *
 * Continuity: the running numbers ARE Lesson 3's dependent system — columns
 * (1,2),(2,4) with b = (3,6). So x_p = (3,0), the null direction is (2,−1), and
 * (3,0),(1,1),(5,−1) are all solutions. The learner re-reads the infinitely-many
 * case they already met, now as one structured object.
 */
export const solutionSetsLesson: LessonDefinition = {
  id: "solution-sets",
  title: "Solution Sets & Homogeneous Systems",
  subtitle:
    "Subtract two solutions and you land on $A\\mathbf{x}=\\mathbf{0}$ — so the whole set is one solution plus the null space",
  exampleId: "systems-default",
  learningObjectives: [
    "Discover that any two solutions of the same consistent system differ by a solution of $A\\mathbf{x} = \\mathbf{0}$",
    "Generate new solutions from a known one by adding null-space vectors — a third without re-solving",
    "State and use $\\operatorname{Sol}(A, \\mathbf{b}) = \\mathbf{x}_p + \\operatorname{Null}(A)$ for a consistent system, and know it is empty otherwise",
    "Distinguish what one null direction gives (at least an affine line) from what the whole null space gives (the full shape and its dimension)",
    "See $\\operatorname{Null}(A)$ as a subspace through the origin and the solution set as its affine translate — not a subspace unless $\\mathbf{b} = \\mathbf{0}$",
    "Separate existence (is $\\mathbf{b}$ reachable?) from multiplicity (is the null space trivial?), and read uniqueness off $A\\mathbf{x} = \\mathbf{0}$",
    "Connect free variables to independent null directions and the dimension of the solution set",
  ],
  motivatingQuestion:
    "You already know one solution of a consistent system, and you find a second. Without solving again, can you produce a third — and say what the whole set of solutions looks like?",
  route: [
    { kind: "motivate" },
    { kind: "section", sectionId: "infinite-shape" },
    // Watch: two solutions → their difference is homogeneous → generate more →
    // the null line → the solution set is that line translated → the case split.
    { kind: "visual" },
    { kind: "section", sectionId: "difference-engine" },
    { kind: "formal", formalId: "def-homogeneous" },
    { kind: "formal", formalId: "thm-null-subspace" },
    { kind: "formal", formalId: "thm-solution-structure" },
    { kind: "worked", workedId: "wex-decomposition" },
    { kind: "section", sectionId: "translate" },
    { kind: "formal", formalId: "cor-uniqueness" },
    { kind: "worked", workedId: "wex-existence-multiplicity" },
    { kind: "check" },
    { kind: "explore" },
    { kind: "section", sectionId: "free-variables" },
    { kind: "practice" },
    { kind: "summary" },
  ],
  formalBlocks: [
    {
      id: "def-homogeneous",
      kind: "definition",
      label: "Homogeneous system and null space",
      statement:
        "The **homogeneous system** for $A$ is $A\\mathbf{x} = \\mathbf{0}$. Its solution set is the **null space** $\\operatorname{Null}(A) = \\{\\mathbf{x} : A\\mathbf{x} = \\mathbf{0}\\}$. It always contains $\\mathbf{0}$, so a homogeneous system is *always* consistent.",
      interpretation:
        "Setting the right-hand side to $\\mathbf{0}$ strips away the question of *reaching* a target and leaves only the question of *how many* ways there are to reach it. That is why the homogeneous system is the tool that measures multiplicity.",
      visibility: "visible",
      layers: [
        {
          kind: "why",
          title: "Why $\\mathbf{0}$ is always a solution",
          body: "$A\\mathbf{0} = \\mathbf{0}$ for every matrix $A$ — the columns times zero coefficients. So $\\mathbf{0} \\in \\operatorname{Null}(A)$ no matter what. The real content is whether there is *anything else* in $\\operatorname{Null}(A)$.",
        },
      ],
    },
    {
      id: "thm-null-subspace",
      kind: "proposition",
      label: "The null space is a subspace",
      statement:
        "$\\operatorname{Null}(A)$ is a **subspace**: it contains $\\mathbf{0}$, and if $\\mathbf{u}, \\mathbf{v} \\in \\operatorname{Null}(A)$ then $\\mathbf{u} + \\mathbf{v} \\in \\operatorname{Null}(A)$ and $c\\,\\mathbf{u} \\in \\operatorname{Null}(A)$ for every scalar $c$. In the $2\\times 2$ cases here it is geometrically a point, a line, or a plane **through the origin**; in general it is a subspace of dimension equal to the number of free variables.",
      interpretation:
        "Homogeneous solutions are closed under the two moves that build combinations — adding and scaling — so $\\operatorname{Null}(A)$ is a flat object anchored at the origin. Its dimension is the **nullity**.",
      visibility: "revealed",
      layers: [
        {
          kind: "math-note",
          title: "One line of algebra",
          body: "If $A\\mathbf{u} = \\mathbf{0}$ and $A\\mathbf{v} = \\mathbf{0}$, then $A(\\mathbf{u} + \\mathbf{v}) = A\\mathbf{u} + A\\mathbf{v} = \\mathbf{0}$ and $A(c\\,\\mathbf{u}) = c\\,A\\mathbf{u} = \\mathbf{0}$. Closure is *derived from linearity* — nothing else is assumed.",
        },
      ],
    },
    {
      id: "thm-solution-structure",
      kind: "theorem",
      label: "Solution-set structure",
      statement:
        "If $A\\mathbf{x} = \\mathbf{b}$ is **consistent** with any particular solution $\\mathbf{x}_p$, then its solution set is $\\operatorname{Sol}(A, \\mathbf{b}) = \\mathbf{x}_p + \\operatorname{Null}(A)$ — that is, $\\{\\mathbf{x}_p + \\mathbf{x}_h : \\mathbf{x}_h \\in \\operatorname{Null}(A)\\}$. If it is **inconsistent**, the solution set is empty, $\\varnothing$.",
      interpretation:
        "One solution fixes an anchor; the null space supplies every other solution as a shift away from it. The picture: take $\\operatorname{Null}(A)$ and slide it so it passes through $\\mathbf{x}_p$ instead of the origin.",
      visibility: "visible",
      layers: [
        {
          kind: "math-note",
          title: "Both directions of the set equality",
          body: "$(\\supseteq)$ For $\\mathbf{x}_h \\in \\operatorname{Null}(A)$, $A(\\mathbf{x}_p + \\mathbf{x}_h) = A\\mathbf{x}_p + A\\mathbf{x}_h = \\mathbf{b} + \\mathbf{0} = \\mathbf{b}$, so $\\mathbf{x}_p + \\mathbf{x}_h$ solves it. $(\\subseteq)$ If $A\\mathbf{x} = \\mathbf{b}$, then $A(\\mathbf{x} - \\mathbf{x}_p) = \\mathbf{0}$, so $\\mathbf{x} - \\mathbf{x}_p \\in \\operatorname{Null}(A)$, i.e. $\\mathbf{x} = \\mathbf{x}_p + \\mathbf{x}_h$. The two inclusions give the equality.",
        },
        {
          kind: "trap",
          title: "The consistency condition is not optional",
          body: "The formula $\\mathbf{x}_p + \\operatorname{Null}(A)$ *presupposes* a particular solution $\\mathbf{x}_p$. If $\\mathbf{b}$ is off the column space there is no $\\mathbf{x}_p$, and the set is empty — **not** $\\mathbf{0} + \\operatorname{Null}(A)$. Never write the decomposition without checking consistency first.",
        },
      ],
    },
    {
      id: "cor-uniqueness",
      kind: "corollary",
      label: "Uniqueness ⇔ trivial null space (not reachability)",
      statement:
        "A consistent system $A\\mathbf{x} = \\mathbf{b}$ has a **unique** solution if and only if $\\operatorname{Null}(A) = \\{\\mathbf{0}\\}$. Equivalently, $A\\mathbf{x} = \\mathbf{b}$ has **at most one** solution for every $\\mathbf{b}$ exactly when the null space is trivial.",
      interpretation:
        "The null space alone decides *multiplicity* for the whole family of right-hand sides. It says nothing about *existence*: a trivial null space guarantees at most one solution per $\\mathbf{b}$, not that every $\\mathbf{b}$ is reachable.",
      visibility: "revealed",
      layers: [
        {
          kind: "trap",
          title: "Uniqueness is not reachability",
          body: "\u201cAt most one solution for every $\\mathbf{b}$\u201d (injectivity) and \u201cat least one solution for every $\\mathbf{b}$\u201d (surjectivity — every $\\mathbf{b}$ in the column space) are different statements. A trivial null space gives the first. Getting *exactly one for every* $\\mathbf{b}$ additionally needs the columns to span the whole space.",
        },
        {
          kind: "connection",
          title: "This is Lesson 3's trichotomy, sharpened",
          body: "Lesson 3 said dependent columns give none or infinitely many. Now the *infinitely many* is pinned down: it is $\\mathbf{x}_p$ plus a nontrivial $\\operatorname{Null}(A)$. Independent columns are exactly the trivial-null-space case — one solution whenever $\\mathbf{b}$ is reachable.",
        },
      ],
    },
  ],
  sections: [
    {
      id: "infinite-shape",
      title: "What shape is \u201cinfinitely many\u201d?",
      body: "In Lesson 3 the dependent system $x + 2y = 3,\\ 2x + 4y = 6$ had *infinitely many* solutions — a whole line of them. But a line is not a shapeless pile: it has a direction and a location. Where do that direction and that location come from? The answer turns out to be a single, reusable structure, and the key that unlocks it is almost too simple: take two solutions and **subtract them**.",
      equation:
        "\\begin{cases} x + 2y = 3 \\\\ 2x + 4y = 6 \\end{cases} \\;\\longrightarrow\\; (3, 0),\\ (1, 1),\\ (5, -1),\\ \\ldots",
      observation:
        "The solutions are not random points — they line up. This lesson explains why, and turns the pattern into a formula.",
    },
    {
      id: "difference-engine",
      title: "Subtract two solutions",
      body: "Suppose $\\mathbf{x}_1$ and $\\mathbf{x}_2$ both solve $A\\mathbf{x} = \\mathbf{b}$. Then $A\\mathbf{x}_1 = \\mathbf{b}$ and $A\\mathbf{x}_2 = \\mathbf{b}$, so by linearity $A(\\mathbf{x}_1 - \\mathbf{x}_2) = \\mathbf{b} - \\mathbf{b} = \\mathbf{0}$. The difference of two solutions is a solution of the **homogeneous** system. For our example, $(3,0) - (1,1) = (2,-1)$, and indeed $A(2,-1) = 2(1,2) - (2,4) = (0,0)$. Run it backwards: if $\\mathbf{x}_h$ solves $A\\mathbf{x} = \\mathbf{0}$, then $\\mathbf{x}_p + \\mathbf{x}_h$ solves $A\\mathbf{x} = \\mathbf{b}$ — so you can *make* new solutions by adding null vectors to one you already have.",
      equation:
        "A\\mathbf{x}_1 = A\\mathbf{x}_2 = \\mathbf{b} \\;\\Rightarrow\\; A(\\mathbf{x}_1 - \\mathbf{x}_2) = \\mathbf{0}",
      observation:
        "Two solutions manufacture a homogeneous solution; one solution plus homogeneous solutions manufacture more. That two-way street is the whole lesson.",
      layers: [
        {
          kind: "trap",
          title: "One difference is a direction, not the whole set",
          body: "Two solutions give you *one* null direction, hence at least a line of solutions. That line is the entire set only when $\\operatorname{Null}(A)$ is one-dimensional. If $A = \\mathbf{0}$ in the plane, two solutions still give just one direction, but the solution set is the *whole plane* — you would need a second independent null direction to see it.",
        },
      ],
    },
    {
      id: "translate",
      title: "The null space, carried off the origin",
      body: "Putting the two moves together: every solution is $\\mathbf{x}_p$ plus some homogeneous solution, and every such sum is a solution. So the solution set is exactly $\\mathbf{x}_p + \\operatorname{Null}(A)$ — the null space **translated** to pass through $\\mathbf{x}_p$ instead of the origin. Because $\\operatorname{Null}(A)$ is a subspace through the origin, the solution set is a parallel copy of it, shifted. It is an **affine** set: it has the same direction(s) and dimension as $\\operatorname{Null}(A)$, but it does not pass through the origin unless $\\mathbf{b} = \\mathbf{0}$.",
      equation:
        "\\operatorname{Sol}(A, \\mathbf{b}) = \\mathbf{x}_p + \\operatorname{Null}(A)",
      observation:
        "Same shape, shifted anchor. The homogeneous system draws the shape at the origin; the particular solution says where to slide it.",
      layers: [
        {
          kind: "trap",
          title: "Affine, not a subspace",
          body: "A shifted line through $(3,0)$ is *not* a subspace: it does not contain $\\mathbf{0}$, and doubling a solution need not give a solution. Only the homogeneous set $\\operatorname{Null}(A)$ is a subspace. The solution set is a subspace exactly when $\\mathbf{b} = \\mathbf{0}$, i.e. when the two coincide.",
        },
      ],
    },
    {
      id: "free-variables",
      title: "Free variables are directions to move",
      body: "How big is $\\operatorname{Null}(A)$? Solve $A\\mathbf{x} = \\mathbf{0}$ by elimination (Lesson 4): the variables that are *not* pinned down are the **free variables**. Setting one free variable to $1$ and the rest to $0$ produces one basis vector of $\\operatorname{Null}(A)$; each free variable is an independent direction you can move without leaving the solution set. So the number of free variables **is** the dimension of the null space — and therefore the dimension of the whole solution set. One free variable gives a line; two give a plane; none gives a single point.",
      equation:
        "\\operatorname{Sol}(A, \\mathbf{b}) = \\{\\mathbf{x}_p + t_1\\mathbf{v}_1 + \\cdots + t_k\\mathbf{v}_k : t_i \\in \\mathbb{R}\\}, \\quad k = \\#\\text{free variables}",
      observation:
        "Free variables are not bookkeeping leftovers — they are the sliders that trace out the solution set.",
      layers: [
        {
          kind: "looking-ahead",
          title: "This becomes rank–nullity",
          body: "The count $k = \\#\\text{free variables} = \\dim\\operatorname{Null}(A)$ pairs with the number of pivots (the rank) to make $\\operatorname{rank}(A) + \\dim\\operatorname{Null}(A) = n$ — the rank–nullity theorem, met head-on in a later lesson.",
        },
      ],
    },
  ],
  guidedSceneId: "solution-sets",
  explorationId: "solution-sets",
  workedExamples: [
    {
      id: "wex-decomposition",
      title: "From two solutions to the whole set",
      prompt:
        "The system $x + 2y = 3,\\ 2x + 4y = 6$ has $\\mathbf{x}_1 = (3, 0)$ and $\\mathbf{x}_2 = (1, 1)$ as solutions. Find a third without solving, then describe the entire solution set.",
      exampleId: "systems-default",
      equations: [
        "A = \\begin{bmatrix} 1 & 2 \\\\ 2 & 4 \\end{bmatrix}, \\quad \\mathbf{b} = \\begin{bmatrix} 3 \\\\ 6 \\end{bmatrix}",
        "\\mathbf{x}_1 - \\mathbf{x}_2 = (3, 0) - (1, 1) = (2, -1)",
        "A(2, -1) = 2\\begin{bmatrix} 1 \\\\ 2 \\end{bmatrix} - \\begin{bmatrix} 2 \\\\ 4 \\end{bmatrix} = \\begin{bmatrix} 0 \\\\ 0 \\end{bmatrix} \\;\\Rightarrow\\; (2,-1) \\in \\operatorname{Null}(A)",
        "\\mathbf{x}_3 = \\mathbf{x}_1 + (2, -1) = (5, -1), \\quad A(5,-1) = (3, 6) = \\mathbf{b} \\;\\checkmark",
        "\\operatorname{Null}(A) = \\{t\\,(2, -1) : t \\in \\mathbb{R}\\}",
        "\\operatorname{Sol}(A, \\mathbf{b}) = (3, 0) + \\{t\\,(2, -1)\\} = \\{(3 + 2t,\\ -t) : t \\in \\mathbb{R}\\}",
      ],
      equationsAriaLabel:
        "Subtracting the two solutions gives (2, -1), which A sends to zero, so it is a null vector; adding it to (3,0) gives the third solution (5,-1); the null space is all multiples of (2,-1) and the solution set is (3,0) plus that line.",
      layers: [
        {
          kind: "connection",
          title: "You are re-reading Lesson 3's infinite case",
          body: "This is the same dependent system whose recipe-sweep you watched in Lesson 3. The parameter $t$ there and the free variable here are the same slider: moving along the null direction $(2, -1)$.",
        },
      ],
    },
    {
      id: "wex-existence-multiplicity",
      title: "Existence and multiplicity are separate questions",
      prompt:
        "Compare three right-hand sides for the same columns and decide the outcome from (is $\\mathbf{b}$ reachable?) and (is $\\operatorname{Null}(A)$ trivial?).",
      equations: [
        "\\text{Independent } A = \\begin{bmatrix} 1 & 3 \\\\ 2 & -1 \\end{bmatrix}: \\operatorname{Null}(A) = \\{\\mathbf{0}\\} \\;\\Rightarrow\\; \\text{one solution for every reachable } \\mathbf{b}",
        "\\text{Dependent, } \\mathbf{b} = (3, 6) \\text{ (reachable)}: \\operatorname{Sol} = (3,0) + \\{t(2,-1)\\} \\;\\text{— infinitely many}",
        "\\text{Dependent, } \\mathbf{b} = (3, 5) \\text{ (off the column line)}: \\text{no } \\mathbf{x}_p \\;\\Rightarrow\\; \\operatorname{Sol} = \\varnothing",
        "\\text{reachable?} \\times \\text{trivial null space?} \\;\\longrightarrow\\; \\varnothing,\\ \\text{a point},\\ \\text{or a positive-dimensional affine set}",
      ],
      equationsAriaLabel:
        "With independent columns the null space is trivial so there is one solution for every reachable b; with dependent columns and a reachable b there are infinitely many; with dependent columns and an unreachable b there is none. Reachability and triviality of the null space are independent questions.",
      layers: [
        {
          kind: "trap",
          title: "Trivial null space does not mean every $\\mathbf{b}$ works",
          body: "The independent case gives *at most one* solution for every $\\mathbf{b}$. Whether a given $\\mathbf{b}$ has *one* rather than *none* is the separate reachability (column-space) question from Lesson 3.",
        },
      ],
    },
  ],
  callouts: [
    {
      id: "infinity-has-shape",
      title: "\u201cInfinitely many solutions is a shapeless list\u201d",
      belief:
        "If a system has infinitely many solutions, they feel like an unstructured cloud you can only enumerate.",
      confront:
        "But the solutions $(3,0), (1,1), (5,-1), \\ldots$ all lie on one line, and any two of them differ by a multiple of $(2,-1)$.",
      resolve:
        "\u201cInfinitely many\u201d is a *translate of a subspace*: $\\mathbf{x}_p + \\operatorname{Null}(A)$. It has a definite direction (the null space) and a definite location (any particular solution).",
    },
    {
      id: "one-difference-not-whole-set",
      title: "\u201cOne difference of two solutions gives the whole set\u201d",
      belief:
        "Once I have a null direction from two solutions, I have described every solution.",
      confront:
        "For $A = \\mathbf{0}$ in the plane, $(1,0)$ and $(0,1)$ both solve $A\\mathbf{x} = \\mathbf{0}$; their difference $(1,-1)$ is one direction — but the solution set is the *entire plane*, not that single line.",
      resolve:
        "Two solutions establish non-uniqueness and *at least* an affine line. The full shape needs *all* of $\\operatorname{Null}(A)$ — a basis of it, i.e. every free-variable direction.",
    },
    {
      id: "trivial-null-not-reachable",
      title: "\u201cTrivial null space means every $\\mathbf{b}$ is solvable\u201d",
      belief:
        "If $\\operatorname{Null}(A) = \\{\\mathbf{0}\\}$, surely $A\\mathbf{x} = \\mathbf{b}$ can be solved for any $\\mathbf{b}$.",
      confront:
        "A trivial null space only rules out *extra* solutions. A non-square or rank-deficient-range map can have $\\operatorname{Null}(A) = \\{\\mathbf{0}\\}$ yet miss many targets $\\mathbf{b}$ entirely.",
      resolve:
        "Trivial null space $\\Rightarrow$ *at most one* solution per $\\mathbf{b}$ (uniqueness). Whether a given $\\mathbf{b}$ is reachable at all is the separate column-space question. Existence and multiplicity are independent.",
    },
  ],
  checkpoint: {
    prompt:
      "You know $(3, 0)$ and $(1, 1)$ both solve the system. Without solving again, give a third solution and describe the whole solution set.",
    answer:
      "Their difference $(3,0) - (1,1) = (2,-1)$ is a null vector, so $(3,0) + (2,-1) = (5,-1)$ is also a solution. The whole set is $(3,0) + \\{t\\,(2,-1)\\}$ — the null line slid to pass through a solution. (This 1-D shape is the full set because $\\operatorname{Null}(A)$ here is one-dimensional; a bigger null space would need more directions.)",
  },
  exercises: [
    {
      id: "sol-difference-homogeneous",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "$\\mathbf{x}_1$ and $\\mathbf{x}_2$ both solve $A\\mathbf{x} = \\mathbf{b}$. What is $A(\\mathbf{x}_1 - \\mathbf{x}_2)$?",
      choices: [
        "$\\mathbf{b}$",
        "$2\\mathbf{b}$",
        "$\\mathbf{0}$",
        "It depends on $\\mathbf{x}_1$ and $\\mathbf{x}_2$",
      ],
      correctChoice: 2,
      explanation:
        "$A(\\mathbf{x}_1 - \\mathbf{x}_2) = A\\mathbf{x}_1 - A\\mathbf{x}_2 = \\mathbf{b} - \\mathbf{b} = \\mathbf{0}$. The difference of two solutions is always a solution of the homogeneous system — it lies in $\\operatorname{Null}(A)$.",
    },
    {
      id: "sol-generate-third",
      type: "vector",
      tier: "drill",
      prompt:
        "For $x + 2y = 3,\\ 2x + 4y = 6$ you know $(3, 0)$ is a solution and $(2, -1) \\in \\operatorname{Null}(A)$. Add that null vector to $(3, 0)$ and enter the resulting solution.",
      expected: [5, -1],
      tolerance: 0.01,
      explanation:
        "Add the null vector to the known solution: $(3, 0) + (2, -1) = (5, -1)$, and $A(5,-1) = (3,6) = \\mathbf{b}$. Every $(3 + 2t,\\ -t)$ is a solution too — e.g. $t = -1$ gives $(1, 1)$ — but this step asks for the $t = 1$ result, $(5, -1)$.",
    },
    {
      // Package B — fresh-instance production (E3): a DIFFERENT dependent system,
      // so the learner must apply "add a null vector", not recall (5, -1).
      id: "sol-generate-third-fresh",
      type: "vector",
      tier: "drill",
      prompt:
        "A different system: $x + 3y = 4,\\ 2x + 6y = 8$ has the solution $(4, 0)$, and $(3, -1) \\in \\operatorname{Null}(A)$. Add that null vector to $(4, 0)$ and enter the resulting solution.",
      expected: [EX2.thirdSolution[0], EX2.thirdSolution[1]],
      tolerance: 0.01,
      explanation:
        "Add the null vector to the known solution: $(4, 0) + (3, -1) = (7, -1)$, and $A(7, -1) = (4, 8) = \\mathbf{b}$. Every $(4 + 3t,\\ -t)$ is a solution; this is the $t = 1$ result.",
    },
    {
      // Learner-PRODUCED complete parametric solution set (E3) on a fresh system.
      // The reviewer flagged the earlier version for (a) handing over one coordinate
      // of each object and (b) DISPLAYING the parametric formula before the point was
      // committed. This version captures every component the learner produces — the
      // complete particular vector (both coords, verified against the second
      // equation), the complete null direction (both coords, verified as a null
      // vector), and the complete instantiated point (both coords) — WITHOUT showing
      // the answer formula before commitment.
      id: "sol-produce-parametric-fresh",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt:
        "Build the entire solution set of the fresh system $x + 3y = 4,\\ 2x + 6y = 8$ yourself (its columns are dependent). You will produce the particular solution, the null direction, and a point on the set — every coordinate, no formula handed to you.",
      config: {
        steps: [
          {
            kind: "numeric",
            prompt:
              "Particular solution: take $y = 0$ in $x + 3y = 4$ and enter $x$.",
            expected: EX2.particular[0],
            explanation:
              "With $y = 0$, $x = 4$: the $x$-coordinate of $\\mathbf{x}_p$.",
          },
          {
            kind: "numeric",
            prompt:
              "Verify your complete $\\mathbf{x}_p = (4, 0)$ against the OTHER equation: compute $2x + 6y$ for it.",
            expected: EX2.bInfinite[1],
            explanation:
              "$2(4) + 6(0) = 8 = \\mathbf{b}_2$, so $\\mathbf{x}_p = (4, 0)$ really solves both equations.",
          },
          {
            kind: "numeric",
            prompt:
              "Null direction: solve the homogeneous $x + 3y = 0$ with $y = -1$ and enter $x$.",
            expected: EX2.nullDirection[0],
            explanation: "$x = -3y = 3$: the $x$-coordinate of the null direction.",
          },
          {
            kind: "numeric",
            prompt:
              "Verify your complete $\\mathbf{v} = (3, -1)$ is a null vector: compute $2x + 6y$ for it.",
            expected: 0,
            explanation:
              "$2(3) + 6(-1) = 0$, so $\\mathbf{v} = (3, -1) \\in \\operatorname{Null}(A)$ (and $x + 3y = 0$ too).",
          },
          {
            kind: "numeric",
            prompt:
              "Instantiate at $t = 2$ using YOUR $\\mathbf{x}_p = (4, 0)$ and $\\mathbf{v} = (3, -1)$: enter the $x$-coordinate of $\\mathbf{x}_p + 2\\mathbf{v}$.",
            expected: EX2.particular[0] + 2 * EX2.nullDirection[0],
            explanation: "$(4, 0) + 2(3, -1)$ has $x = 4 + 6 = 10$.",
          },
          {
            kind: "numeric",
            prompt: "…and its $y$-coordinate.",
            expected: EX2.particular[1] + 2 * EX2.nullDirection[1],
            explanation:
              "$y = 0 + 2(-1) = -2$, so the point is $(10, -2)$. You have produced the whole set $\\{\\mathbf{x}_p + t\\,\\mathbf{v}\\} = \\{(4 + 3t,\\ -t) : t \\in \\mathbb{R}\\}$ — the null line $\\{t(3,-1)\\}$ slid to pass through $(4, 0)$. It is affine (it misses the origin), and a whole line, not two points.",
          },
        ],
      },
    },
    {
      id: "sol-nullity-caveat",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "For $A = \\mathbf{0}$ in the plane you find two solutions of $A\\mathbf{x} = \\mathbf{0}$ and take their difference. What can you conclude about the solution set from that one difference?",
      choices: [
        "It is exactly the line through that difference vector",
        "It is at least a line, but pinning the full shape needs all of $\\operatorname{Null}(A)$",
        "It is a single point",
        "It is empty",
      ],
      correctChoice: 1,
      explanation:
        "One difference gives one direction, hence at least a line of solutions. But $A = \\mathbf{0}$ has $\\operatorname{Null}(A) = \\mathbb{R}^2$ (the whole plane, dimension 2), so a single direction undercounts the set. You need a basis of $\\operatorname{Null}(A)$ — every free-variable direction — to state the full shape.",
    },
    {
      // In-lesson E4 distinction (produced construction). The lesson only ever WORKED
      // nullity-1 lines; here the learner transfers the one-direction-vs-whole-null-
      // space distinction to the unfamiliar nullity-2 operator A = 0 by CONSTRUCTING
      // a null vector off the line the single difference produced — proving that one
      // difference undercounts. Graded by the shared `vector-off-line` predicate.
      id: "sol-construct-second-null-direction",
      type: "custom",
      capabilityId: CONSTRUCT_IN_EXPLORER_ID,
      tier: "transfer",
      prompt:
        "Transfer it. Let $A = \\mathbf{0}$ (the $2\\times 2$ zero matrix), so every vector solves $A\\mathbf{x} = \\mathbf{0}$. The solutions $(1, 0)$ and $(0, 0)$ differ by $(1, 0)$, giving only the line $\\{t\\,(1, 0)\\}$ (the $x$-axis). Commit a null vector that shows the solution set is bigger than that line — a null vector **off** the $x$-axis.",
      config: {
        target: "vector2",
        check: {
          kind: "vector-off-line",
          spanning: [1, 0],
        },
        reveal:
          "Any nonzero vector with a nonzero $y$-component — e.g. $(0, 1)$ or $(1, 1)$ — is a solution of $A\\mathbf{x} = \\mathbf{0}$ (every vector is, since $A = \\mathbf{0}$) yet lies off the $x$-axis. So $\\operatorname{Null}(A) = \\mathbb{R}^2$ is two-dimensional: the single difference $(1, 0)$ captured only a line, and you need a *second* independent direction (one per free variable) to describe the whole set.",
        hint:
          "You need a nonzero vector that is not a multiple of $(1, 0)$ — i.e. its $y$-component must be nonzero.",
      },
    },
    {
      id: "sol-existence-vs-multiplicity",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "$\\operatorname{Null}(A) = \\{\\mathbf{0}\\}$. Which statement is correct?",
      choices: [
        "$A\\mathbf{x} = \\mathbf{b}$ has exactly one solution for every $\\mathbf{b}$",
        "$A\\mathbf{x} = \\mathbf{b}$ has at most one solution for every $\\mathbf{b}$, but some $\\mathbf{b}$ may be unreachable",
        "$A\\mathbf{x} = \\mathbf{b}$ has infinitely many solutions",
        "$\\mathbf{b} = \\mathbf{0}$ is the only solvable case",
      ],
      correctChoice: 1,
      explanation:
        "A trivial null space forbids two distinct solutions, so there is *at most one* for every $\\mathbf{b}$ (uniqueness). It does not force existence: reachability is the separate column-space question. \u201cExactly one for every $\\mathbf{b}$\u201d additionally requires the columns to span the space.",
    },
    {
      // Replaces the committed-MC inconsistency refusal (E1) with PRODUCED evidence:
      // the learner eliminates a fresh inconsistent dependent system, produces the
      // contradiction row's right-hand side and the solution count (0). Producing the
      // $0 = c$ witness is the demonstration that the set is empty.
      id: "sol-refuse-inconsistent-fresh",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt:
        "A fresh dependent system: $\\begin{cases} x + 2y = 5 \\\\ 3x + 6y = 20 \\end{cases}$. Decide its solution set by producing the evidence.",
      config: {
        steps: [
          {
            kind: "numeric",
            prompt:
              "Eliminate with $R_2 \\to R_2 - 3\\,R_1$. The coefficients collapse to $(0, 0)$; what is the resulting right-hand side of $R_2$?",
            expected: 5,
            explanation:
              "$20 - 3\\cdot 5 = 5$, so $R_2$ becomes $0 = 5$ — the columns $(1,3),(2,6)$ are dependent and $\\mathbf{b}$ is off their line.",
          },
          {
            kind: "numeric",
            prompt:
              "The eliminated row reads $0 = 5$. How many solutions does the system have? (Enter the count; use $0$ for none.)",
            expected: 0,
            explanation:
              "$0 = 5$ is impossible, so no $(x, y)$ works: the solution set is empty, $\\varnothing$. This is why you must *refuse* the decomposition — see the next item.",
          },
        ],
      },
    },
    {
      // The produced-reasoning half of the refusal: WHY you cannot write
      // x_p + Null(A) for an inconsistent system. Unscored E6 surface (scoring → F).
      id: "sol-justify-inconsistent-refusal",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt:
        "Explain in your own words: for that inconsistent system, why is the solution set $\\varnothing$ and NOT $\\operatorname{Null}(A)$ — i.e. why can't you write $\\mathbf{x}_p + \\operatorname{Null}(A)$? Write your reasoning, then compare with the model answer.",
      config: {
        modelAnswer:
          "The decomposition $\\mathbf{x}_p + \\operatorname{Null}(A)$ *presupposes* a particular solution $\\mathbf{x}_p$ to anchor the translate. Here $\\mathbf{b} = (5, 20)$ is off the column space (the line $\\{s(1,2)^{\\!\\top}\\}$ spanned by the dependent columns), so no $\\mathbf{x}_p$ exists — the elimination row $0 = 5$ is exactly that obstruction. With nothing to shift the null space onto, the set is empty, $\\varnothing$. It is **not** $\\operatorname{Null}(A)$: writing $\\operatorname{Null}(A)$ would claim $\\mathbf{0}$ solves the system, but $A\\mathbf{0} = \\mathbf{0} \\ne \\mathbf{b}$. So consistency must be checked *before* applying the structure formula.",
        rubric:
          "A strong answer says the structure formula needs an $\\mathbf{x}_p$ (consistency), notes $\\mathbf{b}$ off the column space means none exists (the $0 = c$ row), concludes $\\varnothing$, and rejects $\\operatorname{Null}(A)$ because $A\\mathbf{0} = \\mathbf{0} \\ne \\mathbf{b}$.",
      },
    },
    {
      id: "sol-free-variables-dimension",
      type: "multiple-choice",
      tier: "drill",
      prompt:
        "Solving $A\\mathbf{x} = \\mathbf{0}$ by elimination leaves exactly one free variable. What is the solution set of a *consistent* $A\\mathbf{x} = \\mathbf{b}$ for that $A$?",
      choices: [
        "A single point",
        "An affine line (dimension 1)",
        "A plane (dimension 2)",
        "Empty",
      ],
      correctChoice: 1,
      explanation:
        "One free variable means $\\dim\\operatorname{Null}(A) = 1$: the null space is a line. A consistent system's set is that line translated by $\\mathbf{x}_p$ — an affine line. The number of free variables is the dimension of the solution set.",
    },
    {
      // Fresh free-variable / dimension PRODUCTION (E3): the learner eliminates a
      // different dependent system and produces the free-variable count and the
      // solution-set dimension, rather than recognizing them.
      id: "sol-freevars-dimension-fresh",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "A different homogeneous system: $\\begin{cases} 3x + y = 0 \\\\ 6x + 2y = 0 \\end{cases}$.",
      config: {
        steps: [
          {
            kind: "numeric",
            prompt:
              "Eliminate with $R_2 \\to R_2 - 2\\,R_1$, then count: how many free variables remain?",
            expected: 1,
            explanation:
              "$R_2$ becomes $(6,2) - 2(3,1) = (0,0)$: one pivot (in $x$), so $y$ is free — one free variable.",
          },
          {
            kind: "numeric",
            prompt:
              "So what is the dimension of the solution set of any *consistent* $A\\mathbf{x} = \\mathbf{b}$ with this same $A$?",
            expected: 1,
            explanation:
              "$\\dim\\operatorname{Null}(A) = \\#\\text{free variables} = 1$, and the solution set is a translate of $\\operatorname{Null}(A)$, so it has the same dimension: an affine line.",
          },
        ],
      },
    },
    {
      // Genuine reasoning evidence (produced, not chosen) for the existence-vs-
      // multiplicity distinction. Unscored E6 surface (self-mark is not credit).
      id: "sol-justify-existence-multiplicity",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt:
        "Explain in your own words: why does $\\operatorname{Null}(A) = \\{\\mathbf{0}\\}$ guarantee *uniqueness* (at most one solution per $\\mathbf{b}$) but **not** *existence* (that every $\\mathbf{b}$ is reachable)? Write your reasoning, then compare with the model answer.",
      config: {
        modelAnswer:
          "Uniqueness: if $A\\mathbf{x}_1 = A\\mathbf{x}_2 = \\mathbf{b}$ then $A(\\mathbf{x}_1 - \\mathbf{x}_2) = \\mathbf{0}$, so $\\mathbf{x}_1 - \\mathbf{x}_2 \\in \\operatorname{Null}(A) = \\{\\mathbf{0}\\}$, forcing $\\mathbf{x}_1 = \\mathbf{x}_2$. So there is at most one solution for every $\\mathbf{b}$ — this is a statement about *multiplicity*. Existence is separate: whether a given $\\mathbf{b}$ has *any* solution asks if $\\mathbf{b}$ lies in the column space (is $\\mathbf{b}$ a combination of the columns?). The null space says nothing about that. Example: a tall map with independent columns has $\\operatorname{Null}(A) = \\{\\mathbf{0}\\}$ yet misses most targets $\\mathbf{b}$. 'Exactly one for every $\\mathbf{b}$' needs *both* a trivial null space (uniqueness) and columns that span (existence).",
        rubric:
          "A strong answer derives uniqueness from a trivial null space via the difference of two solutions, and separately identifies existence as the column-space/reachability question that the null space does not control.",
      },
    },
    {
      // Genuine reasoning evidence (produced) for the one-direction-vs-whole-null-
      // space distinction. Unscored E6 surface.
      id: "sol-justify-one-direction",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt:
        "Explain in your own words: two solutions give you one null direction, so at least a line of solutions. Why is that line **not always the whole** solution set? Write your reasoning, then compare with the model answer.",
      config: {
        modelAnswer:
          "Subtracting two solutions yields one nonzero vector $\\mathbf{v} \\in \\operatorname{Null}(A)$, so $\\mathbf{x}_p + t\\,\\mathbf{v}$ are all solutions — at least an affine line. But the full solution set is $\\mathbf{x}_p + \\operatorname{Null}(A)$, and $\\operatorname{Null}(A)$ can have dimension greater than $1$. A single vector $\\mathbf{v}$ only spans a line inside it, so it captures the whole set exactly when $\\dim\\operatorname{Null}(A) = 1$. Counterexample: $A = \\mathbf{0}$ in the plane has $\\operatorname{Null}(A) = \\mathbb{R}^2$; two solutions still give just one direction, yet the solution set is the entire plane. To describe the full set you need a *basis* of $\\operatorname{Null}(A)$ — one independent direction per free variable.",
        rubric:
          "A strong answer distinguishes 'one difference = one direction = at least a line' from 'the whole set = $\\mathbf{x}_p + \\operatorname{Null}(A)$', notes the line is the whole set only when nullity is $1$, and gives a nullity-$2$ counterexample (e.g. $A = \\mathbf{0}$).",
      },
    },
    {
      // Package E — proof-construction surface (E6). Self-check captures the
      // learner's written proof + shows a model answer and rubric; full proof
      // credit is awarded by human scoring in the module assessment.
      id: "sol-prove-null-subspace",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt:
        "Prove it: show that $\\operatorname{Null}(A)$ is a subspace — it contains $\\mathbf{0}$, and it is closed under addition and scalar multiplication. Write your proof, then compare with the model answer.",
      config: {
        modelAnswer:
          "Contains $\\mathbf{0}$: $A\\mathbf{0} = \\mathbf{0}$, so $\\mathbf{0} \\in \\operatorname{Null}(A)$. Closed under addition: if $\\mathbf{u}, \\mathbf{v} \\in \\operatorname{Null}(A)$ then $A\\mathbf{u} = \\mathbf{0}$ and $A\\mathbf{v} = \\mathbf{0}$, so by linearity $A(\\mathbf{u} + \\mathbf{v}) = A\\mathbf{u} + A\\mathbf{v} = \\mathbf{0} + \\mathbf{0} = \\mathbf{0}$, hence $\\mathbf{u} + \\mathbf{v} \\in \\operatorname{Null}(A)$. Closed under scaling: for any scalar $c$, $A(c\\,\\mathbf{u}) = c\\,A\\mathbf{u} = c\\,\\mathbf{0} = \\mathbf{0}$, so $c\\,\\mathbf{u} \\in \\operatorname{Null}(A)$. All three closure conditions hold, so $\\operatorname{Null}(A)$ is a subspace.",
        rubric:
          "A strong answer checks all three conditions (contains $\\mathbf{0}$, closed under $+$, closed under scaling) and derives each from linearity of $A$ ($A(\\mathbf{u}+\\mathbf{v}) = A\\mathbf{u}+A\\mathbf{v}$, $A(c\\mathbf{u}) = cA\\mathbf{u}$).",
      },
    },
    {
      // Package E — the headline structure theorem, both inclusions.
      id: "sol-prove-structure",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt:
        "Prove it: for a **consistent** system with a particular solution $\\mathbf{x}_p$, show that its solution set equals $\\mathbf{x}_p + \\operatorname{Null}(A)$. Prove both inclusions.",
      config: {
        modelAnswer:
          "($\\supseteq$) Let $\\mathbf{x}_h \\in \\operatorname{Null}(A)$. Then $A(\\mathbf{x}_p + \\mathbf{x}_h) = A\\mathbf{x}_p + A\\mathbf{x}_h = \\mathbf{b} + \\mathbf{0} = \\mathbf{b}$, so $\\mathbf{x}_p + \\mathbf{x}_h$ is a solution: every element of $\\mathbf{x}_p + \\operatorname{Null}(A)$ solves the system. ($\\subseteq$) Let $\\mathbf{x}$ be any solution, so $A\\mathbf{x} = \\mathbf{b}$. Then $A(\\mathbf{x} - \\mathbf{x}_p) = A\\mathbf{x} - A\\mathbf{x}_p = \\mathbf{b} - \\mathbf{b} = \\mathbf{0}$, so $\\mathbf{x} - \\mathbf{x}_p \\in \\operatorname{Null}(A)$, i.e. $\\mathbf{x} = \\mathbf{x}_p + \\mathbf{x}_h$ for some $\\mathbf{x}_h \\in \\operatorname{Null}(A)$. Each set contains the other, so they are equal. (This needs a particular solution to exist, which is exactly consistency.)",
        rubric:
          "A strong answer proves both inclusions: any $\\mathbf{x}_p + \\mathbf{x}_h$ solves the system, and any solution minus $\\mathbf{x}_p$ lies in $\\operatorname{Null}(A)$. It should note the argument depends on consistency (an $\\mathbf{x}_p$ existing).",
      },
    },
  ],
  keyTakeaway:
    "Subtract two solutions of a consistent system and you always land in $\\operatorname{Null}(A)$; add null vectors to one solution and you generate them all. So the solution set is $\\mathbf{x}_p + \\operatorname{Null}(A)$ — the null space carried off the origin — and it is empty when no solution exists. Two solutions establish at least an affine line; the full shape (its dimension = the number of free variables) needs all of $\\operatorname{Null}(A)$. A trivial null space means uniqueness, not reachability.",
  structuredSummary: {
    coreMentalModel:
      "The solution set is the null space slid off the origin to pass through one particular solution.",
    definitionsIntroduced: [
      "Homogeneous system $A\\mathbf{x} = \\mathbf{0}$ and null space $\\operatorname{Null}(A)$",
      "Affine set vs subspace; free variable as a null direction",
    ],
    mainResult:
      "$\\operatorname{Sol}(A, \\mathbf{b}) = \\mathbf{x}_p + \\operatorname{Null}(A)$ when consistent; $\\varnothing$ otherwise.",
    representationsConnected:
      "Difference/addition of solutions (operation) ↔ two parallel sets (picture) ↔ $\\mathbf{x}_p + t\\mathbf{v}$ (symbol).",
    commonMistake:
      "Reading the solution set as a subspace, or as fully determined by a single difference when the null space is bigger than a line.",
    canonicalExample:
      "$x + 2y = 3,\\ 2x + 4y = 6$: $\\mathbf{x}_p = (3,0)$, null direction $(2,-1)$, set $\\{(3+2t, -t)\\}$.",
    oneProblemWorthRemembering:
      "Given two solutions, produce a third without solving and state the whole set.",
    whatThisUnlocksNext:
      "Column space vs null space, and rank–nullity: #free variables $= \\dim\\operatorname{Null}(A)$.",
  },
};
