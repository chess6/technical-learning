---
name: Eigen clip modal and 3D extension
overview: "For the two Lesson 4 eigenvector clips only: add a click-to-expand modal (enlarged clip + derivation-step sidebar) and a genuine 3D extension framed as a conceptual generalization beyond the 2D derivation - not an interchangeable rendering of the same example. Backed by one curated, test-verified 3x3 example, minimal 3x3 math, a lazy-loaded react-three-fiber scene, semantic (major-step) synchronization, and a strict single-renderer lifecycle."
todos:
  - id: math3d
    content: Add minimal tested 3x3 math (Matrix3x3, Vector3, matrixVectorMultiply3, determinant3x3, matrixShift3, verifiesEigenpair3, eigendirection-via-nullspace, rank/nullspace helper) + ONE curated example; tests assert Av≈λv, det(A−λI)≈0, safe-normalized eigendirection, collapse dimension matches rank, and the curated characteristic polynomial factors as (t−1.5)(t²+1.5t+2.25) with negative quadratic discriminant (exactly one real eigenvalue)
    status: completed
  - id: deps
    content: Add three, @react-three/fiber (v9), @react-three/drei as lazy-only deps (never in home/non-eigen bundles)
    status: completed
  - id: three-scene
    content: "Build Eigen3DExtension: primary invariant-line state (ordinary vectors turn, one highlighted invariant line, v and Av collinear, camera proves spatiality); optional second A−λI collapse state matching curated rank; constrained OrbitControls + Reset view; reduced-motion aware"
    status: completed
  - id: semantic-sync
    content: Introduce ClipPosition { majorStepId; localProgress? } and backward-compatible semantic callbacks on GuidedScenePlayer; sync by majorStepId, never raw progress across scenes
    status: completed
  - id: steps-data
    content: Add derivationSteps.ts keyed by semantic step IDs aligned to existing majorSteps; mark which steps have a meaningful 3D interpretation
    status: completed
  - id: lifecycle
    content: "Enforce single-renderer invariant: unmount/dispose inline renderer when modal opens, mount enlarged at same ClipPosition, dispose on close/switch/navigate; applies to Motion Canvas engines and R3F WebGL contexts"
    status: completed
  - id: clip-modal
    content: "Build EigenClipModal: enlarged active viz + derivation-step sidebar (when data exists) + active-step highlight + caption + close/Escape/backdrop + focus trap & restore + responsive stacking"
    status: completed
  - id: clip-stage
    content: Build EigenClipStage with '2D derivation' / 'See it in 3D' labeling (no bare 2D/3D equivalence), expand control, and loading / WebGL-unavailable / retry / static-2D fallbacks
    status: completed
  - id: wire
    content: Wire EigenClipStage into the TWO Lesson 4 eigen sites only (Watch visualization for the eigenvectors lesson + the eigen derivation worked example); leave all other lessons on plain GuidedScenePlayer
    status: completed
  - id: tests-docs-bundle
    content: Add math + component + e2e tests (semantic step preserved, one renderer, no leaked engines/canvases/WebGL, Reset view, reduced-motion, WebGL fallback, non-eigen routes load no three); update LESSON_DESIGN/MATH_CORRECTNESS/CHECKLIST; measure and report lazy chunk size
    status: completed
isProject: false
---

# Eigen clip modal + 3D extension (Lesson 4 only)

## Core reframing
The 3D view is **not** an interchangeable rendering of the same 2D derivation. The 2D lesson uses a specific 2×2 worked example and computation flow; the 3D view necessarily uses a **different 3×3 example**. Frame it as two distinct things:

- **2D derivation** - the primary computational lesson (stays on `GuidedScenePlayer`).
- **3D extension** - a conceptual generalization beyond the plane.

Learner-facing language: "2D derivation", "See it in 3D", "3D extension". No bare "2D / 3D" toggle that implies equivalence of matrix, equations, vectors, or timeline. Switching modes does **not** preserve the exact matrix/equations/vectors/timeline; it preserves the **conceptual step**.

## Pedagogical objective
The first 3D visualization has exactly one objective:

> In three dimensions, an eigendirection is still a line that maps onto itself.

Initial 3D scene shows only:
1. several ordinary vectors whose directions change;
2. one clearly highlighted invariant line;
3. a vector `v` and its image `Av` remaining collinear;
4. camera rotation demonstrating the invariant line is genuinely spatial, not a 2D-projection artifact.

Explicitly NOT in the initial scene: many examples, several matrices, a dense fan, multiple eigenspaces, volume collapse, derivation algebra, or unrestricted camera exploration.

