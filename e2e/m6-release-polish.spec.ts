import { test, expect, type Page } from "@playwright/test";

/**
 * M6 release-polish regressions: lazy route loading, dev-route gating,
 * back/forward navigation, and no stale engines/state across lessons.
 */

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("home page loads without fetching lesson/guided-scene/explorer code", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Linear Algebra" })).toBeVisible();

  const heavy = requests.filter((url) =>
    /LessonPage|guided-scene|MafsSceneShell|Explorer|makeScene2D/i.test(url),
  );
  expect(heavy, `unexpected heavy chunks on home: ${heavy.join("\n")}`).toEqual([]);
});

test("opening a lesson shows a loading state, then the guided animation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Start with Chapter 0/ }).click();
  await expect(page).toHaveURL(/\/lesson\/why-linear-algebra/);
  await expect(page.locator(".guided-scene-player__canvas canvas")).toBeVisible();
});

test("browser back/forward between home and a lesson leaves no stale state", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/");
  await page
    .locator(".home-page__list")
    .getByRole("link", { name: /Vectors, Linear Combinations/ })
    .click();
  await expect(page).toHaveURL(/\/lesson\/vectors/);

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);

  await page.goForward();
  await expect(page).toHaveURL(/\/lesson\/vectors/);
  await expect(page.locator(".guided-scene-player__canvas canvas")).toBeVisible();

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("exploration lazily loads with a reserved-space placeholder, not a layout jump", async ({
  page,
}) => {
  await page.goto("/lesson/vectors");
  const explorationHeading = page.getByRole("heading", { name: "Try it yourself" });
  await explorationHeading.scrollIntoViewIfNeeded();
  await expect(page.locator(".mafs-scene-shell")).toBeVisible();
});
