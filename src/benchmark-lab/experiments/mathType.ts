import { Latex, Line, Node, Rect } from "@motion-canvas/2d";
import { Vector2, type SignalValue } from "@motion-canvas/core";
import { ROLE } from "../../guided-scenes/scenes/semanticRoles";

/**
 * Mathematical typography for the elimination design experiment.
 *
 * The repository's own composition-grammar review named the gap this closes:
 * "typography remains the product sans stack rather than the references' serif
 * math". The references typeset every symbol — matrices, row labels, operation
 * notation, even intertitles — in the same serif math face, and the production
 * elimination scene instead draws its augmented matrix as a MONOSPACED STRING
 * with `[`, `|`, and `]` characters, which is not a matrix, cannot be aligned,
 * and cannot carry per-entry identity.
 *
 * Everything here goes through Motion Canvas's `Latex`, which renders through
 * the bundled `mathjax-full` to SVG paths. That means:
 *
 *  - no webfont to load and no silent fall back to a system sans face;
 *  - real italic variables, real minus signs, real bracket scaling;
 *  - `{{ }}` fragments, so a term can be targeted and re-typeset in place.
 *
 * Non-mathematical text goes through `texRoman`/`texTitle` rather than a `Txt`
 * node, for the same reason: one face for the whole frame, and it is a face the
 * renderer definitely has.
 */

/** Pure string formatting, re-exported so a scene has one import for typography. */
export {
  texEquation,
  texNumber,
  texRoman,
  texSignedTerm,
} from "./texFormat";

/** Cool near-black, matching the references' restraint. */
export const STAGE_BG = "#0b0e13";
export const INK = "#e9eef6";
export const INK_MUTED = "#8b97a8";
export const INK_FAINT = "#3a4351";

/**
 * Semantic accents. Deliberately few: the references carry one meaning per hue
 * and leave everything else monochrome.
 */
export const ACCENT = {
  /** R₁ / the pivot row — the row being used as a tool. */
  rowOne: ROLE.basis1,
  /** R₂ / the row being rewritten. */
  rowTwo: ROLE.basis2,
  /** The invariant: the crossing, the solution, the thing that must not move. */
  invariant: ROLE.selected,
  /** The scratch copy — construction, not result. */
  scratch: "#d99a5b",
  /** The entry the operation exists to kill. */
  target: ROLE.target,
} as const;

const DEFAULT_TEX_PROPS = {
  fill: INK,
} as const;

/** A LaTeX expression node. `size` is the rendered cap height in stage pixels. */
export function makeTex(
  tex: SignalValue<string | string[]>,
  size: number,
  options: { fill?: string; opacity?: number; key?: string } = {},
): Latex {
  return new Latex({
    ...DEFAULT_TEX_PROPS,
    key: options.key,
    tex,
    fontSize: size,
    fill: options.fill ?? INK,
    opacity: options.opacity ?? 1,
  });
}

/** A reference-style intertitle: italic serif with a rule under it. */
export function makeIntertitle(
  text: string,
  size = 46,
): { node: Node; label: Latex; rule: Line } {
  // Visible on construction: every candidate opens on its intertitle, so the
  // frame at t = 0 — which is what a paused or freshly-loaded lab shows — is
  // already readable rather than black.
  const node = new Node({ opacity: 1 });
  const label = makeTex(`\\textit{${text}}`, size, { fill: INK });
  node.add(label);
  // The rule tracks the label's measured width: a fixed span underlines the
  // middle of a long title and overshoots a short one.
  const rule = new Line({
    stroke: INK_MUTED,
    lineWidth: 2,
    points: () => {
      const half = Math.max(80, label.width() / 2);
      return [
        new Vector2(-half, size * 0.7),
        new Vector2(half, size * 0.7),
      ];
    },
  });
  node.add(rule);
  return { node, label, rule };
}

/**
 * One entry of an augmented matrix or of a longhand subtraction.
 *
 * Entries are separate nodes on a shared column grid rather than one typeset
 * matrix, because the whole point of the experiment is that an entry has
 * IDENTITY: it must be able to travel, brighten, be struck through, or be
 * replaced without disturbing its neighbours. A single `\begin{array}` renders
 * beautifully and is then one indivisible glyph run.
 */
export interface MatrixEntry {
  node: Latex;
  column: number;
  row: number;
}

export interface AugmentedMatrixLayout {
  /** Horizontal centre of each of the three columns, relative to the group. */
  columnX: readonly [number, number, number];
  /** Vertical centre of each row. */
  rowY: readonly [number, number];
  /** Half-width of the bracket span. */
  halfWidth: number;
  halfHeight: number;
}

export const AUGMENTED_LAYOUT: AugmentedMatrixLayout = {
  columnX: [-104, -18, 96],
  rowY: [-34, 34],
  halfWidth: 168,
  halfHeight: 74,
};

