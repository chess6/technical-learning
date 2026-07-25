import type { GuidedSceneChapter } from "../engine/types";

/**
 * Single source of truth for guided-scene timing.
 *
 * Each scene is defined as an ordered list of segments with explicit durations.
 * The Motion Canvas generator runs one body per segment id (so the animation
 * length always matches these numbers), and the step metadata below is derived
 * from the same durations (so step buttons and reduced-motion states line up
 * with the real timeline). This module is pure data — it imports no Motion
 * Canvas code, so engines and unit tests can read it freely.
 */

export interface SceneSegment {
  id: string;
  title: string;
  /** Seconds this segment occupies on the timeline. */
  duration: number;
  /**
   * Optional one-sentence chapter summary, surfaced by the player while this
   * segment is the active major step. Authored here so chapter metadata lives
   * beside the timing it describes, not in UI components.
   */
  summary?: string;
}

export const LINEAR_COMBINATION_SEGMENTS: readonly SceneSegment[] = [
  { id: "plane", title: "Coordinate plane", duration: 2.4 },
  { id: "vector-v", title: "Vector v", duration: 3 },
  { id: "components", title: "Components of v", duration: 3.2 },
  { id: "vector-w", title: "Vector w", duration: 3 },
  { id: "addition", title: "Head-to-tail addition", duration: 4 },
  { id: "scaling", title: "Scalar multiples", duration: 5 },
  { id: "combination", title: "a·v + b·w", duration: 5 },
  { id: "span-plane", title: "Independent span: the plane", duration: 4 },
  { id: "dependent", title: "Dependent span: a line", duration: 4.6 },
  { id: "dependent-inside", title: "One point, infinitely many (a, b)", duration: 5 },
  { id: "basis", title: "Independent pair → basis", duration: 4 },
  { id: "coordinates", title: "Coordinates in a basis", duration: 7 },
];

/**
 * Lesson 2 Watch scene — the columns rule derived on the basis, then verified
 * on a general vector and on the whole grid.
 *
 * Timing notes (2026-07 audit): the sample beat previously drew a vector that
 * was ALREADY transformed and the next beat only pulsed its line width, so the
 * linearity payoff — x visibly travelling to Ax on the same coefficients — was
 * asserted rather than shown. `transform-sample` now owns that travel and is
 * budgeted for it. The grid likewise used to fade in pre-deformed; it now
 * deforms during the column beats, which need room to register.
 */
export const MATRIX_TRANSFORMATION_SEGMENTS: readonly SceneSegment[] = [
  {
    id: "identity",
    title: "Identity grid",
    duration: 3.5,
    summary: "Start from the identity: e₁ = (1, 0) and e₂ = (0, 1), grid undeformed.",
  },
  {
    id: "col1",
    title: "First column → e₁",
    duration: 4.5,
    summary: "Moving the first column moves e₁ — and the grid shears with it.",
  },
  {
    id: "col2",
    title: "Second column → e₂",
    duration: 4.5,
    summary: "The second column is exactly where e₂ lands; the grid follows again.",
  },
  {
    id: "sample",
    title: "A general vector, before it moves",
    duration: 4.5,
    summary: "A vector that is not a basis vector, written in the original basis as 1.5·e₁ + 0.5·e₂.",
  },
  {
    id: "predict-sample",
    title: "Predict where it lands",
    duration: 5.5,
    summary: "Both columns are already known and x's coefficients do not change — so the landing point can be worked out before it is shown.",
  },
  {
    id: "transform-sample",
    title: "Watch it land",
    duration: 6.5,
    summary: "The same coefficients on the new basis images: x travels to 1.5·Ae₁ + 0.5·Ae₂ = Ax.",
  },
  {
    id: "grid",
    title: "Straight lines stay straight",
    duration: 5.5,
    summary: "One gridline and its image: lines map to lines, parallels stay parallel, the origin is pinned.",
  },
  {
    id: "compare",
    title: "Original vs transformed",
    duration: 3,
    summary: "Faint original axes beside the transformed basis, so the change is legible at a glance.",
  },
  {
    id: "presets",
    title: "A tour of transformations",
    duration: 13,
    summary: "Scale, rotation, reflection, projection — each reset to the identity first, so no tour step morphs into an unrelated one.",
  },
  {
    id: "summary",
    title: "Columns are the basis images",
    duration: 3.5,
    summary: "Two columns fix where e₁ and e₂ land, and linearity carries every other vector along.",
  },
];

