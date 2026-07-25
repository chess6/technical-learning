import path from "node:path";
import { test, expect, type Page } from "@playwright/test";

function screenshotPath(name: string): string {
  return path.join(process.cwd(), "screenshots", name);
}

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

function explorerOf(page: Page) {
  return page.getByRole("region", { name: "Insert on both sides at once" });
}

function readout(page: Page, label: string) {
  return explorerOf(page)
    .locator(".scene-readout__row", { hasText: label })
    .locator("dd")
    .first();
}

test("the lesson loads as the third chapter of Algorithmic Thinking", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/red-black-trees");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Red–Black Trees");
  await expect(page.locator(".course-sidebar")).toHaveAttribute(
    "data-course",
    "algorithmic-thinking",
  );
  await expect(page.locator(".guided-scene-player__canvas canvas")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "One node, drawn two ways" }),
  ).toBeVisible();

  // It follows Binary Search Trees, and leads nowhere — it is the course's last.
  const nav = page.getByRole("navigation", { name: "Lesson navigation" });
  await nav.scrollIntoViewIfNeeded();
  await expect(nav.getByRole("link", { name: /Previous/ })).toContainText(
    "Binary Search Trees",
  );
  await expect(nav.locator(".lesson-nav__link--next")).toHaveCount(0);

  await page.screenshot({
    path: screenshotPath("rbt-lesson-notebook.png"),
    fullPage: true,
  });
  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("the explorer shows both sides of the encoding at once", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/red-black-trees");

  const explorer = explorerOf(page);
  await explorer.scrollIntoViewIfNeeded();
  await expect(explorer.locator(".rb-explorer__svg")).toBeVisible();

  // Legal, with one black count shared by every path — the R3 property, read off.
  await expect(readout(page, "Legal")).toHaveText("yes");
  await expect(readout(page, "Black height")).toHaveText("2");
  await expect(readout(page, "Black nodes per path")).toHaveText("2");

  // The decoded 2–3–4 tree is shown beside it, not merely described.
  await expect(explorer.getByText("20 · 40")).toBeVisible();
  await expect(explorer.getByText("50 · 60 · 70")).toBeVisible();

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("a rotation without its recolour breaks the tree, and only the tree", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/red-black-trees");

  const explorer = explorerOf(page);
  await explorer.scrollIntoViewIfNeeded();

  const orderBefore = await readout(page, "In-order readout").textContent();
  expect(orderBefore).toBe("10, 20, 30, 40, 50, 60, 70");

  await explorer.getByRole("button", { name: "Rotate only (break it)" }).click();

  // The invariant broke…
  await expect(readout(page, "Legal")).not.toHaveText("yes");
  // …and the per-path black counts diverged, which is the actual damage.
  await expect(readout(page, "Black nodes per path")).not.toHaveText("2");
  // …while the ordering is untouched. That contrast IS the misconception repair.
  await expect(readout(page, "In-order readout")).toHaveText(orderBefore!);

  await page.screenshot({ path: screenshotPath("rbt-bare-rotation.png") });
});

test("the cluster rings are off by default and reveal the 2–3–4 nodes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/red-black-trees");

  const explorer = explorerOf(page);
  await explorer.scrollIntoViewIfNeeded();

  await expect(explorer.locator(".rb-explorer__cluster")).toHaveCount(0);
  await explorer.getByRole("checkbox", { name: /red children/i }).check();
  // One ring per black node — one per 2–3–4 node.
  await expect(explorer.locator(".rb-explorer__cluster").first()).toBeVisible();
});

test("the lesson holds up in both themes and at a phone viewport", async ({ page }) => {
  const errors = collectConsoleErrors(page);

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/lesson/red-black-trees");
    for (const theme of ["notebook", "observatory"] as const) {
      await page
        .locator(`.theme-toggle__option[data-theme-option="${theme}"]`)
        .click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(
        overflow,
        `${viewport.width}px in ${theme} scrolls horizontally`,
      ).toBeLessThanOrEqual(0);
    }
  }

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});
