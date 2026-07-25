import { Circle, Rect, Txt, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { rankNullityCount, type Matrix } from "../../math";
import { RANK_NULLITY_SEGMENTS } from "./sceneTimings";
import {
  ROLE,
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
    fill: ROLE.dim,
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

  // --- Running tally ---
  const tally = makeLabel("", ROLE.text, 30);
  tally.position(new Vector2(LABEL_CENTER_X + 40, COLUMN_TOP + 3 * SLOT_GAP + 34));
  view.add(tally);
  const setTally = (rank: number, nullity: number, total: number) =>
    tally.text(`${rank} survived  +  ${nullity} crushed  =  ${total}`);

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

  /** Move a token to a column slot, colouring it by its fate. */
  function* post(index: number, column: "survived" | "crushed", slot: number): ThreadGenerator {
    const token = tokens[index]!;
    token.fill(column === "survived" ? ROLE.basis1 : ROLE.result);
    yield* token.position(
      columnSlot(column === "survived" ? SURVIVED_X : CRUSHED_X, slot),
      0.7,
      easeInOutCubic,
    );
  }

  /** Snap every token to a stated split, for beats that must read when scrubbed. */
  function place(survivedCount: number): void {
    let s = 0;
    let c = 0;
    tokens.forEach((token, i) => {
      if (i < survivedCount) {
        token.fill(ROLE.basis1);
        token.position(columnSlot(SURVIVED_X, s));
        s += 1;
      } else {
        token.fill(ROLE.result);
        token.position(columnSlot(CRUSHED_X, c));
        c += 1;
      }
    });
  }

  const bodies: Record<string, () => ThreadGenerator> = {
    *budget() {
      setTop("Three dimensions go in");
      setCaption("The input dimension n is a budget. This map is given three independent directions.");
      shapeLabel.text("a 3 × 3 map");
      setTally(0, 0, 0);
      yield* waitFor(1.4);
      yield* all(...tokens.map((token) => token.size(50, 0.3)));
      yield* all(...tokens.map((token) => token.size(42, 0.3)));
      yield* waitFor(0.6);
    },

    *post() {
      setTop("Each one has a fate");
      setCaption("Two directions survive into the image…");
      yield* post(0, "survived", 0);
      setTally(1, 0, 1);
      yield* post(1, "survived", 1);
      setTally(2, 0, 2);
      setCaption("…and the third is crushed to zero. Never both fates, never neither.");
      yield* post(2, "crushed", 0);
      setTally(COUNT_TWO.rank, COUNT_TWO.nullity, COUNT_TWO.total);
      yield* waitFor(1);
    },

    *balance() {
      setTop("The books balance");
      place(COUNT_TWO.rank);
      setTally(COUNT_TWO.rank, COUNT_TWO.nullity, COUNT_TWO.total);
      setCaption("2 + 1 = 3. The total is n, the INPUT dimension — the number of directions the map was given.");
      yield* all(
        survivedFrame.opacity(0.9, 0.4),
        crushedFrame.opacity(0.9, 0.4),
      );
      yield* waitFor(1.8);
    },

    *degrade() {
      setTop("Spend the budget differently");
      setCaption("Degrade the map so only one direction survives. Watch what the third token does.");
      place(COUNT_TWO.rank);
      setTally(COUNT_TWO.rank, COUNT_TWO.nullity, COUNT_TWO.total);
      yield* waitFor(1.2);
      // The token moves ACROSS — it is not deleted and redrawn. That motion IS
      // the conservation claim.
      yield* post(1, "crushed", 1);
      setTally(COUNT_ONE.rank, COUNT_ONE.nullity, COUNT_ONE.total);
      setCaption("It crossed the ledger. 1 + 2 = 3: the split changed, the total could not.");
      yield* waitFor(1.8);
    },

    *ceiling() {
      setTop("A map with a lower ceiling");
      shapeLabel.text("a 2 × 3 map");
      setCaption("Now the outputs live in a 2-dimensional space. The surviving column has only two slots.");
      place(COUNT_WIDE.rank);
      setTally(COUNT_WIDE.rank, COUNT_WIDE.nullity, COUNT_WIDE.total);
      ceilingBand.opacity(0.55);
      ceilingNote.opacity(1);
      yield* waitFor(2.2);
      setCaption("The budget is still 3 — that is set by the inputs. Only the ceiling changed.");
      yield* waitFor(1.6);
    },

    *forbidden() {
      setTop("So this can never happen");
      setCaption("To be one-to-one, all three tokens would have to survive. There is no third slot.");
      place(COUNT_WIDE.rank);
      setTally(COUNT_WIDE.rank, COUNT_WIDE.nullity, COUNT_WIDE.total);
      ceilingBand.opacity(0.55);
      ceilingNote.opacity(1);
      yield* all(ceilingBand.opacity(0.85, 0.4), ceilingBand.opacity(0.55, 0.4));
      yield* waitFor(1.4);
      setCaption("No map from a bigger space to a smaller one is one-to-one — and you did not compute anything to know it.");
      yield* waitFor(2);
    },
  };

  for (const segment of RANK_NULLITY_SEGMENTS) {
    yield* runSegment(segment.duration, bodies[segment.id]!);
  }
});
