import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { EigenvectorExplorer } from "../EigenvectorExplorer";

function setRange(container: HTMLElement, id: string, value: string) {
  const input = container.querySelector<HTMLInputElement>(`#${id}`);
  if (!input) throw new Error(`missing #${id}`);
  fireEvent.change(input, { target: { value } });
}

describe("EigenvectorExplorer", () => {
  it("starts on the distinct-real example", () => {
    render(<EigenvectorExplorer />);
    expect(screen.getByTestId("eigen-kind").textContent).toBe("distinct-real");
  });

  it("rejects the zero vector as a candidate", () => {
    const { container } = render(<EigenvectorExplorer />);
    setRange(container, "eig-vx", "0");
    setRange(container, "eig-vy", "0");
    expect(screen.getByTestId("eigen-candidate").textContent).toBe("zero-vector");
  });

  it("marks e1 as an eigen-direction for the distinct example", () => {
    const { container } = render(<EigenvectorExplorer />);
    setRange(container, "eig-vx", "1");
    setRange(container, "eig-vy", "0");
    expect(screen.getByTestId("eigen-candidate").textContent).toBe("eigen-direction");
  });

  it("defective preset reports one eigendirection", () => {
    render(<EigenvectorExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "Defective" }));
    expect(screen.getByTestId("eigen-kind").textContent).toBe("defective-repeated");
  });

  it("rotation preset reports no real eigendirections", () => {
    render(<EigenvectorExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "No real" }));
    expect(screen.getByTestId("eigen-kind").textContent).toBe("complex");
  });

  it("reset restores the guided example", () => {
    render(<EigenvectorExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "No real" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByTestId("eigen-kind").textContent).toBe("distinct-real");
  });
});
