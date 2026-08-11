/**
 * A friendly infix expression language: parse what a learner would naturally
 * type, render it as LaTeX, and evaluate it. No React, no KaTeX, no DOM.
 *
 * **The point of this module is that the learner never writes LaTeX.** They
 * type `x^2 + 3x + 7`; the parser turns that into an AST, and `toLatex`
 * turns the AST back into `x^{2} + 3x + 7` for display. The LaTeX is
 * therefore always GENERATED FROM A VALIDATED AST over a closed set of node
 * kinds — it is never a passthrough of learner text. That is what makes it
 * safe to hand to KaTeX (`EquationBlock`'s docstring notes that the renderer
 * is only ever given trusted TeX; this module is what makes learner-derived
 * TeX trusted, because no learner input can reach the renderer without first
 * having parsed into one of the node kinds below).
 *
 * **Showing the parse is a feature, not a debug aid.** Infix notation is
 * genuinely ambiguous — `1/2x` can be read as `(1/2)x` or `1/(2x)`, and no
 * choice of convention makes the other reading go away. Rather than guess at
 * intent or ban the input, this module commits to ordinary left-to-right
 * precedence and the UI renders the result, so the learner *sees* which
 * reading they got and can add parentheses. An input that silently picked the
 * other reading would be the actual hazard.
 *
 * **Grading is by VALUE, not by form** — see `equivalentByValue`. A capability
 * built on this module accepts any expression that agrees numerically, so
 * `x^2+3x+7`, `7+3x+x^2` and `(x+1)(x+2)+(x+5)` are all the same answer. That
 * makes it right for "what is the derivative" and wrong for "factor this" or
 * "write this in vertex form", where the FORM is the thing being assessed.
 * Do not use it for the latter without adding a form check — accepting the
 * question restated as its own answer is exactly the "incomplete-object
 * credit" defect class the grading conformance kit exists to stop.
 */

/* ----------------------------------------------------------------- tokens */

type TokenKind = "number" | "name" | "op" | "lparen" | "rparen" | "comma";

interface Token {
  readonly kind: TokenKind;
  readonly text: string;
  /** Index in the source string, for error messages that can point at the problem. */
  readonly at: number;
}

/**
 * Multi-letter words the tokenizer recognizes as ONE token. Everything else
 * that is alphabetic lexes as a single-letter variable, which is what makes
 * `xy` mean "x times y" while `sin` stays the sine function. Matched
 * longest-first, so `arcsin` wins over `a`, and `cosh` over `cos`.
 */
const FUNCTION_NAMES = [
  "arcsin", "arccos", "arctan",
  "asin", "acos", "atan",
  "sinh", "cosh", "tanh",
  "sin", "cos", "tan",
  "csc", "sec", "cot",
  "sqrt", "abs", "exp", "ln", "log",
] as const;

export type FunctionName = (typeof FUNCTION_NAMES)[number];

/** Words that render as a symbol but are otherwise ordinary identifiers. */
const SYMBOL_WORDS = [
  "alpha", "beta", "gamma", "delta", "epsilon", "theta", "lambda",
  "mu", "sigma", "phi", "omega", "tau", "rho", "pi",
] as const;

const LATEX_SYMBOLS: Record<string, string> = Object.fromEntries(
  SYMBOL_WORDS.map((word) => [word, `\\${word}`]),
);

/** Resolved by `evaluate` unless the caller's environment overrides them. */
export const BUILTIN_CONSTANTS: Readonly<Record<string, number>> = {
  pi: Math.PI,
  e: Math.E,
};

const FUNCTIONS_LONGEST_FIRST: readonly string[] = [...FUNCTION_NAMES].sort(
  (a, b) => b.length - a.length,
);
const SYMBOLS_LONGEST_FIRST: readonly string[] = [...SYMBOL_WORDS].sort(
  (a, b) => b.length - a.length,
);

const FUNCTION_SET = new Set<string>(FUNCTION_NAMES);

