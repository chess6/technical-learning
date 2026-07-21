# State & Trajectory Audit — Interactive Linear Algebra Textbook

**Date:** 2026-07-20
**Scope:** Evidence-based state audit (no code changes, no implementation plan).
**Method:** Static inspection of types, components, lesson data, math layer, docs,
and tests; plus runtime inspection of the running dev server
(`http://127.0.0.1:5173`, eigenvectors lesson + explorer).

> All substantive claims cite exact repository paths and symbols. Line ranges are
> given where they aid navigation; they may drift slightly as files change.

---

## 1. Executive assessment

The project is **architecturally mature and mathematically disciplined**, but its
**derivation-authoring layer is pulling against its own stated pedagogy.** The
`src/math` layer is a clean, well-tested single source of truth; the guided-scene
engine, explorer registry, and lesson registry enforce good boundaries; the eigen
lesson (Lesson 4) is a genuinely deep worked reference. The dominant risk is not
correctness or infrastructure — it is that the **worked-example schema encourages
authors to fill five explanatory fields on every step**, producing exactly the
scaffolding wall the vision document warns against.

Concretely, three findings matter most:

1. **The derivation schema forces a five-part template.** `WorkedStep`
   (`src/lessons/types.ts:84`) exposes `object` / `invariant` / `picture` /
   `whyNext` / `learned`, and `WorkedExamplePanel` renders each with a hard-coded
   bold label. Although every field is *optional in the type* and *conditional in
   render*, the authored Lesson 4 data fills 4–5 of them on **every** non-faded
   step (runtime: 6/6 steps have Object/Picture/What-you-learned, 5/6 Why-next,
   4/6 Invariant). This is the redundancy the prompt is worried about, and it
   contradicts `INTERACTIVE_TEXTBOOK_VISION.md` §10 ("not a five-line annotation on
   every line of algebra").

2. **Two different "derivation step" models already coexist**, and the simpler one
   the prompt proposes *already exists* — just not where the teaching happens. The
   sidebar/3D model `DerivationStep` (`src/guided-scenes/scenes/derivationSteps.ts:14`)
   is `{ equation, label, caption, threeD }` — very close to the proposed
   `{ equation, explanation?, insight?, misconception? }`. It is used only for the
   **expand-modal step nav and 3D mapping**, not for the main notebook.

3. **Derivation ↔ animation synchronization is semantic in the modal, absent on
   the page.** The clickable, active-highlighting `DerivationStepNav` lives *only*
   inside `EigenClipModal`. On the lesson page the notebook is a static `<ol>` with
   no active-step emphasis tied to playback. Sync itself is **semantic by
   `majorStepId`** (good), but resolved through timeline `at`/`progress`
   (index-and-timing under the hood).

Everything else — continuity, layered depth, edge-case math, accessibility,
responsive behavior — ranges from solid to partial, and is detailed below.

---

## 2. What the screenshots do not reveal

- **The notebook is a fixed five-field template, not adaptive prose.** A screenshot
  of one beat looks like a thoughtful annotation; the DOM shows the same labeled
  quintet repeating down every step (`.worked-example__label` counts at runtime:
  Object ×6, Picture ×6, What-you-learned ×6, Why-next ×5, Invariant ×4). See the
  captured `audit-worked-example.png`.
- **Equations in the animation are plain text, not live math objects.** Motion
  Canvas beats set captions/titles with `Txt` nodes via `setTop(...)`/`setCaption(...)`
  (`src/guided-scenes/scenes/eigenvectorsDerivationScene.ts:238`). There is no KaTeX
  or `Latex` node in the scene, so `Av = λv → (A−λI)v = 0 → det(A−λI)=0` is a
  **string swap**, not a morph.
- **The lesson page has no clickable derivation steps.** Step-seeking + active
  highlight exist only in the expand modal (`EigenClipModal.tsx:134`). The page's
  "Watching now" title and dot rail are the only synchronized surface.
- **The "defective / repeated eigenvalue" classification is effectively
  preset-only.** With matrix sliders at `step=0.05` (runtime-confirmed) and a
  discriminant tolerance of `1e-9` (`analyzeEigen2x2`, `src/math/eigen.ts:214`),
  free dragging jumps `distinct-real ↔ complex` and essentially never lands in the
  repeated band; the defective label is reachable only via the exact
  `eigen-repeated-defective` preset.
- **No progress is persisted.** `localStorage` appears only for the guided debug
  flag (`src/hooks/useGuidedPlayback.ts`), never for lesson/exercise progress.
- **Reset is a remount, not a state restore.** `resetToken` bumps a React `key`
  (`src/pages/LessonPage.tsx:26,68`), disposing and recreating engines/explorers.

---

## 3. Derivation-schema findings

**Status: Implemented, but structurally biased toward over-scaffolding.**

### Two schemas, two jobs

| Schema | File | Fields | Used by | Required? |
| --- | --- | --- | --- | --- |
| `WorkedStep` | `src/lessons/types.ts:84` | `symbolic?`, `object?`, `invariant?`, `picture?`, `whyNext?`, `learned?`, `solutionVisualId?`, `faded?` | `WorkedExamplePanel` (the teaching notebook) | **All optional** (`id` is the only required field) |
| `DerivationStep` | `src/guided-scenes/scenes/derivationSteps.ts:14` | `id`, `equation`, `label`, `caption`, `threeD` | `DerivationStepNav` (modal), 3D mapping | `equation`,`label`,`caption`,`threeD` required |

The prompt's proposed model —

```ts
type DerivationStep = { equation: string; explanation?: string; insight?: string; misconception?: string };
```

— is **closest to the existing `DerivationStep`** (already `equation` + one caption)
but would *replace* `WorkedStep`'s five-field template. Note the name collision:
`DerivationStep` is already taken by the sidebar model.

### Which fields are required / forced

- **Type level:** nothing is forced. `WorkedStep` requires only `id`; `symbolic`
  and all five prose fields are optional (`src/lessons/types.ts:84-96`).
- **Render level:** every field is conditionally rendered — `WorkedExamplePanel`
  wraps each in `{step.object && (...)}` etc. (`WorkedExamplePanel.tsx:140-169`), so
  an equation-only step renders cleanly with **no blank space**. An equation-only
  step is fully supported (the `interpret` step already omits `symbolic`,
  `eigenvectors.ts:129`).
- **Authoring level (the real pressure):** the five labels are **hard-coded strings**
  in `WorkedExamplePanel.tsx:142,147,152,158,165` ("Object.", "Invariant.",
  "Picture.", "Why next.", "What you learned."), the adoption checklist tells
  authors to "identify object / invariant / picture / why-next / learned"
  (`docs/lesson-depth-pattern.md:78`), and `INTERACTIVE_TEXTBOOK_VISION.md` §10 + §17
  list all five as a per-worked-example requirement. The result in the only lesson
  that uses it (eigenvectors): **near-complete fill on every step** (runtime counts
  above). The docs *do* caveat "meaningful steps only" (§10, §5.4) — but the
  component, the checklist, and the authored data all push the opposite way.

### Are the labels hard-coded, schema-driven, optional, or conditional?

**All at once, which is the problem.** The label *text* is hard-coded in the
component; the label *fields* are optional in the schema; the label *rendering* is
conditional on presence — but the *authoring guidance* treats them as a mandatory
checklist. There is no `explanation`/`insight`/`misconception` field; the closest
analogues are split across `WorkedStep` (five fields), `AuthoredCallout`
(`belief`/`confront`/`resolve`, `types.ts:117`), and `DepthLayer` (`trap` kind).

### Is `invariant` mathematically precise?

**No.** In the authored data, `invariant` is used to mean "the fact this step
relies on," not an invariant subspace or conserved quantity. Examples from
`eigenvectors.ts`: "We seek directions the map only scales" (L77 — a *goal*, not an
invariant); "When `Av` and `λv` coincide, their difference is the zero vector"
(L87-88 — a conditional identity); "det = 0 means dimensional collapse" (L100-101 —
a property of the auxiliary map). None is an invariant in the technical sense. The
field name therefore invites imprecise or padded content.

### Same schema for every lesson?

**Yes — uniform, but exercised by exactly one lesson.** `WorkedExample`/`WorkedStep`
are generic in `types.ts` and topic-agnostic. Per `lessonWiring.test.ts`, only
`eigenvectors` currently defines `workedExamples`; the other three lessons
(`vectors`, `transformations`, `determinants`) carry `sections` + `exercises` but no
worked-example ladder. So the five-field template is a single-lesson pattern being
generalized ahead of a second consumer — the exact risk `lesson-depth-pattern.md`
warns about ("Do not invent a rigid DSL before a second lesson needs it," L92).

### To adopt the simpler model, change exactly:

1. `src/lessons/types.ts:84-96` — `WorkedStep`: collapse `object`/`invariant`/
   `picture`/`whyNext`/`learned` into `explanation?` + `insight?` + `misconception?`
   (keep `symbolic`→`equation`, `solutionVisualId`, `faded`).
2. `src/components/lesson/WorkedExamplePanel.tsx:121-206` — `WorkedStepItem`: remove
   the five hard-coded label blocks; render equation, then optional explanation /
   insight / misconception.
3. `src/lessons/eigenvectors.ts:72-174` — re-author the worked-example steps to the
   selective model (most steps: equation only; keep prose on the genuinely subtle
   rungs — see §4).
4. `docs/INTERACTIVE_TEXTBOOK_VISION.md` §10 + §17 and
   `docs/lesson-depth-pattern.md:78` — relax the five-element requirement to
   "explain only where the transition is non-obvious."
5. `src/components/lesson/WorkedExamplePanel.css` — label styling (`worked-example__label`).
6. `src/components/lesson/__tests__/depthComponents.test.tsx` +
   `lessonWiring.test.ts` — update expectations.

The sidebar `DerivationStep` model and `AuthoredCallout` need not change.

---

## 4. Examples of redundant vs. valuable explanation

Drawn from the authored ladder in `src/lessons/eigenvectors.ts`.

### Redundant (the equation + adjacent animation already say it)

- **`recap` step** (L74-82): equation `Av = λv`. `object` = "A nonzero vector v and
  a scalar λ" restates the symbols; `picture` = "Most arrows leave their ray; a few
  stay put" duplicates the Watch scene the learner just saw; `learned` = "The
  defining equation is geometric" restates the caption. High redundancy.
- **`solve-lambda` step** (L108-115): `λ² − 5λ + 6 = 0 ⟹ λ = 3, 2`. `object` = "The
  characteristic polynomial λ² − (tr)λ + det" and `picture` = "Two real roots" add
  little beyond the line itself.
- **`interpret` step** (L128-135): `picture` and `learned` both say "two different
  lines"; one is enough.

### Genuinely valuable (subtle, surprising, or misconception-repairing — keep)

- **`shift` step** (L84-95): the claim that it is **`A − λI`, not `A`, that sends the
  eigenvector to zero** is the single most common eigen misconception. This
  explanation earns its place (and is mirrored by the `trap` layer at L143-147 and
  the caption at `derivationSteps.ts:36`).
- **`charpoly` step** (L96-107): "finding eigenvalues *reuses* determinant collapse"
  is a cross-lesson concept-graph edge (vision §14), not restatement — valuable.
- **Off-axis result** (`solve-v`, L116-127): "eigenvectors are not always coordinate
  axes" repairs a real misconception and motivates the asymmetric example.
- **Negative-λ note** (faded example, L164-173): "same line, opposite direction" is
  the λ<0 misconception; worth stating even in a faded step.

**Principle the data violates:** the vision doc's own rule (§10) that the five
elements attach to *meaningful* steps, and that routine algebra should "be named as
bookkeeping and move quickly." The `shift` and `charpoly` rungs deserve prose; the
`recap`, `solve-lambda`, and `interpret` rungs would be stronger as
equation-first with at most one line.

---

## 5. Visualization–algebra synchronization

**Status: Partially implemented. Semantic in the modal; presentation-only on the page.**

### Actual state flow

```
engine (Motion Canvas / SVG fallback)
  → GuidedSceneState { progress, status, canSeek }   (subscribe, GuidedScenePlayer.tsx:92)
  → majorStepIndex(majorSteps, progress)             (GuidedScenePlayer.tsx:357-367)
  → currentMajorStepId                               (L168-171)
  → onClipPositionChange({ majorStepId })            (L174-181)
  → EigenClipStage.position                          (EigenClipStage.tsx:66-68)
  → EigenClipModal → DerivationStepNav.activeStepId  (EigenClipModal.tsx:134-141)
```

- **Advancing the animation activates the step:** on the page, only the "Watching
  now" title (`GuidedScenePlayer.tsx:240-245`) and dot rail (`L299-318`) update. In
  the modal, the `DerivationStepNav` active item + caption update via `position`.
  The **worked-example notebook does not highlight the active step** — it is a
  static `<ol>` (`WorkedExamplePanel.tsx:105-113`) with no `activeStepId`.
- **Scrubbing backward restores visual state:** yes — `handleSeek → engine.seek`
  (`GuidedScenePlayer.tsx:195`); the SVG fallback seek is unit-tested
  (`SvgFallbackEngine.test.ts`). Symbolic state on the page does not track the
  scrub (nothing to restore there); in the modal the step nav follows because it is
  derived from `progress`.
- **Clicking a derivation step changes the animation:** yes, **in the modal only**.
  `onSelectStep → handleSelectStep` sets `position` and bumps `seekGeneration`
  (`EigenClipStage.tsx:70-73`), which is in the player `key` (L88) → remount seeded
  to that step via `initialPosition` (`GuidedScenePlayer.tsx:101-107`). It is a
  remount-and-seek, not a live seek.
- **Current algebraic step emphasized / inactive steps as context:** in the modal,
  yes (`DerivationStepNav.css` uses an inset bar + numbered badge, not color alone).
  On the page, **no** — all notebook steps have equal visual weight.
- **Captions vs. notebook text — same semantic step or separate?** **Separate,
  parallel authoring.** Scene captions live in the scene body (`eigenvectorsDerivationScene.ts`
  `setCaption(...)`), the sidebar captions live in `derivationSteps.ts`, and the
  notebook prose lives in `eigenvectors.ts`. All three are keyed by the same step
  ids (`recap`, `shift`, `charpoly`, …) but the **text is authored three times** and
  can drift. They agree today by discipline, not by a shared source.
- **2D and 3D share semantic step IDs:** yes. `resolveThreeDStep`
  (`derivationSteps.ts:162-186`) maps a 2D `majorStepId` to the nearest 3D-meaningful
  step via the `threeD` tag. Switching views preserves the conceptual step
  (`EigenClipStage` passes the same `position` to both renderers, L108-126).
- **Expanding/closing preserves playback state:** **conceptually yes, temporally no.**
  The `majorStepId` is preserved across expand/close (unit-tested in
  `EigenClipStage.test.tsx`), but because open/close changes the player `key`
  (L88), the engine remounts and re-seeks to the step start — sub-step progress and
  play/pause are lost. This is intentional (single-renderer invariant: at most one
  Motion Canvas/WebGL renderer mounted, `EigenClipStage.tsx:39-40`).

### Semantic or index/timing?

**Semantic at the API boundary, index+timing underneath.** Steps are addressed by
`majorStepId` everywhere the UI touches them, but resolution runs through
`majorStepIndex` scanning `step.at` against `progress` (`GuidedScenePlayer.tsx:357-367`),
and `majorSteps` are a hand-picked id subset of timeline beats
(`sceneMeta.ts:31-38, 100-125`). So the contract is semantic; the mechanism is a
progress threshold.

---

## 6. Guided-to-explorer continuity

**Status: Implemented for the derivation example; approximate for the Watch scene.**

Single source of truth is enforced: `src/lessons/exampleData.ts` +
`src/math/examples.ts` (`requireMatrixExample`). The rule "guided + explorers share
example ids, never duplicate constants" holds.

| Dimension | Guided derivation (`eigenvectorsDerivationScene.ts`) | Explorer (`EigenvectorExplorer.tsx`) | Verdict |
| --- | --- | --- | --- |
| Matrix | `EIGEN_LESSON_EXAMPLE` = `eigen-distinct` = `[[3,1],[0,2]]` (L47) | `DEFAULT = EIGEN_LESSON_EXAMPLE` (L26) | **Exact** |
| Initial vector | candidate along λ=3 dir (L108-116) | `inputVector` `[1,1]` from same example (L27) | Approximate (both principled) |
| Labels | `v`, `Av`, `λv` | `v`, `Av` | **Exact** |
| Semantic colors | `ROLE.original`/`transformed`/`selected` (`sceneKit.ts:30`) | `--role-original`/`-transformed`/`-selected` (L32-36) | **Exact** (shared tokens) |
| Coordinate range | grid half-extent 2.5 (`OVERLAY_CLEAR_HALF_EXTENT`) | viewBox ±4.5 × ±3.5, vec bound 3 (L235,L30) | Approximate |
| Presets | n/a (single example) | `EIGEN_LESSON_PRESETS` — distinct/negative/zero/scalar/defective/no-real (`exampleData.ts:79`) | Explorer broader (by design) |
| Math utilities | `eigenDerivation2x2`, `matrixShift` (`src/math`) | `classifyEigenCandidate`, `summarizeEigenAnalysis` (`src/math`) | **Shared layer** |

- **Derivation → explorer feels like "take control of the same example":** yes for
  the *computation* example (`[[3,1],[0,2]]` throughout the worked example, callouts
  with `exampleId: "eigen-distinct"`, and the explorer default all agree).
- **Watch scene continuity is looser:** the top-level Watch scene
  (`eigenvectors-invariant-directions`) is a **fan of illustrative directions and a
  tour of edge cases** (`derivationSteps.ts:73-137`), not the `[[3,1],[0,2]]` object.
  That is a deliberate "concept visualization" vs "derivation visualization"
  distinction (vision §9a), so the *lesson* opens on a general picture and only the
  *worked example* commits to the shared matrix. Reasonable, but it means the very
  first thing the learner watches is not the object they later manipulate.
- **Edge-case definitions shared:** explorer presets map to the same ids the math
  tests use (`eigen-repeated-defective`, `eigen-no-real`, `eigen-zero`), so
  classification is identical to the curated cases.

**Continuity is exact where it matters most (the computed example) and intentionally
approximate at the conceptual opener.** No broken continuity found.

---

## 7. Layered-depth architecture

**Status: Implemented; clean separation, but expansion state is ephemeral.**

Depth is expressed through four independent mechanisms:

| Layer kind | Mechanism | File | Always visible? |
| --- | --- | --- | --- |
| Core conceptual path | `LessonSection` prose + main equation | `types.ts:128`, `LessonPage.tsx:54-64` | Visible |
| Formal derivation | `WorkedExample` notebook + scene | `WorkedExamplePanel.tsx` | Visible (but heavy) |
| Optional geometric insight / misconceptions / edge cases / math notes / looking-ahead / connections | `DepthLayer` (`<details>`) | `DepthLayer.tsx:20-32` | **Expandable** |
| Misconception confrontation | `AuthoredCallout` → `MisconceptionCallout` | `MisconceptionCallout.tsx` | Visible aside |
| Faded self-explanation | `WorkedStep.faded` reveal button | `WorkedExamplePanel.tsx:181-204` | Deferred until revealed |
| 3D extension | `EigenClipStage` "See it in 3D" | `EigenClipStage.tsx:82-114` | Deferred (lazy-loaded) |

- **Always visible:** section prose, main equation, worked-example notebook,
  misconception callouts, explorer, exercises, takeaway.
- **Expandable:** the seven `DepthLayerKind`s (`why`, `trap`, `math-note`, `history`,
  `looking-ahead`, `connection`, `recap`; `types.ts:6-13`), rendered as native
  `<details>` (closed by default, verified in `depthComponents.test.tsx`).
- **Deferred:** faded worked steps; the 3D extension (code-split via `lazy`,
  `EigenClipStage.tsx:19-22`, and confirmed not fetched on non-eigen lessons in
  e2e).
- **What interrupts the main path:** the worked-example notebook is the main
  interruption risk — it is large and always-open. Depth layers, by contrast, do not
  interrupt (they are collapsed).
- **Clean first pass without every edge case:** **yes** — a learner can read
  sections + takeaway + do the checkpoint without opening any `DepthLayer`. The
  "main line stands alone" rule (vision §13) is architecturally honored.
- **Optional depth discoverable without overwhelming:** yes — labeled summaries
  ("Common trap", "Looking ahead") via `KIND_LABEL` (`DepthLayer.tsx:5-13`).
- **Expanded state preserved?** **No.** `<details>` open/closed is native DOM state
  with no persistence, and any `resetToken` bump remounts the subtree
  (`LessonPage.tsx:68,125`), collapsing everything. Navigating away and back
  re-mounts from scratch.
- **Supports future learner-controlled depth / personalization?** Partially. The
  taxonomy (`DepthLayerKind`) is a good substrate for per-learner depth
preferences, but there is **no persistence, no user model, and no depth-level
setting** today. Personalization would be greenfield.

---

## 8. Mathematical edge-case behavior

**Status: Implemented and well-tested at the `src/math` layer; boundary UX is a
hard discontinuity, and the same code path serves presets and free values.**

### Classification code path

Presets and arbitrary slider values use the **same** analysis functions:
`summarizeEigenAnalysis` / `classifyEigenCandidate` (`src/math/eigenClassify.ts`),
backed by `analyzeEigen2x2` (`src/math/eigen.ts:214`). No separate preset-only path.
`EigenvectorExplorer` recomputes on every entry change via `useMemo`
(`EigenvectorExplorer.tsx:63-64,77`).

### Behavior by case

| Case | Handling | Evidence |
| --- | --- | --- |
| Near-singular (det≈0) | `classifyDeterminant` uses tolerance; area = \|det\| | `m5-classify.test.ts` (`near-singular`, tol 1e-6) |
| Determinant near zero | Collapse detected; `Av≈0 ⇒ λ=0` branch | `eigenClassify.ts:73-81` |
| Repeated eigenvalue | `disc`≤tol → scalar (`A=λI`) vs defective split | `eigen.ts:238-264` |
| Defective | one eigendirection only, never fabricates a second | `eigen.ts:258-264`; `eigen.test.ts` |
| Scalar | full-plane eigenspace | `eigen.ts:246-256` |
| Negative eigenvalue | signed λ, `describeLambda` reverses | `eigenClassify.ts:121-123` |
| Zero eigenvalue | λ=0 collapse messaging | `eigenClassify.ts:76-80` |
| No real eigenvalue | `complex` kind, no fabricated directions | `eigen.ts:229-236`; `summarizeEigenAnalysis` returns empty `directions` |
| Discriminant ≈ 0 | tolerance band → repeated | `eigen.test.ts` (`[[1.00000005,1],[0,1]]`, tol 1e-6) |
| Vector near (not on) eigendirection | `not-eigen` with line angle readout | `eigenClassify.ts:107-113` |
| FP tolerance boundaries | `DEFAULT_TOLERANCE=1e-9`; eigenpair checks 1e-6 | `types.ts`; `verifiesEigenpair` |

### Are visual states stable? Does the UI flicker?

- **Arrow direction is stabilized** to one hemisphere (`stabilizeDirection`,
  `eigenClassify.ts:195-200`), preventing frame-to-frame eigendirection flips — this
  was a logged bug fix (`ERROR_LOG.md` 2026-07-19 eigen scene entry).
- **No per-frame classification flicker**, but there is a **hard boundary
  discontinuity**: with `step=0.05` sliders (runtime-confirmed) and a `1e-9`
  discriminant tolerance, dragging across the eigen/complex boundary jumps
  `distinct-real → complex` and essentially never shows the `repeated-real` band.
  The **defective / scalar-repeated labels are therefore reachable only via exact
  presets**, not by exploration. This is mathematically correct (the repeated set is
  measure-zero) but pedagogically means the learner cannot "feel" the boundary case
  by dragging.
- **Summaries remain correct** across cases (the readout text is generated from the
  same analysis; `EigenvectorExplorer.tsx:126-130`).
- **Labels overlap/disappear:** the explorer draws at most two eigenlines +
  `v`/`Av`; a logged fix moved guided-scene captions out of the teaching zone
  (`ERROR_LOG.md` two 2026-07-20 entries). Explorer label collisions near the origin
  are possible but not observed as a defect.

### Test coverage of boundaries

Good at the math layer (see §13), with two gaps: **near-singular *eigen* analysis**
(as opposed to determinant) is not directly tested, and the **explorer UI** is not
exercised across the boundary (only the math is). No test asserts the absence of
classification flicker while dragging.

---

## 9. Equation-morphing feasibility

**Status: Not implemented. No `TransformMatchingTex` equivalent exists. Feasible
with manual token IDs; a `Latex`-node approach fits the Motion Canvas stack.**

### How equations are rendered today

- **Inside Motion Canvas scenes:** as **plain `Txt` nodes**. `makeOverlayLabel` /
  `makeLabel` (`sceneKit.ts:158-204`) build single `Txt` nodes; beats set their text
  imperatively (`eigenvectorsDerivationScene.ts:238-239`, e.g. `setTop("(A − λI)v = 0")`,
  `setTop("det(A − λI) = 0")`). Superscripts/symbols are Unicode strings ("λ²"), not
  math layout. **There is no `@motion-canvas/2d` `Latex` node in use.**
- **In the React lesson layer:** KaTeX via `EquationBlock` / `ProseWithMath`
  (`output: "htmlAndMathml"`), rendered as one HTML/MathML block per equation. The
  derivation sidebar renders `$${step.equation}$` (`DerivationStepNav.tsx:60`).

### Consequences for morphing

- **Expressions are one rendered object, not semantic tokens.** Neither the scene
  `Txt` nor the KaTeX block exposes per-term nodes, so **matching terms cannot
  preserve identity across steps** and **term positions cannot be measured** today.
- **Current transition capability = replace/crossfade only.** Beats swap `Txt`
  strings; there is no term-level morph. The one genuine morph in the stack is
  `morphMatrixEntries` (`sceneKit.ts:99-113`), which tweens **numeric matrix entry
  signals**, not symbolic tokens — useful for `A → A − λI` numerically, not for
  `Av=λv → (A−λI)v=0`.
- **No helper resembling `TransformMatchingTex` exists.** Searched: none.

### What would fit the existing stack

1. **Motion Canvas `Latex` node** (available in `@motion-canvas/2d`) rendered per
   *sub-expression*, positioned via the existing safe-frame anchors. Assign **manual
   token IDs** (e.g. the shared `A`, `v`, `λ` fragments) and tween position/opacity
   between steps. Manual IDs would be **sufficient for a first pilot** — no automatic
   TeX-diffing needed for a 3-rung ladder.
2. **Reuse the semantic step ids** already in `derivationSteps.ts` to key the
   before/after fragment sets, so the morph aligns with `majorStepId` sync.
3. Keep all numeric values from `eigenDerivation2x2` (no TeX in `src/math`).

### Safest pilot and risks

- **Safest pilot:** the determinant expansion `det([[a,b],[c,d]]) → ad − bc`, or
  rung 1→2 of the eigen ladder (`Av = λv → (A−λI)v = 0`). Both have a small, stable
  token set and an existing geometric beat to bind to.
- **Technical risks:** `Latex` node layout/measurement differs from `Txt`
  (safe-frame clipping already caused two logged caption bugs); font/stroke
  consistency with the current `Txt` look; caching/`cachePadding` for KaTeX-rendered
  SVG.
- **Mathematical-correctness risks:** a morph that visually "moves `λv` across the
  equals sign" must not imply an illegal manipulation; the honesty rule
  (`MATH_CORRECTNESS.md` visual-interpolation section, `animation-quality-bar.md`
§6) applies — the transition is a **notational rearrangement**, and mislabeling it
as a transformation would assert false mathematics.

---

## 10. Interaction and state integrity

**Status: Implemented for playback; no persistence; some redundant control paths.**

### Controls and behavior

- **Play / Pause / Replay:** `GuidedScenePlayer.tsx:183-194`. Replay resets and
  re-plays (guarded by reduced-motion + autoplay). Covered by e2e for all four
  lessons.
- **Previous / Next idea:** `goPrevIdea`/`goNextIdea` (L197-212) seek to adjacent
  `majorSteps[i].at`. **First/last clamp correctly** (`Math.min(..., length-1)` and
  `<= 0` guard). Only **Next idea** is e2e-tested (`m45-experience.spec.ts`); Prev is
  not.
- **Idea dots:** seek to `step.at` (L305-316); `aria-current` on the active dot.
- **Scrubber:** shown only when `state.canSeek` (L321-335); `aria-valuetext` percent.
  Progress is observed in e2e but **direct drag/typing on the scrubber is not tested**.
- **Replay after manual scrubbing:** `handleReplay` calls `engine.reset()`
  unconditionally, so it recovers from any scrubbed position.
- **Rapid clicking / interrupted transitions:** seek/play are idempotent on the
  engine; step nav clicks bump `seekGeneration` → remount (debounced by React
  batching). No explicit guard against a burst of remounts, but the single-renderer
  invariant limits active engines to 1 (unit-tested in `EigenClipStage.test.tsx`,
  `instrumentation.test.ts`).
- **Browser refresh:** no persistence → returns to the lesson's initial state
  (autoplay re-arms on visibility).
- **Browser back/forward:** `m6-release-polish.spec.ts` asserts no stale state
  across back/forward; routes are declared in `src/app/routes.tsx` with a lazy
  `LazyLessonRoute`.
- **Lesson navigation:** `CourseSidebar` auto-closes drawer on route change; scene
  factory is memoized per `sceneId` so switching lessons disposes+recreates engines
  (`LessonPage.tsx:35-36`).
- **Expanded-scene state / 2D↔3D switching:** `majorStepId` preserved; engine
  remounts (see §5). Single-renderer invariant enforced.
- **Explorer reset:** `handleReset` restores default matrix + vector + toggles
  (`EigenvectorExplorer.tsx:96-101`); also remounted by `resetToken` key.
- **Progress persisted:** **No.** No lesson/exercise/step progress in storage.
- **Can simultaneous controls create inconsistent state?** Low risk. All playback
  controls funnel through the single `engineRef`; the notebook is read-only. The one
  latent inconsistency is that the **page notebook does not reflect the animation's
  current step**, so the two surfaces can *appear* out of sync (not a state bug, a
  presentation gap).

### Duplicated vs. intentional-alternative controls

- **Three ways to move between ideas:** Prev/Next buttons, dot rail, and scrubber
  (`GuidedScenePlayer.tsx:254-335`). Prev/Next + dots are **intentional
  alternatives** (linear vs. random access); the scrubber is a distinct affordance
  (continuous). Reasonable, though the dot rail + Prev/Next overlap heavily.
- **Two step-navigation surfaces:** page dot rail (no labels) vs. modal
  `DerivationStepNav` (labeled, with equations). Intentional (compact vs. expanded),
  but a learner on the page cannot click a *named* step.
- **Matrix entry via sliders and presets** in the explorer — intentional
  (precision vs. curated).

---

## 11. Accessibility

**Status: Basic accessibility implemented per the POC bar; several gaps beyond it.**
(Full detail gathered from CSS/JSX inspection.)

**Implemented**

- **Reduced motion:** `usePrefersReducedMotion` hook; CSS kills transition durations
  (`tokens.css` `@media (prefers-reduced-motion)`); player skips autoplay, seeks the
  first major step, and shows a note (`GuidedScenePlayer.tsx:108-112,247-251`); 3D
  disables orbit damping. **Reduced motion preserves the conceptual sequence** via
  Prev/Next idea + discrete seeks — the sequence is not lost, only the tweening.
- **Visible focus:** global `:focus-visible` outline (`globals.css`); token
  `--color-focus`.
- **Keyboard / focus management:** modal focus trap, Escape close, focus
  restoration to the Expand button (`EigenClipModal.tsx:50-89`; unit-tested).
- **aria-live:** polite regions on the "Watching now" title, step caption, explorer
  summary, exercise feedback, checkpoint answer, 3D caption. Errors use
  `role="alert"`. Announcements are **appropriately polite, not excessively
  verbose**.
- **Diagram descriptions:** Mafs `role="img"` + `ariaLabel`; guided canvas
  `role="img"` + `aria-label`; SVG fallback `aria-label`; scene `ariaLabel`s in
  `sceneMeta.ts` are detailed and correct.
- **Slider keyboard support:** native `<input type=range>` with `aria-valuetext`
  (matrix + timeline sliders) — native arrow/Home/End work.
- **Color-independent cues:** dashed transformed/eigendirection lines, legend
  swatches that encode line style, orientation edge labeled "(dashed)", numbered
  step badges + inset bar for the active derivation step.
- **Math a11y:** KaTeX emits MathML (`EquationBlock`, `output: "htmlAndMathml"`;
  unit-tested).

**Gaps (mostly beyond the documented POC scope, but worth recording)**

- **Static diagram `aria-label`s.** Mafs/guided labels do not update as
  sliders/parameters change; screen-reader users rely on the separate text readouts.
- **No skip-to-content link.**
- **Sidebar drawer lacks a focus trap** (unlike the modal); focus can tab behind the
  overlay.
- **Small touch targets:** idea dots ~11px, exploration checkboxes ~17px (below the
  common 44px guideline). Standard `.btn` is ~40px.
- **Derivation-nav equations are ellipsized** (`DerivationStepNav.css` `text-overflow: ellipsis`),
  so long math can be visually truncated in the button label.
- **3D WebGL canvas** has no accessible name of its own; relies on surrounding prose
  + `aria-live` caption.
- **No high-contrast / forced-colors handling** beyond the default light theme.

**Test vs. manual:** automated coverage is limited to Escape/focus-restore, error
roles, `aria-current`, MathML, and reduced-motion banner. Tab order, full keyboard
control of the player/explorer, and screen-reader narration are **manual only**.

---

## 12. Responsive behavior

**Status: Implemented via flex-wrap + container queries; reading order preserved;
a few narrow-width crowding risks.**

**Implemented**

- **Reading order preserved on stack.** Watch phase is `flex-wrap` with explanation
  first, visualization second (`LessonLayout.css` `.lesson-layout__watch`,
  `LessonLayout.tsx:97-100`); the worked example is scene-first, steps-second
  (`WorkedExamplePanel.tsx:79-113`). On narrow screens both stack **equation/visual
  above, prose below** — the equation stays adjacent to its visualization.
- **Container queries** make the visualization sticky beside prose at ≥58rem
  (`LessonLayout.css` `@container lesson-watch`, `WorkedExamplePanel.css`
  `@container worked-example`) — a modern, width-aware approach rather than many
  viewport breakpoints.
- **Sidebar → drawer at ≤960px** (`AppShell.css`, `CourseSidebar.css`), with a
  hamburger "Contents" toggle (`aria-expanded`/`aria-controls`) and backdrop; sticky
  sidebar above that. Sidebar does not consume excessive space on desktop
  (`--sidebar-width: 17.5rem`).
- **Explorer** stacks scene/controls at ≤900px (`ExplorationPanel.css`); modal viz +
  step nav stack at ≤36rem (`EigenClipModal.css`).
- **Long equations:** block equations scroll horizontally (`EquationBlock.css`
  `overflow-x: auto`).
- **Zoom:** guided scenes use `object-fit: contain` + safe frame, so content survives
  scaling; Mafs pan/zoom disabled by design.

**Risks / gaps**

- **Inline KaTeX is `white-space: nowrap`** and can overflow horizontally in narrow
  inline contexts without its own scroll.
- **Derivation-nav equations truncate** rather than scroll (also an a11y note).
- **`SceneReadout` uses a fixed 2-column grid** with no narrow-width stack — can
  crowd in a squeezed side panel.
- **No dedicated browser-zoom/text-scaling strategy** beyond a handful of typographic
  breakpoints (≤720px title/question/takeaway sizing).
- Automated responsive checks exist (aspect-ratio + no-horizontal-overflow at four
sizes, canvas resize) but there is **no 200%-zoom test and no mobile-width visual
assertion**.

---

## 13. Test coverage and blind spots

**Status: Strong math + wiring + explorer coverage; motion/visual/a11y largely
manual.** 38 test files (29 Vitest unit, 9 Playwright e2e); 185 unit tests passing.
Runners: `vitest.config.ts` (jsdom), `playwright.config.ts` (Chromium, dev server).

**Well covered**

- **Math correctness:** `src/math/__tests__/eigen.test.ts`, `eigen3.test.ts`,
  `m5-classify.test.ts`, `invariants.test.ts`, `matrices.test.ts`, `vectors.test.ts`,
  `examples.test.ts`, `mathjs-validation.test.ts`. Boundary cases tested: distinct /
  scalar / defective / zero-λ / negative-λ / complex, **discriminant≈0 at tol 1e-6**,
  near-singular determinant, 3×3 extension (complex quadratic, collapse-to-plane),
  FP tolerances (1e-12/1e-9). Cross-validated against `mathjs` (dev-only).
- **Lesson wiring / grading:** `lessonWiring.test.ts` (scenes resolve, monotonic
  step markers, tiers, eigen embeds the derivation worked example),
  `grading.test.ts` (order-insensitive eigenvalues, tolerances).
- **Explorer continuity:** per-explorer tests assert shared example ids, readouts,
  presets, reset; `registry.test.tsx` lazy-load; `e2e/math-grid-correctness.spec.ts`
  regression for the grid-bug matrix.
- **Guided-scene sync (structural):** `sceneTimings.test.ts` (order, monotonic,
  min durations), `EigenClipStage.test.tsx` (semantic step map, modal seek,
  step-persists-after-close, single-renderer), `unknownSceneIds` / `sceneDescriptions`.
- **3D lifecycle:** `eigen3.test.ts` (math), `EigenClipStage.test.tsx` (WebGL-unavailable
  fallback, single active engine, dispose cycles), e2e (no three.js on non-eigen
  lessons, canvas count bounded).
- **Reduced motion / focus / errors:** `SvgFallbackEngine.test.ts`,
  `m45-experience.spec.ts`, modal focus tests, `ErrorBoundary.test.tsx`.

**Blind spots (rely on manual confidence)**

- **No visual/screenshot regression in CI.** No `toMatchSnapshot`, no pixel diff;
  `tmp-screenshots/` is ad-hoc/gitignored. Motion quality, label placement, and
  clipping are verified by manual Playwright/MCP review only.
- **`WorkedExamplePanel` and `DerivationStepNav` have no dedicated unit tests**
  (covered only indirectly). Given §3, the *rendering of the five-field template* is
  untested.
- **Playback UI controls** (play/pause/replay/dots) have no unit tests; **Prev idea**
  and **direct scrubber interaction** are not e2e-tested.
- **Near-singular *eigen* analysis** (vs. determinant) is untested; **no test
  asserts absence of classification flicker** while dragging.
- **Explorer boundary crossing** (distinct↔complex, hitting defective) is not
  exercised in the UI.
- **Keyboard tab order / screen-reader narration / 200% zoom / mobile visual** —
  manual only.

### Is `animation-quality-bar.md` referenced by implementation or workflow?

**Documentation only.** No source file imports or enforces it; no test encodes the
0–2 rubric or the ≥16/20 gate. `sceneKit.ts` comments allude to "quality-bar
patterns" and the doc cross-links `sceneKit.ts`/`registry.tsx`, but the QA rubric,
the per-beat script contract, and the cold-review requirement are **not wired into
any automated check or PR template**. It is aspirational guidance, not an active
gate.

---

## 14. Current architectural trajectory

**Where the code is actually heading:** toward **reusable pedagogical
infrastructure demonstrated on one deep lesson (eigenvectors/Lesson 4)**, with 3D
and derivation-authoring as the newest surfaces.

Evidence:

- The recent additions are almost all Lesson-4 depth + shared scaffolding:
  `WorkedExamplePanel`, `DepthLayer`, `MisconceptionCallout`, `SolutionReveal` +
  `solutionVisuals/registry`, `EigenClipStage`/`EigenClipModal`, `derivationSteps.ts`,
  `threeD/Eigen3DExtension`, `eigenFormat.ts`, `matrices3.ts`/`eigen3.ts`/`examples3.ts`
  (all untracked/modified in the working tree).
- `docs/lesson-depth-pattern.md` explicitly frames Lesson 4 as the **reference to
  propagate** to Lessons 1–3.
- The curriculum seeds forward nodes (`curriculum.ts`: change-of-basis, SVD) but
  they are `kind: "future"` placeholders.
- `project-core.mdc` says Lessons 1–2 + M4.5 polish are the "active product
  surface" and that Lessons 3–4 should not be expanded unless reopened — yet the
  bulk of recent work **is** in Lessons 3–4. This is a live tension between the
  stated scope guard and where energy is going.

**What it is optimizing for (ranked by evidence):**

1. **Building reusable animation/derivation infrastructure** (strongest signal).
2. **Deepening pedagogy** on a single flagship lesson.
3. **Supporting multiple representations** (2D derivation + 3D extension + explorer).
4. **Formal mathematical rigor** (the `src/math` discipline is excellent).
5. Visual polish (real but subordinate; logged caption fixes).
6. Explorer breadth, 3D extensions (present, narrow).
7. **Authoring efficiency, personalization, adding-more-lessons** — *not* currently
   optimized; these are latent.

**Tensions that could steer away from the stated philosophy:**

- **Scaffolding-first authoring vs. "trust human inference."** The five-field
  `WorkedStep` template + the §10/§17 checklists institutionalize
  over-explanation. The vision doc argues against it in prose, but the *tooling*
  rewards filling every field. This is the central philosophical drift and the
  reason for this audit.
- **Generalizing a DSL from one lesson.** `WorkedStep`/`DepthLayer`/`AuthoredCallout`
  are generic but exercised by one lesson — the exact "rigid DSL before a second
  consumer" risk named in `lesson-depth-pattern.md:92`.
- **Triple-authored step text** (scene caption, sidebar caption, notebook prose)
  keyed by the same ids but with no shared source — a drift and redundancy risk as
  lessons multiply.
- **Infrastructure depth outpacing lesson breadth.** Four lessons, one of them very
  deep; the machinery (3D, modal, derivation nav) is heavier than the current
  content needs, which is fine for a reference but risks over-fitting the
  abstractions to eigenvectors.

---

## 15. Highest-value next decisions

Framed as decisions, not a plan (no implementation prescribed).

1. **Decide the derivation model before propagating Lesson 4.** Adopt a selective
   schema (equation + optional `explanation`/`insight`/`misconception`) *now*, while
   only one lesson uses `WorkedStep`, so the migration cost is one lesson, not four.
   This is the single highest-leverage decision and directly serves "trust human
   inference." (Change set enumerated in §3.)
2. **Unify step text at one source.** Key scene captions, sidebar captions, and
   notebook prose off a single per-step record so the three surfaces cannot drift.
3. **Bring the active-step highlight to the lesson page**, or consciously decide the
   page notebook is static context and the modal is the synchronized surface — but
   make it a decision, not an accident.
4. **Decide whether the defective/repeated case should be reachable by exploration**
   (e.g. a snap-to-boundary affordance) or remain preset-only, and document it as
   intended behavior.
5. **Wire `animation-quality-bar.md` into review** (a PR checklist or a lightweight
   scripted gate) or explicitly mark it aspirational — today it is neither enforced
   nor disclaimed.
6. **Pilot equation morphing on one safe derivation** (`det → ad − bc`) with manual
   token IDs and a `Latex` node, gated by the honesty rule — before committing to it
   as a general capability.
7. **Close the cheapest test blind spots:** a `WorkedExamplePanel` render test and a
   Prev-idea/scrubber e2e, since those surfaces are about to change.
8. **Reconcile `project-core.mdc` scope with reality** — either bless Lessons 3–4 as
   active or refocus — so the scope guard stops contradicting the commit history.

---

## 16. Summary table

| Area | Current status | Confidence | Main evidence | Most important unresolved question |
| --- | --- | --- | --- | --- |
| Derivation schema | Partially implemented (biased to over-scaffold) | High | `types.ts:84`; `WorkedExamplePanel.tsx:140-169`; runtime label counts | Adopt selective `explanation/insight/misconception` before propagating? |
| Redundant vs. valuable explanation | Present in authored data | High | `eigenvectors.ts:74-135` (recap/solve-λ redundant; shift/charpoly valuable) | Which rungs keep prose vs. go equation-only? |
| Viz–algebra sync | Partially implemented (modal semantic; page static) | High | `GuidedScenePlayer.tsx:167-181`; `EigenClipModal.tsx:134`; `WorkedExamplePanel.tsx:105` | Should the page notebook track the active step? |
| Guided→explorer continuity | Implemented (exact for the computed example) | High | `exampleData.ts:49`; `EigenvectorExplorer.tsx:26` | Should the Watch opener use the shared matrix too? |
| Layered depth | Implemented; state ephemeral | High | `DepthLayer.tsx`; `LessonPage.tsx:68`; `types.ts:6-13` | Persist expansion / support learner-controlled depth? |
| Edge-case math | Implemented + tested; hard boundary UX | High | `eigen.ts:214-265`; slider `step=0.05` + tol `1e-9` | Make the repeated/defective case explorable? |
| Equation morphing | Not implemented; feasible | High | `sceneKit.ts:158-204`; `eigenvectorsDerivationScene.ts:238` | Pilot with `Latex` + manual token IDs? |
| Interaction / state | Implemented; no persistence | High | `GuidedScenePlayer.tsx:183-212`; no progress in storage | Persist progress / step position? |
| Accessibility | Basic bar met; gaps beyond it | Medium | reduced-motion + aria-live + modal trap; static diagram labels | Which gaps are in-scope for the POC? |
| Responsive | Implemented; minor crowding | Medium | container queries; drawer ≤960px; KaTeX nowrap | 200%-zoom / mobile visual verification needed? |
| Test coverage | Strong math; manual motion/visual/a11y | High | 38 files, 185 unit tests; no visual regression | Add render/interaction tests before schema change? |
| Trajectory | Reusable infra on one flagship lesson | Medium-High | recent additions all Lesson-4 depth; `lesson-depth-pattern.md` | Reconcile scope guard vs. where work is going? |

---

*Prepared as an evidence-based state audit. No code was modified. Runtime artifact:
`audit-worked-example.png` (eigenvectors worked-example scaffolding, captured from
the running dev server).*