/**
 * Chapter 0 — "Why Linear Algebra?" A recognizable multi-part craft is the
 * visual subject: it is established first, then the basis vectors and one marked
 * vertex are revealed, then each canonical transform is shown by RESETTING to
 * the identity and animating I → A_preset (never morphing one unrelated preset
 * straight into another). A translation beat shows the one move a 2×2 matrix
 * cannot make, and the scene freezes on the central mystery. No
 * column/derivation teaching here (that is Lesson 2).
 */
export const CHAPTER0_SEGMENTS: readonly SceneSegment[] = [
  { id: "establish", title: "One craft on a grid", duration: 4 },
  { id: "reveal", title: "Axes and one marked vertex", duration: 4 },
  { id: "scale", title: "Scaling", duration: 5 },
  { id: "rotation", title: "Rotation", duration: 5 },
  { id: "reflection", title: "Reflection", duration: 5 },
  { id: "shear", title: "Shear", duration: 5 },
  { id: "projection", title: "Projection collapses the plane", duration: 5 },
  { id: "translation", title: "The one move a matrix can't make", duration: 5.5 },
  { id: "mystery", title: "Four numbers, every vertex", duration: 5 },
];

/**
 * Lesson 2 callback — a short "return to the graphic" animation shown AFTER the
 * columns rule is derived. The decomposition is CONSTRUCTED rather than
 * asserted: a walk of a along e₁ then b along e₂ is drawn head-to-tail and
 * lands on the vertex, the learner predicts where that walk ends once the basis
 * moves, and then the same two component arrows ride the transformation onto
 * the columns. Resolves Chapter 0's mystery with the derived rule.
 *
 * The component arrows are bound to the LIVE matrix columns, so the head-to-tail
 * walk stays exact through every frame of the morph — the construction cannot
 * drift from the vertex it explains.
 */
export const COLUMNS_RULE_GRAPHIC_SEGMENTS: readonly SceneSegment[] = [
  {
    id: "vertex",
    title: "One vertex, two coordinates",
    duration: 5.5,
    summary: "Pick one vertex of the craft and read its standard coordinates (a, b).",
  },
  {
    id: "decompose",
    title: "Walk a along e₁, then b along e₂",
    duration: 7,
    summary: "The two components are drawn head-to-tail — the walk ends exactly on the vertex.",
  },
  {
    id: "predict",
    title: "Predict: where does the walk end?",
    duration: 5.5,
    summary: "The recipe (a, b) is fixed; only e₁ and e₂ move to the columns. Predict the landing point before it moves.",
  },
  {
    id: "image",
    title: "Same walk, new basis",
    duration: 7.5,
    summary: "The same two component arrows ride T onto the columns and land on the moved vertex: T(x) = a·T(e₁) + b·T(e₂).",
  },
  {
    id: "all-vertices",
    title: "Every vertex, the same two columns",
    duration: 6,
    summary: "Each vertex keeps its own (a, b) but walks on the same two columns — which is why two columns move the whole craft.",
  },
];

/**
 * "Linear Systems" Watch scene — one system `A x = b`, shown as two pictures of
 * the same question and then the no / one / infinitely-many trichotomy. The
 * scene shows ONE picture at a time (one conceptual change at a time): first the
 * row picture (two lines meeting), then the column picture (combine the columns
 * to reach b), then walks the three cases in the row picture where they read
 * fastest. Reuses Lesson 1's numbers throughout.
 */
export const SYSTEMS_SEGMENTS: readonly SceneSegment[] = [
  { id: "equations", title: "One system, two equations", duration: 4 },
  { id: "row", title: "Row picture: lines meet", duration: 6 },
  { id: "regroup", title: "Regroup by columns", duration: 5 },
  { id: "column", title: "Column picture: combine to reach b", duration: 7 },
  { id: "unique", title: "One meeting point, one recipe", duration: 4 },
  { id: "infinite", title: "Same line: infinitely many", duration: 6 },
  { id: "none", title: "Parallel lines: no solution", duration: 5.5 },
  { id: "summary", title: "Two pictures, one question", duration: 4 },
];

/**
 * "Elimination" Watch scene — one row operation as reversible constraint
 * manipulation. Three synchronized views (written equations, augmented matrix,
 * the two constraint lines) stay in sync while R2 → R2 − 2·R1 pivots the second
 * line around the fixed intersection, ending on a triangular system read off by
 * back-substitution. Reuses Lesson 3's system A = [[1,3],[2,-1]], b = (−1,5).
 */
