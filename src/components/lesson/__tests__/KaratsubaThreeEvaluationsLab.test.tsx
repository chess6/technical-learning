import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { KaratsubaThreeEvaluationsLab } from "../KaratsubaThreeEvaluationsLab";
import { karatsubaStep } from "../../../math";
import { KARATSUBA_CLEAN, KARATSUBA_BOUNDARY } from "../../../lessons/karatsubaData";

describe("KaratsubaThreeEvaluationsLab", () => {
  it("has an accessible region label", () => {
    render(<KaratsubaThreeEvaluationsLab />);
    expect(
      screen.getByRole("region", { name: "Three evaluations of a quadratic" }),
    ).toBeTruthy();
  });

  it("reads its three evaluations from the same karatsubaStep the lesson's exercises use", () => {
    render(<KaratsubaThreeEvaluationsLab />);
    const step = karatsubaStep(KARATSUBA_CLEAN.x, KARATSUBA_CLEAN.y, KARATSUBA_CLEAN.m);

    expect(screen.getByTestId("eval-t0").textContent).toContain(String(step.z0));
    expect(screen.getByTestId("eval-t1").textContent).toContain(String(step.sumProduct));
    expect(screen.getByTestId("eval-leading").textContent).toContain(String(step.z2));
    expect(screen.getByTestId("eval-reconstruct").textContent).toContain(String(step.z1));
  });

  it("defaults to a configured exampleId when it resolves to a real preset", () => {
    render(
      <KaratsubaThreeEvaluationsLab
        config={{ exampleId: KARATSUBA_BOUNDARY.id }}
      />,
    );
    const step = karatsubaStep(
      KARATSUBA_BOUNDARY.x,
      KARATSUBA_BOUNDARY.y,
      KARATSUBA_BOUNDARY.m,
    );
    expect(screen.getByTestId("eval-t0").textContent).toContain(String(step.z0));
  });

  it("falls back to the first preset when config.exampleId does not resolve", () => {
    render(<KaratsubaThreeEvaluationsLab config={{ exampleId: "nonexistent" }} />);
    const step = karatsubaStep(KARATSUBA_CLEAN.x, KARATSUBA_CLEAN.y, KARATSUBA_CLEAN.m);
    expect(screen.getByTestId("eval-t0").textContent).toContain(String(step.z0));
  });

  it("switches examples via the picker and recomputes the three evaluations", () => {
    render(<KaratsubaThreeEvaluationsLab />);
    const picker = screen.getByLabelText("Example for the three-evaluations lab");
    fireEvent.change(picker, { target: { value: KARATSUBA_BOUNDARY.id } });

    const step = karatsubaStep(
      KARATSUBA_BOUNDARY.x,
      KARATSUBA_BOUNDARY.y,
      KARATSUBA_BOUNDARY.m,
    );
    expect(screen.getByTestId("eval-t0").textContent).toContain(String(step.z0));
  });

  it("renders every $...$ fragment through KaTeX — no raw dollar-delimited text reaches the DOM", () => {
    const { container } = render(<KaratsubaThreeEvaluationsLab />);
    // A stray un-rendered "$z_0$" (plain JSX text instead of ProseWithMath)
    // would leave a literal "$" in the accessible text; KaTeX's own rendered
    // output never contains "$" characters.
    expect(container.textContent).not.toMatch(/\$/);
  });
});
