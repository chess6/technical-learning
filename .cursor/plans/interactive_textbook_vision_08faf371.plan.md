---
name: Interactive Textbook Vision
overview: "Author docs/INTERACTIVE_TEXTBOOK_VISION.md as the canonical educational design document: a pedagogy-only companion to LESSON_DESIGN.md that expands the existing six-phase flow into a coherent \"interactive textbook\" philosophy, refines (and critiques) the ten supplied design principles with mathematics-education research, and defines the worked-example, animation, practice, misconception, layering, and narrative philosophies for current and future chapters."
todos:
  - id: draft-doc
    content: Write docs/INTERACTIVE_TEXTBOOK_VISION.md with sections 1-17 (incl. Primary objective, Desirable compression, Mental Models, Visual Vocabulary), grounded in existing lessons/docs and cross-referencing LESSON_DESIGN.md / MATH_CORRECTNESS.md
    status: completed
  - id: mental-models
    content: Write the Mental Models section with a per-lesson core-model table and the "name the model first, reinforce it everywhere" authoring rule
    status: completed
  - id: visual-vocabulary
    content: Write the Visual Vocabulary section with the three-kinds-of-visuals taxonomy (concept/derivation/solution; solution visuals need not be cinematic) and the color/grammar dictionary grounded in the real --role-* tokens from src/styles/tokens.css, noting the discrepancy with the prompt's approximate colors
    status: completed
  - id: two-level-and-depth
    content: Add the durable-principles-vs-current-examples two-level framing up front (mark examples as illustrations, not mandates) and the compact "enough depth" test leading the acceptance checklist
    status: completed
  - id: refine-principles
    content: For each of the 10 supplied principles, add a research-grounded refinement/critique (cognitive load, APOS, self-explanation, testing effect, conceptual change, expertise reversal, interactivity-is-not-learning)
    status: completed
  - id: worked-example-ladder
    content: Write the worked-example philosophy requiring per-step object/invariant/picture/why-next/what-learned; include the eigenvector derivation ladder and flag the eigenvectors lesson's missing derivation as the motivating gap
    status: completed
  - id: future-and-graph
    content: Write Future-chapter 7-question authoring checklist and the "concept graph = learner's internal model; strengthen edges not just add nodes" framing; add Desirable compression section
    status: completed
  - id: checklist
    content: Add a pedagogical acceptance checklist mirroring LESSON_DESIGN.md's structure but for educational depth (incl. mental model named, interactive objective stated, compression payoff, edge strengthened)
    status: completed
isProject: false
---

# Interactive Textbook Vision

## Goal
Create a single new markdown file, [docs/INTERACTIVE_TEXTBOOK_VISION.md](docs/INTERACTIVE_TEXTBOOK_VISION.md), that becomes the pedagogical counterpart to [docs/LESSON_DESIGN.md](docs/LESSON_DESIGN.md). It is a philosophy document only: no engineering milestones, no infra, no implementation tasks.

## Primary objective (stated at the top of the doc)
Produce a document that can guide the next several years of educational content. It must be stable enough that future lesson authors can follow it without needing to reinterpret the project's philosophy. Mindset: not "write a nice design doc" but "write the canonical educational specification." The doc's opening will state this explicitly.

## Two-level framing: durable principles vs current examples (stated up front)
The doc will make explicit that it operates at two levels, and mark them throughout:
- **Durable principles** — intended to guide the project for years; these are binding.
- **Current chapter examples** — concrete illustrations drawn from today's four lessons (the six-phase flow instance, the specific `--role-*` colors, the eigenvector example, the mental-model table entries). These are *illustrations of the principles, not permanent mandates*.
Rationale: without this split, future authors may freeze today's lesson structure, palette, or eigenvector derivation as permanently required rather than as examples. Concretely: every example-heavy section (Mental Models table, Visual Vocabulary tokens, worked-example ladder) gets a short "example, not mandate" note, and the value source of truth stays [src/styles/tokens.css](src/styles/tokens.css) / the lesson files, not this doc.

## How it fits existing docs
- [docs/LESSON_DESIGN.md](docs/LESSON_DESIGN.md) already owns the *mechanical* standard (phase flow, visual language, notation, continuity, accessibility). The new doc owns the *why* — the learning theory and explanation craft. The vision doc will explicitly defer mechanics to LESSON_DESIGN.md and correctness to [docs/MATH_CORRECTNESS.md](docs/MATH_CORRECTNESS.md) / [docs/ERROR_LOG.md](docs/ERROR_LOG.md) to avoid duplication.
- Grounded in real artifacts: the four lessons ([src/lessons/vectors.ts](src/lessons/vectors.ts), [src/lessons/transformations.ts](src/lessons/transformations.ts), [src/lessons/determinants.ts](src/lessons/determinants.ts), [src/lessons/eigenvectors.ts](src/lessons/eigenvectors.ts)), the phase components in [src/components/lesson/](src/components/lesson/), and the concept ordering in [src/lessons/curriculum.ts](src/lessons/curriculum.ts).

