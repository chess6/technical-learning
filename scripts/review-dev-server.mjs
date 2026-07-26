import {spawn} from "node:child_process";
import {resolve} from "node:path";

export const REVIEW_HOST = "127.0.0.1";
const ROOT = resolve(import.meta.dirname, "..");

export function reviewServerUrl(port, host = REVIEW_HOST) {
  return `http://${host}:${port}/export-harness.html`;
}

export function reviewViteArgs(port, host = REVIEW_HOST) {
  return ["vite", "--host", host, "--port", String(port), "--strictPort"];
}

export async function withReviewBrowser(server, launchBrowser, runReview) {
  let browser;
  try {
    browser = await launchBrowser();
    return await runReview(browser);
  } finally {
    try {
      await browser?.close();
    } finally {
      server.stop();
    }
  }
}

async function probe(fetchImpl, url) {
  try {
    const response = await fetchImpl(url, {signal: AbortSignal.timeout(1500)});
    return response.ok;
  } catch {
    return false;
  }
}

function formatStartupFailure(port, host, exit, output) {
  const status = exit.signal ? `signal ${exit.signal}` : `code ${exit.code ?? "unknown"}`;
  const detail = output.trim();
  return [
    `vite dev server exited with ${status} before ${reviewServerUrl(port, host)} became healthy`,
    detail ? `vite output:\n${detail}` : "vite produced no startup output",
  ].join("\n");
}

export async function ensureReviewDevServer({
  port,
  host = REVIEW_HOST,
  root = ROOT,
  spawnImpl = spawn,
  fetchImpl = fetch,
  killImpl = process.kill,
  attempts = 60,
  pollMs = 500,
} = {}) {
  const url = reviewServerUrl(port, host);
  if (await probe(fetchImpl, url)) return {url, reused: true, stop() {}};

  const child = spawnImpl("npx", reviewViteArgs(port, host), {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });
  let output = "";
  const collect = (chunk) => {
    output = `${output}${String(chunk)}`.slice(-16_000);
  };
  child.stdout?.on("data", collect);
  child.stderr?.on("data", collect);
  const exited = new Promise((resolveExit) => {
    child.once("exit", (code, signal) => resolveExit({code, signal}));
    child.once("error", (error) => resolveExit({code: null, signal: null, error}));
  });

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const outcome = await Promise.race([
      exited.then((exit) => ({kind: "exit", exit})),
      new Promise((resolveWait) => setTimeout(() => resolveWait({kind: "poll"}), pollMs)),
    ]);
    if (outcome.kind === "exit") {
      if (outcome.exit.error) collect(outcome.exit.error.message);
      throw new Error(formatStartupFailure(port, host, outcome.exit, output));
    }
    if (await probe(fetchImpl, url)) {
      return {
        url,
        reused: false,
        stop() {
          try {
            killImpl(-child.pid, "SIGTERM");
          } catch {
            child.kill("SIGTERM");
          }
        },
      };
    }
  }
  child.kill("SIGTERM");
  throw new Error(
    `vite dev server did not become healthy at ${url}\n${output.trim() || "vite produced no startup output"}`,
  );
}
