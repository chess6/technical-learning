import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EquationSequence } from "../EquationSequence";
import { WorkedExamplePanel } from "../WorkedExamplePanel";
import type { WorkedExample } from "../../../lessons/types";

describe("EquationSequence", () => {
  const equations = [
    "A\\mathbf{v} = \\lambda\\mathbf{v}",
    "(A - \\lambda I)\\mathbf{v} = \\mathbf{0}",
    "\\lambda = 3,\\; 2",
  ];

  it("renders one row per equation with no blank scaffolding", () => {
    const { container } = render(<EquationSequence equations={equations} />);
    const rows = container.querySelectorAll(".equation-sequence__row");
    expect(rows.length).toBe(equations.length);
    // No leftover five-field labels or per-step prose containers.
    expect(container.querySelector(".worked-example__label")).toBeNull();
    expect(container.querySelector(".worked-example__step")).toBeNull();
  });

  it("emits accessible MathML through KaTeX", () => {
    const { container } = render(<EquationSequence equations={equations} />);
    expect(container.querySelector("math")).toBeTruthy();
    expect(
      container.querySelectorAll(".katex-mathml").length,
    ).toBeGreaterThanOrEqual(equations.length);
  });

  it("renders nothing for an empty sequence", () => {
    const { container } = render(<EquationSequence equations={[]} />);
    expect(container.querySelector(".equation-sequence")).toBeNull();
  });
});

describe("WorkedExamplePanel (equation-only, no five-field template)", () => {
  const example: WorkedExample = {
    id: "demo",
    title: "A calculation",
    prompt: "Compute it.",
    equations: ["A\\mathbf{v} = \\lambda\\mathbf{v}", "\\lambda = 3,\\; 2"],
    layers: [
      { kind: "trap", title: "One real insight", body: "Watch $A-\\lambda I$." },
    ],
  };

  it("renders the equation sequence and never the removed labels", () => {
    render(<WorkedExamplePanel examples={[example]} />);
    expect(screen.getByTestId("equation-sequence")).toBeTruthy();
    // The five discarded labels must not render anywhere.
    for (const label of [
      "Object",
      "Invariant",
      "Picture",
      "Why next",
      "What you learned",
    ]) {
      expect(screen.queryByText(label)).toBeNull();
    }
  });

  it("renders authored depth layers but nothing per-equation", () => {
    const { container } = render(<WorkedExamplePanel examples={[example]} />);
    expect(screen.getByText("One real insight")).toBeTruthy();
    expect(container.querySelector(".worked-example__step")).toBeNull();
  });
});
