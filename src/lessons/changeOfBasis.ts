import type { LessonDefinition } from "./types";
import { LINEAR_COMBINATION_EXAMPLE as L1 } from "./exampleData";
import {
  EXERCISE_SEQUENCE_ID,
  MATRIX_ENTRY_ID,
  SELF_CHECK_ID,
} from "./capabilities";
import {
  coordinatesInBasis,
  matrixInBasis,
  requireMatrixExample,
  type Vector2,
} from "../math";

/**
 * Lesson: "Change of Basis" (spine L10).
 *
 * Built on the PASS contract
 * `docs/courses/linear-algebra/lessons/10-change-of-basis/insight.md`.
 *
 * Primary insight: a matrix was never the map and a coordinate list was never the
 * vector — both are DESCRIPTIONS relative to a basis, and since Lesson 2 that
 * basis has silently been the standard one. Naming the hidden choice makes P's
 * direction derivable (its columns are the new basis vectors in standard
 * coordinates, so P converts B-coords TO standard) and makes [A]_B = P^-1 A P a
 * readable sentence rather than a formula.
 *
 * Continuity is doing real pedagogical work here: the lesson reuses Lesson 1's
 * exact numbers, so the learner meets NO new arithmetic while the interpretation
 * changes — the condition for a representational insight to be visible. The map
 * half uses Lesson 11's matrix, so the diagonalization payoff lands on the
 * matrix the next lesson opens on.
 *
 * Scope: orthonormal bases and P^-1 = P^T are L12's. Trace invariance is stated,
 * not proved. Whether a matrix CAN be diagonalized is set up here and decided in
 * L11 using L9's geometric multiplicity.
 */

const B1 = L1.v as Vector2; // (1, 2)
const B2 = L1.wIndependent as Vector2; // (3, -1)
const P_POINT = L1.target as Vector2; // (4, 1)
const P_COORDS = coordinatesInBasis(B1, B2, P_POINT)!; // (1, 1)
const Q_POINT = L1.q as Vector2; // (-1, 5)
const Q_COORDS = coordinatesInBasis(B1, B2, Q_POINT)!; // (2, -1)

const A = requireMatrixExample("eigen-distinct").matrix; // [[3,1],[0,2]]
const EIGEN_1: Vector2 = [1, 0];
const EIGEN_2: Vector2 = [-1, 1];
const A_DIAGONAL = matrixInBasis(A, EIGEN_1, EIGEN_2)!; // diag(3, 2)

/** Fresh basis for practice — not the one the scene animates. */
const FRESH_B1: Vector2 = [2, 1];
const FRESH_B2: Vector2 = [1, 3];
const FRESH_POINT: Vector2 = [5, 5];
const FRESH_COORDS = coordinatesInBasis(FRESH_B1, FRESH_B2, FRESH_POINT)!; // (2, 1)
const A_IN_FRESH = matrixInBasis(A, FRESH_B1, FRESH_B2)!;

const P_TEX = "\\begin{bmatrix} 1 & 3 \\\\ 2 & -1 \\end{bmatrix}";
const A_TEX = "\\begin{bmatrix} 3 & 1 \\\\ 0 & 2 \\end{bmatrix}";
const FRESH_P_TEX = "\\begin{bmatrix} 2 & 1 \\\\ 1 & 3 \\end{bmatrix}";

