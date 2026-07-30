import { Circle, Latex, Line, Node, Rect, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { EX_DRIVE } from "../../math";
import { FTC_ACCUMULATE_SEGMENTS, requireBeats } from "./sceneTimings";
import { ROLE, runSegment } from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X } from "./safeFrame";

/**
 * `fundamental-theorem` clip 1 — `ftc-accumulate-then-measure`.
 *
 * Picks up L3's loose end (the running total climbs fastest where the rate is
 * highest, unexplained) and answers it: the sliver `A(x+h) - A(x)` is squeezed
 * between `m_h h` and `M_h h`, and as `h` shrinks continuity (L1) forces both
 * onto `f(x)`. So `A' = f`.
 *
 * **Honesty obligations this file keeps:**
 *
 *  1. **No antiderivative.** `EX_DRIVE` declares one and this scene never reads
 *     it — `A(x)` is a prefix sum of `f`, exactly as L3 computed it. Naming or
 *     using the shortcut here would spend clip 2's discovery early.
 *  2. **The squeeze bars are real bounds, not decoration.** Because the window
 *     `[x0, x0 + h]` is chosen inside `EX_DRIVE`'s certified rising stretch
 *     (`[0, turningPoints[0]]`), `f` is monotone there, so its min and max over
 *     the window are exactly the two endpoint values — the honest source of
 *     `m_h` and `M_h`, not an assumption drawn on top of the picture.
 *  3. **The lower-limit shift is a second, independently accumulated total**,
 *     not the first one redrawn with an offset subtracted — the shift beat's
 *     claim ("it moves by a constant, the slope doesn't change") has to survive
 *     being computed the honest way to mean anything.
 */

const SCENE_ID = "ftc-accumulate-then-measure";

/* --------------------------------------------------------------- geometry */

const RATE = new Vector2(-130, -100);
const RATE_W = 500;
const RATE_H = 170;

const TOTAL = new Vector2(-130, 130);
const TOTAL_W = 500;
const TOTAL_H = 130;

/** Fixed ranges — the same ones A3's clip validated for this fixture. */
const RATE_LO = -8.6;
const RATE_HI = 5.8;
const TOT_LO = -15.5;
const TOT_HI = 17.5;

const DRIVE_END = EX_DRIVE.domain[1];
/** Where the rate peaks — the point L3 left unexplained. */
const RATE_PEAK_T = EX_DRIVE.turningPoints![0]!;

/** The sliver's anchor, chosen well inside the certified rising stretch. */
const X0 = 1.4;
const H_INITIAL = 1.2;
const H_FINAL = 0.05;

/** Where the second, independently-accumulated total begins (the "lower-limit" beat). */
const SHIFT_A = 3;

const FINE = 400;

/** A prefix-sum table for `∫_from^x f`, built by summation alone. */
function buildPrefixTable(
  from: number,
  to: number,
): readonly { readonly x: number; readonly total: number }[] {
  const dx = (to - from) / FINE;
  const out: { x: number; total: number }[] = [{ x: from, total: 0 }];
  let acc = 0;
  for (let i = 0; i < FINE; i += 1) {
    acc += EX_DRIVE.f(from + (i + 0.5) * dx) * dx;
    out.push({ x: from + (i + 1) * dx, total: acc });
  }
  return out;
}

function lookup(
  table: readonly { readonly x: number; readonly total: number }[],
  x: number,
): number {
  const lo0 = table[0]!.x;
  const hi0 = table[table.length - 1]!.x;
  const clamped = Math.min(hi0, Math.max(lo0, x));
  const idx = Math.min(
    table.length - 2,
    Math.max(0, Math.floor(((clamped - lo0) / (hi0 - lo0)) * (table.length - 1))),
  );
  const lo = table[idx]!;
  const hi = table[idx + 1]!;
  const t = (clamped - lo.x) / (hi.x - lo.x || 1);
  return lo.total + t * (hi.total - lo.total);
}

const TOTALS_FROM_0 = buildPrefixTable(0, DRIVE_END);
/** `A(x) = ∫_0^x f` — a prefix sum, never the declared antiderivative. */
const A0 = (x: number): number => lookup(TOTALS_FROM_0, x);

