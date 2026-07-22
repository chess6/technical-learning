import { Link } from "react-router-dom";
import type { GlossaryTerm } from "../../lessons/glossary";
import { getGlossaryTerm } from "../../lessons/glossary";
import { getLessonById } from "../../lessons/registry";
import { ProseWithMath } from "../lesson/ProseWithMath";
import "./GlossaryTermCard.css";

type GlossaryTermCardProps = {
  term: GlossaryTerm;
  /** Heading level for the term name; defaults to an <h2>. */
  headingLevel?: 2 | 3;
};

/** Render a list of term-id references as in-page anchor links. */
function TermRefs({ ids, label }: { ids: string[]; label: string }) {
  const resolved = ids
    .map((id) => getGlossaryTerm(id))
    .filter((t): t is GlossaryTerm => t !== undefined);
  if (resolved.length === 0) return null;
  return (
    <div className="glossary-card__refs">
      <span className="glossary-card__refs-label">{label}</span>
      <ul className="glossary-card__refs-list">
        {resolved.map((t) => (
          <li key={t.id}>
            <a className="glossary-card__chip" href={`#${t.id}`}>
              {t.term}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A single glossary term rendered as a self-contained reference card. Reused by
 * the glossary page and available as a lightweight in-prose "definition card"
 * affordance (prototype).
 */
export function GlossaryTermCard({
  term,
  headingLevel = 2,
}: GlossaryTermCardProps) {
  const Heading = headingLevel === 3 ? "h3" : "h2";
  const lesson = term.firstLessonIntroduced
    ? getLessonById(term.firstLessonIntroduced)
    : undefined;

  return (
    <article className="glossary-card" id={term.id} aria-labelledby={`${term.id}-name`}>
      <header className="glossary-card__head">
        <Heading className="glossary-card__name" id={`${term.id}-name`}>
          {term.term}
        </Heading>
        {term.notation && (
          <span className="glossary-card__notation">
            <ProseWithMath text={term.notation} />
          </span>
        )}
      </header>

      <p className="glossary-card__intuition">
        <ProseWithMath text={term.intuition} />
      </p>

      <dl className="glossary-card__body">
        <dt className="glossary-card__label">Definition</dt>
        <dd className="glossary-card__def">
          <ProseWithMath text={term.definition} />
        </dd>

        {term.notationNote && (
          <>
            <dt className="glossary-card__label">Reading the notation</dt>
            <dd className="glossary-card__note">
              <ProseWithMath text={term.notationNote} />
            </dd>
          </>
        )}

        {term.examples && term.examples.length > 0 && (
          <>
            <dt className="glossary-card__label">Examples</dt>
            <dd>
              <ul className="glossary-card__examples">
                {term.examples.map((ex) => (
                  <li key={ex}>
                    <ProseWithMath text={ex} />
                  </li>
                ))}
              </ul>
            </dd>
          </>
        )}

        {term.nonExamples && term.nonExamples.length > 0 && (
          <>
            <dt className="glossary-card__label">Not examples</dt>
            <dd>
              <ul className="glossary-card__examples glossary-card__examples--non">
                {term.nonExamples.map((ex) => (
                  <li key={ex}>
                    <ProseWithMath text={ex} />
                  </li>
                ))}
              </ul>
            </dd>
          </>
        )}
      </dl>

      <footer className="glossary-card__foot">
        {term.prerequisites && term.prerequisites.length > 0 && (
          <TermRefs ids={term.prerequisites} label="Build on" />
        )}
        {term.relatedTerms && term.relatedTerms.length > 0 && (
          <TermRefs ids={term.relatedTerms} label="Related" />
        )}
        {lesson && (
          <div className="glossary-card__refs">
            <span className="glossary-card__refs-label">Introduced in</span>
            <Link className="glossary-card__lesson-link" to={`/lesson/${lesson.id}`}>
              {lesson.title}
            </Link>
          </div>
        )}
      </footer>
    </article>
  );
}
