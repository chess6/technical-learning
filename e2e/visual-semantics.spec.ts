import { test, expect, type Page } from "@playwright/test";

/**
 * Visual-semantic invariants across lessons.
 *
 * Unlike the per-lesson specs (which drive one lesson's full flow), this spec
 * asserts *educational* invariants that must hold no matter how a lesson is
 * authored:
 *
 *   1. The two side-by-side system pictures name their spaces distinctly —
 *      a coefficient space (x, y) and an output space — so a learner never has
 *      to guess whether the panels share a frame.
 *   2. A solution that lands outside the fixed view box is explicitly marked
 *      "off-screen" (near-singular preset) instead of silently vanishing.
 *   3. Under prefers-reduced-motion, a guided scene still shows an establishing
 *      frame (canvas + a named "watching now" stage) rather than a blank box,
 *      and surfaces the reduced-motion affordance.
 *
 * It also captures a small canonical screenshot set (default / key edge case /
 * narrow viewport / reduced motion) under the gitignored `screenshots/`
 * directory using ABSOLUTE paths, per project convention.
 *
 * ORCHESTRATION NOTE: do NOT run this spec ad hoc — Track A owns the dev server
 * on port 5173. The orchestrator runs it at integration via `npm run test:e2e`.
 */

const SHOTS = "/home/thomas/Dev/technical-learning/screenshots";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test.describe("systems explorer names its two spaces distinctly", () => {
  test("coefficient space (x, y) and output space are labeled as the primary captions", async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/lesson/systems");

    const explore = page.getByRole("region", { name: "One system, two pictures" });
    await expect(explore).toBeVisible();

    // The two panels announce their SPACE as the primary, visible caption.
    const captions = explore.locator(".systems-explorer__caption strong");
    await expect(captions.nth(0)).toHaveText("Coefficient space (x, y)");
    await expect(captions.nth(1)).toHaveText("Output space");

    // The labels must be genuinely distinct (the whole point of showing the
    // row and column pictures side by side).
    const first = await captions.nth(0).textContent();
    const second = await captions.nth(1).textContent();
    expect(first).not.toBe(second);

    // Each Mafs panel carries an accessible label naming its space, so the axes
    // are attributable even without color.
    await expect(
      explore.getByLabel(/Coefficient space \(x, y\), row picture/i),
    ).toBeVisible();
    await expect(
      explore.getByLabel(/Output space, column picture/i),
    ).toBeVisible();

    await page.screenshot({
      path: `${SHOTS}/visual-semantics-systems-default.png`,
      fullPage: true,
    });

    expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
  });

  test("a near-singular solution is explicitly marked off-screen, not silently dropped", async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/lesson/systems");

    const explore = page.getByRole("region", { name: "One system, two pictures" });
    await explore.getByRole("button", { name: "Near-singular" }).click();

    // Still exactly one solution (independent columns), but it is off-screen —
    // and the UI SAYS so rather than showing an empty coefficient plane.
    await expect(explore.getByTestId("systems-kind-readout")).toHaveText("one solution");
    await expect(explore.getByTestId("systems-columns-readout")).toHaveText("independent");
    await expect(explore.getByTestId("systems-offscreen-readout")).toContainText("off-screen");

    await page.screenshot({
      path: `${SHOTS}/visual-semantics-systems-near-singular.png`,
      fullPage: true,
    });

    // Auto-fit brings the far crossing into view instead of leaving it implied.
    await explore
      .getByRole("checkbox", { name: "Auto-fit an off-screen solution" })
      .check();
    await expect(explore.getByTestId("systems-offscreen-readout")).toContainText("fitted");

    expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
  });

  test("narrow viewport keeps both space captions present (responsive semantics)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/lesson/systems");
    const explore = page.getByRole("region", { name: "One system, two pictures" });
    const captions = explore.locator(".systems-explorer__caption strong");
    await expect(captions.nth(0)).toHaveText("Coefficient space (x, y)");
    await expect(captions.nth(1)).toHaveText("Output space");
    await page.screenshot({
      path: `${SHOTS}/visual-semantics-systems-narrow.png`,
      fullPage: true,
    });
  });
});

test.describe("guided scenes under reduced motion show an establishing frame", () => {
  test.use({ reducedMotion: "reduce" });

  // Cross-lesson: the establishing-frame invariant must hold wherever a guided
  // Watch scene appears, not just in one lesson.
  const LESSONS: readonly { path: string; heading: RegExp }[] = [
    { path: "/lesson/systems", heading: /Linear Systems: Two Pictures of One Equation/i },
    { path: "/lesson/vectors", heading: /Vectors, Linear Combinations, and Basis/i },
  ];

  for (const { path, heading } of LESSONS) {
    test(`${path} establishes a named stage frame without autoplay`, async ({ page }) => {
      const errors = collectConsoleErrors(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path);
      // Also emulate at the page level after load: the app reads the preference
      // via matchMedia() and a `change` listener, so this guarantees the hook
      // flips even where the context-level test.use() option does not propagate
      // to window.matchMedia in this browser build.
      await page.emulateMedia({ reducedMotion: "reduce" });

      await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();

      const player = page.locator(".guided-scene-player").first();
      await expect(player).toBeVisible();

      // The canvas frame renders an establishing frame (grid/origin) even paused.
      await expect(player.getByTestId("guided-canvas-frame")).toBeVisible();
      await expect(player.locator("canvas").first()).toBeVisible();

      // A named "watching now" stage title is present (not "Ready to play"
      // emptiness) — reduced motion seeks to the first major stage.
      const stageTitle = player.locator(".guided-scene-player__stage-title");
      await expect(stageTitle).toBeVisible();
      await expect(stageTitle).not.toHaveText("Ready to play");

      // The reduced-motion affordance is surfaced, and playback is NOT running.
      await expect(player.locator(".guided-scene-player__reduced-note")).toContainText(
        /reduced motion/i,
      );
      await expect(player.getByRole("button", { name: "Play", exact: true })).toBeVisible();
      await expect(player.getByRole("button", { name: "Pause" })).toHaveCount(0);

      if (path === "/lesson/systems") {
        await page.screenshot({
          path: `${SHOTS}/visual-semantics-systems-reduced-motion.png`,
          fullPage: true,
        });
      }

      expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
    });
  }
});
