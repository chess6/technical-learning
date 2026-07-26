import { useEffect, useRef, useState } from "react";
import "./InlineMotionFigure.css";

export interface InlineMotionFigureProps {
  stem: string;
  description: string;
  caption: string;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function initiallyReduced(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.(REDUCED_MOTION_QUERY).matches === true
  );
}

/**
 * A restrained lesson-side loop sourced from a production guided scene.
 *
 * The browser chooses WebM first and MP4 second. Reduced-motion readers receive
 * the poster, while ordinary playback is paused whenever the figure is outside
 * the viewport.
 */
export function InlineMotionFigure({
  stem,
  description,
  caption,
}: InlineMotionFigureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(initiallyReduced);
  const base = `/media/inline-motion/${stem}`;

  useEffect(() => {
    const media = window.matchMedia?.(REDUCED_MOTION_QUERY);
    if (!media) return;
    const update = () => setReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) {
      video?.pause();
      return;
    }

    const setPlayback = (visible: boolean) => {
      if (visible) {
        void video.play().catch(() => {
          // Autoplay policy may defer playback until the browser allows it.
        });
      } else {
        video.pause();
      }
    };

    if (typeof IntersectionObserver === "undefined") {
      setPlayback(true);
      return () => video.pause();
    }

    const observer = new IntersectionObserver(
      ([entry]) => setPlayback(entry?.isIntersecting === true),
      { threshold: 0.2 },
    );
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [reducedMotion]);

  return (
    <figure className="inline-motion-figure">
      {reducedMotion ? (
        <img
          className="inline-motion-figure__media"
          src={`${base}.png`}
          alt={description}
        />
      ) : (
        <video
          ref={videoRef}
          className="inline-motion-figure__media"
          poster={`${base}.png`}
          aria-label={description}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={`${base}.webm`} type="video/webm" />
          <source src={`${base}.mp4`} type="video/mp4" />
        </video>
      )}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function MatrixOriginMotionFigure() {
  return (
    <InlineMotionFigure
      stem="matrix-origin-fixed"
      description="A matrix column and its transformed grid move continuously while the origin remains fixed."
      caption="Keep your eye on the centre dot: the basis and lattice move, but a linear map leaves the origin pinned."
    />
  );
}

export function EliminationIntersectionMotionFigure() {
  return (
    <InlineMotionFigure
      stem="elimination-fixed-intersection"
      description="The second constraint line pivots during a row operation while the solution intersection stays fixed."
      caption="The row changes and its line pivots; the highlighted common solution does not move."
    />
  );
}

export function RedBlackRepairMotionFigure() {
  return (
    <InlineMotionFigure
      stem="red-black-split-recolour"
      description="A 2–3–4 node splits while its binary encoding performs the corresponding red-black colour flip."
      caption="One structural event, two representations: split and promotion on the left, colour flip on the right."
    />
  );
}
