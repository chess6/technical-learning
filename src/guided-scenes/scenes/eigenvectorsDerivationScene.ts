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
} from "../../math";
import {
  A,
  STEPS,
  assertEigenDerivationDataIsConsistent,
  lerpIdentityTo,
  texNumber,
} from "./eigenDerivationData";
import {
  CANCELLATION_TERMS,
  CHAIN_SCRIPT,
  chainLinesFor,
  resolveCancellationTerm,
  type ChainWitness,
} from "./eigenDerivationScript";
import { EIGEN_DERIVATION_SEGMENTS, requireBeats } from "./sceneTimings";
import { runSegment } from "./sceneKit";

/**
 * Lesson 11's worked-calculation clip — the derivation written out as a chain.
 *
 * Promoted from the laboratory's "Chain" candidate (see the benchmark-lab
 * README). It sits in the worked example, AFTER the introductory clip has shown
 * what an eigenvector is and after the characteristic-equation bridge has shown
 * why the eigenvalues are the roots of `det(A − λI)`. It therefore assumes the
 * phenomenon is understood and teaches the reproducible symbolic procedure.
 *
 * Design thesis: a learner who has watched the geometry still cannot reproduce
 * the argument on paper. Each step — moving λv across, factoring out v,
 * insisting v ≠ 0, concluding the determinant vanishes — is a separate
 * inference, and a clip that keeps them implicit teaches a result rather than a
 * method. So the algebra leads and STAYS: the chain builds downward, nothing is
 * ever cleared, and the closing frame is a derivation the learner could copy.
 * Beside it, a witness shows the one geometric fact licensing the line being
 * written.
 *
 * The clip runs on a PAGE rather than in a void. Mathematical animation is
 * almost always light-on-black; a warm near-white ground with dark serif ink is
 * how the subject is actually read, and at embedded-player size it holds fine
 * strokes and small type better. That treatment is chosen for this lesson and
 * is not a course-wide commitment.
 *
 * Three properties are held by `eigenDerivationScript`, which this file
 * CONSUMES rather than merely agrees with:
 *
 *  - every line's LaTeX is `CHAIN_SCRIPT[i].tex`;
 *  - the witness is dispatched on `CHAIN_SCRIPT[i].witness`, so the singular
 *    demonstration can only run in the beat whose line states the determinant
 *    condition — never in the beat before it;
 *  - the cancellation compares whatever `resolveCancellationTerm` returns for
 *    the declared terms, which is `Av` and `λv` — not `v` and `λv`, whose
 *    difference is `(λ − 1)v` and is not zero.
 */

const SCENE_ID = "eigenvectors-derivation";

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
/**
 * Eleven lines have to fit, because none of them is ever cleared — that is the
 * clip's whole promise. The gap and the sizes are set by that constraint.
 */
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