const TOTALS_FROM_SHIFT = buildPrefixTable(SHIFT_A, DRIVE_END);
/** A second, INDEPENDENTLY accumulated total starting at `SHIFT_A`. */
const A_SHIFT = (x: number): number => lookup(TOTALS_FROM_SHIFT, x);

function tex(value: string | (() => string), size: number, fill: string = ROLE.text): Latex {
  return new Latex({ tex: value as never, fontSize: size, fill });
}

export const ftcAccumulateThenMeasureScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);
  const beats = (id: string) => requireBeats(SCENE_ID, id);

  const hSig = createSignal(H_INITIAL);
  const markerX = createSignal(0);
  const sliverOpacity = createSignal(0);
  const squeezeOpacity = createSignal(0);
  const shiftOpacity = createSignal(0);
  const tangentOpacity = createSignal(0);

  const ratePx = (x: number, y: number): Vector2 =>
    new Vector2(
      RATE.x - RATE_W / 2 + (x / DRIVE_END) * RATE_W,
      RATE.y + RATE_H / 2 - ((y - RATE_LO) / (RATE_HI - RATE_LO)) * RATE_H,
    );
  const totalPx = (x: number, y: number): Vector2 =>
    new Vector2(
      TOTAL.x - TOTAL_W / 2 + (x / DRIVE_END) * TOTAL_W,
      TOTAL.y + TOTAL_H / 2 - ((y - TOT_LO) / (TOT_HI - TOT_LO)) * TOTAL_H,
    );

  /* ------------------------------------------------------------ the panels */

  const ratePanel = new Rect({
    x: RATE.x, y: RATE.y, width: RATE_W + 24, height: RATE_H + 24,
    radius: 10, stroke: ROLE.grid, lineWidth: 1.5, clip: true,
  });
  view.add(ratePanel);
  const rateInner = new Node({ position: new Vector2(-RATE.x, -RATE.y) });
  ratePanel.add(rateInner);

  const totalPanel = new Rect({
    x: TOTAL.x, y: TOTAL.y, width: TOTAL_W + 24, height: TOTAL_H + 24,
    radius: 10, stroke: ROLE.grid, lineWidth: 1.5, clip: true,
  });
  view.add(totalPanel);
  const totalInner = new Node({ position: new Vector2(-TOTAL.x, -TOTAL.y) });
  totalPanel.add(totalInner);

  rateInner.add(new Line({
    stroke: ROLE.axis, lineWidth: 2, points: [ratePx(0, 0), ratePx(DRIVE_END, 0)],
  }));
  totalInner.add(new Line({
    stroke: ROLE.axis, lineWidth: 2, points: [totalPx(0, 0), totalPx(DRIVE_END, 0)],
  }));

  /* -------------------------------------------------------------- curves */

  rateInner.add(new Line({
    key: "semantic:ftc:rate",
    stroke: ROLE.original,
    lineWidth: 4,
    points: () => {
      const pts: Vector2[] = [];
      for (let i = 0; i <= 200; i += 1) {
        const x = (DRIVE_END * i) / 200;
        pts.push(ratePx(x, EX_DRIVE.f(x)));
      }
      return pts;
    },
  }));

  rateInner.add(new Circle({
    key: "semantic:ftc:peakMarker",
    size: 14, fill: ROLE.selected,
    position: () => ratePx(markerX(), EX_DRIVE.f(markerX())),
  }));

  totalInner.add(new Line({
    key: "semantic:ftc:total",
    stroke: ROLE.transformed,
    lineWidth: 4,
    points: () => {
      const pts: Vector2[] = [];
      for (let i = 0; i <= 200; i += 1) {
        const x = (DRIVE_END * i) / 200;
        pts.push(totalPx(x, A0(x)));
      }
      return pts;
    },
  }));

  totalInner.add(new Circle({
    key: "semantic:ftc:riseMarker",
    size: 14, fill: ROLE.selected,
    position: () => totalPx(markerX(), A0(markerX())),
  }));

  /* --------------------------------------------------------------- sliver */

  /** The band `[x0, x0+h]`, shaded on the rate panel. */
  const sliverBand = new Line({
    key: "semantic:ftc:sliverBand",
    fill: ROLE.result,
    lineWidth: 0,
    closed: true,
    opacity: () => sliverOpacity() * 0.35,
    points: () => [
      ratePx(X0, RATE_LO), ratePx(X0, RATE_HI),
      ratePx(X0 + hSig(), RATE_HI), ratePx(X0 + hSig(), RATE_LO),
    ],
  });
  rateInner.add(sliverBand);

  /** The corresponding rise on the total panel — the sliver `A(x0+h) - A(x0)`. */
  const totalSliver = new Line({
    key: "semantic:ftc:totalSliver",
    stroke: ROLE.result, lineWidth: 8, opacity: sliverOpacity,
    points: () => [
      totalPx(X0 + hSig(), A0(X0)),
      totalPx(X0 + hSig(), A0(X0 + hSig())),
    ],
  });
  totalInner.add(totalSliver);

  /* -------------------------------------------------------------- squeeze */

  /** `m_h h` and `M_h h`: the two bracket rectangles over the sliver's window. */
  const squeezeBar = (which: "lo" | "hi"): Line =>
    new Line({
      key: which === "lo" ? "semantic:ftc:squeezeLow" : "semantic:ftc:squeezeHigh",
      stroke: which === "lo" ? ROLE.basis1 : ROLE.basis2,
      lineWidth: 3, lineDash: [8, 6], opacity: squeezeOpacity,
      points: () => {
        // Monotone on this window (inside the certified rising stretch), so
        // the min and max over [x0, x0+h] are exactly the two endpoint values.
        const y = which === "lo" ? EX_DRIVE.f(X0) : EX_DRIVE.f(X0 + hSig());
        return [ratePx(X0, y), ratePx(X0 + hSig(), y)];
      },
    });
  const squeezeLow = squeezeBar("lo");
  const squeezeHigh = squeezeBar("hi");
  rateInner.add(squeezeLow);
  rateInner.add(squeezeHigh);

  /** The same two bounds, carried onto the total panel as tick marks. */
  const squeezeTick = (which: "lo" | "hi"): Line =>
    new Line({
      stroke: which === "lo" ? ROLE.basis1 : ROLE.basis2,
      lineWidth: 3, lineDash: [8, 6], opacity: squeezeOpacity,
      points: () => {
        const h = hSig();
        const bound = which === "lo" ? EX_DRIVE.f(X0) : EX_DRIVE.f(X0 + h);
        const y = A0(X0) + bound * h;
        return [totalPx(X0, y), totalPx(X0 + h, y)];
      },
    });
  totalInner.add(squeezeTick("lo"));
  totalInner.add(squeezeTick("hi"));

  /** The tangent at x0, slope f(x0) — drawn once the answer is revealed. */
  const tangent = new Line({
    key: "semantic:ftc:tangent",
    stroke: ROLE.selected, lineWidth: 4, opacity: tangentOpacity,
    points: () => {
      const slope = EX_DRIVE.f(X0);
      const w = 1.1;
      return [totalPx(X0 - w, A0(X0) - slope * w), totalPx(X0 + w, A0(X0) + slope * w)];
    },
  });
  totalInner.add(tangent);

  /* ------------------------------------------------------- second total */

  const shiftedTotal = new Line({
    key: "semantic:ftc:shiftedTotal",
    stroke: ROLE.basis2, lineWidth: 4, opacity: shiftOpacity,
    points: () => {
      const pts: Vector2[] = [];
      for (let i = 0; i <= 140; i += 1) {
        const x = SHIFT_A + ((DRIVE_END - SHIFT_A) * i) / 140;
        pts.push(totalPx(x, A_SHIFT(x)));
      }
      return pts;
    },
  });
  totalInner.add(shiftedTotal);

  const shiftGap = new Line({
    stroke: ROLE.textMuted, lineWidth: 2, lineDash: [6, 6], opacity: shiftOpacity,
    points: () => [totalPx(8, A0(8)), totalPx(8, A_SHIFT(8))],
  });
  totalInner.add(shiftGap);

  /* ------------------------------------------------------------ the labels */

  const title = tex("", 30);
  title.position(new Vector2(LABEL_CENTER_X, -235));
  title.opacity(0);
  view.add(title);

  const caption = tex("", 22, ROLE.textMuted);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  caption.opacity(0);
  view.add(caption);

  const equation = tex("", 22, ROLE.selected);
  equation.position(new Vector2(275, -60));
  equation.opacity(0);
  view.add(equation);

  const rateAxisLabel = tex("\\text{rate }f(t)\\ (\\text{m/s})", 18, ROLE.original);
  rateAxisLabel.position(new Vector2(-330, -40));
  view.add(rateAxisLabel);

  const totalAxisLabel = tex("A(t) = \\int_0^t f\\ (\\text{m})", 18, ROLE.transformed);
  totalAxisLabel.position(new Vector2(-335, 180));
  view.add(totalAxisLabel);

  const say = function* (node: Latex, body: string, d: number): ThreadGenerator {
    node.tex(body);
    yield* node.opacity(1, d);
  };
  const roman = (t: string) => `\\text{${t}}`;

  /* ------------------------------------------------------------- the beats */

  const bodies: Record<string, () => ThreadGenerator> = {
    *["loose-end"]() {
      const b = beats("loose-end");
      yield* say(title, roman("L3's loose end"), b.title!);
      yield* markerX(RATE_PEAK_T, b.sweep!, easeInOutCubic);
      yield* say(
        caption,
        roman("A rises fastest exactly where f is highest — why?"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *sliver() {
      const b = beats("sliver");
      yield* say(title, roman("One more step"), b.title!);
      yield* sliverOpacity(1, b.advance!, easeInOutCubic);
      yield* say(caption, roman("the right end advances by h; A gains one sliver"), b.caption!);
      yield* waitFor(b.hold!);
    },

    *squeeze() {
      const b = beats("squeeze");
      yield* say(title, roman("Trapped between two rectangles"), b.title!);
      yield* squeezeOpacity(1, b.bars!, easeInOutCubic);
      yield* say(
        equation,
        `m_h \\le \\dfrac{A(x_0+h)-A(x_0)}{h} \\le M_h`,
        b.reveal!,
      );
      yield* say(caption, roman("both bars are the rate itself, at the two ends of the step"), b.caption!);
      yield* waitFor(b.hold!);
    },

    *predict() {
      const b = beats("predict");
      title.fontSize(26);
      yield* say(
        title,
        `\\begin{gathered} ${roman("As the step shrinks, the two bars close on something.")} \\\\ ${roman("On what?")} \\end{gathered}`,
        b.ask!,
      );
      yield* waitFor(b.think!);
    },

    *close() {
      const b = beats("close");
      title.fontSize(30);
      yield* say(title, roman("They close on f(x)"), b.title!);
      yield* hSig(H_FINAL, b.shrink!, easeInOutCubic);
      yield* say(equation, `A'(x) = f(x)`, b.reveal!);
      yield* say(
        caption,
        roman("continuity (L1) drives m_h and M_h onto the same number"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *answer() {
      const b = beats("answer");
      yield* say(title, roman("The loose end, explained"), b.title!);
      yield* all(
        sliverOpacity(0, b.connect!, easeInOutCubic),
        squeezeOpacity(0, b.connect!, easeInOutCubic),
        tangentOpacity(1, b.connect!, easeInOutCubic),
      );
      yield* say(
        caption,
        roman("f is A's slope — which is why A rose fastest where f was highest"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *["lower-limit"]() {
      const b = beats("lower-limit");
      yield* say(title, roman("Moving the start"), b.title!);
      equation.tex("A_0(x) - A_3(x) = A_0(3),\\ \\text{a constant}");
      yield* all(
        shiftOpacity(1, b.shift!, easeInOutCubic),
        equation.opacity(1, b.shift!),
      );
      yield* say(
        caption,
        roman("a different lower limit shifts A vertically — its slope does not change"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },
  };

  for (const segment of FTC_ACCUMULATE_SEGMENTS) {
    yield* runSegment(segment.duration, bodies[segment.id]!, `${SCENE_ID}.${segment.id}`);
  }
});