/**
 * The longest known word starting at `rest`, or `undefined` for an ordinary
 * single-letter variable.
 *
 * Function names win even when a letter follows them, symbol names do not, and
 * the asymmetry is deliberate. `sinx` lexed as `s·i·n·x` would render as
 * "sinx" — juxtaposition looks identical to the function application the
 * learner meant, so the misreading would be invisible. Lexing `sin` as the
 * function instead lets the parser say "sin needs something to act on — try
 * sin(x)", which is a wrong-input message rather than a silent wrong answer.
 * `pix` has no such trap (both readings render the same and mean a product),
 * so symbol words keep the safer letter-boundary rule.
 */
function matchWord(rest: string): { word: string; length: number } | undefined {
  // Function names match CASE-INSENSITIVELY (review finding: `Sin(x)` lexed
  // as S·i·n·(x) and rendered the italic concatenation "Sinx" — visually
  // near-identical to the sine application meant, the exact invisible
  // misreading this table exists to prevent). The canonical lowercase name
  // is what enters the token stream. Symbol words stay case-sensitive: they
  // have no call-shape to disambiguate them, and `Pi` as P·i is at least
  // visibly two letters in the preview.
  const lower = rest.toLowerCase();
  const fn = FUNCTIONS_LONGEST_FIRST.find((w) => lower.startsWith(w));
  if (fn) return { word: fn, length: fn.length };
  const sym = SYMBOLS_LONGEST_FIRST.find(
    (w) => rest.startsWith(w) && !isLetter(rest[w.length] ?? ""),
  );
  return sym ? { word: sym, length: sym.length } : undefined;
}

export class ExpressionError extends Error {
  /** Index in the source string the problem was found at, where known. */
  readonly at: number | undefined;
  constructor(message: string, at?: number) {
    super(message);
    this.name = "ExpressionError";
    this.at = at;
  }
}

function isDigit(c: string): boolean {
  return c >= "0" && c <= "9";
}

function isLetter(c: string): boolean {
  return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
}

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < source.length) {
    const c = source[i]!;
    if (c === " " || c === "\t" || c === "\n" || c === "\r") {
      i += 1;
      continue;
    }
    if (isDigit(c) || (c === "." && isDigit(source[i + 1] ?? ""))) {
      const start = i;
      while (i < source.length && isDigit(source[i]!)) i += 1;
      if (source[i] === ".") {
        i += 1;
        while (i < source.length && isDigit(source[i]!)) i += 1;
      }
      tokens.push({ kind: "number", text: source.slice(start, i), at: start });
      continue;
    }
    if (isLetter(c)) {
      const start = i;
      const rest = source.slice(i);
      const match = matchWord(rest);
      let text: string | undefined;
      if (match) {
        i += match.length;
        text = match.word; // canonical (lowercase for functions)
      } else {
        i += 1;
      }
      // An optional subscript binds to the name it follows: `x_1`, `x_12`,
      // `a_n`. The subscript is a DIGIT RUN or a SINGLE letter — not a full
      // alphanumeric run, which swallowed a following variable (review
      // finding: `x_1y`, a learner meaning x₁·y, lexed as one identifier
      // `x_1y` and evaluated as a single unbound variable).
      if (source[i] === "_") {
        let j = i + 1;
        if (j < source.length && isDigit(source[j]!)) {
          while (j < source.length && isDigit(source[j]!)) j += 1;
          i = j;
        } else if (j < source.length && isLetter(source[j]!)) {
          i = j + 1;
        }
      }
      const raw = source.slice(start, i);
      tokens.push({
        kind: "name",
        text: text !== undefined && raw.toLowerCase().startsWith(text) ? text + raw.slice(text.length) : raw,
        at: start,
      });
      continue;
    }
    if (c === "(" || c === "[" || c === "{") {
      tokens.push({ kind: "lparen", text: "(", at: i });
      i += 1;
      continue;
    }
    if (c === ")" || c === "]" || c === "}") {
      tokens.push({ kind: "rparen", text: ")", at: i });
      i += 1;
      continue;
    }
    if (c === "+" || c === "-" || c === "*" || c === "/" || c === "^") {
      tokens.push({ kind: "op", text: c, at: i });
      i += 1;
      continue;
    }
    // Characters a learner plausibly types that we cannot accept — refuse
    // with the fix, not just the refusal (review finding: the palette's own
    // power key is LABELLED "x²", so the bare "I don't recognize ²" message
    // was teaching the exact glyph the tokenizer rejects).
    if (c === "=") {
      throw new ExpressionError(
        'Enter just the expression itself — no "=" (type the right-hand side only).',
        i,
      );
    }
    if (c === "²" || c === "³") {
      throw new ExpressionError(
        `Type ^${c === "²" ? "2" : "3"} for powers — e.g. x^${c === "²" ? "2" : "3"}.`,
        i,
      );
    }
    if (c === ",") {
      // Reached only when a comma cannot be an argument separator; the most
      // common cause is a decimal-comma habit.
      throw new ExpressionError(
        'Use a decimal point, not a comma (2.5, not 2,5).',
        i,
      );
    }
    // Typographic characters a learner may paste from a prompt.
    if (c === "×" || c === "⋅") {
      tokens.push({ kind: "op", text: "*", at: i });
      i += 1;
      continue;
    }
    if (c === "÷") {
      tokens.push({ kind: "op", text: "/", at: i });
      i += 1;
      continue;
    }
    if (c === "−") {
      tokens.push({ kind: "op", text: "-", at: i });
      i += 1;
      continue;
    }
    throw new ExpressionError(`I don't recognize the character "${c}".`, i);
  }
  return tokens;
}

