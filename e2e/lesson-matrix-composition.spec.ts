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

/** Repo-relative `screenshots/` (gitignored), portable across CI/agents. */
function screenshotPath(name: string): string {
  return path.join(process.cwd(), "screenshots", name);
}

test("Matrix Composition lesson: scene beats, order toggle, and the singular case", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/matrix-composition");

  await expect(
    page.getByRole("heading", { name: "Matrix Composition & Inverses", level: 1 }),
  ).toBeVisible();

  // --- Guided Watch scene ---
  const scene = page.getByRole("region", { name: /Guided animation/ });
  await expect(scene.locator(".guided-scene-player__canvas canvas")).toBeVisible();
  const play = scene.getByRole("button", { name: "Play", exact: true });
  if (await play.count()) await play.click();
  await expect(scene.getByRole("button", { name: "Pause" })).toBeEnabled({
    timeout: 8000,
  });
  // Pause so seeking to a beat is stable rather than chased by playback.
  await scene.getByRole("button", { name: "Pause" }).click();

  await expectChaptersMatchMetadata(scene, "matrix-composition");

  // The derivation beat and the collapse beat are the two the lesson turns on,
  // addressed by NAME rather than by an ordinal that moves.
  await gotoChapter(scene, "Column j is where eⱼ ended up");
  await gotoChapter(scene, "When there is nothing to undo");

  // --- Explorer ---
  const explore = page.getByRole("region", {
    name: "Compose two maps, then try to undo them",
  });
  await explore.scrollIntoViewIfNeeded();
  await expect(explore).toBeVisible();

  const product = explore.getByTestId("comp-product-readout");
  const columns = explore.getByTestId("comp-columns-readout");
  const invertible = explore.getByTestId("comp-invertible");

  // Default: A = shear-2-1, B = rotation, apply B first ⇒ AB = [[1,-2],[1,0]].
  await expect(product).toHaveAttribute("data-plain", "[[1, -2], [1, 0]]");
  await expect(columns).toContainText("col₁ = A·col₁(B) = (1, 1)");
  await expect(invertible).toContainText("Yes");

  // Swapping the order changes the composite — the lesson's counterexample,
  // reproduced by the learner rather than asserted.
  await explore.getByTestId("comp-order-a-first").click();
  await expect(product).toHaveAttribute("data-plain", "[[0, -1], [2, 1]]");

  // A singular factor collapses the composite: det 0, and the inverse readout
  // must say so rather than print Infinity.
  await explore.getByTestId("comp-order-b-first").click();
  await explore
    .getByRole("group", { name: "Set B" })
    .getByRole("button", { name: "Collapse" })
    .click();
  await expect(explore.getByTestId("comp-det")).toHaveText("0");
  await expect(invertible).toContainText("No");
  // The inverse readout is behind progressive disclosure, closed by default.
  await explore.getByText("Display options").click();
  await explore.getByLabel("Inverse of the composite").check();
  await expect(explore.getByTestId("comp-inverse-readout")).toHaveAttribute(
    "data-plain",
    "none",
  );

  await explore.getByRole("button", { name: "Reset" }).click();
  await expect(product).toHaveAttribute("data-plain", "[[1, -2], [1, 0]]");

  await page.screenshot({
    path: screenshotPath("matrix-composition-desktop.png"),
    fullPage: true,
  });

  expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
});

test("Matrix Composition lesson stays usable at a narrow viewport", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lesson/matrix-composition");

  await expect(
    page.getByRole("heading", { name: "Matrix Composition & Inverses", level: 1 }),
  ).toBeVisible();

  // The guided canvas must fit its column — no horizontal overflow of the page.
  const canvas = page.locator(".guided-scene-player__canvas canvas");
  await expect(canvas).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "page must not scroll horizontally").toBeLessThanOrEqual(1);

  const explore = page.getByRole("region", {
    name: "Compose two maps, then try to undo them",
  });
  await explore.scrollIntoViewIfNeeded();
  await expect(explore.getByTestId("comp-product-readout")).toBeVisible();

  await page.screenshot({
    path: screenshotPath("matrix-composition-narrow.png"),
    fullPage: true,
  });

  expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
});
