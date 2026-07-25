import { test, expect } from "@playwright/test";
import { lessons } from "../src/lessons/registry";

/**
 * Every misconception callout a lesson authors must actually reach the page.
 *
 * This exists because seven lessons were silently failing it. Callouts ride
 * along with the COMBINED `worked` route block, so any lesson that placed its
 * worked examples individually (`worked` + `workedId`) rendered none of them —
 * including `solution-sets`, which shipped that way. The lesson data was
 * correct, the tests over lesson data passed, and the learner saw nothing.
 *
 * Asserting the COUNT (not merely "at least one") is deliberate: a partial
 * regression that drops some callouts would otherwise pass.
 */

const WITH_CALLOUTS = lessons.filter((lesson) => (lesson.callouts ?? []).length > 0);

test("every lesson that authors callouts has at least one", () => {
  // Guards the guard: if the registry changed shape, this spec would silently
  // become vacuous.
  expect(WITH_CALLOUTS.length).toBeGreaterThanOrEqual(8);
});

for (const lesson of WITH_CALLOUTS) {
  test(`${lesson.id} renders all ${lesson.callouts!.length} of its misconception callouts`, async ({
    page,
  }) => {
    await page.goto(`/lesson/${lesson.id}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByTestId("misconception-callout")).toHaveCount(
      lesson.callouts!.length,
    );
  });
}
