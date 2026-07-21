import { test, expect, type Page } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("Lesson 4 loads, guided scene plays, worked computation, explorer, and exercises work", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/eigenvectors");

  await expect(
    page.getByRole("heading", { name: "Eigenvectors and Eigenvalues" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Watch the idea" }),
  ).toBeVisible();
  await expect(page.locator(".guided-scene-player__canvas canvas").first()).toBeVisible();

  const play = page.getByRole("button", { name: "Play", exact: true }).first();
  if (await play.count()) await play.click();
  await expect(page.getByRole("button", { name: "Pause" }).first()).toBeEnabled({
    timeout: 8000,
  });
  await page.getByRole("button", { name: "Replay" }).first().click();

  await expect(
    page.getByRole("heading", { name: "Worked computation" }),
  ).toBeVisible();
  await expect(page.getByTestId("worked-example-eigen-compute-distinct")).toBeVisible();
  await expect(page.getByTestId("misconception-callout").first()).toBeVisible();

  // Derivation scene idea dots expose ladder rung titles.
  const worked = page.getByRole("region", { name: "Worked computation" });
  const ideaDot = worked.locator(".guided-scene-player__idea-dot").nth(2);
  if (await ideaDot.count()) {
    await ideaDot.click();
    await expect(
      worked.locator(".guided-scene-player__stage-title"),
    ).toContainText(/det\(A|char|λ|lambda|Solve/i);
  }

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
  await expect(practice.getByText(/Check|Drill|Transfer/)).toBeVisible();
  await practice.locator('.exercise-panel__choice[data-choice-index="2"]').click();
  await expect(
    practice.locator('.exercise-panel__feedback[data-state="correct"]').first(),
  ).toContainText("Correct");

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("Lesson 4 expand modal and 3D extension preserve semantic step and single renderer", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/eigenvectors");

  const watchStage = page.getByTestId("eigen-clip-stage").first();
  await expect(watchStage).toBeVisible();
  await expect(
    watchStage.getByRole("button", { name: "2D derivation" }),
  ).toHaveAttribute("aria-pressed", "true");

  // Expand → only this stage's inline unmounts; close → inline returns.
  await watchStage.getByTestId("eigen-expand-clip").click();
  const modal = page.getByTestId("eigen-clip-modal");
  await expect(modal).toBeVisible();
  await expect(watchStage.getByTestId("eigen-clip-inline")).toHaveCount(0);
  // Expand remounts the player — modal should autoplay like the inline clip.
  await expect(modal.getByRole("button", { name: "Pause" })).toBeEnabled({
    timeout: 6000,
  });
  await expect(modal.locator('[data-step-id="fan"], [data-step-id="recap"]').first()).toHaveAttribute(
    "data-active",
    "true",
  );

  await modal
    .locator('[data-step-id="equation"], [data-step-id="highlight"]')
    .first()
    .click();
  await page.getByTestId("eigen-clip-modal-close").click();
  await expect(modal).toHaveCount(0);
  await expect(watchStage.getByTestId("eigen-clip-inline")).toBeVisible();

  // See it in 3D — different example note; Reset view when canvas mounts.
  await watchStage.getByTestId("eigen-see-3d").click();
  await expect(watchStage).toHaveAttribute("data-mode", "extension");
  await expect(watchStage.getByText(/different 3×3 example/i)).toBeVisible();

  const threeD = watchStage.getByTestId("eigen-3d-extension");
  const fallback = watchStage.getByTestId("eigen-3d-fallback");
  await expect(threeD.or(fallback)).toBeVisible({ timeout: 45000 });
  if (await threeD.count()) {
    await expect(watchStage.getByTestId("eigen-3d-reset-view")).toBeVisible();
    const canvas = threeD.locator("canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2);
      await page.mouse.up();
    }
    await watchStage.getByTestId("eigen-3d-reset-view").click();
  }

  await watchStage.getByRole("button", { name: "2D derivation" }).click();
  await expect(watchStage).toHaveAttribute("data-mode", "derivation");

  await watchStage.getByTestId("eigen-expand-clip").click();
  await expect(page.getByTestId("eigen-clip-modal")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("eigen-clip-modal")).toHaveCount(0);

  await page.goto("/");
  await page.goto("/lesson/eigenvectors");
  await expect(page.getByTestId("eigen-clip-stage").first()).toBeVisible();
  const canvasCount = await page.locator("canvas").count();
  expect(canvasCount).toBeGreaterThan(0);
  expect(canvasCount).toBeLessThan(12);

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("non-eigen lesson does not load the three.js chunk", async ({ page }) => {
  const threeRequests: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (/three|react-three|Eigen3D/i.test(url)) {
      threeRequests.push(url);
    }
  });
  await page.goto("/lesson/vectors");
  await expect(
    page.getByRole("heading", { name: "Vectors and Linear Combinations", level: 1 }),
  ).toBeVisible();
  await expect(page.getByTestId("eigen-clip-stage")).toHaveCount(0);
  await page.waitForTimeout(500);
  expect(threeRequests, threeRequests.join("\n")).toEqual([]);
});
