/**
 * Design-system contract for the "Observatory" identity (2026-07-24).
 *
 * The identity is carried entirely by `tokens.css` — component CSS reads
 * semantic tokens and inherits. Two failure modes make that quietly untrue, and
 * both actually happened before this suite existed:
 *
 *   1. a component reads a token that was never defined (`var(--color-surface-muted,
 *      #f8f6f1)`), so the LIGHT fallback ships — a cream panel on an ink page;
 *   2. a component hardcodes a color, so it ignores the identity altogether.
 *
 * These are text-level contracts on the stylesheets, deliberately cheap: they
 * cannot regress silently the way a screenshot can. The third contract is the
 * accessibility floor the inversion has to clear — computed, not eyeballed.
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

/** Custom properties defined in the global token file. */
const definedTokens = new Set(
  [...tokensCss.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map((m) => m[1]!),
);

/** Custom properties a stylesheet defines for itself (component-local knobs). */
function localTokens(css: string): Set<string> {
  return new Set([...css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map((m) => m[1]!));
}

describe("design system — token definitions", () => {
  it("defines the identity tokens the rest of the CSS depends on", () => {
    for (const token of [
      "--color-page-bg",
      "--color-surface-subtle",
      "--color-surface-muted",
      "--color-surface-raised",
      "--color-text",
      "--color-text-muted",
      "--color-on-accent",
      "--color-canvas",
      "--gradient-rule",
      "--aurora-1",
    ]) {
      expect(definedTokens.has(token), `${token} must be defined in tokens.css`).toBe(true);
    }
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
    // A `var(--undefined, #fff)` silently ships its light-mode fallback.
    expect(missing, `undefined custom properties:\n${missing.join("\n")}`).toEqual([]);
  });
});

describe("design system — no hardcoded colors outside the token file", () => {
  /**
   * Colors that legitimately live in a component, each for a stated reason.
   * Anything else belongs in `tokens.css` so the identity can move it.
   */
  const ALLOWED = new Map<string, string>([
    // The hero wordmark's metallic gradient: a one-off type treatment, not a
    // surface color, and it degrades to `--color-text` where unsupported.
    ["src/pages/HomePage.css", "hero wordmark gradient"],
    // Text halo drawn ON the 3-D canvas, matched to the canvas ink itself.
    ["src/components/lesson/threeD/Eigen3DExtension.css", "canvas text halo"],
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
/* Contrast floor — the inversion has to be MORE readable, not just darker.    */
/* -------------------------------------------------------------------------- */

function tokenValue(name: string): string {
  const match = tokensCss.match(new RegExp(`${name}\\s*:\\s*([^;]+);`));
  if (!match) throw new Error(`token ${name} not found`);
  return match[1]!.trim();
}

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

describe("design system — contrast floor (WCAG 2.1)", () => {
  const PAGE = tokenValue("--color-page-bg");
  const RAISED = tokenValue("--color-surface-raised");
  const SUBTLE = tokenValue("--color-surface-subtle");

  it("body ink clears AAA on every reading surface", () => {
    const text = tokenValue("--color-text");
    for (const [name, bg] of [
      ["page", PAGE],
      ["raised", RAISED],
      ["subtle", SUBTLE],
    ] as const) {
      expect(contrast(text, bg), `body text on ${name}`).toBeGreaterThanOrEqual(7);
    }
  });

  it("secondary and faint ink clear AA body text on every reading surface", () => {
    for (const token of ["--color-text-muted", "--color-text-faint"]) {
      for (const [name, bg] of [
        ["page", PAGE],
        ["raised", RAISED],
        ["subtle", SUBTLE],
      ] as const) {
        expect(contrast(tokenValue(token), bg), `${token} on ${name}`).toBeGreaterThanOrEqual(
          4.5,
        );
      }
    }
  });

  it("ink on a luminous fill clears AA — the primary action is dark-on-light", () => {
    const onAccent = tokenValue("--color-on-accent");
    for (const fill of [
      "--color-primary",
      "--color-primary-hover",
      "--color-success",
      "--color-error",
      "--role-original",
      "--role-basis-1",
    ]) {
      expect(contrast(onAccent, tokenValue(fill)), `on-accent ink over ${fill}`).toBeGreaterThanOrEqual(
        4.5,
      );
    }
  });

  it("accent text and role colors stay legible as text on the page ground", () => {
    for (const token of [
      "--color-accent",
      "--color-primary",
      "--role-original",
      "--role-basis-1",
      "--role-transformed",
      "--role-basis-2",
      "--role-invariant",
    ]) {
      expect(contrast(tokenValue(token), PAGE), `${token} on the page`).toBeGreaterThanOrEqual(
        4.5,
      );
    }
  });

  it("the canvas is continuous with the page — the figure is no longer a cut-out", () => {
    // The redesign's central claim, made checkable: page ground and
    // visualization canvas sit within a hair of each other in luminance, so a
    // figure reads as part of the page rather than a bright inset panel.
    expect(contrast(tokenValue("--color-canvas"), PAGE)).toBeLessThan(1.35);
    expect(contrast(tokenValue("--color-canvas-text"), tokenValue("--color-canvas"))).toBeGreaterThanOrEqual(7);
  });
});
