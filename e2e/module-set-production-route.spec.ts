import { test, expect, type Page } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

/**
 * Package R3 (ADR-004): the first production surface with no guided scene and
 * no explorer — `workshop` / `assessment` curriculum nodes render through the
 * same `ModuleRunner` the dev route already exercises end-to-end
 * (`e2e/assessment-runner.spec.ts` covers submit → review → score → persist).
 * This spec proves the PRODUCTION route + curriculum wiring specifically:
 * reachable from the sidebar, loads real content, shows the beta notice, and
 * still rejects a spaced one-item set the same way the dev route does.
 */
test("workshop and assessment nodes are reachable from the course sidebar and load", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/solution-sets");

  const sidebar = page.locator("#course-sidebar");
  const workshopLink = sidebar.getByRole("link", {
    name: /Systems & Elimination — transfer & selection/,
  });
  await expect(workshopLink).toBeVisible();
  await expect(workshopLink).toHaveAttribute(
    "href",
    "/set/systems-elimination-transfer",
  );

  const assessmentLink = sidebar.getByRole("link", {
    name: /Systems & Elimination — timed mock/,
  });
  await expect(assessmentLink).toBeVisible();
  await expect(assessmentLink).toHaveAttribute(
    "href",
    "/set/systems-elimination-mock",
  );

  await workshopLink.click();
  await expect(page).toHaveURL(/\/set\/systems-elimination-transfer$/);
  await expect(page.getByText(/Beta — this surface is new/)).toBeVisible();
  await expect(page.getByTestId("module-submit")).toBeVisible();
  await expect(page.locator('[data-exercise="mod-select-method"]')).toBeVisible();

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("assessment node loads the timed mock set directly by URL", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/dev/assessment"); // stable origin before clearing storage
  await page.evaluate(() => window.localStorage.clear());
  await page.goto("/set/systems-elimination-mock");

  await expect(page.getByTestId("module-submit")).toBeVisible();
  await expect(page.locator('[data-exercise="mod-mock-compute"]')).toBeVisible();
  // Time-boxed set (Package I): a countdown is shown.
  await expect(page.getByTestId("mock-countdown")).toBeVisible();

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("the production route rejects a spaced one-item set, same as the dev route", async ({
  page,
}) => {
  await page.goto("/set/systems-elimination-spaced-trichotomy");
  await expect(page.getByTestId("spaced-rejected")).toBeVisible();
  await expect(page.getByTestId("spaced-rejected")).toContainText(
    "opens only when due",
  );
});

/**
 * The promise-and-fulfilment test for the local review workflow.
 *
 * `ModuleRunner` tells a learner a written response is "awaiting review".
 * Until `/review` existed that was false in a production build: `ReviewQueue`
 * was reachable only from `dev/review`, which is dead-code-eliminated, so the
 * response stayed pending with nothing able to score it. This walks the whole
 * path a learner actually has — submit, follow the link the pending status
 * offers, score it there — using only PRODUCTION routes.
 */
test("a written response submitted on a production node can be scored at /review", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  // The WORKSHOP node's set — production-reachable and carrying four
  // human-scored written items.
  const SET = "systems-elimination-transfer";

  await page.goto(`/set/${SET}`);
  await expect(page.getByTestId("module-submit")).toBeVisible();

  // Fill every reviewed item; a blank is recorded as an omission, not a review.
  const written = page.locator("[data-exercise] textarea");
  await expect(written.first()).toBeVisible();
  const count = await written.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) {
    await written.nth(i).fill("A complete written argument covering the required cases.");
  }

  await page.getByTestId("module-submit").click();
  await expect(page.getByTestId("review-status")).toHaveAttribute(
    "data-status",
    "REVIEW_PENDING",
  );

  // The pending status must OFFER the way to resolve itself.
  const pendingLink = page.getByTestId("pending-review-link").first();
  await expect(pendingLink).toBeVisible();
  await pendingLink.click();
  await expect(page).toHaveURL(/\/review$/);

  // The production page states the local-only scope rather than implying
  // a remote reviewer.
  await expect(page.getByText(/not sent anywhere/i)).toBeVisible();
  await expect(page.getByText(/on this device/i).first()).toBeVisible();

  // Score every pending item here, on the production route.
  for (let i = 0; i < count; i += 1) {
    await expect(page.getByTestId("review-pass").first()).toBeVisible();
    await page.getByTestId("review-pass").first().click();
    await page.getByTestId("review-score").first().fill("5");
    await page.getByTestId("review-save").first().click();
  }
  await expect(page.getByTestId("review-queue-empty")).toBeVisible();

  // The attempt's status actually changed as a result.
  await page.goto(`/set/${SET}`);
  await expect(page.getByTestId("review-status")).toHaveAttribute(
    "data-status",
    "REVIEW_COMPLETE",
  );

  expect(errors).toEqual([]);
});
