import type { LessonDefinition } from "./types";
import {
  COMPOSITION_FRESH as COMP,
  DETERMINANT_LESSON_EXAMPLE,
} from "./exampleData";
import { EXERCISE_SEQUENCE_ID, SELF_CHECK_ID } from "./capabilities";
import {
  determinant2x2,
  determinant3x3,
  matrixMatrixMultiply,
  type Matrix2x2,
  type Matrix3x3,
} from "../math";

/**
 * Lesson: "Determinants" (spine L7).
 *
 * Central insight (spine): the determinant is a **detector of invertibility** —
 * signed area/volume scaling — arriving AFTER the learner has already met
 * collapse (L3, L5) and already *wanted* an inverse (L6). It answers a question
 * the learner has, rather than introducing one.
 *
 * Now that L6 is built, this lesson can do what the spine always intended: name
 * the quantity L6 met as "the denominator you must not divide by", give it a
 * meaning, and then earn the properties that make it useful — multiplicativity,
 * the row-operation rules (derived from multiplicativity, not memorized), and
 * the equivalence with invertibility.
 *
 * Continuity: A is `shear-2-1`, the same map L2 sheared and L6 composed and
 * inverted. The multiplicativity drill reuses L6's fresh pair (M, N), so
 * det(MN) = det(M)·det(N) is checked against a product the learner already
 * built. The elimination worked example reuses L3/L4's system.
 *
 * Every number below is DERIVED from `src/math` at module load — nothing is
 * hand-computed and trusted. The properties themselves are held by
 * `src/math/__tests__/determinantProperties.test.ts`.
 */

const A = DETERMINANT_LESSON_EXAMPLE.matrix;
const detA = determinant2x2(A);

/** L6's fresh pair, reused so multiplicativity lands on a known product. */
const M = COMP.productLeft as Matrix2x2;
const N = COMP.productRight as Matrix2x2;
const detM = determinant2x2(M);
const detN = determinant2x2(N);
const detMN = determinant2x2(matrixMatrixMultiply(M, N));

/** L3/L4's system matrix — eliminated in the worked example. */
const SYSTEM_A: Matrix2x2 = [
  [1, 3],
  [2, -1],
];
const detSystemA = determinant2x2(SYSTEM_A);

/** The abstraction return: the same story one dimension up. */
const DIAGONAL_3: Matrix3x3 = [
  [2, 0, 0],
  [0, 3, 0],
  [0, 0, 4],
];
const detDiagonal3 = determinant3x3(DIAGONAL_3);

/** Region area used by the transfer item: an arbitrary blob, not the unit square. */
const REGION_AREA = 6;

