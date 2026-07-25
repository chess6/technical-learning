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

/**
 * Binary Search Trees — the lesson's central claim, checked in the browser.
 *
 * The claim is that the insertion order chooses the cost while the in-order
 * readout stays put. That is exactly what the explorer is for, so the spec drives
 * it rather than asserting on static prose.
 */

test("the lesson loads with its guided scene and the course frame", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/binary-search-trees");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Binary Search Trees",
  );
  // It belongs to Algorithmic Thinking, and its sidebar says so.
  await expect(page.locator(".course-sidebar")).toHaveAttribute(
    "data-course",
    "algorithmic-thinking",
  );
  await expect(page.locator(".guided-scene-player__canvas canvas")).toBeVisible();

  // The scene is introduced by an authored, content-specific heading — never by
  // a generic phase name.
  await expect(
    page.getByRole("heading", { name: "Where do the midpoints go?" }),
  ).toBeVisible();

  await page.screenshot({
    path: screenshotPath("bst-lesson-notebook.png"),
    fullPage: true,
  });
  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("the insertion order changes the cost while the readout does not", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/binary-search-trees");

  const explorer = page.getByRole("region", {
    name: "Choose the insertion order, choose the cost",
  });
  await explorer.scrollIntoViewIfNeeded();
  await expect(explorer.locator(".bst-explorer__svg")).toBeVisible();

  const readoutValue = (label: string) =>
    explorer
      .locator(".scene-readout__row", { hasText: label })
      .locator("dd")
      .first();

  // Median-first is the initial preset: the minimum height for seven keys.
  await expect(readoutValue("Height (edges)")).toHaveText("2");
  await expect(readoutValue("Worst-case comparisons")).toHaveText("3");
  const sortedReadout = await readoutValue("In-order readout").textContent();
  expect(sortedReadout).toBe("4, 8, 15, 16, 23, 42, 50");

  // Sorted insertion degenerates it to a chain — the whole point of the lesson.
  await explorer.getByRole("button", { name: "Sorted" }).click();
  await expect(readoutValue("Height (edges)")).toHaveText("6");
  await expect(readoutValue("Worst-case comparisons")).toHaveText("7");

  // …and the in-order readout is unmoved. Shape carries cost, not content.
  await expect(readoutValue("In-order readout")).toHaveText(sortedReadout!);

  await page.screenshot({ path: screenshotPath("bst-explorer-chain.png") });

  // Reverse order degenerates the other way, to the same height.
  await explorer.getByRole("button", { name: "Reverse" }).click();
  await expect(readoutValue("Height (edges)")).toHaveText("6");
  await expect(readoutValue("In-order readout")).toHaveText(sortedReadout!);

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("searching highlights exactly the comparisons it pays for", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/binary-search-trees");

  const explorer = page.getByRole("region", {
    name: "Choose the insertion order, choose the cost",
  });
  await explorer.scrollIntoViewIfNeeded();

  // Median-first tree: finding 4 walks 16 → 8 → 4.
  await explorer.getByRole("button", { name: "4", exact: true }).click();
  await expect(
    explorer.locator(".scene-readout__row", { hasText: "Comparisons to find 4" }).locator("dd"),
  ).toHaveText("16 → 8 → 4");
  // One highlighted node per comparison — cost is depth + 1, drawn.
  await expect(explorer.locator(".bst-explorer__node[data-on-path]")).toHaveCount(3);
});

test("the interval toggle is off by default and reveals the inherited ranges", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/binary-search-trees");

  const explorer = page.getByRole("region", {
    name: "Choose the insertion order, choose the cost",
  });
  await explorer.scrollIntoViewIfNeeded();

  // Off by default: turning it on is what makes the interval item a fair test.
  await expect(explorer.locator(".bst-explorer__interval")).toHaveCount(0);
  await explorer
    .getByRole("checkbox", { name: /legal interval/i })
    .check();
  await expect(
    explorer.locator(".bst-explorer__interval").first(),
  ).toBeVisible();
  // The root's range is unbounded on both sides.
  await expect(explorer.getByText("(−∞, ∞)")).toBeVisible();
});

test("the lesson holds up in both themes and at a phone viewport", async ({ page }) => {
  const errors = collectConsoleErrors(page);

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/lesson/binary-search-trees");
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
