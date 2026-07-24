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

  // Produce substantive text for EVERY reviewed item (blanks would be omitted).
  const proofs = [
    "sys-prove-trichotomy",
    "elim-explain-invariance",
    "sol-prove-structure",
  ];
  for (const id of proofs) {
    await page
      .locator(`[data-exercise="${id}"] textarea`)
      .fill(`A complete written argument for ${id}, spanning the required cases.`);
  }

  await page.getByTestId("module-submit").click();

  // Deferred feedback released; proofs are pending human review.
  await expect(page.getByTestId("review-status")).toHaveAttribute(
    "data-status",
    "REVIEW_PENDING",
  );

  // Score every pending proof in the shared review queue (finite score required).
  await page.goto("/dev/review");
  for (let i = 0; i < 3; i += 1) {
    await expect(page.getByTestId("review-pass").first()).toBeVisible();
    await page.getByTestId("review-pass").first().click();
    await page.getByTestId("review-score").first().fill("5");
    await expect(page.getByTestId("review-save").first()).toBeEnabled();
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

/**
 * Package F4 recovery: a blank proof is a system omission that can never reach
 * REVIEW_COMPLETE, and the export → reset → import recovery loop restores state.
 */
test("blank proofs stay failed; export/import recovery restores state", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  page.on("dialog", (dialog) => dialog.accept());
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto("/dev/assessment");
  await page.evaluate(() => window.localStorage.clear());

  await page.goto(`/dev/module/${SET}`);
  await expect(page.getByTestId("module-submit")).toBeVisible();

  // Fill only ONE proof; leave the other two blank.
  await page
    .locator('[data-exercise="sys-prove-trichotomy"] textarea')
    .fill("Only this proof is written; the rest are intentionally blank.");
  await page.getByTestId("module-submit").click();
  await expect(page.getByTestId("review-status")).toBeVisible();

  // Only the substantive proof is queued; the two blanks are omitted.
  await page.goto("/dev/review");
  await page.getByTestId("review-pass").first().click();
  await page.getByTestId("review-score").first().fill("8");
  await page.getByTestId("review-save").first().click();
  await expect(page.getByTestId("review-queue-empty")).toBeVisible();

  // The attempt can never be REVIEW_COMPLETE — blanks are failed omissions.
  await page.goto(`/dev/module/${SET}`);
  await expect(page.getByTestId("review-status")).toHaveAttribute(
    "data-status",
    "REVIEW_FAILED",
  );

  // Recovery: export current state, reset to empty, import it back.
  await page.goto("/dev/recovery");
  await expect(page.getByTestId("recovery-status")).toHaveAttribute("data-kind", "healthy");
  await page.getByTestId("recovery-export").click();
  const exported = await page.getByTestId("recovery-export-output").inputValue();
  expect(exported).toContain("attempt");

  await page.getByTestId("recovery-reset").click();
  // After reset the module runner starts a fresh (in-progress) attempt.
  await page.goto(`/dev/module/${SET}`);
  await expect(page.getByTestId("module-submit")).toBeVisible();
  await expect(page.getByTestId("review-status")).toHaveCount(0);

  await page.goto("/dev/recovery");
  await page.getByTestId("recovery-import-input").fill(exported);
  await page.getByTestId("recovery-import").click();
  await expect(page.getByTestId("recovery-import-message")).toContainText("Imported");

  // The imported attempt is released and still REVIEW_FAILED.
  await page.goto(`/dev/module/${SET}`);
  await expect(page.getByTestId("review-status")).toHaveAttribute(
    "data-status",
    "REVIEW_FAILED",
  );

  expect(errors).toEqual([]);
});
