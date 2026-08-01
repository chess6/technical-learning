/**
 * The curriculum edge graph — ADR-005's second data layer.
 *
 * Six edge types, each required by ADR-005 to have a named consumer that
 * changes learner-visible behavior (see
 * `docs/engineering/decisions/005-curriculum-graph-as-data.md`). Deferred
 * types (`generalizes-to`, `special-case-of`, etc.) are listed there, not
 * here — adding one requires a new ADR, not just extending this union.
 *
 * `from`/`to` are plain strings because an edge endpoint may be a concept id
 * (`src/curriculum/concepts.ts`) or a lesson id (`src/curriculum/lessonRoster.ts`,
 * `src/lessons/registry.ts`) depending on what the edge naturally relates.
 * Which namespace each `EdgeType` uses on each side is NOT ad hoc — it is
 * declared exactly once in `EDGE_NAMESPACE` below, and
 * `src/curriculum/__tests__/graph.test.ts` asserts every edge's endpoints
 * resolve in THAT namespace specifically (not "either namespace"), so a
 * `requires` edge naming a concept id, or a `revisited-by` edge whose `from`
 * isn't a concept, fails loudly instead of silently passing a looser check.
 *
 * Sources:
 * - `docs/courses/linear-algebra/curriculum-architecture.md` §2.1 (25 hard
 *   prerequisite edges), §3 (Reuses column → `revisited-by`)
 * - `docs/courses/applied-mathematics/curriculum-architecture.md` §2.1 (9
 *   cross-course edges), §2.2 (64 within-course edges), §3 (Reused-by column
 *   → `revisited-by`)
 * - LA course-spine.md §4 "Application threads" and the AM "Growth and decay"
 *   thread (→ `application-of`, five new application-domain concepts)
 */

export type EdgeType =
  | "requires"
  | "recommended-before"
  | "refresher-for"
  | "revisited-by"
  | "same-structure-as"
  | "application-of";

export type CurriculumEdge = {
  from: string;
  to: string;
  type: EdgeType;
  note?: string;
};

export type EdgeNamespace = "concept" | "lesson";

/**
 * The id space each `EdgeType` connects, on each side. `requires` /
 * `recommended-before` / `refresher-for` / `same-structure-as` are all
 * lesson-sequencing relationships (course-spine positions); `application-of`
 * and `revisited-by` are concept-anchored. A new edge whose endpoints don't
 * fit this table is a sign the edge belongs to a DIFFERENT type, not that
 * this table should widen to "either."
 */
export const EDGE_NAMESPACE: Record<EdgeType, { from: EdgeNamespace; to: EdgeNamespace }> = {
  requires: { from: "lesson", to: "lesson" },
  "recommended-before": { from: "lesson", to: "lesson" },
  "refresher-for": { from: "lesson", to: "lesson" },
  "same-structure-as": { from: "lesson", to: "lesson" },
  "application-of": { from: "concept", to: "concept" },
  "revisited-by": { from: "concept", to: "lesson" },
};

/* --------------------------------------------------------------------------
 * requires — hard, gating, must stay acyclic.
 * ------------------------------------------------------------------------ */

const LA_REQUIRES: readonly CurriculumEdge[] = [
  { from: "why-linear-algebra", to: "vectors", type: "requires", note: "Motivates \"four numbers move space\"; vectors are the first object." },
  { from: "vectors", to: "transformations", type: "requires", note: "Columns rule is derived from unique standard-basis coordinates." },
  { from: "transformations", to: "systems", type: "requires", note: "Column picture of Ax=b reuses \"columns are images of the basis.\"" },
  { from: "vectors", to: "systems", type: "requires", note: "Row/column pictures reuse span, dependence, unique coordinates." },
  { from: "systems", to: "elimination", type: "requires", note: "Elimination rewrites a system while preserving its solution set." },
  { from: "elimination", to: "solution-sets", type: "requires", note: "You must reduce before reading off free variables / null directions." },
  { from: "transformations", to: "matrix-composition", type: "requires", note: "\"Apply B then A\" composes two transformations." },
  { from: "systems", to: "matrix-composition", type: "requires", note: "Inverses are motivated as \"solve Ax=b by undoing A.\"" },
  { from: "matrix-composition", to: "determinants", type: "requires", note: "Invertibility should be wanted before the determinant detects it." },
  { from: "systems", to: "determinants", type: "requires", note: "Determinant zero = the non-unique/collapse case met in systems." },
  { from: "matrix-composition", to: "subspaces-rank", type: "requires", note: "Column/null space formalize composition & solvability." },
  { from: "systems", to: "subspaces-rank", type: "requires", note: "Column space = reachable b; null space = non-uniqueness." },
  { from: "subspaces-rank", to: "rank-nullity", type: "requires", note: "Conservation law counts the rank/nullity just named." },
  { from: "vectors", to: "change-of-basis", type: "requires", note: "Pays off \"coordinates are a choice, not the vector.\"" },
  { from: "transformations", to: "change-of-basis", type: "requires", note: "A map's matrix is re-expressed in a new basis." },
  { from: "transformations", to: "eigenvectors", type: "requires", note: "Eigen-directions are directions the map only scales." },
  { from: "determinants", to: "eigenvectors", type: "requires", note: "det(A - λI) = 0 reuses \"det = 0 is collapse.\"" },
  { from: "change-of-basis", to: "eigenvectors", type: "requires", note: "Diagonalization = the basis where the matrix is diagonal." },
  { from: "vectors", to: "orthogonality", type: "requires", note: "Dot product / projection act on vectors." },
  { from: "systems", to: "least-squares", type: "requires", note: "Least squares is the inconsistent-Ax=b rescue." },
  { from: "subspaces-rank", to: "least-squares", type: "requires", note: "Project b onto the column space." },
  { from: "orthogonality", to: "least-squares", type: "requires", note: "Projection is the engine of the normal equations." },
  { from: "transformations", to: "svd", type: "requires", note: "SVD = rotate -> scale -> rotate (composition of maps)." },
  { from: "subspaces-rank", to: "svd", type: "requires", note: "Singular values count rank; reunifies structure." },
  { from: "orthogonality", to: "svd", type: "requires", note: "U and V are orthonormal; geometry of the factorization." },
];

