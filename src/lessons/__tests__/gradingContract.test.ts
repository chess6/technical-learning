import { describe, expect, it } from "vitest";
import { MODULE_ITEMS } from "../moduleItems";
import { requiresHumanScore } from "../capabilities";
import type { ExerciseDefinition } from "../types";
import type { JsonValue } from "../../platform/json";
import {
  blankEachCell,
  describeGradingContract,
  type GradingContractSpec,
  type NamedAnswer,
} from "./gradingContract";

const byId = (id: string): ExerciseDefinition => {
  const item = MODULE_ITEMS.find((e) => e.id === id);
  if (!item) throw new Error(`no module item "${id}"`);
  return item;
};

/** Wrap the blank-each-cell variants of a solution-set/elimination answer. */
function particularCellBlanks(
  build: (particular: (number | null)[]) => JsonValue,
  particular: readonly (number | null)[],
): NamedAnswer[] {
  return blankEachCell(particular).map((p, i) => ({
    name: `particular cell ${i} blanked (incl. true-0 cell ⇒ blank ≠ 0)`,
    answer: build(p),
  }));
}

const CONTRACTS: { id: string; spec: GradingContractSpec }[] = [
  {
    // solution-set · SYS_SOLSET_FRESH: consistent, 1 free var, x_p=(3,0,-1), dir (-2,1,0).
    id: "mod-transfer-solset-fresh",
    spec: {
      mustAccept: [
        {
          name: "canonical parameterization",
          answer: { consistent: true, freeCount: 1, particular: [3, 0, -1], nullDirections: [[-2, 1, 0]] },
        },
      ],
      mustReject: [
        { name: "flipped to inconsistent", answer: { consistent: false } },
        {
          name: "all-blank produced fields",
          answer: {
            consistent: true,
            freeCount: null,
            particular: [null, null, null],
            nullDirections: [[null, null, null]],
          },
        },
        {
          name: "zero-filled blanks (0 ≠ blank ≠ correct)",
          answer: { consistent: true, freeCount: 0, particular: [0, 0, 0], nullDirections: [[0, 0, 0]] },
        },
        ...particularCellBlanks(
          (particular) => ({ consistent: true, freeCount: 1, particular, nullDirections: [[-2, 1, 0]] }),
          [3, 0, -1],
        ),
        {
          name: "null-space point offered as particular",
          answer: { consistent: true, freeCount: 1, particular: [-2, 1, 0], nullDirections: [[-2, 1, 0]] },
        },
        {
          name: "wrong free-variable count",
          answer: { consistent: true, freeCount: 2, particular: [3, 0, -1], nullDirections: [[-2, 1, 0]] },
        },
        {
          name: "superset: an extra bogus null direction",
          answer: {
            consistent: true,
            freeCount: 1,
            particular: [3, 0, -1],
            nullDirections: [[-2, 1, 0], [1, 0, 0]],
          },
        },
        {
          name: "direction not in the null space",
          answer: { consistent: true, freeCount: 1, particular: [3, 0, -1], nullDirections: [[1, 0, 0]] },
        },
      ],
    },
  },
  {
    // elimination · SYS_CUMULATIVE: pivots {0,1}, 1 free var, x_p=(-2,8,0), dir (1,-2,1).
    id: "mod-cumulative-elim-solset",
    spec: {
      mustAccept: [
        {
          name: "canonical echelon + parameterization",
          answer: {
            reduced: [[1, 0, -1, -2], [0, 1, 2, 8], [0, 0, 0, 0]],
            consistent: true,
            pivotColumns: [0, 1],
            freeCount: 1,
            particular: [-2, 8, 0],
            nullDirections: [[1, -2, 1]],
          },
        },
      ],
      mustReject: [
        {
          name: "all-blank",
          answer: {
            reduced: [[null, null, null, null], [null, null, null, null], [null, null, null, null]],
            consistent: null,
          },
        },
        ...particularCellBlanks(
          (particular) => ({
            reduced: [[1, 0, -1, -2], [0, 1, 2, 8], [0, 0, 0, 0]],
            consistent: true,
            pivotColumns: [0, 1],
            freeCount: 1,
            particular,
            nullDirections: [[1, -2, 1]],
          }),
          [-2, 8, 0],
        ),
        {
          name: "pivot columns claim the free column",
          answer: {
            reduced: [[1, 0, -1, -2], [0, 1, 2, 8], [0, 0, 0, 0]],
            consistent: true,
            pivotColumns: [0, 2],
            freeCount: 1,
            particular: [-2, 8, 0],
            nullDirections: [[1, -2, 1]],
          },
        },
        {
          name: "reduced is the ORIGINAL matrix (row-equivalent but not echelon)",
          answer: {
            reduced: [[1, 1, 1, 6], [1, 2, 3, 14], [2, 3, 4, 20]],
            consistent: true,
            pivotColumns: [0, 1],
            freeCount: 1,
            particular: [-2, 8, 0],
            nullDirections: [[1, -2, 1]],
          },
        },
        {
          name: "flipped to inconsistent on a consistent system",
          answer: {
            reduced: [[1, 0, -1, -2], [0, 1, 2, 8], [0, 0, 0, 0]],
            consistent: false,
            classification: "none",
          },
        },
      ],
    },
  },
  {
    // elimination · SYS_APPLIED_3X3: pivots {0,1}, 1 free var, x_p=(2,-3,0), dir (-1,3,1).
    id: "mod-p2-applied-3x3",
    spec: {
      mustAccept: [
        {
          name: "canonical echelon + parameterization",
          answer: {
            reduced: [[1, 0, 1, 2], [0, 1, -3, -3], [0, 0, 0, 0]],
            consistent: true,
            pivotColumns: [0, 1],
            freeCount: 1,
            particular: [2, -3, 0],
            nullDirections: [[-1, 3, 1]],
          },
        },
      ],
      mustReject: [
        {
          name: "all-blank",
          answer: {
            reduced: [[null, null, null, null], [null, null, null, null], [null, null, null, null]],
            consistent: null,
          },
        },
        ...particularCellBlanks(
          (particular) => ({
            reduced: [[1, 0, 1, 2], [0, 1, -3, -3], [0, 0, 0, 0]],
            consistent: true,
            pivotColumns: [0, 1],
            freeCount: 1,
            particular,
            nullDirections: [[-1, 3, 1]],
          }),
          [2, -3, 0],
        ),
        {
          name: "pivot columns off by one",
          answer: {
            reduced: [[1, 0, 1, 2], [0, 1, -3, -3], [0, 0, 0, 0]],
            consistent: true,
            pivotColumns: [0, 2],
            freeCount: 1,
            particular: [2, -3, 0],
            nullDirections: [[-1, 3, 1]],
          },
        },
        {
          name: "direction not in the null space",
          answer: {
            reduced: [[1, 0, 1, 2], [0, 1, -3, -3], [0, 0, 0, 0]],
            consistent: true,
            pivotColumns: [0, 1],
            freeCount: 1,
            particular: [2, -3, 0],
            nullDirections: [[1, 0, 0]],
          },
        },
      ],
    },
  },
  {
    // elimination · SYS_APPLIED_RECT: INCONSISTENT ⇒ contradiction row + typed verdict.
    id: "mod-p2-applied-rect",
    spec: {
      mustAccept: [
        {
          name: "echelon with contradiction row + typed 'inconsistent'",
          answer: {
            reduced: [[1, 0, 2], [0, 1, 1], [0, 0, 2]],
            consistent: false,
            classification: "inconsistent",
          },
        },
        {
          name: "typed 'none' (an accepted classification)",
          answer: {
            reduced: [[1, 0, 2], [0, 1, 1], [0, 0, 2]],
            consistent: false,
            classification: "none",
          },
        },
      ],
      mustReject: [
        {
          name: "bare toggle, no typed classification",
          answer: { reduced: [[1, 0, 2], [0, 1, 1], [0, 0, 2]], consistent: false },
        },
        {
          name: "typed verdict but reduction lacks the contradiction row",
          answer: {
            reduced: [[1, 0, 2], [0, 1, 1], [0, 0, 0]],
            consistent: false,
            classification: "none",
          },
        },
        {
          name: "superset text: accepted word embedded in a longer string",
          answer: {
            reduced: [[1, 0, 2], [0, 1, 1], [0, 0, 2]],
            consistent: false,
            classification: "the answer is none",
          },
        },
        {
          name: "related-but-wrong classification ('not empty')",
          answer: {
            reduced: [[1, 0, 2], [0, 1, 1], [0, 0, 2]],
            consistent: false,
            classification: "not empty",
          },
        },
        {
          name: "wrong verdict: claims consistent on an inconsistent system",
          answer: {
            reduced: [[1, 0, 2], [0, 1, 1], [0, 0, 2]],
            consistent: true,
            pivotColumns: [0, 1],
            freeCount: 0,
            particular: [2, 1],
            nullDirections: [],
          },
        },
      ],
    },
  },
  {
    // I·1 elimination · SYS_MOCK_COMPUTE: pivots {0,1}, 1 free var, x_p=(1,1,0), dir (1,-1,1).
    id: "mod-mock-compute",
    spec: {
      mustAccept: [
        {
          name: "canonical echelon + parameterization",
          answer: {
            reduced: [[1, 0, -1, 1], [0, 1, 1, 1], [0, 0, 0, 0]],
            consistent: true,
            pivotColumns: [0, 1],
            freeCount: 1,
            particular: [1, 1, 0],
            nullDirections: [[1, -1, 1]],
          },
        },
      ],
      mustReject: [
        {
          name: "all-blank",
          answer: {
            reduced: [[null, null, null, null], [null, null, null, null], [null, null, null, null]],
            consistent: null,
          },
        },
        ...particularCellBlanks(
          (particular) => ({
            reduced: [[1, 0, -1, 1], [0, 1, 1, 1], [0, 0, 0, 0]],
            consistent: true,
            pivotColumns: [0, 1],
            freeCount: 1,
            particular,
            nullDirections: [[1, -1, 1]],
          }),
          [1, 1, 0],
        ),
        {
          name: "pivot columns claim the free column",
          answer: {
            reduced: [[1, 0, -1, 1], [0, 1, 1, 1], [0, 0, 0, 0]],
            consistent: true,
            pivotColumns: [0, 2],
            freeCount: 1,
            particular: [1, 1, 0],
            nullDirections: [[1, -1, 1]],
          },
        },
        {
          name: "direction not in the null space",
          answer: {
            reduced: [[1, 0, -1, 1], [0, 1, 1, 1], [0, 0, 0, 0]],
            consistent: true,
            pivotColumns: [0, 1],
            freeCount: 1,
            particular: [1, 1, 0],
            nullDirections: [[1, 0, 0]],
          },
        },
      ],
    },
  },
  {
    // I·2 elimination · SYS_MOCK_CLASSIFY: INCONSISTENT ⇒ contradiction row + typed verdict.
    id: "mod-mock-classify",
    spec: {
      mustAccept: [
        {
          name: "echelon with contradiction row + typed 'inconsistent'",
          answer: {
            reduced: [[1, 1, 2], [0, 1, 1], [0, 0, 1]],
            consistent: false,
            classification: "inconsistent",
          },
        },
      ],
      mustReject: [
        {
          name: "bare toggle, no typed classification",
          answer: { reduced: [[1, 1, 2], [0, 1, 1], [0, 0, 1]], consistent: false },
        },
        {
          name: "typed verdict but reduction lacks the contradiction row",
          answer: {
            reduced: [[1, 1, 2], [0, 1, 1], [0, 0, 0]],
            consistent: false,
            classification: "none",
          },
        },
        {
          name: "superset text ('the answer is none')",
          answer: {
            reduced: [[1, 1, 2], [0, 1, 1], [0, 0, 1]],
            consistent: false,
            classification: "the answer is none",
          },
        },
        {
          name: "wrong verdict: claims consistent on an inconsistent system",
          answer: {
            reduced: [[1, 1, 2], [0, 1, 1], [0, 0, 1]],
            consistent: true,
            pivotColumns: [0, 1],
            freeCount: 0,
            particular: [1, 1],
            nullDirections: [],
          },
        },
      ],
    },
  },
  // multiple-choice spaced items: exact-index recognition; out-of-range rejects.
  {
    id: "mod-spaced-trichotomy",
    spec: {
      mustAccept: [{ name: "correct choice (Infinitely many)", answer: { choice: 2 } }],
      mustReject: [
        { name: "no solutions", answer: { choice: 0 } },
        { name: "exactly one", answer: { choice: 1 } },
        { name: "out-of-range index", answer: { choice: 99 } },
      ],
    },
  },
  {
    id: "mod-spaced-uniqueness",
    spec: {
      mustAccept: [{ name: "correct choice (Infinitely many)", answer: { choice: 1 } }],
      mustReject: [
        { name: "exactly one", answer: { choice: 0 } },
        { name: "no solutions", answer: { choice: 2 } },
        { name: "impossible to determine", answer: { choice: 3 } },
      ],
    },
  },
  /* ---------------------------------------------------------------------- */
  /* `structure` module (Gate 9).                                             */
  /* ---------------------------------------------------------------------- */
  {
    // elimination-solution · STRUCT_LEDGER: 3x4, consistent, rank 2 / nullity 2.
    // x_p = (1,0,1,0); Null = span{(-2,1,0,0), (-3,0,-1,1)}.
    id: "mod-struct-rank-nullity-ledger",
    spec: {
      mustAccept: [
        {
          name: "canonical echelon form + both null directions",
          answer: {
            reduced: [
              [1, 2, 0, 3, 1],
              [0, 0, 1, 1, 1],
              [0, 0, 0, 0, 0],
            ],
            consistent: true,
            pivotColumns: [0, 2],
            freeCount: 2,
            particular: [1, 0, 1, 0],
            nullDirections: [
              [-2, 1, 0, 0],
              [-3, 0, -1, 1],
            ],
          },
        },
        {
          name: "a different particular solution and rescaled directions",
          answer: {
            reduced: [
              [1, 2, 0, 3, 1],
              [0, 0, 1, 1, 1],
              [0, 0, 0, 0, 0],
            ],
            consistent: true,
            pivotColumns: [0, 2],
            freeCount: 2,
            particular: [-1, 1, 1, 0],
            nullDirections: [
              [-4, 2, 0, 0],
              [-3, 0, -1, 1],
            ],
          },
        },
      ],
      mustReject: [
        {
          name: "declared inconsistent (b IS in Col(A))",
          answer: {
            reduced: [
              [1, 2, 0, 3, 1],
              [0, 0, 1, 1, 1],
              [0, 0, 0, 0, 0],
            ],
            consistent: false,
            classification: "none",
          },
        },
        {
          name: "unreduced matrix (row-equivalent but not echelon)",
          answer: {
            reduced: [
              [1, 2, 0, 3, 1],
              [2, 4, 1, 7, 3],
              [1, 2, 1, 4, 2],
            ],
            consistent: true,
            pivotColumns: [0, 2],
            freeCount: 2,
            particular: [1, 0, 1, 0],
            nullDirections: [
              [-2, 1, 0, 0],
              [-3, 0, -1, 1],
            ],
          },
        },
        {
          name: "echelon but NOT row-equivalent to the system",
          answer: {
            reduced: [
              [1, 2, 0, 3, 1],
              [0, 0, 1, 1, 2],
              [0, 0, 0, 0, 0],
            ],
            consistent: true,
            pivotColumns: [0, 2],
            freeCount: 2,
            particular: [1, 0, 1, 0],
            nullDirections: [
              [-2, 1, 0, 0],
              [-3, 0, -1, 1],
            ],
          },
        },
        {
          name: "nullity read as n - m instead of n - rank",
          answer: {
            reduced: [
              [1, 2, 0, 3, 1],
              [0, 0, 1, 1, 1],
              [0, 0, 0, 0, 0],
            ],
            consistent: true,
            pivotColumns: [0, 2],
            freeCount: 1,
            particular: [1, 0, 1, 0],
            nullDirections: [[-2, 1, 0, 0]],
          },
        },
        {
          name: "pivot columns guessed as the first two",
          answer: {
            reduced: [
              [1, 2, 0, 3, 1],
              [0, 0, 1, 1, 1],
              [0, 0, 0, 0, 0],
            ],
            consistent: true,
            pivotColumns: [0, 1],
            freeCount: 2,
            particular: [1, 0, 1, 0],
            nullDirections: [
              [-2, 1, 0, 0],
              [-3, 0, -1, 1],
            ],
          },
        },
        {
          name: "null-space point offered as the particular solution",
          answer: {
            reduced: [
              [1, 2, 0, 3, 1],
              [0, 0, 1, 1, 1],
              [0, 0, 0, 0, 0],
            ],
            consistent: true,
            pivotColumns: [0, 2],
            freeCount: 2,
            particular: [-2, 1, 0, 0],
            nullDirections: [
              [-2, 1, 0, 0],
              [-3, 0, -1, 1],
            ],
          },
        },
        {
          name: "two DEPENDENT null directions",
          answer: {
            reduced: [
              [1, 2, 0, 3, 1],
              [0, 0, 1, 1, 1],
              [0, 0, 0, 0, 0],
            ],
            consistent: true,
            pivotColumns: [0, 2],
            freeCount: 2,
            particular: [1, 0, 1, 0],
            nullDirections: [
              [-2, 1, 0, 0],
              [-4, 2, 0, 0],
            ],
          },
        },
        {
          name: "a direction outside the null space",
          answer: {
            reduced: [
              [1, 2, 0, 3, 1],
              [0, 0, 1, 1, 1],
              [0, 0, 0, 0, 0],
            ],
            consistent: true,
            pivotColumns: [0, 2],
            freeCount: 2,
            particular: [1, 0, 1, 0],
            nullDirections: [
              [-2, 1, 0, 0],
              [1, 0, 0, 0],
            ],
          },
        },
        {
          name: "zero-filled produced fields",
          answer: {
            reduced: [
              [1, 2, 0, 3, 1],
              [0, 0, 1, 1, 1],
              [0, 0, 0, 0, 0],
            ],
            consistent: true,
            pivotColumns: [0, 2],
            freeCount: 0,
            particular: [0, 0, 0, 0],
            nullDirections: [],
          },
        },
        ...particularCellBlanks(
          (particular) => ({
            reduced: [
              [1, 2, 0, 3, 1],
              [0, 0, 1, 1, 1],
              [0, 0, 0, 0, 0],
            ],
            consistent: true,
            pivotColumns: [0, 2],
            freeCount: 2,
            particular,
            nullDirections: [
              [-2, 1, 0, 0],
              [-3, 0, -1, 1],
            ],
          }),
          [1, 0, 1, 0],
        ),
      ],
    },
  },
  {
    // elimination-solution · STRUCT_EIGEN_SHIFT: the all-ones A - I, homogeneous.
    // rank 1, geometric multiplicity 2, Null = span{(-1,1,0), (-1,0,1)}.
    // Every true value of the particular solution is 0, so the blank-each-cell
    // battery is the sharpest possible test of "a blank is never read as zero".
    id: "mod-struct-eigen-shift",
    spec: {
      mustAccept: [
        {
          name: "canonical eigenspace basis",
          answer: {
            reduced: [
              [1, 1, 1, 0],
              [0, 0, 0, 0],
              [0, 0, 0, 0],
            ],
            consistent: true,
            pivotColumns: [0],
            freeCount: 2,
            particular: [0, 0, 0],
            nullDirections: [
              [-1, 1, 0],
              [-1, 0, 1],
            ],
          },
        },
        {
          name: "a different basis of the same eigenspace",
          answer: {
            reduced: [
              [1, 1, 1, 0],
              [0, 0, 0, 0],
              [0, 0, 0, 0],
            ],
            consistent: true,
            pivotColumns: [0],
            freeCount: 2,
            particular: [0, 0, 0],
            nullDirections: [
              [1, -1, 0],
              [0, 1, -1],
            ],
          },
        },
      ],
      mustReject: [
        {
          name: "geometric multiplicity guessed as 1 (defective, which it is not)",
          answer: {
            reduced: [
              [1, 1, 1, 0],
              [0, 0, 0, 0],
              [0, 0, 0, 0],
            ],
            consistent: true,
            pivotColumns: [0],
            freeCount: 1,
            particular: [0, 0, 0],
            nullDirections: [[-1, 1, 0]],
          },
        },
        {
          name: "a nonzero vector offered as the solution of a homogeneous system",
          answer: {
            reduced: [
              [1, 1, 1, 0],
              [0, 0, 0, 0],
              [0, 0, 0, 0],
            ],
            consistent: true,
            pivotColumns: [0],
            freeCount: 2,
            particular: [1, 0, 0],
            nullDirections: [
              [-1, 1, 0],
              [-1, 0, 1],
            ],
          },
        },
        {
          name: "an eigenvector of the WRONG eigenvalue (the all-ones direction)",
          answer: {
            reduced: [
              [1, 1, 1, 0],
              [0, 0, 0, 0],
              [0, 0, 0, 0],
            ],
            consistent: true,
            pivotColumns: [0],
            freeCount: 2,
            particular: [0, 0, 0],
            nullDirections: [
              [-1, 1, 0],
              [1, 1, 1],
            ],
          },
        },
        {
          name: "two dependent directions (one plane vector counted twice)",
          answer: {
            reduced: [
              [1, 1, 1, 0],
              [0, 0, 0, 0],
              [0, 0, 0, 0],
            ],
            consistent: true,
            pivotColumns: [0],
            freeCount: 2,
            particular: [0, 0, 0],
            nullDirections: [
              [-1, 1, 0],
              [-2, 2, 0],
            ],
          },
        },
        {
          name: "shifted by the wrong lambda (matrix not row-equivalent)",
          answer: {
            reduced: [
              [1, 0, 0, 0],
              [0, 1, 0, 0],
              [0, 0, 1, 0],
            ],
            consistent: true,
            pivotColumns: [0, 1, 2],
            freeCount: 0,
            particular: [0, 0, 0],
            nullDirections: [],
          },
        },
        ...particularCellBlanks(
          (particular) => ({
            reduced: [
              [1, 1, 1, 0],
              [0, 0, 0, 0],
              [0, 0, 0, 0],
            ],
            consistent: true,
            pivotColumns: [0],
            freeCount: 2,
            particular,
            nullDirections: [
              [-1, 1, 0],
              [-1, 0, 1],
            ],
          }),
          [0, 0, 0],
        ),
      ],
    },
  },
  {
    // matrix-entry · [A]_B = P^-1 A P for A = [[3,-2],[4,1]], P = [[1,1],[1,2]].
    id: "mod-struct-cob-matrix-fresh",
    spec: {
      mustAccept: [{ name: "P inverse A P", answer: { entries: [[-3, -8], [4, 7]] } }],
      mustReject: [
        { name: "A itself (no change of basis performed)", answer: { entries: [[3, -2], [4, 1]] } },
        { name: "P A P inverse (the conversion run backwards)", answer: { entries: [[15, -8], [22, -11]] } },
        { name: "the transpose of the right answer", answer: { entries: [[-3, 4], [-8, 7]] } },
        { name: "one entry wrong (trace no longer 4)", answer: { entries: [[-3, -8], [4, 6]] } },
        { name: "a blank entry (never read as zero)", answer: { entries: [[-3, -8], [4, null]] } },
        { name: "wrong dimensions", answer: { entries: [[-3, -8]] } },
      ],
    },
  },
  {
    id: "mod-struct-retain-two-spaces",
    spec: {
      mustAccept: [{ name: "Col in R^2, Null in R^5", answer: { choice: 2 } }],
      mustReject: [
        { name: "both in R^5", answer: { choice: 0 } },
        { name: "both in R^2", answer: { choice: 1 } },
        { name: "the two spaces swapped", answer: { choice: 3 } },
      ],
    },
  },
  {
    id: "mod-struct-retain-total-n",
    spec: {
      mustAccept: [{ name: "nullity 3 (n - rank, n = 6)", answer: { choice: 2 } }],
      mustReject: [
        { name: "m - rank = 1 (the wrong total)", answer: { choice: 0 } },
        { name: "2", answer: { choice: 1 } },
        { name: "4", answer: { choice: 3 } },
      ],
    },
  },
  {
    id: "mod-struct-retain-p-direction",
    spec: {
      mustAccept: [{ name: "P converts B-coordinates to standard", answer: { choice: 0 } }],
      mustReject: [
        { name: "P inverse (the other direction)", answer: { choice: 1 } },
        { name: "P transpose (orthonormal only)", answer: { choice: 2 } },
        { name: "either / a free convention", answer: { choice: 3 } },
      ],
    },
  },
  {
    id: "mod-spaced-rowops",
    spec: {
      mustAccept: [{ name: "correct choice (R3 - R3, scale by 0)", answer: { choice: 3 } }],
      mustReject: [
        { name: "swap rows (legal)", answer: { choice: 0 } },
        { name: "add a row to itself (legal)", answer: { choice: 1 } },
        { name: "subtract a multiple of another row (legal)", answer: { choice: 2 } },
      ],
    },
  },
];

for (const { id, spec } of CONTRACTS) {
  describeGradingContract(byId(id), spec);
}

describe("grading-contract coverage", () => {
  const covered = new Set(CONTRACTS.map((c) => c.id));

  it("every auto-graded module item has a grading contract", () => {
    for (const item of MODULE_ITEMS) {
      if (requiresHumanScore(item)) continue;
      expect(covered.has(item.id), `missing grading contract for auto item "${item.id}"`).toBe(true);
    }
  });

  it("contracts target only real, auto-graded items", () => {
    for (const id of covered) {
      const item = MODULE_ITEMS.find((e) => e.id === id)!;
      expect(item, `contract for unknown item "${id}"`).toBeDefined();
      expect(requiresHumanScore(item), `${id} is human-scored, not an auto contract`).toBe(false);
    }
  });
});
