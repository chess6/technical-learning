import { test, expect, type Page } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("Karatsuba lesson loads, guided scene steps, explorer and exercises work", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/karatsuba");

  await expect(
    page.getByRole("heading", {
      name: "Karatsuba: three multiplications instead of four",
    }),
  ).toBeVisible();
  await expect(page.locator(".guided-scene-player__canvas canvas")).toBeVisible({
    timeout: 15000,
  });

  // Major-step buttons are visible from sceneMeta without full playback.
  await expect(
    page.getByRole("button", { name: "Four pieces (FOIL)" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "A different rectangle" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "The exponent bends" }),
  ).toBeVisible();

  const explore = page.getByRole("region", {
    name: "Place-value rectangles and three products",
  });
  await expect(page.getByTestId("karatsuba-product")).toContainText("156");
  await explore.getByRole("button", { name: /78 × 56/ }).click();
  await expect(page.getByTestId("karatsuba-product")).toContainText("4368");
  await expect(page.getByTestId("badge-carrying")).toHaveAttribute(
    "data-active",
    "true",
  );
  await expect(page.getByTestId("badge-width")).toHaveAttribute(
    "data-active",
    "true",
  );
  await explore.getByLabel(/Show recursion tree/i).check();
  await expect(page.getByTestId("tree-leaves-3")).toBeVisible();

  const practice = page.getByRole("region", { name: "Practice exercises" });
  await expect(practice.getByText("Question 1 of")).toBeVisible();
  await practice.getByRole("button", { name: /Next question/ }).click();
  await practice.getByRole("button", { name: /Next question/ }).click();
  // Question 3: exponent choice — correctChoice index 0.
  await practice.locator('button[data-choice-index="0"]').click();
  await expect(
    practice.locator('.exercise-panel__feedback[data-state="correct"]').first(),
  ).toContainText("Correct");

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});
