import { useMemo } from "react";
import {
  cancelContributions,
  type GenericCancellationReport,
  type SignedContribution,
} from "../math";
import "./TelescopingCancellation.css";

/**
 * The `telescoping-cancellation` visualization family — created here by
 * `fundamental-theorem` (spine L4), and built to be reused unchanged by
 * `greens-theorem`, `stokes-theorem`, and `divergence-theorem`, whose
 * "interior never mattered" argument runs over shared interior EDGES between
 * cells of a subdivided region rather than shared endpoints of an interval.
 *
 * **Parameterized over the cancelling pairs, not hard-coded to an interval**
 * (package ledger check P2): this component takes a flat list of
 * `SignedContribution`s, each tagged with an `id` shared by the ONE other
 * contribution it cancels against. It has no notion of "adjacent", "left",
 * "right", or "endpoint" — `cancelContributions` groups purely by id and sign.
 * `fundamental-theorem`'s own interval case is produced by
 * `intervalContributions` (in `src/math/calculus.ts`) as one caller among
 * others, not as an assumption baked into this component.
 */

const SURVIVOR_COLOR = "var(--role-selected, #ecd484)";
const CANCEL_COLOR = "var(--role-basis1, #7dba8a)";

export interface TelescopingCancellationProps {
  readonly contributions: readonly SignedContribution[];
  readonly title?: string;
  /** Show every individual term, struck through when it cancels. */
  readonly showTerms?: boolean;
}

/** Group contributions the same way `cancelContributions` does, for display. */
function groupById(
  contributions: readonly SignedContribution[],
): ReadonlyMap<string, readonly SignedContribution[]> {
  const byId = new Map<string, SignedContribution[]>();
  for (const c of contributions) {
    const list = byId.get(c.id);
    if (list) list.push(c);
    else byId.set(c.id, [c]);
  }
  return byId;
}

export function TelescopingCancellation({
  contributions,
  title = "Which contributions cancel",
  showTerms = true,
}: TelescopingCancellationProps) {
  const report: GenericCancellationReport = useMemo(
    () => cancelContributions(contributions),
    [contributions],
  );
  const groups = useMemo(() => groupById(contributions), [contributions]);
  const survivorIds = useMemo(
    () => new Set(report.survivors.map((s) => s.id)),
    [report],
  );

  return (
    <section className="telescoping-cancellation" aria-label={title}>
      <h4 className="telescoping-cancellation__title">{title}</h4>
      <p className="telescoping-cancellation__counter">
        <span>{report.termCount} contributions</span>
        <span>{report.cancellingCount} cancellations</span>
        <span>{report.survivors.length} survivors</span>
      </p>
      {showTerms && (
        <ul className="telescoping-cancellation__terms">
          {[...groups.entries()].map(([id, group]) => {
            const cancels = !survivorIds.has(id) && group.length === 2;
            return (
              <li
                key={id}
                className="telescoping-cancellation__term"
                data-cancels={cancels}
                style={{ color: cancels ? CANCEL_COLOR : SURVIVOR_COLOR }}
              >
                {group.map((c, i) => (
                  <span
                    key={i}
                    className={
                      cancels
                        ? "telescoping-cancellation__value telescoping-cancellation__value--struck"
                        : "telescoping-cancellation__value"
                    }
                  >
                    {c.sign > 0 ? "+" : "−"}
                    {c.label}
                  </span>
                ))}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
