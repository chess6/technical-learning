import { expect, test } from "@playwright/test";

/**
 * The `math-expression` answer field, in a real browser.
 *
 * The component tests already cover the parse-and-preview logic against a
 * simulated DOM. What only a browser can confirm is that KaTeX actually
 * typesets the generated TeX — jsdom will happily accept an HTML string that
 * renders as nothing — and that the whole path from keystroke to grade runs
 * without a console error.
 */

const PAGE = "/dev/expression-input";
const FIELD = "Your answer, as an expression";

test("types ordinary notation and KaTeX really typesets it", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(PAGE);
  const field = page.getByLabel(FIELD).first();
  await expect(field).toBeVisible();

  await field.fill("x^2 + 3x + 2");
  // A real KaTeX node, not just an HTML string that jsdom would have accepted.
  await expect(page.locator(".math-expression__rendered .katex").first()).toBeVisible();

  expect(errors, `console errors: ${errors.join(" | ")}`).toEqual([]);
});

test("grades an equivalent-but-differently-spelled answer as correct", async ({ page }) => {
  await page.goto(PAGE);
  // The factored form of the expansion asked for: value-equivalent, so it
  // passes. This is the capability's whole premise, exercised end to end.
  await page.getByLabel(FIELD).first().fill("(x+1)(x+2)");
  await page.getByRole("button", { name: "Check answer" }).first().click();
  await expect(page.getByText(/^Correct\./).first()).toBeVisible();
});

test("shows which reading an ambiguous input got, before it is submitted", async ({ page }) => {
  await page.goto(PAGE);
  const field = page.getByLabel(FIELD).first();
  const preview = page.locator(".math-expression__rendered").first();

  await field.fill("1/2x");
  await expect(preview).toBeVisible();
  // `\frac{1}{2}x` — the (1/2)·x reading. KaTeX's MathML annotation carries
  // the TeX that was generated.
  await expect(preview).toContainText("2");
  const asDivided = await preview.innerHTML();
  expect(asDivided).toContain("frac");

  await field.fill("1/(2x)");
  const asGrouped = await preview.innerHTML();
  expect(asGrouped).toContain("frac");
  // The two readings must not render identically — that is the entire point.
  expect(asGrouped).not.toBe(asDivided);
});

test("the palette inserts at the caret and is keyboard reachable", async ({ page }) => {
  await page.goto(PAGE);
  const field = page.getByLabel(FIELD).first();
  await field.fill("");

  await page.getByRole("button", { name: /show symbols and operations/i }).first().click();
  const palette = page.getByRole("group", { name: /symbols and operations/i }).first();
  await expect(palette).toBeVisible();

  await palette.getByRole("button", { name: "√", exact: true }).click();
  await expect(field).toHaveValue("sqrt()");

  // The caret sits inside the parentheses, so typing continues the argument.
  await page.keyboard.type("x");
  await expect(field).toHaveValue("sqrt(x)");
});

test("reports an incomplete expression without calling it wrong", async ({ page }) => {
  await page.goto(PAGE);
  await page.getByLabel(FIELD).first().fill("2(x+1");
  await expect(page.locator(".math-expression__error").first()).toContainText(/never closed/i);
});
