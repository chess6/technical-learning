import { expect, test } from "@playwright/test";

/**
 * L7 `substitution-parts` in a real browser. Focus: the things jsdom cannot
 * prove — the two proof blocks actually render, the ledger explorer's two
 * panels draw with tiling strips, and the math-expression answer path
 * (type → preview → grade) works end-to-end inside a production lesson page
 * for the first time.
 */

const PAGE = "/lesson/substitution-parts";

test("loads console-clean with both proof blocks and the product-rule lemma rendered", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto(PAGE);
  await expect(page.getByText("Reading the Rules Backwards").first()).toBeVisible();
  await expect(page.getByText("Substitution — the chain rule read backwards").first()).toBeVisible();
  await expect(page.getByText("The product rule — one line from L2's local model").first()).toBeVisible();
  await expect(page.getByText("Integration by parts — the product rule integrated").first()).toBeVisible();
  // The audit-mandated convention definition is on the page.
  await expect(page.getByText("Bounds in decreasing order").first()).toBeVisible();
  expect(errors, errors.join(" | ")).toEqual([]);
});

test("the ledger explorer draws two panels whose strips select as a pair", async ({ page }) => {
  await page.goto(PAGE);
  const explorer = page.locator(".exploration-panel", { hasText: "The area ledger" }).first();
  await explorer.scrollIntoViewIfNeeded();
  const panels = explorer.locator(".subledger__svg");
  await expect(panels).toHaveCount(2);
  // Click the third strip in the x-panel; the readout follows.
  await panels.first().locator(".subledger__strip").nth(2).click();
  await expect(explorer.getByText(/Strip 3 of/)).toBeVisible();
  // Both totals and the proven value are shown as three separate numbers.
  await expect(explorer.getByText("Σ x-strip areas")).toBeVisible();
  await expect(explorer.getByText("Σ u-strip areas")).toBeVisible();
  await expect(explorer.getByText(/F\(g\(b\)\)/)).toBeVisible();
});

test("a math-expression item grades a typed antiderivative inside the lesson", async ({ page }) => {
  await page.goto(PAGE);
  const practice = page.locator(".exercise-panel").first();
  await practice.scrollIntoViewIfNeeded();
  // Question 1 is the committed prediction; commit and advance to the typed item.
  await practice.getByRole("button", { name: /witnessed/i }).click();
  const next = practice.getByRole("button", { name: /next question/i });
  await next.click();
  const field = practice.getByLabel("Your answer, as an expression");
  await expect(field).toBeVisible();
  await field.fill("sin(x^3) + 5"); // the +C family member, deliberately
  await expect(practice.locator(".math-expression__rendered .katex").first()).toBeVisible();
  await practice.getByRole("button", { name: "Check answer" }).click();
  await expect(practice.getByText(/Correct — its derivative is the integrand/)).toBeVisible();
});

test("a wrong antiderivative gets the check-by-differentiating explanation with a witness", async ({ page }) => {
  await page.goto(PAGE);
  const practice = page.locator(".exercise-panel").first();
  await practice.scrollIntoViewIfNeeded();
  await practice.getByRole("button", { name: /witnessed/i }).click();
  await practice.getByRole("button", { name: /next question/i }).click();
  const field = practice.getByLabel("Your answer, as an expression");
  await field.fill("cos(x^3)");
  await practice.getByRole("button", { name: "Check answer" }).click();
  await expect(practice.getByText(/Differentiating your answer does not give the integrand back/)).toBeVisible();
});

test("a mid-typing parse failure does not leak the solution", async ({ page }) => {
  await page.goto(PAGE);
  const practice = page.locator(".exercise-panel").first();
  await practice.scrollIntoViewIfNeeded();
  await practice.getByRole("button", { name: /witnessed/i }).click();
  await practice.getByRole("button", { name: /next question/i }).click();
  const field = practice.getByLabel("Your answer, as an expression");
  await field.fill("sin(x^3");
  await field.press("Enter");
  const text = (await practice.textContent()) ?? "";
  expect(text).toContain("never closed");
  expect(text).not.toContain("output of"); // the explanation's phrasing stays hidden
});
