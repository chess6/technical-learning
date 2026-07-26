import {readFileSync, writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import type {Plugin} from "vite";
import {validateMatrixTransformationTuning} from "../../src/guided-scenes/authoring/matrixTransformationTuning";

const tuningFile = fileURLToPath(
  new URL(
    "../../src/guided-scenes/authoring/matrixTransformationTuning.json",
    import.meta.url,
  ),
);

export function tuningPersistencePlugin(): Plugin {
  return {
    name: "motion-authoring:tuning-persistence",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.url !== "/__animation-authoring/tuning") {
          next();
          return;
        }
        response.setHeader("content-type", "application/json");
        if (request.method === "GET") {
          response.end(readFileSync(tuningFile, "utf8"));
          return;
        }
        if (request.method !== "POST") {
          response.statusCode = 405;
          response.end(JSON.stringify({ok: false, error: "method not allowed"}));
          return;
        }
        try {
          let body = "";
          for await (const chunk of request) {
            body += String(chunk);
            if (body.length > 20_000) throw new Error("request is too large");
          }
          const candidate = JSON.parse(body) as unknown;
          const problems = validateMatrixTransformationTuning(candidate);
          if (problems.length > 0) {
            response.statusCode = 400;
            response.end(JSON.stringify({ok: false, error: problems.join("; ")}));
            return;
          }
          writeFileSync(tuningFile, `${JSON.stringify(candidate, null, 2)}\n`);
          response.end(JSON.stringify({ok: true}));
        } catch (error) {
          response.statusCode = 400;
          response.end(
            JSON.stringify({
              ok: false,
              error: error instanceof Error ? error.message : String(error),
            }),
          );
        }
      });
    },
  };
}
