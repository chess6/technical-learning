// @ts-nocheck
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {describe, expect, it} from "vitest";
import {
  checkpointArtifactPath,
  missingCaptureFailures,
  planCheckpointArtifacts,
  reducedMotionEvidenceFailures,
  selectedRenderRange,
  unsupportedReferenceDisposition,
} from "../../../../scripts/animation-review-plan.mjs";

const beats = [{id: "identity"}, {id: "predict-sample"}];
const checkpoints = [
  {beatId: "identity", checkpointId: "opening", frame: 0},
  {beatId: "predict-sample", checkpointId: "landing", frame: 674},
];

describe("animation review packet plan", () => {
  it("generates deterministic, ordered, filesystem-safe artifact names", () => {
    const first = planCheckpointArtifacts("/packet", beats, checkpoints);
    const second = planCheckpointArtifacts("/packet", beats, checkpoints);
    expect(second).toEqual(first);
    expect(first.map(({path}) => path)).toEqual([
      "/packet/frames/01-identity--opening-f000000.png",
      "/packet/frames/02-predict-sample--landing-f000674.png",
    ]);
    expect(
      checkpointArtifactPath("/packet", 0, {
        beatId: "Bad / Beat",
        checkpointId: "Frame #1",
        frame: 3,
      }),
    ).toBe("/packet/frames/01-bad-beat--frame-1-f000003.png");
  });

  it("turns every missing required capture into an exact failure", () => {
    const records = planCheckpointArtifacts("/packet", beats, checkpoints);
    expect(
      missingCaptureFailures(
        records,
        (path) => path.endsWith("identity--opening-f000000.png"),
      ),
    ).toEqual(["predict-sample.landing at frame 674"]);
    expect(missingCaptureFailures(records, () => false)).toHaveLength(2);
    expect(missingCaptureFailures(records, () => true)).toEqual([]);
  });

  it("limits a focused render to the inclusive selected checkpoint range", () => {
    expect(selectedRenderRange([checkpoints[1]], 30)).toEqual({
      startFrame: 674,
      endFrame: 674,
      startTime: 674 / 30,
      endTime: 674 / 30,
      requestedFrames: 1,
      expectedHandledFrames: 2,
    });
    expect(selectedRenderRange(checkpoints, 30)).toMatchObject({
      requestedFrames: 675,
      expectedHandledFrames: 675,
    });
  });

  it("makes an unsupported requested reference an explicit non-pass", () => {
    expect(unsupportedReferenceDisposition("matrix-transformations", [])).toEqual({
      requested: true,
      disposition: "unsupported",
      reason: 'scene "matrix-transformations" has no supported benchmark comparison',
    });
  });

  it("rejects copied ordinary frames as reduced-motion evidence", () => {
    const ordinary = [{
      beatId: "identity",
      captureSource: "production-renderer",
      runId: "production-renderer",
      browserMedia: {query: "screen", matches: false},
    }];
    expect(reducedMotionEvidenceFailures(ordinary, 1)).toEqual([
      "identity: capture source must be learner-player",
      "identity: browser did not match prefers-reduced-motion: reduce",
      "identity: reduced-motion evidence reused the production render run",
    ]);
    expect(reducedMotionEvidenceFailures([{
      beatId: "identity", captureSource: "learner-player", runId: "learner-reduced-motion",
      browserMedia: {query: "(prefers-reduced-motion: reduce)", matches: true},
    }], 1)).toEqual([]);
  });

  it("keeps editor and review entry points out of the learner entry document", () => {
    const root = process.cwd();
    const learnerEntry = [
      readFileSync(resolve(root, "index.html"), "utf8"),
      readFileSync(resolve(root, "src/main.tsx"), "utf8"),
    ].join("\n");
    expect(learnerEntry).not.toMatch(
      /motion-authoring|editorPlugin|animationReviewHarness|__animationReviewApi/,
    );

    const packageJson = JSON.parse(
      readFileSync(resolve(root, "package.json"), "utf8"),
    );
    const rootPackages = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    expect(rootPackages).not.toHaveProperty("@motion-canvas/ui");
    expect(rootPackages).not.toHaveProperty("@motion-canvas/vite-plugin");
  });
});
