# A composable scene grammar — production slice 1

**Status: production slice 1 shipped, backed by benchmark and production evidence.**
The treatments are a vocabulary, not a required sequence or visual template.
Objective correctness remains in the production hard gates; craft remains
review evidence and author judgment.

Evidence comes from two distinct layers: the eight **focused 7–17 second runtime reconstructions** in [README.md](README.md), and the wider committed source-pack analyses under `.reference-sources/packs/`. Only behaviors inside the current manifest windows are actively benchmarked. Camera reframing, prediction overlays, intertitles, graph build-in, and pseudocode write-in now each have a focused runtime window; wider lecture choreography remains source-study evidence only.

## The finding

Before this slice, every production guided scene composed the same way: a title band, a caption
band, and geometry between them, re-set on nearly every beat. Across the pre-slice inventory of 18 scenes
there were **261 caption assignments**; exactly one scene (the development spike)
has none, and 10 scenes carry both a persistent top label and a persistent
caption.

None of the focused expert excerpts is built that way, and **one of them shows no
caption at all**:

| Excerpt | How it carries meaning |
| --- | --- |
| `eigen-span-stretch` (3b1b, 117.4–129.5 s; current) | No title or caption. A pinned matrix, fixed span, moving grid, and vector carry the meaning through one continuous transform. |
| `huffman-merge` (Reducible, 1450.0–1462.5 s; current) | No prose. Value readouts and the sorted frontier carry one complete greedy merge. |
| `ab-split` (Sláma, 310.6–317.9 s; current) | One persistent section title and object labels during the split/rise repair. Separate 12–15 second windows now measure its camera reframe and prediction-to-reveal treatment. |
| `bfs-frontier` (Jiao, 21.5–38.5 s; current) | The pseudocode panel is already established and acts as narrator while its tracer and graph state advance together. Separate 9–12.5 second windows now measure its intertitle, staggered build, and write-in. |

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
| **Full-frame question / intertitle** | The frame should stop being a diagram and become a prompt. | Focused runtime evidence: `ab-prediction-reveal` and `bfs-intertitle-build`. |
| **Invariant ledger** | The claim is about a quantity that must not change while everything else does. | `rank-nullity`'s tally; the sorted frontier column, where "still sorted" is visible without a word. |
| **Camera reframing** | The argument is local and the rest of the frame is currently noise. | Focused runtime evidence: `ab-camera-reframe` measures the continuous world-group reframe and landed focus. |
| **Silent visual hold** | The viewer needs time on an unchanged frame. | 3b1b's holds after every semantic step; the reference's explicit pause-and-ponder beats. |
| **Narration over uninterrupted motion** | The motion is continuous and words would chop it. | The current 3b1b grid and special vector transform continuously while the fixed span and equation hold. |

## The grammar

Replace "every beat sets a title and a caption" with **a beat that declares its
job, and a composition that follows from it.** The compact authoring contract carries the corresponding purpose, explicit
intent, focal objects, expected change, invariant, checkpoint, and chapter
metadata:

