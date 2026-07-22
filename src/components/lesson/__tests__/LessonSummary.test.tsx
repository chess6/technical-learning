import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LessonSummary } from "../LessonSummary";
import type { StructuredSummary } from "../../../lessons/types";

function renderSummary(props: Parameters<typeof LessonSummary>[0]) {
  return render(
    <MemoryRouter>
      <LessonSummary {...props} />
    </MemoryRouter>,
  );
}

describe("LessonSummary structured rendering", () => {
  const structured: StructuredSummary = {
    coreMentalModel: "A basis is a coordinate language.",
    definitionsIntroduced: ["Span", "Basis"],
    mainResult: "A basis gives unique coordinates.",
    commonMistake: "The coordinates are not the vector.",
    canonicalExample: "v and w reaching the point p.",
    oneProblemWorthRemembering: "Solve a two by two system.",
    whatThisUnlocksNext: "Matrices read coordinates.",
  };

  it("renders the mental model as the hero and the high-value fields in view", () => {
    const { container } = renderSummary({
      takeaway: "legacy takeaway",
      objectives: ["did a thing"],
      structured,
    });
    const text = container.textContent ?? "";
    expect(text).toContain("The mental model");
    expect(text).toContain("A basis is a coordinate language.");
    expect(text).toContain("The result");
    expect(text).toContain("A basis gives unique coordinates.");
    expect(text).toContain("Watch out for");
    expect(text).toContain("The coordinates are not the vector.");
  });

  it("tucks reference detail behind progressive disclosure", () => {
    const { container } = renderSummary({
      takeaway: "",
      objectives: [],
      structured,
    });
    expect(container.textContent).toContain("More to remember");
    expect(container.textContent).toContain("What this unlocks next");
    // The extra fields live inside a <details> element (collapsed by default).
    const details = container.querySelector(".lesson-summary__more");
    expect(details?.tagName.toLowerCase()).toBe("details");
    expect((details as HTMLDetailsElement).open).toBe(false);
  });

  it("always offers a glossary re-entry link", () => {
    const { getByRole } = renderSummary({
      takeaway: "t",
      objectives: [],
      structured,
    });
    const link = getByRole("link", { name: /glossary/i });
    expect(link.getAttribute("href")).toBe("/glossary");
  });
});

describe("LessonSummary legacy fallback (no structured summary)", () => {
  it("renders the takeaway and objectives, and no structured labels", () => {
    const { container } = renderSummary({
      takeaway: "The one thing to remember.",
      objectives: ["Objective one", "Objective two"],
    });
    const text = container.textContent ?? "";
    expect(text).toContain("The one thing to remember.");
    expect(text).toContain("What this lesson set out to do");
    expect(text).toContain("Objective one");
    // Structured-only affordances are absent.
    expect(text).not.toContain("The mental model");
    expect(text).not.toContain("More to remember");
    expect(container.querySelector(".lesson-summary__more")).toBeNull();
  });
});