/* -------------------------------------------------------------------- AST */

export type ExprNode =
  | { readonly kind: "number"; readonly value: number }
  | { readonly kind: "identifier"; readonly name: string }
  | { readonly kind: "unary"; readonly op: "-"; readonly operand: ExprNode }
  | {
      readonly kind: "binary";
      readonly op: "+" | "-" | "*" | "/" | "^";
      readonly left: ExprNode;
      readonly right: ExprNode;
      /**
       * True when the learner wrote `3x` rather than `3*x`. Kept because it
       * changes the RENDERING (juxtaposition vs `\cdot`) and therefore whether
       * the preview looks like what they typed — never the value.
       */
      readonly implicit?: boolean;
    }
  | { readonly kind: "call"; readonly name: FunctionName; readonly arg: ExprNode };

/* ----------------------------------------------------------------- parser */

/**
 * Nesting bound for the recursive-descent parser. Without one, ~2000 nested
 * parentheses overflowed the JS stack as a RangeError that escaped
 * `tryParseExpression` (which converts only ExpressionError) and crashed the
 * live preview — a review finding against the function's own "must not
 * crash" contract. 64 is far beyond any human expression and far below any
 * engine's stack limit.
 */
const MAX_DEPTH = 64;

class Parser {
  private pos = 0;
  private depth = 0;
  // Written out rather than declared as constructor parameter properties:
  // this project compiles with `erasableSyntaxOnly`, which rejects that
  // TypeScript-only shorthand.
  private readonly tokens: readonly Token[];
  private readonly source: string;