export const ELIMINATION_SEGMENTS: readonly SceneSegment[] = [
  { id: "setup", title: "One system, three views", duration: 5 },
  { id: "operation", title: "R2 → R2 − 2·R1", duration: 7 },
  { id: "triangular", title: "Triangular: read off y, back-substitute", duration: 6 },
  { id: "invariance", title: "The crossing never moved", duration: 5 },
  { id: "summary", title: "Same solutions, easier system", duration: 4 },
];

/**
 * "Solution Sets & Homogeneous Systems" Watch scene — the difference-of-solutions
 * discovery engine, in solution space `(x, y)`. Two solutions of one consistent
 * system are subtracted to reveal a homogeneous solution; adding it back
 * generates more; all differences fill `Null(A)` through the origin; and the
 * whole solution set is that null line translated by a particular solution —
 * empty when no particular solution exists. Reuses Lesson 3's dependent system
 * (columns (1,2),(2,4), b = (3,6)): x_p = (3,0), null direction (2,−1), so
 * (3,0),(1,1),(5,−1) are all solutions.
 */
export const SOLUTION_SETS_SEGMENTS: readonly SceneSegment[] = [
  { id: "two-solutions", title: "Two solutions of one system", duration: 5 },
  { id: "difference", title: "Subtract them: a homogeneous solution", duration: 6 },
  { id: "generate", title: "Add it back to make more", duration: 6 },
  { id: "null-line", title: "The homogeneous line Null(A)", duration: 5 },
  { id: "translate", title: "The set is the null line, shifted", duration: 6 },
  { id: "cases", title: "Empty, a point, or a line", duration: 6 },
];

/**
 * Lesson 8 — "Subspaces, Column Space, Null Space, Rank". Two labelled panels
 * under a stated isometric projection: the INPUT space R^3 on the left (holding
 * the null space) and the OUTPUT space R^3 on the right (holding the column
 * space). The lesson's central confusion — that the two spaces live in the same
 * place — is prevented by the layout rather than corrected by a warning.
 *
 * Runs the rank-2 map [[1,0,2],[0,1,3],[1,1,5]] (row 3 = row 1 + row 2), then
 * switches to the rank-1 map [[1,2,3],[2,4,6],[3,6,9]] so the learner sees the
 * two dimensions move in OPPOSITE directions.
 */
export const SUBSPACES_RANK_SEGMENTS: readonly SceneSegment[] = [
  {
    id: "two-panels",
    title: "Two spaces, not one",
    duration: 5.5,
    summary: "Inputs live in the left panel, outputs in the right. The map is the arrow between them.",
  },
  {
    id: "reach",
    title: "What the map can reach",
    duration: 6.5,
    summary: "Sweeping every input sweeps out only a plane of outputs — not the whole output space.",
  },
  {
    id: "colspace",
    title: "Name it: the column space",
    duration: 6,
    summary: "That plane is the span of the columns: everything the map can produce, so it decides existence.",
  },
  {
    id: "crush",
    title: "What the map destroys",
    duration: 6,
    summary: "A whole line of different inputs lands on the single point zero.",
  },
  {
    id: "nullspace",
    title: "Name it: the null space",
    duration: 6,
    summary: "That line is Null(A), and it lives in the INPUT panel — a different space from the column space.",
  },
  {
    id: "count",
    title: "Rank counts what survived",
    duration: 5.5,
    summary: "Three dimensions went in, two came out: the rank is 2, and one dimension was crushed.",
  },
  {
    id: "rank-one",
    title: "Take away one more",
    duration: 7,
    summary: "A rank-1 map: the image shrinks to a line while the null space grows to a plane. They move in opposite directions.",
  },
];

/**
 * Lesson 9 — "Dimension & Rank–Nullity". A LEDGER, deliberately not geometry:
 * Lesson 8 owned the geometric picture, and repeating it would teach nothing new.
 * n input dimensions enter as tokens, each is posted to exactly one of two
 * columns (survived / crushed), and the running total never changes.
 *
 * The tokens are created once and only ever MOVED between columns, so
 * conservation is visible as motion rather than as a redraw. The final beats
 * switch to a 2x3 map, where the surviving column has only two slots — so at
 * least one token must be crushed, and no such map can be one-to-one.
 */
