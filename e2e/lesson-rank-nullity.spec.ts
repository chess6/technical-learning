import path from "node:path";
import { test, expect, type Page } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

function screenshotPath(name: string): string {
  return path.join(process.cwd(), "screenshots", name);
}

test("Rank–Nullity: the ledger balances at n for every shape", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/rank-nullity");

  await expect(
    page.getByRole("heading", {
      name: "Dimension and the Rank–Nullity Theorem",
      level: 1,
    }),
  ).toBeVisible();

  const scene = page.getByRole("region", { name: /Guided animation/ });
  await expect(scene.locator(".guided-scene-player__canvas canvas")).toBeVisible();
  const play = scene.getByRole("button", { name: "Play", exact: true });
  if (await play.count()) await play.click();
  await expect(scene.getByRole("button", { name: "Pause" })).toBeEnabled({
    timeout: 8000,
  });
  await scene.getByRole("button", { name: "Pause" }).click();
  await expect(scene.getByRole("button", { name: /^Idea \d+:/ })).toHaveCount(6);

  const stageTitle = scene.locator(".guided-scene-player__stage-title");
  await scene.getByRole("button", { name: "Idea 4: Spend the budget differently" }).click();
  await expect(stageTitle).toHaveText("Spend the budget differently");
  await scene.getByRole("button", { name: "Idea 6: So this can never happen" }).click();
  await expect(stageTitle).toHaveText("So this can never happen");

  const explore = page.getByRole("region", { name: "Spend the budget" });
  await explore.scrollIntoViewIfNeeded();

  // Wide map: the total is 3 (n), not 2 (m) — the lesson's headline error.
  await expect(explore.getByTestId("rn-total")).toHaveText("2 + 1 = 3");
  await expect(explore.getByTestId("rn-injective")).toHaveText("No");
  await expect(explore.getByTestId("rn-surjective")).toHaveText("Yes");

  // Tall map: the verdicts swap — impossible for a square map.
  await explore.getByRole("button", { name: "ℝ² → ℝ³ (one-to-one)" }).click();
  await expect(explore.getByTestId("rn-injective")).toHaveText("Yes");
  await expect(explore.getByTestId("rn-surjective")).toHaveText("No");
  await expect(explore.getByTestId("rn-total")).toHaveText("2 + 0 = 2");

  await explore.getByRole("button", { name: "Reset" }).click();
  await expect(explore.getByTestId("rn-total")).toHaveText("2 + 1 = 3");

  await page.screenshot({
    path: screenshotPath("rank-nullity-desktop.png"),
    fullPage: true,
  });
  expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
});

test("Rank–Nullity stays usable at a narrow viewport", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lesson/rank-nullity");

  await expect(
    page.getByRole("heading", {
      name: "Dimension and the Rank–Nullity Theorem",
      level: 1,
    }),
  ).toBeVisible();
  await expect(page.locator(".guided-scene-player__canvas canvas")).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "page must not scroll horizontally").toBeLessThanOrEqual(1);

  await page.screenshot({
    path: screenshotPath("rank-nullity-narrow.png"),
    fullPage: true,
  });
  expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
});
