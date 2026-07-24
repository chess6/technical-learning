import { test, expect, type Page } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

const SET = "systems-elimination-review";

/**
 * Package F mandatory end-to-end: submit → pending review → score → persisted
 * completion. Exercises the dev-gated runner + reviewer on the SAME origin
 * (shared localStorage), deferred feedback, human scoring, and persistence
 * across reload.
 */
test("module runner: submit, review, score, and persist completion", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  // Fresh learner state for a deterministic run.
  await page.goto("/dev/assessment");
  await page.evaluate(() => window.localStorage.clear());

  await page.goto(`/dev/module/${SET}`);
  await expect(page.getByTestId("module-submit")).toBeVisible();

  // Capture must not reveal correctness before submit.
  const firstItem = page.locator('[data-exercise="sys-count-none"]');
  await firstItem.locator('[data-choice-index="0"]').click();
  await expect(
    firstItem.locator('[data-choice-index="0"][data-state]'),
  ).toHaveCount(0);
  await expect(page.getByTestId("review-status")).toHaveCount(0);

  // Produce a proof.
  await page
    .locator('[data-exercise="sys-prove-trichotomy"] textarea')
    .fill("The columns are independent iff the only relation is trivial…");

  await page.getByTestId("module-submit").click();

  // Deferred feedback released; proofs are pending human review.
  await expect(page.getByTestId("review-status")).toHaveAttribute(
    "data-status",
    "REVIEW_PENDING",
  );

  // Score every pending proof in the shared review queue.
  await page.goto("/dev/review");
  for (let i = 0; i < 3; i += 1) {
    await expect(page.getByTestId("review-pass").first()).toBeVisible();
    await page.getByTestId("review-pass").first().click();
    await page.getByTestId("review-save").first().click();
  }
  await expect(page.getByTestId("review-queue-empty")).toBeVisible();

  // Back on the runner the attempt now reports REVIEW_COMPLETE…
  await page.goto(`/dev/module/${SET}`);
  await expect(page.getByTestId("review-status")).toHaveAttribute(
    "data-status",
    "REVIEW_COMPLETE",
  );

  // …and it survives an immediate reload (persisted).
  await page.reload();
  await expect(page.getByTestId("review-status")).toHaveAttribute(
    "data-status",
    "REVIEW_COMPLETE",
  );

  expect(errors).toEqual([]);
});