export const RANK_NULLITY_SEGMENTS: readonly SceneSegment[] = [
  {
    id: "budget",
    title: "Three dimensions go in",
    duration: 5,
    summary: "The input dimension n is a budget: three independent directions enter the map.",
  },
  {
    id: "post",
    title: "Each one has a fate",
    duration: 7,
    summary: "Every input dimension either survives into the image or collapses into the null space — never both, never neither.",
  },
  {
    id: "balance",
    title: "The books balance",
    duration: 5.5,
    summary: "Two survived, one was crushed, and 2 + 1 = 3: the total is the input dimension.",
  },
  {
    id: "degrade",
    title: "Spend the budget differently",
    duration: 6.5,
    summary: "Degrade the map and a token moves ACROSS the ledger. The split changes; the total cannot.",
  },
  {
    id: "ceiling",
    title: "A map with a lower ceiling",
    duration: 6.5,
    summary: "For a 2-by-3 map the surviving column has only two slots — the output space is not big enough to hold three dimensions.",
  },
  {
    id: "forbidden",
    title: "So this can never happen",
    duration: 6,
    summary: "At least one of the three must be crushed, so no map from a bigger space to a smaller one is one-to-one. No computation needed.",
  },
];

/**
 * Lesson 10 — "Change of Basis". ONE arrow, drawn once and never moved; the grid
 * beneath it is swapped. The arrow's position is written only at setup, so
 * "the vector does not move" is a guarantee of the scene's construction rather
 * than a claim in a caption.
 *
 * Reuses Lesson 1's numbers exactly — basis ((1,2),(3,-1)), point (4,1) with
 * coordinates (1,1) — so no new arithmetic competes with the new interpretation.
 * The last two beats show the same deformation described by two different
 * matrices, the second diagonal, which is the payoff Lesson 11 opens on.
 */
export const CHANGE_OF_BASIS_SEGMENTS: readonly SceneSegment[] = [
  {
    id: "one-arrow",
    title: "One arrow on the usual grid",
    duration: 5,
    summary: "The point p reads (4, 1) against the standard grid — the grid nobody has mentioned since Lesson 2.",
  },
  {
    id: "swap-grid",
    title: "Swap the grid, not the arrow",
    duration: 6,
    summary: "A second grid, built from Lesson 1's basis, fades in over the same arrow. The arrow does not move.",
  },
  {
    id: "new-readout",
    title: "A different name for the same point",
    duration: 6,
    summary: "Against the new grid the same point reads (1, 1). Both names are shown at once — one point, two descriptions.",
  },
  {
    id: "hidden-subscript",
    title: "The subscript that was always there",
    duration: 5.5,
    summary: "The first reading was never just (4, 1) — it was the coordinates in the standard basis, written without saying so.",
  },
  {
    id: "map-standard",
    title: "A map, described in the standard basis",
    duration: 6,
    summary: "The plane deforms. Beside it, the matrix that describes the deformation in standard coordinates.",
  },
  {
    id: "map-eigenbasis",
    title: "The same deformation, described in another basis",
    duration: 7,
    summary: "Identical motion, different description — and in this basis the matrix is diagonal. The map did not get simpler; the language did.",
  },
];

/**
 * Lesson 6 — "Matrix Composition & Inverses". The scene asks one question seven
 * times: *where does the basis land?* Apply B, then A; show that a single matrix
 * does both; read the product's columns off the two basis paths; swap the order;
 * undo; and finally meet a map with nothing to undo.
 *
 * Object-persistence rule (see the lesson plan): the two basis arrows and the
 * shared craft are created once and only ever MOVED or re-coloured — never
 * removed and re-added — so their identity survives scrubbing and reduced
 * motion. Reuses A = [[2,1],[0,1]] (`shear-2-1`, the L2/L7 map) and
 * R = [[0,−1],[1,0]] (`rotation`), with `singular-collapse` for the final beat.
 */
export const MATRIX_COMPOSITION_SEGMENTS: readonly SceneSegment[] = [
  { id: "apply-b", title: "Apply the first map", duration: 5.5 },
  { id: "apply-a", title: "Then apply the second", duration: 6.5 },
  { id: "one-map", title: "One matrix does both", duration: 6 },
  { id: "columns", title: "Column j is where eⱼ ended up", duration: 7 },
  { id: "order", title: "Swap the order", duration: 6.5 },
  { id: "undo", title: "Undo it", duration: 6 },
  { id: "no-undo", title: "When there is nothing to undo", duration: 7 },
];

