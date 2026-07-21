---
name: Basis lesson bridge
overview: Expand Lesson 1 into a complete foundational lesson "Vectors, Linear Combinations, and Basis" that ends on basis and coordinates-relative-to-a-basis. Keep the single guided scene (extended with basis/coordinate beats), extend the existing LinearCombinationExplorer with a bounded find-the-coordinates task, use exactly two misconception events, and make only light recall edits to Lesson 2. No new lesson, route, curriculum entry, explorer registration, schema, or scene-optional architecture.
todos:
  - id: vectors-data
    content: Expand src/lessons/vectors.ts (title, objectives, reordered sections through basis+coordinates, equation-first worked example, 2 callouts, checkpoint, exercises, takeaway)
    status: completed
  - id: scene
    content: Extend linearCombinationScene.ts + sceneTimings.ts + sceneMeta.ts with basis/coordinate beats (p fixed, standard grid vs B grid), no second Watch
    status: completed
  - id: explorer
    content: Extend LinearCombinationExplorer.tsx with a bounded find-the-coordinates task (fixed p, a/b, match feedback, [p]_B, presets, dependent conclusion)
    status: completed
  - id: example-data
    content: Add reusable target p / coordinate constants in exampleData.ts (numbers only, no TeX)
    status: completed
  - id: transformations
    content: Light recall edits to src/lessons/transformations.ts (standard basis, unique coords, columns rule as a consequence + connection layer)
    status: completed
  - id: tests
    content: Update lessonWiring/grading/sceneTimings/sceneMeta tests, add explorer task component test, extend e2e/lesson-vectors.spec.ts
    status: completed
  - id: docs
    content: Light doc edits (VISION misconception/narrative notes, LESSON_DESIGN flexibility example); no schema/arch doc changes
    status: completed
  - id: verify
    content: Run lint, unit, e2e; browser review desktop/mobile/zoom/reduced-motion into screenshots/
    status: completed
isProject: false
---

# Expand Lesson 1 to "Vectors, Linear Combinations, and Basis"

Single-lesson expansion. No new lesson/route/curriculum/explorer registration, no
`guidedSceneId` optionality, no static-Watch architecture, no new schema. Reuse the
current example throughout: `v=(1,2)`, `w=(3,-1)`, `p=v+w=(4,1)`; `[p]_E=(4,1)`,
`[p]_B=(1,1)` in `B=(v,w)`; dependent alternative `w=(2,4)=2v`.

## 1. Revised Lesson 1 outline (learner order)

Three main sections (the seven concepts are the internal progression, not separate top-level sections):

1. **Vectors and operations** — arrow from the origin; coordinates as horizontal/vertical movement; scaling (stretch/shrink/flip) and head-to-tail addition.
2. **Linear combinations and span** — `a v + b w` as one reachable point; span as the set of all reachable points; dependence vs independence (same line/collapse vs genuinely different directions filling the plane); this is where "any two vectors form a basis" is resolved (a dependent pair cannot).
3. **Basis and coordinates** — in the plane, two independent vectors span the plane and form a **basis**; existence + uniqueness of `a v + b w` (uniqueness argument below); the same fixed `p` is `(4,1)` in `E` and `(1,1)` in `B=(v,w)`; coefficients are coordinates; standard axes `e₁,e₂` are one basis.

Uniqueness argument (authored explicitly in section 3): if `a v + b w = a' v + b' w`, then `(a-a')v + (b-b')w = 0`; independence forces `a=a'`, `b=b'`. Make the distinction explicit: **span guarantees a representation exists; independence guarantees it is unique.**

## 2. Revised lesson fields

- Title: "Vectors, Linear Combinations, and Basis" (provisional). Subtitle: "Arrows, reachable regions, and the coordinate language a basis provides."
- Objectives (revised, trimmed to avoid redundancy):
  - See a vector as an arrow; read coordinates as movement.
  - Scale, add, and form linear combinations `a v + b w`.
  - Describe span as reachability; contrast dependent (a line) with independent (the plane).
  - Recognize an independent pair as a **basis**, and write any vector uniquely as `a v + b w`.
  - Read `(a,b)` as the vector's **coordinates in that basis**, and see that the standard axes are just one basis.
