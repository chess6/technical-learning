# Analysis: Eigenvectors and eigenvalues (3B1B Chapter 14, PFDu9oVAE-g)

Reference-only notes (CC BY-NC-SA 4.0 source; paraphrase, never copy). Source file:
`_2016/eola/chapter10.py` at commit e317d6c5. Focus: composition and object continuity,
mapped against our `/lesson/eigenvectors` (invariant-directions scene + clickable
det(A−λI)=0 derivation scene).

## Starting mental model and central insight

- Assumed model [0:19–1:19]: a matrix IS a linear transformation of the grid (not a
  number table), plus fluency with determinants, linear systems, change of basis. The
  video explicitly blames eigen-confusion on shaky prerequisites, and even flashes
  det(A−λI)=0 early as the "scary thing we will earn" (`StudentsFindThisConfusing`).
- Central insight [1:57–3:22]: most vectors get knocked off their span by a transform;
  eigenvectors are the special ones that stay on their own span, and the eigenvalue is
  the stretch factor along that line. Everything else in the video is a consequence.

## Beat sequence (timestamps + scene classes)

1. [0:19] Prereqs, planted equation — `StudentsFindThisConfusing`, `ManyPrerequisites`
2. [1:19] Example A=[[3,1],[0,2]]; vector knocked off span — `IntroduceExampleTransformation`, `VectorKnockedOffSpan`
3. [1:57] Vectors that stay on span; x-axis ×3, (−1,1)-line ×2 — `VectorRemainsOnSpan`, `IHatAsEigenVector`, `AllXAxisVectorsAreEigenvectors`, `SneakierEigenVector`, `FullSneakyEigenspace`
4. [3:22] Naming + eigenvalue −1/2 — `NameEigenvectorsAndEigenvalues`, `EigenvalueNegativeOneHalf`
5. [4:04] 3D rotation: eigenvector = axis — `EigenvectorToAxisOfRotation`, `ContrastMatrixUnderstandingWithEigenvalue`
6. [5:15] Symbolic: Av=λv → (A−λI)v=0 — `SymbolicEigenvectors`, `NonZeroSolutionsVisually`
7. [7:29] λ-knob until det=0 — `TweakLambda`, `ShowEigenVectorAfterComputing`, `LineOfReasoning`
8. [9:28] Revisit example: charpoly, λ=2,3, eigenline — `RevisitExampleTransformation`
9. [10:46] 90° rotation, λ²+1=0, no real roots — `Rotate90DegreesWithVector`, `SolveRotationEigenvalues`
10. [11:35] Shear (λ=1 only) and 2I (everything eigen) — `ShearExample`, `ScalingExample`
11. [13:03] Diagonal matrices, 100th powers — `BasisVectorsAreEigenvectors`, `DefineDiagonalMatrix`, `RepeatedMultiplicationInAction`, `RepeatedMultilpicationOfMatrices`
12. [14:36] Eigenbasis sandwich, closing puzzle — `ChangeToEigenBasis`

## Persistent objects and identity maintenance (the key dimension)

- **One shared apparatus for the whole video.** `ExampleTranformationScene` is a base
  class fixing `t_matrix = [[3,0],[1,2]]` (i.e. A=[[3,1],[0,2]]) and pinning the matrix
  top-left as a foreground mobject over the grid. Roughly eight scenes across 15 minutes
  inherit it, so the viewer keeps returning to literally the same matrix, grid, and
  eigenlines. Beat 8 (`RevisitExampleTransformation`) and beat 12 (`ChangeToEigenBasis`)
  are payoffs on the identical object introduced at [1:19].
- **Ghost grid.** `LinearTransformationScene` always keeps a faded static copy of the
  plane behind the moving one, so "where things were" is permanently visible. The
  eigenbasis scene adds a grey ghost copy of the skewed grid before transforming it.
- **Span lines as anchors.** Before any transform involving a candidate vector, a long
  maroon line through ±4× the vector is drawn and left static. The vector then moves
  while the line does not — staying-on-span is shown as vector-slides-along-fixed-line.
  Transforms of eigen-scenes pass `path_arc = 0` so eigenvectors slide straight along
  their span instead of arcing (arcing would visually suggest rotation off the line).
