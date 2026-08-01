import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CONCEPTS } from "../concepts";
import { CURRICULUM_EDGES, type EdgeType } from "../edges";
import { LESSON_ROSTER, isKnownLessonId } from "../lessonRoster";
import { assertUniqueIds } from "../../platform/identity";

const EDGE_TYPES: readonly EdgeType[] = [
  "requires",
  "recommended-before",
  "refresher-for",
  "revisited-by",
  "same-structure-as",
  "application-of",
];

const DAG_EDGE_TYPES: readonly EdgeType[] = ["requires", "recommended-before"];

function isKnownNodeId(id: string): boolean {
  return CONCEPTS.some((c) => c.id === id) || isKnownLessonId(id);
}

describe("curriculum concept catalog", () => {
  it("has unique concept ids", () => {
    assertUniqueIds(
      "concept",
      CONCEPTS.map((c) => c.id),
    );
  });

  it("has unique lesson-roster ids", () => {
    const ids = LESSON_ROSTER.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("curriculum edge referential integrity", () => {
  it("resolves every edge endpoint to a known concept or lesson id", () => {
    const problems: string[] = [];
    for (const edge of CURRICULUM_EDGES) {
      if (!isKnownNodeId(edge.from)) {
        problems.push(`${edge.type} edge "${edge.from}" -> "${edge.to}": "${edge.from}" is not a known concept or lesson id`);
      }
      if (!isKnownNodeId(edge.to)) {
        problems.push(`${edge.type} edge "${edge.from}" -> "${edge.to}": "${edge.to}" is not a known concept or lesson id`);
      }
    }
    expect(problems).toEqual([]);
  });

  it("has no self-loop edges", () => {
    const selfLoops = CURRICULUM_EDGES.filter((edge) => edge.from === edge.to);
    expect(selfLoops).toEqual([]);
  });

  it("has no exact-duplicate edges (same from/to/type)", () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const edge of CURRICULUM_EDGES) {
      const key = `${edge.type}:${edge.from}->${edge.to}`;
      if (seen.has(key)) duplicates.push(key);
      seen.add(key);
    }
    expect(duplicates).toEqual([]);
  });
});

describe("curriculum DAG validation (requires + recommended-before)", () => {
  it("is acyclic — a topological sort exists", () => {
    const dagEdges = CURRICULUM_EDGES.filter((edge) => DAG_EDGE_TYPES.includes(edge.type));
    const nodes = new Set<string>();
    for (const edge of dagEdges) {
      nodes.add(edge.from);
      nodes.add(edge.to);
    }

    const adjacency = new Map<string, string[]>();
    for (const node of nodes) adjacency.set(node, []);
    for (const edge of dagEdges) adjacency.get(edge.from)!.push(edge.to);

    const WHITE = 0;
    const GRAY = 1;
    const BLACK = 2;
    const color = new Map<string, number>();
    for (const node of nodes) color.set(node, WHITE);
    const cyclePath: string[] = [];

    function visit(node: string): boolean {
      color.set(node, GRAY);
      cyclePath.push(node);
      for (const next of adjacency.get(node) ?? []) {
        if (color.get(next) === GRAY) {
          cyclePath.push(next);
          return true;
        }
        if (color.get(next) === WHITE && visit(next)) return true;
      }
      cyclePath.pop();
      color.set(node, BLACK);
      return false;
    }

    for (const node of nodes) {
      if (color.get(node) === WHITE && visit(node)) {
        throw new Error(`Cycle detected in requires/recommended-before graph: ${cyclePath.join(" -> ")}`);
      }
    }
  });
});

describe("curriculum edge-type consumers (ADR-005's no-decoration rule)", () => {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const srcRoot = path.resolve(dirname, "../..");

  function collectSourceFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "__tests__" || entry.name === "curriculum") continue;
        files.push(...collectSourceFiles(full));
      } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name)) {
        files.push(full);
      }
    }
    return files;
  }

  const nonTestNonCurriculumSources = collectSourceFiles(srcRoot).map((file) =>
    fs.readFileSync(file, "utf8"),
  );

  it("is read by at least one non-test, non-curriculum module for every EdgeType", () => {
    const unconsumed = EDGE_TYPES.filter(
      (type) => !nonTestNonCurriculumSources.some((content) => content.includes(`"${type}"`)),
    );
    expect(unconsumed).toEqual([]);
  });
});
