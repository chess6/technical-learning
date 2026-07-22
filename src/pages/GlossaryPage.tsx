import { Link } from "react-router-dom";
import { GlossaryTermCard } from "../components/glossary/GlossaryTermCard";
import { ProseWithMath } from "../components/lesson/ProseWithMath";
import {
  GLOSSARY_NOTATION_GUIDANCE,
  GLOSSARY_TERMS,
} from "../lessons/glossary";
import "./GlossaryPage.css";

/**
 * Course glossary (prototype). A cross-lesson reference and re-entry surface
 * (INTERACTIVE_TEXTBOOK_VISION §14): every term is a scannable card that links
 * back to the lesson that introduces it and across to its neighbors in the
 * concept graph. The glossary references lessons by id; it never restates them.
 */
export function GlossaryPage() {
  return (
    <div className="glossary-page">
      <header className="glossary-page__hero">
        <p className="glossary-page__eyebrow">
          <Link to="/" className="glossary-page__home-link">
            Linear Algebra
          </Link>
        </p>
        <h1 className="glossary-page__title">Glossary</h1>
        <p className="glossary-page__lede">
          The course's shared vocabulary. Each term names its object precisely,
          gives the one-line intuition, records the notation, and links to the
          lesson that introduces it and to its neighbors in the concept graph.
        </p>
        <aside
          className="glossary-page__notation"
          aria-label="How to read notation"
        >
          <h2 className="glossary-page__notation-title">
            Object vs. representation
          </h2>
          <p className="glossary-page__notation-body">
            <ProseWithMath text={GLOSSARY_NOTATION_GUIDANCE} />
          </p>
        </aside>
      </header>

      <nav className="glossary-page__toc" aria-label="Jump to a term">
        <ul className="glossary-page__toc-list">
          {GLOSSARY_TERMS.map((term) => (
            <li key={term.id}>
              <a className="glossary-page__toc-link" href={`#${term.id}`}>
                {term.term}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="glossary-page__terms">
        {GLOSSARY_TERMS.map((term) => (
          <GlossaryTermCard key={term.id} term={term} />
        ))}
      </div>
    </div>
  );
}