- Central question: "Two arrows in different directions: which points can you reach, and once you can reach them all, is `(x,y)` really the vector — or just its name in the language those two arrows set up?"
- Section purposes: **Vectors and operations** = the object and how to scale/add; **Linear combinations and span** = the operation, reachability, and the independence/dependence contrast (including why a dependent pair fails to be a basis); **Basis and coordinates** = an independent pair is a basis in the plane, existence vs uniqueness, and `(a,b)` as coordinates with the standard axes as one case.
- Minimum equations: `v=[v₁,v₂]`; `a v + b w`; `p = v + w = (4,1)`; `p = 1·v + 1·w`; `[p]_E=(4,1)`, `[p]_B=(1,1)`; `w=2v` (dependent); uniqueness: `a v + b w = a' v + b' w ⇒ (a-a')v + (b-b')w = 0 ⇒ a=a', b=b'`.
- Checkpoint (repurposed to the new compression, higher value than the current span check, which now lives in exercise `vec-span`): "The same arrow `p` is `(4,1)` using the standard axes. Using `B=(v,w)` it is `(1,1)`. Did `p` move? What changed?" Answer: `p` is unchanged; only its coordinate description changed — coordinates name a vector relative to a chosen basis.
- Practice progression (tiers): (check) is `{v,w}` a basis given they are not perpendicular? → yes, independence is the test; (drill) compute `p = a v + b w` for given `a,b` (keep `vec-add-compute`); (drill/transfer) find `[p]_B` for fixed `p=(4,1)` in `B=(v,w)` → `(1,1)`; (transfer) why can `w=(2,4)` not form a basis with `v`? → dependent, reaches only the line, cannot name `p`. Keep `vec-span` and `vec-independent-predict`.
- Final takeaway (compression target): "In the plane, two independent vectors span the plane, so they form a basis; every vector is then a unique `p = a v + b w`, and `(a,b)` are its coordinates in that basis. The standard axes are just the most familiar basis."

## 3. Current content disposition (retained / rewritten / moved / removed)

Organized by disposition (plan UI does not render tables reliably).

- Retained as-is:
  - Guided scene continuity, `guidedSceneId: "vectors-linear-combinations"`, `explorationId: "linear-combination"`, `exampleId`.
  - Exercises `vec-add-compute`, `vec-span`, `vec-independent-predict` (reworded feedback only if needed).
  - `intro` section (vector/coordinates) — small forward-looking clause added.
- Rewritten:
  - `title`, `subtitle`, `learningObjectives`, `keyTakeaway` (to the basis compression above).
  - `combinations` section observation: tighten the independent/dependent sentence (it currently pre-explains span + independence in one dense line); split its two ideas across the new `span` and `independence` sections rather than repeating.
- Moved / reordered:
  - Content is grouped into three sections: **Vectors and operations**, **Linear combinations and span**, **Basis and coordinates**. Span, independence, basis, and coordinates are the internal progression of sections 2-3, not separate top-level sections.
  - The independence-vs-dependence idea currently packed into `combinations` moves into the "Linear combinations and span" section so "Basis and coordinates" can build on it.
  - The single `checkpoint` is repurposed from "dependent span reaches a line" to the coordinates-in-a-basis question (the span check is already covered by `vec-span`).
- Added (new content within the three sections, not appended prose):
  - "Linear combinations and span" gains the span + independence/dependence material.
  - "Basis and coordinates" section: the 2D basis statement, the existence-vs-uniqueness argument, and coordinates of `p`.
  - One `WorkedExample` (equation sequence: `p=v+w=(4,1)` → `p=1·v+1·w` → `[p]_B=(1,1)` vs `[p]_E=(4,1)`).
  - Two `callouts` (misconception events A and B, §6).
- Removed:
  - Redundant restatement of "span/independent" that would otherwise appear twice once the dedicated sections exist (collapse the duplicate sentence in `combinations`).

## 4. Additional guided-scene beats (extend the one scene; no second Watch)

Compressed to **two beats** (plus an optional brief conclusion). Append after the existing `dependent` beat in
[src/guided-scenes/scenes/sceneTimings.ts](src/guided-scenes/scenes/sceneTimings.ts)
(`LINEAR_COMBINATION_SEGMENTS`) and add matching bodies in
[src/guided-scenes/scenes/linearCombinationScene.ts](src/guided-scenes/scenes/linearCombinationScene.ts):

- `basis` — restore `w` to the independent `(3,-1)`, re-show the plane-filling span, and name the independent pair a **basis** (in the plane). Purpose: independent pair spans the plane ⇒ basis.
- `coordinates` — introduce the fixed target `p=(4,1)` (arrow, `--role-invariant`). In **one continuous beat while `p` stays geometrically fixed**, transition from the standard reading `p = 4 e₁ + 1 e₂` / caption `[p]_E=(4,1)` to the `B` reading by fading in the `(v,w)` coordinate grid (shared `makeTransformedGrid`, basis matrix `B=[[1,3],[2,-1]]`, columns `v,w`) and landing on lattice node `(1,1)` / caption `[p]_B=(1,1)`. Grid endpoints go through `matrixVectorMultiply` (correctness rule; no ad-hoc slopes).
- `same-vector` (optional, brief) — only if the `coordinates` beat does not already make it obvious: dim both grids and hold `p` fixed with the caption "the arrow never moved — only its coordinates changed." Omit if the continuous transition already lands the point.