/**
 * Explicit per-beat animation budgets the elimination scene consumes INSIDE
 * each segment. Every animated yield in `eliminationScene` reads its duration
 * from here (parallel animations in one beat share a single entry — the beat's
 * wall-clock length), and the scene wraps each segment body in `runSegment`,
 * which measures real elapsed time and PADS the remainder up to the segment's
 * declared `duration`. Because these budgets are pure, MC-free data, a unit
 * test can assert every segment body fits its budget (so `runSegment` only ever
 * pads, never truncates) — the necessary precondition for the padded timeline
 * to equal `totalDuration(ELIMINATION_SEGMENTS)`. That unit test does NOT run
 * the Motion Canvas scene, so it does not directly measure the rendered
 * timeline; the Playwright scrubber/marker checks in
 * `e2e/lesson-elimination.spec.ts` are the behavioral evidence that the running
 * scene stays aligned. This replaces the old, drift-prone
 * `waitFor(duration - guessedTotal)` subtractions.
 */
export const ELIMINATION_BEATS: Record<string, Record<string, number>> = {
  setup: { panels: 0.5, lines: 0.5, dotIn: 0.4, dotPulseUp: 0.4, dotPulseDown: 0.3 },
  // operation: pulse the fixed point, reveal the scaled −2·R1 term, then slide
  // it into R2 while the row (and its line) interpolate to the result.
  operation: { anchorUp: 0.3, anchorDown: 0.3, ghostReveal: 0.6, combine: 2.6, landUp: 0.3, landDown: 0.3 },
  triangular: { lineUp: 0.3, lineDown: 0.3, dotUp: 0.35, dotDown: 0.35 },
  invariance: { dim: 0.4, grow: 0.35, shrink: 0.35, restore: 0.4 },
  summary: { settleUp: 0.2, settleDown: 0.2 },
};

/** Total animated time a segment body consumes (sum of its beat budgets). */
export function sumBeats(beats: Record<string, number> | undefined): number {
  if (!beats) return 0;
  return Object.values(beats).reduce((sum, d) => sum + d, 0);
}

export const SPIKE_SEGMENTS: readonly SceneSegment[] = [
  { id: "identity", title: "Identity grid", duration: 0.4 },
  { id: "transform", title: "Apply the matrix", duration: 2 },
  { id: "result", title: "Transformed space", duration: 0.6 },
];

export const DETERMINANT_SEGMENTS: readonly SceneSegment[] = [
  { id: "identity", title: "Unit square area 1", duration: 3 },
  { id: "basis", title: "Columns land", duration: 3.5 },
  { id: "parallelogram", title: "Same square, new shape", duration: 3.5 },
  { id: "area", title: "Name the area factor", duration: 4 },
  // Successive diagonal stretches need held intermediate (×a then ×d).
  { id: "expand", title: "Area multiplies in stages", duration: 5.5 },
  { id: "collapse", title: "Factor → 0 collapse", duration: 4 },
  { id: "negative", title: "Past zero: flip", duration: 4.5 },
  { id: "sign", title: "Magnitude vs sign", duration: 3.5 },
  { id: "summary", title: "Signed area scaling", duration: 3 },
];

/**
 * Lesson 4 Watch scene — eigenvectors as invariant directions.
 *
 * Two shape rules this list encodes (both from the July 2026 guided-animation
 * audit, which found the old nine-beat cut fading in already-deformed grids and
 * spending whole seconds on invisible matrix morphs):
 *
 * - **Every case matrix is reached from the identity with the grid on screen.**
 *   `scalar` / `defective` / `rotation` each budget a visible return-to-identity
 *   plus a visible deformation, which is why they cost ~5.5s rather than ~5s.
 * - **The λ ladder is split into navigable beats** (`stretch`, `reverse`,
 *   `collapse`) with a prediction between the established mechanic and the
 *   counterintuitive one, replacing the single opaque 11s `lambdas` block.
 */
