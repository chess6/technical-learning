import { Fragment } from "react";
import { Line, Mafs, Polygon } from "mafs";
import "mafs/core.css";
import { OPENING_GRAPHIC } from "../../lessons/openingGraphic";
import { matrixVectorMultiply, type Matrix2x2, type Vector2 } from "../../math";
import "./LinearityComparison.css";

/**
 * A compact Lesson 2 comparison: a LINEAR map, a TRANSLATION (affine), and a
 * NONLINEAR warp side by side, each acting on the same craft + a small grid.
 *
 * The affine and nonlinear maps are plain functions — deliberately NOT the
 * `Matrix2x2` preset type — so the "not every motion is a matrix" point is made
 * in the implementation too: only the linear panel is a 2×2 matrix.
 */

const HULL = OPENING_GRAPHIC.outline.map(
  ([x, y]) => [x * 0.7, y * 0.7] as Vector2,
);

const SHEAR: Matrix2x2 = [
  [1, 0.5],
  [0, 1],
];

type PlaneMap = (p: Vector2) => Vector2;

const linearMap: PlaneMap = (p) => matrixVectorMultiply(SHEAR, p);
const translateMap: PlaneMap = ([x, y]) => [x + 1, y + 0.6];
// Bends vertical lines; keeps the origin fixed but breaks even spacing.
const warpMap: PlaneMap = ([x, y]) => [x + 0.32 * y * y, y];

const GRID_LINES = [-2, -1, 0, 1, 2];
const SAMPLES = 14;

/** Sample a straight grid line through `map`, drawn as a polyline of segments. */
function mapLine(
  map: PlaneMap,
  from: Vector2,
  to: Vector2,
): Vector2[] {
  const pts: Vector2[] = [];
  for (let i = 0; i <= SAMPLES; i += 1) {
    const t = i / SAMPLES;
    pts.push(map([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]));
  }
  return pts;
}

function Panel({
  title,
  map,
  facts,
  originMoves,
}: {
  title: string;
  map: PlaneMap;
  facts: { label: string; ok: boolean }[];
  originMoves: boolean;
}) {
  const hull = HULL.map(map) as [number, number][];
  const originImage = map([0, 0]);

  return (
    <figure className="linearity-comparison__panel">
      <figcaption className="linearity-comparison__title">{title}</figcaption>
      <div className="linearity-comparison__mafs">
        <Mafs
          height={190}
          viewBox={{ x: [-2.4, 3.4], y: [-2.2, 2.6], padding: 0.2 }}
          preserveAspectRatio={false}
          zoom={false}
          pan={false}
        >
          {/* Warped grid: straight lines for linear/affine, bent for nonlinear. */}
          {GRID_LINES.map((k) => (
            <Fragment key={`v${k}`}>
              {chain(mapLine(map, [k, -2.2], [k, 2.2]), "var(--role-intermediate)")}
            </Fragment>
          ))}
          {GRID_LINES.map((k) => (
            <Fragment key={`h${k}`}>
              {chain(mapLine(map, [-2.2, k], [2.2, k]), "var(--role-intermediate)")}
            </Fragment>
          ))}
          {/* Original craft (faint) and its image. */}
          <Polygon
            points={HULL as [number, number][]}
            color="var(--role-original)"
            fillOpacity={0.04}
            strokeOpacity={0.4}
            weight={1.5}
          />
          <Polygon
            points={hull}
            color="var(--role-transformed)"
            fillOpacity={0.16}
            strokeOpacity={0.95}
            weight={2}
          />
          {/* Origin: fixed (green) or moved (red). */}
          {originMoves && (
            <Line.Segment
              point1={[0, 0]}
              point2={originImage as [number, number]}
              color="var(--role-result, #e87a9a)"
              weight={1.5}
              style="dashed"
            />
          )}
        </Mafs>
      </div>
      <ul className="linearity-comparison__facts">
        {facts.map((f) => (
          <li key={f.label} data-ok={f.ok}>
            <span aria-hidden="true">{f.ok ? "✓" : "✗"}</span> {f.label}
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** Draw a sampled polyline as a chain of Mafs segments. */
function chain(pts: Vector2[], color: string) {
  return pts.slice(0, -1).map((p1, i) => (
    <Line.Segment
      key={i}
      point1={p1 as [number, number]}
      point2={pts[i + 1] as [number, number]}
      color={color}
      weight={1}
      opacity={0.4}
    />
  ));
}

export function LinearityComparison() {
  return (
    <div
      className="linearity-comparison"
      role="group"
      aria-label="Comparison of a linear transformation, a translation, and a nonlinear warp"
    >
      <Panel
        title="Linear (a 2×2 matrix)"
        map={linearMap}
        originMoves={false}
        facts={[
          { label: "Origin stays fixed", ok: true },
          { label: "Grid lines stay straight", ok: true },
          { label: "Equal spacing preserved", ok: true },
        ]}
      />
      <Panel
        title="Translation (affine — not a matrix)"
        map={translateMap}
        originMoves
        facts={[
          { label: "Origin moves", ok: false },
          { label: "Grid lines stay straight", ok: true },
          { label: "Equal spacing preserved", ok: true },
        ]}
      />
      <Panel
        title="Nonlinear warp (not a matrix)"
        map={warpMap}
        originMoves={false}
        facts={[
          { label: "Origin stays fixed", ok: true },
          { label: "Grid lines bend", ok: false },
          { label: "Equal spacing breaks", ok: false },
        ]}
      />
    </div>
  );
}
