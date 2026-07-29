import { expect, test, type Page } from "@playwright/test";

/**
 * `limits-continuity` — applied mathematics L1, the first lesson of the
 * `calculus-foundations` unit.
 *
 * Beyond the ordinary "it loads and grades" checks, this spec pins the two
 * claims the lesson exists to make, because both are easy to lose silently in a
 * refactor:
 *
 *  1. the explorer distinguishes three outcomes — a limit that does not exist, a
 *     window found, and a **finite search that ran out** — rather than
 *     collapsing the last two, which let it report a continuous point as having
 *     no guarantee;
 *  2. the sampling panel reports **no guaranteed band** for a continuous fixture
 *     that declares no modulus — the lesson's continuity correction.
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
    .filter({ has: page.locator("dt", { hasText: label }) })
    .locator("dd");

test("loads, plays its guided scene, and runs its explorer", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/lesson/limits-continuity");

  await expect(
    page.getByRole("heading", { name: /What .approaches. Means/i }),
  ).toBeVisible();

  // The guided scene mounts and advances.
  const scene = page.getByRole("region", { name: /Guided animation/ });
  const canvas = scene.locator(".guided-scene-player__canvas canvas").first();
  await expect(canvas).toBeVisible({ timeout: 20000 });
  const scrubber = scene.locator(".guided-scene-player__scrubber input");
  const play = scene.getByRole("button", { name: "Play", exact: true });
  if (await play.count()) await play.first().click();
  await expect
    .poll(async () => Number(await scrubber.inputValue()), { timeout: 20000 })
    .toBeGreaterThan(0);

  // The three formal blocks the route places, including the modulus — the one
  // an implementer working from habit would be most likely to drop.
  await expect(page.getByTestId("formal-def-limit")).toBeVisible();
  await expect(page.getByTestId("formal-def-continuity")).toBeVisible();
  await expect(page.getByTestId("formal-def-modulus")).toContainText(
    "Modulus of continuity",
  );

  const explorer = page.getByRole("region", { name: /exploration/i }).first();
  await explorer.scrollIntoViewIfNeeded();
  await expect(explorer.locator("canvas, svg").first()).toBeVisible();

  expect(errors).toEqual([]);
});

test("the explorer names WHICH thing failed, and never both at once", async ({
  page,
}) => {
  await page.goto("/lesson/limits-continuity");
  const explorer = page.getByRole("region", { name: /exploration/i }).first();
  await explorer.scrollIntoViewIfNeeded();

  // On the parabola a window is found and the guarantee is met.
  await expect(readout(page, "Guarantee")).toHaveText("met");
  await expect(readout(page, "Largest window found")).toContainText("δ =");

  // Where the limit genuinely fails, the readout says so — it attributes the
  // failure to the mathematics, not to the search.
  await explorer.getByRole("button", { name: /sin\(1\/x\)/ }).click();
  await expect(readout(page, "Guarantee")).toContainText("no limit");
  await expect(readout(page, "Guarantee")).toContainText("oscillation");
  await expect(readout(page, "Forced value")).toContainText("oscillation");

  await explorer.getByRole("button", { name: /1\/x/ }).last().click();
  await expect(readout(page, "Guarantee")).toContainText("no limit");

  // And the contradiction that motivated the fix must be impossible: a point
  // reported continuous can never simultaneously be reported as having no limit.
  await explorer.getByRole("button", { name: /spike between the samples/i }).click();
  const continuous = await readout(page, "Continuous at a").textContent();
  const guarantee = await readout(page, "Guarantee").textContent();
  if (continuous?.trim() === "yes") {
    expect(guarantee).not.toContain("no limit");
  }
});

test("sampling a continuous function with no modulus reports no guaranteed band", async ({
  page,
}) => {
  await page.goto("/lesson/limits-continuity");
  const explorer = page.getByRole("region", { name: /exploration/i }).first();
  await explorer.scrollIntoViewIfNeeded();

  await explorer.getByRole("button", { name: /spike between the samples/i }).click();
  await explorer.getByLabel("Sample it").check();

  // The lesson's correction, on screen: continuity licenses no band…
  await expect(readout(page, "Guaranteed band over one step")).toContainText(
    "declares no modulus",
  );
  // …and the gap the coarse grid leaves is reported rather than assumed away.
  const gap = await readout(page, "Worst true-vs-sampled gap").textContent();
  expect(Number(gap)).toBeGreaterThan(0.9);
  await expect(
    explorer.getByText(/Continuity fixes no window width/i),
  ).toBeVisible();
});

test("grades the symbolic-recognition item, rejecting the reversed quantifiers", async ({
  page,
}) => {
  await page.goto("/lesson/limits-continuity");
  const practice = page.getByRole("region", { name: "Practice exercises" });
  await practice.scrollIntoViewIfNeeded();

  // Item 2 is the multiple choice; step to it.
  await practice.getByRole("button", { name: /Next question/ }).click();

  // The reversed-quantifier distractor must be rejected: naming the window
  // first is a different and much weaker claim.
  await practice.locator('button[data-choice-index="1"]').click();
  await expect(
    practice.locator('.exercise-panel__feedback[data-state="incorrect"]').first(),
  ).toBeVisible();
});
