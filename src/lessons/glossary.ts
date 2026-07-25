/**
 * Course glossary (prototype).
 *
 * A cross-lesson reference layer: the concept graph
 * (INTERACTIVE_TEXTBOOK_VISION §14) turned into scannable, re-enterable term
 * entries. The glossary **references** lessons by id and never restates lesson
 * content — it names each term precisely, gives the one-line intuition, records
 * the notation, and links terms to their prerequisites and neighbors so a
 * returning learner can rejoin the story anywhere.
 *
 * All notation is KaTeX-in-prose (`$...$`), rendered through `ProseWithMath`.
 * Term ids are `ConceptId`-style lowercase slugs (see `src/platform/identity`).
 */

export type GlossaryTerm = {
  /** ConceptId-style lowercase slug (unique). */
  id: string;
  /** Display name. */
  term: string;
  /** The precise, textbook-grade definition (KaTeX-in-prose). */
  definition: string;
  /** The one-sentence intuitive handle (the mental model, §7). */
  intuition: string;
  /** Canonical notation for the concept (KaTeX-in-prose). */
  notation?: string;
  /**
   * Optional note on how the *notation* relates to the *object* — the
   * object-vs-representation distinction (§12). Present on terms where a symbol
   * is easily confused with the thing it names.
   */
  notationNote?: string;
  /** Lesson id where the term is first introduced (resolved via the registry). */
  firstLessonIntroduced?: string;
  /** Prerequisite term ids (must be understood first). */
  prerequisites?: string[];
  /** Concrete positive examples (KaTeX-in-prose). */
  examples?: string[];
  /** Instructive non-examples — cases the term does *not* cover. */
  nonExamples?: string[];
  /** Related term ids (neighbors in the concept graph). */
  relatedTerms?: string[];
};

/**
 * Course-wide guidance on reading notation, centered on the durable
 * **object vs. representation** distinction. A symbol names an object relative
 * to a choice (a basis, coordinates); the object itself is invariant. This is
 * the single most common source of confusion in the course, so it is stated
 * once here and reused per-term via `notationNote`.
 */
export const GLOSSARY_NOTATION_GUIDANCE =
  "Notation names an *object*, and often names it *relative to a choice*. " +
  "The arrow $\\mathbf{p}$ is one fixed object; $(4, 1)$ and $[\\mathbf{p}]_B = (1, 1)$ " +
  "are two *representations* of it, in the standard basis and in $B = (\\mathbf{v}, \\mathbf{w})$. " +
  "Read a coordinate tuple, a matrix, or a component list as *a description under a chosen basis*, " +
  "never as the object itself — the object does not move when you re-describe it.";