  constructor(tokens: readonly Token[], source: string) {
    this.tokens = tokens;
    this.source = source;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private eat(): Token {
    const token = this.tokens[this.pos];
    if (!token) throw new ExpressionError("The expression ends too early.", this.source.length);
    this.pos += 1;
    return token;
  }

  parse(): ExprNode {
    if (this.tokens.length === 0) {
      throw new ExpressionError("Nothing to read yet — type an expression.");
    }
    const node = this.parseSum();
    const extra = this.peek();
    if (extra) {
      throw new ExpressionError(
        extra.kind === "rparen"
          ? "There's a closing parenthesis with nothing to close."
          : `I got stuck at "${extra.text}".`,
        extra.at,
      );
    }
    return node;
  }

  private enter(): void {
    this.depth += 1;
    if (this.depth > MAX_DEPTH) {
      throw new ExpressionError("This expression is nested too deeply to read.", this.pos);
    }
  }

  private exit(): void {
    this.depth -= 1;
  }

  private parseSum(): ExprNode {
    this.enter();
    try {
      return this.parseSumInner();
    } finally {
      this.exit();
    }
  }

  private parseSumInner(): ExprNode {
    let left = this.parseProduct();
    for (;;) {
      const token = this.peek();
      if (token?.kind === "op" && (token.text === "+" || token.text === "-")) {
        this.eat();
        const right = this.parseProduct();
        left = { kind: "binary", op: token.text, left, right };
        continue;
      }
      return left;
    }
  }

  /** `*`, `/`, and juxtaposition, all at one precedence, left-associative. */
  private parseProduct(): ExprNode {
    let left = this.parseUnary();
    for (;;) {
      const token = this.peek();
      if (token?.kind === "op" && (token.text === "*" || token.text === "/")) {
        this.eat();
        const right = this.parseUnary();
        left = { kind: "binary", op: token.text, left, right };
        continue;
      }
      if (this.startsFactor(token)) {
        const right = this.parseUnary();
        left = { kind: "binary", op: "*", left, right, implicit: true };
        continue;
      }
      return left;
    }
  }

  /**
   * Whether `token` could begin a new factor, i.e. whether juxtaposition here
   * means multiplication. A leading `-` deliberately does NOT qualify: `x - 1`
   * is a subtraction, and reading it as `x * (-1)` would silently change the
   * expression.
   */
  private startsFactor(token: Token | undefined): boolean {
    if (!token) return false;
    return token.kind === "number" || token.kind === "name" || token.kind === "lparen";
  }

  private parseUnary(): ExprNode {
    const token = this.peek();
    if (token?.kind === "op" && token.text === "-") {
      this.eat();
      return { kind: "unary", op: "-", operand: this.parseUnary() };
    }
    if (token?.kind === "op" && token.text === "+") {
      this.eat();
      return this.parseUnary();
    }
    return this.parsePower();
  }

  /** Right-associative, and binding tighter than unary minus: `-x^2` is `-(x^2)`. */
  private parsePower(): ExprNode {
    const base = this.parseAtom();
    const token = this.peek();
    if (token?.kind === "op" && token.text === "^") {
      this.eat();
      return { kind: "binary", op: "^", left: base, right: this.parseUnary() };
    }
    return base;
  }

  private parseAtom(): ExprNode {
    const token = this.peek();
    if (!token) {
      throw new ExpressionError(
        "The expression stops in the middle — something is missing at the end.",
        this.source.length,
      );
    }
    if (token.kind === "number") {
      this.eat();
      return { kind: "number", value: Number(token.text) };
    }
    if (token.kind === "lparen") {
      this.eat();
      const inner = this.parseSum();
      const close = this.peek();
      if (close?.kind !== "rparen") {
        throw new ExpressionError("A parenthesis is opened but never closed.", token.at);
      }
      this.eat();
      return inner;
    }
    if (token.kind === "name") {
      this.eat();
      if (FUNCTION_SET.has(token.text)) {
        const open = this.peek();
        if (open?.kind !== "lparen") {
          throw new ExpressionError(
            `"${token.text}" needs something to act on — try ${token.text}(x).`,
            token.at,
          );
        }
        this.eat();
        const arg = this.parseSum();
        const close = this.peek();
        if (close?.kind !== "rparen") {
          throw new ExpressionError(`"${token.text}(" is never closed.`, token.at);
        }
        this.eat();
        return { kind: "call", name: token.text as FunctionName, arg };
      }
      return { kind: "identifier", name: token.text };
    }
    if (token.kind === "op") {
      throw new ExpressionError(
        `"${token.text}" needs something on both sides of it.`,
        token.at,
      );
    }
    throw new ExpressionError(`I got stuck at "${token.text}".`, token.at);
  }
}

/** Parses learner-typed infix text. Throws `ExpressionError` with a plain-language message. */
export function parseExpression(source: string): ExprNode {
  return new Parser(tokenize(source), source).parse();
}

/** `parseExpression` as a result rather than a throw, for render paths that must not crash. */
export type ParseOutcome =
  | { readonly ok: true; readonly node: ExprNode }
  | { readonly ok: false; readonly message: string; readonly at: number | undefined };

export function tryParseExpression(source: string): ParseOutcome {
  try {
    return { ok: true, node: parseExpression(source) };
  } catch (error) {
    if (error instanceof ExpressionError) {
      return { ok: false, message: error.message, at: error.at };
    }
    throw error;
  }
}

/* ------------------------------------------------------------------ LaTeX */

const PRECEDENCE: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 4 };
const UNARY_PRECEDENCE = 3;

