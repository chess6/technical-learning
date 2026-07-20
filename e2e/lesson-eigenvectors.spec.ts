import { test, expect, type Page } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("Lesson 4 loads, guided scene plays, explorer edge cases and exercises work", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/eigenvectors");

  await expect(
    page.getByRole("heading", { name: "Eigenvectors and Eigenvalues" }),
  ).toBeVisible();
  await expect(page.locator(".guided-scene-player__canvas canvas")).toBeVisible();

  const play = page.getByRole("button", { name: "Play", exact: true });
  if (await play.count()) await play.click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeEnabled({
    timeout: 8000,
  });
  await page.getByRole("button", { name: "Replay" }).click();

  const explore = page.getByRole("region", {
    name: "Hunt for invariant directions",
  });
  await expect(page.getByTestId("eigen-kind")).toHaveText("distinct-real");

  await page.locator("#eig-vx").fill("1");
  await page.locator("#eig-vy").fill("0");
  await expect(page.getByTestId("eigen-candidate")).toHaveText("eigen-direction");

  await page.locator("#eig-vx").fill("0");
  await page.locator("#eig-vy").fill("0");
  await expect(page.getByTestId("eigen-candidate")).toHaveText("zero-vector");

  await explore.getByRole("button", { name: "Defective" }).click();
  await expect(page.getByTestId("eigen-kind")).toHaveText("defective-repeated");
  await explore.getByRole("button", { name: "No real" }).click();
  await expect(page.getByTestId("eigen-kind")).toHaveText("complex");
  await explore.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByTestId("eigen-kind")).toHaveText("distinct-real");

  const practice = page.getByRole("region", { name: "Practice exercises" });
  await practice.locator('.exercise-panel__choice[data-choice-index="1"]').click();
  await expect(
    practice.locator('.exercise-panel__feedback[data-state="correct"]').first(),
  ).toContainText("Correct");

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});
