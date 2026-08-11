import { describe, expect, it } from "vitest";
import {
  ExpressionError,
  equivalentByValue,
  evaluate,
  expressionsAgree,
  freeVariables,
  latexPreview,
  parseExpression,
  toLatex,
  tryParseExpression,
} from "../expression";

/**
 * The friendly expression language behind the practice-answer input. The bar
 * this suite holds is not "the parser works" but "a learner who types what
 * they mean gets what they meant, and a learner who types something ambiguous
 * SEES which reading they got".
 *
 * Every rendering test therefore asserts on the LaTeX, not on the AST: the
 * LaTeX is what the learner actually sees, and it is the only signal telling
 * them their `1/2x` was read as `(1/2)x`.
 */

const tex = (source: string): string => toLatex(parseExpression(source));

describe("what a learner would naturally type", () => {
  it("reads the motivating case, x^2 + 3x + 7", () => {
    expect(tex("x^2 + 3x + 7")).toBe("x^{2} + 3x + 7");
  });

  it("treats juxtaposition as multiplication, in every position", () => {
    expect(tex("3x")).toBe("3x");
    expect(tex("xy")).toBe("xy");
    expect(tex("2(x+1)")).toBe("2\\left(x + 1\\right)");
    expect(tex("(x+1)(x-1)")).toBe("\\left(x + 1\\right)\\left(x - 1\\right)");
    expect(tex("2x y")).toBe("2xy");
  });

  it("renders an explicit * as a centre dot, so the two inputs stay distinguishable on screen", () => {
    expect(tex("3*x")).toBe("3 \\cdot x");
    expect(tex("3x")).toBe("3x");
  });

  it("builds a real fraction from /", () => {
    expect(tex("(x+1)/2")).toBe("\\frac{x + 1}{2}");
    expect(tex("1/x")).toBe("\\frac{1}{x}");
  });

  it("accepts the typographic characters a learner may paste from a prompt", () => {
    expect(tex("3×x")).toBe("3 \\cdot x");
    expect(tex("6÷2")).toBe("\\frac{6}{2}");
    expect(tex("x−1")).toBe("x - 1");
  });

  it("accepts square and curly brackets as ordinary grouping", () => {
    expect(tex("2[x+1]")).toBe("2\\left(x + 1\\right)");
  });

  it("reads named functions, constants and subscripts", () => {
    expect(tex("sin(x)")).toBe("\\sin\\left(x\\right)");
    expect(tex("sqrt(x+1)")).toBe("\\sqrt{x + 1}");
    expect(tex("abs(x)")).toBe("\\left|x\\right|");
    expect(tex("exp(2x)")).toBe("e^{2x}");
    expect(tex("ln(x)")).toBe("\\ln\\left(x\\right)");
    expect(tex("arctan(x)")).toBe("\\arctan\\left(x\\right)");
    expect(tex("atan(x)")).toBe("\\arctan\\left(x\\right)");
    expect(tex("2pi")).toBe("2\\pi");
    expect(tex("theta")).toBe("\\theta");
    expect(tex("x_1 + x_2")).toBe("x_{1} + x_{2}");
  });

  it("multiplies a coefficient into a function call", () => {
    expect(tex("2sin(x)")).toBe("2\\sin\\left(x\\right)");
    expect(tex("sin(x)cos(x)")).toBe("\\sin\\left(x\\right)\\cos\\left(x\\right)");
  });
});

