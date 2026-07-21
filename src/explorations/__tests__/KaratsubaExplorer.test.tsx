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
});
