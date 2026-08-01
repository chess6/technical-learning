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

/**
 * A callout's shape is a per-callout decision (`vision.md` §12.1). These cover
 * the shapes that decision actually produces — not just the three-act default.
 */
describe("MisconceptionCallout authored move shapes", () => {
  it("renders a single unlabelled move as one paragraph with no lead-in", () => {
    const { container } = render(
      <MisconceptionCallout
        title="Subrectangles, not squares"
        moves={[{ body: "$AC$ and $BD$ are subrectangles, not corner squares." }]}
      />,
    );
    expect(container.querySelectorAll("p.misconception-callout__move-1")).toHaveLength(1);
    // The whole point: no "Repair." bolted onto a one-line correction.
    expect(container.querySelectorAll(".misconception-callout__label")).toHaveLength(0);
    expect(screen.queryByText("Repair.")).toBeNull();
  });

  it("renders two moves with authored lead-ins, and no third", () => {
    const { container } = render(
      <MisconceptionCallout
        title="Sufficiency is not necessity"
        moves={[
          { label: "What the premise gives.", body: "Three multiplications suffice." },
          { label: "What it does not give.", body: "That three are necessary is unproved." },
        ]}
      />,
    );
    expect(container.querySelectorAll("p[class^='misconception-callout__move']")).toHaveLength(2);
    expect(screen.getByText("What the premise gives.")).toBeTruthy();
    expect(screen.getByText("What it does not give.")).toBeTruthy();
    expect(screen.queryByText("But watch.")).toBeNull();
  });

  it("still renders the belief/confront/resolve shorthand with its default lead-ins", () => {
    render(
      <MisconceptionCallout title="A real trap" belief="b" confront="c" resolve="r" />,
    );
    expect(screen.getByText("Tempting belief.")).toBeTruthy();
    expect(screen.getByText("But watch.")).toBeTruthy();
    expect(screen.getByText("Repair.")).toBeTruthy();
  });

  it("prefers authored moves over the shorthand when both are supplied", () => {
    render(
      <MisconceptionCallout
        title="Both"
        moves={[{ label: "Only this.", body: "Authored beat." }]}
        belief="ignored"
        confront="ignored"
        resolve="ignored"
      />,
    );
    expect(screen.getByText("Only this.")).toBeTruthy();
    expect(screen.queryByText("Tempting belief.")).toBeNull();
  });
});
