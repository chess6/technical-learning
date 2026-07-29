import { expect, test, type Page } from "@playwright/test";

/**
 * `integral-accumulation` — applied mathematics L3.
 *
 * Beyond loading and grading, this spec pins two package-ledger checks in the
 * browser, where the learner actually meets them:
 *
 *  - **P1 — no antiderivative.** The unit suite greps the built lesson; this
 *    spec checks the rendered page, so a term introduced by a component rather
 *    than by the definition is still caught.
 *  - **The monotone restriction on bracketing.** The explorer must say
 *    `no` on a rate that rises and falls, and must not draw bracket bars there.
 *    A lesson that let the explorer bracket everything would contradict its own
 *    recognition item.
 */

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

/** A readout row by its EXACT label. `hasText` is a substring match. */
const readout = (page: Page, label: string) =>
  page
    .locator(".scene-readout__row")
    .filter({ has: page.getByText(label, { exact: true }) })
    .locator("dd");

const explorerOf = (page: Page) =>
  page.getByRole("region", { name: /exploration/i }).first();

test("loads, plays its guided scene, and runs its explorer", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/lesson/integral-accumulation");

  await expect(
    page.getByRole("heading", { name: /Integral as Accumulation/i }),
  ).toBeVisible();

  const player = page.locator(".guided-scene-player").first();
  await expect(player.locator("canvas").first()).toBeVisible({ timeout: 20000 });
  const play = player.getByRole("button", { name: "Play", exact: true });
  if (await play.count()) await play.first().click();
  await expect
    .poll(
      async () =>
        Number(
          await player.locator(".guided-scene-player__scrubber input").inputValue(),
        ),
      { timeout: 20000 },
    )
    .toBeGreaterThan(0);

  await expect(page.getByTestId("formal-def-riemann-sum")).toBeVisible();
  await expect(page.getByTestId("formal-def-definite-integral")).toBeVisible();

  expect(errors).toEqual([]);
});

test("names no antiderivative anywhere on the rendered page (ledger check P1)", async ({
  page,
}) => {
  await page.goto("/lesson/integral-accumulation");

  // Walk the whole page so every lazily-mounted block is on the DOM, then open
  // every disclosure so nothing forbidden hides behind a collapsed layer.
  await page.getByRole("region", { name: "Practice exercises" }).scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 6000);
  const toggles = page.getByRole("button", { name: /show|reveal|more|depth/i });
  for (const toggle of await toggles.all()) {
    await toggle.click({ timeout: 2000 }).catch(() => {});
  }

  // Scoped to the lesson article, not the whole page. The course sidebar names
  // the NEXT lesson — "The Fundamental Theorem of Calculus" — and it is right to:
  // the spine is navigation, and hiding the next node's title would be a
  // different kind of dishonesty. P1 is about what this lesson teaches.
  //
  // `textContent`, not `innerText`: a term inside a collapsed panel is still a
  // term the lesson ships, and this check is about the lesson, not the viewport.
  const text = ((await page.locator("article.lesson-layout").textContent()) ?? "")
    .toLowerCase();
  expect(text.length, "the page rendered too little to be a real check").toBeGreaterThan(
    3000,
  );
  expect(text).not.toContain("antiderivative");
  expect(text).not.toContain("anti-derivative");
  expect(text).not.toContain("fundamental theorem");
  expect(text).not.toContain("indefinite integral");
});

test("the explorer never reports a lucky straddle as a guarantee", async ({
  page,
}) => {
  await page.goto("/lesson/integral-accumulation");
  const explorer = explorerOf(page);
  await explorer.scrollIntoViewIfNeeded();

  // `ex-drive` over its whole domain rises and falls. At the default partition
  // the two sums DO happen to land either side of the answer — and the panel
  // must still refuse the guarantee, because the rate turns. This is the exact
  // case that separates the two rows.
  await expect(readout(page, "Left and right straddle it?")).toContainText(/^yes/i);
  await expect(readout(page, "Guaranteed to?")).toContainText(/^no/i);
  await expect(explorer.getByText(/any straddle is luck/i)).toBeVisible();
  await expect(explorer.locator(".integral-explorer__note")).toContainText(
    /the rate turns on this interval/i,
  );

  // A monotone rate earns the guarantee, and the width is reported.
  await explorer.getByRole("button", { name: "f(x) = x²", exact: true }).click();
  await expect(readout(page, "Guaranteed to?")).toContainText(/^yes/i);

  // …and refining narrows the bracket. The value it is checked against is
  // produced by the same summation route at a finer partition, never by a
  // shortcut.
  const widthAt = async () => {
    const text =
      (await readout(page, "Left and right straddle it?").textContent()) ?? "";
    return Number(text.replace(/[^\d.]/g, ""));
  };
  const coarse = await widthAt();
  await explorer.getByLabel(/Refinement step/).fill("6"); // rung 6 = 64 pieces
  const fine = await widthAt();
  expect(fine).toBeLessThan(coarse);
});

test("the units come from the axes, and change when the axes do", async ({
  page,
}) => {
  await page.goto("/lesson/integral-accumulation");
  const explorer = explorerOf(page);
  await explorer.scrollIntoViewIfNeeded();

  // A drive: (m/s)(s) = m.
  await expect(readout(page, "Units, from the axes")).toContainText("= m");

  // The same construction on a current trace reads charge in coulombs…
  await explorer
    .getByRole("button", { name: "Current against time", exact: true })
    .click();
  await expect(readout(page, "Units, from the axes")).toContainText("= C");

  // …and on a power trace, energy in joules. One machine, different meters.
  await explorer
    .getByRole("button", { name: "Power against time", exact: true })
    .click();
  await expect(readout(page, "Units, from the axes")).toContainText("= J");

  // A fixture that declares no axis units gets no invented unit.
  await explorer.getByRole("button", { name: "f(x) = x²", exact: true }).click();
  await expect(readout(page, "Units, from the axes")).toContainText(
    /declares no axis units/i,
  );
});

test("the plot is draggable, and the panel says so", async ({ page }) => {
  await page.goto("/lesson/integral-accumulation");
  const explorer = explorerOf(page);
  await explorer.scrollIntoViewIfNeeded();

  await expect(explorer.locator(".exploration-panel__summary")).toContainText(
    /drag/i,
  );

  // Dragging an interval handle moves the interval, not the graph.
  const before = Number(await explorer.getByLabel(/End b/).inputValue());
  const handle = explorer.locator("svg circle").last();
  const box = await handle.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width / 2 - 120, box!.y + box!.height / 2, {
    steps: 10,
  });
  await page.mouse.up();
  await expect
    .poll(async () => Number(await explorer.getByLabel(/End b/).inputValue()))
    .toBeLessThan(before);

  // And no control is stranded on the dark canvas.
  await expect(explorer.locator(".exploration-panel__scene input")).toHaveCount(0);
});

test("grades the units item, rejecting 'area'", async ({ page }) => {
  await page.goto("/lesson/integral-accumulation");
  const practice = page.getByRole("region", { name: "Practice exercises" });
  await practice.scrollIntoViewIfNeeded();

  // Item 1 is the fresh-axes units question. "Area" is the misconception the
  // whole lesson exists to dislodge, so the grader must not take it.
  await practice.getByRole("textbox").first().fill("area");
  await practice.getByRole("button", { name: /check|submit/i }).first().click();
  await expect(
    practice.locator('.exercise-panel__feedback[data-state="incorrect"]').first(),
  ).toBeVisible();
});
