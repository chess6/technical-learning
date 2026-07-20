import { test, expect, type Page } from "@playwright/test";

/** Lesson 1: Vectors and Linear Combinations — browser behaviour. */

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
  await page.goto("/lesson/vectors");

  await expect(page.getByRole("heading", { name: "Vectors and Linear Combinations" })).toBeVisible();
  await expect(page.locator(canvas)).toBeVisible();

  // Wait for the engine to mount, then ensure playback (autoplay or manual).
  await expect
    .poll(async () => {
      const pause = page.getByRole("button", { name: "Pause" });
      if (await pause.count()) return "playing";
      const play = page.getByRole("button", { name: "Play", exact: true });
      if (await play.count()) {
        await play.click();
        return "clicked";
      }
      return "waiting";
    }, { timeout: 10000 })
    .not.toBe("waiting");
  await expect(page.getByRole("button", { name: "Pause" })).toBeEnabled({ timeout: 8000 });
  await expect
    .poll(async () => Number(await page.locator(scrubber).inputValue()), { timeout: 5000 })
    .toBeGreaterThan(0);

  await page.getByRole("button", { name: "Replay" }).click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeEnabled();

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("coefficient change and dependent preset update the readouts", async ({ page }) => {
  await page.goto("/lesson/vectors");
  const explore = page.getByRole("region", { name: "Build a linear combination" });

  await expect(page.getByTestId("combo-readout")).toHaveAttribute("data-plain", "(4, 1)");

  await page.locator("#coef-a").fill("2");
  await expect(page.getByTestId("combo-readout")).toHaveAttribute("data-plain", "(5, 3)");

  await explore.getByRole("button", { name: "Dependent", exact: true }).click();
  await expect(page.getByTestId("independence-readout")).toHaveText("dependent");
  await expect(page.getByTestId("span-readout")).toHaveText("a line");

  await explore.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByTestId("combo-readout")).toHaveAttribute("data-plain", "(4, 1)");
  await expect(page.getByTestId("span-readout")).toHaveText("the plane");
});

test("exercises run one at a time with next/previous navigation", async ({ page }) => {
  await page.goto("/lesson/vectors");
  const practice = page.getByRole("region", { name: "Practice exercises" });

  await expect(practice.getByText("Question 1 of 3")).toBeVisible();
  // Only the active question is shown at a time.
  await expect(
    practice.getByRole("button", { name: /a single line through the origin/ }),
  ).toHaveCount(0);

  await practice.getByRole("button", { name: /Next question/ }).click();
  await expect(practice.getByText("Question 2 of 3")).toBeVisible();

  await practice.getByRole("button", { name: /a single line through the origin/ }).click();
  const feedback = practice.locator('.exercise-panel__feedback[data-state="correct"]');
  await expect(feedback.first()).toContainText("Correct");

  // Revisiting a previous question preserves navigation.
  await practice.getByRole("button", { name: /Previous/ }).click();
  await expect(practice.getByText("Question 1 of 3")).toBeVisible();
});
