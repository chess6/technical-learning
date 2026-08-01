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
  await expectChaptersMatchMetadata(scene, "rank-nullity");

  await gotoChapter(scene, "Spend the budget differently");
  await gotoChapter(scene, "So this can never happen");

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

/**
 * Package R3 (ADR-004): the proof is the lesson's MAIN LINE, placed by its own
 * `proof` route block — not a collapsed depth layer, and not a second copy of
 * the theorem. This is the assertion that was missing when R3 shipped: the
 * proof rendering had been verified only by a manual screenshot, so a
 * regression in `FormalStatement`'s proof variant would have failed nothing.
 */
test("Rank–Nullity: the proof renders as the main line, distinct from the statement", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/rank-nullity");

  const statement = page.getByTestId("formal-thm-rank-nullity");
  const proof = page.getByTestId("proof-thm-rank-nullity");

  // Both exist, and they are DIFFERENT elements with distinct anchors.
  await expect(statement).toBeVisible();
  await expect(proof).toBeVisible();
  await expect(page.locator("#formal-thm-rank-nullity")).toHaveCount(1);
  await expect(page.locator("#proof-thm-rank-nullity")).toHaveCount(1);

  // The proof is expanded prose, not a <details> the learner must open.
  await expect(proof.locator("details")).toHaveCount(0);
  await expect(proof).toContainText("Proof (Theorem — Rank–Nullity).");
  await expect(proof).toContainText("independent");
  await expect(proof.locator(".formal-statement__proof-end")).toContainText("∎");

  // It does NOT repeat what the statement block already said — the redundancy
  // defect the first R1 design shipped and the R3 review caught.
  await expect(proof).not.toContainText("In words.");
  await expect(statement).not.toContainText("Proof (");

  // Both bold lead-ins survive as real <strong>, not literal asterisks (the
  // ProseWithMath bold-straddling-math hazard in known-failure-modes.md).
  await expect(proof).not.toContainText("**");
  await expect(
    proof.locator("strong", { hasText: "The images span the column space:" }),
  ).toHaveCount(1);
  await expect(
    proof.locator("strong", { hasText: "They are independent:" }),
  ).toHaveCount(1);
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
