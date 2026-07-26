import { Circle, Line, Node, Rect, Txt } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  easeOutCubic,
  type SimpleSignal,
  type ThreadGenerator,
} from "@motion-canvas/core";
import type { Vector2 as MathVector2 } from "../../math";
import { toPixels } from "./sceneKit";
import { ROLE } from "./semanticRoles";
import { rigTransformForFocus, type Point } from "./kitLayout";

/**
 * Motion primitives extracted from the animation benchmark laboratory — the
 * patterns the four expert reconstructions needed that the scene kit did not
 * have. Each primitive is original code expressing an observed PATTERN (span
 * anchors, focus-rig reframing, write-in pacing, tracer pointers, transient
 * action pulses, ring/stacked tokens); nothing here is transcribed from any
 * reference source.
 *
 * Pure calculators live in kitLayout.ts (Motion-Canvas-free, unit-tested);
 * this module only binds them to nodes and tweens.
 */

/**
 * A static span line through the origin along a math-space direction. The
 * benchmark rule it encodes: draw the anchor BEFORE the motion and never move
 * it — invariants must be visible fixed objects, not claims.
 */
export function makeSpanLine(
  direction: MathVector2,
  color: string,
  halfExtentUnits: number,
  options: { lineWidth?: number; opacity?: number; dash?: boolean } = {},
): Line {
  const tip = toPixels([
    direction[0] * halfExtentUnits,
    direction[1] * halfExtentUnits,
  ]);
  return new Line({
    stroke: color,
    lineWidth: options.lineWidth ?? 3,
    opacity: options.opacity ?? 0.85,
    lineDash: options.dash ? [10, 10] : [],
    points: [new Vector2(-tip.x, -tip.y), tip],
  });
}

export interface FocusRig {
  /** Add scene content to this node; the rig reframes it as a camera would. */
  world: Node;
  /** Current focus, exposed for probes/tests. */
  focus: SimpleSignal<Point, void>;
  scale: SimpleSignal<number, void>;
  /** Smoothly reframe onto a stage-space point at a zoom factor. */
  focusOn(target: Point, scale: number, duration: number): ThreadGenerator;
  /** Return to the identity framing. */
  reset(duration: number): ThreadGenerator;
}

/**
 * Camera-as-group-move: a rig that scales/shifts a world group so a chosen
 * point fills the frame — the reframing pattern of the (a,b)-tree zooms and
 * the Huffman tree rescale, for a runtime with no camera object.
 */
export function makeFocusRig(): FocusRig {
  const focus = createSignal<Point>({ x: 0, y: 0 });
  const scale = createSignal(1);
  const world = new Node({
    position: () => {
      const t = rigTransformForFocus(focus(), scale());
      return new Vector2(t.x, t.y);
    },
    scale: () => scale(),
  });

  function* animate(
    target: Point,
    targetScale: number,
    duration: number,
  ): ThreadGenerator {
    yield* all(
      focus(target, duration, easeInOutCubic),
      scale(targetScale, duration, easeInOutCubic),
    );
  }

  return {
    world,
    focus,
    scale,
    focusOn: (target, s, duration) => animate(target, s, duration),
    reset: (duration) => animate({ x: 0, y: 0 }, 1, duration),
  };
}

export interface WriteInText {
  node: Txt;
  /** Animate the text writing in character by character. */
  write(duration: number): ThreadGenerator;
  /** Reveal instantly (reduced-motion / cuts). */
  complete(): void;
  /**
   * The currently visible string, read from the underlying signal. Probes and
   * tests MUST use this instead of node.text(): evaluating a reactive Txt
   * outside the scene context makes Txt spawn its TxtLeaf children where
   * useScene() is unavailable ("The scene is not available…").
   */
  current(): string;
}

/**
 * Character-by-character write-in — the no-narration pacing device where text
 * length stands in for speaking time. Pair with kitLayout.writeInSchedule.
 */
export function makeWriteInText(
  full: string,
  props: ConstructorParameters<typeof Txt>[0] = {},
): WriteInText {
  const visible = createSignal(0);
  const current = () => full.slice(0, Math.round(visible() * full.length));
  const node = new Txt({
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    ...props,
    text: current,
  });
  return {
    node,
    write: (duration: number) =>
      visible(1, duration, (t) => t) as unknown as ThreadGenerator,
    complete: () => visible(1),
    current,
  };
}

