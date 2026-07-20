import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EigenSolutionDiagram } from "../EigenSolutionDiagram";
import { hasSolutionVisual, listSolutionVisualIds } from "../registry";

describe("EigenSolutionDiagram", () => {
  it("exposes lambda and direction readouts for the lesson matrix", () => {
    render(
      <EigenSolutionDiagram
        exampleId="eigen-distinct"
        ariaLabel="test diagram"
      />,
    );
    const lambdas = screen.getByTestId("eigen-solution-lambdas");
    expect(lambdas.getAttribute("data-plain")).toMatch(/2/);
    expect(lambdas.getAttribute("data-plain")).toMatch(/3/);
    expect(screen.getByTestId("eigen-solution-kind").getAttribute("data-plain")).toBe(
      "distinct-real",
    );
    expect(screen.getByTestId("eigen-solution-dirs").textContent).toMatch(/λ=/);
  });
});

describe("solution visual registry", () => {
  it("registers eigen solution visuals", () => {
    expect(hasSolutionVisual("eigen-solution")).toBe(true);
    expect(hasSolutionVisual("eigen-solution-off-axis")).toBe(true);
    expect(listSolutionVisualIds()).toContain("eigen-solution");
  });
});
