import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./EquationBlock.css";

type EquationBlockProps = {
  /**
   * Trusted, static lesson TeX. M4 never renders arbitrary user-provided TeX,
   * so `output: "htmlAndMathml"` (which emits accessible MathML) is safe here.
   */
  tex: string;
  /** Display (block) mode by default; set false for inline flow. */
  display?: boolean;
  label?: string;
  /** Optional plain-language description announced to assistive tech. */
  ariaLabel?: string;
};

type RenderResult = { html: string; ok: true } | { html: null; ok: false };

function renderTex(tex: string, display: boolean): RenderResult {
  try {
    const html = katex.renderToString(tex, {
      displayMode: display,
      throwOnError: true,
      strict: "ignore",
      output: "htmlAndMathml",
    });
    return { html, ok: true };
  } catch {
    return { html: null, ok: false };
  }
}

/**
 * Renders trusted lesson equations with KaTeX. Falls back to readable
 * monospace source if KaTeX throws, so a malformed expression never blanks
 * the lesson.
 */
export function EquationBlock({
  tex,
  display = true,
  label,
  ariaLabel,
}: EquationBlockProps) {
  const result = useMemo(() => renderTex(tex, display), [tex, display]);

  if (!display) {
    return result.ok ? (
      <span
        className="equation-inline"
        aria-label={ariaLabel}
        dangerouslySetInnerHTML={{ __html: result.html }}
      />
    ) : (
      <code className="equation-inline equation-inline--fallback">{tex}</code>
    );
  }

  return (
    <figure className="equation-block" aria-label={ariaLabel ?? label ?? "Equation"}>
      {label && <figcaption className="equation-block__label">{label}</figcaption>}
      {result.ok ? (
        <div
          className="equation-block__rendered"
          dangerouslySetInnerHTML={{ __html: result.html }}
        />
      ) : (
        <pre className="equation-block__tex" data-fallback="true">
          <code>{tex}</code>
        </pre>
      )}
    </figure>
  );
}
