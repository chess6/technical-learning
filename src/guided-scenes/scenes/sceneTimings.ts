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
 *
 * Two registries at the bottom close the loop:
 *
 *  - {@link SCENE_SEGMENTS} maps every registered scene id to its segment list.
 *  - {@link SCENE_BEATS} declares, per segment, the wall-clock cost of every
 *    animated yield in that segment's body. Scene bodies READ their durations
 *    from here rather than hardcoding them, so `sceneTimings.test.ts` can assert
 *    that no body can outgrow its segment — the precondition for `runSegment`
 *    to only ever pad. That test is the automatic gate the July 2026 audit's
 *    "hand-subtracted timing" finding asked for.
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

/** Wall-clock cost of each animated yield inside one segment body. */
export type SegmentBeats = Record<string, number>;
/** Every segment body's budget, keyed by segment id. */
export type SceneBeats = Record<string, SegmentBeats>;

/**
 * Lesson 1 — vectors and linear combinations.
 *
 * Timing/pedagogy notes (2026-07 audit): `addition` claimed "slide w so its tail
 * sits on the tip of v" while a SECOND arrow grew in place — the travel is now
 * enacted on the same object and the beat is budgeted for it. The closing
 * coordinate arc is split so a prediction can sit between "the new grid is up"
 * and "here is what p reads against it".
 */
export const LINEAR_COMBINATION_SEGMENTS: readonly SceneSegment[] = [
  {
    id: "plane",
    title: "Coordinate plane",
    duration: 2.4,
    summary: "A plain coordinate plane and the origin every arrow will start from.",
  },
  {
    id: "vector-v",
    title: "Vector v",
    duration: 3,
    summary: "One arrow from the origin: v = (1, 2).",
  },
  {
    id: "components",
    title: "Components of v",
    duration: 3.2,
    summary: "Its coordinates are a horizontal move followed by a vertical one.",
  },
  {
    id: "vector-w",
    title: "Vector w",
    duration: 3,
    summary: "A second arrow pointing in a genuinely different direction.",
  },
  {
    id: "addition",
    title: "Head-to-tail addition",
    duration: 5.5,
    summary: "w itself travels until its tail sits on the tip of v — the sum is where it ends up.",
  },
  {
    id: "scaling",
    title: "Scalar multiples",
    duration: 6,
    summary: "One coefficient stretches, shrinks, and reverses the same arrow.",
  },
  {
    id: "combination",
    title: "a·v + b·w",
    duration: 5,
    summary: "Both coefficients move at once: every pair (a, b) is one reachable point.",
  },
  {
    id: "span-plane",
    title: "Independent span: the plane",
    duration: 4,
    summary: "With independent directions the reachable set fills the whole plane — that set is the span.",
  },
  {
    id: "dependent",
    title: "Dependent span: a line",
    duration: 4.6,
    summary: "Swing w onto v's line and the reachable set collapses to that line.",
  },
  {
    id: "dependent-inside",
    title: "One point, infinitely many (a, b)",
    duration: 6,
    summary: "On a dependent pair the coefficients slide while the tip stays put: one point, many recipes.",
  },
  {
    id: "basis",
    title: "Independent pair → basis",
    duration: 4,
    summary: "Restore the independent pair and name it: two independent directions are a basis of the plane.",
  },
  {
    id: "read-standard",
    title: "p in the standard basis",
    duration: 5.5,
    summary: "One fixed point p reads (4, 1) against the standard grid; then the (v, w) grid fades in over it.",
  },
  {
    id: "predict-coordinates",
    title: "Predict: what does p read here?",
    duration: 5.5,
    summary: "The arrow has not moved and the new grid is on screen — work out p's new coordinates before they appear.",
  },
  {
    id: "coordinates",
    title: "Coordinates in a basis",
    duration: 5,
    summary: "The walk lands on p: one step along v, one along w — p = (1, 1) in that basis, same arrow.",
  },
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
 * straight into another). The learner then predicts whether any such rule can
 * slide the craft, the slide is ENACTED as a dashed ghost that travels (it used
 * to fade in already displaced), and the scene freezes on the central mystery.
 * No column/derivation teaching here (that is Lesson 2).
 */
export const CHAPTER0_SEGMENTS: readonly SceneSegment[] = [
  {
    id: "establish",
    title: "One craft on a grid",
    duration: 4,
    summary: "A small craft drawn from its corner points, and the origin dot every transform will leave alone.",
  },
  {
    id: "reveal",
    title: "Basis vectors and one marked vertex",
    duration: 4,
    summary: "e₁ and e₂ are the two arrows the frame is built from — not the axes — and one vertex x is marked to follow.",
  },
  {
    id: "scale",
    title: "Scaling",
    duration: 5,
    summary: "Reset to the identity, then scale: every vertex moves twice as far from the origin.",
  },
  {
    id: "rotation",
    title: "Rotation",
    duration: 5,
    summary: "Reset, then rotate: the whole craft turns about the origin, which does not move.",
  },
  {
    id: "reflection",
    title: "Reflection",
    duration: 5,
    summary: "Reset, then reflect across the x-axis — the fins swap sides.",
  },
  {
    id: "shear",
    title: "Shear",
    duration: 5,
    summary: "Reset, then shear: horizontal layers slide by their height.",
  },
  {
    id: "projection",
    title: "Projection collapses the plane",
    duration: 5,
    summary: "Reset, then project: the plane flattens onto a line and the craft loses a dimension.",
  },
  {
    id: "predict-translation",
    title: "Predict: can four numbers slide it?",
    duration: 5.5,
    summary: "Five transforms have run and the origin dot has not moved once. Decide whether any of them could slide the craft off it.",
  },
  {
    id: "translation",
    title: "The one move a matrix can't make",
    duration: 6,
    summary: "The slide is shown as a ghost that travels — and no 2×2 matrix can follow it, because A·0 = 0 pins the origin.",
  },
  {
    id: "mystery",
    title: "Four numbers, every vertex",
    duration: 5,
    summary: "Back to the shear: four numbers decided where every vertex went. How?",
  },
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
 * to reach b), then walks the three cases.
 *
 * Colour contract (2026-07 audit fix): the two equations are a CO-EQUAL pair
 * (basis1 / basis2), the solution point is the invariant (`selected`), and the
 * target b has its own role (`target`) — b and the solution point used to share
 * one gold, which is precisely the confusion the two-space layout exists to
 * prevent.
 */