/**
 * A real augmented matrix: scaled square brackets, a vertical augmentation
 * rule, and one addressable `Latex` node per entry.
 */
export function makeAugmentedMatrix(
  entries: readonly (readonly [string, string, string])[],
  options: { size?: number; fills?: readonly (string | undefined)[] } = {},
): {
  node: Node;
  entries: MatrixEntry[][];
  brackets: Node;
  divider: Line;
  layout: AugmentedMatrixLayout;
} {
  const size = options.size ?? 44;
  const layout = AUGMENTED_LAYOUT;
  const node = new Node({});

  const brackets = new Node({});
  const bracketInset = 18;
  for (const side of [-1, 1] as const) {
    const x = side * layout.halfWidth;
    brackets.add(
      new Line({
        stroke: INK,
        lineWidth: 3,
        lineCap: "square",
        points: [
          new Vector2(x + side * -bracketInset, -layout.halfHeight),
          new Vector2(x, -layout.halfHeight),
          new Vector2(x, layout.halfHeight),
          new Vector2(x + side * -bracketInset, layout.halfHeight),
        ],
      }),
    );
  }
  node.add(brackets);

  // The augmentation divider is what makes this an augmented matrix rather
  // than a 2×3 one; drawing it is not decoration.
  const divider = new Line({
    stroke: INK_MUTED,
    lineWidth: 2,
    points: [
      new Vector2(38, -layout.halfHeight + 10),
      new Vector2(38, layout.halfHeight - 10),
    ],
  });
  node.add(divider);

  const cells: MatrixEntry[][] = entries.map((row, i) =>
    row.map((tex, j) => {
      const cell = makeTex(tex, size, {
        fill: options.fills?.[i] ?? INK,
      });
      cell.position(new Vector2(layout.columnX[j]!, layout.rowY[i]!));
      node.add(cell);
      return { node: cell, column: j, row: i };
    }),
  );

  return { node, entries: cells, brackets, divider, layout };
}

/**
 * A label with a plate behind it, for text that must sit ON the geometry.
 *
 * The crossing label is the one piece of text every candidate has to place
 * exactly where two lines meet — which is, by construction, the busiest ink in
 * the frame. Nudging it around only moves the collision: at one stop of the
 * pivot the clear quadrant is below-left, at another it is below-right. A plate
 * makes the label legible wherever the mathematics puts it, which is what the
 * references do rather than leaving a minus sign hidden under a stroke.
 */
export function makePlatedLabel(
  tex: SignalValue<string>,
  size: number,
  fill: string,
): { node: Node; label: Latex; plate: Rect } {
  const node = new Node({});
  const label = makeTex(tex, size, { fill });
  const plate = new Rect({
    width: size * 4.6,
    height: size * 1.55,
    radius: 8,
    fill: STAGE_BG,
    opacity: 0.82,
  });
  node.add(plate);
  node.add(label);
  return { node, label, plate };
}

/**
 * A soft focus panel: a rounded plate that lifts one cluster out of the frame
 * without drawing a hard box around it. Used instead of the production scene's
 * permanent panel borders, which read as UI chrome rather than as mathematics.
 */
export function makeFocusPlate(
  width: number,
  height: number,
  options: { radius?: number; opacity?: number } = {},
): Rect {
  return new Rect({
    width,
    height,
    radius: options.radius ?? 18,
    fill: "#141a24",
    opacity: options.opacity ?? 0,
  });
}

/**
 * The two ends of `a x + b y = c` inside a plotted box, in stage pixels.
 *
 * Shared by all three candidates because getting it wrong is invisible until
 * it is ugly: clipping only against the x-range lets a steep constraint run
 * hundreds of pixels past the grid (which is exactly what the first draft of
 * the longhand payoff did), and a horizontal row has no x-intercept to clip
 * against at all.
 */
export function clipLineToBox(
  row: readonly [number, number, number],
  xRange: readonly [number, number],
  yRange: readonly [number, number],
  project: (point: readonly [number, number]) => Vector2,
): [Vector2, Vector2] {
  const [a, b, c] = row;
  const epsilon = 1e-6;
  const hits: [number, number][] = [];
  if (Math.abs(b) > 1e-9) {
    for (const x of xRange) {
      const y = (c - a * x) / b;
      if (y >= yRange[0] - epsilon && y <= yRange[1] + epsilon) hits.push([x, y]);
    }
  }
  if (Math.abs(a) > 1e-9) {
    for (const y of yRange) {
      const x = (c - b * y) / a;
      if (x >= xRange[0] - epsilon && x <= xRange[1] + epsilon) hits.push([x, y]);
    }
  }
  const distinct: [number, number][] = [];
  for (const point of hits) {
    if (
      !distinct.some(
        (other) => Math.hypot(other[0] - point[0], other[1] - point[1]) < epsilon,
      )
    ) {
      distinct.push(point);
    }
  }
  return [project(distinct[0] ?? [0, 0]), project(distinct[1] ?? [0, 0])];
}
