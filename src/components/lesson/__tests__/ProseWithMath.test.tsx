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

  it("renders **bold** as <strong> without stray asterisks", () => {
    const { container } = render(
      <ProseWithMath text="widths, **not** by carrying" />,
    );
    const strong = container.querySelector("strong");
    expect(strong).not.toBeNull();
    expect(strong!.textContent).toBe("not");
    expect(container.textContent).toBe("widths, not by carrying");
    expect(container.textContent).not.toContain("*");
  });

  it("renders *italic* as <em>", () => {
    const { container } = render(
      <ProseWithMath text="a *separate* rectangle" />,
    );
    const em = container.querySelector("em");
    expect(em).not.toBeNull();
    expect(em!.textContent).toBe("separate");
    expect(container.textContent).not.toContain("*");
  });

  it("combines **bold** with inline math in one string", () => {
    const { container } = render(
      <ProseWithMath text="Recover **the sum** $AD+BC$ exactly" />,
    );
    expect(container.querySelector("strong")!.textContent).toBe("the sum");
    expect(container.querySelector(".katex")).not.toBeNull();
    expect(container.textContent).toContain("Recover");
    expect(container.textContent).toContain("exactly");
    expect(container.textContent).not.toContain("*");
  });

  it("keeps asterisks that live inside inline math untouched by emphasis", () => {
    const { container } = render(<ProseWithMath text="$a * b$ product" />);
    expect(container.querySelector(".katex")).not.toBeNull();
    expect(container.querySelector("em")).toBeNull();
    expect(container.querySelector("strong")).toBeNull();
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
