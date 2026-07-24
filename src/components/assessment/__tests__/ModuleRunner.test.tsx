import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { LearnerStateProvider } from "../../../platform/useLearnerState";
import {
  registerScheduler,
  resetScheduler,
  type SchedulerHook,
} from "../../../platform/scheduler";
import { ModuleRunner } from "../ModuleRunner";

afterEach(() => {
  localStorage.clear();
  resetScheduler();
});

function renderRunner(children: ReactNode) {
  return render(<LearnerStateProvider>{children}</LearnerStateProvider>);
}

const SET = "systems-elimination-review";

describe("ModuleRunner deferred feedback", () => {
  it("captures without leaking correctness, then releases feedback on submit", async () => {
    const { container } = renderRunner(<ModuleRunner setId={SET} />);

    await waitFor(() =>
      expect(container.querySelector('[data-exercise="sys-count-none"]')).toBeTruthy(),
    );

    // Answer an auto item; capture must NOT paint correctness.
    const mc = container.querySelector<HTMLElement>('[data-exercise="sys-count-none"]')!;
    const choice = mc.querySelector<HTMLButtonElement>('[data-choice-index="0"]')!;
    fireEvent.click(choice);
    expect(choice.getAttribute("data-state")).toBeNull();
    // No feedback / review status is visible before submit.
    expect(container.querySelector('[data-testid="review-status"]')).toBeNull();

    // Write a proof answer.
    const proof = container.querySelector<HTMLElement>(
      '[data-exercise="sys-prove-trichotomy"]',
    )!;
    fireEvent.change(proof.querySelector("textarea")!, {
      target: { value: "By independence of the columns…" },
    });

    fireEvent.click(container.querySelector('[data-testid="module-submit"]')!);

    // After release: auto item shows graded feedback; proofs are pending review.
    await waitFor(() =>
      expect(container.querySelector('[data-testid="review-status"]')).toBeTruthy(),
    );
    expect(
      container.querySelector('[data-testid="review-status"]')!.getAttribute("data-status"),
    ).toBe("REVIEW_PENDING");
    const releasedMc = container.querySelector<HTMLElement>(
      '[data-exercise="sys-count-none"]',
    )!;
    expect(releasedMc.querySelector(".module-runner__feedback[data-state]")).toBeTruthy();
  });

  it("dispatches the scheduler hook at most once on release", async () => {
    const onAttemptReleased = vi.fn(() => ({}));
    const hook: SchedulerHook = { onAttemptReleased, dueReviews: () => [] };
    registerScheduler(hook);

    const { container, rerender } = renderRunner(<ModuleRunner setId={SET} />);
    await waitFor(() =>
      expect(container.querySelector('[data-testid="module-submit"]')).toBeTruthy(),
    );

    fireEvent.click(container.querySelector('[data-testid="module-submit"]')!);
    await waitFor(() =>
      expect(container.querySelector('[data-testid="review-status"]')).toBeTruthy(),
    );
    expect(onAttemptReleased).toHaveBeenCalledTimes(1);

    // A rerender must not re-dispatch (idempotent via the persisted marker).
    rerender(
      <LearnerStateProvider>
        <ModuleRunner setId={SET} />
      </LearnerStateProvider>,
    );
    expect(onAttemptReleased).toHaveBeenCalledTimes(1);
  });
});
