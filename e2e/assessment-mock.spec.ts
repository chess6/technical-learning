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
const STORAGE_KEY = "technical-learning/learner-state/v1";

type StoredAttempt = {
  id: string;
  setId: string;
  status: string;
  startedAt: string;
  timeLimitSec?: number;
  autoSubmittedAt?: string;
  releasedAt?: string;
};

/** The persisted attempts for the mock set, read from the real stored bytes. */
async function storedMockAttempts(page: Page): Promise<StoredAttempt[]> {
  return page.evaluate(
    ([key, setId]) => {
      const raw = window.localStorage.getItem(key!);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as { attemptSets?: Record<string, StoredAttempt> };
      return Object.values(parsed.attemptSets ?? {}).filter((a) => a.setId === setId);
    },
    [STORAGE_KEY, SET],
  );
}

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

/**
 * Package I timer integrity (mandatory regression for review finding 4).
 *
 * The 20-minute limit can't be waited out in a browser test, so the deadline is
 * brought to us through the SANCTIONED recovery path: export the live state, move
 * the attempt's `startedAt` to a few seconds before its deadline, and import it
 * back as the live state. Everything after that is the real product path —
 * expiration observed by the running clock, one automatic submission, the honest
 * notice, the omission, and persistence across a reload.
 */
test("timed mock: an imported near-deadline attempt auto-submits exactly once and persists", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto("/dev/assessment");
  await page.evaluate(() => window.localStorage.clear());

  // 1. Start a real attempt and capture answers — the proof is left BLANK so the
  //    timed-out attempt must record an omission, never a clean pass.
  await page.goto(`/dev/module/${SET}`);
  await expect(page.getByTestId("module-submit")).toBeVisible();
  for (const id of ["mod-mock-compute", "mod-mock-classify"]) {
    const item = page.locator(`[data-exercise="${id}"]`);
    await item.locator('[data-testid="elim-inconsistent"]').click();
    await item.locator('[data-testid="elim-classification"]').fill("inconsistent");
  }
  // Let the debounced answer save land before leaving the page.
  await expect
    .poll(async () => (await storedMockAttempts(page))[0]?.status, { timeout: 5_000 })
    .toBe("in-progress");

  // 2. Export via the recovery page, then move the attempt to 4s before its
  //    deadline. The administered limit rides along in the exported bytes.
  await page.goto("/dev/recovery");
  await page.getByTestId("recovery-export").click();
  const exported = await page.getByTestId("recovery-export-output").inputValue();
  const blob = JSON.parse(exported) as {
    attemptSets: Record<string, StoredAttempt>;
  };
  const attemptId = Object.keys(blob.attemptSets).find(
    (id) => blob.attemptSets[id]!.setId === SET,
  )!;
  const attempt = blob.attemptSets[attemptId]!;
  expect(attempt.timeLimitSec).toBe(1200); // snapshotted limit survives export
  expect(attempt.status).toBe("in-progress");
  const secondsLeft = 4;
  attempt.startedAt = new Date(
    Date.now() - (attempt.timeLimitSec! - secondsLeft) * 1000,
  ).toISOString();

  // 3. Import it back as the live state.
  await page.getByTestId("recovery-import-input").fill(JSON.stringify(blob));
  await page.getByTestId("recovery-import").click();
  await expect(page.getByTestId("recovery-import-message")).toContainText("Imported");

  // 4. Open the set: still live, counting down the last seconds — and NOTHING is
  //    graded or revealed while the attempt is still open.
  await page.goto(`/dev/module/${SET}`);
  const countdown = page.getByTestId("mock-countdown");
  await expect(countdown).toBeVisible();
  await expect(countdown).toContainText(/Time remaining: 0:0\d/);
  await expect(page.locator(".module-runner__feedback[data-state]")).toHaveCount(0);
  await expect(page.getByTestId("review-status")).toHaveCount(0);

  // 5. Expiration is observed by the live clock → ONE automatic submission.
  await expect(page.getByTestId("mock-auto-submitted")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("module-submit")).toHaveCount(0); // manual route closed
  await expect(page.getByTestId("mock-countdown")).toHaveCount(0);

  // 6. Omission handling: the blank required proof keeps this off REVIEW_COMPLETE.
  const status = page.getByTestId("review-status");
  await expect(status).toBeVisible();
  await expect(status).toHaveAttribute("data-status", "REVIEW_FAILED");

  // 7. Exactly once, and honestly recorded in the persisted bytes.
  const persisted = await storedMockAttempts(page);
  expect(persisted).toHaveLength(1);
  expect(persisted[0]!.id).toBe(attemptId);
  expect(persisted[0]!.status).toBe("released");
  expect(persisted[0]!.autoSubmittedAt).toBeTruthy();
  expect(persisted[0]!.autoSubmittedAt).toBe(persisted[0]!.releasedAt);

  // 8. Reload: the release is durable — no second attempt, no re-submission, and
  //    the automatic-submission notice still stands.
  await page.reload();
  await expect(page.getByTestId("mock-auto-submitted")).toBeVisible();
  await expect(page.getByTestId("review-status")).toHaveAttribute("data-status", "REVIEW_FAILED");
  const afterReload = await storedMockAttempts(page);
  expect(afterReload).toHaveLength(1);
  expect(afterReload[0]!.autoSubmittedAt).toBe(persisted[0]!.autoSubmittedAt);

  expect(errors).toEqual([]);
});
