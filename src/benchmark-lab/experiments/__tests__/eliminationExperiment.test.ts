import { describe, expect, it } from "vitest";
import {
  ALPHA_STOPS,
  COLUMNS,
  END_SYSTEM,
  FACTOR,
  MULTIPLIER,
  NEW_R2,
  OPERATION,
  R1,
  R2,
  SCALED_R1,
  SOLUTION,
  START_SYSTEM,
  assertExperimentDataIsConsistent,
  rowAtAlpha,
} from "../eliminationExperimentData";
import {
  ELIMINATION_CANDIDATES,
  getEliminationCandidate,
  listCandidateIds,
} from "../eliminationCandidates";
import { satisfiesSystem } from "../../../math";
import { texEquation, texNumber } from "../texFormat";

/**
 * Focused cover for the elimination design experiment.
 *
 * Scope: the mathematics the three candidate clips display, the registry that
 * drives candidate selection and the chapter buttons, and the LaTeX formatting
 * the frames are typeset from. The clips themselves import `@motion-canvas/2d`
 * and are only ever exercised in a browser, so nothing here claims to have run
 * one — that is what the lab page is for.
 */

describe("elimination experiment data", () => {
  it("is self-consistent (the guard every candidate scene runs first)", () => {
    expect(() => assertExperimentDataIsConsistent()).not.toThrow();
  });

  it("uses the lesson's running system and the shared elimination step", () => {
    expect(R1).toEqual([1, 3, -1]);
    expect(R2).toEqual([2, -1, 5]);
    expect(OPERATION).toEqual({ kind: "add", source: 0, target: 1, factor: -2 });
    expect(MULTIPLIER).toBe(2);
  });

  it("produces the eliminated row the brief specifies", () => {
    expect([...NEW_R2]).toEqual([0, -7, 7]);
    expect([...SCALED_R1]).toEqual([2, 6, -2]);
  });

  it("keeps the solution fixed — the invariant every clip must show", () => {
    expect(SOLUTION[0]).toBeCloseTo(2, 12);
    expect(SOLUTION[1]).toBeCloseTo(-1, 12);
    expect(satisfiesSystem(START_SYSTEM, SOLUTION)).toBe(true);
    expect(satisfiesSystem(END_SYSTEM, SOLUTION)).toBe(true);
  });

  it("exposes each column's own subtraction, so a clip can show its origin", () => {
    // Exactly the three the brief names: 2−2=0, −1−6=−7, 5−(−2)=7.
    expect(
      COLUMNS.map((c) => [c.minuend, c.subtrahend, c.result]),
    ).toEqual([
      [2, 2, 0],
      [-1, 6, -7],
      [5, -2, 7],
    ]);
    for (const column of COLUMNS) {
      expect(column.minuend - column.subtrahend).toBeCloseTo(column.result, 12);
    }
    expect(COLUMNS.filter((c) => c.isTarget).map((c) => c.id)).toEqual(["x"]);
  });

  it("reconstructs the promoted row from the columns alone", () => {
    expect(COLUMNS.map((c) => c.result)).toEqual([...NEW_R2]);
  });
});

describe("the pencil the pivot and search clips sweep", () => {
  it("is anchored at R₂ and reaches the eliminated row", () => {
    expect([...rowAtAlpha(0)]).toEqual([...R2]);
    expect([...rowAtAlpha(FACTOR)]).toEqual([...NEW_R2]);
  });

  it("licenses a continuous sweep: every member holds the solution", () => {
    // This is what makes the pivot's tween honest rather than a transition
    // between two unrelated pictures — including at non-integer α.
    for (const alpha of [-3, -2.5, -2, -1.25, -1, -0.5, 0, 0.75]) {
      const row = rowAtAlpha(alpha);
      expect(
        row[0] * SOLUTION[0]! + row[1] * SOLUTION[1]!,
        `alpha=${alpha}`,
      ).toBeCloseTo(row[2], 12);
    }
  });

  it("crosses zero in the x-coefficient exactly once, at the chosen multiple", () => {
    const zeros = ALPHA_STOPS.filter((a) => Math.abs(rowAtAlpha(a)[0]) < 1e-12);
    expect(zeros).toEqual([FACTOR]);
  });

  it("ends horizontal, which is the pivot clip's payoff", () => {
    // "Eliminating x" and "the line stops depending on x" are the same fact.
    expect(rowAtAlpha(FACTOR)[0]).toBe(0);
    expect(Math.abs(rowAtAlpha(FACTOR)[1])).toBeGreaterThan(0);
  });
});

describe("candidate registry", () => {
  it("offers three genuinely labelled candidates and no declared winner", () => {
    expect(listCandidateIds()).toEqual(["longhand", "pivot", "combination"]);
    for (const candidate of ELIMINATION_CANDIDATES) {
      expect(candidate.obstacle.length).toBeGreaterThan(40);
      expect(candidate.distinctBecause.length).toBeGreaterThan(40);
      expect(JSON.stringify(candidate)).not.toMatch(/recommended|winner|best/i);
    }
  });

  it("throws for an unknown candidate rather than silently falling back", () => {
    expect(() => getEliminationCandidate("nope")).toThrow(/Unknown elimination/);
  });

  it("gives every candidate ordered beats that fit inside its duration", () => {
    // The lab's chapter buttons seek to `beat.at`, and `runCandidateBeats`
    // derives each beat's length from the NEXT beat — so an out-of-order or
    // overrunning beat list would seek somewhere the clip is not.
    for (const candidate of ELIMINATION_CANDIDATES) {
      expect(candidate.beats.length, candidate.id).toBeGreaterThanOrEqual(6);
      expect(candidate.beats[0]!.at, candidate.id).toBe(0);
      for (let i = 1; i < candidate.beats.length; i += 1) {
        expect(
          candidate.beats[i]!.at,
          `${candidate.id}.${candidate.beats[i]!.id}`,
        ).toBeGreaterThan(candidate.beats[i - 1]!.at);
      }
      expect(
        candidate.beats.at(-1)!.at,
        candidate.id,
      ).toBeLessThan(candidate.durationSeconds);
    }
  });

  it("has unique beat ids within a candidate", () => {
    for (const candidate of ELIMINATION_CANDIDATES) {
      const ids = candidate.beats.map((b) => b.id);
      expect(new Set(ids).size, candidate.id).toBe(ids.length);
    }
  });
});

describe("LaTeX formatting the frames are typeset from", () => {
  it("writes a row the way a person writes the equation", () => {
    expect(texEquation(R1)).toBe("x + 3y = -1");
    expect(texEquation(R2)).toBe("2x - y = 5");
    // The eliminated row drops its x term entirely — that IS the result.
    expect(texEquation(NEW_R2)).toBe("-7y = 7");
  });

  it("keeps a literal 0 when a row has no terms left at all", () => {
    expect(texEquation([0, 0, 3])).toBe("0 = 3");
  });

  it("never prints a negative zero into a frame", () => {
    expect(texNumber(-0)).toBe("0");
    expect(texNumber(-0.0000001)).toBe("0");
  });
});
