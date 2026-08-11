import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MathExpressionInput } from "../MathExpressionInput";

/**
 * The answer field's job is not "accept text" — a plain `<input>` does that.
 * It is to make the PARSE visible before submission, so a learner discovers
 * their `1/2x` was read as `(1/2)x` while they can still change it. These
 * tests are written against what a learner can see and reach.
 */

function Harness({ initial = "", variables = ["x"] }: { initial?: string; variables?: string[] }) {
  const [value, setValue] = useState(initial);
  return (
    <MathExpressionInput
      label="Your answer"
      value={value}
      onChange={setValue}
      variables={variables}
    />
  );
}

const field = () => screen.getByLabelText("Your answer") as HTMLInputElement;

const type = (text: string) => fireEvent.change(field(), { target: { value: text } });

describe("MathExpressionInput", () => {
  it("renders typed notation as mathematics, without the learner writing LaTeX", () => {
    const { container } = render(<Harness />);
    type("x^2 + 3x + 7");
    const rendered = container.querySelector(".math-expression__rendered");
    expect(rendered).not.toBeNull();
    // KaTeX emits MathML alongside its HTML; the annotation carries the TeX
    // that was generated, which is what proves the parse round-tripped.
    expect(rendered!.innerHTML).toContain("x^{2} + 3x + 7");
  });

  it("shows the empty state as guidance, not as an error", () => {
    const { container } = render(<Harness />);
    expect(container.querySelector(".math-expression__hint")).not.toBeNull();
    expect(container.querySelector(".math-expression__error")).toBeNull();
    expect(field().getAttribute("aria-invalid")).toBe("false");
  });

  it("reports an incomplete expression in plain language, and marks the field invalid", () => {
    const { container } = render(<Harness />);
    type("2(x+1");
    const error = container.querySelector(".math-expression__error");
    expect(error?.textContent).toMatch(/never closed/i);
    expect(field().getAttribute("aria-invalid")).toBe("true");
  });

  it("makes an ambiguous input's reading visible before submission", () => {
    // The whole reason the preview exists: `1/2x` has two defensible readings
    // and the learner is entitled to see which one they got.
    const { container } = render(<Harness />);
    type("1/2x");
    expect(container.querySelector(".math-expression__rendered")!.innerHTML).toContain(
      "\\frac{1}{2}x",
    );
    type("1/(2x)");
    expect(container.querySelector(".math-expression__rendered")!.innerHTML).toContain(
      "\\frac{1}{2x}",
    );
  });

  it("keeps the palette closed until asked, then offers the item's own variables first", () => {
    render(<Harness variables={["theta"]} />);
    expect(screen.queryByRole("group", { name: /symbols and operations/i })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /show symbols and operations/i }));
    const palette = screen.getByRole("group", { name: /symbols and operations/i });
    const keys = [...palette.querySelectorAll("button")].map((b) => b.textContent);
    expect(keys[0]).toBe("theta");
    expect(keys).toContain("√");
    expect(keys).toContain("π");
  });

  it("inserts a palette symbol at the caret rather than appending", () => {
    render(<Harness initial="ab" />);
    const input = field();
    input.setSelectionRange(1, 1); // between a and b
    fireEvent.click(screen.getByRole("button", { name: /show symbols/i }));
    fireEvent.click(screen.getByRole("button", { name: "x" }));
    expect(field().value).toBe("axb");
  });

  it("replaces the selection when one exists", () => {
    render(<Harness initial="abc" />);
    const input = field();
    input.setSelectionRange(1, 3); // select "bc"
    fireEvent.click(screen.getByRole("button", { name: /show symbols/i }));
    fireEvent.click(screen.getByRole("button", { name: "x" }));
    expect(field().value).toBe("ax");
  });

  it("inserts a function with its parentheses, ready to be filled", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: /show symbols/i }));
    fireEvent.click(screen.getByRole("button", { name: "√" }));
    expect(field().value).toBe("sqrt()");
  });

  it("submits on Enter without submitting a surrounding form twice", () => {
    const onSubmit = vi.fn();
    render(
      <MathExpressionInput label="Your answer" value="x" onChange={() => {}} onSubmit={onSubmit} />,
    );
    fireEvent.keyDown(screen.getByLabelText("Your answer"), { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("never emits raw markup for a hostile input — it fails to parse instead", () => {
    const { container } = render(<Harness />);
    type("<script>alert(1)</script>");
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector(".math-expression__error")).not.toBeNull();
    expect(container.querySelector(".math-expression__rendered")).toBeNull();
  });

  it("disables every control when disabled", () => {
    render(
      <MathExpressionInput label="Your answer" value="x" onChange={() => {}} disabled />,
    );
    expect((screen.getByLabelText("Your answer") as HTMLInputElement).disabled).toBe(true);
    expect(
      (screen.getByRole("button", { name: /show symbols/i }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});
