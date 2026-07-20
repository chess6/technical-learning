# Lesson design standard

Authoritative design specification for every lesson in this project. It exists so
lessons are **not** designed independently: they should share one pedagogical
flow, visual language, interaction model, and quality bar.

Practical enough to follow while building or modifying a lesson. Pair it with:

- [INTERACTIVE_TEXTBOOK_VISION.md](./INTERACTIVE_TEXTBOOK_VISION.md) — educational philosophy (depth, mental models, worked examples).
- [lesson-depth-pattern.md](./lesson-depth-pattern.md) — medium-agnostic pattern for deepening lessons (Lesson 4 reference).
- [MATH_CORRECTNESS.md](./MATH_CORRECTNESS.md) — mathematical conventions (source of truth for geometry).
- [ERROR_LOG.md](./ERROR_LOG.md) — known math/visualization failure modes.
- [LESSON_CORRECTNESS_CHECKLIST.md](./LESSON_CORRECTNESS_CHECKLIST.md) — per-lesson sign-off.
- [LESSON_TEMPLATE.md](./LESSON_TEMPLATE.md) — fill-in planning template.

> **Scope note (this POC).** Prefer [Basic accessibility](#basic-accessibility-keep);
> full disability-product optimization is out of scope. This standard is a
> **backbone, not a cage**: the six-phase flow is the default, but lessons may add
> supporting material (e.g. a definition of linear dependence in an intro vectors
> lesson) when it genuinely helps. See [Flexibility](#flexibility).

---

## Product intent

The product is:

- a **visual-first** interactive mathematics course;
- **intuition before notation**, while preserving rigor;
- **guided explanation** followed by **learner-controlled exploration**;
- **concise prose** supported by diagrams;
- **deterministic** and **mathematically correct**;
- designed for **college-level** learners.

The product is **not**:

- a graphing calculator;
- coding documentation;
- a video library;
- a gamified learning app.

The project may draw inspiration from high-quality visual mathematics education,
but must **not** copy another creator's exact design, animation sequences,
palette, wording, branding, or assets. Build an original visual identity from our
own design tokens.

---

## Standard lesson flow

The default full-lesson sequence is six phases. Treat it as the backbone; see
[Flexibility](#flexibility) for principled deviations.

1. **Motivate** 2. **Watch** 3. **Check understanding** 4. **Explore** 5. **Practice** 6. **Summarize**

**Learner-facing titles.** Do not surface the internal phase names or numbered
utility labels (e.g. `1 · MOTIVATE`) in the UI. Use conversational headings with a
subtle numbered rail cue instead:

| Phase | Learner-facing title |
| --- | --- |
| Motivate | Think about it |
| Watch | Watch the idea |
| Check understanding | Quick check |
| Explore | Try it yourself |
| Practice | Practice |
| Summarize | Remember this |

### Motivate
- Open with a concrete question, prediction, or apparent puzzle.
- Establish why the concept matters.
- Avoid opening with a formal definition unless necessary.
- Keep it brief.

### Watch
- Use a guided **Motion Canvas** sequence.
- Reveal **one conceptual change at a time**.
- Synchronize geometry, notation, highlighting, and prose.
- Do not hand learners controls that distract from the explanation.
- The **paused initial frame** (before autoplay, or when Replay resets) must still
  communicate what the learner is about to see — subdued grid, origin, and a short
  caption or establishing geometry — not an empty black stage.
- **Optional dimensional extension (Lesson 4):** a "See it in 3D" control may open a
  **3D extension** — a conceptual generalization beyond the plane with a *different*
  curated example. It is **not** an interchangeable render of the same 2D derivation
  (matrix, equations, vectors, and timeline are not shared). Learner-facing labels:
  "2D derivation" / "See it in 3D" / "3D extension" — never a bare "2D / 3D" toggle
  that implies equivalence. Synchronize by semantic `majorStepId`, not raw progress.
  At most one renderer (Motion Canvas or WebGL) is mounted for a clip at a time when
  an expand-modal is used.

### Check understanding
- A short **conceptual checkpoint**: ask for a prediction or interpretation.
- Avoid lengthy computation.
- Reveal the explanation after the learner responds or chooses to reveal.

### Explore
- Use **Mafs** (or another appropriate interactive renderer).
- **Initialize from the guided scene's main/final example** (see [continuity](#guided-to-interactive-continuity)).
- Preserve the same notation, semantic colors, labels, and mathematical model.
- Expose only the controls needed to test the concept.
- Offer **numeric entry** alongside dragging (precision + basic accessibility).

### Practice
- Deterministic exercises.
- Connect feedback to the geometry/concept; explain **why** an answer is right or wrong.
- No exercises unrelated to the visualization.

### Summarize
- One concise key takeaway.
- Optionally a small visual recap.
- Do not repeat the whole lesson.

---

## Flexibility

The six-phase flow is the default spine, **not a rigid template**. Lessons may:

- Insert **supporting/auxiliary concept beats** where they aid understanding —
  e.g. defining *linear dependence/independence*, *span*, or *unit vector* inside
  an introductory vectors lesson, or a short notation primer before the checkpoint.
- Merge or lightly reorder phases for very short concept lessons (e.g. a combined
  motivate+watch), as long as the learner still watches before exploring.
- Add a second explore/practice cycle when a lesson carries two linked ideas.

Constraints on deviation:

- Guided **Watch before** learner **Explore** is preserved.
- Guided-to-interactive continuity is preserved (same example/notation/roles).
- Any intentional structural deviation is noted in the lesson definition and, if
  it changes the standard, in this document (see the Cursor rule).

---

## Motion Canvas responsibilities

Use Motion Canvas for:

- authored, **read-only** conceptual sequences;
- smooth transformations and staged reveals;
- equation-to-geometry synchronization;
- highlighting relevant mathematical objects;
- deliberate pacing and pauses.

Do **not** use Motion Canvas for:

- dense form controls;
- unrestricted sandbox interaction;
- exercise input;
- general application UI;
- arbitrary decorative motion.

Guided-scene requirements:

- **Autoplay once** when substantially visible; pause/avoid running while
  offscreen where practical.
- Support **Play / Pause / Replay**.
- Expose **major conceptual steps** with meaningful names (not timestamps).
- Do **not** expose internal/debug animation controls in learner UI.
- Maintain a **safe frame** so labels and arrows are never clipped (see
  `safeFrame.ts` and the M4.5 note).
- **No audio dependency.**
- No continuous motion without an educational purpose.

---

## Mafs / interactive-renderer responsibilities

Use Mafs for:

- draggable points and vectors;
- sliders and parameter exploration;
- learner-controlled manipulation with immediate feedback;
- short interactive tasks.

Interactive segments should:

- use **shared mathematical models and utilities** (`src/math`);
- begin from the **guided scene's example**;
- expose **primary controls first**; put secondary display options behind
  progressive disclosure;
- avoid overwhelming the learner with every variable at once;
- **clamp** values to visually meaningful ranges;
- support **reset**;
- present conclusions in **text as well as graphics**;
- use labels/patterns in addition to color for legibility (clarity, not compliance).

---

## Guided-to-interactive continuity

Strict rule. The guided and interactive sections must share:

- the same **main example** and **mathematical data**;
- the same **vector and matrix names**;
- the same **semantic colors**, **notation**, and **visual roles**;
- the same **mathematical utilities**.

The transition should feel like: *"Now take control of the example you just
watched."* Do not introduce an unrelated default state in the exploration.

---

## Page and information hierarchy

Order:

1. lesson title and purpose
2. motivating question
3. guided explanation and animation
4. checkpoint
5. interactive exploration
6. exercises
7. takeaway
8. previous/next navigation

Rules:

- The **visualization is the dominant teaching object**.
- Not every section is an identical bordered card.
- **Whitespace and typography** do most grouping.
- Avoid documentation-style visual treatment and excessive ALL-CAPS labels.
- Avoid overly dense side-by-side controls.
- Scrolling through phases is fine; **do not** compress a whole lesson into one viewport.

---

## Navigation

A **course table-of-contents sidebar** is the preferred desktop navigation
(`CourseSidebar` + `src/lessons/curriculum.ts`):

- grouped conceptual sections;
- current lesson clearly identified; upcoming lessons shown subtly;
- long titles remain readable;
- **no** cramped horizontal lesson tabs;
- narrow screens use a drawer/compact menu;
- **no** points, streaks, badges, or gamified progression.

---

## Mathematical notation

Learner-facing rules:

- Use **KaTeX** for conceptual equations, vectors, and matrices.
- Use **column-vector** notation consistently.
- **Never** expose programming-array notation (e.g. `[[2,1],[0,1]]`) in
  learner-facing prose. Compact numeric UI values may stay plain text.
- Equation formatting should match the visual object being discussed.
- Names/symbols stay consistent across prose, guided scenes, explorations, exercises.
- Do **not** accept arbitrary untrusted TeX (render trusted static lesson TeX only).

**Conventional symbols.** Follow standard mathematical convention:

- **Standard basis:** \(\mathbf{e}_1, \mathbf{e}_2\) (or \(e_1, e_2\) in canvas labels).
  Do **not** put hats on the standard basis — hats usually mark *generic* unit
  vectors \(\hat{u}, \hat{v}\), which is a different role.
- General vectors are bold lowercase: \(\mathbf{v}, \mathbf{w}\).
- Matrices are uppercase: \(A\); scalars lowercase: \(a, b, \lambda\).
- Eigen-things: eigenvalue \(\lambda\), eigenvector \(\mathbf{v}\) with \(A\mathbf{v} = \lambda\mathbf{v}\).

Preferred:

```tex
A = \begin{bmatrix} 2 & 1 \\ 0 & 1 \end{bmatrix},
\qquad
A\mathbf{e}_1 = \begin{bmatrix} 2 \\ 0 \end{bmatrix},
\qquad
A\mathbf{e}_2 = \begin{bmatrix} 1 \\ 1 \end{bmatrix}
```

Discouraged:

- `A = [[2, 1], [0, 1]]` in prose.
- Row-vector or transpose-implicit forms when a column vector is meant.
- Hatting the standard basis (\(\hat{e}_1\)) when \(\mathbf{e}_1\) is meant.

---

## Visual language

> **Visual system (2026 refinement).** The full palette, typography roles,
> section hierarchy, and per-phase presentation are documented in
> [visual-design-refinement.md](./visual-design-refinement.md). In short: a
> **light-first, warm-ivory lesson page** with deep-navy text and **dark
> visualization canvases** framed as illustrations; a humanist sans for
> body/UI and an expressive serif reserved for the lesson title, the motivating
> question, and the key takeaway. Lesson 1 is the reference implementation.

Consistent **semantic roles**, referenced via design tokens (`--role-*` in
`src/styles/tokens.css`) — do not hardcode raw colors. The `--role-*` colors are
tuned for the **dark canvas** and stay consistent across the light page and the
guided animation:

- original vector
- transformed vector
- first basis vector \(\mathbf{e}_1\) (role token `--role-basis-1`)
- second basis vector \(\mathbf{e}_2\) (role token `--role-basis-2`)
- selected object
- invariant direction (e.g. eigen-directions)
- intermediate state
- reachable region (span)

Requirements:

- Roles are **consistent across all lessons**.
- Add **non-color cues** for clarity: labels, line patterns, arrowheads, guides.
- Coordinate grids are **visually subdued**.
- Use clear **annotation offsets**; avoid unreadable overlap near the origin.
- Use translucent fills **sparingly**.
- **No decorative animation** unrelated to comprehension.

Do not prescribe exact colors beyond existing tokens; refer to semantic tokens.

---

## Progressive disclosure

Do not show all controls and readouts at once. Primary information first;
secondary controls grouped under **Display options**, **Advanced controls**, or
**More details**.

Prioritize (vectors lesson): \(\mathbf{v}\), \(\mathbf{w}\), \(a\), \(b\),
the resulting linear combination, span classification.

Prioritize (matrix lesson): \(A\), \(\mathbf{v}\), \(A\mathbf{v}\), transformed
basis vectors.

Do not repeat the same values across panels without a teaching reason.

---

## Animation choreography

> For the forward-looking clip quality bar, attention choreography,
> object-identity continuity, the script-event contract, the review rubric, and
> the adoption backlog, see [animation-quality-bar.md](./animation-quality-bar.md).

- **One conceptual change at a time.**
- **Dim** irrelevant objects.
- Use **deliberate pauses**.
- Highlight notation when the corresponding geometry changes.
- Avoid simultaneous movement of many unrelated objects.
- Return to **stable states** between major ideas.
- The **first frame** (paused / pre-autoplay) is an establishing shot, not a blank stage.
- **Label educational interpolation honestly** — do not imply a visual transition
  is a matrix decomposition unless it is one.
- Major steps correspond to meaningful ideas, not arbitrary timestamps.

---

## Exercises and feedback

Types may include: prediction, multiple choice, numeric, vector,
drag-to-condition, parameter adjustment.

Requirements:

- Every exercise has a clear **learning objective**.
- Answers are **deterministic**.
- Grading uses **shared math utilities** (`src/math`).
- Feedback **explains the concept**; incorrect feedback names the misconception where practical.
- Exercises follow directly from the lesson's visual model.
- Visual exercises offer a numeric/parameter alternative for precision.

---

## Responsive behavior

Validate framing/usability (viewport, not disability) at:

- 1366×768, 1440×900, 1920×1080, and a tablet/narrow viewport.

Also inspect at **80% / 100% / 125%** browser zoom. Goal: stable framing and
usability, not identical density.

Require:

- no clipping; no horizontal page overflow;
- diagrams remain readable; controls do not crush visualization space;
- sidebar adapts correctly; Motion Canvas safe frame stays intact.

---

## Performance principles

- React does **not** receive per-frame animation updates (engines own their loops;
  progress is throttled — see the Motion Canvas spike note).
- No unbounded traces or history arrays.
- Do not render invisible complex scenes unnecessarily.
- Do not optimize prematurely at the cost of clarity.
- Preserve cleanup and lifecycle instrumentation.

---

## Required lesson artifacts

Every production lesson should include:

- a typed lesson definition (`LessonDefinition`);
- shared mathematical examples (by id — no duplicated constants);
- guided-scene registration;
- interactive-explorer registration;
- a motivating question;
- explanation sections;
- a checkpoint;
- **at least two** exercises;
- a key takeaway;
- unit/component tests and browser tests;
- a completed [LESSON_CORRECTNESS_CHECKLIST.md](./LESSON_CORRECTNESS_CHECKLIST.md).

---

## Anti-patterns

Prohibited:

- documentation-like wall of identical cards;
- raw array notation in learner-facing content;
- unrelated fallback scenes;
- silent mathematical fallbacks;
- duplicated matrix/vector arithmetic;
- hardcoded geometry that bypasses `src/math`;
- decorative continuous animation;
- tiny animation surrounded by dominant controls;
- every control visible at once;
- color-only explanations (add labels/patterns);
- cramped horizontal lesson tabs;
- debug instrumentation in normal learner UI;
- exercises disconnected from the visual model;
- visually plausible but unverified mathematics.

> Note: being **flexible** for supporting concepts is **not** an anti-pattern —
> see [Flexibility](#flexibility). Rigidly forcing every lesson into an identical
> six-block shell when a concept needs a supporting beat *is* discouraged.

---

## Basic accessibility (keep)

Keep **lightweight** accessibility as a normal quality bar — not a full WCAG /
disability-product effort:

- keyboard-focusable controls with visible focus;
- labelled form controls (sliders, buttons, inputs);
- descriptive labels / `aria-label`s on diagram regions;
- text equivalents for important visual conclusions (readouts, legends);
- do not convey meaning by color alone (pair with labels or line style);
- respect `prefers-reduced-motion` for autoplay (pause continuous motion; allow
  discrete step navigation).

Full disability-specific optimization (screen-reader narration scripts,
specialized color-blind palettes as a primary design driver, etc.) remains
outside the POC’s product scope — but do **not** strip the basics above.

---

## Out of scope

- Full disability-product accessibility programs (beyond [Basic accessibility](#basic-accessibility-keep)).
- Backend/AI features; a large external design system; copying another product's
  identity; rewriting the math engine or the Motion Canvas / Mafs integration.

---

## Lesson design acceptance checklist

- [ ] Lesson follows the six-phase flow (or documents a principled deviation)
- [ ] Animation teaches one idea at a time
- [ ] Exploration continues from the guided example
- [ ] Shared math model reused (no duplicated arithmetic)
- [ ] KaTeX used consistently; standard-basis notation \(\mathbf{e}_1, \mathbf{e}_2\)
- [ ] Basic accessibility preserved (focus, labels, readouts, reduced-motion autoplay)
- [ ] Diagrams labelled and unclipped (safe frame intact)
- [ ] Controls use progressive disclosure
- [ ] Exercises align with learning goals; feedback explains reasoning
- [ ] Required viewport/zoom testing completed
- [ ] [LESSON_CORRECTNESS_CHECKLIST.md](./LESSON_CORRECTNESS_CHECKLIST.md) completed
- [ ] All tests pass (unit, component, browser)
