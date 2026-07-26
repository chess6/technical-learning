import { Line, Node, Rect, Txt } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  waitFor,
  type SignalValue,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { makeFocusRig, type FocusRig } from "./kitMotion";
import { ROLE } from "./semanticRoles";
import { ledgerGeometry, splitScreenOrigins } from "./scenePresentationLayout";
import { LABEL_BOTTOM_Y, SAFE_HEIGHT, SAFE_WIDTH } from "./safeFrame";

const FONT = "'Source Sans 3', 'Segoe UI', system-ui, sans-serif";

export interface AttachedLabelOptions {
  color?: string;
  fontSize?: number;
  offset?: SignalValue<Vector2>;
  key?: string;
}

/** A name that follows its mathematical object instead of occupying a band. */
export function makeAttachedLabel(
  text: SignalValue<string>,
  anchor: () => Vector2,
  options: AttachedLabelOptions = {},
): Txt {
  const offset = options.offset ?? new Vector2(18, -24);
  const readOffset = () =>
    typeof offset === "function" ? offset() : new Vector2(offset);
  return new Txt({
    key: options.key,
    text,
    fill: options.color ?? ROLE.text,
    stroke: ROLE.background,
    strokeFirst: true,
    lineWidth: 5,
    fontFamily: FONT,
    fontWeight: 650,
    fontSize: options.fontSize ?? 26,
    position: () => anchor().add(readOffset()),
  });
}

export interface LedgerRowSpec {
  id: string;
  label: SignalValue<string>;
  value: SignalValue<string>;
  color?: string;
}

export interface EquationLedger {
  node: Node;
  row(id: string): { label: Txt; value: Txt };
}

/**
 * A persistent, compact algebra/invariant ledger. Rows are independent text
 * nodes so values can be changed atomically or assembled by future term-motion
 * primitives without character-tweening a whole equation.
 */
export function makeEquationLedger(
  rows: readonly LedgerRowSpec[],
  options: {
    position?: Vector2;
    width?: number;
    rowHeight?: number;
    key?: string;
  } = {},
): EquationLedger {
  const width = options.width ?? 330;
  const rowHeight = options.rowHeight ?? 38;
  const layout = ledgerGeometry(rows.length, rowHeight);
  const height = layout.height;
  const baseKey = options.key ?? "presentation:equation-ledger";
  const node = new Node({
    key: baseKey,
    position: options.position ?? new Vector2(-285, -185),
  });
  node.add(
    new Rect({
      width,
      height,
      radius: 14,
      fill: "rgba(8, 12, 18, 0.84)",
      stroke: ROLE.grid,
      lineWidth: 2,
    }),
  );
  const byId = new Map<string, { label: Txt; value: Txt }>();
  rows.forEach((row, index) => {
    const y = layout.rowY[index]!;
    const label = new Txt({
      key: `${baseKey}:row:${row.id}:label`,
      text: row.label,
      fill: ROLE.textMuted,
      fontFamily: FONT,
      fontWeight: 600,
      fontSize: 22,
      offset: [-1, 0],
      position: new Vector2(-width / 2 + 16, y),
    });
    const value = new Txt({
      key: `${baseKey}:row:${row.id}:value`,
      text: row.value,
      fill: row.color ?? ROLE.text,
      fontFamily: FONT,
      fontWeight: 650,
      fontSize: 23,
      offset: [1, 0],
      position: new Vector2(width / 2 - 16, y),
    });
    node.add(label);
    node.add(value);
    byId.set(row.id, { label, value });
  });
  return {
    node,
    row(id) {
      const row = byId.get(id);
      if (!row) throw new Error(`Unknown equation-ledger row "${id}"`);
      return row;
    },
  };
}

export interface TemporaryAnnotation {
  node: Node;
  label: Txt;
  show(duration?: number): ThreadGenerator;
  hide(duration?: number): ThreadGenerator;
}

/** A short-lived note beside one object, with a line back to its subject. */
export function makeTemporaryAnnotation(
  text: SignalValue<string>,
  labelPosition: SignalValue<Vector2>,
  target: () => Vector2,
  options: { color?: string; key?: string } = {},
): TemporaryAnnotation {
  const position = () =>
    typeof labelPosition === "function"
      ? labelPosition()
      : new Vector2(labelPosition);
  const color = options.color ?? ROLE.selected;
  const node = new Node({
    key: options.key ?? "presentation:temporary-annotation",
    opacity: 0,
  });
  const connector = new Line({
    stroke: color,
    lineWidth: 3,
    endArrow: true,
    arrowSize: 11,
    points: () => [position(), target()],
  });
  const label = new Txt({
    text,
    fill: color,
    stroke: ROLE.background,
    strokeFirst: true,
    lineWidth: 5,
    fontFamily: FONT,
    fontWeight: 650,
    fontSize: 24,
    position,
  });
  node.add(connector);
  node.add(label);
  return {
    node,
    label,
    show: (duration = 0.35) =>
      node.opacity(1, duration) as unknown as ThreadGenerator,
    hide: (duration = 0.3) =>
      node.opacity(0, duration) as unknown as ThreadGenerator,
  };
}

