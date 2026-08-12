import { describe, expect, it } from "vitest";
import { improperIntegralsLesson } from "../improperIntegrals";
import { ITEM_ASSESSMENT_META } from "../assessmentManifest";
import { CAPABILITY_EVIDENCE_CEILING } from "../evidence";
import type { ExerciseDefinition } from "../types";
import { describeGradingContract } from "./gradingContract";

const byId = new Map(improperIntegralsLesson.exercises!.map((exercise) => [exercise.id, exercise]));
const item = (id: string): ExerciseDefinition => {
  const exercise = byId.get(id);
  if (!exercise) throw new Error("missing exercise " + id);
  return exercise;
};
const pick = (choice: number) => ({ kind: "multiple-choice" as const, choice });
const text = (value: string) => ({ kind: "text" as const, value });
const numeric = (value: number) => ({ kind: "numeric" as const, value });
const sequence = (...responses: Array<ReturnType<typeof pick> | ReturnType<typeof text> | ReturnType<typeof numeric>>) =>
  ({ responses });
const comparison = (
  C: number,
  p: number,
  direction: "target-lte-comparator" | "comparator-lte-target",
  comparatorVerdict: "converges" | "diverges",
  conclusion: "target-converges" | "target-diverges",
  targetFiniteIntegrable = true,
  comparatorFiniteIntegrable = true,
) => ({
  C, p, direction, targetFiniteIntegrable, comparatorFiniteIntegrable,
  comparatorVerdict, conclusion,
});

describeGradingContract(item("imp-scandal-predict"), {
  mustAccept: [{ name: "spots the failed hypothesis", answer: { committedIndex: 1 } }],
  mustReject: [{ name: "blind FTC ritual", answer: { committedIndex: 0 } }],
});

describeGradingContract(item("imp-definition-edges"), {
  mustAccept: [{ name: "all five edge families", answer: sequence(pick(0), pick(0), pick(0), pick(0), pick(0)) }],
  mustReject: [
    { name: "blank", answer: sequence() },
    { name: "bad-left edge omitted", answer: sequence(pick(0)) },
    { name: "right orientation reversed", answer: sequence(pick(0), pick(0), pick(1), pick(0), pick(0)) },
    { name: "principal value substituted for interior split", answer: sequence(pick(0), pick(0), pick(0), pick(1), pick(0)) },
    { name: "symmetric route substituted for two-sided definition", answer: sequence(pick(0), pick(0), pick(0), pick(0), pick(1)) },
  ],
});

describeGradingContract(item("imp-p-ladder"), {
  mustAccept: [{ name: "both edges and octave reason", answer: sequence(text("converges"), text("diverges"), pick(0)) }],
  mustReject: [
    { name: "blank", answer: sequence() },
    { name: "copies the infinity verdict to zero", answer: sequence(text("converges"), text("converges"), pick(0)) },
    { name: "knife-edge reason omitted", answer: sequence(text("converges"), text("diverges")) },
    { name: "says the integrand stops decreasing", answer: sequence(text("converges"), text("diverges"), pick(1)) },
  ],
});

describeGradingContract(item("imp-verdict-classify"), {
  mustAccept: [{ name: "settles, unbounded, oscillates", answer: sequence(text("converges"), text("unbounded"), text("oscillates")) }],
  mustReject: [
    { name: "blank", answer: sequence() },
    { name: "bounded is treated as convergent", answer: sequence(text("converges"), text("unbounded"), text("converges")) },
    { name: "unbounded and oscillatory modes swapped", answer: sequence(text("converges"), text("oscillates"), text("unbounded")) },
    { name: "accepted word embedded in prose", answer: sequence(text("converges eventually maybe"), text("unbounded"), text("oscillates")) },
  ],
});

describeGradingContract(item("imp-comparison-produce"), {
  mustAccept: [
    { name: "p=2 boundary coefficient", answer: comparison(0.5, 2, "target-lte-comparator", "converges", "target-converges") },
    { name: "p=3 boundary coefficient", answer: comparison(1, 3, "target-lte-comparator", "converges", "target-converges") },
    { name: "interior exponent", answer: comparison(0.57, 2.5, "target-lte-comparator", "converges", "target-converges") },
  ],
  mustReject: [
    { name: "blank object", answer: {} },
    { name: "p=1 comparator does not converge", answer: comparison(1, 1, "target-lte-comparator", "converges", "target-converges") },
    { name: "insufficient coefficient", answer: comparison(0.49, 2, "target-lte-comparator", "converges", "target-converges") },
    { name: "wrong inequality direction", answer: comparison(1, 2, "comparator-lte-target", "converges", "target-converges") },
    { name: "target finite-integrability hypothesis missing", answer: comparison(1, 2, "target-lte-comparator", "converges", "target-converges", false, true) },
    { name: "comparator finite-integrability hypothesis missing", answer: comparison(1, 2, "target-lte-comparator", "converges", "target-converges", true, false) },
    { name: "wrong comparator verdict", answer: comparison(1, 2, "target-lte-comparator", "diverges", "target-converges") },
    { name: "wrong conclusion", answer: comparison(1, 2, "target-lte-comparator", "converges", "target-diverges") },
  ],
});

