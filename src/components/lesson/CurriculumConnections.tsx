import { Link } from "react-router-dom";
import { edgesTo, edgesFrom } from "../../curriculum/edges";
import { lessonLabel } from "../../curriculum/labels";
import "./CurriculumConnections.css";

type Row = { id: string; label: ReturnType<typeof lessonLabel> };

function resolvedRows(ids: readonly string[]): Row[] {
  return ids
    .map((id) => ({ id, label: lessonLabel(id) }))
    .filter((row): row is { id: string; label: NonNullable<Row["label"]> } => row.label !== undefined);
}

function ConnectionList({ label, rows }: { label: string; rows: Row[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="curriculum-connections__group">
      <span className="curriculum-connections__label">{label}</span>
      <ul className="curriculum-connections__list">
        {rows.map(({ id, label: entry }) => (
          <li key={id}>
            {entry!.href ? (
              <Link className="curriculum-connections__chip" to={entry!.href}>
                {entry!.title}
              </Link>
            ) : (
              <span className="curriculum-connections__chip curriculum-connections__chip--unbuilt">
                {entry!.title}
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
  const buildsOn = resolvedRows(edgesTo(lessonId, "requires").map((e) => e.from));
  const recommendedBefore = resolvedRows(
    edgesTo(lessonId, "recommended-before").map((e) => e.from),
  );
  const alsoSee = resolvedRows([
    ...edgesFrom(lessonId, "same-structure-as").map((e) => e.to),
    ...edgesTo(lessonId, "same-structure-as").map((e) => e.from),
  ]);
  const refreshers = resolvedRows(edgesTo(lessonId, "refresher-for").map((e) => e.from));

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
              {label!.href ? <Link to={label!.href}>{label!.title}</Link> : label!.title}
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