A **second, optional** 3D state may illustrate the `A−λI` derivation idea - but only after the invariant-line concept is clear.

## Chosen 3×3 example and justification
**A = 1.5 · P**, where **P** is the cyclic-permutation matrix (a 120° rotation about the main diagonal):

```
P = [ 0 0 1 ]        A = 1.5·P = [ 0   0   1.5 ]
    [ 1 0 0 ]                    [ 1.5 0   0   ]
    [ 0 1 0 ]                    [ 0   1.5 0   ]
```

- **Single, clean real eigendirection:** `P` has eigenvalues `{1, e^{±2πi/3}}`, so `A` has real eigenvalue `λ = 1.5` (simple) with eigendirection along **n = (1,1,1)/√3**, plus a genuine complex-conjugate pair. No repeated real eigenspace to explain. This is pinned down exactly by the characteristic polynomial `χ_A(t) = (t − 1.5)(t² + 1.5t + 2.25)`, whose quadratic factor has discriminant `1.5² − 4(2.25) = −6.75 < 0` - so `λ = 1.5` is the **only** real eigenvalue and the scene must expose exactly one real eigendirection.
- **Oblique axis, not a coordinate axis:** the invariant line is the main diagonal - clearly spatial.
- **Visible turning + collinearity (single application):** applying `A` once rotates a generic vector by `120°` around the invariant axis and scales it by `1.5` (e.g. `A(1,0,0) = (0,1.5,0)`), while `A·(1,1,1) = 1.5·(1,1,1)` stays collinear and visibly 1.5× longer - a strong `Av = λv` demonstration with `λ ≠ 1`. (An outward *spiral* around the axis only appears under *repeated* application `x, Ax, A²x, …`; see wording note below. The initial scene need not animate repeated iteration unless it directly serves the stated objective - do not add repeated dynamics merely to justify the word "spiral".)
- **Numerically stable & exact:** integer `P` scaled by 1.5 - trivial to author as data and verify.
- **Well-defined collapse for the optional state:** `A − λI = 1.5(P − I)` has rank 2 (nullspace = the eigenline), so the transformed unit cube collapses **to a plane** (not a line or the origin). The caption for this specific example must say "to a plane".

**Geometry wording (single vs. repeated application) - use precisely in captions and code comments:**
- **Single application:** an ordinary vector *rotates 120° around the invariant axis and scales outward by 1.5*. Do not call this a "spiral".
- **Repeated applications** (`x, Ax, A²x, A³x, …`): the successive images *trace an outward spiral around the invariant axis*.

Document this justification in code comments and `MATH_CORRECTNESS.md`.

## Mathematical precision (derivation variant wording)
For the optional `A−λI` state, state precisely:

> Under the auxiliary transformation `A − λI`, at least one nonzero direction is sent to zero. The transformed unit cube therefore has zero volume, so `det(A − λI) = 0`.

Do **not** imply `A` itself crushes the eigenvector. Do **not** hardcode "collapses to a plane" as a general truth - the collapse dimension depends on rank (plane / line / origin). For the chosen example it is a **plane** (rank 2), and the visual + caption must match the curated matrix; a test asserts the claimed collapse dimension equals the actual rank/nullspace structure.

