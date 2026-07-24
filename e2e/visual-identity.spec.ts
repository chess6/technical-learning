import path from "node:path";
import { test, expect, type Page } from "@playwright/test";

function screenshotPath(name: string): string {
  return path.join(process.cwd(), "screenshots", name);
}

/**
 * Visual identity — the live interactive notebook, in two presentations.
 *
 * `Notebook` (default) and `Observatory` are two presentations of ONE identity,
 * carried entirely by theme-scoped tokens. These assertions are about what each
 * presentation *claims*, measured from computed styles in a real browser — not
 * about pixels (a screenshot test fails on every legitimate copy edit and passes
 * while a stylesheet quietly ships a fallback colour).
 *
 * What is locked here:
 *   1. Notebook is the default, even when the OS asks for dark;
 *   2. both presentations clear the same text/control contrast floors;
 *   3. each presentation's page↔canvas relationship is its own deliberate
 *      choice — Notebook contrasts a dark canvas against warm paper, Observatory
 *      makes the two continuous — and neither is asserted of the other;
 *   4. the math roles mean and look the same under either presentation;
 *   5. the control is keyboard-operable with visible focus, and the choice
 *      survives a reload;
 *   6. neither presentation overflows a desktop or a phone viewport.
 *
 * The token-level companions (per-theme completeness, the raw-hex ban, and the
 * contrast floor on the palettes themselves) live in
 * `src/styles/__tests__/designSystem.test.ts`.
 */

const THEME_STORAGE_KEY = "technical-learning/theme/v1";

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

function themeButton(page: Page, theme: "notebook" | "observatory") {
  return page.locator(`.theme-toggle__option[data-theme-option="${theme}"]`);
}

async function selectTheme(page: Page, theme: "notebook" | "observatory") {
  await themeButton(page, theme).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  // Several surfaces animate their colour (`--duration-fast`/`--duration-normal`);
  // let the switch settle so computed styles are the destination, not a frame
  // part-way through the crossfade.
  await page.waitForTimeout(400);
}

async function activeTheme(page: Page): Promise<string | null> {
  return page.locator("html").getAttribute("data-theme");
}

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

/* -------------------------------------------------------------------------- */

