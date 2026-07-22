import { describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { ExercisePanel } from "../ExercisePanel";
import {
  COMMITTED_PREDICTION_ID,
  CONSTRUCT_IN_EXPLORER_ID,
  EXERCISE_SEQUENCE_ID,
  MATRIX_ENTRY_ID,
  SELF_CHECK_ID,
} from "../../../lessons/capabilities";
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

describe("ExercisePanel renders the matrix-entry capability", () => {
  const me: ExerciseDefinition = {
    id: "me",
    type: "custom",
    capabilityId: MATRIX_ENTRY_ID,
    prompt: "Enter the shear matrix.",
    config: {
      rows: 2,
      cols: 2,
      expected: [
        [1, 1],
        [0, 1],
      ],
      explanation: "The shear fixes e_1.",
    },
  };

  it("grades the typed matrix entry-wise", () => {
    const { container, getByText } = render(<ExercisePanel exercises={[me]} />);
    const set = (cell: string, value: string) =>
      fireEvent.change(container.querySelector(`[data-cell="${cell}"]`)!, {
        target: { value },
      });
    set("0-0", "1");
    set("0-1", "1");
    set("1-0", "0");
    set("1-1", "1");
    fireEvent.click(getByText("Check answer"));
    expect(container.textContent).toContain("Correct.");
  });
});

describe("ExercisePanel renders the construct-in-explorer capability", () => {
  const cie: ExerciseDefinition = {
    id: "cie",
    type: "custom",
    capabilityId: CONSTRUCT_IN_EXPLORER_ID,
    prompt: "Commit a b with no solution.",
    config: {
      target: "vector2",
      check: {
        kind: "system-classification",
        matrix: [
          [1, 2],
          [2, 4],
        ],
        expect: "none",
      },
      reveal: "That b lies off the columns' line.",
    },
  };

  it("grades the committed vector against the pure predicate", () => {
    const { container, getByText, getByLabelText } = render(
      <ExercisePanel exercises={[cie]} />,
    );
    fireEvent.change(getByLabelText("x coordinate"), { target: { value: "1" } });
    fireEvent.change(getByLabelText("y coordinate"), { target: { value: "0" } });
    fireEvent.click(getByText("Commit construction"));
    expect(container.textContent).toContain("off the columns' line");
  });
});

describe("ExercisePanel renders the self-check capability", () => {
  const sc: ExerciseDefinition = {
    id: "sc",
    type: "custom",
    capabilityId: SELF_CHECK_ID,
    prompt: "Explain the determinant.",
    config: { modelAnswer: "It is the signed area scale factor." },
  };

  it("gates the model answer behind a written explanation, then self-marks", () => {
    const { container, getByText, getByPlaceholderText } = render(
      <ExercisePanel exercises={[sc]} />,
    );
    // Model answer hidden until the learner writes something.
    expect(container.textContent).not.toContain("signed area scale factor");
    const reveal = getByText("Reveal model answer") as HTMLButtonElement;
    expect(reveal.disabled).toBe(true);

    fireEvent.change(getByPlaceholderText("Explain in your own words…"), {
      target: { value: "It scales area." },
    });
    expect(reveal.disabled).toBe(false);
    fireEvent.click(reveal);
    expect(container.textContent).toContain("signed area scale factor");

    fireEvent.click(getByText("I understood"));
    expect(container.textContent).toContain("Marked understood.");
  });
});

describe("ExercisePanel renders the exercise-sequence capability", () => {
  const seq: ExerciseDefinition = {
    id: "seq",
    type: "custom",
    capabilityId: EXERCISE_SEQUENCE_ID,
    prompt: "Compute step by step.",
    config: {
      steps: [
        {
          kind: "numeric",
          prompt: "First component?",
          expected: 4,
          explanation: "2·1 + 1·2 = 4.",
        },
        {
          kind: "multiple-choice",
          prompt: "Which column is fixed?",
          choices: ["e_1", "e_2"],
          correctChoice: 0,
          explanation: "The shear fixes e_1.",
        },
      ],
    },
  };

  it("gates the next step behind a correct answer, then aggregates", () => {
    const { container, getByText, getByLabelText } = render(
      <ExercisePanel exercises={[seq]} />,
    );
    // Step 2 (multiple choice) is not revealed until step 1 is correct.
    expect(container.querySelector('[data-choice-index="0"]')).toBeNull();

    fireEvent.change(getByLabelText("Step 1 answer"), { target: { value: "4" } });
    fireEvent.click(getByText("Check step"));

    // Step 2 now revealed.
    const secondCorrect = container.querySelector('[data-choice-index="0"]');
    expect(secondCorrect).not.toBeNull();
    fireEvent.click(secondCorrect!);

    expect(container.textContent).toContain("All 2 steps correct.");
  });
});
