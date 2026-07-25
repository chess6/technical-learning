import { expect, type Locator } from "@playwright/test";
import { getSceneMeta } from "../../src/guided-scenes/scenes/sceneMeta";

/**
 * Helpers for asserting a guided scene's CHAPTERS from a lesson spec.
 *
 * Lesson specs used to hardcode both the chapter count and each chapter's
 * ordinal ("Idea 6: …"). Both are incidental: inserting a prediction beat, which
 * is a pedagogical improvement, renumbered every chapter after it and broke six
 * specs that had no opinion about numbering at all.
 *
 * What those specs actually mean to pin is that a NAMED beat exists, is
 * reachable, and reports itself on the stage. These helpers say exactly that,
 * and take the count from the scene metadata so the spec stays a statement
 * about the lesson rather than about the current beat list.
 */

/** Every chapter chip in a player region. */
export function ideaChips(scene: Locator): Locator {
  return scene.getByRole("button", { name: /^Idea \d+:/ });
}

/** Escape a chapter title for use inside a RegExp. */
function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** The chapter chip for a title, whatever its ordinal happens to be. */
export function ideaChip(scene: Locator, title: string): Locator {
  return scene.getByRole("button", {
    name: new RegExp(`^Idea \\d+: ${escapeForRegExp(title)}$`),
  });
}

/**
 * Assert the player offers exactly the chapters the scene metadata declares.
 * Keeps the spec honest about coverage without freezing the beat list.
 */
export async function expectChaptersMatchMetadata(
  scene: Locator,
  sceneId: string,
): Promise<void> {
  const expected = getSceneMeta(sceneId).majorSteps;
  await expect(ideaChips(scene)).toHaveCount(expected.length);
}

/** Jump to a named chapter and assert the stage reports it. */
export async function gotoChapter(
  scene: Locator,
  title: string,
): Promise<void> {
  await ideaChip(scene, title).click();
  await expect(
    scene.locator(".guided-scene-player__stage-title"),
  ).toHaveText(title);
}
