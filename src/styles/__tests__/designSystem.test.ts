/**
 * Design-system contract for the two-theme live-notebook identity.
 *
 * The identity is carried entirely by `tokens.css`: shared structure at `:root`
 * plus one colour/surface block per presentation (`notebook`, the default, and
 * `observatory`). Component CSS reads semantic token names and never branches on
 * the theme — which is only true if the token layer holds up. Three failure
 * modes make it quietly untrue, and the first two actually happened:
 *
 *   1. a component reads a token that was never defined (`var(--color-surface-muted,
 *      #f8f6f1)`), so the FALLBACK ships instead of the identity;
 *   2. a component hardcodes a colour, so it ignores the identity altogether;
 *   3. a token exists in one theme but not the other, so switching themes leaves
 *      a component reading an undefined property.
 *
 * What is deliberately NOT asserted here: that the page is dark, or that page
 * and canvas are close in luminance. Those are per-theme *choices*, and the two
 * themes make them differently on purpose — Notebook sets a dark canvas against
 * a warm page (a figure is an instrument set into paper), Observatory makes the
 * two continuous (the page is the sky the figure is drawn on). Both intents are
 * pinned below, as intents, not as universal law.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// Read the stylesheets as TEXT from disk. (A Vite `?raw` glob is stubbed to ""
// under Vitest's default `css: false`, which would make every contract below
// vacuously pass — exactly the silent-green failure these tests exist to stop.)
const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const TOKENS_PATH = join(SRC, "styles", "tokens.css");

function cssFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return cssFiles(full);
    return full.endsWith(".css") ? [full] : [];
  });
}

const tokensCss = readFileSync(TOKENS_PATH, "utf8");
const COMPONENT_CSS: Array<[string, string]> = cssFiles(SRC)
  .filter((file) => file !== TOKENS_PATH)
  .map((file) => [relative(ROOT, file), readFileSync(file, "utf8")]);

/* -------------------------------------------------------------------------- */
/* Reading the token file as three declaration blocks                          */
/* -------------------------------------------------------------------------- */

/** Body of the first rule whose selector text contains `marker`. */
function ruleBody(css: string, marker: string): string {
  const at = css.indexOf(marker);
  if (at < 0) throw new Error(`no rule matching "${marker}" in tokens.css`);
  const open = css.indexOf("{", at);
  if (open < 0) throw new Error(`rule "${marker}" has no body`);
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  throw new Error(`rule "${marker}" is unterminated`);
}

function declarations(body: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const match of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    out.set(match[1]!, match[2]!.trim());
  }
  return out;
}

