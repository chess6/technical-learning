import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { router } from "../routes";
import { ReviewQueuePage } from "../../pages/ReviewQueuePage";
import { LearnerStateProvider } from "../../platform/useLearnerState";

/**
 * The runner tells a learner their written response is "awaiting review".
 * Before this route existed that was false in production: `ReviewQueue` was
 * reachable only from `dev/review`, which a production build eliminates, so a
 * submitted response stayed pending with nothing able to score it.
 *
 * These tests pin the three things that make the promise true — the route is in
 * the PRODUCTION tree, the queue is reachable, and a completed review changes
 * the attempt's status — plus the honesty constraint: no production copy may
 * imply a remote reviewer or service.
 */

/** Walk the real router config, so this reflects what ships, not a fixture. */
function productionPaths(): string[] {
  const out: string[] = [];
  const walk = (routes: readonly { path?: string; children?: readonly unknown[] }[]) => {
    for (const route of routes) {
      if (route.path) out.push(route.path);
      if (route.children) walk(route.children as { path?: string }[]);
    }
  };
  walk(router.routes as { path?: string; children?: readonly unknown[] }[]);
  return out;
}

describe("the review queue is reachable in production", () => {
  it("registers /review in the production route tree", () => {
    expect(productionPaths()).toContain("review");
  });

  it("does not rely on the dev-only route, which a production build drops", () => {
    // `dev/*` routes are conditional on import.meta.env.DEV. Whatever their
    // state in this environment, "review" must stand on its own.
    const paths = productionPaths();
    const nonDevReview = paths.filter((p) => p === "review");
    expect(nonDevReview).toHaveLength(1);
  });
});

describe("review-queue page copy is honest about what happens", () => {
  function renderQueue() {
    return render(
      <MemoryRouter>
        <LearnerStateProvider>
          <ReviewQueuePage />
        </LearnerStateProvider>
      </MemoryRouter>,
    );
  }

  it("says responses stay on this device and are not sent anywhere", () => {
    const { container } = renderQueue();
    const text = container.textContent ?? "";
    expect(text).toMatch(/on this device/i);
    expect(text).toMatch(/not sent anywhere/i);
  });

  it("says a response stays pending until someone scores it here", () => {
    const { container } = renderQueue();
    expect(container.textContent ?? "").toMatch(/stays pending until someone opens this page/i);
  });

  it("states plainly that a local pass is not independently certified mastery", () => {
    const { container } = renderQueue();
    expect(container.textContent ?? "").toMatch(
      /self-administered judgment, not independently certified mastery/i,
    );
  });

  it("promises no remote instructor, service, or automatic delivery", () => {
    const { container } = renderQueue();
    const text = (container.textContent ?? "").toLowerCase();
    // The page may DENY these things; it must never assert them.
    expect(text).not.toMatch(/will be reviewed by an instructor/);
    expect(text).not.toMatch(/sent to your instructor/);
    expect(text).not.toMatch(/submitted for grading/);
    expect(text).not.toMatch(/we will review/);
  });
});

/**
 * NOTE ON SCOPE: the pending -> scored TRANSITION is covered end to end by
 * `e2e/module-set-production-route.spec.ts` ("a written response submitted on a
 * production node can be scored at /review"), which submits real answers,
 * follows the pending link, scores in the queue and asserts the attempt reaches
 * REVIEW_COMPLETE. This file deliberately does NOT duplicate that; seeding a
 * realistic attempt in jsdom would test the fixture more than the code. What it
 * checks here is only that the queue MOUNTS in a production render with an
 * empty state that reads as empty rather than broken.
 */
describe("the queue mounts in production with an honest empty state", () => {
  it("renders the queue region and says there is nothing to review", async () => {
    render(
      <MemoryRouter initialEntries={["/review"]}>
        <LearnerStateProvider>
          <Routes>
            <Route path="/review" element={<ReviewQueuePage />} />
          </Routes>
        </LearnerStateProvider>
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByLabelText("Review queue")).toBeTruthy();
    });
    // An empty queue must SAY it is empty, not render a bare shell.
    expect(document.body.textContent ?? "").toMatch(/no responses awaiting review/i);
  });
});

describe("no production surface promises an unavailable remote review service", () => {
  it("the module-set beta banner describes local scoring, not remote grading", async () => {
    const { ModuleSetPage } = await import("../../pages/ModuleSetPage");
    render(
      <MemoryRouter initialEntries={["/set/systems-elimination-transfer"]}>
        <LearnerStateProvider>
          <Routes>
            <Route path="/set/:setId" element={<ModuleSetPage />} />
          </Routes>
        </LearnerStateProvider>
      </MemoryRouter>,
    );
    const text = (document.body.textContent ?? "").toLowerCase();
    expect(text).toMatch(/on this device/);
    // The precise former claim, which had no production fulfilment.
    expect(text).not.toMatch(/scored by\s+a human after you submit/);
  });
});
