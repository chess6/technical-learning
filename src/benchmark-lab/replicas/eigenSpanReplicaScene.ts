import { Line, Node, Rect, Txt, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import type { Matrix2x2, Vector2 as MathVector2 } from "../../math";
import { IDENTITY_MATRIX, lerpMatrix, matrixVectorMultiply } from "../../math";
import { toPixels } from "../../guided-scenes/scenes/sceneKit";
import { makeSpanLine } from "../../guided-scenes/scenes/kitMotion";
import {
  beginProbeRun,
  registerProbe,
} from "../probes/probeRegistry";
import { eigenSpanStretchManifest as manifest } from "../manifests/eigenSpanStretch";
import { makeEventLogger, runReplicaBeats } from "./replicaKit";
import {
  EIGEN_BENCH_COLORS as C,
  EIGEN_BENCH_MATRIX,
  EIGEN_DIR_DIAG,
  KNOCKED_VECTOR,
  OPENING_VECTOR,
  SNEAKY_VECTOR,
  makeFanArrows,
} from "./data/eigenReplicaData";

/**
 * Reconstruction of the 3b1b "vectors that stay on their span" excerpt,
 * written from observation of the locally extracted reference frames and the
 * pack's transcript timing. All geometry flows through the shared math
 * (lerpMatrix / matrixVectorMultiply); every tracked object registers a probe
 * so the comparison engine measures the same signals that paint the canvas.
 */

const ID = manifest.id;
const GRID_EXTENT = 8;

export const eigenSpanReplicaScene = makeScene2D(function* (view) {
  view.fill("#0a0d11");
  beginProbeRun(ID);
  const logEvent = makeEventLogger(manifest);

  // One morph progress signal; the current matrix interpolates I -> A.
  const p = createSignal(0);
  const matrixAt = (): Matrix2x2 => lerpMatrix(IDENTITY_MATRIX, EIGEN_BENCH_MATRIX, p());
  const image = (v: MathVector2) => toPixels(matrixVectorMultiply(matrixAt(), v));

  // --- static backdrop grid (never moves) ---------------------------------
  const staticGrid = new Node({ opacity: 0.5 });
  for (let k = -GRID_EXTENT; k <= GRID_EXTENT; k += 1) {
    staticGrid.add(
      new Line({
        stroke: C.staticGrid,
        lineWidth: 1,
        points: [toPixels([k, -GRID_EXTENT]), toPixels([k, GRID_EXTENT])],
      }),
    );
    staticGrid.add(
      new Line({
        stroke: C.staticGrid,
        lineWidth: 1,
        points: [toPixels([-GRID_EXTENT, k]), toPixels([GRID_EXTENT, k])],
      }),
    );
  }
  view.add(staticGrid);

  // --- moving grid ---------------------------------------------------------
  const movingGrid = new Node({});
  for (let k = -GRID_EXTENT; k <= GRID_EXTENT; k += 1) {
    const isAxis = k === 0;
    movingGrid.add(
      new Line({
        stroke: isAxis ? C.axis : C.movingGrid,
        lineWidth: isAxis ? 2.5 : 1.2,
        opacity: isAxis ? 0.95 : 0.7,
        points: () => [image([k, -GRID_EXTENT]), image([k, GRID_EXTENT])],
      }),
    );
    movingGrid.add(
      new Line({
        stroke: isAxis ? C.axis : C.movingGrid,
        lineWidth: isAxis ? 2.5 : 1.2,
        opacity: isAxis ? 0.95 : 0.7,
        points: () => [image([-GRID_EXTENT, k]), image([GRID_EXTENT, k])],
      }),
    );
  }
  view.add(movingGrid);

  // --- span lines (anchors: drawn before motion, never move) ---------------
  const spanDiag = makeSpanLine(EIGEN_DIR_DIAG, C.spanLine, 4.4, { opacity: 0 });
  const spanX = makeSpanLine([1, 0], C.eigenFamily, 7.6, { opacity: 0, lineWidth: 3.5 });
  const spanKnocked = makeSpanLine([1, 1], C.spanFaded, 3.6, { opacity: 0, dash: true });
  view.add(spanDiag);
  view.add(spanX);
  view.add(spanKnocked);

  // --- vectors --------------------------------------------------------------
  function makeVectorArrow(target: () => Vector2, color: string, width = 5): Line {
    return new Line({
      stroke: color,
      lineWidth: width,
      endArrow: true,
      arrowSize: 14,
      lineCap: "round",
      opacity: 0,
      points: () => [new Vector2(0, 0), target()],
    });
  }
  const ihat = makeVectorArrow(() => image([1, 0]), C.basis1, 5.5);
  const jhat = makeVectorArrow(() => image([0, 1]), C.basis2, 5.5);
  const vecDiag = makeVectorArrow(() => image(OPENING_VECTOR), C.eigenFamily);
  const vecSneaky = makeVectorArrow(() => image(SNEAKY_VECTOR), C.eigenFamily);
  const vecKnocked = makeVectorArrow(() => image(KNOCKED_VECTOR), C.counterexample);
  view.add(vecDiag);
  view.add(vecSneaky);
  view.add(vecKnocked);
  view.add(ihat);
  view.add(jhat);

  // --- fans -----------------------------------------------------------------
  const fanXGroup = new Node({ opacity: 0 });
  const fanXArrows = makeFanArrows([1, 0], 7, C.eigenFamily, C.basis1);
  for (const arrow of fanXArrows) {
    fanXGroup.add(
      new Line({
        stroke: arrow.color,
        lineWidth: 3.5,
        endArrow: true,
        arrowSize: 11,
        points: () => [new Vector2(0, 0), image(arrow.tip)],
      }),
    );
  }
  const fanDiagGroup = new Node({ opacity: 0 });
  const fanDiagArrows = makeFanArrows(EIGEN_DIR_DIAG, 4, C.eigenFamily, C.spanLine);
  for (const arrow of fanDiagArrows) {
    fanDiagGroup.add(
      new Line({
        stroke: arrow.color,
        lineWidth: 3.5,
        endArrow: true,
        arrowSize: 11,
        points: () => [new Vector2(0, 0), image(arrow.tip)],
      }),
    );
  }
  view.add(fanXGroup);
  view.add(fanDiagGroup);

  // --- pinned matrix panel ---------------------------------------------------
  const PANEL = { x: -90, y: -195 };
  const matrixPanel = new Node({ position: new Vector2(PANEL.x, PANEL.y) });
  matrixPanel.add(
    new Rect({
      width: 132,
      height: 104,
      fill: "rgba(4,7,10,0.82)",
      radius: 8,
    }),
  );
  const col1Emphasis = createSignal(0);
  const entryFont = 34;
  const entries: [string, number, number, string][] = [
    ["3", -26, -22, C.basis1],
    ["1", 26, -22, C.basis2],
    ["0", -26, 24, C.basis1],
    ["2", 26, 24, C.basis2],
  ];
  for (const [text, ex, ey, color] of entries) {
    const isCol1 = ex < 0;
    matrixPanel.add(
      new Txt({
        text,
        fill: color,
        fontSize: entryFont,
        fontWeight: 600,
        fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
        position: new Vector2(ex, ey),
        scale: isCol1 ? () => 1 + col1Emphasis() * 0.25 : 1,
      }),
    );
  }
  for (const side of [-1, 1]) {
    matrixPanel.add(
      new Line({
        stroke: C.axis,
        lineWidth: 3,
        points: [
          new Vector2(side * 56 - side * 10, -44),
          new Vector2(side * 56, -44),
          new Vector2(side * 56, 44),
          new Vector2(side * 56 - side * 10, 44),
        ],
      }),
    );
  }
  view.add(matrixPanel);

  // --- sneaky label + prefix -------------------------------------------------
  const labelGroup = new Node({ opacity: 0 });
  const labelOffset = new Vector2(-56, -18);
  labelGroup.position(() => image(SNEAKY_VECTOR).add(labelOffset));
  const prefixOpacity = createSignal(() => Math.max(0, Math.min(1, (p() - 0.5) * 4)));
  const labelBox = new Rect({
    width: 64,
    height: 72,
    stroke: C.eigenFamily,
    lineWidth: 2.5,
    radius: 6,
  });
  labelGroup.add(labelBox);
  labelGroup.add(
    new Txt({
      text: "-1",
      fill: C.eigenFamily,
      fontSize: 26,
      fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
      position: new Vector2(0, -15),
    }),
  );
  labelGroup.add(
    new Txt({
      text: "1",
      fill: C.eigenFamily,
      fontSize: 26,
      fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
      position: new Vector2(0, 16),
    }),
  );
  labelGroup.add(
    new Txt({
      text: "2x",
      fill: C.labelText,
      fontSize: 26,
      opacity: () => prefixOpacity(),
      fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
      position: new Vector2(-52, 0),
    }),
  );
  view.add(labelGroup);

  // --- recap annotations ------------------------------------------------------
  const textStretch3 = new Txt({
    text: "stretch factor 3",
    fill: C.labelText,
    fontSize: 30,
    fontWeight: 600,
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    position: new Vector2(-180, 40),
    opacity: 0,
  });
  const textStretch2 = new Txt({
    text: "stretch factor 2",
    fill: C.labelText,
    fontSize: 30,
    fontWeight: 600,
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    position: new Vector2(-196, -150),
    rotation: -45,
    opacity: 0,
  });
  const labelKnocked = new Txt({
    text: "leaves its span",
    fill: C.counterexample,
    fontSize: 28,
    fontWeight: 600,
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    position: new Vector2(150, -110),
    opacity: 0,
  });
  view.add(textStretch3);
  view.add(textStretch2);
  view.add(labelKnocked);

  // --- probes -----------------------------------------------------------------
  const lineEnd = (direction: MathVector2, halfExtent: number) =>
    toPixels([direction[0] * halfExtent, direction[1] * halfExtent]);
  registerProbe(ID, "static-grid", () => ({ x: 0, y: 0, opacity: staticGrid.opacity() }));
  registerProbe(ID, "moving-grid", () => {
    const point = image([1, 1]);
    return { x: point.x, y: point.y, opacity: 1 };
  });
  registerProbe(ID, "matrix-panel", () => ({
    x: matrixPanel.position().x,
    y: matrixPanel.position().y,
    opacity: matrixPanel.opacity(),
    width: 132,
    height: 104,
    text: "3 1 / 0 2",
  }));
  const arrowProbe = (node: Line, target: () => Vector2) => () => {
    const tip = target();
    return { x: tip.x, y: tip.y, opacity: node.opacity() };
  };
  registerProbe(ID, "ihat", arrowProbe(ihat, () => image([1, 0])));
  registerProbe(ID, "jhat", arrowProbe(jhat, () => image([0, 1])));
  registerProbe(ID, "vec-diag", arrowProbe(vecDiag, () => image(OPENING_VECTOR)));
  registerProbe(ID, "vec-sneaky", arrowProbe(vecSneaky, () => image(SNEAKY_VECTOR)));
  registerProbe(ID, "vec-knocked", arrowProbe(vecKnocked, () => image(KNOCKED_VECTOR)));
  registerProbe(ID, "span-diag", () => {
    const end = lineEnd(EIGEN_DIR_DIAG, 4.4);
    return { x: end.x, y: end.y, opacity: spanDiag.opacity() };
  });
  registerProbe(ID, "span-x", () => {
    const end = lineEnd([1, 0], 7.6);
    return { x: end.x, y: end.y, opacity: spanX.opacity() };
  });
  registerProbe(ID, "span-knocked", () => {
    const end = lineEnd([1, 1], 3.6);
    return { x: end.x, y: end.y, opacity: spanKnocked.opacity() };
  });
  registerProbe(ID, "fan-x", () => {
    const tip = image([2, 0]);
    return { x: tip.x, y: tip.y, opacity: fanXGroup.opacity() };
  });
  registerProbe(ID, "fan-diag", () => {
    const tip = image(EIGEN_DIR_DIAG);
    return { x: tip.x, y: tip.y, opacity: fanDiagGroup.opacity() };
  });
  registerProbe(ID, "label-sneaky", () => ({
    x: labelGroup.position().x,
    y: labelGroup.position().y,
    opacity: labelGroup.opacity(),
    width: 120,
    height: 76,
    text: prefixOpacity() > 0.5 ? "2x[-1,1]" : "[-1,1]",
    value: prefixOpacity() > 0.5 ? 2 : 1,
  }));
  const textProbe = (node: Txt, width: number) => () => ({
    x: node.position().x,
    y: node.position().y,
    opacity: node.opacity(),
    width,
    height: 34,
    text: node.text(),
  });
  registerProbe(ID, "text-stretch3", textProbe(textStretch3, 220));
  registerProbe(ID, "text-stretch2", textProbe(textStretch2, 220));
  registerProbe(ID, "label-knocked", textProbe(labelKnocked, 200));

  // --- choreography ---------------------------------------------------------
  // Event offsets below are tuned so logged times land on the manifest's
  // reference times; the comparison engine measures the residual deltas.
  const bodies: Record<string, () => ThreadGenerator> = {
    // [117.4-129.5) A special vector rides its own span.
    *"stay-on-span"() {
      yield* all(ihat.opacity(1, 0.4), jhat.opacity(1, 0.4), vecDiag.opacity(1, 0.4));
      yield* waitFor(0.6);
      logEvent("diag-span-drawn"); // 1.0
      yield* spanDiag.opacity(0.85, 0.8);
      yield* waitFor(1.4);
      logEvent("diag-transform-start"); // 3.2
      yield* p(1, 2.4, easeInOutCubic);
      yield* waitFor(6.3);
      // Hard cut back to rest (matches the reference's sub-scene reset).
      p(0);
      vecDiag.opacity(0);
      spanDiag.opacity(0);
    },
    // [129.5-146.3) i-hat stretches by three; column one is the receipt.
    *"ihat-stretch"() {
      logEvent("ihat-focus"); // 0.0
      yield* ihat.lineWidth(7, 0.3);
      yield* waitFor(0.7);
      yield* spanX.opacity(0.7, 0.8);
      yield* waitFor(3.3);
      logEvent("column-one-read"); // 5.1
      yield* col1Emphasis(1, 0.4);
      yield* waitFor(1.2);
      yield* col1Emphasis(0, 0.4);
      yield* waitFor(2.6);
      logEvent("ihat-transform-start"); // 9.8
      yield* p(1, 3.0, easeInOutCubic);
      yield* waitFor(3.0);
      // Reset for the family beat (intentional cut, declared in the manifest).
      p(0);
      ihat.lineWidth(5.5);
      ihat.opacity(0);
    },
    // [146.3-158.5) every x-axis vector stretches by three.
    *"xaxis-family"() {
      yield* waitFor(0.7);
      logEvent("xfan-in"); // 0.7
      yield* fanXGroup.opacity(1, 0.9);
      yield* waitFor(2.1);
      logEvent("xfan-stretch-start"); // 3.7
      yield* p(1, 2.5, easeInOutCubic);
      yield* waitFor(5.5);
      p(0);
      fanXGroup.opacity(0);
      spanX.opacity(0);
    },
    // [158.5-169.0) the sneaky (-1,1) vector; label rides the tip.
    *"sneaky-vector"() {
      logEvent("sneaky-in"); // 0.0
      yield* all(
        ihat.opacity(1, 0.4),
        vecSneaky.opacity(1, 0.5),
        labelGroup.opacity(1, 0.5),
      );
      yield* spanDiag.opacity(0.85, 0.7);
      yield* waitFor(5.0);
      logEvent("sneaky-transform-start"); // 6.2
      yield* p(1, 2.6, easeInOutCubic);
      yield* waitFor(1.4);
      p(0);
      vecSneaky.opacity(0);
      labelGroup.opacity(0);
      ihat.opacity(0);
    },
    // [169.0-179.8) the whole diagonal family stretches by two.
    *"diagonal-family"() {
      logEvent("diagfan-in"); // 0.0
      yield* fanDiagGroup.opacity(1, 0.9);
      yield* waitFor(3.7);
      logEvent("diagfan-stretch-start"); // 4.6
      yield* p(1, 2.4, easeInOutCubic);
      yield* waitFor(3.5);
      p(0);
      spanDiag.opacity(0);
      jhat.opacity(0);
    },
    // [179.8-192.8) both families at rest, annotated; matrix retires.
    *"recap-both-fans"() {
      yield* all(fanXGroup.opacity(1, 0.7), matrixPanel.opacity(0, 0.7));
      yield* waitFor(5.1);
      logEvent("stretch3-annotation"); // 5.8
      yield* textStretch3.opacity(1, 0.6);
      yield* waitFor(2.4);
      logEvent("stretch2-annotation"); // 8.8
      yield* textStretch2.opacity(1, 0.6);
      yield* waitFor(3.5);
    },
    // [192.8-202.5) any other vector is knocked off its span.
    *"knocked-off"() {
      logEvent("knocked-in"); // 0.0
      yield* all(
        vecKnocked.opacity(1, 0.5),
        spanKnocked.opacity(0.55, 0.5),
        labelKnocked.opacity(1, 0.6),
      );
      yield* waitFor(3.0);
      logEvent("knocked-transform-start"); // 3.6
      yield* p(1, 2.6, easeInOutCubic);
      yield* waitFor(3.0);
    },
  };

  yield* runReplicaBeats(manifest, bodies);
});
