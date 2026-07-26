import { test, expect, type Page } from "@playwright/test";
import { SCENE_META } from "../src/guided-scenes/scenes/sceneMeta";

/**
 * The production hard gates, run against every registered guided scene.
 *
 * These validators came out of the animation benchmark laboratory
 * (src/benchmark-lab/): every defect class the laboratory proved is
 * objectively detectable — missing claimed motion, teleporting objects,
 * flicker, clipped or overprinted text, nondeterministic seeking, segment
 * overruns, blank frames — is checked here against real scenes, with no
 * per-scene instrumentation.
 *
 * The page under test is dev-only (`/dev/scene-gates`) and shares its runner
 * with the human-facing button on that page, so the two can never diverge.
 *
 * Craft differences (composition, pacing, typography) are deliberately NOT
 * checked here. They are recorded as evidence by the laboratory instead —
 * a gate that fails on taste stops being a gate.
 */

const SCENE_IDS = Object.keys(SCENE_META);

/** Sampling stride in frames. 6 ≈ 10 Hz for the 60 fps scenes. */
const STRIDE = 6;

interface GateFinding {
  gate: string;
  sceneId: string;
  message: string;
}

async function runGates(page: Page, sceneId: string): Promise<GateFinding[]> {
  return page.evaluate(
    async ([id, stride]) => {
      const api = window.__sceneGates;
      if (!api) throw new Error("scene-gate runner is not exposed on window");
      return api.run(id as string, stride as number);
    },
    [sceneId, STRIDE] as const,
  );
}

test.describe("guided-scene hard gates", () => {
  // Sampling a scene means seeking and rendering every few frames across its
  // whole timeline, which is far slower than a normal interaction test.
  test.describe.configure({ timeout: 180_000 });

  for (const sceneId of SCENE_IDS) {
    test(`${sceneId} passes every hard gate`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });

      await page.goto("/dev/scene-gates");
      await expect(page.getByTestId("gate-summary")).toBeVisible();

      const findings = await runGates(page, sceneId);

      // A finding list is only meaningful if the scene was actually sampled;
      // `checkRunSampledScene` turns an empty run into a failure rather than
      // letting "no findings" certify a scene nobody measured.
      expect(
        findings.map((finding) => `${finding.gate}: ${finding.message}`),
      ).toEqual([]);

      expect(consoleErrors).toEqual([]);
    });
  }
});
