import { EquationBlock } from "./EquationBlock";
import "./EquationSequence.css";

type EquationSequenceProps = {
  /** Ordered KaTeX expressions — the calculation itself. */
  equations: readonly string[];
  /** Accessible label for the ordered-list region. */
  ariaLabel?: string;
  className?: string;
};

/**
 * A calculation rendered as a clean, scannable column of equations.
 *
 * No per-equation prose, labels, or active-step highlighting. Each line is
 * KaTeX (accessible MathML via EquationBlock). This is the default way to show
 * a worked computation: trust the sequence and the adjacent visual; add prose
 * elsewhere (a depth layer or callout) only when it earns its place.
 */
export function EquationSequence({
  equations,
  ariaLabel = "Worked calculation",
  className,
}: EquationSequenceProps) {
  if (equations.length === 0) return null;

  return (
    <ol
      className={`equation-sequence ${className ?? ""}`}
      aria-label={ariaLabel}
      data-testid="equation-sequence"
    >
      {equations.map((tex, index) => (
        <li className="equation-sequence__row" key={`${index}:${tex}`}>
          <EquationBlock tex={tex} />
        </li>
      ))}
    </ol>
  );
}