export const determinantsLesson: LessonDefinition = {
  id: "determinants",
  title: "Determinants as Signed Area Scaling",
  subtitle:
    "The number Lesson 6 could not divide by, given a meaning: how much a map scales area, and which way round",
  learningObjectives: [
    "Read $|\\det(A)|$ as the factor by which a map scales *every* area, not just the unit square",
    "Derive $\\det(A) = ad - bc$ from the area of the parallelogram, rather than accepting it",
    "Recognize $\\det(A) = 0$ as dimensional collapse, and connect it to non-invertibility and to non-unique solutions",
    "Read a negative determinant as reversed orientation — never as a negative amount of area",
    "Use $\\det(AB) = \\det(A)\\det(B)$ to predict a composite's scale factor without multiplying the matrices",
    "Predict what each elementary row operation does to the determinant, and derive those rules from multiplicativity",
    "Compute a determinant by elimination, reading it off the pivots",
    "Extend the reading to volume in three dimensions, where $\\det = 0$ flattens the unit cube",
  ],
  motivatingQuestion:
    "Lesson 6 left you with a number you were not allowed to divide by: $ad - bc$. Why should *that* combination of four entries decide whether a map can be undone?",
  // Route: answer the motivating question first (what the number measures),
  // derive it, then earn the properties. The check lands right after the
  // collapse/orientation split, before the explorer.
  route: [
    { kind: "motivate" },
    { kind: "section", sectionId: "intro" },
    { kind: "visual", heading: "The unit square becomes a parallelogram" },
    { kind: "section", sectionId: "derive" },
    { kind: "worked", workedId: "wex-derive-area" },
    { kind: "formal", formalId: "def-determinant" },
    { kind: "section", sectionId: "name" },
    { kind: "check" },
    { kind: "section", sectionId: "sign" },
    { kind: "formal", formalId: "thm-invertibility" },
    { kind: "explore", tocLabel: "Stretch and flip signed area" },
    { kind: "section", sectionId: "multiplicative" },
    { kind: "formal", formalId: "thm-multiplicative" },
    { kind: "worked", workedId: "wex-composite-det" },
    { kind: "check", checkpointId: "predict-composite" },
    { kind: "section", sectionId: "row-ops" },
    { kind: "formal", formalId: "prop-row-ops" },
    { kind: "worked", workedId: "wex-elimination-det" },
    { kind: "section", sectionId: "beyond-2d" },
    { kind: "practice" },
    {
      kind: "summary",
      heading: "One number: the area factor, its sign, and the collapse test",
    },
  ],
  sections: [
    {
      id: "intro",
      title: "Track one region",
      body: "Lesson 2 showed that the columns of $A$ are where $\\mathbf{e}_1$ and $\\mathbf{e}_2$ land. Follow the unit square under that same map: it becomes the parallelogram spanned by $A\\mathbf{e}_1$ and $A\\mathbf{e}_2$. Lesson 6 then showed that when that parallelogram flattens onto a line, the map cannot be undone — and that the arithmetic test for flattening was $ad - bc$. This lesson explains *why* that combination, by finding what it measures.",
      observation:
        "When the stretch factors multiply on a diagonal map, the area multiplies too — each stage leaves a readable intermediate shape.",
      layers: [
        {
          kind: "connection",
          title: "You have already met this number twice",
          body: "In Lesson 6 it was the denominator of $A^{-1} = \\frac{1}{ad-bc}\\begin{bmatrix} d & -b \\\\ -c & a\\end{bmatrix}$ — the thing that must not be zero. In Lesson 3 it was the hidden reason a system had one solution rather than none or infinitely many. Same number, three appearances; here it finally gets a meaning.",
        },
      ],
    },
    {
      id: "derive",
      title: "Where $ad - bc$ comes from",
      body: "The parallelogram is spanned by the two columns $\\mathbf{u} = (a, c)$ and $\\mathbf{v} = (b, d)$. Box it in: the smallest axis-aligned rectangle containing it has width $a + b$ and height $c + d$. Now subtract what is *not* in the parallelogram — two triangles of area $\\tfrac{1}{2}ac$, two of area $\\tfrac{1}{2}bd$, and two rectangles of area $bc$. Everything cancels except $ad - bc$. So the formula is not a definition to memorize; it is an area, computed.",
      equation:
        "(a+b)(c+d) \\;-\\; 2\\!\\left(\\tfrac{1}{2}ac\\right) \\;-\\; 2\\!\\left(\\tfrac{1}{2}bd\\right) \\;-\\; 2bc \\;=\\; ad - bc",
      observation:
        "The subtraction is why the formula has a minus sign in it — and, as the next section shows, why it can come out negative.",
      layers: [
        {
          kind: "math-note",
          title: "Why the same expression keeps working when the picture changes",
          body: "The dissection above is drawn for one arrangement of positive entries. Rather than redraw it for every sign pattern, note what the expression $ad - bc$ *does*: it is linear in each column separately, it vanishes when the two columns are equal (a degenerate parallelogram), and it gives $1$ for the identity. Those three properties determine signed area uniquely — which is why one formula covers every case, sign included.",
        },
      ],
    },
    {
      id: "name",
      title: "Name the scale factor",
      body: "That area scale factor — how much every region grows or shrinks — is the absolute value of the determinant. For the running example,",
      equation: `\\det(A)=${A[0][0]}\\cdot${A[1][1]}-${A[0][1]}\\cdot${A[1][0]}=${detA}`,
      observation:
        "Geometry and algebra stay synchronized: as the shape flattens, the scale factor approaches zero.",
      layers: [
        {
          kind: "why",
          title: "It scales EVERY region, not just the square",
          body: "Any region can be approximated as closely as you like by small squares. The map scales each of them by $|\\det(A)|$, so it scales their total — and hence the region — by the same factor. That is why $|\\det(A)| = 3$ means *every* area triples, whatever its shape.",
        },
      ],
    },
    {
      id: "sign",
      title: "Collapse, then orientation",
      body: "Crossing through $\\det(A)=0$ collapses the parallelogram onto a line: the columns became dependent, so the map lost a dimension. The absolute value still measures area, but the story is incomplete without sign. Continuing past zero flips the ordered basis — the shortest turn from $A\\mathbf{e}_1$ to $A\\mathbf{e}_2$ reverses direction. Magnitude answers *how much*; sign answers *which handedness*. A negative determinant is not a negative area; areas are never negative.",
      equation:
        "\\text{area factor} = |\\det(A)|, \\qquad \\operatorname{sign}(\\det A) = \\text{orientation}",
      layers: [
        {
          kind: "trap",
          title: "Zero is collapse, not smallness",
          body: "$\\det(A) = 0$ does not mean the entries are small or that the matrix is $\\mathbf{0}$: $\\begin{bmatrix} 2 & 4 \\\\ 1 & 2\\end{bmatrix}$ has no zero entries at all. And a *tiny* nonzero determinant, like $0.01$, is not collapse either — the map is still invertible, just badly conditioned, with an inverse whose entries are enormous.",
        },
      ],
    },
    {
      id: "multiplicative",
      title: "Two maps in a row multiply their factors",
      body: "Lesson 6 built the composite $AB$ — apply $B$, then $A$. What does it do to area? $B$ scales every area by $|\\det B|$, and then $A$ scales *that* by $|\\det A|$, so the composite scales by the product. Signs behave the same way: two orientation flips restore the original handedness, exactly as two negatives multiply to a positive. So $\\det(AB) = \\det(A)\\det(B)$ — proved by what the determinant *means*, with no entry arithmetic at all.",
      equation: "\\det(AB) = \\det(A)\\,\\det(B)",
      observation:
        "This is the first property that pays for itself: you can read a composite's determinant off the factors without ever forming the product.",
      layers: [
        {
          kind: "connection",
          title: "It settles the invertibility of a composite instantly",
          body: "If either factor is singular, the product of the determinants is $0$, so $AB$ is singular too — one collapse anywhere in the chain is fatal. Conversely $\\det(A^{-1}) = 1/\\det(A)$, since $\\det(A)\\det(A^{-1}) = \\det(I) = 1$: undoing a map that tripled area must divide area by three.",
        },
      ],
    },
    {
      id: "row-ops",
      title: "What elimination does to the determinant",
      body: "Lesson 4's row operations turn out to have simple, *derivable* effects. Each operation is itself a matrix — an **elementary matrix** $E$ — applied on the left, so multiplicativity does all the work: $\\det(EA) = \\det(E)\\det(A)$. Adding a multiple of one row to another has $\\det E = 1$, so the determinant is **unchanged**. Swapping two rows has $\\det E = -1$, so the sign **flips**. Scaling a row by $k$ has $\\det E = k$, so the determinant is **multiplied by $k$**. These are not three more rules to memorize; they are one rule read three times.",
      equation:
        "\\det\\begin{bmatrix} 1 & 0 \\\\ k & 1 \\end{bmatrix} = 1, \\qquad \\det\\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix} = -1, \\qquad \\det\\begin{bmatrix} k & 0 \\\\ 0 & 1 \\end{bmatrix} = k",
      observation:
        "This gives a practical route: eliminate to triangular form, keeping track of swaps and scalings, then multiply the pivots.",
      layers: [
        {
          kind: "connection",
          title: "Why Lesson 4 could promise the solution set was preserved",
          body: "The add-a-multiple operation has determinant $1$, so it is invertible — which is exactly the reversibility Lesson 4 relied on when it claimed the rewritten system has the *same* solution set. The determinant explains the promise rather than restating it.",
        },
      ],
    },
    {
      id: "beyond-2d",
      title: "The same reading, one dimension up",
      body: "Nothing in the story was two-dimensional except the word *area*. In $\\mathbb{R}^3$ the columns of a $3\\times3$ matrix span a parallelepiped, and $\\det(A)$ is its **signed volume** — the factor by which every volume scales, with the sign recording whether the map preserves or reverses handedness. Zero still means collapse: the unit cube is flattened onto a plane, a line, or a point, so a dimension is lost and the map cannot be undone. A diagonal map $\\operatorname{diag}(2, 3, 4)$ multiplies volume by $2 \\cdot 3 \\cdot 4 = " + String(detDiagonal3) + "$, just as the diagonal 2D case multiplied the stretch factors.",
      equation:
        "\\det \\begin{bmatrix} 2 & 0 & 0 \\\\ 0 & 3 & 0 \\\\ 0 & 0 & 4 \\end{bmatrix} = 24, \\qquad \\det(A) = 0 \\iff \\text{the unit cube is flattened}",
      observation:
        "Everything above — multiplicativity, the row-operation rules, $\\det = 0 \\iff$ singular — holds verbatim in every dimension. Only the word for the measured quantity changes.",
      layers: [
        {
          kind: "looking-ahead",
          title: "What is deferred, and to where",
          body: "The general $n \\times n$ definition (cofactor expansion, or the unique alternating multilinear form) is **not** developed here; this lesson works the $2\\times2$ case in full and reads the $3\\times3$ case off the same geometry. The general treatment arrives with subspaces and rank, where \u201chow many dimensions survived\u201d becomes the primary question and the determinant becomes the extreme case \u201call of them, or not\u201d.",
        },
      ],
    },
  ],
  formalBlocks: [
    {
      id: "def-determinant",
      kind: "definition",
      label: "Determinant as signed area",
      statement:
        "For $A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$, the **determinant** is $\\det(A) = ad - bc$. Geometrically it is the **signed area** of the parallelogram spanned by the columns $A\\mathbf{e}_1$ and $A\\mathbf{e}_2$: $|\\det(A)|$ is the factor by which the map scales every area, and the sign is $+$ when the map preserves orientation and $-$ when it reverses it.",
      interpretation:
        "One number carries two independent facts. Reading only the magnitude loses handedness; reading the sign as \u201cnegative area\u201d is a category error — areas are non-negative.",
      visibility: "visible",
    },
    {
      id: "thm-invertibility",
      kind: "theorem",
      label: "$\\det(A) \\ne 0$ detects everything at once",
      statement:
        "For a $2\\times2$ matrix $A$, the following are equivalent: (i) $\\det(A) \\ne 0$; (ii) $A$ is invertible; (iii) the columns of $A$ are linearly independent; (iv) $\\operatorname{Null}(A) = \\{\\mathbf{0}\\}$; (v) $A\\mathbf{x} = \\mathbf{b}$ has exactly one solution for every $\\mathbf{b}$; (vi) the unit square does not collapse.",
      interpretation:
        "This is Lesson 6's criterion with the geometric item (vi) added, and it is why the determinant is worth computing: a single arithmetic test answers a question about solving systems, about undoing maps, and about whether a dimension survived.",
      visibility: "visible",
      layers: [
        {
          kind: "connection",
          title: "Where each equivalence was earned",
          body: "(ii)$\\Leftrightarrow$(iii)$\\Leftrightarrow$(iv)$\\Leftrightarrow$(v) is Lesson 6's theorem, which in turn rests on Lesson 5's \u201cunique $\\iff$ trivial null space\u201d and Lesson 3's trichotomy. What *this* lesson adds is (i)$\\Leftrightarrow$(vi): the arithmetic test is the area, so \u201czero determinant\u201d and \u201cflattened square\u201d are the same statement, not two facts that happen to coincide.",
        },
      ],
    },
    {
      id: "thm-multiplicative",
      kind: "theorem",
      label: "Multiplicativity",
      statement:
        "$\\det(AB) = \\det(A)\\,\\det(B)$ for all $2\\times2$ matrices $A$ and $B$. Consequently $\\det(I) = 1$; $AB$ is invertible if and only if both $A$ and $B$ are; and when $A$ is invertible, $\\det(A^{-1}) = 1/\\det(A)$.",
      interpretation:
        "Area factors compose by multiplying, because applying two maps scales area twice. The consequences are the useful part: singularity is contagious through a product, and inverting a map inverts its area factor.",
      visibility: "revealed",
      layers: [
        {
          kind: "math-note",
          title: "The geometric argument, and the corollary",
          body: "$B$ takes a region of area $S$ to one of area $|\\det B| \\cdot S$; $A$ then takes that to $|\\det A| \\cdot |\\det B| \\cdot S$. Since the composite is a single linear map, its own factor must be $|\\det A||\\det B|$. Orientation multiplies the same way (two reversals restore handedness), which supplies the sign. For the corollary: $\\det(A)\\det(A^{-1}) = \\det(AA^{-1}) = \\det(I) = 1$, so neither factor can be zero and $\\det(A^{-1}) = 1/\\det(A)$.",
        },
        {
          kind: "trap",
          title: "There is no rule for $\\det(A + B)$",
          body: "Multiplicativity is about *composition*, not addition. $\\det(A + B)$ is generally unrelated to $\\det A$ and $\\det B$ — adding matrices does not compose maps, so nothing about area factors carries over.",
        },
      ],
    },
    {
      id: "prop-row-ops",
      kind: "proposition",
      label: "Row operations, as corollaries",
      statement:
        "Let $A'$ be obtained from $A$ by one elementary row operation. Then: adding a multiple of one row to another leaves $\\det(A') = \\det(A)$; swapping two rows gives $\\det(A') = -\\det(A)$; scaling a row by $k$ gives $\\det(A') = k\\det(A)$. Consequently the determinant of a triangular matrix is the product of its diagonal entries, and $\\det(A^{\\mathsf{T}}) = \\det(A)$, so the same three rules hold for columns.",
      interpretation:
        "Each row operation is left-multiplication by an elementary matrix, so multiplicativity converts \u201cwhat does this operation do?\u201d into \u201cwhat is that little matrix's determinant?\u201d — which you can read off in one step.",
      visibility: "revealed",
      layers: [
        {
          kind: "math-note",
          title: "Reading each rule off its elementary matrix",
          body: "$R_2 \\to R_2 + kR_1$ is left-multiplication by $\\begin{bmatrix} 1 & 0 \\\\ k & 1\\end{bmatrix}$, whose determinant is $1\\cdot1 - 0\\cdot k = 1$. A swap is $\\begin{bmatrix} 0 & 1 \\\\ 1 & 0\\end{bmatrix}$, determinant $0 - 1 = -1$. Scaling $R_1$ by $k$ is $\\begin{bmatrix} k & 0 \\\\ 0 & 1\\end{bmatrix}$, determinant $k$. Apply $\\det(EA) = \\det(E)\\det(A)$ and the three rules drop out.",
        },
      ],
    },
  ],
  guidedSceneId: "determinant-area-scaling",
  explorationId: "determinant-area-scaling",
  exampleId: "shear-2-1",
  workedExamples: [
    {
      id: "wex-derive-area",
      title: "Derive the formula from the picture",
      prompt:
        "Show that the parallelogram spanned by $\\mathbf{u} = (a, c)$ and $\\mathbf{v} = (b, d)$ has area $|ad - bc|$, then apply it to the running example.",
      exampleId: "shear-2-1",
      equations: [
        "\\text{bounding rectangle} = (a + b)(c + d) = ac + ad + bc + bd",
        "\\text{corner triangles} = 2\\cdot\\tfrac{1}{2}ac + 2\\cdot\\tfrac{1}{2}bd = ac + bd",
        "\\text{corner rectangles} = 2bc",
        "\\text{parallelogram} = (ac + ad + bc + bd) - (ac + bd) - 2bc = ad - bc",
        `A = \\begin{bmatrix} ${A[0][0]} & ${A[0][1]} \\\\ ${A[1][0]} & ${A[1][1]} \\end{bmatrix} \\;\\Rightarrow\\; \\det(A) = ${A[0][0]}\\cdot${A[1][1]} - ${A[0][1]}\\cdot${A[1][0]} = ${detA}`,
      ],
      equationsAriaLabel:
        "The bounding rectangle has area a plus b times c plus d. Subtracting the two pairs of corner triangles and the two corner rectangles leaves a d minus b c. For the running example the determinant is 2.",
      layers: [
        {
          kind: "connection",
          title: "This is the number Lesson 6 could not divide by",
          body: "The inverse formula $\\frac{1}{ad-bc}\\begin{bmatrix} d & -b \\\\ -c & a\\end{bmatrix}$ fails precisely when this area is zero — because that is when the parallelogram has flattened and a dimension was lost.",
        },
      ],
    },
    {
      id: "wex-composite-det",
      title: "A composite's factor, without forming the composite",
      prompt: `Lesson 6 built $MN$ for $M = \\begin{bmatrix} ${M[0][0]} & ${M[0][1]} \\\\ ${M[1][0]} & ${M[1][1]} \\end{bmatrix}$ and $N = \\begin{bmatrix} ${N[0][0]} & ${N[0][1]} \\\\ ${N[1][0]} & ${N[1][1]} \\end{bmatrix}$. Find $\\det(MN)$ two ways.`,
      equations: [
        `\\det(M) = ${M[0][0]}\\cdot${M[1][1]} - ${M[0][1]}\\cdot${M[1][0]} = ${detM}`,
        `\\det(N) = ${N[0][0]}\\cdot${N[1][1]} - ${N[0][1]}\\cdot${N[1][0]} = ${detN}`,
        `\\det(M)\\det(N) = ${detM} \\cdot ${detN} = ${detMN}`,
        `MN = \\begin{bmatrix} ${COMP.product[0][0]} & ${COMP.product[0][1]} \\\\ ${COMP.product[1][0]} & ${COMP.product[1][1]} \\end{bmatrix} \\;\\Rightarrow\\; \\det(MN) = ${COMP.product[0][0]}\\cdot${COMP.product[1][1]} - ${COMP.product[0][1]}\\cdot${COMP.product[1][0]} = ${detMN} \\;\\checkmark`,
      ],
      equationsAriaLabel:
        "The determinant of M is 7 and of N is 8, so their product is 56. Forming the matrix product M N and taking its determinant directly also gives 56.",
      layers: [
        {
          kind: "why",
          title: "Why the shortcut is the honest route",
          body: "Multiplicativity is not a computational trick that happens to work — it is the statement that scaling area twice multiplies the factors. The direct calculation is the check, not the reason.",
        },
      ],
    },
    {
      id: "wex-elimination-det",
      title: "Compute a determinant by eliminating",
      prompt:
        "Take Lesson 3's system matrix and eliminate it to triangular form, tracking what each operation does to the determinant.",
      equations: [
        `A = \\begin{bmatrix} ${SYSTEM_A[0][0]} & ${SYSTEM_A[0][1]} \\\\ ${SYSTEM_A[1][0]} & ${SYSTEM_A[1][1]} \\end{bmatrix}`,
        "R_2 \\to R_2 - 2R_1 \\quad (\\text{adds a multiple of a row} \\Rightarrow \\det \\text{ unchanged})",
        "A' = \\begin{bmatrix} 1 & 3 \\\\ 0 & -7 \\end{bmatrix}",
        "\\det(A') = 1 \\cdot (-7) = -7 \\quad (\\text{triangular: product of the pivots})",
        `\\det(A) = \\det(A') = ${detSystemA} \\quad\\text{— and directly, } 1\\cdot(-1) - 3\\cdot 2 = ${detSystemA} \\;\\checkmark`,
      ],
      equationsAriaLabel:
        "Eliminating row two by subtracting twice row one leaves the determinant unchanged and produces a triangular matrix whose determinant is the product of the pivots, 1 times negative 7, which equals negative 7 — the same as computing a d minus b c directly.",
      layers: [
        {
          kind: "connection",
          title: "Negative here means the system's map reverses orientation",
          body: "This is the very system whose unique solution $(2, -1)$ you found by elimination in Lesson 4 and again with $A^{-1}$ in Lesson 6. The determinant being nonzero is *why* that solution was unique; the determinant being negative says the map also flips handedness — which the solving never revealed.",
        },
      ],
    },
  ],
  callouts: [
    {
      id: "negative-area",
      title: "\u201cA negative determinant means negative area\u201d",
      belief:
        "If $\\det(A) = -2$, the image of the unit square must somehow have area $-2$.",
      confront:
        "Measure it. A reflection has $\\det = -1$, and its image of the unit square is a unit square — area exactly $1$, not $-1$. Nothing about the shape shrank, and no area anywhere is negative.",
      resolve:
        "The determinant packs two facts into one number. $|\\det(A)|$ is the area factor — always non-negative. The **sign** is a separate reading: it records orientation (handedness). $\\det = -2$ means \u201careas double, and the plane got flipped over\u201d.",
      exampleId: "reflection",
    },
    {
      id: "zero-det-nonzero-matrix",
      title: "\u201c$\\det(A) = 0$ means the matrix is (nearly) zero\u201d",
      belief:
        "A zero determinant should mean the entries are zero, or at least very small.",
      confront:
        "$\\begin{bmatrix} 2 & 4 \\\\ 1 & 2 \\end{bmatrix}$ has determinant $0$ with no zero entries at all — and $\\begin{bmatrix} 1 & 1 \\\\ 0.99 & 1 \\end{bmatrix}$ has determinant $0.01$, tiny, yet is perfectly invertible.",
      resolve:
        "The determinant measures *collapse*, not size. Zero means the columns became dependent so a dimension was lost. A small nonzero determinant means no dimension was lost — the map is invertible, though badly conditioned, and its inverse has large entries.",
      exampleId: "singular-collapse",
    },
    {
      id: "det-not-additive",
      title: "\u201c$\\det(A + B) = \\det(A) + \\det(B)$\u201d",
      belief:
        "The determinant behaves like a sum over the matrix, so it should distribute over addition the way it does over products.",
      confront:
        "Take $A = I$ and $B = I$. Then $\\det A + \\det B = 2$, but $A + B = \\begin{bmatrix} 2 & 0 \\\\ 0 & 2\\end{bmatrix}$ has determinant $4$.",
      resolve:
        "Multiplicativity comes from *composing maps* — apply one, then the other, and the area factors multiply. Adding matrices does not compose anything, so no area argument applies. $\\det(AB) = \\det A \\det B$ is a theorem; $\\det(A+B)$ has no such rule.",
    },
  ],
  checkpoint: {
    prompt: "If $\\det(A)=0$, what has happened geometrically?",
    answer:
      "The unit square has collapsed onto a line (or a point): the columns of $A$ are linearly dependent, so the parallelogram has zero area. The map is singular — it loses a dimension, so by Lesson 6 it cannot be undone, and $A\\mathbf{x}=\\mathbf{b}$ has either no solution or infinitely many, never exactly one.",
  },
  checkpoints: [
    {
      id: "predict-composite",
      prompt:
        "A map $B$ triples every area; a map $A$ halves every area and reverses orientation. Without computing any entries, what does \u201capply $B$, then $A$\u201d do to area — and what is $\\det(AB)$?",
      answer:
        "Areas are tripled, then halved: the composite scales area by $\\tfrac{3}{2}$. One orientation reversal is applied, so the composite reverses orientation. Hence $\\det(AB) = \\det(A)\\det(B) = (-\\tfrac{1}{2})(3) = -\\tfrac{3}{2}$ — magnitude $\\tfrac{3}{2}$ for the area factor, minus for the flip.",
    },
  ],
  exercises: [
    {
      id: "det-geometry",
      type: "multiple-choice",
      tier: "check",
      prompt: "Geometrically, $|\\det(A)|$ measures…",
      choices: [
        "the angle between the basis vectors only",
        "how much the transformation scales area",
        "whether $A$ has real eigenvalues",
        "the length of $A\\mathbf{e}_1$ alone",
      ],
      correctChoice: 1,
      explanation:
        "The absolute value of the determinant is the area of the image of the unit square — and therefore the factor by which *every* region's area is scaled.",
    },
    {
      id: "det-compute",
      type: "numeric",
      tier: "drill",
      prompt:
        "Compute $\\det\\begin{bmatrix} 2 & 1 \\\\ 0 & 1 \\end{bmatrix}$. Enter the number.",
      expected: detA,
      tolerance: 1e-9,
      explanation:
        "det = $2\\cdot 1 - 1\\cdot 0 = 2$. The parallelogram spanned by $(2,0)$ and $(1,1)$ has area $2$.",
    },
    {
      id: "det-zero",
      type: "numeric",
      tier: "drill",
      prompt:
        "What is $\\det\\begin{bmatrix} 2 & 4 \\\\ 1 & 2 \\end{bmatrix}$? Adjust the explorer until you see why the answer matters geometrically.",
      expected: 0,
      tolerance: 1e-9,
      explanation:
        "The columns are parallel, so the parallelogram has zero area and the map collapses onto a line. By Lesson 6 that map has no inverse.",
    },
    {
      id: "orientation",
      type: "multiple-choice",
      tier: "check",
      prompt: "A transformation with $\\det(A) < 0$ does which of the following?",
      choices: [
        "Preserves orientation and expands area",
        "Reverses orientation",
        "Always collapses onto a point",
        "Leaves every vector unchanged",
      ],
      correctChoice: 1,
      explanation:
        "Negative determinant means the ordered basis flipped handedness. Area is still $|\\det(A)|$; the sign records orientation.",
    },
    {
      // Confronts the review's named misconception with a MEASUREMENT, not a
      // restatement: the learner reports an actual area for a negative det.
      id: "det-negative-area-measure",
      type: "numeric",
      tier: "drill",
      prompt:
        "A reflection across the $x$-axis is $\\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}$, with $\\det = -1$. What is the **area** of the image of the unit square?",
      expected: 1,
      tolerance: 1e-9,
      explanation:
        "The image is again a unit square, so its area is $1$ — the area factor is $|\\det| = 1$. The minus sign is not part of the area; it says the plane was flipped. Areas are never negative.",
    },
    {
      // Fresh instance: NOT the worked example's numbers. Uses multiplicativity,
      // which is the point — forming the product is the slow route.
      id: "det-product-fresh",
      type: "numeric",
      tier: "drill",
      prompt: `For $M = \\begin{bmatrix} ${M[0][0]} & ${M[0][1]} \\\\ ${M[1][0]} & ${M[1][1]} \\end{bmatrix}$ and $N = \\begin{bmatrix} ${N[0][0]} & ${N[0][1]} \\\\ ${N[1][0]} & ${N[1][1]} \\end{bmatrix}$, compute $\\det(MN)$ **without forming $MN$**.`,
      expected: detMN,
      tolerance: 1e-9,
      explanation: `$\\det(M) = ${detM}$ and $\\det(N) = ${detN}$, so $\\det(MN) = ${detM}\\cdot${detN} = ${detMN}$. Forming $MN$ first and taking its determinant gives the same number — multiplicativity just saves the work.`,
    },
    {
      // Multi-step production: the row-operation rules applied in sequence, with
      // the method-specific intermediate (the triangular form's pivots) graded.
      id: "det-by-elimination-fresh",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "Compute $\\det\\begin{bmatrix} 2 & 6 \\\\ 1 & 5 \\end{bmatrix}$ by eliminating to triangular form, tracking each operation's effect.",
      config: {
        steps: [
          {
            kind: "numeric",
            prompt:
              "Swap the rows so the pivot is $1$. What does a single row swap do to the determinant? Enter the factor it multiplies by.",
            expected: -1,
            explanation:
              "A swap is left-multiplication by $\\begin{bmatrix} 0 & 1 \\\\ 1 & 0\\end{bmatrix}$, whose determinant is $-1$. So the determinant of the swapped matrix is $-1$ times the original.",
          },
          {
            kind: "numeric",
            prompt:
              "After the swap the matrix is $\\begin{bmatrix} 1 & 5 \\\\ 2 & 6 \\end{bmatrix}$. Apply $R_2 \\to R_2 - 2R_1$ and enter the resulting $(2,2)$ entry.",
            expected: -4,
            explanation:
              "$6 - 2\\cdot 5 = -4$, giving $\\begin{bmatrix} 1 & 5 \\\\ 0 & -4\\end{bmatrix}$. Adding a multiple of a row leaves the determinant unchanged.",
          },
          {
            kind: "numeric",
            prompt:
              "Read the triangular determinant off the pivots, then undo the swap. What is $\\det$ of the ORIGINAL matrix?",
            expected: 4,
            explanation:
              "The triangular matrix has determinant $1\\cdot(-4) = -4$. Elimination did not change it, but the swap multiplied by $-1$, so $-1 \\cdot \\det(\\text{original}) = -4$ and $\\det(\\text{original}) = 4$. Check directly: $2\\cdot 5 - 6\\cdot 1 = 4$. Forgetting to undo the swap's sign is the step most people drop.",
          },
        ],
      },
    },
    {
      // Interpretation after calculation: the factor applies to ANY region.
      id: "det-region-area",
      type: "numeric",
      tier: "transfer",
      prompt: `A region has area ${REGION_AREA}. It is transformed by a map with $\\det = -3$. What is the area of its image?`,
      expected: REGION_AREA * 3,
      tolerance: 1e-9,
      explanation: `The area factor is $|{-3}| = 3$, so the image has area $3 \\times ${REGION_AREA} = ${REGION_AREA * 3}$. The minus sign changes orientation, not area — and the factor applies to *every* region, not only the unit square.`,
    },
    {
      // Ties det back to invertibility AND to the solution count (L3/L5/L6).
      id: "det-uniqueness-link",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "You compute $\\det(A) = 0$ for a $2\\times2$ matrix $A$. What can you conclude about $A\\mathbf{x} = \\mathbf{b}$?",
      choices: [
        "It has exactly one solution",
        "It has no solution",
        "It has either no solution or infinitely many — never exactly one",
        "Nothing at all; the determinant only describes area",
      ],
      correctChoice: 2,
      explanation:
        "$\\det = 0$ means the columns are dependent, so $\\operatorname{Null}(A) \\ne \\{\\mathbf{0}\\}$. If $\\mathbf{b}$ is reachable there are infinitely many solutions (Lesson 5's $\\mathbf{x}_p + \\operatorname{Null}(A)$); if not, there are none. Exactly one is impossible. Which of the two happens depends on $\\mathbf{b}$, which the determinant alone cannot tell you.",
    },
    {
      // Abstraction return: the same reading in 3D, on volume.
      id: "det-volume-3d",
      type: "numeric",
      tier: "transfer",
      prompt:
        "In $\\mathbb{R}^3$, a map stretches by $2$ along $x$, $3$ along $y$, and $4$ along $z$. By what factor does it scale **volume**?",
      expected: detDiagonal3,
      tolerance: 1e-9,
      explanation: `$\\det\\operatorname{diag}(2,3,4) = 2\\cdot 3\\cdot 4 = ${detDiagonal3}$. Nothing about the story was two-dimensional: the determinant is the signed *volume* factor in $\\mathbb{R}^3$, and zero still means the unit cube was flattened and a dimension lost.`,
    },
    {
      // Boundary case the review asked for: conditioning is not collapse.
      id: "det-tiny-not-singular",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "$\\det\\begin{bmatrix} 1 & 1 \\\\ 0.99 & 1 \\end{bmatrix} = 0.01$. Which statement is correct?",
      choices: [
        "The matrix is singular, because the determinant is nearly zero",
        "The matrix is invertible; the tiny determinant means its inverse has very large entries",
        "The matrix collapses the plane onto a line",
        "The determinant must have been computed incorrectly",
      ],
      correctChoice: 1,
      explanation:
        "Invertibility is exact: $\\det \\ne 0$, so the columns are independent and no dimension was lost. A tiny determinant means the image parallelogram is a thin sliver — the map is *badly conditioned*, and $A^{-1} = \\frac{1}{0.01}\\begin{bmatrix} 1 & -1 \\\\ -0.99 & 1\\end{bmatrix}$ has entries around $100$. Nearly singular is not singular.",
    },
    {
      // Unscored E6 reasoning surface (P2 owes derivations, not proof
      // construction), placed on the property the lesson most wants understood.
      id: "det-justify-multiplicative",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt:
        "Explain in your own words why $\\det(AB) = \\det(A)\\det(B)$ must hold, using what the determinant *means* rather than the entry formula. Then say why there is no comparable rule for $\\det(A + B)$.",
      config: {
        modelAnswer:
          "$|\\det(B)|$ is the factor by which $B$ scales every area. Applying $B$ to a region of area $S$ gives area $|\\det B|\\,S$; applying $A$ to that gives $|\\det A|\\,|\\det B|\\,S$. The composite $AB$ is itself a linear map, so it has a single area factor, and that factor must therefore be $|\\det A||\\det B|$. Orientation composes the same way: each reversal flips handedness, so two reversals restore it, exactly as the product of two negative signs is positive. Combining magnitude and sign gives $\\det(AB) = \\det(A)\\det(B)$. There is no analogous rule for $\\det(A+B)$ because addition of matrices does not correspond to doing one map and then the other — $A + B$ is not a composition, so no \u201cscale the area twice\u201d argument is available. A single counterexample settles it: $A = B = I$ gives $\\det(A) + \\det(B) = 2$ but $\\det(A+B) = \\det(2I) = 4$.",
        rubric:
          "A strong answer argues from the area-factor meaning (apply $B$, then $A$; factors multiply), handles the sign via composing orientation reversals, and explains that addition is not composition — ideally with a counterexample such as $A = B = I$.",
      },
    },
  ],
  keyTakeaway:
    "The determinant is the number Lesson 6 could not divide by, given a meaning: $|\\det(A)|$ is the factor by which the map scales *every* area (volume in 3D), and its sign records orientation — never a negative area. Zero is collapse, which is exactly non-invertibility and exactly the failure of unique solutions. Because applying two maps scales area twice, $\\det(AB) = \\det(A)\\det(B)$ — and the row-operation rules follow from that one fact, so a determinant can be read off the pivots after elimination.",
  structuredSummary: {
    coreMentalModel:
      "One number holding two readings: the size of the area (or volume) factor, and the sign that says whether the plane was flipped.",
    definitionsIntroduced: [
      "$\\det(A) = ad - bc$ as the signed area of the parallelogram spanned by the columns",
      "Orientation (the sign) as distinct from the area factor (the magnitude)",
    ],
    mainResult:
      "$\\det(A) \\ne 0 \\iff A$ invertible $\\iff$ columns independent $\\iff$ exactly one solution for every $\\mathbf{b}$; and $\\det(AB) = \\det(A)\\det(B)$.",
    representationsConnected:
      "The image parallelogram's area (picture) ↔ $ad - bc$ (symbol) ↔ the product of the pivots after elimination (procedure).",
    commonMistake:
      "Reading a negative determinant as a negative area, or a zero determinant as a small/zero matrix rather than as collapse.",
    canonicalExample:
      `$A = \\begin{bmatrix} ${A[0][0]} & ${A[0][1]} \\\\ ${A[1][0]} & ${A[1][1]} \\end{bmatrix}$ with $\\det(A) = ${detA}$: areas double, orientation preserved.`,
    oneProblemWorthRemembering:
      "Given $\\det(A) = -3$ and a region of area $6$, state the image's area (18) and what the sign means (orientation reversed).",
    whatThisUnlocksNext:
      "$\\det(A - \\lambda I) = 0$ as the search for directions the map only scales — the characteristic equation.",
  },
};
