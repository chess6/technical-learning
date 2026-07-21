---
name: Animation quality bar
overview: Create a single forward-looking doc (docs/animation-quality-bar.md) defining an internal, measurable quality bar for animation clips and explanations, gating every technique behind a named pedagogical purpose, separating universal standards from topic-specific patterns, and mapping only net-new guidance to the existing Motion Canvas + Mafs + React stack. Documentation-only.
todos:
  - id: verify-gaps
    content: Re-verify each candidate technique/practice against current code and docs; drop anything already implemented so the doc stays net-new
    status: completed
  - id: write-doc
    content: Write docs/animation-quality-bar.md following the 16-section structure (purpose/bar, exclusion rule, purpose-gate, universal standards, attention choreography, object-identity continuity, script/explanation practices, topic-specific patterns, MC mapping, Mafs mapping, QA workflow, rubric, acceptance checklist, backlog, risks/non-goals, references)
    status: completed
  - id: crosslink
    content: Add one concise cross-reference line from docs/LESSON_DESIGN.md to docs/animation-quality-bar.md (no other LESSON_DESIGN.md content changed)
    status: completed
isProject: false
---

# Animation Quality Bar

Create one new standalone doc, `docs/animation-quality-bar.md`. It defines an **internal, measurable quality bar** for our animation clips and their explanations, and records **only net-new guidance** (nothing already implemented). Every recommended technique is gated behind a named pedagogical purpose and a stated misuse risk. 3Blue1Brown is used only as a reference for explanatory craft, never as the acceptance criterion.

This task is documentation-only. No application code changes. The only permitted edit outside the new doc is one cross-reference line in `docs/LESSON_DESIGN.md`.

The plan below is complete enough to write the document directly without a further prompt: it specifies the section order, the exact content each section must contain, the candidate techniques with their pedagogical function and misuse risk, the rubric dimensions and thresholds, and the backlog ordering.

## Objective and the internal quality bar (doc section 1)

Success is NOT "imitate / match / visually resemble 3Blue1Brown." Define the bar as:

> After watching a clip, a learner should be able to (a) identify the mathematical object, (b) follow each meaningful change, (c) explain why that change occurred, and (d) reconstruct the clip's central idea in words or a sketch.

The doc must explicitly distinguish four separate axes and state that they are not interchangeable:

- **Explanatory quality** (does the learner understand and why).
- **Mathematical correctness** (no transition or caption implies a false claim).
- **Visual polish** (legibility, framing, smoothness).
- **Production complexity** (effort/risk to build).

State plainly: a clip is not high quality merely because it is smooth, cinematic, dense, or stylistically similar to a reference. Smoothness and density are the least important axes.

## Explicit exclusion rule (doc section 2)

The doc records only techniques we do not already do. Before writing, verify each candidate against current code/docs and drop anything present. Known already-implemented (EXCLUDED, do not restate): semantic `--role-*` colors; background/transformable/foreground layering; t=0 establishing frame; ghost/fade copies; `morphTo` matrix morph; dashed span/eigendirection lines; on-span fan `v->Av`; unit-square determinant + orientation edge + negative-det flip; guided->explorer continuity; reduced-motion handling; major-step navigation; KaTeX prose; `MotivatingQuestion` hook; Check-phase prediction; the small "nudge off lambda and back" beat.

## Purpose-before-technique gate (doc section 3)

Before recommending or adopting ANY animation technique, the author must answer:

1. What exact learner confusion or limitation does this solve?
2. What concept becomes clearer?
3. Why is motion necessary here?
4. Would a still diagram teach this more clearly?
5. What should the learner be able to explain afterward?
6. What mathematical claim might the transition accidentally imply?

Durable rule to state verbatim:

> No animation technique ships without a named pedagogical function.

Add: techniques must not be added because they resemble a polished reference animation. If a still image is clearer, use a still image.

## Universal animation-quality standards (doc section 4)

Broadly applicable practices (apply wherever relevant, not topic-bound). Each is written with its pedagogical function and misuse risk:

- Attention choreography (see dedicated section 5).
- Object-identity continuity (see dedicated section 6).
- Script-event alignment (see section 7 / B1 contract).
- Readable establishing and landing frames (orient before motion; hold after).
- Meaningful pacing (time to orient, follow, inspect; no motion during reading).
- Removal of temporary scaffolding once it has served its purpose.
- Mathematically honest transitions (a tween path is not automatically the mathematical action).

## Attention choreography (doc section 5, first-class)

Define how a clip controls where the learner looks. Principles:

