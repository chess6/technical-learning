/**
 * The curriculum edge graph — ADR-005's second data layer.
 *
 * Six edge types, each required by ADR-005 to have a named consumer that
 * changes learner-visible behavior (see
 * `docs/engineering/decisions/005-curriculum-graph-as-data.md`). Deferred
 * types (`generalizes-to`, `special-case-of`, etc.) are listed there, not
 * here — adding one requires a new ADR, not just extending this union.
 *
 * An edge endpoint may live in the concept space (`src/curriculum/concepts.ts`)
 * or the lesson space (`src/curriculum/lessonRoster.ts`, `src/lessons/registry.ts`)
 * depending on what the edge relates, and **eight ids name BOTH** —
 * `elimination`, `matrix-composition`, `rank-nullity`, `change-of-basis`,
 * `orthogonality`, `least-squares`, `series-convergence`, `laplace-transform`.
 * A bare string endpoint therefore cannot say which is meant, and a
 * resolution check over bare strings cannot verify it: about 15% of endpoints
 * resolve in either space, so a wrong-space id among those eight would pass
 * silently. (That was the state before this refactor, and it was real: one
 * `application-of` edge shipped with a lesson id where it needed a concept.)
 *
 * Endpoints are therefore `NodeRef`s that carry their space explicitly, and
 * `CurriculumEdge` is a union discriminated on `type`. This closes the gap at
 * BOTH layers:
 *
 * - **Compile time** — the union pins each edge type's endpoint spaces, so
 *   `{ type: "requires", from: concept("elimination"), ... }` is a `tsc`
 *   error. The ambiguity cannot be authored in the first place.
 * - **Run time** — `kind` survives into the data, so
 *   `src/curriculum/__tests__/graph.test.ts` resolves each endpoint against
 *   the catalog its own `kind` names, and a collision id is no longer
 *   ambiguous to the checker.
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

import { asConceptId, asLessonId, type ConceptId, type LessonId } from "../platform/identity";

export type EdgeType =
  | "requires"
  | "recommended-before"
  | "refresher-for"
  | "revisited-by"
  | "same-structure-as"
  | "application-of";

export type ConceptRef = { kind: "concept"; id: ConceptId };
export type LessonRef = { kind: "lesson"; id: LessonId };
export type NodeRef = ConceptRef | LessonRef;

/** Tag an id as living in the concept space. Validates slug syntax as it goes. */
export function concept(id: string): ConceptRef {
  return { kind: "concept", id: asConceptId(id) };
}

/** Tag an id as living in the lesson space. Validates slug syntax as it goes. */
export function lesson(id: string): LessonRef {
  return { kind: "lesson", id: asLessonId(id) };
}

/** True when two refs name the same node in the same space. */
export function sameNode(a: NodeRef, b: NodeRef): boolean {
  return a.kind === b.kind && a.id === b.id;
}

/**
 * Edges, discriminated on `type` so each type pins the id space of each
 * endpoint. `requires` / `recommended-before` / `refresher-for` /
 * `same-structure-as` sequence LESSONS; `application-of` relates CONCEPTS;
 * `revisited-by` runs from a CONCEPT to the LESSON that fires it again.
 *
 * An edge whose endpoints don't fit its type is a sign it belongs to a
 * different type — not that a type should widen to accept either space.
 */
export type CurriculumEdge =
  | { type: "requires"; from: LessonRef; to: LessonRef; note?: string }
  | { type: "recommended-before"; from: LessonRef; to: LessonRef; note?: string }
  | { type: "refresher-for"; from: LessonRef; to: LessonRef; note?: string }
  | { type: "same-structure-as"; from: LessonRef; to: LessonRef; note?: string }
  | { type: "application-of"; from: ConceptRef; to: ConceptRef; note?: string }
  | { type: "revisited-by"; from: ConceptRef; to: LessonRef; note?: string };

/* --------------------------------------------------------------------------
 * requires — hard, gating, must stay acyclic.
 * ------------------------------------------------------------------------ */