test("Notebook is the default presentation, even when the OS prefers dark", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  // A dark operating system is not a request for the Observatory identity.
  await page.emulateMedia({ colorScheme: "dark" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  await expect(page.locator("h1")).toBeVisible();
  expect(await activeTheme(page)).toBe("notebook");

  // The reading surface is paper, and body copy on it clears AAA.
  const pageBg = await paintedBackground(page, "body");
  expect(
    relativeLuminance(pageBg),
    `page background ${pageBg} should be warm paper`,
  ).toBeGreaterThan(0.5);

  // Body ink clears AAA; the secondary lede clears AA.
  const bodyColor = await page
    .locator(".home-page__lesson-title")
    .first()
    .evaluate((el) => getComputedStyle(el).color);
  expect(contrastRatio(bodyColor, pageBg)).toBeGreaterThanOrEqual(7);

  const ledeColor = await page
    .locator(".home-page__lede")
    .evaluate((el) => getComputedStyle(el).color);
  expect(contrastRatio(ledeColor, pageBg)).toBeGreaterThanOrEqual(4.5);

  // The primary action's label clears AA on its own fill, whichever way round
  // the presentation runs the polarity.
  const cta = page.locator(".home-page__cta .btn--primary").first();
  const ctaStyles = await cta.evaluate((el) => {
    const style = getComputedStyle(el);
    return { color: style.color, background: style.backgroundColor };
  });
  expect(contrastRatio(ctaStyles.color, ctaStyles.background)).toBeGreaterThanOrEqual(4.5);

  await page.screenshot({ path: screenshotPath("identity-home-notebook.png") });
  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("Observatory keeps the same contrast floors once selected", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await selectTheme(page, "observatory");

  const pageBg = await paintedBackground(page, "body");
  expect(
    relativeLuminance(pageBg),
    `page background ${pageBg} should be ink`,
  ).toBeLessThan(0.05);

  const bodyColor = await page
    .locator(".home-page__lesson-title")
    .first()
    .evaluate((el) => getComputedStyle(el).color);
  expect(contrastRatio(bodyColor, pageBg)).toBeGreaterThanOrEqual(7);

  const ledeColor = await page
    .locator(".home-page__lede")
    .evaluate((el) => getComputedStyle(el).color);
  expect(contrastRatio(ledeColor, pageBg)).toBeGreaterThanOrEqual(4.5);

  const ctaStyles = await page
    .locator(".home-page__cta .btn--primary")
    .first()
    .evaluate((el) => {
      const style = getComputedStyle(el);
      return { color: style.color, background: style.backgroundColor };
    });
  expect(relativeLuminance(ctaStyles.background)).toBeGreaterThan(
    relativeLuminance(pageBg),
  );
  expect(contrastRatio(ctaStyles.color, ctaStyles.background)).toBeGreaterThanOrEqual(4.5);

  await page.screenshot({ path: screenshotPath("identity-home-observatory.png") });
  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("each presentation's page/canvas relationship is its own", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/systems");

  // The guided scene is the product's signature figure.
  const canvasStage = page.locator(".guided-scene-player__canvas");
  await expect(canvasStage.locator("canvas")).toBeVisible();

  // Notebook: the figure is an instrument set into paper. The separation is the
  // point — the role palette stays tuned for the dark ground it is drawn on.
  expect(await activeTheme(page)).toBe("notebook");
  let pageBg = await paintedBackground(page, ".app-shell__main");
  let stageBg = await paintedBackground(page, ".guided-scene-player__canvas");
  expect(
    contrastRatio(stageBg, pageBg),
    `notebook: figure ground ${stageBg} vs page ground ${pageBg}`,
  ).toBeGreaterThanOrEqual(8);

  let titleColor = await page
    .locator(".lesson-header__title")
    .evaluate((el) => getComputedStyle(el).color);
  expect(contrastRatio(titleColor, pageBg)).toBeGreaterThanOrEqual(7);
  await page.screenshot({ path: screenshotPath("identity-lesson-notebook.png") });

  // Observatory: the page is the same sky the figure is drawn on.
  await selectTheme(page, "observatory");
  pageBg = await paintedBackground(page, ".app-shell__main");
  stageBg = await paintedBackground(page, ".guided-scene-player__canvas");
  expect(
    contrastRatio(stageBg, pageBg),
    `observatory: figure ground ${stageBg} vs page ground ${pageBg}`,
  ).toBeLessThan(1.6);

  titleColor = await page
    .locator(".lesson-header__title")
    .evaluate((el) => getComputedStyle(el).color);
  expect(contrastRatio(titleColor, pageBg)).toBeGreaterThanOrEqual(7);
  await page.screenshot({ path: screenshotPath("identity-lesson-observatory.png") });

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("the math roles mean the same thing under either presentation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/vectors");

  const ROLES = [
    "--role-original",
    "--role-transformed",
    "--role-result",
    "--role-basis-1",
    "--role-basis-2",
    "--role-selected",
    "--role-highlight",
    "--role-invariant",
    "--role-intermediate",
    "--role-reachable",
  ];
  const read = () =>
    page.evaluate((names: string[]) => {
      const style = getComputedStyle(document.documentElement);
      return names.map((name) => style.getPropertyValue(name).trim());
    }, ROLES);

  const notebookRoles = await read();
  await selectTheme(page, "observatory");
  const observatoryRoles = await read();

  expect(notebookRoles.every((value) => value.length > 0)).toBe(true);
  expect(observatoryRoles).toEqual(notebookRoles);
});

test("the theme control is keyboard-operable, labelled, and remembered", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const group = page.getByRole("group", { name: "Reading theme" });
  await expect(group).toBeVisible();

  const notebook = themeButton(page, "notebook");
  const observatory = themeButton(page, "observatory");

  // The selected presentation is announced, not merely drawn.
  await expect(notebook).toHaveAttribute("aria-pressed", "true");
  await expect(observatory).toHaveAttribute("aria-pressed", "false");

  // Reachable by keyboard, with a visible focus ring when it gets there.
  let focused = false;
  for (let i = 0; i < 12 && !focused; i += 1) {
    await page.keyboard.press("Tab");
    focused = await observatory.evaluate((el) => el === document.activeElement);
  }
  expect(focused, "the Observatory option is reachable by Tab").toBe(true);

  const outlineWidth = await observatory.evaluate(
    (el) => getComputedStyle(el).outlineWidth,
  );
  expect(parseFloat(outlineWidth), "focused control draws a visible ring").toBeGreaterThan(0);

  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "observatory");
  await expect(observatory).toHaveAttribute("aria-pressed", "true");
  await expect(notebook).toHaveAttribute("aria-pressed", "false");

  // The choice is persisted, and applied before the first paint on reload.
  expect(
    await page.evaluate((key: string) => localStorage.getItem(key), THEME_STORAGE_KEY),
  ).toBe("observatory");

  await page.reload();
  expect(await activeTheme(page)).toBe("observatory");
  await expect(themeButton(page, "observatory")).toHaveAttribute("aria-pressed", "true");

  // And it can be switched back.
  await selectTheme(page, "notebook");
  await page.reload();
  expect(await activeTheme(page)).toBe("notebook");

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("neither presentation overflows a desktop or a phone viewport", async ({ page }) => {
  const errors = collectConsoleErrors(page);

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    for (const route of ["/", "/lesson/vectors"]) {
      await page.goto(route);
      for (const theme of ["notebook", "observatory"] as const) {
        await selectTheme(page, theme);
        expect(
          await horizontalOverflow(page),
          `${route} @ ${viewport.width}px in ${theme} scrolls horizontally`,
        ).toBeLessThanOrEqual(0);
      }
    }
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await selectTheme(page, "notebook");
  // The chapter list is still a usable list on a phone.
  const rows = page.locator(".home-page__list .home-page__link");
  expect(await rows.count()).toBeGreaterThan(1);
  await expect(rows.first()).toBeVisible();
  await page.screenshot({ path: screenshotPath("identity-home-notebook-390.png") });

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});
