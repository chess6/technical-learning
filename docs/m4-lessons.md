# M4 — Lessons 1 & 2 Implementation Note

Milestone 4 turns the first two lesson placeholders into complete teaching
experiences. Lessons 3 (determinants) and 4 (eigenvectors) are intentionally
still placeholders.

## Lesson structure

Every lesson definition (`src/lessons/*.ts`, typed by `LessonDefinition`) drives a
fixed pedagogical flow rendered by `LessonPage` + `LessonLayout` with **no
per-lesson branching** — the page reads the typed data and resolves scenes and
explorers from registries:

1. **Motivating question** (`motivatingQuestion`) — a prediction to set up the idea.
2. **Guided visual explanation** — `sections[]` (concise text + KaTeX equation +
   key observation) beside the guided Motion Canvas scene.
3. **Conceptual checkpoint** (`checkpoint`) — a short question with a reveal.
4. **Interactive exploration** — the Mafs explorer for `explorationId`.
5. **Exercises** (`exercises[]`) — at least two deterministic, auto-graded items.
6. **Key takeaway** (`keyTakeaway`) + learning objectives.

## Guided-to-interactive learning flow

The guided scene is a **read-only** choreographed Motion Canvas animation
(progressive disclosure: one object at a time, dimming, equation text synced to
the geometry, meaningful pauses, no decorative looping). The learner then takes
over the **same numbers** in a learner-controlled Mafs exploration. Guided and
interactive modes never diverge because both import the shared example data.

- **Lesson 1** — plane → draw **v** → components → **w** → head-to-tail addition
  → scalar multiples (stretch/shrink/flip) → `a·v + b·w` → independent span (a
  parallelogram covering the plane) → dependent span (collapse to a line). The
  explorer lets you drag/type **v** and **w**, set `a`/`b`, toggle components and
  span, switch independent/dependent, and reset; readouts show the combination
  and independent-vs-dependent classification.
- **Lesson 2** — identity grid → highlight column 1 and move **e₁** → column 2 and
  **e₂** → sample as `x·e₁ + y·e₂` → transform the sample → deform the grid →
  compare original/transformed → tour scale/rotation/reflection/singular → return
  to `A = [[2,1],[0,1]]`. The explorer edits the four entries, drags/types an
  input vector, scrubs the identity→A transition, toggles the transformed grid and
  basis, and offers presets; readouts show `A`, input, `Av`, transformed `e₁`/`e₂`,
  and `det(A)` (labelled as a preview of Lesson 3).

## Shared data reuse

`src/lessons/exampleData.ts` is the single source of truth for lesson numbers:

- `LINEAR_COMBINATION_EXAMPLE` — `v`, an independent `w`, a dependent `w` (= 2·v),
  and initial coefficients, consumed by both `linearCombinationScene` and
  `LinearCombinationExplorer`.
- `MATRIX_LESSON_EXAMPLE` — `requireMatrixExample("shear-2-1")`, reused by the
  matrix scene, explorer, and lesson equations/exercises.

All arithmetic flows through `src/math` (e.g. `matrixVectorMultiply`,
`addVectors`, `areParallel`, `determinant2x2`, `lerpIdentityToMatrix`), so the
explanation, equations, animation, and exploration agree mathematically.

## How equations are rendered

`EquationBlock` renders **trusted static** lesson TeX with KaTeX
(`output: "htmlAndMathml"` for accessible MathML). It supports display and inline
modes and falls back to readable monospace source if KaTeX throws. Arbitrary
user-provided TeX is not accepted in M4. `katex/dist/katex.min.css` is imported by
the component and bundled by Vite.

## How to add a guided scene and explorer

See the README section "Adding a guided scene and explorer". The key boundary:
lesson definitions and React components reference only a **string `guidedSceneId`**
and **`explorationId`** — Motion Canvas types never leak past
`src/guided-scenes/`. Scene timing lives once in `sceneTimings.ts` and is reused
to derive both the animation length and the step markers.

## Accessibility & reduced motion

> **Standards update:** keep [basic accessibility](./LESSON_DESIGN.md#basic-accessibility-keep)
> (focus, labels, readouts, reduced-motion autoplay). Full disability-product
> optimization remains out of scope. Behavior below is what M4 shipped.

- All playback controls are real keyboard-focusable buttons; the scrubber and all
  parameter sliders are labelled `<input>`s with `aria-valuetext`.
- Every draggable interaction (v, w, input vector) has equivalent numeric sliders.
- Visual conclusions have text equivalents: `SceneReadout` panels state the
  combination, independence/span classification, and transformed basis; legends
  and roles never rely on colour alone (solid vs dashed, labels, readouts).
- Canvas and Mafs regions have descriptive `aria-label`s.
- `prefers-reduced-motion` is honoured: the engine settles on the final frame and
  the player exposes discrete step buttons to jump between the major ideas, plus a
  visible notice.

## Current content limitations

- Lessons 3 and 4 are placeholders (guided scene falls back to the dev
  `transform-spike` scene; a "coming soon" exploration panel is shown).
- The independent-span visual is a finite parallelogram, not an infinite shaded
  plane (deliberate, to avoid unbounded rendering cost).
- The identity→A scrub is an educational visual transition, not a matrix
  factorization, and is labelled as such.
- The production bundle is a single chunk (no code-splitting yet, per M4 scope).
