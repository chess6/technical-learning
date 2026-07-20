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
  sections: [
    {
      id: "intro",
      title: "Special directions",
      body: "Apply a matrix to a fan of vectors. Most tips swing off their original rays. A few stay on the same line — those are eigenvectors, scaled by an eigenvalue $\\lambda$ via $A\\mathbf{v}=\\lambda\\mathbf{v}$. The zero vector is never an eigenvector.",
      equation: "A\\mathbf{v} = \\lambda\\mathbf{v}",
      observation:
        "An eigenvalue of $-1$ reverses the arrow while keeping it on the same line.",
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
      title: "Computing eigenvectors",
      prompt:
        "For $A=\\begin{bmatrix} 3 & 1 \\\\ 0 & 2 \\end{bmatrix}$, derive the eigenvalues and eigendirections. Watch the animation and the notebook together — they are one object.",
      guidedSceneId: "eigenvectors-derivation",
      exampleId: "eigen-distinct",
      steps: [
        {
          id: "recap",
          symbolic: "A\\mathbf{v} = \\lambda\\mathbf{v}",
          object: "A nonzero vector $\\mathbf{v}$ and a scalar $\\lambda$.",
          invariant: "We seek directions the map only scales — same line, signed length.",
          picture: "Most arrows leave their ray; a few stay put on a line through the origin.",
          whyNext:
            "Rearrange to expose a homogeneous equation whose nontrivial solutions are exactly those directions.",
          learned: "The defining equation is geometric: stay on your line, scaled by $\\lambda$.",
        },
        {
          id: "shift",
          symbolic: "(A - \\lambda I)\\mathbf{v} = \\mathbf{0}",
          object: "The auxiliary matrix $A-\\lambda I$, not $A$ itself.",
          invariant:
            "When $A\\mathbf{v}$ and $\\lambda\\mathbf{v}$ coincide, their difference is the zero vector.",
          picture:
            "Under $A-\\lambda I$, that special direction collapses to the origin. $A$ still stretches it — the auxiliary map is what crushes it.",
          whyNext:
            "A nonzero $\\mathbf{v}$ in the nullspace exists exactly when $A-\\lambda I$ collapses area.",
          learned:
            "The shift rewrites the geometry as a nullspace problem for a related map.",
        },
        {
          id: "charpoly",
          symbolic: "\\det(A - \\lambda I) = 0",
          object: "The determinant of the auxiliary map (Lesson 3).",
          invariant:
            "det $= 0$ means dimensional collapse — some distinct inputs become indistinguishable.",
          picture:
            "The unit square under $A-\\lambda I$ flattens onto a line precisely when $\\lambda$ is an eigenvalue.",
          whyNext: "Expand the determinant to get a quadratic in $\\lambda$ and solve.",
          learned:
            "Finding eigenvalues reuses the determinant idea: collapse of the auxiliary map.",
        },
        {
          id: "solve-lambda",
          symbolic: "\\lambda^2 - 5\\lambda + 6 = 0 \\implies \\lambda = 3,\\; 2",
          object: "The characteristic polynomial $\\lambda^2 - (\\mathrm{tr})\\lambda + \\det$.",
          picture: "Two real roots for this $A$: $\\lambda=3$ and $\\lambda=2$.",
          whyNext: "For each $\\lambda$, solve $(A-\\lambda I)\\mathbf{v}=\\mathbf{0}$.",
          learned: "The roots are the scale factors along the special directions.",
        },
        {
          id: "solve-v",
          symbolic:
            "\\lambda=3:\\; \\mathbf{v}\\parallel(1,0);\\quad \\lambda=2:\\; \\mathbf{v}\\parallel(-1,1)",
          object: "One eigenspace per eigenvalue.",
          invariant: "Each nullspace is a line (or the plane, in the scalar case).",
          picture:
            "$\\lambda=3$ keeps the $x$-axis. $\\lambda=2$ is the off-axis line through $(-1,1)$ — eigenvectors are not always coordinate axes.",
          whyNext: "Read each $\\lambda$ back as stretch, shrink, reverse, or collapse.",
          learned:
            "Asymmetry is the point: one axis direction and one slanted direction for the same matrix.",
        },
        {
          id: "interpret",
          object: "The pair $(\\lambda, \\text{line})$.",
          picture:
            "$\\lambda=3$ stretches along $(1,0)$; $\\lambda=2$ stretches along $(-1,1)$. Same definition, two different lines.",
          learned:
            "You can now compute eigenvectors — not only recognize them visually.",
        },
      ],
      layers: [
        {
          kind: "connection",
          title: "Determinant collapse pays off here",
          body: "The rung $\\det(A-\\lambda I)=0$ is Lesson 3's compression reused: zero determinant means the auxiliary map loses a dimension. The concept graph edge from determinants to eigenvectors is the derivation itself.",
        },
        {
          kind: "trap",
          title: "Do not say A crushes its eigenvector",
          body: "Under $A$, an eigenvector is scaled, not sent to zero (unless $\\lambda=0$). It is $A-\\lambda I$ that sends that direction to the origin.",
        },
      ],
    },
    {
      id: "eigen-faded-negative",
      title: "Your turn — a negative eigenvalue",
      prompt:
        "For $A=\\begin{bmatrix} 2 & 0 \\\\ 0 & -1 \\end{bmatrix}$, supply the missing reasoning. Guidance is faded: reveal each step after you try.",
      exampleId: "eigen-negative",
      steps: [
        {
          id: "charpoly-faded",
          faded: true,
          symbolic: "\\det(A-\\lambda I)=\\lambda^2 - \\lambda - 2 = 0",
          object: "Characteristic polynomial for this diagonal matrix.",
          learned: "Roots $\\lambda=2$ and $\\lambda=-1$.",
        },
        {
          id: "spaces-faded",
          faded: true,
          symbolic:
            "\\lambda=2:\\;(1,0);\\quad \\lambda=-1:\\;(0,1)",
          picture:
            "$\\lambda=-1$ reverses the vertical axis while staying on that line — same line, opposite direction.",
          learned:
            "Negative eigenvalues reverse; they do not leave the eigendirection.",
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
