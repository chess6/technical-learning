import { test, expect, type Page } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

const SET = "systems-elimination-mock";

/**
 * Package I end-to-end: the timed mock renders its countdown, captures answers
 * with no correctness/reveal leak (same exam-mode contract as the untimed
 * sets), and releases into a review status on manual submit. A full
 * deadline-elapse isn't feasible in real time (20 minutes) — that path (auto-
 * submit + `mock-auto-submitted`) is covered by the ModuleRunner unit tests.
 */
test("timed mock: countdown renders, capture leaks nothing, manual submit releases", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  // Fresh learner state for a deterministic run.
  await page.goto("/dev/assessment");
  await page.evaluate(() => window.localStorage.clear());

  await page.goto(`/dev/module/${SET}`);
  await expect(page.getByTestId("module-submit")).toBeVisible();

  // The countdown is visible and live (ticking down from the 20-minute limit).
  const countdown = page.getByTestId("mock-countdown");
  await expect(countdown).toBeVisible();
  await expect(countdown).toContainText(/Time remaining:/);
  await expect(countdown).not.toHaveAttribute("data-expired", "true");

  // Answer the two auto-graded elimination items minimally (inconsistent path
  // needs the fewest fields: a typed classification, no pivots/free-vars/
  // vectors to fill in) — capture must not reveal correctness before submit.
  for (const id of ["mod-mock-compute", "mod-mock-classify"]) {
    const item = page.locator(`[data-exercise="${id}"]`);
    await item.locator('[data-testid="elim-inconsistent"]').click();
    await item.locator('[data-testid="elim-classification"]').fill("inconsistent");
    await expect(item.locator(".module-runner__feedback[data-state]")).toHaveCount(0);
  }

  // Answer the proof (human-scored) minimally.
  await page
    .locator('[data-exercise="mod-mock-proof"] textarea')
    .fill("A short written argument for the timed mock proof.");

  // Nothing is graded or revealed anywhere on the page before submit.
  await expect(page.locator(".module-runner__feedback[data-state]")).toHaveCount(0);
  await expect(page.getByTestId("review-status")).toHaveCount(0);

  await page.getByTestId("module-submit").click();

  // Deferred feedback released: a review status appears, the countdown is gone
  // (attempt is no longer live), and this was a manual submit (no auto marker).
  await expect(page.getByTestId("review-status")).toBeVisible();
  await expect(page.getByTestId("mock-countdown")).toHaveCount(0);
  await expect(page.getByTestId("mock-auto-submitted")).toHaveCount(0);

  // Persists across reload.
  await page.reload();
  await expect(page.getByTestId("review-status")).toBeVisible();

  expect(errors).toEqual([]);
});
