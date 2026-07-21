import { test, expect, type Page } from "@playwright/test";

/** Lesson 2: Matrices as Linear Transformations — browser behaviour. */

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

const canvas = ".guided-scene-player__canvas canvas";
const scrubber = ".guided-scene-player__scrubber input";

test("route loads, guided scene plays and resets, no console errors", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/lesson/transformations");

  await expect(page.getByRole("heading", { name: "Matrices as Linear Transformations" })).toBeVisible();
  await expect(page.locator(canvas)).toBeVisible();

  const play = page.getByRole("button", { name: "Play", exact: true });
  if (await play.count()) {
    await play.click();
  }
  await expect(page.getByRole("button", { name: "Pause" })).toBeEnabled({ timeout: 8000 });
  await expect
    .poll(async () => Number(await page.locator(scrubber).inputValue()), { timeout: 5000 })
    .toBeGreaterThan(0);

  await page.getByRole("button", { name: "Replay" }).click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeEnabled();

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("matrix control, preset, and scrub update the transformed vector", async ({ page }) => {
  await page.goto("/lesson/transformations");
  const explore = page.getByRole("region", { name: "Transform the plane" });

  await expect(page.getByTestId("matrix-readout")).toHaveAttribute(
    "data-plain",
    "[[2, 1], [0, 1]]",
  );
  await expect(page.getByTestId("output-readout")).toHaveAttribute(
    "data-plain",
    "(3.5, 0.5)",
  );

  await page.locator("#m-a").fill("1");
  await expect(page.getByTestId("output-readout")).toHaveAttribute(
    "data-plain",
    "(2, 0.5)",
  );

  await explore.getByRole("button", { name: "Rotation", exact: true }).click();
  await expect(page.getByTestId("matrix-readout")).toHaveAttribute(
    "data-plain",
    "[[0, -1], [1, 0]]",
  );

  await explore.getByText("Numeric v, display & transition").click();
  await page.locator("#progress").fill("0");
  await expect(page.getByTestId("output-readout")).toHaveAttribute(
    "data-plain",
    "(1.5, 0.5)",
  );

  await explore.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByTestId("matrix-readout")).toHaveAttribute(
    "data-plain",
    "[[2, 1], [0, 1]]",
  );
  await expect(page.getByTestId("output-readout")).toHaveAttribute(
    "data-plain",
    "(3.5, 0.5)",
  );
});

test("exercise feedback connects numbers to geometry", async ({ page }) => {
  await page.goto("/lesson/transformations");
  const practice = page.getByRole("region", { name: "Practice exercises" });

  // Advance to the rotation multiple-choice question (columns are basis images).
  for (let i = 0; i < 12; i += 1) {
    if (await practice.getByText(/Which matrix sends/).count()) break;
    await practice.getByRole("button", { name: /Next question/ }).click();
  }
  await expect(practice.getByText(/Which matrix sends/)).toBeVisible();

  await page.locator('.exercise-panel__choice[data-choice-index="0"]').click();
  const feedback = page.locator('.exercise-panel__feedback[data-state="correct"]');
  await expect(feedback.first()).toContainText("Correct");
  await expect(
    page.locator('.exercise-panel__choice[data-choice-index="0"] .katex'),
  ).toBeVisible();
});
