import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { LearnerStateProvider } from "../../../platform/useLearnerState";
import { STORAGE_KEY } from "../../../platform/persistence";
import type { LearnerState } from "../../../platform/learnerState";
import { ModuleRunner } from "../ModuleRunner";
import { ReviewQueue } from "../ReviewQueue";

afterEach(() => localStorage.clear());

const SET = "systems-elimination-review";
const PROOFS = ["sys-prove-trichotomy", "elim-explain-invariance", "sol-prove-structure"];

function fillProof(container: HTMLElement, exerciseId: string, text: string) {
  const proof = container.querySelector<HTMLElement>(`[data-exercise="${exerciseId}"]`)!;
  fireEvent.change(proof.querySelector("textarea")!, { target: { value: text } });
}

function storedReviews(): LearnerState["reviews"] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as LearnerState).reviews : {};
}

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

    // Substantive text for EVERY reviewed item (blanks would be omitted, not queued).
    for (const id of PROOFS) fillProof(container, id, `Argument for ${id}: …`);

    fireEvent.click(container.querySelector('[data-testid="module-submit"]')!);

    // All three proofs land in the queue.
    await waitFor(() =>
      expect(container.querySelectorAll('[data-testid="review-save"]').length).toBe(3),
    );

    // Score each pending review as passed WITH a finite score (list shrinks as we go).
    for (let i = 0; i < 3; i += 1) {
      fireEvent.click(container.querySelector<HTMLButtonElement>('[data-testid="review-pass"]')!);
      fireEvent.change(container.querySelector<HTMLInputElement>('[data-testid="review-score"]')!, {
        target: { value: "5" },
      });
      const save = container.querySelector<HTMLButtonElement>('[data-testid="review-save"]')!;
      expect(save.disabled).toBe(false);
      fireEvent.click(save);
    }

    await waitFor(() =>
      expect(container.querySelector('[data-testid="review-queue-empty"]')).toBeTruthy(),
    );
    expect(
      container.querySelector('[data-testid="review-status"]')!.getAttribute("data-status"),
    ).toBe("REVIEW_COMPLETE");
  });

  it("requires a finite score before Save and rejects malformed scores", async () => {
    const { container } = render(
      <LearnerStateProvider>
        <ModuleRunner setId={SET} />
        <ReviewQueue />
      </LearnerStateProvider>,
    );
    await waitFor(() =>
      expect(container.querySelector('[data-testid="module-submit"]')).toBeTruthy(),
    );
    fillProof(container, "sys-prove-trichotomy", "A proof.");
    fireEvent.click(container.querySelector('[data-testid="module-submit"]')!);
    await waitFor(() =>
      expect(container.querySelector('[data-testid="review-save"]')).toBeTruthy(),
    );

    const save = () => container.querySelector<HTMLButtonElement>('[data-testid="review-save"]')!;

    // Verdict alone is not enough — a finite score is required.
    fireEvent.click(container.querySelector<HTMLButtonElement>('[data-testid="review-pass"]')!);
    expect(save().disabled).toBe(true);

    // A malformed (non-numeric) score is rejected and surfaces an error.
    fireEvent.change(container.querySelector<HTMLInputElement>('[data-testid="review-score"]')!, {
      target: { value: "abc" },
    });
    expect(container.querySelector('[data-testid="review-score-error"]')).toBeTruthy();
    expect(save().disabled).toBe(true);

    // A finite score enables Save.
    fireEvent.change(container.querySelector<HTMLInputElement>('[data-testid="review-score"]')!, {
      target: { value: "7" },
    });
    expect(save().disabled).toBe(false);
  });

  it("persists pass/score/feedback/reviewer/timestamp on the scored review", async () => {
    const { container } = render(
      <LearnerStateProvider>
        <ModuleRunner setId={SET} />
        <ReviewQueue />
      </LearnerStateProvider>,
    );
    await waitFor(() =>
      expect(container.querySelector('[data-testid="module-submit"]')).toBeTruthy(),
    );
    fillProof(container, "sys-prove-trichotomy", "A complete proof.");
    fireEvent.click(container.querySelector('[data-testid="module-submit"]')!);
    await waitFor(() =>
      expect(container.querySelector('[data-testid="review-save"]')).toBeTruthy(),
    );

    fireEvent.click(container.querySelector<HTMLButtonElement>('[data-testid="review-pass"]')!);
    fireEvent.change(container.querySelector<HTMLInputElement>('[data-testid="review-score"]')!, {
      target: { value: "9" },
    });
    fireEvent.change(container.querySelector<HTMLTextAreaElement>('[aria-label="Feedback"]')!, {
      target: { value: "Rigorous." },
    });
    fireEvent.change(container.querySelector<HTMLInputElement>('[aria-label="Reviewer"]')!, {
      target: { value: "T. Reviewer" },
    });
    fireEvent.click(container.querySelector<HTMLButtonElement>('[data-testid="review-save"]')!);

    await waitFor(() => {
      const scored = Object.values(storedReviews()).find((r) => r.state === "scored");
      expect(scored).toBeTruthy();
    });
    const scored = Object.values(storedReviews()).find((r) => r.state === "scored")!;
    expect(scored.passed).toBe(true);
    expect(scored.score).toBe(9);
    expect(scored.feedback).toBe("Rigorous.");
    expect(scored.reviewer).toBe("T. Reviewer");
    expect(typeof scored.scoredAt).toBe("string");
  });

  it("records a fail verdict with its score", async () => {
    const { container } = render(
      <LearnerStateProvider>
        <ModuleRunner setId={SET} />
        <ReviewQueue />
      </LearnerStateProvider>,
    );
    await waitFor(() =>
      expect(container.querySelector('[data-testid="module-submit"]')).toBeTruthy(),
    );
    fillProof(container, "sys-prove-trichotomy", "An incomplete attempt.");
    fireEvent.click(container.querySelector('[data-testid="module-submit"]')!);
    await waitFor(() =>
      expect(container.querySelector('[data-testid="review-save"]')).toBeTruthy(),
    );

    fireEvent.click(container.querySelector<HTMLButtonElement>('[data-testid="review-fail"]')!);
    fireEvent.change(container.querySelector<HTMLInputElement>('[data-testid="review-score"]')!, {
      target: { value: "2" },
    });
    fireEvent.click(container.querySelector<HTMLButtonElement>('[data-testid="review-save"]')!);

    await waitFor(() => {
      const scored = Object.values(storedReviews()).find((r) => r.state === "scored");
      expect(scored).toBeTruthy();
    });
    const scored = Object.values(storedReviews()).find((r) => r.state === "scored")!;
    expect(scored.passed).toBe(false);
    expect(scored.score).toBe(2);
  });
});

