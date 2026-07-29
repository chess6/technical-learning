import { expect, test, type Page } from "@playwright/test";

/**
 * `derivative-local-linearity` — applied mathematics L2.
 *
 * Beyond loading and grading, this spec pins the package ledger's check **P3**:
 * the zoom must never fake straightness. The explorer's residual readout is the
 * observable form of that promise, so the spec drives the magnification to its
 * cap and asserts the residual is still a nonzero number, while the *ratio*
 * E(h)/h goes to zero. A zoom that substituted a straight line would report a
 * residual of zero and fail here.
 */

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

/**
 * A readout row by its EXACT label. `hasText` is a substring match, and
 * "E(h) / h" is a prefix of "E(h) / h for the comparison line" — matching
 * loosely picked up both rows and made the assertion meaningless.
 */
const readout = (page: Page, label: string) =>
  page
    .locator(".scene-readout__row")
    .filter({ has: page.getByText(label, { exact: true }) })
    .locator("dd");

test("loads, plays both clips, and runs its explorer", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/lesson/derivative-local-linearity");

  await expect(
    page.getByRole("heading", { name: /Derivative as Local Linearity/i }),
  ).toBeVisible();

  // Two placed clips, not one: the second is positioned by a `visual` route
  // block naming its scene id.
  const players = page.locator(".guided-scene-player");
  await expect(players).toHaveCount(2);
  await expect(
    page.getByRole("region", { name: /One number, three readings/i }).first(),
  ).toBeVisible();

  const first = players.first();
  await expect(first.locator("canvas").first()).toBeVisible({ timeout: 20000 });
  const play = first.getByRole("button", { name: "Play", exact: true });
  if (await play.count()) await play.first().click();
  await expect
    .poll(
      async () => Number(await first.locator(".guided-scene-player__scrubber input").inputValue()),
      { timeout: 20000 },
    )
    .toBeGreaterThan(0);

  await expect(page.getByTestId("formal-def-derivative")).toBeVisible();
  await expect(page.getByTestId("formal-def-local-linearity")).toContainText("E(h)");

  expect(errors).toEqual([]);
});

test("the residual never reaches zero, however far the zoom goes (ledger check P3)", async ({
  page,
}) => {
  await page.goto("/lesson/derivative-local-linearity");
  const explorer = page.getByRole("region", { name: /exploration/i }).first();
  await explorer.scrollIntoViewIfNeeded();

  const magnification = explorer.getByLabel(/Magnification/);
  const step = explorer.getByLabel(/Step h/);

  const residualAt = async () => {
    const text = await readout(page, "Residual E(h)").textContent();
    return Number(text);
  };
  const ratioAt = async () => Number(await readout(page, "E(h) / h").textContent());

  // At a coarse step both are visible and nonzero.
  await step.fill("0.5");
  expect(Math.abs(await residualAt())).toBeGreaterThan(0);

  // Drive the magnification to its ceiling. The residual must remain nonzero:
  // the curvature has not gone away, and a faked straight line would report 0.
  await magnification.fill("10000");
  await step.fill("0.001");
  expect(Math.abs(await residualAt())).toBeGreaterThan(0);

  // …while the RATIO does go to zero. That contrast is the lesson.
  expect(Math.abs(await ratioAt())).toBeLessThan(0.01);

  // The cap is stated rather than silently applied.
  await expect(explorer.getByText(/Magnification is capped/i)).toBeVisible();
});

test("the comparison line's error ratio settles on a nonzero constant", async ({
  page,
}) => {
  await page.goto("/lesson/derivative-local-linearity");
  const explorer = page.getByRole("region", { name: /exploration/i }).first();
  await explorer.scrollIntoViewIfNeeded();

  await explorer.getByLabel(/Compare against a line of another slope/i).check();
  await explorer.getByLabel(/Comparison slope/).fill("1");
  await explorer.getByLabel(/Step h/).fill("0.001");

  const tangentRatio = Number(await readout(page, "E(h) / h").textContent());
  const otherRatio = Number(
    await readout(page, "E(h) / h for the comparison line").textContent(),
  );

  // The tangent's ratio vanishes; the comparison line's tends to −(offset).
  expect(Math.abs(tangentRatio)).toBeLessThan(0.01);
  expect(otherRatio).toBeLessThan(-0.9);
});

test("grades the derivative-identification item, rejecting the antiderivative", async ({
  page,
}) => {
  await page.goto("/lesson/derivative-local-linearity");
  const practice = page.getByRole("region", { name: "Practice exercises" });
  await practice.scrollIntoViewIfNeeded();

  // Item 2 is the multiple choice; step to it.
  await practice.getByRole("button", { name: /Next question/ }).click();

  // Choice 3 is an antiderivative — differentiation run backwards.
  await practice.locator('button[data-choice-index="3"]').click();
  await expect(
    practice.locator('.exercise-panel__feedback[data-state="incorrect"]').first(),
  ).toBeVisible();
});
