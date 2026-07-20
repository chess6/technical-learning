# M6 — Production polish, performance, accessibility, release readiness

Scope: make the completed four-lesson POC (Vectors, Transformations,
Determinants, Eigenvectors) feel like a coherent, deployable product, without
new lessons, new features, or a second visual system.

## 1. Baseline (before)

`npm run build` (single entry, no code splitting):

| Asset | Size | Gzip |
| --- | --- | --- |
| `index-*.js` (everything: React, router, Motion Canvas, Mafs, KaTeX, all 4 lessons/scenes/explorers) | 1,149.34 kB | 348.28 kB |
| `index-*.css` | 67.14 kB | 15.48 kB |

- One JS chunk for the entire app — the home page paid for Motion Canvas,
  Mafs, KaTeX, and every lesson's scene/explorer code before showing anything.
- `npm run test`: 21 files / 125 tests passed. `npm run lint`: clean.
- Route table statically imported `LessonPage`, `DevMafsDemoPage`, and
  `DevTransformSpikePage` — dev routes shipped in the production bundle and
  the home page carried a raw, unconditional `/dev/mafs-demo` link.
- Home page: a plain title + ordered link list; no lesson-sequence framing,
  no primary call-to-action, no visual preview of what a lesson contains.
- No error boundaries anywhere; a scene/explorer failure had no recovery UI.

## 2. Code splitting (after)

Approach (see `src/app/routes.tsx`, `src/app/LazyLessonRoute.tsx`,
`src/guided-scenes/scenes/sceneDescriptions.ts`,
`src/explorations/registry.tsx`):

- `LessonPage` is `React.lazy`-loaded per route, behind a `Suspense` boundary
  with a `LessonLoading` skeleton that reserves the lesson's approximate
  height (title bar + canvas-sized block) to avoid layout shift.
- Each **guided scene module** is now loaded via a per-id dynamic `import()`
  in `sceneDescriptions.ts` (previously a static import of all five scene
  modules). `MotionCanvasEngine.mount()` awaits the load and turns a failed
  import into the engine's existing `error` state (learner-facing, with
  retry) instead of an unhandled rejection. Unknown scene ids still throw
  **synchronously**, before any import, via `hasGuidedScene` (which has no
  Motion Canvas dependency) — the "no silent fallback" guarantee is preserved.
- Each **explorer** (`LinearCombinationExplorer`, `MatrixTransformationExplorer`,
  `DeterminantExplorer`, `EigenvectorExplorer`) is `React.lazy`-loaded from
  `explorations/registry.tsx`, wrapped in its own `Suspense` (`ExplorerLoading`
  placeholder, reserved min-height) and `ErrorBoundary`.
- Net effect: Motion Canvas, Mafs, and KaTeX are no longer part of the
  home-page bundle at all, and opening one lesson does not fetch another
  lesson's scene/explorer code.

### Bundle sizes (after)

Initial load for `/` (confirmed via `dist/index.html`'s `<script>`/
`modulepreload` tags — only these are fetched before any navigation):

| Asset | Size | Gzip |
| --- | --- | --- |
| `index-*.js` (React, router, AppShell, CourseSidebar, HomePage, math/exampleData) | 299.21 kB | 95.12 kB |
| `index-*.css` | 13.93 kB | 3.37 kB |
| `rolldown-runtime`, `jsx-runtime`, `math`, `exampleData` (modulepreloaded) | ~9.7 kB | ~4.3 kB |

**Initial JS+CSS gzip: ~348 kB → ~103 kB (≈ 70% reduction).**

Largest chunks that remain, and why they're fine where they are:

- `PresetPicker-*.js` (310.80 kB / 93.68 kB gzip) — this is the shared **Mafs**
  runtime chunk. Fetched once, only when a learner opens the first exploration
  panel; shared by all four explorers afterward.
- `ProseWithMath-*.js` (260.96 kB / 78.24 kB gzip) — the **KaTeX** runtime,
  fetched with the lesson chunk (KaTeX is used throughout lesson prose).
- `makeScene2D-*.js` + `Color-*.js` (~159 kB / ~49 kB gzip) — the shared
  **Motion Canvas 2D** runtime, fetched once a guided scene is dynamically
  imported.
