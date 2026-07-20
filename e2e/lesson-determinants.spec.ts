import { test, expect, type Page } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("Lesson 3 loads, guided scene plays, explorer and exercises work", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/determinants");

  await expect(
    page.getByRole("heading", { name: "Determinants as Signed Area Scaling" }),
  ).toBeVisible();
  await expect(page.locator(".guided-scene-player__canvas canvas")).toBeVisible();

  const play = page.getByRole("button", { name: "Play", exact: true });
  if (await play.count()) await play.click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeEnabled({
    timeout: 8000,
  });
  await page.getByRole("button", { name: "Replay" }).click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeEnabled();

  const explore = page.getByRole("region", { name: "Stretch and flip signed area" });
  await expect(page.getByTestId("det-value")).toHaveText("2");
  await explore.getByRole("button", { name: "Collapse" }).click();
  await expect(page.getByTestId("det-effect")).toContainText("collapses");
  await explore.getByRole("button", { name: "Negative det" }).click();
  await expect(page.getByTestId("det-effect")).toContainText("reversed");
  await explore.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByTestId("det-value")).toHaveText("2");

  const practice = page.getByRole("region", { name: "Practice exercises" });
  await expect(practice.getByText("Question 1 of")).toBeVisible();
  await practice.getByRole("button", { name: /Next question/ }).click();
  await practice.getByRole("button", { name: /how much the transformation scales area/ }).click();
  await expect(
    practice.locator('.exercise-panel__feedback[data-state="correct"]').first(),
  ).toContainText("Correct");

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});