// Comments are stripped first: the file documents its own selectors in prose,
// and a marker found inside a comment would land on the wrong block.
const tokensRules = tokensCss.replace(/\/\*[\s\S]*?\*\//g, "");

// `:root {` is the shared block; the theme blocks carry a `data-theme` selector.
const SHARED = declarations(ruleBody(tokensRules, ":root {"));
const THEME_BLOCKS = {
  notebook: declarations(ruleBody(tokensRules, '[data-theme="notebook"]')),
  observatory: declarations(ruleBody(tokensRules, '[data-theme="observatory"]')),
} as const;

type ThemeName = keyof typeof THEME_BLOCKS;
const THEME_NAMES = Object.keys(THEME_BLOCKS) as ThemeName[];

/** Every property the browser would resolve on the root for a given theme. */
function resolvedTokens(theme: ThemeName): Map<string, string> {
  return new Map([...SHARED, ...THEME_BLOCKS[theme]]);
}

/** Follow `var(--alias)` chains to the literal value a component would paint. */
function tokenValue(theme: ThemeName, name: string): string {
  const table = resolvedTokens(theme);
  let value = table.get(name);
  for (let hops = 0; value !== undefined && hops < 8; hops += 1) {
    const alias = value.match(/^var\(\s*(--[a-z0-9-]+)\s*\)$/i);
    if (!alias) return value;
    value = table.get(alias[1]!);
  }
  if (value === undefined) throw new Error(`token ${name} undefined in ${theme}`);
  return value;
}

/** Custom properties defined anywhere in the global token file. */
const definedTokens = new Set([
  ...SHARED.keys(),
  ...THEME_BLOCKS.notebook.keys(),
  ...THEME_BLOCKS.observatory.keys(),
]);

/** Custom properties a stylesheet defines for itself (component-local knobs). */
function localTokens(css: string): Set<string> {
  return new Set(
    [...css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map((m) => m[1]!),
  );
}

/* -------------------------------------------------------------------------- */
/* Completeness                                                                */
/* -------------------------------------------------------------------------- */

/** Colour/surface tokens a theme owns. Every theme must define all of them. */
const THEME_OWNED = [
  "--color-page-bg",
  "--color-sidebar-bg",
  "--color-surface-subtle",
  "--color-surface-muted",
  "--color-surface-raised",
  "--color-surface-lifted",
  "--color-divider",
  "--color-divider-strong",
  "--color-text",
  "--color-text-muted",
  "--color-text-faint",
  "--color-on-accent",
  "--color-primary",
  "--color-primary-hover",
  "--color-accent",
  "--color-accent-strong",
  "--color-focus",
  "--color-node",
  "--color-success",
  "--color-warning",
  "--color-error",
  "--color-canvas",
  "--color-canvas-text",
  "--aurora-1",
  "--gradient-rule",
  "--gradient-lit",
  "--glow-accent",
  "--glow-node",
] as const;

describe("design system — every theme is complete", () => {
  it.each(THEME_NAMES)("%s defines every theme-owned token", (theme) => {
    const missing = THEME_OWNED.filter((token) => !THEME_BLOCKS[theme].has(token));
    expect(missing, `${theme} is missing: ${missing.join(", ")}`).toEqual([]);
  });

  it("the two themes define exactly the same token set", () => {
    // A token present in one theme only would resolve to nothing after a switch.
    const notebook = [...THEME_BLOCKS.notebook.keys()].sort();
    const observatory = [...THEME_BLOCKS.observatory.keys()].sort();
    expect(notebook).toEqual(observatory);
  });

  it("every custom property read by a component is actually defined", () => {
    const missing: string[] = [];
    for (const [path, css] of COMPONENT_CSS) {
      const local = localTokens(css);
      for (const match of css.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) {
        const token = match[1]!;
        if (!definedTokens.has(token) && !local.has(token)) {
          missing.push(`${path}: ${token}`);
        }
      }
    }
    // A `var(--undefined, #fff)` silently ships its fallback instead.
    expect(missing, `undefined custom properties:\n${missing.join("\n")}`).toEqual([]);
  });
});

describe("design system — no hardcoded colors outside the token file", () => {
  /**
   * Colors that legitimately live in a component, each for a stated reason.
   * Anything else belongs in `tokens.css` so a theme can move it.
   */
  const ALLOWED = new Map<string, string>([
    // Text halo drawn ON the 3-D canvas, matched to the canvas ink itself.
    ["src/components/lesson/threeD/Eigen3DExtension.css", "canvas text halo"],
    // The theme control previews BOTH presentations at once, so by definition it
    // cannot express the inactive one through the active theme's tokens.
    ["src/components/layout/ThemeToggle.css", "theme preview swatches"],
    // Development-only diagnostic surfaces (dev route tree only, dropped from
    // production bundles). They deliberately sit OUTSIDE the learner theme:
    // dressing an instrument panel in product tokens would make it read as
    // product UI, and their colours must stay fixed while a theme moves.
    ["src/pages/DevBenchmarkLabPage.css", "dev-only benchmark laboratory"],
    ["src/pages/DevSceneGatesPage.css", "dev-only hard-gate runner"],
  ]);

  it("component CSS uses tokens, not raw hex", () => {
    const offenders: string[] = [];
    for (const [path, css] of COMPONENT_CSS) {
      if (ALLOWED.has(path)) continue;
      for (const match of css.matchAll(/#[0-9a-f]{3,8}\b/gi)) {
        offenders.push(`${path}: ${match[0]}`);
      }
    }
    expect(offenders, `raw hex outside tokens.css:\n${offenders.join("\n")}`).toEqual([]);
  });
});

/* -------------------------------------------------------------------------- */
/* Semantic math roles — identity-independent meanings                         */
/* -------------------------------------------------------------------------- */

describe("design system — math roles mean the same thing in every theme", () => {
  /** The meaning dictionary (docs/product/vision.md §9b), pinned to values. */
  const ROLE_VALUES: Record<string, string> = {
    "--role-original": "#7ec5e6",
    "--role-transformed": "#e6b566",
    "--role-basis-1": "#7fd0a0",
    "--role-basis-2": "#b9a3ef",
    "--role-selected": "#ecd484",
    "--role-invariant": "#f0879f",
    "--role-intermediate": "#9aa6b5",
    "--role-reachable": "#7ec5e6",
  };

  it("declares every role once, in the shared block", () => {
    for (const role of Object.keys(ROLE_VALUES)) {
      expect(SHARED.has(role), `${role} is shared`).toBe(true);
      for (const theme of THEME_NAMES) {
        expect(
          THEME_BLOCKS[theme].has(role),
          `${role} must not be redefined by ${theme}`,
        ).toBe(false);
      }
    }
  });

  it("resolves to the same value under either theme", () => {
    for (const [role, value] of Object.entries(ROLE_VALUES)) {
      for (const theme of THEME_NAMES) {
        expect(tokenValue(theme, role), `${role} in ${theme}`).toBe(value);
      }
    }
    // The aliases keep pointing at the same meanings, too.
    for (const theme of THEME_NAMES) {
      expect(tokenValue(theme, "--role-result")).toBe(ROLE_VALUES["--role-transformed"]);
      expect(tokenValue(theme, "--role-highlight")).toBe(ROLE_VALUES["--role-selected"]);
    }
  });
});

/* -------------------------------------------------------------------------- */
/* Contrast floors — both themes, same bar                                     */
/* -------------------------------------------------------------------------- */

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.x relative luminance of a `#rrggbb` token value. */
function luminance(hex: string): number {
  const value = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
  return (
    0.2126 * srgbToLinear(r!) + 0.7152 * srgbToLinear(g!) + 0.0722 * srgbToLinear(b!)
  );
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** Opaque surfaces a learner reads body copy on. */
const READING_SURFACES = [
  "--color-page-bg",
  "--color-sidebar-bg",
  "--color-surface-subtle",
  "--color-surface-muted",
  "--color-surface-raised",
  "--color-surface-lifted",
] as const;

describe.each(THEME_NAMES)("design system — %s contrast floor (WCAG 2.1)", (theme) => {
  const value = (name: string) => tokenValue(theme, name);

  it("body ink clears AAA on every reading surface", () => {
    for (const surface of READING_SURFACES) {
      expect(
        contrast(value("--color-text"), value(surface)),
        `body text on ${surface}`,
      ).toBeGreaterThanOrEqual(7);
    }
  });

  it("secondary and faint ink clear AA body text on every reading surface", () => {
    for (const token of ["--color-text-muted", "--color-text-faint"]) {
      for (const surface of READING_SURFACES) {
        expect(
          contrast(value(token), value(surface)),
          `${token} on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("link, action, and chapter-node type clear AA on the page and on cards", () => {
    for (const token of ["--color-accent", "--color-primary", "--color-node"]) {
      for (const surface of ["--color-page-bg", "--color-surface-raised"] as const) {
        expect(
          contrast(value(token), value(surface)),
          `${token} on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("status colors stay legible as text on the page", () => {
    for (const token of ["--color-success", "--color-warning", "--color-error"]) {
      expect(
        contrast(value(token), value("--color-page-bg")),
        `${token} on the page`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("the focus ring clears the non-text control floor against the page", () => {
    expect(contrast(value("--color-focus"), value("--color-page-bg"))).toBeGreaterThanOrEqual(3);
  });

  it("text on an action fill clears AA — whichever way round the theme runs it", () => {
    const onAccent = value("--color-on-accent");
    for (const fill of [
      "--color-primary",
      "--color-primary-hover",
      "--color-node",
      "--color-success",
      "--color-error",
    ]) {
      expect(
        contrast(onAccent, value(fill)),
        `on-accent ink over ${fill}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("text on a luminous role fill clears AA", () => {
    // `--color-on-role` is shared: the roles are the same hues in both themes,
    // so the ink that sits on them is the same ink.
    const onRole = value("--color-on-role");
    for (const fill of ["--role-basis-1", "--role-original", "--role-transformed"]) {
      expect(
        contrast(onRole, value(fill)),
        `on-role ink over ${fill}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("canvas labels clear AAA on the canvas", () => {
    expect(
      contrast(value("--color-canvas-text"), value("--color-canvas")),
    ).toBeGreaterThanOrEqual(7);
  });
});

describe("design system — each theme's page/canvas relationship is its own", () => {
  it("Notebook sets a dark canvas against its warm page, on purpose", () => {
    // The figure is an instrument set into paper: the separation is the point,
    // and the role palette stays tuned for the dark ground it is drawn on.
    const page = tokenValue("notebook", "--color-page-bg");
    const canvas = tokenValue("notebook", "--color-canvas");
    expect(luminance(page), "the notebook page is paper").toBeGreaterThan(0.5);
    expect(luminance(canvas), "the notebook canvas is ink").toBeLessThan(0.05);
    expect(contrast(canvas, page)).toBeGreaterThanOrEqual(8);
  });

  it("Observatory makes page and canvas continuous, on purpose", () => {
    // The page is the same sky the figure is drawn on, so the figure stops
    // reading as a bright cut-out.
    const page = tokenValue("observatory", "--color-page-bg");
    const canvas = tokenValue("observatory", "--color-canvas");
    expect(luminance(page), "the observatory page is ink").toBeLessThan(0.05);
    expect(contrast(canvas, page)).toBeLessThan(1.35);
  });
});
