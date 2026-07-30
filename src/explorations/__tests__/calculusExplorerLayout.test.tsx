import { describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { LimitsContinuityExplorer } from "../LimitsContinuityExplorer";
import { DerivativeLocalLinearityExplorer } from "../DerivativeLocalLinearityExplorer";
import { IntegralAccumulationExplorer } from "../IntegralAccumulationExplorer";
import { FundamentalTheoremExplorer } from "../FundamentalTheoremExplorer";
import {
  CALCULUS_FIXTURES,
  EX_ABS,
  numericDerivative,
  slopeAt,
} from "../../math";
import { zoomReadouts, zoomWindow } from "../LocalLinearityZoom";

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
  { name: "integral-accumulation", Component: IntegralAccumulationExplorer },
  { name: "fundamental-theorem", Component: FundamentalTheoremExplorer },
] as const;

/**
 * The two explorers whose primary control is a point on the curve. The other
 * two, `integral-accumulation` and `fundamental-theorem`, are driven by an
 * interval and a partition count, so they name their controls "Start a" /
 * "End b" instead and are exempt from this one check rather than being made
 * to fake a control they do not have.
 */
const POINT_EXPLORERS = EXPLORERS.filter(
  (e) => e.name !== "integral-accumulation" && e.name !== "fundamental-theorem",
);

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

  it("keeps the reset and the presets in the toolbar", () => {
    const { container } = render(<Component />);
    const toolbar = container.querySelector(".exploration-panel__toolbar");
    expect(toolbar).toBeTruthy();
    expect(toolbar!.textContent).toContain("Reset");
  });
});

describe.each(POINT_EXPLORERS)("$name explorer", ({ Component }) => {
  it("offers a labelled point control as well as the drag", () => {
    const { container } = render(<Component />);
    const labels = [...container.querySelectorAll("label")].map((l) =>
      l.textContent?.trim(),
    );
    expect(labels.some((l) => l?.startsWith("Point a"))).toBe(true);
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

describe("no fabricated derivative at a corner", () => {
  /**
   * `EX_ABS` at zero is the standing counterexample, and it was being handled
   * three different ways at once: the readout said the derivative did not exist,
   * `numericDerivative` returned 0, and that 0 was drawn as a tangent, offered as
   * a linear estimate, and printed as f′(0) in the derivative panel. The
   * discriminated `SlopeAt` makes the absence impossible to smuggle past.
   */
  it("still reports 0 from the raw symmetric quotient — the trap that caused it", () => {
    expect(numericDerivative(EX_ABS.f, 0)).toBeCloseTo(0, 9);
  });

  it("names the two one-sided slopes rather than a value", () => {
    const here = slopeAt(EX_ABS, 0);
    expect(here.kind).toBe("corner");
  });

  it("reports no linear estimate and no residual there", () => {
    const r = zoomReadouts(EX_ABS, 0, 0.1);
    expect(r.slope.kind).toBe("corner");
    expect(r.estimate).toBeNull();
    expect(r.residual).toBeNull();
    expect(r.residualRatio).toBeNull();
    // The secant IS still real — a chord needs no derivative to exist.
    expect(r.secantSlope).toBeCloseTo(1, 6);
  });

  it("still reports all of them one step away from the corner", () => {
    const r = zoomReadouts(EX_ABS, 1, 0.1);
    expect(r.slope.kind).toBe("differentiable");
    expect(r.estimate).not.toBeNull();
    expect(r.residual).not.toBeNull();
  });

  it("scales the zoom window by the one-sided slope, not by the average", () => {
    // The symmetric average is 0, which would have collapsed the window's
    // vertical extent and drawn the V as a flat line.
    const win = zoomWindow(EX_ABS, 0, 1, 1);
    expect(win.y[1] - win.y[0]).toBeGreaterThan(1);
  });

  it("says so on screen, and offers no f′(a) number", () => {
    const { container } = render(<DerivativeLocalLinearityExplorer />);
    // The explorer opens on `ex-parabola`; switch to |x|, whose focus point is
    // the corner.
    const button = [...container.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("|x|"),
    );
    expect(button).toBeTruthy();
    fireEvent.click(button!);

    const text = container.textContent ?? "";
    expect(text).toMatch(/does not exist/i);
    // …and it names the two slopes rather than leaving the learner with nothing.
    expect(text).toMatch(/one-sided slopes are\s*-1\s*and\s*1/i);
  });
});

describe("the running-total endpoint stays inside the interval", () => {
  it("clamps the readout and the marker to one shared value", () => {
    const { container } = render(<IntegralAccumulationExplorer />);
    // Open the running total, which is what introduces the second endpoint.
    const toggle = [...container.querySelectorAll("input[type=checkbox]")].find(
      (i) => (i as HTMLInputElement).labels?.[0]?.textContent?.includes("running total"),
    ) as HTMLInputElement | undefined;
    expect(toggle).toBeTruthy();
    fireEvent.click(toggle!);

    const slider = (label: string) =>
      [...container.querySelectorAll("input[type=range]")].find(
        (i) => (i as HTMLInputElement).labels?.[0]?.textContent?.startsWith(label),
      ) as HTMLInputElement;

    // `ex-drive` runs to 10, and the endpoint starts there. Pull `b` well back:
    // the endpoint must come with it rather than being read at a stale 10.
    fireEvent.change(slider("End b"), { target: { value: "4" } });
    expect(container.textContent).toContain("A(4)");
    expect(container.textContent).not.toContain("A(10)");
    expect(Number(slider("Right-hand end x").value)).toBeLessThanOrEqual(4);

    // And the other end: pushing `a` past the endpoint must not leave it behind.
    fireEvent.change(slider("Start a"), { target: { value: "3" } });
    const endpoint = Number(slider("Right-hand end x").value);
    expect(endpoint).toBeGreaterThanOrEqual(3);
    expect(endpoint).toBeLessThanOrEqual(4);
  });
});