describe("precedence — the readings a learner is entitled to expect", () => {
  it("^ binds tighter than unary minus: -x^2 is -(x^2), not (-x)^2", () => {
    expect(tex("-x^2")).toBe("-x^{2}");
    expect(evaluate(parseExpression("-x^2"), { x: 3 })).toBe(-9);
    expect(evaluate(parseExpression("(-x)^2"), { x: 3 })).toBe(9);
  });

  it("groups a non-atomic base under a power", () => {
    expect(tex("(x+1)^2")).toBe("\\left(x + 1\\right)^{2}");
    expect(tex("(-3)^2")).toBe("\\left(-3\\right)^{2}");
  });

  it("makes ^ right-associative, matching ordinary notation", () => {
    expect(evaluate(parseExpression("2^3^2"), {})).toBe(512); // 2^(3^2), not (2^3)^2 = 64
  });

  it("accepts a negative exponent without parentheses", () => {
    expect(evaluate(parseExpression("x^-1"), { x: 4 })).toBe(0.25);
  });

  it("keeps subtraction non-associative when rendering", () => {
    // `a - (b - c)` must not lose its parentheses and become `a - b - c`.
    expect(tex("a-(b-c)")).toBe("a - \\left(b - c\\right)");
    expect(tex("a-b-c")).toBe("a - b - c");
    expect(evaluate(parseExpression("a-(b-c)"), { a: 10, b: 5, c: 2 })).toBe(7);
    expect(evaluate(parseExpression("a-b-c"), { a: 10, b: 5, c: 2 })).toBe(3);
  });

  it("does not read `x - 1` as a product — a leading minus never starts a new factor", () => {
    expect(evaluate(parseExpression("x - 1"), { x: 5 })).toBe(4);
  });

  it("SHOWS which reading an ambiguous input got, rather than guessing silently", () => {
    // `1/2x` is genuinely ambiguous in infix notation. The commitment is
    // ordinary left-to-right, and the rendered fraction is what tells the
    // learner so — this test exists to pin the visible signal, not the
    // convention.
    expect(tex("1/2x")).toBe("\\frac{1}{2}x");
    expect(evaluate(parseExpression("1/2x"), { x: 4 })).toBe(2);
    expect(tex("1/(2x)")).toBe("\\frac{1}{2x}");
    expect(evaluate(parseExpression("1/(2x)"), { x: 4 })).toBe(0.125);
  });
});