export const SYSTEMS_SEGMENTS: readonly SceneSegment[] = [
  {
    id: "equations",
    title: "One system, two equations",
    duration: 4,
    summary: "Two linear equations in the same two unknowns — one system, asked two ways below.",
  },
  {
    id: "row",
    title: "Row picture: lines meet",
    duration: 6,
    summary: "Each equation is a line in coefficient space; the solution is the single point they share.",
  },
  {
    id: "regroup",
    title: "Regroup by columns",
    duration: 5,
    summary: "Fade the lines out and change space: the same numbers regrouped as columns and a target b.",
  },
  {
    id: "predict-column",
    title: "Predict: which multiples reach b?",
    duration: 5.5,
    summary: "The row picture already answered (2, −1). Decide what those same numbers mean for the columns before they move.",
  },
  {
    id: "column",
    title: "Column picture: combine to reach b",
    duration: 7,
    summary: "2·col₁ − 1·col₂ lands exactly on b — the same pair the two lines met at.",
  },
  {
    id: "unique",
    title: "One meeting point, one recipe",
    duration: 4,
    summary: "Independent columns: the lines cross once and exactly one recipe reaches b.",
  },
  {
    id: "infinite",
    title: "Same line: infinitely many",
    duration: 6,
    summary: "Make the columns dependent and the two lines slide onto each other — every point on the line solves it.",
  },
  {
    id: "none",
    title: "Parallel lines: no solution",
    duration: 7,
    summary: "b visibly travels off the column line; back in the row picture the two lines are parallel and never meet.",
  },
  {
    id: "summary",
    title: "Two pictures, one question",
    duration: 4,
    summary: "Two spaces, two pictures, one question: is b reachable, and in how many ways?",
  },
];

/**
 * "Elimination" Watch scene — one row operation as reversible constraint
 * manipulation. Three synchronized views (written equations, augmented matrix,
 * the two constraint lines) stay in sync while R2 → R2 − 2·R1 pivots the second
 * line around the fixed intersection, ending on a triangular system read off by
 * back-substitution. Reuses Lesson 3's system A = [[1,3],[2,-1]], b = (−1,5).
 *
 * R1 and R2 are drawn as a CO-EQUAL pair (basis1 / basis2); the solution point
 * is the invariant and keeps the `selected` role across the whole scene.
 */
export const ELIMINATION_SEGMENTS: readonly SceneSegment[] = [
  {
    id: "setup",
    title: "One system, three views",
    duration: 5,
    summary: "The same system as equations, as an augmented matrix, and as two lines that cross at (2, −1).",
  },
  {
    id: "predict",
    title: "Predict: what can the operation not move?",
    duration: 5.5,
    summary: "Both equations hold at the crossing. Work out what that forces about R2 − 2·R1 before the line swings.",
  },
  {
    id: "operation",
    title: "R2 → R2 − 2·R1",
    duration: 7,
    summary: "The scaled −2·R1 row slides up onto R2 while all three views interpolate as one state — and the crossing holds.",
  },
  {
    id: "triangular",
    title: "Triangular: read off y, back-substitute",
    duration: 6,
    summary: "With x gone from R2, y is read directly and back-substitution recovers x.",
  },
  {
    id: "invariance",
    title: "The crossing never moved",
    duration: 5,
    summary: "Any point on both old lines satisfies the new one, and back — so the solution set is untouched.",
  },
  {
    id: "summary",
    title: "Same solutions, easier system",
    duration: 4,
    summary: "Elimination rewrites the constraints into easier ones with exactly the same solutions.",
  },
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
 *
 * The three cases used to share one opaque `cases` segment, so Prev/Next could
 * not reach "empty" or "a point" separately; they are now their own chapters.
 */
export const SOLUTION_SETS_SEGMENTS: readonly SceneSegment[] = [
  {
    id: "two-solutions",
    title: "Two solutions of one system",
    duration: 5,
    summary: "Two different points that both satisfy the same consistent system.",
  },
  {
    id: "difference",
    title: "Subtract them: a homogeneous solution",
    duration: 7,
    summary: "The difference arrow itself travels to the origin — the same object, now read as a solution of A x = 0.",
  },
  {
    id: "predict-generate",
    title: "Predict: add it back to a solution",
    duration: 5.5,
    summary: "A(x₁ − x₂) = 0 was just shown. Work out what A does to x₁ + (x₁ − x₂) before the third point appears.",
  },
  {
    id: "generate",
    title: "Add it back to make more",
    duration: 6,
    summary: "The sum is a third solution, produced without solving the system again.",
  },
  {
    id: "null-line",
    title: "The homogeneous line Null(A)",
    duration: 5,
    summary: "Every such difference lies on one line through the origin: the null space.",
  },
  {
    id: "translate",
    title: "The set is the null line, shifted",
    duration: 6,
    summary: "Sol(A, b) is that null line carried off the origin by one particular solution — affine, not through 0.",
  },
  {
    id: "parameterize",
    title: "Sweep the parameter: xₚ + t·d",
    duration: 8.5,
    summary:
      "One point sweeps the whole solution line while the decomposition is written beside it: the particular part never moves, the homogeneous part is what varies, and their sum is always a solution.",
  },
  {
    id: "case-empty",
    title: "Case: empty",
    duration: 4,
    summary: "With b off the column space there is no particular solution, so the set is empty — while Null(A) is unchanged.",
  },
  {
    id: "case-point",
    title: "Case: a single point",
    duration: 4,
    summary: "A trivial null space leaves the particular solution alone: exactly one point.",
  },
  {
    id: "case-line",
    title: "Case: a line",
    duration: 4.5,
    summary: "A nontrivial null space and a reachable b give the shifted line again — the general shape.",
  },
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
 *
 * Both collapses are now ENACTED: the output cube starts as a copy of the input
 * cube and visibly flattens (it used to fade in already flat), and a probe point
 * travels the null line while its image sits still on the origin.
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
    duration: 8,
    summary: "A copy of the cube is pushed through A and visibly flattens: the outputs fill only a plane.",
  },
  {
    id: "columns",
    title: "Where the plane comes from: the columns",
    duration: 11,
    summary:
      "The columns are admitted one at a time: c₁ opens a line, c₂ points off it and the reach grows to a plane, and the dependent c₃ lands inside it — so the rank goes 1, 2, and then stays 2.",
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
    duration: 7.5,
    summary: "A probe travels a whole line of inputs while its image never leaves the origin.",
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
    id: "predict-rank-one",
    title: "Predict: what happens to Null(A)?",
    duration: 5.5,
    summary: "The next map has rank 1 instead of 2. Decide whether the null space shrinks, stays, or grows.",
  },
  {
    id: "rank-one",
    title: "Take away one more",
    duration: 8,
    summary: "Reset and re-deform: the image collapses further to a line while the null space grows to a plane.",
  },
];

