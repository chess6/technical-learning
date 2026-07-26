#!/usr/bin/env node
/** Deterministic, development-only review packet for a production scene. */
import {spawn, spawnSync} from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import {dirname, join, relative, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {
  missingCaptureFailures,
  planCheckpointArtifacts,
  safeArtifactStem,
} from "./animation-review-plan.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_OUT = join(ROOT, "artifacts", "animation-review");
const PILOT_SCENE = "matrix-transformations";

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
  if (options.sceneId !== PILOT_SCENE) {
    throw new Error(
      `review workflow is piloted only for "${PILOT_SCENE}"; received "${options.sceneId}"`,
    );
  }
  if (!Number.isInteger(options.port) || options.port < 1 || options.port > 65535) {
    throw new Error("--port must be an integer in [1, 65535]");
  }
  if (!Number.isInteger(options.stride) || options.stride < 1) {
    throw new Error("--stride must be a positive integer");
  }
  return options;
}

function printHelp() {
  console.log(`Create a deterministic production-scene review packet.

  npm run animation:review -- --scene matrix-transformations
  npm run animation:review -- --scene matrix-transformations --beat transform-sample
  npm run animation:review -- --scene matrix-transformations --reduced-motion

Options: --beat <id>, --checkpoint <id>, --reduced-motion, --skip-video,
         --reference, --stride <frames>, --out <dir>, --port <n>`);
}

async function serverIsUp(port) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/export-harness.html`, {
      signal: AbortSignal.timeout(1500),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function ensureDevServer(port) {
  if (await serverIsUp(port)) return {stop() {}};
  const child = spawn("npx", ["vite", "--port", String(port), "--strictPort"], {
    cwd: ROOT,
    stdio: "ignore",
    detached: true,
  });
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await new Promise((resolveSleep) => setTimeout(resolveSleep, 500));
    if (await serverIsUp(port)) {
      return {
        stop() {
          try {
            process.kill(-child.pid, "SIGTERM");
          } catch {
            child.kill("SIGTERM");
          }
        },
      };
    }
  }
  child.kill("SIGTERM");
  throw new Error(`vite dev server did not come up on :${port}`);
}

function toolVersion(command, args) {
  const result = spawnSync(command, args, {encoding: "utf8"});
  if (result.status !== 0) return null;
  return (result.stdout || result.stderr).split("\n")[0].trim();
}

function gitValue(args) {
  const result = spawnSync("git", args, {cwd: ROOT, encoding: "utf8"});
  return result.status === 0 ? result.stdout.trim() : null;
}

function packageVersion(name) {
  const packageJson = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  return packageJson.dependencies?.[name] ?? packageJson.devDependencies?.[name] ?? null;
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
      "-background", "#0b1020",
      "-fill", "#f8fafc",
      "-pointsize", "13",
      "-label", "%t",
      ...framePaths,
      "-thumbnail", "480x270",
      "-tile", "4x",
      "-geometry", "+8+26",
      output,
    ],
    {stdio: "pipe"},
  );
  return result.status === 0
    ? null
    : `contact sheet failed: ${(result.stderr?.toString() ?? "unknown error").trim()}`;
}

function createPreview(framesDir, output, fps) {
  const result = spawnSync(
    "ffmpeg",
    [
      "-y", "-framerate", String(fps), "-i", join(framesDir, "%06d.png"),
      "-c:v", "libx264", "-preset", "medium", "-crf", "23",
      "-pix_fmt", "yuv420p", "-movflags", "+faststart", output,
    ],
    {stdio: "pipe"},
  );
  return result.status === 0
    ? null
    : `preview encode failed: ${(result.stderr?.toString() ?? "unknown error").trim().split("\n").at(-1)}`;
}

async function drainProductionRender(page, options, description, packetDir) {
  const checkpoints = description.checkpoints.filter((checkpoint) =>
    (!options.beat || checkpoint.beatId === options.beat) &&
    (!options.checkpoint || checkpoint.checkpointId === options.checkpoint),
  );
  if (checkpoints.length === 0) throw new Error("the selected beat/checkpoint matched no captures");

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
  if (!options.skipVideo && !options.reducedMotionOnly) mkdirSync(previewFramesDir, {recursive: true});

  await page.evaluate(
    ({sceneId, fps}) => {
      window.__exportApi.start({sceneId, fps, resolutionScale: 0.5}).catch((error) => {
        window.__exportStatus.state = "error";
        window.__exportStatus.error = error instanceof Error ? error.message : String(error);
      });
    },
    {sceneId: options.sceneId, fps: description.fps},
  );

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
      const bytes = Buffer.from(frame.data.slice(frame.data.indexOf(",") + 1), "base64");
      for (const destination of frameDestinations.get(frame.frame) ?? []) {
        writeFileSync(destination, bytes);
      }
      if (
        !options.skipVideo && !options.reducedMotionOnly &&
        previewStart !== undefined && previewEnd !== undefined &&
        frame.frame >= previewStart && frame.frame <= previewEnd
      ) {
        writeFileSync(
          join(previewFramesDir, `${String(previewWritten).padStart(6, "0")}.png`),
          bytes,
        );
        previewWritten += 1;
      }
    }
    if (result.state === "error") throw new Error(`production render failed: ${result.error}`);
    if (result.state === "done" && result.frames.length === 0) break;
    if (Date.now() - lastFrameAt > 90_000) {
      throw new Error(`production render stalled after ${handled} frames`);
    }
    await new Promise((resolveSleep) => setTimeout(resolveSleep, 100));
  }

  const missing = missingCaptureFailures(frameRecords, existsSync);
  if (missing.length > 0) {
    throw new Error(
      `renderer omitted ${missing.length} requested checkpoint frames: ${missing.join(", ")}`,
    );
  }
  return {frameRecords, previewFramesDir, previewWritten, previewStart, previewEnd, handled};
}

function buildSummary(packet) {
  const failedAssertions = packet.analysis.assertions.filter(({pass}) => !pass);
  const prediction = packet.beats.find((beat) => beat.prediction);
  return `# ${packet.sceneId} animation review