- `LessonPage-*.js` (56.07 kB / 16.82 kB gzip) — lesson shell + registries.
- Per-scene and per-explorer chunks are all under 6 kB gzip each and load
  only for the lesson actually opened.

These three big libraries are inherent to the product (animation engine,
interactive math renderer, math typesetting) — they are now deferred, not
eliminated, and are not re-fetched across lesson-to-lesson navigation within
the same session (browser cache / already-evaluated modules).

## 3. Dev-only routes and production cleanup

- `/dev/mafs-demo` and `/dev/transform-spike` are built via `import.meta.env.DEV`-gated
  route objects in `routes.tsx`. Vite's static replacement of `import.meta.env.DEV`
  plus dead-code elimination means `DevMafsDemoPage.tsx` and
  `DevTransformSpikePage.tsx` are **not emitted at all** in `dist/assets/`
  (verified: `grep`-ing the production build's JS/route table for these path
  strings finds nothing on the router side, and the compiled `dist/assets`
  directory contains no `Dev*` chunk).
- Verified against a real `vite preview` production server + a Playwright
  browser: navigating to `/dev/mafs-demo` on the production build redirects
  client-side to `/` (the catch-all `*` route), because no dev route is
  registered in that build.
- The home page's dev link is now itself gated behind `import.meta.env.DEV`
  (previously a plain, always-visible `Mafs technical demo (M3)` link).
- `tmp-screenshots/` and `.playwright-mcp/` (ad hoc review artifacts) are now
  git-ignored.
- The `transform-spike` guided scene module is still registered in
  `sceneDescriptions.ts` (per the existing "explicit id only, never a silent
  fallback" rule) but is dead weight only if something requests it by id;
  nothing in the production route tree can do that anymore.

## 4. Home-page polish

`src/pages/HomePage.tsx` / `HomePage.css` / `LessonPreviewIcon.tsx`:

- Added a concise "how it works" 3-step strip (Watch → Explore → Practice)
  using existing typography tokens — no new dependency.
- Added a primary "Start with Lesson 1" call-to-action button.
- Added a small per-lesson SVG motif (`LessonPreviewIcon`) built from plain
  inline `<svg>` primitives using the same semantic `--role-*` colors as the
  guided-scene canvases (original/basis/result vectors, a sheared grid
  parallelogram, a signed-area shape, an invariant line) — not a generic
  icon set or stock illustration. These add effectively zero bytes/requests.
- Kept the warm-ivory shell and the numbered ordered list conveying lesson
  sequence; lesson cards remain plain `<Link>` elements (full keyboard/focus/
  hover/visited support comes from the existing global `:focus-visible` rule
  and anchor semantics — verified by tabbing through the list and by the new
  `home page loads without fetching lesson/guided-scene/explorer code` and
  `browser back/forward...` e2e tests).

## 5. Cross-lesson consistency audit

Reviewed all four lessons side-by-side in the browser (phase headings, player
controls, KaTeX notation, exploration disclosure, exercise feedback,
Remember-this summaries). Findings:

- Phase naming, control labels ("Play/Pause/Replay", "Previous/Next idea"),
  and the six-phase learner-facing titles are already consistent across all
  four lessons (shared `LessonLayout`/`GuidedScenePlayer`/`ExercisePanel`
  components — no per-lesson branching to drift).
- Notation (`\mathbf{v}`, `\mathbf{e}_1`/`\mathbf{e}_2`, `A`, `\lambda`) is
  applied consistently through the shared `EquationBlock`/`ProseWithMath`
  components; no lesson hand-rolls its own math formatting.
- No lesson exposes internal library/engine names in learner-facing copy
  (verified by grepping lesson content and section text for "Motion Canvas",
  "Mafs", "Playwright", "engine", etc. — none found outside dev tooling).
- Lessons 1–2 already carry the same conceptual depth added in M5 (auxiliary
  concepts like linear dependence, singular transformations); no changes were
  needed to avoid a "shallower" feel.

No code changes were required for this audit beyond the dev-reference cleanup
already covered in §3 — the shared-component architecture had already
prevented the drift this section is meant to catch.

## 6. Responsive and zoom validation

Manual + scripted (Playwright `browser_run_code_unsafe`) check of horizontal
overflow (`document.documentElement.scrollWidth > clientWidth`) on the home
page and Lesson 4 (heaviest guided scene + explorer):

| Viewport | Home overflow | Lesson overflow |
| --- | --- | --- |
| 375×667 | none | none |
| 390×844 | none | none |
| 768×1024 | none | none |
| 1366×768 | none | none |
| 1440×900 | none | none |
| 1920×1080 | none | none |

Zoom (Lesson 1, 1440×900, `document.documentElement.style.zoom`):

| Zoom | Overflow |
| --- | --- |
| 80% | none |
| 100% | none |
| 125% | none |
| 150% | none |
| 200% | none |

No layout patches were required — the existing safe-frame/aspect-ratio and
flex/CSS-grid layout already handled every tested breakpoint and zoom level.
`e2e/m45-experience.spec.ts` already covers the narrow-drawer and
safe-frame-vs-overflow cases at the component level; this section documents
the additional manual matrix.

## 7. Accessibility

Reviewed against the project's documented "basic accessibility" bar (see
`docs/LESSON_DESIGN.md`), not a full WCAG audit:

