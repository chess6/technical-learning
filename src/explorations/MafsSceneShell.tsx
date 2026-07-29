import type { ReactNode } from "react";
import { Mafs, Coordinates } from "mafs";
import "mafs/core.css";
import "./MafsSceneShell.css";

export type MafsViewBox = {
  x?: [number, number];
  y?: [number, number];
  padding?: number;
};

export type MafsSceneShellProps = {
  children: ReactNode;
  height?: number;
  viewBox?: MafsViewBox;
  /** Accessible name for the diagram. */
  ariaLabel: string;
  showCoordinates?: boolean;
  /**
   * Gridline/label spacing, in math units.
   *
   * Defaults to 1, which is right for a plot a few units tall and unreadable for
   * one spanning thirty: the accumulation explorer's total panel drew a label on
   * every integer from -16 to 17 inside 130 pixels, and the axis became a smear.
   * A panel that knows its own range passes its own step.
   */
  xStep?: number;
  yStep?: number;
};

/** A 1/2/5×10^k step that puts roughly `target` gridlines across `span`. */
export function niceStep(span: number, target = 6): number {
  if (!Number.isFinite(span) || span <= 0) return 1;
  const raw = span / target;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

/** A tick label with only as many decimals as its own step needs. */
function label(value: number, step: number): string {
  if (Number.isInteger(step)) return Number.isInteger(value) ? String(value) : "";
  const places = Math.max(0, -Math.floor(Math.log10(step)));
  return value.toFixed(places);
}

/**
 * Thin Mafs wrapper with consistent dark-canvas styling and responsive width.
 * Interaction/rendering stays inside Mafs; React only mounts the shell.
 */
export function MafsSceneShell({
  children,
  height = 320,
  viewBox = { x: [-4, 4], y: [-3, 3], padding: 0.35 },
  ariaLabel,
  showCoordinates = true,
  xStep = 1,
  yStep = 1,
}: MafsSceneShellProps) {
  return (
    <div className="mafs-scene-shell" role="img" aria-label={ariaLabel}>
      <Mafs
        height={height}
        viewBox={viewBox}
        preserveAspectRatio={false}
        zoom={false}
        pan={false}
      >
        {showCoordinates && (
          <Coordinates.Cartesian
            xAxis={{ lines: xStep, labels: (n) => label(n, xStep) }}
            yAxis={{ lines: yStep, labels: (n) => label(n, yStep) }}
          />
        )}
        {children}
      </Mafs>
    </div>
  );
}
