import { Circle, Latex, Line, Node, Rect, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { CHAIN_RULE_SEGMENTS, requireBeats } from "./sceneTimings";
import { ROLE, runSegment } from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X } from "./safeFrame";

/**
 * `chain-rule` — the one clip. Two linked zoom panels: g on the left, f on
 * the right, g's output feeding f's input.
 *
 * **The honesty obligation this file keeps**, the same one
 * `derivative-local-linearity` keeps for one panel: both curves are always
 * the real sampled fixture, re-drawn from `G_F`/`F_F` every frame — no code
 * path substitutes a straight line for either curve. `E_F(k(h))` in the
 * `residualCompose` beat is drawn as a labelled, nonzero quantity, never
 * hidden inside an "approximately equals". The `predict` beat asks what
 * decides f's slope BEFORE `fMagLabel` (f'(2) = 12) is revealed — its reveal
 * is deferred to `zoomOuter` for exactly this reason; revealing it earlier
 * would make the question rhetorical.
 *
 * The point `a = 1` (and therefore `b = g(a) = 2`) is fixed for the whole
 * clip — this scene tells the derivation once, at one worked example; the
 * explorer is where a learner drags the point and tries other pairs.
 */

const SCENE_ID = "chain-rule";

/**
 * g(x) = x^2 + 1, f(u) = u^3. g is fresh; f coincides with L2/L4's
 * ex-cubic-inflection (a reuse, in a new role as an outer function rather
 * than displayed alone) -- the composite (x^2+1)^3 as an object is still new.
 */
const A_POINT = 1;
const G_F = (x: number) => x * x + 1;
const G_PRIME = (x: number) => 2 * x;
const B_POINT = G_F(A_POINT); // 2
const F_F = (u: number) => u * u * u;
const F_PRIME = (u: number) => 3 * u * u;
const G_SLOPE = G_PRIME(A_POINT); // 2
const F_SLOPE = F_PRIME(B_POINT); // 12
const PRODUCT = G_SLOPE * F_SLOPE; // 24

const PANEL_W = 320;
const PANEL_H = 260;
const PANEL_Y = 30;
const GAP = 70;
const LEFT_X = -(PANEL_W / 2 + GAP / 2);
const RIGHT_X = PANEL_W / 2 + GAP / 2;

function tex(
  value: string | (() => string),
  size: number,
  fill: string = ROLE.text,
): Latex {
  return new Latex({ tex: value as never, fontSize: size, fill });
}

/** One zoom panel: its own frame, curve, point, and (once revealed) tangent. */
interface Panel {
  readonly frame: Rect;
  readonly inner: Node;
  readonly tangent: Line;
  readonly halfWidth: ReturnType<typeof createSignal<number>>;
  readonly px: (x: number, y: number) => Vector2;
}

function makePanel(
  panelId: "g" | "f",
  centerXStage: number,
  centre: number,
  f: (x: number) => number,
  slope: number,
  curveColor: string,
): Panel {
  const halfWidth = createSignal(1.6);
  const localSlope = () => slope;
  const halfHeight = () =>
    Math.max(Math.abs(localSlope()) * halfWidth() * 1.4, halfWidth() * 0.6);

  const px = (x: number, y: number): Vector2 => {
    const y0 = f(centre);
    return new Vector2(
      centerXStage + ((x - centre) / halfWidth()) * (PANEL_W / 2),
      PANEL_Y - ((y - y0) / halfHeight()) * (PANEL_H / 2),
    );
  };

  const frame = new Rect({
    x: centerXStage,
    y: PANEL_Y,
    width: PANEL_W,
    height: PANEL_H,
    radius: 8,
    stroke: ROLE.grid,
    lineWidth: 1.5,
    clip: true,
  });
  const inner = new Node({ position: new Vector2(-centerXStage, -PANEL_Y) });
  frame.add(inner);

  const plotCurve = (): Vector2[] => {
    const w = halfWidth();
    const pts: Vector2[] = [];
    for (let i = 0; i <= 200; i += 1) {
      const x = centre - w + (2 * w * i) / 200;
      const y = f(x);
      if (Number.isFinite(y)) pts.push(px(x, y));
    }
    return pts;
  };
  inner.add(
    new Line({
      key: `semantic:chainrule:curve:${panelId}`,
      stroke: curveColor,
      lineWidth: 4,
      points: plotCurve,
    }),
  );

  const point = new Circle({
    size: 12,
    fill: ROLE.text,
    position: () => px(centre, f(centre)),
  });
  inner.add(point);

  const tangent = new Line({
    key: `semantic:chainrule:tangent:${panelId}`,
    stroke: ROLE.transformed,
    lineWidth: 4,
    opacity: 0,
    points: () => {
      const w = halfWidth() * 1.4;
      return [
        px(centre - w, f(centre) - slope * w),
        px(centre + w, f(centre) + slope * w),
      ];
    },
  });
  inner.add(tangent);

  return { frame, inner, tangent, halfWidth, px };
}

