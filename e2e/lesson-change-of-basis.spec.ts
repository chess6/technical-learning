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

test("Change of Basis: the same point named twice, and the diagonal payoff", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/change-of-basis");

  await expect(
    page.getByRole("heading", { name: "Change of Basis", level: 1 }),
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
  await scene
    .getByRole("button", { name: "Idea 3: A different name for the same point" })
    .click();
  await expect(stageTitle).toHaveText("A different name for the same point");
  await scene
    .getByRole("button", {
      name: "Idea 6: The same deformation, described in another basis",
    })
    .click();
  await expect(stageTitle).toHaveText(
    "The same deformation, described in another basis",
  );

  const explore = page.getByRole("region", { name: "The same point, named twice" });
  await explore.scrollIntoViewIfNeeded();

  await expect(explore.getByTestId("cob-coords")).toHaveText("(1, 1)");
  await expect(explore.getByTestId("cob-rebuild")).toHaveText("(4, 1)");

  // The eigenbasis makes the description diagonal — the payoff L11 opens on.
  await explore.getByRole("button", { name: "Eigenbasis of A" }).click();
  await expect(explore.getByTestId("cob-a-in-basis")).toHaveAttribute(
    "data-plain",
    "[[3, 0], [0, 2]]",
  );

  // A dependent pair must be reported, never inverted.
  await explore.getByRole("button", { name: "Dependent (not a basis)" }).click();
  await expect(explore.getByTestId("cob-is-basis")).toContainText("No");
  await expect(explore.getByTestId("cob-a-in-basis")).toHaveAttribute(
    "data-plain",
    "none",
  );

  await explore.getByRole("button", { name: "Reset" }).click();
  await expect(explore.getByTestId("cob-coords")).toHaveText("(1, 1)");

  await page.screenshot({
    path: screenshotPath("change-of-basis-desktop.png"),
    fullPage: true,
  });
  expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
});

test("Change of Basis stays usable at a narrow viewport", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lesson/change-of-basis");

  await expect(
    page.getByRole("heading", { name: "Change of Basis", level: 1 }),
  ).toBeVisible();
  await expect(page.locator(".guided-scene-player__canvas canvas")).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "page must not scroll horizontally").toBeLessThanOrEqual(1);

  await page.screenshot({
    path: screenshotPath("change-of-basis-narrow.png"),
    fullPage: true,
  });
  expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
});
