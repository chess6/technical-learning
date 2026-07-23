# Lesson design (authoring orchestrator)

**How to compose a lesson.** This is the entry point for building or modifying a
lesson: it owns the **block palette, the `route`, composition rules, medium
choice, and guided-to-interactive continuity**, and it **routes** every other
concern to the document that owns it. It deliberately does *not* restate visual
tokens, the animation quality bar, mastery evidence, or math conventions — follow
the links.

| Concern | Owner |
| --- | --- |
| What the learner actually sees (headings, openings, representation fit) | [product/semantic-page-grammar.md](../product/semantic-page-grammar.md) |
| Educational philosophy (depth, mental models, "enough depth") | [product/vision.md](../product/vision.md) |
| Visual direction & algorithm/data-structure primitives (code owns token values) | [product/visual-language.md](../product/visual-language.md) |
| Clip quality bar, choreography rubric, script-event contract | [authoring/animation-quality-bar.md](animation-quality-bar.md) |
| Mastery evidence: coverage, rigor, transfer, assessment, retention | [authoring/mastery-standard.md](mastery-standard.md) · [templates/lesson-mastery-contract.md](templates/lesson-mastery-contract.md) |
| Exercise / assessment design | [authoring/assessment-patterns.md](assessment-patterns.md) |
| Math conventions & source of truth | [engineering/math-correctness.md](../engineering/math-correctness.md) |
| Known math/visualization hazards | [quality/known-failure-modes.md](../quality/known-failure-modes.md) |
| Per-lesson sign-off | [quality/lesson-correctness-checklist.md](../quality/lesson-correctness-checklist.md) |
| Fill-in planning template | [authoring/templates/lesson-plan.md](templates/lesson-plan.md) |

