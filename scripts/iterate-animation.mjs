#!/usr/bin/env node
/** Focused type/test/review loop for one production animation pilot. */
import {spawnSync} from "node:child_process";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

function valueAfter(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

const sceneId = valueAfter("--scene");
if (!sceneId) {
  console.error("error: pass --scene <id>");
  process.exit(1);
}

function run(label, command, commandArgs) {
  console.log(`→ ${label}`);
  const result = spawnSync(command, commandArgs, {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    console.error(`✗ ${label} failed`);
    process.exit(result.status ?? 1);
  }
}

run("typecheck", "npm", ["run", "typecheck"]);
run("focused animation contracts", "npx", [
  "vitest",
  "run",
  "src/guided-scenes/authoring/__tests__",
  "src/guided-scenes/validation/__tests__/hardGates.test.ts",
  "src/guided-scenes/validation/__tests__/semanticGeometry.test.ts",
  "src/guided-scenes/scenes/__tests__/sceneTimings.test.ts",
]);
run("deterministic review packet", "node", [
  "scripts/review-animation.mjs",
  ...args,
]);

const out = valueAfter("--out") ?? "artifacts/animation-review";
const beat = valueAfter("--beat");
console.log(
  `✓ iteration complete: ${out}/${sceneId}/summary.md` +
    (beat ? ` (focused beat: ${beat})` : ""),
);
