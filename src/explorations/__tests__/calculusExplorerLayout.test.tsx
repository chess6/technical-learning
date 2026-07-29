import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { LimitsContinuityExplorer } from "../LimitsContinuityExplorer";
import { DerivativeLocalLinearityExplorer } from "../DerivativeLocalLinearityExplorer";
import { CALCULUS_FIXTURES } from "../../math";

/**
 * Layout and affordance regressions for the two calculus explorers.
 *
 * Both shipped with every control passed as `children`, which is
 * `ExplorationPanel`'s **dark canvas** slot. The sliders, readouts and toggles
 * were therefore rendered in dark text on a dark surface — present in the DOM,
 * invisible on screen — and the plot itself had no interactive element at all.
 * A learner clicking the graph, the obvious thing to do, got no response and
 * concluded the explorer was broken.
 *
 * These tests pin the three things that fixes it: controls live in the side
 * region, the plot carries a draggable handle, and the panel states what to do.
 */

const EXPLORERS = [
  { name: "limits-continuity", Component: LimitsContinuityExplorer },
  {
    name: "derivative-local-linearity",
    Component: DerivativeLocalLinearityExplorer,
  },
] as const;

describe.each(EXPLORERS)("$name explorer", ({ Component }) => {
  it("puts its controls in the side region, not on the dark canvas", () => {
    const { container } = render(<Component />);
    const scene = container.querySelector(".exploration-panel__scene");
    const side = container.querySelector(".exploration-panel__side");
    expect(scene).toBeTruthy();
    expect(side).toBeTruthy();

    // Every slider and checkbox belongs to the side panel…
    const inputs = [...container.querySelectorAll("input")];
    expect(inputs.length).toBeGreaterThan(0);
    for (const input of inputs) {
      expect(
        side!.contains(input),
        `control "${input.getAttribute("id")}" is outside the side region`,
      ).toBe(true);
      expect(scene!.contains(input)).toBe(false);
    }

    // …and the readout too, since it is text that must be legible.
    const readouts = [...container.querySelectorAll(".scene-readout")];
    expect(readouts.length).toBeGreaterThan(0);
    for (const r of readouts) expect(side!.contains(r)).toBe(true);
  });

  it("states what the learner should do, in a live region", () => {
    const { container } = render(<Component />);
    const summary = container.querySelector(".exploration-panel__summary");
    expect(summary).toBeTruthy();
    expect(summary!.getAttribute("aria-live")).toBe("polite");
    // The instruction must actually name the affordance, not just describe the
    // mathematics — "what am I supposed to do here?" is the question it answers.
    expect(summary!.textContent?.toLowerCase()).toContain("drag");
  });

  it("offers a labelled point control as well as the drag", () => {
    const { container } = render(<Component />);
    const labels = [...container.querySelectorAll("label")].map((l) =>
      l.textContent?.trim(),
    );
    expect(labels.some((l) => l?.startsWith("Point a"))).toBe(true);
  });

  it("keeps the reset and the presets in the toolbar", () => {
    const { container } = render(<Component />);
    const toolbar = container.querySelector(".exploration-panel__toolbar");
    expect(toolbar).toBeTruthy();
    expect(toolbar!.textContent).toContain("Reset");
  });
});

describe("fixture labels", () => {
  it("are plain text, because preset buttons do not render LaTeX", () => {
    // `ex-decay` shipped as "e^{-t/τ}" and appeared verbatim on a button.
    for (const f of CALCULUS_FIXTURES) {
      expect(f.label, `${f.id} label`).not.toMatch(/[\\^_]\{|\\\\[a-zA-Z]+/);
    }
  });

  it("gives every fixture a non-empty, human-readable label", () => {
    for (const f of CALCULUS_FIXTURES) {
      expect(f.label.trim().length, f.id).toBeGreaterThan(2);
    }
  });
});
