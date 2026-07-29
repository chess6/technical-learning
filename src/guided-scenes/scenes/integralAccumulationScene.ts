import { Latex, Line, Node, Rect, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { EX_DRIVE, riemannSum } from "../../math";
import { INTEGRAL_ACCUMULATION_SEGMENTS, requireBeats } from "./sceneTimings";
import { ROLE, runSegment } from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X } from "./safeFrame";

/**
 * `integral-accumulation` — the one clip.
 *
 * A rate on top, its accumulated total beneath. Rectangles that are *products*,
 * a partition that refines, and a total that ends below its own maximum.
 *
 * **The three honesty obligations this file exists to keep:**
 *
 *  1. **No antiderivative** (package ledger check P1). The running total drawn in
 *     the lower panel is a prefix sum of the *same* midpoint rule the strips use
 *     — `EX_DRIVE` happens to declare a closed-form antiderivative and this scene
 *     never touches it. L4's whole value is that the connection is discovered;
 *     spending it here would spend the package's central payoff.
 *  2. **The summation route is independent of the theorem** (check P4). Every
 *     number on screen comes from `riemannSum` or from `prefixTotals` below, both
 *     of which evaluate only the rate.
 *  3. **Bracketing is claimed only where it holds.** The `bracket` beat runs on
 *     `[0, 2.5]`, where the drive trace is monotone increasing, and its caption
 *     says so. Left and right sums do *not* bracket in general, and the lesson
 *     ships a graded item on exactly that.
 */

const SCENE_ID = "integral-accumulation";

/* --------------------------------------------------------------- geometry */

/**
 * Two stacked panels with a free column on the right for the live readouts, and
 * a free band between them for the product label.
 *
 * The rate and the total are drawn on **separate vertical scales** because they
 * are separate quantities: the rate swings over about 13 m/s while the total
 * swings over about 31 m, and forcing them onto one axis would either flatten
 * the rate to a line or push the total off the panel.
 */
const RATE = new Vector2(-130, -100);
const RATE_W = 500;
const RATE_H = 170;

const TOTAL = new Vector2(-130, 130);
const TOTAL_W = 500;
const TOTAL_H = 130;

/**
 * Fixed vertical ranges, chosen once for the widest interval the clip ever
 * shows. A scale that re-fit itself as the window opened would make the rate
 * appear to change when only the frame had.
 */
const RATE_LO = -8.6;
const RATE_HI = 5.8;
const TOT_LO = -15.5;
const TOT_HI = 17.5;

/** The flat rate the clip opens on, in the drive's own units (m/s). */
const FLAT = 3;
/** The monotone stretch: the drive is strictly increasing on [0, 2.5]. */
const MONOTONE_END = 2.5;
const FULL_END = 10;

/** Sub-intervals used for the running-total polyline. */
const FINE = 240;

function tex(
  value: string | (() => string),
  size: number,
  fill: string = ROLE.text,
): Latex {
  return new Latex({ tex: value as never, fontSize: size, fill });
}