/**
 * Lesson 9 — "Dimension & Rank–Nullity". A LEDGER, deliberately not geometry:
 * Lesson 8 owned the geometric picture, and repeating it would teach nothing new.
 * n input dimensions enter as tokens, each is posted to exactly one of two
 * columns (survived / crushed), and the running total never changes.
 *
 * The tokens are created once and only ever MOVED between columns, so
 * conservation is visible as motion rather than as a redraw. The tally is a
 * function of the live split, so it cannot report a state the tokens are not in.
 * The final beats switch to a 2x3 map, where the surviving column has only two
 * slots — so at least one token must be crushed.
 */
export const RANK_NULLITY_SEGMENTS: readonly SceneSegment[] = [
  {
    id: "budget",
    title: "Three dimensions go in",
    duration: 6,
    summary: "The input dimension n is a budget: three independent directions travel into the map.",
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
    id: "predict-degrade",
    title: "Predict: degrade the map",
    duration: 5.5,
    summary: "Only one direction will survive the next map. Decide what the ledger must do before a token moves.",
  },
  {
    id: "degrade",
    title: "Spend the budget differently",
    duration: 6.5,
    summary: "A token moves ACROSS the ledger. The split changes; the total cannot.",
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
 * matrices; the second beat REPLAYS that deformation over the eigenbasis (with
 * both eigendirections drawn), so "identical motion, different description" is
 * watched rather than asserted over a still frame.
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
    id: "predict-readout",
    title: "Predict: what does p read now?",
    duration: 5.5,
    summary: "Both basis arrows are lit and p has not moved. Count along them before the new readout appears.",
  },
  {
    id: "new-readout",
    title: "A different name for the same point",
    duration: 6,
    summary: "The walk is drawn: one step along b₁, one along b₂, landing on p — so the same point reads (1, 1).",
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
    duration: 8,
    summary: "The identical deformation is replayed over the eigenbasis — same motion, and in this basis the matrix is diagonal.",
  },
];

/**
 * Lesson 6 — "Matrix Composition & Inverses". The scene asks one question seven
 * times: *where does the basis land?* Apply B, then A; show that a single matrix
 * does both; read the product's columns off the two basis paths; predict and
 * then check whether the order matters; undo; and finally meet a map with
 * nothing to undo.
 *
 * Object-persistence rule (see the lesson plan): the two basis arrows and the
 * shared craft are created once and only ever MOVED or re-coloured — never
 * removed and re-added — so their identity survives scrubbing and reduced
 * motion. Reuses A = [[2,1],[0,1]] (`shear-2-1`, the L2/L7 map) and
 * R = [[0,−1],[1,0]] (`rotation`), with `singular-collapse` for the final beat.
 */
export const MATRIX_COMPOSITION_SEGMENTS: readonly SceneSegment[] = [
  {
    id: "apply-b",
    title: "Apply the first map",
    duration: 5.5,
    summary: "R rotates a quarter turn; e₁ and e₂ land on R's columns.",
  },
  {
    id: "apply-a",
    title: "Then apply the second",
    duration: 6.5,
    summary: "A acts on the R-image, so each basis arrow moves a second time and traces a two-stage path.",
  },
  {
    id: "one-map",
    title: "One matrix does both",
    duration: 6.5,
    summary: "Clear the plane back to the identity, then apply the single matrix AR: it lands in exactly the same place.",
  },
  {
    id: "columns",
    title: "Column j is where eⱼ ended up",
    duration: 7,
    summary: "Follow one arrow at a time: its endpoint IS that column of AR, so the product has no separate rule.",
  },
  {
    id: "predict-order",
    title: "Predict: does the order matter?",
    duration: 6,
    summary: "Shear first, then rotate. Decide whether the craft lands in the same place before the other order is built.",
  },
  {
    id: "order",
    title: "Swap the order",
    duration: 6.5,
    summary: "RA lands somewhere else entirely, with AR kept beside it as a dashed comparison.",
  },
  {
    id: "undo",
    title: "Undo it",
    duration: 8,
    summary: "Clear the plane, apply A, then apply A⁻¹: every basis arrow returns exactly to where it started.",
  },
  {
    id: "no-undo",
    title: "When there is nothing to undo",
    duration: 7,
    summary: "A singular map merges two distinct points into one, so no inverse function could choose between them.",
  },
];

export const SPIKE_SEGMENTS: readonly SceneSegment[] = [
  { id: "identity", title: "Identity grid", duration: 0.4 },
  { id: "transform", title: "Apply the matrix", duration: 2 },
  { id: "result", title: "Transformed space", duration: 0.6 },
];

/**
 * Lesson 3 — determinants as signed area scaling.
 *
 * Timing/pedagogy notes (2026-07 audit): the area/determinant headline used to
 * be a one-shot snapshot set before and after each morph, so it lagged the
 * geometry through `collapse` and `negative` — exactly where the number matters.
 * It is now a live function of the matrix signals. A prediction sits between
 * "the factor reached zero" and "past zero the orientation flips", which is the
 * one genuinely counterintuitive event in the scene.
 */
