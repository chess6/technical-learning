# A composable scene grammar — proposal

**Status: proposal, backed by benchmark evidence. Not a standard, and
deliberately not a sequence anyone must follow.** It exists to give the later
scene-system redesign a vocabulary and a set of primitives; nothing in the
current authoring gates changes because of this document.

Evidence comes from two distinct layers: the four **focused 7–17 second runtime reconstructions** in [README.md](README.md), and the wider committed source-pack analyses under `.reference-sources/packs/`. Only behaviors inside the current manifest windows are actively benchmarked. Camera reframing, prediction overlays, intertitles, graph build-in, and pseudocode write-in are source-study evidence only; the shortened manifests declare every current camera static.

## The finding

Every production guided scene composes the same way: a title band, a caption
band, and geometry between them, re-set on nearly every beat. Across 18 scenes
there are **261 caption assignments**; exactly one scene (the development spike)
has none, and 10 scenes carry both a persistent top label and a persistent
caption.

None of the four expert excerpts is built that way, and **one of them shows no
caption at all**:

| Excerpt | How it carries meaning |
| --- | --- |
| `eigen-span-stretch` (3b1b, 117.4–129.5 s; current) | No title or caption. A pinned matrix, fixed span, moving grid, and vector carry the meaning through one continuous transform. |
| `huffman-merge` (Reducible, 1450.0–1462.5 s; current) | No prose. Value readouts and the sorted frontier carry one complete greedy merge. |
| `ab-split` (Sláma, 310.6–317.9 s; current) | One persistent section title and object labels during the split/rise repair. Camera reframing and the prediction overlay occur elsewhere in the wider source study and are not in this window. |
| `bfs-frontier` (Jiao, 21.5–38.5 s; current) | The pseudocode panel is already established and acts as narrator while its tracer and graph state advance together. The intertitle, staggered build, and write-in occur before this window and are not currently benchmarked. |

The reference animations vary their presentation because different beats have
different jobs. Our scenes vary the *words* in a fixed frame.

## Ten treatments, and when the references reach for each

Each is a composable element, not a step. The evidence column cites where the
laboratory watched it work.

| Treatment | Used when | Evidence |
| --- | --- | --- |
| **No text** | The geometry already answers the question, and words would be read instead of the picture. | The current `eigen-span-stretch` `stay-on-span` beat: a fixed span plus a vector that slides along it. |
| **Direct object labels** | The thing needs a *name*, not a sentence — and the name should move with it. | Current windows use key/value labels; the moving 3b1b tip-label example belongs to the wider source study. |
| **Persistent equation** | Algebra and geometry must be co-visible so a change in one is seen in the other. | 3b1b's pinned matrix, held for the whole excerpt with its columns colour-bound to the basis. |
| **Temporary annotation** | One fact needs saying *now*, beside the thing it is about, and then should go. | Wider 3b1b source-study evidence; the focused eigen window ends before these annotations. |
| **Split-screen comparison** | Two spaces or two algorithms must not be implied to share one plane. | Production `subspaces-rank` plus the wider Huffman source study; the focused Huffman window does not include the contrast. |
| **Full-frame question / intertitle** | The frame should stop being a diagram and become a prompt. | Wider source-pack evidence only: the A/B-tree pause overlay and BFS opening card are outside the focused runtime windows. |
| **Invariant ledger** | The claim is about a quantity that must not change while everything else does. | `rank-nullity`'s tally; the sorted frontier column, where "still sorted" is visible without a word. |
| **Camera reframing** | The argument is local and the rest of the frame is currently noise. | Wider A/B-tree source-pack evidence only; every focused manifest currently declares a static camera. |
| **Silent visual hold** | The viewer needs time on an unchanged frame. | 3b1b's holds after every semantic step; the reference's explicit pause-and-ponder beats. |
| **Narration over uninterrupted motion** | The motion is continuous and words would chop it. | The current 3b1b grid and special vector transform continuously while the fixed span and equation hold. |

## The proposal

Replace "every beat sets a title and a caption" with **a beat that declares its
job, and a composition that follows from it.** Concretely, a beat would carry:

```
beat = {
  role:      establish | transform | compare | predict | reveal | verify | rest
  subject:   the one object or relationship the beat is about
  treatment: one or more of the ten above
  camera:    static | reframe(target)
}
```

Three rules, and no fourth:

1. **One subject per beat.** Every reference excerpt varies exactly one thing
   per beat and holds the rest fixed; that is what makes attention land.
2. **Text earns its place.** A caption is one treatment among ten, not the
   frame. If the geometry says it, do not also write it.
