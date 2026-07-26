import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, normalize, resolve } from "node:path";
import type { Plugin } from "vite";

/**
 * Dev-server-only plugin for the animation benchmark laboratory.
 *
 *  - GET /benchmark-media/**  serves the git-ignored local reference media
 *    (.reference-sources/media/) so the lab can show reference frames beside
 *    the replica. Never part of a build: configureServer only runs in dev.
 *  - POST /__benchmark-lab/capture  saves paired comparison frames (PNG data
 *    URLs) under screenshots/benchmark-lab/ (git-ignored).
 *  - POST /__benchmark-lab/report  saves a measurement report JSON under
 *    docs/quality/benchmark-lab/measurements/ (committed evidence).
 */
export function benchmarkLabPlugin(rootDir: string): Plugin {
  const mediaRoot = resolve(rootDir, ".reference-sources/media");
  const captureRoot = resolve(rootDir, "screenshots/benchmark-lab");
  const reportRoot = resolve(rootDir, "docs/quality/benchmark-lab/measurements");

  const contentTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".json": "application/json",
    ".mp4": "video/mp4",
  };

  return {
    name: "benchmark-lab",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? "").split("?")[0]!;

        if (req.method === "GET" && url.startsWith("/benchmark-media/")) {
          const rel = normalize(url.slice("/benchmark-media/".length));
          if (rel.startsWith("..")) {
            res.statusCode = 403;
            res.end("forbidden");
            return;
          }
          const file = join(mediaRoot, rel);
          if (!existsSync(file)) {
            res.statusCode = 404;
            res.end("not fetched — run scripts/fetch-benchmark-media.sh");
            return;
          }
          const ext = file.slice(file.lastIndexOf("."));
          res.setHeader("Content-Type", contentTypes[ext] ?? "application/octet-stream");
          res.setHeader("Cache-Control", "max-age=3600");
          res.end(readFileSync(file));
          return;
        }

        if (req.method === "POST" && url.startsWith("/__benchmark-lab/")) {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", () => {
            try {
              const payload = JSON.parse(body) as Record<string, unknown>;
              const safeName = String(payload.name ?? "unnamed").replace(
                /[^a-zA-Z0-9._-]/g,
                "_",
              );
              if (url === "/__benchmark-lab/capture") {
                const dataUrl = String(payload.dataUrl ?? "");
                const match = /^data:image\/png;base64,(.+)$/.exec(dataUrl);
                if (!match) throw new Error("expected a PNG data URL");
                mkdirSync(captureRoot, { recursive: true });
                const file = join(captureRoot, `${safeName}.png`);
                writeFileSync(file, Buffer.from(match[1]!, "base64"));
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ saved: file }));
                return;
              }
              if (url === "/__benchmark-lab/report") {
                mkdirSync(reportRoot, { recursive: true });
                const file = join(reportRoot, `${safeName}.json`);
                writeFileSync(
                  file,
                  `${JSON.stringify(payload.report, null, 2)}\n`,
                );
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ saved: file }));
                return;
              }
              res.statusCode = 404;
              res.end("unknown lab endpoint");
            } catch (error) {
              res.statusCode = 400;
              res.end(String(error));
            }
          });
          return;
        }

        next();
      });
    },
  };
}
