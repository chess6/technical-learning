# M4.5 — Visual, Layout & Learning-Experience Refinement

> **Historical milestone.** Not current policy. Its surviving rules — the autoplay
> and safe-frame conventions and the CourseSidebar navigation — now live in
> [authoring/lesson-design.md](../../authoring/lesson-design.md) (Motion Canvas
> responsibilities, Navigation). Read the standard, not this milestone, for current
> guidance.

Refinement of Lessons 1 and 2 only. Lessons 3–4 remain placeholders.

## Autoplay rule

- Autoplay **once** when the guided canvas is substantially visible (≥55%
  IntersectionObserver) and `prefers-reduced-motion` is **off**.
- Navigating away disposes the engine; returning **remounts** and may autoplay
  once again (restart-on-remount).
- Reduced motion: no continuous autoplay; land on the first major idea and use
  Previous / Next idea.
- Hidden tab/page pauses playback; scrolling the scene off-screen also pauses.
- Diagnostics stay behind `?debug=1` or `localStorage.guidedSceneDebug=1`
  (`window.__guidedSceneDebug` remains for e2e).

## Safe-frame convention

Overlay equation/caption text is **center-anchored** at `LABEL_CENTER_X`.
Never place long Motion Canvas `Txt` nodes at a left-edge x — the default
origin is the center of the string, which clips half the text off-stage.
Use `makeOverlayLabel()` with generous `lineHeight` / `cachePadding` so
glyph ascent and descenders are not clipped by the text cache either.

## Navigation

Horizontal lesson tabs removed. Persistent **CourseSidebar** driven by
`src/lessons/curriculum.ts` + the lesson registry.
