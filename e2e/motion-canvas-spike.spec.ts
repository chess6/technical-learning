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

/**
 * The guided-scene engine module (and its debug hook) is lazy-loaded only on
 * lesson routes (see routes.tsx / LessonPage). On routes that never import
 * it — the home page, after a hard navigation — the hook is legitimately
 * absent, which itself proves nothing guided-scene-related loaded there.
 * Treat that as all-zero counters rather than an error.
 */
async function counters(page: Page): Promise<Counters> {
  return page.evaluate(() => {
    const debug = (window as unknown as {
      __guidedSceneDebug?: { snapshot(): Counters };
    }).__guidedSceneDebug;
    if (!debug) {
      return {
        created: 0,
        activeEngines: 0,
        mounts: 0,
        disposals: 0,
        activeLoops: 0,
        activeResources: 0,
        activeSubscribers: 0,
      };
    }
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
const scrubber = ".guided-scene-player__scrubber input";

test("Motion Canvas scene renders, controls work, and disposes cleanly", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);

  await page.goto("/lesson/vectors");
  await expect(page.locator(canvas)).toBeVisible();

  // Exactly one active engine on a lesson page.
  await expect.poll(async () => (await counters(page)).activeEngines).toBe(1);

  // Play advances progress (autoplay may already be running once visible).
  const play = page.getByRole("button", { name: "Play", exact: true });
  if (await play.count()) {
    await play.click();
  }
  await expect(page.getByRole("button", { name: "Pause" })).toBeEnabled({
    timeout: 8000,
  });
  await expect
    .poll(async () => Number(await page.locator(scrubber).inputValue()), {
      timeout: 5000,
    })
    .toBeGreaterThan(0);

  // Pause holds.
  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.locator(".guided-scene-player__stage-title")).toBeVisible();

  // Replay restarts from the beginning and plays.
  await page.getByRole("button", { name: "Replay" }).click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeEnabled();
  await page.getByRole("button", { name: "Pause" }).click();

  // Seek/scrub is reliable: jumping to the final major idea seeks near the end.
  await page.locator(".guided-scene-player__idea-dot").last().click();
  await expect
    .poll(async () => Number(await page.locator(scrubber).inputValue()), {
      timeout: 5000,
    })
    .toBeGreaterThan(0.7);

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
    await expect(page.locator(canvas).first()).toBeVisible();
    await expect.poll(async () => (await counters(page)).activeEngines).toBe(1);

    // Navigate to another single-player lesson: old engine disposed, new one
    // created, so still exactly one active (no accumulation across routes).
    // (Lesson 2 now embeds a second callback player, so use determinants here.)
    await page.goto("/lesson/determinants");
    await expect(page.locator(canvas).first()).toBeVisible();
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
  // Stay in the two-column watch layout: with the desktop sidebar the watch
  // body only reaches its ~58rem two-column threshold above ~1330px, so both
  // sizes sit comfortably above it to compare like-for-like column widths.
  // (vectors is now a full-width standalone visual, so use determinants, which
  // keeps the two-column watch layout.)
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/lesson/determinants");
  await expect(page.locator(canvas).first()).toBeVisible();
  const wide = await page.locator(canvas).first().boundingBox();

  await page.setViewportSize({ width: 1360, height: 900 });
  const narrow = await page.locator(canvas).first().boundingBox();

  expect(wide).not.toBeNull();
  expect(narrow).not.toBeNull();
  expect(narrow!.width).toBeLessThan(wide!.width);
});
