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

  it("coordinate challenge (q) finds the undisclosed [q]_B = (2, -1)", () => {
    const { container } = render(<LinearCombinationExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "Coordinate challenge (q)" }));
    expect(screen.getByTestId("match-readout").textContent).toBe("not matched yet");
    setRange(container, "coef-a", "2");
    setRange(container, "coef-b", "-1");
    expect(plain("combo-readout")).toBe("(-1, 5)");
    expect(plain("coords-b-readout")).toBe("(2, -1)");
    expect(screen.getByTestId("match-readout").textContent).toBe("matched");
  });

  it("basis-order toggle swaps the coordinate readout to (b, a)", () => {
    const { container } = render(<LinearCombinationExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "Coordinate challenge (q)" }));
    setRange(container, "coef-a", "2");
    setRange(container, "coef-b", "-1");
    expect(plain("coords-b-readout")).toBe("(2, -1)");
    fireEvent.click(screen.getByLabelText("Swap basis order (B' = (w, v))"));
    expect(plain("coords-b-readout")).toBe("(-1, 2)");
    expect(screen.getByTestId("basis-order-readout").textContent).toBe("B' = (w, v)");
  });

  it("dependent inside-span task shows the infinitely-many family on r = (3, 6)", () => {
    const { container } = render(<LinearCombinationExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "Dependent (inside span)" }));
    // Starts on r = 3v via (a, b) = (1, 1).
    expect(plain("combo-readout")).toBe("(3, 6)");
    expect(screen.getByTestId("family-readout").textContent).toBe(
      "a = 3 − 2b (infinitely many)",
    );
    // A different (a, b) with a + 2b = 3 still lands on r.
    setRange(container, "coef-a", "3");
    setRange(container, "coef-b", "0");
    expect(plain("combo-readout")).toBe("(3, 6)");
    expect(screen.getByTestId("match-readout").textContent).toBe("on target");
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
