# Semantic Page Grammar

How a rigorous lesson **reads**. This is the presentation half of the mastery
system: where [authoring/templates/lesson-mastery-contract.md](../authoring/templates/lesson-mastery-contract.md)
guarantees *what* a lesson must contain and
[authoring/lesson-design.md](../authoring/lesson-design.md) owns the *mechanics* (the block palette,
`route`, visual language, accessibility), this document owns *how the content
signals its own structure* — so a lesson reads like a well-set piece of
mathematics, not a mechanically assembled sequence of labelled phases.

It also carries the **mathematical object and representation standard**
([§4](#4-mathematical-object-and-representation-standard)) — the content
infrastructure, the per-object **capability contract**, and the accountable
abstraction path that keep general concepts from being imprisoned in their easiest
visual case.

Read alongside:

- [authoring/lesson-design.md](../authoring/lesson-design.md) — the block palette and their internal
  names; the visual-language tokens; navigation and accessibility.
- [product/vision.md](vision.md) — §6
  (explanation style), §9 (visual vocabulary), §10 (worked examples), §13
  (information layering) — the pedagogy this grammar formats.
- [authoring/mastery-standard.md](../authoring/mastery-standard.md) — the mastery
  dimensions and representation-translation requirement (D4) this serves.

---

## 1. The core shift: infer the role, do not announce it

The block palette in authoring/lesson-design.md has internal names — **Motivate, Watch,
Check, Explore, Practice, Summarize**. Those names are useful as **internal block
types, analytics categories, and the basis for accessibility metadata** — they are
*not* learner-facing headings.

They must **not** become the visible spine of every lesson. When each lesson
announces the same generic phase headings in the same order, lessons feel
assembled from a template rather than written about a specific piece of
mathematics.

> **Durable rule.** A reader should infer a block's role from its *content and
> typography*, not from a generic phase label. The internal block type drives the
> `route`, telemetry, and a11y metadata; the **visible heading is content-specific**
> ("When does a system have no solution?"), not "Quick check". The **table of
> contents likewise uses the content-specific headings**, never the internal phase
> names.

This does not forbid a short functional word where it genuinely helps (a
"Definition" tag on a definition, an "Example" label on an example — see
[§5.2](#52-block-treatments-the-textbook-furniture)). It forbids the *repetitive,
lesson-spanning phase rail* that makes every lesson look identical.

### 1.1 Four naming layers, kept distinct

A lesson names things at four independent layers. Do not collapse them — in
particular, the internal block type is never a visible heading, and a
screen-reader description never substitutes for a visible label.

| Layer | Purpose | Audience | Examples | Source of truth |
| --- | --- | --- | --- | --- |
| **Visible mathematical label** | Names the *kind* of a formal object where mathematical convention expects it. | Learner, on the page | *Definition*, *Theorem*, *Lemma*, *Proof*, *Example* | math convention; `FormalBlock.kind` ([types.ts](../../src/lessons/types.ts)) |
| **Content-specific visible heading** | Says what *this* block is actually about, in the lesson's own words. | Learner, on the page | "When does a system have no solution?" | authored per lesson |
| **Internal block / analytics type** | Drives `route`, sequencing, telemetry, rendering. Never surfaced as a heading. | Tooling / authors | `motivate`, `watch`, `check`, `explore`, `practice`, `summary` | `RouteBlock.kind` ([types.ts](../../src/lessons/types.ts)) |
| **Screen-reader-only functional description** | Announces a block's function to assistive tech when the visible heading alone would not. | Assistive-tech users | "Interactive exploration:", "Guided animation:" prefixes | a11y metadata |

- The **table of contents uses content-specific headings** (row 2), never the
  internal phase names (row 3). A ToC entry reads "When does a system have no
  solution?", not "Check" or "Quick check".
- The visible mathematical label (row 1) and the content-specific heading (row 2)
  can co-occur: a *Definition*-labelled block can sit under a content heading.
- The screen-reader-only description (row 4) **supplements** a visible text
  label; it never replaces one (the a11y invariant below).

### What carries the role instead

A reader (and a screen-reader user) can tell a block's job from a combination of
cues — never one alone:

- **content-specific headings** in the lesson's own words;
- **typography** — a distinct treatment for the title, motivating question, and
  key takeaway versus body text (the *exact* type system — serif/sans choices — is
  owned by [authoring/lesson-design.md](../authoring/lesson-design.md), not fixed here);
- **spacing and hierarchy** — whitespace does most grouping, not identical cards
  (LESSON_DESIGN "Page and information hierarchy");
- **restrained icons or symbols** — a small marker for a warning or a proof end
  (∎), never a wall of emoji;
- **equation layout and numbering** ([§3](#3-equation-and-notation-layout));
- **theorem / definition / example / proof / warning / exercise treatments**
  ([§5.2](#52-block-treatments-the-textbook-furniture));
- **canvas / laboratory framing** — a visualization canvas reads as an
  illustration or an instrument, distinct from prose (LESSON_DESIGN owns the exact
  canvas styling);
- **interaction controls** — their presence signals "you drive this now";
- **color and borders used consistently** via the shared semantic role tokens
  (the concrete `--role-*` token set and CSS conventions live in LESSON_DESIGN);
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
- a paused guided scene at \(t=0\) still shows an **establishing frame**
  (LESSON_DESIGN animation choreography) — orientation is itself an act, even in
  the visual;
- guided-to-interactive **continuity** is preserved (same example, notation, and
  semantic roles).

**Watch-before-Explore is the common default, not a universal invariant.** Guided
explanation usually precedes learner exploration, and LESSON_DESIGN states it as
the default ordering. This grammar permits the reverse — **learner exploration
before guided explanation** — in the specific case where the exploration is what
*creates the motivating question* (the learner discovers the phenomenon, and the
guided Watch then explains it) **and** the
[Lesson Mastery Contract](../authoring/templates/lesson-mastery-contract.md) explicitly justifies the
sequence while still evidencing every outcome. Absent that justification, keep the
default. Even when Explore comes first, the establishing-frame and continuity
commitments above still hold.

Concretely, a lesson's `route` most often opens with a `motivate` and/or a
`section` (content-specific heading) **before** `watch`/`visual`, so the visual
lands on a prepared mind; a contract-justified lesson may instead open on an
`explore` that raises the question, with `watch` following to explain it.

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
engineering/math-correctness.md).

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
  [`src/lessons/types.ts`](../../src/lessons/types.ts).

Where the platform does not yet model one of these, that is a **known gap**
(cross-reference the [benchmark gaps](../courses/linear-algebra/benchmark-matrix.md#3-course-level-gaps-summary)),
not a license to fake it with a lossy 2×2 stand-in.

### 4.2 The object-capability contract

The inventory above says *which* objects should exist; this contract says *what a
given object must be able to do* before a lesson may rely on it. An inventory
entry is not enough — a "vector space" that cannot state its field, reject an
invalid instance, or translate to another representation is not usable content.

When a lesson introduces or reuses a mathematical object, name (in its
[Lesson Mastery Contract](../authoring/templates/lesson-mastery-contract.md)) which capabilities it
depends on and confirm `src/math` supplies them. Do not paper over a missing
capability with a lossy stand-in — record it as a gap instead.

| Capability | What it fixes | Example obligation |
| --- | --- | --- |
| **Domain / field** | The scalar field and ambient set the object lives in. | A vector space is over \(\mathbb{R}\), \(\mathbb{C}\), or \(\mathbb{Q}\) — state it; never silently assume \(\mathbb{R}\). |
| **Dimensions & validity** | Admissible shapes/sizes and what makes an instance well-formed. | A matrix product needs conformable shapes; a basis of \(\mathbb{R}^n\) has exactly \(n\) independent vectors; invalid inputs are rejected, not silently coerced. |
| **Exactness** | Whether values are exact (integer / rational / radical / complex) or approximate, and which the learner is shown. | Eigenvalue-rationality claims use exact arithmetic; a float never appears inside an exact statement. |
| **Supported operations** | The operations defined on the object, each with its preconditions. | Add / scale / compose / invert / transpose / solve / decompose — with domain checks, not unconditional formulas. |
| **Semantic equivalence** | When two distinct encodings denote the *same* object. | Row-equivalent augmented matrices define the same solution set; different bases can represent one subspace; two affine sets \(x_p+\operatorname{span}\{v_i\}\) can coincide. |
| **Representations & translations** | The alternate encodings and the *correct, tested* maps between them. | linear map ↔ matrix-in-a-basis; system ↔ augmented matrix ↔ vector equation; subspace ↔ spanning set ↔ basis. Each translation is a `src/math` helper, not ad-hoc UI math. |
| **Exercise generation** | Whether valid, varied instances can be produced with known answers for assessment. | Generate solvable / unsolvable systems of controlled rank; sample matrices with integer eigenvalues; always yield a checkable answer key. |
| **Invariant / correctness diagnostics** | The invariants that must hold and the checks that catch a wrong instance. | `matrixVectorMultiply` agrees with `transformedGridSegments`; determinant sign; \(A(x_p+t v)=b\) for all \(t\). Use `src/math/invariants.ts` (MATH_CORRECTNESS rule). |

This is the presentation-side companion to the mastery standard's
[D4 representation-translation dimension](../authoring/mastery-standard.md#4-mastery-dimensions):
D4 requires a lesson to *offer* multiple representations of its object; this
contract requires the object model to *support and correctly translate* them.

### 4.3 The abstraction path

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
  *only* in its easiest visual case. But the return to the general case is
  **accountable, not necessarily immediate**: it may occur **within the lesson**
  or be **deferred to an explicitly named later lesson or module artifact**. A
  deferral is valid only when it records all three of —
  - **Owner** — the specific lesson or module (by id) responsible for the return;
  - **Destination** — where the general case is actually reached (e.g.
    \(\mathbb{R}^n\), an abstract vector space, or a coordinate-free statement);
  - **Assessment evidence** — the exercise or assessment item, in that owner's
    [Lesson Mastery Contract](../authoring/templates/lesson-mastery-contract.md), that shows the learner
    *operating* in the general case, not merely reading about it.

  An in-lesson return still owes the evidence; its owner and destination are then
  simply "this lesson, here". A general concept taught in \(\mathbb{R}^2\) with
  **no** named owner, destination, and evidence for its return is an unbacked
  promise and **fails** the gate. (The solution-sets lesson is the in-lesson
  reference: its nullity-2 slider and symbolic \(x_p+\sum t_i v_i\) *experience or
  state* a higher-dimensional case rather than omitting it.)
- This is the presentation counterpart of
  [Lesson Mastery Contract rejection #4](../authoring/templates/lesson-mastery-contract.md#5-rejection-conditions-the-mastery-gate)
  ("trapped in the convenient representation") and
  [calibration case #4](../authoring/mastery-standard.md#8-calibration-cases). The
  named-owner discipline mirrors the mastery standard's forward-bridge and
  coherence requirements ([COURSE §7](../authoring/mastery-standard.md#7-course--lesson-coherence)).

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
| **Canvas / Laboratory** | A framed visualization (LESSON_DESIGN owns the exact framing/styling); read-only guided scene vs. learner-driven explorer distinguished by the presence of controls. | Motion Canvas / Mafs |
| **Exercise** | A distinct interactive treatment; its tier (`check`/`drill`/`transfer`) may inform styling but is not shouted. | `ExerciseDefinition` |
| **Summary** (internal role only) | A compact, scannable synthesis and re-entry point. Its **visible heading names the actual mathematical synthesis** ("The solution set is a particular point plus a subspace"), never a generic "Remember this". | `StructuredSummary` |

Every treatment pairs its visual signal with a **text label** (a11y invariant,
§1). The furniture is consistent across lessons so the reader learns to read it
once.

---

## 6. Relationship to existing standards (no duplication)

- **authoring/lesson-design.md** still owns the block palette, the `route` mechanism, the
  visual tokens, navigation, and accessibility. This document changes only *how
  the blocks present their role* — content-specific headings and consistent
  furniture instead of a repeated generic phase rail — and adds the opening,
  representation, and abstraction standards. LESSON_DESIGN's learner-facing-title
  table is retained as the **internal/analytics/a11y** naming, with a pointer to
  this grammar for what the learner actually sees.
- **product/vision.md** owns the pedagogy (why); this owns the
  typographic/structural expression of it.
- **The mastery gate** ([authoring/templates/lesson-mastery-contract.md](../authoring/templates/lesson-mastery-contract.md))
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
- [ ] A general concept **returns to the general case** — in-lesson, or via an
      **accountable deferral** naming an owner, destination, and assessment
      evidence — not only its 2D visual (§4.3).
- [ ] Every mathematical object the lesson relies on has its needed
      **capabilities** (field, validity, exactness, operations, equivalence,
      translations, generation, diagnostics) supported or logged as a gap (§4.2).
- [ ] Visible headings (incl. the table of contents and any summary) are
      **content-specific**, not internal phase names like "Remember this" (§1,
      §1.1).
- [ ] Block roles are signalled by **consistent furniture + text labels**, never
      color or symbol alone (§1, §5.2).
