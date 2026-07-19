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
};

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
            xAxis={{ lines: 1, labels: (n) => (Number.isInteger(n) ? String(n) : "") }}
            yAxis={{ lines: 1, labels: (n) => (Number.isInteger(n) ? String(n) : "") }}
          />
        )}
        {children}
      </Mafs>
    </div>
  );
}