export const integralAccumulationScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);
  const beats = (id: string) => requireBeats(SCENE_ID, id);

  /**
   * Every signal is declared **inside** the generator. A signal at module scope
   * survives between runs, so the Player's second pass would open on the
   * previous pass's final state — the defect A2's Gate 8 record asks the next
   * lessons to carry forward.
   */
  const blend = createSignal(0); // 0 = the flat rate, 1 = the drive trace
  const nSig = createSignal(1);
  const bEnd = createSignal(MONOTONE_END);
  const barGrow = createSignal(0);
  const sweep = createSignal(0);
  /** Which meter the axes are currently labelled for. */
  const meter = createSignal(0);

  const METERS = [
    { rate: "m/s", input: "s", total: "m", name: "distance" },
    { rate: "A", input: "s", total: "C", name: "charge" },
    { rate: "W", input: "s", total: "J", name: "energy" },
  ] as const;
  const unitOf = (part: "rate" | "input" | "total") =>
    METERS[Math.round(meter())]![part];

  /** The rate on screen: the flat rate, the drive, or a blend of the two. */
  const rate = (x: number): number =>
    (1 - blend()) * FLAT + blend() * EX_DRIVE.f(x);

  const n = () => Math.max(1, Math.round(nSig()));
  const sumNow = () => riemannSum(rate, 0, bEnd(), n(), "right");

  const ratePx = (x: number, y: number): Vector2 =>
    new Vector2(
      RATE.x - RATE_W / 2 + (x / bEnd()) * RATE_W,
      RATE.y + RATE_H / 2 - ((y - RATE_LO) / (RATE_HI - RATE_LO)) * RATE_H,
    );
  const totalPx = (x: number, y: number): Vector2 =>
    new Vector2(
      TOTAL.x - TOTAL_W / 2 + (x / bEnd()) * TOTAL_W,
      TOTAL.y + TOTAL_H / 2 - ((y - TOT_LO) / (TOT_HI - TOT_LO)) * TOTAL_H,
    );

  /**
   * Prefix sums of the midpoint rule — the running total, computed the only way
   * this lesson is allowed to compute it. `EX_DRIVE.antiderivative` exists and is
   * deliberately not consulted (P1/P4).
   */
  const prefixTotals = (): { x: number; total: number }[] => {
    const b = bEnd();
    const dx = b / FINE;
    const out = [{ x: 0, total: 0 }];
    let acc = 0;
    for (let i = 0; i < FINE; i += 1) {
      acc += rate((i + 0.5) * dx) * dx;
      out.push({ x: (i + 1) * dx, total: acc });
    }
    return out;
  };

  /* ------------------------------------------------------------ the panels */

  const ratePanel = new Rect({
    x: RATE.x, y: RATE.y, width: RATE_W + 24, height: RATE_H + 24,
    radius: 10, stroke: ROLE.grid, lineWidth: 1.5, clip: true,
  });
  view.add(ratePanel);
  // A clipped Rect positions its children relative to its OWN centre while the
  // pixel helpers return stage coordinates. Every clipped panel in this repo
  // carries this compensating node; the two that did not, in A1, rendered 150px
  // off before it was caught.
  const rateInner = new Node({ position: new Vector2(-RATE.x, -RATE.y) });
  ratePanel.add(rateInner);

  const totalPanel = new Rect({
    x: TOTAL.x, y: TOTAL.y, width: TOTAL_W + 24, height: TOTAL_H + 24,
    radius: 10, stroke: ROLE.grid, lineWidth: 1.5, clip: true, opacity: 0,
  });
  view.add(totalPanel);
  const totalInner = new Node({ position: new Vector2(-TOTAL.x, -TOTAL.y) });
  totalPanel.add(totalInner);

  /* -------------------------------------------------------------- the axes */

  rateInner.add(
    new Line({
      stroke: ROLE.axis, lineWidth: 2,
      points: () => [ratePx(0, 0), ratePx(bEnd(), 0)],
    }),
  );
  totalInner.add(
    new Line({
      stroke: ROLE.axis, lineWidth: 2,
      points: () => [totalPx(0, 0), totalPx(bEnd(), 0)],
    }),
  );

  /* ------------------------------------------------------------ the strips */

  /** The staircase outline of the rectangles: (lo,0) (lo,h) (hi,h) (hi,0), … */
  const staircase = (): Vector2[] => {
    const b = bEnd();
    const count = n();
    const w = b / count;
    const pts: Vector2[] = [];
    for (let i = 0; i < count; i += 1) {
      const lo = i * w;
      const hi = lo + w;
      const h = rate(hi); // right-endpoint sample, as declared
      pts.push(ratePx(lo, 0), ratePx(lo, h), ratePx(hi, h), ratePx(hi, 0));
    }
    return pts;
  };

  const strips = new Line({
    key: "semantic:accumulation:strips",
    stroke: ROLE.result,
    lineWidth: 2.5,
    opacity: 0,
    points: staircase,
  });
  rateInner.add(strips);

  /**
   * The sub-axis parts of the same staircase, over-struck in the violation role.
   * A negative contribution is drawn where it belongs — below the axis — and is
   * never mirrored into a positive bar. Position is the primary cue and the
   * colour is a second one, never the only one.
   */
  const negative = new Line({
    stroke: ROLE.violation,
    lineWidth: 5,
    opacity: 0,
    // ONLY the negative strips. Emitting a degenerate point on the axis for each
    // positive one made the polyline run along the axis beneath them, painting a
    // red line across the whole positive region — the violation role marking
    // contributions that break no rule at all. The drive's negative strips are
    // contiguous, so joining them is the honest staircase.
    points: () => {
      const b = bEnd();
      const count = n();
      const w = b / count;
      const pts: Vector2[] = [];
      for (let i = 0; i < count; i += 1) {
        const hi = (i + 1) * w;
        const h = rate(hi);
        if (h < 0) pts.push(ratePx(i * w, h), ratePx(hi, h));
      }
      // A Line needs two points; park them together where nothing is drawn.
      return pts.length >= 2 ? pts : [ratePx(0, 0), ratePx(0, 0)];
    },
  });
  rateInner.add(negative);

  /* -------------------------------------------------------------- the rate */

  /**
   * Added AFTER the strips so it draws on top of them. At n = 64 the staircase
   * is dense enough to hide the curve underneath it — and the curve is the
   * object; the strips are what approximates it. A refinement beat that buried
   * the thing being approximated shows a texture, not a convergence.
   */
  rateInner.add(
    new Line({
      key: "semantic:accumulation:rate",
      stroke: ROLE.original,
      lineWidth: 4,
      points: () => {
        const b = bEnd();
        const pts: Vector2[] = [];
        for (let i = 0; i <= 200; i += 1) {
          const x = (b * i) / 200;
          pts.push(ratePx(x, rate(x)));
        }
        return pts;
      },
    }),
  );


  /* ------------------------------------------------------- the total panel */

  const totalBar = new Line({
    key: "semantic:accumulation:totalBar",
    stroke: ROLE.selected,
    lineWidth: 10,
    opacity: 0,
    points: () => [
      totalPx(bEnd(), 0),
      totalPx(bEnd(), sumNow() * barGrow()),
    ],
  });
  totalInner.add(totalBar);

  const bracketLine = (which: "lo" | "hi"): Line =>
    new Line({
      key: `semantic:accumulation:bracket${which === "lo" ? "Low" : "High"}`,
      // A co-equal pair, which is exactly what the left and right sums are —
      // `basis1`/`basis2` in the scene colour grammar. They are not "data" and
      // "annotation"; neither is privileged.
      stroke: which === "lo" ? ROLE.basis1 : ROLE.basis2,
      lineWidth: 2,
      lineDash: [10, 8],
      opacity: 0,
      points: () => {
        const b = bEnd();
        const left = riemannSum(rate, 0, b, n(), "left");
        const right = riemannSum(rate, 0, b, n(), "right");
        const y = which === "lo" ? Math.min(left, right) : Math.max(left, right);
        return [totalPx(0, y), totalPx(b, y)];
      },
    });
  const bracketLow = bracketLine("lo");
  const bracketHigh = bracketLine("hi");
  totalInner.add(bracketLow);
  totalInner.add(bracketHigh);

  /** Which bar is which, because colour is never the only cue. */
  const bracketKey = tex(
    () =>
      `\\begin{gathered} \\textcolor{${ROLE.basis2}}{\\text{right sum}} \\\\ \\textcolor{${ROLE.selected}}{\\text{the value}} \\\\ \\textcolor{${ROLE.basis1}}{\\text{left sum}} \\end{gathered}`,
    18,
  );
  bracketKey.position(new Vector2(275, 130));
  bracketKey.opacity(0);
  view.add(bracketKey);

  /**
   * The value the two sums are closing on, computed by the SAME summation route
   * at a fine partition. Not an antiderivative — `EX_DRIVE` declares one and this
   * scene never reads it (P1/P4). "Squeezed, not guessed" is only honest if the
   * thing being squeezed onto was itself produced by squeezing.
   */
  const valueMark = new Line({
    stroke: ROLE.selected,
    lineWidth: 3,
    opacity: 0,
    points: () => {
      const b = bEnd();
      const v = riemannSum(rate, 0, b, 800, "mid");
      return [totalPx(0, v), totalPx(b, v)];
    },
  });
  totalInner.add(valueMark);

  const runningLine = new Line({
    key: "semantic:accumulation:runningTotal",
    stroke: ROLE.transformed,
    lineWidth: 4,
    opacity: 0,
    points: () => {
      const totals = prefixTotals();
      const upTo = Math.max(1, Math.round(sweep() * FINE));
      return totals.slice(0, upTo + 1).map((p) => totalPx(p.x, p.total));
    },
  });
  totalInner.add(runningLine);

  /* ------------------------------------------------------------ the labels */

  const title = tex("", 30);
  title.position(new Vector2(LABEL_CENTER_X, -235));
  title.opacity(0);
  view.add(title);

  const caption = tex("", 23, ROLE.textMuted);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  caption.opacity(0);
  view.add(caption);

  /** The product, written where the learner is looking. */
  const product = tex("", 22, ROLE.result);
  /**
   * Opens INSIDE the single rectangle — the product and the shape it describes
   * are the same claim, and separating them makes the label an annotation rather
   * than a reading. Once the interval is chopped no rectangle is tall enough to
   * hold it, so it moves to the band between the panels; the move happens while
   * the label is invisible, so nothing teleports.
   */
  const PRODUCT_INSIDE = new Vector2(RATE.x, -134);
  const PRODUCT_BELOW = new Vector2(RATE.x, 28);
  product.position(PRODUCT_INSIDE);
  product.opacity(0);
  view.add(product);

  const sumLabel = tex(
    () =>
      `\\begin{gathered} \\sum f(x_i^*)\\,\\Delta x_i \\\\ = ${sumNow().toFixed(2)}\\ \\text{${unitOf("total")}} \\end{gathered}`,
    20,
    ROLE.selected,
  );
  sumLabel.position(new Vector2(275, -95));
  sumLabel.opacity(0);
  view.add(sumLabel);

  const nLabel = tex(() => `n = ${n()}`, 24, ROLE.result);
  nLabel.position(new Vector2(275, -160));
  nLabel.opacity(0);
  view.add(nLabel);

  const rateAxisLabel = tex(
    () => `\\text{rate (${unitOf("rate")})}`,
    18,
    ROLE.original,
  );
  // Placed low-left, not top-left: the rate peaks near the panel's top edge in
  // the middle of the window, and a label parked there was overprinted by it.
  rateAxisLabel.position(new Vector2(-330, -40));
  rateAxisLabel.opacity(0);
  view.add(rateAxisLabel);

  const totalAxisLabel = tex(
    () => `\\text{total (${unitOf("total")})}`,
    18,
    ROLE.transformed,
  );
  totalAxisLabel.position(new Vector2(-335, 180));
  totalAxisLabel.opacity(0);
  view.add(totalAxisLabel);

  const say = function* (node: Latex, body: string, d: number): ThreadGenerator {
    node.tex(body);
    yield* node.opacity(1, d);
  };
  const roman = (t: string) => `\\text{${t}}`;

  /* ------------------------------------------------------------- the beats */

  const bodies: Record<string, () => ThreadGenerator> = {
    *constant() {
      const b = beats("constant");
      yield* say(title, roman("If it never changed"), b.title!);
      yield* all(
        strips.opacity(1, b.draw!),
        rateAxisLabel.opacity(1, b.draw!),
      );
      // The product, with its units, written inside the rectangle: this is the
      // whole lesson in one line, and it is stated before anything varies.
      yield* say(
        product,
        `(${FLAT}\\ \\text{${unitOf("rate")}})(${MONOTONE_END}\\ \\text{${unitOf("input")}}) = ${(FLAT * MONOTONE_END).toFixed(1)}\\ \\text{${unitOf("total")}}`,
        b.units!,
      );
      yield* waitFor(b.hold!);
    },

    *vary() {
      const b = beats("vary");
      yield* say(title, roman("But it does change"), b.title!);
      yield* all(
        blend(1, b.morph!, easeInOutCubic),
        product.opacity(0, b.morph!),
      );
      yield* say(
        caption,
        roman("there is no single number left to multiply by"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *chop() {
      const b = beats("chop");
      // Repositioned while invisible: `vary` faded it out.
      product.position(PRODUCT_BELOW);
      yield* say(title, roman("Short enough to pretend"), b.title!);
      yield* all(nSig(4, b.split!, easeInOutCubic), nLabel.opacity(1, b.split!));
      // One rectangle's product, named on the general pattern rather than on a
      // number, because the numbers now differ from piece to piece.
      yield* say(
        product,
        `f(x_i^*)\\,\\Delta x_i \\;=\\; (\\text{${unitOf("rate")}})(\\text{${unitOf("input")}}) \\;=\\; \\text{${unitOf("total")}}`,
        b.label!,
      );
      yield* say(
        caption,
        roman("on each piece the rate is nearly constant — L1's continuity, spent"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *sum() {
      const b = beats("sum");
      yield* say(title, roman("Add the pieces"), b.title!);
      yield* all(
        totalPanel.opacity(1, b.fill! * 0.4),
        totalBar.opacity(1, b.fill! * 0.4),
        totalAxisLabel.opacity(1, b.fill! * 0.4),
        sumLabel.opacity(1, b.fill! * 0.4),
        barGrow(1, b.fill!, easeInOutCubic),
      );
      yield* say(
        caption,
        roman("four products, added — a Riemann sum"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *predict() {
      const b = beats("predict");
      // The only two-line title in the clip. The band above the rate panel is
      // 73px tall and two lines at 30px need 76, so the question was drawn with
      // its first line cut off by the top of the frame. It is asked a size
      // smaller rather than asked in fewer words.
      title.fontSize(26);
      // Nothing moves.
      yield* say(
        title,
        `\\begin{gathered} ${roman("The pieces are about to be halved, and halved again.")} \\\\ ${roman("Will the total rise, fall, or settle?")} \\end{gathered}`,
        b.ask!,
      );
      yield* waitFor(b.think!);
    },

    *refine() {
      const b = beats("refine");
      title.fontSize(30);
      yield* say(title, roman("It settles"), b.title!);
      yield* nSig(64, b.double!, easeInOutCubic);
      yield* say(
        caption,
        roman("the neighbours force one value — L1's forced value, on a total"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *bracket() {
      const b = beats("bracket");
      yield* all(
        product.opacity(0, b.clear!),
        caption.opacity(0, b.clear!),
        // The bar IS the right sum, so leaving it on screen would draw the upper
        // bracket twice and hide what the pair is closing onto.
        totalBar.opacity(0, b.clear!),
      );
      yield* say(title, roman("Squeezed, not guessed"), b.title!);
      // n comes DOWN continuously rather than snapping, so the bars start far
      // apart and the closing is something the eye can follow.
      yield* all(
        // Down to TWO pieces, and only up to five. The total panel is scaled for
        // a 33-metre swing, so a bracket of a metre is four pixels wide: at the
        // n = 6 → 40 range this beat first used, both bars sat on top of the
        // value marker and the squeeze was invisible. A coarse bracket visibly
        // closing is the content; the limit is the previous beat's job.
        nSig(2, b.draw!, easeInOutCubic),
        bracketLow.opacity(1, b.draw!),
        bracketHigh.opacity(1, b.draw!),
        valueMark.opacity(1, b.draw!),
        bracketKey.opacity(1, b.draw!),
      );
      yield* nSig(5, b.close!, easeInOutCubic);
      yield* say(
        caption,
        roman("left ≤ value ≤ right — because the rate is monotone on this stretch"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *reverse() {
      const b = beats("reverse");
      yield* all(
        bracketLow.opacity(0, b.clear!),
        bracketHigh.opacity(0, b.clear!),
        valueMark.opacity(0, b.clear!),
        bracketKey.opacity(0, b.clear!),
        caption.opacity(0, b.clear!),
      );
      yield* all(negative.opacity(1, b.restore!), totalBar.opacity(1, b.restore!));
      yield* say(title, roman("Going backwards"), b.title!);
      // The window opens onto the reversing segment. Both the interval and the
      // partition move continuously; nothing is swapped in.
      yield* all(
        bEnd(FULL_END, b.extend!, easeInOutCubic),
        nSig(24, b.extend!, easeInOutCubic),
      );
      yield* say(
        caption,
        roman("a negative rate contributes a negative product — the total falls"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *running() {
      const b = beats("running");
      yield* say(title, roman("The other instrument"), b.title!);
      yield* all(
        runningLine.opacity(1, b.sweep! * 0.25),
        totalBar.opacity(0, b.sweep! * 0.25),
        sweep(1, b.sweep!, easeInOutCubic),
      );
      yield* say(
        caption,
        roman("the odometer: A(x), the total so far — it ends below its own maximum"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *meters() {
      const b = beats("meters");
      yield* say(title, roman("One machine, four meters"), b.title!);
      // Nothing about the construction changes — only what the axes are called.
      // That is the claim, so the picture must hold still while it is made.
      meter(1);
      yield* waitFor(b.relabel!);
      meter(2);
      yield* waitFor(b.second!);
      yield* say(
        caption,
        roman("same chop, same products, same limit — the axes decide what you computed"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },
  };

  for (const segment of INTEGRAL_ACCUMULATION_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `${SCENE_ID}.${segment.id}`,
    );
  }
});