```ts
beat = {
  purpose,
  intent: hold | text | emphasis | geometry | camera | transition,
  focalObjects: [semanticObjectId],
  expectedChanges,
  expectedStableObjects,
  prediction,
  checkpoints,
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
the reference animations pause and hope, and we can verify. The grammar is about the
*frame*, not about dropping the pedagogy.

## Primitives motivated by the focused benchmarks and wider source study

Built during the laboratory work and now in the shared kit (`src/guided-scenes/scenes/kitMotion.ts`, with pure calculators in `kitLayout.ts`, unit-tested). The focused windows actively exercise span geometry, persistent tokens, sorted layout, tracer/state synchronization, pulses, reframing, write-in scheduling, and staggered onsets:

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

## Remaining capabilities after production slice 1

1. **Entry migration.** Tip coordinates, matrix entries, and equation terms do
   not yet travel into their algebraic slots. This remains the largest craft
   gap because identity should persist from picture to symbol.
2. **Morph-in-place equations.** Equations still change atomically. A future
   primitive must move typed term objects; `Txt.text(value, duration)` is not a
   substitute because it interpolates characters into unreadable strings.
3. **Adaptive label placement.** Attached labels preserve identity, but their
   offsets are still tuned per scene rather than solved against nearby ink and
   trajectories.

Split-screen panels, full-frame prediction/intertitle treatments, camera-style
viewport reframing, explicit silent holds, temporary annotations, and
uninterrupted-motion wrappers are no longer missing: they ship in
`scenePresentation.ts` and are exercised by the three pilots.

## Production slice 1 result

The first slice is deliberately three different compositions, not three uses of
one template. Five formerly unmeasured treatments now have focused runtime
windows: camera reframing, prediction/reveal, intertitle-to-scene, staggered
diagram build-in, and pseudocode write-in. Together with the four causal core
windows, the laboratory covers eight focused excerpts totalling 97.4 seconds;
no window exceeds 17 seconds.

### Presentation primitives introduced

| Primitive | Production purpose |
| --- | --- |
| `makeAttachedLabel` | Keep a name attached to the mathematical object it identifies. |
| `makeEquationLedger` | Keep equations or invariants visible while geometry changes. |
| `makeTemporaryAnnotation` | Place one transient claim beside its evidence, then retire it. |
| `makeSplitScreen` | Give two representations independent origins and an explicit relationship. |
| `makeFullFrameTreatment` | Turn the canvas into a prediction or intertitle, not a crowded overlay. |
| `makeViewportRig` | Reframe a local argument with a continuous world-group transform. |
| `silentHold` | Make “nothing changes while the learner inspects” explicit. |
| `uninterruptedMotion` | Preserve one continuous mathematical operation under narration. |
| `makeBriefCaption` | Keep a caption available when it adds information, without making it the scaffold. |

### Pilot compositions and generalized reference patterns

| Pilot | Before | After | Generalized evidence, not copied choreography | Remaining craft difference |
| --- | --- | --- | --- | --- |
| `matrix-transformations` | Permanent title/caption scaffold around a grid and arrows. | Attached basis labels, persistent algebra ledger, full-frame prediction, temporary line annotation, viewport reframing, and silent geometric holds. | `eigen-span-stretch`: continuous grid/object identity with pinned algebra; `ab-prediction-reveal`: commit before reveal; `ab-camera-reframe`: isolate a local argument. | Matrix entries appear in the ledger rather than migrating from vector tips; label offsets remain tuned. |
| `elimination` | Row operations, equations, and lines shared one caption-led frame. | Split algebra/geometry spaces, persistent row-operation ledger, full-frame fixed-point prediction, a temporary solution annotation, and uninterrupted row/line motion. | `bfs-frontier`: symbolic panel and diagram state advance from one transition; A/B prediction: freeze evidence before the operation. | Equation terms do not yet travel between rows; the scratch-row merge remains a scene-specific treatment. |
| `red-black-encoding` | Tree repair was explained mainly through title/caption changes. | Split 2–3–4/red-black representations, persistent invariant ledger, full-frame overflow prediction, persistent keyed nodes, and explicit inspection holds. | `ab-split`: preserve key identity through structural repair; `huffman-merge`: tokens own their values while structure reorders; A/B prediction: question before repair. | No general graph-layout transition primitive yet; typography remains the product sans stack rather than the references’ serif math. |

### Inline motion figures

All three clips use the existing lesson-visual registry, not a new lesson block.
Each is silent, muted, looping, `playsInline`, offscreen-paused, and replaced by
its poster under reduced motion. WebM is first with MP4 fallback.

| Clip | Duration | Nearby prose claim |
| --- | ---: | --- |
| `matrix-origin-fixed` | 4.0 s | A linear map moves the basis and lattice but cannot move the origin. |
| `elimination-fixed-intersection` | 3.4 s | A row operation changes a constraint representation while preserving the common solution. |
| `red-black-split-recolour` | 4.5 s | A 2–3–4 split and a red-black colour flip are the same structural repair in two encodings. |

### Contracts and verification evidence

- Explicit `hold | text | emphasis | geometry | camera | transition` intent now
  drives the timing metadata; names do not infer motion. Geometry/camera claims
  require continuous change on named semantic targets.
- Production sampling retains line points, drawn fractions, unmeasurable nodes,
  and direction-independent chapter seeks. Semantic contracts cover registered
  grid/lattice coherence, matrix/geometry agreement, displayed coordinates, and
  whole-plane cues.
- All eight benchmark windows run through the comparison engine, and every
  deviation is classified as measured, accepted with rationale, runtime-blocked,
  or intentionally different. Replica-authored differences are not self-accepted.
- Final approval: 1,538 unit tests, six Python tests, 152 browser tests, typecheck,
  lint, and production build passed. The browser sweep covers every production
  hard gate, learner playback/chapter navigation/reduced motion, benchmark modes,
  and inline loading, fallback, offscreen pause, responsive layout, and reduced
  motion.
- Ordinary H.264/yuv420p production exports at 960×540 and 30 fps completed for
  `matrix-transformations` (54.03 s), `elimination` (32.50 s), and
  `red-black-encoding` (56.03 s). The corrected matrix review packet passed
  40 production checkpoints, 10/10 deterministic direct seeks, and 10 genuine
  learner-player chapter captures from a distinct Chromium run whose
  `(prefers-reduced-motion: reduce)` query matched. The packet has no hard,
  semantic, capture, or provenance failures. This is automated artifact evidence,
  not a claim that file existence constitutes visual inspection.

### Recommended migration batches for the remaining fourteen scenes

1. **Continuous-space batch:** `why-linear-algebra`,
   `vectors-linear-combinations`, `columns-rule-graphic`,
   `determinant-area-scaling`, `eigenvectors-invariant-directions`, and
   `eigenvectors-derivation`. Reuse identity continuity, attached labels,
   viewport focus, and live grid contracts; build entry migration before the
   eigen derivation.
2. **Algebra/dual-representation batch:** `linear-systems`, `solution-sets`,
   `matrix-composition`, `subspaces-rank`, `rank-nullity`, and
   `change-of-basis`. Reuse split screens and ledgers, while keeping the two
   coordinate spaces semantically distinct.
3. **Algorithmic-structure batch:** `bst-lift-from-array` and
   `karatsuba-cross-terms`. Reuse persistent tokens, structural identity, and
   synchronized symbolic/diagram state; do not force a mathematical-grid
   composition onto them.

Each migration remains a separately claimed package. Start with its own
`BeatSpec` and review packet, and choose treatments beat by beat rather than
copying any of these three pilot compositions.
