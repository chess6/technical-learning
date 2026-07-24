import { describe, expect, it } from "vitest";
import { ELIMINATION_ID, getGradingCapability, type ExerciseAnswer } from "../capabilities";
import { gradeExercise } from "../grading";
import { MODULE_ITEMS } from "../moduleItems";
import type { ExerciseDefinition } from "../types";

function item(id: string): ExerciseDefinition {
  const found = MODULE_ITEMS.find((e) => e.id === id);
  if (!found) throw new Error(`missing item ${id}`);
  return found;
}

function answer(value: unknown): ExerciseAnswer {
  return { kind: "custom", capabilityId: ELIMINATION_ID, value: value as never };
}

const cumulative = item("mod-cumulative-elim-solset"); // 3×3 consistent, 1 free var
const applied3x3 = item("mod-p2-applied-3x3"); // 3×3 consistent, 1 free var
const rect = item("mod-p2-applied-rect"); // 3×2 inconsistent (contradiction row)

// A correct RREF of SYS_CUMULATIVE plus its pivot/free/particular/null data.
const cumulativeRref = [
  [1, 0, -1, -2],
  [0, 1, 2, 8],
  [0, 0, 0, 0],
];
const cumulativeGood = {
  reduced: cumulativeRref,
  consistent: true,
  pivotColumns: [0, 1],
  freeCount: 1,
  particular: [-2, 8, 0],
  nullDirections: [[1, -2, 1]],
};

describe("elimination capability — retargeted module items", () => {
  it("all three applied/cumulative items use the elimination capability", () => {
    for (const id of ["mod-cumulative-elim-solset", "mod-p2-applied-3x3", "mod-p2-applied-rect"]) {
      expect(getGradingCapability(item(id)).id).toBe(ELIMINATION_ID);
    }
  });
});

describe("elimination capability — consistent systems", () => {
  it("accepts a correct full RREF with pivots, free count, particular, and null direction", () => {
    const result = gradeExercise(cumulative, answer(cumulativeGood));
    expect(result.correct).toBe(true);
  });

  it("accepts any VALID reduction (a REF that is not full RREF)", () => {
    // A legal row-echelon form of SYS_CUMULATIVE that is NOT reduced.
    const validRef = [
      [1, 1, 1, 6],
      [0, 1, 2, 8],
      [0, 0, 0, 0],
    ];
    const result = gradeExercise(
      cumulative,
      answer({ ...cumulativeGood, reduced: validRef }),
    );
    expect(result.correct).toBe(true);
  });

  it("rejects a matrix that is NOT row-equivalent to the original system", () => {
    const notEquivalent = [
      [1, 0, -1, -2],
      [0, 1, 2, 9], // changed RHS ⇒ different system
      [0, 0, 0, 0],
    ];
    const result = gradeExercise(cumulative, answer({ ...cumulativeGood, reduced: notEquivalent }));
    expect(result.correct).toBe(false);
    expect(result.feedback).toMatch(/row-equivalent/i);
  });

  it("rejects a row-equivalent matrix that is NOT in echelon form", () => {
    // The original augmented matrix: row-equivalent to itself but not echelon.
    const notEchelon = [
      [1, 1, 1, 6],
      [1, 2, 3, 14],
      [2, 3, 4, 20],
    ];
    const result = gradeExercise(cumulative, answer({ ...cumulativeGood, reduced: notEchelon }));
    expect(result.correct).toBe(false);
    expect(result.feedback).toMatch(/echelon/i);
  });

  it("rejects wrong pivot-column identification", () => {
    const result = gradeExercise(cumulative, answer({ ...cumulativeGood, pivotColumns: [0, 2] }));
    expect(result.correct).toBe(false);
    expect(result.feedback).toMatch(/pivot/i);
  });

  it("rejects a wrong free-variable count", () => {
    const result = gradeExercise(cumulative, answer({ ...cumulativeGood, freeCount: 2 }));
    expect(result.correct).toBe(false);
    expect(result.feedback).toMatch(/free/i);
  });

  it("rejects a particular solution that does not solve the system", () => {
    const result = gradeExercise(cumulative, answer({ ...cumulativeGood, particular: [0, 0, 0] }));
    expect(result.correct).toBe(false);
    expect(result.feedback).toMatch(/particular/i);
  });

  it("rejects a null direction not in Null(A)", () => {
    const result = gradeExercise(cumulative, answer({ ...cumulativeGood, nullDirections: [[1, 0, 0]] }));
    expect(result.correct).toBe(false);
  });

  it("grades the fresh applied 3×3 system", () => {
    const good = {
      reduced: [
        [1, 0, 1, 2],
        [0, 1, -3, -3],
        [0, 0, 0, 0],
      ],
      consistent: true,
      pivotColumns: [0, 1],
      freeCount: 1,
      particular: [2, -3, 0],
      nullDirections: [[-1, 3, 1]],
    };
    expect(gradeExercise(applied3x3, answer(good)).correct).toBe(true);
  });
});

