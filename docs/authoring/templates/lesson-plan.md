# Lesson authoring template

Fill-in **planning** template for a new lesson. This is a design artifact, not
executable lesson data — the real lesson lives in a typed `LessonDefinition`
under `src/lessons/`.

Follow [authoring/lesson-design.md](../lesson-design.md) and
[engineering/math-correctness.md](../../engineering/math-correctness.md). Copy this file per lesson.

> **Gate prerequisite (required before planning).** Do not fill in this template
> until an approved Insight Contract exists for the topic and its
> `Gate result: PASS`. See [authoring/insight-discovery-gate.md](../insight-discovery-gate.md).
> The lesson must be built around that contract's primary insight and preserve its
> mathematical meaning and causal chain. Keep the exact insight sentence verbatim
> in the planning metadata below (for traceability); learner-facing prose may use
> shorter, clearer wording.
>
> **Mastery-contract prerequisite (also required before planning).** Complete the
> [Lesson Mastery Contract](lesson-mastery-contract.md) for this topic first
> (workflow Gate 5). It fixes the coverage, rigor, practice, transfer, cumulative
> connections, assessment evidence, and delayed-retention obligations this
> template then implements. The **Learning objectives** below must be the
> contract's operational **outcomes-with-evidence**, not vague goals, and the
> **Exercises** must match the contract's assessment set. Presentation follows
> [product/semantic-page-grammar.md](../../product/semantic-page-grammar.md).

> **Saved as:** `docs/courses/<course>/lessons/<lesson>/lesson-plan.md`.

## Approved insight (gate)
- Insight Contract: `docs/courses/<course>/lessons/<lesson>/insight.md`
- [ ] `Gate result: PASS` confirmed
- Exact primary insight — **verbatim, planning metadata only** (learner-facing
  prose may reword while preserving the meaning and causal chain): `<...>`
- Learner-facing phrasing (optimized for clarity): `<...>`
- Diagnosed cognitive obstacle: `<...>`
- Insight mechanism(s): `<structural compression | semantic grounding | operational
  grounding | representational change | predictive/causal reorganization>`
- **If the insight is grounded** (uses a semantic/operational/representational
  bridge), also record — these become traceability obligations below:
  - Bridge (familiar goal/process/representation): `<...>`
  - Named analogy limits / pragmatic additions to discard: `<...>`
  - Abstraction return (grounded → correspondence → unfamiliar → symbolic): `<...>`

---

## Lesson title
> e.g. "Vectors and Linear Combinations"

## Route / ids
- Route: `/lesson/<slug>`
- `guidedSceneId`: `<...>`
- `explorationId`: `<...>`

## Motivating question
> One concrete question, prediction, or puzzle. Brief.

## Learning objectives
- [ ] ...
- [ ] ...

## Shared examples
> Reference example **ids** from `src/math/examples.ts` / `src/lessons/exampleData.ts`.
> Never duplicate matrix/vector constants.
- Main example id: `<...>` (used by BOTH guided scene and explorer)
- Supporting examples: `<...>`

## Supporting concepts (optional)
> Auxiliary beats this lesson introduces (e.g. definition of linear
> dependence, span, unit vector). Note where they slot into the flow.
- ...

## Guided-scene outline (Watch)
> Read-only Motion Canvas. One idea per major step; meaningful step names.
| Step id | Name (learner-facing) | Idea revealed | Notation synced |
| --- | --- | --- | --- |
| `...` | ... | ... | ... |

- Pauses / dimming plan:
- Honest labelling of any interpolation:

## Checkpoint (Check understanding)
- Prompt:
- Type: prediction | interpretation | multiple choice
- Reveal / explanation:

## Interactive controls (Explore)
> Initialize from the main example above.
- Primary controls (shown first): ...
- Primary readouts: ...  (use KaTeX; \(\mathbf{e}_1, \mathbf{e}_2\) for the standard basis)
- Progressive-disclosure controls (Display options / Advanced): ...
- Clamp ranges: ...
- Reset behavior: ...

## Exercises (Practice) — at least two
| # | Objective | Type | Deterministic answer | Feedback (why) |
| --- | --- | --- | --- | --- |
| 1 | ... | ... | ... | ... |
| 2 | ... | ... | ... | ... |

## Insight traceability (required)
> Map **every** obligation in the approved Insight Contract's causal chain to a
> learner-facing location and observable evidence of understanding. A plan does
> **not** pass by merely linking the contract or repeating the primary-insight
> sentence — each causal step needs a location and evidence. **For a grounded
> insight, also map the bridge, each named analogy limit, and the abstraction
> return** — the last with evidence the learner returns to the symbolic form, not
> just success on the familiar story.

| Contract obligation | Learner-facing location | Evidence of understanding |
| --- | --- | --- |
| <e.g. Four naive products> | <Watch beat> | <Learner counts four product regions> |
| <Shared place-value weight> | <Watch / Check> | <Learner identifies AD and BC as one middle level> |
| <Auxiliary coefficient rectangle> | <Watch / Explore> | <Learner predicts what remains after subtraction> |
| <Exact reconstruction> | <Watch / Explore> | <Learner assembles 100z₂ + 10z₁ + z₀> |
| <Recursive consequence> | <Watch / Practice> | <Learner predicts branch count and exponent> |
| <Transfer> | <Practice> | <Learner applies the principle to a related recurrence> |

## Key takeaway (Summarize)
> One concise sentence. Optional small visual recap.

## Notation
- Symbols/names used (must match across prose, scene, explorer, exercises):
- KaTeX snippets for the main equations:

## Edge cases
> Degenerate/limit cases the visualization must handle honestly.
- Zero vector / collapse / singular / repeated eigenvalue / no-real-eigenvector, as applicable.

## Mathematical invariants to assert
> From `src/math/invariants.ts` where applicable.
- [ ] transformed basis matches columns
- [ ] grid families parallel to \(A\mathbf{e}_1\) / \(A\mathbf{e}_2\)
- [ ] sample points match `matrixVectorMultiply`
- [ ] unit-square area = |det(A)| (if determinant is in scope)
- [ ] eigenpairs satisfy \(A\mathbf{v} \approx \lambda\mathbf{v}\) (if eigen in scope)
- [ ] lesson-specific: ...

## Required tests
- [ ] Unit tests (pure math helpers used)
- [ ] Invariant tests
- [ ] Component tests (explorer readouts, controls, reset)
- [ ] Browser test (learner-visible readouts; no console errors)
- [ ] Asymmetric matrix + singular case where relevant

## Acceptance checklist
- [ ] Approved Insight Contract linked and `PASS`; exact insight verbatim in
      metadata; learner-facing wording preserves meaning + causal chain
- [ ] Insight traceability table complete — every contract obligation mapped to a
      learner-facing location and observable evidence
- [ ] Intentional `route` composed from the block palette (no mandatory sequence;
      Watch precedes Explore by default — see lesson-design.md); any deviation noted
- [ ] Visible headings + ToC are content-specific, not generic phase names
      ([semantic-page-grammar §1](../../product/semantic-page-grammar.md))
- [ ] Guided-to-interactive continuity (same example/notation/roles)
- [ ] Progressive disclosure applied
- [ ] KaTeX + \(\mathbf{e}_1, \mathbf{e}_2\) notation consistent
- [ ] Basic accessibility preserved (labels, focus, readouts, reduced-motion)
- [ ] Diagrams labelled, unclipped, safe frame intact
- [ ] Viewport/zoom checks done
- [ ] [quality/lesson-correctness-checklist.md](../../quality/lesson-correctness-checklist.md) completed
- [ ] All tests pass
