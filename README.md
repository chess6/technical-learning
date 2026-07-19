# Linear Algebra — Visual Learning POC

Desktop-first browser POC for learning linear algebra through guided animations and interactive diagrams.

## Status

**Milestone 3 complete** — shared pure math layer, immutable example registry, and
Mafs exploration foundation with a technical demo at `/dev/mafs-demo`.
Details: [docs/m3-math-and-mafs.md](docs/m3-math-and-mafs.md).

Milestone 2 delivered Motion Canvas embedding behind `GuidedSceneEngine`
([docs/motion-canvas-spike.md](docs/motion-canvas-spike.md)).

Later milestones implement the four full lessons, accessibility polish, and
final documentation.

## Commands

```bash
npm install
npm run dev            # dev server at http://localhost:5173
npm run build          # typecheck + production build
npm run lint           # oxlint
npm run test           # Vitest unit tests
npm run test:e2e       # Playwright browser tests (installs: npx playwright install chromium)
```

## Architecture (layers)

| Layer | Path | Responsibility |
| --- | --- | --- |
| Pure math | `src/math/` | Vectors, matrices, interpolation, 2×2 eigen analysis |
| Shared examples | `src/math/examples.ts` | Immutable presets; lookup by id from guided + interactive scenes |
| Guided animations | `src/guided-scenes/` | Motion Canvas engines/scenes |
| Explorations | `src/explorations/` | Mafs interactive diagrams |
| Lesson UI | `src/components/lesson/` | Layout orchestration |

Guided and interactive scenes must consume the same example ids — never duplicate matrix constants.

## Guided animation

- `GuidedSceneEngine` + `MotionCanvasEngine` (active) / `SvgFallbackEngine`
- Flip `ACTIVE_BACKEND` in `src/guided-scenes/engine/index.ts` to switch backends

## Mafs technical demo

- Route: `/dev/mafs-demo`
- Shared example `shear-2-1`, draggable input, matrix sliders, determinant readout, reset

## Lessons (content placeholders until M4+)

1. Vectors and Linear Combinations — `/lesson/vectors`
2. Matrices as Linear Transformations — `/lesson/transformations`
3. Determinants as Signed Area Scaling — `/lesson/determinants`
4. Eigenvectors and Eigenvalues — `/lesson/eigenvectors`
