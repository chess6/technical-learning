#!/usr/bin/env node
/**
 * Regenerate the benchmark laboratory's evidence.
 *
 * For every benchmark it drives the dev-only laboratory page to:
 *   1. run the full multi-dimension comparison and write the measurement
 *      report to docs/quality/benchmark-lab/measurements/<id>.json (committed);
 *   2. capture one paired reference/replica frame per conceptual beat into
 *      screenshots/benchmark-lab/ (git-ignored — the reference half is
 *      reference-only media and must never be committed).
 *
 * Usage:
 *   node scripts/capture-benchmark-evidence.mjs            # every benchmark
 *   node scripts/capture-benchmark-evidence.mjs ab-split   # just one
 *
 * Requires the dev server (./start.sh) and the fetched reference media
 * (scripts/fetch-benchmark-media.sh).
 */

import { chromium } from "@playwright/test";

const PORT = process.env.PORT ?? 5173;
const BASE = `http://localhost:${PORT}`;
const only = process.argv.slice(2);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

const failures = [];
try {
  await page.goto(`${BASE}/dev/benchmark-lab`);
  // Wait for the list to render. Querying it too early returned an empty
  // array and the whole sweep "succeeded" without visiting a single
  // benchmark — the exact silent no-op this script exists to produce evidence
  // against.
  const options = page.getByLabel("Benchmark").locator("option");
  // `attached`, not `visible`: an <option> inside a closed select is never
  // "visible" to Playwright.
  await options.first().waitFor({ state: "attached", timeout: 30_000 });
  const ids = await options.evaluateAll((all) => all.map((option) => option.value));
  if (ids.length === 0) throw new Error("no benchmarks listed by the laboratory");
  process.stdout.write(`benchmarks: ${ids.join(", ")}\n`);

  for (const id of ids) {
    if (only.length > 0 && !only.includes(id)) continue;
    process.stdout.write(`== ${id}\n`);
    await page.goto(`${BASE}/dev/benchmark-lab?benchmark=${id}`);
    await page.locator(".bench-lab__replica-host canvas").waitFor({ timeout: 60_000 });

    if (await page.locator(".bench-lab__media-warning").isVisible()) {
      failures.push(`${id}: reference media missing — run scripts/fetch-benchmark-media.sh`);
      continue;
    }

    await page.getByRole("button", { name: /Run checks/ }).click();
    await page
      .locator(".bench-lab__status")
      .filter({ hasText: /hard failure/ })
      .waitFor({ timeout: 300_000 });
    const summary = await page.locator(".bench-lab__status").textContent();
    process.stdout.write(`   checks: ${summary}\n`);
    if (!/^0 hard failure/.test(summary ?? "")) {
      failures.push(`${id}: ${summary}`);
    }

    await page.getByRole("button", { name: "Capture beat keyframes" }).click();
    await page
      .locator(".bench-lab__status")
      .filter({ hasText: /captured \d+ pairs|capture failed/ })
      .waitFor({ timeout: 300_000 });
    const captured = (await page.locator(".bench-lab__status").textContent()) ?? "";
    process.stdout.write(`   ${captured}\n`);
    // "captured 0 pairs" is a failure, not a pass: the evidence is the point.
    if (!/captured [1-9]\d* pairs/.test(captured)) {
      failures.push(`${id}: ${captured}`);
    }
  }
} finally {
  await browser.close();
}

if (failures.length > 0) {
  process.stderr.write(`\nBenchmarks with hard failures:\n- ${failures.join("\n- ")}\n`);
  process.exit(1);
}
process.stdout.write("\nevidence regenerated\n");
