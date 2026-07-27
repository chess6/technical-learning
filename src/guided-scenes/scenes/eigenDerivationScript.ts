import {
  A,
  CHAR_POLY,
  STEPS,
  integerDirection,
  texNumber,
  type EigenStep,
} from "./eigenDerivationData";
import type { Vector2 as MathVector2 } from "../../math";

/**
 * What the derivation clip writes and what its witness shows, line by line.
 *
 * Motion-Canvas-free, and **consumed** rather than merely documented: the scene
 * writes `CHAIN_SCRIPT[i].tex` and dispatches its witness on
 * `CHAIN_SCRIPT[i].witness`, so a property asserted here is a property of the
 * frames. In particular the collapse can only run in the beat whose line
 * declares it — which is what keeps the singular demonstration from arriving
 * before the statement it demonstrates.
 */

/**
 * What the witness panel is showing. `collapse` is the singular demonstration,
 * and it must never precede the line that states `det(A − λI) = 0`.
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
  | "eigenspace-1";

export interface ChainLine {
  /** The segment that writes it. */
  beat: string;
  /**
   * The LaTeX written. `{{ }}` fragments mark a line produced by TRANSFORMING
   * the line above rather than by appearing from nothing — Motion Canvas
   * matches fragments by their literal text, so a shared fragment travels.
   */
  tex: string;
  /** Whether this line is a persistent-symbol transformation of the previous. */
  morphsFromPrevious: boolean;
  witness: ChainWitness;
  /** Optional smaller type, for the lines that run long. */
  small?: boolean;
}

const eigenspaceLine = (step: EigenStep): string => {
  const direction = integerDirection(step.direction as MathVector2);
  return `(A - ${texNumber(step.lambda)}I)\\mathbf{v} = \\mathbf{0} \\;\\Rightarrow\\; \\mathbf{v} \\parallel (${texNumber(direction[0])}, ${texNumber(direction[1])})`;
};

/**
 * The whole derivation, in the order it is written. Nothing is ever cleared, so
 * this list is also the clip's closing frame.
 */
export const CHAIN_SCRIPT: readonly ChainLine[] = [
  {
    beat: "defining",
    tex: String.raw`{{A\mathbf{v}}}{{ = }}{{\lambda\mathbf{v}}}`,
    morphsFromPrevious: false,
    witness: "scale",
  },
  {
    // The two TERMS stay put while `=` becomes `−` and `= 0` arrives.
    beat: "gather",
    tex: String.raw`{{A\mathbf{v}}}{{ - }}{{\lambda\mathbf{v}}}{{ = \mathbf{0}}}`,
    morphsFromPrevious: true,
    witness: "cancel",
  },
  {
    // The factoring: the minus and the `= 0` are literally the same fragments;
    // `Av` becomes `(A` and `λv` becomes `λI)v`. Splitting finer (a fragment
    // per symbol) reads better on paper but typesets each fragment standalone,
    // which loses the kerning between `\lambda` and `I`.
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
    tex: `(${texNumber(A[0][0])} - \\lambda)(${texNumber(A[1][1])} - \\lambda) - (${texNumber(A[0][1])})(${texNumber(A[1][0])}) = 0`,
    morphsFromPrevious: false,
    witness: "shifted-matrix",
    small: true,
  },
  {
    beat: "expand",
    tex: `\\lambda^2 - ${texNumber(CHAR_POLY.trace)}\\lambda + ${texNumber(CHAR_POLY.determinant)} = 0`,
    morphsFromPrevious: false,
    witness: "shifted-matrix",
    small: true,
  },
  {
    beat: "roots",
    tex: `\\lambda = ${STEPS.map((step) => texNumber(step.lambda)).join(", \\;")}`,
    morphsFromPrevious: false,
    witness: "roots",
  },
  {
    beat: "eigenspaces",
    tex: eigenspaceLine(STEPS[0]!),
    morphsFromPrevious: false,
    witness: "eigenspace-0",
    small: true,
  },
  {
    beat: "eigenspaces",
    tex: eigenspaceLine(STEPS[1]!),
    morphsFromPrevious: false,
    witness: "eigenspace-1",
    small: true,
  },
];

/** The lines one segment writes, in order. */
export function chainLinesFor(beat: string): readonly ChainLine[] {
  return CHAIN_SCRIPT.filter((line) => line.beat === beat);
}

/** Index of the line whose written statement is the determinant condition. */
export function determinantLineIndex(): number {
  const index = CHAIN_SCRIPT.findIndex((line) => line.tex.includes("\\det("));
  if (index < 0) {
    throw new Error("eigenDerivationScript: the chain never states det(A − λI) = 0.");
  }
  return index;
}

/** Index of the line whose witness is the singular demonstration. */
export function collapseWitnessIndex(): number {
  const index = CHAIN_SCRIPT.findIndex((line) => line.witness === "collapse");
  if (index < 0) {
    throw new Error("eigenDerivationScript: nothing demonstrates the collapse.");
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
 * This is what makes the table load-bearing: the scene draws whatever this
 * returns for `CANCELLATION_TERMS.minuend` and `.subtrahend`, so changing the
 * table changes the picture, and drawing something else means bypassing the
 * resolver. An unknown name throws rather than falling back to `v` — the
 * mistake the correction was made for.
 */
export function resolveCancellationTerm(
  term: CancellationTerm,
  context: {
    v: readonly [number, number];
    /** `Av`, computed through A rather than assumed. */
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
      throw new Error(`eigenDerivationScript: unknown cancellation term ${unknown}`);
    }
  }
}

/* --------------------------------------------- the characteristic-equation bridge */

/**
 * A bridge beat's stage state.
 *
 * `kernelOf` and `imageOf` index {@link STEPS} and are separate fields because
 * the two lines live in different spaces and swap over between the roots.
 */
export interface BridgeBeatState {
  id: string;
  /** Whose kernel is drawn, or `null`. Never two at once. */
  kernelOf: number | null;
  /** Whose image line is labelled, or `null`. */
  imageOf: number | null;
  /** Both eigendirections may share the frame only under A itself. */
  underA: boolean;
}

export const BRIDGE_BEATS: readonly BridgeBeatState[] = [
  { id: "family", kernelOf: null, imageOf: null, underA: false },
  { id: "sweep", kernelOf: null, imageOf: null, underA: false },
  { id: "firstZero", kernelOf: 1, imageOf: 1, underA: false },
  { id: "secondZero", kernelOf: 0, imageOf: 0, underA: false },
  { id: "roots", kernelOf: null, imageOf: null, underA: true },
];

export function bridgeBeat(id: string): BridgeBeatState {
  const beat = BRIDGE_BEATS.find((entry) => entry.id === id);
  if (!beat) {
    throw new Error(`eigenDerivationScript: unknown bridge beat "${id}"`);
  }
  return beat;
}