const LA_REQUIRES: readonly CurriculumEdge[] = [
  { from: lesson("why-linear-algebra"), to: lesson("vectors"), type: "requires", note: "Motivates \"four numbers move space\"; vectors are the first object." },
  { from: lesson("vectors"), to: lesson("transformations"), type: "requires", note: "Columns rule is derived from unique standard-basis coordinates." },
  { from: lesson("transformations"), to: lesson("systems"), type: "requires", note: "Column picture of Ax=b reuses \"columns are images of the basis.\"" },
  { from: lesson("vectors"), to: lesson("systems"), type: "requires", note: "Row/column pictures reuse span, dependence, unique coordinates." },
  { from: lesson("systems"), to: lesson("elimination"), type: "requires", note: "Elimination rewrites a system while preserving its solution set." },
  { from: lesson("elimination"), to: lesson("solution-sets"), type: "requires", note: "You must reduce before reading off free variables / null directions." },
  { from: lesson("transformations"), to: lesson("matrix-composition"), type: "requires", note: "\"Apply B then A\" composes two transformations." },
  { from: lesson("systems"), to: lesson("matrix-composition"), type: "requires", note: "Inverses are motivated as \"solve Ax=b by undoing A.\"" },
  { from: lesson("matrix-composition"), to: lesson("determinants"), type: "requires", note: "Invertibility should be wanted before the determinant detects it." },
  { from: lesson("systems"), to: lesson("determinants"), type: "requires", note: "Determinant zero = the non-unique/collapse case met in systems." },
  { from: lesson("matrix-composition"), to: lesson("subspaces-rank"), type: "requires", note: "Column/null space formalize composition & solvability." },
  { from: lesson("systems"), to: lesson("subspaces-rank"), type: "requires", note: "Column space = reachable b; null space = non-uniqueness." },
  { from: lesson("subspaces-rank"), to: lesson("rank-nullity"), type: "requires", note: "Conservation law counts the rank/nullity just named." },
  { from: lesson("vectors"), to: lesson("change-of-basis"), type: "requires", note: "Pays off \"coordinates are a choice, not the vector.\"" },
  { from: lesson("transformations"), to: lesson("change-of-basis"), type: "requires", note: "A map's matrix is re-expressed in a new basis." },
  { from: lesson("transformations"), to: lesson("eigenvectors"), type: "requires", note: "Eigen-directions are directions the map only scales." },
  { from: lesson("determinants"), to: lesson("eigenvectors"), type: "requires", note: "det(A - λI) = 0 reuses \"det = 0 is collapse.\"" },
  { from: lesson("change-of-basis"), to: lesson("eigenvectors"), type: "requires", note: "Diagonalization = the basis where the matrix is diagonal." },
  { from: lesson("vectors"), to: lesson("orthogonality"), type: "requires", note: "Dot product / projection act on vectors." },
  { from: lesson("systems"), to: lesson("least-squares"), type: "requires", note: "Least squares is the inconsistent-Ax=b rescue." },
  { from: lesson("subspaces-rank"), to: lesson("least-squares"), type: "requires", note: "Project b onto the column space." },
  { from: lesson("orthogonality"), to: lesson("least-squares"), type: "requires", note: "Projection is the engine of the normal equations." },
  { from: lesson("transformations"), to: lesson("svd"), type: "requires", note: "SVD = rotate -> scale -> rotate (composition of maps)." },
  { from: lesson("subspaces-rank"), to: lesson("svd"), type: "requires", note: "Singular values count rank; reunifies structure." },
  { from: lesson("orthogonality"), to: lesson("svd"), type: "requires", note: "U and V are orthonormal; geometry of the factorization." },
];

const AM_CROSS_COURSE_REQUIRES: readonly CurriculumEdge[] = [
  { from: lesson("vectors"), to: lesson("inner-products-projection"), type: "requires", note: "Dot product, span, coordinates generalized, not introduced." },
  { from: lesson("vectors"), to: lesson("complex-rotation"), type: "requires", note: "The complex plane is R^2 with a multiplication." },
  { from: lesson("transformations"), to: lesson("complex-rotation"), type: "requires", note: "Multiplication by a+bi is a 2x2 map fixed by where the basis lands." },
  { from: lesson("transformations"), to: lesson("partial-derivatives-gradient"), type: "requires", note: "The Jacobian is the matrix of a linear map, read by the columns rule." },
  { from: lesson("matrix-composition"), to: lesson("chain-rule"), type: "requires", note: "Composing local linear models is composing matrices." },
  { from: lesson("determinants"), to: lesson("change-of-variables-jacobian"), type: "requires", note: "The Jacobian determinant is the same area/volume scale factor." },
  { from: lesson("eigenvectors"), to: lesson("second-order-odes"), type: "requires", note: "e^{st} is an eigenfunction of d/dt; the characteristic polynomial is the same object." },
];

