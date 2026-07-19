import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MatrixTransformationExplorer } from "../MatrixTransformationExplorer";
import { matrixVectorMultiply, requireMatrixExample } from "../../math";

function setRange(container: HTMLElement, id: string, value: string) {
  const input = container.querySelector<HTMLInputElement>(`#${id}`);
  if (!input) throw new Error(`missing #${id}`);
  fireEvent.change(input, { target: { value } });
}

function plain(testId: string): string | null {
  return screen.getByTestId(testId).getAttribute("data-plain");
}

describe("MatrixTransformationExplorer", () => {
  const example = requireMatrixExample("shear-2-1");
  const input = example.inputVector ?? [1.5, 0.5];

  it("shows the shared matrix and its transformed basis columns", () => {
    render(<MatrixTransformationExplorer />);
    expect(plain("matrix-readout")).toBe("[[2, 1], [0, 1]]");
    expect(plain("e1-readout")).toBe("(2, 0)");
    expect(plain("e2-readout")).toBe("(1, 1)");
    expect(screen.getByTestId("det-readout").textContent).toContain("2");
  });

  it("output equals the shared matrix-vector product", () => {
    render(<MatrixTransformationExplorer />);
    const expected = matrixVectorMultiply(example.matrix, input);
    expect(plain("output-readout")).toBe(`(${expected[0]}, ${expected[1]})`);
  });

  it("scrubbing the transition to identity makes the output equal the input", () => {
    const { container } = render(<MatrixTransformationExplorer />);
    setRange(container, "progress", "0");
    expect(plain("output-readout")).toBe(`(${input[0]}, ${input[1]})`);
    expect(plain("e1-readout")).toBe("(1, 0)");
  });

  it("preset selection updates the matrix", () => {
    render(<MatrixTransformationExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "Identity" }));
    expect(plain("matrix-readout")).toBe("[[1, 0], [0, 1]]");
  });

  it("reset restores the shared default example", () => {
    const { container } = render(<MatrixTransformationExplorer />);
    setRange(container, "m-a", "-2");
    expect(plain("matrix-readout")).not.toBe("[[2, 1], [0, 1]]");

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(plain("matrix-readout")).toBe("[[2, 1], [0, 1]]");
  });
});
