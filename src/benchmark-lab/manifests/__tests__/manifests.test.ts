import { describe, expect, it } from "vitest";
import referenceSources from "../../../../.reference-sources/manifest.json";
import {
  BENCHMARK_MANIFESTS,
  benchmarkDuration,
  getBenchmarkManifest,
  getReferenceWindow,
  toReplicaTime,
  validateBenchmarkManifest,
  type BenchmarkManifest,
} from "../index";

/**
 * The manifest format is the laboratory's contract: every downstream system
 * (replica timing, comparison engine, lab UI) trusts these shapes. These tests
 * hold the format itself plus each committed manifest's internal consistency.
 */

describe("benchmark manifest registry", () => {
  it("has at least one benchmark per curated reference pack", () => {
    const packs = new Set(BENCHMARK_MANIFESTS.map((m) => m.packDir));
    expect(packs).toEqual(
      new Set([
        ".reference-sources/packs/PFDu9oVAE-g",
        ".reference-sources/packs/B3y0RsVCyrw",
        ".reference-sources/packs/lifFgyB77zc",
        ".reference-sources/packs/mVzsz8Actrc",
      ]),
    );
    expect(BENCHMARK_MANIFESTS.length).toBeGreaterThanOrEqual(4);
  });

  it("throws for unknown ids", () => {
    expect(() => getBenchmarkManifest("nope")).toThrow(/Unknown benchmark/);
  });

  it.each(BENCHMARK_MANIFESTS.map((m) => [m.id, m] as const))(
    "%s validates cleanly",
    (_id, manifest) => {
      expect(validateBenchmarkManifest(manifest)).toEqual([]);
    },
  );

  it.each(BENCHMARK_MANIFESTS.map((m) => [m.id, m] as const))(
    "%s pins the same commit as the reference-source manifest",
    (_id, manifest) => {
      const repo = referenceSources.repositories.find(
        (r) => r.slug === manifest.source.repoSlug,
      );
      expect(repo, `repo ${manifest.source.repoSlug} in .reference-sources/manifest.json`).toBeDefined();
      expect(manifest.source.inspectedCommit).toBe(repo!.inspectedCommit);
    },
  );

  it.each(BENCHMARK_MANIFESTS.map((m) => [m.id, m] as const))(
    "%s events fall inside the beat structure they describe",
    (_id, manifest) => {
      const window = getReferenceWindow(manifest.id);
      for (const event of manifest.events) {
        expect(event.refTime).toBeGreaterThanOrEqual(window.start);
        expect(event.refTime).toBeLessThanOrEqual(window.end);
      }
    },
  );

  it("maps reference times onto the replica timeline", () => {
    const eigen = getBenchmarkManifest("eigen-span-stretch");
    expect(toReplicaTime(eigen, 117.4)).toBeCloseTo(0, 5);
    expect(benchmarkDuration(eigen)).toBeCloseTo(85.1, 5);
  });
});

describe("validateBenchmarkManifest", () => {
  function mutated(
    mutate: (m: BenchmarkManifest) => void,
  ): BenchmarkManifest {
    const clone = structuredClone(
      BENCHMARK_MANIFESTS[0],
    ) as BenchmarkManifest;
    mutate(clone);
    return clone;
  }

  it("rejects beats that do not tile the window", () => {
    const bad = mutated((m) => {
      m.beats[1] = { ...m.beats[1]!, refStart: m.beats[1]!.refStart + 1 };
    });
    expect(validateBenchmarkManifest(bad).join("\n")).toMatch(/must tile/);
  });

  it("rejects visible objects that are not declared", () => {
    const bad = mutated((m) => {
      m.beats[0]!.visibleObjects.push("ghost-object");
    });
    expect(validateBenchmarkManifest(bad).join("\n")).toMatch(/unknown object "ghost-object"/);
  });

  it("rejects landmarks that lie off-stage", () => {
    const bad = mutated((m) => {
      m.landmarks[0] = { ...m.landmarks[0]!, x: 9999 };
    });
    expect(validateBenchmarkManifest(bad).join("\n")).toMatch(/off-stage/);
  });

  it("rejects events outside the excerpt window", () => {
    const bad = mutated((m) => {
      m.events[0] = { ...m.events[0]!, refTime: 5 };
    });
    expect(validateBenchmarkManifest(bad).join("\n")).toMatch(/outside the window/);
  });

  it("rejects objects that persist across unknown beats", () => {
    const bad = mutated((m) => {
      m.objects[0]!.persistsAcross.push("no-such-beat");
    });
    expect(validateBenchmarkManifest(bad).join("\n")).toMatch(/unknown beat "no-such-beat"/);
  });

  it("rejects non-positive tolerances", () => {
    const bad = mutated((m) => {
      m.tolerances.landmarkPx = 0;
    });
    expect(validateBenchmarkManifest(bad).join("\n")).toMatch(/tolerances must be positive/);
  });
});
