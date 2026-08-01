/**
 * The concept catalog — ADR-005's first data layer.
 *
 * Transcribed from `docs/courses/linear-algebra/curriculum-architecture.md`
 * §3 and `docs/courses/applied-mathematics/curriculum-architecture.md` §3,
 * which are now the *rendered* view of this data, not a second source of
 * truth. See `docs/engineering/decisions/005-curriculum-graph-as-data.md`.
 *
 * `blurb` is plain descriptive text (like `GlossaryTerm.definition` in intent,
 * but never routed through `ProseWithMath`): `GlossaryTermCard`'s
 * "Applications" section renders it as a native HTML `title` tooltip on the
 * target concept's chip. Because it is plain text, not markup, it carries no
 * `$...$` KaTeX and no `**bold**` markers — a blurb is written to read
 * correctly as-is, not to be parsed.
 */

import { asConceptId, type ConceptId } from "../platform/identity";

export type ConceptNode = {
  id: ConceptId;
  title: string;
  blurb: string;
  /** The lesson that first defines/derives this concept, if one is built or scheduled. */
  introducedBy?: string;
};

/* --------------------------------------------------------------------------
 * Linear Algebra — 40 concepts (curriculum-architecture.md §3)
 * ------------------------------------------------------------------------ */

const LINEAR_ALGEBRA_CONCEPTS: readonly ConceptNode[] = [
  { id: asConceptId("vector"), title: "Vector", blurb: "A quantity with direction and magnitude; data you can combine.", introducedBy: "vectors" },
  { id: asConceptId("linear-combination"), title: "Linear Combination", blurb: "A weighted sum a·v + b·w of vectors.", introducedBy: "vectors" },
  { id: asConceptId("span"), title: "Span", blurb: "The set of all points reachable by combinations — reachability.", introducedBy: "vectors" },
  { id: asConceptId("linear-independence"), title: "Linear Independence", blurb: "Vectors none of which is a combination of the others (\"not on the same line\").", introducedBy: "vectors" },
  { id: asConceptId("basis"), title: "Basis", blurb: "A minimal independent set that spans — a coordinate language.", introducedBy: "vectors" },
  { id: asConceptId("coordinates"), title: "Coordinates", blurb: "The weights naming a vector *in a chosen basis*; a choice, not the vector.", introducedBy: "vectors" },
  { id: asConceptId("linear-transformation"), title: "Linear Transformation", blurb: "A map that moves every point consistently (grid stays straight, evenly spaced).", introducedBy: "transformations" },
  { id: asConceptId("matrix-columns"), title: "Matrix Columns", blurb: "A map is fixed by where the basis lands — its columns.", introducedBy: "transformations" },
  { id: asConceptId("linear-system"), title: "Linear System", blurb: "Ax = b: constraints (rows) and a combination question (columns).", introducedBy: "systems" },
  { id: asConceptId("row-picture"), title: "Row Picture", blurb: "Each equation is a line/plane; solutions are their intersection.", introducedBy: "systems" },
  { id: asConceptId("column-picture"), title: "Column Picture", blurb: "\"Which recipe of A's columns reaches b?\"", introducedBy: "systems" },
  { id: asConceptId("consistency"), title: "Consistency", blurb: "Whether b is reachable — b in the column space.", introducedBy: "systems" },
  { id: asConceptId("elimination"), title: "Elimination", blurb: "Replacing a system with an easier one having the same solution set.", introducedBy: "elimination" },
  { id: asConceptId("echelon-form"), title: "Echelon Form", blurb: "The reduced staircase a system reaches under elimination.", introducedBy: "elimination" },
  { id: asConceptId("pivot"), title: "Pivot", blurb: "A leading entry marking a bound variable / an independent direction.", introducedBy: "elimination" },
  { id: asConceptId("free-variable"), title: "Free Variable", blurb: "An unpivoted variable parameterizing the solution set.", introducedBy: "elimination" },
  { id: asConceptId("solution-set"), title: "Solution Set", blurb: "Particular solution + all null directions; affine vs linear.", introducedBy: "solution-sets" },
  { id: asConceptId("homogeneous-system"), title: "Homogeneous System", blurb: "Ax = 0; its solutions are the null directions.", introducedBy: "solution-sets" },
  { id: asConceptId("matrix-composition"), title: "Matrix Composition", blurb: "\"Apply B then A\" is a new map `AB`; order matters.", introducedBy: "matrix-composition" },
  { id: asConceptId("invertibility"), title: "Invertibility", blurb: "A map can be undone exactly when nothing collapses.", introducedBy: "matrix-composition" },
  { id: asConceptId("determinant"), title: "Determinant", blurb: "Signed area/volume scale; a detector of invertibility (zero = collapse).", introducedBy: "determinants" },
  { id: asConceptId("orientation"), title: "Orientation", blurb: "The sign of the determinant — handedness, not negative area.", introducedBy: "determinants" },
  { id: asConceptId("subspace"), title: "Subspace", blurb: "A closed-under-combination flat through the origin.", introducedBy: "subspaces-rank" },
  { id: asConceptId("column-space"), title: "Column Space", blurb: "Span of the columns — the reachable outputs.", introducedBy: "subspaces-rank" },
  { id: asConceptId("null-space"), title: "Null Space", blurb: "Inputs sent to zero — the source of non-uniqueness.", introducedBy: "subspaces-rank" },
  { id: asConceptId("rank"), title: "Rank", blurb: "Number of independent output directions = dim(column space).", introducedBy: "subspaces-rank" },
  { id: asConceptId("nullity"), title: "Nullity", blurb: "Dimension of the null space.", introducedBy: "rank-nullity" },
  { id: asConceptId("rank-nullity"), title: "Rank-Nullity", blurb: "Conservation: rank + nullity = n (dimensions survive or collapse).", introducedBy: "rank-nullity" },
  { id: asConceptId("dimension"), title: "Dimension", blurb: "The number of independent directions spanning a space.", introducedBy: "rank-nullity" },
  { id: asConceptId("change-of-basis"), title: "Change of Basis", blurb: "The same vector/map re-described in a different basis.", introducedBy: "change-of-basis" },
  { id: asConceptId("eigenvector"), title: "Eigenvector", blurb: "A direction the map only scales — it stays on its own line.", introducedBy: "eigenvectors" },
  { id: asConceptId("eigenvalue"), title: "Eigenvalue", blurb: "The scale factor λ on an eigen-direction (Av = λv).", introducedBy: "eigenvectors" },
  { id: asConceptId("eigenspace"), title: "Eigenspace", blurb: "All eigenvectors for a given λ (plus 0).", introducedBy: "eigenvectors" },
  { id: asConceptId("diagonalization"), title: "Diagonalization", blurb: "Choosing the basis where the map is pure scaling.", introducedBy: "eigenvectors" },
  { id: asConceptId("dot-product"), title: "Dot Product", blurb: "The inner product measuring alignment and length.", introducedBy: "orthogonality" },
  { id: asConceptId("orthogonality"), title: "Orthogonality", blurb: "Right angles; the geometry of best approximation.", introducedBy: "orthogonality" },
  { id: asConceptId("projection"), title: "Projection", blurb: "The closest point in a subspace to a given vector.", introducedBy: "orthogonality" },
  { id: asConceptId("orthonormal-basis"), title: "Orthonormal Basis", blurb: "An independent, unit-length, mutually perpendicular basis.", introducedBy: "orthogonality" },
  { id: asConceptId("least-squares"), title: "Least Squares", blurb: "Best fit when Ax = b is inconsistent: project b onto the column space.", introducedBy: "least-squares" },
  { id: asConceptId("singular-value-decomposition"), title: "Singular Value Decomposition", blurb: "Every matrix = rotate → scale → rotate (A = UΣVᵀ).", introducedBy: "svd" },
];

