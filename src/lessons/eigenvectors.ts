import type { LessonDefinition } from "./types";
import { EXERCISE_SEQUENCE_ID } from "./capabilities";

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
    { kind: "visual", heading: "Most directions turn; a few do not" },
    { kind: "section", sectionId: "intro" },
    { kind: "check" },
    { kind: "worked" },
    { kind: "section", sectionId: "edge" },
    { kind: "explore", tocLabel: "Hunt for invariant directions" },
    { kind: "practice" },
    { kind: "summary", heading: "Directions the map only scales" },
  ],
  sections: [
    {
      id: "intro",
      title: "Directions that refuse to turn",
      body: "Apply a matrix to a fan of vectors. Most tips swing off their original rays. A few stay on the same line through the origin — those special directions are eigenvectors, scaled by an eigenvalue $\\lambda$ via $A\\mathbf{v}=\\lambda\\mathbf{v}$. The zero vector is never an eigenvector.",
      equation: "A\\mathbf{v} = \\lambda\\mathbf{v}",
      observation:
        "An eigenvalue of $-1$ reverses the arrow while keeping it on the same line. An eigenvalue of $0$ collapses length the way Lesson 7's determinant collapsed area.",
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
          kind: "connection",
          title: "An eigenspace is a null space — so it has a dimension",
          body: "The set of eigenvectors for a given $\\lambda$, together with $\\mathbf{0}$, is exactly $\\operatorname{Null}(A - \\lambda I)$ — a subspace in the sense of Lesson 8. So it has a **dimension**, called the *geometric multiplicity*, and Lesson 9 computes it without any guesswork: $\\dim\\operatorname{Null}(A - \\lambda I) = n - \\operatorname{rank}(A - \\lambda I)$. That number, not intuition, decides whether a repeated $\\lambda$ gives one line or a whole plane of directions.",
        },
        {
          kind: "connection",
          title: "And a full set of eigendirections is a basis — Lesson 10's payoff",
          body: "When the eigendirections are numerous and independent enough to form a basis, Lesson 10 says what happens: in that basis the map's matrix is $P^{-1}AP$, and because each basis vector is merely scaled, that matrix is **diagonal**. Diagonalization is not a new technique — it is change of basis, applied to the basis this lesson hunts for.",
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
          title: "Why det(A − λI) = 0? — determinant collapse from Lesson 7",
          body: "A nonzero direction can land on $\\mathbf{0}$ only if $A-\\lambda I$ flattens the plane. In Lesson 7 that was exactly what $\\det=0$ meant: the map collapses a dimension — and by Lesson 8 it means $\\operatorname{Null}(A-\\lambda I) \\ne \\{\\mathbf{0}\\}$, which is precisely the demand that a nonzero eigenvector exist. So the eigenvalues are the $\\lambda$ that make the auxiliary map singular.",
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
        "Do not guess — **compute**. The eigenspace is $\\operatorname{Null}(A-\\lambda I)$, and Lesson 9 gives its dimension as $n - \\operatorname{rank}(A-\\lambda I)$. For $\\begin{bmatrix} 3 & 1 \\\\ 0 & 3\\end{bmatrix}$ with $\\lambda = 3$: $A - 3I = \\begin{bmatrix} 0 & 1 \\\\ 0 & 0\\end{bmatrix}$ has rank $1$, so the eigenspace has dimension $2 - 1 = 1$ — one line, defective. For $3I$ the shifted matrix is $\\mathbf{0}$, rank $0$, so the dimension is $2$: the whole plane.",
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
          "Zero of the characteristic determinant is Lesson 7's collapse idea applied to $A-\\lambda I$ — equivalently, Lesson 8's statement that $\\operatorname{Null}(A-\\lambda I)$ is more than the origin.",
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
      // Uses Lesson 9's rank–nullity to SETTLE the repeated-eigenvalue case that
      // this lesson previously could only name. The prerequisite is now built, so
      // the distinction is computed rather than asserted.
      id: "eigen-geometric-multiplicity",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "Two matrices, one repeated eigenvalue each. Decide how many independent eigendirections each really has — by computing, not by looking.",
      config: {
        steps: [
          {
            kind: "numeric",
            prompt:
              "For $A=\\begin{bmatrix} 3 & 1 \\\\ 0 & 3 \\end{bmatrix}$ and $\\lambda = 3$, compute $\\operatorname{rank}(A - 3I)$.",
            expected: 1,
            explanation:
              "$A - 3I = \\begin{bmatrix} 0 & 1 \\\\ 0 & 0\\end{bmatrix}$: one nonzero row, so rank $1$.",
          },
          {
            kind: "numeric",
            prompt:
              "So what is $\\dim\\operatorname{Null}(A - 3I)$ — the number of independent eigendirections for $\\lambda = 3$?",
            expected: 1,
            explanation:
              "By rank–nullity (Lesson 9), $2 - 1 = 1$. The eigenvalue repeats twice in the characteristic polynomial but supplies only ONE line: the matrix is defective.",
          },
          {
            kind: "numeric",
            prompt:
              "Now $B = \\begin{bmatrix} 3 & 0 \\\\ 0 & 3 \\end{bmatrix}$, also with $\\lambda = 3$. What is $\\dim\\operatorname{Null}(B - 3I)$?",
            expected: 2,
            explanation:
              "$B - 3I = \\mathbf{0}$, which has rank $0$, so the nullity is $2 - 0 = 2$: every direction is an eigendirection. Same repeated eigenvalue as $A$, opposite answer — and the rank told you which without any hunting.",
          },
        ],
      },
    },
    {
      // The Lesson 10 payoff, made explicit: diagonalization IS change of basis.
      id: "eigen-diagonalization-is-change-of-basis",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "$A=\\begin{bmatrix} 3 & 1 \\\\ 0 & 2 \\end{bmatrix}$ has eigendirections $(1,0)$ and $(-1,1)$. Taking those as a basis $B$, what is $[A]_B = P^{-1}AP$?",
      choices: [
        "$\\begin{bmatrix} 3 & 1 \\\\ 0 & 2 \\end{bmatrix}$ — unchanged",
        "$\\begin{bmatrix} 3 & 0 \\\\ 0 & 2 \\end{bmatrix}$ — diagonal, with the eigenvalues on the diagonal",
        "$\\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}$ — the identity",
        "It cannot be computed without knowing $P^{-1}$ explicitly",
      ],
      correctChoice: 1,
      explanation:
        "In that basis each basis vector is merely scaled — $A(1,0) = 3(1,0)$ and $A(-1,1) = 2(-1,1)$ — so each column of $[A]_B$ has a single nonzero entry: its own eigenvalue. Diagonalization is not a separate technique; it is Lesson 10's change of basis applied to a basis of eigenvectors. (And by Lesson 10's invariants, $\\det$ and trace are unchanged: $6$ and $5$ either way.)",
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