export const chainRuleScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);
  const beats = (id: string) => requireBeats(SCENE_ID, id);

  const gPanel = makePanel("g", LEFT_X, A_POINT, G_F, G_SLOPE, ROLE.original);
  const fPanel = makePanel("f", RIGHT_X, B_POINT, F_F, F_SLOPE, ROLE.basis2);
  view.add(gPanel.frame);
  view.add(fPanel.frame);

  const gLabel = tex(`g(x) = x^2+1`, 20, ROLE.original);
  gLabel.position(new Vector2(LEFT_X, PANEL_Y - PANEL_H / 2 - 26));
  gLabel.opacity(0);
  view.add(gLabel);

  const fLabel = tex(`f(u) = u^3`, 20, ROLE.basis2);
  fLabel.position(new Vector2(RIGHT_X, PANEL_Y - PANEL_H / 2 - 26));
  fLabel.opacity(0);
  view.add(fLabel);

  /** The arrow connecting g's output (its point, drawn at y = b) to f's input (its point, at u = b). */
  const connector = new Line({
    key: "semantic:chainrule:connector",
    stroke: ROLE.selected,
    lineWidth: 3,
    lineDash: [8, 6],
    opacity: 0,
    points: () => [gPanel.px(A_POINT, B_POINT), fPanel.px(B_POINT, F_F(B_POINT))],
  });
  view.add(connector);

  /* ------------------------------------------------------------- the labels */
  const title = tex("", 30);
  title.position(new Vector2(LABEL_CENTER_X, -230));
  title.opacity(0);
  view.add(title);

  const caption = tex("", 24, ROLE.textMuted);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  caption.opacity(0);
  view.add(caption);

  const gMagLabel = tex(() => `g'(${A_POINT}) = ${G_SLOPE}`, 22, ROLE.original);
  gMagLabel.position(new Vector2(LEFT_X, PANEL_Y + PANEL_H / 2 + 34));
  gMagLabel.opacity(0);
  view.add(gMagLabel);

  const fMagLabel = tex(() => `f'(${B_POINT}) = ${F_SLOPE}`, 22, ROLE.basis2);
  fMagLabel.position(new Vector2(RIGHT_X, PANEL_Y + PANEL_H / 2 + 34));
  fMagLabel.opacity(0);
  view.add(fMagLabel);

  const productLabel = tex(
    `(f\\circ g)'(${A_POINT}) = ${F_SLOPE}\\cdot ${G_SLOPE} = ${PRODUCT}`,
    26,
    ROLE.selected,
  );
  productLabel.position(new Vector2(LABEL_CENTER_X, 180));
  productLabel.opacity(0);
  view.add(productLabel);

  const equationLabel = tex("", 24, ROLE.text);
  equationLabel.position(new Vector2(LABEL_CENTER_X, -160));
  equationLabel.opacity(0);
  view.add(equationLabel);

  const violationLabel = tex("", 22, ROLE.violation);
  violationLabel.position(new Vector2(LABEL_CENTER_X, -100));
  violationLabel.opacity(0);
  view.add(violationLabel);

  const say = function* (node: Latex, body: string, d: number): ThreadGenerator {
    node.tex(body);
    yield* node.opacity(1, d);
  };
  const roman = (t: string) => `\\text{${t}}`;

  const bodies: Record<string, () => ThreadGenerator> = {
    *twoRates() {
      const b = beats("twoRates");
      yield* say(title, roman("Two rates you already know"), b.title!);
      yield* all(gLabel.opacity(1, b.drawG!), gMagLabel.opacity(1, b.drawG!));
      // f's slope (fMagLabel) is deliberately NOT revealed here — it is
      // exactly what the `predict` beat asks about, before `zoomOuter`
      // reveals it. Only f's formula is shown at this point.
      yield* fLabel.opacity(1, b.drawF!);
      yield* say(
        caption,
        roman("each is already its own local-linear model — L2, recalled"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *feedThrough() {
      const b = beats("feedThrough");
      yield* say(title, roman("One feeds the other"), b.title!);
      yield* connector.opacity(1, b.connect!);
      yield* say(
        caption,
        `g(${A_POINT}) = ${B_POINT}${roman(" becomes f's input — composition, no derivative yet")}`,
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *zoomInner() {
      const b = beats("zoomInner");
      yield* say(title, roman("Zoom into g"), b.title!);
      yield* gPanel.halfWidth(0.02, b.magnify!, easeInOutCubic);
      yield* gPanel.tangent.opacity(1, b.reveal!);
      yield* say(
        caption,
        `g(${A_POINT}+h) \\approx g(${A_POINT}) + ${G_SLOPE}h`,
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *predict() {
      const b = beats("predict");
      // Nothing moves — the learner commits before f's panel zooms.
      yield* say(
        title,
        roman("f's panel is about to be magnified too. What decides its slope?"),
        b.ask!,
      );
      yield* waitFor(b.think!);
    },

    *zoomOuter() {
      const b = beats("zoomOuter");
      yield* say(
        title,
        roman("Zoom into f, using the first zoom's output"),
        b.title!,
      );
      yield* fPanel.halfWidth(0.02, b.magnify!, easeInOutCubic);
      yield* all(fPanel.tangent.opacity(1, b.reveal!), fMagLabel.opacity(1, b.reveal!));
      yield* say(
        caption,
        `f(${B_POINT}+k) \\approx f(${B_POINT}) + ${F_SLOPE}k`,
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *compound() {
      const b = beats("compound");
      yield* say(title, roman("Two magnifications, one number"), b.title!);
      yield* productLabel.opacity(1, b.reveal!);
      yield* say(
        caption,
        roman("the compound magnification is a PRODUCT, not a sum"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *duCancelFails() {
      const b = beats("duCancelFails");
      yield* say(title, roman("The popular proof, examined"), b.title!);
      yield* say(
        equationLabel,
        "\\frac{\\Delta y}{\\Delta x} = \\frac{\\Delta y}{\\Delta u}\\cdot\\frac{\\Delta u}{\\Delta x}",
        b.reveal!,
      );
      yield* say(
        violationLabel,
        roman("this regrouping needs ") + "\\Delta u \\neq 0" + roman(" to even divide"),
        b.flag!,
      );
      // A true hold: the scene waits here before revealing the repair.
      yield* waitFor(b.hold!);
    },

    *residualCompose() {
      const b = beats("residualCompose");
      yield* all(equationLabel.opacity(0, b.clear!), violationLabel.opacity(0, b.clear!));
      yield* say(title, roman("The honest repair"), b.title!);
      yield* say(
        equationLabel,
        "f(b+k) = f(b) + f'(b)k + E_f(k), \\qquad E_f(0)=0",
        b.reveal!,
      );
      yield* say(
        violationLabel,
        roman("substituted, never divided — this holds even where ") + "k=0",
        b.label!,
      );
      yield* say(
        caption,
        roman("that is exactly why g'(a)=0 needs no special case"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *result() {
      const b = beats("result");
      yield* all(equationLabel.opacity(0, b.clear!), violationLabel.opacity(0, b.clear!));
      yield* say(title, roman("The rule, earned"), b.title!);
      yield* say(
        equationLabel,
        "(f\\circ g)'(a) = f'(g(a))\\,g'(a)",
        b.reveal!,
      );
      yield* say(
        caption,
        roman("checked live: if g'(a)=0, the result is 0 — directly, no special case"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },
  };

  for (const segment of CHAIN_RULE_SEGMENTS) {
    yield* runSegment(segment.duration, bodies[segment.id]!, `${SCENE_ID}.${segment.id}`);
  }
});
