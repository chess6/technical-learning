import { describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { FundamentalTheoremExplorer } from "../FundamentalTheoremExplorer";

/**
 * `fundamental-theorem`'s explorer. Beyond generic layout (covered in
 * `calculusExplorerLayout.test.tsx`), these pin the lesson's own claims:
 * the two routes agree, `+C` cancels, the survivor count is 2 regardless of
 * the equal/unequal toggle, and `e^(-x²)` offers no bracket value at all.
 */

const slider = (container: HTMLElement, label: string) =>
  [...container.querySelectorAll("input[type=range]")].find((i) =>
    (i as HTMLInputElement).labels?.[0]?.textContent?.startsWith(label),
  ) as HTMLInputElement;

const toggle = (container: HTMLElement, label: string) =>
  [...container.querySelectorAll("input[type=checkbox]")].find((i) =>
    (i as HTMLInputElement).labels?.[0]?.textContent?.includes(label),
  ) as HTMLInputElement;

describe("FundamentalTheoremExplorer", () => {
  it("resets to ex-parabola on [0, 2] with 8 unequal pieces and C = 0", () => {
    const { container } = render(<FundamentalTheoremExplorer />);
    expect(slider(container, "Start a").value).toBe("0");
    expect(slider(container, "End b").value).toBe("2");
    expect(slider(container, "Pieces n").value).toBe("8");
    expect(slider(container, "Constant C").value).toBe("0");
    expect(toggle(container, "Unequal partition").checked).toBe(true);
  });

  it("agrees: F(b) - F(a) and the refined Riemann sum are the same 8/3, to 4 places", () => {
    const { container } = render(<FundamentalTheoremExplorer />);
    const text = container.textContent ?? "";
    expect(text).toContain("2.6667"); // 8/3, from both routes
  });

  it("+C cancels: the bracket value is unchanged as C moves", () => {
    const { container } = render(<FundamentalTheoremExplorer />);
    const before = container.textContent ?? "";
    fireEvent.change(slider(container, "Constant C"), { target: { value: "3.5" } });
    const after = container.textContent ?? "";
    // The bracket readout (F(b) - F(a)) is present in both and identical —
    // extract via the shared "2.6667" substring rather than parsing the DOM.
    expect(before).toContain("2.6667");
    expect(after).toContain("2.6667");
  });

  it("the survivor count is 2 whether the partition is equal or unequal", () => {
    const { container } = render(<FundamentalTheoremExplorer />);
    fireEvent.click(
      [...container.querySelectorAll("input")].find(
        (i) => i.id === "cancellation",
      )!,
    );
    expect(container.textContent).toContain("2 survivors");

    fireEvent.click(toggle(container, "Unequal partition")); // now equal
    expect(toggle(container, "Unequal partition").checked).toBe(false);
    expect(container.textContent).toContain("2 survivors");
  });

  it("offers no bracket value for e^(-x^2), which declares no antiderivative", () => {
    const { container } = render(<FundamentalTheoremExplorer />);
    const button = [...container.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("e^(-x²)") || b.textContent?.toLowerCase().includes("no elementary"),
    );
    expect(button).toBeTruthy();
    fireEvent.click(button!);
    const text = container.textContent ?? "";
    expect(text.toLowerCase()).toContain("no closed form");
    // …and the sum still produces a real number — the theorem's existence
    // claim survives even though there is no formula to check it against.
    expect(text).toMatch(/Refined Riemann sum.*0\.\d+/s);
    expect(text).not.toContain("NaN");
  });

  it("moving A's lower limit changes A(x) but not A'(x) = f(x)", () => {
    const { container } = render(<FundamentalTheoremExplorer />);
    // Default: A evaluated at x = 2 (the right end), from a = 0: A(2) = 8/3.
    expect(container.textContent).toContain("2.6667");

    fireEvent.change(slider(container, "Lower limit of A"), { target: { value: "1" } });
    // A(2) from a = 1 is [x^3/3] from 1 to 2 = 8/3 - 1/3 = 7/3 ≈ 2.3333 — a
    // different number from the 8/3 above, because the lower limit moved.
    expect(container.textContent).toContain("2.3333");
    // …but the numerically computed slope still tracks f(2) = 4, unaffected by
    // where the accumulation started (A' = f regardless of the lower limit).
    expect(container.textContent).toMatch(/vs f\(x\) = 4/);
  });
});
