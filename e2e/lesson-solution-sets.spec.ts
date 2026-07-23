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

/** Repo-relative `screenshots/` (gitignored), portable across CI/agents. */
function screenshotPath(name: string): string {
  return path.join(process.cwd(), "screenshots", name);
}

/**
 * React controls the range input, so set the value through the native setter and
 * dispatch a real `input` event (Playwright's fill does not reliably drive a
 * controlled range's onChange).
 */
async function setRange(page: Page, selector: string, value: number) {
  await page.locator(selector).evaluate((element, v) => {
    const input = element as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )!.set!;
    setter.call(input, String(v));
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}

test("Solution Sets lesson loads, guided scene plays, and the explorer walks every case", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/solution-sets");

  await expect(
    page.getByRole("heading", {
      name: "Solution Sets & Homogeneous Systems",
      level: 1,
    }),
  ).toBeVisible();

  // --- Guided Watch scene: renders, plays, replays, pauses. ---
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

  // Step markers: exactly the six SOLUTION_SETS_SEGMENTS major ideas, in order.
  const ideaTitles = [
    "Two solutions of one system",
    "Subtract them: a homogeneous solution",
    "Add it back to make more",
    "The homogeneous line Null(A)",
    "The set is the null line, shifted",
    "Empty, a point, or a line",
  ];
  const ideaChips = scene.getByRole("button", { name: /^Idea \d+:/ });
  await expect(ideaChips).toHaveCount(ideaTitles.length);
  for (let i = 0; i < ideaTitles.length; i += 1) {
    await expect(
      scene.getByRole("button", { name: `Idea ${i + 1}: ${ideaTitles[i]}` }),
    ).toBeVisible();
  }

  const stageTitle = scene.locator(".guided-scene-player__stage-title");

  // Seek to the DISCOVERY beat (subtract two solutions) and the SYNTHESIS beat
  // (the set is the null line, shifted); the stage marker must track each.
  await scene
    .getByRole("button", { name: "Idea 2: Subtract them: a homogeneous solution" })
    .click();
  await expect(stageTitle).toHaveText("Subtract them: a homogeneous solution");

  await scene
    .getByRole("button", { name: "Idea 5: The set is the null line, shifted" })
    .click();
  await expect(stageTitle).toHaveText("The set is the null line, shifted");

  await scene
    .getByRole("button", { name: "Idea 6: Empty, a point, or a line" })
    .click();
  await expect(stageTitle).toHaveText("Empty, a point, or a line");

  // --- Interactive explorer: the two linked solution-space panels. ---
  const explore = page.getByRole("region", {
    name: "Solution set = null space, carried off the origin",
  });
  await explore.scrollIntoViewIfNeeded();
  await expect(explore).toBeVisible();

  const kind = explore.getByTestId("solset-kind-readout");
  const reach = explore.getByTestId("solset-reach-readout");
  const nul = explore.getByTestId("solset-null-readout");

  // The legend color key must actually render (each swatch has a real drawn
  // border, not a 0×0 box) so the diagram colors are decodable.
  const firstSwatch = explore.locator(".solution-set-explorer__legend .swatch").first();
  await expect(firstSwatch).toBeVisible();
  const swatchBox = await firstSwatch.boundingBox();
  expect(swatchBox?.width ?? 0).toBeGreaterThan(8);

  // Default preset — "Infinitely many (line)": a reachable b over a dependent A
  // gives an affine line; Null(A) is a line through the origin.
  await expect(kind).toHaveText("an affine line (dimension 1)");
  await expect(reach).toHaveText("yes — b is in the column space");
  await expect(nul).toContainText("a line through the origin");

  // Generate a solution WITHOUT re-solving: sliding the free variable t moves the
  // second solution x_p + t·v along the set (its readout value must change).
  const generated = explore.getByTestId("solset-generated-readout");
  await expect(generated).toBeVisible();
  const beforeT = await generated.getAttribute("data-plain");
  await setRange(page, "#sol-t", -3);
  await expect
    .poll(async () => generated.getAttribute("data-plain"))
    .not.toBe(beforeT);
  // Every t is still a solution — the "add any null vector" invariant.
  await expect(explore.getByTestId("solset-check-readout")).toContainText(
    "yes — and so is every t",
  );

  // The difference-translated-to-origin overlay toggles on/off (the natural
  // difference arrow from x_p to the generated solution stays visible).
  const diffToggle = explore.getByRole("checkbox", {
    name: "Show the difference translated to the origin",
  });
  await expect(diffToggle).toBeChecked();
  await diffToggle.click();
  await expect(diffToggle).not.toBeChecked();
  await diffToggle.click();
  await expect(diffToggle).toBeChecked();

  // --- Preset sweep: each case's readouts must agree with the geometry. ---

  // Unique (point): independent columns → trivial null space, one solution.
  await explore.getByRole("button", { name: "Unique (point)" }).click();
  await expect(kind).toHaveText("a single point");
  await expect(nul).toHaveText("only the zero vector, {0} (trivial)");
  await expect(reach).toHaveText("yes — b is in the column space");
  // No solution line here, so the difference-overlay toggle has nothing to act on
  // and must not be shown (it only appears for an off-origin line).
  await expect(diffToggle).toHaveCount(0);

  // Inconsistent (empty): b off the column space → empty set, existence fails,
  // even though Null(A) is unchanged.
  await explore.getByRole("button", { name: "Inconsistent (empty)" }).click();
  await expect(kind).toHaveText("empty (no solutions)");
  await expect(reach).toHaveText("no — b is off the column space");
  await expect(nul).toContainText("a line through the origin");

  // Whole plane (A = 0): the caveat case — a 2-dimensional null space. Two free
  // variables t₁, t₂ let the learner move in both independent null directions
  // (Package 3's abstraction return: x = t₁ e₁ + t₂ e₂).
  await explore.getByRole("button", { name: "Whole plane (A = 0)" }).click();
  await expect(kind).toHaveText("the whole plane (dimension 2)");
  await expect(nul).toHaveText("the whole plane ℝ²");
  await expect(explore.locator(".exploration-panel__summary")).toContainText(
    "you need both independent null directions",
    { ignoreCase: true },
  );
  await expect(explore.locator("#sol-t1")).toBeVisible();
  await expect(explore.locator("#sol-t2")).toBeVisible();
  const planePoint = explore.getByTestId("solset-plane-point-readout");
  await expect(planePoint).toHaveAttribute("data-plain", "(2, 1)");
  await setRange(page, "#sol-t1", -1);
  await setRange(page, "#sol-t2", 3);
  await expect(planePoint).toHaveAttribute("data-plain", "(-1, 3)");
  await expect(explore.getByTestId("solset-plane-check-readout")).toContainText(
    "Null(A) = ℝ² needs both free variables",
  );

  // Homogeneous (b = 0): the solution set is Null(A) itself, through the origin.
  await explore.getByRole("button", { name: "Homogeneous (b = 0)" }).click();
  await expect(kind).toHaveText("an affine line (dimension 1)");
  await expect(reach).toHaveText("yes — b is in the column space");

  // Reset returns to the infinitely-many line.
  await explore.getByRole("button", { name: "Reset" }).click();
  await expect(kind).toHaveText("an affine line (dimension 1)");

  await explore.screenshot({ path: screenshotPath("solution-sets-explorer.png") });

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});

test("Solution Sets guided scene honors reduced motion (establishing frame, no autoplay)", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/lesson/solution-sets");

  const scene = page.getByRole("region", { name: /Guided animation/ });
  await expect(scene.locator(".guided-scene-player__canvas canvas")).toBeVisible();

  // Reduced motion: no continuous autoplay — Play stays available (never flips to
  // Pause), and the reduced-motion guidance is shown.
  await expect(scene.getByRole("button", { name: "Play", exact: true })).toBeVisible();
  await expect(scene.getByRole("button", { name: "Pause" })).toHaveCount(0);
  await expect(scene.locator(".guided-scene-player__reduced-note")).toBeVisible();

  // The scene seeks to the first major idea (the establishing frame), and
  // Previous/Next idea remain available to step through the sequence.
  await expect(scene.locator(".guided-scene-player__stage-title")).toHaveText(
    "Two solutions of one system",
  );
  await expect(scene.getByRole("button", { name: "Next idea" })).toBeEnabled();

  await scene.screenshot({
    path: screenshotPath("solution-sets-scene-reduced-motion.png"),
  });

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});
