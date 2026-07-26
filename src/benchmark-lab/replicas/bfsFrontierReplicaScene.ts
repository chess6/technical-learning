import { Circle, Line, Node, Txt, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import {
  makeTracerArrow,
  makeWriteInText,
  pulseRing,
} from "../../guided-scenes/scenes/kitMotion";
import { writeInSchedule } from "../../guided-scenes/scenes/kitLayout";
import { beginProbeRun, registerProbe } from "../probes/probeRegistry";
import { bfsFrontierManifest } from "../manifests/bfsFrontier";
import type { BenchmarkManifest } from "../manifests";
import { makeEventLogger, runReplicaBeats } from "./replicaKit";
import {
  BFS_COLORS as C,
  BFS_EDGES,
  BFS_PSEUDOCODE,
  BFS_TICK_SECONDS,
  BFS_VERTICES,
  computeBfsSchedule,
} from "./data/bfsReplicaData";

/**
 * Reconstruction of the manim-js BFS excerpt, from observation. The grammar
 * being reproduced: NO narration — a full-frame intertitle, then a graph that
 * builds itself with staggered onsets, a pseudocode panel whose write-in
 * pace is proportional to line length, and a fixed-cadence state machine
 * where ONE transition moves the tracer arrow AND mutates the graph, so the
 * panel and the picture cannot desynchronise. State colours persist; action
 * pulses fade; enqueue numbers accumulate as permanent residue.
 */

const FONT = "'Source Sans 3', 'Segoe UI', system-ui, sans-serif";
const NODE_RADIUS = 24;
const PANEL_LEFT = 14;
const LINE_LEFT = 40;
const TITLE_Y = -212;
const LINE_HEIGHT = 37;

export type BfsReplicaStartState = "empty" | "graph" | "ready";

export function makeBfsTreatmentReplicaScene(
  manifest: BenchmarkManifest,
  startState: BfsReplicaStartState,
) {
  const ID = manifest.id;
  return makeScene2D(function* (view) {
  view.fill("#05070a");
  beginProbeRun(ID);
  const logEvent = makeEventLogger(manifest);

  const schedule = computeBfsSchedule();

  // --- intro intertitle (neutral text; reference branding not reproduced) ----
  const intro = makeWriteInText("Breadth-first search", {
    fontSize: 44,
    fill: C.panelTitle,
    position: new Vector2(0, 190),
  });
  view.add(intro.node);

  // --- graph ------------------------------------------------------------------
  const vertexState = BFS_VERTICES.map(() => createSignal(0)); // 0 blue, 1 yellow, 2 green
  const vertexNodes: Circle[] = [];
  const numberTexts: Txt[] = [];
  const graphLayer = new Node({});
  view.add(graphLayer);

  const edgeLines: Line[] = [];
  for (const [a, b] of BFS_EDGES) {
    const from = BFS_VERTICES[a]!;
    const to = BFS_VERTICES[b]!;
    const edge = new Line({
      stroke: C.edge,
      lineWidth: 2.5,
      points: [new Vector2(from.x, from.y), new Vector2(to.x, to.y)],
      end: 0,
    });
    edgeLines.push(edge);
    graphLayer.add(edge);
  }
  for (const [i, vertex] of BFS_VERTICES.entries()) {
    const state = vertexState[i]!;
    const circle = new Circle({
      position: new Vector2(vertex.x, vertex.y),
      size: NODE_RADIUS * 2,
      fill: () =>
        state() < 0.5 ? C.undiscovered : state() < 1.5 ? C.frontier : C.done,
      stroke: () =>
        state() < 0.5 ? C.undiscoveredRing : state() < 1.5 ? C.frontier : C.done,
      lineWidth: 3,
      scale: 0,
    });
    vertexNodes.push(circle);
    graphLayer.add(circle);
    const number = new Txt({
      text: String(schedule.numberOf[i]),
      fontFamily: FONT,
      fontSize: 26,
      fontWeight: 600,
      fill: () => (state() < 1.5 ? "#141a22" : "#dff5e2"),
      position: new Vector2(vertex.x, vertex.y),
      opacity: 0,
    });
    numberTexts.push(number);
    graphLayer.add(number);
  }

  // --- pseudocode panel ----------------------------------------------------------
  const titleWrite = makeWriteInText(BFS_PSEUDOCODE.title, {
    fontSize: 30,
    fontWeight: 600,
    fill: C.panelTitle,
    offset: [-1, 0],
    position: new Vector2(PANEL_LEFT, TITLE_Y),
  });
  view.add(titleWrite.node);
  const lineWrites = BFS_PSEUDOCODE.lines.map((line, i) => {
    const write = makeWriteInText(line, {
      fontSize: 24,
      fill: C.panelText,
      offset: [-1, 0],
      position: new Vector2(LINE_LEFT, TITLE_Y + LINE_HEIGHT * (i + 1)),
    });
    view.add(write.node);
    return write;
  });
  const lineY = (index: number) => TITLE_Y + LINE_HEIGHT * (index + 1);

  const tracer = makeTracerArrow(C.action);
  view.add(tracer.node);

  // --- probes ----------------------------------------------------------------------
  registerProbe(ID, "intro-title", () => ({
    x: intro.node.position().x,
    y: intro.node.position().y,
    opacity: intro.node.opacity(),
    width: 460,
    height: 50,
    text: intro.current(),
  }));
  registerProbe(ID, "graph-nodes", () => {
    const anchor = vertexNodes[9]!;
    return {
      x: anchor.position().x,
      y: anchor.position().y,
      opacity: Math.min(1, anchor.scale().x),
    };
  });
  registerProbe(ID, "graph-edges", () => {
    const edge = edgeLines[22]!; // 9-10, mid-lattice
    const points = edge.parsedPoints();
    const mid = points[0]!.add(points[points.length - 1]!).scale(0.5);
    return { x: mid.x, y: mid.y, opacity: Math.min(edge.opacity(), edge.end()) };
  });
  const nodeBuildProbe = (index: number) => () => ({
    x: vertexNodes[index]!.position().x,
    y: vertexNodes[index]!.position().y,
    opacity: Math.min(1, vertexNodes[index]!.scale().x),
  });
  const edgeBuildProbe = (index: number) => () => {
    const edge = edgeLines[index]!;
    const points = edge.parsedPoints();
    const mid = points[0]!.add(points[points.length - 1]!).scale(0.5);
    return { x: mid.x, y: mid.y, opacity: Math.min(edge.opacity(), edge.end()) };
  };
  registerProbe(ID, "graph-node-first", nodeBuildProbe(0));
  registerProbe(ID, "graph-node-last", nodeBuildProbe(vertexNodes.length - 1));
  registerProbe(ID, "graph-edge-first", edgeBuildProbe(0));
  registerProbe(ID, "graph-edge-last", edgeBuildProbe(edgeLines.length - 1));
  registerProbe(ID, "pseudo-title", () => ({
    x: titleWrite.node.position().x,
    y: titleWrite.node.position().y,
    opacity: titleWrite.current().length > 0 ? 1 : 0,
    width: 300,
    height: 34,
    text: titleWrite.current(),
  }));
  registerProbe(ID, "pseudo-lines", () => ({
    x: lineWrites[0]!.node.position().x,
    y: lineWrites[0]!.node.position().y,
    opacity: lineWrites[0]!.current().length > 0 ? 1 : 0,
    width: 430,
    height: LINE_HEIGHT * 5,
    text: lineWrites.map((w) => w.current()).join("\n"),
  }));
  registerProbe(ID, "tracer", () => ({
    x: tracer.node.position().x,
    y: tracer.node.position().y,
    opacity: tracer.node.opacity(),
  }));
  const vertexProbe = (index: number) => () => ({
    x: vertexNodes[index]!.position().x,
    y: vertexNodes[index]!.position().y,
    opacity: Math.min(1, vertexNodes[index]!.scale().x),
    value: vertexState[index]!(),
    text:
      numberTexts[index]!.opacity() > 0.5
        ? String(schedule.numberOf[index])
        : "",
  });
  registerProbe(ID, "vertex-0", vertexProbe(0));
  registerProbe(ID, "vertex-4", vertexProbe(4));

  // --- state-machine enactment -----------------------------------------------------
  function* discoverVertex(index: number, stagger: number): ThreadGenerator {
    yield* waitFor(stagger);
    yield* all(
      vertexState[index]!(1, 0.35),
      numberTexts[index]!.opacity(1, 0.35),
    );
  }

  function* enactTransition(tick: number): ThreadGenerator {
    const transition = schedule.transitions[tick];
    if (!transition || transition.type === "end") return;
    if (transition.type === "init") {
      yield* tracer.pointTo({ x: PANEL_LEFT - 12, y: lineY(0) }, 0.3);
      yield* discoverVertex(transition.vertex, 0);
      return;
    }
    if (transition.type === "dequeue") {
      const vertex = BFS_VERTICES[transition.vertex]!;
      yield* tracer.pointTo({ x: PANEL_LEFT + 14, y: lineY(2) }, 0.3);
      yield* pulseRing(view, vertex, C.action, {
        radius: NODE_RADIUS + 6,
        duration: 0.9,
      });
      return;
    }
    // expand
    yield* tracer.pointTo({ x: PANEL_LEFT + 14, y: lineY(3) }, 0.3);
    yield* vertexState[transition.vertex]!(2, 0.4);
    const flashes: ThreadGenerator[] = [];
    for (const [i, neighbour] of transition.discovered.entries()) {
      flashes.push(discoverVertex(neighbour, i * (4 / 30)));
    }
    yield* all(...flashes);
  }

  const bodies: Record<string, () => ThreadGenerator> = {
    // [0-5) full-frame intertitle.
    *"intro-card"() {
      yield* waitFor(1.0);
      logEvent("intro-writein-start"); // 1.0
      yield* intro.write(2.6);
      // The card holds to the boundary; the cut is the next beat's first act.
    },
    // [5-12.5) the graph draws itself in.
    *"graph-build"() {
      intro.node.opacity(0); // hard cut at the declared boundary
      logEvent("nodes-build-start"); // 5.0 absolute
      const nodePops: ThreadGenerator[] = [];
      for (const [i, circle] of vertexNodes.entries()) {
        nodePops.push(
          (function* (): ThreadGenerator {
            yield* waitFor((1.7 * i) / vertexNodes.length);
            yield* circle.scale(1, 0.5, easeOutCubic);
          })(),
        );
      }
      yield* all(...nodePops);
      yield* waitFor(0.6);
      logEvent("edges-build-start"); // 3.0 into beat = 8.0 absolute
      const edgeGrows: ThreadGenerator[] = [];
      for (const [i, edge] of edgeLines.entries()) {
        edgeGrows.push(
          (function* (): ThreadGenerator {
            yield* waitFor((2.2 * i) / edgeLines.length);
            yield* edge.end(1, 0.8);
          })(),
        );
      }
      yield* all(...edgeGrows);
    },
    // [12.5-21.5) pseudocode writes itself in, paced by line length.
    *"pseudocode-writein"() {
      logEvent("pseudo-writein-start"); // 0.0
      const perChar = 0.045;
      const gap = 0.35;
      const slots = writeInSchedule(
        [BFS_PSEUDOCODE.title, ...BFS_PSEUDOCODE.lines],
        perChar,
        gap,
      );
      const writes = [titleWrite, ...lineWrites];
      const runs: ThreadGenerator[] = [];
      for (const [i, write] of writes.entries()) {
        runs.push(
          (function* (): ThreadGenerator {
            yield* waitFor(slots[i]!.start);
            yield* write.write(slots[i]!.duration);
          })(),
        );
      }
      yield* all(...runs);
    },
    // [21.5-23.5) state 0: enqueue the start vertex.
    *"init-enqueue"() {
      logEvent("enqueue-start-vertex"); // 0.0
      yield* enactTransition(0);
      yield* waitFor(0.8);
    },
    // [23.5-38.5) the dequeue/expand metronome.
    *"trace-loop"() {
      for (let tick = 1; tick <= 8; tick += 1) {
        if (tick === 1) logEvent("first-dequeue"); // 23.5 abs
        if (tick === 2) logEvent("first-expand"); // 25.23 abs
        if (tick === 7) logEvent("metronome-tick-6"); // 33.9 abs
        yield* runSingleTick(tick);
      }
    },
    // [38.5-40) the cadence continues into the held tail (tick 9 = dequeue 4).
    *"hold-state"() {
      yield* waitFor(0.25);
      yield* enactTransition(9);
    },
  };

  /** One metronome period: enact the transition, pad to the cadence. */
  function* runSingleTick(tick: number): ThreadGenerator {
    const PERIOD = BFS_TICK_SECONDS;
    // Authored per-transition cost (kept below the period by construction):
    // dequeue: 0.3 + 0.9 = 1.2; expand: 0.3 + 0.4 + staggered discoveries.
    const transition = schedule.transitions[tick]!;
    let cost = 0;
    if (transition.type === "dequeue") cost = 1.2;
    else if (transition.type === "expand") {
      const stagger =
        transition.discovered.length > 0
          ? (transition.discovered.length - 1) * (4 / 30) + 0.35
          : 0;
      cost = 0.3 + 0.4 + stagger;
    }
    yield* enactTransition(tick);
    yield* waitFor(Math.max(0, PERIOD - cost));
  }

  // Restore only the state that precedes the selected focused window.
  if (startState !== "empty") {
    intro.node.opacity(0);
    for (const vertex of vertexNodes) vertex.scale(1);
    for (const edge of edgeLines) edge.end(1);
  }
  if (startState === "ready") {
    titleWrite.complete();
    for (const line of lineWrites) line.complete();
  }

  yield* runReplicaBeats(manifest, bodies);
  });
}

export const bfsFrontierReplicaScene = makeBfsTreatmentReplicaScene(
  bfsFrontierManifest,
  "ready",
);
