import "./ExplorerLoading.css";

/**
 * Reserves the interactive-exploration footprint while its lazy chunk (Mafs +
 * the explorer module) loads, so it never causes layout shift once ready.
 */
export function ExplorerLoading() {
  return (
    <div className="explorer-loading" role="status" aria-live="polite">
      <span className="explorer-loading__canvas" aria-hidden="true" />
      <span className="explorer-loading__text">Loading exploration…</span>
    </div>
  );
}
