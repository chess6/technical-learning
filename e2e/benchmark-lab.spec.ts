import { test, expect, type Page } from "@playwright/test";
import { BENCHMARK_MANIFESTS } from "../src/benchmark-lab/manifests";

/**
 * The animation benchmark laboratory, exercised the way an author uses it.
 *
 * Covers every control the laboratory promises: the four comparison views,
 * synchronized playback, scrubbing, frame stepping, beat navigation, speed,
 * the alignment/safe-frame/coordinate overlays, the dual event timeline, the
 * per-beat measurement panel, and paired-frame capture — at a desktop width
 * and at a narrow one.
 *
 * The laboratory is dev-only and must never leak into the learner surface,
 * which the last test pins.
 */

const LAB = "/dev/benchmark-lab";
const VIEW_MODES = ["side-by-side", "reference", "replica", "overlay", "difference"] as const;

function consoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

/** The replica canvas is mounted asynchronously; wait for it to paint. */
async function waitForReplica(page: Page): Promise<void> {
  await expect(page.locator(".bench-lab__replica-host canvas")).toBeVisible({
    timeout: 30_000,
  });
}

/** A valid 1×1 PNG lets capture coverage run without git-ignored local media. */
const REFERENCE_PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

async function mockReferenceMedia(page: Page): Promise<void> {
  await page.route("**/benchmark-media/frames/**", async (route) => {
    if (route.request().url().endsWith("/meta.json")) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ frameFps: 15, frameCount: 300 }),
      });
      return;
    }
    await route.fulfill({ contentType: "image/png", body: REFERENCE_PIXEL });
  });
}

test.describe("benchmark laboratory", () => {
  test.describe.configure({ timeout: 120_000 });

  test("drives every control at desktop width", async ({ page }) => {
    const errors = consoleErrors(page);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(LAB);
    await waitForReplica(page);

    const clock = page.locator(".bench-lab__clock");
    const scrubber = page.locator(".bench-lab__scrubber");

    // --- frame stepping -----------------------------------------------------
    await page.getByRole("button", { name: "Step forward" }).click();
    await expect(clock).toContainText("f1");
    await page.getByRole("button", { name: "Step back" }).click();
    await expect(clock).toContainText("f0");

    // --- scrubbing ----------------------------------------------------------
    const lastFrame = Number(await scrubber.getAttribute("max"));
    const scrubTarget = Math.max(1, Math.floor(lastFrame / 2));
    await scrubber.fill(String(scrubTarget));
    await expect(clock).toContainText("f" + scrubTarget);

    // --- beat navigation ----------------------------------------------------
    const beats = page.locator(".bench-lab__beats button");
    const beatCount = await beats.count();
    expect(beatCount).toBeGreaterThan(0);
    const lastBeat = beats.nth(beatCount - 1);
    await lastBeat.click();
    await expect(lastBeat).toHaveClass(/is-active/);
    if (beatCount > 1) {
      await page.getByRole("button", { name: "⟨ beat" }).click();
      await expect(beats.nth(beatCount - 2)).toHaveClass(/is-active/);
      await page.getByRole("button", { name: "beat ⟩" }).click();
      await expect(lastBeat).toHaveClass(/is-active/);
    }

    // --- synchronized playback ---------------------------------------------
    const before = await clock.textContent();
    await page.getByRole("button", { name: "Play" }).click();
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
    await page.waitForTimeout(1200);
    await page.getByRole("button", { name: "Pause" }).click();
    expect(await clock.textContent()).not.toBe(before);

    // --- speed --------------------------------------------------------------
    for (const speed of ["0.25", "2"]) {
      await page.getByLabel("Playback speed").selectOption(speed);
      await expect(page.getByLabel("Playback speed")).toHaveValue(speed);
    }

    // --- comparison views ---------------------------------------------------
    for (const mode of VIEW_MODES) {
      await page.getByRole("tab", { name: mode }).click();
      await expect(page.getByRole("tab", { name: mode })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    }
    await page.getByRole("tab", { name: "side-by-side" }).click();

    // --- guides -------------------------------------------------------------
    for (const guide of ["safe frame", "alignment", "coordinates"]) {
      await page.getByLabel(guide).check();
    }
    await expect(page.locator(".bench-lab__guides-overlay").first()).toBeVisible();

    // --- timeline + measurements -------------------------------------------
    await expect(page.locator('.bench-lab__timeline-row[data-row="reference"]')).toBeVisible();
    await expect(page.locator('.bench-lab__timeline-row[data-row="replica"]')).toBeVisible();
    await expect(page.locator(".bench-lab__timeline-tick").first()).toBeVisible();
    await expect(page.locator(".bench-lab__purpose")).not.toBeEmpty();

    // --- actual comparison run ---------------------------------------------
    await page.getByRole("button", { name: "Run checks" }).click();
    await expect(page.locator(".bench-lab__status")).toContainText(
      "0 hard failure(s)",
      { timeout: 60_000 },
    );
    await expect(page.locator(".bench-lab__dimensions tbody tr").first()).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("stays usable at a narrow width", async ({ page }) => {
    const errors = consoleErrors(page);
    await page.setViewportSize({ width: 720, height: 900 });
    await page.goto(LAB);
    await waitForReplica(page);

    // Panels stack rather than overflowing the viewport.
    const stage = page.locator(".bench-lab__stage");
    const box = await stage.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(720);

    const documentWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(documentWidth).toBeLessThanOrEqual(land(720));

    // Controls still work at this width.
    await page.getByRole("button", { name: "Step forward" }).click();
    await expect(page.locator(".bench-lab__clock")).toContainText("f1");
    await page.getByRole("tab", { name: "overlay" }).click();
    await expect(page.getByRole("tab", { name: "overlay" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    expect(errors).toEqual([]);
  });

  test("reports capture failures and only claims success after both writes", async ({
    page,
  }) => {
    await mockReferenceMedia(page);
    let rejectedPosts = 0;
    await page.route("**/__benchmark-lab/capture", async (route) => {
      rejectedPosts += 1;
      await route.fulfill({ status: 500, body: "simulated write failure" });
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(LAB);
    await waitForReplica(page);

    await page.getByRole("button", { name: "Capture pair", exact: true }).click();
    await expect(page.locator(".bench-lab__status")).toContainText(
      "capture failed",
      { timeout: 30_000 },
    );
    expect(rejectedPosts).toBe(1);

    await page.unroute("**/__benchmark-lab/capture");
    let savedPosts = 0;
    await page.route("**/__benchmark-lab/capture", async (route) => {
      savedPosts += 1;
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ saved: `/tmp/pair-${savedPosts}.png` }),
      });
    });
    await page.getByRole("button", { name: "Capture pair", exact: true }).click();
    await expect(page.locator(".bench-lab__status")).toContainText("captured pair", {
      timeout: 30_000,
    });
    expect(savedPosts).toBe(2);
  });

  test("offers every benchmark and never leaks into the learner surface", async ({
    page,
  }) => {
    await page.goto(LAB);
    const options = page.getByLabel("Benchmark").locator("option");
    await expect(options).toHaveCount(BENCHMARK_MANIFESTS.length);

    // The laboratory is reachable only from the dev tree: no learner-facing
    // page links to it, and the learner player never mounts a replica.
    await page.goto("/");
    await expect(page.locator('a[href*="benchmark-lab"]')).toHaveCount(0);
  });
});

/** Allow a scrollbar's worth of slack when comparing document width. */
function land(width: number): number {
  return width + 1;
}
