import { describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { ExercisePanel } from "../ExercisePanel";
import { COMMITTED_PREDICTION_ID } from "../../../lessons/capabilities";
import type { ExerciseDefinition } from "../../../lessons/types";

describe("ExercisePanel renders built-in interactions through the registry", () => {
  it("grades a multiple-choice exercise as before", () => {
    const mc: ExerciseDefinition = {
      id: "mc",
      type: "multiple-choice",
      prompt: "Pick the right one",
      choices: ["first", "second"],
      correctChoice: 1,
      explanation: "second is right",
    };
    const { container } = render(<ExercisePanel exercises={[mc]} />);

    const correct = container.querySelector<HTMLButtonElement>(
      '[data-choice-index="1"]',
    );
    expect(correct).not.toBeNull();
    fireEvent.click(correct!);

    expect(container.textContent).toContain("Correct.");
    expect(container.textContent).toContain("second is right");
  });
});

describe("ExercisePanel renders the committed-prediction pilot via the custom path", () => {
  const cp: ExerciseDefinition = {
    id: "cp",
    type: "custom",
    capabilityId: COMMITTED_PREDICTION_ID,
    prompt: "Predict which way it lands",
    config: {
      options: ["Left", "Right"],
      correctIndex: 1,
      reveal: "It lands right.",
    },
  };

  it("requires a commit before revealing, then grades the commitment", () => {
    const { container, getByRole } = render(<ExercisePanel exercises={[cp]} />);

    const commit = getByRole("button", { name: /Commit answer/ }) as HTMLButtonElement;
    // Cannot commit until a choice is selected.
    expect(commit.disabled).toBe(true);
    // Nothing revealed yet.
    expect(container.textContent).not.toContain("It lands right.");

    fireEvent.click(container.querySelector('[data-choice-index="1"]')!);
    expect(commit.disabled).toBe(false);

    fireEvent.click(commit);
    expect(container.textContent).toContain("It lands right.");
    expect(container.textContent).toContain("Correct.");
  });
});
