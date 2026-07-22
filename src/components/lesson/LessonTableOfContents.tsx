import React from "react";
import type { LessonTocItem } from "../../lessons/toc";
import "./LessonTableOfContents.css";

export type { LessonTocItem };

function scrollToAnchor(
  event: React.MouseEvent<HTMLAnchorElement>,
  id: string,
  prefersReducedMotion: boolean,
) {
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
}

function TocList({
  items,
  prefersReducedMotion,
  nested = false,
}: {
  items: readonly LessonTocItem[];
  prefersReducedMotion: boolean;
  nested?: boolean;
}) {
  return (
    <ol
      className={
        nested ? "lesson-toc__list lesson-toc__list--nested" : "lesson-toc__list"
      }
    >
      {items.map((item) => (
        <li key={item.id}>
          <a
            className="lesson-toc__link"
            href={`#${item.id}`}
            onClick={(e) => scrollToAnchor(e, item.id, prefersReducedMotion)}
          >
            {item.label}
          </a>
          {item.children && item.children.length > 0 ? (
            <TocList
              items={item.children}
              prefersReducedMotion={prefersReducedMotion}
              nested
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function LessonTableOfContents({
  items,
}: {
  items: readonly LessonTocItem[];
}) {
  if (!items || items.length === 0) return null;

  const prefersReducedMotion =
    typeof window !== "undefined" && "matchMedia" in window
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  return (
    <nav className="lesson-toc" aria-label="On this page">
      <p className="lesson-toc__title">On this page</p>
      <TocList items={items} prefersReducedMotion={prefersReducedMotion} />
    </nav>
  );
}
