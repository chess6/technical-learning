import { BBox, Vector2, endScene, startScene, type Scene } from "@motion-canvas/core";
import type { Node } from "@motion-canvas/2d";
import type { NodeSample, UnmeasuredNodeSample } from "./gateTypes";

/**
 * Generic Motion Canvas scene-graph sampler.
 *
 * Walks the live node tree and records each node's identity, stage-space
 * bounding box, absolute opacity, and displayed text. It needs NO per-scene
 * instrumentation, which is the whole point: the hard gates can be pointed at
 * any production scene — including scenes written years from now — without
 * anyone remembering to add probes.
 *
 * Three subtleties, all of which produced wrong measurements first time:
 *
 *  1. The walk runs inside `startScene`/`endScene`. Reading a reactive `Txt`
 *     outside the scene context makes it spawn its glyph children where
 *     `useScene()` is unavailable, which throws "The scene is not available in
 *     the current context."
 *  2. `localToWorld()` is NOT the centre-origin stage frame the scenes are
 *     authored in — it puts the origin at the view's corner. Every box is
 *     therefore rebased on the VIEW's own measured centre, so a sample's
 *     coordinates mean the same thing as the constants in `safeFrame.ts`.
 *  3. A `Txt`'s own box is its LAYOUT box. `makeOverlayLabel` sets
 *     `width: SAFE_WIDTH`, so a three-word caption measures 800px wide and
 *     appears to collide with everything. The INK box — what a reader
 *     actually sees — is the union of the glyph leaves Txt spawns, so that is
 *     what gets recorded when leaves exist.
 */

interface WalkContext {
  out: Record<string, NodeSample>;
  ancestors: string[];
  /** Stage centre in world coordinates; subtracted from every box. */
  originX: number;
  originY: number;
  /** Nodes whose geometry could not be measured (never silently ignored). */
  unmeasured: UnmeasuredNodeSample[];
}

function worldBox(node: Node): BBox {
  const local = node.cacheBBox();
  return BBox.fromPoints(...local.transformCorners(node.localToWorld()));
}

/**
 * A node's box WITHOUT its cache padding.
 *
 * `cacheBBox()` is the layout box plus `cachePadding` (Node.cacheBBox), and
 * `makeOverlayLabel` sets a 56px pad so glyph ascenders are not cache-clipped.
 * Measuring that padded box as if it were ink makes a one-line caption look
 * 112px taller than it reads, which is enough to invent overlaps and clipping
 * that no viewer can see.
 */
function unpaddedWorldBox(node: Node): BBox {
  const padding = node.cachePadding();
  const local = node.cacheBBox().addSpacing(padding.scale(-1));
  return BBox.fromPoints(...local.transformCorners(node.localToWorld()));
}

/**
 * The visible ink of a text node: the union of its spawned glyph leaves with
 * their cache padding removed, falling back to the node's own unpadded box
 * when a Txt has no leaves yet.
 */
function textInkBox(node: Node): BBox {
  const leaves = node.children();
  if (leaves.length === 0) return unpaddedWorldBox(node);
  let union: BBox | null = null;
  for (const leaf of leaves) {
    const box = unpaddedWorldBox(leaf);
    if (!Number.isFinite(box.width) || !Number.isFinite(box.height)) continue;
    union = union ? union.union(box) : box;
  }
  return union ?? unpaddedWorldBox(node);
}

function readText(node: Node): string | undefined {
  const candidate = node as unknown as { text?: () => unknown };
  if (typeof candidate.text !== "function") return undefined;
  const value = candidate.text();
  return typeof value === "string" ? value : undefined;
}

function readFontSize(node: Node): number | undefined {
  const candidate = node as unknown as { fontSize?: () => unknown };
  if (typeof candidate.fontSize !== "function") return undefined;
  const value = candidate.fontSize();
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function isFiniteBox(box: BBox): boolean {
  return Number.isFinite(box.x) && Number.isFinite(box.y) && Number.isFinite(box.width) && Number.isFinite(box.height);
}

function reasonOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function recordUnmeasured(
  context: WalkContext,
  node: Node,
  type: string,
  opacity: number | undefined,
  reason: string,
): void {
  context.unmeasured.push({
    key: node.key,
    type,
    ...(opacity === undefined ? {} : { opacity }),
    reason,
  });
}

function readLineGeometry(
  node: Node,
  originX: number,
  originY: number,
): Pick<NodeSample, "points" | "drawnStart" | "drawnEnd"> {
  const candidate = node as unknown as {
    parsedPoints?: () => Vector2[];
    start?: () => unknown;
    end?: () => unknown;
  };
  if (typeof candidate.parsedPoints !== "function") return {};
  const localPoints = candidate.parsedPoints();
  if (localPoints.length < 2) {
    throw new Error("line has fewer than two measurable points");
  }
  const matrix = node.localToWorld();
  const points = localPoints.map((point) => {
    const world = point.transformAsPoint(matrix);
    return { x: world.x - originX, y: world.y - originY };
  });
  if (points.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y))) {
    throw new Error("line contains a non-finite point");
  }
  const start = candidate.start?.();
  const end = candidate.end?.();
  return {
    points,
    ...(typeof start === "number" && Number.isFinite(start) ? { drawnStart: start } : {}),
    ...(typeof end === "number" && Number.isFinite(end) ? { drawnEnd: end } : {}),
  };
}

