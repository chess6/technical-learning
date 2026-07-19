import { test, expect, type Page } from "@playwright/test";

/**
 * Motion Canvas embedding spike (M2 gate).
 *
 * Validates real browser behavior: rendering, play/pause/reset/seek, responsive
 * resize, engine disposal on navigation, remounting, and the absence of leaked
 * engines/loops/resources across repeated navigation.
 */

type Counters = {
  created: number;
  activeEngines: number;
  mounts: number;
  disposals: number;
  activeLoops: number;
  activeResources: number;
  activeSubscribers: number;
};

async function counters(page: Page): Promise<Counters> {
  return page.evaluate(() => {
    const debug = (window as unknown as {
      __guidedSceneDebug?: { snapshot(): Counters };
    }).__guidedSceneDebug;
    if (!debug) throw new Error("guided scene debug not present");
    return debug.snapshot();
  });
}

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

const canvas = ".guided-scene-player__canvas canvas";
const scrubber = 'input[type="range"]';

test("Motion Canvas scene renders, controls work, and disposes cleanly", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);

  await page.goto("/lesson/vectors");
  await expect(page.locator(canvas)).toBeVisible();

  // Exactly one active engine on a lesson page.
  await expect.poll(async () => (await counters(page)).activeEngines).toBe(1);

  // Play advances progress.
  await page.getByRole("button", { name: "Play" }).click();
  await expect(page.locator(".guided-scene-player__badge")).toHaveText("Playing");
  await expect
    .poll(async () => Number(await page.locator(scrubber).inputValue()), {
      timeout: 5000,
    })
    .toBeGreaterThan(0);

  // Pause holds.
  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.locator(".guided-scene-player__badge")).toHaveText("Paused");

  // Reset returns to the initial frame.
  await page.getByRole("button", { name: "Restart" }).click();
  await expect
    .poll(async () => Number(await page.locator(scrubber).inputValue()))
    .toBeLessThan(0.02);

  // Seek/scrub is reliable: jumping to the final step seeks near the end.
  await page.getByRole("button", { name: /Transformed space/ }).click();
  await expect
    .poll(async () => Number(await page.locator(scrubber).inputValue()), {
      timeout: 5000,
    })
    .toBeGreaterThan(0.8);

  // Still exactly one engine after all interactions.
  expect((await counters(page)).activeEngines).toBe(1);

  // Navigating to a page without a scene disposes the engine.
  await page.getByRole("link", { name: "Linear Algebra" }).first().click();
  await expect.poll(async () => (await counters(page)).activeEngines).toBe(0);

  const afterFirst = await counters(page);
  expect(afterFirst.activeLoops).toBe(0);
  expect(afterFirst.activeResources).toBe(0);
  expect(afterFirst.activeSubscribers).toBe(0);

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("repeated navigation never leaks engines", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/");

  for (let i = 0; i < 4; i += 1) {
    await page.goto("/lesson/vectors");
    await expect(page.locator(canvas)).toBeVisible();
    await expect.poll(async () => (await counters(page)).activeEngines).toBe(1);

    await page.goto("/lesson/eigenvectors");
    await expect(page.locator(canvas)).toBeVisible();
    // Old engine disposed, new one created: still exactly one active.
    await expect.poll(async () => (await counters(page)).activeEngines).toBe(1);

    await page.goto("/");
    await expect.poll(async () => (await counters(page)).activeEngines).toBe(0);
  }

  const final = await counters(page);
  // Active resources fully released; every mount was disposed.
  expect(final.activeEngines).toBe(0);
  expect(final.activeLoops).toBe(0);
  expect(final.activeResources).toBe(0);
  expect(final.activeSubscribers).toBe(0);
  expect(final.disposals).toBeGreaterThanOrEqual(final.mounts);

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("scene resizes with its container", async ({ page }) => {
  // Both viewports stay in the two-column desktop layout (>900px) so we compare
  // like-for-like: a wider viewport must yield a wider canvas that fills its
  // column.
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto("/lesson/vectors");
  await expect(page.locator(canvas)).toBeVisible();
  const wide = await page.locator(canvas).boundingBox();

  await page.setViewportSize({ width: 1000, height: 900 });
  const narrow = await page.locator(canvas).boundingBox();

  expect(wide).not.toBeNull();
  expect(narrow).not.toBeNull();
  expect(narrow!.width).toBeLessThan(wide!.width);
});
