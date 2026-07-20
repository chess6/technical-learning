import { Suspense } from "react";
import type { SolutionReveal as SolutionRevealData } from "../../lessons/types";
import { getSolutionVisual } from "./solutionVisuals/registry";
import { ProseWithMath } from "./ProseWithMath";
import "./SolutionReveal.css";

type SolutionRevealProps = {
  reveal: SolutionRevealData;
  /** Extra props forwarded to the registered visual (e.g. exampleId). */
  visualProps?: Record<string, unknown>;
  compact?: boolean;
};

/**
 * Side-by-side prose + solution visualization for practice / checkpoint reveals.
 * Need not be cinematic — a static diagram is enough for routine items.
 */
export function SolutionReveal({
  reveal,
  visualProps,
  compact = false,
}: SolutionRevealProps) {
  const Visual = reveal.solutionVisualId
    ? getSolutionVisual(reveal.solutionVisualId)
    : null;

  return (
    <div
      className="solution-reveal"
      data-compact={compact}
      data-testid="solution-reveal"
    >
      <div className="solution-reveal__prose">
        <p className="solution-reveal__main">
          <ProseWithMath text={reveal.prose} />
        </p>
        {reveal.derivation && (
          <p className="solution-reveal__meta">
            <span className="solution-reveal__label">Derivation.</span>{" "}
            <ProseWithMath text={reveal.derivation} />
          </p>
        )}
        {reveal.interpretation && (
          <p className="solution-reveal__meta">
            <span className="solution-reveal__label">Interpretation.</span>{" "}
            <ProseWithMath text={reveal.interpretation} />
          </p>
        )}
        {reveal.connection && (
          <p className="solution-reveal__meta">
            <span className="solution-reveal__label">Connection.</span>{" "}
            <ProseWithMath text={reveal.connection} />
          </p>
        )}
      </div>
      {Visual && (
        <div className="solution-reveal__visual">
          <Suspense fallback={<p className="solution-reveal__loading">Loading diagram…</p>}>
            <Visual {...(visualProps ?? {})} height={compact ? 200 : 240} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
