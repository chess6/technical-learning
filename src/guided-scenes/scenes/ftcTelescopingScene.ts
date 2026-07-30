import { Circle, Latex, Line, Node, Rect, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import {
  EX_GAUSSIAN,
  EX_PARABOLA,
  cancelContributions,
  intervalContributions,
  partitionPoints,
  residual,
  riemannSum,
} from "../../math";
import { FTC_TELESCOPING_SEGMENTS, requireBeats } from "./sceneTimings";
import { ROLE, runSegment } from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X } from "./safeFrame";

/**
 * `fundamental-theorem` clip 2 (placed) — `ftc-telescoping`.
 *
 * The mechanism: `F(b) - F(a)` written as a sum of small changes over an
 * UNEQUAL partition, every interior evaluation appearing once positively and
 * once negatively, so it cancels. Replace each small change with L2's local
 * linear model and the sum becomes a Riemann sum with a visible error; refine
 * and the errors vanish.
 *
 * **Honesty obligations this file exists to keep:**
 *
 *  1. **Unequal by default** (`P2`/mastery-contract). `STAIRCASE_POINTS` uses
 *     `partitionPoints(..., "unequal")`, so equal widths never look necessary.
 *  2. **The cancellation is computed by the GENERIC engine**
 *     (`cancelContributions`/`intervalContributions`), not by assuming "the
 *     survivors are index 0 and index n" — the same engine L34 re-runs over
 *     shared interior edges.
 *  3. **The per-piece error is a REAL, nonzero, computed quantity**
 *     (`residual`, L2's own helper — same symbol, same quantity), never a
 *     decorative gap.
 *  4. **The two corroboration numbers are independently computed.** One comes
 *     from `riemannSum` alone; the other from `EX_PARABOLA.antiderivative`
 *     alone. Neither routine reads the other.
 *  5. **`not-a-recipe` uses a fixture with NO declared antiderivative**
 *     (`EX_GAUSSIAN`) — the theorem still applies numerically, and the scene
 *     never fabricates a closed form for it.
 */

const SCENE_ID = "ftc-telescoping";

/* --------------------------------------------------------------- geometry */

const PANEL_F = new Vector2(-130, -100);
const PANEL_F_W = 500;
const PANEL_F_H = 170;
const F_LO = 0;
const F_HI = 2.8;

const PANEL_STRIP = new Vector2(-130, 130);
const PANEL_STRIP_W = 500;
const PANEL_STRIP_H = 130;
const STRIP_LO = 0;
const STRIP_HI = 4.3;

const DOM_END = EX_PARABOLA.domain[1]; // 2

/** The fixed unequal partition the staircase/identity/cancel beats use. */
const STAIRCASE_N = 5;
const STAIRCASE_POINTS = partitionPoints(0, DOM_END, STAIRCASE_N, "unequal");
const CANCELLATION = cancelContributions(
  intervalContributions(EX_PARABOLA.antiderivative!, STAIRCASE_POINTS),
);

/** The two independent numbers `corroborate` puts side by side. */
const SUMMED_VALUE = riemannSum(EX_PARABOLA.f, 0, DOM_END, 20000, "mid");
const FTC_VALUE = EX_PARABOLA.antiderivative!(DOM_END) - EX_PARABOLA.antiderivative!(0);

function tex(value: string | (() => string), size: number, fill: string = ROLE.text): Latex {
  return new Latex({ tex: value as never, fontSize: size, fill });
}

