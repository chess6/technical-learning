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
  applyMatrixToUnitSquare,
  determinant2x2,
  matrixVectorMultiply,
  type Matrix2x2,
  type Vector2 as MathVector2,
} from "../../../math";
import {
  A,
  CHAR_POLY,
  STEPS,
  assertEigenDataIsConsistent,
  lerpIdentityTo,
} from "../eigenExperimentData";
import { CHAIN_SCRIPT } from "../eigenSceneScript";
import { texNumber, texRoman } from "../texFormat";
import { runCandidateBeats } from "../candidateKit";

/**
 * Candidate B — "Chain".
 *
 * Design thesis: a learner who has watched the geometry still cannot reproduce
 * the argument on paper. Each step of the derivation is a separate inference —
 * move λv across, factor out v, insist v ≠ 0, conclude the determinant vanishes
 * — and a clip that keeps them implicit teaches a result rather than a method.
 *
 * So the algebra leads and STAYS. The chain builds downward, nothing is ever
 * cleared, and the finished frame is a written derivation the learner could
 * copy. Beside each line, a small witness shows the one geometric fact that
 * licenses it — a picture in service of a step, which is the opposite of
 * candidate A's arrangement.
 *
 * The cosmetic experiment is deliberate: this clip runs on a PAGE rather than
 * in a void. Mathematical animation is almost always light-on-black; a warm
 * near-white ground with dark serif ink is how the subject is actually read,
 * and at embedded-player size it holds fine strokes and small type far better.
 * Whether that reads as more or less authoritative than the dark treatment is
 * exactly what this candidate exists to find out.
 *
 * Correctness: while a root is substituted back, only that root's eigendirection
 * is drawn — A − 2I kills exactly one of the two lines. Both appear together
 * only in the closing frame, once the argument has returned to A.
 */

/* --------------------------------------------------------------- the page */
const PAPER = "#f4f1ea";
const PAPER_RULE = "#ded8ca";
const INK = "#1c1f26";
const INK_SOFT = "#5c6472";
/** Two accents only, each carrying one meaning, both legible on paper. */
const HOT = "#a8324a";
const COOL = "#1f5f8b";

const CHAIN_X = -424;
const CHAIN_TOP = -206;
// Eleven lines have to fit, because none of them is ever cleared — that is the
// candidate's whole promise. The gap and the sizes are set by that constraint.
const CHAIN_GAP = 42;
const CHAIN_SIZE = 32;
const CHAIN_SMALL = 26;

const WITNESS = new Vector2(296, 6);
const WITNESS_SCALE = 40;
const wpx = (p: MathVector2): Vector2 =>
  new Vector2(WITNESS.x + p[0] * WITNESS_SCALE, WITNESS.y - p[1] * WITNESS_SCALE);

function tex(
  value: Parameters<typeof Latex.prototype.tex>[0] | (() => string),
  size: number,
  fill: string = INK,
): Latex {
  return new Latex({ tex: value as never, fontSize: size, fill });
}

