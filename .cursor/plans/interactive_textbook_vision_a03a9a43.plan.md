---
name: Interactive Textbook Vision
overview: "Author docs/INTERACTIVE_TEXTBOOK_VISION.md as the canonical educational design document: a pedagogy-only companion to LESSON_DESIGN.md that expands the existing six-phase flow into a coherent \"interactive textbook\" philosophy, refines (and critiques) the ten supplied design principles with mathematics-education research, and defines the worked-example, animation, practice, misconception, layering, and narrative philosophies for current and future chapters."
todos:
  - id: draft-doc
    content: Write docs/INTERACTIVE_TEXTBOOK_VISION.md with sections 1-14, grounded in existing lessons/docs and cross-referencing LESSON_DESIGN.md / MATH_CORRECTNESS.md
    status: in_progress
  - id: refine-principles
    content: For each of the 10 supplied principles, add a research-grounded refinement/critique (cognitive load, APOS, self-explanation, testing effect, conceptual change, expertise reversal)
    status: pending
  - id: worked-example-ladder
    content: Include the eigenvector derivation ladder as the reference worked-example template and flag the current eigenvectors lesson's missing computational derivation as the motivating gap
    status: pending
  - id: checklist
    content: Add a pedagogical acceptance checklist mirroring LESSON_DESIGN.md's structure but for educational depth
    status: pending
isProject: false
---

# Interactive Textbook Vision

## Goal

Create a single new markdown file, [docs/INTERACTIVE_TEXTBOOK_VISION.md](docs/INTERACTIVE_TEXTBOOK_VISION.md), that becomes the pedagogical counterpart to [docs/LESSON_DESIGN.md](docs/LESSON_DESIGN.md). It is a philosophy document only: no engineering milestones, no infra, no implementation tasks.

## How it fits existing docs

- [docs/LESSON_DESIGN.md](docs/LESSON_DESIGN.md) already owns the *mechanical* standard (phase flow, visual language, notation, continuity, accessibility). The new doc owns the *why* — the learning theory and explanation craft. The vision doc will explicitly defer mechanics to LESSON_DESIGN.md and correctness to [docs/MATH_CORRECTNESS.md](docs/MATH_CORRECTNESS.md) / [docs/ERROR_LOG.md](docs/ERROR_LOG.md) to avoid duplication.
- Grounded in real artifacts: the four lessons ([src/lessons/vectors.ts](src/lessons/vectors.ts), [src/lessons/transformations.ts](src/lessons/transformations.ts), [src/lessons/determinants.ts](src/lessons/determinants.ts), [src/lessons/eigenvectors.ts](src/lessons/eigenvectors.ts)), the phase components in [src/components/lesson/](src/components/lesson/), and the concept ordering in [src/lessons/curriculum.ts](src/lessons/curriculum.ts).

## Reconcile the two stated flows

LESSON_DESIGN.md uses six phases (Motivate -> Watch -> Check -> Explore -> Practice -> Summarize); the prompt states seven beats (Introduction -> Think -> Watch -> Check -> Explore -> Practice -> Remember). The doc will treat these as the same spine, naming an explicit **Introduction/Think** opening (orientation + productive question) that maps onto "Motivate/Think about it", and **Remember** = Summarize. This keeps one canonical flow while honoring the prompt's expanded naming.

## Document structure (top-level sections)