export const DETERMINANT_SEGMENTS: readonly SceneSegment[] = [
  {
    id: "identity",
    title: "Unit square area 1",
    duration: 3,
    summary: "One region to track, and its area starts at exactly 1.",
  },
  {
    id: "basis",
    title: "Columns land",
    duration: 3.5,
    summary: "Lesson 2's rule again: the columns of A are where e₁ and e₂ land.",
  },
  {
    id: "parallelogram",
    title: "Same square, new shape",
    duration: 3.5,
    summary: "The unit square itself became this parallelogram — the dashed ghost shows what it was.",
  },
  {
    id: "area",
    title: "Name the area factor",
    duration: 4,
    summary: "Feel the area factor first, then name it: that number is the determinant of A.",
  },
  {
    id: "expand",
    title: "Area multiplies in stages",
    duration: 5.5,
    summary: "An announced digression to a diagonal map: each stretch multiplies the area again.",
  },
  {
    id: "collapse",
    title: "Factor → 0 collapse",
    duration: 4.5,
    summary: "Drive the factor to zero and the parallelogram flattens onto a line — the readout falls with it.",
  },
  {
    id: "predict-negative",
    title: "Predict: past zero",
    duration: 5.5,
    summary: "The determinant is about to keep falling below zero. Decide what a negative area factor can mean before it is shown.",
  },
  {
    id: "negative",
    title: "Past zero: flip",
    duration: 5,
    summary: "The orientation arc sweeps the other way: a negative determinant is a reflected, not a smaller, plane.",
  },
  {
    id: "sign",
    title: "Magnitude vs sign",
    duration: 3.5,
    summary: "Magnitude says how much area scales; the sign says which handedness survives.",
  },
  {
    id: "summary",
    title: "Signed area scaling",
    duration: 3,
    summary: "Determinant = the signed area scale of the transformation.",
  },
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
 *
 * The two eigendirections are drawn as a CO-EQUAL pair (basis1 / basis2), the
 * same grammar the invariant-directions scene uses, so a learner meeting both
 * scenes in one lesson is not told that a colour changed meaning.
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
    id: "predict-collapse",
    title: "Predict: what must A − λI do?",
    duration: 5.5,
    summary: "A nonzero v is sent to zero. Recall Lesson 3 and decide what that forces about the shifted matrix's area scale.",
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
    id: "solveV3",
    title: "Solve (A − 3I)v = 0",
    duration: 10,
    summary:
      "Substitute the first root back. A − 3I is written out, and a probe travels the line it kills while its image stays pinned to the origin — that line is the eigenspace.",
  },
  {
    id: "solveV2",
    title: "Solve (A − 2I)v = 0",
    duration: 10,
    summary:
      "The same substitution for the second root gives a different shifted matrix and a different killed line — off the axes, so eigenvectors are not always axes.",
  },
  {
    id: "interpret",
    title: "Interpret geometrically",
    duration: 6,
    summary: "Each eigenspace is an invariant line; λ is the stretch factor along it.",
  },
];

/**
 * Karatsuba Watch scene — elementary place-value breakthrough.
 * No polynomial/`deeper` beat: that material stays in depth layers / explorer.
 *
 * Timing/pedagogy notes (2026-07 audit): `subtract`'s prediction gave 1.2s of
 * think time and `exponent`'s promised leaf-row pulse was an `opacity(1 → 1)`
 * no-op, so the scene's climax was caption-only. Both beats are now budgeted for
 * what they claim, and the middle-term merge in `share` is an actual travel.
 */
export const KARATSUBA_SEGMENTS: readonly SceneSegment[] = [
  {
    id: "setup",
    title: "Two numbers, one rectangle",
    duration: 4,
    summary: "12 × 13 drawn as a rectangle, so a product is an area rather than a procedure.",
  },
  {
    id: "foil",
    title: "Four pieces (FOIL)",
    duration: 5,
    summary: "The place-value split cuts the rectangle into four subrectangles: AC, AD, BC, BD.",
  },
  {
    id: "weights",
    title: "Place-value weights",
    duration: 5.5,
    summary: "Each piece carries its own power of ten — and two of them carry the same one.",
  },
  {
    id: "share",
    title: "The middle collapses",
    duration: 6.5,
    summary: "The two ×10 labels travel together and merge: only the SUM AD + BC is ever needed.",
  },
  {
    id: "aux-rect",
    title: "A different rectangle",
    duration: 5.5,
    summary: "A separate, cheaper rectangle (A+B)(C+D) whose area contains all four pieces.",
  },
  {
    id: "subtract",
    title: "Peel off the corners",
    duration: 8,
    summary: "Predict what is left once AC and BD are removed — then the two corner tiles slide out and the middle remains.",
  },
  {
    id: "reassemble",
    title: "Rebuild the answer",
    duration: 5.5,
    summary: "Three products, weighted by place value, rebuild the full product.",
  },
  {
    id: "carry-vs-width",
    title: "Two kinds of too big",
    duration: 8,
    summary: "Carry chips travel between place columns — output carrying is not the same problem as an operand growing wider.",
  },
  {
    id: "branch",
    title: "Four calls or three?",
    duration: 7,
    summary: "Two conceptual recurrence trees side by side: branching factor four against branching factor three.",
  },
  {
    id: "exponent",
    title: "The exponent bends",
    duration: 8,
    summary: "The leaf rows are counted out on screen: n² against n^log₂3 — the exponent changed, not a constant.",
  },
];

/**
 * Binary Search Trees — the bridge made visible. Binary search runs on a sorted
 * array, its probes are circled, a second search shows the first probe being
 * recomputed, and then the probed cells are LIFTED straight down into tree
 * positions (a pure vertical move, so the drawing cannot imply a computation).
 * The ordering rule is then read OFF the picture rather than asserted, and the
 * scene closes on the two extremes: median-first vs sorted insertion.
 *
 * `degenerate` now inserts the keys ONE AT A TIME, because its caption says each
 * key walks to the far right in turn — the group move it used to run contradicted
 * the sentence describing it.
 */
