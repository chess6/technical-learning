# Motion Canvas Embedding Spike (M2)

## Result: PASS

Motion Canvas embeds cleanly inside the React SPA with full programmatic
control and no leaked resources across repeated navigation. Motion Canvas is the
active guided-animation backend. The SVG fallback is implemented and
interface-complete but not used.

## Packages installed

| Package | Version | Notes |
| --- | --- | --- |
| `@motion-canvas/core` | 3.17.2 | `Player`, `Stage`, `bootstrap`, `MetaFile`, signals, flow |
| `@motion-canvas/2d` | 3.17.2 | `makeScene2D`, `Grid`, `Line`, `Node` |
| `@motion-canvas/player` | 3.17.2 | Reference only; not used at runtime (see below) |
| `@motion-canvas/vite-plugin` | (not installed) | Peer-conflicts with Vite 8; see risk |

Vite in this project is `8.x`. `@motion-canvas/vite-plugin@3.17.2` declares a
peer dependency of `vite@"4.x || 5.x"`, so it was intentionally **not**
installed.

## Integration path used

Plugin-free runtime construction with a wrapped `Player` + `Stage`, hidden behind
the `GuidedSceneEngine` interface.

- A scene is authored with the documented `makeScene2D(function* (view) { ... })`
  API and built programmatically (no JSX, so no `jsxImportSource` coupling):
  `src/guided-scenes/scenes/transformSpikeScene.ts`.
- At mount, `MotionCanvasEngine`:
  1. promotes the scene description to a project via `bootstrap(...)`,
  2. constructs a `Player(project)` (this activates the update loop),
  3. constructs a `Stage`, appends `stage.finalBuffer` (a `<canvas>`) to the
     container,
  4. subscribes `player.onRender` → `stage.render(currentScene, previousScene)`
     (mirrors the official player element),
  5. subscribes `onFrameChanged` / `onDurationChanged` / `onStateChanged` to
     derive normalized state.
- Controls map to the documented `Player` API: `togglePlayback`,
  `requestReset`, `requestSeek`, `activate` / `deactivate`.

The two other candidate paths were rejected:

- **Vite plugin + `?scene`** — the intended path, but blocked by the Vite 4/5
  peer constraint against our Vite 8 toolchain.
- **`@motion-canvas/player` custom element** — requires a separately compiled
  `project.js` bundle and exposes only `src`/`auto`/`quality` attributes, i.e.
  no reliable programmatic play/pause/reset/seek or instrumentation.

## Use of undocumented APIs

Plugin-free embedding requires two `@internal` APIs, used only for
*construction* (never for lifecycle instrumentation):

- `bootstrap(name, versions, plugins, config, metaFile, settingsFile)` — assembles
  a `Project` + metadata. This is exactly what the Vite plugin generates in the
  compiled `project.js`.
- `new MetaFile(name, false)` — the meta bridge `bootstrap` expects; the `false`
  source disables any file/HMR linkage.

Everything else (`makeScene2D`, `makeProject` shape, `Player`, `Stage`, signals,
flow, tweening) is public. The remaining `FullSceneDescription` runtime fields
(`playback`, `logger`, `size`, `timeEventsClass`, `sharedWebGLContext`,
`experimentalFeatures`) are supplied by the `Player` constructor itself, so we do
not reconstruct them by hand.

## Scrub reliability

Reliable. `player.requestSeek(frame)` maps directly to a normalized 0..1
scrubber and to discrete step buttons. `canSeek` is `true`. Both the range
scrubber and step-based seek were validated in the browser.

## Lifecycle and cleanup behavior

- `GuidedScenePlayer` is engine-agnostic: it mounts the injected engine into a
  container ref, subscribes to discrete state, and on cleanup unsubscribes then
  calls `engine.dispose()`.
- `dispose()` is idempotent and: pauses playback, calls `player.deactivate()`
  (stops the update loop), unsubscribes every Motion Canvas subscription,
  disconnects the `ResizeObserver`, and removes the canvas from the DOM.
- The scene changes trigger dispose + recreate via both a stable factory keyed on
  `guidedSceneId` and a component `key` that includes the lesson id and reset
  token (plan correction #1).
- React state is never updated per animation frame: progress notifications are
  throttled (~80 ms) in `AbstractGuidedSceneEngine`; only structural changes
  (status/step/duration/error) notify immediately.

## Instrumentation (development-only)

`src/guided-scenes/engine/instrumentation.ts` tracks resources owned by our
integration layer and is exposed as `window.__guidedSceneDebug` in dev:

- `created`, `activeEngines`, `mounts`, `disposals`
- `activeLoops` (Motion Canvas players / rAF loops)
- `activeResources` (our Motion Canvas subscriptions + `ResizeObserver`)
- `activeSubscribers` (`engine.subscribe` listeners)

### Measured results (Playwright, dev server, StrictMode on)

- Exactly **1** active engine while a lesson page is mounted.
- **0** active engines after navigating to a page without a scene.
- Repeated navigation (4 cycles across two lessons + home) never exceeds 1
  active engine; `activeLoops`, `activeResources`, `activeSubscribers` all return
  to 0; `disposals >= mounts`.
- No critical browser console errors (asserted `=== []`).

## Acceptance checklist

| Requirement | Status |
| --- | --- |
| Renders inside the existing lesson page | PASS |
| Play | PASS |
| Pause | PASS |
| Reset returns to initial state | PASS |
| Reliable seek/scrub | PASS (`canSeek = true`) |
| Resizes with the container | PASS |
| Route navigation disposes the engine | PASS (activeEngines → 0) |
| Returning remounts correctly | PASS |
| resetToken remount | PASS (component key) |
| No duplicate animation loops | PASS (activeLoops ≤ 1) |
| No lingering observers/listeners/RAF/player | PASS (counters → 0) |
| No critical console errors | PASS |
| Exactly one active engine on a lesson page | PASS |
| Zero active engines after leaving | PASS |
| Repeated navigation does not grow counts | PASS |
| Every mounted engine eventually disposed | PASS (disposals ≥ mounts) |

## Fallback decision

Motion Canvas is retained as the active backend (`ACTIVE_BACKEND =
"motion-canvas"` in `src/guided-scenes/engine/index.ts`). The
`SvgFallbackEngine` remains minimal and interface-complete; switching the single
`ACTIVE_BACKEND` constant is the only change required to fall back, because all
consumers depend solely on the `GuidedSceneEngine` interface.

## Known risks before M4

- **Vite version divergence**: we deliberately avoid `@motion-canvas/vite-plugin`
  (Vite 4/5 peer). If a future need requires the plugin (e.g. asset pipelines,
  `?scene` HMR), we would need to reconcile Vite versions. Current lessons do not
  need it.
- **Internal API drift**: `bootstrap` / `MetaFile` are `@internal`. A Motion
  Canvas upgrade could change their signatures. Mitigation: usage is isolated to
  `buildSpikeProject()` in one file, and the `MC_VERSION`/`Versions` constant is
  centralized.
- **No JSX in scenes**: scenes are built programmatically. This is a deliberate
  trade-off to avoid `jsxImportSource` conflicts with React JSX; lesson scenes in
  M4/M5 will follow the same programmatic style.
- **WebGL context per engine**: each `Player` creates a `SharedWebGLContext`.
  Disposal calls `deactivate()` and drops references; browsers reclaim contexts,
  but many rapid mount/dispose cycles should continue to be watched via the
  instrumentation counters.
- **Bundle size**: Motion Canvas adds ~200 KB gzip to the main chunk. M6 can
  code-split the guided engine behind a dynamic import if needed.
