import { test, expect, type Page } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("Elimination lesson loads, guided scene plays, and row operations keep the solution set fixed", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/elimination");

  await expect(
    page.getByRole("heading", {
      name: "Elimination: Rewriting a System Without Changing Its Answer",
    }),
  ).toBeVisible();

  // Guided Watch scene renders, plays, and can be replayed.
  await expect(page.locator(".guided-scene-player__canvas canvas")).toBeVisible();
  const play = page.getByRole("button", { name: "Play", exact: true });
  if (await play.count()) await play.click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeEnabled({
    timeout: 8000,
  });
  await page.getByRole("button", { name: "Replay" }).click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeEnabled();

  // The interactive explorer shows the three synchronized views.
  const explore = page.getByRole("region", {
    name: "Elimination: rewrite the system, keep the solutions",
  });
  await expect(explore).toBeVisible();
  await expect(explore.getByTestId("elim-equations")).toBeVisible();
  await expect(explore.getByTestId("elim-augmented")).toBeVisible();

  // Default preset: the running system A x = b has the unique solution (2, -1)
  // and starts unchanged from its own baseline.
  await expect(explore.getByTestId("elim-kind-readout")).toHaveText(
    "one solution",
  );
  await expect(explore.getByTestId("elim-solution-readout")).toHaveText(
    "(2, -1)",
  );
  await expect(explore.getByTestId("elim-preserved-readout")).toHaveAttribute(
    "data-preserved",
    "true",
  );

  // Capture the augmented matrix before elimination so we can prove it changes.
  const augmentedBefore = await explore
    .getByTestId("elim-augmented")
    .innerText();

  // Apply a legal row operation: eliminate x from R2. The matrix/equations must
  // change, but the solution point and the solution set must be preserved.
  await explore.getByRole("button", { name: "Eliminate x from R2" }).click();
  await expect
    .poll(async () => explore.getByTestId("elim-augmented").innerText())
    .not.toBe(augmentedBefore);
  await expect(explore.getByTestId("elim-solution-readout")).toHaveText(
    "(2, -1)",
  );
  await expect(explore.getByTestId("elim-preserved-readout")).toHaveAttribute(
    "data-preserved",
    "true",
  );

  // An illegal move (scale R2 by 0) erases a constraint: the solution set grows
  // and the readout reports honestly that it is no longer preserved.
  await explore.locator("summary", { hasText: "More row operations" }).click();
  await explore.getByRole("button", { name: "Multiply R2 by 0" }).click();
  await expect(explore.getByTestId("elim-kind-readout")).toHaveText(
    "infinitely many",
  );
  await expect(explore.getByTestId("elim-preserved-readout")).toHaveAttribute(
    "data-preserved",
    "false",
  );

  // Reset restores the original system and its preserved solution set.
  await explore.getByRole("button", { name: "Reset system" }).click();
  await expect(explore.getByTestId("elim-kind-readout")).toHaveText(
    "one solution",
  );
  await expect(explore.getByTestId("elim-solution-readout")).toHaveText(
    "(2, -1)",
  );
  await expect(explore.getByTestId("elim-preserved-readout")).toHaveAttribute(
    "data-preserved",
    "true",
  );

  // Practice: the first exercise is a committed prediction — commit the correct
  // choice (the solution stays fixed) and confirm it grades correct.
  const practice = page.getByRole("region", { name: "Practice exercises" });
  await expect(practice.getByText("Question 1 of")).toBeVisible();
  await practice.locator("button[data-choice-index='1']").click();
  await practice.getByRole("button", { name: "Commit answer" }).click();
  await expect(
    practice.locator('.exercise-panel__feedback[data-state="correct"]').first(),
  ).toBeVisible();

  // Proof-of-life screenshot of the triple-view explorer (gitignored).
  await explore.scrollIntoViewIfNeeded();
  await explore.screenshot({
    path: "/home/thomas/Dev/technical-learning/screenshots/elimination-explorer.png",
  });

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});
