import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CONCEPTS } from "../concepts";
import { CURRICULUM_EDGES, type EdgeType, type NodeRef } from "../edges";
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

const conceptIds = new Set(CONCEPTS.map((c) => String(c.id)));

/**
 * Resolves a ref against the catalog its OWN `kind` names. Because the ref
 * carries its space, this is unambiguous even for the eight ids that name
 * both a concept and a lesson — the case a bare-string check could never
 * decide. The type layer already rejects a wrong-kind endpoint at compile
 * time; this is the matching runtime check that the id actually exists.
 */
function resolves(ref: NodeRef): boolean {
  return ref.kind === "concept" ? conceptIds.has(ref.id) : isKnownLessonId(ref.id);
}

/** Stable "kind:id" key — two nodes collide only within the same space. */
function nodeKey(ref: NodeRef): string {
  return `${ref.kind}:${ref.id}`;
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
  it("resolves every endpoint in the catalog its own ref kind names", () => {
    const problems: string[] = [];
    for (const edge of CURRICULUM_EDGES) {
      for (const [side, ref] of [
        ["from", edge.from],
        ["to", edge.to],
      ] as const) {
        if (!resolves(ref)) {
          problems.push(
            `${edge.type} edge ${nodeKey(edge.from)} -> ${nodeKey(edge.to)}: ` +
              `${side} "${ref.id}" is not a known ${ref.kind} id`,
          );
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it("has no self-loop edges", () => {
    const selfLoops = CURRICULUM_EDGES.filter(
      (edge) => nodeKey(edge.from) === nodeKey(edge.to),
    );
    expect(selfLoops).toEqual([]);
  });

  it("has no exact-duplicate edges (same from/to/type)", () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const edge of CURRICULUM_EDGES) {
      const key = `${edge.type}:${nodeKey(edge.from)}->${nodeKey(edge.to)}`;
      if (seen.has(key)) duplicates.push(key);
      seen.add(key);
    }
    expect(duplicates).toEqual([]);
  });
});

describe("curriculum DAG validation (requires + recommended-before)", () => {
  it("is acyclic — a topological sort exists", () => {
    const dagEdges = CURRICULUM_EDGES.filter((edge) => DAG_EDGE_TYPES.includes(edge.type));
    // Keyed by "kind:id" so the concept `elimination` and the lesson
    // `elimination` could never be conflated into one graph node.
    const nodes = new Set<string>();
    for (const edge of dagEdges) {
      nodes.add(nodeKey(edge.from));
      nodes.add(nodeKey(edge.to));
    }

    const adjacency = new Map<string, string[]>();
    for (const node of nodes) adjacency.set(node, []);
    for (const edge of dagEdges) adjacency.get(nodeKey(edge.from))!.push(nodeKey(edge.to));

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
