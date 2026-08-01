import type { LessonDefinition } from "./types";
import { EXERCISE_SEQUENCE_ID, SELF_CHECK_ID } from "./capabilities";
import {
  geometricMultiplicity,
  nullityOf,
  rankOf,
  type Matrix,
} from "../math";

/**
 * Lesson: "Dimension & Rank–Nullity" (spine L9).
 *
 * Built on the PASS contract
 * `docs/courses/linear-algebra/lessons/09-rank-nullity/insight.md`.
 *
 * Primary insight: n is a BUDGET the map spends. Each input dimension has
 * exactly one fate — survive into the image, or collapse into the null space —
 * so rank + nullity = n is a conservation law, not column bookkeeping, and the
 * proof is a one-to-one matching between a basis extension of the null space and
 * a basis of the image. Because the total is fixed, the law FORBIDS whole classes
 * of maps.
 *
 * The diagnosed obstacle is unusual: after L8 the result looks too obvious to
 * need a name. So the lesson spends itself on what the law forbids — that is the
 * only evidence the learner's model changed — and it uses NON-SQUARE maps
 * throughout, because with m = n the law says nothing L8 did not already say.
 *
 * Scope: well-definedness of dimension is stated, not proved. rank(AB) bounds are
 * mentioned only. The proof is shown in full; learner construction is offered as
 * an unscored surface.
 */

/** Fresh practice maps — not the ones the scene animates. */
const FRESH_WIDE: Matrix = [
  [2, 1, 0, 3],
  [0, 1, 1, 1],
];
const FRESH_SQUARE: Matrix = [
  [1, 2, 1],
  [2, 4, 2],
  [3, 6, 3],
];
/** Defective: algebraic multiplicity 2 for λ = 5, geometric multiplicity 1. */
const DEFECTIVE: Matrix = [
  [5, 1],
  [0, 5],
];

const freshWideNullity = nullityOf(FRESH_WIDE);
const freshSquareRank = rankOf(FRESH_SQUARE);
const freshSquareNullity = nullityOf(FRESH_SQUARE);
const defectiveGeometric = geometricMultiplicity(DEFECTIVE, 5);

const WIDE_TEX = "\\begin{bmatrix} 1 & 2 & 3 \\\\ 0 & 1 & 4 \\end{bmatrix}";
const FRESH_WIDE_TEX =
  "\\begin{bmatrix} 2 & 1 & 0 & 3 \\\\ 0 & 1 & 1 & 1 \\end{bmatrix}";
const FRESH_SQUARE_TEX =
  "\\begin{bmatrix} 1 & 2 & 1 \\\\ 2 & 4 & 2 \\\\ 3 & 6 & 3 \\end{bmatrix}";
const DEFECTIVE_TEX = "\\begin{bmatrix} 5 & 1 \\\\ 0 & 5 \\end{bmatrix}";