Notes: fade the `a v + b w` combo arrows during the `coordinates` beat to avoid clutter; keep each body's runtime equal to its declared segment duration (existing scene convention). Update `sceneMeta` `majorSteps` to include `basis` and `coordinates`, and refresh the aria-label to mention basis/coordinates. Extending the existing scene is preferred and presents no technical problem (the transformed-grid helper and a fixed-point marker are already available); a second scene is therefore not warranted.

## 5. Explorer changes and learner workflow

Extend [src/explorations/LinearCombinationExplorer.tsx](src/explorations/LinearCombinationExplorer.tsx) (no new registration). Prefer a **"Coordinate challenge" preset** over a Free/Find mode toggle — it reuses the existing `PresetPicker` + `applyPreset` structure (currently `independent`/`dependent`) rather than adding parallel UI state:

- Add a third preset `challenge` to the existing `PresetPicker`. Selecting it sets `v,w` to the independent pair and activates the bounded task; `independent`/`dependent` remain free exploration (existing behavior preserved).
- When `challenge` is active:
  - Show the fixed target `p=(4,1)` as a distinct gold `--role-invariant` marker; keep the live `a v + b w` arrow driven by the existing `a,b` sliders.
  - Match feedback: "matched" when `a v + b w ≈ p` (tolerance via shared helper), else "not matched yet"; `data-testid` for tests.
  - Readout `[p]_B = (a,b)` shown alongside the existing `a·v+b·w` / independence / span readouts.
  - Dependent variant of the challenge (or reusing the `dependent` preset) shows an explicit conclusion line: "`w=(2,4)` lies on `v`'s line, so `a v + b w` never leaves that line and can't reach `p=(4,1)` — a dependent pair is not a basis."
- Free exploration (drag `v,w`, adjust `a,b`, numeric-vector disclosure) is untouched for the non-challenge presets, keeping the control surface small. If, during implementation, the preset approach makes the target/feedback wiring materially less clear than a small mode flag, fall back to a minimal internal flag but keep it preset-triggered (no user-facing mode toggle).

## 6. The two misconception events (elicit -> confront -> resolve)

Authored as `callouts` in [src/lessons/vectors.ts](src/lessons/vectors.ts) at the point each arises (basis / coordinates sections):

- Event A — "Independent means perpendicular" / "a basis must be the coordinate axes."
  - Elicit: ask whether `v=(1,2)`, `w=(3,-1)` — clearly not perpendicular and not the axes — can be a basis.
  - Confront: they are independent, they span the plane, and they give `p` the unique coordinates `(1,1)`.
  - Resolve: a basis needs independence (and spanning), not right angles or axis-alignment.
- Event B — "Coordinates are the vector."
  - Elicit: is `p` "the vector `(4,1)`"?
  - Confront: the same fixed arrow `p` is `(4,1)` in `E` and `(1,1)` in `B=(v,w)`.
  - Resolve: the arrow is invariant; coordinates are its description in a chosen basis.
- "Any two vectors form a basis" is resolved inside the main dependence/independence explanation and the explorer's dependent preset — no third callout.

## 7. Precise Lesson 2 edits (light)

[src/lessons/transformations.ts](src/lessons/transformations.ts):

- `intro`: add a one-clause recall — "`e₁=(1,0)`, `e₂=(0,1)` are the standard basis from Lesson 1, and every vector has unique standard-basis coordinates `x,y`."
- `grid`: reframe so the columns rule is a **consequence**: because `v = x e₁ + y e₂` uniquely (Lesson 1), linearity gives `A(x e₁ + y e₂) = x A e₁ + y A e₂`, so the two columns `A e₁, A e₂` determine the whole map. Keep the existing equation.
- Add one `connection` depth layer pointing back to Lesson 1's basis/coordinates (and forward to change of basis).
- Reword objective "Read matrix columns as the images of the basis vectors" to signal it now follows from unique coordinates, not as an unexplained rule.
- Keep the guided scene, explorer, and exercises unchanged.

## 8. File-by-file implementation plan

