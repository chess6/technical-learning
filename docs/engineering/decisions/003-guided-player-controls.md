# ADR 003 — Guided-player viewing controls (speed, chapters, theater/fullscreen)

Status: Accepted (2026-07)

## Context

The guided player supported Play/Pause/Replay, Prev/Next idea, and a scrubber.
Reference study of educational-animation sources
([engineering/reference-sources.md](../reference-sources.md)) and the July 2026
audit ([quality/guided-animation-audit-2026-07.md](../../quality/guided-animation-audit-2026-07.md))
motivated theater/fullscreen viewing, playback speed, keyboard control, and
chapter metadata. ADR 001's constraint stands: every consumer depends only on
the `GuidedSceneEngine` interface, and the SVG fallback must remain
interface-complete.

## Decision

- **Engine contract** gains `setSpeed(speed)` and a `speed` field in
  `GuidedSceneState`. Both engines implement it: `MotionCanvasEngine` calls the
  documented `Player.setSpeed` (the speed scales only the real-time update
  loop — frames, duration, and normalized progress stay in authored time, so
  seeking and step markers need no compensation); `SvgFallbackEngine` scales
  its rAF delta. The fallback swap in `engine/index.ts` remains a one-line
  change.
- **Chapters are the existing major steps**, not a parallel schema. The typed
  extension is `GuidedSceneChapter extends GuidedSceneStep { summary?: string }`;
  summaries are authored on `SceneSegment` in `sceneTimings.ts` (kept beside
  the durations they describe) and flow through `toSteps`. Scenes without
  summaries are untouched. The player renders chapter tick marks under the
  scrubber, summary text under "Watching now", and keeps the idea dots as the
  accessible jump controls.
- **Speed preference** is a module-level session store
  (`playbackPreferences.ts`), applied to each engine on mount — surviving the
  player's frequent deliberate remounts (navigation, expand modal, seek-by-key
  changes) without persisting across sessions.
- **Theater mode** is pure CSS state on the player figure (fixed overlay);
  the engine is never remounted, so playback continues. **Fullscreen** uses
  the Fullscreen API on the figure, feature-detected (control hidden when
  unsupported, e.g. jsdom), synced via `fullscreenchange`.
- **Keyboard shortcuts** attach to the player figure normally and
  document-wide only in theater/fullscreen; a typing-context guard skips
  input/textarea/select/contenteditable, and native control behavior (Space on
  buttons, arrows on the range input) wins over shortcuts.

## Consequences

- The engine interface grew by one method; any future backend must implement
  `setSpeed` (clamping is per-engine, 0.25–4).
- Learner-facing UI standards for the new controls live in
  authoring/lesson-design.md §Motion Canvas responsibilities; this ADR owns
  only the engine-contract rationale.
- The video-export harness (ADR 001 addendum: `description.onReplaced` is
  promoted in `buildGuidedProject`, mirroring the vite plugin's generated
  code, because `Renderer.reloadScenes` dereferences it) reuses the same
  project construction — see [engineering/video-export.md](../video-export.md).
