# Linear Algebra — Visual Learning POC

Desktop-first browser POC for learning linear algebra through guided animations and interactive diagrams.

## Status

**Milestone 6 complete** — production polish, performance, and release
readiness: route/scene/explorer-level lazy loading (home page no longer
loads Motion Canvas, Mafs, or KaTeX), production gating of dev-only routes,
error boundaries with learner-facing retry, a polished home page, and a
responsive/accessibility/consistency pass across all four lessons. Details:
[docs/archive/milestones/m6-release-polish.md](docs/archive/milestones/m6-release-polish.md).

**Milestone 5 complete** — the Determinants as Signed Area Scaling and
Eigenvectors and Eigenvalues lessons are fully implemented with guided scenes,
Mafs explorers, deterministic practice, and shared math/examples. Details:
[docs/archive/milestones/m5-lessons.md](docs/archive/milestones/m5-lessons.md).

**Milestone 4.5 complete** — visual, layout, and learning-experience refinement
of Lessons 1–2 (sidebar TOC, autoplay, safe-frame clipping fix, KaTeX prose,
learner-facing player controls, progressive disclosure). Details:
[docs/archive/milestones/m45-refinement.md](docs/archive/milestones/m45-refinement.md) and
[docs/archive/milestones/visual-design-refinement.md](docs/archive/milestones/visual-design-refinement.md).

**Milestone 4 complete** — Lessons 1 (Vectors and Linear Combinations) and 2
(Matrices as Linear Transformations) are fully implemented: guided Motion Canvas
scenes, Mafs explorations, KaTeX equations, deterministic exercises, and a
motivating-question → guide → checkpoint → explore → exercise → takeaway flow.
Details: [docs/archive/milestones/m4-lessons.md](docs/archive/milestones/m4-lessons.md).

Earlier milestones: shared pure math layer + Mafs foundation
([docs/archive/milestones/m3-math-and-mafs.md](docs/archive/milestones/m3-math-and-mafs.md)) and Motion Canvas
embedding behind `GuidedSceneEngine`
([docs/archive/experiments/motion-canvas-spike.md](docs/archive/experiments/motion-canvas-spike.md)).

## Commands

Convenience scripts (preferred):

```bash
./setup.sh          # npm install + Playwright Chromium
./start.sh          # background Vite at http://127.0.0.1:5173
./stop.sh           # stop that server
./status.sh         # is it running?
./check.sh          # lint + typecheck + unit tests
./check.sh --e2e    # same + Playwright
./test.sh           # unit tests
./test.sh e2e       # browser tests (pass extra paths after)
./build.sh          # production build → dist/
./preview.sh        # serve dist locally
```

Equivalent npm commands:

```bash
npm install
npm run dev            # foreground; http://localhost:5173
npm run build          # typecheck + production build
npm run lint           # oxlint
npm run test           # Vitest unit tests
npm run test:e2e       # Playwright (browsers: npx playwright install chromium)
```

## Architecture (layers)


| Layer               | Path                                                   | Responsibility                                                         |
| ------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| Pure math           | `src/math/`                                            | Vectors, matrices, interpolation, 2×2 eigen analysis                   |
| Shared examples     | `src/math/examples.ts`                                 | Immutable matrix presets; lookup by id                                 |
| Lesson example data | `src/lessons/exampleData.ts`                           | Shared vectors/coefficients/presets used by guided + interactive modes |
| Guided animations   | `src/guided-scenes/`                                   | Motion Canvas engines/scenes behind `GuidedSceneEngine`                |
| Explorations        | `src/explorations/`                                    | Mafs interactive diagrams + registry                                   |
| Equations           | `src/components/lesson/EquationBlock.tsx`              | KaTeX rendering of trusted static TeX                                  |
| Lesson content      | `src/lessons/`                                         | Typed lesson definitions, grading, registry                            |
| Lesson UI           | `src/components/lesson/`, `LessonPage`, `LessonLayout` | Registry-driven orchestration (no per-lesson branching)                |


Guided and interactive scenes must consume the same example ids — never duplicate constants.

### Why Motion Canvas and Mafs have separate roles