export interface TracerArrow {
  node: Line;
  /** Re-point at a target (left-anchored line position), like a narrator's finger. */
  pointTo(position: Point, duration: number): ThreadGenerator;
}

/**
 * The tracer pointer: a small arrow that re-points at the active line of an
 * on-canvas text panel from the same transition that mutates the diagram, so
 * panel and canvas cannot desynchronise.
 */
export function makeTracerArrow(color: string = ROLE.selected): TracerArrow {
  const node = new Line({
    stroke: color,
    lineWidth: 5,
    endArrow: true,
    arrowSize: 12,
    lineCap: "round",
    points: [new Vector2(-26, 0), new Vector2(0, 0)],
    opacity: 0,
  });
  function* pointTo(position: Point, duration: number): ThreadGenerator {
    yield* all(
      node.position(new Vector2(position.x, position.y), duration, easeInOutCubic),
      node.opacity(1, Math.min(duration, 0.3)),
    );
  }
  return { node, pointTo };
}

/**
 * Transient ACTION pulse, distinct from persistent STATE colour: an expanding,
 * fading ring dropped on a spot. The pulse always disappears; state changes
 * are someone else's job (the separation observed in the BFS reference).
 */
export function* pulseRing(
  parent: Node,
  position: Point,
  color: string,
  options: { radius?: number; duration?: number; lineWidth?: number } = {},
): ThreadGenerator {
  const radius = options.radius ?? 30;
  const duration = options.duration ?? 0.9;
  const ring = new Circle({
    position: new Vector2(position.x, position.y),
    size: radius * 2,
    stroke: color,
    lineWidth: options.lineWidth ?? 5,
    opacity: 0.95,
  });
  parent.add(ring);
  yield* all(
    ring.size(radius * 2.9, duration, easeOutCubic),
    ring.opacity(0, duration, easeOutCubic),
  );
  ring.remove();
}

export interface RingToken {
  node: Node;
  circle: Circle;
  label: Txt;
}

/** A circular value token (internal node / queue entry). */
export function makeRingToken(
  text: string,
  color: string,
  options: { radius?: number; textColor?: string; fontSize?: number } = {},
): RingToken {
  const radius = options.radius ?? 30;
  const node = new Node({});
  const circle = new Circle({
    size: radius * 2,
    stroke: color,
    lineWidth: 3.5,
    fill: "rgba(0,0,0,0.65)",
  });
  const label = new Txt({
    text,
    fill: options.textColor ?? ROLE.text,
    fontSize: options.fontSize ?? 24,
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
  });
  node.add(circle);
  node.add(label);
  return { node, circle, label };
}

export interface StackedToken {
  node: Node;
  topLabel: Txt;
  bottomLabel: Txt;
}

/**
 * A two-storey token: a small value box stacked on a symbol box (the leaf
 * shape of the Huffman reference — value and identity read as one object).
 */
export function makeStackedToken(
  topText: string,
  bottomText: string,
  topColor: string,
  bottomColor: string,
): StackedToken {
  const node = new Node({});
  const topHeight = 26;
  const bottomSize = 46;
  const top = new Rect({
    width: bottomSize,
    height: topHeight,
    stroke: topColor,
    lineWidth: 2.5,
    fill: "rgba(0,0,0,0.65)",
    position: new Vector2(0, -(bottomSize + topHeight) / 2),
  });
  const bottom = new Rect({
    width: bottomSize,
    height: bottomSize,
    stroke: bottomColor,
    lineWidth: 2.5,
    fill: "rgba(0,0,0,0.65)",
  });
  const topLabel = new Txt({
    text: topText,
    fill: ROLE.text,
    fontSize: 16,
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    position: top.position(),
  });
  const bottomLabel = new Txt({
    text: bottomText,
    fill: ROLE.text,
    fontSize: 28,
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
  });
  node.add(bottom);
  node.add(top);
  node.add(topLabel);
  node.add(bottomLabel);
  return { node, topLabel, bottomLabel };
}
