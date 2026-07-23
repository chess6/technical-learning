import type { LessonDefinition } from "./types";

/**
 * Lesson: "Solution Sets & Homogeneous Systems".
 *
 * Stage 3 of the Insight Discovery Gate for this topic. Built on the PASS
 * contract `docs/insights/solution-sets.md` and the plan
 * `docs/lesson-plan-solution-sets.md`.
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
      id: "sol-whole-set",
      type: "prediction",
      tier: "transfer",
      prompt:
        "Describe the *entire* solution set of $x + 2y = 3,\\ 2x + 4y = 6$, and say where its direction and its location come from.",
      reveal:
        "$\\operatorname{Sol}(A, \\mathbf{b}) = (3, 0) + \\{t\\,(2, -1) : t \\in \\mathbb{R}\\} = \\{(3 + 2t,\\ -t)\\}$. The **direction** $(2, -1)$ is a basis of $\\operatorname{Null}(A)$ (from the homogeneous system); the **location** is any particular solution, e.g. $(3, 0)$. So the set is the null line carried off the origin to pass through $(3,0)$ — affine, not through the origin.",
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
      id: "sol-inconsistent-empty",
      type: "prediction",
      tier: "transfer",
      prompt:
        "Keep the dependent columns $(1,2),(2,4)$ but take $\\mathbf{b} = (3, 5)$, off their line. What is the solution set, and why can't you write $\\mathbf{x}_p + \\operatorname{Null}(A)$?",
      reveal:
        "The set is empty, $\\varnothing$. $\\mathbf{b} = (3,5)$ is not in the column space, so there is no particular solution $\\mathbf{x}_p$. The decomposition $\\mathbf{x}_p + \\operatorname{Null}(A)$ needs an anchor to translate the null space to; with no $\\mathbf{x}_p$ there is nothing to shift, and $\\operatorname{Null}(A)$ itself is *not* the answer (that would claim $\\mathbf{0}$ solves it, but $A\\mathbf{0} = \\mathbf{0} \\ne \\mathbf{b}$).",
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
