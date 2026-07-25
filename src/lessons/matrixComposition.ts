import type { LessonDefinition } from "./types";
import { COMPOSITION_FRESH as FRESH, LINEAR_SYSTEM_EXAMPLE as SYS } from "./exampleData";
import {
  CONSTRUCT_IN_EXPLORER_ID,
  EXERCISE_SEQUENCE_ID,
  MATRIX_ENTRY_ID,
  SELF_CHECK_ID,
} from "./capabilities";

/**
 * Lesson: "Matrix Composition & Inverses" (spine L6).
 *
 * Built on the PASS contract
 * `docs/courses/linear-algebra/lessons/06-matrix-composition/insight.md` and the
 * plan `.../lesson-plan.md`.
 *
 * Primary insight (preserved from Stage 2): a matrix is a record of where the
 * basis lands, so "do B, then A" needs no new definition — column j of AB is A
 * applied to column j of B. The entry recipe, the failure of AB = BA in general,
 * and associativity are all consequences. Run the question backwards and A^-1 is
 * the matrix of preimages of the basis, which exist exactly when nothing
 * collapsed (ad - bc != 0). Composition being function composition, undoing a
 * sequence runs backwards: (AB)^-1 = B^-1 A^-1.
 *
 * Continuity: A is `shear-2-1`, the SAME map Lesson 2 sheared and Lesson 7 will
 * measure; R is `rotation`; the collapse case is `singular-collapse`, already met
 * in Lesson 2 and foreshadowed by Lesson 5's null space. The inverse is put to
 * work re-solving Lesson 3's system, and the answer (2, -1) must match the one
 * elimination produced in Lesson 4.
 *
 * Scope boundary (contract §1g): ad - bc appears here ONLY as the invertibility
 * detector. Its meaning as signed area is Lesson 7's job and is deliberately
 * withheld.
 */

const A_TEX = "\\begin{bmatrix} 2 & 1 \\\\ 0 & 1 \\end{bmatrix}";
const R_TEX = "\\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}";
const AR_TEX = "\\begin{bmatrix} 1 & -2 \\\\ 1 & 0 \\end{bmatrix}";
const RA_TEX = "\\begin{bmatrix} 0 & -1 \\\\ 2 & 1 \\end{bmatrix}";

const M_TEX = "\\begin{bmatrix} 3 & 1 \\\\ -1 & 2 \\end{bmatrix}";
const N_TEX = "\\begin{bmatrix} 2 & 0 \\\\ 1 & 4 \\end{bmatrix}";
const K_TEX = "\\begin{bmatrix} 3 & 1 \\\\ 2 & 1 \\end{bmatrix}";

