import "./EquationBlock.css";

type EquationBlockProps = {
  /** KaTeX/TeX source. Rendered as monospace placeholder until KaTeX is wired in M3+. */
  tex: string;
  label?: string;
};

/**
 * Placeholder equation display for M1.
 * KaTeX rendering will replace the monospace fallback in a later milestone.
 */
export function EquationBlock({ tex, label }: EquationBlockProps) {
  return (
    <figure className="equation-block" aria-label={label ?? "Equation"}>
      {label && <figcaption className="equation-block__label">{label}</figcaption>}
      <pre className="equation-block__tex">
        <code>{tex}</code>
      </pre>
    </figure>
  );
}
