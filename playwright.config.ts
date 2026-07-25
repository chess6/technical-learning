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

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  // Every spec is self-isolating: each test clears localStorage and Playwright
  // gives each its own browser context, so none depend on execution order.
  // Workers are capped at 2 (not unbounded): the motion-canvas guided-scene
  // specs are rAF-timing-sensitive and flake under heavy CPU contention, so a
  // modest cap keeps ~2× parallelism over serial without starving animations.
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
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
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