describeGradingContract(item("imp-comparison-diverge"), {
  mustAccept: [
    { name: "p=1/2 boundary", answer: comparison(1, 0.5, "comparator-lte-target", "diverges", "target-diverges") },
    { name: "p=1 boundary", answer: comparison(1, 1, "comparator-lte-target", "diverges", "target-diverges") },
    { name: "scaled interior exponent", answer: comparison(0.25, 0.75, "comparator-lte-target", "diverges", "target-diverges") },
  ],
  mustReject: [
    { name: "blank object", answer: {} },
    { name: "coefficient above boundary", answer: comparison(1.000001, 1, "comparator-lte-target", "diverges", "target-diverges") },
    { name: "p below boundary", answer: comparison(1, 0.499999, "comparator-lte-target", "diverges", "target-diverges") },
    { name: "p above divergent range", answer: comparison(1, 1.000001, "comparator-lte-target", "diverges", "target-diverges") },
    { name: "wrong inequality direction", answer: comparison(1, 1, "target-lte-comparator", "diverges", "target-diverges") },
    { name: "missing finite hypotheses", answer: comparison(1, 1, "comparator-lte-target", "diverges", "target-diverges", false, false) },
    { name: "wrong verdict", answer: comparison(1, 1, "comparator-lte-target", "converges", "target-diverges") },
  ],
});

describeGradingContract(item("imp-route-refusal"), {
  mustAccept: [{ name: "principal value distinguished from divergence", answer: sequence(pick(0), pick(0)) }],
  mustReject: [
    { name: "blank", answer: sequence() },
    { name: "calls symmetry the definition", answer: sequence(pick(1), pick(0)) },
    { name: "claims the sides converge and cancel", answer: sequence(pick(0), pick(1)) },
  ],
});

describeGradingContract(item("imp-boundary-limit"), {
  mustAccept: [{ name: "finite parts, squeeze, total", answer: sequence(pick(0), pick(0), numeric(1)) }],
  mustReject: [
    { name: "blank", answer: sequence() },
    { name: "drops the extra exponential term", answer: sequence(pick(1), pick(0), numeric(1)) },
    { name: "finite sample masquerades as proof", answer: sequence(pick(0), pick(1), numeric(1)) },
    { name: "product limit assumed", answer: sequence(pick(0), pick(2), numeric(1)) },
    { name: "wrong total", answer: sequence(pick(0), pick(0), numeric(0)) },
  ],
});

describe("L8 manifest and capability claims", () => {
  it("covers every L8 auto-graded item exactly", () => {
    for (const exercise of improperIntegralsLesson.exercises!) {
      expect(ITEM_ASSESSMENT_META[exercise.id], exercise.id).toBeDefined();
    }
  });
  it("pins the comparison ceiling and honest E3 claims", () => {
    expect(CAPABILITY_EVIDENCE_CEILING["tail-comparison"]).toBe("E3");
    expect(ITEM_ASSESSMENT_META["imp-comparison-produce"]?.evidenceTarget).toBe("E3");
    expect(ITEM_ASSESSMENT_META["imp-comparison-diverge"]?.methodSelection).toBe(false);
  });
  it("puts definitions before theorems that consume them", () => {
    const route = improperIntegralsLesson.route!;
    const typeOne = route.findIndex((block) => block.kind === "formal" && block.formalId === "def-type-one");
    const pTheorem = route.findIndex((block) => block.kind === "formal" && block.formalId === "thm-p-ladder");
    const comparison = route.findIndex((block) => block.kind === "formal" && block.formalId === "thm-comparison");
    expect(typeOne).toBeLessThan(pTheorem);
    expect(typeOne).toBeLessThan(comparison);
  });
  it("never states or stores the Gaussian value", () => {
    const gaussian = improperIntegralsLesson.sections.find((section) => section.id === "gaussian")!;
    expect(gaussian.body + gaussian.equation).not.toContain("\\sqrt{\\pi}");
    expect(gaussian.body).toContain("convergence only");
  });
});
