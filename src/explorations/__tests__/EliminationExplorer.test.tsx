import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { EliminationExplorer } from "../EliminationExplorer";

/**
 * The three synchronized representations must describe the SELECTED system's
 * solution geometry — a crossing point only for the unique case, a shared
 * solution line for the infinite case, and an empty set for the inconsistent
 * case. This pins that the permanent description, the canvas caption, and the
 * diagram's accessible (Mafs) label are all preset-sensitive, not hardcoded to
 * a unique intersection.
 */
describe("EliminationExplorer preset-sensitive language", () => {
  const caption = () => screen.getByTestId("elim-canvas-caption").textContent ?? "";
  const description = () =>
    document.querySelector(".exploration-panel__description")?.textContent ?? "";
  const diagramLabel = () =>
    screen
      .getByRole("img", { name: /constraint lines/i })
      .getAttribute("aria-label") ?? "";

  it("unique preset (default): a fixed crossing point", () => {
    render(<EliminationExplorer />);
    expect(screen.getByTestId("elim-kind-readout").textContent).toBe("one solution");
    expect(caption()).toBe("Constraint lines — the crossing point is the solution set");
    expect(description()).toContain("meeting at a fixed intersection point");
    expect(diagramLabel()).toContain("fixed intersection point");
  });

  it("infinite preset: coincident constraints, one shared line, no crossing point", () => {
    render(<EliminationExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "Infinitely many" }));
    expect(screen.getByTestId("elim-kind-readout").textContent).toBe("infinitely many");
    expect(caption()).toBe("Constraint lines — the shared line is the solution set");
    expect(description()).toContain("coincident constraint lines");
    expect(description()).not.toContain("crossing point");
    expect(diagramLabel()).toContain("coincident constraint lines");
    expect(diagramLabel()).not.toContain("intersection point");
  });

  it("none preset: an empty solution set, no crossing point", () => {
    render(<EliminationExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "No solution" }));
    expect(screen.getByTestId("elim-kind-readout").textContent).toBe("no solution");
    expect(caption()).toBe("Constraint lines — no crossing, so the solution set is empty");
    expect(description()).toContain("never meet");
    expect(description()).not.toContain("crossing point");
    expect(diagramLabel()).toContain("no intersection");
  });
});
