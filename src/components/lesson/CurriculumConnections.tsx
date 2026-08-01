import { Link } from "react-router-dom";
import { edgesTo, edgesFrom, lesson, type LessonRef } from "../../curriculum/edges";
import { lessonLabel, type LessonLabel } from "../../curriculum/labels";
import "./CurriculumConnections.css";

type Row = { id: string; label: LessonLabel };

/** Drop refs with no authored title rather than inventing one — see labels.ts. */
function resolvedRows(refs: readonly LessonRef[]): Row[] {
  return refs.flatMap((ref) => {
    const label = lessonLabel(ref.id);
    return label ? [{ id: ref.id, label }] : [];
  });
}

function ConnectionList({ label, rows }: { label: string; rows: Row[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="curriculum-connections__group">
      <span className="curriculum-connections__label">{label}</span>
      <ul className="curriculum-connections__list">
        {rows.map(({ id, label: entry }) => (
          <li key={id}>
            {entry.href ? (
              <Link className="curriculum-connections__chip" to={entry.href}>
                {entry.title}
              </Link>
            ) : (
              <span className="curriculum-connections__chip curriculum-connections__chip--unbuilt">
                {entry.title}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Structural cross-lesson navigation, derived entirely from
 * `src/curriculum/edges.ts` — never authored per lesson. Renders nothing for
 * a lesson with no resolvable connections, which is the common case for
 * un-scheduled Applied Mathematics lessons today; the panel grows as content
 * ships, with no code change (`docs/engineering/decisions/005-curriculum-graph-as-data.md`).
 *
 * An edge endpoint only renders once it has an authored title (`lessonLabel`,
 * `src/curriculum/labels.ts`) — an id is never turned into a label by
 * guessing, matching `FutureLessonRef`'s existing convention.
 */
export function CurriculumConnections({ lessonId }: { lessonId: string }) {
  const self = lesson(lessonId);
  const buildsOn = resolvedRows(edgesTo(self, "requires").map((e) => e.from));
  const recommendedBefore = resolvedRows(
    edgesTo(self, "recommended-before").map((e) => e.from),
  );
  const alsoSee = resolvedRows([
    ...edgesFrom(self, "same-structure-as").map((e) => e.to),
    ...edgesTo(self, "same-structure-as").map((e) => e.from),
  ]);
  const refreshers = resolvedRows(edgesTo(self, "refresher-for").map((e) => e.from));

  const hasAny =
    buildsOn.length > 0 ||
    recommendedBefore.length > 0 ||
    alsoSee.length > 0 ||
    refreshers.length > 0;
  if (!hasAny) return null;

  return (
    <section className="curriculum-connections" aria-label="Curriculum connections">
      {refreshers.length > 0 && (
        <p className="curriculum-connections__refresher">
          New here? A quick refresher first:{" "}
          {refreshers.map(({ id, label }, index) => (
            <span key={id}>
              {index > 0 && ", "}
              {label.href ? <Link to={label.href}>{label.title}</Link> : label.title}
            </span>
          ))}
        </p>
      )}
      <ConnectionList label="Builds on" rows={buildsOn} />
      <ConnectionList label="You'll get more from this first" rows={recommendedBefore} />
      <ConnectionList label="Also see" rows={alsoSee} />
    </section>
  );
}
