/**
 * What each candidate has on screen, beat by beat — declared, not inferred.
 *
 * Scene modules import `@motion-canvas/2d` and cannot be resolved in jsdom, so
 * a property like "the kernel and the image are never confused" or "the
 * collapse never precedes the line that claims it" could otherwise only be
 * checked by eye. Both scenes drive their visibility from these tables, so the
 * tables ARE the behaviour: a regression has to change one, and changing one
 * fails a test.
 */

/* ------------------------------------------------------------------ knob */

/**
 * A knob beat's stage state.
 *
 * `kernelOf` and `imageOf` index {@link STEPS}. They are separate fields
 * because the two lines are separate objects in different spaces: at λ = 2 the
 * shifted map is `(x, y) ↦ (x + y, 0)`, so the kernel is `y = −x` (inputs that
 * die) and the image is `y = 0` (where the whole plane lands). Drawing both
 * without naming which is which is what made the clip look self-contradictory.
 */
export interface KnobBeatState {
  id: string;
  /** Whose kernel is drawn, or `null` for none. Never two at once. */
  kernelOf: number | null;
  /** Whose image line is labelled, or `null`. */
  imageOf: number | null;
  /** Both eigendirections may share the frame only under A itself. */
  underA: boolean;
}

export const KNOB_BEATS: readonly KnobBeatState[] = [
  { id: "fan", kernelOf: null, imageOf: null, underA: true },
  { id: "eigenlines", kernelOf: null, imageOf: null, underA: true },
  { id: "shift", kernelOf: null, imageOf: null, underA: false },
  { id: "sweep", kernelOf: null, imageOf: null, underA: false },
  { id: "firstZero", kernelOf: null, imageOf: 1, underA: false },
  { id: "kernel1", kernelOf: 1, imageOf: 1, underA: false },
  { id: "secondZero", kernelOf: null, imageOf: 0, underA: false },
  { id: "kernel2", kernelOf: 0, imageOf: 0, underA: false },
  { id: "polynomial", kernelOf: null, imageOf: null, underA: true },
];

export function knobBeat(id: string): KnobBeatState {
  const beat = KNOB_BEATS.find((entry) => entry.id === id);
  if (!beat) throw new Error(`eigenSceneScript: unknown knob beat "${id}"`);
  return beat;
}

/* ----------------------------------------------------------------- chain */

/**
 * What the witness panel is showing. `collapse` is the singular demonstration,
 * and it must never run before the line that states `det(A − λI) = 0`.
 */
export type ChainWitness =
  | "scale"
  | "cancel"
  | "one-map"
  | "nonzero"
  | "collapse"
  | "shifted-matrix"
  | "roots"
  | "eigenspace-0"
  | "eigenspace-1"
  | "both";

export interface ChainLine {
  /** The beat that writes it. */
  beat: string;
  /**
   * The LaTeX written, with `{{ }}` fragments where the line is produced by
   * transforming the line above rather than by appearing from nothing.
   */
  tex: string;
  /** Whether this line is a persistent-symbol transformation of the previous. */
  morphsFromPrevious: boolean;
  witness: ChainWitness;
}

/**
 * The whole derivation, in the order it is written. Nothing is ever cleared, so
 * this list is also the finished frame.
 */