export interface SplitScreen {
  node: Node;
  left: Node;
  right: Node;
  leftOrigin: Vector2;
  rightOrigin: Vector2;
}

/** Two declared spaces with independent local origins and an optional divider. */
export function makeSplitScreen(
  options: {
    gap?: number;
    divider?: boolean;
    leftKey?: string;
    rightKey?: string;
  } = {},
): SplitScreen {
  const gap = options.gap ?? 48;
  const origins = splitScreenOrigins(SAFE_WIDTH, gap);
  const leftOrigin = new Vector2(origins.left.x, origins.left.y);
  const rightOrigin = new Vector2(origins.right.x, origins.right.y);
  const node = new Node({ key: "presentation:split-screen" });
  const left = new Node({
    key: options.leftKey ?? "presentation:split:left",
    position: leftOrigin,
  });
  const right = new Node({
    key: options.rightKey ?? "presentation:split:right",
    position: rightOrigin,
  });
  node.add(left);
  node.add(right);
  if (options.divider !== false) {
    node.add(
      new Line({
        key: "presentation:split:divider",
        stroke: ROLE.grid,
        lineWidth: 2,
        points: [
          new Vector2(0, -SAFE_HEIGHT / 2),
          new Vector2(0, SAFE_HEIGHT / 2),
        ],
      }),
    );
  }
  return { node, left, right, leftOrigin, rightOrigin };
}

export interface FullFrameTreatment {
  node: Node;
  text: Txt;
  show(duration?: number): ThreadGenerator;
  hide(duration?: number): ThreadGenerator;
}

/**
 * Screen-fixed prediction or intertitle; never implies a required sequence.
 *
 * `coverage` decides whether the treatment takes the whole stage or a band
 * across the top. Full coverage suits an intertitle, and suits a prediction
 * whose answer the learner already holds in their head. It is WRONG for a
 * prediction the learner is meant to reason from the picture — blanking the
 * apparatus turns "will this point survive the operation?" into a guess.
 * `"banner"` keeps the stage visible under a top strip, so the equations, the
 * matrix, the lines, and the fixed point are all still there to reason from.
 */
export function makeFullFrameTreatment(
  text: SignalValue<string>,
  options: {
    kind: "prediction" | "intertitle";
    accent?: string;
    key?: string;
    coverage?: "full" | "banner";
  },
): FullFrameTreatment {
  const accent = options.accent ?? ROLE.selected;
  const banner = options.coverage === "banner";
  const node = new Node({
    key: options.key ?? `presentation:${options.kind}`,
    opacity: 0,
  });
  // The banner strip sits above the top of a ±4-unit viewport and above the
  // tallest symbolic panel, so it covers nothing a scene is teaching with.
  const BANNER_HEIGHT = 78;
  const BANNER_Y = -231;
  node.add(
    new Rect({
      width: 960,
      height: banner ? BANNER_HEIGHT : 540,
      y: banner ? BANNER_Y : 0,
      fill: "rgba(5, 8, 13, 0.94)",
    }),
  );
  const label = new Txt({
    text,
    width: 720,
    textWrap: true,
    textAlign: "center",
    fill: ROLE.text,
    stroke: ROLE.background,
    strokeFirst: true,
    lineWidth: 7,
    fontFamily: FONT,
    fontWeight: 700,
    fontSize: banner ? 30 : options.kind === "prediction" ? 42 : 48,
    position: new Vector2(0, banner ? BANNER_Y - 4 : -10),
  });
  const rule = new Line({
    stroke: accent,
    lineWidth: 5,
    points: banner
      ? [new Vector2(-90, BANNER_Y + 28), new Vector2(90, BANNER_Y + 28)]
      : [new Vector2(-90, 62), new Vector2(90, 62)],
  });
  node.add(label);
  node.add(rule);
  return {
    node,
    text: label,
    show: (duration = 0.35) =>
      node.opacity(1, duration) as unknown as ThreadGenerator,
    hide: (duration = 0.3) =>
      node.opacity(0, duration) as unknown as ThreadGenerator,
  };
}

/** Viewport reframe primitive; an alias names its production intent. */
export function makeViewportRig(): FocusRig {
  return makeFocusRig();
}

/** A deliberate no-change beat. */
export function* silentHold(seconds: number): ThreadGenerator {
  yield* waitFor(seconds);
}

/** Run related visual changes together without inserting text/state cuts. */
export function* uninterruptedMotion(
  ...motions: ThreadGenerator[]
): ThreadGenerator {
  yield* all(...motions);
}

/**
 * Optional one-line prose treatment. Callers add it only for beats where the
 * geometry and labels cannot carry the necessary claim.
 */
export function makeBriefCaption(
  text: SignalValue<string>,
  options: { key?: string; color?: string } = {},
): Txt {
  return new Txt({
    key: options.key ?? "presentation:brief-caption",
    text,
    width: SAFE_WIDTH,
    textWrap: true,
    textAlign: "center",
    fill: options.color ?? ROLE.textMuted,
    stroke: ROLE.background,
    strokeFirst: true,
    lineWidth: 7,
    fontFamily: FONT,
    fontWeight: 600,
    fontSize: 28,
    position: new Vector2(0, LABEL_BOTTOM_Y),
  });
}
