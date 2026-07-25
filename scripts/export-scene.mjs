#!/usr/bin/env node
/**
 * Export a guided Motion Canvas scene to a web-streamable MP4.
 *
 * Drives the dev-server-only harness (/export-harness.html) with headless
 * Chromium, captures exact frames via Motion Canvas's Renderer, and assembles
 * them with FFmpeg (libx264, yuv420p, +faststart). Without FFmpeg the PNG
 * frames are kept and the exact assembly command is printed.
 *
 * The exported video contains ONLY what the Motion Canvas scene draws. Lesson
 * prose, KaTeX equations, checkpoints, and explorations live outside the scene
 * and are NOT captured — see docs/engineering/video-export.md.
 *
 * Usage:
 *   node scripts/export-scene.mjs --list
 *   node scripts/export-scene.mjs --scene red-black-encoding
 *   node scripts/export-scene.mjs --scene eigenvectors-derivation \
 *     --fps 30 --scale 2 --out exports/ --keep-frames
 *
 * Options:
 *   --scene <id>    scene to export (repeatable; see --list)
 *   --fps <n>       frame rate (default 30)
 *   --scale <n>     resolution multiplier of the 960×540 stage (default 2 → 1920×1080)
 *   --out <dir>     output directory (default exports/)
 *   --port <n>      dev-server port (default 5173; server is reused if running)
 *   --keep-frames   keep the intermediate PNG sequence
 *   --list          list exportable scene ids and exit
 */

