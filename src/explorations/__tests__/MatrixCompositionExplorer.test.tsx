import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MatrixCompositionExplorer } from "../MatrixCompositionExplorer";

/**
 * The explorer's job is to keep one claim visibly true while the learner
 * changes things: column j of the composite is the FIRST map's column j pushed
 * through the SECOND map. These tests hold that claim, the order toggle, and
 * the singular case (which must report "no inverse", never a matrix of
 * Infinity).
 */

const setA = () => within(screen.getByRole("group", { name: "Set A" }));
const setB = () => within(screen.getByRole("group", { name: "Set B" }));

describe("MatrixCompositionExplorer", () => {
  it("starts on shear ∘ rotation, applying B first", () => {
    render(<MatrixCompositionExplorer />);
    // A = [[2,1],[0,1]], B = [[0,-1],[1,0]] ⇒ AB = [[1,-2],[1,0]].
    expect(
      screen.getByTestId("comp-product-readout").getAttribute("data-plain"),
    ).toBe("[[1, -2], [1, 0]]");
    expect(
      screen.getByTestId("comp-order-b-first").getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("reports the columns as the second map applied to the first map's columns", () => {
    render(<MatrixCompositionExplorer />);
    const columns = screen.getByTestId("comp-columns-readout").textContent ?? "";
    expect(columns).toMatch(/col₁ = A·col₁\(B\) = \(1, 1\)/);
    expect(columns).toMatch(/col₂ = A·col₂\(B\) = \(-2, 0\)/);
  });

  it("swapping the order changes the composite (AB ≠ BA)", () => {
    render(<MatrixCompositionExplorer />);
    fireEvent.click(screen.getByTestId("comp-order-a-first"));
    // Applying A first then B is BA = [[0,-1],[2,1]].
    expect(
      screen.getByTestId("comp-product-readout").getAttribute("data-plain"),
    ).toBe("[[0, -1], [2, 1]]");
    const columns = screen.getByTestId("comp-columns-readout").textContent ?? "";
    expect(columns).toMatch(/col₁ = B·col₁\(A\) = \(0, 2\)/);
  });

  it("a singular factor makes the whole composite singular, with no inverse shown", () => {
    render(<MatrixCompositionExplorer />);
    fireEvent.click(setB().getByRole("button", { name: "Collapse" }));
    expect(screen.getByTestId("comp-det").textContent).toBe("0");
    expect(screen.getByTestId("comp-invertible").textContent).toMatch(/No —/);

    fireEvent.click(screen.getByLabelText("Inverse of the composite"));
    const inverse = screen.getByTestId("comp-inverse-readout");
    // The critical assertion: a null inverse is REPORTED, not rendered as
    // Infinity or NaN entries.
    expect(inverse.getAttribute("data-plain")).toBe("none");
    expect(inverse.textContent).toMatch(/No inverse exists/);
  });

  it("shows the inverse of an invertible composite", () => {
    render(<MatrixCompositionExplorer />);
    fireEvent.click(screen.getByLabelText("Inverse of the composite"));
    // (AB)^-1 for AB = [[1,-2],[1,0]], det = 2 ⇒ [[0, 1], [-0.5, 0.5]].
    expect(
      screen.getByTestId("comp-inverse-readout").getAttribute("data-plain"),
    ).toBe("[[0, 1], [-0.5, 0.5]]");
  });

  it("keeps a near-singular composite invertible rather than calling it collapsed", () => {
    render(<MatrixCompositionExplorer />);
    fireEvent.click(setA().getByRole("button", { name: "Near-singular" }));
    fireEvent.click(setB().getByRole("button", { name: "Identity" }));
    expect(screen.getByTestId("comp-invertible").textContent).toMatch(/Yes/);
  });

  it("reset restores both matrices and the original order", () => {
    render(<MatrixCompositionExplorer />);
    fireEvent.click(setB().getByRole("button", { name: "Collapse" }));
    fireEvent.click(screen.getByTestId("comp-order-a-first"));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(
      screen.getByTestId("comp-product-readout").getAttribute("data-plain"),
    ).toBe("[[1, -2], [1, 0]]");
    expect(
      screen.getByTestId("comp-order-b-first").getAttribute("aria-pressed"),
    ).toBe("true");
  });
});
