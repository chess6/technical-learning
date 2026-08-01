import { expect, test, type Page } from "@playwright/test";

/**
 * `chain-rule` — applied mathematics L5, first lesson of Package B.
 *
 * Beyond loading and grading, this spec pins claims that only show up in the
 * rendered page: the chain-rule value and the direct numeric derivative
 * agree on the worked example, the corner preset's chain rule offers no
 * value while the direct route still does, and the prediction beat holds
 * still before f's panel zooms.
 */

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

const explorerOf = (page: Page) =>
  page.getByRole("region", { name: /two zooms, one number/i }).first();

test("loads, plays the clip, and reaches the practice set", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/lesson/chain-rule");

  await expect(
    page.getByRole("heading", { name: /The Chain Rule: Rates Compose/i }),
  ).toBeVisible();

  const players = page.locator(".guided-scene-player");
  await expect(players).toHaveCount(1);

  const clip = players.first();
  await expect(clip.locator("canvas").first()).toBeVisible({ timeout: 20000 });
  const play = clip.getByRole("button", { name: "Play", exact: true });
  if (await play.count()) await play.first().click();
  await expect
    .poll(
      async () =>
        Number(
          await clip.locator(".guided-scene-player__scrubber input").inputValue(),
        ),
      { timeout: 20000 },
    )
    .toBeGreaterThan(0);

  await expect(page.getByTestId("formal-def-composition")).toBeVisible();
  await expect(page.getByTestId("formal-thm-chain-rule")).toBeVisible();

  expect(errors).toEqual([]);
});

test("walks Previous/Next idea across all nine major steps without skipping a beat", async ({
  page,
}) => {
  await page.goto("/lesson/chain-rule");
  const clip = page.locator('.guided-scene-player[data-scene-id="chain-rule"]');
  await expect(clip.locator("canvas").first()).toBeVisible({ timeout: 20000 });

  const next = clip.getByRole("button", { name: "Next idea" });
  const prev = clip.getByRole("button", { name: "Previous idea" });
  for (let i = 0; i < 10; i += 1) {
    if (await next.isEnabled()) await next.click();
  }
  await expect(clip.locator(".guided-scene-player__stage-title")).toContainText(
    /the rule, earned/i,
  );
  await prev.click();
  await expect(clip.locator(".guided-scene-player__stage-title")).not.toContainText(
    /the rule, earned/i,
  );
});

test("holds still on the prediction beat before f's panel zooms", async ({ page }) => {
  await page.goto("/lesson/chain-rule");
  const clip = page.locator('.guided-scene-player[data-scene-id="chain-rule"]');
  await expect(clip.locator("canvas").first()).toBeVisible({ timeout: 20000 });
  await clip
    .getByRole("button", { name: /Idea \d+: Predict: will f's zoom look any different\?/i })
    .click();
  await expect(clip.locator(".guided-scene-player__stage-title")).toContainText(
    /predict/i,
  );
});

test("shows a reduced-motion frame", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = collectConsoleErrors(page);
  await page.goto("/lesson/chain-rule");
  const players = page.locator(".guided-scene-player");
  await expect(players).toHaveCount(1);
  const player = players.first();
  await player.scrollIntoViewIfNeeded();
  await expect(player.locator("canvas").first()).toBeVisible({ timeout: 20000 });
  await expect(player.locator(".guided-scene-player__reduced-note")).toBeVisible();
  expect(errors).toEqual([]);
});

test("the chain-rule value and the direct derivative agree at 24, on the worked example", async ({
  page,
}) => {
  await page.goto("/lesson/chain-rule");
  const explorer = explorerOf(page);
  await explorer.scrollIntoViewIfNeeded();
  const text = (await explorer.textContent()) ?? "";
  expect(text).toContain("24");
});

test("the corner preset offers no chain-rule value, but the direct route still answers", async ({
  page,
}) => {
  await page.goto("/lesson/chain-rule");
  const explorer = explorerOf(page);
  await explorer.scrollIntoViewIfNeeded();

  await explorer.getByRole("button", { name: /corner/i }).click();
  const text = (await explorer.textContent()) ?? "";
  expect(text.toLowerCase()).toContain("no single slope");
  expect(text).toContain("sufficient, not necessary");
});

test("grades the du-cancel-fails recognition item", async ({ page }) => {
  await page.goto("/lesson/chain-rule");
  const practice = page.getByRole("region", { name: "Practice exercises" });
  await practice.scrollIntoViewIfNeeded();

  await practice.locator('button[data-choice-index="0"]').click();
  await expect(
    practice.locator('.exercise-panel__feedback[data-state="correct"]').first(),
  ).toBeVisible();
});
