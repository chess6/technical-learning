// @ts-nocheck
import {readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {describe, expect, it} from "vitest";
import {compileSelectedProject, prepareSelectedProject} from "../../../../scripts/animate-scene.mjs";

const selectedScene = resolve(
  process.cwd(),
  "tools/motion-authoring/.generated/selectedScene.ts",
);

describe("generated Motion Canvas authoring adapter", () => {
  it("automatically rejects an invalid generated production-scene import", () => {
    prepareSelectedProject("matrix-transformations");
    const valid = readFileSync(selectedScene, "utf8");
    try {
      writeFileSync(
        selectedScene,
        'export {default} from "../../../src/guided-scenes/scenes/does-not-exist";\n',
      );
      expect(() => compileSelectedProject()).toThrow(
        /Generated authoring project failed typecheck[\s\S]*Cannot find module/,
      );
    } finally {
      writeFileSync(selectedScene, valid);
    }
    expect(() => compileSelectedProject()).not.toThrow();
  }, 20_000);
});
