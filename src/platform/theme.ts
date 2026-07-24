/**
 * Theme selection — which presentation of the live-notebook identity is active.
 *
 * Two presentations of ONE identity (see the header of `src/styles/tokens.css`):
 * `notebook` (default, warm ivory page + dark canvases) and `observatory`
 * (optional, ink page continuous with the canvas). Both are carried entirely by
 * theme-scoped tokens; nothing in a component branches on the theme.
 *
 * Deliberate: the OS `prefers-color-scheme` is NOT consulted. Observatory is a
 * choice about how this product presents mathematics, not a system dark mode, so
 * a dark-mode OS must not silently switch the identity.
 *
 * The same key is read by the tiny inline script in `index.html`, which stamps
 * `data-theme` before the first paint so a reload never flashes the wrong theme.
 * Keep `THEME_STORAGE_KEY` and `DEFAULT_THEME` in sync with that script.
 */

export const THEMES = ["notebook", "observatory"] as const;

export type ThemeName = (typeof THEMES)[number];

export const DEFAULT_THEME: ThemeName = "notebook";

export const THEME_STORAGE_KEY = "technical-learning/theme/v1";

/** Learner-facing name and one-line description of each presentation. */
export const THEME_META: Record<ThemeName, { label: string; hint: string }> = {
  notebook: {
    label: "Notebook",
    hint: "Warm ivory page with dark mathematical canvases",
  },
  observatory: {
    label: "Observatory",
    hint: "Dark page continuous with the canvases",
  },
};

export function isThemeName(value: unknown): value is ThemeName {
  return (
    typeof value === "string" && (THEMES as readonly string[]).includes(value)
  );
}

/** The persisted choice, or the default when absent/unreadable/unrecognised. */
export function readStoredTheme(): ThemeName {
  let stored: string | null = null;
  try {
    stored = globalThis.localStorage?.getItem(THEME_STORAGE_KEY) ?? null;
  } catch {
    // Storage disabled (e.g. privacy mode) — fall back to the default.
    return DEFAULT_THEME;
  }
  return isThemeName(stored) ? stored : DEFAULT_THEME;
}

export function storeTheme(theme: ThemeName): void {
  try {
    globalThis.localStorage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Best effort: an unwritable store still leaves the session's theme applied.
  }
}

/** Stamp the theme onto the document root, where the token scopes hang off it. */
export function applyTheme(theme: ThemeName): void {
  globalThis.document?.documentElement.setAttribute("data-theme", theme);
}