/* --------------------------------------------------------------------------
 * Applied Mathematics — 43 concepts (curriculum-architecture.md §3)
 * ------------------------------------------------------------------------ */

const APPLIED_MATHEMATICS_CONCEPTS: readonly ConceptNode[] = [
  { id: asConceptId("limit"), title: "Limit", blurb: "The value a function's outputs can be forced arbitrarily close to, near a point.", introducedBy: "limits-continuity" },
  { id: asConceptId("continuity"), title: "Continuity", blurb: "The tolerance guarantee holding with f(a) as the target — a local claim.", introducedBy: "limits-continuity" },
  { id: asConceptId("modulus-of-continuity"), title: "Modulus of Continuity", blurb: "A function ω(δ) bounding how much f can vary over any step of size δ — the quantitative control a local guarantee does not supply.", introducedBy: "limits-continuity" },
  { id: asConceptId("local-linearity"), title: "Local Linearity", blurb: "Zoomed far enough, a smooth curve is indistinguishable from a line.", introducedBy: "derivative-local-linearity" },
  { id: asConceptId("derivative"), title: "Derivative", blurb: "The slope of that line; equivalently the instantaneous rate.", introducedBy: "derivative-local-linearity" },
  { id: asConceptId("riemann-sum"), title: "Riemann Sum", blurb: "A finite total of rate × width, refined without bound.", introducedBy: "integral-accumulation" },
  { id: asConceptId("definite-integral"), title: "Definite Integral", blurb: "The limit of Riemann sums; the total of a rate.", introducedBy: "integral-accumulation" },
  { id: asConceptId("antiderivative"), title: "Antiderivative", blurb: "A function whose derivative is the integrand.", introducedBy: "fundamental-theorem" },
  { id: asConceptId("ftc"), title: "Fundamental Theorem of Calculus (FTC)", blurb: "Measuring and accumulating are inverse; interiors telescope. Theme 1, 1-D.", introducedBy: "fundamental-theorem" },
  { id: asConceptId("improper-integral"), title: "Improper Integral", blurb: "A limit of finite accumulations over a growing interval.", introducedBy: "improper-integrals" },
  { id: asConceptId("sequence-limit"), title: "Sequence Limit", blurb: "Eventual entrapment of the tail in any tolerance.", introducedBy: "sequences-limits" },
  { id: asConceptId("series-convergence"), title: "Series Convergence", blurb: "The limit of the partial sums, when it exists.", introducedBy: "series-convergence" },
  { id: asConceptId("radius-of-convergence"), title: "Radius of Convergence", blurb: "The disc on which a power series converges.", introducedBy: "power-taylor-series" },
  { id: asConceptId("complex-multiplication"), title: "Complex Multiplication", blurb: "Rotate by the argument, scale by the modulus.", introducedBy: "complex-rotation" },
  { id: asConceptId("complex-exponential"), title: "Complex Exponential", blurb: "e^(iθ): the exponential whose rate is a quarter turn from its position.", introducedBy: "eulers-formula" },
  { id: asConceptId("phasor"), title: "Phasor", blurb: "A complex amplitude carrying magnitude and phase together.", introducedBy: "waves-phasors" },
  { id: asConceptId("inner-product"), title: "Inner Product", blurb: "A bilinear, symmetric, positive pairing measuring alignment.", introducedBy: "inner-products-projection" },
  { id: asConceptId("orthogonal-projection"), title: "Orthogonal Projection", blurb: "The closest point in a subspace; the error is orthogonal.", introducedBy: "inner-products-projection" },
  { id: asConceptId("orthogonal-family"), title: "Orthogonal Family", blurb: "A mutually orthogonal set, so coordinates separate.", introducedBy: "orthogonal-families" },
  { id: asConceptId("fourier-coefficient"), title: "Fourier Coefficient", blurb: "The projection of a periodic function onto one basis sinusoid.", introducedBy: "fourier-series" },
  { id: asConceptId("mean-square-convergence"), title: "Mean Square Convergence", blurb: "Convergence in energy — not pointwise convergence, as Gibbs shows.", introducedBy: "fourier-series" },
  { id: asConceptId("spectrum"), title: "Spectrum", blurb: "The map from frequency to complex amplitude.", introducedBy: "fourier-transform" },
  { id: asConceptId("convolution"), title: "Convolution", blurb: "The operation whose transform is a product; smearing by an impulse response.", introducedBy: "convolution-filtering" },
  { id: asConceptId("lti-system"), title: "LTI System", blurb: "Linear and time-invariant; described entirely by its impulse response.", introducedBy: "convolution-filtering" },
  { id: asConceptId("sampling"), title: "Sampling", blurb: "Replacing a function by its values on a grid; replicates the spectrum.", introducedBy: "sampling-aliasing" },
  { id: asConceptId("aliasing"), title: "Aliasing", blurb: "Spectral copies overlapping, so frequencies become indistinguishable.", introducedBy: "sampling-aliasing" },
  { id: asConceptId("differential-equation"), title: "Differential Equation", blurb: "A statement relating a function to its own derivatives.", introducedBy: "first-order-odes" },
  { id: asConceptId("characteristic-equation"), title: "Characteristic Equation", blurb: "The polynomial obtained by trying e^(st).", introducedBy: "second-order-odes" },
  { id: asConceptId("laplace-transform"), title: "Laplace Transform", blurb: "A one-sided integral against e^(-st) turning d/dt into multiplication by s, with a region of convergence. Not a projection.", introducedBy: "laplace-transform" },
  { id: asConceptId("region-of-convergence"), title: "Region of Convergence", blurb: "The half-plane of s where the Laplace integral converges.", introducedBy: "laplace-transform" },
  { id: asConceptId("transfer-function"), title: "Transfer Function", blurb: "The transform-domain multiplier of an LTI system.", introducedBy: "transfer-impulse-response" },
  { id: asConceptId("impulse-response"), title: "Impulse Response", blurb: "What an LTI system does to a single impulse.", introducedBy: "transfer-impulse-response" },
  { id: asConceptId("pole"), title: "Pole", blurb: "A root of the transfer function's denominator — one of the system's own exponentials.", introducedBy: "circuits-control-stability" },
  { id: asConceptId("partial-derivative"), title: "Partial Derivative", blurb: "A derivative with the other inputs held fixed.", introducedBy: "partial-derivatives-gradient" },
  { id: asConceptId("gradient"), title: "Gradient", blurb: "The vector of partials; the uphill direction.", introducedBy: "partial-derivatives-gradient" },
  { id: asConceptId("jacobian"), title: "Jacobian", blurb: "The matrix of partials of a coordinate change; its determinant is the local area/volume scale.", introducedBy: "change-of-variables-jacobian" },
  { id: asConceptId("vector-field"), title: "Vector Field", blurb: "A vector assigned to every point.", introducedBy: "vector-fields-line-integrals" },
  { id: asConceptId("line-integral"), title: "Line Integral", blurb: "Accumulation of a field along a path.", introducedBy: "vector-fields-line-integrals" },
  { id: asConceptId("circulation"), title: "Circulation", blurb: "The line integral of the tangential component around a loop.", introducedBy: "circulation-flux" },
  { id: asConceptId("flux"), title: "Flux", blurb: "The integral of the normal component through a boundary.", introducedBy: "circulation-flux" },
  { id: asConceptId("curl"), title: "Curl", blurb: "Circulation per unit area, in the limit.", introducedBy: "divergence-curl" },
  { id: asConceptId("divergence"), title: "Divergence", blurb: "Flux per unit area or volume, in the limit.", introducedBy: "divergence-curl" },
  { id: asConceptId("surface-integral"), title: "Surface Integral", blurb: "Accumulation over a parameterized surface.", introducedBy: "surface-integrals" },
];

