import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { LearnerStateProvider } from "../../../platform/useLearnerState";
import {
  registerScheduler,
  resetScheduler,
  type SchedulerHook,
} from "../../../platform/scheduler";
import { ModuleRunner } from "../ModuleRunner";
import { loadLearnerState, saveLearnerState } from "../../../platform/persistence";
import {
  createEmptyLearnerState,
  makeAttemptSet,
  type AttemptSet,
} from "../../../platform/learnerState";
import { resolveModuleSet } from "../../../lessons/moduleSets";
import { snapshotItem } from "../../../lessons/attemptSnapshot";
import { computeSpacedSchedule } from "../../../lessons/spacedSchedule";
import { SPACED_COHORT_SIZE, SPACED_MODULE_ID } from "../../../platform/spacedConfig";

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
    const hook: SchedulerHook = { onAttemptReleased };
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

describe("ModuleRunner — Package H spacing (primary release seeds a cohort atomically)", () => {
  it("seeds one cohort + six occurrences on the first eligible primary release", async () => {
    const onAttemptReleased = vi.fn((s: Parameters<SchedulerHook["onAttemptReleased"]>[0]) => ({
      scheduled: computeSpacedSchedule(s),
    }));
    registerScheduler({ onAttemptReleased });

    const { container } = renderRunner(<ModuleRunner setId={SET} />);
    await waitFor(() =>
      expect(container.querySelector('[data-testid="module-submit"]')).toBeTruthy(),
    );
    fireEvent.click(container.querySelector('[data-testid="module-submit"]')!);
    await waitFor(() =>
      expect(container.querySelector('[data-testid="review-status"]')).toBeTruthy(),
    );

    expect(onAttemptReleased).toHaveBeenCalledTimes(1);
    const outcome = loadLearnerState();
    expect(outcome.kind).toBe("loaded");
    if (outcome.kind !== "loaded") return;
    expect(outcome.state.spacedCohorts[SPACED_MODULE_ID]?.status).toBe("seeded");
    expect(Object.keys(outcome.state.spacedReviews)).toHaveLength(SPACED_COHORT_SIZE);
  });

  it("does NOT invoke the scheduler on a LATER primary release once a cohort exists", async () => {
    const onAttemptReleased = vi.fn((s: Parameters<SchedulerHook["onAttemptReleased"]>[0]) => ({
      scheduled: computeSpacedSchedule(s),
    }));
    registerScheduler({ onAttemptReleased });

    // First primary release seeds the cohort.
    const first = renderRunner(<ModuleRunner setId={SET} />);
    await waitFor(() =>
      expect(first.container.querySelector('[data-testid="module-submit"]')).toBeTruthy(),
    );
    fireEvent.click(first.container.querySelector('[data-testid="module-submit"]')!);
    await waitFor(() =>
      expect(first.container.querySelector('[data-testid="review-status"]')).toBeTruthy(),
    );
    expect(onAttemptReleased).toHaveBeenCalledTimes(1);
    first.unmount();

    // A DIFFERENT primary set releases later — the module-wide gate must skip the hook.
    const second = renderRunner(<ModuleRunner setId="systems-elimination-transfer" />);
    await waitFor(() =>
      expect(second.container.querySelector('[data-testid="module-submit"]')).toBeTruthy(),
    );
    fireEvent.click(second.container.querySelector('[data-testid="module-submit"]')!);
    await waitFor(() =>
      expect(second.container.querySelector('[data-testid="review-status"]')).toBeTruthy(),
    );
    expect(onAttemptReleased).toHaveBeenCalledTimes(1); // still once — never re-invoked
    const outcome = loadLearnerState();
    if (outcome.kind === "loaded") {
      expect(Object.keys(outcome.state.spacedReviews)).toHaveLength(SPACED_COHORT_SIZE);
    }
    second.unmount();
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

const MOCK_SET = "systems-elimination-mock";

describe("ModuleRunner — Package I timed mock", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders no countdown for an untimed set", async () => {
    const { container } = renderRunner(<ModuleRunner setId={SET} />);
    await waitFor(() =>
      expect(container.querySelector('[data-exercise="sys-count-none"]')).toBeTruthy(),
    );
    expect(container.querySelector('[data-testid="mock-countdown"]')).toBeNull();
  });

  it("renders the countdown for a timed set", async () => {
    const { container } = renderRunner(<ModuleRunner setId={MOCK_SET} />);
    await waitFor(() =>
      expect(container.querySelector('[data-exercise="mod-mock-compute"]')).toBeTruthy(),
    );
    const countdown = container.querySelector('[data-testid="mock-countdown"]');
    expect(countdown).toBeTruthy();
    expect(countdown!.textContent).toMatch(/Time remaining:/);
  });

  it("auto-submits once the deadline passes and marks the attempt auto-submitted", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const { container } = renderRunner(<ModuleRunner setId={MOCK_SET} />);
    // Flush the mount effect that creates the attempt (its `startedAt` is pinned
    // to the fake "now" set above) without advancing the fake clock itself.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(container.querySelector('[data-exercise="mod-mock-compute"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="mock-countdown"]')).toBeTruthy();

    // Past the 1200s (20 min) time limit — the 1 Hz clock ticks forward and the
    // runner auto-submits exactly once.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_201_000);
    });

    expect(container.querySelector('[data-testid="review-status"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="mock-auto-submitted"]')).toBeTruthy();
  });

  it("a manual submit before the deadline leaves no auto-submitted marker", async () => {
    const { container } = renderRunner(<ModuleRunner setId={MOCK_SET} />);
    await waitFor(() =>
      expect(container.querySelector('[data-testid="module-submit"]')).toBeTruthy(),
    );
    expect(container.querySelector('[data-testid="mock-countdown"]')).toBeTruthy();

    fireEvent.click(container.querySelector('[data-testid="module-submit"]')!);
    await waitFor(() =>
      expect(container.querySelector('[data-testid="review-status"]')).toBeTruthy(),
    );
    expect(container.querySelector('[data-testid="mock-auto-submitted"]')).toBeNull();
  });

  /* ── Timer integrity (review findings 1 + 2) ───────────────────────────── */

  /** Seed a live timed attempt straight into storage, as a reload/import would. */
  function seedTimedAttempt(overrides: Partial<AttemptSet> = {}): AttemptSet {
    const { set, items } = resolveModuleSet(MOCK_SET);
    const attempt: AttemptSet = {
      ...makeAttemptSet({
        setId: set.id,
        setVersion: set.version,
        moduleId: set.moduleId,
        mode: set.mode,
        items: items.map(snapshotItem),
        id: "attempt-seeded",
        timeLimitSec: set.timeLimitSec,
      }),
      ...overrides,
    };
    saveLearnerState({
      ...createEmptyLearnerState(),
      attemptSets: { [attempt.id]: attempt },
    });
    return attempt;
  }

  /** Every persisted attempt (a real reload reads exactly these bytes). */
  function allAttempts(): AttemptSet[] {
    const outcome = loadLearnerState();
    return outcome.kind === "loaded" ? Object.values(outcome.state.attemptSets) : [];
  }

  /** The single persisted attempt — asserts there is exactly one. */
  function onlyAttempt(): AttemptSet | undefined {
    const all = allAttempts();
    expect(all).toHaveLength(1);
    return all[0];
  }

  it("snapshots the set's time limit onto a NEW attempt (finding 1)", async () => {
    const { container } = renderRunner(<ModuleRunner setId={MOCK_SET} />);
    await waitFor(() =>
      expect(container.querySelector('[data-testid="module-submit"]')).toBeTruthy(),
    );
    // Persisted at creation, so a reload re-reads the ADMINISTERED limit.
    expect(onlyAttempt()!.timeLimitSec).toBe(1200);
  });

  it("is governed by the attempt's snapshotted limit, not the registry's (finding 1)", async () => {
    // The registry says 1200s; this running attempt was started under 120s. The
    // countdown must reflect the ADMINISTERED limit — a registry edit can never
    // hand a running attempt more (or less) time.
    seedTimedAttempt({ timeLimitSec: 120 });
    const { container } = renderRunner(<ModuleRunner setId={MOCK_SET} />);
    await waitFor(() =>
      expect(container.querySelector('[data-testid="mock-countdown"]')).toBeTruthy(),
    );
    const text = container.querySelector('[data-testid="mock-countdown"]')!.textContent ?? "";
    expect(text).toMatch(/Time remaining: (2:00|1:5\d)/);
  });

  it("treats a click AT/AFTER the deadline as an automatic submission (finding 2)", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const { container } = renderRunner(<ModuleRunner setId={MOCK_SET} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    // Jump the wall clock past the deadline WITHOUT letting the 1 Hz tick run:
    // the countdown is stale and the button is still enabled — exactly the race a
    // throttled/background tab produces. The click must still count as automatic.
    vi.setSystemTime(new Date(Date.parse("2026-01-01T00:00:00.000Z") + 1200 * 1000));
    const button = container.querySelector<HTMLButtonElement>('[data-testid="module-submit"]')!;
    expect(button.disabled).toBe(false);
    await act(async () => {
      fireEvent.click(button);
    });

    expect(container.querySelector('[data-testid="review-status"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="mock-auto-submitted"]')).toBeTruthy();
    const persisted = onlyAttempt()!;
    expect(persisted.autoSubmittedAt).toBeTruthy();
    expect(persisted.autoSubmittedAt).toBe(persisted.releasedAt);
  });

  it("keeps a manual submit one second BEFORE the deadline manual (finding 2)", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const { container } = renderRunner(<ModuleRunner setId={MOCK_SET} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    vi.setSystemTime(new Date(Date.parse("2026-01-01T00:00:00.000Z") + 1199 * 1000));
    await act(async () => {
      fireEvent.click(container.querySelector('[data-testid="module-submit"]')!);
    });

    expect(container.querySelector('[data-testid="review-status"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="mock-auto-submitted"]')).toBeNull();
    expect(onlyAttempt()!.autoSubmittedAt).toBeUndefined();
  });

  it("closes manual submission once expiration is observed (finding 2)", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const { container } = renderRunner(<ModuleRunner setId={MOCK_SET} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(container.querySelector('[data-testid="module-submit"]')).toBeTruthy();

    // Once the tick observes the deadline, the manual control is gone entirely
    // (the attempt auto-submitted). No second submission is possible.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_201_000);
    });
    expect(container.querySelector('[data-testid="module-submit"]')).toBeNull();
    expect(container.querySelector('[data-testid="mock-auto-submitted"]')).toBeTruthy();

    // Exactly one submission, one release.
    expect(onlyAttempt()!.status).toBe("released");
  });

  it("auto-submits an ALREADY-expired attempt on reload, exactly once (findings 2 + 3)", async () => {
    // A reload long after the deadline: elapsed time is honest from `startedAt`,
    // so the attempt releases immediately as an automatic submission.
    const started = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    const seeded = seedTimedAttempt({ startedAt: started });

    const { container } = renderRunner(<ModuleRunner setId={MOCK_SET} />);
    await waitFor(() =>
      expect(container.querySelector('[data-testid="review-status"]')).toBeTruthy(),
    );
    expect(container.querySelector('[data-testid="mock-auto-submitted"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="module-submit"]')).toBeNull();

    // No fresh attempt was started alongside the recovered one, and the release
    // is PERSISTED (not memory-only) — the next reload sees a finished attempt.
    const persisted = onlyAttempt()!;
    expect(persisted.id).toBe(seeded.id);
    expect(persisted.status).toBe("released");
    expect(persisted.autoSubmittedAt).toBeTruthy();
  });

  it("keeps a blank required proof a recorded omission (never REVIEW_COMPLETE) after an auto-submitted timeout", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const { container } = renderRunner(<ModuleRunner setId={MOCK_SET} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    // The proof (`mod-mock-proof`) is left blank throughout — never answered.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_201_000);
    });

    const status = container.querySelector('[data-testid="review-status"]');
    expect(status).toBeTruthy();
    expect(status!.getAttribute("data-status")).toBe("REVIEW_FAILED");
  });
});
