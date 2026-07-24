import { test, expect, type Locator, type Page } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function fillConsistentSolset(
  item: Locator,
  freeCount: string,
  particular: string[],
  direction: string[],
) {
  await item.getByTestId("solset-consistent").click();
  await item.getByTestId("solset-freecount").fill(freeCount);
  for (let i = 0; i < particular.length; i += 1) {
    await item.getByTestId(`solset-particular-${i}`).fill(particular[i]!);
  }
  await item.getByTestId("solset-add-direction").click();
  for (let i = 0; i < direction.length; i += 1) {
    await item.getByTestId(`solset-direction-0-${i}`).fill(direction[i]!);
  }
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

async function fillInconsistentElim(item: Locator, grid: number[][], classification: string) {
  await fillElimGrid(item, grid);
  await item.getByTestId("elim-inconsistent").click();
  await item.getByTestId("elim-classification").fill(classification);
}

/**
 * Package G applied/cumulative set: produced elimination evidence (a
 * row-equivalent echelon matrix, pivots, free count, particular + null
 * directions) and a produced contradiction-row ∅ verdict, captured with deferred
 * feedback, graded from the snapshot, and replayed on reload. Same-origin dev route.
 */
test("package G applied set: produced elimination evidence grades and replays on reload", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto("/dev/assessment");
  await page.evaluate(() => window.localStorage.clear());
  // Both Package G sets are reachable from the dev index.
  await expect(page.getByRole("link", { name: /transfer & selection/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /cumulative & applied/i })).toBeVisible();

  await page.goto("/dev/module/systems-elimination-applied");
  await expect(page.getByTestId("module-submit")).toBeVisible();

  const it3 = page.locator('[data-exercise="mod-p2-applied-3x3"]');
  const itCum = page.locator('[data-exercise="mod-cumulative-elim-solset"]');
  const itRect = page.locator('[data-exercise="mod-p2-applied-rect"]');

  await fillConsistentElim(
    it3,
    [
      [1, 0, 1, 2],
      [0, 1, -3, -3],
      [0, 0, 0, 0],
    ],
    [0, 1],
    "1",
    ["2", "-3", "0"],
    [["-1", "3", "1"]],
  );
  await fillConsistentElim(
    itCum,
    [
      [1, 0, -1, -2],
      [0, 1, 2, 8],
      [0, 0, 0, 0],
    ],
    [0, 1],
    "1",
    ["-2", "8", "0"],
    [["1", "-2", "1"]],
  );
  await fillInconsistentElim(
    itRect,
    [
      [1, 0, 2],
      [0, 1, 1],
      [0, 0, 2],
    ],
    "inconsistent",
  );

  // Nothing is graded/revealed before submit.
  await expect(page.locator(".module-runner__feedback")).toHaveCount(0);
  await expect(page.getByTestId("review-status")).toHaveCount(0);

  await page.getByTestId("module-submit").click();

  // No human items in this set → review is complete once released.
  await expect(page.getByTestId("review-status")).toHaveAttribute("data-status", "REVIEW_COMPLETE");
  for (const id of ["mod-p2-applied-3x3", "mod-cumulative-elim-solset", "mod-p2-applied-rect"]) {
    await expect(
      page.locator(`[data-exercise="${id}"] .module-runner__feedback[data-state="correct"]`),
    ).toBeVisible();
  }

  // Released feedback comes from the snapshot and survives reload.
  await page.reload();
  await expect(page.getByTestId("review-status")).toHaveAttribute("data-status", "REVIEW_COMPLETE");
  await expect(itRect).toContainText("inconsistent");

  expect(errors).toEqual([]);
});

/**
 * Package G transfer set: the written reasoning/proof items enter the human-review
 * queue (Package F human scoring), while the produced solution-set item is
 * auto-graded. Nothing is revealed before submission.
 */
test("package G transfer set: written items route to human review", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto("/dev/assessment");
  await page.evaluate(() => window.localStorage.clear());

  await page.goto("/dev/module/systems-elimination-transfer");
  await expect(page.getByTestId("module-submit")).toBeVisible();

  // Four written items must be human-scored.
  const written = [
    "mod-select-method",
    "mod-transfer-classify",
    "mod-error-diagnose",
    "mod-proof-hyp",
  ];
  for (const id of written) {
    await page
      .locator(`[data-exercise="${id}"] textarea`)
      .fill(`A complete written response for ${id} covering the required reasoning.`);
  }
  // The one auto item: a correct produced solution set.
  await fillConsistentSolset(
    page.locator('[data-exercise="mod-transfer-solset-fresh"]'),
    "1",
    ["3", "0", "-1"],
    ["-2", "1", "0"],
  );

  await expect(page.getByTestId("review-status")).toHaveCount(0);
  await page.getByTestId("module-submit").click();

  // Written items are pending human review.
  await expect(page.getByTestId("review-status")).toHaveAttribute("data-status", "REVIEW_PENDING");
  // The auto solution-set item is graded correct from the snapshot.
  await expect(
    page.locator(
      '[data-exercise="mod-transfer-solset-fresh"] .module-runner__feedback[data-state="correct"]',
    ),
  ).toBeVisible();

  // All four written items are queued for scoring.
  await page.goto("/dev/review");
  await expect(page.getByTestId("review-pass")).toHaveCount(4);
  for (let i = 0; i < 4; i += 1) {
    await page.getByTestId("review-pass").first().click();
    await page.getByTestId("review-score").first().fill("5");
    await page.getByTestId("review-save").first().click();
  }
  await expect(page.getByTestId("review-queue-empty")).toBeVisible();

  await page.goto("/dev/module/systems-elimination-transfer");
  await expect(page.getByTestId("review-status")).toHaveAttribute("data-status", "REVIEW_COMPLETE");

  expect(errors).toEqual([]);
});
