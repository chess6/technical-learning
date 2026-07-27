import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { EigenClipStage } from "../EigenClipStage";
import { Eigen3DExtension } from "../threeD/Eigen3DExtension";
import {
  getPlaybackBeats,
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

describe("playback beats semantic map", () => {
  it("aligns derivation scene ids with major ladder rungs", () => {
    const beats = getPlaybackBeats("eigenvectors-derivation");
    expect(beats?.map((beat) => beat.id)).toEqual([
      "defining",
      "gather",
      "factor",
      "nonzero",
      "singular",
      "predict",
      "determinant",
      "expand",
      "roots",
      "eigenspaces",
    ]);
  });

  it("maps algebraic steps without a 3D analog to the nearest meaningful state", () => {
    // `expand` is pure algebra — the polynomial — so the 3D view holds the
    // last state that had a spatial meaning: the shifted map's collapse.
    const nearest = resolveThreeDStep("eigenvectors-derivation", "expand");
    expect(nearest?.threeD).toBe("shift-collapse");
    expect(nearest?.id).toBe("determinant");
  });

  it("keeps invariant-line interpretation for Av = λv", () => {
    const step = resolveThreeDStep("eigenvectors-derivation", "defining");
    expect(step?.threeD).toBe("invariant-line");
  });

  it("carries playback metadata only — an equation and a short label, no prose", () => {
    const beats = getPlaybackBeats("eigenvectors-derivation");
    expect(beats).toBeTruthy();
    for (const beat of beats!) {
      expect(beat.equation.length).toBeGreaterThan(0);
      expect(beat.label.length).toBeGreaterThan(0);
      // The discarded five-field / caption template must not creep back in.
      expect(Object.keys(beat)).toEqual(["id", "equation", "label", "threeD"]);
    }
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
    // Expand remounts the player; 2D derivation should autoplay in the modal.
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Pause" }),
      ).toBeTruthy();
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

  it("shows derivation steps inline and in the expand modal, seeking on click", async () => {
    render(
      <EigenClipStage
        sceneId="eigenvectors-derivation"
        title="Computing eigenvectors"
      />,
    );

    // The playback-linked step nav renders on the default page too — clicking
    // a derivation step must work without opening Expand.
    const inlineNav = screen.getByTestId("derivation-step-nav");
    expect(
      inlineNav.closest('[data-testid="eigen-clip-inline"]'),
    ).toBeTruthy();

    const inlineFactor = inlineNav.querySelector(
      '[data-step-id="factor"] button',
    ) as HTMLButtonElement | null;
    expect(inlineFactor).toBeTruthy();
    await act(async () => {
      fireEvent.click(inlineFactor!);
    });
    await waitFor(() => {
      expect(
        screen.getByTestId("eigen-clip-stage").getAttribute("data-major-step"),
      ).toBe("factor");
    });
    expect(
      inlineNav
        .querySelector('[data-step-id="factor"]')
        ?.getAttribute("data-active"),
    ).toBe("true");

    // Return to the first beat so the modal assertions below are unchanged.
    const inlineDefining = screen
      .getByTestId("derivation-step-nav")
      .querySelector('[data-step-id="defining"] button') as HTMLButtonElement;
    await act(async () => {
      fireEvent.click(inlineDefining);
    });
    await waitFor(() => {
      expect(
        screen.getByTestId("eigen-clip-stage").getAttribute("data-major-step"),
      ).toBe("defining");
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("eigen-expand-clip"));
    });
    const modal = await screen.findByTestId("eigen-clip-modal");
    expect(modal.getAttribute("data-major-step")).toBe("defining");
    // Single renderer, single nav: the inline one unmounts while expanded.
    expect(screen.getAllByTestId("derivation-step-nav")).toHaveLength(1);

    const factor = modal.querySelector(
      '[data-step-id="factor"] button',
    ) as HTMLButtonElement | null;
    expect(factor).toBeTruthy();
    await act(async () => {
      fireEvent.click(factor!);
    });
    await waitFor(() => {
      expect(
        screen.getByTestId("eigen-clip-modal").getAttribute("data-major-step"),
      ).toBe("factor");
    });
    // Nav is playback metadata: the selected beat is marked active. No captions.
    expect(
      modal
        .querySelector('[data-step-id="factor"]')
        ?.getAttribute("data-active"),
    ).toBe("true");

    await act(async () => {
      fireEvent.click(screen.getByTestId("eigen-clip-modal-close"));
    });
    await waitFor(() => {
      expect(
        screen.getByTestId("eigen-clip-stage").getAttribute("data-major-step"),
      ).toBe("factor");
    });
    // Back inline: the nav is still there and still marks the active beat.
    const navAfterClose = screen.getByTestId("derivation-step-nav");
    expect(
      navAfterClose.closest('[data-testid="eigen-clip-inline"]'),
    ).toBeTruthy();
    expect(
      navAfterClose
        .querySelector('[data-step-id="factor"]')
        ?.getAttribute("data-active"),
    ).toBe("true");
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
        position={{ majorStepId: "defining" }}
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
        position={{ majorStepId: "defining" }}
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
