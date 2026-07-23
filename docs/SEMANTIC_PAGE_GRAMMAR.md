# Semantic Page Grammar

How a rigorous lesson **reads**. This is the presentation half of the mastery
system: where [LESSON_MASTERY_CONTRACT.md](./LESSON_MASTERY_CONTRACT.md)
guarantees *what* a lesson must contain and
[LESSON_DESIGN.md](./LESSON_DESIGN.md) owns the *mechanics* (the block palette,
`route`, visual language, accessibility), this document owns *how the content
signals its own structure* — so a lesson reads like a well-set piece of
mathematics, not a mechanically assembled sequence of labelled phases.

It also carries the **mathematical object and representation standard**
([§4](#4-mathematical-object-and-representation-standard)) — the content
infrastructure and the abstraction path that keep general concepts from being
imprisoned in their easiest visual case.

Read alongside:

- [LESSON_DESIGN.md](./LESSON_DESIGN.md) — the block palette and their internal
  names; the visual-language tokens; navigation and accessibility.
- [INTERACTIVE_TEXTBOOK_VISION.md](./INTERACTIVE_TEXTBOOK_VISION.md) — §6
  (explanation style), §9 (visual vocabulary), §10 (worked examples), §13
  (information layering) — the pedagogy this grammar formats.
- [COURSE_MASTERY_STANDARD.md](./COURSE_MASTERY_STANDARD.md) — the mastery
  dimensions and representation-translation requirement (D4) this serves.

---

## 1. The core shift: infer the role, do not announce it

The block palette in LESSON_DESIGN.md has internal names — **Motivate, Watch,
Check, Explore, Practice, Summarize** — with the learner-facing titles "Think
about it", "Watch the idea", "Quick check", "Try it yourself", "Practice",
"Remember this". Those names remain useful as **internal block types, analytics
categories, and accessibility metadata.**

They must **not** become the visible spine of every lesson. When each lesson
announces the same generic phase headings in the same order, lessons feel
assembled from a template rather than written about a specific piece of
mathematics.

> **Durable rule.** A reader should infer a block's role from its *content and
> typography*, not from a generic phase label. The internal block type drives the
> `route`, the table of contents, and a11y labels; the **visible heading is
> content-specific** ("When does a system have no solution?"), not "Quick check".

This does not forbid a short functional word where it genuinely helps (a
"Definition" tag on a definition, an "Example" label on an example — see
[§5](#5-block-treatments-the-textbook-furniture)). It forbids the *repetitive,
lesson-spanning phase rail* that makes every lesson look identical.

### What carries the role instead

A reader (and a screen-reader user) can tell a block's job from a combination of
cues — never one alone:

- **content-specific headings** in the lesson's own words;
- **typography** — an expressive serif for the title, motivating question, and
  key takeaway; a humanist sans for body and UI (LESSON_DESIGN visual system);
- **spacing and hierarchy** — whitespace does most grouping, not identical cards
  (LESSON_DESIGN "Page and information hierarchy");
- **restrained icons or symbols** — a small marker for a warning or a proof end
  (∎), never a wall of emoji;
- **equation layout and numbering** ([§3](#3-equation-and-notation-layout));
- **theorem / definition / example / proof / warning / exercise treatments**
  ([§5](#5-block-treatments-the-textbook-furniture));
- **canvas / laboratory framing** — a dark visualization canvas reads as an
  illustration or an instrument, distinct from prose;
- **interaction controls** — their presence signals "you drive this now";
- **color and borders used consistently** via `--role-*` tokens;
- **accessible textual labels** where a visual cue would otherwise be the only
  signal.

**Accessibility invariant (non-negotiable).** Symbol or color **alone** must not
carry essential meaning. Every role cue is paired with a text label or a
non-color cue (LESSON_DESIGN "Basic accessibility"; MATH_CORRECTNESS non-color
grammar). A definition is not "the pink box"; it is a block labelled *Definition*
that also happens to use a consistent treatment.

---

## 2. Lesson openings: orient before you visualize

Correct the current tendency to lead a lesson with "Watch the idea" — a major
visual before the learner knows what they are looking at or why.

**A visual should appear when it has acquired a mathematical purpose, not merely
because the product is interactive.** Before a major visual or interaction, the
learner normally needs enough orientation to answer:

1. What object or problem are we studying?
2. How did it arise from earlier material? (the backward bridge, COURSE §7)
3. What is currently difficult, incomplete, or surprising?
4. What question should the upcoming representation answer?
5. Why will the answer matter?

The opening may take whatever form best raises the genuine question — prose, a
worked example, a contradiction, a question, an application, or a brief
definition. **Do not prescribe one universal opening sequence.** The only
durable commitments are:

- the learner holds a **real question** before the first heavy representation
  (Vision §5.3; this is *question before procedure*, still binding);
- guided **Watch precedes learner Explore** (LESSON_DESIGN, unchanged);
- a paused guided scene at \(t=0\) still shows an **establishing frame**
  (LESSON_DESIGN animation choreography) — orientation is itself an act, even in
  the visual.

Concretely, this means a lesson's `route` frequently opens with a `motivate`
and/or a `section` (content-specific heading) **before** `watch`/`visual`, rather
than opening on `watch`. The visual then lands on a prepared mind.

---

## 3. Equation and notation layout

Notation is part of the picture, not a separate code (Vision §6). Follow
LESSON_DESIGN's notation rules (KaTeX, column vectors, standard basis
\(\mathbf{e}_1,\mathbf{e}_2\) without hats, never raw `[[...]]` in prose) and,
for layout:

- **Display vs inline.** A load-bearing equation is *displayed* and given room;
  a passing symbol stays inline. Do not bury the result of a derivation in a
  sentence.
- **Numbering when referenced.** Number an equation only when the prose later
  refers back to it; do not number decoratively. A worked computation is a plain
  ordered list of expressions (`WorkedExample.equations`) — equations first,
  prose only for a subtle connection, a misconception, or a non-obvious
  transition (Vision §10; do **not** annotate every line).
- **Alignment carries meaning.** Align steps of a derivation so the *changing*
  part is visually obvious; align the geometric event beside the symbolic step it
  means when a synchronized visual is present (Vision §5.4 — meaningful steps
  only, not bookkeeping).
- **Matrices/vectors match the object.** The equation's shape should mirror the
  object under discussion (a column vector reads as a column).

---

## 4. Mathematical object and representation standard

A rigorous technical textbook needs a content infrastructure richer than
2×2 real matrices, and a disciplined way to raise abstraction. This section is
the standard for both. It is a **roadmap and a discipline**, not a demand to
build all of it now (`src/math` is the source of truth and grows deliberately;
MATH_CORRECTNESS.md).

### 4.1 Object infrastructure the standard points toward

For linear algebra specifically, the standard should *eventually* support (each
item is a capability the content model owes when a lesson needs it — not a
near-term build order):

- **exact numbers** — integers, fractions, radicals, and complex numbers
  (exactness matters for definitions like rationality of eigenvalues; avoid
  silent floating-point rounding in learner-facing exact statements);
- **vectors in arbitrary finite dimension** (not only \(\mathbb{R}^2\));
- **matrices of arbitrary valid dimensions**;
- **systems and augmented matrices** of general size;
- **subspaces, spans, sums, intersections, kernels, and images**;
- **bases and coordinate representations** (coordinates relative to a chosen
  basis, per L1's insight);
- **linear maps defined independently of a chosen matrix** (the map is the
  object; its matrix is a representation) — a Profile-3 necessity;
- **polynomial, function, sequence, and matrix vector spaces** (abstract
  examples that break the "vectors are arrows" ceiling);
- **inner products, norms, orthogonality, and projections**;
- **eigenvalues, eigenspaces, diagonalization, and related structures**;
- **mathematical statements as first-class objects** — with hypotheses,
  conclusions, dependencies, and *proof status* (proved / assumed / conjectured),
  aligning with the `FormalBlock` `kind`/`visibility` model in
  [`src/lessons/types.ts`](../src/lessons/types.ts).

Where the platform does not yet model one of these, that is a **known gap**
(cross-reference the [benchmark gaps](./LINEAR_ALGEBRA_BENCHMARK_MATRIX.md#3-course-level-gaps-summary)),
not a license to fake it with a lossy 2×2 stand-in.

### 4.2 The abstraction path

The current emphasis on 2D geometric intuition is **valuable and must be kept** —
but it must not become a conceptual prison. Where a concept is genuinely general,
a lesson formalizes a common abstraction path:

```
concrete or visual case
  → coordinate representation
    → general symbolic structure
      → abstract definition
        → an unfamiliar example (not the visual one)
          → return to the original intuition, now with greater precision
```

Rules:

- A lesson **need not** always follow this order (an intro or a purely
  computational drill legitimately stays concrete).
- A lesson **must not** leave the learner believing a general concept exists
  *only* in its easiest visual case. If it teaches a general idea in
  \(\mathbb{R}^2\), it returns to the general case at least symbolically (the
  solution-sets lesson's nullity-2 slider and symbolic \(x_p+\sum t_i v_i\) are
  the reference: a higher-dimensional case is *experienced or stated*, not
  omitted).
- This is the presentation counterpart of
  [Lesson Mastery Contract rejection #4](./LESSON_MASTERY_CONTRACT.md#5-rejection-conditions-the-mastery-gate)
  ("trapped in the convenient representation") and
  [calibration case #4](./COURSE_MASTERY_STANDARD.md#8-calibration-cases).

---

## 5. Representation-appropriate teaching

Replace "visual-first" as a *universal* rule with:

> **Use the representation best suited to the mathematical job.**

Visualization dominates when **motion, geometry, invariance, dependence, or
transformation** is the central object (the "moving space" grid; a direction
snapping onto its line; area crossing zero). It must **not** displace prose or
formal mathematics where those give greater precision and explanatory power.

Depth may require any of — chosen for fit, not habit:

- several connected explanatory paragraphs;
- formal definitions;
- step-by-step derivations;
- proofs;
- examples and counterexamples;
- diagrams or animations;
- manipulable objects;
- computational experiments;
- exercises;
- summaries and forward bridges.

### 5.1 Rich mathematical prose is a first-class representation

Prose is allowed — and expected — to do real work, not just caption visuals. Good
mathematical prose may:

- connect chapters and lessons;
- motivate a new object before it is defined;
- sustain a multi-step argument;
- distinguish related-but-different concepts;
- interpret a formula in words;
- explain limitations and edge cases;
- reflect after a proof (what it used, what it did not);
- show what a result unlocks next.

Avoid **both** extremes: terse product copy that under-explains, and inflated
textbook verbosity that pads. The test is Vision §6: every sentence builds the
mental model, binds a symbol to a picture, sustains the argument, or motivates the
next step — otherwise cut it. Optional depth belongs in layers (Vision §13); the
main line reads complete with every layer closed.

### 5.2 Block treatments (the textbook furniture)

Distinct, consistent treatments let a reader recognize a block's *kind* without a
generic phase label. Reuse these; do not invent per-lesson conventions.

| Kind | Treatment (consistent, non-color-only) | Backed by |
| --- | --- | --- |
| **Definition** | Labelled *Definition* with the term set apart; the defined object stated precisely. | `FormalBlock kind:"definition"` |
| **Theorem / Proposition / Lemma / Corollary** | Labelled with its kind and optional name; hypotheses and conclusion visually separable. | `FormalBlock` kinds |
| **Proof** | Set apart from the statement; ends with a clear terminator (∎); may be a collapsed `revealed` block for optional depth. | `FormalBlock visibility` |
| **Example / Nonexample** | Labelled; nonexamples explicitly marked as *not* an instance and *why*. | worked examples / callouts |
| **Worked computation** | An ordered equation sequence; adjacent visual when geometry helps; prose only where it earns its place. | `WorkedExample.equations` |
| **Warning / Common trap** | A misconception staged elicit→confront→resolve, placed where it arises — not a terminal "mistakes" appendix. | `AuthoredCallout`, Vision §12 |
| **Canvas / Laboratory** | A framed (usually dark) visualization; read-only guided scene vs. learner-driven explorer distinguished by the presence of controls. | Motion Canvas / Mafs |
| **Exercise** | A distinct interactive treatment; its tier (`check`/`drill`/`transfer`) may inform styling but is not shouted. | `ExerciseDefinition` |
| **Summary / Remember this** | A compact, scannable compression payoff and re-entry point. | `StructuredSummary` |

Every treatment pairs its visual signal with a **text label** (a11y invariant,
§1). The furniture is consistent across lessons so the reader learns to read it
once.

---

## 6. Relationship to existing standards (no duplication)

- **LESSON_DESIGN.md** still owns the block palette, the `route` mechanism, the
  visual tokens, navigation, and accessibility. This document changes only *how
  the blocks present their role* — content-specific headings and consistent
  furniture instead of a repeated generic phase rail — and adds the opening,
  representation, and abstraction standards. LESSON_DESIGN's learner-facing-title
  table is retained as the **internal/analytics/a11y** naming, with a pointer to
  this grammar for what the learner actually sees.
- **INTERACTIVE_TEXTBOOK_VISION.md** owns the pedagogy (why); this owns the
  typographic/structural expression of it.
- **The mastery gate** ([LESSON_MASTERY_CONTRACT.md](./LESSON_MASTERY_CONTRACT.md))
  checks that the *content* exists; this grammar checks that it *reads well* and
  returns to the general case. A lesson can fail acceptance on either.

### Acceptance additions (presentation)

Complete alongside the LESSON_DESIGN acceptance checklist:

- [ ] The lesson does **not** rely on a repeated generic phase rail; headings are
      content-specific (§1).
- [ ] It **opens with orientation** (a real question), not an unexplained visual
      (§2).
- [ ] Each visual appears where it has a **mathematical purpose**; prose/formal
      math is used where it is the better representation (§5).
- [ ] A general concept **returns to the general case**, not only its 2D visual
      (§4.2).
- [ ] Block roles are signalled by **consistent furniture + text labels**, never
      color or symbol alone (§1, §5.2).