- One primary focal object or relationship per beat.
- Dim or simplify irrelevant objects.
- Avoid simultaneous motion in unrelated regions.
- Introduce labels before or exactly when they become necessary.
- No decorative or camera motion while the learner is reading.
- Hold landing states long enough to inspect.
- Remove temporary scaffolding after use.
- Preserve enough context that the learner knows what changed.
- Use contrast, scale, position, and timing intentionally, not color alone.

Per-beat question the author must answer:

> Where should the learner look, and what should they notice there?

## Object-identity continuity (doc section 6, dedicated rule)

State the rule verbatim:

> Prefer transforming an existing mathematical object over removing it and replacing it with an unrelated-looking object. The learner should be able to track the same object through time.

Examples: `v` keeps the same semantic color and label; the unit square visibly becomes its transformed parallelogram; a matrix column visibly lands on its transformed basis vector; temporary copies are explicitly marked as ghosts/copies; labels do not jump between objects without explanation; an object does not silently change meaning, scale, orientation, or role. Document continuity as both a pedagogical and a correctness concern.

## Script and explanation practices (doc section 7)

### B1 Script-event contract (replaces "one sentence == one event")

State the contract:

> Every script unit has one communicative purpose, and every meaningful visual event is licensed by the current script unit.

Provide a reusable beat-authoring template; each beat defines: narrative purpose; spoken/caption line; visible state before; visual change; visible state after; learner takeaway; intended focal object; required hold time (if any). Note explicitly: script-first does not mean continuous prose. Silence and visual holds are valid script units when the learner needs inspection time.

### B2 Confession/correction layering (with honesty requirement)

Valuable when the initial simple model is useful but incomplete. Require: the simplified version is not mathematically false; its domain is stated/clear; the correction arrives before the learner is assessed on the broader idea; the complication resolves a real conceptual boundary. Example: "Area is multiplied by `|det A|`. But the determinant itself may be negative because its sign records orientation."

### B3 Embedded pause-and-ponder (conditional, not a ritual)

Use only when: the next state is genuinely inferable; mental commitment improves the reveal; the pause does not merely duplicate the Check phase; interruption does not damage flow. Not required in every clip.

### B4 Name-after-intuition

Introduce terminology after the learner has met the behavior/need, unless prior naming is necessary for orientation.

### B5 Cross-lesson callbacks (reactivate, don't mention)

Callbacks must reactivate a prior mental model. Good: "In Lesson 3, determinant zero meant collapse. That is exactly why we set `det(A-lambda I)=0` here." Weak: "Remember determinants from Lesson 3."

### B6 Embodied metaphors and register

Use metaphors only when they preserve the important mathematical structure. For each metaphor state: what correspondence it clarifies; where it stops working; whether it risks replacing the mathematical model. Keep a warm, low-anxiety tone without becoming chatty, theatrical, or imprecise.

## Topic-specific animation patterns (doc section 8)

Used only when the mathematics calls for them. The doc must state that not every clip needs any of these. Each entry: pedagogical function, identity/correctness constraints, misuse risk, effort, classification.

### A1 Matrix-column-to-basis-vector flights (reusable topic-specific pattern)

Must teach the precise correspondence: the first matrix column is `A e1`; the second is `A e2`. Not a decorative text flight. Must preserve identity across: matrix column -> coordinate pair -> vector tip -> transformed basis vector. Reference: 3b1b `ColumnsToBasisVectors`, `IntroduceExampleTransformation`. Today we render static `[[a,b],[c,d]]` text. In-stack how-to in the mapping section. Effort: Med. Misuse risk: becoming eye-candy that breaks the column->basis identity.

### A4 Decomposed / successive transformations

Use to explain diagonal determinant multiplication, `det(AB)=det(A)det(B)`, and how area scaling composes. Require the intermediate state to remain visible long enough to identify the two separate scaling events. Reference: `DiagonalExample`, `SuccessiveLinearTransformations`. Effort: Low. Misuse risk: intermediate flashes by; reads as one motion.

### A5 Lambda-knob explorer (primarily a Mafs interactive pattern)

Learning objective: eigenvalues are exactly the values of lambda for which `A-lambda I` becomes singular. Connect: live `det(A-lambda I)`; collapse of transformed grid/basis; appearance of a nullspace/eigendirection; characteristic-polynomial roots. Must conclude with an explicit takeaway, not an open-ended slider playground. Reference: `TweakLambda`. Effort: Med. Misuse risk: playground with no landed conclusion.

### A6 Counterexample and boundary gallery (targeted, not mandatory)

Use a contrast/boundary/counterexample only when it materially sharpens the definition or repairs a likely misconception. Examples: generic vector vs eigenvector; positive vs negative eigenvalue; rotation with no real eigenline; shear with one eigendirection; scalar matrix with every direction invariant. Effort: Low-Med. Misuse risk: reflexive counterexamples that add clutter.

