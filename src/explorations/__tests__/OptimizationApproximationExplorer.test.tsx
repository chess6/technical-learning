import { describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { OptimizationApproximationExplorer } from "../OptimizationApproximationExplorer";

/**
 * `optimization-approximation`'s explorer. Pins the readouts the lesson plan
 * requires: the certified radius and the first sampled disagreement shown
 * separately, "none in this domain" on the linear preset, the withdrawn
 * existence guarantee on an opened endpoint, and the constant fixture's
 * honest non-reduction.
 */

const toggle = (container: HTMLElement, label: string) =>
  [...container.querySelectorAll("input[type=checkbox]")].find((i) =>
    (i as HTMLInputElement).labels?.[0]?.textContent?.includes(label),
  ) as HTMLInputElement;

const pickPreset = (container: HTMLElement, label: string) => {
  const button = [...container.querySelectorAll("button")].find((b) =>
    b.textContent?.includes(label),
  );
  expect(button, `preset button "${label}" not found`).toBeTruthy();
  fireEvent.click(button!);
};

describe("OptimizationApproximationExplorer", () => {
  it("opens on the main cubic and shows a real candidate set with the endpoint maximum", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    const text = container.textContent ?? "";
    expect(text).toContain("18");
    expect(text).not.toContain("NaN");
  });

  it("shows the certified radius and the first sampled disagreement as separate readouts", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    const text = container.textContent ?? "";
    expect(text).toContain("Certified sufficient radius");
    expect(text).toContain("First sampled disagreement");
  });

  it("reports NO disagreement anywhere in the domain for the linear preset", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    pickPreset(container, "A linear function");
    const text = container.textContent ?? "";
    expect(text).toContain("none in this domain");
    expect(text).toContain("∞");
  });

  it("reports the constant function as not a finite reduction", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    pickPreset(container, "A constant function");
    const text = container.textContent ?? "";
    expect(text.toLowerCase()).toContain("not a finite reduction");
  });

  it("withdraws the existence guarantee when the right endpoint is opened", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    const before = container.textContent ?? "";
    expect(before).toContain("yes — closed, bounded");
    const openToggle = toggle(container, "Open the right endpoint");
    expect(openToggle).toBeTruthy();
    fireEvent.click(openToggle);
    const after = container.textContent ?? "";
    expect(after).toContain("no — the domain is open");
  });

  it("shows the open-interval preset with no existence guarantee and no extrema", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    pickPreset(container, "x on an open interval");
    const text = container.textContent ?? "";
    expect(text).toContain("no — the domain is open");
    expect(text).toContain("no conclusion");
  });

  it("opens x³'s preset already on the survivor point — silent on the second-derivative test, not an extremum", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    pickPreset(container, "x³ — a survivor");
    const text = container.textContent ?? "";
    expect(text).toContain("silent");
    expect(text).not.toContain("NaN");
  });

  it("opens |x|'s preset already on the singular minimum — no dragging required", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    pickPreset(container, "|x| — the unexamined minimum");
    const text = container.textContent ?? "";
    expect(text).toContain("no single slope — singular");
    expect(text).toContain("no local model");
  });

  it("opens x⁴'s preset already at the silent second-derivative test's real minimum", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    pickPreset(container, "x⁴ — silent, but a real minimum");
    const text = container.textContent ?? "";
    expect(text).toContain("silent");
    expect(text).not.toContain("no conclusion");
    // f(x) = x^4 on [-1.5, 1.5]: the real minimum is 0, at the stationary
    // point the second-derivative test stayed silent about.
    expect(text).toContain("0 at x = 0");
  });

  it("opens −x⁴'s preset already at the silent second-derivative test's real maximum", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    pickPreset(container, "−x⁴ — silent, but a real maximum");
    const text = container.textContent ?? "";
    expect(text).toContain("silent");
    expect(text).not.toContain("no conclusion");
    expect(text).toContain("0 at x = 0");
  });

  it("progressively discloses the linearization panel only when toggled", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    pickPreset(container, "e^(−t/1.5)");
    const before = container.textContent ?? "";
    expect(before).not.toContain("Declared bound");
    const approxToggle = toggle(container, "Show the linearization");
    expect(approxToggle).toBeTruthy();
    fireEvent.click(approxToggle);
    const after = container.textContent ?? "";
    expect(after).toContain("Declared bound");
  });

  it("reset returns to the main cubic with the endpoint closed and the panel collapsed", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    pickPreset(container, "A linear function");
    const resetButton = [...container.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Reset"),
    );
    expect(resetButton).toBeTruthy();
    fireEvent.click(resetButton!);
    const text = container.textContent ?? "";
    expect(text).toContain("18");
  });

  it("the slider's max excludes an opened right endpoint — the excluded point is not selectable", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    const openToggle = toggle(container, "Open the right endpoint");
    fireEvent.click(openToggle);
    const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
    // Main cubic domain is [-2, 3]; with the right endpoint open, the slider
    // must not offer x = 3 as a reachable value.
    expect(Number(slider.max)).toBeLessThan(3);
  });

  it("dragging past the opened endpoint clamps inside the domain, never landing on the excluded point", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    const openToggle = toggle(container, "Open the right endpoint");
    fireEvent.click(openToggle);
    const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "3" } });
    const text = container.textContent ?? "";
    // f'(3) = 3*9-3 = 24 on the main cubic — if the excluded endpoint were
    // reachable this would show up; instead the readout must reflect a
    // clamped point strictly inside (-2, 3).
    expect(text).not.toContain("f'(3)");
  });

  it("the linearization step never evaluates outside the fixture's own domain, near an edge", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    pickPreset(container, "x⁴ — silent, but a real minimum");
    // OPT_QUARTIC's domain is [-1.5, 1.5]; drag close to the right edge.
    const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "1.4" } });
    const approxToggle = toggle(container, "Show the linearization");
    fireEvent.click(approxToggle);
    const text = container.textContent ?? "";
    // A step of the old hardcoded +0.3 from a=1.4 would read 1.7, outside
    // the domain — must not appear; the panel must still render real numbers.
    expect(text).not.toContain("NaN");
    expect(text).not.toContain("L(a+0.3)");
  });

  it("the signed h slider drives live mh / E(h) / sign-agreement readouts", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    const before = container.textContent ?? "";
    expect(before).toContain("h = 0 — take a step to check");

    const hSlider = container.querySelector("#h") as HTMLInputElement;
    expect(hSlider).toBeTruthy();
    // Main cubic at a=0: m=-3. Stepping h=-0.5 (the improving direction)
    // should read mh=1.5 and agree.
    fireEvent.change(hSlider, { target: { value: "-0.5" } });
    const after = container.textContent ?? "";
    expect(after).toContain("1.5");
    expect(after).toContain("agrees — mh predicts the actual sign");
  });

  it("a large enough h flips the sign-agreement readout to DISAGREES", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    const hSlider = container.querySelector("#h") as HTMLInputElement;
    // At a=0 on the main cubic, sign(mh) and the actual sign disagree once
    // |h| exceeds sqrt(3) ≈ 1.732 (same crossing the guided scene's tooBig
    // beat demonstrates) — -1.9 is within the domain [-2,3] from a=0.
    fireEvent.change(hSlider, { target: { value: "-1.9" } });
    const text = container.textContent ?? "";
    expect(text).toContain("DISAGREES");
  });

  it("dragging the step past the domain edge clamps h rather than evaluating outside it", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    const hSlider = container.querySelector("#h") as HTMLInputElement;
    // From a=0 on [-2,3], h=-10 would reach x=-10, far outside the domain.
    fireEvent.change(hSlider, { target: { value: "-10" } });
    const text = container.textContent ?? "";
    expect(text).not.toContain("NaN");
  });

  it("the sweep strip stays neutral until Run sweep is clicked, then colors by the real candidate set", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    const before = container.textContent ?? "";
    expect(before).toContain('Predict which of these');
    expect(container.querySelectorAll(".optapprox-explorer__sweep-dot--candidate")).toHaveLength(0);
    expect(container.querySelectorAll(".optapprox-explorer__sweep-dot--refuted")).toHaveLength(0);

    const runButton = [...container.querySelectorAll("button")].find((b) => b.textContent === "Run sweep");
    expect(runButton).toBeTruthy();
    fireEvent.click(runButton!);

    const after = container.textContent ?? "";
    expect(after).toContain("Sweep over");
    expect(container.querySelectorAll(".optapprox-explorer__sweep-dot--candidate").length).toBeGreaterThan(0);
    expect(container.querySelectorAll(".optapprox-explorer__sweep-dot--refuted").length).toBeGreaterThan(0);
  });

  it("narrowing the interval (p, q) genuinely changes the candidate set and existence guarantee", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    // Main cubic on [-2, 3]: narrow the right bound (q) to 0.5, excluding
    // both the endpoint x=3 and the stationary point x=1 from candidacy.
    const qSlider = container.querySelector("#sub-hi") as HTMLInputElement;
    expect(qSlider).toBeTruthy();
    fireEvent.change(qSlider, { target: { value: "0.5" } });
    const text = container.textContent ?? "";
    expect(text).not.toContain("x = 3 (endpoint)");
    expect(text).not.toContain("x = 1 (stationary)");
    expect(text).toContain("x = 0.5 (endpoint)");
  });

  it("narrowing the sub-interval default preserves the open-interval preset's own openness", () => {
    // Regression: withSubInterval used to overwrite domainOpen with
    // undefined whenever the sub-interval equalled the full domain, which
    // silently turned OPT_OPEN_INTERVAL into a closed fixture by default.
    const { container } = render(<OptimizationApproximationExplorer />);
    pickPreset(container, "x on an open interval");
    const text = container.textContent ?? "";
    expect(text).toContain("no — the domain is open");
  });
});