const AM_WITHIN_COURSE_REQUIRES: readonly CurriculumEdge[] = [
  { from: lesson("limits-continuity"), to: lesson("derivative-local-linearity"), type: "requires", note: "The derivative is a limit." },
  { from: lesson("limits-continuity"), to: lesson("integral-accumulation"), type: "requires", note: "The integral is a limit of sums." },
  { from: lesson("derivative-local-linearity"), to: lesson("fundamental-theorem"), type: "requires", note: "The theorem is about the derivative; its proof uses the local model." },
  { from: lesson("integral-accumulation"), to: lesson("fundamental-theorem"), type: "requires", note: "The theorem is about the accumulation." },
  { from: lesson("derivative-local-linearity"), to: lesson("chain-rule"), type: "requires", note: "Composing the local linear models." },
  { from: lesson("derivative-local-linearity"), to: lesson("optimization-approximation"), type: "requires", note: "\"Flat local model\" is the criterion." },
  { from: lesson("chain-rule"), to: lesson("substitution-parts"), type: "requires", note: "Substitution is the chain rule backwards." },
  { from: lesson("fundamental-theorem"), to: lesson("substitution-parts"), type: "requires", note: "Techniques evaluate definite integrals via antiderivatives." },
  { from: lesson("limits-continuity"), to: lesson("improper-integrals"), type: "requires", note: "An improper integral is a limit of proper ones." },
  { from: lesson("fundamental-theorem"), to: lesson("improper-integrals"), type: "requires", note: "Each finite piece is evaluated by the FTC." },
  { from: lesson("radians-rotation"), to: lesson("substitution-parts"), type: "requires", note: "Trigonometric antiderivatives and substitutions." },
  { from: lesson("limits-continuity"), to: lesson("sequences-limits"), type: "requires", note: "The same tolerance guarantee, with \"far enough along\" for the window." },
  { from: lesson("sequences-limits"), to: lesson("series-convergence"), type: "requires", note: "A series is the limit of its sequence of partial sums." },
  { from: lesson("improper-integrals"), to: lesson("series-convergence"), type: "requires", note: "The integral test, and the p-series comparison." },
  { from: lesson("series-convergence"), to: lesson("power-taylor-series"), type: "requires", note: "A power series converges or does not, on a radius." },
  { from: lesson("optimization-approximation"), to: lesson("power-taylor-series"), type: "requires", note: "Linearization is the first two terms." },
  { from: lesson("radians-rotation"), to: lesson("complex-rotation"), type: "requires", note: "Rotation is measured in radians." },
  { from: lesson("complex-rotation"), to: lesson("eulers-formula"), type: "requires", note: "i as a quarter turn is the premise." },
  { from: lesson("derivative-local-linearity"), to: lesson("eulers-formula"), type: "requires", note: "The derivation asks what function's derivative is i times itself." },
  { from: lesson("eulers-formula"), to: lesson("waves-phasors"), type: "requires", note: "The phasor is Ae^{iφ}e^{iωt}." },
  { from: lesson("integral-accumulation"), to: lesson("inner-products-projection"), type: "requires", note: "The function inner product is an integral of a product." },
  { from: lesson("inner-products-projection"), to: lesson("orthogonal-families"), type: "requires", note: "Orthogonality is defined by the inner product." },
  { from: lesson("waves-phasors"), to: lesson("orthogonal-families"), type: "requires", note: "The family in question is the sinusoids." },
  { from: lesson("orthogonal-families"), to: lesson("fourier-series"), type: "requires", note: "Coefficients separate because the family is orthogonal." },
  { from: lesson("series-convergence"), to: lesson("fourier-series"), type: "requires", note: "\"An infinite sum of sinusoids\" needs a meaning." },
  { from: lesson("fourier-series"), to: lesson("fourier-transform"), type: "requires", note: "The transform is the period-to-infinity limit." },
  { from: lesson("improper-integrals"), to: lesson("fourier-transform"), type: "requires", note: "The transform integral is improper." },
  { from: lesson("fourier-transform"), to: lesson("convolution-filtering"), type: "requires", note: "The convolution theorem is a statement about transforms." },
  { from: lesson("convolution-filtering"), to: lesson("sampling-aliasing"), type: "requires", note: "Sampling is multiplication by a comb; spectra convolve." },
  { from: lesson("sampling-aliasing"), to: lesson("dft-fft"), type: "requires", note: "The DFT is the transform of a sampled, finite record." },
  { from: lesson("derivative-local-linearity"), to: lesson("first-order-odes"), type: "requires", note: "An ODE is a statement about a derivative." },
  { from: lesson("substitution-parts"), to: lesson("first-order-odes"), type: "requires", note: "Separation of variables integrates both sides." },
  { from: lesson("first-order-odes"), to: lesson("second-order-odes"), type: "requires", note: "The same \"guess an exponential\" move, one order up." },
  { from: lesson("eulers-formula"), to: lesson("second-order-odes"), type: "requires", note: "Complex roots give oscillation." },
  { from: lesson("improper-integrals"), to: lesson("laplace-transform"), type: "requires", note: "The Laplace integral is improper." },
  { from: lesson("substitution-parts"), to: lesson("laplace-transform"), type: "requires", note: "The derivative rule is integration by parts, and its boundary term carries the initial conditions." },
  { from: lesson("second-order-odes"), to: lesson("laplace-transform"), type: "requires", note: "The problems Laplace is for." },
  { from: lesson("laplace-transform"), to: lesson("inverse-laplace"), type: "requires", note: "You must transform before you invert." },
  { from: lesson("inverse-laplace"), to: lesson("transfer-impulse-response"), type: "requires", note: "The impulse response is an inverse transform." },
  { from: lesson("transfer-impulse-response"), to: lesson("circuits-control-stability"), type: "requires", note: "Poles live in the transfer function." },
  { from: lesson("derivative-local-linearity"), to: lesson("partial-derivatives-gradient"), type: "requires", note: "A partial derivative is a derivative." },
  { from: lesson("chain-rule"), to: lesson("partial-derivatives-gradient"), type: "requires", note: "The multivariable chain rule composes the local models." },
  { from: lesson("integral-accumulation"), to: lesson("multiple-integrals"), type: "requires", note: "Same accumulation, iterated." },
  { from: lesson("partial-derivatives-gradient"), to: lesson("change-of-variables-jacobian"), type: "requires", note: "The Jacobian is built from partials." },
  { from: lesson("multiple-integrals"), to: lesson("change-of-variables-jacobian"), type: "requires", note: "The factor multiplies an iterated integral." },
  { from: lesson("partial-derivatives-gradient"), to: lesson("vector-fields-line-integrals"), type: "requires", note: "The gradient is the first vector field met." },
  { from: lesson("chain-rule"), to: lesson("vector-fields-line-integrals"), type: "requires", note: "Parameterize the path and differentiate the composition." },
  { from: lesson("vector-fields-line-integrals"), to: lesson("circulation-flux"), type: "requires", note: "Both are line integrals with different integrands." },
  { from: lesson("circulation-flux"), to: lesson("divergence-curl"), type: "requires", note: "Local versions of the global quantities." },
  { from: lesson("divergence-curl"), to: lesson("greens-theorem"), type: "requires", note: "The theorem relates the local density to the boundary total." },
  { from: lesson("multiple-integrals"), to: lesson("greens-theorem"), type: "requires", note: "The left side is a double integral." },
  { from: lesson("fundamental-theorem"), to: lesson("greens-theorem"), type: "requires", note: "Theme 1: the same cancellation argument, re-run." },
  { from: lesson("change-of-variables-jacobian"), to: lesson("surface-integrals"), type: "requires", note: "The area element is the coordinate-change factor on a surface." },
  { from: lesson("greens-theorem"), to: lesson("stokes-theorem"), type: "requires", note: "Stokes is Green lifted off the plane." },
  { from: lesson("surface-integrals"), to: lesson("stokes-theorem"), type: "requires", note: "The curl is integrated over a surface." },
  { from: lesson("surface-integrals"), to: lesson("divergence-theorem"), type: "requires", note: "The flux is a surface integral." },
  { from: lesson("divergence-curl"), to: lesson("divergence-theorem"), type: "requires", note: "The local density is the divergence." },
  { from: lesson("fundamental-theorem"), to: lesson("divergence-theorem"), type: "requires", note: "Theme 1: the same cancellation argument again, now with shared interior faces." },
];

