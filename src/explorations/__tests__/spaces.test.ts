import { describe, expect, it } from "vitest";
import {
  COEFFICIENT_SPACE,
  MATH_SPACES,
  OUTPUT_SPACE,
} from "../spaces";

describe("math-space descriptors (systems lesson proof)", () => {
  it("names the coefficient space explicitly, with the (x, y) qualifier", () => {
    expect(COEFFICIENT_SPACE.label).toBe("Coefficient space (x, y)");
    expect(COEFFICIENT_SPACE.role).toBe("coefficient");
  });

  it("names the output space explicitly", () => {
    expect(OUTPUT_SPACE.label).toBe("Output space");
    expect(OUTPUT_SPACE.role).toBe("output");
  });

  it("gives the two panels distinct, visible labels", () => {
    expect(COEFFICIENT_SPACE.label).not.toBe(OUTPUT_SPACE.label);
    expect(COEFFICIENT_SPACE.role).not.toBe(OUTPUT_SPACE.role);
  });

  it("exposes both roles through the advisory registry", () => {
    expect(MATH_SPACES.coefficient).toBe(COEFFICIENT_SPACE);
    expect(MATH_SPACES.output).toBe(OUTPUT_SPACE);
  });
});
