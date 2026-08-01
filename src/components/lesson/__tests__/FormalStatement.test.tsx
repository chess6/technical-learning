import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormalStatement } from "../FormalStatement";
import type { FormalBlock } from "../../../lessons/types";

const theorem: FormalBlock = {
  id: "thm",
  kind: "theorem",
  label: "Basis ⇔ unique representation",
  statement: "Every vector has one and only one representation $a\\mathbf{v}+b\\mathbf{w}$.",
  interpretation: "Span gives existence; independence gives uniqueness.",
  visibility: "revealed",
  layers: [
    { kind: "math-note", title: "Why", body: "Independence forces $a=a'$." },
  ],
};

describe("FormalStatement", () => {
  it("renders the kind badge, label, statement, and interpretation", () => {
    render(<FormalStatement block={theorem} />);
    const block = screen.getByTestId("formal-thm");
    expect(block.getAttribute("data-kind")).toBe("theorem");
    expect(block.getAttribute("data-visibility")).toBe("revealed");
    expect(screen.getByText("Theorem")).toBeTruthy();
    expect(block.textContent).toMatch(/Basis ⇔ unique representation/);
    expect(block.textContent).toMatch(/Span gives existence/);
  });

  it("renders justification layers as collapsible details", () => {
    const { container } = render(<FormalStatement block={theorem} />);
    expect(screen.getByText("Why")).toBeTruthy();
    expect(container.querySelector("details")).toBeTruthy();
  });

  it("marks reference blocks with a muted visibility", () => {
    render(
      <FormalStatement
        block={{
          id: "cor",
          kind: "corollary",
          statement: "Outputs are column combinations.",
          interpretation: "Named as a consequence only.",
          visibility: "reference",
        }}
      />,
    );
    expect(
      screen.getByTestId("formal-cor").getAttribute("data-visibility"),
    ).toBe("reference");
  });

  it("never renders `proof` under the default statement variant", () => {
    const withProof: FormalBlock = {
      ...theorem,
      id: "thm-with-proof",
      proof: "Suppose $a\\mathbf{v}+b\\mathbf{w}=a'\\mathbf{v}+b'\\mathbf{w}$.",
    };
    render(<FormalStatement block={withProof} />);
    expect(screen.queryByText("Proof.")).toBeNull();
  });

  it("renders `proof` as its OWN minimal block under variant=\"proof\" — never repeating the statement", () => {
    const withProof: FormalBlock = {
      ...theorem,
      id: "thm-with-proof-2",
      proof: "Suppose $a\\mathbf{v}+b\\mathbf{w}=a'\\mathbf{v}+b'\\mathbf{w}$.",
    };
    const { container } = render(<FormalStatement block={withProof} variant="proof" />);
    // Labeled by which theorem it proves, ends in ∎.
    expect(
      screen.getByText(/^Proof \(Theorem — Basis ⇔ unique representation\)\.$/),
    ).toBeTruthy();
    expect(container.querySelector(".formal-statement__proof-end")?.textContent).toMatch(/∎/);
    // No repeated statement/interpretation/layers — this is proof-only.
    expect(container.textContent).not.toMatch(/one and only one representation/);
    expect(container.textContent).not.toMatch(/Span gives existence/);
    expect(container.querySelector("details")).toBeNull();
  });

  it("renders nothing under variant=\"proof\" when the block has no proof field", () => {
    const { container } = render(<FormalStatement block={theorem} variant="proof" />);
    expect(container.firstChild).toBeNull();
  });
});