describe("errors a learner can act on", () => {
  const failure = (source: string): string => {
    const outcome = tryParseExpression(source);
    expect(outcome.ok, `"${source}" should not parse`).toBe(false);
    return outcome.ok ? "" : outcome.message;
  };

  it("names an unclosed parenthesis", () => {
    expect(failure("2(x+1")).toMatch(/never closed/i);
  });

  it("names a stray closing parenthesis", () => {
    expect(failure("x+1)")).toMatch(/nothing to close/i);
  });

  it("names a dangling operator", () => {
    expect(failure("x +")).toMatch(/stops in the middle|missing/i);
    expect(failure("* x")).toMatch(/both sides/i);
  });

  it("refuses a bare function name instead of silently multiplying its letters", () => {
    // `sinx` lexed letter-by-letter would render as "sinx" — visually
    // identical to the function application meant, so the misreading would be
    // invisible. It must be an error the learner can see and fix.
    expect(failure("sinx")).toMatch(/sin\(x\)/);
    expect(failure("sin")).toMatch(/sin\(x\)/);
  });

  it("rejects an unknown character", () => {
    expect(failure("x @ 2")).toMatch(/don't recognize/i);
  });

  it("treats an empty or blank input as a failure, never as a valid answer", () => {
    // Blank-as-something is the recurring grading defect this repo guards
    // against; it has to fail at the parse layer so no caller can inherit it.
    expect(failure("")).toMatch(/type an expression|Nothing to read/i);
    expect(failure("   ")).toMatch(/type an expression|Nothing to read/i);
  });

  it("throws ExpressionError with a position from the throwing entry point", () => {
    try {
      parseExpression("x @ 2");
      throw new Error("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ExpressionError);
      expect((error as ExpressionError).at).toBe(2);
    }
  });

  it("latexPreview reports the failure rather than throwing", () => {
    const bad = latexPreview("2(x+1");
    expect(bad.ok).toBe(false);
    const good = latexPreview("2(x+1)");
    expect(good.ok).toBe(true);
    expect(good.latex).toBe("2\\left(x + 1\\right)");
  });
});

describe("the injection surface — why the rendered preview is safe to trust", () => {
  /**
   * `MathExpressionInput` hands `toLatex`'s output to KaTeX and inserts the
   * result with `dangerouslySetInnerHTML`, which is only defensible if no
   * learner keystroke can reach the renderer as TeX. Two things make that
   * true, and both are asserted here rather than asserted in a comment:
   *
   *  1. the tokenizer's character allowlist rejects everything outside
   *     `[A-Za-z0-9._]`, brackets, commas and the arithmetic operators, so
   *     `<`, `>`, `&`, `"` and `\` cannot even become tokens;
   *  2. `toLatex` emits from a closed set of node kinds, and the only
   *     source-derived text it can emit is an identifier name, which the
   *     tokenizer has already constrained to `[A-Za-z](_[A-Za-z0-9]+)?`.
   */
  const HOSTILE = [
    "<script>alert(1)</script>",
    "x</span><img src=x onerror=alert(1)>",
    "\\href{javascript:alert(1)}{x}",
    "\\url{javascript:alert(1)}",
    "x & y",
    'x"onmouseover="alert(1)',
    "\\includegraphics{x}",
    "${x}",
    "x\\\\y",
  ];

  it("refuses every hostile string at the tokenizer, before any AST exists", () => {
    for (const source of HOSTILE) {
      const outcome = tryParseExpression(source);
      expect(outcome.ok, `"${source}" must not parse`).toBe(false);
    }
  });

  it("never emits markup or a trust-gated TeX command, for any input that DOES parse", () => {
    // The complement of the test above: whatever a learner can successfully
    // type, the generated TeX stays inside a small, inert vocabulary.
    const ACCEPTED = [
      "x^2 + 3x + 7",
      "sqrt(x_12) + abs(y)",
      "sin(theta)cos(theta)/2",
      "exp(-x^2)",
      "alpha_9 + beta_3",
      "(a+b)(a-b)",
      "1/2x",
      "-x^-2",
    ];
    for (const source of ACCEPTED) {
      const latex = toLatex(parseExpression(source));
      expect(latex, source).not.toMatch(/[<>&]/);
      expect(latex, source).not.toMatch(/\\(href|url|includegraphics|def|newcommand|input)/);
      // Every backslash command emitted must come from the fixed vocabulary
      // `toLatex` can produce — nothing source-derived slips in as a command.
      const commands = [...latex.matchAll(/\\([a-zA-Z]+)/g)].map((m) => m[1]!);
      const ALLOWED = new Set([
        "left", "right", "frac", "sqrt", "cdot", "mathrm",
        "sin", "cos", "tan", "csc", "sec", "cot",
        "arcsin", "arccos", "arctan", "sinh", "cosh", "tanh",
        "ln", "log", "exp", "abs",
        "alpha", "beta", "gamma", "delta", "epsilon", "theta", "lambda",
        "mu", "sigma", "phi", "omega", "tau", "rho", "pi",
      ]);
      for (const command of commands) {
        expect(ALLOWED.has(command), `${source} emitted \\${command}`).toBe(true);
      }
    }
  });

  it("constrains identifier names to alphanumerics, the only source-derived text in the output", () => {
    // `\mathrm{...}` and `x_{...}` interpolate a name. If a name could carry a
    // brace or a backslash it would break out of the group; it cannot.
    for (const source of ["x_1", "theta", "alpha_12", "z"]) {
      const node = parseExpression(source);
      for (const name of freeVariables(node)) {
        expect(name, source).toMatch(/^[A-Za-z]+(_[A-Za-z0-9]+)?$/);
      }
    }
  });
});

describe("evaluation", () => {
  it("resolves built-in constants, and lets the environment override them", () => {
    expect(evaluate(parseExpression("pi"), {})).toBeCloseTo(Math.PI, 12);
    expect(evaluate(parseExpression("e"), {})).toBeCloseTo(Math.E, 12);
    expect(evaluate(parseExpression("e"), { e: 2 })).toBe(2);
  });

  it("does not mistake a variable bound to 0 for an unbound one", () => {
    expect(evaluate(parseExpression("x + 1"), { x: 0 })).toBe(1);
  });

  it("returns NaN outside the real domain rather than throwing", () => {
    expect(Number.isNaN(evaluate(parseExpression("sqrt(-1)"), {}))).toBe(true);
    expect(Number.isFinite(evaluate(parseExpression("ln(0)"), {}))).toBe(false);
    expect(Number.isFinite(evaluate(parseExpression("1/0"), {}))).toBe(false);
    expect(Number.isNaN(evaluate(parseExpression("y"), { x: 1 }))).toBe(true);
  });

  it("lists free variables, excluding built-in constants", () => {
    expect(freeVariables(parseExpression("a x + pi y"))).toEqual(["a", "x", "y"]);
    expect(freeVariables(parseExpression("2pi"))).toEqual([]);
  });
});

describe("equivalence by value", () => {
  it("accepts any expression that agrees as a function, whatever its form", () => {
    expect(expressionsAgree("x^2+3x+7", "7+3x+x^2").kind).toBe("equivalent");
    expect(expressionsAgree("(x+1)^2", "x^2+2x+1").kind).toBe("equivalent");
    expect(expressionsAgree("(x+1)(x+2)", "x^2+3x+2").kind).toBe("equivalent");
    expect(expressionsAgree("2(x+3)/2", "x+3").kind).toBe("equivalent");
  });

  it("rejects the near-misses a learner actually produces", () => {
    expect(expressionsAgree("x^2+3x+7", "x^2+3x+8").kind).toBe("different");
    expect(expressionsAgree("x^2+3x+7", "x^2+2x+7").kind).toBe("different");
    expect(expressionsAgree("(x+1)^2", "x^2+1").kind).toBe("different");
    expect(expressionsAgree("2x", "x^2").kind).toBe("different");
    expect(expressionsAgree("sin(x)", "cos(x)").kind).toBe("different");
  });

  it("carries the witness that produced a `different` verdict — that half is certain", () => {
    const result = expressionsAgree("x^2", "x^3");
    expect(result.kind).toBe("different");
    if (result.kind !== "different") return;
    const a = evaluate(parseExpression("x^2"), result.witness);
    const b = evaluate(parseExpression("x^3"), result.witness);
    expect(Math.abs(a - b)).toBeGreaterThan(1e-8);
  });

  it("compares constant expressions with no variables at all", () => {
    expect(expressionsAgree("2+2", "4").kind).toBe("equivalent");
    expect(expressionsAgree("2+2", "5").kind).toBe("different");
  });

  it("is deterministic — the same pair grades the same way every time", () => {
    for (let i = 0; i < 5; i += 1) {
      expect(expressionsAgree("(x+1)^2", "x^2+2x+1").kind).toBe("equivalent");
      expect(expressionsAgree("(x+1)^2", "x^2+2x+2").kind).toBe("different");
    }
  });

  it("does not let a variable outside the declared set pass as agreement", () => {
    // `y` is not the answer's variable; sampling only `x` would leave `y`
    // unbound (NaN), which must not read as "equivalent".
    const result = expressionsAgree("x^2", "y^2", { variables: ["x"] });
    expect(result.kind).not.toBe("equivalent");
  });

  it("reports `undecided` — never `equivalent` — when too few points are comparable", () => {
    // Disjoint real domains: sqrt(x-100) is undefined everywhere the sampler
    // looks, so nothing can be concluded. That is a third outcome, and a
    // caller must not read it as a pass.
    const result = expressionsAgree("sqrt(x-100)", "x");
    expect(result.kind).toBe("undecided");
  });

  it("surfaces a parse failure on either side as undecided, not as agreement", () => {
    expect(expressionsAgree("x^2", "x^").kind).toBe("undecided");
    expect(expressionsAgree("x^", "x^2").kind).toBe("undecided");
    expect(expressionsAgree("x^2", "").kind).toBe("undecided");
  });

  it("agrees on expressions that differ only where both are undefined", () => {
    // x/x and 1 differ only at x = 0, which the sampler never lands on.
    // Recording the real behaviour rather than pretending sampling is a proof.
    expect(equivalentByValue(parseExpression("x/x"), parseExpression("1")).kind).toBe(
      "equivalent",
    );
  });
});
