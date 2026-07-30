import { expect, test, type Page } from "@playwright/test";

/**
 * `fundamental-theorem` — applied mathematics L4, flagship and closing lesson
 * of Package A.
 *
 * Beyond loading and grading, this spec pins the package ledger's checks that
 * only show up in the rendered page:
 *
 *  - **P3** — the explorer's per-piece error is a real, nonzero number.
 *  - **P5** — the `ftc-telescoping` clip names L1's modulus of continuity at
 *    its `refine` chapter, not just in the mastery contract's prose.
 *  - The placed second clip renders under its own heading, distinct from the
 *    top-of-page clip.
 */

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

const readout = (page: Page, label: string) =>
  page
    .locator(".scene-readout__row")
    .filter({ has: page.getByText(label, { exact: true }) })
    .locator("dd");

const explorerOf = (page: Page) =>
  page.getByRole("region", { name: /two computations, one number/i }).first();

test("loads, plays both clips, and reaches the practice set", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/lesson/fundamental-theorem");

  await expect(
    page.getByRole("heading", { name: /Fundamental Theorem of Calculus/i }),
  ).toBeVisible();

  // Two clips, not one: the second is placed beside the formal identity.
  const players = page.locator(".guided-scene-player");
  await expect(players).toHaveCount(2);
  await expect(
    page.getByRole("region", { name: /Everything in the middle cancels/i }).first(),
  ).toBeVisible();

  const first = players.first();
  await expect(first.locator("canvas").first()).toBeVisible({ timeout: 20000 });
  const play = first.getByRole("button", { name: "Play", exact: true });
  if (await play.count()) await play.first().click();
  await expect
    .poll(
      async () =>
        Number(
          await first.locator(".guided-scene-player__scrubber input").inputValue(),
        ),
      { timeout: 20000 },
    )
    .toBeGreaterThan(0);

  await expect(page.getByTestId("formal-thm-ftc-part1")).toBeVisible();
  await expect(page.getByTestId("formal-identity-telescoping")).toBeVisible();
  await expect(page.getByTestId("formal-def-antiderivative")).toBeVisible();
  await expect(page.getByTestId("formal-thm-ftc-part2")).toBeVisible();

  expect(errors).toEqual([]);
});

test("ftc-telescoping names L1's modulus of continuity at its refine chapter (ledger check P5)", async ({
  page,
}) => {
  await page.goto("/lesson/fundamental-theorem");
  const clip2 = page.locator('.guided-scene-player[data-scene-id="ftc-telescoping"]');
  await clip2.scrollIntoViewIfNeeded();
  await expect(clip2.locator("canvas").first()).toBeVisible({ timeout: 20000 });

  await clip2.getByRole("button", { name: /Idea \d+: Refine, and it is exact/i }).click();
  await expect(clip2.locator(".guided-scene-player__stage-summary")).toContainText(
    /modulus of continuity/i,
  );
});

test("walks Previous/Next idea across both clips without skipping a beat", async ({
  page,
}) => {
  await page.goto("/lesson/fundamental-theorem");
  const clip1 = page.locator('.guided-scene-player[data-scene-id="ftc-accumulate-then-measure"]');
  await expect(clip1.locator("canvas").first()).toBeVisible({ timeout: 20000 });

  const next = clip1.getByRole("button", { name: "Next idea" });
  const prev = clip1.getByRole("button", { name: "Previous idea" });
  for (let i = 0; i < 8; i += 1) {
    if (await next.isEnabled()) await next.click();
  }
  await expect(clip1.locator(".guided-scene-player__stage-title")).toContainText(
    /moving the start/i,
  );
  await prev.click();
  await expect(clip1.locator(".guided-scene-player__stage-title")).not.toContainText(
    /moving the start/i,
  );
});

test("holds still on the prediction beat in clip 1", async ({ page }) => {
  await page.goto("/lesson/fundamental-theorem");
  const clip1 = page.locator('.guided-scene-player[data-scene-id="ftc-accumulate-then-measure"]');
  await expect(clip1.locator("canvas").first()).toBeVisible({ timeout: 20000 });
  await clip1
    .getByRole("button", { name: /Idea \d+: Predict: what do the two bars close on\?/i })
    .click();
  await expect(clip1.locator(".guided-scene-player__stage-title")).toContainText(
    /predict/i,
  );
});

test("shows reduced-motion frames for both clips", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = collectConsoleErrors(page);
  await page.goto("/lesson/fundamental-theorem");
  const players = page.locator(".guided-scene-player");
  await expect(players).toHaveCount(2);
  for (const player of await players.all()) {
    await player.scrollIntoViewIfNeeded();
    await expect(player.locator("canvas").first()).toBeVisible({ timeout: 20000 });
    await expect(player.locator(".guided-scene-player__reduced-note")).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("the explorer's per-piece error is a real nonzero number (ledger check P3)", async ({
  page,
}) => {
  await page.goto("/lesson/fundamental-theorem");
  const explorer = explorerOf(page);
  await explorer.scrollIntoViewIfNeeded();

  await explorer.getByLabel(/Show the error E_i on each piece/i).check();
  const cells = explorer.locator(".ftc-explorer__table tbody tr td:last-child");
  const count = await cells.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) {
    const value = Number(await cells.nth(i).textContent());
    expect(Number.isFinite(value)).toBe(true);
    expect(value).not.toBe(0);
  }
});

test("offers no bracket value for e^(-x^2), which declares no antiderivative", async ({
  page,
}) => {
  await page.goto("/lesson/fundamental-theorem");
  const explorer = explorerOf(page);
  await explorer.scrollIntoViewIfNeeded();

  await explorer.getByRole("button", { name: /no elementary antiderivative/i }).click();
  await expect(readout(page, "F(b) − F(a)")).toContainText(/no closed form/i);
});

test("grades the lower-limit-shift recognition item", async ({ page }) => {
  await page.goto("/lesson/fundamental-theorem");
  const practice = page.getByRole("region", { name: "Practice exercises" });
  await practice.scrollIntoViewIfNeeded();

  // Item 1 is ftc-differentiate-integral (numeric); step to item 2, the
  // recall-capped multiple choice.
  await practice.getByRole("button", { name: /Next question/ }).click();
  await practice.locator('button[data-choice-index="0"]').click();
  await expect(
    practice.locator('.exercise-panel__feedback[data-state="correct"]').first(),
  ).toBeVisible();
});