import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const options = {
    scenes: [],
    fps: 30,
    scale: 2,
    out: join(ROOT, "exports"),
    port: Number(process.env.PORT ?? 5173),
    keepFrames: false,
    list: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--scene":
        options.scenes.push(argv[++i]);
        break;
      case "--fps":
        options.fps = Number(argv[++i]);
        break;
      case "--scale":
        options.scale = Number(argv[++i]);
        break;
      case "--out":
        options.out = resolve(argv[++i]);
        break;
      case "--port":
        options.port = Number(argv[++i]);
        break;
      case "--keep-frames":
        options.keepFrames = true;
        break;
      case "--list":
        options.list = true;
        break;
      case "-h":
      case "--help":
        printHelp();
        process.exit(0);
        break;
      default:
        console.error(`unknown argument: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }
  if (!options.list && options.scenes.length === 0) {
    console.error("error: pass --scene <id> (or --list)");
    process.exit(1);
  }
  if (!Number.isFinite(options.fps) || options.fps <= 0 || options.fps > 120) {
    console.error("error: --fps must be in (0, 120]");
    process.exit(1);
  }
  if (!Number.isFinite(options.scale) || options.scale <= 0 || options.scale > 4) {
    console.error("error: --scale must be in (0, 4]");
    process.exit(1);
  }
  return options;
}

function printHelp() {
  console.log(
    `Export a guided Motion Canvas scene to MP4.\n\n` +
      `  node scripts/export-scene.mjs --list\n` +
      `  node scripts/export-scene.mjs --scene <id> [--fps 30] [--scale 2] [--out exports/] [--keep-frames]\n`,
  );
}

async function devServerUp(port) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/`, {
      signal: AbortSignal.timeout(1500),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function ensureDevServer(port) {
  if (await devServerUp(port)) {
    return { stop: () => {} };
  }
  console.log(`→ starting vite dev server on :${port}`);
  const child = spawn("npx", ["vite", "--port", String(port), "--strictPort"], {
    cwd: ROOT,
    stdio: "ignore",
    detached: true,
  });
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await new Promise((resolveSleep) => setTimeout(resolveSleep, 500));
    if (await devServerUp(port)) {
      return {
        stop: () => {
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

function haveFfmpeg() {
  return spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  let chromium;
  try {
    ({ chromium } = await import("@playwright/test"));
  } catch {
    console.error(
      "error: @playwright/test is required (npm install). It provides the headless browser.",
    );
    process.exit(1);
  }

  const server = await ensureDevServer(options.port);
  const browser = await chromium.launch();
  let exitCode = 0;

  try {
    const page = await browser.newPage();
    page.on("console", (message) => {
      if (message.type() === "error") {
        console.error(`  [browser] ${message.text()}`);
      }
    });
    await page.goto(`http://127.0.0.1:${options.port}/export-harness.html`);
    await page.waitForFunction(() => window.__exportReady === true, null, {
      timeout: 30_000,
    });

    const known = await page.evaluate(() => window.__exportApi.listScenes());
    if (options.list) {
      console.log(known.join("\n"));
      return;
    }

    for (const sceneId of options.scenes) {
      if (!known.includes(sceneId)) {
        console.error(
          `error: unknown scene "${sceneId}". Known scenes:\n  ${known.join("\n  ")}`,
        );
        exitCode = 1;
        continue;
      }
      // One retry: a dev-server HMR reload (source file changed mid-render)
      // destroys the page context and aborts the pass. Don't edit src/ while
      // exporting; if it happens anyway, a second clean pass usually lands.
      let ok = false;
      for (let attempt = 0; attempt < 2 && !ok; attempt += 1) {
        try {
          ok = await exportScene(page, sceneId, options);
        } catch (error) {
          console.warn(`! render pass failed (${error.message}); retrying once`);
        }
        // Reload for a clean renderer/queue between passes and scenes.
        await page.reload();
        await page.waitForFunction(() => window.__exportReady === true, null, {
          timeout: 30_000,
        });
      }
      if (!ok) exitCode = 1;
    }
  } finally {
    await browser.close();
    server.stop();
  }
  process.exit(exitCode);
}

async function exportScene(page, sceneId, options) {
  const framesDir = join(options.out, `.frames-${sceneId}`);
  rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });
  mkdirSync(options.out, { recursive: true });

  console.log(
    `→ rendering ${sceneId} @ ${options.fps} fps, scale ${options.scale}`,
  );
  // Fire-and-forget: start() resolves only when rendering completes, and the
  // in-page exporter applies backpressure until this loop drains the queue —
  // awaiting it here would deadlock at the queue cap.
  await page.evaluate(
    ({ sceneId, fps, scale }) => {
      void window.__exportApi.start({ sceneId, fps, resolutionScale: scale });
    },
    { sceneId, fps: options.fps, scale: options.scale },
  );

  let written = 0;
  // Drain the in-page frame queue until the renderer reports done.
  for (;;) {
    const { frames, state, error } = await page.evaluate(() => ({
      frames: window.__exportQueue.splice(0),
      state: window.__exportStatus.state,
      error: window.__exportStatus.error,
    }));
    for (const frame of frames) {
      const base64 = frame.data.slice(frame.data.indexOf(",") + 1);
      writeFileSync(
        join(framesDir, `${String(frame.frame).padStart(6, "0")}.png`),
        Buffer.from(base64, "base64"),
      );
      written += 1;
    }
    if (written > 0 && written % 300 < frames.length) {
      console.log(`  ${written} frames captured…`);
    }
    if (state === "error") {
      console.error(`error: renderer failed for ${sceneId}: ${error}`);
      return false;
    }
    if (state === "done" && frames.length === 0) break;
    await new Promise((resolveSleep) => setTimeout(resolveSleep, 120));
  }

  if (written === 0) {
    console.error(`error: no frames captured for ${sceneId}`);
    return false;
  }
  console.log(`  ${written} frames total`);

  const output = join(options.out, `${sceneId}.mp4`);
  const ffmpegArgs = [
    "-y",
    "-framerate",
    String(options.fps),
    "-i",
    join(framesDir, "%06d.png"),
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "18",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    output,
  ];

  if (!haveFfmpeg()) {
    console.warn(
      `! FFmpeg not found — keeping frames in ${framesDir}\n` +
        `  Assemble manually with:\n  ffmpeg ${ffmpegArgs.join(" ")}`,
    );
    return true;
  }

  const result = spawnSync("ffmpeg", ffmpegArgs, { stdio: "ignore" });
  if (result.status !== 0) {
    console.error(`error: ffmpeg failed for ${sceneId} (frames kept in ${framesDir})`);
    return false;
  }
  console.log(`✓ ${output}`);

  if (!options.keepFrames) {
    rmSync(framesDir, { recursive: true, force: true });
  }
  return true;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