const AM_CROSS_COURSE_REQUIRES: readonly CurriculumEdge[] = [
  { from: "vectors", to: "inner-products-projection", type: "requires", note: "Dot product, span, coordinates generalized, not introduced." },
  { from: "vectors", to: "complex-rotation", type: "requires", note: "The complex plane is R^2 with a multiplication." },
  { from: "transformations", to: "complex-rotation", type: "requires", note: "Multiplication by a+bi is a 2x2 map fixed by where the basis lands." },
  { from: "transformations", to: "partial-derivatives-gradient", type: "requires", note: "The Jacobian is the matrix of a linear map, read by the columns rule." },
  { from: "matrix-composition", to: "chain-rule", type: "requires", note: "Composing local linear models is composing matrices." },
  { from: "determinants", to: "change-of-variables-jacobian", type: "requires", note: "The Jacobian determinant is the same area/volume scale factor." },
  { from: "eigenvectors", to: "second-order-odes", type: "requires", note: "e^{st} is an eigenfunction of d/dt; the characteristic polynomial is the same object." },
];

const AM_WITHIN_COURSE_REQUIRES: readonly CurriculumEdge[] = [
  { from: "limits-continuity", to: "derivative-local-linearity", type: "requires", note: "The derivative is a limit." },
  { from: "limits-continuity", to: "integral-accumulation", type: "requires", note: "The integral is a limit of sums." },
  { from: "derivative-local-linearity", to: "fundamental-theorem", type: "requires", note: "The theorem is about the derivative; its proof uses the local model." },
  { from: "integral-accumulation", to: "fundamental-theorem", type: "requires", note: "The theorem is about the accumulation." },
  { from: "derivative-local-linearity", to: "chain-rule", type: "requires", note: "Composing the local linear models." },
  { from: "derivative-local-linearity", to: "optimization-approximation", type: "requires", note: "\"Flat local model\" is the criterion." },
  { from: "chain-rule", to: "substitution-parts", type: "requires", note: "Substitution is the chain rule backwards." },
  { from: "fundamental-theorem", to: "substitution-parts", type: "requires", note: "Techniques evaluate definite integrals via antiderivatives." },
  { from: "limits-continuity", to: "improper-integrals", type: "requires", note: "An improper integral is a limit of proper ones." },
  { from: "fundamental-theorem", to: "improper-integrals", type: "requires", note: "Each finite piece is evaluated by the FTC." },
  { from: "radians-rotation", to: "substitution-parts", type: "requires", note: "Trigonometric antiderivatives and substitutions." },
  { from: "limits-continuity", to: "sequences-limits", type: "requires", note: "The same tolerance guarantee, with \"far enough along\" for the window." },
  { from: "sequences-limits", to: "series-convergence", type: "requires", note: "A series is the limit of its sequence of partial sums." },
  { from: "improper-integrals", to: "series-convergence", type: "requires", note: "The integral test, and the p-series comparison." },
  { from: "series-convergence", to: "power-taylor-series", type: "requires", note: "A power series converges or does not, on a radius." },
  { from: "optimization-approximation", to: "power-taylor-series", type: "requires", note: "Linearization is the first two terms." },
  { from: "radians-rotation", to: "complex-rotation", type: "requires", note: "Rotation is measured in radians." },
  { from: "complex-rotation", to: "eulers-formula", type: "requires", note: "i as a quarter turn is the premise." },
  { from: "derivative-local-linearity", to: "eulers-formula", type: "requires", note: "The derivation asks what function's derivative is i times itself." },
  { from: "eulers-formula", to: "waves-phasors", type: "requires", note: "The phasor is Ae^{iφ}e^{iωt}." },
  { from: "integral-accumulation", to: "inner-products-projection", type: "requires", note: "The function inner product is an integral of a product." },
  { from: "inner-products-projection", to: "orthogonal-families", type: "requires", note: "Orthogonality is defined by the inner product." },
  { from: "waves-phasors", to: "orthogonal-families", type: "requires", note: "The family in question is the sinusoids." },
  { from: "orthogonal-families", to: "fourier-series", type: "requires", note: "Coefficients separate because the family is orthogonal." },
  { from: "series-convergence", to: "fourier-series", type: "requires", note: "\"An infinite sum of sinusoids\" needs a meaning." },
  { from: "fourier-series", to: "fourier-transform", type: "requires", note: "The transform is the period-to-infinity limit." },
  { from: "improper-integrals", to: "fourier-transform", type: "requires", note: "The transform integral is improper." },
  { from: "fourier-transform", to: "convolution-filtering", type: "requires", note: "The convolution theorem is a statement about transforms." },
  { from: "convolution-filtering", to: "sampling-aliasing", type: "requires", note: "Sampling is multiplication by a comb; spectra convolve." },
  { from: "sampling-aliasing", to: "dft-fft", type: "requires", note: "The DFT is the transform of a sampled, finite record." },
  { from: "derivative-local-linearity", to: "first-order-odes", type: "requires", note: "An ODE is a statement about a derivative." },
  { from: "substitution-parts", to: "first-order-odes", type: "requires", note: "Separation of variables integrates both sides." },
  { from: "first-order-odes", to: "second-order-odes", type: "requires", note: "The same \"guess an exponential\" move, one order up." },
  { from: "eulers-formula", to: "second-order-odes", type: "requires", note: "Complex roots give oscillation." },
  { from: "improper-integrals", to: "laplace-transform", type: "requires", note: "The Laplace integral is improper." },
  { from: "substitution-parts", to: "laplace-transform", type: "requires", note: "The derivative rule is integration by parts, and its boundary term carries the initial conditions." },
  { from: "second-order-odes", to: "laplace-transform", type: "requires", note: "The problems Laplace is for." },
  { from: "laplace-transform", to: "inverse-laplace", type: "requires", note: "You must transform before you invert." },
  { from: "inverse-laplace", to: "transfer-impulse-response", type: "requires", note: "The impulse response is an inverse transform." },
  { from: "transfer-impulse-response", to: "circuits-control-stability", type: "requires", note: "Poles live in the transfer function." },
  { from: "derivative-local-linearity", to: "partial-derivatives-gradient", type: "requires", note: "A partial derivative is a derivative." },
  { from: "chain-rule", to: "partial-derivatives-gradient", type: "requires", note: "The multivariable chain rule composes the local models." },
  { from: "integral-accumulation", to: "multiple-integrals", type: "requires", note: "Same accumulation, iterated." },
  { from: "partial-derivatives-gradient", to: "change-of-variables-jacobian", type: "requires", note: "The Jacobian is built from partials." },
  { from: "multiple-integrals", to: "change-of-variables-jacobian", type: "requires", note: "The factor multiplies an iterated integral." },
  { from: "partial-derivatives-gradient", to: "vector-fields-line-integrals", type: "requires", note: "The gradient is the first vector field met." },
  { from: "chain-rule", to: "vector-fields-line-integrals", type: "requires", note: "Parameterize the path and differentiate the composition." },
  { from: "vector-fields-line-integrals", to: "circulation-flux", type: "requires", note: "Both are line integrals with different integrands." },
  { from: "circulation-flux", to: "divergence-curl", type: "requires", note: "Local versions of the global quantities." },
  { from: "divergence-curl", to: "greens-theorem", type: "requires", note: "The theorem relates the local density to the boundary total." },
  { from: "multiple-integrals", to: "greens-theorem", type: "requires", note: "The left side is a double integral." },
  { from: "fundamental-theorem", to: "greens-theorem", type: "requires", note: "Theme 1: the same cancellation argument, re-run." },
  { from: "change-of-variables-jacobian", to: "surface-integrals", type: "requires", note: "The area element is the coordinate-change factor on a surface." },
  { from: "greens-theorem", to: "stokes-theorem", type: "requires", note: "Stokes is Green lifted off the plane." },
  { from: "surface-integrals", to: "stokes-theorem", type: "requires", note: "The curl is integrated over a surface." },
  { from: "surface-integrals", to: "divergence-theorem", type: "requires", note: "The flux is a surface integral." },
  { from: "divergence-curl", to: "divergence-theorem", type: "requires", note: "The local density is the divergence." },
  { from: "fundamental-theorem", to: "divergence-theorem", type: "requires", note: "Theme 1: the same cancellation argument again, now with shared interior faces." },
];

