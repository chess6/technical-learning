import { describe, expect, it } from "vitest";
import {
  ELIMINATION_COLUMNS,
  ELIMINATION_DISPLAY_ROWS,
  ELIMINATION_FACTOR,
  ELIMINATION_SOLUTION,
  NEW_R2,
  R1,
  R2,
  SCALED_R1,
  assertEliminationMathIsConsistent,
  displayedEquation,
  displayedRow,
  rowAtAlpha,
  texEquation,
} from "../eliminationRows";

/**
 * The elimination clip's algebra, and the rule that keeps it discrete.
 *
 * The clip's geometry is continuous — R₂'s line rotates through the pencil of
 * constraints about the crossing — while its algebra must not be. These tests
 * hold that separation, because losing it is exactly the defect the scene was
 * rebuilt to remove: a coefficient interpolated from its old value to its new
 * one shows equations nobody wrote.
 */

const isInteger = (row: readonly number[]) =>
  row.every((value) => Number.isInteger(value));

describe("elimination algebra", () => {
  it("is self-consistent (the guard the scene runs first)", () => {
    expect(() => assertEliminationMathIsConsistent()).not.toThrow();
  });

  it("derives the operation's rows from the shared example", () => {
    expect([...R1]).toEqual([1, 3, -1]);
    expect([...R2]).toEqual([2, -1, 5]);
    expect([...SCALED_R1]).toEqual([2, 6, -2]);
    expect([...NEW_R2]).toEqual([0, -7, 7]);
    expect(ELIMINATION_FACTOR).toBe(-2);
  });

  it("exposes each column's own subtraction", () => {
    expect(
      ELIMINATION_COLUMNS.map((c) => [c.minuend, c.subtrahend, c.result]),
    ).toEqual([
      [2, 2, 0],
      [-1, 6, -7],
      [5, -2, 7],
    ]);
    expect(ELIMINATION_COLUMNS.filter((c) => c.isTarget)).toHaveLength(1);
  });
});

describe("the writable rows", () => {
  it("are exactly the row the operation starts from and the row it produces", () => {
    expect(ELIMINATION_DISPLAY_ROWS).toHaveLength(2);
    expect([...ELIMINATION_DISPLAY_ROWS[0]!]).toEqual([...R2]);
    expect([...ELIMINATION_DISPLAY_ROWS[1]!]).toEqual([...NEW_R2]);
  });

  it("have whole-number coefficients, so no frame can show a fraction", () => {
    for (const row of ELIMINATION_DISPLAY_ROWS) {
      expect(isInteger(row), JSON.stringify(row)).toBe(true);
    }
  });

  it("typeset without a decimal point or a fraction", () => {
    for (const stop of ELIMINATION_DISPLAY_ROWS.keys()) {
      const rendered = displayedEquation(stop);
      expect(rendered, rendered).not.toMatch(/[.]/);
      expect(rendered, rendered).not.toMatch(/frac|\//);
    }
    expect(displayedEquation(0)).toBe("2x - y = 5");
    // The eliminated row drops its x term entirely — that IS the result.
    expect(displayedEquation(1)).toBe("-7y = 7");
  });
});

describe("the sweep cannot leak fractions onto the screen", () => {
  /**
   * The regression. The pivot's tween is honest — every intermediate really is
   * a constraint through the solution — but the intermediates are unwritable,
   * and the label used to read straight off the tweened parameter.
   */
  it("really does pass through rows with fractional coefficients", () => {
    // If this ever became false the discrete-stop rule would be vacuous, and
    // this test would stop protecting anything.
    const fractional = [-1.75, -1.5, -0.5, -0.25]
      .map(rowAtAlpha)
      .filter((row) => !isInteger(row));
    expect(fractional.length).toBeGreaterThan(0);
    expect(texEquation(rowAtAlpha(-0.5))).toMatch(/[.]/);
  });

  it("refuses to typeset anything between two stops", () => {
    for (const between of [0.5, -0.25, 0.999, 1.5, ELIMINATION_FACTOR]) {
      expect(() => displayedEquation(between), `stop ${between}`).toThrow(
        /whole stops/,
      );
      expect(() => displayedRow(between), `stop ${between}`).toThrow();
    }
  });

  it("refuses a stop outside the writable set", () => {
    expect(() => displayedEquation(-1)).toThrow();
    expect(() => displayedEquation(2)).toThrow();
  });

  it("keeps every intermediate constraint through the solution", () => {
    // What licenses drawing the sweep as one continuous rotation at all.
    for (const alpha of [-2, -1.5, -1, -0.5, 0]) {
      const row = rowAtAlpha(alpha);
      expect(
        row[0] * ELIMINATION_SOLUTION[0]! + row[1] * ELIMINATION_SOLUTION[1]!,
        `alpha=${alpha}`,
      ).toBeCloseTo(row[2], 12);
    }
  });

  it("reaches the eliminated row exactly at the operation's factor", () => {
    expect([...rowAtAlpha(ELIMINATION_FACTOR)]).toEqual([...NEW_R2]);
    expect(rowAtAlpha(ELIMINATION_FACTOR)[0]).toBe(0);
  });
});
