# Animation quality bar

Forward-looking standard for authoring and reviewing animation clips and their
explanations. It defines an **internal, measurable quality bar**, gates every
technique behind a **named pedagogical function**, and separates broadly
applicable standards from topic-specific patterns.

This document records **only net-new guidance** — practices we do not already do.
Techniques already established elsewhere are not restated here (see
[Explicit exclusion rule](#2-explicit-exclusion-rule)). Pair this with
[LESSON_DESIGN.md](./LESSON_DESIGN.md) (choreography basics, safe frame, autoplay),
[INTERACTIVE_TEXTBOOK_VISION.md](./INTERACTIVE_TEXTBOOK_VISION.md) (educational
philosophy), and [MATH_CORRECTNESS.md](./MATH_CORRECTNESS.md) (geometry source of
truth).

> **Header constraints for this standard.**
> - Guidance only; it never mandates motion where a still image is clearer.
> - 3Blue1Brown is a **craft reference, not the acceptance criterion**; extract
>   principles, never copy wording, code, distinctive sequences, or choreography.
> - No technique is mandatory in every clip. Counterexamples, pauses, metaphors,
>   and arc travel are opt-in.
> - Every recommended technique names its **pedagogical purpose** and its
>   **misuse risk**.

---

## 1. Purpose and the internal quality bar

Success is **not** "imitate, match, or visually resemble 3Blue1Brown." A clip is
not high quality merely because it is smooth, cinematic, dense, or stylistically
similar to a reference. Smoothness and density are the least important properties.

The bar is:

> After watching a clip, a learner should be able to (a) **identify** the
> mathematical object, (b) **follow** each meaningful change, (c) **explain why**
> that change occurred, and (d) **reconstruct** the clip's central idea in words
> or a sketch.

These four axes are distinct and **not interchangeable**. A weakness on one
cannot be bought back by strength on another:

| Axis | Question it answers |
| --- | --- |
| **Explanatory quality** | Does the learner understand, and can they say why? |
| **Mathematical correctness** | Does any transition or caption imply a false claim? |
| **Visual polish** | Are objects legible, framed, and smooth enough to follow? |
| **Production complexity** | What effort and risk does building it carry? |

Polish and complexity serve the first two axes; they are never the goal.

**Captions are optional and brief.** A beat needs no caption when its
mathematical role is already clear from the geometry or the on-screen equation
("hold, no text" is a legitimate script line, §… below). When a caption is
present, it says what to **notice visually** — it is not a second textbook. Keep
the three authoring surfaces distinct to avoid triple-authoring the same
sentence:

- **Scene captions** — brief, "what to notice" in the picture.
- **Lesson prose / callouts / depth layers** — the broader concept or a subtle
  point, authored once on the page.
- **The equation** — the symbolic content, shared verbatim across surfaces when
  the same expression appears (e.g. a `WorkedExample.equations` line and a scene
  `Latex` beat).

---

## 2. Explicit exclusion rule

This document is net-new. Anything already documented or implemented is **out of
scope here** and must not be restated. Verify each candidate against current code
and docs before adding it.

Already established (excluded): semantic `--role-*` colors; background /
transformable / foreground layering; the paused establishing frame at `t=0`;
ghost / fade copies as scaffolding; the `morphTo` matrix morph; dashed
span / eigendirection lines; the on-span fan `v → Av`; unit-square determinant
with orientation edge and negative-determinant flip; guided → explorer
continuity; reduced-motion handling; major-step navigation; KaTeX prose; the
`MotivatingQuestion` hook; Check-phase prediction; the small "nudge off `λ` and
back" beat; "one conceptual change at a time" and "dim irrelevant objects"
(see [LESSON_DESIGN.md](./LESSON_DESIGN.md#animation-choreography)).

When this document sharpens an existing idea, it does so only to add a
**new, verifiable obligation** (for example, promoting attention control from a
bullet to a per-beat contract), never to re-describe the baseline.

---

## 3. Purpose-before-technique gate

Before recommending, adopting, or building **any** animation technique, the
author answers all six:

1. What exact learner confusion or limitation does this solve?
2. What concept becomes clearer?
3. Why is motion necessary here?
4. Would a still diagram teach this more clearly?
5. What should the learner be able to explain afterward?
6. What mathematical claim might the transition accidentally imply?

> **Durable rule: no animation technique ships without a named pedagogical
> function.**

A technique is never added because it resembles a polished reference animation.
If a still image is clearer, use a still image.

---

## 4. Universal animation-quality standards

Broadly applicable practices. Apply wherever relevant; they are not tied to any
one topic. Each carries a pedagogical function and a misuse risk.

- **Attention choreography** — direct where the learner looks every beat. See
  [section 5](#5-attention-choreography). *Misuse:* competing motions that
  scatter attention.
- **Object-identity continuity** — let the learner track the same object through
  time. See [section 6](#6-object-identity-continuity). *Misuse:* silent swaps
  that break identity.
- **Script-event alignment** — every visual event is licensed by a script unit.
  See [section 7](#7-script-and-explanation-practices). *Misuse:* motion with no
  communicative purpose.
- **Readable establishing and landing frames** — orient the learner before motion
  starts and hold the result long enough to inspect. *Function:* orientation and
  consolidation. *Misuse:* cutting away before the eye lands.
- **Meaningful pacing** — allocate time to orient, follow, and inspect; never
  move objects while the learner is reading. *Misuse:* uniform speed that ignores
  cognitive load.
- **Removal of temporary scaffolding** — retire helper lines, ghosts, and
  construction marks once they have served their purpose. *Misuse:* leftover
  clutter competing with the result.
- **Mathematically honest transitions** — a tween path is not automatically the
  mathematical action. *Misuse:* implying a decomposition or trajectory that the
  transformation does not perform.

---

## 5. Attention choreography

How a clip controls the learner's gaze. This is a first-class obligation, not a
nicety.

- Maintain **one primary focal object or relationship per beat**.
- Dim or simplify irrelevant objects.
- Avoid simultaneous motion in unrelated regions.
- Introduce labels **before or exactly when** they become necessary.
- No decorative or camera motion while the learner is reading.
- Hold landing states long enough to inspect.
- Remove temporary scaffolding after it has served its purpose.
- Preserve enough context that the learner knows **what changed**.
- Use contrast, scale, position, and timing intentionally — **not color alone**.

> **Per-beat obligation.** For every beat, the author can answer:
> *Where should the learner look, and what should they notice there?*

*Pedagogical function:* limits working-memory load so each idea lands.
*Misuse risk:* treating "more happening" as "more taught."

---

## 6. Object-identity continuity

> **Rule.** Prefer **transforming an existing mathematical object** over removing
> it and replacing it with an unrelated-looking object. The learner should be
> able to track the same object through time.

Concretely:

- `v` keeps the same semantic color and label across the clip.
- The unit square **visibly becomes** its transformed parallelogram.
- A matrix column **visibly lands on** its corresponding transformed basis vector.
- Temporary copies are explicitly marked as ghosts or copies.
- Labels do not jump between objects without explanation.
- An object does not silently change meaning, scale, orientation, or role.

Continuity is **both** a pedagogical concern (traceability) **and** a correctness
concern (a silent swap can assert a false equivalence).

*Pedagogical function:* preserves referential identity so "why did it change" is
answerable. *Misuse risk:* morphs so elaborate the object stops being
recognizable mid-transition.

---

## 7. Script and explanation practices

### B1 — Script-event contract

> **Contract.** Every script unit has **one communicative purpose**, and every
> meaningful visual event is **licensed by the current script unit**.

This replaces any rigid "one sentence equals one event" rule. Script-first does
**not** mean filling the clip with continuous prose — **silence and a visual
hold are valid script units** when the learner needs inspection time.

**Beat-authoring template** (reusable per beat):

| Field | Content |
| --- | --- |
| Narrative purpose | The single job of this beat |
| Caption / script line | Exact learner-facing text (or "hold, no text") |
| Visible state — before | What is on screen entering the beat |
| Visual change | The one event that occurs |
| Visible state — after | What is on screen leaving the beat |
| Learner takeaway | What they should now be able to say |
| Focal object | Where attention is directed |
| Required hold | Inspection time after the change, if any |

*Pedagogical function:* forces motion and words to serve the same claim.
*Misuse risk:* narrating every frame and crowding out inspection.

### B2 — Confession / correction layering

Teach a clean model first, then explicitly complicate it. Valuable **only** when
the simple model is useful but incomplete. Requirements:

- The simplified version is **not mathematically false**.
- Its domain is stated or made clear.
- The correction arrives **before** the learner is assessed on the broader idea.
- The complication resolves a **real** conceptual boundary.

> Example: "Area is multiplied by `|det A|`. But the determinant itself may be
> negative, because its sign records orientation."

*Pedagogical function:* stages complexity instead of front-loading it.
*Misuse risk:* presenting a falsehood and calling the fix a "correction."

### B3 — Embedded pause-and-ponder (conditional)

A held frame that poses a question inside the clip timeline. Use **only** when:

- the next state is genuinely inferable;
- mental commitment improves the reveal;
- it does not merely duplicate the separate Check phase;
- interruption does not damage explanatory flow.

Not required in every clip.

*Pedagogical function:* converts passive watching into a prediction.
*Misuse risk:* ritual pauses that stall momentum.

### B4 — Name-after-intuition

Introduce terminology **after** the learner has met the behavior or felt the need
for it — unless prior naming is necessary for orientation.

*Pedagogical function:* attaches a word to an already-felt idea.
*Misuse risk:* withholding a name so long that reference becomes awkward.

### B5 — Cross-lesson callbacks (reactivate, don't mention)

A callback must **reactivate a prior mental model**, not merely cite an earlier
lesson.

- Good: "In Lesson 3, determinant zero meant collapse. That is exactly why we set
  `det(A − λI) = 0` here."
- Weak: "Remember determinants from Lesson 3."

*Pedagogical function:* threads dependencies into one continuous model.
*Misuse risk:* name-dropping prior lessons without rebuilding the idea.

### B6 — Embodied metaphors and register

Use a metaphor only when it **preserves the important mathematical structure**.
For each metaphor, state:

- what correspondence it clarifies;
- where the metaphor stops working;
- whether it risks **replacing** rather than supporting the mathematical model.

Keep a warm, low-anxiety tone without becoming chatty, theatrical, or imprecise.

*Pedagogical function:* anchors an abstraction to intuition.
*Misuse risk:* a vivid metaphor that survives past its valid domain.

---

## 8. Topic-specific animation patterns

Used **only when the mathematics calls for them**. Not every clip needs any of
these. Each entry states its function, identity/correctness constraints, misuse
risk, effort, and classification.

### A7 — Deforming grid as the base transformation view *(reusable, topic-specific)*

The foundational visualization for **any** matrix/transformation concept is the
whole coordinate grid deforming under \(A\): the plane visibly stretches,
rotates, shears, or collapses. This is the primary view, not an optional garnish
— isolated vector arrows read on top of the moving space, not instead of it.

- **Teaches the transformation as an action on all of space.** A grid that slides
  off its original lines makes higher-level facts *visible* rather than asserted:
  eigenlines are the lines that **land back on themselves**; a rotation leaves
  **no** line in place; a scalar matrix keeps **every** line; a defective shear
  keeps exactly **one**.
- **New obligation (sharpens the excluded "deform the grid" baseline):** in a
  clip whose point is *why directions do or do not stay on their line* (e.g. the
  eigenvector Watch clip), the grid deformation must actually be shown during the
  relevant beats — not only in a standalone matrix lesson. The fan of vectors and
  the deforming grid must be driven by the **same** interpolation so they never
  disagree (for the fan, `lerp(v, Av, t) = (lerp(I, A, t))·v` guarantees this).
- **Correctness constraint:** grid endpoints come only from the shared
  `makeTransformedGrid` / `transformedGridSegments` path
  (`matrixVectorMultiply`); never derive slopes from matrix rows or a foreign
  matrix pack (see [MATH_CORRECTNESS.md](./MATH_CORRECTNESS.md) and the
  transformed-grid entry in [ERROR_LOG.md](./ERROR_LOG.md)). Identity→\(A\)
  scrubbing is an educational transition, not a claimed factorization.
- **Attention constraint:** retire or dim the grid the moment a single arrow
  reads a scalar quantity more cleanly (e.g. the λ stretch/reverse/collapse
  demos), so the moving space clarifies rather than clutters.
- **Effort:** Low (reuses `makeTransformedGrid`). **Misuse risk:** leaving a busy
  transformed grid on screen during a beat that is really about one arrow's
  length or sign.

### A1 — Matrix-column-to-basis-vector flights *(reusable, topic-specific)*

Animate matrix columns detaching and landing on the transformed basis vectors,
with coordinate labels appearing at the vector tips.

- **Must teach the correspondence:** the first matrix column is `A e₁`; the
  second is `A e₂`.
- **Not a decorative text flight.** It must preserve identity across:
  matrix column → coordinate pair → vector tip → transformed basis vector.
- Reference for craft only: 3b1b `ColumnsToBasisVectors`,
  `IntroduceExampleTransformation`.
- **Effort:** Medium. **Misuse risk:** eye-candy that breaks the column → basis
  identity.

### A4 — Decomposed / successive transformations

Apply a transform in two visible stages (for example `[[a,0],[0,1]]` then
`[[1,0],[0,d]]`) to explain diagonal determinant multiplication,
`det(AB) = det(A)·det(B)`, and how area scaling composes.

- **Require** the intermediate state to remain visible long enough to identify
  **two separate scaling events**.
- **Effort:** Low. **Misuse risk:** the intermediate flashes by and reads as a
  single motion.

### A5 — Lambda-knob explorer *(primarily a Mafs interactive pattern)*

An interactive slider on `λ` that shows when `A − λI` becomes singular.

- **Learning objective:** eigenvalues are exactly the values of `λ` for which
  `A − λI` becomes singular.
- **Connect:** live `det(A − λI)`; collapse of the transformed grid or basis;
  appearance of a nullspace / eigendirection; characteristic-polynomial roots.
- **Must conclude with an explicit takeaway**, not an open-ended slider
  playground.
- **Effort:** Medium. **Misuse risk:** a playground with no landed conclusion.

### A6 — Counterexample and boundary gallery *(targeted, not mandatory)*

Use a contrast, boundary case, or counterexample only when it **materially
sharpens the definition or repairs a likely misconception**.

- Examples: generic vector vs. eigenvector; positive vs. negative eigenvalue;
  rotation with no real eigenline; shear with one eigendirection; scalar matrix
  with every direction invariant.
- **Effort:** Low–Medium. **Misuse risk:** reflexive counterexamples that add
  clutter without sharpening anything.

### A2 — Rotational arc travel *(later / conditional)*

Do **not** use arc motion as general polish. Use it only when the **path itself
communicates meaningful mathematics**: orientation of rotation, signed angle,
clockwise vs. counterclockwise, or rotation vs. pure scaling.

> **Correctness rule.** An educational tween path is not automatically the
> mathematical action. Use curved travel only when the path itself is part of the
> concept, or clearly treat it as a visual transition rather than a claim about
> the transformation.

For an arbitrary linear transformation, an arc tween may falsely imply a
rotational trajectory. **Effort:** Medium. **Classification:** later / conditional.

### A3 — Arbitrary-region area scaling *(optional mathematical depth)*

Show an arbitrary region approximated by shrinking grid squares, all scaled by
the same determinant factor.

- **Classification:** optional mathematical depth, **not** core animation polish.
- **Teaches:** a linear map scales arbitrary regions by the same determinant
  factor, via local area decomposition.
- **Cognitive cost to weigh:** approximation, tessellation, an implicit limiting
  process, and irregular boundaries.
- Place **late**, after the learner already understands signed area scaling on the
  unit square and parallelograms. **Effort:** Medium.

---

## 9. Motion Canvas implementation mapping

Buildable mapping to the existing stack. No code is produced by this document;
these notes make later implementation direct.

- **A7:** reuse `makeTransformedGrid(matrixAt, ...)` behind a `gridDeformOpacity`
  signal; drive `matrixAt` with `lerpIdentityToMatrix(matrix(), t)` and share the
  same `t` that drives the fan so grid and arrows never disagree. Reveal it on
  the "space moves" beats and fade it out for single-arrow scalar demos.
  Implemented in `eigenvectorsInvariantDirectionsScene.ts`.
- **A1:** new `sceneKit.ts` helper that tweens a matrix column into a
  tip-anchored coordinate label, preserving `ROLE.basis1` / `ROLE.basis2`
  identity; drive it from a segment body in the relevant scene.
- **A4:** chain two `morphTo(...)` calls with an explicit `waitFor(...)` hold on
  the intermediate state; show an area/label readout at each stage.
- **A6:** add scene segments and/or preset matrices sourced from shared
  `exampleData`; show a generic vector visibly knocked off its span line as its
  own beat.
- **A2 (conditional):** add an optional arc-path option to arrow-tip
  interpolation in `sceneKit`, used only for rotation/reflection beats; otherwise
  keep straight travel.
- **A3 (optional):** a determinant-scene beat drawing a blob outline plus tiled
  shrinking squares.
- **Cross-cutting:** all math via `src/math` helpers (`matrixVectorMultiply`,
  `determinant2x2`, `analyzeEigen2x2`); durations in `sceneTimings.ts`; major
  steps in `sceneMeta.ts`.

---

## 10. Mafs implementation mapping

- **A5:** a new explorer registered in `src/explorations/registry.tsx`, reusing
  `MafsSceneShell`, `ParameterControls` (the `λ` slider), and `SceneReadout` (live
  `det(A − λI)` and roots), backed by `analyzeEigen2x2`; end on an explicit
  takeaway line via the aria-live summary.
- **A6 (interactive variant):** explorer presets for the rotation, shear, and
  scalar cases.
- **Continuity:** reuse the same matrices, vectors, and colors as the guided
  example, per project continuity rules.

---

## 11. QA and review workflow

Golden-frame screenshots are useful for clipping, label placement, establishing
and landing states, and visual-role consistency — but they **cannot assess motion
quality**. A recorded-or-live playback review is required.

Playback checks:

1. Watch continuously at normal speed.
2. **Visual-only pass** — review with explanatory captions temporarily hidden.
   Can the visual sequence still communicate the objects, changes, and focal
   relationships? (Clips here are caption-driven, not narrated, so a "muted" test
   would check nothing; hide captions instead.)
3. **Script-only pass (inverse)** — read the ordered captions/script without the
   animation. Does the explanatory argument remain coherent? Neither side must
   teach the entire concept alone, but each should remain **structurally
   understandable**.
4. Scrub through major steps.
5. Inspect every establishing and landing frame.
6. Review at one narrow viewport.
7. Review with reduced motion.
8. Confirm focal objects remain trackable through transitions.
9. Confirm captions and visuals do not compete for attention.
10. Confirm each named mathematical effect visibly occurs in its beat.

### Cold review requirement

The final reviewer should preferably **not** be the clip's primary author. When
that is not possible, conduct a **delayed self-review without opening the source
code first**. Authors know what every object and transition is supposed to mean,
so they mentally fill in explanations a learner cannot. In this workflow, Cursor
can perform the first implementation review, followed by a separate
**browser-only review in a fresh context**.

### Originality guard around references

Study references (3b1b or otherwise) to extract **principles** — attention
control, object continuity, pacing, narrative structure. Do **not** copy
transcript wording, animation code, distinctive sequences, or choreography
shot-for-shot. Every clip must be **independently authored** for this curriculum
and visual system. The adoption backlog is a set of principle-driven
capabilities, **not** a recreation checklist of reference videos.

### 3Blue1Brown comparison rule

A matching 3b1b clip is not required for every animation.

> When a directly relevant reference exists, study it for explanatory strategy,
> pacing, visual continuity, and misconception handling. Then judge the new clip
> **independently** against this project's own rubric.

Do **not** score stylistic or color similarity, animation density, or cinematic
resemblance. **Do** compare: what learner question drives the segment; how object
identity is preserved; how attention is directed; when terminology appears; how
symbols connect to geometry; whether the explanation earns its conclusion.

---

## 12. Clip-quality rubric

Score each dimension **0–2**.

| Dimension | 0 | 1 | 2 |
| --- | --- | --- | --- |
| **Mathematical honesty** | A transition or caption implies a false claim | Ambiguous; could mislead | No transition or caption implies a false claim |
| **Object legibility** | Key objects/labels unreadable | Some strain | Important objects and labels are readable |
| **Attention control** | Learner is lost | Focus wanders at points | The learner always knows where to look |
| **Object continuity** | Objects are swapped silently | Occasional untracked change | Mathematical objects remain trackable |
| **Symbol–geometry binding** | Symbols and picture are disconnected | Loose coupling | Equations visibly correspond to the picture |
| **Explanatory causality** | Changes seem arbitrary | Partial "why" | The learner can tell why each change occurs |
| **Pacing** | Too fast/slow to follow | Uneven | Enough time to orient, follow, and inspect |
| **Narrative coherence** | Beats feel disconnected | Some flow | Each beat motivates or prepares the next |
| **Retention payoff** | Nothing to carry away | A loose takeaway | The final state compresses into a reusable idea |
| **Accessibility** | Color-only cues, no reduced-motion path | Partial | Color-independent cues, reduced motion, readable captions |

> **Passing quality: at least 16/20 overall, Mathematical honesty must score 2,
> and no dimension may score 0.**

This ensures correctness cannot be offset by polish elsewhere. The
**correctness-critical trio** is mathematical honesty, symbol–geometry binding,
and object continuity — none of these may score 0 (already implied by the
no-zero clause, but called out for emphasis).

The score is a **review aid, not a substitute for judgment**.

---

## 13. Per-clip acceptance checklist

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

---

## 14. Prioritized adoption backlog

Each item lists **priority · effort · pedagogical function · likely first adopter
· acceptance condition · misuse risk**.

### Highest priority

- **Script-first / event-lockstep authoring (B1)** · High · Low · aligns motion
  and words · any next authored clip · every visual event is licensed by a script
  unit and the beat template is filled · narrating every frame.
- **Attention choreography** · High · Low · limits cognitive load per beat · any
  next authored clip · each beat answers "where should the learner look" · treating
  more motion as more teaching.
- **Object-identity continuity** · High · Low · preserves traceability and avoids
  false equivalence · matrix and determinant clips · no silent object swaps;
  copies marked as ghosts · morphs that destroy recognizability.
- **Name-after-intuition (B4)** · High · Low · attaches terms to felt ideas ·
  eigen lesson prose · terminology follows the behavior it names · delaying names
  past usefulness.
- **Meaningful cross-lesson callbacks (B5)** · High · Low · threads dependencies
  · eigen lesson (determinant callback) · callback rebuilds the prior model, not
  just cites it · name-dropping without reactivation.
- **Targeted contrast / boundary cases (A6)** · High · Low–Med · sharpens
  definitions · eigen Watch/explorer · used only where it repairs a real
  misconception · reflexive counterexample clutter.
- **Recorded-playback QA rubric** · High · Low · catches motion defects stills
  miss · review process · all playback checks run before merge · relying on
  golden frames alone.
- **Internal clip-quality score** · High · Low · makes "good enough" explicit ·
  review process · threshold met (≥16/20, honesty = 2, no zeros) · gaming the
  score instead of using judgment.

### Next priority

- **Matrix-column-to-basis-vector flights (A1)** · Med · Med · binds columns to
  `A e₁`, `A e₂` · matrix-transformation clip · identity preserved column →
  coordinate → tip → basis · decorative text flight.
- **Decomposed / successive transformations (A4)** · Med · Low · shows area
  scaling composes · determinant clip · both scaling events separately
  identifiable · intermediate flashes by.
- **Lambda-knob explorer (A5)** · Med · Med · eigenvalues make `A − λI` singular
  · eigen explorer · ends on an explicit takeaway · open-ended playground.
- **Confession / correction layering (B2)** · Med · Low · stages complexity ·
  determinant sign / orientation · simple model is true-within-domain and
  corrected before assessment · presenting a falsehood as a "simplification."

### Later or optional

- **Rotational arc travel (A2)** · Low · Med · encodes signed rotation in the
  path · a rotation-specific clip · used only where the path is the concept ·
  implying arbitrary transforms follow arcs.
- **Arbitrary-region area generalization (A3)** · Low · Med · determinant scales
  all regions · determinant depth layer · introduced only after unit-square
  mastery · limiting-process overload too early.
- **Embedded pause-and-ponder beats (B3)** · Low · Low · turns watching into
  prediction · where the next state is inferable · not duplicating the Check phase
  · ritual pauses that stall flow.
- **Embodied metaphors where they fit (B6)** · Low · Low · anchors abstractions ·
  wherever structure-preserving · metaphor's limits stated · metaphor outliving
  its valid domain.

---

## 15. Risks, anti-patterns, and non-goals

- Do **not** turn 3b1b style into the acceptance criterion.
- Do **not** copy transcript wording, animation code, distinctive sequences, or
  choreography shot-for-shot (originality guard).
- Do **not** let the backlog become a recreation checklist of reference videos.
- Do **not** prescribe motion when a still image is clearer.
- Do **not** mandate counterexamples, pauses, metaphors, or arc travel in every
  clip.
- Do **not** add a technique for resemblance.
- Do **not** let smoothness or density stand in for understanding.

Every recommended technique names its pedagogical purpose and its misuse risk.

---

## 16. References studied

Studied for explanatory craft only; nothing is copied.

- 3b1b Essence of Linear Algebra source (craft reference): `_2016/eola/chapter5.py`
  (determinant), `_2016/eola/chapter10.py` (eigenvectors),
  `_2016/eola/chapter3.py` (linear transformations),
  `once_useful_constructs/vector_space_scene.py`, `_2021/quick_eigen.py`.
- 3b1b transcripts (Determinant; Eigenvectors and eigenvalues) — studied for
  narration-to-animation mapping.
- This project: `src/guided-scenes/scenes/sceneKit.ts`,
  `src/explorations/registry.tsx`, [LESSON_DESIGN.md](./LESSON_DESIGN.md),
  [lesson-depth-pattern.md](./lesson-depth-pattern.md),
  [MATH_CORRECTNESS.md](./MATH_CORRECTNESS.md).
