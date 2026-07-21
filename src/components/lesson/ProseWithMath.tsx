import type { ReactNode } from "react";
import { EquationBlock } from "./EquationBlock";

type ProseWithMathProps = {
  /** Trusted lesson prose. Inline math uses $...$ delimiters. */
  text: string;
  className?: string;
};

/**
 * Renders lesson prose with optional inline KaTeX ($...$) and lightweight
 * markdown emphasis (`**bold**` → `<strong>`, `*italic*` → `<em>`). Inline math
 * is extracted first, so `*` inside `$...$` is treated as math, not emphasis.
 * Only trusted static lesson strings are accepted.
 */
export function ProseWithMath({ text, className }: ProseWithMathProps) {
  const parts = splitMath(text);
  return (
    <span className={className}>
      {parts.map((part, index) => {
        switch (part.type) {
          case "math":
            return <EquationBlock key={index} tex={part.value} display={false} />;
          case "bold":
            return <strong key={index}>{part.value}</strong>;
          case "italic":
            return <em key={index}>{part.value}</em>;
          default:
            return <span key={index}>{part.value}</span>;
        }
      })}
    </span>
  );
}

type Part = { type: "text" | "math" | "bold" | "italic"; value: string };

/** Split off inline `$...$` math (highest priority), emphasis inside the rest. */
function splitMath(text: string): Part[] {
  const parts: Part[] = [];
  const pattern = /\$([^$]+)\$/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(...splitEmphasis(text.slice(last, match.index)));
    }
    parts.push({ type: "math", value: match[1]! });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push(...splitEmphasis(text.slice(last)));
  }
  return parts.length > 0 ? parts : [{ type: "text", value: text }];
}

/** Split a non-math text run into text / bold / italic parts. */
function splitEmphasis(text: string): Part[] {
  const parts: Part[] = [];
  // `**bold**` alternative first so the double marker wins over `*italic*`.
  const pattern = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: "text", value: text.slice(last, match.index) });
    }
    if (match[1] !== undefined) {
      parts.push({ type: "bold", value: match[1] });
    } else {
      parts.push({ type: "italic", value: match[2]! });
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push({ type: "text", value: text.slice(last) });
  }
  return parts;
}

/** Compact KaTeX matrix for readouts (trusted static numbers only). */
export function MatrixTeX({
  a,
  b,
  c,
  d,
  name = "A",
}: {
  a: number;
  b: number;
  c: number;
  d: number;
  name?: string;
}): ReactNode {
  const f = (n: number) => {
    const r = Math.round(n * 100) / 100;
    return Object.is(r, -0) ? "0" : String(r);
  };
  return (
    <EquationBlock
      display={false}
      tex={`${name}=\\begin{bmatrix}${f(a)}&${f(b)}\\\\${f(c)}&${f(d)}\\end{bmatrix}`}
    />
  );
}

export function VectorTeX({
  x,
  y,
  name,
}: {
  x: number;
  y: number;
  name?: string;
}): ReactNode {
  const f = (n: number) => {
    const r = Math.round(n * 100) / 100;
    return Object.is(r, -0) ? "0" : String(r);
  };
  const body = `\\begin{bmatrix}${f(x)}\\\\${f(y)}\\end{bmatrix}`;
  return (
    <EquationBlock
      display={false}
      tex={name ? `\\mathbf{${name}}=${body}` : body}
    />
  );
}
