import { test, expect, type Page } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("Systems lesson loads, guided scene plays, and the explorer walks the trichotomy + near-singular", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/systems");

  await expect(
    page.getByRole("heading", {
      name: "Linear Systems: Two Pictures of One Equation",
    }),
  ).toBeVisible();
  await expect(page.locator(".guided-scene-player__canvas canvas")).toBeVisible();

  // Guided Watch scene plays and can be replayed.
  const play = page.getByRole("button", { name: "Play", exact: true });
  if (await play.count()) await play.click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeEnabled({
    timeout: 8000,
  });
  await page.getByRole("button", { name: "Replay" }).click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeEnabled();

  const explore = page.getByRole("region", { name: "One system, two pictures" });
  await expect(explore).toBeVisible();

  // Default preset: independent columns → exactly one solution.
  await expect(explore.getByTestId("systems-kind-readout")).toHaveText(
    "one solution",
  );
  await expect(explore.getByTestId("systems-columns-readout")).toHaveText(
    "independent",
  );
  await expect(explore.getByTestId("systems-solution-readout")).toHaveAttribute(
    "data-plain",
    "(2, -1)",
  );

  // Infinitely many: dependent columns, b on the span; the t-sweep reaches b.
  await explore.getByRole("button", { name: "Infinitely many" }).click();
  await expect(explore.getByTestId("systems-kind-readout")).toHaveText(
    "infinitely many",
  );
  await expect(explore.getByTestId("systems-columns-readout")).toHaveText(
    "dependent",
  );
  await expect(explore.getByTestId("systems-reach-readout")).toContainText(
    "yes",
  );
  // The recipe parameter slider exists in the dependent case.
  const tSlider = explore.locator("#sys-t");
  await expect(tSlider).toBeVisible();

  // No solution: dependent columns, b off the span; every recipe misses b.
  await explore.getByRole("button", { name: "No solution" }).click();
  await expect(explore.getByTestId("systems-kind-readout")).toHaveText(
    "no solution",
  );
  await expect(explore.getByTestId("systems-reach-readout")).toContainText(
    "no",
  );
  // Sweeping t keeps the endpoint on the columns' line — never reaching b.
  await explore.locator("#sys-t").fill("3");
  await expect(explore.getByTestId("systems-reach-readout")).toContainText(
    "no",
  );

  // Near-singular: still independent (one solution) but off-screen; auto-fit
  // pulls it into view.
  await explore.getByRole("button", { name: "Near-singular" }).click();
  await expect(explore.getByTestId("systems-kind-readout")).toHaveText(
    "one solution",
  );
  await expect(explore.getByTestId("systems-columns-readout")).toHaveText(
    "independent",
  );
  await expect(explore.getByTestId("systems-offscreen-readout")).toContainText(
    "off-screen",
  );
  await explore
    .getByRole("checkbox", { name: "Auto-fit an off-screen solution" })
    .check();
  await expect(explore.getByTestId("systems-offscreen-readout")).toContainText(
    "fitted",
  );

  // Reset returns to the unique preset and clears auto-fit.
  await explore.getByRole("button", { name: "Reset" }).click();
  await expect(explore.getByTestId("systems-kind-readout")).toHaveText(
    "one solution",
  );
  await expect(
    explore.getByRole("checkbox", { name: "Auto-fit an off-screen solution" }),
  ).not.toBeChecked();

  // Practice: the first check classifies the dependent-on-span system.
  const practice = page.getByRole("region", { name: "Practice exercises" });
  await expect(practice.getByText("Question 1 of")).toBeVisible();
  await practice
    .getByRole("button", { name: /the second equation is twice the first/ })
    .click();
  await expect(
    practice.locator('.exercise-panel__feedback[data-state="correct"]').first(),
  ).toContainText("Correct");

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});
