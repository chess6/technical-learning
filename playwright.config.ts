import { defineConfig, devices } from "@playwright/test";

/**
 * Dev-server port. Overridable so a second checkout (a git worktree running a
 * parallel package) can run e2e without colliding with — or silently REUSING —
 * the dev server of another checkout on the default port. Reusing another
 * checkout's server is the dangerous failure: the suite passes or fails against
 * the wrong code with no warning.
 */
const PORT = process.env.E2E_PORT ?? "5173";
const BASE_URL = `http://localhost:${PORT}`;

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  /**
   * A GitHub runner has 2 cores and no warm Vite cache, so the first tests to
   * reach a heavy route pay for on-demand transforms that never appear on a
   * developer machine. The budget — not any assertion — is what changes here.
   */
  timeout: isCI ? 90_000 : 30_000,
  // Every spec is self-isolating: each test clears localStorage and Playwright
  // gives each its own browser context, so none depend on execution order.
  // Workers are capped at 2 (not unbounded): the motion-canvas guided-scene
  // specs are rAF-timing-sensitive and flake under heavy CPU contention, so a
  // modest cap keeps ~2× parallelism over serial without starving animations.
  // On CI that cap drops to 1: two workers on a 2-core runner leaves nothing
  // for the dev server and the animations it has to render in real time.
  fullyParallel: true,
  workers: isCI ? 1 : 2,
  // Deliberately no retries: a retry would hide exactly the flake this suite
  // exists to catch. Failures must be diagnosable instead — hence the trace.
  retries: 0,
  reporter: isCI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: isCI ? "retain-on-failure" : "on-first-retry",
    screenshot: isCI ? "only-on-failure" : "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !isCI,
    // Cold start on CI includes Vite dependency pre-bundling on 2 cores.
    timeout: isCI ? 180_000 : 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
