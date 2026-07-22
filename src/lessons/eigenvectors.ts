import type { LessonDefinition } from "./types";

export const eigenvectorsLesson: LessonDefinition = {
  id: "eigenvectors",
  title: "Eigenvectors and Eigenvalues",
  subtitle: "Directions that refuse to leave their line — and how to find them",
  learningObjectives: [
    "Observe that most vectors change direction under a linear map",
    "Identify eigenvectors as nonzero directions that stay on the same line",
    "Read eigenvalues as stretch, shrink, reverse, or collapse factors",
    "Compute eigenvalues from $\\det(A-\\lambda I)=0$ and eigenspaces from $(A-\\lambda I)\\mathbf{v}=\\mathbf{0}$",
    "Distinguish scalar, defective, and no-real-eigenvector cases honestly",
  ],
  motivatingQuestion:
    "Are there any directions a transformation can stretch without turning?",
  // Composed route: the worked derivation comes right after the check and the
  // "edge cases" section is deliberately placed *after* that computation — the
  // edge cases only make sense once you have seen the generic case worked out.
  route: [
    { kind: "motivate" },
    { kind: "visual" },
    { kind: "section", sectionId: "intro" },
    { kind: "check" },
    { kind: "worked" },
    { kind: "section", sectionId: "edge" },
    { kind: "explore" },
    { kind: "practice" },
    { kind: "summary" },
  ],
  sections: [
    {
      id: "intro",
      title: "Directions that refuse to turn",
      body: "Apply a matrix to a fan of vectors. Most tips swing off their original rays. A few stay on the same line through the origin — those special directions are eigenvectors, scaled by an eigenvalue $\\lambda$ via $A\\mathbf{v}=\\lambda\\mathbf{v}$. The zero vector is never an eigenvector.",
      equation: "A\\mathbf{v} = \\lambda\\mathbf{v}",
      observation:
        "An eigenvalue of $-1$ reverses the arrow while keeping it on the same line. An eigenvalue of $0$ collapses length the way Lesson 3's determinant collapsed area.",
      layers: [
        {
          kind: "connection",
          title: "Back to transformations",
          body: "A matrix is still a machine that moves every point consistently (Lesson 2). Eigenvectors are the rare directions that machine refuses to mix — it only scales them.",
        },
        {
          kind: "connection",
          title: "Span is still reachability",
          body: "An eigendirection is a one-dimensional span: every scalar multiple of $\\mathbf{v}$ stays on that line. The eigenspace for $\\lambda$ is exactly the set of vectors the map sends to multiples of themselves.",
        },
      ],
    },
    {
      id: "edge",
      title: "Edge cases worth naming",
      body: "A scalar matrix $A=\\lambda I$ makes every nonzero direction an eigenvector. A defective matrix can have a repeated $\\lambda$ with only one eigendirection — do not invent a second. A pure rotation has no real eigenvectors (complex eigenvalues may still exist).",
      layers: [
        {
          kind: "looking-ahead",
          title: "Toward change of basis",
          body: "When a matrix has a full set of eigendirections, those directions become a coordinate language that makes the map look diagonal — the seed of diagonalization and change of basis.",
        },
        {
          kind: "math-note",
          title: "Complex eigenvalues",
          body: "In $\\mathbb{R}^2$, a rotation has no real eigendirection. Over $\\mathbb{C}$ the characteristic polynomial still splits; this lesson stays honest about the real picture first.",
        },
      ],
    },
  ],
  guidedSceneId: "eigenvectors-invariant-directions",
  explorationId: "eigenvectors-invariant-directions",
  exampleId: "eigen-distinct",
  checkpoint: {
    prompt:
      "If $A\\mathbf{v}$ points in the opposite direction from $\\mathbf{v}$ but stays on the same line, can $\\mathbf{v}$ still be an eigenvector?",
    answer:
      "Yes — provided $\\mathbf{v}\\neq\\mathbf{0}$. Then $A\\mathbf{v}=\\lambda\\mathbf{v}$ with $\\lambda<0$: the eigenvalue reverses direction while preserving the line.",
  },
  workedExamples: [
    {
      id: "eigen-compute-distinct",
      title: "Computing the eigenvalues and eigenvectors",
      prompt:
        "For $A=\\begin{bmatrix} 3 & 1 \\\\ 0 & 2 \\end{bmatrix}$ — the same matrix you just watched — here is the whole calculation.",
      guidedSceneId: "eigenvectors-derivation",
      exampleId: "eigen-distinct",
      equationsAriaLabel: "Deriving the eigenvalues and eigenvectors of A",
      equations: [
        "A\\mathbf{v} = \\lambda\\mathbf{v}",
        "(A - \\lambda I)\\mathbf{v} = \\mathbf{0}",
        "\\det(A - \\lambda I) = 0",
        "\\det\\begin{bmatrix} 3-\\lambda & 1 \\\\ 0 & 2-\\lambda \\end{bmatrix} = 0",
        "(3-\\lambda)(2-\\lambda) = 0",
        "\\lambda = 3,\\; 2",
        "\\lambda = 3:\\quad \\mathbf{v} \\parallel \\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix}",
        "\\lambda = 2:\\quad \\mathbf{v} \\parallel \\begin{bmatrix} -1 \\\\ 1 \\end{bmatrix}",
      ],
      layers: [
        {
          kind: "trap",
          title: "It is A − λI, not A, that sends v to zero",
          body: "Watch which map does the crushing. Under $A$ an eigenvector is only scaled ($A\\mathbf{v}=\\lambda\\mathbf{v}$); it is the auxiliary map $A-\\lambda I$ that sends that direction to the origin. That is why we look for the $\\lambda$ that makes $A-\\lambda I$ singular.",
        },
        {
          kind: "connection",
          title: "Why det(A − λI) = 0? — determinant collapse from Lesson 3",
          body: "A nonzero direction can land on $\\mathbf{0}$ only if $A-\\lambda I$ flattens the plane. In Lesson 3 that was exactly what $\\det=0$ meant: the map collapses a dimension. So the eigenvalues are the $\\lambda$ that make the auxiliary map singular.",
        },
      ],
    },
  ],
  callouts: [
    {
      id: "not-always-axes",
      title: "Common trap — eigenvectors are not always axes",
      belief: "Eigenvectors live on the coordinate axes.",
      confront:
        "For $A=\\begin{bmatrix} 3 & 1 \\\\ 0 & 2 \\end{bmatrix}$, $\\lambda=3$ does give $(1,0)$ — but $\\lambda=2$ gives a multiple of $(-1,1)$, an off-axis line.",
      resolve:
        "An eigendirection is any line the map refuses to mix. Axes are a special case, not the rule.",
      solutionVisualId: "eigen-solution-off-axis",
      exampleId: "eigen-distinct",
      highlightLambda: 2,
    },
    {
      id: "same-line-not-direction",
      title: "Common trap — same line is not the same direction",
      belief: "An eigenvector must keep pointing the same way.",
      confront:
        "When $\\lambda<0$, $A\\mathbf{v}$ reverses the arrow while staying on the same line through the origin.",
      resolve:
        "The definition is $A\\mathbf{v}=\\lambda\\mathbf{v}$ with $\\mathbf{v}\\neq\\mathbf{0}$: same line, signed scale.",
    },
    {
      id: "repeated-not-two",
      title: "Common trap — repeated λ does not invent a second line",
      belief:
        "A repeated eigenvalue always means two independent eigendirections.",
      confront:
        "A defective matrix can have a repeated $\\lambda$ with only one eigendirection — do not invent a second.",
      resolve:
        "Ask the nullspace of $A-\\lambda I$: sometimes it is a line, sometimes the whole plane (scalar case).",
    },
  ],
  exercises: [
    {
      id: "eigen-check-reverse",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "If $A\\mathbf{v}=(-2)\\mathbf{v}$ for a nonzero $\\mathbf{v}$, the eigenvalue…",
      choices: [
        "stretches $\\mathbf{v}$ without reversing it",
        "shrinks $\\mathbf{v}$ toward the origin without reversing",
        "reverses $\\mathbf{v}$ and stretches it by a factor of $2$",
        "means $A$ has no real eigenvectors",
      ],
      correctChoice: 2,
      explanation:
        "$\\lambda=-2$ flips direction and multiplies length by $2$. Same line, opposite arrow.",
    },
    {
      id: "eigen-drill-lambdas",
      type: "eigenvalue",
      tier: "drill",
      prompt:
        "Compute the eigenvalues of $A=\\begin{bmatrix} 3 & 1 \\\\ 0 & 2 \\end{bmatrix}$. Enter both, separated by a comma.",
      expected: [2, 3],
      tolerance: 0.01,
      hints: [
        "Form $A-\\lambda I$ and compute $\\det(A-\\lambda I)$.",
        "You should get $\\lambda^2-5\\lambda+6=0$.",
      ],
      explanation:
        "Characteristic polynomial $\\lambda^2-5\\lambda+6=(\\lambda-3)(\\lambda-2)$. Roots $\\lambda=3$ and $\\lambda=2$.",
      solutionReveal: {
        prose:
          "The roots are $\\lambda=3$ (axis direction) and $\\lambda=2$ (off-axis line through $(-1,1)$).",
        solutionVisualId: "eigen-solution",
        derivation: "$\\det(A-\\lambda I)=\\lambda^2-5\\lambda+6=0$.",
        interpretation:
          "Two real stretch factors along two different lines — one axis, one slanted.",
        connection:
          "Zero of the characteristic determinant is Lesson 3's collapse idea applied to $A-\\lambda I$.",
      },
    },
    {
      id: "eigen-drill-vector",
      type: "vector",
      tier: "drill",
      prompt:
        "For the same $A$, enter one nonzero eigenvector for $\\lambda=2$. The oriented unit direction from the nullspace is $(1,-1)$ (any parallel vector within tolerance also works if you enter that).",
      expected: [1, -1],
      tolerance: 0.15,
      hints: [
        "Solve $(A-2I)\\mathbf{v}=\\mathbf{0}$.",
        "$A-2I=\\begin{bmatrix} 1 & 1 \\\\ 0 & 0 \\end{bmatrix}$, so $x+y=0$. Oriented: $(1,-1)$.",
      ],
      explanation:
        "$(A-2I)\\mathbf{v}=\\mathbf{0}$ forces $x=-y$. The direction $(1,-1)$ (equivalently $(-1,1)$) is off-axis — not a coordinate axis.",
      solutionReveal: {
        prose:
          "The $\\lambda=2$ eigenspace is the line through $(1,-1)$ / $(-1,1)$. Compare with $\\lambda=3$ along $(1,0)$.",
        solutionVisualId: "eigen-solution-off-axis",
        interpretation:
          "Asymmetry is deliberate: one axis, one slanted line for the same matrix.",
      },
    },
    {
      id: "eigen-transfer-real",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "A $90^\\circ$ rotation matrix has characteristic discriminant negative. What should you conclude about real eigendirections?",
      choices: [
        "It has two real eigendirections along the axes",
        "It has one repeated real eigendirection",
        "It has no real eigendirections — every nonzero vector turns",
        "Every nonzero vector is an eigenvector",
      ],
      correctChoice: 2,
      explanation:
        "Complex conjugate eigenvalues mean no real line stays put. The fan turns; nothing is invariant over $\\mathbb{R}$.",
      solutionReveal: {
        prose:
          "When $\\det(A-\\lambda I)=0$ has no real root, the derivation ladder stops before real eigenspaces. Over $\\mathbb{R}$ the map has no invariant line.",
        interpretation:
          "Honest edge case: not every $2\\times 2$ matrix has real eigenvectors.",
        connection:
          "Contrast with the scalar case, where the eigenspace is the whole plane.",
      },
    },
    {
      id: "eigen-drag",
      type: "prediction",
      tier: "check",
      prompt:
        "In the explorer, drag a candidate until $A\\mathbf{v}$ lies on the same line through the origin. What have you found?",
      reveal:
        "An eigendirection — the transformed vector is a scalar multiple of the original ($A\\mathbf{v}=\\lambda\\mathbf{v}$ for some real $\\lambda$).",
    },
  ],
  keyTakeaway:
    "An eigenvector is a nonzero direction preserved by the transformation; its eigenvalue is the signed scale. You find them by solving $\\det(A-\\lambda I)=0$, then $(A-\\lambda I)\\mathbf{v}=\\mathbf{0}$ — and the directions need not be the axes.",
};