export const EIGENVECTOR_SEGMENTS: readonly SceneSegment[] = [
  {
    id: "fan",
    title: "A fan of directions",
    duration: 3.5,
    summary: "Six directions drawn from the origin, before A touches any of them.",
  },
  {
    id: "apply",
    title: "Most directions turn",
    duration: 5.5,
    summary: "The grid and the fan deform together off one signal — most tips leave their ray.",
  },
  {
    id: "highlight",
    title: "Some stay on their line",
    duration: 5,
    summary: "Two lines map onto themselves; the scale factor is read off the picture.",
  },
  {
    id: "equation",
    title: "Av = λv",
    duration: 4,
    summary: "Name the behavior after it has been felt: eigenvector, eigenvalue.",
  },
  {
    id: "stretch",
    title: "λ > 1 stretches",
    duration: 5,
    summary: "Same line, farther out — the mechanic the prediction will build on.",
  },
  {
    id: "predict-reverse",
    title: "Predict: λ = −1",
    duration: 5.5,
    summary: "Av = λv and λ are both given. Where does the tip land? Held silence to think.",
  },
  {
    id: "reverse",
    title: "λ < 0 reverses",
    duration: 4.5,
    summary: "The reveal: same line, opposite ray, same length — staying on a line is not staying on a ray.",
  },
  {
    id: "collapse",
    title: "λ = 0 collapses",
    duration: 4.5,
    summary: "Zero scale retracts the tip to the origin — the Lesson 3 collapse, seen along one line.",
  },
  {
    id: "scalar",
    title: "Scalar: every direction",
    duration: 5.5,
    summary: "A = λI. Space springs back to the identity, then scales — so every line stays.",
  },
  {
    id: "defective",
    title: "Defective: only one line",
    duration: 5.5,
    summary: "Repeated λ, and the grid visibly shears: exactly one line survives.",
  },
  {
    id: "rotation",
    title: "No real eigenvectors",
    duration: 5.5,
    summary: "The counterexample — the grid rotates and no line is left in place.",
  },
  {
    id: "summary",
    title: "Invariant directions",
    duration: 4.5,
    summary: "Back to A: eigenvector = nonzero direction A keeps; λ = the signed scale along it.",
  },
];

/**
 * Computational derivation ladder (embedded in the Lesson 4 worked example).
 * Teaches how to compute eigenvalues/eigenvectors — not a second Watch block.
 */
export const EIGEN_DERIVATION_SEGMENTS: readonly SceneSegment[] = [
  {
    id: "recap",
    title: "Av = λv",
    duration: 4,
    summary: "The defining equation: the matrix acts like a pure stretch on v.",
  },
  {
    id: "shift",
    title: "(A − λI)v = 0",
    duration: 5.5,
    summary: "Move both terms to one side — v must be sent to zero by the shifted matrix.",
  },
  {
    id: "charpoly",
    title: "det(A − λI) = 0",
    duration: 5.5,
    summary: "A nonzero v dies only if the shifted matrix collapses the plane: determinant zero.",
  },
  {
    id: "solveLambda",
    title: "Solve for λ",
    duration: 4.5,
    summary: "The characteristic polynomial's roots are the only possible eigenvalues.",
  },
  {
    id: "solveV",
    title: "Solve the eigenspaces",
    duration: 6,
    summary: "Substitute each λ back and solve for the direction it stretches.",
  },
  {
    id: "interpret",
    title: "Interpret geometrically",
    duration: 4.5,
    summary: "Each eigenspace is an invariant line; λ is the stretch factor along it.",
  },
];

/**
 * Karatsuba Watch scene — elementary place-value breakthrough.
 * No polynomial/`deeper` beat: that material stays in depth layers / explorer.
 * Total ~58s.
 */
export const KARATSUBA_SEGMENTS: readonly SceneSegment[] = [
  { id: "setup", title: "Two numbers, one rectangle", duration: 4 },
  { id: "foil", title: "Four pieces (FOIL)", duration: 5 },
  { id: "weights", title: "Place-value weights", duration: 5.5 },
  { id: "share", title: "The middle collapses", duration: 5.5 },
  { id: "aux-rect", title: "A different rectangle", duration: 5.5 },
  { id: "subtract", title: "Peel off the corners", duration: 6 },
  { id: "reassemble", title: "Rebuild the answer", duration: 5.5 },
  { id: "carry-vs-width", title: "Two kinds of too big", duration: 7 },
  { id: "branch", title: "Four calls or three?", duration: 7 },
  { id: "exponent", title: "The exponent bends", duration: 7 },
];

