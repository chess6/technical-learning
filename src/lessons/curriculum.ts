/**
 * Course structure for the sidebar table of contents.
 * Lesson ids resolve through the existing lesson registry — no branching.
 *
 * This encodes the full **linear-algebra course spine** (Chapter 0 + Lessons
 * 1–14), not just the built vertical slice. Lessons that exist today are
 * `lesson` refs (resolved via the registry); lessons still to be authored are
 * `future` nodes placed in their correct spine position, each carrying a
 * one-line central insight. The authoritative spine — central insights,
 * ordering rationale, and application threads — lives in
 * `docs/LINEAR_ALGEBRA_COURSE_SPINE.md`.
 *
 * Note (POC, positional numbering): sidebar badges number the *built* lessons,
 * while the spine positions (L1…L14) are the authoritative sequence. See
 * `docs/MULTI_DOMAIN_CURRICULUM_ARCHITECTURE.md` for why numbering is positional
 * against the registry today and how a path-aware model would replace it.
 */

export type CourseNavItem =
  | {
      kind: "lesson";
      lessonId: string;
    }
  | {
      kind: "future";
      id: string;
      title: string;
      /** One-line central insight, shown as a hint for an upcoming lesson. */
      subtitle?: string;
    };

export type CourseSection = {
  id: string;
  title: string;
  items: readonly CourseNavItem[];
};

export const COURSE_SECTIONS: readonly CourseSection[] = [
  {
    id: "foundations",
    title: "Foundations",
    items: [
      // Chapter 0 — Why linear algebra?
      { kind: "lesson", lessonId: "why-linear-algebra" },
      // Lesson 1 — Vectors, combinations, span, basis, coordinates.
      { kind: "lesson", lessonId: "vectors" },
      // Lesson 2 — Linear transformations and the columns rule.
      { kind: "lesson", lessonId: "transformations" },
    ],
  },
  {
    id: "systems-elimination",
    title: "Systems & elimination",
    items: [
      // Lesson 3 — Linear systems: row and column pictures.
      { kind: "lesson", lessonId: "systems" },
      // Lesson 4 — Elimination as reversible constraint manipulation.
      {
        kind: "future",
        id: "elimination",
        title: "Elimination as Reversible Constraint Manipulation",
        subtitle: "Replace a system with an easier one having the same solutions",
      },
      // Lesson 5 — Solution sets and homogeneous systems.
      {
        kind: "future",
        id: "solution-sets",
        title: "Solution Sets & Homogeneous Systems",
        subtitle: "Particular solution + null directions; affine vs linear",
      },
    ],
  },
  {
    id: "maps-inverses-determinants",
    title: "Composition, inverses & determinants",
    items: [
      // Lesson 6 — Matrix composition and inverses.
      {
        kind: "future",
        id: "matrix-composition",
        title: "Matrix Composition & Inverses",
        subtitle: "Apply B then A; why order matters; undoing a map",
      },
      // Lesson 7 — Determinants (invertibility detector).
      { kind: "lesson", lessonId: "determinants" },
    ],
  },
  {
    id: "structure",
    title: "Structure of linear maps",
    items: [
      // Lesson 8 — Subspaces, column space, null space, rank.
      {
        kind: "future",
        id: "subspaces-rank",
        title: "Subspaces, Column Space, Null Space, Rank",
        subtitle: "Column space controls outputs; null space controls uniqueness",
      },
      // Lesson 9 — Dimension and rank–nullity.
      {
        kind: "future",
        id: "rank-nullity",
        title: "Dimension & Rank–Nullity",
        subtitle: "Input dimensions either survive or collapse into the null space",
      },
      // Lesson 10 — Change of basis.
      {
        kind: "future",
        id: "change-of-basis",
        title: "Change of Basis",
        subtitle: "Same vector, different coordinates — the early payoff",
      },
    ],
  },
  {
    id: "spectra-geometry-data",
    title: "Spectra, geometry & data",
    items: [
      // Lesson 11 — Eigenvectors and diagonalization.
      { kind: "lesson", lessonId: "eigenvectors" },
      // Lesson 12 — Orthogonality and projections.
      {
        kind: "future",
        id: "orthogonality",
        title: "Orthogonality & Projections",
        subtitle: "Dot product, complements, projection, Gram–Schmidt",
      },
      // Lesson 13 — Least squares.
      {
        kind: "future",
        id: "least-squares",
        title: "Least Squares",
        subtitle: "Best fit when the system has no exact solution",
      },
      // Lesson 14 — Singular value decomposition (capstone).
      {
        kind: "future",
        id: "svd",
        title: "Singular Value Decomposition",
        subtitle: "Rotate, scale, rotate — rank, geometry, and data compression",
      },
    ],
  },
  {
    id: "algorithms",
    title: "Algorithms & complexity",
    items: [{ kind: "lesson", lessonId: "karatsuba" }],
  },
];