> **Scope note (this POC).** Keep [Basic accessibility](#basic-accessibility-keep);
> full disability-product optimization is out of scope. **There is no mandatory
> lesson sequence** — the named blocks are a palette, not a pipeline (see
> [Composition & flexibility](#composition--flexibility)).

---

## Product intent (in one line)

An interactive mathematics course that uses the **representation best suited to the
mathematical job** — intuition before notation, guided explanation then
learner-controlled exploration, deterministic and mathematically correct, for
college-level learners. The full philosophy (and what the product is *not*) lives
in [product/vision.md](../product/vision.md). Do **not** copy another creator's
design, sequences, palette, wording, or assets — build an original identity from
our own design tokens.

---

## The block palette

A lesson is assembled from **reusable blocks**, declared as an ordered `route` on
the `LessonDefinition` (`RouteBlock` in `src/lessons/types.ts`). The route is the
lesson's real structure — **author it deliberately per lesson.** There is no
canonical order and no required set: pick the blocks the concept needs, arrange
them to teach best, repeat a block when it helps, and omit any block a lesson does
not need.

Available blocks (all optional, any order, repeatable):

- **Motivate** — a concrete question / prediction / puzzle; establish why it
  matters; keep it brief; avoid opening with a formal definition unless necessary.
- **Watch** — a guided **Motion Canvas** sequence; reveal **one conceptual change
  at a time**; synchronize geometry, notation, highlighting, prose. See
  [Motion Canvas responsibilities](#motion-canvas-responsibilities).
- **Section** — one explanation section (prose + optional inline figure), placed
  where it belongs; interleave with formal statements and examples.
- **Formal statement** — a definition / proposition / theorem / corollary, dropped
  in exactly where the argument needs it.
- **Worked example** — a derivation (a plain equation sequence, optionally an
  embedded clip), placed next to the idea it demonstrates; a lesson may have
  several, spread out.
- **Check** — a short conceptual checkpoint (predict / interpret, then reveal);
  avoid lengthy computation.
- **Explore** — a **Mafs** interactive continuing the guided example. See
  [Mafs responsibilities](#mafs--interactive-renderer-responsibilities).
- **Practice** — deterministic exercises; feedback connects to the geometry and
  explains *why*.
- **Summarize** — one concise takeaway; do not repeat the whole lesson.
- **Handoff** — a CTA link onward to another lesson.

**Visible naming is owned by the page grammar.**
[semantic-page-grammar §1](../product/semantic-page-grammar.md#1-the-core-shift-infer-the-role-do-not-announce-it)
is the source of truth for what the learner sees. In short: **do not** surface
internal phase names or numbers (`1 · MOTIVATE`) in the UI, **do not number the
blocks** (they repeat and reorder), and use **content-specific headings** in the
lesson's own words ("When does a system have no solution?"). The **table of
contents also uses those content-specific headings**, never the generic phase
names. The generic names below are **internal block / analytics / a11y metadata
only** — not ToC entries and not visible headings (the four naming layers are in
[grammar §1.1](../product/semantic-page-grammar.md#11-four-naming-layers-kept-distinct)).

| Block | Internal / a11y label (metadata only — never a visible heading or ToC entry) |
| --- | --- |
| Motivate | motivate |
| Watch | watch |
| Check | check |
| Explore | explore |
| Practice | practice |
| Worked example | worked |
| Summarize | summary |

A Summarize block's **visible** heading names the actual synthesis ("The solution
set is a point plus a subspace"), never a generic "Remember this"
([grammar §5.2](../product/semantic-page-grammar.md#52-block-treatments-the-textbook-furniture)).

---

## Composition & flexibility

There is **no default spine to deviate from** — compose each lesson's `route` from
the palette. Concretely, lessons routinely:

- **Interleave** sections, formal statements, and worked examples so each idea is
  stated, then justified, then demonstrated, right where it belongs.
- **Repeat** a block with different content (several worked examples; two short
  checks bracketing a hard idea; a second explore/practice cycle).
- **Omit** any block a lesson does not need (an intro chapter may skip Practice and
  Summarize entirely).
- **Add supporting beats** where they aid understanding (defining *span*,
  *linear dependence*, *unit vector* inside the vectors lesson).

The default ordering rule is **guided Watch before learner Explore.** This is a
strong default, not an absolute invariant: a lesson may put Explore *before* Watch
when the exploration is what raises the motivating question **and** the Lesson
Mastery Contract justifies it (see
[semantic-page-grammar §2](../product/semantic-page-grammar.md#2-lesson-openings-orient-before-you-visualize)).
Absent that justification, keep the default.

### Authoring freedom (pedagogy and presentation)

Real latitude over **how** a concept is taught, as long as it is pedagogically
justified and correctness is preserved:

- A **worked computation is a plain equation sequence by default**
  (`WorkedExample.equations`). There is **no** per-step "object / invariant /
  picture / why-next / learned" template. An equation alone is normal. Add prose
  (a callout or depth layer) only when it reveals a subtle connection, prevents a
  likely misconception, or explains a non-obvious transition. *Start with the
  mathematics; add explanation only when it contributes something the expression,
  the adjacent visual, or reasonable learner inference does not already provide.*
- A **visual needs no caption** when its role is already clear from context.
- Prior lesson patterns (including the **eigenvectors** lesson's structure) are
  **reusable tools, not requirements.**

This freedom applies to pedagogy and presentation — **not** to mathematical
honesty, accessibility, testing, semantic-color consistency, object-identity
continuity, or reduced-motion behavior, which are non-negotiable. Note any
intentional structural deviation in the lesson definition and, if it changes this
standard, in this document (see the lesson-design rule).

---

## Choosing the medium (the medium follows the objective)

The proven pattern for a deep lesson is:

```
math spine (structured values from src/math)
  → an appropriate derivation representation
  → an appropriate solution visual
```

**Do not assume every lesson needs its own Motion Canvas derivation scene and a
bespoke solution-diagram component** — that contradicts the vision's warning
against unnecessary animation. Pick the *lightest* medium that teaches:

| Derivation representation | When |
| --- | --- |
| Motion Canvas scene | Multi-step geometric change that must be synchronized with symbols |
| Static SVG / Mafs diagram | A single snapshot or a few states is enough |
| Equation-only derivation | The geometry is known; symbols need careful pacing |
| Synchronized text + existing explorer | Learner should drive the same example while reading steps |

| Solution visual (practice / reveals) | When |
| --- | --- |
| Static Mafs / SVG (`solutionVisuals` registry) | Reconstruct the mental picture beside revealed reasoning |
| Compact equation block | Numeric drill where a diagram adds little |
| Reuse explorer snapshot props | Continuity with the Explore phase |

Reserve full cinematic scenes for genuinely new ideas — not every drill item.
Keep KaTeX/prose formatting out of `src/math` (structured values only); build
learner-facing strings in a presentation layer (e.g. `src/lessons/eigenFormat.ts`).

> **The eigenvectors lesson is the worked reference** for this pattern (derivation
> *inside* the worked example, one math spine feeding scene + notebook + diagram +
> tests, misconceptions authored as callouts where they arise). The detailed
> adoption note is archived at
> [archive/lesson-depth-pattern.md](../archive/lesson-depth-pattern.md); copy it in
> spirit, not in medium.

---

## Motion Canvas responsibilities

Use Motion Canvas for authored, **read-only** conceptual sequences: smooth
transformations, staged reveals, equation-to-geometry sync, highlighting,
deliberate pacing. Do **not** use it for form controls, sandbox interaction,
exercise input, general UI, or decorative motion.

Guided-scene requirements:

- **Autoplay once** when substantially visible (≥55% via IntersectionObserver) and
  `prefers-reduced-motion` is off; navigating away disposes the engine and
  returning may autoplay once again. Hidden tab / offscreen pauses playback. Under
  reduced motion, land on the first major idea and use Previous / Next idea — no
  continuous autoplay.
- Support **Play / Pause / Replay**; expose **major conceptual steps** by
  meaningful name (not timestamps); no internal/debug controls in learner UI.
- The **paused initial frame** must communicate what's coming (subdued grid,
  origin, a short caption) — never a blank stage.
- Maintain a **safe frame**: overlay captions are center-anchored via
  `makeOverlayLabel` with a safe max width and wrapping, kept in the stage margin
  outside the teaching half-extent so text and arrows are never clipped (see
  `safeFrame.ts`; failure modes in [quality/known-failure-modes.md](../quality/known-failure-modes.md) §6).
- **No audio dependency**; no continuous motion without an educational purpose.
- **Optional dimensional extension (eigenvectors lesson):** a "See it in 3D"
  control may open a **3D extension** with a *different* curated example — not an
  interchangeable
  render of the same 2D derivation. Label "2D derivation" / "See it in 3D" / "3D
  extension"; sync by semantic `majorStepId`, not raw progress; mount at most one
  renderer per clip at a time.

For the forward-looking clip quality bar, attention choreography, object-identity
continuity, and the review rubric, see
[authoring/animation-quality-bar.md](animation-quality-bar.md).

### Animation choreography

The essentials (the quality bar owns the rest):

- **One conceptual change at a time**; dim irrelevant objects; deliberate pauses;
  return to stable states between ideas; establish (not blank) the first frame.
- **Show the transformation as moving space, not just isolated arrows.** The
  deforming coordinate grid — the whole plane stretching / rotating / shearing
  under \(A\) — is the base visual language for any matrix concept, eigenvectors
  included. Deform the grid through the shared `transformedGridSegments` /
  `matrixVectorMultiply` path (never ad-hoc slopes); arrows supplement it. Retire
  the grid when a single arrow reads a quantity (e.g. a signed scale) more cleanly.
- **Label educational interpolation honestly** — do not imply a visual transition
  is a matrix decomposition unless it is one. When a caption names an effect (flip,
  collapse, stretch), the same beat must animate it (see known-failure-modes §4).

---

## Mafs / interactive-renderer responsibilities

Use Mafs for draggable points/vectors, sliders, learner-controlled manipulation
with immediate feedback, and short interactive tasks. Interactive segments must:

- use **shared math models/utilities** (`src/math`) and **begin from the guided
  scene's example** (see [continuity](#guided-to-interactive-continuity));
- expose **primary controls first**, secondary options behind progressive
  disclosure; avoid dumping every variable at once;
- **clamp** to visually meaningful ranges; support **reset**; offer **numeric
  entry** alongside dragging;
- present conclusions in **text as well as graphics**; use labels/patterns in
  addition to color.

---

## Guided-to-interactive continuity

Strict rule. Guided and interactive sections must share the same **main example**
and **data**, the same **vector/matrix names**, the same **semantic colors,
notation, and visual roles**, and the same **math utilities**. The transition
should feel like *"now take control of the example you just watched"* — never an
unrelated default state.

---

## Visual language (semantic roles)

Reference colors via **semantic `--role-*` design tokens** (`src/styles/tokens.css`)
— never hardcode raw colors. The roles are consistent across all lessons and tuned
for the dark canvas: original vector, transformed vector, first/second basis vector
(`--role-basis-1/2`), selected object, invariant direction (eigen), intermediate
state, reachable region (span). Add **non-color cues** (labels, patterns,
arrowheads); keep grids subdued; use translucent fills sparingly; no decorative
animation.

Visual **direction** (and algorithm/data-structure primitives) is owned by
[product/visual-language.md](../product/visual-language.md); **code owns the actual
token values.** The light-first, warm-ivory page with dark visualization canvases
(Lesson 1 is the reference) is documented in
[archive/milestones/visual-design-refinement.md](../archive/milestones/visual-design-refinement.md).

---

## Mathematical notation

- **KaTeX** for conceptual equations/vectors/matrices; **column-vector** notation.
- **Never** expose programming-array notation (`[[2,1],[0,1]]`) in learner-facing
  prose (compact numeric UI values may stay plain text).
- Names/symbols stay consistent across prose, scenes, explorations, exercises.
- Render **trusted static** lesson TeX only — never arbitrary untrusted TeX.
- **Standard basis** \(\mathbf{e}_1, \mathbf{e}_2\) — **no hats** (hats mark
  *generic* unit vectors \(\hat{u}\)). Vectors bold lowercase \(\mathbf{v}\);
  matrices uppercase \(A\); scalars lowercase \(a, \lambda\); eigen
  \(A\mathbf{v}=\lambda\mathbf{v}\).

Representation fit (which object gets which notation) is owned by
[semantic-page-grammar §4](../product/semantic-page-grammar.md#4-mathematical-object-and-representation-standard).

---

## Page hierarchy, navigation, disclosure

- **Hierarchy.** Title/position first, previous/next last, a per-lesson table of
  contents near the top; everything between is the authored `route`. The
  visualization is the dominant teaching object. Whitespace and typography do the
  grouping — not a wall of identical bordered cards or ALL-CAPS labels. Scrolling
  through phases is fine; do not compress a lesson into one viewport.
- **Navigation.** A **course table-of-contents sidebar** (`CourseSidebar` +
  `src/lessons/curriculum.ts`) is the desktop navigation: grouped sections, current
  lesson clear, narrow screens use a drawer. **No** cramped horizontal lesson tabs;
  **no** points/streaks/badges. The **per-lesson table of contents**
  (`LessonTableOfContents`) is generated from the `route`, so it reflects that
  lesson's real composition (repeats/omissions included); its entries use the
  block's **content-specific heading**, not the generic phase name
  ([grammar §1.1](../product/semantic-page-grammar.md#11-four-naming-layers-kept-distinct)).
- **Progressive disclosure.** Do not show all controls at once; primary
  information first, secondary controls under *Display options* / *Advanced
  controls*. Do not repeat the same values across panels without a teaching reason.

---

## Exercises and feedback

Every exercise has a clear objective; answers are **deterministic**; grading uses
**shared math utilities**; feedback explains the concept and names the
misconception where practical; exercises follow directly from the visual model;
visual exercises offer a numeric/parameter alternative. Reusable patterns:
[authoring/assessment-patterns.md](assessment-patterns.md).

---

## Responsive & performance

- **Responsive.** Validate framing/usability at 1366×768, 1440×900, 1920×1080, and
  a tablet/narrow viewport, plus 80% / 100% / 125% zoom. Require: no clipping, no
  horizontal overflow, readable diagrams, adaptive sidebar, intact safe frame.
- **Performance.** React does **not** receive per-frame updates (engines own their
  loops; progress is throttled — see
  [engineering/decisions/001-motion-canvas-runtime.md](../engineering/decisions/001-motion-canvas-runtime.md)).
  No unbounded traces/history; do not render invisible complex scenes; preserve
  cleanup/lifecycle instrumentation.

---

## Required lesson artifacts

Every production lesson should include: a typed `LessonDefinition`; shared examples
by id (no duplicated constants); guided-scene and explorer registration; a
motivating question; explanation sections; a checkpoint; **at least two**
exercises; a key takeaway; unit/component + browser tests; and a completed
[quality/lesson-correctness-checklist.md](../quality/lesson-correctness-checklist.md).

---

## Anti-patterns

Prohibited: a wall of identical cards; raw array notation in learner content;
unrelated fallback scenes; silent mathematical fallbacks; duplicated
matrix/vector arithmetic; hardcoded geometry bypassing `src/math`; decorative
continuous animation; a tiny animation surrounded by dominant controls; every
control visible at once; color-only explanations; cramped horizontal lesson tabs;
debug instrumentation in learner UI; exercises disconnected from the visual model;
visually plausible but unverified mathematics.

> Composing a bespoke block order is **not** an anti-pattern (see
> [Composition & flexibility](#composition--flexibility)). Rigidly forcing every
> lesson into one identical block shell *is* discouraged.

---

## Basic accessibility (keep)

Keep **lightweight** accessibility as a normal quality bar — not a full WCAG /
disability-product effort:

- keyboard-focusable controls with visible focus;
- labelled form controls; descriptive `aria-label`s on diagram regions;
- text equivalents for important visual conclusions (readouts, legends);
- do not convey meaning by color alone;
- respect `prefers-reduced-motion` for autoplay (pause continuous motion; allow
  discrete step navigation).

Full disability-specific optimization (screen-reader narration scripts,
color-blind palettes as a primary design driver) remains outside the POC's scope —
but do **not** strip the basics above.

---

## Lesson design acceptance checklist

- [ ] Lesson composes an intentional `route` (blocks may repeat/omit/reorder; Watch precedes Explore by default, or the contract justifies an exploration-first opening)
- [ ] Medium chosen to fit the objective (not defaulted to a new scene/component)
- [ ] Animation teaches one idea at a time; exploration continues from the guided example
- [ ] Shared math model reused (no duplicated arithmetic); KaTeX + \(\mathbf{e}_1, \mathbf{e}_2\) notation
- [ ] Basic accessibility preserved (focus, labels, readouts, reduced-motion autoplay)
- [ ] Diagrams labelled and unclipped (safe frame intact); controls use progressive disclosure
- [ ] Exercises align with goals; feedback explains reasoning; required viewport/zoom testing done
- [ ] [quality/lesson-correctness-checklist.md](../quality/lesson-correctness-checklist.md) completed; all tests pass
