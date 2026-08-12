import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BLOCK_COMPONENT_IDS, getBlockComponent, renderBlockComponent } from "../blockComponents";

/**
 * The `composed` block escape hatch (ADR-004) is deliberately constrained: a
 * registered component must carry its own tests and its own accessible label
 * — the same bar the `custom` exercise-capability escape hatch meets —
 * otherwise it re-fragments the design the way an unconstrained per-lesson
 * block shell would.
 *
 * The label half of that bar is checked GENERICALLY here, over
 * `BLOCK_COMPONENT_IDS`, so a second registered entry is held to it without
 * anyone remembering to add a case. That enumeration was added after review
 * found `blockComponents.tsx` claiming this file "asserts every registered id
 * here has both" while it only checked the one id hardcoded below — the
 * repository's recurring defect class (a comment asserting more than the code
 * does), and the reason to prefer a mechanism over a promise.
 *
 * That an id a lesson REFERENCES resolves is proven separately, by
 * `contentValidation.test.ts`'s route-target check. Each registered component
 * additionally has its OWN dedicated test file asserting its content (e.g.
 * `KaratsubaThreeEvaluationsLab.test.tsx`) — a test cannot check that another
 * test exists, so that half stays a review obligation.
 */
describe("blockComponents registry", () => {
  it("getBlockComponent returns undefined for an unregistered id", () => {
    expect(getBlockComponent("nonexistent-component-id")).toBeUndefined();
  });

  it("renderBlockComponent returns null for an unregistered id, never throws", () => {
    expect(renderBlockComponent("nonexistent-component-id")).toBeNull();
    expect(renderBlockComponent("nonexistent-component-id", { foo: "bar" })).toBeNull();
  });

  it("registers at least one component — otherwise the generic bar below is vacuous", () => {
    expect(BLOCK_COMPONENT_IDS.length).toBeGreaterThan(0);
  });

  it.each(BLOCK_COMPONENT_IDS)(
    "every registered component renders its own accessible label: %s",
    async (componentId) => {
      const node = renderBlockComponent(componentId);
      expect(node).not.toBeNull();
      render(node);
      // `findAllByRole` waits out the lazy import; an entry that renders no
      // labelled region — or renders one with an empty name — fails here.
      const regions = await screen.findAllByRole("region", undefined, { timeout: 5_000 });
      const named = regions.filter((r) => (r.getAttribute("aria-label") ?? "").trim().length > 0);
      expect(named.length, `"${componentId}" renders no region with an accessible name`).toBeGreaterThan(0);
    },
  );

  it("resolves the registered karatsuba-three-evaluations component with an accessible label", async () => {
    expect(getBlockComponent("karatsuba-three-evaluations")).toBeDefined();
    const node = renderBlockComponent("karatsuba-three-evaluations");
    expect(node).not.toBeNull();
    render(node);
    expect(
      await screen.findByRole("region", { name: "Three evaluations of a quadratic" }),
    ).toBeTruthy();
  });
});
