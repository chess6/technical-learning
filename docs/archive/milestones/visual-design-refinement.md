# Visual design refinement

Design milestone that turns the technically-sound POC (which read like
*developer documentation with embedded visualizations*) into a **friendly,
modern educational experience** — inspired by the clarity of Khan Academy but
with an original identity centered on animated, interactive mathematics.

**Lesson 1 (Vectors and Linear Combinations) is the reference implementation.**
Lesson 2 inherits every shared shell/component and remains fully functional;
Lessons 3–4 are untouched.

Pair with [authoring/lesson-design.md](../../authoring/lesson-design.md) (pedagogy) and
[engineering/math-correctness.md](../../engineering/math-correctness.md) (geometry). This note is the source
of truth for **look and feel**.

---

## Direction

“Khan Academy’s friendliness and structure combined with a living interactive
mathematics notebook.” Welcoming, calm, visual-first, college-level, distinctly
educational — **not** an API reference, admin dashboard, dev playground, generic
dark SaaS UI, or a worksheet pasted into a page.

The composition is **light-first**: warm-ivory lesson pages with deep-navy text,
and **dark visualization canvases** that read as animated illustrations placed
on a warm textbook page.

---

## Palette & semantic tokens

All colors live in `src/styles/tokens.css`. **Never hardcode colors in
components.** Existing token names were redefined in place (light-first), and new
semantic aliases were added, so component CSS keeps referencing stable names.

### Surfaces & text (light page)

| Token | Value | Role |
| --- | --- | --- |
| `--color-page-bg` | `#f8f5ef` | warm ivory lesson background |
| `--color-sidebar-bg` | `#f1ece1` | course navigation background |
| `--color-surface-subtle` | `#f2ede3` | quiet inset panels / readouts |
| `--color-surface-raised` | `#ffffff` | elevated cards, inputs |
| `--color-divider` / `--color-divider-strong` | `#e7dfcf` / `#dbd0bd` | warm-gray hairlines |
| `--color-text` | `#202b38` | deep navy/charcoal body |
| `--color-text-muted` / `--color-text-faint` | `#545f6c` / `#7c8794` | secondary / metadata |

Back-compat aliases (`--color-bg`, `--color-surface`, `--color-border`,
`--color-border-subtle`, `--color-text-*`) resolve to the above.

### Accents & status

`--color-primary` `#2c6f8c` (soft-deep blue action, also `--color-accent`);
`--color-focus` `#3f86ad`. Accent family: `--accent-blue`, `--accent-teal`,
`--accent-coral`, `--accent-gold`, `--accent-lavender`. Status:
`--color-success`, `--color-warning`, `--color-error`. Restrained on-light tints
(`--tint-blue`, `--tint-gold`, `--tint-teal`) back the phase bands.

### Math roles (on the dark canvas — preserved & consistent)

`--role-original` (blue) · `--role-transformed` / `--role-result` (gold) ·
`--role-basis-1` (teal-green, \(\mathbf{e}_1\)) · `--role-basis-2` (lavender,
\(\mathbf{e}_2\)) · `--role-selected` / `--role-highlight` (gold) ·
`--role-invariant` (coral-pink) · `--role-intermediate` (gray) ·
`--role-reachable` (span). These are tuned for the dark canvas and are shared by
the guided animation and the Mafs explorer.

### Dark canvas

`--color-canvas` `#0e1420`, `--color-canvas-text` `#e8edf4` (Mafs `--mafs-fg`,
so axis labels stay legible on the dark canvas), `--color-grid`, `--color-axis`.

---

## Typography

- **Body / UI / controls / sidebar / exercises:** humanist sans
  (`--font-sans`, Source Sans 3).
- **Expressive serif, used sparingly** (`--font-display`, Fraunces): lesson
  title, the motivating question, the key-takeaway statement, and the guided
  “current idea” line.
- Larger body (`--text-base` 17px, relaxed line height, `--prose-max` 40rem),
  a clearer size ramp (up to `--text-4xl` for lesson titles), and
  `text-wrap: balance` on large display lines.
- **No** tiny uppercase utility labels for content, no code-metadata labels, no
  weak multi-size hierarchy. (Course-section group headers in the sidebar are the
  one small-caps exception — a familiar table-of-contents convention.)