function walk(node: Node, context: WalkContext): void {
  const type = node.constructor.name;
  const isText = type === "Txt";
  let opacity: number | undefined;
  try {
    opacity = node.absoluteOpacity();
    if (!Number.isFinite(opacity)) {
      recordUnmeasured(context, node, type, undefined, "non-finite opacity");
      opacity = undefined;
    }
  } catch (error) {
    recordUnmeasured(context, node, type, undefined, "opacity: " + reasonOf(error));
  }

  let box: BBox | undefined;
  try {
    box = isText ? textInkBox(node) : worldBox(node);
    if (!isFiniteBox(box)) {
      recordUnmeasured(context, node, type, opacity, "non-finite geometry");
      box = undefined;
    }
  } catch (error) {
    recordUnmeasured(context, node, type, opacity, "geometry: " + reasonOf(error));
  }

  if (box && opacity !== undefined) {
    const text = isText ? readText(node) : undefined;
    const fontSize = isText ? readFontSize(node) : undefined;
    let lineGeometry: Pick<NodeSample, "points" | "drawnStart" | "drawnEnd"> = {};
    if (type === "Line") {
      try {
        lineGeometry = readLineGeometry(node, context.originX, context.originY);
      } catch (error) {
        recordUnmeasured(context, node, type, opacity, reasonOf(error));
      }
    }
    context.out[node.key] = {
      key: node.key,
      type,
      x: box.x + box.width / 2 - context.originX,
      y: box.y + box.height / 2 - context.originY,
      width: box.width,
      height: box.height,
      opacity,
      ...(text === undefined ? {} : { text }),
      ...(fontSize === undefined ? {} : { fontSize }),
      ancestors: [...context.ancestors],
      ...lineGeometry,
    };
  }

  if (isText) return;

  context.ancestors.push(node.key);
  for (const child of node.children()) {
    walk(child, context);
  }
  context.ancestors.pop();
}

export interface SceneGraphSnapshot {
  nodes: Record<string, NodeSample>;
  /** Keys whose geometry could not be measured this frame. */
  unmeasured: UnmeasuredNodeSample[];
}

/**
 * Snapshot every node of the currently rendered scene, in the centre-origin
 * stage coordinates the scenes are authored in.
 *
 * `scene` must be the Motion Canvas scene the stage just painted, so the
 * measurements describe the frame the viewer actually sees.
 */
export function sampleSceneGraphDetailed(scene: Scene): SceneGraphSnapshot {
  startScene(scene);
  try {
    const view = (scene as unknown as { getView(): Node }).getView();
    // The stage centre is the view's LOCAL ORIGIN carried into world space.
    // It is emphatically NOT the centre of the view's bounding box: a node's
    // cacheBBox unions its descendants, so any scene whose geometry runs off
    // one edge would silently shift every measurement (determinant-area-
    // scaling skewed by 192px before this was fixed).
    const origin = new Vector2(0, 0).transformAsPoint(view.localToWorld());
    const context: WalkContext = {
      out: {},
      ancestors: [],
      originX: origin.x,
      originY: origin.y,
      unmeasured: [],
    };
    walk(view, context);
    return { nodes: context.out, unmeasured: context.unmeasured };
  } finally {
    endScene(scene);
  }
}

/** Convenience wrapper for callers that only need the node map. */
export function sampleSceneGraph(scene: Scene): Record<string, NodeSample> {
  return sampleSceneGraphDetailed(scene).nodes;
}

/**
 * Stable, cheap hash of the rendered canvas, downsampled so antialiasing
 * jitter cannot make two identical states look different.
 */
export function hashCanvas(canvas: HTMLCanvasElement): string {
  const width = 120;
  const height = 68;
  const scratch = document.createElement("canvas");
  scratch.width = width;
  scratch.height = height;
  const context = scratch.getContext("2d");
  if (!context) throw new Error("2D canvas context unavailable");
  context.drawImage(canvas, 0, 0, width, height);
  const { data } = context.getImageData(0, 0, width, height);
  let hash = 0x811c9dc5;
  for (let i = 0; i < data.length; i += 4) {
    // Quantise to 8 levels per channel: identical states hash identically
    // even when the GPU rounds a subpixel differently between passes.
    hash ^= data[i]! >> 5;
    hash = Math.imul(hash, 0x01000193);
    hash ^= data[i + 1]! >> 5;
    hash = Math.imul(hash, 0x01000193);
    hash ^= data[i + 2]! >> 5;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}