- Keyboard: all interactive controls (play/pause/replay, prev/next idea,
  idea dots, scrubber, sidebar toggle, lesson links, exercise controls,
  explorer sliders/inputs) are native `<button>`/`<a>`/`<input>` elements —
  reachable and operable by keyboard by construction; verified by tabbing
  through the home page and Lesson 1–4.
- Focus: global `:focus-visible` outline (`src/styles/globals.css`) applies
  everywhere; no component suppresses it.
- Landmarks: `AppShell` provides `<header>`/`<main>`; the course sidebar is
  `role="navigation"` with an accessible name; the guided player is
  `role="region"` with an `aria-label`; the guided canvas itself is
  `role="img"` with a descriptive `aria-label` (see `sceneMeta.ariaLabel`);
  explorers are `role="img"` with `aria-label`s on `MafsSceneShell`.
- Status/feedback: the guided stage caption is `aria-live="polite"`;
  exercise feedback and checkpoint reveals are already text, not color-only.
- Non-color cues: guided scenes and explorers already pair color roles with
  labels/line-style per `LESSON_DESIGN.md`; unchanged in M6.
- Reduced motion: unchanged, already policy-compliant — `usePrefersReducedMotion`
  disables autoplay and continuous seeking; covered by
  `e2e/m45-experience.spec.ts` ("reduced motion does not autoplay").
- New in M6: lazy-loading states (`LessonLoading`, `ExplorerLoading`) use
  `role="status"`/`aria-live="polite"` so a screen reader announces "Loading
  lesson…"/"Loading exploration…" rather than silence; error states use
  `role="alert"`.
- No icon-only controls were introduced; all new buttons ("Try again") carry
  visible text.

