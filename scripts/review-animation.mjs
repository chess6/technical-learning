#!/usr/bin/env node
/** Deterministic, development-only review packet for a production scene. */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  missingCaptureFailures,
  planCheckpointArtifacts,
  reducedMotionEvidenceFailures,
  safeArtifactStem,
  selectedRenderRange,
  unsupportedReferenceDisposition,
} from "./animation-review-plan.mjs";
import {
  ensureReviewDevServer,
  withReviewBrowser,
} from "./review-dev-server.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_OUT = join(ROOT, "artifacts", "animation-review");
const REVIEW_SCENES = JSON.parse(
  readFileSync(
    join(ROOT, "scripts", "animation-authoring-scenes.json"),
    "utf8",
  ),
);

function parseArgs(argv) {
  const options = {
    sceneId: "",
    beat: "",
    checkpoint: "",
    out: DEFAULT_OUT,
    port: Number(process.env.PORT ?? 5174),
    stride: 3,
    skipVideo: false,
    reducedMotionOnly: false,
    reference: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--scene") options.sceneId = argv[++index] ?? "";
    else if (arg === "--beat") options.beat = argv[++index] ?? "";
    else if (arg === "--checkpoint") options.checkpoint = argv[++index] ?? "";
    else if (arg === "--out") options.out = resolve(argv[++index] ?? "");
    else if (arg === "--port") options.port = Number(argv[++index]);
    else if (arg === "--stride") options.stride = Number(argv[++index]);
    else if (arg === "--skip-video") options.skipVideo = true;
    else if (arg === "--reduced-motion") options.reducedMotionOnly = true;
    else if (arg === "--reference") options.reference = true;
    else if (arg === "-h" || arg === "--help") {
      printHelp();
      process.exit(0);
    } else throw new Error(`unknown argument: ${arg}`);
  }
  if (!options.sceneId) throw new Error("pass --scene <id>");
  const selectedScene = REVIEW_SCENES[options.sceneId];
  if (!selectedScene?.authoringContract || !selectedScene.lessonId) {
    const supported = Object.entries(REVIEW_SCENES)
      .filter(([, scene]) => scene.authoringContract && scene.lessonId)
      .map(([sceneId]) => sceneId)
      .join(", ");
    throw new Error(
      'scene "' +
        options.sceneId +
        '" has no review BeatSpec; supported scenes: ' +
        supported,
    );
  }
  if (
    !Number.isInteger(options.port) ||
    options.port < 1 ||
    options.port > 65535
  ) {
    throw new Error("--port must be an integer in [1, 65535]");
  }
  if (!Number.isInteger(options.stride) || options.stride < 1) {
    throw new Error("--stride must be a positive integer");
  }
  if (options.checkpoint && !options.beat) {
    throw new Error(
      "--checkpoint requires --beat so the selection identifies one checkpoint",
    );
  }
  if (options.reference) {
    const reference = unsupportedReferenceDisposition(options.sceneId, []);
    throw new Error(
      "--reference requested, but " +
        reference.reason +
        "; no review packet was generated",
    );
  }
  return options;
}

function printHelp() {
  console.log(`Create a deterministic production-scene review packet.

  npm run animation:review -- --scene why-linear-algebra
  npm run animation:review -- --scene vectors-linear-combinations --beat addition
  npm run animation:review -- --scene determinant-area-scaling --reduced-motion

Options: --beat <id>, --checkpoint <id>, --reduced-motion, --skip-video,
         --reference, --stride <frames>, --out <dir>, --port <n>`);
}

function toolVersion(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) return null;
  return (result.stdout || result.stderr).split("\n")[0].trim();
}

function gitValue(args) {
  const result = spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : null;
}

function packageVersion(name) {
  const packageJson = JSON.parse(
    readFileSync(join(ROOT, "package.json"), "utf8"),
  );
  return (
    packageJson.dependencies?.[name] ??
    packageJson.devDependencies?.[name] ??
    null
  );
}

