import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { EquationBlock } from "../EquationBlock";

describe("EquationBlock", () => {
  it("renders a valid expression with KaTeX", () => {
    const { container } = render(<EquationBlock tex="a\\mathbf{v} + b\\mathbf{w}" />);
    expect(container.querySelector(".katex")).not.toBeNull();
    expect(container.querySelector("[data-fallback]")).toBeNull();
  });

  it("emits accessible MathML alongside the HTML", () => {
    const { container } = render(<EquationBlock tex="x^2" />);
    expect(container.querySelector(".katex-mathml")).not.toBeNull();
  });

  it("falls back to readable source when KaTeX fails to parse", () => {
    const bad = "\\frac{";
    const { container } = render(<EquationBlock tex={bad} />);
    const fallback = container.querySelector("[data-fallback]");
    expect(fallback).not.toBeNull();
    expect(fallback?.textContent).toBe(bad);
    expect(container.querySelector(".katex")).toBeNull();
  });

  it("supports inline mode", () => {
    const { container } = render(<EquationBlock tex="v_1" display={false} />);
    expect(container.querySelector(".equation-inline")).not.toBeNull();
  });
});
