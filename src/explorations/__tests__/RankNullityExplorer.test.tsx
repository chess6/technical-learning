import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { RankNullityExplorer } from "../RankNullityExplorer";

/**
 * The explorer's job is the part of the law that square matrices cannot show:
 * the total is n whatever the shape, the ceiling is min(m, n), and some
 * combinations of verdicts are impossible for a given shape.
 */

describe("RankNullityExplorer", () => {
  it("starts on a wide map: onto, but never one-to-one", () => {
    render(<RankNullityExplorer />);
    expect(screen.getByTestId("rn-budget").textContent).toBe("3");
    expect(screen.getByTestId("rn-ceiling").textContent).toBe("2");
    expect(screen.getByTestId("rn-rank").textContent).toBe("2");
    expect(screen.getByTestId("rn-nullity").textContent).toBe("1");
    expect(screen.getByTestId("rn-total").textContent).toBe("2 + 1 = 3");
    expect(screen.getByTestId("rn-injective").textContent).toBe("No");
    expect(screen.getByTestId("rn-surjective").textContent).toBe("Yes");
  });

  it("keeps the total at n — never at m — across every shape", () => {
    render(<RankNullityExplorer />);
    const cases: readonly [string, string, string][] = [
      ["ℝ³ → ℝ² (onto)", "3", "2 + 1 = 3"],
      ["ℝ³ → ℝ² (rank 1)", "3", "1 + 2 = 3"],
      ["ℝ² → ℝ³ (one-to-one)", "2", "2 + 0 = 2"],
      ["ℝ³ → ℝ³ (both)", "3", "3 + 0 = 3"],
      ["ℝ³ → ℝ³ (neither)", "3", "2 + 1 = 3"],
    ];
    for (const [label, budget, total] of cases) {
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(screen.getByTestId("rn-budget").textContent, label).toBe(budget);
      expect(screen.getByTestId("rn-total").textContent, label).toBe(total);
    }
  });

  it("shows a tall map is one-to-one but cannot be onto", () => {
    render(<RankNullityExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "ℝ² → ℝ³ (one-to-one)" }));
    expect(screen.getByTestId("rn-injective").textContent).toBe("Yes");
    expect(screen.getByTestId("rn-surjective").textContent).toBe("No");
  });

  it("shows the two properties coinciding only for the square maps", () => {
    render(<RankNullityExplorer />);
    for (const label of ["ℝ³ → ℝ³ (both)", "ℝ³ → ℝ³ (neither)"]) {
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(
        screen.getByTestId("rn-injective").textContent,
        label,
      ).toBe(screen.getByTestId("rn-surjective").textContent);
    }
    // …and differing for both non-square shapes.
    for (const label of ["ℝ³ → ℝ² (onto)", "ℝ² → ℝ³ (one-to-one)"]) {
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(
        screen.getByTestId("rn-injective").textContent,
        label,
      ).not.toBe(screen.getByTestId("rn-surjective").textContent);
    }
  });

  it("justifies a verdict with the inequality that forced it, not a bare label", () => {
    render(<RankNullityExplorer />);
    fireEvent.click(screen.getByLabelText("Why?"));
    const reasons = screen.getByTestId("rn-reasons").textContent ?? "";
    // The wide map's failure is forced by the SHAPE, and the reason must say so.
    expect(reasons).toMatch(/n − m = 3 − 2 = 1 > 0/);
    expect(reasons).toMatch(/forced by the shape alone/);
  });

  it("names the ambient space of each side", () => {
    render(<RankNullityExplorer />);
    expect(screen.getByTestId("rn-shape").textContent).toMatch(/output space/);
    expect(screen.getByTestId("rn-shape").textContent).toMatch(/input space/);
  });

  it("reset returns to the wide map", () => {
    render(<RankNullityExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "ℝ³ → ℝ³ (both)" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByTestId("rn-total").textContent).toBe("2 + 1 = 3");
  });
});
