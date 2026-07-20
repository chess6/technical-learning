/**
 * Restrained, per-lesson mathematical preview motif for the home page.
 *
 * Plain inline SVG (no icon library, no illustration asset) so the home page
 * stays cheap to load. Each motif echoes the lesson's guided-scene idea using
 * the same semantic-role colors as the canvases, not a generic decorative icon.
 */
export function LessonPreviewIcon({ lessonId }: { lessonId: string }) {
  switch (lessonId) {
    case "vectors":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" className="lesson-preview-icon">
          <line x1="24" y1="24" x2="40" y2="10" className="lesson-preview-icon__original" />
          <line x1="24" y1="24" x2="14" y2="8" className="lesson-preview-icon__basis-2" />
          <line x1="24" y1="24" x2="30" y2="4" className="lesson-preview-icon__result" strokeDasharray="3 3" />
        </svg>
      );
    case "transformations":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" className="lesson-preview-icon">
          <path
            d="M8 8 L40 8 L46 32 L14 32 Z"
            className="lesson-preview-icon__grid-shape"
          />
          <path d="M8 8 L8 32 M8 8 L14 32" className="lesson-preview-icon__basis-1" />
        </svg>
      );
    case "determinants":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" className="lesson-preview-icon">
          <rect x="10" y="10" width="18" height="18" className="lesson-preview-icon__grid-shape" />
          <path d="M26 10 L40 18 L38 34 L24 34 Z" className="lesson-preview-icon__result-fill" />
        </svg>
      );
    case "eigenvectors":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" className="lesson-preview-icon">
          <line x1="4" y1="24" x2="44" y2="24" className="lesson-preview-icon__basis-2" strokeDasharray="3 3" />
          <line x1="16" y1="34" x2="30" y2="16" className="lesson-preview-icon__original" />
          <line x1="12" y1="24" x2="36" y2="24" className="lesson-preview-icon__result" />
        </svg>
      );
    default:
      return null;
  }
}
