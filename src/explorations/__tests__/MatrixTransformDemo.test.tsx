import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MatrixTransformDemo } from "../MatrixTransformDemo";
import { matrixVectorMultiply, requireMatrixExample } from "../../math";

describe("MatrixTransformDemo", () => {
  it("renders using the shared shear-2-1 example and shared math for A v", () => {
    const example = requireMatrixExample("shear-2-1");
    const expected = matrixVectorMultiply(
      example.matrix,
      example.inputVector ?? [1.5, 0.5],
    );

    const { unmount } = render(<MatrixTransformDemo />);

    expect(screen.getByTestId("determinant").textContent).toBe("2");
    expect(screen.getByTestId("transformed-vector").textContent).toBe(
      `(${expected[0]}, ${expected[1]})`,
    );

    unmount();
  });

  it("updates the determinant readout when a matrix slider changes", () => {
    render(<MatrixTransformDemo />);
    const a11 = screen.getByLabelText(/a₁₁/);
    fireEvent.change(a11, { target: { value: "0" } });
    // det([[0,1],[0,1]]) = 0
    expect(screen.getByTestId("determinant").textContent).toBe("0");
  });

  it("reset restores the initial matrix entries and determinant", () => {
    render(<MatrixTransformDemo />);
    const a11 = screen.getByLabelText(/a₁₁/);
    fireEvent.change(a11, { target: { value: "-2" } });
    expect(screen.getByTestId("determinant").textContent).not.toBe("2");

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByTestId("determinant").textContent).toBe("2");
    expect(a11).toHaveProperty("value", "2");
  });
});
