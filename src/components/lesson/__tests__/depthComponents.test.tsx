import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MisconceptionCallout } from "../MisconceptionCallout";
import { DepthLayerList } from "../DepthLayer";
import { SolutionReveal } from "../SolutionReveal";
import { ExercisePanel } from "../ExercisePanel";
import type { ExerciseDefinition } from "../../../lessons/types";

describe("MisconceptionCallout", () => {
  it("renders belief, confront, and resolve slots", () => {
    render(
      <MisconceptionCallout
        title="Trap"
        belief="Wrong idea."
        confront="Counterexample."
        resolve="Repair."
      />,
    );
    expect(screen.getByTestId("misconception-callout")).toBeTruthy();
    expect(screen.getByText(/Wrong idea/)).toBeTruthy();
    expect(screen.getByText(/Counterexample/)).toBeTruthy();
    expect(screen.getAllByText(/Repair/).length).toBeGreaterThan(0);
  });
});

describe("DepthLayerList", () => {
  it("renders expandable layers without requiring them open", () => {
    render(
      <DepthLayerList
        layers={[
          {
            kind: "connection",
            title: "To determinants",
            body: "det = 0 is collapse.",
          },
        ]}
      />,
    );
    expect(screen.getByText("To determinants")).toBeTruthy();
    expect(screen.getByText("Connection")).toBeTruthy();
  });
});

describe("SolutionReveal", () => {
  it("renders prose without a visual", () => {
    render(
      <SolutionReveal
        reveal={{
          prose: "The answer is geometric.",
          interpretation: "Read λ as stretch.",
        }}
      />,
    );
    expect(screen.getByTestId("solution-reveal")).toBeTruthy();
    expect(screen.getByText(/The answer is geometric/)).toBeTruthy();
  });
});

describe("ExercisePanel tiers and eigenvalue grading", () => {
  const exercises: ExerciseDefinition[] = [
    {
      id: "e1",
      type: "eigenvalue",
      tier: "drill",
      prompt: "Eigenvalues of the lesson matrix?",
      expected: [2, 3],
      explanation: "char poly roots",
      hints: ["Form det(A−λI)."],
    },
  ];

  it("shows a hint on demand and grades eigenvalues", () => {
    render(<ExercisePanel exercises={exercises} />);
    expect(screen.getByText(/Drill/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Show hint" }));
    expect(screen.getByText(/Form det/)).toBeTruthy();

    const input = screen.getByLabelText("Eigenvalues");
    fireEvent.change(input, { target: { value: "3, 2" } });
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    const feedback = document.querySelector(
      '.exercise-panel__feedback[data-state="correct"]',
    );
    expect(feedback?.textContent).toMatch(/Correct/);
  });
});