/* --------------------------------------------------------------------------
 * refresher-for — a bounded bridge, not a whole course.
 * ------------------------------------------------------------------------ */

const REFRESHER_FOR: readonly CurriculumEdge[] = [
  { from: "functions-graphs-bridge", to: "limits-continuity", type: "refresher-for", note: "A limit is about a function's values near a point — the one AM lesson marked \"conditional\" rather than hard." },
];

/* --------------------------------------------------------------------------
 * same-structure-as — synthesis, advisory, exempt from acyclicity.
 * ------------------------------------------------------------------------ */

const SAME_STRUCTURE_AS: readonly CurriculumEdge[] = [
  { from: "eigenvectors", to: "convolution-filtering", type: "same-structure-as", note: "Complex sinusoids are the eigenfunctions of LTI systems." },
  { from: "karatsuba", to: "dft-fft", type: "same-structure-as", note: "The FFT is the same \"do the shared sub-work once\" move." },
  { from: "power-taylor-series", to: "eulers-formula", type: "same-structure-as", note: "The alternative series derivation, given once the series exist." },
  { from: "series-convergence", to: "laplace-transform", type: "same-structure-as", note: "The region of convergence is the same kind of object as a radius of convergence." },
  { from: "fourier-transform", to: "laplace-transform", type: "same-structure-as", note: "Both are Theme-2 operator simplifications — but Laplace is not an orthogonal projection, so this is a comparison, not a dependency." },
  { from: "stokes-theorem", to: "divergence-theorem", type: "same-structure-as", note: "The third costume of one statement." },
];