- [src/lessons/vectors.ts](src/lessons/vectors.ts): title/subtitle/objectives; reorder + add `span`, `independence`, `basis`, `coordinates` sections; add one equation-first `WorkedExample`; add two `callouts`; repurpose `checkpoint`; adjust exercises (add find-`[p]_B` and dependent-pair items; keep existing three).
- [src/guided-scenes/scenes/sceneTimings.ts](src/guided-scenes/scenes/sceneTimings.ts): append `basis`, `coordinates` (and optional `same-vector`) to `LINEAR_COMBINATION_SEGMENTS` with durations.
- [src/guided-scenes/scenes/linearCombinationScene.ts](src/guided-scenes/scenes/linearCombinationScene.ts): import `makeTransformedGrid`; add fixed-`p` marker, `[p]_E`/`[p]_B` labels, B-basis grid (matrix `[[1,3],[2,-1]]`); add the two (or three) bodies with the continuous `[p]_E → [p]_B` transition; restore `wTip` to independent at `basis`.
- [src/guided-scenes/scenes/sceneMeta.ts](src/guided-scenes/scenes/sceneMeta.ts): add new step ids to `majorSteps`; update the scene aria-label.
- [src/lessons/exampleData.ts](src/lessons/exampleData.ts): add reusable constants for target `p=(4,1)` and `[p]_B=(1,1)` (numbers only; no TeX). Reuse existing `v/wIndependent/wDependent`.
- [src/explorations/LinearCombinationExplorer.tsx](src/explorations/LinearCombinationExplorer.tsx): add the find-the-coordinates task mode described in §5.
- [src/lessons/transformations.ts](src/lessons/transformations.ts): the light recall edits in §7.

## 9. Required test changes

- Unit / wiring [src/lessons/__tests__/lessonWiring.test.ts](src/lessons/__tests__/lessonWiring.test.ts): new title/objectives; worked example is an equation array; two callouts present; transformations connection layer present.
- Grading [src/lessons/__tests__/grading.test.ts](src/lessons/__tests__/grading.test.ts): new exercises (find `[p]_B`, dependent-pair) grade deterministically.
- Scene timing/meta [src/guided-scenes/scenes/__tests__/sceneTimings.test.ts](src/guided-scenes/scenes/__tests__/sceneTimings.test.ts) and the scene-descriptions/unknown-id tests: new segment ids, `totalDuration`, `majorSteps` mapping.
- Component test for the explorer task: matched/not-matched feedback, `[p]_B` readout, dependent-preset conclusion (add to explorer `__tests__`).
- e2e [e2e/lesson-vectors.spec.ts](e2e/lesson-vectors.spec.ts): extend the existing spec for the basis/coordinate stage titles, worked equations, the two misconception reveals, and the explorer task workflow; include a reduced-motion assertion. No new lesson spec.

## 10. Documentation edits directly required

- [docs/INTERACTIVE_TEXTBOOK_VISION.md](docs/INTERACTIVE_TEXTBOOK_VISION.md): §12 ensure the two events are represented (independent-not-perpendicular and coordinates-are-the-vector exist; add "a basis must be the standard axes" as part of event A); §14 narrative note that Lesson 1 now teaches basis/coordinates (the spine sentence "a minimal set of arrows is a language for the plane" is now delivered in Lesson 1) and still seeds change of basis.
- [docs/LESSON_DESIGN.md](docs/LESSON_DESIGN.md): update the Flexibility example (currently "a definition of linear dependence in an intro vectors lesson") to note Lesson 1 now also introduces basis/coordinates. No change to the Motion-Canvas-Watch rule (scene retained).
- [docs/lesson-depth-pattern.md](docs/lesson-depth-pattern.md): optional one-line note citing Lesson 1's equation-first coordinates worked computation as an example.
- No edits to [docs/LESSON_TEMPLATE.md](docs/LESSON_TEMPLATE.md) schema and no schema/architecture doc changes (per constraints).

## Implementation risks and unresolved choices

- Scene length/pacing: two added beats (plus optional conclusion) lengthen the Lesson 1 Watch modestly; fade combo arrows during the `coordinates` beat and keep body runtimes equal to declared durations, or the step-seek markers drift. The `[p]_E → [p]_B` transition must stay in one continuous beat with `p` fixed.
- B-basis grid legibility: the skewed `(v,w)` grid can look busy; keep it subdued (transformed-grid color) and dim the standard grid as it fades in.
- Explorer clarity: the "Coordinate challenge" preset reuses `PresetPicker`/`applyPreset`; the only risk is target/feedback wiring — fall back to a minimal preset-triggered internal flag (no user-facing toggle) if the preset-only path becomes unclear.
- Checkpoint: confirmed — repurpose the single `checkpoint` to the coordinates question; `vec-span` retains the span check.
- Title provisional ("Vectors, Linear Combinations, and Basis"); confirm before wiring tests that assert the title string.
