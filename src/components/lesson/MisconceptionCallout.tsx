import type { ReactNode } from "react";
import { ProseWithMath } from "./ProseWithMath";
import "./MisconceptionCallout.css";

/**
 * Flexible misconception confrontation — not a rigid DSL.
 * Authors compose belief / confront / resolve slots (or custom children)
 * depending on what the misconception needs: MC commitment, diagram,
 * counterexample, two-stage reveal, or no learner input.
 */
type MisconceptionCalloutProps = {
  title?: string;
  belief?: string;
  confront?: string;
  resolve?: string;
  /** Custom content when the three-slot pattern is not enough. */
  children?: ReactNode;
  visual?: ReactNode;
};

export function MisconceptionCallout({
  title = "Common trap",
  belief,
  confront,
  resolve,
  children,
  visual,
}: MisconceptionCalloutProps) {
  return (
    <aside
      className="misconception-callout"
      aria-label={title}
      data-testid="misconception-callout"
    >
      <h3 className="misconception-callout__title" aria-label={title}>
        <ProseWithMath text={title} />
      </h3>
      <div className="misconception-callout__body">
        <div className="misconception-callout__prose">
          {belief && (
            <p className="misconception-callout__belief">
              <span className="misconception-callout__label">Tempting belief.</span>{" "}
              <ProseWithMath text={belief} />
            </p>
          )}
          {confront && (
            <p className="misconception-callout__confront">
              <span className="misconception-callout__label">But watch.</span>{" "}
              <ProseWithMath text={confront} />
            </p>
          )}
          {resolve && (
            <p className="misconception-callout__resolve">
              <span className="misconception-callout__label">Repair.</span>{" "}
              <ProseWithMath text={resolve} />
            </p>
          )}
          {children}
        </div>
        {visual && (
          <div className="misconception-callout__visual">{visual}</div>
        )}
      </div>
    </aside>
  );
}