## Reconcile the two stated flows
LESSON_DESIGN.md uses six phases (Motivate -> Watch -> Check -> Explore -> Practice -> Summarize); the prompt states seven beats (Introduction -> Think -> Watch -> Check -> Explore -> Practice -> Remember). The doc will treat these as the same spine, naming an explicit **Introduction/Think** opening (orientation + productive question) that maps onto "Motivate/Think about it", and **Remember** = Summarize. This keeps one canonical flow while honoring the prompt's expanded naming.

## Document structure (top-level sections)
1. **Purpose, primary objective & relationship to LESSON_DESIGN.md** — the "canonical educational specification" framing and multi-year stability goal; scope boundary (pedagogy vs mechanics), audience (college-level), the "live illustrated notebook, not a video/textbook" north star.
2. **Central thesis** — the intuition<->symbol correspondence stated as the project's defining law, with a concrete worked mapping (e.g. determinant symbol <-> signed area of the transformed unit square).
3. **Desirable compression** (NEW) — a lesson should progressively compress many observations into one reusable idea. Worked example: parallelogram / area / collapse / orientation / singularity all compress into det(A); the whole geometric behavior of a special direction compresses into Av = λv. Compression is the *goal state* of a lesson, and the mental model is the compressed handle. This extends the central thesis (mathematics = compact representations of broad patterns) and sets up Mental Models.
4. **The learning model** — the expanded flow (Introduction/Think -> Watch -> Check -> Explore -> Practice -> Remember) with the *pedagogical job* of each beat, not the UI mechanics.
5. **Ten refined principles** — restate each supplied principle, then a short "Refinement / critique" note grounding it in research (see Critical thinking below).
6. **Explanation style** — narrative voice, concision rules, the "objects before procedures" progression (Object -> Intuition -> Visualization -> Formal definition -> Computation -> Interpretation), and "every procedure answers Why?".
7. **Mental Models** (NEW, placed between Explanation style and Animation philosophy) — every lesson must name the single core mental model the learner should build, and every explanation/animation/worked-example/exercise must reinforce that same model. Seed table grounded in the four existing lessons and near-future topics: Vector = an arrow representing displacement or quantity; Span = reachability using available directions; Basis = a minimal coordinate language; Transformation = a machine that moves every point consistently; Determinant = information preservation through area scaling; Eigenvector = directions a transformation refuses to mix. Authoring rule: pick the model first; if a beat does not reinforce it, cut or move it. (Flagged as likely the highest-leverage section in the doc.)
8. **Animation philosophy (pedagogy layer)** — what a guided scene must *teach* (one conceptual change, symbol-geometry sync, establishing frame as an orienting move), deferring choreography specifics to LESSON_DESIGN.md.
9. **Visual Vocabulary** (NEW) — has two parts. **(a) Three kinds of visuals** (durable taxonomy): *Concept visualizations* build the mental model; *Derivation visualizations* synchronize geometry with symbolic steps (the derivation ladder); *Solution visualizations* help learners reconstruct the mental picture while reviewing a revealed answer. State explicitly that solution visuals appear beside/alongside the revealed reasoning and need NOT become full cinematic scenes for every routine problem — a compact static or lightly-animated recap is enough; reserve full guided scenes for genuinely new ideas. **(b) The color/grammar dictionary** — document the app's persistent visual language so future lessons never invent new conventions. Ground it in the real semantic tokens in [src/styles/tokens.css](src/styles/tokens.css) rather than the prompt's approximate colors, and note the discrepancy honestly. Actual role semantics: `--role-original` #7ec5e6 light blue = original vector / span region; `--role-transformed`/`--role-result` #e6b566 amber = image under transformation; `--role-basis-1` #7fd0a0 green = e1; `--role-basis-2` #b9a3ef violet = e2; `--role-selected`/`--role-highlight` #ecd484 gold = highlighted concept; `--role-invariant` #f0879f pink = invariant / measured emphasis (e.g. eigen-directions); `--role-intermediate` #9aa6b5 gray = supporting / helper geometry; `--role-reachable` #7ec5e6 = span region. Plus non-color grammar: dashed = reference/prior state; ghost vectors = temporary reasoning; highlight pulse = attention; shaded region = invariant or measured quantity. Cross-reference LESSON_DESIGN.md's Visual language + tokens; this section is the *meaning* dictionary, tokens.css remains the value source of truth.
10. **Worked-example philosophy** — the whiteboard-professor standard. Every worked example must explicitly identify, for each step: (a) the mathematical object, (b) the invariant being preserved, (c) the mental picture, (d) why the next step follows, (e) what the learner should now understand ("what idea did I just learn?"). Never a bare "Step 3: solve the characteristic polynomial." Includes the eigenvector derivation ladder (Av=λv -> (A−λI)v=0 -> det(A−λI)=0 -> solve λ -> solve eigenspace -> interpret) as the reference template for *every* future computational procedure, plus the "why a tempting wrong path fails" requirement.
11. **Practice philosophy** — "practice continues teaching": every reveal is a mini-lesson (reasoning + synchronized visualization + symbolic derivation + interpretation + connection back). Distinguish check-for-understanding vs deliberate practice vs transfer.
12. **Misconception strategy** — misconceptions as a recurring, first-class feature; a living catalog seeded with the prompt's examples (coordinates != vector, span, independence != perpendicular, determinant sign = orientation, eigenvectors = same line not same direction, repeated eigenvalue != two eigendirections) plus a few research-backed additions.
13. **Information layering** — core-first with named optional layers (Why do we care / Common trap / Mathematical note / Historical note / Looking ahead / Connection / Intuition recap); rules for what belongs in a layer vs the main narrative.
14. **Narrative & concept graph** — the story spine and the connected concept graph (Vectors -> linear combinations -> span -> basis -> transformations -> determinant -> invertibility -> eigenvectors). Explicitly state that the graph is **not merely a curriculum ordering — it is the learner's evolving internal model**, and that every new lesson should **strengthen existing edges, not merely add new nodes** (revisit/reactivate prior concepts, not just append). Guidance on spaced revisiting/callbacks; ties to the "Later topics" in [src/lessons/curriculum.ts](src/lessons/curriculum.ts).
15. **Future-chapter philosophy** — how the same principles generalize to change of basis, SVD, etc. Every future chapter must answer a fixed authoring checklist: (1) What new object is introduced? (2) Why does it exist? (3) What problem could not previously be solved? (4) What previous concepts are reused? (5) What new mental model is created? (6) What misconceptions are expected? (7) What symbolic manipulations deserve synchronized animation? Plus the rule that every new computational method ships with a synchronized derivation ladder + misconception set + teaching reveals.
16. **Anti-goals & tensions** — explicit non-goals (density, gamification, video-replacement) and honest trade-offs (see Critical thinking).
17. **Pedagogical acceptance checklist** — a per-lesson sign-off mirroring LESSON_DESIGN.md's checklist but for *educational depth* (core mental model named and reinforced; motivating question present; symbol<->picture link explicit; worked example identifies object/invariant/picture/why-next/what-learned; reveal teaches; misconception named; layering used; concept-graph edge strengthened; each interactive component has a stated learning objective; compression payoff reached). Leads with a compact **"enough depth" test**: a lesson is sufficiently deep when a learner can (1) explain the concept verbally, (2) connect its symbols to a mental picture, (3) perform the expected calculation, (4) interpret the result, (5) recognize at least one important edge case or misconception, and (6) explain how it connects to an earlier concept. This gives future implementation work a concrete target instead of "make it more textbook-like."

