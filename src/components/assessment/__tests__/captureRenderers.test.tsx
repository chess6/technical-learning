import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { snapshotItem } from "../../../lessons/attemptSnapshot";
import type { ExerciseDefinition } from "../../../lessons/types";
import { asExerciseId } from "../../../platform/identity";
import type { AttemptItemResponse } from "../../../platform/learnerState";
import { CaptureField, ReviewAnswer, isCaptureSupported } from "../captureRenderers";
import { ELIMINATION_ID, SOLUTION_SET_ID } from "../../../lessons/capabilities";

const NUMERIC: ExerciseDefinition = {
  id: "num-demo",
  type: "numeric",
  prompt: "What is $2 + 2$?",
  expected: 4,
  explanation: "Addition.",
};

describe("shared phase-correct renderer — numeric (a Package G kind)", () => {
  it("declares numeric capturable", () => {
    expect(isCaptureSupported(snapshotItem(NUMERIC))).toBe(true);
  });

  it("captures a serialized answer without leaking correctness", () => {
    const item = snapshotItem(NUMERIC);
    const onAnswer = vi.fn();
    const { container } = render(
      <CaptureField item={item} answer={undefined} onAnswer={onAnswer} />,
    );
    const input = container.querySelector("input")!;
    fireEvent.change(input, { target: { value: "4" } });
    expect(onAnswer).toHaveBeenLastCalledWith({ value: 4 });
    // No correctness is painted during capture.
    expect(container.querySelector("[data-state]")).toBeNull();

    // A non-numeric draft yields a null (omitted) answer, never NaN.
    fireEvent.change(input, { target: { value: "" } });
    expect(onAnswer).toHaveBeenLastCalledWith(null);
  });

  it("review renders the stored answer plus graded feedback", () => {
    const item = snapshotItem(NUMERIC);
    const response: AttemptItemResponse = {
      exerciseId: asExerciseId("num-demo"),
      answer: { value: 4 },
      auto: { kind: "graded", correct: true, feedback: "Correct. Addition." },
      at: "2026-07-21T00:00:00.000Z",
    };
    const { container } = render(<ReviewAnswer item={item} response={response} />);
    expect(container.textContent).toContain("Your answer");
    expect(container.textContent).toContain("4");
    expect(
      container.querySelector('.module-runner__feedback[data-state="correct"]'),
    ).toBeTruthy();
  });
});

const SOLSET: ExerciseDefinition = {
  id: "solset-demo",
  type: "custom",
  capabilityId: SOLUTION_SET_ID,
  prompt: "Solve.",
  config: {
    matrix: [
      [1, 2, -1],
      [2, 4, 1],
    ],
    rhs: [4, 5],
    variables: 3,
    explanation: "",
  },
};

describe("shared phase-correct renderer — solution-set", () => {
  it("declares solution-set capturable", () => {
    expect(isCaptureSupported(snapshotItem(SOLSET))).toBe(true);
  });

  it("captures a produced solution set without revealing the expected shape", () => {
    const item = snapshotItem(SOLSET);
    const onAnswer = vi.fn();
    const { container } = render(
      <CaptureField item={item} answer={undefined} onAnswer={onAnswer} />,
    );
    // Before choosing consistency, no coordinate inputs and no free-count hint exist.
    expect(container.querySelector('[data-testid="solset-freecount"]')).toBeNull();
    expect(container.querySelector('[data-testid="solset-particular-0"]')).toBeNull();

    fireEvent.click(container.querySelector('[data-testid="solset-consistent"]')!);
    fireEvent.change(container.querySelector('[data-testid="solset-freecount"]')!, {
      target: { value: "1" },
    });
    for (const [i, v] of ["3", "0", "-1"].entries()) {
      fireEvent.change(container.querySelector(`[data-testid="solset-particular-${i}"]`)!, {
        target: { value: v },
      });
    }
    fireEvent.click(container.querySelector('[data-testid="solset-add-direction"]')!);
    for (const [i, v] of ["-2", "1", "0"].entries()) {
      fireEvent.change(container.querySelector(`[data-testid="solset-direction-0-${i}"]`)!, {
        target: { value: v },
      });
    }

    expect(onAnswer).toHaveBeenLastCalledWith({
      consistent: true,
      freeCount: 1,
      particular: [3, 0, -1],
      nullDirections: [[-2, 1, 0]],
    });
    // Capture never paints correctness.
    expect(container.querySelector("[data-state]")).toBeNull();
  });

  it("clearing a previously entered field stores null (not a stale value, not 0)", () => {
    const item = snapshotItem(SOLSET);
    const onAnswer = vi.fn();
    const { container } = render(
      <CaptureField item={item} answer={undefined} onAnswer={onAnswer} />,
    );
    fireEvent.click(container.querySelector('[data-testid="solset-consistent"]')!);
    fireEvent.change(container.querySelector('[data-testid="solset-freecount"]')!, {
      target: { value: "1" },
    });
    for (const [i, v] of ["3", "0", "-1"].entries()) {
      fireEvent.change(container.querySelector(`[data-testid="solset-particular-${i}"]`)!, {
        target: { value: v },
      });
    }
    // Clear the middle (expected-zero) component.
    fireEvent.change(container.querySelector('[data-testid="solset-particular-1"]')!, {
      target: { value: "" },
    });
    const last = onAnswer.mock.calls.at(-1)![0];
    expect(last).toMatchObject({ consistent: true, particular: [3, null, -1] });
  });

  it("emits a bare ∅ verdict when the learner picks inconsistent", () => {
    const item = snapshotItem(SOLSET);
    const onAnswer = vi.fn();
    const { container } = render(
      <CaptureField item={item} answer={undefined} onAnswer={onAnswer} />,
    );
    fireEvent.click(container.querySelector('[data-testid="solset-inconsistent"]')!);
    expect(onAnswer).toHaveBeenLastCalledWith({ consistent: false });
  });

  it("review renders the stored solution set", () => {
    const item = snapshotItem(SOLSET);
    const response: AttemptItemResponse = {
      exerciseId: asExerciseId("solset-demo"),
      answer: { consistent: true, freeCount: 1, particular: [3, 0, -1], nullDirections: [[-2, 1, 0]] },
      auto: { kind: "graded", correct: true, feedback: "Correct." },
      at: "2026-07-21T00:00:00.000Z",
    };
    const { container } = render(<ReviewAnswer item={item} response={response} />);
    expect(container.textContent).toContain("particular (3, 0, -1)");
    expect(container.textContent).toContain("directions (-2, 1, 0)");
  });
});

