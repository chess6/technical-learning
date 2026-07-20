import "./LessonLoading.css";

/**
 * Reserves the lesson page's approximate footprint while its lazy chunk
 * (lesson content + guided-scene engine) loads, so navigating from the home
 * page never produces a blank flash or a large layout shift.
 */
export function LessonLoading() {
  return (
    <div className="lesson-loading" role="status" aria-live="polite">
      <span className="lesson-loading__title" aria-hidden="true" />
      <span className="lesson-loading__canvas" aria-hidden="true" />
      <span className="lesson-loading__text">Loading lesson…</span>
    </div>
  );
}
