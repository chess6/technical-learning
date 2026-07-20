import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { EigenClipStage } from "../EigenClipStage";
import { Eigen3DExtension } from "../threeD/Eigen3DExtension";
import {
  getDerivationSteps,
  resolveThreeDStep,
} from "../../../guided-scenes/scenes/derivationSteps";
import {
  guidedSceneDebug,
  instrumentation,
} from "../../../guided-scenes/engine/instrumentation";
import { SvgFallbackEngine } from "../../../guided-scenes/engine/SvgFallbackEngine";

vi.mock("../../../guided-scenes/registry", () => ({
  getGuidedSceneFactory:
    (sceneId: string) => (options: { reducedMotion?: boolean }) =>
      new SvgFallbackEngine({
        ...options,
        sceneId,
      }),
}));

describe("derivationSteps semantic map", () => {
  it("aligns derivation scene ids with major ladder rungs", () => {
    const steps = getDerivationSteps("eigenvectors-derivation");
    expect(steps?.map((step) => step.id)).toEqual([
      "recap",
      "shift",
      "charpoly",
      "solveLambda",
      "solveV",
      "interpret",
    ]);
  });

  it("maps algebraic steps without a 3D analog to the nearest meaningful state", () => {
    const nearest = resolveThreeDStep(
      "eigenvectors-derivation",
      "solveLambda",
    );
    expect(nearest?.threeD).toBe("shift-collapse");
    expect(nearest?.id).toBe("charpoly");
  });

  it("keeps invariant-line interpretation for Av = λv", () => {
    const step = resolveThreeDStep("eigenvectors-derivation", "recap");
    expect(step?.threeD).toBe("invariant-line");
  });
});

