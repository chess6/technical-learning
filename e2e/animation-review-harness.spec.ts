import {expect, test} from "@playwright/test";

test("dev review harness exposes the complete matrix pilot contract", async ({page}) => {
  await page.goto("/export-harness.html");
  await page.waitForFunction(
    () => window.__exportReady === true && window.__animationReviewReady === true,
  );
  const description = await page.evaluate(() =>
    window.__animationReviewApi!.describe("matrix-transformations"),
  );
  expect(description.checkpoints).toHaveLength(40);
  expect(description.beats.map(({id}) => id)).toEqual([
    "identity",
    "col1",
    "col2",
    "sample",
    "predict-sample",
    "transform-sample",
    "grid",
    "compare",
    "presets",
    "summary",
  ]);
  expect(description.reducedMotionFrames).toHaveLength(10);
  expect(description.beats.find(({id}) => id === "predict-sample")?.prediction).toEqual({
    question: "Both columns are known. Where does x land?",
    revealBeat: "transform-sample",
  });
  expect(description.referenceComparisons).toEqual([]);
});

test("learner entry never installs the authoring review API", async ({page}) => {
  await page.goto("/");
  expect(
    await page.evaluate(() => "__animationReviewApi" in window),
  ).toBe(false);
});

test("review API rejects scenes outside the explicit pilot", async ({page}) => {
  await page.goto("/export-harness.html");
  await page.waitForFunction(() => window.__animationReviewReady === true);
  const message = await page.evaluate(() => {
    try {
      window.__animationReviewApi!.describe("transform-spike");
      return "accepted";
    } catch (error) {
      return error instanceof Error ? error.message : String(error);
    }
  });
  expect(message).toContain('piloted only for "matrix-transformations"');
});
