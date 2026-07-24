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

const APPLIED = "systems-elimination-applied";

function fillCoord(scope: HTMLElement, testid: string, value: string) {
  fireEvent.change(scope.querySelector<HTMLInputElement>(`[data-testid="${testid}"]`)!, {
    target: { value },
  });
}

function fillElimGrid(scope: HTMLElement, grid: number[][]) {
  grid.forEach((row, r) =>
    row.forEach((v, c) => fillCoord(scope, `elim-cell-${r}-${c}`, String(v))),
  );
}

function fillConsistentElim(
  scope: HTMLElement,
  grid: number[][],
  pivots: number[],
  freeCount: string,
  particular: string[],
  directions: string[][],
) {
  fillElimGrid(scope, grid);
  fireEvent.click(scope.querySelector<HTMLButtonElement>('[data-testid="elim-consistent"]')!);
  pivots.forEach((p) =>
    fireEvent.click(scope.querySelector<HTMLButtonElement>(`[data-testid="elim-pivot-${p}"]`)!),
  );
  fillCoord(scope, "elim-freecount", freeCount);
  particular.forEach((v, i) => fillCoord(scope, `elim-particular-${i}`, v));
  directions.forEach((dir, di) => {
    fireEvent.click(scope.querySelector<HTMLButtonElement>('[data-testid="elim-add-direction"]')!);
    dir.forEach((v, i) => fillCoord(scope, `elim-direction-${di}-${i}`, v));
  });
}

function fillInconsistentElim(scope: HTMLElement, grid: number[][], classification: string) {
  fillElimGrid(scope, grid);
  fireEvent.click(scope.querySelector<HTMLButtonElement>('[data-testid="elim-inconsistent"]')!);
  fillCoord(scope, "elim-classification", classification);
}

describe("ModuleRunner — Package G elimination set", () => {
  it("captures produced elimination evidence without leaking, grades on submit, replays on reload", async () => {
    const first = renderRunner(<ModuleRunner setId={APPLIED} />);
    const container = first.container;
    await waitFor(() =>
      expect(container.querySelector('[data-exercise="mod-p2-applied-3x3"]')).toBeTruthy(),
    );

    const it3 = container.querySelector<HTMLElement>('[data-exercise="mod-p2-applied-3x3"]')!;
    const itCum = container.querySelector<HTMLElement>(
      '[data-exercise="mod-cumulative-elim-solset"]',
    )!;
    const itRect = container.querySelector<HTMLElement>('[data-exercise="mod-p2-applied-rect"]')!;

    fillConsistentElim(
      it3,
      [
        [1, 0, 1, 2],
        [0, 1, -3, -3],
        [0, 0, 0, 0],
      ],
      [0, 1],
      "1",
      ["2", "-3", "0"],
      [["-1", "3", "1"]],
    );
    fillConsistentElim(
      itCum,
      [
        [1, 0, -1, -2],
        [0, 1, 2, 8],
        [0, 0, 0, 0],
      ],
      [0, 1],
      "1",
      ["-2", "8", "0"],
      [["1", "-2", "1"]],
    );
    // The rectangular system is inconsistent → produce the contradiction row + typed verdict.
    fillInconsistentElim(
      itRect,
      [
        [1, 0, 2],
        [0, 1, 1],
        [0, 0, 2],
      ],
      "inconsistent",
    );

    // Nothing is graded/revealed before submit.
    expect(container.querySelector(".module-runner__feedback[data-state]")).toBeNull();
    expect(container.querySelector('[data-testid="review-status"]')).toBeNull();

    fireEvent.click(container.querySelector('[data-testid="module-submit"]')!);

    await waitFor(() =>
      expect(container.querySelector('[data-testid="review-status"]')).toBeTruthy(),
    );
    // All three auto items graded correct.
    for (const id of [
      "mod-p2-applied-3x3",
      "mod-cumulative-elim-solset",
      "mod-p2-applied-rect",
    ]) {
      const el = container.querySelector<HTMLElement>(`[data-exercise="${id}"]`)!;
      expect(
        el.querySelector(".module-runner__feedback")!.getAttribute("data-state"),
        id,
      ).toBe("correct");
    }
    first.unmount();

    // Reload: a fresh provider replays the released attempt from the snapshot.
    const second = renderRunner(<ModuleRunner setId={APPLIED} />);
    await waitFor(() =>
      expect(second.container.querySelector('[data-testid="review-status"]')).toBeTruthy(),
    );
    const rectReloaded = second.container.querySelector<HTMLElement>(
      '[data-exercise="mod-p2-applied-rect"]',
    )!;
    expect(rectReloaded.textContent).toMatch(/inconsistent|No solution|∅/);
    expect(rectReloaded.querySelector(".module-runner__feedback")!.getAttribute("data-state")).toBe(
      "correct",
    );
    second.unmount();
  });
});
