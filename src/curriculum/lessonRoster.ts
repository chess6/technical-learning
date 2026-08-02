/**
 * The full lesson-id roster — every lesson named in the LA/AM/Algorithms
 * course spines, built or not.
 *
 * `courseModel.ts` deliberately grows incrementally: it declares a `future`
 * node only once a unit enters Mode B planning ("this list grows with the
 * roadmap rather than declaring 39 stubs up front"). The curriculum graph in
 * `src/curriculum/edges.ts` transcribes prerequisite/connection edges from
 * the LA and AM `curriculum-architecture.md` docs, which already describe
 * the FULL designed spine (all 15 LA lessons, all 39 AM lessons) — most of it
 * unbuilt and un-scheduled. Gating the graph's referential-integrity check on
 * `courseModel.ts`'s current, partial scheduling would fail on every edge
 * that reaches past whatever has been scheduled so far.
 *
 * This roster is the graph's own resolution target: every id the two
 * curriculum-architecture docs name, independent of build/scheduling status.
 * It is consumed ONLY by `src/curriculum/__tests__/graph.test.ts` — nothing
 * production-facing reads it, so it cannot silently gate what a learner sees.
 */

export type RosterEntry = { id: string; status: "built" | "future" };

const LINEAR_ALGEBRA_SPINE: readonly RosterEntry[] = [
  { id: "why-linear-algebra", status: "built" },
  { id: "vectors", status: "built" },
  { id: "transformations", status: "built" },
  { id: "systems", status: "built" },
  { id: "elimination", status: "built" },
  { id: "solution-sets", status: "built" },
  { id: "matrix-composition", status: "built" },
  { id: "determinants", status: "built" },
  { id: "subspaces-rank", status: "built" },
  { id: "rank-nullity", status: "built" },
  { id: "change-of-basis", status: "built" },
  { id: "eigenvectors", status: "built" },
  { id: "orthogonality", status: "future" },
  { id: "least-squares", status: "future" },
  { id: "svd", status: "future" },
];

const APPLIED_MATHEMATICS_SPINE: readonly RosterEntry[] = [
  { id: "functions-graphs-bridge", status: "future" },
  { id: "radians-rotation", status: "future" },
  { id: "limits-continuity", status: "built" },
  { id: "derivative-local-linearity", status: "built" },
  { id: "integral-accumulation", status: "built" },
  { id: "fundamental-theorem", status: "built" },
  { id: "chain-rule", status: "built" },
  { id: "optimization-approximation", status: "built" },
  { id: "substitution-parts", status: "future" },
  { id: "improper-integrals", status: "future" },
  { id: "sequences-limits", status: "future" },
  { id: "series-convergence", status: "future" },
  { id: "power-taylor-series", status: "future" },
  { id: "complex-rotation", status: "future" },
  { id: "eulers-formula", status: "future" },
  { id: "waves-phasors", status: "future" },
  { id: "inner-products-projection", status: "future" },
  { id: "orthogonal-families", status: "future" },
  { id: "fourier-series", status: "future" },
  { id: "fourier-transform", status: "future" },
  { id: "convolution-filtering", status: "future" },
  { id: "sampling-aliasing", status: "future" },
  { id: "dft-fft", status: "future" },
  { id: "first-order-odes", status: "future" },
  { id: "second-order-odes", status: "future" },
  { id: "laplace-transform", status: "future" },
  { id: "inverse-laplace", status: "future" },
  { id: "transfer-impulse-response", status: "future" },
  { id: "circuits-control-stability", status: "future" },
  { id: "partial-derivatives-gradient", status: "future" },
  { id: "multiple-integrals", status: "future" },
  { id: "change-of-variables-jacobian", status: "future" },
  { id: "vector-fields-line-integrals", status: "future" },
  { id: "circulation-flux", status: "future" },
  { id: "divergence-curl", status: "future" },
  { id: "greens-theorem", status: "future" },
  { id: "surface-integrals", status: "future" },
  { id: "stokes-theorem", status: "future" },
  { id: "divergence-theorem", status: "future" },
];

const ALGORITHMS_SPINE: readonly RosterEntry[] = [
  { id: "karatsuba", status: "built" },
  { id: "binary-search-trees", status: "built" },
  { id: "red-black-trees", status: "built" },
];

export const LESSON_ROSTER: readonly RosterEntry[] = [
  ...LINEAR_ALGEBRA_SPINE,
  ...APPLIED_MATHEMATICS_SPINE,
  ...ALGORITHMS_SPINE,
];

const ROSTER_IDS = new Set(LESSON_ROSTER.map((entry) => entry.id));

export function isKnownLessonId(id: string): boolean {
  return ROSTER_IDS.has(id);
}
