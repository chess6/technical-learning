import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { getExplorer, hasExplorer } from "../registry";

describe("explorer registry (M6 lazy-loading)", () => {
  it("reports known explorers and rejects unknown ids", () => {
    expect(hasExplorer("linear-combination")).toBe(true);
    expect(hasExplorer("matrix-transformation")).toBe(true);
    expect(hasExplorer("determinant-area-scaling")).toBe(true);
    expect(hasExplorer("eigenvectors-invariant-directions")).toBe(true);
    expect(hasExplorer("karatsuba-cross-terms")).toBe(true);
    expect(hasExplorer("not-a-real-explorer")).toBe(false);
    expect(getExplorer("not-a-real-explorer")).toBeUndefined();
  });

  it("shows a loading placeholder, then the lazily-loaded explorer", async () => {
    const Explorer = getExplorer("linear-combination");
    expect(Explorer).toBeDefined();

    render(<>{Explorer!()}</>);

    expect(screen.getByText("Loading exploration…")).toBeTruthy();

    await waitFor(() => {
      expect(screen.queryByText("Loading exploration…")).toBeNull();
    });
  });
});
