import { Link } from "react-router-dom";
import type { StructuredSummary } from "../../lessons/types";
import { ProseWithMath } from "./ProseWithMath";
import "./LessonSummary.css";

type LessonSummaryProps = {
  takeaway: string;
  objectives: string[];
  /**
   * Optional structured compression fields. When present, they render as a
   * scannable labeled summary; when absent, the component falls back to the
   * legacy takeaway blockquote + objectives disclosure.
   */
  structured?: StructuredSummary;
};

/** Normalize a `string | string[]` field to an array, dropping empties. */
function toItems(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return (Array.isArray(value) ? value : [value]).filter((v) => v.trim().length > 0);
}

type FieldRowProps = {
  label: string;
  value: string | string[] | undefined;
};

/** One labeled row of the structured summary; renders nothing when empty. */
function FieldRow({ label, value }: FieldRowProps) {
  const items = toItems(value);
  if (items.length === 0) return null;
  return (
    <div className="lesson-summary__row">
      <dt className="lesson-summary__label">{label}</dt>
      {items.length === 1 ? (
        <dd className="lesson-summary__value">
          <ProseWithMath text={items[0]!} />
        </dd>
      ) : (
        <dd className="lesson-summary__value">
          <ul className="lesson-summary__list">
            {items.map((item) => (
              <li key={item}>
                <ProseWithMath text={item} />
              </li>
            ))}
          </ul>
        </dd>
      )}
    </div>
  );
}

export function LessonSummary({
  takeaway,
  objectives,
  structured,
}: LessonSummaryProps) {
  const hero = structured?.coreMentalModel ?? takeaway;
  const hasStructured =
    structured !== undefined &&
    (structured.coreMentalModel !== undefined ||
      structured.definitionsIntroduced !== undefined ||
      structured.mainResult !== undefined ||
      structured.representationsConnected !== undefined ||
      structured.commonMistake !== undefined ||
      structured.canonicalExample !== undefined ||
      structured.oneProblemWorthRemembering !== undefined ||
      structured.whatThisUnlocksNext !== undefined);

  return (
    <div className="lesson-summary">
      {hero && (
        <blockquote className="lesson-summary__takeaway">
          <span className="lesson-summary__mark" aria-hidden="true" />
          {structured?.coreMentalModel && (
            <span className="lesson-summary__hero-label">The mental model</span>
          )}
          <ProseWithMath text={hero} />
        </blockquote>
      )}

      {hasStructured && (
        <>
          {/* Highest-value compression, kept in view. */}
          <dl className="lesson-summary__fields">
            <FieldRow label="The result" value={structured!.mainResult} />
            <FieldRow label="Watch out for" value={structured!.commonMistake} />
          </dl>

          {/* Progressive disclosure: reference detail one click away. */}
          <details className="lesson-summary__more">
            <summary>More to remember</summary>
            <dl className="lesson-summary__fields lesson-summary__fields--nested">
              <FieldRow
                label="Definitions introduced"
                value={structured!.definitionsIntroduced}
              />
              <FieldRow
                label="Representations connected"
                value={structured!.representationsConnected}
              />
              <FieldRow
                label="Canonical example"
                value={structured!.canonicalExample}
              />
              <FieldRow
                label="One problem worth remembering"
                value={structured!.oneProblemWorthRemembering}
              />
              <FieldRow
                label="What this unlocks next"
                value={structured!.whatThisUnlocksNext}
              />
            </dl>
          </details>
        </>
      )}

      {objectives.length > 0 && (
        <details className="lesson-summary__objectives">
          <summary>What this lesson set out to do</summary>
          <ul>
            {objectives.map((objective) => (
              <li key={objective}>
                <ProseWithMath text={objective} />
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="lesson-summary__reentry">
        <Link to="/glossary" className="lesson-summary__glossary-link">
          Browse the glossary
        </Link>{" "}
        to revisit any term in this course.
      </p>
    </div>
  );
}