export const BST_LIFT_SEGMENTS: readonly SceneSegment[] = [
  {
    id: "establish",
    title: "A sorted array, and a key to find",
    duration: 4,
    summary: "Seven keys in sorted order, and one key to search for.",
  },
  {
    id: "probe-first",
    title: "One comparison, half the array gone",
    duration: 5,
    summary: "The midpoint comparison discards half the array in a single step.",
  },
  {
    id: "probe-rest",
    title: "Two more probes finish it",
    duration: 5,
    summary: "Three probes in total settle the search — that sequence is the whole algorithm.",
  },
  {
    id: "second-search",
    title: "A different key repeats the first probe",
    duration: 5,
    summary: "A different target asks the same first question, recomputed from scratch — the waste a tree removes.",
  },
  {
    id: "lift",
    title: "Keep the probes: they were a tree",
    duration: 6,
    summary: "The probed cells rise straight up into tree positions: a purely vertical move, so nothing is rearranged.",
  },
  {
    id: "read-the-rule",
    title: "The rule was not assumed",
    duration: 5,
    summary: "The ordering condition is read off the earned picture instead of being stated first.",
  },
  {
    id: "interval-stays",
    title: "Every position inherits a range",
    duration: 5,
    summary: "Each position inherits a floor and a ceiling from the turns taken to reach it.",
  },
  {
    id: "cost-is-depth",
    title: "One comparison per level",
    duration: 5,
    summary: "A search costs one comparison per level, so cost is depth.",
  },
  {
    id: "degenerate",
    title: "Insert in order — and get a stick",
    duration: 8,
    summary: "Inserting in increasing order sends each key in turn to the far right, one at a time, building a chain.",
  },
  {
    id: "predict-gap",
    title: "Predict: what does the chain cost?",
    duration: 5.5,
    summary: "Same keys, same rule, same sorted order left to right. Work out the worst-case comparisons for this shape.",
  },
  {
    id: "the-gap",
    title: "Same keys. Three comparisons, or seven",
    duration: 5.5,
    summary: "Only the insertion order changed, and the cost more than doubled — which is why balance is the next question.",
  },
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

/* ==========================================================================
 * Registries
 * ======================================================================== */

/** Every registered scene id → its ordered segments. */
export const SCENE_SEGMENTS: Record<string, readonly SceneSegment[]> = {
  "why-linear-algebra": CHAPTER0_SEGMENTS,
  "vectors-linear-combinations": LINEAR_COMBINATION_SEGMENTS,
  "matrix-transformations": MATRIX_TRANSFORMATION_SEGMENTS,
  "columns-rule-graphic": COLUMNS_RULE_GRAPHIC_SEGMENTS,
  "linear-systems": SYSTEMS_SEGMENTS,
  elimination: ELIMINATION_SEGMENTS,
  "solution-sets": SOLUTION_SETS_SEGMENTS,
  "matrix-composition": MATRIX_COMPOSITION_SEGMENTS,
  "determinant-area-scaling": DETERMINANT_SEGMENTS,
  "subspaces-rank": SUBSPACES_RANK_SEGMENTS,
  "rank-nullity": RANK_NULLITY_SEGMENTS,
  "change-of-basis": CHANGE_OF_BASIS_SEGMENTS,
  "eigenvectors-invariant-directions": EIGENVECTOR_SEGMENTS,
  "eigenvectors-derivation": EIGEN_DERIVATION_SEGMENTS,
  "karatsuba-cross-terms": KARATSUBA_SEGMENTS,
  "bst-lift-from-array": BST_LIFT_SEGMENTS,
  "red-black-encoding": RED_BLACK_SEGMENTS,
  "transform-spike": SPIKE_SEGMENTS,
};

/**
 * Explicit per-beat animation budgets each scene consumes INSIDE each segment.
 *
 * Every animated yield in a scene body reads its duration from here (parallel
 * animations in one beat share a single entry — the beat's wall-clock length),
 * and each scene wraps every segment body in `runSegment`, which measures real
 * elapsed time and PADS the remainder up to the segment's declared `duration`.
 *
 * Because these budgets are pure, Motion-Canvas-free data, `sceneTimings.test.ts`
 * asserts that every segment body fits its segment — so `runSegment` can only
 * ever pad, never truncate, and the padded timeline equals the metadata total.
 * That is the automatic gate: adding choreography without adding time to the
 * segment fails a unit test instead of silently desynchronizing every chapter
 * marker after it.
 *
 * SCOPE (do not overstate it): these are DECLARED budgets, not a measurement of
 * the rendered timeline — the scenes only execute in a browser. `runSegment`
 * additionally records real overruns at runtime (see `sceneKit.SEGMENT_OVERRUNS`),
 * and the Playwright specs fail on the console error it emits.
 */
export const SCENE_BEATS: Record<string, SceneBeats> = {
  "why-linear-algebra": {
    establish: { originUp: 0.4, originDown: 0.4, hold: 2.9 },
    reveal: { basisIn: 0.5, vertexIn: 0.5, hold: 2.7 },
    scale: { reset: 1.0, deform: 2.2, hold: 1.5 },
    rotation: { reset: 1.0, deform: 2.2, hold: 1.5 },
    reflection: { reset: 1.0, deform: 2.2, hold: 1.5 },
    shear: { reset: 1.0, deform: 2.2, hold: 1.5 },
    projection: { reset: 1.0, deform: 2.0, pulseUp: 0.25, pulseDown: 0.25, hold: 1.2 },
    "predict-translation": { reset: 0.9, ask: 0.4, think: 3.9 },
    translation: {
      slide: 1.6,
      hold: 0.6,
      originUp: 0.35,
      originDown: 0.35,
      hold2: 2.0,
      retire: 0.5,
    },
    mystery: { deform: 1.2, gridUp: 0.4, emphUp: 0.5, emphDown: 0.5, hold: 2.1 },
  },

  "columns-rule-graphic": {
    vertex: { establish: 0.5, vertexIn: 0.4, guidesIn: 0.5, recipeIn: 0.4, hold: 3.6 },
    decompose: { focus: 0.5, firstLeg: 1.4, secondLegIn: 0.3, secondLeg: 1.4, landUp: 0.3, landDown: 0.3, hold: 2.7 },
    predict: { basisIn: 0.5, think: 4.9 },
    image: { contextIn: 0.5, transform: 3.4, landUp: 0.35, landDown: 0.35, hold: 2.8 },
    "all-vertices": { focus: 0.5, walksIn: 0.6, settle: 0.4, hold: 4.4 },
  },

  "matrix-transformations": {
    identity: { establish: 0.8, ghostsIn: 0.5, hold: 2.1 },
    col1: { focus: 0.4, columnUp: 0.35, columnMove: 1.3, readoutIn: 0.35, columnDown: 0.3, hold: 1.7 },
    col2: { focus: 0.4, columnUp: 0.35, columnMove: 1.3, readoutIn: 0.35, columnDown: 0.3, hold: 1.7 },
    sample: { focus: 0.4, draw: 1.0, componentsIn: 0.4, hold: 2.6 },
    "predict-sample": { evidenceIn: 0.5, think: 4.9 },
    "transform-sample": { readoutsOut: 0.3, ghostIn: 0.4, carry: 2.6, landUp: 0.35, landDown: 0.35, hold: 2.4 },
    grid: { gridIn: 0.8, ghostLineIn: 0.4, imageIn: 0.2, trace: 1.1, hold: 2.9 },
    compare: { ghostsIn: 0.6, hold: 2.3 },
    presets: { retire: 0.3, tour: 12.6 },
    summary: { restore: 1.2, hold: 2.2 },
  },

  "eigenvectors-invariant-directions": {
    fan: { hold: 3.4 },
    apply: { ghostsIn: 0.4, deform: 2.6, hold: 2.4 },
    highlight: { focus: 0.4, linesIn: 0.45, arm: 0.4, reveal: 1.0, hold: 2.65 },
    equation: { leadIn: 1.4, name: 0.1, hold: 2.4 },
    stretch: { clear: 0.4, linesOut: 0.27, linesIn: 0.45, arm: 0.4, reveal: 1.5, hold: 1.88 },
    "predict-reverse": { clear: 0.35, arm: 0.4, think: 4.65 },
    reverse: { reveal: 1.8, hold: 2.6 },
    collapse: { clear: 0.3, linesIn: 0.45, arm: 0.4, reveal: 1.7, hold: 1.55 },
    scalar: { clear: 0.3, establish: 0.5, deform: 1.9, linesIn: 0.45, hold: 2.25 },
    defective: { linesOut: 0.35, reset: 0.9, deform: 1.9, linesIn: 0.45, focus: 0.4, hold: 1.4 },
    rotation: { clear: 0.4, reset: 0.9, deform: 2.1, hold: 2 },
    summary: { reset: 0.8, deform: 1.6, focus: 0.45, hold: 1.55 },
  },

  "red-black-encoding": {
    establish: { hold: 3.9 },
    "encode-2node": { ringIn: 0.5, hold: 3.9 },
    "encode-3node": { reposition: 0.6, childIn: 0.5, colourIn: 0.5, hold: 3.8 },
    "encode-4node": { reposition: 0.5, childIn: 0.5, colourIn: 0.5, hold: 3.4 },
    "read-off-r2": { hold: 4.9 },
    "read-off-r3": { labelIn: 0.5, hold: 4.4 },
    overflow: { arrival: 0.6, settle: 1.3, think: 3.0 },
    "split-is-recolour": { split: 0.9, settle: 0.6, insert: 0.7, relationIn: 0.4, hold: 3.8 },
    "invariant-held": { labelIn: 0.5, hold: 4.4 },
    "violation-moves-up": { markerIn: 0.5, hold: 4.4 },
    "root-split": { recolour: 0.6, hold: 4.8 },
  },

  "vectors-linear-combinations": {
    plane: { settle: 0.6, hold: 1.5 },
    "vector-v": { grow: 1.4, hold: 1.3 },
    components: { compH: 0.6, compV: 0.6, hold: 1.2, retire: 0.5 },
    "vector-w": { grow: 1.4, hold: 1.3 },
    addition: { slide: 1.4, sum: 1.0, pulseUp: 0.3, pulseDown: 0.3, hold: 1.8, retire: 0.5 },
    scaling: { isolate: 0.5, a2: 1.0, aHalf: 1.0, aNeg: 1.0, hold: 1.5, restore: 0.6 },
    combination: { focus: 0.35, b1: 0.6, move1: 0.9, move2: 0.9, move3: 0.9, hold: 1.0 },
    "span-plane": { reset: 0.6, fill: 0.35, hold: 1.0, name: 1.4 },
    dependent: { clear: 0.6, collapse: 1.4, focus: 0.35, hold: 2.0 },
    "dependent-inside": {
      setup: 0.6,
      focus: 0.35,
      grow: 0.5,
      hold: 0.6,
      move1: 0.9,
      move2: 0.9,
      hold2: 1.4,
      retire: 0.4,
    },
    basis: { restore: 1.2, focus: 0.35, hold: 2.2 },
    "read-standard": { pIn: 1.2, hold: 1.2, swap: 0.9, hold2: 1.6 },
    "predict-coordinates": { basisEmphasis: 0.6, ask: 0.4, think: 4.2 },
    coordinates: { walk1: 0.9, walk2: 0.9, reveal: 0.4, hold: 1.4 },
  },

  "linear-systems": {
    equations: { textReveal: 0.5, hold: 3.2 },
    row: { lines: 0.6, hold: 1.0, dotIn: 0.4, pulseUp: 0.3, pulseDown: 0.3, hold2: 3.0 },
    regroup: { fade: 0.6, show: 0.35, tag: 0.2, hold: 3.3 },
    "predict-column": { ask: 0.4, think: 4.4 },
    column: {
      arm: 0.4,
      cx: 1.6,
      arm2: 0.3,
      cy: 1.6,
      pulseUp: 0.25,
      pulseDown: 0.25,
      hold: 2.0,
    },
    unique: { clear: 0.3, show: 0.35, tag: 0.2, hold: 2.9 },
    infinite: { show: 0.35, tag: 0.2, morph: 1.2, pulseUp: 0.3, pulseDown: 0.3, hold: 3.4 },
    none: {
      toColumn: 0.4,
      tag: 0.2,
      hold: 1.0,
      slideB: 1.6,
      hold2: 0.9,
      toRow: 0.4,
      tag2: 0.2,
      hold3: 2.1,
    },
    summary: { restore: 1.2, hold: 2.5 },
  },

  elimination: {
    setup: { panels: 0.5, lines: 0.5, dotIn: 0.4, dotPulseUp: 0.4, dotPulseDown: 0.3 },
    predict: { anchor: 0.4, ask: 0.4, think: 4.2 },
    // operation: pulse the fixed point, reveal the scaled −2·R1 term, then slide
    // it into R2 while the row (and its line) interpolate to the result.
    operation: {
      anchorUp: 0.3,
      anchorDown: 0.3,
      ghostReveal: 0.6,
      combine: 2.6,
      landUp: 0.3,
      landDown: 0.3,
    },
    triangular: { lineUp: 0.3, lineDown: 0.3, dotUp: 0.35, dotDown: 0.35 },
    invariance: { dim: 0.4, grow: 0.35, shrink: 0.35, restore: 0.4 },
    summary: { settleUp: 0.2, settleDown: 0.2 },
  },

  "solution-sets": {
    "two-solutions": { d1: 0.5, d2: 0.5, up: 0.3, down: 0.3, hold: 2.0 },
    difference: {
      draw: 0.7,
      hold: 0.8,
      slide: 1.6,
      label: 0.5,
      up: 0.35,
      down: 0.35,
      hold2: 2.0,
    },
    "predict-generate": { ask: 0.4, think: 4.4 },
    generate: { arrow: 0.8, dot: 0.5, up: 0.3, down: 0.3, hold: 2.5 },
    "null-line": { draw: 0.8, up: 0.35, down: 0.35, hold: 2.5 },
    translate: { offset: 0.7, line: 0.8, up: 0.35, down: 0.35, hold: 2.8 },
    parameterize: {
      panel: 0.6,
      hold: 1.0,
      forward: 1.9,
      hold2: 1.2,
      back: 2.2,
      hold3: 1.0,
    },
    "case-empty": { emphasisUp: 0.3, emphasisDown: 0.3, hold: 3.0 },
    "case-point": { up: 0.25, down: 0.25, hold: 3.0 },
    "case-line": { up: 0.25, down: 0.25, hold: 3.5 },
  },

  "matrix-composition": {
    "apply-b": { hold: 0.8, morph: 2.4, hold2: 1.5 },
    "apply-a": { hold: 0.6, morph: 2.6, paths: 0.7, hold2: 1.5 },
    // `fadeOut`/`resetHold`/`fadeIn` are the staged reset (see `stagedReset` in
    // sceneKit): the plane returns to the identity while nothing is drawn, so
    // starting a new trial neither teleports the craft nor claims a third map.
    "one-map": {
      fadeOut: 0.35,
      resetHold: 0.3,
      fadeIn: 0.4,
      hold: 0.5,
      morph: 2.6,
      hold2: 2.0,
    },
    columns: {
      hold: 0.5,
      hold2: 1.4,
      focus: 0.4,
      end2: 0.5,
      hold3: 0.8,
      unfocus: 0.3,
      hold4: 1.5,
    },
    "predict-order": {
      fadeOut: 0.35,
      resetHold: 0.3,
      fadeIn: 0.4,
      ask: 0.6,
      think: 4.2,
    },
    order: { hold: 1.0, morph: 2.6, hold2: 2.5 },
    undo: {
      fadeOut: 0.35,
      resetHold: 0.3,
      fadeIn: 0.4,
      hold: 0.5,
      toA: 1.6,
      hold2: 1.2,
      undo: 2.4,
      hold3: 0.8,
    },
    "no-undo": { hold: 1.4, morph: 2.2, up: 0.35, down: 0.35, hold2: 1.6 },
  },

  "determinant-area-scaling": {
    identity: { in: 0.7, hold: 2.0 },
    basis: { focus: 0.35, morph: 1.6, hold: 1.3 },
    parallelogram: { ghost: 0.5, hold: 2.7 },
    area: { focus: 0.35, hold: 1.4, hold2: 2.0 },
    expand: { focus: 0.35, reset: 0.6, x: 1.2, hold: 0.9, y: 1.2, hold2: 1.0 },
    collapse: { focus: 0.35, morph: 2.0, hold: 2.0 },
    "predict-negative": { focus: 0.35, ask: 0.4, think: 4.4 },
    negative: { morph: 2.0, up: 0.35, down: 0.35, hold: 2.0 },
    sign: { focus: 0.4, hold: 2.8 },
    summary: { morph: 1.2, hold: 1.5 },
  },

  "subspaces-rank": {
    "two-panels": { hold: 1.2, in: 0.6, hold2: 1.5 },
    reach: { copy: 0.6, hold: 0.8, deform: 2.6, hold2: 2.4 },
    columns: {
      c1: 0.7,
      line: 0.5,
      hold: 1.4,
      c2: 0.7,
      plane: 0.9,
      hold2: 1.8,
      c3: 0.8,
      hold3: 1.4,
      pulseUp: 0.35,
      pulseDown: 0.35,
      hold4: 1.6,
    },
    colspace: { plane: 0.5, hold: 1.6, hold2: 1.4 },
    crush: { hold: 1.2, travel: 2.6, up: 0.4, down: 0.4, hold2: 1.8 },
    nullspace: { hold: 1.6, hold2: 1.6 },
    count: { hold: 1.8, hold2: 1.6 },
    "predict-rank-one": { ask: 0.4, think: 4.4 },
    "rank-one": { reset: 0.8, deform: 2.6, hold: 1.8, grow: 0.8, hold2: 1.4 },
  },

  "rank-nullity": {
    budget: { count: 1.8, hold: 3.4 },
    post: { p0: 0.7, p1: 0.7, p2: 0.7, hold: 2.5 },
    balance: { frames: 0.4, hold: 2.8 },
    "predict-degrade": { ask: 0.4, think: 4.4 },
    degrade: { hold: 1.2, move: 0.7, hold2: 3.0 },
    ceiling: { hold: 2.2, hold2: 2.6 },
    forbidden: { up: 0.4, down: 0.4, hold: 1.4, hold2: 2.4 },
  },

  "change-of-basis": {
    "one-arrow": { readoutReveal: 0.6, hold: 1.6 },
    "swap-grid": { grid: 1.0, hold: 1.4 },
    "predict-readout": { basisEmphasis: 0.6, ask: 0.4, think: 4.2 },
    "new-readout": { walk1: 0.9, walk2: 0.9, readout: 0.4, hold: 1.6, hold2: 1.6 },
    "hidden-subscript": { hold: 2.0, hold2: 1.6 },
    "map-standard": { morph: 2.2, hold: 1.4 },
    "map-eigenbasis": { reset: 0.6, hold: 0.8, replay: 2.2, hold2: 1.2, hold3: 1.6 },
  },

  "eigenvectors-derivation": {
    recap: { in: 0.6, hold: 3.2 },
    shift: {
      intro: 0.8,
      grow: 1.0,
      flashUp: 0.22,
      flashDown: 0.22,
      sub: 0.3,
      walk: 1.0,
      factor: 0.7,
      originDown: 0.25,
      hold: 0.7,
    },
    "predict-collapse": { ask: 0.4, think: 4.4 },
    charpoly: { clear: 0.5, morph: 1.6, off: 0.8, back: 1.0, hold: 1.4 },
    solveLambda: { morph: 1.2, hold: 3.0 },
    // Each root is substituted back and SOLVED: the shifted matrix is written
    // out, the plane is carried to it, and a probe travels the line it kills
    // while its image — through that same live matrix — stays on the origin.
    solveV3: {
      shift: 1.3,
      reveal: 0.6,
      hold: 1.3,
      probeIn: 0.4,
      travel: 2.6,
      up: 0.35,
      down: 0.35,
      hold2: 2.6,
    },
    solveV2: {
      shift: 1.3,
      reveal: 0.6,
      hold: 1.3,
      probeIn: 0.4,
      travel: 2.6,
      up: 0.35,
      down: 0.35,
      hold2: 2.6,
    },
    interpret: {
      restore: 1.2,
      emphasisUp: 0.5,
      emphasisDown: 0.5,
      hold: 3.6,
    },
  },

  "karatsuba-cross-terms": {
    setup: { hold: 3.7 },
    foil: { in: 0.6, hold: 4.1 },
    weights: { leadIn: 0.4, labelWrite: 0.4, hold: 4.4 },
    share: {
      caption: 0.4,
      focus: 0.5,
      up: 0.25,
      down: 0.25,
      merge: 1.2,
      combine: 0.4,
      hold: 3.0,
    },
    "aux-rect": { in: 0.6, hold: 4.6 },
    subtract: { ask: 0.4, think: 4.2, peel: 1.4, reveal: 0.4, hold: 1.4 },
    reassemble: { caption: 0.4, hold: 4.8 },
    "carry-vs-width": {
      clear: 0.5,
      show: 0.5,
      hold: 0.7,
      chip0: 0.3,
      travel0: 0.7,
      caption0: 0.4,
      hold0: 0.5,
      chip1: 0.3,
      travel1: 0.7,
      caption1: 0.4,
      hold1: 0.5,
      retire: 0.2,
      caption2: 0.4,
      hold2: 1.6,
    },
    branch: { in: 0.6, leaves: 0.5, hold: 5.6 },
    exponent: { caption: 0.4, leafPulse: 1.6, countUp: 1.2, hold: 4.4 },
  },

  "bst-lift-from-array": {
    establish: { hold: 3.7 },
    "probe-first": { ring: 0.4, dim: 0.8, hold: 3.0 },
    "probe-rest": { ring1: 0.3, gap1: 0.5, ring2: 0.3, gap2: 0.5, hold: 3.0 },
    "second-search": { reset: 0.5, hold: 0.6, ring: 0.35, hold2: 3.0 },
    lift: { clear: 0.3, lift: 1.4, edges: 0.6, hold: 3.0 },
    "read-the-rule": { ruleReveal: 0.5, hold: 4.0 },
    "interval-stays": { swap: 0.4, label: 0.5, hold: 3.6 },
    "cost-is-depth": { clear: 0.3, walk: 1.95, label: 0.4, hold: 2.0 },
    degenerate: { clear: 0.4, insert: 4.4, hold: 3.0 },
    "predict-gap": { ask: 0.4, think: 4.4 },
    "the-gap": { costReveal: 0.5, hold: 4.4 },
  },

  "transform-spike": {
    identity: { hold: 0.3 },
    transform: { morph: 1.8 },
    result: { hold: 0.45 },
  },
};

/**
 * Scenes that run on `runSegment` but do NOT declare beat budgets here.
 *
 * These four shipped from earlier passes of the July 2026 audit with their beat
 * durations inline and their totals verified against frame-exact MP4 exports.
 * They are covered by the RUNTIME gate (`sceneKit.runSegment` records and
 * reports any body that outgrows its segment), so re-plumbing them through this
 * registry would be churn on scenes with no known timing defect.
 *
 * The list is exhaustive and is asserted as such: any scene id that is neither
 * here nor in {@link SCENE_BEATS} fails `sceneTimings.test.ts`, so a NEW scene
 * cannot quietly skip the budget gate.
 */
export const SCENES_WITHOUT_DECLARED_BEATS: readonly string[] = [];

/** Total animated time a segment body consumes (sum of its beat budgets). */
export function sumBeats(beats: SegmentBeats | undefined): number {
  if (!beats) return 0;
  return Object.values(beats).reduce((sum, d) => sum + d, 0);
}

/**
 * The declared beat budget for one segment body, or a hard failure naming what
 * is missing. Scene bodies call this so a beat can never be spent without being
 * declared (and therefore checked against the segment duration).
 */
export function requireBeats(sceneId: string, segmentId: string): SegmentBeats {
  const beats = SCENE_BEATS[sceneId]?.[segmentId];
  if (!beats) {
    throw new Error(
      `No declared beat budget for "${sceneId}" segment "${segmentId}". ` +
        `Add one to SCENE_BEATS in sceneTimings.ts.`,
    );
  }
  return beats;
}

/**
 * @deprecated Prefer `requireBeats("elimination", id)`. Kept because the
 * elimination scene and its regression test both name this budget directly.
 */
export const ELIMINATION_BEATS: SceneBeats = SCENE_BEATS.elimination!;

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
