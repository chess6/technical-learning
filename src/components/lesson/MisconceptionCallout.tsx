import type { ReactNode } from "react";
import type { CalloutMove } from "../../lessons/types";
import { ProseWithMath } from "./ProseWithMath";
import "./MisconceptionCallout.css";

/**
 * A callout, rendered as however many beats it authored.
 *
 * The component deliberately knows nothing about "belief", "confront" or
 * "resolve": it renders an ordered list of `moves`, each optionally announced
 * by a lead-in. That is what lets a one-line naming correction be one
 * paragraph while a historical belief-and-break is three — the shape is the
 * author's call per callout (`vision.md` §12.1), not the renderer's.
 *
 * `belief`/`confront`/`resolve` remain as shorthand for the three-act case and
 * are folded into `moves` below with their conventional lead-ins.
 * `attribution` names who/when/source when the callout is historical
 * (`vision.md` §0 principle 10; the design test is Karatsuba's
 * O(n²)-was-optimal belief).
 */
type MisconceptionCalloutProps = {
  title?: string;
  /** Explicit beats. Takes precedence over the belief/confront/resolve trio. */
  moves?: readonly CalloutMove[];
  belief?: string;
  confront?: string;
  resolve?: string;
  attribution?: { who?: string; when?: string; source?: string };
  /** Custom content when authored prose beats are not enough. */
  children?: ReactNode;
  visual?: ReactNode;
};

/**
 * Lead-ins for the three-act shorthand. These are good words for a genuine
 * predict-watch-repair confrontation and bad words for anything else — which
 * is why they are a fallback for one authored shape, not a house style.
 */
const TRIAD_LABELS = {
  belief: "Tempting belief.",
  confront: "But watch.",
  resolve: "Repair.",
} as const;

/** Slot name kept per move so existing per-role styling still applies. */
type RenderedMove = CalloutMove & { slot: string };

function resolveMoves(
  moves: readonly CalloutMove[] | undefined,
  belief?: string,
  confront?: string,
  resolve?: string,
): RenderedMove[] {
  if (moves && moves.length > 0) {
    return moves.map((move, index) => ({ ...move, slot: `move-${index + 1}` }));
  }
  const triad: RenderedMove[] = [];
  if (belief) triad.push({ slot: "belief", label: TRIAD_LABELS.belief, body: belief });
  if (confront) triad.push({ slot: "confront", label: TRIAD_LABELS.confront, body: confront });
  if (resolve) triad.push({ slot: "resolve", label: TRIAD_LABELS.resolve, body: resolve });
  return triad;
}

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
  moves,
  belief,
  confront,
  resolve,
  attribution,
  children,
  visual,
}: MisconceptionCalloutProps) {
  const attributionText = attribution ? formatAttribution(attribution) : "";
  const renderedMoves = resolveMoves(moves, belief, confront, resolve);
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
          {renderedMoves.map((move, index) => (
            <p
              key={`${move.slot}-${index}`}
              className={`misconception-callout__${move.slot}`}
            >
              {move.label && (
                <>
                  <span className="misconception-callout__label">{move.label}</span>{" "}
                </>
              )}
              <ProseWithMath text={move.body} />
            </p>
          ))}
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
