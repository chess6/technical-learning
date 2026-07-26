import { createRequire } from "node:module";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { tuningPersistencePlugin } from "./tuningPersistencePlugin";

const require = createRequire(import.meta.url);
const motionCanvas = require("@motion-canvas/vite-plugin")
  .default as typeof import("@motion-canvas/vite-plugin").default;

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const inspectorModulePath = fileURLToPath(
  new URL("./node_modules/@motion-canvas/2d/editor/index.js", import.meta.url),
);

export default defineConfig({
  plugins: [
    tuningPersistencePlugin(),
    {
      name: "motion-authoring:editor-module-bridge",
      configureServer(server) {
        server.middlewares.use((request, _response, next) => {
          if (request.url?.startsWith("/@id/@motion-canvas/2d/editor")) {
            const query = request.url.split("?", 2)[1];
            request.url = `/@fs${inspectorModulePath}${query ? `?${query}` : ""}`;
          }
          next();
        });
      },
    },
    motionCanvas({
      project: "./.generated/project.ts",
      output: "../../artifacts/motion-authoring-output",
    }),
  ],
  resolve: {
    // Keep editor and production scenes on one runtime instance.
    alias: [
      {
        find: /^@motion-canvas\/2d\/editor$/,
        replacement: fileURLToPath(
          new URL(
            "./node_modules/@motion-canvas/2d/editor/index.js",
            import.meta.url,
          ),
        ),
      },
      {
        find: "@motion-canvas/core",
        replacement: fileURLToPath(
          new URL("../../node_modules/@motion-canvas/core", import.meta.url),
        ),
      },
      {
        find: "@motion-canvas/2d",
        replacement: fileURLToPath(
          new URL("../../node_modules/@motion-canvas/2d", import.meta.url),
        ),
      },
    ],
    dedupe: ["@motion-canvas/core", "@motion-canvas/2d"],
  },
  optimizeDeps: {
    include: ["@motion-canvas/2d/editor"],
  },
  server: {
    fs: { allow: [repositoryRoot] },
  },
});