export const rankNullityLesson: LessonDefinition = {
  id: "rank-nullity",
  title: "Dimension and the Rank–Nullity Theorem",
  subtitle:
    "The input dimension is a budget, and every dimension has exactly one fate — so the books must balance",
  learningObjectives: [
    "State $\\operatorname{rank}A + \\operatorname{nullity}A = n$ with the **input** dimension on the right, and say why it is not $m$",
    "Explain the theorem as conservation: each input dimension survives or collapses, never both and never neither",
    "Follow the proof: extend a basis of $\\operatorname{Null}(A)$, and show the images of the added vectors are a basis of $\\operatorname{Col}(A)$",
    "Produce either count from the other, for square and non-square maps alike",
    "Bound the rank by $\\min(m, n)$ and read off what a map's shape makes impossible",
    "Show that no map from a bigger space to a smaller one is one-to-one, and none from a smaller to a bigger is onto",
    "Explain why one-to-one and onto coincide only for square maps",
    "Compute a geometric multiplicity as $n - \\operatorname{rank}(A - \\lambda I)$",
  ],
  motivatingQuestion:
    "Can a map from $\\mathbb{R}^3$ to $\\mathbb{R}^2$ be one-to-one? Answer it without trying a single example.",
  route: [
    { kind: "motivate" },
    { kind: "section", sectionId: "too-obvious" },
    { kind: "visual" },
    { kind: "section", sectionId: "budget" },
    { kind: "formal", formalId: "def-dimension" },
    { kind: "formal", formalId: "ref-dimension-well-defined" },
    { kind: "formal", formalId: "thm-rank-nullity" },
    { kind: "proof", formalId: "thm-rank-nullity" },
    { kind: "worked", workedId: "wex-proof-walkthrough" },
    { kind: "check" },
    { kind: "section", sectionId: "forbids" },
    { kind: "formal", formalId: "cor-consequences" },
    { kind: "check", checkpointId: "ceiling-vs-budget" },
    { kind: "explore", tocLabel: "Spend the budget" },
    { kind: "section", sectionId: "bookkeeping" },
    { kind: "section", sectionId: "forward" },
    { kind: "practice" },
    {
      kind: "summary",
      heading: "Every dimension has exactly one fate",
    },
  ],
  sections: [
    {
      id: "too-obvious",
      title: "A suspiciously obvious identity",
      body: "Last lesson ended with an observation: every column is either a pivot column or a free column, so $\\operatorname{rank}A + \\dim\\operatorname{Null}(A) = n$. Stated that way it sounds like bookkeeping about how we happened to write the matrix down — hardly worth a name. But watch what it does. It correctly predicts that **no** linear map from $\\mathbb{R}^3$ to $\\mathbb{R}^2$ is one-to-one — a claim about which maps can exist at all. A fact about column counting has no business constraining that. So the identity must be recording something stronger, and the pivot/free split must be the *symptom* rather than the reason.",
      observation:
        "The reason is a conservation law — and once you have it, whole classes of maps become impossible without any computation.",
    },
    {
      id: "budget",
      title: "Every dimension has exactly one fate",
      body: "Read $n$ as a **budget** of dimensions handed to the map. Each one has exactly one fate: it **survives** into the image, adding $1$ to the rank, or it **collapses** to $\\mathbf{0}$, adding $1$ to the nullity. Never both — a direction that survives is not sent to zero. Never neither — the map is defined on every input. And none are created: the image cannot have more dimensions than the map was given. So the two counts must add to $n$. The ledger in the animation is exactly this: three tokens go in, each is posted to one column, and the total never changes.",
      equation:
        "\\operatorname{rank}A + \\operatorname{nullity}A = n \\qquad (n = \\text{the number of columns} = \\dim \\text{ of the input space})",
      observation:
        "Note carefully which number is on the right. It is $n$, the input dimension — never $m$. The output dimension $m$ plays a different role: it is a *ceiling* on the rank, not the total.",
      layers: [
        {
          kind: "trap",
          title: "Tokens are dimensions, not vectors",
          body: "The ledger counts *dimensions*, and only the counts are canonical. It is not true that some particular input vector can be identified as “the one that died” — which directions survive depends on a choice of basis. What does not depend on any choice is how many.",
        },
      ],
    },
    {
      id: "forbids",
      title: "What the law forbids",
      body: "Because the total is pinned at $n$, rank and nullity stop being two independent measurements: fix one and the other follows. That immediately rules out whole families of maps. If the input space is bigger than the output space ($n > m$), the rank cannot exceed $m$, so at least $n - m$ dimensions must be crushed — **no such map is one-to-one**, whatever its entries. If the input space is smaller ($n < m$), the rank cannot exceed $n$, so the image can never fill the output space — **no such map is onto**. Neither conclusion required looking at a single number in the matrix.",
      equation:
        "\\operatorname{rank}A \\le \\min(m, n), \\qquad n > m \\Rightarrow \\operatorname{nullity}A \\ge n - m > 0",
      observation:
        "This is why the answer to the opening question is no, and why you can say so before seeing the map.",
      layers: [
        {
          kind: "connection",
          title: "Why Lesson 6's long list of equivalent conditions worked",
          body: "For a **square** map, $m = n$, so “rank is maximal” says both *nothing is crushed* and *the image fills the space* at once — which is why invertible, $\\det \\ne 0$, trivial null space, and one-solution-for-every-$\\mathbf{b}$ could all collapse into a single condition. That collapse is a privilege of squareness, and it fails the moment $m \\ne n$.",
        },
        {
          kind: "connection",
          title: "And why Lesson 3's trichotomy has exactly three cases",
          body: "Existence is a question about $\\operatorname{Col}(A)$ in the output space; multiplicity is a question about $\\operatorname{Null}(A)$ in the input space. The law ties the two sides together, so “none, one, or infinitely many” is not a list of observed cases — it is what the two counts allow.",
        },
      ],
    },
    {
      id: "bookkeeping",
      title: "So what were the pivots doing?",
      body: "The proof never mentioned pivots, which is the point: the law is about the map, not about elimination. But the two views agree exactly. Row-reducing chooses one concrete way to split the columns — pivot columns play the role of the added basis vectors whose images span $\\operatorname{Col}(A)$, and free columns play the role of the null-space basis. So Lesson 8's observation was a *computation* of this law using one particular choice, and the theorem is what guarantees the answer does not depend on the choice.",
      observation:
        "Different eliminations can produce different bases. They can never produce different counts.",
    },
    {
      id: "forward",
      title: "The law, put to work on eigenvalues",
      body: "Here is a job the law does that nothing before it could. Lesson 11 will look for directions a map merely scales, and will meet a puzzle: an eigenvalue can repeat, and sometimes that means a whole plane of eigendirections and sometimes only a single line. The set of eigendirections for $\\lambda$ is $\\operatorname{Null}(A - \\lambda I)$ — a null space, with a dimension, called the **geometric multiplicity**. And rank–nullity computes it: $\\dim\\operatorname{Null}(A - \\lambda I) = n - \\operatorname{rank}(A - \\lambda I)$. So the question “one direction or a plane of them?” becomes a rank computation you can already do.",
      equation:
        "\\text{geometric multiplicity of } \\lambda \\;=\\; \\dim\\operatorname{Null}(A - \\lambda I) \\;=\\; n - \\operatorname{rank}(A - \\lambda I)",
      layers: [
        {
          kind: "looking-ahead",
          title: "The defective case, made calculable",
          body: "For $" + DEFECTIVE_TEX + "$, $\\lambda = 5$ is a root of the characteristic polynomial twice, yet $A - 5I = \\begin{bmatrix} 0 & 1 \\\\ 0 & 0\\end{bmatrix}$ has rank $1$, so the geometric multiplicity is $2 - 1 = 1$: one eigendirection, not two. That gap between “how often $\\lambda$ repeats” and “how many directions it actually gives” is what “defective” means, and you can now measure it.",
        },
      ],
    },
  ],
  formalBlocks: [
    {
      id: "def-dimension",
      kind: "definition",
      label: "Dimension, nullity",
      statement:
        "The **dimension** $\\dim V$ of a subspace $V$ is the number of vectors in a basis of $V$. The **nullity** of $A$ is $\\operatorname{nullity}A = \\dim\\operatorname{Null}(A)$, and the rank is $\\operatorname{rank}A = \\dim\\operatorname{Col}(A)$ as in the previous lesson.",
      interpretation:
        "Dimension counts independent directions, so it measures a space rather than describing one of its descriptions.",
      visibility: "visible",
    },
    {
      id: "ref-dimension-well-defined",
      kind: "proposition",
      label: "Dimension is well defined",
      statement:
        "Every basis of a given finite-dimensional space has the same number of vectors.",
      interpretation:
        "Without this, “the number of vectors in a basis” would depend on which basis you picked, and “dimension” would not name anything. **Stated here, not proved** — the argument (an exchange/replacement lemma) belongs with the deeper structural results.",
      visibility: "reference",
    },
    {
      id: "thm-rank-nullity",
      kind: "theorem",
      label: "Rank–Nullity",
      statement:
        "For any $m \\times n$ matrix $A$, $\\;\\operatorname{rank}A + \\operatorname{nullity}A = n$.",
      interpretation:
        "Every input dimension is accounted for exactly once: it either survives into the image or collapses into the null space. The right-hand side is the **input** dimension $n$; the output dimension $m$ never appears.",
      visibility: "visible",
      // The proof (below) is the lesson's main line, placed by its own
      // `{ kind: "proof" }` route block — not a collapsed aside. It was a
      // `math-note` depth layer before package R3; the argument is unchanged,
      // only its presentation (main line vs. optional) moved.
      // Bold clauses below never wrap a `$...$` token: ProseWithMath extracts
      // math before emphasis, so a `**bold**` span that straddles a math
      // token loses its markers (see known-failure-modes.md's entry on this).
      proof:
        "Let $k = \\operatorname{nullity}A$ and choose a basis $\\{\\mathbf{u}_1,\\dots,\\mathbf{u}_k\\}$ of $\\operatorname{Null}(A)$. Extend it to a basis of the whole input space by adding $\\{\\mathbf{w}_1,\\dots,\\mathbf{w}_r\\}$, so $k + r = n$. **The images span the column space:** any $\\mathbf{x}$ is $\\sum c_i\\mathbf{u}_i + \\sum d_j\\mathbf{w}_j$, and applying $A$ kills the first sum, leaving $A\\mathbf{x} = \\sum d_j A\\mathbf{w}_j$ — so $\\{A\\mathbf{w}_j\\}$ spans $\\operatorname{Col}(A)$. **They are independent:** if $\\sum d_j A\\mathbf{w}_j = \\mathbf{0}$ then $A(\\sum d_j\\mathbf{w}_j) = \\mathbf{0}$, so $\\sum d_j\\mathbf{w}_j$ lies in $\\operatorname{Null}(A)$ and is therefore some $\\sum c_i\\mathbf{u}_i$; but the $\\mathbf{u}$'s and $\\mathbf{w}$'s together form a basis, so every $c_i$ and $d_j$ is zero. Hence $\\{A\\mathbf{w}_j\\}$ is a basis of $\\operatorname{Col}(A)$ and $\\operatorname{rank}A = r$. Therefore $\\operatorname{rank}A + \\operatorname{nullity}A = r + k = n$.",
      layers: [
        {
          kind: "trap",
          title: "The split is a choice, not a decomposition",
          body: "The proof picks *some* extension $\\{\\mathbf{w}_j\\}$, and a different choice gives a different set. So the theorem does **not** say the input space decomposes canonically into the two subspaces — and it certainly does not say $\\mathbb{R}^n = \\operatorname{Col}(A) \\oplus \\operatorname{Null}(A)$, which for a non-square map is not even type-correct. Only the *counts* are canonical.",
        },
      ],
    },
    {
      id: "cor-consequences",
      kind: "corollary",
      label: "What the shape alone decides",
      statement:
        "For an $m \\times n$ matrix: $\\operatorname{rank}A \\le \\min(m, n)$; if $n > m$ then $\\operatorname{nullity}A \\ge n - m > 0$, so $A$ is **not one-to-one**; if $n < m$ then $\\operatorname{rank}A \\le n < m$, so $A$ is **not onto**. If $m = n$, then $A$ is one-to-one **if and only if** it is onto, and each is equivalent to invertibility.",
      interpretation:
        "Three of these are impossibility results proved from the shape alone — no entries required. The fourth explains why the square case felt so much simpler: it is the only shape where the two properties coincide.",
      visibility: "visible",
      layers: [
        {
          kind: "math-note",
          title: "Each one in a line",
          body: "$\\operatorname{rank}A \\le n$ because the image is spanned by $n$ columns; $\\operatorname{rank}A \\le m$ because $\\operatorname{Col}(A) \\subseteq \\mathbb{R}^m$. If $n > m$: $\\operatorname{nullity}A = n - \\operatorname{rank}A \\ge n - m > 0$, so a nonzero vector is crushed and two inputs collide. If $n < m$: $\\operatorname{rank}A \\le n < m = \\dim\\mathbb{R}^m$, so $\\operatorname{Col}(A)$ is a proper subspace. If $m = n$: one-to-one means $\\operatorname{nullity} = 0$, i.e. $\\operatorname{rank} = n = m$, i.e. $\\operatorname{Col}(A) = \\mathbb{R}^m$, i.e. onto.",
        },
      ],
    },
  ],
  guidedSceneId: "rank-nullity",
  explorationId: "rank-nullity",
  workedExamples: [
    {
      id: "wex-proof-walkthrough",
      title: "The proof on a concrete map",
      prompt:
        "Run the proof's construction on $A = " + WIDE_TEX + "$ and check that the counting works out.",
      equations: [
        "A = " + WIDE_TEX + ", \\qquad m = 2, \\; n = 3",
        "\\operatorname{Null}(A): \\; x_1 + 2x_2 + 3x_3 = 0,\\; x_2 + 4x_3 = 0 \\;\\Rightarrow\\; \\mathbf{u}_1 = \\begin{bmatrix} 5 \\\\ -4 \\\\ 1 \\end{bmatrix}, \\quad k = 1",
        "\\text{Extend to a basis of } \\mathbb{R}^3: \\; \\mathbf{w}_1 = \\mathbf{e}_1, \\; \\mathbf{w}_2 = \\mathbf{e}_2, \\quad r = 2",
        "A\\mathbf{w}_1 = \\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix}, \\quad A\\mathbf{w}_2 = \\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix} \\quad \\text{— independent, so a basis of } \\operatorname{Col}(A)",
        "\\operatorname{rank}A = 2, \\quad \\operatorname{nullity}A = 1, \\quad 2 + 1 = 3 = n \\;\\checkmark",
        "\\text{And } n = 3 > 2 = m \\;\\Rightarrow\\; \\text{not one-to-one, as the law promised}",
      ],
      equationsAriaLabel:
        "For the 2 by 3 matrix, the null space is spanned by (5, -4, 1) so the nullity is 1. Extending with e1 and e2 gives two images (1,0) and (2,1), which are independent and therefore a basis of the column space, so the rank is 2. Two plus one equals three, the input dimension. Since n exceeds m the map cannot be one-to-one.",
      layers: [
        {
          kind: "connection",
          title: "The total is 3, not 2",
          body: "The output space is two-dimensional, and it is tempting to expect a $2$ on the right. But the budget being spent is the *input* dimension: three directions went in, two survived, one was crushed. $m = 2$ appears only as the ceiling that forced the crushing.",
        },
      ],
    },
  ],
  callouts: [
    {
      id: "total-is-n",
      title: "“rank + nullity = $m$, the output dimension”",
      belief:
        "The rank measures something in the output space, so the total should be the output dimension.",
      confront:
        "Try it on $" + WIDE_TEX + "$. Here $\\operatorname{rank} = 2$ and $\\operatorname{nullity} = 1$, so the total is $3$ — but $m = 2$. The identity would be false.",
      resolve:
        "The theorem counts what the map was **given**, and it was given $n$ input dimensions. Each is spent on exactly one fate. The output dimension $m$ has a different job entirely: it caps the rank at $\\min(m,n)$. Budget on the right; ceiling on the rank.",
    },
    {
      id: "onto-iff-one-to-one",
      title: "“One-to-one and onto are the same thing”",
      belief:
        "Lesson 6 showed that for an invertible matrix, unique solutions and reachable targets came together — so the two properties should always coincide.",
      confront:
        "$" + WIDE_TEX + "$ is onto $\\mathbb{R}^2$ but has a nontrivial null space, so it is not one-to-one. And $\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\\\ 5 & 6\\end{bmatrix}$ is one-to-one but its image is a plane inside $\\mathbb{R}^3$, so it is not onto.",
      resolve:
        "**They coincide only for square maps**, $m = n$. There, rank maximal means both at once. For any other shape the law forces them apart: $n > m$ kills one-to-one, and $n < m$ kills onto. Lesson 6's equivalence list was a square-matrix theorem.",
    },
    {
      id: "not-a-decomposition",
      title: "“The input space splits into the column space and the null space”",
      belief:
        "The two counts add to $n$, so the two subspaces must fit together to make up $\\mathbb{R}^n$.",
      confront:
        "For $" + WIDE_TEX + "$, $\\operatorname{Null}(A)$ lives in $\\mathbb{R}^3$ but $\\operatorname{Col}(A)$ lives in $\\mathbb{R}^2$ — they are not subsets of the same space, so their “sum” is not even a well-formed expression. Even for a square map, the two generally overlap rather than complement.",
      resolve:
        "What adds to $n$ is the pair of **counts**, not the spaces. The proof reaches them by choosing a basis extension of $\\operatorname{Null}(A)$; a different choice gives different vectors and the same numbers. Only the counts are canonical.",
    },
  ],
  checkpoint: {
    prompt:
      "A $4\\times4$ map has a 3-dimensional image. How many dimensions were crushed — and how do you know without seeing a single entry of the matrix?",
    answer:
      "One. The budget is $n = 4$, and $\\operatorname{rank} = 3$ of those dimensions survived, so $\\operatorname{nullity} = 4 - 3 = 1$: the null space is a line. No entries are needed, because the theorem pins the total at $n$ regardless of what the map actually is. (And since this map is square with rank $< n$, it is neither one-to-one nor onto.)",
  },
  checkpoints: [
    {
      id: "ceiling-vs-budget",
      prompt:
        "For a $2\\times3$ map, which number is the running total of the ledger — $2$ or $3$? And which one is a ceiling on how much can survive?",
      answer:
        "The total is $3$: that is $n$, the input dimension, the number of directions the map was handed. The $2$ is the **ceiling** — $\\operatorname{rank} \\le \\min(m,n) = 2$ — because the image has to fit inside a two-dimensional output space. The two numbers do different jobs, and confusing them is what makes people write $\\operatorname{rank} + \\operatorname{nullity} = m$. Here the ceiling forces at least $3 - 2 = 1$ dimension to be crushed.",
    },
  ],
  exercises: [
    {
      id: "rn-which-total",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "For an $m \\times n$ matrix, the rank–nullity theorem says $\\operatorname{rank} + \\operatorname{nullity}$ equals…",
      choices: [
        "$m$, the output dimension",
        "$n$, the input dimension",
        "$\\min(m, n)$",
        "$m + n$",
      ],
      correctChoice: 1,
      explanation:
        "The theorem accounts for what the map was *given*: $n$ input dimensions, each spent on exactly one fate. $m$ appears only as a ceiling, $\\operatorname{rank} \\le \\min(m,n)$ — a different role.",
    },
    {
      id: "rn-wide-ledger",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "A $2 \\times 3$ map has $\\operatorname{rank} 2$. What is its nullity?",
      choices: ["0", "1", "2", "3"],
      correctChoice: 1,
      explanation:
        "$n = 3$ (three columns, three input dimensions), so $\\operatorname{nullity} = 3 - 2 = 1$. Reading the total as $m = 2$ would have given $0$ — and would have claimed the map is one-to-one, which no $\\mathbb{R}^3 \\to \\mathbb{R}^2$ map can be.",
    },
    {
      id: "rn-complete-ledger-fresh",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "Complete the ledger for two fresh maps of different shapes.",
      config: {
        steps: [
          {
            kind: "numeric",
            prompt:
              "$" + FRESH_WIDE_TEX + "$ has rank $2$. What is its nullity?",
            expected: freshWideNullity,
            explanation:
              "It has 4 columns, so $n = 4$ and $\\operatorname{nullity} = 4 - 2 = 2$. Note the shape: $n = 4 > 2 = m$, so at least $2$ dimensions had to be crushed — the law predicted this before you looked.",
          },
          {
            kind: "numeric",
            prompt:
              "$" + FRESH_SQUARE_TEX + "$ — every row is a multiple of $(1,2,1)$. What is its rank?",
            expected: freshSquareRank,
            explanation:
              "All rows are proportional, so one pivot: $\\operatorname{rank} = 1$.",
          },
          {
            kind: "numeric",
            prompt: "…and its nullity?",
            expected: freshSquareNullity,
            explanation:
              "$n = 3$, so $\\operatorname{nullity} = 3 - 1 = 2$: a plane of inputs is crushed. This map is square and neither one-to-one nor onto — squareness permits both, it does not guarantee them.",
          },
        ],
      },
    },
    {
      id: "rn-rank-ceiling",
      type: "numeric",
      tier: "drill",
      prompt:
        "What is the largest possible rank of a $3 \\times 5$ matrix (3 rows, 5 columns)?",
      expected: 3,
      tolerance: 1e-9,
      explanation:
        "$\\operatorname{rank} \\le \\min(m, n) = \\min(3, 5) = 3$: the image lives in $\\mathbb{R}^3$ and cannot have more than 3 dimensions. So the nullity is at least $5 - 3 = 2$, and no such map is one-to-one.",
    },
    {
      id: "rn-eigen-multiplicity",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "Put the law to work. For $A = " + DEFECTIVE_TEX + "$, the number $\\lambda = 5$ is a repeated root of the characteristic polynomial. How many independent eigendirections does it actually give?",
      config: {
        steps: [
          {
            kind: "numeric",
            prompt:
              "First compute $\\operatorname{rank}(A - 5I)$, where $A - 5I = \\begin{bmatrix} 0 & 1 \\\\ 0 & 0 \\end{bmatrix}$.",
            expected: 1,
            explanation:
              "One nonzero row, so one pivot: the rank is $1$.",
          },
          {
            kind: "numeric",
            prompt:
              "Now apply rank–nullity to $A - 5I$ (here $n = 2$): what is $\\dim\\operatorname{Null}(A - 5I)$?",
            expected: defectiveGeometric,
            explanation:
              "$\\operatorname{nullity} = n - \\operatorname{rank} = 2 - 1 = 1$. So the eigenvalue $5$ repeats twice in the characteristic polynomial but supplies only **one** line of eigendirections — a *defective* matrix. Without rank–nullity, “repeated eigenvalue” and “two eigendirections” are easy to confuse; with it, the difference is a rank computation.",
          },
        ],
      },
    },
    {
      id: "rn-zero-map-ledger",
      type: "numeric",
      tier: "drill",
      prompt:
        "The zero map on $\\mathbb{R}^5$ sends every vector to $\\mathbf{0}$. What is its nullity?",
      expected: 5,
      tolerance: 1e-9,
      explanation:
        "Nothing survives, so $\\operatorname{rank} = 0$ and $\\operatorname{nullity} = 5 - 0 = 5$: the entire input space is crushed. The ledger still balances — this is the extreme where every token goes to one column.",
    },
    {
      id: "rn-impossible-map",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "Which of these maps **cannot** exist?",
      choices: [
        "A one-to-one map $\\mathbb{R}^2 \\to \\mathbb{R}^5$",
        "A one-to-one map $\\mathbb{R}^5 \\to \\mathbb{R}^2$",
        "An onto map $\\mathbb{R}^5 \\to \\mathbb{R}^2$",
        "A map $\\mathbb{R}^3 \\to \\mathbb{R}^3$ that is neither one-to-one nor onto",
      ],
      correctChoice: 1,
      explanation:
        "For $\\mathbb{R}^5 \\to \\mathbb{R}^2$: $n = 5 > 2 = m$, so $\\operatorname{nullity} \\ge 5 - 2 = 3 > 0$ — something is always crushed, so it is never one-to-one. The others are all fine: a one-to-one $\\mathbb{R}^2 \\to \\mathbb{R}^5$ has rank 2 and nullity 0; an onto $\\mathbb{R}^5 \\to \\mathbb{R}^2$ has rank 2 and nullity 3; and a rank-1 map $\\mathbb{R}^3 \\to \\mathbb{R}^3$ is neither.",
    },
    {
      id: "rn-square-only",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "For which matrices is “one-to-one” equivalent to “onto”?",
      choices: [
        "All matrices",
        "Square matrices only",
        "Only invertible matrices",
        "Only matrices with more columns than rows",
      ],
      correctChoice: 1,
      explanation:
        "One-to-one means $\\operatorname{nullity} = 0$, i.e. $\\operatorname{rank} = n$; onto means $\\operatorname{rank} = m$. These are the same condition exactly when $m = n$. That is why Lesson 6 could bundle invertibility, trivial null space, and one-solution-for-every-$\\mathbf{b}$ into a single list — it was a square-matrix theorem all along.",
    },
    {
      id: "rn-not-a-decomposition",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "Since $\\operatorname{rank} + \\operatorname{nullity} = n$, is it correct to say $\\mathbb{R}^n = \\operatorname{Col}(A) \\oplus \\operatorname{Null}(A)$?",
      choices: [
        "Yes — that is exactly what the theorem states",
        "No — the counts add up, but the two spaces need not even lie in the same $\\mathbb{R}^k$",
        "Yes, but only for square matrices",
        "No, because $\\operatorname{Col}(A)$ is not a subspace",
      ],
      correctChoice: 1,
      explanation:
        "The theorem adds two **numbers**, not two spaces. For a $2\\times3$ map, $\\operatorname{Null}(A) \\subseteq \\mathbb{R}^3$ while $\\operatorname{Col}(A) \\subseteq \\mathbb{R}^2$, so the sum is not even well formed. The proof reaches the counts by choosing a basis extension of $\\operatorname{Null}(A)$ — a choice, not a canonical decomposition. (Option 4 is simply false: $\\operatorname{Col}(A)$ is always a subspace.)",
    },
    {
      id: "rn-prove-theorem",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt:
        "Prove it: show that $\\operatorname{rank}A + \\operatorname{nullity}A = n$. Start from a basis of $\\operatorname{Null}(A)$, extend it to a basis of the input space, and show the images of the vectors you added form a basis of $\\operatorname{Col}(A)$. Write your proof, then compare.",
      config: {
        modelAnswer:
          "Let $k = \\operatorname{nullity}A$ and pick a basis $\\{\\mathbf{u}_1,\\dots,\\mathbf{u}_k\\}$ of $\\operatorname{Null}(A)$. Extend it to a basis $\\{\\mathbf{u}_1,\\dots,\\mathbf{u}_k,\\mathbf{w}_1,\\dots,\\mathbf{w}_r\\}$ of the input space, so $k + r = n$. **Spanning:** every $\\mathbf{x}$ can be written $\\sum c_i\\mathbf{u}_i + \\sum d_j\\mathbf{w}_j$, and applying $A$ gives $A\\mathbf{x} = \\sum c_i A\\mathbf{u}_i + \\sum d_j A\\mathbf{w}_j = \\sum d_j A\\mathbf{w}_j$, since each $A\\mathbf{u}_i = \\mathbf{0}$. Every output is therefore a combination of the $A\\mathbf{w}_j$, so they span $\\operatorname{Col}(A)$. **Independence:** suppose $\\sum d_j A\\mathbf{w}_j = \\mathbf{0}$. By linearity $A(\\sum d_j\\mathbf{w}_j) = \\mathbf{0}$, so $\\sum d_j\\mathbf{w}_j \\in \\operatorname{Null}(A)$ and can be written $\\sum c_i\\mathbf{u}_i$ for some $c_i$. Rearranging, $\\sum d_j\\mathbf{w}_j - \\sum c_i\\mathbf{u}_i = \\mathbf{0}$ is a dependency among basis vectors, so every coefficient vanishes — in particular every $d_j = 0$. Hence $\\{A\\mathbf{w}_j\\}$ is independent, and being a spanning independent set it is a basis of $\\operatorname{Col}(A)$. Therefore $\\operatorname{rank}A = r$ and $\\operatorname{rank}A + \\operatorname{nullity}A = r + k = n$. Note that the extension was a *choice*: a different one gives a different basis of the image but the same count, which is what makes rank well defined.",
        rubric:
          "A strong answer proves BOTH that the images span and that they are independent — a proof that only shows spanning has not established the count. It should use $A\\mathbf{u}_i = \\mathbf{0}$ explicitly in the spanning step, use the basis property to kill the coefficients in the independence step, and ideally note that the basis extension is a choice while the counts are not.",
      },
    },
  ],
  keyTakeaway:
    "The input dimension $n$ is a budget the map spends: every input direction either survives into the image or collapses into the null space — never both, never neither — so $\\operatorname{rank}A + \\operatorname{nullity}A = n$. The total is the **input** dimension; the output dimension $m$ is only a ceiling, $\\operatorname{rank} \\le \\min(m,n)$. Because the total is fixed, the two counts are one measurement, and whole classes of maps become impossible: nothing from a bigger space to a smaller one is one-to-one, nothing from a smaller to a bigger is onto, and only for square maps do the two properties coincide.",
  structuredSummary: {
    coreMentalModel:
      "A ledger that must balance: $n$ dimensions in, each posted to survived or crushed, total unchanged.",
    definitionsIntroduced: [
      "$\\dim V$ (well defined because all bases have the same size) and $\\operatorname{nullity}A$",
      "One-to-one and onto, stated as $\\operatorname{nullity} = 0$ and $\\operatorname{rank} = m$",
    ],
    mainResult:
      "$\\operatorname{rank}A + \\operatorname{nullity}A = n$, with $\\operatorname{rank}A \\le \\min(m,n)$; one-to-one $\\iff$ onto only when $m = n$.",
    representationsConnected:
      "The ledger's two columns (picture) ↔ a basis extension and its images (proof) ↔ the pivot/free split (computation).",
    commonMistake:
      "Putting $m$ on the right-hand side, or reading the theorem as a decomposition $\\mathbb{R}^n = \\operatorname{Col}(A) \\oplus \\operatorname{Null}(A)$.",
    canonicalExample:
      "$" + WIDE_TEX + "$: rank 2, nullity 1, total 3 — onto $\\mathbb{R}^2$ yet never one-to-one.",
    oneProblemWorthRemembering:
      "Decide whether a described map can exist, from its shape alone.",
    whatThisUnlocksNext:
      "Geometric multiplicity $= n - \\operatorname{rank}(A - \\lambda I)$ — which repeated eigenvalues give a plane of directions, and which give only a line.",
  },
};
