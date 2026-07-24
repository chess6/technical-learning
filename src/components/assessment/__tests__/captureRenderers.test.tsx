import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { snapshotItem } from "../../../lessons/attemptSnapshot";
import type { ExerciseDefinition } from "../../../lessons/types";
import { asExerciseId } from "../../../platform/identity";
import type { AttemptItemResponse } from "../../../platform/learnerState";
import { CaptureField, ReviewAnswer, isCaptureSupported } from "../captureRenderers";

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
