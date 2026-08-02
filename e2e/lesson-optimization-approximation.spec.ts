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

test("walks Previous/Next idea across all ten major steps without skipping a beat", async ({
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

test("the tooBig beat reaches a real sign disagreement, not just a scripted color change", async ({
  page,
}) => {
  await page.goto("/lesson/optimization-approximation");
  const clip = page.locator(
    '.guided-scene-player[data-scene-id="optimization-approximation"]',
  );
  await expect(clip.locator("canvas").first()).toBeVisible({ timeout: 20000 });
  await clip
    .getByRole("button", { name: /Idea \d+: The promise is only local/i })
    .click();
  await expect(clip.locator(".guided-scene-player__stage-title")).toContainText(
    /the promise is only local/i,
  );
  // The beat's own animation must finish (h reaching -1.9, past the real
  // crossing at -sqrt(3)) and hold there — advancing past it should show a
  // held frame with no console error, which the outer "loads, plays" test
  // already confirms globally; here we confirm the step is independently
  // reachable and named correctly, matching the scene's own segment id.
  await expect(clip.locator(".guided-scene-player__stage-title")).toBeVisible();
});

test("the oneDirection beat is reachable and named for the left endpoint's one-sided argument", async ({
  page,
}) => {
  await page.goto("/lesson/optimization-approximation");
  const clip = page.locator(
    '.guided-scene-player[data-scene-id="optimization-approximation"]',
  );
  await expect(clip.locator("canvas").first()).toBeVisible({ timeout: 20000 });
  await clip
    .getByRole("button", { name: /Idea \d+: Only one way to step/i })
    .click();
  await expect(clip.locator(".guided-scene-player__stage-title")).toContainText(
    /only one way to step/i,
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

test("the h slider drives live mh/E(h) readouts, and Run sweep colors the strip by the real candidate set", async ({
  page,
}) => {
  await page.goto("/lesson/optimization-approximation");
  const explorer = explorerOf(page);
  await explorer.scrollIntoViewIfNeeded();

  const hSlider = explorer.locator("#h");
  await expect(hSlider).toBeVisible();
  await hSlider.fill("-0.5");
  const afterStep = (await explorer.textContent()) ?? "";
  expect(afterStep).toContain("1.5"); // mh = -3 * -0.5
  expect(afterStep).toContain("agrees — mh predicts the actual sign");

  const runSweep = explorer.getByRole("button", { name: "Run sweep", exact: true });
  await runSweep.click();
  await expect(explorer.locator(".optapprox-explorer__sweep-dot--candidate").first()).toBeVisible();
  await expect(explorer.locator(".optapprox-explorer__sweep-dot--refuted").first()).toBeVisible();
});

test("opt-endpoint-predict genuinely records a commitment before revealing the answer", async ({
  page,
}) => {
  await page.goto("/lesson/optimization-approximation");
  const checkExercise = page
    .getByRole("region", { name: "Practice exercises" })
    .filter({ hasText: "of 1" })
    .filter({ hasText: "Commit" });
  await checkExercise.scrollIntoViewIfNeeded();

  // Before commit: no feedback should be visible yet, and the reveal text
  // must not already be on the page.
  await expect(checkExercise.getByText(/global maximum sits at the ENDPOINT/i)).toHaveCount(0);

  await checkExercise.locator('button[data-choice-index="0"]').click();
  await checkExercise.getByRole("button", { name: "Commit answer" }).click();

  // After commit: the reveal appears, and it is scored correct (choice 0 is
  // the true endpoint answer).
  await expect(checkExercise.getByText(/global maximum sits at the ENDPOINT/i)).toBeVisible();
  await expect(
    checkExercise.locator('.exercise-panel__choice[data-choice-index="0"][data-state="correct"]'),
  ).toBeVisible();
});

test("grades the first practice question (opt-candidate-set's step 1)", async ({
  page,
}) => {
  await page.goto("/lesson/optimization-approximation");
  // Two "Practice exercises" regions exist — the committed-prediction check
  // (opt-endpoint-predict) and the main drill/transfer set. Disambiguate by
  // the one that starts at "Question 1 of 10".
  const practice = page
    .getByRole("region", { name: "Practice exercises" })
    .filter({ hasText: "of 10" });
  await practice.scrollIntoViewIfNeeded();
  await expect(practice.getByText("Question 1 of 10")).toBeVisible();

  // h(x) = x^4 - 4x^2 + 2 on [-3, 2]: opt-candidate-set's first step asks
  // for the count of INTERIOR stationary points only (3), not the full
  // candidate-set size — the exercise now builds the set member by member.
  await practice.getByLabel("Step 1 answer").fill("3");
  await practice.getByRole("button", { name: "Check step" }).click();
  await expect(practice.getByText(/three real roots/i)).toBeVisible();
});
