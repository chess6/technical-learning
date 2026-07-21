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

  it("labels weighted regions as 100·AC, 10·AD, 10·BC, BD (not bare numeric values)", () => {
    render(<KaratsubaExplorer />);
    const weighted = screen.getByRole("img", {
      name: /Weighted multiplication rectangle/i,
    });
    const name = weighted.getAttribute("aria-label") ?? "";
    expect(name).toMatch(/100 AC/);
    expect(name).toMatch(/10 AD/);
    expect(name).toMatch(/10 BC/);
    expect(name).toMatch(/\bBD\b/);
  });

  it("labels all four regions inside the auxiliary coefficient rectangle", () => {
    render(<KaratsubaExplorer />);
    // Visible Mafs <Text> labels don't render in jsdom, so the labeled regions
    // are also encoded in the accessible name (browsers show the glyphs).
    const aux = screen.getByRole("img", {
      name: /Auxiliary coefficient rectangle/i,
    });
    const name = aux.getAttribute("aria-label") ?? "";
    for (const label of ["AC", "AD", "BC", "BD"]) {
      expect(name).toContain(label);
    }
  });

  it("peel toggle isolates z₁ = AD+BC = (A+B)(C+D) − AC − BD", () => {
    render(<KaratsubaExplorer />);
    // Off by default.
    expect(screen.getByTestId("karatsuba-peel").textContent).toMatch(/off/i);
    fireEvent.click(screen.getByLabelText(/Peel off AC and BD/i));
    const peel = screen.getByTestId("karatsuba-peel").textContent ?? "";
    // Names the removed corners (AC, BD) and the remaining opposite pair (AD, BC).
    expect(peel).toMatch(/AC/);
    expect(peel).toMatch(/BD/);
    expect(peel).toMatch(/AD \+ BC/);
    // Clean example: z₁ = 12 − 1 − 6 = 5.
    expect(peel).toMatch(/12 − 1 − 6 = 5/);
  });

  it("shows normalized blocks in human reading order (high→low) and labels the internal order", () => {
    render(<KaratsubaExplorer />);
    fireEvent.click(screen.getByRole("button", { name: /78 × 56/ }));
    const normalized = screen.getByTestId("karatsuba-normalized").textContent ?? "";
    expect(normalized).toMatch(/reading order \(high→low\): 43, 6, 8/);
    // Internal least-significant-first array is still surfaced, clearly labeled.
    expect(normalized).toMatch(/low→high: \[8, 6, 43\]/);
  });

  it("labels the tree depth as the total recurrence depth = log2 n", () => {
    render(<KaratsubaExplorer />);
    fireEvent.click(screen.getByLabelText(/Show recursion tree/i));
    const note = screen.getByTestId("tree-depth-note").textContent ?? "";
    expect(note).toMatch(/total recurrence depth/i);
    expect(note).toMatch(/log₂ n = 3/);
  });
});