### A2 Rotational arc travel (later / conditional)

Do NOT recommend arc motion as general polish. Use only when the path itself communicates meaningful mathematics: orientation of rotation, signed angle, clockwise vs counterclockwise, rotation vs pure scaling. Correctness rule to state verbatim:

> An educational tween path is not automatically the mathematical action. Use curved travel only when the path itself is part of the concept, or clearly treat it as a visual transition rather than a claim about the transformation.

For an arbitrary linear transformation an arc tween may falsely imply a rotational trajectory. Effort: Med. Classification: later/conditional.

### A3 Arbitrary-region area scaling (optional mathematical depth)

Classify as optional mathematical depth, not core animation polish. Teaches that a linear map scales arbitrary regions by the same determinant factor via local area decomposition. Note cognitive cost: approximation, tessellation, implicit limiting process, irregular boundaries. Place late in the backlog, after the learner already understands signed area scaling on the unit square and parallelograms. Reference: `BreakBlobIntoGridSquares`. Effort: Med.

## Motion Canvas implementation mapping (doc section 9)

Concrete, buildable mapping to our stack (no code written in this task, but precise enough to implement later):

- A1: new `sceneKit.ts` helper tweening a matrix column into a tip-anchored coordinate label, preserving `ROLE.basis1/basis2` identity; sequence as a segment body in the relevant scene.
- A4: chain two `morphTo(...)` calls with an explicit `waitFor(...)` hold on the intermediate state; add area/label readout at each stage.
- A6: additional scene segments / preset matrices from shared `exampleData`; a generic vector visibly knocked off its span line as its own beat.
- A2 (conditional): optional arc path option in arrow tip interpolation in `sceneKit`, used only for rotation/reflection beats; otherwise straight travel.
- A3 (optional): determinant-scene beat drawing a blob outline + tiled shrinking squares.
- Cross-cutting: all math via `src/math` helpers (`matrixVectorMultiply`, `determinant2x2`, `analyzeEigen2x2`); durations in `sceneTimings.ts`; major steps in `sceneMeta.ts`.

## Mafs implementation mapping (doc section 10)

- A5: new explorer registered in `src/explorations/registry.tsx`, reusing `MafsSceneShell`, `ParameterControls` (lambda slider), `SceneReadout` (live `det(A-lambda I)` + roots), and `analyzeEigen2x2`; ends on an explicit takeaway line via the aria-live summary.
- A6 (interactive variant): explorer presets for rotation / shear / scalar cases.
- Continuity: same matrices/vectors/colors as the guided example per project rules.

## QA and review workflow (doc section 11)

State that golden-frame screenshots are useful for clipping, label placement, establishing/landing states, and visual-role consistency, but cannot assess motion quality. Add a required recorded-or-live playback review with these checks:

1. Watch continuously at normal speed.
2. Visual-only pass: review the animation with explanatory captions temporarily hidden. Can the visual sequence still communicate the objects, changes, and focal relationships? (Our clips are caption-driven, not narrated, so a "muted" test would check nothing; hide captions instead.)
3. Script-only pass (inverse): read the ordered captions/script without the animation. Does the explanatory argument remain coherent? Neither side must teach the entire concept alone, but each should remain structurally understandable.
4. Scrub through major steps.
5. Inspect every establishing and landing frame.
6. Review at one narrow viewport.
7. Review with reduced motion.
8. Confirm focal objects remain trackable through transitions.
9. Confirm captions and visuals do not compete for attention.
10. Confirm each named mathematical effect visibly occurs in its beat.

### Cold review requirement

The final reviewer should preferably not be the clip's primary author. When that is not possible, conduct a delayed self-review without opening the source code first. Authors know what every object and transition is supposed to mean, so they mentally fill in explanations a learner cannot. For our workflow: Cursor can perform the first implementation review, followed by a separate browser-only review in a fresh context.

### Originality guard around references

Study references (3b1b or otherwise) to extract principles such as attention control, object continuity, pacing, and narrative structure. Do NOT copy transcript wording, animation code, distinctive sequences, or choreography shot-for-shot. Every clip must be independently authored for this curriculum and visual system. The backlog is a set of principle-driven capabilities, not a recreation checklist of reference videos.

### 3Blue1Brown comparison rule

Do not require a matching 3b1b clip for every animation. Rule:

> When a directly relevant reference exists, study it for explanatory strategy, pacing, visual continuity, and misconception handling. Then judge the new clip independently against this project's own rubric.

