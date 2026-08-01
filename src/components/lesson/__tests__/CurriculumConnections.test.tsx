import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CurriculumConnections } from "../CurriculumConnections";

function renderConnections(lessonId: string) {
  return render(
    <MemoryRouter>
      <CurriculumConnections lessonId={lessonId} />
    </MemoryRouter>,
  );
}

describe("CurriculumConnections", () => {
  it("renders a 'Builds on' chip linking to a built prerequisite lesson", () => {
    // transformations requires vectors (LA §2.1) — both built.
    renderConnections("transformations");
    expect(screen.getByText("Builds on")).toBeTruthy();
    const link = screen.getByRole("link") as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("/lesson/vectors");
  });

  it("renders both resolvable requires-predecessors as links for eigenvectors", () => {
    // eigenvectors requires determinants and change-of-basis (LA §2.1) — both built.
    renderConnections("eigenvectors");
    const links = screen.getAllByRole("link") as HTMLAnchorElement[];
    const hrefs = links.map((link) => link.getAttribute("href"));
    expect(hrefs).toContain("/lesson/determinants");
    expect(hrefs).toContain("/lesson/change-of-basis");
  });

  it("renders nothing for a lesson with no resolvable curriculum connections", () => {
    // binary-search-trees carries no LA/AM requires/same-structure-as/refresher-for edges.
    const { container } = renderConnections("binary-search-trees");
    expect(container.querySelector(".curriculum-connections")).toBeNull();
  });

  it("never fabricates a label for an unresolvable lesson id", () => {
    const { container } = renderConnections("not-a-real-lesson-id");
    expect(container.querySelector(".curriculum-connections")).toBeNull();
  });
});