export const matrixCompositionLesson: LessonDefinition = {
  id: "matrix-composition",
  title: "Matrix Composition & Inverses",
  subtitle:
    "Column $j$ of $AB$ is $A$ applied to column $j$ of $B$ — and an inverse asks that question backwards",
  exampleId: "shear-2-1",
  learningObjectives: [
    "Produce column $j$ of a product as $A$ applied to column $j$ of $B$, and say in words what it is",
    "Derive the row-times-column recipe instead of memorizing it, and compute a full product from it",
    "State that $AB$ applies $B$ first, and use that order correctly",
    "Produce a counterexample to $AB = BA$, and name the matrices that do commute",
    "Build $A^{-1}$ by solving $A\\mathbf{x} = \\mathbf{e}_1$ and $A\\mathbf{x} = \\mathbf{e}_2$, then verify $AA^{-1} = I$",
    "Decide invertibility from collapse rather than from a formula, and exhibit the null vector when a map is singular",
    "Use $\\det = ad - bc \\ne 0$ as the invertibility test, without yet claiming what the number means",
    "Invert a composite in the correct, reversed order: $(AB)^{-1} = B^{-1}A^{-1}$",
    "Solve $A\\mathbf{x} = \\mathbf{b}$ as $A^{-1}\\mathbf{b}$ and reconcile it with the elimination answer",
  ],
  motivatingQuestion:
    "You shear the plane, then rotate it. Is the result something a single matrix could have done in one step — and if so, which four numbers?",
  route: [
    { kind: "motivate" },
    { kind: "section", sectionId: "two-maps" },
    // Watch: apply B, then A → one matrix does both → the columns → order →
    // undo → the map with nothing to undo.
    { kind: "visual" },
    { kind: "section", sectionId: "where-basis-lands" },
    { kind: "formal", formalId: "def-product" },
    { kind: "worked", workedId: "wex-product-columns" },
    { kind: "section", sectionId: "recipe" },
    { kind: "section", sectionId: "order" },
    { kind: "check" },
    { kind: "formal", formalId: "prop-algebra" },
    { kind: "worked", workedId: "wex-order" },
    { kind: "section", sectionId: "undo" },
    { kind: "formal", formalId: "def-inverse" },
    { kind: "worked", workedId: "wex-inverse" },
    { kind: "section", sectionId: "when-undo-fails" },
    { kind: "check", checkpointId: "undo-impossible" },
    { kind: "formal", formalId: "thm-invertibility" },
    { kind: "explore", tocLabel: "Compose two maps, then try to undo them" },
    { kind: "section", sectionId: "reverse" },
    { kind: "formal", formalId: "prop-reversal" },
    { kind: "practice" },
    {
      kind: "summary",
      heading: "Follow the basis twice; run it backwards to undo",
    },
  ],
  sections: [
    {
      id: "two-maps",
      title: "Two moves, or one?",
      body: "Lesson 5 closed on a statement about *one system*: it has exactly one solution when $\\operatorname{Null}(A) = \\{\\mathbf{0}\\}$. Turn that into a statement about the **map** and something new appears — a map that loses nothing can be *run backwards*. Before we can ask that, we need to be able to combine maps at all. Shear the plane with $A = " + A_TEX + "$, then rotate it a quarter turn with $R = " + R_TEX + "$. Every point has moved twice. Is the total effect something a single matrix could have produced?",
      observation:
        "It must be. Applying two linear maps in a row keeps grid lines straight and evenly spaced, so the result is linear — and every linear map of the plane is a matrix.",
      layers: [
        {
          kind: "why",
          title: "Why the composite is linear",
          body: "If $S$ and $T$ are linear then $S(T(x\\mathbf{u} + y\\mathbf{v})) = S(x\\,T\\mathbf{u} + y\\,T\\mathbf{v}) = x\\,S(T\\mathbf{u}) + y\\,S(T\\mathbf{v})$. Combinations survive both maps, so they survive the pair. That is the whole argument, and it is what entitles us to look for a matrix at all.",
        },
      ],
    },
    {
      id: "where-basis-lands",
      title: "Ask the only question a matrix answers",
      body: "Lesson 2 established that a matrix **is** a record of where the basis lands: $\\operatorname{col}_j(A) = A\\mathbf{e}_j$. So we already know how to find the composite's matrix — ask the same question one more time. Under \"apply $R$, then $A$\", the basis vector $\\mathbf{e}_j$ travels $\\mathbf{e}_j \\mapsto R\\mathbf{e}_j \\mapsto A(R\\mathbf{e}_j)$. Wherever it stops **is** column $j$ of the composite. Nothing is being defined here; something is being *computed*.",
      equation:
        "\\operatorname{col}_j(AB) \\;=\\; A\\,\\operatorname{col}_j(B)",
      observation:
        "Watch the animation once more with this in mind: the two basis arrows are not decoration. Their landing points are literally the two columns of the product.",
      layers: [
        {
          kind: "connection",
          title: "This is Lesson 2, fired twice",
          body: "Lesson 2 asked “where does the basis land?” once and got the columns rule. Asking it after two maps instead of one gives the entire product. No second principle is involved — which is why there is no separate rule to remember.",
        },
      ],
    },
    {
      id: "recipe",
      title: "The row-times-column recipe, derived",
      body: "Write it out. Column 1 of $B$ is $\\begin{bmatrix} b_{11} \\\\ b_{21} \\end{bmatrix}$, and applying $A$ to it gives $\\begin{bmatrix} a_{11}b_{11} + a_{12}b_{21} \\\\ a_{21}b_{11} + a_{22}b_{21} \\end{bmatrix}$. That is exactly “run along row $i$ of $A$, down column $j$ of $B$, multiply and add”. The famous recipe is not a rule; it is what $A\\,\\operatorname{col}_j(B)$ looks like when you expand it.",
      equation:
        "(AB)_{ij} \\;=\\; \\sum_k A_{ik}B_{kj} \\quad \\text{— the expansion of } A\\,\\operatorname{col}_j(B)",
      observation:
        "Note what this rules out: the $(1,1)$ entry mixes a whole row of $A$ with a whole column of $B$. It is never $a_{11}b_{11}$.",
    },
    {
      id: "order",
      title: "Why order matters",
      body: "\"Push $B$'s columns through $A$\" and \"push $A$'s columns through $B$\" are different questions, so they generally have different answers. With our two maps, $AR = " + AR_TEX + "$ but $RA = " + RA_TEX + "$ — and the plane visibly lands somewhere else. This is the first place the word *multiplication* misleads: numbers commute, maps do not. **But \"in general\" is not \"always\"**: the identity commutes with everything, so does any multiple of it, so do two rotations, and so does any matrix with its own powers.",
      equation: "AR = " + AR_TEX + " \\;\\ne\\; " + RA_TEX + " = RA",
      layers: [
        {
          kind: "trap",
          title: "$AB$ applies $B$ first",
          body: "The notation runs right to left, like function composition $f(g(x))$: the map nearest the vector acts first. So $AB\\mathbf{x}$ means “$B$ moves $\\mathbf{x}$, then $A$ moves the result”. Reading $AB$ left-to-right as “$A$ then $B$” is the single most common source of a wrong product.",
        },
      ],
    },
    {
      id: "undo",
      title: "Running the question backwards",
      body: "Now the question Lesson 5 set up. To undo $A$ we need a map $A^{-1}$ with $A^{-1}A = I$, where $I = \\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}$ is the do-nothing map. Ask our one question about $A^{-1}$: where must **its** columns be? Since $AA^{-1} = I$ means $A\\,\\operatorname{col}_j(A^{-1}) = \\mathbf{e}_j$, column $j$ of $A^{-1}$ is precisely **the solution of $A\\mathbf{x} = \\mathbf{e}_j$**. Building an inverse is therefore solving two systems you already know how to solve.",
      equation:
        "\\operatorname{col}_j(A^{-1}) \\text{ solves } A\\mathbf{x} = \\mathbf{e}_j, \\qquad A^{-1}A = AA^{-1} = I",
      observation:
        "With $A^{-1}$ in hand, $A\\mathbf{x} = \\mathbf{b}$ becomes $\\mathbf{x} = A^{-1}\\mathbf{b}$: one inverse answers every right-hand side, where each elimination answers one.",
      layers: [
        {
          kind: "trap",
          title: "Structurally right, computationally wrong",
          body: "“One inverse answers every $\\mathbf{b}$” is a statement about *structure*, not a recommended algorithm. To solve a single system, elimination is both cheaper and numerically better behaved than forming $A^{-1}$ and multiplying. The inverse earns its place as an object of theory — and as the bridge to the next lessons — not as the way you would actually compute one answer.",
        },
      ],
    },
    {
      id: "when-undo-fails",
      title: "When there is nothing to undo",
      body: "Some maps cannot be undone, and the reason is not algebraic bad luck — it is **lost information**. If $A$'s columns are dependent, the plane collapses onto a line. Then two distinct inputs land on the same output: whenever $\\mathbf{u} - \\mathbf{v}$ is a nonzero vector in $\\operatorname{Null}(A)$, $A\\mathbf{u} = A\\mathbf{v}$. An undo would have to look at that single image point and *choose* which of the two to return to. No function can do that — not just no matrix. So invertibility is exactly Lesson 5's condition, $\\operatorname{Null}(A) = \\{\\mathbf{0}\\}$, promoted from one system to the whole map.",
      equation:
        "\\mathbf{u} \\ne \\mathbf{v}, \\quad \\mathbf{u} - \\mathbf{v} \\in \\operatorname{Null}(A) \\;\\Longrightarrow\\; A\\mathbf{u} = A\\mathbf{v}",
      observation:
        "For a $2\\times2$ matrix, that condition has a compact test: $ad - bc \\ne 0$. This lesson uses that number only as a yes/no detector — what it *measures* is the next lesson's subject.",
      layers: [
        {
          kind: "looking-ahead",
          title: "You have just met the determinant, unnamed",
          body: "The quantity $ad - bc$ falls out of solving $A\\mathbf{x} = \\mathbf{e}_j$: it is the denominator, so it must be nonzero. Lesson 7 gives it a name and, more importantly, a *meaning* — it turns out to measure how much the map scales area, and its sign records orientation. Right now, resist reading anything into it beyond “zero means collapsed”.",
        },
      ],
    },
    {
      id: "reverse",
      title: "Undoing a sequence runs backwards",
      body: "If you put on socks and then shoes, you take off shoes and then socks. The same is true of maps, and now it is provable rather than memorable: $(AB)(B^{-1}A^{-1}) = A(BB^{-1})A^{-1} = AIA^{-1} = I$, using only associativity and the identity. So $(AB)^{-1} = B^{-1}A^{-1}$ — the order **reverses**. This is where the scalar analogy fails hardest: with numbers $(ab)^{-1} = a^{-1}b^{-1}$ is fine, because numbers commute.",
      equation: "(AB)^{-1} = B^{-1}A^{-1}",
      layers: [
        {
          kind: "connection",
          title: "The same reversal appears everywhere",
          body: "Any time invertible things compose — permutations, symmetries, rotations in graphics, invertible functions — undoing a sequence reverses it. The matrix statement is one instance of a fact about composition itself.",
        },
      ],
    },
  ],
  formalBlocks: [
    {
      id: "def-product",
      kind: "definition",
      label: "The product is the composite",
      statement:
        "For $2\\times2$ matrices $A$ and $B$, the **product** $AB$ is the matrix of the map “apply $B$, then $A$”. It is defined column by column: $\\operatorname{col}_j(AB) = A\\,\\operatorname{col}_j(B)$. Expanding that matrix–vector product gives the familiar entries $(AB)_{ij} = \\sum_k A_{ik}B_{kj}$.",
      interpretation:
        "Because the definition IS “do $B$, then $A$”, the identity $(AB)\\mathbf{x} = A(B\\mathbf{x})$ holds by construction — there is nothing to verify. The entry recipe is a consequence, not the definition.",
      visibility: "visible",
      layers: [
        {
          kind: "trap",
          title: "Not entrywise",
          body: "$(AB)_{11}$ is $a_{11}b_{11} + a_{12}b_{21}$, not $a_{11}b_{11}$. The whole first row of $A$ meets the whole first column of $B$, because applying $A$ to a vector mixes both of that vector's coordinates.",
        },
      ],
    },
    {
      id: "prop-algebra",
      kind: "proposition",
      label: "The algebra of composition",
      statement:
        "For all $2\\times2$ matrices: $(AB)C = A(BC)$ (**associative**); $IM = MI = M$; and $A(B + C) = AB + AC$. However $AB \\ne BA$ **in general** — though $I$, every multiple of $I$, any matrix with its own powers, and any two rotations do commute.",
      interpretation:
        "Associativity is free: composing functions is associative, so no entry computation is needed. It is also what makes $A^k$ unambiguous, and it is the step that proves the reversal rule below.",
      visibility: "revealed",
      layers: [
        {
          kind: "math-note",
          title: "Associativity in one line",
          body: "For every $\\mathbf{x}$, $((AB)C)\\mathbf{x} = (AB)(C\\mathbf{x}) = A(B(C\\mathbf{x})) = A((BC)\\mathbf{x}) = (A(BC))\\mathbf{x}$. Two matrices that agree on every vector agree on $\\mathbf{e}_1$ and $\\mathbf{e}_2$, hence have the same columns, hence are equal.",
        },
      ],
    },
    {
      id: "def-inverse",
      kind: "definition",
      label: "Invertible matrix and inverse",
      statement:
        "$A$ is **invertible** if there is a matrix $A^{-1}$ with $A^{-1}A = AA^{-1} = I$. A matrix that is not invertible is called **singular**. The inverse, when it exists, is **unique**.",
      interpretation:
        "“Invertible” is a property of the map: it can be run backwards. “Singular” is not a synonym for “zero” — plenty of nonzero matrices are singular.",
      visibility: "visible",
      layers: [
        {
          kind: "math-note",
          title: "Uniqueness, in two lines",
          body: "Suppose $XA = I$ and $AY = I$. Then $X = XI = X(AY) = (XA)Y = IY = Y$. So a left inverse and a right inverse must coincide, and there is only one inverse. The proof uses nothing but associativity and the identity.",
        },
      ],
    },
    {
      id: "thm-invertibility",
      kind: "theorem",
      label: "Invertible ⇔ nothing collapsed ⇔ $ad - bc \\ne 0$",
      statement:
        "For $A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$ the following are equivalent: (i) $A$ is invertible; (ii) the columns of $A$ are linearly independent; (iii) $\\operatorname{Null}(A) = \\{\\mathbf{0}\\}$; (iv) $A\\mathbf{x} = \\mathbf{b}$ has exactly one solution for every $\\mathbf{b}$; (v) $ad - bc \\ne 0$. In that case $A^{-1} = \\dfrac{1}{ad - bc}\\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix}$.",
      interpretation:
        "Four different-sounding questions — can I undo it, are the columns independent, does anything get sent to zero, does every target have exactly one source — are one question. The fifth item is the arithmetic test that answers all of them.",
      visibility: "revealed",
      layers: [
        {
          kind: "math-note",
          title: "Why each direction holds, and where each hypothesis is used",
          body: "(i)$\\Rightarrow$(iii): if $A\\mathbf{x} = \\mathbf{0}$ then $\\mathbf{x} = A^{-1}A\\mathbf{x} = A^{-1}\\mathbf{0} = \\mathbf{0}$ — the *existence* of $A^{-1}$ is what kills the null space. (iii)$\\Leftrightarrow$(ii) is Lesson 1's definition of dependence. (iii)$\\Rightarrow$(iv): independence is used twice — two independent vectors in the plane **span** it (so a solution exists) and a trivial null space forbids a second (Lesson 5). (iv)$\\Rightarrow$(i): build $A^{-1}$ column by column from the unique solutions of $A\\mathbf{x} = \\mathbf{e}_j$. For (v): multiplying out shows the stated matrix is a two-sided inverse whenever $ad-bc \\ne 0$ — that is where the division happens. Conversely if $ad - bc = 0$ then $A\\begin{bmatrix} -b \\\\ a \\end{bmatrix} = \\mathbf{0}$ and $A\\begin{bmatrix} d \\\\ -c \\end{bmatrix} = \\mathbf{0}$; unless $A$ is the zero matrix (visibly singular) one of those is nonzero, so (iii) fails.",
        },
        {
          kind: "looking-ahead",
          title: "What $ad - bc$ is doing here",
          body: "It arrives as the denominator you must not divide by — nothing more. Lesson 7 shows it is the signed area scale factor, which is why zero means the unit square was flattened.",
        },
      ],
    },
    {
      id: "prop-reversal",
      kind: "corollary",
      label: "Inverting a composite reverses it",
      statement:
        "If $A$ and $B$ are invertible then $AB$ is invertible and $(AB)^{-1} = B^{-1}A^{-1}$.",
      interpretation:
        "Undo the last thing you did, first. The reversal is forced by non-commutativity: $A^{-1}B^{-1}$ would try to undo $B$ before $A$ had been undone.",
      visibility: "visible",
      layers: [
        {
          kind: "math-note",
          title: "The whole proof",
          body: "$(AB)(B^{-1}A^{-1}) = A(BB^{-1})A^{-1} = AIA^{-1} = AA^{-1} = I$, and symmetrically $(B^{-1}A^{-1})(AB) = I$. Only associativity and the identity are used. By uniqueness of the inverse, $B^{-1}A^{-1}$ **is** $(AB)^{-1}$.",
        },
      ],
    },
  ],
  guidedSceneId: "matrix-composition",
  explorationId: "matrix-composition",
  workedExamples: [
    {
      id: "wex-product-columns",
      title: "Build a product one column at a time",
      prompt:
        "With $A = " + A_TEX + "$ and $R = " + R_TEX + "$, find the matrix of “apply $R$, then $A$” — without using the row-times-column recipe.",
      exampleId: "shear-2-1",
      equations: [
        "\\operatorname{col}_1(R) = \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}, \\qquad \\operatorname{col}_2(R) = \\begin{bmatrix} -1 \\\\ 0 \\end{bmatrix}",
        "\\operatorname{col}_1(AR) = A\\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} 2(0) + 1(1) \\\\ 0(0) + 1(1) \\end{bmatrix} = \\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix}",
        "\\operatorname{col}_2(AR) = A\\begin{bmatrix} -1 \\\\ 0 \\end{bmatrix} = \\begin{bmatrix} 2(-1) + 1(0) \\\\ 0(-1) + 1(0) \\end{bmatrix} = \\begin{bmatrix} -2 \\\\ 0 \\end{bmatrix}",
        "AR = " + AR_TEX,
        "\\text{Check against the recipe: } (AR)_{11} = 2(0) + 1(1) = 1 \\;\\checkmark",
      ],
      equationsAriaLabel:
        "The columns of R are (0,1) and (-1,0). Applying A to the first gives (1,1) and to the second gives (-2,0), so AR is the matrix with columns (1,1) and (-2,0). The row-times-column recipe gives the same first entry.",
      layers: [
        {
          kind: "connection",
          title: "Two matrix–vector products, nothing new",
          body: "Every step above is a Lesson 2 computation. The only new idea is *which* vectors to feed in: the columns of the map that acts first.",
        },
      ],
    },
    {
      id: "wex-order",
      title: "The same two maps, the other way round",
      prompt:
        "Now compose them in the other order: apply $A$ first, then $R$. Does anything change?",
      equations: [
        "\\operatorname{col}_1(RA) = R\\begin{bmatrix} 2 \\\\ 0 \\end{bmatrix} = \\begin{bmatrix} 0(2) + (-1)(0) \\\\ 1(2) + 0(0) \\end{bmatrix} = \\begin{bmatrix} 0 \\\\ 2 \\end{bmatrix}",
        "\\operatorname{col}_2(RA) = R\\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} 0(1) + (-1)(1) \\\\ 1(1) + 0(1) \\end{bmatrix} = \\begin{bmatrix} -1 \\\\ 1 \\end{bmatrix}",
        "RA = " + RA_TEX + " \\;\\ne\\; " + AR_TEX + " = AR",
      ],
      equationsAriaLabel:
        "Composing in the other order pushes A's columns through R, giving the matrix RA with columns (0,2) and (-1,1), which differs from AR.",
      layers: [
        {
          kind: "why",
          title: "Why the answer had to change",
          body: "$AR$ asks “where does $A$ send $R$'s columns?”; $RA$ asks “where does $R$ send $A$'s columns?” Those are different vectors going into different maps, so agreement would be the coincidence, not the difference.",
        },
      ],
    },
    {
      id: "wex-inverse",
      title: "Build an inverse by solving two systems",
      prompt:
        "Undo the shear $A = " + A_TEX + "$. Find the two inputs that $A$ sends to $\\mathbf{e}_1$ and $\\mathbf{e}_2$.",
      exampleId: "shear-2-1",
      equations: [
        "A\\mathbf{x} = \\mathbf{e}_1: \\quad 2x_1 + x_2 = 1,\\; x_2 = 0 \\;\\Rightarrow\\; \\mathbf{x} = \\begin{bmatrix} 0.5 \\\\ 0 \\end{bmatrix}",
        "A\\mathbf{x} = \\mathbf{e}_2: \\quad 2x_1 + x_2 = 0,\\; x_2 = 1 \\;\\Rightarrow\\; \\mathbf{x} = \\begin{bmatrix} -0.5 \\\\ 1 \\end{bmatrix}",
        "A^{-1} = \\begin{bmatrix} 0.5 & -0.5 \\\\ 0 & 1 \\end{bmatrix}",
        "AA^{-1} = " + A_TEX + "\\begin{bmatrix} 0.5 & -0.5 \\\\ 0 & 1 \\end{bmatrix} = \\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix} \\;\\checkmark",
        "\\text{Formula check: } ad - bc = 2(1) - 1(0) = 2, \\quad \\tfrac{1}{2}\\begin{bmatrix} 1 & -1 \\\\ 0 & 2 \\end{bmatrix} = \\begin{bmatrix} 0.5 & -0.5 \\\\ 0 & 1 \\end{bmatrix} \\;\\checkmark",
      ],
      equationsAriaLabel:
        "Solving A x = e one gives (0.5, 0) and A x = e two gives (-0.5, 1). Those are the columns of A inverse. Multiplying A by that matrix gives the identity, and the closed formula with ad minus bc equal to 2 gives the same matrix.",
      layers: [
        {
          kind: "math-note",
          title: "Where the formula comes from",
          body: "Solve $A\\mathbf{x} = \\mathbf{e}_j$ for a general $A = \\begin{bmatrix} a & b \\\\ c & d\\end{bmatrix}$ instead of this particular one, and the two answers are $\\frac{1}{ad-bc}\\begin{bmatrix} d \\\\ -c \\end{bmatrix}$ and $\\frac{1}{ad-bc}\\begin{bmatrix} -b \\\\ a \\end{bmatrix}$. Stack them as columns and you have the closed form — with $ad-bc$ appearing exactly where a division could fail.",
        },
      ],
    },
  ],
  callouts: [
    {
      id: "not-entrywise",
      title: "“Multiply the matrices entry by entry”",
      belief:
        "Adding matrices is entrywise, so multiplying them should be too: $(AB)_{11} = a_{11}b_{11}$.",
      confront:
        "Try it on $" + A_TEX + "$ and $" + R_TEX + "$. Entrywise would give $\\begin{bmatrix} 0 & -1 \\\\ 0 & 0 \\end{bmatrix}$ — a matrix that collapses the plane. But composing a shear with a rotation cannot collapse anything: both maps are reversible.",
      resolve:
        "The product is defined by *where the basis lands*, and applying $A$ to a vector mixes both of that vector's coordinates. So a whole row of $A$ must meet a whole column of $B$: $(AB)_{11} = a_{11}b_{11} + a_{12}b_{21}$.",
    },
    {
      id: "apply-b-first",
      title: "“$AB$ means apply $A$, then $B$”",
      belief:
        "We read left to right, so $AB$ should mean “do $A$ first”.",
      confront:
        "Check it against a vector: $AB\\mathbf{x}$ is $A(B\\mathbf{x})$, and the innermost operation happens first. It is $B$ that touches $\\mathbf{x}$.",
      resolve:
        "Matrix notation runs right to left, exactly like $f(g(x))$. In $AB$, the map nearest the vector — $B$ — acts first. When in doubt, write the vector down and watch which matrix reaches it.",
    },
    {
      id: "nonzero-means-invertible",
      title: "“Every matrix that isn't zero has an inverse”",
      belief:
        "For numbers, everything except $0$ has a reciprocal, so $A^{-1}$ should be $1/A$ and should exist unless $A$ is the zero matrix.",
      confront:
        "$\\begin{bmatrix} 2 & 4 \\\\ 1 & 2 \\end{bmatrix}$ has no zero entries at all, yet $\\begin{bmatrix} 2 \\\\ -1 \\end{bmatrix}$ and $\\mathbf{0}$ both land on $\\mathbf{0}$. Two inputs, one output — the map has already forgotten which one it started from.",
      resolve:
        "Invertibility is about information, not about entries being nonzero. A matrix is invertible exactly when its columns are independent — equivalently $\\operatorname{Null}(A) = \\{\\mathbf{0}\\}$, equivalently $ad - bc \\ne 0$. And $A^{-1}$ is a *matrix*, never “$1$ over a matrix”.",
      exampleId: "singular-collapse",
    },
    {
      id: "inverse-of-product",
      title: "“$(AB)^{-1} = A^{-1}B^{-1}$”",
      belief:
        "Inverting distributes over the product, just as it does for numbers.",
      confront:
        "Compose them and see: $(AB)(A^{-1}B^{-1}) = A(BA^{-1})B^{-1}$, and $BA^{-1}$ does not simplify — $B$ and $A^{-1}$ do not generally commute, so nothing cancels.",
      resolve:
        "The order reverses: $(AB)^{-1} = B^{-1}A^{-1}$. Undo the *last* map first. For numbers the naive rule works only because numbers commute.",
    },
  ],
  checkpoint: {
    prompt:
      "Before computing: you shear the plane and then rotate it, and separately you rotate it and then shear it. Must the two results agree?",
    answer:
      "No. $AR$ pushes $R$'s columns through $A$, while $RA$ pushes $A$'s columns through $R$ — different vectors entering different maps. Concretely $AR = " + AR_TEX + "$ and $RA = " + RA_TEX + "$. Order matters *in general*, though some pairs (anything with $I$ or a multiple of $I$, two rotations, a matrix and its own powers) do commute.",
  },
  checkpoints: [
    {
      id: "undo-impossible",
      prompt:
        "A map sends the two distinct points $\\mathbf{u}$ and $\\mathbf{v}$ to the same output. What would an “undo” have to do — and can any function do it?",
      answer:
        "It would have to look at that single image point and return *both* $\\mathbf{u}$ and $\\mathbf{v}$ — or arbitrarily pick one and be wrong about the other. A function returns one output per input, so no function can undo it: not a matrix, not anything. This is why non-invertibility is *information loss*, and why it happens exactly when $\\operatorname{Null}(A) \\ne \\{\\mathbf{0}\\}$: any nonzero $\\mathbf{u} - \\mathbf{v}$ in the null space produces such a pair.",
    },
  ],
  exercises: [
    {
      id: "comp-order-first",
      type: "multiple-choice",
      tier: "check",
      prompt: "In the product $AB$, which map acts on the vector first?",
      choices: [
        "$A$, because it is written first",
        "$B$, because it is nearest the vector",
        "They act simultaneously",
        "It depends on whether $A$ and $B$ are invertible",
      ],
      correctChoice: 1,
      explanation:
        "$AB\\mathbf{x}$ means $A(B\\mathbf{x})$ — the innermost map acts first, exactly as in $f(g(x))$. Matrix notation runs right to left.",
    },
    {
      id: "comp-column-meaning",
      type: "multiple-choice",
      tier: "check",
      prompt: "Column $j$ of $AB$ is…",
      choices: [
        "column $j$ of $A$ times column $j$ of $B$, entry by entry",
        "$A$ applied to column $j$ of $B$",
        "$B$ applied to column $j$ of $A$",
        "the $j$-th row of $A$ paired with the $j$-th row of $B$",
      ],
      correctChoice: 1,
      explanation:
        "$\\operatorname{col}_j(AB) = (AB)\\mathbf{e}_j = A(B\\mathbf{e}_j) = A\\,\\operatorname{col}_j(B)$. The basis vector travels through $B$ first, then through $A$, and where it stops is the column.",
    },
    {
      // Fresh pair (M, N) — NOT the scene's A and R — so this is production, not recall.
      id: "comp-column-fresh",
      type: "vector",
      tier: "drill",
      prompt:
        "Let $M = " + M_TEX + "$ and $N = " + N_TEX + "$. Compute the **first column of $MN$** by applying $M$ to $N$'s first column. Enter both coordinates.",
      expected: [FRESH.product[0][0], FRESH.product[1][0]],
      tolerance: 1e-9,
      explanation:
        "$\\operatorname{col}_1(N) = \\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix}$, and $M\\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} 3(2) + 1(1) \\\\ -1(2) + 2(1) \\end{bmatrix} = \\begin{bmatrix} 7 \\\\ 0 \\end{bmatrix}$. That vector is column 1 of $MN$ — no recipe needed.",
    },
    {
      id: "comp-product-entries-fresh",
      type: "custom",
      capabilityId: MATRIX_ENTRY_ID,
      tier: "drill",
      prompt:
        "Same $M = " + M_TEX + "$ and $N = " + N_TEX + "$. Enter the full product $MN$ — all four entries.",
      config: {
        rows: 2,
        cols: 2,
        matrixName: "MN",
        expected: [
          [FRESH.product[0][0], FRESH.product[0][1]],
          [FRESH.product[1][0], FRESH.product[1][1]],
        ],
        explanation:
          "Column 1 is $M\\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} 7 \\\\ 0 \\end{bmatrix}$ and column 2 is $M\\begin{bmatrix} 0 \\\\ 4 \\end{bmatrix} = \\begin{bmatrix} 4 \\\\ 8 \\end{bmatrix}$, so $MN = \\begin{bmatrix} 7 & 4 \\\\ 0 & 8 \\end{bmatrix}$. Entrywise multiplication would have given $\\begin{bmatrix} 6 & 0 \\\\ -1 & 8 \\end{bmatrix}$ — a different matrix, and not the composite of the two maps.",
      },
    },
    {
      // Learner PRODUCES the inverse the way the lesson derives it: two systems,
      // then the verification. A fresh K (det = 1) keeps the arithmetic integral.
      id: "comp-build-inverse-fresh",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "Build the inverse of $K = " + K_TEX + "$ yourself, column by column, then check it.",
      config: {
        steps: [
          {
            kind: "vector",
            prompt:
              "Column 1 of $K^{-1}$ solves $K\\mathbf{x} = \\mathbf{e}_1$, i.e. $3x + y = 1,\\ 2x + y = 0$. Enter $\\mathbf{x}$ — both coordinates.",
            expected: [FRESH.inverseOfSource[0][0], FRESH.inverseOfSource[1][0]],
            explanation:
              "Subtracting the equations gives $x = 1$, then $y = -2$. So column 1 of $K^{-1}$ is $(1, -2)$.",
          },
          {
            kind: "vector",
            prompt:
              "Column 2 solves $K\\mathbf{x} = \\mathbf{e}_2$, i.e. $3x + y = 0,\\ 2x + y = 1$. Enter $\\mathbf{x}$.",
            expected: [FRESH.inverseOfSource[0][1], FRESH.inverseOfSource[1][1]],
            explanation:
              "Subtracting gives $x = -1$, then $y = 3$. So column 2 of $K^{-1}$ is $(-1, 3)$, and $K^{-1} = \\begin{bmatrix} 1 & -1 \\\\ -2 & 3 \\end{bmatrix}$.",
          },
          {
            kind: "numeric",
            prompt:
              "Verify it: compute the $(1,1)$ entry of $KK^{-1}$ — row 1 of $K$ against column 1 of $K^{-1}$.",
            expected: 1,
            explanation:
              "$3(1) + 1(-2) = 1$. All four entries give $\\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}$, so this really is $K^{-1}$. Note $ad - bc = 3(1) - 1(2) = 1$, which is why every entry came out a whole number.",
          },
        ],
      },
    },
    {
      // Cumulative connection (D10): Lesson 3's system, re-solved with the inverse.
      // The answer MUST agree with the elimination result from Lesson 4.
      id: "comp-solve-with-inverse",
      type: "vector",
      tier: "drill",
      prompt:
        "Back to Lesson 3's system: $A = \\begin{bmatrix} 1 & 3 \\\\ 2 & -1 \\end{bmatrix}$, $\\mathbf{b} = \\begin{bmatrix} -1 \\\\ 5 \\end{bmatrix}$. Here $A^{-1} = \\frac{1}{-7}\\begin{bmatrix} -1 & -3 \\\\ -2 & 1 \\end{bmatrix}$. Compute $\\mathbf{x} = A^{-1}\\mathbf{b}$.",
      expected: [SYS.solution[0], SYS.solution[1]],
      tolerance: 1e-6,
      explanation:
        "$A^{-1}\\mathbf{b} = \\frac{1}{-7}\\begin{bmatrix} (-1)(-1) + (-3)(5) \\\\ (-2)(-1) + (1)(5) \\end{bmatrix} = \\frac{1}{-7}\\begin{bmatrix} -14 \\\\ 7 \\end{bmatrix} = \\begin{bmatrix} 2 \\\\ -1 \\end{bmatrix}$ — the same $(2, -1)$ elimination produced in Lesson 4. Same answer, different route: elimination solves this one system, while $A^{-1}$ answers every $\\mathbf{b}$ at once. (For a single system elimination is still the better computation.)",
    },
    {
      id: "comp-singular-parameter",
      type: "numeric",
      tier: "drill",
      prompt:
        "For which value of $k$ does $\\begin{bmatrix} 2 & 6 \\\\ 1 & k \\end{bmatrix}$ fail to have an inverse?",
      expected: FRESH.singularParameter,
      tolerance: 1e-9,
      explanation:
        "It is singular exactly when $ad - bc = 2k - 6 = 0$, i.e. $k = 3$. Then the columns $(2,1)$ and $(6,3)$ are parallel — the second is three times the first — so the plane collapses onto a line and there is nothing to invert.",
    },
    {
      id: "comp-noncommute-and-commute",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "transfer",
      prompt:
        "Settle the order question yourself with $M = " + M_TEX + "$ and $N = " + N_TEX + "$, then decide how far “order matters” actually goes.",
      config: {
        steps: [
          {
            kind: "vector",
            prompt:
              "Compute the first column of $NM$ — that is, $N$ applied to $M$'s first column. Enter both coordinates.",
            expected: [
              FRESH.productReversed[0][0],
              FRESH.productReversed[1][0],
            ],
            explanation:
              "$\\operatorname{col}_1(M) = \\begin{bmatrix} 3 \\\\ -1 \\end{bmatrix}$ and $N\\begin{bmatrix} 3 \\\\ -1 \\end{bmatrix} = \\begin{bmatrix} 2(3) + 0(-1) \\\\ 1(3) + 4(-1) \\end{bmatrix} = \\begin{bmatrix} 6 \\\\ -1 \\end{bmatrix}$.",
          },
          {
            kind: "multiple-choice",
            prompt:
              "You found $\\operatorname{col}_1(MN) = (7, 0)$ earlier and $\\operatorname{col}_1(NM) = (6, -1)$ now. What have you established?",
            choices: [
              "That $MN \\ne NM$ for this pair — one counterexample is enough to refute “always equal”",
              "That $MN \\ne NM$ for every pair of matrices",
              "That one of the two products was computed incorrectly",
              "That $M$ or $N$ must be singular",
            ],
            correctChoice: 0,
            explanation:
              "A single differing column refutes $MN = NM$ for this pair. It does not — and cannot — establish that *no* pair commutes.",
          },
          {
            kind: "multiple-choice",
            prompt:
              "Which of these commutes with **every** $2\\times2$ matrix?",
            choices: [
              "$\\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}$",
              "$\\begin{bmatrix} 1 & 1 \\\\ 0 & 1 \\end{bmatrix}$",
              "$\\begin{bmatrix} 3 & 0 \\\\ 0 & 3 \\end{bmatrix}$",
              "$\\begin{bmatrix} 2 & 4 \\\\ 1 & 2 \\end{bmatrix}$",
            ],
            correctChoice: 2,
            explanation:
              "$3I$ scales every vector by $3$, and scaling commutes with everything: $(3I)M = 3M = M(3I)$. The rotation and the shear each fail to commute with most matrices, and the singular one does too. So “order matters” is a statement about the general case, not a universal law — multiples of $I$, powers of a single matrix, and pairs of rotations all commute.",
          },
        ],
      },
    },
    {
      // Predicate-graded PRODUCTION: any nonzero vector on the null line passes.
      // Exhibiting it IS the argument that the map cannot be undone.
      id: "comp-singular-witness",
      type: "custom",
      capabilityId: CONSTRUCT_IN_EXPLORER_ID,
      tier: "transfer",
      prompt:
        "Show that $S = \\begin{bmatrix} 3 & 6 \\\\ 1 & 2 \\end{bmatrix}$ cannot be undone. Commit **any nonzero** vector that $S$ sends to $\\mathbf{0}$ — both coordinates.",
      config: {
        target: "vector2",
        check: {
          kind: "vector-on-line",
          spanning: [
            FRESH.singularNullDirection[0],
            FRESH.singularNullDirection[1],
          ],
        },
        reveal:
          "Any nonzero multiple of $(2, -1)$ works — e.g. $(2,-1)$, $(-2,1)$, or $(4,-2)$. Now finish the argument: if $S\\mathbf{v} = \\mathbf{0}$ with $\\mathbf{v} \\ne \\mathbf{0}$, then $S\\mathbf{u}$ and $S(\\mathbf{u}+\\mathbf{v})$ are the same point for *every* $\\mathbf{u}$. Two distinct inputs, one output — so no function could decide which to send back, and $S$ has no inverse. Consistently, $ad - bc = 3(2) - 6(1) = 0$.",
        hint:
          "You need $3x + 6y = 0$ and $x + 2y = 0$ — the same condition twice, since the rows are proportional. Pick any nonzero solution.",
      },
    },
    {
      id: "comp-reversal",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "$P$ and $Q$ are invertible. Which matrix undoes “apply $Q$, then $P$”?",
      choices: [
        "$P^{-1}Q^{-1}$",
        "$Q^{-1}P^{-1}$",
        "$(PQ)^{-1} = P^{-1} + Q^{-1}$",
        "$QP$",
      ],
      correctChoice: 1,
      explanation:
        "“Apply $Q$, then $P$” is the matrix $PQ$, and $(PQ)^{-1} = Q^{-1}P^{-1}$: undo the last map first. Check it — $(PQ)(Q^{-1}P^{-1}) = P(QQ^{-1})P^{-1} = PIP^{-1} = I$. Writing $P^{-1}Q^{-1}$ instead tries to undo $Q$ before $P$ has been undone, and nothing cancels.",
    },
    {
      // Unscored E6 reasoning surface. P2 owes no proof CONSTRUCTION, so this is
      // offered as depth and is deliberately not on the must-demonstrate bar.
      id: "comp-justify-collapse",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt:
        "Explain in your own words: why can **no function at all** — not merely no matrix — undo a map that collapses the plane onto a line? Write your reasoning, then compare with the model answer.",
      config: {
        modelAnswer:
          "Suppose $A$ collapses the plane, so $\\operatorname{Null}(A)$ contains some $\\mathbf{v} \\ne \\mathbf{0}$. Take any $\\mathbf{u}$ and set $\\mathbf{w} = \\mathbf{u} + \\mathbf{v}$. Then $\\mathbf{u} \\ne \\mathbf{w}$ but $A\\mathbf{w} = A\\mathbf{u} + A\\mathbf{v} = A\\mathbf{u}$, so two distinct inputs have the same image $\\mathbf{p}$. An undo $g$ would have to satisfy $g(\\mathbf{p}) = \\mathbf{u}$ and $g(\\mathbf{p}) = \\mathbf{w}$ simultaneously. But a function assigns exactly one output to each input, so $\\mathbf{u} = \\mathbf{w}$ — a contradiction. The obstruction is that $A$ is not injective; it has nothing to do with matrices, linearity, or the formula for $A^{-1}$. Once the information distinguishing $\\mathbf{u}$ from $\\mathbf{w}$ is destroyed, no procedure whatsoever can recover it.",
        rubric:
          "A strong answer exhibits two distinct inputs with the same image (built from a nonzero null vector), and concludes that any undo would have to return two different values for one input, which contradicts the definition of a function. It should note the argument uses only non-injectivity — so it rules out every function, not just linear ones.",
      },
    },
  ],
  keyTakeaway:
    "A matrix records where the basis lands, so composing needs no new definition: column $j$ of $AB$ is $A$ applied to column $j$ of $B$, and the row-times-column recipe is just that written out. $AB$ applies $B$ first, and order matters in general. Running the question backwards gives $A^{-1}$, whose columns solve $A\\mathbf{x} = \\mathbf{e}_j$ — they exist exactly when the map collapsed nothing ($ad - bc \\ne 0$), because no function can undo lost information. And since composing is composing, undoing a sequence reverses it: $(AB)^{-1} = B^{-1}A^{-1}$.",
  structuredSummary: {
    coreMentalModel:
      "Follow the basis twice: where $\\mathbf{e}_j$ stops is column $j$ of the product. To undo, ask which input landed on $\\mathbf{e}_j$.",
    definitionsIntroduced: [
      "Product $AB$ as the composite “apply $B$, then $A$”, defined by $\\operatorname{col}_j(AB) = A\\,\\operatorname{col}_j(B)$",
      "Identity $I$; invertible and singular matrices; the inverse $A^{-1}$",
    ],
    mainResult:
      "$A$ is invertible $\\iff$ its columns are independent $\\iff \\operatorname{Null}(A) = \\{\\mathbf{0}\\} \\iff ad - bc \\ne 0$, and then $A^{-1} = \\frac{1}{ad-bc}\\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix}$.",
    representationsConnected:
      "Two maps applied in sequence (picture) ↔ one product matrix (symbol) ↔ two systems $A\\mathbf{x} = \\mathbf{e}_j$ (computation).",
    commonMistake:
      "Multiplying entrywise, reading $AB$ as “$A$ first”, assuming every nonzero matrix is invertible, or writing $(AB)^{-1} = A^{-1}B^{-1}$.",
    canonicalExample:
      "$A = " + A_TEX + "$, $R = " + R_TEX + "$: $AR = " + AR_TEX + " \\ne " + RA_TEX + " = RA$, and $A^{-1} = \\begin{bmatrix} 0.5 & -0.5 \\\\ 0 & 1 \\end{bmatrix}$.",
    oneProblemWorthRemembering:
      "Build $A^{-1}$ by solving $A\\mathbf{x} = \\mathbf{e}_1$ and $A\\mathbf{x} = \\mathbf{e}_2$, then verify $AA^{-1} = I$.",
    whatThisUnlocksNext:
      "What $ad - bc$ actually measures (determinants), and what “the plane collapsed” becomes when the dimensions are counted (rank).",
  },
};
