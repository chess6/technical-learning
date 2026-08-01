import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { getBlockComponent, renderBlockComponent } from "../blockComponents";

/**
 * The `composed` block escape hatch (ADR-004) is deliberately constrained: a
 * registered component must carry its own tests and its own accessible label
 * — the same bar the `custom` exercise-capability escape hatch meets —
 * otherwise it re-fragments the design the way an unconstrained per-lesson
 * block shell would.
 *
 * There is deliberately no public "list all ids" export (mirroring
 * `lessonVisuals.tsx` / `explorations/registry.tsx`, neither of which expose
 * one either) — an id a lesson references is proven to resolve via
 * `contentValidation.test.ts`'s route-target check instead. Each registered
 * component additionally has its OWN dedicated test file asserting its
 * content (e.g. `KaratsubaThreeEvaluationsLab.test.tsx`); this file's job is
 * the shared lookup contract every entry must meet.
 */
describe("blockComponents registry", () => {
  it("getBlockComponent returns undefined for an unregistered id", () => {
    expect(getBlockComponent("nonexistent-component-id")).toBeUndefined();
  });

  it("renderBlockComponent returns null for an unregistered id, never throws", () => {
    expect(renderBlockComponent("nonexistent-component-id")).toBeNull();
    expect(renderBlockComponent("nonexistent-component-id", { foo: "bar" })).toBeNull();
  });

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
