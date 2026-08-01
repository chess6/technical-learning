/**
 * Pathway overlays — ADR-005's third data layer, and the reason
 * "Applied Mathematics" is no longer a course.
 *
 * A pathway is a **goal-shaped traversal** of courses that already exist. It
 * owns no content: every id here must resolve to a lesson the curriculum
 * already declares. Removing a pathway removes a way of *walking* the
 * material, never any of the material.
 *
 * `requiredNodeIds` is the shortest viable route to the pathway's goal;
 * `optionalNodeIds` is what deepens it. The two together are the "thorough"
 * traversal, and the pair is what the `/map` page's shortest-vs-thorough
 * toggle reads (redesign plan §5.2).
 *
 * ## Membership is editorial, and grounded rather than invented
 *
 * The four pathway *ids* come from the approved redesign plan §6. Which
 * lessons each one requires is a **curriculum-design judgment**, grounded here
 * in what the roadmap already asserts: every grouping below cites the package
 * table in `docs/courses/applied-mathematics/curriculum-architecture.md` §6
 * (including its "What it completes" column) or a hard `requires` edge in
 * `edges.ts`.
 *
 * Reviewed and accepted by the repository owner (2026-08-01) for use in this
 * private instance. Rosters stay cheap to amend — the closure test in
 * `__tests__/pathways.test.ts` is what keeps an amendment honest, by refusing
 * any required lesson whose own hard prerequisites are not also required.
 */

import { lesson, type LessonRef } from "./edges";

export type Pathway = {
  id: string;
  title: string;
  /** What the learner will be able to do — the pathway's entry question. */
  goal: string;
  /** Who it is for, in the learner's own terms. */
  audience: string;
  /** The shortest viable route to the goal. */
  requiredNodeIds: readonly LessonRef[];
  /** Enrichment — real depth, not required to reach the goal. */
  optionalNodeIds: readonly LessonRef[];
};

const refs = (...ids: string[]): LessonRef[] => ids.map(lesson);

/* --------------------------------------------------------------------------
 * Groupings, named exactly as the package roadmap names them, so a reader can
 * check any pathway against the source table without re-deriving it.
 * ------------------------------------------------------------------------ */

// Applied-mathematics packages (curriculum-architecture.md §6).
const PKG_A_CALCULUS_FOUNDATIONS = refs("limits-continuity", "derivative-local-linearity", "integral-accumulation", "fundamental-theorem");
const PKG_B_CALCULUS_TECHNIQUE = refs("chain-rule", "optimization-approximation", "substitution-parts", "improper-integrals");
const PKG_C_SERIES = refs("sequences-limits", "series-convergence", "power-taylor-series");
const PKG_D_COMPLEX_OSCILLATION = refs("complex-rotation", "eulers-formula", "waves-phasors");
const PKG_E_PROJECTION_SPECTRA = refs("inner-products-projection", "orthogonal-families", "fourier-series", "fourier-transform");
const PKG_F_SIGNALS = refs("convolution-filtering", "sampling-aliasing", "dft-fft");
const PKG_G_DIFFERENTIAL_EQUATIONS = refs("first-order-odes", "second-order-odes", "laplace-transform");
const PKG_H_RESPONSE_CONTROL = refs("inverse-laplace", "transfer-impulse-response", "circuits-control-stability");
const PKG_I_MANY_VARIABLES = refs("partial-derivatives-gradient", "multiple-integrals", "change-of-variables-jacobian");
const PKG_J_FIELDS = refs("vector-fields-line-integrals", "circulation-flux", "divergence-curl");
const PKG_K_BOUNDARY_THEOREMS = refs("greens-theorem", "surface-integrals", "stokes-theorem", "divergence-theorem");

/** `radians-rotation` is a hard `requires` for L7 and L12; the other bridge is conditional. */
const ENTRY_BRIDGE_REQUIRED = refs("radians-rotation");
const ENTRY_BRIDGE_CONDITIONAL = refs("functions-graphs-bridge");

// Linear algebra.
const LA_CORE = refs("why-linear-algebra", "vectors", "transformations", "systems", "elimination", "solution-sets", "matrix-composition", "determinants", "subspaces-rank", "rank-nullity", "change-of-basis", "eigenvectors");
const LA_GEOMETRY_DATA = refs("orthogonality", "least-squares", "svd");

/**
 * The LA lessons an applied pathway genuinely needs: the five that `edges.ts`
 * marks as hard cross-course prerequisites (`vectors`, `transformations`,
 * `matrix-composition`, `determinants`, `eigenvectors`), **closed under their
 * own LA prerequisites** — which pulls in `why-linear-algebra`, `systems` and
 * `change-of-basis` as well.
 *
 * Computed, not guessed: the closure test in `__tests__/pathways.test.ts`
 * rejected the naive five-lesson list. `elimination`, `solution-sets`,
 * `subspaces-rank` and `rank-nullity` are deliberately absent — nothing on the
 * applied route hard-requires them, which is exactly the kind of saving a
 * "shortest viable route" is supposed to find.
 */
const LA_PREREQS_FOR_APPLIED = refs(
  "why-linear-algebra",
  "vectors",
  "transformations",
  "systems",
  "matrix-composition",
  "determinants",
  "change-of-basis",
  "eigenvectors",
);

const ALGORITHMS = refs("karatsuba", "binary-search-trees", "red-black-trees");

/* ------------------------------------------------------------------------ */

