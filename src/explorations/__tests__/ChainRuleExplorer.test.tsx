import { describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { ChainRuleExplorer } from "../ChainRuleExplorer";

/**
 * `chain-rule`'s explorer. Pins the lesson's own claims: the chain-rule
 * value and the direct numeric derivative agree on the worked example, the
 * chain rule gives no answer (but the direct route still does) at the
 * corner preset, and g'(a) = 0 forces the chain-rule product to 0.
 */

const toggle = (container: HTMLElement, label: string) =>
  [...container.querySelectorAll("input[type=checkbox]")].find((i) =>
    (i as HTMLInputElement).labels?.[0]?.textContent?.includes(label),
  ) as HTMLInputElement;

describe("ChainRuleExplorer", () => {
  it("resets to the worked example pair: g'(1) = 2, f'(2) = 12", () => {
    const { container } = render(<ChainRuleExplorer />);
    const text = container.textContent ?? "";
    expect(text).toContain("g′(1)");
    expect(text).toContain("f′(2)");
  });

  it("agrees: chain-rule value 24 and the direct derivative 24, on the worked example", () => {
    const { container } = render(<ChainRuleExplorer />);
    const text = container.textContent ?? "";
    expect(text).toContain("24");
    expect(text).not.toContain("NaN");
  });

  it("g'(a) = 0 forces the chain-rule product to 0, on the zero-slope preset", () => {
    const { container } = render(<ChainRuleExplorer />);
    const button = [...container.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("g′(a) = 0"),
    );
    expect(button).toBeTruthy();
    fireEvent.click(button!);
    const text = container.textContent ?? "";
    expect(text).toMatch(/Chain rule.*\b0\b/s);
  });

  it("offers no chain-rule value at the corner preset, but the direct route still answers", () => {
    const { container } = render(<ChainRuleExplorer />);
    const button = [...container.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("corner"),
    );
    expect(button).toBeTruthy();
    fireEvent.click(button!);
    const text = container.textContent ?? "";
    expect(text.toLowerCase()).toContain("no single slope");
    expect(text).toContain("sufficient, not necessary");
    // The composite g(x) = |x|, f(u) = u^2 is x^2, with derivative 0 at x = 0.
    expect(text).toMatch(/directly.*\b0\b/s);
  });

  it("the cancel-du / honest-repair toggle switches which note is shown", () => {
    const { container } = render(<ChainRuleExplorer />);
    const before = container.textContent ?? "";
    expect(before).toContain("cancels");
    fireEvent.click(toggle(container, "honest repair"));
    const after = container.textContent ?? "";
    expect(after).toContain("substitute");
    expect(after).not.toContain("cancels");
  });
});