/* --------------------------------------------------------------------------
 * recommended-before — soft ordering benefit, not a hard gate.
 * ------------------------------------------------------------------------ */

const RECOMMENDED_BEFORE: readonly CurriculumEdge[] = [
  { from: "convolution-filtering", to: "transfer-impulse-response", type: "recommended-before", note: "The time-domain half; available if the Fourier branch was taken first." },
];

/* --------------------------------------------------------------------------
 * application-of — relevance, advisory. Five application-domain concepts
 * sourced from the LA course-spine's "Application threads" table (Data
 * thread, Dynamics thread) and the AM spine's "Growth and decay" thread.
 * ------------------------------------------------------------------------ */

const APPLICATION_OF: readonly CurriculumEdge[] = [
  { from: "least-squares", to: "regression", type: "application-of", note: "Best fit by minimizing squared error is regression." },
  { from: "singular-value-decomposition", to: "principal-component-analysis", type: "application-of", note: "The directions of greatest variance are the top singular directions." },
  { from: "singular-value-decomposition", to: "image-compression", type: "application-of", note: "Keeping only the largest singular values approximates a matrix cheaply." },
  { from: "diagonalization", to: "dynamical-systems", type: "application-of", note: "Long-run behavior of a repeated linear map is read off the eigenbasis." },
  { from: "eigenvector", to: "dynamical-systems", type: "application-of", note: "Eigen-directions are the modes a repeated map preserves." },
  { from: "differential-equation", to: "exponential-growth-decay", type: "application-of", note: "y' = ky is the growth/decay equation, solved by separation." },
];

/* --------------------------------------------------------------------------
 * revisited-by — callback, derived directly from each concept catalog's own
 * Reuses / Reused-by column. Concept -> lesson that fires it again.
 *
 * `vector`'s LA catalog row reads "L2, L3, L12, L13, all" — the trailing
 * "all" is not a single lesson id and cannot become one edge without
 * inventing an "every lesson" node, so it is intentionally dropped here
 * rather than silently rounded to a nearby lesson.
 * ------------------------------------------------------------------------ */

