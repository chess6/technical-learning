import { test, expect, type Page } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("sidebar lists course structure and highlights the current lesson", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/vectors");

  const nav = page.getByRole("navigation", { name: "Course contents" });
  await expect(nav.getByText("Foundations", { exact: true })).toBeVisible();
  await expect(
    nav.locator(".course-sidebar__section-title", { hasText: "Transformations" }),
  ).toBeVisible();
  await expect(
    nav.getByRole("link", { name: /Vectors, Linear Combinations/ }),
  ).toHaveAttribute("aria-current", "page");

  await nav.getByRole("link", { name: /Matrices as Linear Transformations/ }).click();
  await expect(page).toHaveURL(/\/lesson\/transformations/);
  await expect(
    nav.getByRole("link", { name: /Matrices as Linear Transformations/ }),
  ).toHaveAttribute("aria-current", "page");

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("narrow viewport opens the course drawer", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 1024 });
  await page.goto("/lesson/vectors");

  await page.getByRole("button", { name: "Contents" }).click();
  await expect(page.locator(".course-sidebar")).toHaveAttribute("data-open", "true");
  await page.getByRole("button", { name: "Close course contents" }).click();
  await expect(page.locator(".course-sidebar")).toHaveAttribute("data-open", "false");
});

test("unknown lesson route redirects home", async ({ page }) => {
  await page.goto("/lesson/does-not-exist");
  await expect(page).toHaveURL(/\/$/);
});

test("debug counters stay hidden unless ?debug=1", async ({ page }) => {
  await page.goto("/lesson/vectors");
  await expect(page.getByTestId("guided-debug")).toHaveCount(0);

  await page.goto("/lesson/vectors?debug=1");
  await expect(page.getByTestId("guided-debug")).toBeVisible();
});

test("autoplay starts once when the guided scene is visible", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/vectors");
  // Richer opening lessons place the clip below the fold, so bring it into
  // view: autoplay fires once the canvas is substantially visible.
  const canvasEl = page.locator(".guided-scene-player__canvas canvas");
  await expect(canvasEl).toBeVisible();
  await canvasEl.scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: "Pause" })).toBeEnabled({
    timeout: 6000,
  });
});

test("reduced motion does not autoplay continuous motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/vectors");
  await expect(page.getByText(/Reduced motion is on/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Next idea" }).click();
  await expect(page.locator(".guided-scene-player__stage-title")).not.toHaveText("Ready");
});

test("guided canvas frame preserves aspect ratio without page overflow", async ({
  page,
}) => {
  for (const size of [
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
    { width: 800, height: 1024 },
  ]) {
    await page.setViewportSize(size);
    await page.goto("/lesson/vectors");
    const frame = page.getByTestId("guided-canvas-frame");
    await expect(frame).toBeVisible();
    const box = await frame.boundingBox();
    expect(box).not.toBeNull();
    const ratio = box!.width / box!.height;
    expect(ratio).toBeGreaterThan(1.6);
    expect(ratio).toBeLessThan(1.95);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  }
});

test("KaTeX renders conceptual matrix notation on Lesson 2", async ({ page }) => {
  await page.goto("/lesson/transformations");
  await expect(page.locator(".equation-block .katex").first()).toBeVisible();
  await expect(page.getByTestId("matrix-readout").locator(".katex")).toBeVisible();
});
