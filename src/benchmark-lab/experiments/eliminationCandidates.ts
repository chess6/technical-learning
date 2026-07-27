/**
 * The elimination animation design experiment.
 *
 * Three complete, playable clips that teach the SAME row operation on the same
 * system by three different pedagogical routes. They exist to be compared, not
 * to be ranked here — the registry deliberately carries no "recommended" flag.
 *
 * Every candidate must:
 *  - make the origin of all three result entries understandable;
 *  - keep the solution (2, −1) visibly unchanged;
 *  - typeset its mathematics through `Latex`, never a monospaced imitation;
 *  - avoid ticking a coefficient continuously from its old value to its new one
 *    (an intermediate like `1.87x − 1.38y = 5.13` is not an equation anybody
 *    wrote, and it is what the production scene currently shows).
 */

export interface CandidateBeat {
  id: string;
  title: string;
  /** Seconds from the start of the clip. */
  at: number;
}

export interface EliminationCandidate {
  id: string;
  /** Short display name in the candidate switcher. */
  title: string;
  /** One line: how this clip explains elimination. */
  strapline: string;
  /** The learning obstacle this composition is aimed at. */
  obstacle: string;
  /** Which representation leads, and what the others do. */
  leadRepresentation: string;
  /** What never leaves the frame. */
  persistent: string;
  /** How the eye is directed. */
  attention: string;
  /** Why its visual language is not a restyling of the others. */
  distinctBecause: string;
  durationSeconds: number;
  beats: readonly CandidateBeat[];
}

export const ELIMINATION_CANDIDATES: readonly EliminationCandidate[] = [
  {
    id: "longhand",
    title: "A · Longhand",
    strapline:
      "The row operation performed as written subtraction, one column at a time.",
    obstacle:
      "The new row's entries appear to come from nowhere. A learner watching numbers change cannot say where −7 or 7 came from, so elimination reads as a rule to memorise rather than arithmetic they could have done.",
    leadRepresentation:
      "The augmented matrix leads throughout. Equations appear only to establish what the rows mean; geometry is withheld entirely until the payoff, so nothing competes with the arithmetic.",
    persistent:
      "R₁ never moves or changes — it is the tool, and its permanence is the point. The matrix bracket stays put while its second row is replaced.",
    attention:
      "Strict left-to-right column order with the rest of the working dimmed; the target column is the only thing in accent colour when it cancels.",
    distinctBecause:
      "It is the only candidate with a scratch working area and a subtraction rule, and the only one that treats the picture as a reward rather than as an explanation.",
    durationSeconds: 37.5,
    beats: [
      { id: "system", title: "The system", at: 0 },
      { id: "matrix", title: "As an augmented matrix", at: 4 },
      { id: "aim", title: "The entry we want to kill", at: 8.2 },
      { id: "copy", title: "Copy R₁", at: 11.8 },
      { id: "double", title: "Double the copy", at: 15.4 },
      { id: "align", title: "Line it up under R₂", at: 19 },
      // The longest beat by design: three columns, each with its own working,
      // and the cancelling column held longer than the other two.
      { id: "subtract", title: "Subtract, column by column", at: 22.2 },
      { id: "promote", title: "Promote the result", at: 29.8 },
      { id: "payoff", title: "The crossing never moved", at: 33 },
    ],
  },
  {
    id: "pivot",
    title: "B · Pivot",
    strapline:
      "Elimination as rotating the second constraint until it stops mentioning x.",
    obstacle:
      "A learner who can do the arithmetic still cannot say what the new equation MEANS, or why replacing a constraint is allowed. The invariance is asserted by a caption instead of seen.",
    leadRepresentation:
      "Geometry leads and fills the frame. Each equation rides as a label attached to its own line, so the algebra is never a separate panel — it is the line's name.",
    persistent:
      "The crossing (2, −1) is on screen from the second beat to the last, and R₁'s line never moves. The pivot happens around a point the learner is already watching.",
    attention:
      "One continuous motion with everything else still. The line sweeps; nothing else in the frame does.",
    distinctBecause:
      "It is the only candidate where the operation is a single continuous geometric motion, and the only one that gives elimination a geometric meaning: the second line rotates through the pencil of constraints until it is horizontal.",
    durationSeconds: 35,
    beats: [
      { id: "plane", title: "Two constraints", at: 0 },
      { id: "crossing", title: "Where they agree", at: 5.2 },
      { id: "predict", title: "Predict: what can move?", at: 9.4 },
      // The pivot itself: two stops of α, each an honest constraint.
      { id: "sweep", title: "The pivot", at: 15.2 },
      { id: "horizontal", title: "It has stopped mentioning x", at: 21.4 },
      { id: "arithmetic", title: "The same move, in numbers", at: 26 },
      { id: "read", title: "Read y, then x", at: 30 },
    ],
  },
  {
    id: "combination",
    title: "C · Search",
    strapline:
      "Why 2, and not some other multiple: searching the legal moves for the one that cancels.",
    obstacle:
      "The multiplier looks pulled out of the air. A learner is told to subtract 2·R₁ without seeing that 2 was chosen, or that other multiples were available and equally legal.",
    leadRepresentation:
      "A dial over the family R₂ + α·R₁ leads. The candidate row is typeset at each integer stop, with its x-coefficient called out; the geometry runs alongside as a small companion confirming that every candidate still passes through the crossing.",
    persistent:
      "The x-coefficient readout, and the family of candidate lines — all of which cross at (2, −1), which is what makes every stop a legal move.",
    attention:
      "A single number under the dial is the focal object; the row and the line are consequences of it.",
    distinctBecause:
      "It is the only candidate that shows the operation being CHOSEN rather than performed, and the only one that draws several alternative results so the learner sees what elimination was selecting from.",
    durationSeconds: 34,
    beats: [
      { id: "legal", title: "A family of legal moves", at: 0 },
      { id: "dial", title: "Turn the dial", at: 5.2 },
      { id: "stops", title: "Watch the x-coefficient", at: 9.2 },
      { id: "zero", title: "α = −2 cancels it", at: 18.4 },
      { id: "why", title: "Why that is worth doing", at: 23.6 },
      { id: "invariant", title: "Every candidate met at (2, −1)", at: 28.4 },
    ],
  },
];

export function getEliminationCandidate(id: string): EliminationCandidate {
  const candidate = ELIMINATION_CANDIDATES.find((c) => c.id === id);
  if (!candidate) {
    throw new Error(`Unknown elimination candidate: "${id}"`);
  }
  return candidate;
}

const SCENE_LOADERS: Record<string, () => Promise<unknown>> = {
  longhand: () =>
    import("./scenes/longhandScene").then((m) => m.longhandScene),
  pivot: () => import("./scenes/pivotScene").then((m) => m.pivotScene),
  combination: () =>
    import("./scenes/combinationScene").then((m) => m.combinationScene),
};

export function getCandidateSceneDescription(id: string): Promise<unknown> {
  const loader = SCENE_LOADERS[id];
  if (!loader) {
    throw new Error(`No scene registered for elimination candidate "${id}".`);
  }
  return loader();
}

export function listCandidateIds(): string[] {
  return ELIMINATION_CANDIDATES.map((c) => c.id);
}