describe("a failed reviewer save is not silently persisted", () => {
  it("surfaces the durable save-failure warning in the queue", async () => {
    const { container } = render(
      <LearnerStateProvider>
        <ModuleRunner setId={SET} />
        <ReviewQueue />
      </LearnerStateProvider>,
    );
    await waitFor(() =>
      expect(container.querySelector('[data-testid="module-submit"]')).toBeTruthy(),
    );
    fillProof(container, "sys-prove-trichotomy", "A proof to score.");
    fireEvent.click(container.querySelector('[data-testid="module-submit"]')!);
    await waitFor(() =>
      expect(container.querySelector('[data-testid="review-save"]')).toBeTruthy(),
    );

    // Storage now rejects writes; the reviewer's save must not claim persistence.
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    fireEvent.click(container.querySelector<HTMLButtonElement>('[data-testid="review-pass"]')!);
    fireEvent.change(container.querySelector<HTMLInputElement>('[data-testid="review-score"]')!, {
      target: { value: "5" },
    });
    fireEvent.click(container.querySelector<HTMLButtonElement>('[data-testid="review-save"]')!);

    await waitFor(() =>
      expect(container.querySelector('[data-testid="save-warning"]')).toBeTruthy(),
    );
    spy.mockRestore();
  });
});

describe("blank required responses cannot be passed to completion", () => {
  it("auto-omits blank proofs so they never enter the queue or complete review", async () => {
    const { container } = render(
      <LearnerStateProvider>
        <ModuleRunner setId={SET} />
        <ReviewQueue />
      </LearnerStateProvider>,
    );
    await waitFor(() =>
      expect(container.querySelector('[data-testid="module-submit"]')).toBeTruthy(),
    );

    // Fill only ONE proof; leave the other two blank.
    fillProof(container, "sys-prove-trichotomy", "Only this one is written.");
    fireEvent.click(container.querySelector('[data-testid="module-submit"]')!);

    // Only the one substantive proof is queued; blanks are omitted, not reviewable.
    await waitFor(() =>
      expect(container.querySelectorAll('[data-testid="review-save"]').length).toBe(1),
    );

    // Pass the one real proof with a finite score.
    fireEvent.click(container.querySelector<HTMLButtonElement>('[data-testid="review-pass"]')!);
    fireEvent.change(container.querySelector<HTMLInputElement>('[data-testid="review-score"]')!, {
      target: { value: "10" },
    });
    fireEvent.click(container.querySelector<HTMLButtonElement>('[data-testid="review-save"]')!);

    await waitFor(() =>
      expect(container.querySelector('[data-testid="review-queue-empty"]')).toBeTruthy(),
    );
    // The attempt can NEVER be REVIEW_COMPLETE: the two blank proofs are failed omissions.
    expect(
      container.querySelector('[data-testid="review-status"]')!.getAttribute("data-status"),
    ).toBe("REVIEW_FAILED");

    const omitted = Object.values(storedReviews()).filter((r) => r.omitted === true);
    expect(omitted).toHaveLength(2);
    expect(omitted.every((r) => r.state === "scored" && r.passed === false)).toBe(true);
  });
});