---

## Section hierarchy (six phases)

Phases are visually distinct — **not identical cards** — with a numbered rail cue
and a conversational title (`LessonLayout.tsx` / `.css`):

| Phase | Title | Treatment |
| --- | --- | --- |
| 1 | Think about it | airy tinted band, faint dot-grid motif, large serif question |
| 2 | Watch the idea | prose beside a **dominant dark animation** (sticky on wide screens) |
| 3 | Quick check | slim teal-bordered band, reveal answer |
| 4 | Try it yourself | transition lede + elevated explorer card |
| 5 | Practice | one-question-at-a-time card |
| 6 | Remember this | gradient takeaway blockquote + collapsed objectives |

Generous vertical rhythm (`--space-16` between phases); scrolling is expected.

---

## Guided animation presentation

`GuidedScenePlayer` is framed as a **lesson illustration**, not a debug widget:

- dark canvas inside a soft warm frame (`--shadow-canvas`), safe margins, no clip;
- the current idea reads as a natural-language line under a small “Watching now”
  eyebrow (uses the serif);
- learner-friendly controls: **Play / Pause / Replay** and **Previous / Next
  idea**; the crowded numbered step row became **restrained progress dots** (still
  keyboard-focusable with `aria-label`s);
- a thin timeline scrubber; **no engine counters or diagnostics** in normal UI
  (debug stays behind `?debug=1`);
- autoplay once when ≥55% visible; `prefers-reduced-motion` pauses continuous
  motion and shows a note directing learners to Previous/Next idea.

---

## Interactive exploration presentation

`ExplorationPanel` + `LinearCombinationExplorer` feel like a guided activity:

- the **dark canvas is visually dominant** (≈1.7fr vs 0.7fr controls);
- a **prominent, natural-language result statement** above the body
  (e.g. *“These two directions are independent, so their linear combinations
  reach every point of the plane.”*);
- primary controls (coefficients \(a\), \(b\); preset pair; Reset) are visible;
  numeric vectors and display toggles live under a **“Display options & numeric
  vectors”** disclosure;
- KaTeX for vectors/results in a compact readout; numeric entry preserved
  alongside dragging; Reset preserved.

---

## Exercise flow

`ExercisePanel` shows **one question at a time** (answer state lifted so work
survives navigation):

- progress “Question X of N” + status dots;
- large answer targets; immediate, explanatory feedback tied to the concept;
- **Previous / Next question**; earlier questions can be revisited;
- a compact **completed summary** (revisit links, no gamification) once every
  question has been attempted;
- deterministic grading and keyboard accessibility unchanged;
  `data-choice-index` / `data-state` hooks preserved for tests.

---

## Global shell & sidebar

`AppShell` + `CourseSidebar`: a two-line “Linear Algebra / Visual Learning”
title, grouped sections (**Foundations / Transformations / Later topics**),
numbered items with clear current / prior / upcoming states, and future topics
shown subtly. Sticky offset by `--header-height` so the TOC never visually
restarts mid-scroll; collapses to a drawer < 960px.

---

## Responsive

Validated 1366×768, 1440×900, 1920×1080, tablet, and narrow mobile, plus
80–125% zoom. Watch layout is two-column > 1100px (viz sticky) and stacks below;
explorer stacks < 900px; sidebar becomes a drawer < 960px. e2e asserts **no
horizontal overflow** and a stable guided-canvas aspect ratio across 1366/1440/
1920/800.

---

## Accessibility (kept)

Keyboard-focusable controls with visible focus, labelled inputs, `aria-label`s on
diagram regions and idea dots, text-equivalent readouts, meaning never by color
alone (labels + line style), reduced-motion-aware autoplay, sensible heading
order. Nothing accessible was removed for visual simplicity.

---

## Patterns to reuse for Lessons 2–4

- Drive everything from tokens; keep `--role-*` on the dark canvas.
- Reuse `LessonLayout` phases, `GuidedScenePlayer`, `ExplorationPanel`,
  `ExercisePanel`, `LessonSummary` — do not fork per lesson.
- Give each explorer a **natural-language result statement** and progressive
  disclosure of secondary controls.
- Reserve the serif for title / motivating question / takeaway only.
