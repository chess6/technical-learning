// @ts-nocheck
import {EventEmitter} from "node:events";
import {PassThrough} from "node:stream";
import {describe, expect, it, vi} from "vitest";
import {
  ensureReviewDevServer,
  reviewServerUrl,
  reviewViteArgs,
  withReviewBrowser,
} from "../../../../scripts/review-dev-server.mjs";

function fakeChild() {
  const child = new EventEmitter();
  return Object.assign(child, {
    pid: 4242,
    stdout: new PassThrough(),
    stderr: new PassThrough(),
    kill: vi.fn(),
  });
}

describe("animation review dev server", () => {
  it("uses the same explicit host for Vite and the health probe", async () => {
    const child = fakeChild();
    const spawnImpl = vi.fn(() => child);
    const urls = [];
    const fetchImpl = vi.fn(async (url) => {
      urls.push(url);
      return {ok: urls.length > 1};
    });
    const killed = vi.fn();
    const server = await ensureReviewDevServer({
      port: 5174,
      spawnImpl,
      fetchImpl,
      killImpl: killed,
      pollMs: 1,
    });
    expect(spawnImpl).toHaveBeenCalledWith(
      "npx",
      reviewViteArgs(5174),
      expect.objectContaining({detached: true}),
    );
    expect(urls).toEqual([
      reviewServerUrl(5174),
      reviewServerUrl(5174),
    ]);
    server.stop();
    expect(killed).toHaveBeenCalledWith(-4242, "SIGTERM");
  });

  it("reports a premature exit and preserves Vite output immediately", async () => {
    const child = fakeChild();
    child.stderr.end("failed to load vite config: broken plugin\n");
    const started = Date.now();
    setTimeout(() => child.emit("exit", 1, null), 1);
    await expect(
      ensureReviewDevServer({
        port: 5174,
        spawnImpl: () => child,
        fetchImpl: async () => ({ok: false}),
        pollMs: 500,
      }),
    ).rejects.toThrow(/exited with code 1[\s\S]*broken plugin/);
    expect(Date.now() - started).toBeLessThan(250);
  });

  it("stops the spawned server when Chromium launch fails", async () => {
    const server = {stop: vi.fn()};
    const launchError = new Error("chromium executable missing");
    await expect(
      withReviewBrowser(
        server,
        async () => {
          throw launchError;
        },
        vi.fn(),
      ),
    ).rejects.toBe(launchError);
    expect(server.stop).toHaveBeenCalledOnce();
  });

  it("stops the spawned server even when browser.close fails", async () => {
    const closeError = new Error("browser close failed");
    const browser = {close: vi.fn(async () => { throw closeError; })};
    const server = {stop: vi.fn()};
    await expect(
      withReviewBrowser(server, async () => browser, async () => "reviewed"),
    ).rejects.toBe(closeError);
    expect(browser.close).toHaveBeenCalledOnce();
    expect(server.stop).toHaveBeenCalledOnce();
  });
});
