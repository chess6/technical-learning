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

  it("coordinate challenge shows a target and finds [p]_B = (1, 1) when matched", () => {
    const { container } = render(<LinearCombinationExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "Coordinate challenge" }));

    // Starts away from the answer so the learner has to find a = b = 1.
    expect(plain("coords-b-readout")).toBe("(0, 0)");
    expect(screen.getByTestId("match-readout").textContent).toBe("not matched yet");

    setRange(container, "coef-a", "1");
    setRange(container, "coef-b", "1");

    expect(plain("combo-readout")).toBe("(4, 1)");
    expect(plain("coords-b-readout")).toBe("(1, 1)");
    expect(screen.getByTestId("match-readout").textContent).toBe("matched");
  });

  it("hides the coordinate-challenge readouts outside the challenge preset", () => {
    render(<LinearCombinationExplorer />);
    expect(screen.queryByTestId("coords-b-readout")).toBeNull();
    expect(screen.queryByTestId("match-readout")).toBeNull();
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
