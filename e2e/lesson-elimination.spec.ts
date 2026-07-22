import path from "node:path";
import { test, expect, type Page } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

/**
 * Portable artifact path: repo-relative `screenshots/` (gitignored), derived
 * from the Playwright working directory rather than a hardcoded home path, so
 * the test runs unchanged on CI, another machine, or an agent workspace.
 */
function screenshotPath(name: string): string {
  return path.join(process.cwd(), "screenshots", name);
}

test("Elimination lesson loads, guided scene plays, and row operations keep the solution set fixed", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/elimination");

  await expect(
    page.getByRole("heading", {
      name: "Elimination: Rewriting a System Without Changing Its Answer",
    }),
  ).toBeVisible();

  // --- Committed prediction comes BEFORE the visual (its own "Predict first"
  // practice block), so it is a genuine prediction rather than post-reveal
  // recall. Commit the correct choice and confirm it grades correct. ---
  const predict = page.getByRole("region", { name: "Predict first" });
  await expect(predict.getByText("Question 1 of")).toBeVisible();
  await predict.locator("button[data-choice-index='1']").click();
  await predict.getByRole("button", { name: "Commit answer" }).click();
  await expect(
    predict.locator('.exercise-panel__feedback[data-state="correct"]').first(),
  ).toBeVisible();

  // --- Guided Watch scene: renders, plays, replays. ---
  const scene = page.getByRole("region", { name: /Guided animation/ });
  await expect(scene.locator(".guided-scene-player__canvas canvas")).toBeVisible();
  const play = scene.getByRole("button", { name: "Play", exact: true });
  if (await play.count()) await play.click();
  await expect(scene.getByRole("button", { name: "Pause" })).toBeEnabled({
    timeout: 8000,
  });
  await scene.getByRole("button", { name: "Replay" }).click();
  await expect(scene.getByRole("button", { name: "Pause" })).toBeEnabled();
  // Pause so seeking to specific ideas is stable (not chased by playback).
  await scene.getByRole("button", { name: "Pause" }).click();

  // Step-marker alignment: exactly the five ELIMINATION_SEGMENTS major ideas,
  // in order. The idea chips are derived from the same timing metadata that
  // drives the scrubber, so this pins scrubber/idea/segment alignment.
  const ideaTitles = [
    "One system, three views",
    "R2 → R2 − 2·R1",
    "Triangular: read off y, back-substitute",
    "The crossing never moved",
    "Same solutions, easier system",
  ];
  const ideaChips = scene.getByRole("button", { name: /^Idea \d+:/ });
  await expect(ideaChips).toHaveCount(ideaTitles.length);
  for (let i = 0; i < ideaTitles.length; i += 1) {
    await expect(
      scene.getByRole("button", { name: `Idea ${i + 1}: ${ideaTitles[i]}` }),
    ).toBeVisible();
  }

  const stageTitle = scene.locator(".guided-scene-player__stage-title");

  // Seek to the OPERATION beat (R2 → R2 − 2·R1) and confirm the stage marker
  // tracks it.
  await scene.getByRole("button", { name: "Idea 2: R2 → R2 − 2·R1" }).click();
  await expect(stageTitle).toHaveText("R2 → R2 − 2·R1");

  // Scrub to the MIDPOINT of the operation (≈0.28 of the 27s timeline), where
  // the scaled −2·R1 term is sliding into R2 and R2's line pivots about the
  // fixed crossing. The marker must still report the operation beat — pinning
  // that the scrubber and the step markers share one aligned timeline.
  const timeline = scene.getByRole("slider", { name: "Animation timeline" });
  // React controls this range input, so set the value through the native setter
  // and dispatch a real `input` event to drive its onChange (Playwright's fill
  // does not reliably trigger a controlled range's handler).
  await timeline.evaluate((element, value) => {
    const input = element as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )!.set!;
    setter.call(input, String(value));
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }, 0.28);
  await expect(timeline).toHaveAttribute("aria-valuetext", "28%");
  await expect(stageTitle).toHaveText("R2 → R2 − 2·R1");
  await scene.screenshot({ path: screenshotPath("elimination-scene-operation.png") });

  // Seek to the final TRIANGULAR state and confirm the marker tracks it too.
  await scene
    .getByRole("button", { name: "Idea 3: Triangular: read off y, back-substitute" })
    .click();
  await expect(stageTitle).toHaveText("Triangular: read off y, back-substitute");
  await scene.screenshot({ path: screenshotPath("elimination-scene-triangular.png") });

  // --- Interactive explorer: the three synchronized views. ---
  const explore = page.getByRole("region", {
    name: "Elimination: rewrite the system, keep the solutions",
  });
  await expect(explore).toBeVisible();
  await expect(explore.getByTestId("elim-equations")).toBeVisible();
  await expect(explore.getByTestId("elim-augmented")).toBeVisible();

  // Default preset: the running system A x = b has the unique solution (2, -1)
  // and starts unchanged from its own baseline.
  await expect(explore.getByTestId("elim-kind-readout")).toHaveText("one solution");
  await expect(explore.getByTestId("elim-solution-readout")).toHaveText("(2, -1)");
  await expect(explore.getByTestId("elim-preserved-readout")).toHaveAttribute(
    "data-preserved",
    "true",
  );

  // Capture the augmented matrix before elimination so we can prove it changes.
  const augmentedBefore = await explore.getByTestId("elim-augmented").innerText();

  // Apply a legal row operation: eliminate x from R2. The matrix/equations must
  // change, but the solution point and the solution set must be preserved — and
  // the summary must use the UNIQUE-case phrasing ("crossing point never moves").
  await explore.getByRole("button", { name: "Eliminate x from R2" }).click();
  await expect
    .poll(async () => explore.getByTestId("elim-augmented").innerText())
    .not.toBe(augmentedBefore);
  await expect(explore.getByTestId("elim-solution-readout")).toHaveText("(2, -1)");
  await expect(explore.getByTestId("elim-preserved-readout")).toHaveAttribute(
    "data-preserved",
    "true",
  );
  await expect(explore.locator(".exploration-panel__summary")).toContainText(
    "the crossing point never moves",
  );

  // An illegal move (scale R2 by 0) erases a constraint: the solution set grows
  // and the readout reports honestly that it is no longer preserved.
  await explore.locator("summary", { hasText: "More row operations" }).click();
  await explore.getByRole("button", { name: "Multiply R2 by 0" }).click();
  await expect(explore.getByTestId("elim-kind-readout")).toHaveText("infinitely many");
  await expect(explore.getByTestId("elim-preserved-readout")).toHaveAttribute(
    "data-preserved",
    "false",
  );

  // Reset restores the original system and its preserved solution set.
  await explore.getByRole("button", { name: "Reset system" }).click();
  await expect(explore.getByTestId("elim-kind-readout")).toHaveText("one solution");
  await expect(explore.getByTestId("elim-solution-readout")).toHaveText("(2, -1)");
  await expect(explore.getByTestId("elim-preserved-readout")).toHaveAttribute(
    "data-preserved",
    "true",
  );

  // --- Preset-sensitive language: the permanent description, the canvas
  // caption, and the diagram's accessible (Mafs) label must match the selected
  // system's solution geometry — a crossing point ONLY for the unique case. ---
  const description = explore.locator(".exploration-panel__description");
  const caption = explore.getByTestId("elim-canvas-caption");
  const diagram = explore.getByRole("img", { name: /constraint lines/i });

  // unique: two lines with a fixed intersection point.
  await expect(caption).toHaveText("Constraint lines — the crossing point is the solution set");
  await expect(description).toContainText("meeting at a fixed intersection point");
  await expect(diagram).toHaveAttribute(
    "aria-label",
    /fixed intersection point/,
  );

  // infinite: coincident constraints with the same solution line — no crossing point.
  await explore.getByRole("button", { name: "Infinitely many" }).click();
  await expect(explore.getByTestId("elim-kind-readout")).toHaveText("infinitely many");
  await expect(caption).toHaveText("Constraint lines — the shared line is the solution set");
  await expect(description).toContainText("coincident constraint lines");
  await expect(description).not.toContainText("crossing point");
  await expect(diagram).toHaveAttribute("aria-label", /coincident constraint lines/);

  // none: constraints with an empty solution set — no crossing point.
  await explore.getByRole("button", { name: "No solution" }).click();
  await expect(explore.getByTestId("elim-kind-readout")).toHaveText("no solution");
  await expect(caption).toHaveText("Constraint lines — no crossing, so the solution set is empty");
  await expect(description).toContainText("never meet");
  await expect(description).not.toContainText("crossing point");
  await expect(diagram).toHaveAttribute("aria-label", /no intersection/);

  // Return to the unique preset for the proof-of-life screenshot below.
  await explore.getByRole("button", { name: "One solution" }).click();
  await expect(explore.getByTestId("elim-kind-readout")).toHaveText("one solution");

  // Proof-of-life screenshot of the triple-view explorer (gitignored, portable).
  await explore.scrollIntoViewIfNeeded();
  await explore.screenshot({ path: screenshotPath("elimination-explorer.png") });

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("Elimination guided scene honors reduced motion (establishing frame, no autoplay)", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/elimination");

  const scene = page.getByRole("region", { name: /Guided animation/ });
  await expect(scene.locator(".guided-scene-player__canvas canvas")).toBeVisible();

  // Reduced motion: no continuous autoplay — the Play control stays available
  // (never flips to Pause), and the reduced-motion guidance is shown.
  await expect(scene.getByRole("button", { name: "Play", exact: true })).toBeVisible();
  await expect(scene.getByRole("button", { name: "Pause" })).toHaveCount(0);
  await expect(scene.locator(".guided-scene-player__reduced-note")).toBeVisible();

  // The scene seeks to the first major idea (the establishing frame), and
  // Previous/Next idea remain available to step through the sequence.
  await expect(scene.locator(".guided-scene-player__stage-title")).toHaveText(
    "One system, three views",
  );
  await expect(scene.getByRole("button", { name: "Next idea" })).toBeEnabled();

  await scene.screenshot({ path: screenshotPath("elimination-scene-reduced-motion.png") });

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});