Motion Canvas drives the **guided, read-only** animation (deliberate pacing,
staged reveals, one conceptual change at a time — see [authoring/lesson-design.md](docs/authoring/lesson-design.md#motion-canvas-responsibilities)).
Mafs drives the **learner-controlled** exploration (draggable vectors,
sliders, immediate feedback). Both consume the same `src/math` utilities and
the same example data, but neither is a general-purpose UI framework, so
mixing their responsibilities is deliberately avoided.

### Lazy loading

Both libraries are large, so neither loads on the home page. `LessonPage` is
route-lazy; each guided scene module (`src/guided-scenes/scenes/sceneDescriptions.ts`)
and each interactive explorer (`src/explorations/registry.tsx`) is its own
dynamic import, fetched only when a learner opens the lesson that needs it.
See [docs/archive/milestones/m6-release-polish.md](docs/archive/milestones/m6-release-polish.md) for before/after
bundle sizes and the full M6 write-up.

## Project standards

Read these before adding or changing lessons or math visualizations:

- **Lesson design:** [docs/authoring/lesson-design.md](docs/authoring/lesson-design.md) — pedagogy, flow, notation, visual language, anti-patterns.
- **Visual system:** [docs/archive/milestones/visual-design-refinement.md](docs/archive/milestones/visual-design-refinement.md) — light-first palette & tokens, typography roles, six-phase hierarchy, guided/explorer/exercise presentation (Lesson 1 is the reference).
- **M5 lessons:** [docs/archive/milestones/m5-lessons.md](docs/archive/milestones/m5-lessons.md) — determinants and eigenvectors.
- **M6 release polish:** [docs/archive/milestones/m6-release-polish.md](docs/archive/milestones/m6-release-polish.md) — bundle sizes, code splitting, dev-route gating, accessibility/responsive audits.
- **Lesson template:** [docs/authoring/templates/lesson-plan.md](docs/authoring/templates/lesson-plan.md) — fill-in planning template.
- **Mathematical conventions:** [docs/engineering/math-correctness.md](docs/engineering/math-correctness.md).
- **Error log / prevention:** [docs/quality/known-failure-modes.md](docs/quality/known-failure-modes.md).
- **Lesson checklist:** [docs/quality/lesson-correctness-checklist.md](docs/quality/lesson-correctness-checklist.md).

Notation uses conventional symbols: standard basis \(\mathbf{e}_1, \mathbf{e}_2\);
bold vectors \(\mathbf{v}, \mathbf{w}\); matrix \(A\). Keep basic accessibility
(labels, focus, readouts, reduced-motion autoplay); full disability-product work
is out of scope (see authoring/lesson-design.md).

## Guided animation

- `GuidedSceneEngine` + `MotionCanvasEngine` (active) / `SvgFallbackEngine`
- Scenes are registered by id in `src/guided-scenes/scenes/` (metadata in
`sceneMeta.ts`, descriptions in `sceneDescriptions.ts`); the sceneId is passed
through the engine, so lesson data and React never touch Motion Canvas.
- Flip `ACTIVE_BACKEND` in `src/guided-scenes/engine/index.ts` to switch backends.

## Adding a guided scene and explorer

1. **Scene:** add durations to `sceneTimings.ts`, metadata to `sceneMeta.ts`,
  a `makeScene2D` module under `scenes/`, and register it in
   `sceneDescriptions.ts`. Set the lesson's `guidedSceneId`.
2. **Explorer:** build a component under `src/explorations/` (reuse
  `MafsSceneShell`, `ParameterControls`, `ExplorationToggles`, `PresetPicker`,
   `SceneReadout`, `ResetButton`) and register it in `explorations/registry.tsx`.
   Set the lesson's `explorationId`.

## Lessons

Built lessons, in registry order (the sidebar numbers the built lessons
positionally; the authoritative L1–L14 spine lives in
[docs/courses/linear-algebra/course-spine.md](docs/courses/linear-algebra/course-spine.md)):

- Chapter 0. Why Linear Algebra? — `/lesson/why-linear-algebra` (intro)
1. Vectors, Linear Combinations, and Basis — `/lesson/vectors`
2. Matrices as Linear Transformations — `/lesson/transformations`
3. Linear Systems: Two Pictures of One Equation — `/lesson/systems`
4. Determinants as Signed Area Scaling — `/lesson/determinants`
5. Eigenvectors and Eigenvalues — `/lesson/eigenvectors`
6. Karatsuba: three multiplications instead of four — `/lesson/karatsuba`

Dev-only Motion Canvas spike: `/dev/transform-spike` (explicit id only — never
a silent fallback). Development-only; excluded from production route tables
and builds via `import.meta.env.DEV` (see `src/app/routes.tsx` and
[docs/archive/milestones/m6-release-polish.md](docs/archive/milestones/m6-release-polish.md)).

`mathjs` is a **dev-only** dependency (cross-check tests); no production module imports it.