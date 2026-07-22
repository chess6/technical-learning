import type { LessonDefinition } from "./types";
import { LINEAR_COMBINATION_EXAMPLE as EX } from "./exampleData";

export const vectorsLesson: LessonDefinition = {
  // Composed, not templated: the `check` block appears twice with different
  // content — an early span/independence check before the basis machinery, and
  // the default coordinates check after it — and the formal statements lead the
  // basis section rather than trailing it.
  route: [
    { kind: "motivate" },
    { kind: "visual" },
    { kind: "section", sectionId: "vectors" },
    { kind: "section", sectionId: "combinations" },
    { kind: "check", checkpointId: "span-reachability" },
    // Develop the theorem formally BEFORE the section that explains coordinates
    // in full, so the definition/theorem lead rather than trail the intuition.
    { kind: "formal", formalId: "def-basis" },
    { kind: "formal", formalId: "thm-unique-representation" },
    { kind: "section", sectionId: "basis" },
    { kind: "check" },
    { kind: "worked" },
    { kind: "explore" },
    { kind: "practice" },
    { kind: "summary" },
  ],
  formalBlocks: [
    {
      id: "def-basis",
      kind: "definition",
      label: "Basis of the plane",
      statement:
        "An ordered pair $B = (\\mathbf{v}, \\mathbf{w})$ is a *basis* of $\\mathbb{R}^2$ when the two vectors are independent (neither is a scalar multiple of the other) and together they span the plane.",
      interpretation:
        "A basis is a minimal coordinate language for the plane: two directions that are genuinely different, and between them can reach everywhere.",
      visibility: "visible",
    },
    {
      id: "thm-unique-representation",
      kind: "theorem",
      label: "Basis ⇔ unique representation",
      statement:
        "An ordered pair $B = (\\mathbf{v}, \\mathbf{w})$ is a basis of $\\mathbb{R}^2$ **if and only if** every vector $\\mathbf{x} \\in \\mathbb{R}^2$ has **one and only one** representation $\\mathbf{x} = a\\mathbf{v} + b\\mathbf{w}$.",
      interpretation:
        "Span gives *existence* — you can always name the point. Independence gives *uniqueness* — there is only one name. Together they are exactly what makes $(a, b)$ well-defined coordinates.",
      visibility: "revealed",
      layers: [
        {
          kind: "math-note",
          title: "Why both directions hold",
          body: "*Existence:* spanning means every $\\mathbf{x}$ is *some* $a\\mathbf{v} + b\\mathbf{w}$. *Uniqueness:* if $a\\mathbf{v} + b\\mathbf{w} = a'\\mathbf{v} + b'\\mathbf{w}$ then $(a-a')\\mathbf{v} + (b-b')\\mathbf{w} = \\mathbf{0}$, and independence forces $a = a'$, $b = b'$. Geometrically, an independent pair rules two families of parallel coordinate lines; each point sits on exactly one line of each family, so its $(a, b)$ is pinned down. A dependent pair collapses both families onto one direction — existence or uniqueness fails.",
        },
      ],
    },
  ],
  id: "vectors",
  title: "Vectors, Linear Combinations, and Basis",
  subtitle: "Arrows, the region two directions reach, and the coordinate language a basis provides",
  learningObjectives: [
    "See a vector as an arrow whose coordinates are horizontal and vertical movement",
    "Scale, add, and form linear combinations $a\\mathbf{v} + b\\mathbf{w}$",
    "Describe span as reachability, and contrast dependent (a line) with independent (the plane)",
    "Recognize an independent pair as a basis of the plane and write any vector uniquely as $a\\mathbf{v} + b\\mathbf{w}$",
    "Read $(a, b)$ as coordinates in a chosen basis, with the standard axes as just one choice",
  ],
  motivatingQuestion:
    "Two arrows point in different directions. By stretching and adding them you can reach some set of points — but once you can reach every point, is $(x, y)$ really \u201cthe vector,\u201d or just its name in the language those two arrows set up?",
  sections: [
    {
      id: "vectors",
      title: "Vectors and operations",
      body: "A vector is an arrow from the origin; its coordinates are the horizontal and vertical movement needed to reach the tip. Scaling multiplies an arrow's length (a negative scalar flips it), and adding places arrows head-to-tail.",
      equation: "\\mathbf{v} = \\begin{bmatrix} v_1 \\\\ v_2 \\end{bmatrix}",
      observation:
        "Coordinates are not a separate idea from geometry — they describe the same arrow.",
    },
    {
      id: "combinations",
      title: "Linear combinations and span",
      body: "Do both operations at once and you get a linear combination $a\\mathbf{v} + b\\mathbf{w}$. The span is the set of all points you can reach this way. Two vectors are independent when neither is a scalar multiple of the other; they are dependent when they share a line.",
      equation: "a\\mathbf{v} + b\\mathbf{w}",
      observation:
        "Independent directions sweep out the whole plane. A dependent pair shares one line, so every combination stays on it — which is already why a dependent pair can never be a basis.",
    },
    {
      id: "basis",
      title: "Basis and coordinates",
      body: "In the plane, two independent vectors span the plane, so they form a basis: every vector is some $a\\mathbf{v} + b\\mathbf{w}$, and independence makes that choice unique. The coefficients $(a, b)$ are the coordinates of the vector in that basis. Our fixed point $\\mathbf{p} = \\mathbf{v} + \\mathbf{w}$ is $(4, 1)$ in the standard basis but $(1, 1)$ in $B = (\\mathbf{v}, \\mathbf{w})$ — the arrow never moved, only its description did.",
      equation:
        "\\mathbf{p} = a\\,\\mathbf{v} + b\\,\\mathbf{w} \\;\\Rightarrow\\; [\\mathbf{p}]_B = \\begin{bmatrix} a \\\\ b \\end{bmatrix}",
      observation:
        "The standard axes $\\mathbf{e}_1, \\mathbf{e}_2$ are just the most familiar basis, not the only one.",
      layers: [
        {
          kind: "math-note",
          title: "Why the coordinates are unique",
          body: "Suppose $a\\mathbf{v} + b\\mathbf{w} = a'\\mathbf{v} + b'\\mathbf{w}$. Rearranging gives $(a - a')\\mathbf{v} + (b - b')\\mathbf{w} = \\mathbf{0}$. Because $\\mathbf{v}$ and $\\mathbf{w}$ are independent, the only way to combine them to $\\mathbf{0}$ is with zero coefficients, so $a = a'$ and $b = b'$. Span guarantees a representation exists; independence guarantees it is unique.",
        },
      ],
    },
  ],
  guidedSceneId: "vectors-linear-combinations",
  explorationId: "linear-combination",
  exampleId: "vectors-default",
  workedExamples: [
    {
      id: "coords-in-basis",
      title: "Coordinates of one point in two bases",
      prompt:
        "Keep the point $\\mathbf{p} = \\mathbf{v} + \\mathbf{w}$ fixed and read its coordinates first against the standard axes, then against $B = (\\mathbf{v}, \\mathbf{w})$.",
      equations: [
        "\\mathbf{p} = \\mathbf{v} + \\mathbf{w} = \\begin{bmatrix} 1 \\\\ 2 \\end{bmatrix} + \\begin{bmatrix} 3 \\\\ -1 \\end{bmatrix} = \\begin{bmatrix} 4 \\\\ 1 \\end{bmatrix}",
        "[\\mathbf{p}]_E = \\begin{bmatrix} 4 \\\\ 1 \\end{bmatrix} \\quad (\\text{standard basis } \\mathbf{e}_1, \\mathbf{e}_2)",
        "\\mathbf{p} = 1\\,\\mathbf{v} + 1\\,\\mathbf{w}",
        "[\\mathbf{p}]_B = \\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix} \\quad (\\text{basis } B = (\\mathbf{v}, \\mathbf{w}))",
      ],
      equationsAriaLabel:
        "Computing the coordinates of p as four by one in the standard basis and as one by one in the basis formed by v and w.",
      layers: [
        {
          kind: "looking-ahead",
          title: "Coming up in Lesson 2",
          body: "A matrix will do exactly this reading: it takes a vector's standard coordinates $x, y$ and rebuilds the output from where the basis vectors land. Coordinates-in-a-basis is the idea the next lesson runs on.",
        },
      ],
    },
    {
      id: "coords-q-component-equation",
      title: "Finding an undisclosed coordinate by solving a 2×2 system",
      prompt:
        "This time the coefficients are not handed to you. Find $[\\mathbf{q}]_B$ for $\\mathbf{q} = (-1, 5)$ in $B = (\\mathbf{v}, \\mathbf{w})$ by writing $a\\mathbf{v} + b\\mathbf{w} = \\mathbf{q}$ componentwise and solving.",
      equations: [
        "a\\,\\mathbf{v} + b\\,\\mathbf{w} = \\mathbf{q}",
        "a\\begin{bmatrix} 1 \\\\ 2 \\end{bmatrix} + b\\begin{bmatrix} 3 \\\\ -1 \\end{bmatrix} = \\begin{bmatrix} -1 \\\\ 5 \\end{bmatrix}",
        "a + 3b = -1, \\qquad 2a - b = 5",
        "a = -1 - 3b \\;\\Rightarrow\\; 2(-1 - 3b) - b = 5",
        "-2 - 7b = 5 \\;\\Rightarrow\\; b = -1, \\quad a = 2",
        "[\\mathbf{q}]_B = \\begin{bmatrix} 2 \\\\ -1 \\end{bmatrix} \\qquad (\\mathbf{q} = 2\\mathbf{v} - \\mathbf{w})",
      ],
      equationsAriaLabel:
        "Solving the two by two system a plus three b equals negative one and two a minus b equals five, giving a equals two and b equals negative one, so q in basis B is two, negative one.",
      layers: [
        {
          kind: "math-note",
          title: "Basis order changes the coordinate order",
          body: "A basis is *ordered*. Reading $\\mathbf{q}$ against $B' = (\\mathbf{w}, \\mathbf{v})$ — the same two arrows, swapped — gives $[\\mathbf{q}]_{B'} = (-1, 2)$: the very same numbers in the opposite slots. The arrow never moved; only the order of the coordinate language did.",
        },
      ],
    },
  ],
  callouts: [
    {
      id: "basis-not-perpendicular",
      title: "\u201cIndependent means perpendicular\u201d / \u201ca basis must be the coordinate axes\u201d",
      belief:
        "It feels like a basis has to be at right angles, like the coordinate axes — so $\\mathbf{v} = (1, 2)$ and $\\mathbf{w} = (3, -1)$ shouldn't qualify.",
      confront:
        "Yet $\\mathbf{v}$ and $\\mathbf{w}$ are independent, they reach every point of the plane, and they give $\\mathbf{p}$ the unique coordinates $(1, 1)$ — even though they are neither perpendicular nor axis-aligned.",
      resolve:
        "A basis needs independence and spanning, not right angles. The standard axes are one convenient basis, not a requirement.",
    },
    {
      id: "coordinates-are-not-the-vector",
      title: "\u201cThe coordinates are the vector\u201d",
      belief:
        "It is tempting to say $\\mathbf{p}$ just is $(4, 1)$.",
      confront:
        "But the same fixed arrow $\\mathbf{p}$ is $(4, 1)$ in the standard basis and $(1, 1)$ in $B = (\\mathbf{v}, \\mathbf{w})$. Two different coordinate pairs, one unchanged arrow.",
      resolve:
        "The arrow is the invariant object; coordinates are only its description relative to a chosen basis.",
    },
  ],
  checkpoint: {
    prompt:
      "The same arrow $\\mathbf{p}$ is $(4, 1)$ using the standard axes and $(1, 1)$ using $B = (\\mathbf{v}, \\mathbf{w})$. Did $\\mathbf{p}$ move? What actually changed?",
    answer:
      "$\\mathbf{p}$ did not move. Coordinates name a vector relative to a chosen basis, so switching from the standard axes to $B = (\\mathbf{v}, \\mathbf{w})$ changes the coordinate pair — $(4,1)$ becomes $(1,1)$ — while the arrow itself stays exactly where it was.",
  },
  checkpoints: [
    {
      id: "span-reachability",
      prompt:
        "As $a$ and $b$ range over all real numbers, which points can $a\\mathbf{v} + b\\mathbf{w}$ reach when $\\mathbf{v}$ and $\\mathbf{w}$ point in different directions? What changes if instead $\\mathbf{w} = 2\\mathbf{v}$?",
      answer:
        "Two independent directions span the whole plane, so every point is reachable. If $\\mathbf{w} = 2\\mathbf{v}$ the pair is dependent — every combination stays on the single line through $\\mathbf{v}$, so most of the plane is unreachable and the pair cannot be a basis.",
    },
  ],
  exercises: [
    {
      id: "vec-add-compute",
      type: "vector",
      tier: "drill",
      prompt:
        "With $\\mathbf{v} = (1, 2)$ and $\\mathbf{w} = (3, -1)$, compute the linear combination $1\\cdot\\mathbf{v} + 1\\cdot\\mathbf{w}$. Enter the resulting coordinates.",
      expected: [EX.v[0] + EX.wIndependent[0], EX.v[1] + EX.wIndependent[1]],
      tolerance: 0.01,
      explanation:
        "Add componentwise: $(1+3,\\, 2+(-1)) = (4, 1)$. This is the point $\\mathbf{p}$, whose standard-basis coordinates are $[\\mathbf{p}]_E = (4, 1)$.",
    },
    {
      id: "vec-span",
      type: "multiple-choice",
      tier: "check",
      prompt: "Two vectors that are scalar multiples of each other span…",
      choices: [
        "the entire plane",
        "a single line through the origin",
        "only the origin",
        "a circle of fixed radius",
      ],
      correctChoice: 1,
      explanation:
        "Scalar multiples point along one shared line, so every combination $a\\mathbf{v} + b\\mathbf{w}$ stays on that line — the span is a line, not the plane, and such a pair cannot be a basis.",
    },
    {
      id: "vec-basis-check",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "$\\mathbf{v} = (1, 2)$ and $\\mathbf{w} = (3, -1)$ are not perpendicular. Do they form a basis of the plane?",
      choices: [
        "No — a basis must be perpendicular, like the coordinate axes",
        "Yes — they are independent, and independence (not perpendicularity) is what a basis needs",
        "No — only the standard axes $\\mathbf{e}_1, \\mathbf{e}_2$ form a basis",
        "Only if we first rescale them to length 1",
      ],
      correctChoice: 1,
      explanation:
        "A basis of the plane needs two independent vectors that span it. $\\mathbf{v}$ and $\\mathbf{w}$ are independent (neither is a multiple of the other), so they qualify — right angles are not required.",
    },
    {
      id: "vec-coords-in-basis",
      type: "vector",
      tier: "transfer",
      prompt:
        "Write $\\mathbf{p} = (4, 1)$ in the basis $B = (\\mathbf{v}, \\mathbf{w})$ with $\\mathbf{v} = (1, 2)$, $\\mathbf{w} = (3, -1)$. Find the coordinates $[\\mathbf{p}]_B = (a, b)$ with $a\\mathbf{v} + b\\mathbf{w} = \\mathbf{p}$.",
      expected: [1, 1],
      tolerance: 0.01,
      explanation:
        "Since $\\mathbf{p} = \\mathbf{v} + \\mathbf{w}$, we have $a = 1$ and $b = 1$, so $[\\mathbf{p}]_B = (1, 1)$. The same arrow that was $(4, 1)$ in the standard basis is $(1, 1)$ here.",
    },
    {
      id: "vec-independent-predict",
      type: "prediction",
      prompt:
        "Predict: are $\\mathbf{v} = (1, 2)$ and $\\mathbf{w} = (3, -1)$ independent, and what does that mean for their span?",
      reveal:
        "They are independent — neither is a scalar multiple of the other (the cross term $1\\cdot(-1) - 2\\cdot 3 = -7 \\neq 0$). Independent directions span the whole plane, so they form a basis and every point has unique coordinates in it.",
    },
    {
      id: "vec-coords-q",
      type: "vector",
      tier: "transfer",
      prompt:
        "Find $[\\mathbf{q}]_B$ for $\\mathbf{q} = (-1, 5)$ in $B = (\\mathbf{v}, \\mathbf{w})$ with $\\mathbf{v} = (1, 2)$, $\\mathbf{w} = (3, -1)$. Solve $a\\mathbf{v} + b\\mathbf{w} = \\mathbf{q}$ for $(a, b)$.",
      expected: [EX.coordinatesInBasisQ[0], EX.coordinatesInBasisQ[1]],
      tolerance: 0.01,
      explanation:
        "The system $a + 3b = -1$, $2a - b = 5$ solves to $a = 2$, $b = -1$, so $[\\mathbf{q}]_B = (2, -1)$ and $\\mathbf{q} = 2\\mathbf{v} - \\mathbf{w}$.",
    },
    {
      id: "vec-basis-order",
      type: "vector",
      tier: "transfer",
      prompt:
        "Using the *swapped* basis $B' = (\\mathbf{w}, \\mathbf{v})$, what is $[\\mathbf{q}]_{B'}$ for $\\mathbf{q} = (-1, 5)$?",
      expected: [EX.coordinatesInBasisPrimeQ[0], EX.coordinatesInBasisPrimeQ[1]],
      tolerance: 0.01,
      explanation:
        "Order matters: $[\\mathbf{q}]_B = (2, -1)$ becomes $[\\mathbf{q}]_{B'} = (-1, 2)$ when the two basis vectors trade places. Same arrow, reordered coordinate language.",
    },
    {
      id: "vec-infinitely-many",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "With the dependent pair $\\mathbf{v} = (1, 2)$ and $\\mathbf{w}_d = (2, 4)$, how many coefficient pairs $(a, b)$ satisfy $a\\mathbf{v} + b\\mathbf{w}_d = \\mathbf{r}$ for $\\mathbf{r} = (3, 6)$?",
      choices: [
        "Exactly one",
        "None — $\\mathbf{r}$ is unreachable",
        "Infinitely many, all with $a = 3 - 2b$",
        "Exactly two",
      ],
      correctChoice: 2,
      explanation:
        "Since $\\mathbf{w}_d = 2\\mathbf{v}$, both components reduce to the single equation $a + 2b = 3$. Every $b$ gives a valid $a = 3 - 2b$ — a whole family of representations, because a dependent pair is not a basis.",
    },
    {
      id: "vec-existence-uniqueness",
      type: "prediction",
      prompt:
        "Predict: why does a basis give *exactly one* coordinate pair $(a, b)$ for each vector — no more, no fewer?",
      reveal:
        "Spanning guarantees at least one representation exists (you can always reach the point). Independence guarantees it is unique (if two pairs gave the same vector, their difference would combine the independent vectors to $\\mathbf{0}$, forcing the pairs to be equal). Existence + uniqueness = well-defined coordinates.",
    },
  ],
  keyTakeaway:
    "In the plane, two independent vectors span the plane, so they form a basis; every vector is then a unique $\\mathbf{p} = a\\mathbf{v} + b\\mathbf{w}$, and $(a, b)$ are its coordinates in that basis. The standard axes are just the most familiar basis.",
};
