# BFS, visualized — Jazon Jiao (mVzsz8Actrc) × manim-js `Graph Algorithms/1_bfs.js`

**Provenance caveat.** This video has no captions and almost no narration. A local Whisper pass
(`.reference-sources/transcripts/mVzsz8Actrc/transcript.json`, provenance `whisper-local`) found only
~4 segments — a spoken outro and noise — so it is a **negative example for narration–motion sync**:
there is no voice to sync to. It is a **positive example** for browser-native animation technique and
for pacing a lesson with on-canvas text plus music instead of narration. Mapping video↔source is
reliable (`1_bfs.js` ↔ "Graph Algorithm 1"). Repo has **no declared license**: reference-only, do not
copy code.

## Starting mental model

Viewer is assumed to know what a graph is (nodes, edges) but not BFS. The video builds the graph
first as a neutral object — 19 blue circles on a fixed triangular lattice, edges growing in — before
any algorithmic meaning is attached. Vertices start *unlabeled* (labels blanked in the `Graph_BFS`
constructor), so numbers can later be assigned in discovery order, which is the pedagogical payload.

## Central insight

BFS is an **expanding frontier**: a wave of "in the queue" (Yellow) vertices growing outward from the
start, each collapsing to "done" (Green) as it is dequeued. Because vertices are numbered at the
moment they are *enqueued*, the final picture doubles as a proof-by-picture that BFS visits
layer-by-layer: numbers increase roughly ring by ring from vertex 0.

## Beat sequence (from the source's timing logic)

All timing is frame counts at `fr = 30` fps (`src/globals.js: frames(sec)`), not wall-clock or audio:

1. **~2.0–4.5 s — graph build.** Nodes and edges get staggered `start` frames
   (`start + frames(1.7) * i / n`), each with its own grow/fade-in (`Circle`, `Line`, `Timer1/2` easing).
2. **~5.0–13.6 s — pseudocode write-in.** A `Tracer` types the title and five pseudocode lines one
   character per frame; each line starts `str.length + 17` frames after the previous — display time is
   proportional to reading length. This is the channel's substitute for narration pacing.
3. **~15.6 s onward — the trace.** `Graph_BFS.show()` runs a state machine gated by
   `fc % this.f === 0 && fc > begin` with `this.f = 52` frames: one algorithm micro-step every ~1.73 s.
   States: 0 init-enqueue → (1 dequeue-highlight → 2 expand-neighbors)* → 4 restart-on-new-component
   (edges are randomized per run, so the graph may be disconnected) → 3 end. See `scene-map.json`.

The uniform 52-frame metronome is the whole pacing model: slow enough to read, fast enough that the
music carries you. There is no per-beat authored timing beyond that constant.

## Persistent objects (vs our Motion Canvas signals)

`Node`, `Edge`, `TextFade`, `Tracer` are **long-lived JS objects created once in `setup()`** whose
`show()` is called every frame. Animated properties are not tweened externally; each object owns
small "changer" state machines — `FillChanger`/`StrokeChanger` for color, `Timer0/1/2` easing timers
for motion, `highlight()` setting a per-object countdown. Calling `reColor(Green)` on a node is
morally identical to setting a Motion Canvas signal: the object interpolates itself over subsequent
frames. The difference is that here every object must *manually* re-render and advance its own timers
inside the p5 `draw()` loop, whereas Motion Canvas's retained scene graph plus signals give
interpolation, dependency propagation, and redraw for free.

## What changes per phase vs what is invariant

- **Changes:** node fill/ring color (Blue→Yellow→Green), BFS-order number text fading in, transient
  Orange highlights (arc sweep on nodes, line sweep on edges), Tracer arrow position.
- **Invariant:** vertex positions never move; edges never disappear; the pseudocode never changes;
  `visited` only grows; queue indices `bottom`/`top` only increase (strict FIFO discipline); a Green
  vertex is never touched again. The stable geometry means all attention lands on color/number deltas.

## Color and emphasis

