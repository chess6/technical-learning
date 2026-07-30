import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { TelescopingCancellation } from "../TelescopingCancellation";
import {
  EX_PARABOLA,
  intervalContributions,
  partitionPoints,
  type SignedContribution,
} from "../../math";

/**
 * The `telescoping-cancellation` family. Package-ledger check P2: it must be
 * parameterized over the cancelling pairs, not hard-coded to interval
 * endpoints, because `greens-theorem` re-runs it over shared interior edges.
 */

describe("TelescopingCancellation", () => {
  it("reports the interval case correctly: 5 pieces, 4 cancellations, two survivors", () => {
    // 5 pieces means 6 points and 2 raw contributions per piece (once as a
    // term's "to", once as the next term's "from") — 10 contributions total,
    // 4 of the 6 points cancel (the interior ones), and 2 survive (the ends).
    const points = partitionPoints(0, 2, 5, "unequal");
    const contributions = intervalContributions(EX_PARABOLA.antiderivative!, points);
    const { container } = render(<TelescopingCancellation contributions={contributions} />);
    const text = container.textContent ?? "";
    expect(text).toContain("10 contributions");
    expect(text).toContain("4 cancellations");
    expect(text).toContain("2 survivors");
  });

  it("REQUIRED: renders a non-interval pairing — shared interior edges, not a chain", () => {
    // Three cells sharing two interior edges, exactly the structure
    // `greens-theorem` needs: no 1D order, no "endpoints", just ids and signs.
    const contributions: SignedContribution[] = [
      { id: "out1", sign: 1, value: 4, label: "outer edge 1" },
      { id: "AB", sign: 1, value: 10, label: "AB (cell 1)" },
      { id: "AB", sign: -1, value: 10, label: "AB (cell 2)" },
      { id: "BC", sign: 1, value: -3, label: "BC (cell 2)" },
      { id: "BC", sign: -1, value: -3, label: "BC (cell 3)" },
      { id: "out3", sign: 1, value: 7, label: "outer edge 3" },
    ];
    const { container } = render(<TelescopingCancellation contributions={contributions} />);
    const text = container.textContent ?? "";
    expect(text).toContain("6 contributions");
    expect(text).toContain("2 cancellations");
    expect(text).toContain("2 survivors");

    // The two outer edges are the survivors, rendered without a strike-through;
    // the shared interior edges AB and BC are rendered struck through.
    const terms = [...container.querySelectorAll(".telescoping-cancellation__term")];
    const survivorTerm = terms.find((t) => t.textContent?.includes("outer edge 1"));
    const cancelledTerm = terms.find((t) => t.textContent?.includes("AB (cell 1)"));
    expect(survivorTerm?.getAttribute("data-cancels")).toBe("false");
    expect(cancelledTerm?.getAttribute("data-cancels")).toBe("true");
    expect(
      survivorTerm?.querySelector(".telescoping-cancellation__value--struck"),
    ).toBeNull();
    expect(
      cancelledTerm?.querySelector(".telescoping-cancellation__value--struck"),
    ).not.toBeNull();
  });

  it("does not assume any particular id naming or ordering", () => {
    // Shuffled, non-numeric, non-sequential ids — still resolves correctly.
    const contributions: SignedContribution[] = [
      { id: "zeta", sign: -1, value: 1, label: "zeta-" },
      { id: "alpha", sign: 1, value: 1, label: "alpha+" },
      { id: "zeta", sign: 1, value: 1, label: "zeta+" },
      { id: "alpha", sign: -1, value: 1, label: "alpha-" },
      { id: "lonely", sign: 1, value: 1, label: "lonely" },
    ];
    const { container } = render(<TelescopingCancellation contributions={contributions} />);
    const text = container.textContent ?? "";
    expect(text).toContain("5 contributions");
    expect(text).toContain("2 cancellations");
    expect(text).toContain("1 survivors");
  });
});