const ELIM: ExerciseDefinition = {
  id: "elim-demo",
  type: "custom",
  capabilityId: ELIMINATION_ID,
  prompt: "Row-reduce.",
  config: {
    matrix: [
      [1, 1],
      [1, -1],
    ],
    rhs: [3, 1],
    variables: 2,
    explanation: "",
  },
};

describe("shared phase-correct renderer — elimination", () => {
  it("declares elimination capturable", () => {
    expect(isCaptureSupported(snapshotItem(ELIM))).toBe(true);
  });

  it("captures produced elimination evidence without revealing pivots/free count first", () => {
    const item = snapshotItem(ELIM);
    const onAnswer = vi.fn();
    const { container } = render(
      <CaptureField item={item} answer={undefined} onAnswer={onAnswer} />,
    );
    // The reduced-matrix grid is present, but no pivot toggles / free count /
    // classification are shown before the learner commits to consistency.
    expect(container.querySelector('[data-testid="elim-cell-0-0"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="elim-pivot-0"]')).toBeNull();
    expect(container.querySelector('[data-testid="elim-freecount"]')).toBeNull();
    expect(container.querySelector('[data-testid="elim-classification"]')).toBeNull();

    const grid = [
      [1, 0, 2],
      [0, 1, 1],
    ];
    for (const [r, row] of grid.entries()) {
      for (const [c, v] of row.entries()) {
        fireEvent.change(container.querySelector(`[data-testid="elim-cell-${r}-${c}"]`)!, {
          target: { value: String(v) },
        });
      }
    }
    fireEvent.click(container.querySelector('[data-testid="elim-consistent"]')!);
    fireEvent.click(container.querySelector('[data-testid="elim-pivot-0"]')!);
    fireEvent.click(container.querySelector('[data-testid="elim-pivot-1"]')!);
    fireEvent.change(container.querySelector('[data-testid="elim-freecount"]')!, {
      target: { value: "0" },
    });
    for (const [i, v] of ["2", "1"].entries()) {
      fireEvent.change(container.querySelector(`[data-testid="elim-particular-${i}"]`)!, {
        target: { value: v },
      });
    }
    expect(onAnswer).toHaveBeenLastCalledWith({
      reduced: [
        [1, 0, 2],
        [0, 1, 1],
      ],
      consistent: true,
      pivotColumns: [0, 1],
      freeCount: 0,
      particular: [2, 1],
      nullDirections: [],
    });
    expect(container.querySelector("[data-state]")).toBeNull();
  });

  it("requires a typed classification for the inconsistent path (a bare toggle emits no classification)", () => {
    const item = snapshotItem(ELIM);
    const onAnswer = vi.fn();
    const { container } = render(
      <CaptureField item={item} answer={undefined} onAnswer={onAnswer} />,
    );
    fireEvent.click(container.querySelector('[data-testid="elim-inconsistent"]')!);
    // Toggling alone stores no classification (so grading cannot pass on the toggle).
    expect(onAnswer).toHaveBeenLastCalledWith({
      reduced: [
        [null, null, null],
        [null, null, null],
      ],
      consistent: false,
    });
    // A classification field now appears for the learner to type into.
    const cls = container.querySelector('[data-testid="elim-classification"]')!;
    fireEvent.change(cls, { target: { value: "inconsistent" } });
    const last = onAnswer.mock.calls.at(-1)![0];
    expect(last).toMatchObject({ consistent: false, classification: "inconsistent" });
  });

  it("preserves blank reduced-matrix cells as null (never 0)", () => {
    const item = snapshotItem(ELIM);
    const onAnswer = vi.fn();
    const { container } = render(
      <CaptureField item={item} answer={undefined} onAnswer={onAnswer} />,
    );
    fireEvent.change(container.querySelector('[data-testid="elim-cell-0-0"]')!, {
      target: { value: "1" },
    });
    const last = onAnswer.mock.calls.at(-1)![0] as { reduced: (number | null)[][] };
    expect(last.reduced[0]![0]).toBe(1);
    expect(last.reduced[0]![1]).toBeNull();
    expect(last.reduced[1]![0]).toBeNull();
  });

  it("review renders the stored elimination answer", () => {
    const item = snapshotItem(ELIM);
    const response: AttemptItemResponse = {
      exerciseId: asExerciseId("elim-demo"),
      answer: {
        reduced: [
          [1, 0, 2],
          [0, 1, 1],
        ],
        consistent: true,
        pivotColumns: [0, 1],
        freeCount: 0,
        particular: [2, 1],
        nullDirections: [],
      },
      auto: { kind: "graded", correct: true, feedback: "Correct." },
      at: "2026-07-21T00:00:00.000Z",
    };
    const { container } = render(<ReviewAnswer item={item} response={response} />);
    expect(container.textContent).toContain("pivots {0, 1}");
    expect(container.textContent).toContain("particular (2, 1)");
  });
});