- Scope: ${packet.scope}
- Production frames rendered: ${packet.render.handledFrames}
- Semantic samples: ${packet.analysis.sampledFrames}
- Checkpoint captures: ${packet.captures.length}
- Reduced-motion chapter frames: ${packet.reducedMotion.length}
- Prediction/reveal: ${prediction ? `${prediction.id} → ${prediction.prediction.revealBeat}` : "MISSING"}
- Hard-gate findings: ${packet.analysis.hardGateFindings.length}
- Failed BeatSpec assertions: ${failedAssertions.length}
- Direct chapter seeks: ${packet.analysis.directSeeks.filter(({canvasMatch}) => canvasMatch).length}/${packet.analysis.directSeeks.length} deterministic
- Benchmark comparison frames: ${packet.referenceComparisons.length === 0 ? "unsupported for this pilot (recorded explicitly)" : packet.referenceComparisons.length}
- Status: ${packet.failures.length === 0 ? "PASS" : `FAIL (${packet.failures.length})`}

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
  rmSync(packetDir, {recursive: true, force: true});
  mkdirSync(join(packetDir, "frames"), {recursive: true});
  mkdirSync(join(packetDir, "reduced-motion"), {recursive: true});

  let chromium;
  try {
    ({chromium} = await import("@playwright/test"));
  } catch {
    throw new Error("@playwright/test is required");
  }
  const server = await ensureDevServer(options.port);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const browserErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    await page.goto(`http://127.0.0.1:${options.port}/export-harness.html`);
    await page.waitForFunction(
      () => window.__exportReady === true && window.__animationReviewReady === true,
      null,
      {timeout: 30_000},
    );
    const description = await page.evaluate(
      (sceneId) => window.__animationReviewApi.describe(sceneId),
      options.sceneId,
    );
    if (options.beat && !description.beats.some(({id}) => id === options.beat)) {
      throw new Error(`unknown beat "${options.beat}"`);
    }

    console.log(`→ measuring ${options.sceneId} against its BeatSpec`);
    const analysis = await page.evaluate(
      ({sceneId, stride}) => window.__animationReviewApi.analyze(sceneId, stride),
      {sceneId: options.sceneId, stride: options.stride},
    );

    // A fresh page guarantees the deterministic Renderer starts from a clean
    // production project after the direct-seek analysis.
    await page.reload();
    await page.waitForFunction(() => window.__exportReady === true, null, {timeout: 30_000});
    console.log("→ rendering production checkpoints and short preview source");
    const render = await drainProductionRender(page, options, description, packetDir);

    const reducedMotion = [];
    for (const item of description.reducedMotionFrames) {
      if (options.beat && item.beatId !== options.beat) continue;
      const source = render.frameRecords.find(
        (frame) => frame.beatId === item.beatId && frame.checkpointId === "opening",
      );
      if (!source) continue;
      const target = join(
        packetDir,
        "reduced-motion",
        `${safeArtifactStem(item.beatId)}--chapter-opening-f${String(item.frame).padStart(6, "0")}.png`,
      );
      copyFileSync(source.path, target);
      reducedMotion.push({...item, artifact: packetPath(packetDir, target)});
    }

    const contactSheet = join(packetDir, "contact-sheet.png");
    const contactError = createContactSheet(
      render.frameRecords.map(({path}) => path),
      contactSheet,
    );
    const preview = join(packetDir, "preview.mp4");
    const previewError = options.skipVideo || options.reducedMotionOnly
      ? null
      : createPreview(render.previewFramesDir, preview, description.fps);
    rmSync(render.previewFramesDir, {recursive: true, force: true});

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
      tuning: JSON.parse(
        readFileSync(join(ROOT, "src/guided-scenes/authoring/matrixTransformationTuning.json"), "utf8"),
      ),
    };

    const missingArtifacts = [
      !existsSync(contactSheet) ? "contact-sheet.png" : null,
      !options.skipVideo && !options.reducedMotionOnly && !existsSync(preview) ? "preview.mp4" : null,
      ...render.frameRecords.filter(({path}) => !existsSync(path)).map(({path}) => packetPath(packetDir, path)),
    ].filter(Boolean);
    const failures = [
      ...analysis.failures,
      ...browserErrors.map((message) => `browser console: ${message}`),
      ...(contactError ? [contactError] : []),
      ...(previewError ? [previewError] : []),
      ...missingArtifacts.map((artifact) => `missing required artifact: ${artifact}`),
    ];
    const packet = {
      schemaVersion: 1,
      sceneId: options.sceneId,
      scope: options.beat
        ? `beat:${options.beat}${options.checkpoint ? `/checkpoint:${options.checkpoint}` : ""}`
        : options.reducedMotionOnly ? "reduced-motion" : "full-pilot",
      beats: description.beats,
      captures: render.frameRecords.map(({path, ...record}) => ({
        ...record,
        artifact: packetPath(packetDir, path),
      })),
      reducedMotion,
      referenceComparisons: description.referenceComparisons,
      referenceRequested: options.reference,
      preview: {
        artifact: "preview.mp4",
        startFrame: render.previewStart,
        endFrame: render.previewEnd,
        frames: render.previewWritten,
        skipped: options.skipVideo || options.reducedMotionOnly,
      },
      render: {handledFrames: render.handled, resolutionScale: 0.5},
      analysis,
      environment: "environment.json",
      missingArtifacts,
      failures,
    };
    writeJson(join(packetDir, "analysis.json"), analysis);
    writeJson(join(packetDir, "environment.json"), environment);
    writeJson(join(packetDir, "packet.json"), packet);
    writeFileSync(join(packetDir, "summary.md"), buildSummary(packet));

    console.log(`${failures.length === 0 ? "✓" : "✗"} ${join(packetDir, "summary.md")}`);
    console.log(`  contact sheet: ${contactSheet}`);
    if (!packet.preview.skipped) console.log(`  short preview: ${preview}`);
    if (failures.length > 0) {
      for (const failure of failures) console.error(`  - ${failure}`);
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
    server.stop();
  }
}

main().catch((error) => {
  console.error(`error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
