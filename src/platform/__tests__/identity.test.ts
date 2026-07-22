import { describe, expect, it } from "vitest";
import {
  asExerciseId,
  asLessonId,
  assertUniqueIds,
  isExperimentalId,
  isValidIdSyntax,
  resolveId,
  runMigrations,
  SCHEMA_VERSION,
  type AliasMap,
  type EntityKind,
  type Migration,
  type VersionedState,
} from "../identity";

describe("id syntax + branded guards", () => {
  it("accepts canonical unnamespaced ids unchanged", () => {
    expect(isValidIdSyntax("vectors")).toBe(true);
    expect(isValidIdSyntax("vec-add-compute")).toBe(true);
    expect(isValidIdSyntax("karatsuba-z1")).toBe(true);
    // Branding is a compile-time guard; the runtime value is the same string.
    expect(asLessonId("vectors")).toBe("vectors");
    expect(asExerciseId("vec-add-compute")).toBe("vec-add-compute");
  });

  it("rejects malformed ids", () => {
    for (const bad of ["Vectors", "vec_add", "vec--add", "-vec", "vec-", " vec", ""]) {
      expect(isValidIdSyntax(bad)).toBe(false);
      expect(() => asLessonId(bad)).toThrow();
    }
  });

  it("recognizes experimental ids but still validates their syntax", () => {
    expect(isExperimentalId("x-my-idea")).toBe(true);
    expect(isValidIdSyntax("x-my-idea")).toBe(true);
    expect(() => asLessonId("x-my-idea")).not.toThrow();
    // Experimental prefix does not excuse bad syntax.
    expect(isValidIdSyntax("x-Bad_Idea")).toBe(false);
    expect(() => asLessonId("x-Bad_Idea")).toThrow();
  });
});

describe("alias resolution", () => {
  const aliases: Record<EntityKind, AliasMap> = {
    course: {},
    unit: {},
    lesson: { "old-vectors": "vectors", "ancient-vectors": "old-vectors" },
    exercise: {},
    concept: {},
  };

  it("follows a multi-hop alias chain to the canonical id", () => {
    expect(resolveId("lesson", "ancient-vectors", aliases)).toBe("vectors");
    expect(resolveId("lesson", "old-vectors", aliases)).toBe("vectors");
  });

  it("returns an unaliased id unchanged", () => {
    expect(resolveId("lesson", "vectors", aliases)).toBe("vectors");
    expect(resolveId("exercise", "vec-add-compute", aliases)).toBe("vec-add-compute");
  });

  it("detects alias cycles instead of looping forever", () => {
    const cyclic: Record<EntityKind, AliasMap> = {
      course: {},
      unit: {},
      lesson: { a: "b", b: "a" },
      exercise: {},
      concept: {},
    };
    expect(() => resolveId("lesson", "a", cyclic)).toThrow(/cycle/i);
  });
});

describe("uniqueness guard", () => {
  it("passes distinct ids and flags duplicates", () => {
    expect(() => assertUniqueIds("lesson", ["a", "b", "c"])).not.toThrow();
    expect(() => assertUniqueIds("lesson", ["a", "b", "a"])).toThrow(/duplicate/i);
  });
});

describe("migration runner (tested end to end, not per-migration idempotency)", () => {
  it("is a no-op when state is already at the current version", () => {
    const state: VersionedState = { schemaVersion: SCHEMA_VERSION, payload: 1 };
    expect(runMigrations(state)).toBe(state);
  });

  it("applies a synthetic chain from v0 to the target version", () => {
    // A non-idempotent chain on purpose: each step appends to a log. Correctness
    // is a property of the RUNNER applying each step exactly once in order.
    const registry: Record<number, Migration> = {
      1: (s) => ({ ...s, schemaVersion: 1, log: [...((s.log as number[]) ?? []), 1] }),
      2: (s) => ({ ...s, schemaVersion: 2, log: [...(s.log as number[]), 2] }),
      3: (s) => ({ ...s, schemaVersion: 3, log: [...(s.log as number[]), 3] }),
    };
    const out = runMigrations({ schemaVersion: 0, log: [] }, registry, 3);
    expect(out.schemaVersion).toBe(3);
    expect(out.log).toEqual([1, 2, 3]);
  });

  it("throws when a required migration step is missing", () => {
    const registry: Record<number, Migration> = {
      1: (s) => ({ ...s, schemaVersion: 1 }),
      // no migration to 2
    };
    expect(() =>
      runMigrations({ schemaVersion: 0 }, registry, 2),
    ).toThrow(/No migration registered to reach schema version 2/);
  });

  it("throws if a migration fails to advance the version", () => {
    const registry: Record<number, Migration> = {
      1: (s) => ({ ...s, schemaVersion: 0 }), // forgot to bump
    };
    expect(() => runMigrations({ schemaVersion: 0 }, registry, 1)).toThrow(
      /must set schemaVersion/,
    );
  });

  it("refuses to downgrade state newer than the app", () => {
    expect(() =>
      runMigrations({ schemaVersion: 5 }, {}, 1),
    ).toThrow(/newer than the app/);
  });
});
