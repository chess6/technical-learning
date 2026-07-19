# Lesson design standard

Authoritative design specification for every lesson in this project. It exists so
lessons are **not** designed independently: they should share one pedagogical
flow, visual language, interaction model, and quality bar.

Practical enough to follow while building or modifying a lesson. Pair it with:

- [MATH_CORRECTNESS.md](./MATH_CORRECTNESS.md) — mathematical conventions (source of truth for geometry).
- [ERROR_LOG.md](./ERROR_LOG.md) — known math/visualization failure modes.
- [LESSON_CORRECTNESS_CHECKLIST.md](./LESSON_CORRECTNESS_CHECKLIST.md) — per-lesson sign-off.
- [LESSON_TEMPLATE.md](./LESSON_TEMPLATE.md) — fill-in planning template.

> **Scope note (this POC).** Accessibility for disabilities is **out of scope**
> — see [Out of scope](#out-of-scope). This standard is a **backbone, not a
> cage**: the six-phase flow is the default, but lessons may add supporting
> material (e.g. a definition of linear dependence in an intro vectors lesson)
> when it genuinely helps. See [Flexibility](#flexibility).

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
- The sequence must be understandable without narration/audio.

### Check understanding
- A short **conceptual checkpoint**: ask for a prediction or interpretation.
- Avoid lengthy computation.
- Reveal the explanation after the learner responds or chooses to reveal.

### Explore
- Use **Mafs** (or another appropriate interactive renderer).
- **Initialize from the guided scene's main/final example** (see [continuity](#guided-to-interactive-continuity)).
- Preserve the same notation, semantic colors, labels, and mathematical model.
- Expose only the controls needed to test the concept.
- Offer **numeric entry** alongside dragging (for precision, not as an a11y mandate).

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

- **Unit / basis vectors carry a hat:** \(\hat{u}\), \(\hat{v}\); the standard
  basis as \(\hat{\imath}, \hat{\jmath}\) (or \(\hat{e}_1, \hat{e}_2\)).
- General vectors are bold lowercase: \(\mathbf{v}, \mathbf{w}\).
- Matrices are uppercase: \(A\); scalars lowercase: \(a, b, \lambda\).
- Eigen-things: eigenvalue \(\lambda\), eigenvector \(\mathbf{v}\) with \(A\mathbf{v} = \lambda\mathbf{v}\).

Preferred:

```tex
A = \begin{bmatrix} 2 & 1 \\ 0 & 1 \end{bmatrix},
\qquad
A\hat{u} = \begin{bmatrix} 2 \\ 0 \end{bmatrix},
\qquad
A\hat{v} = \begin{bmatrix} 1 \\ 1 \end{bmatrix}
```

Discouraged:

- `A = [[2, 1], [0, 1]]` in prose.
- Row-vector or transpose-implicit forms when a column vector is meant.
- Unhatted basis symbols where a unit/basis vector is intended.

---

## Visual language

Consistent **semantic roles**, referenced via design tokens (`--role-*` in
`src/styles/tokens.css`) — do not hardcode raw colors:

- original vector
- transformed vector
- first basis vector \((\hat{u} / \hat{\imath})\)
- second basis vector \((\hat{v} / \hat{\jmath})\)
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

- **One conceptual change at a time.**
- **Dim** irrelevant objects.
- Use **deliberate pauses**.
- Highlight notation when the corresponding geometry changes.
- Avoid simultaneous movement of many unrelated objects.
- Return to **stable states** between major ideas.
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

## Out of scope

- **Accessibility for disabilities.** This POC assumes learners do **not** have
  disabilities. Do not add ARIA-compliance requirements, screen-reader narration,
  reduced-motion discrete-state mandates, or color-blind-only accommodations as
  acceptance criteria. Existing accessibility code may remain or be simplified; it
  is not a design requirement. (This supersedes the accessibility emphasis in the
  historical `docs/m4-lessons.md`.)
- Backend/AI features; a large external design system; copying another product's
  identity; rewriting the math engine or the Motion Canvas / Mafs integration.

Numeric entry and keyboard-usable controls may still exist where they aid
**precision and general usability** — but they are conveniences, not a11y mandates.

---

## Lesson design acceptance checklist

- [ ] Lesson follows the six-phase flow (or documents a principled deviation)
- [ ] Animation teaches one idea at a time
- [ ] Exploration continues from the guided example
- [ ] Shared math model reused (no duplicated arithmetic)
- [ ] KaTeX used consistently; hat notation for unit/basis vectors
- [ ] Diagrams labelled and unclipped (safe frame intact)
- [ ] Controls use progressive disclosure
- [ ] Exercises align with learning goals; feedback explains reasoning
- [ ] Required viewport/zoom testing completed
- [ ] [LESSON_CORRECTNESS_CHECKLIST.md](./LESSON_CORRECTNESS_CHECKLIST.md) completed
- [ ] All tests pass (unit, component, browser)
