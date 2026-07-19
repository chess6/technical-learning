# Linear Algebra — Visual Learning POC

Desktop-first browser POC for learning linear algebra through guided animations and interactive diagrams.

## Status

**Milestone 4.5 complete** — visual, layout, and learning-experience refinement
of Lessons 1–2 (sidebar TOC, autoplay, safe-frame clipping fix, KaTeX prose,
learner-facing player controls, progressive disclosure). Details:
[docs/m45-refinement.md](docs/m45-refinement.md).

**Milestone 4 complete** — Lessons 1 (Vectors and Linear Combinations) and 2
(Matrices as Linear Transformations) are fully implemented: guided Motion Canvas
scenes, Mafs explorations, KaTeX equations, deterministic exercises, and a
motivating-question → guide → checkpoint → explore → exercise → takeaway flow.
Details: [docs/m4-lessons.md](docs/m4-lessons.md).

Earlier milestones: shared pure math layer + Mafs foundation
([docs/m3-math-and-mafs.md](docs/m3-math-and-mafs.md)) and Motion Canvas
embedding behind `GuidedSceneEngine`
([docs/motion-canvas-spike.md](docs/motion-canvas-spike.md)).

Lessons 3 (determinants) and 4 (eigenvectors) remain placeholders for later
milestones.

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
| Shared examples | `src/math/examples.ts` | Immutable matrix presets; lookup by id |
| Lesson example data | `src/lessons/exampleData.ts` | Shared vectors/coefficients/presets used by guided + interactive modes |
| Guided animations | `src/guided-scenes/` | Motion Canvas engines/scenes behind `GuidedSceneEngine` |
| Explorations | `src/explorations/` | Mafs interactive diagrams + registry |
| Equations | `src/components/lesson/EquationBlock.tsx` | KaTeX rendering of trusted static TeX |
| Lesson content | `src/lessons/` | Typed lesson definitions, grading, registry |
| Lesson UI | `src/components/lesson/`, `LessonPage`, `LessonLayout` | Registry-driven orchestration (no per-lesson branching) |

Guided and interactive scenes must consume the same example ids — never duplicate constants.

**Mathematical conventions:** [docs/MATH_CORRECTNESS.md](docs/MATH_CORRECTNESS.md).  
**Error log / prevention:** [docs/ERROR_LOG.md](docs/ERROR_LOG.md).  
**Lesson checklist:** [docs/LESSON_CORRECTNESS_CHECKLIST.md](docs/LESSON_CORRECTNESS_CHECKLIST.md).

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

1. Vectors and Linear Combinations — `/lesson/vectors` (complete)
2. Matrices as Linear Transformations — `/lesson/transformations` (complete)
3. Determinants as Signed Area Scaling — `/lesson/determinants` (placeholder)
4. Eigenvectors and Eigenvalues — `/lesson/eigenvectors` (placeholder)

`mathjs` is a **dev-only** dependency (cross-check tests); no production module imports it.
