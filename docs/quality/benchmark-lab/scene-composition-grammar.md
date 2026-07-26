# A composable scene grammar — proposal

**Status: proposal, backed by benchmark evidence. Not a standard, and
deliberately not a sequence anyone must follow.** It exists to give the later
scene-system redesign a vocabulary and a set of primitives; nothing in the
current authoring gates changes because of this document.

Evidence: the four reconstructions in [README.md](README.md), their per-beat
`textTreatment` and `camera` records in `src/benchmark-lab/manifests/`, and the
committed pack analyses under `.reference-sources/packs/`.

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
| `eigen-span-stretch` (3b1b, 117–202 s) | No title, no caption for 62 of its 85 s. A pinned matrix whose columns are colour-bound to the basis vectors, coordinate labels riding vector tips, and exactly two short annotations at 185.6 s and 188.6 s once both families are on screen. |
| `huffman-merge` (Reducible, 1450–1497 s) | No prose at all. Value readouts only: each node displays its own number, and the sorted column is a **place** that means "the frontier". |
| `ab-split` (Sláma, 299–366 s) | One persistent section title for the whole excerpt; a full-frame pause overlay for the prediction; temporary annotations only under the two zooms that argue validity. |
| `bfs-frontier` (Jiao, 0–40 s) | A full-frame intertitle, then a pseudocode panel that *is* the narrator, written in at a pace proportional to line length, with a tracer arrow moved by the same state transition that mutates the graph. |

The reference animations vary their presentation because different beats have
different jobs. Our scenes vary the *words* in a fixed frame.

## Ten treatments, and when the references reach for each

Each is a composable element, not a step. The evidence column cites where the
laboratory watched it work.

| Treatment | Used when | Evidence |
| --- | --- | --- |
| **No text** | The geometry already answers the question, and words would be read instead of the picture. | `eigen-span-stretch` beats `stay-on-span` … `diagonal-family`: a span line plus a vector that slides along it. |
| **Direct object labels** | The thing needs a *name*, not a sentence — and the name should move with it. | `λv`, `Ax`, `e₁`; 3b1b's coordinate label rides the tip to the doubled tip as the receipt that it is the same vector. |
| **Persistent equation** | Algebra and geometry must be co-visible so a change in one is seen in the other. | 3b1b's pinned matrix, held for the whole excerpt with its columns colour-bound to the basis. |
| **Temporary annotation** | One fact needs saying *now*, beside the thing it is about, and then should go. | `stretch factor 3` / `stretch factor 2`, placed along the families they name, only after both exist. |
| **Split-screen comparison** | Two spaces or two algorithms must not be implied to share one plane. | `subspaces-rank`'s input/output panels; the Shannon-Fano vs Huffman contrast. |
| **Full-frame question / intertitle** | The frame should stop being a diagram and become a prompt. | `ab-split`'s pause overlay with a sliding progress marker; `bfs-frontier`'s opening card. |
| **Invariant ledger** | The claim is about a quantity that must not change while everything else does. | `rank-nullity`'s tally; the sorted frontier column, where "still sorted" is visible without a word. |
| **Camera reframing** | The argument is local and the rest of the frame is currently noise. | `ab-split` zooms to the two split halves to write ⌊(b+1)/2⌋ ≥ a beneath them, then reframes on the root. |
| **Silent visual hold** | The viewer needs time on an unchanged frame. | 3b1b's holds after every semantic step; the reference's explicit pause-and-ponder beats. |
| **Narration over uninterrupted motion** | The motion is continuous and words would chop it. | The 3b1b fan stretches while narration runs; nothing else moves. |

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
   move, and no new object — `huffman-merge` runs 47 s on value readouts alone.

What this is *not*: a required sequence of roles, a template, or a claim that
captions are bad. Our checkpoints are a genuine advantage over the references —
all four excerpts pause and hope, and we can verify. The proposal is about the
*frame*, not about dropping the pedagogy.

## Primitives the benchmarks demonstrated were missing

Built for the reconstructions and now in the shared kit
(`src/guided-scenes/scenes/kitMotion.ts`, with pure calculators in
`kitLayout.ts`, unit-tested):

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
4. **An intertitle / pause-overlay primitive.** Built ad hoc in the `ab-split`
   replica; the prediction beats in production would use it directly.
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
- **Camera is unused in production.** One benchmark needed reframing; no
  production scene reframes at all, so arguments that are local are made at
  full-frame scale with everything else still on screen competing.
- **Uniform pacing.** Our beats are budgeted from a table; the references hold
  after *every* semantic step and vary hold length by how much has just
  changed. `ab-split`'s worst event delta (0.70 s) is entirely in its
  un-narrated montage, where the reference paces by content and we pace by
  budget.
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