/**
 * Binary Search Trees — the bridge made visible. Binary search runs on a sorted
 * array, its probes are circled, a second search shows the first probe being
 * recomputed, and then the probed cells are LIFTED straight down into tree
 * positions (a pure vertical move, so the drawing cannot imply a computation).
 * The ordering rule is then read OFF the picture rather than asserted, and the
 * scene closes on the two extremes: median-first vs sorted insertion.
 */
export const BST_LIFT_SEGMENTS: readonly SceneSegment[] = [
  { id: "establish", title: "A sorted array, and a key to find", duration: 4 },
  { id: "probe-first", title: "One comparison, half the array gone", duration: 5 },
  { id: "probe-rest", title: "Two more probes finish it", duration: 5 },
  { id: "second-search", title: "A different key repeats the first probe", duration: 5 },
  { id: "lift", title: "Keep the probes: they were a tree", duration: 6 },
  { id: "read-the-rule", title: "The rule was not assumed", duration: 5 },
  { id: "interval-stays", title: "Every position inherits a range", duration: 5 },
  { id: "cost-is-depth", title: "One comparison per level", duration: 5 },
  { id: "degenerate", title: "Insert in order — and get a stick", duration: 6.5 },
  { id: "the-gap", title: "Same keys. Three comparisons, or seven", duration: 5.5 },
];

/**
 * Red–Black Trees — the encoding, shown as one cluster in two panels. The left
 * panel holds a 2–3–4 node as a box of keys; the right holds its binary
 * encoding. Keys are added to the left and the encoding follows in the same
 * frame, so the correspondence is watched rather than asserted; then the node
 * overflows and the split is SEEN to be the colour flip.
 */
export const RED_BLACK_SEGMENTS: readonly SceneSegment[] = [
  {
    id: "establish",
    title: "One key, one node",
    duration: 4,
    summary: "Both panels start from the same single key — one cluster, two drawings.",
  },
  {
    id: "encode-2node",
    title: "A 2-node is a lone black node",
    duration: 4.5,
    summary: "A one-key 2–3–4 node encodes as a single black node; black = cluster boundary.",
  },
  {
    id: "encode-3node",
    title: "A second key hangs off in red",
    duration: 5.5,
    summary: "The second key stays inside the same cluster, so it hangs off in red.",
  },
  {
    id: "encode-4node",
    title: "Three keys, two reds",
    duration: 5,
    summary: "Three keys still form one cluster: one black representative, two red children.",
  },
  {
    id: "read-off-r2",
    title: "“No two reds” is the drawing rule",
    duration: 5,
    summary: "Red-on-red would mean a cluster with four keys — the encoding forbids it.",
  },
  {
    id: "read-off-r3",
    title: "Black nodes count levels",
    duration: 5,
    summary: "Every path crosses one black node per cluster: black height = 2–3–4 height.",
  },
  {
    id: "overflow",
    title: "A fourth key, and no room",
    duration: 5,
    summary: "The node is full — predict which key is promoted, and whether the encoding moves or recolours.",
  },
  {
    id: "split-is-recolour",
    title: "The split IS the colour flip",
    duration: 6.5,
    summary: "The 2–3–4 split and the red-black colour flip are the same move — and the arriving key finally fits.",
  },
  {
    id: "invariant-held",
    title: "What the flip conserved",
    duration: 5,
    summary: "Black height is untouched: still one black on every path — the split changed colours, not counts.",
  },
  {
    id: "violation-moves-up",
    title: "The break moves up one level",
    duration: 5,
    summary: "The promoted key may turn its parent red-on-red: the violation moves up, never multiplies.",
  },
  {
    id: "root-split",
    title: "The only way the tree gets taller",
    duration: 5.5,
    summary: "Only a root split adds height — every leaf gains one level at once, so black height stays equal everywhere.",
  },
];

/** Total timeline length in seconds. */
export function totalDuration(segments: readonly SceneSegment[]): number {
  return segments.reduce((sum, segment) => sum + segment.duration, 0);
}

/** Derive normalized (0..1) step markers from segment durations. */
export function toSteps(segments: readonly SceneSegment[]): GuidedSceneChapter[] {
  const total = totalDuration(segments);
  const steps: GuidedSceneChapter[] = [];
  let elapsed = 0;
  for (const segment of segments) {
    steps.push({
      id: segment.id,
      title: segment.title,
      at: total > 0 ? elapsed / total : 0,
      ...(segment.summary ? { summary: segment.summary } : {}),
    });
    elapsed += segment.duration;
  }
  return steps;
}