export const changeOfBasisLesson: LessonDefinition = {
  id: "change-of-basis",
  title: "Change of Basis",
  subtitle:
    "A matrix is not the map — it is the map's description in a basis nobody mentioned",
  exampleId: "eigen-distinct",
  learningObjectives: [
    "Read a coordinate list as a *name* in a basis, not as the vector itself",
    "Build $P$ from a basis and say which direction it converts, from its columns rather than from memory",
    "Produce $[\\mathbf{x}]_B = P^{-1}\\mathbf{x}$ and verify by rebuilding $\\mathbf{x}$",
    "Derive and use $[A]_B = P^{-1}AP$, reading it right to left as translate, act, translate back",
    "Explain why a basis of directions the map only scales makes $[A]_B$ diagonal",
    "State which quantities survive a change of basis and which do not",
    "Reject the converse: equal determinant and trace do not make two matrices similar",
    "Recognize that a change of basis requires no orthogonality and no unit lengths",
  ],
  motivatingQuestion:
    "Lesson 1 said coordinates are a choice. Every matrix since has been written without saying which choice was made. Which one was it — and what changes if you pick another?",
  route: [
    { kind: "motivate" },
    { kind: "section", sectionId: "hidden-choice" },
    { kind: "visual" },
    { kind: "check" },
    { kind: "formal", formalId: "def-coordinates" },
    { kind: "section", sectionId: "direction" },
    { kind: "formal", formalId: "prop-conversion" },
    { kind: "worked", workedId: "wex-l1-revisited" },
    { kind: "check", checkpointId: "which-direction" },
    { kind: "section", sectionId: "sentence" },
    { kind: "formal", formalId: "thm-similarity" },
    { kind: "explore", tocLabel: "The same point, named twice" },
    { kind: "section", sectionId: "shorter" },
    { kind: "worked", workedId: "wex-diagonal" },
    { kind: "formal", formalId: "prop-invariants" },
    { kind: "practice" },
    {
      kind: "summary",
      heading: "The object never moves; only its name changes",
    },
  ],
  sections: [
    {
      id: "hidden-choice",
      title: "The choice nobody mentioned",
      body: "Lesson 1 proved something easy to forget: a basis gives every vector **unique** coordinates, and a different basis gives different ones. It even worked an example — the point $\\mathbf{p} = (4,1)$ has coordinates $(1,1)$ in the basis $B = ((1,2),(3,-1))$. Two lists, one unmoved point. And then every lesson since has written a single unlabelled list per vector, and a single unlabelled matrix per map, as though there were nothing to choose. There was. The choice was made silently, every time, and it was always the same one: the standard basis.",
      observation:
        "So a coordinate list is a *name*, and a matrix is a *description*. Neither is the object. Once that is said out loud, changing basis stops sounding like something done to the vector.",
      layers: [
        {
          kind: "why",
          title: "Why nobody noticed",
          body: "Because the standard basis is a genuinely good default, and because until now no second basis has been in play. A notation that suppresses a choice is harmless exactly as long as the choice never varies — and misleading the moment it does.",
        },
      ],
    },
    {
      id: "direction",
      title: "Which way does $P$ go?",
      body: "Build $P$ by putting the new basis vectors in as columns, **written in standard coordinates**: $P = " + P_TEX + "$ for Lesson 1's basis. Now you never have to remember which direction it converts, because you can read it off. Feed $P$ the vector $\\mathbf{e}_1$ — which is the $B$-coordinate description of $\\mathbf{b}_1$, one step along the first basis vector and none along the second — and it returns $\\mathbf{b}_1 = (1,2)$ in standard coordinates. So $P$ takes $B$-coordinates **to** standard coordinates, and $P^{-1}$ goes back.",
      equation:
        "\\mathbf{x} = P\\,[\\mathbf{x}]_B, \\qquad [\\mathbf{x}]_B = P^{-1}\\mathbf{x}",
      observation:
        "This is the step most people get backwards, and it is the one step you never need to memorize: the columns say which way it goes.",
      layers: [
        {
          kind: "connection",
          title: "Finding coordinates is a Lesson 3 system",
          body: "$[\\mathbf{x}]_B$ is the pair of weights $c$ with $c_1\\mathbf{b}_1 + c_2\\mathbf{b}_2 = \\mathbf{x}$ — that is, the solution of $P\\mathbf{c} = \\mathbf{x}$. It exists and is unique precisely because a basis is independent and spanning, which by Lessons 6 and 8 is exactly the statement that $P$ is invertible.",
        },
      ],
    },
    {
      id: "sentence",
      title: "$P^{-1}AP$ is a sentence, read right to left",
      body: "A map needs a description per basis too. Whatever $[A]_B$ is, it must do to $B$-coordinates what $A$ does to standard ones: $[A\\mathbf{x}]_B = [A]_B[\\mathbf{x}]_B$. Substituting $[\\mathbf{x}]_B = P^{-1}\\mathbf{x}$ on both sides forces $[A]_B = P^{-1}AP$ — and once you have it, read it the way Lesson 6 taught, right to left. $P$ translates a $B$-coordinate vector into standard coordinates; $A$ acts there, where it knows how; $P^{-1}$ translates the answer back. Three steps, each with a job.",
      equation: "[A]_B = P^{-1} A P",
      observation:
        "Because each factor has a legible job, the order cannot be guessed wrong. $PAP^{-1}$ would translate in the wrong direction first and hand $A$ a vector it does not understand.",
    },
    {
      id: "shorter",
      title: "Some languages make the sentence shorter",
      body: "If a basis is nothing special, $[A]_B$ is nothing special either. But suppose you choose a basis of directions that $A$ merely **scales** — vectors that $A$ stretches without turning. Then in that language the map does nothing but multiply each coordinate by its own factor, and $[A]_B$ is **diagonal**. For $A = " + A_TEX + "$ and the basis $((1,0),(-1,1))$, the sandwich gives $\\begin{bmatrix} 3 & 0 \\\\ 0 & 2\\end{bmatrix}$. Nothing about the map changed — the animation's deformation is identical in both beats. Only the description got simpler.",
      equation:
        "P^{-1}AP = \\begin{bmatrix} 3 & 0 \\\\ 0 & 2 \\end{bmatrix} \\quad \\text{— the same map, in a better language}",
      layers: [
        {
          kind: "looking-ahead",
          title: "This is the whole point of the next lesson",
          body: "Everything now hangs on one question: which directions does a map merely scale? Those directions are called **eigenvectors**, their scale factors **eigenvalues**, and finding them is what makes the diagonal description available. The next lesson is that hunt — and because determinants and eigenvalues survive a change of basis, you can compute them from *any* description.",
        },
        {
          kind: "trap",
          title: "Not every map has such a basis",
          body: "A diagonal description exists only when there are enough independent scaled directions to form a basis. Lesson 9 already gave the test: compare the geometric multiplicity $n - \\operatorname{rank}(A - \\lambda I)$ with how often $\\lambda$ repeats. When they fall short, no basis diagonalizes the map — a case the next lesson meets head-on.",
        },
      ],
    },
  ],
  formalBlocks: [
    {
      id: "def-coordinates",
      kind: "definition",
      label: "Coordinates in a basis; the change-of-basis matrix",
      statement:
        "Let $B = (\\mathbf{b}_1, \\mathbf{b}_2)$ be a basis. The **coordinate vector** $[\\mathbf{x}]_B$ is the unique pair $(c_1, c_2)$ with $c_1\\mathbf{b}_1 + c_2\\mathbf{b}_2 = \\mathbf{x}$. The **change-of-basis matrix** is $P = [\\,\\mathbf{b}_1\\ \\mathbf{b}_2\\,]$, whose columns are the basis vectors written in standard coordinates.",
      interpretation:
        "The vector is the arrow; $[\\mathbf{x}]_B$ is its name in one language. Different bases give different names to the same arrow.",
      visibility: "visible",
    },
    {
      id: "prop-conversion",
      kind: "proposition",
      label: "Which direction $P$ converts",
      statement:
        "$\\mathbf{x} = P\\,[\\mathbf{x}]_B$ for every $\\mathbf{x}$, and hence $[\\mathbf{x}]_B = P^{-1}\\mathbf{x}$. $P$ is invertible exactly because $B$ is a basis.",
      interpretation:
        "$P$ converts **from** $B$-coordinates **to** standard coordinates. That is not a convention to memorize — it follows from how $P$ was built.",
      visibility: "visible",
      layers: [
        {
          kind: "math-note",
          title: "Read it off the columns",
          body: "$P\\mathbf{e}_1$ is the first column of $P$, which is $\\mathbf{b}_1$ in standard coordinates. And $\\mathbf{e}_1$ is exactly $[\\mathbf{b}_1]_B$ — one step along the first basis vector, none along the second. So $P$ turned a $B$-coordinate vector into a standard one. The same argument on $\\mathbf{e}_2$ finishes it, and by linearity it holds for every $\\mathbf{x}$.",
        },
      ],
    },
    {
      id: "thm-similarity",
      kind: "theorem",
      label: "A map's matrix in a new basis",
      statement:
        "$[A]_B = P^{-1} A P$. Two matrices related this way for some invertible $P$ are called **similar**: they describe the same map in different bases.",
      interpretation:
        "Right to left: translate into standard coordinates, apply the map there, translate the answer back. Each factor is doing a legible job, which is why the order is not arbitrary.",
      visibility: "visible",
      layers: [
        {
          kind: "math-note",
          title: "The derivation",
          body: "Whatever $[A]_B$ is, it must satisfy $[A\\mathbf{x}]_B = [A]_B\\,[\\mathbf{x}]_B$ for every $\\mathbf{x}$ — that is what “the matrix of $A$ in $B$” means. Substitute $[\\mathbf{x}]_B = P^{-1}\\mathbf{x}$ and $[A\\mathbf{x}]_B = P^{-1}A\\mathbf{x}$: the requirement becomes $P^{-1}A\\mathbf{x} = [A]_B P^{-1}\\mathbf{x}$ for all $\\mathbf{x}$. Two matrices agreeing on every vector are equal, so $P^{-1}A = [A]_B P^{-1}$, and right-multiplying by $P$ gives $[A]_B = P^{-1}AP$. Nothing was assumed about $B$ beyond its being a basis.",
        },
      ],
    },
    {
      id: "prop-invariants",
      kind: "proposition",
      label: "What survives translation",
      statement:
        "Similar matrices have the same determinant, rank, nullity and trace. The **converse is false**: two matrices can share all of these and still not be similar.",
      interpretation:
        "These are properties of the **map**; the entries are properties of the description. That is also why the next lesson may compute eigenvalues from any convenient description.",
      visibility: "revealed",
      layers: [
        {
          kind: "math-note",
          title: "Determinant, rank, and the failed converse",
          body: "**Determinant:** by Lesson 7's multiplicativity, $\\det(P^{-1}AP) = \\det(P^{-1})\\det(A)\\det(P) = \\frac{1}{\\det P}\\det(A)\\det(P) = \\det A$. **Rank and nullity:** $P$ and $P^{-1}$ are invertible, so they destroy nothing (Lessons 8–9); composing with them cannot change how many dimensions survive. **Trace** is also invariant, stated here without proof. **The converse fails:** $I$ and $\\begin{bmatrix} 1 & 1 \\\\ 0 & 1\\end{bmatrix}$ share determinant $1$ and trace $2$, yet $P^{-1}IP = I$ for *every* invertible $P$ — the identity is similar only to itself — so they cannot be similar.",
        },
      ],
    },
  ],
  guidedSceneId: "change-of-basis",
  explorationId: "change-of-basis",
  workedExamples: [
    {
      id: "wex-l1-revisited",
      title: "Lesson 1's point, recomputed as a conversion",
      prompt:
        "Lesson 1 found $[\\mathbf{p}]_B = (1,1)$ for $\\mathbf{p} = (4,1)$ by hand. Get the same answer with $P^{-1}$, and check it.",
      exampleId: "vectors-default",
      equations: [
        "B = ((1, 2), (3, -1)) \\;\\Rightarrow\\; P = " + P_TEX,
        "\\det P = (1)(-1) - (3)(2) = -7, \\qquad P^{-1} = \\frac{1}{-7}\\begin{bmatrix} -1 & -3 \\\\ -2 & 1 \\end{bmatrix}",
        `[\\mathbf{p}]_B = P^{-1}\\begin{bmatrix} 4 \\\\ 1 \\end{bmatrix} = \\frac{1}{-7}\\begin{bmatrix} -4 - 3 \\\\ -8 + 1 \\end{bmatrix} = \\begin{bmatrix} ${P_COORDS[0]} \\\\ ${P_COORDS[1]} \\end{bmatrix}`,
        "\\text{Check: } P\\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix} = (1,2) + (3,-1) = (4, 1) = \\mathbf{p} \\;\\checkmark",
        `\\text{And for } \\mathbf{q} = (-1, 5): \\; [\\mathbf{q}]_B = \\begin{bmatrix} ${Q_COORDS[0]} \\\\ ${Q_COORDS[1]} \\end{bmatrix} \\;\\text{— also Lesson 1's answer}`,
      ],
      equationsAriaLabel:
        "Building P from Lesson 1's basis gives determinant negative seven. Applying P inverse to the point (4,1) gives the coordinates (1,1), matching Lesson 1. Multiplying back by P rebuilds (4,1). The same method gives (2,-1) for the point q.",
      layers: [
        {
          kind: "connection",
          title: "No new arithmetic — only a new reading",
          body: "Lesson 1 solved $c_1(1,2) + c_2(3,-1) = (4,1)$ as a small system. That system *is* $P\\mathbf{c} = \\mathbf{p}$, and solving it *is* applying $P^{-1}$. The computation has not changed; what changed is that the answer now has a name and a direction.",
        },
      ],
    },
    {
      id: "wex-diagonal",
      title: "The description that turns diagonal",
      prompt:
        "For $A = " + A_TEX + "$, use the basis $((1,0), (-1,1))$ — two directions this map only scales — and compute $[A]_B$.",
      exampleId: "eigen-distinct",
      equations: [
        "P = \\begin{bmatrix} 1 & -1 \\\\ 0 & 1 \\end{bmatrix}, \\qquad P^{-1} = \\begin{bmatrix} 1 & 1 \\\\ 0 & 1 \\end{bmatrix}",
        "AP = " + A_TEX + "\\begin{bmatrix} 1 & -1 \\\\ 0 & 1 \\end{bmatrix} = \\begin{bmatrix} 3 & -2 \\\\ 0 & 2 \\end{bmatrix}",
        `[A]_B = P^{-1}(AP) = \\begin{bmatrix} 1 & 1 \\\\ 0 & 1 \\end{bmatrix}\\begin{bmatrix} 3 & -2 \\\\ 0 & 2 \\end{bmatrix} = \\begin{bmatrix} ${A_DIAGONAL[0][0]} & ${A_DIAGONAL[0][1]} \\\\ ${A_DIAGONAL[1][0]} & ${A_DIAGONAL[1][1]} \\end{bmatrix}`,
        "\\det: \\; (3)(2) - (1)(0) = 6 = (3)(2) - (0)(0) \\;\\checkmark \\qquad \\operatorname{tr}: \\; 3 + 2 = 5 \\;\\checkmark",
      ],
      equationsAriaLabel:
        "With P built from the two scaled directions, A P is the matrix with columns (3,0) and (-2,2), and multiplying by P inverse gives the diagonal matrix with 3 and 2 on the diagonal. The determinant is 6 and the trace is 5 for both descriptions.",
      layers: [
        {
          kind: "why",
          title: "Why the diagonal entries are the scale factors",
          body: "In this basis, $\\mathbf{b}_1$ has coordinates $(1,0)$. The map scales it by $3$, so its image has coordinates $(3,0)$ — which is exactly the first column of $[A]_B$. Each basis vector goes to a multiple of itself, so each column has a single nonzero entry: its own factor. A diagonal matrix is just the columns rule for a basis of scaled directions.",
        },
      ],
    },
  ],
  callouts: [
    {
      id: "vector-does-not-move",
      title: "“Changing basis moves the vector”",
      belief:
        "The coordinates went from $(4,1)$ to $(1,1)$, so the vector must have shrunk or moved.",
      confront:
        "Look at the animation again: the arrow is drawn once and never redrawn. Nothing about it changes when the grid is swapped. What changed is the grid the numbers are counted against.",
      resolve:
        "A change of basis changes the **description**, never the object. $(4,1)$ and $(1,1)$ are two names for the same point — like giving a distance in metres and in feet. If you rebuild the point from its new name, $P(1,1) = (1,2)+(3,-1) = (4,1)$, you land exactly where you started.",
    },
    {
      id: "wrong-direction",
      title: "“$[A]_B = PAP^{-1}$”",
      belief:
        "The sandwich has a $P$ on each side, so the order is a coin flip.",
      confront:
        "Track what each factor is handed. Read $P^{-1}AP$ right to left on a $B$-coordinate vector: $P$ turns it into standard coordinates, $A$ acts there, $P^{-1}$ brings it back — every step receives something it understands. Now read $PAP^{-1}$ the same way: $P^{-1}$ is handed a $B$-coordinate vector and treats it as a standard one. The first step is already wrong.",
      resolve:
        "$P$'s columns are the basis vectors *in standard coordinates*, so $P$ converts $B \\to$ standard and $P^{-1}$ converts standard $\\to B$. Given that, $[A]_B = P^{-1}AP$ is forced. Derive the direction from the columns; do not try to remember it.",
    },
    {
      id: "equal-det-not-similar",
      title: "“Same determinant and trace means the same map”",
      belief:
        "Similar matrices share determinant and trace, so matrices sharing them must be similar.",
      confront:
        "Take $I = \\begin{bmatrix} 1 & 0 \\\\ 0 & 1\\end{bmatrix}$ and $\\begin{bmatrix} 1 & 1 \\\\ 0 & 1\\end{bmatrix}$. Both have determinant $1$ and trace $2$. But $P^{-1}IP = P^{-1}P = I$ for *every* invertible $P$ — the identity is similar only to itself — so no change of basis turns one into the other.",
      resolve:
        "The invariants are **necessary, not sufficient**. They can rule similarity out, never in. Matching invariants means the two descriptions are *compatible* with describing the same map, not that they do.",
    },
    {
      id: "must-be-orthonormal",
      title: "“The new basis has to be perpendicular and unit length”",
      belief:
        "Coordinate axes are perpendicular and unit length, so a basis must be too.",
      confront:
        "Lesson 1's basis $((1,2),(3,-1))$ is used throughout this lesson. Its vectors are not unit length, and their dot product is $1\\cdot3 + 2\\cdot(-1) = 1 \\ne 0$, so they are not perpendicular either. Everything here still works.",
      resolve:
        "A basis needs exactly two properties: independent and spanning. Nothing in $[\\mathbf{x}]_B = P^{-1}\\mathbf{x}$ or $[A]_B = P^{-1}AP$ requires more. Orthonormal bases are genuinely convenient — they make $P^{-1} = P^{\\mathsf{T}}$ — but that is a later lesson's luxury, not a requirement.",
    },
  ],
  checkpoint: {
    prompt:
      "The readout changed from $(4,1)$ to $(1,1)$ when the grid was swapped. What moved?",
    answer:
      "Nothing moved. The arrow is drawn once and is never touched again; only the grid used to count against it changed. $(4,1)$ and $(1,1)$ are two **names** for the same point — the first in the standard basis, the second in $B$. You can check that they name the same thing by rebuilding: $1\\cdot(1,2) + 1\\cdot(3,-1) = (4,1)$.",
  },
  checkpoints: [
    {
      id: "which-direction",
      prompt:
        "$P$'s columns are the new basis vectors written in standard coordinates. Does $P$ convert $B$-coordinates to standard, or standard to $B$-coordinates? Derive it — do not try to recall it.",
      answer:
        "$B$-coordinates **to** standard. Feed $P$ the vector $\\mathbf{e}_1 = (1,0)$: the result is $P$'s first column, which is $\\mathbf{b}_1$ in standard coordinates. And $(1,0)$ is precisely $[\\mathbf{b}_1]_B$ — one step along $\\mathbf{b}_1$, none along $\\mathbf{b}_2$. So $P$ was handed a $B$-coordinate vector and returned a standard one. Therefore $\\mathbf{x} = P[\\mathbf{x}]_B$, and going the other way needs the inverse: $[\\mathbf{x}]_B = P^{-1}\\mathbf{x}$.",
    },
  ],
  exercises: [
    {
      id: "cob-vector-unmoved",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "A point's coordinates change from $(4,1)$ to $(1,1)$ when you switch bases. What happened to the point?",
      choices: [
        "It moved closer to the origin",
        "Nothing — only the basis used to name it changed",
        "It was scaled by the matrix $P$",
        "It moved to a different vector space",
      ],
      correctChoice: 1,
      explanation:
        "A change of basis changes the description, not the object. Rebuilding from the new name returns the same point: $1\\cdot(1,2) + 1\\cdot(3,-1) = (4,1)$.",
    },
    {
      id: "cob-direction",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "$P$ has the new basis vectors as its columns, written in standard coordinates. What does $P$ do?",
      choices: [
        "Converts standard coordinates to $B$-coordinates",
        "Converts $B$-coordinates to standard coordinates",
        "Leaves coordinates unchanged but rotates the basis",
        "Converts in whichever direction you need; the two are the same",
      ],
      correctChoice: 1,
      explanation:
        "$P\\mathbf{e}_1$ is $P$'s first column, i.e. $\\mathbf{b}_1$ in standard coordinates — and $\\mathbf{e}_1$ is $[\\mathbf{b}_1]_B$. So $P$ was handed a $B$-coordinate vector and returned a standard one. Going back needs $P^{-1}$.",
    },
    {
      id: "cob-coordinates-fresh",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "A fresh basis: $\\mathbf{b}_1 = (2,1)$, $\\mathbf{b}_2 = (1,3)$, so $P = " + FRESH_P_TEX + "$. Find the coordinates of $\\mathbf{x} = (5,5)$ in it, then check your answer.",
      config: {
        steps: [
          {
            kind: "vector",
            prompt:
              "Compute $[\\mathbf{x}]_B = P^{-1}\\mathbf{x}$. Enter both coordinates.",
            expected: [FRESH_COORDS[0], FRESH_COORDS[1]],
            explanation:
              "$\\det P = 6 - 1 = 5$, so $P^{-1} = \\frac{1}{5}\\begin{bmatrix} 3 & -1 \\\\ -1 & 2\\end{bmatrix}$ and $P^{-1}(5,5) = \\frac{1}{5}(15-5,\\, -5+10) = (2, 1)$.",
          },
          {
            kind: "vector",
            prompt:
              "Now check it: rebuild the point by computing $2\\,\\mathbf{b}_1 + 1\\,\\mathbf{b}_2$. Enter the result.",
            expected: [FRESH_POINT[0], FRESH_POINT[1]],
            explanation:
              "$2(2,1) + 1(1,3) = (4,2) + (1,3) = (5,5)$ — the original point. The check is the whole discipline: coordinates are only right if they rebuild the vector.",
          },
        ],
      },
    },
    {
      id: "cob-matrix-in-basis-fresh",
      type: "custom",
      capabilityId: MATRIX_ENTRY_ID,
      tier: "drill",
      prompt:
        "Same fresh basis ($P = " + FRESH_P_TEX + "$) and $A = " + A_TEX + "$. Enter $[A]_B = P^{-1}AP$ — all four entries.",
      config: {
        rows: 2,
        cols: 2,
        matrixName: "[A]_B",
        tolerance: 0.01,
        expected: [
          [A_IN_FRESH[0][0], A_IN_FRESH[0][1]],
          [A_IN_FRESH[1][0], A_IN_FRESH[1][1]],
        ],
        explanation:
          "Work right to left: $AP = \\begin{bmatrix} 7 & 6 \\\\ 2 & 6\\end{bmatrix}$, then $P^{-1}(AP) = \\frac{1}{5}\\begin{bmatrix} 3 & -1 \\\\ -1 & 2\\end{bmatrix}\\begin{bmatrix} 7 & 6 \\\\ 2 & 6\\end{bmatrix} = \\begin{bmatrix} 3.8 & 2.4 \\\\ -0.6 & 1.2\\end{bmatrix}$. Not pretty — this basis is not adapted to $A$. Check it anyway: the determinant is $3.8(1.2) - 2.4(-0.6) = 6$ and the trace is $5$, matching $A$.",
      },
    },
    {
      id: "cob-diagonalizes",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt:
        "Now a basis adapted to the map: $\\mathbf{b}_1 = (1,0)$ and $\\mathbf{b}_2 = (-1,1)$, two directions $A = " + A_TEX + "$ only scales.",
      config: {
        steps: [
          {
            kind: "vector",
            prompt:
              "First check they really are only scaled. Compute $A(1,0)$ — enter both coordinates.",
            expected: [3, 0],
            explanation:
              "$A(1,0) = (3, 0) = 3\\,(1,0)$: same direction, scaled by 3.",
          },
          {
            kind: "vector",
            prompt: "And $A(-1,1)$?",
            expected: [-2, 2],
            explanation:
              "$A(-1,1) = (3(-1) + 1(1),\\; 0(-1) + 2(1)) = (-2, 2) = 2\\,(-1,1)$: same direction, scaled by 2.",
          },
          {
            kind: "numeric",
            prompt:
              "So in this basis $[A]_B$ is diagonal. What is its $(1,1)$ entry — the top-left?",
            expected: A_DIAGONAL[0][0],
            explanation:
              "$3$. In this basis $\\mathbf{b}_1$ has coordinates $(1,0)$ and its image has coordinates $(3,0)$, so the first column of $[A]_B$ is $(3,0)$. The full matrix is $\\begin{bmatrix} 3 & 0 \\\\ 0 & 2\\end{bmatrix}$: each basis direction is scaled by its own factor and mixed with nothing. That is what a diagonal matrix *is*.",
          },
        ],
      },
    },
    {
      id: "cob-identity-basis",
      type: "multiple-choice",
      tier: "drill",
      prompt:
        "What is $[A]_B$ when $B$ is the standard basis itself?",
      choices: [
        "The identity matrix",
        "$A$ — unchanged",
        "$A^{-1}$",
        "Always diagonal",
      ],
      correctChoice: 1,
      explanation:
        "With $B = E$, $P = I$, so $[A]_B = I^{-1}AI = A$. This is the degenerate case that has been in force silently since Lesson 2 — which is exactly why the choice was invisible.",
    },
    {
      id: "cob-invariants",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "Which of these is **not** guaranteed to be the same for $A$ and $[A]_B$?",
      choices: [
        "The determinant",
        "The rank",
        "The individual entries",
        "The trace",
      ],
      correctChoice: 2,
      explanation:
        "The entries describe the map *in a chosen language*, so they change — that is the whole point of choosing a better basis. Determinant, rank, nullity and trace are properties of the map itself and survive: $\\det(P^{-1}AP) = \\det A$ by Lesson 7's multiplicativity, and $P$ invertible destroys nothing, so rank is unchanged.",
    },
    {
      id: "cob-converse-false",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "$I = \\begin{bmatrix} 1 & 0 \\\\ 0 & 1\\end{bmatrix}$ and $N = \\begin{bmatrix} 1 & 1 \\\\ 0 & 1\\end{bmatrix}$ have the same determinant ($1$) and the same trace ($2$). Are they similar?",
      choices: [
        "Yes — matching determinant and trace is exactly what similarity means",
        "No — $P^{-1}IP = I$ for every invertible $P$, so the identity is similar only to itself",
        "Yes, but only over the complex numbers",
        "It cannot be decided without computing eigenvalues",
      ],
      correctChoice: 1,
      explanation:
        "$P^{-1}IP = P^{-1}P = I$ whatever $P$ is, so nothing but $I$ is similar to $I$ — and $N \\ne I$. The invariants are **necessary, not sufficient**: they can rule similarity out, never in. (They do share eigenvalues too, both being $1$ twice; what differs is the *geometric* multiplicity, which Lesson 9 taught you to compute.)",
    },
    {
      id: "cob-not-orthonormal",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "Lesson 1's basis is $((1,2),(3,-1))$. Its vectors are not unit length, and their dot product is $1$, not $0$. What follows?",
      choices: [
        "It is not a valid basis; the coordinates computed from it are wrong",
        "Nothing — a basis needs only to be independent and spanning",
        "The change-of-basis matrix $P$ will not be invertible",
        "$[A]_B$ will not be defined",
      ],
      correctChoice: 1,
      explanation:
        "Independence and spanning are the only requirements, and they are exactly what makes $P$ invertible. Perpendicular unit-length bases are convenient later — they give $P^{-1} = P^{\\mathsf{T}}$ — but nothing in this lesson needs them.",
    },
    {
      id: "cob-derive-similarity",
      type: "custom",
      capabilityId: SELF_CHECK_ID,
      tier: "transfer",
      prompt:
        "Derive it: starting from what $[A]_B$ has to *do*, show that $[A]_B = P^{-1}AP$. Write your derivation, then compare with the model answer.",
      config: {
        modelAnswer:
          "By definition, $[A]_B$ is the matrix that acts on $B$-coordinates the way $A$ acts on standard ones: for every $\\mathbf{x}$, $[A\\mathbf{x}]_B = [A]_B\\,[\\mathbf{x}]_B$. Now rewrite both sides in standard coordinates using $[\\,\\cdot\\,]_B = P^{-1}(\\cdot)$. The left side is $P^{-1}(A\\mathbf{x})$, and the right side is $[A]_B P^{-1}\\mathbf{x}$. So $P^{-1}A\\mathbf{x} = [A]_B P^{-1}\\mathbf{x}$ holds for every $\\mathbf{x}$. Two matrices that agree on every vector agree on $\\mathbf{e}_1$ and $\\mathbf{e}_2$, hence have the same columns, hence are equal: $P^{-1}A = [A]_B P^{-1}$. Right-multiplying both sides by $P$ gives $P^{-1}AP = [A]_B$. Nothing was assumed about $B$ except that it is a basis, which is what makes $P^{-1}$ exist. Reading the result right to left recovers the meaning: $P$ translates $B$-coordinates into standard coordinates, $A$ acts there, and $P^{-1}$ translates back.",
        rubric:
          "A strong answer starts from the DEFINING requirement $[A\\mathbf{x}]_B = [A]_B[\\mathbf{x}]_B$ rather than manipulating $P^{-1}AP$ from the start, substitutes $[\\,\\cdot\\,]_B = P^{-1}(\\cdot)$ on both sides, argues that agreement on every vector implies matrix equality, and right-multiplies by $P$. It should note that $P^{-1}$ exists because $B$ is a basis, and ideally read the final expression right to left.",
      },
    },
  ],
  keyTakeaway:
    "A coordinate list is a vector's name in a basis, and a matrix is a map's description in one — and since Lesson 2 that basis has silently been the standard one. Build $P$ with the new basis vectors as columns and its direction is readable rather than memorable: $P$ converts $B$-coordinates to standard, so $[\\mathbf{x}]_B = P^{-1}\\mathbf{x}$ and $[A]_B = P^{-1}AP$ — translate, act, translate back. The object never moves; only its name changes. Determinant, rank and trace survive the translation because they belong to the map; the entries do not, which is why a well-chosen basis can make a map's description diagonal.",
  structuredSummary: {
    coreMentalModel:
      "The arrow never moves. Swapping the basis swaps the grid you count against, and therefore the name — not the thing named.",
    definitionsIntroduced: [
      "Coordinate vector $[\\mathbf{x}]_B$ and the change-of-basis matrix $P = [\\,\\mathbf{b}_1\\ \\mathbf{b}_2\\,]$",
      "The matrix of a map in a basis, $[A]_B$; similar matrices",
    ],
    mainResult:
      "$\\mathbf{x} = P[\\mathbf{x}]_B$, $[\\mathbf{x}]_B = P^{-1}\\mathbf{x}$, and $[A]_B = P^{-1}AP$; determinant, rank, nullity and trace are invariant, but the converse fails.",
    representationsConnected:
      "One arrow under two grids (picture) ↔ two coordinate lists (numbers) ↔ $P^{-1}AP$ (symbol).",
    commonMistake:
      "Believing the vector moved, or writing $PAP^{-1}$ — and concluding that equal determinant and trace imply similarity.",
    canonicalExample:
      "$B = ((1,2),(3,-1))$: the point $(4,1)$ is named $(1,1)$; and for $A = " + A_TEX + "$ the eigenbasis gives $[A]_B = \\begin{bmatrix} 3 & 0 \\\\ 0 & 2\\end{bmatrix}$.",
    oneProblemWorthRemembering:
      "Given a basis and a map, produce $[A]_B$ and check that $\\det$ and trace are unchanged.",
    whatThisUnlocksNext:
      "Which directions does a map merely scale? Those directions are the basis that makes it diagonal — the next lesson's hunt.",
  },
};
