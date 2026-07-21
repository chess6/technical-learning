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

  // Step through the major beats via the idea buttons; the "Watching now"
  // stage title should follow, including the boundary carry beat and trees.
  const stageTitle = page.locator(".guided-scene-player__stage-title");
  for (const beat of [
    "A different rectangle",
    "Two kinds of too big",
    "Four calls or three?",
    "The exponent bends",
  ]) {
    await page.getByRole("button", { name: beat }).click();
    await expect(stageTitle).toContainText(beat);
  }

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

for (const viewport of [
  { width: 768, height: 1024, label: "tablet" },
  { width: 390, height: 844, label: "mobile" },
]) {
  test(`Karatsuba lesson is usable at ${viewport.label} (${viewport.width}px) without cropping key controls`, async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/lesson/karatsuba");

    await expect(
      page.getByRole("heading", {
        name: "Karatsuba: three multiplications instead of four",
      }),
    ).toBeVisible();

    // Guided canvas renders and its controls remain reachable.
    const canvas = page.locator(".guided-scene-player__canvas canvas");
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: "Replay" })).toBeVisible();

    // The canvas is not clipped horizontally beyond the viewport.
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(-1);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);

    // Explorer readout and a key control are visible (not cropped away).
    await expect(page.getByTestId("karatsuba-product")).toBeVisible();
    const explore = page.getByRole("region", {
      name: "Place-value rectangles and three products",
    });
    await explore.getByRole("button", { name: /78 × 56/ }).click();
    await expect(page.getByTestId("karatsuba-product")).toContainText("4368");

    // Practice remains operable at a narrow width.
    const practice = page.getByRole("region", { name: "Practice exercises" });
    await expect(practice.getByText("Question 1 of")).toBeVisible();

    expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
  });
}
