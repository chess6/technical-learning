# Lesson depth pattern (medium-agnostic)

Authoring note for deepening Lessons 1–3 (and future chapters) using the pattern
proven in Lesson 4. Complements [LESSON_DESIGN.md](./LESSON_DESIGN.md) (mechanics)
and [INTERACTIVE_TEXTBOOK_VISION.md](./INTERACTIVE_TEXTBOOK_VISION.md) (pedagogy).

## The pattern

```
math spine (structured values from src/math)
  → an appropriate derivation representation
  → an appropriate solution visual
```

Plus optional: notebook worked examples (with faded guidance), tiered practice
reveals, misconception callouts, and depth layers.

**The medium follows the learning objective.** Do **not** assume every lesson needs
its own Motion Canvas derivation scene and a bespoke solution-diagram component.
That would contradict the vision document’s warning against unnecessary animation
and interaction.

### Appropriate derivation representations (pick the lightest that teaches)

| Medium | When to use |
| --- | --- |
| Motion Canvas scene | Multi-step geometric change that must be synchronized with symbols (Lesson 4 ladder) |
| Static SVG / Mafs diagram | A single snapshot or small set of states is enough |
| Equation-only derivation | The geometry is already known; symbols need careful pacing |
| Synchronized text + existing explorer | Learner should drive the same example while reading steps |

### Appropriate solution visuals (practice / reveals)

| Medium | When to use |
| --- | --- |
| Static Mafs / SVG (`solutionVisuals` registry) | Reconstruct the mental picture beside revealed reasoning |
| Compact equation block | Numeric drill where a diagram adds little |
| Reuse explorer snapshot props | Continuity with the Explore phase |

Reserve full cinematic scenes for genuinely new ideas — not every drill item.

## Shared infrastructure (already optional)

| Piece | Where | Notes |
| --- | --- | --- |
| Structured math helpers | `src/math` | Numbers only — no TeX |
| Presentation formatting | e.g. `src/lessons/eigenFormat.ts` | KaTeX/prose from structured values |
| `WorkedExample` + `WorkedStep` | `src/lessons/types.ts` | Embed `guidedSceneId` on the example when a scene is the visual core |
| `DepthLayer` | types + `DepthLayer.tsx` | Main line must stand alone |
| `AuthoredCallout` | flexible slots, not a rigid DSL | Belief / confront / resolve optional |
| `SolutionReveal` + registry | practice / checkpoint | Tiered: check/drill compact; transfer richer |
| Exercise `tier` / `hints` | `ExerciseDefinition` | check / drill / transfer |

## Lesson 4 as the worked reference

Flow:

1. Conceptual Watch (`eigenvectors-invariant-directions`)
2. Quick Check
3. **Worked computation** — derivation scene + notebook (taught once)
4. Explorer
5. Faded example + tiered practice

Key design choices to copy in spirit (not necessarily in medium):

- Derivation lives **inside** the worked example, not as a second Watch block.
- Math spine (`eigenDerivation2x2`) feeds scene, notebook, diagram, and tests.
- Asymmetric example exploited explicitly (λ=3 axis vs λ=2 off-axis).
- Misconceptions authored as flexible callouts at the moment they arise.
- Concept-graph edges strengthened (determinant collapse reused in the ladder).

## Adoption checklist (per lesson)

- [ ] Core mental model named and reinforced
- [ ] Math spine exists in `src/math` (structured values only)
- [ ] Derivation representation chosen to fit the objective (not defaulted to Motion Canvas)
- [ ] Solution visual chosen to fit the objective (not defaulted to a new component)
- [ ] Worked example(s) identify object / invariant / picture / why-next / learned on **meaningful** steps
- [ ] Guidance fades on a later example
- [ ] At least one misconception confrontation where it naturally arises
- [ ] Practice tiers (or a clear reason to skip a tier)
- [ ] At least one concept-graph edge strengthened
- [ ] Depth layers optional; main line complete without opening them
- [ ] “Enough depth” test from INTERACTIVE_TEXTBOOK_VISION.md §17 met
- [ ] Tests for math + wiring; e2e for new learner-facing beats

## What not to do

- Do not add a second top-level Watch plus a separate worked-example block that
  re-teaches the same derivation.
- Do not put KaTeX strings in `src/math`.
- Do not invent a rigid misconception DSL before a second lesson needs it.
- Do not build a scene “because Lesson 4 has one.”