function nodePrecedence(node: ExprNode): number {
  switch (node.kind) {
    case "binary":
      // A rendered fraction carries its own grouping, so it never needs parens.
      return node.op === "/" ? 10 : PRECEDENCE[node.op]!;
    case "unary":
      return UNARY_PRECEDENCE;
    default:
      return 10;
  }
}

function wrap(tex: string): string {
  return `\\left(${tex}\\right)`;
}

/**
 * How a number literal renders. `String(v)` switches to JS exponential
 * notation below 1e-6 / at 1e21, and the resulting TeX "1e-7" is, in this
 * module's own grammar, the expression 1·e − 7 ≈ −4.28 — a preview that
 * silently means something else (review finding). Exotic magnitudes render
 * as an explicit power of ten instead.
 */
function numberToLatex(value: number): string {
  const plain = String(value);
  if (!plain.includes("e")) return plain;
  const [mantissa, exponent] = plain.split("e") as [string, string];
  const exp = exponent.startsWith("+") ? exponent.slice(1) : exponent;
  return `${mantissa} \\times 10^{${exp}}`;
}

/**
 * Whether an implicit product may render as bare juxtaposition with this
 * RIGHT operand, or needs an explicit mark. Review findings, all with the
 * preview silently reading as a different value than the parse:
 *   `2(3)` rendered "23" (reads twenty-three; value 6);
 *   `2 1/2` rendered "2½"-style (reads two-and-a-half; value 1);
 *   `2(-3)` rendered "2-3" (reads a subtraction; value −6).
 * Rules: a number on the right always gets a \cdot; a unary minus on the
 * right always gets parentheses; a fraction to the RIGHT of a number gets a
 * \cdot (the mixed-number misreading). Identifiers, calls, and anything the
 * precedence rules already wrap stay juxtaposed — `3x`, `2\sin(x)`,
 * `2(x+1)` are the readable cases juxtaposition exists for.
 */
function implicitRightMark(left: ExprNode, right: ExprNode): "juxtapose" | "cdot" | "parens" {
  if (right.kind === "number") return "cdot";
  if (right.kind === "unary") return "parens";
  if (right.kind === "binary" && right.op === "/" && left.kind === "number") return "cdot";
  return "juxtapose";
}

function identifierToLatex(name: string): string {
  const [base, subscript] = name.split("_", 2);
  const head = LATEX_SYMBOLS[base ?? ""] ?? (base!.length > 1 ? `\\mathrm{${base}}` : base!);
  return subscript ? `${head}_{${subscript}}` : head;
}

const FUNCTION_LATEX: Partial<Record<FunctionName, string>> = {
  asin: "\\arcsin",
  acos: "\\arccos",
  atan: "\\arctan",
};

/**
 * Renders an AST as LaTeX. Parenthesizes from the tree's own shape, so the
 * output always reproduces the parse — the learner sees the grouping they
 * actually got, not the grouping their keystrokes suggested.
 */
