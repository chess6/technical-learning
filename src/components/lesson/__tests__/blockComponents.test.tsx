import { describe, expect, it } from "vitest";
import { getBlockComponent, renderBlockComponent } from "../blockComponents";

/**
 * The `composed` block escape hatch (ADR-004) is deliberately constrained: a
 * registered component must carry its own tests and its own accessible label
 * — the same bar the `custom` exercise-capability escape hatch meets —
 * otherwise it re-fragments the design the way an unconstrained per-lesson
 * block shell would.
 *
 * The registry (`LAZY_BLOCK_COMPONENTS`) is empty in this package (R1); no
 * lesson yet authors a `composed` block. There is deliberately no public
 * "list all ids" export (mirroring `lessonVisuals.tsx` / `explorations/
 * registry.tsx`, neither of which expose one either) — an id a lesson
 * references is proven to resolve via `contentValidation.test.ts`'s route-
 * target check instead. This suite exercises the lookup contract itself; the
 * first real entry (the Karatsuba recurrence-tree lab, package R2) must add
 * its OWN test asserting an accessible label, alongside this file's contract
 * tests — not replace them.
 */
describe("blockComponents registry", () => {
  it("getBlockComponent returns undefined for an unregistered id", () => {
    expect(getBlockComponent("nonexistent-component-id")).toBeUndefined();
  });

  it("renderBlockComponent returns null for an unregistered id, never throws", () => {
    expect(renderBlockComponent("nonexistent-component-id")).toBeNull();
    expect(renderBlockComponent("nonexistent-component-id", { foo: "bar" })).toBeNull();
  });
});
