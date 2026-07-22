import React from "react";
import "./LessonTableOfContents.css";

export type LessonTocItem = { id: string; label: string };

export function LessonTableOfContents({ items }: { items: readonly LessonTocItem[] }) {
  if (!items || items.length === 0) return null;

  const prefersReducedMotion = typeof window !== "undefined" && "matchMedia" in window
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (typeof document === "undefined") return;
    const el = document.getElementById(id);
    if (!el) return; // fall back to native anchor behavior
    event.preventDefault();
    const behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";
    el.scrollIntoView({ behavior, block: "start" });
    // move focus without another jump
    el.setAttribute("tabindex", "-1");
    (el as HTMLElement).focus({ preventScroll: true });
    // reflect the hash so deep-linking still works
    if (typeof history !== "undefined" && typeof history.replaceState === "function") {
      history.replaceState(null, "", `#${id}`);
    }
  };

  return (
    <nav className="lesson-toc" aria-label="On this page">
      <p className="lesson-toc__title">On this page</p>
      <ol className="lesson-toc__list">
        {items.map((item) => (
          <li key={item.id}>
            <a
              className="lesson-toc__link"
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

