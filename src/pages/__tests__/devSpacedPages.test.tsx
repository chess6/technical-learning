import { afterEach, describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { LearnerStateProvider } from "../../platform/useLearnerState";
import { STORAGE_KEY } from "../../platform/persistence";
import { asExerciseId, SCHEMA_VERSION } from "../../platform/identity";
import {
  createEmptyLearnerState,
  makeAttemptSet,
  makeScheduledSpacedReview,
  makeSpacedCohort,
  type LearnerState,
  type ScheduledSpacedReview,
} from "../../platform/learnerState";
import { deriveStableKey, SPACED_DELAY_DAYS, SPACED_ITEMS, SPACED_MODULE_ID } from "../../platform/spacedConfig";
import { DevSpacedRunnerPage } from "../DevSpacedRunnerPage";
import { DevModuleRunnerPage } from "../DevModuleRunnerPage";

afterEach(() => localStorage.clear());

const DAY = 86_400_000;
const ANCHOR = "attempt-anchor";

/** Seed a fully-valid v3 state anchored `daysAgo` in the past (so 7-day is due). */
function seedCohort(daysAgo: number) {
  const releasedAt = new Date(Date.now() - daysAgo * DAY).toISOString();
  const anchor = {
    ...makeAttemptSet({
      id: ANCHOR,
      setId: "systems-elimination-review",
      setVersion: 1,
      moduleId: SPACED_MODULE_ID,
      mode: "exam" as const,
      items: [],
    }),
    status: "released" as const,
    submittedAt: releasedAt,
    releasedAt,
  };
  const spacedReviews: Record<string, ScheduledSpacedReview> = {};
  for (const { setId, exerciseId } of SPACED_ITEMS) {
    for (const delayDays of SPACED_DELAY_DAYS) {
      const occ = makeScheduledSpacedReview({
        moduleId: SPACED_MODULE_ID,
        exerciseId: asExerciseId(exerciseId),
        delayDays,
        setId,
        originAttemptSetId: ANCHOR,
        anchorReleasedAt: releasedAt,
      });
      spacedReviews[occ.id] = occ;
    }
  }
  const state: LearnerState = {
    ...createEmptyLearnerState(),
    schemaVersion: SCHEMA_VERSION,
    attemptSets: { [ANCHOR]: anchor },
    spacedReviews,
    spacedCohorts: {
      [SPACED_MODULE_ID]: makeSpacedCohort({
        moduleId: SPACED_MODULE_ID,
        status: "seeded",
        anchorAttemptSetId: ANCHOR,
        anchorReleasedAt: releasedAt,
      }),
    },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderSpacedRoute(id: string, children: ReactNode) {
  return render(
    <LearnerStateProvider>
      <MemoryRouter initialEntries={[`/dev/spaced/${id}`]}>
        <Routes>
          <Route path="/dev/spaced/:scheduledReviewId" element={children} />
        </Routes>
      </MemoryRouter>
    </LearnerStateProvider>,
  );
}

const trichotomy7 = deriveStableKey(SPACED_MODULE_ID, "mod-spaced-trichotomy", 7);
const trichotomy30 = deriveStableKey(SPACED_MODULE_ID, "mod-spaced-trichotomy", 30);

describe("DevSpacedRunnerPage guards", () => {
  it("mounts the runner for a DUE occurrence", async () => {
    seedCohort(10); // anchored 10 days ago → 7-day occurrence is due
    const { container } = renderSpacedRoute(trichotomy7, <DevSpacedRunnerPage />);
    await waitFor(() =>
      expect(container.querySelector('[data-testid="module-submit"]')).toBeTruthy(),
    );
  });

  it("blocks a NOT-YET-DUE occurrence (30-day) and mounts no runner", async () => {
    seedCohort(10); // 30-day dueAt = now + 20 days → not due
    const { container } = renderSpacedRoute(trichotomy30, <DevSpacedRunnerPage />);
    await waitFor(() =>
      expect(container.querySelector('[data-testid="spaced-not-due"]')).toBeTruthy(),
    );
    expect(container.querySelector('[data-testid="module-submit"]')).toBeNull();
  });

  it("shows not-found for an unknown occurrence id", async () => {
    seedCohort(10);
    const { container } = renderSpacedRoute("spaced:bogus", <DevSpacedRunnerPage />);
    await waitFor(() =>
      expect(container.querySelector('[data-testid="spaced-not-found"]')).toBeTruthy(),
    );
  });
});

function renderModuleRoute(setId: string) {
  return render(
    <LearnerStateProvider>
      <MemoryRouter initialEntries={[`/dev/module/${setId}`]}>
        <Routes>
          <Route path="/dev/module/:setId" element={<DevModuleRunnerPage />} />
        </Routes>
      </MemoryRouter>
    </LearnerStateProvider>,
  );
}

describe("DevModuleRunnerPage rejects spaced sets (no early preview)", () => {
  it("rejects a spaced set id on the generic route", async () => {
    const { container } = renderModuleRoute("systems-elimination-spaced-trichotomy");
    await waitFor(() =>
      expect(container.querySelector('[data-testid="spaced-rejected"]')).toBeTruthy(),
    );
    expect(container.querySelector('[data-testid="module-submit"]')).toBeNull();
  });

  it("still renders a normal primary set", async () => {
    const { container } = renderModuleRoute("systems-elimination-review");
    await waitFor(() =>
      expect(container.querySelector('[data-testid="module-submit"]')).toBeTruthy(),
    );
  });
});
