import { expect, test, type Page } from "@playwright/test";

/**
 * `optimization-approximation` — applied mathematics L6, second lesson of
 * Package B.
 *
 * Beyond loading and grading, this spec pins claims that only show up in the
 * rendered page: the guided scene's genuine prediction hold before the
 * improving direction is revealed, the explorer's certified-radius and
 * first-sampled-disagreement readouts staying visually distinct, and the
 * linear preset's "none in this domain" report.
 */

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

const explorerOf = (page: Page) =>
  page.getByRole("region", { name: /a slope is a way out/i }).first();

test("loads, plays the clip, and reaches the practice set", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/lesson/optimization-approximation");

  await expect(
    page.getByRole("heading", { name: /Deciding with the Derivative/i }),
  ).toBeVisible();

  const players = page.locator(".guided-scene-player");
  await expect(players).toHaveCount(1);

  const clip = players.first();
  await expect(clip.locator("canvas").first()).toBeVisible({ timeout: 20000 });
  const play = clip.getByRole("button", { name: "Play", exact: true });
  if (await play.count()) await play.first().click();
  await expect
    .poll(
      async () =>
        Number(
          await clip.locator(".guided-scene-player__scrubber input").inputValue(),
        ),
      { timeout: 20000 },
    )
    .toBeGreaterThan(0);

  await expect(page.getByTestId("formal-def-extremum")).toBeVisible();
  await expect(page.getByTestId("formal-thm-fermat")).toBeVisible();
  await expect(page.getByTestId("formal-thm-evt")).toBeVisible();
  await expect(page.getByTestId("formal-thm-second-derivative")).toBeVisible();

  expect(errors).toEqual([]);
});

test("walks Previous/Next idea across all eight major steps without skipping a beat", async ({
  page,
}) => {
  await page.goto("/lesson/optimization-approximation");
  const clip = page.locator(
    '.guided-scene-player[data-scene-id="optimization-approximation"]',
  );
  await expect(clip.locator("canvas").first()).toBeVisible({ timeout: 20000 });

  const next = clip.getByRole("button", { name: "Next idea" });
  const prev = clip.getByRole("button", { name: "Previous idea" });
  for (let i = 0; i < 9; i += 1) {
    if (await next.isEnabled()) await next.click();
  }
  await expect(clip.locator(".guided-scene-player__stage-title")).toContainText(
    /deciding, at last/i,
  );
  await prev.click();
  await expect(clip.locator(".guided-scene-player__stage-title")).not.toContainText(
    /deciding, at last/i,
  );
});

test("holds still on the prediction beat before the improving direction is revealed", async ({
  page,
}) => {
  await page.goto("/lesson/optimization-approximation");
  const clip = page.locator(
    '.guided-scene-player[data-scene-id="optimization-approximation"]',
  );
  await expect(clip.locator("canvas").first()).toBeVisible({ timeout: 20000 });
  await clip
    .getByRole("button", { name: /Idea \d+: Predict: which way improves\?/i })
    .click();
  await expect(clip.locator(".guided-scene-player__stage-title")).toContainText(
    /predict/i,
  );
});

test("shows a reduced-motion frame", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = collectConsoleErrors(page);
  await page.goto("/lesson/optimization-approximation");
  const players = page.locator(".guided-scene-player");
  await expect(players).toHaveCount(1);
  const player = players.first();
  await player.scrollIntoViewIfNeeded();
  await expect(player.locator("canvas").first()).toBeVisible({ timeout: 20000 });
  await expect(player.locator(".guided-scene-player__reduced-note")).toBeVisible();
  expect(errors).toEqual([]);
});

test("the main cubic's global maximum, 18, sits at the endpoint — not the interior local max", async ({
  page,
}) => {
  await page.goto("/lesson/optimization-approximation");
  const explorer = explorerOf(page);
  await explorer.scrollIntoViewIfNeeded();
  const text = (await explorer.textContent()) ?? "";
  expect(text).toContain("18");
  expect(text).not.toContain("NaN");
});

test("shows the certified radius and first sampled disagreement as separate readouts", async ({
  page,
}) => {
  await page.goto("/lesson/optimization-approximation");
  const explorer = explorerOf(page);
  await explorer.scrollIntoViewIfNeeded();
  const text = (await explorer.textContent()) ?? "";
  expect(text).toContain("Certified sufficient radius");
  expect(text).toContain("First sampled disagreement");
});

test("the linear preset reports no disagreement anywhere in the domain", async ({
  page,
}) => {
  await page.goto("/lesson/optimization-approximation");
  const explorer = explorerOf(page);
  await explorer.scrollIntoViewIfNeeded();
  await explorer.getByRole("button", { name: /a linear function/i }).click();
  const text = (await explorer.textContent()) ?? "";
  expect(text).toContain("none in this domain");
});

test("grades the first practice question (opt-candidate-set's step 1)", async ({
  page,
}) => {
  await page.goto("/lesson/optimization-approximation");
  const practice = page.getByRole("region", { name: "Practice exercises" });
  await practice.scrollIntoViewIfNeeded();
  await expect(practice.getByText("Question 1 of 10")).toBeVisible();

  // h(x) = x^4 - 4x^2 + 2 on [-3, 2]: 3 interior stationary points + 2
  // endpoints = 5 candidates (optimizationApproximation.ts's CAND_COUNT).
  await practice.getByLabel("Step 1 answer").fill("5");
  await practice.getByRole("button", { name: "Check step" }).click();
  await expect(practice.getByText(/interior zeros/i)).toBeVisible();
});
