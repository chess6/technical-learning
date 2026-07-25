import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ChangeOfBasisExplorer } from "../ChangeOfBasisExplorer";

/**
 * The explorer exists to make one claim operable: the point stays put while its
 * NAME changes. These tests hold that, the round-trip check, the invariants, and
 * the not-a-basis guard (which must report rather than render Infinity).
 */

describe("ChangeOfBasisExplorer", () => {
  it("starts on Lesson 1's basis and reproduces its hand-worked coordinates", () => {
    render(<ChangeOfBasisExplorer />);
    expect(screen.getByTestId("cob-is-basis").textContent).toMatch(/Yes/);
    expect(screen.getByTestId("cob-coords").textContent).toBe("(1, 1)");
    // The round-trip check must land back on the original point.
    expect(screen.getByTestId("cob-rebuild").textContent).toBe("(4, 1)");
  });

  it("changes the NAME, not the point, when the basis changes", () => {
    render(<ChangeOfBasisExplorer />);
    const before = screen.getByTestId("cob-coords").textContent;
    fireEvent.click(screen.getByRole("button", { name: "Skewed" }));
    expect(screen.getByTestId("cob-coords").textContent).not.toBe(before);
    // …and the rebuilt point is still exactly the same point.
    expect(screen.getByTestId("cob-rebuild").textContent).toBe("(4, 1)");
  });

  it("gives P = I and leaves the map's description alone in the standard basis", () => {
    render(<ChangeOfBasisExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "Standard" }));
    expect(screen.getByTestId("cob-p").getAttribute("data-plain")).toBe(
      "[[1, 0], [0, 1]]",
    );
    expect(screen.getByTestId("cob-a-in-basis").getAttribute("data-plain")).toBe(
      "[[3, 1], [0, 2]]",
    );
  });

  it("turns the map's description diagonal in the eigenbasis", () => {
    render(<ChangeOfBasisExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "Eigenbasis of A" }));
    expect(screen.getByTestId("cob-a-in-basis").getAttribute("data-plain")).toBe(
      "[[3, 0], [0, 2]]",
    );
  });

  it("keeps determinant and trace fixed while the entries change", () => {
    render(<ChangeOfBasisExplorer />);
    fireEvent.click(screen.getByText("Compare the two descriptions of the map"));
    for (const label of ["Standard", "Lesson 1's basis", "Eigenbasis of A", "Skewed"]) {
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(screen.getByTestId("cob-det-match").textContent, label).toBe("yes");
      expect(screen.getByTestId("cob-trace-match").textContent, label).toBe("yes");
    }
  });

  it("reports a dependent pair as NOT a basis instead of inverting it", () => {
    render(<ChangeOfBasisExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "Dependent (not a basis)" }));
    expect(screen.getByTestId("cob-is-basis").textContent).toMatch(/No/);
    expect(screen.getByTestId("cob-coords").textContent).toMatch(/undefined/);
    expect(screen.getByTestId("cob-pinv").textContent).toMatch(/no inverse/);
    expect(screen.getByTestId("cob-a-in-basis").getAttribute("data-plain")).toBe("none");
  });

  it("reset returns to Lesson 1's basis and point", () => {
    render(<ChangeOfBasisExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "Standard" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByTestId("cob-coords").textContent).toBe("(1, 1)");
  });
});
