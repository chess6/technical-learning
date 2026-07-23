# Mathematical correctness conventions

Authoritative conventions for the linear algebra visualization POC.
All geometry shown to learners must obey these rules. Implementation lives in
`src/math/`; renderers only map already-correct math coordinates to the screen.

For how these conventions surface in lessons (notation, semantic roles,
guided-to-interactive continuity), see [authoring/lesson-design.md](../authoring/lesson-design.md).
This document remains the source of truth for the underlying mathematics.

## Matrix convention

Matrices act on **column vectors**.

\[
A =
\begin{bmatrix}
a_{11} & a_{12} \\
a_{21} & a_{22}
\end{bmatrix},
\quad
\begin{bmatrix} x' \\ y' \end{bmatrix}
=
\begin{bmatrix}
a_{11} x + a_{12} y \\
a_{21} x + a_{22} y
\end{bmatrix}
\]

In code: `matrixVectorMultiply(A, [x, y])`.

- First column = \(A\mathbf{e}_1 = (a_{11}, a_{21})\) — use `matrixColumn(A, 0)` or `matrixVectorMultiply(A, [1, 0])`.
- Second column = \(A\mathbf{e}_2 = (a_{12}, a_{22})\) — use `matrixColumn(A, 1)` or `matrixVectorMultiply(A, [0, 1])`.

**Screen-coordinate conversion must occur only after mathematical coordinates are computed.** Never fold y-flip or pixel scale into the linear map.

## Grid transformation

A transformed grid is produced by applying \(A\) to mathematical grid points or
line **endpoints** (`transformedGridSegments`). Do not invent slopes from matrix
rows or from a separate packing into a third-party transform API.

Invariants (`src/math/invariants.ts`):

- Transformed **constant-\(y\)** lines (identity-space horizontal) are parallel to \(A\mathbf{e}_1\).
- Transformed **constant-\(x\)** lines (identity-space vertical) are parallel to \(A\mathbf{e}_2\).
- Lattice point \((m, n)\) maps to \(m\,A\mathbf{e}_1 + n\,A\mathbf{e}_2\).

In segment metadata, `kind: "horizontal"` / `"vertical"` refers to the **identity-space** line, not the screen appearance after \(A\).

## Vector conventions

- Vectors are `readonly [x, y]` (`Vector2`).
- The zero vector has no well-defined direction: `normalizeVector` returns `null`.
- `areParallel` treats the zero vector as parallel to every vector (degenerate).
- Parallel includes antiparallel (scalar multiple of either sign).
- Default numeric tolerance: `DEFAULT_TOLERANCE = 1e-9` (`src/math/types.ts`). Eigenpair checks often use `1e-6`.

## Determinant conventions

- Area of the image of the unit square equals \(|\det(A)|\`.
- Sign of \(\det(A)\) records orientation (negative ⇒ reflection / orientation reversal).
- \(|\det(A)|\) approximately zero means dimensional collapse (singular).
- Use `determinant2x2` and `assertUnitSquareAreaMatchesDeterminant`.

## Eigen conventions

- The zero vector is **never** an eigenvector.
- Displayed eigenpairs must satisfy \(A\mathbf{v} \approx \lambda\mathbf{v}\) (`verifiesEigenpair` / `assertEigenpair`).
- A repeated eigenvalue does **not** imply two independent eigenvectors.
- Scalar matrices (\(A = \lambda I\)) and defective matrices are different kinds in `analyzeEigen2x2` — do not invent a second basis vector for defective cases.
- Complex / no-real-eigenvector cases must not fabricate real directions.

## 3×3 curated extension (eigenvectors lesson only)

A genuine 3D extension may use **one** curated \(3\times 3\) example with a
**declared** real eigenvalue — not a general cubic eigen solver.

Current example (`EIGEN_3D_EXTENSION_EXAMPLE` in `src/math/examples3.ts`):

\[
A = 1.5\,P,\quad
P=\begin{bmatrix}0&0&1\\1&0&0\\0&1&0\end{bmatrix}
\]

- Unique real eigenvalue \(\lambda=1.5\) with eigendirection along \((1,1,1)/\sqrt{3}\).
- Characteristic polynomial (authored as data):
  \(\chi_A(t)=(t-1.5)(t^2+1.5t+2.25)\). Quadratic discriminant
  \(1.5^2-4(2.25)=-6.75<0\) proves the other roots are a complex conjugate pair —
  so the scene must expose **exactly one** real eigendirection.
- **Single application** of \(A\): a generic vector rotates \(120^\circ\) about the
  invariant axis and scales by \(1.5\). Do **not** call this a spiral.
- **Repeated applications** \(x, Ax, A^2x, \ldots\) trace an outward spiral; the
  initial 3D scene need not animate that.
- Under \(A-\lambda I\) (rank 2) the unit cube collapses **to a plane**. Collapse
  dimension must match `rank` / nullspace (plane / line / origin) — never hardcode
  "to a plane" as a general rule, and never imply \(A\) itself crushes the
  eigenvector. Precise wording for the auxiliary map:

  > Under \(A-\lambda I\), at least one nonzero direction is sent to zero. The
  > transformed unit cube therefore has zero volume, so \(\det(A-\lambda I)=0\).

Helpers live in `src/math/matrices3.ts` and `src/math/eigen3.ts`. Renderers must
not reimplement 3D linear algebra.

## Rendering rule

**All mathematical geometry must be derived from tested functions in `src/math`.**
Rendering code (Mafs, Motion Canvas, SVG fallback) may map mathematical
coordinates to screen coordinates, but must **not** reimplement linear algebra
(matrix–vector products, determinants, eigen checks, grid endpoint maps).

Prefer explicit endpoint transforms over opaque third-party matrix packs when
those packs have a different layout than this project’s row-major \(2\times2\).

## Visual interpolation

Identity→\(A\) scrubbing (`lerpIdentityToMatrix`) is an **educational visual
transition**, not a claim about matrix factorizations or continuous paths in
\(\mathrm{GL}(2)\). Label it as a transition; do not imply it is the unique or
physically meaningful path between \(I\) and \(A\).

## Correctness checklist (every new visualization)

- [ ] Formula verified against this document
- [ ] Shared `src/math` utility used (no duplicated arithmetic in the renderer)
- [ ] Independent hand calculation checked for at least one asymmetric matrix
- [ ] Asymmetric diagnostic matrix tested (`diagnostic-asymmetric` / `[[1,2],[3,4]]`)
- [ ] Singular and other edge cases tested where relevant
- [ ] Labels agree with numeric readouts
- [ ] Regression / invariant tests added
- [ ] Screen-coordinate conversion checked separately from the math map

Also complete [quality/lesson-correctness-checklist.md](../quality/lesson-correctness-checklist.md)
when shipping a lesson surface, and log bugs in [quality/known-failure-modes.md](../quality/known-failure-modes.md).
