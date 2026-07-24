import path from "node:path";
import { test, expect, type Page } from "@playwright/test";

function screenshotPath(name: string): string {
  return path.join(process.cwd(), "screenshots", name);
}

/**
 * Visual identity — "Observatory" (2026-07-24 redesign).
 *
 * These assertions are about the IDENTITY, not about pixels: a screenshot test
 * would fail on every legitimate copy edit, and pass while a stylesheet quietly
 * shipped a light-mode fallback. What is locked here is what the redesign
 * claims to be true, measured from computed styles in a real browser:
 *
 *   1. the reading surface is ink, and body text on it clears WCAG AAA;
 *   2. a figure is CONTINUOUS with its page — the guided-scene canvas and the
 *      page ground sit within a hair of each other in luminance, which is the
 *      whole point of the inversion (the old design punched a bright inset into
 *      a warm page);
 *   3. the identity survives a phone viewport without overflowing it.
 *
 * The token-level companions (undefined-token detection, the raw-hex ban, and
 * the contrast floor on the palette itself) live in
 * `src/styles/__tests__/designSystem.test.ts`.
 */

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

/** Parse a computed `rgb(...)` / `rgba(...)` color into channels. */
function parseRgb(value: string): [number, number, number] {
  const nums = value.match(/[\d.]+/g);
  if (!nums || nums.length < 3) throw new Error(`unparseable color: ${value}`);
  return [Number(nums[0]), Number(nums[1]), Number(nums[2])];
}

function relativeLuminance(color: string): number {
  const linear = parseRgb(color).map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
}

function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** The effective (non-transparent) background color painted behind an element. */
async function paintedBackground(page: Page, selector: string): Promise<string> {
  return page.evaluate((sel) => {
    let node: Element | null = document.querySelector(sel);
    while (node) {
      const bg = getComputedStyle(node).backgroundColor;
      const alpha = bg.match(/[\d.]+/g)?.[3];
      if (bg && bg !== "transparent" && alpha !== "0") return bg;
      node = node.parentElement;
    }
    return getComputedStyle(document.body).backgroundColor;
  }, selector);
}

test("home reads as ink and clears the contrast floor", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Linear Algebra", level: 1 })).toBeVisible();

  // 1. The page ground is ink, not paper.
  const pageBg = await paintedBackground(page, "body");
  expect(relativeLuminance(pageBg), `page background ${pageBg} should be ink`).toBeLessThan(0.05);

  // 2. Body copy on that ground clears AAA (7:1).
  const ledeColor = await page
    .locator(".home-page__lede")
    .evaluate((el) => getComputedStyle(el).color);
  expect(contrastRatio(ledeColor, pageBg)).toBeGreaterThanOrEqual(7);

  // 3. The primary action is the brightest thing on the page, and its label is
  //    dark ink ON that light — never white-on-light.
  const cta = page.getByRole("link", { name: /Start with Chapter 0/ });
  const ctaStyles = await cta.evaluate((el) => {
    const style = getComputedStyle(el);
    return { color: style.color, background: style.backgroundColor };
  });
  expect(relativeLuminance(ctaStyles.background)).toBeGreaterThan(relativeLuminance(pageBg));
  expect(relativeLuminance(ctaStyles.color)).toBeLessThan(
    relativeLuminance(ctaStyles.background),
  );
  expect(contrastRatio(ctaStyles.color, ctaStyles.background)).toBeGreaterThanOrEqual(4.5);

  // 4. Chapter cards are LIT panels — lifted off the ground, not outlined boxes.
  const cardBg = await paintedBackground(page, ".home-page__link");
  expect(relativeLuminance(cardBg)).toBeGreaterThan(relativeLuminance(pageBg));

  await page.screenshot({ path: screenshotPath("identity-home.png") });

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("a lesson figure is continuous with its page, not a cut-out", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/systems");

  // The guided scene is the product's signature figure.
  const canvasStage = page.locator(".guided-scene-player__canvas");
  await expect(canvasStage.locator("canvas")).toBeVisible();

  const pageBg = await paintedBackground(page, ".app-shell__main");
  const stageBg = await paintedBackground(page, ".guided-scene-player__canvas");

  // The central claim of the redesign, made checkable: the figure's ground and
  // the page's ground are within a hair of each other. (Before the inversion
  // this ratio was ~15:1 — an ivory page around a near-black canvas.)
  expect(
    contrastRatio(stageBg, pageBg),
    `figure ground ${stageBg} vs page ground ${pageBg}`,
  ).toBeLessThan(1.6);

  // The lesson title still clears AAA against the surface it sits on.
  const titleColor = await page
    .locator(".lesson-header__title")
    .evaluate((el) => getComputedStyle(el).color);
  expect(contrastRatio(titleColor, pageBg)).toBeGreaterThanOrEqual(7);

  await page.screenshot({ path: screenshotPath("identity-lesson.png") });

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("the identity holds at a phone viewport without horizontal overflow", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Linear Algebra", level: 1 })).toBeVisible();

  // The hero display type is fluid; nothing may push the document sideways.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "document scrolls horizontally").toBeLessThanOrEqual(0);

  // The chapter spine is still a usable list on a phone.
  const rows = page.locator(".home-page__list .home-page__link");
  expect(await rows.count()).toBeGreaterThan(1);
  await expect(rows.first()).toBeVisible();

  await page.screenshot({ path: screenshotPath("identity-home-narrow.png") });

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});
