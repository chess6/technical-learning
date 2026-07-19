# Mathematical correctness conventions

Authoritative conventions for the linear algebra visualization POC.
All geometry shown to learners must obey these rules. Implementation lives in
`src/math/`; renderers only map already-correct math coordinates to the screen.

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

Also complete [LESSON_CORRECTNESS_CHECKLIST.md](./LESSON_CORRECTNESS_CHECKLIST.md)
when shipping a lesson surface, and log bugs in [ERROR_LOG.md](./ERROR_LOG.md).