function packetPath(packetDir, path) {
  return relative(packetDir, path).replaceAll("\\", "/");
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function createContactSheet(framePaths, output) {
  if (framePaths.length === 0) return "no checkpoint frames selected";
  const result = spawnSync(
    "montage",
    [
      "-background",
      "#0b1020",
      "-fill",
      "#f8fafc",
      "-pointsize",
      "13",
      "-label",
      "%t",
      ...framePaths,
      "-thumbnail",
      "480x270",
      "-tile",
      "4x",
      "-geometry",
      "+8+26",
      output,
    ],
    { stdio: "pipe" },
  );
  return result.status === 0
    ? null
    : `contact sheet failed: ${(result.stderr?.toString() ?? "unknown error").trim()}`;
}

function createPreview(framesDir, output, fps) {
  const result = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-framerate",
      String(fps),
      "-i",
      join(framesDir, "%06d.png"),
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "23",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      output,
    ],
    { stdio: "pipe" },
  );
  return result.status === 0
    ? null
    : `preview encode failed: ${(result.stderr?.toString() ?? "unknown error").trim().split("\n").at(-1)}`;
}

async function drainProductionRender(page, options, description, packetDir) {
  const checkpoints = description.checkpoints.filter(
    (checkpoint) =>
      (!options.beat || checkpoint.beatId === options.beat) &&
      (!options.checkpoint || checkpoint.checkpointId === options.checkpoint),
  );
  if (checkpoints.length === 0)
    throw new Error("the selected beat/checkpoint matched no captures");

  const renderRange = selectedRenderRange(checkpoints, description.fps);
  const frameRecords = planCheckpointArtifacts(
    packetDir,
    description.beats,
    checkpoints,
  );
  const frameDestinations = new Map();
  for (const record of frameRecords) {
    const destinations = frameDestinations.get(record.frame) ?? [];
    destinations.push(record.path);
    frameDestinations.set(record.frame, destinations);
  }

  const prediction = description.beats.find((beat) => beat.prediction);
  const revealBeat = prediction?.prediction?.revealBeat;
  const previewStart = description.checkpoints.find(
    (item) => item.beatId === prediction?.id && item.checkpointId === "opening",
  )?.frame;
  const previewEnd = description.checkpoints.find(
    (item) => item.beatId === revealBeat && item.checkpointId === "final",
  )?.frame;
  const previewFramesDir = join(packetDir, ".preview-frames");
  const focused = Boolean(options.beat || options.checkpoint);
  const shouldRenderPreview =
    !options.skipVideo && !options.reducedMotionOnly && !focused;
  if (shouldRenderPreview) mkdirSync(previewFramesDir, { recursive: true });

  await page.evaluate(
    ({ sceneId, fps, startFrame, endFrame }) => {
      window.__exportApi
        .start({ sceneId, fps, resolutionScale: 0.5, startFrame, endFrame })
        .catch((error) => {
          window.__exportStatus.state = "error";
          window.__exportStatus.error =
            error instanceof Error ? error.message : String(error);
        });
    },
    {
      sceneId: options.sceneId,
      fps: description.fps,
      startFrame: renderRange.startFrame,
      endFrame: renderRange.endFrame,
    },
  );

  const startedAt = Date.now();
  let handled = 0;
  let previewWritten = 0;
  let lastFrameAt = Date.now();
  for (;;) {
    const result = await page.evaluate(() => ({
      frames: window.__exportQueue.splice(0),
      state: window.__exportStatus.state,
      error: window.__exportStatus.error,
    }));
    for (const frame of result.frames) {
      handled += 1;
      lastFrameAt = Date.now();
      const bytes = Buffer.from(
        frame.data.slice(frame.data.indexOf(",") + 1),
        "base64",
      );
      for (const destination of frameDestinations.get(frame.frame) ?? []) {
        writeFileSync(destination, bytes);
      }
      if (
        !options.skipVideo &&
        !options.reducedMotionOnly &&
        !focused &&
        previewStart !== undefined &&
        previewEnd !== undefined &&
        frame.frame >= previewStart &&
        frame.frame <= previewEnd
      ) {
        writeFileSync(
          join(
            previewFramesDir,
            `${String(previewWritten).padStart(6, "0")}.png`,
          ),
          bytes,
        );
        previewWritten += 1;
      }
    }
    if (result.state === "error")
      throw new Error(`production render failed: ${result.error}`);
    if (result.state === "done" && result.frames.length === 0) break;
    if (Date.now() - lastFrameAt > 90_000) {
      throw new Error(`production render stalled after ${handled} frames`);
    }
    await new Promise((resolveSleep) => setTimeout(resolveSleep, 100));
  }

  if (handled !== renderRange.expectedHandledFrames) {
    throw new Error(
      `production renderer emitted ${handled} frames; expected ` +
        `${renderRange.expectedHandledFrames} for requested range ` +
        `${renderRange.startFrame}–${renderRange.endFrame}`,
    );
  }
  const missing = missingCaptureFailures(frameRecords, existsSync);
  if (missing.length > 0) {
    throw new Error(
      `renderer omitted ${missing.length} requested checkpoint frames: ${missing.join(", ")}`,
    );
  }
  return {
    frameRecords,
    previewFramesDir,
    previewWritten,
    previewStart,
    previewEnd,
    handled,
    range: renderRange,
    elapsedMs: Date.now() - startedAt,
    focused,
  };
}

