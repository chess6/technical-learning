import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DeterminantExplorer } from "../DeterminantExplorer";

describe("DeterminantExplorer", () => {
  it("starts from the shared shear-2-1 example with det = 2", () => {
    render(<DeterminantExplorer />);
    expect(screen.getByTestId("det-value").textContent).toBe("2");
    expect(screen.getByTestId("det-abs").textContent).toBe("2");
    expect(screen.getByTestId("det-effect").textContent).toMatch(/expands/);
  });

  it("singular preset collapses area", () => {
    render(<DeterminantExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "Collapse" }));
    expect(screen.getByTestId("det-value").textContent).toBe("0");
    expect(screen.getByTestId("det-effect").textContent).toMatch(/collapses/);
  });

  it("negative preset reports orientation reversal", () => {
    render(<DeterminantExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "Negative det" }));
    expect(screen.getByTestId("det-effect").textContent).toMatch(/reversed/);
  });

  it("reset restores the guided example", () => {
    render(<DeterminantExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "Collapse" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByTestId("det-value").textContent).toBe("2");
  });
});
