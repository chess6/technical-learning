import { test, expect, type Page } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

const MODULE = "systems-elimination";
const DAY = 86_400_000;
const ANCHOR = "attempt-anchor";
const DELAYS = [7, 30];
const ITEMS = [
  { setId: "systems-elimination-spaced-trichotomy", exerciseId: "mod-spaced-trichotomy" },
  { setId: "systems-elimination-spaced-uniqueness", exerciseId: "mod-spaced-uniqueness" },
  { setId: "systems-elimination-spaced-rowops", exerciseId: "mod-spaced-rowops" },
];

const stableKey = (exerciseId: string, delayDays: number) =>
  `spaced:${MODULE}:${exerciseId}:${delayDays}`;

/**
 * A fully-valid v3 learner state with a cohort anchored `daysAgo` in the past, so
 * the three 7-day occurrences are DUE and the 30-day ones are not. Hand-built to
 * match the persisted shapes exactly, so it survives cross-record normalization on
 * import (the same sanctioned recovery entry point Package F built — not a backdoor).
 */
function buildSeed(daysAgo: number): string {
  const releasedAt = new Date(Date.now() - daysAgo * DAY).toISOString();
  const spacedReviews: Record<string, unknown> = {};
  for (const { setId, exerciseId } of ITEMS) {
    for (const delayDays of DELAYS) {
      const id = stableKey(exerciseId, delayDays);
      spacedReviews[id] = {
        id,
        moduleId: MODULE,
        exerciseId,
        delayDays,
        setId,
        originAttemptSetId: ANCHOR,
        dueAt: new Date(Date.parse(releasedAt) + delayDays * DAY).toISOString(),
        status: "scheduled",
      };
    }
  }
  const state = {
    schemaVersion: 3,
    lessonProgress: {},
    exerciseAttempts: {},
    bookmarks: [],
    attemptSets: {
      [ANCHOR]: {
        id: ANCHOR,
        setId: "systems-elimination-review",
        setVersion: 1,
        moduleId: MODULE,
        mode: "exam",
        status: "released",
        startedAt: releasedAt,
        submittedAt: releasedAt,
        releasedAt,
        items: [],
        responses: [],
      },
    },
    reviews: {},
    spacedReviews,
    spacedCohorts: {
      [MODULE]: {
        moduleId: MODULE,
        status: "seeded",
        anchorAttemptSetId: ANCHOR,
        anchorReleasedAt: releasedAt,
      },
    },
  };
  return JSON.stringify(state);
}

/**
 * Package H end-to-end: seed an already-due occurrence via the recovery Import
 * path, answer it from the due list, and confirm it completes and persists across
 * reload — plus the not-yet-due and generic-route guards.
 */
test("package H: a due spaced occurrence is answered from the list and completes across reload", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  // Import a valid v3 state with a due cohort (sanctioned recovery entry point).
  await page.goto("/dev/recovery");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await page.getByTestId("recovery-import-input").fill(buildSeed(10));
  await page.getByTestId("recovery-import").click();
  await expect(page.getByTestId("recovery-import-message")).toContainText(/import/i);

  // The due list shows the three 7-day occurrences (30-day ones are not due).
  await page.goto("/dev/spaced");
  await expect(page.getByTestId("spaced-due-list")).toBeVisible();
  const trichotomy7 = stableKey("mod-spaced-trichotomy", 7);
  const dueLink = page.locator(`a[data-review-id="${trichotomy7}"]`);
  await expect(dueLink).toBeVisible();
  await expect(page.locator("a[data-review-id]")).toHaveCount(3);

  // Answer the occurrence (multiple-choice: index 2 = "Infinitely many solutions").
  await dueLink.click();
  await expect(page.getByTestId("module-submit")).toBeVisible();
  await page
    .locator('[data-exercise="mod-spaced-trichotomy"] [data-choice-index="2"]')
    .click();
  await page.getByTestId("module-submit").click();
  await expect(page.getByTestId("review-status")).toHaveAttribute("data-status", "REVIEW_COMPLETE");
  // It was marked complete for this attempt — no mismatch notice.
  await expect(page.getByTestId("spaced-mismatch-warning")).toHaveCount(0);

  // It drops off the due list (two 7-day items remain), and stays complete on reload.
  await page.goto("/dev/spaced");
  await expect(page.locator("a[data-review-id]")).toHaveCount(2);
  await expect(page.locator(`a[data-review-id="${trichotomy7}"]`)).toHaveCount(0);
  await page.reload();
  await expect(page.locator("a[data-review-id]")).toHaveCount(2);

  // Revisiting the completed occurrence's URL replays its graded review (the local
  // attempt persists), and it stays REVIEW_COMPLETE across a reload.
  await page.goto(`/dev/spaced/${trichotomy7}`);
  await expect(page.getByTestId("review-status")).toHaveAttribute("data-status", "REVIEW_COMPLETE");
  await page.reload();
  await expect(page.getByTestId("review-status")).toHaveAttribute("data-status", "REVIEW_COMPLETE");

  expect(errors).toEqual([]);
});

test("package H: a not-yet-due occurrence URL is blocked, and the generic route rejects spaced sets", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto("/dev/recovery");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await page.getByTestId("recovery-import-input").fill(buildSeed(10));
  await page.getByTestId("recovery-import").click();
  await expect(page.getByTestId("recovery-import-message")).toContainText(/import/i);

  // The 30-day occurrence is not due yet — its URL mounts no runner.
  await page.goto(`/dev/spaced/${stableKey("mod-spaced-trichotomy", 30)}`);
  await expect(page.getByTestId("spaced-not-due")).toBeVisible();
  await expect(page.getByTestId("module-submit")).toHaveCount(0);

  // The generic module route rejects a spaced set id (no early preview).
  await page.goto("/dev/module/systems-elimination-spaced-trichotomy");
  await expect(page.getByTestId("spaced-rejected")).toBeVisible();
  await expect(page.getByTestId("module-submit")).toHaveCount(0);

  // Spaced sets are not listed on the dev assessment index.
  await page.goto("/dev/assessment");
  await expect(page.getByRole("link", { name: /spaced retrieval/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /spaced-review due list/i })).toBeVisible();

  expect(errors).toEqual([]);
});
