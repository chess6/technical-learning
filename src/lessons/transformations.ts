import type { LessonDefinition } from "./types";
import { MATRIX_LESSON_EXAMPLE as EX } from "./exampleData";

const A = EX.matrix;

export const transformationsLesson: LessonDefinition = {
  id: "transformations",
  title: "Matrices as Linear Transformations",
  subtitle: "How a 2×2 matrix moves the plane",
  learningObjectives: [
    "Read a matrix as a linear transformation, not only a table of numbers",
    "State and test the two linearity properties: additivity and homogeneity",
    "Tell linear, affine (translation), and nonlinear maps apart",
    "Derive the columns rule $A = [\\,T(\\mathbf{e}_1)\\ T(\\mathbf{e}_2)\\,]$ as a consequence of unique coordinates and linearity",
    "Explain projection/collapse and that a matrix represents $T$ relative to a chosen basis",
  ],
  motivatingQuestion:
    "Chapter 0 showed four numbers moving every vertex of a craft at once. How can knowing the fate of only two vectors — $\\mathbf{e}_1$ and $\\mathbf{e}_2$ — determine the fate of every vector?",
  route: [
    { kind: "motivate" },
    { kind: "formal", formalId: "def-linear" },
    { kind: "watch" },
    { kind: "formal", formalId: "prop-basis-determination" },
    { kind: "worked" },
    { kind: "formal", formalId: "cor-columns" },
    { kind: "formal", formalId: "cor-consequences" },
    { kind: "check" },
    { kind: "formal", formalId: "prop-matrix-basis" },
    { kind: "explore" },
    { kind: "practice" },
    { kind: "summary" },
  ],
  formalBlocks: [
    {
      id: "def-linear",
      kind: "definition",
      label: "Linear transformation",
      statement:
        "A map $T : \\mathbb{R}^2 \\to \\mathbb{R}^2$ is *linear* when it satisfies both **additivity** — $T(\\mathbf{u} + \\mathbf{v}) = T(\\mathbf{u}) + T(\\mathbf{v})$ — and **homogeneity** — $T(c\\,\\mathbf{u}) = c\\,T(\\mathbf{u})$ — for all vectors $\\mathbf{u}, \\mathbf{v}$ and scalars $c$.",
      interpretation:
        "The map respects combining and scaling: it moves the whole plane consistently. Everything else in this lesson is a consequence of these two lines.",
      visibility: "visible",
      layers: [
        {
          kind: "trap",
          title: "Two motions that are NOT linear",
          body: "**Translation** $T(\\mathbf{x}) = \\mathbf{x} + \\mathbf{t}$ (a slide) fails both tests: $T(\\mathbf{0}) = \\mathbf{t} \\neq \\mathbf{0}$, and a linear map must fix the origin. It is *affine*, not linear — a $2\\times 2$ matrix can never represent it. A **nonlinear warp** such as $T(x, y) = (x + 0.4\\,y^2,\\ y)$ bends grid lines and breaks even spacing, so it is not linear either. Only linear maps have a columns rule.",
        },
      ],
    },
    {
      id: "prop-basis-determination",
      kind: "proposition",
      label: "A linear map is determined by its action on a basis",
      statement:
        "If $B = (\\mathbf{v}, \\mathbf{w})$ is a basis and $\\mathbf{x} = a\\mathbf{v} + b\\mathbf{w}$, then $T(\\mathbf{x}) = a\\,T(\\mathbf{v}) + b\\,T(\\mathbf{w})$. So once $T(\\mathbf{v})$ and $T(\\mathbf{w})$ are known, $T$ is fixed everywhere.",
      interpretation:
        "Know two fates, know all fates. This is Lesson 1's uniqueness (every vector has one coordinate pair) combined with linearity (which carries those coordinates through the map).",
      visibility: "revealed",
      layers: [
        {
          kind: "connection",
          title: "This reuses Lesson 1 directly",
          body: "Lesson 1's theorem guarantees the coefficients $a, b$ exist and are unique. Linearity then says $T$ acts on each piece separately and re-adds them — so the image is completely pinned down by $T(\\mathbf{v}), T(\\mathbf{w})$.",
        },
      ],
    },
    {
      id: "cor-columns",
      kind: "corollary",
      label: "The columns rule",
      statement:
        "Specializing to the standard basis $\\mathbf{x} = x\\,\\mathbf{e}_1 + y\\,\\mathbf{e}_2$ gives $T(\\mathbf{x}) = x\\,T(\\mathbf{e}_1) + y\\,T(\\mathbf{e}_2)$, so $A = \\begin{bmatrix} T(\\mathbf{e}_1) & T(\\mathbf{e}_2) \\end{bmatrix}$ and $A\\mathbf{x} = x\\,(\\text{column }1) + y\\,(\\text{column }2)$.",
      interpretation:
        "The columns of $A$ are literally where $\\mathbf{e}_1$ and $\\mathbf{e}_2$ land — a *derived consequence* of unique coordinates plus linearity, not a convention to memorize. This is the answer to Chapter 0's mystery.",
      visibility: "visible",
    },
    {
      id: "cor-consequences",
      kind: "corollary",
      label: "What the columns rule immediately gives",
      statement:
        "(1) Every output $A\\mathbf{x}$ is a linear combination of $A$'s columns. (2) The set of possible outputs is the *span of the columns* (the column space). (3) Dependent columns collapse the plane onto a line or point. (4) If $T(\\mathbf{e}_1), T(\\mathbf{e}_2)$ still form a basis, $T$ is reversible. (5) Every linear transformation fixes the origin: $T(\\mathbf{0}) = \\mathbf{0}$.",
      interpretation:
        "These are named as consequences, not procedures — column space, rank, and invertibility get their own machinery later. Consequence (5) is exactly why translation is excluded.",
      visibility: "reference",
    },
    {
      id: "prop-matrix-basis",
      kind: "proposition",
      label: "A matrix represents T relative to a chosen basis",
      statement:
        "The reflection across $y = x$ has standard matrix $[T]_{E} = \\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}$, but in the basis $B = ((1,1), (1,-1))$ the *same* reflection is $[T]_{B} = \\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}$.",
      interpretation:
        "Same geometric map, two different matrices — the matrix is $T$ *relative to* a basis, not identical to $T$. (The general change-of-basis formula is deferred; here we just see it happen.)",
      visibility: "visible",
    },
  ],
  sections: [
    {
      id: "intro",
      title: "From table to map",
      body: "Recall from Lesson 1 that $\\mathbf{e}_1 = (1, 0)$ and $\\mathbf{e}_2 = (0, 1)$ are the standard basis, so every vector has unique coordinates: $\\mathbf{v} = x\\,\\mathbf{e}_1 + y\\,\\mathbf{e}_2$. A $2\\times 2$ matrix tells every vector where to go, and the cleanest way to read it is by columns: the first column is where $\\mathbf{e}_1$ lands, the second where $\\mathbf{e}_2$ lands.",
      equation: `A = \\begin{bmatrix} ${A[0][0]} & ${A[0][1]} \\\\ ${A[1][0]} & ${A[1][1]} \\end{bmatrix}`,
      observation:
        "Once you know where $\\mathbf{e}_1$ and $\\mathbf{e}_2$ go, every other vector follows by linearity.",
    },
    {
      id: "grid",
      title: "Linearity carries the grid",
      body: "Because $\\mathbf{v} = x\\,\\mathbf{e}_1 + y\\,\\mathbf{e}_2$ uniquely, linearity forces $A\\mathbf{v} = x\\,(A\\mathbf{e}_1) + y\\,(A\\mathbf{e}_2)$. So the two columns $A\\mathbf{e}_1, A\\mathbf{e}_2$ decide where every vector goes — the columns rule is a consequence of unique coordinates, not a separate fact. The whole grid deforms into a scaled, sheared lattice while lines stay straight and evenly spaced.",
      equation: "A(x\\,\\mathbf{e}_1 + y\\,\\mathbf{e}_2) = x\\,A\\mathbf{e}_1 + y\\,A\\mathbf{e}_2",
      observation:
        "The identity-to-$A$ frames you scrub are an educational visual transition, not a matrix factorization.",
      layers: [
        {
          kind: "connection",
          title: "This is Lesson 1's basis idea in action",
          body: "Lesson 1 showed every vector is a unique combination of basis vectors. Here the matrix reads those coordinates and rebuilds the output from the transformed basis. Later, change of basis lets you choose which basis to read coordinates in.",
        },
      ],
    },
    {
      id: "not-linear",
      title: "Not every motion is a matrix",
      body: "Two useful motions are *not* linear. A **translation** slides the whole craft sideways — but it moves the origin, so no $2\\times 2$ matrix can produce it (it is *affine*). A **nonlinear warp** bends the grid lines so they are no longer straight or evenly spaced. Both matter in practice; neither has a columns rule.",
      observation:
        "The affine fix — homogeneous coordinates — is named only, and deferred. For now, a matrix means a linear map that fixes the origin.",
    },
    {
      id: "back-to-graphic",
      title: "Back to the Chapter 0 craft",
      body: "Every vertex of the craft is $x\\,\\mathbf{e}_1 + y\\,\\mathbf{e}_2$, so its image is $x\\,T(\\mathbf{e}_1) + y\\,T(\\mathbf{e}_2)$. That is why setting just the two columns — where $\\mathbf{e}_1$ and $\\mathbf{e}_2$ land — repositions every vertex at once. Four numbers, two arrows, the whole graphic.",
      observation:
        "In the explorer you can set the two columns to match a target craft — the mystery from Chapter 0, closed by hand.",
    },
  ],
  guidedSceneId: "matrix-transformations",
  explorationId: "matrix-transformation",
  exampleId: "shear-2-1",
  workedExamples: [
    {
      id: "columns-rule-derivation",
      title: "Deriving the columns rule from linearity",
      prompt:
        "Write any input in standard coordinates, then apply linearity to see why the two columns are the images of the basis vectors.",
      equations: [
        "\\mathbf{x} = x\\,\\mathbf{e}_1 + y\\,\\mathbf{e}_2",
        "T(\\mathbf{x}) = T(x\\,\\mathbf{e}_1 + y\\,\\mathbf{e}_2)",
        "= x\\,T(\\mathbf{e}_1) + y\\,T(\\mathbf{e}_2) \\qquad (\\text{additivity, then homogeneity})",
        "A = \\begin{bmatrix} T(\\mathbf{e}_1) & T(\\mathbf{e}_2) \\end{bmatrix}",
        "A\\mathbf{x} = x\\,(\\text{column } 1) + y\\,(\\text{column } 2)",
      ],
      equationsAriaLabel:
        "Writing x as x times e one plus y times e two, applying linearity to get x times T of e one plus y times T of e two, so the matrix A has columns T of e one and T of e two, and A x is x times column one plus y times column two.",
      layers: [
        {
          kind: "connection",
          title: "Why this is a consequence, not a definition",
          body: "Nothing here is assumed about matrices. The columns rule *falls out* of two facts you already have: every vector has unique standard coordinates $(x, y)$ (Lesson 1), and $T$ is linear. Change either and the rule changes with it.",
        },
      ],
    },
  ],
  callouts: [
    {
      id: "matrix-is-not-transformation",
      title: "\u201cThe matrix is the transformation\u201d",
      belief:
        "It is tempting to say a linear map just *is* its $2\\times 2$ matrix.",
      confront:
        "But the reflection across $y = x$ is $\\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}$ in the standard basis and $\\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}$ in $B = ((1,1),(1,-1))$ — one geometric map, two matrices.",
      resolve:
        "The matrix represents $T$ *relative to a chosen basis*. The map is the invariant object; the matrix is its description in a coordinate language.",
    },
  ],
  checkpoint: {
    prompt:
      "The matrix $A = \\begin{bmatrix} 2 & 1 \\\\ 0 & 1 \\end{bmatrix}$ has first column $(2, 0)$. Where does $\\mathbf{e}_1 = (1, 0)$ land, and why?",
    answer:
      "At $(2, 0)$: the first column of a matrix is by definition the image of $\\mathbf{e}_1$. Multiplying $A$ by $(1, 0)$ selects exactly that column.",
  },
  exercises: [
    {
      id: "e1-predict",
      type: "vector",
      tier: "check",
      prompt: `For $A = \\begin{bmatrix} ${A[0][0]} & ${A[0][1]} \\\\ ${A[1][0]} & ${A[1][1]} \\end{bmatrix}$, where does $\\mathbf{e}_1 = (1, 0)$ land? Enter the coordinates.`,
      expected: [A[0][0], A[1][0]],
      tolerance: 0.01,
      explanation:
        "$\\mathbf{e}_1$ maps to the first column of $A$. Reading the first column top-to-bottom gives its landing point.",
    },
    {
      id: "t-linearity-test",
      type: "prediction",
      prompt:
        "Predict: is $T(x, y) = (x + 1,\\ y)$ linear? Test $T(\\mathbf{0})$ and whether $T(\\mathbf{u} + \\mathbf{v}) = T(\\mathbf{u}) + T(\\mathbf{v})$.",
      reveal:
        "It is not linear. $T(\\mathbf{0}) = (1, 0) \\neq \\mathbf{0}$, and a linear map must fix the origin. This is a translation — an affine map — so no $2\\times 2$ matrix represents it.",
    },
    {
      id: "t-classify",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "Which of these is a *linear* transformation?",
      choices: [
        "A translation $\\mathbf{x} \\mapsto \\mathbf{x} + (1, 0)$",
        "A uniform scaling $\\mathbf{x} \\mapsto 2\\mathbf{x}$",
        "The warp $(x, y) \\mapsto (x + y^2,\\ y)$",
        "Adding $1$ to the $y$-coordinate",
      ],
      correctChoice: 1,
      explanation:
        "Only $\\mathbf{x} \\mapsto 2\\mathbf{x}$ satisfies additivity and homogeneity and fixes the origin. Translations are affine; the $y^2$ warp is nonlinear (it bends grid lines).",
    },
    {
      id: "t-construct-column",
      type: "vector",
      tier: "drill",
      prompt:
        "You want a transformation with $T(\\mathbf{e}_1) = (0, 1)$. Enter column 1 of its matrix $A$.",
      expected: [0, 1],
      tolerance: 0.01,
      explanation:
        "Column 1 of $A$ is exactly $T(\\mathbf{e}_1)$, so it is $(0, 1)$. Building a matrix means choosing where the basis vectors land.",
    },
    {
      id: "t-predict-image",
      type: "vector",
      tier: "drill",
      prompt: `For $A = \\begin{bmatrix} ${A[0][0]} & ${A[0][1]} \\\\ ${A[1][0]} & ${A[1][1]} \\end{bmatrix}$, compute $A(1.5, 0.5)$.`,
      expected: [A[0][0] * 1.5 + A[0][1] * 0.5, A[1][0] * 1.5 + A[1][1] * 0.5],
      tolerance: 0.01,
      explanation:
        "$A\\mathbf{x} = 1.5\\,(\\text{column }1) + 0.5\\,(\\text{column }2) = 1.5(2,0) + 0.5(1,1) = (3.5, 0.5)$ — the output is a combination of the columns.",
    },
    {
      id: "match-transform",
      type: "multiple-choice",
      tier: "drill",
      prompt:
        "Which matrix sends $\\mathbf{e}_1$ to $(0, 1)$ and $\\mathbf{e}_2$ to $(-1, 0)$ — a $90^\\circ$ counterclockwise rotation?",
      choices: [
        "$\\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}$",
        "$\\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}$",
        "$\\begin{bmatrix} 2 & 0 \\\\ 0 & 2 \\end{bmatrix}$",
        "$\\begin{bmatrix} 1 & 1 \\\\ 0 & 1 \\end{bmatrix}$",
      ],
      correctChoice: 0,
      explanation:
        "Columns are the images of the basis: the first column must be $(0, 1)$ and the second $(-1, 0)$. Stacked as columns that is $\\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}$.",
    },
    {
      id: "t-collapse",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "What does $A = \\begin{bmatrix} 1 & 0 \\\\ 0 & 0 \\end{bmatrix}$ do to the plane?",
      choices: [
        "Rotates it by $90^\\circ$",
        "Leaves it unchanged",
        "Projects it onto the $x$-axis (a line)",
        "Doubles every length",
      ],
      correctChoice: 2,
      explanation:
        "The columns are $(1, 0)$ and $(0, 0)$ — dependent — so the outputs span only the $x$-axis. Distinct points collapse onto the same image: a projection.",
    },
    {
      id: "t-columns-explain",
      type: "prediction",
      tier: "transfer",
      prompt:
        "Predict: why are the columns of $A$ exactly $T(\\mathbf{e}_1)$ and $T(\\mathbf{e}_2)$?",
      reveal:
        "Every $\\mathbf{x} = x\\mathbf{e}_1 + y\\mathbf{e}_2$ has unique coordinates, and linearity gives $T(\\mathbf{x}) = xT(\\mathbf{e}_1) + yT(\\mathbf{e}_2)$. Setting $\\mathbf{x} = \\mathbf{e}_1$ picks out column 1, $\\mathbf{x} = \\mathbf{e}_2$ column 2 — so the columns are the basis images, by consequence.",
    },
    {
      id: "t-two-matrices",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "The reflection across $y = x$ has which matrices in the standard basis $E$ and in $B = ((1,1),(1,-1))$?",
      choices: [
        "$\\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}$ in $E$ and $\\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}$ in $B$",
        "The same matrix in both bases",
        "$\\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}$ in both",
        "$\\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}$ in both",
      ],
      correctChoice: 0,
      explanation:
        "Same geometric reflection, two matrices: $[[0,1],[1,0]]$ in the standard basis and $\\operatorname{diag}(1, -1)$ in $B$. The matrix depends on the basis you read coordinates in.",
    },
    {
      id: "t-transfer-target",
      type: "prediction",
      tier: "transfer",
      prompt:
        "In the explorer, use \u201cBuild a matrix\u201d to set the two columns until the craft matches the target. Predict: why is choosing where just $\\mathbf{e}_1$ and $\\mathbf{e}_2$ land enough to move every vertex?",
      reveal:
        "Because every vertex is $x\\mathbf{e}_1 + y\\mathbf{e}_2$ with unique $(x, y)$, its image is $xT(\\mathbf{e}_1) + yT(\\mathbf{e}_2)$. Fixing the two basis images fixes all vertices at once — exactly the basis-determination proposition.",
    },
  ],
  keyTakeaway:
    "A linear transformation fixes the origin and respects addition and scaling, so it is completely determined by where it sends $\\mathbf{e}_1$ and $\\mathbf{e}_2$ — the columns of its matrix. That is how four numbers move every vertex of the Chapter 0 craft: they are the two basis images, and linearity carries every other point along. The same map has different matrices in different bases.",
};
