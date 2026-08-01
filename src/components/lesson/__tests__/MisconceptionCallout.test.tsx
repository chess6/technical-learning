import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MisconceptionCallout } from "../MisconceptionCallout";

describe("MisconceptionCallout", () => {
  it("renders belief, confront, and resolve with their labels", () => {
    render(
      <MisconceptionCallout
        title="Not all four products are needed"
        belief="You must compute all four products."
        confront="The answer only ever uses their sum."
        resolve="One extra product recovers exactly that sum."
      />,
    );
    expect(screen.getByText("Tempting belief.")).toBeTruthy();
    expect(screen.getByText("But watch.")).toBeTruthy();
    expect(screen.getByText("Repair.")).toBeTruthy();
  });

  it("renders no attribution line when none is authored", () => {
    render(<MisconceptionCallout title="Aside" belief="x" />);
    expect(screen.queryByText(/—/)).toBeNull();
  });

  it("renders a historical attribution (who, when — source) when authored", () => {
    render(
      <MisconceptionCallout
        title="The field believed $O(n^2)$ was optimal"
        belief="Multiplying two $n$-digit numbers needs $\\Theta(n^2)$ single-digit products."
        confront="Karatsuba found a way to use only three."
        resolve="Three products recurse into a $n^{\\log_2 3}$ algorithm."
        attribution={{ who: "Anatoly Karatsuba", when: "1960", source: "reported by Knuth, 1962" }}
      />,
    );
    expect(
      screen.getByText("Anatoly Karatsuba, 1960 — reported by Knuth, 1962"),
    ).toBeTruthy();
  });

  it("formats attribution gracefully when only some fields are authored", () => {
    const { rerender } = render(
      <MisconceptionCallout title="A" belief="b" attribution={{ who: "Someone" }} />,
    );
    expect(screen.getByText("Someone")).toBeTruthy();

    rerender(
      <MisconceptionCallout title="A" belief="b" attribution={{ source: "A paper" }} />,
    );
    expect(screen.getByText("A paper")).toBeTruthy();
  });
});