const REVISITED_BY: readonly CurriculumEdge[] = [
  // --- Linear Algebra (from curriculum-architecture.md §3 Reuses column) ---
  { from: "vector", to: "transformations", type: "revisited-by" },
  { from: "vector", to: "systems", type: "revisited-by" },
  { from: "vector", to: "orthogonality", type: "revisited-by" },
  { from: "vector", to: "least-squares", type: "revisited-by" },
  { from: "linear-combination", to: "transformations", type: "revisited-by" },
  { from: "linear-combination", to: "systems", type: "revisited-by" },
  { from: "linear-combination", to: "subspaces-rank", type: "revisited-by" },
  { from: "linear-combination", to: "orthogonality", type: "revisited-by" },
  { from: "span", to: "systems", type: "revisited-by" },
  { from: "span", to: "subspaces-rank", type: "revisited-by" },
  { from: "span", to: "least-squares", type: "revisited-by" },
  { from: "linear-independence", to: "systems", type: "revisited-by" },
  { from: "linear-independence", to: "subspaces-rank", type: "revisited-by" },
  { from: "linear-independence", to: "rank-nullity", type: "revisited-by" },
  { from: "basis", to: "transformations", type: "revisited-by" },
  { from: "basis", to: "change-of-basis", type: "revisited-by" },
  { from: "basis", to: "eigenvectors", type: "revisited-by" },
  { from: "basis", to: "orthogonality", type: "revisited-by" },
  { from: "coordinates", to: "transformations", type: "revisited-by" },
  { from: "coordinates", to: "change-of-basis", type: "revisited-by" },
  { from: "coordinates", to: "eigenvectors", type: "revisited-by" },
  { from: "linear-transformation", to: "systems", type: "revisited-by" },
  { from: "linear-transformation", to: "matrix-composition", type: "revisited-by" },
  { from: "linear-transformation", to: "determinants", type: "revisited-by" },
  { from: "linear-transformation", to: "change-of-basis", type: "revisited-by" },
  { from: "linear-transformation", to: "eigenvectors", type: "revisited-by" },
  { from: "linear-transformation", to: "svd", type: "revisited-by" },
  { from: "matrix-columns", to: "systems", type: "revisited-by" },
  { from: "matrix-columns", to: "matrix-composition", type: "revisited-by" },
  { from: "matrix-columns", to: "subspaces-rank", type: "revisited-by" },
  { from: "matrix-columns", to: "svd", type: "revisited-by" },
  { from: "linear-system", to: "elimination", type: "revisited-by" },
  { from: "linear-system", to: "solution-sets", type: "revisited-by" },
  { from: "linear-system", to: "matrix-composition", type: "revisited-by" },
  { from: "linear-system", to: "subspaces-rank", type: "revisited-by" },
  { from: "linear-system", to: "least-squares", type: "revisited-by" },
  { from: "row-picture", to: "elimination", type: "revisited-by" },
  { from: "row-picture", to: "solution-sets", type: "revisited-by" },
  { from: "column-picture", to: "matrix-composition", type: "revisited-by" },
  { from: "column-picture", to: "subspaces-rank", type: "revisited-by" },
  { from: "column-picture", to: "least-squares", type: "revisited-by" },
  { from: "consistency", to: "solution-sets", type: "revisited-by" },
  { from: "consistency", to: "subspaces-rank", type: "revisited-by" },
  { from: "consistency", to: "least-squares", type: "revisited-by" },
  { from: "elimination", to: "solution-sets", type: "revisited-by" },
  { from: "elimination", to: "matrix-composition", type: "revisited-by" },
  { from: "elimination", to: "subspaces-rank", type: "revisited-by" },
  { from: "echelon-form", to: "solution-sets", type: "revisited-by" },
  { from: "echelon-form", to: "subspaces-rank", type: "revisited-by" },
  { from: "pivot", to: "solution-sets", type: "revisited-by" },
  { from: "pivot", to: "subspaces-rank", type: "revisited-by" },
  { from: "pivot", to: "rank-nullity", type: "revisited-by" },
  { from: "free-variable", to: "solution-sets", type: "revisited-by" },
  { from: "free-variable", to: "subspaces-rank", type: "revisited-by" },
  { from: "free-variable", to: "rank-nullity", type: "revisited-by" },
  { from: "solution-set", to: "subspaces-rank", type: "revisited-by" },
  { from: "solution-set", to: "least-squares", type: "revisited-by" },
  { from: "homogeneous-system", to: "subspaces-rank", type: "revisited-by" },
  { from: "homogeneous-system", to: "rank-nullity", type: "revisited-by" },
  { from: "matrix-composition", to: "determinants", type: "revisited-by" },
  { from: "matrix-composition", to: "change-of-basis", type: "revisited-by" },
  { from: "matrix-composition", to: "eigenvectors", type: "revisited-by" },
  { from: "matrix-composition", to: "svd", type: "revisited-by" },
  { from: "invertibility", to: "determinants", type: "revisited-by" },
  { from: "invertibility", to: "subspaces-rank", type: "revisited-by" },
  { from: "invertibility", to: "rank-nullity", type: "revisited-by" },
  { from: "determinant", to: "eigenvectors", type: "revisited-by" },
  { from: "orientation", to: "svd", type: "revisited-by" },
  { from: "subspace", to: "rank-nullity", type: "revisited-by" },
  { from: "subspace", to: "change-of-basis", type: "revisited-by" },
  { from: "subspace", to: "orthogonality", type: "revisited-by" },
  { from: "subspace", to: "least-squares", type: "revisited-by" },
  { from: "column-space", to: "rank-nullity", type: "revisited-by" },
  { from: "column-space", to: "least-squares", type: "revisited-by" },
  { from: "column-space", to: "svd", type: "revisited-by" },
  { from: "null-space", to: "rank-nullity", type: "revisited-by" },
  { from: "rank", to: "rank-nullity", type: "revisited-by" },
  { from: "rank", to: "least-squares", type: "revisited-by" },
  { from: "rank", to: "svd", type: "revisited-by" },
  { from: "nullity", to: "svd", type: "revisited-by" },
  { from: "rank-nullity", to: "svd", type: "revisited-by" },
  { from: "dimension", to: "change-of-basis", type: "revisited-by" },
  { from: "dimension", to: "svd", type: "revisited-by" },
  { from: "change-of-basis", to: "eigenvectors", type: "revisited-by" },
  { from: "change-of-basis", to: "orthogonality", type: "revisited-by" },
  { from: "change-of-basis", to: "svd", type: "revisited-by" },
  { from: "eigenvector", to: "svd", type: "revisited-by" },
  { from: "eigenvalue", to: "svd", type: "revisited-by" },
  { from: "eigenspace", to: "svd", type: "revisited-by" },
  { from: "diagonalization", to: "svd", type: "revisited-by" },
  { from: "dot-product", to: "least-squares", type: "revisited-by" },
  { from: "dot-product", to: "svd", type: "revisited-by" },
  { from: "orthogonality", to: "least-squares", type: "revisited-by" },
  { from: "orthogonality", to: "svd", type: "revisited-by" },
  { from: "projection", to: "least-squares", type: "revisited-by" },
  { from: "projection", to: "svd", type: "revisited-by" },
  { from: "orthonormal-basis", to: "svd", type: "revisited-by" },
  { from: "least-squares", to: "svd", type: "revisited-by" },
  // --- Applied Mathematics (from curriculum-architecture.md §3 Reused-by column) ---
  { from: "limit", to: "derivative-local-linearity", type: "revisited-by" },
  { from: "limit", to: "integral-accumulation", type: "revisited-by" },
  { from: "limit", to: "improper-integrals", type: "revisited-by" },
  { from: "limit", to: "sequences-limits", type: "revisited-by" },
  { from: "continuity", to: "derivative-local-linearity", type: "revisited-by" },
  { from: "continuity", to: "integral-accumulation", type: "revisited-by" },
  { from: "continuity", to: "fundamental-theorem", type: "revisited-by" },
  { from: "modulus-of-continuity", to: "integral-accumulation", type: "revisited-by" },
  { from: "modulus-of-continuity", to: "fundamental-theorem", type: "revisited-by" },
  { from: "modulus-of-continuity", to: "multiple-integrals", type: "revisited-by" },
  { from: "local-linearity", to: "fundamental-theorem", type: "revisited-by" },
  { from: "local-linearity", to: "chain-rule", type: "revisited-by" },
  { from: "local-linearity", to: "optimization-approximation", type: "revisited-by" },
  { from: "local-linearity", to: "power-taylor-series", type: "revisited-by" },
  { from: "local-linearity", to: "partial-derivatives-gradient", type: "revisited-by" },
  { from: "derivative", to: "fundamental-theorem", type: "revisited-by" },
  { from: "derivative", to: "chain-rule", type: "revisited-by" },
  { from: "derivative", to: "optimization-approximation", type: "revisited-by" },
  { from: "derivative", to: "first-order-odes", type: "revisited-by" },
  { from: "derivative", to: "partial-derivatives-gradient", type: "revisited-by" },
  { from: "riemann-sum", to: "fundamental-theorem", type: "revisited-by" },
  { from: "riemann-sum", to: "improper-integrals", type: "revisited-by" },
  { from: "riemann-sum", to: "multiple-integrals", type: "revisited-by" },
  { from: "riemann-sum", to: "vector-fields-line-integrals", type: "revisited-by" },
  { from: "definite-integral", to: "fundamental-theorem", type: "revisited-by" },
  { from: "definite-integral", to: "substitution-parts", type: "revisited-by" },
  { from: "definite-integral", to: "improper-integrals", type: "revisited-by" },
  { from: "definite-integral", to: "inner-products-projection", type: "revisited-by" },
  { from: "definite-integral", to: "fourier-series", type: "revisited-by" },
  { from: "definite-integral", to: "fourier-transform", type: "revisited-by" },
  { from: "definite-integral", to: "laplace-transform", type: "revisited-by" },
  { from: "definite-integral", to: "multiple-integrals", type: "revisited-by" },
  { from: "definite-integral", to: "vector-fields-line-integrals", type: "revisited-by" },
  { from: "definite-integral", to: "surface-integrals", type: "revisited-by" },
  { from: "antiderivative", to: "substitution-parts", type: "revisited-by" },
  { from: "antiderivative", to: "improper-integrals", type: "revisited-by" },
  { from: "antiderivative", to: "first-order-odes", type: "revisited-by" },
  { from: "ftc", to: "substitution-parts", type: "revisited-by" },
  { from: "ftc", to: "improper-integrals", type: "revisited-by" },
  { from: "ftc", to: "laplace-transform", type: "revisited-by" },
  { from: "ftc", to: "greens-theorem", type: "revisited-by" },
  { from: "ftc", to: "stokes-theorem", type: "revisited-by" },
  { from: "ftc", to: "divergence-theorem", type: "revisited-by" },
  { from: "improper-integral", to: "series-convergence", type: "revisited-by" },
  { from: "improper-integral", to: "fourier-transform", type: "revisited-by" },
  { from: "improper-integral", to: "laplace-transform", type: "revisited-by" },
  { from: "sequence-limit", to: "series-convergence", type: "revisited-by" },
  { from: "sequence-limit", to: "fourier-series", type: "revisited-by" },
  { from: "series-convergence", to: "power-taylor-series", type: "revisited-by" },
  { from: "series-convergence", to: "fourier-series", type: "revisited-by" },
  { from: "series-convergence", to: "laplace-transform", type: "revisited-by" },
  { from: "radius-of-convergence", to: "eulers-formula", type: "revisited-by" },
  { from: "radius-of-convergence", to: "laplace-transform", type: "revisited-by" },
  { from: "complex-multiplication", to: "eulers-formula", type: "revisited-by" },
  { from: "complex-multiplication", to: "waves-phasors", type: "revisited-by" },
  { from: "complex-multiplication", to: "fourier-transform", type: "revisited-by" },
  { from: "complex-multiplication", to: "laplace-transform", type: "revisited-by" },
  { from: "complex-exponential", to: "waves-phasors", type: "revisited-by" },
  { from: "complex-exponential", to: "orthogonal-families", type: "revisited-by" },
  { from: "complex-exponential", to: "fourier-series", type: "revisited-by" },
  { from: "complex-exponential", to: "fourier-transform", type: "revisited-by" },
  { from: "complex-exponential", to: "convolution-filtering", type: "revisited-by" },
  { from: "complex-exponential", to: "sampling-aliasing", type: "revisited-by" },
  { from: "complex-exponential", to: "dft-fft", type: "revisited-by" },
  { from: "complex-exponential", to: "second-order-odes", type: "revisited-by" },
  { from: "complex-exponential", to: "laplace-transform", type: "revisited-by" },
  { from: "complex-exponential", to: "transfer-impulse-response", type: "revisited-by" },
  { from: "phasor", to: "orthogonal-families", type: "revisited-by" },
  { from: "phasor", to: "fourier-series", type: "revisited-by" },
  { from: "phasor", to: "fourier-transform", type: "revisited-by" },
  { from: "phasor", to: "convolution-filtering", type: "revisited-by" },
  { from: "phasor", to: "sampling-aliasing", type: "revisited-by" },
  { from: "phasor", to: "dft-fft", type: "revisited-by" },
  { from: "phasor", to: "transfer-impulse-response", type: "revisited-by" },
  { from: "phasor", to: "circuits-control-stability", type: "revisited-by" },
  { from: "inner-product", to: "orthogonal-families", type: "revisited-by" },
  { from: "inner-product", to: "fourier-series", type: "revisited-by" },
  { from: "inner-product", to: "fourier-transform", type: "revisited-by" },
  { from: "orthogonal-projection", to: "orthogonal-families", type: "revisited-by" },
  { from: "orthogonal-projection", to: "fourier-series", type: "revisited-by" },
  { from: "orthogonal-family", to: "fourier-series", type: "revisited-by" },
  { from: "orthogonal-family", to: "fourier-transform", type: "revisited-by" },
  { from: "orthogonal-family", to: "dft-fft", type: "revisited-by" },
  { from: "fourier-coefficient", to: "fourier-transform", type: "revisited-by" },
  { from: "fourier-coefficient", to: "dft-fft", type: "revisited-by" },
  { from: "mean-square-convergence", to: "fourier-transform", type: "revisited-by" },
  { from: "mean-square-convergence", to: "sampling-aliasing", type: "revisited-by" },
  { from: "spectrum", to: "convolution-filtering", type: "revisited-by" },
  { from: "spectrum", to: "sampling-aliasing", type: "revisited-by" },
  { from: "spectrum", to: "dft-fft", type: "revisited-by" },
  { from: "spectrum", to: "laplace-transform", type: "revisited-by" },
  { from: "spectrum", to: "transfer-impulse-response", type: "revisited-by" },
  { from: "convolution", to: "sampling-aliasing", type: "revisited-by" },
  { from: "convolution", to: "dft-fft", type: "revisited-by" },
  { from: "convolution", to: "transfer-impulse-response", type: "revisited-by" },
  { from: "lti-system", to: "transfer-impulse-response", type: "revisited-by" },
  { from: "lti-system", to: "circuits-control-stability", type: "revisited-by" },
  { from: "sampling", to: "dft-fft", type: "revisited-by" },
  { from: "aliasing", to: "dft-fft", type: "revisited-by" },
  { from: "differential-equation", to: "second-order-odes", type: "revisited-by" },
  { from: "differential-equation", to: "laplace-transform", type: "revisited-by" },
  { from: "differential-equation", to: "inverse-laplace", type: "revisited-by" },
  { from: "differential-equation", to: "transfer-impulse-response", type: "revisited-by" },
  { from: "differential-equation", to: "circuits-control-stability", type: "revisited-by" },
  { from: "characteristic-equation", to: "laplace-transform", type: "revisited-by" },
  { from: "characteristic-equation", to: "circuits-control-stability", type: "revisited-by" },
  { from: "laplace-transform", to: "inverse-laplace", type: "revisited-by" },
  { from: "laplace-transform", to: "transfer-impulse-response", type: "revisited-by" },
  { from: "laplace-transform", to: "circuits-control-stability", type: "revisited-by" },
  { from: "region-of-convergence", to: "inverse-laplace", type: "revisited-by" },
  { from: "region-of-convergence", to: "circuits-control-stability", type: "revisited-by" },
  { from: "transfer-function", to: "circuits-control-stability", type: "revisited-by" },
  { from: "impulse-response", to: "circuits-control-stability", type: "revisited-by" },
  { from: "partial-derivative", to: "multiple-integrals", type: "revisited-by" },
  { from: "partial-derivative", to: "change-of-variables-jacobian", type: "revisited-by" },
  { from: "partial-derivative", to: "vector-fields-line-integrals", type: "revisited-by" },
  { from: "partial-derivative", to: "circulation-flux", type: "revisited-by" },
  { from: "partial-derivative", to: "divergence-curl", type: "revisited-by" },
  { from: "gradient", to: "vector-fields-line-integrals", type: "revisited-by" },
  { from: "gradient", to: "divergence-curl", type: "revisited-by" },
  { from: "jacobian", to: "surface-integrals", type: "revisited-by" },
  { from: "vector-field", to: "circulation-flux", type: "revisited-by" },
  { from: "vector-field", to: "divergence-curl", type: "revisited-by" },
  { from: "vector-field", to: "greens-theorem", type: "revisited-by" },
  { from: "vector-field", to: "surface-integrals", type: "revisited-by" },
  { from: "vector-field", to: "stokes-theorem", type: "revisited-by" },
  { from: "vector-field", to: "divergence-theorem", type: "revisited-by" },
  { from: "line-integral", to: "circulation-flux", type: "revisited-by" },
  { from: "line-integral", to: "greens-theorem", type: "revisited-by" },
  { from: "line-integral", to: "stokes-theorem", type: "revisited-by" },
  { from: "circulation", to: "divergence-curl", type: "revisited-by" },
  { from: "circulation", to: "greens-theorem", type: "revisited-by" },
  { from: "circulation", to: "stokes-theorem", type: "revisited-by" },
  { from: "flux", to: "divergence-curl", type: "revisited-by" },
  { from: "flux", to: "divergence-theorem", type: "revisited-by" },
  { from: "curl", to: "greens-theorem", type: "revisited-by" },
  { from: "curl", to: "stokes-theorem", type: "revisited-by" },
  { from: "divergence", to: "divergence-theorem", type: "revisited-by" },
  { from: "surface-integral", to: "stokes-theorem", type: "revisited-by" },
  { from: "surface-integral", to: "divergence-theorem", type: "revisited-by" },
];

export const CURRICULUM_EDGES: readonly CurriculumEdge[] = [
  ...LA_REQUIRES,
  ...AM_CROSS_COURSE_REQUIRES,
  ...AM_WITHIN_COURSE_REQUIRES,
  ...REFRESHER_FOR,
  ...SAME_STRUCTURE_AS,
  ...RECOMMENDED_BEFORE,
  ...APPLICATION_OF,
  ...REVISITED_BY,
];

export function edgesOfType(type: EdgeType): readonly CurriculumEdge[] {
  return CURRICULUM_EDGES.filter((edge) => edge.type === type);
}

export function edgesFrom(id: string, type?: EdgeType): readonly CurriculumEdge[] {
  return CURRICULUM_EDGES.filter(
    (edge) => edge.from === id && (type === undefined || edge.type === type),
  );
}

export function edgesTo(id: string, type?: EdgeType): readonly CurriculumEdge[] {
  return CURRICULUM_EDGES.filter(
    (edge) => edge.to === id && (type === undefined || edge.type === type),
  );
}
