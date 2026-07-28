import type { LessonDefinition } from "./types";
import { EXERCISE_SEQUENCE_ID } from "./capabilities";

export const eigenvectorsLesson: LessonDefinition = {
  id: "eigenvectors",
  title: "Eigenvectors, Eigenvalues, and Diagonalization",
  subtitle:
    "Directions a map only scales — and the basis they build, when there are enough of them",
  learningObjectives: [
    "Identify eigenvectors as nonzero directions that stay on their own line, and eigenvalues as the signed scale",
    "Compute eigenvalues from $\\det(A-\\lambda I)=0$ and eigenspaces as $\\operatorname{Null}(A-\\lambda I)$",
    "Distinguish algebraic from geometric multiplicity, and compute the geometric one as $n - \\operatorname{rank}(A-\\lambda I)$",
    "Assemble $P$ and $D$ and verify $A = PDP^{-1}$ — diagonalization as a change of basis",
    "Use $A^k = PD^kP^{-1}$ to take a large power without repeated multiplication",
    "State the diagonalizability criterion and apply it before attempting the factorization",
    "Tell the two failure modes apart: a **defective** matrix has too few eigendirections; a rotation has none over $\\mathbb{R}$ at all",
    "Separate diagonalizability from invertibility — neither implies the other",
  ],
  motivatingQuestion:
    "Are there any directions a transformation can stretch without turning — and if you collect enough of them, what does the map look like in the language they build?",
  // Composed route: the worked derivation comes right after the check and the
  // "edge cases" section is deliberately placed *after* that computation — the
  // edge cases only make sense once you have seen the generic case worked out.
  route: [
    { kind: "motivate" },
    { kind: "visual", heading: "Most directions turn; a few do not" },
    { kind: "section", sectionId: "intro" },
    { kind: "formal", formalId: "def-eigen" },
    { kind: "check" },
    { kind: "formal", formalId: "thm-characteristic" },
    // The theorem's own justification, before the calculation that uses it: λ
    // as a dial, and the eigenvalues found as the places where det(A − λI)
    // crosses zero. A second clip because it does a job neither of the others
    // does — not because lessons are expected to have one animation each.
    {
      kind: "visual",
      sceneId: "eigenvectors-characteristic-equation",
      heading: "Why the eigenvalues are the roots of det(A − λI)",
    },
    { kind: "worked", workedId: "eigen-compute-distinct" },
    { kind: "section", sectionId: "multiplicities" },
    { kind: "formal", formalId: "prop-multiplicities" },
    { kind: "explore", tocLabel: "Hunt for invariant directions" },
    { kind: "section", sectionId: "diagonalize" },
    { kind: "formal", formalId: "thm-diagonalization" },
    { kind: "worked", workedId: "wex-diagonalize" },
    { kind: "check", checkpointId: "can-it-be-diagonalized" },
    { kind: "section", sectionId: "powers" },
    { kind: "formal", formalId: "cor-powers" },
    { kind: "worked", workedId: "wex-power" },
    { kind: "section", sectionId: "limits" },
    { kind: "worked", workedId: "wex-defective" },
    { kind: "section", sectionId: "edge" },
    { kind: "practice" },
    {
      kind: "summary",
      heading: "A basis of scaled directions — when there is one",
    },
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
      id: "multiplicities",
      title: "Two different ways to count an eigenvalue",
      body: "An eigenvalue can be counted twice over, and the two counts are not the same question. The **algebraic multiplicity** is how many times $\\lambda$ is a root of the characteristic polynomial — how often the factor $(\\lambda_0 - \\lambda)$ appears. The **geometric multiplicity** is how many independent eigendirections it actually supplies, which is the dimension of its eigenspace. Lesson 8 named that eigenspace ($\\operatorname{Null}(A - \\lambda I)$) and Lesson 9 makes its dimension computable: $n - \\operatorname{rank}(A - \\lambda I)$. The geometric count can fall short of the algebraic one — never exceed it — and everything in the rest of this lesson turns on whether it does.",
      equation:
        "\\text{geometric}(\\lambda) = \\dim\\operatorname{Null}(A - \\lambda I) = n - \\operatorname{rank}(A - \\lambda I) \\;\\le\\; \\text{algebraic}(\\lambda)",
      observation:
        "Two matrices can share a repeated eigenvalue and differ completely in what it gives them. Only a rank computation tells them apart.",
      layers: [
        {
          kind: "connection",
          title: "You already have the tool",
          body: "Nothing here is new machinery. The eigenspace is a null space (Lesson 8) and its dimension is rank–nullity applied to the shifted matrix (Lesson 9). What is new is the *question*: not “is there an eigendirection?” but “how many?”",
        },
      ],
    },
    {
      id: "diagonalize",
      title: "Collect enough of them and you have a basis",
      body: "Suppose the eigendirections are numerous and independent enough to form a basis of the whole space. Lesson 10 already says what happens next: describe the map in that basis and its matrix becomes $[A]_B = P^{-1}AP$, where $P$ has the basis vectors as columns. But now every basis vector is merely scaled, so each column of $[A]_B$ has a single nonzero entry — its own eigenvalue. The description is **diagonal**. Rearranged, $A = PDP^{-1}$: the map, written as *translate into the eigenbasis, scale each axis, translate back*.",
      equation:
        "A = PDP^{-1}, \\qquad P = [\\,\\mathbf{v}_1\\ \\mathbf{v}_2\\,], \\qquad D = \\begin{bmatrix} \\lambda_1 & 0 \\\\ 0 & \\lambda_2 \\end{bmatrix}",
      observation:
        "Diagonalization is not a new technique. It is Lesson 10's change of basis, applied to the one basis this lesson knows how to find.",
      layers: [
        {
          kind: "why",
          title: "Why the columns of $D$ come out so bare",
          body: "In the eigenbasis, $\\mathbf{v}_1$ has coordinates $(1,0)$. The map scales it by $\\lambda_1$, so its image has coordinates $(\\lambda_1, 0)$ — and by the columns rule (Lesson 2) that *is* the first column of $[A]_B$. Each basis vector goes to a multiple of itself, so each column carries one number: its own factor.",
        },
        {
          kind: "connection",
          title: "Distinct eigenvalues are always enough",
          body: "If the eigenvalues are distinct, their eigenvectors are automatically independent — so a $2\\times2$ matrix with two different real eigenvalues is *always* diagonalizable, with no further checking. The interesting cases are all repeated eigenvalues.",
        },
      ],
    },
    {
      id: "powers",
      title: "What the diagonal description buys you",
      body: "A diagonal matrix is trivial to raise to a power: multiply each diagonal entry by itself $k$ times, and nothing mixes. And because the $P$ and $P^{-1}$ in the middle of $A^k = (PDP^{-1})(PDP^{-1})\\cdots$ cancel in pairs, the whole product collapses to $PD^kP^{-1}$. So a hundredth power costs one diagonalization and two scalar powers, instead of ninety-nine matrix multiplications — and, more importantly, you can *read off* the long-run behaviour: whichever $|\\lambda|$ is largest dominates, and any $|\\lambda| < 1$ dies away.",
      equation:
        "A^k = P D^k P^{-1}, \\qquad D^k = \\begin{bmatrix} \\lambda_1^k & 0 \\\\ 0 & \\lambda_2^k \\end{bmatrix}",
      observation:
        "This is the first place eigenvalues stop being a curiosity and start being a prediction: repeated application of a map is governed by its eigenvalues, not by its entries.",
      layers: [
        {
          kind: "math-note",
          title: "Why the middle cancels",
          body: "$(PDP^{-1})(PDP^{-1}) = PD(P^{-1}P)DP^{-1} = PDIDP^{-1} = PD^2P^{-1}$, using only associativity and $P^{-1}P = I$ from Lesson 6. Repeating the argument $k$ times gives $A^k = PD^kP^{-1}$.",
        },
      ],
    },
    {
      id: "limits",
      title: "When there is no such basis",
      body: "The construction needs *enough* independent eigendirections to fill a basis, and that can fail — in two genuinely different ways. A matrix is **defective** when a repeated eigenvalue supplies fewer directions than its algebraic multiplicity: $\\begin{bmatrix} 3 & 1 \\\\ 0 & 3\\end{bmatrix}$ has $\\lambda = 3$ twice, but $\\operatorname{rank}(A - 3I) = 1$, so its eigenspace is a single line. There is no second independent direction to put in $P$, and no basis diagonalizes it. Separately, a rotation has **no real eigenvalues at all** — every direction turns — so the hunt fails before multiplicities are even in question. Both are “not diagonalizable”, and confusing them hides what actually went wrong.",
      equation:
        "\\text{diagonalizable over } \\mathbb{R} \\iff \\sum_{\\lambda \\text{ real}} \\text{geometric}(\\lambda) = n",
      observation:
        "The criterion is checkable *before* you attempt the factorization — which is the point of having it.",
      layers: [
        {
          kind: "looking-ahead",
          title: "What happens to the failures later",
          body: "Neither failure is the end of the story. Over $\\mathbb{C}$ a rotation does have eigenvalues, and its “rotation by an angle” structure is recovered rather than lost. Defective matrices get a near-diagonal normal form instead. And a different factorization — the singular value decomposition — applies to **every** matrix, square or not, at the cost of using two bases rather than one.",
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
  formalBlocks: [
    {
      id: "def-eigen",
      kind: "definition",
      label: "Eigenvector, eigenvalue, eigenspace",
      statement:
        "A **nonzero** vector $\\mathbf{v}$ is an **eigenvector** of $A$ with **eigenvalue** $\\lambda$ when $A\\mathbf{v} = \\lambda\\mathbf{v}$. For a fixed $\\lambda$, the **eigenspace** is $\\operatorname{Null}(A - \\lambda I)$ — every eigenvector for that $\\lambda$, together with $\\mathbf{0}$.",
      interpretation:
        "The eigenvector condition is about a *line*, not a direction: $\\lambda$ may be negative (the arrow flips) or zero (it collapses). Excluding $\\mathbf{0}$ matters — $A\\mathbf{0} = \\lambda\\mathbf{0}$ holds for every $\\lambda$, so admitting it would make every number an eigenvalue.",
      visibility: "visible",
      layers: [
        {
          kind: "connection",
          title: "The eigenspace is a subspace, so it has a dimension",
          body: "Writing the eigenspace as $\\operatorname{Null}(A - \\lambda I)$ is not a notational flourish: it makes the set an object Lesson 8 already understands, with a dimension Lesson 9 can compute. That dimension is what the rest of this lesson turns on.",
        },
      ],
    },
    {
      id: "thm-characteristic",
      kind: "theorem",
      label: "The characteristic equation",
      statement:
        "$\\lambda$ is an eigenvalue of $A$ **if and only if** $\\det(A - \\lambda I) = 0$.",
      interpretation:
        "Asking for a nonzero vector that $A - \\lambda I$ sends to $\\mathbf{0}$ is asking for that matrix to be singular — which is precisely what a zero determinant detects.",
      visibility: "visible",
      layers: [
        {
          kind: "math-note",
          title: "Both directions, in one line each",
          body: "$\\lambda$ is an eigenvalue $\\iff$ some $\\mathbf{v} \\ne \\mathbf{0}$ has $A\\mathbf{v} = \\lambda\\mathbf{v}$ $\\iff$ $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$ for some $\\mathbf{v} \\ne \\mathbf{0}$ $\\iff$ $\\operatorname{Null}(A - \\lambda I) \\ne \\{\\mathbf{0}\\}$ $\\iff$ $A - \\lambda I$ is not invertible (Lesson 6) $\\iff$ $\\det(A - \\lambda I) = 0$ (Lesson 7). Every step is an equivalence already proved, which is why this reads as a chain rather than an argument.",
        },
      ],
    },
    {
      id: "prop-multiplicities",
      kind: "proposition",
      label: "Algebraic vs geometric multiplicity",
      statement:
        "For each real eigenvalue $\\lambda$, $\\;1 \\le \\text{geometric}(\\lambda) \\le \\text{algebraic}(\\lambda)$, where the geometric multiplicity is $\\dim\\operatorname{Null}(A - \\lambda I) = n - \\operatorname{rank}(A - \\lambda I)$ and the algebraic multiplicity is the number of times $\\lambda$ repeats as a root of $\\det(A - \\lambda I) = 0$.",
      interpretation:
        "An eigenvalue always supplies at least one direction (otherwise it would not be an eigenvalue), and never more than its algebraic count. When the inequality is **strict**, the matrix is *defective* — and that gap is the only thing that can spoil diagonalization once real eigenvalues exist.",
      visibility: "revealed",
      layers: [
        {
          kind: "math-note",
          title: "Why at least one",
          body: "If $\\det(A - \\lambda I) = 0$ then $A - \\lambda I$ is singular, so by Lesson 8 its null space is bigger than $\\{\\mathbf{0}\\}$ — it contains a nonzero vector, i.e. an eigenvector. So the geometric multiplicity is at least $1$ for every eigenvalue.",
        },
      ],
    },
    {
      id: "thm-diagonalization",
      kind: "theorem",
      label: "Diagonalization",
      statement:
        "$A$ is **diagonalizable** over $\\mathbb{R}$ — meaning $A = PDP^{-1}$ for some invertible $P$ and diagonal $D$ — **if and only if** its eigenvectors span the whole space, equivalently the geometric multiplicities of its real eigenvalues sum to $n$. Then $P$'s columns are those eigenvectors and $D$'s diagonal holds the matching eigenvalues, in the same order. In particular, $n$ **distinct** real eigenvalues always suffice.",
      interpretation:
        "The factorization is not something you attempt and hope for — the criterion is a rank computation you can do first. And the order matters only in that $P$ and $D$ must agree: swap two columns of $P$ and you must swap the two diagonal entries too.",
      visibility: "visible",
      layers: [
        {
          kind: "math-note",
          title: "Why it works, and why distinct eigenvalues are enough",
          body: "Take a basis of eigenvectors and let $P$ have them as columns. Then $AP$ has columns $A\\mathbf{v}_j = \\lambda_j\\mathbf{v}_j$, which is exactly $PD$ with $D = \\operatorname{diag}(\\lambda_j)$. So $AP = PD$, and since $P$ is invertible (its columns are a basis), $A = PDP^{-1}$. For the distinct case: suppose $\\mathbf{v}_1, \\mathbf{v}_2$ have different eigenvalues and $c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2 = \\mathbf{0}$. Apply $A$ and also multiply the relation by $\\lambda_1$; subtracting gives $c_2(\\lambda_2 - \\lambda_1)\\mathbf{v}_2 = \\mathbf{0}$, and since $\\lambda_2 \\ne \\lambda_1$ and $\\mathbf{v}_2 \\ne \\mathbf{0}$, $c_2 = 0$; then $c_1 = 0$ too. Distinct eigenvalues force independence.",
        },
        {
          kind: "trap",
          title: "$P$ and $D$ are not unique",
          body: "Reordering the eigenvectors reorders the diagonal; scaling an eigenvector by any nonzero constant leaves it an eigenvector and changes $P$ without changing $D$. So “the” diagonalization is really *a* diagonalization — what is determined is the **multiset of eigenvalues**, not the factorization.",
        },
      ],
    },
    {
      id: "cor-powers",
      kind: "corollary",
      label: "Powers of a diagonalizable map",
      statement:
        "If $A = PDP^{-1}$ then $A^k = PD^kP^{-1}$ for every integer $k \\ge 0$, where $D^k$ raises each diagonal entry to the $k$-th power.",
      interpretation:
        "Repeated application of a map is governed by its eigenvalues. The largest $|\\lambda|$ dominates as $k$ grows; any $|\\lambda| < 1$ decays to nothing. That is why eigenvalues predict long-run behaviour without simulating it.",
      visibility: "visible",
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
  checkpoints: [
    {
      id: "can-it-be-diagonalized",
      prompt:
        "A $2\\times2$ matrix has the single eigenvalue $\\lambda = 5$, repeated. Without computing $P$, what one number decides whether it can be diagonalized — and what are the two possible answers?",
      answer:
        "The **geometric multiplicity** of $5$, i.e. $\\dim\\operatorname{Null}(A - 5I) = 2 - \\operatorname{rank}(A - 5I)$. If $\\operatorname{rank}(A - 5I) = 0$ the matrix is $5I$ itself: the eigenspace is the whole plane, every direction works, and it is already diagonal. If $\\operatorname{rank}(A - 5I) = 1$ the eigenspace is a single line, there is no second independent eigenvector to put in $P$, and the matrix is **defective** — not diagonalizable. One rank computation settles it, before any factorization is attempted.",
    },
  ],
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
    {
      id: "wex-diagonalize",
      title: "Assemble P and D, then check",
      prompt:
        "For $A=\\begin{bmatrix} 3 & 1 \\\\ 0 & 2 \\end{bmatrix}$ you already found the eigenpairs. Build the factorization and verify it.",
      exampleId: "eigen-distinct",
      equations: [
        "\\lambda_1 = 3,\\; \\mathbf{v}_1 = \\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix}; \\qquad \\lambda_2 = 2,\\; \\mathbf{v}_2 = \\begin{bmatrix} -1 \\\\ 1 \\end{bmatrix}",
        "P = \\begin{bmatrix} 1 & -1 \\\\ 0 & 1 \\end{bmatrix}, \\qquad D = \\begin{bmatrix} 3 & 0 \\\\ 0 & 2 \\end{bmatrix}, \\qquad P^{-1} = \\begin{bmatrix} 1 & 1 \\\\ 0 & 1 \\end{bmatrix}",
        "PD = \\begin{bmatrix} 1 & -1 \\\\ 0 & 1 \\end{bmatrix}\\begin{bmatrix} 3 & 0 \\\\ 0 & 2 \\end{bmatrix} = \\begin{bmatrix} 3 & -2 \\\\ 0 & 2 \\end{bmatrix}",
        "PDP^{-1} = \\begin{bmatrix} 3 & -2 \\\\ 0 & 2 \\end{bmatrix}\\begin{bmatrix} 1 & 1 \\\\ 0 & 1 \\end{bmatrix} = \\begin{bmatrix} 3 & 1 \\\\ 0 & 2 \\end{bmatrix} = A \\;\\checkmark",
        "\\det: 6 = 6 \\;\\checkmark \\qquad \\operatorname{tr}: 5 = 5 \\;\\checkmark",
      ],
      equationsAriaLabel:
        "Putting the two eigenvectors into P as columns and the two eigenvalues into D, the product P D P inverse multiplies out to A exactly. Determinant and trace agree, as change of basis requires.",
      layers: [
        {
          kind: "connection",
          title: "The columns of P must match the diagonal of D",
          body: "$P$'s first column is the eigenvector for $D$'s first diagonal entry. Swap the columns of $P$ without swapping the diagonal and the identity breaks — that pairing is the whole content of the factorization.",
        },
      ],
    },
    {
      id: "wex-power",
      title: "A fifth power, without multiplying five times",
      prompt:
        "Use the factorization to compute $A^5$ for the same $A$, then check the first column against direct multiplication.",
      exampleId: "eigen-distinct",
      equations: [
        "A^5 = P D^5 P^{-1}, \\qquad D^5 = \\begin{bmatrix} 3^5 & 0 \\\\ 0 & 2^5 \\end{bmatrix} = \\begin{bmatrix} 243 & 0 \\\\ 0 & 32 \\end{bmatrix}",
        "P D^5 = \\begin{bmatrix} 1 & -1 \\\\ 0 & 1 \\end{bmatrix}\\begin{bmatrix} 243 & 0 \\\\ 0 & 32 \\end{bmatrix} = \\begin{bmatrix} 243 & -32 \\\\ 0 & 32 \\end{bmatrix}",
        "A^5 = \\begin{bmatrix} 243 & -32 \\\\ 0 & 32 \\end{bmatrix}\\begin{bmatrix} 1 & 1 \\\\ 0 & 1 \\end{bmatrix} = \\begin{bmatrix} 243 & 211 \\\\ 0 & 32 \\end{bmatrix}",
        "\\text{Check: } A^2 = \\begin{bmatrix} 9 & 5 \\\\ 0 & 4\\end{bmatrix},\\; A^3 = \\begin{bmatrix} 27 & 19 \\\\ 0 & 8\\end{bmatrix},\\; A^4 = \\begin{bmatrix} 81 & 65 \\\\ 0 & 16\\end{bmatrix},\\; A^5 = \\begin{bmatrix} 243 & 211 \\\\ 0 & 32\\end{bmatrix} \\;\\checkmark",
        "\\text{As } k \\to \\infty: \\; 3^k \\text{ dominates } 2^k, \\text{ so the } \\lambda = 3 \\text{ direction takes over}",
      ],
      equationsAriaLabel:
        "Raising the diagonal matrix to the fifth power gives 243 and 32 on the diagonal. Sandwiching between P and P inverse gives A to the fifth as the matrix with entries 243, 211, 0, 32 — the same answer repeated multiplication gives. For large k the eigenvalue 3 dominates.",
      layers: [
        {
          kind: "why",
          title: "The prediction is the point, not the arithmetic saving",
          body: "For a $2\\times2$ fifth power the shortcut barely saves effort. What it *buys* is the last line: the behaviour of $A^k$ for large $k$ is decided by the largest $|\\lambda|$, and you can see that without computing anything. Whether a repeated process grows, settles, or dies is an eigenvalue question.",
        },
      ],
    },
    {
      id: "wex-defective",
      title: "A matrix that cannot be diagonalized",
      prompt:
        "Try the same construction on $A=\\begin{bmatrix} 3 & 1 \\\\ 0 & 3 \\end{bmatrix}$ and find where it breaks.",
      equations: [
        "\\det(A - \\lambda I) = (3-\\lambda)^2 = 0 \\;\\Rightarrow\\; \\lambda = 3 \\text{ with algebraic multiplicity } 2",
        "A - 3I = \\begin{bmatrix} 0 & 1 \\\\ 0 & 0 \\end{bmatrix}, \\qquad \\operatorname{rank}(A - 3I) = 1",
        "\\text{geometric}(3) = n - \\operatorname{rank}(A - 3I) = 2 - 1 = 1",
        "1 = \\text{geometric} \\;<\\; \\text{algebraic} = 2 \\;\\Rightarrow\\; \\text{not diagonalizable}",
        "\\text{Eigenspace} = \\operatorname{span}\\left\\{\\begin{bmatrix} 1 \\\\ 0\\end{bmatrix}\\right\\} \\text{— one line, so } P \\text{ has no second column}",
      ],
      equationsAriaLabel:
        "The characteristic polynomial has a double root at 3, but the shifted matrix has rank 1, so the eigenspace has dimension 1. Geometric multiplicity is less than algebraic, so no basis of eigenvectors exists and the matrix is not diagonalizable.",
      layers: [
        {
          kind: "trap",
          title: "The failure is not that eigenvectors are missing",
          body: "There *is* an eigenvector — $(1,0)$ — and $\\lambda = 3$ is a perfectly good eigenvalue. What is missing is a **second independent** one, so $P$ cannot be filled. Compare $3I$: same repeated eigenvalue, but $\\operatorname{rank}(3I - 3I) = 0$, geometric multiplicity $2$, and every direction is an eigendirection.",
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
    {
      id: "singular-not-defective",
      title: "“A singular matrix cannot be diagonalized”",
      belief:
        "Diagonalizing needs $P^{-1}$, and a collapsing matrix has no inverse, so a singular matrix must be undiagonalizable.",
      confront:
        "The invertibility that matters is $P$'s, not $A$'s. Take $\\begin{bmatrix} 2 & 4 \\\\ 1 & 2\\end{bmatrix}$: it is singular ($\\det = 0$), yet its eigenvalues are $4$ and $0$ — distinct — so it has two independent eigenvectors and diagonalizes perfectly, with $D = \\begin{bmatrix} 4 & 0 \\\\ 0 & 0\\end{bmatrix}$.",
      resolve:
        "Diagonalizability and invertibility are independent properties. A zero eigenvalue makes $A$ singular but is a perfectly ordinary diagonal entry; conversely the defective $\\begin{bmatrix} 3 & 1 \\\\ 0 & 3\\end{bmatrix}$ is invertible ($\\det = 9$) and **not** diagonalizable. Neither property implies the other.",
      exampleId: "singular-collapse",
    },
    {
      id: "algebraic-is-geometric",
      title: "“A double eigenvalue gives two eigendirections”",
      belief:
        "If $\\lambda$ is a root twice, it should contribute two independent directions.",
      confront:
        "$\\begin{bmatrix} 3 & 1 \\\\ 0 & 3\\end{bmatrix}$ and $\\begin{bmatrix} 3 & 0 \\\\ 0 & 3\\end{bmatrix}$ both have $\\lambda = 3$ twice. The first has $\\operatorname{rank}(A - 3I) = 1$, so one direction; the second has rank $0$, so two. Same repeated eigenvalue, opposite answers.",
      resolve:
        "Algebraic multiplicity counts roots of a polynomial; geometric multiplicity counts dimensions of a null space. The second is never larger, and can be strictly smaller. Compute it — $n - \\operatorname{rank}(A - \\lambda I)$ — rather than reading it off the characteristic polynomial.",
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
    {
      // Produced diagonalization on a FRESH matrix: build P and D, then verify.
      id: "eigen-build-pd-fresh",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "A fresh matrix: $A = \\begin{bmatrix} 4 & 2 \\\\ 1 & 3 \\end{bmatrix}$, whose eigenvalues are $5$ and $2$. Build its diagonalization.",
      config: {
        steps: [
          {
            kind: "vector",
            prompt:
              "Find an eigenvector for $\\lambda = 5$ by solving $(A - 5I)\\mathbf{v} = \\mathbf{0}$. Enter the one whose first coordinate is $2$.",
            expected: [2, 1],
            explanation:
              "$A - 5I = \\begin{bmatrix} -1 & 2 \\\\ 1 & -2\\end{bmatrix}$, so $-x + 2y = 0$, i.e. $x = 2y$. With $x = 2$: $\\mathbf{v} = (2, 1)$. Check: $A(2,1) = (10, 5) = 5(2,1)$.",
          },
          {
            kind: "vector",
            prompt:
              "Now $\\lambda = 2$: solve $(A - 2I)\\mathbf{v} = \\mathbf{0}$ and enter the one whose first coordinate is $1$.",
            expected: [1, -1],
            explanation:
              "$A - 2I = \\begin{bmatrix} 2 & 2 \\\\ 1 & 1\\end{bmatrix}$, so $x + y = 0$. With $x = 1$: $\\mathbf{v} = (1, -1)$. Check: $A(1,-1) = (2, -2) = 2(1,-1)$.",
          },
          {
            kind: "numeric",
            prompt:
              "You now have $P = \\begin{bmatrix} 2 & 1 \\\\ 1 & -1\\end{bmatrix}$. What is the $(1,1)$ entry of $D$?",
            expected: 5,
            explanation:
              "$D$'s diagonal must match $P$'s columns in order, and $P$'s first column is the $\\lambda = 5$ eigenvector — so $D = \\begin{bmatrix} 5 & 0 \\\\ 0 & 2\\end{bmatrix}$. Two distinct real eigenvalues, so the eigenvectors are automatically independent and this always works.",
          },
        ],
      },
    },
    {
      id: "eigen-power-shortcut",
      type: "numeric",
      tier: "drill",
      prompt:
        "For $A = \\begin{bmatrix} 3 & 1 \\\\ 0 & 2 \\end{bmatrix}$ with $D = \\begin{bmatrix} 3 & 0 \\\\ 0 & 2 \\end{bmatrix}$, what is the $(1,1)$ entry of $A^{5}$?",
      expected: 243,
      tolerance: 1e-9,
      explanation:
        "$A^5 = PD^5P^{-1}$ and $D^5 = \\operatorname{diag}(3^5, 2^5) = \\operatorname{diag}(243, 32)$; carrying out the sandwich gives $A^5 = \\begin{bmatrix} 243 & 211 \\\\ 0 & 32\\end{bmatrix}$. Multiplying $A$ by itself five times gives the same thing — the shortcut is a saving, but the real payoff is seeing that $3^k$ eventually dwarfs $2^k$.",
    },
    {
      id: "eigen-criterion-before-factoring",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt:
        "Decide diagonalizability for $A = \\begin{bmatrix} 7 & 1 \\\\ 0 & 7 \\end{bmatrix}$ **before** attempting any factorization.",
      config: {
        steps: [
          {
            kind: "numeric",
            prompt:
              "What is the algebraic multiplicity of $\\lambda = 7$? (Its characteristic polynomial is $(7-\\lambda)^2$.)",
            expected: 2,
            explanation: "$(7-\\lambda)^2$ has $7$ as a double root, so the algebraic multiplicity is $2$.",
          },
          {
            kind: "numeric",
            prompt:
              "Compute $\\operatorname{rank}(A - 7I)$, where $A - 7I = \\begin{bmatrix} 0 & 1 \\\\ 0 & 0\\end{bmatrix}$.",
            expected: 1,
            explanation: "One nonzero row, so one pivot: rank $1$.",
          },
          {
            kind: "multiple-choice",
            prompt: "So is $A$ diagonalizable over $\\mathbb{R}$?",
            choices: [
              "Yes — it has a repeated real eigenvalue",
              "No — the geometric multiplicity is $2 - 1 = 1 < 2$, so there is no basis of eigenvectors",
              "Yes — every triangular matrix is diagonalizable",
              "Cannot be decided without computing $P$",
            ],
            correctChoice: 1,
            explanation:
              "Geometric multiplicity $= 2 - \\operatorname{rank}(A - 7I) = 1$, short of the algebraic multiplicity $2$. The eigenspace is a single line, so $P$ has no second column: the matrix is defective. Note this was settled by a rank computation, with no factorization attempted — and note that $A$ is invertible ($\\det = 49$), so invertibility did not help.",
          },
        ],
      },
    },
    {
      id: "eigen-two-failure-modes",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "$\\begin{bmatrix} 3 & 1 \\\\ 0 & 3\\end{bmatrix}$ and $\\begin{bmatrix} 0 & -1 \\\\ 1 & 0\\end{bmatrix}$ are both non-diagonalizable over $\\mathbb{R}$. How do the two failures differ?",
      choices: [
        "They do not — both simply lack eigenvectors",
        "The first has a real eigenvalue but too few independent eigendirections; the second has no real eigenvalues at all",
        "The first has no real eigenvalues; the second is defective",
        "Both are singular, which is what causes the failure",
      ],
      correctChoice: 1,
      explanation:
        "The first is **defective**: $\\lambda = 3$ exists and supplies one direction where two are needed. The second is a rotation — every direction turns, so the hunt fails before multiplicities are even in question (its characteristic polynomial has no real roots). Both are “not diagonalizable”, but only one has an eigenvalue to talk about. Neither is singular: their determinants are $9$ and $1$.",
    },
    {
      id: "eigen-diagonalizable-vs-invertible",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "Which statement is correct about diagonalizability and invertibility?",
      choices: [
        "Diagonalizable implies invertible",
        "Invertible implies diagonalizable",
        "Neither implies the other",
        "They are equivalent for $2\\times2$ matrices",
      ],
      correctChoice: 2,
      explanation:
        "$\\begin{bmatrix} 2 & 4 \\\\ 1 & 2\\end{bmatrix}$ is singular ($\\det = 0$) yet diagonalizable — its eigenvalues $4$ and $0$ are distinct, so it has two independent eigenvectors, and a zero eigenvalue is an ordinary diagonal entry. Conversely $\\begin{bmatrix} 3 & 1 \\\\ 0 & 3\\end{bmatrix}$ is invertible ($\\det = 9$) yet defective. The invertibility that diagonalization needs is $P$'s, not $A$'s.",
    },
  ],
  keyTakeaway:
    "An eigenvector is a nonzero direction the map only scales; its eigenvalue is the signed factor. Find the eigenvalues from $\\det(A-\\lambda I)=0$ and each eigenspace as $\\operatorname{Null}(A-\\lambda I)$, whose dimension — the geometric multiplicity — is $n - \\operatorname{rank}(A-\\lambda I)$. When those dimensions add up to $n$, the eigenvectors form a basis, and describing the map in it makes the matrix diagonal: $A = PDP^{-1}$, so $A^k = PD^kP^{-1}$ and the largest $|\\lambda|$ governs the long run. When they fall short the matrix is **defective**, and when there are no real eigenvalues at all — a rotation — the hunt fails earlier still. Diagonalizability and invertibility are independent: neither implies the other.",
  structuredSummary: {
    coreMentalModel:
      "Find the directions the map merely scales. If there are enough of them to form a basis, the map is just a stretch along each one.",
    definitionsIntroduced: [
      "Eigenvector, eigenvalue, and eigenspace $\\operatorname{Null}(A-\\lambda I)$",
      "Algebraic vs geometric multiplicity; diagonalizable and defective matrices",
    ],
    mainResult:
      "$A = PDP^{-1}$ exactly when the geometric multiplicities sum to $n$ (distinct eigenvalues always suffice); then $A^k = PD^kP^{-1}$.",
    representationsConnected:
      "Invariant lines (picture) ↔ $\\det(A-\\lambda I)=0$ and a null space (symbol) ↔ a diagonal description in the eigenbasis (Lesson 10).",
    commonMistake:
      "Reading a repeated eigenvalue as two eigendirections, or tying diagonalizability to invertibility — neither implies the other.",
    canonicalExample:
      "$A = \\begin{bmatrix} 3 & 1 \\\\ 0 & 2\\end{bmatrix}$: $P = \\begin{bmatrix} 1 & -1 \\\\ 0 & 1\\end{bmatrix}$, $D = \\begin{bmatrix} 3 & 0 \\\\ 0 & 2\\end{bmatrix}$, and $A^5 = \\begin{bmatrix} 243 & 211 \\\\ 0 & 32\\end{bmatrix}$.",
    oneProblemWorthRemembering:
      "Given a repeated eigenvalue, decide diagonalizability from $n - \\operatorname{rank}(A-\\lambda I)$ before attempting any factorization.",
    whatThisUnlocksNext:
      "Two failure modes with two different rescues: complex eigenvalues for rotations, and — for every matrix, square or not — the singular value decomposition's two bases instead of one.",
  },
};
