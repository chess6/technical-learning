import { test, expect, type Page } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("Mafs demo renders, updates from controls, and resets", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/dev/mafs-demo");

  await expect(page.getByRole("heading", { name: "Mafs technical demo" })).toBeVisible();
  await expect(page.locator(".MafsView")).toBeVisible();
  await expect(page.getByTestId("determinant")).toHaveText("2");

  const a11 = page.locator("#matrix-a");
  await a11.fill("0");
  await expect(page.getByTestId("determinant")).toHaveText("0");

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByTestId("determinant")).toHaveText("2");
  await expect(a11).toHaveValue("2");

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("Mafs demo is responsive across two viewport sizes", async ({ page }) => {
  // Stay above the sidebar drawer breakpoint so the main column simply shrinks.
  await page.setViewportSize({ width: 1600, height: 800 });
  await page.goto("/dev/mafs-demo");
  const wide = await page.locator(".MafsView").boundingBox();

  await page.setViewportSize({ width: 1100, height: 800 });
  const narrow = await page.locator(".MafsView").boundingBox();

  expect(wide).not.toBeNull();
  expect(narrow).not.toBeNull();
  expect(narrow!.width).toBeLessThan(wide!.width);
});

test("navigating away from the Mafs demo produces no critical console errors", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/dev/mafs-demo");
  await expect(page.locator(".MafsView")).toBeVisible();
  await page.goto("/lesson/vectors");
  await expect(page.locator(".guided-scene-player__canvas canvas")).toBeVisible();
  await page.goto("/");
  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});