export const CHAIN_SCRIPT: readonly ChainLine[] = [
  {
    beat: "defining",
    tex: String.raw`{{A\mathbf{v}}}{{ = }}{{\lambda\mathbf{v}}}`,
    morphsFromPrevious: false,
    witness: "scale",
  },
  {
    beat: "gather",
    tex: String.raw`{{A\mathbf{v}}}{{ - }}{{\lambda\mathbf{v}}}{{ = \mathbf{0}}}`,
    morphsFromPrevious: true,
    witness: "cancel",
  },
  {
    // The factoring: the same four slots persist. The minus and the `= 0` are
    // literally the same fragments; `Av` becomes `(A` and `λv` becomes
    // `λI)v`. Splitting finer (a fragment per symbol) reads better on paper
    // but typesets each fragment standalone, which loses the kerning between
    // `\lambda` and `I` — the rendering has to stay correct first.
    beat: "factor",
    tex: String.raw`{{(A}}{{ - }}{{\lambda I)\mathbf{v}}}{{ = \mathbf{0}}}`,
    morphsFromPrevious: true,
    witness: "one-map",
  },
  {
    beat: "nonzero",
    tex: String.raw`\mathbf{v} \neq \mathbf{0}`,
    morphsFromPrevious: false,
    witness: "nonzero",
  },
  {
    beat: "singular",
    tex: String.raw`A - \lambda I \text{ is not invertible}`,
    morphsFromPrevious: false,
    // Deliberately NOT `collapse`: the demonstration belongs to the line that
    // states the determinant condition, not to the line before it.
    witness: "nonzero",
  },
  {
    beat: "determinant",
    tex: String.raw`\det(A - \lambda I) = 0`,
    morphsFromPrevious: false,
    witness: "collapse",
  },
  {
    beat: "expand",
    tex: "@shifted-determinant",
    morphsFromPrevious: false,
    witness: "shifted-matrix",
  },
  {
    beat: "expand",
    tex: "@characteristic-polynomial",
    morphsFromPrevious: false,
    witness: "shifted-matrix",
  },
  {
    beat: "roots",
    tex: "@roots",
    morphsFromPrevious: false,
    witness: "roots",
  },
  {
    beat: "eigenspaces",
    tex: "@eigenspace-0",
    morphsFromPrevious: false,
    witness: "eigenspace-0",
  },
  {
    beat: "eigenspaces",
    tex: "@eigenspace-1",
    morphsFromPrevious: false,
    witness: "eigenspace-1",
  },
];

/** Lines written by one beat, in order. */
export function chainLinesFor(beat: string): readonly ChainLine[] {
  return CHAIN_SCRIPT.filter((line) => line.beat === beat);
}

/** Index of the first line whose written statement is the determinant condition. */
export function determinantLineIndex(): number {
  const index = CHAIN_SCRIPT.findIndex((line) => line.tex.includes("\\det("));
  if (index < 0) {
    throw new Error("eigenSceneScript: the chain never states det(A − λI) = 0.");
  }
  return index;
}

/** Index of the first line whose witness is the singular demonstration. */
export function collapseWitnessIndex(): number {
  const index = CHAIN_SCRIPT.findIndex((line) => line.witness === "collapse");
  if (index < 0) {
    throw new Error("eigenSceneScript: nothing demonstrates the collapse.");
  }
  return index;
}

/**
 * The quantities the cancellation witness compares, by name.
 *
 * `Av` against `λv` — NOT `v` against `λv`, whose difference is `(λ − 1)v` and
 * is not zero.
 */
export const CANCELLATION_TERMS = {
  minuend: "Av",
  subtrahend: "lambda-v",
  difference: "zero",
} as const;

export type CancellationTerm =
  (typeof CANCELLATION_TERMS)[keyof typeof CANCELLATION_TERMS];

/**
 * Resolve a named term against a concrete eigenpair.
 *
 * This is what makes the table above load-bearing rather than decorative: the
 * scene draws whatever `resolveCancellationTerm` returns for
 * `CANCELLATION_TERMS.minuend` and `.subtrahend`, so changing the table changes
 * the picture, and drawing something else means bypassing the resolver.
 * Unknown names throw rather than falling back to `v`, which is the mistake the
 * correction was made for.
 */
export function resolveCancellationTerm(
  term: CancellationTerm,
  context: {
    /** The eigenvector, at the length the witness draws it. */
    v: readonly [number, number];
    /** Its image under A, computed through A rather than assumed. */
    av: readonly [number, number];
    lambda: number;
  },
): readonly [number, number] {
  switch (term) {
    case "Av":
      return context.av;
    case "lambda-v":
      return [context.lambda * context.v[0], context.lambda * context.v[1]];
    case "zero":
      return [0, 0];
    default: {
      const unknown: never = term;
      throw new Error(`eigenSceneScript: unknown cancellation term ${unknown}`);
    }
  }
}