/* --------------------------------------------------------------------------
 * refresher-for — a bounded bridge, not a whole course.
 * ------------------------------------------------------------------------ */

const REFRESHER_FOR: readonly CurriculumEdge[] = [
  { from: lesson("functions-graphs-bridge"), to: lesson("limits-continuity"), type: "refresher-for", note: "A limit is about a function's values near a point — the one AM lesson marked \"conditional\" rather than hard." },
];

/* --------------------------------------------------------------------------
 * same-structure-as — synthesis, advisory, exempt from acyclicity.
 * ------------------------------------------------------------------------ */

const SAME_STRUCTURE_AS: readonly CurriculumEdge[] = [
  { from: lesson("eigenvectors"), to: lesson("convolution-filtering"), type: "same-structure-as", note: "Complex sinusoids are the eigenfunctions of LTI systems." },
  { from: lesson("karatsuba"), to: lesson("dft-fft"), type: "same-structure-as", note: "The FFT is the same \"do the shared sub-work once\" move." },
  { from: lesson("power-taylor-series"), to: lesson("eulers-formula"), type: "same-structure-as", note: "The alternative series derivation, given once the series exist." },
  { from: lesson("series-convergence"), to: lesson("laplace-transform"), type: "same-structure-as", note: "The region of convergence is the same kind of object as a radius of convergence." },
  { from: lesson("fourier-transform"), to: lesson("laplace-transform"), type: "same-structure-as", note: "Both are Theme-2 operator simplifications — but Laplace is not an orthogonal projection, so this is a comparison, not a dependency." },
  { from: lesson("stokes-theorem"), to: lesson("divergence-theorem"), type: "same-structure-as", note: "The third costume of one statement." },
];

/* --------------------------------------------------------------------------
 * recommended-before — soft ordering benefit, not a hard gate.
 * ------------------------------------------------------------------------ */

const RECOMMENDED_BEFORE: readonly CurriculumEdge[] = [
  { from: lesson("convolution-filtering"), to: lesson("transfer-impulse-response"), type: "recommended-before", note: "The time-domain half; available if the Fourier branch was taken first." },
];

/* --------------------------------------------------------------------------
 * application-of — relevance, advisory. Five application-domain concepts
 * sourced from the LA course-spine's "Application threads" table (Data
 * thread, Dynamics thread) and the AM spine's "Growth and decay" thread.
 * ------------------------------------------------------------------------ */

