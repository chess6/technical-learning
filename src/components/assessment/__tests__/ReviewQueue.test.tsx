import { afterEach, describe, expect, it } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { LearnerStateProvider } from "../../../platform/useLearnerState";
import { ModuleRunner } from "../ModuleRunner";
import { ReviewQueue } from "../ReviewQueue";

afterEach(() => localStorage.clear());

const SET = "systems-elimination-review";

describe("ReviewQueue human scoring", () => {
  it("scores every pending proof, driving the attempt to REVIEW_COMPLETE", async () => {
    const { container } = render(
      <LearnerStateProvider>
        <ModuleRunner setId={SET} />
        <ReviewQueue />
      </LearnerStateProvider>,
    );

    await waitFor(() =>
      expect(container.querySelector('[data-testid="module-submit"]')).toBeTruthy(),
    );

    // Write one proof so the reviewer sees produced text.
    const proof = container.querySelector<HTMLElement>(
      '[data-exercise="sys-prove-trichotomy"]',
    )!;
    fireEvent.change(proof.querySelector("textarea")!, {
      target: { value: "Suppose the columns are dependent…" },
    });

    fireEvent.click(container.querySelector('[data-testid="module-submit"]')!);

    // Three proofs land in the queue.
    await waitFor(() =>
      expect(container.querySelectorAll('[data-testid="review-save"]').length).toBe(3),
    );
    expect(container.querySelector('[data-testid="review-learner-text"]')!.textContent).toContain(
      "Suppose the columns are dependent",
    );

    // Score each pending review as passed (list shrinks as we go).
    for (let i = 0; i < 3; i += 1) {
      const pass = container.querySelector<HTMLButtonElement>('[data-testid="review-pass"]')!;
      fireEvent.click(pass);
      const save = container.querySelector<HTMLButtonElement>('[data-testid="review-save"]')!;
      expect(save.disabled).toBe(false);
      fireEvent.click(save);
    }

    // Queue drains; the attempt reports REVIEW_COMPLETE.
    await waitFor(() =>
      expect(container.querySelector('[data-testid="review-queue-empty"]')).toBeTruthy(),
    );
    expect(
      container.querySelector('[data-testid="review-status"]')!.getAttribute("data-status"),
    ).toBe("REVIEW_COMPLETE");
  });
});