- **Vector identity through a transform.** The same Vector mobject is transformed (never
  swapped), keeps its color, and its coordinate label rides along: in
  `SneakierEigenVector` the [−1,1] label moves from the tip to the doubled tip while a
  "2·" prefix fades in — the label is the receipt that this is the same vector, scaled.
- **Numbers migrate between geometry and algebra.** The signature move: coordinate
  labels at vector tips `Transform` into the columns of the pinned matrix
  (`IntroduceExampleTransformation`, `BasisVectorsAreEigenvectors`,
  `ChangeToEigenBasis`). The algebra is never typed fresh; it is assembled from pieces
  the viewer already saw living on the plane.
- **Algebra connected to geometry in the derivation.** Four mechanisms, in order:
  1. `SymbolicEigenvectors`: one equation morphs in place through every rearrangement
     (terms slide with `MoveToTarget`, parentheses appear around persisting glyphs);
     v stays yellow, λ stays maroon, so each step is motion of known symbols.
  2. `NonZeroSolutionsVisually`: the equation (A−λI)v=0 sits as a foreground overlay
     while a rank-1 matrix squishes the plane to a line — det=0 shown as an event.
  3. `TweakLambda`: the strongest linkage. One scalar λ simultaneously drives the
     matrix's diagonal `DecimalNumber`s ("2−0.83"), the grid deformation, the unit
     square, and a live det readout, frame by frame. Algebra and geometry are two
     views of the same parameter, on screen at once (matrix top-left, grid behind).
  4. `RevisitExampleTransformation`: the λ glyph physically flies into both diagonal
     entries; copies of the entries slide out to build (3−λ)(2−λ); after solving, λ=2
     is substituted back in, the plane visibly collapses onto the (−1,1) line under
     A−2I, then the matrix is "un-altered" and A stretches that same line by 2.

## What changes per beat vs the fixed invariant

Per beat, exactly one thing varies: which vector/fan is watched (beats 2–4), which
matrix is used (beats 9–10), or the value of λ (beat 7). The invariants — pinned matrix
with background rectangle, ghost grid, maroon span lines, i-hat/j-hat colors — never
change, so attention lands on the single moving element. The narrated invariant is
always the same sentence rendered geometrically: the line stays; the vector stays on it.

## Color conventions (stable across all 17 minutes)

- i-hat / first column: X_COLOR (green); j-hat / second column: Y_COLOR (red);
  `matrix.set_column_colors(X_COLOR, Y_COLOR)` ties columns to basis vectors.
- λ: MAROON_B everywhere — in equations, in diagonal entries, in "eigenvalue 2" text,
  in the diagonal of the final eigenbasis matrix. One color = one concept.
- Eigenvector v in equations: YELLOW. Eigen-fans: gradients YELLOW→X_COLOR (x-axis) and
  MAROON_B→YELLOW (diagonal line) — gradients let a fan read as many vectors yet one family.
- Span lines: MAROON_B. Non-eigenvector counterexample: PINK vector, faded RED span.
- Every text/matrix over the grid gets a `BackgroundRectangle` — legibility layer that
  also visually marks "algebra plane" vs "geometry plane".

## Camera, framing, pacing

- Fixed camera; no zooms or pans in 2D. Composition is layering (background grid /
  moving grid / vectors / foreground algebra), not camera work.
- Algebra lives at screen edges (matrix top-left; equations bottom-left corner or top),
  geometry owns the center. Both are always co-visible during derivations.
- `self.wait()` after every semantic step; long holds after transforms.
- Explicit "pause and ponder" twice: [9:06] after the det-reasoning chain, and [12:42]
  before the eigenbasis topic (transcript gap 12:44→13:03 is a real silent hold).
- One mini-exercise: "try computing the 100th power of a non-diagonal matrix" [14:25],
  plus a closing on-screen puzzle prompt [16:29].

## Narration↔motion sync