1. **Purpose & relationship to LESSON_DESIGN.md** — scope boundary (pedagogy vs mechanics), audience (college-level), the "live illustrated notebook, not a video/textbook" north star.
2. **Central thesis** — the intuition<->symbol correspondence stated as the project's defining law, with a concrete worked mapping (e.g. determinant symbol <-> signed area of the transformed unit square).
3. **The learning model** — the expanded flow (Introduction/Think -> Watch -> Check -> Explore -> Practice -> Remember) with the *pedagogical job* of each beat, not the UI mechanics.
4. **Ten refined principles** — restate each supplied principle, then a short "Refinement / critique" note grounding it in research (see Critical thinking below).
5. **Explanation style** — narrative voice, concision rules, the "objects before procedures" progression (Object -> Intuition -> Visualization -> Formal definition -> Computation -> Interpretation), and "every procedure answers Why?".
6. **Animation philosophy (pedagogy layer)** — what a guided scene must *teach* (one conceptual change, symbol-geometry sync, establishing frame as an orienting move), deferring choreography specifics to LESSON_DESIGN.md.
7. **Worked-example philosophy** — the whiteboard-professor standard: each step states purpose, geometric meaning, the invariant used, why the next step follows, and why a tempting wrong path fails. Includes the eigenvector derivation ladder (Av=λv -> (A−λI)v=0 -> det(A−λI)=0 -> solve λ -> solve eigenspace -> interpret) as the reference template for *every* future computational procedure.
8. **Practice philosophy** — "practice continues teaching": every reveal is a mini-lesson (reasoning + synchronized visualization + symbolic derivation + interpretation + connection back). Distinguish check-for-understanding vs deliberate practice vs transfer.
9. **Misconception strategy** — misconceptions as a recurring, first-class feature; a living catalog seeded with the prompt's examples (coordinates != vector, span, independence != perpendicular, determinant sign = orientation, eigenvectors = same line not same direction, repeated eigenvalue != two eigendirections) plus a few research-backed additions.
10. **Information layering** — core-first with named optional layers (Why do we care / Common trap / Mathematical note / Historical note / Looking ahead / Connection / Intuition recap); rules for what belongs in a layer vs the main narrative.
11. **Narrative & concept graph** — the story spine and the connected concept graph (Vectors -> linear combinations -> span -> basis -> transformations -> determinant -> invertibility -> eigenvectors), with guidance on spaced revisiting/callbacks; ties to the "Later topics" in [src/lessons/curriculum.ts](src/lessons/curriculum.ts).
12. **Future-chapter philosophy** — how the same principles generalize to change of basis, SVD, etc.; the rule that every new computational method ships with a synchronized derivation ladder + misconception set + teaching reveals.
13. **Anti-goals & tensions** — explicit non-goals (density, gamification, video-replacement) and honest trade-offs (see Critical thinking).
14. **Pedagogical acceptance checklist** — a per-lesson sign-off mirroring LESSON_DESIGN.md's checklist but for *educational depth* (motivating question present, symbol<->picture link explicit, worked example reasons not just computes, reveal teaches, misconception named, layering used, connection to prior concept made).

## Critical thinking (required by the prompt)

The doc will not merely agree. Planned critiques/refinements, each tied to research:

- **Multiple representations can overload, not reinforce** — invoke Cognitive Load Theory / split-attention & redundancy effects; recommend *sequential coordinated* reveals and integrated (not duplicated) representations rather than four simultaneous panels.
- **"Objects before procedures" vs APOS/process-object duality** — action/process experience often *precedes* object conception (encapsulation); refine the linear progression into a spiral where limited computation can build the object, not always strictly object-first.
- **"Every algorithm should feel inevitable" is aspirational** — guard against false inevitability / illusion of understanding; sometimes productive struggle and a deliberately motivated *definition choice* beats a too-smooth derivation.
- **Worked examples & the expertise-reversal / self-explanation effect** — pair worked examples with faded guidance and prompts for self-explanation so reveals don't induce passive "illusion of fluency".
- **Check-before-reveal should exploit the testing effect & desirable difficulties** — prediction/retrieval before the answer, not just exposition.
- **Misconceptions need confrontation, not just labeling** — cite conceptual-change / refutation-text research: surface the learner's likely wrong prediction, show the conflicting evidence, then resolve.
- **Narrative coherence vs modularity tension** — a strong story aids retention but can hurt as reference/review; recommend callbacks + a concept map so learners can re-enter mid-story.
- **Note the gap**: the current eigenvectors lesson ([src/lessons/eigenvectors.ts](src/lessons/eigenvectors.ts)) explains *what* eigenvectors are but has no computational derivation ladder — use it as the motivating case study for the worked-example philosophy.

## Constraints

- Plain markdown, no emojis, no mermaid required (may include one small concept-graph diagram in text/mermaid if helpful).
- Pedagogy only — no implementation tasks, no new infrastructure, no engineering milestones.
- Do not restate LESSON_DESIGN.md mechanics; cross-reference instead.

