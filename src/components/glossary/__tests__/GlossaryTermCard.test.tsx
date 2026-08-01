import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { GlossaryTermCard } from "../GlossaryTermCard";
import { getGlossaryTerm } from "../../../lessons/glossary";

function renderTerm(id: string) {
  const term = getGlossaryTerm(id);
  if (!term) throw new Error(`no such glossary term: ${id}`);
  return render(
    <MemoryRouter>
      <GlossaryTermCard term={term} />
    </MemoryRouter>,
  );
}

describe("GlossaryTermCard curriculum-graph sections", () => {
  it("renders an Applications chip with the target concept's blurb as its title tooltip", () => {
    // eigenvector --application-of--> dynamical-systems (src/curriculum/edges.ts)
    renderTerm("eigenvector");
    const chip = screen.getByText("Dynamical Systems");
    expect(chip.getAttribute("title")).toBe(
      "Long-run behavior of a system that repeatedly applies the same linear map.",
    );
  });

  it("renders a 'Comes up again in' link to a built lesson that revisits the term", () => {
    // determinant --revisited-by--> eigenvectors (src/curriculum/edges.ts)
    renderTerm("determinant");
    const link = screen.getByRole("link", { name: /Eigenvectors/ });
    expect(link.getAttribute("href")).toBe("/lesson/eigenvectors");
  });

  it("renders neither section for a term with no curriculum-graph connections", () => {
    renderTerm("in-order-traversal");
    expect(screen.queryByText("Applications")).toBeNull();
    expect(screen.queryByText("Comes up again in")).toBeNull();
  });
});