const APPLICATION_OF: readonly CurriculumEdge[] = [
  { from: concept("least-squares"), to: concept("regression"), type: "application-of", note: "Best fit by minimizing squared error is regression." },
  { from: concept("singular-value-decomposition"), to: concept("principal-component-analysis"), type: "application-of", note: "The directions of greatest variance are the top singular directions." },
  { from: concept("singular-value-decomposition"), to: concept("image-compression"), type: "application-of", note: "Keeping only the largest singular values approximates a matrix cheaply." },
  { from: concept("diagonalization"), to: concept("dynamical-systems"), type: "application-of", note: "Long-run behavior of a repeated linear map is read off the eigenbasis." },
  { from: concept("eigenvector"), to: concept("dynamical-systems"), type: "application-of", note: "Eigen-directions are the modes a repeated map preserves." },
  { from: concept("differential-equation"), to: concept("exponential-growth-decay"), type: "application-of", note: "y' = ky is the growth/decay equation, solved by separation." },
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
  { from: concept("vector"), to: lesson("transformations"), type: "revisited-by" },
  { from: concept("vector"), to: lesson("systems"), type: "revisited-by" },
  { from: concept("vector"), to: lesson("orthogonality"), type: "revisited-by" },
  { from: concept("vector"), to: lesson("least-squares"), type: "revisited-by" },
  { from: concept("linear-combination"), to: lesson("transformations"), type: "revisited-by" },
  { from: concept("linear-combination"), to: lesson("systems"), type: "revisited-by" },
  { from: concept("linear-combination"), to: lesson("subspaces-rank"), type: "revisited-by" },
  { from: concept("linear-combination"), to: lesson("orthogonality"), type: "revisited-by" },
  { from: concept("span"), to: lesson("systems"), type: "revisited-by" },
  { from: concept("span"), to: lesson("subspaces-rank"), type: "revisited-by" },
  { from: concept("span"), to: lesson("least-squares"), type: "revisited-by" },
  { from: concept("linear-independence"), to: lesson("systems"), type: "revisited-by" },
  { from: concept("linear-independence"), to: lesson("subspaces-rank"), type: "revisited-by" },
  { from: concept("linear-independence"), to: lesson("rank-nullity"), type: "revisited-by" },
  { from: concept("basis"), to: lesson("transformations"), type: "revisited-by" },
  { from: concept("basis"), to: lesson("change-of-basis"), type: "revisited-by" },
  { from: concept("basis"), to: lesson("eigenvectors"), type: "revisited-by" },
  { from: concept("basis"), to: lesson("orthogonality"), type: "revisited-by" },
  { from: concept("coordinates"), to: lesson("transformations"), type: "revisited-by" },
  { from: concept("coordinates"), to: lesson("change-of-basis"), type: "revisited-by" },
  { from: concept("coordinates"), to: lesson("eigenvectors"), type: "revisited-by" },
  { from: concept("linear-transformation"), to: lesson("systems"), type: "revisited-by" },
  { from: concept("linear-transformation"), to: lesson("matrix-composition"), type: "revisited-by" },
  { from: concept("linear-transformation"), to: lesson("determinants"), type: "revisited-by" },
  { from: concept("linear-transformation"), to: lesson("change-of-basis"), type: "revisited-by" },
  { from: concept("linear-transformation"), to: lesson("eigenvectors"), type: "revisited-by" },
  { from: concept("linear-transformation"), to: lesson("svd"), type: "revisited-by" },
  { from: concept("matrix-columns"), to: lesson("systems"), type: "revisited-by" },
  { from: concept("matrix-columns"), to: lesson("matrix-composition"), type: "revisited-by" },
  { from: concept("matrix-columns"), to: lesson("subspaces-rank"), type: "revisited-by" },
  { from: concept("matrix-columns"), to: lesson("svd"), type: "revisited-by" },
  { from: concept("linear-system"), to: lesson("elimination"), type: "revisited-by" },
  { from: concept("linear-system"), to: lesson("solution-sets"), type: "revisited-by" },
  { from: concept("linear-system"), to: lesson("matrix-composition"), type: "revisited-by" },
  { from: concept("linear-system"), to: lesson("subspaces-rank"), type: "revisited-by" },
  { from: concept("linear-system"), to: lesson("least-squares"), type: "revisited-by" },
  { from: concept("row-picture"), to: lesson("elimination"), type: "revisited-by" },
  { from: concept("row-picture"), to: lesson("solution-sets"), type: "revisited-by" },
  { from: concept("column-picture"), to: lesson("matrix-composition"), type: "revisited-by" },
  { from: concept("column-picture"), to: lesson("subspaces-rank"), type: "revisited-by" },
  { from: concept("column-picture"), to: lesson("least-squares"), type: "revisited-by" },
  { from: concept("consistency"), to: lesson("solution-sets"), type: "revisited-by" },
  { from: concept("consistency"), to: lesson("subspaces-rank"), type: "revisited-by" },
  { from: concept("consistency"), to: lesson("least-squares"), type: "revisited-by" },
  { from: concept("elimination"), to: lesson("solution-sets"), type: "revisited-by" },
  { from: concept("elimination"), to: lesson("matrix-composition"), type: "revisited-by" },
  { from: concept("elimination"), to: lesson("subspaces-rank"), type: "revisited-by" },
  { from: concept("echelon-form"), to: lesson("solution-sets"), type: "revisited-by" },
  { from: concept("echelon-form"), to: lesson("subspaces-rank"), type: "revisited-by" },
  { from: concept("pivot"), to: lesson("solution-sets"), type: "revisited-by" },
  { from: concept("pivot"), to: lesson("subspaces-rank"), type: "revisited-by" },
  { from: concept("pivot"), to: lesson("rank-nullity"), type: "revisited-by" },
  { from: concept("free-variable"), to: lesson("solution-sets"), type: "revisited-by" },
  { from: concept("free-variable"), to: lesson("subspaces-rank"), type: "revisited-by" },
  { from: concept("free-variable"), to: lesson("rank-nullity"), type: "revisited-by" },
  { from: concept("solution-set"), to: lesson("subspaces-rank"), type: "revisited-by" },
  { from: concept("solution-set"), to: lesson("least-squares"), type: "revisited-by" },
  { from: concept("homogeneous-system"), to: lesson("subspaces-rank"), type: "revisited-by" },
  { from: concept("homogeneous-system"), to: lesson("rank-nullity"), type: "revisited-by" },
  { from: concept("matrix-composition"), to: lesson("determinants"), type: "revisited-by" },
  { from: concept("matrix-composition"), to: lesson("change-of-basis"), type: "revisited-by" },
  { from: concept("matrix-composition"), to: lesson("eigenvectors"), type: "revisited-by" },
  { from: concept("matrix-composition"), to: lesson("svd"), type: "revisited-by" },
  { from: concept("invertibility"), to: lesson("determinants"), type: "revisited-by" },
  { from: concept("invertibility"), to: lesson("subspaces-rank"), type: "revisited-by" },
  { from: concept("invertibility"), to: lesson("rank-nullity"), type: "revisited-by" },
  { from: concept("determinant"), to: lesson("eigenvectors"), type: "revisited-by" },
  { from: concept("orientation"), to: lesson("svd"), type: "revisited-by" },
  { from: concept("subspace"), to: lesson("rank-nullity"), type: "revisited-by" },
  { from: concept("subspace"), to: lesson("change-of-basis"), type: "revisited-by" },
  { from: concept("subspace"), to: lesson("orthogonality"), type: "revisited-by" },
  { from: concept("subspace"), to: lesson("least-squares"), type: "revisited-by" },
  { from: concept("column-space"), to: lesson("rank-nullity"), type: "revisited-by" },
  { from: concept("column-space"), to: lesson("least-squares"), type: "revisited-by" },
  { from: concept("column-space"), to: lesson("svd"), type: "revisited-by" },
  { from: concept("null-space"), to: lesson("rank-nullity"), type: "revisited-by" },
  { from: concept("rank"), to: lesson("rank-nullity"), type: "revisited-by" },
  { from: concept("rank"), to: lesson("least-squares"), type: "revisited-by" },
  { from: concept("rank"), to: lesson("svd"), type: "revisited-by" },
  { from: concept("nullity"), to: lesson("svd"), type: "revisited-by" },
  { from: concept("rank-nullity"), to: lesson("svd"), type: "revisited-by" },
  { from: concept("dimension"), to: lesson("change-of-basis"), type: "revisited-by" },
  { from: concept("dimension"), to: lesson("svd"), type: "revisited-by" },
  { from: concept("change-of-basis"), to: lesson("eigenvectors"), type: "revisited-by" },
  { from: concept("change-of-basis"), to: lesson("orthogonality"), type: "revisited-by" },
  { from: concept("change-of-basis"), to: lesson("svd"), type: "revisited-by" },
  { from: concept("eigenvector"), to: lesson("svd"), type: "revisited-by" },
  { from: concept("eigenvalue"), to: lesson("svd"), type: "revisited-by" },
  { from: concept("eigenspace"), to: lesson("svd"), type: "revisited-by" },
  { from: concept("diagonalization"), to: lesson("svd"), type: "revisited-by" },
  { from: concept("dot-product"), to: lesson("least-squares"), type: "revisited-by" },
  { from: concept("dot-product"), to: lesson("svd"), type: "revisited-by" },
  { from: concept("orthogonality"), to: lesson("least-squares"), type: "revisited-by" },
  { from: concept("orthogonality"), to: lesson("svd"), type: "revisited-by" },
  { from: concept("projection"), to: lesson("least-squares"), type: "revisited-by" },
  { from: concept("projection"), to: lesson("svd"), type: "revisited-by" },
  { from: concept("orthonormal-basis"), to: lesson("svd"), type: "revisited-by" },
  { from: concept("least-squares"), to: lesson("svd"), type: "revisited-by" },
  // --- Applied Mathematics (from curriculum-architecture.md §3 Reused-by column) ---
  { from: concept("limit"), to: lesson("derivative-local-linearity"), type: "revisited-by" },
  { from: concept("limit"), to: lesson("integral-accumulation"), type: "revisited-by" },
  { from: concept("limit"), to: lesson("improper-integrals"), type: "revisited-by" },
  { from: concept("limit"), to: lesson("sequences-limits"), type: "revisited-by" },
  { from: concept("continuity"), to: lesson("derivative-local-linearity"), type: "revisited-by" },
  { from: concept("continuity"), to: lesson("integral-accumulation"), type: "revisited-by" },
  { from: concept("continuity"), to: lesson("fundamental-theorem"), type: "revisited-by" },
  { from: concept("modulus-of-continuity"), to: lesson("integral-accumulation"), type: "revisited-by" },
  { from: concept("modulus-of-continuity"), to: lesson("fundamental-theorem"), type: "revisited-by" },
  { from: concept("modulus-of-continuity"), to: lesson("multiple-integrals"), type: "revisited-by" },
  { from: concept("local-linearity"), to: lesson("fundamental-theorem"), type: "revisited-by" },
  { from: concept("local-linearity"), to: lesson("chain-rule"), type: "revisited-by" },
  { from: concept("local-linearity"), to: lesson("optimization-approximation"), type: "revisited-by" },
  { from: concept("local-linearity"), to: lesson("power-taylor-series"), type: "revisited-by" },
  { from: concept("local-linearity"), to: lesson("partial-derivatives-gradient"), type: "revisited-by" },
  { from: concept("derivative"), to: lesson("fundamental-theorem"), type: "revisited-by" },
  { from: concept("derivative"), to: lesson("chain-rule"), type: "revisited-by" },
  { from: concept("derivative"), to: lesson("optimization-approximation"), type: "revisited-by" },
  { from: concept("derivative"), to: lesson("first-order-odes"), type: "revisited-by" },
  { from: concept("derivative"), to: lesson("partial-derivatives-gradient"), type: "revisited-by" },
  { from: concept("riemann-sum"), to: lesson("fundamental-theorem"), type: "revisited-by" },
  { from: concept("riemann-sum"), to: lesson("improper-integrals"), type: "revisited-by" },
  { from: concept("riemann-sum"), to: lesson("multiple-integrals"), type: "revisited-by" },
  { from: concept("riemann-sum"), to: lesson("vector-fields-line-integrals"), type: "revisited-by" },
  { from: concept("definite-integral"), to: lesson("fundamental-theorem"), type: "revisited-by" },
  { from: concept("definite-integral"), to: lesson("substitution-parts"), type: "revisited-by" },
  { from: concept("definite-integral"), to: lesson("improper-integrals"), type: "revisited-by" },
  { from: concept("definite-integral"), to: lesson("inner-products-projection"), type: "revisited-by" },
  { from: concept("definite-integral"), to: lesson("fourier-series"), type: "revisited-by" },
  { from: concept("definite-integral"), to: lesson("fourier-transform"), type: "revisited-by" },
  { from: concept("definite-integral"), to: lesson("laplace-transform"), type: "revisited-by" },
  { from: concept("definite-integral"), to: lesson("multiple-integrals"), type: "revisited-by" },
  { from: concept("definite-integral"), to: lesson("vector-fields-line-integrals"), type: "revisited-by" },
  { from: concept("definite-integral"), to: lesson("surface-integrals"), type: "revisited-by" },
  { from: concept("antiderivative"), to: lesson("substitution-parts"), type: "revisited-by" },
  { from: concept("antiderivative"), to: lesson("improper-integrals"), type: "revisited-by" },
  { from: concept("antiderivative"), to: lesson("first-order-odes"), type: "revisited-by" },
  { from: concept("ftc"), to: lesson("substitution-parts"), type: "revisited-by" },
  { from: concept("ftc"), to: lesson("improper-integrals"), type: "revisited-by" },
  { from: concept("ftc"), to: lesson("laplace-transform"), type: "revisited-by" },
  { from: concept("ftc"), to: lesson("greens-theorem"), type: "revisited-by" },
  { from: concept("ftc"), to: lesson("stokes-theorem"), type: "revisited-by" },
  { from: concept("ftc"), to: lesson("divergence-theorem"), type: "revisited-by" },
  { from: concept("improper-integral"), to: lesson("series-convergence"), type: "revisited-by" },
  { from: concept("improper-integral"), to: lesson("fourier-transform"), type: "revisited-by" },
  { from: concept("improper-integral"), to: lesson("laplace-transform"), type: "revisited-by" },
  { from: concept("sequence-limit"), to: lesson("series-convergence"), type: "revisited-by" },
  { from: concept("sequence-limit"), to: lesson("fourier-series"), type: "revisited-by" },
  { from: concept("series-convergence"), to: lesson("power-taylor-series"), type: "revisited-by" },
  { from: concept("series-convergence"), to: lesson("fourier-series"), type: "revisited-by" },
  { from: concept("series-convergence"), to: lesson("laplace-transform"), type: "revisited-by" },
  { from: concept("radius-of-convergence"), to: lesson("eulers-formula"), type: "revisited-by" },
  { from: concept("radius-of-convergence"), to: lesson("laplace-transform"), type: "revisited-by" },
  { from: concept("complex-multiplication"), to: lesson("eulers-formula"), type: "revisited-by" },
  { from: concept("complex-multiplication"), to: lesson("waves-phasors"), type: "revisited-by" },
  { from: concept("complex-multiplication"), to: lesson("fourier-transform"), type: "revisited-by" },
  { from: concept("complex-multiplication"), to: lesson("laplace-transform"), type: "revisited-by" },
  { from: concept("complex-exponential"), to: lesson("waves-phasors"), type: "revisited-by" },
  { from: concept("complex-exponential"), to: lesson("orthogonal-families"), type: "revisited-by" },
  { from: concept("complex-exponential"), to: lesson("fourier-series"), type: "revisited-by" },
  { from: concept("complex-exponential"), to: lesson("fourier-transform"), type: "revisited-by" },
  { from: concept("complex-exponential"), to: lesson("convolution-filtering"), type: "revisited-by" },
  { from: concept("complex-exponential"), to: lesson("sampling-aliasing"), type: "revisited-by" },
  { from: concept("complex-exponential"), to: lesson("dft-fft"), type: "revisited-by" },
  { from: concept("complex-exponential"), to: lesson("second-order-odes"), type: "revisited-by" },
  { from: concept("complex-exponential"), to: lesson("laplace-transform"), type: "revisited-by" },
  { from: concept("complex-exponential"), to: lesson("transfer-impulse-response"), type: "revisited-by" },
  { from: concept("phasor"), to: lesson("orthogonal-families"), type: "revisited-by" },
  { from: concept("phasor"), to: lesson("fourier-series"), type: "revisited-by" },
  { from: concept("phasor"), to: lesson("fourier-transform"), type: "revisited-by" },
  { from: concept("phasor"), to: lesson("convolution-filtering"), type: "revisited-by" },
  { from: concept("phasor"), to: lesson("sampling-aliasing"), type: "revisited-by" },
  { from: concept("phasor"), to: lesson("dft-fft"), type: "revisited-by" },
  { from: concept("phasor"), to: lesson("transfer-impulse-response"), type: "revisited-by" },
  { from: concept("phasor"), to: lesson("circuits-control-stability"), type: "revisited-by" },
  { from: concept("inner-product"), to: lesson("orthogonal-families"), type: "revisited-by" },
  { from: concept("inner-product"), to: lesson("fourier-series"), type: "revisited-by" },
  { from: concept("inner-product"), to: lesson("fourier-transform"), type: "revisited-by" },
  { from: concept("orthogonal-projection"), to: lesson("orthogonal-families"), type: "revisited-by" },
  { from: concept("orthogonal-projection"), to: lesson("fourier-series"), type: "revisited-by" },
  { from: concept("orthogonal-family"), to: lesson("fourier-series"), type: "revisited-by" },
  { from: concept("orthogonal-family"), to: lesson("fourier-transform"), type: "revisited-by" },
  { from: concept("orthogonal-family"), to: lesson("dft-fft"), type: "revisited-by" },
  { from: concept("fourier-coefficient"), to: lesson("fourier-transform"), type: "revisited-by" },
  { from: concept("fourier-coefficient"), to: lesson("dft-fft"), type: "revisited-by" },
  { from: concept("mean-square-convergence"), to: lesson("fourier-transform"), type: "revisited-by" },
  { from: concept("mean-square-convergence"), to: lesson("sampling-aliasing"), type: "revisited-by" },
  { from: concept("spectrum"), to: lesson("convolution-filtering"), type: "revisited-by" },
  { from: concept("spectrum"), to: lesson("sampling-aliasing"), type: "revisited-by" },
  { from: concept("spectrum"), to: lesson("dft-fft"), type: "revisited-by" },
  { from: concept("spectrum"), to: lesson("laplace-transform"), type: "revisited-by" },
  { from: concept("spectrum"), to: lesson("transfer-impulse-response"), type: "revisited-by" },
  { from: concept("convolution"), to: lesson("sampling-aliasing"), type: "revisited-by" },
  { from: concept("convolution"), to: lesson("dft-fft"), type: "revisited-by" },
  { from: concept("convolution"), to: lesson("transfer-impulse-response"), type: "revisited-by" },
  { from: concept("lti-system"), to: lesson("transfer-impulse-response"), type: "revisited-by" },
  { from: concept("lti-system"), to: lesson("circuits-control-stability"), type: "revisited-by" },
  { from: concept("sampling"), to: lesson("dft-fft"), type: "revisited-by" },
  { from: concept("aliasing"), to: lesson("dft-fft"), type: "revisited-by" },
  { from: concept("differential-equation"), to: lesson("second-order-odes"), type: "revisited-by" },
  { from: concept("differential-equation"), to: lesson("laplace-transform"), type: "revisited-by" },
  { from: concept("differential-equation"), to: lesson("inverse-laplace"), type: "revisited-by" },
  { from: concept("differential-equation"), to: lesson("transfer-impulse-response"), type: "revisited-by" },
  { from: concept("differential-equation"), to: lesson("circuits-control-stability"), type: "revisited-by" },
  { from: concept("characteristic-equation"), to: lesson("laplace-transform"), type: "revisited-by" },
  { from: concept("characteristic-equation"), to: lesson("circuits-control-stability"), type: "revisited-by" },
  { from: concept("laplace-transform"), to: lesson("inverse-laplace"), type: "revisited-by" },
  { from: concept("laplace-transform"), to: lesson("transfer-impulse-response"), type: "revisited-by" },
  { from: concept("laplace-transform"), to: lesson("circuits-control-stability"), type: "revisited-by" },
  { from: concept("region-of-convergence"), to: lesson("inverse-laplace"), type: "revisited-by" },
  { from: concept("region-of-convergence"), to: lesson("circuits-control-stability"), type: "revisited-by" },
  { from: concept("transfer-function"), to: lesson("circuits-control-stability"), type: "revisited-by" },
  { from: concept("impulse-response"), to: lesson("circuits-control-stability"), type: "revisited-by" },
  { from: concept("partial-derivative"), to: lesson("multiple-integrals"), type: "revisited-by" },
  { from: concept("partial-derivative"), to: lesson("change-of-variables-jacobian"), type: "revisited-by" },
  { from: concept("partial-derivative"), to: lesson("vector-fields-line-integrals"), type: "revisited-by" },
  { from: concept("partial-derivative"), to: lesson("circulation-flux"), type: "revisited-by" },
  { from: concept("partial-derivative"), to: lesson("divergence-curl"), type: "revisited-by" },
  { from: concept("gradient"), to: lesson("vector-fields-line-integrals"), type: "revisited-by" },
  { from: concept("gradient"), to: lesson("divergence-curl"), type: "revisited-by" },
  { from: concept("jacobian"), to: lesson("surface-integrals"), type: "revisited-by" },
  { from: concept("vector-field"), to: lesson("circulation-flux"), type: "revisited-by" },
  { from: concept("vector-field"), to: lesson("divergence-curl"), type: "revisited-by" },
  { from: concept("vector-field"), to: lesson("greens-theorem"), type: "revisited-by" },
  { from: concept("vector-field"), to: lesson("surface-integrals"), type: "revisited-by" },
  { from: concept("vector-field"), to: lesson("stokes-theorem"), type: "revisited-by" },
  { from: concept("vector-field"), to: lesson("divergence-theorem"), type: "revisited-by" },
  { from: concept("line-integral"), to: lesson("circulation-flux"), type: "revisited-by" },
  { from: concept("line-integral"), to: lesson("greens-theorem"), type: "revisited-by" },
  { from: concept("line-integral"), to: lesson("stokes-theorem"), type: "revisited-by" },
  { from: concept("circulation"), to: lesson("divergence-curl"), type: "revisited-by" },
  { from: concept("circulation"), to: lesson("greens-theorem"), type: "revisited-by" },
  { from: concept("circulation"), to: lesson("stokes-theorem"), type: "revisited-by" },
  { from: concept("flux"), to: lesson("divergence-curl"), type: "revisited-by" },
  { from: concept("flux"), to: lesson("divergence-theorem"), type: "revisited-by" },
  { from: concept("curl"), to: lesson("greens-theorem"), type: "revisited-by" },
  { from: concept("curl"), to: lesson("stokes-theorem"), type: "revisited-by" },
  { from: concept("divergence"), to: lesson("divergence-theorem"), type: "revisited-by" },
  { from: concept("surface-integral"), to: lesson("stokes-theorem"), type: "revisited-by" },
  { from: concept("surface-integral"), to: lesson("divergence-theorem"), type: "revisited-by" },
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

/**
 * The edge variant a given `EdgeType` names. Querying with a literal type
 * narrows the result, so `edgesTo(ref, "requires")[0].from` is known to be a
 * `LessonRef` — the practical payoff of discriminating the union.
 */
export type EdgeOfType<T extends EdgeType> = Extract<CurriculumEdge, { type: T }>;

export function edgesOfType<T extends EdgeType>(type: T): readonly EdgeOfType<T>[] {
  return CURRICULUM_EDGES.filter((edge): edge is EdgeOfType<T> => edge.type === type);
}

/**
 * Edges leaving `ref`. Callers pass a `concept(...)` or `lesson(...)` ref, not
 * a bare id, so asking for "edges from elimination" has to say WHICH
 * elimination — the concept or the lesson.
 */
export function edgesFrom<T extends EdgeType = EdgeType>(
  ref: NodeRef,
  type?: T,
): readonly EdgeOfType<T>[] {
  return CURRICULUM_EDGES.filter(
    (edge): edge is EdgeOfType<T> =>
      sameNode(edge.from, ref) && (type === undefined || edge.type === type),
  );
}

/** Edges arriving at `ref`. Same ref-not-bare-id contract as `edgesFrom`. */
export function edgesTo<T extends EdgeType = EdgeType>(
  ref: NodeRef,
  type?: T,
): readonly EdgeOfType<T>[] {
  return CURRICULUM_EDGES.filter(
    (edge): edge is EdgeOfType<T> =>
      sameNode(edge.to, ref) && (type === undefined || edge.type === type),
  );
}