/* --------------------------------------------------------------------------
 * Application-domain concepts — the target end of `application-of` edges.
 *
 * Sourced directly from the LA course-spine's "Application threads" table
 * (Data thread, Dynamics thread) and the AM spine's "Growth and decay"
 * thread — not invented curriculum, just concepts those threads already
 * name in prose. None is introduced by a lesson yet: they mark relevance,
 * not a built experience.
 * ------------------------------------------------------------------------ */

const APPLICATION_DOMAIN_CONCEPTS: readonly ConceptNode[] = [
  { id: asConceptId("regression"), title: "Regression", blurb: "Fitting a line or model to data by minimizing total error." },
  { id: asConceptId("principal-component-analysis"), title: "Principal Component Analysis", blurb: "Finding the directions along which data varies most." },
  { id: asConceptId("image-compression"), title: "Image Compression", blurb: "Keeping only a matrix's largest singular directions to approximate it cheaply." },
  { id: asConceptId("dynamical-systems"), title: "Dynamical Systems", blurb: "Long-run behavior of a system that repeatedly applies the same linear map." },
  { id: asConceptId("exponential-growth-decay"), title: "Exponential Growth & Decay", blurb: "A quantity whose rate of change is proportional to its current value." },
];

export const CONCEPTS: readonly ConceptNode[] = [
  ...LINEAR_ALGEBRA_CONCEPTS,
  ...APPLIED_MATHEMATICS_CONCEPTS,
  ...APPLICATION_DOMAIN_CONCEPTS,
];

const CONCEPTS_BY_ID = new Map(CONCEPTS.map((c) => [c.id, c]));

export function getConcept(id: string): ConceptNode | undefined {
  return CONCEPTS_BY_ID.get(id as ConceptId);
}
