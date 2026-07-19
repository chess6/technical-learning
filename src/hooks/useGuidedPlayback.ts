import { useCallback, useEffect, useRef, useState } from "react";

/**
 * True when `element` is substantially visible in the viewport.
 * Used to gate guided-scene autoplay.
 */
export function useSubstantialVisibility(
  element: HTMLElement | null,
  threshold = 0.55,
): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!element || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setVisible(entry.isIntersecting && entry.intersectionRatio >= threshold);
      },
      { threshold: [0, threshold, 1] },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, threshold]);

  return visible;
}

/** Whether developer diagnostics should appear in the learner UI. */
export function useShowGuidedDebug(): boolean {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("debug") === "1" || params.get("debug") === "true";
    const fromStorage =
      window.localStorage?.getItem("guidedSceneDebug") === "1";
    setShow(fromQuery || fromStorage);
  }, []);
  return show;
}

/**
 * Tracks whether autoplay has already fired for this mount.
 * Survives harmless re-renders; resets when the component remounts
 * (navigating away and back remounts the player → autoplay once again).
 */
export function useAutoplayOnceGuard(): {
  hasFired: () => boolean;
  markFired: () => void;
  reset: () => void;
} {
  const fired = useRef(false);
  const hasFired = useCallback(() => fired.current, []);
  const markFired = useCallback(() => {
    fired.current = true;
  }, []);
  const reset = useCallback(() => {
    fired.current = false;
  }, []);
  return { hasFired, markFired, reset };
}