No dependency was added for automated scoring (per the prompt's "do not add a
large dependency solely for a superficial score"); the audit was manual plus
the existing component/e2e test coverage.

## 8. Performance and loading quality

- First home-page load now fetches ~100 kB gzip instead of ~364 kB gzip (see
  §2) — verified via `dist/index.html`'s script/modulepreload tags and a
  network-request assertion in `e2e/m6-release-polish.spec.ts`.
- Lazy-loading uses `Suspense` fallbacks sized to their final content
  (`LessonLoading`, `ExplorerLoading`) — no observed layout jump when a chunk
  resolves (manually verified; e2e covers the transition).
- No duplicate engine initialization or leaked loops/resources: the existing
  `guidedSceneDebug` instrumentation and `e2e/motion-canvas-spike.spec.ts`
  ("repeated navigation never leaks engines") still pass after making scene
  loading async — the dispose/mount race is now guarded explicitly
  (`MotionCanvasEngine.mount` checks `isDisposed` both before and after the
  awaited dynamic import).
- Back/forward navigation between the home page and a lesson was added as a
  regression test (`e2e/m6-release-polish.spec.ts`) and produces no console
  errors or stale canvas.
- No service worker/offline system was added (none existed before; out of
  scope per the prompt).

## 9. Error handling

- New `src/components/ErrorBoundary.tsx`: a calm, learner-facing fallback
  ("This lesson/exploration couldn't load" + retry button), with the raw
  error message shown only in development (`import.meta.env.DEV`). Wraps the
  lazy lesson route and every lazy explorer.
- `MotionCanvasEngine.mount()` now catches a failed dynamic scene import and
  surfaces it through the engine's existing `error` state; `GuidedScenePlayer`
  shows a "Try again" button that remounts the engine (bumping an internal
  retry token) rather than leaving the learner stuck.
- Unknown scene ids and unknown lesson ids are unaffected: both still fail
  **before** any lazy import is attempted (`hasGuidedScene` / `getLessonById`
  returning `undefined` → `<Navigate to="/" />`), so error boundaries never
  mask a genuine "unregistered content" bug.
- Targeted tests: `ErrorBoundary.test.tsx` (catch, learner copy, retry),
  `GuidedScenePlayer.test.tsx` (engine mount failure → alert → retry →
  successful remount), `explorations/registry.test.tsx` (loading placeholder
  → resolved explorer).

## 10. Tests and documentation

New/updated automated coverage:

- `src/guided-scenes/scenes/__tests__/sceneDescriptions.test.ts` — unknown id
  throws synchronously; known ids are registered; loader returns a `Promise`
  without pulling the Motion Canvas 2D runtime into the unit-test module
  graph (that stays exercised by the e2e suite in a real browser).
- `src/components/__tests__/ErrorBoundary.test.tsx`.
- `src/explorations/__tests__/registry.test.tsx`.
- `src/components/lesson/__tests__/GuidedScenePlayer.test.tsx` — added a
  mount-failure/retry case.
- `e2e/m6-release-polish.spec.ts` — home page fetches no lesson/scene/explorer
  code; opening a lesson shows a loading state then the canvas; browser
  back/forward leaves no stale state; exploration lazy-loads without a
  layout jump.
- `e2e/motion-canvas-spike.spec.ts` — `counters()` helper updated: the debug
  hook is legitimately absent on routes that never import the guided-scene
  module (e.g. a hard-reloaded home page); treated as all-zero counters
  instead of a test error. This is a **direct consequence of the intended
  code split** and is documented here rather than in `ERROR_LOG.md` (no
  mathematical/visualization bug was involved).

Final verification (all green):

- `npm run lint` — clean.
- `npm run test` — 24 files / 134 tests passed.
- `npm run test:e2e` — 28/28 passed (one transient timeout under 8-way
  worker contention on a pre-existing test; passed individually and on a
  clean full-suite rerun — not a regression).
- `npm run build` — succeeds; sizes as in §2.

## 11. Final browser review

Performed with the Playwright browser against the dev server and, for
dev-route gating specifically, against a `vite preview` production build:

- Home → each of the 4 lessons → guided animation plays → exploration opens
  (lazy chunk loads, no layout jump) → a practice item can be answered →
  navigate to another lesson → back to home — no console errors, no stale
  canvas, no leaked engines (instrumented counters return to zero on the
  home page after each round-trip).
- Production build: `/dev/mafs-demo` redirects to `/` client-side; no
  `Dev*` learner-facing link is present.

Review screenshots were written to `tmp-screenshots/` (git-ignored, not part
of the committed product).

## Deviations from the prompt

- Dev-route gating (§3) is verified via a real `vite preview` production
  server + Playwright rather than as an automated Playwright **test**,
  because the e2e suite's `webServer` runs `npm run dev` (development mode),
  where `import.meta.env.DEV` is intentionally `true` and the dev routes are
  intentionally present. Adding a second, production-mode Playwright
  configuration/webServer for one test was judged not worth the added CI
  complexity for this POC; the manual verification is documented here and
  the routing logic itself is a one-line, obviously-correct `import.meta.env.DEV`
  gate exercised by `npx tsc`/`npm run build`/`grep` on every build.
- No automated axe-core (or similar) accessibility scan was added, per the
  prompt's instruction not to add a large dependency solely for a superficial
  score; the audit in §7 is manual plus existing/added component and e2e
  coverage.
- Cross-lesson consistency (§5) required no code changes: the shared
  component architecture from M4/M4.5/M5 already prevented drift.