export function toLatex(node: ExprNode): string {
  switch (node.kind) {
    case "number":
      return numberToLatex(node.value);
    case "identifier":
      return identifierToLatex(node.name);
    case "unary": {
      const inner = toLatex(node.operand);
      // `-` binds looser than `*`, so `-(a+b)` needs parens but `-ab` does not.
      return `-${nodePrecedence(node.operand) < UNARY_PRECEDENCE ? wrap(inner) : inner}`;
    }
    case "call": {
      const name = FUNCTION_LATEX[node.name] ?? `\\${node.name}`;
      const inner = toLatex(node.arg);
      if (node.name === "sqrt") return `\\sqrt{${inner}}`;
      if (node.name === "abs") return `\\left|${inner}\\right|`;
      if (node.name === "exp") return `e^{${inner}}`;
      return `${name}${wrap(inner)}`;
    }
    case "binary": {
      if (node.op === "/") {
        return `\\frac{${toLatex(node.left)}}{${toLatex(node.right)}}`;
      }
      const own = PRECEDENCE[node.op]!;
      const left = toLatex(node.left);
      const right = toLatex(node.right);
      if (node.op === "^") {
        // The base must be grouped unless it is already atomic — `(x+1)^2`,
        // and `(-x)^2`, which is NOT the same as `-x^2`. An `exp` call is a
        // special case: it RENDERS as e^{…}, so an unwrapped `exp(x)^2`
        // emitted the illegal double superscript e^{x}^{2} and KaTeX threw,
        // blanking the preview of a perfectly valid input (review finding).
        const baseIsExp = node.left.kind === "call" && node.left.name === "exp";
        const base = nodePrecedence(node.left) < 10 || baseIsExp ? wrap(left) : left;
        return `${base}^{${right}}`;
      }
      const leftTex = nodePrecedence(node.left) < own ? wrap(left) : left;
      // The right operand needs grouping when it binds looser, and also at
      // EQUAL precedence under subtraction, which is not associative:
      // `a - (b - c)` must keep its parentheses or it silently becomes
      // `a - b - c`. Addition and multiplication are associative, so equal
      // precedence there needs nothing.
      const rightNeedsWrap =
        nodePrecedence(node.right) < own ||
        (nodePrecedence(node.right) === own && node.op === "-");
      const rightTex = rightNeedsWrap ? wrap(right) : right;
      if (node.op === "*") {
        if (!node.implicit) return `${leftTex} \\cdot ${rightTex}`;
        const mark = implicitRightMark(node.left, node.right);
        if (mark === "cdot") return `${leftTex} \\cdot ${rightTex}`;
        if (mark === "parens") return `${leftTex}${wrap(rightTex)}`;
        return `${leftTex}${rightTex}`;
      }
      return `${leftTex} ${node.op} ${rightTex}`;
    }
  }
}

/** Convenience: parse and render, or return the parse error. */
export function latexPreview(source: string): ParseOutcome & { readonly latex?: string } {
  const outcome = tryParseExpression(source);
  if (!outcome.ok) return outcome;
  return { ...outcome, latex: toLatex(outcome.node) };
}

/* -------------------------------------------------------------- evaluation */

const FUNCTION_IMPL: Record<FunctionName, (x: number) => number> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  csc: (x) => 1 / Math.sin(x),
  sec: (x) => 1 / Math.cos(x),
  cot: (x) => 1 / Math.tan(x),
  sqrt: Math.sqrt,
  abs: Math.abs,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10,
};

/**
 * Numeric value under `env`. Returns `NaN` for anything outside the real
 * domain (`sqrt(-1)`, `ln(0)`, `1/0`) rather than throwing — `equivalentByValue`
 * treats those samples as "this point says nothing", which is the honest
 * reading, not an error.
 */
export function evaluate(node: ExprNode, env: Readonly<Record<string, number>>): number {
  switch (node.kind) {
    case "number":
      return node.value;
    case "identifier": {
      const value = env[node.name] ?? BUILTIN_CONSTANTS[node.name];
      return value === undefined ? NaN : value;
    }
    case "unary":
      return -evaluate(node.operand, env);
    case "call":
      return FUNCTION_IMPL[node.name](evaluate(node.arg, env));
    case "binary": {
      const a = evaluate(node.left, env);
      const b = evaluate(node.right, env);
      switch (node.op) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/": return a / b;
        case "^": return Math.pow(a, b);
      }
    }
  }
}

