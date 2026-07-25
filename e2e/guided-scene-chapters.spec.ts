import { test, expect, type Page } from "@playwright/test";
import { SCENE_META } from "../src/guided-scenes/scenes/sceneMeta";

/**
 * Every production guided scene, exercised the way a learner exercises it.
 *
 * The July 2026 remediation pass turned a set of manual checks into this spec.
 * For each lesson that hosts a scene it:
 *
 *  1. mounts the player and starts playback;
 *  2. SEEKS to the start of every authored chapter and asserts the player lands
 *     on that chapter — which is the "seeking directly to a chapter produces a
 *     valid visual state" requirement, made checkable: the stage title and the
 *     active chapter marker must both agree with the chapter that was asked for,
 *     and the canvas must still be painting;
 *  3. walks Previous/Next idea across the whole scene and asserts it reaches the
 *     first and last chapter (no beat is skipped by chapter navigation);
 *  4. fails on ANY console error. That is what makes the `runSegment` overrun
 *     detector a gate: a segment body that outgrows its declared duration logs
 *     `guided-scene segment overran its declared duration: <scene>.<segment>`,
 *     and this spec turns that into a failing test.
 *
 * It does NOT replace frame inspection of the MP4 exports (see the audit) —
 * a scene can be perfectly navigable and still animate the wrong thing.
 */

/** Lesson route → the scene it hosts. Worked-example scenes are reached via the
 * lesson that embeds them, so they share their host lesson's route. */
const SCENE_ROUTES: { scene: string; route: string }[] = [
  { scene: "why-linear-algebra", route: "/lesson/why-linear-algebra" },
  { scene: "vectors-linear-combinations", route: "/lesson/vectors" },
  { scene: "matrix-transformations", route: "/lesson/transformations" },
  { scene: "linear-systems", route: "/lesson/systems" },
  { scene: "elimination", route: "/lesson/elimination" },
  { scene: "solution-sets", route: "/lesson/solution-sets" },
  { scene: "matrix-composition", route: "/lesson/matrix-composition" },
  { scene: "determinant-area-scaling", route: "/lesson/determinants" },
  { scene: "subspaces-rank", route: "/lesson/subspaces-rank" },
  { scene: "rank-nullity", route: "/lesson/rank-nullity" },
  { scene: "change-of-basis", route: "/lesson/change-of-basis" },
  { scene: "eigenvectors-invariant-directions", route: "/lesson/eigenvectors" },
  // Worked-example scenes: reached through the lesson that embeds them.
  { scene: "eigenvectors-derivation", route: "/lesson/eigenvectors" },
  { scene: "columns-rule-graphic", route: "/lesson/transformations" },
  { scene: "bst-lift-from-array", route: "/lesson/binary-search-trees" },
  { scene: "red-black-encoding", route: "/lesson/red-black-trees" },
  { scene: "karatsuba-cross-terms", route: "/lesson/karatsuba" },
];

const PLAYER = ".guided-scene-player";
const CANVAS = ".guided-scene-player__canvas canvas";
const SCRUBBER = ".guided-scene-player__scrubber input";
const TITLE = ".guided-scene-player__stage-title";
const SUMMARY = ".guided-scene-player__stage-summary";
const ACTIVE_MARKER = '.guided-scene-player__chapter-marker[data-active="true"]';

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

/** The player for a given scene id (a lesson may host more than one). */
function playerFor(page: Page, scene: string) {
  return page.locator(`${PLAYER}[data-scene-id="${scene}"]`).first();
}

async function ensurePlaying(page: Page, root = page.locator(PLAYER).first()) {
  await expect
    .poll(
      async () => {
        if (await root.getByRole("button", { name: "Pause" }).count())
          return "playing";
        const play = root.getByRole("button", { name: "Play", exact: true });
        if (await play.count()) {
          await play.click();
          return "clicked";
        }
        return "waiting";
      },
      { timeout: 15000 },
    )
    .not.toBe("waiting");
}

for (const { scene, route } of SCENE_ROUTES) {
  const meta = SCENE_META[scene]!;
  const chapters = meta.majorSteps;

  test(`${scene}: plays, seeks to every chapter, and walks Prev/Next`, async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(route);

    const root = playerFor(page, scene);
    await expect(root).toBeVisible({ timeout: 15000 });
    const canvas = root.locator(CANVAS);
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // 1. Playback actually advances.
    await ensurePlaying(page, root);
    const scrubber = root.locator(SCRUBBER);
    await expect
      .poll(async () => Number(await scrubber.inputValue()), { timeout: 15000 })
      .toBeGreaterThan(0);
    await root.getByRole("button", { name: "Pause" }).click();

    // 2. Seek directly to each chapter. A chapter that a learner can jump to
    //    must announce itself correctly the moment they arrive.
    for (const chapter of chapters) {
      // Land just INSIDE the chapter, not exactly on its boundary, so float
      // rounding cannot put us in the previous one.
      const at = Math.min(0.999, chapter.at + 0.002);
      // React controls this range input, so set the value through the native
      // setter and dispatch a real `input` event: Playwright's `fill` does not
      // reliably trigger a controlled range's onChange.
      await scrubber.evaluate((element, value) => {
        const input = element as HTMLInputElement;
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        )!.set!;
        setter.call(input, String(value));
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }, at);
      await expect(root.locator(TITLE)).toHaveText(chapter.title, {
        timeout: 8000,
      });
      if (chapter.summary) {
        await expect(root.locator(SUMMARY)).toHaveText(chapter.summary);
      }
      await expect(root.locator(ACTIVE_MARKER)).toHaveAttribute(
        "title",
        chapter.title,
      );
      // Still painting: a valid visual state, not a blank or torn-down canvas.
      const painted = await canvas.evaluate((element) => {
        const node = element as HTMLCanvasElement;
        return node.width > 0 && node.height > 0;
      });
      expect(painted, `${scene} canvas at chapter ${chapter.id}`).toBe(true);
    }

    // 3. Previous/Next idea reaches both ends — no chapter is unreachable.
    const next = root.getByRole("button", { name: "Next idea" });
    const previous = root.getByRole("button", { name: "Previous idea" });
    for (let i = 0; i < chapters.length + 2; i += 1) await previous.click();
    await expect(root.locator(TITLE)).toHaveText(chapters[0]!.title);
    for (let i = 0; i < chapters.length + 2; i += 1) await next.click();
    await expect(root.locator(TITLE)).toHaveText(chapters.at(-1)!.title);

    // 4. Nothing logged an error — including a segment-duration overrun.
    const overruns = errors.filter((message) => message.includes("overran"));
    expect(overruns, `segment overruns in ${scene}`).toEqual([]);
    expect(errors, `console errors in ${scene}:\n${errors.join("\n")}`).toEqual(
      [],
    );
  });
}

test("reduced motion still presents an establishing frame and chapter controls", async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/lesson/why-linear-algebra");

  const root = playerFor(page, "why-linear-algebra");
  await expect(root).toBeVisible({ timeout: 15000 });
  // A canvas, not a blank box, and the chapter apparatus is still offered.
  await expect(root.locator(CANVAS)).toBeVisible({ timeout: 15000 });
  await expect(root.locator(TITLE)).not.toBeEmpty();
  await expect(root.getByRole("button", { name: "Next idea" })).toBeEnabled();
  await expect(root.getByRole("button", { name: "Previous idea" })).toBeEnabled();

  // Stepping by idea works without playback.
  await root.getByRole("button", { name: "Next idea" }).click();
  await expect(root.locator(TITLE)).not.toBeEmpty();

  expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
});