export const eigenChainScene = makeScene2D(function* (view) {
  assertEigenDataIsConsistent();
  view.fill(PAPER);

  // A faint ruled margin: the frame reads as a worked page, not a slide.
  view.add(
    new Line({
      stroke: HOT,
      lineWidth: 1.5,
      opacity: 0.28,
      points: [new Vector2(-452, -270), new Vector2(-452, 270)],
    }),
  );
  for (let y = CHAIN_TOP; y <= 232; y += CHAIN_GAP) {
    view.add(
      new Line({
        stroke: PAPER_RULE,
        lineWidth: 1,
        points: [new Vector2(-464, y + 18), new Vector2(96, y + 18)],
      }),
    );
  }

  /** A pinned at the top of the page: the object the whole argument is about. */
  const given = tex(
    `A = \\begin{bmatrix} ${texNumber(A[0][0])} & ${texNumber(A[0][1])} \\\\ ${texNumber(A[1][0])} & ${texNumber(A[1][1])} \\end{bmatrix}`,
    34,
  );
  given.position(new Vector2(296, -224));
  given.opacity(0);
  view.add(given);

  /**
   * The chain. Each line is written once and stays; earlier lines step back to
   * a reading weight so the newest is the focus without anything being lost.
   */
  const lines: Latex[] = [];
  const slotY = (index: number) => CHAIN_TOP + index * CHAIN_GAP;

  const stepBack = (duration: number): ThreadGenerator[] =>
    lines
      .slice(0, -1)
      .map((earlier) => earlier.opacity(0.42, duration) as ThreadGenerator);

  const writeLine = function* (
    body: string,
    duration: number,
    options: { fill?: string; size?: number } = {},
  ): ThreadGenerator {
    const node = tex(body, options.size ?? CHAIN_SIZE, options.fill ?? INK);
    node.position(new Vector2(CHAIN_X, slotY(lines.length)));
    node.offset([-1, 0]);
    node.opacity(0);
    view.add(node);
    lines.push(node);
    yield* all(node.opacity(1, duration), ...stepBack(duration));
  };

  /**
   * Write the next line by TRANSFORMING the one above it.
   *
   * The new node is born carrying the previous line's exact LaTeX, at the
   * previous line's position, and then descends a slot while its `{{ }}`
   * fragments morph into the next form. So `Av − λv = 0` really does become
   * `(A − λI)v = 0`: the same A, the same minus, the same λ and the same v
   * travel into their new places, one v is consumed, and the brackets and I
   * arrive. Fading in an unrelated complete equation would teach that the step
   * is a substitution rather than a factorization.
   */
  const morphLine = function* (
    fromTex: string,
    toTex: string,
    duration: number,
    options: { fill?: string } = {},
  ): ThreadGenerator {
    const node = tex(fromTex, CHAIN_SIZE, options.fill ?? INK);
    node.position(new Vector2(CHAIN_X, slotY(lines.length - 1)));
    node.offset([-1, 0]);
    node.opacity(0);
    view.add(node);
    lines.push(node);
    yield* node.opacity(1, duration * 0.3);
    yield* all(
      node.position(new Vector2(CHAIN_X, slotY(lines.length - 1)), duration),
      node.tex(toTex, duration) as ThreadGenerator,
      ...stepBack(duration),
    );
  };

  /** The declared LaTeX for a scripted line, so the scene cannot drift from it. */
  const scripted = (index: number): string => CHAIN_SCRIPT[index]!.tex;

  /** A short reason set to the right of the line it justifies. */
  /**
   * A running "why" at the foot of the page. One reason at a time, in a fixed
   * place: a reason column beside the chain would either collide with the
   * witness or force the chain narrower than the mathematics needs.
   */
  const reason = tex("", 24, INK_SOFT);
  reason.position(new Vector2(CHAIN_X, 252));
  reason.offset([-1, 0]);
  reason.opacity(0);
  view.add(reason);
  const because = function* (body: string, duration: number): ThreadGenerator {
    reason.tex(body);
    yield* reason.opacity(1, duration);
  };

  /* --------------------------------------------------------- the witness */
  const witness = new Node({ opacity: 0 });
  view.add(witness);
  witness.add(
    new Rect({
      width: 336,
      height: 336,
      x: WITNESS.x,
      y: WITNESS.y,
      radius: 10,
      fill: "#ffffff",
      stroke: PAPER_RULE,
      lineWidth: 1.5,
    }),
  );
  for (let k = -3; k <= 3; k += 1) {
    const isAxis = k === 0;
    witness.add(
      new Line({
        stroke: isAxis ? INK_SOFT : PAPER_RULE,
        lineWidth: isAxis ? 1.5 : 1,
        points: [wpx([k, -3.6]), wpx([k, 3.6])],
      }),
    );
    witness.add(
      new Line({
        stroke: isAxis ? INK_SOFT : PAPER_RULE,
        lineWidth: isAxis ? 1.5 : 1,
        points: [wpx([-3.6, k]), wpx([3.6, k])],
      }),
    );
  }

  /** Room for a symbolic aside that will not fit in the chain's line height. */
  const aside = new Node({ opacity: 0 });
  view.add(aside);
  aside.add(
    new Rect({
      x: WITNESS.x,
      y: WITNESS.y - 6,
      width: 320,
      height: 108,
      radius: 8,
      fill: "#ffffff",
    }),
  );
  const shiftedInWitness = tex("", 26, INK);
  shiftedInWitness.position(new Vector2(WITNESS.x, WITNESS.y - 6));
  aside.add(shiftedInWitness);

  const witnessCaption = tex("", 22, INK_SOFT);
  witnessCaption.position(new Vector2(WITNESS.x, WITNESS.y + 196));
  witnessCaption.opacity(0);
  witness.add(witnessCaption);

  /**
   * The vector the generic argument is about.
   *
   * The OFF-AXIS eigenpair, for two reasons: an eigenvector along the x-axis
   * makes every arrow in the witness collinear with the axis and reads as
   * "eigenvectors are axes", and its λ is the larger one, which pushes Av past
   * the panel edge. Length is set so Av — which is λ times as long — still
   * fits inside the panel.
   */
  const RUNNING = STEPS[1]!;
  const V: MathVector2 = RUNNING.direction;
  const vLen = createSignal(1.6);
  const lambdaShown = createSignal(RUNNING.lambda);
  const vArrow = new Line({
    stroke: COOL,
    lineWidth: 4,
    endArrow: true,
    arrowSize: 12,
    opacity: 0,
    points: () => [wpx([0, 0]), wpx([V[0] * vLen(), V[1] * vLen()])],
  });
  witness.add(vArrow);
  const vLabel = tex("\\mathbf{v}", 28, COOL);
  vLabel.position(() =>
    wpx([V[0] * vLen(), V[1] * vLen()]).add(new Vector2(-4, 26)),
  );
  vLabel.opacity(0);
  witness.add(vLabel);

  /**
   * `Av`, computed THROUGH A rather than assumed. The cancellation witness has
   * to compare Av with λv — comparing v with λv would show a difference of
   * (λ − 1)v, which is not zero and is not what the line says.
   */
  const av = (): MathVector2 =>
    matrixVectorMultiply(A, [V[0] * vLen(), V[1] * vLen()]);
  const avArrow = new Line({
    stroke: HOT,
    lineWidth: 5,
    endArrow: true,
    arrowSize: 12,
    opacity: 0,
    points: () => [wpx([0, 0]), wpx(av())],
  });
  witness.add(avArrow);
  const avLabel = tex("A\\mathbf{v}", 26, HOT);
  avLabel.position(() => wpx(av()).add(new Vector2(44, 6)));
  avLabel.opacity(0);
  witness.add(avLabel);

  /** λv, drawn on the same ray. For an eigenvector it lands exactly on Av. */
  const lv = (): MathVector2 => [
    V[0] * vLen() * lambdaShown(),
    V[1] * vLen() * lambdaShown(),
  ];
  const lvArrow = new Line({
    stroke: COOL,
    lineWidth: 3,
    lineDash: [9, 7],
    endArrow: true,
    arrowSize: 10,
    opacity: 0,
    points: () => [wpx([0, 0]), wpx(lv())],
  });
  witness.add(lvArrow);
  const lvLabel = tex("\\lambda\\mathbf{v}", 26, COOL);
  lvLabel.position(() => wpx(lv()).add(new Vector2(-30, 34)));
  lvLabel.opacity(0);
  witness.add(lvLabel);

  /**
   * `Av − λv`, anchored at Av's tip and travelling by −λv. Its head reaches the
   * origin exactly, because the difference is zero — the subtraction is enacted
   * rather than asserted.
   */
  const subProgress = createSignal(0);
  const subArrow = new Line({
    stroke: INK,
    lineWidth: 3,
    lineDash: [8, 6],
    endArrow: true,
    arrowSize: 11,
    opacity: 0,
    points: () => {
      const tip = wpx(av());
      const back = wpx([-lv()[0] * subProgress(), -lv()[1] * subProgress()]).sub(
        wpx([0, 0]),
      );
      return [tip, tip.add(back)];
    },
  });
  witness.add(subArrow);

  /** The shifted map's action on the unit square: the singular witness. */
  const squashT = createSignal(0);
  const squashMatrix = createSignal<Matrix2x2>(STEPS[1]!.shifted);
  const square = new Line({
    closed: true,
    fill: HOT,
    stroke: HOT,
    lineWidth: 2,
    opacity: 0,
    points: () =>
      applyMatrixToUnitSquare(
        lerpIdentityTo(squashMatrix(), squashT()),
      ).map((p) => wpx(p)),
  });
  witness.add(square);

  /** The eigendirection being solved for — one at a time, never both. */
  const eigenArrows = STEPS.map((step, index) => {
    const arrow = new Line({
      stroke: index === 0 ? COOL : HOT,
      lineWidth: 4,
      endArrow: true,
      arrowSize: 12,
      opacity: 0,
      points: () => [
        wpx([0, 0]),
        wpx([step.direction[0] * 2.2, step.direction[1] * 2.2]),
      ],
    });
    witness.add(arrow);
    const label = tex(
      `\\lambda = ${texNumber(step.lambda)}`,
      26,
      index === 0 ? COOL : HOT,
    );
    label.position(
      wpx([step.direction[0] * 2.2, step.direction[1] * 2.2]).add(
        new Vector2(index === 0 ? 4 : 10, index === 0 ? -26 : 28),
      ),
    );
    label.opacity(0);
    witness.add(label);
    return { arrow, label, step };
  });

  const originDot = new Circle({ size: 11, fill: INK, position: wpx([0, 0]) });
  witness.add(originDot);

  const bodies: Record<string, () => ThreadGenerator> = {
    *defining() {
      yield* all(given.opacity(1, 0.5), witness.opacity(1, 0.5));
      yield* writeLine(scripted(0), 0.5);
      yield* all(vArrow.opacity(1, 0.5), vLabel.opacity(1, 0.5));
      // Av is computed through A and lands beyond v on the same ray; λv is then
      // drawn on top of it, and the two coincide. That coincidence is the
      // definition, and it is what the next beat cancels.
      yield* all(avArrow.opacity(1, 0.5), avLabel.opacity(1, 0.5));
      witnessCaption.tex(texRoman("A only scales this one"));
      yield* all(
        lvArrow.opacity(1, 0.5),
        lvLabel.opacity(1, 0.5),
        witnessCaption.opacity(1, 0.4),
      );
      yield* because(texRoman("definition"), 0.35);
      yield* waitFor(1.0);
    },

    *gather() {
      yield* morphLine(scripted(0), scripted(1), 0.9);
      yield* because(
        `${texRoman("subtract ")}\\lambda\\mathbf{v}${texRoman(" from both sides")}`,
        0.3,
      );
      // The witness compares Av with λv — not v with λv, whose difference is
      // (λ − 1)v and is not zero. The subtraction is walked: an arrow anchored
      // at Av's tip travels by −λv and reaches the origin exactly.
      witnessCaption.tex("A\\mathbf{v} - \\lambda\\mathbf{v} = \\mathbf{0}");
      yield* all(
        subArrow.opacity(1, 0.4),
        vArrow.opacity(0.22, 0.4),
        vLabel.opacity(0.22, 0.4),
      );
      yield* subProgress(1, 1.5, easeInOutCubic);
      yield* originDot.size(26, 0.35);
      yield* originDot.size(11, 0.3);
      yield* waitFor(0.6);
    },

    *factor() {
      // The factoring is a real symbol move: A, −, λ and one v travel into the
      // bracket, the second v is consumed, and I arrives.
      yield* morphLine(scripted(1), scripted(2), 1.0, { fill: COOL });
      yield* because(texRoman("factor v out — I makes the shapes match"), 0.3);
      witnessCaption.tex(texRoman("one map now, not two"));
      yield* all(
        vArrow.opacity(0.9, 0.5),
        vLabel.opacity(0.9, 0.5),
        avArrow.opacity(0, 0.5),
        avLabel.opacity(0, 0.5),
        lvArrow.opacity(0, 0.5),
        lvLabel.opacity(0, 0.5),
        subArrow.opacity(0, 0.5),
      );
      yield* waitFor(1.6);
    },

    *nonzero() {
      yield* writeLine(`\\mathbf{v} \\neq \\mathbf{0}`, 0.5, { fill: HOT });
      yield* because(
        `${texRoman("otherwise every ")}\\lambda${texRoman(" would qualify, and none would mean anything")}`,
        0.35,
      );
      witnessCaption.tex(texRoman("a direction, not the origin"));
      yield* all(vArrow.lineWidth(7, 0.4), vLabel.opacity(1, 0.4));
      yield* vArrow.lineWidth(4, 0.35);
      yield* waitFor(1.8);
    },

    *singular() {
      yield* writeLine(scripted(4), 0.5);
      yield* because(
        texRoman("an invertible map sends only 0 to 0, and v is not 0"),
        0.35,
      );
      // Deliberately NO collapse here. The square is only brought up at rest:
      // demonstrating the flattening before the determinant line is written
      // would show the consequence ahead of the claim it belongs to.
      witnessCaption.tex(texRoman("so it cannot be undone"));
      squashMatrix(RUNNING.shifted);
      squashT(0);
      yield* all(square.opacity(0.3, 0.5), vArrow.opacity(0.3, 0.5));
      yield* waitFor(1.6);
    },

    *determinant() {
      // The condition is stated FIRST, and the witness then demonstrates it.
      yield* writeLine(scripted(5), 0.6, { fill: HOT });
      yield* because(texRoman("flattened area is zero area"), 0.3);
      witnessCaption.tex(texRoman("watch the unit square"));
      yield* witnessCaption.opacity(1, 0.3);
      yield* squashT(1, 1.6, easeInOutCubic);
      witnessCaption.tex(
        `${texRoman("area factor ")} = ${texNumber(determinant2x2(RUNNING.shifted))}`,
      );
      yield* witnessCaption.opacity(1, 0.35);
      yield* waitFor(1.0);
    },

    *expand() {
      // The polynomial is COMPUTED from the entries that are pinned at the top
      // of the page, not asserted as a formula.
      // The shifted matrix goes in the witness column: it is two chain-slots
      // tall, and the chain has to hold eleven lines at once.
      shiftedInWitness.tex(
        `A - \\lambda I = \\begin{bmatrix} ${texNumber(A[0][0])} - \\lambda & ${texNumber(A[0][1])} \\\\ ${texNumber(A[1][0])} & ${texNumber(A[1][1])} - \\lambda \\end{bmatrix}`,
      );
      yield* all(square.opacity(0, 0.4), aside.opacity(1, 0.5));
      yield* because(
        `${texRoman("subtract ")}\\lambda${texRoman(" down the diagonal")}`,
        0.35,
      );
      yield* writeLine(
        `(${texNumber(A[0][0])} - \\lambda)(${texNumber(A[1][1])} - \\lambda) - (${texNumber(A[0][1])})(${texNumber(A[1][0])}) = 0`,
        0.6,
        { size: CHAIN_SMALL + 2 },
      );
      yield* waitFor(0.9);
      yield* writeLine(
        `\\lambda^2 - ${texNumber(CHAR_POLY.trace)}\\lambda + ${texNumber(CHAR_POLY.determinant)} = 0`,
        0.5,
        { size: CHAIN_SMALL + 2 },
      );
      yield* waitFor(1.0);
    },

    *roots() {
      yield* writeLine(
        `\\lambda = ${STEPS.map((step) => texNumber(step.lambda)).join(", \\;")}`,
        0.5,
        { fill: HOT },
      );
      yield* because(texRoman("the two roots"), 0.35);
      witnessCaption.tex(
        `${texRoman("two ")}\\lambda${texRoman(" to substitute back")}`,
      );
      yield* witnessCaption.opacity(1, 0.4);
      yield* waitFor(2.0);
    },

    *eigenspaces() {
      // One root at a time. A − λI kills exactly ONE of the two lines, so only
      // that line may be drawn while its root is the subject.
      yield* all(
        vArrow.opacity(0, 0.4),
        vLabel.opacity(0, 0.4),
        aside.opacity(0, 0.4),
      );
      for (const [index, step] of STEPS.entries()) {
        yield* writeLine(
          `(A - ${texNumber(step.lambda)}I)\\mathbf{v} = \\mathbf{0} \\;\\Rightarrow\\; \\mathbf{v} \\parallel (${texNumber(step.direction[0] / Math.min(...step.direction.map((c) => (Math.abs(c) < 1e-9 ? Infinity : Math.abs(c)))))}, ${texNumber(step.direction[1] / Math.min(...step.direction.map((c) => (Math.abs(c) < 1e-9 ? Infinity : Math.abs(c)))))})`,
          0.45,
          { size: CHAIN_SMALL },
        );
        witnessCaption.tex(
          `A - ${texNumber(step.lambda)}I${texRoman(" kills this line")}`,
        );
        yield* all(
          eigenArrows[index]!.arrow.opacity(1, 0.45),
          eigenArrows[index]!.label.opacity(1, 0.45),
        );
        yield* waitFor(1.5);
        if (index === 0) {
          // Retire it before the next root: leaving it up would say A − 3I and
          // A − 2I kill the same line.
          yield* all(
            eigenArrows[index]!.arrow.opacity(0, 0.35),
            eigenArrows[index]!.label.opacity(0, 0.35),
          );
        }
      }
      // Back under A, both lines belong on screen together: each is scaled by
      // its own eigenvalue, which is true of both at once.
      witnessCaption.tex(texRoman("under A: each keeps its line"));
      yield* all(
        eigenArrows[0]!.arrow.opacity(1, 0.5),
        eigenArrows[0]!.label.opacity(1, 0.5),
        witnessCaption.opacity(1, 0.4),
      );
      yield* waitFor(1.6);
    },
  };

  yield* runCandidateBeats("chain", bodies, "eigen");
});