/** Every identifier in the tree that is not a built-in constant. */
export function freeVariables(node: ExprNode): string[] {
  const found = new Set<string>();
  const walk = (n: ExprNode): void => {
    switch (n.kind) {
      case "identifier":
        if (!(n.name in BUILTIN_CONSTANTS)) found.add(n.name);
        return;
      case "unary":
        walk(n.operand);
        return;
      case "call":
        walk(n.arg);
        return;
      case "binary":
        walk(n.left);
        walk(n.right);
        return;
      default:
        return;
    }
  };
  walk(node);
  return [...found].sort();
}

/* ------------------------------------------------------------ equivalence */

/**
 * A deterministic sample sequence. Deterministic on purpose: grading the same
 * answer twice must give the same verdict, and a test that passes on one run
 * and fails on the next would be worse than no test. The multiplier and
 * modulus are an ordinary LCG; the only property needed is that the points do
 * not land on small integers or repeat across variables.
 */
function samplePoints(count: number, seed: number): number[] {
  // THREE bands, interleaved: near-zero, a core band, and a wide band out to
  // ±9. A single [-2.5, 2.5] band was a proven soundness hole (review
  // finding): `abs(x+3) - 3` — expressible in this grammar, differing from
  // `x` everywhere below −3 — graded as EQUIVALENT to `x` because no sample
  // ever left the window; a near-zero bump built from abs() slipped through
  // the old ±0.35 exclusion zone the same way. Wide-band points also make
  // the domain-mismatch check below meaningful for sqrt/ln answers.
  const out: number[] = [];
  let state = seed >>> 0;
  for (let i = 0; i < count; i += 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const unit = state / 0x100000000; // (0, 1)
    const centered = unit - 0.5;
    const band = i % 3;
    let value: number;
    if (band === 0) {
      value = centered * 0.6; // near zero: (−0.3, 0.3)
    } else if (band === 1) {
      value = centered * 5; // core: (−2.5, 2.5)
    } else {
      value = centered * 18; // wide: (−9, 9)
    }
    // Never exactly zero — poles at 0 are common and a 0-sample says little.
    out.push(value === 0 ? 0.1234 : value);
  }
  return out;
}

export interface EquivalenceOptions {
  /** Variables the expressions may use. A learner variable outside this set is a mismatch, not a sample. */
  readonly variables?: readonly string[];
  // NOTE on tolerance: agreement is relative with a floor of 1 (an absolute
  // ~1e-8 near the origin), so an answer differing by a term smaller than
  // that everywhere sampled is accepted — standard numeric-grader behavior,
  // recorded here deliberately rather than discovered later.

  /** Number of sample points to try. */
  readonly samples?: number;
  /** Minimum number of points where BOTH sides are finite, below which no verdict is claimed. */
  readonly minComparablePoints?: number;
  /** Relative agreement tolerance. */
  readonly tolerance?: number;
}

export type EquivalenceResult =
  | { readonly kind: "equivalent"; readonly comparedAt: number }
  | { readonly kind: "different"; readonly comparedAt: number; readonly witness: Readonly<Record<string, number>> }
  | { readonly kind: "undecided"; readonly comparedAt: number; readonly reason: string };

/** Points where exactly one side evaluates finitely before "equivalent" becomes suspect. */
const DOMAIN_MISMATCH_LIMIT = 8;

/**
 * Whether two expressions agree as FUNCTIONS, decided by sampling.
 *
 * Sampling is the honest mechanism here and its limits are stated rather than
 * hidden (the same discipline `denseScanExtremes` follows in
 * `optimization.ts`): agreement at every sampled point is overwhelming
 * evidence of equality but is not a proof, and disagreement at one point IS a
 * proof of difference. The asymmetry is why a `different` verdict carries the
 * witness that produced it — that one is certain.
 *
 * `undecided` is a real third outcome, not a disguised pass: it means too few
 * points had both sides defined (two expressions on disjoint domains, say) to
 * say anything. A caller must never treat it as equivalence.
 */