Scene granularity matches sentence clusters: each Scene class covers one narrated idea,
and inside it each `self.play` lands on the phrase naming it ("stretched by a factor of
3" → the fan stretches; "subtract off that right-hand side" → terms slide across the
equals sign). Nothing moves during unrelated narration — waits carry the voice.

## Passive spectacle vs reasoning

The video is mostly guided watching, but reasoning is scaffolded: the equation is shown
early as unexplained (creating a question), the λ-knob invites prediction, the two
pause-and-ponder prompts and the 100th-power dare are the only interaction. There are no
checks that the viewer actually predicted anything — that gap is ours to fill.

## Relevance to our /lesson/eigenvectors

For the invariant-directions scene:
- Draw the span line BEFORE transforming, keep it static, and slide the vector along it
  (no arc) — the invariant must be a visible fixed object, not a claim.
- Show one non-eigenvector in a contrasting color leaving its (faded) span in the same
  frame as eigenvectors staying — the contrast carries the definition.
- Keep a ghost of the pre-transform grid.

For the derivation scene (our 6 beats: recap Av=λv, shift, charpoly, solve λ, solve
eigenspaces, interpret):
- 3b1b's best trick we lack: entries migrate. λ flies into the diagonal; matrix entries
  slide out to become the charpoly; tip coordinates become columns. Our clickable beats
  could morph the persistent equation rather than swapping static formulas.
- The λ-knob (`TweakLambda`) is the strongest algebra↔geometry bridge and is naturally
  interactive: a slider driving diagonal numbers + grid + live det beats any animation.
  The video can only play it; we can hand it to the learner.
- Close the loop like `RevisitExampleTransformation`: after solving λ=2, substitute it
  back, collapse the plane under A−2I (that IS the eigenspace solve), then restore A
  and watch the same line stretch by 2 — our "interpret" beat should replay geometry.
- What our checkpoints do better than the video: the video's pause-and-ponder is
  unverified; our clickable beats can gate on a prediction ("which λ makes det 0?",
  "which line survives A−2I?") before revealing, and can let the learner scrub λ both
  directions, which video pacing forbids.

## What NOT to copy

- Any literal code, LaTeX strings, or rendered frames (CC BY-NC-SA; reference only).
- Pi-creature idioms (`TeacherStudentsScene`, speech bubbles, blinking) — channel
  branding, not pedagogy; our lesson voice replaces them.
- 17-minute linear pacing and long silent holds — our checkpoints replace waits.
- Manim-specific mechanics irrelevant to Motion Canvas: `apply_transposed_matrix`,
  `BackgroundRectangle` hacks, per-frame `self.clear()` redraw in `TweakLambda`,
  transposed-matrix CONFIG conventions.
- The 3D-rotation aside and eigenbasis/diagonalization tail — out of scope for our
  current lesson's two scenes.

## Requirements this suggests for our eigenvector scenes

1. One persistent apparatus: same matrix, grid, and eigenlines across both scenes;
   the derivation scene must reuse the exact objects of the invariant-directions scene.
2. Stable color contract: green/red basis, yellow eigenvector family, one dedicated λ
   color used in equations, matrix diagonal, and value readouts alike.
3. Span lines drawn before transforming, static during it; eigenvectors slide along
   them with straight-line (no-arc) interpolation.
4. Ghost copies of the pre-transform grid (and optionally the pre-transform vector).
5. Algebra and geometry co-visible: equation panel overlaid or beside the plane, never
   on a separate screen, during all six derivation beats.
6. Morph, don't swap: each clickable beat transforms the persistent equation (terms
   slide, λ flies into the diagonal, entries become the charpoly).
7. An interactive λ slider driving diagonal entries, grid deformation, and a live
   det(A−λI) readout together; det=0 moments visibly collapse the plane.
8. Close the loop in the interpret beat: substitute the solved λ, show A−λI collapsing
   onto the eigenline, then restore A stretching that same line by λ.
9. Include one contrasting non-eigenvector that leaves its span, in a reserved color.
10. Replace pause-and-ponder with verified checkpoints: predict-before-reveal questions
    at the det=0 and eigenspace beats.
