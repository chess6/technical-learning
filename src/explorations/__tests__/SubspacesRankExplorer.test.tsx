import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SubspacesRankExplorer } from "../SubspacesRankExplorer";

/**
 * The explorer exists to make ONE thing felt: as the rank falls, the null space
 * grows by exactly as much. These tests hold that coupling, plus the two
 * misconceptions the readout is designed to contradict (the bases' ambient
 * spaces, and where the column-space basis comes from).
 */

describe("SubspacesRankExplorer", () => {
  it("starts on the rank-2 map with a flattened image", () => {
    render(<SubspacesRankExplorer />);
    expect(screen.getByTestId("subspace-rank").textContent).toBe("2");
    expect(screen.getByTestId("subspace-nullity").textContent).toBe("1");
    expect(screen.getByTestId("subspace-shape").textContent).toBe("plane");
    expect(screen.getByTestId("subspace-identity").textContent).toBe("2 + 1 = 3");
  });

  it("couples the two dimensions across every preset", () => {
    render(<SubspacesRankExplorer />);
    const cases: readonly [string, string, string, string][] = [
      ["Rank 3 (solid)", "3", "0", "solid"],
      ["Rank 2 (plane)", "2", "1", "plane"],
      ["Rank 1 (line)", "1", "2", "line"],
      ["Rank 0 (point)", "0", "3", "point"],
    ];
    for (const [label, rank, nullity, shape] of cases) {
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(screen.getByTestId("subspace-rank").textContent, label).toBe(rank);
      expect(screen.getByTestId("subspace-nullity").textContent, label).toBe(nullity);
      expect(screen.getByTestId("subspace-shape").textContent, label).toBe(shape);
      // The identity holds at every rank — the point of the readout.
      expect(screen.getByTestId("subspace-identity").textContent, label).toBe(
        `${rank} + ${nullity} = 3`,
      );
    }
  });

  it("makes the map collapse when the learner edits the third row into a combination", () => {
    render(<SubspacesRankExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "Rank 3 (solid)" }));
    expect(screen.getByTestId("subspace-rank").textContent).toBe("3");
    // Rows 1 and 2 are (1,0,2) and (0,1,3). Setting row 3 to their sum collapses it.
    fireEvent.change(screen.getByLabelText(/a₃₁/), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/a₃₂/), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/a₃₃/), { target: { value: "5" } });
    expect(screen.getByTestId("subspace-rank").textContent).toBe("2");
    expect(screen.getByTestId("subspace-nullity").textContent).toBe("1");
  });

  it("prints the column-space basis from A's OWN columns, not the reduced form", () => {
    render(<SubspacesRankExplorer />);
    // Default map is [[1,0,2],[0,1,3],[1,1,5]]; the true basis is columns 1 and 2
    // of A: (1,0,1) and (0,1,1). The reduced form would have given (1,0,0),(0,1,0).
    const basis = screen.getByTestId("subspace-col-basis").textContent ?? "";
    expect(basis).toContain("(1, 0, 1)");
    expect(basis).toContain("(0, 1, 1)");
    expect(basis).not.toContain("(1, 0, 0)");
  });

  it("labels each basis with the space it actually lives in", () => {
    render(<SubspacesRankExplorer />);
    expect(screen.getByText(/Basis of Col\(A\)/).textContent).toMatch(/output/);
    expect(screen.getByText(/Basis of Null\(A\)/).textContent).toMatch(/input/);
  });

  it("shows an empty null-space basis rather than a zero vector at full rank", () => {
    render(<SubspacesRankExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "Rank 3 (solid)" }));
    expect(screen.getByTestId("subspace-null-basis").textContent).toMatch(
      /only the zero vector/,
    );
  });

  it("reset returns to the rank-2 example", () => {
    render(<SubspacesRankExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "Rank 0 (point)" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByTestId("subspace-rank").textContent).toBe("2");
  });
});