export const ftcTelescopingScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);
  const beats = (id: string) => requireBeats(SCENE_ID, id);

  const nSig = createSignal(STAIRCASE_N);
  const staircaseOpacity = createSignal(0);
  const landingOpacity = createSignal(1);
  const stripOpacity = createSignal(0);
  const errorOpacity = createSignal(0);
  const gaussianBlend = createSignal(0); // 0 = x^2, 1 = e^(-x^2)
  // A cross-fade in VALUE space, not a hard switch of which fixture answers
  // `.f` — the same technique clip 1 uses for its flat-rate/drive blend. A
  // discrete swap would hold the curve/strips static while `gaussianBlend`
  // visibly animates, then snap them to the new shape — motion claimed but
  // not delivered.
  const stripF = (x: number): number =>
    (1 - gaussianBlend()) * EX_PARABOLA.f(x) + gaussianBlend() * EX_GAUSSIAN.f(x);

  const n = () => Math.max(2, Math.round(nSig()));
  const stripPoints = () => partitionPoints(0, DOM_END, n(), "unequal");

  const fPx = (x: number, y: number): Vector2 =>
    new Vector2(
      PANEL_F.x - PANEL_F_W / 2 + (x / DOM_END) * PANEL_F_W,
      PANEL_F.y + PANEL_F_H / 2 - ((y - F_LO) / (F_HI - F_LO)) * PANEL_F_H,
    );
  const stripPx = (x: number, y: number): Vector2 =>
    new Vector2(
      PANEL_STRIP.x - PANEL_STRIP_W / 2 + (x / DOM_END) * PANEL_STRIP_W,
      PANEL_STRIP.y + PANEL_STRIP_H / 2 - ((y - STRIP_LO) / (STRIP_HI - STRIP_LO)) * PANEL_STRIP_H,
    );

  /* ------------------------------------------------------------ the panels */

  const fPanel = new Rect({
    x: PANEL_F.x, y: PANEL_F.y, width: PANEL_F_W + 24, height: PANEL_F_H + 24,
    radius: 10, stroke: ROLE.grid, lineWidth: 1.5, clip: true, opacity: staircaseOpacity,
  });
  view.add(fPanel);
  const fInner = new Node({ position: new Vector2(-PANEL_F.x, -PANEL_F.y) });
  fPanel.add(fInner);

  const stripPanel = new Rect({
    x: PANEL_STRIP.x, y: PANEL_STRIP.y, width: PANEL_STRIP_W + 24, height: PANEL_STRIP_H + 24,
    radius: 10, stroke: ROLE.grid, lineWidth: 1.5, clip: true, opacity: stripOpacity,
  });
  view.add(stripPanel);
  const stripInner = new Node({ position: new Vector2(-PANEL_STRIP.x, -PANEL_STRIP.y) });
  stripPanel.add(stripInner);

  fInner.add(new Line({ stroke: ROLE.axis, lineWidth: 2, points: [fPx(0, 0), fPx(DOM_END, 0)] }));
  stripInner.add(new Line({ stroke: ROLE.axis, lineWidth: 2, points: [stripPx(0, 0), stripPx(DOM_END, 0)] }));

  /* -------------------------------------------------------- F, and ghost */

  fInner.add(new Line({
    key: "semantic:ftc2:fGhost",
    stroke: ROLE.dim, lineWidth: 2, opacity: 0.6,
    points: () => {
      const pts: Vector2[] = [];
      for (let i = 0; i <= 120; i += 1) {
        const x = (DOM_END * i) / 120;
        pts.push(fPx(x, EX_PARABOLA.antiderivative!(x)));
      }
      return pts;
    },
  }));

  /** The staircase: a step function through the SAME unequal partition. */
  fInner.add(new Line({
    key: "semantic:ftc2:staircase",
    stroke: ROLE.result, lineWidth: 4,
    points: () => {
      const F = EX_PARABOLA.antiderivative!;
      const pts: Vector2[] = [fPx(STAIRCASE_POINTS[0]!, F(STAIRCASE_POINTS[0]!))];
      for (let i = 0; i < STAIRCASE_POINTS.length - 1; i += 1) {
        const x0 = STAIRCASE_POINTS[i]!;
        const x1 = STAIRCASE_POINTS[i + 1]!;
        pts.push(fPx(x1, F(x0))); // tread
        pts.push(fPx(x1, F(x1))); // riser
      }
      return pts;
    },
  }));

  /** Interior landings — each is one term's top AND the next term's bottom. */
  for (const [idx, x] of STAIRCASE_POINTS.slice(1, -1).entries()) {
    fInner.add(new Circle({
      key: `semantic:ftc2:landing:${idx}`,
      size: 12,
      fill: ROLE.basis1,
      opacity: landingOpacity,
      position: fPx(x, EX_PARABOLA.antiderivative!(x)),
    }));
  }

  /** The two survivors — never faded. */
  for (const x of [STAIRCASE_POINTS[0]!, STAIRCASE_POINTS[STAIRCASE_POINTS.length - 1]!]) {
    fInner.add(new Circle({
      size: 16, fill: ROLE.selected,
      position: fPx(x, EX_PARABOLA.antiderivative!(x)),
    }));
  }

  /* --------------------------------------------------------------- strips */

  stripInner.add(new Line({
    key: "semantic:ftc2:curve",
    stroke: ROLE.original, lineWidth: 4,
    points: () => {
      const f = stripF;
      const pts: Vector2[] = [];
      for (let i = 0; i <= 150; i += 1) {
        const x = (DOM_END * i) / 150;
        pts.push(stripPx(x, f(x)));
      }
      return pts;
    },
  }));

  stripInner.add(new Line({
    key: "semantic:ftc2:strips",
    stroke: ROLE.transformed, lineWidth: 2.5,
    points: () => {
      const points = stripPoints();
      const f = stripF;
      const pts: Vector2[] = [];
      for (let i = 0; i < points.length - 1; i += 1) {
        const lo = points[i]!;
        const hi = points[i + 1]!;
        const h = f(lo); // left-sampled: L2's local model at x_i
        pts.push(stripPx(lo, 0), stripPx(lo, h), stripPx(hi, h), stripPx(hi, 0));
      }
      return pts;
    },
  }));

  /** The first piece's error: the true riser vs. the local-linear rectangle. */
  const errorMarker = new Line({
    key: "semantic:ftc2:error",
    stroke: ROLE.violation, lineWidth: 4, opacity: errorOpacity,
    points: () => {
      const points = stripPoints();
      const x0 = points[0]!;
      const x1 = points[1]!;
      const f = stripF;
      return [stripPx(x1, f(x0)), stripPx(x1, f(x1))];
    },
  });
  stripInner.add(errorMarker);

  /* ------------------------------------------------------------ the labels */

  const title = tex("", 30);
  title.position(new Vector2(LABEL_CENTER_X, -235));
  title.opacity(0);
  view.add(title);

  const caption = tex("", 21, ROLE.textMuted);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  caption.opacity(0);
  view.add(caption);

  const equation = tex("", 22, ROLE.selected);
  equation.position(new Vector2(275, -95));
  equation.opacity(0);
  view.add(equation);

  const counter = tex(
    () =>
      // n is the piece/term count (STAIRCASE_N), NOT the raw contribution count:
      // each of the n terms F(x_{i+1})-F(x_i) supplies two raw contributions
      // (once as a "to", once as the next term's "from"), so `CANCELLATION`'s
      // own `termCount` is 2n, not n. The narrative "n contributions, n-1
      // cancellations, two survivors" means n TERMS.
      `\\begin{gathered} n = ${STAIRCASE_N} \\\\ n{-}1 = ${CANCELLATION.cancellingCount} \\\\ \\text{survivors} = ${CANCELLATION.survivors.length} \\end{gathered}`,
    18,
    ROLE.basis1,
  );
  counter.position(new Vector2(275, 40));
  counter.opacity(0);
  view.add(counter);

  const errorLabel = tex(
    () => {
      const points = stripPoints();
      const x0 = points[0]!;
      const dx = points[1]! - x0;
      const f = stripF;
      const E = residual(EX_PARABOLA.antiderivative!, x0, f(x0), dx);
      return `E_0 = ${E.toFixed(4)}`;
    },
    18,
    ROLE.violation,
  );
  errorLabel.position(new Vector2(275, -140));
  errorLabel.opacity(errorOpacity);
  view.add(errorLabel);

  const say = function* (node: Latex, body: string, d: number): ThreadGenerator {
    node.tex(body);
    yield* node.opacity(1, d);
  };
  const roman = (t: string) => `\\text{${t}}`;

  /* ------------------------------------------------------------- the beats */

  const bodies: Record<string, () => ThreadGenerator> = {
    *staircase() {
      const b = beats("staircase");
      yield* say(title, roman("Total rise, with no calculus"), b.title!);
      yield* staircaseOpacity(1, b.draw!, easeInOutCubic);
      yield* say(
        caption,
        roman("every landing is the top of one step and the bottom of the next"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *identity() {
      const b = beats("identity");
      yield* say(title, roman("The same thing, written out"), b.title!);
      yield* say(
        equation,
        `F(b){-}F(a) = [F(x_1){-}F(x_0)] + [F(x_2){-}F(x_1)] + \\cdots + [F(x_n){-}F(x_{n-1})]`,
        b.reveal!,
      );
      yield* say(
        caption,
        roman("an UNEQUAL partition — each interior F(x_i) written twice, opposite signs"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *predict() {
      const b = beats("predict");
      title.fontSize(26);
      yield* say(
        title,
        `\\begin{gathered} ${roman("On an unequal partition, how many of the n contributions")} \\\\ ${roman("survive the cancellation?")} \\end{gathered}`,
        b.ask!,
      );
      yield* waitFor(b.think!);
    },

    *cancel() {
      title.fontSize(30);
      const b = beats("cancel");
      yield* say(title, roman("Everything in the middle goes"), b.title!);
      yield* counter.opacity(1, b.count!);
      yield* landingOpacity(0.12, b.fade!, easeInOutCubic);
      yield* say(
        caption,
        roman("paired interior terms annihilate one by one — the survivors are the two ends"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *["one-step"]() {
      const b = beats("one-step");
      yield* all(
        staircaseOpacity(0.25, b.clear!, easeInOutCubic),
        stripOpacity(1, b.clear!, easeInOutCubic),
      );
      yield* say(title, roman("Calculus enters, once"), b.title!);
      yield* say(
        equation,
        `F(x_{i+1}){-}F(x_i) = f(x_i)\\,\\Delta x_i + E_i`,
        b.reveal!,
      );
      yield* errorOpacity(1, b.mark!, easeInOutCubic);
      yield* say(
        caption,
        roman("E_i is the SAME error L2 drew — it is real, and it is not zero"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *riemann() {
      const b = beats("riemann");
      yield* say(title, roman("That is a Riemann sum"), b.title!);
      yield* say(equation, `\\sum_i f(x_i)\\,\\Delta x_i,\\qquad F' = f`, b.reveal!);
      yield* say(
        caption,
        roman("the replaced terms are exactly L3's rectangles, re-drawn beneath"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *refine() {
      const b = beats("refine");
      yield* say(title, roman("Refine, and it is exact"), b.title!);
      yield* nSig(60, b.mesh!, easeInOutCubic);
      yield* say(
        equation,
        `\\omega(\\delta) = ${EX_PARABOLA.modulus!.label}\\quad(\\text{L1's modulus of continuity})`,
        b.reveal!,
      );
      yield* say(
        caption,
        roman("uniform control on a closed interval — stated with attribution, not proved here"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *corroborate() {
      const b = beats("corroborate");
      yield* all(
        errorOpacity(0, b.clear!, easeInOutCubic),
        nSig(STAIRCASE_N, b.clear!, easeInOutCubic),
      );
      yield* say(title, roman("Two computations, one number"), b.title!);
      yield* say(
        equation,
        `\\text{sum} = ${SUMMED_VALUE.toFixed(4)} \\qquad \\bigl[x^3/3\\bigr]_0^2 = ${FTC_VALUE.toFixed(4)}`,
        b.reveal!,
      );
      yield* say(
        caption,
        roman("computed by two routes that never call each other — both 8/3"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *["not-a-recipe"]() {
      const b = beats("not-a-recipe");
      yield* say(title, roman("What it does not promise"), b.title!);
      yield* gaussianBlend(1, b.swap!, easeInOutCubic);
      yield* say(
        equation,
        `\\int_0^2 e^{-x^2}\\,dx \\approx ${riemannSum(EX_GAUSSIAN.f, 0, DOM_END, 20000, "mid").toFixed(4)}`,
        b.reveal!,
      );
      yield* say(
        caption,
        roman("the theorem applies; no elementary F exists — numerical accumulation stays the method"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },
  };

  for (const segment of FTC_TELESCOPING_SEGMENTS) {
    yield* runSegment(segment.duration, bodies[segment.id]!, `${SCENE_ID}.${segment.id}`);
  }
});