async function captureReducedMotionEvidence(
  browser,
  serverUrl,
  options,
  description,
  packetDir,
  browserErrors,
) {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error")
      browserErrors.push(`reduced-motion: ${message.text()}`);
  });
  page.on("pageerror", (error) =>
    browserErrors.push(`reduced-motion: ${error.message}`),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  const lessonId = REVIEW_SCENES[options.sceneId].lessonId;
  const route = "/lesson/" + lessonId;
  const url = new URL(route, serverUrl).toString();
  await page.goto(url);
  const root = page
    .locator(`.guided-scene-player[data-scene-id="${options.sceneId}"]`)
    .first();
  await root.waitFor({ state: "visible", timeout: 30_000 });
  await root
    .locator(".guided-scene-player__reduced-note")
    .waitFor({ state: "visible" });
  const mediaQuery = "(prefers-reduced-motion: reduce)";
  const mediaMatches = await page.evaluate(
    (query) => matchMedia(query).matches,
    mediaQuery,
  );
  if (!mediaMatches) {
    throw new Error(
      "learner review page did not enter prefers-reduced-motion: reduce",
    );
  }

  // The player can mount its shell before Motion Canvas publishes a duration.
  // A chapter click in that interval is ignored by the engine, so wait for the
  // timeline (state.canSeek) before seeking evidence frames.
  const timeline = root.getByRole("slider", { name: "Animation timeline" });
  await timeline.waitFor({ state: "visible", timeout: 30_000 });

  const required = description.reducedMotionFrames.filter(
    (item) => !options.beat || item.beatId === options.beat,
  );
  const records = [];
  const runId = "learner-reduced-motion";
  for (const item of required) {
    const beatIndex = description.beats.findIndex(
      ({ id }) => id === item.beatId,
    );
    const beat = description.beats[beatIndex];
    if (!beat)
      throw new Error(`missing learner chapter for beat ${item.beatId}`);
    const control = root.getByRole("button", {
      name: `Idea ${beatIndex + 1}: ${beat.chapter.title}`,
      exact: true,
    });
    await control.waitFor({ state: "visible" });
    const normalizedOpening = Math.min(
      0.999,
      item.frame / description.durationFrames + 0.002,
    );
    const expectedIdea = `Idea ${beatIndex + 1}: ${beat.chapter.title}`;
    const deadline = Date.now() + 30_000;
    let observed;
    while (Date.now() < deadline) {
      await timeline.evaluate((element, value) => {
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        ).set;
        setter.call(element, String(value));
        element.dispatchEvent(new Event("input", { bubbles: true }));
      }, normalizedOpening);
      await page.waitForTimeout(150);
      observed = await root.evaluate(
        (player, expected) => {
          const canvas = player.querySelector(
            ".guided-scene-player__canvas canvas",
          );
          const activeIdea = player
            .querySelector('button[aria-current="step"]')
            ?.getAttribute("aria-label");
          const title = player
            .querySelector(".guided-scene-player__stage-title")
            ?.textContent?.trim();
          const scrubber = player.querySelector(
            ".guided-scene-player__scrubber input",
          );
          return {
            title,
            activeIdea,
            progress:
              scrubber instanceof HTMLInputElement ? scrubber.value : null,
            landed:
              activeIdea === expected.idea &&
              title === expected.title &&
              canvas instanceof HTMLCanvasElement &&
              canvas.width > 0 &&
              canvas.height > 0,
          };
        },
        { idea: expectedIdea, title: beat.chapter.title },
      );
      if (observed.landed) break;
    }
    if (!observed?.landed) {
      throw new Error(
        `learner chapter seek did not land on ${expectedIdea}; observed ${JSON.stringify(observed)}`,
      );
    }
    // The active chapter is published from the engine's frame event. Two browser
    // frames let the corresponding Stage.render paint before Playwright reads pixels.
    await page.evaluate(
      () =>
        new Promise((resolveFrame) =>
          requestAnimationFrame(() => requestAnimationFrame(resolveFrame)),
        ),
    );
    const target = join(
      packetDir,
      "reduced-motion",
      `${safeArtifactStem(item.beatId)}--learner-chapter.png`,
    );
    await root
      .locator(".guided-scene-player__canvas canvas")
      .screenshot({ path: target });
    records.push({
      beatId: item.beatId,
      chapterTitle: beat.chapter.title,
      artifact: packetPath(packetDir, target),
      captureSource: "learner-player",
      route,
      seek: {
        method: "learner-timeline-native-input",
        normalizedProgress: normalizedOpening,
        normalizedChapterOpeningFrame: item.frame,
      },
      browserMedia: {
        query: mediaQuery,
        requested: "reduce",
        matches: mediaMatches,
      },
      runId,
    });
  }
  await context.close();
  return {
    records,
    run: {
      runId,
      captureSource: "learner-player",
      route,
      browserMedia: {
        query: mediaQuery,
        requested: "reduce",
        matches: mediaMatches,
      },
    },
  };
}

