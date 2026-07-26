import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InlineMotionFigure } from "../InlineMotionFigure";

let intersectionCallback: IntersectionObserverCallback;
const observe = vi.fn();
const disconnect = vi.fn();

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersectionCallback = callback;
      }
      observe = observe;
      disconnect = disconnect;
      unobserve = vi.fn();
      takeRecords = () => [];
      root = null;
      rootMargin = "";
      thresholds = [];
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  observe.mockReset();
  disconnect.mockReset();
});

function setReducedMotion(matches: boolean) {
  vi.stubGlobal("matchMedia", () => ({
    matches,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("InlineMotionFigure", () => {
  it("offers WebM first, MP4 fallback, a poster, and inline muted looping", () => {
    setReducedMotion(false);
    render(
      <InlineMotionFigure
        stem="sample"
        description="Accessible motion"
        caption="Inspect the motion."
      />,
    );
    const video = screen.getByLabelText("Accessible motion");
    expect(video.getAttribute("poster")).toBe(
      "/media/inline-motion/sample.png",
    );
    expect(video.hasAttribute("playsinline")).toBe(true);
    expect(video.hasAttribute("loop")).toBe(true);
    expect((video as HTMLVideoElement).muted).toBe(true);
    expect(video.querySelectorAll("source")[0]!.getAttribute("src")).toBe(
      "/media/inline-motion/sample.webm",
    );
    expect(video.querySelectorAll("source")[1]!.getAttribute("src")).toBe(
      "/media/inline-motion/sample.mp4",
    );
  });

  it("pauses offscreen and resumes when visible", () => {
    setReducedMotion(false);
    const play = vi.mocked(HTMLMediaElement.prototype.play);
    const pause = vi.mocked(HTMLMediaElement.prototype.pause);
    render(
      <InlineMotionFigure
        stem="sample"
        description="Accessible motion"
        caption="Inspect the motion."
      />,
    );
    const target = screen.getByLabelText("Accessible motion");
    act(() =>
      intersectionCallback(
        [
          {
            isIntersecting: false,
            target,
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      ),
    );
    expect(pause).toHaveBeenCalled();
    act(() =>
      intersectionCallback(
        [
          {
            isIntersecting: true,
            target,
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      ),
    );
    expect(play).toHaveBeenCalled();
  });

  it("shows the accessible static poster instead under reduced motion", () => {
    setReducedMotion(true);
    render(
      <InlineMotionFigure
        stem="sample"
        description="Accessible poster"
        caption="Inspect the still."
      />,
    );
    expect(screen.queryByLabelText("Accessible motion")).toBeNull();
    expect(screen.getByAltText("Accessible poster").getAttribute("src")).toBe(
      "/media/inline-motion/sample.png",
    );
  });
});