describe("elimination capability — field mutation regressions", () => {
  it("flips to incorrect when a single particular component is mutated", () => {
    expect(gradeExercise(cumulative, answer(cumulativeGood)).correct).toBe(true);
    const mutated = gradeExercise(
      cumulative,
      answer({ ...cumulativeGood, particular: [-2, 8, 1] }),
    );
    expect(mutated.correct).toBe(false);
  });

  it("flips to incorrect when a single reduced-matrix entry is mutated to break echelon", () => {
    const badGrid = cumulativeRref.map((row) => [...row]);
    badGrid[2]![0] = 5; // nonzero entry in the bottom (zero) row's first column
    const result = gradeExercise(cumulative, answer({ ...cumulativeGood, reduced: badGrid }));
    expect(result.correct).toBe(false);
  });

  it("flips to incorrect when a single null-direction component is mutated", () => {
    const mutated = gradeExercise(
      cumulative,
      answer({ ...cumulativeGood, nullDirections: [[1, -2, 2]] }),
    );
    expect(mutated.correct).toBe(false);
  });
});

describe("elimination capability — blank/cleared-field handling (no zero coercion)", () => {
  it("a blank reduced-matrix cell is incomplete (not treated as 0)", () => {
    const grid = cumulativeRref.map((row) => [...row]) as (number | null)[][];
    grid[0]![3] = null; // clear the (expected -2) entry
    const result = gradeExercise(cumulative, answer({ ...cumulativeGood, reduced: grid }));
    expect(result.correct).toBe(false);
    expect(result.feedback).toMatch(/every entry|blank/i);
  });

  it("a blank EXPECTED-ZERO particular component must be entered", () => {
    // particular is (-2, 8, 0) — the 0 must actually be typed.
    const result = gradeExercise(
      cumulative,
      answer({ ...cumulativeGood, particular: [-2, 8, null] }),
    );
    expect(result.correct).toBe(false);
  });

  it("a blank free-variable count is incomplete (not 0)", () => {
    const result = gradeExercise(cumulative, answer({ ...cumulativeGood, freeCount: null }));
    expect(result.correct).toBe(false);
  });

  it("not choosing consistency is incomplete", () => {
    const result = gradeExercise(cumulative, answer({ ...cumulativeGood, consistent: null }));
    expect(result.correct).toBe(false);
    expect(result.feedback).toMatch(/has solutions|solutions/i);
  });
});

describe("elimination capability — inconsistent rectangular system", () => {
  // A correct reduction of SYS_APPLIED_RECT exposing the contradiction row.
  const rectReduced = [
    [1, 0, 2],
    [0, 1, 1],
    [0, 0, 2],
  ];

  it("accepts a produced contradiction row + typed classification", () => {
    const result = gradeExercise(
      rect,
      answer({ reduced: rectReduced, consistent: false, classification: "inconsistent" }),
    );
    expect(result.correct).toBe(true);
    expect(result.feedback).toMatch(/contradiction|inconsistent/i);
  });

  it("accepts other typed classifications (none / no solution / ∅)", () => {
    for (const cls of ["none", "no solution", "∅ (empty)"]) {
      const result = gradeExercise(
        rect,
        answer({ reduced: rectReduced, consistent: false, classification: cls }),
      );
      expect(result.correct).toBe(true);
    }
  });

  it("rejects near-miss classifications that merely contain an accepted keyword", () => {
    for (const cls of ["not inconsistent", "not empty", "one, not none", "infinitely many solutions"]) {
      const result = gradeExercise(
        rect,
        answer({ reduced: rectReduced, consistent: false, classification: cls }),
      );
      expect(result.correct).toBe(false);
    }
  });

  it("a bare 'no solution' toggle WITHOUT a typed classification does not pass", () => {
    const result = gradeExercise(
      rect,
      answer({ reduced: rectReduced, consistent: false }),
    );
    expect(result.correct).toBe(false);
    expect(result.feedback).toMatch(/type the classification/i);
  });

  it("a typed classification WITHOUT a contradiction-row matrix does not pass", () => {
    // A learner types 'none' but supplies an incomplete/blank reduced matrix.
    const blankGrid: (number | null)[][] = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
    const result = gradeExercise(
      rect,
      answer({ reduced: blankGrid, consistent: false, classification: "none" }),
    );
    expect(result.correct).toBe(false);
  });

  it("rejects claiming the inconsistent system has solutions", () => {
    const result = gradeExercise(
      rect,
      answer({
        reduced: rectReduced,
        consistent: true,
        pivotColumns: [0, 1],
        freeCount: 0,
        particular: [2, 1],
        nullDirections: [],
      }),
    );
    expect(result.correct).toBe(false);
  });
});

describe("elimination capability — plumbing", () => {
  it("round-trips through serialize/parse, preserving blanks as null", () => {
    const cap = getGradingCapability(cumulative);
    const parsed = cap.parseAnswer({
      reduced: [
        [1, 0, -1, -2],
        [0, 1, 2, null],
        [0, 0, 0, 0],
      ],
      consistent: true,
      pivotColumns: [0, 1],
      freeCount: null,
      particular: [-2, 8, null],
      nullDirections: [[1, -2, 1]],
    });
    const serialized = cap.serializeAnswer(parsed);
    expect(serialized).toEqual({
      reduced: [
        [1, 0, -1, -2],
        [0, 1, 2, null],
        [0, 0, 0, 0],
      ],
      consistent: true,
      pivotColumns: [0, 1],
      freeCount: null,
      particular: [-2, 8, null],
      nullDirections: [[1, -2, 1]],
    });
  });

  it("is auto-graded (does not require human scoring)", () => {
    expect(getGradingCapability(rect).id).toBe(ELIMINATION_ID);
  });
});
