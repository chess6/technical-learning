# ADR 001 — Motion Canvas as the guided-animation runtime

- **Status:** Accepted (M2 spike, still in force)
- **Deciders:** project author
- **Full spike report:** [../../archive/experiments/motion-canvas-spike.md](../../archive/experiments/motion-canvas-spike.md)

## Context

Guided lessons need authored, read-only conceptual animation with programmatic
play / pause / reset / seek and no leaked resources across route navigation. The
project toolchain is on Vite 8. `@motion-canvas/vite-plugin` declares a `vite@4||5`
peer dependency, so the plugin's intended `?scene` import path is unavailable.

## Decision

Use **Motion Canvas** as the active guided backend, embedded **plugin-free** behind
a `GuidedSceneEngine` interface:

- Scenes are authored with the public `makeScene2D(function* (view) {…})` API and
  built **programmatically** (no JSX, avoiding `jsxImportSource` conflicts with
  React).
- `MotionCanvasEngine` promotes a scene to a project via `bootstrap(...)`,
  constructs a `Player` + `Stage`, appends `stage.finalBuffer`, and drives
  `stage.render` from `player.onRender`.
- React never touches Motion Canvas: lessons pass a `guidedSceneId`; controls map
  to the documented `Player` API. Progress is throttled (~80 ms); only structural
  state changes notify immediately.
- A minimal, interface-complete `SvgFallbackEngine` remains. Switching the single
  `ACTIVE_BACKEND` constant in `src/guided-scenes/engine/index.ts` is the only
  change needed to fall back, because all consumers depend solely on the interface.

## Constraints / consequences

- **Two `@internal` APIs** (`bootstrap`, `new MetaFile(name, false)`) are used for
  *construction only*, isolated to one factory. A Motion Canvas upgrade could
  change their signatures; the version constant is centralized to contain drift.
- **No Vite plugin** ⇒ no `?scene` HMR or asset pipeline. Current lessons do not
  need it; adopting it later would require reconciling Vite versions.
- **Scenes are built programmatically** (no JSX); M4+ lesson scenes follow suit.
- **Bundle size:** Motion Canvas adds ~200 KB gzip; M6 code-splits the guided
  engine behind a dynamic import so it never loads on the home page.
- **Lifecycle:** `dispose()` is idempotent and verified by dev instrumentation
  (`window.__guidedSceneDebug`) — exactly one active engine per lesson page, zero
  after leaving, counters return to zero across repeated navigation.

## Where the implementation lives

- `src/guided-scenes/engine/` — `GuidedSceneEngine`, `MotionCanvasEngine`,
  `SvgFallbackEngine`, `instrumentation.ts`, `ACTIVE_BACKEND`.
- `src/guided-scenes/scenes/` — scene modules, `sceneMeta.ts`, `sceneTimings.ts`,
  `sceneDescriptions.ts`, `safeFrame.ts`, `sceneKit.ts`.
