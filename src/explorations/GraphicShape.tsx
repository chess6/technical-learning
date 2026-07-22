import { Fragment } from "react";
import { Line, Polygon } from "mafs";
import { OPENING_GRAPHIC, type GraphicRole } from "../lessons/openingGraphic";
import { applyMatrixToPoints, type Matrix2x2 } from "../math";

/**
 * Shared Mafs renderer for the multi-part opening craft. Every part (hull,
 * cockpit, panel seam, thruster tick) is transformed by the SAME matrix through
 * the shared math (`applyMatrixToPoints`) — never ad-hoc geometry — so internal
 * features stay aligned to the hull under shear / reflection / projection.
 *
 * Vector output (Mafs SVG) keeps correspondence crisp under every transform.
 */

const SOLID_STROKE: Record<GraphicRole, string> = {
  hull: "var(--role-transformed)",
  cockpit: "var(--role-selected)",
  fin: "var(--role-transformed)",
  panel: "var(--role-original)",
  thruster: "var(--role-basis-1)",
};

type Variant = "solid" | "ghost" | "target";

export function GraphicShape({
  matrix,
  variant = "solid",
  graphic = OPENING_GRAPHIC,
}: {
  matrix: Matrix2x2;
  variant?: Variant;
  graphic?: typeof OPENING_GRAPHIC;
}) {
  return (
    <>
      {graphic.parts.map((part) => {
        const pts = applyMatrixToPoints(matrix, part.points) as [number, number][];
        const color =
          variant === "ghost"
            ? "var(--role-original)"
            : variant === "target"
              ? "var(--role-selected)"
              : SOLID_STROKE[part.role];

        if (part.closed) {
          return (
            <Polygon
              key={part.id}
              points={pts}
              color={color}
              fillOpacity={
                variant === "solid"
                  ? part.role === "hull"
                    ? 0.14
                    : 0.28
                  : variant === "target"
                    ? 0.04
                    : 0.05
              }
              strokeOpacity={variant === "ghost" ? 0.45 : variant === "target" ? 0.6 : 0.95}
              weight={part.role === "hull" ? 2 : 1.5}
            />
          );
        }

        // Open polyline: a chain of segments (panel seam / thruster tick).
        return (
          <Fragment key={part.id}>
            {pts.slice(0, -1).map((p1, i) => (
              <Line.Segment
                key={`${part.id}-${i}`}
                point1={p1}
                point2={pts[i + 1]!}
                color={color}
                weight={1.5}
                opacity={variant === "ghost" ? 0.5 : 0.9}
              />
            ))}
          </Fragment>
        );
      })}
    </>
  );
}
