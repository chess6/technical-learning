import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ProseWithMath } from "../ProseWithMath";
import { EquationBlock } from "../EquationBlock";

describe("ProseWithMath", () => {
  it("renders inline KaTeX for $...$ segments", () => {
    const { container } = render(
      <ProseWithMath text="Scale $a\\mathbf{v}$ then add." />,
    );
    expect(container.querySelector(".katex")).not.toBeNull();
    expect(container.textContent).toContain("Scale");
    expect(container.textContent).toContain("then add.");
  });
});

describe("conceptual matrix notation", () => {
  it("renders a bmatrix through KaTeX", () => {
    const { container } = render(
      <EquationBlock tex={"A = \\begin{bmatrix} 2 & 1 \\\\ 0 & 1 \\end{bmatrix}"} />,
    );
    expect(container.querySelector(".katex")).not.toBeNull();
    expect(container.querySelector("[data-fallback]")).toBeNull();
  });
});
