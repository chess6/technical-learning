import { expect, test } from "@playwright/test";

const PAGE = "/lesson/improper-integrals";

test("loads console-clean with definitions before the p-ladder and no Gaussian value", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(PAGE);
  await expect(page.getByText("Accumulating Forever").first()).toBeVisible();
  await expect(page.getByText("Infinite edge").first()).toBeVisible();
  await expect(page.getByText("Singular edge and split singularity").first()).toBeVisible();
  await expect(page.getByText("The p-ladder").first()).toBeVisible();
  const body = (await page.locator("body").textContent()) ?? "";
  expect(body).not.toContain("√π");
  expect(errors, errors.join(" | ")).toEqual([]);
});

test("explorer gates its analytic verdict and the range slider is keyboard-operable", async ({ page }) => {
  await page.goto(PAGE);
  const explorer = page.locator(".exploration-panel", { hasText: "Move the finite edge" }).first();
  await explorer.scrollIntoViewIfNeeded();
  await expect(explorer.getByText("commit a prediction first")).toBeVisible();
  await explorer.getByRole("button", { name: "Commit prediction" }).click();
  await expect(explorer.getByText("settles", { exact: true })).toBeVisible();
  await expect(explorer.getByRole("button", { name: /e.−x|e\^/ })).toBeVisible();
  await expect(explorer.getByText(/0\.9933 \(exact\)/)).toBeVisible();
  const slider = explorer.getByRole("slider", { name: /Right edge R/ });
  const before = await slider.inputValue();
  await slider.focus();
  await slider.press("ArrowRight");
  expect(Number(await slider.inputValue())).toBeGreaterThan(Number(before));
  await expect(explorer.locator("svg path.improper-explorer__curve")).toBeVisible();
  await expect(explorer.getByText(/No point is drawn at infinity/)).toBeVisible();
});

test("both comparison directions accept valid boundary certificates", async ({ page }) => {
  await page.goto(PAGE);
  const panel = page.locator(".exercise-panel").nth(2);
  await panel.scrollIntoViewIfNeeded();

  await panel.getByLabel("Comparator coefficient C").fill("0.5");
  await panel.getByLabel("Comparator exponent p").fill("2");
  await panel.getByText("The target is integrable on every finite truncation.").click();
  await panel.getByText("The comparator is integrable on every finite truncation.").click();
  await panel.getByRole("button", { name: "Certify comparison" }).click();
  await expect(panel.getByText(/Certified on the whole tail/)).toBeVisible();

  await panel.getByRole("button", { name: /Next question/ }).click();
  await panel.getByLabel("Comparator coefficient C").fill("1");
  await panel.getByLabel("Comparator exponent p").fill("0.5");
  await panel.getByLabel("Comparison direction").selectOption("comparator-lte-target");
  await panel.getByText("The target is integrable on every finite truncation.").click();
  await panel.getByText("The comparator is integrable on every finite truncation.").click();
  await panel.getByLabel("Comparator verdict").selectOption("diverges");
  await panel.getByLabel("Comparison conclusion").selectOption("target-diverges");
  await panel.getByRole("button", { name: "Certify comparison" }).click();
  await expect(panel.getByText(/Certified on the whole tail/)).toBeVisible();
});

test("comparison browser contract covers three majorants and two minorants", async ({ page }) => {
  for (const [C, p] of [[0.5, 1.5], [0.5, 2], [1, 3]]) {
    await page.goto(PAGE);
    const panel = page.locator(".exercise-panel").nth(2);
    await panel.getByLabel("Comparator coefficient C").fill(String(C));
    await panel.getByLabel("Comparator exponent p").fill(String(p));
    await panel.getByText("The target is integrable on every finite truncation.").click();
    await panel.getByText("The comparator is integrable on every finite truncation.").click();
    await panel.getByRole("button", { name: "Certify comparison" }).click();
    await expect(panel.getByText(/Certified on the whole tail/)).toBeVisible();
  }

  for (const [C, p] of [[1, 0.5], [0.25, 0.75]]) {
    await page.goto(PAGE);
    const panel = page.locator(".exercise-panel").nth(2);
    await panel.getByLabel("Comparator coefficient C").fill("0.5");
    await panel.getByLabel("Comparator exponent p").fill("2");
    await panel.getByText("The target is integrable on every finite truncation.").click();
    await panel.getByText("The comparator is integrable on every finite truncation.").click();
    await panel.getByRole("button", { name: "Certify comparison" }).click();
    await panel.getByRole("button", { name: /Next question/ }).click();
    await panel.getByLabel("Comparator coefficient C").fill(String(C));
    await panel.getByLabel("Comparator exponent p").fill(String(p));
    await panel.getByLabel("Comparison direction").selectOption("comparator-lte-target");
    await panel.getByText("The target is integrable on every finite truncation.").click();
    await panel.getByText("The comparator is integrable on every finite truncation.").click();
    await panel.getByLabel("Comparator verdict").selectOption("diverges");
    await panel.getByLabel("Comparison conclusion").selectOption("target-diverges");
    await panel.getByRole("button", { name: "Certify comparison" }).click();
    await expect(panel.getByText(/Certified on the whole tail/)).toBeVisible();
  }
});

test("comparison rejects inverted direction and a missing finite-integrability hypothesis", async ({ page }) => {
  await page.goto(PAGE);
  let panel = page.locator(".exercise-panel").nth(2);
  await panel.getByLabel("Comparator coefficient C").fill("1");
  await panel.getByLabel("Comparator exponent p").fill("2");
  await panel.getByLabel("Comparison direction").selectOption("comparator-lte-target");
  await panel.getByText("The target is integrable on every finite truncation.").click();
  await panel.getByText("The comparator is integrable on every finite truncation.").click();
  await panel.getByRole("button", { name: "Certify comparison" }).click();
  await expect(panel.getByText(/Convergence needs a majorant above the target/)).toBeVisible();

  await page.goto(PAGE);
  panel = page.locator(".exercise-panel").nth(2);
  await panel.getByLabel("Comparator coefficient C").fill("0.5");
  await panel.getByLabel("Comparator exponent p").fill("2");
  await panel.getByText("The target is integrable on every finite truncation.").click();
  await panel.getByRole("button", { name: "Certify comparison" }).click();
  await expect(panel.getByText(/both functions are integrable on every finite truncation/)).toBeVisible();
});

test("mobile explorer and comparison controls do not overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(PAGE);
  const widths = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(widths.body).toBeLessThanOrEqual(widths.viewport + 1);
});
