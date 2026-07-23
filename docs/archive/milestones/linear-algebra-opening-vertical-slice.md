# Linear-Algebra Opening Vertical Slice — Redesign Brief

**Scope:** Chapter 0 ("Why Linear Algebra?"), Lesson 1 ("Vectors, Linear
Combinations, Basis, and Coordinates"), Lesson 2 ("Linear Transformations and
Matrices"). Design only — no implementation. Grounded in the current working
tree (baseline: Lesson 1 expansion commit `5479e2e`, but evaluated against the
files as they stand today).

**Central progression this slice must deliver:**

> *Linear algebra describes objects using coordinates and transforms entire
> spaces systematically* → *a basis gives every vector a unique coordinate
> description* → *a linear transformation is determined by what it does to a
> basis.*

Chapter 0 opens the mystery **"How can four numbers determine where every vertex
goes under one linear transformation?"** (the honest form — *not* "four numbers
can reach any picture," which is false); Lesson 1 supplies the coordinate language
that makes the question askable; Lesson 2 resolves it (the four numbers are where
$\mathbf{e}_1,\mathbf{e}_2$ land, and every vertex is a combination of
$\mathbf{e}_1,\mathbf{e}_2$).

Read alongside `docs/product/vision.md` (pedagogy),
`docs/authoring/lesson-design.md` (mechanics), `docs/archive/lesson-depth-pattern.md` (medium
choice), `docs/courses/multi-domain-architecture.md` (why the course tree is
deferred), and `docs/archive/milestones/audit-2026-07-20-state-and-trajectory.md` (schema
history).

---

## 0. Process status and gate compliance (read first)

This slice is governed by the **[Insight Discovery Gate](../../authoring/insight-discovery-gate.md)**.
That gate is mandatory: *a lesson plan may begin only after an Approved Insight
Contract reaches `Gate result: PASS`.* This document is detailed enough to
constitute lesson planning, so it is **gated**:

- **This brief settles pedagogical + mathematical design only.** It does **not**
  authorize implementation. §13's slices and any coding prompt are **blocked**
  until the joint opening-slice contract passes.
- **Required gate artifacts (one joint gate for the whole opening slice):**
  - Stage 1 — [`docs/courses/linear-algebra/lessons/00-opening-slice/insight-brief.md`](../../courses/linear-algebra/lessons/00-opening-slice/insight-brief.md)
    (candidate insights + ranking + discovery sequence).
  - Stage 2 — [`docs/courses/linear-algebra/lessons/00-opening-slice/insight.md`](../../courses/linear-algebra/lessons/00-opening-slice/insight.md)
    (Approved Insight Contract; must end in `Gate result: PASS`).
  - Stage 3 — this brief becomes the [`authoring/templates/lesson-plan.md`](../../authoring/templates/lesson-plan.md)
    plan only *after* that PASS, and must add the template's **insight
    traceability** map (every causal-chain obligation → a learner-facing location
    + observable evidence).
- **Approved joint primary insight** (preserved verbatim from the Stage 2
  contract; learner-facing wording may be shorter):
  > *Unique basis coordinates describe every vector by coefficients, and
  > linearity preserves those coefficients; therefore, the images of the basis
  > vectors determine the transformation of every vector.*
  Chapter 0 supplies the mystery, Lesson 1 establishes unique coordinates, and
  Lesson 2 completes the causal chain. This insight is not a slogan substituting
  for content — it **reorganizes** the definitions, mechanics, examples,
  derivations, consequences, and practice below.
- **Downstream review layer.** After implementation and learner validation, the
  slice is scored with **[`docs/archive/milestones/lesson-quality-review.md`](lesson-quality-review.md)**
  (0–3 rubric, hard blockers, shipping threshold) and its assessments are drawn
  from the pattern library **[`docs/authoring/assessment-patterns.md`](../../authoring/assessment-patterns.md)**
  (recall / reconstruction / transfer coverage). §10 tags each item with its
  pattern; learner-validation uses `docs/authoring/insight-validation-protocol.md`.

The remainder of this document is the gated design. Nothing here is built before
the contract passes.

---

## 1. Current-state findings

Mapped by surface. Verdicts: **keep** / **revise** / **move** / **replace** /
**add** / **defer**. Every claim cites the current file.

### 1.1 Home-page material (`src/pages/HomePage.tsx`)

- `FLOW_STEPS` hardcodes **"Watch → Explore → Practice"** (lines 7–20) and the
  lede says **"Four short lessons"** / "Start with Lesson 1". This is a
  three-verb promise the redesign breaks: Chapter 0 is not a Watch→Explore→
  Practice lesson, and Lesson 1/2 will have lesson-specific routes.
  **Verdict: revise** (soften to a description of the *kind* of course, not a
  universal per-lesson flow; CTA points at Chapter 0).
- Lessons are listed straight from `registry.lessons` with a positional index
  badge (`index + 1`). Adding Chapter 0 as the first registry entry would
  renumber Lesson 1 → "2". **Verdict: revise** numbering (see §2, §11).

### 1.2 Rigid lesson layout (`src/components/layout/LessonLayout.tsx`)

- Fixed phase order, hardcoded titles: **Think about it → Watch the idea →
  Quick check → Worked computation → Try it yourself → Practice → Remember
  this** (lines 80–164). Phases are individually optional *except* **Watch**,
  which is always rendered and always expects both `explanation` and
  `visualization`. `LessonPage` always constructs a `GuidedScenePlayer` from
  `lesson.guidedSceneId` (`LessonPage.tsx:35,74`) and `getGuidedSceneFactory`
  throws on an unknown id — so a guided scene is *de facto* mandatory.
  **Verdict: revise** — make the sequence a **declared, optional, reorderable
  route** (see §6, §11). This is the linchpin change of the slice.

### 1.3 Lesson definition schema (`src/lessons/types.ts`)

- `LessonDefinition` **requires** `guidedSceneId`, `explorationId`, `exercises`,
  `sections`, `keyTakeaway` (lines 144–169). There is **no first-class
  representation for a Definition/Proposition/Theorem/Corollary/Conjecture** —
  formal content is smuggled into `LessonSection.body`/`equation` or a
  `DepthLayer`/`AuthoredCallout`. **Verdict: add** a lightweight `FormalBlock`
  (see §4, §11) and **revise** the schema into a discriminated union
  `StandardLessonDefinition | IntroLessonDefinition` (§11.1): relax
  `guidedSceneId`/`explorationId`/`exercises` to optional for both, and make
  `sections`/`keyTakeaway` optional **only** on the `kind:"intro"` arm — so a
  short Chapter 0 route with no Summary is *valid by construction* while ordinary
  lessons stay strict.
- Reusable, keep-as-is: `DepthLayer` (7 kinds), `WorkedExample`
  (equation-first, no per-step schema — the audit's fix already landed),
  `AuthoredCallout` (belief/confront/resolve), `ExerciseDefinition`
  (multiple-choice / numeric / vector / prediction / eigenvalue), `SolutionReveal`,
  `LessonCheckpoint`, exercise `tier`. **Verdict: keep.**

### 1.4 Lesson 1 (`src/lessons/vectors.ts`)

- Three sections `["vectors","combinations","basis"]` already introduce span,
  independence, basis, and coordinates-in-a-basis; a `math-note` layer carries
  the uniqueness proof; two misconception callouts; an equation-first worked
  example ($[\mathbf{p}]_E$ vs $[\mathbf{p}]_B$); check/drill/transfer
  exercises. Mathematically sound and **compressed too tightly**: the basis
  section fuses span↔existence and independence↔uniqueness into one paragraph
  with no explicit **theorem** statement. **Verdict: keep the content, revise
  the packaging** (promote the central theorem to a `FormalBlock`; expose the
  three span/basis cases as *experienceable* states, not prose).
- The coordinate **challenge** preset only exercises the *independent* pair and
  the already-revealed answer $\mathbf{p}=(1,1)_B$ (`LinearCombinationExplorer.tsx:99–121`,
  `vec-coords-in-basis` in `vectors.ts`). The learner never determines an
  *undisclosed* coordinate. **Verdict: add** the $\mathbf{q}=(-1,5)$ task
  (§8).
- The **dependent** preset shows an unreachable target but never the
  *infinitely-many-representations* case for a reachable target.
  **Verdict: add** the $\mathbf{r}=(3,6)$ inside-span case (§8).

### 1.5 Lesson 2 (`src/lessons/transformations.ts`)

- Only two explanatory sections (`intro`, `grid`). Uses linearity to justify the
  columns rule but **never defines or tests the two linearity properties**;
  never shows a **non-linear** or **affine** map; the scene/explorer transform
  grid + basis + one sample arrow but **no recognizable graphic**; presets
  (`exampleData.ts:70–77`) include reflection and singular-collapse but **do
  not name projection**; there is **no same-transformation-different-matrix**
  example, so "the matrix *represents* the transformation relative to a basis"
  is asserted, not shown. **Verdict: revise heavily + add** (§4, §8, §9).
- The columns rule *is* framed as a consequence of unique coordinates
  (`grid` section body says "consequence", asserted by
  `lessonWiring.test.ts:198`) — good. **Verdict: keep** that framing and make
  it a derivation the learner walks.

### 1.6 Guided-scene beats

- `linearCombinationScene.ts` (11 segments, `sceneTimings.ts:21–33`): plane →
  vector-v → components → vector-w → addition → scaling → combination →
  span-plane → dependent → basis → coordinates. Already has the $[\mathbf{p}]_E
  \to[\mathbf{p}]_B$ beat and a `bGrid` (the $(\mathbf{v},\mathbf{w})$ lattice
  via `makeTransformedGrid`). **Verdict: keep; add** a short beat for the
  dependent-inside-span (infinitely-many) case.
- `matrixTransformationScene.ts` (9 segments, `sceneTimings.ts:35–45`):
  identity → col1 → col2 → sample → transform-sample → grid → compare → presets
  → summary. The `presets` beat tours scale/rotation/reflection/singular but
  transforms only grid+basis+sample. **Verdict: revise** to carry the **shared
  graphic** and **add** a linearity-test beat and a projection/translation/
  nonlinear contrast (§9).

### 1.7 Explorer presets & tasks

- `LinearCombinationExplorer` presets `independent | dependent | challenge`
  (line 36). **Verdict: revise** the challenge into a small family (see §8) and
  **add** a basis-order toggle.
- `MatrixTransformationExplorer` reads `TRANSFORM_LESSON_PRESETS`
  (identity/scale/shear/rotation/reflection/singular). **Verdict: add**
  projection (named), and **add** a "set where $\mathbf{e}_1,\mathbf{e}_2$ land"
  input mode + shared-graphic overlay + a same-transform/two-matrices toggle.

### 1.8 Worked examples, callouts, exercises, summaries

- Lesson 1 worked example + 2 callouts + 5 exercises + checkpoint + takeaway:
  **keep**, extend exercises (§10). Lesson 2 has **no** worked example, 1
  checkpoint, 2 exercises: **add** a linearity/columns derivation (equation-
  first) and transfer items (§10). Summaries (`LessonSummary` = takeaway +
  objectives): **keep**.

### 1.9 Shared visual/mathematical data (`src/lessons/exampleData.ts`, `src/math/examples.ts`)

- `LINEAR_COMBINATION_EXAMPLE` (v=(1,2), wIndependent=(3,−1), wDependent=(2,4),
  target=(4,1), coordinatesInBasis=(1,1)) is the single source of truth for
  Lesson 1 across scene + explorer. **Keep; extend** with q, r, and basis-order
  data. `MATRIX_EXAMPLES` has reflection-across-x, singular-collapse, etc.
  **Add** reflection-across-$y=x$ ($[[0,1],[1,0]]$) and a projection example;
  **add** the shared **opening graphic** vertex data (new). There is **no
  shared graphic today** — this is genuinely new (§7).

### 1.10 Rendering architecture (reusable infrastructure)

- **Reuse:** `sceneKit` (`makeStaticGrid`, `makeTransformedGrid`,
  `makeGhostClosedRegion`, `makeArrow`, `focusOpacities`, `morphMatrixEntries`,
  `ROLE`, `toPixels`), `sceneTimings`/`sceneMeta` (segment→step derivation),
  `MafsSceneShell`, `ParameterControls`, `PresetPicker`, `ExplorationToggles`,
  `SceneReadout`, `ResetButton`, `ProseWithMath` (`VectorTeX`/`MatrixTeX`),
  `EquationBlock`/`EquationSequence`, `DepthLayer`, `MisconceptionCallout`,
  `WorkedExamplePanel`. Math: `matrixVectorMultiply`, `applyMatrixToPoints`,
  `transformedGridSegments`, `areParallel`, `determinant2x2`,
  `assertPointMatchesMatrixTransform` and friends.
- **Genuinely new:** a shared graphic polygon model + a `makeGraphic`
  scene helper (closed `Line` whose `points()` follow the live matrix — a
  10-line variant of `makeGhostClosedRegion`), a `FormalStatement` component, a
  declared-route renderer, and a Chapter 0 scene.

### 1.11 Cross-cutting problems this slice fixes

- **Mathematically sound but too compressed:** Lesson 1 basis paragraph;
  Lesson 2's one-paragraph columns-rule justification.
- **Interactions that demonstrate without assessing:** the coordinate challenge
  (answer pre-revealed); the matrix explorer (transforms but never asks the
  learner to *build* a matrix or *predict* an image against a target).
- **Duplicated explanation risk:** none acute today (worked-example schema
  already de-scaffolded), but the Lesson 1↔2 continuity prose ("coordinates in
  a basis") is authored in three places (section, worked-example layer, Lesson 2
  connection layer) — keep them, but let Chapter 0's mystery own the *hook* so
  Lesson 2 doesn't re-motivate from scratch.
- **Missing justifications:** linearity properties (never stated), columns rule
  as *derivation* (only stated), "matrix ≠ transformation" (never shown).
- **Reusable infra ready to exploit:** `makeTransformedGrid` + `applyMatrixToPoints`
  make the shared-graphic transform nearly free; `sceneMeta` major-step machinery
  gives Chapter 0 idea-navigation for free.

---

## 2. Chapter 0 placement decision

**Options evaluated**

| Option | Feels part of course? | Reuses scene/explorer? | Forces artificial phases? | Nav/numbering | Architecture cost |
| --- | --- | --- | --- | --- | --- |
| (a) Richer HomePage landing | **No** — it *is* the marketing page | Awkward (home is not a lesson route) | n/a | fine | low, but wrong home |
| (b) Registered opening lesson | **Yes** | **Yes** (routing, sidebar, `GuidedScenePlayer`, transform explorer) | **Only if** `LessonDefinition`/`LessonLayout` stay rigid | needs a "Chapter 0" label | **low once §11 route change lands** |
| (c) Distinct course-intro type | Yes | Duplicates routing/nav/render for one artifact | No | bespoke | higher; a parallel content pipeline |

**Recommendation: (b) — a registered opening "lesson," made honest by the
declared-route change in §11.** Rationale:

- `project-core.mdc` forbids inventing "parallel … lesson pipelines"; option (c)
  does exactly that for a single artifact. Option (a) cannot host a guided scene
  + interaction *as part of the course* without turning the home page into a
  lesson anyway.
- The rigid `LessonLayout` is being replaced by a **declared route** for
  Lessons 1–2 regardless (§6). Once a lesson can declare its own ordered
  blocks and omit Practice/Explore, Chapter 0 is simply *a lesson with a short
  route and no exercises* — no artificial phases required.

**Minimum architectural change to enable it (full detail in §11):**

1. `LessonDefinition`: split into a discriminated union
   `StandardLessonDefinition | IntroLessonDefinition` (§11.1). Both gain
   `route?`/`formalBlocks?` and relax `guidedSceneId?`/`explorationId?`/`exercises?`
   to optional; the **intro** arm additionally makes `sections?`/`keyTakeaway?`
   optional and requires `route`. (This is what lets Chapter 0 legitimately have
   no Summary/sections while keeping ordinary lessons strict.)
2. `LessonLayout`: when `route` is present, render blocks in declared order via
   a `kind → renderer` map; otherwise fall back to today's fixed order
   (zero rewrites of existing lessons).
3. `LessonPage`: guard the now-optional scene/explorer/exercises; add a
   `handoff` block (a "Begin Lesson 1" CTA).
4. `registry`/`curriculum`/`CourseSidebar`/`LessonHeader`: when `kind === "intro"`
   render **"Chapter 0"** and keep Lessons **1…N** numbered from the first
   `kind === "lesson"` entry (do **not** shift Lesson 1 to "2"). Chapter 0 lives
   as the opening item of the Linear-Algebra course's **Foundations** module.

**Karatsuba note + the honest numbering fix (scope-limited).** Karatsuba shares
the global `registry.lessons` and appears in the LA sidebar under "Algorithms &
complexity" (`curriculum.ts:38–42`). "Number within the active course" is **not
yet implementable as stated**: the curriculum has **no course identity** — one flat
`COURSE_SECTIONS` list mixes linear algebra and Karatsuba, so there is no
active-course to count from. The minimum honest fix is a small **`courseId`** on
curriculum sections/items (e.g. `"linear-algebra"` vs `"algorithms"`), and then:

- numbering counts `kind:"lesson"` entries **within the same `courseId`**, so
  Chapter 0 is "Chapter 0" of Linear Algebra, Lesson 1 stays "Lesson 1", and
  Karatsuba is numbered inside `"algorithms"` independently;
- this is a single additive field, **not** the full multi-course
  subjects→courses→modules tree (`courses/multi-domain-architecture.md` §2),
  which stays **deferred**.

Without `courseId` the "course-relative" claim has nothing to compute from; with
it, the `kind`-aware header (§11.5) numbers correctly and Karatsuba's number does
not drift.

---

## 3. Content-ownership map

| Concept | Chapter 0 | Lesson 1 | Lesson 2 |
| --- | --- | --- | --- |
| The mystery ("4 numbers move a whole graphic") | **Owns / opens** | — | **Owns / resolves** |
| Vector as arrow; coordinates | uses informally | **Introduces / owns** | recalls |
| Linear combination $a\mathbf{v}+b\mathbf{w}$ | demonstrates (the $(a,b)$ machine) | **Owns** | reuses as $a\mathbf{v}+b\mathbf{w}\mapsto aT(\mathbf{v})+bT(\mathbf{w})$ |
| Span, independence | — | **Owns** | reuses (dependent columns collapse) |
| Basis + unique coordinates (central theorem) | uses (coords exist) | **Owns / derives** | recalls to derive columns |
| Coordinates relative to a chosen basis | — | **Owns** | reuses (matrix relative to a basis) |
| Linear transformation + two properties | shows behavior | — | **Owns / defines / tests** |
| "Determined by action on a basis" | previews | seeds ("coords carry it") | **Owns / derives** |
| Columns rule $A=[T(\mathbf{e}_1)\ T(\mathbf{e}_2)]$ | the *answer* to the mystery | — | **Owns / derives as consequence** |
| Column space / rank / invertibility | — | — | **names as consequence only** |
| Change of basis (general formula) | — | seeds ("same arrow, new name") | previews (two matrices, one map); **defers** the formula |

Rule of thumb, matching the vision doc's concept graph
(`product/vision.md` §14): **Chapter 0 demonstrates surprising
power; Lesson 1 supplies coordinates/bases; Lesson 2 derives *why* it works.** No
concept is *introduced* in two places; recall is explicit and edge-strengthening.

---

## 4. Formal backbone — definitions, propositions, theorems, corollaries

A **lightweight** textbook spine. Labels are used only where mathematically
appropriate; full vector-space axioms are **excluded** (we are in $\mathbb{R}^2$,
concretely). Each block lists: **statement**, **interpretation**, **where**,
**why there**, **support**, **visibility** (visible / progressively-revealed /
optional-reference). Coverage cross-checked (borrowing *coverage & principles,
not wording*) against 3Blue1Brown (geometric narrative), Strang (linear
combinations & columns), Hefferon (definition/proof development & cases), Boyd &
Vandenberghe (applications), Axler (precision on bases & linear maps).

### 4.1 Lesson 1

**Definition (Linear combination).** For vectors $\mathbf{v},\mathbf{w}$ and
scalars $a,b$, the vector $a\mathbf{v}+b\mathbf{w}$ is a *linear combination*.
*Interpretation:* stretch each arrow and add head-to-tail. *Where:* §combinations.
*Why:* the object every later idea is built on. *Support:* `linearCombinationScene`
addition/scaling/combination beats + explorer $a,b$ sliders. *Visibility:* visible.

**Definition (Span).** $\operatorname{span}(\mathbf{v},\mathbf{w})$ is the set of
*all* linear combinations — the set of reachable points. *Interpretation:*
reachability, not "the combinations." *Where:* §combinations. *Why:* separates
"combine endlessly" from "reach." *Support:* span region (independent) vs span
line (dependent) overlay. *Visibility:* visible.

**Definition (Linear independence, 2 vectors).** $\mathbf{v},\mathbf{w}$ are
*independent* iff neither is a scalar multiple of the other (equivalently
$v_1w_2-v_2w_1\neq 0$). *Interpretation:* "not on the same line." *Where:*
§combinations. *Why:* the hinge of uniqueness. *Support:* dependent beat collapses
span to a line; cross-term readout. *Visibility:* visible; algebraic form in a
`math-note`.

**Definition (Basis of $\mathbb{R}^2$).** An ordered pair $B=(\mathbf{v},\mathbf{w})$
is a *basis* iff it is independent and spans $\mathbb{R}^2$. *Interpretation:* a
minimal coordinate language for the plane. *Where:* §basis. *Why:* names the object
the theorem characterizes. *Support:* basis beat. *Visibility:* visible.

**Definition (Coordinates relative to a basis).** If $\mathbf{p}=a\mathbf{v}+b\mathbf{w}$
then $[\mathbf{p}]_B=\begin{bmatrix}a\\b\end{bmatrix}$. *Interpretation:* the
arrow's *name* in $B$'s language. *Where:* §basis. *Why:* the payload Lesson 2
runs on. *Support:* $[\mathbf{p}]_E$ vs $[\mathbf{p}]_B$ beat + worked example.
*Visibility:* visible.

**Theorem (Basis ⇔ unique representation — the central Lesson 1 result).**

> An ordered pair $B=(\mathbf{v},\mathbf{w})$ is a basis of $\mathbb{R}^2$ **iff
> every** vector $\mathbf{x}\in\mathbb{R}^2$ has **one and only one**
> representation $\mathbf{x}=a\mathbf{v}+b\mathbf{w}$.

*Interpretation:* **span ⇒ existence** (you can always name the point);
**independence ⇒ uniqueness** (only one name). *Where:* §basis, as a labeled
`FormalBlock`, the compression payoff of the lesson. *Why:* it is the sentence the
whole lesson collapses into and the seed of Lesson 2. *Support (both directions):*
- *Geometric:* independent arrows generate **two continuous families of parallel
  coordinate lines** (constant-$a$ lines parallel to $\mathbf{w}$, constant-$b$
  lines parallel to $\mathbf{v}$; the `bGrid` in the scene draws the integer
  members of these families). Every point of the plane lies on **exactly one line
  of each family**, and those two lines meet in a single point — so its
  coordinates $(a,b)$ exist and are unique. (The lattice *nodes* mark only the
  integer pairs; the real coefficient pair is the continuous line-intersection,
  not a node.) When the arrows are dependent the two families coincide into one
  direction, so the intersection is not unique — the geometric face of
  non-uniqueness.
- *Algebraic:* the existing `math-note` argument: if $a\mathbf{v}+b\mathbf{w}=
  a'\mathbf{v}+b'\mathbf{w}$ then $(a-a')\mathbf{v}+(b-b')\mathbf{w}=\mathbf{0}$, and
  independence forces $a=a',\ b=b'$.

*Visibility:* **statement visible; the two-direction justification progressively
revealed** (existence line always shown; the uniqueness proof stays in the
`math-note` layer so the main line reads complete without it).

**Conjecture (authentic learner prediction, optional).** Before the theorem:
*"Any two different arrows can name every point."* Confronted by the dependent
pair (§8 case 2) → refined to the theorem. *Visibility:* framed as a prediction
exercise, not a standing block.

### 4.2 Lesson 2

**Definition (Linear transformation).** $T:\mathbb{R}^2\to\mathbb{R}^2$ is *linear*
iff **(additivity)** $T(\mathbf{u}+\mathbf{v})=T(\mathbf{u})+T(\mathbf{v})$ **and
(homogeneity)** $T(c\mathbf{u})=c\,T(\mathbf{u})$ for all $\mathbf{u},\mathbf{v},c$.
*Interpretation:* the map respects combining and scaling — it "moves the whole
plane consistently." *Where:* Lesson 2 opening formal block. *Why:* everything
downstream is a consequence of these two lines. *Support:* the linearity-test beat
+ a predict/test exercise on both properties. *Visibility:* visible.

**Non-example (Translation — an affine map).** $T(\mathbf{x})=\mathbf{x}+\mathbf{t}$,
$\mathbf{t}\neq\mathbf{0}$. Then $T(\mathbf{0})=\mathbf{t}\neq\mathbf{0}$ and
$T(\mathbf{u}+\mathbf{v})=\mathbf{u}+\mathbf{v}+\mathbf{t}\neq T(\mathbf{u})+T(\mathbf{v})$.
*Interpretation:* a genuinely useful motion that **cannot** be an ordinary $2\times2$
linear map because a linear map fixes the origin. *Where:* Lesson 2, as a
productive limitation. *Support:* explorer "translation" toggle showing the graphic
slide while the origin refuses to move under any $2\times2$ matrix. *Visibility:*
visible; the fix (**affine / homogeneous coordinates**, a $3\times3$ embedding) is
**named only**, in a `looking-ahead` layer — **not taught**.

**Counterexample (a nonlinear warp).** e.g. $T(x,y)=(x+0.4\,y^2,\ y)$ (or a swirl).
*Interpretation:* grid lines **bend**; equal spacing is lost. *Support:* explorer
"nonlinear" toggle (a named function, not a matrix — see §9). *Visibility:* visible
as a contrast; no formula memorization.

**Proposition (A linear map is determined by its action on a basis).**

> If $B=(\mathbf{v},\mathbf{w})$ is a basis and $\mathbf{x}=a\mathbf{v}+b\mathbf{w}$,
> then $T(\mathbf{x})=a\,T(\mathbf{v})+b\,T(\mathbf{w})$. Hence $T$ is fixed once
> $T(\mathbf{v}),T(\mathbf{w})$ are known.

*Interpretation:* know two fates, know all fates. *Where:* Lesson 2 core. *Why:*
the bridge from Lesson 1's uniqueness to the matrix. *Support:* derivation beat
(write sample as $a\mathbf{v}+b\mathbf{w}$, apply linearity). *Visibility:* stated;
derivation progressively revealed. *(Reuses Lesson 1's Theorem — a strengthened
concept-graph edge.)*

**Corollary (Standard-basis columns rule — a consequence of the Proposition).**

> Specializing the Proposition to $B=(\mathbf{e}_1,\mathbf{e}_2)$: with
> $\mathbf{x}=x\,\mathbf{e}_1+y\,\mathbf{e}_2$, linearity gives
> $T(\mathbf{x})=x\,T(\mathbf{e}_1)+y\,T(\mathbf{e}_2)$, i.e.
> $A=\begin{bmatrix} T(\mathbf{e}_1) & T(\mathbf{e}_2)\end{bmatrix}$ and
> $A\mathbf{x}=x\,(\text{col}_1)+y\,(\text{col}_2)$.

*Interpretation:* the columns are literally where $\mathbf{e}_1,\mathbf{e}_2$ land —
a **derived corollary** of the basis-determination Proposition (unique coordinates
+ linearity), not a convention. *(One label only: it is a corollary, not a
free-standing theorem.)*
*Where:* Lesson 2 core (this is the answer to Chapter 0). *Support:* `col1`/`col2`
scene beats bind each column to the landing tip. *Visibility:* visible.

**Corollaries (state as consequences; do not teach procedures).**
1. Every output $A\mathbf{x}$ is a linear combination of $A$'s columns. *(visible)*
2. The set of possible outputs is the span of the columns (**column space** — named
   only). *(optional-reference)*
3. Dependent columns collapse the plane to a line or point (singular). *(visible;
   ties to the projection/collapse preset and Lesson 3 preview)*
4. If $T(\mathbf{e}_1),T(\mathbf{e}_2)$ still form a basis, $T$ is **reversible**
   (invertible — named only). *(optional-reference)*
5. **Every linear transformation fixes the origin:** $T(\mathbf{0})=\mathbf{0}$.
   *(visible; used to explain why translation is excluded)*

**Proposition (A matrix represents $T$ relative to chosen bases).** The same map
has different matrices in different bases; the standard matrix is $T$ *relative to*
$(\mathbf{e}_1,\mathbf{e}_2)$. *Support:* the reflection-across-$y=x$ example (§8):
in standard coordinates $[T]_{E\leftarrow E}=\begin{bmatrix}0&1\\1&0\end{bmatrix}$;
using the basis $B=((1,1),(1,-1))$ for **both** domain and codomain, the *same*
reflection is
$[T]_{B\leftarrow B}=\begin{bmatrix}1&0\\0&-1\end{bmatrix}=\operatorname{diag}(1,-1)$.
*Visibility:* visible statement; the **general change-of-basis formula is
deferred**.

### 4.3 Smallest content-model + rendering change for these blocks

Add **one** type and **one** component (details in §11): `FormalBlock`
`{ id; kind: "definition"|"proposition"|"theorem"|"corollary"|"conjecture"|"lemma"|"axiom";
label?; statement: string /* KaTeX-in-prose */; interpretation: string;
visibility: "visible"|"revealed"|"reference"; layers?: DepthLayer[] }`, rendered by
a small `FormalStatement` component (a labeled, subtly-styled block reusing the
`ExplanationBlock`/`MisconceptionCallout` visual grammar and `ProseWithMath`).
`revealed` blocks wrap their justification in the existing `<details>` depth
mechanism; `reference` blocks render as a muted aside. **No general DSL, no
per-step schema** — this is the fields-a-textbook-actually-labels set and nothing
more.

---

## 5. Existing-material disposition (per item)

| Item | File | Disposition |
| --- | --- | --- |
| `FLOW_STEPS` "Watch→Explore→Practice" | `HomePage.tsx` | **revise** to describe the course, not a per-lesson law |
| "Four short lessons" lede + CTA | `HomePage.tsx` | **revise** ("Start at Chapter 0") |
| Fixed 7-phase order | `LessonLayout.tsx` | **replace** with declared-route renderer (+ fallback) |
| Required `guidedSceneId`/`explorationId`/`exercises` | `types.ts` | **revise** to optional (discriminated union; intro also relaxes `sections`/`keyTakeaway`) |
| Lesson 1 three sections | `vectors.ts` | **keep**; add theorem `FormalBlock`, tighten prose |
| Lesson 1 uniqueness `math-note` | `vectors.ts` | **keep** (becomes the theorem's `revealed` justification) |
| Lesson 1 `[p]_E`/`[p]_B` worked example | `vectors.ts` | **keep**; append the $\mathbf{q}$ result |
| Lesson 1 two callouts | `vectors.ts` | **keep** |
| Coordinate challenge (independent only) | explorer | **revise** into a 3-case family + add $\mathbf{q}$ |
| Dependent preset (unreachable only) | explorer/scene | **add** inside-span $\mathbf{r}=(3,6)$ case |
| Lesson 2 two sections | `transformations.ts` | **revise/expand** (linearity def, derivation) |
| Lesson 2 checkpoint & 2 exercises | `transformations.ts` | **keep**; **add** transfer items (§10) |
| Lesson 2 presets | `exampleData.ts` | **add** projection (named); keep others |
| Matrix scene `presets` tour | `matrixTransformationScene.ts` | **revise** to carry the graphic; **add** linearity + nonlinear/affine contrast |
| Shared graphic | — | **add** (new `OPENING_GRAPHIC` data + `makeGraphic`) |
| Change-of-basis general formula | — | **defer** |
| Column space / rank / invertibility procedures | — | **defer** (name only) |
| Affine/homogeneous $3\times3$ machinery | — | **defer** (name only) |
| Karatsuba placement / multi-course tree | `curriculum.ts` | **defer** the tree; **add** only a minimal `courseId` field to enable course-relative numbering now |

---

## 6. Learner route for each part

Each part declares its own route (the §11 mechanism). We do **not** force all
three into the current phase order; each sequence follows the part's intellectual
purpose. For every route: sequence → what today's renderer already supports →
optional / reorderable / new-block / built-from-existing.

### 6.1 Chapter 0 — "Why Linear Algebra?" (create the mystery)

**Sequence:** ① Hook question → ② Watch the graphic move under a matrix (guided
scene) → ③ *You* try four numbers (bounded interaction) → ④ The mystery, stated →
⑤ Handoff to Lesson 1. **No Check / Practice / Summary.**

- *Supported today:* `GuidedScenePlayer`, `MotivatingQuestion`, the matrix
  explorer (reused), `LessonHeader`, nav.
- *Optional (omit):* checkpoint, worked example, exercises, key takeaway.
- *Reorderable:* Watch and the interaction are both about the same graphic; the
  route places Watch first (guided-before-explore, non-negotiable) then hands
  over control.
- *New lightweight block:* `handoff` (a CTA block → `/lesson/vectors`), and a
  `formal` **open-question** block stating the precise mystery — **"How can four
  numbers determine where every vertex goes under one linear transformation?"**
  (Not the *false* conjecture "four numbers can reach any picture": four matrix
  entries cannot produce arbitrary pictures or arbitrary deformations — only the
  images of $\mathbf{e}_1,\mathbf{e}_2$ under one *linear* map. The question is
  posed as an honest open question carried into Lessons 1–2, not a claim.)
- *Built from existing:* everything else (scene = new content in an existing
  scene shell; explorer = the Lesson 2 explorer restricted to the graphic).

**Real-world application layer (sustained, not a montage).** The **game-object
graphic is the sustained application** — the same small craft the learner
transforms *is* the running example, presented plainly as "how a game or graphics
engine moves an object." After the mystery is posed (step ④), add exactly **three
short transfer connections** — one line each, effects only, no new math — so the
learner sees the idea is general without a domain parade:
1. **Computer graphics & animation / game engines** — every rotate, scale, shear,
   or flip of a sprite/model is this $2\times2$ (in 2-D) acting on its
   vertices/control points; animation interpolates between such transforms.
2. **Robotics & physics** — a robot arm or rigid body's orientation change is a
   linear map on coordinates (rotations/reflections); the same columns-are-images
   idea places a frame.
3. **Data & machine learning** — a linear layer / feature map transforms whole
   coordinate vectors at once; "what happens to the axes" is again the columns.

Each is **one sentence + one visual cue**, deferred in depth; the honest precision
guard (§7.7) applies — these map **coordinates of vertices/control points**, not
"pixels." Camera/coordinate-system and image-processing links are mentioned only if
they fit in a single caption; otherwise they wait. This keeps Chapter 0 a
*motivating* introduction (effects before calculations), consistent with
`product/vision.md`, without turning it into a marketing reel.

### 6.2 Lesson 1 — Vectors, Combinations, Basis, Coordinates (supply the language)

**Sequence:** Think → Watch (build combinations, span, dependent-vs-independent,
basis, coordinates) → **Theorem** (basis ⇔ unique representation) → Quick check
(did $\mathbf{p}$ move?) → Explore (three span cases + coordinate challenges) →
Practice → Remember. This is close to today's order with the **theorem promoted to
a first-class block between Watch and Check**.

- *Supported today:* the whole current flow.
- *Should become optional:* the theorem's algebraic justification (already a
  layer) stays `revealed`.
- *Must become reorderable:* insert the `formal` theorem block after Watch (the
  fixed layout cannot express "a labeled theorem here" today).
- *New block:* `formal` (Definitions + Theorem).
- *Built from existing:* scene, explorer, worked example, callouts, exercises.

### 6.3 Lesson 2 — Linear Transformations and Matrices (derive why)

**Sequence:** Think (recall Chapter 0's mystery) → **Definition** (linear + two
properties) → Watch/Test (predict & test additivity/homogeneity; meet
translation & a nonlinear warp as non-examples) → Derivation (Proposition →
columns rule, equation-first worked computation beside the scene) → **Corollaries**
(outputs are column combinations; dependent columns collapse; $T(\mathbf 0)=\mathbf
0$) → Quick check → Explore (build a matrix from basis images; same map, two
matrices; projection) → Practice (transfer) → Remember (resolve the Chapter 0
mystery explicitly).

- *Supported today:* Watch, worked-computation phase, explorer, practice.
- *Should become optional/reorderable:* Definition **before** Watch; two `formal`
  blocks (Definition, Corollaries) interleaved; the derivation lives in a
  `WorkedExample` (equation-first) embedded in the worked-computation phase.
- *New block:* `formal` (Definition, Proposition, Corollaries); the
  linearity-**test** interaction (built into the explorer, no new component).
- *Built from existing:* `matrixTransformationScene` (extended), the matrix
  explorer (extended), `WorkedExample`/`EquationSequence`.

**Design guard:** we are **not** replacing one fixed template with another. The
route is a *composition* of existing block renderers in a declared order; a part
that says nothing keeps the current default order.

---

## 7. Shared graphic + visual-system specification

### 7.1 One shared geometry model (no duplication, no numeric drift)

Store **once** (proposed `src/lessons/openingGraphic.ts`, re-exported through
`exampleData.ts`), consumed by the Chapter 0 scene, the Chapter 0/Lesson 2
explorer, and Lesson 2's scene:

```ts
export interface OpeningGraphic {
  id: "opening-explorer";
  /** Closed outline in MATH space (y up), centered near the origin, |coord| ≲ 1.7
      so matrices in [-3,3] keep it on-frame. Intentionally ASYMMETRIC so
      reflection and rotation are unmistakable. */
  outline: readonly Vector2[];
  /** Two named vertices tracked across every transform for correspondence. */
  anchors: { nose: number; rightFin: number }; // indices into `outline`
}
```

Reference instance (a small asymmetric "explorer craft"; a bigger right fin
breaks symmetry):

```
nose        ( 0.0,  1.6)   ← anchor "nose"  (gold)
rShoulder   ( 0.5,  0.4)
rFin        ( 1.1, -0.9)   ← anchor "rightFin" (gold, larger fin)
rBase       ( 0.4, -0.6)
tail        ( 0.0, -1.0)
lBase       (-0.4, -0.6)
lFin        (-0.7, -1.1)
lShoulder   (-0.5,  0.4)
```

All transforms map vertices via the **shared math** `applyMatrixToPoints(A, outline)`
(explorer, Mafs `Polygon`) and `matrixVectorMultiply(A, v)` per-vertex in the scene
— **never** ad-hoc geometry, per `math-visualization-correctness.mdc`. A regression
test asserts the graphic's transformed vertices equal `applyMatrixToPoints`
(reusing `assertPointMatchesMatrixTransform`).

### 7.2 The coordinate machine bridge

- **Chapter 0 / Lesson 1 framing:** $(a,b)\mapsto a\mathbf{v}+b\mathbf{w}$ — the
  learner turns two knobs and reaches points. Lesson 1's question: *for which
  pairs $(\mathbf{v},\mathbf{w})$ is the resulting point unique for every target?*
  (Answer: exactly when they form a basis — §4 Theorem.)
- **Lesson 2 framing:** the *same* machine, transformed:
  $a\mathbf{v}+b\mathbf{w}\ \mapsto\ a\,T(\mathbf{v})+b\,T(\mathbf{w})$. Applied to
  $\mathbf{e}_1,\mathbf{e}_2$ this is the columns rule. The graphic is the machine
  applied to *every vertex at once*.

### 7.3 Persistent elements across all three parts

Origin dot; subdued static reference grid; a live transformed grid
(`makeTransformedGrid` / `transformedGridSegments`); the shared graphic (original,
dashed/ghost + transformed, solid); $\mathbf{e}_1,\mathbf{e}_2$ (and their images);
overlay caption + equation in the safe frame (`safeFrame.ts` anchors).

### 7.4 Semantic colors (map to existing `--role-*` / `sceneKit.ROLE`)

| Object | Token / ROLE | Note |
| --- | --- | --- |
| $\mathbf{v}$ / $\mathbf{e}_1$ (first basis) | `--role-basis-1` / `ROLE.basis1` (green) | "first basis vector" is always green |
| $\mathbf{w}$ / $\mathbf{e}_2$ (second basis) | `--role-basis-2` / `ROLE.basis2` (violet) | always violet |
| input $\mathbf{x}$ | `--role-original` / `ROLE.original` (blue) | |
| output $A\mathbf{x}$ | `--role-transformed` / `ROLE.transformed` (amber) | dashed = image |
| original graphic | `--role-original` (blue), **dashed/ghost** | prior state grammar |
| transformed graphic | `--role-transformed` (amber), solid | current state |
| highlighted / anchor vertex | `--role-selected` / `ROLE.selected` (gold) | correspondence cue |

This reuses today's explorer/scene mapping exactly (`LinearCombinationExplorer`
`ROLE_V=basis-1`, `MatrixTransformationExplorer` `e1=basis-1`), so no palette drift.

### 7.5 States, correspondence, grid, matrix↔basis highlighting

- **Side-by-side vs overlaid:** default **overlaid** (ghost original + solid
  transformed in one frame) so vertex motion is legible; a toggle offers a
  side-by-side "before | after" for the graphic. Reduced motion prefers
  side-by-side (no tween).
- **Vertex correspondence:** the two gold anchors (nose, rightFin) are dotted and
  labeled in both original and transformed graphic; a faint connector shows where
  each anchor went. This is the "four numbers moved *this* corner *there*" hook.
- **Grid under reflection/projection/collapse:** always via
  `transformedGridSegments` endpoints. Reflection flips a grid family across the
  mirror line; **projection/singular** collapses one grid family onto a line and
  the graphic **flattens** onto that line — multiple distinct vertices land on the
  same point (visible information loss; Lesson 3 preview, corollary 3 in §4).
- **Matrix→basis highlighting:** hovering/selecting column 1 brightens
  $\mathbf{e}_1$'s image + its tip coordinates (the existing `col1` beat pattern);
  column 2 ↔ $\mathbf{e}_2$. In the explorer, editing $a_{11},a_{21}$ (column 1)
  pulses the green image vector.
- **Playback / scrubbing / presets / controls:** scenes reuse
  `GuidedScenePlayer` (Play/Pause/Replay, idea dots from `sceneMeta.majorSteps`,
  scrubber when `canSeek`). Explorer reuses `PresetPicker`, `ParameterControls`
  (matrix entries + input), `ExplorationToggles` (graphic on/off, grid, ghost,
  side-by-side), `ResetButton`, `SceneReadout`.
- **Reduced motion:** honored by the existing player path (skip autoplay, seek to
  first major step, discrete Prev/Next ideas); the graphic uses static
  before/after instead of tweening.
- **Responsive:** scenes keep the safe frame + `object-fit: contain`; explorer
  stacks scene/controls at ≤900px (`ExplorationPanel.css`). Graphic coordinates are
  bounded so it never clips.
- **Accessible descriptions / non-color cues:** `role="img"` + `ariaLabel` on the
  Mafs scene and canvas (as today); the graphic uses **dashed = original, solid =
  transformed** (line-style, not color); anchors are **labeled**; text readouts
  state the matrix, $A\mathbf{e}_1$, $A\mathbf{e}_2$, and "graphic collapsed onto a
  line" when singular.

### 7.6 Chapter 0 vs Lesson 2 — same language, different sequence

Chapter 0: *behold* — a curated sweep (identity → a striking transform, e.g.
rotation then shear, then a collapse) that provokes "four numbers did all that?"
with **no** column explanation. Lesson 2: *explain* — the same graphic, but now
the sequence isolates $\mathbf{e}_1,\mathbf{e}_2$, derives the columns, and returns
to the graphic to show the vertices following from the two basis images. **Same
visual vocabulary; they never replay the same beat list.**

### 7.7 Precision guard (mathematical honesty)

A $2\times2$ matrix maps the **coordinates of the graphic's vertices / control
points** — **not "pixels."** All copy and captions must say "vertices" / "control
points." Translation is presented as a **productive limitation**: it moves the
graphic but **cannot** be an ordinary $2\times2$ linear map because such a map
fixes the origin (corollary 5); the resolution — **affine / homogeneous
coordinates** ($3\times3$ embedding) — is **named only**, deferred. The
identity→$A$ scrub keeps its existing honesty label (an educational visual
transition, not a matrix factorization; `authoring/lesson-design.md` animation-choreography,
`authoring/animation-quality-bar.md`).

---

## 8. Exact examples, non-examples, counterexamples, boundary cases

### 8.1 Lesson 1 (uses `LINEAR_COMBINATION_EXAMPLE`; add q, r, basis order)

Fixed directions: $\mathbf{v}=(1,2)$, $\mathbf{w}=(3,-1)$ (independent:
$1\cdot(-1)-2\cdot3=-7\neq0$); dependent alternative $\mathbf{w}_d=(2,4)=2\mathbf{v}$.

Three experiences the learner must *have* (not just read):

1. **Independent pair + reachable target → exactly one representation.**
   $\mathbf{p}=(4,1)=\mathbf{v}+\mathbf{w}$, so $[\mathbf{p}]_B=(1,1)$. *(Preserve
   the existing reveal $\mathbf{p}=(4,1)=[\mathbf{p}]_E$, $[\mathbf{p}]_B=(1,1)$.)*
2. **Dependent pair + target outside span → no representation.** $\mathbf{p}=(4,1)$
   is off the line $\operatorname{span}(\mathbf{v})$, so no $a,b$ give
   $a\mathbf{v}+b\mathbf{w}_d=(4,1)$. *(Today's "dependent" preset shows this.)*
3. **Dependent pair + target inside span → infinitely many representations.** Use
   $\mathbf{r}=(3,6)=3\mathbf{v}$. Then $a(1,2)+b(2,4)=(3,6)$ reduces (both
   components) to $a+2b=3$ — a whole **solution family** $a=3-2b$. **Make the
   family visible:** a dashed solution line in $(a,b)$-space or a live readout
   "many $(a,b)$ work: $a=3-2b$" as the learner slides $b$ and the combination
   stays pinned on $\mathbf{r}$. *(New preset/beat — the missing case today.)*

**Undisclosed coordinate problem (new).** $\mathbf{q}=(-1,5)$,
$B=(\mathbf{v},\mathbf{w})=((1,2),(3,-1))$, coefficients **not** pre-revealed — a
genuine assessment, unlike the current challenge.

**Method the lesson actually teaches (decide this explicitly).** Two complementary
routes, in this order:
1. *Geometric coefficient matching (explorer, first):* slide $a,b$ until
   $a\mathbf{v}+b\mathbf{w}$ lands on $\mathbf{q}$ — builds intuition that the
   coordinates are the two knob settings that hit the target.
2. *Component-equation method (the taught procedure):* write
   $a\mathbf{v}+b\mathbf{w}=\mathbf{q}$ componentwise and solve the $2\times2$
   linear system
   $$a + 3b = -1,\qquad 2a - b = 5.$$
   Solve by lightweight **substitution or elimination** (e.g. from the first
   $a=-1-3b$; substitute: $2(-1-3b)-b=5\Rightarrow -2-7b=5\Rightarrow b=-1$, then
   $a=-1-3(-1)=2$), giving $[\mathbf{q}]_B=(2,-1)$ (and indeed
   $\mathbf{q}=2\mathbf{v}-\mathbf{w}$). This is the reusable skill the geometric
   knob-matching only approximates. **General Gaussian elimination is deferred**
   (§15): two equations, hand-solved, is enough here.

**Basis-order comparison.** $B=(\mathbf{v},\mathbf{w})$ vs $B'=(\mathbf{w},\mathbf{v})$.
Use $\mathbf{q}$: $[\mathbf{q}]_B=(2,-1)$ but $[\mathbf{q}]_{B'}=(-1,2)$ — **order
matters** (a basis is *ordered*). *(Note: $\mathbf{p}$ is a poor choice here because
$[\mathbf{p}]_B=[\mathbf{p}]_{B'}=(1,1)$; use $\mathbf{q}$.)*

**Optional depth:** a short **nearly-dependent** pair (e.g. $\mathbf{w}$ close to
$2\mathbf{v}$) may be shown to convey "still a basis, but a skewed, ill-conditioned
one" — **without** introducing condition numbers.

### 8.2 Lesson 2 (transformations of the shared graphic)

Cover, on the graphic + grid + basis:

| Map | Matrix / form | Role |
| --- | --- | --- |
| Scale | $\operatorname{diag}(2,2)$ (`uniform-scale`) | linear |
| Rotation | $[[0,-1],[1,0]]$ (`rotation`) | linear |
| Reflection (x-axis) | $[[1,0],[0,-1]]$ (`reflection`) | linear |
| Shear | $[[2,1],[0,1]]$ (`shear-2-1`) | linear (the recurring $A$) |
| **Projection (onto x-axis)** | $[[1,0],[0,0]]$ **(add, named)** | singular collapse (`linear`) |
| **Translation** | $\mathbf{x}\mapsto\mathbf{x}+\mathbf{t}$ | **affine non-example** (`affine`) |
| **Nonlinear warp** | $ (x,y)\mapsto(x+0.4y^2,\ y)$ | **counterexample** (`nonlinear`) |

These three `kind`s are exactly the tagged `TransformDemo` model (§9.5): only the
`linear` rows have a $2\times2$ matrix / columns rule; `affine` and `nonlinear` are
represented by their own forms, never a matrix.

**Linearity, defined and tested.** State both properties (§4). Learner **predicts
then tests**: pick $\mathbf{u},\mathbf{v}$; check $T(\mathbf{u}+\mathbf{v})$ vs
$T(\mathbf{u})+T(\mathbf{v})$ and $T(c\mathbf{u})$ vs $cT(\mathbf{u})$ for shear
(passes) and for translation/warp (fail — origin moves / grid bends).

**Derivation (the resolution).** $\mathbf{x}=a\mathbf{v}+b\mathbf{w}\Rightarrow
T(\mathbf{x})=aT(\mathbf{v})+bT(\mathbf{w})$; specialize to
$\mathbf{x}=x\mathbf{e}_1+y\mathbf{e}_2\Rightarrow T(\mathbf{x})=xT(\mathbf{e}_1)+
yT(\mathbf{e}_2)$; hence $A=[\,T(\mathbf{e}_1)\ T(\mathbf{e}_2)\,]$ **as a
consequence** of basis coordinates + linearity, not a memorized convention.

**Corollaries** (state, don't drill): outputs are column combinations; column span =
possible outputs (name only); dependent columns collapse (projection preset);
basis-image-still-a-basis ⇒ reversible (name only); $T(\mathbf{0})=\mathbf{0}$.

**Matrix ≠ transformation — one exact example (reflection across $y=x$).**
- Standard-coordinate matrix: $[T]_{E\leftarrow E}=\begin{bmatrix}0&1\\1&0\end{bmatrix}$
  (from $\mathbf{e}_1\mapsto(0,1)$, $\mathbf{e}_2\mapsto(1,0)$).
- Using $B=((1,1),(1,-1))$ for **both** domain and codomain coordinates: the line
  $y=x$ is fixed ($(1,1)\mapsto(1,1)$) and $(1,-1)\mapsto(-1,1)=-(1,-1)$, so
  $$[T]_{B\leftarrow B}=\begin{bmatrix}1&0\\0&-1\end{bmatrix}=\operatorname{diag}(1,-1).$$
- **Same map, two matrices** — the matrix represents $T$ *relative to a basis*
  (here the same basis $B$ names inputs and outputs). The **general
  change-of-basis formula is deferred.**

**Return to the Chapter 0 graphic.** Final beat: derive why transforming the two
basis vectors determines every vertex (each vertex is $x\mathbf{e}_1+y\mathbf{e}_2$,
so its image is $xT(\mathbf{e}_1)+yT(\mathbf{e}_2)$). **Task:** the learner
**adjusts / infers $T(\mathbf{e}_1),T(\mathbf{e}_2)$** (drag the two image arrows or
type the two columns) to reproduce a *target* transformed graphic — closing the
mystery by hand.

---

## 9. Guided-scene and explorer changes

Reuse `sceneKit`, `sceneTimings`, `sceneMeta`, `MafsSceneShell`, controls, toggles,
readouts throughout. New pieces flagged **[NEW]**.

### 9.1 `linearCombinationScene` (`linearCombinationScene.ts`)

Keep the 11 segments; **add one** after `dependent`:

- `dependent-inside` **[NEW beat]** (`sceneTimings`: ~4.5s) — set target
  $\mathbf{r}=(3,6)$ on the dependent line; slide $b$ while $a=3-2b$ keeps the
  combination pinned on $\mathbf{r}$; caption "one point, infinitely many
  $(a,b)$." Uses existing `comboArrow`, `spanLine`, coefficient signals.

`sceneMeta` for `vectors-linear-combinations`: add `dependent-inside` to `steps`
and `majorSteps`; extend `ariaLabel`. (`sceneTimings.test.ts` /
`lessonWiring.test.ts` step-id expectations updated.)

### 9.2 `matrixTransformationScene` (`matrixTransformationScene.ts`)

Revise segments (`MATRIX_TRANSFORMATION_SEGMENTS`) to:

`identity → linearity-test [NEW] → col1 → col2 → sample → transform-sample →
graphic [NEW] → grid → nonlinear-affine [NEW] → presets → back-to-graphic [NEW] →
summary`

- `linearity-test` **[NEW]**: show $T(\mathbf{u}+\mathbf{v})$ landing on
  $T(\mathbf{u})+T(\mathbf{v})$ (additivity) and $T(2\mathbf{u})=2T(\mathbf{u})$
  (homogeneity) for the shear.
- `graphic` **[NEW]**: introduce the shared graphic (ghost original + transformed)
  under the current $A$; anchors highlighted. Built from `makeGraphic` **[NEW
  helper]** (a closed `Line` whose `points()` = `outline.map(v =>
  toPixels(matrixVectorMultiply(matrix(), v)))`), a near-clone of
  `makeGhostClosedRegion`.
- `nonlinear-affine` **[NEW]**: briefly bend the grid (nonlinear warp) and slide it
  (translation) to show grid lines curving / the origin moving — then discard both
  as non-linear/affine.
- `back-to-graphic` **[NEW]**: with only $T(\mathbf{e}_1),T(\mathbf{e}_2)$ shown,
  reconstruct the graphic vertex-by-vertex (each vertex = $x\mathbf{e}_1+y\mathbf{e}_2
  \mapsto xT(\mathbf{e}_1)+yT(\mathbf{e}_2)$).
- Keep `presets` but route it through the graphic and **add** the projection preset.

`sceneMeta` for `matrix-transformations`: new steps + major steps + `ariaLabel`.

### 9.3 Chapter 0 scene **[NEW]** (`chapter0Scene.ts`, id `why-linear-algebra`)

Segments (proposed): `establish` (graphic + grid at identity, caption "one small
craft, one grid") → `sweep` (morph through rotation → shear → a collapse via
`morphMatrixEntries`, graphic following) → `four-numbers` (surface the live
$2\times2$ entries; "these four numbers did all of that") → `mystery` (freeze;
overlay the precise question **"How can four numbers determine where every vertex
goes under one linear transformation?"** — not "reach any picture"). Register in
`sceneMeta` with `majorSteps`. Reuses `makeStaticGrid`, `makeTransformedGrid`,
`makeGraphic`, overlay labels.

### 9.4 `LinearCombinationExplorer` (`LinearCombinationExplorer.tsx`)

- Replace the single `challenge` preset with a **task family**:
  `challenge-p` (independent, find $[\mathbf{p}]_B=(1,1)$ — keep),
  `challenge-q` **[NEW]** (independent, find undisclosed $[\mathbf{q}]_B=(2,-1)$;
  target $\mathbf{q}=(-1,5)$),
  `dependent-outside` (target $\mathbf{p}$, no solution — keep semantics),
  `dependent-inside` **[NEW]** (target $\mathbf{r}=(3,6)$; readout shows the family
  $a=3-2b$ and "many solutions").
- **[NEW]** basis-order toggle ($B$ vs $B'$) updating the $[\cdot]_B$ readout to
  show order dependence with $\mathbf{q}$.
- Reuse `PresetPicker`, `SceneReadout` (add `coords-b`/`match`/`family` items),
  `ParameterControls`. Data from `exampleData` (`q`, `r`, `coordinatesInBasisQ`).

### 9.5 `MatrixTransformationExplorer` (`MatrixTransformationExplorer.tsx`)

- **[NEW]** shared-graphic overlay (Mafs `Polygon`, `points =
  applyMatrixToPoints(current, OUTLINE)`; ghost original dashed; gold anchors),
  behind a "Show graphic" toggle (on by default in Chapter 0 / Lesson 2).
- **[NEW]** "Set basis images" input mode: drag/type $T(\mathbf{e}_1)$ (col 1) and
  $T(\mathbf{e}_2)$ (col 2); the matrix + graphic update — this *is* the
  build-a-matrix interaction (assessment via a target-match readout).
- **[NEW] Tagged demonstration model (decide this before coding).** Translation
  and the nonlinear warp are **not** $2\times2$ matrices and must not be bolted
  onto the matrix-preset type (that forces special-case branches mixing matrices
  with functions). Introduce one small tagged union that the scene, explorer, and
  presets all consume:

```ts
type TransformDemo =
  | { kind: "linear";    matrix: Matrix2x2 }
  | { kind: "affine";    matrix: Matrix2x2; translate: Vector2 } // e.g. identity + t
  | { kind: "nonlinear"; apply: (p: Vector2) => Vector2; label: string };
// application is uniform: linear/affine via shared math (matrixVectorMultiply +
// optional translate); nonlinear via its own `apply`. Only linear yields a
// standard columns matrix; affine/nonlinear readouts say why no 2×2 represents them.
```

- **[NEW]** presets over that model: `projection` (`linear`, named; $[[1,0],[0,0]]$),
  `translation` (`affine`; applied as $\mathbf{x}+\mathbf{t}$ to the graphic;
  readout: "not a $2\times2$ linear map: origin moved"), `nonlinear` (the warp;
  readout: "grid lines bend"). The `linear` presets keep the existing matrix path
  untouched.
- **[NEW]** "same map, two matrices" affordance: pick reflection-$y=x$ and toggle
  basis $E$ vs $B=((1,1),(1,-1))$; readout shows $[[0,1],[1,0]]$ vs
  $\operatorname{diag}(1,-1)$ for the *same* geometric reflection.
- Keep det readout ("Lesson 3 preview") and singular messaging; **add** "graphic
  collapsed onto a line" when singular.

### 9.6 Chapter 0 explorer

Reuse `matrix-transformation` explorer, restricted (graphic on, matrix sliders
only, no det/basis-image panel) via a small prop, OR register a thin
`why-linear-algebra` explorer id that renders the same component with a
"minimal" flag. Prefer **reuse with a prop** over a new component
(`project-core`: no parallel pipelines).

---

## 10. Assessments — procedural, explanatory, transfer

Grounded in the exercise types the repo supports (`types.ts`: `multiple-choice`,
`numeric`, `vector`, `prediction`; `eigenvalue` is eigen-only). **Demonstrate vs
assess:** the explorer *demonstrates*; the `ExercisePanel` and `prediction` reveals
*assess* (learner commits, then the reveal teaches).

**Pattern coverage (per `docs/authoring/assessment-patterns.md`).** Each item below is one of
that library's patterns — the "Ability" column names it: **procedural execution**
(form a combination, coords in a basis, predict an image, construct a matrix),
**explanation / reconstruction from first principles** (existence-vs-uniqueness,
"why the columns are the basis images"), **prediction** (linearity tests),
**boundary-case reasoning** (infinitely-many case, translation fixes origin),
**representation switching** (same map, two matrices; basis order), and **transfer
to an unfamiliar setting** (set $T(\mathbf{e}_1),T(\mathbf{e}_2)$ to hit a new
target graphic). The minimal set deliberately spans **recall → reconstruction →
transfer** for *each* lesson without making it test-heavy (the guidance at the end
of `authoring/assessment-patterns.md`); the learner-validation transfer item lives in
`docs/authoring/insight-validation-protocol.md`.

### 10.1 Lesson 1

| Ability | Type | Prompt (concrete) | Answer |
| --- | --- | --- | --- |
| Procedural: form a combination | `vector` (keep `vec-add-compute`) | compute $1\mathbf{v}+1\mathbf{w}$ | $(4,1)$ |
| Procedural: coords in a basis (undisclosed) **[NEW]** | `vector` | find $[\mathbf{q}]_B$, $\mathbf{q}=(-1,5)$, $B=(\mathbf v,\mathbf w)$ | $(2,-1)$ |
| Explanatory: span of a dependent pair | `multiple-choice` (keep `vec-span`) | scalar multiples span… | a line |
| Explanatory: basis ≠ perpendicular | `multiple-choice` (keep `vec-basis-check`) | do $(1,2),(3,-1)$ form a basis? | yes, independence |
| Explanatory: existence vs uniqueness **[NEW]** | `prediction` | "why does a basis give *exactly one* $(a,b)$?" | reveal: span⇒exists, independence⇒unique |
| Boundary: infinitely-many case **[NEW]** | `multiple-choice` | with $\mathbf{w}_d=2\mathbf v$, how many $(a,b)$ reach $\mathbf r=(3,6)$? | infinitely many ($a=3-2b$) |
| Transfer: basis order matters **[NEW]** | `vector` | $[\mathbf q]_{B'}$, $B'=(\mathbf w,\mathbf v)$ | $(-1,2)$ |
| Transfer: independence predicts span | `prediction` (keep) | are $\mathbf v,\mathbf w$ independent; span? | reveal |

### 10.2 Lesson 2

| Ability | Type | Prompt (concrete) | Answer |
| --- | --- | --- | --- |
| Test additivity/homogeneity | `prediction` **[NEW]** | "Is $T(x,y)=(x+1,y)$ linear? Test $T(\mathbf 0)$ and $T(\mathbf u+\mathbf v)$." | reveal: no — origin moves |
| Distinguish linear / affine / nonlinear | `multiple-choice` **[NEW]** | classify scale / translation / $y+x^2$ | scale=linear, others not |
| Construct matrix from basis images | `vector` **[NEW]** | $T(\mathbf e_1)=(0,1)$, enter column 1 | $(0,1)$ (pair with `match-transform` MC, kept) |
| Predict image of a new vector | `vector` **[NEW]** | for $A=[[2,1],[0,1]]$ compute $A(1.5,0.5)$ | $(3.5,0.5)$ |
| Predict $\mathbf e_1$'s image | `vector` (keep `e1-predict`) | where does $\mathbf e_1$ land? | $(2,0)$ |
| Explain the columns rule | `prediction` **[NEW]** | "why are the columns $T(\mathbf e_1),T(\mathbf e_2)$?" | reveal: linearity + unique coords |
| Dependent columns ⇒ collapse | `multiple-choice` **[NEW]** | what does $[[1,0],[0,0]]$ do to the plane? | projects onto a line |
| Transformation ≠ its matrix | `multiple-choice` **[NEW]** | same reflection has matrix ? in $E$ and ? in $B$ | $[[0,1],[1,0]]$ / $\operatorname{diag}(1,-1)$ |
| Transfer: basis-determination, new setting | `prediction` **[NEW]** | in the explorer, set $T(\mathbf e_1),T(\mathbf e_2)$ to match a target graphic; explain why two arrows sufficed | reveal ties to Proposition |

**Content-model limitation (flag):** there is **no matrix-valued exercise type** and
no free-text grader. "Construct a matrix" is therefore split into two `vector`
column entries + an MC, with the *interactive* build-a-matrix living in the explorer
(target-match). A dedicated matrix exercise type is **deferred** (§15).

---

## 11. Minimal content-model and layout changes

Smallest change that (a) removes the rigid universal flow and (b) supports formal
blocks — **without** a general DSL.

### 11.1 `LessonDefinition` (`src/lessons/types.ts`)

```ts
// additive; existing lessons keep working unchanged
type FormalKind =
  | "definition" | "proposition" | "theorem"
  | "corollary" | "conjecture" | "lemma" | "axiom";

export type FormalBlock = {
  id: string;
  kind: FormalKind;
  label?: string;                 // e.g. "Basis ⇔ unique representation"
  statement: string;              // KaTeX-in-prose (ProseWithMath)
  interpretation: string;         // learner-accessible gloss
  visibility: "visible" | "revealed" | "reference";
  layers?: DepthLayer[];          // justification, edge cases
};

export type RouteBlock =
  | { kind: "motivate" }
  | { kind: "watch" }
  | { kind: "formal"; formalId: string }
  | { kind: "check" }
  | { kind: "worked" }
  | { kind: "explore" }
  | { kind: "practice" }
  | { kind: "summary" }
  | { kind: "handoff"; to: string; label: string };

// Fields shared by every lesson-like page.
interface LessonBase {
  id: string;
  title: string;
  route?: RouteBlock[];          // when present, overrides the fixed phase order
  formalBlocks?: FormalBlock[];  // referenced by RouteBlock "formal"
  guidedSceneId?: string;        // was required; now optional
  explorationId?: string;        // was required; now optional
  exercises?: ExerciseDefinition[]; // was required; now optional
}

// Ordinary lesson: sections + keyTakeaway REQUIRED (unchanged contract).
export interface StandardLessonDefinition extends LessonBase {
  kind?: "lesson";               // default; drives "Lesson N" numbering
  sections: LessonSection[];
  keyTakeaway: string;
  // ...all existing required lesson fields stay required here...
}

// Chapter 0 / course intro: sections + keyTakeaway OPTIONAL, route REQUIRED.
// A discriminated union so an intro with no Summary/sections is *valid* and an
// ordinary lesson missing keyTakeaway is still a *type error* (invalid
// combinations are prevented, not merely tolerated).
export interface IntroLessonDefinition extends LessonBase {
  kind: "intro";
  route: RouteBlock[];           // required: an intro must declare its short route
  sections?: LessonSection[];    // optional
  keyTakeaway?: string;          // optional — Chapter 0 has no "Remember this"
}

export type LessonDefinition =
  | StandardLessonDefinition
  | IntroLessonDefinition;
```

This resolves the earlier contradiction (Chapter 0 declares "no Summary" while the
schema still forced `keyTakeaway`/`sections`): the `kind:"intro"` arm makes exactly
those two fields optional and requires a `route`, so the type system prevents the
invalid combinations rather than relying on convention. Existing lessons are
`StandardLessonDefinition` with no code change.

### 11.2 `LessonLayout` (`src/components/layout/LessonLayout.tsx`)

- If `lesson.route` is present, iterate it and render each block via a
  `kind → renderer` map (the existing `Phase` wrapper + slot content). If absent,
  render **today's fixed order** (existing behavior; no lesson rewrite forced).
- `watch` renders only when a `visualization` slot is provided; `explore`/`practice`
  only when their slots exist — the layout no longer *forces* Watch.

### 11.3 `LessonPage` (`src/pages/LessonPage.tsx`)

- Guard the now-optional fields: build `GuidedScenePlayer` only when
  `guidedSceneId` is defined; `getExplorer` already tolerates undefined; skip
  `ExercisePanel` when `exercises` is empty/undefined.
- Render `formalBlocks` via a **new `FormalStatement` component**; render a
  `handoff` block as a primary CTA `Link`.

### 11.4 New component

`src/components/lesson/FormalStatement.tsx` (+ `.css`): a labeled block (kind
badge + statement + interpretation), reusing `ProseWithMath` and the
`MisconceptionCallout`/`ExplanationBlock` visual grammar; `revealed` justification
via the existing `<details>` depth pattern; `reference` rendered muted.

### 11.5 Numbering (`curriculum.ts` / `registry.ts` / `CourseSidebar.tsx` / `LessonHeader.tsx`)

- **Add a minimal `courseId` field** to curriculum sections/items (`curriculum.ts`),
  e.g. `"linear-algebra"` and `"algorithms"`. This is the *prerequisite* for any
  course-relative numbering — the flat `COURSE_SECTIONS` list has no course
  identity today, so "number within the active course" is otherwise uncomputable.
- `getLessonPosition` / sidebar then number `kind:"lesson"` entries **within the
  same `courseId`**, treating `kind:"intro"` as "Chapter 0" (not counted in the
  Lesson 1…N sequence). Karatsuba is numbered inside `"algorithms"` independently,
  so it does not drift.
- This single additive field is the near-term slice of
  `courses/multi-domain-architecture.md` §2 — **not** the full
  subjects→courses→modules tree.

**Explicitly avoided:** a general block/DSL schema, a rich text/markup engine,
per-step worked-example templates (already removed), the multi-course graph, and
routing changes (URLs stay `/lesson/:id`; Chapter 0 is `/lesson/why-linear-algebra`).

---

## 12. Likely affected files and tests

**Source**
- `src/lessons/types.ts` — `FormalBlock`, `RouteBlock`, optional fields, `kind`.
- `src/components/layout/LessonLayout.tsx` — declared-route rendering + fallback.
- `src/pages/LessonPage.tsx` — guards, formal blocks, handoff.
- `src/components/lesson/FormalStatement.tsx` (+ `.css`) — **new**.
- `src/lessons/registry.ts`, `src/lessons/curriculum.ts` (**add `courseId`**),
  `src/components/layout/CourseSidebar.tsx`, `src/components/lesson/LessonHeader.tsx`
  — Chapter 0 nav + course-relative numbering (per `courseId`).
- `src/pages/HomePage.tsx` (+ `HomePage.css`) — soften flow copy, CTA → Chapter 0.
- `src/lessons/chapter0.ts` — **new** (`why-linear-algebra`).
- `src/lessons/vectors.ts`, `src/lessons/transformations.ts` — revised content + routes + formal blocks.
- `src/lessons/exampleData.ts` + `src/lessons/openingGraphic.ts` (**new**) — q, r, basis-order, graphic vertices.
- `src/math/examples.ts` — add reflection-$y=x$ (`reflection-xy` = `[[0,1],[1,0]]`) and `projection-x` (`[[1,0],[0,0]]`); add the tagged `TransformDemo` model so translation (`affine`) / nonlinear (`nonlinear`) are **not** forced into the matrix type.
- `src/explorations/LinearCombinationExplorer.tsx`, `MatrixTransformationExplorer.tsx`, `registry.tsx` — presets/tasks/graphic/basis-image mode.
- `src/guided-scenes/scenes/linearCombinationScene.ts`, `matrixTransformationScene.ts`, `chapter0Scene.ts` (**new**), `sceneKit.ts` (`makeGraphic`), `sceneTimings.ts`, `sceneMeta.ts`, `src/guided-scenes/registry.ts`.

**Tests**
- `src/lessons/__tests__/lessonWiring.test.ts` — Chapter 0 wiring; Lesson 1 new step ids + q/r; Lesson 2 linearity/derivation/formal blocks; **update** current expectations (three-section assertion, matrix step-id list, `getExplorer`-for-every-lesson now allows an intro without exercises).
- `src/explorations/__tests__/LinearCombinationExplorer.test.tsx`, `MatrixTransformationExplorer.test.tsx` — new presets/readouts, graphic overlay, basis-image mode.
- `src/guided-scenes/scenes/__tests__/sceneTimings.test.ts`, `sceneDescriptions.test.ts`, `unknownSceneIds.test.ts` — new segments/scene id.
- `src/math/__tests__/` — graphic transform regression (`applyMatrixToPoints`), reflection-$y=x$ / projection examples.
- **New** `FormalStatement` + route-renderer component tests.
- `e2e/lesson-vectors.spec.ts`, `e2e/lesson-transformations.spec.ts` — new tasks/readouts; **new** `e2e/chapter0.spec.ts` (mystery scene, interaction, handoff to Lesson 1).
- `docs/quality/lesson-correctness-checklist.md` — completed for the three parts.

---

## 13. Implementation slices (dependency order)

> **Gated (see §0):** these slices do **not** start until
> `docs/courses/linear-algebra/lessons/00-opening-slice/insight.md` reaches `Gate result: PASS` and this
> brief is promoted to a Stage 3 plan with an insight-traceability map. They are
> sequenced for the later coding prompts, not authorized yet.

1. **Shared data & math.** Add `openingGraphic.ts` (vertices + anchors);
   `exampleData` q=(-1,5)→(2,-1), r=(3,6), basis-order data; `examples.ts`
   `reflection-xy`, `projection-x`. Math regression tests. *(No UI yet.)*
2. **Content model + layout.** `FormalBlock`/`RouteBlock`/optional fields/`kind`;
   `LessonLayout` declared-route renderer + fallback; `FormalStatement` component;
   `LessonPage` guards. Component tests. *(Existing lessons still render via
   fallback — nothing breaks.)*
3. **Lesson 1 revision.** Promote the theorem to a `FormalBlock`; add the
   dependent-inside beat + explorer `dependent-inside` and `challenge-q` presets +
   basis-order toggle; add q/r exercises. Scene + explorer + wiring + e2e tests.
4. **Lesson 2 revision.** Linearity definition + predict/test; equation-first
   columns-rule derivation (worked computation) + Proposition/Corollaries formal
   blocks; shared graphic in scene + explorer; projection/translation/nonlinear
   presets; reflection-$y=x$ two-matrix affordance; basis-image build-a-matrix +
   target match; return-to-graphic beat. Tests + e2e.
5. **Chapter 0.** `chapter0Scene.ts` + `sceneMeta`; `chapter0.ts` lesson (`kind:
   "intro"`, short route, no exercises); explorer reuse (minimal prop); nav +
   numbering + HomePage CTA; handoff to Lesson 1; explicit mystery-resolution
   callback in Lesson 2's summary. e2e `chapter0.spec.ts`.
6. **Polish & docs.** HomePage copy; sidebar course-relative numbering; complete
   `quality/lesson-correctness-checklist.md`; `npm run lint`, `npm run test`,
   `npm run test:e2e`.

Slices 1–2 are prerequisites for everything; 3 and 4 are independent of each
other; 5 depends on 2 (route) + 4 (graphic/explorer).

---

## 14. Acceptance criteria

- **Progression legible.** A learner reaches Lesson 2's summary able to state:
  coordinates describe objects; a basis gives unique coordinates; a linear map is
  determined by what it does to a basis — and can point back to Chapter 0's
  mystery as *answered*.
- **Chapter 0** is reachable as the first course item, renders a guided scene + a
  bounded interaction + a handoff CTA, contains **no artificial exercises/phases**,
  is labeled "Chapter 0" (Lesson 1 stays "Lesson 1"), and shares the graphic +
  visual language with Lesson 2 **without** replaying its beats.
- **Formal backbone** renders: the Lesson 1 Theorem and Lesson 2 Definition/
  Proposition/Corollaries appear as labeled blocks; main line reads complete with
  every `revealed`/`reference` justification collapsed.
- **Lesson 1** lets the learner *experience* all three cases (unique / none /
  infinitely-many) and *determine* an undisclosed coordinate ($[\mathbf q]_B=(2,-1)$),
  and shows basis order matters ($[\mathbf q]_{B'}=(-1,2)$).
- **Lesson 2** defines and has the learner test both linearity properties; presents
  scaling/rotation/reflection/shear/projection(named)/translation(affine
  non-example)/one nonlinear warp; derives the columns rule as a **consequence**;
  states the five corollaries; shows one same-map/two-matrix example
  ($[[0,1],[1,0]]$ vs $\operatorname{diag}(1,-1)$); and ends by reconstructing the
  graphic from $T(\mathbf e_1),T(\mathbf e_2)$.
- **Shared graphic** transforms via `applyMatrixToPoints`/`matrixVectorMultiply`
  only (regression-tested); vertices, not "pixels," in all copy; collapse shows
  distinct vertices coinciding.
- **Continuity & correctness** preserved: shared example ids, `--role-*` tokens,
  KaTeX + $\mathbf e_1,\mathbf e_2$, safe frame, reduced-motion, basic a11y; no new
  math outside `src/math`; `docs/quality/known-failure-modes.md` updated if any visualization bug is
  found.
- **All tests pass** (unit, component, e2e) and `quality/lesson-correctness-checklist.md`
  is completed for the three parts.

---

## 15. Deferred material and scope boundaries

**Named but not taught (this slice):** column space, rank, invertibility
procedures; the general **change-of-basis** formula (only "same map, two matrices"
is shown); **affine / homogeneous coordinates** ($3\times3$ embedding for
translation) — named as the future resolution of the translation limitation;
**general Gaussian elimination** (coordinates are found by hand-solving a
$2\times2$ system via substitution/elimination — §8.1 — not a general pivoting
procedure); condition number / numerical stability (a nearly-dependent example may
hint at "skew," no metric).

**Architecture deferred:** the full multi-course subjects→courses→modules tree and
namespaced routing (`courses/multi-domain-architecture.md` §2–§4) — only a
minimal `courseId` field (enabling course-relative numbering) is added now; a
**matrix-valued exercise type** and a
free-text explanation grader (explanatory assessment stays `prediction` + MC);
equation morphing; progress persistence; 3D extensions for this slice.

**Explicit non-goals:** rewriting the math engine, the Motion Canvas / Mafs
integration, or the worked-example schema (already de-scaffolded); turning the
home page into the course; copying any external creator's exact sequence, palette,
or wording; full disability-product accessibility beyond the documented basics.

**Karatsuba:** untouched except that Chapter 0's numbering must be course-relative
so Karatsuba's sidebar number is unaffected; the algorithms-course split is out of
scope here.