function buildSummary(packet) {
  const failedAssertions = packet.analysis.assertions.filter(
    ({ pass }) => !pass,
  );
  const prediction = packet.beats.find((beat) => beat.prediction);
  const analysisSummary = packet.analysis.skipped
    ? `- Semantic analysis: skipped (${packet.analysis.skipped})`
    : `- Semantic samples: ${packet.analysis.sampledFrames}\n` +
      `- Hard-gate findings: ${packet.analysis.hardGateFindings.length}\n` +
      `- Failed BeatSpec assertions: ${failedAssertions.length}\n` +
      `- Direct chapter seeks: ${packet.analysis.directSeeks.filter(({ canvasMatch }) => canvasMatch).length}/` +
      `${packet.analysis.directSeeks.length} deterministic`;
  return `# ${packet.sceneId} animation review

- Scope: ${packet.scope}
- Production frames requested/emitted: ${packet.render.selectedRange?.requestedFrames ?? 0}/${packet.render.handledFrames} in ${packet.render.elapsedMs} ms
- Selected production range: ${packet.render.selectedRange ? `${packet.render.selectedRange.startFrame}–${packet.render.selectedRange.endFrame}` : "skipped"}
- Reduced-motion source: ${packet.reducedMotionRun.captureSource} (${packet.reducedMotionRun.browserMedia.query} matched: ${packet.reducedMotionRun.browserMedia.matches})
${analysisSummary}
- Checkpoint captures: ${packet.captures.length}
- Reduced-motion chapter frames: ${packet.reducedMotion.length}
- Prediction/reveal: ${prediction ? `${prediction.id} → ${prediction.prediction.revealBeat}` : "MISSING"}
- Status: ${packet.disposition}

## Artifacts

- \`contact-sheet.png\` — opening / midpoint / landing / final, grouped by beat
- \`preview.mp4\` — low-resolution prediction-to-reveal excerpt${packet.preview.skipped ? " (explicitly skipped)" : ""}
- \`analysis.json\` — expected-versus-observed assertions and semantic trajectories
- \`environment.json\` — reproducibility inputs
- \`packet.json\` — compact artifact ledger; missing evidence is a failure
${packet.failures.length ? `\n## Failures\n\n${packet.failures.map((failure) => `- ${failure}`).join("\n")}\n` : ""}`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const packetDir = join(options.out, options.sceneId);
  rmSync(packetDir, { recursive: true, force: true });
  mkdirSync(join(packetDir, "frames"), { recursive: true });
  mkdirSync(join(packetDir, "reduced-motion"), { recursive: true });

  let chromium;
  try {
    ({ chromium } = await import("@playwright/test"));
  } catch {
    throw new Error("@playwright/test is required");
  }
  const server = await ensureReviewDevServer({
    port: options.port,
    root: ROOT,
  });
  await withReviewBrowser(
    server,
    () => chromium.launch(),
    async (browser) => {
      const page = await browser.newPage();
      const browserErrors = [];
      page.on("console", (message) => {
        if (message.type() === "error") browserErrors.push(message.text());
      });
      await page.goto(server.url);
      await page.waitForFunction(
        () =>
          window.__exportReady === true &&
          window.__animationReviewReady === true,
        null,
        { timeout: 30_000 },
      );
      const description = await page.evaluate(
        (sceneId) => window.__animationReviewApi.describe(sceneId),
        options.sceneId,
      );
      if (
        options.beat &&
        !description.beats.some(({ id }) => id === options.beat)
      ) {
        throw new Error(`unknown beat "${options.beat}"`);
      }

      let analysis;
      let render;
      const focusedSelection = Boolean(options.beat || options.checkpoint);
      if (options.reducedMotionOnly) {
        analysis = {
          assertions: [],
          sampledFrames: 0,
          hardGateFindings: [],
          directSeeks: [],
          failures: [],
          skipped:
            "reduced-motion-only packet exercises the learner player instead",
        };
        render = {
          frameRecords: [],
          previewFramesDir: "",
          previewWritten: 0,
          previewStart: null,
          previewEnd: null,
          handled: 0,
          elapsedMs: 0,
          range: null,
          focused: true,
        };
      } else {
        if (focusedSelection) {
          analysis = {
            assertions: [],
            sampledFrames: 0,
            hardGateFindings: [],
            directSeeks: [],
            failures: [],
            skipped:
              "focused packet skips the full semantic sweep; run the unfiltered packet for approval",
          };
        } else {
          console.log(`→ measuring ${options.sceneId} against its BeatSpec`);
          analysis = await page.evaluate(
            ({ sceneId, stride }) =>
              window.__animationReviewApi.analyze(sceneId, stride),
            { sceneId: options.sceneId, stride: options.stride },
          );
          // Start the deterministic Renderer from a clean production project
          // after the full direct-seek analysis.
          await page.reload();
          await page.waitForFunction(
            () => window.__exportReady === true,
            null,
            { timeout: 30_000 },
          );
        }
        console.log("→ rendering selected production checkpoint range");
        render = await drainProductionRender(
          page,
          options,
          description,
          packetDir,
        );
      }

      console.log("→ capturing learner-facing prefers-reduced-motion chapters");
      const reducedRun = await captureReducedMotionEvidence(
        browser,
        server.url,
        options,
        description,
        packetDir,
        browserErrors,
      );
      const reducedMotion = reducedRun.records;

      const contactSheet = join(packetDir, "contact-sheet.png");
      const contactInputs =
        render.frameRecords.length > 0
          ? render.frameRecords.map(({ path }) => path)
          : reducedMotion.map(({ artifact }) => join(packetDir, artifact));
      const contactError = createContactSheet(contactInputs, contactSheet);
      const preview = join(packetDir, "preview.mp4");
      const previewError =
        options.skipVideo || options.reducedMotionOnly || render.focused
          ? null
          : createPreview(render.previewFramesDir, preview, description.fps);
      if (render.previewFramesDir)
        rmSync(render.previewFramesDir, { recursive: true, force: true });

      const environment = {
        node: process.version,
        platform: `${process.platform}-${process.arch}`,
        commit: gitValue(["rev-parse", "HEAD"]),
        workingTree: gitValue(["status", "--short"]) ? "dirty" : "clean",
        motionCanvasCore: packageVersion("@motion-canvas/core"),
        playwright: packageVersion("@playwright/test"),
        chromium: await browser.version(),
        ffmpeg: toolVersion("ffmpeg", ["-version"]),
        imagemagick: toolVersion("montage", ["-version"]),
        fps: description.fps,
        resolutionScale: 0.5,
        semanticStride: options.stride,
        tuning: REVIEW_SCENES[options.sceneId].tuningFile
          ? JSON.parse(
              readFileSync(
                join(ROOT, REVIEW_SCENES[options.sceneId].tuningFile),
                "utf8",
              ),
            )
          : null,
      };

      const expectedReduced = description.reducedMotionFrames.filter(
        (item) => !options.beat || item.beatId === options.beat,
      ).length;
      const reducedFailures = reducedMotionEvidenceFailures(
        reducedMotion,
        expectedReduced,
      );
      const missingArtifacts = [
        !existsSync(contactSheet) ? "contact-sheet.png" : null,
        !options.skipVideo &&
        !options.reducedMotionOnly &&
        !render.focused &&
        !existsSync(preview)
          ? "preview.mp4"
          : null,
        ...reducedMotion
          .filter(({ artifact }) => !existsSync(join(packetDir, artifact)))
          .map(({ artifact }) => artifact),
        ...render.frameRecords
          .filter(({ path }) => !existsSync(path))
          .map(({ path }) => packetPath(packetDir, path)),
      ].filter(Boolean);
      const failures = [
        ...analysis.failures,
        ...reducedFailures,
        ...browserErrors.map((message) => `browser console: ${message}`),
        ...(contactError ? [contactError] : []),
        ...(previewError ? [previewError] : []),
        ...missingArtifacts.map(
          (artifact) => `missing required artifact: ${artifact}`,
        ),
      ];
      const disposition =
        failures.length > 0
          ? `FAIL (${failures.length})`
          : options.reducedMotionOnly
            ? "EVIDENCE-ONLY (not an approval packet)"
            : render.focused
              ? "FOCUSED (not an approval packet)"
              : "PASS";
      const packet = {
        schemaVersion: 2,
        sceneId: options.sceneId,
        disposition,
        scope: options.beat
          ? `beat:${options.beat}${options.checkpoint ? `/checkpoint:${options.checkpoint}` : ""}`
          : options.reducedMotionOnly
            ? "reduced-motion"
            : "full-scene",
        beats: description.beats,
        mathData: description.mathData,
        captures: render.frameRecords.map(({ path, ...record }) => ({
          ...record,
          artifact: packetPath(packetDir, path),
        })),
        reducedMotion,
        referenceComparisons: description.referenceComparisons,
        referenceEvidence: {
          requested: false,
          disposition: "not-requested",
          comparisons: description.referenceComparisons,
        },
        preview: {
          artifact: "preview.mp4",
          startFrame: render.previewStart,
          endFrame: render.previewEnd,
          frames: render.previewWritten,
          skipped:
            options.skipVideo || options.reducedMotionOnly || render.focused,
        },
        render: {
          runId: "production-renderer",
          handledFrames: render.handled,
          elapsedMs: render.elapsedMs,
          selectedRange: render.range,
          resolutionScale: 0.5,
        },
        reducedMotionRun: reducedRun.run,
        analysis,
        environment: "environment.json",
        missingArtifacts,
        failures,
      };
      writeJson(join(packetDir, "analysis.json"), analysis);
      writeJson(join(packetDir, "environment.json"), environment);
      writeJson(join(packetDir, "packet.json"), packet);
      writeFileSync(join(packetDir, "summary.md"), buildSummary(packet));

      console.log(
        `${failures.length === 0 ? "✓" : "✗"} ${join(packetDir, "summary.md")}`,
      );
      console.log(`  contact sheet: ${contactSheet}`);
      if (!packet.preview.skipped) console.log(`  short preview: ${preview}`);
      if (failures.length > 0) {
        for (const failure of failures) console.error(`  - ${failure}`);
        process.exitCode = 1;
      }
    },
  );
}

main().catch((error) => {
  console.error(
    `error: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