describe("EigenClipStage", () => {
  beforeEach(() => {
    instrumentation.reset();
  });

  it("labels 2D derivation vs See it in 3D without a bare equivalence toggle", () => {
    render(
      <EigenClipStage
        sceneId="eigenvectors-derivation"
        title="Computing eigenvectors"
        forceUnavailable3d
      />,
    );
    expect(
      screen.getByRole("button", { name: "2D derivation" }).getAttribute(
        "aria-pressed",
      ),
    ).toBe("true");
    expect(screen.getByRole("button", { name: "See it in 3D" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^2D \/ 3D$/i })).toBeNull();
  });

  it("opens the 3D extension and shows non-equivalence note", async () => {
    render(
      <EigenClipStage
        sceneId="eigenvectors-derivation"
        title="Computing eigenvectors"
        forceUnavailable3d
      />,
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId("eigen-see-3d"));
    });
    await waitFor(() => {
      expect(
        screen.getByTestId("eigen-clip-stage").getAttribute("data-mode"),
      ).toBe("extension");
    });
    expect(screen.getByText(/different 3×3 example/i)).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByTestId("eigen-3d-fallback")).toBeTruthy();
    });
  });

  it("opens and closes the expand modal; Escape closes; only one inline renderer", async () => {
    render(
      <EigenClipStage
        sceneId="eigenvectors-derivation"
        title="Computing eigenvectors"
      />,
    );

    expect(screen.getByTestId("eigen-clip-inline")).toBeTruthy();
    expect(instrumentation.snapshot().activeEngines).toBe(1);

    await act(async () => {
      fireEvent.click(screen.getByTestId("eigen-expand-clip"));
    });
    await waitFor(() => {
      expect(screen.getByTestId("eigen-clip-modal")).toBeTruthy();
    });
    expect(screen.queryByTestId("eigen-clip-inline")).toBeNull();
    expect(
      screen.getByTestId("eigen-clip-stage").getAttribute("data-expanded"),
    ).toBe("true");

    await waitFor(() => {
      expect(instrumentation.snapshot().activeEngines).toBe(1);
    });

    await act(async () => {
      fireEvent.keyDown(document, { key: "Escape" });
    });
    await waitFor(() => {
      expect(screen.queryByTestId("eigen-clip-modal")).toBeNull();
    });
    expect(screen.getByTestId("eigen-clip-inline")).toBeTruthy();
  });

  it("closes on backdrop click and restores focus to Expand", async () => {
    render(
      <EigenClipStage
        sceneId="eigenvectors-derivation"
        title="Computing eigenvectors"
      />,
    );
    const expand = screen.getByTestId("eigen-expand-clip");
    await act(async () => {
      fireEvent.click(expand);
    });
    await waitFor(() => {
      expect(screen.getByTestId("eigen-clip-modal")).toBeTruthy();
    });
    await act(async () => {
      fireEvent.mouseDown(screen.getByTestId("eigen-clip-modal-backdrop"));
    });
    await waitFor(() => {
      expect(screen.queryByTestId("eigen-clip-modal")).toBeNull();
    });
    expect(document.activeElement).toBe(expand);
  });

  it("shows derivation steps only in the expand modal and seeks on click", async () => {
    render(
      <EigenClipStage
        sceneId="eigenvectors-derivation"
        title="Computing eigenvectors"
      />,
    );

    // Main page already has notebook steps — no duplicate nav inline.
    expect(screen.queryByTestId("derivation-step-nav")).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByTestId("eigen-expand-clip"));
    });
    const modal = await screen.findByTestId("eigen-clip-modal");
    expect(modal.getAttribute("data-major-step")).toBe("recap");
    expect(screen.getByTestId("derivation-step-nav")).toBeTruthy();

    const shift = modal.querySelector(
      '[data-step-id="shift"] button',
    ) as HTMLButtonElement | null;
    expect(shift).toBeTruthy();
    await act(async () => {
      fireEvent.click(shift!);
    });
    await waitFor(() => {
      expect(
        screen.getByTestId("eigen-clip-modal").getAttribute("data-major-step"),
      ).toBe("shift");
    });
    expect(screen.getByText(/sent to zero/i)).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByTestId("eigen-clip-modal-close"));
    });
    await waitFor(() => {
      expect(
        screen.getByTestId("eigen-clip-stage").getAttribute("data-major-step"),
      ).toBe("shift");
    });
    expect(screen.queryByTestId("derivation-step-nav")).toBeNull();
  });

  it("disposes engines cleanly after open/close cycles", async () => {
    const { unmount } = render(
      <EigenClipStage
        sceneId="eigenvectors-derivation"
        title="Computing eigenvectors"
      />,
    );

    for (let i = 0; i < 3; i += 1) {
      await act(async () => {
        fireEvent.click(screen.getByTestId("eigen-expand-clip"));
      });
      await waitFor(() => {
        expect(screen.getByTestId("eigen-clip-modal")).toBeTruthy();
      });
      await act(async () => {
        fireEvent.click(screen.getByTestId("eigen-clip-modal-close"));
      });
      await waitFor(() => {
        expect(screen.queryByTestId("eigen-clip-modal")).toBeNull();
      });
    }

    expect(instrumentation.snapshot().activeEngines).toBe(1);
    unmount();
    expect(instrumentation.snapshot().activeEngines).toBe(0);
    expect(guidedSceneDebug.isClean()).toBe(true);
  });
});

describe("Eigen3DExtension fallback", () => {
  it("shows WebGL-unavailable fallback when forced", () => {
    render(
      <Eigen3DExtension
        sceneId="eigenvectors-derivation"
        position={{ majorStepId: "recap" }}
        forceUnavailable
      />,
    );
    expect(screen.getByTestId("eigen-3d-fallback")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry 3D" })).toBeTruthy();
  });

  it("exposes Reset view when WebGL is available (or still mounts controls shell)", () => {
    render(
      <Eigen3DExtension
        sceneId="eigenvectors-derivation"
        position={{ majorStepId: "recap" }}
      />,
    );
    const fallback = screen.queryByTestId("eigen-3d-fallback");
    const extension = screen.queryByTestId("eigen-3d-extension");
    expect(fallback || extension).toBeTruthy();
    if (extension) {
      expect(screen.getByTestId("eigen-3d-reset-view")).toBeTruthy();
    }
  });
});
