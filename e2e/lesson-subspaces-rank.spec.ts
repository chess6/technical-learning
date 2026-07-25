import path from "node:path";
import { test, expect, type Page } from "@playwright/test";
import {
  expectChaptersMatchMetadata,
  gotoChapter,
  ideaChip,
  ideaChips,
} from "./helpers/guidedScene";

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

test("Subspaces & Rank: the two panels, and rank coupled to nullity", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/subspaces-rank");

  await expect(
    page.getByRole("heading", {
      name: "Subspaces, Column Space, Null Space, and Rank",
      level: 1,
    }),
  ).toBeVisible();

  // --- Guided scene ---
  const scene = page.getByRole("region", { name: /Guided animation/ });
  await expect(scene.locator(".guided-scene-player__canvas canvas")).toBeVisible();
  const play = scene.getByRole("button", { name: "Play", exact: true });
  if (await play.count()) await play.click();
  await expect(scene.getByRole("button", { name: "Pause" })).toBeEnabled({
    timeout: 8000,
  });
  await scene.getByRole("button", { name: "Pause" }).click();

  await expectChaptersMatchMetadata(scene, "subspaces-rank");

  // The beats that separate the two spaces are the ones worth pinning, by NAME.
  await gotoChapter(scene, "Name it: the column space");
  await gotoChapter(scene, "Name it: the null space");
  await gotoChapter(scene, "Take away one more");

  // --- Explorer ---
  const explore = page.getByRole("region", { name: "Make a map lose a dimension" });
  await explore.scrollIntoViewIfNeeded();

  await expect(explore.getByTestId("subspace-rank")).toHaveText("2");
  await expect(explore.getByTestId("subspace-nullity")).toHaveText("1");
  await expect(explore.getByTestId("subspace-identity")).toHaveText("2 + 1 = 3");

  // Rank falls, nullity rises by exactly as much — the lesson's whole point.
  await explore.getByRole("button", { name: "Rank 1 (line)" }).click();
  await expect(explore.getByTestId("subspace-rank")).toHaveText("1");
  await expect(explore.getByTestId("subspace-nullity")).toHaveText("2");
  await expect(explore.getByTestId("subspace-shape")).toHaveText("line");

  // The bases name the space they live in.
  await explore.getByText("Show the bases").click();
  await expect(explore.getByTestId("subspace-col-basis")).toBeVisible();
  await expect(explore.getByTestId("subspace-null-basis")).toBeVisible();

  await explore.getByRole("button", { name: "Reset" }).click();
  await expect(explore.getByTestId("subspace-rank")).toHaveText("2");

  await page.screenshot({
    path: screenshotPath("subspaces-rank-desktop.png"),
    fullPage: true,
  });
  expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
});

test("Subspaces & Rank stays usable at a narrow viewport", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lesson/subspaces-rank");

  await expect(
    page.getByRole("heading", {
      name: "Subspaces, Column Space, Null Space, and Rank",
      level: 1,
    }),
  ).toBeVisible();
  await expect(page.locator(".guided-scene-player__canvas canvas")).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "page must not scroll horizontally").toBeLessThanOrEqual(1);

  await page.screenshot({
    path: screenshotPath("subspaces-rank-narrow.png"),
    fullPage: true,
  });
  expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
});