## Critical thinking (required by the prompt)
The doc will not merely agree. Planned critiques/refinements, each tied to research:
- **Multiple representations can overload, not reinforce** — invoke Cognitive Load Theory / split-attention & redundancy effects; recommend *sequential coordinated* reveals and integrated (not duplicated) representations rather than four simultaneous panels.
- **"Objects before procedures" vs APOS/process-object duality** — action/process experience often *precedes* object conception (encapsulation); refine the linear progression into a spiral where limited computation can build the object, not always strictly object-first.
- **"Every algorithm should feel inevitable" is aspirational** — guard against false inevitability / illusion of understanding; sometimes productive struggle and a deliberately motivated *definition choice* beats a too-smooth derivation.
- **Worked examples & the expertise-reversal / self-explanation effect** — pair worked examples with faded guidance and prompts for self-explanation so reveals don't induce passive "illusion of fluency".
- **Check-before-reveal should exploit the testing effect & desirable difficulties** — prediction/retrieval before the answer, not just exposition.
- **Misconceptions need confrontation, not just labeling** — cite conceptual-change / refutation-text research: surface the learner's likely wrong prediction, show the conflicting evidence, then resolve.
- **Narrative coherence vs modularity tension** — a strong story aids retention but can hurt as reference/review; recommend callbacks + a concept map so learners can re-enter mid-story.
- **Interactivity is not automatically learning** — manipulating sliders does not guarantee conceptual understanding; many educational tools decay into "playgrounds." Ground in the guided-vs-unguided inquiry research (minimal-guidance instruction underperforms for novices; Kirschner, Sweller & Clark 2006; the productive-failure caveat). Rule: every interactive component must have a clearly defined learning objective and should answer a question the learner is *already* asking, not merely provide something to fiddle with. Makes the app's existing Watch-before-Explore, guided-exploration lean explicit.
- **Note the gap**: the current eigenvectors lesson ([src/lessons/eigenvectors.ts](src/lessons/eigenvectors.ts)) explains *what* eigenvectors are but has no computational derivation ladder — use it as the motivating case study for the worked-example philosophy.

## Constraints
- Plain markdown, no emojis, no mermaid required (may include one small concept-graph diagram in text/mermaid if helpful).
- Pedagogy only — no implementation tasks, no new infrastructure, no engineering milestones.
- Do not restate LESSON_DESIGN.md mechanics; cross-reference instead.