## Minimal 3×3 math (source of truth, tested)
Add only what the chosen scene needs (no cubic solver, no broad 3D curriculum):
- New [`src/math/matrices3.ts`](src/math/matrices3.ts): `Matrix3x3`, `Vector3`, `matrixVectorMultiply3`, `determinant3x3`, `matrixShift3` (`A−λI`), and a minimal `rank3x3` / nullspace-dimension helper (for collapse-type verification).
- New [`src/math/eigen3.ts`](src/math/eigen3.ts): `eigenDirectionForEigenvalue3` (safe-normalized nullspace direction of `A−λI` for a declared λ) and `verifiesEigenpair3`.
- New [`src/math/examples3.ts`](src/math/examples3.ts): the **single** curated example above, authored as data with declared real eigenvalue + eigendirection + expected collapse dimension + its known characteristic-polynomial factorization `χ_A(t) = (t − 1.5)(t² + 1.5t + 2.25)` (the quadratic factor's coefficients recorded as data so the "one real eigenvalue" test is curated and example-specific, not a general solver).
- Export from [`src/math/index.ts`](src/math/index.ts).
- New [`src/math/__tests__/eigen3.test.ts`](src/math/__tests__/eigen3.test.ts) - assert, for the curated example:
  - `Av ≈ λv` for the declared eigenpair;
  - `det(A − λI) ≈ 0`;
  - eigendirection nonzero and safely normalized;
  - claimed collapse dimension matches the actual rank/nullspace;
  - **exactly one real eigenvalue**, verified via the curated characteristic polynomial: `A` satisfies `χ_A` (e.g. `(A − 1.5I)(A² + 1.5A + 2.25I) ≈ 0`, or expand `χ_A(t) = det(A − tI)` at sample `t` and match the declared factorization), and the recorded quadratic factor has discriminant `1.5² − 4(2.25) = −6.75 < 0` - so no second/third real eigendirection may be invented.

Do not add a general cubic eigenvalue solver, and do not add more examples until this one proves its pedagogical value.

## 3D extension scene
- New [`src/components/lesson/threeD/Eigen3DExtension.tsx`](src/components/lesson/threeD/Eigen3DExtension.tsx) (react-three-fiber), driven entirely by the `src/math` 3×3 helpers + curated example (no LA reimplemented in render code).
- **State 1 (default):** a few ordinary vectors and their `Av` images - each rotated 120° around the invariant axis and scaled by 1.5 under a **single** application (not a spiral; captions/comments must follow the geometry-wording note above) - one highlighted invariant line through the origin, and `v`/`Av` collinear along it. Camera rotation proves spatiality.
- **State 2 (optional):** the `A−λI` unit-cube collapse to a plane (matching the curated rank), with the precise caption above. Reachable only after State 1.
- Consumes a `ClipPosition` (see below) and renders the nearest meaningful 3D state; steps with no 3D analog show the nearest state, labeled honestly.

## Semantic step synchronization
Introduce a semantic position contract - never sync by raw timeline percentage across different scenes:

```ts
type ClipPosition = {
  majorStepId: string;
  localProgress?: number; // optional, within-step only
};
```

- `majorStepId` is the primary synchronization key.
- Opening the modal preserves the current conceptual step; closing restores it.
- Switching 2D derivation → 3D extension maps to the corresponding conceptual state; if no 3D equivalent exists, show the nearest meaningful 3D state and label it honestly.
- Extend [`GuidedScenePlayer.tsx`](src/components/lesson/GuidedScenePlayer.tsx) with optional, **backward-compatible** semantic callbacks/props (`onClipPositionChange`, and seek-to-`majorStepId` via an initial `ClipPosition`). Existing behavior unchanged when omitted. `majorStepId` values reuse the existing `majorSteps` ids.

## Single-renderer lifecycle
Invariant: **at most one renderer for a given clip is mounted and active at any time** (both Motion Canvas engines and R3F WebGL contexts).
- Opening the modal: unmount/dispose the inline renderer, then mount the enlarged renderer at the same `ClipPosition`. The hidden inline player must not keep animating (no paused-but-live RAF).
- Closing: dispose the modal renderer; remount the inline renderer at the corresponding `ClipPosition`.
- Same discipline on 2D↔3D switch and route navigation.
- Tests exercise repeated open/close, 2D/3D switch, route navigation, Replay, and modal-close-during-animation, asserting no leaked animation engines, RAF loops, event listeners, canvases, or WebGL contexts.

## Modal behavior (Lesson 4 clips only)
- New [`src/components/lesson/EigenClipModal.tsx`](src/components/lesson/EigenClipModal.tsx) via `createPortal` (`role="dialog"`, `aria-modal`). Includes: enlarged active visualization; derivation-step sidebar **only when step data exists**; active-step highlight; concise current caption; close button; Escape close; backdrop close; focus trap / robust focus containment; focus restoration to the invoking button; responsive stacking on narrow screens.

## Camera constraints
Constrained `OrbitControls`: rotation enabled; pan disabled; bounded zoom (min/max distance); fixed target at the origin; bounded polar angle; no auto-rotation by default; a deliberate oblique initial angle; a visible "Reset view" control; reduced-motion disables any nonessential camera motion. Purpose is verifying spatial invariance - not a general-purpose 3D viewer.

## Lazy loading and fallback
- Lazy-load `three`, `@react-three/fiber`, `@react-three/drei`, and `Eigen3DExtension` (React 19 / R3F v9). The home page and non-eigen lessons must not fetch the 3D chunk.
- Provide: a learner-facing loading state; a graceful WebGL-unavailable fallback; a retry path for failed lazy import or scene init; and a static 2D fallback link/message when 3D cannot run.

## Component structure
Concrete, non-generalized components (prove the pattern in Lesson 4 before any app-wide abstraction):
- [`EigenClipStage`](src/components/lesson/EigenClipStage.tsx) - owns mode (`derivation` / `extension`), expand state, "2D derivation" / "See it in 3D" controls, and fallbacks. Uses the "See it in 3D" / "3D extension" language, never a bare equivalence toggle.
- [`EigenClipModal`](src/components/lesson/EigenClipModal.tsx)
- [`Eigen3DExtension`](src/components/lesson/threeD/Eigen3DExtension.tsx)
- [`derivationSteps.ts`](src/guided-scenes/scenes/derivationSteps.ts)

`GuidedScenePlayer` remains the primary computational (2D) renderer. Extract shared behavior only where obviously reusable.

## Derivation steps
Ordered data, aligned to existing major-step ids, referenced by **semantic id** (not array index alone):
`Av = λv` → `(A−λI)v = 0` → `det(A−λI) = 0` → `solve λ` → `solve v` → `interpret`.
Rendered with existing KaTeX (`ProseWithMath` / `EquationBlock`). The 3D extension maps only the steps with a meaningful 3D interpretation (invariant line for `Av = λv`; cube-collapse for `(A−λI)v = 0` / `det(A−λI) = 0`); other steps fall back to the nearest labeled 3D state.

## Wiring limited to Lesson 4
- [`LessonPage.tsx`](src/pages/LessonPage.tsx): use `EigenClipStage` for the `visualization` slot **only for the eigenvectors lesson**; all other lessons keep the plain `GuidedScenePlayer`.
- [`WorkedExamplePanel.tsx`](src/components/lesson/WorkedExamplePanel.tsx): use `EigenClipStage` **only for the eigen derivation worked example** (gate on a threeD/steps config); other worked examples stay on `GuidedScenePlayer`.
- Do not add Expand controls to all lessons yet.

## Tests
- **Math:** curated example `Av ≈ λv`; `det(A−λI) ≈ 0`; eigendirection nonzero and safely normalized; claimed collapse type matches rank/nullspace; **exactly one real eigenvalue** proven via the curated characteristic polynomial `(t−1.5)(t²+1.5t+2.25)` and its negative quadratic discriminant (`−6.75`) - not via the nullspace helper merely failing to find more directions - so no fabricated real eigendirections.
- **Components:** "See it in 3D" opens the 3D extension; labeling clearly distinguishes derivation vs extension; modal open/close; Escape + backdrop close; focus returns to invoker; semantic `majorStepId` preserved across open/close and 2D↔3D; only one renderer mounted; Reset view works; reduced-motion respected; WebGL-unavailable fallback appears.
- **E2E** (extend [`e2e/lesson-eigenvectors.spec.ts`](e2e/lesson-eigenvectors.spec.ts)): repeated cycles of open modal → switch to 3D → rotate camera → reset → close → reopen → navigate away → back. Assert no console errors; no stale/duplicate canvas; no leaked Motion Canvas engine or three.js renderer; correct active derivation-step highlight; and that non-eigen routes load no three.js chunk.

## Documentation
- [`docs/LESSON_DESIGN.md`](docs/LESSON_DESIGN.md): the distinction between the primary derivation and the optional dimensional extension (and the "See it in 3D" framing).
- [`docs/MATH_CORRECTNESS.md`](docs/MATH_CORRECTNESS.md): curated 3×3 example rules and rank/volume-collapse wording; document the chosen matrix and why.
- [`docs/LESSON_CORRECTNESS_CHECKLIST.md`](docs/LESSON_CORRECTNESS_CHECKLIST.md): 3D objective named; 2D/3D non-equivalence explicit; semantic synchronization verified; one-renderer lifecycle verified; WebGL fallback verified.

## Bundle-size measurement
After `npm run build`, measure and report the added lazy 3D chunk size, and confirm it is absent from the home/non-eigen entry chunks.

## Risks and explicit non-goals
Risks: R3F v9 / React 19 interop; WebGL context loss/leaks across open/close cycles; caption drift from the actual matrix rank; bundle bloat if three.js leaks into shared chunks. Each has a mitigation above (lifecycle tests, rank-matched captions, lazy-chunk assertion).

**Non-goals (do NOT):** build a general 3D math engine; add a cubic eigenvalue solver; add 3D to every lesson; treat 2D and 3D as the same example; mount two renderers at once; add unrestricted scene navigation; make the 3D view the primary computation lesson; or generalize the modal application-wide before Lesson 4 proves the pattern.