export const GLOSSARY_TERMS: readonly GlossaryTerm[] = [
  {
    id: "vector",
    term: "Vector",
    definition:
      "An element of a vector space; in the plane, an arrow from the origin whose coordinates are the horizontal and vertical movement to its tip.",
    intuition: "An arrow representing displacement or quantity.",
    notation: "$\\mathbf{v} = \\begin{bmatrix} v_1 \\\\ v_2 \\end{bmatrix}$",
    notationNote:
      "The column of numbers is the vector's *representation* in a basis, not the arrow itself. The same arrow has different columns in different bases.",
    firstLessonIntroduced: "vectors",
    examples: [
      "$\\mathbf{v} = \\begin{bmatrix} 1 \\\\ 2 \\end{bmatrix}$ — one unit right, two up",
      "The standard basis vectors $\\mathbf{e}_1 = \\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix}$, $\\mathbf{e}_2 = \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}$",
    ],
    nonExamples: [
      "A bare pair of numbers with no space or basis fixed — coordinates presuppose a basis",
    ],
    relatedTerms: ["span", "basis", "coordinates", "linear-transformation"],
  },
  {
    id: "span",
    term: "Span",
    definition:
      "The set of all linear combinations $a\\mathbf{v} + b\\mathbf{w} + \\dots$ of a collection of vectors.",
    intuition: "Reachability: every point you can get to using the directions you have.",
    notation: "$\\operatorname{span}\\{\\mathbf{v}, \\mathbf{w}\\}$",
    firstLessonIntroduced: "vectors",
    prerequisites: ["vector"],
    examples: [
      "Two independent plane vectors span all of $\\mathbb{R}^2$",
      "A single nonzero vector spans the line through it",
    ],
    nonExamples: [
      "A dependent pair $\\mathbf{w} = 2\\mathbf{v}$ spans only a line, not the plane",
    ],
    relatedTerms: ["vector", "basis", "independence", "column-space"],
  },
  {
    id: "independence",
    term: "Linear independence",
    definition:
      "Vectors are linearly independent when no nontrivial combination equals $\\mathbf{0}$ — equivalently, none is a linear combination of the others. In the plane, two vectors are independent iff neither is a scalar multiple of the other.",
    intuition: "Genuinely different directions — none is redundant.",
    notation: "$a\\mathbf{v} + b\\mathbf{w} = \\mathbf{0} \\Rightarrow a = b = 0$",
    firstLessonIntroduced: "vectors",
    prerequisites: ["vector", "span"],
    examples: [
      "$\\mathbf{v} = (1, 2)$ and $\\mathbf{w} = (3, -1)$ are independent (cross term $1\\cdot(-1) - 2\\cdot 3 = -7 \\neq 0$)",
    ],
    nonExamples: [
      "$\\mathbf{v} = (1, 2)$ and $(2, 4)$ are *dependent* — the second is $2\\mathbf{v}$",
    ],
    relatedTerms: ["span", "basis", "determinant", "invertibility"],
  },
  {
    id: "basis",
    term: "Basis",
    definition:
      "An ordered, linearly independent set that spans the space. In the plane, any two independent vectors form a basis.",
    intuition: "A minimal coordinate language for the space.",
    notation: "$B = (\\mathbf{v}, \\mathbf{w})$",
    firstLessonIntroduced: "vectors",
    prerequisites: ["span", "independence"],
    examples: [
      "The standard basis $(\\mathbf{e}_1, \\mathbf{e}_2)$",
      "$B = ((1, 2), (3, -1))$ — independent and spanning, though not perpendicular",
    ],
    nonExamples: [
      "A dependent pair (spans only a line — fails to span)",
      "Three vectors in the plane (spanning but not independent)",
    ],
    relatedTerms: ["independence", "span", "coordinates", "vector"],
  },
  {
    id: "coordinates",
    term: "Coordinates",
    definition:
      "The unique coefficients $(a, b)$ expressing a vector in a chosen basis: $\\mathbf{p} = a\\mathbf{v} + b\\mathbf{w}$, written $[\\mathbf{p}]_B = (a, b)$.",
    intuition: "The vector's *name* in a particular coordinate language.",
    notation: "$[\\mathbf{p}]_B = \\begin{bmatrix} a \\\\ b \\end{bmatrix}$",
    notationNote:
      "Coordinates are a representation *relative to* $B$. The same fixed arrow $\\mathbf{p}$ is $(4, 1)$ in the standard basis and $(1, 1)$ in $B = (\\mathbf{v}, \\mathbf{w})$ — the arrow is the object, the tuple is its name.",
    firstLessonIntroduced: "vectors",
    prerequisites: ["basis"],
    examples: [
      "$\\mathbf{p} = \\mathbf{v} + \\mathbf{w}$ has $[\\mathbf{p}]_B = (1, 1)$ while $[\\mathbf{p}]_E = (4, 1)$",
    ],
    nonExamples: [
      "Claiming a vector \u201cis\u201d $(4, 1)$ with no basis named — coordinates require a basis",
    ],
    relatedTerms: ["basis", "vector", "linear-transformation"],
  },
  {
    id: "linear-transformation",
    term: "Linear transformation",
    definition:
      "A map $T$ preserving addition and scaling: $T(a\\mathbf{u} + b\\mathbf{v}) = aT(\\mathbf{u}) + bT(\\mathbf{v})$. In the plane it is fixed by where the basis vectors land, packed as the columns of a matrix $A$.",
    intuition: "A machine that moves every point consistently, keeping the grid straight and evenly spaced.",
    notation: "$A = \\begin{bmatrix} A\\mathbf{e}_1 & A\\mathbf{e}_2 \\end{bmatrix}$",
    notationNote:
      "The *columns* of $A$ are the images $A\\mathbf{e}_1, A\\mathbf{e}_2$ of the basis vectors — read columns, not rows. The matrix is the transformation's representation in the standard basis.",
    firstLessonIntroduced: "transformations",
    prerequisites: ["vector", "basis", "coordinates"],
    examples: [
      "$A = \\begin{bmatrix} 2 & 1 \\\\ 0 & 1 \\end{bmatrix}$ shears while scaling the horizontal direction",
    ],
    nonExamples: [
      "A translation $\\mathbf{x} \\mapsto \\mathbf{x} + \\mathbf{b}$ (moves the origin — not linear)",
    ],
    relatedTerms: ["coordinates", "column-space", "determinant", "eigenvector"],
  },
  {
    id: "column-space",
    term: "Column space",
    definition:
      "The span of the columns of a matrix $A$ — every output $A\\mathbf{x}$ is a combination of the columns, so the column space is exactly the set of reachable outputs.",
    intuition: "Everywhere the transformation can send a vector — its reachable outputs.",
    notation: "$\\operatorname{Col}(A) = \\operatorname{span}\\{A\\mathbf{e}_1, A\\mathbf{e}_2\\}$",
    firstLessonIntroduced: "systems",
    prerequisites: ["span", "linear-transformation"],
    examples: [
      "If the columns are independent, $\\operatorname{Col}(A)$ is all of $\\mathbb{R}^2$",
    ],
    nonExamples: [
      "If the columns are dependent, $\\operatorname{Col}(A)$ is only a line, so most targets $\\mathbf{b}$ are unreachable",
    ],
    relatedTerms: ["span", "consistency", "linear-transformation", "invertibility"],
  },
  {
    id: "consistency",
    term: "Consistency (of a system)",
    definition:
      "A system $A\\mathbf{x} = \\mathbf{b}$ is consistent when it has at least one solution — equivalently, when $\\mathbf{b}$ lies in the column space of $A$.",
    intuition: "The target is reachable: $\\mathbf{b}$ is some recipe of the columns.",
    notation: "$A\\mathbf{x} = \\mathbf{b},\\ \\ \\mathbf{b} \\in \\operatorname{Col}(A)$",
    firstLessonIntroduced: "systems",
    prerequisites: ["column-space"],
    examples: [
      "$\\mathbf{b}$ inside the column space \u2192 a solution exists (unique if columns independent)",
    ],
    nonExamples: [
      "$\\mathbf{b}$ off a dependent column line \u2192 *inconsistent*, no solution",
    ],
    relatedTerms: ["column-space", "invertibility", "independence"],
  },
  {
    id: "invertibility",
    term: "Invertibility",
    definition:
      "A square matrix $A$ is invertible when there is a matrix $A^{-1}$ with $A^{-1}A = I$; equivalently its columns are independent, so $A\\mathbf{x} = \\mathbf{b}$ has a unique solution for every $\\mathbf{b}$.",
    intuition: "The transformation can be undone — no information is lost.",
    notation: "$A^{-1}A = AA^{-1} = I$",
    // Introduced in L6, where the inverse is BUILT (its columns solve
    // A x = e_j). Determinants (L7) then names the number that detects it.
    firstLessonIntroduced: "matrix-composition",
    prerequisites: ["linear-transformation", "independence", "consistency"],
    examples: [
      "A rotation is invertible — rotate back by the same angle",
    ],
    nonExamples: [
      "A projection onto a line is *not* invertible — it collapses a dimension, so $\\det = 0$",
    ],
    relatedTerms: ["determinant", "consistency", "column-space"],
  },
  {
    id: "determinant",
    term: "Determinant",
    definition:
      "The signed area factor of a linear map: $\\det(A)$ is the (signed) area of the parallelogram that the unit square becomes. Zero means the image collapses to a line or point.",
    intuition: "How a transformation scales oriented area, with zero marking dimensional collapse.",
    notation: "$\\det\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} = ad - bc$",
    notationNote:
      "$|\\det A|$ is the area factor; the *sign* is orientation (a handedness flip), not a negative amount of area.",
    firstLessonIntroduced: "determinants",
    prerequisites: ["linear-transformation", "independence"],
    examples: [
      "$\\det\\begin{bmatrix} 2 & 1 \\\\ 0 & 1 \\end{bmatrix} = 2$ — area doubled, orientation preserved",
    ],
    nonExamples: [
      "$\\det = 0$ is not \u201ca small number\u201d — it is collapse: the columns are dependent and the map is singular",
    ],
    relatedTerms: ["invertibility", "independence", "eigenvector"],
  },
  {
    id: "eigenvector",
    term: "Eigenvector",
    definition:
      "A nonzero vector $\\mathbf{v}$ whose direction the map preserves up to scaling: $A\\mathbf{v} = \\lambda\\mathbf{v}$ for a scalar eigenvalue $\\lambda$.",
    intuition: "A direction the transformation refuses to mix — it stays on its own line.",
    notation: "$A\\mathbf{v} = \\lambda\\mathbf{v},\\ \\ \\mathbf{v} \\neq \\mathbf{0}$",
    notationNote:
      "An eigenvector keeps its *line*, not necessarily its *direction*: $\\lambda < 0$ reverses the arrow while it stays on the same line.",
    firstLessonIntroduced: "eigenvectors",
    prerequisites: ["linear-transformation", "determinant"],
    examples: [
      "For $A = \\begin{bmatrix} 3 & 1 \\\\ 0 & 2 \\end{bmatrix}$: $\\lambda = 3$ along $(1, 0)$ and $\\lambda = 2$ along $(-1, 1)$",
    ],
    nonExamples: [
      "A pure rotation (other than by $0$ or $180^\\circ$) has no real eigenvector — every direction is mixed",
    ],
    relatedTerms: ["determinant", "linear-transformation", "invertibility"],
  },
  {
    id: "binary-search-tree",
    term: "Binary search tree",
    definition:
      "A binary tree over an ordered key set in which, at every node, every key in the left subtree is smaller than the node's key and every key in the right subtree is larger.",
    intuition:
      "A comparison-decision procedure, stored: every node is a comparison you already made, so the path you walk is the search.",
    notation: "$\\text{legal at a position} \\iff lo < \\text{key} < hi$",
    notationNote:
      "The condition is *global*, not local: a position's legal range is inherited from the whole path above it, so a tree can satisfy every parent–child comparison and still not be a search tree.",
    firstLessonIntroduced: "binary-search-trees",
    prerequisites: [],
    examples: [
      "Inserting $16, 8, 42, 4, 15, 23, 50$ builds a tree of height $2$ on those keys",
    ],
    nonExamples: [
      "Root $25$ with right child $30$ and $20$ under $30$: every parent–child pair is ordered, but $20$ sits where only keys above $25$ may live",
    ],
    relatedTerms: ["tree-height", "in-order-traversal"],
  },
  {
    id: "tree-height",
    term: "Height (of a tree)",
    definition:
      "The number of **edges** on the longest root-to-leaf path. A single node has height $0$; the empty tree has height $-1$.",
    intuition:
      "The number of levels below the root — and, for a search tree, the worst-case search cost minus one.",
    notation: "$h$, with worst-case search cost $h + 1$ comparisons",
    notationNote:
      "Counting edges (not nodes) is what makes $n \\le 2^{h+1} - 1$ and $\\lceil\\log_2(n+1)\\rceil - 1 \\le h \\le n-1$ come out without off-by-one corrections.",
    firstLessonIntroduced: "binary-search-trees",
    prerequisites: ["binary-search-tree"],
    examples: [
      "Seven keys: height $2$ from median-first insertion, height $6$ from sorted insertion",
    ],
    nonExamples: [
      "Height is not the node count, and not the average depth — it is the worst case",
    ],
    relatedTerms: ["binary-search-tree"],
  },
  {
    id: "in-order-traversal",
    term: "In-order traversal",
    definition:
      "Visiting a binary tree as left subtree, then the node, then right subtree.",
    intuition:
      "The one traversal that respects the search-tree condition — it reads the intervals left to right, so it always emits the keys in sorted order.",
    notation:
      "$\\text{inorder}(x) = \\text{inorder}(x.\\text{left}) \\;\\Vert\\; [x.\\text{key}] \\;\\Vert\\; \\text{inorder}(x.\\text{right})$",
    notationNote:
      "The output is *shape-independent*: every legal tree on the same keys reads out identically, which is why shape carries cost information and no content information.",
    firstLessonIntroduced: "binary-search-trees",
    prerequisites: ["binary-search-tree"],
    examples: ["Both the balanced tree and the chain on the same seven keys read out $4, 8, 15, 16, 23, 42, 50$"],
    nonExamples: [
      "Pre-order and post-order ignore the ordering condition and do not emit sorted keys",
    ],
    relatedTerms: ["binary-search-tree", "tree-height"],
  },
  {
    id: "red-black-encoding",
    term: "Red–black encoding",
    definition:
      "The map that sends one node of a 2–3–4 tree to a **black representative** together with its extra keys as **red children**: a 2-node to a lone black node, a 3-node to a black node with one red child, a 4-node to a black node with two red children.",
    intuition:
      "Red means \"I am an extra key inside my parent's node\"; black means \"I start a new level.\"",
    notation: "$T \\mapsto E(T)$, with $bh(E(T)) = \\operatorname{height}(T)$",
    notationNote:
      "The colour bit records **membership**, not recency or importance. Every one of the five red-black properties is a restatement of something the 2–3–4 tree already guaranteed.",
    firstLessonIntroduced: "red-black-trees",
    prerequisites: ["binary-search-tree"],
    examples: [
      "Black 40 with red child 20 encodes the 3-node $\\{20, 40\\}$",
    ],
    nonExamples: [
      "A red child of a red node is **not** a five-key node — it is the same node drawn illegally, repaired by a rotation",
    ],
    relatedTerms: ["black-height", "binary-search-tree"],
  },
  {
    id: "black-height",
    term: "Black height",
    definition:
      "For a node $x$, the number of **black** nodes on any path from $x$ down to a `nil` leaf, counting the `nil` leaf (which is black) but not $x$ itself.",
    intuition:
      "The height of the 2–3–4 tree underneath: reds add keys within a level, only blacks start a new one.",
    notation: "$bh(x)$; and $n \\ge 2^{bh}-1$, so $\\operatorname{height} \\le 2\\log_2(n+1)$",
    notationNote:
      "A split preserves a subtree's **external** black height — counted on a path entering from outside, so the representative's own colour counts. Measured from the node exclusive instead, it is not preserved, and the theorem is false.",
    firstLessonIntroduced: "red-black-trees",
    prerequisites: ["red-black-encoding", "tree-height"],
    examples: [
      "The tree with black 40, red 20 over blacks 10 and 30, and black 60 over reds 50 and 70 has $bh = 2$",
    ],
    nonExamples: [
      "A local recolour does not change the tree's total black height — only a split that reaches the root does, and it raises every path at once",
    ],
    relatedTerms: ["red-black-encoding", "tree-height"],
  },
];

/** Terms indexed by id, for lookups and referential-integrity checks. */
export const GLOSSARY_BY_ID: ReadonlyMap<string, GlossaryTerm> = new Map(
  GLOSSARY_TERMS.map((t) => [t.id, t]),
);

export function getGlossaryTerm(id: string): GlossaryTerm | undefined {
  return GLOSSARY_BY_ID.get(id);
}
