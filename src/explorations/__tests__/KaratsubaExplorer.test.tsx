import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { KaratsubaExplorer } from "../KaratsubaExplorer";

describe("KaratsubaExplorer", () => {
  it("starts from the clean 12×13 example", () => {
    render(<KaratsubaExplorer />);
    expect(screen.getByTestId("karatsuba-product").textContent).toMatch(/12 × 13 = 156/);
    expect(screen.getByTestId("karatsuba-coeffs").textContent).toMatch(/z₂=1/);
    expect(screen.getByTestId("karatsuba-coeffs").textContent).toMatch(/z₁=5/);
    expect(screen.getByTestId("karatsuba-coeffs").textContent).toMatch(/z₀=6/);
    expect(screen.getByTestId("karatsuba-mult-count").textContent).toMatch(/3.*4/);
    expect(screen.getByTestId("badge-carrying").getAttribute("data-active")).toBe(
      "false",
    );
    expect(screen.getByTestId("badge-width").getAttribute("data-active")).toBe(
      "false",
    );
  });

  it("boundary preset lights both badges and shows product 4368", () => {
    render(<KaratsubaExplorer />);
    fireEvent.click(screen.getByRole("button", { name: /78 × 56/ }));
    expect(screen.getByTestId("karatsuba-product").textContent).toMatch(/78 × 56 = 4368/);
    expect(screen.getByTestId("badge-carrying").getAttribute("data-active")).toBe(
      "true",
    );
    expect(screen.getByTestId("badge-width").getAttribute("data-active")).toBe(
      "true",
    );
    expect(screen.getByTestId("karatsuba-carry").textContent).toMatch(/48→8/);
  });

  it("reset restores 12 × 13 and default toggles", () => {
    render(<KaratsubaExplorer />);
    fireEvent.click(screen.getByRole("button", { name: /78 × 56/ }));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByTestId("karatsuba-product").textContent).toMatch(/12 × 13 = 156/);
    expect(screen.getByTestId("badge-carrying").getAttribute("data-active")).toBe(
      "false",
    );
  });

  it("shows conceptual tree leaf counts when toggled", () => {
    render(<KaratsubaExplorer />);
    fireEvent.click(screen.getByLabelText(/Show recursion tree/i));
    expect(screen.getByTestId("tree-leaves-3").textContent).toMatch(/27/);
    expect(screen.getByTestId("tree-leaves-4").textContent).toMatch(/64/);
  });

  it("leaf-count captions track the drawn depth (= log2 n) for each n", () => {
    render(<KaratsubaExplorer />);
    fireEvent.click(screen.getByLabelText(/Show recursion tree/i));
    const nSelect = screen.getByLabelText("Digit length n");

    // The drawn tree depth equals log2(n), so caption leaf totals are branch^levels.
    for (const [n, leaves3, leaves4] of [
      [2, 3, 4],
      [4, 9, 16],
      [8, 27, 64],
    ] as const) {
      fireEvent.change(nSelect, { target: { value: String(n) } });
      const levels = Math.log2(n);
      expect(screen.getByTestId("tree-leaves-3").textContent).toContain(
        `Leaves at depth ${levels}: ${leaves3}`,
      );
      expect(screen.getByTestId("tree-leaves-4").textContent).toContain(
        `Leaves at depth ${levels}: ${leaves4}`,
      );
    }
  });

  it("removes the separate tree-depth control (single source of truth)", () => {
    render(<KaratsubaExplorer />);
    fireEvent.click(screen.getByLabelText(/Show recursion tree/i));
    expect(screen.queryByLabelText("Tree depth")).toBeNull();
  });

  it("labels the advanced toggle as a note, not a parabola drawing", () => {
    render(<KaratsubaExplorer />);
    const toggle = screen.getByLabelText(/quadratic-evaluation note/i);
    fireEvent.click(toggle);
    expect(screen.getByTestId("parabola-note").textContent).toMatch(/quadratic/i);
  });
});
