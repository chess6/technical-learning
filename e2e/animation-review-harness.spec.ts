import { expect, test } from "@playwright/test";

test("dev review harness exposes the complete matrix pilot contract", async ({
  page,
}) => {
  await page.goto("/export-harness.html");
  await page.waitForFunction(
    () =>
      window.__exportReady === true && window.__animationReviewReady === true,
  );
  const description = await page.evaluate(() =>
    window.__animationReviewApi!.describe("matrix-transformations"),
  );
  expect(description.checkpoints).toHaveLength(40);
  expect(description.beats.map(({ id }) => id)).toEqual([
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
  expect(
    description.beats.find(({ id }) => id === "predict-sample")?.prediction,
  ).toEqual({
    question: "Both columns are known. Where does x land?",
    revealBeat: "transform-sample",
  });
  expect(description.referenceComparisons).toEqual([]);
});

test("learner entry never installs the authoring review API", async ({
  page,
}) => {
  await page.goto("/");
  expect(await page.evaluate(() => "__animationReviewApi" in window)).toBe(
    false,
  );
});

test("review API rejects scenes outside the explicit contract registry", async ({
  page,
}) => {
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
  expect(message).toContain("has no BeatSpec authoring contract");
});

test("dev review harness exposes all five Batch 1 contracts", async ({
  page,
}) => {
  await page.goto("/export-harness.html");
  await page.waitForFunction(() => window.__animationReviewReady === true);
  const descriptions = await page.evaluate(() =>
    [
      "why-linear-algebra",
      "vectors-linear-combinations",
      "matrix-composition",
      "determinant-area-scaling",
      "change-of-basis",
    ].map((sceneId) => window.__animationReviewApi!.describe(sceneId)),
  );
  expect(descriptions.map(({ beats }) => beats.length)).toEqual([
    10, 14, 8, 10, 7,
  ]);
  expect(
    descriptions.every(({ mathData }) => Object.keys(mathData).length > 0),
  ).toBe(true);
  expect(
    descriptions.every(({ beats }) =>
      beats.every(({ chapter }) => chapter.seek.kind === "segment-opening"),
    ),
  ).toBe(true);
  expect(
    descriptions.every(
      ({ durationFrames, checkpoints }) =>
        durationFrames > Math.max(...checkpoints.map(({ frame }) => frame)),
    ),
  ).toBe(true);
});
