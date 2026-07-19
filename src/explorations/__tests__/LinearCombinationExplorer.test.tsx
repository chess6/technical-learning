import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LinearCombinationExplorer } from "../LinearCombinationExplorer";

function setRange(container: HTMLElement, id: string, value: string) {
  const input = container.querySelector<HTMLInputElement>(`#${id}`);
  if (!input) throw new Error(`missing #${id}`);
  fireEvent.change(input, { target: { value } });
}

function plain(testId: string): string | null {
  return screen.getByTestId(testId).getAttribute("data-plain");
}

describe("LinearCombinationExplorer", () => {
  it("starts from the shared example: v + w = (4, 1), independent, spanning the plane", () => {
    render(<LinearCombinationExplorer />);
    expect(plain("combo-readout")).toBe("(4, 1)");
    expect(screen.getByTestId("independence-readout").textContent).toBe("independent");
    expect(screen.getByTestId("span-readout").textContent).toBe("the plane");
  });

  it("updates the combination when a coefficient changes", () => {
    const { container } = render(<LinearCombinationExplorer />);
    setRange(container, "coef-a", "2");
    expect(plain("combo-readout")).toBe("(5, 3)");
  });

  it("switches span classification when the dependent preset is chosen", () => {
    render(<LinearCombinationExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "Dependent" }));
    expect(screen.getByTestId("independence-readout").textContent).toBe("dependent");
    expect(screen.getByTestId("span-readout").textContent).toBe("a line");
  });

  it("reset restores the independent default", () => {
    const { container } = render(<LinearCombinationExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "Dependent" }));
    setRange(container, "coef-a", "-1");
    expect(screen.getByTestId("span-readout").textContent).toBe("a line");

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(plain("combo-readout")).toBe("(4, 1)");
    expect(screen.getByTestId("independence-readout").textContent).toBe("independent");
    expect(screen.getByTestId("span-readout").textContent).toBe("the plane");
  });
});
