import { defineConfig, devices } from "@playwright/test";

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
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
