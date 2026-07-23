# Milestone 3 — Shared Math & Mafs Foundation

## Responsibilities

| Layer | Path | Role |
| --- | --- | --- |
| Pure math | `src/math/` | Vectors, matrices, interpolation, 2×2 eigen analysis. No React, Mafs, Motion Canvas, or DOM. |
| Shared examples | `src/math/examples.ts` | Immutable matrix/vector presets looked up by id. Both guided scenes and explorations consume these — never duplicate constants. |
| Explorations | `src/explorations/` | Mafs interactive diagrams, local control state, readouts. |
| Lesson React components | `src/components/lesson/` | Orchestration shells (`ExplorationPanel`, etc.). |
| Guided scenes | `src/guided-scenes/` | Motion Canvas animations. Import shared examples/math; never import explorations. |

## Shared example consumption

```ts
import { requireMatrixExample, matrixVectorMultiply } from "../math";

const example = requireMatrixExample("shear-2-1");
const image = matrixVectorMultiply(example.matrix, example.inputVector!);
```

The Motion Canvas spike scene reads `shear-2-1` via `spikeConstants.ts`, so the guided animation and the Mafs demo use the same matrix `[[2, 1], [0, 1]]`.

## Eigen-analysis edge cases

`analyzeEigen2x2` returns an explicit tagged union:

- `distinct-real` — two eigenpairs
- `repeated-real` — one eigenvalue; `diagonalizable: true` only when A ≈ λI (full-plane eigenspace). Defective matrices get **one** basis vector and `diagonalizable: false` — a second independent eigenvector is never invented.
- `complex` — no real eigenvectors (e.g. 90° rotation); reports real part and |Im(λ)|

Near-zero discriminants use a configurable tolerance.

## How to add a new matrix preset

1. Append an entry to `MATRIX_EXAMPLES` in `src/math/examples.ts` with a unique `id`, `title`, `description`, `matrix`, and optional `inputVector`.
2. Optionally add the id to `TRANSFORM_PRESETS`, `EIGEN_PRESETS`, or `DETERMINANT_PRESETS`.
3. Extend the required-id list in `src/math/__tests__/examples.test.ts`.
4. Look the example up with `requireMatrixExample("your-id")` from guided scenes and explorations.

## Technical demo

Development route: [`/dev/mafs-demo`](/dev/mafs-demo)

Demonstrates shared example data, a draggable input vector, matrix-entry sliders, a dashed transformed vector computed by `matrixVectorMultiply`, determinant readout, reset, and responsive layout. This is **not** a full lesson.

## Packages

- `mafs@0.21.0`
- `mathjs` — cross-validation in tests only; core 2×2 ops remain explicit
- `katex` — installed for upcoming equation rendering; not wired in M3
