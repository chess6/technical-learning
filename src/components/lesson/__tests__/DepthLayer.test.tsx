import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DepthLayer } from "../DepthLayer";

/**
 * Depth-layer titles are KaTeX-in-prose, like section titles and the layer body.
 * They were rendered as plain text, so nine lessons printed their delimiters
 * literally — "$P$ and $D$ are not unique" — on the page.
 */

describe("DepthLayer", () => {
  it("renders math in the TITLE, not just the body", () => {
    render(
      <DepthLayer
        layer={{
          kind: "trap",
          title: "$P$ and $D$ are not unique",
          body: "Reordering the eigenvectors reorders $D$.",
        }}
      />,
    );
    const summary = document.querySelector(".depth-layer__title")!;
    // The delimiters must be consumed by the renderer, never printed.
    expect(summary.textContent).not.toContain("$");
    // …and KaTeX must actually have run.
    expect(summary.querySelector(".katex")).not.toBeNull();
  });

  it("leaves a plain title untouched", () => {
    render(
      <DepthLayer
        layer={{ kind: "why", title: "Why nobody noticed", body: "Because." }}
      />,
    );
    expect(
      document.querySelector(".depth-layer__title")!.textContent,
    ).toBe("Why nobody noticed");
  });

  it("still renders the kind label and the body", () => {
    render(
      <DepthLayer
        layer={{ kind: "math-note", title: "A note", body: "Some $x$ here." }}
      />,
    );
    expect(screen.getByText("Mathematical note")).toBeTruthy();
    expect(document.querySelector(".depth-layer__body")).not.toBeNull();
  });
});
