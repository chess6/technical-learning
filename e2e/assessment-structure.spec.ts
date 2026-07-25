import { test, expect, type Locator, type Page } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function fillElimGrid(item: Locator, grid: number[][]) {
  for (let r = 0; r < grid.length; r += 1) {
    for (let c = 0; c < grid[r]!.length; c += 1) {
      await item.getByTestId(`elim-cell-${r}-${c}`).fill(String(grid[r]![c]));
    }
  }
}

async function fillConsistentElim(
  item: Locator,
  grid: number[][],
  pivots: number[],
  freeCount: string,
  particular: string[],
  directions: string[][],
) {
  await fillElimGrid(item, grid);
  await item.getByTestId("elim-consistent").click();
  for (const p of pivots) await item.getByTestId(`elim-pivot-${p}`).click();
  await item.getByTestId("elim-freecount").fill(freeCount);
  for (let i = 0; i < particular.length; i += 1) {
    await item.getByTestId(`elim-particular-${i}`).fill(particular[i]!);
  }
  for (let di = 0; di < directions.length; di += 1) {
    await item.getByTestId("elim-add-direction").click();
    for (let i = 0; i < directions[di]!.length; i += 1) {
      await item.getByTestId(`elim-direction-${di}-${i}`).fill(directions[di]![i]!);
    }
  }
}

/**
 * The `structure` module's cumulative review set. This is the first set to run
 * FOUR-variable produced elimination (a 3×5 augmented grid, two null directions)
 * and a HOMOGENEOUS system whose correct particular solution is the zero vector —
 * both new shapes for the capture renderer. It also mixes auto-graded production
 * with human-scored writing in an alternating order, so the run exercises the
 * partial-review path (`REVIEW_PENDING` until the written items are scored).
 */
test("structure review set: 4-variable and homogeneous elimination capture, grade, and persist", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto("/dev/assessment");
  await page.evaluate(() => window.localStorage.clear());
  await expect(page.getByRole("link", { name: /Structure of Linear Maps — cumulative review/i })).toBeVisible();

  await page.goto("/dev/module/structure-review");
  await expect(page.getByTestId("module-submit")).toBeVisible();

  // 3×4 map, rank 2 / nullity 2: two pivots, two independent null directions.
  await fillConsistentElim(
    page.locator('[data-exercise="mod-struct-rank-nullity-ledger"]'),
    [
      [1, 2, 0, 3, 1],
      [0, 0, 1, 1, 1],
      [0, 0, 0, 0, 0],
    ],
    [0, 2],
    "2",
    ["1", "0", "1", "0"],
    [
      ["-2", "1", "0", "0"],
      ["-3", "0", "-1", "1"],
    ],
  );

  // Homogeneous: every true component of the particular solution IS zero, and the
  // grader must accept typed zeros while rejecting blanks.
  await fillConsistentElim(
    page.locator('[data-exercise="mod-struct-eigen-shift"]'),
    [
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [0],
    "2",
    ["0", "0", "0"],
    [
      ["-1", "1", "0"],
      ["-1", "0", "1"],
    ],
  );

  // [A]_B = P⁻¹AP, entered entry-wise.
  const cob = page.locator('[data-exercise="mod-struct-cob-matrix-fresh"]');
  const cobEntries = [
    [-3, -8],
    [4, 7],
  ];
  for (let r = 0; r < 2; r += 1) {
    for (let c = 0; c < 2; c += 1) {
      await cob.locator(`[data-cell="${r}-${c}"]`).fill(String(cobEntries[r]![c]));
    }
  }

  // The two written items route to human scoring.
  for (const id of ["mod-struct-select-method", "mod-struct-diagnose-colspace"]) {
    await page
      .locator(`[data-exercise="${id}"] textarea`)
      .fill(`A complete written response for ${id} covering the required reasoning.`);
  }

  // Deferred feedback: nothing is graded or revealed before submit.
  await expect(page.locator(".module-runner__feedback")).toHaveCount(0);
  await expect(page.getByTestId("review-status")).toHaveCount(0);

  await page.getByTestId("module-submit").click();

  // Written items pending; the three produced items grade correct from the snapshot.
  await expect(page.getByTestId("review-status")).toHaveAttribute("data-status", "REVIEW_PENDING");
  for (const id of [
    "mod-struct-rank-nullity-ledger",
    "mod-struct-eigen-shift",
    "mod-struct-cob-matrix-fresh",
  ]) {
    await expect(
      page.locator(`[data-exercise="${id}"] .module-runner__feedback[data-state="correct"]`),
    ).toBeVisible();
  }

  // Released feedback comes from the snapshot and survives a reload.
  await page.reload();
  await expect(page.getByTestId("review-status")).toHaveAttribute("data-status", "REVIEW_PENDING");
  await expect(
    page.locator(
      '[data-exercise="mod-struct-rank-nullity-ledger"] .module-runner__feedback[data-state="correct"]',
    ),
  ).toBeVisible();

  // Scoring both written items closes the review.
  await page.goto("/dev/review");
  await expect(page.getByTestId("review-pass")).toHaveCount(2);
  for (let i = 0; i < 2; i += 1) {
    await page.getByTestId("review-pass").first().click();
    await page.getByTestId("review-score").first().fill("5");
    await page.getByTestId("review-save").first().click();
  }
  await expect(page.getByTestId("review-queue-empty")).toBeVisible();

  await page.goto("/dev/module/structure-review");
  await expect(page.getByTestId("review-status")).toHaveAttribute("data-status", "REVIEW_COMPLETE");

  expect(errors).toEqual([]);
});

/**
 * The P3 proof set is entirely human-scored: no item may be auto-graded, and the
 * whole set must stay pending until an author scores every response. A regression
 * that auto-graded a proof surface — or let the self-mark stand in for a score —
 * would show up here as an early `REVIEW_COMPLETE`.
 */
test("structure proof set: every item waits for human scoring", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto("/dev/assessment");
  await page.evaluate(() => window.localStorage.clear());

  await page.goto("/dev/module/structure-proof");
  const written = [
    "mod-struct-prove-subspace-inclusion",
    "mod-struct-prove-rank-nullity",
    "mod-struct-derive-similarity",
  ];
  for (const id of written) {
    await page
      .locator(`[data-exercise="${id}"] textarea`)
      .fill(`A complete proof for ${id}, including the counterexample it asks for.`);
  }

  await page.getByTestId("module-submit").click();
  await expect(page.getByTestId("review-status")).toHaveAttribute("data-status", "REVIEW_PENDING");

  await page.goto("/dev/review");
  await expect(page.getByTestId("review-pass")).toHaveCount(3);

  expect(errors).toEqual([]);
});
