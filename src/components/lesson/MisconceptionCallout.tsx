import type { ReactNode } from "react";
import { ProseWithMath } from "./ProseWithMath";
import "./MisconceptionCallout.css";

/**
 * Flexible misconception confrontation — not a rigid DSL.
 * Authors compose belief / confront / resolve slots (or custom children)
 * depending on what the misconception needs: MC commitment, diagram,
 * counterexample, two-stage reveal, or no learner input.
 *
 * The same belief/confront/resolve shape doubles as a historical
 * belief-and-break (a field's plausible belief, what broke it, what replaced
 * it) — `attribution` names who/when/source for that use (vision.md §0
 * principle 10; the design test is Karatsuba's O(n²)-was-optimal belief).
 */
type MisconceptionCalloutProps = {
  title?: string;
  belief?: string;
  confront?: string;
  resolve?: string;
  attribution?: { who?: string; when?: string; source?: string };
  /** Custom content when the three-slot pattern is not enough. */
  children?: ReactNode;
  visual?: ReactNode;
};

function formatAttribution(attribution: {
  who?: string;
  when?: string;
  source?: string;
}): string {
  const parts = [attribution.who, attribution.when].filter(Boolean);
  const whoWhen = parts.join(", ");
  if (whoWhen && attribution.source) return `${whoWhen} — ${attribution.source}`;
  return whoWhen || attribution.source || "";
}

export function MisconceptionCallout({
  title = "Common trap",
  belief,
  confront,
  resolve,
  attribution,
  children,
  visual,
}: MisconceptionCalloutProps) {
  const attributionText = attribution ? formatAttribution(attribution) : "";
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
          {attributionText && (
            <p className="misconception-callout__attribution">{attributionText}</p>
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
