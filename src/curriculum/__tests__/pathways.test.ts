import { describe, expect, it } from "vitest";
import { PATHWAYS, pathwayNodes, getPathway, type Pathway } from "../pathways";
import { CURRICULUM_EDGES } from "../edges";
import { isKnownLessonId } from "../lessonRoster";

const key = (ref: { kind: string; id: string }) => `${ref.kind}:${ref.id}`;

describe("pathway data integrity", () => {
  it("has unique pathway ids that all resolve", () => {
    const ids = PATHWAYS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(getPathway(id)).toBeDefined();
  });

  it("names a goal and an audience for every pathway", () => {
    for (const p of PATHWAYS) {
      expect(p.goal.trim().length, `${p.id} goal`).toBeGreaterThan(0);
      expect(p.audience.trim().length, `${p.id} audience`).toBeGreaterThan(0);
      expect(p.requiredNodeIds.length, `${p.id} required`).toBeGreaterThan(0);
    }
  });

  it("resolves every node to a known lesson id", () => {
    const problems: string[] = [];
    for (const p of PATHWAYS) {
      for (const ref of pathwayNodes(p)) {
        if (!isKnownLessonId(ref.id)) {
          problems.push(`${p.id}: "${ref.id}" is not a known lesson id`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it("keeps required and optional disjoint, with no repeats inside either", () => {
    const problems: string[] = [];
    for (const p of PATHWAYS) {
      const required = p.requiredNodeIds.map(key);
      const optional = p.optionalNodeIds.map(key);
      const dupR = required.filter((k, i) => required.indexOf(k) !== i);
      const dupO = optional.filter((k, i) => optional.indexOf(k) !== i);
      if (dupR.length) problems.push(`${p.id}: duplicated in required — ${[...new Set(dupR)].join(", ")}`);
      if (dupO.length) problems.push(`${p.id}: duplicated in optional — ${[...new Set(dupO)].join(", ")}`);
      const both = required.filter((k) => optional.includes(k));
      if (both.length) {
        problems.push(
          `${p.id}: listed as BOTH required and optional — ${[...new Set(both)].join(", ")}. ` +
            `A node is either on the shortest route or it is not.`,
        );
      }
    }
    expect(problems).toEqual([]);
  });
});

/**
 * The check that gives a pathway its meaning: a pathway that requires a lesson
 * must also require everything that lesson hard-`requires`. Otherwise the
 * "shortest viable route" it advertises is not walkable — the learner arrives
 * at a lesson whose stated prerequisite was never on their route.
 *
 * Only `requires` counts here. `recommended-before` is explicitly soft, and
 * the advisory types (`same-structure-as`, `application-of`) do not gate.
 */
describe("pathway prerequisite closure", () => {
  const requiresEdges = CURRICULUM_EDGES.filter((e) => e.type === "requires");

  function unmetPrerequisites(pathway: Pathway): string[] {
    const required = new Set(pathway.requiredNodeIds.map((r) => r.id));
    const missing: string[] = [];
    for (const edge of requiresEdges) {
      if (required.has(edge.to.id) && !required.has(edge.from.id)) {
        missing.push(`${edge.to.id} requires ${edge.from.id}, which the pathway does not`);
      }
    }
    return [...new Set(missing)];
  }

  it("every required lesson's hard prerequisites are also required", () => {
    const problems = PATHWAYS.flatMap((p) =>
      unmetPrerequisites(p).map((m) => `  ${p.id}: ${m}`),
    );
    expect(
      problems,
      `A pathway advertises a shortest viable route, so it cannot require a ` +
        `lesson without requiring what that lesson needs:\n${problems.join("\n")}`,
    ).toEqual([]);
  });

  it("detects a pathway missing a prerequisite, and accepts a closed one", () => {
    // Proves the check bites rather than trivially passing.
    // `transformations` requires `vectors` (LA §2.1).
    const broken = {
      id: "x", title: "x", goal: "g", audience: "a",
      requiredNodeIds: [{ kind: "lesson", id: "transformations" }],
      optionalNodeIds: [],
    } as unknown as Pathway;
    const closed = {
      id: "x", title: "x", goal: "g", audience: "a",
      requiredNodeIds: [
        { kind: "lesson", id: "why-linear-algebra" },
        { kind: "lesson", id: "vectors" },
        { kind: "lesson", id: "transformations" },
      ],
      optionalNodeIds: [],
    } as unknown as Pathway;
    expect(unmetPrerequisites(broken).length).toBeGreaterThan(0);
    expect(unmetPrerequisites(closed)).toEqual([]);
  });
});