export const PATHWAYS: readonly Pathway[] = [
  {
    id: "applied-stem",
    title: "Applied mathematics for science and engineering",
    goal: "Model change, accumulation, oscillation and fields — and solve the equations that describe them.",
    audience: "Science and engineering students who need the whole applied arc, not one branch of it.",
    // The complete spine: this is what the course called "Applied Mathematics"
    // actually was, now expressed as a traversal instead of a container.
    requiredNodeIds: [
      ...LA_PREREQS_FOR_APPLIED,
      ...ENTRY_BRIDGE_REQUIRED,
      ...PKG_A_CALCULUS_FOUNDATIONS,
      ...PKG_B_CALCULUS_TECHNIQUE,
      ...PKG_C_SERIES,
      ...PKG_D_COMPLEX_OSCILLATION,
      ...PKG_E_PROJECTION_SPECTRA,
      ...PKG_F_SIGNALS,
      ...PKG_G_DIFFERENTIAL_EQUATIONS,
      ...PKG_H_RESPONSE_CONTROL,
      ...PKG_I_MANY_VARIABLES,
      ...PKG_J_FIELDS,
      ...PKG_K_BOUNDARY_THEOREMS,
    ],
    optionalNodeIds: [...ENTRY_BRIDGE_CONDITIONAL, ...ALGORITHMS],
  },
  {
    id: "ee-signals",
    title: "Signals, systems and control",
    goal: "Read a signal in the frequency domain, filter it, sample it, and analyse the stability of the system it drives.",
    audience: "Electrical and computer engineers heading for signal processing or control.",
    // Packages A→H: the roadmap calls H "Circuits and control — the
    // engineering payoff", and E/F/G/H are exactly the transform-and-response
    // chain. I/J/K (multivariable, fields, boundary theorems) are not on the
    // path to that goal, so they are enrichment rather than route.
    requiredNodeIds: [
      ...LA_PREREQS_FOR_APPLIED,
      ...ENTRY_BRIDGE_REQUIRED,
      ...PKG_A_CALCULUS_FOUNDATIONS,
      ...PKG_B_CALCULUS_TECHNIQUE,
      ...PKG_C_SERIES,
      ...PKG_D_COMPLEX_OSCILLATION,
      ...PKG_E_PROJECTION_SPECTRA,
      ...PKG_F_SIGNALS,
      ...PKG_G_DIFFERENTIAL_EQUATIONS,
      ...PKG_H_RESPONSE_CONTROL,
    ],
    // `karatsuba` is optional-but-pointed: the FFT is the same
    // "do the shared sub-work once" move (a `same-structure-as` edge).
    optionalNodeIds: [
      ...ENTRY_BRIDGE_CONDITIONAL,
      ...refs("karatsuba"),
      ...PKG_I_MANY_VARIABLES,
    ],
  },
  {
    id: "cs-algorithms",
    title: "Algorithmic thinking",
    goal: "Design and analyse algorithms — and recognise when a clever decomposition changes the exponent, not just the constant.",
    audience: "Computer science students who want the reasoning behind the running time, not a catalogue of algorithms.",
    // The Algorithms course is the whole required route today; it is
    // deliberately outside the LA dependency graph (curriculum-architecture
    // §2.1: "karatsuba has no prerequisite edge into the LA graph").
    requiredNodeIds: [...ALGORITHMS],
    // The documented cross-course payoff: karatsuba --same-structure-as--> dft-fft.
    // Reaching `dft-fft` honestly requires the chain that leads to it, so the
    // optional set carries that chain rather than the destination alone.
    optionalNodeIds: [
      ...LA_PREREQS_FOR_APPLIED,
      ...PKG_A_CALCULUS_FOUNDATIONS,
      ...PKG_C_SERIES,
      ...PKG_D_COMPLEX_OSCILLATION,
      ...PKG_E_PROJECTION_SPECTRA,
      ...PKG_F_SIGNALS,
    ],
  },
  {
    id: "math-major",
    title: "Mathematics major",
    goal: "Build the structural core — linear algebra in full, the analysis behind calculus, and the boundary theorems as one statement in three costumes.",
    audience: "Mathematics students who want the general statement and the argument for it, not only the computation.",
    // LA in full (including the geometry/data arc), the analysis trunk, and
    // I/J/K — which the roadmap calls "Theme 1 completed. The course's
    // capstone", i.e. the general form of the FTC. The transform branch
    // (D/E/F/G/H) is real mathematics but not on the route to that capstone.
    requiredNodeIds: [
      ...LA_CORE,
      ...LA_GEOMETRY_DATA,
      // `substitution-parts` hard-requires it (trig antiderivatives), so the
      // bridge is on the route even for a proof-oriented reader.
      ...ENTRY_BRIDGE_REQUIRED,
      ...PKG_A_CALCULUS_FOUNDATIONS,
      ...PKG_B_CALCULUS_TECHNIQUE,
      ...PKG_C_SERIES,
      ...PKG_I_MANY_VARIABLES,
      ...PKG_J_FIELDS,
      ...PKG_K_BOUNDARY_THEOREMS,
    ],
    optionalNodeIds: [
      ...PKG_D_COMPLEX_OSCILLATION,
      ...PKG_E_PROJECTION_SPECTRA,
      ...PKG_G_DIFFERENTIAL_EQUATIONS,
      ...ALGORITHMS,
    ],
  },
];

const PATHWAYS_BY_ID = new Map(PATHWAYS.map((p) => [p.id, p]));

export function getPathway(id: string): Pathway | undefined {
  return PATHWAYS_BY_ID.get(id);
}

/** Every node a pathway touches, required first. */
export function pathwayNodes(pathway: Pathway): readonly LessonRef[] {
  return [...pathway.requiredNodeIds, ...pathway.optionalNodeIds];
}
