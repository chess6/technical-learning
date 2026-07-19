# Lesson authoring template

Fill-in **planning** template for a new lesson. This is a design artifact, not
executable lesson data — the real lesson lives in a typed `LessonDefinition`
under `src/lessons/`.

Follow [LESSON_DESIGN.md](./LESSON_DESIGN.md) and
[MATH_CORRECTNESS.md](./MATH_CORRECTNESS.md). Copy this file per lesson.

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
- Primary readouts: ...  (use KaTeX; hat notation for \(\hat{u}, \hat{v}\))
- Progressive-disclosure controls (Display options / Advanced): ...
- Clamp ranges: ...
- Reset behavior: ...

## Exercises (Practice) — at least two
| # | Objective | Type | Deterministic answer | Feedback (why) |
| --- | --- | --- | --- | --- |
| 1 | ... | ... | ... | ... |
| 2 | ... | ... | ... | ... |

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
- [ ] grid families parallel to \(A\hat{u}\) / \(A\hat{v}\)
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
- [ ] Six-phase flow (or documented deviation)
- [ ] Guided-to-interactive continuity (same example/notation/roles)
- [ ] Progressive disclosure applied
- [ ] KaTeX + hat notation consistent
- [ ] Diagrams labelled, unclipped, safe frame intact
- [ ] Viewport/zoom checks done
- [ ] [LESSON_CORRECTNESS_CHECKLIST.md](./LESSON_CORRECTNESS_CHECKLIST.md) completed
- [ ] All tests pass
