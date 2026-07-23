# Architecture

A short map of the code layers and where their contracts are documented. The
authoritative details live in code and in the sibling docs linked below; this page
exists so a new reader can orient before diving in.

## Layers (keep the boundaries)

| Layer | Path | Responsibility |
| --- | --- | --- |
| Pure math | `src/math/` | Vectors, matrices, interpolation, 2×2 eigen analysis. No React/Mafs/Motion Canvas; no `mathjs` in production. **The only source of truth for linear algebra.** |
| Shared examples | `src/math/examples.ts`, `src/lessons/exampleData.ts` | Immutable matrix/vector presets, referenced by id — never duplicated between guided and interactive code. |
| Guided animations | `src/guided-scenes/` | Motion Canvas scenes behind `GuidedSceneEngine`. React passes a `guidedSceneId` only. |
| Explorations | `src/explorations/` | Mafs interactive diagrams + `registry.tsx`; reuse `MafsSceneShell`, controls, toggles, readouts. |
| Lessons | `src/lessons/` | Typed `LessonDefinition`s, grading, registry — no per-lesson branching in the shell. |
| Lesson UI | `src/components/lesson/`, `LessonPage`, `LessonLayout` | Registry-driven orchestration. |

Guided and interactive scenes must consume the **same example ids** and the same
`src/math` utilities. Neither Motion Canvas nor Mafs is a general-purpose UI
framework; their responsibilities are deliberately kept separate (see
[../authoring/lesson-design.md](../authoring/lesson-design.md)).

## Contracts and conventions

- **Platform contracts** (learner state, identity, capabilities):
  [platform-contracts.md](platform-contracts.md).
- **Math space vs. screen space** (coordinate/y-flip conventions):
  [math-space-conventions.md](math-space-conventions.md).
- **Mathematical correctness** (source of truth, packing, invariants):
  [math-correctness.md](math-correctness.md) + the layering rule in
  [project-core](../../.cursor/rules/project-core.mdc).

## Key decisions

- [decisions/001-motion-canvas-runtime.md](decisions/001-motion-canvas-runtime.md)
  — why Motion Canvas is embedded plugin-free behind `GuidedSceneEngine`.

## Lazy loading

Motion Canvas, Mafs, and KaTeX are all large and never load on the home page.
`LessonPage` is route-lazy; each guided scene and each explorer is its own dynamic
import, fetched only when a learner opens the lesson that needs it.
