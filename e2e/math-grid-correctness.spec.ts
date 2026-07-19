import { test, expect, type Page } from "@playwright/test";

/**
 * Browser regression for the transformed-grid orientation bug
 * (docs/ERROR_LOG.md — A = [[1.8, 0], [1.8, 2.2]]).
 */

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function setRange(page: Page, id: string, value: string) {
  await page.locator(`#${id}`).fill(value);
}

test("explorer basis readouts match columns for grid-bug-repro matrix", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/lesson/transformations");

  // A = [[1.8, 0], [1.8, 2.2]] — Ae1=(1.8,1.8), Ae2=(0,2.2)
  await setRange(page, "m-a", "1.8");
  await setRange(page, "m-b", "0");
  await setRange(page, "m-c", "1.8");
  await setRange(page, "m-d", "2.2");
  await setRange(page, "in-x", "1");
  await setRange(page, "in-y", "1");

  await expect(page.getByTestId("matrix-readout")).toHaveAttribute(
    "data-plain",
    "[[1.8, 0], [1.8, 2.2]]",
  );
  await expect(page.getByTestId("e1-readout")).toHaveAttribute(
    "data-plain",
    "(1.8, 1.8)",
  );
  await expect(page.getByTestId("e2-readout")).toHaveAttribute(
    "data-plain",
    "(0, 2.2)",
  );
  await expect(page.getByTestId("output-readout")).toHaveAttribute(
    "data-plain",
    "(1.8, 4)",
  );
  await expect(page.getByTestId("det-readout")).toContainText("3.96");

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("debug diagnostic preset loads asymmetric matrix without console errors", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/lesson/transformations?debug=1");
  const explore = page.getByRole("region", { name: "Transform the plane" });
  await explore.getByRole("button", { name: /Diag: Diagnostic/ }).click();
  await expect(page.getByTestId("matrix-readout")).toHaveAttribute(
    "data-plain",
    "[[1, 2], [3, 4]]",
  );
  await expect(page.getByTestId("e1-readout")).toHaveAttribute(
    "data-plain",
    "(1, 3)",
  );
  await expect(page.getByTestId("e2-readout")).toHaveAttribute(
    "data-plain",
    "(2, 4)",
  );
  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});