3. **Nothing is mandatory.** A beat may legitimately have no text, no camera
   move, and no new object — the focused `huffman-merge` runs 12.5 s on value readouts alone.

What this is *not*: a required sequence of roles, a template, or a claim that
captions are bad. Our checkpoints are a genuine advantage over the references —
all four excerpts pause and hope, and we can verify. The proposal is about the
*frame*, not about dropping the pedagogy.

## Primitives motivated by the focused benchmarks and wider source study

Built during the laboratory work and now in the shared kit (`src/guided-scenes/scenes/kitMotion.ts`, with pure calculators in `kitLayout.ts`, unit-tested). The current focused windows actively exercise span geometry, persistent tokens, sorted layout, tracer/state synchronization, and pulses. `makeFocusRig`, `makeWriteInText`, `writeInSchedule`, `staggerTimes`, and family-gradient support came from the wider source study or earlier long replicas; because the current windows exclude those beats, their existence must not be described as current comparison coverage:

| Primitive | The pattern it encodes |
| --- | --- |
| `makeSpanLine` | Draw the invariant as a fixed object *before* the motion, so "it stays on its span" is witnessed, not claimed. |
| `makeFocusRig` / `rigTransformForFocus` | Camera-as-group-move, for a runtime with no camera rig. |
| `makeWriteInText` / `writeInSchedule` | Write-in paced by text length — the no-narration substitute for speaking time. |
| `makeTracerArrow` | A pointer re-aimed by the same transition that mutates the diagram, so panel and picture cannot desynchronise. |
| `pulseRing` | A transient **action** pulse, kept distinct from persistent **state** colour. |
| `makeRingToken` / `makeStackedToken` | Value tokens: a node that displays its own number; a leaf that shows value and identity as one object. |
| `columnLayout` / `stableAscendingOrder` | A sorted frontier as a fixed place on screen, re-sorted in view. |
| `staggerTimes` | Siblings that arrive one at a time instead of all at once. |
| `distanceToLineThroughOrigin` | The stays-on-span invariant, as a number a test can hold. |
| `lerpHexColor` | A family gradient, so many arrows read as one object. |

Still missing, in rough order of how much the excerpts leaned on them:

1. **Entry migration.** 3b1b's signature move: tip coordinates fly into the
   matrix columns, λ flies into the diagonal, entries slide out to build the
   characteristic polynomial. Algebra is never typed fresh — it is assembled
   from pieces already on the plane. We have no primitive for "a copy of this
   value travels into that slot", and it is the single biggest craft gap.
2. **Morph-in-place equations.** One equation rearranged by moving its terms,
   rather than swapping strings. Note the constraint already recorded in
   `known-failure-modes.md` #8: `Txt.text(value, duration)` interpolates
   character by character and renders scrambled words, so this needs real term
   objects, not a text tween.
3. **A split-screen panel primitive.** Two labelled spaces with their own
   origins and a declared relationship, instead of each scene hand-placing
   panels.
4. **An intertitle / pause-overlay primitive.** The wider A/B-tree study motivates it, but the focused replica no longer contains the prediction beat; production would need a separately reviewed primitive.
5. **A silent-hold beat type.** A hold is currently indistinguishable from a
   beat whose body forgot to animate — which is exactly why the
   missing-claimed-motion gate has to infer intent from beat names.

## Craft gaps to drive the redesign

Measured or observed, none of them auto-failed, all of them real:

- **Caption dependence.** 261 caption assignments across 18 scenes. The
  reference excerpts carry the same load with object labels, value readouts,
  and placement.
- **No entry migration anywhere.** Every equation in our scenes appears as
  finished text. The references derive them from the picture.
- **Camera is unused in production.** The wider A/B-tree source study uses reframing, but no current focused benchmark measures it and no
  production scene reframes at all, so arguments that are local are made at
  full-frame scale with everything else still on screen competing.
- **Uniform pacing.** Our beats are budgeted from a table; the references hold
  after *every* semantic step and vary hold length by how much has just
  changed. The focused reports no longer measure the longer A/B-tree insertion montage, so they provide no evidence for that pacing comparison.
- **Label placement is per-scene and hand-tuned.** Six of the ten corrected
  production defects were labels colliding under motion. Tip labels need a
  placement helper that is aware of what else is on the frame, not a fixed
  offset per call site.
- **Layout rules differ from the references' in ways we chose but never
  compared.** `ab-split`'s node centres sit up to ~60 px from the reference's
  because our layout centres a parent between its first and last child and the
  reference does not. Recorded as a deviation, not chased.
- **Typography.** LaTeX serif versus our sans stack, present in every
  comparison. A deliberate product choice, but it is the most visible single
  difference in every paired frame.