export const eigenvectorsDerivationScene = makeScene2D(function* (view) {
  assertEigenDerivationDataIsConsistent();
  view.fill(PAPER);

  const beats = (id: string) => requireBeats(SCENE_ID, id);

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

  /* ------------------------------------------------------------- the chain */
  const lines: Latex[] = [];
  const slotY = (index: number) => CHAIN_TOP + index * CHAIN_GAP;
  const stepBack = (duration: number): ThreadGenerator[] =>
    lines
      .slice(0, -1)
      .map((earlier) => earlier.opacity(0.42, duration) as ThreadGenerator);

  const sizeFor = (index: number) =>
    CHAIN_SCRIPT[index]!.small ? CHAIN_SMALL : CHAIN_SIZE;

  /** Write the scripted line at `index`, fresh. */
  const writeLine = function* (
    index: number,
    duration: number,
    fill: string = INK,
  ): ThreadGenerator {
    const node = tex(CHAIN_SCRIPT[index]!.tex, sizeFor(index), fill);
    node.position(new Vector2(CHAIN_X, slotY(lines.length)));
    node.offset([-1, 0]);
    node.opacity(0);
    view.add(node);
    lines.push(node);
    yield* all(node.opacity(1, duration), ...stepBack(duration));
  };

  /**
   * Write the scripted line at `index` by TRANSFORMING the one above it.
   *
   * The node is born carrying the previous line's exact LaTeX, at the previous
   * line's position, and then descends a slot while its `{{ }}` fragments morph
   * into the next form. So `Av − λv = 0` really becomes `(A − λI)v = 0`: the
   * minus and the `= 0` are the same fragments, and the two terms rearrange.
   * Fading in an unrelated complete equation would teach that the step is a
   * substitution rather than a factorization.
   */
  const morphLine = function* (
    index: number,
    duration: number,
    fill: string = INK,
  ): ThreadGenerator {
    const node = tex(CHAIN_SCRIPT[index - 1]!.tex, sizeFor(index), fill);
    node.position(new Vector2(CHAIN_X, slotY(lines.length - 1)));
    node.offset([-1, 0]);
    node.opacity(0);
    view.add(node);
    lines.push(node);
    // The fade-in and the morph SHARE the declared write window. Spending
    // `duration` on each would push the witness that follows into the beat's
    // declared hold, which the beat-intent gate reads as motion during a hold.
    const settle = duration * 0.3;
    const travel = duration - settle;
    yield* node.opacity(1, settle);
    yield* all(
      node.position(new Vector2(CHAIN_X, slotY(lines.length - 1)), travel),
      node.tex(CHAIN_SCRIPT[index]!.tex, travel) as ThreadGenerator,
      ...stepBack(travel),
    );
  };

  /** A running "why" at the foot of the page. One reason at a time. */
  const reason = tex("", 24, INK_SOFT);
  reason.position(new Vector2(CHAIN_X, 252));
  reason.offset([-1, 0]);
  reason.opacity(0);
  view.add(reason);
  const because = function* (body: string, duration: number): ThreadGenerator {
    reason.tex(body);
    yield* reason.opacity(1, duration);
  };

  /* ----------------------------------------------------------- the witness */
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

  const witnessCaption = tex("", 22, INK_SOFT);
  witnessCaption.position(new Vector2(WITNESS.x, WITNESS.y + 196));
  witnessCaption.opacity(0);
  witness.add(witnessCaption);

  /**
   * The running example is the OFF-AXIS eigenpair: an eigenvector along the
   * x-axis makes every arrow in the witness collinear with the axis and reads
   * as "eigenvectors are axes", and its λ is the larger one, which pushes Av
   * past the panel edge.
   */
  const RUNNING = STEPS[1]!;
  const V: MathVector2 = RUNNING.direction;
  const vLen = createSignal(1.6);
  const lambdaShown = createSignal(RUNNING.lambda);

  const cancellationContext = () => ({
    v: [V[0] * vLen(), V[1] * vLen()] as const,
    av: matrixVectorMultiply(A, [V[0] * vLen(), V[1] * vLen()]),
    lambda: lambdaShown(),
  });
  /** Both witness arrows are resolved from the declared cancellation terms. */
  const av = (): MathVector2 =>
    resolveCancellationTerm(
      CANCELLATION_TERMS.minuend,
      cancellationContext(),
    ) as MathVector2;
  const lv = (): MathVector2 =>
    resolveCancellationTerm(
      CANCELLATION_TERMS.subtrahend,
      cancellationContext(),
    ) as MathVector2;

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
   * `Av − λv`, anchored at Av's tip and travelling by `−λv`. Its head reaches
   * the origin exactly, because the difference is zero.
   */
  const subProgress = createSignal(0);
  const subArrow = new Line({
    key: "semantic:eigen-derivation:cancellation",
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

  /**
   * The shifted map's action on the unit square: the singular witness.
   *
   * The flattened square is drawn HEAVILY on purpose. At the running λ the
   * image line is `y = 0`, so the collapsed square lands exactly on the drawn
   * axis; at a hairline weight it reads as "the square vanished" rather than
   * "the square was flattened onto a line", which is the opposite of the point.
   * The stroke thickens as it squashes so the end state is an unmistakable bar
   * lying along the axis.
   */
  const squashT = createSignal(0);
  const square = new Line({
    key: "semantic:eigen-derivation:unit-square",
    closed: true,
    fill: HOT,
    stroke: HOT,
    lineWidth: () => 2 + 5 * squashT(),
    opacity: 0,
    points: () =>
      applyMatrixToUnitSquare(
        lerpIdentityTo(RUNNING.shifted as Matrix2x2, squashT()),
      ).map((p) => wpx(p)),
  });
  witness.add(square);

  /** A symbolic aside, for what will not fit in the chain's line height. */
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
  const shiftedInWitness = tex(
    `A - \\lambda I = \\begin{bmatrix} ${texNumber(A[0][0])} - \\lambda & ${texNumber(A[0][1])} \\\\ ${texNumber(A[1][0])} & ${texNumber(A[1][1])} - \\lambda \\end{bmatrix}`,
    26,
    INK,
  );
  shiftedInWitness.position(new Vector2(WITNESS.x, WITNESS.y - 6));
  aside.add(shiftedInWitness);

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

  /**
   * Bring the witness to the state a scripted line declares.
   *
   * Dispatching on `CHAIN_SCRIPT[i].witness` is what makes the ordering
   * property real: `collapse` is declared on the line that STATES
   * `det(A − λI) = 0`, so the flattening cannot run in the beat before it
   * without editing the script — which fails a test.
   */
  const showWitness = function* (
    kind: ChainWitness,
    duration: number,
  ): ThreadGenerator {
    switch (kind) {
      case "scale":
        witnessCaption.tex("\\text{A only scales this one}");
        yield* all(
          vArrow.opacity(1, duration),
          vLabel.opacity(1, duration),
          avArrow.opacity(1, duration),
          avLabel.opacity(1, duration),
          lvArrow.opacity(1, duration),
          lvLabel.opacity(1, duration),
          witnessCaption.opacity(1, duration),
        );
        return;
      case "cancel":
        witnessCaption.tex("A\\mathbf{v} - \\lambda\\mathbf{v} = \\mathbf{0}");
        yield* all(
          subArrow.opacity(1, duration),
          vArrow.opacity(0.22, duration),
          vLabel.opacity(0.22, duration),
          witnessCaption.opacity(1, duration),
        );
        return;
      case "one-map":
        witnessCaption.tex("\\text{one map now, not two}");
        yield* all(
          vArrow.opacity(0.9, duration),
          vLabel.opacity(0.9, duration),
          avArrow.opacity(0, duration),
          avLabel.opacity(0, duration),
          lvArrow.opacity(0, duration),
          lvLabel.opacity(0, duration),
          subArrow.opacity(0, duration),
          witnessCaption.opacity(1, duration),
        );
        return;
      case "nonzero":
        witnessCaption.tex("\\text{a direction, not the origin}");
        yield* all(
          vArrow.opacity(0.9, duration),
          vLabel.opacity(1, duration),
          witnessCaption.opacity(1, duration),
        );
        return;
      case "collapse":
        // The demonstration. Reached only from the line that states the
        // condition, because that is the line the script attaches it to.
        witnessCaption.tex("\\text{watch the unit square}");
        squashT(0);
        yield* all(
          square.opacity(0.3, duration),
          vArrow.opacity(0.3, duration),
          witnessCaption.opacity(1, duration),
        );
        return;
      case "shifted-matrix":
        // The caption belongs to the collapse that has just finished; leaving
        // it under the aside would caption the wrong picture.
        witnessCaption.tex("\\text{the entries it is computed from}");
        yield* all(
          square.opacity(0, duration),
          aside.opacity(1, duration),
          witnessCaption.opacity(1, duration),
        );
        return;
      case "roots":
        witnessCaption.tex(
          "\\text{two }\\lambda\\text{ to substitute back}",
        );
        yield* all(aside.opacity(0, duration), witnessCaption.opacity(1, duration));
        return;
      case "eigenspace-0":
      case "eigenspace-1": {
        const index = kind === "eigenspace-0" ? 0 : 1;
        const other = index === 0 ? 1 : 0;
        witnessCaption.tex(
          `A - ${texNumber(STEPS[index]!.lambda)}I\\text{ kills this line}`,
        );
        // Only this root's eigendirection: A − λI kills exactly one of the two
        // lines, so showing both here would say it kills both.
        yield* all(
          vArrow.opacity(0, duration),
          vLabel.opacity(0, duration),
          aside.opacity(0, duration),
          eigenArrows[other]!.arrow.opacity(0, duration),
          eigenArrows[other]!.label.opacity(0, duration),
          eigenArrows[index]!.arrow.opacity(1, duration),
          eigenArrows[index]!.label.opacity(1, duration),
          witnessCaption.opacity(1, duration),
        );
        return;
      }
      default: {
        const unknown: never = kind;
        throw new Error(`eigenvectorsDerivationScene: unknown witness ${unknown}`);
      }
    }
  };

  /**
   * Write every line a segment owns, with its declared witness.
   *
   * Each line gets its OWN declared pair of windows — `write`/`witness` for the
   * first, `write2`/`witness2` for the second — because a beat that writes two
   * lines out of one pair spends the second line's time inside the window the
   * intent table calls a hold. Missing windows throw rather than defaulting, so
   * adding a line to `CHAIN_SCRIPT` without budgeting for it fails at render
   * time instead of quietly stealing the hold.
   */
  const runChainBeat = function* (beat: string): ThreadGenerator {
    const b = beats(beat);
    const window = (name: string): number => {
      const value = b[name];
      if (typeof value !== "number") {
        throw new Error(
          `eigenvectorsDerivationScene: ${SCENE_ID}.${beat} writes a line with no declared "${name}" window.`,
        );
      }
      return value;
    };
    for (const [ordinal, line] of chainLinesFor(beat).entries()) {
      const suffix = ordinal === 0 ? "" : String(ordinal + 1);
      const index = CHAIN_SCRIPT.indexOf(line);
      if (line.morphsFromPrevious) {
        yield* morphLine(
          index,
          window(`write${suffix}`),
          line.witness === "one-map" ? COOL : INK,
        );
      } else {
        yield* writeLine(
          index,
          window(`write${suffix}`),
          line.witness === "collapse" || line.witness === "roots" ? HOT : INK,
        );
      }
      yield* showWitness(line.witness, window(`witness${suffix}`));
    }
    yield* waitFor(window("hold"));
  };

  const bodies: Record<string, () => ThreadGenerator> = {
    *defining() {
      const b = beats("defining");
      yield* all(given.opacity(1, b.open!), witness.opacity(1, b.open!));
      yield* runChainBeat("defining");
      yield* because("\\text{definition}", b.reason!);
    },

    *gather() {
      const b = beats("gather");
      yield* runChainBeat("gather");
      yield* because(
        "\\text{subtract }\\lambda\\mathbf{v}\\text{ from both sides}",
        b.reason!,
      );
      // The subtraction is WALKED: Av − λv reaches the origin exactly.
      yield* subProgress(1, b.walk!, easeInOutCubic);
      yield* originDot.size(26, b.pulseUp!);
      yield* originDot.size(11, b.pulseDown!);
    },

    *factor() {
      const b = beats("factor");
      yield* runChainBeat("factor");
      yield* because(
        "\\text{factor }\\mathbf{v}\\text{ out — }I\\text{ makes the shapes match}",
        b.reason!,
      );
      yield* waitFor(b.hold2!);
    },

    *nonzero() {
      const b = beats("nonzero");
      yield* runChainBeat("nonzero");
      yield* because(
        "\\text{otherwise every }\\lambda\\text{ would qualify, and none would mean anything}",
        b.reason!,
      );
      yield* waitFor(b.hold2!);
    },

    *singular() {
      const b = beats("singular");
      // No collapse here: the script attaches the demonstration to the NEXT
      // line, the one that states the determinant condition.
      yield* runChainBeat("singular");
      yield* because(
        "\\text{an invertible map sends only }\\mathbf{0}\\text{ to }\\mathbf{0}",
        b.reason!,
      );
      yield* waitFor(b.hold2!);
    },

    *predict() {
      const b = beats("predict");
      // Nothing moves: every line the answer follows from is already written
      // and stays written, which is what makes this answerable rather than a
      // guess. Only the question at the foot of the page changes.
      yield* because(
        "\\text{a nonzero }\\mathbf{v}\\text{ is sent to }\\mathbf{0}\\text{ — what must }\\det(A - \\lambda I)\\text{ be?}",
        b.ask!,
      );
      yield* waitFor(b.think!);
    },

    *determinant() {
      const b = beats("determinant");
      // The condition is stated first; `showWitness("collapse")` then brings up
      // the square, and only after that does it flatten.
      yield* runChainBeat("determinant");
      yield* because("\\text{flattened area is zero area}", b.reason!);
      yield* all(
        squashT(1, b.squash!, easeInOutCubic),
        square.opacity(0.85, b.squash!),
      );
      witnessCaption.tex(
        `\\text{area factor } = ${texNumber(determinant2x2(RUNNING.shifted as Matrix2x2))}\\text{ — one line left}`,
      );
      yield* witnessCaption.opacity(1, b.readout!);
      yield* waitFor(b.hold2!);
    },

    *expand() {
      const b = beats("expand");
      yield* runChainBeat("expand");
      yield* because(
        "\\text{subtract }\\lambda\\text{ down the diagonal}",
        b.reason!,
      );
      yield* waitFor(b.hold2!);
    },

    *roots() {
      const b = beats("roots");
      yield* runChainBeat("roots");
      yield* because("\\text{the two roots}", b.reason!);
      yield* waitFor(b.hold2!);
    },

    *eigenspaces() {
      const b = beats("eigenspaces");
      yield* runChainBeat("eigenspaces");
      yield* because(
        "\\text{substitute each root back and solve}",
        b.reason!,
      );
      // Back under A, both lines belong together: each is scaled by its own λ,
      // which is true of both at once.
      witnessCaption.tex("\\text{under }A\\text{: each keeps its line}");
      yield* all(
        eigenArrows[0]!.arrow.opacity(1, b.both!),
        eigenArrows[0]!.label.opacity(1, b.both!),
        witnessCaption.opacity(1, b.both!),
      );
      yield* waitFor(b.hold2!);
    },
  };

  for (const segment of EIGEN_DERIVATION_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `${SCENE_ID}.${segment.id}`,
    );
  }
});
