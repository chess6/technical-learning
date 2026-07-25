import { Circle, Rect, Txt, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { rankNullityCount, type Matrix } from "../../math";
import { RANK_NULLITY_SEGMENTS, requireBeats } from "./sceneTimings";
import {
  ROLE,
  formatLedgerTally,
  makeLabel,
  makeOverlayLabel,
  runSegment,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * Lesson 9 Watch scene — "Dimension & Rank–Nullity", as a LEDGER.
 *
 * Lesson 8 already owns the geometric picture of collapse; drawing it again
 * would teach nothing new. What L9 adds is an accounting claim, so the scene is
 * an accounting device: n tokens enter, each is posted to exactly one of two
 * columns, and the running total never changes.
 *
 * The tokens are created ONCE and only ever moved. That is the whole point —
 * conservation has to be visible as motion. If a token were deleted from one
 * column and a new one drawn in the other, the scene would be asserting the law
 * rather than showing it.
 *
 * Honest labelling: a caption states that the tokens are *dimensions*, not
 * vectors, and that no particular input direction is identified as "the one that
 * died" — only the counts are canonical (insight contract §13).
 */

const SCENE_ID = "rank-nullity";

/** The L8 map the learner already watched collapse: rank 2, nullity 1. */
const SQUARE_RANK_TWO: Matrix = [
  [1, 0, 2],
  [0, 1, 3],
  [1, 1, 5],
];
/** Degraded further: rank 1, nullity 2. */
const SQUARE_RANK_ONE: Matrix = [
  [1, 2, 3],
  [2, 4, 6],
  [3, 6, 9],
];
/** Wide 2×3: budget 3, ceiling 2 — so nullity ≥ 1 is forced. */
const WIDE: Matrix = [
  [1, 2, 3],
  [0, 1, 4],
];

const COUNT_TWO = rankNullityCount(SQUARE_RANK_TWO);
const COUNT_ONE = rankNullityCount(SQUARE_RANK_ONE);
const COUNT_WIDE = rankNullityCount(WIDE);

function assertSceneMathIsConsistent(): void {
  for (const [name, count, rank, nullity] of [
    ["rank-2 square", COUNT_TWO, 2, 1],
    ["rank-1 square", COUNT_ONE, 1, 2],
    ["wide 2×3", COUNT_WIDE, 2, 1],
  ] as const) {
    if (count.rank !== rank || count.nullity !== nullity) {
      throw new Error(`rankNullityScene: ${name} is not rank ${rank}/nullity ${nullity}.`);
    }
    if (!count.balances) {
      throw new Error(`rankNullityScene: ${name} ledger does not balance.`);
    }
  }
  // The wide map's ceiling is what forbids injectivity; assert it really is lower
  // than the budget, or the final two beats would be claiming something false.
  if (COUNT_WIDE.outputDimension >= COUNT_WIDE.inputDimension) {
    throw new Error("rankNullityScene: the wide example does not have a lower ceiling.");
  }
}

const SURVIVED_X = 96;
const CRUSHED_X = 320;
const COLUMN_TOP = -56;
const SLOT_GAP = 62;
const STACK_X = -290;

/** Where token `i` sits when parked in the input stack. */
const stackSlot = (i: number): Vector2 =>
  new Vector2(STACK_X, COLUMN_TOP + i * SLOT_GAP);
/** Where the `i`-th token in a column sits. */
const columnSlot = (x: number, i: number): Vector2 =>
  new Vector2(x, COLUMN_TOP + i * SLOT_GAP);

export const rankNullityScene = makeScene2D(function* (view) {
  assertSceneMathIsConsistent();
  view.fill(ROLE.background);

  // --- Column frames ---
  const survivedFrame = new Rect({
    width: 168,
    height: 3 * SLOT_GAP + 24,
    x: SURVIVED_X,
    y: COLUMN_TOP + SLOT_GAP,
    radius: 14,
    stroke: ROLE.basis1,
    lineWidth: 2,
    opacity: 0.5,
  });
  view.add(survivedFrame);
  const crushedFrame = new Rect({
    width: 168,
    height: 3 * SLOT_GAP + 24,
    x: CRUSHED_X,
    y: COLUMN_TOP + SLOT_GAP,
    radius: 14,
    stroke: ROLE.result,
    lineWidth: 2,
    opacity: 0.5,
  });
  view.add(crushedFrame);

  /** The greyed band that marks slots the output space cannot hold. */
  const ceilingBand = new Rect({
    width: 168,
    height: SLOT_GAP,
    x: SURVIVED_X,
    y: COLUMN_TOP + 2 * SLOT_GAP,
    radius: 10,
    fill: ROLE.violation,
    opacity: 0,
  });
  view.add(ceilingBand);
  const ceilingNote = makeLabel("no room", ROLE.textMuted, 22);
  ceilingNote.position(new Vector2(SURVIVED_X, COLUMN_TOP + 2 * SLOT_GAP));
  ceilingNote.opacity(0);
  view.add(ceilingNote);

  const survivedTitle = makeLabel("survived → rank", ROLE.basis1, 24);
  survivedTitle.position(new Vector2(SURVIVED_X, COLUMN_TOP - 62));
  view.add(survivedTitle);
  const crushedTitle = makeLabel("crushed → nullity", ROLE.result, 24);
  crushedTitle.position(new Vector2(CRUSHED_X, COLUMN_TOP - 62));
  view.add(crushedTitle);
  const stackTitle = makeLabel("input dimensions", ROLE.original, 24);
  stackTitle.position(new Vector2(STACK_X, COLUMN_TOP - 62));
  view.add(stackTitle);

  // --- The three tokens. Created once; only ever MOVED. ---
  const tokens = [0, 1, 2].map((i) => {
    const token = new Circle({
      size: 42,
      fill: ROLE.original,
      stroke: ROLE.background,
      lineWidth: 3,
      position: stackSlot(i),
    });
    view.add(token);
    return token;
  });

  // --- Running tally, DERIVED from the live split ---
  //
  // The tally used to be written by hand at each beat, so a token in mid-flight
  // sat under a total that did not yet include it. It is now a function of the
  // same two counters `post`/`place` update, and the total is their SUM rather
  // than a third number that could be typed wrong: the ledger cannot report a
  // state the tokens are not in, and cannot fail to balance.
  const survivedCount = createSignal(0);
  const crushedCount = createSignal(0);
  const tally = makeLabel(
    () => formatLedgerTally(survivedCount(), crushedCount()),
    ROLE.text,
    30,
  );
  tally.position(new Vector2(LABEL_CENTER_X + 40, COLUMN_TOP + 3 * SLOT_GAP + 34));
  view.add(tally);

  const shapeLabel = makeLabel("", ROLE.textMuted, 24);
  shapeLabel.position(new Vector2(STACK_X, COLUMN_TOP + 3 * SLOT_GAP + 34));
  view.add(shapeLabel);

  // --- Overlays ---
  const top = makeOverlayLabel("Three dimensions go in", ROLE.text, 34);
  top.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  view.add(top);
  const caption = makeOverlayLabel("", ROLE.textMuted, 25);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  view.add(caption);
  const setTop = (s: string) => top.text(s);
  const setCaption = (s: string) => caption.text(s);

  const honestNote = new Txt({
    text: "tokens are dimensions, not vectors — only the counts are canonical",
    fill: ROLE.dim,
    fontSize: 19,
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    // Placed ABOVE the columns, between the title and the column headings. The
    // bottom band belongs to the caption, which wraps to two lines on the longer
    // beats and would ride over anything parked there.
    position: new Vector2(LABEL_CENTER_X, COLUMN_TOP - 100),
  });
  view.add(honestNote);

  /**
   * Move a token to a column slot, colouring it by its fate. The counters are
   * updated when the token ARRIVES, so the tally and the picture agree at every
   * frame, including mid-flight.
   */
  function* post(
    index: number,
    column: "survived" | "crushed",
    slot: number,
    duration: number,
  ): ThreadGenerator {
    const token = tokens[index]!;
    const survived = column === "survived";
    token.fill(survived ? ROLE.basis1 : ROLE.result);
    yield* token.position(
      columnSlot(survived ? SURVIVED_X : CRUSHED_X, slot),
      duration,
      easeInOutCubic,
    );
    if (survived) survivedCount(survivedCount() + 1);
    else crushedCount(crushedCount() + 1);
  }

  /** Snap every token to a stated split, for beats that must read when scrubbed. */
  function place(rank: number): void {
    let s = 0;
    let c = 0;
    tokens.forEach((token, i) => {
      if (i < rank) {
        token.fill(ROLE.basis1);
        token.position(columnSlot(SURVIVED_X, s));
        s += 1;
      } else {
        token.fill(ROLE.result);
        token.position(columnSlot(CRUSHED_X, c));
        c += 1;
      }
    });
    survivedCount(s);
    crushedCount(c);
  }

  const beats = (id: string) => requireBeats(SCENE_ID, id);

  const bodies: Record<string, () => ThreadGenerator> = {
    *budget() {
      const b = beats("budget");
      setTop("Three dimensions go in");
      setCaption("The input dimension n is a budget. This map is given three independent directions.");
      shapeLabel.text("a 3 × 3 map");
      // Establishing beat: nothing is claimed to move yet (the posting IS the
      // next beat), so the tokens are drawn where they start and are COUNTED
      // OUT one at a time. They are deliberately on screen at t = 0, because
      // that frame is what a paused or reduced-motion learner sees.
      const perToken = b.count! / tokens.length;
      for (const token of tokens) {
        yield* token.size(52, perToken / 2, easeInOutCubic);
        yield* token.size(42, perToken / 2, easeInOutCubic);
      }
      yield* waitFor(b.hold!);
    },

    *post() {
      const b = beats("post");
      setTop("Each one has a fate");
      setCaption("Two directions survive into the image…");
      survivedCount(0);
      crushedCount(0);
      tokens.forEach((token, i) => token.position(stackSlot(i)));
      yield* post(0, "survived", 0, b.p0!);
      yield* post(1, "survived", 1, b.p1!);
      setCaption("…and the third is crushed to zero. Never both fates, never neither.");
      yield* post(2, "crushed", 0, b.p2!);
      yield* waitFor(b.hold!);
    },

    *balance() {
      const b = beats("balance");
      setTop("The books balance");
      place(COUNT_TWO.rank);
      setCaption("2 + 1 = 3. The total is n, the INPUT dimension — the number of directions the map was given.");
      yield* all(
        survivedFrame.opacity(0.9, b.frames!),
        crushedFrame.opacity(0.9, b.frames!),
      );
      yield* waitFor(b.hold!);
    },

    *["predict-degrade"]() {
      const b = beats("predict-degrade");
      setTop("Predict");
      place(COUNT_TWO.rank);
      setCaption("The next map is degraded so that only ONE direction survives.");
      yield* waitFor(b.ask!);
      setCaption(
        "Predict: does a token leave the ledger, does a new one appear, or does one cross over? And what does the total read afterwards?",
      );
      yield* waitFor(b.think!);
    },

    *degrade() {
      const b = beats("degrade");
      setTop("Spend the budget differently");
      setCaption("Watch the second token.");
      place(COUNT_TWO.rank);
      yield* waitFor(b.hold!);
      // The token moves ACROSS — it is not deleted and redrawn. That motion IS
      // the conservation claim, and the tally follows it because both are
      // functions of the same two counters.
      yield* post(1, "crushed", 1, b.move!);
      survivedCount(COUNT_ONE.rank);
      crushedCount(COUNT_ONE.nullity);
      setCaption("It crossed the ledger. 1 + 2 = 3: the split changed, the total could not.");
      yield* waitFor(b.hold2!);
    },

    *ceiling() {
      const b = beats("ceiling");
      setTop("A map with a lower ceiling");
      shapeLabel.text("a 2 × 3 map");
      setCaption("Now the outputs live in a 2-dimensional space. The surviving column has only two slots.");
      place(COUNT_WIDE.rank);
      ceilingBand.opacity(0.55);
      ceilingNote.opacity(1);
      yield* waitFor(b.hold!);
      setCaption("The budget is still 3 — that is set by the inputs. Only the ceiling changed.");
      yield* waitFor(b.hold2!);
    },

    *forbidden() {
      const b = beats("forbidden");
      setTop("So this can never happen");
      setCaption("To be one-to-one, all three tokens would have to survive. There is no third slot.");
      place(COUNT_WIDE.rank);
      ceilingBand.opacity(0.55);
      ceilingNote.opacity(1);
      yield* ceilingBand.opacity(0.85, b.up!);
      yield* ceilingBand.opacity(0.55, b.down!);
      yield* waitFor(b.hold!);
      setCaption("No map from a bigger space to a smaller one is one-to-one — and you did not compute anything to know it.");
      yield* waitFor(b.hold2!);
    },
  };

  for (const segment of RANK_NULLITY_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `${SCENE_ID}.${segment.id}`,
    );
  }
});
