import { describe, expect, it } from "vitest";
import { chainRuleLesson } from "../chainRule";

/**
 * Regression guard for a mathematical defect that shipped twice in this lesson.
 *
 * The chain-rule lesson's whole thesis is that the substitution derivation
 * **never divides by the intermediate increment** \(\Delta u = k(h)\) — that is
 * precisely what "cancel the \(du\)'s" gets wrong, and it is why the rule needs
 * no special case at \(g'(a)=0\). But both the section prose and, later, the
 * `chain-derive-fresh` model answer reached the end by factoring
 *
 *     E_f(k(h))/h  =  [E_f(k(h))/k(h)] · [k(h)/h]
 *
 * which divides by `k(h)` and is undefined at exactly the \(k(h)=0\) case the
 * lesson makes a virtue of handling. Each instance asserted, in the same
 * breath, that no such division occurred.
 *
 * The repair is the extended error-factor form: \(E_f(k) = k\,\varepsilon_f(k)\)
 * with \(\varepsilon_f(0)=0\), so the identity holds at \(k=0\) and the error
 * term is a **product**, never a quotient:
 *
 *     E_f(k(h))/h  =  ε_f(k(h)) · k(h)/h
 *
 * These tests pin that repair in every place the derivation is presented.
 */

/** Division by the increment FUNCTION `k(h)` — the unsafe step. */
const DIVIDES_BY_INCREMENT = /\/\s*k\(h\)|\\frac\{[^{}]*\}\{\s*k\(h\)\s*\}/;

/**
 * `E_f(k)/k \to 0` is legitimate — it is the abstract limit statement defining
 * the error condition, where `k` ranges over nonzero steps. Only substituting
 * the concrete increment `k(h)` into a denominator is unsafe, because `k(h)`
 * can be exactly zero for real values of `h`.
 */
function derivationSurfaces(): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = [];

  for (const section of chainRuleLesson.sections) {
    out.push({ where: `section:${section.id}.body`, text: section.body });
    if (section.equation) out.push({ where: `section:${section.id}.equation`, text: section.equation });
    for (const layer of section.layers ?? []) {
      out.push({ where: `section:${section.id}.layer:${layer.title}`, text: layer.body });
    }
  }
  for (const worked of chainRuleLesson.workedExamples ?? []) {
    worked.equations.forEach((eq, i) =>
      out.push({ where: `worked:${worked.id}.equations[${i}]`, text: eq }),
    );
  }
  for (const exercise of chainRuleLesson.exercises ?? []) {
    const config = (exercise as { config?: Record<string, unknown> }).config;
    const model = config?.modelAnswer;
    if (typeof model === "string") {
      out.push({ where: `exercise:${exercise.id}.modelAnswer`, text: model });
    }
  }
  return out;
}

describe("chain-rule derivation never divides by the increment k(h)", () => {
  it("holds in every surface that presents the derivation", () => {
    const problems = derivationSurfaces()
      .filter(({ text }) => DIVIDES_BY_INCREMENT.test(text))
      .map(({ where, text }) => `  ${where}\n    ${text.slice(0, 200)}`);
    expect(
      problems,
      `The derivation divides by k(h), which is undefined when k(h) = 0 — the ` +
        `very case this lesson exists to handle, and which it claims elsewhere ` +
        `never to divide by. Use E_f(k) = k·ε_f(k) with ε_f(0) = 0 so the ` +
        `error term is a product:\n${problems.join("\n")}`,
    ).toEqual([]);
  });

  it("presents the extended error-factor form instead", () => {
    const surfaces = derivationSurfaces();
    const all = surfaces.map((s) => s.text).join("\n");
    // The device must actually appear, or the guard above could pass simply
    // because the derivation was deleted rather than repaired.
    expect(all).toMatch(/\\varepsilon_f/);
    expect(all).toMatch(/\\varepsilon_f\(0\)\s*=\s*0/);
  });

  it("detects the unsafe factorization, and accepts the safe one", () => {
    // Proves the check bites rather than trivially passing.
    expect(DIVIDES_BY_INCREMENT.test("splits into [E_f(k(h))/k(h)]\\cdot[k(h)/h]")).toBe(true);
    expect(DIVIDES_BY_INCREMENT.test("\\frac{E_f(k(h))}{k(h)}")).toBe(true);
    expect(DIVIDES_BY_INCREMENT.test("the product \\varepsilon_f(k(h))\\cdot k(h)/h")).toBe(false);
    // The abstract limit condition stays legal.
    expect(DIVIDES_BY_INCREMENT.test("E_f(k)/k \\to 0")).toBe(false);
  });
});

describe("chain-derive-fresh rubric rejects the unsafe factorization", () => {
  const exercise = (chainRuleLesson.exercises ?? []).find((e) => e.id === "chain-derive-fresh");
  const config = (exercise as { config?: Record<string, unknown> } | undefined)?.config;

  it("names the k(h) quotient as a failure, so a reviewer does not accept it", () => {
    // The rubric is the one place the unsafe form SHOULD appear — quoted as the
    // thing to reject. A reviewer scoring by the rubric must be told that a
    // response reaching the right answer this way has not met the bar.
    const rubric = config?.rubricText;
    expect(typeof rubric).toBe("string");
    expect(rubric as string).toMatch(/k\(h\)/);
    expect(rubric as string).toMatch(/FAILS|NOT a pass|does NOT/);
  });

  it("was version-bumped, so prior scored attempts are not silently re-read under new guidance", () => {
    expect(config?.rubricVersion).toBeGreaterThanOrEqual(2);
  });
});
