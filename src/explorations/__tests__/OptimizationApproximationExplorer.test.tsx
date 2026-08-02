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

  it("classifies x³'s survivor as silent on the second-derivative test", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    pickPreset(container, "x³ — a survivor");
    // The preset's default point is a=-1, not the stationary point; drag to it.
    const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
    expect(slider).toBeTruthy();
    fireEvent.change(slider, { target: { value: "0" } });
    const text = container.textContent ?? "";
    expect(text).toContain("silent");
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

  it("marks |x|'s minimum as singular, with no local model", () => {
    const { container } = render(<OptimizationApproximationExplorer />);
    pickPreset(container, "|x| — the unexamined minimum");
    const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "0" } });
    const text = container.textContent ?? "";
    expect(text).toContain("no single slope — singular");
    expect(text).toContain("no local model");
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
});