Tiny fixed palette (`src/globals.js`): Blue = undiscovered, Yellow = in queue (frontier), Green =
done, Orange = *transient* action (current dequeue, edge being relaxed), Yellow text = title. Color
encodes **algorithm state**, orange encodes **the current action** — state is persistent, action is a
~1–2 s pulse that fades (`fadeOut(0.27)` before the highlight ends). Neighbor numbers pop in staggered
4 frames apart, a cheap but effective "one at a time" emphasis.

## On-screen text instead of narration; passive vs active

The pseudocode panel *is* the narrator: the Tracer arrow re-points to the active line at every state
change, so text and motion are synchronized by construction (same `if (state === k)` branch mutates
both). Write-in speed proportional to string length approximates reading speed. The video is fully
**passive** — no interaction, no pauses, no questions; the fixed 52-frame cadence cannot adapt to a
confused viewer. That is precisely the gap our interactive textbook fills.

## Browser-native architecture lessons

- p5 is **immediate mode**: `draw()` clears to black and every object repaints and re-advances its
  timers each frame. Scene = one `p5` sketch closure (`Graph01`); `graph.html` is a bare shell that
  swaps in one "chapter" script per video (it currently points at `3_kruskal.js` — one shell, N scenes).
- Scheduling is **frame arithmetic**: `start` frames per object, `frameCount` comparisons, a modulo
  metronome. There is no timeline abstraction, no seeking, no ability to jump to a beat — you replay
  from frame 0. Motion Canvas's generator timelines (`yield*`, `waitFor`, `all`) give us seekable,
  composable time; manim-js shows how much bookkeeping that saves (hand-maintained `fc`, `f`,
  per-object `h_fr` countdowns, off-by-easing hacks in `Timer1`).
- The good bones to keep: algorithm state machine *separate from* rendering primitives; graph as
  adjacency matrix + parallel `nodes[]`/`edges[][]` arrays so the algorithm indexes visuals directly;
  the both-directions duplicate `Edge` trick in `Graph_U` so `edges[u][v].highlight()` works either way.

## What suits our interactive textbook

- Blue/Yellow/Green/Orange state-vs-action color grammar for BFS/DFS/Dijkstra scenes.
- Pseudocode panel with a moving pointer driven by the same state transition that mutates the graph.
- Numbering vertices at enqueue time — the residue of the animation is a static, checkable artifact.
- Fixed vertex geometry; only color/labels change — ideal for step-forward/back interactive controls.
- The state-machine step (`state 1` = dequeue, `state 2` = expand) maps one-to-one onto "Next" button
  clicks in an interactive scene.

## What NOT to copy

- **Code itself**: no declared license — reimplement in our own Motion Canvas idiom, reference-only.
- **Immediate-mode idioms**: hand-rolled easing timers, `frameCount` gating, per-object `show()`
  bookkeeping — Motion Canvas signals/timelines replace all of it.
- **Silent-video pacing**: the constant 52-frame metronome and character-per-frame write-in exist
  because there is no narration and no interactivity; our scenes should pace on narration beats or
  user input, not a fixed clock.
- **Randomized input** (`randomizeEdges`) for a canonical lesson — non-reproducible runs make the
  video and any text about it drift apart; fix the graph instance.

## Lessons for browser-native guided scenes

1. Keep vertices geometrically frozen; animate only color, labels, and transient highlights — deltas
   read instantly against a stable layout.
2. Separate persistent *state* colors from transient *action* pulses (pulse fades out; state stays).
3. Drive the pseudocode pointer and the canvas mutation from the same state transition so they can
   never desynchronize.
4. Make discovery order leave a permanent residue (numbers) so the finished frame is itself a summary.
5. Model the algorithm as an explicit small state machine; in Motion Canvas each state becomes a
   generator step, and interactively each becomes one "Next" click.
6. Stagger sibling animations by a few frames (neighbors popping in sequence) instead of firing them
   simultaneously.
7. Let text length set text display time when there is no narration — but prefer narration or user
   pacing when we have them.
8. Use a retained scene graph + signals (Motion Canvas) rather than re-implementing per-object timers
   and redraw; keep manim-js only as a map of *what* to animate, not *how*.