Do NOT score stylistic/color similarity, animation density, or cinematic resemblance. DO compare: what learner question drives the segment; how object identity is preserved; how attention is directed; when terminology appears; how symbols connect to geometry; whether the explanation earns its conclusion.

## Clip-quality rubric (doc section 12)

Concise scoring rubric, 0-2 per dimension:

- Mathematical honesty: transitions and captions imply no false claim.
- Object legibility: important objects and labels are readable.
- Attention control: the learner knows where to look.
- Object continuity: mathematical objects remain trackable.
- Symbol-geometry binding: equations visibly correspond to the picture.
- Explanatory causality: the learner can tell why each change occurs.
- Pacing: enough time to orient, follow, and inspect.
- Narrative coherence: each beat motivates or prepares the next.
- Retention payoff: the final state compresses into a reusable idea.
- Accessibility: color-independent cues, reduced motion, readable captions.

Fixed acceptance threshold (do not leave this open):

> Passing quality: at least 16/20 overall, Mathematical honesty must score 2, and no dimension may score 0.

This ensures correctness cannot be offset by polish elsewhere. Additionally require no zero in symbol-geometry binding and object continuity (already covered by the "no dimension may score 0" clause, but call them out as the correctness-critical trio alongside mathematical honesty). State that the score is a review aid, not a substitute for judgment.

## Per-clip acceptance checklist (doc section 13)

A clip is ready when a reviewer can answer:

- What mathematical object is being taught?
- What is the core learner question?
- What changes?
- What remains invariant?
- Why does each meaningful transition occur?
- Which visual object corresponds to each important symbol?
- What should the learner be able to reconstruct afterward?
- Is motion necessary for this explanation?
- Does any tween imply false mathematics?
- Could any beat be removed without reducing understanding?

## Prioritized adoption backlog (doc section 14)

Ordered bullet list (not a table). Each item includes: priority; effort; pedagogical function; likely first lesson/clip adopter; acceptance condition; risk of misuse.

- Highest priority: script-first / event-lockstep authoring (B1); attention choreography; object-identity continuity; name-after-intuition (B4); meaningful cross-lesson callbacks (B5); targeted contrast/boundary cases (A6); recorded-playback QA rubric; internal clip-quality score.
- Next priority: matrix-column-to-basis-vector flights (A1); decomposed/successive transformations (A4); lambda-knob explorer (A5); confession/correction layering (B2).
- Later or optional: rotational arc travel (A2); arbitrary-region area generalization (A3); embedded pause-and-ponder beats (B3); embodied metaphors where they naturally fit (B6).

## Risks, anti-patterns, and non-goals (doc section 15)

State non-goals and anti-patterns explicitly: do not turn 3b1b style into the acceptance criterion; do not copy transcript wording, animation code, distinctive sequences, or choreography shot-for-shot (originality guard); do not let the backlog become a recreation checklist of reference videos; do not prescribe motion when a still image is clearer; do not mandate counterexamples, pauses, metaphors, or arc travel in every clip; do not add technique for resemblance; do not let smoothness/density stand in for understanding. Reiterate: every recommended technique names its pedagogical purpose and misuse risk.

## References studied (doc section 16)

- 3b1b `eola` source: [_2016/eola/chapter5.py](_2016/eola/chapter5.py) (determinant), [_2016/eola/chapter10.py](_2016/eola/chapter10.py) (eigen), [_2016/eola/chapter3.py](_2016/eola/chapter3.py), `once_useful_constructs/vector_space_scene.py`, `_2021/quick_eigen.py`.
- Transcripts studied: [3b1b](3b1b) (Determinant + Eigenvectors/eigenvalues) for narration-to-animation mapping.
- Our system: `src/guided-scenes/scenes/sceneKit.ts`, `src/explorations/registry.tsx`, `docs/LESSON_DESIGN.md`, `docs/lesson-depth-pattern.md`, `docs/MATH_CORRECTNESS.md`.

## Cross-link (only permitted edit outside the new doc)

Add one concise cross-reference from `docs/LESSON_DESIGN.md` to `docs/animation-quality-bar.md` (e.g. a single pointer line near the animation/guided-scene guidance). No other `LESSON_DESIGN.md` content is changed.

## Final constraints (restated in the doc's header)

- Documentation only; no code changes.
- Net-new guidance only; do not restate implemented techniques.
- 3b1b is a craft reference, not the acceptance criterion; extract principles, never copy wording/code/sequences/choreography.
- Never prescribe motion where a still image is clearer.
- No mandatory counterexamples, pauses, metaphors, or arc travel.
- Every technique names its pedagogical purpose and misuse risk.