export function equivalentByValue(
  a: ExprNode,
  b: ExprNode,
  options: EquivalenceOptions = {},
): EquivalenceResult {
  const declared = options.variables;
  const variables = declared
    ? [...declared]
    : [...new Set([...freeVariables(a), ...freeVariables(b)])].sort();
  // The documented contract: a variable outside the declared set is a
  // MISMATCH, not a sample. (Review finding: the doc promised this while the
  // implementation let the stray variable evaluate to NaN at every point and
  // fall through to an "only 0 sample point(s)" undecided — a wrong-variable
  // answer misdiagnosed as a domain problem.)
  if (declared) {
    const declaredSet = new Set(declared);
    const stray = [...new Set([...freeVariables(a), ...freeVariables(b)])]
      .filter((name) => !declaredSet.has(name))
      .sort();
    if (stray.length > 0) {
      return {
        kind: "undecided",
        comparedAt: 0,
        reason: `uses variable(s) outside the declared set: ${stray.join(", ")}`,
      };
    }
  }
  const sampleCount = options.samples ?? 48;
  const minComparable = options.minComparablePoints ?? 6;
  const tolerance = options.tolerance ?? 1e-8;

  if (variables.length === 0) {
    const va = evaluate(a, {});
    const vb = evaluate(b, {});
    if (!Number.isFinite(va) || !Number.isFinite(vb)) {
      return { kind: "undecided", comparedAt: 0, reason: "neither side evaluates to a real number" };
    }
    return Math.abs(va - vb) <= tolerance * Math.max(1, Math.abs(va), Math.abs(vb))
      ? { kind: "equivalent", comparedAt: 1 }
      : { kind: "different", comparedAt: 1, witness: {} };
  }

  const columns = new Map<string, number[]>();
  variables.forEach((name, index) => {
    columns.set(name, samplePoints(sampleCount, 7919 + index * 104729));
  });

  let compared = 0;
  let oneSided = 0;
  for (let i = 0; i < sampleCount; i += 1) {
    const env: Record<string, number> = {};
    for (const name of variables) env[name] = columns.get(name)![i]!;
    const va = evaluate(a, env);
    const vb = evaluate(b, env);
    const aDefined = Number.isFinite(va);
    const bDefined = Number.isFinite(vb);
    if (aDefined !== bDefined) oneSided += 1;
    if (!aDefined || !bDefined) continue;
    compared += 1;
    const scale = Math.max(1, Math.abs(va), Math.abs(vb));
    if (Math.abs(va - vb) > tolerance * scale) {
      return { kind: "different", comparedAt: compared, witness: { ...env } };
    }
  }

  if (compared < minComparable) {
    return {
      kind: "undecided",
      comparedAt: compared,
      reason: `only ${compared} sample point(s) had both sides defined`,
    };
  }
  // Agreement everywhere both sides exist, but one side is REPEATEDLY defined
  // where the other is not: the two are not the same function, they merely
  // coincide on the smaller domain (review finding: `sqrt(x)·sqrt(x)` graded
  // equivalent to `x`). Not claimed "different" either — no numeric witness
  // exists — so this is undecided, which graders already treat as not-correct.
  if (oneSided >= DOMAIN_MISMATCH_LIMIT) {
    return {
      kind: "undecided",
      comparedAt: compared,
      reason: `the two expressions are defined on visibly different sets (${oneSided} one-sided points)`,
    };
  }
  return { kind: "equivalent", comparedAt: compared };
}

/** Parse both sides and compare by value. Parse failures surface as `undecided`. */
export function expressionsAgree(
  a: string,
  b: string,
  options: EquivalenceOptions = {},
): EquivalenceResult {
  const left = tryParseExpression(a);
  const right = tryParseExpression(b);
  if (!left.ok) return { kind: "undecided", comparedAt: 0, reason: left.message };
  if (!right.ok) return { kind: "undecided", comparedAt: 0, reason: right.message };
  return equivalentByValue(left.node, right.node, options);
}
